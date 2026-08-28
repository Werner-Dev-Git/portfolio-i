import { useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from '@/hooks/useMediaQuery';

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface MarqueeProps {
  children: ReactNode;
  /** Seconds for one full loop. */
  duration?: number;
  big?: boolean;
}

/** Infinite marquee whose speed reacts to scroll velocity. */
export function Marquee({ children, duration = 30, big = false }: MarqueeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      const track = ref.current?.querySelector('.marquee-track');
      if (!track) return;

      const tween = gsap.to(track, { xPercent: -50, ease: 'none', repeat: -1, duration });
      let boost = 0;
      const trigger = ScrollTrigger.create({
        onUpdate: (self) => { boost = Math.min(5, Math.abs(self.getVelocity()) / 350); },
      });
      const tick = () => {
        boost *= 0.93;
        tween.timeScale(gsap.utils.interpolate(tween.timeScale(), 1 + boost, 0.12));
      };
      gsap.ticker.add(tick);
      return () => { gsap.ticker.remove(tick); trigger.kill(); tween.kill(); };
    },
    { scope: ref, dependencies: [reduced, duration] },
  );

  return (
    <div className={`marquee${big ? ' marquee-big' : ''}`} aria-hidden="true" ref={ref}>
      <div className="marquee-track">
        <div>{children}</div>
        <div>{children}</div>
      </div>
    </div>
  );
}
