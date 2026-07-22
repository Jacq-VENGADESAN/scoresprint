import { NextResponse } from "next/server";
import { getAccessSummary, hasCoach90Access } from "@/lib/access";
import {
  COACH_PLAN_INSTRUCTIONS,
  COACH_PLAN_SCHEMA,
  consumeCoachCredits,
  type CoachPlan
} from "@/lib/coach";
import { createStructuredResponse, openAiIsConfigured, openAiModel } from "@/lib/openai";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getCurrentUser, supabaseRest } from "@/lib/supabase-server";

type GoalRow = {
  current_score: number | null;
  target_score: number;
  exam_date: string | null;
  daily_minutes: number;
  level: string | null;
  focus: string | null;
};

type MasteryRow = { skill_id: string; mastery: number | string; evidence_count: number };
type ErrorRow = { title: string; subskill: string; error_count: number; next_review_at: string | null };
type AttemptRow = { skill_id: string; subskill: string; is_correct: boolean; created_at: string };

function mondayDate(value = new Date()) {
  const day = value.getUTCDay();
  const difference = day === 0 ? -6 : 1 - day;
  const monday = new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate() + difference));
  return monday.toISOString().slice(0, 10);
}

function validPlan(plan: CoachPlan) {
  return Boolean(
    plan
    && typeof plan.headline === "string"
    && typeof plan.diagnosis === "string"
    && Array.isArray(plan.prioritySkills)
    && Array.isArray(plan.days)
    && plan.days.length === 7
    && plan.days.every((day) => Number.isInteger(day.minutes) && day.minutes >= 5 && day.minutes <= 120)
  );
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });

  const access = await getAccessSummary(user.id);
  if (!hasCoach90Access(access)) {
    return NextResponse.json({ error: "Le coach IA est réservé à l’offre Coach 90." }, { status: 403 });
  }
  if (!openAiIsConfigured()) {
    return NextResponse.json({ error: "Le coach IA n’est pas encore configuré par l’administrateur." }, { status: 503 });
  }

  const rate = await consumeRateLimit(request, { scope: "coach-plan", subject: user.id, limit: 4, windowSeconds: 86_400 });
  if (!rate.allowed) return NextResponse.json({ error: "Tu as déjà régénéré plusieurs programmes aujourd’hui." }, { status: 429 });

  const [goals, masteries, errors, attempts] = await Promise.all([
    supabaseRest<GoalRow[]>(`user_goals?select=current_score,target_score,exam_date,daily_minutes,level,focus&user_id=eq.${user.id}&limit=1`),
    supabaseRest<MasteryRow[]>(`user_mastery?select=skill_id,mastery,evidence_count&user_id=eq.${user.id}&order=mastery.asc&limit=12`),
    supabaseRest<ErrorRow[]>(`user_error_items?select=title,subskill,error_count,next_review_at&user_id=eq.${user.id}&resolved_at=is.null&order=error_count.desc&limit=8`),
    supabaseRest<AttemptRow[]>(`practice_attempts?select=skill_id,subskill,is_correct,created_at&user_id=eq.${user.id}&order=created_at.desc&limit=80`)
  ]);

  const credit = await consumeCoachCredits(3);
  if (!credit.allowed) {
    return NextResponse.json({ error: "Ton quota quotidien de coach IA est atteint.", remaining: credit.remaining }, { status: 429 });
  }

  try {
    const plan = await createStructuredResponse<CoachPlan>({
      schemaName: "aptileo_weekly_coach_plan",
      schema: COACH_PLAN_SCHEMA,
      instructions: COACH_PLAN_INSTRUCTIONS,
      payload: {
        today: new Date().toISOString().slice(0, 10),
        goal: goals[0] ?? { current_score: null, target_score: 850, exam_date: null, daily_minutes: 20, level: null, focus: null },
        weakest_skills: masteries.map((row) => ({ skill: row.skill_id, mastery: Number(row.mastery), evidence: row.evidence_count })),
        unresolved_errors: errors,
        recent_attempts: attempts,
        available_activities: [
          "séance Reading adaptative",
          "carnet d'erreurs",
          "mini-examen Reading de 30 questions",
          "Listening partie 1",
          "Listening partie 2",
          "fiches pédagogiques"
        ]
      },
      maxOutputTokens: 2200
    });

    if (!validPlan(plan)) throw new Error("INVALID_COACH_PLAN");
    const weekStart = mondayDate();
    await supabaseRest("ai_coach_plans?on_conflict=user_id,week_start", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({
        user_id: user.id,
        week_start: weekStart,
        plan,
        model: openAiModel(),
        updated_at: new Date().toISOString()
      })
    });

    return NextResponse.json({ plan, remaining: credit.remaining, weekStart });
  } catch (error) {
    console.error("Unable to generate Coach 90 plan", error);
    return NextResponse.json({ error: "Le programme n’a pas pu être généré. Réessaie dans quelques minutes.", remaining: credit.remaining }, { status: 502 });
  }
}
