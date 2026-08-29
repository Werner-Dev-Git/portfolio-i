import { useRef } from 'react';
import { useInView } from '@/hooks/useInView';
import { useReducedMotion } from '@/hooks/useMediaQuery';
import { usePinnedScene } from '@/hooks/usePinnedScene';
import { HeroSwarm, type SwarmParams } from './HeroSwarm';
import { Reveal } from './Reveal';

const clamp = (v: number) => Math.max(0, Math.min(1, v));

/** Closing beat: the swarm leaves its sphere, spells the name, disperses. */
export function Signature() {
  const ref = useRef<HTMLElement>(null);
  const params = useRef<SwarmParams | null>(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { rootMargin: '120px' });

  usePinnedScene(ref, '+=130%', (p) => {
    const P = params.current;
    if (!P) return;
    const rise = clamp((p - 0.12) / 0.38);
    const fall = clamp((p - 0.74) / 0.24);
    P.morph = rise * (1 - fall);
    P.chaos = 20 + fall * 66;
  });

  return (
    <section className="signature container" id="signature" ref={ref}>
      <HeroSwarm
        active={inView}
        still={reduced}
        mode="text"
        text="WERNER"
        className="signature-particles"
        paramsRef={params}
      />
      <div className="signature-copy">
        <Reveal className="kicker mono">The short version</Reveal>
        <Reveal as="p" delay={0.08}>
          Twenty thousand points, one name. Same engine as the hero — pointed at
          letterforms instead of a core.
        </Reveal>
      </div>
    </section>
  );
}
