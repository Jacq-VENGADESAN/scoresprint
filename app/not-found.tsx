import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container legal-page">
      <section className="card auth-single-card" style={{ marginTop: 72 }}>
        <div className="eyebrow">Erreur 404</div>
        <h1>Cette page n’existe pas.</h1>
        <p className="muted-copy">Le lien est peut-être ancien ou incomplet. Reviens au tableau de bord ou à la page d’accueil.</p>
        <div className="training-actions">
          <Link className="btn btn-primary" href="/dashboard">Tableau de bord</Link>
          <Link className="btn btn-secondary" href="/">Page d’accueil</Link>
        </div>
      </section>
    </div>
  );
}
