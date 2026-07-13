import { redirect } from "next/navigation";
import { getCurrentUser, supabaseRest } from "@/lib/supabase-server";

type Goal = {
  current_score: number | null;
  target_score: number;
  exam_date: string | null;
  daily_minutes: number;
  level?: string | null;
  focus?: string | null;
};

type OnboardingProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function OnboardingPage({ searchParams }: OnboardingProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/onboarding");

  const params = await searchParams;
  let existingGoal: Goal | null = null;
  let databaseReady = true;

  try {
    const goals = await supabaseRest<Goal[]>(
      `user_goals?select=current_score,target_score,exam_date,daily_minutes,level,focus&user_id=eq.${user.id}&limit=1`
    );
    existingGoal = goals[0] ?? null;
  } catch {
    databaseReady = false;
  }

  return (
    <div className="container">
      <header className="page-head">
        <div className="eyebrow">Étape 1 sur 2</div>
        <h1>Construisons ton objectif.</h1>
        <p>Ces informations serviront à adapter la durée et la priorité de chaque séance.</p>
      </header>

      {params.error ? <div className="alert alert-error">{params.error}</div> : null}
      {!databaseReady ? (
        <div className="alert alert-warning">
          La connexion Supabase fonctionne, mais les tables ScoreSprint ne sont pas encore créées. Exécute les deux migrations SQL du dossier <code>supabase/migrations</code> dans le SQL Editor.
        </div>
      ) : null}

      <section className="card form-card">
        <form className="form-grid" action="/api/goals" method="post">
          <div className="field">
            <label htmlFor="current">Score actuel estimé</label>
            <input id="current" name="current_score" type="number" min="10" max="990" defaultValue={existingGoal?.current_score ?? 650} required />
            <small>Une approximation suffit.</small>
          </div>
          <div className="field">
            <label htmlFor="target">Score cible</label>
            <input id="target" name="target_score" type="number" min="10" max="990" defaultValue={existingGoal?.target_score ?? 850} required />
          </div>
          <div className="field">
            <label htmlFor="date">Date de l’examen</label>
            <input id="date" name="exam_date" type="date" defaultValue={existingGoal?.exam_date ?? ""} />
          </div>
          <div className="field">
            <label htmlFor="minutes">Temps quotidien</label>
            <select id="minutes" name="daily_minutes" defaultValue={String(existingGoal?.daily_minutes ?? 20)}>
              <option value="10">10 minutes</option>
              <option value="20">20 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="level">Niveau d’anglais</label>
            <select id="level" name="level" defaultValue={existingGoal?.level ?? "b1"}>
              <option value="a2">A2 — Élémentaire</option>
              <option value="b1">B1 — Intermédiaire</option>
              <option value="b2">B2 — Avancé</option>
              <option value="c1">C1 — Autonome</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="focus">Priorité ressentie</label>
            <select id="focus" name="focus" defaultValue={existingGoal?.focus ?? "unknown"}>
              <option value="unknown">Je ne sais pas encore</option>
              <option value="listening">Compréhension orale</option>
              <option value="grammar">Grammaire</option>
              <option value="vocabulary">Vocabulaire</option>
              <option value="speed">Gestion du temps</option>
            </select>
          </div>
          <div className="form-actions full-width">
            <button className="btn btn-primary" type="submit" disabled={!databaseReady}>Enregistrer et continuer</button>
          </div>
        </form>
      </section>
    </div>
  );
}
