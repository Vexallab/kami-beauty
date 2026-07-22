// Service Worker сайта

const CACHE_NAME = "kami-beauty-v7";

const PRECACHE_URLS = [
  "index.html",
  "prices.html",
  "portfolio.html",
  "reviews.html",
  "contacts.html",
  "privacy.html",
  "404.html",
  "manifest.json",
  "apple-touch-icon.png",
  "assets/icons/icon-192.png",
  "assets/icons/icon-512.png",
  "css/style.css",
  "css/pill-nav.css",
  "css/orbit-images.css",
  "css/scroll-reveal.css",
  "css/vendor/lenis.css",
  "js/main.js",
  "js/animations.js",
  "js/pill-nav.js",
  "js/masonry.js",
  "js/orbit-images.js",
  "js/scroll-reveal.js",
  "js/error-search.js",
  "js/calculator.js",
  "js/smooth-scroll.js",
  "js/vendor/gsap.min.js",
  "js/vendor/ScrollTrigger.min.js",
  "js/vendor/lenis.min.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  // Сначала сеть
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)));
          }
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("404.html")))
    );
    return;
  }

  // Сначала кэш
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)));
          }
          return response;
        })
        .catch(() => cached);
    })
  );
});
