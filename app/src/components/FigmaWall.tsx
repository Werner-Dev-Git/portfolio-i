import { useMemo, useRef, useState } from 'react';
import { asset } from '@/lib/asset';
import { figmaShots } from '@/data/figma';
import { useMediaQuery, useReducedMotion } from '@/hooks/useMediaQuery';
import { Lightbox } from './Lightbox';

const DURATIONS = ['52s', '68s', '58s', '74s'];

/** Auto-scrolling wall of Figma exports. Column count follows the breakpoint
 *  and every shot is always placed — nothing is hidden on small screens. */
export function FigmaWall() {
  const reduced = useReducedMotion();
  const narrow = useMediaQuery('(max-width: 620px)');
  const medium = useMediaQuery('(max-width: 1000px)');
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const colCount = narrow ? 2 : medium ? 3 : 4;

  const columns = useMemo(() => {
    const cols: { src: string; index: number }[][] = Array.from({ length: colCount }, () => []);
    figmaShots.forEach((src, index) => cols[index % colCount].push({ src, index }));
    return cols;
  }, [colCount]);

  return (
    <>
      <div className="figma-wall">
        {columns.map((items, c) => (
          <div
            key={c}
            className={`figma-col${c % 2 ? ' rev' : ''}`}
            style={{ ['--dur' as string]: DURATIONS[c % DURATIONS.length] }}
          >
            {/* Duplicated once for a seamless loop (skipped when motion is reduced). */}
            {(reduced ? items : [...items, ...items]).map((item, i) => (
              <button
                key={`${item.index}-${i}`}
                type="button"
                className="shot"
                aria-label={`View design ${item.index + 1}`}
                onClick={(e) => {
                  triggerRef.current = e.currentTarget;
                  setOpenIndex(item.index);
                }}
              >
                <img
                  src={asset(item.src)}
                  alt={`Figma design ${item.index + 1}`}
                  loading="lazy"
                  decoding="async"
                />
              </button>
            ))}
          </div>
        ))}
      </div>

      <Lightbox
        shots={figmaShots}
        index={openIndex}
        onClose={() => {
          setOpenIndex(null);
          triggerRef.current?.focus();
        }}
        onNavigate={setOpenIndex}
      />
    </>
  );
}
