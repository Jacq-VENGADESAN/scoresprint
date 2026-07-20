import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminUser } from "@/lib/admin";
import { betaModeEnabled } from "@/lib/beta";
import { appUrl, BRAND_NAME } from "@/lib/brand";
import { legalCommerceIsConfigured } from "@/lib/legal";
import { stripeIsConfigured } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/supabase-server";

function Check({ ready, title, detail }: { ready: boolean; title: string; detail: string }) {
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
  const stripeReady = stripeIsConfigured();
  const stripeLive = process.env.STRIPE_SECRET_KEY?.trim().startsWith("sk_live_") ?? false;
  const rateLimitReady = Boolean(process.env.RATE_LIMIT_SALT?.trim());
  const betaAutomatic = [beta, configuredUrl, productionUrl, rateLimitReady];
  const readyCount = betaAutomatic.filter(Boolean).length;

  return (
    <div className="container legal-page">
      <header className="page-head"><div className="eyebrow">Administration · Pré-lancement</div><h1>État de publication de {BRAND_NAME}</h1><p>{readyCount}/{betaAutomatic.length} vérifications techniques de la bêta sont validées. La partie commerciale est suivie séparément.</p></header>

      <section className="card dashboard-section">
        <div className="dashboard-section-head"><div><h2>Bêta publique gratuite</h2><p>Aucune valeur secrète n’est affichée.</p></div><span className="badge">{beta ? "Paiements bloqués" : "Paiements autorisés"}</span></div>
        <div className="launch-checklist">
          <Check ready={beta} title="Mode bêta" detail={beta ? "BETA_MODE protège le site contre tout démarrage de Checkout." : "Mettre BETA_MODE=true tant que l’offre commerciale n’est pas prête."} />
          <Check ready={configuredUrl} title="URL de l’application" detail={configuredUrl ? appUrl() : "Renseigner NEXT_PUBLIC_APP_URL dans Vercel."} />
          <Check ready={productionUrl} title="URL publique" detail={productionUrl ? "L’URL publique n’utilise pas localhost." : "Configurer une URL Vercel publique ou un domaine définitif."} />
          <Check ready={rateLimitReady} title="Protection anti-abus" detail={rateLimitReady ? "RATE_LIMIT_SALT est configuré." : "Ajouter une longue valeur aléatoire dans RATE_LIMIT_SALT."} />
          <Check ready={true} title="Démonstration publique" detail="Le mini-test sans compte, les fiches et la collecte de retours sont présents dans le code." />
          <Check ready={true} title="Mesure du tunnel" detail="Les événements internes, la liste d’attente et les retours sont disponibles après la migration bêta." />
        </div>
      </section>

      <section className="card dashboard-section" style={{ marginTop: 22 }}>
        <div className="dashboard-section-head"><div><h2>Ouverture commerciale future</h2><p>Ces éléments ne bloquent pas une bêta gratuite, mais bloquent Stripe Live.</p></div></div>
        <div className="launch-checklist">
          <Check ready={legalReady} title="Informations légales" detail={legalReady ? "Éditeur, immatriculation, contact et médiateur renseignés." : "Créer l’activité, puis compléter les variables LEGAL_* dans Vercel."} />
          <Check ready={stripeReady} title="Configuration Stripe" detail={stripeReady ? `Clés et produits présents${stripeLive ? " en mode Live" : " en mode Test"}.` : "Clés, webhook ou identifiants de prix manquants."} />
          <Check ready={false} title="Nom et domaine" detail="Vérifier Aptileo sur INPI/EUIPO, acheter le domaine et réserver les comptes sociaux." />
          <Check ready={false} title="E-mails de production" detail="Configurer un SMTP Supabase personnalisé avec SPF, DKIM et DMARC." />
          <Check ready={false} title="Supervision" detail="Activer les alertes Vercel/Supabase et un suivi des erreurs." />
          <Check ready={false} title="Achat et remboursement réels" detail="Après validation juridique, effectuer un paiement Live contrôlé puis un remboursement complet." />
          <Check ready={false} title="Relecture pédagogique" detail="Faire relire les questions, fiches et photographies par une personne qualifiée." />
          <Check ready={false} title="Tests multi-appareils" detail="Tester Chrome, Firefox, Safari, Edge, Android et iPhone, notamment la voix du Listening." />
        </div>
      </section>

      <section className="card dashboard-section" style={{ marginTop: 22 }}>
        <div className="dashboard-section-head"><div><h2>Actions utiles</h2></div></div>
        <div className="training-actions">
          <Link className="btn btn-primary" href="/admin/beta">Bêta et conversion</Link>
          <Link className="btn btn-secondary" href="/admin/questions">Banque de questions</Link>
          <Link className="btn btn-secondary" href="/admin/reports">Signalements</Link>
          <Link className="btn btn-secondary" href="/demo">Démonstration</Link>
          <Link className="btn btn-secondary" href="/pricing">Tarifs et liste d’attente</Link>
          <Link className="btn btn-secondary" href="/privacy">Confidentialité</Link>
        </div>
      </section>
    </div>
  );
}
