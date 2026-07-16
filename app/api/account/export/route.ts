import { NextResponse } from "next/server";
import { getCurrentUser, supabaseRest } from "@/lib/supabase-server";

async function safeRead(path: string) {
  try {
    return await supabaseRest<unknown[]>(path);
  } catch (error) {
    console.error(`Unable to export ${path.split("?")[0]}`, error);
    return [];
  }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });

  const userFilter = `user_id=eq.${user.id}`;
  const [
    profiles,
    goals,
    diagnostics,
    diagnosticAnswers,
    masteries,
    sessions,
    practiceAttempts,
    errorItems,
    scoreSnapshots,
    miniExams,
    miniExamAnswers,
    listeningRuns,
    listeningAttempts,
    usage,
    subscriptions,
    reports,
    drafts,
    legacyAttempts
  ] = await Promise.all([
    safeRead(`profiles?select=id,display_name,created_at,updated_at&id=eq.${user.id}`),
    safeRead(`user_goals?select=*&${userFilter}`),
    safeRead(`diagnostic_runs?select=*&${userFilter}&order=completed_at.asc`),
    safeRead(`diagnostic_answers?select=*&${userFilter}&order=created_at.asc`),
    safeRead(`user_mastery?select=*&${userFilter}&order=skill_id.asc`),
    safeRead(`study_sessions?select=*&${userFilter}&order=created_at.asc`),
    safeRead(`practice_attempts?select=*&${userFilter}&order=created_at.asc`),
    safeRead(`user_error_items?select=*&${userFilter}&order=created_at.asc`),
    safeRead(`score_snapshots?select=*&${userFilter}&order=created_at.asc`),
    safeRead(`mini_exam_runs?select=*&${userFilter}&order=completed_at.asc`),
    safeRead(`mini_exam_answers?select=*&${userFilter}&order=created_at.asc`),
    safeRead(`listening_runs?select=*&${userFilter}&order=completed_at.asc`),
    safeRead(`listening_attempts?select=*&${userFilter}&order=created_at.asc`),
    safeRead(`usage_counters?select=*&${userFilter}&order=period_start.asc`),
    safeRead(`subscriptions?select=plan_code,status,access_starts_at,access_ends_at,created_at&${userFilter}&order=created_at.asc`),
    safeRead(`question_reports?select=question_code,category,details,selected_option,status,created_at,reviewed_at&${userFilter}&order=created_at.asc`),
    safeRead(`session_drafts?select=kind,payload,started_at,expires_at,updated_at&${userFilter}`),
    safeRead(`attempts?select=*&${userFilter}&order=created_at.asc`)
  ]);

  const exportedAt = new Date();
  const document = {
    exportVersion: 2,
    exportedAt: exportedAt.toISOString(),
    account: {
      id: user.id,
      email: user.email ?? null,
      displayName: user.user_metadata?.display_name ?? null
    },
    data: {
      profiles,
      goals,
      diagnostics,
      diagnosticAnswers,
      masteries,
      sessions,
      practiceAttempts,
      errorItems,
      scoreSnapshots,
      miniExams,
      miniExamAnswers,
      listeningRuns,
      listeningAttempts,
      usage,
      subscriptions,
      reports,
      drafts,
      legacyAttempts
    }
  };

  const date = exportedAt.toISOString().slice(0, 10);
  return new NextResponse(JSON.stringify(document, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="scoresprint-export-${date}.json"`,
      "Cache-Control": "no-store"
    }
  });
}
