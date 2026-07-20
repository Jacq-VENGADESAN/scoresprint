import Link from "next/link";
import { PublicDemoRunner } from "@/components/public-demo-runner";
import { DEMO_QUESTIONS } from "@/lib/demo-bank";

export const metadata = {
  title: "Démonstration gratuite",
  description: "Teste gratuitement huit exercices originaux de préparation au TOEIC avec corrections détaillées, sans créer de compte."
};

export default function DemoPage() {
  return (
    <div className="container demo-page">
      <header className="page-head demo-page-head">
        <div>
          <span className="eyebrow">Préparation au TOEIC® Listening & Reading</span>
          <h1>Découvre Aptileo avant de créer un compte.</h1>
          <p>Cette démonstration publique montre le niveau de détail des corrections, le fonctionnement audio et la séparation Reading/Listening.</p>
        </div>
        <Link className="btn btn-secondary" href="/faq">Lire la FAQ</Link>
      </header>
      <PublicDemoRunner questions={DEMO_QUESTIONS} />
      <p className="demo-disclaimer">Démonstration indépendante, non officielle et non affiliée à ETS. Les questions et corrections sont originales.</p>
    </div>
  );
}
