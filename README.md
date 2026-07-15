# ScoreSprint

ScoreSprint est une plateforme indépendante de préparation adaptative à l’anglais professionnel. L’application analyse les erreurs, estime une fourchette de niveau et construit une séance priorisée.

## Fonctionnalités présentes

- création de compte et connexion Supabase ;
- diagnostic original de 20 questions ;
- maîtrise calibrée et score évolutif ;
- séance quotidienne adaptative et carnet d’erreurs ;
- mini-examen original de 30 questions chronométré ;
- historique détaillé et statistiques ;
- 100 questions originales au total ;
- banque de questions supplémentaire gérée dans Supabase ;
- espace administrateur pour créer, relire, publier et archiver des questions ;
- import CSV transactionnel jusqu’à 500 questions ;
- aperçu, filtres, duplication et détection des codes en double ;
- statistiques de réussite et signalements par question ;
- offre gratuite avec quotas contrôlés côté serveur ;
- accès Premium de 30 ou 90 jours ;
- Stripe Checkout hébergé pour les paiements uniques ;
- activation automatique et idempotente par webhook ;
- prolongation d’un accès Premium déjà actif ;
- portail Stripe pour les reçus et l’historique de paiement ;
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
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_SPRINT_30=price_...
STRIPE_PRICE_SPRINT_90=price_...
ADMIN_EMAILS=admin@example.com
```

`SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY` et `STRIPE_WEBHOOK_SECRET` sont strictement réservées au serveur et ne doivent jamais être préfixées par `NEXT_PUBLIC_` ni commitées dans GitHub.

`ADMIN_EMAILS` contient une ou plusieurs adresses séparées par des virgules. Seuls les comptes Supabase connectés avec ces adresses voient l’onglet Admin et peuvent appeler les routes de gestion du contenu.

## Initialiser la base Supabase

Dans **Supabase → SQL Editor**, exécuter dans cet ordre :

1. `20260713150000_initial_schema.sql` ;
2. `20260713173000_auth_and_goal_persistence.sql` ;
3. `20260713200000_diagnostic_persistence.sql` ;
4. `20260713213000_adaptive_practice.sql` ;
5. `20260713223000_progress_analytics.sql` ;
6. `20260713233000_calibrated_mastery_mini_exams.sql` ;
7. `20260714113000_free_tier_usage_limits.sql` ;
8. `20260714173000_stripe_checkout_payments.sql` ;
9. `20260714210000_content_admin_platform.sql` ;
10. `20260714230000_bulk_import_quality_tools.sql`.

La huitième migration complète `subscriptions` et crée `activate_stripe_purchase`, une fonction transactionnelle qui empêche la double activation d’un même paiement et prolonge correctement un accès existant.

La neuvième migration transforme les tables `questions` et `question_options` en catalogue administrable, protège les corrections de tout accès direct, ajoute les champs de contexte et de feedback, puis crée la fonction transactionnelle `save_managed_question`.

La dixième migration ajoute `question_reports` et la fonction transactionnelle `import_managed_questions`. Un import est intégralement annulé si une ligne est invalide ou si un code existe déjà.

## Administration du contenu

Après avoir configuré `ADMIN_EMAILS`, ouvrir :

```text
/admin/questions
```

Une question peut rester en brouillon, passer en relecture, être publiée ou archivée. Dès qu’elle est publiée, elle rejoint automatiquement la sélection des séances adaptatives sans nouveau déploiement Vercel.

L’import massif est disponible dans :

```text
/admin/questions/import
```

Télécharger le modèle CSV depuis cette page. Les colonnes obligatoires comprennent le code, la partie, la compétence, les quatre réponses, la lettre correcte, l’explication et le statut. Les contenus complexes peuvent être entourés de guillemets CSV.

Les utilisateurs peuvent signaler une question après sa correction. Les administrateurs traitent ces retours dans :

```text
/admin/reports
```

Chaque modification remplace atomiquement les quatre options et ajoute une entrée dans `question_admin_events`. Les bonnes réponses et explications sont chargées uniquement sur le serveur avec la clé `service_role`.

## Configuration Stripe

Dans Stripe, créer deux produits avec un prix unique en euros :

- Sprint 30 : 24,90 € ;
- Sprint 90 : 49,90 €.

Copier leurs identifiants `price_...` dans les variables Vercel correspondantes.

Créer ensuite un endpoint webhook pointant vers :

```text
https://votre-domaine/api/stripe/webhook
```

Événements à écouter :

- `checkout.session.completed` ;
- `checkout.session.async_payment_succeeded`.

Copier le secret de signature `whsec_...` dans `STRIPE_WEBHOOK_SECRET`. La page de succès ne donne jamais elle-même Premium : seul le webhook signé active l’accès.

Pour le bouton « Gérer mes paiements », activer et configurer le portail client dans Stripe. Checkout crée un Customer et une facture pour chaque paiement unique.

## Offre gratuite et Premium

Compte gratuit :

- 1 séance par jour ;
- 1 mini-examen par mois ;
- historique des 7 derniers jours.

Premium :

- séances illimitées ;
- mini-examens illimités ;
- historique complet ;
- accès de 30 ou 90 jours sans renouvellement automatique.

Un nouvel achat effectué pendant une période Premium ajoute sa durée après la date d’expiration déjà prévue.

## Sécurité du paiement et du contenu

- les coordonnées bancaires sont saisies sur Stripe Checkout ;
- aucune donnée de carte n’est stockée dans ScoreSprint ;
- le Checkout est créé pour l’utilisateur authentifié ;
- le webhook est vérifié par signature HMAC et horodatage ;
- la clé Supabase `service_role` reste uniquement côté serveur ;
- les achats sont idempotents grâce à l’identifiant unique de la Checkout Session ;
- les tables contenant les bonnes réponses n’accordent aucun accès direct aux utilisateurs ;
- chaque route d’administration vérifie l’adresse du compte authentifié ;
- les imports sont limités à 500 questions et validés avant écriture.

## Vérifications

```bash
npm run typecheck
npm run build
```

Avant la mise en production réelle, tester tout le parcours en mode test Stripe, puis compléter les CGV, la politique de confidentialité, les obligations fiscales et les informations légales.

## Avertissement de marque

TOEIC® est une marque déposée d’ETS. ScoreSprint est indépendant et n’est ni affilié, ni approuvé, ni sponsorisé par ETS. Aucun contenu officiel ne doit être copié ou redistribué.
