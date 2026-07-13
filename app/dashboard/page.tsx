import Link from "next/link";
import { redirect } from "next/navigation";
import { ProgressBar } from "@/components/progress-bar";
import { StatCard } from "@/components/stat-card";
import { getCurrentUser, supabaseRest } from "@/lib/supabase-server";

type Goal = {
  current_score: number | null;
  target_score: number;
  exam_date: string | null;
  daily_minutes: number;
};

const skills: Array<[string, number]> = [
  ["Temps verbaux", 42],
  ["Inférences", 38],
  ["Prépositions", 55],
  ["Vocabulaire professionnel", 71]
];

function daysUntil(date: string | null) {
  if (!date) return null;
  const today = new Date();
  const target = new Date(`${date}T12:00:00`);
  return Math.max(0, Math.ceil((target.getTime() - today.getTime()) / 86_400_000));
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/dashboard");

  let goal: Goal | null = null;
  let databaseReady = true;
  try {
    const goals = await supabaseRest<Goal[]>(
      `user_goals?select=current_score,target_score,exam_date,daily_minutes&user_id=eq.${user.id}&limit=1`
    );
    goal = goals[0] ?? null;
  } catch {
    databaseReady = false;
  }

  if (databaseReady && !goal) redirect("/onboarding");

  const currentScore = goal?.current_score ?? 650;
  const targetScore = goal?.target_score ?? 850;
  const estimateLow = Math.min(990, currentScore + 35);
  const estimateHigh = Math.min(990, currentScore + 85);
  const progress = Math.max(0, Math.min(100, Math.round((currentScore / targetScore) * 100)));
  const remainingDays = daysUntil(goal?.exam_date ?? null);
  const displayName = user.user_metadata?.display_name ?? user.email?.split("@")[0] ?? "toi";

  return (
    <div className="container">
      <header className="page-head">
        <div className="eyebrow">Tableau de bord</div>
        <h1>Bonjour {displayName}, voilà ce qui mérite ton temps aujourd’hui.</h1>
        <p>Ton objectif est maintenant chargé depuis ton compte Supabase. Les maîtrises seront alimentées par tes prochaines tentatives.</p>
      </header>

      {!databaseReady ? (
        <div className="alert alert-warning">
          Les variables Supabase sont bien présentes, mais les tables n’existent pas encore. Exécute les migrations SQL avant d’utiliser le tableau de bord.
        </div>
      ) : null}

      <div className="dashboard-grid">
        <div style={{ display: "grid", gap: 22 }}>
          <section className="card panel">
            <div className="panel-title">
              <h2>Progression vers {targetScore}</h2>
              <span className="badge">{remainingDays === null ? "Date à définir" : `${remainingDays} jours restants`}</span>
            </div>
            <div className="stats">
              <StatCard label="Score estimé" value={`${estimateLow}–${estimateHigh}`} detail="Fourchette provisoire" />
              <StatCard label="Objectif" value={String(targetScore)} detail={`Départ déclaré : ${currentScore}`} />
              <StatCard label="Temps quotidien" value={`${goal?.daily_minutes ?? 20} min`} detail="Programme personnalisé" />
            </div>
            <div style={{ marginTop: 22 }}><ProgressBar value={progress} /></div>
          </section>

          <section className="card panel">
            <div className="panel-title"><h2>Séance personnalisée</h2><span style={{ color: "var(--muted)" }}>{goal?.daily_minutes ?? 20} minutes</span></div>
            <div className="session-list">
              <div className="session-item"><span className="session-time">5 min</span><div><strong>Révision des erreurs</strong><br /><span style={{ color: "var(--muted)" }}>Répétition espacée</span></div></div>
              <div className="session-item"><span className="session-time">8 min</span><div><strong>Temps verbaux</strong><br /><span style={{ color: "var(--muted)" }}>Priorité actuelle</span></div></div>
              <div className="session-item"><span className="session-time">7 min</span><div><strong>Partie 5 chronométrée</strong><br /><span style={{ color: "var(--muted)" }}>Objectif vitesse</span></div></div>
            </div>
            <Link className="btn btn-primary" href="/practice">Démarrer maintenant</Link>
          </section>
        </div>

        <aside style={{ display: "grid", gap: 22, alignContent: "start" }}>
          <section className="card panel">
            <div className="panel-title"><h3>Maîtrise</h3></div>
            {skills.map(([label, value]) => (
              <div className="skill" key={label}>
                <div className="skill-top"><span>{label}</span><strong>{value}%</strong></div>
                <ProgressBar value={value} />
              </div>
            ))}
          </section>
          <section className="card panel">
            <div className="panel-title"><h3>Ton objectif</h3></div>
            <div className="notice">Ton objectif et ton temps quotidien sont sauvegardés. La prochaine phase enregistrera chaque réponse pour personnaliser réellement ces priorités.</div>
            <Link href="/onboarding" className="btn btn-ghost" style={{ marginTop: 14 }}>Modifier mon objectif →</Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
