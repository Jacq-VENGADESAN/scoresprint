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
        <p>Version du 22 juillet 2026. Cette page décrit les données utilisées pour fournir, personnaliser, améliorer et sécuriser le service.</p>
      </header>
      <article className="legal-document">
        <section><h2>Responsable du traitement</h2><p>{legal.publisherName}, exploitant {BRAND_NAME}. Contact : <a href={`mailto:${legal.contactEmail}`}>{legal.contactEmail}</a>.</p></section>
        <section>
          <h2>Données traitées</h2>
          <ul>
            <li>Compte : adresse e-mail, nom d’affichage et identifiants techniques.</li>
            <li>Objectifs : score déclaré, score cible, date d’examen, niveau, priorité et temps quotidien.</li>
            <li>Apprentissage : réponses, temps de réponse, erreurs, maîtrises, séances, programmes et estimations.</li>
            <li>Coach 90 : données d’apprentissage structurées strictement nécessaires à la création d’un programme ou d’une explication.</li>
            <li>Bêta et amélioration : pages consultées, démonstrations terminées et événements fonctionnels limités.</li>
            <li>Retours volontaires et liste d’attente : note, catégorie, message, formule envisagée et e-mail lorsque celui-ci est fourni.</li>
            <li>Paiement : statut, formule, dates d’accès et identifiants Stripe. Les données de carte ne transitent pas par {BRAND_NAME}.</li>
            <li>Sécurité : journaux techniques et empreintes irréversibles nécessaires à la prévention des abus.</li>
          </ul>
        </section>
        <section>
          <h2>Fonctionnement du Coach 90</h2>
          <p>Le Coach 90 utilise l’API professionnelle d’OpenAI uniquement lorsque l’utilisateur demande un programme ou une explication. Aptileo transmet des informations structurées comme le score cible, le temps disponible, les compétences les plus faibles, les erreurs, le texte de la question et les réponses concernées.</p>
          <p>Le nom, l’adresse e-mail, le mot de passe, les données bancaires et l’identifiant du compte ne sont pas transmis à OpenAI. Aucun champ libre permettant d’envoyer volontairement une information personnelle n’est proposé dans le Coach 90.</p>
          <p>Les appels sont effectués avec l’option de non-conservation applicative <code>store: false</code>. Les contenus envoyés à l’API ne sont pas utilisés par défaut pour entraîner les modèles OpenAI. OpenAI peut toutefois conserver des journaux de surveillance des abus pendant une durée limitée selon ses conditions applicables.</p>
          <p>L’IA organise et reformule des données déjà vérifiées par Aptileo. Elle ne décide pas du score officiel, ne remplace pas les corrections enregistrées et peut produire une recommandation imparfaite.</p>
        </section>
        <section>
          <h2>Mesure interne</h2>
          <p>La mesure d’audience est interne, limitée à l’amélioration du produit et sans publicité. Une valeur aléatoire de session est placée dans un cookie HttpOnly et Secure. Elle ne contient ni nom, ni e-mail, ni adresse IP.</p>
          <p>L’adresse IP brute n’est pas enregistrée dans les tables de mesure. La limitation anti-abus utilise uniquement une empreinte cryptographique non réversible créée côté serveur.</p>
        </section>
        <section>
          <h2>Finalités et bases légales</h2>
          <ul>
            <li>Créer le compte, fournir l’entraînement et personnaliser le programme : exécution du contrat ou mesures précontractuelles.</li>
            <li>Générer les fonctions demandées du Coach 90 : exécution du service souscrit.</li>
            <li>Comprendre l’usage et améliorer l’ergonomie : intérêt légitime, avec une mesure interne limitée.</li>
            <li>Traiter un retour ou une inscription volontaire à une liste : consentement ou intérêt légitime selon la demande.</li>
            <li>Gérer les paiements, factures et obligations comptables : exécution du contrat et obligation légale.</li>
            <li>Sécuriser le service et maîtriser les abus ainsi que les coûts d’API : intérêt légitime de l’éditeur.</li>
          </ul>
        </section>
        <section><h2>Destinataires et prestataires</h2><p>Les données sont accessibles uniquement aux personnes autorisées et aux prestataires indispensables : Supabase pour l’authentification et la base de données, Vercel pour l’hébergement, Stripe pour le paiement et OpenAI pour les fonctions Coach 90 demandées. Les transferts et traitements éventuels hors de l’Espace économique européen sont encadrés par les mécanismes contractuels applicables aux prestataires concernés.</p></section>
        <section>
          <h2>Durées de conservation</h2>
          <ul>
            <li>Compte, historique, programmes Coach 90 et données d’apprentissage : jusqu’à la suppression du compte, sauf obligation légale contraire.</li>
            <li>Brouillons de séance : expiration automatique selon le type de séance.</li>
            <li>Événements de mesure : treize mois maximum, puis suppression ou agrégation.</li>
            <li>Liste d’attente : jusqu’au retrait du consentement ou douze mois après l’ouverture commerciale.</li>
            <li>Retours : durée nécessaire à leur analyse, puis suppression ou anonymisation.</li>
            <li>Données de paiement et de facturation : durée requise par les obligations légales applicables.</li>
          </ul>
        </section>
        <section><h2>Vos droits</h2><p>Vous pouvez demander l’accès, la rectification, l’effacement, la limitation, l’opposition ou la portabilité de vos données. Le compte permet de modifier le profil, télécharger un export JSON et demander la suppression définitive.</p><p>Pour exercer un droit : <a href={`mailto:${legal.contactEmail}`}>{legal.contactEmail}</a>. Vous pouvez également introduire une réclamation auprès de la CNIL.</p></section>
        <section><h2>Cookies</h2><p>Le service utilise des cookies strictement nécessaires à l’authentification, à la sécurité et une valeur de session dédiée à la mesure interne. Aucun cookie publicitaire, profilage intersite ou outil marketing tiers n’est installé par défaut.</p></section>
      </article>
    </div>
  );
}
