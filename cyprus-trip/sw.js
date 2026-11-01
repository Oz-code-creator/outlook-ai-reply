const V = "cyprus-v1", FILES = ["./", "index.html", "styles.css", "plan.js", "logic.js", "app.js", "manifest.webmanifest", "icon.svg"];
self.addEventListener("install", e => e.waitUntil(caches.open(V).then(c => c.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  // רשת קודם (כדי לקבל עדכונים), ואם אין קליטה — מהמטמון
  e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(V).then(x => x.put(e.request, c)); return r; })
    .catch(() => caches.match(e.request).then(r => r || caches.match("index.html"))));
});
