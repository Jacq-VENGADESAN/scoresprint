import Link from "next/link";
import { redirect } from "next/navigation";
import { getAccessSummary, historyCutoffIso, type AccessSummary } from "@/lib/access";
import { getCurrentUser, supabaseRest } from "@/lib/supabase-server";

type StudySession = {
  id: string;
  mode: "adaptive" | "review";
  total_questions: number;
  correct_answers: number;
  completed_minutes: number;
  completed_at: string;
};

type MiniExamRun = {
  id: string;
  correct_answers: number;
  total_questions: number;
  estimated_score: number;
  score_low: number;
  score_high: number;
  duration_ms: number;
  completed_at: string;
};

type DiagnosticRun = {
  id: string;
  correct_answers: number;
  total_questions: number;
  estimated_score: number;
  score_low: number;
  score_high: number;
  completed_at: string;
};

type HistoryItem = {
  id: string;
  kind: "session" | "exam" | "diagnostic";
  date: string;
  title: string;
  result: string;
  detail: string;
  href?: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export default async function HistoryPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/history");

  let items: HistoryItem[] = [];
  let ready = true;
  let accessReady = true;
  let access: AccessSummary | null = null;

  try {
    access = await getAccessSummary(user.id);
  } catch {
    accessReady = false;
  }

  try {
    const cutoff = access ? historyCutoffIso(access) : null;
    const dateFilter = cutoff ? `&completed_at=gte.${encodeURIComponent(cutoff)}` : "";
    const [sessions, exams, diagnostics] = await Promise.all([
      supabaseRest<StudySession[]>(
        `study_sessions?select=id,mode,total_questions,correct_answers,completed_minutes,completed_at&user_id=eq.${user.id}&completed_at=not.is.null${dateFilter}&order=completed_at.desc&limit=50`
      ),
      supabaseRest<MiniExamRun[]>(
        `mini_exam_runs?select=id,correct_answers,total_questions,estimated_score,score_low,score_high,duration_ms,completed_at&user_id=eq.${user.id}${dateFilter}&order=completed_at.desc&limit=30`
      ),
      supabaseRest<DiagnosticRun[]>(
        `diagnostic_runs?select=id,correct_answers,total_questions,estimated_score,score_low,score_high,completed_at&user_id=eq.${user.id}${dateFilter}&order=completed_at.desc&limit=20`
      )
    ]);

    items = [
      ...sessions.map((session): HistoryItem => ({
        id: session.id,
        kind: "session",
        date: session.completed_at,
        title: session.mode === "review" ? "Révision du carnet d’erreurs" : "Séance adaptative",
        result: `${session.correct_answers}/${session.total_questions}`,
        detail: `${session.completed_minutes} min · correction détaillée disponible`,
        href: `/history/session/${session.id}`
      })),
      ...exams.map((exam): HistoryItem => ({
        id: exam.id,
        kind: "exam",
        date: exam.completed_at,
        title: "Mini-examen chronométré",
        result: `${exam.score_low}–${exam.score_high}`,
        detail: `${exam.correct_answers}/${exam.total_questions} · estimation centrale ${exam.estimated_score}`,
        href: `/history/exam/${exam.id}`
      })),
      ...diagnostics.map((diagnostic): HistoryItem => ({
        id: diagnostic.id,
        kind: "diagnostic",
        date: diagnostic.completed_at,
        title: "Diagnostic de niveau",
        result: `${diagnostic.score_low}–${diagnostic.score_high}`,
        detail: `${diagnostic.correct_answers}/${diagnostic.total_questions} · estimation centrale ${diagnostic.estimated_score}`
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch {
    ready = false;
  }

  return (
    <div className="container history-page">
      <header className="page-head">
        <div className="eyebrow">Historique</div>
        <h1>Retrouve chaque mesure et comprends précisément tes erreurs.</h1>
        <p>Les séances et mini-examens peuvent être ouverts pour revoir les questions, tes choix, les bonnes réponses et le temps passé.</p>
      </header>

      {access && !access.isPremium ? (
        <div className="quota-strip">
          <strong>Compte gratuit</strong>
          <span>Historique limité aux {access.historyDays} derniers jours</span>
          <a href="/pricing">Débloquer l’historique complet →</a>
        </div>
      ) : access?.isPremium ? (
        <div className="quota-strip quota-strip-premium"><strong>Premium</strong><span>Historique complet activé</span></div>
      ) : null}

      {!ready ? <div className="alert alert-warning">L’historique n’est pas accessible. Vérifie que les dernières migrations Supabase ont été exécutées.</div> : null}
      {!accessReady ? <div className="alert alert-warning">La migration des quotas gratuits n’est pas encore accessible.</div> : null}

      <section className="card panel history-summary">
        <div>
          <span className="eyebrow">Contenu disponible</span>
          <h2>{items.length} activité{items.length > 1 ? "s" : ""} enregistrée{items.length > 1 ? "s" : ""}</h2>
        </div>
        <div className="history-summary-actions">
          <Link href="/practice" className="btn btn-primary">Nouvelle séance</Link>
          <Link href="/mock-exam" className="btn btn-secondary">Nouveau mini-examen</Link>
        </div>
      </section>

      {items.length > 0 ? (
        <div className="history-list">
          {items.map((item) => {
            const content = (
              <>
                <div className={`history-kind history-kind-${item.kind}`}>
                  {item.kind === "session" ? "Séance" : item.kind === "exam" ? "Examen" : "Diagnostic"}
                </div>
                <div className="history-main">
                  <strong>{item.title}</strong>
                  <span>{formatDate(item.date)}</span>
                  <small>{item.detail}</small>
                </div>
                <div className="history-result">
                  <strong>{item.result}</strong>
                  <span>{item.href ? "Voir le détail →" : "Mesure initiale"}</span>
                </div>
              </>
            );

            return item.href ? (
              <Link className="card history-row history-row-link" href={item.href} key={`${item.kind}-${item.id}`}>
                {content}
              </Link>
            ) : (
              <div className="card history-row" key={`${item.kind}-${item.id}`}>{content}</div>
            );
          })}
        </div>
      ) : (
        <section className="card empty-state">
          <h2>Aucune activité visible dans cette période.</h2>
          <p className="muted-copy">Termine une séance ou un mini-examen pour alimenter ton historique.</p>
          <Link href="/practice" className="btn btn-primary">Démarrer une séance</Link>
        </section>
      )}
    </div>
  );
}