import fs from "node:fs";

function read(path) {
  if (!fs.existsSync(path)) throw new Error(`Missing required file: ${path}`);
  return fs.readFileSync(path, "utf8");
}

const requiredFiles = [
  "app/coach/page.tsx",
  "components/coach-90-client.tsx",
  "app/api/coach/plan/route.ts",
  "app/api/coach/explain/route.ts",
  "lib/openai.ts",
  "lib/coach.ts",
  "lib/randomization.ts",
  "supabase/migrations/20260722190000_coach_90_ai_and_launch_legal.sql"
];
for (const file of requiredFiles) read(file);

const pricing = read("app/pricing/page.tsx");
for (const value of ["Sprint 30", "9,90 €", "Coach 90", "24,90 €", "10 crédits IA"]) {
  if (!pricing.includes(value)) throw new Error(`Pricing is missing: ${value}`);
}

const openai = read("lib/openai.ts");
for (const value of ["https://api.openai.com/v1/responses", "store: false", "json_schema", "X-Client-Request-Id"]) {
  if (!openai.includes(value)) throw new Error(`OpenAI client is missing safeguard: ${value}`);
}
if (openai.includes("NEXT_PUBLIC_OPENAI")) throw new Error("The OpenAI API key must never be public.");

const migration = read("supabase/migrations/20260722190000_coach_90_ai_and_launch_legal.sql");
for (const value of ["ai_coach_usage", "ai_coach_plans", "consume_ai_coach_credit", "refund_ai_coach_credit", "enable row level security"]) {
  if (!migration.includes(value)) throw new Error(`Coach migration is missing: ${value}`);
}

const randomizedPages = [
  "app/demo/page.tsx",
  "app/diagnostic/page.tsx",
  "app/practice/page.tsx",
  "app/listening/page.tsx",
  "app/mock-exam/page.tsx"
];
for (const path of randomizedPages) {
  const content = read(path);
  if (!content.includes("randomUUID") && !content.includes("seededShuffle")) throw new Error(`${path} is not randomized.`);
}

const legal = read("lib/legal.ts");
for (const value of ["LEGAL_SIREN", "LEGAL_SIRET", "LEGAL_PHONE", "LEGAL_MEDIATOR_ADDRESS"]) {
  if (!legal.includes(value)) throw new Error(`Legal config is missing: ${value}`);
}

const privacy = read("app/privacy/page.tsx");
for (const value of ["OpenAI", "store: false", "ne sont pas utilisés par défaut pour entraîner"]) {
  if (!privacy.includes(value)) throw new Error(`Privacy disclosure is missing: ${value}`);
}

console.log("Coach 90, legal launch variables and randomized question flows validated.");
