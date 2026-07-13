import Link from "next/link";
import { sampleQuestions } from "@/data/questions";

export default function DiagnosticPage() {
  return (
    <div className="container">
      <header className="page-head">
        <div className="eyebrow">Diagnostic gratuit</div>
        <h1>30 questions pour trouver tes priorités.</h1>
        <p>La première version de ce prototype affiche un aperçu. Le moteur final équilibrera compréhension orale, grammaire, vocabulaire, lecture et vitesse.</p>
      </header>
      <section className="card question-shell">
        <div className="question-meta"><span className="badge">Aperçu du diagnostic</span><span className="badge">Question 1 / 30</span></div>
        <div className="question-text">{sampleQuestions[1].prompt}</div>
        <div className="options">{sampleQuestions[1].options.map(option => <button className="option" key={option.id}><strong style={{ marginRight: 10 }}>{option.id}.</strong>{option.text}</button>)}</div>
        <div className="question-actions"><Link className="btn btn-primary" href="/dashboard">Voir mon rapport de démonstration</Link></div>
      </section>
    </div>
  );
}
