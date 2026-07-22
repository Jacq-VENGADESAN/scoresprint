# Aptileo

Aptileo est une plateforme indépendante de préparation adaptative au TOEIC® Listening & Reading. Elle analyse les réponses, programme les erreurs à revoir et construit des séances ciblées.

> Le dépôt conserve provisoirement son ancien nom technique `scoresprint`. La marque visible du produit est Aptileo.

## État actuel

Le projet reste protégé par `BETA_MODE=true` pendant la configuration commerciale. Les paiements réels doivent rester bloqués jusqu’à la validation des informations légales, du médiateur, du domaine, de Stripe Live, du SMTP et des tests finaux.

Fonctionnalités principales :

- démonstration publique de 8 questions, sans compte ;
- diagnostic original de 20 questions ;
- Reading parties 5, 6 et 7, environ 300 questions, séance adaptative, carnet d’erreurs et mini-examen ;
- Listening parties 1 et 2 avec photographies réelles, lecture vocale et transcription après correction ;
- randomisation des démonstrations, diagnostics, séances Reading, séances Listening et mini-examens ;
- reprise d’une séance interrompue dans son ordre exact ;
- 12 fiches de grammaire, vocabulaire et stratégie ;
- historique, statistiques, export et suppression du compte ;
- Stripe Checkout, quotas et espace administrateur ;
- Coach 90 avec programme IA de 7 jours et explications personnalisées ;
- pages juridiques, SEO de base, sécurité et limitation anti-abus.

Aucune question officielle TOEIC® n’est copiée.

## Offres prévues

### Gratuit

- démonstration et diagnostic ;
- 1 séance Reading par jour ;
- Listening parties 1 et 2 ;
- 1 mini-examen par mois ;
- historique limité.

### Sprint 30 — 9,90 € au lancement

Paiement unique pour 30 jours :

- Reading et Listening illimités ;
- mini-examens illimités ;
- carnet d’erreurs et répétition espacée ;
- historique et statistiques complets ;
- toutes les fiches pédagogiques.

### Coach 90 — 24,90 € au lancement

Paiement unique pour 90 jours :

- toutes les fonctions du Sprint 30 ;
- programme hebdomadaire généré à partir des objectifs, maîtrises et erreurs ;
- explications personnalisées d’erreurs vérifiées ;
- 10 crédits IA quotidiens ;
- nouveaux contenus ajoutés pendant l’accès.

Un programme utilise 3 crédits. Une explication utilise 1 crédit. Les crédits sont remboursés automatiquement si l’appel IA échoue.

## Randomisation

Chaque nouvelle tentative reçoit un ordre renouvelé :

- `/demo` ;
- `/diagnostic` ;
- `/practice` ;
- `/listening` ;
- `/mock-exam`.

Les profils et priorités pédagogiques restent respectés. Les brouillons stockent les identifiants de questions afin de reprendre une séance exactement dans le même ordre.

## Démarrage local

```bash
cp .env.example .env.local
npm install
npm run dev
```

Ouvrir `http://localhost:3000`.

## Variables principales

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RATE_LIMIT_SALT=
BETA_MODE=true
ADMIN_EMAILS=admin@example.com

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_SPRINT_30=
STRIPE_PRICE_SPRINT_90=

OPENAI_API_KEY=
OPENAI_MODEL=gpt-5-mini
```

Les secrets restent uniquement côté serveur. Ne jamais utiliser `NEXT_PUBLIC_` pour une clé secrète.

## Informations légales

```env
LEGAL_BUSINESS_NAME=Aptileo
LEGAL_PUBLISHER_NAME=
LEGAL_STATUS=Entrepreneur individuel - micro-entrepreneur
LEGAL_ADDRESS=
LEGAL_SIREN=
LEGAL_SIRET=
LEGAL_APE_CODE=
LEGAL_VAT_NUMBER=
LEGAL_CONTACT_EMAIL=
LEGAL_SUPPORT_EMAIL=
LEGAL_PHONE=
LEGAL_MEDIATOR_NAME=
LEGAL_MEDIATOR_URL=
LEGAL_MEDIATOR_ADDRESS=
```

Les vrais numéros SIREN/SIRET et coordonnées doivent être ajoutés dans Vercel, jamais dans GitHub.

## OpenAI

Le Coach 90 utilise l’API Responses côté serveur :

- `store: false` ;
- sorties JSON strictement structurées ;
- aucun chatbot libre ;
- aucun nom, e-mail, mot de passe ou donnée bancaire envoyé ;
- quotas journaliers atomiques dans Supabase ;
- la bonne réponse Aptileo reste la source de vérité.

## Migrations Supabase

Exécuter les migrations existantes dans leur ordre chronologique, puis :

14. `20260720120000_public_beta_validation.sql`
15. `20260722190000_coach_90_ai_and_launch_legal.sql`

La quinzième migration crée :

- `ai_coach_usage` ;
- `ai_coach_plans` ;
- `consume_ai_coach_credit` ;
- `refund_ai_coach_credit`.

## Parcours

Publics :

- `/demo` ;
- `/lessons` ;
- `/pricing` ;
- `/faq` ;
- `/contact` ;
- `/legal`, `/privacy`, `/terms`.

Connectés :

- `/dashboard` ;
- `/reading` ;
- `/listening` ;
- `/coach` ;
- `/errors` ;
- `/history` ;
- `/account`.

Administration :

- `/admin/launch` ;
- `/admin/beta` ;
- `/admin/questions` ;
- `/admin/reports`.

## Vérifications

```bash
npm run validate:questions
npm run validate:listening
npm run validate:launch
npm run validate:beta
npm run validate:coach
npm run typecheck
npm run build
```

## Avant `BETA_MODE=false`

1. Exécuter toutes les migrations Supabase ;
2. renseigner les variables SIREN, SIRET, adresse, téléphone et contact ;
3. désigner un médiateur de la consommation ;
4. faire relire les pages juridiques ;
5. vérifier le nom Aptileo et connecter le domaine ;
6. configurer le SMTP Supabase avec SPF, DKIM et DMARC ;
7. créer les deux prix Stripe Live à 9,90 € et 24,90 € ;
8. créer le webhook Live ;
9. configurer `OPENAI_API_KEY` et vérifier le budget ;
10. tester inscription, récupération, entraînement, randomisation, Coach 90, paiement, activation et remboursement ;
11. tester les principaux navigateurs et appareils ;
12. seulement ensuite passer `BETA_MODE=false`.

## Indépendance

TOEIC® est une marque déposée d’ETS. Aptileo est indépendant et n’est ni affilié, ni approuvé, ni sponsorisé par ETS. Les scores affichés sont des estimations internes.
