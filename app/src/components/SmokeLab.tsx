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
  { key: 'density', label: 'Density', min: 0.1, max: 2.5, step: 0.05 },
  { key: 'speed', label: 'Flow speed', min: 0.05, max: 2, step: 0.05 },
  { key: 'scale', label: 'Wisp scale', min: 60, max: 420, step: 10 },
  { key: 'reach', label: 'Reach', min: 30, max: 170, step: 5 },
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
