import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ALL_NOTIONS,
  CHAPTERS,
  DAILY_CHALLENGES,
  applyLessonCompletion,
  calculateAccuracy,
  calculateStars,
  claimChallengeReward,
  computeGlobalProgressPercent,
  createInitialUserState,
  getNotionStatus,
  syncDailyRollover,
} from './gameLogic';
import { getExercisesForNotion } from '../data/curriculum';
import { buildOfflineTutorResponse } from './tutorEngine';
import type { GradeLevel } from '../types/math';

test('calculateStars and calculateAccuracy compute expected values', () => {
  assert.equal(calculateAccuracy(3, 3), 100);
  assert.equal(calculateAccuracy(2, 3), 67);
  assert.equal(calculateStars(3, 3), 3);
  assert.equal(calculateStars(2, 3), 2);
  assert.equal(calculateStars(1, 3), 1);
  assert.equal(calculateStars(0, 3), 0);
});

test('chapters and notions unlock progressively and support demo mode', () => {
  assert.equal(CHAPTERS.length, 5);
  assert.equal(ALL_NOTIONS.length, 10);

  const initial = createInitialUserState('2026-11-17');
  const firstNotion = CHAPTERS[0].notions[0];
  const secondNotion = CHAPTERS[0].notions[1];

  assert.equal(getNotionStatus(firstNotion, initial.lessonProgress, false), 'available');
  assert.equal(getNotionStatus(secondNotion, initial.lessonProgress, false), 'locked');
  assert.equal(getNotionStatus(secondNotion, initial.lessonProgress, true), 'available');
  assert.equal(computeGlobalProgressPercent(initial.lessonProgress), 0);

  const { nextState, earnedStars, earnedXp } = applyLessonCompletion(initial, {
    notionId: firstNotion.id,
    topic: firstNotion.topic,
    correctCount: 3,
    totalQuestions: 3,
    xpPerCorrect: 15,
    completionBonusXp: firstNotion.xpReward,
  });

  assert.equal(earnedStars, 3);
  assert.equal(earnedXp, 45 + firstNotion.xpReward);
  assert.equal(getNotionStatus(firstNotion, nextState.lessonProgress, false), 'completed');
  assert.equal(getNotionStatus(secondNotion, nextState.lessonProgress, false), 'available');
  assert.ok(nextState.earnedBadges.includes('badge-premiere-lecon'));
  assert.ok(nextState.earnedBadges.includes('badge-sans-faute'));
});

test('daily challenge claims grant XP safely without double-claiming', () => {
  let state = createInitialUserState('2026-11-17');
  state = applyLessonCompletion(state, {
    notionId: 'ch5-n1',
    topic: 'geometrie',
    correctCount: 3,
    totalQuestions: 3,
    xpPerCorrect: 15,
    completionBonusXp: 50,
  }).nextState;

  assert.ok(state.earnedBadges.includes('badge-geometre'));

  const lessonChallenge = DAILY_CHALLENGES.find((c) => c.id === 'challenge-2')!;
  const afterClaim = claimChallengeReward(state, lessonChallenge);
  assert.equal(afterClaim.xp, state.xp + lessonChallenge.xpReward);
  assert.equal(claimChallengeReward(afterClaim, lessonChallenge).xp, afterClaim.xp);
});

test('daily rollover increments streak on consecutive day and resets daily XP counters', () => {
  const initial = createInitialUserState('2026-11-17');
  const played = {
    ...initial,
    xpToday: 60,
    lessonsToday: 2,
    correctToday: 6,
    hasPerfectLessonToday: true,
  };
  const nextDay = syncDailyRollover(played, '2026-11-18');
  assert.equal(nextDay.streak, 2);
  assert.equal(nextDay.xpToday, 0);
  assert.equal(nextDay.lessonsToday, 0);
  assert.equal(nextDay.correctToday, 0);
  assert.equal(nextDay.hasPerfectLessonToday, false);
});

test('curriculum generates valid 7-step exercises for all 10 notions and 6 grade levels', () => {
  const grades: GradeLevel[] = ['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6e'];
  for (const grade of grades) {
    for (const notion of ALL_NOTIONS) {
      const exercises = getExercisesForNotion(notion.id, grade);
      assert.equal(exercises.length, 4, `${notion.id} (${grade}) should have 4 exercises`);
      assert.equal(exercises[0].type, 'discover-stepper');
      assert.ok(exercises[1].type.startsWith('manipulate-'));
      for (const ex of exercises) {
        assert.ok(ex.question.length > 0);
        assert.ok(ex.correctAnswer.length > 0);
        assert.ok(ex.simpleExplanation.length > 0);
        const tutor = buildOfflineTutorResponse(ex, '0', grade);
        assert.equal(tutor.source, 'offline');
        assert.equal(tutor.practiceChoices.length, 3);
        assert.ok(tutor.practiceChoices.includes(tutor.practiceAnswer));
      }
    }
  }
});
