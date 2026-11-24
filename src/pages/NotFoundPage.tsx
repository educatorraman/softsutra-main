import { Link } from '@tanstack/react-router';
import { usePageMeta } from '../lib/seo';

export function NotFoundPage(): React.JSX.Element {
  usePageMeta('Page not found | SoftSutra', 'The requested SoftSutra page does not exist.', '/');
  return (
    <section className="grid min-h-[50vh] place-items-center text-center">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-50">404</p>
        <h1 className="mt-2 text-3xl font-extrabold">That page is not in the ecosystem</h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          Return to the portal to launch a tool or read a guide.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-brand-600 px-5 font-semibold text-white"
        >
          Back to SoftSutra
        </Link>
      </div>
    </section>
  );
}
