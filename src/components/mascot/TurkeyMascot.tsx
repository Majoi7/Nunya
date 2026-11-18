import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { TURKEY_SVG_LAYERS, type TurkeySvgNode } from './turkeySvgData';

export type MascotAnimationState =
  | 'idle'
  | 'thinking'
  | 'happy'
  | 'celebrating'
  | 'explaining'
  | 'encouraging'
  | 'surprised'
  | 'incorrect';

interface TurkeyMascotProps {
  animationState: MascotAnimationState;
  size?: number;
  className?: string;
  onAnimationComplete?: () => void;
}

function mapSvgAttrs(attrs: Record<string, string>): React.SVGProps<SVGElement> {
  const mapped: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(attrs)) {
    switch (k) {
      case 'stroke-linejoin':
        mapped.strokeLinejoin = v;
        break;
      case 'stroke-linecap':
        mapped.strokeLinecap = v;
        break;
      case 'stroke-width':
        mapped.strokeWidth = v;
        break;
      case 'stroke-miterlimit':
        mapped.strokeMiterlimit = v;
        break;
      case 'id':
        // Avoid duplicate DOM IDs when multiple mascots render simultaneously
        mapped['data-layer-id'] = v;
        break;
      default:
        mapped[k] = v;
    }
  }
  return mapped as React.SVGProps<SVGElement>;
}

function renderSvgNodes(nodes: TurkeySvgNode[], prefix: string): React.ReactNode {
  return nodes.map((node, index) => {
    const key = `${prefix}-${index}`;
    const props = mapSvgAttrs(node.attrs);
    if (node.type === 'path') {
      return <path key={key} {...(props as React.SVGProps<SVGPathElement>)} />;
    }
    return (
      <g key={key} {...(props as React.SVGProps<SVGGElement>)}>
        {node.children ? renderSvgNodes(node.children, key) : null}
      </g>
    );
  });
}

export const TurkeyMascot: React.FC<TurkeyMascotProps> = ({
  animationState,
  size = 112,
  className = '',
  onAnimationComplete,
}) => {
  const [isBlinking, setIsBlinking] = useState(false);

  // Natural periodic eye blink every ~3.4s
  useEffect(() => {
    const interval = window.setInterval(() => {
      setIsBlinking(true);
      const t = window.setTimeout(() => setIsBlinking(false), 140);
      return () => window.clearTimeout(t);
    }, 3400);
    return () => window.clearInterval(interval);
  }, []);

  // Trigger onAnimationComplete after transient reaction beats
  useEffect(() => {
    if (!onAnimationComplete) return;
    if (
      animationState === 'happy' ||
      animationState === 'surprised' ||
      animationState === 'incorrect' ||
      animationState === 'celebrating'
    ) {
      const duration = animationState === 'celebrating' ? 1400 : 900;
      const timer = window.setTimeout(() => onAnimationComplete(), duration);
      return () => window.clearTimeout(timer);
    }
  }, [animationState, onAnimationComplete]);

  // Pose & choreography targets per animationState
  const bodyAnim = (() => {
    switch (animationState) {
      case 'celebrating':
        return { y: [0, -26, 0, -18, 0], rotate: [0, -3, 3, -2, 0], scaleY: [1, 1.04, 0.96, 1.03, 1] };
      case 'happy':
        return { y: [0, -16, 0], scaleY: [1, 1.03, 0.98, 1] };
      case 'thinking':
        return { y: [0, -3, 0], rotate: -3 };
      case 'explaining':
        return { y: [0, -5, 0], rotate: 2 };
      case 'encouraging':
        return { y: [0, -7, 0], rotate: [0, 2, 0] };
      case 'surprised':
        return { y: [0, -20, -4], scaleY: [1, 1.06, 1] };
      case 'incorrect':
        return { y: [0, 8, 6], x: [0, -6, 6, -4, 0], rotate: -4 };
      case 'idle':
      default:
        return { y: [0, -5, 0], scaleY: [1, 1.015, 1] };
    }
  })();

  const bodyTransition = (() => {
    switch (animationState) {
      case 'celebrating':
        return { duration: 1.1, repeat: Infinity, ease: 'easeInOut' as const };
      case 'happy':
        return { duration: 0.75, repeat: Infinity, ease: 'easeInOut' as const };
      case 'surprised':
        return { duration: 0.45, ease: 'easeOut' as const };
      case 'incorrect':
        return { duration: 0.5, ease: 'easeOut' as const };
      default:
        return { duration: 2.2, repeat: Infinity, ease: 'easeInOut' as const };
    }
  })();

  // Legs: natural open V-stance when standing vs celebratory power-walk stride
  const backLegAngle =
    animationState === 'celebrating'
      ? [56, -18, 56]
      : animationState === 'happy'
      ? [36, 22, 36]
      : animationState === 'incorrect'
      ? 30
      : 32;

  const frontLegAngle =
    animationState === 'celebrating'
      ? [-51, 22, -51]
      : animationState === 'happy'
      ? [-32, -20, -32]
      : animationState === 'incorrect'
      ? -22
      : -26;

  // Tail fan spread/wag
  const tailAnim = (() => {
    switch (animationState) {
      case 'celebrating':
        return { rotate: [6, 18, 4, 18, 6], scale: [1, 1.08, 1.02, 1.08, 1] };
      case 'happy':
        return { rotate: [8, 16, 8], scale: 1.04 };
      case 'surprised':
        return { rotate: 20, scale: 1.07 };
      case 'incorrect':
        return { rotate: 2, scale: 0.96 };
      default:
        return { rotate: [9, 12, 9], scale: 1 };
    }
  })();

  // Front & Back Wings
  const frontWingAnim = (() => {
    switch (animationState) {
      case 'celebrating':
        return { rotate: [-28, 32, -28] };
      case 'happy':
        return { rotate: [-14, 24, -14] };
      case 'explaining':
        return { rotate: [-38, -26, -38] }; // Wing raised gesturing/pointing!
      case 'thinking':
        return { rotate: -48 }; // Wing tucked up thoughtfully near chin/chest
      case 'encouraging':
        return { rotate: [-12, 8, -12] };
      case 'surprised':
        return { rotate: -42 };
      case 'incorrect':
        return { rotate: 28 }; // Gentle droop
      default:
        return { rotate: [12, 17, 12] };
    }
  })();

  const backWingAnim = (() => {
    switch (animationState) {
      case 'celebrating':
        return { rotate: [-22, 24, -22] };
      case 'happy':
        return { rotate: [-10, 18, -10] };
      case 'surprised':
        return { rotate: -26 };
      case 'incorrect':
        return { rotate: 16 };
      default:
        return { rotate: [4, 9, 4] };
    }
  })();

  // Head & Neck tilt
  const headAnim = (() => {
    switch (animationState) {
      case 'thinking':
        return { rotate: -10, y: -2 };
      case 'explaining':
        return { rotate: [2, -4, 2] };
      case 'happy':
        return { rotate: [-3, 6, -3] };
      case 'celebrating':
        return { rotate: [-5, 7, -5] };
      case 'encouraging':
        return { rotate: [0, 5, 0] };
      case 'surprised':
        return { rotate: -7, y: -8 };
      case 'incorrect':
        return { rotate: 9, y: 6 };
      default:
        return { rotate: [1.5, 4.5, 1.5] };
    }
  })();

  // Wattle & Crest lively secondary motion
  const wattleAnim =
    animationState === 'celebrating' || animationState === 'happy'
      ? { rotate: [-6, 8, -6] }
      : animationState === 'incorrect'
      ? { rotate: 4 }
      : { rotate: [-2, 2, -2] };

  // Pupil tracking offset
  const pupilShift =
    animationState === 'thinking'
      ? { x: -4, y: -5 }
      : animationState === 'explaining'
      ? { x: 3, y: 0 }
      : animationState === 'incorrect'
      ? { x: -2, y: 4 }
      : animationState === 'surprised'
      ? { x: 0, y: -2, scale: 1.15 }
      : { x: 0, y: 0, scale: 1 };

  const eyeScaleY = isBlinking ? 0.08 : animationState === 'surprised' ? 1.12 : 1;

  return (
    <svg
      fill="none"
      viewBox="80 30 620 770"
      width={size}
      height={size}
      className={`select-none overflow-visible ${className}`}
      role="img"
      aria-label="Mascotte Coach Dindon"
    >
      {/* Subtle ground shadow */}
      <motion.ellipse
        cx="405"
        cy="780"
        rx="115"
        ry="18"
        fill="#0F172A"
        initial={false}
        animate={{
          scaleX: animationState === 'celebrating' ? [1, 0.82, 1] : 1,
          opacity: animationState === 'celebrating' ? [0.16, 0.09, 0.16] : 0.14,
        }}
        style={{ transformOrigin: '405px 780px' }}
        transition={{ duration: 0.55, repeat: animationState === 'celebrating' ? Infinity : 0 }}
      />

      {/* Whole articulated rig pivoting around body center (432.96, 499.63) */}
      <g transform="translate(432.96,499.63)">
        <motion.g
          id="turkey-rig"
          animate={bodyAnim}
          transition={bodyTransition}
          style={{ transformOrigin: '0px 0px' }}
        >
          <g transform="translate(-432.96,-499.63)">
            {/* 1. Back Wing */}
            <g id="back-wing" transform="translate(392.42,479)">
              <motion.g
                animate={backWingAnim}
                transition={{
                  duration: animationState === 'celebrating' ? 0.35 : 1.8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                style={{ transformOrigin: '0px 0px' }}
              >
                <g transform="translate(-15,-79)">
                  <g transform="matrix(1,0,0,1,-400,-400)">
                    {renderSvgNodes(TURKEY_SVG_LAYERS.backWingPaths, 'bw')}
                  </g>
                </g>
              </motion.g>
            </g>

            {/* 2. Back Leg */}
            <g id="back-leg" transform="translate(382.6,626.57)">
              <motion.g
                animate={{ rotate: backLegAngle }}
                transition={
                  animationState === 'celebrating' || animationState === 'happy'
                    ? { duration: 0.48, repeat: Infinity, ease: 'easeInOut' }
                    : { type: 'spring', stiffness: 180, damping: 18 }
                }
                style={{ transformOrigin: '0px 0px' }}
              >
                <g transform="translate(-471.1,-629.34)">
                  {renderSvgNodes(TURKEY_SVG_LAYERS.backLegPaths, 'bl')}
                </g>
              </motion.g>
            </g>

            {/* 3. Tail Fan (10 layered feathers) */}
            <g id="tail-fan" transform="translate(317.819,469.123)">
              <motion.g
                animate={tailAnim}
                transition={{
                  duration: animationState === 'celebrating' ? 0.6 : 2.4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                style={{ transformOrigin: '0px 0px' }}
              >
                <g transform="translate(111.8,-77.2)">
                  <g transform="matrix(1,0,0,1,-430,-392)">
                    {renderSvgNodes(TURKEY_SVG_LAYERS.tailFanPaths, 'tf')}
                  </g>
                </g>
              </motion.g>
            </g>

            {/* 4. Body Torso + Chest Feather Tufts */}
            <g id="body">
              {renderSvgNodes(TURKEY_SVG_LAYERS.bodyPaths, 'bd')}
              {renderSvgNodes(TURKEY_SVG_LAYERS.chestTuftsPaths, 'ct')}
            </g>

            {/* 5. Front Leg */}
            <g id="front-leg" transform="translate(446,627.1)">
              <motion.g
                animate={{ rotate: frontLegAngle }}
                transition={
                  animationState === 'celebrating' || animationState === 'happy'
                    ? { duration: 0.48, repeat: Infinity, ease: 'easeInOut' }
                    : { type: 'spring', stiffness: 180, damping: 18 }
                }
                style={{ transformOrigin: '0px 0px' }}
              >
                <g transform="translate(-382.33,-627.1)">
                  {renderSvgNodes(TURKEY_SVG_LAYERS.frontLegPaths, 'fl')}
                </g>
              </motion.g>
            </g>

            {/* 6. Head, Neck, Headband, Crest, Beak, Wattle, Eyes */}
            <g id="head-neck" transform="translate(523.374,385.232)">
              <motion.g
                animate={headAnim}
                transition={{
                  duration:
                    animationState === 'celebrating' || animationState === 'happy'
                      ? 0.7
                      : animationState === 'explaining'
                      ? 1.5
                      : 2.6,
                  repeat:
                    animationState === 'thinking' ||
                    animationState === 'surprised' ||
                    animationState === 'incorrect'
                      ? 0
                      : Infinity,
                  ease: 'easeInOut',
                }}
                style={{ transformOrigin: '0px 0px' }}
              >
                <g transform="translate(-110.2,14.2)">
                  <g transform="translate(101.78,-14.09)">
                    <g transform="rotate(2.984)">
                      <g transform="translate(-501.78,-385.91)">
                        {/* Skin & Lime Athletic Headband */}
                        {renderSvgNodes(TURKEY_SVG_LAYERS.headSkinPaths, 'hs')}
                        <g id="headband">
                          {renderSvgNodes(TURKEY_SVG_LAYERS.headbandPaths, 'hb')}
                        </g>
                        {/* Neck Feather Tufts */}
                        {renderSvgNodes(TURKEY_SVG_LAYERS.neckTuftsPaths, 'nt')}

                        {/* Head Details Group */}
                        <g transform="translate(412.68,398.95)">
                          {/* Crest */}
                          <motion.g
                            id="crest"
                            animate={
                              animationState === 'celebrating' || animationState === 'happy'
                                ? { rotate: [-4, 5, -4] }
                                : { rotate: 0 }
                            }
                            transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut' }}
                          >
                            {renderSvgNodes(TURKEY_SVG_LAYERS.crestPaths, 'cr')}
                          </motion.g>

                          {/* Beak & Mouth */}
                          <g id="beak">
                            {renderSvgNodes(TURKEY_SVG_LAYERS.beakPaths, 'bk')}
                          </g>

                          {/* Wattle (Snood) */}
                          <g transform="translate(197.45,-224.34)">
                            <g transform="translate(-595.98,-176.31)">
                              <motion.g
                                id="wattle"
                                animate={wattleAnim}
                                transition={{ duration: 0.65, repeat: Infinity, ease: 'easeInOut' }}
                                style={{ transformOrigin: '557px 175px' }}
                              >
                                {renderSvgNodes(TURKEY_SVG_LAYERS.wattlePaths, 'wt')}
                              </motion.g>
                            </g>
                          </g>

                          {/* Eyes (with blinking, gaze tracking & expressions) */}
                          <g id="eyes" transform="matrix(1,0,0,1,-400,-400)">
                            {/* Right Eye */}
                            <g transform="translate(590.39,122.34)">
                              <motion.g
                                animate={{ scaleY: eyeScaleY }}
                                transition={{ duration: 0.08 }}
                                style={{ transformOrigin: '0px 0px' }}
                              >
                                <path
                                  fill="#ffffff"
                                  d="M0,-20.88C12.15,-20.88,22.01,-11.52,22.01,0C22.01,11.52,12.15,20.88,0,20.88C-12.15,20.88,-22.01,11.52,-22.01,0C-22.01,-11.52,-12.15,-20.88,0,-20.88Z"
                                />
                                <motion.g animate={pupilShift} transition={{ duration: 0.25 }}>
                                  <circle cx="9.43" cy="0" r="9.57" fill="#170800" />
                                  <circle cx="13" cy="-3.5" r="2.8" fill="#ffffff" opacity="0.9" />
                                </motion.g>
                                <path
                                  strokeMiterlimit="1.5"
                                  strokeLinecap="round"
                                  strokeWidth="2.13"
                                  stroke="#170800"
                                  d="M-17.82,-12.25C-13.82,-17.47,-7.32,-20.88,0,-20.88C12.15,-20.88,22.01,-11.52,22.01,0C22.01,11.52,12.15,20.88,0,20.88C-7.29,20.88,-13.76,17.51,-17.77,12.32"
                                />
                              </motion.g>
                            </g>

                            {/* Left Eye */}
                            <g transform="translate(554.79,122.34)">
                              <motion.g
                                animate={{ scaleY: eyeScaleY }}
                                transition={{ duration: 0.08 }}
                                style={{ transformOrigin: '0px 0px' }}
                              >
                                <path
                                  fill="#ffffff"
                                  d="M0,-20.88C12.15,-20.88,22.01,-11.52,22.01,0C22.01,11.52,12.15,20.88,0,20.88C-12.15,20.88,-22.01,11.52,-22.01,0C-22.01,-11.52,-12.15,-20.88,0,-20.88Z"
                                />
                                <motion.g animate={pupilShift} transition={{ duration: 0.25 }}>
                                  <circle cx="7.75" cy="0" r="9.57" fill="#170800" />
                                  <circle cx="11" cy="-3.5" r="2.8" fill="#ffffff" opacity="0.9" />
                                </motion.g>
                                <path
                                  strokeMiterlimit="1.5"
                                  strokeLinecap="round"
                                  strokeWidth="2.13"
                                  stroke="#170800"
                                  d="M0,-20.88C12.15,-20.88,22.01,-11.52,22.01,0C22.01,11.52,12.15,20.88,0,20.88C-12.15,20.88,-22.01,11.52,-22.01,0C-22.01,-11.52,-12.15,-20.88,0,-20.88Z"
                                />
                              </motion.g>
                            </g>

                            {/* Subtle empathetic/thinking brow lines */}
                            {animationState === 'thinking' && (
                              <path
                                d="M538,94 Q555,87 572,95"
                                stroke="#170800"
                                strokeWidth="3.5"
                                strokeLinecap="round"
                              />
                            )}
                            {animationState === 'incorrect' && (
                              <>
                                <path
                                  d="M536,99 Q553,93 568,101"
                                  stroke="#170800"
                                  strokeWidth="3.2"
                                  strokeLinecap="round"
                                />
                                <path
                                  d="M578,101 Q593,93 610,99"
                                  stroke="#170800"
                                  strokeWidth="3.2"
                                  strokeLinecap="round"
                                />
                              </>
                            )}
                          </g>
                        </g>
                      </g>
                    </g>
                  </g>
                </g>
              </motion.g>
            </g>

            {/* 7. Front Wing */}
            <g id="front-wing" transform="translate(438.04,479)">
              <motion.g
                animate={frontWingAnim}
                transition={{
                  duration: animationState === 'celebrating' ? 0.35 : 1.7,
                  repeat:
                    animationState === 'thinking' ||
                    animationState === 'surprised' ||
                    animationState === 'incorrect'
                      ? 0
                      : Infinity,
                  ease: 'easeInOut',
                }}
                style={{ transformOrigin: '0px 0px' }}
              >
                <g transform="translate(-15,-79)">
                  <g transform="matrix(1,0,0,1,-400,-400)">
                    {renderSvgNodes(TURKEY_SVG_LAYERS.frontWingPaths, 'fw')}
                  </g>
                </g>
              </motion.g>
            </g>
          </g>
        </motion.g>
      </g>
    </svg>
  );
};
