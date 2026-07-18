export type ListeningOptionId = "A" | "B" | "C" | "D";
export type ListeningPart = 1 | 2;
export type ListeningMode = "part1" | "part2" | "mixed";

export type ListeningPhoto = {
  src: string;
  alt: string;
  sourceUrl: string;
  sourceLabel: string;
};

export type PublicListeningQuestion = {
  id: string;
  part: ListeningPart;
  skillId: string;
  skillLabel: string;
  difficulty: number;
  targetTimeMs: number;
  photo?: ListeningPhoto;
  voiceProfile: number;
  promptAudio: string;
  options: Array<{ id: ListeningOptionId; text: string }>;
};

type ListeningQuestion = PublicListeningQuestion & {
  correctOptionId: ListeningOptionId;
  explanation: string;
  trap: string;
};

const pexels = (id: number, slug: string, alt: string): ListeningPhoto => ({
  src: `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1400`,
  alt,
  sourceUrl: `https://www.pexels.com/photo/${slug}-${id}/`,
  sourceLabel: "Photo sous licence Pexels"
});

const p1 = (
  id: string,
  photo: ListeningPhoto,
  difficulty: number,
  options: [string, string, string, string],
  correctOptionId: ListeningOptionId,
  explanation: string,
  trap: string,
  voiceProfile: number
): ListeningQuestion => ({
  id,
  part: 1,
  skillId: "listening_photographs",
  skillLabel: "Photographies",
  difficulty,
  targetTimeMs: 30_000,
  photo,
  voiceProfile,
  promptAudio: "Look at the picture and listen to the four statements.",
  options: options.map((text, index) => ({ id: (["A", "B", "C", "D"] as ListeningOptionId[])[index], text })),
  correctOptionId,
  explanation,
  trap
});

const p2 = (
  id: string,
  difficulty: number,
  promptAudio: string,
  options: [string, string, string],
  correctOptionId: "A" | "B" | "C",
  explanation: string,
  trap: string,
  voiceProfile: number
): ListeningQuestion => ({
  id,
  part: 2,
  skillId: "listening_question_response",
  skillLabel: "Questions-réponses",
  difficulty,
  targetTimeMs: 22_000,
  voiceProfile,
  promptAudio,
  options: options.map((text, index) => ({ id: (["A", "B", "C"] as ListeningOptionId[])[index], text })),
  correctOptionId,
  explanation,
  trap
});

const questions: ListeningQuestion[] = [
  p1("listen-p1-001", pexels(17664083, "tables-and-chairs-in-office-room", "Une salle de réunion lumineuse avec plusieurs tables et chaises."), 1,
    ["Several chairs have been arranged around conference tables.", "Some people are writing on a whiteboard.", "The furniture is being carried out of the room.", "A projector has been placed on every chair."],
    "A", "Les chaises sont disposées autour des tables dans une salle de réunion vide.", "Choisir une action plausible dans une salle de réunion alors qu’aucune personne n’est visible.", 0),
  p1("listen-p1-002", pexels(6169177, "delivery-man-getting-packages-from-a-van", "Un livreur sort des colis d’une camionnette blanche."), 2,
    ["A delivery worker is taking packages from a van.", "A customer is signing a form at a counter.", "The boxes have been stacked on a store shelf.", "The vehicle is being washed in a garage."],
    "A", "Le livreur retire des colis de la camionnette.", "Se concentrer sur boxes ou vehicle sans vérifier l’action exacte.", 1),
  p1("listen-p1-003", pexels(11157601, "chefs-preparing-food-in-a-kitchen", "Plusieurs chefs préparent des plats sur le plan de travail d’une cuisine professionnelle."), 2,
    ["Several chefs are preparing food at a kitchen counter.", "Customers are reading menus near the entrance.", "The kitchen appliances are being delivered.", "All the dishes have been put away."],
    "A", "Plusieurs cuisiniers travaillent sur des préparations posées sur le comptoir.", "Entendre kitchen ou dishes et choisir une activité qui n’est pas visible.", 2),
  p1("listen-p1-004", pexels(9907669, "woman-watering-potted-plants", "Une femme arrose des plantes en pot dans un espace de travail."), 1,
    ["A woman is watering potted plants in a workspace.", "A woman is sweeping the floor near a window.", "Some plants are being loaded into a vehicle.", "A desk is being moved across the room."],
    "A", "La femme utilise un arrosoir pour entretenir les plantes en pot.", "Choisir une autre tâche d’entretien sans regarder l’objet tenu.", 3),
  p1("listen-p1-005", pexels(3846251, "technicians-in-factory-working-on-machine", "Des techniciens travaillent sur une machine dans un atelier industriel."), 3,
    ["Technicians are working on a piece of machinery.", "Workers are packing finished products into cartons.", "The equipment has been covered with a protective sheet.", "A forklift is transporting the machine."],
    "A", "Les personnes manipulent et inspectent une machine dans l’atelier.", "Associer automatiquement factory à packing ou forklift.", 0),
  p1("listen-p1-006", pexels(13404727, "back-view-of-people-queuing-at-an-airport-gate", "Des voyageurs font la queue devant une porte d’embarquement."), 2,
    ["Passengers are standing in line at an airport gate.", "Travelers are collecting luggage from a carousel.", "Every seat in the terminal is occupied.", "A flight attendant is serving refreshments."],
    "A", "Les passagers attendent en file devant la porte d’embarquement.", "Choisir une scène d’aéroport générique au lieu de l’action visible.", 1),
  p1("listen-p1-007", pexels(18427240, "passengers-waiting-at-a-city-bus-stop", "Plusieurs personnes attendent sous un abribus en ville."), 2,
    ["Several passengers are waiting at a bus stop.", "People are boarding a train on a platform.", "The road has been closed for construction.", "Bicycles are being rented beside a station."],
    "A", "Les personnes sont rassemblées dans la zone d’attente d’un arrêt de bus.", "Se laisser tromper par station et choisir un autre moyen de transport.", 2),
  p1("listen-p1-008", pexels(3791185, "pensive-female-worker-choosing-folder-with-documents-in-modern-office", "Une employée choisit un dossier sur une étagère de bureau."), 1,
    ["A woman is selecting a folder from a shelf.", "Documents are scattered across the floor.", "The shelving unit is being painted.", "All of the cabinets have been emptied."],
    "A", "L’employée prend ou examine un dossier rangé sur l’étagère.", "Confondre folder, shelf et cabinet sans vérifier le verbe.", 3),
  p1("listen-p1-009", pexels(5968968, "bicycle-locked-on-a-pole", "Un vélo est attaché à un poteau près d’un bâtiment."), 2,
    ["A bicycle has been locked to a pole.", "A cyclist is carrying a bicycle up some stairs.", "A mechanic is repairing a motorcycle.", "Pedestrians are crossing a busy intersection."],
    "A", "Le vélo est immobilisé et attaché au poteau.", "Entendre bicycle et sélectionner n’importe quelle action avec un deux-roues.", 0),
  p1("listen-p1-010", pexels(15141493, "team-of-workers-in-meeting", "Un groupe de salariés assiste à une présentation dans une salle."), 3,
    ["A group of employees is attending a presentation.", "Workers are removing tables from the room.", "A banner is being folded on the floor.", "The audience is taking photographs outdoors."],
    "A", "Les participants sont réunis dans une salle et suivent une présentation.", "Confondre une réunion en cours avec la préparation ou le rangement de la salle.", 1),

  p2("listen-p2-001", 1, "Where should I leave the signed contract?",
    ["On Ms. Patel's desk.", "It was signed yesterday.", "The contract is for one year."],
    "A", "Where demande un lieu. La réponse A indique directement où déposer le contrat.", "Choisir une réponse qui reprend contract ou signed mais ne répond pas à where.", 0),
  p2("listen-p2-002", 2, "Why was the meeting postponed?",
    ["In the main conference room.", "The director's flight was delayed.", "At half past two."],
    "B", "Why appelle une cause. Le retard du vol explique le report.", "Réagir à meeting avec un lieu ou une heure au lieu d’écouter le mot interrogatif.", 1),
  p2("listen-p2-003", 2, "Haven't you submitted the expense report yet?",
    ["I sent it this morning.", "The expenses were quite high.", "It's the finance department."],
    "A", "La question négative demande si l’action a été faite. A confirme avec le moment de l’envoi.", "Être perturbé par la forme négative et chercher obligatoirement yes ou no.", 2),
  p2("listen-p2-004", 1, "Who is leading the orientation session?",
    ["In the training room.", "Marcus from Human Resources.", "It lasts about an hour."],
    "B", "Who demande une personne. Marcus from Human Resources répond précisément.", "Choisir une réponse plausible sur la session sans identifier la personne.", 3),
  p2("listen-p2-005", 1, "When will the replacement printer arrive?",
    ["By Friday afternoon.", "The printer beside the window.", "Because the old one stopped working."],
    "A", "When demande un moment. By Friday afternoon indique l’échéance.", "Confondre when, which et why parce que toutes les réponses parlent de l’imprimante.", 0),
  p2("listen-p2-006", 2, "Could you help me move these boxes?",
    ["Sure, where should they go?", "The boxes were delivered yesterday.", "There are six of them."],
    "A", "Il s’agit d’une demande d’aide. A accepte et demande une précision utile.", "Attendre une réponse yes ou no exacte alors qu’une réponse indirecte naturelle convient.", 1),
  p2("listen-p2-007", 2, "How often is the safety equipment inspected?",
    ["By the maintenance team.", "Once every three months.", "In the storage area."],
    "B", "How often porte sur la fréquence. Once every three months répond directement.", "Confondre fréquence, personne responsable et lieu.", 2),
  p2("listen-p2-008", 2, "Which train goes to the city center?",
    ["The express on platform four.", "About twenty minutes.", "A return ticket, please."],
    "A", "Which demande d’identifier le train. A donne le type de train et le quai.", "Choisir une durée de trajet parce que le contexte est ferroviaire.", 3),
  p2("listen-p2-009", 2, "Isn't the cafeteria closed for renovation?",
    ["It reopened last week.", "The salad is very popular.", "Next to the elevators."],
    "A", "La réponse explique que la situation a changé : la cafétéria a rouvert.", "Se bloquer sur la question négative et ignorer une correction indirecte.", 0),
  p2("listen-p2-010", 3, "What did the client think of our proposal?",
    ["They asked for a few changes.", "I proposed Tuesday afternoon.", "The client will arrive soon."],
    "A", "La demande porte sur l’avis du client. Demander quelques modifications traduit sa réaction.", "Choisir proposed à cause de sa ressemblance avec proposal.", 1),
  p2("listen-p2-011", 1, "Would you prefer a window seat or an aisle seat?",
    ["An aisle seat, please.", "The flight leaves at noon.", "I looked through the window."],
    "A", "La question offre deux choix. A sélectionne clairement l’un d’eux.", "Réagir au mot window sans répondre au choix proposé.", 2),
  p2("listen-p2-012", 1, "Where can I print a visitor badge?",
    ["At the reception desk.", "For all first-time visitors.", "It has your name on it."],
    "A", "Where appelle un lieu. At the reception desk est la seule réponse spatiale.", "Choisir une phrase vraie sur le badge mais sans indication de lieu.", 3),
  p2("listen-p2-013", 2, "Why don't we order more brochures?",
    ["Good idea, we're almost out.", "The order arrived by courier.", "They describe our new services."],
    "A", "Why don't we est ici une suggestion. A l’accepte et ajoute une justification.", "Interpréter littéralement why et chercher uniquement une cause.", 0),
  p2("listen-p2-014", 1, "How long does the software installation take?",
    ["About two hours.", "On every office computer.", "The technician installed it."],
    "A", "How long demande une durée. About two hours répond exactement.", "Confondre durée avec lieu ou personne.", 1),
  p2("listen-p2-015", 2, "Whose laptop is on the conference table?",
    ["I think it belongs to Nina.", "The table seats twelve people.", "It's a lightweight model."],
    "A", "Whose demande le propriétaire. Belongs to Nina identifie la personne.", "Choisir une caractéristique de l’objet au lieu de son propriétaire.", 2),
  p2("listen-p2-016", 2, "Did the warehouse confirm the shipment?",
    ["Yes, it leaves tonight.", "The warehouse is near the highway.", "Three large containers."],
    "A", "La réponse confirme et ajoute une information cohérente sur le départ.", "Chercher une répétition exacte de confirm plutôt qu’une confirmation naturelle.", 3),
  p2("listen-p2-017", 3, "Can the project deadline be extended?",
    ["I'll ask the project manager.", "The extension cord is in the cabinet.", "We met the last deadline."],
    "A", "A propose l’étape logique pour obtenir la réponse auprès du responsable.", "Se faire piéger par extension cord, sans rapport avec le délai.", 0),
  p2("listen-p2-018", 1, "What time are you checking out of the hotel?",
    ["Around eleven o'clock.", "At the front desk.", "The room was very comfortable."],
    "A", "What time demande une heure. Around eleven o’clock convient.", "Choisir le lieu habituel du check-out au lieu de l’heure demandée.", 1),
  p2("listen-p2-019", 2, "Should I reserve a larger meeting room?",
    ["Yes, more people registered than expected.", "The reservation is under Lee.", "The room is on the third floor."],
    "A", "La question demande une recommandation. A répond oui et donne une raison.", "Choisir une information de réservation qui ne répond pas à should I.", 2),
  p2("listen-p2-020", 2, "How did you hear about the job opening?",
    ["A colleague sent me the listing.", "The position starts in August.", "I can hear you clearly now."],
    "A", "How did you hear about signifie par quel moyen l’offre a été découverte.", "Interpréter hear au sens purement auditif et choisir une réponse hors contexte.", 3)
];

const byId = new Map(questions.map((question) => [question.id, question]));

function hash(value: string) {
  let result = 0;
  for (let index = 0; index < value.length; index += 1) result = (result * 31 + value.charCodeAt(index)) >>> 0;
  return result;
}

function publicQuestion(question: ListeningQuestion): PublicListeningQuestion {
  const { correctOptionId: _correct, explanation: _explanation, trap: _trap, ...safe } = question;
  return safe;
}

export function buildListeningSession(mode: ListeningMode, count: number, seed: string) {
  const wanted = Math.max(1, Math.min(count, 20));
  const part1 = questions.filter((question) => question.part === 1);
  const part2 = questions.filter((question) => question.part === 2);
  const ordered = (items: ListeningQuestion[], suffix: string) =>
    [...items].sort((a, b) => hash(`${seed}-${suffix}-${a.id}`) - hash(`${seed}-${suffix}-${b.id}`));

  if (mode === "part1") return ordered(part1, "p1").slice(0, Math.min(wanted, part1.length)).map(publicQuestion);
  if (mode === "part2") return ordered(part2, "p2").slice(0, Math.min(wanted, part2.length)).map(publicQuestion);

  const part1Count = Math.min(4, Math.max(1, Math.round(wanted / 3)));
  const selected = [
    ...ordered(part1, "mix-p1").slice(0, part1Count),
    ...ordered(part2, "mix-p2").slice(0, wanted - part1Count)
  ].sort((a, b) => hash(`${seed}-mix-${a.id}`) - hash(`${seed}-mix-${b.id}`));
  return selected.map(publicQuestion);
}

export function hasListeningQuestion(questionId: string) {
  return byId.has(questionId);
}

export function evaluateListeningAnswer(questionId: string, selectedOptionId: string) {
  const question = byId.get(questionId);
  if (!question || !question.options.some((option) => option.id === selectedOptionId)) return null;
  const selected = selectedOptionId as ListeningOptionId;
  return {
    question,
    isCorrect: selected === question.correctOptionId,
    selectedOptionId: selected,
    selectedFeedback: selected === question.correctOptionId
      ? "Ton choix répond précisément à la situation entendue."
      : "Ce choix reprend un mot ou un contexte plausible, mais ne correspond pas à la fonction exacte de la question ou à l’action visible."
  };
}

export function listeningQuestionCount() {
  return questions.length;
}
