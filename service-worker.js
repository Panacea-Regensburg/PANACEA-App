const CACHE_VERSION = "v42";
const CACHE_NAME = `panacea-cache-${CACHE_VERSION}`;

const APP_SHELL = [
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
  "./uebungen.html",
  "./uebungenIT.html",
  "./uebungen-premium.html",
  "./uebungen-premiumIT.html",
  "./kurse.html",
  "./kurseIT.html",

  "./manifest.webmanifest",
  "./manifest-it.webmanifest"
];

const DATA_FILES = [
  "./data/wissen.json",
  "./data/wissenIT.json",
  "./data/wissen-premium.json",
  "./data/wissen-premiumIT.json",
  "./data/resetPremium.json",
  "./data/resetPremium_member.json"
];

const SCRIPT_FILES = [
  "./js/resetLogic.js"
];

const ICON_FILES = [
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
  "./icons/21.png",

  "./icons/1c.png",
  "./icons/2c.png",
  "./icons/3c.png",
  "./icons/4c.png"
];

const ASSETS = [
  ...APP_SHELL,
  ...DATA_FILES,
  ...SCRIPT_FILES,
  ...ICON_FILES
];

function isSuccessfulResponse(response) {
  return !!response && response.ok;
}

function isImageRequest(pathname) {
  return (
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg") ||
    pathname.endsWith(".webp") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".gif") ||
    pathname.endsWith(".ico")
  );
}
function isStaticAsset(pathname) {
  return (
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg") ||
    pathname.endsWith(".webp") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".gif") ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".css") ||
    pathname.endsWith(".js") ||
    pathname.endsWith(".webmanifest")
  );
}

function isJsonRequest(pathname) {
  return pathname.endsWith(".json");
}

function isItalianPath(pathname) {
  return /IT\.html$/i.test(pathname) || pathname.includes("indexIT.html");
}

async function addAssetsIndividually(cache, assets) {
  for (const asset of assets) {
    try {
      await cache.add(asset);
    } catch (error) {
      console.warn("[SW] Precache failed:", asset, error);
    }
  }
}

async function putInCache(request, response) {
  if (!isSuccessfulResponse(response)) return;
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response.clone());
}

async function htmlNetworkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    await putInCache(request, networkResponse);
    return networkResponse;
  } catch (error) {
    const cachedPage = await caches.match(request);
    if (cachedPage) return cachedPage;

    const url = new URL(request.url);
    if (isItalianPath(url.pathname)) {
      const fallbackIT = await caches.match("./indexIT.html");
      if (fallbackIT) return fallbackIT;
    }

    const fallbackDE = await caches.match("./index.html");
    if (fallbackDE) return fallbackDE;

    return Response.error();
  }
}

async function jsonNetworkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    await putInCache(request, networkResponse);
    return networkResponse;
  } catch (error) {
    const cached = await caches.match(request);
    return cached || Response.error();
  }
}

async function staticCacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const networkResponse = await fetch(request);
    await putInCache(request, networkResponse);
    return networkResponse;
  } catch (error) {
    const url = new URL(request.url);

    if (isImageRequest(url.pathname)) {
      const fallbackImage = await caches.match("./icons/sfondo.png");
      if (fallbackImage) return fallbackImage;
    }

    return Response.error();
  }
}

async function genericCacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const networkResponse = await fetch(request);
    await putInCache(request, networkResponse);
    return networkResponse;
  } catch (error) {
    return Response.error();
  }
}
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await addAssetsIndividually(cache, ASSETS);
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();

      await Promise.all(
        keys.map((key) => {
          if (key.startsWith("panacea-cache-") && key !== CACHE_NAME) {
            return caches.delete(key);
          }
          return Promise.resolve();
        })
      );

      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Gestisci solo richieste same-origin
  if (url.origin !== self.location.origin) return;

  const pathname = url.pathname;
  const acceptHeader = request.headers.get("accept") || "";

  const isHtmlRequest =
    request.mode === "navigate" || acceptHeader.includes("text/html");

  if (isHtmlRequest) {
    event.respondWith(htmlNetworkFirst(request));
    return;
  }

  if (isJsonRequest(pathname)) {
    event.respondWith(jsonNetworkFirst(request));
    return;
  }

  if (isStaticAsset(pathname)) {
    event.respondWith(staticCacheFirst(request));
    return;
  }

  event.respondWith(genericCacheFirst(request));
});
