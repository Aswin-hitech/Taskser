const CACHE_NAME = "taskser-app-v1";
const DATA_CACHE_NAME = "taskser-data-v1";

const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/manifest.json",
    "/favicon.ico",
    "/logo192.png",
    "/logo512.png",
    "/static/js/bundle.js", // Create React App output
];

// Install Event
self.addEventListener("install", (evt) => {
    evt.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("Pre-caching offline pages");
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Activate Event
self.addEventListener("activate", (evt) => {
    evt.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(
                keyList.map((key) => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log("Removing old cache", key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch Event
self.addEventListener("fetch", (evt) => {
    // 1. DONT intercept or cache API calls to /api/auth
    if (evt.request.url.includes("/api/auth")) {
        // Return fetch with credentials: "include" to ensure cookies are sent
        evt.respondWith(fetch(evt.request, { credentials: "include" }));
        return;
    }

    // 2. Handle other API requests (Network Only for data to avoid stale user data)
    if (evt.request.url.includes("/api/")) {
        evt.respondWith(fetch(evt.request, { credentials: "include" }));
        return;
    }

    // 3. Handle App Shell (Stale-while-revalidate for immediate load)
    evt.respondWith(
        caches.match(evt.request).then((response) => {
            return response || fetch(evt.request);
        })
    );
});

// Background Sync (Simple placeholder)
self.addEventListener('sync', function (event) {
    if (event.tag == 'myFirstSync') {
        event.waitUntil(doSomeStuff());
    }
});

function doSomeStuff() {
    // Placeholder for background sync logic
    console.log("Background sync triggered");
}
