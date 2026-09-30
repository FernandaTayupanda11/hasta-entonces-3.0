/* =========================================================
   SERVICE WORKER - HASTA ENTONCES 2.0 (Audio Fixed)
   ========================================================= */

const CACHE_NAME = "hasta-entonces-v8";

const ARCHIVOS = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./manifest.json",

    "./img/bilbao.png",
    "./img/ecuador.png",

    "./img/fondo1.jpeg",
    "./img/fondo2.jpeg",
    "./img/fondo3.jpeg",
    "./img/fondo4.jpeg",
    "./img/fondo5.jpeg",
    "./img/fondo6.jpeg",
    "./img/fondo7.jpeg",
    "./img/fondo8.jpeg",

    "./img/icon-192.jpeg",
    "./img/icon-512.jpeg"
];


/* =========================
   INSTALACIÓN
========================= */

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ARCHIVOS))
            .then(() => self.skipWaiting())
    );
});


/* =========================
   ACTIVACIÓN
========================= */

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(nombres => {
            return Promise.all(
                nombres
                    .filter(nombre => nombre !== CACHE_NAME)
                    .map(nombre => caches.delete(nombre))
            );
        }).then(() => self.clients.claim())
    );
});


/* =========================
   ESTRATEGIA
========================= */

self.addEventListener("fetch", event => {
    if (event.request.method !== "GET") return;

    // Si la petición es la música, pasarla directamente a la red sin tocar la caché
    if (event.request.url.includes("musica.mpeg")) {
        event.respondWith(fetch(event.request));
        return;
    }

    event.respondWith(
        caches.match(event.request).then(respuestaCache => {
            if (respuestaCache) {
                return respuestaCache;
            }
            return fetch(event.request);
        })
    );
});