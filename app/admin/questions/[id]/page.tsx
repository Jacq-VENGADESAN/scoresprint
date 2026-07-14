import { notFound, redirect } from "next/navigation";
import { AdminQuestionForm } from "@/components/admin-question-form";
import { isAdminUser } from "@/lib/admin";
import type { ManagedQuestionInput } from "@/lib/admin-question";
import { getManagedQuestionById } from "@/lib/database-questions";
import type { PracticeOptionId } from "@/lib/practice-bank";
import { getCurrentUser } from "@/lib/supabase-server";

const OPTION_KEYS: PracticeOptionId[] = ["A", "B", "C", "D"];

export default async function EditAdminQuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  const { id } = await params;
  if (!user) redirect(`/auth?next=/admin/questions/${encodeURIComponent(id)}`);
  if (!isAdminUser(user)) notFound();

  const question = await getManagedQuestionById(id);
  if (!question) notFound();
  const optionMap = new Map(question.question_options.map((option) => [option.option_key, option]));
  const initial: ManagedQuestionInput = {
    id: question.id,
    code: question.code ?? "",
    part: question.part,
    skillId: question.skill_id,
    subskill: question.subskill,
    difficulty: question.difficulty,
    targetTimeSeconds: Math.round(question.target_time_ms / 1000),
    prompt: question.prompt,
    context: question.context ?? "",
    explanation: question.explanation,
    trap: question.trap ?? "",
    status: question.status,
    options: OPTION_KEYS.map((key) => {
      const option = optionMap.get(key);
      return {
        key,
        text: option?.option_text ?? "",
        feedback: option?.feedback ?? "",
        isCorrect: option?.is_correct ?? false
      };
    })
  };

  return (
    <div className="container admin-page">
      <header className="page-head">
        <div className="eyebrow">Modifier {question.code}</div>
        <h1>Corrige le contenu sans redéployer ScoreSprint.</h1>
        <p>Une question publiée est retirée immédiatement des nouvelles séances si son statut repasse en brouillon ou en archive.</p>
      </header>
      <AdminQuestionForm initial={initial} questionId={question.id} />
    </div>
  );
}