import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin";
import { parseManagedQuestionInput, type ManagedQuestionInput } from "@/lib/admin-question";
import { supabaseAdminRest } from "@/lib/supabase-admin";
import { getCurrentUser } from "@/lib/supabase-server";

type ExistingCodeRow = { code: string | null };
type ImportRpcResult = number | { import_managed_questions?: number };

type Body = {
  questions?: unknown;
  dryRun?: unknown;
};

function parseQuestions(value: unknown): ManagedQuestionInput[] {
  if (!Array.isArray(value)) throw new Error("Le corps doit contenir une liste de questions.");
  if (value.length === 0) throw new Error("Aucune question à importer.");
  if (value.length > 500) throw new Error("Un import est limité à 500 questions.");
  const questions = value.map(parseManagedQuestionInput);
  const codes = new Set<string>();
  for (const question of questions) {
    if (codes.has(question.code)) throw new Error(`Le code ${question.code} apparaît plusieurs fois.`);
    codes.add(question.code);
  }
  return questions;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  try {
    requireAdminUser(user);
  } catch {
    return NextResponse.json({ error: "Accès administrateur requis." }, { status: user ? 403 : 401 });
  }

  try {
    const body = await request.json() as Body;
    const questions = parseQuestions(body.questions);
    const existingRows = await supabaseAdminRest<ExistingCodeRow[]>(
      "questions?select=code&code=not.is.null&limit=10000"
    );
    const existing = new Set(existingRows.map((row) => row.code).filter((code): code is string => Boolean(code)));
    const duplicateCodes = questions.map((question) => question.code).filter((code) => existing.has(code));

    if (Boolean(body.dryRun)) {
      return NextResponse.json({ duplicateCodes });
    }
    if (duplicateCodes.length > 0) {
      return NextResponse.json({ error: `Codes déjà utilisés : ${duplicateCodes.join(", ")}.`, duplicateCodes }, { status: 409 });
    }

    const result = await supabaseAdminRest<ImportRpcResult>("rpc/import_managed_questions", {
      method: "POST",
      body: JSON.stringify({
        p_questions: questions,
        p_admin_email: user?.email ?? "admin"
      })
    });
    const imported = typeof result === "number" ? result : result?.import_managed_questions ?? questions.length;
    return NextResponse.json({ imported, duplicateCodes: [] });
  } catch (error) {
    console.error("Unable to import managed questions", error);
    const message = error instanceof Error && !error.message.startsWith("SUPABASE_ADMIN_")
      ? error.message
      : "L’import a échoué. Vérifie la migration et le contenu du fichier.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
