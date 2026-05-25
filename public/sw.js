/*
 * OHMS service worker — dependency-free PWA shell + runtime caching.
 *
 * Strategy summary:
 *   - Navigations (mode === 'navigate'): network-first → cache → /offline.
 *   - Same-origin static assets (_next/static, images, icons, fonts):
 *     stale-while-revalidate (serve cache fast, refresh in background).
 *   - Cross-origin assets (product CDN, _next/image): cache-first with a cap.
 *   - POST / non-GET / /api/ requests: always network, never cached.
 *
 * Bump CACHE_VERSION whenever the precached shell changes so old caches are
 * pruned on activate.
 */

const CACHE_VERSION = "ohms-v1";
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

// Max number of entries kept in the cross-origin runtime cache.
const RUNTIME_MAX_ENTRIES = 60;

// App shell precached on install.
const SHELL_ASSETS = [
  "/",
  "/offline",
  "/manifest.webmanifest",
  "/logo.svg",
  "/icons/icon-192.png",
];

const OFFLINE_URL = "/offline";

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      // Cache individually so one missing asset doesn't fail the whole install.
      await Promise.all(
        SHELL_ASSETS.map(async (url) => {
          try {
            await cache.add(new Request(url, { cache: "reload" }));
          } catch (err) {
            // Non-fatal: log and continue so the SW still installs.
            console.warn(`[sw] failed to precache ${url}:`, err);
          }
        })
      );
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => !key.startsWith(CACHE_VERSION))
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET. Never intercept POST / PUT / API calls etc.
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Never cache API routes — always hit the network.
  if (url.pathname.startsWith("/api/")) return;

  // App navigations: network-first with offline fallback.
  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request));
    return;
  }

  const isSameOrigin = url.origin === self.location.origin;

  if (isSameOrigin) {
    if (isStaticAsset(url)) {
      event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
    }
    return;
  }

  // Cross-origin (product image CDN, _next/image, fonts): cache-first w/ cap.
  if (isCacheableCrossOrigin(url)) {
    event.respondWith(cacheFirstCapped(request, RUNTIME_CACHE, RUNTIME_MAX_ENTRIES));
  }
});

function isStaticAsset(url) {
  if (url.pathname.startsWith("/_next/static")) return true;
  if (url.pathname.startsWith("/icons/")) return true;
  return /\.(?:css|js|png|jpg|jpeg|webp|avif|gif|svg|ico|woff2?|ttf|otf)$/i.test(
    url.pathname
  );
}

function isCacheableCrossOrigin(url) {
  if (url.hostname === "cdn.fcglcdn.com") return true;
  if (url.pathname.startsWith("/_next/image")) return true;
  return /\.(?:png|jpg|jpeg|webp|avif|gif|svg|woff2?|ttf|otf)$/i.test(url.pathname);
}

async function handleNavigation(request) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const networkResponse = await fetch(request);
    // Stash a fresh copy of successful navigations for offline reuse.
    if (networkResponse && networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    const offline = await cache.match(OFFLINE_URL);
    if (offline) return offline;
    return new Response("You are offline.", {
      status: 503,
      statusText: "Service Unavailable",
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const networkFetch = fetch(request)
    .then((response) => {
      if (response && response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => undefined);

  return cached || (await networkFetch) || fetchOrError(request);
}

async function cacheFirstCapped(request, cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    // Only cache successful, cacheable responses (opaque ok for CDN images).
    if (response && (response.ok || response.type === "opaque")) {
      await cache.put(request, response.clone());
      await trimCache(cacheName, maxEntries);
    }
    return response;
  } catch (err) {
    if (cached) return cached;
    throw err;
  }
}

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;
  // Evict oldest entries (FIFO) until under the cap.
  const excess = keys.length - maxEntries;
  for (let i = 0; i < excess; i += 1) {
    await cache.delete(keys[i]);
  }
}

async function fetchOrError(request) {
  try {
    return await fetch(request);
  } catch {
    return new Response("", { status: 504, statusText: "Gateway Timeout" });
  }
}
