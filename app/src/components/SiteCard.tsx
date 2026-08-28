import { useCallback, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { asset } from '@/lib/asset';
import { useInView } from '@/hooks/useInView';
import { useCoarsePointer, useFinePointer, useReducedMotion } from '@/hooks/useMediaQuery';
import type { Project } from '@/data/projects';

/** One project: a browser frame whose full-page capture scrolls itself.
 *  Engages on hover, on keyboard focus, or — on touch — when centred. */
export function SiteCard({ project }: { project: Project }) {
  const cardRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const fine = useFinePointer();
  const coarse = useCoarsePointer();
  const reduced = useReducedMotion();
  const centred = useInView(cardRef, { rootMargin: '-28% 0px -28% 0px' });
  const [engaged, setEngaged] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const live = coarse ? centred : engaged;
  const host = project.url.replace(/^https?:\/\//, '').replace(/\/$/, '');

  // Glide the capture through its full height while engaged.
  useGSAP(
    () => {
      const img = imgRef.current;
      const viewport = img?.parentElement;
      if (!img || !viewport || !loaded) return;
      const distance = Math.max(0, img.clientHeight - viewport.clientHeight);
      if (!distance) return;

      if (reduced) { gsap.set(img, { y: 0 }); return; }

      if (coarse) {
        // No hover on touch: pan gently back and forth while centred.
        const tween = gsap.to(img, {
          y: -distance, duration: Math.max(7, distance / 240), ease: 'sine.inOut',
          yoyo: true, repeat: -1, paused: !centred,
        });
        return () => { tween.kill(); };
      }
      gsap.to(img, {
        y: engaged ? -distance : 0,
        duration: engaged ? Math.min(16, Math.max(4, distance / 380)) : 1.4,
        ease: engaged ? 'power1.inOut' : 'power3.out',
        overwrite: 'auto',
      });
    },
    { dependencies: [engaged, centred, coarse, reduced, loaded] },
  );

  // Cursor-follow spotlight + gentle 3D tilt.
  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const card = cardRef.current;
      if (!card || !fine) return;
      const b = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - b.left}px`);
      card.style.setProperty('--my', `${e.clientY - b.top}px`);
      if (reduced) return;
      gsap.to(card, {
        rotationY: ((e.clientX - b.left) / b.width - 0.5) * 4.5,
        rotationX: -((e.clientY - b.top) / b.height - 0.5) * 4.5,
        transformPerspective: 1000, duration: 0.6, ease: 'power2', overwrite: 'auto',
      });
    },
    [fine, reduced],
  );

  const onLeave = useCallback(() => {
    setEngaged(false);
    if (cardRef.current && fine && !reduced) {
      gsap.to(cardRef.current, { rotationX: 0, rotationY: 0, duration: 0.6, ease: 'power2' });
    }
  }, [fine, reduced]);

  return (
    <article
      ref={cardRef}
      className={`site-card${project.featured ? ' featured' : ''}${live ? ' is-live' : ''}`}
      onMouseEnter={() => setEngaged(true)}
      onMouseLeave={onLeave}
      onMouseMove={onMouseMove}
    >
      <a
        className="browser"
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Visit ${project.name}`}
        onFocus={() => setEngaged(true)}
        onBlur={() => setEngaged(false)}
      >
        <div className="browser-bar">
          <span className="dot" /><span className="dot" /><span className="dot" />
          <span className="url">{host}</span>
          <span className="live">Live</span>
        </div>
        <div className="viewport">
          <img
            ref={imgRef}
            className="screen"
            src={asset(project.img)}
            alt={`Full-page view of ${project.name}`}
            loading="lazy"
            decoding="async"
            onLoad={() => setLoaded(true)}
          />
          <div className="hint">Hover = scroll · Click = visit</div>
        </div>
      </a>

      <div className="site-meta">
        <div>
          <h3>
            <a href={project.url} target="_blank" rel="noopener noreferrer">{project.name}</a>
          </h3>
          <div className="tags">
            {project.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}
          </div>
          <p>{project.desc}</p>
        </div>
        <a
          className="arrow"
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${project.name}`}
        >
          ↗
        </a>
      </div>
    </article>
  );
}
