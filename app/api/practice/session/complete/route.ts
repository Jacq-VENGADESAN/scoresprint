import { NextResponse } from "next/server";
import { buildPracticeScoreSnapshot } from "@/lib/measurement";
import { calculateStreak } from "@/lib/progress";
import { getCurrentUser, supabaseRest } from "@/lib/supabase-server";

type RequestBody = {
  sessionId?: string;
  durationMs?: number;
};

type SessionRow = {
  id: string;
  completed_at: string | null;
};

type AttemptRow = {
  skill_id: string;
  is_correct: boolean;
  response_time_ms: number;
};

type CompletedDateRow = {
  completed_at: string | null;
};

type MasteryRow = {
  skill_id: string;
  mastery: number | string;
  evidence_count: number;
  correct_count: number;
};

type SkillRow = {
  id: string;
  exam_weight: number | string;
};

type SnapshotRow = {
  central_score: number;
};

type DiagnosticRow = {
  estimated_score: number;
};

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tu dois être connecté pour terminer une séance." }, { status: 401 });

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Les informations de séance sont illisibles." }, { status: 400 });
  }

  const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";
  const durationMs = Math.max(0, Math.min(Number(body.durationMs ?? 0), 3 * 60 * 60 * 1000));
  if (!sessionId || !Number.isFinite(durationMs)) {
    return NextResponse.json({ error: "La séance à terminer n’est pas valide." }, { status: 400 });
  }

  try {
    const sessions = await supabaseRest<SessionRow[]>(
      `study_sessions?select=id,completed_at&id=eq.${sessionId}&user_id=eq.${user.id}&limit=1`
    );
    const session = sessions[0];
    if (!session) return NextResponse.json({ error: "Cette séance est introuvable." }, { status: 404 });

    const attempts = await supabaseRest<AttemptRow[]>(
      `practice_attempts?select=skill_id,is_correct,response_time_ms&session_id=eq.${sessionId}&user_id=eq.${user.id}&order=created_at.asc`
    );
    if (attempts.length === 0) {
      return NextResponse.json({ error: "Aucune réponse n’a été enregistrée pour cette séance." }, { status: 400 });
    }

    const totalQuestions = attempts.length;
    const correctAnswers = attempts.filter((attempt) => attempt.is_correct).length;
    const accuracyRatio = correctAnswers / totalQuestions;
    const completedAt = session.completed_at ?? new Date().toISOString();
    const completedMinutes = Math.max(1, Math.round(durationMs / 60_000));
    const skillMap = new Map<string, { skillId: string; correct: number; total: number }>();

    for (const attempt of attempts) {
      const skill = skillMap.get(attempt.skill_id) ?? { skillId: attempt.skill_id, correct: 0, total: 0 };
      skill.total += 1;
      if (attempt.is_correct) skill.correct += 1;
      skillMap.set(attempt.skill_id, skill);
    }

    const skillSummary = [...skillMap.values()].map((skill) => ({
      ...skill,
      accuracy: Math.round((skill.correct / skill.total) * 100)
    }));

    await supabaseRest<void>(`study_sessions?id=eq.${sessionId}&user_id=eq.${user.id}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        completed_minutes: completedMinutes,
        total_questions: totalQuestions,
        correct_answers: correctAnswers,
        duration_ms: Math.round(durationMs),
        skill_summary: skillSummary,
        completed_at: completedAt
      })
    });

    const [recentSessions, masteries, skills, previousSnapshots, diagnostics] = await Promise.all([
      supabaseRest<CompletedDateRow[]>(
        `study_sessions?select=completed_at&user_id=eq.${user.id}&completed_at=not.is.null&order=completed_at.desc&limit=90`
      ),
      supabaseRest<MasteryRow[]>(
        `user_mastery?select=skill_id,mastery,evidence_count,correct_count&user_id=eq.${user.id}`
      ),
      supabaseRest<SkillRow[]>("skills?select=id,exam_weight"),
      supabaseRest<SnapshotRow[]>(
        `score_snapshots?select=central_score&user_id=eq.${user.id}&order=created_at.desc&limit=1`
      ),
      supabaseRest<DiagnosticRow[]>(
        `diagnostic_runs?select=estimated_score&user_id=eq.${user.id}&order=completed_at.desc&limit=1`
      )
    ]);

    const streak = calculateStreak(
      recentSessions
        .map((item) => item.completed_at)
        .filter((value): value is string => Boolean(value))
    );
    const weightMap = new Map(skills.map((skill) => [skill.id, Number(skill.exam_weight)]));
    const scoreSnapshot = buildPracticeScoreSnapshot({
      previousCentral: previousSnapshots[0]?.central_score,
      diagnosticCentral: diagnostics[0]?.estimated_score,
      sessionAccuracy: accuracyRatio,
      masteries: masteries.map((mastery) => ({
        mastery: Number(mastery.mastery),
        evidenceCount: mastery.evidence_count,
        correctCount: mastery.correct_count,
        examWeight: weightMap.get(mastery.skill_id) ?? 1
      }))
    });

    await supabaseRest<void>("score_snapshots", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        user_id: user.id,
        source: "practice",
        central_score: scoreSnapshot.central,
        score_low: scoreSnapshot.scoreLow,
        score_high: scoreSnapshot.scoreHigh,
        confidence: scoreSnapshot.confidence,
        evidence_count: scoreSnapshot.evidenceCount,
        created_at: completedAt
      })
    });

    await supabaseRest<void>(`user_goals?user_id=eq.${user.id}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ current_score: scoreSnapshot.central })
    });

    return NextResponse.json({
      sessionId,
      totalQuestions,
      correctAnswers,
      accuracy: Math.round(accuracyRatio * 100),
      durationMs: Math.round(durationMs),
      completedMinutes,
      streak,
      skillSummary,
      estimatedScore: scoreSnapshot.central,
      scoreLow: scoreSnapshot.scoreLow,
      scoreHigh: scoreSnapshot.scoreHigh,
      scoreConfidence: scoreSnapshot.confidence
    });
  } catch (error) {
    console.error("Unable to complete practice session", error);
    return NextResponse.json(
      { error: "Le résumé n’a pas pu être enregistré. Vérifie la migration de calibration." },
      { status: 500 }
    );
  }
}
