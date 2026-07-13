export type PracticeOptionId = "A" | "B" | "C" | "D";

export type PublicPracticeQuestion = {
  id: string;
  part: number;
  skillId: string;
  skillLabel: string;
  subskill: string;
  difficulty: number;
  targetTimeMs: number;
  prompt: string;
  context?: string;
  options: Array<{ id: PracticeOptionId; text: string }>;
};

type PracticeQuestion = PublicPracticeQuestion & {
  correctOptionId: PracticeOptionId;
  explanation: string;
  trap: string;
  optionFeedback: Record<PracticeOptionId, string>;
};

export type PracticePriority = {
  skillId: string;
  mastery: number;
};

const questions: PracticeQuestion[] = [
  {
    id: "practice-tense-01",
    part: 5,
    skillId: "grammar_tenses",
    skillLabel: "Temps verbaux",
    subskill: "Past perfect continuous",
    difficulty: 3,
    targetTimeMs: 30000,
    prompt: "The consultants said they ______ on the restructuring plan for six months before it was cancelled.",
    options: [{ id: "A", text: "had been working" }, { id: "B", text: "were working" }, { id: "C", text: "have worked" }, { id: "D", text: "are working" }],
    correctOptionId: "A",
    explanation: "L’action avait commencé avant l’annulation, avait duré six mois et était encore en cours. On emploie had been + verbe en -ing.",
    trap: "Choisir le past continuous uniquement parce que toute la scène est passée.",
    optionFeedback: { A: "Cette forme exprime correctement une action longue antérieure à un autre événement passé.", B: "Le past continuous décrit une action en cours dans le passé, mais marque moins clairement l’antériorité et la durée avant l’annulation.", C: "Le present perfect relie normalement le passé au présent, alors que l’annulation est un repère passé terminé.", D: "Le présent ne correspond pas à la chronologie passée." }
  },
  {
    id: "practice-tense-02",
    part: 5,
    skillId: "grammar_tenses",
    skillLabel: "Temps verbaux",
    subskill: "Present perfect",
    difficulty: 2,
    targetTimeMs: 26000,
    prompt: "The company ______ three new offices since the beginning of the year.",
    options: [{ id: "A", text: "opens" }, { id: "B", text: "opened" }, { id: "C", text: "has opened" }, { id: "D", text: "is opening" }],
    correctOptionId: "C",
    explanation: "Since the beginning of the year relie une période commencée dans le passé à la situation actuelle. Le present perfect convient.",
    trap: "Prendre le past simple dès qu’une action est terminée, sans regarder le lien avec le présent.",
    optionFeedback: { A: "Le présent simple exprimerait une habitude, pas un bilan depuis le début de l’année.", B: "Le past simple conviendrait avec une date passée entièrement terminée.", C: "Has opened présente le bilan actuel des ouvertures réalisées depuis un point de départ passé.", D: "Le présent progressif insiste sur une action en cours et ne convient pas au nombre déjà atteint." }
  },
  {
    id: "practice-tense-03",
    part: 5,
    skillId: "grammar_tenses",
    skillLabel: "Temps verbaux",
    subskill: "Future perfect",
    difficulty: 4,
    targetTimeMs: 34000,
    prompt: "By the end of this quarter, the team ______ the software migration.",
    options: [{ id: "A", text: "will complete" }, { id: "B", text: "will have completed" }, { id: "C", text: "completed" }, { id: "D", text: "has completed" }],
    correctOptionId: "B",
    explanation: "By the end of this quarter fixe une échéance future avant laquelle l’action sera déjà terminée : will have + participe passé.",
    trap: "Confondre une simple action future avec un résultat déjà acquis à une date future.",
    optionFeedback: { A: "Le futur simple annonce l’action, mais n’insiste pas sur son achèvement avant l’échéance.", B: "Le future perfect est précisément utilisé pour une action achevée avant un repère futur.", C: "Le past simple place l’action dans un passé terminé.", D: "Le present perfect ne peut pas être construit autour d’une échéance future de cette manière." }
  },
  {
    id: "practice-prep-01",
    part: 5,
    skillId: "grammar_prepositions",
    skillLabel: "Prépositions",
    subskill: "Date limite",
    difficulty: 1,
    targetTimeMs: 22000,
    prompt: "Please submit the signed agreement ______ noon tomorrow.",
    options: [{ id: "A", text: "by" }, { id: "B", text: "during" }, { id: "C", text: "since" }, { id: "D", text: "among" }],
    correctOptionId: "A",
    explanation: "By indique une échéance : le document doit être remis au plus tard demain midi.",
    trap: "Confondre une limite avec une période pendant laquelle quelque chose se produit.",
    optionFeedback: { A: "By signifie au plus tard à ce moment.", B: "During doit être suivi d’une période et signifie pendant.", C: "Since indique un point de départ.", D: "Among signifie parmi plusieurs éléments." }
  },
  {
    id: "practice-prep-02",
    part: 5,
    skillId: "grammar_prepositions",
    skillLabel: "Prépositions",
    subskill: "Responsabilité",
    difficulty: 2,
    targetTimeMs: 26000,
    prompt: "Ms. Ortega is responsible ______ coordinating the annual conference.",
    options: [{ id: "A", text: "to" }, { id: "B", text: "for" }, { id: "C", text: "with" }, { id: "D", text: "at" }],
    correctOptionId: "B",
    explanation: "L’expression fixe est be responsible for + nom ou verbe en -ing.",
    trap: "Traduire mot à mot depuis le français au lieu de reconnaître la collocation anglaise.",
    optionFeedback: { A: "Responsible to peut désigner la personne à qui l’on rend des comptes, mais pas la tâche elle-même ici.", B: "Responsible for est la construction attendue devant coordinating.", C: "Responsible with n’est pas la collocation standard.", D: "Responsible at n’est pas correct dans ce contexte." }
  },
  {
    id: "practice-prep-03",
    part: 5,
    skillId: "grammar_prepositions",
    skillLabel: "Prépositions",
    subskill: "Moyen de transport",
    difficulty: 2,
    targetTimeMs: 24000,
    prompt: "Most employees travel to the regional office ______ train.",
    options: [{ id: "A", text: "on" }, { id: "B", text: "with" }, { id: "C", text: "by" }, { id: "D", text: "from" }],
    correctOptionId: "C",
    explanation: "On dit by train, by car ou by plane pour exprimer le moyen de transport de manière générale.",
    trap: "Choisir on parce qu’une personne se trouve physiquement dans ou sur un véhicule.",
    optionFeedback: { A: "On the train serait possible avec un article pour parler de la présence dans un train précis.", B: "With train n’est pas idiomatique.", C: "By + moyen de transport sans article est la construction correcte.", D: "From indique une origine." }
  },
  {
    id: "practice-structure-01",
    part: 5,
    skillId: "grammar_structure",
    skillLabel: "Structure grammaticale",
    subskill: "Nom ou adjectif",
    difficulty: 2,
    targetTimeMs: 28000,
    prompt: "The board praised the marketing team for its ______ response to the crisis.",
    options: [{ id: "A", text: "quickly" }, { id: "B", text: "quickness" }, { id: "C", text: "quick" }, { id: "D", text: "quicken" }],
    correctOptionId: "C",
    explanation: "Response est un nom. Il faut donc un adjectif placé avant ce nom : quick response.",
    trap: "Choisir l’adverbe quickly parce qu’il décrit l’idée de rapidité.",
    optionFeedback: { A: "Quickly est un adverbe et ne modifie pas directement le nom response.", B: "Quickness est un nom ; deux noms pourraient parfois se suivre, mais cette combinaison n’est pas naturelle ici.", C: "Quick est l’adjectif qui qualifie response.", D: "Quicken est un verbe." }
  },
  {
    id: "practice-structure-02",
    part: 5,
    skillId: "grammar_structure",
    skillLabel: "Structure grammaticale",
    subskill: "Voix passive",
    difficulty: 3,
    targetTimeMs: 32000,
    prompt: "All visitors must ______ by a member of staff while inside the laboratory.",
    options: [{ id: "A", text: "accompany" }, { id: "B", text: "be accompanied" }, { id: "C", text: "accompanying" }, { id: "D", text: "have accompany" }],
    correctOptionId: "B",
    explanation: "Les visiteurs reçoivent l’action d’être accompagnés. Après must, la voix passive se forme avec be + participe passé.",
    trap: "Choisir l’actif sans vérifier qui réalise réellement l’action.",
    optionFeedback: { A: "Must accompany signifierait que les visiteurs doivent accompagner quelqu’un.", B: "Must be accompanied exprime correctement l’obligation à la voix passive.", C: "Le gérondif ne suit pas directement must.", D: "La construction have accompany est incorrecte." }
  },
  {
    id: "practice-structure-03",
    part: 5,
    skillId: "grammar_structure",
    skillLabel: "Structure grammaticale",
    subskill: "Proposition relative",
    difficulty: 3,
    targetTimeMs: 32000,
    prompt: "The analyst ______ prepared the forecast will present it at tomorrow’s meeting.",
    options: [{ id: "A", text: "who" }, { id: "B", text: "which" }, { id: "C", text: "whose" }, { id: "D", text: "where" }],
    correctOptionId: "A",
    explanation: "L’antécédent est une personne et le pronom relatif est sujet de prepared : who.",
    trap: "Choisir which par réflexe dès que la phrase est professionnelle ou technique.",
    optionFeedback: { A: "Who reprend une personne et joue le rôle de sujet du verbe prepared.", B: "Which reprend une chose ou un animal, pas l’analyste.", C: "Whose exprime la possession et devrait être suivi d’un nom.", D: "Where reprend un lieu." }
  },
  {
    id: "practice-vocab-01",
    part: 5,
    skillId: "business_vocabulary",
    skillLabel: "Vocabulaire professionnel",
    subskill: "Recrutement",
    difficulty: 2,
    targetTimeMs: 28000,
    prompt: "Only candidates who meet all the requirements will be ______ for an interview.",
    options: [{ id: "A", text: "shortlisted" }, { id: "B", text: "stored" }, { id: "C", text: "supplied" }, { id: "D", text: "withdrawn" }],
    correctOptionId: "A",
    explanation: "To shortlist signifie sélectionner un nombre réduit de candidats pour l’étape suivante.",
    trap: "Choisir un mot familier qui semble grammaticalement possible mais ne correspond pas au recrutement.",
    optionFeedback: { A: "Shortlisted est le terme professionnel attendu pour des candidats présélectionnés.", B: "Stored signifie stocké ou conservé.", C: "Supplied signifie fourni.", D: "Withdrawn signifie retiré." }
  },
  {
    id: "practice-vocab-02",
    part: 5,
    skillId: "business_vocabulary",
    skillLabel: "Vocabulaire professionnel",
    subskill: "Finance",
    difficulty: 3,
    targetTimeMs: 30000,
    prompt: "The finance department asked each division to reduce unnecessary ______.",
    options: [{ id: "A", text: "expenses" }, { id: "B", text: "experiences" }, { id: "C", text: "experiments" }, { id: "D", text: "expectations" }],
    correctOptionId: "A",
    explanation: "Expenses désigne les dépenses. Reduce unnecessary expenses est une collocation courante en entreprise.",
    trap: "Se laisser piéger par des mots de forme proche.",
    optionFeedback: { A: "Expenses correspond exactement aux coûts que l’on cherche à réduire.", B: "Experiences signifie expériences vécues.", C: "Experiments signifie expériences scientifiques.", D: "Expectations signifie attentes." }
  },
  {
    id: "practice-vocab-03",
    part: 5,
    skillId: "business_vocabulary",
    skillLabel: "Vocabulaire professionnel",
    subskill: "Logistique",
    difficulty: 3,
    targetTimeMs: 30000,
    prompt: "Customers can track their ______ online using the reference number in the confirmation email.",
    options: [{ id: "A", text: "shipment" }, { id: "B", text: "shift" }, { id: "C", text: "shelter" }, { id: "D", text: "shareholder" }],
    correctOptionId: "A",
    explanation: "Shipment désigne un envoi ou une expédition que l’on peut suivre grâce à un numéro de référence.",
    trap: "Choisir un mot commençant de la même façon sans vérifier le sens du contexte.",
    optionFeedback: { A: "Shipment est l’envoi suivi en ligne.", B: "Shift signifie poste ou période de travail.", C: "Shelter signifie abri.", D: "Shareholder signifie actionnaire." }
  },
  {
    id: "practice-detail-01",
    part: 7,
    skillId: "reading_detail",
    skillLabel: "Compréhension des détails",
    subskill: "Horaire",
    difficulty: 2,
    targetTimeMs: 45000,
    context: "NOTICE — The west entrance will be closed from 7 a.m. to 11 a.m. on Tuesday for maintenance. Employees should use the parking-garage entrance during this period.",
    prompt: "When will the west entrance reopen?",
    options: [{ id: "A", text: "At 7 a.m." }, { id: "B", text: "At 11 a.m." }, { id: "C", text: "On Wednesday" }, { id: "D", text: "After the parking garage closes" }],
    correctOptionId: "B",
    explanation: "Le texte indique une fermeture de 7 h à 11 h. L’entrée rouvre donc à 11 h.",
    trap: "Repérer une heure dans le texte sans vérifier si elle correspond au début ou à la fin.",
    optionFeedback: { A: "7 h est l’heure de début de la fermeture.", B: "11 h est la fin de la période de fermeture.", C: "Le texte parle de mardi uniquement.", D: "Aucune fermeture du parking n’est mentionnée." }
  },
  {
    id: "practice-detail-02",
    part: 7,
    skillId: "reading_detail",
    skillLabel: "Compréhension des détails",
    subskill: "Condition commerciale",
    difficulty: 3,
    targetTimeMs: 50000,
    context: "EMAIL — Orders placed before 2 p.m. are normally shipped the same business day. Orders placed later are processed the following business day.",
    prompt: "What happens to an order placed at 3 p.m. on Monday?",
    options: [{ id: "A", text: "It is cancelled." }, { id: "B", text: "It ships on Monday evening." }, { id: "C", text: "It is processed on Tuesday." }, { id: "D", text: "It receives free delivery." }],
    correctOptionId: "C",
    explanation: "3 p.m. est après la limite de 2 p.m. L’ordre est donc traité le jour ouvré suivant, mardi.",
    trap: "Confondre shipped et processed ou oublier la condition before 2 p.m.",
    optionFeedback: { A: "Aucune annulation n’est prévue.", B: "L’expédition le jour même concerne les commandes avant 14 h.", C: "Le jour ouvré suivant lundi est mardi.", D: "Le texte ne parle pas de frais de livraison." }
  },
  {
    id: "practice-detail-03",
    part: 7,
    skillId: "reading_detail",
    skillLabel: "Compréhension des détails",
    subskill: "Lieu",
    difficulty: 2,
    targetTimeMs: 43000,
    context: "MEMO — Friday’s training session has been moved from Conference Room B to the auditorium on the first floor. The starting time remains 9:30 a.m.",
    prompt: "Where will the training session take place?",
    options: [{ id: "A", text: "In Conference Room B" }, { id: "B", text: "In the auditorium" }, { id: "C", text: "On the second floor" }, { id: "D", text: "At 9:30 a.m." }],
    correctOptionId: "B",
    explanation: "La séance a été déplacée vers l’auditorium du premier étage.",
    trap: "Retenir l’ancien lieu plutôt que le lieu mis à jour.",
    optionFeedback: { A: "Conference Room B est l’ancien lieu.", B: "L’auditorium est le nouveau lieu annoncé.", C: "Le texte précise le premier étage.", D: "9 h 30 est une heure, pas un lieu." }
  },
  {
    id: "practice-inference-01",
    part: 7,
    skillId: "reading_inference",
    skillLabel: "Inférences",
    subskill: "Intention",
    difficulty: 3,
    targetTimeMs: 52000,
    context: "MESSAGE — I have attached the revised brochure. Please check the new pricing table before I send the file to the printer this afternoon. — Elena",
    prompt: "What does Elena most likely want the recipient to do?",
    options: [{ id: "A", text: "Print the brochure immediately" }, { id: "B", text: "Review part of the brochure" }, { id: "C", text: "Design a new logo" }, { id: "D", text: "Contact customers" }],
    correctOptionId: "B",
    explanation: "Elena demande explicitement de vérifier le nouveau tableau des prix avant l’impression. Il faut donc relire une partie du document.",
    trap: "Choisir l’action finale mentionnée dans le message plutôt que l’action demandée au destinataire.",
    optionFeedback: { A: "C’est Elena qui prévoit d’envoyer le fichier à l’imprimeur.", B: "Check the new pricing table signifie revoir une partie précise de la brochure.", C: "Aucun changement de logo n’est demandé.", D: "Les clients ne sont pas mentionnés." }
  },
  {
    id: "practice-inference-02",
    part: 7,
    skillId: "reading_inference",
    skillLabel: "Inférences",
    subskill: "Problème implicite",
    difficulty: 4,
    targetTimeMs: 56000,
    context: "REVIEW — The Lakeside Hotel is ten minutes from the convention center. Rooms are quiet and the staff is helpful, but the restaurant closes at 8 p.m.",
    prompt: "What might a late-arriving guest want to do?",
    options: [{ id: "A", text: "Bring earplugs" }, { id: "B", text: "Eat before arriving" }, { id: "C", text: "Avoid the convention center" }, { id: "D", text: "Request different staff" }],
    correctOptionId: "B",
    explanation: "Le seul inconvénient mentionné est la fermeture du restaurant à 20 h. Une personne arrivant tard pourrait donc manger avant son arrivée.",
    trap: "Choisir une réponse liée à un détail positif ou inventer un problème absent du texte.",
    optionFeedback: { A: "Les chambres sont décrites comme calmes.", B: "Cette action répond logiquement à la fermeture précoce du restaurant.", C: "La proximité du centre de congrès est présentée comme un avantage.", D: "Le personnel est décrit comme serviable." }
  },
  {
    id: "practice-inference-03",
    part: 7,
    skillId: "reading_inference",
    skillLabel: "Inférences",
    subskill: "Étape suivante",
    difficulty: 4,
    targetTimeMs: 56000,
    context: "EMAIL — Your application has been approved. To activate the account, please sign the attached form and return it by Thursday. Access credentials will be issued after we receive it.",
    prompt: "What will most likely happen after the signed form is received?",
    options: [{ id: "A", text: "The application will be rejected" }, { id: "B", text: "A new form will be mailed" }, { id: "C", text: "Login information will be provided" }, { id: "D", text: "A fee will be refunded" }],
    correctOptionId: "C",
    explanation: "Le message précise que les identifiants d’accès seront émis après réception du formulaire signé.",
    trap: "Répondre à partir d’un scénario courant plutôt que de relier les deux phrases du texte.",
    optionFeedback: { A: "L’application est déjà approuvée.", B: "Le formulaire est déjà joint.", C: "Access credentials correspond aux informations de connexion.", D: "Aucun remboursement n’est mentionné." }
  }
];

const byId = new Map(questions.map((question) => [question.id, question]));

function publicQuestion(question: PracticeQuestion): PublicPracticeQuestion {
  const { correctOptionId: _correct, explanation: _explanation, trap: _trap, optionFeedback: _feedback, ...safe } = question;
  return safe;
}

function hash(value: string) {
  let result = 0;
  for (let index = 0; index < value.length; index += 1) result = (result * 31 + value.charCodeAt(index)) >>> 0;
  return result;
}

export function buildPracticeSession(
  priorities: PracticePriority[],
  dueQuestionCodes: string[],
  count: number,
  seed: string
): PublicPracticeQuestion[] {
  const wanted = Math.max(1, Math.min(count, questions.length));
  const selected: PracticeQuestion[] = [];
  const selectedIds = new Set<string>();

  for (const code of dueQuestionCodes) {
    const question = byId.get(code);
    if (question && !selectedIds.has(question.id) && selected.length < wanted) {
      selected.push(question);
      selectedIds.add(question.id);
    }
  }

  const orderedPriorities = [...priorities].sort((a, b) => a.mastery - b.mastery);
  const fallbackSkills = [...new Set(questions.map((question) => question.skillId))]
    .filter((skillId) => !orderedPriorities.some((priority) => priority.skillId === skillId))
    .map((skillId) => ({ skillId, mastery: 50 }));
  const skillOrder = [...orderedPriorities, ...fallbackSkills];

  let round = 0;
  while (selected.length < wanted && round < 10) {
    for (const priority of skillOrder) {
      if (selected.length >= wanted) break;
      const candidates = questions
        .filter((question) => question.skillId === priority.skillId && !selectedIds.has(question.id))
        .sort((a, b) => hash(`${seed}-${round}-${a.id}`) - hash(`${seed}-${round}-${b.id}`));
      const candidate = candidates[0];
      if (candidate) {
        selected.push(candidate);
        selectedIds.add(candidate.id);
      }
    }
    round += 1;
  }

  if (selected.length < wanted) {
    const remaining = questions
      .filter((question) => !selectedIds.has(question.id))
      .sort((a, b) => hash(`${seed}-${a.id}`) - hash(`${seed}-${b.id}`));
    selected.push(...remaining.slice(0, wanted - selected.length));
  }

  return selected.map(publicQuestion);
}

export function evaluatePracticeAnswer(questionId: string, selectedOptionId: string) {
  const question = byId.get(questionId);
  if (!question || !["A", "B", "C", "D"].includes(selectedOptionId)) return null;
  const selected = selectedOptionId as PracticeOptionId;
  return {
    question,
    isCorrect: selected === question.correctOptionId,
    selectedOptionId: selected,
    selectedFeedback: question.optionFeedback[selected]
  };
}

export function hasPracticeQuestion(questionId: string) {
  return byId.has(questionId);
}
