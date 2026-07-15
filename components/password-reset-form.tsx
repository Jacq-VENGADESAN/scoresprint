"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export function PasswordResetForm({ hasSession }: { hasSession: boolean }) {
  const router = useRouter();
  const [ready, setReady] = useState(hasSession);
  const [loading, setLoading] = useState(!hasSession);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hasSession) return;

    async function installRecoverySession() {
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");
      const expiresIn = Number(hash.get("expires_in") ?? 3600);
      const type = hash.get("type");

      if (!accessToken || !refreshToken || (type && type !== "recovery")) {
        setError("Ce lien est incomplet ou a expiré. Demande un nouveau lien de récupération.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken, refreshToken, expiresIn })
        });
        const payload = (await response.json()) as { error?: string };
        if (!response.ok) throw new Error(payload.error ?? "Le lien n’a pas pu être vérifié.");

        window.history.replaceState({}, document.title, window.location.pathname);
        setReady(true);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Le lien n’a pas pu être vérifié.");
      } finally {
        setLoading(false);
      }
    }

    void installRecoverySession();
  }, [hasSession]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready || saving) return;

    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirmation = String(form.get("confirmation") ?? "");
    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/password/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, confirmation })
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Le mot de passe n’a pas pu être modifié.");
      router.replace("/auth?password=updated");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Le mot de passe n’a pas pu être modifié.");
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="notice" role="status">Vérification sécurisée du lien…</div>;
  }

  if (!ready) {
    return (
      <>
        <div className="alert alert-error">{error}</div>
        <Link href="/auth/forgot-password" className="btn btn-primary">Demander un nouveau lien</Link>
      </>
    );
  }

  return (
    <form className="form-grid one-column" onSubmit={submit}>
      {error ? <div className="alert alert-error">{error}</div> : null}
      <div className="field">
        <label htmlFor="new-password">Nouveau mot de passe</label>
        <input id="new-password" name="password" type="password" autoComplete="new-password" minLength={8} required />
        <small>Au moins 8 caractères.</small>
      </div>
      <div className="field">
        <label htmlFor="new-password-confirmation">Confirmer le mot de passe</label>
        <input id="new-password-confirmation" name="confirmation" type="password" autoComplete="new-password" minLength={8} required />
      </div>
      <button className="btn btn-primary" type="submit" disabled={saving}>
        {saving ? "Modification…" : "Enregistrer le nouveau mot de passe"}
      </button>
    </form>
  );
}
