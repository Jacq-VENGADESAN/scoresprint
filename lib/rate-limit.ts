import { createHash } from "node:crypto";
import { supabaseAdminRest } from "@/lib/supabase-admin";

type RateLimitRow = {
  allowed: boolean;
  request_count: number;
  retry_after_seconds: number;
};

function requestAddress(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip")?.trim() || "unknown";
}

function keyHash(request: Request, scope: string, subject?: string) {
  const salt = process.env.RATE_LIMIT_SALT?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(-24) || "aptileo-rate-limit";
  const normalizedSubject = subject?.trim().toLowerCase() || "anonymous";
  return createHash("sha256")
    .update(`${salt}|${scope}|${requestAddress(request)}|${normalizedSubject}`)
    .digest("hex");
}

export async function consumeRateLimit(
  request: Request,
  input: { scope: string; limit: number; windowSeconds: number; subject?: string }
) {
  try {
    const rows = await supabaseAdminRest<RateLimitRow[]>("rpc/consume_api_rate_limit", {
      method: "POST",
      body: JSON.stringify({
        p_scope: input.scope,
        p_key_hash: keyHash(request, input.scope, input.subject),
        p_limit: input.limit,
        p_window_seconds: input.windowSeconds
      })
    });
    return rows[0] ?? { allowed: true, request_count: 0, retry_after_seconds: input.windowSeconds };
  } catch (error) {
    console.error("Rate limit check unavailable", error);
    return { allowed: true, request_count: 0, retry_after_seconds: input.windowSeconds };
  }
}
