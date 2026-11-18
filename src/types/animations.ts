export type AnimationName =
  | 'home' | 'book' | 'target' | 'profile' | 'success' | 'xp' | 'streak'
  | 'star' | 'hint' | 'loading' | 'arrowRight' | 'arrowLeft' | 'close'
  | 'refresh' | 'download' | 'soundOn' | 'soundOff' | 'lock' | 'error';

export type AnimationTone = 'inherit' | 'ink' | 'muted' | 'inverse' | 'success' | 'xp' | 'warning' | 'error';
export type AnimationTrigger = 'mount' | 'interaction' | 'manual';
export type AnimationColorMode = 'monochrome' | 'duotone' | 'original';

export interface AnimationDefinition {
  src: string;
  /** Frames from the real source, ending before an icon is erased. */
  segment: readonly [number, number];
  restFrame: number;
  speed: number;
  colorMode: AnimationColorMode;
  viewBox?: string;
}

export interface LottieAnimationData {
  v: string;
  w: number;
  h: number;
  fr: number;
  ip: number;
  op: number;
  layers: unknown[];
  assets?: unknown[];
  [key: string]: unknown;
}
