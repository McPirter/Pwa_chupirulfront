self.addEventListener('install', event => {
    caches.open("appShell_v1.1")
    .then(cache => {
        cache.addAll([
            "/index.html",
            "/src/main.jsx",
            "/src/App.css",
            "/vite.svg",
            "/src/assets/react.svg",
        ]);
    });
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    // Elimina las caches antiguas explícitamente
    caches.delete("appShell_v1.0");
    caches.delete("dynamic_v0.1");
});

self.addEventListener('fetch', event => {
    if (event.request.method === "GET") {
        event.respondWith(
            caches.match(event.request)
            .then(cacheResp => {
                if (cacheResp) {
                    return cacheResp; // devuelve cache si existe
                }
                return fetch(event.request)
                .then(networkResp => {
                    caches.open("dynamic_v1.1")
                    .then(cache => {
                        cache.put(event.request, networkResp.clone());
                    });
                    return networkResp.clone();
                })
                .catch(() => {
                    return caches.match("/index.html"); // fallback offline
                });
            })
        );
    }
});

/*self.addEventListener('sync', event => {});
self.addEventListener('push', event => {});*/
