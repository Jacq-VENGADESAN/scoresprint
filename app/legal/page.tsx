import { BRAND_NAME } from "@/lib/brand";
import { getLegalConfig, legalCommerceIsConfigured } from "@/lib/legal";

export const metadata = { title: "Mentions légales" };

export default function LegalPage() {
  const legal = getLegalConfig();
  const configured = legalCommerceIsConfigured();

  return (
    <div className="container legal-page">
      <header className="page-head">
        <div className="eyebrow">Informations légales</div>
        <h1>Mentions légales</h1>
        <p>Informations relatives à l’éditeur, à l’hébergement et au contact du service.</p>
      </header>
      <article className="legal-document">
        {!configured ? <div className="legal-warning">Les informations d’éditeur doivent être complétées dans Vercel avant d’activer les paiements réels.</div> : null}
        <section>
          <h2>Éditeur du site</h2>
          <dl className="legal-data-list">
            <dt>Nom commercial</dt><dd>{legal.businessName}</dd>
            <dt>Responsable de publication</dt><dd>{legal.publisherName}</dd>
            <dt>Forme ou statut</dt><dd>{legal.status}</dd>
            <dt>Adresse</dt><dd>{legal.address}</dd>
            <dt>Immatriculation</dt><dd>{legal.registration}</dd>
            <dt>Contact</dt><dd><a href={`mailto:${legal.contactEmail}`}>{legal.contactEmail}</a></dd>
          </dl>
        </section>
        <section>
          <h2>Hébergement</h2>
          <p>{BRAND_NAME} est hébergé par {legal.hostName}, {legal.hostAddress}.</p>
        </section>
        <section>
          <h2>Propriété intellectuelle</h2>
          <p>La structure du service, son interface, ses textes, ses questions, ses explications et ses éléments graphiques originaux sont protégés. Toute reproduction ou redistribution non autorisée est interdite.</p>
        </section>
        <section>
          <h2>Marques et indépendance</h2>
          <p>TOEIC® est une marque déposée d’ETS. {BRAND_NAME} est indépendant et n’est ni affilié, ni approuvé, ni sponsorisé par ETS. Aucun contenu officiel n’est reproduit.</p>
        </section>
      </article>
    </div>
  );
}
