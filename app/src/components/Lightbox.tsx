import { useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { asset } from '@/lib/asset';

interface LightboxProps {
  shots: string[];
  /** null closes the overlay. */
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

/** Full-size viewer: arrow keys, swipe, neighbour preloading and focus return. */
export function Lightbox({ shots, index, onClose, onNavigate }: LightboxProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = index !== null;

  const step = useCallback(
    (delta: number) => {
      if (index === null) return;
      onNavigate((index + delta + shots.length) % shots.length);
    },
    [index, shots.length, onNavigate],
  );

  // Keyboard control + background scroll lock.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    };
    addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, step, onClose]);

  // Warm the neighbours so navigation never shows a blank frame.
  useEffect(() => {
    if (index === null) return;
    [index - 1, index + 1].forEach((i) => {
      const img = new Image();
      img.src = asset(shots[(i + shots.length) % shots.length]);
    });
  }, [index, shots]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="lightbox-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={`Design ${index + 1} of ${shots.length}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.figure
            className="lightbox-figure"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 240, damping: 22 }}
          >
            <motion.img
              key={index}
              src={asset(shots[index])}
              alt={`Figma design ${index + 1}`}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.18}
              onDragEnd={(_, info) => {
                if (info.offset.x < -70) step(1);
                else if (info.offset.x > 70) step(-1);
              }}
              initial={{ opacity: 0.35 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
            <div className="lb-bar">
              <span className="lb-count">
                {String(index + 1).padStart(2, '0')} / {shots.length}
              </span>
              <div className="lb-nav">
                <button type="button" onClick={() => step(-1)} aria-label="Previous">←</button>
                <button type="button" onClick={() => step(1)} aria-label="Next">→</button>
                <button type="button" ref={closeRef} onClick={onClose} aria-label="Close">✕</button>
              </div>
            </div>
          </motion.figure>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
