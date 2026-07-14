import { redirect } from "next/navigation";
import { MiniExamRunner } from "@/components/mini-exam-runner";
import { UpgradeGate } from "@/components/upgrade-gate";
import { getAccessSummary } from "@/lib/access";
import { getPublicMiniExamQuestions } from "@/lib/mini-exam-bank";
import { getCurrentUser } from "@/lib/supabase-server";

export default async function MockExamPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/mock-exam");

  let access = null;
  let accessReady = true;
  try {
    access = await getAccessSummary(user.id);
  } catch {
    accessReady = false;
  }

  const blocked = Boolean(access && !access.isPremium && (access.miniExam.remaining ?? 0) <= 0);

  return (
    <div className="container">
      <header className="page-head">
        <div className="eyebrow">Mesure chronométrée</div>
        <h1>Vérifie ton niveau dans des conditions plus proches d’un test.</h1>
        <p>
          Ce mini-examen original couvre les parties écrites 5, 6 et 7. Il affine ta courbe de score sans utiliser de contenu officiel.
        </p>
      </header>

      {access && !access.isPremium ? (
        <div className="quota-strip">
          <strong>Compte gratuit</strong>
          <span>{access.miniExam.used}/{access.miniExam.limit} mini-examen utilisé ce mois-ci</span>
          <a href="/pricing">Débloquer les mini-examens illimités →</a>
        </div>
      ) : access?.isPremium ? (
        <div className="quota-strip quota-strip-premium"><strong>Premium</strong><span>Mini-examens illimités activés</span></div>
      ) : null}

      {!accessReady ? (
        <div className="alert alert-warning">La migration des quotas gratuits n’est pas encore accessible. Exécute le nouveau script SQL.</div>
      ) : null}

      {blocked ? (
        <UpgradeGate
          title="Ton mini-examen gratuit du mois est déjà utilisé."
          message="Le compte gratuit comprend un mini-examen chronométré par mois. Premium permet d’en refaire autant que nécessaire."
          resetMessage="Un nouveau mini-examen gratuit sera disponible au début du mois prochain."
        />
      ) : accessReady ? (
        <MiniExamRunner questions={getPublicMiniExamQuestions()} />
      ) : null}
    </div>
  );
}