import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin";
import { parseManagedQuestionInput } from "@/lib/admin-question";
import { supabaseAdminRest } from "@/lib/supabase-admin";
import { getCurrentUser } from "@/lib/supabase-server";

type SavedRow = string | { save_managed_question?: string };

export async function POST(request: Request) {
  const user = await getCurrentUser();
  try {
    requireAdminUser(user);
  } catch {
    return NextResponse.json({ error: "Accès administrateur requis." }, { status: user ? 403 : 401 });
  }

  try {
    const input = parseManagedQuestionInput(await request.json());
    const result = await supabaseAdminRest<SavedRow>("rpc/save_managed_question", {
      method: "POST",
      body: JSON.stringify({
        p_question_id: null,
        p_code: input.code,
        p_part: input.part,
        p_skill_id: input.skillId,
        p_subskill: input.subskill,
        p_difficulty: input.difficulty,
        p_target_time_ms: Math.round(input.targetTimeSeconds * 1000),
        p_prompt: input.prompt,
        p_context: input.context || null,
        p_explanation: input.explanation,
        p_trap: input.trap || null,
        p_status: input.status,
        p_options: input.options,
        p_admin_email: user?.email ?? "admin"
      })
    });
    const id = typeof result === "string" ? result : result?.save_managed_question;
    return NextResponse.json({ id });
  } catch (error) {
    console.error("Unable to create managed question", error);
    const message = error instanceof Error && !error.message.startsWith("SUPABASE_ADMIN_")
      ? error.message
      : "La question n’a pas pu être créée. Vérifie le code et la migration d’administration.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}