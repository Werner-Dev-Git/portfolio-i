import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';
import { useInView } from '@/hooks/useInView';
import { useReducedMotion } from '@/hooks/useMediaQuery';
import { projects } from '@/data/projects';
import { FIGMA_COUNT } from '@/data/figma';
import { HeroSwarm } from './HeroSwarm';
import { Magnetic } from './Magnetic';
import { Reveal } from './Reveal';
import { CountUp } from './CountUp';

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { rootMargin: '120px' });
  useGSAP(
    () => {
      if (reduced) return;
      const split = new SplitText('.hero h1 .line > span', { type: 'chars' });
      gsap.from(split.chars, {
        yPercent: 112, duration: 1.05, ease: 'power4.out', stagger: 0.03, delay: 0.15,
      });
      gsap.to('.hero .badge, .hero h1', {
        yPercent: -16, autoAlpha: 0.2, ease: 'none',
        scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom 30%', scrub: true },
      });
      return () => split.revert();
    },
    { scope: ref, dependencies: [reduced] },
  );

  return (
    <section className="hero container" ref={ref} id="top">
      <HeroSwarm active={inView} still={reduced} />

      <div className="badge">
        <span className="pulse" /> Available for select work — South Africa
      </div>

      <h1>
        <span className="line"><span>Werner</span></span>
        <span className="line">
          <span className="muted-line">Designer <span className="slash">/</span> Developer</span>
        </span>
      </h1>

      <div className="hero-row">
        <Reveal as="p">
          I design in Figma and ship to production. Live sites, motion systems and product
          interfaces that feel considered from the first frame — hover anything below and watch it move.
        </Reveal>
        <Reveal delay={0.1} className="hero-cta">
          <Magnetic><a href="#dev" className="btn btn-accent btn-lg">Dev — live sites</a></Magnetic>
          <Magnetic><a href="#design" className="btn btn-ghost btn-lg">Design — Figma wall</a></Magnetic>
        </Reveal>
      </div>

      <Reveal delay={0.15} className="stats">
        <div className="stat">
          <CountUp to={projects.length} /><span>Live sites &amp; counting</span>
        </div>
        <div className="stat">
          <CountUp to={FIGMA_COUNT} /><span>Figma shots in the wall</span>
        </div>
        <div className="stat">
          <CountUp to={60} /><span>fps, non-negotiable</span>
        </div>
        <div className="stat">
          <b style={{ color: 'var(--accent)' }}>∞</b><span>Iterations, honestly</span>
        </div>
      </Reveal>
    </section>
  );
}
