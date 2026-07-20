# Aptileo

Aptileo est une plateforme indépendante de préparation adaptative au TOEIC® Listening & Reading. Elle analyse les réponses, programme les erreurs à revoir et construit des séances ciblées.

> Le dépôt conserve provisoirement son ancien nom technique `scoresprint`. La marque visible du produit est Aptileo.

## État actuel

Aptileo fonctionne en **bêta publique gratuite**. Les paiements sont volontairement désactivés avec `BETA_MODE=true` tant que la couverture pédagogique, les tests utilisateurs et les informations légales ne sont pas finalisés.

Fonctionnalités principales :

- démonstration publique de 8 questions Reading et Listening, sans compte ;
- compte Supabase avec confirmation, récupération, export et suppression ;
- diagnostic original de 20 questions ;
- Reading : parties 5, 6 et 7, environ 300 questions, séance adaptative, carnet d’erreurs et mini-examen ;
- Listening : parties 1 et 2, 30 exercices, photographies Pexels, lecture vocale et transcription après correction ;
- 12 fiches express de grammaire, vocabulaire et stratégie ;
- sauvegarde et reprise des séances ;
- historique, statistiques et estimation interne ;
- liste d’attente Premium et formulaire structuré de retour ;
- mesure interne du tunnel de bêta, sans publicité ni stockage de l’adresse IP brute ;
- espace administrateur pour le contenu, les signalements, le pré-lancement et la validation produit ;
- Stripe Checkout prêt mais bloqué pendant la bêta ;
- pages juridiques, SEO de base, headers de sécurité et limitation des routes sensibles.

Aucune question officielle TOEIC® n’est copiée. Les exercices utilisent uniquement la structure générale de l’épreuve.

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
RATE_LIMIT_SALT=une-valeur-longue-et-aleatoire
BETA_MODE=true
ADMIN_EMAILS=admin@example.com

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_SPRINT_30=price_...
STRIPE_PRICE_SPRINT_90=price_...
```

Les secrets restent exclusivement côté serveur. Ne jamais les préfixer par `NEXT_PUBLIC_`, les publier ou les committer.

`BETA_MODE=true` :

- affiche clairement l’état de bêta ;
- remplace l’achat par une liste d’attente ;
- bloque toute création de Checkout, même si Stripe est configuré.

Pour ouvrir les paiements plus tard, il faudra renseigner les variables `LEGAL_*`, passer `BETA_MODE=false`, puis effectuer les tests Stripe Live.

## Migrations Supabase

Exécuter les migrations dans cet ordre :

1. `20260713150000_initial_schema.sql`
2. `20260713173000_auth_and_goal_persistence.sql`
3. `20260713200000_diagnostic_persistence.sql`
4. `20260713213000_adaptive_practice.sql`
5. `20260713223000_progress_analytics.sql`
6. `20260713233000_calibrated_mastery_mini_exams.sql`
7. `20260714113000_free_tier_usage_limits.sql`
8. `20260714173000_stripe_checkout_payments.sql`
9. `20260714210000_content_admin_platform.sql`
10. `20260714230000_bulk_import_quality_tools.sql`
11. `20260715193000_account_and_session_resume.sql`
12. `20260716110000_listening_parts_1_2.sql`
13. `20260718143000_production_rate_limits.sql`
14. `20260720120000_public_beta_validation.sql`

La quatorzième migration crée :

- `product_events` pour la mesure interne du tunnel ;
- `premium_waitlist` pour les inscriptions volontaires ;
- `beta_feedback` pour les retours structurés.

Ces tables sont protégées par RLS et accessibles uniquement avec la clé serveur.

## Parcours publics

- `/demo` : 8 questions publiques avec corrections ;
- `/lessons` : bibliothèque de fiches express ;
- `/pricing` : bêta gratuite et liste d’attente ;
- `/feedback` : retour utilisateur structuré ;
- `/faq`, `/contact`, `/privacy`, `/terms` : confiance et assistance.

## Parcours connecté

- `/dashboard` : progression et priorité du jour ;
- `/reading` : séance, erreurs, diagnostic, mini-examen et fiches ;
- `/listening` : parties 1 et 2 ;
- `/history` : historique détaillé ;
- `/account` : profil, accès, données et suppression.

## Administration

- `/admin/beta` : visiteurs, démos, intentions d’inscription, liste d’attente et retours ;
- `/admin/launch` : état de préparation bêta et commerciale ;
- `/admin/questions` : catalogue et édition ;
- `/admin/questions/seed` : installation du lot de 200 questions ;
- `/admin/questions/import` : import CSV facultatif ;
- `/admin/reports` : traitement des signalements.

## Vérifications

```bash
npm run validate:questions
npm run validate:listening
npm run validate:launch
npm run validate:beta
npm run typecheck
npm run build
```

La CI contrôle les banques de questions, les photographies, la démonstration, les 12 fiches, le blocage des paiements en bêta, les pages publiques, la sécurité, TypeScript et le build de production.

## Avant une ouverture commerciale

1. Terminer les parties Listening 3 et 4 avec des fichiers audio fixes ;
2. ajouter des examens blancs plus longs et une banque plus large ;
3. analyser les données de la bêta et corriger les abandons ;
4. faire relire les questions et fiches par une personne qualifiée ;
5. vérifier le nom Aptileo et acheter le domaine ;
6. créer l’activité professionnelle et renseigner les informations légales ;
7. configurer le SMTP, le monitoring et les sauvegardes ;
8. tester plusieurs navigateurs et appareils ;
9. effectuer un achat Stripe Live contrôlé puis un remboursement ;
10. seulement ensuite passer `BETA_MODE=false`.

## Indépendance

TOEIC® est une marque déposée d’ETS. Aptileo est indépendant et n’est ni affilié, ni approuvé, ni sponsorisé par ETS. Les scores affichés sont des estimations internes et ne constituent pas des résultats officiels.
