// בדיקות: /notify (אפליקציית "מי חונה?") וחדר חניה שלא מקבל התראות טיול
import worker from "./sync-worker.mjs";
import assert from "node:assert/strict";
const store = new Map();
const env = { ROOMS: {
  async get(k) { const v = store.get(k); return v === undefined ? null : JSON.parse(v); },
  async put(k, v) { store.set(k, v); }, async delete(k) { store.delete(k); },
  async list({ prefix }) { return { keys: [...store.keys()].filter(k => k.startsWith(prefix)).map(name => ({ name })), list_complete: true }; }
} };
const P = "parkingroom1234567890", T = "triproom1234567890ab";
globalThis.fetch = async () => new Response(null, { status: 201 });
const call = (method, path, body) => worker.fetch(new Request("http://w" + path, { method, body: body ? JSON.stringify(body) : undefined }), env);
const a = await (await call("POST", `/subs/${P}`, { sub: { endpoint: "https://fcm.googleapis.com/fcm/send/AAA" } })).json();
const b = await (await call("POST", `/subs/${P}`, { sub: { endpoint: "https://fcm.googleapis.com/fcm/send/BBB" } })).json();
// ולידציה
assert.equal((await call("POST", `/notify/${P}`, { body: "x" })).status, 400);
assert.equal((await call("POST", `/notify/${P}`, { title: "x".repeat(101) })).status, 400);
assert.equal((await call("POST", `/notify/${P}`, { title: "t", body: 5 })).status, 400);
// שולח לכולם חוץ מהשולח
let r = await (await call("POST", `/notify/${P}`, { title: "🚗 סקודה חנתה", body: "סימן: עוז", from: a.hash })).json();
assert.equal(r.sent, 1);
assert.equal((await (await call("GET", `/outbox/${P}/${a.hash}`)).json()).length, 0);
const ob = await (await call("GET", `/outbox/${P}/${b.hash}`)).json();
assert.equal(ob.length, 1); assert.equal(ob[0].title, "🚗 סקודה חנתה"); assert.equal(ob[0].body, "סימן: עוז"); assert.deepEqual(ob[0].actions, []);
// בלי from: לכולם
assert.equal((await (await call("POST", `/notify/${P}`, { title: "t" })).json()).sent, 2);
// חדר בלי מכשירים
assert.equal((await (await call("POST", `/notify/abcdefghij0000000000`, { title: "t" })).json()).sent, 0);
console.log("notify ok");
// חדר חניה לא מקבל התראות טיול (28/11, 07:30Z = 09:30 קפריסין)
await call("PATCH", `/rooms/${P}.json`, { app: "parking", "cur": { w: "c1" } });
await call("GET", `/outbox/${P}/${b.hash}`); await call("GET", `/outbox/${P}/${a.hash}`);
assert.equal(await worker._tick(env, new Date("2026-11-28T07:30:00Z")), 0);
// חדר טיול רגיל עדיין מקבל
const t = await (await call("POST", `/subs/${T}`, { sub: { endpoint: "https://fcm.googleapis.com/fcm/send/CCC" } })).json();
assert.ok(await worker._tick(env, new Date("2026-11-28T07:30:00Z")) >= 1);
assert.equal((await (await call("GET", `/outbox/${P}/${a.hash}`)).json()).length, 0);
console.log("parking room skipped by trip reminders ok");
