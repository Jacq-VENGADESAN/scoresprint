import type { PracticeQuestion } from "@/lib/types";

export const sampleQuestions: PracticeQuestion[] = [
  {
    id: "part5-past-perfect-continuous",
    part: 5,
    skill: "Grammaire",
    subskill: "Temps verbaux",
    difficulty: "Intermédiaire",
    prompt: "They said that they ______ on the merger for the past ten months before negotiations were disrupted.",
    options: [
      { id: "A", text: "had been working" },
      { id: "B", text: "were working" },
      { id: "C", text: "are working" },
      { id: "D", text: "have worked" }
    ],
    correctOptionId: "A",
    explanation: "L’action a commencé avant un autre événement passé, a duré dix mois et était encore en cours avant l’interruption. On utilise donc had + been + verbe en -ing. Le verbe said ne suffit pas, à lui seul, à imposer ce temps : c’est la chronologie qui compte.",
    trap: "Choisir automatiquement un temps uniquement à cause du verbe said."
  },
  {
    id: "part5-preposition-deadline",
    part: 5,
    skill: "Grammaire",
    subskill: "Prépositions",
    difficulty: "Débutant",
    prompt: "All expense reports must be submitted ______ Friday at the latest.",
    options: [
      { id: "A", text: "by" },
      { id: "B", text: "during" },
      { id: "C", text: "since" },
      { id: "D", text: "among" }
    ],
    correctOptionId: "A",
    explanation: "By indique une date limite : au plus tard vendredi. During signifie pendant une période, since marque un point de départ et among signifie parmi.",
    trap: "Confondre une date limite avec une durée."
  }
];
