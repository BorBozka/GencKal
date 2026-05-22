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

export class AllergenViolationError extends Error {
    public readonly allergen: string;

    constructor(allergen: string) {
        super(`AI yanıtı alerjen kuralını ihlal etti: ${allergen}.`);
        this.allergen = allergen;
        this.name = "AllergenViolationError";
    }
}

export function buildAllergenRetryInstruction(error: AllergenViolationError): string {
    return `Önceki yanıt ${error.allergen} alerjenini içerdi. Yeni yanıtta bu alerjeni veya bu alerjeni içeren besinleri kesinlikle kullanma.`;
}

export async function retryRecoverableGeneration<T>({
    maxAttempts,
    runAttempt,
    onAttemptError,
    getFinalError,
}: {
    maxAttempts: number;
    runAttempt: (retryInstruction: string, attempt: number) => Promise<T>;
    onAttemptError?: (error: unknown, attempt: number) => void;
    getFinalError: (error: unknown) => Error;
}): Promise<T> {
    let lastError: unknown;
    let retryInstruction = "";

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
            return await runAttempt(retryInstruction, attempt);
        } catch (error) {
            lastError = error;
            onAttemptError?.(error, attempt);
            if (error instanceof AllergenViolationError) {
                retryInstruction = buildAllergenRetryInstruction(error);
            }
        }
    }

    throw getFinalError(lastError);
}

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasNegativeSuffix(fullText: string, matchEndIndex: number): boolean {
    const suffix = fullText.slice(matchEndIndex, matchEndIndex + 3);
    return /^(siz|sız|suz|süz)$/.test(suffix);
}

function hasFlexibleAllergenMatch(text: string, allergen: string): boolean {
    const allergenParts = allergen.split(/\s+/).filter(Boolean);
    if (allergenParts.length <= 1) return false;

    const flexibleAllergen = allergenParts.map(escapeRegExp).join("\\s*");
    const pattern = new RegExp(`(^|[^\\p{L}\\p{N}])${flexibleAllergen}`, "u");
    const match = pattern.exec(text);
    if (!match) return false;

    const matchedAllergen = match[0].slice(match[1].length);
    const matchEnd = match.index + match[1].length + matchedAllergen.length;
    return !hasNegativeSuffix(text, matchEnd);
}

export function findAllergenViolation(text: string, allergens: string[]): string | undefined {
    const normalizedText = normalizeAllergenText(text);

    return allergens.find((allergen) => {
        const normalizedAllergen = normalizeAllergenText(allergen);
        const pattern = new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRegExp(normalizedAllergen)}(?=$|[^\\p{L}\\p{N}])`, "u");
        const phraseMatch = pattern.exec(normalizedText);
        if (phraseMatch) return true;
        if (hasFlexibleAllergenMatch(normalizedText, normalizedAllergen)) return true;

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
