import { NextResponse } from "next/server";
import { evaluateListeningAnswer } from "@/lib/listening-bank";
import { updateCalibratedMastery } from "@/lib/measurement";
import { getCurrentUser, supabaseRest } from "@/lib/supabase-server";

type RequestBody = {
  runId?: string;
  questionId?: string;
  selectedOptionId?: string;
  responseTimeMs?: number;
  playCount?: number;
  slowPlayCount?: number;
};

type RunRow = { id: string; completed_at: string | null };
type MasteryRow = {
  mastery: number | string;
  repeated_errors: number;
  evidence_count: number;
  correct_count: number;
};

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tu dois être connecté pour enregistrer cette réponse." }, { status: 401 });

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "La réponse envoyée est illisible." }, { status: 400 });
  }

  const runId = typeof body.runId === "string" ? body.runId : "";
  const questionId = typeof body.questionId === "string" ? body.questionId : "";
  const selectedOptionId = typeof body.selectedOptionId === "string" ? body.selectedOptionId : "";
  const responseTimeMs = Math.max(0, Math.min(Number(body.responseTimeMs ?? 0), 10 * 60_000));
  const playCount = Math.max(0, Math.min(Math.round(Number(body.playCount ?? 0)), 50));
  const slowPlayCount = Math.max(0, Math.min(Math.round(Number(body.slowPlayCount ?? 0)), 50));
  const evaluation = evaluateListeningAnswer(questionId, selectedOptionId);

  if (!runId || !evaluation || !Number.isFinite(responseTimeMs)) {
    return NextResponse.json({ error: "La question ou la réponse n’est pas valide." }, { status: 400 });
  }

  try {
    const runs = await supabaseRest<RunRow[]>(
      `listening_runs?select=id,completed_at&id=eq.${runId}&user_id=eq.${user.id}&limit=1`
    );
    const run = runs[0];
    if (!run) return NextResponse.json({ error: "Cette séance d’écoute est introuvable." }, { status: 404 });
    if (run.completed_at) return NextResponse.json({ error: "Cette séance est déjà terminée." }, { status: 409 });

    const previousAttempts = await supabaseRest<Array<{ id: string }>>(
      `listening_attempts?select=id&run_id=eq.${runId}&question_code=eq.${encodeURIComponent(questionId)}&user_id=eq.${user.id}&limit=1`
    );
    if (previousAttempts.length > 0) {
      return NextResponse.json({ error: "Cette question a déjà été enregistrée." }, { status: 409 });
    }

    const question = evaluation.question;
    await supabaseRest<void>("listening_attempts", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        run_id: runId,
        user_id: user.id,
        question_code: question.id,
        part: question.part,
        skill_id: question.skillId,
        selected_option: evaluation.selectedOptionId,
        correct_option: question.correctOptionId,
        is_correct: evaluation.isCorrect,
        response_time_ms: Math.round(responseTimeMs),
        play_count: playCount,
        slow_play_count: slowPlayCount
      })
    });

    const currentRows = await supabaseRest<MasteryRow[]>(
      `user_mastery?select=mastery,repeated_errors,evidence_count,correct_count&user_id=eq.${user.id}&skill_id=eq.${question.skillId}&limit=1`
    );
    const current = currentRows[0] ?? {
      mastery: 50,
      repeated_errors: 0,
      evidence_count: 0,
      correct_count: 0
    };
    const updated = updateCalibratedMastery({
      current: Number(current.mastery),
      correct: evaluation.isCorrect,
      responseTimeMs,
      targetTimeMs: question.targetTimeMs,
      difficulty: question.difficulty,
      evidenceCount: current.evidence_count
    });
    const now = new Date();
    const nextReview = new Date(now);
    nextReview.setDate(nextReview.getDate() + (updated.mastery < 50 ? 1 : updated.mastery < 70 ? 3 : 7));

    await supabaseRest<void>("user_mastery?on_conflict=user_id,skill_id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({
        user_id: user.id,
        skill_id: question.skillId,
        mastery: updated.mastery,
        repeated_errors: evaluation.isCorrect ? Math.max(0, current.repeated_errors - 1) : current.repeated_errors + 1,
        evidence_count: updated.evidenceCount,
        correct_count: current.correct_count + (evaluation.isCorrect ? 1 : 0),
        last_reviewed_at: now.toISOString(),
        next_review_at: nextReview.toISOString(),
        updated_at: now.toISOString()
      })
    });

    return NextResponse.json({
      isCorrect: evaluation.isCorrect,
      correctOptionId: question.correctOptionId,
      selectedFeedback: evaluation.selectedFeedback,
      explanation: question.explanation,
      trap: question.trap,
      promptTranscript: question.promptAudio,
      optionTranscripts: question.options,
      masteryBefore: Number(current.mastery),
      masteryAfter: updated.mastery,
      confidence: updated.confidence,
      evidenceCount: updated.evidenceCount
    });
  } catch (error) {
    console.error("Unable to save listening answer", error);
    return NextResponse.json({ error: "La réponse n’a pas pu être enregistrée. Vérifie la migration Listening." }, { status: 500 });
  }
}
