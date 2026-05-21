import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType, Schema, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { generatedPlanSchema } from "../../../types";
import { checkRateLimit, getClientRateLimitKey } from "../../../utils/rateLimiter";
import { normalizeParsedDietPlan } from "../../../utils/dietPlanParsing";

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

function normalizeText(value: string): string {
    return value
        .toLocaleLowerCase("tr-TR")
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/ı/g, "i");
}

function parseAllergens(allergies?: string): string[] {
    if (!allergies) return [];

    return allergies
        .split(/[,;\n]/)
        .map((allergen) => normalizeText(allergen.trim()))
        .filter((allergen) => allergen.length >= 2);
}

function assertNoAllergenViolations(plan: unknown, allergens: string[]): void {
    if (allergens.length === 0) return;

    const parsedPlan = generatedPlanSchema.parse(plan);
    for (const meal of parsedPlan.meals) {
        for (const item of meal.items) {
            const foodText = normalizeText(`${item.name} ${item.fullText}`);
            const matchedAllergen = allergens.find((allergen) => foodText.includes(allergen));
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

        // 120 saniyelik timeout koruması
        const generatePromise = model.generateContent(userPrompt);
        const timeoutPromise = new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error("API isteği zaman aşımına uğradı. Lütfen tekrar deneyin.")), 120000)
        );
        
        const result = await Promise.race([generatePromise, timeoutPromise]);
        const rawText = result.response.text();

        // JSON Temizleme ve Parse
        let cleanedJSON = rawText.trim();
        cleanedJSON = cleanedJSON.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
        cleanedJSON = cleanedJSON.replace(/,\s*([\]}])/g, "$1");

        try {
            const parsed = normalizeParsedDietPlan(JSON.parse(cleanedJSON));

            // Zod ile Runtime Type Checking
            const validatedResult = generatedPlanSchema.safeParse(parsed);
            if (!validatedResult.success) {
                console.error("Zod Şema İhlali:", validatedResult.error);
                throw new Error("AI yanıtı beklenen yapıya uymuyor.");
            }
            assertMealCount(validatedResult.data, mealsPerDay);
            assertNoAllergenViolations(validatedResult.data, allergenList);

            return NextResponse.json(validatedResult.data, { status: 200 });

        } catch (parseError) {
            console.error("Saf AI Çıktısı (Parse Edilemeyen):", cleanedJSON);
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
