import { access, readFile } from "node:fs/promises";

const errors = [];
const requiredFiles = [
  "app/demo/page.tsx",
  "app/feedback/page.tsx",
  "app/lessons/page.tsx",
  "app/lessons/[slug]/page.tsx",
  "app/admin/beta/page.tsx",
  "app/api/events/route.ts",
  "app/api/waitlist/route.ts",
  "app/api/feedback/route.ts",
  "supabase/migrations/20260720120000_public_beta_validation.sql"
];

for (const path of requiredFiles) {
  try { await access(new URL(`../${path}`, import.meta.url)); }
  catch { errors.push(`Fichier bêta absent : ${path}`); }
}

const demo = await readFile(new URL("../lib/demo-bank.ts", import.meta.url), "utf8");
const demoIds = demo.match(/id: "demo-[^"]+"/g) ?? [];
if (demoIds.length !== 8) errors.push(`La démonstration contient ${demoIds.length} questions au lieu de 8.`);
if (!demo.includes('section: "Reading"') || !demo.includes('section: "Listening"')) errors.push("La démonstration doit couvrir Reading et Listening.");
if (!demo.includes("images.pexels.com")) errors.push("La démonstration Listening doit inclure une vraie photographie sous licence.");

const lessons = await readFile(new URL("../lib/lessons.ts", import.meta.url), "utf8");
const lessonSlugs = lessons.match(/slug: "[^"]+"/g) ?? [];
if (lessonSlugs.length < 12) errors.push(`Seulement ${lessonSlugs.length} fiches pédagogiques ont été trouvées.`);
for (const category of ["Grammaire", "Vocabulaire", "Stratégie Reading", "Stratégie Listening"]) {
  if (!lessons.includes(`category: "${category}"`)) errors.push(`Catégorie de fiche absente : ${category}`);
}

const checkout = await readFile(new URL("../app/api/billing/checkout/route.ts", import.meta.url), "utf8");
if (!checkout.includes("betaModeEnabled")) errors.push("Le Checkout n’est pas bloqué par le mode bêta.");
if (!checkout.includes("payment=beta")) errors.push("Le retour utilisateur du blocage bêta manque.");

const pricing = await readFile(new URL("../app/pricing/page.tsx", import.meta.url), "utf8");
if (!pricing.includes("WaitlistForm")) errors.push("La page tarifaire ne propose pas de liste d’attente.");
if (!pricing.includes("Aucun moyen de paiement")) errors.push("La page tarifaire ne clarifie pas l’absence de paiement en bêta.");

const migration = await readFile(new URL("../supabase/migrations/20260720120000_public_beta_validation.sql", import.meta.url), "utf8");
for (const table of ["product_events", "premium_waitlist", "beta_feedback"]) {
  if (!migration.includes(`public.${table}`)) errors.push(`Table bêta absente de la migration : ${table}`);
}

const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
if (!layout.includes("ProductAnalytics")) errors.push("La mesure interne du tunnel n’est pas montée dans le layout.");
if (!layout.includes("beta-ribbon")) errors.push("Le bandeau de transparence de la bêta manque.");

if (errors.length > 0) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(`Bêta validée : ${demoIds.length} questions publiques, ${lessonSlugs.length} fiches, liste d’attente, retours et mesure interne.`);
