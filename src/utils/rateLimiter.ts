// src/utils/rateLimiter.ts

// Basit bellek içi map (local development / fallback için)
const localRateLimitMap = new Map<string, { count: number; resetTime: number }>();

export interface RateLimitResult {
    success: boolean;
    remaining: number;
    reset: number;
}

type UpstashCommandResult = {
    result?: unknown;
    error?: string;
};

export function getClientRateLimitKey(headers: Headers): string {
    const forwardedFor = headers.get("x-forwarded-for");
    const firstForwardedIp = forwardedFor?.split(",")[0]?.trim();
    const realIp = headers.get("x-real-ip")?.trim();
    const candidate = firstForwardedIp || realIp || "anonymous";

    return candidate.replace(/[^a-zA-Z0-9:._-]/g, "").slice(0, 80) || "anonymous";
}

function getUpstashConfig(): { url: string; token: string } | null {
    const url = process.env.UPSTASH_REDIS_REST_URL?.replace(/\/$/, "");
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) return null;
    return { url, token };
}

async function runUpstashRateLimit(
    key: string,
    limit: number,
    windowMs: number
): Promise<RateLimitResult> {
    const config = getUpstashConfig();
    if (!config) throw new Error("Upstash yapılandırması bulunamadı.");

    const redisKey = `rate-limit:${key}`;
    const now = Date.now();
    const response = await fetch(`${config.url}/multi-exec`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${config.token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify([
            ["SET", redisKey, 0, "PX", windowMs, "NX"],
            ["INCR", redisKey],
            ["PTTL", redisKey],
        ]),
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error(`Upstash rate limit isteği başarısız oldu (${response.status}).`);
    }

    const data = await response.json() as UpstashCommandResult[] | UpstashCommandResult;
    if (!Array.isArray(data)) {
        throw new Error(data.error || "Upstash transaction yanıtı beklenen formatta değil.");
    }

    const error = data.find((item) => item.error)?.error;
    if (error) throw new Error(`Upstash rate limit komut hatası: ${error}`);

    const count = Number(data[1]?.result ?? 0);
    const ttl = Number(data[2]?.result ?? windowMs);
    const reset = now + (ttl > 0 ? ttl : windowMs);

    return {
        success: count <= limit,
        remaining: Math.max(0, limit - count),
        reset,
    };
}

function runLocalRateLimit(
    ip: string,
    limit: number,
    windowMs: number
): RateLimitResult {
    const now = Date.now();
    const userLimit = localRateLimitMap.get(ip);

    if (!userLimit || now > userLimit.resetTime) {
        localRateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
        return {
            success: true,
            remaining: limit - 1,
            reset: now + windowMs,
        };
    }

    if (userLimit.count >= limit) {
        return {
            success: false,
            remaining: 0,
            reset: userLimit.resetTime,
        };
    }

    userLimit.count += 1;
    return {
        success: true,
        remaining: limit - userLimit.count,
        reset: userLimit.resetTime,
    };
}

/**
 * Serverless uyumlu ve genişletilebilir Rate Limiter.
 * İleride tek bir satır değişikliği ile Upstash Redis entegrasyonuna geçirilebilir.
 */
export async function checkRateLimit(
    ip: string,
    limit: number = 5,
    windowMs: number = 60000
): Promise<RateLimitResult> {
    if (getUpstashConfig()) {
        try {
            return await runUpstashRateLimit(ip, limit, windowMs);
        } catch (error) {
            console.warn("Upstash rate limit hatası, bellek içi limiter'a geçiliyor:", error);
        }
    }

    return runLocalRateLimit(ip, limit, windowMs);
}
