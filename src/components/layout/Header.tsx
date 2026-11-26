import { Link } from '@tanstack/react-router';
import { Download, Menu, Monitor, Moon, Sun, X } from 'lucide-react';
import { type JSX, useCallback, useState } from 'react';
import { useI18n } from '../../context/I18nContext';
import { useInstall } from '../../context/InstallContext';
import { useBackGuard } from '../../hooks/useBackGuard';
import { useTheme } from '../../hooks/useTheme';

const NAV = [
  { key: 'nav_home', to: '/' },
  { key: 'nav_apps', to: '/', hash: 'ecosystem' },
  { key: 'nav_guides', to: '/', hash: 'guides' },
  { key: 'nav_about', to: '/about' },
  { key: 'nav_contact', to: '/contact' },
] as const;

export function Header(): JSX.Element {
  const { t, language, toggle } = useI18n();
  const { theme, cycle } = useTheme();
  const { available, install } = useInstall();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  useBackGuard(menuOpen, closeMenu);

  const ThemeIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;

  return (
    <header className="safe-top sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/85">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
        <Link
          to="/"
          className="flex min-h-11 items-center gap-2 rounded-lg pr-2 no-select"
          aria-label="AppTray Labs home"
        >
          <span className="grid size-9 place-items-center rounded-xl bg-brand-600 text-base font-black text-white shadow-md shadow-brand-600/25">
            S
          </span>
          <span className="text-lg font-extrabold tracking-tight">AppTray Labs</span>
        </Link>

        <nav aria-label="Primary navigation" className="ml-6 hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.key}
              to={item.to}
              hash={'hash' in item ? item.hash : undefined}
              onClick={closeMenu}
              className="min-h-11 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-brand-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          {available && (
            <button
              type="button"
              onClick={() => void install()}
              className="hidden min-h-11 items-center gap-1.5 rounded-lg border border-brand-200 px-3 text-xs font-semibold text-brand-700 md:flex dark:border-brand-500/40 dark:text-brand-50"
            >
              <Download size={15} aria-hidden="true" /> Install
            </button>
          )}
          <button
            type="button"
            onClick={toggle}
            aria-label={t('language_label')}
            className="grid size-11 place-items-center rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {language === 'en' ? 'हिं' : 'EN'}
          </button>
          <button
            type="button"
            onClick={cycle}
            aria-label={t('theme_label')}
            className="grid size-11 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ThemeIcon size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
            className="grid size-11 place-items-center rounded-lg text-slate-700 hover:bg-slate-100 lg:hidden dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Menu size={20} aria-hidden="true" />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className="absolute inset-x-0 top-16 border-b border-slate-200 bg-white p-4 shadow-xl lg:hidden dark:border-slate-800 dark:bg-slate-950"
        >
          <div className="mb-2 flex justify-end">
            <button
              type="button"
              onClick={closeMenu}
              aria-label="Close navigation menu"
              className="grid size-11 place-items-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>
          <nav aria-label="Mobile navigation" className="grid gap-1">
            {NAV.map((item) => (
              <Link
                key={item.key}
                to={item.to}
                hash={'hash' in item ? item.hash : undefined}
                onClick={closeMenu}
                className="min-h-12 rounded-xl px-4 py-3 text-base font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {t(item.key)}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
