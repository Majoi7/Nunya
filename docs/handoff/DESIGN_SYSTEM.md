# DESIGN_SYSTEM.md — Système de Design (Inspiré de Brilliant)

Ce document décrit fidèlement le design system implémenté dans **LumiMath**, calé sur les captures de référence **Mobbin / Brilliant** fournies par l'utilisateur.

**Procédure permanente UI/UX** : avant toute conception, amélioration, refonte ou modification d'interface, consulter le skill `mobile-ios-design` installé dans `.claude/skills/mobile-ios-design/SKILL.md` et les références pertinentes. Appliquer ses principes en les adaptant à React, Tailwind et Motion, sans remplacer le design system ci-dessous ni la mascotte originale. Le protocole complet et les critères de validation sont définis dans la section **« Règle permanente UI/UX — skill `mobile-ios-design` »** du `CLAUDE.md` racine. Si le skill n'est pas reconnu dans la session, la lecture directe de sa copie locale reste obligatoire.

---

## 1. Principes directeurs

- **Clarté éditoriale & scientifique** : surface blanche dominante (`#FFFFFF`), zones diagrammes gris très doux (`#F7F8FA`), bordures fines (`#E5E7EB`) au lieu d'ombres lourdes ou de boutons 3D épais façon Duolingo.
- **Un seul CTA principal par écran** : pilule sombre `#111827` (ou verte `#22C55E` dans le tiroir de validation).
- **Zéro surcharge cognitive** : pas de cœurs/vies, pas de menus latéraux complexes, maximum 4 onglets en navigation basse.

---

## 2. Palette de couleurs (Codes HEX exacts)

| Rôle | Couleur HEX | Classe Tailwind utilisée | Usage |
|---|---|---|---|
| **Canvas principal** | `#FFFFFF` | `bg-white` | Arrière-plan des écrans mobiles et cartes actives |
| **Fond bureau / shell** | `#F3F4F6` | `bg-[#F3F4F6]` | Fond derrière le simulateur de téléphone sur desktop (`lg:`) |
| **Surface diagramme / carte neutre** | `#F7F8FA` | `bg-[#F7F8FA]` | Cartes d'intro, schémas `VisualStage`, tuiles secondaires |
| **Bordure hairline** | `#E5E7EB` | `border-[#E5E7EB]` | Contours cartes, séparateurs header/footer |
| **Bordure interactive** | `#D1D5DB` / `#9CA3AF` | `border-[#D1D5DB]` / `hover:border-[#9CA3AF]` | Tuiles sélectionnables et états hover |
| **Encre principale / CTA sombre** | `#111827` | `text-[#111827]` / `bg-[#111827]` | Titres, CTA primaires (`Commencer`, `Vérifier`, `J'ai compris`), sélection active |
| **Encre secondaire** | `#4B5563` / `#6B7280` | `text-[#4B5563]` / `text-[#6B7280]` | Sous-titres, descriptions, libellés secondaires |
| **Texte désactivé / icône inactive** | `#9CA3AF` | `text-[#9CA3AF]` | Onglets inactifs, boutons verrouillés |
| **Vert Brilliant (progression & succès)** | `#22C55E` | `bg-[#22C55E]` / `border-[#22C55E]` | Barre de progression de leçon, bouton `Continuer`, côtés allumés |
| **Vert hover / texte succès** | `#16A34A` / `#15803D` | `hover:bg-[#16A34A]` / `text-[#15803D]` | Labels de phase, `+15 XP`, états maîtrisés |
| **Fond tiroir succès** | `#DCFCE7` | `bg-[#DCFCE7]` | Tiroir feedback réussi, badges « Notion maîtrisée » |
| **Pill « Pourquoi ? » (succès)** | `#BBF7D0` | `bg-[#BBF7D0]` (`text-[#14532D]`) | Bouton secondaire dans le tiroir de succès |
| **Bordure succès douce** | `#86EFAC` | `border-[#86EFAC]` | Cartes terminées et bordures de succès |
| **Jaune XP (éclair)** | `#FACC15` / `#EAB308` | `fill-[#FACC15] text-[#EAB308]` | Icône éclair du compteur XP |
| **Orange Série / Alerte** | `#F97316` / `#F59E0B` | `text-[#F97316]` / `bg-[#F59E0B]` | Flamme de série et bannière hors-ligne |
| **Erreur douce (feedback)** | `#FEF2F2` / `#FEE2E2` / `#FECACA` | `bg-[#FEF2F2]` | Tiroir d'erreur et pilule `Pourquoi ?` en échec (`text-[#7F1D1D]`) |
| **Erreur critique** | `#EF4444` / `#DC2626` | `bg-[#EF4444]` / `text-[#DC2626]` | Flash d'association incorrecte, angle droit géométrie |

### Couleurs des modèles en barres (`VisualStage.tsx` → `BAR_COLOR_CLASSES`)

- `emerald` : fond `#86EFAC`, texte `#052E16`, bordure `#22C55E`
- `sky` : fond `#93C5FD`, texte `#0F172A`, bordure `#3B82F6`
- `amber` : fond `#FCD34D`, texte `#451A03`, bordure `#F59E0B`
- `violet` : fond `#C4B5FD`, texte `#2E1065`, bordure `#8B5CF6`
- `slate` : fond `#E5E7EB`, texte `#111827`, bordure `#D1D5DB`

---

## 3. Typographies & échelle de texte

Chargées dans `index.html` via Google Fonts et déclarées dans `src/index.css` :

- **Titres / Chiffres clés / Boutons** : `'Fredoka', system-ui, -apple-system, sans-serif` (classe `.font-display` et `h1, h2, h3`).
- **Corps / Consignes / Explications** : `'Nunito', system-ui, -apple-system, sans-serif` (sur `html, body`).
- **Chiffres alignés** : `.tabular-nums` (`font-variant-numeric: tabular-nums`) sur tous les compteurs XP, séries, fractions et équations.

| Élément | Taille & graisse | Exemple |
|---|---|---|
| Titre d'onboarding `h1` | `text-[26px] font-bold leading-tight` | *Comprendre les maths en manipulant* |
| Titre d'écran / bilan `h1` | `text-2xl font-bold` | *Parcours*, *Défis du jour*, *Notion maîtrisée* |
| Titre de carte / question `h2` | `text-lg` à `text-xl font-bold` | *Construis la grille !* |
| Surtitre de phase | `text-[11px] font-extrabold uppercase tracking-wide` | `LIGNES ET COLONNES · MANIPULATION TACTILE` |
| Consigne principale | `text-sm` à `text-base font-semibold` | Textes d'énoncé et explications |
| Badges & labels nav | `text-[11px] font-bold` / `font-extrabold` | `Disponible`, `Verrouillé`, `Accueil` |

---

## 4. Espacements, rayons & ombres

- **Padding horizontal de page** : `px-4` (`16px`) sur les onglets ; `px-5` (`20px`) dans les leçons ; `px-6` (`24px`) en onboarding/bilan.
- **Safe areas mobiles** : `.pt-safe` (`max(0.75rem, env(safe-area-inset-top))`) et `.pb-safe` (`max(0.5rem, env(safe-area-inset-bottom))`).
- **Rayons de bordure** :
  - `rounded-full` (`9999px`) : CTA principaux, pilules `Pourquoi ?`, badges statut, barre de progression, points d'étape.
  - `rounded-3xl` (`24px`) : grandes cartes (`HomeScreen`, chapitres `CurriculumScreen`, défis, cartes `ProfileTab`).
  - `rounded-2xl` (`16px`) : sous-cartes, diagrammes `VisualStage`, choix de QCM, champs texte.
  - `rounded-xl` (`12px`) : boutons pas-à-pas, paniers de manipulation, cases de grille.
  - `rounded-t-3xl` : tiroir de feedback ancré en bas de `LessonScreen`.
- **Ombres** : très sobres (`shadow-xs` sur cartes actives, `shadow-xl` sur le tiroir feedback, `lg:shadow-2xl` uniquement sur la coque du téléphone simulé sur desktop).

---

## 5. Composants & boutons standards

- **Bouton primaire sombre** : `w-full min-h-[48px..52px] rounded-full bg-[#111827] hover:bg-[#1F2937] text-white font-display font-bold`
- **Bouton succès / continuer** : `w-full min-h-[48px..50px] rounded-full bg-[#22C55E] hover:bg-[#16A34A] text-white font-display font-bold`
- **Bouton secondaire / révision** : `w-full min-h-[44px..46px] rounded-full bg-[#F7F8FA] border border-[#E5E7EB] text-[#111827] font-display font-bold`
- **Bouton désactivé** : `bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed`
- **Choix QCM / Comparaison** : `min-h-[52px]` (ou `min-h-[56px]`), `border-2`, sélectionné = `border-[#111827] bg-[#F7F8FA]`, sinon `border-[#E5E7EB] bg-white`.
- **Cibles tactiles** : toutes les cibles interactives respectent `>= 44px` en hauteur (ou hit-area SVG élargie via `<line strokeWidth="26" stroke="transparent">` / `<circle r="24" fill="transparent">`).

---

## 6. Transitions & animations d'interface

- **Transitions d'écran (`App.tsx`)** : `AnimatePresence mode="wait"` avec `duration: 0.16` sur le lancement de leçon.
- **Tiroir feedback (`LessonScreen.tsx`)** : glissement ressort depuis le bas (`initial={{ y: '100%' }}`, `animate={{ y: 0 }}`, `stiffness: 320, damping: 30`).
- **Secousse douce d'erreur** : classe `.animate-shake` (`@keyframes gentle-shake` dans `src/index.css`).
- **Accessibilité** : `<MotionConfig reducedMotion="user">` + `@media (prefers-reduced-motion: reduce)` dans `src/index.css`.

---

## 7. Règles responsive & correspondance Mobbin

- **Mobile (`< 1024px`)** : la coque `MobileFrameShell` prend `w-full h-[100dvh]`, zéro cadre superflu.
- **Desktop (`>= 1024px`, `lg:`)** : viewport `390px × 812px` (`max-h-[90dvh]`, bordure `10px #111827`, `rounded-[44px]`) centré aux côtés du panneau compagnon (QR code + guide démo).
- **Correspondance directe avec les 6 captures Mobbin fournies** :
  1. **Splash / Welcome** → `WelcomeScreen` minimaliste blanc + logo + mascotte + pilule sombre.
  2. **Header de leçon** → croix `X` à gauche | barre verte + points gris/verts au centre | éclair jaune `#FACC15` + XP à droite (`LessonScreen`).
  3. **Slide discovery (`◀ ••• ▶`)** → `discover-stepper` dans `InteractiveManipulator` avec flèches carrées arrondies et indicateurs de slides.
  4. **Modèles en barres & schémas** → `VisualStage` sur fond `#F7F8FA`.
  5. **Tiroir feedback vert** → `#DCFCE7` avec titre à gauche, `+15 XP`, pilule `Pourquoi ?` à droite et grand bouton vert `Continuer` en dessous.
  6. **Écran d'explication dédié** → `ExplanationView` en overlay plein écran avec retour haut-gauche, badge vert, diagramme et mini-vérification.
