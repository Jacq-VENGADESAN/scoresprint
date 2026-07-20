import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminUser } from "@/lib/admin";
import { supabaseAdminRest } from "@/lib/supabase-admin";
import { getCurrentUser } from "@/lib/supabase-server";

type EventRow = { anonymous_id: string; event_name: string; path: string | null; properties: Record<string, unknown>; created_at: string };
type WaitlistRow = { id: string; email: string; plan_interest: string; goal_score: number | null; exam_date: string | null; source: string; created_at: string };
type FeedbackRow = { id: string; rating: number; category: string; message: string; email: string | null; path: string | null; status: string; created_at: string };

function percentage(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export default async function AdminBetaPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/admin/beta");
  if (!isAdminUser(user)) redirect("/dashboard");

  const since = new Date(Date.now() - 30 * 86_400_000).toISOString();
  let events: EventRow[] = [];
  let waitlist: WaitlistRow[] = [];
  let feedback: FeedbackRow[] = [];
  let ready = true;
  try {
    [events, waitlist, feedback] = await Promise.all([
      supabaseAdminRest<EventRow[]>(`product_events?select=anonymous_id,event_name,path,properties,created_at&created_at=gte.${encodeURIComponent(since)}&order=created_at.desc&limit=5000`),
      supabaseAdminRest<WaitlistRow[]>("premium_waitlist?select=id,email,plan_interest,goal_score,exam_date,source,created_at&order=created_at.desc&limit=100"),
      supabaseAdminRest<FeedbackRow[]>("beta_feedback?select=id,rating,category,message,email,path,status,created_at&order=created_at.desc&limit=100")
    ]);
  } catch {
    ready = false;
  }

  const count = (name: string) => events.filter((event) => event.event_name === name).length;
  const visitors = new Set(events.map((event) => event.anonymous_id)).size;
  const pageViews = count("page_view");
  const demoStarts = count("demo_started");
  const demoCompletions = count("demo_completed");
  const signupIntents = count("signup_intent");
  const averageRating = feedback.length ? (feedback.reduce((sum, item) => sum + item.rating, 0) / feedback.length).toFixed(1) : "—";
  const pageCounts = new Map<string, number>();
  events.filter((event) => event.event_name === "page_view").forEach((event) => pageCounts.set(event.path ?? "Inconnu", (pageCounts.get(event.path ?? "Inconnu") ?? 0) + 1));
  const popularPages = [...pageCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);

  return (
    <div className="container beta-admin-page">
      <header className="page-head">
        <div>
          <span className="eyebrow">Administration · Validation produit</span>
          <h1>Comprendre ce que les bêta-testeurs utilisent réellement.</h1>
          <p>Les données couvrent les 30 derniers jours. Elles sont internes, sans publicité et sans stockage de l’adresse IP brute.</p>
        </div>
        <div className="training-actions"><Link className="btn btn-secondary" href="/admin/launch">Pré-lancement</Link><Link className="btn btn-secondary" href="/feedback">Voir le formulaire</Link></div>
      </header>

      {!ready ? <div className="alert alert-warning">Les tables de validation produit sont absentes. Exécute la migration `20260720120000_public_beta_validation.sql`.</div> : null}

      <section className="beta-metric-grid" aria-label="Indicateurs de la bêta">
        <article><span>Visiteurs mesurés</span><strong>{visitors}</strong><small>{pageViews} pages vues</small></article>
        <article><span>Démos commencées</span><strong>{demoStarts}</strong><small>{percentage(demoStarts, visitors)} % des visiteurs</small></article>
        <article><span>Démos terminées</span><strong>{demoCompletions}</strong><small>{percentage(demoCompletions, demoStarts)} % des démarrages</small></article>
        <article><span>Intentions d’inscription</span><strong>{signupIntents}</strong><small>{percentage(signupIntents, demoCompletions)} % des démos terminées</small></article>
        <article><span>Liste d’attente</span><strong>{waitlist.length}</strong><small>Demandes enregistrées</small></article>
        <article><span>Note moyenne</span><strong>{averageRating}/5</strong><small>{feedback.length} retours</small></article>
      </section>

      <div className="beta-admin-grid">
        <section className="card dashboard-section">
          <div className="dashboard-section-head"><div><h2>Pages les plus consultées</h2><p>Permet de repérer les écrans compris ou ignorés.</p></div></div>
          <div className="beta-ranking">{popularPages.length ? popularPages.map(([path, total], index) => <div key={path}><span>{index + 1}</span><code>{path}</code><strong>{total}</strong></div>) : <p className="muted-copy">Aucune visite enregistrée.</p>}</div>
        </section>

        <section className="card dashboard-section">
          <div className="dashboard-section-head"><div><h2>Liste d’attente récente</h2><p>Ne contacte que les personnes ayant donné leur accord.</p></div><span className="badge">{waitlist.length}</span></div>
          <div className="beta-table-list">{waitlist.slice(0, 12).map((item) => <div key={item.id}><div><strong>{item.email}</strong><span>{item.plan_interest} · objectif {item.goal_score ?? "—"} · examen {item.exam_date ?? "—"}</span></div><small>{formatDate(item.created_at)}</small></div>)}{waitlist.length === 0 ? <p className="muted-copy">Aucune inscription pour le moment.</p> : null}</div>
        </section>
      </div>

      <section className="card dashboard-section beta-feedback-admin">
        <div className="dashboard-section-head"><div><h2>Derniers retours</h2><p>Priorise les problèmes répétés et les blocages empêchant de terminer une séance.</p></div><span className="badge">{feedback.length}</span></div>
        <div className="beta-feedback-list">{feedback.slice(0, 20).map((item) => <article key={item.id}><div className="beta-feedback-meta"><strong>{"★".repeat(item.rating)}{"☆".repeat(5 - item.rating)}</strong><span>{item.category}</span><span>{item.status}</span><small>{formatDate(item.created_at)}</small></div><p>{item.message}</p><footer>{item.email ? <span>{item.email}</span> : <span>Anonyme</span>}<code>{item.path ?? "—"}</code></footer></article>)}{feedback.length === 0 ? <p className="muted-copy">Aucun retour enregistré.</p> : null}</div>
      </section>
    </div>
  );
}
