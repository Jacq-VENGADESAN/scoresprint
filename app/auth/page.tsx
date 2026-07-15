type AuthPageProps = {
  searchParams: Promise<{ error?: string; next?: string; confirmed?: string }>;
};

function CheckIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m4 10 3.5 3.5L16 5.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const params = await searchParams;
  const next = params.next?.startsWith("/") ? params.next : "/dashboard";

  return (
    <div className="container auth-page">
      <div className="auth-layout">
        <aside className="auth-intro">
          <div className="eyebrow">Ton espace de préparation</div>
          <h1>Reprends exactement là où tu t’es arrêté.</h1>
          <p>Ton objectif, tes erreurs et chaque mesure de progression restent liés à ton compte.</p>
          <div className="auth-benefits">
            <div className="auth-benefit"><span className="auth-benefit-icon"><CheckIcon /></span><div><strong>Programme conservé</strong><span>Ta séance évolue après chaque réponse.</span></div></div>
            <div className="auth-benefit"><span className="auth-benefit-icon"><CheckIcon /></span><div><strong>Historique détaillé</strong><span>Retrouve tes choix, corrections et temps de réponse.</span></div></div>
            <div className="auth-benefit"><span className="auth-benefit-icon"><CheckIcon /></span><div><strong>Diagnostic gratuit</strong><span>Aucun moyen de paiement pour commencer.</span></div></div>
          </div>
        </aside>

        <div className="auth-content">
          <div className="auth-content-head">
            <h2>Bienvenue sur ScoreSprint</h2>
            <p>Connecte-toi ou crée ton espace en moins d’une minute.</p>
          </div>

          {params.error ? <div className="alert alert-error">{params.error}</div> : null}
          {params.confirmed ? <div className="alert alert-success">Ton e-mail est confirmé. Tu peux maintenant te connecter.</div> : null}

          <div className="auth-grid">
            <section className="card auth-card" aria-labelledby="login-title">
              <h2 id="login-title">J’ai déjà un compte</h2>
              <form className="form-grid one-column" action="/api/auth/login" method="post">
                <input type="hidden" name="next" value={next} />
                <div className="field">
                  <label htmlFor="login-email">Adresse e-mail</label>
                  <input id="login-email" name="email" type="email" autoComplete="email" inputMode="email" required />
                </div>
                <div className="field">
                  <label htmlFor="login-password">Mot de passe</label>
                  <input id="login-password" name="password" type="password" autoComplete="current-password" minLength={6} required />
                </div>
                <button className="btn btn-primary" type="submit">Se connecter</button>
              </form>
            </section>

            <section className="card auth-card" aria-labelledby="signup-title">
              <h2 id="signup-title">Je crée mon espace</h2>
              <form className="form-grid one-column" action="/api/auth/signup" method="post">
                <div className="field">
                  <label htmlFor="display-name">Prénom ou pseudo</label>
                  <input id="display-name" name="display_name" autoComplete="name" required />
                </div>
                <div className="field">
                  <label htmlFor="signup-email">Adresse e-mail</label>
                  <input id="signup-email" name="email" type="email" autoComplete="email" inputMode="email" required />
                </div>
                <div className="field">
                  <label htmlFor="signup-password">Mot de passe</label>
                  <input id="signup-password" name="password" type="password" autoComplete="new-password" minLength={8} required />
                  <small>Au moins 8 caractères.</small>
                </div>
                <button className="btn btn-secondary" type="submit">Créer mon compte gratuit</button>
              </form>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
