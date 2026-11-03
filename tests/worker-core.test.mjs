import worker from "./sync-worker.mjs";
import assert from "node:assert/strict";
const store = new Map();
const env = { ROOMS: {
  async get(k, o) { const v = store.get(k); return v === undefined ? null : JSON.parse(v); },
  async put(k, v) { store.set(k, v); }, async delete(k) { store.delete(k); },
  async list({ prefix }) { return { keys: [...store.keys()].filter(k => k.startsWith(prefix)).map(name => ({ name })), list_complete: true }; }
} };
const CODE = "abcdefghij1234567890";
const pushes = []; let pushStatus = 201;
globalThis.fetch = async (url, init) => { pushes.push({ url, h: init.headers }); return new Response(null, { status: pushStatus }); };
const call = (method, path, body) => worker.fetch(new Request("http://w" + path, { method, body: body ? JSON.stringify(body) : undefined }), env);
const at = iso => new Date(iso);

// vapid יציב
const v1 = await (await call("GET", "/vapid")).json(), v2 = await (await call("GET", "/vapid")).json();
assert.equal(v1.pub, v2.pub); assert.ok(v1.pub.length > 80); console.log("vapid ok");
// רישום
assert.equal((await call("POST", `/subs/${CODE}`, { sub: { endpoint: "http://evil.com/x" } })).status, 400);
assert.equal((await call("POST", `/subs/${CODE}`, { sub: { endpoint: "https://evil.com/x" } })).status, 400);
const reg = await (await call("POST", `/subs/${CODE}`, { sub: { endpoint: "https://fcm.googleapis.com/fcm/send/abc123" } })).json();
assert.match(reg.hash, /^[a-f0-9]{16}$/); console.log("subscribe ok, hash", reg.hash);
// מחוץ לטיול
assert.equal(await worker._tick(env, at("2026-11-10T10:00:00Z")), 0);
// ארוחת בוקר לא מתריעה
assert.equal(await worker._tick(env, at("2026-11-28T07:30:00Z")), 1); // הודעת בוקר בלבד (קולוסי: יציאה 10:05, תזכורת מ-09:45)
{ const o = await (await call("GET", `/outbox/${CODE}/${reg.hash}`)).json(); assert.equal(o.length, 1); assert.ok(o[0].title.startsWith("בוקר טוב")); assert.ok(!o[0].body.includes("ארוחת בוקר")); }
// קולוסי (10:30 + 45 דק') → מ-11:25 בשעון קפריסין = 09:25Z
assert.equal(await worker._tick(env, at("2026-11-28T09:30:00Z")), 2); // "הספקתם? קולוסי" + "בעוד 15 דק׳: קוריון" (קוריון מתחילה 11:45)
assert.equal(pushes.length, 3); // בוקר + הספקתם + קוריון
const auth = pushes[pushes.length - 1].h.Authorization; assert.match(auth, /^vapid t=[\w-]+\.[\w-]+\.[\w-]+, k=/);
const [jwt, k] = auth.slice(8).split(", k="); const [h, c, s] = jwt.split(".");
const claims = JSON.parse(Buffer.from(c, "base64url")); assert.equal(claims.aud, "https://fcm.googleapis.com"); assert.ok(claims.exp > Date.now() / 1000);
const pub = await crypto.subtle.importKey("raw", Buffer.from(k, "base64url"), { name: "ECDSA", namedCurve: "P-256" }, false, ["verify"]);
assert.ok(await crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, pub, Buffer.from(s, "base64url"), new TextEncoder().encode(h + "." + c)));
console.log("push sent + VAPID signature verifies");
// outbox
const ob = await (await call("GET", `/outbox/${CODE}/${reg.hash}`)).json();
assert.equal(ob.length, 2); const k0 = ob.find(x => x.itemId === "d2-kolossi"); assert.ok(k0); assert.equal(k0.actions.length, 3); assert.ok(ob.some(x => /^צריך לצאת בעוד 10 דק׳: קוריון/.test(x.title))); console.log("outbox:", k0.title);
assert.equal((await (await call("GET", `/outbox/${CODE}/${reg.hash}`)).json()).length, 0);
// אין כפילות
assert.equal(await worker._tick(env, at("2026-11-28T09:35:00Z")), 0);
// סימון בוצע דרך סנכרון → אין התראה על קוריון
await call("PATCH", `/rooms/${CODE}.json`, { init: true, "status/d2-kourion": "done", "status/d2-commandaria": "done" });
assert.equal(await worker._tick(env, at("2026-11-28T11:45:00Z")), 0); console.log("done items not notified");
// הזזה דרך ov: אגיו אנדראו (קניות) הועבר ל-14:00 → מתריע אחרי 15:10
await call("PATCH", `/rooms/${CODE}.json`, { "ov/d2-shop": { day: 2, start: 840, dur: 60 } });
assert.equal(await worker._tick(env, at("2026-11-28T13:05:00Z")), 0); // 15:05 מקומי
assert.equal(await worker._tick(env, at("2026-11-28T13:20:00Z")), 1); console.log("moved item uses overridden time");
// 410 → מנוי נמחק
pushStatus = 410;
await worker._tick(env, at("2026-11-28T14:00:00Z")); // צהריים Chris Blue 13:45+90 → 15:25 מקומי ... (13:25Z) כבר עבר חלון? נבדוק מחיקה דרך test
const t = await call("POST", `/test/${CODE}`); console.log("test status", t.status);
assert.equal([...store.keys()].filter(x => x.startsWith("sub:")).length, 0); console.log("expired sub removed (410)");
assert.equal((await call("POST", `/test/${CODE}`)).status, 404);
// כתובת לא תקינה
assert.equal((await call("GET", "/rooms/BAD.json")).status, 404);
pushStatus = 201;
const reg2 = await (await call("POST", `/subs/${CODE}`, { sub: { endpoint: "https://updates.push.services.mozilla.com/wpush/v2/xyz" } })).json();
const tr = await call("POST", `/test/${CODE}`); assert.equal(tr.status, 200); assert.equal((await tr.json()).sent, 1);
const ob2 = await (await call("GET", `/outbox/${CODE}/${reg2.hash}`)).json(); assert.equal(ob2[0].title, "בדיקה ✅"); assert.equal(ob2[0].actions.length, 0);
console.log("test endpoint ok (mozilla endpoint allowed)");
// מסעדות לא מתריעות: צהריים Chris Blue (13:45+90) → 15:25 מקומי
store.delete("notified:" + CODE);
const reg3 = await (await call("POST", `/subs/${CODE}`, { sub: { endpoint: "https://fcm.googleapis.com/fcm/send/again" } })).json();
await call("PATCH", `/rooms/${CODE}.json`, { "status/d2-shop": "done", "status/d2-kolossi": "done" });
assert.equal(await worker._tick(env, at("2026-11-28T13:30:00Z")), 0); console.log("food not notified ✔");
const tb = await call("POST", `/test/${CODE}?buttons=1`); assert.equal(tb.status, 200);
const obb = (await (await call("GET", `/outbox/${CODE}/${reg2.hash}`)).json()).pop();
assert.equal(obb.itemId, "__test__"); assert.equal(obb.actions.length, 3); assert.equal(obb.title, "הספקתם? פעילות לדוגמה"); console.log("test?buttons=1 → sample notification with 3 actions ✔");
console.log("ALL WORKER TESTS OK");
