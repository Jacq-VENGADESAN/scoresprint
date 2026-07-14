"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { parseQuestionCsv, type QuestionCsvParseResult } from "@/lib/question-csv";

const EMPTY_RESULT: QuestionCsvParseResult = { rows: [], fatalErrors: [] };

type ServerCheck = {
  duplicateCodes?: string[];
  imported?: number;
  error?: string;
};

export function AdminQuestionImport() {
  const router = useRouter();
  const [filename, setFilename] = useState("");
  const [result, setResult] = useState<QuestionCsvParseResult>(EMPTY_RESULT);
  const [duplicateCodes, setDuplicateCodes] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validInputs = useMemo(
    () => result.rows.filter((row) => row.input && row.errors.length === 0).map((row) => row.input!),
    [result]
  );
  const localErrorCount = result.rows.filter((row) => row.errors.length > 0).length;
  const ready = checked
    && result.rows.length > 0
    && validInputs.length === result.rows.length
    && duplicateCodes.length === 0
    && result.fatalErrors.length === 0;

  async function checkAgainstDatabase(inputs: typeof validInputs) {
    if (inputs.length === 0) return;
    setLoading(true);
    setError(null);
    setChecked(false);
    try {
      const response = await fetch("/api/admin/questions/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: inputs, dryRun: true })
      });
      const payload = await response.json() as ServerCheck;
      if (!response.ok) throw new Error(payload.error ?? "Vérification impossible.");
      setDuplicateCodes(payload.duplicateCodes ?? []);
      setChecked(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Vérification impossible.");
    } finally {
      setLoading(false);
    }
  }

  async function selectFile(file: File | null) {
    setFilename(file?.name ?? "");
    setDuplicateCodes([]);
    setChecked(false);
    setError(null);
    if (!file) {
      setResult(EMPTY_RESULT);
      return;
    }
    if (file.size > 2_000_000) {
      setResult({ rows: [], fatalErrors: ["Le fichier dépasse la limite de 2 Mo."] });
      return;
    }
    const parsed = parseQuestionCsv(await file.text());
    setResult(parsed);
    const inputs = parsed.rows.filter((row) => row.input && row.errors.length === 0).map((row) => row.input!);
    if (parsed.fatalErrors.length === 0 && inputs.length === parsed.rows.length && inputs.length > 0) {
      await checkAgainstDatabase(inputs);
    }
  }

  async function importQuestions() {
    if (!ready || loading) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/questions/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: validInputs, dryRun: false })
      });
      const payload = await response.json() as ServerCheck;
      if (!response.ok) throw new Error(payload.error ?? "Import impossible.");
      router.push(`/admin/questions?imported=${payload.imported ?? validInputs.length}`);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Import impossible.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-import-stack">
      <section className="card admin-import-card">
        <div>
          <div className="eyebrow">Fichier source</div>
          <h2>Importe jusqu’à 500 questions à la fois</h2>
          <p className="muted-copy">Utilise le modèle fourni. Les virgules, retours à la ligne et guillemets sont acceptés lorsque la cellule est entourée de guillemets.</p>
        </div>
        <div className="admin-import-actions">
          <a className="btn btn-secondary" href="/api/admin/questions/template">Télécharger le modèle CSV</a>
          <label className="btn btn-primary admin-file-button">
            Choisir un fichier
            <input type="file" accept=".csv,text/csv" onChange={(event) => void selectFile(event.target.files?.[0] ?? null)} />
          </label>
        </div>
        {filename ? <div className="notice">Fichier sélectionné : <strong>{filename}</strong></div> : null}
      </section>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {result.fatalErrors.map((message) => <div className="alert alert-error" key={message}>{message}</div>)}

      {result.rows.length > 0 ? (
        <>
          <section className="admin-summary-grid">
            <div className="card admin-summary-card"><span>Lignes détectées</span><strong>{result.rows.length}</strong><small>Maximum autorisé : 500</small></div>
            <div className="card admin-summary-card"><span>Valides localement</span><strong>{validInputs.length}</strong><small>Structure et champs contrôlés</small></div>
            <div className="card admin-summary-card"><span>Erreurs CSV</span><strong>{localErrorCount}</strong><small>À corriger avant import</small></div>
            <div className="card admin-summary-card"><span>Codes déjà utilisés</span><strong>{duplicateCodes.length}</strong><small>Vérifiés dans Supabase</small></div>
          </section>

          {duplicateCodes.length > 0 ? (
            <div className="alert alert-error">Codes déjà présents dans la banque : {duplicateCodes.join(", ")}.</div>
          ) : checked ? (
            <div className="alert alert-success">Tous les codes sont disponibles dans Supabase.</div>
          ) : null}

          <section className="card admin-table-card">
            <div className="admin-table-head">
              <div><h2>Aperçu avant import</h2><p className="muted-copy">Les questions importées conservent le statut indiqué dans le CSV. Utilise « draft » pour une relecture avant publication.</p></div>
              <button className="btn btn-primary" type="button" disabled={!ready || loading} onClick={() => void importQuestions()}>
                {loading ? "Traitement…" : `Importer ${validInputs.length} question${validInputs.length > 1 ? "s" : ""}`}
              </button>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Ligne</th><th>Code</th><th>Question</th><th>Classement</th><th>Statut</th><th>Contrôle</th></tr></thead>
                <tbody>
                  {result.rows.slice(0, 150).map((row) => (
                    <tr key={row.rowNumber}>
                      <td>{row.rowNumber}</td>
                      <td><strong>{row.input?.code ?? "—"}</strong></td>
                      <td><span>{row.input?.prompt ?? "Ligne illisible"}</span></td>
                      <td>{row.input ? <>Partie {row.input.part}<small>{row.input.skillId} · difficulté {row.input.difficulty}/5</small></> : "—"}</td>
                      <td>{row.input?.status ?? "—"}</td>
                      <td>{row.errors.length > 0 ? <span className="admin-import-error">{row.errors.join(" ")}</span> : duplicateCodes.includes(row.input?.code ?? "") ? <span className="admin-import-error">Code existant</span> : <span className="admin-import-valid">Valide</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {result.rows.length > 150 ? <p className="muted-copy admin-import-limit-note">Aperçu limité aux 150 premières lignes. Les {result.rows.length} lignes seront tout de même validées.</p> : null}
          </section>
        </>
      ) : null}

      <div className="admin-form-actions"><Link className="btn btn-secondary" href="/admin/questions">Retour à la banque</Link></div>
    </div>
  );
}
