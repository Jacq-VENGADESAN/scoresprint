import { redirect } from "next/navigation";
import { PracticeRunner } from "@/components/practice-runner";
import { UpgradeGate } from "@/components/upgrade-gate";
import { getAccessSummary, type AccessSummary } from "@/lib/access";
import { buildPracticeSession } from "@/lib/practice-catalog";
import { getCurrentUser, supabaseRest } from "@/lib/supabase-server";

type Goal = {
  daily_minutes: number;
};

type MasteryRow = {
  skill_id: string;
  mastery: number | string;
};

type ErrorRow = {
  question_code: string;
  next_review_at: string | null;
  resolved_at: string | null;
};

type RecentAttemptRow = {
  question_code: string;
};

export default async function PracticePage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/practice");

  const params = await searchParams;
  const reviewMode = params.mode === "errors";
  let dailyMinutes = 20;
  let masteryRows: MasteryRow[] = [];
  let errorRows: ErrorRow[] = [];
  let recentAttempts: RecentAttemptRow[] = [];
  let practiceReady = true;
  let accessReady = true;
  let access: AccessSummary | null = null;

  try {
    access = await getAccessSummary(user.id);
  } catch {
    accessReady = false;
  }

  try {
    const fourteenDaysAgo = new Date(Date.now() - 14 * 86_400_000).toISOString();
    const [goals, masteries, errors, recent] = await Promise.all([
      supabaseRest<Goal[]>(`user_goals?select=daily_minutes&user_id=eq.${user.id}&limit=1`),
      supabaseRest<MasteryRow[]>(`user_mastery?select=skill_id,mastery&user_id=eq.${user.id}&order=mastery.asc`),
      supabaseRest<ErrorRow[]>(`user_error_items?select=question_code,next_review_at,resolved_at&user_id=eq.${user.id}&resolved_at=is.null&order=next_review_at.asc.nullsfirst`),
      supabaseRest<RecentAttemptRow[]>(`practice_attempts?select=question_code&user_id=eq.${user.id}&created_at=gte.${encodeURIComponent(fourteenDaysAgo)}&order=created_at.desc&limit=120`)
    ]);
    dailyMinutes = goals[0]?.daily_minutes ?? 20;
    masteryRows = masteries;
    errorRows = errors;
    recentAttempts = recent;
  } catch {
    practiceReady = false;
    try {
      const masteries = await supabaseRest<MasteryRow[]>(`user_mastery?select=skill_id,mastery&user_id=eq.${user.id}&order=mastery.asc`);
      masteryRows = masteries;
    } catch {
      masteryRows = [];
    }
  }

  if (masteryRows.length === 0) redirect("/diagnostic");

  const now = Date.now();
  const dueQuestionCodes = errorRows
    .filter((item) => reviewMode || !item.next_review_at || new Date(item.next_review_at).getTime() <= now)
    .map((item) => item.question_code);
  const questionCount = Math.max(6, Math.min(12, Math.round(dailyMinutes / 2)));
  const priorities = masteryRows.map((row) => ({ skillId: row.skill_id, mastery: Number(row.mastery) }));
  const seed = `${user.id}-${new Date().toISOString().slice(0, 10)}-${reviewMode ? "review" : "daily"}`;
  const excludedQuestionCodes = reviewMode ? [] : [...new Set(recentAttempts.map((attempt) => attempt.question_code))];
  const questions = reviewMode && dueQuestionCodes.length === 0
    ? []
    : buildPracticeSession(priorities, dueQuestionCodes, questionCount, seed, excludedQuestionCodes);
  const blocked = Boolean(access && !access.isPremium && (access.practice.remaining ?? 0) <= 0);

  return (
    <div className="container">
      <header className="page-head">
        <div className="eyebrow">{reviewMode ? "Révision du carnet d’erreurs" : `Séance adaptative · ${dailyMinutes} minutes`}</div>
        <h1>{reviewMode ? "Réactive les notions qui t’ont déjà piégé." : "Travaille d’abord ce qui te rapporte le plus de points."}</h1>
        <p>
          {reviewMode
            ? "Les erreurs non maîtrisées reviennent selon leur date de révision et disparaissent après plusieurs réussites."
            : "La séance combine tes faiblesses, les erreurs arrivées à échéance et évite autant que possible les questions vues pendant les 14 derniers jours."}
        </p>
      </header>

      {access && !access.isPremium ? (
        <div className="quota-strip">
          <strong>Compte gratuit</strong>
          <span>{access.practice.used}/{access.practice.limit} séance utilisée aujourd’hui</span>
          <a href="/pricing">Débloquer les séances illimitées →</a>
        </div>
      ) : access?.isPremium ? (
        <div className="quota-strip quota-strip-premium"><strong>Premium</strong><span>Séances illimitées activées</span></div>
      ) : null}

      {!practiceReady ? (
        <div className="alert alert-warning">
          Les migrations de l’entraînement ou des statistiques ne sont pas encore accessibles. Exécute les nouveaux scripts SQL avant de répondre.
        </div>
      ) : null}
      {!accessReady ? (
        <div className="alert alert-warning">La migration des quotas gratuits n’est pas encore accessible. Exécute le nouveau script SQL.</div>
      ) : null}

      {blocked ? (
        <UpgradeGate
          title="Ta séance gratuite du jour est terminée."
          message="Le compte gratuit comprend une séance adaptative ou une révision d’erreurs par jour. Premium supprime cette limite."
          resetMessage="Ton quota gratuit sera réinitialisé demain."
        />
      ) : accessReady ? (
        <PracticeRunner questions={questions} reviewMode={reviewMode} plannedMinutes={dailyMinutes} />
      ) : null}
    </div>
  );
}