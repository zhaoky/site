import fg from 'fast-glob';
import { resolve } from 'pathe';
import type { ManifestOptions, VitePWAOptions } from 'vite-plugin-pwa';
import * as c from './const';
import manifest from './manifest.json';

/**
 * Vite Plugin PWA uses Workbox  library to build the service worker
 * can find more information on Workbox section.
 * @see https://vite-plugin-pwa.netlify.app/
 */
export const pwa: Partial<VitePWAOptions> = {
  outDir: '.vitepress/dist',
  registerType: 'autoUpdate',
  // include all static assets under public/
  includeAssets: fg.sync('**/*.{png,svg,gif,ico,txt}', {
    cwd: resolve(__dirname, '../../public'),
  }),
  manifest: manifest as Partial<ManifestOptions>,
  workbox: {
    navigateFallbackDenylist: [/^\/new$/],
    globPatterns: ['**/*.{js,css,webp,png,svg,gif,ico,woff2}'],
    navigateFallback: null,
    runtimeCaching: [
      {
        urlPattern: c.googleFontRegex,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-font-style-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      {
        urlPattern: c.googleStaticFontRegex,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      {
        urlPattern: c.jsdelivrCDNRegex,
        handler: 'CacheFirst',
        options: {
          cacheName: 'jsdelivr-cdn-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      {
        urlPattern: c.githubSourceContentRegex,
        handler: 'CacheFirst',
        options: {
          cacheName: 'githubusercontent-images-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
    ],
  },
};
