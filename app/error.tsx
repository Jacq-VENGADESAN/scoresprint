"use client";

import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Aptileo route error", error);
  }, [error]);

  return (
    <div className="container legal-page">
      <section className="card auth-single-card" style={{ marginTop: 72 }}>
        <div className="eyebrow">Un problème est survenu</div>
        <h1>La page n’a pas pu être chargée correctement.</h1>
        <p className="muted-copy">Ta progression déjà enregistrée n’est pas supprimée. Réessaie, puis contacte le support si le problème revient.</p>
        {error.digest ? <p className="muted-copy">Référence : {error.digest}</p> : null}
        <div className="training-actions">
          <button className="btn btn-primary" type="button" onClick={reset}>Réessayer</button>
          <a className="btn btn-secondary" href="/contact">Contacter le support</a>
        </div>
      </section>
    </div>
  );
}
