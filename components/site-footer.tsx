import Link from "next/link";
import { BRAND_NAME, independentExamDisclaimer } from "@/lib/brand";
import { getLegalConfig } from "@/lib/legal";

export function SiteFooter() {
  const legal = getLegalConfig();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container site-footer-grid">
        <div className="site-footer-brand">
          <Link href="/" className="footer-wordmark">{BRAND_NAME}</Link>
          <p>Une préparation structurée à l’anglais professionnel, avec des exercices originaux et une progression mesurée.</p>
        </div>
        <div>
          <h2>Produit</h2>
          <Link href="/reading">Reading</Link>
          <Link href="/listening">Listening</Link>
          <Link href="/pricing">Tarifs</Link>
          <Link href="/faq">Questions fréquentes</Link>
        </div>
        <div>
          <h2>Assistance</h2>
          <Link href="/contact">Nous contacter</Link>
          <a href={`mailto:${legal.supportEmail}`}>{legal.supportEmail}</a>
          <Link href="/refund-policy">Rétractation et remboursements</Link>
        </div>
        <div>
          <h2>Informations</h2>
          <Link href="/legal">Mentions légales</Link>
          <Link href="/privacy">Confidentialité</Link>
          <Link href="/terms">CGU et CGV</Link>
        </div>
      </div>
      <div className="container site-footer-bottom">
        <p>© {year} {BRAND_NAME}. Tous droits réservés.</p>
        <p>{independentExamDisclaimer}</p>
      </div>
    </footer>
  );
}
