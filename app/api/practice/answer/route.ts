import { NextResponse } from "next/server";
import { evaluateDatabasePracticeAnswer } from "@/lib/database-questions";
import { evaluatePracticeAnswer } from "@/lib/practice-catalog";
import { updateCalibratedMastery } from "@/lib/measurement";
import { getCurrentUser, supabaseRest } from "@/lib/supabase-server";

type RequestBody = {
  sessionId?: string;
  questionId?: string;
  selectedOptionId?: string;
  responseTimeMs?: number;
};

type MasteryRow = {
  mastery: number | string;
  repeated_errors: number;
  evidence_count: number;
  correct_count: number;
};

type ErrorRow = {
  error_count: number;
  success_streak: number;
};

type SessionRow = {
  id: string;
  completed_at: string | null;
};

function reviewDate(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tu dois être connecté pour enregistrer ta réponse." }, { status: 401 });

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "La réponse envoyée est illisible." }, { status: 400 });
  }

  const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";
  const questionId = typeof body.questionId === "string" ? body.questionId : "";
  const selectedOptionId = typeof body.selectedOptionId === "string" ? body.selectedOptionId : "";
  const responseTimeMs = Math.max(0, Math.min(Number(body.responseTimeMs ?? 0), 10 * 60 * 1000));
  const evaluation = evaluatePracticeAnswer(questionId, selectedOptionId)
    ?? await evaluateDatabasePracticeAnswer(questionId, selectedOptionId);

  if (!sessionId || !evaluation || !Number.isFinite(responseTimeMs)) {
    return NextResponse.json({ error: "Cette séance, cette question ou cette réponse n’est pas valide." }, { status: 400 });
  }

  const { question, isCorrect, selectedFeedback } = evaluation;

  try {
    const sessions = await supabaseRest<SessionRow[]>(
      `study_sessions?select=id,completed_at&id=eq.${sessionId}&user_id=eq.${user.id}&limit=1`
    );
    const session = sessions[0];
    if (!session || session.completed_at) {
      return NextResponse.json({ error: "Cette séance est introuvable ou déjà terminée." }, { status: 409 });
    }

    const masteryRows = await supabaseRest<MasteryRow[]>(
      `user_mastery?select=mastery,repeated_errors,evidence_count,correct_count&user_id=eq.${user.id}&skill_id=eq.${question.skillId}&limit=1`
    );
    const current = masteryRows[0];
    const currentMastery = current ? Number(current.mastery) : 50;
    const currentRepeatedErrors = current?.repeated_errors ?? 0;
    const currentEvidence = current?.evidence_count ?? 0;
    const currentCorrect = current?.correct_count ?? 0;
    const calibrated = updateCalibratedMastery({
      current: currentMastery,
      correct: isCorrect,
      responseTimeMs,
      targetTimeMs: question.targetTimeMs,
      difficulty: question.difficulty,
      evidenceCount: currentEvidence
    });
    const masteryAfter = calibrated.mastery;
    const now = new Date();
    const masteryNextReview = reviewDate(isCorrect ? (masteryAfter >= 75 ? 7 : 3) : 1);

    await supabaseRest<void>("practice_attempts", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        session_id: sessionId,
        user_id: user.id,
        question_code: question.id,
        skill_id: question.skillId,
        subskill: question.subskill,
        selected_option: evaluation.selectedOptionId,
        correct_option: question.correctOptionId,
        is_correct: isCorrect,
        response_time_ms: responseTimeMs,
        mastery_before: currentMastery,
        mastery_after: masteryAfter
      })
    });

    await supabaseRest<void>("user_mastery?on_conflict=user_id,skill_id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({
        user_id: user.id,
        skill_id: question.skillId,
        mastery: masteryAfter,
        repeated_errors: isCorrect ? Math.max(0, currentRepeatedErrors - 1) : currentRepeatedErrors + 1,
        evidence_count: calibrated.evidenceCount,
        correct_count: currentCorrect + (isCorrect ? 1 : 0),
        last_reviewed_at: now.toISOString(),
        next_review_at: masteryNextReview.toISOString(),
        updated_at: now.toISOString()
      })
    });

    const existingErrors = await supabaseRest<ErrorRow[]>(
      `user_error_items?select=error_count,success_streak&user_id=eq.${user.id}&question_code=eq.${question.id}&limit=1`
    );
    const existing = existingErrors[0];
    let nextReviewAt: string | null = null;
    let resolved = false;

    if (!isCorrect) {
      nextReviewAt = reviewDate(1).toISOString();
      await supabaseRest<void>("user_error_items?on_conflict=user_id,question_code", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify({
          user_id: user.id,
          question_code: question.id,
          skill_id: question.skillId,
          subskill: question.subskill,
          title: `${question.skillLabel} — ${question.subskill}`,
          error_count: (existing?.error_count ?? 0) + 1,
          success_streak: 0,
          last_selected_option: evaluation.selectedOptionId,
          last_attempt_at: now.toISOString(),
          next_review_at: nextReviewAt,
          resolved_at: null,
          updated_at: now.toISOString()
        })
      });
    } else if (existing) {
      const successStreak = existing.success_streak + 1;
      resolved = successStreak >= 3;
      nextReviewAt = resolved ? null : reviewDate(successStreak === 1 ? 3 : 7).toISOString();
      await supabaseRest<void>(`user_error_items?user_id=eq.${user.id}&question_code=eq.${question.id}`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          success_streak: successStreak,
          last_selected_option: evaluation.selectedOptionId,
          last_attempt_at: now.toISOString(),
          next_review_at: nextReviewAt,
          resolved_at: resolved ? now.toISOString() : null,
          updated_at: now.toISOString()
        })
      });
    }

    return NextResponse.json({
      isCorrect,
      correctOptionId: question.correctOptionId,
      explanation: question.explanation,
      trap: question.trap,
      selectedFeedback,
      masteryBefore: currentMastery,
      masteryAfter,
      confidence: calibrated.confidence,
      evidenceCount: calibrated.evidenceCount,
      nextReviewAt,
      resolved
    });
  } catch (error) {
    console.error("Unable to save practice answer", error);
    return NextResponse.json(
      { error: "La réponse n’a pas pu être enregistrée. Vérifie la migration de calibration." },
      { status: 500 }
    );
  }
}