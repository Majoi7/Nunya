# LOTTIE_ANIMATIONS.md — Icônes et micro-interactions

## Périmètre et état

18 vrais fichiers JSON provenant de pages **Free Animation** de LottieFiles sont intégrés dans `src/assets/animations/`. Ils correspondent à 19 entrées du registre : le son activé et le son coupé utilisent deux segments du même fichier.

Le remplacement est progressif, pas une suppression générale de Lucide. Les icônes restantes sont indiquées plus bas. Les diagrammes mathématiques, objets à compter, opérateurs, vrais QR codes et la mascotte SVG originale ne sont pas des icônes décoratives interchangeables : ils sont conservés.

**Vérifications navigateur en cours.** Ne pas considérer ce document comme une certification sur appareil réel. Les résultats définitifs sont à ajouter après la campagne de validation.

## Architecture et réutilisation

- `src/types/animations.ts` : contrats et noms des animations.
- `src/assets/animations/registry.ts` : URLs locales, segments, frame de repos, vitesse et palette.
- `src/components/LottieIcon.tsx` : lecteur décoratif React, taille, lecture, vitesse, boucle, déclenchement, fallback.
- `src/utils/lottieAssets.ts` : chargement mutualisé, validation du JSON, clonage et coloration.
- `src/index.css` : tokens sémantiques, styles partagés, empreinte fixe et focus des vrais contrôles.
- `src/assets/animations/sources.json` : nom, auteur, page source, téléchargement, modifications, taille et empreintes SHA-256.
- `src/assets/animations/LICENSE.txt` : texte intégral de la licence des fichiers.

```tsx
import { LottieIcon } from './LottieIcon';

// Lecture ponctuelle à l'arrivée d'un état de réussite.
<LottieIcon animation="success" size={24} tone="success" trigger="mount" />

// Nouvelle lecture lorsque le compteur change, sans remonter le lecteur.
<LottieIcon animation="xp" size={20} tone="xp" trigger="manual" replayKey={xp} />

// Interaction souris, tactile ou focus clavier sur le bouton contenant l'icône.
<button type="button" onClick={onContinue}>
  <span>Continuer</span>
  <LottieIcon animation="arrowRight" tone="inverse" />
</button>

// Seul un véritable état d'attente justifie une boucle.
<div role="status">
  <LottieIcon animation="loading" trigger="mount" loop />
  <span>Astuce supplémentaire en cours...</span>
</div>
```

### API

| Prop | Défaut | Effet |
|---|---|---|
| `animation` | obligatoire | Entrée typée du registre |
| `size` | `20` | Empreinte carrée en pixels, bornée entre 8 et 160 |
| `play` | `true` | `false` : frame de repos sans lecture |
| `speed` | registre | Multiplicateur borné entre 0,25 et 4 |
| `loop` | `false` | Boucle booléenne ou nombre de répétitions |
| `trigger` | `interaction` | `mount`, `interaction`, `manual` |
| `replayKey` | — | Changement de valeur : nouvelle lecture ponctuelle |
| `tone` | `inherit` | `ink`, `muted`, `inverse`, `success`, `xp`, `warning`, `error` ou héritage |
| `fallback` | Lucide sémantique | Repli React personnalisable |
| `className` | vide | Classes sur l'empreinte, pas sur le bouton |

### Principes appliqués du skill mobile-ios-design

- **Clarté et déférence** : libellés conservés ; mouvement ponctuel, jamais un signal pédagogique remplacé par une décoration.
- **Feedback compréhensible** : check et croix accompagnent le texte de réussite/erreur ; état de chargement avec texte annoncé.
- **Interactions immédiates** : aucun bouton n'attend la fin d'une animation pour exécuter son action.
- **Accessibilité** : icône `aria-hidden`, pas de nouvelle cible focusable ; focus visible sur les contrôles HTML ; cibles corrigées sur les actions modifiées ; zoom de page réautorisé.
- **Mouvement réduit** : préférence système suivie en direct ; lecteurs détruits et repli statique conservé. Même repli en couleurs forcées pour ne pas perdre le contraste.
- **Safe areas, typographies, direction Brilliant** : préservées. Pas de SwiftUI, de SF Symbols ni de migration de framework.

## Catalogue intégré

Toutes les lignes ci-dessous ont un JSON local réel. La page source précise l'auteur ; les URLs CDN et les empreintes complètes sont conservées dans `sources.json`.

| Registre / fichier | Usages | Source et auteur |
|---|---|---|
| `home` / `home.json` | Navigation Accueil | [Home Icon Animation](https://lottiefiles.com/free-animation/home-icon-animation-LzApF77AwX) — Md Najmul Islam Shakil |
| `book` / `book.json` | Parcours, carte leçon, chapitres, mode libre/démo et guide | [Open book](https://lottiefiles.com/free-animation/open-book-haTcqfLLUP) — Zeshan Ali |
| `target` / `target.json` | Navigation Défis et objectif quotidien | [Target](https://lottiefiles.com/free-animation/target-dNaR6d0GIs) — metzxevandro |
| `profile` / `profile.json` | Navigation Profil | [User Icon](https://lottiefiles.com/free-animation/user-icon-cgJUAwqCCA) — Waqar Ali |
| `success` / `success.json` | Tiroir correct, associations, mini-quiz, notions terminées, défis réclamés, bilan, copie confirmée | [Checkmark Icon](https://lottiefiles.com/free-animation/checkmark-icon-WOt34lfkuV) — Waqar Ali |
| `xp` / `xp.json` | Compteurs XP, récompenses et éclair du logo | [Black lightningt](https://lottiefiles.com/free-animation/black-lightningt-3F17jDNZ1y) — Zach Batastini |
| `streak` / `streak.json` | Série dans l'en-tête et les défis | [Fire icon](https://lottiefiles.com/free-animation/fire-icon-5XbquckJJk) — metzxevandro |
| `star` / `star.json` | Étoiles du parcours, bilan et annonce d'une récompense | [Star](https://lottiefiles.com/free-animation/star-GJyalX0cIL) — Rishabh Tattva |
| `hint` / `hint.json` | Explication et indice visuel | [Idea Bulb](https://lottiefiles.com/free-animation/idea-bulb-QT00q9HsP4) — Arpan Gupta |
| `loading` / `loading.json` | Attente de l'astuce du tuteur | [Spinner](https://lottiefiles.com/free-animation/spinner-xxGTBzrt9M) — Robert Hamilton |
| `arrowRight` / `arrow-right.json` | Commencer, leçon, étape suivante, prochaine notion | [Right Arrow](https://lottiefiles.com/free-animation/right-arrow-GurDb5y25n) — Muhammad Waseem |
| `arrowLeft` / `arrow-left.json` | Retours et découverte précédente | [Left Arrow](https://lottiefiles.com/free-animation/left-arrow-7tiLcN0Fg6) — Muhammad Waseem |
| `close` / `close.json` | Quitter la leçon et fermer la modale QR | [Close Icon Google Material Icon](https://lottiefiles.com/free-animation/close-icon-google-material-icon-iht3D4ylii) — Motion Sets |
| `refresh` / `refresh.json` | Recommencer une manipulation/ordre et accès à la réinitialisation | [Refresh Icon](https://lottiefiles.com/free-animation/refresh-icon-vYyydq8Mn6) — Sasha Grabovich |
| `download` / `download.json` | Installation PWA dans profil et panneau desktop | [Download Icon Animation](https://lottiefiles.com/free-animation/download-icon-animation-5sPqHxY2jj) — Marco Cagnina |
| `soundOn`, `soundOff` / `sound.json` | Réglage du son avec segments correspondant à l'état réel | [Volume Sound Control UI Icon](https://lottiefiles.com/free-animation/volume-sound-control-ui-icon-ZwZ71rbtg7) — MD Abdur Rahim |
| `lock` / `lock.json` | Notions verrouillées : frame fermé, sans animation d'ouverture | [Lock Icon](https://lottiefiles.com/free-animation/lock-icon-yygYi3O1u1) — Logix Studio |
| `error` / `error.json` | Tiroir de réponse incorrecte, sans modifier le score | [Error Icon](https://lottiefiles.com/free-animation/error-icon-vkypclwPFL) — Mojtaba fahiminia |

### Segments et repos

Les sources incluent parfois un dessin **puis un effacement**. Ne jamais lancer un fichier complet sans vérifier sa frame finale. Le registre sélectionne des segments et replace systématiquement l'icône sur `restFrame` après une lecture. Le verrou reste fermé ; le haut-parleur n'alterne pas silencieusement entre activé et coupé. Une étoile non obtenue est statique et grisée.

## Sources et licences

- Lecteur **lottie-web 5.13.0**, licence **MIT** ; version SVG light importée à la demande, sans moteur d'expressions After Effects.
- Animations : **Lottie Simple License (FL 9.13.21)**, [texte officiel](https://lottiefiles.com/page/license), copyright © 2021 Design Barn Inc.
- Cette licence permet l'usage commercial et les modifications des animations publiques téléchargeables ; elle n'est pas remplacée par la licence MIT du lecteur.
- Les JSON locaux sont des versions modifiées pour harmoniser la palette. Géométrie et images-clés d'origine conservées ; cadrage et vitesse contrôlés par le registre. Ces versions restent expressément distribuées sous la **même Lottie Simple License**.
- La licence intégrale et les sources sont conservées dans le projet et distribuées dans `dist/licenses/lottie/` lors du build.
- Aucun téléchargement premium, aucune authentification contournée, aucune animation fabriquée pour simuler un asset LottieFiles.

## Performance et hors-ligne

- Poids total initial des 18 JSON harmonisés : **174 316 octets** (~170 Kio), hors notices et lecteur.
- Vite émet des JSON séparés avec noms hashés (`?url&no-inline`), pas leur contenu dans le JS initial.
- Chargement seulement quand l'icône est visible ; un seul téléchargement par URL dans une session.
- Lecteur importé dynamiquement ; un clone par instance évite les mutations partagées de lottie-web.
- Pause hors viewport et lorsque l'onglet navigateur est masqué ; destruction au démontage/préférence réduite.
- Repli pendant le chargement, après HTTP/JSON invalide, erreur lecteur ou délai dépassé. Les boutons et textes fonctionnent sans lecteur.
- Workbox pré-cache les JSON hashés, le chunk du lecteur et les notices pour les écrans ouverts pour la première fois hors-ligne après une installation réussie du service worker.
- L'ancien plugin de copie de `src/assets` exclut les JSON Lottie déjà émis par Vite : pas de deuxième copie non hashée dans `dist/src/assets/animations`.

## Inventaire des exceptions / remplacement restant

| Emplacement | Icônes conservées | Motif et prochaine action |
|---|---|---|
| `HomeScreen.tsx` | `Clock`, `Shapes`, `Layers`, `Compass` | Durée et domaines distincts ; pas de source suffisamment cohérente retenue. Chercher respectivement horloge, formes, grille et exploration, avec licence et lisibilité à 14–20 px. |
| `OnboardingScreen.tsx` | `Compass`, `Hand` | Découverte et manipulation tactile : ne pas leur substituer une récompense générique. Sources boussole/main pertinentes à sélectionner. |
| `ProfileTab.tsx` | `QrCode` | Action QR distincte ; un vrai QR doit rester stable et scannable. Animation de l'action seulement possible si une source pertinente est retenue. |
| `MobileFrameShell.tsx`, `QRShareModal.tsx` | `Smartphone`, `Copy`, `ExternalLink` | Téléphone, copie et lien doivent rester identifiables. La confirmation de copie est déjà animée ; les autres sources restent à sélectionner. |
| `VictoryScreen.tsx` | `Eye` et emojis de badges | Révision et badges ont des significations distinctes ; ne pas les uniformiser avec une étoile. |
| `InteractiveManipulator.tsx` | `Plus`, `Minus`, glyphes de retrait et objets emoji | Opérations/cases pédagogiques : exactitude et comptage priment. Les boutons de pas sont agrandis, mais les signes ne sont pas animés. |
| `VisualStage.tsx` | Formes, barres, grilles, opérateurs, objets | Contenu mathématique, non visuels génériques. Aucune substitution. |
| `components/mascot/` | `TurkeyMascot`, `MascotController`, géométrie originale | Source vectorielle prioritaire et 8 états conservés. Aucun remplacement Lottie. |
| États vide/hors-ligne | Texte existant ; pas de nouvel écran inventé | Aucun asset sans rapport ajouté pour prétendre couvrir un état inexistant. |

Les icônes Lucide situées **dans les fallbacks** ne sont pas des emplacements oubliés : elles garantissent l'accès immédiat, le mouvement réduit et la tolérance aux erreurs.

## Vérifications reproductibles

```bash
npm run lint
npx --no-install tsx --test src/utils/gameLogic.test.ts src/utils/lottieAssets.test.ts
npm run build
node tests/lottie-browser.mjs
# Fixture détaillée : serveur de développement déjà lancé sur 3000
node tests/lottie-browser.mjs --fixture
```

`tests/lottie-browser.mjs` utilise Chrome installé (variable `CHROME_PATH` pour un autre chemin), un profil temporaire isolé et le protocole DevTools, sans dépendance Playwright supplémentaire. Le scénario production sert `dist/` sur loopback et simule `/api/config` et `/api/tutor` localement ; **aucun appel Gemini réel**. Il n'altère pas le profil navigateur ni la sauvegarde de l'utilisateur.

Contrôles prévus : onboarding, onglets, erreur/réussite, tuteur en attente, mini-quiz, bilan, erreurs, géométrie préservée, grille, sauvegarde ; largeurs 360/390/430/768/1440 ; fallbacks de chargement, préférence réduite/couleurs forcées, clavier, pré-cache et rechargement hors-ligne. Les vérifications effectuées, leurs résultats et les limites doivent être distingués dans le compte rendu final.

**Restant sur appareils physiques** : Safari iOS/VoiceOver, Android/TalkBack, consommation batterie/performance sur téléphone peu puissant, installation HTTPS et zoom/pinch réel.
