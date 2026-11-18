# HANDOFF.md — Document principal de reprise (LumiMath)

## 1. Vision générale & objectif du produit

**LumiMath** est un prototype fonctionnel d'application éducative mobile-first (PWA) dédiée à l'apprentissage actif des mathématiques pour les enfants francophones de **6 à 12 ans** (du **CP à la 6e**).

La référence pédagogique et UX est **Brilliant — Your Personal Tutor** (et non un clone ludique type Duolingo) :
- Interface blanche, épurée, centrée sur le raisonnement et la manipulation visuelle.
- Pas de punition ni de système de cœurs/vies : l'erreur déclenche un retour bienveillant et un accès direct à un écran dédié **« Pourquoi ? »** (`ExplanationView`).
- Progression logique par **chapitres et notions**, où chaque notion suit un cycle actif :
  **Découverte → Observation → Manipulation directe → Question → Feedback → Explication visuelle → Application & Bilan**.

---

## 2. Public cible & langue

- **Âge** : 6 à 12 ans (`CP`, `CE1`, `CE2`, `CM1`, `CM2`, `6e`).
- **Langue** : 100 % **français** (interface, consignes, feedbacks, géométrie et prompts du tuteur IA).
- **Adaptation par niveau** : `src/data/curriculum.ts` ajuste automatiquement les ordres de grandeur et les défis générés selon `userState.profile.grade`.

---

## 3. Fonctionnalités développées

1. **Onboarding & Mode démo** (`src/components/OnboardingScreen.tsx`) :
   - Écran de bienvenue (`WelcomeScreen`) avec mascotte animée, promesse produit, bouton **« Commencer »** et accès direct **« Essayer directement (Mode démo) »**.
   - Configuration profil (`ProfileSetupScreen`) : saisie du prénom avec validation et choix de la classe (`CP` à `6e`).
   - Support du paramètre URL `?autostart=1` pour passer directement à l'écran principal.
2. **Accueil personnalisé** (`src/components/HomeScreen.tsx`) :
   - Carte coach avec la mascotte et la barre de progression globale.
   - Carte principale **« À continuer maintenant »** pointant vers la prochaine notion disponible.
   - Raccourci **« Objectif du jour »** (progression XP quotidienne) et **3 activités recommandées** multi-domaines.
3. **Parcours pédagogique par chapitres** (`src/components/CurriculumScreen.tsx`) :
   - **5 chapitres** et **10 notions** :
     - Chapitre 1 : *Addition & Assemblage* (`ch1-n1`, `ch1-n2`)
     - Chapitre 2 : *Soustraction & Écart* (`ch2-n1`, `ch2-n2`)
     - Chapitre 3 : *Multiplication en Grilles* (`ch3-n1`, `ch3-n2`)
     - Chapitre 4 : *Partage & Division* (`ch4-n1`, `ch4-n2`)
     - Chapitre 5 : *Découverte de la Géométrie* (`ch5-n1`, `ch5-n2`)
   - États des notions : `Disponible`, `Revoir` (terminé avec étoiles et meilleur score %), `Verrouillé`.
   - Interrupteur **« Mode libre / Tout débloqué »** (`demoMode`) pour tester librement n'importe quelle notion.
4. **Moteur de leçon en 7 étapes & manipulations tactiles** (`src/components/LessonScreen.tsx`, `src/components/exercises/InteractiveManipulator.tsx`, `src/components/VisualStage.tsx`) :
   - **Carrousel Découverte & Observation (`discover-stepper`)** : slides illustrés avec navigation `◀ ••• ▶`.
   - **5 manipulateurs tactiles dédiés** :
     - `manipulate-addition` : réunion de pommes rouges (`🍎`) et vertes (`🍏`) ou d'étoiles depuis deux paniers vers un bol central.
     - `manipulate-soustraction` : retrait tactile d'éléments barrés avec compteur en temps réel.
     - `manipulate-multiplication` : grille interactive cliquable + boutons pas-à-pas `Lignes` / `Colonnes`.
     - `manipulate-division` : distribution équitable de jetons tour à tour dans 2 à 3 paniers.
     - `manipulate-geometrie` : allumage tactile des côtés d'un pentagone SVG et marquage des 4 angles droits d'un carré SVG.
   - **Formats d'évaluation** : `qcm`, `fill-blank`, `compare` (balance visuelle), `order` (tri croissant/décroissant), `match` (association de paires).
   - **Tiroir de feedback** : bannière verte `#DCFCE7` (`Bravo !`, `+15 XP`, `Pourquoi ?`, `Continuer` / `Voir mon bilan`) ou rouge doux `#FEF2F2` (`Pas tout à fait`).
5. **Écran d'explication visuelle dédié (`Pourquoi ?`)** (`src/components/ExplanationView.tsx`, `src/utils/tutorEngine.ts`, `server.ts`) :
   - Mascotte en état `explaining`, diagramme récapitulatif immédiat (`exercise.simpleExplanation` + `exercise.visualHint`).
   - Appel asynchrone à `POST /api/tutor` (modèle `gemini-4-hydrogen` via `@google/genai`) si `GEMINI_API_KEY` est configurée, avec repli déterministe hors-ligne instantané (`buildOfflineTutorResponse`) et mini-exercice interactif de réassurance à 3 choix.
6. **Bilan de fin de leçon & révision des erreurs** (`src/components/VictoryScreen.tsx`) :
   - Mascotte `celebrating`, confettis (`canvas-confetti`), 1 à 3 étoiles, `+XP`, précision %, nouveaux badges débloqués (`BADGE_DEFINITIONS`), proposition de la notion suivante et accès à `ErrorReviewScreen` si au moins une erreur a été commise.
7. **Défis quotidiens & Profil** (`src/components/ChallengesTab.tsx`, `src/components/ProfileTab.tsx`) :
   - 3 défis journaliers réclamables (`claimChallengeReward`) avec barre de progression.
   - Statistiques par domaine mathématique, collection de badges, changement de classe à chaud, réglages (son Web Audio synthétisé, mode démo, QR code, réinitialisation).
8. **Cadre mobile, PWA & partage QR Code** (`src/components/MobileFrameShell.tsx`, `src/components/QRShareModal.tsx`, `src/hooks/usePWAInstall.ts`) :
   - Sur mobile (`< 1024px`) : plein écran `100dvh`. Sur desktop (`lg:`) : simulation smartphone `390×812px` centrée + panneau compagnon avec QR code scannable.

---

## 4. Écrans disponibles & navigation

La navigation racine est pilotée par l'état `screen: AppScreen` dans `src/App.tsx` (sans routeur URL multi-pages, idéal pour une sensation native mobile) :

| Écran | Valeur `screen` | Composant | Rôle |
|---|---|---|---|
| Bienvenue | `'onboarding'` (`step='welcome'`) | `WelcomeScreen` | Accroche, mascotte, `Commencer` / `Mode démo` |
| Configuration profil | `'onboarding'` (`step='setup'`) | `ProfileSetupScreen` | Prénom + choix classe `CP`–`6e` |
| Hub principal (4 onglets) | `'main'` (`activeTab`: `'home' \| 'path' \| 'challenges' \| 'profile'`) | `HomeScreen`, `CurriculumScreen`, `ChallengesTab`, `ProfileTab` | Navigation basse fixe à 4 onglets |
| Leçon interactive | `'lesson'` | `LessonScreen` + `InteractiveManipulator` | Déroulé des étapes d'une notion |
| Explication visuelle | Overlay dans `'lesson'` (`explanationOpen`) | `ExplanationView` | Explication « Pourquoi ? » + mini-quiz |
| Résultat | `'result'` | `VictoryScreen` | Bilan XP, étoiles, badges, étape suivante |
| Révision des erreurs | `'review'` | `ErrorReviewScreen` | Liste des erreurs de la session + explications |
| Modale QR Code | Overlay global (`qrModalOpen`) | `QRShareModal` | Partage lien public sur téléphone |

---

## 5. Architecture technique & technologies

- **Frontend** : React `19.0.1`, TypeScript `7.0.2`, Vite `8.3.0`, Tailwind CSS `4.3.3` (`@tailwindcss/vite`).
- **Animations** : `motion` (`12.23.24` / Framer Motion v12), `canvas-confetti` (`1.9.4`), lecteur SVG léger `lottie-web` (`5.13.0`, import dynamique).
- **Icônes & QR** : micro-interactions LottieFiles locales (`src/assets/animations/`, catalogue dans `LOTTIE_ANIMATIONS.md`), `lucide-react` (`0.546.0`, exceptions et fallbacks), `qrcode.react` (`4.2.0`).
- **PWA** : `vite-plugin-pwa` (`2.0.0`) + Workbox (génère `sw.js` et `manifest.webmanifest` dans `dist/`).
- **Backend** : `express` (`4.21.2`), `dotenv` (`17.2.3`), `tsx` (`4.21.0`), `@google/genai` (`3.5.0`).
- **Tests unitaires** : runner natif `node:test` exécuté via `tsx --test`.

### Commandes pour lancer le projet

```bash
npm install
npm run dev        # Lance server.ts (Express + Vite HMR sur http://localhost:3000)
npm run lint       # TypeScript: tsc --noEmit
npm run build      # Build frontend + PWA dans dist/
npm start          # Serveur production (NODE_ENV=production tsx server.ts)
npx tsx --test src/utils/gameLogic.test.ts   # Tests unitaires métier
```

### Variables d'environnement

- `PORT` : port HTTP du serveur Express (défaut `3000`).
- `GEMINI_API_KEY` : clé API Google Gemini côté serveur pour `POST /api/tutor`. Si absente ou égale à `MY_GEMINI_API_KEY`, le serveur renvoie `{ source: 'offline-required' }` et le client utilise `buildOfflineTutorResponse`.
- `APP_URL` : URL publique optionnelle exposée via `GET /api/config` pour le QR code.

---

## 6. Sauvegarde locale, exercices, progression et animations

- **Sauvegarde locale** (`src/App.tsx`, `src/utils/gameLogic.ts`) :
  - Stockée automatiquement dans `window.localStorage` sous la clé `lumimath_brilliant_v2` (`STORAGE_KEY`).
  - `syncDailyRollover` vérifie la date locale (`YYYY-MM-DD`) au chargement : si un jour s'est écoulé depuis `lastActiveDate`, `streak` augmente de 1 ; si plus d'un jour s'est écoulé, `streak` repart à 1 ; les compteurs journaliers (`xpToday`, `lessonsToday`, `correctToday`, `hasPerfectLessonToday`, `claimedChallenges`) sont remis à zéro.
- **Exercices** (`src/data/curriculum.ts`) :
  - `getExercisesForNotion(notionId, grade)` renvoie un tableau d'`Exercise` typés (`decouverte` → `manipulation` → `question` → `application`), dont les valeurs numériques s'adaptent aux paramètres de `GRADE_SCALES[grade]`.
- **Progression** (`src/utils/gameLogic.ts`) :
  - `getNotionStatus` vérifie `requiresNotionId` pour débloquer la notion 2 d'un chapitre après la notion 1 (sauf si `demoMode === true`, auquel cas tout est `'available'` ou `'completed'`).
  - `applyLessonCompletion` calcule étoiles (`>=90%` → 3, `>=65%` → 2, `>0%` → 1), XP (`15` XP par réussite + bonus de notion), met à jour `topicStats` et débloque les badges (`badge-premiere-lecon`, `badge-sans-faute`, `badge-geometre`, `badge-explorateur`).
- **Animations** (`src/components/mascot/`, `src/index.css`) :
  - `MascotController` pilote `TurkeyMascot` selon 8 états (`idle`, `thinking`, `happy`, `celebrating`, `explaining`, `encouraging`, `surprised`, `incorrect`).
  - `<MotionConfig reducedMotion="user">` respecte l'accessibilité système.
  - `LottieIcon` ajoute 18 assets locaux sourcés/licenciés aux icônes et états d'action ; chargement à la demande et fallback. Les SVG personnalisés, objets mathématiques et QR restent prioritaires. Validation navigateur Lottie en cours ; voir `LOTTIE_ANIMATIONS.md`.

---

## 7. Limitations actuelles (résumé)

- Pas d'authentification multi-comptes ni de base de données distante : toute la persistance est locale au navigateur (`localStorage`).
- Seul le fichier `src/utils/gameLogic.test.ts` dispose de tests automatisés ; les composants React ne sont pas couverts par Vitest/Testing Library (ils ont été validés par Playwright Chromium dans l'environnement d'origine).
- Sans `GEMINI_API_KEY`, le tuteur utilise exclusivement le moteur de repli local déterministe.
- Voir `docs/handoff/KNOWN_ISSUES.md` pour la liste exhaustive.

---

## COMMENT REPRENDRE LE PROJET AVEC CLAUDE CODE

Voici la procédure exacte à suivre dans VS Code dès l'ouverture du dossier exporté :

1. **Vérifier l'environnement local** :
   - S'assurer d'avoir **Node.js 20+** (`node -v`).
   - Installer les dépendances :
     ```bash
     npm install
     ```
   - Créer un fichier `.env` à partir de `.env.example` si vous souhaitez tester le tuteur IA Gemini en local :
     ```bash
     cp .env.example .env
     # Optionnel : renseigner GEMINI_API_KEY=...
     ```
2. **Valider que le projet compile et passe les tests avant toute modif** :
   ```bash
   npm run lint
   npx tsx --test src/utils/gameLogic.test.ts
   npm run build
   ```
3. **Lancer le serveur local et inspecter l'app** :
   ```bash
   npm run dev
   ```
   Ouvrir [http://localhost:3000](http://localhost:3000) (avec `?autostart=1` pour arriver directement sur l'accueil).
4. **Démarrer Claude Code** dans la racine du projet :
   - Claude Code lira automatiquement `CLAUDE.md`.
   - Demandez-lui de prendre connaissance de `docs/handoff/HANDOFF.md`, `FEATURE_STATUS.md`, `DESIGN_SYSTEM.md`, `SVG_ANIMATIONS.md` et `NEXT_STEPS.md`, puis attaquez la première tâche P1/P2 souhaitée dans `NEXT_STEPS.md`.
