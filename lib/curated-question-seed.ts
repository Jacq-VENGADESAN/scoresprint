import "server-only";
import part5First from "@/content/question-seed/part5-001-040.json";
import part5Second from "@/content/question-seed/part5-041-080.json";
import part6First from "@/content/question-seed/part6-001-025.json";
import part6Second from "@/content/question-seed/part6-026-050.json";
import part7First from "@/content/question-seed/part7-001-020.json";
import part7Second from "@/content/question-seed/part7-021-035.json";
import part7Third from "@/content/question-seed/part7-036-055.json";
import part7Fourth from "@/content/question-seed/part7-056-070.json";
import type { ManagedOptionInput, ManagedQuestionInput } from "@/lib/admin-question";
import type { PracticeOptionId } from "@/lib/practice-bank";

type CompactQuestion = {
  code: string;
  skill: string;
  subskill: string;
  difficulty: number;
  target: number;
  prompt: string;
  options: string[];
  correct: string;
  explanation: string;
  trap: string;
};

type CompactGroup = {
  context: string;
  items: CompactQuestion[];
};

const OPTION_IDS: PracticeOptionId[] = ["A", "B", "C", "D"];

function expandQuestion(part: 5 | 6 | 7, item: CompactQuestion, context = ""): ManagedQuestionInput {
  const correct = item.correct as PracticeOptionId;
  const options: ManagedOptionInput[] = OPTION_IDS.map((key, index) => ({
    key,
    text: item.options[index] ?? "",
    isCorrect: key === correct,
    feedback: key === correct
      ? "Cette option correspond à la règle ou au détail demandé."
      : "Cette option ne correspond pas à la structure, au sens ou au document."
  }));

  return {
    code: item.code,
    part,
    skillId: item.skill,
    subskill: item.subskill,
    difficulty: item.difficulty,
    targetTimeSeconds: item.target,
    prompt: item.prompt,
    context,
    explanation: item.explanation,
    trap: item.trap,
    status: "published",
    options
  };
}

function expandGroups(part: 6 | 7, groups: CompactGroup[]) {
  return groups.flatMap((group) => group.items.map((item) => expandQuestion(part, item, group.context)));
}

const part5Items = [
  ...(part5First as unknown as CompactQuestion[]),
  ...(part5Second as unknown as CompactQuestion[])
].map((item) => expandQuestion(5, item));

const part6Items = expandGroups(6, [
  ...(part6First as unknown as CompactGroup[]),
  ...(part6Second as unknown as CompactGroup[])
]);

const part7Items = expandGroups(7, [
  ...(part7First as unknown as CompactGroup[]),
  ...(part7Second as unknown as CompactGroup[]),
  ...(part7Third as unknown as CompactGroup[]),
  ...(part7Fourth as unknown as CompactGroup[])
]);

export const CURATED_QUESTION_SEED: ManagedQuestionInput[] = [
  ...part5Items,
  ...part6Items,
  ...part7Items
];

export const CURATED_QUESTION_SEED_COUNTS = {
  total: CURATED_QUESTION_SEED.length,
  part5: part5Items.length,
  part6: part6Items.length,
  part7: part7Items.length
} as const;
