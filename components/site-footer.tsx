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
          <p>Une préparation ciblée au TOEIC® Listening & Reading, avec des exercices originaux, des fiches courtes et une progression mesurée.</p>
        </div>
        <div>
          <h2>Produit</h2>
          <Link href="/demo">Démonstration gratuite</Link>
          <Link href="/reading">Reading</Link>
          <Link href="/listening">Listening</Link>
          <Link href="/lessons">Fiches express</Link>
          <Link href="/pricing">Accès Premium</Link>
        </div>
        <div>
          <h2>Bêta et assistance</h2>
          <Link href="/feedback">Donner mon avis</Link>
          <Link href="/faq">Questions fréquentes</Link>
          <Link href="/contact">Nous contacter</Link>
          <a href={`mailto:${legal.supportEmail}`}>{legal.supportEmail}</a>
        </div>
        <div>
          <h2>Informations</h2>
          <Link href="/legal">Mentions légales</Link>
          <Link href="/privacy">Confidentialité</Link>
          <Link href="/terms">CGU et CGV</Link>
          <Link href="/refund-policy">Rétractation</Link>
        </div>
      </div>
      <div className="container site-footer-bottom">
        <p>© {year} {BRAND_NAME}. Tous droits réservés.</p>
        <p>{independentExamDisclaimer}</p>
      </div>
    </footer>
  );
}
