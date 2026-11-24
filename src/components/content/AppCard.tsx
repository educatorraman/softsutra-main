import {
  ArrowUpRight,
  Calculator,
  Gauge,
  GraduationCap,
  Headphones,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import type { JSX } from 'react';
import { getAppUrl, getRootDomain } from '../../config/domain';
import type { AppMeta } from '../../types/content';

const ICONS: Record<string, JSX.Element> = {
  exam: <GraduationCap size={22} aria-hidden="true" />,
  jap: <Sparkles size={22} aria-hidden="true" />,
  music: <Headphones size={22} aria-hidden="true" />,
  calculator: <Calculator size={22} aria-hidden="true" />,
  speed: <Gauge size={22} aria-hidden="true" />,
  cafe: <ShieldCheck size={22} aria-hidden="true" />,
};

export function AppCard({ app }: { app: AppMeta }): JSX.Element {
  return (
    <article
      id={`app-${app.key}`}
      className="flex scroll-mt-24 flex-col rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-brand-500/40"
    >
      <header className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-50">
          {ICONS[app.key] ?? <Sparkles size={22} aria-hidden="true" />}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {app.subdomain}.{getRootDomain()}
          </p>
          <h3 className="text-lg font-extrabold leading-tight">{app.fullName}</h3>
        </div>
      </header>

      <p className="mt-3 text-xs font-semibold text-brand-700 dark:text-brand-50">{app.tagline}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{app.summary}</p>

      <ul className="mt-4 grid gap-2 text-xs leading-5 text-slate-600 dark:text-slate-400">
        {app.features.slice(0, 4).map((feature) => (
          <li key={feature} className="flex gap-2">
            <span aria-hidden="true" className="text-brand-500">
              ✓
            </span>
            {feature}
          </li>
        ))}
      </ul>

      <div className="mt-5 flex flex-wrap items-center gap-2 pt-1">
        <a
          href={getAppUrl(app.key)}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700 active:scale-95"
        >
          {app.ctaLabel} <ArrowUpRight size={15} aria-hidden="true" />
        </a>
        {app.status === 'expanding' && (
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
            Expanding
          </span>
        )}
      </div>
    </article>
  );
}
