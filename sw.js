/**
 * MOHAMED KHAMIS — PWA Service Worker
 * Statically caches public app shell.
 * Explicitly ignores /admin, Netlify Functions, and external auth endpoints.
 */

const CACHE_NAME = 'mk-cache-v3';
const RELATIVE_ASSETS = [
  './',
  './index.html',
  './about.html',
  './services.html',
  './projects.html',
  './request.html',
  './contact.html',
  './privacy.html',
  './terms.html',
  './404.html',
  './assets/css/style.css',
  './assets/css/responsive.css',
  './assets/css/animations.css',
  './assets/js/config.js',
  './assets/js/i18n.js',
  './assets/js/theme.js',
  './assets/js/services-data.js',
  './assets/js/projects-data.js',
  './assets/js/app.js',
  './assets/js/forms.js',
  './assets/js/pwa.js',
  './assets/images/logo-mk.svg',
  './assets/images/service-android.svg',
  './assets/images/mohamed-khamis.jpg',
  './assets/images/project-moja.svg',
  './assets/images/project-qesma.svg',
  './assets/images/project-mizoma.svg',
  './assets/images/project-manasati.svg',
  './assets/images/project-zoma.svg',
  './assets/icons/icon-192.svg',
  './assets/icons/icon-512.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      const scopeUrl = new URL(self.registration.scope);
      const urlsToCache = RELATIVE_ASSETS.map((asset) => new URL(asset, scopeUrl).href);
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Security: NEVER cache /admin, Netlify Functions, or non-GET requests
  if (
    event.request.method !== 'GET' ||
    url.pathname.includes('/admin') ||
    url.pathname.includes('/.netlify') ||
    url.hostname.includes('firebaseio.com') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('identitytoolkit.googleapis.com')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse);
            });
          }
        }).catch(() => {});
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});
