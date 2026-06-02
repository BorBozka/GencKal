import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../../utils/auth";
import { corsOptionsResponse, withCors } from "../../../../utils/cors";

export const runtime = "nodejs";

export function OPTIONS() {
    return corsOptionsResponse();
}

export async function GET(request: NextRequest) {
    const user = getCurrentUser(request);
    if (!user) {
        return withCors(NextResponse.json({ error: "Giriş yapmanız gerekmektedir." }, { status: 401 }));
    }

    return withCors(NextResponse.json({ user }, { status: 200 }));
}
