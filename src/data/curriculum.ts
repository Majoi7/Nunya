import type { Exercise, GradeLevel } from '../types/math';

interface GradeScale {
  addLeft: number;
  addRight: number;
  subTotal: number;
  subRemove: number;
  mulRows: number;
  mulCols: number;
  divBaskets: number;
  divPerBasket: number;
}

const GRADE_SCALES: Record<GradeLevel, GradeScale> = {
  CP: {
    addLeft: 3,
    addRight: 2,
    subTotal: 6,
    subRemove: 2,
    mulRows: 2,
    mulCols: 3,
    divBaskets: 2,
    divPerBasket: 3,
  },
  CE1: {
    addLeft: 4,
    addRight: 3,
    subTotal: 8,
    subRemove: 3,
    mulRows: 3,
    mulCols: 3,
    divBaskets: 3,
    divPerBasket: 2,
  },
  CE2: {
    addLeft: 5,
    addRight: 4,
    subTotal: 9,
    subRemove: 4,
    mulRows: 3,
    mulCols: 4,
    divBaskets: 3,
    divPerBasket: 3,
  },
  CM1: {
    addLeft: 6,
    addRight: 5,
    subTotal: 10,
    subRemove: 4,
    mulRows: 4,
    mulCols: 4,
    divBaskets: 4,
    divPerBasket: 3,
  },
  CM2: {
    addLeft: 7,
    addRight: 5,
    subTotal: 11,
    subRemove: 5,
    mulRows: 4,
    mulCols: 5,
    divBaskets: 4,
    divPerBasket: 4,
  },
  '6e': {
    addLeft: 8,
    addRight: 6,
    subTotal: 12,
    subRemove: 5,
    mulRows: 5,
    mulCols: 5,
    divBaskets: 4,
    divPerBasket: 4,
  },
};

export function getExercisesForNotion(notionId: string, grade: GradeLevel): Exercise[] {
  const s = GRADE_SCALES[grade] ?? GRADE_SCALES.CE2;
  const isYoung = grade === 'CP' || grade === 'CE1';

  switch (notionId) {
    // =========================================================================
    // CHAPITRE 1 : ADDITION & ASSEMBLAGE
    // =========================================================================
    case 'ch1-n1': {
      const a = s.addLeft;
      const b = s.addRight;
      const sum = a + b;
      const qA = isYoung ? 4 : 16;
      const qB = isYoung ? 5 : 14;
      const qSum = qA + qB;

      return [
        {
          id: 'ch1-n1-discover',
          phase: 'decouverte',
          phaseLabel: 'Découverte & Observation',
          type: 'discover-stepper',
          topic: 'addition',
          introTitle: 'Voir l’addition comme un assemblage',
          introText: 'Observe comment deux quantités séparées se réunissent pour former une seule barre totale.',
          question: 'Fais défiler les étapes ci-dessous pour découvrir l’idée clé.',
          slides: [
            {
              caption: `Au départ, nous avons deux groupes distincts : ${a} jetons bleus et ${b} jetons verts.`,
              highlightFormula: `${a}   et   ${b}`,
              visual: {
                kind: 'equation-objects',
                operator: '+',
                groups: [
                  { emoji: '🔵', count: a, label: `${a} bleus` },
                  { emoji: '🟢', count: b, label: `${b} verts` },
                ],
              },
            },
            {
              caption: 'En les plaçant bout à bout sur la même ligne, leurs longueurs s’ajoutent.',
              highlightFormula: `${a} + ${b}`,
              visual: {
                kind: 'bars',
                topBar: [
                  { label: String(a), color: 'sky', flex: a },
                  { label: String(b), color: 'emerald', flex: b },
                ],
                bottomBar: [{ label: 'Ensemble ?', color: 'slate', flex: sum }],
              },
            },
            {
              caption: `Réunir les deux groupes donne exactement ${sum} jetons au total !`,
              highlightFormula: `${a} + ${b} = ${sum}`,
              visual: {
                kind: 'bars',
                topBar: [
                  { label: String(a), color: 'sky', flex: a },
                  { label: String(b), color: 'emerald', flex: b },
                ],
                bottomBar: [{ label: String(sum), color: 'amber', flex: sum }],
              },
            },
          ],
          correctAnswer: 'observed',
          simpleExplanation: `Additionner, c’est réunir deux parties bout à bout : ${a} + ${b} = ${sum}.`,
          visualHint: `Regarde les deux barres du haut : mises ensemble, elles ont exactement la même longueur que ${sum}.`,
        },
        {
          id: 'ch1-n1-manip',
          phase: 'manipulation',
          phaseLabel: 'Manipulation tactile',
          type: 'manipulate-addition',
          topic: 'addition',
          introTitle: 'À toi de manipuler !',
          introText: `Touche les pommes des deux paniers pour les réunir dans le grand bol, puis observe le total.`,
          question: `Réunis les ${a} pommes rouges et les ${b} pommes vertes dans le bol.`,
          manipulation: {
            leftCount: a,
            rightCount: b,
            leftEmoji: '🍎',
            rightEmoji: '🍏',
          },
          correctAnswer: String(sum),
          simpleExplanation: `En déplaçant les ${a} pommes puis les ${b} pommes dans le bol, tu as construit ${a} + ${b} = ${sum} pommes !`,
          visualHint: `Touche chaque pomme restante jusqu’à ce que les deux paniers soient vides.`,
        },
        {
          id: 'ch1-n1-question',
          phase: 'question',
          phaseLabel: 'Question de compréhension',
          type: 'qcm',
          topic: 'addition',
          introTitle: 'Vérifions ton intuition',
          introText: 'Les deux barres ci-dessous ont exactement la même longueur.',
          question: `Combien vaut ${qA} + ${qB} ?`,
          visual: {
            kind: 'bars',
            topBar: [
              { label: String(qA), color: 'sky', flex: qA },
              { label: String(qB), color: 'emerald', flex: qB },
            ],
            bottomBar: [{ label: '?', color: 'slate', flex: qSum }],
          },
          choices: [String(qSum - 2), String(qSum), String(qSum + 1)],
          correctAnswer: String(qSum),
          simpleExplanation: `En assemblant ${qA} et ${qB}, on obtient ${qSum}.`,
          visualHint: `Pars de ${qA} et ajoute ${qB} (tu peux décomposer en dizaines et unités).`,
        },
        {
          id: 'ch1-n1-apply',
          phase: 'application',
          phaseLabel: 'Application',
          type: 'fill-blank',
          topic: 'addition',
          introTitle: 'Défi d’application',
          introText: 'Choisis la bonne valeur pour équilibrer le modèle en barres.',
          question: 'Quel nombre complète la somme ?',
          equationTemplate: [`${qA + 2} + `, ` = ${qSum + 2}`],
          visual: {
            kind: 'bars',
            topBar: [
              { label: String(qA + 2), color: 'sky', flex: qA + 2 },
              { label: '?', color: 'amber', flex: qB },
            ],
            bottomBar: [{ label: String(qSum + 2), color: 'emerald', flex: qSum + 2 }],
          },
          choices: [String(qB - 1), String(qB), String(qB + 2), String(qB + 4)],
          correctAnswer: String(qB),
          simpleExplanation: `${qA + 2} + ${qB} = ${qSum + 2} ! La barre manquante mesure bien ${qB}.`,
          visualHint: `Cherche ce qu’il faut ajouter à ${qA + 2} pour atteindre ${qSum + 2}.`,
        },
      ];
    }

    case 'ch1-n2': {
      const pA = isYoung ? 4 : 15;
      const pB = isYoung ? 5 : 25;
      const pTotal = pA + pB;

      return [
        {
          id: 'ch1-n2-discover',
          phase: 'decouverte',
          phaseLabel: 'Découverte & Observation',
          type: 'discover-stepper',
          topic: 'addition',
          introTitle: 'Trouver une partie manquante',
          introText: 'Quand on connaît le total et une partie, le modèle en barres révèle l’autre partie.',
          question: 'Observe les étapes de raisonnement.',
          slides: [
            {
              caption: `On sait que la barre entière vaut ${pTotal}, et la première partie vaut ${pA}.`,
              highlightFormula: `${pA} + ? = ${pTotal}`,
              visual: {
                kind: 'bars',
                topBar: [
                  { label: String(pA), color: 'sky', flex: pA },
                  { label: '?', color: 'amber', flex: pB },
                ],
                bottomBar: [{ label: String(pTotal), color: 'emerald', flex: pTotal }],
              },
            },
            {
              caption: `La taille du bloc orange est exactement ce qui sépare ${pA} de ${pTotal}.`,
              highlightFormula: `? = ${pTotal} - ${pA} = ${pB}`,
              visual: {
                kind: 'bars',
                topBar: [
                  { label: String(pA), color: 'sky', flex: pA },
                  { label: String(pB), color: 'amber', flex: pB },
                ],
                bottomBar: [{ label: String(pTotal), color: 'emerald', flex: pTotal }],
              },
            },
          ],
          correctAnswer: 'observed',
          simpleExplanation: `Si ${pA} + ? = ${pTotal}, alors la partie manquante vaut ${pB}.`,
          visualHint: `Complète de ${pA} jusqu’à ${pTotal}.`,
        },
        {
          id: 'ch1-n2-manip',
          phase: 'manipulation',
          phaseLabel: 'Manipulation tactile',
          type: 'manipulate-addition',
          topic: 'addition',
          introTitle: 'Assemble les deux paquets',
          introText: 'Réunis toutes les étoiles dans le bol pour vérifier le total.',
          question: `Réunis ${s.addLeft} étoiles dorées et ${s.addRight + 1} étoiles bleues.`,
          manipulation: {
            leftCount: s.addLeft,
            rightCount: s.addRight + 1,
            emoji: '⭐',
          },
          correctAnswer: String(s.addLeft + s.addRight + 1),
          simpleExplanation: `${s.addLeft} + ${s.addRight + 1} = ${s.addLeft + s.addRight + 1} étoiles au total !`,
          visualHint: `Touche chaque étoile pour l’envoyer dans le bol central.`,
        },
        {
          id: 'ch1-n2-question',
          phase: 'question',
          phaseLabel: 'Question',
          type: 'compare',
          topic: 'addition',
          introTitle: 'Comparer deux sommes',
          introText: 'Calcule la somme à gauche avant de la comparer au nombre de droite.',
          question: 'Quel symbole rend la comparaison vraie ?',
          visual: {
            kind: 'scale',
            leftExpr: `${pA} + ${pB}`,
            rightExpr: String(pTotal + 3),
          },
          choices: ['<', '=', '>'],
          correctAnswer: '<',
          simpleExplanation: `${pA} + ${pB} = ${pTotal}, qui est plus petit que ${pTotal + 3}.`,
          visualHint: `Compare ${pTotal} à ${pTotal + 3}.`,
        },
        {
          id: 'ch1-n2-apply',
          phase: 'application',
          phaseLabel: 'Application',
          type: 'match',
          topic: 'addition',
          introTitle: 'Associe chaque somme',
          introText: 'Relie chaque addition à gauche à son résultat exact à droite.',
          question: 'Trouve les 3 paires correctes :',
          pairs: [
            { id: 'm1', left: `${pA} + ${pB}`, right: String(pTotal) },
            { id: 'm2', left: isYoung ? '5 + 5' : '25 + 15', right: isYoung ? '10' : '40' },
            { id: 'm3', left: isYoung ? '6 + 3' : '18 + 12', right: isYoung ? '9' : '30' },
          ],
          correctAnswer: 'all-matched',
          simpleExplanation: `Chaque paire associe exactement une somme et son total.`,
          visualHint: `Commence par les nombres qui forment une dizaine ronde.`,
        },
      ];
    }

    // =========================================================================
    // CHAPITRE 2 : SOUSTRACTION & ÉCART
    // =========================================================================
    case 'ch2-n1': {
      const total = s.subTotal;
      const remove = s.subRemove;
      const remain = total - remove;
      const qBig = isYoung ? 9 : 34;
      const qSmall = isYoung ? 4 : 12;
      const qRes = qBig - qSmall;

      return [
        {
          id: 'ch2-n1-discover',
          phase: 'decouverte',
          phaseLabel: 'Découverte & Observation',
          type: 'discover-stepper',
          topic: 'soustraction',
          introTitle: 'Comprendre ce qu’il reste',
          introText: 'Soustraire, c’est retirer une partie d’un groupe pour observer ce qui reste.',
          question: 'Fais défiler les étapes pour voir la soustraction en action.',
          slides: [
            {
              caption: `Au départ, le groupe contient ${total} billes.`,
              highlightFormula: `${total} billes`,
              visual: {
                kind: 'objects',
                groups: [{ emoji: '🟠', count: total }],
              },
            },
            {
              caption: `On retire ${remove} billes (elles sont barrées). Il en reste exactement ${remain}.`,
              highlightFormula: `${total} - ${remove} = ${remain}`,
              visual: {
                kind: 'equation-objects',
                operator: '-',
                groups: [{ emoji: '🟠', count: total, crossedOut: remove, label: `${remove} retirées` }],
              },
            },
          ],
          correctAnswer: 'observed',
          simpleExplanation: `En partant de ${total} et en retirant ${remove}, il reste ${remain}.`,
          visualHint: `Compte seulement les objets qui ne sont pas barrés.`,
        },
        {
          id: 'ch2-n1-manip',
          phase: 'manipulation',
          phaseLabel: 'Manipulation tactile',
          type: 'manipulate-soustraction',
          topic: 'soustraction',
          introTitle: 'Retire les éléments !',
          introText: `Touche exactement ${remove} fraises pour les mettre de côté et observe ce qu’il reste.`,
          question: `Retire ${remove} fraises sur les ${total} disponibles.`,
          manipulation: {
            initialCount: total,
            removeCount: remove,
            emoji: '🍓',
          },
          correctAnswer: String(remain),
          simpleExplanation: `Bravo ! ${total} fraises moins ${remove} fraises retirées = ${remain} fraises restantes.`,
          visualHint: `Touche les fraises une par une jusqu’à ce que le compteur de retrait atteigne ${remove}.`,
        },
        {
          id: 'ch2-n1-question',
          phase: 'question',
          phaseLabel: 'Question',
          type: 'qcm',
          topic: 'soustraction',
          introTitle: 'Observation des barres',
          introText: `La grande barre vaut ${qBig}. On en enlève une partie de ${qSmall}.`,
          question: `Combien reste-t-il (${qBig} - ${qSmall}) ?`,
          visual: {
            kind: 'bars',
            topBar: [{ label: String(qBig), color: 'sky', flex: qBig }],
            bottomBar: [
              { label: String(qSmall), color: 'amber', flex: qSmall },
              { label: 'Reste ?', color: 'emerald', flex: qRes },
            ],
          },
          choices: [String(qRes - 1), String(qRes), String(qRes + 2)],
          correctAnswer: String(qRes),
          simpleExplanation: `${qBig} - ${qSmall} = ${qRes}. La partie verte complète exactement la barre.`,
          visualHint: `Recule de ${qSmall} en partant de ${qBig}.`,
        },
        {
          id: 'ch2-n1-apply',
          phase: 'application',
          phaseLabel: 'Application',
          type: 'fill-blank',
          topic: 'soustraction',
          introTitle: 'Nombre mystère retiré',
          introText: 'Trouve combien il faut enlever pour obtenir le reste affiché.',
          question: 'Complète l’équation :',
          equationTemplate: [`${qBig} - `, ` = ${qRes}`],
          choices: [String(qSmall - 2), String(qSmall), String(qSmall + 1), String(qSmall + 3)],
          correctAnswer: String(qSmall),
          simpleExplanation: `En retirant ${qSmall} de ${qBig}, on obtient bien ${qRes}.`,
          visualHint: `Tu peux vérifier en faisant ${qRes} + ? = ${qBig}.`,
        },
      ];
    }

    case 'ch2-n2': {
      const big = isYoung ? 10 : 42;
      const small = isYoung ? 4 : 18;
      const diff = big - small;

      return [
        {
          id: 'ch2-n2-discover',
          phase: 'decouverte',
          phaseLabel: 'Découverte & Observation',
          type: 'discover-stepper',
          topic: 'soustraction',
          introTitle: 'Mesurer un écart entre deux nombres',
          introText: 'La soustraction sert aussi à comparer deux grandeurs et voir ce qui les sépare.',
          question: 'Observe comment les deux barres montrent l’écart.',
          slides: [
            {
              caption: `Léo a ${big} points et Maya en a ${small}.`,
              highlightFormula: `${big} vs ${small}`,
              visual: {
                kind: 'bars',
                topBar: [{ label: `Léo : ${big}`, color: 'sky', flex: big }],
                bottomBar: [{ label: `Maya : ${small}`, color: 'amber', flex: small }],
              },
            },
            {
              caption: `L’écart entre les deux barres vaut ${big} - ${small} = ${diff}.`,
              highlightFormula: `Écart = ${diff}`,
              visual: {
                kind: 'bars',
                topBar: [{ label: String(big), color: 'sky', flex: big }],
                bottomBar: [
                  { label: String(small), color: 'amber', flex: small },
                  { label: `+${diff}`, color: 'emerald', flex: diff },
                ],
              },
            },
          ],
          correctAnswer: 'observed',
          simpleExplanation: `L’écart entre ${big} et ${small} est ${diff}, car ${small} + ${diff} = ${big}.`,
          visualHint: `Regarde le bloc vert qui manque à la petite barre pour atteindre la grande.`,
        },
        {
          id: 'ch2-n2-manip',
          phase: 'manipulation',
          phaseLabel: 'Manipulation tactile',
          type: 'manipulate-soustraction',
          topic: 'soustraction',
          introTitle: 'Enlève la partie connue',
          introText: `Retire ${s.subRemove + 1} jetons sur les ${s.subTotal} pour trouver l’écart restant.`,
          question: `Retire ${s.subRemove + 1} jetons du groupe.`,
          manipulation: {
            initialCount: s.subTotal,
            removeCount: s.subRemove + 1,
            emoji: '🟣',
          },
          correctAnswer: String(s.subTotal - (s.subRemove + 1)),
          simpleExplanation: `${s.subTotal} - ${s.subRemove + 1} = ${s.subTotal - (s.subRemove + 1)}.`,
          visualHint: `Touche ${s.subRemove + 1} jetons pour les retirer.`,
        },
        {
          id: 'ch2-n2-question',
          phase: 'question',
          phaseLabel: 'Question',
          type: 'qcm',
          topic: 'soustraction',
          introTitle: 'Problème de différence',
          introText: `Sami a ${big} billes et en donne ${small}.`,
          question: 'Combien de billes lui reste-t-il ?',
          choices: [String(diff - 2), String(diff), String(diff + 3)],
          correctAnswer: String(diff),
          simpleExplanation: `${big} - ${small} = ${diff} billes restantes.`,
          visualHint: `Calcule la différence entre ${big} et ${small}.`,
        },
        {
          id: 'ch2-n2-apply',
          phase: 'application',
          phaseLabel: 'Application',
          type: 'order',
          topic: 'soustraction',
          introTitle: 'Ranger les résultats',
          introText: 'Classe ces nombres du plus petit au plus grand.',
          question: 'Touche les cartes dans l’ordre croissant :',
          orderItems: [String(diff + 5), String(diff), String(diff + 9), String(diff + 2)],
          orderDirection: 'asc',
          correctAnswer: `${diff},${diff + 2},${diff + 5},${diff + 9}`,
          simpleExplanation: `L’ordre croissant exact est ${diff}, ${diff + 2}, ${diff + 5}, ${diff + 9}.`,
          visualHint: `Commence toujours par le plus petit nombre restant.`,
        },
      ];
    }

    // =========================================================================
    // CHAPITRE 3 : MULTIPLICATION EN GRILLES
    // =========================================================================
    case 'ch3-n1': {
      const r = s.mulRows;
      const c = s.mulCols;
      const prod = r * c;

      return [
        {
          id: 'ch3-n1-discover',
          phase: 'decouverte',
          phaseLabel: 'Découverte & Observation',
          type: 'discover-stepper',
          topic: 'multiplication',
          introTitle: 'Voir la multiplication comme un rectangle',
          introText: 'Plutôt que de compter un par un, alignons des rangées identiques !',
          question: 'Fais défiler les étapes pour voir comment naît une multiplication.',
          slides: [
            {
              caption: `Voici 1 rangée de ${c} gemmes.`,
              highlightFormula: `1 × ${c} = ${c}`,
              visual: {
                kind: 'grid',
                rows: 1,
                cols: c,
                dotEmoji: '💎',
              },
            },
            {
              caption: `Si on répète cette rangée ${r} fois, on forme un rectangle de ${r} lignes × ${c} colonnes !`,
              highlightFormula: `${r} × ${c} = ${prod}`,
              visual: {
                kind: 'grid',
                rows: r,
                cols: c,
                dotEmoji: '💎',
              },
            },
          ],
          correctAnswer: 'observed',
          simpleExplanation: `${r} rangées identiques de ${c} objets forment ${r} × ${c} = ${prod} objets.`,
          visualHint: `Multiplier, c’est additionner ${c} exactement ${r} fois.`,
        },
        {
          id: 'ch3-n1-manip',
          phase: 'manipulation',
          phaseLabel: 'Manipulation tactile',
          type: 'manipulate-multiplication',
          topic: 'multiplication',
          introTitle: 'Construis la grille !',
          introText: `Utilise les boutons de lignes et de colonnes (ou touche les cellules) pour former un rectangle de ${r} rangées de ${c} jetons.`,
          question: `Construis une grille de ${r} × ${c}.`,
          manipulation: {
            targetRows: r,
            targetCols: c,
            maxRows: Math.max(5, r + 1),
            maxCols: Math.max(5, c + 1),
            emoji: '💎',
          },
          correctAnswer: `${r}x${c}`,
          simpleExplanation: `Superbe grille ! ${r} rangées de ${c} colonnes donnent ${prod} gemmes (${r} × ${c} = ${prod}).`,
          visualHint: `Règle d’abord le nombre de lignes à ${r}, puis le nombre de colonnes à ${c}.`,
        },
        {
          id: 'ch3-n1-question',
          phase: 'question',
          phaseLabel: 'Question',
          type: 'qcm',
          topic: 'multiplication',
          introTitle: 'Compte grâce aux rangées',
          introText: `Observe cette grille de ${r} lignes et ${c} colonnes.`,
          question: `Combien y a-t-il d’étoiles au total (${r} × ${c}) ?`,
          visual: {
            kind: 'grid',
            rows: r,
            cols: c,
            dotEmoji: '🌟',
          },
          choices: [String(prod - c), String(prod), String(prod + r)],
          correctAnswer: String(prod),
          simpleExplanation: `${r} × ${c} = ${prod} étoiles au total.`,
          visualHint: `Compte de ${c} en ${c} pour chaque ligne !`,
        },
        {
          id: 'ch3-n1-apply',
          phase: 'application',
          phaseLabel: 'Application',
          type: 'fill-blank',
          topic: 'multiplication',
          introTitle: 'Facteur manquant',
          introText: 'Retrouve la dimension manquante du rectangle.',
          question: 'Complète la multiplication :',
          equationTemplate: [`${r} × `, ` = ${prod}`],
          choices: [String(c - 1), String(c), String(c + 1), String(c + 2)],
          correctAnswer: String(c),
          simpleExplanation: `Comme ${r} × ${c} = ${prod}, il faut ${c} colonnes.`,
          visualHint: `Demande-toi combien de colonnes de ${r} donnent ${prod}.`,
        },
      ];
    }

    case 'ch3-n2': {
      const r = s.mulRows;
      const c = s.mulCols;
      const p1 = r * c;
      const p2 = (r + 1) * c;
      const p3 = r * (c + 1);

      return [
        {
          id: 'ch3-n2-discover',
          phase: 'decouverte',
          phaseLabel: 'Découverte & Observation',
          type: 'discover-stepper',
          topic: 'multiplication',
          introTitle: 'Tourner la grille ne change pas le total',
          introText: 'C’est une propriété magique de la multiplication : l’ordre des facteurs ne change rien.',
          question: 'Compare les deux rectangles.',
          slides: [
            {
              caption: `Ici, nous avons ${r} lignes de ${c} points = ${p1}.`,
              highlightFormula: `${r} × ${c} = ${p1}`,
              visual: { kind: 'grid', rows: r, cols: c, dotEmoji: '🔵' },
            },
            {
              caption: `Si on tourne la grille, on a ${c} lignes de ${r} points = ${p1} aussi !`,
              highlightFormula: `${c} × ${r} = ${p1}`,
              visual: { kind: 'grid', rows: c, cols: r, dotEmoji: '🟢' },
            },
          ],
          correctAnswer: 'observed',
          simpleExplanation: `${r} × ${c} et ${c} × ${r} donnent tous les deux ${p1} !`,
          visualHint: `Tourner un rectangle ne crée ni ne détruit aucun point.`,
        },
        {
          id: 'ch3-n2-manip',
          phase: 'manipulation',
          phaseLabel: 'Manipulation tactile',
          type: 'manipulate-multiplication',
          topic: 'multiplication',
          introTitle: 'Forme le rectangle retourné',
          introText: `Construis maintenant la grille inversée de ${c} lignes × ${r} colonnes.`,
          question: `Construis la grille ${c} × ${r}.`,
          manipulation: {
            targetRows: c,
            targetCols: r,
            maxRows: Math.max(5, c + 1),
            maxCols: Math.max(5, r + 1),
            emoji: '🟣',
          },
          correctAnswer: `${c}x${r}`,
          simpleExplanation: `Parfait ! ${c} × ${r} = ${p1}, exactement comme ${r} × ${c} !`,
          visualHint: `Choisis ${c} lignes et ${r} colonnes.`,
        },
        {
          id: 'ch3-n2-question',
          phase: 'question',
          phaseLabel: 'Question',
          type: 'compare',
          topic: 'multiplication',
          introTitle: 'Duel de produits',
          introText: 'Compare deux multiplications sans tout recompter un par un.',
          question: 'Quel symbole convient ?',
          visual: {
            kind: 'scale',
            leftExpr: `${r} × ${c}`,
            rightExpr: String(p1 - 2),
          },
          choices: ['<', '=', '>'],
          correctAnswer: '>',
          simpleExplanation: `${r} × ${c} = ${p1}, ce qui est strictement plus grand que ${p1 - 2}.`,
          visualHint: `Calcule ${r} × ${c} puis compare avec ${p1 - 2}.`,
        },
        {
          id: 'ch3-n2-apply',
          phase: 'application',
          phaseLabel: 'Application',
          type: 'match',
          topic: 'multiplication',
          introTitle: 'Relie chaque grille à son produit',
          introText: 'Associe chaque multiplication à gauche à son résultat exact.',
          question: 'Trouve les 3 paires :',
          pairs: [
            { id: 'x1', left: `${r} × ${c}`, right: String(p1) },
            { id: 'x2', left: `${r + 1} × ${c}`, right: String(p2) },
            { id: 'x3', left: `${r} × ${c + 1}`, right: String(p3) },
          ],
          correctAnswer: 'all-matched',
          simpleExplanation: `Ajouter une ligne ajoute ${c}, ajouter une colonne ajoute ${r} !`,
          visualHint: `Utilise le premier résultat pour trouver les suivants facilement.`,
        },
      ];
    }

    // =========================================================================
    // CHAPITRE 4 : PARTAGE & DIVISION
    // =========================================================================
    case 'ch4-n1': {
      const baskets = s.divBaskets;
      const perBasket = s.divPerBasket;
      const total = baskets * perBasket;

      return [
        {
          id: 'ch4-n1-discover',
          phase: 'decouverte',
          phaseLabel: 'Découverte & Observation',
          type: 'discover-stepper',
          topic: 'division',
          introTitle: 'Partager sans faire de jaloux',
          introText: 'Diviser, c’est distribuer un total en parts parfaitement égales.',
          question: 'Regarde comment les cookies sont répartis.',
          slides: [
            {
              caption: `Nous avons ${total} cookies à partager équitablement entre ${baskets} paniers.`,
              highlightFormula: `${total} ÷ ${baskets} = ?`,
              visual: {
                kind: 'objects',
                groups: [{ emoji: '🍪', count: total }],
              },
            },
            {
              caption: `En donnant un cookie à chaque panier tour à tour, chacun en reçoit ${perBasket} !`,
              highlightFormula: `${total} ÷ ${baskets} = ${perBasket}`,
              visual: {
                kind: 'groups',
                groups: Array.from({ length: baskets }, (_, i) => ({
                  emoji: '🍪',
                  count: perBasket,
                  label: `Panier ${i + 1}`,
                })),
              },
            },
          ],
          correctAnswer: 'observed',
          simpleExplanation: `Partager ${total} objets dans ${baskets} paniers donne ${perBasket} objets par panier.`,
          visualHint: `Chaque panier doit contenir exactement la même quantité.`,
        },
        {
          id: 'ch4-n1-manip',
          phase: 'manipulation',
          phaseLabel: 'Manipulation tactile',
          type: 'manipulate-division',
          topic: 'division',
          introTitle: 'Distribue les cookies !',
          introText: `Touche un panier (ou le bouton distribuer) pour répartir les ${total} cookies équitablement dans les ${baskets} paniers.`,
          question: `Répartis les ${total} cookies à parts égales entre ${baskets} paniers.`,
          manipulation: {
            totalItems: total,
            baskets,
            emoji: '🍪',
          },
          correctAnswer: String(perBasket),
          simpleExplanation: `Magnifique partage ! Chacun des ${baskets} paniers contient exactement ${perBasket} cookies.`,
          visualHint: `Touche chaque panier tour à tour pour y déposer un cookie jusqu’à ce que le plateau soit vide.`,
        },
        {
          id: 'ch4-n1-question',
          phase: 'question',
          phaseLabel: 'Question',
          type: 'qcm',
          topic: 'division',
          introTitle: 'Combien dans chaque équipe ?',
          introText: `${total} joueurs forment ${baskets} équipes de même taille.`,
          question: `Combien vaut ${total} ÷ ${baskets} ?`,
          visual: {
            kind: 'bars',
            topBar: [{ label: `${total} joueurs`, color: 'sky', flex: total }],
            bottomBar: Array.from({ length: baskets }, () => ({
              label: '?',
              color: 'emerald' as const,
              flex: perBasket,
            })),
          },
          choices: [String(Math.max(1, perBasket - 1)), String(perBasket), String(perBasket + 2)],
          correctAnswer: String(perBasket),
          simpleExplanation: `${baskets} × ${perBasket} = ${total}, donc chaque équipe compte ${perBasket} joueurs.`,
          visualHint: `Regarde combien de blocs verts font ${total} au total.`,
        },
        {
          id: 'ch4-n1-apply',
          phase: 'application',
          phaseLabel: 'Application',
          type: 'fill-blank',
          topic: 'division',
          introTitle: 'Complète le partage',
          introText: 'Trouve le quotient exact de la division.',
          question: 'Quel nombre complète l’égalité ?',
          equationTemplate: [`${total} ÷ ${baskets} = `, ''],
          choices: [String(perBasket), String(perBasket + 1), String(baskets), String(perBasket + 3)],
          correctAnswer: String(perBasket),
          simpleExplanation: `${total} divisé par ${baskets} égale ${perBasket}.`,
          visualHint: `Vérifie avec la multiplication : ${baskets} × ? = ${total}.`,
        },
      ];
    }

    case 'ch4-n2': {
      const b1 = s.divBaskets;
      const q1 = s.divPerBasket;
      const t1 = b1 * q1;
      const b2 = b1 + 1;
      const q2 = q1 + 1;
      const t2 = b2 * q2;

      return [
        {
          id: 'ch4-n2-discover',
          phase: 'decouverte',
          phaseLabel: 'Découverte & Observation',
          type: 'discover-stepper',
          topic: 'division',
          introTitle: 'La division et la multiplication sont sœurs',
          introText: 'Si tu connais une multiplication, tu connais déjà deux divisions !',
          question: 'Observe le lien entre les deux opérations.',
          slides: [
            {
              caption: `${b1} rangées de ${q1} font ${t1}.`,
              highlightFormula: `${b1} × ${q1} = ${t1}`,
              visual: { kind: 'grid', rows: b1, cols: q1, dotEmoji: '🟡' },
            },
            {
              caption: `Donc partager ${t1} en ${b1} parts donne forcément ${q1} !`,
              highlightFormula: `${t1} ÷ ${b1} = ${q1}`,
              visual: {
                kind: 'groups',
                groups: Array.from({ length: b1 }, (_, i) => ({
                  emoji: '🟡',
                  count: q1,
                  label: `Part ${i + 1}`,
                })),
              },
            },
          ],
          correctAnswer: 'observed',
          simpleExplanation: `La division est l’opération inverse de la multiplication : ${b1} × ${q1} = ${t1} donc ${t1} ÷ ${b1} = ${q1}.`,
          visualHint: `Pour diviser, cherche dans ta table de multiplication !`,
        },
        {
          id: 'ch4-n2-manip',
          phase: 'manipulation',
          phaseLabel: 'Manipulation tactile',
          type: 'manipulate-division',
          topic: 'division',
          introTitle: 'Vérifie par le partage',
          introText: `Partage ${t2} jetons entre ${b2} paniers pour vérifier que chacun reçoit ${q2}.`,
          question: `Partage ${t2} jetons équitablement dans les ${b2} paniers.`,
          manipulation: {
            totalItems: t2,
            baskets: b2,
            emoji: '🍊',
          },
          correctAnswer: String(q2),
          simpleExplanation: `${t2} ÷ ${b2} = ${q2}, car ${b2} × ${q2} = ${t2} !`,
          visualHint: `Distribue un jeton par panier jusqu’à vider la réserve.`,
        },
        {
          id: 'ch4-n2-question',
          phase: 'question',
          phaseLabel: 'Question',
          type: 'qcm',
          topic: 'division',
          introTitle: 'Utilise la multiplication',
          introText: `Sachant que ${b2} × ${q2} = ${t2}...`,
          question: `Combien vaut ${t2} ÷ ${q2} ?`,
          choices: [String(b2 - 1), String(b2), String(q2 + 2)],
          correctAnswer: String(b2),
          simpleExplanation: `Comme ${b2} × ${q2} = ${t2}, alors ${t2} ÷ ${q2} = ${b2}.`,
          visualHint: `Cherche le facteur manquant : ? × ${q2} = ${t2}.`,
        },
        {
          id: 'ch4-n2-apply',
          phase: 'application',
          phaseLabel: 'Application',
          type: 'match',
          topic: 'division',
          introTitle: 'Partages express',
          introText: 'Relie chaque division à son quotient.',
          question: 'Associe chaque paire :',
          pairs: [
            { id: 'd1', left: `${t1} ÷ ${b1}`, right: String(q1) },
            { id: 'd2', left: `${t2} ÷ ${b2}`, right: String(q2) },
            { id: 'd3', left: isYoung ? '10 ÷ 2' : '24 ÷ 4', right: isYoung ? '5' : '6' },
          ],
          correctAnswer: 'all-matched',
          simpleExplanation: `Tu maîtrises le lien entre multiplication et division !`,
          visualHint: `Multiplie ta réponse par le diviseur pour vérifier instantanément.`,
        },
      ];
    }

    // =========================================================================
    // CHAPITRE 5 : GÉOMÉTRIE & FORMES
    // =========================================================================
    case 'ch5-n1': {
      return [
        {
          id: 'ch5-n1-discover',
          phase: 'decouverte',
          phaseLabel: 'Découverte & Observation',
          type: 'discover-stepper',
          topic: 'geometrie',
          introTitle: 'Observer les sommets et les côtés',
          introText: 'Un polygone est une figure fermée tracée à la règle. On le reconnaît en comptant ses sommets et ses côtés.',
          question: 'Explore ces figures géométriques.',
          slides: [
            {
              caption: 'Le triangle a exactement 3 sommets (les pointes) et 3 côtés.',
              highlightFormula: 'Triangle : 3 côtés · 3 sommets',
              visual: {
                kind: 'geometry',
                geometry: {
                  shape: 'triangle',
                  label: 'Triangle',
                  sides: 3,
                  vertices: 3,
                  rightAngles: 0,
                  highlightMode: 'vertices',
                },
              },
            },
            {
              caption: 'Le carré a 4 sommets, 4 côtés de même longueur et 4 angles droits !',
              highlightFormula: 'Carré : 4 côtés égaux · 4 angles droits',
              visual: {
                kind: 'geometry',
                geometry: {
                  shape: 'carre',
                  label: 'Carré',
                  sides: 4,
                  vertices: 4,
                  rightAngles: 4,
                  highlightMode: 'right-angles',
                },
              },
            },
          ],
          correctAnswer: 'observed',
          simpleExplanation: `Chaque polygone possède autant de sommets que de côtés : 3 pour le triangle, 4 pour le carré et le rectangle.`,
          visualHint: `Repère les points brillants aux coins : ce sont les sommets !`,
        },
        {
          id: 'ch5-n1-manip',
          phase: 'manipulation',
          phaseLabel: 'Manipulation géométrique',
          type: 'manipulate-geometrie',
          topic: 'geometrie',
          introTitle: 'Inspecte les sommets et côtés !',
          introText: 'Touche chaque côté du pentagone ci-dessous pour les compter et activer leur mise en évidence.',
          question: 'Touche tous les côtés du pentagone pour découvrir combien il en possède.',
          manipulation: {
            geometryTask: 'count-sides',
            geometryTarget: {
              shape: 'pentagone',
              label: 'Pentagone',
              sides: 5,
              vertices: 5,
              rightAngles: 0,
            },
          },
          correctAnswer: '5',
          simpleExplanation: `Un pentagone possède exactement 5 côtés et 5 sommets !`,
          visualHint: `Touche chaque segment du contour jusqu’à ce que les 5 côtés soient allumés.`,
        },
        {
          id: 'ch5-n1-question',
          phase: 'question',
          phaseLabel: 'Question de géométrie',
          type: 'qcm',
          topic: 'geometrie',
          introTitle: 'Identifier une figure',
          introText: 'Observe attentivement cette figure fermée.',
          question: 'Combien de sommets possède un rectangle ?',
          visual: {
            kind: 'geometry',
            geometry: {
              shape: 'rectangle',
              label: 'Rectangle',
              sides: 4,
              vertices: 4,
              rightAngles: 4,
              highlightMode: 'vertices',
            },
          },
          choices: ['3', '4', '5'],
          correctAnswer: '4',
          simpleExplanation: `Comme le carré, le rectangle a 4 sommets et 4 côtés (ses côtés opposés sont égaux).`,
          visualHint: `Compte les 4 coins marqués sur la figure.`,
        },
        {
          id: 'ch5-n1-apply',
          phase: 'application',
          phaseLabel: 'Application',
          type: 'match',
          topic: 'geometrie',
          introTitle: 'Carte d’identité des figures',
          introText: 'Relie chaque figure géométrique à son nombre de côtés.',
          question: 'Associe les 3 paires :',
          pairs: [
            { id: 'g1', left: 'Triangle', right: '3 côtés' },
            { id: 'g2', left: 'Carré', right: '4 côtés' },
            { id: 'g3', left: 'Pentagone', right: '5 côtés' },
          ],
          correctAnswer: 'all-matched',
          simpleExplanation: `Tri = 3, Quadrilatère (carré/rectangle) = 4, Penta = 5 !`,
          visualHint: `Pense au mot « tri » (comme tricycle = 3 roues).`,
        },
      ];
    }

    case 'ch5-n2':
    default: {
      return [
        {
          id: 'ch5-n2-discover',
          phase: 'decouverte',
          phaseLabel: 'Découverte & Observation',
          type: 'discover-stepper',
          topic: 'geometrie',
          introTitle: 'Qu’est-ce qu’un angle droit ?',
          introText: 'Un angle droit forme un coin parfait comme le coin d’une feuille ou d’une équerre (90°).',
          question: 'Observe le symbole du petit carré rouge dans les coins.',
          slides: [
            {
              caption: 'Un rectangle possède 4 angles droits parfaits, un à chaque coin.',
              highlightFormula: '4 angles droits (90°)',
              visual: {
                kind: 'geometry',
                geometry: {
                  shape: 'rectangle',
                  label: 'Rectangle',
                  sides: 4,
                  vertices: 4,
                  rightAngles: 4,
                  highlightMode: 'right-angles',
                },
              },
            },
            {
              caption: 'Un triangle rectangle possède exactement 1 angle droit !',
              highlightFormula: '1 angle droit · 3 côtés',
              visual: {
                kind: 'geometry',
                geometry: {
                  shape: 'triangle-rectangle',
                  label: 'Triangle rectangle',
                  sides: 3,
                  vertices: 3,
                  rightAngles: 1,
                  highlightMode: 'right-angles',
                },
              },
            },
          ],
          correctAnswer: 'observed',
          simpleExplanation: `L’angle droit est un coin d’équerre : le carré et le rectangle en ont 4, le triangle rectangle en a 1.`,
          visualHint: `Cherche le coin bien droit qui forme un L parfait.`,
        },
        {
          id: 'ch5-n2-manip',
          phase: 'manipulation',
          phaseLabel: 'Manipulation géométrique',
          type: 'manipulate-geometrie',
          topic: 'geometrie',
          introTitle: 'Place l’équerre sur les angles droits !',
          introText: 'Touche les coins du carré pour marquer tous ses angles droits.',
          question: 'Active les 4 angles droits du carré.',
          manipulation: {
            geometryTask: 'mark-right-angles',
            geometryTarget: {
              shape: 'carre',
              label: 'Carré',
              sides: 4,
              vertices: 4,
              rightAngles: 4,
            },
          },
          correctAnswer: '4',
          simpleExplanation: `Exactement ! Un carré possède 4 angles droits et 4 côtés de même longueur.`,
          visualHint: `Touche chacun des 4 sommets du carré pour placer le marqueur d’angle droit.`,
        },
        {
          id: 'ch5-n2-question',
          phase: 'question',
          phaseLabel: 'Question de géométrie',
          type: 'qcm',
          topic: 'geometrie',
          introTitle: 'Repérer l’angle droit',
          introText: 'Regarde ce triangle rectangle.',
          question: 'Combien d’angles droits possède un triangle rectangle ?',
          visual: {
            kind: 'geometry',
            geometry: {
              shape: 'triangle-rectangle',
              label: 'Triangle rectangle',
              sides: 3,
              vertices: 3,
              rightAngles: 1,
              highlightMode: 'right-angles',
            },
          },
          choices: ['1', '2', '3'],
          correctAnswer: '1',
          simpleExplanation: `Un triangle ne peut avoir au maximum qu’un seul angle droit : c’est le triangle rectangle.`,
          visualHint: `Observe le petit marqueur carré rouge en bas à gauche.`,
        },
        {
          id: 'ch5-n2-apply',
          phase: 'application',
          phaseLabel: 'Application',
          type: 'order',
          topic: 'geometrie',
          introTitle: 'Du moins au plus de côtés',
          introText: 'Classe ces nombres de côtés du plus petit polygone au plus grand.',
          question: 'Range le nombre de côtés du triangle, du carré et du pentagone :',
          orderItems: ['5', '3', '4'],
          orderDirection: 'asc',
          correctAnswer: '3,4,5',
          simpleExplanation: `Triangle (3 côtés) < Carré (4 côtés) < Pentagone (5 côtés).`,
          visualHint: `Place d’abord 3, puis 4, puis 5.`,
        },
      ];
    }
  }
}
