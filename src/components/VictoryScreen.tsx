import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Award, Eye, Star } from 'lucide-react';
import { LottieIcon } from './LottieIcon';
import { MascotController } from './mascot/MascotController';
import { BADGE_DEFINITIONS } from '../data/rewards';
import { playSound } from '../utils/sound';
import type { MistakeRecord, NotionLesson } from '../types/math';

interface VictoryScreenProps {
  notion: NotionLesson;
  nextNotion: NotionLesson | null;
  correctCount: number;
  totalQuestions: number;
  earnedStars: number;
  earnedXp: number;
  accuracy: number;
  globalPercent: number;
  newlyEarnedBadges: string[];
  mistakes: MistakeRecord[];
  soundEnabled: boolean;
  onContinue: () => void;
  onStartNextNotion: (notion: NotionLesson) => void;
  onReviewMistakes: () => void;
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({
  notion,
  nextNotion,
  correctCount,
  totalQuestions,
  earnedStars,
  earnedXp,
  accuracy,
  globalPercent,
  newlyEarnedBadges,
  mistakes,
  soundEnabled,
  onContinue,
  onStartNextNotion,
  onReviewMistakes,
}) => {
  useEffect(() => {
    playSound('victory', soundEnabled);
    try {
      confetti({
        particleCount: 55,
        spread: 60,
        origin: { y: 0.55 },
        colors: ['#22C55E', '#FACC15', '#111827', '#3B82F6'],
        disableForReducedMotion: true,
      });
    } catch {
      // Ignore canvas-confetti errors in headless environments
    }
  }, [soundEnabled]);

  const unlockedBadges = BADGE_DEFINITIONS.filter((b) => newlyEarnedBadges.includes(b.id));

  return (
    <div className="flex flex-col justify-between h-full px-6 py-6 bg-white overflow-y-auto no-scrollbar">
      <div className="flex flex-col items-center text-center space-y-4 my-auto">
        <MascotController character="turkey" animationState="celebrating" size={140} />

        {/* 3 Stars */}
        <div role="img" aria-label={`${earnedStars} étoiles sur 3`} className="flex items-center justify-center gap-2.5">
          {[1, 2, 3].map((starIdx) => {
            const lit = starIdx <= earnedStars;
            return (
              <motion.div
                key={starIdx}
                initial={{ scale: 0.5, rotate: -12 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.04 * starIdx, duration: 0.18, type: 'spring', stiffness: 320, damping: 20 }}
              >
                <LottieIcon
                  animation="star"
                  size={36}
                  tone={lit ? 'xp' : 'muted'}
                  play={lit}
                  trigger="mount"
                  fallback={<Star className={`w-9 h-9 ${lit ? 'text-[#FACC15] fill-[#FACC15]' : 'text-[#E5E7EB] fill-[#E5E7EB]'}`} />}
                />
              </motion.div>
            );
          })}
        </div>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#15803D] bg-[#DCFCE7] px-3 py-1 rounded-full">
            <LottieIcon animation="success" size={18} tone="success" trigger="mount" />
            <span>Notion maîtrisée</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[#111827] pt-1">
            {notion.title}
          </h1>
          <p className="text-xs font-semibold text-[#6B7280]">
            Progression globale : {globalPercent}% du parcours
          </p>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-3 gap-2.5 w-full pt-1">
          <div className="rounded-2xl bg-[#F7F8FA] border border-[#E5E7EB] p-3">
            <div className="font-display text-xl font-bold text-[#111827] tabular-nums">
              {correctCount}/{totalQuestions}
            </div>
            <div className="text-[11px] font-bold text-[#6B7280]">Réussites</div>
          </div>
          <div className="rounded-2xl bg-[#DCFCE7] border border-[#86EFAC] p-3">
            <div className="font-display text-xl font-bold text-[#15803D] tabular-nums inline-flex items-center gap-1">
              <LottieIcon animation="xp" size={20} tone="xp" trigger="mount" />+{earnedXp}
            </div>
            <div className="text-[11px] font-bold text-[#14532D]">XP gagnés</div>
          </div>
          <div className="rounded-2xl bg-[#F7F8FA] border border-[#E5E7EB] p-3">
            <div className="font-display text-xl font-bold text-[#111827] tabular-nums">
              {accuracy}%
            </div>
            <div className="text-[11px] font-bold text-[#6B7280]">Précision</div>
          </div>
        </div>

        {/* Newly Unlocked Badges */}
        {unlockedBadges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.16, delay: 0.05 }}
            className="w-full rounded-2xl bg-[#F7F8FA] border border-[#E5E7EB] p-3 space-y-2 text-left"
          >
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#111827]">
              <LottieIcon animation="star" size={20} tone="xp" trigger="mount" fallback={<Award className="w-4 h-4 text-[#EAB308]" />} />
              <span>Nouveau badge obtenu</span>
            </div>
            {unlockedBadges.map((b) => (
              <div key={b.id} className="flex items-center gap-2.5 bg-white rounded-xl p-2 border border-[#E5E7EB]">
                <span className="text-xl">{b.emoji}</span>
                <div>
                  <div className="font-display text-sm font-bold text-[#111827]">{b.name}</div>
                  <div className="text-[11px] font-semibold text-[#6B7280]">{b.description}</div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Next Recommended Notion */}
        {nextNotion && nextNotion.id !== notion.id && (
          <div className="w-full rounded-2xl bg-[#F7F8FA] border border-[#E5E7EB] p-3.5 flex items-center justify-between gap-3 text-left">
            <div className="min-w-0">
              <div className="text-[11px] font-extrabold uppercase tracking-wide text-[#16A34A]">
                Prochaine étape
              </div>
              <div className="font-display text-sm font-bold text-[#111827] truncate">
                {nextNotion.title}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onStartNextNotion(nextNotion)}
              className="min-h-[44px] px-3.5 py-2 rounded-full bg-[#111827] text-white font-display text-xs font-bold inline-flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>Lancer</span>
              <LottieIcon animation="arrowRight" size={18} tone="inverse" />
            </button>
          </div>
        )}
      </div>

      {/* Bottom Buttons */}
      <div className="space-y-2.5 pt-4 pb-safe">
        {mistakes.length > 0 && (
          <button
            type="button"
            onClick={onReviewMistakes}
            className="w-full min-h-[46px] rounded-full bg-[#F7F8FA] border border-[#E5E7EB] text-[#111827] font-display text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#E5E7EB] cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>Revoir mes erreurs ({mistakes.length})</span>
          </button>
        )}
        <button
          type="button"
          onClick={onContinue}
          className="w-full min-h-[50px] rounded-full bg-[#22C55E] hover:bg-[#16A34A] text-white font-display text-base font-bold transition-colors cursor-pointer"
        >
          Continuer
        </button>
      </div>
    </div>
  );
};

interface ErrorReviewScreenProps {
  mistakes: MistakeRecord[];
  onBack: () => void;
}

export const ErrorReviewScreen: React.FC<ErrorReviewScreenProps> = ({ mistakes, onBack }) => {
  return (
    <div className="flex flex-col h-full bg-white">
      <header className="px-4 pt-safe pb-3 border-b border-[#E5E7EB] flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Retour"
          className="w-11 h-11 rounded-full bg-[#F7F8FA] flex items-center justify-center text-[#111827] cursor-pointer"
        >
          <LottieIcon animation="arrowLeft" size={22} tone="ink" />
        </button>
        <h1 className="font-display text-xl font-bold text-[#111827]">Erreurs à revoir</h1>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3">
        {mistakes.map((m, idx) => (
          <div key={idx} className="rounded-2xl border border-[#E5E7EB] bg-[#F7F8FA] p-4 space-y-2">
            <div className="font-display text-base font-bold text-[#111827]">
              {m.exercise.question}
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-bold">
              <span className="bg-[#FEE2E2] text-[#991B1B] px-2.5 py-1 rounded-full">
                Ta réponse : {m.userAnswer}
              </span>
              <span className="bg-[#DCFCE7] text-[#14532D] px-2.5 py-1 rounded-full">
                Attendu : {m.exercise.correctAnswer}
              </span>
            </div>
            <p className="text-sm font-semibold text-[#374151] leading-snug">
              {m.exercise.simpleExplanation}
            </p>
          </div>
        ))}
      </div>

      <div className="p-4 pb-safe border-t border-[#E5E7EB]">
        <button
          type="button"
          onClick={onBack}
          className="w-full min-h-[48px] rounded-full bg-[#111827] text-white font-display font-bold cursor-pointer"
        >
          Retour au parcours
        </button>
      </div>
    </div>
  );
};
