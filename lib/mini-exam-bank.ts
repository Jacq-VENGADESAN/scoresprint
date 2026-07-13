export type MiniExamOption = {
  id: "A" | "B" | "C" | "D";
  text: string;
};

export type PublicMiniExamQuestion = {
  id: string;
  part: 5 | 6 | 7;
  skillId: string;
  skillLabel: string;
  subskill: string;
  difficulty: number;
  prompt: string;
  context?: string;
  options: MiniExamOption[];
};

type MiniExamQuestion = PublicMiniExamQuestion & {
  correctOptionId: MiniExamOption["id"];
  targetTimeMs: number;
};

export type MiniExamAnswerInput = {
  questionId: string;
  selectedOptionId: string;
  responseTimeMs: number;
};

export const MINI_EXAM_QUESTION_COUNT = 30;
export const MINI_EXAM_DURATION_SECONDS = 25 * 60;

function options(a: string, b: string, c: string, d: string): MiniExamOption[] {
  return [
    { id: "A", text: a },
    { id: "B", text: b },
    { id: "C", text: c },
    { id: "D", text: d }
  ];
}

const questions: MiniExamQuestion[] = [
  {
    id: "mini-p5-01",
    part: 5,
    skillId: "grammar_tenses",
    skillLabel: "Temps verbaux",
    subskill: "Past perfect",
    difficulty: 3,
    prompt: "By the time the auditors arrived, the finance team ______ all supporting documents.",
    options: options("prepares", "had prepared", "will prepare", "has preparing"),
    correctOptionId: "B",
    targetTimeMs: 30_000
  },
  {
    id: "mini-p5-02",
    part: 5,
    skillId: "grammar_tenses",
    skillLabel: "Temps verbaux",
    subskill: "Present perfect",
    difficulty: 2,
    prompt: "The company ______ three new regional offices since January.",
    options: options("opens", "opened", "has opened", "is opening yesterday"),
    correctOptionId: "C",
    targetTimeMs: 28_000
  },
  {
    id: "mini-p5-03",
    part: 5,
    skillId: "grammar_tenses",
    skillLabel: "Temps verbaux",
    subskill: "Future perfect",
    difficulty: 4,
    prompt: "By the end of the quarter, the project team ______ the first testing phase.",
    options: options("completes", "will have completed", "had completed", "is complete"),
    correctOptionId: "B",
    targetTimeMs: 35_000
  },
  {
    id: "mini-p5-04",
    part: 5,
    skillId: "grammar_structure",
    skillLabel: "Structure grammaticale",
    subskill: "Subject-verb agreement",
    difficulty: 2,
    prompt: "Each of the department managers ______ responsible for submitting a weekly report.",
    options: options("are", "were", "is", "have"),
    correctOptionId: "C",
    targetTimeMs: 28_000
  },
  {
    id: "mini-p5-05",
    part: 5,
    skillId: "grammar_structure",
    skillLabel: "Structure grammaticale",
    subskill: "Relative pronouns",
    difficulty: 3,
    prompt: "The consultant ______ prepared the market analysis will present it this afternoon.",
    options: options("whose", "who", "which", "where"),
    correctOptionId: "B",
    targetTimeMs: 30_000
  },
  {
    id: "mini-p5-06",
    part: 5,
    skillId: "grammar_prepositions",
    skillLabel: "Prépositions",
    subskill: "Deadlines",
    difficulty: 2,
    prompt: "All travel expense forms must be submitted ______ Friday at noon.",
    options: options("by", "during", "among", "since"),
    correctOptionId: "A",
    targetTimeMs: 25_000
  },
  {
    id: "mini-p5-07",
    part: 5,
    skillId: "grammar_prepositions",
    skillLabel: "Prépositions",
    subskill: "Contrast expressions",
    difficulty: 3,
    prompt: "______ the temporary delay, the product launch remains scheduled for next month.",
    options: options("Despite", "Because", "During", "Unless"),
    correctOptionId: "A",
    targetTimeMs: 30_000
  },
  {
    id: "mini-p5-08",
    part: 5,
    skillId: "business_vocabulary",
    skillLabel: "Vocabulaire professionnel",
    subskill: "Recruitment",
    difficulty: 2,
    prompt: "Only applicants with relevant management experience will be ______ for a second interview.",
    options: options("shortlisted", "stored", "delivered", "withdrawn"),
    correctOptionId: "A",
    targetTimeMs: 25_000
  },
  {
    id: "mini-p5-09",
    part: 5,
    skillId: "business_vocabulary",
    skillLabel: "Vocabulaire professionnel",
    subskill: "Regulations",
    difficulty: 3,
    prompt: "All contractors are required to ______ with the building's safety regulations.",
    options: options("comply", "compare", "compose", "compete"),
    correctOptionId: "A",
    targetTimeMs: 28_000
  },
  {
    id: "mini-p5-10",
    part: 5,
    skillId: "business_vocabulary",
    skillLabel: "Vocabulaire professionnel",
    subskill: "Billing",
    difficulty: 2,
    prompt: "The supplier contacted us because the latest invoice is now two weeks ______.",
    options: options("overdue", "available", "temporary", "accurate"),
    correctOptionId: "A",
    targetTimeMs: 25_000
  },
  {
    id: "mini-p5-11",
    part: 5,
    skillId: "grammar_structure",
    skillLabel: "Structure grammaticale",
    subskill: "Passive voice",
    difficulty: 3,
    prompt: "The revised contract ______ by both parties before the meeting began.",
    options: options("signed", "was signed", "has sign", "signing"),
    correctOptionId: "B",
    targetTimeMs: 32_000
  },
  {
    id: "mini-p5-12",
    part: 5,
    skillId: "grammar_structure",
    skillLabel: "Structure grammaticale",
    subskill: "Gerunds",
    difficulty: 3,
    prompt: "Employees should avoid ______ confidential documents on shared desks.",
    options: options("leave", "to leave", "leaving", "left"),
    correctOptionId: "C",
    targetTimeMs: 28_000
  },
  {
    id: "mini-p5-13",
    part: 5,
    skillId: "grammar_structure",
    skillLabel: "Structure grammaticale",
    subskill: "Conditionals",
    difficulty: 3,
    prompt: "The reservation will be cancelled ______ payment is received by tomorrow.",
    options: options("unless", "although", "while", "because of"),
    correctOptionId: "A",
    targetTimeMs: 30_000
  },
  {
    id: "mini-p5-14",
    part: 5,
    skillId: "grammar_structure",
    skillLabel: "Structure grammaticale",
    subskill: "Adverbs",
    difficulty: 2,
    prompt: "The customer service representative handled the complaint very ______.",
    options: options("professional", "professionally", "profession", "professionalism"),
    correctOptionId: "B",
    targetTimeMs: 25_000
  },
  {
    id: "mini-p5-15",
    part: 5,
    skillId: "grammar_structure",
    skillLabel: "Structure grammaticale",
    subskill: "Comparatives",
    difficulty: 2,
    prompt: "The updated software is significantly ______ than the previous version.",
    options: options("reliable", "more reliable", "most reliable", "reliably"),
    correctOptionId: "B",
    targetTimeMs: 25_000
  },
  {
    id: "mini-p6-01",
    part: 6,
    skillId: "grammar_tenses",
    skillLabel: "Temps verbaux",
    subskill: "Contextual tense",
    difficulty: 3,
    context: "MEMO — The west entrance is temporarily closed for maintenance. Work began on Monday and the maintenance crew expects to finish tomorrow.",
    prompt: "Until the work is complete, visitors ______ the east entrance.",
    options: options("used", "should use", "had used", "using"),
    correctOptionId: "B",
    targetTimeMs: 42_000
  },
  {
    id: "mini-p6-02",
    part: 6,
    skillId: "business_vocabulary",
    skillLabel: "Vocabulaire professionnel",
    subskill: "Customer communication",
    difficulty: 3,
    context: "Dear Ms. Howard, Thank you for your recent order. One item is currently unavailable, but a replacement model with identical features is in stock.",
    prompt: "Please let us know whether this ______ would be acceptable.",
    options: options("alternative", "attendance", "authority", "advertisement"),
    correctOptionId: "A",
    targetTimeMs: 40_000
  },
  {
    id: "mini-p6-03",
    part: 6,
    skillId: "grammar_prepositions",
    skillLabel: "Prépositions",
    subskill: "Business phrases",
    difficulty: 3,
    context: "The annual sales conference will take place in Lyon next month. Registration includes access to all workshops and a printed handbook.",
    prompt: "Participants are responsible ______ arranging their own transportation.",
    options: options("for", "with", "at", "from"),
    correctOptionId: "A",
    targetTimeMs: 38_000
  },
  {
    id: "mini-p6-04",
    part: 6,
    skillId: "reading_detail",
    skillLabel: "Compréhension des détails",
    subskill: "Sentence insertion",
    difficulty: 4,
    context: "NOTICE — The cafeteria will introduce a mobile payment system next week. Cash will still be accepted at one register. ______. Staff members can download the application from the company portal.",
    prompt: "Which sentence best completes the notice?",
    options: options(
      "The new system is intended to reduce waiting times.",
      "The cafeteria was built more than ten years ago.",
      "Several employees prefer working from home.",
      "The parking area closes at 9 p.m."
    ),
    correctOptionId: "A",
    targetTimeMs: 55_000
  },
  {
    id: "mini-p6-05",
    part: 6,
    skillId: "reading_inference",
    skillLabel: "Inférences",
    subskill: "Purpose",
    difficulty: 4,
    context: "To all warehouse staff: The inventory count scheduled for Thursday will begin at 6 a.m., two hours earlier than usual. Breakfast will be provided in the break room.",
    prompt: "Why is breakfast most likely being provided?",
    options: options(
      "Staff members must arrive earlier than normal.",
      "The break room is being renovated.",
      "The warehouse will close permanently.",
      "A new restaurant has opened nearby."
    ),
    correctOptionId: "A",
    targetTimeMs: 55_000
  },
  {
    id: "mini-p7-01",
    part: 7,
    skillId: "reading_detail",
    skillLabel: "Compréhension des détails",
    subskill: "Dates",
    difficulty: 2,
    context: "TRAINING NOTICE — The spreadsheet workshop originally planned for August 4 has been moved to August 11. It will still take place in Room 204 from 2:00 to 4:00 p.m.",
    prompt: "When will the workshop now take place?",
    options: options("August 4", "August 11", "August 14", "August 20"),
    correctOptionId: "B",
    targetTimeMs: 48_000
  },
  {
    id: "mini-p7-02",
    part: 7,
    skillId: "reading_detail",
    skillLabel: "Compréhension des détails",
    subskill: "Locations",
    difficulty: 2,
    context: "The reception desk has temporarily moved from the main lobby to the second-floor conference area while the ground floor is being repainted.",
    prompt: "Where is the reception desk currently located?",
    options: options("In the main lobby", "On the second floor", "Near the parking garage", "In the cafeteria"),
    correctOptionId: "B",
    targetTimeMs: 45_000
  },
  {
    id: "mini-p7-03",
    part: 7,
    skillId: "reading_inference",
    skillLabel: "Inférences",
    subskill: "Implied action",
    difficulty: 3,
    context: "Message from Daniel: I have attached the revised presentation. The figures on slides 8 and 9 now match the finance report. Could you review the final slide before I send the file to the client?",
    prompt: "What is the recipient most likely expected to do?",
    options: options("Contact the finance department", "Check part of the presentation", "Meet the client immediately", "Replace slides 8 and 9"),
    correctOptionId: "B",
    targetTimeMs: 58_000
  },
  {
    id: "mini-p7-04",
    part: 7,
    skillId: "reading_inference",
    skillLabel: "Inférences",
    subskill: "Reasoning",
    difficulty: 3,
    context: "HOTEL REVIEW — The rooms were quiet and the staff was helpful. However, the restaurant stopped serving dinner at 8 p.m., which was inconvenient after our late flight.",
    prompt: "What would the reviewer probably recommend to late-arriving guests?",
    options: options("Request a quieter room", "Eat before reaching the hotel", "Avoid speaking with staff", "Book a morning flight only"),
    correctOptionId: "B",
    targetTimeMs: 58_000
  },
  {
    id: "mini-p7-05",
    part: 7,
    skillId: "reading_detail",
    skillLabel: "Compréhension des détails",
    subskill: "Conditions",
    difficulty: 3,
    context: "RETURN POLICY — Unused products may be returned within 30 days with the original receipt. Customized items and downloadable software are not eligible for a refund.",
    prompt: "Which item cannot be refunded?",
    options: options("An unused lamp", "A customized notebook", "A sealed keyboard", "An unopened calculator"),
    correctOptionId: "B",
    targetTimeMs: 52_000
  },
  {
    id: "mini-p7-06",
    part: 7,
    skillId: "reading_detail",
    skillLabel: "Compréhension des détails",
    subskill: "Schedules",
    difficulty: 3,
    context: "BUS SCHEDULE — Route 18 leaves Central Station every 20 minutes until 7 p.m. After 7 p.m., service operates once per hour until 11 p.m.",
    prompt: "How often does Route 18 operate at 8 p.m.?",
    options: options("Every 10 minutes", "Every 20 minutes", "Every 30 minutes", "Once per hour"),
    correctOptionId: "D",
    targetTimeMs: 52_000
  },
  {
    id: "mini-p7-07",
    part: 7,
    skillId: "reading_inference",
    skillLabel: "Inférences",
    subskill: "Audience",
    difficulty: 4,
    context: "Reminder: Before opening the laboratory each morning, verify that the ventilation monitor displays a green light and record the reading on the safety sheet beside the entrance.",
    prompt: "Who is this reminder most likely intended for?",
    options: options("Laboratory staff", "Restaurant customers", "Hotel guests", "Delivery drivers"),
    correctOptionId: "A",
    targetTimeMs: 60_000
  },
  {
    id: "mini-p7-08",
    part: 7,
    skillId: "reading_detail",
    skillLabel: "Compréhension des détails",
    subskill: "Product information",
    difficulty: 3,
    context: "The AeroDesk standing desk includes a five-year frame warranty and a two-year warranty on electronic components. Assembly service is available for an additional fee.",
    prompt: "How long are the electronic components covered?",
    options: options("One year", "Two years", "Five years", "For the lifetime of the product"),
    correctOptionId: "B",
    targetTimeMs: 50_000
  },
  {
    id: "mini-p7-09",
    part: 7,
    skillId: "reading_inference",
    skillLabel: "Inférences",
    subskill: "Next step",
    difficulty: 4,
    context: "Email: Your application for the supplier program has been reviewed. Before approval, we still need a copy of your current insurance certificate. Please upload it through the secure portal.",
    prompt: "What should the recipient do next?",
    options: options("Purchase new equipment", "Submit an additional document", "Cancel the application", "Call an insurance customer"),
    correctOptionId: "B",
    targetTimeMs: 58_000
  },
  {
    id: "mini-p7-10",
    part: 7,
    skillId: "reading_inference",
    skillLabel: "Inférences",
    subskill: "Problem identification",
    difficulty: 4,
    context: "Customer message: The package arrived on time, but the box contained two size-medium jackets instead of one medium and one large as listed on the invoice.",
    prompt: "What problem does the customer report?",
    options: options("A delayed delivery", "An incorrect quantity of sizes", "A damaged invoice", "A missing payment"),
    correctOptionId: "B",
    targetTimeMs: 58_000
  }
];

export function getPublicMiniExamQuestions(): PublicMiniExamQuestion[] {
  return questions.map(({ correctOptionId: _correct, targetTimeMs: _target, ...question }) => question);
}

export function evaluateMiniExam(answers: MiniExamAnswerInput[]) {
  const answerMap = new Map(answers.map((answer) => [answer.questionId, answer]));
  const reviewedAnswers = questions.map((question) => {
    const answer = answerMap.get(question.id);
    const selectedOptionId = answer?.selectedOptionId ?? "";
    return {
      questionId: question.id,
      part: question.part,
      skillId: question.skillId,
      skillLabel: question.skillLabel,
      difficulty: question.difficulty,
      targetTimeMs: question.targetTimeMs,
      selectedOptionId,
      correctOptionId: question.correctOptionId,
      isCorrect: selectedOptionId === question.correctOptionId,
      responseTimeMs: Math.max(0, Number(answer?.responseTimeMs ?? 0))
    };
  });

  const correctAnswers = reviewedAnswers.filter((answer) => answer.isCorrect).length;
  const sectionMap = new Map<number, { part: number; correct: number; total: number }>();
  for (const answer of reviewedAnswers) {
    const section = sectionMap.get(answer.part) ?? { part: answer.part, correct: 0, total: 0 };
    section.total += 1;
    if (answer.isCorrect) section.correct += 1;
    sectionMap.set(answer.part, section);
  }

  return {
    correctAnswers,
    totalQuestions: questions.length,
    reviewedAnswers,
    sectionBreakdown: [...sectionMap.values()].map((section) => ({
      ...section,
      accuracy: Math.round((section.correct / section.total) * 100)
    }))
  };
}
