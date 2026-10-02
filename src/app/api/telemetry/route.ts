import { NextRequest, NextResponse } from "next/server";
import { withRateLimit } from "@/lib/rateLimitMiddleware";
import { createAdminSupabaseClient } from "@/lib/supabase";
import { validMetric } from "@/lib/mobile-metrics";
export const POST = withRateLimit(async (request: NextRequest) => {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin)
    return new NextResponse(null, { status: 403 });
  try {
    const reader = request.body?.getReader();
    if (!reader) return new NextResponse(null, { status: 400 });
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 4096) {
        await reader.cancel();
        return new NextResponse(null, { status: 413 });
      }
      chunks.push(value);
    }
    const buffer = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      buffer.set(chunk, offset);
      offset += chunk.byteLength;
    }
    const text = new TextDecoder().decode(buffer);
    const body = JSON.parse(text);
    if (
      !Array.isArray(body.metrics) ||
      body.metrics.length < 1 ||
      body.metrics.length > 10 ||
      !body.metrics.every(validMetric)
    )
      return new NextResponse(null, { status: 400 });
    const { error } = await createAdminSupabaseClient()
      .from("mobile_telemetry")
      .insert(body.metrics);
    return new NextResponse(null, { status: error ? 503 : 204 });
  } catch {
    return new NextResponse(null, { status: 400 });
  }
});
