import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, supabaseRest } from "@/lib/supabase-server";

type ErrorItem = {
  question_code: string;
  skill_id: string;
  subskill: string;
  title: string;
  error_count: number;
  success_streak: number;
  next_review_at: string | null;
  last_attempt_at: string;
};

type SkillRow = {
  id: string;
  label: string;
};

function reviewLabel(value: string | null) {
  if (!value) return "À revoir maintenant";
  const date = new Date(value);
  const today = new Date();
  if (date.getTime() <= today.getTime()) return "À revoir maintenant";
  return `À revoir le ${new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(date)}`;
}

export default async function ErrorsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/errors");

  let errors: ErrorItem[] = [];
  let skillRows: SkillRow[] = [];
  let databaseReady = true;

  try {
    [errors, skillRows] = await Promise.all([
      supabaseRest<ErrorItem[]>(
        `user_error_items?select=question_code,skill_id,subskill,title,error_count,success_streak,next_review_at,last_attempt_at&user_id=eq.${user.id}&resolved_at=is.null&order=next_review_at.asc.nullsfirst`
      ),
      supabaseRest<SkillRow[]>("skills?select=id,label")
    ]);
  } catch {
    databaseReady = false;
  }

  const labels = new Map(skillRows.map((skill) => [skill.id, skill.label]));
  const dueCount = errors.filter((item) => !item.next_review_at || new Date(item.next_review_at).getTime() <= Date.now()).length;

  return (
    <div className="container">
      <header className="page-head">
        <div className="eyebrow">Carnet d’erreurs</div>
        <h1>Ce que tu dois revoir — pas tout le cours.</h1>
        <p>Chaque erreur revient selon sa date de révision. Trois réussites consécutives permettent de la considérer comme maîtrisée.</p>
      </header>

      {!databaseReady ? (
        <div className="alert alert-warning">La migration de l’entraînement n’est pas encore accessible dans Supabase.</div>
      ) : null}

      {errors.length > 0 ? (
        <>
          <section className="card error-overview">
            <div>
              <div className="eyebrow">Révision espacée</div>
              <h2>{dueCount > 0 ? `${dueCount} erreur${dueCount > 1 ? "s" : ""} à revoir aujourd’hui` : "Tout est à jour pour aujourd’hui"}</h2>
              <p className="muted-copy">Les autres notions réapparaîtront automatiquement au moment prévu.</p>
            </div>
            <Link href="/practice?mode=errors" className="btn btn-primary">Réviser mes erreurs</Link>
          </section>

          <div className="error-list">
            {errors.map((item) => (
              <article className="card error-row" key={item.question_code}>
                <div>
                  <div className="question-meta">
                    <span className="badge">{labels.get(item.skill_id) ?? item.skill_id}</span>
                    <span className={`review-status ${!item.next_review_at || new Date(item.next_review_at).getTime() <= Date.now() ? "review-status-due" : ""}`}>
                      {reviewLabel(item.next_review_at)}
                    </span>
                  </div>
                  <h2 style={{ marginBottom: 0 }}>{item.title}</h2>
                  <p>{item.subskill} · série actuelle : {item.success_streak}/3 réussite{item.success_streak > 1 ? "s" : ""}</p>
                </div>
                <div className="error-count">{item.error_count} erreur{item.error_count > 1 ? "s" : ""}</div>
              </article>
            ))}
          </div>
        </>
      ) : databaseReady ? (
        <section className="card empty-state">
          <div className="eyebrow">Carnet vide</div>
          <h2>Aucune erreur active pour le moment.</h2>
          <p className="muted-copy">Commence une séance : les réponses incorrectes apparaîtront ici automatiquement.</p>
          <Link href="/practice" className="btn btn-primary">Démarrer une séance</Link>
        </section>
      ) : null}
    </div>
  );
}
