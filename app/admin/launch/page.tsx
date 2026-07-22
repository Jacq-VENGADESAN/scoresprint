import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminUser } from "@/lib/admin";
import { betaModeEnabled } from "@/lib/beta";
import { appUrl, BRAND_NAME } from "@/lib/brand";
import { legalCommerceIsConfigured } from "@/lib/legal";
import { openAiIsConfigured, openAiModel } from "@/lib/openai";
import { stripeIsConfigured } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/supabase-server";

function Check({ ready, title, detail }: Readonly<{ ready: boolean; title: string; detail: string }>) {
  return <div className="launch-check"><strong>{ready ? "✓" : "À faire"} · {title}</strong><span className="muted-copy">{detail}</span></div>;
}

export default async function AdminLaunchPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/admin/launch");
  if (!isAdminUser(user)) redirect("/dashboard");

  const beta = betaModeEnabled();
  const configuredUrl = Boolean(process.env.NEXT_PUBLIC_APP_URL?.trim());
  const productionUrl = configuredUrl && !appUrl().includes("localhost");
  const legalReady = legalCommerceIsConfigured();
  const sirenReady = Boolean(process.env.LEGAL_SIREN?.trim() || process.env.LEGAL_REGISTRATION?.trim());
  const siretReady = Boolean(process.env.LEGAL_SIRET?.trim() || process.env.LEGAL_REGISTRATION?.trim());
  const stripeReady = stripeIsConfigured();
  const stripeLive = process.env.STRIPE_SECRET_KEY?.trim().startsWith("sk_live_") ?? false;
  const rateLimitReady = Boolean(process.env.RATE_LIMIT_SALT?.trim());
  const coachReady = openAiIsConfigured();
  const betaAutomatic = [beta, configuredUrl, productionUrl, rateLimitReady];
  const commerceAutomatic = [legalReady, sirenReady, siretReady, stripeReady, coachReady];
  const betaReadyCount = betaAutomatic.filter(Boolean).length;
  const commerceReadyCount = commerceAutomatic.filter(Boolean).length;

  return (
    <div className="container legal-page">
      <header className="page-head"><div className="eyebrow">Administration · Pré-lancement</div><h1>État de publication de {BRAND_NAME}</h1><p>{betaReadyCount}/{betaAutomatic.length} contrôles techniques privés et {commerceReadyCount}/{commerceAutomatic.length} contrôles commerciaux automatiques sont validés.</p></header>

      <section className="card dashboard-section">
        <div className="dashboard-section-head"><div><h2>Développement et bêta privée</h2><p>Aucune valeur secrète n’est affichée.</p></div><span className="badge">{beta ? "Paiements bloqués" : "Paiements autorisés"}</span></div>
        <div className="launch-checklist">
          <Check ready={beta} title="Mode bêta" detail={beta ? "BETA_MODE bloque tout Checkout pendant les derniers tests." : "Remettre BETA_MODE=true tant que Stripe Live n’a pas été testé."} />
          <Check ready={configuredUrl} title="URL de l’application" detail={configuredUrl ? appUrl() : "Renseigner NEXT_PUBLIC_APP_URL dans Vercel."} />
          <Check ready={productionUrl} title="URL publique" detail={productionUrl ? "L’URL configurée n’utilise pas localhost." : "Configurer une URL Vercel publique ou le domaine définitif."} />
          <Check ready={rateLimitReady} title="Protection anti-abus" detail={rateLimitReady ? "RATE_LIMIT_SALT est configuré." : "Ajouter une longue valeur aléatoire dans RATE_LIMIT_SALT."} />
          <Check ready={true} title="Questions randomisées" detail="Diagnostic, entraînement, Listening, mini-examen et démonstration renouvellent leur ordre pour chaque nouvelle tentative." />
        </div>
      </section>

      <section className="card dashboard-section" style={{ marginTop: 22 }}>
        <div className="dashboard-section-head"><div><h2>Entreprise et offre commerciale</h2><p>Ces éléments doivent être validés avant BETA_MODE=false et Stripe Live.</p></div></div>
        <div className="launch-checklist">
          <Check ready={sirenReady} title="SIREN" detail={sirenReady ? "Le numéro SIREN est fourni par une variable serveur." : "Ajouter LEGAL_SIREN dans Vercel."} />
          <Check ready={siretReady} title="SIRET" detail={siretReady ? "Le numéro SIRET est fourni par une variable serveur." : "Ajouter LEGAL_SIRET dans Vercel."} />
          <Check ready={legalReady} title="Mentions commerciales complètes" detail={legalReady ? "Identité, adresse, téléphone, contact et médiateur sont renseignés." : "Compléter les variables LEGAL_* restantes, notamment le téléphone et le médiateur."} />
          <Check ready={stripeReady} title="Configuration Stripe" detail={stripeReady ? `Clés et produits présents${stripeLive ? " en mode Live" : " en mode Test"}.` : "Clés, webhook ou identifiants de prix manquants."} />
          <Check ready={coachReady} title="Coach 90" detail={coachReady ? `OpenAI est configuré avec ${openAiModel()}.` : "Ajouter OPENAI_API_KEY et conserver une limite quotidienne avant de vendre Coach 90."} />
          <Check ready={false} title="Migrations de production" detail="Exécuter la migration Coach 90 puis contrôler les tables et fonctions dans Supabase." />
          <Check ready={false} title="Nom et domaine" detail="Vérifier Aptileo sur INPI/EUIPO, acheter le domaine et mettre à jour toutes les URL de redirection." />
          <Check ready={false} title="E-mails de production" detail="Configurer un SMTP Supabase personnalisé avec SPF, DKIM et DMARC." />
          <Check ready={false} title="Achat et remboursement réels" detail="Créer les prix Live 9,90 € et 24,90 €, effectuer un paiement contrôlé puis son remboursement." />
          <Check ready={false} title="Relecture juridique" detail="Faire relire les mentions, CGV, confidentialité, rétractation et information sur l’IA avant publication." />
        </div>
      </section>

      <section className="card dashboard-section" style={{ marginTop: 22 }}>
        <div className="dashboard-section-head"><div><h2>Qualité avant ouverture</h2></div></div>
        <div className="launch-checklist">
          <Check ready={false} title="Supervision" detail="Activer les alertes Vercel/Supabase et un suivi d’erreurs applicatives." />
          <Check ready={false} title="Relecture pédagogique" detail="Faire relire les questions, fiches, photographies et réponses de référence." />
          <Check ready={false} title="Tests multi-appareils" detail="Tester Chrome, Firefox, Safari, Edge, Android et iPhone, notamment le Listening et Coach 90." />
          <Check ready={false} title="Test de coût IA" detail="Mesurer le coût réel par utilisateur Coach 90 avant d’ouvrir largement les ventes." />
        </div>
      </section>

      <section className="card dashboard-section" style={{ marginTop: 22 }}>
        <div className="dashboard-section-head"><div><h2>Actions utiles</h2></div></div>
        <div className="training-actions">
          <Link className="btn btn-primary" href="/coach">Tester Coach 90</Link>
          <Link className="btn btn-secondary" href="/admin/beta">Bêta et conversion</Link>
          <Link className="btn btn-secondary" href="/admin/questions">Banque de questions</Link>
          <Link className="btn btn-secondary" href="/admin/reports">Signalements</Link>
          <Link className="btn btn-secondary" href="/pricing">Tarifs</Link>
          <Link className="btn btn-secondary" href="/privacy">Confidentialité</Link>
        </div>
      </section>
    </div>
  );
}
