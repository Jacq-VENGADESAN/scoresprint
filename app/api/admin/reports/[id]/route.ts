import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin";
import { supabaseAdminRest } from "@/lib/supabase-admin";
import { getCurrentUser } from "@/lib/supabase-server";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  try {
    requireAdminUser(user);
  } catch {
    return NextResponse.json({ error: "Accès administrateur requis." }, { status: user ? 403 : 401 });
  }

  const { id } = await context.params;
  const body = await request.json() as { status?: unknown };
  const status = typeof body.status === "string" ? body.status : "";
  if (!id || !["resolved", "dismissed"].includes(status)) {
    return NextResponse.json({ error: "Mise à jour invalide." }, { status: 400 });
  }

  try {
    await supabaseAdminRest<void>(`question_reports?id=eq.${encodeURIComponent(id)}&status=eq.open`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ status, reviewed_at: new Date().toISOString(), reviewed_by: user?.email ?? "admin" })
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unable to moderate question report", error);
    return NextResponse.json({ error: "Le signalement n’a pas pu être mis à jour." }, { status: 500 });
  }
}
