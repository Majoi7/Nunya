import React, { useState } from 'react';
import { QrCode, Sparkles } from 'lucide-react';
import { LottieIcon } from './LottieIcon';
import { MascotController } from './mascot/MascotController';
import { BADGE_DEFINITIONS } from '../data/rewards';
import { usePWAInstall } from '../hooks/usePWAInstall';
import type { GradeLevel, MathTopic, UserState } from '../types/math';

interface ProfileTabProps {
  userState: UserState;
  onChangeGrade: (grade: GradeLevel) => void;
  onToggleSound: () => void;
  onToggleDemoMode: () => void;
  onResetProgress: () => void;
  onOpenQRModal: () => void;
}

const TOPIC_LABELS: Record<MathTopic, string> = {
  addition: 'Addition & Assemblage',
  soustraction: 'Soustraction & Écart',
  multiplication: 'Multiplication en Grilles',
  division: 'Partage & Division',
  geometrie: 'Découverte de la Géométrie',
};

const GRADES: GradeLevel[] = ['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6e'];

export const ProfileTab: React.FC<ProfileTabProps> = ({
  userState,
  onChangeGrade,
  onToggleSound,
  onToggleDemoMode,
  onResetProgress,
  onOpenQRModal,
}) => {
  const [confirmReset, setConfirmReset] = useState(false);
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  return (
    <div className="px-4 py-4 space-y-5 bg-white">
      {/* Hero Profile Card */}
      <div className="rounded-3xl bg-[#F7F8FA] border border-[#E5E7EB] p-4 flex items-center gap-3.5">
        <MascotController character="turkey" animationState="idle" size={76} className="shrink-0" />
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-2xl font-bold text-[#111827] truncate">
            {userState.profile.name || 'Explorateur'}
          </h1>
          <div className="text-xs font-bold text-[#6B7280] mt-0.5">
            Classe : <span className="text-[#111827]">{userState.profile.grade}</span> ·{' '}
            <span className="tabular-nums">{userState.earnedBadges.length}</span>{' '}
            {userState.earnedBadges.length > 1 ? 'badges' : 'badge'}
          </div>
        </div>
      </div>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="rounded-2xl bg-[#F7F8FA] border border-[#E5E7EB] p-3 text-center">
          <div className="font-display text-2xl font-bold text-[#15803D] tabular-nums">
            {userState.totalLessonsCompleted}
          </div>
          <div className="text-[11px] font-bold text-[#6B7280] mt-0.5">Notions</div>
        </div>
        <div className="rounded-2xl bg-[#F7F8FA] border border-[#E5E7EB] p-3 text-center">
          <div className="font-display text-2xl font-bold text-[#111827] tabular-nums">
            {userState.xp}
          </div>
          <div className="text-[11px] font-bold text-[#6B7280] mt-0.5">XP total</div>
        </div>
        <div className="rounded-2xl bg-[#F7F8FA] border border-[#E5E7EB] p-3 text-center">
          <div className="font-display text-2xl font-bold text-[#D97706] tabular-nums">
            {userState.streak} j
          </div>
          <div className="text-[11px] font-bold text-[#6B7280] mt-0.5">Série</div>
        </div>
      </div>

      {/* Mastery by Domain */}
      <section className="rounded-3xl bg-[#F7F8FA] border border-[#E5E7EB] p-4 space-y-3">
        <h2 className="font-display text-base font-bold text-[#111827]">
          Progression par domaine
        </h2>
        <div className="space-y-2.5">
          {(Object.keys(TOPIC_LABELS) as MathTopic[]).map((topic) => {
            const stat = userState.topicStats[topic] ?? { correct: 0, total: 0 };
            const pct = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
            return (
              <div key={topic} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#1F2937]">{TOPIC_LABELS[topic]}</span>
                  <span className="text-[#6B7280] tabular-nums">
                    {stat.total > 0 ? `${pct}% (${stat.correct}/${stat.total})` : 'À découvrir'}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[#E5E7EB] overflow-hidden">
                  <div
                    style={{ width: `${pct}%` }}
                    className="h-full rounded-full bg-[#22C55E] transition-all duration-300"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Badges */}
      <section className="rounded-3xl bg-[#F7F8FA] border border-[#E5E7EB] p-4 space-y-3">
        <h2 className="font-display text-base font-bold text-[#111827]">Badges obtenus</h2>
        <div className="flex flex-wrap gap-2">
          {BADGE_DEFINITIONS.map((badge) => {
            const unlocked = userState.earnedBadges.includes(badge.id);
            return (
              <div
                key={badge.id}
                title={badge.description}
                className={`px-3 py-1.5 rounded-full border flex items-center gap-1.5 text-xs font-bold ${
                  unlocked
                    ? 'bg-white border-[#86EFAC] text-[#111827]'
                    : 'bg-[#F3F4F6] border-[#E5E7EB] text-[#9CA3AF]'
                }`}
              >
                <span className={unlocked ? '' : 'grayscale opacity-50'}>{badge.emoji}</span>
                <span>{badge.name}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Grade Switcher */}
      <section className="rounded-3xl bg-[#F7F8FA] border border-[#E5E7EB] p-4 space-y-3">
        <h2 className="font-display text-base font-bold text-[#111827]">Changer de classe</h2>
        <div className="grid grid-cols-3 min-[390px]:grid-cols-6 gap-1.5">
          {GRADES.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => onChangeGrade(g)}
              className={`min-h-[44px] rounded-xl font-display text-xs font-bold border-2 transition-all cursor-pointer ${
                userState.profile.grade === g
                  ? 'border-[#111827] bg-[#111827] text-white'
                  : 'border-[#E5E7EB] bg-white text-[#4B5563]'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </section>

      {/* Settings & Demo Mode */}
      <section className="space-y-2.5 pb-4">
        <button
          type="button"
          onClick={onToggleDemoMode}
          className="w-full min-h-[48px] rounded-2xl bg-[#F7F8FA] border border-[#E5E7EB] px-4 flex items-center justify-between font-bold text-sm text-[#111827] cursor-pointer"
        >
          <span className="flex items-center gap-2.5">
            <LottieIcon animation="book" size={24} tone="success" trigger="manual" replayKey={String(userState.demoMode)} fallback={<Sparkles className="w-5 h-5 text-[#16A34A]" />} />
            <span>Mode démo (toutes les notions)</span>
          </span>
          <span className="text-xs font-extrabold text-[#15803D]">
            {userState.demoMode ? 'Activé' : 'Désactivé'}
          </span>
        </button>

        <button
          type="button"
          onClick={onToggleSound}
          className="w-full min-h-[48px] rounded-2xl bg-[#F7F8FA] border border-[#E5E7EB] px-4 flex items-center justify-between font-bold text-sm text-[#111827] cursor-pointer"
        >
          <span className="flex items-center gap-2.5">
            <LottieIcon
              animation={userState.soundEnabled ? 'soundOn' : 'soundOff'}
              size={24}
              tone={userState.soundEnabled ? 'success' : 'muted'}
              trigger="mount"
              replayKey={String(userState.soundEnabled)}
            />
            <span>Effets sonores</span>
          </span>
          <span className="text-xs font-extrabold text-[#6B7280]">
            {userState.soundEnabled ? 'Activés' : 'Coupés'}
          </span>
        </button>

        {!isInstalled && (isInstallable || isIOS) && (
          <button
            type="button"
            onClick={() => (isInstallable ? install() : setShowIOSGuide(true))}
            className="w-full min-h-[48px] rounded-full bg-[#111827] text-white px-4 flex items-center justify-center gap-2 font-display text-sm font-bold cursor-pointer"
          >
            <LottieIcon animation="download" size={20} tone="inverse" />
            <span>Installer sur mon téléphone</span>
          </button>
        )}

        <button
          type="button"
          onClick={onOpenQRModal}
          className="w-full min-h-[48px] rounded-2xl bg-[#F7F8FA] border border-[#E5E7EB] px-4 flex items-center justify-between font-bold text-sm text-[#111827] cursor-pointer"
        >
          <span className="flex items-center gap-2.5">
            <QrCode className="w-5 h-5 text-[#111827]" />
            <span>Tester sur smartphone (QR Code)</span>
          </span>
          <span className="text-xs font-extrabold text-[#16A34A]">Ouvrir</span>
        </button>

        {!confirmReset ? (
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="w-full min-h-[46px] rounded-2xl bg-[#F3F4F6] text-[#4B5563] px-4 flex items-center justify-center gap-2 font-bold text-xs cursor-pointer hover:bg-[#E5E7EB]"
          >
            <LottieIcon animation="refresh" size={20} tone="ink" />
            <span>Réinitialiser la progression</span>
          </button>
        ) : (
          <div className="rounded-2xl bg-[#FEF2F2] border border-[#FECACA] p-3 space-y-2">
            <p className="text-xs font-bold text-[#991B1B] text-center">
              Tout effacer et recommencer depuis l’onboarding ?
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="min-h-[44px] rounded-full bg-white border border-[#E5E7EB] text-xs font-bold text-[#374151] cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmReset(false);
                  onResetProgress();
                }}
                className="min-h-[44px] rounded-full bg-[#EF4444] text-white text-xs font-bold cursor-pointer"
              >
                Oui, réinitialiser
              </button>
            </div>
          </div>
        )}
      </section>

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-xl space-y-3">
            <h3 className="font-display text-lg font-bold text-[#111827]">
              Installer sur iPhone / iPad
            </h3>
            <p className="text-sm font-semibold text-[#4B5563]">
              1. Touche le bouton <strong>Partager</strong> en bas de Safari.<br />
              2. Choisis <strong>Sur l’écran d’accueil</strong>.
            </p>
            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="w-full min-h-[44px] rounded-full bg-[#111827] text-white font-display font-bold text-sm cursor-pointer"
            >
              Compris
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
