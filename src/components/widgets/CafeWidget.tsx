import { ExternalLink, FileCheck2 } from 'lucide-react';
import { useState } from 'react';
import { getAppUrl } from '../../config/domain';
import { useStoredState } from '../../hooks/useStoredState';
import { previews, siteCopy } from '../../lib/content';
import { shareText } from '../../services/platform';

export function CafeWidget(): React.JSX.Element {
  const [checked, setChecked] = useStoredState<string[]>('widget:cafe:checklist', []);
  const [status, setStatus] = useState<string | null>(null);
  const items = previews.cafeChecklist;
  const required = items.filter((item) => item.required);
  const requiredDone = required.filter((item) => checked.includes(item.id)).length;
  const progress = Math.round((checked.length / items.length) * 100);

  const toggle = (id: string) => {
    setChecked((previous) =>
      previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id],
    );
  };

  const copy = async () => {
    const text = items
      .map((item) => `${checked.includes(item.id) ? '[x]' : '[ ]'} ${item.label} — ${item.detail}`)
      .join('\n');
    const result = await shareText('SoftSutra Cafe document checklist', text, getAppUrl('cafe'));
    setStatus(
      result === 'copied'
        ? 'Checklist copied.'
        : result === 'shared'
          ? 'Shared successfully.'
          : 'Copy is unavailable in this browser.',
    );
  };

  return (
    <section
      aria-labelledby="cafe-preview"
      className="mb-8 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50"
    >
      <header className="flex items-center gap-2">
        <FileCheck2 size={18} className="text-brand-600 dark:text-brand-50" aria-hidden="true" />
        <h3 id="cafe-preview" className="text-lg font-bold">
          Zero-USB readiness simulator
        </h3>
      </header>
      <p className="mt-1 text-xs text-slate-500">{siteCopy.widgets.cafe.description}</p>

      <div className="mt-4" aria-live="polite">
        <div className="flex justify-between text-xs font-semibold">
          <span>
            {requiredDone} of {required.length} essential items ready
          </span>
          <span>{progress}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-brand-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <ul className="mt-5 grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.id}>
            <label className="flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3 hover:border-brand-300 dark:border-slate-700">
              <input
                type="checkbox"
                checked={checked.includes(item.id)}
                onChange={() => toggle(item.id)}
                className="mt-1 size-4 accent-brand-600"
              />
              <span>
                <span className="block text-sm font-semibold">
                  {item.label}{' '}
                  {item.required && (
                    <span className="text-[10px] font-bold uppercase text-rose-600">required</span>
                  )}
                </span>
                <span className="mt-0.5 block text-xs leading-5 text-slate-500">{item.detail}</span>
              </span>
            </label>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => void copy()}
          className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          Copy checklist
        </button>
        <a
          href={getAppUrl('cafe')}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
        >
          {siteCopy.widgets.cafe.cta} <ExternalLink size={14} aria-hidden="true" />
        </a>
      </div>
      {status && (
        <p role="status" className="mt-2 text-xs text-emerald-700 dark:text-emerald-400">
          {status}
        </p>
      )}
    </section>
  );
}
