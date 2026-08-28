import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
  type ReactNode,
} from 'react';
import { useTheme } from './theme';

export interface SmokeSettings {
  ppf: number; spd: number; spdV: number; drift: number;
  rMin: number; rVar: number; grow: number; alpha: number;
  decay: number; decayV: number; pad: number;
  gi: number; gb: number; gs: number; gp: number;
  /** null follows the active theme palette. */
  colors: string[] | null;
}

export const SMOKE_DEFAULTS: SmokeSettings = {
  ppf: 3, spd: 0.45, spdV: 0.5, drift: 0.4,
  rMin: 9, rVar: 16, grow: 0.34, alpha: 0.12,
  decay: 0.009, decayV: 0.013, pad: 80,
  gi: 0.8, gb: 28, gs: 4, gp: 2.2,
  colors: null,
};

const STORAGE_KEY = 'smokeLab.v2';

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
