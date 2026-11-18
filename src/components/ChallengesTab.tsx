import React from 'react';
import { motion } from 'motion/react';
import { LottieIcon } from './LottieIcon';
import {
  DAILY_CHALLENGES,
  getChallengeProgressValue,
  getNextAvailableNotion,
} from '../utils/gameLogic';
import type { DailyChallenge, NotionLesson, UserState } from '../types/math';

interface ChallengesTabProps {
  userState: UserState;
  onClaimChallenge: (challenge: DailyChallenge) => void;
  onStartNotion: (notion: NotionLesson) => void;
}

export const ChallengesTab: React.FC<ChallengesTabProps> = ({
  userState,
  onClaimChallenge,
  onStartNotion,
}) => {
  const nextNotion = getNextAvailableNotion(userState.lessonProgress, userState.demoMode);

  return (
    <div className="px-4 py-4 space-y-5 bg-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#111827]">Défis du jour</h1>
          <p className="text-xs font-semibold text-[#6B7280]">
            Complète tes missions pour gagner des XP bonus.
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-[#F7F8FA] border border-[#E5E7EB] rounded-full px-3 py-1.5">
          <LottieIcon animation="streak" size={20} tone="warning" trigger="manual" replayKey={userState.streak} />
          <span className="font-display font-bold text-sm text-[#111827] tabular-nums">
            {userState.streak} j
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {DAILY_CHALLENGES.map((challenge) => {
          const progress = getChallengeProgressValue(userState, challenge);
          const isReady = progress >= challenge.target;
          const isClaimed = userState.claimedChallenges.includes(challenge.id);
          const pct = Math.round((progress / challenge.target) * 100);

          return (
            <motion.div
              key={challenge.id}
              layout
              className={`rounded-3xl p-4 border transition-colors ${
                isClaimed
                  ? 'bg-[#DCFCE7]/50 border-[#86EFAC]'
                  : isReady
                  ? 'bg-[#F7F8FA] border-[#22C55E]'
                  : 'bg-[#F7F8FA] border-[#E5E7EB]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5 flex-1">
                  <div className="font-display text-base font-bold text-[#111827]">
                    {challenge.title}
                  </div>
                  <p className="text-xs font-semibold text-[#4B5563]">{challenge.description}</p>
                </div>
                <span className="font-display text-xs font-extrabold text-[#111827] bg-white border border-[#E5E7EB] px-2.5 py-1 rounded-full tabular-nums inline-flex items-center gap-1 shrink-0">
                  <LottieIcon animation="xp" size={16} tone="xp" trigger="manual" replayKey={isClaimed ? challenge.id : 'pending'} />+{challenge.xpReward} XP
                </span>
              </div>

              <div className="mt-3 flex items-center gap-3">
                <div className="flex-1 h-2.5 rounded-full bg-[#E5E7EB] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    className="h-full rounded-full bg-[#22C55E]"
                  />
                </div>
                <span className="text-xs font-extrabold text-[#111827] tabular-nums">
                  {progress}/{challenge.target}
                </span>
              </div>

              <div className="mt-3">
                {isClaimed ? (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#15803D]">
                    <LottieIcon animation="success" size={20} tone="success" trigger="mount" />
                    <span>XP récupérés !</span>
                  </div>
                ) : isReady ? (
                  <button
                    type="button"
                    onClick={() => onClaimChallenge(challenge)}
                    className="w-full min-h-[44px] rounded-full bg-[#22C55E] hover:bg-[#16A34A] text-white font-display text-sm font-bold transition-colors cursor-pointer"
                  >
                    Récupérer +{challenge.xpReward} XP
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onStartNotion(nextNotion)}
                    className="w-full min-h-[44px] rounded-full bg-[#111827] hover:bg-[#1F2937] text-white font-display text-sm font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Continuer une leçon</span>
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
