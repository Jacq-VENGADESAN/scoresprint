import Link from "next/link";
import { accessLabel, getAccessSummary } from "@/lib/access";
import { stripeIsConfigured } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/supabase-server";

const plans = [
  {
    code: "free",
    name: "Gratuit",
    kicker: "Découvrir ScoreSprint",
    price: "0 €",
    duration: "sans limite de durée",
    description: "Pour faire le diagnostic et commencer à travailler régulièrement.",
    features: ["Diagnostic complet", "1 séance par jour", "1 mini-examen par mois", "Historique des 7 derniers jours"]
  },
  {
    code: "sprint_30",
    name: "Sprint 30",
    kicker: "Préparation intensive",
    price: "24,90 €",
    duration: "30 jours",
    description: "Le meilleur choix pour préparer un objectif précis dans le mois.",
    features: ["Séances illimitées", "Mini-examens illimités", "Carnet d’erreurs complet", "Historique et statistiques complets"]
  },
  {
    code: "sprint_90",
    name: "Sprint 90",
    kicker: "Progression durable",
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
  let currentPlan = "Gratuit";
  if (user) {
    try {
      currentPlan = accessLabel(await getAccessSummary(user.id));
    } catch {
      currentPlan = "Configuration en attente";
    }
  }

  const statusMessage = params.payment === "cancelled"
    ? "Le paiement a été annulé. Aucun prélèvement n’a été effectué."
    : params.payment === "error"
      ? "Stripe n’a pas pu ouvrir la page de paiement. Vérifie la configuration ou réessaie."
      : params.payment === "configuration"
        ? "Les identifiants Stripe ou les produits ne sont pas encore configurés."
        : null;

  return (
    <div className="container">
      <header className="page-head">
        <div className="eyebrow">Tarifs simples</div>
        <h1>Paie pour ta période de préparation, pas pour un abonnement oublié.</h1>
        <p>Les accès Premium durent 30 ou 90 jours, sans renouvellement automatique. Le paiement est hébergé et sécurisé par Stripe.</p>
      </header>

      <div className={`pricing-status-note ${statusMessage ? "pricing-status-error" : ""}`}>
        {statusMessage ?? (user ? `Ton accès actuel : ${currentPlan}.` : "Crée d’abord un compte gratuit, puis choisis ta période de préparation.")}
      </div>

      <div className="pricing-grid">
        {plans.map((plan, index) => (
          <article className={`card price-card ${index === 1 ? "featured" : ""}`} key={plan.code}>
            {index === 1 ? <span className="badge" style={{ position: "absolute", top: 18, right: 18 }}>Recommandé</span> : null}
            <span className="plan-kicker">{plan.kicker}</span>
            <h2>{plan.name}</h2>
            <p style={{ color: "var(--muted)", minHeight: 66 }}>{plan.description}</p>
            <div className="price">{plan.price} <small>/ {plan.duration}</small></div>
            <ul className="checks">{plan.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
            {plan.code === "free" ? (
              <Link href={user ? "/account" : "/auth"} className="btn btn-secondary" style={{ width: "100%" }}>
                {user ? "Voir mon accès" : "Créer mon compte gratuit"}
              </Link>
            ) : !user ? (
              <Link href="/auth?next=/pricing" className={`btn ${index === 1 ? "btn-primary" : "btn-secondary"}`} style={{ width: "100%" }}>
                Se connecter pour acheter
              </Link>
            ) : billingReady ? (
              <form action="/api/billing/checkout" method="post">
                <input type="hidden" name="plan" value={plan.code} />
                <button className={`btn ${index === 1 ? "btn-primary" : "btn-secondary"}`} style={{ width: "100%" }} type="submit">
                  Acheter {plan.name}
                </button>
              </form>
            ) : (
              <span className={`btn ${index === 1 ? "btn-primary" : "btn-secondary"} btn-disabled`} style={{ width: "100%" }}>
                Configuration Stripe requise
              </span>
            )}
          </article>
        ))}
      </div>

      <p className="billing-secure-note">Paiement unique. Les coordonnées bancaires sont saisies directement sur Stripe et ne transitent pas par ScoreSprint.</p>
    </div>
  );
}
