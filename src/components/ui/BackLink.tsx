import { Link, useRouterState } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { siteCopy } from '../../lib/content';

/** Accessible top-left return control for every sub-page. */
export function BackLink(): React.JSX.Element | null {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  if (pathname === '/') return null;

  return (
    <nav aria-label="Breadcrumb" className="pt-4">
      <Link
        to="/"
        className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-brand-700 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        {siteCopy.chrome.back}
      </Link>
    </nav>
  );
}
