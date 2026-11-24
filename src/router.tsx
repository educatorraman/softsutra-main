import { createBrowserHistory, createHashHistory, createRoute, createRouter } from '@tanstack/react-router';
import { lazy } from 'react';
import { HomePage } from './pages/HomePage';
import { Route as rootRoute } from './routes/root';

const AboutComponent = lazy(() =>
  import('./routes/about').then((module) => ({ default: module.AboutRouteComponent })),
);
const ContactComponent = lazy(() =>
  import('./pages/ContactPage').then((module) => ({ default: module.ContactPage })),
);
const PrivacyComponent = lazy(() =>
  import('./routes/privacy-policy').then((module) => ({ default: module.PrivacyRouteComponent })),
);
const TermsComponent = lazy(() =>
  import('./routes/terms').then((module) => ({ default: module.TermsRouteComponent })),
);
const DisclaimerComponent = lazy(() =>
  import('./routes/disclaimer').then((module) => ({ default: module.DisclaimerRouteComponent })),
);
const NotFoundComponent = lazy(() =>
  import('./pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })),
);

function shouldUseHashHistory(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return (
      Boolean(window.Capacitor?.isNativePlatform?.()) ||
      ['capacitor:', 'android-app:', 'file:'].includes(window.location.protocol)
    );
  } catch {
    return false;
  }
}

const history = shouldUseHashHistory() ? createHashHistory() : createBrowserHistory();

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: AboutComponent,
});
const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/contact',
  component: ContactComponent,
});
const privacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/privacy-policy',
  component: PrivacyComponent,
});
const termsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/terms',
  component: TermsComponent,
});
const disclaimerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/disclaimer',
  component: DisclaimerComponent,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  aboutRoute,
  contactRoute,
  privacyRoute,
  termsRoute,
  disclaimerRoute,
]);

export const router = createRouter({
  routeTree,
  history,
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
  defaultNotFoundComponent: NotFoundComponent,
  scrollRestoration: true,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
