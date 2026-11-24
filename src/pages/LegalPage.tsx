import { AdSlot } from '../components/ads/AdSlot';
import { getLegal, resolveCopy } from '../lib/content';
import { usePageMeta } from '../lib/seo';
import type { LegalDocument } from '../types/content';

const PATHS: Record<string, string> = {
  about: '/about',
  privacy: '/privacy-policy',
  terms: '/terms',
  disclaimer: '/disclaimer',
};

export function LegalPage({
  documentKey,
}: {
  documentKey: 'about' | 'privacy' | 'terms' | 'disclaimer';
}): React.JSX.Element {
  const doc: LegalDocument = getLegal(documentKey);
  usePageMeta(`${doc.title} | SoftSutra`, doc.lead, PATHS[documentKey]);

  return (
    <article className="pb-4">
      <header className="rounded-2xl border border-slate-200 bg-white/70 p-6 dark:border-slate-800 dark:bg-slate-900/40">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-50">
          SoftSutra · Trust centre
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">{doc.title}</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400">{resolveCopy(doc.lead)}</p>
        <p className="mt-4 text-xs text-slate-500">Last updated: {doc.updated}</p>
      </header>

      <AdSlot kind="in-article" className="mt-8" />

      <div className="mt-8 grid gap-6">
        {doc.sections.map((section, index) => (
          <section
            key={section.heading}
            className="rounded-2xl border border-slate-200 bg-white/60 p-5 dark:border-slate-800 dark:bg-slate-900/30"
          >
            <h2 className="text-xl font-bold">
              <span className="mr-2 text-xs font-semibold text-slate-400">
                {String(index + 1).padStart(2, '0')}
              </span>
              {resolveCopy(section.heading)}
            </h2>
            {section.paragraphs.map((paragraph) => (
              <p
                key={paragraph.slice(0, 32)}
                className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400"
              >
                {resolveCopy(paragraph)}
              </p>
            ))}
            {section.bullets && (
              <ul className="mt-4 grid list-disc gap-2 pl-5 text-sm leading-7 text-slate-600 marker:text-brand-500 dark:text-slate-400">
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{resolveCopy(bullet)}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </article>
  );
}
