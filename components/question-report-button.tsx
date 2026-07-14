"use client";

import { useState } from "react";

const REASONS = [
  ["ambiguous", "Question ambiguë"],
  ["incorrect_answer", "Bonne réponse incorrecte"],
  ["typo", "Faute ou problème d’affichage"],
  ["explanation", "Explication insuffisante"],
  ["other", "Autre problème"]
] as const;

export function QuestionReportButton({ questionCode, selectedOption }: { questionCode: string; selectedOption?: string | null }) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("ambiguous");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit() {
    if (loading) return;
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch("/api/questions/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionCode, category, details, selectedOption })
      });
      const payload = await response.json() as { error?: string; success?: boolean };
      if (!response.ok) throw new Error(payload.error ?? "Signalement impossible.");
      setMessage("Merci, le signalement a été transmis à l’équipe de relecture.");
      setOpen(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Signalement impossible.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="question-report">
      {message ? <div className="question-report-message">{message}</div> : null}
      {!open ? (
        <button className="question-report-link" type="button" onClick={() => setOpen(true)}>Signaler un problème avec cette question</button>
      ) : (
        <div className="question-report-panel">
          <div className="question-report-head"><strong>Signaler la question</strong><button type="button" onClick={() => setOpen(false)} aria-label="Fermer">×</button></div>
          <label>Motif
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              {REASONS.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
            </select>
          </label>
          <label>Détail facultatif
            <textarea rows={3} maxLength={2000} value={details} onChange={(event) => setDetails(event.target.value)} placeholder="Explique ce qui te semble incorrect ou ambigu." />
          </label>
          <div className="question-report-actions">
            <button className="btn btn-primary compact-btn" type="button" disabled={loading} onClick={() => void submit()}>{loading ? "Envoi…" : "Envoyer"}</button>
            <button className="btn btn-secondary compact-btn" type="button" onClick={() => setOpen(false)}>Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
}
