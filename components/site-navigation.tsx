"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type NavigationProps = {
  authenticated: boolean;
  admin: boolean;
  displayName: string;
};

type NavigationLink = {
  label: string;
  href: string;
  exact?: boolean;
  activePrefixes?: string[];
};

const privateLinks: NavigationLink[] = [
  { label: "Tableau de bord", href: "/dashboard", exact: true },
  { label: "Reading", href: "/reading", activePrefixes: ["/practice", "/mock-exam", "/diagnostic"] },
  { label: "Listening", href: "/listening" },
  { label: "Coach 90", href: "/coach" },
  { label: "Fiches", href: "/lessons" },
  { label: "Mes erreurs", href: "/errors" },
  { label: "Historique", href: "/history" }
];

const publicLinks: NavigationLink[] = [
  { label: "Démo", href: "/demo" },
  { label: "Fiches", href: "/lessons" },
  { label: "Fonctionnement", href: "/#fonctionnement" },
  { label: "Tarifs", href: "/pricing" },
  { label: "FAQ", href: "/faq" }
];

function MenuIcon({ open }: Readonly<{ open: boolean }>) {
  return open ? (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" /></svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" /></svg>
  );
}

function ChevronIcon() {
  return <svg className="account-chevron" viewBox="0 0 20 20" aria-hidden="true"><path d="m6 8 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function UserIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5 6c.4-2.7 2.1-4 5-4s4.6 1.3 5 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>;
}

function TargetIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" /><circle cx="10" cy="10" r="2" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M14.5 5.5 17 3m0 0v3m0-3h-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function CardIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><rect x="2.5" y="4" width="15" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M3 8h14" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>;
}

function LogoutIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M8 4H4.5A1.5 1.5 0 0 0 3 5.5v9A1.5 1.5 0 0 0 4.5 16H8m4-3 3-3-3-3m3 3H7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function isCurrent(pathname: string, link: NavigationLink) {
  if (link.href.startsWith("/#")) return false;
  if (link.activePrefixes?.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) return true;
  return link.exact ? pathname === link.href : pathname === link.href || pathname.startsWith(`${link.href}/`);
}

export function SiteNavigation({ authenticated, admin, displayName }: Readonly<NavigationProps>) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const links = authenticated ? privateLinks : publicLinks;
  const initial = useMemo(() => displayName.trim().charAt(0).toUpperCase() || "A", [displayName]);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const closeMenu = () => setOpen(false);

  return (
    <div className="navigation-shell">
      <nav className="desktop-nav" aria-label="Navigation principale">
        {links.map((link) => <Link className={`nav-link ${isCurrent(pathname, link) ? "active" : ""}`} href={link.href} key={link.href}>{link.label}</Link>)}
      </nav>

      <div className="header-actions">
        {authenticated ? (
          <details className="account-menu">
            <summary className="account-trigger" aria-label="Ouvrir le menu du compte">
              <span className="account-avatar" aria-hidden="true">{initial}</span>
              <span className="account-name">{displayName}</span>
              <ChevronIcon />
            </summary>
            <div className="account-popover">
              <Link href="/account"><UserIcon />Mon compte</Link>
              <Link href="/coach"><TargetIcon />Coach 90</Link>
              <Link href="/diagnostic"><TargetIcon />Refaire le diagnostic</Link>
              <Link href="/feedback"><TargetIcon />Donner mon avis</Link>
              <Link href="/pricing"><CardIcon />Accès et tarifs</Link>
              {admin ? <Link href="/admin/questions"><TargetIcon />Administration</Link> : null}
              {admin ? <Link href="/admin/beta"><TargetIcon />Bêta et conversion</Link> : null}
              <div className="account-popover-divider" />
              <form action="/api/auth/logout" method="post"><button type="submit"><LogoutIcon />Se déconnecter</button></form>
            </div>
          </details>
        ) : (
          <>
            <Link className="btn btn-secondary compact-btn" href="/auth">Connexion</Link>
            <Link className="btn btn-primary compact-btn" href="/demo">Essayer gratuitement</Link>
          </>
        )}

        <button type="button" className="mobile-menu-button" aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? "Fermer le menu" : "Ouvrir le menu"} onClick={() => setOpen((current) => !current)}>
          <MenuIcon open={open} />
        </button>
      </div>

      <nav id="mobile-navigation" className="mobile-navigation" aria-label="Navigation mobile" hidden={!open}>
        <div className="mobile-nav-links">
          {links.map((link) => <Link className={`nav-link ${isCurrent(pathname, link) ? "active" : ""}`} href={link.href} key={link.href} onClick={closeMenu}>{link.label}</Link>)}
          {authenticated && admin ? <Link className={`nav-link ${pathname.startsWith("/admin") ? "active" : ""}`} href="/admin/questions" onClick={closeMenu}>Administration</Link> : null}
        </div>
        <div className="mobile-nav-actions">
          {authenticated ? (
            <>
              <Link className="btn btn-secondary" href="/feedback" onClick={closeMenu}>Donner mon avis</Link>
              <Link className="btn btn-secondary" href="/account" onClick={closeMenu}>Mon compte</Link>
              <form action="/api/auth/logout" method="post"><button className="btn btn-primary" type="submit">Se déconnecter</button></form>
            </>
          ) : (
            <>
              <Link className="btn btn-secondary" href="/auth" onClick={closeMenu}>Connexion</Link>
              <Link className="btn btn-primary" href="/demo" onClick={closeMenu}>Tester sans compte</Link>
            </>
          )}
        </div>
      </nav>
    </div>
  );
}
