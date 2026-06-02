import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../../utils/auth";
import { corsOptionsResponse, withCors } from "../../../../utils/cors";
import { getDb, type DietPlanRow } from "../../../../utils/database";
import { serializeDietPlanRow } from "../../../../utils/savedDietPlans";

export const runtime = "nodejs";

interface RouteContext {
    params: Promise<{ id: string }>;
}

export function OPTIONS() {
    return corsOptionsResponse();
}

export async function GET(request: NextRequest, context: RouteContext) {
    const user = getCurrentUser(request);
    if (!user) {
        return withCors(NextResponse.json({ error: "Giriş yapmanız gerekmektedir." }, { status: 401 }));
    }

    const { id } = await context.params;
    const row = getDb()
        .prepare(`
            SELECT id, user_id, title, target_calories, diet_type, meals_per_day,
                allergies, macros_json, meals_json, created_at
            FROM diet_plans
            WHERE id = ? AND user_id = ?
        `)
        .get(id, user.id) as unknown as DietPlanRow | undefined;

    if (!row) {
        return withCors(NextResponse.json({ error: "Diyet planı bulunamadı." }, { status: 404 }));
    }

    return withCors(NextResponse.json({ plan: serializeDietPlanRow(row) }, { status: 200 }));
}

export async function DELETE(request: NextRequest, context: RouteContext) {
    const user = getCurrentUser(request);
    if (!user) {
        return withCors(NextResponse.json({ error: "Giriş yapmanız gerekmektedir." }, { status: 401 }));
    }

    const { id } = await context.params;
    const result = getDb()
        .prepare("DELETE FROM diet_plans WHERE id = ? AND user_id = ?")
        .run(id, user.id);

    if (result.changes === 0) {
        return withCors(NextResponse.json({ error: "Diyet planı bulunamadı." }, { status: 404 }));
    }

    return withCors(NextResponse.json({ ok: true }, { status: 200 }));
}
