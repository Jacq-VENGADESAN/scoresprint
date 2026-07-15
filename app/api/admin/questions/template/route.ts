import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin";
import { buildQuestionCsvTemplate } from "@/lib/question-csv";
import { getCurrentUser } from "@/lib/supabase-server";

export async function GET() {
  const user = await getCurrentUser();
  try {
    requireAdminUser(user);
  } catch {
    return NextResponse.json({ error: "Accès administrateur requis." }, { status: user ? 403 : 401 });
  }

  return new NextResponse(buildQuestionCsvTemplate(), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="scoresprint-questions-template.csv"',
      "Cache-Control": "no-store"
    }
  });
}
