import type { Exercise, GradeLevel, TutorResponse } from '../types/math';

export function buildOfflineTutorResponse(
  exercise: Exercise,
  userAnswer: string,
  gradeLevel: GradeLevel
): TutorResponse {
  const isYounger = gradeLevel === 'CP' || gradeLevel === 'CE1';

  switch (exercise.topic) {
    case 'addition': {
      return {
        source: 'offline',
        explanation: isYounger
          ? `Additionner, c’est mettre deux paquets ensemble sur la même ligne ! En réunissant les deux parties, on obtient ${exercise.correctAnswer}.`
          : `Imagine deux barres posées bout à bout : leur longueur totale vaut exactement ${exercise.correctAnswer}.`,
        visualStep:
          exercise.visualHint ||
          `Pars du plus grand nombre, puis ajoute le second paquet par petits sauts.`,
        practicePrompt: isYounger
          ? 'Si tu réunis 2 jetons et 3 jetons, combien en as-tu ?'
          : 'Combien font 15 + 5 ?',
        practiceChoices: isYounger ? ['4', '5', '6'] : ['18', '20', '25'],
        practiceAnswer: isYounger ? '5' : '20',
      };
    }
    case 'soustraction': {
      return {
        source: 'offline',
        explanation: `Soustraire, c’est retirer une partie ou mesurer l’écart entre deux barres. Ici, la réponse est ${exercise.correctAnswer} !`,
        visualStep:
          exercise.visualHint ||
          `Visualise le groupe de départ, retire la partie connue, et compte ce qu’il reste.`,
        practicePrompt: isYounger
          ? 'Tu as 6 fraises et tu en retires 2. Combien en reste-t-il ?'
          : 'Quel est l’écart entre 20 et 6 ?',
        practiceChoices: isYounger ? ['3', '4', '5'] : ['12', '14', '16'],
        practiceAnswer: isYounger ? '4' : '14',
      };
    }
    case 'multiplication': {
      return {
        source: 'offline',
        explanation: `Multiplier, c’est aligner plusieurs rangées identiques en rectangle ! En comptant toutes les rangées, on obtient ${exercise.correctAnswer}.`,
        visualStep:
          exercise.visualHint ||
          `Trace des lignes régulières : chaque ligne contient exactement le même nombre d’éléments.`,
        practicePrompt: isYounger
          ? '2 rangées de 3 étoiles, ça fait combien d’étoiles ?'
          : 'Combien font 4 × 5 ?',
        practiceChoices: isYounger ? ['5', '6', '7'] : ['15', '20', '25'],
        practiceAnswer: isYounger ? '6' : '20',
      };
    }
    case 'division': {
      return {
        source: 'offline',
        explanation: `Diviser, c’est partager un ensemble en parts exactement égales. Chaque part reçoit ${exercise.correctAnswer} !`,
        visualStep:
          exercise.visualHint ||
          `Distribue un objet dans chaque panier tour à tour, ou pense à la multiplication inverse.`,
        practicePrompt: isYounger
          ? 'Partage 6 cookies dans 2 paniers égaux. Combien par panier ?'
          : 'Partage 24 cartes entre 4 joueurs. Combien chacun reçoit-il ?',
        practiceChoices: isYounger ? ['2', '3', '4'] : ['5', '6', '8'],
        practiceAnswer: isYounger ? '3' : '6',
      };
    }
    case 'geometrie':
    default: {
      return {
        source: 'offline',
        explanation: `En géométrie, on observe toujours les sommets (les coins), les côtés (les segments) et les angles droits (coins d’équerre). Ici la bonne réponse est ${exercise.correctAnswer} (tu avais essayé « ${userAnswer || '?'} »).`,
        visualStep:
          exercise.visualHint ||
          `Suis le contour de la figure avec ton doigt et repère chaque coin bien droit à 90°.`,
        practicePrompt: 'Combien de côtés possède un triangle ?',
        practiceChoices: ['3', '4', '5'],
        practiceAnswer: '3',
      };
    }
  }
}

export async function requestTutorExplanation(params: {
  exercise: Exercise;
  userAnswer: string;
  gradeLevel: GradeLevel;
  geminiAvailable: boolean;
}): Promise<TutorResponse> {
  const { exercise, userAnswer, gradeLevel, geminiAvailable } = params;

  if (!geminiAvailable) {
    return buildOfflineTutorResponse(exercise, userAnswer, gradeLevel);
  }

  try {
    const res = await fetch('/api/tutor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionPrompt: exercise.question,
        visualHint: exercise.visualHint,
        userAnswer,
        correctAnswer: exercise.correctAnswer,
        gradeLevel,
        topic: exercise.topic,
      }),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    if (data.source === 'gemini' && data.explanation && Array.isArray(data.practiceChoices)) {
      return data as TutorResponse;
    }

    return buildOfflineTutorResponse(exercise, userAnswer, gradeLevel);
  } catch {
    return buildOfflineTutorResponse(exercise, userAnswer, gradeLevel);
  }
}
