import Link from "next/link";
import { WaitlistForm } from "@/components/waitlist-form";
import { BRAND_NAME, independentExamDisclaimer } from "@/lib/brand";

function CheckIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m4 10 3.5 3.5L16 5.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function MeasureIcon({ type }: { type: "target" | "clock" | "repeat" | "chart" }) {
  if (type === "target") return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" strokeWidth="1.7" /><circle cx="12" cy="12" r="2.4" fill="none" stroke="currentColor" strokeWidth="1.7" /><path d="M17 7 21 3m0 0v4m0-4h-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  if (type === "clock") return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.7" /><path d="M12 7v5l3 2" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>;
  if (type === "repeat") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h9a4 4 0 0 1 4 4v1m0 0-3-3m3 3 3-3M17 17H8a4 4 0 0 1-4-4v-1m0 0 3 3m-3-3-3 3" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19V9m7 10V5m7 14v-7" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" /><path d="M3 19h18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>;
}

function AptileoMark() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 16.5 10 12l3 2.5L19 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M15 8h4v4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export default function HomePage() {
  return (
    <>
      <section className="home-hero">
        <div className="container home-hero-grid">
          <div className="home-hero-copy">
            <div className="hero-kicker"><span className="hero-kicker-dot" />Bêta publique gratuite · Reading et Listening</div>
            <h1>Prépare ton TOEIC® avec un programme qui <em>travaille tes vraies erreurs.</em></h1>
            <p>{BRAND_NAME} transforme chaque réponse en prochaine action : une règle à comprendre, une erreur à revoir ou une séance courte adaptée à ton objectif.</p>
            <div className="hero-actions">
              <Link href="/demo" className="btn btn-primary">Tester 8 questions sans compte</Link>
              <Link href="/onboarding" className="btn btn-secondary">Créer mon programme gratuit</Link>
            </div>
            <div className="hero-proof-list" aria-label="Informations essentielles">
              <span className="hero-proof-item"><CheckIcon />Corrections détaillées en français</span>
              <span className="hero-proof-item"><CheckIcon />300+ questions Reading</span>
              <span className="hero-proof-item"><CheckIcon />Aucun paiement pendant la bêta</span>
            </div>
          </div>

          <div className="product-preview" aria-label={`Aperçu du tableau de bord ${BRAND_NAME}`}>
            <div className="preview-window">
              <div className="preview-topbar"><div className="preview-brand"><span className="brand-mark"><AptileoMark /></span>{BRAND_NAME}</div><span className="preview-date">Séance du jour</span></div>
              <div className="preview-body">
                <div className="preview-heading"><div><span className="eyebrow">Priorité du jour</span><h2>Consolider les temps verbaux</h2></div><div className="preview-score"><strong>735</strong><span>estimation interne</span></div></div>
                <div className="preview-progress" aria-hidden="true"><span /></div>
                <div className="preview-session">
                  <div className="preview-session-row"><span>5 min</span><div><strong>Réactiver 4 erreurs</strong><small>Révisions arrivées à échéance</small></div><span>Prioritaire</span></div>
                  <div className="preview-session-row"><span>8 min</span><div><strong>Reading · Partie 5</strong><small>Maîtrise actuelle : 54 %</small></div><span>Faiblesse</span></div>
                  <div className="preview-session-row"><span>7 min</span><div><strong>Listening · Partie 2</strong><small>Objectif : réponses indirectes</small></div><span>Écoute</span></div>
                </div>
                <div className="preview-footer"><div className="preview-streak"><strong>6 jours</strong> de régularité</div><span className="preview-cta">Démarrer la séance</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section home-section-muted">
        <div className="container">
          <div className="section-heading"><div className="eyebrow">Teste avant de t’inscrire</div><h2>Pas de promesse abstraite : regarde une vraie correction.</h2><p>La démonstration publique couvre cinq parties, mélange Reading et Listening et affiche immédiatement la règle et le piège de chaque exercice.</p></div>
          <div className="process-grid">
            <article className="process-step"><span className="process-number">01 · Répondre</span><h3>Huit questions originales, sans compte.</h3><p>Tu découvres le format, les photographies réelles et le lecteur audio avant de donner une adresse e-mail.</p></article>
            <article className="process-step"><span className="process-number">02 · Comprendre</span><h3>Chaque correction explique le raisonnement.</h3><p>La bonne réponse ne suffit pas : Aptileo précise la règle et la raison pour laquelle le distracteur semble plausible.</p></article>
            <article className="process-step"><span className="process-number">03 · Personnaliser</span><h3>Le diagnostic construit ensuite ton programme.</h3><p>Ton score cible, ta date d’examen et ton temps disponible orientent les prochaines séances.</p></article>
          </div>
          <div className="home-cta" style={{ marginTop: 28 }}><div><h2>La démonstration prend environ six minutes.</h2><p>Aucune carte bancaire et aucune inscription obligatoire.</p></div><Link href="/demo" className="btn btn-primary">Voir la démonstration</Link></div>
        </div>
      </section>

      <section id="fonctionnement" className="home-section">
        <div className="container measure-grid">
          <div className="section-heading"><div className="eyebrow">La différence Aptileo</div><h2>Moins de questions au hasard, davantage de répétitions utiles.</h2><p>Le moteur relie les réponses, le temps passé, les erreurs répétées et les mesures chronométrées pour choisir le prochain meilleur effort.</p></div>
          <div className="measure-list">
            <article className="measure-item"><span className="measure-icon"><MeasureIcon type="target" /></span><div><h3>Maîtrise par compétence</h3><p>Grammaire, vocabulaire, compréhension écrite et écoute sont suivis séparément.</p></div></article>
            <article className="measure-item"><span className="measure-icon"><MeasureIcon type="clock" /></span><div><h3>Temps de réponse</h3><p>Une réponse correcte mais trop lente n’est pas interprétée comme une maîtrise parfaite.</p></div></article>
            <article className="measure-item"><span className="measure-icon"><MeasureIcon type="repeat" /></span><div><h3>Carnet d’erreurs</h3><p>Les pièges reviennent selon une logique de répétition espacée, jusqu’à plusieurs réussites.</p></div></article>
            <article className="measure-item"><span className="measure-icon"><MeasureIcon type="chart" /></span><div><h3>Mesure prudente</h3><p>La fourchette évolue avec les preuves disponibles au lieu d’afficher un faux score précis après quelques questions.</p></div></article>
          </div>
        </div>
      </section>

      <section className="home-section home-section-muted">
        <div className="container">
          <div className="section-heading"><div className="eyebrow">Couverture actuelle de la bêta</div><h2>Ce qui est disponible aujourd’hui, sans masquer ce qui reste à construire.</h2></div>
          <div className="process-grid">
            <article className="process-step"><span className="process-number">Reading · Disponible</span><h3>Parties 5, 6 et 7</h3><p>Environ 300 questions originales, séance adaptative, erreurs programmées, diagnostic et mini-examen de 30 questions.</p><Link href="/reading"><strong>Découvrir Reading →</strong></Link></article>
            <article className="process-step"><span className="process-number">Listening · Disponible</span><h3>Parties 1 et 2</h3><p>Photographies réelles, questions-réponses, transcription après correction et progression distincte.</p><Link href="/listening"><strong>Découvrir Listening →</strong></Link></article>
            <article className="process-step"><span className="process-number">En développement</span><h3>Parties 3 et 4 et examen complet</h3><p>Les conversations, annonces et audios fixes seront ajoutés avant l’ouverture commerciale définitive.</p><Link href="/feedback"><strong>Voter pour la prochaine priorité →</strong></Link></article>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="container">
          <div className="section-heading"><div className="eyebrow">Comprendre les règles</div><h2>Des fiches de cinq minutes avant de refaire les mêmes erreurs.</h2><p>Grammaire, vocabulaire professionnel et stratégies des différentes parties sont maintenant accessibles publiquement.</p></div>
          <div className="home-cta"><div><h2>Douze premières fiches express sont disponibles.</h2><p>Past simple, present perfect, prépositions, familles de mots, Partie 7 et réponses indirectes.</p></div><Link href="/lessons" className="btn btn-primary">Explorer les fiches</Link></div>
        </div>
      </section>

      <section className="home-section home-section-muted">
        <div className="container measure-grid">
          <div className="section-heading"><div className="eyebrow">Premium plus tard, valeur d’abord</div><h2>Aide à construire une offre qui mérite réellement son prix.</h2><p>Pendant la bêta, les paiements sont désactivés. La liste d’attente permet de mesurer l’intérêt sans te facturer ni créer d’abonnement.</p></div>
          <WaitlistForm source="homepage" title="Être informé du lancement Premium" />
        </div>
      </section>

      <section className="home-section">
        <div className="container">
          <div className="home-cta"><div><h2>Commence sans engagement.</h2><p>Teste la correction, puis crée un compte uniquement si la méthode te convient.</p></div><div className="training-actions"><Link href="/demo" className="btn btn-primary">Tester sans compte</Link><Link href="/onboarding" className="btn btn-secondary">Lancer le diagnostic</Link></div></div>
          <p className="public-footer-note">{independentExamDisclaimer}</p>
        </div>
      </section>
    </>
  );
}
