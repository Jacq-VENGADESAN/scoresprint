import { NextResponse } from "next/server";
import { getCurrentUser, supabaseRest } from "@/lib/supabase-server";

type RequestBody = { runId?: string; durationMs?: number };
type RunRow = { id: string; total_questions: number; completed_at: string | null };
type AttemptRow = { part: 1 | 2; is_correct: boolean; play_count: number; slow_play_count: number };

function breakdown(attempts: AttemptRow[], part: 1 | 2) {
  const selected = attempts.filter((attempt) => attempt.part === part);
  const correct = selected.filter((attempt) => attempt.is_correct).length;
  return {
    correct,
    total: selected.length,
    accuracy: selected.length > 0 ? Math.round((correct / selected.length) * 100) : 0
  };
}

function estimateListeningScore(correct: number, total: number) {
  const accuracy = total > 0 ? correct / total : 0;
  return Math.max(5, Math.min(495, Math.round((5 + 490 * Math.pow(accuracy, 0.92)) / 5) * 5));
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tu dois être connecté pour terminer cette séance." }, { status: 401 });

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Les informations de séance sont illisibles." }, { status: 400 });
  }

  const runId = typeof body.runId === "string" ? body.runId : "";
  const durationMs = Math.max(0, Math.min(Number(body.durationMs ?? 0), 3 * 60 * 60_000));
  if (!runId || !Number.isFinite(durationMs)) {
    return NextResponse.json({ error: "La séance à terminer n’est pas valide." }, { status: 400 });
  }

  try {
    const runs = await supabaseRest<RunRow[]>(
      `listening_runs?select=id,total_questions,completed_at&id=eq.${runId}&user_id=eq.${user.id}&limit=1`
    );
    const run = runs[0];
    if (!run) return NextResponse.json({ error: "Cette séance est introuvable." }, { status: 404 });
    if (run.completed_at) return NextResponse.json({ error: "Cette séance a déjà été enregistrée." }, { status: 409 });

    const attempts = await supabaseRest<AttemptRow[]>(
      `listening_attempts?select=part,is_correct,play_count,slow_play_count&run_id=eq.${runId}&user_id=eq.${user.id}&order=created_at.asc`
    );
    if (attempts.length !== run.total_questions) {
      return NextResponse.json({ error: "Toutes les questions doivent être terminées avant le bilan." }, { status: 400 });
    }

    const correctAnswers = attempts.filter((attempt) => attempt.is_correct).length;
    const accuracy = Math.round((correctAnswers / attempts.length) * 100);
    const estimatedScore = estimateListeningScore(correctAnswers, attempts.length);
    const part1 = breakdown(attempts, 1);
    const part2 = breakdown(attempts, 2);
    const totalPlays = attempts.reduce((sum, attempt) => sum + attempt.play_count, 0);
    const slowPlays = attempts.reduce((sum, attempt) => sum + attempt.slow_play_count, 0);
    const completedAt = new Date().toISOString();

    await supabaseRest<void>(`listening_runs?id=eq.${runId}&user_id=eq.${user.id}&completed_at=is.null`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        correct_answers: correctAnswers,
        estimated_score: estimatedScore,
        duration_ms: Math.round(durationMs),
        part1_breakdown: part1,
        part2_breakdown: part2,
        completed_at: completedAt
      })
    });

    return NextResponse.json({
      runId,
      totalQuestions: attempts.length,
      correctAnswers,
      accuracy,
      estimatedScore,
      durationMs: Math.round(durationMs),
      part1,
      part2,
      totalPlays,
      slowPlays,
      confidence: attempts.length >= 15 ? "moyenne" : "faible"
    });
  } catch (error) {
    console.error("Unable to complete listening session", error);
    return NextResponse.json({ error: "Le bilan d’écoute n’a pas pu être enregistré." }, { status: 500 });
  }
}
