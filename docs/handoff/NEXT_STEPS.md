# NEXT_STEPS.md — Feuille de route priorisée pour Claude Code

Ce plan d'action permet à Claude Code de reprendre immédiatement le développement dans VS Code sans casser l'existant.

---

## Suivi — intégration LottieFiles

- 18 assets locaux / 19 entrées et `LottieIcon` intégrés. Catalogue et exceptions : `LOTTIE_ANIMATIONS.md`.
- Terminer la campagne de vérification Chrome (largeurs 360/390/430/768/1440, préférence réduite, fallback, hors-ligne) avant de qualifier le remplacement de validé.
- Confirmer ensuite lisibilité, VoiceOver/TalkBack et performance sur iOS/Android physiques ; ce contrôle n'est pas remplacé par Chrome headless.
- Compléter uniquement les emplacements encore pertinents (horloge, boussole, main, domaines, téléphone, copie, lien, œil et badges distincts) avec des sources licenciées et lisibles. Ne pas remplacer les signes mathématiques, vrais QR codes ou la mascotte.
- Le graphe Graphify code-only a été généré via `--update --code-only`, sans clé ni service externe. Continuer en incrémental ; l'index sémantique des documents n'est pas présent.

## P0 — Bloquants à vérifier dès la reprise locale

### P0.1 — Stabiliser l'environnement local, les scripts de test et le lockfile `npm`
- **Quoi faire** : Exécuter `npm install` en local (générant `package-lock.json` si l'équipe utilise `npm` plutôt que `bun`) et ajouter un script `"test": "tsx --test src/utils/gameLogic.test.ts"` dans `package.json`.
- **Pourquoi** : Garantir que chaque développeur ou CI puisse lancer les tests d'une seule commande standard (`npm test`).
- **Fichiers concernés** : `package.json`
- **Résultat attendu** : `npm test`, `npm run lint` et `npm run build` passent dès le clonage/extraction.
- **Critères de validation** : Code retour `0` sur `npm test && npm run lint && npm run build`.

---

## P1 — Fonctionnalités essentielles à compléter

### P1.1 — Implémenter le manipulateur géométrique `build-shape` (déjà typé)
- **Quoi faire** : Implémenter le mode `geometryTask === 'build-shape'` dans `src/components/exercises/InteractiveManipulator.tsx` (ex. tracer ou relier des sommets sur une grille à points SVG pour construire un triangle rectangle ou un rectangle) et l'ajouter à une notion de `chap-5`.
- **Pourquoi** : `build-shape` est déjà prévu dans `ManipulationConfig` (`src/types/math.ts`), mais seul `count-sides` et `mark-right-angles` sont rendus actuellement.
- **Fichiers concernés** : `src/components/exercises/InteractiveManipulator.tsx`, `src/data/curriculum.ts`, `src/utils/gameLogic.test.ts`
- **Résultat attendu** : L'enfant peut construire une figure géométrique sommet par sommet sur un quadrillage tactile.
- **Critères de validation** : Manipulation tactile fonctionnelle à `390×844` sans débordement, validation juste/fausse dans `LessonScreen`, test unitaire mis à jour.

### P1.2 — Enrichir le curriculum pour les niveaux `CM1`, `CM2`, `6e` et la reconnaissance des nombres (`CP`)
- **Quoi faire** : Ajouter 2 à 3 nouveaux chapitres dans `CHAPTERS` (`src/utils/gameLogic.ts`) et leurs leçons dans `src/data/curriculum.ts` :
  - *Nombres & Comparaison* (reconnaissance, droite graduée interactive).
  - *Fractions visuelles* (barres fractionnées interactives pour CM1–6e).
  - *Problèmes guidés* (modélisation en barres multi-étapes).
- **Pourquoi** : Répondre pleinement à la tranche 6–12 ans (`CP` à `6e`) et couvrir la reconnaissance des nombres et les petits problèmes.
- **Fichiers concernés** : `src/utils/gameLogic.ts`, `src/data/curriculum.ts`, `src/components/exercises/InteractiveManipulator.tsx`, `src/utils/gameLogic.test.ts`
- **Résultat attendu** : Le parcours passe de 5 à 7–8 chapitres progressifs tout en conservant le design system Brilliant.
- **Critères de validation** : Tous les nouveaux `notionId` génèrent >= 4 étapes valides sur les 6 niveaux (`CP` à `6e`) dans `gameLogic.test.ts`.

### P1.3 — Déploiement API `/api/tutor` compatible Vercel / Netlify (si hébergement serverless)
- **Quoi faire** : Si le projet n'est pas déployé avec Node/Express (`npm start`), exposer `/api/tutor` et `/api/config` sous forme de Serverless Functions (`api/tutor.ts`, `api/config.ts`) en plus de `server.ts`.
- **Pourquoi** : `vercel.json` et `netlify.toml` ne compilent actuellement que `dist/` (SPA statique), ce qui désactive `/api/tutor` en production sur ces plateformes.
- **Fichiers concernés** : `vercel.json`, `server.ts`, nouveaux fichiers `api/*.ts` éventuels.
- **Résultat attendu** : `POST /api/tutor` répond en production même sans serveur Node persistant.
- **Critères de validation** : Requête `POST /api/tutor` retournant `source: 'gemini'` lorsque `GEMINI_API_KEY` est configurée, ou `offline-required` sinon.

---

## P2 — Améliorations importantes

### P2.1 — Ajouter une suite E2E Playwright permanente dans le projet
- **Quoi faire** : Intégrer des tests Playwright (`tests/e2e/`) vérifiant les parcours critiques (Onboarding, Leçon complète, « Pourquoi ? », Bilan, Persistance `localStorage`, mobile `390×844` sans overflow).
- **Pourquoi** : Éviter toute régression UI ou SVG lors des futurs ajouts de chapitres.
- **Fichiers concernés** : `playwright.config.ts`, `tests/e2e/*.spec.ts`, `package.json`.
- **Résultat attendu** : Exécution automatisée des parcours complets en CI ou local.
- **Critères de validation** : 0 erreur console, 0 échec sur les 5 domaines.

### P2.2 — Validation PWA sur appareils réels iOS & Android
- **Quoi faire** : Déployer sur une URL HTTPS de test, scanner le QR code depuis iOS Safari et Android Chrome, vérifier l'installation plein écran, l'icône sur l'écran d'accueil et le fonctionnement 100 % hors-ligne via Workbox.
- **Pourquoi** : Le service worker n'a pas encore été validé sur téléphone physique.
- **Fichiers concernés** : `vite.config.ts`, `index.html`, `src/hooks/usePWAInstall.ts`.
- **Résultat attendu** : L'application s'installe comme une app native et reste jouable en mode avion.
- **Critères de validation** : Audit Lighthouse PWA validé + lancement hors-ligne réussi.

### P2.3 — Ajout d'animations et états audio/visuels complémentaires pour `MascotController`
- **Quoi faire** : Ajouter un état `'cheering'` ou `'pointing'` (pointant vers l'indice visuel dans `ExplanationView`) ou une seconde mascotte déblocable dans `MascotController.tsx` tout en conservant `TurkeyMascot.tsx` par défaut.
- **Pourquoi** : Renforcer la récompense émotionnelle lors des séries parfaites sans alourdir l'interface.
- **Fichiers concernés** : `src/components/mascot/TurkeyMascot.tsx`, `src/components/mascot/MascotController.tsx`.
- **Résultat attendu** : Transitions fluides `60 fps` respectant `prefers-reduced-motion`.
- **Critères de validation** : Aucune erreur d'attribut SVG dans la console navigateur.

---

## P3 — Optimisations & finitions

### P3.1 — Multi-profils enfants dans `localStorage` (fratrie)
- **Quoi faire** : Permettre de créer/basculer entre 2 ou 3 profils locaux sur le même appareil (ex. un enfant en `CE1` et un autre en `CM1`) avec migration transparente depuis la clé `lumimath_brilliant_v2`.
- **Pourquoi** : Cas d'usage fréquent sur tablette familiale.
- **Fichiers concernés** : `src/types/math.ts`, `src/utils/gameLogic.ts`, `src/App.tsx`, `src/components/ProfileTab.tsx`.
- **Résultat attendu** : Chaque profil conserve ses propres XP, séries, badges et progression.
- **Critères de validation** : Changement de profil sans perte de données + test unitaire de migration `v2 -> v3`.

### P3.2 — Découpage des gros modules de données si le curriculum dépasse 15 notions
- **Quoi faire** : Scinder `src/data/curriculum.ts` (actuellement ~1 135 lignes) en `src/data/lessons/<topic>.ts` (addition, soustraction, multiplication, division, géométrie) réexportés par un index unique.
- **Pourquoi** : Garder des fichiers courts et lisibles pour Claude Code à mesure que le catalogue grandit.
- **Fichiers concernés** : `src/data/curriculum.ts` → `src/data/lessons/*.ts`.
- **Résultat attendu** : API publique `getExercisesForNotion(notionId, grade)` inchangée, maintenance facilitée.
- **Critères de validation** : `npm run lint` et `gameLogic.test.ts` passent sans modification des composants.
