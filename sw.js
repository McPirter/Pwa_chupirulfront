self.addEventListener('install', event => {
    caches.open("appShell_v2")
    .then(cache => {
        cache.addAll([
            "/",               // raíz
            "/index.html",     // punto de entrada
            "/neko.png",   // icono 192px
            "/neko-512.png"    // icono 512px
        ]);
    });
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    // Elimina las caches antiguas explícitamente
    caches.delete("appShell_v1.1");
    caches.delete("dynamic_v1.1");
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
                    caches.open("dynamic_v2")
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
