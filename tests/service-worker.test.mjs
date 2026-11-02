import vm from "node:vm"; import fs from "node:fs"; import assert from "node:assert/strict";
const code = fs.readFileSync("/home/user/outlook-ai-reply/docs/sw.js", "utf8");
function make({ cfg, outbox, max = 3, failPost = false }) {
  const handlers = {}, shown = [], fetches = [], posted = []; let opened = 0, focused = 0;
  const stores = new Map(); const SCOPE = "https://x.github.io/app/";
  const cacheOf = n => { if (!stores.has(n)) stores.set(n, new Map()); const m = stores.get(n); return { async match(u) { const v = m.get(u); return v ? new Response(v) : undefined; }, async put(u, r) { m.set(u, await r.text()); }, async delete(u) { return m.delete(u); }, async addAll() {} }; };
  if (cfg) stores.set("cyprus-cfg", new Map([[SCOPE + "cfg-store", JSON.stringify(cfg)]]));
  const sandbox = {
    self: { addEventListener: (t, f) => { handlers[t] = f; }, registration: { scope: SCOPE, showNotification: async (t, o) => { shown.push({ t, o }); } },
      clients: { matchAll: async () => [{ postMessage: m => posted.push(m), focus: () => { focused++; } }], openWindow: async () => { opened++; }, claim: async () => {} }, skipWaiting() {} },
    caches: { open: async n => cacheOf(n), keys: async () => [...stores.keys()], match: async () => undefined },
    fetch: async (u, init) => { fetches.push({ u, init }); if (failPost && init && init.method === "POST") return new Response("x", { status: 500 }); if (String(u).includes("/outbox/")) return new Response(JSON.stringify(outbox || []), { status: 200 }); return new Response("{}", { status: 200 }); },
    Notification: { maxActions: max }, location: { origin: "https://x.github.io" }, URL, Response, Request, Promise, JSON, Array, String
  };
  vm.runInNewContext(code, sandbox);
  const ev = extra => { const p = []; return { ...extra, waitUntil: x => p.push(x), done: () => Promise.all(p) }; };
  return { handlers, shown, fetches, posted, ev, opened: () => opened, focused: () => focused };
}
const cfg = { url: "https://w.example.workers.dev", code: "abcdefghij1234567890", hash: "0123456789abcdef" };
const notif = { id: "n1", itemId: "d2-kolossi", title: "הספקתם? טירת קולוסי", body: "מה קרה?", actions: [{ action: "done", title: "✅ הספקנו" }, { action: "skip", title: "⏭ דילגנו" }, { action: "drop", title: "✖ ויתרנו" }] };
// push עם outbox
let t = make({ cfg, outbox: [notif] }); let e = t.ev({}); t.handlers.push(e); await e.done();
assert.equal(t.shown.length, 1); assert.equal(t.shown[0].o.actions.length, 3); assert.equal(t.shown[0].o.data.itemId, "d2-kolossi"); assert.equal(t.shown[0].o.dir, "rtl");
assert.ok(t.fetches[0].u.endsWith("/outbox/abcdefghij1234567890/0123456789abcdef")); console.log("push → notification with 3 actions ✔");
// push בלי cfg → כללית (חובה להציג משהו)
t = make({ cfg: null }); e = t.ev({}); t.handlers.push(e); await e.done(); assert.equal(t.shown.length, 1); assert.equal(t.shown[0].t, "טיול קפריסין"); console.log("push without cfg → generic notification ✔");
// לחיצות
for (const [act, st] of [["done", "done"], ["skip", "skipped"], ["drop", "dropped"]]) {
  t = make({ cfg }); let closed = false; e = t.ev({ action: act, notification: { close() { closed = true; }, data: { itemId: "d2-kolossi" } } }); t.handlers.notificationclick(e); await e.done();
  const p = t.fetches.find(f => f.init && f.init.method === "PATCH"); assert.ok(p, act); assert.ok(p.u.endsWith("/rooms/abcdefghij1234567890.json"));
  assert.deepEqual(JSON.parse(p.init.body), { "status/d2-kolossi": st }); assert.ok(closed); assert.equal(t.posted[0].type, "status-changed"); assert.equal(t.focused() + t.opened(), 0);
}
console.log("buttons → PATCH done/skipped/dropped, no window opened ✔");
// לחיצה על גוף ההתראה → פותח/ממקד
t = make({ cfg }); e = t.ev({ action: "", notification: { close() {}, data: { itemId: "d2-kolossi" } } }); t.handlers.notificationclick(e); await e.done();
assert.equal(t.fetches.filter(f => f.init && f.init.method === "PATCH").length, 0); assert.equal(t.focused(), 1); console.log("tap on body → focuses app ✔");
// מכשיר עם 2 כפתורים: הספקנו / לא הספקנו → התראת המשך
t = make({ cfg, outbox: [{ ...notif, name: "טירת קולוסי" }], max: 2 }); e = t.ev({}); t.handlers.push(e); await e.done();
assert.equal(JSON.stringify(t.shown[0].o.actions.map(a => a.action)), JSON.stringify(["done", "later"])); console.log("max=2 → [done, later] ✔");
e = t.ev({ action: "later", notification: { close() {}, data: { itemId: "d2-kolossi", name: "טירת קולוסי" } } }); t.handlers.notificationclick(e); await e.done();
assert.equal(t.fetches.filter(f => f.init && f.init.method === "PATCH").length, 0); assert.equal(t.shown.length, 2);
assert.equal(t.shown[1].t, "לא הספקתם: טירת קולוסי"); assert.equal(JSON.stringify(t.shown[1].o.actions.map(a => a.action)), JSON.stringify(["skip", "drop"])); console.log("later → follow-up [skip, drop], nothing written yet ✔");
e = t.ev({ action: "drop", notification: { close() {}, data: { itemId: "d2-kolossi" } } }); t.handlers.notificationclick(e); await e.done();
assert.deepEqual(JSON.parse(t.fetches.find(f => f.init && f.init.method === "PATCH").init.body), { "status/d2-kolossi": "dropped" }); console.log("follow-up drop → dropped ✔");
// בדיקה (__test__): לא כותבים לחדר, מציגים אישור
t = make({ cfg, outbox: [{ id: "t1", itemId: "__test__", name: "פעילות לדוגמה", title: "הספקתם? פעילות לדוגמה", body: "בדיקה", actions: notif.actions }], max: 3 }); e = t.ev({}); t.handlers.push(e); await e.done();
assert.ok(t.shown[0].o.icon.endsWith("/app/icon-192.png")); assert.ok(t.shown[0].o.badge.endsWith("/app/badge-96.png")); console.log("icon + badge set on notifications ✔");
for (const act of ["done", "skip", "drop"]) {
  const n0 = t.shown.length; e = t.ev({ action: act, notification: { close() {}, data: { itemId: "__test__" } } }); t.handlers.notificationclick(e); await e.done();
  assert.equal(t.fetches.filter(f => f.init && f.init.method === "PATCH").length, 0); assert.equal(t.shown.length, n0 + 1); assert.ok(t.shown[n0].t.startsWith("בדיקה: נבחר"));
}
console.log("sample notification buttons → confirmation only, nothing written ✔");
// כפתור נווט
t = make({ cfg, outbox: [{ id: "p1", title: "בעוד 18 דק׳: לפקארה", body: "x", actions: [{ action: "nav", title: "🧭 נווט" }], url: "https://www.google.com/maps/dir/?api=1&destination=1,2" }], max: 2 });
e = t.ev({}); t.handlers.push(e); await e.done(); assert.equal(t.shown[0].o.data.url, "https://www.google.com/maps/dir/?api=1&destination=1,2"); assert.equal(t.shown[0].o.actions.length, 1);
let opened = null; t.handlersOpen = null;
e = t.ev({ action: "nav", notification: { close() {}, data: { itemId: null, url: "https://www.google.com/maps/dir/?api=1&destination=1,2" } } }); t.handlers.notificationclick(e); await e.done();
assert.equal(t.opened(), 1); assert.equal(t.fetches.filter(f => f.init && f.init.method === "PATCH").length, 0); console.log("nav button → opens maps URL, writes nothing ✔");
// הצעה מהקבוצה: אשר / דחה
for (const [act, label] of [["approve", "✅ ההצעה הוחלה בתוכנית"], ["reject", "ההצעה נדחתה"]]) {
  t = make({ cfg }); e = t.ev({ action: act, notification: { close() {}, data: { pid: "abc12345" } } }); t.handlers.notificationclick(e); await e.done();
  const p = t.fetches.find(f => f.init && f.init.method === "POST"); assert.ok(p.u.endsWith(`/proposals/${cfg.code}/abc12345/${act}`)); assert.equal(t.shown[0].t, label); assert.equal(t.posted[0].type, "status-changed"); assert.equal(t.opened() + t.focused(), 0);
}
t = make({ cfg, failPost: true }); e = t.ev({ action: "approve", notification: { close() {}, data: { pid: "abc12345" } } }); t.handlers.notificationclick(e); await e.done(); assert.equal(t.shown[0].t, "לא הצלחתי לעדכן");
t = make({ cfg, outbox: [{ id: "prx", pid: "abc12345", title: "💬 הצעה מהקבוצה", body: "x", actions: [{ action: "approve", title: "✅ אשר" }, { action: "reject", title: "✖ דחה" }] }], max: 2 }); e = t.ev({}); t.handlers.push(e); await e.done();
assert.equal(t.shown[0].o.data.pid, "abc12345"); assert.equal(t.shown[0].o.actions.length, 2);
console.log("proposal notification: approve/reject → POST, confirmation shown, failure handled ✔");
console.log("ALL SW TESTS OK");
