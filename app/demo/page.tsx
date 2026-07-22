import { randomUUID } from "node:crypto";
import Link from "next/link";
import { PublicDemoRunner } from "@/components/public-demo-runner";
import { DEMO_QUESTIONS } from "@/lib/demo-bank";
import { seededShuffle } from "@/lib/randomization";

export const metadata = {
  title: "Démonstration gratuite",
  description: "Teste gratuitement huit exercices originaux de préparation au TOEIC avec corrections détaillées, sans créer de compte."
};

export default function DemoPage() {
  const questions = seededShuffle(DEMO_QUESTIONS, `public-demo-${randomUUID()}`);
  return (
    <div className="container demo-page">
      <header className="page-head demo-page-head">
        <div>
          <span className="eyebrow">Préparation au TOEIC® Listening & Reading</span>
          <h1>Découvre Aptileo avec un parcours différent à chaque essai.</h1>
          <p>Les huit exercices restent équilibrés entre Reading et Listening, mais leur ordre est renouvelé pour éviter une démonstration identique pour tout le monde.</p>
        </div>
        <Link className="btn btn-secondary" href="/faq">Lire la FAQ</Link>
      </header>
      <PublicDemoRunner questions={questions} />
      <p className="demo-disclaimer">Démonstration indépendante, non officielle et non affiliée à ETS. Les questions et corrections sont originales.</p>
    </div>
  );
}
