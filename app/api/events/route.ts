import { NextRequest, NextResponse } from "next/server";
import { attachBetaVisitorCookie, getBetaVisitor, recordProductEvent } from "@/lib/beta-server";
import { isProductEventName, safeEventPath, safeEventProperties } from "@/lib/product-analytics";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getCurrentUser } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    event?: unknown;
    path?: unknown;
    properties?: unknown;
  } | null;

  if (!body || !isProductEventName(body.event)) return NextResponse.json({ error: "INVALID_EVENT" }, { status: 400 });

  const visitor = getBetaVisitor(request);
  const limit = await consumeRateLimit(request, {
    scope: "product_event",
    limit: 180,
    windowSeconds: 3600,
    subject: visitor.id
  });
  if (!limit.allowed) return attachBetaVisitorCookie(NextResponse.json({ ok: true }, { status: 202 }), visitor);

  const user = await getCurrentUser();
  try {
    await recordProductEvent({
      visitorId: visitor.id,
      userId: user?.id,
      eventName: body.event,
      path: safeEventPath(body.path),
      properties: safeEventProperties(body.properties)
    });
  } catch (error) {
    console.error("Unable to record product event", error);
  }

  return attachBetaVisitorCookie(NextResponse.json({ ok: true }), visitor);
}
