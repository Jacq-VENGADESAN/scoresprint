# ScoreSprint

ScoreSprint est un prototype de plateforme indépendante de préparation adaptative à l’anglais professionnel. L’application analyse les erreurs, estime une fourchette de niveau et construit une séance priorisée.

## Fonctionnalités présentes

- landing page responsive ;
- création de compte et connexion Supabase ;
- sessions stockées dans des cookies HTTP-only ;
- onboarding et sauvegarde de l’objectif ;
- aperçu du diagnostic ;
- exercice interactif avec correction pédagogique ;
- dashboard alimenté par le compte utilisateur ;
- carnet d’erreurs et page tarifaire ;
- moteur adaptatif TypeScript ;
- schéma PostgreSQL/Supabase avec RLS ;
- CI GitHub Actions et Dockerfile.

## Démarrage local

```bash
cp .env.example .env.local
npm install
npm run dev
```

Ouvrir `http://localhost:3000`.

## Variables d’environnement

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

La clé secrète Supabase n’est pas nécessaire pour l’authentification et la sauvegarde des données utilisateur.

## Initialiser la base Supabase

Dans **Supabase → SQL Editor**, exécuter dans cet ordre le contenu de :

1. `supabase/migrations/20260713150000_initial_schema.sql` ;
2. `supabase/migrations/20260713173000_auth_and_goal_persistence.sql`.

La première migration crée les tables et les politiques RLS. La seconde crée automatiquement un profil lors de l’inscription et permet l’upsert d’un objectif par utilisateur.

Dans **Authentication → URL Configuration** :

- définir **Site URL** sur l’URL Vercel de production ;
- ajouter l’URL Vercel de production dans les **Redirect URLs** ;
- ajouter `http://localhost:3000/**` pour le développement local.

## Vérifications

```bash
npm run typecheck
npm run build
```

## Architecture

- `app/` : routes Next.js, pages et endpoints API ;
- `components/` : composants d’interface ;
- `data/` : questions de démonstration ;
- `lib/` : logique adaptative, configuration et accès Supabase ;
- `supabase/migrations/` : modèle de données et sécurité RLS ;
- `proxy.ts` : renouvellement et protection des sessions.

## Avertissement de marque

TOEIC® est une marque déposée d’ETS. ScoreSprint est indépendant et n’est ni affilié, ni approuvé, ni sponsorisé par ETS. Aucun contenu officiel ne doit être copié ou redistribué.
