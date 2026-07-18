export const BRAND_NAME = "Aptileo";
export const BRAND_TAGLINE = "L’anglais professionnel, travaillé avec méthode.";
export const BRAND_DESCRIPTION = "Une préparation adaptative à l’anglais professionnel qui transforme les erreurs en séances ciblées.";

export function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://aptileo.fr").replace(/\/$/, "");
}

export const independentExamDisclaimer =
  "TOEIC® est une marque déposée d’ETS. Aptileo est une plateforme indépendante, non affiliée, non approuvée et non sponsorisée par ETS. Les exercices sont originaux et les scores affichés sont des estimations internes.";
