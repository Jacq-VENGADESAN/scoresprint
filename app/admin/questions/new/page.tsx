import { notFound, redirect } from "next/navigation";
import { AdminQuestionForm } from "@/components/admin-question-form";
import { isAdminUser } from "@/lib/admin";
import { getCurrentUser } from "@/lib/supabase-server";

export default async function NewAdminQuestionPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/admin/questions/new");
  if (!isAdminUser(user)) notFound();

  return (
    <div className="container admin-page">
      <header className="page-head">
        <div className="eyebrow">Nouvelle question</div>
        <h1>Ajoute un contenu original à la banque adaptative.</h1>
        <p>Enregistre d’abord en brouillon, vérifie les quatre options et publie seulement lorsque l’explication est claire et non ambiguë.</p>
      </header>
      <AdminQuestionForm />
    </div>
  );
}