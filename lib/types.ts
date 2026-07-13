export type Difficulty = "Débutant" | "Intermédiaire" | "Avancé";

export type QuestionOption = {
  id: string;
  text: string;
};

export type PracticeQuestion = {
  id: string;
  part: number;
  skill: string;
  subskill: string;
  difficulty: Difficulty;
  prompt: string;
  options: QuestionOption[];
  correctOptionId: string;
  explanation: string;
  trap: string;
};

export type SkillMastery = {
  skillId: string;
  mastery: number;
  examWeight: number;
  lastReviewedAt?: string;
  repeatedErrors: number;
};

export type SessionBlock = {
  skillId: string;
  minutes: number;
  reason: string;
};
