import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Suspense, useEffect, useState } from 'react';
import { AdSlot } from '../components/ads/AdSlot';
import { CookieConsent } from '../components/layout/CookieConsent';
import { ErrorBoundary } from '../components/layout/ErrorBoundary';
import { Footer } from '../components/layout/Footer';
import { Header } from '../components/layout/Header';
import { InstallPrompt } from '../components/layout/InstallPrompt';
import { MobileStickyAd } from '../components/layout/MobileStickyAd';
import { NavRail } from '../components/layout/NavRail';
import { BackLink } from '../components/ui/BackLink';
import { Toast } from '../components/ui/Toast';
import { I18nProvider } from '../context/I18nContext';
import { InstallProvider } from '../context/InstallContext';
import { StructuredData } from '../lib/seo';
import { installUiShield } from '../services/shield';

function RouteFallback(): React.JSX.Element {
  return (
    <div
      role="status"
      className="min-h-[40vh] animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900"
      aria-label="Loading page"
    />
  );
}

function RootLayout(): React.JSX.Element {
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => installUiShield(), []);

  useEffect(() => {
    window.history.replaceState(
      { ...(window.history.state as object | null), AppTrayLabsRoot: true },
      '',
      window.location.href,
    );
    const onPop = (event: PopStateEvent) => {
      if (
        window.location.pathname === '/' &&
        !(event.state as { AppTrayLabsRoot?: boolean } | null)?.AppTrayLabsRoot
      ) {
        setToast('Press back again to exit AppTray Labs');
        window.history.pushState({ AppTrayLabsRoot: true }, '', window.location.href);
        window.setTimeout(() => setToast(null), 2200);
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  return (
    <I18nProvider>
      <InstallProvider>
        <ErrorBoundary>
          <StructuredData />
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-white"
          >
            Skip to main content
          </a>
          <Header />
          <div className="mx-auto max-w-7xl px-4">
            <AdSlot kind="leaderboard" />
          </div>
          <div className="mx-auto grid max-w-7xl gap-8 px-4 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[180px_minmax(0,1fr)_300px]">
            <NavRail />
            <main id="main-content" className="min-w-0 pb-10">
              <BackLink />
              <Suspense fallback={<RouteFallback />}>
                <Outlet />
              </Suspense>
            </main>
            <aside aria-label="Sponsored content" className="hidden lg:block">
              <div className="sticky top-24">
                <AdSlot kind="sidebar" />
              </div>
            </aside>
          </div>
          <Footer />
          <MobileStickyAd />
          <CookieConsent />
          <InstallPrompt />
          <Toast message={toast} />
        </ErrorBoundary>
      </InstallProvider>
    </I18nProvider>
  );
}

export const Route = createRootRoute({ component: RootLayout });
