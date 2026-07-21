import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'motion/react';
import {
  applyVirtualKey,
  canStartMetaInteraction,
  getMetaDevicePostureAction,
  getMetaCameraPitch,
  getProjectiveTransformMatrix,
  getScrollFingerTravel,
  formatProjectiveMatrix3d,
  isPointInsideProjectiveQuad,
  META_CAMERA_PITCH,
  META_TAP_TIMING,
  normalizeVirtualKey,
  scaleProjectiveQuad,
  type ProjectivePoint,
  type ProjectiveQuad,
} from '../lib/metaInteraction';
import { CHAPTER_ONE_DIALOGUE, DialogueLines } from '../lib/chapterOneDialogue';
import audio from '../lib/audio';
import { getMetaFloorStage, getMetaWallStage, type EnvironmentChapter } from '../lib/chapterEnvironment';
import { getChapterPhoneWidgetState } from '../lib/chapterPhoneWidgets';
import { ChapterEnvironment } from './ChapterEnvironment';
import { MetaWallClock } from './MetaWallClock';
import { MetaWindowScene } from './MetaWindowScene';

interface MetaInteractionSceneProps {
  active: boolean;
  chapter: EnvironmentChapter;
  cameraPitchEnabled?: boolean;
  postureControlEnabled?: boolean;
  children: React.ReactNode;
}

interface PointerPosition {
  x: number;
  y: number;
}

interface ScrollGesture {
  nonce: number;
  travelY: number;
}

interface QueuedKey {
  input: HTMLInputElement;
  key: string;
}

interface MetaInputController {
  getValue: () => string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

interface MetaInteractionContextValue {
  active: boolean;
  registerInput: (id: string, controller: MetaInputController) => () => void;
  speak: (lines: DialogueLines) => void;
  tapElement: (id: string, onActivate: () => void) => void;
}

const MetaInteractionContext = createContext<MetaInteractionContextValue>({
  active: false,
  registerInput: () => () => undefined,
  speak: () => undefined,
  tapElement: (_id, onActivate) => onActivate(),
});

export const useMetaInteraction = () => useContext(MetaInteractionContext);

const KEYBOARD_ROWS = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', '_'],
  ['Backspace', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Enter'],
] as const;

const isViewTubeSearch = (element: Element): element is HTMLInputElement =>
  element instanceof HTMLInputElement && element.id === 'vt-search-input';

/* ==========================================================================
   Hand anatomy kit.

   Fingers are generated from joint skeletons instead of hand-drawn blobs:
   each finger is three tapered round-capped segments laid over a shared
   user-space gradient, so knuckles bulge where segments meet, creases sit
   exactly on the joints, and the nail is placed perpendicular to the last
   phalanx. Stylised, not photoreal — but the proportions are anatomical.
   ========================================================================== */

type Pt = readonly [number, number];

const line = (a: Pt, b: Pt) => `M${a[0]} ${a[1]} L${b[0]} ${b[1]}`;

/** Perpendicular crease across a joint, bowed slightly toward the fingertip. */
const jointCrease = (joint: Pt, from: Pt, to: Pt, width: number, scale: number) => {
  const vx = to[0] - from[0];
  const vy = to[1] - from[1];
  const vl = Math.hypot(vx, vy) || 1;
  const px = -vy / vl;
  const py = vx / vl;
  const half = (width * scale) / 2;
  const bow = width * 0.14;
  return `M${joint[0] - px * half} ${joint[1] - py * half} Q${joint[0] + (vx / vl) * bow} ${joint[1] + (vy / vl) * bow} ${joint[0] + px * half} ${joint[1] + py * half}`;
};

interface NailProps {
  tip: Pt;
  prev: Pt;
  width: number;
  fill: string;
  scale?: number;
}

/** A fingernail seated just behind the fingertip, aligned to the phalanx.
    Texture: rounded plate, lunula, one soft shine band, two faint ridges. */
const Nail: React.FC<NailProps> = ({ tip, prev, width, fill, scale = 1 }) => {
  const dx = tip[0] - prev[0];
  const dy = tip[1] - prev[1];
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const w = width * 0.54 * scale;
  const l = width * 0.62 * scale;
  const cx = tip[0] - ux * width * 0.33;
  const cy = tip[1] - uy * width * 0.33;
  const angle = (Math.atan2(uy, ux) * 180) / Math.PI - 90;

  return (
    <g transform={`translate(${cx} ${cy}) rotate(${angle})`}>
      <rect
        x={-w / 2} y={-l / 2} width={w} height={l} rx={w * 0.42}
        fill={fill} stroke="rgba(139,84,58,0.38)" strokeWidth={0.8}
      />
      {/* lunula */}
      <ellipse cx={0} cy={-l * 0.3} rx={w * 0.28} ry={l * 0.14} fill="rgba(255,255,255,0.3)" />
      {/* shine band */}
      <rect x={-w * 0.34} y={-l * 0.24} width={w * 0.18} height={l * 0.5} rx={w * 0.09} fill="rgba(255,255,255,0.26)" />
      {/* keratin ridges */}
      <line x1={-w * 0.14} y1={-l * 0.2} x2={-w * 0.14} y2={l * 0.3} stroke="rgba(120,70,48,0.1)" strokeWidth={0.7} />
      <line x1={w * 0.16} y1={-l * 0.16} x2={w * 0.16} y2={l * 0.3} stroke="rgba(120,70,48,0.08)" strokeWidth={0.7} />
    </g>
  );
};

interface FingerShapeProps {
  joints: readonly [Pt, Pt, Pt, Pt];
  width: number;
  stroke: string;
  taper?: readonly [number, number, number];
  creaseColor?: string;
  nailFill?: string;
  showNail?: boolean;
  nailScale?: number;
}

const FingerShape: React.FC<FingerShapeProps> = ({
  joints, width, stroke,
  taper = [1, 0.93, 0.85],
  creaseColor = 'rgba(116,62,42,0.24)',
  nailFill = '#efd0b7',
  showNail = false,
  nailScale = 1,
}) => {
  const [mcp, pip, dip, tip] = joints;
  return (
    <g>
      <path d={line(mcp, pip)} stroke={stroke} strokeWidth={width * taper[0]} strokeLinecap="round" fill="none" />
      <path d={line(pip, dip)} stroke={stroke} strokeWidth={width * taper[1]} strokeLinecap="round" fill="none" />
      <path d={line(dip, tip)} stroke={stroke} strokeWidth={width * taper[2]} strokeLinecap="round" fill="none" />
      <path d={jointCrease(pip, mcp, dip, width, 0.5)} stroke={creaseColor} strokeWidth={1.6} fill="none" strokeLinecap="round" />
      <path d={jointCrease(dip, pip, tip, width, 0.44)} stroke={creaseColor} strokeWidth={1.4} fill="none" strokeLinecap="round" />
      {showNail && <Nail tip={tip} prev={dip} width={width} fill={nailFill} scale={nailScale} />}
    </g>
  );
};

interface FoldedFingerProps {
  base: Pt;
  knuckle: Pt;
  tip: Pt;
  width: number;
  stroke: string;
  nailFill?: string;
  creaseColor?: string;
}

/** A finger curled into the palm: proximal phalanx up, the rest folded back
    down so the nail faces the viewer. */
const FoldedFinger: React.FC<FoldedFingerProps> = ({
  base, knuckle, tip, width, stroke,
  nailFill = '#efd0b7',
  creaseColor = 'rgba(116,62,42,0.24)',
}) => (
  <g>
    <path d={line(base, knuckle)} stroke={stroke} strokeWidth={width} strokeLinecap="round" fill="none" />
    <path d={line(knuckle, tip)} stroke={stroke} strokeWidth={width * 0.88} strokeLinecap="round" fill="none" />
    <path d={jointCrease(knuckle, base, tip, width, 0.48)} stroke={creaseColor} strokeWidth={1.5} fill="none" strokeLinecap="round" />
    <Nail tip={tip} prev={knuckle} width={width} fill={nailFill} scale={0.75} />
  </g>
);

/* --------------------------------------------------------------------------
   Left hand — gripping the device edge. Back layer sits behind the phone
   (four fingers wrapping the chassis), front layer is the thumb over the
   bezel. Right-side grips reuse these mirrored.
   -------------------------------------------------------------------------- */

export const LeftGripBack = () => (
  <svg
    viewBox="0 0 340 360"
    className="h-full w-full overflow-visible drop-shadow-[0_18px_16px_rgba(0,0,0,0.32)]"
    role="presentation"
  >
    <defs>
      <linearGradient id="lgb-skin" x1="60" y1="80" x2="320" y2="340" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#f2c9a8" />
        <stop offset="0.5" stopColor="#d09272" />
        <stop offset="1" stopColor="#8f5a3e" />
      </linearGradient>
      <linearGradient id="lgb-finger" x1="200" y1="70" x2="340" y2="250" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#eec2a0" />
        <stop offset="0.55" stopColor="#c98a68" />
        <stop offset="1" stopColor="#82503a" />
      </linearGradient>
      <linearGradient id="lgb-sleeve" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#15171c" />
        <stop offset="1" stopColor="#343942" />
      </linearGradient>
    </defs>

    {/* Sleeve */}
    <path d="M0 360 V256 C34 238 74 232 112 244 L158 360 Z" fill="url(#lgb-sleeve)" />
    <path d="M100 242 C114 252 124 266 130 284" stroke="rgba(255,255,255,0.08)" strokeWidth="3" fill="none" strokeLinecap="round" />

    {/* Back of hand + wrist, one continuous mass */}
    <path
      d="M72 360 C64 318 62 276 70 236 C78 196 96 158 126 128 C150 104 180 88 206 86 C216 86 222 91 224 100 L226 244 C226 274 214 298 194 314 C166 336 128 352 96 360 Z"
      fill="url(#lgb-skin)"
    />

    {/* Shadow seams between the wrapped fingers */}
    <g stroke="rgba(58,28,17,0.24)" strokeWidth="3" fill="none" strokeLinecap="round">
      <path d="M208 117 C244 112 274 113 300 119" />
      <path d="M206 159 C242 154 272 155 298 161" />
      <path d="M210 200 C242 196 268 197 292 202" />
    </g>

    {/* Four fingers wrapping behind the chassis */}
    <FingerShape joints={[[204, 96], [254, 88], [298, 90], [330, 97]]} width={31} stroke="url(#lgb-finger)" />
    <FingerShape joints={[[200, 138], [256, 131], [304, 133], [336, 140]]} width={32} stroke="url(#lgb-finger)" />
    <FingerShape joints={[[202, 180], [254, 174], [298, 176], [326, 183]]} width={30} stroke="url(#lgb-finger)" />
    <FingerShape joints={[[208, 220], [250, 215], [284, 217], [306, 223]]} width={26} stroke="url(#lgb-finger)" />

    {/* Knuckle dimples where the fingers root into the hand */}
    <g stroke="rgba(116,62,42,0.18)" strokeWidth="2" fill="none" strokeLinecap="round">
      <path d="M204 84 Q212 80 220 83" />
      <path d="M200 126 Q209 122 218 125" />
      <path d="M202 168 Q210 164 219 167" />
      <path d="M208 209 Q215 205 222 208" />
    </g>

    {/* Tendons fanning across the back of the hand */}
    <g stroke="rgba(90,46,28,0.1)" strokeWidth="3" fill="none" strokeLinecap="round">
      <path d="M118 300 C148 242 176 190 200 134" />
      <path d="M140 308 C168 254 190 210 204 174" />
    </g>

    {/* Rim light along the top edge */}
    <path d="M126 128 C152 102 182 88 206 86" stroke="rgba(255,236,214,0.5)" strokeWidth="5" fill="none" strokeLinecap="round" />
  </svg>
);

export const LeftGripFront = () => (
  <svg
    viewBox="0 0 280 210"
    className="h-full w-full overflow-visible drop-shadow-[0_9px_9px_rgba(0,0,0,0.24)]"
    role="presentation"
  >
    <defs>
      <linearGradient id="lgf-skin" x1="20" y1="60" x2="240" y2="210" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#f6d0b0" />
        <stop offset="0.5" stopColor="#d39575" />
        <stop offset="1" stopColor="#8f5a3e" />
      </linearGradient>
      <linearGradient id="lgf-thumb" x1="30" y1="60" x2="230" y2="200" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#f6d0b0" />
        <stop offset="0.52" stopColor="#d09272" />
        <stop offset="1" stopColor="#8a5539" />
      </linearGradient>
      <linearGradient id="lgf-nail" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#f7e2cf" />
        <stop offset="1" stopColor="#e3b394" />
      </linearGradient>
      <filter id="lgf-soft" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="6" />
      </filter>
    </defs>

    {/* Soft shadow the thumb casts on the glass */}
    <path
      d="M88 182 C130 158 180 124 232 88"
      stroke="rgba(30,12,6,0.3)" strokeWidth="20" fill="none" strokeLinecap="round"
      filter="url(#lgf-soft)"
    />

    {/* Palm heel resting against the device edge, fused into the thumb root */}
    <path
      d="M-12 216 C-8 176 8 144 42 124 C68 108 100 104 124 118 C114 142 110 164 118 184 C98 206 50 216 12 216 Z"
      fill="url(#lgf-skin)"
    />

    {/* Thumb over the bezel */}
    <g id="meta-left-thumb" data-continuous-grip="palm-thumb">
      <FingerShape
        joints={[[28, 198], [96, 160], [170, 112], [242, 62]]}
        width={48}
        taper={[1, 0.9, 0.8]}
        stroke="url(#lgf-thumb)"
        showNail
        nailScale={1.05}
        nailFill="url(#lgf-nail)"
      />
    </g>

    {/* Folds where the thumb roots into the thenar */}
    <g stroke="rgba(116,62,42,0.2)" strokeWidth="2" fill="none" strokeLinecap="round">
      <path d="M52 176 C70 166 88 162 104 164" />
      <path d="M44 192 C66 182 90 178 112 180" />
    </g>

    {/* Rim light along the thumb's upper edge, kept inside the silhouette */}
    <path d="M96 138 C136 110 180 82 226 58" stroke="rgba(255,236,214,0.5)" strokeWidth="4" fill="none" strokeLinecap="round" />
  </svg>
);

const RightGripBack = () => (
  <div className="h-full w-full -scale-x-100">
    <LeftGripBack />
  </div>
);

const RightGripFront = () => (
  <div className="h-full w-full -scale-x-100">
    <LeftGripFront />
  </div>
);

/* --------------------------------------------------------------------------
   The reaching hand. Back layer is the forearm passing behind the device;
   front layer is the pointing hand over the glass. The index fingertip is
   authored at (69, 5) ≈ (30%, 1%) so the container's translate calibration
   lands the finger pad exactly on the tap target.
   -------------------------------------------------------------------------- */

const HAND_PRESS_SPRING = { type: 'spring', stiffness: 520, damping: 30 } as const;

interface InteractiveHandProps {
  pressed: boolean;
}

export const RightHandBack: React.FC<InteractiveHandProps> = ({ pressed }) => (
  <div className="absolute left-0 top-0 h-[clamp(165px,25vh,235px)] w-[clamp(125px,15vw,180px)] -translate-x-[30%] -translate-y-[1%]">
    <motion.svg
      viewBox="0 0 230 300"
      animate={{ rotate: pressed ? -4 : 0, scale: pressed ? 0.965 : 1 }}
      transition={HAND_PRESS_SPRING}
      className="h-full w-full origin-[30%_1%] overflow-visible drop-shadow-[0_18px_16px_rgba(0,0,0,0.34)]"
      role="presentation"
    >
      <defs>
        <linearGradient id="rhb-skin" x1="50" y1="120" x2="210" y2="290" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#e6b492" />
          <stop offset="0.5" stopColor="#bd7d5d" />
          <stop offset="1" stopColor="#774832" />
        </linearGradient>
        <linearGradient id="rhb-sleeve" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#343942" />
          <stop offset="1" stopColor="#111319" />
        </linearGradient>
      </defs>

      {/* Sleeve entering from the lower right */}
      <path d="M112 300 L106 240 C136 218 176 216 204 234 L230 258 V300 Z" fill="url(#rhb-sleeve)" />
      <path d="M112 246 C130 236 152 232 172 236" stroke="rgba(255,255,255,0.07)" strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* Forearm */}
      <path d="M96 180 L130 248" stroke="url(#rhb-skin)" strokeWidth="66" strokeLinecap="round" fill="none" />

      {/* Hand mass silhouette behind the device */}
      <path
        d="M58 214 C54 176 66 146 96 130 C126 116 158 124 176 148 C190 170 188 198 170 220 C150 244 118 254 90 244 C72 238 60 228 58 214 Z"
        fill="url(#rhb-skin)"
      />
    </motion.svg>
  </div>
);

export const RightHandFront: React.FC<InteractiveHandProps> = ({ pressed }) => (
  <div className="absolute left-0 top-0 h-[clamp(165px,25vh,235px)] w-[clamp(125px,15vw,180px)] -translate-x-[30%] -translate-y-[1%]">
    <motion.svg
      viewBox="0 0 230 300"
      animate={{ rotate: pressed ? -4 : 0, scale: pressed ? 0.965 : 1 }}
      transition={HAND_PRESS_SPRING}
      className="h-full w-full origin-[30%_1%] overflow-visible drop-shadow-[0_10px_10px_rgba(0,0,0,0.24)]"
      role="presentation"
    >
      <defs>
        <linearGradient id="rhf-skin" x1="40" y1="60" x2="220" y2="290" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f2c9a8" />
          <stop offset="0.52" stopColor="#cf8f6d" />
          <stop offset="1" stopColor="#8a5539" />
        </linearGradient>
        <linearGradient id="rhf-index" x1="55" y1="0" x2="105" y2="200" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f6d2b3" />
          <stop offset="0.55" stopColor="#d69674" />
          <stop offset="1" stopColor="#96603f" />
        </linearGradient>
        <linearGradient id="rhf-nail" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f7e2cf" />
          <stop offset="1" stopColor="#e3b394" />
        </linearGradient>
      </defs>

      {/* Contact shadow under the fingertip while pressing */}
      <motion.ellipse
        cx={69} cy={11} rx={17} ry={8}
        fill="rgba(20,8,4,0.3)"
        initial={false}
        animate={{ opacity: pressed ? 1 : 0 }}
        transition={{ duration: 0.12 }}
      />

      {/* Wrist */}
      <path d="M150 264 C172 258 194 266 208 284 L216 300 H150 Z" fill="url(#rhf-skin)" />
      <path d="M148 300 L146 274 C176 260 206 268 226 290 L230 300 Z" fill="#1c2027" />

      {/* Palm / back-of-hand mass */}
      <path
        d="M62 210 C60 172 72 150 92 142 C120 130 168 132 196 156 C214 172 218 200 208 228 C196 258 164 276 128 274 C96 272 70 246 62 210 Z"
        fill="url(#rhf-skin)"
      />

      {/* Thumb tucked across the palm */}
      <FingerShape
        joints={[[118, 248], [96, 236], [72, 224], [52, 214]]}
        width={42}
        taper={[1, 0.92, 0.84]}
        stroke="url(#rhf-skin)"
        showNail
        nailScale={0.7}
        nailFill="url(#rhf-nail)"
      />

      {/* Curled middle, ring and pinky — nails facing the viewer */}
      <FoldedFinger base={[122, 184]} knuckle={[134, 130]} tip={[148, 162]} width={42} stroke="url(#rhf-skin)" nailFill="url(#rhf-nail)" />
      <FoldedFinger base={[152, 198]} knuckle={[162, 148]} tip={[176, 178]} width={39} stroke="url(#rhf-skin)" nailFill="url(#rhf-nail)" />
      <FoldedFinger base={[180, 212]} knuckle={[188, 170]} tip={[198, 196]} width={33} stroke="url(#rhf-skin)" nailFill="url(#rhf-nail)" />

      {/* Shadow separating the index from the curled fingers */}
      <path d="M94 152 C86 110 82 66 84 28" stroke="rgba(70,35,22,0.18)" strokeWidth="7" fill="none" strokeLinecap="round" />

      {/* Index finger, extended to the target */}
      <g data-fingertip="right-index">
        <FingerShape
          joints={[[86, 182], [76, 120], [70, 62], [69, 5]]}
          width={45}
          taper={[1, 0.92, 0.84]}
          stroke="url(#rhf-index)"
          showNail
          nailFill="url(#rhf-nail)"
        />
      </g>

      {/* Rim light along the index's outer edge, inside the silhouette */}
      <path d="M62 148 C58 104 60 58 64 24" stroke="rgba(255,236,214,0.38)" strokeWidth="3.5" fill="none" strokeLinecap="round" />

      {/* Palm creases */}
      <g stroke="rgba(116,62,42,0.2)" strokeWidth="2" fill="none" strokeLinecap="round">
        <path d="M108 238 C138 228 170 230 194 246" />
        <path d="M118 256 C142 249 164 251 182 262" />
      </g>

      {/* Tap ripple on the glass */}
      <AnimatePresence>
        {pressed && (
          <motion.circle
            cx={69} cy={7}
            fill="none"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth={2}
            initial={{ r: 5, opacity: 0.65 }}
            animate={{ r: 24, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>
    </motion.svg>
  </div>
);

const PHONE_SURFACE_SIZE: React.CSSProperties = {
  width: 'min(calc(100cqw - var(--phone-stage-inset)), calc((100cqh - var(--phone-stage-inset)) * var(--phone-aspect)))',
  height: 'min(calc(100cqh - var(--phone-stage-inset)), calc((100cqw - var(--phone-stage-inset)) / var(--phone-aspect)))',
  maxWidth: '1500px',
  maxHeight: '760px',
};

const PHONE_PERSPECTIVE = 1500;
const DESK_PHONE_SCALE = 0.4;
const DESK_PHONE_VERTICAL_OFFSET = -0.1;
const DESK_IMAGE_SIZE = { width: 707, height: 353 } as const;
const DESK_SURFACE_QUAD: ProjectiveQuad = [
  { x: 115, y: 136 },
  { x: 592, y: 136 },
  { x: 678, y: 229 },
  { x: 28, y: 229 },
];

const PROTAGONIST_LABEL = 'YOU';
type BoxQuadProvider = HTMLElement & {
  getBoxQuads?: () => readonly [{
    p1: ProjectivePoint;
    p2: ProjectivePoint;
    p3: ProjectivePoint;
    p4: ProjectivePoint;
  }];
};

const getPhoneCollisionQuad = (phone: HTMLElement): ProjectiveQuad => {
  const transformedQuad = (phone as BoxQuadProvider).getBoxQuads?.()[0];
  if (transformedQuad) {
    return [
      transformedQuad.p1,
      transformedQuad.p2,
      transformedQuad.p3,
      transformedQuad.p4,
    ];
  }

  const rect = phone.getBoundingClientRect();
  const topInset = rect.width * 0.035;
  return [
    { x: rect.left + topInset, y: rect.top },
    { x: rect.right - topInset, y: rect.top },
    { x: rect.right, y: rect.bottom },
    { x: rect.left, y: rect.bottom },
  ];
};

/* --------------------------------------------------------------------------
   The protagonist's thought layer.

   Not a terminal, not a HUD — a makeshift space the mind assembles at night:
   dim blue-grey, half-framed, mostly empty. Thoughts arrive one keystroke at
   a time, with longer breaths after punctuation, because they are being
   formed, not printed.
   -------------------------------------------------------------------------- */

const THOUGHT_START_DELAY_MS = 300;
const THOUGHT_CHAR_MS = 50;
const THOUGHT_LINE_PAUSE_MS = 560;

/** Hesitation: sentence ends breathe, commas pause, ellipses linger. */
const thoughtPauseAfter = (ch: string): number => {
  if ('…'.includes(ch)) return 460;
  if ('。．.！？!?'.includes(ch)) return 330;
  if ('，,、；;：:—'.includes(ch)) return 150;
  return 0;
};

interface ThoughtProgress {
  line: number;
  chars: number;
}

const TypewriterThoughts: React.FC<{ lines: DialogueLines; instant: boolean }> = ({ lines, instant }) => {
  const [progress, setProgress] = useState<ThoughtProgress>({ line: 0, chars: 0 });
  const doneRef = useRef(true);

  useEffect(() => {
    if (instant) {
      setProgress({ line: Math.max(0, lines.length - 1), chars: lines[lines.length - 1]?.length ?? 0 });
      doneRef.current = true;
      return;
    }
    // A new thought arriving mid-sentence cuts the old one off (§4.5).
    if (!doneRef.current) audio.play('narrative.interrupt');
    doneRef.current = false;
    setProgress({ line: 0, chars: 0 });
    let li = 0;
    let ci = 0;
    let timer = 0;
    const step = () => {
      const current = lines[li] ?? '';
      if (ci < current.length) {
        ci += 1;
        setProgress({ line: li, chars: ci });
        const ch = current[ci - 1];
        // §4.5: no sound for spaces; among punctuation only full stops,
        // question marks and dashes are voiced.
        if (ch !== ' ' && !'，,、；;：:…“”"\'‘’()[]'.includes(ch)) {
          audio.play('narrative.glyph');
        }
        timer = window.setTimeout(step, THOUGHT_CHAR_MS + thoughtPauseAfter(ch) + Math.random() * 36);
      } else if (li < lines.length - 1) {
        audio.play('narrative.lineEnd');
        li += 1;
        ci = 0;
        setProgress({ line: li, chars: 0 });
        timer = window.setTimeout(step, THOUGHT_LINE_PAUSE_MS);
      } else {
        audio.play('narrative.lineEnd');
        doneRef.current = true;
      }
    };
    timer = window.setTimeout(step, THOUGHT_START_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [lines, instant]);

  const lastLine = lines[lines.length - 1] ?? '';
  const done = progress.line >= lines.length - 1 && progress.chars >= lastLine.length;

  return (
    <>
      <div aria-hidden="true" className="space-y-2.5 font-thought text-[clamp(15px,2cqh,19px)] leading-relaxed text-[#c6d1de]">
        {lines.slice(0, progress.line + 1).map((lineText, index) => {
          const visible = index < progress.line ? lineText : lineText.slice(0, progress.chars);
          const isActive = index === progress.line;
          return (
            <p key={`${lineText}-${index}`} className="min-h-[1em]">
              {visible}
              {isActive && (
                <span
                  className={`ml-[3px] inline-block h-[0.95em] w-[2px] translate-y-[0.15em] ${
                    done ? 'bg-[#8fa8c0]/40' : 'bg-[#8fa8c0]/75'
                  }`}
                  style={{ animation: 'thought-caret 1.5s ease-in-out infinite' }}
                />
              )}
            </p>
          );
        })}
      </div>
    </>
  );
};

export const MetaInteractionScene: React.FC<MetaInteractionSceneProps> = ({
  active,
  chapter,
  cameraPitchEnabled = true,
  postureControlEnabled = true,
  children,
}) => {
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const projectivePlaneRef = useRef<HTMLDivElement | null>(null);
  const pendingRef = useRef(false);
  const keyQueueRef = useRef<QueuedKey[]>([]);
  const queueRunningRef = useRef(false);
  const keyboardScopeRef = useRef(0);
  const timersRef = useRef<number[]>([]);
  const replayingButtonsRef = useRef(new WeakSet<HTMLButtonElement>());
  const inputControllersRef = useRef(new Map<string, MetaInputController>());
  const scrollGestureTimerRef = useRef<number | null>(null);
  const lastScrollGestureAtRef = useRef(0);
  const cameraPitchTarget = useMotionValue<number>(META_CAMERA_PITCH.restDeg);
  const cameraPitch = useSpring(cameraPitchTarget, {
    stiffness: 105,
    damping: 24,
    mass: 0.58,
  });
  const [pointer, setPointer] = useState<PointerPosition>({ x: 0, y: 0 });
  const [pressed, setPressed] = useState(false);
  const [interactionPending, setInteractionPending] = useState(false);
  const [keyboardTarget, setKeyboardTarget] = useState<HTMLInputElement | null>(null);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [dialogueLines, setDialogueLines] = useState<DialogueLines>(CHAPTER_ONE_DIALOGUE.entry);
  const [scrollGesture, setScrollGesture] = useState<ScrollGesture | null>(null);
  const [deviceResting, setDeviceResting] = useState(false);

  const speak = useCallback((lines: DialogueLines) => {
    if (lines.length > 0) setDialogueLines(lines);
  }, []);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  }, []);

  const registerInput = useCallback((id: string, controller: MetaInputController) => {
    inputControllersRef.current.set(id, controller);
    return () => {
      if (inputControllersRef.current.get(id) === controller) {
        inputControllersRef.current.delete(id);
      }
    };
  }, []);

  const getRestPosition = useCallback((): PointerPosition => {
    const rect = sceneRef.current?.getBoundingClientRect();
    return rect
      ? { x: rect.width * 0.85, y: rect.height * 0.46 }
      : { x: 0, y: 0 };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReducedMotion(media.matches);
    updatePreference();
    media.addEventListener?.('change', updatePreference);
    return () => media.removeEventListener?.('change', updatePreference);
  }, []);

  useEffect(() => {
    if (active) setDialogueLines(CHAPTER_ONE_DIALOGUE.entry);
  }, [active]);

  useEffect(() => {
    setDeviceResting(false);
    cameraPitchTarget.set(META_CAMERA_PITCH.restDeg);
  }, [active, cameraPitchTarget, reducedMotion]);

  useEffect(() => {
    if (!postureControlEnabled) setDeviceResting(false);
  }, [postureControlEnabled]);

  useEffect(() => {
    if (!cameraPitchEnabled) cameraPitchTarget.set(META_CAMERA_PITCH.restDeg);
  }, [cameraPitchEnabled, cameraPitchTarget]);

  useEffect(() => {
    const plane = projectivePlaneRef.current;
    if (!plane || !active || !deviceResting) {
      if (plane) {
        plane.style.transform = 'none';
        plane.dataset.projectiveState = 'upright';
      }
      return;
    }

    let animationFrame = 0;
    const startedAt = performance.now();
    const updateProjection = () => {
      const scene = sceneRef.current;
      const table = document.getElementById('meta-desk-table-art');
      const phone = document.getElementById('phone-bezel');
      if (!scene || !table || !phone) return;

      const sceneRect = scene.getBoundingClientRect();
      const tableRect = table.getBoundingClientRect();
      const phoneWidth = phone.offsetWidth;
      const phoneHeight = phone.offsetHeight;
      const source: ProjectiveQuad = [
        { x: sceneRect.width / 2 - phoneWidth / 2, y: sceneRect.height / 2 - phoneHeight / 2 },
        { x: sceneRect.width / 2 + phoneWidth / 2, y: sceneRect.height / 2 - phoneHeight / 2 },
        { x: sceneRect.width / 2 + phoneWidth / 2, y: sceneRect.height / 2 + phoneHeight / 2 },
        { x: sceneRect.width / 2 - phoneWidth / 2, y: sceneRect.height / 2 + phoneHeight / 2 },
      ];
      const tableQuad = DESK_SURFACE_QUAD.map((point) => ({
        x: tableRect.left - sceneRect.left + (point.x / DESK_IMAGE_SIZE.width) * tableRect.width,
        y: tableRect.top - sceneRect.top + (point.y / DESK_IMAGE_SIZE.height) * tableRect.height,
      })) as unknown as ProjectiveQuad;
      const target = scaleProjectiveQuad(tableQuad, DESK_PHONE_SCALE).map((point) => ({
        x: point.x,
        y: point.y + sceneRect.height * DESK_PHONE_VERTICAL_OFFSET,
      })) as unknown as ProjectiveQuad;
      plane.style.transform = formatProjectiveMatrix3d(getProjectiveTransformMatrix(source, target));
      plane.dataset.projectiveState = 'desk-quad';
    };
    const trackDeskTransition = (now: number) => {
      updateProjection();
      if (now - startedAt < 1400) animationFrame = requestAnimationFrame(trackDeskTransition);
    };

    animationFrame = requestAnimationFrame(trackDeskTransition);
    window.addEventListener('resize', updateProjection);
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', updateProjection);
    };
  }, [active, deviceResting]);

  useEffect(() => {
    if (!active) {
      clearTimers();
      keyboardScopeRef.current += 1;
      keyQueueRef.current = [];
      queueRunningRef.current = false;
      pendingRef.current = false;
      setInteractionPending(false);
      setActiveKey(null);
      setKeyboardTarget(null);
      return;
    }
    setPointer(getRestPosition());
    // The screen capture disconnects and the room's air quietly appears —
    // the first physical-space sound the player ever hears (§4.6). The
    // room tone persists for as long as the meta view exists.
    audio.play('meta.cameraPullback');
    audio.startRoomTone();
    // The phone settles into the desk composition as the camera lands.
    audio.play('meta.deskContact', { delay: 1.15 });
    // A long-held grip lets the chassis creak, rarely; the engine enforces
    // a hard 30-second minimum between creaks on top of this interval.
    const creakTimer = window.setInterval(() => audio.play('meta.deviceCreak'), 52000);
    return () => {
      window.clearInterval(creakTimer);
      audio.stopRoomTone();
    };
  }, [active, clearTimers, getRestPosition]);

  useEffect(() => clearTimers, [clearTimers]);

  useEffect(() => () => {
    if (scrollGestureTimerRef.current !== null) {
      window.clearTimeout(scrollGestureTimerRef.current);
    }
  }, []);

  const animateTap = useCallback((target: Element, onActivate?: () => void): Promise<void> => {
    if (!active || reducedMotion) {
      onActivate?.();
      return Promise.resolve();
    }

    const sceneRect = sceneRef.current?.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    if (!sceneRect) return Promise.resolve();

    pendingRef.current = true;
    setInteractionPending(true);
    // The holding hand leaves the frame: low skin-on-frame friction (§4.6).
    audio.play('meta.handDepart');
    const targetPosition = {
      x: targetRect.left - sceneRect.left + targetRect.width / 2,
      y: targetRect.top - sceneRect.top + targetRect.height / 2,
    };

    return new Promise((resolve) => {
      timersRef.current.push(window.setTimeout(() => {
        setPointer(targetPosition);
      }, META_TAP_TIMING.unfoldMs));

      timersRef.current.push(window.setTimeout(() => {
        setPressed(true);
        // Foley fires exactly when the fingertip lands, never earlier (§12).
        audio.play('meta.fingerContact');
      }, META_TAP_TIMING.unfoldMs + META_TAP_TIMING.travelMs));

      timersRef.current.push(window.setTimeout(() => {
        setPressed(false);
        // The pad peels off the glass as the tap registers (§4.6).
        audio.play('meta.fingerRelease');
        onActivate?.();
      }, META_TAP_TIMING.unfoldMs + META_TAP_TIMING.travelMs + META_TAP_TIMING.pressMs));

      timersRef.current.push(window.setTimeout(() => {
        setPointer(getRestPosition());
        timersRef.current.push(window.setTimeout(() => {
          pendingRef.current = false;
          setInteractionPending(false);
          // The right hand settles back onto the frame (§4.6).
          audio.play('meta.regrip');
          resolve();
        }, META_TAP_TIMING.settleMs));
      }, META_TAP_TIMING.unfoldMs + META_TAP_TIMING.travelMs + META_TAP_TIMING.pressMs + META_TAP_TIMING.releaseMs));
    });
  }, [active, getRestPosition, reducedMotion]);

  const tapElement = useCallback((id: string, onActivate: () => void) => {
    const target = document.getElementById(id);
    if (!target || !canStartMetaInteraction(active, pendingRef.current, reducedMotion)) {
      onActivate();
      return;
    }
    void animateTap(target, onActivate);
  }, [active, animateTap, reducedMotion]);

  const applyQueuedKey = useCallback((input: HTMLInputElement, key: string) => {
    const controller = inputControllersRef.current.get(input.id);
    if (!controller) return;
    // Enter's confirm sound belongs to the submit handler, not the key.
    if (key === 'Backspace') {
      audio.play('key.backspace');
    } else if (key === ' ' || key === '_') {
      audio.play('key.space');
    } else if (key.length === 1) {
      audio.play('key.character');
    }
    const currentValue = controller.getValue();
    const result = applyVirtualKey(currentValue, key);
    if (result.value !== currentValue) controller.onChange(result.value);
    if (result.submit) {
      controller.onSubmit();
      setKeyboardTarget(null);
      input.blur();
    }
  }, []);

  const processKeyQueue = useCallback(async () => {
    if (queueRunningRef.current) return;
    queueRunningRef.current = true;

    while (keyQueueRef.current.length > 0) {
      const next = keyQueueRef.current.shift();
      if (!next || !next.input.isConnected) continue;
      const scope = keyboardScopeRef.current;

      setActiveKey(next.key);
      const visualKey = sceneRef.current?.querySelector<HTMLElement>(`[data-meta-key="${next.key}"]`);
      if (visualKey) {
        await animateTap(visualKey, () => {
          if (scope === keyboardScopeRef.current && next.input.isConnected) {
            applyQueuedKey(next.input, next.key);
          }
        });
      } else if (scope === keyboardScopeRef.current) {
        applyQueuedKey(next.input, next.key);
      }
      setActiveKey(null);
    }

    queueRunningRef.current = false;
  }, [animateTap, applyQueuedKey]);

  const enqueueKey = useCallback((input: HTMLInputElement, key: string) => {
    keyQueueRef.current.push({ input, key });
    void processKeyQueue();
  }, [processKeyQueue]);

  const closeKeyboard = useCallback(() => {
    keyboardScopeRef.current += 1;
    keyQueueRef.current = [];
    setKeyboardTarget(null);
    setActiveKey(null);
  }, []);

  const handleClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!active) return;
    const source = event.target;
    if (!(source instanceof Element)) return;

    const phone = document.getElementById('phone-bezel');
    const targetInsidePhone = Boolean(source.closest('#phone-bezel')) || Boolean(
      phone && isPointInsideProjectiveQuad(
        { x: event.clientX, y: event.clientY },
        getPhoneCollisionQuad(phone),
      ),
    );
    const postureAction = postureControlEnabled
      ? getMetaDevicePostureAction(
          active,
          pendingRef.current,
          targetInsidePhone,
          deviceResting,
        )
      : null;
    if (postureAction) {
      const nextResting = postureAction === 'rest';
      setDeviceResting(nextResting);
      setScrollGesture(null);
      closeKeyboard();
      cameraPitchTarget.set(META_CAMERA_PITCH.restDeg);
      if (nextResting) {
        audio.play('meta.handDepart');
        audio.play('meta.deskContact', { delay: 0.48 });
      } else {
        audio.play('meta.regrip');
      }

      // A click on the resting screen lifts the device immediately, then keeps
      // travelling through the normal input path so the requested tap is not
      // discarded. Clicks outside the visible device quad only change posture
      // and have no second action.
      if (!targetInsidePhone) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
    }

    if (source.closest('[data-meta-immediate="true"]')) return;

    const input = source.closest('input');
    const button = source.closest('button');
    const target = input ?? button;
    if (!target || !sceneRef.current?.contains(target)) return;

    if (button instanceof HTMLButtonElement && replayingButtonsRef.current.has(button)) {
      replayingButtonsRef.current.delete(button);
      return;
    }

    if (reducedMotion) {
      if (isViewTubeSearch(target)) setKeyboardTarget(target);
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    if (!canStartMetaInteraction(active, pendingRef.current, reducedMotion)) return;

    if (isViewTubeSearch(target)) {
      void animateTap(target, () => {
        target.focus();
        setKeyboardTarget(target);
      });
      return;
    }

    if (button instanceof HTMLButtonElement && !button.disabled) {
      closeKeyboard();
      void animateTap(button, () => {
        replayingButtonsRef.current.add(button);
        button.click();
      });
    }
  };

  const handleKeyDownCapture = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!active || !event.nativeEvent.isTrusted) return;
    const input = event.target;
    if (!isViewTubeSearch(input)) return;
    const key = normalizeVirtualKey(event.key);
    if (!key || event.ctrlKey || event.altKey || event.metaKey) return;

    event.preventDefault();
    event.stopPropagation();
    setKeyboardTarget(input);
    if (reducedMotion) {
      applyQueuedKey(input, key);
      return;
    }
    enqueueKey(input, key);
  };

  const handleWheelCapture = (event: React.WheelEvent<HTMLDivElement>) => {
    if (!active || reducedMotion || interactionPending) return;
    const source = event.target;
    if (!(source instanceof Element) || !source.closest('#phone-bezel')) return;

    const travelY = getScrollFingerTravel(event.deltaY);
    if (travelY === 0) return;
    const now = performance.now();
    if (now - lastScrollGestureAtRef.current < 180) return;
    lastScrollGestureAtRef.current = now;
    // Fine finger-on-glass friction; length follows the travel (§4.6).
    audio.play('meta.fingerSwipe', { intensity: Math.min(1, Math.abs(travelY) / 30) });

    // Scrolling past the end of a list answers with a soft bounce (§4.3).
    let scrollable: HTMLElement | null = source instanceof HTMLElement ? source : null;
    while (scrollable && scrollable.id !== 'meta-interaction-scene') {
      const overflowY = window.getComputedStyle(scrollable).overflowY;
      if ((overflowY === 'auto' || overflowY === 'scroll') && scrollable.scrollHeight > scrollable.clientHeight + 2) break;
      scrollable = scrollable.parentElement;
    }
    if (scrollable && scrollable.id !== 'meta-interaction-scene') {
      // The Meta layer owns this wheel event, so relay it to the phone list instead
      // of leaving the gesture visible while the underlying list stays still.
      event.preventDefault();
      scrollable.scrollBy({ top: event.deltaY, behavior: 'auto' });
      const atTop = scrollable.scrollTop <= 1 && event.deltaY < 0;
      const atBottom = scrollable.scrollTop + scrollable.clientHeight >= scrollable.scrollHeight - 1 && event.deltaY > 0;
      if (atTop || atBottom) audio.play('phone.scrollLimit');
    }

    setScrollGesture((previous) => ({
      nonce: (previous?.nonce ?? 0) + 1,
      travelY,
    }));
    if (scrollGestureTimerRef.current !== null) {
      window.clearTimeout(scrollGestureTimerRef.current);
    }
    scrollGestureTimerRef.current = window.setTimeout(() => {
      setScrollGesture(null);
      scrollGestureTimerRef.current = null;
    }, 560);
  };

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!active || !cameraPitchEnabled || deviceResting || reducedMotion || event.pointerType !== 'mouse') return;
    const rect = sceneRef.current?.getBoundingClientRect();
    if (!rect) return;
    cameraPitchTarget.set(getMetaCameraPitch(event.clientY - rect.top, rect.height));
  }, [active, cameraPitchEnabled, cameraPitchTarget, deviceResting, reducedMotion]);

  const handlePointerLeave = useCallback(() => {
    cameraPitchTarget.set(META_CAMERA_PITCH.restDeg);
  }, [cameraPitchTarget, deviceResting]);

  const contextValue = useMemo<MetaInteractionContextValue>(() => ({
    active,
    registerInput,
    speak,
    tapElement,
  }), [active, registerInput, speak, tapElement]);

  // Hands are never perfectly still: a slow breathing drift applied inside
  // the entrance containers, mirrored per hand so both layers stay fused.
  const idleDrift = (duration: number) => (reducedMotion
    ? {}
    : {
        animate: { y: [0, 2.2, 0], rotate: [0, 0.3, 0] },
        transition: { repeat: Infinity, duration, ease: 'easeInOut' as const },
      });

  // The reaching hand travels on a spring so arrivals decelerate like a real
  // wrist instead of easing on rails; opacity is kept on a short fade so the
  // grip-to-reach handoff reads as one motion.
  const travelTransition = reducedMotion
    ? { duration: 0 }
    : {
        type: 'spring' as const,
        stiffness: 300,
        damping: 30,
        mass: 0.72,
        opacity: { duration: 0.16, ease: 'easeOut' as const },
      };

  const gripSwapTransition = reducedMotion
    ? { duration: 0 }
    : {
        type: 'spring' as const,
        stiffness: 240,
        damping: 26,
        opacity: { duration: 0.2, ease: 'easeOut' as const },
      };

  const cameraPitchStyle = active
    ? (!cameraPitchEnabled || reducedMotion
        ? (deviceResting ? 0 : META_CAMERA_PITCH.restDeg)
        : (deviceResting ? 0 : cameraPitch))
    : 0;
  const wallStage = getMetaWallStage(chapter);
  const floorStage = getMetaFloorStage(chapter);
  const chapterClock = chapter === 0 ? null : getChapterPhoneWidgetState(chapter).clock;

  return (
    <MetaInteractionContext.Provider value={contextValue}>
    <div
      ref={sceneRef}
      className={`relative h-full w-full overflow-hidden ${active ? 'bg-[#17130f]' : 'bg-transparent'}`}
      onClickCapture={handleClickCapture}
      onKeyDownCapture={handleKeyDownCapture}
      onWheelCapture={handleWheelCapture}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      data-meta-view={active ? 'revealed' : 'screen-capture'}
      data-camera-pitch-control={active ? (!cameraPitchEnabled ? 'disabled' : deviceResting ? 'locked-table' : 'mouse-y') : 'inactive'}
      data-posture-control={postureControlEnabled ? 'enabled' : 'disabled'}
      data-device-posture={deviceResting ? 'table-rest' : 'upright'}
      data-meta-pending={interactionPending ? 'true' : 'false'}
      data-hand-pose={interactionPending ? 'reaching' : 'holding'}
      data-environment-chapter={chapter}
      id="meta-interaction-scene"
    >
      <style>{`#meta-terminal-dialogue { background-color: rgb(13 19 27 / 0.52) !important; backdrop-filter: blur(1px) !important; }`}</style>
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.9 }}
            className="absolute inset-0"
            aria-hidden="true"
          >
            <div className="absolute inset-0 bg-black" />
            <MetaWindowScene stage={wallStage} reducedMotion={reducedMotion} />
            {wallStage > 0 && (
              <div
                className="pointer-events-none absolute inset-0 z-[1] overflow-hidden"
                data-wall-stage={wallStage}
                data-floor-treatment="wall-over-floor"
                id="meta-wall-surface"
              >
                <img
                  src={`/assets/meta-wall-stage-${wallStage}.png`}
                  alt=""
                  className="absolute left-[-10%] top-[-11.6%] h-[94.6%] w-[120%] max-w-none object-fill"
                  data-source-floor="visible-over-floor"
                  id="meta-wall-art"
                />
                {chapterClock && <MetaWallClock time={chapterClock} />}
              </div>
            )}
            {floorStage > 0 && (
              <img
                src={`/assets/meta-floor-stage-${floorStage}.png`}
                alt=""
                className="pointer-events-none absolute left-1/2 top-[28%] z-[0] h-full w-[180%] max-w-none -translate-x-1/2 object-fill"
                data-floor-stage={floorStage}
                data-visible-crop="upper-two-thirds"
                id="meta-floor-art"
              />
            )}
            <div className="absolute inset-x-0 top-[59%] h-px bg-amber-100/15 shadow-[0_1px_18px_rgba(255,210,150,0.08)]" />
            <div className="absolute left-[7%] top-[8%] h-36 w-36 rounded-full bg-amber-100/12 blur-[70px]" />
            <div className="absolute right-[9%] top-[12%] h-28 w-28 rounded-full bg-sky-200/5 blur-[65px]" />

            <motion.img
              src="/assets/meta-desk-table.png"
              alt=""
              initial={false}
              animate={deviceResting
                ? { scaleX: 0.36, scaleY: 0.72, y: '-1%' }
                : { scaleX: 1, scaleY: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.82, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-none absolute left-1/2 top-[-40%] z-[2] h-[212%] w-auto max-w-none"
              style={{ x: '-50%', transformOrigin: '50% 50%' }}
              data-desk-perspective={deviceResting ? 'flattened-trapezoid' : 'raised-front-edge'}
              id="meta-desk-table-art"
            />
            <ChapterEnvironment chapter={chapter} reducedMotion={reducedMotion} layer="lighting" />
            <div className="absolute left-1/2 top-[57%] h-[12%] w-[64%] -translate-x-1/2 rounded-[50%] bg-black/55 blur-2xl" />
            <div className="absolute bottom-[7%] right-[5%] h-[13%] w-[13%] rotate-6 rounded-md border border-amber-100/5 bg-black/15 shadow-xl" />
            <div className="absolute right-[10%] top-[14%] text-[9px] font-mono tracking-[0.32em] text-amber-100/25">CAM_02 · REC</div>
          </motion.div>
        )}
      </AnimatePresence>

      {active && <ChapterEnvironment chapter={chapter} reducedMotion={reducedMotion} layer="underlay" deviceResting={deviceResting} />}

      {active && (
        <motion.div
          animate={deviceResting
            ? { opacity: 0.72, scaleX: 1.04, scaleY: 0.42, y: '8%' }
            : { opacity: 0.38, scaleX: 0.82, scaleY: 0.78, y: '-7%' }}
          transition={{ duration: reducedMotion ? 0 : 0.82, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none absolute left-[18%] top-[53%] z-[9] h-[18%] w-[64%] rounded-[50%] bg-black blur-2xl"
          aria-hidden="true"
          id="meta-device-contact-shadow"
        />
      )}

      <AnimatePresence>
        {active && (
          <>
            <motion.div
              initial={{ opacity: 0, x: -54, y: 30 }}
              animate={{ opacity: 1, x: 0, y: 0, rotate: -1.5 }}
              exit={{ opacity: 0 }}
              transition={{ delay: reducedMotion ? 0 : 0.5, duration: reducedMotion ? 0 : 0.62 }}
              className="pointer-events-none absolute bottom-[30%] left-[-7%] z-[8] hidden h-[48%] w-[29%] min-w-44"
              aria-hidden="true"
              id="meta-left-grip-back"
            >
              <motion.div className="h-full w-full" {...idleDrift(6.4)}>
                <LeftGripBack />
              </motion.div>
            </motion.div>

            <motion.div
              animate={{
                opacity: interactionPending ? 0 : 1,
                x: interactionPending ? 26 : 0,
                y: interactionPending ? -14 : 0,
                rotate: 1.8,
              }}
              initial={false}
              transition={gripSwapTransition}
              className="pointer-events-none absolute bottom-[29%] right-[-7%] z-[8] hidden h-[48%] w-[28%] min-w-44"
              aria-hidden="true"
              id="meta-right-hold-back"
            >
              <motion.div className="h-full w-full" {...idleDrift(5.7)}>
                <RightGripBack />
              </motion.div>
            </motion.div>

            <motion.div
              animate={{
                x: pointer.x,
                y: pointer.y,
                opacity: interactionPending && pointer.x > 0 ? 1 : 0,
              }}
              initial={false}
              transition={travelTransition}
              className="pointer-events-none absolute left-0 top-0 z-[8] hidden h-0 w-0"
              aria-hidden="true"
              id="meta-tapping-hand-back"
            >
              <RightHandBack pressed={pressed} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <motion.div
        className={`${active ? 'phone-stage' : ''} absolute inset-0 z-10 flex items-center justify-center`}
        animate={active
          ? (deviceResting ? { scale: 1, y: '0%' } : { scale: 0.92, y: '-13%' })
          : { scale: 1, y: '0%' }}
        style={{ perspective: PHONE_PERSPECTIVE }}
        transition={{ duration: reducedMotion ? 0 : 1.05, ease: [0.22, 1, 0.36, 1] }}
        id="meta-phone-camera-frame"
      >
        <div
          ref={projectivePlaneRef}
          className="absolute inset-0 [transform-origin:0_0] [transform-style:preserve-3d]"
          data-projective-state="upright"
          id="meta-device-projective-plane"
        >
        <motion.div
          className="absolute inset-0 flex items-center justify-center [transform-style:preserve-3d]"
          animate={active
            ? (deviceResting ? { rotateY: 0, rotateZ: 0 } : { rotateY: -1.4, rotateZ: -0.35 })
            : { rotateY: 0, rotateZ: 0 }}
          style={{
            rotateX: cameraPitchStyle,
            transformOrigin: '50% 72%',
            transformPerspective: PHONE_PERSPECTIVE,
          }}
          transition={{ duration: reducedMotion ? 0 : 1.05, ease: [0.22, 1, 0.36, 1] }}
          id="meta-device-tilt"
        >
          {active && (
            <>
              <div
                className="pointer-events-none absolute left-1/2 top-1/2 rounded-[calc(var(--phone-radius)+5px)] border-[calc(var(--phone-border)+4px)] border-[#16191e] bg-[linear-gradient(145deg,#f2f4f5_0%,#707780_9%,#252a31_28%,#9299a1_55%,#20242a_78%,#07090c_100%)] shadow-[18px_30px_34px_rgba(0,0,0,0.72),inset_0_2px_2px_rgba(255,255,255,0.75),inset_0_-5px_8px_rgba(0,0,0,0.78)]"
                style={{ ...PHONE_SURFACE_SIZE, transform: 'translate3d(-47.7%, -47.1%, -28px)' }}
                id="meta-phone-depth"
              />
              <div
                className="pointer-events-none absolute left-1/2 top-1/2 rounded-[calc(var(--phone-radius)+2px)] border-[calc(var(--phone-border)+1px)] border-[#555c65] bg-[linear-gradient(135deg,#d9dde1,#343a43_34%,#868d96_68%,#171b20)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),inset_0_-3px_5px_rgba(0,0,0,0.7)]"
                style={{ ...PHONE_SURFACE_SIZE, transform: 'translate3d(-48.9%, -48.6%, -12px)' }}
                id="meta-phone-midframe"
              />
            </>
          )}

          {children}

          <AnimatePresence>
            {active && keyboardTarget && (
              <div
                className="pointer-events-none absolute left-1/2 top-1/2 z-[18] overflow-hidden rounded-[var(--phone-radius)]"
                style={{ ...PHONE_SURFACE_SIZE, transform: 'translate3d(-50%, -50%, 12px)' }}
                data-meta-keyboard-surface="phone-screen"
              >
                <motion.div
                  initial={{ opacity: 0, y: 90 }}
                  animate={{ opacity: 0.6, y: 0 }}
                  exit={{ opacity: 0, y: 90 }}
                  transition={{ duration: reducedMotion ? 0 : 0.28 }}
                  className="pointer-events-auto absolute inset-x-[8%] bottom-[7%] rounded-2xl border border-white/15 bg-[#111318]/95 p-2 shadow-[0_12px_36px_rgba(0,0,0,0.62)] backdrop-blur-xl"
                  data-meta-immediate="true"
                  data-meta-keyboard="true"
                  id="meta-virtual-keyboard"
                >
                  <div className="mb-1 flex items-center justify-between px-1 font-mono text-[8px] text-slate-400">
                    <span>ARC LITE VIRTUAL INPUT</span>
                    <span className="text-emerald-300">HAND RELAY ACTIVE</span>
                  </div>
                  <div className="space-y-1">
                    {KEYBOARD_ROWS.map((row, rowIndex) => (
                      <div key={rowIndex} className="flex justify-center gap-1">
                        {row.map((key) => (
                          <button
                            key={key}
                            type="button"
                            data-meta-key={key}
                            data-meta-immediate="true"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => enqueueKey(keyboardTarget, key)}
                            className={`h-7 min-w-7 rounded-md border px-1.5 font-mono text-[9px] transition-colors ${
                              key === activeKey
                                ? 'border-emerald-200 bg-emerald-400/40 text-white'
                                : 'border-slate-500/80 bg-slate-700 text-white'
                            } ${key === 'Backspace' || key === 'Enter' ? 'min-w-16' : ''}`}
                            aria-label={`Virtual key ${key}`}
                          >
                            {key === 'Backspace' ? '⌫' : key === 'Enter' ? 'ENTER' : key}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {active && (
            <>
              <div
                className="pointer-events-none absolute left-1/2 top-1/2 overflow-hidden rounded-[var(--phone-radius)] border border-white/25 shadow-[inset_2px_2px_2px_rgba(255,255,255,0.28),inset_-3px_-4px_7px_rgba(0,0,0,0.62),0_0_0_1px_rgba(10,12,15,0.8)]"
                style={{ ...PHONE_SURFACE_SIZE, transform: 'translate3d(-50%, -50%, 8px)' }}
                id="meta-glass-reflection"
              >
                <div
                  className="absolute inset-0 opacity-80"
                  style={{
                    background:
                      'linear-gradient(116deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.045) 13%, transparent 27%, transparent 60%, rgba(150,205,255,0.075) 73%, transparent 88%), radial-gradient(ellipse at 24% -8%, rgba(255,244,220,0.2), transparent 42%)',
                  }}
                />
                <div className="absolute -left-[18%] -top-[45%] h-[120%] w-[32%] rotate-[24deg] bg-gradient-to-r from-transparent via-white/10 to-transparent blur-sm" />
              </div>
              <div
                className="pointer-events-none absolute left-1/2 top-1/2 rounded-[var(--phone-radius)] border-t-2 border-l border-white/40 border-r border-r-black/55 border-b-2 border-b-black/70"
                style={{ ...PHONE_SURFACE_SIZE, transform: 'translate3d(-50%, -50%, 10px)' }}
                id="meta-phone-beveled-rim"
              />
            </>
          )}
        </motion.div>
        </div>
      </motion.div>

      {active && <ChapterEnvironment chapter={chapter} reducedMotion={reducedMotion} layer="objects" deviceResting={deviceResting} />}

      <AnimatePresence>
        {active && (
          <>
            <motion.img
              src="/assets/meta-hand-grip.png"
              alt=""
              draggable={false}
              initial={{ opacity: 0, x: -24 }}
              animate={{
                opacity: deviceResting ? 0 : 1,
                x: deviceResting ? '-3%' : 0,
                y: deviceResting ? '5%' : 0,
                scale: deviceResting ? 0.98 : 1,
              }}
              transition={{ duration: reducedMotion ? 0 : 0.62, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-none absolute left-[-3%] top-0 z-[22] h-full w-full select-none object-fill drop-shadow-[0_16px_14px_rgba(0,0,0,0.28)]"
              style={{
                clipPath: 'inset(0 50% 0 0)',
                rotateX: cameraPitchStyle,
                transformOrigin: '50% 72%',
                transformPerspective: 1500,
              }}
              data-hand-edge-offset="-3%"
              aria-hidden="true"
              id="meta-left-hand-asset"
            />

            <motion.img
              src="/assets/meta-hand-grip.png"
              alt=""
              draggable={false}
              animate={{
                opacity: deviceResting || interactionPending || scrollGesture ? 0 : 1,
                x: interactionPending ? 18 : deviceResting ? '3%' : 0,
                y: deviceResting ? '5%' : 0,
                scale: deviceResting ? 0.98 : 1,
              }}
              initial={false}
              transition={{ duration: reducedMotion ? 0 : deviceResting ? 0.82 : 0.42, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-none absolute right-[-3%] top-0 z-[22] h-full w-full select-none object-fill drop-shadow-[0_16px_14px_rgba(0,0,0,0.28)]"
              style={{
                clipPath: 'inset(0 0 0 50%)',
                rotateX: cameraPitchStyle,
                transformOrigin: '50% 72%',
                transformPerspective: 1500,
              }}
              data-hand-edge-offset="3%"
              aria-hidden="true"
              id="meta-right-hand-asset"
            />

            <motion.img
              src="/assets/meta-resting-hands.png"
              alt=""
              draggable={false}
              initial={false}
              animate={{
                opacity: deviceResting ? 1 : 0,
                x: deviceResting ? '-8%' : 0,
                y: deviceResting ? '10%' : '12%',
                rotateX: deviceResting ? 4 : 18,
                rotateZ: deviceResting ? -8 : 0,
                scale: deviceResting ? 0.46 : 0.46,
              }}
              transition={{ duration: reducedMotion ? 0 : 0.72, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-none absolute left-0 top-0 z-[22] h-full w-full select-none object-fill drop-shadow-[0_12px_10px_rgba(0,0,0,0.24)]"
              style={{
                clipPath: 'inset(0 50% 0 0)',
                transformOrigin: '25% 100%',
                transformPerspective: 1500,
              }}
              data-resting-hand-perspective="desk-plane"
              data-wrist-crop="below-scene-edge"
              aria-hidden="true"
              id="meta-left-resting-hand"
            />

            <motion.img
              src="/assets/meta-resting-hands.png"
              alt=""
              draggable={false}
              initial={false}
              animate={{
                opacity: deviceResting && !interactionPending && !scrollGesture ? 1 : 0,
                x: deviceResting ? '8%' : 0,
                y: deviceResting ? '10%' : '12%',
                rotateX: deviceResting ? 4 : 18,
                rotateZ: deviceResting ? 8 : 0,
                scale: deviceResting ? 0.46 : 0.46,
              }}
              transition={{ duration: reducedMotion ? 0 : 0.72, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-none absolute left-0 top-0 z-[22] h-full w-full select-none object-fill drop-shadow-[0_12px_10px_rgba(0,0,0,0.24)]"
              style={{
                clipPath: 'inset(0 0 0 50%)',
                transformOrigin: '75% 100%',
                transformPerspective: 1500,
              }}
              data-resting-hand-perspective="desk-plane"
              data-wrist-crop="below-scene-edge"
              aria-hidden="true"
              id="meta-right-resting-hand"
            />

            <AnimatePresence>
              {scrollGesture && (
                <motion.div
                  key={scrollGesture.nonce}
                  initial={{ opacity: 0, y: scrollGesture.travelY * -0.42 }}
                  animate={{
                    opacity: [0, 1, 1, 0],
                    y: [scrollGesture.travelY * -0.42, 0, scrollGesture.travelY],
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.52, times: [0, 0.16, 1], ease: 'easeOut' }}
                  className="pointer-events-none absolute left-[76%] top-[39%] z-[60] h-0 w-0"
                  style={{
                    rotateX: cameraPitchStyle,
                    transformOrigin: '0 0',
                    transformPerspective: 1500,
                  }}
                  data-scroll-direction={scrollGesture.travelY < 0 ? 'finger-up' : 'finger-down'}
                  aria-hidden="true"
                  id="meta-scroll-finger"
                >
                  <img
                    src="/assets/meta-tapping-finger.png"
                    alt=""
                    draggable={false}
                    className="absolute left-0 top-0 h-[clamp(441px,64.5vh,630px)] w-auto max-w-none select-none drop-shadow-[0_14px_12px_rgba(0,0,0,0.3)]"
                    style={{ transformOrigin: '83% 13%', translate: '-83% -13%', rotate: '-90deg' }}
                    data-finger-orientation="upper-left"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, x: -42, y: 18 }}
              animate={{ opacity: 1, x: 0, y: 0, rotate: -2.5 }}
              transition={{ delay: reducedMotion ? 0 : 0.62, duration: reducedMotion ? 0 : 0.55 }}
              className="pointer-events-none absolute left-[-10%] top-[20%] z-20 hidden h-[26%] w-[22%] min-w-36"
              aria-hidden="true"
              id="meta-left-hand"
            >
              <motion.div className="h-full w-full" {...idleDrift(6.4)}>
                <LeftGripFront />
              </motion.div>
            </motion.div>

            <motion.div
              animate={{
                opacity: interactionPending ? 0 : 1,
                x: interactionPending ? 26 : 0,
                y: interactionPending ? -14 : 0,
                rotate: 3.2,
              }}
              initial={false}
              transition={gripSwapTransition}
              className="pointer-events-none absolute right-[-9%] top-[21%] z-20 hidden h-[25%] w-[21%] min-w-36"
              aria-hidden="true"
              id="meta-right-hold-front"
            >
              <motion.div className="h-full w-full" {...idleDrift(5.7)}>
                <RightGripFront />
              </motion.div>
            </motion.div>

            <motion.div
              animate={{
                x: pointer.x,
                y: pointer.y,
                opacity: interactionPending && pointer.x > 0 ? 1 : 0,
              }}
              initial={false}
              transition={travelTransition}
              className="pointer-events-none absolute left-0 top-0 z-[60] h-0 w-0"
              style={{
                rotateX: cameraPitchStyle,
                transformOrigin: '0 0',
                transformPerspective: 1500,
              }}
              aria-hidden="true"
              id="meta-pointer-hand"
            >
              <motion.img
                src="/assets/meta-tapping-finger.png"
                alt=""
                draggable={false}
                className="absolute left-0 top-0 h-[clamp(441px,64.5vh,630px)] w-auto max-w-none select-none drop-shadow-[0_14px_12px_rgba(0,0,0,0.3)]"
                style={{ transformOrigin: '83% 13%', translate: '-83% -13%', rotate: '-90deg' }}
                initial={false}
                animate={{ y: pressed ? 5 : 0, scale: pressed ? 0.98 : 1 }}
                transition={reducedMotion ? { duration: 0 } : HAND_PRESS_SPRING}
                data-finger-orientation="upper-left"
                aria-hidden="true"
                id="meta-tapping-finger-asset"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reducedMotion ? 0 : 1.05, duration: reducedMotion ? 0 : 0.7, ease: 'easeOut' }}
              className="absolute bottom-[2.5%] left-1/2 z-[70] min-h-[19%] w-[92%] -translate-x-1/2 rounded-[6px] bg-[#0d131b]/[0.82] px-7 py-5 shadow-[0_18px_50px_rgba(0,0,0,0.5)] backdrop-blur-[3px]"
              id="meta-terminal-dialogue"
            >
              <style>{`@keyframes thought-caret { 0%, 52% { opacity: 1; } 68%, 100% { opacity: 0.12; } }`}</style>

              {/* An unfinished frame: cold metal edges that never quite close */}
              <span aria-hidden="true" className="pointer-events-none absolute left-0 top-0 h-px w-[58%] bg-gradient-to-r from-[#61758a]/60 via-[#4a5a6b]/35 to-transparent" />
              <span aria-hidden="true" className="pointer-events-none absolute left-0 top-0 h-[64%] w-px bg-gradient-to-b from-[#61758a]/50 to-transparent" />
              <span aria-hidden="true" className="pointer-events-none absolute bottom-0 right-0 h-px w-16 bg-[#4a5a6b]/45" />
              <span aria-hidden="true" className="pointer-events-none absolute bottom-0 right-0 h-9 w-px bg-[#4a5a6b]/45" />

              {/* Night fog drifting through the layer, and two faint scuffs */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-[6px]"
                style={{
                  background:
                    'radial-gradient(85% 130% at 16% -6%, rgba(158,180,202,0.055), transparent 56%), radial-gradient(60% 90% at 86% 112%, rgba(110,132,155,0.045), transparent 70%)',
                }}
              />
              <span aria-hidden="true" className="pointer-events-none absolute left-[24%] top-0 h-full w-px rotate-[14deg] bg-[#cfe0f2]/[0.03]" />
              <span aria-hidden="true" className="pointer-events-none absolute left-[71%] top-0 h-full w-px rotate-[-9deg] bg-[#cfe0f2]/[0.02]" />

              {/* Who is thinking — a small matte toy-button, nothing more */}
              <div className="mb-4 flex items-center gap-2.5">
                <span aria-hidden="true" className="h-[7px] w-[7px] rounded-[2px] border border-[#8ba4bd]/30 bg-[#66809a]/45" />
                <span className="font-thought text-[11px] tracking-[0.3em] text-[#94a3b4]" id="meta-protagonist-name">
                  {PROTAGONIST_LABEL}
                </span>
              </div>

              {/* Screen readers get the whole thought at once, not keystrokes */}
              <div className="sr-only" aria-live="polite">
                {dialogueLines.map((line, index) => (
                  <p key={`${line}-${index}`}>{line}</p>
                ))}
              </div>

              {/* The thought, arriving one keystroke at a time */}
              <TypewriterThoughts lines={dialogueLines} instant={reducedMotion} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
    </MetaInteractionContext.Provider>
  );
};
