import Link from "next/link";

export default function OnboardingPage() {
  return (
    <div className="container">
      <header className="page-head">
        <div className="eyebrow">Étape 1 sur 2</div>
        <h1>Construisons ton objectif.</h1>
        <p>Ces informations serviront à adapter la durée et la priorité de chaque séance.</p>
      </header>
      <section className="card form-card">
        <form className="form-grid">
          <div className="field"><label htmlFor="current">Score actuel estimé</label><input id="current" type="number" min="10" max="990" defaultValue="650"/><small>Une approximation suffit.</small></div>
          <div className="field"><label htmlFor="target">Score cible</label><input id="target" type="number" min="10" max="990" defaultValue="850"/></div>
          <div className="field"><label htmlFor="date">Date de l’examen</label><input id="date" type="date"/></div>
          <div className="field"><label htmlFor="minutes">Temps quotidien</label><select id="minutes" defaultValue="20"><option value="10">10 minutes</option><option value="20">20 minutes</option><option value="30">30 minutes</option><option value="45">45 minutes</option></select></div>
          <div className="field"><label htmlFor="level">Niveau d’anglais</label><select id="level" defaultValue="b1"><option value="a2">A2 — Élémentaire</option><option value="b1">B1 — Intermédiaire</option><option value="b2">B2 — Avancé</option><option value="c1">C1 — Autonome</option></select></div>
          <div className="field"><label htmlFor="focus">Priorité ressentie</label><select id="focus"><option>Je ne sais pas encore</option><option>Compréhension orale</option><option>Grammaire</option><option>Vocabulaire</option><option>Gestion du temps</option></select></div>
        </form>
        <div className="form-actions"><Link className="btn btn-primary" href="/diagnostic">Continuer vers le diagnostic</Link></div>
      </section>
    </div>
  );
}
