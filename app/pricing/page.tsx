import Link from "next/link";

const plans = [
  { name: "Express", price: "9,90 €", duration: "7 jours", description: "Pour une révision de dernière minute.", features: ["Séances personnalisées", "Exercices ciblés", "1 mini-test"] },
  { name: "Objectif", price: "24,90 €", duration: "30 jours", description: "Le meilleur choix pour préparer un score précis.", features: ["Diagnostic complet", "Carnet d’erreurs", "Examens blancs", "Suivi du score"] },
  { name: "Progression", price: "49,90 €", duration: "90 jours", description: "Pour construire une progression durable.", features: ["Toutes les fonctionnalités", "Historique complet", "Plus d’examens blancs", "Plan réajusté chaque semaine"] }
];

export default function PricingPage() {
  return (
    <div className="container">
      <header className="page-head"><div className="eyebrow">Tarifs simples</div><h1>Paie pour ta période de préparation, pas pour un abonnement oublié.</h1><p>Les paiements Stripe seront activés après la création des produits et l’ajout des variables d’environnement.</p></header>
      <div className="pricing-grid">{plans.map((plan, i) => <article className={`card price-card ${i === 1 ? "featured" : ""}`} key={plan.name}>{i === 1 ? <span className="badge" style={{ position: "absolute", top: 18, right: 18 }}>Recommandé</span> : null}<h2>{plan.name}</h2><p style={{ color: "var(--muted)", minHeight: 48 }}>{plan.description}</p><div className="price">{plan.price} <small>/ {plan.duration}</small></div><ul className="checks">{plan.features.map(feature => <li key={feature}>{feature}</li>)}</ul><Link href="/onboarding" className={`btn ${i === 1 ? "btn-primary" : "btn-secondary"}`} style={{ width: "100%" }}>Commencer</Link></article>)}</div>
    </div>
  );
}
