import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useSmokeConfig, type SmokeSettings } from '@/lib/smokeConfig';

interface SliderSpec {
  key: keyof SmokeSettings;
  label: string;
  min: number;
  max: number;
  step: number;
}

const SLIDERS: SliderSpec[] = [
  { key: 'ppf', label: 'Particles/frame', min: 1, max: 14, step: 1 },
  { key: 'spd', label: 'Speed', min: 0.1, max: 2, step: 0.05 },
  { key: 'spdV', label: 'Speed variance', min: 0, max: 1.5, step: 0.05 },
  { key: 'drift', label: 'Drift', min: 0, max: 1.5, step: 0.05 },
  { key: 'rMin', label: 'Start radius', min: 2, max: 40, step: 1 },
  { key: 'rVar', label: 'Radius variance', min: 0, max: 40, step: 1 },
  { key: 'grow', label: 'Growth rate', min: 0.02, max: 1.2, step: 0.02 },
  { key: 'alpha', label: 'Opacity', min: 0.02, max: 0.55, step: 0.01 },
  { key: 'decay', label: 'Decay', min: 0.002, max: 0.04, step: 0.001 },
  { key: 'decayV', label: 'Decay variance', min: 0, max: 0.04, step: 0.001 },
  { key: 'pad', label: 'Overflow pad', min: 20, max: 160, step: 5 },
  { key: 'gi', label: 'Glow intensity', min: 0, max: 1, step: 0.01 },
  { key: 'gb', label: 'Glow blur', min: 4, max: 80, step: 1 },
  { key: 'gs', label: 'Glow spread', min: 0, max: 20, step: 1 },
  { key: 'gp', label: 'Pulse duration', min: 0.3, max: 6, step: 0.1 },
];

/** Live tuning panel for the smoke + glow. Values persist per browser. */
export function SmokeLab() {
  const { settings, palette, set, setColor, reset } = useSmokeConfig();
  const [open, setOpen] = useState(false);

  return (
    <div className={`smoke-ctrl${open ? ' open' : ''}`}>
      <button
        type="button"
        className="sc-head"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span>⚙ Smoke lab — tune the card effect</span>
        <span className="sc-caret">▾</span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="sc-body">
              {SLIDERS.map(({ key, label, min, max, step }) => (
                <label className="sc-row" key={key}>
                  <span>{label}</span>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={settings[key] as number}
                    onChange={(e) => set(key, Number(e.target.value) as never)}
                  />
                  <b>{settings[key] as number}</b>
                </label>
              ))}

              <div className="sc-row sc-colors">
                <span>Card colors</span>
                {[0, 1, 2].map((i) => (
                  <input
                    key={i}
                    type="color"
                    aria-label={`Card ${i + 1} colour`}
                    value={palette[i]}
                    onChange={(e) => setColor(i, e.target.value)}
                  />
                ))}
                <button type="button" className="sc-reset" onClick={reset}>Reset</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
