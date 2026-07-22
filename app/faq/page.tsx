import Link from "next/link";
import { BRAND_NAME } from "@/lib/brand";

export const metadata = { title: "Questions fréquentes" };

const questions = [
  ["Est-ce une préparation officielle au TOEIC® ?", `${BRAND_NAME} est indépendant d’ETS. Les questions sont originales et les scores sont des estimations internes.`],
  ["Puis-je essayer sans créer de compte ?", "Oui. La démonstration publique contient huit exercices Reading et Listening avec une correction complète après chaque réponse."],
  ["Quelles parties sont disponibles ?", "Le Reading couvre les parties 5, 6 et 7. Le Listening couvre actuellement les parties 1 et 2. Les parties 3 et 4 et les examens blancs complets restent le prochain chantier pédagogique."],
  ["Les utilisateurs reçoivent-ils les questions dans le même ordre ?", "Non. Chaque nouvelle démonstration, diagnostic, séance Reading, séance Listening et mini-examen utilise un ordre renouvelé. Une séance interrompue reprend toutefois exactement dans son ordre initial."],
  ["Quelle est la différence entre Sprint 30 et Coach 90 ?", "Sprint 30 donne pendant 30 jours l’accès illimité au cœur de l’entraînement. Coach 90 inclut ces fonctions pendant 90 jours et ajoute un programme IA de 7 jours, des explications adaptées aux erreurs et 10 crédits IA quotidiens."],
  ["Le Coach 90 est-il un chatbot libre ?", "Non. Il n’accepte pas de texte libre. Il utilise uniquement des données d’apprentissage structurées et les corrections vérifiées d’Aptileo pour générer un programme ou reformuler une erreur."],
  ["L’IA peut-elle changer la bonne réponse d’une question ?", "Non. La réponse enregistrée dans la banque Aptileo reste la référence. L’IA sert uniquement à organiser le travail et à reformuler la correction avec de nouveaux exemples."],
  ["À quoi servent les crédits IA ?", "Un programme hebdomadaire utilise 3 crédits et une explication ciblée utilise 1 crédit. Coach 90 renouvelle 10 crédits chaque jour afin de maîtriser la disponibilité et les coûts. Un appel technique échoué est remboursé automatiquement."],
  ["Le diagnostic donne-t-il mon vrai score ?", "Non. Il fournit une fourchette prudente destinée à orienter le travail. Seul un test officiel produit un score officiel."],
  ["Quels sont les prix prévus ?", "Les tarifs de lancement prévus sont de 9,90 € pour Sprint 30 et 24,90 € pour Coach 90. Ce sont des paiements uniques sans renouvellement automatique."],
  ["Pourquoi les paiements sont-ils encore désactivés ?", "BETA_MODE reste actif pendant la configuration du SIRET, des mentions légales, du médiateur, de Stripe Live, du domaine et des tests finaux."],
  ["Que contiennent les fiches express ?", "Elles expliquent une règle ou une stratégie en quelques minutes, avec exemples, pièges fréquents et liste de vérification avant les exercices."],
  ["Puis-je reprendre une séance interrompue ?", "Oui. Les séances et mini-examens sont sauvegardés selon leur durée de validité. Le chronomètre du mini-examen continue pendant la fermeture."],
  ["Les photos du Listening sont-elles réelles ?", "Oui. Les exercices de Partie 1 utilisent des photographies réelles sous licence, avec un lien vers leur source."],
  ["Pourquoi la voix du Listening change-t-elle selon mon appareil ?", "La version actuelle utilise encore la synthèse vocale du navigateur. Des fichiers audio fixes et contrôlés sont prévus avant l’extension aux parties 3 et 4."],
  ["Puis-je supprimer mes données ?", "Oui. Le compte permet de télécharger un export comprenant aussi les programmes Coach 90, puis de demander la suppression définitive."],
  ["Que faire si une question semble ambiguë ?", "Après la correction, utilise le bouton de signalement. Pour un avis général, utilise la page Donner mon avis."],
  ["Comment contacter le support ?", "Utilise la page Contact en décrivant précisément le problème, sans transmettre ton mot de passe, ta clé API ou tes données bancaires."]
] as const;

export default function FaqPage() {
  return (
    <div className="container legal-page">
      <header className="page-head"><div className="eyebrow">Aide</div><h1>Questions fréquentes</h1><p>Les réponses essentielles sur les exercices, les deux offres, le Coach 90, les futurs paiements et les données.</p></header>
      <div className="faq-list">{questions.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div>
      <div className="training-note" style={{ marginTop: 22 }}>Une question n’est pas couverte ? <Link href="/feedback"><strong>Partager un retour</strong></Link> ou <Link href="/contact"><strong>contacter le support</strong></Link>.</div>
    </div>
  );
}
