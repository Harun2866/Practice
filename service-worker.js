
const CACHE_NAME = "harun-namaz-v1";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./manifest.json",
    "./icon.svg"
];

// Install
self.addEventListener("install", event => {

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(FILES_TO_CACHE))
    );

    self.skipWaiting();
});

// Activate
self.addEventListener("activate", event => {

    event.waitUntil(
        caches.keys().then(keys => {

            return Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );

        })
    );

    self.clients.claim();
});

// Fetch
self.addEventListener("fetch", event => {

    if (event.request.method !== "GET") return;

    event.respondWith(
        fetch(event.request)
            .then(response => {

                if (response && response.ok) {
                    let copy = response.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => cache.put(event.request, copy));
                }

                return response;
            })
            .catch(() => {

                return caches.match(event.request)
                    .then(response => {

                        return response || caches.match("./index.html");

                    });

            })
    );

});
