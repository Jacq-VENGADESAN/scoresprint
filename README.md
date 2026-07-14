# ScoreSprint

ScoreSprint est un prototype de plateforme indépendante de préparation adaptative à l’anglais professionnel. L’application analyse les erreurs, estime une fourchette de niveau et construit une séance priorisée.

## Fonctionnalités présentes

- landing page responsive ;
- création de compte et connexion Supabase ;
- sessions stockées dans des cookies HTTP-only ;
- onboarding et sauvegarde de l’objectif ;
- diagnostic original de 20 questions ;
- estimation prudente sous forme de fourchette ;
- maîtrise calibrée selon la difficulté, la vitesse et le nombre d’observations ;
- niveau de confiance affiché par compétence ;
- score évolutif après les séances et les tests ;
- courbe des huit dernières estimations ;
- mini-examen original de 30 questions chronométré sur 25 minutes ;
- sauvegarde des réponses, du score et des maîtrises ;
- dashboard alimenté par les résultats réels du compte ;
- séance quotidienne adaptative de 6 à 12 questions ;
- banque de 50 questions d’entraînement originales ;
- 100 questions originales au total entre diagnostic, entraînement et mini-examen ;
- exclusion prioritaire des questions vues durant les 14 derniers jours ;
- correction côté serveur avec règle, piège et retour sur le choix ;
- carnet d’erreurs réel avec répétition espacée ;
- résumé enregistré à la fin de chaque séance ;
- historique détaillé des séances et mini-examens ;
- révision de chaque réponse avec temps, choix et correction ;
- statistiques sur 7 jours et série quotidienne ;
- offre gratuite avec quotas vérifiés côté serveur ;
- architecture Premium fondée sur la table `subscriptions` ;
- page de gestion de l’accès et de l’utilisation ;
- page tarifaire prête pour Stripe, sans paiement actif ;
- schéma PostgreSQL/Supabase avec RLS ;
- CI GitHub Actions et Dockerfile.

ScoreSprint n’utilise actuellement aucune API d’intelligence artificielle. Les questions, corrections et explications sont contrôlées et enregistrées à l’avance.

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
3. `supabase/migrations/20260713200000_diagnostic_persistence.sql` ;
4. `supabase/migrations/20260713213000_adaptive_practice.sql` ;
5. `supabase/migrations/20260713223000_progress_analytics.sql` ;
6. `supabase/migrations/20260713233000_calibrated_mastery_mini_exams.sql` ;
7. `supabase/migrations/20260714113000_free_tier_usage_limits.sql`.

La septième migration ajoute les compteurs d’utilisation, une fonction PostgreSQL de consommation atomique des quotas, les politiques RLS et un rattrapage des séances et mini-examens existants.

Dans **Authentication → URL Configuration** :

- définir **Site URL** sur l’URL Vercel de production ;
- ajouter l’URL Vercel de production dans les **Redirect URLs** ;
- ajouter `http://localhost:3000/**` pour le développement local.

## Offre gratuite et Premium

Le compte gratuit est défini dans `lib/access.ts` :

- 1 séance adaptative ou révision d’erreurs par jour ;
- 1 mini-examen par mois ;
- historique accessible sur les 7 derniers jours ;
- diagnostic et suivi des compétences disponibles.

Un abonnement actif dans `subscriptions`, avec un `plan_code` différent de `free` et une date de fin encore valide, active Premium :

- séances illimitées ;
- mini-examens illimités ;
- historique complet.

Les quotas sont vérifiés dans les routes serveur. Ils ne reposent donc pas seulement sur l’affichage des boutons. Stripe n’est pas encore connecté et aucun paiement n’est actuellement possible.

## Mesure de la maîtrise

Une seule mauvaise réponse ne peut plus faire chuter brutalement une compétence. La mise à jour prend en compte :

1. la maîtrise précédente ;
2. la justesse ;
3. la difficulté ;
4. le temps de réponse ;
5. le nombre total d’observations déjà disponibles.

Le dashboard affiche une confiance faible, moyenne ou élevée. Le score évolue progressivement après une séance, tandis qu’un mini-examen chronométré crée une mesure plus forte.

## Catalogue et répétitions

La banque comprend désormais :

- 20 questions de diagnostic ;
- 50 questions d’entraînement adaptatif ;
- 30 questions de mini-examen.

Une séance normale évite autant que possible les questions rencontrées durant les 14 derniers jours. Les erreurs arrivées à échéance restent prioritaires et peuvent donc revenir plus tôt dans le cadre de la répétition espacée.

## Mini-examen

La page `/mock-exam` propose 30 questions originales :

- 15 questions de partie 5 ;
- 5 questions de partie 6 ;
- 10 questions de partie 7 ;
- 25 minutes ;
- aucune correction avant la fin ;
- résultat par partie et fourchette de score ;
- enregistrement dans `mini_exam_runs`, `mini_exam_answers` et `score_snapshots`.

Les contenus sont originaux et ne reproduisent aucune question officielle.

## Historique

La page `/history` réunit les diagnostics, séances et mini-examens. Les séances et mini-examens disposent d’un écran détaillé permettant de revoir les questions, les réponses choisies, les bonnes réponses, le temps passé et, pour l’entraînement, les explications pédagogiques complètes.

## Vérifications

```bash
npm run typecheck
npm run build
```

## Architecture

- `app/` : routes Next.js, pages et endpoints API ;
- `app/account/` : statut du plan et suivi des quotas ;
- `app/history/` : chronologie et écrans de révision détaillés ;
- `components/upgrade-gate.tsx` : blocage pédagogique des fonctionnalités Premium ;
- `components/mini-exam-runner.tsx` : chronomètre et parcours du mini-examen ;
- `components/score-curve.tsx` : courbe des dernières mesures ;
- `lib/access.ts` : droits d’accès, quotas gratuits et détection Premium ;
- `lib/diagnostic-bank.ts` : banque originale et moteur d’évaluation du diagnostic ;
- `lib/practice-bank.ts` et `lib/practice-bank-extra.ts` : catalogue original d’entraînement ;
- `lib/practice-catalog.ts` : sélection sur 50 questions et limitation des répétitions ;
- `lib/mini-exam-bank.ts` : banque originale de 30 questions et correction serveur ;
- `lib/measurement.ts` : calibration des maîtrises et évolution prudente du score ;
- `lib/progress.ts` : calcul de série et agrégation de l’activité hebdomadaire ;
- `supabase/migrations/` : modèle de données et sécurité RLS ;
- `proxy.ts` : renouvellement et protection des sessions.

## Avertissement de marque

TOEIC® est une marque déposée d’ETS. ScoreSprint est indépendant et n’est ni affilié, ni approuvé, ni sponsorisé par ETS. Aucun contenu officiel ne doit être copié ou redistribué.