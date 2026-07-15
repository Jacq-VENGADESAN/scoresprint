import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin";
import { CURATED_QUESTION_SEED } from "@/lib/curated-question-seed";
import { supabaseAdminRest } from "@/lib/supabase-admin";
import { getCurrentUser } from "@/lib/supabase-server";

type CodeRow = { code: string | null };

type ImportResult = number | { import_managed_questions?: number };

function chunks<T>(items: T[], size: number) {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) result.push(items.slice(index, index + size));
  return result;
}

export async function POST() {
  const user = await getCurrentUser();
  try {
    requireAdminUser(user);
  } catch {
    return NextResponse.json({ error: "Accès administrateur requis." }, { status: user ? 403 : 401 });
  }

  try {
    const existingRows = await supabaseAdminRest<CodeRow[]>("questions?select=code&code=not.is.null&limit=5000");
    const existingCodes = new Set(existingRows.map((row) => row.code).filter((code): code is string => Boolean(code)));
    const pending = CURATED_QUESTION_SEED.filter((question) => !existingCodes.has(question.code));

    let imported = 0;
    for (const batch of chunks(pending, 50)) {
      const result = await supabaseAdminRest<ImportResult>("rpc/import_managed_questions", {
        method: "POST",
        body: JSON.stringify({
          p_questions: batch,
          p_admin_email: user?.email ?? "admin"
        })
      });
      imported += typeof result === "number" ? result : result?.import_managed_questions ?? batch.length;
    }

    return NextResponse.json({
      imported,
      alreadyPresent: CURATED_QUESTION_SEED.length - pending.length,
      total: CURATED_QUESTION_SEED.length
    });
  } catch (error) {
    console.error("Unable to install curated question bank", error);
    return NextResponse.json(
      { error: "La banque n’a pas pu être installée. Vérifie que la migration d’import CSV a bien été exécutée." },
      { status: 500 }
    );
  }
}
