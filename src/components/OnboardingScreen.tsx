import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Compass, Hand, Sparkles, Zap } from 'lucide-react';
import { LottieIcon } from './LottieIcon';
import { MascotController } from './mascot/MascotController';
import type { GradeLevel } from '../types/math';

interface WelcomeScreenProps {
  onStart: () => void;
  onQuickDemo: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, onQuickDemo }) => {
  return (
    <div className="flex flex-col justify-between h-full px-6 py-7 bg-white overflow-y-auto no-scrollbar">
      {/* Brilliant-inspired clean wordmark */}
      <div className="pt-2 flex items-center justify-center">
        <span className="font-display text-2xl font-bold tracking-tight text-[#111827] flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-[#22C55E] text-white flex items-center justify-center">
            <LottieIcon animation="xp" size={16} tone="inverse" fallback={<Zap className="w-4 h-4 fill-white" />} />
          </span>
          <span>LumiMath</span>
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center text-center space-y-5 my-auto py-4"
      >
        <div className="relative flex items-center justify-center pt-5">
          <MascotController character="turkey" animationState="happy" size={160} />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.18, delay: 0.05 }}
            className="absolute -top-1 -right-12 bg-[#F7F8FA] border border-[#E5E7EB] rounded-2xl px-3 py-1.5 shadow-xs z-10 whitespace-nowrap"
          >
            <span className="text-xs font-extrabold text-[#111827]">Prêt à explorer ?</span>
          </motion.div>
        </div>

        <div className="space-y-2 max-w-xs">
          <h1 className="font-display text-[26px] font-bold text-[#111827] leading-tight">
            Comprendre les maths en manipulant
          </h1>
          <p className="text-sm font-semibold text-[#4B5563] leading-relaxed">
            Des leçons interactives courtes pour observer, tester avec les doigts et maîtriser les
            notions du CP à la 6e.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2.5 w-full pt-1">
          <div className="bg-[#F7F8FA] border border-[#E5E7EB] rounded-2xl p-3 flex flex-col items-center gap-1.5">
            <Compass className="w-5 h-5 text-[#22C55E]" />
            <div className="text-[11px] font-bold text-[#111827] leading-tight">
              Découverte visuelle
            </div>
          </div>
          <div className="bg-[#F7F8FA] border border-[#E5E7EB] rounded-2xl p-3 flex flex-col items-center gap-1.5">
            <Hand className="w-5 h-5 text-[#3B82F6]" />
            <div className="text-[11px] font-bold text-[#111827] leading-tight">
              Manipulation directe
            </div>
          </div>
          <div className="bg-[#F7F8FA] border border-[#E5E7EB] rounded-2xl p-3 flex flex-col items-center gap-1.5">
            <LottieIcon animation="book" size={24} tone="xp" fallback={<Sparkles className="w-5 h-5 text-[#F59E0B]" />} />
            <div className="text-[11px] font-bold text-[#111827] leading-tight">
              5 chapitres clés
            </div>
          </div>
        </div>
      </motion.div>

      <div className="space-y-2.5 pt-2 pb-safe">
        <button
          type="button"
          onClick={onStart}
          className="w-full min-h-[52px] rounded-full bg-[#111827] hover:bg-[#1F2937] text-white font-display text-base font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <span>Commencer</span>
          <LottieIcon animation="arrowRight" size={20} tone="inverse" />
        </button>

        <button
          type="button"
          onClick={onQuickDemo}
          className="w-full min-h-[44px] rounded-full bg-[#F7F8FA] hover:bg-[#E5E7EB] text-[#374151] font-display text-sm font-bold transition-colors cursor-pointer"
        >
          Essayer directement (Mode démo)
        </button>
      </div>
    </div>
  );
};

interface ProfileSetupScreenProps {
  initialName: string;
  initialGrade: GradeLevel;
  onComplete: (name: string, grade: GradeLevel) => void;
}

const GRADES: { value: GradeLevel; ageLabel: string }[] = [
  { value: 'CP', ageLabel: '6-7 ans' },
  { value: 'CE1', ageLabel: '7-8 ans' },
  { value: 'CE2', ageLabel: '8-9 ans' },
  { value: 'CM1', ageLabel: '9-10 ans' },
  { value: 'CM2', ageLabel: '10-11 ans' },
  { value: '6e', ageLabel: '11-12 ans' },
];

export const ProfileSetupScreen: React.FC<ProfileSetupScreenProps> = ({
  initialName,
  initialGrade,
  onComplete,
}) => {
  const [name, setName] = useState(initialName);
  const [grade, setGrade] = useState<GradeLevel>(initialGrade || 'CE2');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = name.trim();
    if (!cleaned) {
      setError('Écris ton prénom pour personnaliser ton parcours !');
      return;
    }
    setError('');
    onComplete(cleaned, grade);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col justify-between h-full px-6 py-6 bg-white overflow-y-auto no-scrollbar"
    >
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <MascotController character="turkey" animationState="encouraging" size={84} />
          <div>
            <h1 className="font-display text-2xl font-bold text-[#111827]">
              Ton espace personnel
            </h1>
            <p className="text-sm font-semibold text-[#6B7280]">
              Les manipulations s’adaptent automatiquement à ta classe.
            </p>
          </div>
        </div>

        {/* Prénom */}
        <div>
          <label
            htmlFor="child-name-input"
            className="block font-display text-sm font-bold text-[#111827] mb-2"
          >
            Quel est ton prénom ?
          </label>
          <input
            id="child-name-input"
            type="text"
            maxLength={18}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError('');
            }}
            placeholder="Ex : Léo, Maya, Sami..."
            className="w-full min-h-[50px] px-4 rounded-2xl bg-[#F7F8FA] border border-[#D1D5DB] focus:border-[#111827] focus:bg-white focus:outline-none text-base font-bold text-[#111827] placeholder:text-[#9CA3AF]"
          />
          {error && (
            <p className="mt-1.5 text-xs font-bold text-[#DC2626]" role="alert">
              {error}
            </p>
          )}
        </div>

        {/* Niveau scolaire */}
        <div>
          <span className="block font-display text-sm font-bold text-[#111827] mb-2">
            Ta classe cette année
          </span>
          <div className="grid grid-cols-3 gap-2.5">
            {GRADES.map((g) => {
              const selected = grade === g.value;
              return (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setGrade(g.value)}
                  aria-pressed={selected}
                  className={`min-h-[56px] rounded-2xl border-2 px-2 py-2 flex flex-col items-center justify-center transition-all cursor-pointer ${
                    selected
                      ? 'border-[#22C55E] bg-[#DCFCE7]/60 text-[#111827]'
                      : 'border-[#E5E7EB] bg-white text-[#374151] hover:border-[#9CA3AF]'
                  }`}
                >
                  <span className="font-display text-lg font-bold leading-none">{g.value}</span>
                  <span className="text-[11px] font-semibold text-[#6B7280] mt-0.5">
                    {g.ageLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="pt-6 pb-safe">
        <button
          type="submit"
          className="w-full min-h-[52px] rounded-full bg-[#111827] hover:bg-[#1F2937] text-white font-display text-base font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <span>C’est parti</span>
          <LottieIcon animation="arrowRight" size={20} tone="inverse" />
        </button>
      </div>
    </form>
  );
};
