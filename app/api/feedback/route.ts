import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { consumeRateLimit } from "@/lib/rate-limit";
import { supabaseAdminRest } from "@/lib/supabase-admin";
import { getCurrentUser } from "@/lib/supabase-server";

const VISITOR_COOKIE = "aptileo_beta_session";
const categories = new Set(["general", "content", "usability", "bug", "pricing", "missing_feature"]);

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
  const email = typeof body?.email === "string" && body.email.trim() ? body.email.trim().toLowerCase().slice(0, 320) : null;
  const path = typeof body?.path === "string" && body.path.startsWith("/") ? body.path.slice(0, 300) : null;

  if (!Number.isInteger(rating) || rating < 1 || rating > 5 || message.length < 10 || message.length > 3000) {
    return NextResponse.json({ error: "Choisis une note et écris un message d’au moins 10 caractères." }, { status: 400 });
  }

  const existingVisitor = request.cookies.get(VISITOR_COOKIE)?.value;
  const visitorId = existingVisitor && existingVisitor.length >= 16 ? existingVisitor : randomUUID();
  const limit = await consumeRateLimit(request, { scope: "beta_feedback", limit: 20, windowSeconds: 86_400, subject: visitorId });
  if (!limit.allowed) return NextResponse.json({ error: "Trop de retours ont été envoyés aujourd’hui." }, { status: 429 });

  const user = await getCurrentUser();
  try {
    await supabaseAdminRest("beta_feedback", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        anonymous_id: visitorId,
        user_id: user?.id ?? null,
        email,
        rating,
        category,
        message,
        path
      })
    });
    await supabaseAdminRest("product_events", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        anonymous_id: visitorId,
        user_id: user?.id ?? null,
        event_name: "feedback_sent",
        path: path ?? "/feedback",
        properties: { rating, category }
      })
    });
  } catch (error) {
    console.error("Unable to save beta feedback", error);
    return NextResponse.json({ error: "Le formulaire n’est pas encore disponible. Vérifie que la migration bêta a été exécutée." }, { status: 503 });
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
