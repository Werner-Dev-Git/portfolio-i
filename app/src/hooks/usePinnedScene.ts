import { useEffect, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useMediaQuery, useReducedMotion } from './useMediaQuery';

gsap.registerPlugin(ScrollTrigger);

/**
 * Pins an element and reports scroll progress through it.
 *
 * Pinning is skipped under reduced motion and on narrow screens, where pinned
 * and horizontal scrolling fight the native gesture — the section is then left
 * as ordinary stacked content.
 */
export function usePinnedScene(
  ref: RefObject<HTMLElement | null>,
  end: string,
  onUpdate: (progress: number) => void,
  deps: unknown[] = [],
): void {
  const reduced = useReducedMotion();
  const narrow = useMediaQuery('(max-width: 860px)');

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || narrow) return;
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end,
      pin: true,
      scrub: true,
      anticipatePin: 1,
      onUpdate: (self) => onUpdate(self.progress),
    });
    return () => trigger.kill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, end, reduced, narrow, ...deps]);
}
