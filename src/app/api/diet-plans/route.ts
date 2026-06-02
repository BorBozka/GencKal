import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "../../../utils/auth";
import { corsOptionsResponse, withCors } from "../../../utils/cors";
import { getDb, type DietPlanRow } from "../../../utils/database";
import { serializeDietPlanSummary } from "../../../utils/savedDietPlans";
import { generatedPlanSchema } from "../../../types";

export const runtime = "nodejs";

const createDietPlanSchema = generatedPlanSchema.extend({
    title: z.string().trim().min(1).max(120).optional(),
    targetCalories: z.number().finite().int().min(800).max(6000),
    dietType: z.enum(["standart", "karnivor", "vejetaryen", "vegan", "keto"]),
    mealsPerDay: z.number().finite().int().min(2).max(5),
    allergies: z.string().trim().max(500).optional(),
});

function getDefaultTitle(targetCalories: number, dietType: string): string {
    return `${targetCalories} kcal ${dietType} plan`;
}

export function OPTIONS() {
    return corsOptionsResponse();
}

export async function GET(request: NextRequest) {
    const user = getCurrentUser(request);
    if (!user) {
        return withCors(NextResponse.json({ error: "Giriş yapmanız gerekmektedir." }, { status: 401 }));
    }

    const rows = getDb()
        .prepare(`
            SELECT id, user_id, title, target_calories, diet_type, meals_per_day,
                allergies, macros_json, meals_json, created_at
            FROM diet_plans
            WHERE user_id = ?
            ORDER BY created_at DESC
        `)
        .all(user.id) as unknown as DietPlanRow[];

    return withCors(NextResponse.json({ plans: rows.map(serializeDietPlanSummary) }, { status: 200 }));
}

export async function POST(request: NextRequest) {
    const user = getCurrentUser(request);
    if (!user) {
        return withCors(NextResponse.json({ error: "Plan kaydetmek için giriş yapmanız gerekmektedir." }, { status: 401 }));
    }

    try {
        const body = createDietPlanSchema.parse(await request.json());
        const id = randomUUID();
        const now = new Date().toISOString();
        const title = body.title || getDefaultTitle(body.targetCalories, body.dietType);

        getDb().prepare(`
            INSERT INTO diet_plans (
                id, user_id, title, target_calories, diet_type, meals_per_day,
                allergies, macros_json, meals_json, created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            id,
            user.id,
            title,
            body.targetCalories,
            body.dietType,
            body.mealsPerDay,
            body.allergies || "",
            JSON.stringify(body.macros),
            JSON.stringify(body.meals),
            now
        );

        return withCors(NextResponse.json({ id }, { status: 201 }));
    } catch (error) {
        const message = error instanceof z.ZodError
            ? error.issues[0]?.message || "Diyet planı verisi geçersiz."
            : error instanceof Error
                ? error.message
                : "Diyet planı kaydedilemedi.";

        return withCors(NextResponse.json({ error: message }, { status: 400 }));
    }
}
