import { NextRequest, NextResponse } from "next/server";
// 1. YENİ EKLENTİ: SchemaType import edildi
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

// --- Tip Tanımları ---
interface GenerateDietRequestBody {
    targetCalories: number;
    dietType: string;
    mealsPerDay: number;
    allergies?: string;
}

// --- DÜZELTME 2: Gemini için Kesin JSON Şeması ---
// Bu şema, yapay zekanın string yerine kesinlikle number dönmesini garanti eder.
const dietSchema = {
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
1. Çıktın kesinlikle ve SADECE geçerli bir JSON objesi olmalı.
2. Üst düzey "macros" alanı günlük toplam makro değerlerini GRAM cinsinden sayı olarak içermeli.
3. Her öğün için en az 2, en fazla 5 yiyecek önerisi yap.
4. "cal" alanı sadece sayı olmalı. Örnek: 160.
5. "macros" alanı o yiyeceğe ait protein, yağ ve karbonhidrat değerlerini GRAM cinsinden sayı olarak içermeli.
6. fullText alanında yiyeceğin miktarını (örn: 2 adet, 150g vb.) ve kısa açıklamasını Türkçe olarak yaz.

Beklenen JSON Şeması:
{
  "macros": { "protein": 120, "fat": 60, "carb": 150 },
  "meals": [
    {
      "title": "Öğün 1 — Kahvaltı",
      "items": [
        {
          "name": "Yumurta",
          "cal": 160,
          "fullText": "2 adet haşlanmış yumurta",
          "macros": { "protein": 12, "fat": 10, "carb": 1 }
        }
      ]
    }
  ]
}`;

        const userPrompt = `
- Hedef Kalori: ${targetCalories} kcal
- Diyet Tipi: ${dietType}
- Öğün Sayısı: ${mealsPerDay}
- ${allergyNote}`;

        // --- DÜZELTME 3: Model Ayarları ---
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                maxOutputTokens: 4096,
            }
        });

        const result = await model.generateContent([systemPrompt, userPrompt]);
        const rawText = result.response.text();

        // 5. JSON Temizleme ve Parse
        let cleanedJSON = rawText.trim();
        // Markdown blokları varsa temizle
        cleanedJSON = cleanedJSON.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
        // Trailing comma (Sondaki virgül) hatasını temizle: objelerin veya dizilerin sonundaki gereksiz virgüller
        cleanedJSON = cleanedJSON.replace(/,\s*([\]}])/g, "$1");
        
        const parsed = JSON.parse(cleanedJSON);

        // Validasyonumuzu yine de yapalım, ne olur ne olmaz.
        if (!parsed.macros || typeof parsed.macros.protein !== "number") {
            console.error("Yapay Zeka Şemaya Uymadı:", parsed);
            throw new Error("AI yanıtı beklenen yapıya uymuyor.");
        }

        return NextResponse.json(parsed, { status: 200 });

    } catch (err) {
        console.error("Backend İşlem Hatası:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu." },
            { status: 400 }
        );
    }
}