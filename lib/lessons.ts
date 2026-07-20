export type Lesson = {
  slug: string;
  category: "Grammaire" | "Vocabulaire" | "Stratégie Reading" | "Stratégie Listening";
  title: string;
  summary: string;
  level: "Essentiel" | "Intermédiaire" | "Avancé";
  readingTime: number;
  rule: string;
  examples: Array<{ sentence: string; note: string }>;
  traps: string[];
  checklist: string[];
  practiceHref: string;
};

export const LESSONS: Lesson[] = [
  {
    slug: "past-simple-present-perfect",
    category: "Grammaire",
    title: "Past simple ou present perfect ?",
    summary: "Choisir le bon temps selon que la période est terminée ou encore liée au présent.",
    level: "Essentiel",
    readingTime: 4,
    rule: "Utilise le past simple avec un moment passé terminé ou clairement daté. Utilise le present perfect lorsque le résultat compte maintenant, lorsque la période continue ou lorsque le moment exact n’est pas indiqué.",
    examples: [
      { sentence: "The supplier delivered the parts yesterday.", note: "Yesterday est une période passée terminée." },
      { sentence: "The supplier has delivered the parts.", note: "Le résultat actuel est important : les pièces sont disponibles." },
      { sentence: "Sales have increased this quarter.", note: "Le trimestre est encore en cours." }
    ],
    traps: ["Mettre un present perfect avec yesterday, last week ou in 2024.", "Choisir uniquement selon la traduction française sans regarder le repère temporel."],
    checklist: ["La période est-elle terminée ?", "Un moment passé précis est-il indiqué ?", "Le résultat a-t-il un effet maintenant ?"],
    practiceHref: "/practice"
  },
  {
    slug: "future-forms-deadlines",
    category: "Grammaire",
    title: "Exprimer le futur et les échéances",
    summary: "Distinguer will, be going to, présent continu et futur antérieur.",
    level: "Intermédiaire",
    readingTime: 5,
    rule: "Will sert souvent à une décision, une prévision ou un fait futur. Be going to exprime une intention ou une conséquence visible. Le présent continu convient à un arrangement planifié. Le futur antérieur décrit une action terminée avant un autre moment futur.",
    examples: [
      { sentence: "We are meeting the client at 3 p.m.", note: "Rendez-vous organisé." },
      { sentence: "The team will have completed the audit by Friday.", note: "Action terminée avant l’échéance." },
      { sentence: "Those clouds are dark. It is going to rain.", note: "Prévision fondée sur un indice visible." }
    ],
    traps: ["Oublier le participe passé après will have.", "Employer will après une proposition temporelle introduite par when ou by the time."],
    checklist: ["S’agit-il d’un arrangement déjà fixé ?", "L’action sera-t-elle terminée avant une échéance ?", "La proposition commence-t-elle par when, once ou by the time ?"],
    practiceHref: "/practice"
  },
  {
    slug: "gerund-or-infinitive",
    category: "Grammaire",
    title: "Gérondif ou infinitif après un verbe",
    summary: "Reconnaître les constructions fréquentes après avoid, consider, decide, plan et agree.",
    level: "Intermédiaire",
    readingTime: 5,
    rule: "Certains verbes sont suivis de -ing, notamment avoid, consider, suggest et finish. D’autres sont suivis de to + base verbale, notamment agree, decide, plan, hope et expect.",
    examples: [
      { sentence: "We suggest reviewing the figures again.", note: "Suggest est suivi de -ing." },
      { sentence: "The manager agreed to extend the deadline.", note: "Agree est suivi de to + verbe." },
      { sentence: "Please avoid sharing confidential files.", note: "Avoid est suivi de -ing." }
    ],
    traps: ["Ajouter to après suggest.", "Utiliser une forme en -ing après decide ou plan."],
    checklist: ["Quel verbe précède le blanc ?", "Ce verbe appartient-il à une construction fixe ?", "Une préposition est-elle placée juste avant ? Après une préposition, utilise généralement -ing."],
    practiceHref: "/practice"
  },
  {
    slug: "prepositions-time-place",
    category: "Grammaire",
    title: "Prépositions de temps et de lieu",
    summary: "Sécuriser at, on, in, by, until et within dans les contextes professionnels.",
    level: "Essentiel",
    readingTime: 4,
    rule: "At cible un point précis, on un jour ou une date, in une période ou un espace large. By indique une échéance maximale, until une continuité jusqu’à un moment, within une durée limite calculée à partir d’un point de départ.",
    examples: [
      { sentence: "Please reply by Friday.", note: "Au plus tard vendredi." },
      { sentence: "The office will remain closed until Monday.", note: "La fermeture continue jusqu’à lundi." },
      { sentence: "You will receive a response within two business days.", note: "Dans un délai maximal de deux jours ouvrés." }
    ],
    traps: ["Confondre by et until.", "Choisir in devant une heure précise ou une date complète."],
    checklist: ["Point précis, jour ou période ?", "Échéance ou continuité ?", "Une expression fixe est-elle utilisée : at the beginning, on time, in advance ?"],
    practiceHref: "/practice"
  },
  {
    slug: "relative-clauses",
    category: "Grammaire",
    title: "Who, which, that et whose",
    summary: "Relier deux informations sans perdre l’antécédent ni la fonction du pronom.",
    level: "Essentiel",
    readingTime: 4,
    rule: "Who renvoie à une personne, which à une chose, that peut remplacer who ou which dans une proposition déterminative, et whose exprime la possession.",
    examples: [
      { sentence: "The consultant who led the workshop is returning next month.", note: "Who est le sujet humain de led." },
      { sentence: "The device that was installed yesterday is already working.", note: "That renvoie à une chose." },
      { sentence: "Employees whose badges have expired must contact security.", note: "Whose relie les employés à leurs badges." }
    ],
    traps: ["Choisir whom alors que le pronom est sujet.", "Confondre whose et who’s, contraction de who is."],
    checklist: ["L’antécédent est-il une personne ou une chose ?", "Le pronom est-il sujet, complément ou possessif ?", "La proposition est-elle indispensable au sens ?"],
    practiceHref: "/practice"
  },
  {
    slug: "word-families",
    category: "Vocabulaire",
    title: "Identifier la bonne famille de mots",
    summary: "Déterminer si le blanc attend un nom, un verbe, un adjectif ou un adverbe.",
    level: "Essentiel",
    readingTime: 5,
    rule: "Avant de traduire, observe la structure autour du blanc. Un déterminant appelle souvent un nom, be ou become un adjectif, un auxiliaire un verbe, et un adjectif ou un verbe peut être modifié par un adverbe.",
    examples: [
      { sentence: "The proposal was carefully reviewed.", note: "Carefully modifie le verbe reviewed." },
      { sentence: "Customer satisfaction has improved.", note: "Après customer, le groupe sujet attend un nom." },
      { sentence: "The instructions are extremely clear.", note: "Clear est un adjectif après are." }
    ],
    traps: ["Choisir un mot parce que sa traduction semble correcte sans vérifier sa catégorie.", "Prendre un adjectif pour un adverbe lorsque les deux formes se ressemblent."],
    checklist: ["Quel mot se trouve juste avant le blanc ?", "Quel mot se trouve juste après ?", "Quelle fonction grammaticale manque dans la phrase ?"],
    practiceHref: "/practice"
  },
  {
    slug: "connectors-logic",
    category: "Stratégie Reading",
    title: "Choisir un connecteur par la logique",
    summary: "Identifier addition, opposition, cause, conséquence et exemple avant de lire les choix.",
    level: "Intermédiaire",
    readingTime: 5,
    rule: "Ne choisis pas un connecteur uniquement parce qu’il est fréquent. Résume d’abord la relation entre les deux phrases : ajout, contraste, cause, résultat, condition, chronologie ou illustration.",
    examples: [
      { sentence: "The venue is smaller than expected. Therefore, attendance will be limited.", note: "La seconde phrase est une conséquence." },
      { sentence: "The software is inexpensive. However, it lacks several security features.", note: "La seconde information s’oppose à la première." },
      { sentence: "The team updated the website. In addition, it created a new support portal.", note: "Une action supplémentaire est ajoutée." }
    ],
    traps: ["Confondre however et therefore à cause de leur position similaire.", "Choisir for example lorsqu’aucun exemple précis ne suit."],
    checklist: ["Peux-tu remplacer le blanc par et, mais, donc ou par exemple ?", "La ponctuation correspond-elle au connecteur ?", "La phrase suivante confirme-t-elle ou contredit-elle la précédente ?"],
    practiceHref: "/practice"
  },
  {
    slug: "part-7-scan-document",
    category: "Stratégie Reading",
    title: "Partie 7 : scanner un document efficacement",
    summary: "Trouver les informations sans relire intégralement le texte pour chaque question.",
    level: "Intermédiaire",
    readingTime: 6,
    rule: "Commence par identifier le type de document, l’expéditeur, le destinataire, la date et l’objectif. Lis ensuite la question et recherche des synonymes plutôt qu’une répétition mot pour mot.",
    examples: [
      { sentence: "Question: Why was the event moved? Text: Heavy rain is expected on Saturday.", note: "Moved et expected rain permettent d’inférer la cause." },
      { sentence: "Question: What should employees do first? Text: Before submitting the form, ask your supervisor to sign it.", note: "Before indique l’ordre exact." }
    ],
    traps: ["Choisir une phrase vraie mais qui ne répond pas à la question.", "Chercher uniquement les mêmes mots au lieu de leurs reformulations."],
    checklist: ["Quel est le type du document ?", "La question porte-t-elle sur un détail, un but ou une inférence ?", "Quels synonymes pourraient remplacer les mots de la question ?"],
    practiceHref: "/practice"
  },
  {
    slug: "part-6-sentence-position",
    category: "Stratégie Reading",
    title: "Partie 6 : replacer une phrase dans un texte",
    summary: "Utiliser les pronoms, les répétitions et la chronologie pour choisir l’emplacement logique.",
    level: "Avancé",
    readingTime: 5,
    rule: "Une phrase à insérer doit se rattacher à ce qui précède et préparer ce qui suit. Observe les pronoms, les expressions comme this change, these results et les marqueurs chronologiques.",
    examples: [
      { sentence: "The company introduced flexible schedules. This change reduced late arrivals.", note: "This change doit suivre l’annonce du changement." },
      { sentence: "First, complete the online form. Once it is approved, you will receive a confirmation.", note: "It renvoie au formulaire et once impose l’ordre." }
    ],
    traps: ["Placer une phrase là où elle est grammaticalement possible mais logiquement déconnectée.", "Ignorer l’antécédent d’un pronom démonstratif."],
    checklist: ["À quoi renvoient les pronoms ?", "La chronologie reste-t-elle cohérente ?", "Le thème de la phrase correspond-il aux phrases voisines ?"],
    practiceHref: "/practice"
  },
  {
    slug: "business-email-vocabulary",
    category: "Vocabulaire",
    title: "Vocabulaire des e-mails professionnels",
    summary: "Comprendre les verbes et expressions qui reviennent dans les demandes, suivis et confirmations.",
    level: "Essentiel",
    readingTime: 5,
    rule: "Dans les e-mails professionnels, les verbes indiquent souvent l’action attendue : confirm, submit, attach, reschedule, postpone, follow up, arrange, notify et approve.",
    examples: [
      { sentence: "Please find the revised quotation attached.", note: "La pièce jointe contient un devis modifié." },
      { sentence: "I am following up on my previous request.", note: "L’expéditeur relance une demande antérieure." },
      { sentence: "The appointment has been rescheduled for Thursday.", note: "Le rendez-vous a été déplacé à une nouvelle date." }
    ],
    traps: ["Confondre postpone, qui repousse, et cancel, qui annule.", "Confondre quotation, devis, et quote lorsqu’il désigne une citation dans un autre contexte."],
    checklist: ["Quelle action l’expéditeur attend-il ?", "Une pièce jointe ou une échéance est-elle mentionnée ?", "Le message confirme-t-il, modifie-t-il ou annule-t-il quelque chose ?"],
    practiceHref: "/practice"
  },
  {
    slug: "part-2-indirect-responses",
    category: "Stratégie Listening",
    title: "Partie 2 : reconnaître une réponse indirecte",
    summary: "Accepter une réponse logique même lorsqu’elle ne contient ni yes ni no.",
    level: "Intermédiaire",
    readingTime: 5,
    rule: "Dans une conversation naturelle, une question fermée reçoit souvent une action, une explication ou une correction plutôt qu’un yes ou no explicite. Vérifie la fonction de la réponse, pas seulement les mots répétés.",
    examples: [
      { sentence: "Has the invoice been approved? — The director is reviewing it now.", note: "La réponse implique que l’approbation n’est pas encore terminée." },
      { sentence: "Can you attend the meeting? — I’ll be in Lyon that day.", note: "Le déplacement implique une indisponibilité." },
      { sentence: "Isn’t the cafeteria closed? — It reopened on Monday.", note: "La réponse corrige l’information de la question." }
    ],
    traps: ["Éliminer une réponse uniquement parce qu’elle ne reprend aucun mot de la question.", "Se laisser attirer par une réponse qui répète un mot mais répond à une autre question."],
    checklist: ["Quel type de réponse la question appelle-t-elle ?", "Une action ou une explication répond-elle implicitement ?", "Un distracteur répète-t-il seulement un mot entendu ?"],
    practiceHref: "/listening?mode=part2"
  },
  {
    slug: "listening-keywords-vs-meaning",
    category: "Stratégie Listening",
    title: "Écouter le sens plutôt que les mots-clés",
    summary: "Éviter les distracteurs qui répètent un mot entendu avec une action ou un contexte différent.",
    level: "Essentiel",
    readingTime: 4,
    rule: "Les mauvaises réponses reprennent souvent un nom de la question ou de la photographie. Concentre-toi sur le verbe, la relation entre les objets et le mot interrogatif.",
    examples: [
      { sentence: "Where is the conference room? — It’s across from the elevators.", note: "Where impose une information de lieu." },
      { sentence: "A worker is loading boxes onto a truck.", note: "Loading onto n’a pas le même sens que carrying away from." }
    ],
    traps: ["Choisir une réponse uniquement parce qu’elle contient conference ou boxes.", "Ignorer une préposition qui change la direction de l’action."],
    checklist: ["Quel est le mot interrogatif ?", "Quel est le verbe principal ?", "La direction, la position ou la chronologie correspondent-elles exactement ?"],
    practiceHref: "/listening"
  }
];

export function getLesson(slug: string) {
  return LESSONS.find((lesson) => lesson.slug === slug) ?? null;
}
