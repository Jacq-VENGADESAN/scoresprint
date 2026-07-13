import { NextResponse } from "next/server";
import {
  MINI_EXAM_QUESTION_COUNT,
  evaluateMiniExam,
  type MiniExamAnswerInput
} from "@/lib/mini-exam-bank";
import { buildExamScoreSnapshot, updateCalibratedMastery } from "@/lib/measurement";
import { getCurrentUser, supabaseRest } from "@/lib/supabase-server";

type RequestBody = {
  answers?: MiniExamAnswerInput[];
  durationMs?: number;
};

type MasteryRow = {
  skill_id: string;
  mastery: number | string;
  repeated_errors: number;
  evidence_count: number;
  correct_count: number;
};

function isValidAnswer(answer: MiniExamAnswerInput) {
  return typeof answer.questionId === "string"
    && ["A", "B", "C", "D"].includes(answer.selectedOptionId)
    && Number.isFinite(answer.responseTimeMs)
    && answer.responseTimeMs >= 0;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tu dois être connecté pour enregistrer le mini-examen." }, { status: 401 });

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Les réponses envoyées sont illisibles." }, { status: 400 });
  }

  const answers = Array.isArray(body.answers) ? body.answers : [];
  const uniqueIds = new Set(answers.map((answer) => answer.questionId));
  if (
    answers.length !== MINI_EXAM_QUESTION_COUNT
    || uniqueIds.size !== MINI_EXAM_QUESTION_COUNT
    || !answers.every(isValidAnswer)
  ) {
    return NextResponse.json({ error: "Les 30 questions doivent être complétées avant la correction." }, { status: 400 });
  }

  const durationMs = Math.max(0, Math.min(Number(body.durationMs ?? 0), 60 * 60 * 1000));
  if (!Number.isFinite(durationMs)) {
    return NextResponse.json({ error: "La durée du mini-examen est invalide." }, { status: 400 });
  }

  const evaluation = evaluateMiniExam(answers);
  const score = buildExamScoreSnapshot(evaluation.correctAnswers, evaluation.totalQuestions);

  try {
    const runs = await supabaseRest<Array<{ id: string }>>("mini_exam_runs", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        user_id: user.id,
        total_questions: evaluation.totalQuestions,
        correct_answers: evaluation.correctAnswers,
        estimated_score: score.central,
        score_low: score.scoreLow,
        score_high: score.scoreHigh,
        duration_ms: Math.round(durationMs),
        section_breakdown: evaluation.sectionBreakdown
      })
    });
    const runId = runs[0]?.id;
    if (!runId) throw new Error("Le mini-examen n’a pas reçu d’identifiant.");

    await supabaseRest<void>("mini_exam_answers", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify(
        evaluation.reviewedAnswers.map((answer) => ({
          run_id: runId,
          user_id: user.id,
          question_code: answer.questionId,
          part: answer.part,
          skill_id: answer.skillId,
          selected_option: answer.selectedOptionId,
          correct_option: answer.correctOptionId,
          is_correct: answer.isCorrect,
          response_time_ms: answer.responseTimeMs
        }))
      )
    });

    const skillIds = [...new Set(evaluation.reviewedAnswers.map((answer) => answer.skillId))];
    const currentRows = await supabaseRest<MasteryRow[]>(
      `user_mastery?select=skill_id,mastery,repeated_errors,evidence_count,correct_count&user_id=eq.${user.id}&skill_id=in.(${skillIds.join(",")})`
    );
    const masteryMap = new Map(
      currentRows.map((row) => [row.skill_id, {
        mastery: Number(row.mastery),
        repeatedErrors: row.repeated_errors,
        evidenceCount: row.evidence_count,
        correctCount: row.correct_count
      }])
    );

    for (const answer of evaluation.reviewedAnswers) {
      const current = masteryMap.get(answer.skillId) ?? {
        mastery: 50,
        repeatedErrors: 0,
        evidenceCount: 0,
        correctCount: 0
      };
      const updated = updateCalibratedMastery({
        current: current.mastery,
        correct: answer.isCorrect,
        responseTimeMs: answer.responseTimeMs,
        targetTimeMs: answer.targetTimeMs,
        difficulty: answer.difficulty,
        evidenceCount: current.evidenceCount
      });
      masteryMap.set(answer.skillId, {
        mastery: updated.mastery,
        repeatedErrors: answer.isCorrect ? Math.max(0, current.repeatedErrors - 1) : current.repeatedErrors + 1,
        evidenceCount: updated.evidenceCount,
        correctCount: current.correctCount + (answer.isCorrect ? 1 : 0)
      });
    }

    const now = new Date();
    await supabaseRest<void>("user_mastery?on_conflict=user_id,skill_id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify(
        [...masteryMap.entries()].map(([skillId, mastery]) => {
          const nextReview = new Date(now);
          nextReview.setDate(nextReview.getDate() + (mastery.mastery < 50 ? 1 : mastery.mastery < 70 ? 3 : 7));
          return {
            user_id: user.id,
            skill_id: skillId,
            mastery: mastery.mastery,
            repeated_errors: mastery.repeatedErrors,
            evidence_count: mastery.evidenceCount,
            correct_count: mastery.correctCount,
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
        source: "mini_exam",
        central_score: score.central,
        score_low: score.scoreLow,
        score_high: score.scoreHigh,
        confidence: score.confidence,
        evidence_count: score.evidenceCount
      })
    });

    await supabaseRest<void>(`user_goals?user_id=eq.${user.id}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ current_score: score.central })
    });

    return NextResponse.json({
      runId,
      correctAnswers: evaluation.correctAnswers,
      totalQuestions: evaluation.totalQuestions,
      accuracy: Math.round((evaluation.correctAnswers / evaluation.totalQuestions) * 100),
      estimatedScore: score.central,
      scoreLow: score.scoreLow,
      scoreHigh: score.scoreHigh,
      confidence: score.confidence,
      durationMs: Math.round(durationMs),
      sectionBreakdown: evaluation.sectionBreakdown
    });
  } catch (error) {
    console.error("Unable to persist mini exam", error);
    return NextResponse.json(
      { error: "Le mini-examen n’a pas pu être enregistré. Vérifie la migration de calibration et des mini-examens." },
      { status: 500 }
    );
  }
}
