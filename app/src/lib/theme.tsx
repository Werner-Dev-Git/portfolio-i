import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
  type ReactNode,
} from 'react';

export type Theme = 'dark' | 'light';

interface ThemeValue {
  theme: Theme;
  /** Accent colour resolved from CSS custom properties, kept in sync with the
   *  theme so canvas/WebGL layers can paint with the same green. */
  accent: string;
  toggle: (origin?: { x: number; y: number }) => void;
}

const ThemeContext = createContext<ThemeValue | null>(null);

const readAccent = (): string =>
  getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#22c55e';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(
    () => (document.documentElement.dataset.theme as Theme) ?? 'dark',
  );
  const [accent, setAccent] = useState<string>('#22c55e');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'dark' ? '#0a0f0c' : '#f6faf6');
    // Read after the attribute lands so the new palette is in effect.
    const id = requestAnimationFrame(() => setAccent(readAccent()));
    return () => cancelAnimationFrame(id);
  }, [theme]);

  const toggle = useCallback((origin?: { x: number; y: number }) => {
    const next: Theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

    // View Transitions give the circular wipe from the button.
    if (!document.startViewTransition || reduced || !origin) {
      setTheme(next);
      return;
    }
    const { x, y } = origin;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    document
      .startViewTransition(() => { setTheme(next); })
      .ready.then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${radius}px at ${x}px ${y}px)`,
            ],
          },
          { duration: 550, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' },
        );
      })
      .catch(() => undefined);
  }, []);

  const value = useMemo<ThemeValue>(() => ({ theme, accent, toggle }), [theme, accent, toggle]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
