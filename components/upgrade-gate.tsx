import Link from "next/link";

export function UpgradeGate({
  eyebrow = "Limite du compte gratuit",
  title,
  message,
  resetMessage
}: {
  eyebrow?: string;
  title: string;
  message: string;
  resetMessage?: string;
}) {
  return (
    <section className="card upgrade-gate">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h2>{title}</h2>
        <p className="muted-copy">{message}</p>
        {resetMessage ? <div className="quota-reset-note">{resetMessage}</div> : null}
      </div>
      <div className="upgrade-gate-actions">
        <Link href="/pricing" className="btn btn-primary">Voir les offres Premium</Link>
        <Link href="/account" className="btn btn-secondary">Voir mon utilisation</Link>
      </div>
    </section>
  );
}