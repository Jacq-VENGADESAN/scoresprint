import { BRAND_NAME } from "@/lib/brand";
import { getLegalConfig } from "@/lib/legal";

export const metadata = { title: "Politique de confidentialité" };

export default function PrivacyPage() {
  const legal = getLegalConfig();
  return (
    <div className="container legal-page">
      <header className="page-head">
        <div className="eyebrow">Données personnelles</div>
        <h1>Politique de confidentialité</h1>
        <p>Version du 18 juillet 2026. Cette page décrit les données utilisées pour fournir et sécuriser le service.</p>
      </header>
      <article className="legal-document">
        <section>
          <h2>Responsable du traitement</h2>
          <p>{legal.publisherName}, exploitant {BRAND_NAME}. Contact : <a href={`mailto:${legal.contactEmail}`}>{legal.contactEmail}</a>.</p>
        </section>
        <section>
          <h2>Données traitées</h2>
          <ul>
            <li>Compte : adresse e-mail, nom d’affichage et identifiants techniques.</li>
            <li>Objectifs : score déclaré, score cible, date d’examen et temps quotidien.</li>
            <li>Apprentissage : réponses, temps de réponse, erreurs, maîtrises, séances et estimations.</li>
            <li>Paiement : statut du paiement, formule, dates d’accès et identifiants Stripe. Les données de carte ne transitent pas par {BRAND_NAME}.</li>
            <li>Sécurité : journaux techniques nécessaires à la prévention des abus et au diagnostic des erreurs.</li>
          </ul>
        </section>
        <section>
          <h2>Finalités et bases légales</h2>
          <ul>
            <li>Créer le compte et fournir l’entraînement : exécution du contrat ou des mesures précontractuelles.</li>
            <li>Mesurer la progression et reprendre une séance : exécution du service demandé.</li>
            <li>Gérer les paiements, factures et obligations comptables : exécution du contrat et obligation légale.</li>
            <li>Sécuriser le service et prévenir les abus : intérêt légitime de l’éditeur.</li>
            <li>Envoyer des communications commerciales facultatives : consentement préalable lorsqu’il est requis.</li>
          </ul>
        </section>
        <section>
          <h2>Destinataires et prestataires</h2>
          <p>Les données sont accessibles uniquement aux personnes autorisées et aux prestataires indispensables : Supabase pour l’authentification et la base de données, Vercel pour l’hébergement et Stripe pour le paiement. Ces prestataires appliquent leurs propres mesures de sécurité et engagements contractuels.</p>
        </section>
        <section>
          <h2>Durées de conservation</h2>
          <ul>
            <li>Compte et historique d’apprentissage : jusqu’à la suppression du compte.</li>
            <li>Brouillons de séance : expiration automatique selon le type de séance.</li>
            <li>Données de paiement et de facturation : durée requise par les obligations légales applicables.</li>
            <li>Demandes de support : durée nécessaire au traitement, puis archivage limité en cas de litige.</li>
          </ul>
        </section>
        <section>
          <h2>Vos droits</h2>
          <p>Vous pouvez demander l’accès, la rectification, l’effacement, la limitation, l’opposition ou la portabilité de vos données. Le compte permet déjà de modifier le profil, télécharger un export JSON et demander la suppression définitive.</p>
          <p>Pour toute demande : <a href={`mailto:${legal.contactEmail}`}>{legal.contactEmail}</a>. Vous pouvez également introduire une réclamation auprès de la CNIL.</p>
        </section>
        <section>
          <h2>Cookies</h2>
          <p>Le service utilise des cookies strictement nécessaires à l’authentification et à la sécurité. Aucun cookie publicitaire n’est installé par défaut. Tout outil de mesure d’audience non exempté nécessitera un consentement préalable.</p>
        </section>
      </article>
    </div>
  );
}
