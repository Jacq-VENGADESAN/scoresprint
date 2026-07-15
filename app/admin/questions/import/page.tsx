import { notFound, redirect } from "next/navigation";
import { AdminQuestionImport } from "@/components/admin-question-import";
import { isAdminUser } from "@/lib/admin";
import { getCurrentUser } from "@/lib/supabase-server";

export default async function AdminQuestionImportPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/admin/questions/import");
  if (!isAdminUser(user)) notFound();

  return (
    <div className="container admin-page">
      <header className="page-head">
        <div className="eyebrow">Import massif</div>
        <h1>Ajoute une banque complète depuis un fichier CSV.</h1>
        <p>Chaque ligne est contrôlée avant écriture : structure, quatre réponses, bonne réponse unique et codes déjà présents dans Supabase.</p>
      </header>
      <AdminQuestionImport />
    </div>
  );
}
