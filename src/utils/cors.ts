import { NextResponse } from "next/server";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function withCors(response: NextResponse): NextResponse {
    for (const [key, value] of Object.entries(corsHeaders)) {
        response.headers.set(key, value);
    }

    return response;
}

export function corsOptionsResponse(): NextResponse {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}
