import Link from "next/link";
import { isAdminUser } from "@/lib/admin";
import { getCurrentUser } from "@/lib/supabase-server";
import { SiteNavigation } from "@/components/site-navigation";

function SprintMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 16.5 10 12l3 2.5L19 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 8h4v4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export async function Header() {
  const user = await getCurrentUser();
  const displayName = user?.user_metadata?.display_name ?? user?.email?.split("@")[0] ?? "Mon compte";

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href={user ? "/dashboard" : "/"} className="brand-link" aria-label="ScoreSprint — accueil">
          <span className="brand-mark"><SprintMark /></span>
          <span className="brand-wordmark">Score<span>Sprint</span></span>
        </Link>
        <SiteNavigation authenticated={Boolean(user)} admin={isAdminUser(user)} displayName={displayName} />
      </div>
    </header>
  );
}
