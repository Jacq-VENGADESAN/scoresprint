import { NextResponse } from "next/server";
import { hasListeningQuestion, type ListeningMode } from "@/lib/listening-bank";
import { getCurrentUser, supabaseRest } from "@/lib/supabase-server";

type RequestBody = {
  mode?: ListeningMode;
  questionIds?: string[];
};

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tu dois être connecté pour démarrer l’écoute." }, { status: 401 });

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Les informations de séance sont illisibles." }, { status: 400 });
  }

  const mode: ListeningMode = body.mode === "part1" || body.mode === "part2" ? body.mode : "mixed";
  const questionIds = Array.isArray(body.questionIds)
    ? [...new Set(body.questionIds.filter((id): id is string => typeof id === "string" && hasListeningQuestion(id)))].slice(0, 20)
    : [];

  if (questionIds.length === 0) {
    return NextResponse.json({ error: "Aucune question d’écoute valide n’a été fournie." }, { status: 400 });
  }

  try {
    const rows = await supabaseRest<Array<{ id: string; started_at: string }>>("listening_runs", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        user_id: user.id,
        mode,
        total_questions: questionIds.length,
        correct_answers: 0,
        started_at: new Date().toISOString()
      })
    });
    const run = rows[0];
    if (!run) throw new Error("MISSING_LISTENING_RUN");
    return NextResponse.json({ runId: run.id, startedAt: run.started_at });
  } catch (error) {
    console.error("Unable to start listening session", error);
    return NextResponse.json({ error: "La séance d’écoute n’a pas pu démarrer. Vérifie la migration Listening." }, { status: 500 });
  }
}
