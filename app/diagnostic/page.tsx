import { redirect } from "next/navigation";
import { DiagnosticRunner } from "@/components/diagnostic-runner";
import { getPublicDiagnosticQuestions } from "@/lib/diagnostic-bank";
import { getCurrentUser, supabaseRest } from "@/lib/supabase-server";

type GoalId = { id: string };

export default async function DiagnosticPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/diagnostic");

  try {
    const goals = await supabaseRest<GoalId[]>(`user_goals?select=id&user_id=eq.${user.id}&limit=1`);
    if (!goals[0]) redirect("/onboarding");
  } catch {
    // La page affichera encore le diagnostic ; l’API fournira une erreur claire si la migration manque.
  }

  const questions = getPublicDiagnosticQuestions();

  return (
    <div className="container">
      <header className="page-head">
        <div className="eyebrow">Diagnostic personnalisé</div>
        <h1>{questions.length} questions pour trouver tes vraies priorités.</h1>
        <p>
          Réponds sans dictionnaire et sans revenir en arrière. Les bonnes réponses ne sont pas affichées pendant le test afin de ne pas fausser l’analyse.
        </p>
      </header>
      <DiagnosticRunner questions={questions} />
      <p className="footer-note">
        Le résultat est une estimation interne à ScoreSprint. Il ne constitue pas un résultat officiel au test TOEIC®.
      </p>
    </div>
  );
}
