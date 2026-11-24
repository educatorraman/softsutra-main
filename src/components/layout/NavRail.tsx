import { Link } from '@tanstack/react-router';
import { Compass } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';
import { siteCopy } from '../../lib/content';

const RAIL_LINKS = [
  { key: 'nav_home', to: '/' },
  { key: 'nav_apps', to: '/', hash: 'ecosystem' },
  { key: 'nav_guides', to: '/', hash: 'guides' },
  { key: 'nav_about', to: '/about' },
  { key: 'nav_contact', to: '/contact' },
] as const;

/** Persistent desktop navigation rail; the compact header handles smaller viewports. */
export function NavRail(): React.JSX.Element {
  const { t } = useI18n();

  return (
    <nav aria-label="Section navigation" className="sticky top-24 hidden h-fit xl:block">
      <p className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">
        <Compass size={14} aria-hidden="true" />
        {siteCopy.chrome.sectionsLabel}
      </p>
      <ul className="space-y-1">
        {RAIL_LINKS.map((item) => (
          <li key={item.key}>
            <Link
              to={item.to}
              hash={'hash' in item ? item.hash : undefined}
              className="block min-h-10 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-brand-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              {t(item.key)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
