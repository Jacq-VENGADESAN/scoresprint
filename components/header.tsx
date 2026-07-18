import Link from "next/link";
import { isAdminUser } from "@/lib/admin";
import { BRAND_NAME } from "@/lib/brand";
import { getCurrentUser } from "@/lib/supabase-server";
import { SiteNavigation } from "@/components/site-navigation";

function AptileoMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 17.5 9.5 12l3.2 3.1L20 7.8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15.8 7.8H20V12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export async function Header() {
  const user = await getCurrentUser();
  const displayName = user?.user_metadata?.display_name ?? user?.email?.split("@")[0] ?? "Mon compte";

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href={user ? "/dashboard" : "/"} className="brand-link" aria-label={`${BRAND_NAME} — accueil`}>
          <span className="brand-mark"><AptileoMark /></span>
          <span className="brand-wordmark">Apti<span>leo</span></span>
        </Link>
        <SiteNavigation authenticated={Boolean(user)} admin={isAdminUser(user)} displayName={displayName} />
      </div>
    </header>
  );
}
