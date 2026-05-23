import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import { GoogleGenerativeAI } from "@google/generative-ai";

import { POST } from "./route.ts";

const originalApiKey = process.env.GEMINI_API_KEY;
const originalGetGenerativeModel = GoogleGenerativeAI.prototype.getGenerativeModel;
const originalConsoleError = console.error;

before(() => {
    process.env.GEMINI_API_KEY = "test-key";
    console.error = () => {};
});

after(() => {
    if (originalApiKey === undefined) {
        delete process.env.GEMINI_API_KEY;
    } else {
        process.env.GEMINI_API_KEY = originalApiKey;
    }
    GoogleGenerativeAI.prototype.getGenerativeModel = originalGetGenerativeModel;
    console.error = originalConsoleError;
});

function makeSwapFoodRequest(body, ip) {
    return new Request("http://localhost/api/swap-food", {
        method: "POST",
        headers: {
            "content-type": "application/json",
            "x-forwarded-for": ip,
        },
        body: JSON.stringify(body),
    });
}

function mockGeminiResponses(rawResponses, prompts = []) {
    const responses = [...rawResponses];
    GoogleGenerativeAI.prototype.getGenerativeModel = () => ({
        generateContent: async (prompt) => {
            prompts.push(prompt);
            const text = responses.shift();
            if (text === undefined) throw new Error("Unexpected Gemini call");
            return {
                response: {
                    text: () => text,
                },
            };
        },
    });
}

function baseRequestBody(allergies) {
    return {
        currentFood: {
            name: "Tavuk",
            cal: 190,
            fullText: "150g tavuk",
            macros: { protein: 35, fat: 4, carb: 0 },
        },
        mealTitle: "Öğle",
        dietType: "standart",
        allergies,
    };
}

function validSwap(overrides = {}) {
    return JSON.stringify({
        name: overrides.name ?? "Hindi",
        cal: 1,
        fullText: overrides.fullText ?? "150g hindi",
        macros: overrides.macros ?? { protein: 34, fat: 3, carb: 0 },
    });
}

test("retries swap-food when the first AI alternative violates allergens and returns a normalized item", async () => {
    const prompts = [];
    mockGeminiResponses([
        validSwap({ name: "Sütlü Yoğurt", fullText: "200g sütlü yoğurt" }),
        validSwap(),
    ], prompts);

    const response = await POST(makeSwapFoodRequest(baseRequestBody("süt"), "swap-allergen-retry"));
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(prompts.length, 2);
    assert.match(prompts[1], /alerjenini içerdi/);
    assert.equal(body.name, "Hindi");
    assert.equal(body.cal, 163);
});

test("returns the malformed AI JSON error after swap-food retries are exhausted", async () => {
    mockGeminiResponses(["{ malformed", "{ still malformed"]);

    const response = await POST(makeSwapFoodRequest(baseRequestBody(), "swap-malformed-json"));
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.error, "Yapay zeka geçerli bir veri üretemedi. Lütfen tekrar deneyin.");
});
