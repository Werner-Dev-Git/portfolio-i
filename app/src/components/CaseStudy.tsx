import { useRef, useState } from 'react';
import gsap from 'gsap';
import { asset } from '@/lib/asset';
import { usePinnedScene } from '@/hooks/usePinnedScene';
import type { CaseStudyEntry } from '@/data/projects';

/**
 * A pinned case study: scroll pans the full-page capture while the captions
 * keep pace beside it.
 */
export function CaseStudy({ study }: { study: CaseStudyEntry }) {
  const ref = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [step, setStep] = useState(0);

  usePinnedScene(ref, '+=120%', (p) => {
    const img = imgRef.current;
    const frame = frameRef.current;
    if (img && frame) {
      const travel = Math.max(0, img.clientHeight - frame.clientHeight);
      gsap.set(img, { y: -travel * p });
    }
    setStep(Math.min(study.steps.length - 1, Math.floor(p * study.steps.length)));
  }, [study.steps.length]);

  return (
    <section className="case" ref={ref} data-case>
      <div className="case-frame" ref={frameRef}>
        <img
          ref={imgRef}
          src={asset(study.img)}
          alt={`${study.name}, full page`}
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="case-steps">
        {study.steps.map((s, i) => (
          <div className={`case-step${i === step ? ' is-on' : ''}`} key={s.title}>
            <div className="case-count">
              {study.name} · 0{i + 1} / 0{study.steps.length}
            </div>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
          </div>
        ))}
        <div className="case-dots">
          {study.steps.map((s, i) => (
            <i key={s.title} className={i === step ? 'is-on' : undefined} />
          ))}
        </div>
      </div>
    </section>
  );
}
