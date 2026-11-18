import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react';
import { LottieIcon } from '../LottieIcon';
import { VisualStage } from '../VisualStage';
import type { Exercise } from '../../types/math';

interface InteractiveManipulatorProps {
  exercise: Exercise;
  disabled: boolean;
  onTapSound: () => void;
  onSubmitAnswer: (answer: string) => void;
}

export const InteractiveManipulator: React.FC<InteractiveManipulatorProps> = ({
  exercise,
  disabled,
  onTapSound,
  onSubmitAnswer,
}) => {
  // 1. Stepper state (discover-stepper)
  const [slideIdx, setSlideIdx] = useState(0);

  // 2. Addition manipulation state
  const leftTotal = exercise.manipulation?.leftCount ?? 0;
  const rightTotal = exercise.manipulation?.rightCount ?? 0;
  const [movedLeft, setMovedLeft] = useState(0);
  const [movedRight, setMovedRight] = useState(0);

  // 3. Soustraction manipulation state
  const [removedIndices, setRemovedIndices] = useState<number[]>([]);

  // 4. Multiplication manipulation state
  const [gridRows, setGridRows] = useState(1);
  const [gridCols, setGridCols] = useState(1);

  // 5. Division manipulation state
  const basketCount = exercise.manipulation?.baskets ?? 2;
  const totalDivItems = exercise.manipulation?.totalItems ?? 6;
  const [basketCounts, setBasketCounts] = useState<number[]>(() =>
    Array.from({ length: basketCount }, () => 0)
  );

  // 6. Geometry manipulation state
  const [activatedSides, setActivatedSides] = useState<number[]>([]);
  const [markedCorners, setMarkedCorners] = useState<number[]>([]);

  // ---------------------------------------------------------------------------
  // A. BRILLIANT DISCOVERY STEPPER (Mobbin Screen 5 style: ◀ ••• ▶)
  // ---------------------------------------------------------------------------
  if (exercise.type === 'discover-stepper' && exercise.slides && exercise.slides.length > 0) {
    const slides = exercise.slides;
    const current = slides[Math.min(slideIdx, slides.length - 1)];
    const isLast = slideIdx >= slides.length - 1;

    return (
      <div className="space-y-4">
        <div className="rounded-2xl bg-[#F7F8FA] border border-[#E5E7EB] p-4 space-y-3">
          <div className="text-center font-display text-lg font-bold text-[#111827] tabular-nums">
            {current.highlightFormula}
          </div>
          <VisualStage visual={current.visual} />
          <p className="text-sm font-semibold text-[#374151] text-center leading-relaxed">
            {current.caption}
          </p>
        </div>

        {/* Pagination dots + ◀ ▶ controls matching Mobbin Screen 5 */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-1.5">
            {slides.map((_, idx) => (
              <span
                key={idx}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx === slideIdx ? 'bg-[#111827]' : 'bg-[#D1D5DB]'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={slideIdx === 0}
              onClick={() => {
                onTapSound();
                setSlideIdx((i) => Math.max(0, i - 1));
              }}
              aria-label="Étape précédente"
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                slideIdx === 0
                  ? 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
                  : 'bg-[#111827] text-white hover:bg-[#1F2937] cursor-pointer'
              }`}
            >
              <LottieIcon animation="arrowLeft" size={22} play={slideIdx > 0} tone={slideIdx === 0 ? 'muted' : 'inverse'} replayKey={slideIdx} fallback={<ChevronLeft className="w-5 h-5" />} />
            </button>

            <button
              type="button"
              disabled={isLast}
              onClick={() => {
                onTapSound();
                setSlideIdx((i) => Math.min(slides.length - 1, i + 1));
              }}
              aria-label="Étape suivante"
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                isLast
                  ? 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
                  : 'bg-[#111827] text-white hover:bg-[#1F2937] cursor-pointer'
              }`}
            >
              <LottieIcon animation="arrowRight" size={22} play={!isLast} tone={isLast ? 'muted' : 'inverse'} replayKey={slideIdx} fallback={<ChevronRight className="w-5 h-5" />} />
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            onTapSound();
            onSubmitAnswer('observed');
          }}
          className="w-full min-h-[50px] rounded-full bg-[#111827] hover:bg-[#1F2937] text-white font-display text-base font-bold transition-colors cursor-pointer"
        >
          {isLast ? 'J’ai observé, continuer' : 'Continuer'}
        </button>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // B. MANIPULATION: ADDITION (Move objects from 2 baskets into unified bowl)
  // ---------------------------------------------------------------------------
  if (exercise.type === 'manipulate-addition') {
    const leftEmoji = exercise.manipulation?.leftEmoji ?? exercise.manipulation?.emoji ?? '🍎';
    const rightEmoji = exercise.manipulation?.rightEmoji ?? exercise.manipulation?.emoji ?? '🍏';
    const remainingLeft = leftTotal - movedLeft;
    const remainingRight = rightTotal - movedRight;
    const totalMoved = movedLeft + movedRight;
    const allMoved = remainingLeft === 0 && remainingRight === 0;

    return (
      <div className="space-y-4">
        <div className="rounded-2xl bg-[#F7F8FA] border border-[#E5E7EB] p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-[#6B7280]">
            <span>Touche les objets pour les réunir</span>
            <span className="tabular-nums text-[#111827]">
              {movedLeft} + {movedRight} = {totalMoved}
            </span>
          </div>

          {/* Source Baskets */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              disabled={disabled || remainingLeft === 0}
              onClick={() => {
                onTapSound();
                setMovedLeft((v) => Math.min(leftTotal, v + 1));
              }}
              className={`min-h-[82px] rounded-xl border p-2.5 flex flex-col items-center justify-center gap-1.5 transition-all ${
                remainingLeft > 0 && !disabled
                  ? 'bg-white border-[#D1D5DB] hover:border-[#22C55E] cursor-pointer active:scale-[0.98]'
                  : 'bg-[#F3F4F6] border-dashed border-[#D1D5DB] opacity-65 cursor-default'
              }`}
            >
              <div className="flex flex-wrap justify-center gap-1">
                {Array.from({ length: remainingLeft }, (_, i) => (
                  <span key={i} className="text-xl leading-none">
                    {leftEmoji}
                  </span>
                ))}
                {remainingLeft === 0 && (
                  <span className="text-xs font-bold text-[#6B7280]">Vide ✓</span>
                )}
              </div>
              <span className="text-[11px] font-bold text-[#4B5563] tabular-nums">
                Panier A ({remainingLeft})
              </span>
            </button>

            <button
              type="button"
              disabled={disabled || remainingRight === 0}
              onClick={() => {
                onTapSound();
                setMovedRight((v) => Math.min(rightTotal, v + 1));
              }}
              className={`min-h-[82px] rounded-xl border p-2.5 flex flex-col items-center justify-center gap-1.5 transition-all ${
                remainingRight > 0 && !disabled
                  ? 'bg-white border-[#D1D5DB] hover:border-[#22C55E] cursor-pointer active:scale-[0.98]'
                  : 'bg-[#F3F4F6] border-dashed border-[#D1D5DB] opacity-65 cursor-default'
              }`}
            >
              <div className="flex flex-wrap justify-center gap-1">
                {Array.from({ length: remainingRight }, (_, i) => (
                  <span key={i} className="text-xl leading-none">
                    {rightEmoji}
                  </span>
                ))}
                {remainingRight === 0 && (
                  <span className="text-xs font-bold text-[#6B7280]">Vide ✓</span>
                )}
              </div>
              <span className="text-[11px] font-bold text-[#4B5563] tabular-nums">
                Panier B ({remainingRight})
              </span>
            </button>
          </div>

          {/* Combined Assembly Zone */}
          <div className="rounded-xl bg-white border-2 border-[#22C55E]/40 p-3 min-h-[74px] flex flex-col items-center justify-center gap-1.5">
            <div className="flex flex-wrap justify-center gap-1.5">
              {Array.from({ length: movedLeft }, (_, i) => (
                <motion.span
                  key={`l-${i}`}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.15 }}
                  className="text-2xl leading-none"
                >
                  {leftEmoji}
                </motion.span>
              ))}
              {Array.from({ length: movedRight }, (_, i) => (
                <motion.span
                  key={`r-${i}`}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.15 }}
                  className="text-2xl leading-none"
                >
                  {rightEmoji}
                </motion.span>
              ))}
              {totalMoved === 0 && (
                <span className="text-xs font-semibold text-[#9CA3AF]">
                  Grand bol : touche un panier ci-dessus pour ajouter ici
                </span>
              )}
            </div>
            <div className="text-xs font-extrabold text-[#15803D] tabular-nums">
              Total réuni : {totalMoved}
            </div>
          </div>

          {!disabled && totalMoved > 0 && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setMovedLeft(0);
                  setMovedRight(0);
                }}
                className="inline-flex min-h-[44px] items-center gap-1 text-xs font-bold text-[#6B7280] hover:text-[#111827] cursor-pointer"
              >
                <LottieIcon animation="refresh" size={18} tone="ink" />
                <span>Recommencer</span>
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          disabled={disabled || totalMoved === 0}
          onClick={() => onSubmitAnswer(String(totalMoved))}
          className={`w-full min-h-[50px] rounded-full font-display text-base font-bold transition-colors ${
            disabled || totalMoved === 0
              ? 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
              : allMoved
              ? 'bg-[#111827] hover:bg-[#1F2937] text-white cursor-pointer'
              : 'bg-[#374151] text-white cursor-pointer'
          }`}
        >
          Vérifier
        </button>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // C. MANIPULATION: SOUSTRACTION (Tap objects to remove them & count remaining)
  // ---------------------------------------------------------------------------
  if (exercise.type === 'manipulate-soustraction') {
    const initial = exercise.manipulation?.initialCount ?? 6;
    const targetRemove = exercise.manipulation?.removeCount ?? 2;
    const emoji = exercise.manipulation?.emoji ?? '🍓';
    const remaining = initial - removedIndices.length;

    const toggleItem = (idx: number) => {
      if (disabled) return;
      onTapSound();
      setRemovedIndices((prev) =>
        prev.includes(idx) ? prev.filter((x) => x !== idx) : [...prev, idx]
      );
    };

    return (
      <div className="space-y-4">
        <div className="rounded-2xl bg-[#F7F8FA] border border-[#E5E7EB] p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-[#4B5563]">Objectif : retirer {targetRemove}</span>
            <span className="text-[#111827] tabular-nums">
              {initial} - {removedIndices.length} = {remaining}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 py-2">
            {Array.from({ length: initial }, (_, idx) => {
              const isRemoved = removedIndices.includes(idx);
              return (
                <motion.button
                  key={idx}
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  disabled={disabled}
                  onClick={() => toggleItem(idx)}
                  aria-label={`Objet ${idx + 1}${isRemoved ? ' retiré' : ''}`}
                  className={`relative w-12 h-12 rounded-xl border flex items-center justify-center text-2xl transition-all cursor-pointer select-none ${
                    isRemoved
                      ? 'bg-[#FEE2E2]/60 border-[#FCA5A5] opacity-40'
                      : 'bg-white border-[#D1D5DB] hover:border-[#F59E0B]'
                  }`}
                >
                  <span>{emoji}</span>
                  {isRemoved && (
                    <span className="absolute inset-0 flex items-center justify-center text-[#DC2626] font-bold text-xl">
                      ✕
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs font-bold text-[#4B5563] pt-1 border-t border-[#E5E7EB]">
            <span className="tabular-nums">Retirés : {removedIndices.length}</span>
            <span className="tabular-nums text-[#15803D]">Restants : {remaining}</span>
          </div>
        </div>

        <button
          type="button"
          disabled={disabled || removedIndices.length === 0}
          onClick={() => onSubmitAnswer(String(remaining))}
          className={`w-full min-h-[50px] rounded-full font-display text-base font-bold transition-colors ${
            disabled || removedIndices.length === 0
              ? 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
              : 'bg-[#111827] hover:bg-[#1F2937] text-white cursor-pointer'
          }`}
        >
          Vérifier
        </button>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // D. MANIPULATION: MULTIPLICATION (Interactive Grid Builder rows × cols)
  // ---------------------------------------------------------------------------
  if (exercise.type === 'manipulate-multiplication') {
    const maxR = exercise.manipulation?.maxRows ?? 5;
    const maxC = exercise.manipulation?.maxCols ?? 5;
    const emoji = exercise.manipulation?.emoji ?? '💎';

    return (
      <div className="space-y-4">
        <div className="rounded-2xl bg-[#F7F8FA] border border-[#E5E7EB] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#4B5563]">
              Touche une case pour former le rectangle
            </span>
            <span className="font-display text-base font-bold text-[#111827] tabular-nums">
              {gridRows} × {gridCols} = {gridRows * gridCols}
            </span>
          </div>

          {/* Interactive Matrix */}
          <div className="max-w-full overflow-x-auto rounded-xl" tabIndex={0} role="region" aria-label="Grille de multiplication, défile horizontalement si nécessaire">
            <div className="w-max min-w-full flex flex-col items-center gap-0.5 bg-white border border-[#E5E7EB] rounded-xl p-2">
            {Array.from({ length: maxR }, (_, r) => (
              <div key={r} className="flex items-center gap-0.5">
                {Array.from({ length: maxC }, (_, c) => {
                  const active = r < gridRows && c < gridCols;
                  return (
                    <button
                      key={c}
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        onTapSound();
                        setGridRows(r + 1);
                        setGridCols(c + 1);
                      }}
                      aria-label={`${r + 1} lignes par ${c + 1} colonnes`}
                      className={`w-11 h-11 rounded-lg border flex items-center justify-center text-lg transition-all cursor-pointer ${
                        active
                          ? 'bg-[#DCFCE7] border-[#22C55E]'
                          : 'bg-[#F9FAFB] border-[#E5E7EB] hover:border-[#9CA3AF]'
                      }`}
                    >
                      {active ? emoji : ''}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          </div>

          {/* Row / Col quick steppers */}
          <div className="grid grid-cols-1 min-[390px]:grid-cols-2 gap-2">
            <div className="bg-white border border-[#E5E7EB] rounded-xl px-2.5 py-2 flex flex-col items-center justify-between gap-1">
              <span className="text-[11px] font-bold text-[#4B5563]">Lignes</span>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  disabled={disabled || gridRows <= 1}
                  onClick={() => {
                    onTapSound();
                    setGridRows((r) => Math.max(1, r - 1));
                  }}
                  aria-label="Moins de lignes"
                  className="w-11 h-11 rounded-lg bg-[#F3F4F6] flex items-center justify-center text-[#111827] disabled:opacity-40 cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-display font-bold text-sm w-4 text-center tabular-nums">
                  {gridRows}
                </span>
                <button
                  type="button"
                  disabled={disabled || gridRows >= maxR}
                  onClick={() => {
                    onTapSound();
                    setGridRows((r) => Math.min(maxR, r + 1));
                  }}
                  aria-label="Plus de lignes"
                  className="w-11 h-11 rounded-lg bg-[#F3F4F6] flex items-center justify-center text-[#111827] disabled:opacity-40 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-xl px-2.5 py-2 flex flex-col items-center justify-between gap-1">
              <span className="text-[11px] font-bold text-[#4B5563]">Colonnes</span>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  disabled={disabled || gridCols <= 1}
                  onClick={() => {
                    onTapSound();
                    setGridCols((c) => Math.max(1, c - 1));
                  }}
                  aria-label="Moins de colonnes"
                  className="w-11 h-11 rounded-lg bg-[#F3F4F6] flex items-center justify-center text-[#111827] disabled:opacity-40 cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-display font-bold text-sm w-4 text-center tabular-nums">
                  {gridCols}
                </span>
                <button
                  type="button"
                  disabled={disabled || gridCols >= maxC}
                  onClick={() => {
                    onTapSound();
                    setGridCols((c) => Math.min(maxC, c + 1));
                  }}
                  aria-label="Plus de colonnes"
                  className="w-11 h-11 rounded-lg bg-[#F3F4F6] flex items-center justify-center text-[#111827] disabled:opacity-40 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          disabled={disabled}
          onClick={() => onSubmitAnswer(`${gridRows}x${gridCols}`)}
          className="w-full min-h-[50px] rounded-full bg-[#111827] hover:bg-[#1F2937] text-white font-display text-base font-bold transition-colors cursor-pointer disabled:opacity-50"
        >
          Vérifier
        </button>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // E. MANIPULATION: DIVISION (Distribute items equally across baskets)
  // ---------------------------------------------------------------------------
  if (exercise.type === 'manipulate-division') {
    const emoji = exercise.manipulation?.emoji ?? '🍪';
    const distributed = basketCounts.reduce((acc, n) => acc + n, 0);
    const remaining = totalDivItems - distributed;
    const allEqual =
      remaining === 0 && basketCounts.every((c) => c === basketCounts[0]);

    const addToBasket = (idx: number) => {
      if (disabled || remaining <= 0) return;
      onTapSound();
      setBasketCounts((prev) => prev.map((v, i) => (i === idx ? v + 1 : v)));
    };

    return (
      <div className="space-y-4">
        <div className="rounded-2xl bg-[#F7F8FA] border border-[#E5E7EB] p-4 space-y-3">
          {/* Tray of remaining items */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-[#6B7280]">
              <span>À distribuer</span>
              <span className="tabular-nums text-[#111827]">
                {remaining} restant{remaining > 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-1.5 min-h-[30px]">
              {Array.from({ length: remaining }, (_, i) => (
                <span key={i} className="text-xl leading-none">
                  {emoji}
                </span>
              ))}
              {remaining === 0 && (
                <span className="text-xs font-bold text-[#15803D]">
                  Tout est distribué !
                </span>
              )}
            </div>
          </div>

          {/* Target Baskets */}
          <div
            className={`grid gap-2 ${
              basketCount <= 2
                ? 'grid-cols-2'
                : basketCount === 3
                ? 'grid-cols-3'
                : 'grid-cols-2'
            }`}
          >
            {basketCounts.map((count, idx) => (
              <button
                key={idx}
                type="button"
                disabled={disabled || remaining <= 0}
                onClick={() => addToBasket(idx)}
                className={`min-h-[82px] rounded-xl border p-2.5 flex flex-col items-center justify-between gap-1.5 transition-all ${
                  remaining > 0
                    ? 'bg-white border-[#D1D5DB] hover:border-[#22C55E] cursor-pointer active:scale-[0.97]'
                    : 'bg-white border-[#E5E7EB]'
                }`}
              >
                <div className="flex flex-wrap justify-center gap-1">
                  {Array.from({ length: count }, (_, i) => (
                    <span key={i} className="text-lg leading-none">
                      {emoji}
                    </span>
                  ))}
                  {count === 0 && (
                    <span className="text-[11px] font-semibold text-[#9CA3AF]">
                      + Ajouter
                    </span>
                  )}
                </div>
                <span className="text-xs font-bold text-[#374151] tabular-nums">
                  Panier {idx + 1} : {count}
                </span>
              </button>
            ))}
          </div>

          {!disabled && distributed > 0 && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setBasketCounts(Array.from({ length: basketCount }, () => 0))}
                className="inline-flex min-h-[44px] items-center gap-1 text-xs font-bold text-[#6B7280] hover:text-[#111827] cursor-pointer"
              >
                <LottieIcon animation="refresh" size={18} tone="ink" />
                <span>Recommencer</span>
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          disabled={disabled || remaining > 0}
          onClick={() => onSubmitAnswer(allEqual ? String(basketCounts[0]) : 'inegal')}
          className={`w-full min-h-[50px] rounded-full font-display text-base font-bold transition-colors ${
            disabled || remaining > 0
              ? 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
              : 'bg-[#111827] hover:bg-[#1F2937] text-white cursor-pointer'
          }`}
        >
          Vérifier
        </button>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // F. MANIPULATION: GÉOMÉTRIE (Interactive SVG Side Counter & Right-Angle Marker)
  // ---------------------------------------------------------------------------
  if (exercise.type === 'manipulate-geometrie' && exercise.manipulation?.geometryTarget) {
    const task = exercise.manipulation.geometryTask ?? 'count-sides';
    const target = exercise.manipulation.geometryTarget;

    if (task === 'count-sides') {
      // Pentagon vertices in 260x180
      const pts: [number, number][] = [
        [130, 20],
        [210, 74],
        [180, 156],
        [80, 156],
        [50, 74],
      ];

      const toggleSide = (idx: number) => {
        if (disabled) return;
        onTapSound();
        setActivatedSides((prev) =>
          prev.includes(idx) ? prev.filter((x) => x !== idx) : [...prev, idx]
        );
      };

      return (
        <div className="space-y-4">
          <div className="rounded-2xl bg-[#F7F8FA] border border-[#E5E7EB] p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#4B5563]">
              <span>Touche chaque côté de la figure</span>
              <span className="tabular-nums text-[#15803D]">
                Côtés allumés : {activatedSides.length}/{pts.length}
              </span>
            </div>

            <svg viewBox="0 0 260 176" className="w-full max-w-[260px] mx-auto h-[168px]" fill="none">
              <polygon
                points={pts.map(([x, y]) => `${x},${y}`).join(' ')}
                fill="#FFFFFF"
                stroke="#E5E7EB"
                strokeWidth="2"
              />
              {pts.map((p1, idx) => {
                const p2 = pts[(idx + 1) % pts.length];
                const active = activatedSides.includes(idx);
                const mx = (p1[0] + p2[0]) / 2;
                const my = (p1[1] + p2[1]) / 2;
                return (
                  <g key={idx}>
                    <line
                      x1={p1[0]}
                      y1={p1[1]}
                      x2={p2[0]}
                      y2={p2[1]}
                      stroke={active ? '#22C55E' : '#9CA3AF'}
                      strokeWidth={active ? 6 : 3.5}
                      strokeLinecap="round"
                    />
                    {/* Wide invisible touch target */}
                    <line
                      x1={p1[0]}
                      y1={p1[1]}
                      x2={p2[0]}
                      y2={p2[1]}
                      stroke="transparent"
                      strokeWidth="26"
                      className="cursor-pointer"
                      onClick={() => toggleSide(idx)}
                    />
                    {active && (
                      <g transform={`translate(${mx},${my})`}>
                        <circle r="10" fill="#22C55E" />
                        <text
                          textAnchor="middle"
                          dy="4"
                          fill="#FFFFFF"
                          fontSize="11"
                          fontWeight="bold"
                        >
                          {activatedSides.indexOf(idx) + 1}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
              {pts.map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r="5" fill="#111827" />
              ))}
            </svg>
          </div>

          <button
            type="button"
            disabled={disabled || activatedSides.length === 0}
            onClick={() => onSubmitAnswer(String(activatedSides.length))}
            className={`w-full min-h-[50px] rounded-full font-display text-base font-bold transition-colors ${
              disabled || activatedSides.length === 0
                ? 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
                : 'bg-[#111827] hover:bg-[#1F2937] text-white cursor-pointer'
            }`}
          >
            Vérifier
          </button>
        </div>
      );
    }

    // mark-right-angles on square (4 vertices)
    const sqPts: [number, number][] = [
      [75, 28],
      [185, 28],
      [185, 138],
      [75, 138],
    ];
    const toggleCorner = (idx: number) => {
      if (disabled) return;
      onTapSound();
      setMarkedCorners((prev) =>
        prev.includes(idx) ? prev.filter((x) => x !== idx) : [...prev, idx]
      );
    };

    return (
      <div className="space-y-4">
        <div className="rounded-2xl bg-[#F7F8FA] border border-[#E5E7EB] p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#4B5563]">
            <span>Touche les 4 sommets du {target.label.toLowerCase()}</span>
            <span className="tabular-nums text-[#15803D]">
              Angles droits : {markedCorners.length}/4
            </span>
          </div>

          <svg viewBox="0 0 260 166" className="w-full max-w-[260px] mx-auto h-[160px]" fill="none">
            <rect
              x="75"
              y="28"
              width="110"
              height="110"
              fill="#FFFFFF"
              stroke="#111827"
              strokeWidth="3.5"
            />
            {sqPts.map(([vx, vy], idx) => {
              const marked = markedCorners.includes(idx);
              const dx = vx < 130 ? 18 : -18;
              const dy = vy < 83 ? 18 : -18;
              return (
                <g key={idx}>
                  {marked && (
                    <path
                      d={`M ${vx + dx} ${vy} L ${vx + dx} ${vy + dy} L ${vx} ${vy + dy}`}
                      stroke="#22C55E"
                      strokeWidth="3"
                      fill="#DCFCE7"
                    />
                  )}
                  <circle
                    cx={vx}
                    cy={vy}
                    r="11"
                    fill={marked ? '#22C55E' : '#FFFFFF'}
                    stroke={marked ? '#15803D' : '#111827'}
                    strokeWidth="2.5"
                    className="cursor-pointer"
                    onClick={() => toggleCorner(idx)}
                  />
                  {/* Generous invisible hit circle */}
                  <circle
                    cx={vx}
                    cy={vy}
                    r="24"
                    fill="transparent"
                    className="cursor-pointer"
                    onClick={() => toggleCorner(idx)}
                  />
                </g>
              );
            })}
          </svg>
        </div>

        <button
          type="button"
          disabled={disabled || markedCorners.length === 0}
          onClick={() => onSubmitAnswer(String(markedCorners.length))}
          className={`w-full min-h-[50px] rounded-full font-display text-base font-bold transition-colors ${
            disabled || markedCorners.length === 0
              ? 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
              : 'bg-[#111827] hover:bg-[#1F2937] text-white cursor-pointer'
          }`}
        >
          Vérifier
        </button>
      </div>
    );
  }

  return null;
};
