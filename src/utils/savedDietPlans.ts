import type { DietPlanRow } from "./database";

export interface SavedDietPlanSummary {
    id: string;
    title: string;
    targetCalories: number;
    dietType: string;
    mealsPerDay: number;
    allergies: string;
    macros: unknown;
    createdAt: string;
}

export interface SavedDietPlan extends SavedDietPlanSummary {
    meals: unknown;
}

export function serializeDietPlanRow(row: DietPlanRow): SavedDietPlan {
    return {
        id: row.id,
        title: row.title,
        targetCalories: row.target_calories,
        dietType: row.diet_type,
        mealsPerDay: row.meals_per_day,
        allergies: row.allergies,
        macros: JSON.parse(row.macros_json),
        meals: JSON.parse(row.meals_json),
        createdAt: row.created_at,
    };
}

export function serializeDietPlanSummary(row: DietPlanRow): SavedDietPlanSummary {
    const plan = serializeDietPlanRow(row);
    return {
        id: plan.id,
        title: plan.title,
        targetCalories: plan.targetCalories,
        dietType: plan.dietType,
        mealsPerDay: plan.mealsPerDay,
        allergies: plan.allergies,
        macros: plan.macros,
        createdAt: plan.createdAt,
    };
}
