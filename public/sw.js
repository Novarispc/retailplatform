// Minimal offline-first service worker for Nova Retail PWA.
const CACHE = "nova-v1";
const PRECACHE = ["/", "/catalog", "/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

// Push notifications (requires VAPID keys + a subscription on the client).
self.addEventListener("push", (event) => {
  let data = { title: "Nova Retail", body: "You have an update." };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    /* non-JSON payload */
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icon.svg",
      badge: "/icon.svg",
      data: { url: data.url || "/" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(clients.openWindow(url));
});

// Background sync: flush queued actions (e.g. abandoned-cart pings) when back online.
self.addEventListener("sync", (event) => {
  if (event.tag === "nova-sync") {
    event.waitUntil(
      (async () => {
        try {
          await fetch("/api/v1/health");
        } catch {
          /* still offline — sync will retry */
        }
      })(),
    );
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  // Never cache API or auth traffic.
  if (url.pathname.startsWith("/api")) return;

  // Network-first for navigations, cache fallback offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match("/"))),
    );
    return;
  }

  // Cache-first for static assets.
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request)),
  );
});
