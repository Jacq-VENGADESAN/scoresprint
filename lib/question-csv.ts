import { parseManagedQuestionInput, type ManagedQuestionInput } from "@/lib/admin-question";

export const QUESTION_CSV_HEADERS = [
  "code",
  "part",
  "skill_id",
  "subskill",
  "difficulty",
  "target_time_seconds",
  "prompt",
  "context",
  "option_a",
  "feedback_a",
  "option_b",
  "feedback_b",
  "option_c",
  "feedback_c",
  "option_d",
  "feedback_d",
  "correct_option",
  "explanation",
  "trap",
  "status"
] as const;

export type QuestionCsvPreviewRow = {
  rowNumber: number;
  input: ManagedQuestionInput | null;
  errors: string[];
};

export type QuestionCsvParseResult = {
  rows: QuestionCsvPreviewRow[];
  fatalErrors: string[];
};

function parseCsvRecords(text: string) {
  const records: string[][] = [];
  let record: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const next = text[index + 1];

    if (quoted) {
      if (character === '"' && next === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
      continue;
    }

    if (character === '"') {
      quoted = true;
    } else if (character === ",") {
      record.push(field);
      field = "";
    } else if (character === "\n") {
      record.push(field.replace(/\r$/, ""));
      records.push(record);
      record = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (quoted) throw new Error("Le fichier contient une cellule entre guillemets non refermée.");
  if (field.length > 0 || record.length > 0) {
    record.push(field.replace(/\r$/, ""));
    records.push(record);
  }
  return records;
}

function value(record: string[], indexByHeader: Map<string, number>, header: string) {
  const index = indexByHeader.get(header);
  return index === undefined ? "" : (record[index] ?? "").trim();
}

export function parseQuestionCsv(text: string): QuestionCsvParseResult {
  const cleaned = text.replace(/^\uFEFF/, "");
  let records: string[][];
  try {
    records = parseCsvRecords(cleaned);
  } catch (error) {
    return { rows: [], fatalErrors: [error instanceof Error ? error.message : "Le CSV est illisible."] };
  }

  if (records.length < 2) {
    return { rows: [], fatalErrors: ["Le fichier doit contenir une ligne d’en-tête et au moins une question."] };
  }

  const headers = records[0].map((header) => header.trim().toLowerCase());
  const indexByHeader = new Map(headers.map((header, index) => [header, index]));
  const missingHeaders = QUESTION_CSV_HEADERS.filter((header) => !indexByHeader.has(header));
  if (missingHeaders.length > 0) {
    return { rows: [], fatalErrors: [`Colonnes manquantes : ${missingHeaders.join(", ")}.`] };
  }

  const rows = records.slice(1)
    .map((record, index): QuestionCsvPreviewRow | null => {
      if (record.every((cell) => !cell.trim())) return null;
      const correctOption = value(record, indexByHeader, "correct_option").toUpperCase();
      const candidate = {
        code: value(record, indexByHeader, "code"),
        part: Number(value(record, indexByHeader, "part")),
        skillId: value(record, indexByHeader, "skill_id"),
        subskill: value(record, indexByHeader, "subskill"),
        difficulty: Number(value(record, indexByHeader, "difficulty")),
        targetTimeSeconds: Number(value(record, indexByHeader, "target_time_seconds")),
        prompt: value(record, indexByHeader, "prompt"),
        context: value(record, indexByHeader, "context"),
        explanation: value(record, indexByHeader, "explanation"),
        trap: value(record, indexByHeader, "trap"),
        status: value(record, indexByHeader, "status") || "draft",
        options: (["A", "B", "C", "D"] as const).map((key) => ({
          key,
          text: value(record, indexByHeader, `option_${key.toLowerCase()}`),
          feedback: value(record, indexByHeader, `feedback_${key.toLowerCase()}`),
          isCorrect: correctOption === key
        }))
      };

      try {
        return { rowNumber: index + 2, input: parseManagedQuestionInput(candidate), errors: [] };
      } catch (error) {
        return {
          rowNumber: index + 2,
          input: null,
          errors: [error instanceof Error ? error.message : "Ligne invalide."]
        };
      }
    })
    .filter((row): row is QuestionCsvPreviewRow => Boolean(row));

  const rowsByCode = new Map<string, QuestionCsvPreviewRow[]>();
  for (const row of rows) {
    if (!row.input) continue;
    const duplicates = rowsByCode.get(row.input.code) ?? [];
    duplicates.push(row);
    rowsByCode.set(row.input.code, duplicates);
  }
  for (const [code, duplicates] of rowsByCode) {
    if (duplicates.length < 2) continue;
    for (const row of duplicates) row.errors.push(`Le code ${code} apparaît plusieurs fois dans le fichier.`);
  }

  return { rows, fatalErrors: [] };
}

function csvCell(value: string | number) {
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function buildQuestionCsvTemplate() {
  const example = [
    "part5-deadline-001",
    5,
    "grammar_prepositions",
    "Date limite",
    1,
    25,
    "Please submit the signed form ______ Friday.",
    "",
    "by",
    "By indique une échéance.",
    "during",
    "During signifie pendant une période.",
    "since",
    "Since indique un point de départ.",
    "among",
    "Among signifie parmi.",
    "A",
    "By Friday signifie au plus tard vendredi.",
    "Ne confonds pas une échéance avec une durée.",
    "draft"
  ];
  return `${QUESTION_CSV_HEADERS.join(",")}\n${example.map(csvCell).join(",")}\n`;
}
