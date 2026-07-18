import Link from "next/link";
import { BRAND_NAME } from "@/lib/brand";

export const metadata = { title: "Questions fréquentes" };

const questions = [
  ["Est-ce une préparation officielle au TOEIC® ?", `${BRAND_NAME} est indépendant d’ETS. Les questions sont originales et les scores sont des estimations internes.`],
  ["Quelles parties sont disponibles ?", "Le Reading couvre les parties 5, 6 et 7. Le Listening couvre actuellement les parties 1 et 2. Les parties 3 et 4 seront ajoutées séparément."],
  ["Le diagnostic donne-t-il mon vrai score ?", "Non. Il fournit une fourchette prudente destinée à orienter le travail. Seul un test officiel produit un score officiel."],
  ["Les offres Premium sont-elles des abonnements ?", "Non. Sprint 30 et Sprint 90 sont des paiements uniques, sans renouvellement automatique."],
  ["Puis-je reprendre une séance interrompue ?", "Oui. Les séances d’entraînement et mini-examens sont sauvegardés selon leur durée de validité. Le chronomètre du mini-examen continue pendant la fermeture."],
  ["Comment sont choisies les questions ?", "Le moteur combine les compétences les plus faibles, les erreurs à revoir, la difficulté et le temps quotidien disponible."],
  ["Les photos du Listening sont-elles réelles ?", "Oui. Les exercices de Partie 1 utilisent des photographies réelles sous licence, avec le crédit du photographe affiché."],
  ["Puis-je supprimer mes données ?", "Oui. Le compte permet de télécharger un export puis de demander la suppression définitive des données associées."],
  ["Que faire si une question semble ambiguë ?", "Après la correction, utilise le bouton de signalement. Les signalements sont examinés dans l’espace d’administration."],
  ["Comment contacter le support ?", "Utilise la page Contact en indiquant l’adresse de ton compte et une description précise du problème, sans transmettre ton mot de passe ni tes données bancaires."]
] as const;

export default function FaqPage() {
  return (
    <div className="container legal-page">
      <header className="page-head">
        <div className="eyebrow">Aide</div>
        <h1>Questions fréquentes</h1>
        <p>Les réponses essentielles sur le fonctionnement, les résultats, les paiements et les données.</p>
      </header>
      <div className="faq-list">
        {questions.map(([question, answer]) => (
          <details key={question}>
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
      <div className="training-note" style={{ marginTop: 22 }}>
        Une question n’est pas couverte ? <Link href="/contact"><strong>Contacter le support</strong></Link>.
      </div>
    </div>
  );
}
