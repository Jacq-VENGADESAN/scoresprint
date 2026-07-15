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
  const percentage = unlimited ? 100 : Math.min(100, Math.round((used / Math.max(1, limit)) * 100));
  return (
    <div className="usage-card">
      <div className="usage-card-head"><strong>{label}</strong><span>{unlimited ? "Illimité" : `${used}/${limit}`}</span></div>
      <div className="usage-meter" aria-label={unlimited ? `${label} illimité` : `${percentage}% du quota utilisé`}><div style={{ width: `${percentage}%` }} /></div>
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
        <header className="page-head"><div><div className="eyebrow">Mon compte</div><h1>Ton espace ScoreSprint</h1></div></header>
        <div className="alert alert-warning">Les informations d’accès ou de paiement ne sont pas encore accessibles.</div>
      </div>
    );
  }

  const portalMessage = params.portal === "unavailable"
    ? "Aucun compte de paiement Stripe n’est encore associé à ce compte."
    : params.portal === "error"
      ? "Le portail Stripe n’a pas pu être ouvert. Vérifie sa configuration puis réessaie."
      : null;
  const displayName = user.user_metadata?.display_name ?? user.email?.split("@")[0] ?? "Utilisateur";

  return (
    <div className="container account-page">
      <header className="page-head">
        <div>
          <div className="eyebrow">Mon compte</div>
          <h1>Bonjour {displayName}, gère ton accès sans ambiguïté.</h1>
          <p>Ton plan, tes quotas et tes paiements sont regroupés au même endroit.</p>
        </div>
        <Link href="/dashboard" className="btn btn-secondary">Retour au tableau de bord</Link>
      </header>

      {portalMessage ? <div className="alert alert-warning">{portalMessage}</div> : null}

      <section className={`card account-plan-card ${access.isPremium ? "account-plan-premium" : ""}`}>
        <div>
          <span className="badge">{accessLabel(access)}</span>
          <h2>{access.isPremium ? "Ton accès Premium est actif." : "Tu utilises l’accès gratuit."}</h2>
          <p className="muted-copy">
            {access.isPremium
              ? `Toutes les fonctionnalités sont disponibles jusqu’au ${formatDate(access.accessEndsAt)}. Un nouvel achat ajoutera sa durée après cette date.`
              : "Tu peux faire le diagnostic, une séance par jour et un mini-examen par mois. Aucun renouvellement automatique n’est associé à ton compte."}
          </p>
        </div>
        <Link href="/pricing" className="btn btn-primary">{access.isPremium ? "Prolonger mon accès" : "Comparer les accès"}</Link>
      </section>

      <section className="card panel account-usage-panel">
        <div className="panel-title">
          <div><h2>Utilisation actuelle</h2><p className="muted-copy" style={{ margin: "4px 0 0", fontSize: ".84rem" }}>Les quotas sont vérifiés côté serveur et se mettent à jour après chaque activité.</p></div>
          <span className="badge">Temps réel</span>
        </div>
        <div className="usage-grid">
          <UsageCard label="Séances aujourd’hui" used={access.practice.used} limit={access.practice.limit} period={access.isPremium ? "Aucune limite quotidienne" : "Réinitialisation demain"} />
          <UsageCard label="Mini-examens ce mois-ci" used={access.miniExam.used} limit={access.miniExam.limit} period={access.isPremium ? "Aucune limite mensuelle" : "Réinitialisation au début du mois"} />
          <UsageCard label="Historique accessible" used={access.historyDays ?? 0} limit={access.historyDays} period={access.historyDays === null ? "Toutes les activités restent disponibles" : `${access.historyDays} derniers jours`} />
        </div>
      </section>

      <section className="card panel billing-foundation-note">
        <div>
          <h2>Paiements et reçus</h2>
          <p className="muted-copy">Stripe héberge le paiement et conserve les reçus. ScoreSprint ne stocke aucune donnée bancaire.</p>
        </div>
        <div className="account-billing-actions">
          {stripeIsConfigured() && hasStripeCustomer ? (
            <form action="/api/billing/portal" method="post"><button type="submit" className="btn btn-secondary">Ouvrir le portail Stripe</button></form>
          ) : null}
          <Link href="/pricing" className="btn btn-secondary">Voir les tarifs</Link>
        </div>
      </section>

      <section className="card panel" style={{ marginTop: 20 }}>
        <div className="panel-title"><div><h2>Identité du compte</h2><p className="muted-copy" style={{ margin: "4px 0 0", fontSize: ".84rem" }}>Ces informations permettent de retrouver ton espace.</p></div></div>
        <div className="stats">
          <div className="stat"><div className="stat-label">Nom affiché</div><div className="stat-value" style={{ fontSize: "1.1rem" }}>{displayName}</div></div>
          <div className="stat"><div className="stat-label">Adresse e-mail</div><div className="stat-value" style={{ fontSize: "1rem", overflowWrap: "anywhere" }}>{user.email ?? "—"}</div></div>
          <div className="stat"><div className="stat-label">État de l’accès</div><div className="stat-value" style={{ fontSize: "1.1rem" }}>{access.isPremium ? "Premium" : "Gratuit"}</div></div>
        </div>
      </section>
    </div>
  );
}
