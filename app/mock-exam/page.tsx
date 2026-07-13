import { redirect } from "next/navigation";
import { MiniExamRunner } from "@/components/mini-exam-runner";
import { getPublicMiniExamQuestions } from "@/lib/mini-exam-bank";
import { getCurrentUser } from "@/lib/supabase-server";

export default async function MockExamPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/mock-exam");

  return (
    <div className="container">
      <header className="page-head">
        <div className="eyebrow">Mesure chronométrée</div>
        <h1>Vérifie ton niveau dans des conditions plus proches d’un test.</h1>
        <p>
          Ce mini-examen original couvre les parties écrites 5, 6 et 7. Il affine ta courbe de score sans utiliser de contenu officiel.
        </p>
      </header>
      <MiniExamRunner questions={getPublicMiniExamQuestions()} />
    </div>
  );
}
