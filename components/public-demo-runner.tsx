"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { trackProductEvent } from "@/components/product-analytics";
import type { DemoOption, DemoQuestion } from "@/lib/demo-bank";

type Answer = { questionId: string; correct: boolean; section: DemoQuestion["section"] };

function speak(text: string, rate = 0.94) {
  return new Promise<void>((resolve, reject) => {
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices().filter((voice) => voice.lang.toLowerCase().startsWith("en"));
    if (voices[0]) utterance.voice = voices[0];
    utterance.lang = voices[0]?.lang ?? "en-US";
    utterance.rate = rate;
    utterance.onend = () => resolve();
    utterance.onerror = () => reject(new Error("AUDIO_FAILED"));
    window.speechSynthesis.speak(utterance);
  });
}

function wait(milliseconds: number) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

export function PublicDemoRunner({ questions }: { questions: DemoQuestion[] }) {
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<DemoOption["id"] | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const startedAt = useRef(Date.now());

  const question = questions[index];
  const finished = started && index >= questions.length;
  const visibleOptions = question?.options.filter((option) => option.text) ?? [];
  const result = useMemo(() => {
    const correct = answers.filter((answer) => answer.correct).length;
    const reading = answers.filter((answer) => answer.section === "Reading");
    const listening = answers.filter((answer) => answer.section === "Listening");
    return {
      correct,
      accuracy: answers.length ? Math.round((correct / answers.length) * 100) : 0,
      reading: reading.length ? Math.round((reading.filter((answer) => answer.correct).length / reading.length) * 100) : 0,
      listening: listening.length ? Math.round((listening.filter((answer) => answer.correct).length / listening.length) * 100) : 0
    };
  }, [answers]);

  function begin() {
    startedAt.current = Date.now();
    setStarted(true);
    trackProductEvent("demo_started", { question_count: questions.length }, "/demo");
  }

  async function playAudio() {
    if (!question || question.section !== "Listening" || speaking) return;
    if (!("speechSynthesis" in window)) {
      setAudioError("La lecture audio n’est pas disponible sur ce navigateur.");
      return;
    }
    setSpeaking(true);
    setAudioError(null);
    window.speechSynthesis.cancel();
    try {
      if (question.audioPrompt) {
        await speak(question.audioPrompt);
        await wait(350);
      }
      for (let optionIndex = 0; optionIndex < visibleOptions.length; optionIndex += 1) {
        const option = visibleOptions[optionIndex];
        await speak(`${option.id}. ${option.text}`);
        if (optionIndex < visibleOptions.length - 1) await wait(280);
      }
    } catch {
      setAudioError("La voix du navigateur n’a pas pu lire cet exercice. Essaie avec Chrome, Edge ou Safari.");
    } finally {
      setSpeaking(false);
    }
  }

  function checkAnswer() {
    if (!question || !selected || revealed) return;
    const correct = selected === question.correctOptionId;
    setAnswers((current) => [...current, { questionId: question.id, correct, section: question.section }]);
    setRevealed(true);
  }

  function next() {
    if (!revealed) return;
    const nextIndex = index + 1;
    if (nextIndex >= questions.length) {
      trackProductEvent("demo_completed", {
        correct_answers: answers.filter((answer) => answer.correct).length,
        total_questions: questions.length,
        duration_seconds: Math.round((Date.now() - startedAt.current) / 1000)
      }, "/demo");
    }
    setIndex(nextIndex);
    setSelected(null);
    setRevealed(false);
    setAudioError(null);
    window.speechSynthesis?.cancel();
  }

  if (!started) {
    return (
      <section className="demo-start-card">
        <div>
          <span className="eyebrow">Sans compte · environ 6 minutes</span>
          <h2>Teste une vraie correction avant de t’inscrire.</h2>
          <p>Huit exercices originaux couvrent Reading et Listening. Chaque réponse est expliquée immédiatement, avec le piège à éviter.</p>
        </div>
        <div className="demo-start-stats" aria-label="Contenu de la démonstration">
          <div><strong>8</strong><span>questions</span></div>
          <div><strong>5</strong><span>parties représentées</span></div>
          <div><strong>0 €</strong><span>aucune carte bancaire</span></div>
        </div>
        <button className="btn btn-primary" type="button" onClick={begin}>Commencer la démonstration</button>
      </section>
    );
  }

  if (finished) {
    return (
      <section className="demo-result-card" aria-live="polite">
        <span className="eyebrow">Démonstration terminée</span>
        <h2>{result.correct}/{questions.length} réponses correctes · {result.accuracy}%</h2>
        <p>Ce résultat très court ne constitue pas une estimation de score. Il permet seulement de découvrir la méthode de correction d’Aptileo.</p>
        <div className="demo-result-grid">
          <div><span>Reading</span><strong>{result.reading}%</strong></div>
          <div><span>Listening</span><strong>{result.listening}%</strong></div>
          <div><span>Prochaine étape</span><strong>Diagnostic personnalisé</strong></div>
        </div>
        <div className="demo-result-actions">
          <Link className="btn btn-primary" href="/onboarding?from=demo" onClick={() => trackProductEvent("signup_intent", { source: "demo_result" }, "/demo")}>Créer mon programme gratuit</Link>
          <Link className="btn btn-secondary" href="/feedback">Donner mon avis sur la démo</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="demo-question-card">
      <div className="demo-progress" aria-label={`Question ${index + 1} sur ${questions.length}`}><span style={{ width: `${((index + 1) / questions.length) * 100}%` }} /></div>
      <div className="demo-question-head">
        <div><span className="badge">{question.section}</span><span className="badge">Partie {question.part}</span><span className="badge">{question.skill}</span></div>
        <strong>{index + 1}/{questions.length}</strong>
      </div>

      {question.photo ? (
        <figure className="demo-photo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={question.photo.src} alt={question.photo.alt} />
          <figcaption><a href={question.photo.creditUrl} target="_blank" rel="noreferrer">Photographie Pexels · voir la source</a></figcaption>
        </figure>
      ) : null}

      {question.context ? <pre className="demo-context">{question.context}</pre> : null}
      <h2 className="demo-prompt">{question.prompt}</h2>

      {question.section === "Listening" ? (
        <div className="demo-audio-player">
          <div><strong>{speaking ? "Lecture en cours…" : "Écoute l’exercice"}</strong><span>La transcription apparaît après ta réponse.</span></div>
          <button className="btn btn-secondary" type="button" onClick={() => void playAudio()} disabled={speaking}>▶ Écouter</button>
        </div>
      ) : null}
      {audioError ? <div className="alert alert-error">{audioError}</div> : null}

      <div className="demo-options" role="group" aria-label="Réponses proposées">
        {visibleOptions.map((option) => {
          const classes = ["demo-option"];
          if (selected === option.id) classes.push("selected");
          if (revealed && option.id === question.correctOptionId) classes.push("correct");
          if (revealed && selected === option.id && option.id !== question.correctOptionId) classes.push("wrong");
          return (
            <button key={option.id} type="button" className={classes.join(" ")} onClick={() => !revealed && setSelected(option.id)} disabled={revealed}>
              <span>{option.id}</span><strong>{question.section === "Listening" && !revealed ? `Réponse ${option.id}` : option.text}</strong>
            </button>
          );
        })}
      </div>

      {revealed ? (
        <div className={`demo-feedback ${selected === question.correctOptionId ? "correct" : "wrong"}`}>
          <h3>{selected === question.correctOptionId ? "Bonne réponse." : `La bonne réponse était ${question.correctOptionId}.`}</h3>
          {question.section === "Listening" ? (
            <div className="demo-transcript"><strong>Transcription</strong>{question.audioPrompt ? <p>{question.audioPrompt}</p> : null}<ol>{visibleOptions.map((option) => <li key={option.id}><span>{option.id}</span>{option.text}</li>)}</ol></div>
          ) : null}
          <div className="demo-feedback-grid"><div><strong>Pourquoi ?</strong><p>{question.explanation}</p></div><div><strong>Piège fréquent</strong><p>{question.trap}</p></div></div>
        </div>
      ) : null}

      <div className="demo-actions">
        {revealed ? <button className="btn btn-primary" type="button" onClick={next}>{index === questions.length - 1 ? "Voir mon résultat" : "Question suivante"}</button> : <button className="btn btn-primary" type="button" onClick={checkAnswer} disabled={!selected}>Vérifier ma réponse</button>}
      </div>
    </section>
  );
}
