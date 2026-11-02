// Cloudflare Worker: סנכרון חי + התראות דחיפה לאפליקציית הטיול.
// דרוש: KV namespace מחובר בשם המשתנה ROOMS. להתראות: Cron Trigger כל 5 דקות (*/5 * * * *).
//
// ממשק:
//   GET/PATCH /rooms/<קוד>.json        סנכרון רשימות וסימונים (מסלולים כמו "status/d1-lunch": ערך | null)
//   GET  /vapid                        המפתח הציבורי להתראות (נוצר אוטומטית בקריאה הראשונה)
//   POST /subs/<קוד>                   רישום מכשיר להתראות   |  DELETE /subs/<קוד>/<hash>
//   GET  /outbox/<קוד>/<hash>          ההתראות הממתינות למכשיר (נמחקות אחרי הקריאה)
//   POST /test/<קוד>                   שליחת התראת בדיקה
// הגישה לחדר מוגנת בקוד הסודי בלבד. נתונים נמחקים 90 יום אחרי הכתיבה האחרונה.

// PLAN-BEGIN
const PLAN = {"days":[{"n":1,"date":"2026-11-27","label":"שישי 27/11"},{"n":2,"date":"2026-11-28","label":"שבת 28/11"},{"n":3,"date":"2026-11-29","label":"ראשון 29/11"},{"n":4,"date":"2026-11-30","label":"שני 30/11"}],"items":[{"id":"d1-hotel","day":1,"start":"12:00","dur":30,"type":"rest","title":"הגעה למלון","fixed":true,"lat":34.6974038,"lng":33.0949755},{"id":"d1-lunch","day":1,"start":"13:00","dur":75,"type":"food","title":"ארוחת צהריים – Mostra Meze","fixed":false,"lat":34.6754273,"lng":33.0431423},{"id":"d1-castle","day":1,"start":"14:15","dur":60,"type":"sight","title":"טירת לימסול והמוזיאון הימי-ביניימי","fixed":false,"lat":34.6727,"lng":33.0431},{"id":"d1-molos","day":1,"start":"15:15","dur":60,"type":"sight","title":"טיילת מולוס","fixed":false,"lat":34.6743,"lng":33.0475},{"id":"d1-rest","day":1,"start":"16:30","dur":120,"type":"rest","title":"מנוחה ומקלחת במלון","fixed":false,"lat":34.6974038,"lng":33.0949755},{"id":"d1-port","day":1,"start":"18:30","dur":90,"type":"sight","title":"הנמל הישן ופארק חג המולד","fixed":false,"lat":34.6704,"lng":33.0443},{"id":"d1-dinner","day":1,"start":"20:00","dur":90,"type":"food","title":"ארוחת ערב – Mazema","fixed":true,"lat":34.673984,"lng":33.039054},{"id":"d2-bf","day":2,"start":"08:30","dur":60,"type":"food","title":"ארוחת בוקר במלון","fixed":true,"lat":34.6974038,"lng":33.0949755},{"id":"d2-kolossi","day":2,"start":"10:30","dur":45,"type":"sight","title":"טירת קולוסי","fixed":false,"lat":34.6644,"lng":32.9306},{"id":"d2-kourion","day":2,"start":"11:30","dur":120,"type":"sight","title":"קוריון העתיקה","fixed":false,"lat":34.6641,"lng":32.8856},{"id":"d2-lunch","day":2,"start":"13:45","dur":90,"type":"food","title":"צהריים – Chris Blue Beach","fixed":false,"lat":34.6658863,"lng":32.8771663},{"id":"d2-spa","day":2,"start":"16:00","dur":120,"type":"rest","title":"ספא או מנוחה במלון","fixed":false,"lat":34.6974038,"lng":33.0949755},{"id":"d2-shop","day":2,"start":"18:30","dur":60,"type":"shop","title":"אגיו אנדראו – קניות ומתנות","fixed":false,"lat":34.6764937,"lng":33.0475766},{"id":"d2-dinner","day":2,"start":"19:30","dur":100,"type":"food","title":"ארוחת ערב – MEZE Taverna","fixed":true,"lat":34.6764937,"lng":33.0475766},{"id":"d3-bf","day":3,"start":"08:45","dur":60,"type":"food","title":"ארוחת בוקר במלון","fixed":true,"lat":34.6974038,"lng":33.0949755},{"id":"d3-lefkara","day":3,"start":"11:00","dur":135,"type":"shop","title":"פאנו לפקארה – תחרה, כסף ומתנות","fixed":false,"lat":34.8666,"lng":33.3028},{"id":"d3-lunch","day":3,"start":"13:15","dur":90,"type":"food","title":"צהריים – Iason Tavern (גיבוי: To Piperi)","fixed":false,"lat":34.8672,"lng":33.3033},{"id":"d3-rest","day":3,"start":"16:30","dur":160,"type":"rest","title":"מנוחה במלון","fixed":false,"lat":34.6974038,"lng":33.0949755},{"id":"d3-dinner","day":3,"start":"20:00","dur":90,"type":"food","title":"ארוחת ערב – Kai Sushi","fixed":true,"lat":34.688916,"lng":33.0711665},{"id":"d4-bf","day":4,"start":"08:30","dur":45,"type":"food","title":"ארוחת בוקר","fixed":true,"lat":34.6974038,"lng":33.0949755},{"id":"d4-walk","day":4,"start":"09:15","dur":45,"type":"sight","title":"הליכה על החוף","fixed":false,"lat":34.6974038,"lng":33.0949755},{"id":"d4-checkout","day":4,"start":"10:15","dur":30,"type":"rest","title":"צ׳ק-אאוט","fixed":true,"lat":34.6974038,"lng":33.0949755},{"id":"d4-airport","day":4,"start":"10:45","dur":60,"type":"travel","title":"נסיעה לשדה לרנקה","fixed":true,"lat":34.8751,"lng":33.6249},{"id":"d4-flight","day":4,"start":"14:40","dur":60,"type":"travel","title":"טיסה חזרה","fixed":true,"lat":34.8751,"lng":33.6249}]};
// PLAN-END

const BAD = new Set(["__proto__", "constructor", "prototype"]);
const SEG = /^[A-Za-z0-9_-]{1,60}$/;
const CODE = "[a-z0-9]{10,40}";
const PUSH_HOSTS = /^https:\/\/(fcm\.googleapis\.com|updates\.push\.services\.mozilla\.com|[a-z0-9.-]+\.push\.apple\.com|[a-z0-9.-]+\.notify\.windows\.com)\//;
const NOTIFY_TYPES = ["sight", "shop"]; // בלי מסעדות
const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const enc = new TextEncoder();
const b64u = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const toMin = t => { const [h, m] = String(t).split(":").map(Number); return h * 60 + m; };
const hex = buf => Array.from(new Uint8Array(buf), b => b.toString(16).padStart(2, "0")).join("");

function setPath(root, parts, val) {
  let o = root; const stack = [];
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    if (val === null && !(own(o, k) && o[k] && typeof o[k] === "object")) return;
    if (!own(o, k) || typeof o[k] !== "object" || o[k] === null) o[k] = {};
    stack.push([o, k]); o = o[k];
  }
  const last = parts[parts.length - 1];
  if (val === null) delete o[last]; else o[last] = val;
  for (let i = stack.length - 1; i >= 0; i--) { const [p, k] = stack[i]; if (Object.keys(p[k]).length === 0) delete p[k]; else break; }
}

// ---------- VAPID / Web Push (בלי מטען: ההתראה נשלפת מה-outbox) ----------
async function getVapid(env) {
  let v = await env.ROOMS.get("vapid", { type: "json" });
  if (v && v.pub && v.priv) return v;
  const kp = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
  v = { pub: b64u(await crypto.subtle.exportKey("raw", kp.publicKey)), priv: await crypto.subtle.exportKey("jwk", kp.privateKey) };
  await env.ROOMS.put("vapid", JSON.stringify(v));
  return v;
}
async function vapidAuth(env, endpoint) {
  const v = await getVapid(env);
  const header = b64u(enc.encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const claims = b64u(enc.encode(JSON.stringify({ aud: new URL(endpoint).origin, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: "https://oz-code-creator.github.io/outlook-ai-reply/" })));
  const key = await crypto.subtle.importKey("jwk", v.priv, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, enc.encode(header + "." + claims));
  return `vapid t=${header}.${claims}.${b64u(sig)}, k=${v.pub}`;
}
async function pushTo(env, code, hash, sub) {
  try {
    const r = await fetch(sub.endpoint, { method: "POST", headers: { Authorization: await vapidAuth(env, sub.endpoint), TTL: "3600", Urgency: "high" } });
    if (r.status === 404 || r.status === 410) await env.ROOMS.delete(`sub:${code}:${hash}`);
    return r.status;
  } catch (e) { return 0; }
}
async function listSubs(env, code) {
  const out = []; let cursor;
  do {
    const l = await env.ROOMS.list({ prefix: `sub:${code}:`, cursor });
    for (const k of l.keys) { const sub = await env.ROOMS.get(k.name, { type: "json" }); if (sub && sub.endpoint) out.push({ hash: k.name.split(":")[2], sub }); }
    cursor = l.list_complete ? null : l.cursor;
  } while (cursor);
  return out;
}
async function notify(env, code, subs, notif) {
  for (const { hash, sub } of subs) {
    const k = `outbox:${code}:${hash}`;
    const list = (await env.ROOMS.get(k, { type: "json" })) || [];
    list.push(notif);
    await env.ROOMS.put(k, JSON.stringify(list.slice(-5)), { expirationTtl: 86400 });
    await pushTo(env, code, hash, sub);
  }
}

// ---------- בדיקת לוח זמנים (cron) ----------
function nowCY(d) {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Nicosia", hour12: false, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).formatToParts(d).map(x => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, min: (Number(p.hour) % 24) * 60 + Number(p.minute) };
}
function effItems(room) {
  const ov = room.ov || {};
  return PLAN.items.concat(Object.values(room.added || {})).map(it => {
    const m = Object.assign({}, it, ov[it.id] || {});
    return { id: m.id, day: m.day, start: typeof m.start === "string" ? toMin(m.start) : m.start, dur: m.dur, type: m.type, title: m.title, fixed: !!m.fixed, lat: m.lat, lng: m.lng };
  });
}
const fmt = m => String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
// תזכורת "צריך לצאת": אתרים וקניות, ארוחות ערב עם הזמנה, ונסיעה לשדה (לא ארוחות רגילות)
const remindable = i => NOTIFY_TYPES.includes(i.type) || (i.type === "food" && i.fixed && !/-bf$/.test(i.id)) || i.id === "d4-airport";
const leadOf = i => (i.type === "food" ? 30 : 20);

async function tick(env, when) {
  const { date, min } = nowCY(when || new Date());
  const day = PLAN.days.find(d => d.date === date);
  if (!day) return 0;
  const codes = new Set(); let cursor;
  do {
    const l = await env.ROOMS.list({ prefix: "sub:", cursor });
    l.keys.forEach(k => codes.add(k.name.split(":")[1]));
    cursor = l.list_complete ? null : l.cursor;
  } while (cursor);
  let sent = 0;
  for (const code of codes) {
    const room = (await env.ROOMS.get("room:" + code, { type: "json" })) || {};
    const notified = (await env.ROOMS.get("notified:" + code, { type: "json" })) || {};
    const status = room.status || {}, items = effItems(room), out = [];

    // 1) הודעת בוקר עם תוכנית היום (08:00–10:00, פעם ביום)
    const mk = "morning:" + date;
    if (min >= 480 && min <= 600 && !notified[mk]) {
      const todays = items.filter(i => i.day === day.n && !status[i.id] && ["sight", "shop", "food"].includes(i.type) && !/-bf$/.test(i.id)).sort((a, b) => a.start - b.start);
      if (todays.length) {
        notified[mk] = Date.now();
        out.push({ id: "m" + Date.now(), title: "בוקר טוב! " + day.label, body: todays.slice(0, 5).map(i => fmt(i.start) + " " + i.title).join("\n"), actions: [] });
      }
    }
    // 2) "צריך לצאת": 20 דק' לפני (30 לארוחת ערב עם הזמנה)
    for (const i of items.filter(x => x.day === day.n && remindable(x) && !status[x.id]).sort((a, b) => a.start - b.start)) {
      const k = "pre:" + i.id;
      if (notified[k] || !(min >= i.start - leadOf(i) && min < i.start)) continue;
      notified[k] = Date.now();
      const n = { id: "p" + Date.now() + out.length, title: `בעוד ${i.start - min} דק׳: ${i.title}`, body: "מתי יוצאים? בדקו זמן נסיעה.", actions: [] };
      if (typeof i.lat === "number" && typeof i.lng === "number") { n.actions = [{ action: "nav", title: "🧭 נווט" }]; n.url = `https://www.google.com/maps/dir/?api=1&destination=${i.lat},${i.lng}`; }
      out.push(n);
    }
    // 3) "הספקתם?" אחרי שעבר הזמן (אתרים וקניות)
    const due = items.filter(i => i.day === day.n && NOTIFY_TYPES.includes(i.type) && !status[i.id] && !notified[i.id] &&
      min >= i.start + i.dur + 10 && min <= i.start + i.dur + 180).sort((a, b) => a.start - b.start)[0];
    if (due) {
      notified[due.id] = Date.now();
      out.push({ id: "n" + Date.now(), itemId: due.id, name: due.title, title: "הספקתם? " + due.title, body: "עברו כמה דקות מהזמן המתוכנן. מה קרה?",
        actions: [{ action: "done", title: "✅ הספקנו" }, { action: "skip", title: "⏭ דילגנו" }, { action: "drop", title: "✖ ויתרנו" }] });
    }
    if (!out.length) continue;
    await env.ROOMS.put("notified:" + code, JSON.stringify(notified), { expirationTtl: 7 * 86400 });
    const subs = await listSubs(env, code);
    for (const n of out.slice(0, 4)) { await notify(env, code, subs, n); sent++; }
  }
  return sent;
}

// ---------- HTTP ----------
export default {
  async fetch(req, env) {
    const cors = { "access-control-allow-origin": "*", "access-control-allow-methods": "GET,POST,PATCH,DELETE,OPTIONS", "access-control-allow-headers": "content-type", "access-control-max-age": "86400" };
    const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: Object.assign({ "content-type": "application/json", "cache-control": "no-store" }, cors) });
    if (req.method === "OPTIONS") return new Response(null, { headers: cors });
    if (!env.ROOMS) return json({ error: "KV binding ROOMS missing" }, 500);
    const reqUrl = new URL(req.url), path = reqUrl.pathname;
    let m;

    if (path === "/vapid" && req.method === "GET") return json({ pub: (await getVapid(env)).pub });

    if ((m = path.match(new RegExp(`^/rooms/(${CODE})\\.json$`)))) {
      const key = "room:" + m[1];
      if (req.method === "GET") return json(await env.ROOMS.get(key, { type: "json" }));
      if (req.method === "PATCH") {
        const txt = await req.text();
        if (txt.length > 100000) return json({ error: "too large" }, 413);
        let patch; try { patch = JSON.parse(txt); } catch (e) { return json({ error: "bad json" }, 400); }
        if (!patch || typeof patch !== "object" || Array.isArray(patch)) return json({ error: "bad patch" }, 400);
        const keys = Object.keys(patch);
        if (keys.length > 500) return json({ error: "too many keys" }, 413);
        const data = (await env.ROOMS.get(key, { type: "json" })) || {};
        for (const p of keys) {
          const parts = p.split("/");
          if (parts.length > 4 || parts.some(s => BAD.has(s) || !SEG.test(s))) return json({ error: "bad path" }, 400);
          setPath(data, parts, patch[p]);
        }
        const out = JSON.stringify(data);
        if (out.length > 200000) return json({ error: "room too large" }, 413);
        await env.ROOMS.put(key, out, { expirationTtl: 60 * 60 * 24 * 90 });
        return json(patch);
      }
      return new Response("method not allowed", { status: 405, headers: cors });
    }

    if ((m = path.match(new RegExp(`^/subs/(${CODE})$`))) && req.method === "POST") {
      let b; try { b = await req.json(); } catch (e) { return json({ error: "bad json" }, 400); }
      const endpoint = b && b.sub && b.sub.endpoint;
      if (typeof endpoint !== "string" || endpoint.length > 600 || !PUSH_HOSTS.test(endpoint)) return json({ error: "bad endpoint" }, 400);
      const hash = hex(await crypto.subtle.digest("SHA-256", enc.encode(endpoint))).slice(0, 16);
      const existing = await listSubs(env, m[1]);
      if (existing.length >= 6 && !existing.some(x => x.hash === hash)) return json({ error: "too many devices" }, 429);
      await env.ROOMS.put(`sub:${m[1]}:${hash}`, JSON.stringify({ endpoint, t: Date.now() }), { expirationTtl: 60 * 60 * 24 * 90 });
      return json({ hash });
    }
    if ((m = path.match(new RegExp(`^/subs/(${CODE})/([a-f0-9]{16})$`))) && req.method === "DELETE") {
      await env.ROOMS.delete(`sub:${m[1]}:${m[2]}`); return json({ ok: true });
    }
    if ((m = path.match(new RegExp(`^/outbox/(${CODE})/([a-f0-9]{16})$`))) && req.method === "GET") {
      const k = `outbox:${m[1]}:${m[2]}`;
      const list = (await env.ROOMS.get(k, { type: "json" })) || [];
      if (list.length) await env.ROOMS.delete(k);
      return json(list);
    }
    if ((m = path.match(new RegExp(`^/test/(${CODE})$`))) && req.method === "POST") {
      const subs = await listSubs(env, m[1]);
      if (!subs.length) return json({ error: "no devices registered" }, 404);
      const withButtons = reqUrl.searchParams.get("buttons") === "1";
      await notify(env, m[1], subs, withButtons
        ? { id: "t" + Date.now(), itemId: "__test__", name: "פעילות לדוגמה", title: "הספקתם? פעילות לדוגמה", body: "זו בדיקה: לחיצה על כפתור לא משנה כלום בתוכנית.",
            actions: [{ action: "done", title: "✅ הספקנו" }, { action: "skip", title: "⏭ דילגנו" }, { action: "drop", title: "✖ ויתרנו" }] }
        : { id: "t" + Date.now(), title: "בדיקה ✅", body: "ההתראות עובדות. כך הן ייראו בטיול.", actions: [] });
      return json({ sent: subs.length });
    }
    return new Response("not found", { status: 404, headers: cors });
  },
  async scheduled(event, env, ctx) { ctx.waitUntil(tick(env)); },
  _tick: tick
};
