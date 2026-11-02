// Cloudflare Worker: שרת סנכרון קטן לאפליקציית הטיול (מחליף את Firebase).
// דורש KV namespace שמחובר ל-Worker בשם המשתנה ROOMS.
// ממשק: GET/PATCH /rooms/<קוד>.json  (PATCH עם מפתחות מסלול כמו "lists/pack/d1": ערך | null למחיקה)
// הגישה לחדר מוגנת רק בקוד הסודי (16 תווים אקראיים שהאפליקציה יוצרת). הנתונים נמחקים 90 יום אחרי הכתיבה האחרונה.
const BAD = new Set(["__proto__", "constructor", "prototype"]);
const SEG = /^[A-Za-z0-9_-]{1,60}$/;
const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

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

export default {
  async fetch(req, env) {
    const cors = { "access-control-allow-origin": "*", "access-control-allow-methods": "GET,PATCH,OPTIONS", "access-control-allow-headers": "content-type", "access-control-max-age": "86400" };
    const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: Object.assign({ "content-type": "application/json", "cache-control": "no-store" }, cors) });
    if (req.method === "OPTIONS") return new Response(null, { headers: cors });
    const m = new URL(req.url).pathname.match(/^\/rooms\/([a-z0-9]{10,40})\.json$/);
    if (!m) return new Response("not found", { status: 404, headers: cors });
    if (!env.ROOMS) return json({ error: "KV binding ROOMS missing" }, 500);
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
};
