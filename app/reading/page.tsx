import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase-server";

export const metadata = {
  title: "Reading",
  description: "Entraînement adaptatif aux parties 5, 6 et 7 : grammaire, textes à trous et compréhension écrite."
};

export default async function ReadingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/reading");

  return (
    <div className="container training-page">
      <header className="page-head training-intro">
        <div>
          <div className="eyebrow">Compréhension écrite</div>
          <h1>Reading · Parties 5, 6 et 7</h1>
          <p>Choisis un mode selon ton besoin : séance adaptative, correction des erreurs ou mesure chronométrée.</p>
        </div>
        <Link className="btn btn-secondary" href="/history">Voir mon historique</Link>
      </header>

      <section className="training-grid" aria-label="Modes Reading">
        <article className="training-card">
          <span className="training-card-icon" aria-hidden="true">R</span>
          <div className="eyebrow">Programme personnalisé</div>
          <h2>Séance adaptative</h2>
          <p>Les questions sont choisies à partir de tes faiblesses, de ton temps disponible et des notions récemment travaillées.</p>
          <ul className="training-feature-list">
            <li>Partie 5 · phrases à compléter</li>
            <li>Partie 6 · textes à trous</li>
            <li>Partie 7 · compréhension de documents</li>
          </ul>
          <div className="training-actions">
            <Link className="btn btn-primary" href="/practice">Démarrer ma séance</Link>
            <Link className="btn btn-secondary" href="/errors">Revoir mes erreurs</Link>
          </div>
        </article>

        <article className="training-card listening-card">
          <span className="training-card-icon" aria-hidden="true">⏱</span>
          <div className="eyebrow">Mesure chronométrée</div>
          <h2>Mini-examen Reading</h2>
          <p>Un test de 30 questions en 25 minutes pour mesurer ta vitesse, ta précision et ta progression par partie.</p>
          <ul className="training-feature-list">
            <li>Chronomètre conservé en cas de fermeture</li>
            <li>Résultat détaillé par partie</li>
            <li>Correction disponible après la soumission</li>
          </ul>
          <div className="training-actions">
            <Link className="btn btn-primary" href="/mock-exam">Passer le mini-examen</Link>
            <Link className="btn btn-secondary" href="/diagnostic">Refaire le diagnostic</Link>
          </div>
        </article>
      </section>

      <div className="training-note">
        Les exercices sont originaux et inspirés du format général des tests d’anglais professionnel. Ils ne reproduisent aucun contenu officiel d’ETS.
      </div>
    </div>
  );
}
