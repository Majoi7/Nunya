export type GradeLevel = 'CP' | 'CE1' | 'CE2' | 'CM1' | 'CM2' | '6e';

export type AppScreen =
  | 'onboarding'
  | 'main'
  | 'lesson'
  | 'result'
  | 'review';

export type MainTab = 'home' | 'path' | 'challenges' | 'profile';

export type MathTopic =
  | 'addition'
  | 'soustraction'
  | 'multiplication'
  | 'division'
  | 'geometrie';

export type PedagogicalPhase =
  | 'decouverte'
  | 'observation'
  | 'manipulation'
  | 'question'
  | 'application';

export type ExerciseType =
  | 'discover-stepper'
  | 'manipulate-addition'
  | 'manipulate-soustraction'
  | 'manipulate-multiplication'
  | 'manipulate-division'
  | 'manipulate-geometrie'
  | 'qcm'
  | 'fill-blank'
  | 'compare'
  | 'order'
  | 'match';

export interface BarSegment {
  label: string;
  value?: number;
  color: 'emerald' | 'sky' | 'amber' | 'violet' | 'slate';
  flex?: number;
}

export interface VisualGroup {
  emoji: string;
  count: number;
  label?: string;
  crossedOut?: number;
}

export interface GeometrySpec {
  shape: 'triangle' | 'carre' | 'rectangle' | 'pentagone' | 'triangle-rectangle';
  label: string;
  sides: number;
  vertices: number;
  rightAngles: number;
  highlightMode?: 'sides' | 'vertices' | 'right-angles' | 'build';
}

export interface VisualModel {
  kind: 'objects' | 'equation-objects' | 'grid' | 'bars' | 'groups' | 'scale' | 'geometry';
  groups?: VisualGroup[];
  operator?: '+' | '-' | '×' | '÷';
  rows?: number;
  cols?: number;
  dotEmoji?: string;
  topBar?: BarSegment[];
  bottomBar?: BarSegment[];
  leftExpr?: string;
  rightExpr?: string;
  geometry?: GeometrySpec;
}

export interface StepperSlide {
  caption: string;
  highlightFormula: string;
  visual: VisualModel;
}

export interface ManipulationConfig {
  // Addition
  leftCount?: number;
  rightCount?: number;
  emoji?: string;
  leftEmoji?: string;
  rightEmoji?: string;
  // Soustraction
  initialCount?: number;
  removeCount?: number;
  // Multiplication
  targetRows?: number;
  targetCols?: number;
  maxRows?: number;
  maxCols?: number;
  // Division
  totalItems?: number;
  baskets?: number;
  // Geometry
  geometryTask?: 'mark-right-angles' | 'count-sides' | 'build-shape';
  geometryTarget?: GeometrySpec;
}

export interface MatchPair {
  id: string;
  left: string;
  right: string;
}

export interface Exercise {
  id: string;
  phase: PedagogicalPhase;
  phaseLabel: string;
  type: ExerciseType;
  topic: MathTopic;
  introTitle: string;
  introText: string;
  question: string;
  visual?: VisualModel;
  slides?: StepperSlide[];
  manipulation?: ManipulationConfig;
  choices?: string[];
  correctAnswer: string;
  equationTemplate?: [string, string];
  pairs?: MatchPair[];
  orderItems?: string[];
  orderDirection?: 'asc' | 'desc';
  simpleExplanation: string;
  visualHint: string;
}

export interface NotionLesson {
  id: string;
  chapterId: string;
  orderInChapter: number;
  title: string;
  subtitle: string;
  topic: MathTopic;
  durationMin: number;
  xpReward: number;
  requiresNotionId?: string;
}

export interface Chapter {
  id: string;
  order: number;
  title: string;
  description: string;
  topic: MathTopic;
  accentColor: 'emerald' | 'sky' | 'amber' | 'violet' | 'indigo';
  notions: NotionLesson[];
}

export interface LessonProgress {
  completed: boolean;
  stars: number;
  bestAccuracy: number;
  attempts: number;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  target: number;
  xpReward: number;
  metric: 'lessonsToday' | 'correctToday' | 'perfectLesson';
}

export interface MistakeRecord {
  exercise: Exercise;
  userAnswer: string;
}

export interface ChildProfile {
  name: string;
  grade: GradeLevel;
}

export interface UserState {
  hasOnboarded: boolean;
  demoMode: boolean;
  profile: ChildProfile;
  xp: number;
  dailyGoalXp: number;
  xpToday: number;
  streak: number;
  lastActiveDate: string;
  totalLessonsCompleted: number;
  totalCorrectAnswers: number;
  totalAnswered: number;
  lessonsToday: number;
  correctToday: number;
  hasPerfectLessonToday: boolean;
  claimedChallenges: string[];
  earnedBadges: string[];
  soundEnabled: boolean;
  lessonProgress: Record<string, LessonProgress>;
  topicStats: Record<MathTopic, { correct: number; total: number }>;
}

export interface TutorResponse {
  source: 'gemini' | 'offline';
  explanation: string;
  visualStep: string;
  practicePrompt: string;
  practiceChoices: string[];
  practiceAnswer: string;
}
