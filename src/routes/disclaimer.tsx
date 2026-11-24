import { createRoute } from '@tanstack/react-router';
import { LegalPage } from '../pages/LegalPage';
import { Route as rootRoute } from './root';

export function DisclaimerRouteComponent() {
  return <LegalPage documentKey="disclaimer" />;
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/disclaimer',
  component: DisclaimerRouteComponent,
});
