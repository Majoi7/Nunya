import homeUrl from './home.json?url&no-inline';
import bookUrl from './book.json?url&no-inline';
import targetUrl from './target.json?url&no-inline';
import profileUrl from './profile.json?url&no-inline';
import successUrl from './success.json?url&no-inline';
import xpUrl from './xp.json?url&no-inline';
import streakUrl from './streak.json?url&no-inline';
import starUrl from './star.json?url&no-inline';
import hintUrl from './hint.json?url&no-inline';
import loadingUrl from './loading.json?url&no-inline';
import arrowRightUrl from './arrow-right.json?url&no-inline';
import arrowLeftUrl from './arrow-left.json?url&no-inline';
import closeUrl from './close.json?url&no-inline';
import refreshUrl from './refresh.json?url&no-inline';
import downloadUrl from './download.json?url&no-inline';
import soundUrl from './sound.json?url&no-inline';
import lockUrl from './lock.json?url&no-inline';
import errorUrl from './error.json?url&no-inline';
import type { AnimationDefinition, AnimationName } from '../../types/animations';

/** Only URL strings enter the initial bundle; JSON is fetched when visible. */
export const ANIMATIONS = {
  home: { src: homeUrl, segment: [2, 43], restFrame: 43, speed: 1.8, colorMode: 'monochrome', viewBox: '60 60 380 380' },
  book: { src: bookUrl, segment: [0, 28], restFrame: 28, speed: 1.3, colorMode: 'duotone', viewBox: '30 55 455 390' },
  target: { src: targetUrl, segment: [9, 51], restFrame: 51, speed: 1.8, colorMode: 'original' },
  profile: { src: profileUrl, segment: [5, 48], restFrame: 48, speed: 2, colorMode: 'monochrome', viewBox: '115 90 280 310' },
  success: { src: successUrl, segment: [5, 48], restFrame: 48, speed: 1.8, colorMode: 'monochrome', viewBox: '105 105 300 300' },
  xp: { src: xpUrl, segment: [1, 26], restFrame: 26, speed: 1.5, colorMode: 'duotone', viewBox: '145 20 360 600' },
  streak: { src: streakUrl, segment: [0, 16], restFrame: 0, speed: 1, colorMode: 'original' },
  star: { src: starUrl, segment: [14, 47], restFrame: 0, speed: 1.25, colorMode: 'original', viewBox: '80 70 440 450' },
  hint: { src: hintUrl, segment: [0, 94], restFrame: 94, speed: 1.6, colorMode: 'monochrome' },
  loading: { src: loadingUrl, segment: [0, 36], restFrame: 14, speed: 1, colorMode: 'monochrome', viewBox: '245 245 510 510' },
  arrowRight: { src: arrowRightUrl, segment: [0, 36], restFrame: 0, speed: 1.8, colorMode: 'monochrome' },
  arrowLeft: { src: arrowLeftUrl, segment: [0, 32], restFrame: 0, speed: 1.6, colorMode: 'monochrome' },
  close: { src: closeUrl, segment: [0, 65], restFrame: 65, speed: 1.8, colorMode: 'monochrome' },
  refresh: { src: refreshUrl, segment: [5, 56], restFrame: 54, speed: 1.6, colorMode: 'monochrome', viewBox: '130 130 740 740' },
  download: { src: downloadUrl, segment: [50, 143], restFrame: 200, speed: 1.8, colorMode: 'monochrome', viewBox: '435 435 630 660' },
  soundOn: { src: soundUrl, segment: [8, 38], restFrame: 38, speed: 1.5, colorMode: 'monochrome', viewBox: '25 25 50 50' },
  soundOff: { src: soundUrl, segment: [48, 64], restFrame: 64, speed: 1.2, colorMode: 'monochrome', viewBox: '25 25 50 50' },
  // Lock animation opens its shackle at the beginning: render only the closed frame.
  lock: { src: lockUrl, segment: [61, 89], restFrame: 89, speed: 1, colorMode: 'original', viewBox: '180 160 660 690' },
  error: { src: errorUrl, segment: [5, 28], restFrame: 28, speed: 1, colorMode: 'original' },
} as const satisfies Record<AnimationName, AnimationDefinition>;
