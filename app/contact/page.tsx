import { getLegalConfig } from "@/lib/legal";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  const legal = getLegalConfig();
  return (
    <div className="container legal-page">
      <header className="page-head">
        <div className="eyebrow">Assistance</div>
        <h1>Nous contacter</h1>
        <p>Pour une question sur le compte, un paiement, une donnée personnelle ou un exercice.</p>
      </header>
      <div className="contact-grid">
        <article className="card contact-card">
          <h2>Support utilisateur</h2>
          <p>Écris à <a href={`mailto:${legal.supportEmail}`}>{legal.supportEmail}</a>.</p>
          <p>Indique l’adresse e-mail du compte, la page concernée, l’heure approximative du problème et une capture d’écran lorsqu’elle est utile.</p>
          <div className="notice">Ne transmets jamais ton mot de passe, un numéro complet de carte bancaire ou une clé secrète.</div>
        </article>
        <article className="card contact-card">
          <h2>Données et demandes légales</h2>
          <p>Pour l’exercice de tes droits ou une question juridique : <a href={`mailto:${legal.contactEmail}`}>{legal.contactEmail}</a>.</p>
          <p>Le compte permet également de télécharger directement un export de tes données et d’engager leur suppression définitive.</p>
        </article>
      </div>
    </div>
  );
}
