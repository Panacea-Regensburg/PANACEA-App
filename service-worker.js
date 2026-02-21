const CACHE_VERSION = "v14"; // aumenta quando cambi files importanti
const CACHE_NAME = `panacea-cache-${CACHE_VERSION}`;

// Pagine/asset minimi da pre-cacheare (non bloccare le pagine IT)
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./indexIT.html",
  "./manifest.webmanifest",
  "./manifest-it.webmanifest"
];

// Install: crea cache nuova
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
});

// Activate: elimina cache vecchie
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith("panacea-cache-") && k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch strategy:
// - HTML: network-first (così vedi subito traduzioni/aggiornamenti)
// - altri asset: cache-first (veloce)
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Solo richieste same-origin
  if (url.origin !== self.location.origin) return;

  // HTML = sempre aggiornato
  const isHTML =
    req.mode === "navigate" ||
    (req.headers.get("accept") || "").includes("text/html") ||
    url.pathname.endsWith(".html");

  if (isHTML) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match("./index.html")))
    );
    return;
  }

  // Asset = cache-first
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        return res;
      });
    })
  );
});
