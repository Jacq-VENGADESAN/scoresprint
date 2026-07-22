import Link from "next/link";
import { WaitlistForm } from "@/components/waitlist-form";
import { BRAND_NAME, independentExamDisclaimer } from "@/lib/brand";

function CheckIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m4 10 3.5 3.5L16 5.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function MeasureIcon({ type }: Readonly<{ type: "target" | "clock" | "repeat" | "chart" }>) {
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
            <div className="hero-kicker"><span className="hero-kicker-dot" />Bêta privée · Reading, Listening et Coach 90</div>
            <h1>Prépare ton TOEIC® avec un programme qui <em>travaille tes vraies erreurs.</em></h1>
            <p>{BRAND_NAME} transforme chaque réponse en prochaine action. Les nouvelles séances changent d’ordre selon l’utilisateur, tandis que Coach 90 organise une semaine à partir des résultats réels.</p>
            <div className="hero-actions">
              <Link href="/demo" className="btn btn-primary">Tester 8 questions sans compte</Link>
              <Link href="/onboarding" className="btn btn-secondary">Créer mon programme gratuit</Link>
            </div>
            <div className="hero-proof-list" aria-label="Informations essentielles">
              <span className="hero-proof-item"><CheckIcon />Corrections détaillées en français</span>
              <span className="hero-proof-item"><CheckIcon />Questions randomisées</span>
              <span className="hero-proof-item"><CheckIcon />Paiements encore bloqués</span>
            </div>
          </div>

          <div className="product-preview" aria-label={`Aperçu du tableau de bord ${BRAND_NAME}`}>
            <div className="preview-window">
              <div className="preview-topbar"><div className="preview-brand"><span className="brand-mark"><AptileoMark /></span>{BRAND_NAME}</div><span className="preview-date">Séance du jour</span></div>
              <div className="preview-body">
                <div className="preview-heading"><div><span className="eyebrow">Priorité du jour</span><h2>Consolider les temps verbaux</h2></div><div className="preview-score"><strong>735</strong><span>estimation interne</span></div></div>
                <div className="preview-progress" aria-hidden="true"><span /></div>
                <div className="preview-session">
                  <div className="preview-session-row"><span>5 min</span><div><strong>Réactiver 4 erreurs</strong><small>Ordre renouvelé pour cette séance</small></div><span>Prioritaire</span></div>
                  <div className="preview-session-row"><span>8 min</span><div><strong>Reading · Partie 5</strong><small>Maîtrise actuelle : 54 %</small></div><span>Faiblesse</span></div>
                  <div className="preview-session-row"><span>7 min</span><div><strong>Listening · Partie 2</strong><small>Objectif : réponses indirectes</small></div><span>Écoute</span></div>
                </div>
                <div className="preview-footer"><div className="preview-streak"><strong>6 jours</strong> de régularité</div><span className="preview-cta">Démarrer</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section home-section-muted">
        <div className="container">
          <div className="section-heading"><div className="eyebrow">Teste avant de t’inscrire</div><h2>Regarde une vraie correction avant de donner ton e-mail.</h2><p>La démonstration mélange Reading et Listening dans un ordre différent à chaque nouvelle tentative.</p></div>
          <div className="process-grid">
            <article className="process-step"><span className="process-number">01 · Répondre</span><h3>Huit questions originales.</h3><p>Photographies réelles, lecteur audio et exercices Reading sans compte.</p></article>
            <article className="process-step"><span className="process-number">02 · Comprendre</span><h3>La correction explique le raisonnement.</h3><p>Aptileo précise la règle et le piège qui rend le distracteur plausible.</p></article>
            <article className="process-step"><span className="process-number">03 · Personnaliser</span><h3>Le diagnostic construit ton programme.</h3><p>Ton objectif, ta date et ton temps disponible orientent les séances suivantes.</p></article>
          </div>
          <div className="home-cta" style={{ marginTop: 28 }}><div><h2>La démonstration prend environ six minutes.</h2><p>Aucune carte bancaire et aucune inscription obligatoire.</p></div><Link href="/demo" className="btn btn-primary">Voir la démonstration</Link></div>
        </div>
      </section>

      <section id="fonctionnement" className="home-section">
        <div className="container measure-grid">
          <div className="section-heading"><div className="eyebrow">La différence Aptileo</div><h2>Moins de mémorisation de l’ordre, davantage de répétitions utiles.</h2><p>Le moteur relie les réponses, le temps, les erreurs répétées et les mesures chronométrées pour choisir le prochain effort.</p></div>
          <div className="measure-list">
            <article className="measure-item"><span className="measure-icon"><MeasureIcon type="target" /></span><div><h3>Maîtrise par compétence</h3><p>Grammaire, vocabulaire, compréhension et écoute sont suivis séparément.</p></div></article>
            <article className="measure-item"><span className="measure-icon"><MeasureIcon type="clock" /></span><div><h3>Temps de réponse</h3><p>Une bonne réponse trop lente n’est pas interprétée comme une maîtrise parfaite.</p></div></article>
            <article className="measure-item"><span className="measure-icon"><MeasureIcon type="repeat" /></span><div><h3>Carnet d’erreurs</h3><p>Les pièges reviennent jusqu’à plusieurs réussites, dans un ordre renouvelé.</p></div></article>
            <article className="measure-item"><span className="measure-icon"><MeasureIcon type="chart" /></span><div><h3>Mesure prudente</h3><p>La fourchette évolue avec les preuves disponibles plutôt qu’un faux score précis.</p></div></article>
          </div>
        </div>
      </section>

      <section className="home-section home-section-muted">
        <div className="container">
          <div className="section-heading"><div className="eyebrow">Deux offres différentes</div><h2>Un sprint abordable ou un accompagnement personnel.</h2></div>
          <div className="process-grid">
            <article className="process-step"><span className="process-number">Gratuit</span><h3>Découvrir la méthode</h3><p>Diagnostic, séance quotidienne, Listening et mini-examen mensuel pour vérifier la valeur du produit.</p></article>
            <article className="process-step"><span className="process-number">Sprint 30 · 9,90 €</span><h3>Tout l’entraînement pendant un mois</h3><p>Utilisation illimitée du cœur Aptileo, historique complet et toutes les fiches, sans IA.</p></article>
            <article className="process-step"><span className="process-number">Coach 90 · 24,90 €</span><h3>Plan de 7 jours et explications IA</h3><p>Dix crédits quotidiens pour organiser la semaine et reformuler les erreurs à partir de corrections vérifiées.</p></article>
          </div>
          <div className="home-cta" style={{ marginTop: 28 }}><div><h2>Les paiements restent bloqués pendant les derniers réglages.</h2><p>Aucun renouvellement automatique ne sera utilisé au lancement.</p></div><Link href="/pricing" className="btn btn-primary">Comparer les offres</Link></div>
        </div>
      </section>

      <section className="home-section">
        <div className="container measure-grid">
          <div className="section-heading"><div className="eyebrow">Préparation au lancement</div><h2>Le site reste en bêta privée avant son ouverture commerciale.</h2><p>La liste d’attente mesure séparément l’intérêt pour Sprint 30 et Coach 90 pendant la configuration de l’entreprise, de Stripe et du domaine.</p></div>
          <WaitlistForm source="homepage" title="Être informé de l’ouverture" />
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
