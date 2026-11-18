import React, { useState } from 'react';
import { motion } from 'motion/react';
import type { BarSegment, GeometrySpec, VisualModel } from '../types/math';

interface VisualStageProps {
  visual?: VisualModel;
  interactiveCount?: boolean;
  onTapItem?: () => void;
  selectedCompare?: string | null;
}

const BAR_COLOR_CLASSES: Record<BarSegment['color'], string> = {
  emerald: 'bg-[#86EFAC] text-[#052E16] border-[#22C55E]',
  sky: 'bg-[#93C5FD] text-[#0F172A] border-[#3B82F6]',
  amber: 'bg-[#FCD34D] text-[#451A03] border-[#F59E0B]',
  violet: 'bg-[#C4B5FD] text-[#2E1065] border-[#8B5CF6]',
  slate: 'bg-[#E5E7EB] text-[#111827] border-[#D1D5DB]',
};

const GeometryDiagram: React.FC<{ spec: GeometrySpec }> = ({ spec }) => {
  // Coordinates inside viewBox="0 0 260 170"
  const shapes: Record<
    GeometrySpec['shape'],
    {
      points: [number, number][];
      rightAngleCorners: number[]; // indices of vertices with 90°
    }
  > = {
    triangle: {
      points: [
        [130, 24],
        [55, 142],
        [205, 142],
      ],
      rightAngleCorners: [],
    },
    'triangle-rectangle': {
      points: [
        [68, 28],
        [68, 142],
        [202, 142],
      ],
      rightAngleCorners: [1],
    },
    carre: {
      points: [
        [75, 30],
        [185, 30],
        [185, 140],
        [75, 140],
      ],
      rightAngleCorners: [0, 1, 2, 3],
    },
    rectangle: {
      points: [
        [45, 40],
        [215, 40],
        [215, 132],
        [45, 132],
      ],
      rightAngleCorners: [0, 1, 2, 3],
    },
    pentagone: {
      points: [
        [130, 20],
        [200, 70],
        [174, 144],
        [86, 144],
        [60, 70],
      ],
      rightAngleCorners: [],
    },
  };

  const geom = shapes[spec.shape];
  const pointsAttr = geom.points.map(([x, y]) => `${x},${y}`).join(' ');

  return (
    <div className="w-full rounded-2xl bg-[#F7F8FA] border border-[#E5E7EB] p-3 flex flex-col items-center">
      <svg viewBox="0 0 260 170" className="w-full max-w-[260px] h-[150px]" fill="none">
        {/* Polygon Fill & Crisp Stroke */}
        <polygon
          points={pointsAttr}
          fill="#ECFDF5"
          stroke="#111827"
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* Right angle square markers */}
        {spec.highlightMode === 'right-angles' &&
          geom.rightAngleCorners.map((idx) => {
            const [vx, vy] = geom.points[idx];
            const prev = geom.points[(idx - 1 + geom.points.length) % geom.points.length];
            const next = geom.points[(idx + 1) % geom.points.length];
            const dx1 = Math.sign(prev[0] - vx) * 14;
            const dy1 = Math.sign(prev[1] - vy) * 14;
            const dx2 = Math.sign(next[0] - vx) * 14;
            const dy2 = Math.sign(next[1] - vy) * 14;
            const pathD = `M ${vx + dx1} ${vy + dy1} L ${vx + dx1 + dx2} ${vy + dy1 + dy2} L ${vx + dx2} ${vy + dy2}`;
            return (
              <path
                key={idx}
                d={pathD}
                stroke="#EF4444"
                strokeWidth="2.5"
                fill="#FEE2E2"
                fillOpacity="0.6"
              />
            );
          })}

        {/* Highlighted Vertices */}
        {geom.points.map(([x, y], idx) => (
          <circle
            key={idx}
            cx={x}
            cy={y}
            r={spec.highlightMode === 'vertices' ? 6.5 : 4.5}
            fill={spec.highlightMode === 'vertices' ? '#22C55E' : '#111827'}
            stroke="#FFFFFF"
            strokeWidth="2"
          />
        ))}
      </svg>
      <div className="text-xs font-bold text-[#4B5563]">
        {spec.label} · {spec.sides} côtés · {spec.vertices} sommets
      </div>
    </div>
  );
};

export const VisualStage: React.FC<VisualStageProps> = ({
  visual,
  interactiveCount = false,
  onTapItem,
  selectedCompare,
}) => {
  const [countedIndices, setCountedIndices] = useState<number[]>([]);

  if (!visual) return null;

  if (visual.kind === 'geometry' && visual.geometry) {
    return <GeometryDiagram spec={visual.geometry} />;
  }

  if (visual.kind === 'objects' && visual.groups?.[0]) {
    const group = visual.groups[0];
    const items = Array.from({ length: group.count }, (_, i) => i);

    const toggleIndex = (idx: number) => {
      if (!interactiveCount) return;
      onTapItem?.();
      setCountedIndices((prev) =>
        prev.includes(idx) ? prev.filter((x) => x !== idx) : [...prev, idx]
      );
    };

    return (
      <div className="w-full rounded-2xl bg-[#F7F8FA] border border-[#E5E7EB] p-4">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {items.map((idx) => {
            const orderNum = countedIndices.indexOf(idx) + 1;
            const isCounted = orderNum > 0;
            return (
              <motion.button
                key={idx}
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleIndex(idx)}
                aria-label={`Objet ${idx + 1}`}
                className={`relative w-11 h-11 rounded-xl flex items-center justify-center text-2xl transition-all select-none ${
                  isCounted
                    ? 'bg-[#DCFCE7] border-2 border-[#22C55E]'
                    : 'bg-white border border-[#E5E7EB]'
                }`}
              >
                <span>{group.emoji}</span>
                {isCounted && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#22C55E] text-white text-[11px] font-bold flex items-center justify-center tabular-nums">
                    {orderNum}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
        {interactiveCount && (
          <p className="mt-2.5 text-center text-xs font-semibold text-[#6B7280] tabular-nums">
            {countedIndices.length > 0
              ? `Comptés : ${countedIndices.length}`
              : 'Touche les objets pour les compter un par un'}
          </p>
        )}
      </div>
    );
  }

  if (visual.kind === 'equation-objects' && visual.groups) {
    return (
      <div className="w-full rounded-2xl bg-[#F7F8FA] border border-[#E5E7EB] p-4 flex flex-wrap items-center justify-center gap-3">
        {visual.groups.map((group, gIdx) => {
          const total = group.count;
          const crossed = group.crossedOut ?? 0;
          return (
            <React.Fragment key={gIdx}>
              {gIdx > 0 && visual.operator && (
                <span className="font-display text-2xl font-bold text-[#111827] px-1">
                  {visual.operator}
                </span>
              )}
              <div className="bg-white border border-[#E5E7EB] rounded-xl p-3 flex flex-col items-center gap-1.5">
                <div className="flex flex-wrap justify-center gap-1.5 max-w-[150px]">
                  {Array.from({ length: total }, (_, idx) => {
                    const isCrossed = idx >= total - crossed;
                    return (
                      <span
                        key={idx}
                        className={`text-2xl leading-none relative transition-opacity ${
                          isCrossed ? 'opacity-30' : 'opacity-100'
                        }`}
                      >
                        {group.emoji}
                        {isCrossed && (
                          <span
                            aria-hidden="true"
                            className="absolute inset-0 flex items-center justify-center text-[#EF4444] font-bold text-xl"
                          >
                            ✕
                          </span>
                        )}
                      </span>
                    );
                  })}
                </div>
                {group.label && (
                  <span className="text-xs font-bold text-[#6B7280]">{group.label}</span>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  if (visual.kind === 'grid' && visual.rows && visual.cols) {
    return (
      <div className="w-full rounded-2xl bg-[#F7F8FA] border border-[#E5E7EB] p-4 flex flex-col items-center gap-2">
        <div className="flex flex-col gap-1.5 bg-white p-3 rounded-xl border border-[#E5E7EB]">
          {Array.from({ length: visual.rows }, (_, r) => (
            <div key={r} className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#9CA3AF] w-4 text-right tabular-nums">
                {r + 1}
              </span>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: visual.cols! }, (_, c) => (
                  <motion.span
                    key={c}
                    initial={{ scale: 0.75, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: (r * visual.cols! + c) * 0.015 }}
                    className="text-xl leading-none"
                  >
                    {visual.dotEmoji || '🔵'}
                  </motion.span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <span className="text-xs font-bold text-[#4B5563] tabular-nums">
          {visual.rows} rangées × {visual.cols} colonnes
        </span>
      </div>
    );
  }

  if (visual.kind === 'bars') {
    return (
      <div className="w-full rounded-2xl bg-[#F7F8FA] border border-[#E5E7EB] p-4 space-y-2.5">
        {visual.topBar && (
          <div className="flex items-stretch gap-1 w-full h-10">
            {visual.topBar.map((seg, i) => (
              <div
                key={i}
                style={{ flex: seg.flex ?? 1 }}
                className={`rounded-md border-[1.5px] flex items-center justify-center font-display font-bold text-sm px-2 tabular-nums ${BAR_COLOR_CLASSES[seg.color]}`}
              >
                {seg.label}
              </div>
            ))}
          </div>
        )}
        {visual.bottomBar && (
          <div className="flex items-stretch gap-1 w-full h-10">
            {visual.bottomBar.map((seg, i) => (
              <div
                key={i}
                style={{ flex: seg.flex ?? 1 }}
                className={`rounded-md border-[1.5px] flex items-center justify-center font-display font-bold text-sm px-2 tabular-nums ${BAR_COLOR_CLASSES[seg.color]}`}
              >
                {seg.label}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (visual.kind === 'groups' && visual.groups) {
    return (
      <div className="w-full rounded-2xl bg-[#F7F8FA] border border-[#E5E7EB] p-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {visual.groups.slice(0, 6).map((group, idx) => (
            <div
              key={idx}
              className="bg-white border border-[#E5E7EB] rounded-xl p-2.5 flex flex-col items-center gap-1"
            >
              <div className="flex flex-wrap justify-center gap-1">
                {Array.from({ length: Math.min(group.count, 10) }, (_, i) => (
                  <span key={i} className="text-lg leading-none">
                    {group.emoji}
                  </span>
                ))}
                {group.count > 10 && (
                  <span className="text-xs font-bold text-[#4B5563] tabular-nums">
                    ×{group.count}
                  </span>
                )}
              </div>
              {group.label && (
                <span className="text-[11px] font-bold text-[#6B7280]">{group.label}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (visual.kind === 'scale') {
    return (
      <div className="w-full rounded-2xl bg-[#F7F8FA] border border-[#E5E7EB] p-4 flex items-center justify-center gap-3">
        <div className="flex-1 bg-white border border-[#E5E7EB] rounded-xl py-4 px-3 text-center font-display text-2xl font-bold text-[#111827] tabular-nums">
          {visual.leftExpr}
        </div>
        <div
          className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center font-display text-2xl font-bold transition-colors ${
            selectedCompare
              ? 'bg-[#DCFCE7] border-[#22C55E] text-[#15803D]'
              : 'bg-white border-[#D1D5DB] text-[#6B7280]'
          }`}
        >
          {selectedCompare || '?'}
        </div>
        <div className="flex-1 bg-white border border-[#E5E7EB] rounded-xl py-4 px-3 text-center font-display text-2xl font-bold text-[#111827] tabular-nums">
          {visual.rightExpr}
        </div>
      </div>
    );
  }

  return null;
};
