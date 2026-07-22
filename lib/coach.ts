import { COACH_90_DAILY_AI_LIMIT } from "@/lib/access";
import { supabaseRest } from "@/lib/supabase-server";

export type CoachPlanDay = {
  day: string;
  minutes: number;
  focus: string;
  activities: string[];
  successCheck: string;
};

export type CoachPlan = {
  headline: string;
  diagnosis: string;
  weeklyGoal: string;
  prioritySkills: Array<{ skill: string; reason: string }>;
  days: CoachPlanDay[];
  examStrategy: string;
  encouragement: string;
};

export type CoachExplanation = {
  title: string;
  simpleExplanation: string;
  whySelectedWasWrong: string;
  memoryTip: string;
  examples: Array<{ sentence: string; translation: string; note: string }>;
  nextAction: string;
};

export const COACH_PLAN_SCHEMA: Record<string, unknown> = {
  type: "object",
  additionalProperties: false,
  required: ["headline", "diagnosis", "weeklyGoal", "prioritySkills", "days", "examStrategy", "encouragement"],
  properties: {
    headline: { type: "string" },
    diagnosis: { type: "string" },
    weeklyGoal: { type: "string" },
    prioritySkills: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["skill", "reason"],
        properties: { skill: { type: "string" }, reason: { type: "string" } }
      }
    },
    days: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["day", "minutes", "focus", "activities", "successCheck"],
        properties: {
          day: { type: "string" },
          minutes: { type: "integer" },
          focus: { type: "string" },
          activities: { type: "array", items: { type: "string" } },
          successCheck: { type: "string" }
        }
      }
    },
    examStrategy: { type: "string" },
    encouragement: { type: "string" }
  }
};

export const COACH_EXPLANATION_SCHEMA: Record<string, unknown> = {
  type: "object",
  additionalProperties: false,
  required: ["title", "simpleExplanation", "whySelectedWasWrong", "memoryTip", "examples", "nextAction"],
  properties: {
    title: { type: "string" },
    simpleExplanation: { type: "string" },
    whySelectedWasWrong: { type: "string" },
    memoryTip: { type: "string" },
    examples: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["sentence", "translation", "note"],
        properties: {
          sentence: { type: "string" },
          translation: { type: "string" },
          note: { type: "string" }
        }
      }
    },
    nextAction: { type: "string" }
  }
};

type ConsumeCoachCreditRow = { allowed: boolean; usage_count: number; remaining: number };

export async function consumeCoachCredits(cost: number) {
  const normalizedCost = Math.max(1, Math.min(cost, 5));
  const rows = await supabaseRest<ConsumeCoachCreditRow[]>("rpc/consume_ai_coach_credit", {
    method: "POST",
    body: JSON.stringify({ p_limit: COACH_90_DAILY_AI_LIMIT, p_cost: normalizedCost })
  });
  return rows[0] ?? { allowed: false, usage_count: COACH_90_DAILY_AI_LIMIT, remaining: 0 };
}

export async function refundCoachCredits(cost: number) {
  await supabaseRest<number>("rpc/refund_ai_coach_credit", {
    method: "POST",
    body: JSON.stringify({ p_cost: Math.max(1, Math.min(cost, 5)) })
  });
}

export const COACH_PLAN_INSTRUCTIONS = `Tu es le coach pédagogique d'Aptileo, une préparation indépendante au TOEIC Listening & Reading. Crée un programme hebdomadaire concret en français à partir des données fournies. Utilise uniquement les activités réellement disponibles dans le produit : séance Reading adaptative, carnet d'erreurs, mini-examen Reading, Listening parties 1 et 2 et fiches pédagogiques. Ne prétends jamais produire un score officiel. Propose exactement sept journées, respecte le temps quotidien indiqué, priorise les compétences faibles et reste encourageant sans promettre de gain de score.`;

export const COACH_EXPLANATION_INSTRUCTIONS = `Tu es le coach pédagogique d'Aptileo. Explique en français une question d'anglais professionnel déjà corrigée par la plateforme. La bonne réponse fournie est la source de vérité : ne la remets pas en cause. Explique simplement pourquoi elle fonctionne, pourquoi la réponse choisie est incorrecte, donne un moyen mnémotechnique, exactement deux nouveaux exemples originaux avec traduction et une action de révision. Ne reproduis pas de contenu officiel ETS et ne prétends pas fournir un score officiel.`;
