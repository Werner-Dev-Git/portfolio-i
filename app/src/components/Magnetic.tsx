import { useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useFinePointer, useReducedMotion } from '@/hooks/useMediaQuery';

/** Wraps a control so it drifts toward the cursor and springs back. */
export function Magnetic({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  const fine = useFinePointer();
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const el = ref.current?.firstElementChild as HTMLElement | null;
      if (!el || !fine || reduced) return;
      const qx = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3' });
      const qy = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3' });
      const onMove = (e: MouseEvent) => {
        const b = el.getBoundingClientRect();
        qx((e.clientX - b.left - b.width / 2) * 0.3);
        qy((e.clientY - b.top - b.height / 2) * 0.36);
      };
      const onLeave = () => { qx(0); qy(0); };
      el.addEventListener('mousemove', onMove);
      el.addEventListener('mouseleave', onLeave);
      return () => {
        el.removeEventListener('mousemove', onMove);
        el.removeEventListener('mouseleave', onLeave);
      };
    },
    { scope: ref, dependencies: [fine, reduced] },
  );

  return (
    <span ref={ref} style={{ display: 'contents' }}>
      {children}
    </span>
  );
}
