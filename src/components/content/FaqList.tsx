import type { Faq } from '../../types/content';

export function FaqList({ items }: { items: Faq[] }): React.JSX.Element {
  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <details
          key={item.question}
          className="group rounded-xl border border-slate-200 bg-white/70 p-4 open:border-brand-200 dark:border-slate-800 dark:bg-slate-900/40 dark:open:border-brand-500/40"
        >
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold marker:hidden">
            {item.question}
            <span
              aria-hidden="true"
              className="text-brand-600 transition group-open:rotate-45 dark:text-brand-50"
            >
              +
            </span>
          </summary>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
