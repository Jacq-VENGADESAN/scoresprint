import Link from "next/link";
import { BRAND_NAME, independentExamDisclaimer } from "@/lib/brand";

function CheckIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m4 10 3.5 3.5L16 5.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function MeasureIcon({ type }: { type: "target" | "clock" | "repeat" | "chart" }) {
  if (type === "target") return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" strokeWidth="1.7" /><circle cx="12" cy="12" r="2.4" fill="none" stroke="currentColor" strokeWidth="1.7" /><path d="M17 7 21 3m0 0v4m0-4h-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  if (type === "clock") return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.7" /><path d="M12 7v5l3 2" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
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
            <div className="hero-kicker"><span className="hero-kicker-dot" />Reading et Listening · 10 à 45 minutes par jour</div>
            <h1>Travaille moins au hasard. <em>Progresse là où ça compte.</em></h1>
            <p>
              {BRAND_NAME} transforme tes erreurs en un programme quotidien clair : les bonnes compétences,
              dans le bon ordre, avec une mesure honnête de ta progression.
            </p>
            <div className="hero-actions">
              <Link href="/onboarding" className="btn btn-primary">Commencer par le diagnostic</Link>
              <Link href="#fonctionnement" className="btn btn-secondary">Découvrir la méthode</Link>
            </div>
            <div className="hero-proof-list" aria-label="Informations essentielles">
              <span className="hero-proof-item"><CheckIcon />Compte gratuit</span>
              <span className="hero-proof-item"><CheckIcon />Exercices originaux</span>
              <span className="hero-proof-item"><CheckIcon />Sans renouvellement automatique</span>
            </div>
          </div>

          <div className="product-preview" aria-label={`Aperçu du tableau de bord ${BRAND_NAME}`}>
            <div className="preview-window">
              <div className="preview-topbar">
                <div className="preview-brand"><span className="brand-mark"><AptileoMark /></span>{BRAND_NAME}</div>
                <span className="preview-date">Séance du jour</span>
              </div>
              <div className="preview-body">
                <div className="preview-heading">
                  <div>
                    <span className="eyebrow">Priorité du jour</span>
                    <h2>Consolider les temps verbaux</h2>
                  </div>
                  <div className="preview-score"><strong>735</strong><span>estimation interne</span></div>
                </div>
                <div className="preview-progress" aria-hidden="true"><span /></div>
                <div className="preview-session">
                  <div className="preview-session-row">
                    <span>5 min</span><div><strong>Réactiver 4 erreurs</strong><small>Échéances arrivées aujourd’hui</small></div><span>Prioritaire</span>
                  </div>
                  <div className="preview-session-row">
                    <span>8 min</span><div><strong>Reading · Partie 5</strong><small>Maîtrise actuelle : 54 %</small></div><span>Faiblesse</span>
                  </div>
                  <div className="preview-session-row">
                    <span>7 min</span><div><strong>Listening · Partie 2</strong><small>Objectif : réponses indirectes</small></div><span>Écoute</span>
                  </div>
                </div>
                <div className="preview-footer">
                  <div className="preview-streak"><strong>6 jours</strong> de régularité</div>
                  <span className="preview-cta">Démarrer la séance</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="fonctionnement" className="home-section home-section-muted">
        <div className="container">
          <div className="section-heading">
            <div className="eyebrow">Une méthode lisible</div>
            <h2>Deux espaces cohérents : Reading et Listening.</h2>
            <p>Reading regroupe les parties 5, 6 et 7. Listening regroupe les exercices audio des parties 1 et 2, avec de vraies photographies sous licence.</p>
          </div>
          <div className="process-grid">
            <article className="process-step">
              <span className="process-number">01 · Mesurer</span>
              <h3>Un diagnostic court pose le point de départ.</h3>
              <p>Il estime une fourchette et repère les compétences qui méritent le plus d’attention.</p>
            </article>
            <article className="process-step">
              <span className="process-number">02 · Prioriser</span>
              <h3>Chaque séance utilise ton temps là où il est utile.</h3>
              <p>Les faiblesses, erreurs dues et questions récentes construisent un programme du jour.</p>
            </article>
            <article className="process-step">
              <span className="process-number">03 · Consolider</span>
              <h3>Une notion revient jusqu’à devenir stable.</h3>
              <p>Le carnet d’erreurs planifie les révisions et augmente progressivement la confiance de la mesure.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="container measure-grid">
          <div className="section-heading">
            <div className="eyebrow">Ce qui est réellement suivi</div>
            <h2>Une progression basée sur des traces concrètes.</h2>
            <p>{BRAND_NAME} relie les réponses, le temps passé, les répétitions et les exercices chronométrés pour donner une lecture plus utile de ton niveau.</p>
          </div>
          <div className="measure-list">
            <article className="measure-item"><span className="measure-icon"><MeasureIcon type="target" /></span><div><h3>Maîtrise par compétence</h3><p>Grammaire, vocabulaire, compréhension écrite et écoute sont suivis séparément.</p></div></article>
            <article className="measure-item"><span className="measure-icon"><MeasureIcon type="clock" /></span><div><h3>Temps de réponse</h3><p>Une réponse correcte trop lente n’est pas interprétée comme une maîtrise parfaite.</p></div></article>
            <article className="measure-item"><span className="measure-icon"><MeasureIcon type="repeat" /></span><div><h3>Erreurs qui reviennent</h3><p>Les pièges répétés sont conservés et reprogrammés jusqu’à plusieurs réussites.</p></div></article>
            <article className="measure-item"><span className="measure-icon"><MeasureIcon type="chart" /></span><div><h3>Fourchette estimée</h3><p>Le résultat s’affine avec le diagnostic, les séances et les mini-examens.</p></div></article>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="container">
          <div className="home-cta">
            <div>
              <h2>Commence par vingt questions. Le programme se construit ensuite.</h2>
              <p>Le diagnostic est gratuit et prend environ quinze minutes. Aucun moyen de paiement n’est demandé.</p>
            </div>
            <Link href="/onboarding" className="btn btn-primary">Lancer mon diagnostic</Link>
          </div>
          <p className="public-footer-note">{independentExamDisclaimer}</p>
        </div>
      </section>
    </>
  );
}
