import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { siteCopy } from '../../lib/content';
import { getConsent, setConsent } from '../../services/consent';

export function CookieConsent(): React.JSX.Element | null {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => setVisible(getConsent() === null);
    update();
    window.addEventListener('AppTray Labs:consent', update);
    window.addEventListener('AppTray Labs:consent-open', update);
    return () => {
      window.removeEventListener('AppTray Labs:consent', update);
      window.removeEventListener('AppTray Labs:consent-open', update);
    };
  }, []);

  if (!visible) return null;

  const choose = (level: 'essential' | 'personalized') => {
    setConsent(level);
    setVisible(false);
  };

  return (
    <section
      aria-label="Cookie consent"
      className="safe-bottom fixed inset-x-3 bottom-3 z-[110] mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur dark:border-slate-700 dark:bg-slate-900/95"
    >
      <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">
        {siteCopy.chrome.consent}{' '}
        <Link to="/privacy-policy" className="font-semibold text-brand-700 underline dark:text-brand-50">
          {siteCopy.chrome.consentLink}
        </Link>
        .
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => choose('essential')}
          className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-semibold dark:border-slate-600"
        >
          {siteCopy.chrome.consentEssential}
        </button>
        <button
          type="button"
          onClick={() => choose('personalized')}
          className="min-h-11 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
        >
          {siteCopy.chrome.consentPersonalized}
        </button>
      </div>
    </section>
  );
}
