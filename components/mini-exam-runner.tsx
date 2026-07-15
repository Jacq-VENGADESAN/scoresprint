"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MINI_EXAM_DURATION_SECONDS, type PublicMiniExamQuestion } from "@/lib/mini-exam-bank";

type ExamResult = {
  runId: string;
  correctAnswers: number;
  totalQuestions: number;
  accuracy: number;
  estimatedScore: number;
  scoreLow: number;
  scoreHigh: number;
  confidence: string;
  durationMs: number;
  sectionBreakdown: Array<{ part: number; correct: number; total: number; accuracy: number }>;
};

type ApiError = { error?: string };

function formatTimer(seconds: number) {
  const minutes = Math.floor(Math.max(0, seconds) / 60);
  const rest = Math.max(0, seconds) % 60;
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

function formatDuration(durationMs: number) {
  const seconds = Math.round(durationMs / 1000);
  return `${Math.floor(seconds / 60)} min ${String(seconds % 60).padStart(2, "0")} s`;
}

export function MiniExamRunner({ questions }: { questions: PublicMiniExamQuestion[] }) {
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timings, setTimings] = useState<Record<string, number>>({});
  const [remainingSeconds, setRemainingSeconds] = useState(MINI_EXAM_DURATION_SECONDS);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const questionStartedAt = useRef(Date.now());
  const examStartedAt = useRef(Date.now());
  const autoSubmitted = useRef(false);

  const question = questions[index];
  const progress = questions.length > 0 ? Math.round(((index + 1) / questions.length) * 100) : 0;

  useEffect(() => {
    if (!started || result) return;
    const timer = window.setInterval(() => setRemainingSeconds((current) => Math.max(0, current - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [started, result]);

  useEffect(() => {
    if (!started || result || submitting || remainingSeconds > 0 || autoSubmitted.current) return;
    autoSubmitted.current = true;
    void submitExam(answers, timings, true);
  }, [remainingSeconds, started, result, submitting, answers, timings]);

  useEffect(() => {
    if (!started || result) return;
    function handleKeyboard(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, select, button") || event.metaKey || event.ctrlKey || event.altKey) return;
      const optionKey = event.key.toUpperCase();
      if (question && ["A", "B", "C", "D"].includes(optionKey)) {
        const option = question.options.find((item) => item.id === optionKey);
        if (option) setSelected(option.id);
        return;
      }
      if (event.key === "Enter" && selected && !submitting) goNext();
    }
    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  });

  function beginExam() {
    examStartedAt.current = Date.now();
    questionStartedAt.current = Date.now();
    setStarted(true);
  }

  function saveCurrentAnswer() {
    if (!question || !selected) return null;
    const nextAnswers = { ...answers, [question.id]: selected };
    const nextTimings = { ...timings, [question.id]: Math.max(0, Date.now() - questionStartedAt.current) };
    setAnswers(nextAnswers);
    setTimings(nextTimings);
    return { nextAnswers, nextTimings };
  }

  async function submitExam(answerState: Record<string, string>, timingState: Record<string, number>, timedOut = false) {
    if (submitting || result) return;
    setSubmitting(true);
    setError(null);

    try {
      const payloadAnswers = questions.map((item) => ({
        questionId: item.id,
        selectedOptionId: answerState[item.id] ?? "",
        responseTimeMs: timingState[item.id] ?? 0
      }));
      const response = await fetch("/api/mock-exam/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: payloadAnswers,
          durationMs: Math.min(MINI_EXAM_DURATION_SECONDS * 1000, Date.now() - examStartedAt.current)
        })
      });
      const payload = (await response.json()) as ExamResult & ApiError;
      if (!response.ok) throw new Error(payload.error ?? "Le mini-examen n’a pas pu être corrigé.");
      setResult(payload);
      if (timedOut) setRemainingSeconds(0);
    } catch (caught) {
      autoSubmitted.current = false;
      setError(caught instanceof Error ? caught.message : "Le mini-examen n’a pas pu être corrigé.");
    } finally {
      setSubmitting(false);
    }
  }

  function goNext() {
    const saved = saveCurrentAnswer();
    if (!saved) return;
    if (index === questions.length - 1) {
      void submitExam(saved.nextAnswers, saved.nextTimings);
      return;
    }
    setIndex((current) => current + 1);
    setSelected(null);
    questionStartedAt.current = Date.now();
  }

  if (!started) {
    return (
      <section className="card exam-intro">
        <div className="eyebrow">Avant de commencer</div>
        <h2>30 questions en 25 minutes.</h2>
        <p className="muted-copy">Les parties 5, 6 et 7 sont mélangées. Les corrections restent cachées jusqu’à la fin et le chronomètre démarre uniquement lorsque tu cliques ci-dessous.</p>
        <div className="exam-rules">
          <div><strong>15</strong><span>questions Partie 5</span></div>
          <div><strong>5</strong><span>questions Partie 6</span></div>
          <div><strong>10</strong><span>questions Partie 7</span></div>
        </div>
        <div className="notice" style={{ marginBottom: 22 }}>Prévois un endroit calme. Le test est envoyé automatiquement lorsque le temps est écoulé.</div>
        <button type="button" className="btn btn-primary" onClick={beginExam}>Démarrer le chronomètre</button>
      </section>
    );
  }

  if (result) {
    return (
      <section className="card exam-result" aria-live="polite">
        <div className="eyebrow">Mini-examen terminé</div>
        <h2>Score estimé : {result.scoreLow}–{result.scoreHigh}</h2>
        <p className="muted-copy">Estimation centrale {result.estimatedScore}, avec une confiance {result.confidence}. Ce résultat reste interne à ScoreSprint.</p>
        <div className="stats exam-result-stats">
          <div className="stat"><div className="stat-label">Réussite</div><div className="stat-value">{result.correctAnswers}/{result.totalQuestions}</div></div>
          <div className="stat"><div className="stat-label">Précision</div><div className="stat-value">{result.accuracy}%</div></div>
          <div className="stat"><div className="stat-label">Temps</div><div className="stat-value exam-small-value">{formatDuration(result.durationMs)}</div></div>
        </div>
        <div className="exam-section-results">
          {result.sectionBreakdown.map((section) => <div key={section.part}><span>Partie {section.part}</span><strong>{section.correct}/{section.total} · {section.accuracy}%</strong></div>)}
        </div>
        <div className="session-end-actions">
          <Link href="/dashboard" className="btn btn-primary">Voir ma courbe de progression</Link>
          <Link href="/practice" className="btn btn-secondary">Continuer l’entraînement</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="card question-shell exam-shell">
      <div className="exam-topbar">
        <div><strong>Question {index + 1}/{questions.length}</strong><span>Partie {question.part}</span></div>
        <div className={`exam-timer ${remainingSeconds <= 300 ? "exam-timer-warning" : ""}`} aria-label={`${formatTimer(remainingSeconds)} restantes`}>{formatTimer(remainingSeconds)}</div>
      </div>
      <div className="session-progress" aria-label={`Progression : ${progress}%`}><div className="session-progress-fill" style={{ width: `${Math.max(3, progress)}%` }} /></div>
      <div className="question-body">
        <div className="question-header">
          <div className="question-meta"><span className="badge">Partie {question.part}</span><span className="badge">{question.skillLabel}</span><span className="badge">Difficulté {question.difficulty}/5</span></div>
          <span className="question-counter">{Object.keys(answers).length} réponse{Object.keys(answers).length > 1 ? "s" : ""} enregistrée{Object.keys(answers).length > 1 ? "s" : ""}</span>
        </div>
        <div className="question-subskill">{question.subskill}</div>
        {question.context ? <div className="reading-context">{question.context}</div> : null}
        <div className="question-text">{question.prompt}</div>
        <div className="options" role="group" aria-label="Choix de réponse">
          {question.options.map((option) => (
            <button type="button" className={`option ${selected === option.id ? "selected" : ""}`} key={option.id} onClick={() => setSelected(option.id)} disabled={submitting} aria-pressed={selected === option.id}>
              <span className="option-letter">{option.id}</span><span className="option-copy">{option.text}</span><span className="option-shortcut">Touche {option.id}</span>
            </button>
          ))}
        </div>
        {error ? <div className="alert alert-error" style={{ marginTop: 18 }}>{error}</div> : null}
        <div className="question-actions exam-actions">
          <span className="question-action-hint">A–D pour répondre · Entrée pour continuer</span>
          <button type="button" className="btn btn-primary" disabled={!selected || submitting} onClick={goNext}>
            {submitting ? "Correction…" : index === questions.length - 1 ? "Terminer et corriger" : "Question suivante"}
          </button>
        </div>
      </div>
    </section>
  );
}
