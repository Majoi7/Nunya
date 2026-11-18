import React from 'react';
import { Check, Lock, Play, Sparkles, Star } from 'lucide-react';
import { LottieIcon } from './LottieIcon';
import { CHAPTERS, getNotionStatus } from '../utils/gameLogic';
import type { NotionLesson, UserState } from '../types/math';

interface CurriculumScreenProps {
  userState: UserState;
  onStartNotion: (notion: NotionLesson) => void;
  onToggleDemoMode: () => void;
}

export const CurriculumScreen: React.FC<CurriculumScreenProps> = ({
  userState,
  onStartNotion,
  onToggleDemoMode,
}) => {
  return (
    <div className="px-4 py-4 space-y-5 bg-white">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#111827]">Parcours</h1>
          <p className="text-xs font-semibold text-[#6B7280]">
            5 chapitres progressifs · Niveau {userState.profile.grade}
          </p>
        </div>

        <button
          type="button"
          onClick={onToggleDemoMode}
          aria-pressed={userState.demoMode}
          className={`min-h-[44px] px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 cursor-pointer transition-colors shrink-0 ${
            userState.demoMode
              ? 'bg-[#111827] border-[#111827] text-white'
              : 'bg-[#F7F8FA] border-[#E5E7EB] text-[#374151] hover:border-[#9CA3AF]'
          }`}
        >
          <LottieIcon animation="book" size={18} tone={userState.demoMode ? 'inverse' : 'ink'} trigger="manual" replayKey={String(userState.demoMode)} fallback={<Sparkles className="w-3.5 h-3.5" />} />
          <span>{userState.demoMode ? 'Tout débloqué' : 'Mode libre'}</span>
        </button>
      </div>

      {/* Chapters & Notions List */}
      <div className="space-y-5 pb-4">
        {CHAPTERS.map((chapter) => {
          const completedInChapter = chapter.notions.filter(
            (n) => userState.lessonProgress[n.id]?.completed
          ).length;

          return (
            <section
              key={chapter.id}
              aria-label={`Chapitre ${chapter.order} : ${chapter.title}`}
              className="rounded-3xl border border-[#E5E7EB] bg-[#F7F8FA] p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[11px] font-extrabold uppercase tracking-wide text-[#6B7280]">
                    Chapitre {chapter.order}
                  </div>
                  <h2 className="font-display text-lg font-bold text-[#111827] leading-tight">
                    {chapter.title}
                  </h2>
                  <p className="text-xs font-semibold text-[#6B7280] mt-0.5">
                    {chapter.description}
                  </p>
                </div>
                <span className="text-xs font-extrabold text-[#111827] bg-white border border-[#E5E7EB] px-2.5 py-1 rounded-full tabular-nums shrink-0">
                  {completedInChapter}/{chapter.notions.length}
                </span>
              </div>

              {/* Notions inside Chapter */}
              <div className="space-y-2.5">
                {chapter.notions.map((notion) => {
                  const status = getNotionStatus(
                    notion,
                    userState.lessonProgress,
                    userState.demoMode
                  );
                  const prog = userState.lessonProgress[notion.id];
                  const locked = status === 'locked';
                  const completed = status === 'completed';

                  return (
                    <button
                      key={notion.id}
                      type="button"
                      disabled={locked}
                      onClick={() => !locked && onStartNotion(notion)}
                      aria-label={`${notion.title} (${
                        locked ? 'verrouillé' : completed ? 'terminé' : 'disponible'
                      })`}
                      className={`w-full rounded-2xl p-3.5 border text-left flex items-center gap-3 transition-all ${
                        locked
                          ? 'bg-[#F3F4F6] border-[#E5E7EB] opacity-70 cursor-not-allowed'
                          : completed
                          ? 'bg-white border-[#86EFAC] hover:border-[#22C55E] cursor-pointer'
                          : 'bg-white border-[#111827] shadow-xs cursor-pointer'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          locked
                            ? 'bg-[#E5E7EB] text-[#9CA3AF]'
                            : completed
                            ? 'bg-[#DCFCE7] text-[#15803D]'
                            : 'bg-[#111827] text-white'
                        }`}
                      >
                        {locked ? (
                          <LottieIcon animation="lock" size={20} play={false} tone="muted" fallback={<Lock className="w-4 h-4" />} />
                        ) : completed ? (
                          <LottieIcon animation="success" size={24} tone="success" fallback={<Check className="w-5 h-5 stroke-[2.5]" />} />
                        ) : (
                          <LottieIcon animation="arrowRight" size={20} tone="inverse" fallback={<Play className="w-4 h-4 fill-current" />} />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-display text-sm font-bold text-[#111827] truncate">
                            {notion.orderInChapter}. {notion.title}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-[#6B7280] truncate">
                          {locked
                            ? 'Termine la notion précédente pour débloquer'
                            : notion.subtitle}
                        </div>

                        {completed && prog && (
                          <div role="img" aria-label={`${prog.stars} étoiles sur 3, meilleure précision ${prog.bestAccuracy}%`} className="flex items-center gap-1 mt-1">
                            {[1, 2, 3].map((s) => (
                              <LottieIcon
                                key={s}
                                animation="star"
                                size={14}
                                tone={s <= prog.stars ? 'xp' : 'muted'}
                                play={s <= prog.stars}
                                fallback={<Star className={`w-3.5 h-3.5 ${s <= prog.stars ? 'text-[#FACC15] fill-[#FACC15]' : 'text-[#E5E7EB] fill-[#E5E7EB]'}`} />}
                              />
                            ))}
                            <span className="ml-1 text-[11px] font-bold text-[#15803D] tabular-nums">
                              {prog.bestAccuracy}%
                            </span>
                          </div>
                        )}
                      </div>

                      <span
                        className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full shrink-0 ${
                          locked
                            ? 'bg-[#E5E7EB] text-[#6B7280]'
                            : completed
                            ? 'bg-[#DCFCE7] text-[#15803D]'
                            : 'bg-[#22C55E] text-white'
                        }`}
                      >
                        {locked ? 'Verrouillé' : completed ? 'Revoir' : 'Disponible'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
