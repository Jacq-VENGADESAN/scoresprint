import { redirect } from "next/navigation";
import { MiniExamRunner } from "@/components/mini-exam-runner";
import { UpgradeGate } from "@/components/upgrade-gate";
import { getAccessSummary, type AccessSummary } from "@/lib/access";
import { getPublicMiniExamQuestions } from "@/lib/mini-exam-bank";
import { getCurrentUser } from "@/lib/supabase-server";

export default async function MockExamPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/mock-exam");

  let access: AccessSummary | null = null;
  let accessReady = true;
  try { access = await getAccessSummary(user.id); } catch { accessReady = false; }

  const blocked = Boolean(access && !access.isPremium && (access.miniExam.remaining ?? 0) <= 0);

  return (
    <div className="container focus-page">
      <header className="page-head page-head-compact">
        <div className="eyebrow">Mesure chronométrée</div>
        <h1>Teste ton niveau dans un cadre plus exigeant.</h1>
        <p>Trente questions originales couvrent les parties écrites 5, 6 et 7. Cette mesure affine davantage la courbe que la séance quotidienne.</p>
      </header>

      {access && !access.isPremium ? (
        <div className="quota-strip"><strong>Compte gratuit</strong><span>{access.miniExam.used}/{access.miniExam.limit} mini-examen utilisé ce mois-ci</span><a href="/pricing">Voir les accès Premium →</a></div>
      ) : access?.isPremium ? (
        <div className="quota-strip quota-strip-premium"><strong>Premium</strong><span>Mini-examens illimités activés</span></div>
      ) : null}

      {!accessReady ? <div className="alert alert-warning">Les quotas gratuits ne sont pas encore accessibles.</div> : null}

      {blocked ? (
        <UpgradeGate title="Ton mini-examen gratuit du mois est déjà utilisé." message="Le compte gratuit comprend un mini-examen chronométré par mois." resetMessage="Un nouveau mini-examen gratuit sera disponible au début du mois prochain." />
      ) : accessReady ? (
        <MiniExamRunner questions={getPublicMiniExamQuestions()} />
      ) : null}
    </div>
  );
}
