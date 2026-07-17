export type ListeningOptionId = "A" | "B" | "C" | "D";
export type ListeningPart = 1 | 2;
export type ListeningMode = "part1" | "part2" | "mixed";
export type ListeningSceneId =
  | "meeting-chairs"
  | "delivery-van"
  | "chef-counter"
  | "watering-plants"
  | "machine-technicians"
  | "boarding-gate"
  | "bus-stop"
  | "folders-shelf"
  | "bicycle-building"
  | "conference-banner";

export type PublicListeningQuestion = {
  id: string;
  part: ListeningPart;
  skillId: string;
  skillLabel: string;
  difficulty: number;
  targetTimeMs: number;
  scene?: ListeningSceneId;
  voiceProfile: number;
  promptAudio: string;
  options: Array<{ id: ListeningOptionId; text: string }>;
};

type ListeningQuestion = PublicListeningQuestion & {
  correctOptionId: ListeningOptionId;
  explanation: string;
  trap: string;
};

const p1 = (
  id: string,
  scene: ListeningSceneId,
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
  scene,
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
  p1("listen-p1-001", "meeting-chairs", 1,
    ["A woman is arranging chairs around a table.", "A woman is writing on a whiteboard.", "Several people are leaving a meeting room.", "The chairs are stacked against a wall."],
    "A", "La personne déplace les chaises autour de la table pour préparer la salle.", "Entendre le mot chairs sans vérifier l’action exacte.", 0),
  p1("listen-p1-002", "delivery-van", 2,
    ["Some boxes are being loaded onto a truck.", "A delivery worker is carrying a package away from a van.", "The vehicle is parked inside a warehouse.", "A customer is signing a receipt at a counter."],
    "B", "Le livreur transporte un colis depuis la camionnette vers le bâtiment.", "Confondre loaded onto et carried away from, deux formulations avec les mêmes objets.", 1),
  p1("listen-p1-003", "chef-counter", 2,
    ["A cook is placing dishes on a counter.", "Customers are ordering meals from a menu.", "The kitchen equipment is being repaired.", "Several plates are being washed in a sink."],
    "A", "Le cuisinier dépose des assiettes préparées sur le plan de travail.", "Se concentrer sur plates et choisir une action fréquente mais absente.", 2),
  p1("listen-p1-004", "watering-plants", 1,
    ["A woman is watering plants in a lobby.", "A woman is sweeping the entrance.", "Some flowers are being delivered.", "The reception desk is being moved."],
    "A", "La femme utilise un arrosoir près de plantes dans un hall.", "Choisir une action d’entretien plausible sans regarder l’objet tenu.", 3),
  p1("listen-p1-005", "machine-technicians", 3,
    ["Two technicians are examining a machine.", "Two employees are packing finished products.", "The machinery has been covered with a sheet.", "One of the workers is operating a forklift."],
    "A", "Les deux personnes observent et contrôlent une machine industrielle.", "Associer factory à packing ou forklift alors que ces actions ne sont pas visibles.", 0),
  p1("listen-p1-006", "boarding-gate", 2,
    ["A passenger is scanning a boarding pass.", "A traveler is collecting luggage from a carousel.", "The airport seats are all occupied.", "A flight attendant is serving a beverage."],
    "A", "Le passager présente son téléphone au lecteur de la porte d’embarquement.", "Choisir une scène d’aéroport générique plutôt que l’action précise.", 1),
  p1("listen-p1-007", "bus-stop", 2,
    ["People are waiting beside a bus stop sign.", "Passengers are boarding a train.", "A road is being closed for construction.", "Several bicycles are lined up near a station."],
    "A", "Plusieurs personnes attendent près du panneau d’arrêt de bus.", "Se laisser tromper par station et choisir un autre moyen de transport.", 2),
  p1("listen-p1-008", "folders-shelf", 1,
    ["A clerk is placing folders on a shelf.", "Some documents are scattered across the floor.", "A cabinet door is being painted.", "The shelves have been emptied."],
    "A", "L’employée range des dossiers sur une étagère.", "Confondre shelf, cabinet et folders sans vérifier le verbe.", 3),
  p1("listen-p1-009", "bicycle-building", 2,
    ["A cyclist is locking a bicycle near a building.", "A bicycle is being carried up some stairs.", "A man is repairing a motorcycle.", "Several pedestrians are crossing the street."],
    "A", "Le cycliste attache son vélo à un support près de l’entrée.", "Entendre bicycle et choisir n’importe quelle action impliquant un deux-roues.", 0),
  p1("listen-p1-010", "conference-banner", 3,
    ["Workers are hanging a banner in a conference room.", "A presentation is being projected onto a screen.", "The tables are being removed from the room.", "Guests are taking photographs of a speaker."],
    "A", "Deux personnes installent une bannière au-dessus de l’espace de conférence.", "Confondre préparation d’événement et événement déjà commencé.", 1),

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
