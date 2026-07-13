"use client";

import { useState } from "react";
import type { PracticeQuestion } from "@/lib/types";

export function QuestionCard({ question }: { question: PracticeQuestion }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const choose = (id: string) => {
    if (!checked) setSelected(id);
  };

  return (
    <section className="card question-shell">
      <div className="question-meta">
        <span className="badge">Partie {question.part}</span>
        <span className="badge">{question.skill}</span>
        <span className="badge">{question.difficulty}</span>
      </div>
      <div className="question-text">{question.prompt}</div>
      <div className="options">
        {question.options.map((option) => {
          const isCorrect = option.id === question.correctOptionId;
          const classNames = ["option"];
          if (selected === option.id) classNames.push("selected");
          if (checked && isCorrect) classNames.push("correct");
          if (checked && selected === option.id && !isCorrect) classNames.push("wrong");
          return (
            <button key={option.id} className={classNames.join(" ")} onClick={() => choose(option.id)} aria-pressed={selected === option.id}>
              <strong style={{ marginRight: 10 }}>{option.id}.</strong>{option.text}
            </button>
          );
        })}
      </div>
      {checked ? (
        <div className="explanation">
          <strong>{selected === question.correctOptionId ? "Bonne réponse." : "À retenir."}</strong>
          <p>{question.explanation}</p>
          <p style={{ marginBottom: 0 }}><strong>Piège détecté :</strong> {question.trap}</p>
        </div>
      ) : null}
      <div className="question-actions">
        <button className="btn btn-primary" disabled={!selected} onClick={() => setChecked(true)}>
          Vérifier ma réponse
        </button>
      </div>
    </section>
  );
}
