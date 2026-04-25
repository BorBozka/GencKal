import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType, Schema, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { generatedPlanSchema } from "../../../types";

// --- Rate Limiter (Basit Bellek İçi) ---
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const userLimit = rateLimitMap.get(ip);
    if (!userLimit || now > userLimit.resetTime) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 }); // 1 dakika
        return true;
    }
    if (userLimit.count >= 5) return false; // Max 5 istek / dakika
    userLimit.count += 1;
    return true;
}

// --- Tip Tanımları ---
interface GenerateDietRequestBody {
    targetCalories: number;
    dietType: string;
    mealsPerDay: number;
    allergies?: string;
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

    if (typeof targetCalories !== "number") throw new Error("targetCalories sayı olmalıdır.");
    if (typeof dietType !== "string") throw new Error("dietType boş olamaz.");
    if (typeof mealsPerDay !== "number") throw new Error("mealsPerDay sayı olmalıdır.");

    return {
        targetCalories,
        dietType: dietType.trim(),
        mealsPerDay,
        allergies: typeof allergies === "string" ? allergies.trim() : undefined,
    };
}

export async function POST(request: NextRequest) {
    try {
        const ip = request.headers.get("x-forwarded-for") || "anonymous";
        if (!checkRateLimit(ip)) {
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

        const allergyNote = allergies
            ? `Kullanıcının alerjileri/intoleransları: ${allergies}. Bu besinleri kesinlikle kullanma.`
            : "Kullanıcının bilinen bir alerjisi yok.";

        const systemPrompt = `Sen profesyonel bir diyetisyensin. Sana verilen parametrelere göre günlük bir beslenme planı oluşturacaksın.

KRİTİK KURALLAR:
1. Her öğün için en az 2, en fazla 4 yiyecek önerisi yap.
2. 'fullText' alanı KISA olmalı: sadece miktar ve isim yaz (örn: "2 adet haşlanmış yumurta", "150g ızgara tavuk göğsü"). Açıklama EKLEME.
3. 'name' alanı en fazla 3 kelime olmalı.
4. Her yiyecek maddesinin 'macros' alanında o yiyeceğe ait protein, fat ve carb değerlerini gram cinsinden gerçekçi şekilde hesapla.
5. Üst düzey 'macros' alanı, tüm yiyeceklerin makro değerlerinin toplamına eşit olmalı.
6. Değerleri hesaplarken gerçekçi ve tutarlı ol.`;

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
                maxOutputTokens: 8192,
                responseMimeType: "application/json",
                responseSchema: dietSchema as Schema,
            }
        });

        // 30 saniyelik timeout koruması
        const generatePromise = model.generateContent(userPrompt);
        const timeoutPromise = new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error("API isteği zaman aşımına uğradı. (30s)")), 30000)
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
            const validatedResult = generatedPlanSchema.safeParse(parsed);
            if (!validatedResult.success) {
                console.error("Zod Şema İhlali:", validatedResult.error);
                throw new Error("AI yanıtı beklenen yapıya uymuyor.");
            }

            return NextResponse.json(validatedResult.data, { status: 200 });

        } catch (parseError) {
            console.error("Saf AI Çıktısı (Parse Edilemeyen):", cleanedJSON.substring(0, 500));
            console.error("Parse Hatası:", parseError);
            throw new Error("Yapay zeka geçerli bir veri üretemedi. Lütfen tekrar deneyin.");
        }
    } catch (err) {
        console.error("Backend İşlem Hatası:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu." },
            { status: 400 }
        );
    }
}