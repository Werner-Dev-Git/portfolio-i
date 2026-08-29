import { lazy, Suspense, useRef, useState } from 'react';
import { hexToRgb, useSmokeConfig } from '@/lib/smokeConfig';
import { useInView } from '@/hooks/useInView';
import { useCoarsePointer, useFinePointer, useReducedMotion } from '@/hooks/useMediaQuery';
import type { Service } from '@/data/projects';
import type { PointerState } from './LightRig';

// Three.js is only needed for the lighting layer, so it loads on demand —
// the rest of the page ships without it.
const LightRig = lazy(async () => ({ default: (await import('./LightRig')).LightRig }));

/** Service panel: a neon ring plus a lit, shadow-casting inner slab for depth.
 *  The smoke behind the row is drawn once for all three by <SmokeField>. */
export function ServiceCard({ service, index }: { service: Service; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef<PointerState>({ x: 0, y: 0, target: 0, orbit: false });
  const { settings, palette } = useSmokeConfig();
  const reduced = useReducedMotion();
  const fine = useFinePointer();
  const coarse = useCoarsePointer();
  const inView = useInView(cardRef, { rootMargin: '140px' });
  const centred = useInView(cardRef, { rootMargin: '-28% 0px -28% 0px' });
  const [hovered, setHovered] = useState(false);

  const color = palette[index % palette.length];
  const live = coarse ? centred : hovered;

  // Feed the WebGL rig without re-rendering it.
  pointerRef.current.orbit = coarse;
  pointerRef.current.target = live ? 1 : 0;

  // Neon ring, built from the same colour the smoke uses.
  const [r, g, b] = hexToRgb(color);
  const rgb = `${r},${g},${b}`;
  const { gi, gb, gs, gp } = settings;
  const ringStyle: React.CSSProperties = {
    boxShadow: [
      `0 0 ${gb * 0.25}px ${gs * 0.5}px rgba(${rgb},${gi})`,
      `0 0 ${gb * 0.55}px ${gs}px rgba(${rgb},${gi * 0.65})`,
      `0 0 ${gb}px ${gs * 1.5}px rgba(${rgb},${gi * 0.35})`,
      `0 0 ${gb * 1.8}px ${gs * 2}px rgba(${rgb},${gi * 0.15})`,
    ].join(','),
    ['--pulse-dur' as string]: `${gp}s`,
  };

  return (
    <div
      ref={cardRef}
      className={`service${live ? ' is-live' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={(e) => {
        if (!fine) return;
        const b = e.currentTarget.getBoundingClientRect();
        pointerRef.current.x = e.clientX - b.left - b.width / 2;
        pointerRef.current.y = -(e.clientY - b.top - b.height / 2);
      }}
    >
      <div className="glow-ring" style={ringStyle} aria-hidden="true" />
      {!reduced && inView && (
        <Suspense fallback={null}>
          <LightRig pointer={pointerRef} color={color} />
        </Suspense>
      )}

      <div className="service-inner">
        <div className="num">{service.num}</div>
        <h3>{service.title}</h3>
        <p>{service.body}</p>
      </div>
    </div>
  );
}
