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
        <p>Version du 22 juillet 2026. Ces conditions s’appliquent à l’offre gratuite, au Sprint 30 et au Coach 90.</p>
      </header>
      <article className="legal-document">
        <section><h2>1. Éditeur et objet</h2><p>{BRAND_NAME} est exploité par {legal.publisherName}, {legal.status}, SIREN {legal.siren}, SIRET {legal.siret}. Le service propose des exercices originaux d’anglais professionnel, un suivi de progression et des parcours de révision. Il ne délivre aucune certification officielle et ne garantit pas l’obtention d’un score déterminé.</p></section>
        <section><h2>2. Compte utilisateur</h2><p>L’utilisateur fournit des informations exactes, protège son mot de passe et utilise un compte personnel. Les usages automatisés, le partage massif de compte, l’extraction des questions, la revente de l’accès et la tentative de contournement des quotas sont interdits.</p></section>
        <section><h2>3. Offre gratuite</h2><p>L’offre gratuite comporte des limites de fréquence, d’historique ou de volume indiquées sur la page Tarifs. Son contenu peut évoluer sans supprimer un accès payant déjà acquis.</p></section>
        <section>
          <h2>4. Sprint 30</h2>
          <p>Le Sprint 30 est un paiement unique donnant accès pendant 30 jours au cœur Premium : entraînements disponibles sans quota d’usage normal, mini-examens, carnet d’erreurs, historique complet, statistiques et fiches pédagogiques. Il ne comprend pas les fonctions d’intelligence artificielle réservées au Coach 90.</p>
        </section>
        <section>
          <h2>5. Coach 90</h2>
          <p>Le Coach 90 est un paiement unique donnant accès pendant 90 jours aux fonctions du Sprint 30 et à un accompagnement utilisant l’intelligence artificielle : programmes hebdomadaires structurés et explications personnalisées d’erreurs déjà enregistrées.</p>
          <p>Les fonctions IA sont soumises à un quota quotidien affiché dans le produit afin de garantir la disponibilité et de maîtriser les abus. Les crédits non utilisés ne sont ni reportés, ni convertibles, ni remboursables séparément. Une indisponibilité ponctuelle du prestataire IA n’affecte pas l’accès aux fonctions principales d’entraînement.</p>
          <p>Les réponses de l’IA sont des reformulations pédagogiques. Les bonnes réponses enregistrées dans la banque Aptileo restent la référence et les recommandations ne constituent ni un conseil professionnel, ni une garantie de progression ou de score.</p>
        </section>
        <section><h2>6. Durée et renouvellement</h2><p>Les accès sont activés après confirmation du paiement et ne se renouvellent jamais automatiquement. Un achat effectué pendant une période active prolonge la date de fin existante selon la durée du produit acheté.</p></section>
        <section><h2>7. Prix et paiement</h2><p>Les prix affichés en euros toutes taxes comprises sur la page Tarifs sont ceux applicables au moment de la commande. Le paiement est traité par Stripe. L’accès est activé après confirmation technique du paiement. Une facture ou un reçu est mis à disposition selon la configuration du prestataire de paiement.</p></section>
        <section><h2>8. Rétractation</h2><p>Avant le paiement, l’utilisateur doit accepter les présentes conditions et demander expressément l’activation immédiate du service numérique. Les règles et demandes de remboursement sont détaillées sur la page Rétractation et remboursements. Cette clause doit être lue avec les dispositions impératives du Code de la consommation.</p></section>
        <section><h2>9. Disponibilité et évolution</h2><p>L’éditeur met en œuvre des moyens raisonnables pour maintenir le service, sans garantir une disponibilité permanente. Les exercices, interfaces, modèles IA et fonctionnalités peuvent évoluer pour améliorer la qualité ou la sécurité, sans réduire substantiellement l’accès payant en cours.</p></section>
        <section><h2>10. Propriété intellectuelle</h2><p>L’achat d’un accès ne transfère aucun droit sur la banque de questions, les corrections, les textes, les photographies sous licence, les sorties structurées du service ou le logiciel. L’usage est strictement personnel.</p></section>
        <section><h2>11. Responsabilité</h2><p>Les estimations de niveau et de score sont indicatives. Elles ne remplacent pas un résultat officiel. L’utilisateur reste responsable de son inscription à l’examen, de son matériel, de sa connexion et de la vérification des recommandations générées par le Coach 90.</p></section>
        <section><h2>12. Données et IA</h2><p>Les traitements de données, les prestataires et le fonctionnement du Coach 90 sont détaillés dans la politique de confidentialité. L’utilisateur ne doit pas chercher à transmettre des informations sensibles au service.</p></section>
        <section><h2>13. Réclamations et médiation</h2><p>Toute réclamation peut être envoyée à <a href={`mailto:${legal.supportEmail}`}>{legal.supportEmail}</a>. Après une réclamation écrite préalable restée sans solution, le consommateur peut saisir gratuitement {legal.mediatorName}, {legal.mediatorAddress}, via <a href={legal.mediatorUrl}>{legal.mediatorUrl}</a>.</p></section>
        <section><h2>14. Droit applicable</h2><p>Les présentes conditions sont soumises au droit français, sous réserve des règles protectrices impératives applicables au consommateur dans son pays de résidence.</p></section>
      </article>
    </div>
  );
}
