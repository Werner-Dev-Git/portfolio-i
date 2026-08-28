import { useEffect, useState, type RefObject } from 'react';

interface InViewOptions {
  rootMargin?: string;
  threshold?: number | number[];
  /** Stop observing after the first intersection. */
  once?: boolean;
}

/** Tracks whether an element is intersecting the viewport. */
export function useInView<T extends Element>(
  ref: RefObject<T | null>,
  { rootMargin = '0px', threshold = 0, once = false }: InViewOptions = {},
): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const isIn = entries[0].isIntersecting;
        setInView(isIn);
        if (isIn && once) observer.disconnect();
      },
      { rootMargin, threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, rootMargin, threshold, once]);

  return inView;
}
