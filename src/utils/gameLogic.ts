import type {
  Chapter,
  DailyChallenge,
  LessonProgress,
  MathTopic,
  NotionLesson,
  UserState,
} from '../types/math';

export const STORAGE_KEY = 'lumimath_brilliant_v2';

export const CHAPTERS: Chapter[] = [
  {
    id: 'chap-1',
    order: 1,
    title: 'Addition & Assemblage',
    description: 'Réunir des quantités et visualiser la somme',
    topic: 'addition',
    accentColor: 'emerald',
    notions: [
      {
        id: 'ch1-n1',
        chapterId: 'chap-1',
        orderInChapter: 1,
        title: 'Réunir deux groupes',
        subtitle: 'Découvrir l’addition en manipulant des objets',
        topic: 'addition',
        durationMin: 3,
        xpReward: 45,
      },
      {
        id: 'ch1-n2',
        chapterId: 'chap-1',
        orderInChapter: 2,
        title: 'Compléter un total',
        subtitle: 'Trouver la partie manquante avec les barres',
        topic: 'addition',
        durationMin: 3,
        xpReward: 55,
        requiresNotionId: 'ch1-n1',
      },
    ],
  },
  {
    id: 'chap-2',
    order: 2,
    title: 'Soustraction & Écart',
    description: 'Retirer des éléments et mesurer la différence',
    topic: 'soustraction',
    accentColor: 'amber',
    notions: [
      {
        id: 'ch2-n1',
        chapterId: 'chap-2',
        orderInChapter: 1,
        title: 'Retirer pour observer',
        subtitle: 'Comprendre ce qu’il reste après un retrait',
        topic: 'soustraction',
        durationMin: 3,
        xpReward: 45,
      },
      {
        id: 'ch2-n2',
        chapterId: 'chap-2',
        orderInChapter: 2,
        title: 'Trouver la différence',
        subtitle: 'Comparer deux grandeurs et équilibrer l’écart',
        topic: 'soustraction',
        durationMin: 4,
        xpReward: 55,
        requiresNotionId: 'ch2-n1',
      },
    ],
  },
  {
    id: 'chap-3',
    order: 3,
    title: 'Multiplication en Grilles',
    description: 'Construire des rangées régulières et des paquets égaux',
    topic: 'multiplication',
    accentColor: 'violet',
    notions: [
      {
        id: 'ch3-n1',
        chapterId: 'chap-3',
        orderInChapter: 1,
        title: 'Lignes et colonnes',
        subtitle: 'Construire un rectangle de points pour multiplier',
        topic: 'multiplication',
        durationMin: 3,
        xpReward: 50,
      },
      {
        id: 'ch3-n2',
        chapterId: 'chap-3',
        orderInChapter: 2,
        title: 'Facteurs et produits',
        subtitle: 'Retrouver un facteur manquant rapidement',
        topic: 'multiplication',
        durationMin: 4,
        xpReward: 60,
        requiresNotionId: 'ch3-n1',
      },
    ],
  },
  {
    id: 'chap-4',
    order: 4,
    title: 'Partage & Division',
    description: 'Distribuer équitablement en parts identiques',
    topic: 'division',
    accentColor: 'sky',
    notions: [
      {
        id: 'ch4-n1',
        chapterId: 'chap-4',
        orderInChapter: 1,
        title: 'Partage équitable',
        subtitle: 'Répartir des jetons dans des paniers égaux',
        topic: 'division',
        durationMin: 3,
        xpReward: 50,
      },
      {
        id: 'ch4-n2',
        chapterId: 'chap-4',
        orderInChapter: 2,
        title: 'Lien × et ÷',
        subtitle: 'Utiliser la multiplication pour vérifier un partage',
        topic: 'division',
        durationMin: 4,
        xpReward: 60,
        requiresNotionId: 'ch4-n1',
      },
    ],
  },
  {
    id: 'chap-5',
    order: 5,
    title: 'Découverte de la Géométrie',
    description: 'Manipuler les figures, compter les sommets et repérer les angles droits',
    topic: 'geometrie',
    accentColor: 'indigo',
    notions: [
      {
        id: 'ch5-n1',
        chapterId: 'chap-5',
        orderInChapter: 1,
        title: 'Polygones & Sommets',
        subtitle: 'Explorer triangles, carrés, rectangles et côtés',
        topic: 'geometrie',
        durationMin: 3,
        xpReward: 50,
      },
      {
        id: 'ch5-n2',
        chapterId: 'chap-5',
        orderInChapter: 2,
        title: 'Angles droits & Propriétés',
        subtitle: 'Repérer les angles droits et classer les figures',
        topic: 'geometrie',
        durationMin: 4,
        xpReward: 65,
        requiresNotionId: 'ch5-n1',
      },
    ],
  },
];

export const ALL_NOTIONS: NotionLesson[] = CHAPTERS.flatMap((c) => c.notions);

export const DAILY_CHALLENGES: DailyChallenge[] = [
  {
    id: 'challenge-1',
    title: 'Esprit vif',
    description: 'Réussis 4 étapes interactives aujourd’hui',
    target: 4,
    xpReward: 25,
    metric: 'correctToday',
  },
  {
    id: 'challenge-2',
    title: 'Notion du jour',
    description: 'Termine 1 leçon complète en 7 étapes',
    target: 1,
    xpReward: 40,
    metric: 'lessonsToday',
  },
  {
    id: 'challenge-3',
    title: 'Maîtrise totale',
    description: 'Obtiens 100 % de précision sur une notion',
    target: 1,
    xpReward: 60,
    metric: 'perfectLesson',
  },
];

export function getTodayKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function createInitialUserState(today = getTodayKey()): UserState {
  return {
    hasOnboarded: false,
    demoMode: false,
    profile: {
      name: '',
      grade: 'CE2',
    },
    xp: 0,
    dailyGoalXp: 60,
    xpToday: 0,
    streak: 1,
    lastActiveDate: today,
    totalLessonsCompleted: 0,
    totalCorrectAnswers: 0,
    totalAnswered: 0,
    lessonsToday: 0,
    correctToday: 0,
    hasPerfectLessonToday: false,
    claimedChallenges: [],
    earnedBadges: ['badge-debutant'],
    soundEnabled: true,
    lessonProgress: {},
    topicStats: {
      addition: { correct: 0, total: 0 },
      soustraction: { correct: 0, total: 0 },
      multiplication: { correct: 0, total: 0 },
      division: { correct: 0, total: 0 },
      geometrie: { correct: 0, total: 0 },
    },
  };
}

export function calculateStars(correctCount: number, totalQuestions: number): number {
  if (totalQuestions <= 0) return 0;
  const ratio = correctCount / totalQuestions;
  if (ratio >= 0.9) return 3;
  if (ratio >= 0.65) return 2;
  if (ratio > 0) return 1;
  return 0;
}

export function calculateAccuracy(correctCount: number, totalQuestions: number): number {
  if (totalQuestions <= 0) return 0;
  return Math.round((correctCount / totalQuestions) * 100);
}

export type NotionStatus = 'completed' | 'available' | 'locked';

export function getNotionStatus(
  notion: NotionLesson,
  progress: Record<string, LessonProgress>,
  demoMode = false
): NotionStatus {
  if (progress[notion.id]?.completed) return 'completed';
  if (demoMode || !notion.requiresNotionId) return 'available';
  return progress[notion.requiresNotionId]?.completed ? 'available' : 'locked';
}

export function computeGlobalProgressPercent(progress: Record<string, LessonProgress>): number {
  const completedCount = ALL_NOTIONS.filter((n) => progress[n.id]?.completed).length;
  return Math.round((completedCount / ALL_NOTIONS.length) * 100);
}

export function getNextAvailableNotion(
  progress: Record<string, LessonProgress>,
  demoMode = false
): NotionLesson {
  for (const notion of ALL_NOTIONS) {
    const status = getNotionStatus(notion, progress, demoMode);
    if (status === 'available') return notion;
  }
  return ALL_NOTIONS[0];
}

export function applyLessonCompletion(
  prev: UserState,
  params: {
    notionId: string;
    topic: MathTopic;
    correctCount: number;
    totalQuestions: number;
    xpPerCorrect: number;
    completionBonusXp: number;
  }
): {
  nextState: UserState;
  earnedStars: number;
  earnedXp: number;
  accuracy: number;
  newlyEarnedBadges: string[];
} {
  const { notionId, topic, correctCount, totalQuestions, xpPerCorrect, completionBonusXp } = params;
  const accuracy = calculateAccuracy(correctCount, totalQuestions);
  const earnedStars = calculateStars(correctCount, totalQuestions);
  const isFirstCompletion = !prev.lessonProgress[notionId]?.completed;
  const earnedXp =
    correctCount * xpPerCorrect + (isFirstCompletion ? completionBonusXp : Math.round(completionBonusXp / 2));

  const prevNotion = prev.lessonProgress[notionId];
  const updatedProgress: Record<string, LessonProgress> = {
    ...prev.lessonProgress,
    [notionId]: {
      completed: true,
      stars: Math.max(prevNotion?.stars ?? 0, earnedStars),
      bestAccuracy: Math.max(prevNotion?.bestAccuracy ?? 0, accuracy),
      attempts: (prevNotion?.attempts ?? 0) + 1,
    },
  };

  const prevTopicStat = prev.topicStats[topic] ?? { correct: 0, total: 0 };
  const totalLessonsCompleted = prev.totalLessonsCompleted + 1;
  const totalCorrectAnswers = prev.totalCorrectAnswers + correctCount;
  const totalAnswered = prev.totalAnswered + totalQuestions;
  const hasPerfect = prev.hasPerfectLessonToday || accuracy === 100;

  const badgeSet = new Set(prev.earnedBadges);
  const newlyEarnedBadges: string[] = [];
  const grantBadge = (id: string) => {
    if (!badgeSet.has(id)) {
      badgeSet.add(id);
      newlyEarnedBadges.push(id);
    }
  };

  if (totalLessonsCompleted >= 1) grantBadge('badge-premiere-lecon');
  if (accuracy === 100) grantBadge('badge-sans-faute');
  if (topic === 'geometrie') grantBadge('badge-geometre');
  const completedNotionsCount = ALL_NOTIONS.filter((n) => updatedProgress[n.id]?.completed).length;
  if (completedNotionsCount >= 5) grantBadge('badge-explorateur');

  return {
    earnedStars,
    earnedXp,
    accuracy,
    newlyEarnedBadges,
    nextState: {
      ...prev,
      xp: prev.xp + earnedXp,
      xpToday: prev.xpToday + earnedXp,
      totalLessonsCompleted,
      totalCorrectAnswers,
      totalAnswered,
      lessonsToday: prev.lessonsToday + 1,
      correctToday: prev.correctToday + correctCount,
      hasPerfectLessonToday: hasPerfect,
      earnedBadges: Array.from(badgeSet),
      lessonProgress: updatedProgress,
      topicStats: {
        ...prev.topicStats,
        [topic]: {
          correct: prevTopicStat.correct + correctCount,
          total: prevTopicStat.total + totalQuestions,
        },
      },
    },
  };
}

export function getChallengeProgressValue(state: UserState, challenge: DailyChallenge): number {
  switch (challenge.metric) {
    case 'correctToday':
      return Math.min(state.correctToday, challenge.target);
    case 'lessonsToday':
      return Math.min(state.lessonsToday, challenge.target);
    case 'perfectLesson':
      return state.hasPerfectLessonToday ? 1 : 0;
  }
}

export function claimChallengeReward(state: UserState, challenge: DailyChallenge): UserState {
  if (state.claimedChallenges.includes(challenge.id)) return state;
  const progress = getChallengeProgressValue(state, challenge);
  if (progress < challenge.target) return state;
  return {
    ...state,
    xp: state.xp + challenge.xpReward,
    xpToday: state.xpToday + challenge.xpReward,
    claimedChallenges: [...state.claimedChallenges, challenge.id],
  };
}

export function syncDailyRollover(state: UserState, today = getTodayKey()): UserState {
  if (state.lastActiveDate === today) return state;
  const prevDate = new Date(state.lastActiveDate + 'T00:00:00');
  const currDate = new Date(today + 'T00:00:00');
  const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
  return {
    ...state,
    lastActiveDate: today,
    streak: diffDays === 1 ? state.streak + 1 : 1,
    xpToday: 0,
    lessonsToday: 0,
    correctToday: 0,
    hasPerfectLessonToday: false,
    claimedChallenges: [],
  };
}
