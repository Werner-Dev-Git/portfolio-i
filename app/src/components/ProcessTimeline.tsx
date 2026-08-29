import { useRef } from 'react';
import gsap from 'gsap';
import { processSteps } from '@/data/projects';
import { usePinnedScene } from '@/hooks/usePinnedScene';
import { Reveal } from './Reveal';

/** Pinned section whose track walks sideways as you scroll. */
export function ProcessTimeline() {
  const ref = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLSpanElement>(null);

  usePinnedScene(ref, '+=110%', (p) => {
    const track = trackRef.current;
    if (track?.parentElement) {
      const travel = Math.max(0, track.scrollWidth - track.parentElement.clientWidth);
      gsap.set(track, { x: -travel * p });
    }
    if (railRef.current) railRef.current.style.width = `${(p * 100).toFixed(1)}%`;
  });

  return (
    <section className="process container" id="process" ref={ref}>
      <div className="section-head">
        <div>
          <div className="kicker mono">03b — How it goes</div>
          <Reveal as="h2">Discover, design, build, ship</Reveal>
        </div>
        <Reveal as="p">
          The same four moves on every project, whether it is a landing page or a
          full product surface.
        </Reveal>
      </div>

      <div className="process-viewport">
        <div className="process-track" ref={trackRef}>
          {processSteps.map((step) => (
            <article className="process-card" key={step.num}>
              <div className="num">{step.num}</div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </div>
      <div className="process-rail"><span ref={railRef} /></div>
    </section>
  );
}
