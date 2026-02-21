const CACHE_VERSION = "v14";
const CACHE_NAME = `panacea-cache-${CACHE_VERSION}`;

const ASSETS = [
  "./",
  "./index.html",
  "./indexIT.html",
  "./daily-reset.html",
  "./daily-resetIT.html",
  "./lifestyle.html",
  "./lifestyleIT.html",
  "./mitglieder.html",
  "./mitgliederIT.html",
  "./manifest.webmanifest",
  "./manifest-it.webmanifest",
  "./service-worker.js",

  "./data/wissen.json",
  "./data/resetPremium.json",
  "./data/resetPremium_member.json",

  "./js/resetLogic.js",

  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/sfondo.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k.startsWith("panacea-cache-") && k !== CACHE_NAME) ? caches.delete(k) : null))
    )
  );
  self.clients.claim();
});

// Network-first per HTML, cache-first per il resto (semplice e stabile)
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== "GET") return;

  const isHTML = req.headers.get("accept")?.includes("text/html");

  if (isHTML) {
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req).then((r) => r || caches.match("./")))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE_NAME).then((c) => c.put(req, copy));
      return res;
    }))
  );
});
