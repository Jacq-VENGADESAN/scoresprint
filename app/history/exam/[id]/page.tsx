import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getAccessSummary, historyCutoffIso } from "@/lib/access";
import { getPublicMiniExamQuestions } from "@/lib/mini-exam-bank";
import { getCurrentUser, supabaseRest } from "@/lib/supabase-server";

type MiniExamRun = {
  id: string;
  correct_answers: number;
  total_questions: number;
  estimated_score: number;
  score_low: number;
  score_high: number;
  duration_ms: number;
  section_breakdown: Array<{ part: number; correct: number; total: number; accuracy: number }>;
  completed_at: string;
};

type MiniExamAnswer = {
  id: string;
  question_code: string;
  part: number;
  skill_id: string;
  selected_option: string;
  correct_option: string;
  is_correct: boolean;
  response_time_ms: number;
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

export default async function ExamHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  const { id } = await params;
  if (!user) redirect(`/auth?next=/history/exam/${encodeURIComponent(id)}`);

  const access = await getAccessSummary(user.id);
  const cutoff = historyCutoffIso(access);
  const dateFilter = cutoff ? `&completed_at=gte.${encodeURIComponent(cutoff)}` : "";
  const runs = await supabaseRest<MiniExamRun[]>(
    `mini_exam_runs?select=id,correct_answers,total_questions,estimated_score,score_low,score_high,duration_ms,section_breakdown,completed_at&id=eq.${encodeURIComponent(id)}&user_id=eq.${user.id}${dateFilter}&limit=1`
  );
  const run = runs[0];
  if (!run) notFound();

  const answers = await supabaseRest<MiniExamAnswer[]>(
    `mini_exam_answers?select=id,question_code,part,skill_id,selected_option,correct_option,is_correct,response_time_ms&run_id=eq.${encodeURIComponent(id)}&user_id=eq.${user.id}&order=question_code.asc`
  );

  const questionMap = new Map(getPublicMiniExamQuestions().map((question) => [question.id, question]));
  const accuracy = run.total_questions > 0 ? Math.round((run.correct_answers / run.total_questions) * 100) : 0;

  return (
    <div className="container history-detail-page">
      <header className="page-head">
        <div className="eyebrow">Détail du mini-examen</div>
        <h1>Score estimé : {run.score_low}–{run.score_high}</h1>
        <p>{formatDate(run.completed_at)} · estimation centrale {run.estimated_score}. Le détail ci-dessous permet de revoir chaque choix après le test.</p>
      </header>

      <section className="card panel history-detail-summary">
        <div className="stats">
          <div className="stat"><div className="stat-label">Résultat</div><div className="stat-value">{run.correct_answers}/{run.total_questions}</div></div>
          <div className="stat"><div className="stat-label">Précision</div><div className="stat-value">{accuracy}%</div></div>
          <div className="stat"><div className="stat-label">Temps</div><div className="stat-value history-small-value">{formatDuration(run.duration_ms)}</div></div>
        </div>
        <div className="exam-section-results history-section-results">
          {(run.section_breakdown ?? []).map((section) => (
            <div key={section.part}><span>Partie {section.part}</span><strong>{section.correct}/{section.total} · {section.accuracy}%</strong></div>
          ))}
        </div>
        <div className="history-detail-actions">
          <Link href="/history" className="btn btn-secondary">← Retour à l’historique</Link>
          <Link href="/mock-exam" className="btn btn-primary">Refaire un mini-examen</Link>
        </div>
      </section>

      <div className="review-list">
        {answers.map((answer, index) => {
          const question = questionMap.get(answer.question_code);
          const selectedText = question?.options.find((option) => option.id === answer.selected_option)?.text ?? answer.selected_option;
          const correctText = question?.options.find((option) => option.id === answer.correct_option)?.text ?? answer.correct_option;

          return (
            <article className={`card review-card ${answer.is_correct ? "review-card-correct" : "review-card-wrong"}`} key={answer.id}>
              <div className="review-card-head">
                <div>
                  <span className="badge">Question {index + 1}</span>
                  <span className="badge">Partie {answer.part}</span>
                  <span className="badge">{question?.skillLabel ?? answer.skill_id}</span>
                </div>
                <strong>{answer.is_correct ? "Correct" : "Incorrect"}</strong>
              </div>

              {question?.context ? <div className="reading-context">{question.context}</div> : null}
              <h2>{question?.prompt ?? `Question ${answer.question_code}`}</h2>

              <div className="review-answer-grid review-answer-grid-exam">
                <div><span>Ta réponse</span><strong>{answer.selected_option || "—"}. {selectedText || "Aucune réponse"}</strong></div>
                <div><span>Bonne réponse</span><strong>{answer.correct_option}. {correctText}</strong></div>
                <div><span>Temps</span><strong>{formatDuration(answer.response_time_ms)}</strong></div>
              </div>

              {!answer.is_correct ? (
                <div className="notice">
                  Cette question alimente désormais ta maîtrise de « {question?.skillLabel ?? answer.skill_id} » et les prochaines séances donneront davantage de poids à cette compétence.
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}