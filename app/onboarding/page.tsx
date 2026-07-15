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

function CheckIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m4 10 3.5 3.5L16 5.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

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
    <div className="container onboarding-page">
      <header className="page-head page-head-compact">
        <div className="eyebrow">Configuration initiale</div>
        <h1>Donne un cap à ta préparation.</h1>
        <p>Quelques informations suffisent pour calibrer la durée, la difficulté et l’ordre de tes séances.</p>
      </header>

      {params.error ? <div className="alert alert-error">{params.error}</div> : null}
      {!databaseReady ? (
        <div className="alert alert-warning">
          La connexion Supabase fonctionne, mais les tables ScoreSprint ne sont pas encore créées. Exécute les migrations SQL avant de continuer.
        </div>
      ) : null}

      <div className="onboarding-layout">
        <aside className="card onboarding-aside">
          <div className="onboarding-step"><span>1</span>Objectif et rythme</div>
          <h2>Pas besoin de connaître ton niveau au point près.</h2>
          <p>Le diagnostic de l’étape suivante remplacera progressivement tes estimations par des données réelles.</p>
          <div className="onboarding-checklist">
            <div className="onboarding-check"><CheckIcon /><span>Une approximation du score actuel suffit.</span></div>
            <div className="onboarding-check"><CheckIcon /><span>Tu pourras modifier ces informations plus tard.</span></div>
            <div className="onboarding-check"><CheckIcon /><span>Le diagnostic reste nécessaire pour personnaliser les séances.</span></div>
          </div>
        </aside>

        <section className="card form-card onboarding-form-card">
          <form action="/api/goals" method="post">
            <div className="form-section">
              <div className="form-section-head">
                <h2>Ton objectif</h2>
                <p>Le score cible et la date servent à déterminer l’intensité du programme.</p>
              </div>
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="current">Score actuel estimé</label>
                  <input id="current" name="current_score" type="number" min="10" max="990" step="5" defaultValue={existingGoal?.current_score ?? 650} required />
                  <small>Une valeur approximative suffit.</small>
                </div>
                <div className="field">
                  <label htmlFor="target">Score cible</label>
                  <input id="target" name="target_score" type="number" min="10" max="990" step="5" defaultValue={existingGoal?.target_score ?? 850} required />
                  <small>Choisis un objectif ambitieux mais réaliste.</small>
                </div>
                <div className="field full-width">
                  <label htmlFor="date">Date prévue de l’examen</label>
                  <input id="date" name="exam_date" type="date" defaultValue={existingGoal?.exam_date ?? ""} />
                  <small>Facultatif. Tu peux la définir plus tard.</small>
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="form-section-head">
                <h2>Ton rythme</h2>
                <p>ScoreSprint adaptera le nombre de questions au temps que tu peux vraiment tenir chaque jour.</p>
              </div>
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="minutes">Temps quotidien réaliste</label>
                  <select id="minutes" name="daily_minutes" defaultValue={String(existingGoal?.daily_minutes ?? 20)}>
                    <option value="10">10 minutes — rythme léger</option>
                    <option value="20">20 minutes — recommandé</option>
                    <option value="30">30 minutes — rythme soutenu</option>
                    <option value="45">45 minutes — préparation intensive</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="level">Niveau ressenti</label>
                  <select id="level" name="level" defaultValue={existingGoal?.level ?? "b1"}>
                    <option value="a2">A2 — Élémentaire</option>
                    <option value="b1">B1 — Intermédiaire</option>
                    <option value="b2">B2 — Avancé</option>
                    <option value="c1">C1 — Autonome</option>
                  </select>
                </div>
                <div className="field full-width">
                  <label htmlFor="focus">Difficulté principale ressentie</label>
                  <select id="focus" name="focus" defaultValue={existingGoal?.focus ?? "unknown"}>
                    <option value="unknown">Je préfère laisser le diagnostic décider</option>
                    <option value="listening">Compréhension orale</option>
                    <option value="grammar">Grammaire</option>
                    <option value="vocabulary">Vocabulaire professionnel</option>
                    <option value="speed">Gestion du temps</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button className="btn btn-primary" type="submit" disabled={!databaseReady}>Enregistrer et lancer le diagnostic</button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
