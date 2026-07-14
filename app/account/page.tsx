import Link from "next/link";
import { redirect } from "next/navigation";
import { accessLabel, getAccessSummary } from "@/lib/access";
import { getCurrentUser } from "@/lib/supabase-server";

function formatDate(value: string | null) {
  if (!value) return "Sans expiration";
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value));
}

function UsageCard({
  label,
  used,
  limit,
  period
}: {
  label: string;
  used: number;
  limit: number | null;
  period: string;
}) {
  const unlimited = limit === null;
  const percentage = unlimited ? 0 : Math.min(100, Math.round((used / Math.max(1, limit)) * 100));
  return (
    <div className="usage-card">
      <div className="usage-card-head"><strong>{label}</strong><span>{unlimited ? "Illimité" : `${used}/${limit}`}</span></div>
      {!unlimited ? <div className="usage-meter"><div style={{ width: `${percentage}%` }} /></div> : null}
      <small>{period}</small>
    </div>
  );
}

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/account");

  let access;
  try {
    access = await getAccessSummary(user.id);
  } catch {
    return (
      <div className="container account-page">
        <header className="page-head"><div className="eyebrow">Mon accès</div><h1>Ton compte ScoreSprint</h1></header>
        <div className="alert alert-warning">La migration des quotas gratuits n’est pas encore accessible. Exécute le nouveau script SQL.</div>
      </div>
    );
  }

  return (
    <div className="container account-page">
      <header className="page-head">
        <div className="eyebrow">Mon accès</div>
        <h1>Gère ton niveau d’accès et suis tes quotas.</h1>
        <p>Les limites sont vérifiées côté serveur. Masquer un bouton dans le navigateur ne permet donc pas de contourner le compte gratuit.</p>
      </header>

      <section className={`card account-plan-card ${access.isPremium ? "account-plan-premium" : ""}`}>
        <div>
          <span className="badge">{accessLabel(access)}</span>
          <h2>{access.isPremium ? "Ton accès Premium est actif." : "Tu utilises actuellement l’offre gratuite."}</h2>
          <p className="muted-copy">
            {access.isPremium
              ? `Accès valable jusqu’au ${formatDate(access.accessEndsAt)}.`
              : "Tu peux découvrir le diagnostic, travailler chaque jour et mesurer ton niveau avant de choisir une formule payante."}
          </p>
        </div>
        <Link href="/pricing" className="btn btn-primary">{access.isPremium ? "Voir les offres" : "Passer à Premium"}</Link>
      </section>

      <section className="card panel account-usage-panel">
        <div className="panel-title"><h2>Utilisation actuelle</h2><span className="badge">Mise à jour en temps réel</span></div>
        <div className="usage-grid">
          <UsageCard
            label="Séances aujourd’hui"
            used={access.practice.used}
            limit={access.practice.limit}
            period={access.isPremium ? "Aucune limite quotidienne" : "Réinitialisation chaque jour"}
          />
          <UsageCard
            label="Mini-examens ce mois-ci"
            used={access.miniExam.used}
            limit={access.miniExam.limit}
            period={access.isPremium ? "Aucune limite mensuelle" : "Réinitialisation au début du mois"}
          />
          <UsageCard
            label="Historique"
            used={access.historyDays ?? 0}
            limit={access.historyDays}
            period={access.historyDays === null ? "Historique complet" : `${access.historyDays} derniers jours accessibles`}
          />
        </div>
      </section>

      <section className="card panel billing-foundation-note">
        <div>
          <h2>Paiement pas encore activé</h2>
          <p className="muted-copy">L’architecture des accès est prête pour Stripe, mais aucun bouton ne prélève encore d’argent. La prochaine phase connectera Checkout et activera automatiquement un accès de 30 ou 90 jours.</p>
        </div>
        <Link href="/dashboard" className="btn btn-secondary">Retour à ma progression</Link>
      </section>
    </div>
  );
}