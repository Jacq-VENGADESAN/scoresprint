import Link from "next/link";
import { redirect } from "next/navigation";
import { ProgressBar } from "@/components/progress-bar";
import { StatCard } from "@/components/stat-card";
import { buildDailySession } from "@/lib/adaptive";
import { getCurrentUser, supabaseRest } from "@/lib/supabase-server";

 type Goal = {
  current_score: number | null;
  target_score: number;
  exam_date: string | null;
  daily_minutes: number;
};

type DiagnosticRun = {
  estimated_score: number;
  score_low: number;
  score_high: number;
  correct_answers: number;
  total_questions: number;
  completed_at: string;
};

type MasteryRow = {
  skill_id: string;
  mastery: number | string;
  repeated_errors: number;
  last_reviewed_at: string | null;
};

type SkillRow = {
  id: string;
  label: string;
  exam_weight: number | string;
};

function daysUntil(date: string | null) {
  if (!date) return null;
  const today = new Date();
  const target = new Date(`${date}T12:00:00`);
  return Math.max(0, Math.ceil((target.getTime() - today.getTime()) / 86_400_000));
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(new Date(date));
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/dashboard");

  let goal: Goal | null = null;
  let databaseReady = true;
  try {
    const goals = await supabaseRest<Goal[]>(
      `user_goals?select=current_score,target_score,exam_date,daily_minutes&user_id=eq.${user.id}&limit=1`
    );
    goal = goals[0] ?? null;
  } catch {
    databaseReady = false;
  }

  if (databaseReady && !goal) redirect("/onboarding");

  let latestRun: DiagnosticRun | null = null;
  let masteryRows: MasteryRow[] = [];
  let skillRows: SkillRow[] = [];
  let diagnosticReady = true;
  try {
    const [runs, masteries, skills] = await Promise.all([
      supabaseRest<DiagnosticRun[]>(
        `diagnostic_runs?select=estimated_score,score_low,score_high,correct_answers,total_questions,completed_at&user_id=eq.${user.id}&order=completed_at.desc&limit=1`
      ),
      supabaseRest<MasteryRow[]>(
        `user_mastery?select=skill_id,mastery,repeated_errors,last_reviewed_at&user_id=eq.${user.id}&order=mastery.asc`
      ),
      supabaseRest<SkillRow[]>("skills?select=id,label,exam_weight")
    ]);
    latestRun = runs[0] ?? null;
    masteryRows = masteries;
    skillRows = skills;
  } catch {
    diagnosticReady = false;
  }

  const labelMap = new Map(skillRows.map((skill) => [skill.id, skill.label]));
  const weightMap = new Map(skillRows.map((skill) => [skill.id, Number(skill.exam_weight)]));
  const remainingDays = daysUntil(goal?.exam_date ?? null);
  const dailyMinutes = goal?.daily_minutes ?? 20;
  const targetScore = goal?.target_score ?? 850;
  const currentScore = latestRun?.estimated_score ?? goal?.current_score ?? 650;
  const estimateLow = latestRun?.score_low ?? Math.max(10, currentScore - 60);
  const estimateHigh = latestRun?.score_high ?? Math.min(990, currentScore + 60);
  const progress = Math.max(0, Math.min(100, Math.round((currentScore / targetScore) * 100)));
  const displayName = user.user_metadata?.display_name ?? user.email?.split("@")[0] ?? "toi";

  const masterySkills = masteryRows.map((row) => ({
    skillId: row.skill_id,
    mastery: Number(row.mastery),
    examWeight: weightMap.get(row.skill_id) ?? 1,
    repeatedErrors: row.repeated_errors,
    lastReviewedAt: row.last_reviewed_at ?? undefined
  }));
  const session = buildDailySession(masterySkills, dailyMinutes, remainingDays ?? 45);
  const weakest = masteryRows[0];

  return (
    <div className="container">
      <header className="page-head">
        <div className="eyebrow">Tableau de bord</div>
        <h1>Bonjour {displayName}, voilà ce qui mérite ton temps aujourd’hui.</h1>
        <p>
          {latestRun
            ? `Ton dernier diagnostic du ${formatDate(latestRun.completed_at)} alimente maintenant ton score, tes priorités et ta séance.`
            : "Ton objectif est enregistré. Termine le diagnostic pour remplacer les estimations provisoires par tes propres résultats."}
        </p>
      </header>

      {!databaseReady ? (
        <div className="alert alert-warning">Les tables Supabase principales ne sont pas accessibles. Vérifie les deux premières migrations.</div>
      ) : null}
      {!diagnosticReady ? (
        <div className="alert alert-warning">La migration du diagnostic n’est pas encore exécutée. Le reste de ton compte continue de fonctionner.</div>
      ) : null}

      <div className="dashboard-grid">
        <div style={{ display: "grid", gap: 22 }}>
          <section className="card panel">
            <div className="panel-title">
              <h2>Progression vers {targetScore}</h2>
              <span className="badge">{remainingDays === null ? "Date à définir" : `${remainingDays} jours restants`}</span>
            </div>
            <div className="stats">
              <StatCard label="Score estimé" value={`${estimateLow}–${estimateHigh}`} detail={latestRun ? "Diagnostic court" : "Fourchette provisoire"} />
              <StatCard label="Objectif" value={String(targetScore)} detail={`Estimation centrale : ${currentScore}`} />
              <StatCard
                label={latestRun ? "Diagnostic" : "Temps quotidien"}
                value={latestRun ? `${latestRun.correct_answers}/${latestRun.total_questions}` : `${dailyMinutes} min`}
                detail={latestRun ? "Réponses correctes" : "Programme personnalisé"}
              />
            </div>
            <div style={{ marginTop: 22 }}><ProgressBar value={progress} /></div>
          </section>

          <section className="card panel">
            <div className="panel-title"><h2>Séance personnalisée</h2><span style={{ color: "var(--muted)" }}>{dailyMinutes} minutes</span></div>
            {session.length > 0 ? (
              <div className="session-list">
                {session.map((block) => (
                  <div className="session-item" key={block.skillId}>
                    <span className="session-time">{block.minutes} min</span>
                    <div>
                      <strong>{labelMap.get(block.skillId) ?? block.skillId}</strong><br />
                      <span style={{ color: "var(--muted)" }}>{block.reason}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="notice" style={{ marginBottom: 18 }}>Le diagnostic est nécessaire pour générer une séance réellement personnalisée.</div>
            )}
            <Link className="btn btn-primary" href={latestRun ? "/practice" : "/diagnostic"}>
              {latestRun ? "Démarrer ma séance" : "Faire mon diagnostic"}
            </Link>
          </section>
        </div>

        <aside style={{ display: "grid", gap: 22, alignContent: "start" }}>
          <section className="card panel">
            <div className="panel-title"><h3>Maîtrise mesurée</h3></div>
            {masteryRows.length > 0 ? masteryRows.map((row) => {
              const value = Math.round(Number(row.mastery));
              return (
                <div className="skill" key={row.skill_id}>
                  <div className="skill-top"><span>{labelMap.get(row.skill_id) ?? row.skill_id}</span><strong>{value}%</strong></div>
                  <ProgressBar value={value} />
                </div>
              );
            }) : <p style={{ color: "var(--muted)" }}>Aucune compétence mesurée pour le moment.</p>}
          </section>

          <section className="card panel">
            <div className="panel-title"><h3>Point d’attention</h3></div>
            <div className="notice">
              {weakest
                ? `${labelMap.get(weakest.skill_id) ?? weakest.skill_id} est actuellement ta priorité, avec ${Math.round(Number(weakest.mastery))}% de maîtrise estimée.`
                : "Le diagnostic identifiera la notion sur laquelle tu gagneras le plus rapidement des points."}
            </div>
            <Link href="/diagnostic" className="btn btn-ghost" style={{ marginTop: 14 }}>
              {latestRun ? "Refaire le diagnostic →" : "Commencer le diagnostic →"}
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
