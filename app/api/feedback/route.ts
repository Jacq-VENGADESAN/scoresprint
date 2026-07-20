import { NextRequest, NextResponse } from "next/server";
import { attachBetaVisitorCookie, getBetaVisitor, recordProductEvent } from "@/lib/beta-server";
import { consumeRateLimit } from "@/lib/rate-limit";
import { supabaseAdminRest } from "@/lib/supabase-admin";
import { getCurrentUser } from "@/lib/supabase-server";

const categories = new Set(["general", "content", "usability", "bug", "pricing", "missing_feature"]);

function optionalEmail(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return null;
  const email = value.trim().toLowerCase();
  return email.length <= 320 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    rating?: unknown;
    category?: unknown;
    message?: unknown;
    email?: unknown;
    path?: unknown;
  } | null;

  const rating = Number(body?.rating);
  const category = typeof body?.category === "string" && categories.has(body.category) ? body.category : "general";
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  const email = optionalEmail(body?.email);
  const path = typeof body?.path === "string" && /^\/[a-zA-Z0-9/_-]*$/.test(body.path) ? body.path.slice(0, 300) : null;

  if (!Number.isInteger(rating) || rating < 1 || rating > 5 || message.length < 10 || message.length > 3000) {
    return NextResponse.json({ error: "Choisis une note et écris un message d’au moins 10 caractères." }, { status: 400 });
  }

  const visitor = getBetaVisitor(request);
  const limit = await consumeRateLimit(request, { scope: "beta_feedback", limit: 20, windowSeconds: 86_400, subject: visitor.id });
  if (!limit.allowed) return attachBetaVisitorCookie(NextResponse.json({ error: "Trop de retours ont été envoyés aujourd’hui." }, { status: 429 }), visitor);

  const user = await getCurrentUser();
  try {
    await supabaseAdminRest("beta_feedback", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        anonymous_id: visitor.id,
        user_id: user?.id ?? null,
        email,
        rating,
        category,
        message,
        path
      })
    });
    await recordProductEvent({
      visitorId: visitor.id,
      userId: user?.id,
      eventName: "feedback_sent",
      path: path ?? "/feedback",
      properties: { rating, category }
    });
  } catch (error) {
    console.error("Unable to save beta feedback", error);
    return attachBetaVisitorCookie(NextResponse.json({ error: "Le formulaire n’est pas encore disponible. Vérifie que la migration bêta a été exécutée." }, { status: 503 }), visitor);
  }

  return attachBetaVisitorCookie(NextResponse.json({ ok: true }), visitor);
}
