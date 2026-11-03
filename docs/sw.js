const V = "cyprus-v43", CFG = "cyprus-cfg";
const FILES = ["./", "index.html", "styles.css", "plan.js", "logic.js", "sync.js", "push.js", "app.js", "manifest.webmanifest", "icon.svg", "icon-192.png", "icon-512.png", "icon-maskable-512.png", "badge-96.png"];
self.addEventListener("install", e => e.waitUntil(caches.open(V).then(c => c.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V && k !== CFG).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  // רשת קודם (כדי לקבל עדכונים), ואם אין קליטה — מהמטמון
  e.respondWith(fetch(e.request, { cache: "no-cache" }).then(r => { const c = r.clone(); caches.open(V).then(x => x.put(e.request, c)); return r; })
    .catch(() => caches.match(e.request).then(r => r || caches.match("index.html"))));
});

// ---- התראות דחיפה: ההתראה נשלפת מהשרת (outbox) ואחרי לחיצה על כפתור התשובה נשלחת לחדר ----
const iconOpts = () => ({ icon: new URL("icon-192.png", self.registration.scope).href, badge: new URL("badge-96.png", self.registration.scope).href });
async function readCfg() {
  try { const c = await caches.open(CFG), r = await c.match(new URL("cfg-store", self.registration.scope).href); return r ? await r.json() : null; }
  catch (e) { return null; }
}
self.addEventListener("push", e => e.waitUntil((async () => {
  const cfg = await readCfg();
  let list = [];
  if (cfg) { try { const r = await fetch(`${cfg.url}/outbox/${cfg.code}/${cfg.hash}`); if (r.ok) list = await r.json(); } catch (err) { /* ignore */ } }
  if (!Array.isArray(list) || !list.length) list = [{ id: "generic", title: "טיול קפריסין", body: "יש עדכון באפליקציה", actions: [] }];
  const max = (typeof Notification !== "undefined" && Notification.maxActions) || 2;
  for (const n of list) {
    const full = Array.isArray(n.actions) ? n.actions.slice(0, 3) : [];
    const twoStep = !!n.itemId && full.length > max; // המכשיר מציג פחות כפתורים: "לא הספקנו" פותח התראת המשך
    const actions = twoStep ? [full[0], { action: "later", title: "❌ לא הספקנו" }] : full.slice(0, max);
    await self.registration.showNotification(String(n.title || "טיול קפריסין"), {
      body: String(n.body || ""), tag: String(n.id || "n"), lang: "he", dir: "rtl", requireInteraction: true,
      data: { itemId: n.itemId || null, name: n.name || null, url: n.url || null }, actions, ...iconOpts()
    });
  }
})()));
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const itemId = e.notification.data && e.notification.data.itemId, act = e.action;
  const status = { done: "done", skip: "skipped", drop: "dropped" }[act];
  e.waitUntil((async () => {
    const url = e.notification.data && e.notification.data.url;
    if (act === "nav" && url) return self.clients.openWindow(url);
    if (itemId && act === "later") { // התראת המשך: מה לעשות עם מה שלא הספקנו
      const name = (e.notification.data && e.notification.data.name) || "הפעילות";
      return self.registration.showNotification("לא הספקתם: " + name, {
        body: "מה לעשות איתה?", tag: "fu-" + itemId, lang: "he", dir: "rtl", requireInteraction: true,
        data: { itemId, name }, actions: [{ action: "skip", title: "↪ הצע העברה" }, { action: "drop", title: "✖ ויתרנו" }], ...iconOpts()
      });
    }
    if (itemId === "__test__" && status) { // בדיקה: לא כותבים כלום לחדר
      const label = { done: "✅ הספקנו", skipped: "⏭ דילגנו / ↪ הצע העברה", dropped: "✖ ויתרנו" }[status];
      return self.registration.showNotification("בדיקה: נבחר " + label, { body: "הכפתורים עובדים. שום דבר לא שונה בתוכנית.", tag: "test-result", lang: "he", dir: "rtl", ...iconOpts() });
    }
    if (itemId && status) {
      const cfg = await readCfg();
      if (cfg) {
        try { await fetch(`${cfg.url}/rooms/${cfg.code}.json`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ ["status/" + itemId]: status }) }); } catch (err) { /* ignore */ }
        (await self.clients.matchAll({ type: "window" })).forEach(c => c.postMessage({ type: "status-changed" }));
        return; // סימון בוצע: בלי לפתוח את האפליקציה. הצעת ההעברה אחרי "דילגנו" תוצג בפתיחה הבאה
      }
    }
    const cs = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    if (cs.length) return cs[0].focus();
    return self.clients.openWindow("./index.html");
  })());
});
