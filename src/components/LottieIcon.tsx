import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Download, Flame, Home, Lightbulb, LoaderCircle, Lock, RotateCcw, Star, Target, User, Volume2, VolumeX, X, CircleX, Zap, type LucideIcon } from 'lucide-react';
import type { AnimationItem, LottiePlayer } from 'lottie-web';
import { ANIMATIONS } from '../assets/animations/registry';
import { loadAnimationData, prepareAnimationData } from '../utils/lottieAssets';
import type { AnimationDefinition, AnimationName, AnimationTone, AnimationTrigger } from '../types/animations';

const FALLBACKS: Record<AnimationName, LucideIcon> = {
  home: Home, book: BookOpen, target: Target, profile: User, success: CheckCircle2,
  xp: Zap, streak: Flame, star: Star, hint: Lightbulb, loading: LoaderCircle,
  arrowRight: ArrowRight, arrowLeft: ArrowLeft, close: X, refresh: RotateCcw,
  download: Download, soundOn: Volume2, soundOff: VolumeX, lock: Lock, error: CircleX,
};

let playerPromise: Promise<LottiePlayer> | null = null;
function loadPlayer(): Promise<LottiePlayer> {
  if (!playerPromise) {
    playerPromise = import('lottie-web/build/player/lottie_light')
      .then(module => module.default)
      .catch((error: unknown) => { playerPromise = null; throw error; });
  }
  return playerPromise;
}

const staticMedia = '(prefers-reduced-motion: reduce), (forced-colors: active)';
function subscribeStaticMode(callback: () => void) {
  const media = window.matchMedia(staticMedia);
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
}
function getStaticMode() { return window.matchMedia(staticMedia).matches; }
function subscribeVisibility(callback: () => void) {
  document.addEventListener('visibilitychange', callback);
  return () => document.removeEventListener('visibilitychange', callback);
}
function getPageVisible() { return document.visibilityState !== 'hidden'; }

export interface LottieIconProps {
  animation: AnimationName;
  size?: number;
  /** false pauses playback and displays the semantically correct resting frame. */
  play?: boolean;
  speed?: number;
  loop?: boolean | number;
  trigger?: AnimationTrigger;
  /** Changing this value replays once, without remounting the player. */
  replayKey?: string | number;
  tone?: AnimationTone;
  className?: string;
  fallback?: React.ReactNode;
}

interface PlaybackState {
  item: AnimationItem | null;
  key: string | number | undefined;
  interaction: number;
  wasPlaying: boolean;
  mountHandled: boolean;
  pending: boolean;
  running: boolean;
}

/** Decorative only: accessible text/labels belong to the containing control. */
export function LottieIcon({
  animation, size = 20, play = true, speed, loop = false, trigger = 'interaction',
  replayKey, tone = 'inherit', className = '', fallback,
}: LottieIconProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const stageRef = useRef<HTMLSpanElement>(null);
  const itemRef = useRef<AnimationItem | null>(null);
  const playbackRef = useRef<PlaybackState | null>(null);
  const [inView, setInView] = useState(false);
  const [seen, setSeen] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [interaction, setInteraction] = useState(0);
  const staticMode = useSyncExternalStore(subscribeStaticMode, getStaticMode, () => true);
  const pageVisible = useSyncExternalStore(subscribeVisibility, getPageVisible, () => false);
  const definition: AnimationDefinition = ANIMATIONS[animation];
  const FallbackIcon = FALLBACKS[animation];
  const safeSize = Number.isFinite(size) ? Math.max(8, Math.min(160, size)) : 20;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (!('IntersectionObserver' in window)) { setSeen(true); setInView(true); return; }
    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
      if (entry.isIntersecting) setSeen(true);
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (trigger !== 'interaction' || staticMode || !play) return;
    const control = rootRef.current?.closest('button, a, [role="button"]');
    if (!control) return;
    let last = -Infinity;
    const replay = () => {
      if (control.hasAttribute('disabled') || control.getAttribute('aria-disabled') === 'true') return;
      if (performance.now() - last < 200) return;
      last = performance.now();
      setInteraction(value => value + 1);
    };
    control.addEventListener('pointerenter', replay);
    control.addEventListener('pointerdown', replay);
    control.addEventListener('focusin', replay);
    return () => {
      control.removeEventListener('pointerenter', replay);
      control.removeEventListener('pointerdown', replay);
      control.removeEventListener('focusin', replay);
    };
  }, [trigger, staticMode, play]);

  useEffect(() => {
    setReady(false);
    setFailed(false);
    setPlaying(false);
    if (staticMode || !seen || !stageRef.current || !rootRef.current) return;
    let cancelled = false;
    let item: AnimationItem | null = null;
    const stage = stageRef.current;
    const root = rootRef.current;
    const fail = () => {
      if (cancelled) return;
      cancelled = true;
      item?.destroy();
      if (itemRef.current === item) itemRef.current = null;
      setReady(false);
      setPlaying(false);
      setFailed(true);
    };
    const timeout = window.setTimeout(fail, 10000);
    Promise.all([loadPlayer(), loadAnimationData(definition.src)])
      .then(([player, data]) => {
        if (cancelled) return;
        const style = getComputedStyle(root);
        const primary = style.getPropertyValue('--lottie-primary').trim();
        const secondary = style.getPropertyValue('--lottie-secondary').trim();
        item = player.loadAnimation({
          container: stage, renderer: 'svg', autoplay: false, loop: false,
          animationData: prepareAnimationData(data, definition.colorMode, primary === 'currentColor' ? style.color : primary, secondary === 'currentColor' ? style.color : secondary),
          rendererSettings: { preserveAspectRatio: 'xMidYMid meet', progressiveLoad: true, hideOnTransparent: false, focusable: false, viewBoxSize: definition.viewBox },
        });
        itemRef.current = item;
        playbackRef.current = null;
        const showRest = () => {
          if (cancelled || !item) return;
          item.resetSegments(true);
          item.goToAndStop(definition.restFrame, true);
        };
        const onReady = () => {
          if (cancelled) return;
          window.clearTimeout(timeout);
          showRest();
          setReady(true);
        };
        item.addEventListener('DOMLoaded', onReady);
        item.addEventListener('data_failed', fail);
        item.addEventListener('error', fail);
        item.addEventListener('complete', () => {
          if (cancelled) return;
          if (playbackRef.current) playbackRef.current.running = false;
          setPlaying(false);
          showRest();
        });
        if (item.isLoaded) onReady();
      })
      .catch(fail);
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      item?.destroy();
      if (itemRef.current === item) itemRef.current = null;
      playbackRef.current = null;
    };
  }, [animation, tone, seen, staticMode, definition]);

  useEffect(() => {
    const item = itemRef.current;
    if (!ready || !item || staticMode) return;
    let state = playbackRef.current;
    const first = !state || state.item !== item;
    if (first) {
      state = { item, key: replayKey, interaction, wasPlaying: play, mountHandled: false, pending: false, running: false };
      playbackRef.current = state;
    }
    if (!state) return;
    if (state.key !== replayKey || state.interaction !== interaction || (!first && !state.wasPlaying && play)) state.pending = true;
    if (trigger === 'mount' && !state.mountHandled && play) { state.pending = true; state.mountHandled = true; }
    if (loop && !state.mountHandled && play) { state.pending = true; state.mountHandled = true; }
    state.key = replayKey;
    state.interaction = interaction;
    state.wasPlaying = play;
    const requestedSpeed = speed ?? definition.speed;
    item.setSpeed(Number.isFinite(requestedSpeed) ? Math.max(0.25, Math.min(4, requestedSpeed)) : definition.speed);
    item.loop = typeof loop === 'number' ? Math.max(0, Math.floor(loop)) : loop;
    if (!play) {
      state.pending = false;
      state.running = false;
      item.resetSegments(true);
      item.goToAndStop(definition.restFrame, true);
      setPlaying(false);
    } else if (!inView || !pageVisible) {
      item.pause();
      setPlaying(false);
    } else if (state.pending) {
      state.pending = false;
      state.running = true;
      item.resetSegments(true);
      item.playSegments([...definition.segment], true);
      setPlaying(true);
    } else if (state.running) {
      item.play();
      setPlaying(true);
    }
  }, [animation, ready, staticMode, play, speed, loop, trigger, replayKey, interaction, inView, pageVisible, definition]);

  const status = staticMode || failed ? 'fallback' : ready ? 'ready' : 'loading';
  return (
    <span
      ref={rootRef}
      aria-hidden="true"
      className={`lottie-icon lottie-icon--${tone} ${className}`}
      style={{ width: safeSize, height: safeSize }}
      data-lottie={animation}
      data-lottie-status={status}
      data-lottie-playing={playing && !staticMode ? 'true' : 'false'}
    >
      <span ref={stageRef} className="lottie-icon__animation" />
      {status !== 'ready' && (
        <span className="lottie-icon__fallback">
          {fallback ?? <FallbackIcon size={safeSize} strokeWidth={2} fill={animation === 'xp' || animation === 'star' || animation === 'streak' ? 'currentColor' : 'none'} />}
        </span>
      )}
    </span>
  );
}
