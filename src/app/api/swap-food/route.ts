import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import type { Schema } from "@google/generative-ai";
import { z } from "zod";
import { checkRateLimit, getClientRateLimitKey } from "../../../utils/rateLimiter";
import { normalizeParsedMealItem } from "../../../utils/dietPlanParsing";
import { AllergenViolationError, findAllergenViolation, parseAllergens, retryRecoverableGeneration } from "../../../utils/allergenValidation";

// --- İstek Gövdesi Tipi ---
interface SwapFoodRequestBody {
    currentFood: {
        name: string;
        cal: number;
        fullText: string;
        macros: { protein: number; fat: number; carb: number };
    };
    mealTitle: string;
    dietType: string;
    allergies?: string;
}

const allowedDietTypes = new Set(["standart", "karnivor", "vejetaryen", "vegan", "keto"]);
const maxSwapAttempts = 2;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    let timeoutId: ReturnType<typeof setTimeout>;
    const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error("API isteği zaman aşımına uğradı. Lütfen tekrar deneyin.")), timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
}

function assertNoAllergenViolations(food: z.infer<typeof swapFoodResponseSchema>, allergens: string[]): void {
    if (allergens.length === 0) return;

    const matchedAllergen = findAllergenViolation(`${food.name} ${food.fullText}`, allergens);
    if (matchedAllergen) {
        throw new AllergenViolationError(matchedAllergen);
    }
}

function cleanJsonResponse(rawText: string): string {
    return rawText
        .trim()
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .replace(/,\s*([\]}])/g, "$1");
}

// --- Gemini Yanıt Şeması (Tek Besin) ---
const swapFoodSchema: Schema = {
    type: SchemaType.OBJECT,
    properties: {
        name: { type: SchemaType.STRING },
        cal: { type: SchemaType.NUMBER },
        fullText: { type: SchemaType.STRING },
        macros: {
            type: SchemaType.OBJECT,
            properties: {
                protein: { type: SchemaType.NUMBER },
                fat: { type: SchemaType.NUMBER },
                carb: { type: SchemaType.NUMBER },
            },
            required: ["protein", "fat", "carb"],
        },
    },
    required: ["name", "cal", "fullText", "macros"],
};

// --- Zod Doğrulama Şeması ---
const swapFoodResponseSchema = z.object({
    name: z.string().min(1),
    cal: z.number().finite().positive(),
    fullText: z.string().min(1),
    macros: z.object({
        protein: z.number().finite().nonnegative(),
        fat: z.number().finite().nonnegative(),
        carb: z.number().finite().nonnegative(),
    }),
});

function validateBody(body: unknown): SwapFoodRequestBody {
    if (!body || typeof body !== "object") throw new Error("Geçersiz istek gövdesi.");
    const { currentFood, mealTitle, dietType, allergies } = body as Record<string, unknown>;

    if (!currentFood || typeof currentFood !== "object") throw new Error("currentFood gerekli.");
    const food = currentFood as Record<string, unknown>;
    if (typeof food.name !== "string") throw new Error("currentFood.name gerekli.");
    if (typeof food.fullText !== "string") throw new Error("currentFood.fullText gerekli.");
    if (typeof food.cal !== "number" || !Number.isFinite(food.cal) || food.cal <= 0) throw new Error("currentFood.cal pozitif sayı olmalıdır.");
    if (!food.macros || typeof food.macros !== "object") throw new Error("currentFood.macros gerekli.");
    const macros = food.macros as Record<string, unknown>;
    if (
        typeof macros.protein !== "number" || !Number.isFinite(macros.protein) ||
        typeof macros.fat !== "number" || !Number.isFinite(macros.fat) ||
        typeof macros.carb !== "number" || !Number.isFinite(macros.carb)
    ) {
        throw new Error("currentFood.macros sayısal protein, fat ve carb değerleri içermelidir.");
    }

    if (typeof mealTitle !== "string") throw new Error("mealTitle gerekli.");
    if (typeof dietType !== "string" || !allowedDietTypes.has(dietType)) throw new Error("dietType geçerli bir diyet tipi olmalıdır.");

    return {
        currentFood: currentFood as SwapFoodRequestBody["currentFood"],
        mealTitle: mealTitle.trim(),
        dietType: dietType.trim(),
        allergies: typeof allergies === "string" ? allergies.trim().slice(0, 500) : undefined,
    };
}

export async function POST(request: NextRequest) {
    try {
        const ip = getClientRateLimitKey(request.headers);
        const rateLimit = await checkRateLimit(ip, 10); // 10 swap limit / min
        if (!rateLimit.success) {
            return NextResponse.json(
                { error: "Çok fazla istek gönderdiniz. Lütfen 1 dakika bekleyin." },
                { status: 429 }
            );
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY tanımlı değil.");
        }
        const genAI = new GoogleGenerativeAI(apiKey);

        const rawBody = await request.json();
        const { currentFood, mealTitle, dietType, allergies } = validateBody(rawBody);
        const allergenList = parseAllergens(allergies);

        const allergyNote = allergies
            ? `Kullanıcının alerjileri/intoleransları: ${allergies}. Bu besinleri kesinlikle kullanma.`
            : "Kullanıcının bilinen bir alerjisi yok.";

        const systemPrompt = `Sen profesyonel bir diyetisyensin. Sana verilen bir besin öğesinin yerine geçecek, benzer makro besin değerlerine ve kaloriye sahip FARKLI bir alternatif besin önerisi yapacaksın.

KRİTİK KURALLAR:
1. Önerdiğin besin, mevcut besinden TAMAMEN FARKLI bir yiyecek olmalı. Aynı yiyeceği önerme.
2. Kalori değeri mevcut besinin ±%15 aralığında olmalı.
3. Protein, yağ ve karbonhidrat değerleri mevcut besine mümkün olduğunca yakın olmalı.
4. 'fullText' alanı KISA olmalı: sadece miktar ve isim yaz (örn: "2 adet haşlanmış yumurta", "150g ızgara tavuk göğsü"). Açıklama EKLEME.
5. 'name' alanı en fazla 3 kelime olmalı.
6. Diyet tipine uygun olmalı.
7. Öğün türüne (kahvaltı, öğle, akşam vb.) uygun olmalı.`;

        const userPrompt = `Mevcut besin:
- İsim: ${currentFood.name}
- Açıklama: ${currentFood.fullText}
- Kalori: ${currentFood.cal} kcal
- Protein: ${currentFood.macros.protein}g, Yağ: ${currentFood.macros.fat}g, Karbonhidrat: ${currentFood.macros.carb}g

Öğün: ${mealTitle}
Diyet Tipi: ${dietType}
${allergyNote}

Bu besinin yerine geçecek, benzer makro/kalori değerlerine sahip FARKLI bir alternatif besin öner.`;

        const safetySettings = [
            {
                category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
        ];

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: systemPrompt,
            safetySettings,
            generationConfig: {
                maxOutputTokens: 8192,
                responseMimeType: "application/json",
                responseSchema: swapFoodSchema as Schema,
            },
        });

        return await retryRecoverableGeneration({
            maxAttempts: maxSwapAttempts,
            runAttempt: async (retryInstruction) => {
                // 30 saniyelik timeout (tek besin için yeterli)
                const attemptPrompt = retryInstruction ? `${userPrompt}\n\n${retryInstruction}` : userPrompt;
                const result = await withTimeout(model.generateContent(attemptPrompt), 30000);
                const cleanedJSON = cleanJsonResponse(result.response.text());
                const parsed = normalizeParsedMealItem(JSON.parse(cleanedJSON));
                const validatedResult = swapFoodResponseSchema.safeParse(parsed);
                if (!validatedResult.success) {
                    console.error("Swap Zod Şema İhlali:", validatedResult.error);
                    throw new Error("AI yanıtı beklenen yapıya uymuyor.");
                }
                assertNoAllergenViolations(validatedResult.data, allergenList);

                return NextResponse.json(validatedResult.data, { status: 200 });
            },
            onAttemptError: (generationError, attempt) => {
                console.error(`Swap AI Çıktısı doğrulanamadı (deneme ${attempt}/${maxSwapAttempts}):`, generationError);
            },
            getFinalError: (generationError) => generationError instanceof AllergenViolationError
                ? new Error("Yapay zeka alerjen kuralına uygun bir alternatif üretemedi. Lütfen tekrar deneyin.")
                : new Error("Yapay zeka geçerli bir veri üretemedi. Lütfen tekrar deneyin."),
        });
    } catch (err) {
        console.error("Swap Backend Hatası:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu." },
            { status: 400 }
        );
    }
}
