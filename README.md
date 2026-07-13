# ScoreSprint

ScoreSprint est un prototype de plateforme indépendante de préparation adaptative à l’anglais professionnel. L’application analyse les erreurs, estime une fourchette de niveau et construit une séance priorisée.

## Fonctionnalités déjà présentes

- landing page responsive ;
- onboarding de l’objectif ;
- aperçu du diagnostic ;
- exercice interactif avec correction pédagogique ;
- dashboard de progression ;
- carnet d’erreurs ;
- page tarifaire ;
- moteur adaptatif TypeScript ;
- endpoint d’estimation de score ;
- schéma PostgreSQL/Supabase avec RLS ;
- CI GitHub Actions et Dockerfile.

## Démarrage

```bash
npm install
npm run dev
```

Ouvrir `http://localhost:3000`.

## Vérifications

```bash
npm run typecheck
npm run build
```

## Variables d’environnement

Copier `.env.example` vers `.env.local`. Les intégrations Supabase, Stripe et OpenAI seront branchées dans les prochaines itérations.

## Architecture

- `app/` : routes Next.js et API ;
- `components/` : composants d’interface ;
- `data/` : questions de démonstration ;
- `lib/` : types et logique adaptative ;
- `supabase/migrations/` : modèle de données initial.

## Avertissement de marque

TOEIC® est une marque déposée d’ETS. ScoreSprint est indépendant et n’est ni affilié, ni approuvé, ni sponsorisé par ETS. Aucun contenu officiel ne doit être copié ou redistribué.
