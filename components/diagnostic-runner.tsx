"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { DiagnosticAnswerInput, PublicDiagnosticQuestion, SkillDiagnosticResult } from "@/lib/diagnostic-bank";

type DiagnosticResult = {
  correctAnswers: number;
  totalQuestions: number;
  estimatedScore: number;
  scoreLow: number;
  scoreHigh: number;
  skillBreakdown: SkillDiagnosticResult[];
};

export function DiagnosticRunner({ questions }: { questions: PublicDiagnosticQuestion[] }) {
  const [index, setIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<DiagnosticAnswerInput[]>([]);
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const diagnosticStartedAt = useRef(Date.now());
  const questionStartedAt = useRef(Date.now());

  const question = questions[index];
  const progress = result ? 100 : Math.round((index / questions.length) * 100);

  async function saveAnswer() {
    if (!selectedOptionId || !question || submitting) return;

    const answer: DiagnosticAnswerInput = {
      questionId: question.id,
      selectedOptionId,
      responseTimeMs: Date.now() - questionStartedAt.current
    };
    const completedAnswers = [...answers, answer];

    if (index < questions.length - 1) {
      setAnswers(completedAnswers);
      setSelectedOptionId(null);
      setIndex((current) => current + 1);
      questionStartedAt.current = Date.now();
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/diagnostic/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: completedAnswers,
          durationMs: Date.now() - diagnosticStartedAt.current
        })
      });
      const payload = (await response.json()) as DiagnosticResult & { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Le diagnostic n’a pas pu être enregistré.");
      setAnswers(completedAnswers);
      setResult(payload);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Une erreur inattendue est survenue.");
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    function handleKeyboard(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, select, button") || event.metaKey || event.ctrlKey || event.altKey) return;

      const optionKey = event.key.toUpperCase();
      if (question && ["A", "B", "C", "D"].includes(optionKey)) {
        const option = question.options.find((item) => item.id === optionKey);
        if (option) setSelectedOptionId(option.id);
        return;
      }
      if (event.key === "Enter" && selectedOptionId && !submitting) void saveAnswer();
    }

    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  });

  if (result) {
    const weakest = result.skillBreakdown.slice(0, 3);
    const strongest = [...result.skillBreakdown].sort((a, b) => b.mastery - a.mastery)[0];

    return (
      <section className="card diagnostic-result" aria-live="polite">
        <div className="eyebrow">Diagnostic terminé</div>
        <h2>Ton niveau est estimé entre {result.scoreLow} et {result.scoreHigh}.</h2>
        <p className="diagnostic-disclaimer">Cette fourchette provient d’un diagnostic court. Elle s’affinera avec les séances et les mini-examens.</p>

        <div className="stats diagnostic-stats">
          <div className="stat"><div className="stat-label">Estimation centrale</div><div className="stat-value">{result.estimatedScore}</div></div>
          <div className="stat"><div className="stat-label">Bonnes réponses</div><div className="stat-value">{result.correctAnswers}/{result.totalQuestions}</div></div>
          <div className="stat"><div className="stat-label">Meilleur domaine</div><div className="stat-value diagnostic-skill-value">{strongest?.label ?? "—"}</div></div>
        </div>

        <h3>Les trois priorités de ton programme</h3>
        <div className="diagnostic-breakdown">
          {weakest.map((skill, priorityIndex) => (
            <div className="diagnostic-skill" key={skill.skillId}>
              <div><strong>{priorityIndex + 1}. {skill.label}</strong><span>{skill.correct}/{skill.total} réponses correctes</span></div>
              <strong>{skill.mastery}%</strong>
            </div>
          ))}
        </div>

        <div className="diagnostic-actions">
          <Link className="btn btn-primary" href="/dashboard">Voir mon programme personnalisé</Link>
          <button className="btn btn-secondary" type="button" onClick={() => window.location.reload()}>Refaire le diagnostic</button>
        </div>
      </section>
    );
  }

  if (!question) return <div className="alert alert-warning">Aucune question n’est disponible pour le moment.</div>;

  return (
    <section className="card question-shell diagnostic-shell">
      <div className="diagnostic-progress" aria-label={`Progression : ${progress}%`}><div style={{ width: `${Math.max(4, progress)}%` }} /></div>
      <div className="question-body">
        <div className="question-header">
          <div className="question-meta">
            <span className="badge">Partie {question.part}</span>
            <span className="badge">{question.skillLabel}</span>
          </div>
          <span className="question-counter">Question {index + 1} sur {questions.length}</span>
        </div>
        <div className="question-text" style={{ whiteSpace: "pre-line" }}>{question.prompt}</div>
        <div className="options" role="group" aria-label="Choix de réponse">
          {question.options.map((option) => (
            <button
              className={`option ${selectedOptionId === option.id ? "selected" : ""}`}
              key={option.id}
              type="button"
              onClick={() => setSelectedOptionId(option.id)}
              aria-pressed={selectedOptionId === option.id}
            >
              <span className="option-letter">{option.id}</span>
              <span className="option-copy">{option.text}</span>
              <span className="option-shortcut">Touche {option.id}</span>
            </button>
          ))}
        </div>
        {error ? <div className="alert alert-error" style={{ marginTop: 18 }}>{error}</div> : null}
        <div className="question-actions">
          <span className="question-action-hint">Utilise A–D pour choisir, puis Entrée.</span>
          <button className="btn btn-primary" type="button" disabled={!selectedOptionId || submitting} onClick={saveAnswer}>
            {submitting ? "Analyse en cours…" : index === questions.length - 1 ? "Terminer et analyser" : "Question suivante"}
          </button>
        </div>
      </div>
    </section>
  );
}
