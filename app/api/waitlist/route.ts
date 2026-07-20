import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { consumeRateLimit } from "@/lib/rate-limit";
import { supabaseAdminRest } from "@/lib/supabase-admin";
import { getCurrentUser } from "@/lib/supabase-server";

const VISITOR_COOKIE = "aptileo_beta_session";
const plans = new Set(["sprint_30", "sprint_90", "undecided"]);

function validEmail(value: string) {
  return value.length <= 320 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    email?: unknown;
    planInterest?: unknown;
    goalScore?: unknown;
    examDate?: unknown;
    source?: unknown;
    consent?: unknown;
  } | null;

  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const planInterest = typeof body?.planInterest === "string" && plans.has(body.planInterest) ? body.planInterest : "undecided";
  const goalScoreNumber = typeof body?.goalScore === "number" ? body.goalScore : Number(body?.goalScore ?? NaN);
  const goalScore = Number.isInteger(goalScoreNumber) && goalScoreNumber >= 10 && goalScoreNumber <= 990 ? goalScoreNumber : null;
  const examDate = typeof body?.examDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.examDate) ? body.examDate : null;
  const source = typeof body?.source === "string" ? body.source.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80) || "pricing" : "pricing";

  if (!validEmail(email) || body?.consent !== true) {
    return NextResponse.json({ error: "Indique un e-mail valide et accepte d’être recontacté au sujet de la bêta Premium." }, { status: 400 });
  }

  const limit = await consumeRateLimit(request, { scope: "premium_waitlist", limit: 8, windowSeconds: 86_400, subject: email });
  if (!limit.allowed) return NextResponse.json({ error: "Trop de tentatives. Réessaie plus tard." }, { status: 429 });

  const existingVisitor = request.cookies.get(VISITOR_COOKIE)?.value;
  const visitorId = existingVisitor && existingVisitor.length >= 16 ? existingVisitor : randomUUID();
  const user = await getCurrentUser();
  const now = new Date().toISOString();

  try {
    const existing = await supabaseAdminRest<Array<{ id: string }>>(
      `premium_waitlist?select=id&email=eq.${encodeURIComponent(email)}&limit=1`
    );
    const payload = {
      email,
      user_id: user?.id ?? null,
      plan_interest: planInterest,
      goal_score: goalScore,
      exam_date: examDate,
      source,
      consent_at: now,
      updated_at: now
    };
    if (existing[0]?.id) {
      await supabaseAdminRest(`premium_waitlist?id=eq.${existing[0].id}`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify(payload)
      });
    } else {
      await supabaseAdminRest("premium_waitlist", {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ ...payload, created_at: now })
      });
    }
    await supabaseAdminRest("product_events", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        anonymous_id: visitorId,
        user_id: user?.id ?? null,
        event_name: "waitlist_joined",
        path: "/pricing",
        properties: { plan_interest: planInterest, source }
      })
    });
  } catch (error) {
    console.error("Unable to join Premium waitlist", error);
    return NextResponse.json({ error: "La liste d’attente n’est pas encore disponible. Vérifie que la migration bêta a été exécutée." }, { status: 503 });
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
