import { Link } from '@tanstack/react-router';
import { ArrowDown, ArrowUpRight, LockKeyhole, Sparkles, WifiOff } from 'lucide-react';
import { AdSlot } from '../components/ads/AdSlot';
import { AppCard } from '../components/content/AppCard';
import { EditorialSection } from '../components/content/EditorialSection';
import { SectionHeading } from '../components/ui/SectionHeading';
import { CafeWidget } from '../components/widgets/CafeWidget';
import { CalculatorWidget } from '../components/widgets/CalculatorWidget';
import { ExamWidget } from '../components/widgets/ExamWidget';
import { JapWidget } from '../components/widgets/JapWidget';
import { MusicWidget } from '../components/widgets/MusicWidget';
import { SpeedWidget } from '../components/widgets/SpeedWidget';
import { getAppUrl } from '../config/domain';
import { useI18n } from '../context/I18nContext';
import { apps, editorialGuides, resolveCopy, siteCopy } from '../lib/content';
import { usePageMeta } from '../lib/seo';

const TRUST_ICONS = [LockKeyhole, WifiOff, Sparkles];

export function HomePage(): React.JSX.Element {
  const { t } = useI18n();
  usePageMeta(siteCopy.home.metaTitle, siteCopy.home.metaDescription, '/');

  return (
    <>
      <section
        aria-labelledby="hero-heading"
        className="hero-grid -mx-4 rounded-b-3xl border-b border-slate-200 px-4 py-14 sm:py-20 dark:border-slate-800"
      >
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex rounded-full border border-brand-200 bg-white/70 px-4 py-1.5 text-xs font-semibold text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-50">
            {resolveCopy(t('hero_badge'))}
          </p>
          <h1 id="hero-heading" className="mt-5 text-4xl font-black leading-[1.1] tracking-tight sm:text-5xl">
            {resolveCopy(t('hero_title'))}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
            {resolveCopy(t('hero_sub'))}
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <a
              href="#ecosystem"
              className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-bold text-white shadow-lg shadow-brand-600/20 hover:bg-brand-700"
            >
              {t('explore_apps')} <ArrowDown size={16} aria-hidden="true" />
            </a>
            <a
              href="#guides"
              className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-slate-300 bg-white/70 px-5 text-sm font-bold hover:border-brand-300 dark:border-slate-700 dark:bg-slate-900/50"
            >
              {t('read_guides')}
            </a>
          </div>
          <p className="mt-5 text-xs text-slate-500">{t('trusted_by')}</p>
        </div>

        <nav
          aria-label="Quick launch applications"
          className="mx-auto mt-9 grid max-w-5xl grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6"
        >
          {apps.map((app) => (
            <a
              key={app.key}
              href={getAppUrl(app.key)}
              className="flex min-h-14 items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white/80 px-3 text-xs font-bold hover:border-brand-300 hover:text-brand-700 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:text-brand-50"
            >
              {app.name} <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          ))}
        </nav>

        <ul className="mx-auto mt-8 grid max-w-4xl gap-3 sm:grid-cols-3">
          {siteCopy.home.trust.map((point, index) => {
            const Icon = TRUST_ICONS[index] ?? Sparkles;
            return (
              <li
                key={point.title}
                className="rounded-xl border border-slate-200 bg-white/60 p-3 text-center dark:border-slate-800 dark:bg-slate-900/40"
              >
                <Icon size={17} className="mx-auto text-brand-600 dark:text-brand-50" aria-hidden="true" />
                <p className="mt-1 text-sm font-bold">{point.title}</p>
                <p className="text-[11px] text-slate-500">{point.text}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="ecosystem-heading" className="mt-14">
        <SectionHeading
          id="ecosystem-anchor"
          kicker={siteCopy.home.ecosystemKicker}
          title={siteCopy.home.ecosystemTitle}
          description={siteCopy.home.ecosystemDescription}
        />
        <span id="ecosystem" className="block scroll-mt-24" aria-hidden="true" />
        <h2 id="ecosystem-heading" className="sr-only">
          Ecosystem applications
        </h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {apps.map((app) => (
            <AppCard key={app.key} app={app} />
          ))}
        </div>
      </section>

      <AdSlot kind="in-article" />

      <section aria-labelledby="previews-heading" className="mt-14" id="guides">
        <span className="block scroll-mt-24" aria-hidden="true" />
        <SectionHeading
          kicker={siteCopy.home.previewsKicker}
          title={siteCopy.home.previewsTitle}
          description={siteCopy.home.previewsDescription}
        />
        <h2 id="previews-heading" className="sr-only">
          Live previews and guides
        </h2>

        <article aria-labelledby="finance-preview-heading" className="mt-8">
          <h3 id="finance-preview-heading" className="sr-only">
            Calculator preview and personal finance guide
          </h3>
          <CalculatorWidget />
          <EditorialSection guide={editorialGuides.finance} />
        </article>

        <AdSlot kind="in-article" />

        <article aria-labelledby="broadband-preview-heading" className="mt-12">
          <h3 id="broadband-preview-heading" className="sr-only">
            Speed preview and broadband guide
          </h3>
          <SpeedWidget />
          <EditorialSection guide={editorialGuides.broadband} />
        </article>

        <article aria-labelledby="exam-preview-guide-heading" className="mt-12">
          <h3 id="exam-preview-guide-heading" className="sr-only">
            Exam preview and preparation guide
          </h3>
          <ExamWidget />
          <EditorialSection guide={editorialGuides.exam} />
        </article>

        <AdSlot kind="in-article" />

        <article aria-labelledby="jap-preview-guide-heading" className="mt-12">
          <h3 id="jap-preview-guide-heading" className="sr-only">
            Jap preview and wellness guide
          </h3>
          <JapWidget />
          <EditorialSection guide={editorialGuides.wellness} />
        </article>

        <article aria-labelledby="music-preview-guide-heading" className="mt-12">
          <h3 id="music-preview-guide-heading" className="sr-only">
            Music preview and focus guide
          </h3>
          <MusicWidget />
          <EditorialSection guide={editorialGuides.wellness} anchorId="music-wellness" />
        </article>

        <article aria-labelledby="cafe-preview-guide-heading" className="mt-12">
          <h3 id="cafe-preview-guide-heading" className="sr-only">
            Cafe preview and document privacy guide
          </h3>
          <CafeWidget />
          <EditorialSection guide={editorialGuides.privacy} />
        </article>
      </section>

      <section
        aria-labelledby="closing-heading"
        className="mt-14 rounded-2xl border border-brand-200 bg-brand-50/70 p-6 text-center dark:border-brand-500/30 dark:bg-brand-500/10"
      >
        <h2 id="closing-heading" className="text-2xl font-extrabold">
          {siteCopy.home.closingTitle}
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-slate-600 dark:text-slate-300">
          {siteCopy.home.closingDescription}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <a
            href="#ecosystem"
            className="inline-flex min-h-11 items-center rounded-lg bg-brand-600 px-5 text-sm font-bold text-white"
          >
            Browse all apps
          </a>
          <Link
            to="/about"
            className="inline-flex min-h-11 items-center rounded-lg border border-brand-300 px-5 text-sm font-bold text-brand-700 dark:border-brand-500/40 dark:text-brand-50"
          >
            How AppTray Labs works
          </Link>
        </div>
      </section>
    </>
  );
}
