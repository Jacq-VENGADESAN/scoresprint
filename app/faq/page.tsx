import Link from "next/link";
import { BRAND_NAME } from "@/lib/brand";

export const metadata = { title: "Questions fréquentes" };

const questions = [
  ["Est-ce une préparation officielle au TOEIC® ?", `${BRAND_NAME} est indépendant d’ETS. Les questions sont originales et les scores sont des estimations internes.`],
  ["Puis-je essayer sans créer de compte ?", "Oui. La démonstration publique contient huit exercices Reading et Listening avec une correction complète après chaque réponse."],
  ["Quelles parties sont disponibles ?", "Le Reading couvre les parties 5, 6 et 7. Le Listening couvre actuellement les parties 1 et 2. Les parties 3 et 4 et les examens blancs complets sont encore en développement."],
  ["Le diagnostic donne-t-il mon vrai score ?", "Non. Il fournit une fourchette prudente destinée à orienter le travail. Seul un test officiel produit un score officiel."],
  ["Pourquoi Aptileo est-il gratuit actuellement ?", "Le site est en bêta publique. Cette phase sert à vérifier la qualité du contenu, comprendre les usages et corriger les blocages avant d’ouvrir une offre commerciale."],
  ["Puis-je déjà acheter Sprint 30 ou Sprint 90 ?", "Non. Les paiements sont volontairement désactivés pendant la bêta. Les prix affichés sont indicatifs et la liste d’attente permet seulement d’être informé de l’ouverture."],
  ["La liste d’attente crée-t-elle un abonnement ?", "Non. Elle n’entraîne aucun paiement. Elle enregistre uniquement ton accord pour recevoir des informations importantes sur la bêta et l’ouverture Premium."],
  ["Que contiennent les fiches express ?", "Elles expliquent une règle ou une stratégie en quelques minutes, avec exemples, pièges fréquents et liste de vérification avant les exercices."],
  ["Puis-je reprendre une séance interrompue ?", "Oui. Les séances d’entraînement et mini-examens sont sauvegardés selon leur durée de validité. Le chronomètre du mini-examen continue pendant la fermeture."],
  ["Comment sont choisies les questions ?", "Le moteur combine les compétences les plus faibles, les erreurs à revoir, la difficulté et le temps quotidien disponible."],
  ["Les photos du Listening sont-elles réelles ?", "Oui. Les exercices de Partie 1 utilisent des photographies réelles sous licence, avec un lien vers leur source."],
  ["Pourquoi la voix du Listening change-t-elle selon mon appareil ?", "La bêta utilise encore la synthèse vocale du navigateur. Des fichiers audio fixes et contrôlés sont prévus avant l’ouverture commerciale définitive."],
  ["Puis-je supprimer mes données ?", "Oui. Le compte permet de télécharger un export puis de demander la suppression définitive des données associées."],
  ["Que faire si une question semble ambiguë ?", "Après la correction, utilise le bouton de signalement. Pour un avis général, utilise la page Donner mon avis."],
  ["Comment contacter le support ?", "Utilise la page Contact en indiquant l’adresse de ton compte et une description précise du problème, sans transmettre ton mot de passe ni tes données bancaires."]
] as const;

export default function FaqPage() {
  return (
    <div className="container legal-page">
      <header className="page-head"><div className="eyebrow">Aide</div><h1>Questions fréquentes</h1><p>Les réponses essentielles sur la bêta, les exercices, les résultats, les futurs paiements et les données.</p></header>
      <div className="faq-list">{questions.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div>
      <div className="training-note" style={{ marginTop: 22 }}>Une question n’est pas couverte ? <Link href="/feedback"><strong>Partager un retour</strong></Link> ou <Link href="/contact"><strong>contacter le support</strong></Link>.</div>
    </div>
  );
}
