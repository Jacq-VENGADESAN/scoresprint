export type PracticeAnswerResultDraft = {
  isCorrect: boolean;
  correctOptionId: string;
  explanation: string;
  trap: string;
  selectedFeedback: string;
  masteryBefore: number;
  masteryAfter: number;
  confidence: string;
  evidenceCount: number;
  nextReviewAt: string | null;
  resolved: boolean;
};

export type PracticeCompletedAnswerDraft = {
  isCorrect: boolean;
  skillLabel: string;
};

export type PracticeDraftState = {
  version: 1;
  mode: "adaptive" | "review";
  questionIds: string[];
  index: number;
  selected: string | null;
  result: PracticeAnswerResultDraft | null;
  completed: PracticeCompletedAnswerDraft[];
  sessionId: string | null;
  startedAt: string;
  questionStartedAt: string;
  elapsedMs: number;
  questionElapsedMs: number;
};

export type MiniExamDraftState = {
  version: 1;
  questionIds: string[];
  index: number;
  selected: string | null;
  answers: Record<string, string>;
  timings: Record<string, number>;
  startedAt: string;
  questionStartedAt: string;
};

export type SessionDraftRow<T> = {
  payload: T;
  started_at: string;
  expires_at: string;
  updated_at: string;
};
