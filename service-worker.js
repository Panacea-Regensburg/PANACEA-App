const CACHE_VERSION = "v25";
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
  "./wissen.html",
  "./wissenIT.html",

  "./manifest.webmanifest",
  "./manifest-it.webmanifest",
  "./service-worker.js",

  "./data/wissen.json",
  "./data/wissenIT.json",
  "./data/wissen-premium.json",
  "./data/wissen-premiumIT.json",
  "./data/resetPremium.json",
  "./data/resetPremium_member.json",

  "./js/resetLogic.js",

  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/sfondo.png",

  "./icons/1.png",
  "./icons/2.png",
  "./icons/3.png",
  "./icons/4.png",
  "./icons/5.png",
  "./icons/6.png",
  "./icons/7.png",
  "./icons/8.png",
  "./icons/9.png",
  "./icons/10.png",
  "./icons/11.png",
  "./icons/12.png",
  "./icons/13.png",
  "./icons/14.png",
  "./icons/15.png",
  "./icons/16.png",
  "./icons/17.png",
  "./icons/18.png",
  "./icons/19.png",
  "./icons/20.png",
  "./icons/21.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const asset of ASSETS) {
        try {
          await cache.add(asset);
        } catch (error) {
          console.warn("Cache add failed:", asset, error);
        }
      }
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key.startsWith("panacea-cache-") && key !== CACHE_NAME) {
            return caches.delete(key);
          }
          return null;
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  if (req.method !== "GET") return;

  const url = new URL(req.url);
  const acceptHeader = req.headers.get("accept") || "";

  const isHTML =
    req.mode === "navigate" || acceptHeader.includes("text/html");

  const isJSON = url.pathname.endsWith(".json");

  const isStaticAsset =
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".jpeg") ||
    url.pathname.endsWith(".webp") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".webmanifest") ||
    url.pathname.endsWith(".ico");

  // 1) HTML = network first
  if (isHTML) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(async () => {
          const cached = await caches.match(req);
          if (cached) return cached;

          if (url.pathname.includes("IT")) {
            return caches.match("./indexIT.html");
          }
          return caches.match("./index.html");
        })
    );
    return;
  }

  // 2) JSON = network first con fallback cache
  if (isJSON) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // 3) Static assets = cache first
  if (isStaticAsset) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;

        return fetch(req)
          .then((res) => {
            if (res && res.status === 200) {
              const copy = res.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
            }
            return res;
          })
          .catch(() => caches.match("./icons/sfondo.png"));
      })
    );
    return;
  }

  // 4) Fallback generale = cache first, poi network
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => null);
    })
  );
});
