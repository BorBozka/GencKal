import assert from "node:assert/strict";
import { test } from "node:test";

import {
    AllergenViolationError,
    findAllergenViolation,
    parseAllergens,
    retryRecoverableGeneration,
} from "./allergenValidation.ts";

test("detects gluten violations while allowing gluten-free wording", () => {
    const allergens = parseAllergens("Gluten");

    assert.equal(findAllergenViolation("2 dilim glutenli ekmek", allergens), "gluten");
    assert.equal(findAllergenViolation("2 dilim glutensiz ekmek", allergens), undefined);
});

test("matches exact allergen words without matching unrelated substrings", () => {
    const allergens = parseAllergens("fıstık");

    assert.equal(findAllergenViolation("Ara öğün: fıstık", allergens), "fistik");
    assert.equal(findAllergenViolation("Ara öğün: fıstık, badem", allergens), "fistik");
    assert.equal(findAllergenViolation("Ara öğün: fıstıksız bar", allergens), undefined);
    assert.equal(findAllergenViolation("Ara öğün: fistikli bar", allergens), "fistik");
    assert.equal(findAllergenViolation("Ara öğün: prefistik aroması", allergens), undefined);
});

test("matches compact multi-word allergens after Turkish normalization", () => {
    const allergens = parseAllergens("süt ürünü");

    assert.equal(findAllergenViolation("Laktoz içeren süt ürünü", allergens), "sut urunu");
    assert.equal(findAllergenViolation("Laktoz içeren sütürünü", allergens), "sut urunu");
    assert.equal(findAllergenViolation("Laktoz içeren SÜTÜRÜNÜ", allergens), "sut urunu");
    assert.equal(findAllergenViolation("Laktoz içeren suturunu", allergens), "sut urunu");
    assert.equal(findAllergenViolation("Laktoz içeren sütürünüsüz alternatif", allergens), undefined);
});

test("retries once with a stricter instruction after a gluten allergen violation", async () => {
    const prompts = [];
    const result = await retryRecoverableGeneration({
        maxAttempts: 2,
        runAttempt: async (retryInstruction) => {
            prompts.push(retryInstruction);
            if (prompts.length === 1) {
                throw new AllergenViolationError("gluten");
            }
            return "pirinç lapası";
        },
        getFinalError: () => new Error("failed"),
    });

    assert.equal(result, "pirinç lapası");
    assert.equal(prompts[0], "");
    assert.match(prompts[1], /gluten/);
    assert.match(prompts[1], /kesinlikle kullanma/);
});
