import assert from "node:assert/strict";
import { test } from "node:test";

import {
    calculateCaloriesFromMacros,
    normalizeParsedDietPlan,
    normalizeParsedMealItem,
} from "./dietPlanParsing.ts";

test("normalizes parsed diet plans to item macros and macro-derived calories", () => {
    const plan = normalizeParsedDietPlan({
        macros: { protein: 999, fat: 999, carb: 999 },
        meals: [
            {
                title: "Kahvalti",
                items: [
                    {
                        name: "Yumurta",
                        cal: 50,
                        fullText: "2 adet yumurta",
                        macros: { protein: 12.5, fat: 10, carb: 1 },
                    },
                    {
                        name: "Yulaf",
                        cal: 999,
                        fullText: "40g yulaf",
                        macros: { protein: 5, fat: 3, carb: 24 },
                    },
                ],
            },
        ],
    });

    assert.deepEqual(plan.macros, { protein: 17.5, fat: 13, carb: 25 });
    assert.equal(plan.meals[0].items[0].cal, calculateCaloriesFromMacros({ protein: 12.5, fat: 10, carb: 1 }));
    assert.equal(plan.meals[0].items[1].cal, calculateCaloriesFromMacros({ protein: 5, fat: 3, carb: 24 }));
});

test("normalizes parsed swap-food items with the same calorie rule", () => {
    const item = normalizeParsedMealItem({
        name: "Hindi",
        cal: 1,
        fullText: "120g hindi",
        macros: { protein: 29, fat: 2, carb: 0 },
    });

    assert.equal(item.cal, calculateCaloriesFromMacros({ protein: 29, fat: 2, carb: 0 }));
});

test("leaves invalid macro objects for zod to reject", () => {
    const item = normalizeParsedMealItem({
        name: "Eksik",
        cal: 200,
        fullText: "eksik makro",
        macros: { protein: 10, fat: 5 },
    });

    assert.deepEqual(item, {
        name: "Eksik",
        cal: 200,
        fullText: "eksik makro",
        macros: { protein: 10, fat: 5 },
    });
});

