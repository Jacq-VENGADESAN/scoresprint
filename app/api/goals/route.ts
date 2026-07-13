import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, supabaseRest } from "@/lib/supabase-server";

function parseInteger(value: FormDataEntryValue | null) {
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/auth", request.url), { status: 303 });

  const form = await request.formData();
  const currentScore = parseInteger(form.get("current_score"));
  const targetScore = parseInteger(form.get("target_score"));
  const dailyMinutes = parseInteger(form.get("daily_minutes"));
  const examDate = String(form.get("exam_date") ?? "");
  const level = String(form.get("level") ?? "b1");
  const focus = String(form.get("focus") ?? "unknown");

  const scoreIsValid = (score: number | null) => score !== null && score >= 10 && score <= 990;
  if (!scoreIsValid(currentScore) || !scoreIsValid(targetScore) || !dailyMinutes || dailyMinutes < 5 || dailyMinutes > 180) {
    const url = new URL("/onboarding", request.url);
    url.searchParams.set("error", "Vérifie les scores et le temps quotidien indiqués.");
    return NextResponse.redirect(url, { status: 303 });
  }

  try {
    await supabaseRest("user_goals?on_conflict=user_id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify({
        user_id: user.id,
        current_score: currentScore,
        target_score: targetScore,
        exam_date: examDate || null,
        daily_minutes: dailyMinutes,
        level,
        focus
      })
    });
  } catch {
    const url = new URL("/onboarding", request.url);
    url.searchParams.set(
      "error",
      "La base n’est pas encore initialisée. Exécute les migrations SQL Supabase puis réessaie."
    );
    return NextResponse.redirect(url, { status: 303 });
  }

  return NextResponse.redirect(new URL("/diagnostic", request.url), { status: 303 });
}
