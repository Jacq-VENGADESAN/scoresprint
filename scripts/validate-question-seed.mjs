import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const seedDir = join(process.cwd(), "content", "question-seed");
const files = readdirSync(seedDir)
  .filter((name) => /^part[567]-\d{3}-\d{3}\.json$/.test(name))
  .sort();

if (files.length !== 8) {
  throw new Error(`Expected 8 curated question files, found ${files.length}.`);
}

const allowedSkills = new Set([
  "grammar_tenses",
  "grammar_prepositions",
  "grammar_structure",
  "business_vocabulary",
  "reading_details",
  "reading_inference"
]);
const optionIds = ["A", "B", "C", "D"];
const questions = [];

for (const file of files) {
  const part = Number(file.match(/^part([567])-/)?.[1]);
  const payload = JSON.parse(readFileSync(join(seedDir, file), "utf8"));
  if (!Array.isArray(payload) || payload.length === 0) throw new Error(`${file}: empty payload.`);

  if (part === 5) {
    for (const item of payload) questions.push({ ...item, part, context: "", sourceFile: file });
  } else {
    for (const group of payload) {
      if (typeof group.context !== "string" || !group.context.trim()) throw new Error(`${file}: empty reading context.`);
      if (!Array.isArray(group.items) || group.items.length === 0) throw new Error(`${file}: empty reading group.`);
      for (const item of group.items) questions.push({ ...item, part, context: group.context, sourceFile: file });
    }
  }
}

const codes = new Set();
const promptKeys = new Set();
const partCounts = new Map();

for (const question of questions) {
  const prefix = `${question.sourceFile}:${question.code ?? "unknown"}`;
  if (!/^[a-z0-9][a-z0-9-]{2,79}$/.test(question.code)) throw new Error(`${prefix}: invalid code.`);
  if (codes.has(question.code)) throw new Error(`${prefix}: duplicate code.`);
  codes.add(question.code);

  if (![5, 6, 7].includes(question.part)) throw new Error(`${prefix}: invalid part.`);
  partCounts.set(question.part, (partCounts.get(question.part) ?? 0) + 1);
  if (!allowedSkills.has(question.skill)) throw new Error(`${prefix}: invalid skill.`);
  if (!Number.isInteger(question.difficulty) || question.difficulty < 1 || question.difficulty > 5) {
    throw new Error(`${prefix}: invalid difficulty.`);
  }
  if (!Number.isFinite(question.target) || question.target < 5 || question.target > 600) {
    throw new Error(`${prefix}: invalid target time.`);
  }

  for (const field of ["subskill", "prompt", "explanation", "trap"]) {
    if (typeof question[field] !== "string" || !question[field].trim()) throw new Error(`${prefix}: missing ${field}.`);
  }
  if ((question.part === 6 || question.part === 7) && !question.context.trim()) {
    throw new Error(`${prefix}: reading questions require context.`);
  }

  if (!Array.isArray(question.options) || question.options.length !== 4) throw new Error(`${prefix}: four options required.`);
  if (question.options.some((option) => typeof option !== "string" || !option.trim())) {
    throw new Error(`${prefix}: option text is required.`);
  }
  if (new Set(question.options.map((option) => option.trim().toLowerCase())).size !== 4) {
    throw new Error(`${prefix}: option texts must be distinct.`);
  }
  if (!optionIds.includes(question.correct)) throw new Error(`${prefix}: correct option must be A, B, C or D.`);

  const serialized = JSON.stringify(question);
  if (serialized.includes("Ã") || serialized.includes("�")) throw new Error(`${prefix}: mojibake detected.`);
  const promptKey = `${question.part}\u0000${question.context.trim()}\u0000${question.prompt.trim()}`.toLowerCase();
  if (promptKeys.has(promptKey)) throw new Error(`${prefix}: duplicate prompt and context.`);
  promptKeys.add(promptKey);
}

const expected = new Map([[5, 80], [6, 50], [7, 70]]);
if (questions.length !== 200) throw new Error(`Expected 200 questions, found ${questions.length}.`);
for (const [part, count] of expected) {
  if (partCounts.get(part) !== count) throw new Error(`Part ${part}: expected ${count}, found ${partCounts.get(part) ?? 0}.`);
}

console.log(`Validated ${questions.length} original questions: Part 5=${partCounts.get(5)}, Part 6=${partCounts.get(6)}, Part 7=${partCounts.get(7)}.`);
