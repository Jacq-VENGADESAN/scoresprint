import type { Metadata } from "next";
import "./globals.css";
import "./practice.css";
import "./progress.css";
import "./exam.css";
import "./history.css";
import "./access.css";
import "./billing.css";
import "./admin.css";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "ScoreSprint — Atteins ton score cible",
  description: "Coach adaptatif de préparation à l’anglais professionnel."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}