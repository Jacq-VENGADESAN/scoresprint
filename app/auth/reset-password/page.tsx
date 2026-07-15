import { PasswordResetForm } from "@/components/password-reset-form";
import { getCurrentUser } from "@/lib/supabase-server";

export default async function ResetPasswordPage() {
  const user = await getCurrentUser();

  return (
    <div className="container auth-single-page">
      <section className="card auth-single-card">
        <div className="eyebrow">Nouveau mot de passe</div>
        <h1>Sécurise à nouveau ton compte.</h1>
        <p className="muted-copy">
          Le lien reçu par e-mail est temporaire. Choisis maintenant un mot de passe différent de l’ancien.
        </p>
        <PasswordResetForm hasSession={Boolean(user)} />
      </section>
    </div>
  );
}
