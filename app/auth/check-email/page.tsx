import Link from "next/link";

export default function CheckEmailPage() {
  return (
    <div className="container">
      <section className="card form-card centered-card">
        <div className="eyebrow">Compte créé</div>
        <h1>Vérifie ta boîte mail.</h1>
        <p className="muted-copy">
          Supabase t’a envoyé un lien de confirmation. Clique dessus, puis reviens te connecter à ScoreSprint.
        </p>
        <Link className="btn btn-primary" href="/auth">Retour à la connexion</Link>
      </section>
    </div>
  );
}
