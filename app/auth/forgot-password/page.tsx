import Link from "next/link";

type ForgotPasswordPageProps = {
  searchParams: Promise<{ sent?: string; error?: string }>;
};

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const params = await searchParams;

  return (
    <div className="container auth-single-page">
      <section className="card auth-single-card">
        <div className="eyebrow">Récupération du compte</div>
        <h1>Réinitialise ton mot de passe.</h1>
        <p className="muted-copy">
          Entre l’adresse utilisée sur ScoreSprint. Le message envoyé contiendra un lien temporaire pour choisir un nouveau mot de passe.
        </p>

        {params.error ? <div className="alert alert-error">{params.error}</div> : null}
        {params.sent ? (
          <div className="alert alert-success">
            Si un compte correspond à cette adresse, un lien vient d’être envoyé. Pense à vérifier les courriers indésirables.
          </div>
        ) : null}

        <form className="form-grid one-column" action="/api/auth/password/request" method="post">
          <div className="field">
            <label htmlFor="recovery-email">Adresse e-mail</label>
            <input id="recovery-email" name="email" type="email" autoComplete="email" inputMode="email" required />
          </div>
          <button className="btn btn-primary" type="submit">Envoyer le lien</button>
        </form>

        <Link href="/auth" className="btn btn-ghost auth-back-link">← Retour à la connexion</Link>
      </section>
    </div>
  );
}
