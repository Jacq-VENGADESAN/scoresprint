import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AdminReportActions } from "@/components/admin-report-actions";
import { isAdminUser } from "@/lib/admin";
import { getManagedQuestions } from "@/lib/database-questions";
import { supabaseAdminRest } from "@/lib/supabase-admin";
import { getCurrentUser } from "@/lib/supabase-server";

type ReportRow = {
  id: string;
  user_id: string;
  question_code: string;
  category: string;
  details: string | null;
  selected_option: string | null;
  status: "open" | "resolved" | "dismissed";
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
};

const CATEGORY_LABELS: Record<string, string> = {
  ambiguous: "Question ambiguë",
  incorrect_answer: "Bonne réponse incorrecte",
  typo: "Faute ou affichage",
  explanation: "Explication insuffisante",
  other: "Autre"
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default async function AdminReportsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/admin/reports");
  if (!isAdminUser(user)) notFound();

  const params = await searchParams;
  const selectedStatus = ["open", "resolved", "dismissed", "all"].includes(params.status ?? "") ? params.status! : "open";
  const statusFilter = selectedStatus === "all" ? "" : `&status=eq.${selectedStatus}`;
  const [reports, questions] = await Promise.all([
    supabaseAdminRest<ReportRow[]>(`question_reports?select=id,user_id,question_code,category,details,selected_option,status,created_at,reviewed_at,reviewed_by${statusFilter}&order=created_at.desc&limit=500`),
    getManagedQuestions()
  ]);
  const questionByCode = new Map(questions.map((question) => [question.code, question]));

  return (
    <div className="container admin-page">
      <header className="page-head admin-page-head">
        <div>
          <div className="eyebrow">Contrôle qualité</div>
          <h1>Relis les questions signalées par les utilisateurs.</h1>
          <p>Un signalement ne retire pas automatiquement une question. Vérifie le contenu, corrige-le dans la banque puis marque le rapport comme traité.</p>
        </div>
        <Link className="btn btn-secondary" href="/admin/questions">Retour aux questions</Link>
      </header>

      <nav className="admin-filter-tabs" aria-label="Filtrer les signalements">
        {[["open", "Ouverts"], ["resolved", "Corrigés"], ["dismissed", "Non retenus"], ["all", "Tous"]].map(([value, label]) => (
          <Link className={selectedStatus === value ? "active" : ""} href={`/admin/reports?status=${value}`} key={value}>{label}</Link>
        ))}
      </nav>

      <section className="card admin-table-card">
        <div className="admin-table-head"><div><h2>{reports.length} signalement{reports.length > 1 ? "s" : ""}</h2><p className="muted-copy">Les signalements les plus récents apparaissent en premier.</p></div></div>
        {reports.length === 0 ? (
          <div className="admin-empty-state"><h3>Aucun signalement dans cette catégorie.</h3><p>La banque ne contient actuellement aucun problème déclaré avec ce statut.</p></div>
        ) : (
          <div className="admin-report-list">
            {reports.map((report) => {
              const question = questionByCode.get(report.question_code);
              return (
                <article className="admin-report-card" key={report.id}>
                  <div className="admin-report-head">
                    <div><span className={`admin-status admin-report-status-${report.status}`}>{report.status === "open" ? "Ouvert" : report.status === "resolved" ? "Corrigé" : "Non retenu"}</span><strong>{CATEGORY_LABELS[report.category] ?? report.category}</strong></div>
                    <time>{formatDate(report.created_at)}</time>
                  </div>
                  <h2>{report.question_code}</h2>
                  <p>{question?.prompt ?? "Question historique ou intégrée au code."}</p>
                  {report.details ? <blockquote>{report.details}</blockquote> : <p className="muted-copy">Aucun détail fourni.</p>}
                  <div className="admin-report-meta">
                    <span>Utilisateur : {report.user_id.slice(0, 8)}…</span>
                    <span>Réponse sélectionnée : {report.selected_option ?? "—"}</span>
                    {report.reviewed_by ? <span>Traité par {report.reviewed_by}</span> : null}
                  </div>
                  <div className="admin-report-footer">
                    {question ? <Link className="btn btn-secondary compact-btn" href={`/admin/questions/${question.id}`}>Ouvrir la question</Link> : <span className="muted-copy">Question non gérée dans Supabase</span>}
                    <AdminReportActions reportId={report.id} disabled={report.status !== "open"} />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
