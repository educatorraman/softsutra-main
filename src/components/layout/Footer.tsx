import { Link } from '@tanstack/react-router';
import { Download, Mail } from 'lucide-react';
import { founderEmail, getSupportEmail } from '../../config/contact';
import { getAppUrl } from '../../config/domain';
import { useI18n } from '../../context/I18nContext';
import { useInstall } from '../../context/InstallContext';
import { apps, resolveCopy } from '../../lib/content';

const LEGAL_LINKS = [
  { to: '/about', label: 'About AppTray Labs' },
  { to: '/contact', label: 'Contact' },
  { to: '/privacy-policy', label: 'Privacy Policy' },
  { to: '/terms', label: 'Terms of Service' },
  { to: '/disclaimer', label: 'Disclaimer' },
] as const;

export function Footer(): React.JSX.Element {
  const { t } = useI18n();
  const { available, standalone, install } = useInstall();

  return (
    <footer className="safe-bottom mt-16 border-t border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-950/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-2 lg:grid-cols-4">
        <section aria-labelledby="footer-brand">
          <h2 id="footer-brand" className="text-lg font-extrabold">
            AppTray Labs
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
            {resolveCopy(t('hero_sub'))}
          </p>
          <p className="mt-4 text-xs leading-5 text-slate-500 dark:text-slate-500">
            Founded by Raman Sharma · Village Sarsa, Pehowa, Kurukshetra, Haryana, India
          </p>
        </section>

        <nav aria-label="Ecosystem links">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Ecosystem
          </h2>
          <ul className="mt-4 grid gap-2 text-sm">
            {apps.map((app) => (
              <li key={app.key}>
                <a
                  href={getAppUrl(app.key)}
                  rel="noopener noreferrer"
                  className="text-slate-600 hover:text-brand-700 hover:underline dark:text-slate-300 dark:hover:text-white"
                >
                  {app.fullName} ↗
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Trust and legal links">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Trust &amp; legal
          </h2>
          <ul className="mt-4 grid gap-2 text-sm">
            {LEGAL_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-slate-600 hover:text-brand-700 hover:underline dark:text-slate-300 dark:hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new Event('AppTray Labs:consent-open'))}
                className="text-left text-slate-600 hover:text-brand-700 hover:underline dark:text-slate-300 dark:hover:text-white"
              >
                Privacy choices
              </button>
            </li>
          </ul>
        </nav>

        <section aria-labelledby="footer-contact">
          <h2
            id="footer-contact"
            className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
          >
            Contact
          </h2>
          <ul className="mt-4 grid gap-3 text-sm text-slate-600 dark:text-slate-300">
            <li className="flex items-start gap-2">
              <Mail size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              <a
                href={`mailto:${founderEmail}`}
                className="break-all hover:text-brand-700 hover:underline dark:hover:text-white"
              >
                {founderEmail}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <Mail size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              <a
                href={`mailto:${getSupportEmail()}`}
                className="break-all hover:text-brand-700 hover:underline dark:hover:text-white"
              >
                {getSupportEmail()}
              </a>
            </li>
            {available && !standalone && (
              <li>
                <button
                  type="button"
                  onClick={() => void install()}
                  className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-lg border border-brand-200 px-3 text-sm font-semibold text-brand-700 dark:border-brand-500/40 dark:text-brand-50"
                >
                  <Download size={16} aria-hidden="true" /> Install AppTray Labs
                </button>
              </li>
            )}
          </ul>
        </section>
      </div>

      <div className="border-t border-slate-200 py-5 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-500">
        © {new Date().getFullYear()} AppTrayLabs. All rights reserved. Advertisements help keep every tool free.
      </div>
    </footer>
  );
}
