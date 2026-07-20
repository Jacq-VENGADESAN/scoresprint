import Link from "next/link";
import { notFound } from "next/navigation";
import { getLesson, LESSONS } from "@/lib/lessons";

export function generateStaticParams() {
  return LESSONS.map((lesson) => ({ slug: lesson.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) return { title: "Fiche introuvable" };
  return { title: lesson.title, description: lesson.summary };
}

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) notFound();
  const related = LESSONS.filter((item) => item.category === lesson.category && item.slug !== lesson.slug).slice(0, 2);

  return (
    <div className="container lesson-page">
      <div className="lesson-breadcrumb"><Link href="/lessons">Fiches express</Link><span>›</span><span>{lesson.category}</span></div>
      <header className="lesson-hero">
        <div>
          <div className="lesson-card-meta"><span>{lesson.category}</span><span>{lesson.level}</span><span>{lesson.readingTime} min</span></div>
          <h1>{lesson.title}</h1>
          <p>{lesson.summary}</p>
        </div>
        <Link className="btn btn-secondary" href={lesson.practiceHref}>Mettre en pratique</Link>
      </header>

      <div className="lesson-content-layout">
        <article className="lesson-document">
          <section>
            <span className="lesson-section-number">01</span>
            <div><h2>La règle à retenir</h2><p className="lesson-rule">{lesson.rule}</p></div>
          </section>
          <section>
            <span className="lesson-section-number">02</span>
            <div><h2>Exemples commentés</h2><div className="lesson-examples">{lesson.examples.map((example) => <div key={example.sentence}><code>{example.sentence}</code><p>{example.note}</p></div>)}</div></div>
          </section>
          <section>
            <span className="lesson-section-number">03</span>
            <div><h2>Pièges fréquents</h2><ul className="lesson-list warning">{lesson.traps.map((trap) => <li key={trap}>{trap}</li>)}</ul></div>
          </section>
          <section>
            <span className="lesson-section-number">04</span>
            <div><h2>La vérification en trois secondes</h2><ol className="lesson-list checklist">{lesson.checklist.map((item) => <li key={item}>{item}</li>)}</ol></div>
          </section>
          <div className="lesson-end-action"><div><strong>La règle est claire ?</strong><span>Consolide-la immédiatement avec une séance ciblée.</span></div><Link className="btn btn-primary" href={lesson.practiceHref}>Démarrer des exercices</Link></div>
        </article>

        <aside className="lesson-sidebar">
          <div className="lesson-sidebar-card"><strong>À retenir</strong><p>{lesson.summary}</p></div>
          {related.length > 0 ? <div className="lesson-sidebar-card"><strong>Continuer dans {lesson.category}</strong>{related.map((item) => <Link key={item.slug} href={`/lessons/${item.slug}`}>{item.title}<span>→</span></Link>)}</div> : null}
          <Link className="btn btn-secondary" href="/feedback">Cette fiche manque de clarté ?</Link>
        </aside>
      </div>
    </div>
  );
}
