import { NextResponse } from "next/server";
import { getAccessToken, getCurrentUser, supabaseRest } from "@/lib/supabase-server";
import { requireSupabaseConfig } from "@/lib/supabase-config";

function accountRedirect(request: Request, key: "updated" | "error", value: string) {
  const url = new URL("/account", request.url);
  url.searchParams.set(key, value);
  return NextResponse.redirect(url, 303);
}

function integer(value: FormDataEntryValue | null) {
  const parsed = Number(String(value ?? ""));
  return Number.isInteger(parsed) ? parsed : null;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  const token = await getAccessToken();
  if (!user || !token) return NextResponse.redirect(new URL("/auth?next=/account", request.url), 303);

  const form = await request.formData();
  const displayName = String(form.get("display_name") ?? "").trim();
  const currentScoreRaw = String(form.get("current_score") ?? "").trim();
  const currentScore = currentScoreRaw ? integer(form.get("current_score")) : null;
  const targetScore = integer(form.get("target_score"));
  const dailyMinutes = integer(form.get("daily_minutes"));
  const examDate = String(form.get("exam_date") ?? "").trim() || null;
  const level = String(form.get("level") ?? "").trim();
  const focus = String(form.get("focus") ?? "").trim();

  if (displayName.length < 2 || displayName.length > 60) {
    return accountRedirect(request, "error", "Le nom affiché doit contenir entre 2 et 60 caractères.");
  }
  if (currentScore !== null && (currentScore < 10 || currentScore > 990)) {
    return accountRedirect(request, "error", "Le score actuel doit être compris entre 10 et 990.");
  }
  if (targetScore === null || targetScore < 10 || targetScore > 990) {
    return accountRedirect(request, "error", "Le score cible doit être compris entre 10 et 990.");
  }
  if (dailyMinutes === null || ![10, 20, 30, 45].includes(dailyMinutes)) {
    return accountRedirect(request, "error", "Choisis une durée quotidienne proposée.");
  }
  if (!new Set(["a2", "b1", "b2", "c1"]).has(level)) {
    return accountRedirect(request, "error", "Le niveau sélectionné est invalide.");
  }
  if (!new Set(["unknown", "listening", "grammar", "vocabulary", "speed"]).has(focus)) {
    return accountRedirect(request, "error", "La priorité sélectionnée est invalide.");
  }
  if (examDate && !/^\d{4}-\d{2}-\d{2}$/.test(examDate)) {
    return accountRedirect(request, "error", "La date d’examen est invalide.");
  }

  try {
    const config = requireSupabaseConfig();
    const authResponse = await fetch(`${config.url}/auth/v1/user`, {
      method: "PUT",
      headers: {
        apikey: config.publishableKey,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ data: { display_name: displayName } })
    });
    if (!authResponse.ok) throw new Error(`AUTH_PROFILE_${authResponse.status}: ${await authResponse.text()}`);

    const now = new Date().toISOString();
    await Promise.all([
      supabaseRest<void>(`profiles?id=eq.${user.id}`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ display_name: displayName, updated_at: now })
      }),
      supabaseRest<void>("user_goals?on_conflict=user_id", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify({
          user_id: user.id,
          current_score: currentScore,
          target_score: targetScore,
          exam_date: examDate,
          daily_minutes: dailyMinutes,
          level,
          focus
        })
      })
    ]);

    return accountRedirect(request, "updated", "1");
  } catch (error) {
    console.error("Unable to update account profile", error);
    return accountRedirect(request, "error", "Les modifications n’ont pas pu être enregistrées.");
  }
}
