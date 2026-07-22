import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { PracticeRunner } from "@/components/practice-runner";
import { UpgradeGate } from "@/components/upgrade-gate";
import { getAccessSummary, type AccessSummary } from "@/lib/access";
import { getPublicPublishedDatabaseQuestions } from "@/lib/database-questions";
import { buildPracticeSession } from "@/lib/practice-catalog";
import type { PublicPracticeQuestion } from "@/lib/practice-bank";
import type { PracticeDraftState, SessionDraftRow } from "@/lib/session-drafts";
import { getCurrentUser, supabaseRest } from "@/lib/supabase-server";

type Goal = { daily_minutes: number };
type MasteryRow = { skill_id: string; mastery: number | string };
type ErrorRow = { question_code: string; next_review_at: string | null; resolved_at: string | null };
type RecentAttemptRow = { question_code: string };

function validDraft(row: SessionDraftRow<PracticeDraftState> | undefined, reviewMode: boolean) {
  const draft = row?.payload;
  if (!draft || draft.version !== 1) return null;
  if (draft.mode !== (reviewMode ? "review" : "adaptive")) return null;
  if (!Array.isArray(draft.questionIds) || draft.questionIds.length === 0 || draft.questionIds.length > 30) return null;
  if (!draft.questionIds.every((value) => typeof value === "string")) return null;
  if (!Number.isInteger(draft.index) || draft.index < 0 || draft.index >= draft.questionIds.length) return null;
  if (!Number.isFinite(new Date(draft.startedAt).getTime())) return null;
  return draft;
}

export default async function PracticePage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/practice");

  const params = await searchParams;
  const reviewMode = params.mode === "errors";
  let dailyMinutes = 20;
  let masteryRows: MasteryRow[] = [];
  let errorRows: ErrorRow[] = [];
  let recentAttempts: RecentAttemptRow[] = [];
  let managedQuestions: PublicPracticeQuestion[] = [];
  let initialDraft: PracticeDraftState | null = null;
  let practiceReady = true;
  let accessReady = true;
  let access: AccessSummary | null = null;

  try { access = await getAccessSummary(user.id); } catch { accessReady = false; }
  try { managedQuestions = await getPublicPublishedDatabaseQuestions(); } catch { managedQuestions = []; }
  try {
    const now = new Date().toISOString();
    const draftRows = await supabaseRest<Array<SessionDraftRow<PracticeDraftState>>>(
      `session_drafts?select=payload,started_at,expires_at,updated_at&user_id=eq.${user.id}&kind=eq.practice&expires_at=gt.${encodeURIComponent(now)}&limit=1`
    );
    initialDraft = validDraft(draftRows[0], reviewMode);
  } catch {
    initialDraft = null;
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
    try { masteryRows = await supabaseRest<MasteryRow[]>(`user_mastery?select=skill_id,mastery&user_id=eq.${user.id}&order=mastery.asc`); }
    catch { masteryRows = []; }
  }

  if (masteryRows.length === 0) redirect("/diagnostic");

  const now = Date.now();
  const dueQuestionCodes = errorRows
    .filter((item) => reviewMode || !item.next_review_at || new Date(item.next_review_at).getTime() <= now)
    .map((item) => item.question_code);
  const questionCount = Math.max(6, Math.min(12, Math.round(dailyMinutes / 2)));
  const priorities = masteryRows.map((row) => ({ skillId: row.skill_id, mastery: Number(row.mastery) }));
  const sessionSeed = `${user.id}-${reviewMode ? "review" : "adaptive"}-${randomUUID()}`;
  const excludedQuestionCodes = reviewMode ? [] : [...new Set(recentAttempts.map((attempt) => attempt.question_code))];

  let questions: PublicPracticeQuestion[];
  if (initialDraft) {
    questions = buildPracticeSession([], initialDraft.questionIds, initialDraft.questionIds.length, `${sessionSeed}-resume`, [], managedQuestions);
    const exactMatch = questions.length === initialDraft.questionIds.length
      && questions.every((question, index) => question.id === initialDraft?.questionIds[index]);
    if (!exactMatch) initialDraft = null;
  } else {
    questions = [];
  }

  if (!initialDraft) {
    questions = reviewMode && dueQuestionCodes.length === 0
      ? []
      : buildPracticeSession(priorities, dueQuestionCodes, questionCount, sessionSeed, excludedQuestionCodes, managedQuestions);
  }

  const blocked = Boolean(access && !access.isPremium && (access.practice.remaining ?? 0) <= 0 && !initialDraft);

  return (
    <div className="container focus-page">
      <header className="page-head page-head-compact">
        <div className="eyebrow">{reviewMode ? "Carnet d’erreurs" : `Séance adaptative · ${dailyMinutes} minutes`}</div>
        <h1>{initialDraft ? "Ta séance interrompue est prête à reprendre." : reviewMode ? "Réactive les notions qui t’ont déjà piégé." : "Une sélection différente à chaque nouvelle séance."}</h1>
        <p>
          {initialDraft
            ? "Les réponses déjà validées, la question actuelle et le temps écoulé ont été restaurés."
            : reviewMode
              ? "Les erreurs reviennent à leur date de révision et leur ordre varie entre les séances."
              : "Le moteur conserve tes priorités et évite les répétitions récentes, tout en renouvelant l’ordre et la sélection pour chaque utilisateur."}
        </p>
      </header>

      {access && !access.isPremium ? (
        <div className="quota-strip"><strong>Compte gratuit</strong><span>{access.practice.used}/{access.practice.limit} séance utilisée aujourd’hui</span><a href="/pricing">Voir les accès Premium →</a></div>
      ) : access?.isPremium ? (
        <div className="quota-strip quota-strip-premium"><strong>Premium</strong><span>Séances illimitées activées</span></div>
      ) : null}

      {!practiceReady ? <div className="alert alert-warning">Les données d’entraînement ne sont pas encore accessibles.</div> : null}
      {!accessReady ? <div className="alert alert-warning">Les quotas gratuits ne sont pas encore accessibles.</div> : null}

      {blocked ? (
        <UpgradeGate title="Ta séance gratuite du jour est terminée." message="Le compte gratuit comprend une séance adaptative ou une révision d’erreurs par jour." resetMessage="Ton quota gratuit sera réinitialisé demain." />
      ) : accessReady ? (
        <PracticeRunner questions={questions} reviewMode={reviewMode} plannedMinutes={dailyMinutes} initialDraft={initialDraft} />
      ) : null}
    </div>
  );
}
