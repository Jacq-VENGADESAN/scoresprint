import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountPasswordForm } from "@/components/account-password-form";
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
type Goal = {
  current_score: number | null;
  target_score: number;
  exam_date: string | null;
  daily_minutes: number;
  level: string | null;
  focus: string | null;
};

type AccountPageProps = {
  searchParams: Promise<{ portal?: string; updated?: string; error?: string }>;
};

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/account");
  const params = await searchParams;

  let access;
  let hasStripeCustomer = false;
  let goal: Goal | null = null;
  try {
    [access, hasStripeCustomer, goal] = await Promise.all([
      getAccessSummary(user.id),
      supabaseRest<CustomerRow[]>(`subscriptions?select=stripe_customer_id&user_id=eq.${user.id}&stripe_customer_id=not.is.null&limit=1`)
        .then((rows) => Boolean(rows[0]?.stripe_customer_id)),
      supabaseRest<Goal[]>(`user_goals?select=current_score,target_score,exam_date,daily_minutes,level,focus&user_id=eq.${user.id}&limit=1`)
        .then((rows) => rows[0] ?? null)
    ]);
  } catch {
    return (
      <div className="container account-page">
        <header className="page-head"><div><div className="eyebrow">Mon compte</div><h1>Ton espace ScoreSprint</h1></div></header>
        <div className="alert alert-warning">Les informations du compte ne sont pas encore accessibles.</div>
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
          <h1>Bonjour {displayName}, ton espace est entièrement modifiable.</h1>
          <p>Gère ton objectif, ta sécurité, tes données et ton accès depuis une seule page.</p>
        </div>
        <Link href="/dashboard" className="btn btn-secondary">Retour au tableau de bord</Link>
      </header>

      {portalMessage ? <div className="alert alert-warning">{portalMessage}</div> : null}
      {params.updated ? <div className="alert alert-success">Tes informations et ton programme ont été mis à jour.</div> : null}
      {params.error ? <div className="alert alert-error">{params.error}</div> : null}

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
          <div><h2>Utilisation actuelle</h2><p className="muted-copy account-section-copy">Les quotas se mettent à jour après chaque activité terminée.</p></div>
          <span className="badge">Temps réel</span>
        </div>
        <div className="usage-grid">
          <UsageCard label="Séances aujourd’hui" used={access.practice.used} limit={access.practice.limit} period={access.isPremium ? "Aucune limite quotidienne" : "Réinitialisation demain"} />
          <UsageCard label="Mini-examens ce mois-ci" used={access.miniExam.used} limit={access.miniExam.limit} period={access.isPremium ? "Aucune limite mensuelle" : "Réinitialisation au début du mois"} />
          <UsageCard label="Historique accessible" used={access.historyDays ?? 0} limit={access.historyDays} period={access.historyDays === null ? "Toutes les activités restent disponibles" : `${access.historyDays} derniers jours`} />
        </div>
      </section>

      <section className="card panel account-settings-card">
        <div className="panel-title">
          <div><div className="eyebrow">Programme personnel</div><h2>Profil et objectif</h2><p className="muted-copy account-section-copy">Une modification est prise en compte dès la prochaine séance adaptative.</p></div>
        </div>
        <form className="form-grid account-profile-form" action="/api/account/profile" method="post">
          <div className="field full-width">
            <label htmlFor="account-display-name">Prénom ou pseudo</label>
            <input id="account-display-name" name="display_name" defaultValue={displayName} minLength={2} maxLength={60} required />
          </div>
          <div className="field">
            <label htmlFor="account-current-score">Score actuel estimé</label>
            <input id="account-current-score" name="current_score" type="number" min="10" max="990" defaultValue={goal?.current_score ?? ""} placeholder="Ex. 650" />
          </div>
          <div className="field">
            <label htmlFor="account-target-score">Score cible</label>
            <input id="account-target-score" name="target_score" type="number" min="10" max="990" defaultValue={goal?.target_score ?? 850} required />
          </div>
          <div className="field">
            <label htmlFor="account-exam-date">Date de l’examen</label>
            <input id="account-exam-date" name="exam_date" type="date" defaultValue={goal?.exam_date ?? ""} />
          </div>
          <div className="field">
            <label htmlFor="account-daily-minutes">Temps quotidien</label>
            <select id="account-daily-minutes" name="daily_minutes" defaultValue={String(goal?.daily_minutes ?? 20)}>
              <option value="10">10 minutes</option>
              <option value="20">20 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="account-level">Niveau d’anglais</label>
            <select id="account-level" name="level" defaultValue={goal?.level ?? "b1"}>
              <option value="a2">A2 — Élémentaire</option>
              <option value="b1">B1 — Intermédiaire</option>
              <option value="b2">B2 — Avancé</option>
              <option value="c1">C1 — Autonome</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="account-focus">Priorité ressentie</label>
            <select id="account-focus" name="focus" defaultValue={goal?.focus ?? "unknown"}>
              <option value="unknown">Je ne sais pas encore</option>
              <option value="listening">Compréhension orale</option>
              <option value="grammar">Grammaire</option>
              <option value="vocabulary">Vocabulaire</option>
              <option value="speed">Gestion du temps</option>
            </select>
          </div>
          <div className="form-actions full-width"><button className="btn btn-primary" type="submit">Enregistrer les modifications</button></div>
        </form>
      </section>

      <div className="account-management-grid">
        <section className="card panel account-management-card">
          <div className="panel-title"><div><h2>Sécurité</h2><p className="muted-copy account-section-copy">Modifie le mot de passe utilisé pour te connecter.</p></div></div>
          <AccountPasswordForm />
        </section>

        <section className="card panel account-management-card">
          <div className="panel-title"><div><h2>Mes données</h2><p className="muted-copy account-section-copy">Télécharge une copie JSON de ton profil, de tes objectifs et de tout ton historique d’apprentissage.</p></div></div>
          <a className="btn btn-secondary" href="/api/account/export">Télécharger mes données</a>
          <p className="account-fine-print">Le fichier est généré à la demande et n’est pas conservé sur le serveur.</p>
        </section>
      </div>

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

      <section className="card panel account-danger-zone">
        <details>
          <summary>Fermer définitivement mon compte</summary>
          <div className="account-danger-content">
            <p>Cette action supprime le profil, les objectifs, les résultats, les erreurs et les séances. Elle ne peut pas être annulée.</p>
            <form className="form-grid one-column" action="/api/account/delete" method="post">
              <div className="field">
                <label htmlFor="delete-email">Confirme ton adresse e-mail</label>
                <input id="delete-email" name="email" type="email" autoComplete="email" required />
              </div>
              <div className="field">
                <label htmlFor="delete-confirmation">Écris SUPPRIMER</label>
                <input id="delete-confirmation" name="confirmation" autoComplete="off" pattern="SUPPRIMER" required />
              </div>
              <button className="btn btn-danger" type="submit">Supprimer définitivement le compte</button>
            </form>
          </div>
        </details>
      </section>
    </div>
  );
}
