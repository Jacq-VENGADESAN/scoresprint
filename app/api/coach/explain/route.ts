import { NextResponse } from "next/server";
import { getAccessSummary, hasCoach90Access } from "@/lib/access";
import {
  COACH_EXPLANATION_INSTRUCTIONS,
  COACH_EXPLANATION_SCHEMA,
  consumeCoachCredits,
  refundCoachCredits,
  type CoachExplanation
} from "@/lib/coach";
import { getDatabaseQuestionReview } from "@/lib/database-questions";
import { createStructuredResponse, openAiIsConfigured } from "@/lib/openai";
import { getPracticeQuestionReview } from "@/lib/practice-catalog";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getCurrentUser, supabaseRest } from "@/lib/supabase-server";

type AttemptRow = { selected_option: string; is_correct: boolean; created_at: string };
type RequestBody = { questionCode?: unknown };

function validExplanation(value: CoachExplanation) {
  return Boolean(value && typeof value.simpleExplanation === "string" && typeof value.whySelectedWasWrong === "string" && Array.isArray(value.examples) && value.examples.length === 2);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });

  try {
    const access = await getAccessSummary(user.id);
    if (!hasCoach90Access(access)) return NextResponse.json({ error: "Le coach IA est réservé à l’offre Coach 90." }, { status: 403 });
    if (!openAiIsConfigured()) return NextResponse.json({ error: "Le coach IA n’est pas encore configuré par l’administrateur." }, { status: 503 });

    const body = (await request.json().catch(() => null)) as RequestBody | null;
    const questionCode = typeof body?.questionCode === "string" ? body.questionCode.trim() : "";
    if (!/^[a-zA-Z0-9_-]{3,120}$/.test(questionCode)) return NextResponse.json({ error: "QUESTION_INVALID" }, { status: 400 });

    const rate = await consumeRateLimit(request, { scope: "coach-explain", subject: user.id, limit: 20, windowSeconds: 86_400 });
    if (!rate.allowed) return NextResponse.json({ error: "Trop de demandes ont été envoyées aujourd’hui." }, { status: 429 });

    const attempts = await supabaseRest<AttemptRow[]>(
      `practice_attempts?select=selected_option,is_correct,created_at&user_id=eq.${user.id}&question_code=eq.${encodeURIComponent(questionCode)}&order=created_at.desc&limit=1`
    );
    const attempt = attempts[0];
    if (!attempt) return NextResponse.json({ error: "Cette question ne figure pas dans ton historique." }, { status: 404 });

    const review = getPracticeQuestionReview(questionCode, attempt.selected_option)
      ?? await getDatabaseQuestionReview(questionCode, attempt.selected_option);
    if (!review) return NextResponse.json({ error: "La correction de cette question n’est plus disponible." }, { status: 404 });

    const credit = await consumeCoachCredits(1);
    if (!credit.allowed) return NextResponse.json({ error: "Ton quota quotidien de coach IA est atteint.", remaining: credit.remaining }, { status: 429 });

    try {
      const explanation = await createStructuredResponse<CoachExplanation>({
        schemaName: "aptileo_question_explanation",
        schema: COACH_EXPLANATION_SCHEMA,
        instructions: COACH_EXPLANATION_INSTRUCTIONS,
        payload: {
          question_code: questionCode,
          part: review.question.part,
          skill: review.question.skillLabel,
          subskill: review.question.subskill,
          context: review.question.context ?? null,
          prompt: review.question.prompt,
          options: review.question.options,
          selected_option: attempt.selected_option,
          correct_option: review.question.correctOptionId,
          verified_explanation: review.question.explanation,
          verified_trap: review.question.trap
        },
        maxOutputTokens: 1300
      });
      if (!validExplanation(explanation)) throw new Error("INVALID_COACH_EXPLANATION");
      return NextResponse.json({ explanation, remaining: credit.remaining });
    } catch (error) {
      try { await refundCoachCredits(1); } catch (refundError) { console.error("Unable to refund Coach explanation credit", refundError); }
      console.error("Unable to generate Coach 90 explanation", error);
      return NextResponse.json({ error: "L’explication n’a pas pu être générée. Aucun crédit n’a été conservé.", remaining: credit.remaining + 1 }, { status: 502 });
    }
  } catch (error) {
    console.error("Unable to prepare Coach 90 explanation", error);
    return NextResponse.json({ error: "Le coach n’est pas encore disponible. Vérifie sa migration et sa configuration." }, { status: 503 });
  }
}
