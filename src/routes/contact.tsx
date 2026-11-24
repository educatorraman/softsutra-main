import { createRoute } from '@tanstack/react-router';
import { ContactPage } from '../pages/ContactPage';
import { Route as rootRoute } from './root';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/contact',
  component: ContactPage,
});
