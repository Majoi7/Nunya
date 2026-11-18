import React from 'react';
import { motion } from 'motion/react';
import { Clock, Compass, Layers, Shapes } from 'lucide-react';
import { LottieIcon } from './LottieIcon';
import { MascotController } from './mascot/MascotController';
import {
  ALL_NOTIONS,
  CHAPTERS,
  computeGlobalProgressPercent,
  getNextAvailableNotion,
} from '../utils/gameLogic';
import type { NotionLesson, UserState } from '../types/math';

interface HomeScreenProps {
  userState: UserState;
  onStartNotion: (notion: NotionLesson) => void;
  onOpenPath: () => void;
  onOpenChallenges: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  userState,
  onStartNotion,
  onOpenPath,
  onOpenChallenges,
}) => {
  const globalPercent = computeGlobalProgressPercent(userState.lessonProgress);
  const nextNotion = getNextAvailableNotion(userState.lessonProgress, userState.demoMode);
  const nextChapter = CHAPTERS.find((c) => c.id === nextNotion.chapterId) ?? CHAPTERS[0];
  const dailyPct = Math.min(
    100,
    Math.round((userState.xpToday / Math.max(1, userState.dailyGoalXp)) * 100)
  );

  // Recommended quick activities across distinct domains (Addition, Multiplication, Géométrie)
  const recommendedNotions = ['ch1-n1', 'ch3-n1', 'ch5-n1']
    .map((id) => ALL_NOTIONS.find((n) => n.id === id))
    .filter((n): n is NotionLesson => Boolean(n));

  const topicIcon = (topic: NotionLesson['topic']) => {
    switch (topic) {
      case 'geometrie':
        return <Shapes className="w-5 h-5 text-[#4F46E5]" />;
      case 'multiplication':
        return <Layers className="w-5 h-5 text-[#7C3AED]" />;
      default:
        return <Compass className="w-5 h-5 text-[#16A34A]" />;
    }
  };

  return (
    <div className="px-4 py-4 space-y-5 bg-white">
      {/* Brilliant-style Coach Header + Global Progression */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-[#F7F8FA] border border-[#E5E7EB] p-4 flex items-center gap-3"
      >
        <MascotController
          character="turkey"
          animationState={dailyPct >= 100 ? 'happy' : 'idle'}
          size={84}
          className="shrink-0"
        />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="text-sm font-bold text-[#111827] leading-snug">
            {userState.totalLessonsCompleted === 0
              ? `Bienvenue ${userState.profile.name || 'champion'} ! Commençons ta première découverte.`
              : dailyPct >= 100
              ? `Objectif du jour atteint ! Tu avances vite en ${userState.profile.grade}.`
              : `Bon rythme ${userState.profile.name || 'champion'} ! Continue sur ta lancée.`}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2.5 rounded-full bg-[#E5E7EB] overflow-hidden">
              <div
                style={{ width: `${Math.max(4, globalPercent)}%` }}
                className="h-full rounded-full bg-[#22C55E] transition-all duration-300"
              />
            </div>
            <span className="text-xs font-extrabold text-[#15803D] tabular-nums">
              {globalPercent}%
            </span>
          </div>
        </div>
      </motion.section>

      {/* Leçon à continuer (Primary Brilliant Course Card) */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-display text-base font-bold text-[#111827]">
            À continuer maintenant
          </h2>
          <button
            type="button"
            onClick={onOpenPath}
            className="min-h-[44px] text-xs font-extrabold text-[#4B5563] hover:text-[#111827] cursor-pointer"
          >
            Tout le parcours →
          </button>
        </div>

        <div className="rounded-3xl bg-white border-2 border-[#E5E7EB] p-4 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <div className="text-[11px] font-extrabold uppercase tracking-wide text-[#16A34A]">
                Chapitre {nextChapter.order} · {nextChapter.title}
              </div>
              <h3 className="font-display text-xl font-bold text-[#111827] leading-tight">
                {nextNotion.title}
              </h3>
              <p className="text-xs font-semibold text-[#6B7280] leading-snug">
                {nextNotion.subtitle}
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-[#F7F8FA] border border-[#E5E7EB] flex items-center justify-center shrink-0">
              <LottieIcon animation="book" size={24} tone="ink" />
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-bold text-[#6B7280]">
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {nextNotion.durationMin} min
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1 text-[#B45309] tabular-nums">
              <LottieIcon animation="xp" size={16} tone="xp" /> +{nextNotion.xpReward} XP
            </span>
          </div>

          <button
            type="button"
            onClick={() => onStartNotion(nextNotion)}
            className="w-full min-h-[48px] rounded-full bg-[#111827] hover:bg-[#1F2937] text-white font-display text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>Démarrer la leçon</span>
            <LottieIcon animation="arrowRight" size={18} tone="inverse" />
          </button>
        </div>
      </section>

      {/* Objectif quotidien */}
      <button
        type="button"
        onClick={onOpenChallenges}
        className="w-full rounded-2xl bg-[#F7F8FA] border border-[#E5E7EB] p-3.5 flex items-center gap-3 text-left hover:border-[#D1D5DB] transition-colors cursor-pointer"
      >
        <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#15803D] flex items-center justify-center shrink-0">
          <LottieIcon animation="target" size={24} tone="success" trigger="manual" replayKey={dailyPct} />
        </div>
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-display text-sm font-bold text-[#111827]">
              Objectif du jour
            </span>
            <span className="text-xs font-extrabold text-[#15803D] tabular-nums">
              {userState.xpToday} / {userState.dailyGoalXp} XP
            </span>
          </div>
          <div className="h-2 rounded-full bg-[#E5E7EB] overflow-hidden">
            <div
              style={{ width: `${dailyPct}%` }}
              className="h-full rounded-full bg-[#22C55E] transition-all duration-300"
            />
          </div>
        </div>
      </button>

      {/* Activités recommandées */}
      <section className="space-y-2.5 pb-2">
        <h2 className="font-display text-base font-bold text-[#111827] px-1">
          Activités recommandées
        </h2>
        <div className="space-y-2.5">
          {recommendedNotions.map((notion) => {
            const done = Boolean(userState.lessonProgress[notion.id]?.completed);
            return (
              <button
                key={notion.id}
                type="button"
                onClick={() => onStartNotion(notion)}
                className="w-full rounded-2xl bg-white border border-[#E5E7EB] hover:border-[#111827] p-3.5 flex items-center gap-3 text-left transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-[#F7F8FA] border border-[#E5E7EB] flex items-center justify-center shrink-0">
                  {topicIcon(notion.topic)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display text-sm font-bold text-[#111827] truncate">
                    {notion.title}
                  </div>
                  <div className="text-xs font-semibold text-[#6B7280] truncate">
                    {notion.subtitle}
                  </div>
                </div>
                <span
                  className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full shrink-0 ${
                    done
                      ? 'bg-[#DCFCE7] text-[#15803D]'
                      : 'bg-[#F3F4F6] text-[#111827]'
                  }`}
                >
                  {done ? 'Maîtrisé' : 'Explorer'}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};
