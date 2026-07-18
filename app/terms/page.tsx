import { BRAND_NAME } from "@/lib/brand";
import { getLegalConfig } from "@/lib/legal";

export const metadata = { title: "Conditions d’utilisation et de vente" };

export default function TermsPage() {
  const legal = getLegalConfig();
  return (
    <div className="container legal-page">
      <header className="page-head">
        <div className="eyebrow">Règles du service</div>
        <h1>Conditions générales d’utilisation et de vente</h1>
        <p>Version du 18 juillet 2026. Ces conditions s’appliquent à l’utilisation du service gratuit et aux accès payants.</p>
      </header>
      <article className="legal-document">
        <section>
          <h2>1. Objet</h2>
          <p>{BRAND_NAME} propose des exercices originaux d’anglais professionnel, un suivi de progression et des parcours de révision. Le service ne délivre aucune certification officielle et ne garantit pas l’obtention d’un score déterminé.</p>
        </section>
        <section>
          <h2>2. Compte utilisateur</h2>
          <p>L’utilisateur fournit des informations exactes, protège son mot de passe et utilise un compte personnel. Les usages automatisés, le partage massif de compte, l’extraction des questions et la tentative de contournement des quotas sont interdits.</p>
        </section>
        <section>
          <h2>3. Offre gratuite</h2>
          <p>L’offre gratuite peut comporter des limites de fréquence, d’historique ou de volume. Ces limites sont indiquées sur la page Tarifs et contrôlées côté serveur.</p>
        </section>
        <section>
          <h2>4. Accès payants</h2>
          <p>Les formules Sprint 30 et Sprint 90 correspondent à des paiements uniques donnant accès aux fonctions Premium pendant respectivement 30 et 90 jours. Elles ne se renouvellent pas automatiquement. Un achat effectué pendant une période active prolonge la date de fin existante.</p>
        </section>
        <section>
          <h2>5. Prix et paiement</h2>
          <p>Les prix affichés sur la page Tarifs sont ceux applicables au moment de la commande. Le paiement est traité par Stripe. L’accès Premium est activé après confirmation technique du paiement. Une facture ou un reçu est mis à disposition par le prestataire de paiement.</p>
        </section>
        <section>
          <h2>6. Rétractation</h2>
          <p>Les règles applicables dépendent du moment où le contenu ou service numérique commence à être exécuté. Avant le paiement, l’utilisateur doit accepter les présentes conditions et demander expressément l’activation immédiate. Les modalités détaillées figurent dans la page Rétractation et remboursements.</p>
        </section>
        <section>
          <h2>7. Disponibilité</h2>
          <p>L’éditeur met en œuvre des moyens raisonnables pour maintenir le service, sans garantir une disponibilité permanente. Des maintenances, incidents ou dépendances externes peuvent entraîner une interruption temporaire.</p>
        </section>
        <section>
          <h2>8. Propriété intellectuelle</h2>
          <p>L’achat d’un accès ne transfère aucun droit sur la banque de questions, les corrections, les textes, les photographies sous licence ou le logiciel. L’usage est strictement personnel.</p>
        </section>
        <section>
          <h2>9. Responsabilité</h2>
          <p>Les estimations de niveau et de score sont indicatives. Elles ne remplacent pas un résultat officiel. L’utilisateur reste responsable de son inscription à l’examen, de son matériel et de sa connexion Internet.</p>
        </section>
        <section>
          <h2>10. Réclamations et médiation</h2>
          <p>Toute réclamation peut être envoyée à <a href={`mailto:${legal.supportEmail}`}>{legal.supportEmail}</a>. Après une réclamation écrite préalable restée sans solution, le consommateur peut saisir gratuitement le médiateur suivant : {legal.mediatorName}, <a href={legal.mediatorUrl}>{legal.mediatorUrl}</a>.</p>
        </section>
        <section>
          <h2>11. Droit applicable</h2>
          <p>Les présentes conditions sont soumises au droit français, sous réserve des règles protectrices impératives applicables au consommateur dans son pays de résidence.</p>
        </section>
      </article>
    </div>
  );
}
