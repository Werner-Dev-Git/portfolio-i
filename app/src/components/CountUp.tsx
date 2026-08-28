import { useEffect, useRef, useState } from 'react';
import { useInView } from '@/hooks/useInView';
import { useReducedMotion } from '@/hooks/useMediaQuery';

/** Counts from 0 to `to` the first time it scrolls into view. */
export function CountUp({ to, duration = 1400 }: { to: number; duration?: number }) {
  const ref = useRef<HTMLBaseElement>(null);
  const inView = useInView(ref, { threshold: 0.6, once: true });
  const reduced = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduced) { setValue(to); return; }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setValue(Math.round(to * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduced, to, duration]);

  return <b ref={ref}>{value}</b>;
}
