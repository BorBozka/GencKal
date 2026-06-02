import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAuthResponse, hashPassword } from "../../../../utils/auth";
import { corsOptionsResponse, withCors } from "../../../../utils/cors";
import { getDb, type UserRow } from "../../../../utils/database";

export const runtime = "nodejs";

const signupSchema = z.object({
    name: z.string().trim().min(2, "Ad en az 2 karakter olmalıdır.").max(80),
    email: z.string().trim().email("Geçerli bir e-posta adresi girin.").max(120),
    password: z.string().min(6, "Şifre en az 6 karakter olmalıdır.").max(100),
});

export function OPTIONS() {
    return corsOptionsResponse();
}

export async function POST(request: NextRequest) {
    try {
        const body = signupSchema.parse(await request.json());
        const email = body.email.toLowerCase();
        const db = getDb();
        const existingUser = db
            .prepare("SELECT id FROM users WHERE email = ?")
            .get(email);

        if (existingUser) {
            return withCors(NextResponse.json({ error: "Bu e-posta adresi zaten kayıtlı." }, { status: 409 }));
        }

        const now = new Date().toISOString();
        const user: UserRow = {
            id: randomUUID(),
            name: body.name,
            email,
            password_hash: hashPassword(body.password.trim()),
            created_at: now,
        };

        db.prepare(`
            INSERT INTO users (id, name, email, password_hash, created_at)
            VALUES (?, ?, ?, ?, ?)
        `).run(user.id, user.name, user.email, user.password_hash, user.created_at);

        return withCors(NextResponse.json(createAuthResponse(user), { status: 201 }));
    } catch (error) {
        const message = error instanceof z.ZodError
            ? error.issues[0]?.message || "Kayıt bilgileri geçersiz."
            : error instanceof Error
                ? error.message
                : "Kayıt sırasında hata oluştu.";

        return withCors(NextResponse.json({ error: message }, { status: 400 }));
    }
}
