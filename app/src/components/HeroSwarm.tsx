import { useEffect, useRef } from 'react';
import { useTheme } from '@/lib/theme';

interface HeroSwarmProps {
  /** Pauses the render loop when the hero scrolls out of view. */
  active: boolean;
  /** Paint one still frame instead of animating (reduced-motion preference). */
  still?: boolean;
}

/**
 * Instanced tetrahedra ride a Fibonacci sphere inward to a glowing core —
 * chaotic at the rim, perfectly still at the centre, blue resolving to green.
 *
 * Ported from the `point_code` template, minus three things that are wrong for
 * a hero background: OrbitControls (it swallows scroll and hero clicks), the
 * opaque backdrop (this canvas must stay transparent) and the fixed 20k count.
 *
 * Three.js is imported dynamically so the ~600KB library never lands in the
 * initial bundle; the canvas fades in once it is ready.
 */
export function HeroSwarm({ active, still = false }: HeroSwarmProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  const activeRef = useRef(active);
  const stillRef = useRef(still);
  const darkRef = useRef(theme !== 'light');
  const playRef = useRef<(() => void) | null>(null);
  const bloomRef = useRef<((dark: boolean) => void) | null>(null);
  activeRef.current = active;
  stillRef.current = still;
  darkRef.current = theme !== 'light';

  useEffect(() => { bloomRef.current?.(theme !== 'light'); }, [theme]);
  useEffect(() => { if (active) playRef.current?.(); }, [active]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      const reduced = stillRef.current;
      const coarse = matchMedia('(pointer: coarse)').matches;
      const heavy = !reduced && !coarse;

      let THREE: typeof import('three');
      let Composer: typeof import('three/examples/jsm/postprocessing/EffectComposer.js') | null = null;
      let Render: typeof import('three/examples/jsm/postprocessing/RenderPass.js') | null = null;
      let Bloom: typeof import('three/examples/jsm/postprocessing/UnrealBloomPass.js') | null = null;
      try {
        THREE = await import('three');
        if (heavy) {
          [Composer, Render, Bloom] = await Promise.all([
            import('three/examples/jsm/postprocessing/EffectComposer.js'),
            import('three/examples/jsm/postprocessing/RenderPass.js'),
            import('three/examples/jsm/postprocessing/UnrealBloomPass.js'),
          ]);
        }
      } catch {
        return;
      }
      if (disposed) return;

      const COUNT = heavy ? 20000 : 6000;
      const SPEED = 0.4, CHAOS = 20, CORE = 10, SPAN = 150;
      const REPEL_R = 26, REPEL_R2 = REPEL_R * REPEL_R;
      const GOLDEN = (1 + Math.sqrt(5)) / 2;

      let renderer: import('three').WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({
          canvas, alpha: true, antialias: heavy, powerPreference: 'high-performance',
        });
      } catch {
        return;
      }
      renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 2000);
      camera.position.set(0, 0, 100);

      const geometry = new THREE.TetrahedronGeometry(0.25);
      const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const mesh = new THREE.InstancedMesh(geometry, material, COUNT);
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      mesh.frustumCulled = false;
      scene.add(mesh);

      const color = new THREE.Color();
      const positions: import('three').Vector3[] = new Array(COUNT);
      for (let i = 0; i < COUNT; i++) {
        positions[i] = new THREE.Vector3(
          (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100,
        );
        mesh.setColorAt(i, color.setHex(0x00ff88));
      }

      let composer: import('three/examples/jsm/postprocessing/EffectComposer.js').EffectComposer | null = null;
      let bloom: import('three/examples/jsm/postprocessing/UnrealBloomPass.js').UnrealBloomPass | null = null;
      if (heavy && Composer && Render && Bloom) {
        composer = new Composer.EffectComposer(renderer);
        composer.addPass(new Render.RenderPass(scene, camera));
        bloom = new Bloom.UnrealBloomPass(new THREE.Vector2(1, 1), 1.5, 0.4, 0.85);
        bloom.radius = 0.4;
        bloom.threshold = 0;
        composer.addPass(bloom);
      }
      // Additive bloom on a near-white page blows out to white, so light mode
      // gets a fraction of the template's strength.
      const syncBloom = (dark: boolean) => { if (bloom) bloom.strength = dark ? 1.8 : 0.4; };
      syncBloom(darkRef.current);
      bloomRef.current = syncBloom;

      const dummy = new THREE.Object3D();
      const target = new THREE.Vector3();
      const cursor = new THREE.Vector3();
      const ray = new THREE.Vector3();
      const clock = new THREE.Clock();

      let elapsed = 0, spin = 0;
      let tiltX = 0, tiltY = 0, wantTiltX = 0, wantTiltY = 0;
      let ndcX = 0, ndcY = 0, cursorOn = false;
      let raf = 0, snap = false;

      function locateCursor(): boolean {
        if (!cursorOn) return false;
        mesh.updateMatrixWorld();
        cursor.set(ndcX, ndcY, 0.5).unproject(camera);
        ray.copy(cursor).sub(camera.position).normalize();
        if (Math.abs(ray.z) < 1e-6) return false;
        cursor.copy(camera.position).addScaledVector(ray, -camera.position.z / ray.z);
        mesh.worldToLocal(cursor);
        return true;
      }

      function build(time: number, delta: number) {
        const isDark = darkRef.current;
        const repel = locateCursor();
        // Frame-rate independent chase: a fixed per-frame lerp would crawl on a
        // slow device and the swarm would never catch its target.
        const chase = delta ? 1 - Math.pow(0.9, delta * 60) : 1;

        for (let i = 0; i < COUNT; i++) {
          const norm = i / COUNT;
          const progress = (norm + time * SPEED * 0.2) % 1.0;
          const eased = Math.pow(progress, 1.5);

          const theta = (2 * Math.PI * i) / GOLDEN;
          const phi = Math.acos(1 - 2 * norm);
          const radius = CORE + SPAN * (1 - eased);

          // Noise is loudest at the rim and resolves to nothing at the core.
          const instability = Math.pow(1 - progress, 2);
          const sinPhi = Math.sin(phi);
          target.set(
            radius * sinPhi * Math.cos(theta) + Math.sin(time * 2 + norm * 100) * CHAOS * instability,
            radius * sinPhi * Math.sin(theta) + Math.cos(time * 1.5 + norm * 200) * CHAOS * instability,
            radius * Math.cos(phi) + Math.sin(time * 3 - norm * 300) * CHAOS * instability,
          );

          if (repel) {
            const dx = target.x - cursor.x, dy = target.y - cursor.y, dz = target.z - cursor.z;
            const d2 = dx * dx + dy * dy + dz * dz;
            if (d2 < REPEL_R2 && d2 > 1e-4) {
              const d = Math.sqrt(d2);
              // Scaled by instability so the settled core holds its shape and
              // the cursor only parts the loose outer flow.
              const push = (1 - d / REPEL_R) * 14 * instability;
              target.x += (dx / d) * push;
              target.y += (dy / d) * push;
              target.z += (dz / d) * push;
            }
          }

          positions[i].lerp(target, snap ? 1 : chase);
          dummy.position.copy(positions[i]);
          dummy.updateMatrix();
          mesh.setMatrixAt(i, dummy.matrix);

          // Blue at the rim resolving to a hot green core, capped below 1 so
          // the bloomed centre stays vivid green instead of white.
          const pulse = progress > 0.95 ? Math.sin(time * 10) * 0.3 : 0;
          // On a light page the ramp inverts: the rim fades toward white and
          // the core deepens, else 20k dark points pile into a black cloud.
          const lightness = isDark
            ? 0.2 + 0.45 * progress + pulse * 0.25
            : 0.66 - 0.28 * progress + pulse * 0.15;
          color.setHSL(
            0.6 - 0.36 * progress,
            0.8 + 0.2 * progress,
            Math.max(0, Math.min(1, lightness)),
          );
          mesh.setColorAt(i, color);
        }
        mesh.instanceMatrix.needsUpdate = true;
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      }

      function paint() {
        if (composer) composer.render();
        else renderer.render(scene, camera);
        canvas!.classList.add('is-ready');
      }

      function paintStill() {
        snap = true;
        mesh.rotation.set(-0.15, 0.6, 0);
        build(6, 0);
        snap = false;
        paint();
      }

      function frame() {
        raf = 0;
        const delta = Math.min(0.1, clock.getDelta());
        elapsed += delta;
        spin += delta * 0.25;
        tiltX += (wantTiltX - tiltX) * 0.05;
        tiltY += (wantTiltY - tiltY) * 0.05;
        mesh.rotation.set(-0.15 + tiltX, spin + tiltY, 0);
        build(elapsed, delta);
        paint();
        if (!stillRef.current && activeRef.current && !document.hidden) {
          raf = requestAnimationFrame(frame);
        }
      }

      const play = () => {
        if (stillRef.current || raf || !activeRef.current || document.hidden) return;
        clock.getDelta();
        raf = requestAnimationFrame(frame);
      };
      playRef.current = play;

      function resize() {
        const w = canvas!.clientWidth, h = canvas!.clientHeight;
        if (!w || !h) return;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
        composer?.setSize(w, h);
        // A resize clears the drawing buffer and still mode has no loop to
        // repaint it, so paint again here.
        if (stillRef.current) paintStill();
      }

      const onMove = (e: MouseEvent) => {
        const r = canvas!.getBoundingClientRect();
        ndcX = ((e.clientX - r.left) / r.width) * 2 - 1;
        ndcY = -(((e.clientY - r.top) / r.height) * 2 - 1);
        cursorOn = e.clientX > r.left - 160 && e.clientX < r.right + 160
          && e.clientY > r.top - 160 && e.clientY < r.bottom + 160;
        wantTiltY = (e.clientX / innerWidth - 0.5) * 0.5;
        wantTiltX = (e.clientY / innerHeight - 0.5) * 0.35;
      };
      const onLeave = () => { cursorOn = false; };
      if (heavy) {
        addEventListener('mousemove', onMove, { passive: true });
        document.addEventListener('mouseleave', onLeave);
      }
      document.addEventListener('visibilitychange', play);

      let sizeTimer: number | undefined;
      const onResize = () => {
        clearTimeout(sizeTimer);
        sizeTimer = window.setTimeout(resize, 150);
      };
      addEventListener('resize', onResize);

      resize();
      if (reduced) paintStill();
      else play();

      cleanup = () => {
        cancelAnimationFrame(raf);
        clearTimeout(sizeTimer);
        removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseleave', onLeave);
        document.removeEventListener('visibilitychange', play);
        removeEventListener('resize', onResize);
        playRef.current = null;
        bloomRef.current = null;
        composer?.dispose();
        geometry.dispose();
        material.dispose();
        mesh.dispose();
        renderer.dispose();
      };
    })();

    return () => { disposed = true; cleanup?.(); };
  }, []);

  return <canvas className="hero-particles" ref={canvasRef} aria-hidden="true" />;
}
