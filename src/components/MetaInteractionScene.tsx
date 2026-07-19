import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Terminal } from 'lucide-react';
import {
  applyVirtualKey,
  canStartMetaInteraction,
  META_TAP_TIMING,
  normalizeVirtualKey,
} from '../lib/metaInteraction';

interface MetaInteractionSceneProps {
  active: boolean;
  children: React.ReactNode;
}

interface PointerPosition {
  x: number;
  y: number;
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
}

const MetaInteractionContext = createContext<MetaInteractionContextValue>({
  active: false,
  registerInput: () => () => undefined,
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

const LeftGripBack = () => (
  <svg
    viewBox="0 0 340 360"
    className="h-full w-full overflow-visible drop-shadow-[0_22px_18px_rgba(0,0,0,0.48)]"
    role="presentation"
  >
    <defs>
      <linearGradient id="left-skin-back" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#efc2a1" />
        <stop offset="0.48" stopColor="#c98968" />
        <stop offset="1" stopColor="#754531" />
      </linearGradient>
      <linearGradient id="left-sleeve" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#15171c" />
        <stop offset="1" stopColor="#343942" />
      </linearGradient>
    </defs>

    <path d="M0 360V270C35 245 69 236 105 243L151 360Z" fill="url(#left-sleeve)" />
    <path
      d="M68 360C74 313 82 270 105 224C126 182 157 144 195 124C225 108 257 114 276 139C294 163 291 196 272 222L230 281L207 360Z"
      fill="url(#left-skin-back)"
    />

    <g fill="url(#left-skin-back)" stroke="#8f5a43" strokeWidth="3">
      <path d="M208 92C208 73 222 57 240 57H307C324 57 337 70 337 86C337 102 324 114 307 114H239C222 114 208 105 208 92Z" />
      <path d="M205 133C205 115 220 101 238 101H316C330 101 340 112 340 126C340 141 329 152 314 152H236C219 152 205 146 205 133Z" />
      <path d="M207 174C207 157 221 144 239 144H312C326 144 337 155 337 169C337 183 326 194 311 194H239C221 194 207 188 207 174Z" />
      <path d="M215 214C215 198 229 186 246 186H301C315 186 326 197 326 211C326 225 315 236 300 236H245C228 236 215 229 215 214Z" />
    </g>

    <g fill="none" stroke="#70422f" strokeLinecap="round" strokeWidth="3" opacity="0.42">
      <path d="M236 77H295" />
      <path d="M235 121H302" />
      <path d="M237 163H298" />
      <path d="M246 205H289" />
      <path d="M114 283C145 277 171 285 190 307" />
    </g>
  </svg>
);

const LeftGripFront = () => (
  <svg
    viewBox="0 0 270 210"
    className="h-full w-full overflow-visible drop-shadow-[0_10px_10px_rgba(0,0,0,0.38)]"
    role="presentation"
  >
    <defs>
      <linearGradient id="left-skin-front" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#f2c8a8" />
        <stop offset="0.52" stopColor="#cb8d6d" />
        <stop offset="1" stopColor="#7b4934" />
      </linearGradient>
    </defs>

    <path
      d="M22 194C28 151 48 118 81 94C110 73 142 65 170 69C190 72 208 85 216 105C224 125 219 148 204 164C185 184 157 199 122 207H55C40 207 28 202 22 194Z"
      fill="url(#left-skin-front)"
      stroke="#8a543e"
      strokeWidth="3"
    />
    <path
      d="M119 111C124 87 141 57 163 33C181 13 203 5 220 14C238 24 242 46 230 64L192 121C179 140 156 149 138 140C124 133 116 123 119 111Z"
      fill="url(#left-skin-front)"
      stroke="#8a543e"
      strokeWidth="3"
      id="meta-left-thumb"
    />
    <path d="M181 25C193 17 207 17 217 23" fill="none" stroke="#f8dec9" strokeLinecap="round" strokeWidth="8" opacity="0.7" />
    <path d="M151 109C164 116 177 119 190 116" fill="none" stroke="#7a4634" strokeLinecap="round" strokeWidth="3" opacity="0.5" />
    <path d="M71 157C103 145 130 148 151 165" fill="none" stroke="#7a4634" strokeLinecap="round" strokeWidth="3" opacity="0.42" />
  </svg>
);

interface InteractiveHandProps {
  pressed: boolean;
}

const RightHandBack: React.FC<InteractiveHandProps> = ({ pressed }) => (
  <div className="absolute left-0 top-0 h-[clamp(190px,30vh,285px)] w-[clamp(145px,18vw,220px)] -translate-x-[30%] -translate-y-[1%]">
    <motion.svg
      viewBox="0 0 230 300"
      animate={{ rotate: pressed ? -5 : 0, scale: pressed ? 0.96 : 1 }}
      className="h-full w-full origin-[30%_1%] overflow-visible drop-shadow-[0_22px_18px_rgba(0,0,0,0.5)]"
      role="presentation"
    >
    <defs>
      <linearGradient id="right-skin-back" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#edbd9c" />
        <stop offset="0.5" stopColor="#c68464" />
        <stop offset="1" stopColor="#70402f" />
      </linearGradient>
      <linearGradient id="right-sleeve" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#353a44" />
        <stop offset="1" stopColor="#111319" />
      </linearGradient>
    </defs>

    <path d="M95 300L101 224C127 206 165 205 196 222L230 256V300Z" fill="url(#right-sleeve)" />
    <path
      d="M80 300C79 266 81 235 91 204C102 171 125 145 158 136C187 128 211 143 221 168C231 194 219 220 197 237L178 300Z"
      fill="url(#right-skin-back)"
    />
    <g fill="url(#right-skin-back)" stroke="#88503b" strokeWidth="3">
      <path d="M82 106C88 93 103 87 116 94L197 136C211 143 216 158 208 171C200 184 185 188 172 180L94 134C81 127 76 117 82 106Z" />
      <path d="M72 139C79 126 94 121 108 128L190 169C204 177 209 192 201 205C193 218 177 222 164 214L84 170C71 163 66 152 72 139Z" />
      <path d="M72 175C80 162 95 159 108 166L176 203C190 211 194 226 187 239C179 252 164 256 150 248L82 210C68 203 64 188 72 175Z" />
    </g>
    <g fill="none" stroke="#6d3e2e" strokeLinecap="round" strokeWidth="3" opacity="0.42">
      <path d="M105 111L180 151" />
      <path d="M96 147L173 188" />
      <path d="M96 184L160 220" />
      <path d="M105 237C132 226 158 231 177 249" />
    </g>
    </motion.svg>
  </div>
);

const RightHandFront: React.FC<InteractiveHandProps> = ({ pressed }) => (
  <div className="absolute left-0 top-0 h-[clamp(190px,30vh,285px)] w-[clamp(145px,18vw,220px)] -translate-x-[30%] -translate-y-[1%]">
    <motion.svg
      viewBox="0 0 230 300"
      animate={{ rotate: pressed ? -5 : 0, scale: pressed ? 0.96 : 1 }}
      className="h-full w-full origin-[30%_1%] overflow-visible drop-shadow-[0_12px_12px_rgba(0,0,0,0.38)]"
      role="presentation"
    >
    <defs>
      <linearGradient id="right-skin-front" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#f3c9aa" />
        <stop offset="0.52" stopColor="#ca8969" />
        <stop offset="1" stopColor="#784632" />
      </linearGradient>
    </defs>

    <path
      d="M54 224C66 192 85 160 111 143C137 126 169 125 191 143C214 163 217 196 199 220C184 241 161 253 136 255C102 258 78 246 54 224Z"
      fill="url(#right-skin-front)"
      stroke="#89513b"
      strokeWidth="3"
    />
    <path
      d="M45 171C43 137 42 102 44 64L45 29C46 12 56 2 70 3C84 4 92 16 90 33L87 70C84 106 82 137 86 162C89 181 79 194 64 195C50 196 46 187 45 171Z"
      fill="url(#right-skin-front)"
      stroke="#89513b"
      strokeWidth="3"
      data-fingertip="right-index"
    />
    <path
      d="M112 168C129 153 145 139 160 119C171 104 189 100 200 110C213 121 211 139 198 152L164 187C151 200 129 202 116 190C109 184 106 175 112 168Z"
      fill="url(#right-skin-front)"
      stroke="#89513b"
      strokeWidth="3"
    />
    <path d="M55 18C62 10 73 10 81 17" fill="none" stroke="#fae0cc" strokeLinecap="round" strokeWidth="9" opacity="0.72" />
    <path d="M174 116C181 111 190 113 196 119" fill="none" stroke="#fae0cc" strokeLinecap="round" strokeWidth="7" opacity="0.62" />
    <g fill="none" stroke="#754230" strokeLinecap="round" strokeWidth="3" opacity="0.5">
      <path d="M52 84C64 88 76 88 87 83" />
      <path d="M51 111C62 115 73 115 84 111" />
      <path d="M83 205C111 193 143 197 165 215" />
      <path d="M104 225C124 220 143 224 157 236" />
      <path d="M143 164C151 172 159 177 170 179" />
    </g>
    </motion.svg>
  </div>
);

const PHONE_SURFACE_SIZE: React.CSSProperties = {
  width: 'min(calc(100cqw - var(--phone-stage-inset)), calc((100cqh - var(--phone-stage-inset)) * var(--phone-aspect)))',
  height: 'min(calc(100cqh - var(--phone-stage-inset)), calc((100cqw - var(--phone-stage-inset)) / var(--phone-aspect)))',
  maxWidth: '1500px',
  maxHeight: '760px',
};

export const MetaInteractionScene: React.FC<MetaInteractionSceneProps> = ({ active, children }) => {
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const pendingRef = useRef(false);
  const keyQueueRef = useRef<QueuedKey[]>([]);
  const queueRunningRef = useRef(false);
  const keyboardScopeRef = useRef(0);
  const timersRef = useRef<number[]>([]);
  const replayingButtonsRef = useRef(new WeakSet<HTMLButtonElement>());
  const inputControllersRef = useRef(new Map<string, MetaInputController>());
  const [pointer, setPointer] = useState<PointerPosition>({ x: 0, y: 0 });
  const [pressed, setPressed] = useState(false);
  const [interactionPending, setInteractionPending] = useState(false);
  const [keyboardTarget, setKeyboardTarget] = useState<HTMLInputElement | null>(null);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

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
      ? { x: rect.width * 0.81, y: rect.height * 0.53 }
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
  }, [active, clearTimers, getRestPosition]);

  useEffect(() => clearTimers, [clearTimers]);

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
    setPointer({
      x: targetRect.left - sceneRect.left + targetRect.width / 2,
      y: targetRect.top - sceneRect.top + targetRect.height / 2,
    });

    return new Promise((resolve) => {
      timersRef.current.push(window.setTimeout(() => {
        setPressed(true);
      }, META_TAP_TIMING.travelMs));

      timersRef.current.push(window.setTimeout(() => {
        setPressed(false);
        onActivate?.();
      }, META_TAP_TIMING.travelMs + META_TAP_TIMING.pressMs));

      timersRef.current.push(window.setTimeout(() => {
        setPointer(getRestPosition());
        pendingRef.current = false;
        setInteractionPending(false);
        resolve();
      }, META_TAP_TIMING.travelMs + META_TAP_TIMING.pressMs + META_TAP_TIMING.releaseMs));
    });
  }, [active, getRestPosition, reducedMotion]);

  const applyQueuedKey = useCallback((input: HTMLInputElement, key: string) => {
    const controller = inputControllersRef.current.get(input.id);
    if (!controller) return;
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

  const contextValue = useMemo<MetaInteractionContextValue>(() => ({
    active,
    registerInput,
  }), [active, registerInput]);

  return (
    <MetaInteractionContext.Provider value={contextValue}>
    <div
      ref={sceneRef}
      className={`relative h-full w-full overflow-hidden ${active ? 'bg-[#17130f]' : 'bg-transparent'}`}
      onClickCapture={handleClickCapture}
      onKeyDownCapture={handleKeyDownCapture}
      data-meta-view={active ? 'revealed' : 'screen-capture'}
      data-meta-pending={interactionPending ? 'true' : 'false'}
      id="meta-interaction-scene"
    >
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
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_47%_28%,#5b4b3b_0%,#292119_42%,#0c0a08_100%)]" />
            <div className="absolute inset-x-0 top-[59%] h-px bg-amber-100/15 shadow-[0_1px_18px_rgba(255,210,150,0.08)]" />
            <div className="absolute left-[7%] top-[8%] h-36 w-36 rounded-full bg-amber-100/12 blur-[70px]" />
            <div className="absolute right-[9%] top-[12%] h-28 w-28 rounded-full bg-sky-200/5 blur-[65px]" />

            <div
              className="absolute inset-x-[-8%] bottom-[-18%] top-[59%] border-t border-amber-100/15 bg-[#2b1d14] shadow-[inset_0_16px_28px_rgba(255,220,180,0.04),0_-16px_34px_rgba(0,0,0,0.22)]"
              style={{
                backgroundImage:
                  'linear-gradient(100deg, rgba(255,255,255,0.035), transparent 22%, rgba(0,0,0,0.12) 44%, transparent 68%), repeating-linear-gradient(4deg, #2d1f16 0px, #2d1f16 8px, #251810 9px, #332218 12px)',
                clipPath: 'polygon(8% 0, 92% 0, 100% 100%, 0 100%)',
              }}
              id="meta-desk-surface"
            />
            <div className="absolute inset-x-0 bottom-0 h-[8%] border-t border-[#513526] bg-gradient-to-b from-[#24170f] to-[#0d0906] shadow-[0_-8px_20px_rgba(0,0,0,0.42)]" id="meta-desk-front-edge" />
            <div className="absolute left-1/2 top-[57%] h-[12%] w-[64%] -translate-x-1/2 rounded-[50%] bg-black/55 blur-2xl" />
            <div className="absolute bottom-[7%] right-[5%] h-[13%] w-[13%] rotate-6 rounded-md border border-amber-100/5 bg-black/15 shadow-xl" />
            <div className="absolute right-[10%] top-[14%] text-[9px] font-mono tracking-[0.32em] text-amber-100/25">CAM_02 · REC</div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {active && (
          <>
            <motion.div
              initial={{ opacity: 0, x: -54, y: 30 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: reducedMotion ? 0 : 0.5, duration: reducedMotion ? 0 : 0.62 }}
              className="pointer-events-none absolute bottom-[10%] left-[0.5%] z-[8] h-[48%] w-[29%] min-w-44"
              aria-hidden="true"
              id="meta-left-grip-back"
            >
              <LeftGripBack />
            </motion.div>

            <motion.div
              animate={{
                x: pointer.x,
                y: pointer.y,
                opacity: pointer.x > 0 ? 1 : 0,
              }}
              initial={false}
              transition={{ duration: reducedMotion ? 0 : 0.26, ease: 'easeInOut' }}
              className="pointer-events-none absolute left-0 top-0 z-[8] h-0 w-0"
              aria-hidden="true"
              id="meta-right-grip-back"
            >
              <RightHandBack pressed={pressed} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <motion.div
        className="phone-stage absolute inset-0 z-10 flex items-center justify-center [perspective:1500px]"
        animate={active ? { scale: 0.7, y: '-11%' } : { scale: 1, y: '0%' }}
        transition={{ duration: reducedMotion ? 0 : 1.05, ease: [0.22, 1, 0.36, 1] }}
        id="meta-phone-camera-frame"
      >
        <motion.div
          className="absolute inset-0 flex items-center justify-center [transform-style:preserve-3d]"
          animate={active
            ? { rotateX: 5.5, rotateY: -1.4, rotateZ: -0.35 }
            : { rotateX: 0, rotateY: 0, rotateZ: 0 }}
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
      </motion.div>

      <AnimatePresence>
        {active && (
          <>
            <motion.div
              initial={{ opacity: 0, x: -42, y: 18 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: reducedMotion ? 0 : 0.62, duration: reducedMotion ? 0 : 0.55 }}
              className="pointer-events-none absolute left-[10%] top-[35%] z-20 h-[28%] w-[20%] min-w-36"
              aria-hidden="true"
              id="meta-left-hand"
            >
              <LeftGripFront />
            </motion.div>

            <motion.div
              animate={{
                x: pointer.x,
                y: pointer.y,
                opacity: pointer.x > 0 ? 1 : 0,
              }}
              initial={false}
              transition={{ duration: reducedMotion ? 0 : 0.26, ease: 'easeInOut' }}
              className="pointer-events-none absolute left-0 top-0 z-[60] h-0 w-0"
              aria-hidden="true"
              id="meta-pointer-hand"
            >
              <RightHandFront pressed={pressed} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reducedMotion ? 0 : 1.05, duration: 0.45 }}
              className="absolute bottom-3 left-1/2 z-30 w-[min(72%,760px)] -translate-x-1/2 rounded-md border border-emerald-400/35 bg-black/90 px-4 py-2.5 font-mono text-[10px] text-emerald-300 shadow-[0_0_28px_rgba(16,185,129,0.14)]"
              id="meta-terminal-dialogue"
              aria-live="polite"
            >
              <div className="mb-1 flex items-center gap-2 border-b border-emerald-500/20 pb-1 text-[8px] tracking-[0.2em] text-emerald-500/65">
                <Terminal className="h-3 w-3" /> INPUT SOURCE CHANGED · SCREEN CAPTURE DISCONNECTED
              </div>
              <p>&gt; 「這不是紀錄。」</p>
              <p>&gt; 「這是作弊。」</p>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {active && keyboardTarget && (
          <motion.div
            initial={{ opacity: 0, y: 90 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 90 }}
            transition={{ duration: reducedMotion ? 0 : 0.28 }}
            className="absolute inset-x-[10%] bottom-2 z-50 rounded-2xl border border-white/15 bg-[#111318]/95 p-2 shadow-[0_18px_55px_rgba(0,0,0,0.7)] backdrop-blur-xl"
            data-meta-immediate="true"
            data-meta-keyboard="true"
            id="meta-virtual-keyboard"
          >
            <div className="mb-1 flex items-center justify-between px-1 font-mono text-[8px] text-slate-500">
              <span>ARC LITE VIRTUAL INPUT</span>
              <span className="text-emerald-400/70">HAND RELAY ACTIVE</span>
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
                          ? 'border-emerald-300 bg-emerald-400/25 text-white'
                          : 'border-slate-600 bg-slate-800 text-slate-200'
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
        )}
      </AnimatePresence>
    </div>
    </MetaInteractionContext.Provider>
  );
};
