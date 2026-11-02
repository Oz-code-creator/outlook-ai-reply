// הרשמה להתראות דחיפה (דרך ה-Worker של הסנכרון). דורש סנכרון פעיל.
window.Push = (function () {
  const supported = () => "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
  const toU8 = s => { s = s.replace(/-/g, "+").replace(/_/g, "/"); const b = atob(s + "=".repeat((4 - s.length % 4) % 4)); return Uint8Array.from(b, c => c.charCodeAt(0)); };
  async function cfgCache() { const reg = await navigator.serviceWorker.ready; return { reg, cache: await caches.open("cyprus-cfg"), key: new URL("cfg-store", reg.scope).href }; }
  async function readCfg() { const { cache, key } = await cfgCache(), r = await cache.match(key); return r ? r.json() : null; }
  const need = () => { const c = window.Sync && Sync.config(); if (!c) throw new Error("קודם מפעילים סנכרון חי"); return c; };

  async function enable() {
    const c = need();
    if (!supported()) throw new Error("הדפדפן לא תומך בהתראות. ב-iPhone צריך להתקין את האפליקציה על המסך הראשי.");
    if (await Notification.requestPermission() !== "granted") throw new Error("לא אושרה הרשאת התראות");
    const { reg, cache, key } = await cfgCache();
    const vr = await fetch(c.url + "/vapid"); if (!vr.ok) throw new Error("השרת לא עונה (HTTP " + vr.status + ")");
    const { pub } = await vr.json();
    const old = await reg.pushManager.getSubscription(); if (old) { try { await old.unsubscribe(); } catch (e) { /* ignore */ } }
    const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: toU8(pub) });
    const r = await fetch(`${c.url}/subs/${c.code}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sub: sub.toJSON() }) });
    if (!r.ok) throw new Error("הרישום נכשל (HTTP " + r.status + ")");
    const { hash } = await r.json();
    await cache.put(key, new Response(JSON.stringify({ url: c.url, code: c.code, hash }), { headers: { "content-type": "application/json" } }));
    return hash;
  }
  async function disable() {
    const cfg = await readCfg(), { reg, cache, key } = await cfgCache();
    const sub = await reg.pushManager.getSubscription(); if (sub) { try { await sub.unsubscribe(); } catch (e) { /* ignore */ } }
    if (cfg) { try { await fetch(`${cfg.url}/subs/${cfg.code}/${cfg.hash}`, { method: "DELETE" }); } catch (e) { /* ignore */ } }
    await cache.delete(key);
  }
  async function test(withButtons) {
    const c = need(), r = await fetch(`${c.url}/test/${c.code}${withButtons ? "?buttons=1" : ""}`, { method: "POST" });
    if (r.status === 404) throw new Error("אין מכשיר רשום. הפעילו התראות קודם.");
    if (!r.ok) throw new Error("HTTP " + r.status);
    return (await r.json()).sent;
  }
  async function state() {
    if (!supported()) return "לא נתמך בדפדפן הזה";
    try {
      const { reg } = await cfgCache(), sub = await reg.pushManager.getSubscription(), cfg = await readCfg();
      if (Notification.permission === "denied") return "חסום בהגדרות הדפדפן";
      return sub && cfg ? "פעיל במכשיר הזה ✅ (כפתורים בהתראה: " + (Notification.maxActions || "לא ידוע") + ")" : "כבוי";
    } catch (e) { return "כבוי"; }
  }
  return { supported, enable, disable, test, state };
})();
