# ARCHITECTURE.md — Architecture Technique Réelle

## 1. Arborescence du projet

```text
/
├── .env.example                 # Modèle des variables d'environnement (GEMINI_API_KEY, APP_URL)
├── .gitignore                   # Règles d'exclusion Git (node_modules, dist, .env*, etc.)
├── CLAUDE.md                    # Instructions directes pour Claude Code
├── README.md                    # Prise en main et commandes locales
├── bun.lock                     # Fichier de verrouillage des dépendances
├── index.html                   # Point d'entrée HTML, méta PWA/OG et Google Fonts (Fredoka, Nunito)
├── metadata.json                # Métadonnées AI Studio et capacités serveur Gemini
├── netlify.toml                 # Configuration déploiement statique Netlify
├── package.json                 # Dépendances et scripts npm
├── package-lock.json            # Verrouillage npm, dont lottie-web 5.13.0
├── server.ts                    # Serveur Express (/api/health, /api/config, /api/tutor) + Vite dev middleware
├── tsconfig.json                # Configuration TypeScript (ES2022, react-jsx, bundler)
├── vercel.json                  # Configuration déploiement Vercel
├── vite.config.ts               # Build Vite + Tailwind v4 + VitePWA (Workbox) + copie assets
├── docs/
│   └── handoff/                 # Documentation complète de passation
│       ├── ARCHITECTURE.md
│       ├── DESIGN_SYSTEM.md
│       ├── FEATURE_STATUS.md
│       ├── HANDOFF.md
│       ├── KNOWN_ISSUES.md
│       ├── LOTTIE_ANIMATIONS.md    # Catalogue, sources, licences, usages et vérifications
│       ├── NEXT_STEPS.md
│       └── SVG_ANIMATIONS.md
├── public/
│   ├── apple-touch-icon.png     # Icône iOS (180×180)
│   ├── icon.svg                 # Icône vectorielle PWA
│   ├── pwa-192x192.png          # Icône PWA 192×192
│   ├── pwa-512x512.png          # Icône PWA 512×512
│   ├── pwa-maskable-512x512.png # Icône PWA maskable
│   └── assets/aistudio/         # Ressources originales fournies (6 PNG Mobbin + Turkey_Power_Walk_3833b87d.svg)
└── src/
    ├── App.tsx                  # État global (UserState), persistance localStorage, routeur d'écrans
    ├── index.css                # Tailwind v4 + polices + safe areas + reduced-motion
    ├── main.tsx                 # Montage React root
    ├── assets/animations/       # 18 JSON locaux + registry.ts + licence et sources
    ├── types/
    │   ├── animations.ts        # Contrats du lecteur et du registre
    │   └── math.ts              # Modèles TypeScript (UserState, Chapter, NotionLesson, Exercise, VisualModel...)
    ├── data/
    │   ├── curriculum.ts        # Générateur adaptatif CP–6e des 10 notions (5 chapitres)
    │   └── rewards.ts           # Définitions des 5 badges (BADGE_DEFINITIONS)
    ├── hooks/
    │   └── usePWAInstall.ts     # Détection installation PWA (beforeinstallprompt / iOS) et statut réseau
    ├── utils/
    │   ├── gameLogic.ts         # Règles pures : progression, XP, étoiles, défis, badges, rollover quotidien
    │   ├── gameLogic.test.ts    # Suite de tests unitaires (node:test via tsx)
    │   ├── sound.ts             # Synthèse audio Web Audio API (tap, correct, incorrect, coin, victory)
    │   ├── lottieAssets.ts      # Chargement mutualisé/validation/clonage et palette
    │   ├── lottieAssets.test.ts # Tests des assets et de leur chargement
    │   └── tutorEngine.ts       # Appel /api/tutor + moteur de repli déterministe hors-ligne
    └── components/
        ├── ChallengesTab.tsx    # Onglet Défis du jour et réclamation de récompenses XP
        ├── CurriculumScreen.tsx # Onglet Parcours (5 chapitres, 10 notions, Mode libre)
        ├── ExplanationView.tsx  # Écran E (« Pourquoi ? ») avec explication visuelle et mini-quiz
        ├── HomeScreen.tsx       # Onglet Accueil (progression, notion suivante, objectif du jour)
        ├── LottieIcon.tsx       # Lecteur SVG light, déclenchements, pause et fallback
        ├── LessonScreen.tsx     # Orchestrateur de leçon (header XP, phases, tiroir feedback)
        ├── MobileFrameShell.tsx # Conteneur 100dvh mobile + simulateur smartphone desktop + QR code
        ├── OnboardingScreen.tsx # WelcomeScreen & ProfileSetupScreen
        ├── ProfileTab.tsx       # Onglet Profil (stats, maîtrise par domaine, badges, classe, réglages)
        ├── QRShareModal.tsx     # Modale plein écran de partage QR Code et copie d'URL
        ├── VictoryScreen.tsx    # Écran de bilan post-leçon + ErrorReviewScreen
        ├── VisualStage.tsx      # Rendu diagrammes (barres, grilles, groupes, balances, géométrie SVG)
        ├── exercises/
        │   └── InteractiveManipulator.tsx # Carrousel découverte + 5 manipulateurs tactiles dédiés
        └── mascot/
            ├── MascotController.tsx # Façades et props unifiées de la mascotte
            ├── TurkeyMascot.tsx     # Rig SVG articulé (8 états, clignement, regard)
            └── turkeySvgData.ts     # Calques vectoriels extraits du SVG original
```

---

## 2. Schéma Mermaid des relations et flux de données

```mermaid
flowchart TD
    User([Enfant 6-12 ans]) --> Shell[MobileFrameShell]
    Shell --> App[App.tsx - UserState & localStorage]

    App -->|screen = onboarding| Onb[OnboardingScreen]
    App -->|screen = main| Tabs[Navigation 4 onglets]
    App -->|screen = lesson| Lesson[LessonScreen]
    App -->|screen = result| Victory[VictoryScreen]
    App -->|screen = review| Review[ErrorReviewScreen]

    Tabs --> Home[HomeScreen]
    Tabs --> Path[CurriculumScreen]
    Tabs --> Challenges[ChallengesTab]
    Tabs --> Profile[ProfileTab]

    App -->|getExercisesForNotion| Curriculum[src/data/curriculum.ts]
    App -->|applyLessonCompletion / claimChallenge| Logic[src/utils/gameLogic.ts]

    Lesson --> Stage[VisualStage]
    Lesson --> Manip[InteractiveManipulator]
    Lesson -->|Pourquoi ?| Explain[ExplanationView]

    Explain --> Tutor[src/utils/tutorEngine.ts]
    Tutor -->|Si geminiAvailable| API[POST /api/tutor - server.ts]
    API -->|@google/genai| Gemini[(Gemini API)]
    Tutor -->|Sinon / Repli| Offline[buildOfflineTutorResponse]

    Onb & Home & Lesson & Explain & Victory & Profile --> Mascot[MascotController -> TurkeyMascot]
```

---

## 3. Responsabilités des couches

### `src/types/math.ts`
Contient l'ensemble des contrats TypeScript partagés (`GradeLevel`, `AppScreen`, `MainTab`, `MathTopic`, `PedagogicalPhase`, `ExerciseType`, `Exercise`, `NotionLesson`, `Chapter`, `UserState`, `TutorResponse`, etc.).

### `src/utils/gameLogic.ts`
Logique métier **pure** (sans dépendance React/DOM) :
- `CHAPTERS` (5 chapitres, 10 notions) et `DAILY_CHALLENGES` (3 missions journalières).
- `getNotionStatus` : résout `'available' | 'completed' | 'locked'` selon `requiresNotionId` et `demoMode`.
- `applyLessonCompletion` : calcule les étoiles, XP, précision, stats par domaine et déblocage automatique des badges.
- `syncDailyRollover` : remet à zéro les compteurs journaliers à chaque changement de date et gère la continuité du `streak`.

### `src/data/curriculum.ts`
`getExercisesForNotion(notionId, grade)` produit dynamiquement les exercices de chacune des 10 notions en ajustant les valeurs numériques selon `GRADE_SCALES[grade]` (`CP` à `6e`).

### `src/hooks/usePWAInstall.ts`
Expose deux hooks :
- `usePWAInstall()` : écoute `beforeinstallprompt` et `appinstalled`, détecte iOS Safari (`isIOS`) et le mode standalone (`isInstalled`).
- `useOnlineStatus()` : suit `navigator.onLine` en temps réel pour afficher la bannière hors-ligne dans `App.tsx`.

### `server.ts`
Serveur Express léger servant :
- `GET /api/health` : statut du service.
- `GET /api/config` : expose `{ hasGeminiKey, publicUrl }` sans jamais fuiter la clé API.
- `POST /api/tutor` : génère une explication structurée en JSON (`responseSchema`) via `gemini-4-hydrogen` (ou renvoie `source: 'offline-required'` si aucune clé n'est configurée).
- En développement : monte `vite.middlewares`. En production (`NODE_ENV=production`) : sert `dist/` en fallback SPA.

### Icônes Lottie (`src/components/LottieIcon.tsx`)

Le registre n'importe que des URLs (`?url&no-inline`). Le contenu JSON et `lottie-web/build/player/lottie_light` sont chargés seulement quand une icône devient visible. `lottieAssets.ts` mutualise les téléchargements, valide les données et fournit un clone par lecteur. Les contrôles conservent leurs libellés ; l'icône est décorative (`aria-hidden`). Lecture ponctuelle sur interaction/état, pause hors viewport/onglet, destruction au démontage et fallback statique si erreur, mouvement réduit ou couleurs forcées. Aucune dépendance à `UserState` et aucune modification de sa sauvegarde.

Vite émet les 18 JSON hashés dans `dist/assets/`, Workbox les pré-cache avec le chunk du lecteur. Le plugin de copie exclut les animations déjà émises et distribue les notices dans `dist/licenses/lottie/`. Voir `LOTTIE_ANIMATIONS.md` pour catalogue et exceptions. `tests/lottie-browser.mjs` vérifie le build dans un navigateur Chrome isolé ; `tests/fixtures/lottie.*` est une fixture de développement, pas un écran de production.

### Navigation (`App.tsx`)
La navigation n'utilise pas React Router mais un automate d'état à 2 niveaux :
- `screen`: `'onboarding' | 'main' | 'lesson' | 'result' | 'review'`
- `activeTab`: `'home' | 'path' | 'challenges' | 'profile'` (actif quand `screen === 'main'`)
- Overlays : `explanationOpen` dans `LessonScreen` (Écran E) et `qrModalOpen` dans `App.tsx`.
