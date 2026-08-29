import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
  type ReactNode,
} from 'react';
import { useTheme } from './theme';

export interface SmokeSettings {
  /** Overall opacity of the smoke field. */
  density: number;
  /** How fast the noise field drifts and curls. */
  speed: number;
  /** Noise feature size in px — larger means broader wisps. */
  scale: number;
  /** How far smoke reaches out from each panel edge, in px. */
  reach: number;
  gi: number; gb: number; gs: number; gp: number;
  /** null follows the active theme palette. */
  colors: string[] | null;
}

export const SMOKE_DEFAULTS: SmokeSettings = {
  density: 1.5, speed: 0.5, scale: 190, reach: 130,
  gi: 0.8, gb: 28, gs: 4, gp: 2.2,
  colors: null,
};

const STORAGE_KEY = 'smokeLab.v3';

interface SmokeContextValue {
  settings: SmokeSettings;
  palette: string[];
  set: <K extends keyof SmokeSettings>(key: K, value: SmokeSettings[K]) => void;
  setColor: (index: number, hex: string) => void;
  reset: () => void;
}

const SmokeContext = createContext<SmokeContextValue | null>(null);

const readStored = (): Partial<SmokeSettings> => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Partial<SmokeSettings>;
  } catch {
    return {};
  }
};

export function SmokeProvider({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const [settings, setSettings] = useState<SmokeSettings>(
    () => ({ ...SMOKE_DEFAULTS, ...readStored() }),
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const themePalette = useMemo(
    () => (theme === 'dark'
      ? ['#22c55e', '#4ade80', '#a3e635']
      : ['#16a34a', '#15803d', '#65a30d']),
    [theme],
  );
  const palette = settings.colors ?? themePalette;

  const set = useCallback(
    <K extends keyof SmokeSettings>(key: K, value: SmokeSettings[K]) =>
      setSettings((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const setColor = useCallback(
    (index: number, hex: string) =>
      setSettings((prev) => {
        const base = prev.colors ?? themePalette;
        const colors = [...base];
        colors[index] = hex;
        return { ...prev, colors };
      }),
    [themePalette],
  );

  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSettings({ ...SMOKE_DEFAULTS });
  }, []);

  const value = useMemo<SmokeContextValue>(
    () => ({ settings, palette, set, setColor, reset }),
    [settings, palette, set, setColor, reset],
  );
  return <SmokeContext.Provider value={value}>{children}</SmokeContext.Provider>;
}

export function useSmokeConfig(): SmokeContextValue {
  const ctx = useContext(SmokeContext);
  if (!ctx) throw new Error('useSmokeConfig must be used inside <SmokeProvider>');
  return ctx;
}

export function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
