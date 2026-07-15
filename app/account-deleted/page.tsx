import Link from "next/link";

export default function AccountDeletedPage() {
  return (
    <div className="container auth-single-page">
      <section className="card auth-single-card">
        <div className="eyebrow">Demande terminée</div>
        <h1>Ton espace ScoreSprint est maintenant fermé.</h1>
        <p className="muted-copy">
          Le profil et les données d’apprentissage associés ne sont plus accessibles. Les justificatifs de paiement restent gérés par Stripe selon ses obligations propres.
        </p>
        <Link href="/" className="btn btn-primary">Retour à l’accueil</Link>
      </section>
    </div>
  );
}
