import React, { useEffect, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { BookOpen, Home, Target, User, Zap } from 'lucide-react';
import { MobileFrameShell } from './components/MobileFrameShell';
import { LottieIcon } from './components/LottieIcon';
import { ProfileSetupScreen, WelcomeScreen } from './components/OnboardingScreen';
import { HomeScreen } from './components/HomeScreen';
import { CurriculumScreen } from './components/CurriculumScreen';
import { ChallengesTab } from './components/ChallengesTab';
import { ProfileTab } from './components/ProfileTab';
import { LessonScreen } from './components/LessonScreen';
import { ErrorReviewScreen, VictoryScreen } from './components/VictoryScreen';
import { QRShareModal } from './components/QRShareModal';
import { getExercisesForNotion } from './data/curriculum';
import { useOnlineStatus } from './hooks/usePWAInstall';
import { playSound } from './utils/sound';
import {
  STORAGE_KEY,
  applyLessonCompletion,
  claimChallengeReward,
  computeGlobalProgressPercent,
  createInitialUserState,
  getNextAvailableNotion,
  syncDailyRollover,
} from './utils/gameLogic';
import type {
  AppScreen,
  DailyChallenge,
  GradeLevel,
  MainTab,
  MistakeRecord,
  NotionLesson,
  UserState,
} from './types/math';

function loadUserState(): UserState {
  const initial = createInitialUserState();
  if (typeof window === 'undefined') return initial;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<UserState>;
      const merged: UserState = {
        ...initial,
        ...parsed,
        profile: { ...initial.profile, ...(parsed.profile ?? {}) },
        lessonProgress: { ...initial.lessonProgress, ...(parsed.lessonProgress ?? {}) },
        topicStats: { ...initial.topicStats, ...(parsed.topicStats ?? {}) },
      };
      return syncDailyRollover(merged);
    }
  } catch {
    // Fallback to initial state
  }

  const params = new URLSearchParams(window.location.search);
  if (params.get('autostart') === '1') {
    return {
      ...initial,
      hasOnboarded: true,
      profile: { ...initial.profile, name: 'Léo' },
    };
  }

  return initial;
}

interface ResultSummary {
  notion: NotionLesson;
  correctCount: number;
  totalQuestions: number;
  earnedStars: number;
  earnedXp: number;
  accuracy: number;
  newlyEarnedBadges: string[];
  mistakes: MistakeRecord[];
}

export default function App() {
  const [userState, setUserState] = useState<UserState>(() => loadUserState());
  const [onboardingStep, setOnboardingStep] = useState<'welcome' | 'setup'>('welcome');
  const [screen, setScreen] = useState<AppScreen>(() =>
    userState.hasOnboarded ? 'main' : 'onboarding'
  );
  const [activeTab, setActiveTab] = useState<MainTab>('home');
  const [activeNotion, setActiveNotion] = useState<NotionLesson | null>(null);
  const [resultSummary, setResultSummary] = useState<ResultSummary | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  const [geminiAvailable, setGeminiAvailable] = useState(false);
  const [publicUrl, setPublicUrl] = useState<string | null>(null);

  const isOnline = useOnlineStatus();

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(userState));
    } catch {
      // Ignore storage quota errors
    }
  }, [userState]);

  useEffect(() => {
    fetch('/api/config')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setGeminiAvailable(Boolean(data.hasGeminiKey));
          setPublicUrl(data.publicUrl ?? null);
        }
      })
      .catch(() => {
        // Offline or static hosting
      });
  }, []);

  const handleCompleteProfile = (name: string, grade: GradeLevel) => {
    playSound('correct', userState.soundEnabled);
    setUserState((prev) => ({
      ...prev,
      hasOnboarded: true,
      profile: {
        ...prev.profile,
        name,
        grade,
      },
    }));
    setScreen('main');
    setActiveTab('home');
  };

  const handleQuickDemo = () => {
    playSound('correct', userState.soundEnabled);
    setUserState((prev) => ({
      ...prev,
      hasOnboarded: true,
      demoMode: true,
      profile: {
        name: prev.profile.name || 'Léo',
        grade: prev.profile.grade || 'CE2',
      },
    }));
    setScreen('main');
    setActiveTab('home');
  };

  const handleStartNotion = (notion: NotionLesson) => {
    playSound('tap', userState.soundEnabled);
    setActiveNotion(notion);
    setScreen('lesson');
  };

  const handleLessonComplete = (result: {
    correctCount: number;
    totalQuestions: number;
    mistakes: MistakeRecord[];
  }) => {
    if (!activeNotion) return;
    const outcome = applyLessonCompletion(userState, {
      notionId: activeNotion.id,
      topic: activeNotion.topic,
      correctCount: result.correctCount,
      totalQuestions: result.totalQuestions,
      xpPerCorrect: 15,
      completionBonusXp: activeNotion.xpReward,
    });

    setUserState(outcome.nextState);
    setResultSummary({
      notion: activeNotion,
      correctCount: result.correctCount,
      totalQuestions: result.totalQuestions,
      earnedStars: outcome.earnedStars,
      earnedXp: outcome.earnedXp,
      accuracy: outcome.accuracy,
      newlyEarnedBadges: outcome.newlyEarnedBadges,
      mistakes: result.mistakes,
    });
    setScreen('result');
  };

  const handleClaimChallenge = (challenge: DailyChallenge) => {
    playSound('coin', userState.soundEnabled);
    setUserState((prev) => claimChallengeReward(prev, challenge));
  };

  const handleResetProgress = () => {
    const fresh = createInitialUserState();
    setUserState(fresh);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
    setActiveTab('home');
    setOnboardingStep('welcome');
    setScreen('onboarding');
  };

  const currentExercises = activeNotion
    ? getExercisesForNotion(activeNotion.id, userState.profile.grade)
    : [];

  const globalPercent = computeGlobalProgressPercent(userState.lessonProgress);
  const nextRecommended = getNextAvailableNotion(userState.lessonProgress, userState.demoMode);

  return (
    <MotionConfig reducedMotion="user">
      <MobileFrameShell publicUrl={publicUrl} onOpenQRModal={() => setQrModalOpen(true)}>
        {!isOnline && (
          <div className="bg-[#F59E0B] text-[#111827] text-[11px] font-bold text-center py-1 px-3 shrink-0">
            Mode hors-ligne actif — Tes progrès restent enregistrés
          </div>
        )}

        <AnimatePresence mode="wait">
          {screen === 'onboarding' && onboardingStep === 'welcome' && (
            <motion.div
              key="onboarding-welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <WelcomeScreen
                onStart={() => {
                  playSound('tap', userState.soundEnabled);
                  setOnboardingStep('setup');
                }}
                onQuickDemo={handleQuickDemo}
              />
            </motion.div>
          )}

          {screen === 'onboarding' && onboardingStep === 'setup' && (
            <motion.div
              key="onboarding-setup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              <ProfileSetupScreen
                initialName={userState.profile.name}
                initialGrade={userState.profile.grade}
                onComplete={handleCompleteProfile}
              />
            </motion.div>
          )}

          {screen === 'main' && (
            <motion.div
              key="main"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full bg-white"
            >
              {/* Clean Brilliant Mobile Top Bar */}
              <header className="bg-white border-b border-[#E5E7EB] px-4 pt-safe pb-2.5 flex items-center justify-between gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className="flex items-center gap-2 min-h-[44px] min-w-0 cursor-pointer"
                >
                  <span className="w-7 h-7 rounded-lg bg-[#22C55E] text-white flex items-center justify-center shrink-0">
                    <LottieIcon animation="xp" size={16} tone="inverse" fallback={<Zap className="w-4 h-4 fill-white" />} />
                  </span>
                  <div className="text-left min-w-0">
                    <div className="font-display text-sm font-bold text-[#111827] truncate">
                      {userState.profile.name || 'Explorateur'} · {userState.profile.grade}
                    </div>
                  </div>
                </button>

                <div className="flex items-center gap-3 shrink-0 tabular-nums">
                  <div
                    className="flex items-center gap-1 font-display font-bold text-sm text-[#111827]"
                    title="Points d'expérience"
                  >
                    <LottieIcon animation="xp" size={18} tone="xp" trigger="manual" replayKey={userState.xp} />
                    <span>{userState.xp}</span>
                  </div>
                  <div
                    className="flex items-center gap-1 font-display font-bold text-sm text-[#111827]"
                    title="Série de jours"
                  >
                    <LottieIcon animation="streak" size={18} tone="warning" trigger="manual" replayKey={userState.streak} />
                    <span>{userState.streak}</span>
                  </div>
                </div>
              </header>

              {/* Scrollable Tab Viewport */}
              <main className="flex-1 overflow-y-auto no-scrollbar">
                {activeTab === 'home' && (
                  <HomeScreen
                    userState={userState}
                    onStartNotion={handleStartNotion}
                    onOpenPath={() => setActiveTab('path')}
                    onOpenChallenges={() => setActiveTab('challenges')}
                  />
                )}
                {activeTab === 'path' && (
                  <CurriculumScreen
                    userState={userState}
                    onStartNotion={handleStartNotion}
                    onToggleDemoMode={() =>
                      setUserState((prev) => ({ ...prev, demoMode: !prev.demoMode }))
                    }
                  />
                )}
                {activeTab === 'challenges' && (
                  <ChallengesTab
                    userState={userState}
                    onClaimChallenge={handleClaimChallenge}
                    onStartNotion={handleStartNotion}
                  />
                )}
                {activeTab === 'profile' && (
                  <ProfileTab
                    userState={userState}
                    onChangeGrade={(grade) =>
                      setUserState((prev) => ({
                        ...prev,
                        profile: { ...prev.profile, grade },
                      }))
                    }
                    onToggleSound={() =>
                      setUserState((prev) => ({
                        ...prev,
                        soundEnabled: !prev.soundEnabled,
                      }))
                    }
                    onToggleDemoMode={() =>
                      setUserState((prev) => ({ ...prev, demoMode: !prev.demoMode }))
                    }
                    onResetProgress={handleResetProgress}
                    onOpenQRModal={() => setQrModalOpen(true)}
                  />
                )}
              </main>

              {/* Clean Brilliant 4-Tab Bottom Navigation */}
              <nav
                aria-label="Navigation principale"
                className="bg-white border-t border-[#E5E7EB] grid grid-cols-4 items-center px-1 pt-1.5 pb-safe shrink-0"
              >
                {[
                  { id: 'home' as const, label: 'Accueil', Icon: Home, animation: 'home' as const },
                  { id: 'path' as const, label: 'Parcours', Icon: BookOpen, animation: 'book' as const },
                  { id: 'challenges' as const, label: 'Défis', Icon: Target, animation: 'target' as const },
                  { id: 'profile' as const, label: 'Profil', Icon: User, animation: 'profile' as const },
                ].map(({ id, label, Icon, animation }) => {
                  const active = activeTab === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        playSound('tap', userState.soundEnabled);
                        setActiveTab(id);
                      }}
                      aria-current={active ? 'page' : undefined}
                      className={`min-h-[48px] flex flex-col items-center justify-center gap-0.5 rounded-xl transition-colors cursor-pointer ${
                        active
                          ? 'text-[#111827]'
                          : 'text-[#9CA3AF] hover:text-[#4B5563]'
                      }`}
                    >
                      <LottieIcon
                        animation={animation}
                        size={22}
                        play={active}
                        trigger="mount"
                        replayKey={activeTab}
                        tone={active ? 'ink' : 'muted'}
                        fallback={<Icon className={`w-5 h-5 ${active ? 'stroke-[2.5]' : 'stroke-2'}`} />}
                      />
                      <span className="text-[11px] font-bold tracking-tight">{label}</span>
                    </button>
                  );
                })}
              </nav>
            </motion.div>
          )}

          {screen === 'lesson' && activeNotion && (
            <motion.div
              key={`lesson-${activeNotion.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.16 }}
              className="h-full"
            >
              <LessonScreen
                notion={activeNotion}
                exercises={currentExercises}
                grade={userState.profile.grade}
                totalXp={userState.xp}
                soundEnabled={userState.soundEnabled}
                geminiAvailable={geminiAvailable}
                onExit={() => setScreen('main')}
                onComplete={handleLessonComplete}
              />
            </motion.div>
          )}

          {screen === 'result' && resultSummary && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <VictoryScreen
                notion={resultSummary.notion}
                nextNotion={nextRecommended}
                correctCount={resultSummary.correctCount}
                totalQuestions={resultSummary.totalQuestions}
                earnedStars={resultSummary.earnedStars}
                earnedXp={resultSummary.earnedXp}
                accuracy={resultSummary.accuracy}
                globalPercent={globalPercent}
                newlyEarnedBadges={resultSummary.newlyEarnedBadges}
                mistakes={resultSummary.mistakes}
                soundEnabled={userState.soundEnabled}
                onContinue={() => {
                  setResultSummary(null);
                  setActiveTab('path');
                  setScreen('main');
                }}
                onStartNextNotion={(next) => {
                  setResultSummary(null);
                  handleStartNotion(next);
                }}
                onReviewMistakes={() => setScreen('review')}
              />
            </motion.div>
          )}

          {screen === 'review' && resultSummary && (
            <motion.div
              key="review"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <ErrorReviewScreen
                mistakes={resultSummary.mistakes}
                onBack={() => {
                  setResultSummary(null);
                  setActiveTab('path');
                  setScreen('main');
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <QRShareModal
          open={qrModalOpen}
          onClose={() => setQrModalOpen(false)}
          publicUrl={publicUrl}
        />
      </MobileFrameShell>
    </MotionConfig>
  );
}
