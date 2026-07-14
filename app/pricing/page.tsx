import Link from "next/link";
import { accessLabel, getAccessSummary } from "@/lib/access";
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

export default async function PricingPage() {
  const user = await getCurrentUser();
  let currentPlan = "Gratuit";
  if (user) {
    try {
      currentPlan = accessLabel(await getAccessSummary(user.id));
    } catch {
      currentPlan = "Configuration en attente";
    }
  }

  return (
    <div className="container">
      <header className="page-head">
        <div className="eyebrow">Tarifs simples</div>
        <h1>Paie pour ta période de préparation, pas pour un abonnement oublié.</h1>
        <p>Les accès Premium dureront 30 ou 90 jours et ne seront pas renouvelés automatiquement au lancement.</p>
      </header>

      <div className="pricing-status-note">
        {user ? `Ton accès actuel : ${currentPlan}. ` : "Tu peux créer un compte gratuit dès maintenant. "}
        Les paiements ne sont pas encore activés : aucun bouton de cette page ne prélève d’argent.
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
            ) : (
              <span className={`btn ${index === 1 ? "btn-primary" : "btn-secondary"} btn-disabled`} style={{ width: "100%" }}>
                Paiement bientôt disponible
              </span>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}