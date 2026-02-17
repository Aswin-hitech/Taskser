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
    // 1. DONT cache API calls to /api/auth (except loading check maybe, but safe to exclude)
    if (evt.request.url.includes("/api/auth")) {
        return; // Administer network only
    }

    // 2. Handle API requests (Network First, then Cache)
    if (evt.request.url.includes("/api/")) {
        evt.respondWith(
            caches.open(DATA_CACHE_NAME).then((cache) => {
                return fetch(evt.request)
                    .then((response) => {
                        // Clone and stash
                        if (response.status === 200) {
                            cache.put(evt.request.url, response.clone());
                        }
                        return response;
                    })
                    .catch((err) => {
                        // Network failed, try cache
                        return cache.match(evt.request);
                    });
            })
        );
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
