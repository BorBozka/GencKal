import crypto from "node:crypto";
import type { NextRequest } from "next/server";
import { getDb, type UserRow } from "./database";

export interface AuthUser {
    id: string;
    name: string;
    email: string;
}

interface AuthTokenPayload {
    sub: string;
    name: string;
    email: string;
    iat: number;
    exp: number;
}

const tokenTtlSeconds = 7 * 24 * 60 * 60;

function getJwtSecret(): string {
    const secret = process.env.GENCKAL_JWT_SECRET;
    if (secret) return secret;

    if (process.env.NODE_ENV !== "production") {
        return "genckal-local-development-secret";
    }

    throw new Error("GENCKAL_JWT_SECRET tanımlı değil.");
}

function base64UrlEncode(value: string | Buffer): string {
    return Buffer.from(value).toString("base64url");
}

function signToken(unsignedToken: string): string {
    return crypto
        .createHmac("sha256", getJwtSecret())
        .update(unsignedToken)
        .digest("base64url");
}

function safeJsonParse<T>(value: string): T | null {
    try {
        return JSON.parse(value) as T;
    } catch {
        return null;
    }
}

function toAuthUser(row: UserRow): AuthUser {
    return {
        id: row.id,
        name: row.name,
        email: row.email,
    };
}

export function hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString("base64url");
    const hash = crypto.scryptSync(password, salt, 64).toString("base64url");
    return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
    const [scheme, salt, expectedHash] = storedHash.split(":");
    if (scheme !== "scrypt" || !salt || !expectedHash) return false;

    const actual = Buffer.from(crypto.scryptSync(password, salt, 64).toString("base64url"));
    const expected = Buffer.from(expectedHash);
    return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

export function createAuthToken(user: AuthUser): string {
    const now = Math.floor(Date.now() / 1000);
    const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = base64UrlEncode(JSON.stringify({
        sub: user.id,
        name: user.name,
        email: user.email,
        iat: now,
        exp: now + tokenTtlSeconds,
    } satisfies AuthTokenPayload));
    const unsignedToken = `${header}.${payload}`;
    return `${unsignedToken}.${signToken(unsignedToken)}`;
}

export function verifyAuthToken(token: string): AuthTokenPayload | null {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;
    const unsignedToken = `${header}.${payload}`;
    const expectedSignature = signToken(unsignedToken);
    const actual = Buffer.from(signature);
    const expected = Buffer.from(expectedSignature);
    if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) {
        return null;
    }

    const parsedPayload = safeJsonParse<AuthTokenPayload>(Buffer.from(payload, "base64url").toString("utf8"));
    if (!parsedPayload || parsedPayload.exp < Math.floor(Date.now() / 1000)) {
        return null;
    }

    return parsedPayload;
}

export function getBearerToken(request: NextRequest): string | null {
    const authorization = request.headers.get("authorization");
    if (!authorization?.startsWith("Bearer ")) return null;
    return authorization.slice("Bearer ".length).trim();
}

export function getCurrentUser(request: NextRequest): AuthUser | null {
    const token = getBearerToken(request);
    if (!token) return null;

    const payload = verifyAuthToken(token);
    if (!payload) return null;

    const row = getDb()
        .prepare("SELECT id, name, email, password_hash, created_at FROM users WHERE id = ?")
        .get(payload.sub) as unknown as UserRow | undefined;

    return row ? toAuthUser(row) : null;
}

export function createAuthResponse(user: UserRow): { user: AuthUser; token: string } {
    const authUser = toAuthUser(user);
    return {
        user: authUser,
        token: createAuthToken(authUser),
    };
}
