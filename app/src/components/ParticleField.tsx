import { useEffect, useRef } from 'react';
import { useTheme } from '@/lib/theme';

export const FORMATIONS = ['Geodesic Sphere', 'Double Helix', 'Donut'] as const;

interface Vec3 { x: number; y: number; z: number }

interface Particle extends Vec3 {
  ox: number; oy: number; vx: number; vy: number; ease: number;
}

interface ParticleFieldProps {
  /** Index into FORMATIONS — the swarm morphs whenever this changes. */
  formation: number;
  /** Pauses the render loop when the hero scrolls away. */
  active: boolean;
}

const TAU = Math.PI * 2;

/** Morphing 3D point cloud that reacts to the cursor. Canvas 2D with a hand
 *  rolled perspective projection: ~1.7k points stay at 60fps without WebGL. */
export function ParticleField({ formation, active }: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { accent, theme } = useTheme();

  // Live values the animation loop reads without re-subscribing.
  const formationRef = useRef(formation);
  const activeRef = useRef(active);
  const playRef = useRef<(() => void) | null>(null);
  const paintRef = useRef({ rgb: [34, 197, 94] as number[], dark: true });
  formationRef.current = formation;
  activeRef.current = active;

  useEffect(() => {
    const m = /^#?([0-9a-f]{6})$/i.exec(accent);
    if (m) {
      paintRef.current.rgb = [
        parseInt(m[1].slice(0, 2), 16),
        parseInt(m[1].slice(2, 4), 16),
        parseInt(m[1].slice(4, 6), 16),
      ];
    }
    paintRef.current.dark = theme === 'dark';
  }, [accent, theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coarse = matchMedia('(pointer: coarse)').matches;
    const count = Math.round(
      Math.min(1700, Math.max(550, innerWidth * 1.1)) * (coarse ? 0.55 : 1),
    );

    const parts: Particle[] = Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 500,
      y: (Math.random() - 0.5) * 500,
      z: (Math.random() - 0.5) * 500,
      ox: 0, oy: 0, vx: 0, vy: 0,
      ease: 0.02 + Math.random() * 0.05,
    }));

    let W = 0, H = 0, R = 120, focal = 300;
    let targets: Vec3[][] = [[], [], []];
    let rotY = 0, tiltX = 0, tiltY = 0, tiltTX = 0, tiltTY = 0;
    let mouseX = -1e4, mouseY = -1e4;
    let raf = 0;
    let lastFormation = formationRef.current;

    function buildTargets() {
      R = Math.min(W, H) * (W > 860 ? 0.27 : 0.3);
      focal = R * 2.4;
      const sphere: Vec3[] = [], helix: Vec3[] = [], donut: Vec3[] = [];
      const goldenAngle = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < count; i++) {
        const t = i / (count - 1);
        // Fibonacci sphere — even coverage, no polar clustering.
        const sy = 1 - t * 2;
        const sr = Math.sqrt(Math.max(0, 1 - sy * sy));
        const st = goldenAngle * i;
        sphere.push({ x: Math.cos(st) * sr * R, y: sy * R, z: Math.sin(st) * sr * R });

        const ang = t * TAU * 3 + (i % 2) * Math.PI;
        const hr = R * 0.55 * (0.9 + Math.random() * 0.2);
        helix.push({ x: Math.cos(ang) * hr, y: (t - 0.5) * 2.3 * R, z: Math.sin(ang) * hr });

        const a = Math.random() * TAU, b = Math.random() * TAU;
        const majorR = R * 0.76, minorR = R * 0.27;
        donut.push({
          x: (majorR + minorR * Math.cos(b)) * Math.cos(a),
          y: minorR * Math.sin(b),
          z: (majorR + minorR * Math.cos(b)) * Math.sin(a),
        });
      }
      targets = [sphere, helix, donut];
    }

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      const dpr = Math.min(2, devicePixelRatio || 1);
      W = rect.width; H = rect.height;
      canvas!.width = Math.round(W * dpr);
      canvas!.height = Math.round(H * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildTargets();
    }

    function frame() {
      raf = 0;
      const { rgb, dark } = paintRef.current;
      ctx!.clearRect(0, 0, W, H);
      ctx!.globalCompositeOperation = dark ? 'lighter' : 'source-over';
      ctx!.fillStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;

      // Re-randomise easing on a morph so points arrive in a flowing wave.
      if (formationRef.current !== lastFormation) {
        lastFormation = formationRef.current;
        for (const p of parts) p.ease = 0.02 + Math.random() * 0.05;
      }

      rotY += 0.0022;
      tiltX += (tiltTX - tiltX) * 0.04;
      tiltY += (tiltTY - tiltY) * 0.04;
      const ry = rotY + tiltY, rx = -0.22 + tiltX;
      const cy = Math.cos(ry), sy = Math.sin(ry);
      const cx = Math.cos(rx), sx = Math.sin(rx);
      const midX = W * (W > 860 ? 0.74 : 0.5), midY = H * 0.42;
      const tg = targets[formationRef.current] ?? targets[0];

      for (let i = 0; i < count; i++) {
        const p = parts[i], g = tg[i];
        p.x += (g.x - p.x) * p.ease;
        p.y += (g.y - p.y) * p.ease;
        p.z += (g.z - p.z) * p.ease;

        const X = p.x * cy + p.z * sy;
        let Z = p.z * cy - p.x * sy;
        const Y = p.y * cx - Z * sx;
        Z = p.y * sx + Z * cx;

        const s = focal / (focal + Z + R * 1.7);
        let px = midX + X * s;
        let py = midY + Y * s;

        // Cursor repulsion with spring-back.
        const dx = px - mouseX, dy = py - mouseY;
        const d2 = dx * dx + dy * dy;
        if (d2 < 16900) {
          const d = Math.sqrt(d2) || 1;
          const force = (1 - d / 130) * 9;
          p.vx += (dx / d) * force;
          p.vy += (dy / d) * force;
        }
        p.vx = (p.vx - p.ox * 0.06) * 0.86;
        p.vy = (p.vy - p.oy * 0.06) * 0.86;
        p.ox += p.vx; p.oy += p.vy;
        px += p.ox; py += p.oy;

        const depth = Math.max(0, Math.min(1, (s - 0.5) * 3));
        ctx!.globalAlpha = dark ? 0.16 + depth * 0.55 : 0.18 + depth * 0.5;
        ctx!.beginPath();
        ctx!.arc(px, py, 0.7 + depth * 1.5, 0, TAU);
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;
      if (activeRef.current && !document.hidden) raf = requestAnimationFrame(frame);
    }

    const play = () => {
      if (!raf && activeRef.current && !document.hidden) raf = requestAnimationFrame(frame);
    };
    const onMove = (e: MouseEvent) => {
      const rect = canvas!.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      tiltTY = (e.clientX / innerWidth - 0.5) * 0.55;
      tiltTX = (e.clientY / innerHeight - 0.5) * 0.4;
    };
    const onLeave = () => { mouseX = -1e4; mouseY = -1e4; };
    let resizeTimer: number | undefined;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 150);
    };

    resize();
    play();
    addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('visibilitychange', play);
    addEventListener('resize', onResize);

    // Expose a restart so the parent's `active` flips resume the loop.
    playRef.current = play;

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('visibilitychange', play);
      removeEventListener('resize', onResize);
      playRef.current = null;
    };
  }, []);

  useEffect(() => { if (active) playRef.current?.(); }, [active]);

  return <canvas className="hero-particles" ref={canvasRef} aria-hidden="true" />;
}
