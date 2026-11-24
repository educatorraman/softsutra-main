import { registerSW } from 'virtual:pwa-register';
import { RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { router } from './router';

registerSW({ immediate: true });

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Missing #root mount point');

createRoot(rootElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
