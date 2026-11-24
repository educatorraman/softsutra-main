import { useI18n } from '../../context/I18nContext';
import { getFaqs, resolveCopy } from '../../lib/content';
import type { EditorialGuide } from '../../types/content';
import { FaqList } from './FaqList';

interface EditorialSectionProps {
  guide: EditorialGuide;
  anchorId?: string;
}

export function EditorialSection({ guide, anchorId }: EditorialSectionProps): React.JSX.Element {
  const { t } = useI18n();
  const faqs = getFaqs(guide.appKey === 'jap' || guide.appKey === 'music' ? 'wellness' : guide.appKey);

  return (
    <section aria-labelledby={`guide-${guide.appKey}`} className="mt-12 scroll-mt-24" id={anchorId}>
      {anchorId && <span className="sr-only">{t('read_guides')}</span>}
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-50">
        {resolveCopy(guide.kicker)}
      </p>
      <h3 id={`guide-${guide.appKey}`} className="mt-2 text-2xl font-extrabold tracking-tight">
        {resolveCopy(guide.title)}
      </h3>
      <p className="mt-4 text-[15px] leading-8 text-slate-700 dark:text-slate-300">
        {resolveCopy(guide.intro)}
      </p>

      <div className="mt-6 grid gap-6">
        {guide.sections.map((section) => (
          <article
            key={section.heading}
            className="rounded-2xl border border-slate-200 bg-white/60 p-5 dark:border-slate-800 dark:bg-slate-900/30"
          >
            <h4 className="text-lg font-bold">{resolveCopy(section.heading)}</h4>
            {section.paragraphs.map((paragraph) => (
              <p
                key={paragraph.slice(0, 40)}
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
          </article>
        ))}
      </div>

      <p className="mt-6 text-sm leading-7 text-slate-700 dark:text-slate-300">
        {resolveCopy(guide.conclusion)}
      </p>

      {faqs.length > 0 && (
        <section aria-labelledby={`faq-${guide.appKey}`} className="mt-8">
          <h4 id={`faq-${guide.appKey}`} className="mb-4 text-lg font-bold">
            Frequently asked questions
          </h4>
          <FaqList items={faqs} />
        </section>
      )}
    </section>
  );
}
