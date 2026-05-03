import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType, Schema, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { z } from "zod";

// --- Rate Limiter (Basit Bellek İçi) ---
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const userLimit = rateLimitMap.get(ip);
    if (!userLimit || now > userLimit.resetTime) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 });
        return true;
    }
    if (userLimit.count >= 10) return false; // Max 10 swap / dakika
    userLimit.count += 1;
    return true;
}

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
    name: z.string(),
    cal: z.number(),
    fullText: z.string(),
    macros: z.object({
        protein: z.number(),
        fat: z.number(),
        carb: z.number(),
    }),
});

function validateBody(body: unknown): SwapFoodRequestBody {
    if (!body || typeof body !== "object") throw new Error("Geçersiz istek gövdesi.");
    const { currentFood, mealTitle, dietType, allergies } = body as Record<string, unknown>;

    if (!currentFood || typeof currentFood !== "object") throw new Error("currentFood gerekli.");
    const food = currentFood as Record<string, unknown>;
    if (typeof food.name !== "string") throw new Error("currentFood.name gerekli.");
    if (typeof food.cal !== "number") throw new Error("currentFood.cal sayı olmalıdır.");

    if (typeof mealTitle !== "string") throw new Error("mealTitle gerekli.");
    if (typeof dietType !== "string") throw new Error("dietType gerekli.");

    return {
        currentFood: currentFood as SwapFoodRequestBody["currentFood"],
        mealTitle: mealTitle.trim(),
        dietType: dietType.trim(),
        allergies: typeof allergies === "string" ? allergies.trim() : undefined,
    };
}

export async function POST(request: NextRequest) {
    try {
        const ip = request.headers.get("x-forwarded-for") || "anonymous";
        if (!checkRateLimit(ip)) {
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

        // 30 saniyelik timeout (tek besin için yeterli)
        const generatePromise = model.generateContent(userPrompt);
        const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("API isteği zaman aşımına uğradı. Lütfen tekrar deneyin.")), 30000)
        );

        const result = await Promise.race([generatePromise, timeoutPromise]);
        const rawText = result.response.text();

        // JSON Temizleme ve Parse
        let cleanedJSON = rawText.trim();
        cleanedJSON = cleanedJSON.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
        cleanedJSON = cleanedJSON.replace(/,\s*([\]}])/g, "$1");

        try {
            const parsed = JSON.parse(cleanedJSON);

            // Zod ile Runtime Type Checking
            const validatedResult = swapFoodResponseSchema.safeParse(parsed);
            if (!validatedResult.success) {
                console.error("Swap Zod Şema İhlali:", validatedResult.error);
                throw new Error("AI yanıtı beklenen yapıya uymuyor.");
            }

            return NextResponse.json(validatedResult.data, { status: 200 });
        } catch (parseError) {
            console.error("Swap AI Çıktısı (Parse Edilemeyen):", cleanedJSON.substring(0, 500));
            console.error("Parse Hatası:", parseError);
            throw new Error("Yapay zeka geçerli bir veri üretemedi. Lütfen tekrar deneyin.");
        }
    } catch (err) {
        console.error("Swap Backend Hatası:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu." },
            { status: 400 }
        );
    }
}
