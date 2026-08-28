import { useRef, type ElementType, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from '@/hooks/useMediaQuery';

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface RevealProps {
  children: ReactNode;
  /** Seconds to wait after the element enters — used to stagger siblings. */
  delay?: number;
  as?: ElementType;
  className?: string;
}

/** Fades and lifts its children into place once, on scroll. */
export function Reveal({ children, delay = 0, as = 'div', className }: RevealProps) {
  // Cast to a concrete intrinsic element so the shared props (ref, className,
  // children) type-check; the runtime tag is whatever `as` provided.
  const Tag = as as 'div';
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      gsap.fromTo(
        ref.current,
        { autoAlpha: 0, y: 34 },
        {
          autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out', delay,
          scrollTrigger: { trigger: ref.current, start: 'top 88%', once: true },
          // Hand control back to CSS so :hover transitions keep working.
          onComplete: () => gsap.set(ref.current, { clearProps: 'opacity,visibility,transform' }),
        },
      );
    },
    { scope: ref, dependencies: [reduced, delay] },
  );

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
