require('dotenv').config({path: '.env.local'});
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function list() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("hello");
        console.log("SUCCESS:", result.response.text());
    } catch (e) {
        console.error("gemini-1.5-flash failed:", e.message);
    }
}
list();
