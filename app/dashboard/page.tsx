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

function ArrowIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11m-4-4 4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function ExamIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4h10a2 2 0 0 1 2 2v14H5V6a2 2 0 0 1 2-2Z" fill="none" stroke="currentColor" strokeWidth="1.7" /><path d="M8 9h8M8 13h5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>;
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
  const evidenceCount = latestSnapshot?.evidence_count ?? latestRun?.total_questions ?? 0;

  return (
    <div className="container dashboard-page">
      <header className="page-head dashboard-page-head">
        <div>
          <div className="eyebrow">Tableau de bord</div>
          <h1>Bonjour {displayName}. Voici ton prochain meilleur effort.</h1>
          <p>
            {latestRun
              ? "Ton estimation se précise à mesure que tu réponds. La priorité du jour est calculée à partir de tes faiblesses et de tes erreurs dues."
              : "Ton objectif est enregistré. Le diagnostic permettra de remplacer les valeurs provisoires par tes propres résultats."}
          </p>
        </div>
        <div className="dashboard-head-actions">
          <Link href="/history" className="btn btn-secondary">Voir l’historique</Link>
          <Link href="/account" className="btn btn-secondary">Mon compte</Link>
        </div>
      </header>

      {!databaseReady ? <div className="alert alert-warning">Les tables Supabase principales ne sont pas accessibles. Vérifie les premières migrations.</div> : null}
      {!diagnosticReady ? <div className="alert alert-warning">Les données de maîtrise ne sont pas encore accessibles.</div> : null}
      {!analyticsReady ? <div className="alert alert-warning">Les statistiques de séances ne sont pas encore accessibles.</div> : null}
      {!measurementReady ? <div className="alert alert-warning">La courbe de score nécessite la migration de calibration.</div> : null}

      <section className="dashboard-hero" aria-labelledby="score-heading">
        <div className="dashboard-score-block">
          <div className="dashboard-score-label">
            <span id="score-heading">Estimation actuelle</span>
            <span className="badge">Confiance {scoreConfidence}</span>
          </div>
          <div className="dashboard-score-range">{estimateLow}–{estimateHigh}</div>
          <div className="dashboard-score-meta">
            <span>Estimation centrale : <strong>{currentScore}</strong></span>
            <span>Source : <strong>{scoreSourceLabel(latestSnapshot?.source)}</strong></span>
            <span>{evidenceCount} observation{evidenceCount > 1 ? "s" : ""}</span>
          </div>

          <div className="dashboard-target">
            <div className="dashboard-target-row">
              <div><span>Progression vers l’objectif</span><strong>{targetScore}</strong></div>
              <span>{remainingDays === null ? "Date d’examen à définir" : `${remainingDays} jour${remainingDays > 1 ? "s" : ""} restant${remainingDays > 1 ? "s" : ""}`}</span>
            </div>
            <div className="dashboard-progress-track" aria-label={`${progress}% de l’objectif estimé atteint`}>
              <div className="dashboard-progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="dashboard-score-actions">
            <Link className="btn btn-primary" href={latestRun ? "/practice" : "/diagnostic"}>
              {latestRun ? "Démarrer la séance" : "Faire le diagnostic"}<ArrowIcon />
            </Link>
            <Link className="btn btn-secondary" href="/errors">Revoir mes erreurs</Link>
          </div>
        </div>

        <aside className="dashboard-today" aria-label="Programme du jour">
          <div className="dashboard-today-head">
            <div><span className="eyebrow">Aujourd’hui</span><h2>Ta séance ciblée</h2></div>
            <span className="dashboard-duration">{dailyMinutes} min</span>
          </div>
          {sessionPlan.length > 0 ? (
            <div className="dashboard-plan-list">
              {sessionPlan.map((block) => (
                <div className="dashboard-plan-item" key={block.skillId}>
                  <span className="dashboard-plan-time">{block.minutes}m</span>
                  <div><strong>{labelMap.get(block.skillId) ?? block.skillId}</strong><span>{block.reason}</span></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="notice">Termine le diagnostic pour générer une séance réellement personnalisée.</div>
          )}
          <Link className="btn btn-primary" href={latestRun ? "/practice" : "/diagnostic"}>
            {latestRun ? "Commencer maintenant" : "Lancer le diagnostic"}
          </Link>
        </aside>
      </section>

      <div className="dashboard-content-grid">
        <div className="dashboard-main-column">
          <section className="card dashboard-section">
            <div className="dashboard-section-head">
              <div><h2>Évolution de l’estimation</h2><p>Les mini-examens pèsent davantage que les petites séances quotidiennes.</p></div>
              <span className="badge">{scoreSnapshots.length} mesure{scoreSnapshots.length > 1 ? "s" : ""}</span>
            </div>
            <div className="stats">
              <StatCard label="Fourchette actuelle" value={`${estimateLow}–${estimateHigh}`} detail={scoreSourceLabel(latestSnapshot?.source)} />
              <StatCard label="Objectif" value={String(targetScore)} detail={`Écart central : ${Math.max(0, targetScore - currentScore)} points`} />
              <StatCard label="Confiance" value={scoreConfidence} detail={`${evidenceCount} observations`} />
            </div>
            <ScoreCurve snapshots={scoreSnapshots} />
          </section>

          <section className="card dashboard-section">
            <div className="dashboard-section-head">
              <div><h2>Tes sept derniers jours</h2><p>La régularité compte davantage qu’une longue séance isolée.</p></div>
              <span className="badge">{studySessions.length > 0 ? `${streak} jour${streak > 1 ? "s" : ""} de série` : "Première séance à faire"}</span>
            </div>
            <div className="stats">
              <StatCard label="Questions" value={String(weeklyQuestions)} detail="Sur 7 jours" />
              <StatCard label="Réussite" value={`${weeklyAccuracy}%`} detail={`${weeklyCorrect} réponses correctes`} />
              <StatCard label="Temps actif" value={`${weeklyMinutes} min`} detail={`${weeklyActivity.reduce((sum, day) => sum + day.sessions, 0)} séances`} />
            </div>
            <div className="weekly-chart" aria-label="Activité des sept derniers jours">
              {weeklyActivity.map((day) => {
                const height = day.questions > 0 ? Math.max(12, Math.round((day.questions / maxDailyQuestions) * 100)) : 4;
                return (
                  <div className="weekly-day" key={day.dateKey} title={`${day.questions} questions · ${day.accuracy}% de réussite`}>
                    <div className="weekly-bar-track"><div className={`weekly-bar ${day.questions === 0 ? "weekly-bar-empty" : ""}`} style={{ height: `${height}%` }} /></div>
                    <strong>{day.questions}</strong><span>{day.label}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="dashboard-mini-exam">
            <span className="dashboard-mini-exam-icon"><ExamIcon /></span>
            <div><h3>Besoin d’une mesure plus fiable ?</h3><p>Le mini-examen utilise 30 questions chronométrées et affine davantage la courbe.</p></div>
            <Link href="/mock-exam" className="btn btn-secondary">Passer le mini-examen</Link>
          </section>
        </div>

        <aside className="dashboard-side-column">
          <section className="card dashboard-section">
            <div className="dashboard-section-head"><div><h3>Maîtrise par compétence</h3><p>Les domaines les plus faibles apparaissent en premier.</p></div></div>
            {masteryRows.length > 0 ? masteryRows.map((row) => {
              const value = Math.round(Number(row.mastery));
              const confidence = confidenceFromEvidence(row.evidence_count);
              return (
                <div className="skill" key={row.skill_id}>
                  <div className="skill-top"><span>{labelMap.get(row.skill_id) ?? row.skill_id}</span><strong>{value}%</strong></div>
                  <ProgressBar value={value} />
                  <div className="mastery-evidence"><span>Confiance {confidence}</span><span>{row.correct_count}/{row.evidence_count} réussites</span></div>
                </div>
              );
            }) : <p className="muted-copy">Aucune compétence mesurée pour le moment.</p>}
          </section>

          <section className="card dashboard-section">
            <div className="dashboard-section-head"><div><h3>Activités récentes</h3><p>Les trois dernières séances terminées.</p></div><Link href="/history" className="btn btn-ghost">Tout voir</Link></div>
            {studySessions.length > 0 ? (
              <div className="recent-session-list">
                {studySessions.slice(0, 3).map((studySession) => (
                  <Link className="recent-session" href={`/history/session/${studySession.id}`} key={studySession.id}>
                    <div><strong>{studySession.mode === "review" ? "Révision d’erreurs" : "Séance adaptative"}</strong><span>{formatDate(studySession.completed_at)} · {studySession.completed_minutes} min</span></div>
                    <strong>{studySession.correct_answers}/{studySession.total_questions}</strong>
                  </Link>
                ))}
              </div>
            ) : <div className="notice">Termine une séance pour faire apparaître ton activité.</div>}
          </section>

          <section className="card dashboard-section">
            <div className="dashboard-section-head"><div><h3>Point d’attention</h3><p>La priorité la plus rentable actuellement.</p></div></div>
            <div className="notice">
              {weakest
                ? `${labelMap.get(weakest.skill_id) ?? weakest.skill_id} est à ${Math.round(Number(weakest.mastery))}% de maîtrise sur ${weakest.evidence_count} observations.`
                : "Le diagnostic identifiera la notion sur laquelle tu peux gagner le plus rapidement des points."}
            </div>
            <div style={{ marginTop: 18 }}><span className="streak-number">{streak}</span><p className="muted-copy">jour{streak > 1 ? "s" : ""} consécutif{streak > 1 ? "s" : ""} avec une séance terminée.</p></div>
          </section>
        </aside>
      </div>
    </div>
  );
}
