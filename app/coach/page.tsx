import Link from "next/link";
import { redirect } from "next/navigation";
import { Coach90Client } from "@/components/coach-90-client";
import { COACH_90_DAILY_AI_LIMIT, getAccessSummary, hasCoach90Access } from "@/lib/access";
import type { CoachPlan } from "@/lib/coach";
import { openAiIsConfigured } from "@/lib/openai";
import { getCurrentUser, supabaseRest } from "@/lib/supabase-server";

export const metadata = {
  title: "Coach 90",
  description: "Programme hebdomadaire et explications personnalisées réservés à l’offre Coach 90."
};

type PlanRow = { plan: CoachPlan; week_start: string; updated_at: string };
type ErrorRow = { question_code: string; title: string; subskill: string; error_count: number };
type UsageRow = { usage_count: number };

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default async function CoachPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/coach");

  const access = await getAccessSummary(user.id);
  if (!hasCoach90Access(access)) {
    return (
      <div className="container coach-page">
        <header className="page-head">
          <div><span className="eyebrow">Fonction exclusive</span><h1>Le Coach 90 va au-delà d’un simple accès plus long.</h1><p>Il transforme tes résultats en programme hebdomadaire et reformule tes erreurs avec une IA encadrée par les corrections vérifiées d’Aptileo.</p></div>
        </header>
        <section className="card coach-locked-card">
          <div><strong>Coach 90</strong><h2>Plan de 7 jours, explications personnalisées et 10 crédits IA quotidiens.</h2><p>Le Sprint 30 conserve tout le cœur de l’entraînement. Coach 90 ajoute un accompagnement personnel réellement différent pendant 90 jours.</p></div>
          <Link className="btn btn-primary" href="/pricing">Comparer les offres</Link>
        </section>
      </div>
    );
  }

  let initialPlan: CoachPlan | null = null;
  let errors: ErrorRow[] = [];
  let used = 0;
  let dataReady = true;
  try {
    const [plans, errorRows, usageRows] = await Promise.all([
      supabaseRest<PlanRow[]>(`ai_coach_plans?select=plan,week_start,updated_at&user_id=eq.${user.id}&order=updated_at.desc&limit=1`),
      supabaseRest<ErrorRow[]>(`user_error_items?select=question_code,title,subskill,error_count&user_id=eq.${user.id}&resolved_at=is.null&order=error_count.desc,last_attempt_at.desc&limit=8`),
      supabaseRest<UsageRow[]>(`ai_coach_usage?select=usage_count&user_id=eq.${user.id}&period_start=eq.${today()}&limit=1`)
    ]);
    initialPlan = plans[0]?.plan ?? null;
    errors = errorRows;
    used = usageRows[0]?.usage_count ?? 0;
  } catch {
    dataReady = false;
  }

  return (
    <div className="container coach-page">
      <header className="page-head coach-page-head">
        <div>
          <span className="eyebrow">Coach 90 · accompagnement personnalisé</span>
          <h1>Ton travail de la semaine, construit à partir de tes résultats.</h1>
          <p>L’IA n’invente pas ton niveau : elle utilise ton objectif, tes maîtrises, tes erreurs et les activités réellement disponibles pour organiser la prochaine étape.</p>
        </div>
        <Link className="btn btn-secondary" href="/dashboard">Tableau de bord</Link>
      </header>
      {!dataReady ? <div className="alert alert-warning">Exécute la migration Coach 90 pour activer les programmes et les quotas IA.</div> : null}
      <Coach90Client
        initialPlan={initialPlan}
        errors={errors.map((row) => ({ questionCode: row.question_code, title: row.title, subskill: row.subskill, errorCount: row.error_count }))}
        configured={openAiIsConfigured() && dataReady}
        initialRemaining={Math.max(0, COACH_90_DAILY_AI_LIMIT - used)}
      />
    </div>
  );
}
