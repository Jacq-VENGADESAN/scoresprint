import { BRAND_NAME } from "@/lib/brand";
import { getLegalConfig } from "@/lib/legal";

export const metadata = { title: "Rétractation et remboursements" };

export default function RefundPolicyPage() {
  const legal = getLegalConfig();
  return (
    <div className="container legal-page">
      <header className="page-head">
        <div className="eyebrow">Achats numériques</div>
        <h1>Rétractation et remboursements</h1>
        <p>Cette page explique la procédure applicable aux accès Premium achetés sur {BRAND_NAME}.</p>
      </header>
      <article className="legal-document">
        <section>
          <h2>Avant l’activation</h2>
          <p>Lorsque le droit de rétractation est applicable, le consommateur dispose en principe d’un délai légal à compter de la conclusion du contrat. Une demande peut être envoyée à <a href={`mailto:${legal.supportEmail}`}>{legal.supportEmail}</a> en indiquant l’adresse du compte et la référence du paiement.</p>
        </section>
        <section>
          <h2>Activation immédiate</h2>
          <p>Au moment de l’achat, l’utilisateur peut demander expressément que l’accès numérique commence immédiatement. La conséquence sur le droit de rétractation dépend du niveau d’exécution du service et des règles légales applicables. Cette demande et l’acceptation des conditions sont enregistrées avec la commande.</p>
        </section>
        <section>
          <h2>Problème technique ou achat incorrect</h2>
          <p>En cas de double paiement, d’accès non activé, de formule incorrecte ou d’incident empêchant durablement l’utilisation, contactez le support. Après vérification, une correction, une prolongation ou un remboursement pourra être proposé selon la situation.</p>
        </section>
        <section>
          <h2>Traitement des remboursements</h2>
          <p>Les remboursements acceptés sont renvoyés vers le moyen de paiement initial par Stripe. Le délai d’apparition sur le compte dépend ensuite de la banque ou de l’émetteur de la carte.</p>
        </section>
        <section>
          <h2>Modèle de demande</h2>
          <p>Objet : Demande de rétractation ou remboursement — {BRAND_NAME}. Indiquez votre nom, l’adresse e-mail du compte, la date d’achat, la formule concernée et le motif de la demande.</p>
        </section>
      </article>
    </div>
  );
}
