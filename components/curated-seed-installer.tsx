"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  total: number;
  installed: number;
  remaining: number;
  part5: number;
  part6: number;
  part7: number;
};

type InstallResponse = {
  imported?: number;
  alreadyPresent?: number;
  total?: number;
  error?: string;
};

export function CuratedSeedInstaller({ total, installed, remaining, part5, part6, part7 }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function install() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/questions/seed", { method: "POST" });
      const body = await response.json() as InstallResponse;
      if (!response.ok) throw new Error(body.error ?? "Installation impossible.");
      router.push(`/admin/questions?seeded=${body.imported ?? 0}`);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Installation impossible.");
    } finally {
      setLoading(false);
    }
  }

  const complete = remaining === 0;
  const progress = total > 0 ? Math.round((installed / total) * 100) : 0;

  return (
    <section className="card admin-seed-card">
      <div className="admin-seed-progress" aria-label={`${progress}% de la banque installée`}>
        <span style={{ width: `${progress}%` }} />
      </div>

      <div className="admin-seed-status">
        <div>
          <span className="eyebrow">Banque originale ScoreSprint</span>
          <h2>{complete ? "Les 200 questions sont installées." : `${remaining} questions prêtes à être ajoutées.`}</h2>
          <p className="muted-copy">
            {installed}/{total} questions du lot sont déjà présentes. Une nouvelle exécution ignore automatiquement les codes existants.
          </p>
        </div>
        <strong>{progress}%</strong>
      </div>

      <div className="admin-seed-breakdown">
        <div><span>Partie 5</span><strong>{part5}</strong><small>Phrases à compléter</small></div>
        <div><span>Partie 6</span><strong>{part6}</strong><small>10 textes à trous</small></div>
        <div><span>Partie 7</span><strong>{part7}</strong><small>14 documents de lecture</small></div>
      </div>

      <div className="notice">
        Les questions sont publiées directement, avec quatre options, une correction, une explication et un piège. Elles rejoignent les séances adaptatives sans modifier le code ensuite.
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}

      <div className="admin-form-actions">
        <button className="btn btn-primary" type="button" onClick={install} disabled={loading || complete}>
          {loading ? "Installation des questions…" : complete ? "Banque déjà installée" : `Installer les ${remaining} questions manquantes`}
        </button>
        <button className="btn btn-secondary" type="button" onClick={() => router.push("/admin/questions")}>Retour aux questions</button>
      </div>
    </section>
  );
}
