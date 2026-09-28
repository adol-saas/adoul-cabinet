const CACHE_NAME = 'adoul-cache-v3'; // bumped to v3 to flush previous SW caches
const OFFLINE_URL = '/offline.html';

const PRECACHE_ASSETS = [
  OFFLINE_URL,
  '/manifest.webmanifest',
  '/favicon.ico',
];

// 1. Install event: pre-cache offline page & core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch(() => {
        // Ignore precache failures for individual assets in dev/local
      });
    }).then(() => self.skipWaiting())
  );
});

// 2. Activate event: cleanup all older caches immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch event: handle offline-first strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Never intercept non-GET requests (e.g. POST /login, POST /register, POST /contact)
  if (request.method !== 'GET' || !request.url.startsWith('http')) {
    return;
  }

  const url = new URL(request.url);

  // NEVER intercept auth, admin, API, or dynamic user state routes
  // These MUST always be handled directly by Laravel to prevent 419 CSRF and session mismatches
  if (
    url.pathname.startsWith('/login') ||
    url.pathname.startsWith('/register') ||
    url.pathname.startsWith('/logout') ||
    url.pathname.startsWith('/super-admin') ||
    url.pathname.startsWith('/contact') ||
    url.pathname.startsWith('/verify') ||
    url.pathname.startsWith('/dashboard') ||
    url.pathname.startsWith('/clients') ||
    url.pathname.startsWith('/dossiers') ||
    url.pathname.startsWith('/appointments')
  ) {
    return;
  }

  // Never intercept Inertia SPA transitions or AJAX requests
  if (
    request.headers.get('X-Inertia') ||
    request.headers.get('X-Requested-With') === 'XMLHttpRequest'
  ) {
    return;
  }

  // Strategy A: HTML Page Navigation -> Network First with Offline Fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          const offlineFallback = await caches.match(OFFLINE_URL);
          if (offlineFallback) {
            return offlineFallback;
          }
          return new Response('<h1>غير متصل بالإنترنت (Hors ligne)</h1><p>يرجى التحقق من اتصالك بالشبكة وإعادة المحاولة.</p>', {
            status: 503,
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          });
        })
    );
    return;
  }

  // Strategy B: Vite Build Assets (/build/) -> Network First
  if (request.url.includes('/build/')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) {
            return cached;
          }
          return new Response('', { status: 404, statusText: 'Asset Not Found' });
        })
    );
    return;
  }

  // Strategy C: Other Static Assets (Fonts, Images) -> Stale-While-Revalidate
  const isStaticAsset =
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font' ||
    request.destination === 'image' ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com');

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const copy = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            }
            return networkResponse;
          })
          .catch(() => {
            return cachedResponse || new Response('', { status: 404 });
          });

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Default: pass through directly to network
  return;
});
