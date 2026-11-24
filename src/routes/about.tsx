import { createRoute } from '@tanstack/react-router';
import { LegalPage } from '../pages/LegalPage';
import { Route as rootRoute } from './root';

export function AboutRouteComponent() {
  return <LegalPage documentKey="about" />;
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: AboutRouteComponent,
});
