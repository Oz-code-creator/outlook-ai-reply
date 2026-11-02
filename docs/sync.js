// סנכרון חי בין מכשירים דרך שרת REST (Cloudflare Worker, או Firebase Realtime Database; , בדיקה כל 5 שניות).
// נתונים מסונכרנים: רשימות (אריזה/משימות), סימוני פעילויות, הזזות ופעילויות שנוספו. לא מסונכרנים: מפתח API והגדרות.
(function () {
  const LK = "cyprus-sync-last", KEYS = ["pack", "todo"];
  const HOST_OK = u => {
    try {
      const x = new URL(u);
      if (location.hostname === "localhost" && x.hostname === "localhost") return true; // לבדיקות בלבד
      return x.protocol === "https:" && /\.(workers\.dev|firebasedatabase\.app|firebaseio\.com)$/.test(x.hostname);
    } catch (e) { return false; }
  };
  const CODE_OK = c => /^[a-z0-9]{10,40}$/.test(c || "");
  const clone = v => JSON.parse(JSON.stringify(v));
  const canon = v => v && typeof v === "object" ? "{" + Object.keys(v).sort().map(k => JSON.stringify(k) + ":" + canon(v[k])).join(",") + "}" : JSON.stringify(v === undefined ? null : v);

  let api = null, cfg = null, last = null, dirty = false, ver = 0, busy = false, deb = null, iv = null;
  const status = t => api && api.onStatus && api.onStatus(t);
  const setLast = m => { last = m; try { localStorage.setItem(LK, JSON.stringify(m)); } catch (e) { /* ignore */ } };

  function flat(st) {
    const m = {};
    KEYS.forEach(k => (st.lists[k] || []).forEach((it, i) => { m[`lists/${k}/${it.id}`] = { t: it.t, done: !!it.done, o: Number.isFinite(it.o) ? it.o : i }; }));
    Object.entries(st.status || {}).forEach(([id, v]) => { m[`status/${id}`] = v; });
    Object.entries(st.ov || {}).forEach(([id, v]) => { m[`ov/${id}`] = clone(v); });
    (st.added || []).forEach(it => { m[`added/${it.id}`] = clone(it); });
    return m;
  }
  function flatRemote(r) {
    const m = {}; if (!r) return m;
    KEYS.forEach(k => Object.entries((r.lists || {})[k] || {}).forEach(([id, v]) => { m[`lists/${k}/${id}`] = v; }));
    ["status", "ov", "added"].forEach(s => Object.entries(r[s] || {}).forEach(([id, v]) => { m[`${s}/${id}`] = v; }));
    return m;
  }
  function unflat(r) {
    const lists = {};
    KEYS.forEach(k => { lists[k] = Object.entries((r.lists || {})[k] || {}).filter(([, v]) => v && typeof v.t === "string")
      .map(([id, v]) => ({ id, t: v.t.slice(0, 120), done: !!v.done, o: Number(v.o) || 0 })).sort((a, b) => a.o - b.o); });
    const st = {}, ov = {}, added = [], days = api.days;
    Object.entries(r.status || {}).forEach(([id, v]) => { if (v === "done" || v === "skipped") st[id] = v; });
    Object.entries(r.ov || {}).forEach(([id, v]) => {
      if (!v || typeof v !== "object") return; const o = {};
      if (Number.isInteger(v.day) && v.day >= 1 && v.day <= days) o.day = v.day;
      if (Number.isFinite(v.start) && v.start >= 0 && v.start < 1440) o.start = v.start;
      if (Number.isFinite(v.dur) && v.dur >= 15 && v.dur <= 480) o.dur = v.dur;
      if (Object.keys(o).length) ov[id] = o;
    });
    Object.entries(r.added || {}).forEach(([id, v]) => {
      if (v && typeof v.title === "string" && Number.isInteger(v.day) && v.day >= 1 && v.day <= days && Number.isFinite(v.start) && v.dur >= 15 && v.dur <= 480 &&
          ["sight", "food", "rest", "shop", "travel"].includes(v.type))
        added.push({ id, day: v.day, start: v.start, dur: v.dur, type: v.type, title: v.title.slice(0, 120), notes: String(v.notes || "").slice(0, 300) });
    });
    added.sort((a, b) => (a.id < b.id ? -1 : 1));
    return { lists, status: st, ov, added };
  }

  const url = () => `${cfg.url}/rooms/${cfg.code}.json`;
  async function req(method, body) {
    const r = await fetch(url(), { method, headers: body ? { "content-type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined });
    if (!r.ok) throw new Error("HTTP " + r.status + (r.status === 401 || r.status === 403 ? " (הרשאות/Rules)" : ""));
    return r.json();
  }
  function diff(cur, prev) {
    const patch = {};
    Object.keys(cur).forEach(p => { if (!prev || canon(cur[p]) !== canon(prev[p])) patch[p] = cur[p]; });
    if (prev) Object.keys(prev).forEach(p => { if (!(p in cur)) patch[p] = null; });
    return patch;
  }

  async function cycle() {
    if (!cfg || busy || !api) return;
    busy = true;
    try {
      const myVer = ver;
      if (last === null) { // התקנה ראשונה במכשיר: מאמצים את המצב המרוחק
        const remote = await req("GET");
        if (remote && remote.init) { setLast(flatRemote(remote)); api.set(unflat(remote)); }
        else { const cur = flat(api.get()); await req("PATCH", Object.assign({ init: true }, cur)); setLast(cur); }
        dirty = false;
      } else {
        if (dirty) {
          const cur = flat(api.get()), patch = diff(cur, last);
          if (Object.keys(patch).length) await req("PATCH", patch);
          setLast(cur);
          if (ver === myVer) dirty = false;
        }
        const v0 = ver, remote = await req("GET");
        if (remote && remote.init && v0 === ver && !dirty) {
          const rf = flatRemote(remote);
          if (canon(rf) !== canon(last)) { setLast(rf); api.set(unflat(remote)); }
        }
      }
      status("🔄 מסונכרן");
    } catch (e) { status("⚠ לא מסונכרן (" + (e.message || "שגיאה") + ")"); }
    finally { busy = false; }
  }

  function run() { clearInterval(iv); iv = setInterval(cycle, 5000); cycle(); }

  window.Sync = {
    init(a) {
      api = a;
      if (a.cfg && HOST_OK(a.cfg.url) && CODE_OK(a.cfg.code)) {
        cfg = { url: a.cfg.url.trim().replace(/\/$/, ""), code: a.cfg.code };
        try { last = JSON.parse(localStorage.getItem(LK)); } catch (e) { last = null; }
        dirty = true; run();
      }
    },
    enabled: () => !!cfg,
    config: () => cfg && Object.assign({}, cfg),
    touch() { if (!cfg) return; ver++; dirty = true; clearTimeout(deb); deb = setTimeout(cycle, 400); },
    refresh() { cycle(); },
    genCode() { const b = new Uint8Array(16); crypto.getRandomValues(b); return Array.from(b, x => "abcdefghijklmnopqrstuvwxyz0123456789"[x % 36]).join(""); },
    async start(c, confirmJoin) {
      if (!HOST_OK(c.url)) throw new Error("כתובת מסד הנתונים לא תקינה (צריכה להיות כתובת workers.dev של Cloudflare)");
      if (!CODE_OK(c.code)) throw new Error("הקוד צריך להיות 10–40 אותיות קטנות באנגלית ומספרים");
      const prev = cfg, prevLast = last;
      cfg = { url: c.url.trim().replace(/\/$/, ""), code: c.code };
      try {
        const remote = await req("GET");
        if (remote && remote.init) {
          if (confirmJoin && !confirmJoin()) { cfg = prev; return "cancel"; }
          setLast(flatRemote(remote)); api.set(unflat(remote)); dirty = false; run(); return "joined";
        }
        const cur = flat(api.get()); await req("PATCH", Object.assign({ init: true }, cur)); setLast(cur); dirty = false; run(); return "created";
      } catch (e) { cfg = prev; last = prevLast; throw e; }
    },
    stop() { cfg = null; last = null; clearInterval(iv); try { localStorage.removeItem(LK); } catch (e) { /* ignore */ } status(""); }
  };
})();
