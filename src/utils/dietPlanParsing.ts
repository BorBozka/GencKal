import type { MacroDistribution } from "../types";

export interface ParsedMealItem {
    name: string;
    cal: number;
    fullText: string;
    macros: MacroDistribution;
}

export interface ParsedMeal {
    title: string;
    items: ParsedMealItem[];
}

export interface ParsedDietPlan {
    macros: MacroDistribution;
    meals: ParsedMeal[];
}

function asFiniteNonNegativeNumber(value: unknown): number | null {
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return null;
    return value;
}

function normalizeMacros(value: unknown): MacroDistribution | null {
    if (!value || typeof value !== "object") return null;
    const record = value as Record<string, unknown>;
    const protein = asFiniteNonNegativeNumber(record.protein);
    const fat = asFiniteNonNegativeNumber(record.fat);
    const carb = asFiniteNonNegativeNumber(record.carb);

    if (protein === null || fat === null || carb === null) return null;
    return {
        protein,
        fat,
        carb,
    };
}

export function calculateCaloriesFromMacros(macros: MacroDistribution): number {
    return Math.round((macros.protein * 4) + (macros.carb * 4) + (macros.fat * 9));
}

export function normalizeParsedMealItem(item: unknown): unknown {
    if (!item || typeof item !== "object") return item;

    const record = item as Record<string, unknown>;
    const macros = normalizeMacros(record.macros);
    if (!macros) return item;

    return {
        ...record,
        macros,
        cal: calculateCaloriesFromMacros(macros),
    };
}

export function normalizeParsedDietPlan(plan: unknown): unknown {
    if (!plan || typeof plan !== "object") return plan;

    const record = plan as Record<string, unknown>;
    if (!Array.isArray(record.meals)) return plan;

    const totals: MacroDistribution = { protein: 0, fat: 0, carb: 0 };
    const meals = record.meals.map((meal) => {
        if (!meal || typeof meal !== "object") return meal;

        const mealRecord = meal as Record<string, unknown>;
        if (!Array.isArray(mealRecord.items)) return meal;

        const items = mealRecord.items.map((item) => {
            const normalizedItem = normalizeParsedMealItem(item);
            if (normalizedItem && typeof normalizedItem === "object") {
                const macros = (normalizedItem as Record<string, unknown>).macros;
                const normalizedMacros = normalizeMacros(macros);
                if (normalizedMacros) {
                    totals.protein += normalizedMacros.protein;
                    totals.fat += normalizedMacros.fat;
                    totals.carb += normalizedMacros.carb;
                }
            }
            return normalizedItem;
        });

        return {
            ...mealRecord,
            items,
        };
    });

    return {
        ...record,
        meals,
        macros: {
            protein: Math.round(totals.protein * 10) / 10,
            fat: Math.round(totals.fat * 10) / 10,
            carb: Math.round(totals.carb * 10) / 10,
        },
    };
}
