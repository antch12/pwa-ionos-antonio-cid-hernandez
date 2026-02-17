/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;
const CACHE_VERSION = 'pwa-v1';
const CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

// Evento Install: Precachear recursos críticos
self.addEventListener('install', (event: ExtendableEvent) => {
  console.log('Service Worker: Installing...');

  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      console.log('Service Worker: Caching app shell');
      return cache.addAll(CACHE_URLS).catch((error) => {
        console.warn('Service Worker: Failed to cache some resources', error);
      });
    })
  );

  // Activar inmediatamente sin esperar otras pestañas
  (self as unknown as ServiceWorkerGlobalScope).skipWaiting();
});

// Evento Activate: Limpiar cachés antiguos
self.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('Service Worker: Activating...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_VERSION) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Tomar control de clientes inmediatamente
  (self as unknown as ServiceWorkerGlobalScope).clients.claim();
});

// Evento Fetch: Estrategia de caché según tipo de recurso
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar solicitudes no-GET
  if (request.method !== 'GET') {
    return;
  }

  // Ignorar solicitudes a dominios externos
  if (url.origin !== self.location.origin) {
    return;
  }

  // Estrategia: Stale-While-Revalidate para HTML
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request).then((response) => {
          // No cachear si no es una respuesta exitosa
          if (request.method === 'GET' && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_VERSION).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        });

        // Devolver caché si existe, sino esperar la red
        return cachedResponse || fetchPromise;
      }).catch(() => {
        // Si todo falla, devolver página offline
        console.warn('Service Worker: Failed to fetch', url.pathname);
        // Aquí podrías devolver una página offline.html si existe
      }) as Promise<Response>
    );
    return;
  }

  // Estrategia: Cache First para assets (CSS, JS, imágenes, fuentes)
  if (
    request.url.match(/\.(js|css|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot)$/i)
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request).then((response) => {
          // Solo cachear respuestas exitosas
          if (response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_VERSION).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        });
      }).catch(() => {
        console.warn('Service Worker: Failed to fetch asset', url.pathname);
        // Devolver un asset por defecto si está disponible
      }) as Promise<Response>
    );
    return;
  }

  // Estrategia: Network First para APIs y contenido dinámico
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cachear respuestas exitosas
        if (response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_VERSION).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Si la red falla, intentar caché
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Si nada funciona, devolver error
          console.warn('Service Worker: Request failed and no cache available', url.pathname);
          throw new Error('Network request failed');
        });
      }) as Promise<Response>
  );
});

// Mensaje desde el cliente para limpiar caché
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    (self as unknown as ServiceWorkerGlobalScope).skipWaiting();
  }
});

export {};
