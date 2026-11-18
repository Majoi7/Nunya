# KNOWN_ISSUES.md — Problèmes connus, limites et points d'attention

Ce document recense de façon transparente toutes les limites actuelles du prototype afin que Claude Code puisse les traiter en connaissance de cause.

---

## 1. Limitations fonctionnelles & données simulées

1. **Persistance exclusivement locale (`localStorage`)** :
   - Aucune base de données ni authentification multi-utilisateurs. Si l'enfant change d'appareil ou vide les données du navigateur, sa progression (`lumimath_brilliant_v2`) est perdue.
2. **Contenu pédagogique limité à 10 notions (2 par chapitre)** :
   - Les 5 domaines (`addition`, `soustraction`, `multiplication`, `division`, `geometrie`) disposent chacun de 2 notions complètes en 4 étapes (`discover-stepper` + `manipulation` + `question` + `application`). D'autres thèmes mentionnés dans le brief initial (ex. reconnaissance des nombres, fractions, périmètres/aires avancés pour CM2/6e) ne sont pas encore déclinés en chapitres dédiés.
3. **Adaptation par niveau (`CP`–`6e`) paramétrique** :
   - `getExercisesForNotion` adapte bien les valeurs numériques via `GRADE_SCALES[grade]`, mais la structure des scénarios et le vocabulaire des slides restent identiques du CP à la 6e (par ex., en 6e, les notions mériteraient des énoncés dédiés aux grands nombres, décimaux ou géométrie avancée).
4. **Tuteur IA Gemini dépendant de `GEMINI_API_KEY` & réseau** :
   - Sans clé serveur configurée dans `.env`, `POST /api/tutor` retourne `{ source: 'offline-required' }` et l'application utilise le moteur de repli statique `buildOfflineTutorResponse` (1 mini-exercice par domaine/tranche d'âge).
   - Pendant le chargement de `/api/tutor`, le libellé *« Astuce personnalisée supplémentaire en cours... »* apparaît brièvement sous l'explication immédiate.

---

## 2. Aspects techniques, tests et déploiement

5. **Installation PWA non validée sur matériel réel** :
   - Le service worker (`vite-plugin-pwa`) et le manifeste sont générés au build (`dist/sw.js`, `dist/manifest.webmanifest`), mais l'installation sur l'écran d'accueil iOS Safari et Android Chrome n'a pas pu être testée physiquement depuis le conteneur headless.
6. **Déploiement statique (`vercel.json` / `netlify.toml`) vs `/api/tutor`** :
   - Le frontend compilé (`npm run build`) fonctionne en statique pur grâce au repli hors-ligne, mais l'endpoint `/api/tutor` nécessite l'exécution du serveur Node/Express (`npm start`) ou la migration de `/api/tutor` vers une fonction serverless si vous déployez uniquement `dist/` sur Vercel/Netlify.
7. **Couverture de tests automatisés partielle** :
   - Seule la logique métier pure (`src/utils/gameLogic.ts` + génération `src/data/curriculum.ts`) possède des tests permanents (`src/utils/gameLogic.test.ts`). Il n'existe pas encore de script `npm test` ni de tests de composants React / E2E Playwright versionnés dans le dépôt.
8. **Fichier de verrouillage (`bun.lock`) sans `package-lock.json`** :
   - Le conteneur d'origine a installé les paquets avec `bun` (`bun.lock`). Sur un poste local utilisant `npm`, `npm install` créera un `package-lock.json` lors de la première installation (ou utilisera `bun install`).

---

## 3. UI, ergonomie et SVG

9. **Animations SVG complexes & attributs géométriques** :
   - Chromium génère une erreur console si Framer Motion anime directement des attributs SVG comme `rx` sur `<motion.ellipse>` (`Expected length, "undefined"`). Ce bug a été corrigé dans `TurkeyMascot.tsx` en animant `scaleX` avec `transformOrigin`, mais toute future animation SVG doit respecter cette contrainte.
10. **Contraste et lisibilité de la mascotte à petite taille** :
    - À très petite taille (`<= 76px`), les plumes et détails du bec de `TurkeyMascot` restent lisibles mais fins (traits `2.13px` dans un `viewBox` `620×770`). Éviter de descendre sous `size={72}`.
11. **Manipulation de géométrie limitée à deux figures interactives** :
    - `manipulate-geometrie` propose actuellement le comptage de côtés sur un pentagone (`count-sides`) et le marquage des angles droits sur un carré (`mark-right-angles`). Le mode `'build-shape'` déclaré dans `ManipulationConfig` (`src/types/math.ts`) n'est pas encore implémenté dans `InteractiveManipulator.tsx`.
12. **Éléments de `MobileFrameShell` en mode local** :
    - Sur `http://localhost:3000`, si `APP_URL` n'est pas défini dans `.env`, le panneau compagnon et la modale QR code affichent un encart d'information jaune au lieu d'un QR code (comportement voulu, car un smartphone ne peut pas joindre `localhost`).
