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
        <p>Version du 20 juillet 2026. Cette page décrit les données utilisées pour fournir, améliorer et sécuriser le service.</p>
      </header>
      <article className="legal-document">
        <section><h2>Responsable du traitement</h2><p>{legal.publisherName}, exploitant {BRAND_NAME}. Contact : <a href={`mailto:${legal.contactEmail}`}>{legal.contactEmail}</a>.</p></section>
        <section>
          <h2>Données traitées</h2>
          <ul>
            <li>Compte : adresse e-mail, nom d’affichage et identifiants techniques.</li>
            <li>Objectifs : score déclaré, score cible, date d’examen et temps quotidien.</li>
            <li>Apprentissage : réponses, temps de réponse, erreurs, maîtrises, séances et estimations.</li>
            <li>Bêta : pages consultées, démarrage et fin de la démonstration, intention de créer un compte et événements fonctionnels limités.</li>
            <li>Retours volontaires : note, catégorie, message, page concernée et e-mail facultatif.</li>
            <li>Liste d’attente : e-mail, formule envisagée, score cible et date d’examen facultatifs, avec date du consentement.</li>
            <li>Paiement : statut du paiement, formule, dates d’accès et identifiants Stripe lorsque les paiements seront activés. Les données de carte ne transitent pas par {BRAND_NAME}.</li>
            <li>Sécurité : journaux techniques et empreintes irréversibles nécessaires à la prévention des abus.</li>
          </ul>
        </section>
        <section>
          <h2>Mesure de la bêta</h2>
          <p>La mesure d’audience est interne, limitée à l’amélioration du produit et sans publicité. Une valeur aléatoire de session est placée dans un cookie HttpOnly. Elle ne contient ni nom, ni e-mail, ni adresse IP et disparaît à la fin de la session du navigateur.</p>
          <p>L’adresse IP brute n’est pas enregistrée dans les tables de mesure. La limitation anti-abus utilise uniquement une empreinte cryptographique non réversible créée côté serveur.</p>
        </section>
        <section>
          <h2>Finalités et bases légales</h2>
          <ul>
            <li>Créer le compte et fournir l’entraînement : exécution du contrat ou des mesures précontractuelles.</li>
            <li>Mesurer la progression et reprendre une séance : exécution du service demandé.</li>
            <li>Comprendre l’usage de la bêta et améliorer l’ergonomie : intérêt légitime, avec une mesure strictement interne et limitée.</li>
            <li>Traiter un retour volontaire : consentement ou intérêt légitime à corriger le service.</li>
            <li>Gérer la liste d’attente et annoncer l’ouverture Premium : consentement explicite.</li>
            <li>Gérer les futurs paiements, factures et obligations comptables : exécution du contrat et obligation légale.</li>
            <li>Sécuriser le service et prévenir les abus : intérêt légitime de l’éditeur.</li>
          </ul>
        </section>
        <section><h2>Destinataires et prestataires</h2><p>Les données sont accessibles uniquement aux personnes autorisées et aux prestataires indispensables : Supabase pour l’authentification et la base de données, Vercel pour l’hébergement et Stripe pour le paiement lorsqu’il sera activé. Ces prestataires appliquent leurs propres mesures de sécurité et engagements contractuels.</p></section>
        <section>
          <h2>Durées de conservation</h2>
          <ul>
            <li>Compte et historique d’apprentissage : jusqu’à la suppression du compte.</li>
            <li>Brouillons de séance : expiration automatique selon le type de séance.</li>
            <li>Événements de mesure de la bêta : treize mois maximum, puis suppression ou agrégation.</li>
            <li>Liste d’attente : jusqu’au retrait du consentement ou douze mois après l’ouverture Premium.</li>
            <li>Retours de bêta : durée nécessaire à leur analyse, puis suppression ou anonymisation.</li>
            <li>Données de paiement et de facturation : durée requise par les obligations légales applicables.</li>
          </ul>
        </section>
        <section><h2>Vos droits</h2><p>Vous pouvez demander l’accès, la rectification, l’effacement, la limitation, l’opposition ou la portabilité de vos données. Le compte permet déjà de modifier le profil, télécharger un export JSON et demander la suppression définitive.</p><p>Pour retirer une adresse de la liste d’attente ou exercer un droit : <a href={`mailto:${legal.contactEmail}`}>{legal.contactEmail}</a>. Vous pouvez également introduire une réclamation auprès de la CNIL.</p></section>
        <section><h2>Cookies</h2><p>Le service utilise des cookies strictement nécessaires à l’authentification, à la sécurité et une valeur de session dédiée à la mesure interne de la bêta. Aucun cookie publicitaire, profilage intersite ou outil marketing tiers n’est installé par défaut.</p></section>
      </article>
    </div>
  );
}
