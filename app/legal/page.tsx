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
        <p>Identification de l’éditeur, immatriculation, contact et hébergement du service.</p>
      </header>
      <article className="legal-document">
        {!configured ? <div className="legal-warning">Les informations SIREN/SIRET, de contact et de médiation doivent être complétées dans Vercel avant Stripe Live.</div> : null}
        <section>
          <h2>Éditeur du site</h2>
          <dl className="legal-data-list">
            <dt>Nom commercial</dt><dd>{legal.businessName}</dd>
            <dt>Entrepreneur et responsable de publication</dt><dd>{legal.publisherName}</dd>
            <dt>Statut</dt><dd>{legal.status}</dd>
            <dt>Adresse professionnelle</dt><dd>{legal.address}</dd>
            <dt>SIREN</dt><dd>{legal.siren}</dd>
            <dt>SIRET</dt><dd>{legal.siret}</dd>
            <dt>Code APE</dt><dd>{legal.apeCode}</dd>
            <dt>TVA intracommunautaire</dt><dd>{legal.vatNumber}</dd>
            <dt>Adresse électronique</dt><dd><a href={`mailto:${legal.contactEmail}`}>{legal.contactEmail}</a></dd>
            <dt>Téléphone</dt><dd>{legal.phone}</dd>
          </dl>
        </section>
        <section>
          <h2>Assistance et réclamations</h2>
          <p>Les demandes liées au service peuvent être adressées à <a href={`mailto:${legal.supportEmail}`}>{legal.supportEmail}</a>. Une réclamation écrite préalable est nécessaire avant la saisine du médiateur de la consommation indiqué dans les CGV.</p>
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
