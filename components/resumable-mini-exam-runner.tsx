"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MINI_EXAM_DURATION_SECONDS, type PublicMiniExamQuestion } from "@/lib/mini-exam-bank";
import type { MiniExamDraftState } from "@/lib/session-drafts";

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

function remainingFrom(startedAt: number) {
  return Math.max(0, MINI_EXAM_DURATION_SECONDS - Math.floor((Date.now() - startedAt) / 1000));
}

export function ResumableMiniExamRunner({
  questions,
  initialDraft = null
}: {
  questions: PublicMiniExamQuestion[];
  initialDraft?: MiniExamDraftState | null;
}) {
  const restoredStart = initialDraft ? new Date(initialDraft.startedAt).getTime() : Date.now();
  const [started, setStarted] = useState(Boolean(initialDraft));
  const [index, setIndex] = useState(initialDraft?.index ?? 0);
  const [selected, setSelected] = useState<string | null>(initialDraft?.selected ?? null);
  const [answers, setAnswers] = useState<Record<string, string>>(initialDraft?.answers ?? {});
  const [timings, setTimings] = useState<Record<string, number>>(initialDraft?.timings ?? {});
  const [remainingSeconds, setRemainingSeconds] = useState(initialDraft ? remainingFrom(restoredStart) : MINI_EXAM_DURATION_SECONDS);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resumed, setResumed] = useState(Boolean(initialDraft));
  const examStartedAt = useRef(restoredStart);
  const questionStartedAt = useRef(initialDraft ? new Date(initialDraft.questionStartedAt).getTime() : Date.now());
  const saveChain = useRef<Promise<void>>(Promise.resolve());
  const autoSubmitted = useRef(false);

  const question = questions[index];
  const progress = questions.length > 0 ? Math.round(((index + 1) / questions.length) * 100) : 0;

  function draft(overrides: Partial<MiniExamDraftState> = {}): MiniExamDraftState {
    return {
      version: 1,
      questionIds: questions.map((item) => item.id),
      index,
      selected,
      answers,
      timings,
      startedAt: new Date(examStartedAt.current).toISOString(),
      questionStartedAt: new Date(questionStartedAt.current).toISOString(),
      ...overrides
    };
  }

  function persistDraft(nextDraft: MiniExamDraftState) {
    saveChain.current = saveChain.current
      .catch(() => undefined)
      .then(async () => {
        const response = await fetch("/api/session-drafts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind: "mini_exam", payload: nextDraft, startedAt: nextDraft.startedAt })
        });
        if (!response.ok) throw new Error("DRAFT_SAVE_FAILED");
      });
  }

  async function deleteDraft() {
    await fetch("/api/session-drafts?kind=mini_exam", { method: "DELETE" }).catch(() => undefined);
  }

  useEffect(() => {
    if (!started || result) return;
    const update = () => setRemainingSeconds(remainingFrom(examStartedAt.current));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [started, result]);

  useEffect(() => {
    if (!started || result || submitting || remainingSeconds > 0 || autoSubmitted.current) return;
    autoSubmitted.current = true;
    const responseTimeMs = question ? Math.max(0, Date.now() - questionStartedAt.current) : 0;
    const finalAnswers = question && selected ? { ...answers, [question.id]: selected } : answers;
    const finalTimings = question && selected ? { ...timings, [question.id]: responseTimeMs } : timings;
    void submitExam(finalAnswers, finalTimings, true);
  }, [remainingSeconds, started, result, submitting, answers, timings, question, selected]);

  function beginExam() {
    const now = Date.now();
    examStartedAt.current = now;
    questionStartedAt.current = now;
    setRemainingSeconds(MINI_EXAM_DURATION_SECONDS);
    setStarted(true);
    persistDraft(draft({
      index: 0,
      selected: null,
      answers: {},
      timings: {},
      startedAt: new Date(now).toISOString(),
      questionStartedAt: new Date(now).toISOString()
    }));
  }

  function chooseOption(optionId: string) {
    if (submitting) return;
    setSelected(optionId);
    persistDraft(draft({ selected: optionId }));
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
      const durationMs = Math.min(MINI_EXAM_DURATION_SECONDS * 1000, Math.max(0, Date.now() - examStartedAt.current));
      const response = await fetch("/api/mock-exam/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: payloadAnswers, durationMs })
      });
      const payload = (await response.json()) as ExamResult & ApiError;
      if (!response.ok) throw new Error(payload.error ?? "Le mini-examen n’a pas pu être corrigé.");
      await deleteDraft();
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
    const nextIndex = index + 1;
    const nextStartedAt = Date.now();
    setIndex(nextIndex);
    setSelected(null);
    questionStartedAt.current = nextStartedAt;
    persistDraft(draft({
      index: nextIndex,
      selected: null,
      answers: saved.nextAnswers,
      timings: saved.nextTimings,
      questionStartedAt: new Date(nextStartedAt).toISOString()
    }));
  }

  async function restartExam() {
    setSubmitting(true);
    await deleteDraft();
    window.location.reload();
  }

  useEffect(() => {
    if (!started || result) return;
    function handleKeyboard(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, select, button") || event.metaKey || event.ctrlKey || event.altKey) return;
      const optionKey = event.key.toUpperCase();
      if (question && ["A", "B", "C", "D"].includes(optionKey)) {
        const option = question.options.find((item) => item.id === optionKey);
        if (option) chooseOption(option.id);
        return;
      }
      if (event.key === "Enter" && selected && !submitting) goNext();
    }
    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  });

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
        <div className="notice" style={{ marginBottom: 22 }}>Le mini-examen est sauvegardé après chaque réponse. Fermer la page ne remet pas le chronomètre à zéro.</div>
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
      {resumed ? (
        <div className="resume-banner resume-banner-exam">
          <div><strong>Mini-examen repris</strong><span>Le chronomètre a continué pendant ton absence.</span></div>
          <button type="button" className="btn btn-ghost compact-btn" onClick={() => void restartExam()} disabled={submitting}>Abandonner et recommencer</button>
          <button type="button" className="resume-dismiss" aria-label="Masquer ce message" onClick={() => setResumed(false)}>×</button>
        </div>
      ) : null}
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
            <button type="button" className={`option ${selected === option.id ? "selected" : ""}`} key={option.id} onClick={() => chooseOption(option.id)} disabled={submitting} aria-pressed={selected === option.id}>
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
