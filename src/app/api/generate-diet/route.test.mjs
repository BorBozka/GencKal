import assert from "node:assert/strict";
import { after, afterEach, before, mock, test } from "node:test";

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

afterEach(() => {
    mock.timers.reset();
});

function makeGenerateDietRequest(body, ip) {
    return new Request("http://localhost/api/generate-diet", {
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

function mockGeminiTimeout(prompts = []) {
    GoogleGenerativeAI.prototype.getGenerativeModel = () => ({
        generateContent: (prompt) => {
            prompts.push(prompt);
            return new Promise(() => {});
        },
    });
}

async function flushPromises() {
    for (let index = 0; index < 5; index += 1) {
        await Promise.resolve();
    }
}

function validPlan(overrides = {}) {
    return JSON.stringify({
        macros: { protein: 999, fat: 999, carb: 999 },
        meals: [
            {
                title: "Kahvalti",
                items: [
                    {
                        name: overrides.firstName ?? "Yumurta",
                        cal: 1,
                        fullText: overrides.firstText ?? "2 adet yumurta",
                        macros: { protein: 12, fat: 10, carb: 1 },
                    },
                    {
                        name: "Yulaf",
                        cal: 1,
                        fullText: "40g yulaf",
                        macros: { protein: 5, fat: 3, carb: 24 },
                    },
                ],
            },
            {
                title: "Aksam",
                items: [
                    {
                        name: "Tavuk",
                        cal: 1,
                        fullText: "150g tavuk",
                        macros: { protein: 35, fat: 4, carb: 0 },
                    },
                    {
                        name: "Pirinç",
                        cal: 1,
                        fullText: "120g pirinç",
                        macros: { protein: 4, fat: 1, carb: 35 },
                    },
                ],
            },
        ],
    });
}

test("retries generate-diet when the first AI plan violates allergens and returns a normalized plan", async () => {
    const prompts = [];
    mockGeminiResponses([
        validPlan({ firstName: "Süt", firstText: "1 bardak süt" }),
        validPlan(),
    ], prompts);

    const response = await POST(makeGenerateDietRequest({
        targetCalories: 2000,
        dietType: "standart",
        mealsPerDay: 2,
        allergies: "süt",
    }, "generate-allergen-retry"));

    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(prompts.length, 2);
    assert.match(prompts[1], /alerjenini içerdi/);
    assert.deepEqual(body.macros, { protein: 56, fat: 18, carb: 60 });
    assert.equal(body.meals[0].items[0].cal, 142);
});

test("returns the malformed AI JSON error after generate-diet retries are exhausted", async () => {
    mockGeminiResponses(["{ malformed", "{ still malformed"]);

    const response = await POST(makeGenerateDietRequest({
        targetCalories: 2000,
        dietType: "standart",
        mealsPerDay: 2,
    }, "generate-malformed-json"));

    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.error, "Yapay zeka geçerli bir veri üretemedi. Lütfen tekrar deneyin.");
});

test("returns 429 when generate-diet rate limit is exceeded", async () => {
    const prompts = [];
    mockGeminiResponses([
        validPlan(),
        validPlan(),
        validPlan(),
        validPlan(),
        validPlan(),
    ], prompts);

    const body = {
        targetCalories: 2000,
        dietType: "standart",
        mealsPerDay: 2,
    };

    for (let index = 0; index < 5; index += 1) {
        const response = await POST(makeGenerateDietRequest(body, "generate-rate-limit"));
        assert.equal(response.status, 200);
    }

    const response = await POST(makeGenerateDietRequest(body, "generate-rate-limit"));
    const responseBody = await response.json();

    assert.equal(response.status, 429);
    assert.equal(responseBody.error, "Çok fazla istek gönderdiniz. Lütfen 1 dakika bekleyin.");
    assert.equal(prompts.length, 5);
});

test("returns an error when generate-diet requests time out", async () => {
    mock.timers.enable({ apis: ["setTimeout"] });
    const prompts = [];
    mockGeminiTimeout(prompts);

    const responsePromise = POST(makeGenerateDietRequest({
        targetCalories: 2000,
        dietType: "standart",
        mealsPerDay: 2,
    }, "generate-timeout"));

    await flushPromises();
    mock.timers.tick(60000);
    await flushPromises();
    mock.timers.tick(60000);
    await flushPromises();

    const response = await responsePromise;
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.error, "Yapay zeka geçerli bir veri üretemedi. Lütfen tekrar deneyin.");
    assert.equal(prompts.length, 2);
});
