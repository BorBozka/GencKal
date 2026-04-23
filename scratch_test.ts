import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import * as fs from "fs";

// Read .env.local manually
const envFile = fs.readFileSync(".env.local", "utf-8");
let apiKey = "";
for (const line of envFile.split("\n")) {
    if (line.startsWith("GEMINI_API_KEY=")) {
        apiKey = line.split("=")[1].trim();
        break;
    }
}

if (!apiKey) {
    console.error("No API key");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

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

async function test() {
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
            responseMimeType: "application/json",
            maxOutputTokens: 4096,
        }
    });

    const systemPrompt = `Sen profesyonel bir diyetisyensin. Sana verilen parametrelere göre günlük bir beslenme planı oluştur. Sadece JSON dön. Miktarları (örn: 2 adet, 150g) fullText içine Türkçe yaz.`;
    const userPrompt = `
- Hedef Kalori: 2000 kcal
- Diyet Tipi: standart
- Öğün Sayısı: 3
- Kullanıcının bilinen bir alerjisi yok.`;

    try {
        const result = await model.generateContent([systemPrompt, userPrompt]);
        const rawText = result.response.text();
        console.log("Raw text length:", rawText.length);
        console.log("Raw text content:");
        console.log(rawText);
        
        const parsed = JSON.parse(rawText);
        console.log("Parsed OK");
    } catch (err) {
        console.error("Error:", err);
    }
}

test();
