import Link from "next/link";
import { getCurrentUser } from "@/lib/supabase-server";

const links = [
  ["Diagnostic", "/diagnostic"],
  ["Entraînement", "/practice"],
  ["Progression", "/dashboard"],
  ["Tarifs", "/pricing"]
] as const;

export async function Header() {
  const user = await getCurrentUser();

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
          {user ? (
            <>
              <span className="header-user">{user.user_metadata?.display_name ?? user.email ?? "Mon compte"}</span>
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
