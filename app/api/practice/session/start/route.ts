import { NextResponse } from "next/server";
import { getCurrentUser, supabaseRest } from "@/lib/supabase-server";

type RequestBody = {
  plannedMinutes?: number;
  mode?: string;
  questionIds?: string[];
};

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tu dois être connecté pour démarrer une séance." }, { status: 401 });

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Les informations de séance sont illisibles." }, { status: 400 });
  }

  const plannedMinutes = Math.max(5, Math.min(180, Math.round(Number(body.plannedMinutes ?? 20))));
  const mode = body.mode === "review" ? "review" : "adaptive";
  const questionIds = Array.isArray(body.questionIds)
    ? [...new Set(body.questionIds.filter((value): value is string => typeof value === "string"))].slice(0, 30)
    : [];

  if (questionIds.length === 0) {
    return NextResponse.json({ error: "Aucune question n’est associée à cette séance." }, { status: 400 });
  }

  try {
    const rows = await supabaseRest<Array<{ id: string; started_at: string }>>("study_sessions", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        user_id: user.id,
        planned_minutes: plannedMinutes,
        completed_minutes: 0,
        mode,
        total_questions: questionIds.length,
        correct_answers: 0,
        duration_ms: 0,
        plan: { questionIds, mode },
        started_at: new Date().toISOString()
      })
    });

    const session = rows[0];
    if (!session) throw new Error("La séance n’a pas reçu d’identifiant.");
    return NextResponse.json({ sessionId: session.id, startedAt: session.started_at });
  } catch (error) {
    console.error("Unable to start practice session", error);
    return NextResponse.json(
      { error: "La séance n’a pas pu être créée. Vérifie la migration des statistiques." },
      { status: 500 }
    );
  }
}
