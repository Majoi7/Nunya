# CLAUDE.md — Instructions de reprise pour Claude Code

Ce dépôt contient la version initiale fonctionnelle de **LumiMath**, une application éducative mobile-first (PWA) d'apprentissage des mathématiques pour les enfants de **6 à 12 ans** (**CP à 6e**), inspirée de l'expérience **Brilliant**.

Tu reprends un **prototype existant, compilé et vérifié**, et **non** un projet à recommencer de zéro.

---

## Ordre de lecture obligatoire avant toute modification

Avant d'éditer le moindre fichier :

1. Lire intégralement `docs/handoff/HANDOFF.md`.
2. Lire `docs/handoff/FEATURE_STATUS.md`.
3. Lire `docs/handoff/NEXT_STEPS.md`.
4. Lire `docs/handoff/DESIGN_SYSTEM.md`.
5. Lire `docs/handoff/SVG_ANIMATIONS.md`.
6. Examiner l'architecture réelle du projet (`docs/handoff/ARCHITECTURE.md` et les fichiers concernés dans `src/`) avant de modifier le code.
7. Ne jamais remplacer le design existant sans justification.
8. Ne jamais supprimer les animations SVG fonctionnelles.
9. Préserver les fonctionnalités déjà validées.
10. Mettre à jour les documents de passation après chaque évolution importante.

---

## Règles architecturales

- **Séparation stricte données / logique / UI** :
  - Les types vivent dans `src/types/math.ts`.
  - La logique métier pure (progression, XP, étoiles, défis quotidiens, rollover journalier) vit dans `src/utils/gameLogic.ts` et doit rester testable sans DOM via `src/utils/gameLogic.test.ts`.
  - Les contenus pédagogiques adaptatifs par niveau (`CP`–`6e`) vivent dans `src/data/curriculum.ts` et les badges dans `src/data/rewards.ts`.
  - Les écrans et composants visuels vivent dans `src/components/`.
- **Full-stack Express + Vite** :
  - `server.ts` sert le backend (`/api/health`, `/api/config`, `/api/tutor`) et monte Vite en middleware en développement (`npm run dev`). En production (`npm start`), il sert `dist/`.
  - La clé `GEMINI_API_KEY` reste **strictement côté serveur**. Ne jamais appeler `@google/genai` depuis le navigateur.
- **Persistance locale** :
  - Toute l'état utilisateur (`UserState`) est persisté dans `localStorage` sous la clé `lumimath_brilliant_v2` (constante `STORAGE_KEY`). Conserver la rétrocompatibilité lors de l'ajout de nouveaux champs (`loadUserState` fusionne avec `createInitialUserState()`).

---

## Règles de design à respecter

- **Direction artistique Brilliant (pas de clone Duolingo)** :
  - Fond principal blanc pur (`#FFFFFF`), cartes neutres `#F7F8FA`, bordures fines `#E5E7EB`.
  - CTA principaux sombres en pilule (`bg-[#111827] text-white rounded-full`).
  - Progression, validation et tiroirs de réussite en vert émeraude (`#22C55E` / `#DCFCE7` / `#15803D`).
  - Compteur d'XP éclair jaune (`#FACC15` / `#EAB308`). Aucun système de cœurs/vies punitif.
- **Typographie** : `Fredoka` pour les titres (`.font-display`), `Nunito` pour le corps de texte, `tabular-nums` sur tous les compteurs et équations.
- **Ergonomie mobile** :
  - Hauteur `100dvh`, zones tactiles `>= 44px`, zéro débordement horizontal à `390px` de large.
  - Tout le texte visible de l'application est en **français**, adapté à un enfant de 6 à 12 ans.

---

## Règle permanente UI/UX — skill `mobile-ios-design`

**Cette règle s'applique à toutes les prochaines tâches UI/UX du projet**, qu'il s'agisse de conception, d'amélioration, de refonte ou de modification d'un écran, d'un composant, de la navigation ou d'une interaction. Elle ne se limite pas à une refonte complète.

### Consultation obligatoire avant toute intervention UI/UX

1. Consulter systématiquement le skill **`mobile-ios-design`** avant d'explorer ou de modifier l'interface : l'invoquer via l'outil Skill lorsqu'il est disponible dans la session ; sinon lire intégralement sa copie locale **`.claude/skills/mobile-ios-design/SKILL.md`** avec Read. Ne pas poursuivre une tâche UI/UX sans cette consultation. Si le skill manque, signaler le blocage et rétablir sa disponibilité sans contourner les permissions.
2. Lire les références pertinentes dans `.claude/skills/mobile-ios-design/references/` : `hig-patterns.md` pour les règles visuelles et l'accessibilité, `ios-navigation.md` pour les parcours, `swiftui-components.md` pour les patterns de composants. Les exemples SwiftUI servent de référence conceptuelle, pas de code à copier dans React.
3. Respecter également l'ordre de lecture des documents de passation ci-dessus, puis analyser l'interface réelle, les parcours concernés et tous leurs états avant de proposer une solution.
4. Identifier les problèmes concrets d'ergonomie, de hiérarchie, de cohérence visuelle, de navigation, de lisibilité et de feedback. Justifier la solution par son bénéfice pour l'enfant, pas seulement par son apparence.
5. Appliquer réellement les recommandations pertinentes du skill dans l'implémentation et expliquer leur adaptation au projet. Une simple consultation sans application ne suffit pas.
6. Vérifier le rendu et les interactions à **390×844**, sur une largeur plus étroite et une plus large, ainsi que sur tablette et desktop si le périmètre les concerne. Contrôler les débordements, les erreurs console, le clavier, le zoom et les préférences d'accessibilité. Exécuter `npm run lint` et `npm run build` après toute modification UI ; distinguer les contrôles effectivement exécutés des tests sur appareils réels restant à faire.

### Adaptation obligatoire aux technologies et au design existants

- LumiMath reste une **PWA React 19 + TypeScript + Tailwind CSS v4 + Motion**, avec Express côté serveur. Ne jamais migrer vers SwiftUI, React Native ou une autre architecture uniquement pour suivre ce skill.
- Adapter les principes iOS HIG à des composants HTML sémantiques, au clavier, aux lecteurs d'écran et aux capacités réelles des navigateurs. Conserver les icônes Lucide existantes plutôt que d'imposer SF Symbols ou des API natives non disponibles.
- Préserver la direction **Brilliant**, la palette et les typographies définies plus haut et dans `docs/handoff/DESIGN_SYSTEM.md`. Les exemples de couleurs, polices, ombres et transparences du skill ne remplacent pas ce design system.
- Privilégier des composants réutilisables et des **tokens de design sémantiques** pour les couleurs, les espacements et la typographie ; centraliser les styles partagés dans `src/index.css`, sans créer de CSS par composant. Une évolution de thème doit être justifiée et validée, pas introduite automatiquement par imitation d'iOS.
- Garantir des zones tactiles d'au moins **44×44 px**, une hiérarchie lisible, des espacements cohérents, des safe areas respectées et des layouts flexibles sans texte essentiel tronqué.
- Prévoir, lorsqu'ils sont pertinents, les états **chargement, vide, succès, erreur, désactivé et hors-ligne**, avec des retours compréhensibles après chaque action et une issue claire en cas d'échec.
- Assurer une navigation naturelle, des libellés accessibles, un focus visible et correctement géré dans les modales, ainsi que des contrôles utilisables au clavier. La couleur seule ne suffit pas à communiquer un état ; respecter l'agrandissement du texte et le zoom.
- Utiliser des animations et micro-interactions légères, utiles et cohérentes, en respectant `prefers-reduced-motion`. Conserver les **SVG personnalisés de la mascotte** et les animations fonctionnelles ; conserver aussi les animations LottieFiles pertinentes si elles existent ou sont ajoutées au projet, sans remplacer la mascotte vectorielle d'origine.
- **Aucune modification superficielle** : changer seulement des couleurs, des rayons ou des ombres ne constitue pas une refonte UX. Ne jamais supprimer ou casser une fonctionnalité, une sauvegarde ou une animation pour améliorer le rendu.

### Source, installation et compte rendu

- Source officielle : https://github.com/wshobson/agents, dossier `plugins/ui-design/skills/mobile-ios-design/`.
- Installation locale de référence : `.claude/skills/mobile-ios-design/` ; provenance et licence conservées dans `SOURCE.md` et `LICENSE`. Les instructions officielles sont conservées sans modification ; les adaptations LumiMath sont définies ici.
- Si une installation via le gestionnaire de skills est nécessaire, la commande de référence est `npx skills add https://github.com/wshobson/agents --skill mobile-ios-design`. Elle nécessite l'autorisation d'exécuter le paquet externe et ne doit pas être lancée à chaque tâche.
- Après une configuration ou une évolution UI/UX, rendre un compte rendu séparant **TERMINÉ ET VALIDÉ**, **PARTIELLEMENT TERMINÉ** et **RESTANT À FAIRE**, avec les fichiers modifiés, les améliorations UX apportées et les vérifications réellement réalisées.

---

## Consignes concernant les SVG et les animations

- **Conserver l'asset original** : `public/assets/aistudio/Turkey_Power_Walk_3833b87d.svg` est la source de vérité vectorielle.
- **Ne jamais remplacer la mascotte par une image raster générée ou générique**.
- La géométrie extraite dans `src/components/mascot/turkeySvgData.ts` est rendue et animée dans `src/components/mascot/TurkeyMascot.tsx` via `src/components/mascot/MascotController.tsx`.
- **Précaution SVG Motion** : dans `TurkeyMascot.tsx`, animer `scaleX`/`scaleY`/`rotate`/`x`/`y` avec `style={{ transformOrigin: ... }}` plutôt que des attributs géométriques comme `rx` sur `<motion.ellipse>` (qui déclenchent des erreurs navigateur `Expected length, "undefined"`).
- Respecter `prefers-reduced-motion` via `<MotionConfig reducedMotion="user">` dans `src/App.tsx` et les règles CSS dans `src/index.css`.

---

## Conventions de code & commandes

- TypeScript strict (`tsc --noEmit` sans erreur), React 19 fonctionnel avec hooks, Tailwind CSS v4 (`@import "tailwindcss";` dans `src/index.css`, sans fichiers CSS par composant).
- Composants natifs accessibles (`<button type="button">`, `aria-label`, `aria-current`) plutôt que des `<div>` cliquables.

```bash
npm run dev                                  # Développement (port 3000)
npm run lint                                 # Vérification TypeScript (tsc --noEmit)
npx tsx --test src/utils/gameLogic.test.ts   # Tests unitaires
npm run build                                # Build production + PWA
npm start                                    # Serveur production
```

---

## Précautions avant toute modification

1. Ne pas modifier `metadata.json` (`majorCapabilities`) ni casser le proxy `/api/tutor`.
2. Après modification de `src/utils/gameLogic.ts` ou `src/data/curriculum.ts`, exécuter `npx tsx --test src/utils/gameLogic.test.ts`.
3. Avant de valider une évolution UI, exécuter `npm run lint`, `npm run build` et vérifier le rendu en mobile `390×844` (zéro overflow, zéro erreur console).
4. Si la structure du `UserState` ou une nouvelle fonctionnalité évolue, mettre à jour `docs/handoff/FEATURE_STATUS.md`, `docs/handoff/ARCHITECTURE.md` et `docs/handoff/NEXT_STEPS.md`.
