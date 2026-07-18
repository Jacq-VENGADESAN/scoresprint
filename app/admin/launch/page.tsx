import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminUser } from "@/lib/admin";
import { appUrl, BRAND_NAME } from "@/lib/brand";
import { legalCommerceIsConfigured } from "@/lib/legal";
import { stripeIsConfigured } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/supabase-server";

function Check({ ready, title, detail }: { ready: boolean; title: string; detail: string }) {
  return (
    <div className="launch-check">
      <strong>{ready ? "✓" : "À faire"} · {title}</strong>
      <span className="muted-copy">{detail}</span>
    </div>
  );
}

export default async function AdminLaunchPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/admin/launch");
  if (!isAdminUser(user)) redirect("/dashboard");

  const configuredUrl = Boolean(process.env.NEXT_PUBLIC_APP_URL?.trim());
  const productionUrl = configuredUrl && !appUrl().includes("localhost");
  const smtpManual = false;
  const domainManual = false;
  const monitoringManual = false;
  const legalReady = legalCommerceIsConfigured();
  const stripeReady = stripeIsConfigured();
  const stripeLive = process.env.STRIPE_SECRET_KEY?.trim().startsWith("sk_live_") ?? false;
  const rateLimitReady = Boolean(process.env.RATE_LIMIT_SALT?.trim());

  const automatic = [configuredUrl, productionUrl, legalReady, stripeReady, rateLimitReady];
  const readyCount = automatic.filter(Boolean).length;

  return (
    <div className="container legal-page">
      <header className="page-head">
        <div className="eyebrow">Administration · Pré-lancement</div>
        <h1>État de publication de {BRAND_NAME}</h1>
        <p>{readyCount}/{automatic.length} vérifications automatiques sont validées. Les éléments manuels restent à confirmer avant Stripe Live.</p>
      </header>

      <section className="card dashboard-section">
        <div className="dashboard-section-head"><div><h2>Vérifications automatiques</h2><p>Aucune valeur secrète n’est affichée.</p></div></div>
        <div className="launch-checklist">
          <Check ready={configuredUrl} title="URL de l’application" detail={configuredUrl ? appUrl() : "Renseigner NEXT_PUBLIC_APP_URL dans Vercel."} />
          <Check ready={productionUrl} title="Domaine de production" detail={productionUrl ? "L’URL n’utilise pas localhost." : "Configurer le domaine définitif, puis mettre à jour les redirections Supabase et Stripe."} />
          <Check ready={legalReady} title="Informations légales" detail={legalReady ? "Éditeur, immatriculation, contact et médiateur renseignés." : "Compléter les variables LEGAL_* dans Vercel."} />
          <Check ready={stripeReady} title="Configuration Stripe" detail={stripeReady ? `Clés et produits présents${stripeLive ? " en mode Live" : " en mode Test"}.` : "Clés, webhook ou identifiants de prix manquants."} />
          <Check ready={rateLimitReady} title="Sel de limitation" detail={rateLimitReady ? "RATE_LIMIT_SALT est configuré." : "Ajouter une longue valeur aléatoire dans RATE_LIMIT_SALT."} />
        </div>
      </section>

      <section className="card dashboard-section" style={{ marginTop: 22 }}>
        <div className="dashboard-section-head"><div><h2>Confirmations manuelles</h2><p>Ces points ne peuvent pas être vérifiés depuis le code.</p></div></div>
        <div className="launch-checklist">
          <Check ready={domainManual} title="Nom et domaine" detail="Vérifier Aptileo sur INPI/EUIPO, acheter le domaine et réserver les comptes sociaux." />
          <Check ready={smtpManual} title="E-mails de production" detail="Configurer un SMTP personnalisé Supabase avec SPF, DKIM et DMARC, puis tester confirmation et récupération." />
          <Check ready={monitoringManual} title="Supervision" detail="Activer les alertes Vercel/Supabase et un suivi des erreurs avant l’ouverture publique." />
          <Check ready={false} title="Achat et remboursement réels" detail="Après validation juridique, effectuer un paiement Live contrôlé puis un remboursement complet." />
          <Check ready={false} title="Relecture pédagogique" detail="Faire relire les questions et photographies par une personne qualifiée, puis traiter tous les signalements ouverts." />
          <Check ready={false} title="Tests multi-appareils" detail="Tester Chrome, Firefox, Safari, Edge, Android et iPhone, notamment la voix du Listening." />
        </div>
      </section>

      <section className="card dashboard-section" style={{ marginTop: 22 }}>
        <div className="dashboard-section-head"><div><h2>Actions utiles</h2></div></div>
        <div className="training-actions">
          <Link className="btn btn-secondary" href="/admin/questions">Banque de questions</Link>
          <Link className="btn btn-secondary" href="/admin/reports">Signalements</Link>
          <Link className="btn btn-secondary" href="/legal">Mentions légales</Link>
          <Link className="btn btn-secondary" href="/privacy">Confidentialité</Link>
          <Link className="btn btn-secondary" href="/terms">CGU et CGV</Link>
          <Link className="btn btn-secondary" href="/pricing">Parcours d’achat</Link>
        </div>
      </section>
    </div>
  );
}
