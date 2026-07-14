"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  MANAGED_SKILLS,
  MANAGED_STATUSES,
  type ManagedOptionInput,
  type ManagedQuestionInput
} from "@/lib/admin-question";

const EMPTY_OPTIONS: ManagedOptionInput[] = ["A", "B", "C", "D"].map((key, index) => ({
  key: key as ManagedOptionInput["key"],
  text: "",
  feedback: "",
  isCorrect: index === 0
}));

const EMPTY_QUESTION: ManagedQuestionInput = {
  code: "",
  part: 5,
  skillId: "grammar_structure",
  subskill: "",
  difficulty: 2,
  targetTimeSeconds: 30,
  prompt: "",
  context: "",
  explanation: "",
  trap: "",
  status: "draft",
  options: EMPTY_OPTIONS
};

type Props = {
  initial?: ManagedQuestionInput;
  questionId?: string;
};

export function AdminQuestionForm({ initial = EMPTY_QUESTION, questionId }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<ManagedQuestionInput>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setField<K extends keyof ManagedQuestionInput>(key: K, value: ManagedQuestionInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateOption(index: number, patch: Partial<ManagedOptionInput>) {
    setForm((current) => ({
      ...current,
      options: current.options.map((option, optionIndex) => optionIndex === index ? { ...option, ...patch } : option)
    }));
  }

  function setCorrectOption(index: number) {
    setForm((current) => ({
      ...current,
      options: current.options.map((option, optionIndex) => ({ ...option, isCorrect: optionIndex === index }))
    }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(questionId ? `/api/admin/questions/${questionId}` : "/api/admin/questions", {
        method: questionId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const body = await response.json() as { id?: string; error?: string };
      if (!response.ok) throw new Error(body.error ?? "Enregistrement impossible.");
      router.push("/admin/questions");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Enregistrement impossible.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="card admin-question-form" onSubmit={submit}>
      {error ? <div className="alert alert-error">{error}</div> : null}

      <section className="admin-form-section">
        <div className="admin-form-section-head">
          <div><span className="eyebrow">Identification</span><h2>Classement de la question</h2></div>
          <select value={form.status} onChange={(event) => setField("status", event.target.value as ManagedQuestionInput["status"])}>
            {MANAGED_STATUSES.map((status) => <option value={status.id} key={status.id}>{status.label}</option>)}
          </select>
        </div>
        <div className="admin-form-grid admin-form-grid-four">
          <label>Code unique<input required value={form.code} onChange={(event) => setField("code", event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} placeholder="db-structure-001" /></label>
          <label>Partie<select value={form.part} onChange={(event) => setField("part", Number(event.target.value))}><option value={5}>Partie 5</option><option value={6}>Partie 6</option><option value={7}>Partie 7</option></select></label>
          <label>Difficulté<select value={form.difficulty} onChange={(event) => setField("difficulty", Number(event.target.value))}>{[1, 2, 3, 4, 5].map((value) => <option value={value} key={value}>{value}/5</option>)}</select></label>
          <label>Temps cible (secondes)<input type="number" min={5} max={600} value={form.targetTimeSeconds} onChange={(event) => setField("targetTimeSeconds", Number(event.target.value))} /></label>
        </div>
        <div className="admin-form-grid">
          <label>Compétence<select value={form.skillId} onChange={(event) => setField("skillId", event.target.value)}>{MANAGED_SKILLS.map((skill) => <option value={skill.id} key={skill.id}>{skill.label}</option>)}</select></label>
          <label>Sous-compétence<input required value={form.subskill} onChange={(event) => setField("subskill", event.target.value)} placeholder="Accord sujet-verbe" /></label>
        </div>
      </section>

      <section className="admin-form-section">
        <span className="eyebrow">Contenu</span>
        <h2>Énoncé et contexte</h2>
        <label>Contexte facultatif<textarea rows={5} value={form.context} onChange={(event) => setField("context", event.target.value)} placeholder="Texte, e-mail, annonce ou passage de lecture..." /></label>
        <label>Question<textarea required rows={3} value={form.prompt} onChange={(event) => setField("prompt", event.target.value)} placeholder="Écris l’énoncé complet." /></label>
      </section>

      <section className="admin-form-section">
        <span className="eyebrow">Réponses</span>
        <h2>Quatre options et une seule bonne réponse</h2>
        <div className="admin-options-list">
          {form.options.map((option, index) => (
            <div className={`admin-option-editor ${option.isCorrect ? "admin-option-correct" : ""}`} key={option.key}>
              <label className="admin-correct-choice"><input type="radio" name="correctOption" checked={option.isCorrect} onChange={() => setCorrectOption(index)} /> Bonne réponse {option.key}</label>
              <input required value={option.text} onChange={(event) => updateOption(index, { text: event.target.value })} placeholder={`Texte de la réponse ${option.key}`} />
              <textarea rows={2} value={option.feedback} onChange={(event) => updateOption(index, { feedback: event.target.value })} placeholder="Retour affiché lorsque cette option est choisie" />
            </div>
          ))}
        </div>
      </section>

      <section className="admin-form-section">
        <span className="eyebrow">Correction</span>
        <h2>Explication pédagogique</h2>
        <label>Règle et explication<textarea required rows={5} value={form.explanation} onChange={(event) => setField("explanation", event.target.value)} placeholder="Explique précisément pourquoi la réponse est correcte." /></label>
        <label>Piège à éviter<textarea rows={3} value={form.trap} onChange={(event) => setField("trap", event.target.value)} placeholder="Décris l’erreur fréquente ou le faux ami." /></label>
      </section>

      <div className="admin-form-actions">
        <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? "Enregistrement..." : questionId ? "Enregistrer les modifications" : "Créer la question"}</button>
        <button className="btn btn-secondary" type="button" onClick={() => router.push("/admin/questions")}>Annuler</button>
      </div>
    </form>
  );
}