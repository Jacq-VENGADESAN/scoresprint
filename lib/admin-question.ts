import type { ManagedQuestionStatus } from "@/lib/database-questions";
import type { PracticeOptionId } from "@/lib/practice-bank";

export const MANAGED_SKILLS = [
  { id: "grammar_tenses", label: "Temps verbaux" },
  { id: "grammar_prepositions", label: "Prépositions" },
  { id: "grammar_structure", label: "Structure grammaticale" },
  { id: "business_vocabulary", label: "Vocabulaire professionnel" },
  { id: "reading_details", label: "Compréhension des détails" },
  { id: "reading_inference", label: "Inférences" }
] as const;

export const MANAGED_STATUSES: Array<{ id: ManagedQuestionStatus; label: string }> = [
  { id: "draft", label: "Brouillon" },
  { id: "human_reviewed", label: "Relue" },
  { id: "published", label: "Publiée" },
  { id: "rejected", label: "Archivée" }
];

export type ManagedOptionInput = {
  key: PracticeOptionId;
  text: string;
  feedback: string;
  isCorrect: boolean;
};

export type ManagedQuestionInput = {
  id?: string | null;
  code: string;
  part: number;
  skillId: string;
  subskill: string;
  difficulty: number;
  targetTimeSeconds: number;
  prompt: string;
  context: string;
  explanation: string;
  trap: string;
  status: ManagedQuestionStatus;
  options: ManagedOptionInput[];
};

const OPTION_IDS: PracticeOptionId[] = ["A", "B", "C", "D"];
const STATUS_IDS = new Set(MANAGED_STATUSES.map((status) => status.id));
const SKILL_IDS = new Set(MANAGED_SKILLS.map((skill) => skill.id));

function stringValue(value: unknown, max = 5000) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function parseManagedQuestionInput(value: unknown): ManagedQuestionInput {
  if (!value || typeof value !== "object") throw new Error("INVALID_BODY");
  const body = value as Record<string, unknown>;
  const code = stringValue(body.code, 80).toLowerCase();
  const part = Number(body.part);
  const skillId = stringValue(body.skillId, 80);
  const subskill = stringValue(body.subskill, 160);
  const difficulty = Number(body.difficulty);
  const targetTimeSeconds = Number(body.targetTimeSeconds);
  const prompt = stringValue(body.prompt, 5000);
  const context = stringValue(body.context, 10000);
  const explanation = stringValue(body.explanation, 8000);
  const trap = stringValue(body.trap, 4000);
  const status = stringValue(body.status, 40) as ManagedQuestionStatus;
  const rawOptions = Array.isArray(body.options) ? body.options : [];
  const options = rawOptions.map((option, index): ManagedOptionInput => {
    const row = option && typeof option === "object" ? option as Record<string, unknown> : {};
    return {
      key: OPTION_IDS[index] ?? "A",
      text: stringValue(row.text, 1000),
      feedback: stringValue(row.feedback, 3000),
      isCorrect: Boolean(row.isCorrect)
    };
  });

  if (!/^[a-z0-9][a-z0-9-]{2,79}$/.test(code)) throw new Error("Le code doit contenir uniquement des minuscules, chiffres et tirets.");
  if (![5, 6, 7].includes(part)) throw new Error("La partie doit être 5, 6 ou 7.");
  if (!SKILL_IDS.has(skillId as (typeof MANAGED_SKILLS)[number]["id"])) throw new Error("Compétence inconnue.");
  if (!subskill || !prompt || !explanation) throw new Error("Sous-compétence, énoncé et explication sont obligatoires.");
  if (!Number.isInteger(difficulty) || difficulty < 1 || difficulty > 5) throw new Error("La difficulté doit être comprise entre 1 et 5.");
  if (!Number.isFinite(targetTimeSeconds) || targetTimeSeconds < 5 || targetTimeSeconds > 600) throw new Error("Le temps cible doit être compris entre 5 et 600 secondes.");
  if (!STATUS_IDS.has(status)) throw new Error("Statut inconnu.");
  if (options.length !== 4 || options.some((option) => !option.text)) throw new Error("Quatre réponses non vides sont obligatoires.");
  if (options.filter((option) => option.isCorrect).length !== 1) throw new Error("Une seule réponse doit être correcte.");

  return {
    id: stringValue(body.id, 80) || null,
    code,
    part,
    skillId,
    subskill,
    difficulty,
    targetTimeSeconds,
    prompt,
    context,
    explanation,
    trap,
    status,
    options
  };
}