import { notFound, redirect } from "next/navigation";
import { CuratedSeedInstaller } from "@/components/curated-seed-installer";
import { isAdminUser } from "@/lib/admin";
import { CURATED_QUESTION_SEED, CURATED_QUESTION_SEED_COUNTS } from "@/lib/curated-question-seed";
import { supabaseAdminRest } from "@/lib/supabase-admin";
import { getCurrentUser } from "@/lib/supabase-server";

type CodeRow = { code: string | null };

export default async function CuratedQuestionSeedPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/admin/questions/seed");
  if (!isAdminUser(user)) notFound();

  const rows = await supabaseAdminRest<CodeRow[]>("questions?select=code&code=not.is.null&limit=5000");
  const existingCodes = new Set(rows.map((row) => row.code).filter((code): code is string => Boolean(code)));
  const installed = CURATED_QUESTION_SEED.filter((question) => existingCodes.has(question.code)).length;
  const remaining = CURATED_QUESTION_SEED_COUNTS.total - installed;

  return (
    <div className="container admin-page">
      <header className="page-head">
        <div className="eyebrow">Banque de contenu ScoreSprint</div>
        <h1>Ajoute directement 200 questions originales.</h1>
        <p>Le lot est installé dans Supabase, les questions sont publiées et les codes déjà présents sont ignorés.</p>
      </header>

      <CuratedSeedInstaller
        total={CURATED_QUESTION_SEED_COUNTS.total}
        installed={installed}
        remaining={remaining}
        part5={CURATED_QUESTION_SEED_COUNTS.part5}
        part6={CURATED_QUESTION_SEED_COUNTS.part6}
        part7={CURATED_QUESTION_SEED_COUNTS.part7}
      />
    </div>
  );
}
