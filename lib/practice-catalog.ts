import {
  buildPracticeSession as buildBasePracticeSession,
  evaluatePracticeAnswer as evaluateBasePracticeAnswer,
  hasPracticeQuestion as hasBasePracticeQuestion,
  type PracticeOptionId,
  type PracticePriority,
  type PublicPracticeQuestion
} from "@/lib/practice-bank";
import { extraPracticeQuestions } from "@/lib/practice-bank-extra";

const extraById = new Map(extraPracticeQuestions.map((question) => [question.id, question]));

function publicQuestion(question: (typeof extraPracticeQuestions)[number]): PublicPracticeQuestion {
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
  seed: string,
  excludedQuestionCodes: string[] = []
): PublicPracticeQuestion[] {
  const wanted = Math.max(1, Math.min(count, 50));
  const dueSet = new Set(dueQuestionCodes);
  const excludedSet = new Set(excludedQuestionCodes.filter((code) => !dueSet.has(code)));
  const basePool = buildBasePracticeSession(priorities, dueQuestionCodes, 18, `${seed}-base`);
  const extraPool = extraPracticeQuestions.map(publicQuestion);
  const allQuestions = [...basePool, ...extraPool];
  const unique = new Map(allQuestions.map((question) => [question.id, question]));
  const priorityRank = new Map(
    [...priorities]
      .sort((a, b) => a.mastery - b.mastery)
      .map((priority, index) => [priority.skillId, index])
  );

  const due = dueQuestionCodes
    .map((code) => unique.get(code))
    .filter((question): question is PublicPracticeQuestion => Boolean(question));

  const candidates = [...unique.values()]
    .filter((question) => !dueSet.has(question.id) && !excludedSet.has(question.id))
    .sort((a, b) => {
      const rankDifference = (priorityRank.get(a.skillId) ?? 99) - (priorityRank.get(b.skillId) ?? 99);
      if (rankDifference !== 0) return rankDifference;
      return hash(`${seed}-${a.id}`) - hash(`${seed}-${b.id}`);
    });

  const selected: PublicPracticeQuestion[] = [];
  const selectedIds = new Set<string>();
  for (const question of [...due, ...candidates]) {
    if (selectedIds.has(question.id)) continue;
    selected.push(question);
    selectedIds.add(question.id);
    if (selected.length >= wanted) break;
  }

  if (selected.length < wanted) {
    const fallback = [...unique.values()]
      .filter((question) => !selectedIds.has(question.id))
      .sort((a, b) => hash(`${seed}-fallback-${a.id}`) - hash(`${seed}-fallback-${b.id}`));
    selected.push(...fallback.slice(0, wanted - selected.length));
  }

  return selected;
}

export function evaluatePracticeAnswer(questionId: string, selectedOptionId: string) {
  const extra = extraById.get(questionId);
  if (!extra) return evaluateBasePracticeAnswer(questionId, selectedOptionId);
  if (!["A", "B", "C", "D"].includes(selectedOptionId)) return null;
  const selected = selectedOptionId as PracticeOptionId;
  return {
    question: extra,
    isCorrect: selected === extra.correctOptionId,
    selectedOptionId: selected,
    selectedFeedback: extra.optionFeedback[selected]
  };
}

export function hasPracticeQuestion(questionId: string) {
  return extraById.has(questionId) || hasBasePracticeQuestion(questionId);
}

export function getPracticeQuestionReview(questionId: string, selectedOptionId: string) {
  return evaluatePracticeAnswer(questionId, selectedOptionId);
}

export const PRACTICE_QUESTION_COUNT = 50;
