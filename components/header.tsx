import Link from "next/link";

const links = [
  ["Diagnostic", "/diagnostic"],
  ["Entraînement", "/practice"],
  ["Progression", "/dashboard"],
  ["Tarifs", "/pricing"]
] as const;

export function Header() {
  return (
    <header style={{ borderBottom: "1px solid rgba(223,229,238,.8)", background: "rgba(255,255,255,.78)", backdropFilter: "blur(16px)", position: "sticky", top: 0, zIndex: 20 }}>
      <div className="container" style={{ minHeight: 73, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18 }}>
        <Link href="/" style={{ fontWeight: 950, letterSpacing: "-.04em", fontSize: "1.25rem" }}>
          Score<span style={{ color: "var(--brand)" }}>Sprint</span>
        </Link>
        <nav style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap", justifyContent: "flex-end" }} aria-label="Navigation principale">
          {links.map(([label, href]) => <Link key={href} href={href} style={{ color: "var(--muted)", fontWeight: 700, fontSize: ".91rem" }}>{label}</Link>)}
          <Link className="btn btn-primary" href="/onboarding">Commencer</Link>
        </nav>
      </div>
    </header>
  );
}
