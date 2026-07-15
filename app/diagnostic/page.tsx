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
    // L’API renverra une erreur explicite si la migration manque.
  }

  const questions = getPublicDiagnosticQuestions();

  return (
    <div className="container focus-page">
      <header className="page-head page-head-compact">
        <div className="eyebrow">Diagnostic personnalisé</div>
        <h1>{questions.length} questions pour établir ton point de départ.</h1>
        <p>Réponds sans dictionnaire et sans revenir en arrière. Aucune correction n’est affichée avant la fin afin de préserver la mesure.</p>
      </header>
      <DiagnosticRunner questions={questions} />
      <p className="footer-note" style={{ maxWidth: 900, margin: "0 auto 50px", textAlign: "center" }}>
        Le résultat est une estimation interne à ScoreSprint et ne constitue pas un score officiel au test TOEIC®.
      </p>
    </div>
  );
}
