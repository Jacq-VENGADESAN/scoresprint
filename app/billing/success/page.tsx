import Link from "next/link";
import { redirect } from "next/navigation";
import { accessLabel, getAccessSummary } from "@/lib/access";
import { retrieveCheckoutSession } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/supabase-server";

export default async function BillingSuccessPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/account");
  const { session_id: sessionId } = await searchParams;

  let verified = false;
  let paid = false;
  let planLabel = "Premium";
  let accessLabelText = "Activation en cours";
  let accessEndsAt: string | null = null;

  if (sessionId) {
    try {
      const session = await retrieveCheckoutSession(sessionId);
      const ownerId = session.metadata?.user_id ?? session.client_reference_id;
      verified = ownerId === user.id;
      paid = verified && (session.payment_status === "paid" || session.payment_status === "no_payment_required");
      planLabel = session.metadata?.plan_code === "sprint_90" ? "Sprint 90 jours" : "Sprint 30 jours";
    } catch {
      verified = false;
    }
  }

  try {
    const access = await getAccessSummary(user.id);
    accessLabelText = accessLabel(access);
    accessEndsAt = access.accessEndsAt;
  } catch {
    // Le webhook peut être encore en cours ou la migration absente.
  }

  const formattedEnd = accessEndsAt
    ? new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(accessEndsAt))
    : null;

  return (
    <div className="container billing-result-page">
      <section className="card billing-result-card">
        <div className="eyebrow">Paiement Stripe</div>
        <h1>{paid ? "Paiement confirmé." : "Vérification du paiement en cours."}</h1>
        <p>
          {paid
            ? `Stripe a confirmé l’achat de l’accès ${planLabel}. L’activation est réalisée par un webhook sécurisé et peut prendre quelques secondes.`
            : "Nous n’avons pas pu confirmer cette session depuis ce compte. Aucun accès n’est activé depuis cette page seule."}
        </p>

        <div className="billing-result-status">
          <div><span>Session</span><strong>{verified ? "Vérifiée" : "Non vérifiée"}</strong></div>
          <div><span>Accès actuel</span><strong>{accessLabelText}</strong></div>
          <div><span>Expiration</span><strong>{formattedEnd ?? "Actualise dans quelques secondes"}</strong></div>
        </div>

        <div className="billing-result-actions">
          <Link href="/account" className="btn btn-primary">Voir mon accès</Link>
          <Link href="/dashboard" className="btn btn-secondary">Retour à ma progression</Link>
        </div>
      </section>
    </div>
  );
}
