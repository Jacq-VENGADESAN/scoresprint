import { redirect } from "next/navigation";
import { MiniExamRunner } from "@/components/mini-exam-runner";
import { UpgradeGate } from "@/components/upgrade-gate";
import { getAccessSummary, type AccessSummary } from "@/lib/access";
import { getPublicMiniExamQuestions } from "@/lib/mini-exam-bank";
import type { MiniExamDraftState, SessionDraftRow } from "@/lib/session-drafts";
import { getCurrentUser, supabaseRest } from "@/lib/supabase-server";

function validDraft(
  row: SessionDraftRow<MiniExamDraftState> | undefined,
  questionIds: string[]
): MiniExamDraftState | null {
  const draft = row?.payload;
  if (!draft || draft.version !== 1) return null;
  if (!Array.isArray(draft.questionIds) || draft.questionIds.length !== questionIds.length) return null;
  if (!draft.questionIds.every((id, index) => id === questionIds[index])) return null;
  if (!Number.isInteger(draft.index) || draft.index < 0 || draft.index >= questionIds.length) return null;
  if (!Number.isFinite(new Date(draft.startedAt).getTime())) return null;
  if (!draft.answers || typeof draft.answers !== "object" || !draft.timings || typeof draft.timings !== "object") return null;
  return draft;
}

export default async function MockExamPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/mock-exam");

  const questions = getPublicMiniExamQuestions();
  const questionIds = questions.map((question) => question.id);
  let access: AccessSummary | null = null;
  let initialDraft: MiniExamDraftState | null = null;
  let accessReady = true;
  try { access = await getAccessSummary(user.id); } catch { accessReady = false; }
  try {
    const now = new Date().toISOString();
    const rows = await supabaseRest<Array<SessionDraftRow<MiniExamDraftState>>>(
      `session_drafts?select=payload,started_at,expires_at,updated_at&user_id=eq.${user.id}&kind=eq.mini_exam&expires_at=gt.${encodeURIComponent(now)}&limit=1`
    );
    initialDraft = validDraft(rows[0], questionIds);
  } catch {
    initialDraft = null;
  }

  const blocked = Boolean(access && !access.isPremium && (access.miniExam.remaining ?? 0) <= 0);

  return (
    <div className="container focus-page">
      <header className="page-head page-head-compact">
        <div className="eyebrow">Mesure chronométrée</div>
        <h1>{initialDraft ? "Ton mini-examen reprend avec le temps restant." : "Teste ton niveau dans un cadre plus exigeant."}</h1>
        <p>{initialDraft ? "Les réponses déjà enregistrées ont été restaurées. Le chronomètre a continué pendant ton absence." : "Trente questions originales couvrent les parties écrites 5, 6 et 7. Cette mesure affine davantage la courbe que la séance quotidienne."}</p>
      </header>

      {access && !access.isPremium ? (
        <div className="quota-strip"><strong>Compte gratuit</strong><span>{access.miniExam.used}/{access.miniExam.limit} mini-examen utilisé ce mois-ci</span><a href="/pricing">Voir les accès Premium →</a></div>
      ) : access?.isPremium ? (
        <div className="quota-strip quota-strip-premium"><strong>Premium</strong><span>Mini-examens illimités activés</span></div>
      ) : null}

      {!accessReady ? <div className="alert alert-warning">Les quotas gratuits ne sont pas encore accessibles.</div> : null}

      {blocked ? (
        <UpgradeGate title="Ton mini-examen gratuit du mois est déjà utilisé." message="Le compte gratuit comprend un mini-examen chronométré par mois." resetMessage="Un nouveau mini-examen gratuit sera disponible au début du mois prochain." />
      ) : accessReady ? (
        <MiniExamRunner questions={questions} initialDraft={initialDraft} />
      ) : null}
    </div>
  );
}
