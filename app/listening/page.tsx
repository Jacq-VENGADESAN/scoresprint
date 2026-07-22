import { randomUUID } from "node:crypto";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ListeningRunner } from "@/components/listening-runner";
import { buildListeningSession, type ListeningMode } from "@/lib/listening-bank";
import { getCurrentUser, supabaseRest } from "@/lib/supabase-server";

type ListeningRunRow = {
  id: string;
  mode: ListeningMode;
  total_questions: number;
  correct_answers: number;
  estimated_score: number | null;
  duration_ms: number;
  completed_at: string | null;
};

function modeFromParam(value: string | undefined): ListeningMode {
  if (value === "part1" || value === "part2") return value;
  return "mixed";
}

function modeLabel(mode: ListeningMode) {
  if (mode === "part1") return "Partie 1";
  if (mode === "part2") return "Partie 2";
  return "Mix 1 + 2";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export default async function ListeningPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/listening");
  const params = await searchParams;
  const mode = modeFromParam(params.mode);
  const questionCount = mode === "mixed" ? 12 : 10;
  const seed = `${user.id}-${mode}-${randomUUID()}`;
  const questions = buildListeningSession(mode, questionCount, seed);

  let recentRuns: ListeningRunRow[] = [];
  let listeningReady = true;
  try {
    recentRuns = await supabaseRest<ListeningRunRow[]>(`listening_runs?select=id,mode,total_questions,correct_answers,estimated_score,duration_ms,completed_at&user_id=eq.${user.id}&completed_at=not.is.null&order=completed_at.desc&limit=5`);
  } catch {
    listeningReady = false;
  }

  return (
    <div className="container focus-page listening-page">
      <header className="page-head page-head-compact listening-page-head">
        <div>
          <div className="eyebrow">Compréhension orale</div>
          <h1>Une nouvelle sélection à chaque séance d’écoute.</h1>
          <p>Les scripts sont originaux, la Partie 1 utilise de vraies photographies sous licence et l’ordre varie pour éviter une expérience identique entre utilisateurs.</p>
        </div>
        <div className="training-actions"><Link href="/lessons/part-2-indirect-responses" className="btn btn-secondary">Fiche réponses indirectes</Link><Link href="/dashboard" className="btn btn-secondary">Tableau de bord</Link></div>
      </header>

      <nav className="listening-mode-tabs" aria-label="Choisir un type de séance">
        <Link className={mode === "mixed" ? "active" : ""} href="/listening?mode=mixed"><strong>Mix 1 + 2</strong><span>4 photos + 8 questions-réponses</span></Link>
        <Link className={mode === "part1" ? "active" : ""} href="/listening?mode=part1"><strong>Partie 1</strong><span>10 photographies réelles</span></Link>
        <Link className={mode === "part2" ? "active" : ""} href="/listening?mode=part2"><strong>Partie 2</strong><span>10 questions-réponses</span></Link>
      </nav>

      {!listeningReady ? <div className="alert alert-warning">Les statistiques Listening ne sont pas encore accessibles. Exécute la migration dédiée.</div> : null}
      <ListeningRunner questions={questions} mode={mode} />

      {recentRuns.length > 0 ? (
        <section className="card listening-history-card">
          <div className="dashboard-section-head"><div><h2>Dernières séances d’écoute</h2><p>Le score affiché est une estimation interne sur 495 points.</p></div></div>
          <div className="listening-history-list">
            {recentRuns.map((run) => <div className="listening-history-row" key={run.id}><div><strong>{modeLabel(run.mode)}</strong><span>{run.completed_at ? formatDate(run.completed_at) : "—"} · {run.correct_answers}/{run.total_questions}</span></div><strong>{run.estimated_score ?? "—"}/495</strong></div>)}
          </div>
        </section>
      ) : null}
    </div>
  );
}
