export type DiagnosticOption = {
  id: "A" | "B" | "C" | "D";
  text: string;
};

export type PublicDiagnosticQuestion = {
  id: string;
  part: number;
  skillId: string;
  skillLabel: string;
  subskill: string;
  difficulty: number;
  prompt: string;
  options: DiagnosticOption[];
};

type DiagnosticQuestion = PublicDiagnosticQuestion & {
  correctOptionId: DiagnosticOption["id"];
  explanation: string;
  trap: string;
};

export type DiagnosticAnswerInput = {
  questionId: string;
  selectedOptionId: string;
  responseTimeMs: number;
};

export type SkillDiagnosticResult = {
  skillId: string;
  label: string;
  correct: number;
  total: number;
  mastery: number;
  averageResponseMs: number;
};

export type DiagnosticEvaluation = {
  correctAnswers: number;
  totalQuestions: number;
  estimatedScore: number;
  scoreLow: number;
  scoreHigh: number;
  skillBreakdown: SkillDiagnosticResult[];
  reviewedAnswers: Array<{
    questionId: string;
    skillId: string;
    selectedOptionId: string;
    correctOptionId: string;
    isCorrect: boolean;
    responseTimeMs: number;
  }>;
};

const questions: DiagnosticQuestion[] = [
  {
    id: "diag-tense-01",
    part: 5,
    skillId: "grammar_tenses",
    skillLabel: "Temps verbaux",
    subskill: "Past perfect",
    difficulty: 3,
    prompt: "By the time the manager arrived, the accounting team ______ the monthly report.",
    options: [
      { id: "A", text: "finishes" },
      { id: "B", text: "had finished" },
      { id: "C", text: "will finish" },
      { id: "D", text: "has finishing" }
    ],
    correctOptionId: "B",
    explanation: "Le rapport était terminé avant l’arrivée du manager, deux événements situés dans le passé. Le past perfect marque l’action la plus ancienne.",
    trap: "Choisir un présent perfect uniquement parce que l’action est terminée."
  },
  {
    id: "diag-tense-02",
    part: 5,
    skillId: "grammar_tenses",
    skillLabel: "Temps verbaux",
    subskill: "Present perfect",
    difficulty: 2,
    prompt: "Ms. Patel ______ in the purchasing department since 2022.",
    options: [
      { id: "A", text: "works" },
      { id: "B", text: "worked" },
      { id: "C", text: "has worked" },
      { id: "D", text: "is work" }
    ],
    correctOptionId: "C",
    explanation: "Since 2022 indique un point de départ dans le passé et une situation encore vraie aujourd’hui : on emploie le present perfect.",
    trap: "Utiliser le past simple avec since alors que la situation continue."
  },
  {
    id: "diag-tense-03",
    part: 5,
    skillId: "grammar_tenses",
    skillLabel: "Temps verbaux",
    subskill: "Future perfect",
    difficulty: 4,
    prompt: "By next Friday, the engineers ______ all safety inspections.",
    options: [
      { id: "A", text: "complete" },
      { id: "B", text: "completed" },
      { id: "C", text: "will have completed" },
      { id: "D", text: "have completing" }
    ],
    correctOptionId: "C",
    explanation: "By next Friday fixe une échéance future avant laquelle l’action sera terminée. Le future perfect convient : will have + participe passé.",
    trap: "Confondre une action future simple avec une action qui sera déjà achevée à une date future."
  },
  {
    id: "diag-tense-04",
    part: 5,
    skillId: "grammar_tenses",
    skillLabel: "Temps verbaux",
    subskill: "Past continuous",
    difficulty: 2,
    prompt: "While the director ______ the proposal, the fire alarm went off.",
    options: [
      { id: "A", text: "was presenting" },
      { id: "B", text: "has presented" },
      { id: "C", text: "presents" },
      { id: "D", text: "will present" }
    ],
    correctOptionId: "A",
    explanation: "Une action longue était en cours lorsqu’un événement bref l’a interrompue : past continuous + past simple.",
    trap: "Mettre les deux actions au past simple sans montrer l’action en cours."
  },
  {
    id: "diag-prep-01",
    part: 5,
    skillId: "grammar_prepositions",
    skillLabel: "Prépositions",
    subskill: "Date limite",
    difficulty: 1,
    prompt: "Applications must be received ______ 6 p.m. on Monday.",
    options: [
      { id: "A", text: "by" },
      { id: "B", text: "during" },
      { id: "C", text: "among" },
      { id: "D", text: "since" }
    ],
    correctOptionId: "A",
    explanation: "By signifie au plus tard et introduit ici une date limite.",
    trap: "Choisir during, qui exprime une période et non une échéance."
  },
  {
    id: "diag-prep-02",
    part: 5,
    skillId: "grammar_prepositions",
    skillLabel: "Prépositions",
    subskill: "Expression fixe",
    difficulty: 2,
    prompt: "The facilities team is responsible ______ maintaining the conference rooms.",
    options: [
      { id: "A", text: "at" },
      { id: "B", text: "for" },
      { id: "C", text: "to" },
      { id: "D", text: "with" }
    ],
    correctOptionId: "B",
    explanation: "L’expression correcte est be responsible for + nom ou verbe en -ing.",
    trap: "Traduire littéralement la préposition française."
  },
  {
    id: "diag-prep-03",
    part: 5,
    skillId: "grammar_prepositions",
    skillLabel: "Prépositions",
    subskill: "Adjectif + préposition",
    difficulty: 2,
    prompt: "Several employees are interested ______ joining the mentoring program.",
    options: [
      { id: "A", text: "in" },
      { id: "B", text: "on" },
      { id: "C", text: "from" },
      { id: "D", text: "of" }
    ],
    correctOptionId: "A",
    explanation: "On dit be interested in, suivi ici d’un verbe en -ing.",
    trap: "Choisir une préposition selon le français plutôt que mémoriser l’expression complète."
  },
  {
    id: "diag-structure-01",
    part: 5,
    skillId: "grammar_structure",
    skillLabel: "Structure grammaticale",
    subskill: "Participe passé",
    difficulty: 3,
    prompt: "Only candidates ______ for the final interview will receive an e-mail today.",
    options: [
      { id: "A", text: "shortlist" },
      { id: "B", text: "shortlisted" },
      { id: "C", text: "shortlisting" },
      { id: "D", text: "shortlists" }
    ],
    correctOptionId: "B",
    explanation: "Shortlisted est un participe passé qui réduit la proposition relative : candidates who were shortlisted.",
    trap: "Chercher un verbe conjugué alors que will receive est déjà le verbe principal."
  },
  {
    id: "diag-structure-02",
    part: 5,
    skillId: "grammar_structure",
    skillLabel: "Structure grammaticale",
    subskill: "Troisième personne",
    difficulty: 1,
    prompt: "The new software automatically ______ duplicate customer records.",
    options: [
      { id: "A", text: "detect" },
      { id: "B", text: "detecting" },
      { id: "C", text: "detects" },
      { id: "D", text: "detected" }
    ],
    correctOptionId: "C",
    explanation: "The new software est un sujet singulier à la troisième personne : au présent simple, le verbe prend -s.",
    trap: "Regarder records, placé après le verbe, au lieu d’identifier le véritable sujet."
  },
  {
    id: "diag-structure-03",
    part: 5,
    skillId: "grammar_structure",
    skillLabel: "Structure grammaticale",
    subskill: "Gérondif",
    difficulty: 3,
    prompt: "We look forward to ______ you at the annual conference.",
    options: [
      { id: "A", text: "meet" },
      { id: "B", text: "met" },
      { id: "C", text: "meeting" },
      { id: "D", text: "have met" }
    ],
    correctOptionId: "C",
    explanation: "Dans look forward to, to est une préposition. Elle doit être suivie d’un nom ou d’un verbe en -ing.",
    trap: "Voir to et choisir automatiquement l’infinitif."
  },
  {
    id: "diag-vocab-01",
    part: 5,
    skillId: "business_vocabulary",
    skillLabel: "Vocabulaire professionnel",
    subskill: "Frais professionnels",
    difficulty: 2,
    prompt: "The company will ______ employees for approved travel expenses.",
    options: [
      { id: "A", text: "reimburse" },
      { id: "B", text: "reserve" },
      { id: "C", text: "replace" },
      { id: "D", text: "retire" }
    ],
    correctOptionId: "A",
    explanation: "To reimburse someone signifie rembourser une personne pour une dépense.",
    trap: "Choisir un mot proche visuellement mais incorrect dans le contexte financier."
  },
  {
    id: "diag-vocab-02",
    part: 5,
    skillId: "business_vocabulary",
    skillLabel: "Vocabulaire professionnel",
    subskill: "Événementiel",
    difficulty: 2,
    prompt: "The hotel was selected as the ______ for this year’s sales convention.",
    options: [
      { id: "A", text: "venue" },
      { id: "B", text: "salary" },
      { id: "C", text: "receipt" },
      { id: "D", text: "shipment" }
    ],
    correctOptionId: "A",
    explanation: "Venue désigne le lieu où se déroule un événement.",
    trap: "Se laisser guider par le thème professionnel sans vérifier le sens précis du nom."
  },
  {
    id: "diag-vocab-03",
    part: 5,
    skillId: "business_vocabulary",
    skillLabel: "Vocabulaire professionnel",
    subskill: "Organisation",
    difficulty: 2,
    prompt: "Because of the rail strike, the client decided to ______ the site visit until Tuesday.",
    options: [
      { id: "A", text: "postpone" },
      { id: "B", text: "approve" },
      { id: "C", text: "hire" },
      { id: "D", text: "invoice" }
    ],
    correctOptionId: "A",
    explanation: "Postpone signifie reporter un événement à une date ultérieure.",
    trap: "Confondre postpone avec cancel : le rendez-vous est déplacé, pas supprimé."
  },
  {
    id: "diag-vocab-04",
    part: 5,
    skillId: "business_vocabulary",
    skillLabel: "Vocabulaire professionnel",
    subskill: "Recrutement",
    difficulty: 3,
    prompt: "After reviewing ninety applications, the recruiter ______ six people for interviews.",
    options: [
      { id: "A", text: "shortlisted" },
      { id: "B", text: "manufactured" },
      { id: "C", text: "delivered" },
      { id: "D", text: "repaired" }
    ],
    correctOptionId: "A",
    explanation: "To shortlist signifie sélectionner un petit nombre de candidats pour l’étape suivante.",
    trap: "Connaître shortlisted uniquement comme adjectif et oublier qu’il peut aussi être un verbe au passé."
  },
  {
    id: "diag-reading-detail-01",
    part: 7,
    skillId: "reading_detail",
    skillLabel: "Compréhension des détails",
    subskill: "Date et livraison",
    difficulty: 2,
    prompt: "NOTICE — Orders placed before 2 p.m. on Thursday will be shipped the same day. Orders received later will leave our warehouse on Monday.\n\nWhen will an order placed at 4 p.m. on Thursday leave the warehouse?",
    options: [
      { id: "A", text: "Thursday" },
      { id: "B", text: "Friday" },
      { id: "C", text: "Monday" },
      { id: "D", text: "Tuesday" }
    ],
    correctOptionId: "C",
    explanation: "L’ordre arrive après 14 h jeudi ; l’avis précise que ces commandes partent lundi.",
    trap: "Lire same day sans vérifier la condition before 2 p.m."
  },
  {
    id: "diag-reading-detail-02",
    part: 7,
    skillId: "reading_detail",
    skillLabel: "Compréhension des détails",
    subskill: "Lieu de réunion",
    difficulty: 2,
    prompt: "E-MAIL — The product meeting has been moved from Room 204 to the auditorium because more regional managers will attend. The starting time remains 10:30 a.m.\n\nWhere will the meeting take place?",
    options: [
      { id: "A", text: "Room 204" },
      { id: "B", text: "The auditorium" },
      { id: "C", text: "A regional office" },
      { id: "D", text: "The cafeteria" }
    ],
    correctOptionId: "B",
    explanation: "Le message indique explicitement que la réunion a été déplacée vers l’auditorium.",
    trap: "Retenir le premier lieu cité alors qu’il est remplacé par un nouveau."
  },
  {
    id: "diag-reading-detail-03",
    part: 7,
    skillId: "reading_detail",
    skillLabel: "Compréhension des détails",
    subskill: "Conditions commerciales",
    difficulty: 3,
    prompt: "PROMOTION — Members receive 15% off office chairs through August 31. The discount does not apply to delivery fees or assembly services.\n\nWhich item is discounted?",
    options: [
      { id: "A", text: "Delivery fees" },
      { id: "B", text: "Assembly services" },
      { id: "C", text: "Office chairs" },
      { id: "D", text: "All purchases" }
    ],
    correctOptionId: "C",
    explanation: "La réduction porte uniquement sur les chaises de bureau ; les autres frais sont exclus.",
    trap: "Étendre une promotion spécifique à toutes les dépenses mentionnées."
  },
  {
    id: "diag-inference-01",
    part: 7,
    skillId: "reading_inference",
    skillLabel: "Inférences",
    subskill: "Cause implicite",
    difficulty: 4,
    prompt: "E-MAIL — I have attached the revised brochure. The printer can still meet Friday’s deadline, but only if we approve the final version before noon today. — Lena\n\nWhat is most likely true?",
    options: [
      { id: "A", text: "The brochure has already been printed." },
      { id: "B", text: "A decision is needed quickly." },
      { id: "C", text: "The deadline was moved to next week." },
      { id: "D", text: "Lena works for the printer." }
    ],
    correctOptionId: "B",
    explanation: "L’impression à temps dépend d’une validation avant midi : une décision rapide est donc nécessaire.",
    trap: "Inventer une information sur le poste de Lena ou croire que l’impression est déjà terminée."
  },
  {
    id: "diag-inference-02",
    part: 7,
    skillId: "reading_inference",
    skillLabel: "Inférences",
    subskill: "But d’un message",
    difficulty: 3,
    prompt: "MEMO — The west entrance will remain closed while the security system is upgraded. Employees should use the reception entrance and allow extra time for badge checks.\n\nWhy was this memo most likely written?",
    options: [
      { id: "A", text: "To announce a change in building access" },
      { id: "B", text: "To recruit security employees" },
      { id: "C", text: "To cancel an upgrade" },
      { id: "D", text: "To request new identification cards" }
    ],
    correctOptionId: "A",
    explanation: "Le mémo explique quelle entrée utiliser pendant la fermeture temporaire de l’entrée ouest.",
    trap: "Choisir un sujet lié à la sécurité mais non exprimé par le message."
  },
  {
    id: "diag-inference-03",
    part: 7,
    skillId: "reading_inference",
    skillLabel: "Inférences",
    subskill: "Recommandation implicite",
    difficulty: 4,
    prompt: "REVIEW — The Lakeside Hotel is ten minutes from the convention center. Rooms are quiet and the staff is helpful, but the restaurant closes at 8 p.m.\n\nWhat might a late-arriving guest want to do?",
    options: [
      { id: "A", text: "Bring earplugs" },
      { id: "B", text: "Eat before arriving" },
      { id: "C", text: "Avoid the convention center" },
      { id: "D", text: "Request different staff" }
    ],
    correctOptionId: "B",
    explanation: "Puisque le restaurant ferme tôt, une personne arrivant tard devrait probablement manger avant son arrivée.",
    trap: "Transformer les points positifs de l’avis en problèmes inexistants."
  }
];

export function getPublicDiagnosticQuestions(): PublicDiagnosticQuestion[] {
  return questions.map(({ correctOptionId: _correct, explanation: _explanation, trap: _trap, ...question }) => question);
}

function roundToFive(value: number) {
  return Math.round(value / 5) * 5;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function evaluateDiagnostic(answers: DiagnosticAnswerInput[]): DiagnosticEvaluation {
  const answerMap = new Map(answers.map((answer) => [answer.questionId, answer]));
  const skillMap = new Map<string, { label: string; correct: number; total: number; responseMs: number }>();
  const reviewedAnswers: DiagnosticEvaluation["reviewedAnswers"] = [];
  let correctAnswers = 0;
  let weightedCorrect = 0;
  let weightedTotal = 0;

  for (const question of questions) {
    const answer = answerMap.get(question.id);
    const selectedOptionId = answer?.selectedOptionId ?? "";
    const responseTimeMs = clamp(Number(answer?.responseTimeMs ?? 0), 0, 10 * 60 * 1000);
    const isCorrect = selectedOptionId === question.correctOptionId;
    const weight = 1 + (question.difficulty - 1) * 0.12;

    if (isCorrect) {
      correctAnswers += 1;
      weightedCorrect += weight;
    }
    weightedTotal += weight;

    const skill = skillMap.get(question.skillId) ?? {
      label: question.skillLabel,
      correct: 0,
      total: 0,
      responseMs: 0
    };
    skill.total += 1;
    skill.correct += isCorrect ? 1 : 0;
    skill.responseMs += responseTimeMs;
    skillMap.set(question.skillId, skill);

    reviewedAnswers.push({
      questionId: question.id,
      skillId: question.skillId,
      selectedOptionId,
      correctOptionId: question.correctOptionId,
      isCorrect,
      responseTimeMs
    });
  }

  const ratio = weightedTotal === 0 ? 0 : weightedCorrect / weightedTotal;
  const estimatedScore = clamp(roundToFive(80 + ratio * 850), 10, 950);
  const uncertainty = 75;
  const scoreLow = clamp(roundToFive(estimatedScore - uncertainty), 10, 990);
  const scoreHigh = clamp(roundToFive(estimatedScore + uncertainty), 10, 990);

  const skillBreakdown = [...skillMap.entries()]
    .map(([skillId, skill]) => {
      const averageResponseMs = skill.total ? Math.round(skill.responseMs / skill.total) : 0;
      const priorAdjusted = ((skill.correct + 1) / (skill.total + 2)) * 100;
      const speedAdjustment = averageResponseMs > 60_000 ? -5 : averageResponseMs > 0 && averageResponseMs < 20_000 ? 3 : 0;
      return {
        skillId,
        label: skill.label,
        correct: skill.correct,
        total: skill.total,
        mastery: clamp(Math.round(priorAdjusted + speedAdjustment), 5, 95),
        averageResponseMs
      };
    })
    .sort((a, b) => a.mastery - b.mastery);

  return {
    correctAnswers,
    totalQuestions: questions.length,
    estimatedScore,
    scoreLow,
    scoreHigh,
    skillBreakdown,
    reviewedAnswers
  };
}

export const DIAGNOSTIC_QUESTION_COUNT = questions.length;
