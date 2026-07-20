"use client";

import { FormEvent, useState } from "react";

const categories = [
  ["general", "Avis général"],
  ["content", "Question ou correction"],
  ["usability", "Navigation ou compréhension"],
  ["bug", "Problème technique"],
  ["pricing", "Offres et prix"],
  ["missing_feature", "Fonctionnalité manquante"]
] as const;

export function BetaFeedbackForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setStatus("loading");
    setMessage("");
    const form = new FormData(formElement);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          category: form.get("category"),
          message: form.get("message"),
          email: form.get("email"),
          path: form.get("path") || "/feedback"
        })
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Envoi impossible.");
      formElement.reset();
      setRating(0);
      setStatus("success");
      setMessage("Merci. Ton retour a été enregistré et servira à prioriser les prochaines évolutions.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Envoi impossible.");
    }
  }

  if (status === "success") {
    return <div className="feedback-success" role="status"><strong>Retour envoyé.</strong><p>{message}</p></div>;
  }

  return (
    <form className="beta-feedback-form" onSubmit={submit}>
      <div className="field">
        <span className="field-label">Quelle note donnerais-tu à l’expérience actuelle ?</span>
        <div className="rating-buttons" role="radiogroup" aria-label="Note de 1 à 5">
          {[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" className={rating === value ? "active" : ""} onClick={() => setRating(value)} aria-pressed={rating === value}>{value}<small>{value === 1 ? "Difficile" : value === 5 ? "Excellent" : ""}</small></button>)}
        </div>
      </div>
      <div className="feedback-form-grid">
        <div className="field">
          <label htmlFor="feedback-category">Sujet principal</label>
          <select id="feedback-category" name="category" defaultValue="general">{categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        </div>
        <div className="field">
          <label htmlFor="feedback-email">E-mail <span>(facultatif)</span></label>
          <input id="feedback-email" name="email" type="email" autoComplete="email" placeholder="Pour recevoir une réponse" />
        </div>
      </div>
      <div className="field">
        <label htmlFor="feedback-message">Qu’est-ce qui t’a aidé, bloqué ou manqué ?</label>
        <textarea id="feedback-message" name="message" minLength={10} maxLength={3000} rows={7} required placeholder="Décris une situation précise : page, exercice, incompréhension, fonctionnalité attendue…" />
      </div>
      <input type="hidden" name="path" value="/feedback" />
      <p className="feedback-privacy">N’envoie jamais de mot de passe, numéro de carte ou information sensible.</p>
      {status === "error" ? <div className="alert alert-error">{message}</div> : null}
      <button className="btn btn-primary" type="submit" disabled={status === "loading" || rating === 0}>{status === "loading" ? "Envoi…" : "Envoyer mon retour"}</button>
    </form>
  );
}
