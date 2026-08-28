import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { hexToRgb, useSmokeConfig } from '@/lib/smokeConfig';
import { useInView } from '@/hooks/useInView';
import { useCoarsePointer, useFinePointer, useReducedMotion } from '@/hooks/useMediaQuery';
import type { Service } from '@/data/projects';
import type { PointerState } from './LightRig';

// Three.js is only needed for the lighting layer, so it loads on demand —
// the rest of the page ships without it.
const LightRig = lazy(async () => ({ default: (await import('./LightRig')).LightRig }));

interface Puff {
  x: number; y: number; vx: number; vy: number;
  r: number; life: number; decay: number; spin: number;
}

/** Service panel with continuous smoke drifting off its edges and a lit,
 *  shadow-casting inner slab for depth. */
export function ServiceCard({ service, index }: { service: Service; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
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

  // Smoke: particles spawn on the card's edges and drift outward.
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const colorRef = useRef(color);
  colorRef.current = color;
  const runRef = useRef<((on: boolean) => void) | null>(null);
  const refitRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const card = cardRef.current;
    if (!canvas || !card) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let puffs: Puff[] = [];
    let raf = 0;
    let W = 0, H = 0;
    let bounds = { x0: 0, y0: 0, x1: 0, y1: 0 };

    function fit() {
      const pad = settingsRef.current.pad;
      const w = card!.offsetWidth, h = card!.offsetHeight;
      const dpr = Math.min(2, devicePixelRatio || 1);
      W = w + pad * 2; H = h + pad * 2;
      canvas!.width = W * dpr; canvas!.height = H * dpr;
      canvas!.style.width = `${W}px`; canvas!.style.height = `${H}px`;
      canvas!.style.top = `${-pad}px`; canvas!.style.left = `${-pad}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      bounds = { x0: pad, y0: pad, x1: pad + w, y1: pad + h };
    }

    function spawn() {
      const s = settingsRef.current;
      const { x0, y0, x1, y1 } = bounds;
      const edge = (Math.random() * 4) | 0;
      const v = s.spd + Math.random() * s.spdV;
      const d = (Math.random() - 0.5) * s.drift;
      let x: number, y: number, vx: number, vy: number;
      if (edge === 0) { x = x0 + Math.random() * (x1 - x0); y = y0; vx = d; vy = -v; }
      else if (edge === 1) { x = x1; y = y0 + Math.random() * (y1 - y0); vx = v; vy = d; }
      else if (edge === 2) { x = x0 + Math.random() * (x1 - x0); y = y1; vx = d; vy = v; }
      else { x = x0; y = y0 + Math.random() * (y1 - y0); vx = -v; vy = d; }
      puffs.push({
        x, y, vx, vy,
        r: s.rMin + Math.random() * s.rVar,
        life: 1,
        decay: s.decay + Math.random() * s.decayV,
        spin: (Math.random() - 0.5) * 0.009,
      });
    }

    const running = { value: false };

    function draw(advance: boolean) {
      const s = settingsRef.current;
      const [cr, cg, cb] = hexToRgb(colorRef.current);
      const tint = `${cr},${cg},${cb}`;
      ctx!.clearRect(0, 0, W, H);
      puffs = puffs.filter((p) => p.life > 0);
      for (const p of puffs) {
        if (advance) {
          p.x += p.vx; p.y += p.vy; p.vx += p.spin;
          p.r += s.grow; p.life -= p.decay;
        }
        // Keep it a hint on phones, where cards are close to full width.
        const a = p.life * s.alpha * (coarse ? 0.5 : 1);
        const grad = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        grad.addColorStop(0, `rgba(${tint},${a})`);
        grad.addColorStop(0.45, `rgba(${tint},${a * 0.35})`);
        grad.addColorStop(1, `rgba(${tint},0)`);
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = grad;
        ctx!.fill();
      }
    }

    function frame() {
      raf = 0;
      if (running.value) {
        const s = settingsRef.current;
        const n = coarse ? Math.ceil(s.ppf / 2) : s.ppf;
        for (let i = 0; i < n; i++) spawn();
      }
      draw(true);
      if (running.value || puffs.length) raf = requestAnimationFrame(frame);
    }

    // One still frame: a batch of puffs, each aged a different amount.
    function paintStill() {
      const s = settingsRef.current;
      puffs = [];
      for (let i = 0; i < 90; i++) {
        spawn();
        const p = puffs[puffs.length - 1];
        const age = 10 + Math.random() * 55;
        p.x += p.vx * age; p.y += p.vy * age;
        p.r += s.grow * age; p.life -= p.decay * age;
      }
      draw(false);
    }

    fit();
    if (reduced) paintStill();
    runRef.current = (on: boolean) => {
      if (reduced) { paintStill(); return; }
      running.value = on;
      if (on && !raf) raf = requestAnimationFrame(frame);
    };
    refitRef.current = () => { fit(); if (reduced) paintStill(); };

    let timer: number | undefined;
    const onResize = () => {
      clearTimeout(timer);
      timer = window.setTimeout(() => refitRef.current?.(), 180);
    };
    addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      removeEventListener('resize', onResize);
      runRef.current = null;
      refitRef.current = null;
    };
  }, [reduced, coarse]);

  // Smoke runs whenever the card is near the viewport and the tab is visible.
  useEffect(() => {
    runRef.current?.(inView && !document.hidden);
    const onVis = () => runRef.current?.(inView && !document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [inView]);

  // The overflow pad changes canvas geometry, so refit when it moves.
  useEffect(() => { refitRef.current?.(); }, [settings.pad]);

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
      <canvas className="smoke-canvas" ref={canvasRef} aria-hidden="true" />
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
