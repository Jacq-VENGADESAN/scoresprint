"use client";

import { FormEvent, useState } from "react";

export function AccountPasswordForm() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const password = String(form.get("password") ?? "");
    const confirmation = String(form.get("confirmation") ?? "");
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/auth/password/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, confirmation })
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "La modification a échoué.");
      formElement.reset();
      setSuccess(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "La modification a échoué.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="form-grid one-column" onSubmit={submit}>
      {error ? <div className="alert alert-error">{error}</div> : null}
      {success ? <div className="alert alert-success">Ton mot de passe a été modifié.</div> : null}
      <div className="field">
        <label htmlFor="account-new-password">Nouveau mot de passe</label>
        <input id="account-new-password" name="password" type="password" autoComplete="new-password" minLength={8} required />
      </div>
      <div className="field">
        <label htmlFor="account-password-confirmation">Confirmer le mot de passe</label>
        <input id="account-password-confirmation" name="confirmation" type="password" autoComplete="new-password" minLength={8} required />
      </div>
      <button className="btn btn-secondary" type="submit" disabled={saving}>
        {saving ? "Modification…" : "Modifier le mot de passe"}
      </button>
    </form>
  );
}
