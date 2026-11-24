import { useEffect, useState } from 'react';

export type ThemeChoice = 'light' | 'dark' | 'system';
const KEY = 'softsutra-theme';

export function useTheme(): { theme: ThemeChoice; cycle: () => void } {
  const [theme, setTheme] = useState<ThemeChoice>(() => {
    try {
      const stored = window.localStorage.getItem(KEY);
      return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
    } catch {
      return 'system';
    }
  });

  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const resolved = theme === 'system' ? (query.matches ? 'dark' : 'light') : theme;
      document.documentElement.dataset.theme = resolved;
    };
    apply();
    query.addEventListener('change', apply);
    try {
      window.localStorage.setItem(KEY, theme);
    } catch {
      /* ignore */
    }
    return () => query.removeEventListener('change', apply);
  }, [theme]);

  return {
    theme,
    cycle: () =>
      setTheme((current) => (current === 'light' ? 'dark' : current === 'dark' ? 'system' : 'light')),
  };
}
