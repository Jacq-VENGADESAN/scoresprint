import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../lib/listening-bank.ts", import.meta.url), "utf8");
const part1Count = source.split('p1("listen-p1-').length - 1;
const part2Count = source.split('p2("listen-p2-').length - 1;
const idMatches = source.match(/listen-p[12]-[0-9]{3}/g) ?? [];
const uniqueIds = new Set(idMatches);
const errors = [];

if (part1Count !== 10) errors.push(`Partie 1 : ${part1Count} questions au lieu de 10.`);
if (part2Count !== 20) errors.push(`Partie 2 : ${part2Count} questions au lieu de 20.`);
if (uniqueIds.size !== 30) errors.push("Les 30 codes Listening ne sont pas tous uniques.");
if (!source.includes("listening_photographs")) errors.push("La compétence Photographies manque.");
if (!source.includes("listening_question_response")) errors.push("La compétence Questions-réponses manque.");

if (errors.length > 0) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(`Listening validé : ${part1Count} questions Partie 1 et ${part2Count} questions Partie 2.`);
