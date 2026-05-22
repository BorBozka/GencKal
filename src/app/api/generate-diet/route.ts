import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType, Schema, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { generatedPlanSchema } from "../../../types";
import { checkRateLimit, getClientRateLimitKey } from "../../../utils/rateLimiter";
import { normalizeParsedDietPlan } from "../../../utils/dietPlanParsing";
import { findAllergenViolation, parseAllergens } from "../../../utils/allergenValidation";

// --- Tip Tanımları ---
interface GenerateDietRequestBody {
    targetCalories: number;
    dietType: "standart" | "karnivor" | "vejetaryen" | "vegan" | "keto";
    mealsPerDay: number;
    allergies?: string;
}

const allowedDietTypes = new Set<GenerateDietRequestBody["dietType"]>([
    "standart",
    "karnivor",
    "vejetaryen",
    "vegan",
    "keto",
]);

const maxGenerationAttempts = 2;
const maxGenerationMs = 60000;

function cleanJsonResponse(rawText: string): string {
    return rawText
        .trim()
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .replace(/,\s*([\]}])/g, "$1");
}

function getFinishReason(result: unknown): string | undefined {
    if (!result || typeof result !== "object") return undefined;
    const response = (result as { response?: { candidates?: Array<{ finishReason?: string }> } }).response;
    return response?.candidates?.[0]?.finishReason;
}

function assertNoAllergenViolations(plan: unknown, allergens: string[]): void {
    if (allergens.length === 0) return;

    const parsedPlan = generatedPlanSchema.parse(plan);
    for (const meal of parsedPlan.meals) {
        for (const item of meal.items) {
            const matchedAllergen = findAllergenViolation(`${item.name} ${item.fullText}`, allergens);
            if (matchedAllergen) {
                throw new Error(`AI yanıtı alerjen kuralını ihlal etti: ${matchedAllergen}.`);
            }
        }
    }
}

function assertMealCount(plan: unknown, mealsPerDay: number): void {
    const parsedPlan = generatedPlanSchema.parse(plan);
    if (parsedPlan.meals.length !== mealsPerDay) {
        throw new Error(`AI yanıtı ${mealsPerDay} öğün yerine ${parsedPlan.meals.length} öğün üretti.`);
    }
}

// Gemini Native Schema
const dietSchema: Schema = {
    type: SchemaType.OBJECT,
    properties: {
        macros: {
            type: SchemaType.OBJECT,
            properties: {
                protein: { type: SchemaType.NUMBER },
                fat: { type: SchemaType.NUMBER },
                carb: { type: SchemaType.NUMBER },
            },
            required: ["protein", "fat", "carb"],
        },
        meals: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    title: { type: SchemaType.STRING },
                    items: {
                        type: SchemaType.ARRAY,
                        items: {
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
                                    required: ["protein", "fat", "carb"]
                                }
                            },
                            required: ["name", "cal", "fullText", "macros"]
                        }
                    }
                },
                required: ["title", "items"]
            }
        }
    },
    required: ["macros", "meals"],
};

function validateBody(body: unknown): GenerateDietRequestBody {
    if (!body || typeof body !== "object") throw new Error("Geçersiz istek gövdesi.");
    const { targetCalories, dietType, mealsPerDay, allergies } = body as Record<string, unknown>;

    if (typeof targetCalories !== "number" || !Number.isFinite(targetCalories) || targetCalories < 800 || targetCalories > 6000) {
        throw new Error("targetCalories 800-6000 arasında geçerli bir sayı olmalıdır.");
    }
    if (typeof dietType !== "string" || !allowedDietTypes.has(dietType as GenerateDietRequestBody["dietType"])) {
        throw new Error("dietType geçerli bir diyet tipi olmalıdır.");
    }
    if (typeof mealsPerDay !== "number" || !Number.isInteger(mealsPerDay) || mealsPerDay < 2 || mealsPerDay > 5) {
        throw new Error("mealsPerDay 2-5 arasında bir tam sayı olmalıdır.");
    }

    return {
        targetCalories,
        dietType: dietType as GenerateDietRequestBody["dietType"],
        mealsPerDay,
        allergies: typeof allergies === "string" ? allergies.trim().slice(0, 500) : undefined,
    };
}

export async function POST(request: NextRequest) {
    try {
        const ip = getClientRateLimitKey(request.headers);
        const rateLimit = await checkRateLimit(ip, 5); // 5 request limit
        if (!rateLimit.success) {
            return NextResponse.json({ error: "Çok fazla istek gönderdiniz. Lütfen 1 dakika bekleyin." }, { status: 429 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY tanımlı değil.");
        }
        const genAI = new GoogleGenerativeAI(apiKey);

        const rawBody = await request.json();
        const validatedBody = validateBody(rawBody);
        const { targetCalories, dietType, mealsPerDay, allergies } = validatedBody;
        const allergenList = parseAllergens(allergies);

        const allergyNote = allergies
            ? `Kullanıcının alerjileri/intoleransları: ${allergies}. Bu besinleri kesinlikle kullanma.`
            : "Kullanıcının bilinen bir alerjisi yok.";

        const systemPrompt = `Sen profesyonel bir diyetisyensin. Sana verilen parametrelere göre günlük bir beslenme planı oluşturacaksın.

KRİTİK KURALLAR:
1. Her öğün için tam 3 yiyecek önerisi yap. Sadece kalori hedefi için zorunluysa 2 veya 4 yiyeceğe çık.
2. 'fullText' alanı KISA olmalı: sadece miktar ve isim yaz (örn: "2 adet haşlanmış yumurta", "150g ızgara tavuk göğsü"). Açıklama EKLEME.
3. 'name' alanı en fazla 3 kelime olmalı.
4. Her yiyecek maddesinin 'macros' alanında o yiyeceğe ait protein, fat ve carb değerlerini gram cinsinden gerçekçi şekilde hesapla.
5. Üst düzey 'macros' alanı, tüm yiyeceklerin makro değerlerinin toplamına eşit olmalı.
6. Değerleri hesaplarken gerçekçi ve tutarlı ol.
7. JSON çıktısını kısa tut; sadece şemadaki alanları üret.`;

        const userPrompt = `
- Hedef Kalori: ${targetCalories} kcal
- Diyet Tipi: ${dietType}
- Öğün Sayısı: ${mealsPerDay}
- ${allergyNote}`;

        const safetySettings = [
            {
                category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            }
        ];

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: systemPrompt,
            safetySettings,
            generationConfig: {
                maxOutputTokens: 16384,
                responseMimeType: "application/json",
                responseSchema: dietSchema as Schema,
            }
        });

        let parsed: unknown;

        for (let attempt = 1; attempt <= maxGenerationAttempts; attempt += 1) {
            // Her deneme için timeout koruması
            const generatePromise = model.generateContent(userPrompt);
            const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error("API isteği zaman aşımına uğradı. Lütfen tekrar deneyin.")), maxGenerationMs)
            );

            const result = await Promise.race([generatePromise, timeoutPromise]);
            const finishReason = getFinishReason(result);
            const rawText = result.response.text();
            const cleanedJSON = cleanJsonResponse(rawText);

            try {
                parsed = normalizeParsedDietPlan(JSON.parse(cleanedJSON));
                break;
            } catch (parseError) {
                console.error(`Saf AI Çıktısı (Parse Edilemeyen, deneme ${attempt}/${maxGenerationAttempts}, bitiş: ${finishReason ?? "bilinmiyor"}):`, cleanedJSON);
                console.error("Parse Hatası:", parseError);
            }
        }

        if (parsed === undefined) {
            throw new Error("Yapay zeka geçerli bir veri üretemedi. Lütfen tekrar deneyin.");
        }

        // Zod ile Runtime Type Checking
        const validatedResult = generatedPlanSchema.safeParse(parsed);
        if (!validatedResult.success) {
            console.error("Zod Şema İhlali:", validatedResult.error);
            throw new Error("AI yanıtı beklenen yapıya uymuyor.");
        }
        assertMealCount(validatedResult.data, mealsPerDay);
        assertNoAllergenViolations(validatedResult.data, allergenList);

        return NextResponse.json(validatedResult.data, { status: 200 });
    } catch (err) {
        console.error("Backend İşlem Hatası:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu." },
            { status: 400 }
        );
    }
}
