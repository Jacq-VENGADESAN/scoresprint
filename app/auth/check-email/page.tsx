import Link from "next/link";
import { BRAND_NAME } from "@/lib/brand";

export default function CheckEmailPage() {
  return (
    <div className="container">
      <section className="card form-card centered-card">
        <div className="eyebrow">Compte créé</div>
        <h1>Vérifie ta boîte mail.</h1>
        <p className="muted-copy">
          Un lien de confirmation vient d’être envoyé. Clique dessus, puis reviens te connecter à {BRAND_NAME}.
        </p>
        <Link className="btn btn-primary" href="/auth">Retour à la connexion</Link>
      </section>
    </div>
  );
}
