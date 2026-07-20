import Link from "next/link";
import { LESSONS } from "@/lib/lessons";

export const metadata = {
  title: "Fiches express",
  description: "Des fiches courtes de grammaire, vocabulaire et stratégie pour préparer le TOEIC Reading et Listening."
};

const categorySections = [
  { name: "Grammaire", id: "grammaire" },
  { name: "Vocabulaire", id: "vocabulaire" },
  { name: "Stratégie Reading", id: "strategie-reading" },
  { name: "Stratégie Listening", id: "strategie-listening" }
] as const;

export default function LessonsPage() {
  return (
    <div className="container lessons-page">
      <header className="page-head lessons-page-head">
        <div>
          <span className="eyebrow">Comprendre avant de répéter</span>
          <h1>Fiches express de grammaire et de stratégie.</h1>
          <p>Chaque fiche se lit en quelques minutes : règle, exemples, pièges fréquents et points à vérifier pendant les exercices.</p>
        </div>
        <Link className="btn btn-primary" href="/demo">Tester une correction</Link>
      </header>

      <nav className="lesson-category-nav" aria-label="Catégories de fiches">
        {categorySections.map((category) => <a key={category.id} href={`#${category.id}`}>{category.name}</a>)}
      </nav>

      {categorySections.map((category) => {
        const lessons = LESSONS.filter((lesson) => lesson.category === category.name);
        return (
          <section className="lesson-category" id={category.id} key={category.id}>
            <div className="dashboard-section-head"><div><h2>{category.name}</h2><p>{lessons.length} fiches disponibles</p></div></div>
            <div className="lesson-grid">
              {lessons.map((lesson) => (
                <article className="lesson-card" key={lesson.slug}>
                  <div className="lesson-card-meta"><span>{lesson.level}</span><span>{lesson.readingTime} min</span></div>
                  <h3>{lesson.title}</h3>
                  <p>{lesson.summary}</p>
                  <Link href={`/lessons/${lesson.slug}`}>Lire la fiche <span aria-hidden="true">→</span></Link>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
