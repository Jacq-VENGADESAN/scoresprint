"use client";

import { useState } from "react";
import type { CoachExplanation, CoachPlan } from "@/lib/coach";

type CoachErrorItem = {
  questionCode: string;
  title: string;
  subskill: string;
  errorCount: number;
};

type Coach90ClientProps = {
  initialPlan: CoachPlan | null;
  errors: CoachErrorItem[];
  configured: boolean;
  initialRemaining: number;
};

export function Coach90Client({ initialPlan, errors, configured, initialRemaining }: Coach90ClientProps) {
  const [plan, setPlan] = useState<CoachPlan | null>(initialPlan);
  const [remaining, setRemaining] = useState(initialRemaining);
  const [planStatus, setPlanStatus] = useState<"idle" | "loading" | "error">("idle");
  const [planError, setPlanError] = useState("");
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<CoachExplanation | null>(null);
  const [explanationError, setExplanationError] = useState("");

  async function generatePlan() {
    setPlanStatus("loading");
    setPlanError("");
    try {
      const response = await fetch("/api/coach/plan", { method: "POST" });
      const payload = (await response.json()) as { plan?: CoachPlan; remaining?: number; error?: string };
      if (!response.ok || !payload.plan) throw new Error(payload.error ?? "Le programme n’a pas pu être généré.");
      setPlan(payload.plan);
      if (typeof payload.remaining === "number") setRemaining(payload.remaining);
      setPlanStatus("idle");
    } catch (error) {
      setPlanStatus("error");
      setPlanError(error instanceof Error ? error.message : "Le programme n’a pas pu être généré.");
    }
  }

  async function explain(questionCode: string) {
    setActiveQuestion(questionCode);
    setExplanation(null);
    setExplanationError("");
    try {
      const response = await fetch("/api/coach/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionCode })
      });
      const payload = (await response.json()) as { explanation?: CoachExplanation; remaining?: number; error?: string };
      if (!response.ok || !payload.explanation) throw new Error(payload.error ?? "L’explication n’a pas pu être générée.");
      setExplanation(payload.explanation);
      if (typeof payload.remaining === "number") setRemaining(payload.remaining);
    } catch (error) {
      setExplanationError(error instanceof Error ? error.message : "L’explication n’a pas pu être générée.");
    }
  }

  return (
    <div className="coach-workspace">
      <section className="card coach-plan-card">
        <div className="coach-section-head">
          <div>
            <span className="eyebrow">Programme de la semaine</span>
            <h2>{plan ? plan.headline : "Construis un plan à partir de tes vraies données."}</h2>
            <p>{plan ? plan.diagnosis : "Le coach analyse ton objectif, tes maîtrises, tes erreurs non résolues et tes réponses récentes."}</p>
          </div>
          <div className="coach-credit-box"><strong>{remaining}</strong><span>crédits IA aujourd’hui</span></div>
        </div>

        {!configured ? <div className="alert alert-warning">L’administrateur doit encore configurer la clé OpenAI avant d’activer le coach.</div> : null}
        {planStatus === "error" ? <div className="alert alert-error">{planError}</div> : null}
        <button className="btn btn-primary" type="button" onClick={() => void generatePlan()} disabled={!configured || planStatus === "loading" || remaining < 3}>
          {planStatus === "loading" ? "Analyse en cours…" : plan ? "Régénérer mon programme" : "Générer mon programme de 7 jours"}
        </button>
        <p className="coach-cost-note">Un programme utilise 3 crédits. Une explication utilise 1 crédit. Les crédits sont renouvelés chaque jour.</p>

        {plan ? (
          <div className="coach-plan-content">
            <div className="coach-goal"><span>Objectif de la semaine</span><strong>{plan.weeklyGoal}</strong></div>
            <div className="coach-priorities">
              {plan.prioritySkills.map((priority) => <article key={`${priority.skill}-${priority.reason}`}><strong>{priority.skill}</strong><p>{priority.reason}</p></article>)}
            </div>
            <div className="coach-days">
              {plan.days.map((day) => (
                <article key={`${day.day}-${day.focus}`}>
                  <div><span>{day.day}</span><strong>{day.minutes} min</strong></div>
                  <h3>{day.focus}</h3>
                  <ul>{day.activities.map((activity) => <li key={activity}>{activity}</li>)}</ul>
                  <p><strong>Validation :</strong> {day.successCheck}</p>
                </article>
              ))}
            </div>
            <div className="coach-summary-grid">
              <div><span>Stratégie examen</span><p>{plan.examStrategy}</p></div>
              <div><span>Mot du coach</span><p>{plan.encouragement}</p></div>
            </div>
          </div>
        ) : null}
      </section>

      <section className="card coach-errors-card">
        <div className="coach-section-head">
          <div><span className="eyebrow">Explications adaptées</span><h2>Choisis une erreur récente.</h2><p>Le coach reformule la correction vérifiée sans modifier la bonne réponse enregistrée par Aptileo.</p></div>
        </div>
        {errors.length === 0 ? <div className="empty-state"><h3>Aucune erreur non résolue.</h3><p>Termine une séance Reading pour alimenter cette section.</p></div> : (
          <div className="coach-error-list">
            {errors.map((item) => (
              <button key={item.questionCode} type="button" className={activeQuestion === item.questionCode ? "active" : ""} onClick={() => void explain(item.questionCode)} disabled={!configured || remaining < 1}>
                <span>{item.subskill}</span><strong>{item.title}</strong><small>{item.errorCount} erreur{item.errorCount > 1 ? "s" : ""} · obtenir une explication</small>
              </button>
            ))}
          </div>
        )}

        {activeQuestion && !explanation && !explanationError ? <div className="coach-loading">Le coach prépare une explication ciblée…</div> : null}
        {explanationError ? <div className="alert alert-error">{explanationError}</div> : null}
        {explanation ? (
          <output className="coach-explanation">
            <span className="eyebrow">Explication personnalisée</span>
            <h3>{explanation.title}</h3>
            <div className="coach-explanation-grid">
              <div><strong>Règle simple</strong><p>{explanation.simpleExplanation}</p></div>
              <div><strong>Pourquoi ton choix ne fonctionnait pas</strong><p>{explanation.whySelectedWasWrong}</p></div>
              <div><strong>Moyen de retenir</strong><p>{explanation.memoryTip}</p></div>
              <div><strong>Prochaine action</strong><p>{explanation.nextAction}</p></div>
            </div>
            <div className="coach-examples">
              {explanation.examples.map((example) => <article key={example.sentence}><strong>{example.sentence}</strong><span>{example.translation}</span><p>{example.note}</p></article>)}
            </div>
          </output>
        ) : null}
      </section>

      <p className="coach-disclaimer">Le coach utilise l’IA pour reformuler et organiser des contenus existants. Ses conseils restent des recommandations pédagogiques internes et ne constituent ni une correction officielle ETS ni une garantie de score.</p>
    </div>
  );
}
