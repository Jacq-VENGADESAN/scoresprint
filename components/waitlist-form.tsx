"use client";

import { FormEvent, useState } from "react";

type WaitlistFormProps = {
  planInterest?: "sprint_30" | "sprint_90" | "undecided";
  source?: string;
  compact?: boolean;
  title?: string;
};

export function WaitlistForm({
  planInterest = "undecided",
  source = "pricing",
  compact = false,
  title = "Être informé de l’ouverture Premium"
}: WaitlistFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const goalValue = String(form.get("goal_score") ?? "").trim();
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          planInterest,
          goalScore: goalValue ? Number(goalValue) : null,
          examDate: form.get("exam_date") || null,
          source,
          consent: form.get("consent") === "yes"
        })
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Inscription impossible.");
      setStatus("success");
      setMessage("C’est enregistré. Tu seras informé uniquement des avancées importantes et de l’ouverture Premium.");
      event.currentTarget.reset();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Inscription impossible.");
    }
  }

  if (status === "success") {
    return <div className="waitlist-success" role="status"><strong>Inscription confirmée.</strong><span>{message}</span></div>;
  }

  return (
    <form className={`waitlist-form ${compact ? "waitlist-form-compact" : ""}`} onSubmit={submit}>
      <div className="waitlist-form-head"><strong>{title}</strong><span>Aucun paiement et aucun abonnement automatique.</span></div>
      <div className="waitlist-fields">
        <div className="field">
          <label htmlFor={`waitlist-email-${planInterest}-${source}`}>Adresse e-mail</label>
          <input id={`waitlist-email-${planInterest}-${source}`} name="email" type="email" autoComplete="email" required placeholder="toi@exemple.fr" />
        </div>
        {!compact ? (
          <>
            <div className="field">
              <label htmlFor={`waitlist-score-${source}`}>Score cible <span>(facultatif)</span></label>
              <input id={`waitlist-score-${source}`} name="goal_score" type="number" min="10" max="990" step="5" inputMode="numeric" placeholder="850" />
            </div>
            <div className="field">
              <label htmlFor={`waitlist-date-${source}`}>Date d’examen <span>(facultatif)</span></label>
              <input id={`waitlist-date-${source}`} name="exam_date" type="date" />
            </div>
          </>
        ) : null}
      </div>
      <label className="waitlist-consent">
        <input type="checkbox" name="consent" value="yes" required />
        <span>J’accepte d’être recontacté au sujet de la bêta et de l’ouverture Premium. Désinscription possible à tout moment.</span>
      </label>
      {status === "error" ? <div className="alert alert-error">{message}</div> : null}
      <button className="btn btn-primary" type="submit" disabled={status === "loading"}>{status === "loading" ? "Enregistrement…" : "Rejoindre la liste d’attente"}</button>
    </form>
  );
}
