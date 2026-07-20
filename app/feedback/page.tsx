import Link from "next/link";
import { BetaFeedbackForm } from "@/components/beta-feedback-form";

export const metadata = {
  title: "Donner mon avis",
  description: "Partage un retour précis sur la bêta Aptileo et aide à prioriser les prochaines évolutions."
};

export default function FeedbackPage() {
  return (
    <div className="container feedback-page">
      <header className="page-head feedback-page-head">
        <div>
          <span className="eyebrow">Bêta publique</span>
          <h1>Dis-nous ce qui mérite vraiment d’être amélioré.</h1>
          <p>Les retours précis comptent davantage qu’un simple « j’aime » ou « je n’aime pas ». Ils sont regroupés dans l’espace administrateur pour décider des prochaines évolutions.</p>
        </div>
        <Link className="btn btn-secondary" href="/demo">Tester la démonstration</Link>
      </header>
      <div className="feedback-layout">
        <section className="card feedback-form-card"><BetaFeedbackForm /></section>
        <aside className="feedback-guidance">
          <h2>Un retour utile indique :</h2>
          <ol>
            <li><strong>Ce que tu essayais de faire</strong><span>Par exemple : démarrer une séance Listening.</span></li>
            <li><strong>Ce qui s’est passé</strong><span>Message affiché, bouton introuvable ou résultat incompris.</span></li>
            <li><strong>Ce que tu attendais</strong><span>Le comportement qui aurait rendu l’expérience évidente.</span></li>
          </ol>
          <p>Pour une question ambiguë dans une séance connectée, utilise plutôt le bouton de signalement présent après la correction.</p>
        </aside>
      </div>
    </div>
  );
}
