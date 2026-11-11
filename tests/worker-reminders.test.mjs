
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
// לפקארה 11:00, נסיעה 55 דק' → יציאה 10:05, תזכורת 20 דק' לפני היציאה: מ-09:45 מקומי (07:45Z)
assert.equal(await worker._tick(env, at("2026-11-29T07:40:00Z")), 0);
assert.equal(await worker._tick(env, at("2026-11-29T07:50:00Z")), 1);
o = await out(); assert.match(o[0].title, /^צריך לצאת בעוד 15 דק׳: פאנו לפקארה/); assert.match(o[0].body, /נסיעה כ-55 דק׳ מהמלון/); assert.equal(o[0].actions[0].action, "nav"); assert.match(o[0].url, /^https:\/\/www\.google\.com\/maps\/dir\/\?api=1&destination=34\.8666,33\.3028$/); console.log("pre-reminder uses travel time + nav url ✔");
assert.equal(await worker._tick(env, at("2026-11-29T08:50:00Z")), 0); console.log("pre-reminder once ✔");
// ארוחת ערב שלא סומנה "הוזמן" → אין תזכורת; אחרי סימון → תזכורת 30 דק' לפני
assert.equal(await worker._tick(env, at("2026-11-29T17:35:00Z")), 0); console.log("unbooked dinner: no reminder ✔");
await call("PATCH", `/rooms/${CODE}.json`, { init: true, "booked/d3-dinner": true });
assert.equal(await worker._tick(env, at("2026-11-29T17:36:00Z")), 1); o = await out(); assert.match(o[0].title, /Kai Sushi/); console.log("booked dinner reminder 30m ✔");
// צהריים לא קבוע (Iason 13:15): אין תזכורת
assert.equal(await worker._tick(env, at("2026-11-29T11:00:00Z")), 0); console.log("regular lunch: no reminder ✔");
// יום 4: נסיעה לשדה 10:45 → תזכורת 10:25
assert.equal(await worker._tick(env, at("2026-11-30T07:43:00Z")), 1); o = await out(); assert.ok(/נסיעה לשדה/.test(o[0].title)); assert.match(o[0].title, /^בעוד 2 דק׳/); console.log("airport departure reminder at 09:45 ✔");
// פעילות שסומנה בוצע — אין תזכורת
await call("PATCH", `/rooms/${CODE}.json`, { init: true, "status/d2-kolossi": "done" });
assert.equal(await worker._tick(env, at("2026-11-28T08:15:00Z")), 0); console.log("done item: no reminder ✔");
// שם שהוחלף באפליקציה (ov.title) משמש בהתראה, וגם שעה שהוזזה
await call("PATCH", `/rooms/${CODE}.json`, { "ov/d2-kourion": { title: "קוריון (שם חדש)", start: 15 * 60, day: 2 }, "booked/d2-dinner": true, "status/d2-commandaria": "done" }); // Commandaria סומנה, כדי שלא תפריע
assert.equal(await worker._tick(env, at("2026-11-28T12:45:00Z")), 1); o = await out(); // 14:45 מקומי, 15 דק' לפני 15:00
assert.ok(o.some(x => x.title.includes("קוריון (שם חדש)"))); console.log("overridden title and time used in notification ✔");

// ---- זמני התראות מותאמים (notif בחדר) ----
const CODE2 = "yyyyyyyyyy2222222222";
const reg2 = await (await call("POST", `/subs/${CODE2}`, { sub: { endpoint: "https://fcm.googleapis.com/fcm/send/y" } })).json();
const out2 = async () => (await (await call("GET", `/outbox/${CODE2}/${reg2.hash}`)).json());
await call("PATCH", `/rooms/${CODE2}.json`, { init: true, "notif/morning": 600, "notif/lead": 40, "notif/after": 30 });
await worker._tick(env, at("2026-11-29T06:10:00Z")); // 08:10 מקומי: לפני שעת הבוקר שנקבעה (10:00)
assert.equal((await out2()).length, 0); console.log("custom morning: nothing at 08:10 ✔");
// ההגדרה lead=40: לפקארה (יציאה 10:05) → מתריעים מ-09:25 מקומי (07:25Z)
await worker._tick(env, at("2026-11-29T07:20:00Z")); // 09:20: עוד לא
assert.equal((await out2()).length, 0);
await worker._tick(env, at("2026-11-29T07:26:00Z")); // 09:26
o = await out2(); assert.equal(o.length, 1); assert.match(o[0].title, /^צריך לצאת בעוד 39 דק׳: פאנו לפקארה/); console.log("custom lead 40 min before leaving ✔");
await worker._tick(env, at("2026-11-29T08:05:00Z")); // 10:05: שעת הבוקר שנקבעה
o = await out2(); assert.equal(o.length, 1); assert.match(o[0].title, /^בוקר טוב/); console.log("custom morning 10:00 ✔");
await worker._tick(env, at("2026-11-29T11:30:00Z")); // 13:30: לפקארה נגמרת 13:15, ההגדרה 30 דק' אחרי
assert.equal((await out2()).length, 0);
await worker._tick(env, at("2026-11-29T11:46:00Z")); // 13:46
o = await out2(); assert.equal(o.length, 1); assert.match(o[0].title, /^הספקתם\? פאנו לפקארה/); console.log("custom after 30 min ✔");
await call("PATCH", `/rooms/${CODE2}.json`, { "status/d3-olive": "done", "status/d3-view": "done" }); // חוות הזיתים והתצפית כבר סומנו, כדי לא להפריע לבדיקה
// ערכים לא תקינים: חסומים לטווח (ארוחה בערב 20:00, נסיעה 10 דק' → יציאה 19:50, foodLead=9999 → 120 → מתריעים מ-17:50)
await call("PATCH", `/rooms/${CODE2}.json`, { "notif/foodLead": 9999, "notif/lead": "abc", "booked/d3-dinner": true });
await worker._tick(env, at("2026-11-29T15:45:00Z")); // 17:45: עוד לא
assert.equal((await out2()).length, 0);
await worker._tick(env, at("2026-11-29T16:05:00Z")); // 18:05
o = await out2(); assert.equal(o.length, 1); assert.match(o[0].title, /^צריך לצאת בעוד 105 דק׳: ארוחת ערב – Kai Sushi/); console.log("invalid values clamped (120 max) ✔");
// פעילות שהוזזה באפליקציה: זמן הנסיעה כבר לא חל (מתריעים לפי שעת ההתחלה החדשה)
await call("PATCH", `/rooms/${CODE2}.json`, { "ov/d3-olive": { start: 17 * 60 + 30 }, "status/d3-olive": null });
await worker._tick(env, at("2026-11-29T15:20:00Z")); // 17:20: 10 דק' לפני 17:30, בלי נסיעה (lead ברירת מחדל 20)
o = await out2(); assert.equal(o.length, 1); assert.match(o[0].title, /^בעוד 10 דק׳: חוות הזיתים/); console.log("moved item ignores travel time ✔");
console.log("ALL WORKER2 TESTS OK");
