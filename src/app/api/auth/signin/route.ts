import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAuthResponse, verifyPassword } from "../../../../utils/auth";
import { corsOptionsResponse, withCors } from "../../../../utils/cors";
import { getDb, type UserRow } from "../../../../utils/database";

export const runtime = "nodejs";

const signinSchema = z.object({
    email: z.string().trim().email("Geçerli bir e-posta adresi girin.").max(120),
    password: z.string().min(1, "Şifre gereklidir.").max(100),
});

export function OPTIONS() {
    return corsOptionsResponse();
}

export async function POST(request: NextRequest) {
    try {
        const body = signinSchema.parse(await request.json());
        const user = getDb()
            .prepare("SELECT id, name, email, password_hash, created_at FROM users WHERE email = ?")
            .get(body.email.toLowerCase()) as unknown as UserRow | undefined;

        const passwordMatches = user && (
            verifyPassword(body.password, user.password_hash) ||
            verifyPassword(body.password.trim(), user.password_hash)
        );

        if (!passwordMatches) {
            return withCors(NextResponse.json({ error: "E-posta veya şifre hatalı." }, { status: 401 }));
        }

        return withCors(NextResponse.json(createAuthResponse(user), { status: 200 }));
    } catch (error) {
        const message = error instanceof z.ZodError
            ? error.issues[0]?.message || "Giriş bilgileri geçersiz."
            : error instanceof Error
                ? error.message
                : "Giriş sırasında hata oluştu.";

        return withCors(NextResponse.json({ error: message }, { status: 400 }));
    }
}
