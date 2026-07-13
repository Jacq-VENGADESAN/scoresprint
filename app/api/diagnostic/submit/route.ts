import { NextResponse } from "next/server";
import {
  DIAGNOSTIC_QUESTION_COUNT,
  evaluateDiagnostic,
  type DiagnosticAnswerInput
} from "@/lib/diagnostic-bank";
import { confidenceFromEvidence } from "@/lib/measurement";
import { getCurrentUser, supabaseRest } from "@/lib/supabase-server";

type RequestBody = {
  answers?: DiagnosticAnswerInput[];
  durationMs?: number;
};

type ExistingMastery = {
  skill_id: string;
  mastery: number | string;
  repeated_errors: number;
  evidence_count: number;
  correct_count: number;
};

function isValidAnswer(answer: DiagnosticAnswerInput) {
  return typeof answer.questionId === "string"
    && ["A", "B", "C", "D"].includes(answer.selectedOptionId)
    && Number.isFinite(answer.responseTimeMs)
    && answer.responseTimeMs >= 0;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tu dois être connecté pour enregistrer le diagnostic." }, { status: 401 });

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Les réponses envoyées sont illisibles." }, { status: 400 });
  }

  const answers = Array.isArray(body.answers) ? body.answers : [];
  const uniqueQuestionIds = new Set(answers.map((answer) => answer.questionId));
  if (
    answers.length !== DIAGNOSTIC_QUESTION_COUNT
    || uniqueQuestionIds.size !== DIAGNOSTIC_QUESTION_COUNT
    || !answers.every(isValidAnswer)
  ) {
    return NextResponse.json({ error: "Le diagnostic doit être terminé avant l’analyse." }, { status: 400 });
  }

  const durationMs = Math.max(0, Math.min(Number(body.durationMs ?? 0), 2 * 60 * 60 * 1000));
  const evaluation = evaluateDiagnostic(answers);

  try {
    const runs = await supabaseRest<Array<{ id: string }>>("diagnostic_runs", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        user_id: user.id,
        total_questions: evaluation.totalQuestions,
        correct_answers: evaluation.correctAnswers,
        estimated_score: evaluation.estimatedScore,
        score_low: evaluation.scoreLow,
        score_high: evaluation.scoreHigh,
        duration_ms: durationMs,
        skill_breakdown: evaluation.skillBreakdown
      })
    });
    const runId = runs[0]?.id;
    if (!runId) throw new Error("Le diagnostic n’a pas reçu d’identifiant.");

    await supabaseRest<void>("diagnostic_answers", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify(
        evaluation.reviewedAnswers.map((answer) => ({
          run_id: runId,
          user_id: user.id,
          question_code: answer.questionId,
          skill_id: answer.skillId,
          selected_option: answer.selectedOptionId,
          is_correct: answer.isCorrect,
          response_time_ms: answer.responseTimeMs
        }))
      )
    });

    const skillIds = evaluation.skillBreakdown.map((skill) => skill.skillId);
    const existingRows = await supabaseRest<ExistingMastery[]>(
      `user_mastery?select=skill_id,mastery,repeated_errors,evidence_count,correct_count&user_id=eq.${user.id}&skill_id=in.(${skillIds.join(",")})`
    );
    const existingMap = new Map(existingRows.map((row) => [row.skill_id, row]));
    const now = new Date();

    await supabaseRest<void>("user_mastery?on_conflict=user_id,skill_id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify(
        evaluation.skillBreakdown.map((skill) => {
          const existing = existingMap.get(skill.skillId);
          const previousEvidence = existing?.evidence_count ?? 0;
          const totalEvidence = previousEvidence + skill.total;
          const blendedMastery = totalEvidence > 0
            ? ((existing ? Number(existing.mastery) : skill.mastery) * previousEvidence + skill.mastery * skill.total) / totalEvidence
            : skill.mastery;
          const mastery = Math.round(blendedMastery * 10) / 10;
          const nextReview = new Date(now);
          nextReview.setDate(nextReview.getDate() + (mastery < 50 ? 1 : mastery < 70 ? 3 : 7));
          return {
            user_id: user.id,
            skill_id: skill.skillId,
            mastery,
            repeated_errors: (existing?.repeated_errors ?? 0) + (skill.total - skill.correct),
            evidence_count: totalEvidence,
            correct_count: (existing?.correct_count ?? 0) + skill.correct,
            last_reviewed_at: now.toISOString(),
            next_review_at: nextReview.toISOString(),
            updated_at: now.toISOString()
          };
        })
      )
    });

    await supabaseRest<void>("score_snapshots", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        user_id: user.id,
        source: "diagnostic",
        central_score: evaluation.estimatedScore,
        score_low: evaluation.scoreLow,
        score_high: evaluation.scoreHigh,
        confidence: confidenceFromEvidence(evaluation.totalQuestions),
        evidence_count: evaluation.totalQuestions,
        created_at: now.toISOString()
      })
    });

    await supabaseRest<void>(`user_goals?user_id=eq.${user.id}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ current_score: evaluation.estimatedScore })
    });

    return NextResponse.json({
      correctAnswers: evaluation.correctAnswers,
      totalQuestions: evaluation.totalQuestions,
      estimatedScore: evaluation.estimatedScore,
      scoreLow: evaluation.scoreLow,
      scoreHigh: evaluation.scoreHigh,
      skillBreakdown: evaluation.skillBreakdown
    });
  } catch (error) {
    console.error("Unable to persist diagnostic", error);
    return NextResponse.json(
      { error: "L’analyse a échoué. Vérifie la migration de calibration et des mini-examens." },
      { status: 500 }
    );
  }
}
