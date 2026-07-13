"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  MINI_EXAM_DURATION_SECONDS,
  type PublicMiniExamQuestion
} from "@/lib/mini-exam-bank";

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
  sectionBreakdown: Array<{
    part: number;
    correct: number;
    total: number;
    accuracy: number;
  }>;
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
    const timer = window.setInterval(() => {
      setRemainingSeconds((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [started, result]);

  useEffect(() => {
    if (!started || result || submitting || remainingSeconds > 0 || autoSubmitted.current) return;
    autoSubmitted.current = true;
    void submitExam(answers, timings, true);
  }, [remainingSeconds, started, result, submitting, answers, timings]);

  function beginExam() {
    examStartedAt.current = Date.now();
    questionStartedAt.current = Date.now();
    setStarted(true);
  }

  function saveCurrentAnswer() {
    if (!question || !selected) return null;
    const nextAnswers = { ...answers, [question.id]: selected };
    const nextTimings = {
      ...timings,
      [question.id]: Math.max(0, Date.now() - questionStartedAt.current)
    };
    setAnswers(nextAnswers);
    setTimings(nextTimings);
    return { nextAnswers, nextTimings };
  }

  async function submitExam(
    answerState: Record<string, string>,
    timingState: Record<string, number>,
    timedOut = false
  ) {
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
          durationMs: Math.min(
            MINI_EXAM_DURATION_SECONDS * 1000,
            Date.now() - examStartedAt.current
          )
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
        <div className="eyebrow">Mini-examen chronométré</div>
        <h2>30 questions · 25 minutes</h2>
        <p className="muted-copy">
          Les parties 5, 6 et 7 sont mélangées. Tu ne verras pas les corrections pendant le test.
          Le résultat créera un nouveau point dans ta courbe de score.
        </p>
        <div className="exam-rules">
          <div><strong>15</strong><span>questions Partie 5</span></div>
          <div><strong>5</strong><span>questions Partie 6</span></div>
          <div><strong>10</strong><span>questions Partie 7</span></div>
        </div>
        <button type="button" className="btn btn-primary" onClick={beginExam}>Commencer le chronomètre</button>
      </section>
    );
  }

  if (result) {
    return (
      <section className="card exam-result">
        <div className="eyebrow">Mini-examen terminé</div>
        <h2>Score estimé : {result.scoreLow}–{result.scoreHigh}</h2>
        <p className="muted-copy">
          Estimation centrale {result.estimatedScore}, avec une confiance {result.confidence}. Ce résultat reste interne à ScoreSprint et ne constitue pas un score officiel.
        </p>
        <div className="stats exam-result-stats">
          <div className="stat"><div className="stat-label">Réussite</div><div className="stat-value">{result.correctAnswers}/{result.totalQuestions}</div></div>
          <div className="stat"><div className="stat-label">Précision</div><div className="stat-value">{result.accuracy}%</div></div>
          <div className="stat"><div className="stat-label">Temps</div><div className="stat-value exam-small-value">{formatDuration(result.durationMs)}</div></div>
        </div>
        <div className="exam-section-results">
          {result.sectionBreakdown.map((section) => (
            <div key={section.part}>
              <span>Partie {section.part}</span>
              <strong>{section.correct}/{section.total} · {section.accuracy}%</strong>
            </div>
          ))}
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
        <div>
          <strong>Question {index + 1}/{questions.length}</strong>
          <span>Partie {question.part}</span>
        </div>
        <div className={`exam-timer ${remainingSeconds <= 300 ? "exam-timer-warning" : ""}`}>
          {formatTimer(remainingSeconds)}
        </div>
      </div>
      <div className="session-progress" aria-label={`Progression : ${progress}%`}>
        <div className="session-progress-fill" style={{ width: `${Math.max(3, progress)}%` }} />
      </div>
      <div className="question-meta">
        <span className="badge">Partie {question.part}</span>
        <span className="badge">{question.skillLabel}</span>
        <span className="badge">Difficulté {question.difficulty}/5</span>
      </div>
      <div className="question-subskill">{question.subskill}</div>
      {question.context ? <div className="reading-context">{question.context}</div> : null}
      <div className="question-text">{question.prompt}</div>
      <div className="options">
        {question.options.map((option) => (
          <button
            type="button"
            className={`option ${selected === option.id ? "selected" : ""}`}
            key={option.id}
            onClick={() => setSelected(option.id)}
            disabled={submitting}
            aria-pressed={selected === option.id}
          >
            <strong style={{ marginRight: 10 }}>{option.id}.</strong>{option.text}
          </button>
        ))}
      </div>
      {error ? <div className="alert alert-error" style={{ marginTop: 18 }}>{error}</div> : null}
      <div className="question-actions exam-actions">
        <span className="muted-copy">Aucune correction avant la fin.</span>
        <button type="button" className="btn btn-primary" disabled={!selected || submitting} onClick={goNext}>
          {submitting ? "Correction…" : index === questions.length - 1 ? "Terminer et corriger" : "Question suivante"}
        </button>
      </div>
    </section>
  );
}
