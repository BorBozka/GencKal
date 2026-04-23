import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from "fs";

const envFile = fs.readFileSync(".env.local", "utf-8");
let apiKey = "";
for (const line of envFile.split("\n")) {
    if (line.startsWith("GEMINI_API_KEY=")) {
        apiKey = line.split("=")[1].trim();
        break;
    }
}

const genAI = new GoogleGenerativeAI(apiKey);

async function test() {
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
    });

    const systemPrompt = `Sen profesyonel bir diyetisyensin. Sana verilen parametrelere göre günlük bir beslenme planı oluşturacaksın.

KRİTİK KURALLAR:
1. Çıktın kesinlikle ve SADECE geçerli bir JSON objesi olmalı.
2. Üst düzey "macros" alanı günlük toplam makro değerlerini GRAM cinsinden sayı olarak içermeli.
3. Her öğün için en az 2, en fazla 5 yiyecek önerisi yap.
4. "cal" alanı sadece sayı olmalı. Örnek: 160.
5. "macros" alanı o yiyeceğe ait protein, yağ ve karbonhidrat değerlerini GRAM cinsinden sayı olarak içermeli.
6. fullText alanında yiyeceğin miktarını (örn: 2 adet, 150g vb.) ve kısa açıklamasını Türkçe olarak yaz.`;

    const userPrompt = `
- Hedef Kalori: 2000 kcal
- Diyet Tipi: standart
- Öğün Sayısı: 3
- Kullanıcının bilinen bir alerjisi yok.`;

    try {
        const result = await model.generateContent([systemPrompt, userPrompt]);
        const rawText = result.response.text();
        console.log("Raw text length:", rawText.length);
        console.log("Raw text content:\n", rawText);
    } catch (err) {
        console.error("Error:", err);
    }
}

test();
