"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { QuestionReportButton } from "@/components/question-report-button";
import type { PublicPracticeQuestion } from "@/lib/practice-bank";
import type {
  PracticeAnswerResultDraft,
  PracticeCompletedAnswerDraft,
  PracticeDraftState
} from "@/lib/session-drafts";

type AnswerResult = PracticeAnswerResultDraft;
type CompletedAnswer = PracticeCompletedAnswerDraft;

type SessionSummary = {
  sessionId: string;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  durationMs: number;
  completedMinutes: number;
  streak: number;
  estimatedScore: number;
  scoreLow: number;
  scoreHigh: number;
  scoreConfidence: string;
  skillSummary: Array<{ skillId: string; correct: number; total: number; accuracy: number }>;
};

type ApiError = { error?: string };

function formatReviewDate(value: string | null) {
  if (!value) return null;
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long" }).format(new Date(value));
}

function formatDuration(durationMs: number) {
  const totalSeconds = Math.max(0, Math.round(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes} min ${String(seconds).padStart(2, "0")} s` : `${seconds} s`;
}

export function ResumablePracticeRunner({
  questions,
  reviewMode = false,
  plannedMinutes = 20,
  initialDraft = null
}: {
  questions: PublicPracticeQuestion[];
  reviewMode?: boolean;
  plannedMinutes?: number;
  initialDraft?: PracticeDraftState | null;
}) {
  const [index, setIndex] = useState(initialDraft?.index ?? 0);
  const [selected, setSelected] = useState<string | null>(initialDraft?.selected ?? null);
  const [result, setResult] = useState<AnswerResult | null>(initialDraft?.result ?? null);
  const [completed, setCompleted] = useState<CompletedAnswer[]>(initialDraft?.completed ?? []);
  const [sessionId, setSessionId] = useState<string | null>(initialDraft?.sessionId ?? null);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resumed, setResumed] = useState(Boolean(initialDraft));
  const nowAtMount = useRef(Date.now());
  const startedAtIso = useRef(initialDraft?.startedAt ?? new Date(nowAtMount.current).toISOString());
  const sessionStartedAt = useRef(nowAtMount.current - Math.max(0, initialDraft?.elapsedMs ?? 0));
  const questionStartedAt = useRef(nowAtMount.current - Math.max(0, initialDraft?.questionElapsedMs ?? 0));
  const saveChain = useRef<Promise<void>>(Promise.resolve());
  const initialized = useRef(false);

  const questionIds = useMemo(() => questions.map((item) => item.id), [questions]);
  const question = questions[index];
  const finished = index >= questions.length;
  const localCorrectCount = completed.filter((answer) => answer.isCorrect).length;
  const correctCount = summary?.correctAnswers ?? localCorrectCount;
  const progress = questions.length === 0 ? 0 : Math.round(((finished ? questions.length : index) / questions.length) * 100);

  const weakestSessionSkill = useMemo(() => {
    const stats = new Map<string, { correct: number; total: number }>();
    for (const answer of completed) {
      const current = stats.get(answer.skillLabel) ?? { correct: 0, total: 0 };
      current.total += 1;
      if (answer.isCorrect) current.correct += 1;
      stats.set(answer.skillLabel, current);
    }
    return [...stats.entries()].sort((a, b) => (a[1].correct / a[1].total) - (b[1].correct / b[1].total))[0]?.[0] ?? null;
  }, [completed]);

  function snapshot(overrides: Partial<PracticeDraftState> = {}): PracticeDraftState {
    const now = Date.now();
    return {
      version: 1,
      mode: reviewMode ? "review" : "adaptive",
      questionIds,
      index,
      selected,
      result,
      completed,
      sessionId,
      startedAt: startedAtIso.current,
      questionStartedAt: new Date(questionStartedAt.current).toISOString(),
      elapsedMs: Math.max(0, now - sessionStartedAt.current),
      questionElapsedMs: Math.max(0, now - questionStartedAt.current),
      ...overrides
    };
  }

  function persistDraft(draft: PracticeDraftState) {
    saveChain.current = saveChain.current
      .catch(() => undefined)
      .then(async () => {
        const response = await fetch("/api/session-drafts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind: "practice", payload: draft, startedAt: draft.startedAt })
        });
        if (!response.ok) throw new Error("DRAFT_SAVE_FAILED");
      });
  }

  async function deleteDraft() {
    await fetch("/api/session-drafts?kind=practice", { method: "DELETE" }).catch(() => undefined);
  }

  useEffect(() => {
    if (initialized.current || questions.length === 0 || initialDraft) return;
    initialized.current = true;
    persistDraft(snapshot());
  }, [initialDraft, questions.length]);

  async function ensureSession() {
    if (sessionId) return sessionId;
    const response = await fetch("/api/practice/session/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plannedMinutes,
        mode: reviewMode ? "review" : "adaptive",
        questionIds
      })
    });
    const payload = (await response.json()) as { sessionId?: string } & ApiError;
    if (!response.ok || !payload.sessionId) throw new Error(payload.error ?? "La séance n’a pas pu démarrer.");
    setSessionId(payload.sessionId);
    return payload.sessionId;
  }

  function chooseOption(optionId: string) {
    if (result || loading) return;
    setSelected(optionId);
    persistDraft(snapshot({ selected: optionId }));
  }

  async function submitAnswer() {
    if (!question || !selected || result || loading) return;
    setLoading(true);
    setError(null);

    try {
      const activeSessionId = await ensureSession();
      const responseTimeMs = Math.max(0, Date.now() - questionStartedAt.current);
      const response = await fetch("/api/practice/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: activeSessionId,
          questionId: question.id,
          selectedOptionId: selected,
          responseTimeMs
        })
      });
      const payload = (await response.json()) as AnswerResult & ApiError;
      if (!response.ok) throw new Error(payload.error ?? "La correction a échoué.");
      const nextCompleted = [...completed, { isCorrect: payload.isCorrect, skillLabel: question.skillLabel }];
      setResult(payload);
      setCompleted(nextCompleted);
      persistDraft(snapshot({
        selected,
        result: payload,
        completed: nextCompleted,
        sessionId: activeSessionId,
        questionElapsedMs: responseTimeMs
      }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "La correction a échoué.");
    } finally {
      setLoading(false);
    }
  }

  async function finishSession() {
    if (!sessionId || loading) return;
    setLoading(true);
    setError(null);

    try {
      const durationMs = Math.max(0, Date.now() - sessionStartedAt.current);
      const response = await fetch("/api/practice/session/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, durationMs })
      });
      const payload = (await response.json()) as SessionSummary & ApiError;
      if (!response.ok) throw new Error(payload.error ?? "Le résumé de séance n’a pas pu être créé.");
      await deleteDraft();
      setSummary(payload);
      setIndex(questions.length);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Le résumé de séance n’a pas pu être créé.");
    } finally {
      setLoading(false);
    }
  }

  function nextQuestion() {
    if (index === questions.length - 1) {
      void finishSession();
      return;
    }
    const nextIndex = index + 1;
    const nextStartedAt = Date.now();
    setIndex(nextIndex);
    setSelected(null);
    setResult(null);
    setError(null);
    questionStartedAt.current = nextStartedAt;
    persistDraft(snapshot({
      index: nextIndex,
      selected: null,
      result: null,
      questionStartedAt: new Date(nextStartedAt).toISOString(),
      questionElapsedMs: 0
    }));
  }

  async function restartSession() {
    setLoading(true);
    await deleteDraft();
    window.location.reload();
  }

  useEffect(() => {
    function handleKeyboard(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, select, button") || event.metaKey || event.ctrlKey || event.altKey) return;
      const optionKey = event.key.toUpperCase();
      if (!result && question && ["A", "B", "C", "D"].includes(optionKey)) {
        const option = question.options.find((item) => item.id === optionKey);
        if (option) chooseOption(option.id);
        return;
      }
      if (event.key === "Enter" && !loading) {
        if (result) nextQuestion();
        else if (selected) void submitAnswer();
      }
    }
    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  });

  if (questions.length === 0) {
    return (
      <section className="card exam-intro centered-session">
        <div className="eyebrow">Séance indisponible</div>
        <h2>Aucune question n’est prête à être révisée.</h2>
        <p className="muted-copy">Termine d’abord le diagnostic ou reviens lorsqu’une erreur arrivera à échéance.</p>
        <Link href="/dashboard" className="btn btn-primary">Retour au tableau de bord</Link>
      </section>
    );
  }

  if (finished) {
    const accuracy = summary?.accuracy ?? Math.round((correctCount / questions.length) * 100);
    return (
      <section className="card question-shell session-summary" aria-live="polite">
        <div className="eyebrow">Séance enregistrée</div>
        <h2>{correctCount}/{questions.length} réponses correctes</h2>
        <p className="muted-copy">
          Tes maîtrises, ton carnet d’erreurs et ton estimation de score ont été mis à jour.
          {weakestSessionSkill ? ` ${weakestSessionSkill} reste la priorité principale après cette séance.` : ""}
        </p>
        <div className="stats session-summary-stats">
          <div className="stat"><div className="stat-label">Réussite</div><div className="stat-value">{accuracy}%</div></div>
          <div className="stat"><div className="stat-label">Score estimé</div><div className="stat-value small-stat-value">{summary ? `${summary.scoreLow}–${summary.scoreHigh}` : "—"}</div></div>
          <div className="stat"><div className="stat-label">Série actuelle</div><div className="stat-value">{summary?.streak ?? 0} j</div></div>
        </div>
        <div className="notice session-saved-note">
          Temps actif : {formatDuration(summary?.durationMs ?? 0)} · estimation centrale {summary?.estimatedScore ?? "—"} · confiance {summary?.scoreConfidence ?? "faible"}.
        </div>
        <div className="session-end-actions">
          <Link href="/dashboard" className="btn btn-primary">Voir ma progression</Link>
          <Link href="/mock-exam" className="btn btn-secondary">Passer un mini-examen</Link>
        </div>
      </section>
    );
  }

  const reviewDate = result ? formatReviewDate(result.nextReviewAt) : null;

  return (
    <section className="card question-shell">
      {resumed ? (
        <div className="resume-banner">
          <div><strong>Séance reprise</strong><span>Ta progression précédente a été restaurée.</span></div>
          <button type="button" className="btn btn-ghost compact-btn" onClick={() => void restartSession()} disabled={loading}>Recommencer</button>
          <button type="button" className="resume-dismiss" aria-label="Masquer ce message" onClick={() => setResumed(false)}>×</button>
        </div>
      ) : null}
      <div className="session-progress" aria-label={`Progression : question ${index + 1} sur ${questions.length}`}>
        <div className="session-progress-fill" style={{ width: `${Math.max(4, progress)}%` }} />
      </div>
      <div className="question-body">
        <div className="question-header">
          <div className="question-meta">
            <span className="badge">Partie {question.part}</span>
            <span className="badge">{question.skillLabel}</span>
            <span className="badge">Difficulté {question.difficulty}/5</span>
          </div>
          <span className="question-counter">Question {index + 1} sur {questions.length}</span>
        </div>
        <div className="question-subskill">{question.subskill}</div>
        {question.context ? <div className="reading-context">{question.context}</div> : null}
        <div className="question-text">{question.prompt}</div>

        <div className="options" role="group" aria-label="Choix de réponse">
          {question.options.map((option) => {
            const classes = ["option"];
            if (selected === option.id) classes.push("selected");
            if (result && option.id === result.correctOptionId) classes.push("correct");
            if (result && selected === option.id && !result.isCorrect) classes.push("wrong");
            return (
              <button
                type="button"
                key={option.id}
                className={classes.join(" ")}
                disabled={Boolean(result) || loading}
                onClick={() => chooseOption(option.id)}
                aria-pressed={selected === option.id}
              >
                <span className="option-letter">{option.id}</span>
                <span className="option-copy">{option.text}</span>
                <span className="option-shortcut">Touche {option.id}</span>
              </button>
            );
          })}
        </div>

        {error ? <div className="alert alert-error" style={{ marginTop: 18 }}>{error}</div> : null}

        {result ? (
          <div aria-live="polite">
            <div className={`answer-feedback ${result.isCorrect ? "answer-feedback-correct" : "answer-feedback-wrong"}`}>
              <h3>{result.isCorrect ? "Bonne réponse." : `La bonne réponse était ${result.correctOptionId}.`}</h3>
              <div className="feedback-grid">
                <div className="feedback-block"><strong>Ton choix</strong>{result.selectedFeedback}</div>
                <div className="feedback-block"><strong>Règle à retenir</strong>{result.explanation}</div>
              </div>
              <p><strong>Piège fréquent :</strong> {result.trap}</p>
              <div className="mastery-change">
                Maîtrise estimée : <strong>{Math.round(result.masteryBefore)}% → {Math.round(result.masteryAfter)}%</strong>
                <div className="score-confidence">Confiance {result.confidence} · {result.evidenceCount} réponses observées</div>
              </div>
              {result.resolved ? <div className="review-note">Cette erreur est désormais considérée comme maîtrisée.</div> : null}
              {reviewDate ? <div className="review-note">Prochaine révision prévue le {reviewDate}.</div> : null}
            </div>
            <QuestionReportButton questionCode={question.id} selectedOption={selected} />
          </div>
        ) : null}

        <div className="question-actions">
          <span className="question-action-hint">Utilise A–D pour choisir, puis Entrée pour continuer.</span>
          {result ? (
            <button type="button" className="btn btn-primary" disabled={loading} onClick={nextQuestion}>
              {loading ? "Enregistrement…" : index === questions.length - 1 ? "Terminer la séance" : "Question suivante"}
            </button>
          ) : (
            <button type="button" className="btn btn-primary" disabled={!selected || loading} onClick={() => void submitAnswer()}>
              {loading ? "Correction…" : "Vérifier ma réponse"}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
