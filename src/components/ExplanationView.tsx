import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { LottieIcon } from './LottieIcon';
import { MascotController } from './mascot/MascotController';
import { VisualStage } from './VisualStage';
import { playSound } from '../utils/sound';
import type { Exercise, TutorResponse } from '../types/math';

interface ExplanationViewProps {
  exercise: Exercise;
  loading: boolean;
  tutorData: TutorResponse | null;
  soundEnabled: boolean;
  onClose: () => void;
}

export const ExplanationView: React.FC<ExplanationViewProps> = ({
  exercise,
  loading,
  tutorData,
  soundEnabled,
  onClose,
}) => {
  const [practiceChoice, setPracticeChoice] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.22 }}
      className="absolute inset-0 z-40 bg-white flex flex-col"
    >
      {/* Clean Brilliant Top Header */}
      <header className="px-4 pt-safe pb-3 border-b border-[#E5E7EB] flex items-center justify-between shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex min-h-[44px] items-center gap-1.5 px-3 py-2 rounded-full bg-[#F7F8FA] hover:bg-[#E5E7EB] text-xs font-bold text-[#111827] cursor-pointer"
        >
          <LottieIcon animation="arrowLeft" size={18} tone="ink" />
          <span>Retour</span>
        </button>

        <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#15803D] bg-[#DCFCE7] px-3 py-1 rounded-full">
          <LottieIcon animation="hint" size={18} tone="success" fallback={<Sparkles className="w-3.5 h-3.5" />} />
          <span>Explication visuelle</span>
        </span>
      </header>

      {/* Scrollable Visual Explanation */}
      <main className="flex-1 overflow-y-auto no-scrollbar px-5 py-5 space-y-5">
        <div className="flex items-center gap-3">
          <MascotController
            character="turkey"
            animationState="explaining"
            size={92}
            className="shrink-0"
          />
          <div className="space-y-1">
            <div className="text-[11px] font-extrabold uppercase tracking-wide text-[#6B7280]">
              Comprendre le pourquoi
            </div>
            <h2 className="font-display text-xl font-bold text-[#111827] leading-tight">
              Regardons ensemble !
            </h2>
          </div>
        </div>

        {/* Diagram / Bar model recap */}
        {exercise.visual && <VisualStage visual={exercise.visual} />}

        <div className="space-y-4">
          {/* Step-by-step animated insight (always immediately available, enriched when AI responds) */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-[#F7F8FA] border border-[#E5E7EB] p-4 space-y-2.5"
          >
            <p className="text-sm font-bold text-[#111827] leading-relaxed">
              {tutorData?.explanation || exercise.simpleExplanation}
            </p>
            <div className="flex items-start gap-2 pt-2 border-t border-[#E5E7EB] text-xs font-semibold text-[#374151]">
              <LottieIcon animation="hint" size={20} tone="xp" trigger="mount" className="shrink-0 mt-0.5" />
              <span>{tutorData?.visualStep || exercise.visualHint}</span>
            </div>
            {loading && (
              <div role="status" className="flex items-center gap-2 text-[11px] font-semibold text-[#6B7280] pt-1">
                <LottieIcon animation="loading" size={20} tone="ink" trigger="mount" loop />
                <span>Astuce personnalisée supplémentaire en cours...</span>
              </div>
            )}
          </motion.div>

          {/* Interactive Mini Practice Check */}
          {tutorData && (
            <div className="rounded-2xl bg-white border border-[#E5E7EB] p-4 space-y-3">
                <div className="text-[11px] font-extrabold uppercase tracking-wide text-[#16A34A]">
                  Petit essai pour vérifier
                </div>
                <p className="font-display text-base font-bold text-[#111827]">
                  {tutorData.practicePrompt}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {tutorData.practiceChoices.map((choice) => {
                    const picked = practiceChoice === choice;
                    const isCorrect = choice === tutorData.practiceAnswer;
                    return (
                      <button
                        key={choice}
                        type="button"
                        onClick={() => {
                          playSound(isCorrect ? 'correct' : 'incorrect', soundEnabled);
                          setPracticeChoice(choice);
                        }}
                        className={`min-h-[44px] rounded-xl border-2 font-display font-bold text-base cursor-pointer transition-all ${
                          picked
                            ? isCorrect
                              ? 'bg-[#22C55E] border-[#16A34A] text-white'
                              : 'bg-[#EF4444] border-[#DC2626] text-white'
                            : 'bg-white border-[#E5E7EB] text-[#111827] hover:border-[#111827]'
                        }`}
                      >
                        {choice}
                      </button>
                    );
                  })}
                </div>
                {practiceChoice && (
                  <div role="status" className="text-xs font-bold">
                    {practiceChoice === tutorData.practiceAnswer ? (
                      <span className="text-[#15803D] inline-flex items-center gap-1">
                        <LottieIcon animation="success" size={20} tone="success" trigger="mount" /> Exactement ! Tu as compris le principe.
                      </span>
                    ) : (
                      <span className="text-[#DC2626]">
                        Essaie une autre option, tu y es presque !
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
        </div>
      </main>

      <footer className="p-4 pb-safe border-t border-[#E5E7EB] bg-white shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="w-full min-h-[50px] rounded-full bg-[#111827] hover:bg-[#1F2937] text-white font-display font-bold text-base cursor-pointer"
        >
          J’ai compris, continuer
        </button>
      </footer>
    </motion.div>
  );
};
