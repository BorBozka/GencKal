import type { DietPlanRow } from "./database";
import { generatedPlanSchema, type DiyetTipi, type SavedDietPlan, type SavedDietPlanSummary } from "../types";

const allowedDietTypes = new Set<DiyetTipi>(["standart", "karnivor", "vejetaryen", "vegan", "keto"]);

function parseJsonField(value: string, fieldName: string): unknown {
    try {
        return JSON.parse(value);
    } catch {
        throw new Error(`Kayıtlı diyet planı ${fieldName} alanı geçersiz.`);
    }
}

function parseDietType(value: string): DiyetTipi {
    if (allowedDietTypes.has(value as DiyetTipi)) return value as DiyetTipi;
    throw new Error("Kayıtlı diyet planı diyet tipi geçersiz.");
}

function parseMacros(row: DietPlanRow): SavedDietPlanSummary["macros"] {
    const parsed = generatedPlanSchema.pick({ macros: true }).parse({
        macros: parseJsonField(row.macros_json, "makro"),
    });

    return parsed.macros;
}

function parseMeals(row: DietPlanRow): SavedDietPlan["meals"] {
    const parsed = generatedPlanSchema.pick({ meals: true }).parse({
        meals: parseJsonField(row.meals_json, "öğün"),
    });

    return parsed.meals;
}

export function serializeDietPlanRow(row: DietPlanRow): SavedDietPlan {
    return {
        id: row.id,
        title: row.title,
        targetCalories: row.target_calories,
        dietType: parseDietType(row.diet_type),
        mealsPerDay: row.meals_per_day,
        allergies: row.allergies,
        macros: parseMacros(row),
        meals: parseMeals(row),
        createdAt: row.created_at,
    };
}

export function serializeDietPlanSummary(row: DietPlanRow): SavedDietPlanSummary {
    return {
        id: row.id,
        title: row.title,
        targetCalories: row.target_calories,
        dietType: parseDietType(row.diet_type),
        mealsPerDay: row.meals_per_day,
        allergies: row.allergies,
        macros: parseMacros(row),
        createdAt: row.created_at,
    };
}

export function trySerializeDietPlanSummary(row: DietPlanRow): SavedDietPlanSummary | null {
    try {
        return serializeDietPlanSummary(row);
    } catch {
        return null;
    }
}
