import Link from "next/link";
import { isAdminUser } from "@/lib/admin";
import { getCurrentUser } from "@/lib/supabase-server";

const links = [
  ["Diagnostic", "/diagnostic"],
  ["Entraînement", "/practice"],
  ["Mini-examen", "/mock-exam"],
  ["Progression", "/dashboard"],
  ["Historique", "/history"],
  ["Tarifs", "/pricing"]
] as const;

export async function Header() {
  const user = await getCurrentUser();
  const admin = isAdminUser(user);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand-link">
          Score<span> Sprint</span>
        </Link>
        <nav className="main-nav" aria-label="Navigation principale">
          {links.map(([label, href]) => (
            <Link key={href} href={href} className="nav-link">{label}</Link>
          ))}
          {admin ? <Link href="/admin/questions" className="nav-link">Admin</Link> : null}
          {user ? (
            <>
              <Link href="/account" className="header-user" title="Voir mon accès et mes quotas">
                {user.user_metadata?.display_name ?? user.email ?? "Mon accès"}
              </Link>
              <form action="/api/auth/logout" method="post">
                <button className="btn btn-secondary compact-btn" type="submit">Déconnexion</button>
              </form>
            </>
          ) : (
            <Link className="btn btn-primary compact-btn" href="/auth">Connexion</Link>
          )}
        </nav>
      </div>
    </header>
  );
}