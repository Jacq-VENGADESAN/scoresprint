import { QuestionCard } from "@/components/question-card";
import { sampleQuestions } from "@/data/questions";

export default function PracticePage() {
  return (
    <div className="container">
      <header className="page-head">
        <div className="eyebrow">Séance du jour · 8 / 20 min</div>
        <h1>Corrigeons une erreur récurrente.</h1>
        <p>Réponds, puis consulte une explication qui distingue la règle, le piège et la chronologie.</p>
      </header>
      <QuestionCard question={sampleQuestions[0]} />
    </div>
  );
}
