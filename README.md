# Aptileo

Aptileo est une plateforme indépendante de préparation adaptative à l’anglais professionnel. Elle analyse les réponses, programme les erreurs à revoir et construit des séances ciblées en Reading et Listening.

> Le dépôt conserve provisoirement son ancien nom technique `scoresprint`. La marque visible du produit est Aptileo.

## Fonctionnalités

- compte Supabase avec confirmation, récupération, export et suppression ;
- diagnostic original de 20 questions ;
- Reading : parties 5, 6 et 7, séance adaptative, carnet d’erreurs et mini-examen chronométré ;
- Listening : parties 1 et 2, photographies réelles sous licence Pexels, lecture vocale, transcription après correction et progression distincte ;
- environ 300 questions Reading originales et 30 exercices Listening originaux ;
- sauvegarde et reprise des séances ;
- historique, statistiques et estimation interne ;
- espace administrateur, import CSV, publication et signalements ;
- offre gratuite avec quotas côté serveur ;
- paiements uniques Stripe de 30 ou 90 jours, sans renouvellement automatique ;
- pages juridiques, footer, sitemap, robots, Open Graph et manifest ;
- headers de sécurité et limitation des routes sensibles ;
- tableau de pré-lancement dans `/admin/launch`.

Aucune question officielle TOEIC® n’est copiée. Les exercices sont originaux et utilisent seulement la structure générale de l’épreuve.

## Démarrage local

```bash
cp .env.example .env.local
npm install
npm run dev
```

Ouvrir `http://localhost:3000`.

## Variables d’environnement

### Application, Supabase et administration

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
RATE_LIMIT_SALT=une-valeur-longue-et-aleatoire
ADMIN_EMAILS=admin@example.com
```

### Stripe

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_SPRINT_30=price_...
STRIPE_PRICE_SPRINT_90=price_...
```

### Informations légales

```env
LEGAL_BUSINESS_NAME=Aptileo
LEGAL_PUBLISHER_NAME=
LEGAL_STATUS=
LEGAL_ADDRESS=
LEGAL_REGISTRATION=
LEGAL_CONTACT_EMAIL=contact@aptileo.fr
LEGAL_SUPPORT_EMAIL=support@aptileo.fr
LEGAL_MEDIATOR_NAME=
LEGAL_MEDIATOR_URL=
LEGAL_HOST_NAME=Vercel Inc.
LEGAL_HOST_ADDRESS=440 N Barranca Ave #4133, Covina, CA 91723, États-Unis
```

Les secrets `SUPABASE_SERVICE_ROLE_KEY`, `RATE_LIMIT_SALT`, `STRIPE_SECRET_KEY` et `STRIPE_WEBHOOK_SECRET` restent exclusivement côté serveur. Ne jamais les préfixer par `NEXT_PUBLIC_`, les coller dans une conversation ou les committer.

Stripe Live est automatiquement bloqué tant que les informations légales obligatoires ne sont pas complètes.

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

La dernière migration crée un compteur PostgreSQL utilisé pour limiter la connexion, l’inscription, la récupération de mot de passe et la création de Checkout. Seule la clé `service_role` peut appeler la fonction.

## Structure utilisateur

- `/dashboard` : progression et priorité du jour ;
- `/reading` : hub Reading vers séance, erreurs, diagnostic et mini-examen ;
- `/listening` : hub et séances Listening parties 1 et 2 ;
- `/history` : historique détaillé ;
- `/account` : profil, accès, données et suppression.

## Administration

- `/admin/launch` : état de préparation à la production ;
- `/admin/questions` : catalogue et édition ;
- `/admin/questions/seed` : installation du lot de 200 questions ;
- `/admin/questions/import` : import CSV facultatif ;
- `/admin/reports` : traitement des signalements.

## Photographies du Listening

Les dix exercices de Partie 1 utilisent de vraies photographies Pexels. Le crédit et un lien vers la page source sont affichés sous chaque photographie. Les phrases audio et les distracteurs sont écrits spécialement pour Aptileo.

Ne pas importer d’images trouvées au hasard sur Internet et ne pas recopier de questions ETS ou provenant d’un autre site de préparation.

## Stripe

Créer deux prix uniques :

- Sprint 30 : 24,90 € ;
- Sprint 90 : 49,90 €.

Webhook :

```text
https://votre-domaine/api/stripe/webhook
```

Événements :

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`

Le Checkout exige l’acceptation des CGU/CGV et la demande d’activation immédiate. La date de consentement est ajoutée aux métadonnées Stripe. Seul le webhook signé active Premium.

## Vérifications

```bash
npm run validate:questions
npm run validate:listening
npm run validate:launch
npm run typecheck
npm run build
```

La CI contrôle notamment :

- la banque Reading ;
- les 10 photographies et 20 questions-réponses Listening ;
- la présence de Reading et Listening dans la navigation ;
- les pages juridiques et SEO ;
- le consentement avant paiement ;
- les headers de sécurité ;
- l’absence de l’ancien nom dans les principaux écrans publics.

## Checklist avant Stripe Live

1. Vérifier le nom Aptileo sur INPI et EUIPO ;
2. acheter et connecter le domaine définitif ;
3. remplacer `NEXT_PUBLIC_APP_URL` et mettre à jour Supabase/Stripe ;
4. renseigner toutes les variables `LEGAL_*` et faire relire les textes ;
5. désigner un médiateur de la consommation ;
6. configurer un SMTP Supabase personnalisé avec SPF, DKIM et DMARC ;
7. exécuter les treize migrations ;
8. tester inscription, récupération, diagnostic, Reading, Listening, quotas et reprise ;
9. tester un paiement Stripe en mode Test, puis un achat Live contrôlé et son remboursement ;
10. mettre en place les alertes Vercel, Supabase et le suivi des erreurs ;
11. faire relire la banque pédagogique ;
12. tester Chrome, Edge, Firefox, Safari, Android et iPhone.

## Indépendance

TOEIC® est une marque déposée d’ETS. Aptileo est indépendant et n’est ni affilié, ni approuvé, ni sponsorisé par ETS. Les scores affichés sont des estimations internes et ne constituent pas des résultats officiels.
