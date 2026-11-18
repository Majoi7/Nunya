import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check } from 'lucide-react';
import { LottieIcon } from './LottieIcon';
import { MascotController, type MascotAnimationState } from './mascot/MascotController';
import { VisualStage } from './VisualStage';
import { InteractiveManipulator } from './exercises/InteractiveManipulator';
import { ExplanationView } from './ExplanationView';
import { playSound } from '../utils/sound';
import { requestTutorExplanation } from '../utils/tutorEngine';
import type {
  Exercise,
  GradeLevel,
  MistakeRecord,
  NotionLesson,
  TutorResponse,
} from '../types/math';

interface LessonScreenProps {
  notion: NotionLesson;
  exercises: Exercise[];
  grade: GradeLevel;
  totalXp: number;
  soundEnabled: boolean;
  geminiAvailable: boolean;
  onExit: () => void;
  onComplete: (result: {
    correctCount: number;
    totalQuestions: number;
    mistakes: MistakeRecord[];
  }) => void;
}

export const LessonScreen: React.FC<LessonScreenProps> = ({
  notion,
  exercises,
  grade,
  totalXp,
  soundEnabled,
  geminiAvailable,
  onExit,
  onComplete,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [orderSelected, setOrderSelected] = useState<string[]>([]);
  const [matchLeftSelected, setMatchLeftSelected] = useState<string | null>(null);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const [matchWrongFlash, setMatchWrongFlash] = useState<string | null>(null);

  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [mascotState, setMascotState] = useState<MascotAnimationState>('encouraging');
  const [shakeTrigger, setShakeTrigger] = useState(false);

  const [correctCount, setCorrectCount] = useState(0);
  const [evaluatedCount, setEvaluatedCount] = useState(0);
  const [sessionXp, setSessionXp] = useState(0);
  const [mistakes, setMistakes] = useState<MistakeRecord[]>([]);

  // Screen E: Dedicated Explanation View
  const [explanationOpen, setExplanationOpen] = useState(false);
  const [tutorLoading, setTutorLoading] = useState(false);
  const [tutorData, setTutorData] = useState<TutorResponse | null>(null);

  const currentExercise = exercises[currentIndex];

  const shuffledRightPairs = useMemo(() => {
    if (!currentExercise?.pairs) return [];
    const arr = [...currentExercise.pairs];
    return arr.sort((a, b) => a.right.localeCompare(b.right));
  }, [currentExercise]);

  useEffect(() => {
    setSelectedAnswer(null);
    setOrderSelected([]);
    setMatchLeftSelected(null);
    setMatchedPairIds([]);
    setMatchWrongFlash(null);
    setFeedback('idle');
    setExplanationOpen(false);
    setTutorData(null);
    setMascotState(
      currentExercise?.phase === 'decouverte' || currentExercise?.phase === 'observation'
        ? 'encouraging'
        : 'thinking'
    );
  }, [currentIndex, currentExercise?.phase]);

  if (!currentExercise) return null;

  const isDiscoveryStep = currentExercise.type === 'discover-stepper';
  const progressRatio = ((currentIndex + (feedback !== 'idle' ? 1 : 0)) / exercises.length) * 100;

  const triggerEvaluation = (answerValue: string) => {
    if (feedback !== 'idle') return;

    // Discovery stepper completes without quiz scoring
    if (isDiscoveryStep) {
      playSound('tap', soundEnabled);
      setMascotState('happy');
      if (currentIndex + 1 < exercises.length) {
        setCurrentIndex((i) => i + 1);
      }
      return;
    }

    const isRight = answerValue === currentExercise.correctAnswer;
    setEvaluatedCount((c) => c + 1);

    if (isRight) {
      playSound('correct', soundEnabled);
      setFeedback('correct');
      setMascotState('happy');
      setCorrectCount((c) => c + 1);
      setSessionXp((x) => x + 15);
    } else {
      playSound('incorrect', soundEnabled);
      setFeedback('incorrect');
      setMascotState('incorrect');
      setShakeTrigger(true);
      setTimeout(() => setShakeTrigger(false), 450);
      setMistakes((prev) => [...prev, { exercise: currentExercise, userAnswer: answerValue }]);
    }
  };

  const handleSelectChoice = (choice: string) => {
    if (feedback !== 'idle') return;
    playSound('tap', soundEnabled);
    setSelectedAnswer(choice);
  };

  const handleOrderToggle = (item: string) => {
    if (feedback !== 'idle') return;
    playSound('tap', soundEnabled);
    if (orderSelected.includes(item)) {
      setOrderSelected((prev) => prev.filter((x) => x !== item));
    } else {
      setOrderSelected((prev) => [...prev, item]);
    }
  };

  const handleMatchRightTap = (pairId: string) => {
    if (feedback !== 'idle' || !matchLeftSelected || matchedPairIds.includes(pairId)) return;
    if (matchLeftSelected === pairId) {
      playSound('coin', soundEnabled);
      const nextMatched = [...matchedPairIds, pairId];
      setMatchedPairIds(nextMatched);
      setMatchLeftSelected(null);
      if (currentExercise.pairs && nextMatched.length === currentExercise.pairs.length) {
        triggerEvaluation('all-matched');
      }
    } else {
      playSound('incorrect', soundEnabled);
      setMatchWrongFlash(pairId);
      setTimeout(() => setMatchWrongFlash(null), 400);
      setMatchLeftSelected(null);
    }
  };

  const handleNext = () => {
    playSound('tap', soundEnabled);
    if (currentIndex + 1 < exercises.length) {
      setCurrentIndex((i) => i + 1);
    } else {
      onComplete({
        correctCount,
        totalQuestions: Math.max(1, evaluatedCount),
        mistakes,
      });
    }
  };

  const handleOpenExplanation = async () => {
    playSound('tap', soundEnabled);
    setExplanationOpen(true);
    setMascotState('explaining');
    if (tutorData) return;
    setTutorLoading(true);
    const resp = await requestTutorExplanation({
      exercise: currentExercise,
      userAnswer: selectedAnswer ?? orderSelected.join(', '),
      gradeLevel: grade,
      geminiAvailable,
    });
    setTutorData(resp);
    setTutorLoading(false);
  };

  const isManipulatorExercise =
    currentExercise.type === 'discover-stepper' ||
    currentExercise.type === 'manipulate-addition' ||
    currentExercise.type === 'manipulate-soustraction' ||
    currentExercise.type === 'manipulate-multiplication' ||
    currentExercise.type === 'manipulate-division' ||
    currentExercise.type === 'manipulate-geometrie';

  const canVerifyStandard =
    (currentExercise.type === 'qcm' ||
      currentExercise.type === 'compare' ||
      currentExercise.type === 'fill-blank') &&
    Boolean(selectedAnswer);

  const canVerifyOrder =
    currentExercise.type === 'order' &&
    Boolean(currentExercise.orderItems) &&
    orderSelected.length === currentExercise.orderItems!.length;

  return (
    <div className="relative flex flex-col h-full bg-white overflow-hidden">
      {/* Brilliant Top Lesson Header (Exact Mobbin fidelity: X | Green Bar + Dots | Yellow Lightning XP) */}
      <header className="px-4 pt-safe pb-3 flex items-center gap-3 border-b border-[#F3F4F6] shrink-0">
        <button
          type="button"
          onClick={onExit}
          aria-label="Quitter la leçon"
          className="w-11 h-11 rounded-full flex items-center justify-center text-[#374151] hover:bg-[#F3F4F6] transition-colors cursor-pointer shrink-0"
        >
          <LottieIcon animation="close" size={20} tone="ink" />
        </button>

        {/* Green rounded progress bar + step dots */}
        <div className="flex-1 flex items-center gap-2">
          <div className="flex-1 h-3 rounded-full bg-[#E5E7EB] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-[#22C55E]"
              initial={false}
              animate={{ width: `${Math.max(10, progressRatio)}%` }}
              transition={{ type: 'spring', stiffness: 160, damping: 20 }}
            />
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {exercises.map((_, idx) => (
              <span
                key={idx}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx < currentIndex
                    ? 'bg-[#22C55E]'
                    : idx === currentIndex
                    ? 'bg-[#86EFAC]'
                    : 'bg-[#E5E7EB]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Yellow Lightning Bolt + XP */}
        <div className="flex items-center gap-1 font-display font-bold text-sm text-[#111827] tabular-nums shrink-0">
          <LottieIcon animation="xp" size={22} tone="xp" trigger="manual" replayKey={sessionXp} />
          <span>{totalXp + sessionXp}</span>
        </div>
      </header>

      {/* Scrollable Lesson Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar px-5 py-4 pb-32 space-y-4">
        {/* Phase pill & Mascot Companion */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-wide text-[#16A34A]">
              {notion.title} · {currentExercise.phaseLabel}
            </div>
            <h1 className="font-display text-xl font-bold text-[#111827] leading-snug mt-0.5">
              {currentExercise.introTitle}
            </h1>
          </div>

          <MascotController
            character="turkey"
            animationState={mascotState}
            size={66}
            onAnimationComplete={() => {
              if (mascotState === 'happy') {
                setMascotState('celebrating');
              }
            }}
            className="shrink-0"
          />
        </div>

        <p className="text-sm font-semibold text-[#4B5563] leading-relaxed">
          {currentExercise.introText}
        </p>

        {/* Interactive Discovery / Tactile Manipulation Modules */}
        {isManipulatorExercise ? (
          <div className={shakeTrigger ? 'animate-shake' : ''}>
            <p className="font-display text-base font-bold text-[#111827] mb-2.5">
              {currentExercise.question}
            </p>
            <InteractiveManipulator
              key={currentExercise.id}
              exercise={currentExercise}
              disabled={feedback !== 'idle'}
              onTapSound={() => playSound('tap', soundEnabled)}
              onSubmitAnswer={(ans) => triggerEvaluation(ans)}
            />
          </div>
        ) : (
          <>
            {/* Visual Stage Diagram */}
            <VisualStage
              visual={currentExercise.visual}
              selectedCompare={currentExercise.type === 'compare' ? selectedAnswer : null}
            />

            {/* Standard Question Zone */}
            <div className={shakeTrigger ? 'animate-shake' : ''}>
              <p className="font-display text-lg font-bold text-[#111827] mb-3">
                {currentExercise.question}
              </p>

              {/* QCM */}
              {currentExercise.type === 'qcm' && currentExercise.choices && (
                <div className="grid grid-cols-3 gap-2.5">
                  {currentExercise.choices.map((choice) => {
                    const isSelected = selectedAnswer === choice;
                    const isRight = choice === currentExercise.correctAnswer;
                    let cls =
                      'bg-white border-2 border-[#E5E7EB] text-[#111827] hover:border-[#111827]';
                    if (feedback === 'idle' && isSelected) {
                      cls = 'bg-[#F7F8FA] border-2 border-[#111827] text-[#111827]';
                    } else if (feedback !== 'idle') {
                      if (isSelected && feedback === 'correct') {
                        cls = 'bg-[#DCFCE7] border-2 border-[#22C55E] text-[#14532D]';
                      } else if (isSelected && feedback === 'incorrect') {
                        cls = 'bg-[#FEE2E2] border-2 border-[#EF4444] text-[#7F1D1D]';
                      } else if (isRight && feedback === 'incorrect') {
                        cls = 'bg-[#DCFCE7] border-2 border-[#22C55E] text-[#14532D]';
                      }
                    }
                    return (
                      <button
                        key={choice}
                        type="button"
                        disabled={feedback !== 'idle'}
                        onClick={() => handleSelectChoice(choice)}
                        className={`min-h-[58px] rounded-2xl font-display text-xl font-bold tabular-nums transition-all cursor-pointer select-none ${cls}`}
                      >
                        {choice}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Compare (<, =, >) */}
              {currentExercise.type === 'compare' && currentExercise.choices && (
                <div className="grid grid-cols-3 gap-2.5">
                  {currentExercise.choices.map((symbol) => {
                    const isSelected = selectedAnswer === symbol;
                    const isRight = symbol === currentExercise.correctAnswer;
                    let cls =
                      'bg-white border-2 border-[#E5E7EB] text-[#111827] hover:border-[#111827]';
                    if (feedback === 'idle' && isSelected) {
                      cls = 'bg-[#F7F8FA] border-2 border-[#111827] text-[#111827]';
                    } else if (feedback !== 'idle') {
                      if (isSelected && feedback === 'correct') {
                        cls = 'bg-[#DCFCE7] border-2 border-[#22C55E] text-[#14532D]';
                      } else if (isSelected && feedback === 'incorrect') {
                        cls = 'bg-[#FEE2E2] border-2 border-[#EF4444] text-[#7F1D1D]';
                      } else if (isRight && feedback === 'incorrect') {
                        cls = 'bg-[#DCFCE7] border-2 border-[#22C55E] text-[#14532D]';
                      }
                    }
                    return (
                      <button
                        key={symbol}
                        type="button"
                        disabled={feedback !== 'idle'}
                        onClick={() => handleSelectChoice(symbol)}
                        aria-label={`Symbole ${symbol}`}
                        className={`min-h-[60px] rounded-2xl font-display text-2xl font-bold transition-all cursor-pointer select-none ${cls}`}
                      >
                        {symbol}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Fill-in-the-blank */}
              {currentExercise.type === 'fill-blank' &&
                currentExercise.equationTemplate &&
                currentExercise.choices && (
                  <div className="space-y-4">
                    <div className="rounded-2xl bg-[#F7F8FA] border border-[#E5E7EB] py-4 px-3 flex items-center justify-center gap-2 font-display text-2xl font-bold text-[#111827] tabular-nums">
                      <span>{currentExercise.equationTemplate[0]}</span>
                      <button
                        type="button"
                        disabled={feedback !== 'idle'}
                        onClick={() => setSelectedAnswer(null)}
                        aria-label="Case réponse"
                        className={`min-w-[56px] h-11 px-3 rounded-xl border-2 flex items-center justify-center transition-all ${
                          selectedAnswer
                            ? feedback === 'correct'
                              ? 'bg-[#22C55E] border-[#16A34A] text-white'
                              : feedback === 'incorrect'
                              ? 'bg-[#EF4444] border-[#DC2626] text-white'
                              : 'bg-white border-[#111827] text-[#111827]'
                            : 'bg-white border-dashed border-[#9CA3AF] text-[#6B7280]'
                        }`}
                      >
                        {selectedAnswer || '?'}
                      </button>
                      <span>{currentExercise.equationTemplate[1]}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {currentExercise.choices.map((tile) => {
                        const active = selectedAnswer === tile;
                        return (
                          <button
                            key={tile}
                            type="button"
                            disabled={feedback !== 'idle'}
                            onClick={() => handleSelectChoice(tile)}
                            className={`min-h-[50px] rounded-2xl border-2 font-display text-lg font-bold tabular-nums cursor-pointer select-none transition-all ${
                              active
                                ? 'bg-[#111827] border-[#111827] text-white'
                                : 'bg-white border-[#E5E7EB] text-[#111827] hover:border-[#111827]'
                            }`}
                          >
                            {tile}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

              {/* Order Sequence (Brilliant-style numbered slots + Start over) */}
              {currentExercise.type === 'order' && currentExercise.orderItems && (
                <div className="space-y-4">
                  <div className="rounded-2xl bg-[#F7F8FA] border border-[#E5E7EB] p-3 space-y-2">
                    {currentExercise.orderItems.map((_, slotIdx) => {
                      const placed = orderSelected[slotIdx];
                      return (
                        <div key={slotIdx} className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-[#E5E7EB] text-[#374151] font-display font-bold text-xs flex items-center justify-center tabular-nums">
                            {slotIdx + 1}
                          </span>
                          <div
                            className={`flex-1 min-h-[42px] rounded-xl border px-3 flex items-center font-display text-base font-bold tabular-nums ${
                              placed
                                ? feedback === 'correct'
                                  ? 'bg-[#DCFCE7] border-[#22C55E] text-[#14532D]'
                                  : feedback === 'incorrect'
                                  ? 'bg-[#FEE2E2] border-[#EF4444] text-[#7F1D1D]'
                                  : 'bg-white border-[#111827] text-[#111827]'
                                : 'bg-white border-dashed border-[#D1D5DB] text-[#9CA3AF] text-xs font-body'
                            }`}
                          >
                            {placed || 'Touche une carte ci-dessous'}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap gap-2 justify-center">
                    {currentExercise.orderItems.map((item) => {
                      const used = orderSelected.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          disabled={used || feedback !== 'idle'}
                          onClick={() => handleOrderToggle(item)}
                          className={`min-w-[68px] min-h-[46px] px-4 rounded-2xl border-2 font-display text-lg font-bold tabular-nums transition-all ${
                            used
                              ? 'bg-[#F3F4F6] border-[#E5E7EB] text-[#D1D5DB] cursor-default'
                              : 'bg-white border-[#E5E7EB] text-[#111827] hover:border-[#111827] cursor-pointer'
                          }`}
                        >
                          {item}
                        </button>
                      );
                    })}
                  </div>

                  {orderSelected.length > 0 && feedback === 'idle' && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setOrderSelected([])}
                        className="inline-flex min-h-[44px] items-center gap-1.5 text-xs font-bold text-[#6B7280] hover:text-[#111827] px-2 py-1 rounded-xl cursor-pointer"
                      >
                        <LottieIcon animation="refresh" size={18} tone="ink" />
                        <span>Recommencer</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Pair Matching */}
              {currentExercise.type === 'match' && currentExercise.pairs && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    {currentExercise.pairs.map((pair) => {
                      const matched = matchedPairIds.includes(pair.id);
                      const selected = matchLeftSelected === pair.id;
                      return (
                        <button
                          key={pair.id}
                          type="button"
                          disabled={matched || feedback !== 'idle'}
                          onClick={() => {
                            playSound('tap', soundEnabled);
                            setMatchLeftSelected(pair.id);
                          }}
                          className={`w-full min-h-[48px] px-3 rounded-2xl border-2 font-display text-sm font-bold transition-all cursor-pointer ${
                            matched
                              ? 'bg-[#DCFCE7] border-[#22C55E] text-[#15803D]'
                              : selected
                              ? 'bg-[#111827] border-[#111827] text-white'
                              : 'bg-white border-[#E5E7EB] text-[#111827] hover:border-[#111827]'
                          }`}
                        >
                          {pair.left}
                        </button>
                      );
                    })}
                  </div>

                  <div className="space-y-2">
                    {shuffledRightPairs.map((pair) => {
                      const matched = matchedPairIds.includes(pair.id);
                      const wrong = matchWrongFlash === pair.id;
                      return (
                        <button
                          key={pair.id}
                          type="button"
                          disabled={matched || !matchLeftSelected || feedback !== 'idle'}
                          onClick={() => handleMatchRightTap(pair.id)}
                          className={`w-full min-h-[48px] px-3 rounded-2xl border-2 font-display text-sm font-bold tabular-nums transition-all ${
                            matched
                              ? 'bg-[#DCFCE7] border-[#22C55E] text-[#15803D]'
                              : wrong
                              ? 'bg-[#EF4444] border-[#DC2626] text-white animate-shake'
                              : matchLeftSelected
                              ? 'bg-white border-[#111827] text-[#111827] cursor-pointer'
                              : 'bg-[#F7F8FA] border-[#E5E7EB] text-[#6B7280]'
                          }`}
                        >
                          {matched ? (
                            <span className="inline-flex items-center gap-1">
                              <LottieIcon animation="success" size={18} tone="success" trigger="mount" fallback={<Check className="w-4 h-4" />} /> {pair.right}
                            </span>
                          ) : (
                            pair.right
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Primary Check CTA for standard exercises (QCM / Compare / Fill-blank / Order) */}
      {feedback === 'idle' && !isManipulatorExercise && currentExercise.type !== 'match' && (
        <div className="absolute bottom-0 left-0 right-0 p-4 pb-safe bg-white/95 backdrop-blur-xs border-t border-[#E5E7EB]">
          <button
            type="button"
            disabled={!canVerifyStandard && !canVerifyOrder}
            onClick={() => {
              if (currentExercise.type === 'order') {
                triggerEvaluation(orderSelected.join(','));
              } else if (selectedAnswer) {
                triggerEvaluation(selectedAnswer);
              }
            }}
            className={`w-full min-h-[50px] rounded-full font-display text-base font-bold transition-colors ${
              canVerifyStandard || canVerifyOrder
                ? 'bg-[#111827] hover:bg-[#1F2937] text-white cursor-pointer'
                : 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
            }`}
          >
            Vérifier
          </button>
        </div>
      )}

      {/* Brilliant Feedback Drawer (Exact Mobbin Screen 2 & 3 style: #DCFCE7 + "+15 XP" + "Pourquoi ?" pill + Green "Continuer" pill) */}
      <AnimatePresence>
        {feedback !== 'idle' && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className={`absolute bottom-0 left-0 right-0 z-30 rounded-t-3xl p-4 pb-safe shadow-xl border-t ${
              feedback === 'correct'
                ? 'bg-[#DCFCE7] border-[#86EFAC]'
                : 'bg-[#FEF2F2] border-[#FECACA]'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div role="status" className="flex flex-wrap items-center gap-2 min-w-0">
                <LottieIcon animation={feedback === 'correct' ? 'success' : 'error'} size={24} tone={feedback === 'correct' ? 'success' : 'error'} trigger="mount" />
                <span className="font-display text-lg font-bold text-[#111827]">
                  {feedback === 'correct' ? 'Bravo !' : 'Pas tout à fait'}
                </span>
                {feedback === 'correct' && (
                  <span className="font-display text-sm font-extrabold text-[#16A34A] tabular-nums">
                    +15 XP
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleOpenExplanation}
                className={`min-h-[44px] px-4 py-1.5 rounded-full font-display text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                  feedback === 'correct'
                    ? 'bg-[#BBF7D0] hover:bg-[#86EFAC] text-[#14532D]'
                    : 'bg-[#FEE2E2] hover:bg-[#FECACA] text-[#7F1D1D]'
                }`}
              >
                Pourquoi ?
              </button>
            </div>

            <p className="text-xs font-semibold text-[#1F2937] leading-snug mb-3">
              {currentExercise.simpleExplanation}
            </p>

            <button
              type="button"
              onClick={handleNext}
              className={`w-full min-h-[48px] rounded-full font-display text-base font-bold text-white transition-colors cursor-pointer ${
                feedback === 'correct'
                  ? 'bg-[#22C55E] hover:bg-[#16A34A]'
                  : 'bg-[#111827] hover:bg-[#1F2937]'
              }`}
            >
              {currentIndex + 1 < exercises.length ? 'Continuer' : 'Voir mon bilan'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screen E: Dedicated Explanation View */}
      <AnimatePresence>
        {explanationOpen && (
          <ExplanationView
            exercise={currentExercise}
            loading={tutorLoading}
            tutorData={tutorData}
            soundEnabled={soundEnabled}
            onClose={() => {
              setExplanationOpen(false);
              setMascotState(feedback === 'correct' ? 'happy' : 'encouraging');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
