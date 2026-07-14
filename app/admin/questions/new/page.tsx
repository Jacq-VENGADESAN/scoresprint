import { notFound, redirect } from "next/navigation";
import { AdminQuestionForm } from "@/components/admin-question-form";
import { isAdminUser } from "@/lib/admin";
import type { ManagedQuestionInput } from "@/lib/admin-question";
import { getManagedQuestionById } from "@/lib/database-questions";
import type { PracticeOptionId } from "@/lib/practice-bank";
import { getCurrentUser } from "@/lib/supabase-server";

const OPTION_KEYS: PracticeOptionId[] = ["A", "B", "C", "D"];

export default async function NewAdminQuestionPage({ searchParams }: { searchParams: Promise<{ duplicate?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/admin/questions/new");
  if (!isAdminUser(user)) notFound();

  const params = await searchParams;
  let initial: ManagedQuestionInput | undefined;
  if (params.duplicate) {
    const source = await getManagedQuestionById(params.duplicate);
    if (!source) notFound();
    const optionMap = new Map(source.question_options.map((option) => [option.option_key, option]));
    initial = {
      code: `${source.code ?? "question"}-copy`.slice(0, 80),
      part: source.part,
      skillId: source.skill_id,
      subskill: source.subskill,
      difficulty: source.difficulty,
      targetTimeSeconds: Math.round(source.target_time_ms / 1000),
      prompt: source.prompt,
      context: source.context ?? "",
      explanation: source.explanation,
      trap: source.trap ?? "",
      status: "draft",
      options: OPTION_KEYS.map((key) => {
        const option = optionMap.get(key);
        return { key, text: option?.option_text ?? "", feedback: option?.feedback ?? "", isCorrect: option?.is_correct ?? false };
      })
    };
  }

  return (
    <div className="container admin-page">
      <header className="page-head">
        <div className="eyebrow">{initial ? "Dupliquer une question" : "Nouvelle question"}</div>
        <h1>{initial ? "Crée une variante à partir d’un contenu existant." : "Ajoute un contenu original à la banque adaptative."}</h1>
        <p>{initial ? "La copie est enregistrée comme brouillon et doit recevoir un nouveau code unique avant publication." : "Enregistre d’abord en brouillon, vérifie les quatre options et publie seulement lorsque l’explication est claire et non ambiguë."}</p>
      </header>
      <AdminQuestionForm initial={initial} />
    </div>
  );
}
