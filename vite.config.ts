import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

/** Resolves {{ROOT_DOMAIN}} in crawler files after Vite copies the public directory. */
function crawlerDomain(rootDomain: string): Plugin {
  let outDir = 'dist';
  return {
    name: 'apptray-crawler-domain',
    apply: 'build',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      for (const file of ['robots.txt', 'sitemap.xml']) {
        const target = path.join(outDir, file);
        if (!existsSync(target)) continue;
        const source = readFileSync(target, 'utf8');
        writeFileSync(target, source.replaceAll('{{ROOT_DOMAIN}}', rootDomain));
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const rootDomain =
    (env.VITE_ROOT_DOMAIN ?? '')
      .trim()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/.*$/, '')
      .replace(/:\d+$/, '') || 'apptray.in';

  return {
    base: './',
    plugins: [
      crawlerDomain(rootDomain),
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: null,
        includeAssets: ['favicon.svg', 'icons/*.png'],
        manifest: {
          id: './',
          name: 'AppTray Labs',
          short_name: 'AppTray Labs',
          description:
            'Fast, private, offline-ready utilities for exams, finance, network diagnostics, music and secure document transfer.',
          lang: 'en',
          dir: 'ltr',
          start_url: './',
          scope: './',
          display: 'standalone',
          orientation: 'portrait-primary',
          background_color: '#f8fafc',
          theme_color: '#4f46e5',
          icons: [
            { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            {
              src: 'icons/icon-maskable-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable',
            },
            {
              src: 'icons/icon-maskable-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
          navigateFallback: 'index.html',
          cleanupOutdatedCaches: true,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/pagead2\.googlesyndication\.com\//i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'apptray-ad-scripts',
                expiration: { maxEntries: 8, maxAgeSeconds: 86400 },
              },
            },
          ],
        },
      }),
    ],
    build: {
      target: 'es2022',
      cssMinify: 'lightningcss',
      sourcemap: false,
      chunkSizeWarningLimit: 600,
    },
    server: { host: true },
  };
});
