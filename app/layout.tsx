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
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: {
    default: "ScoreSprint — Préparation ciblée à l’anglais professionnel",
    template: "%s · ScoreSprint"
  },
  description: "Un programme de préparation adaptatif qui transforme tes erreurs en séances ciblées.",
  applicationName: "ScoreSprint"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        <a className="skip-link" href="#main-content">Aller au contenu</a>
        <Header />
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
