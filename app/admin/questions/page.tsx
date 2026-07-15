import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isAdminUser } from "@/lib/admin";
import { MANAGED_SKILLS, MANAGED_STATUSES } from "@/lib/admin-question";
import { getManagedQuestions } from "@/lib/database-questions";
import { supabaseAdminRest } from "@/lib/supabase-admin";
import { getCurrentUser } from "@/lib/supabase-server";

type AttemptRow = { question_code: string; is_correct: boolean };
type ReportRow = { question_code: string; status: string };
type SearchParams = {
  q?: string;
  status?: string;
  part?: string;
  skill?: string;
  difficulty?: string;
  reported?: string;
  imported?: string;
  seeded?: string;
};

function relationLabel(value: { label: string } | Array<{ label: string }> | null, fallback: string) {
  return Array.isArray(value) ? value[0]?.label ?? fallback : value?.label ?? fallback;
}

function statusLabel(status: string) {
  return MANAGED_STATUSES.find((item) => item.id === status)?.label ?? status;
}

export default async function AdminQuestionsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/admin/questions");
  if (!isAdminUser(user)) notFound();

  const params = await searchParams;
  const [questions, attempts, reports] = await Promise.all([
    getManagedQuestions(),
    supabaseAdminRest<AttemptRow[]>("practice_attempts?select=question_code,is_correct&order=created_at.desc&limit=10000"),
    supabaseAdminRest<ReportRow[]>("question_reports?select=question_code,status&status=eq.open&limit=5000")
  ]);
  const stats = new Map<string, { total: number; correct: number }>();
  for (const attempt of attempts) {
    const current = stats.get(attempt.question_code) ?? { total: 0, correct: 0 };
    current.total += 1;
    current.correct += attempt.is_correct ? 1 : 0;
    stats.set(attempt.question_code, current);
  }
  const reportCounts = new Map<string, number>();
  for (const report of reports) reportCounts.set(report.question_code, (reportCounts.get(report.question_code) ?? 0) + 1);

  const query = (params.q ?? "").trim().toLowerCase();
  const filteredQuestions = questions.filter((question) => {
    const matchesQuery = !query || [question.code, question.prompt, question.subskill, question.skill_id]
      .some((value) => (value ?? "").toLowerCase().includes(query));
    const matchesStatus = !params.status || params.status === "all" || question.status === params.status;
    const matchesPart = !params.part || params.part === "all" || String(question.part) === params.part;
    const matchesSkill = !params.skill || params.skill === "all" || question.skill_id === params.skill;
    const matchesDifficulty = !params.difficulty || params.difficulty === "all" || String(question.difficulty) === params.difficulty;
    const matchesReported = params.reported !== "1" || (reportCounts.get(question.code ?? "") ?? 0) > 0;
    return matchesQuery && matchesStatus && matchesPart && matchesSkill && matchesDifficulty && matchesReported;
  });

  const publishedCount = questions.filter((question) => question.status === "published").length;
  const draftCount = questions.filter((question) => question.status === "draft" || question.status === "human_reviewed").length;

  return (
    <div className="container admin-page">
      <header className="page-head admin-page-head">
        <div>
          <div className="eyebrow">Administration du contenu</div>
          <h1>Gère la banque de questions sans redéployer le site.</h1>
          <p>Installe la banque ScoreSprint, filtre les contenus, duplique un modèle et traite les signalements des utilisateurs.</p>
        </div>
        <div className="admin-head-actions">
          <Link className="btn btn-secondary" href="/admin/reports">Signalements {reports.length > 0 ? `(${reports.length})` : ""}</Link>
          <Link className="btn btn-secondary" href="/admin/questions/import">Importer un CSV</Link>
          <Link className="btn btn-secondary" href="/admin/questions/new">Ajouter une question</Link>
          <Link className="btn btn-primary" href="/admin/questions/seed">Installer 200 questions</Link>
        </div>
      </header>

      {params.imported ? <div className="alert alert-success">{params.imported} question{params.imported === "1" ? "" : "s"} importée{params.imported === "1" ? "" : "s"} avec succès.</div> : null}
      {params.seeded ? <div className="alert alert-success">{params.seeded} question{params.seeded === "1" ? "" : "s"} originale{params.seeded === "1" ? "" : "s"} ajoutée{params.seeded === "1" ? "" : "s"} à la banque ScoreSprint.</div> : null}

      <section className="admin-summary-grid">
        <div className="card admin-summary-card"><span>Total géré</span><strong>{questions.length}</strong><small>En plus des 50 questions historiques dans le code</small></div>
        <div className="card admin-summary-card"><span>Publiées</span><strong>{publishedCount}</strong><small>Disponibles dans l’entraînement</small></div>
        <div className="card admin-summary-card"><span>À relire</span><strong>{draftCount}</strong><small>Brouillons et questions relues</small></div>
        <div className="card admin-summary-card"><span>Signalements ouverts</span><strong>{reports.length}</strong><small>À vérifier dans le contrôle qualité</small></div>
      </section>

      <form className="card admin-filter-form" method="get">
        <label className="admin-filter-search">Recherche<input name="q" defaultValue={params.q ?? ""} placeholder="Code, énoncé ou sous-compétence" /></label>
        <label>Statut<select name="status" defaultValue={params.status ?? "all"}><option value="all">Tous</option>{MANAGED_STATUSES.map((status) => <option value={status.id} key={status.id}>{status.label}</option>)}</select></label>
        <label>Partie<select name="part" defaultValue={params.part ?? "all"}><option value="all">Toutes</option><option value="5">Partie 5</option><option value="6">Partie 6</option><option value="7">Partie 7</option></select></label>
        <label>Compétence<select name="skill" defaultValue={params.skill ?? "all"}><option value="all">Toutes</option>{MANAGED_SKILLS.map((skill) => <option value={skill.id} key={skill.id}>{skill.label}</option>)}</select></label>
        <label>Difficulté<select name="difficulty" defaultValue={params.difficulty ?? "all"}><option value="all">Toutes</option>{[1, 2, 3, 4, 5].map((value) => <option value={value} key={value}>{value}/5</option>)}</select></label>
        <label className="admin-filter-checkbox"><input type="checkbox" name="reported" value="1" defaultChecked={params.reported === "1"} /> Signalées uniquement</label>
        <button className="btn btn-primary" type="submit">Filtrer</button>
        <Link className="btn btn-secondary" href="/admin/questions">Réinitialiser</Link>
      </form>

      <section className="card admin-table-card">
        <div className="admin-table-head"><div><h2>{filteredQuestions.length} question{filteredQuestions.length > 1 ? "s" : ""} affichée{filteredQuestions.length > 1 ? "s" : ""}</h2><p className="muted-copy">Modifie une explication, archive un contenu ambigu ou publie une nouvelle question immédiatement.</p></div></div>
        {filteredQuestions.length === 0 ? (
          <div className="admin-empty-state"><h3>Aucune question ne correspond aux filtres.</h3><p>Réinitialise les filtres ou installe de nouveaux contenus.</p></div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Question</th><th>Partie</th><th>Compétence</th><th>Statut</th><th>Résultats</th><th>Qualité</th><th></th></tr></thead>
              <tbody>
                {filteredQuestions.map((question) => {
                  const questionStats = question.code ? stats.get(question.code) : undefined;
                  const accuracy = questionStats?.total ? Math.round((questionStats.correct / questionStats.total) * 100) : null;
                  const openReports = reportCounts.get(question.code ?? "") ?? 0;
                  return (
                    <tr key={question.id}>
                      <td><strong>{question.code}</strong><span>{question.prompt}</span></td>
                      <td>Partie {question.part}<small>Difficulté {question.difficulty}/5</small></td>
                      <td>{relationLabel(question.skills, question.skill_id)}<small>{question.subskill}</small></td>
                      <td><span className={`admin-status admin-status-${question.status}`}>{statusLabel(question.status)}</span></td>
                      <td>{questionStats ? <><strong>{accuracy}%</strong><small>{questionStats.correct}/{questionStats.total} correctes</small></> : <span className="muted-copy">Pas encore jouée</span>}</td>
                      <td>{openReports > 0 ? <Link className="admin-quality-warning" href="/admin/reports?status=open">{openReports} signalement{openReports > 1 ? "s" : ""}</Link> : <span className="admin-import-valid">Aucun signalement</span>}</td>
                      <td><div className="admin-row-actions"><Link className="btn btn-secondary compact-btn" href={`/admin/questions/new?duplicate=${question.id}`}>Dupliquer</Link><Link className="btn btn-secondary compact-btn" href={`/admin/questions/${question.id}`}>Modifier</Link></div></td>
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
