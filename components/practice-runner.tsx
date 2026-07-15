"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { QuestionReportButton } from "@/components/question-report-button";
import type { PublicPracticeQuestion } from "@/lib/practice-bank";

type AnswerResult = {
  isCorrect: boolean;
  correctOptionId: string;
  explanation: string;
  trap: string;
  selectedFeedback: string;
  masteryBefore: number;
  masteryAfter: number;
  confidence: string;
  evidenceCount: number;
  nextReviewAt: string | null;
  resolved: boolean;
};

type CompletedAnswer = {
  isCorrect: boolean;
  skillLabel: string;
};

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
  skillSummary: Array<{
    skillId: string;
    correct: number;
    total: number;
    accuracy: number;
  }>;
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

export function PracticeRunner({
  questions,
  reviewMode = false,
  plannedMinutes = 20
}: {
  questions: PublicPracticeQuestion[];
  reviewMode?: boolean;
  plannedMinutes?: number;
}) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [completed, setCompleted] = useState<CompletedAnswer[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const questionStartedAt = useRef(Date.now());
  const sessionStartedAt = useRef(Date.now());

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

  async function ensureSession() {
    if (sessionId) return sessionId;

    const response = await fetch("/api/practice/session/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plannedMinutes,
        mode: reviewMode ? "review" : "adaptive",
        questionIds: questions.map((item) => item.id)
      })
    });
    const payload = (await response.json()) as { sessionId?: string } & ApiError;
    if (!response.ok || !payload.sessionId) throw new Error(payload.error ?? "La séance n’a pas pu démarrer.");
    setSessionId(payload.sessionId);
    return payload.sessionId;
  }

  async function submitAnswer() {
    if (!question || !selected || result || loading) return;
    setLoading(true);
    setError(null);

    try {
      const activeSessionId = await ensureSession();
      const response = await fetch("/api/practice/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: activeSessionId,
          questionId: question.id,
          selectedOptionId: selected,
          responseTimeMs: Date.now() - questionStartedAt.current
        })
      });
      const payload = (await response.json()) as AnswerResult & ApiError;
      if (!response.ok) throw new Error(payload.error ?? "La correction a échoué.");
      setResult(payload);
      setCompleted((current) => [...current, { isCorrect: payload.isCorrect, skillLabel: question.skillLabel }]);
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
      const response = await fetch("/api/practice/session/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          durationMs: Date.now() - sessionStartedAt.current
        })
      });
      const payload = (await response.json()) as SessionSummary & ApiError;
      if (!response.ok) throw new Error(payload.error ?? "Le résumé de séance n’a pas pu être créé.");
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
    setIndex((current) => current + 1);
    setSelected(null);
    setResult(null);
    setError(null);
    questionStartedAt.current = Date.now();
  }

  useEffect(() => {
    function handleKeyboard(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, select, button") || event.metaKey || event.ctrlKey || event.altKey) return;

      const optionKey = event.key.toUpperCase();
      if (!result && question && ["A", "B", "C", "D"].includes(optionKey)) {
        const option = question.options.find((item) => item.id === optionKey);
        if (option) setSelected(option.id);
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
          Temps réel : {formatDuration(summary?.durationMs ?? 0)} · estimation centrale {summary?.estimatedScore ?? "—"} · confiance {summary?.scoreConfidence ?? "faible"}.
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
                onClick={() => setSelected(option.id)}
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
            <button type="button" className="btn btn-primary" disabled={!selected || loading} onClick={submitAnswer}>
              {loading ? "Correction…" : "Vérifier ma réponse"}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
