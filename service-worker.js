const CACHE_VERSION = "v13";
const CACHE_NAME = `panacea-cache-${CACHE_VERSION}`;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("panacea-v1").then((cache) =>
      cache.addAll(["./", "./index.html", "./manifest.webmanifest"])
    )
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(caches.match(event.request).then((r) => r || fetch(event.request)));
});
