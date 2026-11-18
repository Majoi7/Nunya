import type { AnimationColorMode, LottieAnimationData } from '../types/animations';

const cache = new Map<string, Promise<LottieAnimationData>>();

function isAnimationData(value: unknown): value is LottieAnimationData {
  if (!value || typeof value !== 'object') return false;
  const data = value as Record<string, unknown>;
  return typeof data.v === 'string' &&
    ['w', 'h', 'fr', 'ip', 'op'].every(key => typeof data[key] === 'number' && Number.isFinite(data[key])) &&
    (data.w as number) > 0 && (data.h as number) > 0 && (data.fr as number) > 0 &&
    (data.op as number) > (data.ip as number) && Array.isArray(data.layers);
}

/** Deduplicate a shared file (including soundOn/soundOff); retry on a future mount after errors. */
export function loadAnimationData(src: string): Promise<LottieAnimationData> {
  const existing = cache.get(src);
  if (existing) return existing;
  const request = fetch(src, { signal: AbortSignal.timeout(8000) })
    .then(async response => {
      if (!response.ok) throw new Error('Animation unavailable');
      const data: unknown = await response.json();
      if (!isAnimationData(data)) throw new Error('Invalid animation');
      return data;
    })
    .catch((error: unknown) => {
      cache.delete(src);
      throw error;
    });
  cache.set(src, request);
  return request;
}

function parseColor(color: string): number[] | null {
  if (/^#[\da-f]{6}$/i.test(color)) return [1, 3, 5].map(offset => parseInt(color.slice(offset, offset + 2), 16) / 255);
  const rgb = color.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i);
  return rgb ? rgb.slice(1, 4).map(channel => Math.max(0, Math.min(255, Number(channel))) / 255) : null;
}

/** Lottie mutates animationData: every mounted icon must receive its own clone. */
export function prepareAnimationData(
  data: LottieAnimationData,
  mode: AnimationColorMode,
  color: string,
  secondary: string,
): LottieAnimationData {
  const copy = structuredClone(data);
  if (mode === 'original') return copy;
  const primaryRgb = parseColor(color);
  const secondaryRgb = parseColor(secondary);
  if (!primaryRgb || !secondaryRgb) return copy;

  const patchColor = (values: unknown): unknown => {
    if (!Array.isArray(values) || values.length < 3 || !values.every(value => typeof value === 'number')) return values;
    // Palette-normalized duotone sources use primary ink/yellow plus a lighter secondary.
    const useSecondary = mode === 'duotone' && (values[0] > 0.2 || values[1] > 0.2 || values[2] > 0.3);
    return [...(useSecondary ? secondaryRgb : primaryRgb), ...values.slice(3)];
  };
  const visit = (value: unknown): void => {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) { value.forEach(visit); return; }
    const node = value as Record<string, unknown>;
    if ((node.ty === 'fl' || node.ty === 'st') && node.c && typeof node.c === 'object') {
      const property = node.c as { a: number; k: unknown };
      if (property.a === 0) property.k = patchColor(property.k);
      else if (Array.isArray(property.k)) property.k.forEach(keyframe => {
        if (keyframe.s) keyframe.s = patchColor(keyframe.s);
        if (keyframe.e) keyframe.e = patchColor(keyframe.e);
      });
    }
    Object.values(node).forEach(visit);
  };
  visit(copy);
  return copy;
}
