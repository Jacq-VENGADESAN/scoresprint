import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const errors = [];

async function text(path) {
  return readFile(resolve(root, path), "utf8");
}

async function required(path) {
  try {
    await access(resolve(root, path));
  } catch {
    errors.push(`Fichier requis absent : ${path}`);
  }
}

const requiredRoutes = [
  "app/reading/page.tsx",
  "app/legal/page.tsx",
  "app/privacy/page.tsx",
  "app/terms/page.tsx",
  "app/refund-policy/page.tsx",
  "app/faq/page.tsx",
  "app/contact/page.tsx",
  "app/robots.ts",
  "app/sitemap.ts",
  "app/manifest.ts",
  "app/opengraph-image.tsx",
  "app/not-found.tsx",
  "app/error.tsx",
  "app/admin/launch/page.tsx",
  "supabase/migrations/20260718143000_production_rate_limits.sql"
];
await Promise.all(requiredRoutes.map(required));

const brand = await text("lib/brand.ts");
if (!brand.includes('BRAND_NAME = "Aptileo"')) errors.push("Le nom Aptileo n’est pas défini comme marque centrale.");

const navigation = await text("components/site-navigation.tsx");
if (!navigation.includes('{ label: "Reading", href: "/reading"')) errors.push("Reading n’est pas un onglet principal.");
if (!navigation.includes('{ label: "Listening", href: "/listening"')) errors.push("Listening n’est pas un onglet principal.");

const listening = await text("lib/listening-bank.ts");
const photoCalls = listening.split('p1("listen-p1-').length - 1;
if (photoCalls !== 10) errors.push(`Le Listening Partie 1 contient ${photoCalls} photos au lieu de 10.`);
if (!listening.includes("images.pexels.com")) errors.push("La banque Listening n’utilise pas de photographies Pexels.");
if (!listening.includes("Photo sous licence Pexels")) errors.push("Le crédit de licence des photographies manque.");

const scene = await text("components/listening-scene.tsx");
if (!scene.includes("<img")) errors.push("La Partie 1 n’affiche pas de photographies réelles.");
if (scene.includes("<svg") || scene.includes("function Person")) errors.push("Une ancienne illustration dessinée subsiste dans le composant Listening.");

const pricing = await text("app/pricing/page.tsx");
if (!pricing.includes('name="terms_accepted"')) errors.push("L’acceptation des conditions manque avant paiement.");
if (!pricing.includes('name="immediate_access"')) errors.push("La demande d’activation immédiate manque avant paiement.");

const checkout = await text("app/api/billing/checkout/route.ts");
if (!checkout.includes("legalCommerceIsConfigured")) errors.push("Stripe Live n’est pas bloqué lorsque les informations légales manquent.");
if (!checkout.includes("consumeRateLimit")) errors.push("La création de Checkout n’est pas limitée.");

const security = await text("next.config.ts");
for (const header of ["Content-Security-Policy", "Strict-Transport-Security", "X-Content-Type-Options", "Permissions-Policy"]) {
  if (!security.includes(header)) errors.push(`Header de sécurité absent : ${header}`);
}

const publicBrandFiles = [
  "app/page.tsx",
  "app/layout.tsx",
  "app/auth/page.tsx",
  "app/auth/forgot-password/page.tsx",
  "app/auth/check-email/page.tsx",
  "app/pricing/page.tsx",
  "components/header.tsx",
  "components/site-footer.tsx"
];
for (const path of publicBrandFiles) {
  const source = await text(path);
  if (source.includes("ScoreSprint")) errors.push(`Ancien nom encore visible dans ${path}.`);
}

if (errors.length > 0) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log("Pré-lancement validé : marque, navigation, photos, pages légales, consentement, sécurité et limitation API.");
