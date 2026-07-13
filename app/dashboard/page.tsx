import Link from "next/link";
import { redirect } from "next/navigation";
import { ProgressBar } from "@/components/progress-bar";
import { ScoreCurve } from "@/components/score-curve";
import { StatCard } from "@/components/stat-card";
import { buildDailySession } from "@/lib/adaptive";
import { confidenceFromEvidence } from "@/lib/measurement";
import { buildWeeklyActivity, calculateStreak, type CompletedSession } from "@/lib/progress";
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
  evidence_count: number;
  correct_count: number;
};

type SkillRow = {
  id: string;
  label: string;
  exam_weight: number | string;
};

type StudySessionRow = CompletedSession & {
  id: string;
  mode: "adaptive" | "review";
  completed_minutes: number;
  completed_at: string;
};

type ScoreSnapshotRow = {
  source: "diagnostic" | "practice" | "mini_exam";
  central_score: number;
  score_low: number;
  score_high: number;
  confidence: "faible" | "moyenne" | "élevée";
  evidence_count: number;
  created_at: string;
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

function scoreSourceLabel(source: ScoreSnapshotRow["source"] | undefined) {
  if (source === "mini_exam") return "Mini-examen chronométré";
  if (source === "practice") return "Entraînement récent";
  return "Diagnostic court";
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
        `user_mastery?select=skill_id,mastery,repeated_errors,last_reviewed_at,evidence_count,correct_count&user_id=eq.${user.id}&order=mastery.asc`
      ),
      supabaseRest<SkillRow[]>("skills?select=id,label,exam_weight")
    ]);
    latestRun = runs[0] ?? null;
    masteryRows = masteries;
    skillRows = skills;
  } catch {
    diagnosticReady = false;
  }

  let studySessions: StudySessionRow[] = [];
  let analyticsReady = true;
  try {
    studySessions = await supabaseRest<StudySessionRow[]>(
      `study_sessions?select=id,mode,total_questions,correct_answers,duration_ms,completed_minutes,completed_at&user_id=eq.${user.id}&completed_at=not.is.null&order=completed_at.desc&limit=30`
    );
  } catch {
    analyticsReady = false;
  }

  let scoreSnapshots: ScoreSnapshotRow[] = [];
  let measurementReady = true;
  try {
    scoreSnapshots = await supabaseRest<ScoreSnapshotRow[]>(
      `score_snapshots?select=source,central_score,score_low,score_high,confidence,evidence_count,created_at&user_id=eq.${user.id}&order=created_at.desc&limit=8`
    );
  } catch {
    measurementReady = false;
  }

  const labelMap = new Map(skillRows.map((skill) => [skill.id, skill.label]));
  const weightMap = new Map(skillRows.map((skill) => [skill.id, Number(skill.exam_weight)]));
  const remainingDays = daysUntil(goal?.exam_date ?? null);
  const dailyMinutes = goal?.daily_minutes ?? 20;
  const targetScore = goal?.target_score ?? 850;
  const latestSnapshot = scoreSnapshots[0];
  const currentScore = latestSnapshot?.central_score ?? latestRun?.estimated_score ?? goal?.current_score ?? 650;
  const estimateLow = latestSnapshot?.score_low ?? latestRun?.score_low ?? Math.max(10, currentScore - 60);
  const estimateHigh = latestSnapshot?.score_high ?? latestRun?.score_high ?? Math.min(990, currentScore + 60);
  const scoreConfidence = latestSnapshot?.confidence ?? "faible";
  const progress = Math.max(0, Math.min(100, Math.round((currentScore / targetScore) * 100)));
  const displayName = user.user_metadata?.display_name ?? user.email?.split("@")[0] ?? "toi";

  const masterySkills = masteryRows.map((row) => ({
    skillId: row.skill_id,
    mastery: Number(row.mastery),
    examWeight: weightMap.get(row.skill_id) ?? 1,
    repeatedErrors: row.repeated_errors,
    lastReviewedAt: row.last_reviewed_at ?? undefined
  }));
  const sessionPlan = buildDailySession(masterySkills, dailyMinutes, remainingDays ?? 45);
  const weakest = masteryRows[0];

  const weeklyActivity = buildWeeklyActivity(studySessions);
  const weeklyQuestions = weeklyActivity.reduce((sum, day) => sum + day.questions, 0);
  const weeklyCorrect = weeklyActivity.reduce((sum, day) => sum + day.correct, 0);
  const weeklyMinutes = Math.round(weeklyActivity.reduce((sum, day) => sum + day.durationMs, 0) / 60_000);
  const weeklyAccuracy = weeklyQuestions > 0 ? Math.round((weeklyCorrect / weeklyQuestions) * 100) : 0;
  const streak = calculateStreak(studySessions.map((session) => session.completed_at));
  const maxDailyQuestions = Math.max(1, ...weeklyActivity.map((day) => day.questions));

  return (
    <div className="container">
      <header className="page-head">
        <div className="eyebrow">Tableau de bord</div>
        <h1>Bonjour {displayName}, voilà ce qui mérite ton temps aujourd’hui.</h1>
        <p>
          {latestRun
            ? "Ton diagnostic, tes séances et tes mini-examens alimentent désormais une estimation progressive plutôt qu’un score figé."
            : "Ton objectif est enregistré. Termine le diagnostic pour remplacer les estimations provisoires par tes propres résultats."}
        </p>
      </header>

      {!databaseReady ? (
        <div className="alert alert-warning">Les tables Supabase principales ne sont pas accessibles. Vérifie les deux premières migrations.</div>
      ) : null}
      {!diagnosticReady ? (
        <div className="alert alert-warning">La migration de calibration n’est pas encore accessible. Exécute le nouveau script SQL.</div>
      ) : null}
      {!analyticsReady ? (
        <div className="alert alert-warning">La migration des statistiques n’est pas encore accessible.</div>
      ) : null}
      {!measurementReady ? (
        <div className="alert alert-warning">La courbe de score et les mini-examens nécessitent la nouvelle migration de calibration.</div>
      ) : null}

      <div className="dashboard-grid">
        <div style={{ display: "grid", gap: 22 }}>
          <section className="card panel">
            <div className="panel-title">
              <h2>Progression vers {targetScore}</h2>
              <span className="badge">{remainingDays === null ? "Date à définir" : `${remainingDays} jours restants`}</span>
            </div>
            <div className="stats">
              <StatCard label="Score estimé" value={`${estimateLow}–${estimateHigh}`} detail={scoreSourceLabel(latestSnapshot?.source)} />
              <StatCard label="Objectif" value={String(targetScore)} detail={`Estimation centrale : ${currentScore}`} />
              <StatCard label="Confiance" value={scoreConfidence} detail={`${latestSnapshot?.evidence_count ?? latestRun?.total_questions ?? 0} observations`} />
            </div>
            <div style={{ marginTop: 22 }}><ProgressBar value={progress} /></div>
            <ScoreCurve snapshots={scoreSnapshots} />
          </section>

          <section className="card panel">
            <div className="mini-exam-cta">
              <div>
                <h3>Affiner ton score avec 30 questions chronométrées</h3>
                <p>Les parties 5, 6 et 7 sont évaluées en 25 minutes. Le résultat pèse davantage qu’une petite séance quotidienne.</p>
              </div>
              <Link href="/mock-exam" className="btn btn-primary">Passer le mini-examen</Link>
            </div>
          </section>

          <section className="card panel">
            <div className="panel-title">
              <h2>Tes 7 derniers jours</h2>
              <span className="badge">{studySessions.length > 0 ? `${streak} jour${streak > 1 ? "s" : ""} de série` : "Première séance à faire"}</span>
            </div>
            <div className="stats">
              <StatCard label="Questions" value={String(weeklyQuestions)} detail="Sur les 7 derniers jours" />
              <StatCard label="Réussite" value={`${weeklyAccuracy}%`} detail={`${weeklyCorrect} bonnes réponses`} />
              <StatCard label="Temps actif" value={`${weeklyMinutes} min`} detail={`${weeklyActivity.reduce((sum, day) => sum + day.sessions, 0)} séances`} />
            </div>

            <div className="weekly-chart" aria-label="Activité des sept derniers jours">
              {weeklyActivity.map((day) => {
                const height = day.questions > 0 ? Math.max(12, Math.round((day.questions / maxDailyQuestions) * 100)) : 4;
                return (
                  <div className="weekly-day" key={day.dateKey} title={`${day.questions} questions · ${day.accuracy}% de réussite`}>
                    <div className="weekly-bar-track">
                      <div className={`weekly-bar ${day.questions === 0 ? "weekly-bar-empty" : ""}`} style={{ height: `${height}%` }} />
                    </div>
                    <strong>{day.questions}</strong>
                    <span>{day.label}</span>
                  </div>
                );
              })}
            </div>

            {studySessions.length > 0 ? (
              <div className="recent-session-list">
                {studySessions.slice(0, 3).map((studySession) => (
                  <div className="recent-session" key={studySession.id}>
                    <div>
                      <strong>{studySession.mode === "review" ? "Révision d’erreurs" : "Séance adaptative"}</strong>
                      <span>{formatDate(studySession.completed_at)} · {studySession.completed_minutes} min</span>
                    </div>
                    <strong>{studySession.correct_answers}/{studySession.total_questions}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <div className="notice analytics-empty">Termine une séance pour faire apparaître ta série, ton temps de travail et ta régularité.</div>
            )}
          </section>

          <section className="card panel">
            <div className="panel-title"><h2>Séance personnalisée</h2><span style={{ color: "var(--muted)" }}>{dailyMinutes} minutes</span></div>
            {sessionPlan.length > 0 ? (
              <div className="session-list">
                {sessionPlan.map((block) => (
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
              const confidence = confidenceFromEvidence(row.evidence_count);
              return (
                <div className="skill" key={row.skill_id}>
                  <div className="skill-top"><span>{labelMap.get(row.skill_id) ?? row.skill_id}</span><strong>{value}%</strong></div>
                  <ProgressBar value={value} />
                  <div className="mastery-evidence">
                    <span>Confiance {confidence}</span>
                    <span>{row.correct_count}/{row.evidence_count} réussites</span>
                  </div>
                </div>
              );
            }) : <p style={{ color: "var(--muted)" }}>Aucune compétence mesurée pour le moment.</p>}
          </section>

          <section className="card panel">
            <div className="panel-title"><h3>Régularité</h3></div>
            <div className="streak-number">{streak}</div>
            <p className="muted-copy" style={{ marginTop: 4 }}>jour{streak > 1 ? "s" : ""} consécutif{streak > 1 ? "s" : ""} avec une séance terminée.</p>
            <Link href="/practice" className="btn btn-ghost">Continuer ma série →</Link>
          </section>

          <section className="card panel">
            <div className="panel-title"><h3>Point d’attention</h3></div>
            <div className="notice">
              {weakest
                ? `${labelMap.get(weakest.skill_id) ?? weakest.skill_id} est ta priorité avec ${Math.round(Number(weakest.mastery))}% de maîtrise, sur ${weakest.evidence_count} observations.`
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
