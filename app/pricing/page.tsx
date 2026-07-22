import Link from "next/link";
import { WaitlistForm } from "@/components/waitlist-form";
import { accessLabel, getAccessSummary } from "@/lib/access";
import { betaModeEnabled } from "@/lib/beta";
import { BRAND_NAME } from "@/lib/brand";
import { legalCommerceIsConfigured } from "@/lib/legal";
import { stripeIsConfigured } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/supabase-server";

const plans = [
  {
    code: "free",
    name: "Gratuit",
    kicker: "Découvrir Aptileo",
    price: "0 €",
    duration: "sans carte bancaire",
    description: "Pour mesurer ton niveau et vérifier que la méthode te convient.",
    features: ["Démonstration et diagnostic", "1 séance Reading par jour", "Listening Parties 1 et 2", "12 fiches express", "1 mini-examen par mois", "Historique sur 7 jours"]
  },
  {
    code: "sprint_30",
    name: "Sprint 30",
    kicker: "Préparation intensive",
    price: "9,90 €",
    duration: "30 jours · tarif de lancement",
    description: "Le cœur complet d’Aptileo pour préparer une échéance proche sans abonnement.",
    features: ["Reading et Listening illimités", "Mini-examens illimités", "Carnet d’erreurs et répétition espacée", "Historique et statistiques complets", "Toutes les fiches pédagogiques", "Séances et questions randomisées"]
  },
  {
    code: "sprint_90",
    name: "Coach 90",
    kicker: "Accompagnement personnalisé",
    price: "24,90 €",
    duration: "90 jours · tarif de lancement",
    description: "Une préparation longue avec un coach IA encadré par tes résultats et les corrections vérifiées d’Aptileo.",
    features: ["Tout le contenu du Sprint 30", "Programme IA personnalisé de 7 jours", "Explications adaptées à tes erreurs", "10 crédits IA renouvelés chaque jour", "Accès au tableau Coach 90", "Tous les nouveaux contenus pendant 90 jours"]
  }
] as const;

function paymentStatusMessage(payment: string | undefined) {
  if (payment === "cancelled") return "Le paiement a été annulé. Aucun prélèvement n’a été effectué.";
  if (payment === "consent") return "Tu dois accepter les conditions et demander l’activation immédiate avant de continuer.";
  if (payment === "legal") return "Les informations légales doivent être finalisées avant l’activation des paiements réels.";
  if (payment === "beta") return "Les paiements sont volontairement désactivés pendant la bêta.";
  if (payment === "error") return "Stripe n’a pas pu ouvrir la page de paiement. Vérifie la configuration ou réessaie.";
  if (payment === "configuration") return "Les identifiants Stripe ou les produits ne sont pas encore configurés.";
  return null;
}

export default async function PricingPage({ searchParams }: Readonly<{ searchParams: Promise<{ payment?: string }> }>) {
  const user = await getCurrentUser();
  const params = await searchParams;
  const beta = betaModeEnabled();
  const billingReady = stripeIsConfigured();
  const legalReady = legalCommerceIsConfigured();
  const statusMessage = paymentStatusMessage(params.payment);
  let currentPlan = "Gratuit";
  if (user) {
    try { currentPlan = accessLabel(await getAccessSummary(user.id)); }
    catch { currentPlan = "Configuration en attente"; }
  }

  return (
    <div className="container pricing-page">
      <header className="page-head pricing-intro">
        <div>
          <div className="eyebrow">Deux besoins réellement différents</div>
          <h1>Entraînement intensif ou accompagnement personnel.</h1>
          <p>{beta ? "Les paiements restent désactivés pendant les derniers réglages. Les tarifs de lancement sont maintenant fixés et la liste d’attente permet de choisir l’offre la plus utile." : "Paiement unique, sans renouvellement automatique. Coach 90 ajoute un accompagnement IA réel au lieu de seulement prolonger la durée."}</p>
        </div>
      </header>

      <div className={`pricing-status-note ${statusMessage ? "pricing-status-error" : ""}`}>
        {statusMessage ?? (beta ? "Aucun moyen de paiement n’est demandé tant que BETA_MODE reste activé." : user ? `Ton accès actuel : ${currentPlan}.` : "Commence gratuitement, puis choisis seulement lorsque tu connais ton besoin.")}
      </div>

      {!beta && !legalReady ? <div className="alert alert-warning">Les informations de l’entreprise et du médiateur doivent être complètes avant l’utilisation de Stripe Live.</div> : null}

      <div className="pricing-grid">
        {plans.map((plan, index) => {
          const featured = plan.code === "sprint_90";
          const buttonClass = featured ? "btn-primary" : "btn-secondary";
          return (
            <article className={`card price-card ${featured ? "featured" : ""}`} key={plan.code}>
              {featured ? <span className="badge" style={{ position: "absolute", top: 18, right: 18 }}>Offre complète</span> : null}
              <span className="plan-kicker">{plan.kicker}</span>
              <h2>{plan.name}</h2>
              <p className="muted-copy">{plan.description}</p>
              <div className="price">{plan.price}<small>{plan.duration}</small></div>
              <ul className="checks">{plan.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>

              {plan.code === "free" ? (
                <Link href={user ? "/dashboard" : "/demo"} className="btn btn-secondary">{user ? "Continuer gratuitement" : "Tester sans compte"}</Link>
              ) : beta ? (
                <WaitlistForm planInterest={plan.code} source={`pricing_${plan.code}`} compact title={`Être informé pour ${plan.name}`} />
              ) : !user ? (
                <Link href="/auth?next=/pricing" className={`btn ${buttonClass}`}>Se connecter pour acheter</Link>
              ) : billingReady ? (
                <form action="/api/billing/checkout" method="post" className="checkout-form">
                  <input type="hidden" name="plan" value={plan.code} />
                  <label className="checkout-consent"><input type="checkbox" name="terms_accepted" value="yes" required /><span>J’accepte les <Link href="/terms">CGU et CGV</Link> ainsi que la <Link href="/privacy">politique de confidentialité</Link>.</span></label>
                  <label className="checkout-consent"><input type="checkbox" name="immediate_access" value="yes" required /><span>Je demande l’activation immédiate de l’accès numérique et reconnais avoir lu les <Link href="/refund-policy">modalités de rétractation</Link>.</span></label>
                  <button className={`btn ${buttonClass}`} style={{ width: "100%" }} type="submit">Choisir {plan.name}</button>
                </form>
              ) : (
                <span className={`btn ${buttonClass} btn-disabled`}>Configuration Stripe requise</span>
              )}
            </article>
          );
        })}
      </div>

      <section className="card pricing-difference-card">
        <div><span className="eyebrow">Pourquoi Coach 90 coûte plus cher</span><h2>Ce n’est pas seulement trois fois plus de temps.</h2></div>
        <div className="pricing-difference-grid">
          <div><strong>Sprint 30</strong><p>Tu utilises librement tout le moteur d’entraînement, les corrections, les erreurs et les statistiques pendant un mois.</p></div>
          <div><strong>Coach 90</strong><p>L’IA analyse tes données d’apprentissage pour organiser chaque semaine et reformuler tes erreurs avec des exemples adaptés, dans une limite de coût quotidienne.</p></div>
        </div>
      </section>

      <div className="billing-secure-note">
        <strong>{beta ? "Aucun paiement pendant la bêta." : "Paiement unique et sécurisé par Stripe."}</strong>
        <span>{beta ? " Les deux listes d’attente permettent de mesurer séparément l’intérêt pour Sprint 30 et Coach 90." : ` Les coordonnées bancaires ne transitent pas par ${BRAND_NAME}. Aucun renouvellement automatique.`}</span>
      </div>
    </div>
  );
}
