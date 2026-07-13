type AuthPageProps = {
  searchParams: Promise<{ error?: string; next?: string; confirmed?: string }>;
};

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const params = await searchParams;
  const next = params.next?.startsWith("/") ? params.next : "/dashboard";

  return (
    <div className="container">
      <header className="page-head">
        <div className="eyebrow">Ton espace personnel</div>
        <h1>Connecte-toi ou crée ton compte.</h1>
        <p>Ta progression, tes objectifs et tes erreurs seront sauvegardés automatiquement.</p>
      </header>

      {params.error ? <div className="alert alert-error">{params.error}</div> : null}
      {params.confirmed ? (
        <div className="alert alert-success">Ton e-mail est confirmé. Tu peux maintenant te connecter.</div>
      ) : null}

      <div className="auth-grid">
        <section className="card form-card auth-card">
          <h2>Connexion</h2>
          <form className="form-grid one-column" action="/api/auth/login" method="post">
            <input type="hidden" name="next" value={next} />
            <div className="field">
              <label htmlFor="login-email">E-mail</label>
              <input id="login-email" name="email" type="email" autoComplete="email" required />
            </div>
            <div className="field">
              <label htmlFor="login-password">Mot de passe</label>
              <input id="login-password" name="password" type="password" autoComplete="current-password" minLength={6} required />
            </div>
            <button className="btn btn-primary" type="submit">Se connecter</button>
          </form>
        </section>

        <section className="card form-card auth-card">
          <h2>Créer un compte</h2>
          <form className="form-grid one-column" action="/api/auth/signup" method="post">
            <div className="field">
              <label htmlFor="display-name">Prénom ou pseudo</label>
              <input id="display-name" name="display_name" autoComplete="name" required />
            </div>
            <div className="field">
              <label htmlFor="signup-email">E-mail</label>
              <input id="signup-email" name="email" type="email" autoComplete="email" required />
            </div>
            <div className="field">
              <label htmlFor="signup-password">Mot de passe</label>
              <input id="signup-password" name="password" type="password" autoComplete="new-password" minLength={8} required />
              <small>8 caractères minimum.</small>
            </div>
            <button className="btn btn-secondary" type="submit">Créer mon compte</button>
          </form>
        </section>
      </div>
    </div>
  );
}
