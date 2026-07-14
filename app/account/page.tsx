import Link from "next/link";
import { redirect } from "next/navigation";
import { accessLabel, getAccessSummary } from "@/lib/access";
import { stripeIsConfigured } from "@/lib/stripe";
import { getCurrentUser, supabaseRest } from "@/lib/supabase-server";

function formatDate(value: string | null) {
  if (!value) return "Sans expiration";
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value));
}

function UsageCard({ label, used, limit, period }: { label: string; used: number; limit: number | null; period: string }) {
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

type CustomerRow = { stripe_customer_id: string | null };

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ portal?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/account");
  const params = await searchParams;

  let access;
  let hasStripeCustomer = false;
  try {
    [access, hasStripeCustomer] = await Promise.all([
      getAccessSummary(user.id),
      supabaseRest<CustomerRow[]>(`subscriptions?select=stripe_customer_id&user_id=eq.${user.id}&stripe_customer_id=not.is.null&limit=1`)
        .then((rows) => Boolean(rows[0]?.stripe_customer_id))
    ]);
  } catch {
    return (
      <div className="container account-page">
        <header className="page-head"><div className="eyebrow">Mon accès</div><h1>Ton compte ScoreSprint</h1></header>
        <div className="alert alert-warning">Les migrations des accès ou des paiements ne sont pas encore accessibles.</div>
      </div>
    );
  }

  const portalMessage = params.portal === "unavailable"
    ? "Aucun compte de paiement Stripe n’est encore associé à ce compte."
    : params.portal === "error"
      ? "Le portail Stripe n’a pas pu être ouvert. Vérifie sa configuration dans Stripe."
      : null;

  return (
    <div className="container account-page">
      <header className="page-head">
        <div className="eyebrow">Mon accès</div>
        <h1>Gère ton niveau d’accès et suis tes quotas.</h1>
        <p>Les limites et les activations Premium sont vérifiées côté serveur.</p>
      </header>

      {portalMessage ? <div className="alert alert-warning">{portalMessage}</div> : null}

      <section className={`card account-plan-card ${access.isPremium ? "account-plan-premium" : ""}`}>
        <div>
          <span className="badge">{accessLabel(access)}</span>
          <h2>{access.isPremium ? "Ton accès Premium est actif." : "Tu utilises actuellement l’offre gratuite."}</h2>
          <p className="muted-copy">
            {access.isPremium
              ? `Accès valable jusqu’au ${formatDate(access.accessEndsAt)}. Un nouvel achat prolonge l’accès à partir de cette date.`
              : "Tu peux découvrir le diagnostic, travailler chaque jour et mesurer ton niveau avant de choisir une formule payante."}
          </p>
        </div>
        <Link href="/pricing" className="btn btn-primary">{access.isPremium ? "Prolonger mon accès" : "Passer à Premium"}</Link>
      </section>

      <section className="card panel account-usage-panel">
        <div className="panel-title"><h2>Utilisation actuelle</h2><span className="badge">Mise à jour en temps réel</span></div>
        <div className="usage-grid">
          <UsageCard label="Séances aujourd’hui" used={access.practice.used} limit={access.practice.limit} period={access.isPremium ? "Aucune limite quotidienne" : "Réinitialisation chaque jour"} />
          <UsageCard label="Mini-examens ce mois-ci" used={access.miniExam.used} limit={access.miniExam.limit} period={access.isPremium ? "Aucune limite mensuelle" : "Réinitialisation au début du mois"} />
          <UsageCard label="Historique" used={access.historyDays ?? 0} limit={access.historyDays} period={access.historyDays === null ? "Historique complet" : `${access.historyDays} derniers jours accessibles`} />
        </div>
      </section>

      <section className="card panel billing-foundation-note">
        <div>
          <h2>Paiements sécurisés par Stripe</h2>
          <p className="muted-copy">ScoreSprint ne stocke aucune donnée bancaire. Stripe gère le paiement, les reçus et l’historique de facturation.</p>
        </div>
        <div className="account-billing-actions">
          {stripeIsConfigured() && hasStripeCustomer ? (
            <form action="/api/billing/portal" method="post"><button type="submit" className="btn btn-secondary">Gérer mes paiements</button></form>
          ) : null}
          <Link href="/dashboard" className="btn btn-secondary">Retour à ma progression</Link>
        </div>
      </section>
    </div>
  );
}
