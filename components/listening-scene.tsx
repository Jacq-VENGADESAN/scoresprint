import type { ListeningPhoto } from "@/lib/listening-bank";

type SceneProps = { scene: ListeningPhoto };

export function ListeningScene({ scene }: SceneProps) {
  return (
    <figure className="listening-photo">
      <img src={scene.src} alt={scene.alt} loading="eager" referrerPolicy="no-referrer" />
      <figcaption>
        <span>Photographie réelle utilisée pour cet exercice original.</span>
        <a href={scene.sourceUrl} target="_blank" rel="noreferrer">{scene.sourceLabel}</a>
      </figcaption>
    </figure>
  );
}
