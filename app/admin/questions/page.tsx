import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isAdminUser } from "@/lib/admin";
import { MANAGED_STATUSES } from "@/lib/admin-question";
import { getManagedQuestions } from "@/lib/database-questions";
import { supabaseAdminRest } from "@/lib/supabase-admin";
import { getCurrentUser } from "@/lib/supabase-server";

type AttemptRow = {
  question_code: string;
  is_correct: boolean;
};

function relationLabel(value: { label: string } | Array<{ label: string }> | null, fallback: string) {
  return Array.isArray(value) ? value[0]?.label ?? fallback : value?.label ?? fallback;
}

function statusLabel(status: string) {
  return MANAGED_STATUSES.find((item) => item.id === status)?.label ?? status;
}

export default async function AdminQuestionsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/admin/questions");
  if (!isAdminUser(user)) notFound();

  const [questions, attempts] = await Promise.all([
    getManagedQuestions(),
    supabaseAdminRest<AttemptRow[]>("practice_attempts?select=question_code,is_correct&order=created_at.desc&limit=10000")
  ]);
  const stats = new Map<string, { total: number; correct: number }>();
  for (const attempt of attempts) {
    const current = stats.get(attempt.question_code) ?? { total: 0, correct: 0 };
    current.total += 1;
    current.correct += attempt.is_correct ? 1 : 0;
    stats.set(attempt.question_code, current);
  }
  const publishedCount = questions.filter((question) => question.status === "published").length;
  const draftCount = questions.filter((question) => question.status === "draft" || question.status === "human_reviewed").length;

  return (
    <div className="container admin-page">
      <header className="page-head admin-page-head">
        <div>
          <div className="eyebrow">Administration du contenu</div>
          <h1>Gère la banque de questions sans redéployer le site.</h1>
          <p>Les questions publiées rejoignent automatiquement les séances adaptatives. Les réponses correctes restent uniquement côté serveur.</p>
        </div>
        <Link className="btn btn-primary" href="/admin/questions/new">Ajouter une question</Link>
      </header>

      <section className="admin-summary-grid">
        <div className="card admin-summary-card"><span>Total géré</span><strong>{questions.length}</strong><small>En plus des 50 questions historiques dans le code</small></div>
        <div className="card admin-summary-card"><span>Publiées</span><strong>{publishedCount}</strong><small>Disponibles dans l’entraînement</small></div>
        <div className="card admin-summary-card"><span>À relire</span><strong>{draftCount}</strong><small>Brouillons et questions relues</small></div>
        <div className="card admin-summary-card"><span>Réponses analysées</span><strong>{attempts.length}</strong><small>Échantillon des 10 000 dernières tentatives</small></div>
      </section>

      <section className="card admin-table-card">
        <div className="admin-table-head"><div><h2>Questions Supabase</h2><p className="muted-copy">Modifie une explication, archive un contenu ambigu ou publie une nouvelle question immédiatement.</p></div></div>
        {questions.length === 0 ? (
          <div className="admin-empty-state">
            <h3>Aucune question gérée dans Supabase.</h3>
            <p>Crée la première question : elle pourra être enregistrée en brouillon, puis publiée lorsque tu l’auras vérifiée.</p>
            <Link className="btn btn-primary" href="/admin/questions/new">Créer la première question</Link>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Question</th><th>Partie</th><th>Compétence</th><th>Statut</th><th>Résultats</th><th></th></tr></thead>
              <tbody>
                {questions.map((question) => {
                  const questionStats = question.code ? stats.get(question.code) : undefined;
                  const accuracy = questionStats?.total ? Math.round((questionStats.correct / questionStats.total) * 100) : null;
                  return (
                    <tr key={question.id}>
                      <td><strong>{question.code}</strong><span>{question.prompt}</span></td>
                      <td>Partie {question.part}<small>Difficulté {question.difficulty}/5</small></td>
                      <td>{relationLabel(question.skills, question.skill_id)}<small>{question.subskill}</small></td>
                      <td><span className={`admin-status admin-status-${question.status}`}>{statusLabel(question.status)}</span></td>
                      <td>{questionStats ? <><strong>{accuracy}%</strong><small>{questionStats.correct}/{questionStats.total} correctes</small></> : <span className="muted-copy">Pas encore jouée</span>}</td>
                      <td><Link className="btn btn-secondary compact-btn" href={`/admin/questions/${question.id}`}>Modifier</Link></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}