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
      ? { x: rect.width * 0.84, y: rect.height * 0.78 }
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
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,#4b4034_0%,#211b16_48%,#090807_100%)]" />
            <div className="absolute inset-x-0 top-[68%] h-[32%] bg-gradient-to-b from-[#2a211a] to-[#100d0a] border-t border-amber-100/10" />
            <div className="absolute left-[8%] top-[12%] h-24 w-24 rounded-full bg-amber-200/10 blur-3xl" />
            <div className="absolute right-[12%] top-[16%] text-[9px] font-mono tracking-[0.32em] text-amber-100/25">CAM_02 · REC</div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="phone-stage absolute inset-0 z-10 flex items-center justify-center"
        animate={active ? { scale: 0.72, y: '-10%' } : { scale: 1, y: '0%' }}
        transition={{ duration: reducedMotion ? 0 : 1.05, ease: [0.22, 1, 0.36, 1] }}
        id="meta-phone-camera-frame"
      >
        {children}
      </motion.div>

      <AnimatePresence>
        {active && (
          <>
            <motion.div
              initial={{ opacity: 0, x: -80 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: reducedMotion ? 0 : 0.65, duration: 0.5 }}
              className="pointer-events-none absolute bottom-[23%] left-[2%] z-20 h-20 w-[24%] min-w-32 rotate-[8deg] rounded-[46%_56%_40%_38%] bg-gradient-to-br from-[#d5a27f] via-[#b97858] to-[#704230] shadow-[0_18px_28px_rgba(0,0,0,0.55)]"
              aria-hidden="true"
              id="meta-left-hand"
            >
              <div className="absolute -right-5 top-3 h-5 w-16 -rotate-[18deg] rounded-full bg-[#c98e6b] shadow-md" />
              <div className="absolute -right-4 top-9 h-4 w-14 rotate-[10deg] rounded-full bg-[#b97858] shadow-md" />
            </motion.div>

            <motion.div
              animate={{
                x: pointer.x - 42,
                y: pointer.y - 28,
                scale: pressed ? 0.92 : 1,
                rotate: pressed ? -8 : -4,
              }}
              initial={false}
              transition={{ duration: reducedMotion ? 0 : 0.26, ease: 'easeInOut' }}
              className="pointer-events-none absolute left-0 top-0 z-40 h-16 w-24 rounded-[52%_44%_48%_40%] bg-gradient-to-br from-[#dcaa88] via-[#bc7e5e] to-[#774630] shadow-[0_16px_25px_rgba(0,0,0,0.55)]"
              aria-hidden="true"
              id="meta-pointer-hand"
            >
              <motion.div
                animate={{ y: pressed ? 5 : 0, scaleY: pressed ? 0.9 : 1 }}
                className="absolute -top-10 left-10 h-14 w-5 origin-bottom rounded-full bg-gradient-to-b from-[#e1b191] to-[#bd7f5f] shadow-md"
              />
              <div className="absolute left-[46px] top-[-39px] h-2.5 w-2.5 rounded-full bg-amber-100/30 blur-[1px]" />
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
