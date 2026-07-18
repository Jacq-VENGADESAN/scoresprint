import Link from "next/link";
import { accessLabel, getAccessSummary } from "@/lib/access";
import { BRAND_NAME } from "@/lib/brand";
import { legalCommerceIsConfigured } from "@/lib/legal";
import { stripeIsConfigured } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/supabase-server";

const plans = [
  {
    code: "free",
    name: "Gratuit",
    kicker: "Découvrir la méthode",
    price: "0 €",
    duration: "sans limite de durée",
    description: "Pour établir ton niveau et installer une première routine de travail.",
    features: ["Diagnostic complet", "1 séance par jour", "1 mini-examen par mois", "Historique des 7 derniers jours"]
  },
  {
    code: "sprint_30",
    name: "Sprint 30",
    kicker: "Le plus choisi",
    price: "24,90 €",
    duration: "30 jours",
    description: "Pour préparer une échéance proche avec un rythme soutenu et sans quota.",
    features: ["Reading et Listening illimités", "Mini-examens illimités", "Carnet d’erreurs complet", "Historique et statistiques complets"]
  },
  {
    code: "sprint_90",
    name: "Sprint 90",
    kicker: "Progression longue",
    price: "49,90 €",
    duration: "90 jours",
    description: "Pour construire une progression régulière sur plusieurs mois.",
    features: ["Toutes les fonctionnalités Premium", "Accès pendant 90 jours", "Historique complet", "Programme réajusté en continu"]
  }
] as const;

export default async function PricingPage({ searchParams }: { searchParams: Promise<{ payment?: string }> }) {
  const user = await getCurrentUser();
  const params = await searchParams;
  const billingReady = stripeIsConfigured();
  const legalReady = legalCommerceIsConfigured();
  let currentPlan = "Gratuit";
  if (user) {
    try { currentPlan = accessLabel(await getAccessSummary(user.id)); }
    catch { currentPlan = "Configuration en attente"; }
  }

  const statusMessage = params.payment === "cancelled"
    ? "Le paiement a été annulé. Aucun prélèvement n’a été effectué."
    : params.payment === "consent"
      ? "Tu dois accepter les conditions et demander l’activation immédiate avant de continuer."
      : params.payment === "legal"
        ? "Les informations légales doivent être finalisées avant l’activation des paiements réels."
        : params.payment === "error"
          ? "Stripe n’a pas pu ouvrir la page de paiement. Vérifie la configuration ou réessaie."
          : params.payment === "configuration"
            ? "Les identifiants Stripe ou les produits ne sont pas encore configurés."
            : null;

  return (
    <div className="container pricing-page">
      <header className="page-head pricing-intro">
        <div>
          <div className="eyebrow">Accès simples</div>
          <h1>Choisis une période de préparation, pas un abonnement oublié.</h1>
          <p>Les accès Premium durent 30 ou 90 jours et ne se renouvellent jamais automatiquement.</p>
        </div>
      </header>

      <div className={`pricing-status-note ${statusMessage ? "pricing-status-error" : ""}`}>
        {statusMessage ?? (user ? `Ton accès actuel : ${currentPlan}.` : "Commence gratuitement, puis active Premium uniquement lorsque tu en as besoin.")}
      </div>

      {!legalReady ? <div className="alert alert-warning">Mode pré-lancement : les informations de l’éditeur et du médiateur doivent être renseignées avant d’utiliser des clés Stripe Live.</div> : null}

      <div className="pricing-grid">
        {plans.map((plan, index) => (
          <article className={`card price-card ${index === 1 ? "featured" : ""}`} key={plan.code}>
            {index === 1 ? <span className="badge" style={{ position: "absolute", top: 18, right: 18 }}>Recommandé</span> : null}
            <span className="plan-kicker">{plan.kicker}</span>
            <h2>{plan.name}</h2>
            <p className="muted-copy">{plan.description}</p>
            <div className="price">{plan.price}<small>{plan.duration}</small></div>
            <ul className="checks">{plan.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>

            {plan.code === "free" ? (
              <Link href={user ? "/account" : "/auth"} className="btn btn-secondary">
                {user ? "Voir mon accès" : "Créer mon compte gratuit"}
              </Link>
            ) : !user ? (
              <Link href="/auth?next=/pricing" className={`btn ${index === 1 ? "btn-primary" : "btn-secondary"}`}>Se connecter pour acheter</Link>
            ) : billingReady ? (
              <form action="/api/billing/checkout" method="post" className="checkout-form">
                <input type="hidden" name="plan" value={plan.code} />
                <label className="checkout-consent">
                  <input type="checkbox" name="terms_accepted" value="yes" required />
                  <span>J’accepte les <Link href="/terms">CGU et CGV</Link> ainsi que la <Link href="/privacy">politique de confidentialité</Link>.</span>
                </label>
                <label className="checkout-consent">
                  <input type="checkbox" name="immediate_access" value="yes" required />
                  <span>Je demande l’activation immédiate de l’accès numérique et reconnais avoir lu les <Link href="/refund-policy">modalités de rétractation</Link>.</span>
                </label>
                <button className={`btn ${index === 1 ? "btn-primary" : "btn-secondary"}`} style={{ width: "100%" }} type="submit">Choisir {plan.name}</button>
              </form>
            ) : (
              <span className={`btn ${index === 1 ? "btn-primary" : "btn-secondary"} btn-disabled`}>Configuration Stripe requise</span>
            )}
          </article>
        ))}
      </div>

      <div className="billing-secure-note">
        <strong>Paiement unique et sécurisé par Stripe.</strong>
        <span> Les coordonnées bancaires ne transitent pas par {BRAND_NAME}. Un nouvel achat prolonge un accès Premium déjà actif.</span>
      </div>
    </div>
  );
}
