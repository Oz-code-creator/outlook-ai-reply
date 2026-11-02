
import worker from "./sync-worker.mjs";
import assert from "node:assert/strict";
const store = new Map();
const env = { ROOMS: {
  async get(k) { const v = store.get(k); return v === undefined ? null : JSON.parse(v); }, async put(k, v) { store.set(k, v); }, async delete(k) { store.delete(k); },
  async list({ prefix }) { return { keys: [...store.keys()].filter(k => k.startsWith(prefix)).map(name => ({ name })), list_complete: true }; } } };
const CODE = "zzzzzzzzzz1111111111";
globalThis.fetch = async () => new Response(null, { status: 201 });
const call = (m, p, b) => worker.fetch(new Request("http://w" + p, { method: m, body: b ? JSON.stringify(b) : undefined }), env);
const at = s => new Date(s);
const reg = await (await call("POST", `/subs/${CODE}`, { sub: { endpoint: "https://fcm.googleapis.com/fcm/send/x" } })).json();
const out = async () => (await (await call("GET", `/outbox/${CODE}/${reg.hash}`)).json());
// בוקר ביום 3 (08:10 מקומי = 06:10Z)
assert.equal(await worker._tick(env, at("2026-11-29T06:10:00Z")), 1);
let o = await out(); assert.equal(o[0].title, "בוקר טוב! ראשון 29/11"); assert.ok(o[0].body.includes("11:00 פאנו לפקארה")); assert.ok(!o[0].body.includes("ארוחת בוקר")); console.log("morning ✔:", o[0].body.split("\n")[0]);
assert.equal(await worker._tick(env, at("2026-11-29T06:20:00Z")), 0); console.log("morning once a day ✔");
// לפקארה 11:00 → תזכורת 10:40 מקומי (08:40Z)
assert.equal(await worker._tick(env, at("2026-11-29T08:35:00Z")), 0);
assert.equal(await worker._tick(env, at("2026-11-29T08:42:00Z")), 1);
o = await out(); assert.match(o[0].title, /^בעוד 18 דק׳: פאנו לפקארה/); assert.equal(o[0].actions[0].action, "nav"); assert.match(o[0].url, /^https:\/\/www\.google\.com\/maps\/dir\/\?api=1&destination=34\.8666,33\.3028$/); console.log("pre-reminder + nav url ✔");
assert.equal(await worker._tick(env, at("2026-11-29T08:50:00Z")), 0); console.log("pre-reminder once ✔");
// ארוחת ערב שלא סומנה "הוזמן" → אין תזכורת; אחרי סימון → תזכורת 30 דק' לפני
assert.equal(await worker._tick(env, at("2026-11-29T17:35:00Z")), 0); console.log("unbooked dinner: no reminder ✔");
await call("PATCH", `/rooms/${CODE}.json`, { init: true, "booked/d3-dinner": true });
assert.equal(await worker._tick(env, at("2026-11-29T17:36:00Z")), 1); o = await out(); assert.match(o[0].title, /Kai Sushi/); console.log("booked dinner reminder 30m ✔");
// צהריים לא קבוע (Iason 13:15): אין תזכורת
assert.equal(await worker._tick(env, at("2026-11-29T11:00:00Z")), 0); console.log("regular lunch: no reminder ✔");
// יום 4: נסיעה לשדה 10:45 → תזכורת 10:25
assert.equal(await worker._tick(env, at("2026-11-30T08:28:00Z")), 1); o = await out(); assert.ok(/נסיעה לשדה/.test(o[0].title)); assert.match(o[0].title, /^בעוד 2 דק׳/); console.log("airport departure reminder at 10:30 ✔");
// פעילות שסומנה בוצע — אין תזכורת
await call("PATCH", `/rooms/${CODE}.json`, { init: true, "status/d2-kolossi": "done" });
assert.equal(await worker._tick(env, at("2026-11-28T08:15:00Z")), 0); console.log("done item: no reminder ✔");
// שם שהוחלף באפליקציה (ov.title) משמש בהתראה, וגם שעה שהוזזה
await call("PATCH", `/rooms/${CODE}.json`, { "ov/d2-kourion": { title: "קוריון (שם חדש)", start: 15 * 60, day: 2 }, "booked/d2-dinner": true });
assert.equal(await worker._tick(env, at("2026-11-28T12:45:00Z")), 1); o = await out(); // 14:45 מקומי, 15 דק' לפני 15:00
assert.ok(o.some(x => x.title.includes("קוריון (שם חדש)"))); console.log("overridden title and time used in notification ✔");
console.log("ALL WORKER2 TESTS OK");
