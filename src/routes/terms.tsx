import { createRoute } from '@tanstack/react-router';
import { LegalPage } from '../pages/LegalPage';
import { Route as rootRoute } from './root';

export function TermsRouteComponent() {
  return <LegalPage documentKey="terms" />;
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/terms',
  component: TermsRouteComponent,
});
