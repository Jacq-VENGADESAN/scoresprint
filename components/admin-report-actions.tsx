"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminReportActions({ reportId, disabled = false }: { reportId: string; disabled?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function update(status: "resolved" | "dismissed") {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Mise à jour impossible.");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Mise à jour impossible.");
    } finally {
      setLoading(false);
    }
  }

  if (disabled) return <span className="muted-copy">Traité</span>;
  return (
    <div className="admin-report-actions">
      {error ? <small className="admin-import-error">{error}</small> : null}
      <button className="btn btn-primary compact-btn" type="button" disabled={loading} onClick={() => void update("resolved")}>Corrigé</button>
      <button className="btn btn-secondary compact-btn" type="button" disabled={loading} onClick={() => void update("dismissed")}>Non retenu</button>
    </div>
  );
}
