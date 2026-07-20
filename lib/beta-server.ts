import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import type { ProductEventName } from "@/lib/product-analytics";
import { supabaseAdminRest } from "@/lib/supabase-admin";

const BETA_VISITOR_COOKIE = "aptileo_beta_session";

type BetaVisitor = {
  id: string;
  isNew: boolean;
};

export function getBetaVisitor(request: NextRequest): BetaVisitor {
  const existing = request.cookies.get(BETA_VISITOR_COOKIE)?.value;
  if (existing && /^[0-9a-f-]{36}$/i.test(existing)) return { id: existing, isNew: false };
  return { id: randomUUID(), isNew: true };
}

export function attachBetaVisitorCookie(response: NextResponse, visitor: BetaVisitor) {
  if (!visitor.isNew) return response;
  response.cookies.set(BETA_VISITOR_COOKIE, visitor.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });
  return response;
}

export async function recordProductEvent(input: {
  visitorId: string;
  userId?: string | null;
  eventName: ProductEventName;
  path?: string | null;
  properties?: Record<string, string | number | boolean | null>;
}) {
  await supabaseAdminRest("product_events", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      anonymous_id: input.visitorId,
      user_id: input.userId ?? null,
      event_name: input.eventName,
      path: input.path ?? null,
      properties: input.properties ?? {}
    })
  });
}
