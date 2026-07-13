# ScoreSprint

ScoreSprint est un prototype de plateforme indépendante de préparation adaptative à l’anglais professionnel. L’application analyse les erreurs, estime une fourchette de niveau et construit une séance priorisée.

## Fonctionnalités présentes

- landing page responsive ;
- création de compte et connexion Supabase ;
- sessions stockées dans des cookies HTTP-only ;
- onboarding et sauvegarde de l’objectif ;
- diagnostic original de 20 questions ;
- estimation prudente sous forme de fourchette ;
- sauvegarde des réponses, du score et des maîtrises ;
- dashboard alimenté par les résultats réels du compte ;
- séance quotidienne calculée selon les faiblesses ;
- exercice interactif avec correction pédagogique ;
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
2. `supabase/migrations/20260713173000_auth_and_goal_persistence.sql` ;
3. `supabase/migrations/20260713200000_diagnostic_persistence.sql`.

Les deux premières migrations créent les comptes applicatifs, les objectifs et les politiques RLS. La troisième ajoute les tentatives de diagnostic, les réponses détaillées et les compétences supplémentaires.

Dans **Authentication → URL Configuration** :

- définir **Site URL** sur l’URL Vercel de production ;
- ajouter l’URL Vercel de production dans les **Redirect URLs** ;
- ajouter `http://localhost:3000/**` pour le développement local.

## Fonctionnement du diagnostic

Les questions et leurs corrections restent côté serveur. Le navigateur reçoit uniquement les énoncés et les choix. À la fin du diagnostic :

1. le serveur corrige les réponses ;
2. le résultat est enregistré dans `diagnostic_runs` ;
3. chaque réponse est enregistrée dans `diagnostic_answers` ;
4. `user_mastery` est mis à jour par compétence ;
5. le score courant du profil est actualisé ;
6. le dashboard recalcule la séance quotidienne.

La fourchette affichée est une estimation interne à ScoreSprint et non un score officiel.

## Vérifications

```bash
npm run typecheck
npm run build
```

## Architecture

- `app/` : routes Next.js, pages et endpoints API ;
- `components/` : composants d’interface ;
- `data/` : questions de démonstration pour l’entraînement ;
- `lib/diagnostic-bank.ts` : banque originale et moteur d’évaluation du diagnostic ;
- `lib/` : logique adaptative, configuration et accès Supabase ;
- `supabase/migrations/` : modèle de données et sécurité RLS ;
- `proxy.ts` : renouvellement et protection des sessions.

## Avertissement de marque

TOEIC® est une marque déposée d’ETS. ScoreSprint est indépendant et n’est ni affilié, ni approuvé, ni sponsorisé par ETS. Aucun contenu officiel ne doit être copié ou redistribué.
