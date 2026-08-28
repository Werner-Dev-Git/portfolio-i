import { useSyncExternalStore } from 'react';

/** Reactive media query — re-renders when the match state flips. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    () => matchMedia(query).matches,
    () => false,
  );
}

export const useReducedMotion = (): boolean =>
  useMediaQuery('(prefers-reduced-motion: reduce)');

export const useFinePointer = (): boolean =>
  useMediaQuery('(hover: hover) and (pointer: fine)');

export const useCoarsePointer = (): boolean => useMediaQuery('(pointer: coarse)');
