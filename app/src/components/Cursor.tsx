import { useEffect, useRef } from 'react';
import { useFinePointer, useReducedMotion } from '@/hooks/useMediaQuery';

/** Dot + trailing ring that grows over interactive elements. */
export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const enabled = fine && !reduced;

  useEffect(() => {
    if (!enabled) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mx = -100, my = -100, rx = -100, ry = -100, raf = 0;
    const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
    const onOver = (e: MouseEvent) => {
      const target = e.target as Element | null;
      ring.classList.toggle('is-active', !!target?.closest('a, button, .shot'));
    };
    const loop = () => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      dot.style.transform = `translate(${mx}px, ${my}px)`;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseover', onOver);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <>
      <div className="cursor-ring" ref={ringRef} />
      <div className="cursor-dot" ref={dotRef} />
    </>
  );
}
