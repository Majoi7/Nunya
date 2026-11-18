# SVG_ANIMATIONS.md — Système d'animations SVG & MascotController

Ce document détaille l'intégration et l'animation des ressources SVG dans **LumiMath**.

---

## 1. Inventaire des SVG utilisés

| Nom | Emplacement | Rôle | Modifié ? | Composants React |
|---|---|---|---|---|
| **Turkey Power Walk (source originale)** | `public/assets/aistudio/Turkey_Power_Walk_3833b87d.svg` | Asset vectoriel de référence fourni par l'utilisateur (`viewBox="0 0 800 800"`) | Conservé intact comme archive source | — (extrait vers `turkeySvgData.ts`) |
| **Geometry extractée (`TURKEY_SVG_LAYERS`)** | `src/components/mascot/turkeySvgData.ts` | Données AST structurées de tous les tracés et couleurs exacts du SVG original | Oui : séparation en 10 calques sémantiques ; `id` mappé en `data-layer-id` à l'exécution | `TurkeyMascot.tsx` |
| **Coach Dindon animé** | `src/components/mascot/TurkeyMascot.tsx` | Mascotte principale articulée (`viewBox="80 30 620 770"`) avec yeux dynamiques | Oui : regroupement hiérarchique `<motion.g>` autour des pivots d'origine + paupières/pupilles interactives | `MascotController.tsx` |
| **Diagrammes de géométrie** | `src/components/VisualStage.tsx` (`GeometryDiagram`) | Figures pédagogiques (`triangle`, `triangle-rectangle`, `carre`, `rectangle`, `pentagone`) + marqueurs d'angles droits `90°` | Créé sur mesure (`viewBox="0 0 260 170"`) | `VisualStage.tsx` |
| **Manipulateurs géométriques SVG** | `src/components/exercises/InteractiveManipulator.tsx` | Pentagone à côtés cliquables (`count-sides`) et carré à sommets cliquables (`mark-right-angles`) | Créé sur mesure avec zones tactiles élargies | `InteractiveManipulator.tsx` |
| **Icône PWA** | `public/icon.svg` | Icône vectorielle de l'application pour manifeste / favicon | Créé pour le setup PWA | `index.html`, `vite.config.ts` |

> **Règle absolue** : `public/assets/aistudio/Turkey_Power_Walk_3833b87d.svg` ne doit jamais être supprimé ni remplacé par une image générique.

---

## 2. Architecture de la mascotte (`Turkey_Power_Walk` → `MascotController`)

### A. Modifications effectuées sur le SVG original

Le SVG exporté d'origine (`800×800`) contenait une séquence de calques de marche sans noms sémantiques exploitables directement par React. Pour obtenir une mascotte fluide sans dénaturer un seul tracé ni une seule couleur (`#9e3f1c`, `#170800`, bandeau vert lime, etc.) :

1. Tous les `<g>` et `<path>` d'origine ont été extraits fidèlement dans `src/components/mascot/turkeySvgData.ts` sous forme de `TURKEY_SVG_LAYERS` (10 groupes : `backWingPaths`, `backLegPaths`, `tailFanPaths`, `bodyPaths`, `chestTuftsPaths`, `frontLegPaths`, `headSkinPaths`, `headbandPaths`, `neckTuftsPaths`, `crestPaths`, `beakPaths`, `wattlePaths`).
2. `mapSvgAttrs` dans `TurkeyMascot.tsx` convertit les attributs kebab-case SVG (`stroke-linejoin`, `stroke-linecap`, `stroke-width`, `stroke-miterlimit`) en props React camelCase et remplace `id` par `data-layer-id` pour éviter les collisions d'IDs lorsque plusieurs mascottes sont affichées simultanément.
3. Les yeux d'origine ont été recréés avec exactement les mêmes ellipses/contours (`cx/cy` et `r="9.57"` pour les pupilles, `#170800` / `#ffffff`) afin de permettre le **clignement périodique** (`eyeScaleY`), le **suivi du regard** (`pupilShift`) et les **sourcils d'expression** (`thinking`, `incorrect`).
4. L'ombre au sol (`<motion.ellipse cx="405" cy="780" rx="115" ry="18" />`) anime `scaleX` et `opacity` (et **jamais** `rx` directement pour éviter les warnings SVG dans Chromium).

### B. Identifiants SVG et hiérarchie de pivots (`TurkeyMascot.tsx`)

Le `<svg>` racine (`fill="none"`, `viewBox="80 30 620 770"`) recadre la mascotte sans marges excessives et s'articule autour des groupes suivants :

| ID SVG | Pivot (`transform`) | Rôle d'animation |
|---|---|---|
| `#turkey-rig` | `(432.96, 499.63)` | Translation globale `y`/`x`, `scaleY` (respiration/saut), `rotate` du corps |
| `#back-wing` | `(392.42, 479)` | Rotation secondaire de l'aile arrière |
| `#back-leg` | `(382.6, 626.57)` | Rotation de la patte arrière (V-stance ou foulée) |
| `#tail-fan` | `(317.819, 469.123)` | Éventail des 10 plumes (`rotate` + `scale`) |
| `#body` | — | Torse + touffes de poitrine (référence fixe du rig) |
| `#front-leg` | `(446, 627.1)` | Rotation de la patte avant |
| `#head-neck` | `(523.374, 385.232)` | Inclinaison du cou et de la tête |
| `#headband` | dans `#head-neck` | Bandeau sportif vert lime (suit la tête) |
| `#crest` | dans `#head-neck` | Crête oscillante en `happy` / `celebrating` |
| `#beak` | dans `#head-neck` | Bec & sourire |
| `#wattle` | `transformOrigin: '557px 175px'` | Caroncule rouge animée en balancement |
| `#eyes` | `(-400, -400)` | Paupières (`scaleY`), pupilles (`pupilShift`), sourcils expressifs |
| `#front-wing` | `(438.04, 479)` | Aile avant expressive (levée en `explaining`, repliée en `thinking`, abaissée en `incorrect`) |

---

## 3. Les 8 états d'animation disponibles (`MascotAnimationState`)

Définis dans `TurkeyMascot.tsx` et réexportés par `MascotController.tsx` :

| État | Comportement visuel | Déclencheur / Écran |
|---|---|---|
| `'idle'` | Respiration douce (`y: [0, -5, 0]`), éventail léger, clignement naturel | `HomeScreen` (avant objectif), `ProfileTab` |
| `'thinking'` | Corps incliné `-3°`, tête `-10°`, aile avant repliée (`-48°`), sourcil pensif, regard haut-gauche | `LessonScreen` sur phases `question` / `manipulation` / `application` |
| `'happy'` | Saut joyeux, crête/caroncule animées, aile levée | `WelcomeScreen`, `HomeScreen` (objectif atteint), bonne réponse dans `LessonScreen` |
| `'celebrating'` | Grands bonds, foulée power-walk des pattes (`[56, -18, 56]` / `[-51, 22, -51]`), ombre au sol réactive | `VictoryScreen` (écran de résultat) |
| `'explaining'` | Aile avant levée qui montre/explique (`[-38, -26, -38]`), regard vers la droite (`x: 3`), tête attentive | `ExplanationView` (« Pourquoi ? ») |
| `'encouraging'` | Balancement chaleureux du corps et de la tête (`[0, 5, 0]`) | `ProfileSetupScreen`, phases `decouverte` / `observation` de `LessonScreen` |
| `'surprised'` | Sursaut vertical (`y: [0, -20, -4]`), yeux écarquillés (`eyeScaleY: 1.12`, pupilles `scale: 1.15`) | Disponible via `MascotController` (transitions rapides) |
| `'incorrect'` | Léger recul latéral, aile tombante (`28°`), sourcils empathiques sans jugement, regard bas | `LessonScreen` lors d'une réponse incorrecte |

---

## 4. Utilisation de `MascotController`

Import : `import { MascotController } from './components/mascot/MascotController';`

```tsx
<MascotController
  character="turkey"          // Optionnel, défaut 'turkey'
  animationState="explaining" // Obligatoire : un des 8 états
  size={96}                   // Largeur & hauteur SVG en px (défaut 112)
  className="shrink-0"        // Classes utilitaires optionnelles
  onAnimationComplete={() => {
    // Déclenché automatiquement après 900ms (happy/surprised/incorrect)
    // ou 1400ms (celebrating)
  }}
/>
```

### Composants utilisant `MascotController`

- `src/components/OnboardingScreen.tsx` (`WelcomeScreen` en `happy`, `ProfileSetupScreen` en `encouraging`)
- `src/components/HomeScreen.tsx` (`idle` ou `happy` si objectif quotidien atteint)
- `src/components/LessonScreen.tsx` (`encouraging`, `thinking`, `happy`, `incorrect`, `explaining`)
- `src/components/ExplanationView.tsx` (`explaining`)
- `src/components/VictoryScreen.tsx` (`celebrating`)
- `src/components/ProfileTab.tsx` (`idle`)

---

## 5. Comment ajouter une nouvelle animation ou une nouvelle mascotte

### Ajouter un 9e état à `TurkeyMascot`

1. Ajouter la valeur dans le type union `MascotAnimationState` dans `src/components/mascot/TurkeyMascot.tsx`.
2. Ajouter un `case` dans les blocs `bodyAnim`, `bodyTransition`, `backLegAngle`/`frontLegAngle`, `tailAnim`, `frontWingAnim`, `backWingAnim`, `headAnim` et `pupilShift`.
3. Si c'est une animation ponctuelle (non bouclée), l'inclure dans le `useEffect` qui appelle `onAnimationComplete`.
4. **Important** : n'animer que des propriétés transform (`x`, `y`, `rotate`, `scale`, `scaleX`, `scaleY`, `opacity`) avec `transformOrigin` explicite pour garantir 60 fps sur mobile et zéro erreur SVG.

### Ajouter un second personnage à `MascotController`

1. Créer le composant dédié (ex. `src/components/mascot/OwlMascot.tsx`) en réutilisant la même interface `MascotAnimationState`.
2. Étendre `character?: 'turkey' | 'owl'` dans `MascotControllerProps` (`src/components/mascot/MascotController.tsx`) et aiguiller selon `character`.

---

## 6. Animations SVG pédagogiques hors mascotte (`InteractiveManipulator.tsx` & `VisualStage.tsx`)

- **Pentagone à côtés interactifs (`count-sides`)** : chaque arête possède un `<line>` visible (`#9CA3AF` → `#22C55E` épaisseur `6` quand actif), un `<line stroke="transparent" strokeWidth="26">` pour un confort tactile optimal, et une pastille numérotée `1..5` au milieu du côté.
- **Carré à angles droits (`mark-right-angles`)** : chaque sommet possède une zone tactile `r="24"` transparente et dessine une équerre SVG verte (`#22C55E` / `#DCFCE7`) au toucher.
- **Diagrammes statiques (`GeometryDiagram`)** : affichent des équerres rouges (`#EF4444`) sur les sommets à 90° lorsque `highlightMode === 'right-angles'` ou accentuent les sommets verts (`#22C55E`) lorsque `highlightMode === 'vertices'`.
