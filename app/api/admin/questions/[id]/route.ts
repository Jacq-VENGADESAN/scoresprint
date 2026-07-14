import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin";
import { parseManagedQuestionInput } from "@/lib/admin-question";
import { supabaseAdminRest } from "@/lib/supabase-admin";
import { getCurrentUser } from "@/lib/supabase-server";

type SavedRow = string | { save_managed_question?: string };

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  try {
    requireAdminUser(user);
  } catch {
    return NextResponse.json({ error: "Accès administrateur requis." }, { status: user ? 403 : 401 });
  }

  const { id } = await params;
  try {
    const input = parseManagedQuestionInput({ ...(await request.json() as object), id });
    const result = await supabaseAdminRest<SavedRow>("rpc/save_managed_question", {
      method: "POST",
      body: JSON.stringify({
        p_question_id: id,
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
    const savedId = typeof result === "string" ? result : result?.save_managed_question;
    return NextResponse.json({ id: savedId ?? id });
  } catch (error) {
    console.error("Unable to update managed question", error);
    const message = error instanceof Error && !error.message.startsWith("SUPABASE_ADMIN_")
      ? error.message
      : "La question n’a pas pu être mise à jour. Vérifie les données et la migration d’administration.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}