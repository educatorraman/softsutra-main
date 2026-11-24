import { createContext, type JSX, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import ui from '../data/ui.json';

type Language = 'en' | 'hi';
type Dictionary = Record<string, string>;

interface I18nValue {
  language: Language;
  toggle: () => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nValue | null>(null);
const dictionaries = ui as Record<Language, Dictionary>;

export function I18nProvider({ children }: { children: ReactNode }): JSX.Element {
  const [language, setLanguage] = useState<Language>(() => {
    try {
      return window.localStorage.getItem('softsutra-lang') === 'hi' ? 'hi' : 'en';
    } catch {
      return 'en';
    }
  });

  useEffect(() => {
    document.documentElement.lang = language;
    try {
      window.localStorage.setItem('softsutra-lang', language);
    } catch {
      /* ignore */
    }
  }, [language]);

  const value = useMemo<I18nValue>(
    () => ({
      language,
      toggle: () => setLanguage((current) => (current === 'en' ? 'hi' : 'en')),
      t: (key: string) => dictionaries[language][key] ?? dictionaries.en[key] ?? key,
    }),
    [language],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used inside I18nProvider');
  return context;
}
