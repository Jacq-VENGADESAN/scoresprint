import Link from "next/link";
import { ProgressBar } from "@/components/progress-bar";

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="eyebrow">Coach adaptatif · 20 minutes par jour</div>
          <h1 className="display">Arrête de réviser au hasard. Travaille ce qui te fait vraiment perdre des points.</h1>
          <p className="lead">ScoreSprint analyse tes erreurs, construit ta séance quotidienne et réactive les notions au bon moment pour t’aider à atteindre ton score cible.</p>
          <div className="hero-actions">
            <Link href="/onboarding" className="btn btn-primary">Lancer mon diagnostic gratuit</Link>
            <Link href="/dashboard" className="btn btn-secondary">Voir la démo</Link>
          </div>
          <div className="hero-proof">Aucune carte bancaire · Résultat estimé sous forme de fourchette · Explications en français</div>

          <div className="card hero-panel">
            <div className="hero-copy">
              <div className="eyebrow">Ta séance du jour</div>
              <h2>Un programme qui s’adapte après chaque réponse.</h2>
              <div className="session-list">
                <div className="session-item"><span className="session-time">5 min</span><div><strong>Anciennes erreurs</strong><br/><span style={{ color: "var(--muted)" }}>6 notions à réactiver</span></div></div>
                <div className="session-item"><span className="session-time">8 min</span><div><strong>Temps verbaux</strong><br/><span style={{ color: "var(--muted)" }}>Faiblesse principale</span></div></div>
                <div className="session-item"><span className="session-time">7 min</span><div><strong>Partie 5 chronométrée</strong><br/><span style={{ color: "var(--muted)" }}>Objectif : gagner en vitesse</span></div></div>
              </div>
              <Link href="/practice" className="btn btn-primary">Commencer la séance</Link>
            </div>
            <div className="score-panel">
              <div className="score-row"><div><div style={{ opacity: .7 }}>Score estimé</div><div className="big-score">735</div></div><div className="score-target">Objectif<br/><strong style={{ color: "white", fontSize: "1.6rem" }}>850</strong></div></div>
              <div style={{ marginTop: 30 }}><ProgressBar value={72} /></div>
              <p style={{ color: "rgba(255,255,255,.74)", lineHeight: 1.6 }}>Au rythme actuel, ton objectif devient atteignable dans 5 à 7 semaines.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="eyebrow">Pourquoi ça marche</div>
          <h2 style={{ fontSize: "clamp(2rem,4vw,3.2rem)", letterSpacing: "-.04em", marginTop: 10 }}>Une boucle simple, centrée sur tes erreurs.</h2>
          <div className="grid-3" style={{ marginTop: 28 }}>
            {[["01","Diagnostic précis","On mesure tes compétences, ta vitesse et les pièges qui reviennent."],["02","Séance personnalisée","Chaque minute est affectée aux notions qui ont le plus d’impact sur ton objectif."],["03","Répétition intelligente","Une notion mal comprise revient jusqu’à ce qu’elle soit réellement maîtrisée."]].map(([n,t,d]) => <article className="card feature" key={n}><div className="feature-icon">{n}</div><h3>{t}</h3><p>{d}</p></article>)}
          </div>
          <div className="footer-note">TOEIC® est une marque déposée d’ETS. ScoreSprint est une plateforme indépendante, non affiliée, non approuvée et non sponsorisée par ETS.</div>
        </div>
      </section>
    </>
  );
}
