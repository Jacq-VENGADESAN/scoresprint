import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { isProductEventName, safeEventPath, safeEventProperties } from "@/lib/product-analytics";
import { consumeRateLimit } from "@/lib/rate-limit";
import { supabaseAdminRest } from "@/lib/supabase-admin";
import { getCurrentUser } from "@/lib/supabase-server";

const VISITOR_COOKIE = "aptileo_beta_session";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    event?: unknown;
    path?: unknown;
    properties?: unknown;
  } | null;

  if (!body || !isProductEventName(body.event)) {
    return NextResponse.json({ error: "INVALID_EVENT" }, { status: 400 });
  }

  const existingVisitor = request.cookies.get(VISITOR_COOKIE)?.value;
  const visitorId = existingVisitor && existingVisitor.length >= 16 ? existingVisitor : randomUUID();
  const limit = await consumeRateLimit(request, {
    scope: "product_event",
    limit: 180,
    windowSeconds: 3600,
    subject: visitorId
  });
  if (!limit.allowed) return NextResponse.json({ ok: true }, { status: 202 });

  const user = await getCurrentUser();
  try {
    await supabaseAdminRest("product_events", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        anonymous_id: visitorId,
        user_id: user?.id ?? null,
        event_name: body.event,
        path: safeEventPath(body.path),
        properties: safeEventProperties(body.properties)
      })
    });
  } catch (error) {
    console.error("Unable to record product event", error);
  }

  const response = NextResponse.json({ ok: true });
  if (!existingVisitor) {
    response.cookies.set(VISITOR_COOKIE, visitorId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/"
    });
  }
  return response;
}
