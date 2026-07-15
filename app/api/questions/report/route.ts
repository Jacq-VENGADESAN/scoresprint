import { NextResponse } from "next/server";
import { getCurrentUser, supabaseRest } from "@/lib/supabase-server";

const CATEGORIES = new Set(["ambiguous", "incorrect_answer", "typo", "explanation", "other"]);

type Body = {
  questionCode?: unknown;
  category?: unknown;
  details?: unknown;
  selectedOption?: unknown;
};

type ExistingReport = { id: string };

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });

  try {
    const body = await request.json() as Body;
    const questionCode = text(body.questionCode, 80);
    const category = text(body.category, 40);
    const details = text(body.details, 2000);
    const selectedOption = text(body.selectedOption, 4);

    if (!/^[a-z0-9][a-z0-9-]{2,79}$/.test(questionCode)) {
      return NextResponse.json({ error: "Question inconnue." }, { status: 400 });
    }
    if (!CATEGORIES.has(category)) {
      return NextResponse.json({ error: "Choisis un motif de signalement." }, { status: 400 });
    }

    const existing = await supabaseRest<ExistingReport[]>(
      `question_reports?select=id&user_id=eq.${user.id}&question_code=eq.${encodeURIComponent(questionCode)}&status=eq.open&limit=1`
    );
    if (existing.length > 0) {
      return NextResponse.json({ error: "Tu as déjà un signalement ouvert pour cette question." }, { status: 409 });
    }

    await supabaseRest<void>("question_reports", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        user_id: user.id,
        question_code: questionCode,
        category,
        details: details || null,
        selected_option: selectedOption || null
      })
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unable to report question", error);
    return NextResponse.json({ error: "Le signalement n’a pas pu être enregistré." }, { status: 500 });
  }
}
