export function normalizeAllergenText(value: string): string {
    return value
        .toLocaleLowerCase("tr-TR")
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/ı/g, "i");
}

export function parseAllergens(allergies?: string): string[] {
    if (!allergies) return [];

    return allergies
        .split(/[,;\n]/)
        .map((allergen) => normalizeAllergenText(allergen.trim()))
        .filter((allergen) => allergen.length >= 2);
}

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasNegativeSuffix(fullText: string, matchEndIndex: number): boolean {
    const suffix = fullText.slice(matchEndIndex, matchEndIndex + 3);
    return /^(siz|sız|suz|süz)$/.test(suffix);
}

export function findAllergenViolation(text: string, allergens: string[]): string | undefined {
    const normalizedText = normalizeAllergenText(text);

    return allergens.find((allergen) => {
        const normalizedAllergen = normalizeAllergenText(allergen);
        const pattern = new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRegExp(normalizedAllergen)}(?=$|[^\\p{L}\\p{N}])`, "u");
        const phraseMatch = pattern.exec(normalizedText);
        if (phraseMatch) return true;

        const compactAllergen = normalizedAllergen.replace(/\s+/g, "");
        if (compactAllergen !== normalizedAllergen) return false;

        const compactPattern = new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRegExp(compactAllergen)}`, "u");
        const compactMatch = compactPattern.exec(normalizedText);
        if (!compactMatch) return false;

        const matchStart = compactMatch.index + compactMatch[1].length;
        const matchEnd = matchStart + compactAllergen.length;
        return !hasNegativeSuffix(normalizedText, matchEnd);
    });
}
