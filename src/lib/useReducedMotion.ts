import { useEffect, useState } from 'react';

/**
 * Tracks the user's prefers-reduced-motion setting. Mirrors the matchMedia
 * listener already used inside MetaInteractionScene so animated features can
 * degrade to a static presentation without threading the flag through context.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);

  return reduced;
}
