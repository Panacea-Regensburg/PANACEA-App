const CACHE_VERSION = "v14"; // aumenta quando fai modifiche importanti
const CACHE_NAME = `panacea-cache-${CACHE_VERSION}`;

// Metti qui TUTTI i file principali (DE + IT) che vuoi sempre disponibili
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./indexIT.html",
  "./daily-reset.html",
  "./daily-resetIT.html",
  "./lifestyle.html",
  "./lifestyleIT.html",      // se il file si chiama davvero così
  "./wissen.html",
  "./wissenIT.html",
  "./mitglieder.html",
  "./mitgliederIT.html",
  "./uebungen.html",
  "./uebungenIT.html",
  "./manifest.webmanifest",
  "./manifest-it.webmanifest",
  "./service-worker.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith("panacea-cache-") && k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Strategia semplice: HTML sempre dal network (così traduzioni e testi si aggiornano),
// fallback su cache se offline. Altri file: cache-first.
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Solo GET
  if (req.method !== "GET") return;

  const accept = req.headers.get("accept") || "";
  const isHTML = accept.includes("text/html");

  if (isHTML) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});
