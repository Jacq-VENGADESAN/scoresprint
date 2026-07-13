const errors = [
  ["Past perfect continuous", "Grammaire · Temps verbaux", "Tu confonds une action longue antérieure avec le past continuous.", 4],
  ["By vs during", "Grammaire · Prépositions", "Tu mélanges parfois une date limite et une période.", 3],
  ["Inférences dans les conversations", "Listening · Partie 3", "Les réponses implicites restent difficiles sous contrainte de temps.", 5]
];

export default function ErrorsPage() {
  return (
    <div className="container">
      <header className="page-head"><div className="eyebrow">Carnet d’erreurs</div><h1>Ce que tu dois revoir — pas tout le cours.</h1><p>Les erreurs sont regroupées par notion et reviennent selon leur fréquence, leur ancienneté et leur importance.</p></header>
      <div className="error-list">{errors.map(([title, meta, desc, count]) => <article className="card error-row" key={String(title)}><div><span className="badge">{meta}</span><h2 style={{ marginBottom: 0 }}>{title}</h2><p>{desc}</p></div><div className="error-count">{count} erreurs</div></article>)}</div>
    </div>
  );
}
