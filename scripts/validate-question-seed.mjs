import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const migrationsDir = join(process.cwd(), "supabase", "migrations");
const files = readdirSync(migrationsDir)
  .filter((name) => /^20260715163\d00_seed_part[567]_questions_.*\.sql$/.test(name))
  .sort();

if (files.length !== 5) {
  throw new Error(`Expected 5 curated seed migrations, found ${files.length}.`);
}

const questions = [];
for (const file of files) {
  const source = readFileSync(join(migrationsDir, file), "utf8");
  const match = source.match(/\$questions\$(\[[\s\S]*?\])\$questions\$/);
  if (!match) throw new Error(`${file}: embedded question payload not found.`);
  const batch = JSON.parse(match[1]);
  if (!Array.isArray(batch) || batch.length === 0) throw new Error(`${file}: empty payload.`);
  questions.push(...batch);
}

const allowedSkills = new Set([
  "grammar_tenses",
  "grammar_prepositions",
  "grammar_structure",
  "business_vocabulary",
  "reading_details",
  "reading_inference"
]);
const codes = new Set();
const documents = new Set();
const partCounts = new Map();

for (const question of questions) {
  const prefix = question?.code ?? "unknown";
  if (!/^[a-z0-9][a-z0-9-]{2,79}$/.test(question.code)) throw new Error(`${prefix}: invalid code.`);
  if (codes.has(question.code)) throw new Error(`${prefix}: duplicate code.`);
  codes.add(question.code);

  if (![5, 6, 7].includes(question.part)) throw new Error(`${prefix}: invalid part.`);
  partCounts.set(question.part, (partCounts.get(question.part) ?? 0) + 1);
  if (!allowedSkills.has(question.skillId)) throw new Error(`${prefix}: invalid skill.`);
  if (!Number.isInteger(question.difficulty) || question.difficulty < 1 || question.difficulty > 5) {
    throw new Error(`${prefix}: invalid difficulty.`);
  }
  if (!Number.isFinite(question.targetTimeSeconds) || question.targetTimeSeconds < 5 || question.targetTimeSeconds > 600) {
    throw new Error(`${prefix}: invalid target time.`);
  }
  if (question.status !== "published") throw new Error(`${prefix}: seed question must be published.`);

  for (const field of ["subskill", "prompt", "explanation", "trap"]) {
    if (typeof question[field] !== "string" || !question[field].trim()) throw new Error(`${prefix}: missing ${field}.`);
  }
  if ((question.part === 6 || question.part === 7) && !question.context?.trim()) {
    throw new Error(`${prefix}: reading questions require context.`);
  }

  if (!Array.isArray(question.options) || question.options.length !== 4) throw new Error(`${prefix}: four options required.`);
  const optionKeys = question.options.map((option) => option.key).join("");
  if (optionKeys !== "ABCD") throw new Error(`${prefix}: options must be ordered A-D.`);
  if (new Set(question.options.map((option) => option.text.trim())).size !== 4) {
    throw new Error(`${prefix}: option texts must be distinct.`);
  }
  if (question.options.filter((option) => option.isCorrect).length !== 1) {
    throw new Error(`${prefix}: exactly one correct option required.`);
  }
  if (question.options.some((option) => !option.text?.trim() || !option.feedback?.trim())) {
    throw new Error(`${prefix}: option text and feedback are required.`);
  }

  const serialized = JSON.stringify(question);
  if (serialized.includes("Ã") || serialized.includes("�")) throw new Error(`${prefix}: mojibake detected.`);
  const documentKey = `${question.part}\u0000${question.context ?? ""}\u0000${question.prompt}`;
  if (documents.has(documentKey)) throw new Error(`${prefix}: duplicate prompt and context.`);
  documents.add(documentKey);
}

const expected = new Map([[5, 80], [6, 50], [7, 70]]);
if (questions.length !== 200) throw new Error(`Expected 200 questions, found ${questions.length}.`);
for (const [part, count] of expected) {
  if (partCounts.get(part) !== count) throw new Error(`Part ${part}: expected ${count}, found ${partCounts.get(part) ?? 0}.`);
}

console.log(`Validated ${questions.length} original questions: Part 5=${partCounts.get(5)}, Part 6=${partCounts.get(6)}, Part 7=${partCounts.get(7)}.`);
