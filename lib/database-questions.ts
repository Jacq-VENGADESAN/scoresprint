import { supabaseAdminRest } from "@/lib/supabase-admin";
import type { PracticeOptionId, PublicPracticeQuestion } from "@/lib/practice-bank";

export type ManagedQuestionStatus = "draft" | "auto_reviewed" | "human_reviewed" | "published" | "rejected";

type QuestionOptionRow = {
  id: string;
  option_key: string;
  option_text: string;
  is_correct: boolean;
  feedback: string | null;
};

type SkillRelation = { label: string } | Array<{ label: string }> | null;

export type ManagedQuestionRow = {
  id: string;
  code: string | null;
  part: number;
  skill_id: string;
  subskill: string;
  difficulty: number;
  prompt: string;
  context: string | null;
  explanation: string;
  trap: string | null;
  target_time_ms: number;
  status: ManagedQuestionStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  skills: SkillRelation;
  question_options: QuestionOptionRow[];
};

export type ManagedQuestion = {
  id: string;
  databaseId: string;
  part: number;
  skillId: string;
  skillLabel: string;
  subskill: string;
  difficulty: number;
  targetTimeMs: number;
  prompt: string;
  context?: string;
  options: Array<{ id: PracticeOptionId; text: string }>;
  correctOptionId: PracticeOptionId;
  explanation: string;
  trap: string;
  optionFeedback: Record<PracticeOptionId, string>;
};

const OPTION_IDS: PracticeOptionId[] = ["A", "B", "C", "D"];

function skillLabel(relation: SkillRelation, fallback: string) {
  if (Array.isArray(relation)) return relation[0]?.label ?? fallback;
  return relation?.label ?? fallback;
}

function asOptionId(value: string): PracticeOptionId | null {
  return OPTION_IDS.includes(value as PracticeOptionId) ? value as PracticeOptionId : null;
}

function normalizeQuestion(row: ManagedQuestionRow): ManagedQuestion | null {
  if (!row.code) return null;
  const options = [...(row.question_options ?? [])]
    .map((option) => ({ ...option, key: asOptionId(option.option_key) }))
    .filter((option): option is QuestionOptionRow & { key: PracticeOptionId } => Boolean(option.key))
    .sort((a, b) => OPTION_IDS.indexOf(a.key) - OPTION_IDS.indexOf(b.key));
  if (options.length !== 4) return null;
  const correct = options.find((option) => option.is_correct);
  if (!correct) return null;
  const feedback = Object.fromEntries(
    options.map((option) => [option.key, option.feedback ?? (option.is_correct ? "Cette réponse est correcte." : "Cette option ne correspond pas à la règle attendue.")])
  ) as Record<PracticeOptionId, string>;
  return {
    id: row.code,
    databaseId: row.id,
    part: row.part,
    skillId: row.skill_id,
    skillLabel: skillLabel(row.skills, row.skill_id),
    subskill: row.subskill,
    difficulty: row.difficulty,
    targetTimeMs: row.target_time_ms,
    prompt: row.prompt,
    context: row.context ?? undefined,
    options: options.map((option) => ({ id: option.key, text: option.option_text })),
    correctOptionId: correct.key,
    explanation: row.explanation,
    trap: row.trap ?? "Relis toute la phrase et vérifie le sens avant de choisir.",
    optionFeedback: feedback
  };
}

function publicQuestion(question: ManagedQuestion): PublicPracticeQuestion {
  return {
    id: question.id,
    part: question.part,
    skillId: question.skillId,
    skillLabel: question.skillLabel,
    subskill: question.subskill,
    difficulty: question.difficulty,
    targetTimeMs: question.targetTimeMs,
    prompt: question.prompt,
    context: question.context,
    options: question.options
  };
}

const SELECT = "id,code,part,skill_id,subskill,difficulty,prompt,context,explanation,trap,target_time_ms,status,published_at,created_at,updated_at,skills(label),question_options(id,option_key,option_text,is_correct,feedback)";

export async function getPublishedDatabaseQuestions() {
  const rows = await supabaseAdminRest<ManagedQuestionRow[]>(
    `questions?select=${SELECT}&status=eq.published&code=not.is.null&order=published_at.desc.nullslast`
  );
  return rows.map(normalizeQuestion).filter((question): question is ManagedQuestion => Boolean(question));
}

export async function getPublicPublishedDatabaseQuestions() {
  return (await getPublishedDatabaseQuestions()).map(publicQuestion);
}

export async function getManagedQuestions() {
  return supabaseAdminRest<ManagedQuestionRow[]>(
    `questions?select=${SELECT}&code=not.is.null&order=updated_at.desc`
  );
}

export async function getManagedQuestionById(id: string) {
  const rows = await supabaseAdminRest<ManagedQuestionRow[]>(
    `questions?select=${SELECT}&id=eq.${encodeURIComponent(id)}&limit=1`
  );
  return rows[0] ?? null;
}

export async function evaluateDatabasePracticeAnswer(questionCode: string, selectedOptionId: string) {
  const selected = asOptionId(selectedOptionId);
  if (!selected) return null;
  const rows = await supabaseAdminRest<ManagedQuestionRow[]>(
    `questions?select=${SELECT}&code=eq.${encodeURIComponent(questionCode)}&status=eq.published&limit=1`
  );
  const question = rows[0] ? normalizeQuestion(rows[0]) : null;
  if (!question) return null;
  return {
    question,
    isCorrect: selected === question.correctOptionId,
    selectedOptionId: selected,
    selectedFeedback: question.optionFeedback[selected]
  };
}

export async function getDatabaseQuestionReview(questionCode: string, selectedOptionId: string) {
  return evaluateDatabasePracticeAnswer(questionCode, selectedOptionId);
}