import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getAccessSummary, historyCutoffIso } from "@/lib/access";
import { getDatabaseQuestionReview } from "@/lib/database-questions";
import { getPracticeQuestionReview } from "@/lib/practice-catalog";
import { getCurrentUser, supabaseRest } from "@/lib/supabase-server";

type StudySession = {
  id: string;
  mode: "adaptive" | "review";
  total_questions: number;
  correct_answers: number;
  completed_minutes: number;
  duration_ms: number;
  completed_at: string | null;
};

type Attempt = {
  id: string;
  question_code: string;
  skill_id: string;
  subskill: string;
  selected_option: string;
  correct_option: string;
  is_correct: boolean;
  response_time_ms: number;
  mastery_before: number | string;
  mastery_after: number | string;
  created_at: string;
};

function formatDuration(value: number) {
  const seconds = Math.max(0, Math.round(value / 1000));
  return seconds >= 60 ? `${Math.floor(seconds / 60)} min ${String(seconds % 60).padStart(2, "0")} s` : `${seconds} s`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export default async function SessionHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  const { id } = await params;
  if (!user) redirect(`/auth?next=/history/session/${encodeURIComponent(id)}`);

  const access = await getAccessSummary(user.id);
  const cutoff = historyCutoffIso(access);
  const dateFilter = cutoff ? `&completed_at=gte.${encodeURIComponent(cutoff)}` : "";
  const sessions = await supabaseRest<StudySession[]>(
    `study_sessions?select=id,mode,total_questions,correct_answers,completed_minutes,duration_ms,completed_at&id=eq.${encodeURIComponent(id)}&user_id=eq.${user.id}&completed_at=not.is.null${dateFilter}&limit=1`
  );
  const session = sessions[0];
  if (!session || !session.completed_at) notFound();

  const attempts = await supabaseRest<Attempt[]>(
    `practice_attempts?select=id,question_code,skill_id,subskill,selected_option,correct_option,is_correct,response_time_ms,mastery_before,mastery_after,created_at&session_id=eq.${encodeURIComponent(id)}&user_id=eq.${user.id}&order=created_at.asc`
  );
  const reviews = await Promise.all(attempts.map(async (attempt) => (
    getPracticeQuestionReview(attempt.question_code, attempt.selected_option)
    ?? await getDatabaseQuestionReview(attempt.question_code, attempt.selected_option)
  )));

  const accuracy = session.total_questions > 0
    ? Math.round((session.correct_answers / session.total_questions) * 100)
    : 0;

  return (
    <div className="container history-detail-page">
      <header className="page-head">
        <div className="eyebrow">Détail de séance</div>
        <h1>{session.mode === "review" ? "Révision du carnet d’erreurs" : "Séance adaptative"}</h1>
        <p>{formatDate(session.completed_at)} · chaque réponse est replacée dans son contexte avec la règle et le piège associés.</p>
      </header>

      <section className="card panel history-detail-summary">
        <div className="stats">
          <div className="stat"><div className="stat-label">Résultat</div><div className="stat-value">{session.correct_answers}/{session.total_questions}</div></div>
          <div className="stat"><div className="stat-label">Précision</div><div className="stat-value">{accuracy}%</div></div>
          <div className="stat"><div className="stat-label">Temps</div><div className="stat-value history-small-value">{formatDuration(session.duration_ms)}</div></div>
        </div>
        <div className="history-detail-actions">
          <Link href="/history" className="btn btn-secondary">← Retour à l’historique</Link>
          <Link href="/practice" className="btn btn-primary">Nouvelle séance</Link>
        </div>
      </section>

      <div className="review-list">
        {attempts.map((attempt, index) => {
          const review = reviews[index];
          const question = review?.question;
          const selectedText = question?.options.find((option) => option.id === attempt.selected_option)?.text ?? attempt.selected_option;
          const correctText = question?.options.find((option) => option.id === attempt.correct_option)?.text ?? attempt.correct_option;

          return (
            <article className={`card review-card ${attempt.is_correct ? "review-card-correct" : "review-card-wrong"}`} key={attempt.id}>
              <div className="review-card-head">
                <div>
                  <span className="badge">Question {index + 1}</span>
                  <span className="badge">{question?.skillLabel ?? attempt.skill_id}</span>
                  <span className="badge">{attempt.subskill}</span>
                </div>
                <strong>{attempt.is_correct ? "Correct" : "À revoir"}</strong>
              </div>

              {question?.context ? <div className="reading-context">{question.context}</div> : null}
              <h2>{question?.prompt ?? `Question ${attempt.question_code}`}</h2>

              <div className="review-answer-grid">
                <div><span>Ta réponse</span><strong>{attempt.selected_option}. {selectedText}</strong></div>
                <div><span>Bonne réponse</span><strong>{attempt.correct_option}. {correctText}</strong></div>
                <div><span>Temps</span><strong>{formatDuration(attempt.response_time_ms)}</strong></div>
                <div><span>Maîtrise</span><strong>{Math.round(Number(attempt.mastery_before))}% → {Math.round(Number(attempt.mastery_after))}%</strong></div>
              </div>

              {review ? (
                <div className="review-explanation">
                  <p><strong>Explication :</strong> {review.question.explanation}</p>
                  <p><strong>Pourquoi ton choix :</strong> {review.selectedFeedback}</p>
                  <p><strong>Piège :</strong> {review.question.trap}</p>
                </div>
              ) : (
                <div className="notice">Cette ancienne question n’existe plus dans la banque actuelle, mais ton résultat reste conservé.</div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}