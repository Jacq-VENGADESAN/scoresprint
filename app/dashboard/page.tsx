import Link from "next/link";
import { ProgressBar } from "@/components/progress-bar";
import { StatCard } from "@/components/stat-card";

const skills = [
  ["Temps verbaux", 42],
  ["Inférences", 38],
  ["Prépositions", 55],
  ["Vocabulaire professionnel", 71]
];

export default function DashboardPage() {
  return (
    <div className="container">
      <header className="page-head">
        <div className="eyebrow">Tableau de bord</div>
        <h1>Bonjour Jacq, voilà ce qui mérite ton temps aujourd’hui.</h1>
        <p>Le prototype utilise des données de démonstration. Elles seront remplacées par les tentatives stockées dans Supabase.</p>
      </header>
      <div className="dashboard-grid">
        <div style={{ display: "grid", gap: 22 }}>
          <section className="card panel">
            <div className="panel-title"><h2>Progression vers 850</h2><span className="badge">42 jours restants</span></div>
            <div className="stats"><StatCard label="Score estimé" value="710–760" detail="Fourchette prudente"/><StatCard label="Objectif" value="850" detail="+115 points environ"/><StatCard label="Série" value="6 jours" detail="Meilleur rythme ce mois-ci"/></div>
            <div style={{ marginTop: 22 }}><ProgressBar value={72}/></div>
          </section>
          <section className="card panel">
            <div className="panel-title"><h2>Séance personnalisée</h2><span style={{ color: "var(--muted)" }}>20 minutes</span></div>
            <div className="session-list">
              <div className="session-item"><span className="session-time">5 min</span><div><strong>Révision de 6 erreurs</strong><br/><span style={{ color: "var(--muted)" }}>Répétition espacée</span></div></div>
              <div className="session-item"><span className="session-time">8 min</span><div><strong>Temps verbaux</strong><br/><span style={{ color: "var(--muted)" }}>Priorité la plus élevée</span></div></div>
              <div className="session-item"><span className="session-time">7 min</span><div><strong>Partie 5 chronométrée</strong><br/><span style={{ color: "var(--muted)" }}>Objectif vitesse</span></div></div>
            </div>
            <Link className="btn btn-primary" href="/practice">Démarrer maintenant</Link>
          </section>
        </div>
        <aside style={{ display: "grid", gap: 22, alignContent: "start" }}>
          <section className="card panel">
            <div className="panel-title"><h3>Maîtrise</h3></div>
            {skills.map(([label, value]) => <div className="skill" key={String(label)}><div className="skill-top"><span>{label}</span><strong>{value}%</strong></div><ProgressBar value={Number(value)}/></div>)}
          </section>
          <section className="card panel">
            <div className="panel-title"><h3>Point d’attention</h3></div>
            <div className="notice">Tu réussis souvent les questions de prépositions, mais tu hésites encore trop longtemps. Le prochain objectif sera la vitesse.</div>
            <Link href="/errors" className="btn btn-ghost" style={{ marginTop: 14 }}>Voir mon carnet d’erreurs →</Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
