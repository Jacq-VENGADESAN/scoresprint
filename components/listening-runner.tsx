"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ListeningScene } from "@/components/listening-scene";
import type { ListeningMode, ListeningOptionId, PublicListeningQuestion } from "@/lib/listening-bank";

type AnswerResult = {
  isCorrect: boolean;
  correctOptionId: string;
  selectedFeedback: string;
  explanation: string;
  trap: string;
  promptTranscript: string;
  optionTranscripts: Array<{ id: ListeningOptionId; text: string }>;
  masteryBefore: number;
  masteryAfter: number;
  confidence: string;
  evidenceCount: number;
};

type Summary = {
  runId: string;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  estimatedScore: number;
  durationMs: number;
  part1: { correct: number; total: number; accuracy: number };
  part2: { correct: number; total: number; accuracy: number };
  totalPlays: number;
  slowPlays: number;
  confidence: string;
};

type ApiError = { error?: string };

type PlayStats = Record<string, { normal: number; slow: number }>;

function modeLabel(mode: ListeningMode) {
  if (mode === "part1") return "Partie 1 · Photographies";
  if (mode === "part2") return "Partie 2 · Questions-réponses";
  return "Mix Parties 1 et 2";
}

function formatDuration(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.round(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes} min ${String(seconds).padStart(2, "0")} s`;
}

function delay(milliseconds: number) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

export function ListeningRunner({ questions, mode }: { questions: PublicListeningQuestion[]; mode: ListeningMode }) {
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<ListeningOptionId | null>(null);
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [runId, setRunId] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [audioSupported, setAudioSupported] = useState(true);
  const [playStats, setPlayStats] = useState<PlayStats>({});
  const [error, setError] = useState<string | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const sessionStartedAt = useRef(Date.now());
  const questionStartedAt = useRef(Date.now());
  const speechSequence = useRef(0);

  const question = questions[index];
  const progress = questions.length > 0 ? Math.round((index / questions.length) * 100) : 0;

  useEffect(() => {
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
      setAudioSupported(false);
      return;
    }
    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices().filter((voice) => voice.lang.toLowerCase().startsWith("en"));
    };
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => {
      window.speechSynthesis.cancel();
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, []);

  useEffect(() => {
    function handleKeyboard(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, select, button") || event.metaKey || event.ctrlKey || event.altKey) return;
      const key = event.key.toUpperCase();
      if (!result && question?.options.some((option) => option.id === key)) {
        setSelected(key as ListeningOptionId);
        return;
      }
      if (event.key === " " && started && !loading) {
        event.preventDefault();
        void playAudio(false);
        return;
      }
      if (event.key === "Enter" && started && !loading) {
        if (result) void nextQuestion();
        else if (selected) void submitAnswer();
      }
    }
    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  });

  function selectedVoice(profile: number, offset: number) {
    const voices = voicesRef.current;
    if (voices.length === 0) return undefined;
    return voices[(profile + offset) % voices.length];
  }

  function speak(text: string, rate: number, voiceOffset: number, sequence: number) {
    return new Promise<void>((resolve, reject) => {
      if (sequence !== speechSequence.current) return resolve();
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = selectedVoice(question?.voiceProfile ?? 0, voiceOffset);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = "en-US";
      }
      utterance.rate = rate;
      utterance.pitch = 1;
      utterance.onend = () => resolve();
      utterance.onerror = () => reject(new Error("AUDIO_FAILED"));
      window.speechSynthesis.speak(utterance);
    });
  }

  async function playAudio(slow: boolean) {
    if (!question || speaking || !audioSupported) return;
    const sequence = speechSequence.current + 1;
    speechSequence.current = sequence;
    window.speechSynthesis.cancel();
    setSpeaking(true);
    setError(null);
    const rate = slow ? 0.74 : 0.94;
    setPlayStats((current) => {
      const stats = current[question.id] ?? { normal: 0, slow: 0 };
      return {
        ...current,
        [question.id]: slow ? { ...stats, slow: stats.slow + 1 } : { ...stats, normal: stats.normal + 1 }
      };
    });

    try {
      if (question.part === 2) {
        await speak(question.promptAudio, rate, 0, sequence);
        await delay(360);
      }
      for (let optionIndex = 0; optionIndex < question.options.length; optionIndex += 1) {
        const option = question.options[optionIndex];
        await speak(`${option.id}. ${option.text}`, rate, question.part === 2 ? 1 : 0, sequence);
        if (optionIndex < question.options.length - 1) await delay(300);
      }
    } catch {
      setError("La voix du navigateur n’a pas pu lire cet exercice. Essaie avec Chrome, Edge ou Safari.");
    } finally {
      if (sequence === speechSequence.current) setSpeaking(false);
    }
  }

  async function beginSession() {
    if (loading || questions.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/listening/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, questionIds: questions.map((item) => item.id) })
      });
      const payload = (await response.json()) as { runId?: string; startedAt?: string } & ApiError;
      if (!response.ok || !payload.runId) throw new Error(payload.error ?? "La séance n’a pas pu démarrer.");
      setRunId(payload.runId);
      sessionStartedAt.current = payload.startedAt ? new Date(payload.startedAt).getTime() : Date.now();
      questionStartedAt.current = Date.now();
      setStarted(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "La séance n’a pas pu démarrer.");
    } finally {
      setLoading(false);
    }
  }

  async function submitAnswer() {
    if (!runId || !question || !selected || result || loading) return;
    setLoading(true);
    setError(null);
    window.speechSynthesis.cancel();
    speechSequence.current += 1;
    setSpeaking(false);
    const stats = playStats[question.id] ?? { normal: 0, slow: 0 };

    try {
      const response = await fetch("/api/listening/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          runId,
          questionId: question.id,
          selectedOptionId: selected,
          responseTimeMs: Date.now() - questionStartedAt.current,
          playCount: stats.normal + stats.slow,
          slowPlayCount: stats.slow
        })
      });
      const payload = (await response.json()) as AnswerResult & ApiError;
      if (!response.ok) throw new Error(payload.error ?? "La correction a échoué.");
      setResult(payload);
      if (payload.isCorrect) setCorrectCount((current) => current + 1);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "La correction a échoué.");
    } finally {
      setLoading(false);
    }
  }

  async function completeSession() {
    if (!runId || loading) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/listening/session/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId, durationMs: Date.now() - sessionStartedAt.current })
      });
      const payload = (await response.json()) as Summary & ApiError;
      if (!response.ok) throw new Error(payload.error ?? "Le bilan n’a pas pu être créé.");
      setSummary(payload);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Le bilan n’a pas pu être créé.");
    } finally {
      setLoading(false);
    }
  }

  async function nextQuestion() {
    if (index === questions.length - 1) {
      await completeSession();
      return;
    }
    window.speechSynthesis.cancel();
    speechSequence.current += 1;
    setSpeaking(false);
    setIndex((current) => current + 1);
    setSelected(null);
    setResult(null);
    setError(null);
    questionStartedAt.current = Date.now();
  }

  if (questions.length === 0) {
    return <section className="card exam-intro centered-session"><h2>Aucun exercice d’écoute n’est disponible.</h2></section>;
  }

  if (summary) {
    return (
      <section className="card listening-summary" aria-live="polite">
        <div className="eyebrow">Séance terminée</div>
        <h2>{summary.correctAnswers}/{summary.totalQuestions} réponses correctes</h2>
        <p className="muted-copy">Estimation Listening interne : <strong>{summary.estimatedScore}/495</strong>, avec une confiance {summary.confidence}.</p>
        <div className="stats listening-summary-stats">
          <div className="stat"><div className="stat-label">Réussite</div><div className="stat-value">{summary.accuracy}%</div></div>
          <div className="stat"><div className="stat-label">Temps actif</div><div className="stat-value listening-stat-small">{formatDuration(summary.durationMs)}</div></div>
          <div className="stat"><div className="stat-label">Écoutes ralenties</div><div className="stat-value">{summary.slowPlays}</div></div>
        </div>
        <div className="listening-breakdown">
          {summary.part1.total > 0 ? <div><span>Partie 1 · Photographies</span><strong>{summary.part1.correct}/{summary.part1.total} · {summary.part1.accuracy}%</strong></div> : null}
          {summary.part2.total > 0 ? <div><span>Partie 2 · Questions-réponses</span><strong>{summary.part2.correct}/{summary.part2.total} · {summary.part2.accuracy}%</strong></div> : null}
        </div>
        <div className="notice">Cette estimation n’est pas un score officiel. Elle sert à suivre ta progression sur les exercices originaux d’Aptileo.</div>
        <div className="session-end-actions">
          <Link href="/dashboard" className="btn btn-primary">Voir mon tableau de bord</Link>
          <Link href={`/listening?mode=${mode}`} className="btn btn-secondary">Nouvelle séance</Link>
        </div>
      </section>
    );
  }

  if (!started) {
    return (
      <section className="card listening-intro">
        <div className="listening-intro-copy">
          <div className="eyebrow">{modeLabel(mode)}</div>
          <h2>{questions.length} exercices originaux, sans transcription avant la correction.</h2>
          <p className="muted-copy">La voix est produite directement par ton navigateur. Choisis une réponse uniquement à l’oreille, puis consulte le script et l’explication.</p>
          <div className="listening-rules">
            <div><strong>Normal</strong><span>Débit proche d’une conversation professionnelle</span></div>
            <div><strong>Ralenti</strong><span>Mode apprentissage disponible à tout moment</span></div>
            <div><strong>A–D</strong><span>Raccourcis clavier pour répondre</span></div>
          </div>
          {!audioSupported ? <div className="alert alert-warning">La lecture vocale n’est pas prise en charge par ce navigateur.</div> : null}
          {error ? <div className="alert alert-error">{error}</div> : null}
          <button type="button" className="btn btn-primary" onClick={beginSession} disabled={loading || !audioSupported}>
            {loading ? "Préparation…" : "Commencer la séance"}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="card question-shell listening-shell">
      <div className="session-progress" aria-label={`Progression : ${progress}%`}><div className="session-progress-fill" style={{ width: `${Math.max(3, progress)}%` }} /></div>
      <div className="question-body">
        <div className="question-header">
          <div className="question-meta">
            <span className="badge">Partie {question.part}</span>
            <span className="badge">{question.skillLabel}</span>
            <span className="badge">Difficulté {question.difficulty}/5</span>
          </div>
          <span className="question-counter">Question {index + 1} sur {questions.length}</span>
        </div>

        {question.scene ? <ListeningScene scene={question.scene} /> : (
          <div className="listening-audio-visual" aria-hidden="true">
            <span className="listening-wave" /><span className="listening-wave" /><span className="listening-wave" /><span className="listening-wave" /><span className="listening-wave" />
          </div>
        )}

        <div className="listening-player" aria-label="Lecteur audio">
          <div><strong>{speaking ? "Lecture en cours…" : "Écoute l’enregistrement"}</strong><span>{question.part === 1 ? "Quatre descriptions sont lues." : "Une question puis trois réponses sont lues."}</span></div>
          <div className="listening-player-actions">
            <button type="button" className="btn btn-primary" onClick={() => void playAudio(false)} disabled={speaking || loading}>▶ Vitesse normale</button>
            <button type="button" className="btn btn-secondary" onClick={() => void playAudio(true)} disabled={speaking || loading}>0,75× Ralenti</button>
          </div>
        </div>

        <div className="listening-choice-grid" role="group" aria-label="Choix de réponse">
          {question.options.map((option) => {
            const classes = ["listening-choice"];
            if (selected === option.id) classes.push("selected");
            if (result && option.id === result.correctOptionId) classes.push("correct");
            if (result && option.id === selected && !result.isCorrect) classes.push("wrong");
            return (
              <button
                type="button"
                key={option.id}
                className={classes.join(" ")}
                onClick={() => setSelected(option.id)}
                disabled={Boolean(result) || loading}
                aria-pressed={selected === option.id}
                aria-label={`Choisir la réponse ${option.id}`}
              >
                <span>{option.id}</span>
                <small>{result ? option.text : `Réponse ${option.id}`}</small>
              </button>
            );
          })}
        </div>

        {error ? <div className="alert alert-error" style={{ marginTop: 18 }}>{error}</div> : null}

        {result ? (
          <div className={`answer-feedback ${result.isCorrect ? "answer-feedback-correct" : "answer-feedback-wrong"}`} aria-live="polite">
            <h3>{result.isCorrect ? "Bonne réponse." : `La bonne réponse était ${result.correctOptionId}.`}</h3>
            <p>{result.selectedFeedback}</p>
            <div className="listening-transcript">
              <strong>Transcription</strong>
              {question.part === 2 ? <p className="listening-prompt-transcript">{result.promptTranscript}</p> : null}
              <ol>
                {result.optionTranscripts.map((option) => <li key={option.id}><span>{option.id}</span>{option.text}</li>)}
              </ol>
            </div>
            <div className="feedback-grid">
              <div className="feedback-block"><strong>Pourquoi ?</strong>{result.explanation}</div>
              <div className="feedback-block"><strong>Piège fréquent</strong>{result.trap}</div>
            </div>
            <div className="mastery-change">Maîtrise : <strong>{Math.round(result.masteryBefore)}% → {Math.round(result.masteryAfter)}%</strong><div className="score-confidence">Confiance {result.confidence} · {result.evidenceCount} observations</div></div>
          </div>
        ) : null}

        <div className="question-actions">
          <span className="question-action-hint">Espace pour écouter · A–D pour choisir · Entrée pour continuer</span>
          {result ? (
            <button type="button" className="btn btn-primary" onClick={() => void nextQuestion()} disabled={loading}>
              {loading ? "Enregistrement…" : index === questions.length - 1 ? "Voir mon bilan" : "Question suivante"}
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={() => void submitAnswer()} disabled={!selected || loading}>
              {loading ? "Correction…" : "Vérifier ma réponse"}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
