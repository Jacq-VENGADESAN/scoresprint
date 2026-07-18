import type { Metadata } from "next";
import "./globals.css";
import "./practice.css";
import "./progress.css";
import "./exam.css";
import "./history.css";
import "./access.css";
import "./billing.css";
import "./admin.css";
import "./admin-quality.css";
import "./product-ui.css";
import "./product-polish.css";
import "./account-session.css";
import "./listening.css";
import "./launch.css";
import { Header } from "@/components/header";
import { SiteFooter } from "@/components/site-footer";
import { appUrl, BRAND_DESCRIPTION, BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl()),
  title: {
    default: `${BRAND_NAME} — Préparation ciblée à l’anglais professionnel`,
    template: `%s · ${BRAND_NAME}`
  },
  description: BRAND_DESCRIPTION,
  applicationName: BRAND_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: BRAND_NAME,
    title: `${BRAND_NAME} — Progresse là où ça compte`,
    description: BRAND_DESCRIPTION,
    url: "/"
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND_NAME} — Progresse là où ça compte`,
    description: BRAND_DESCRIPTION
  },
  robots: { index: true, follow: true },
  category: "education"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        <a className="skip-link" href="#main-content">Aller au contenu</a>
        <Header />
        <main id="main-content">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
