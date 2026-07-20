export type DemoOption = { id: "A" | "B" | "C" | "D"; text: string };

export type DemoQuestion = {
  id: string;
  section: "Reading" | "Listening";
  part: 1 | 2 | 5 | 6 | 7;
  skill: string;
  prompt: string;
  context?: string;
  audioPrompt?: string;
  photo?: { src: string; alt: string; creditUrl: string };
  options: DemoOption[];
  correctOptionId: DemoOption["id"];
  explanation: string;
  trap: string;
};

export const DEMO_QUESTIONS: DemoQuestion[] = [
  {
    id: "demo-p5-verb",
    section: "Reading",
    part: 5,
    skill: "Temps verbaux",
    prompt: "By the time the auditors arrive, the finance team ___ the quarterly report.",
    options: [
      { id: "A", text: "completes" },
      { id: "B", text: "will have completed" },
      { id: "C", text: "has completed" },
      { id: "D", text: "was completing" }
    ],
    correctOptionId: "B",
    explanation: "By the time + présent situe une action future qui sera déjà terminée : on utilise le futur antérieur.",
    trap: "Choisir un futur simple implicite sans repérer que le rapport sera terminé avant l’arrivée des auditeurs."
  },
  {
    id: "demo-p5-preposition",
    section: "Reading",
    part: 5,
    skill: "Prépositions",
    prompt: "The revised schedule will take effect ___ the beginning of next month.",
    options: [
      { id: "A", text: "at" },
      { id: "B", text: "in" },
      { id: "C", text: "on" },
      { id: "D", text: "by" }
    ],
    correctOptionId: "A",
    explanation: "L’expression fixe est at the beginning of pour désigner le début d’une période.",
    trap: "Utiliser in uniquement parce que month apparaît plus loin dans la phrase."
  },
  {
    id: "demo-p6-connector",
    section: "Reading",
    part: 6,
    skill: "Connecteurs",
    context: "The west entrance will remain closed while the security gates are replaced. Visitors should use the main lobby instead. ___, additional signs will be posted throughout the building.",
    prompt: "Choisis le connecteur qui complète le texte.",
    options: [
      { id: "A", text: "Nevertheless" },
      { id: "B", text: "In addition" },
      { id: "C", text: "Otherwise" },
      { id: "D", text: "For example" }
    ],
    correctOptionId: "B",
    explanation: "La dernière phrase ajoute une mesure supplémentaire destinée à guider les visiteurs.",
    trap: "Choisir nevertheless alors qu’il n’existe aucune opposition entre les deux informations."
  },
  {
    id: "demo-p7-email",
    section: "Reading",
    part: 7,
    skill: "Compréhension de document",
    context: "From: Lina Moreau\nTo: Project Team\nSubject: Thursday presentation\n\nThe client has asked to see the prototype before discussing the budget. Please upload your final screens by Wednesday at noon so I can combine them into one presentation. I will send the meeting link once the client confirms the attendee list.",
    prompt: "Pourquoi Lina demande-t-elle les écrans avant mercredi midi ?",
    options: [
      { id: "A", text: "Pour les envoyer séparément au client" },
      { id: "B", text: "Pour préparer une présentation unique" },
      { id: "C", text: "Pour modifier la liste des participants" },
      { id: "D", text: "Pour calculer le budget du prototype" }
    ],
    correctOptionId: "B",
    explanation: "Elle précise qu’elle doit réunir les écrans dans une seule présentation avant la réunion.",
    trap: "Confondre l’ordre de la réunion : le prototype est présenté avant la discussion budgétaire."
  },
  {
    id: "demo-p1-delivery",
    section: "Listening",
    part: 1,
    skill: "Photographies",
    prompt: "Écoute les quatre descriptions et choisis celle qui correspond à la photographie.",
    photo: {
      src: "https://images.pexels.com/photos/6169177/pexels-photo-6169177.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Un livreur retire des colis d’une camionnette blanche.",
      creditUrl: "https://www.pexels.com/photo/delivery-man-getting-packages-from-a-van-6169177/"
    },
    options: [
      { id: "A", text: "A delivery worker is taking packages from a van." },
      { id: "B", text: "A customer is signing a document at a counter." },
      { id: "C", text: "The boxes have been placed on a store shelf." },
      { id: "D", text: "The vehicle is being washed in a garage." }
    ],
    correctOptionId: "A",
    explanation: "Le livreur retire clairement plusieurs colis de la camionnette.",
    trap: "Réagir à boxes ou vehicle sans vérifier l’action représentée."
  },
  {
    id: "demo-p2-location",
    section: "Listening",
    part: 2,
    skill: "Questions-réponses",
    prompt: "Écoute la question puis les trois réponses.",
    audioPrompt: "Where should I leave the signed contract?",
    options: [
      { id: "A", text: "On Ms. Patel's desk." },
      { id: "B", text: "It was signed yesterday." },
      { id: "C", text: "The contract lasts one year." },
      { id: "D", text: "" }
    ],
    correctOptionId: "A",
    explanation: "Where demande un lieu. Seule la réponse A indique où déposer le contrat.",
    trap: "Choisir une réponse qui répète signed ou contract sans répondre à la question."
  },
  {
    id: "demo-p2-indirect",
    section: "Listening",
    part: 2,
    skill: "Réponses indirectes",
    prompt: "Écoute la question puis les trois réponses.",
    audioPrompt: "Hasn't the supplier confirmed the delivery date yet?",
    options: [
      { id: "A", text: "I'll call them again this afternoon." },
      { id: "B", text: "The delivery truck is blue." },
      { id: "C", text: "Near the loading area." },
      { id: "D", text: "" }
    ],
    correctOptionId: "A",
    explanation: "La réponse ne dit pas directement non, mais l’action de rappeler le fournisseur montre que la confirmation manque encore.",
    trap: "Attendre obligatoirement yes ou no au lieu d’accepter une réponse indirecte naturelle."
  },
  {
    id: "demo-p1-meeting",
    section: "Listening",
    part: 1,
    skill: "Photographies",
    prompt: "Écoute les quatre descriptions et choisis celle qui correspond à la photographie.",
    photo: {
      src: "https://images.pexels.com/photos/17664083/pexels-photo-17664083.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Une salle de réunion avec des tables et des chaises disposées autour.",
      creditUrl: "https://www.pexels.com/photo/tables-and-chairs-in-office-room-17664083/"
    },
    options: [
      { id: "A", text: "Several chairs have been arranged around conference tables." },
      { id: "B", text: "Some employees are writing on a whiteboard." },
      { id: "C", text: "The furniture is being carried out of the room." },
      { id: "D", text: "A projector has been placed on every chair." }
    ],
    correctOptionId: "A",
    explanation: "Les chaises sont disposées autour des tables dans une salle vide.",
    trap: "Imaginer une action habituelle de réunion alors qu’aucune personne n’est visible."
  }
];
