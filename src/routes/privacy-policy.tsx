import { createRoute } from '@tanstack/react-router';
import { LegalPage } from '../pages/LegalPage';
import { Route as rootRoute } from './root';

export function PrivacyRouteComponent() {
  return <LegalPage documentKey="privacy" />;
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/privacy-policy',
  component: PrivacyRouteComponent,
});
