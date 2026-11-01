// לוגיקה טהורה (ללא DOM) — ניתנת לבדיקה ב-Node.
(function (root) {
  const BUF = 20, SNAP = 15, TYPES = ["sight", "food", "rest", "shop", "travel"];
  const toMin = t => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  const fmt = m => String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
  const clone = o => JSON.parse(JSON.stringify(o));
  const num = v => (typeof v === "string" ? toMin(v) : v);

  function dist(a, b) { // מטרים
    const R = 6371000, r = x => x * Math.PI / 180;
    const dLat = r(b.lat - a.lat), dLng = r(b.lng - a.lng);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  function eff(P, S) {
    return P.items.concat(S.added || []).map(it => {
      const m = Object.assign({}, it, (S.ov || {})[it.id] || {});
      return Object.assign(m, { start: num(m.start), status: (S.status || {})[it.id] || "pending" });
    });
  }

  const dayLabel = (P, d) => P.days[d - 1].label;

  function findSlot(P, S, item, now) {
    const others = eff(P, S).filter(i => i.id !== item.id && i.status !== "skipped");
    for (let d = (now && now.day) || 1; d <= P.days.length; d++) {
      if ((item.closedDays || []).includes(P.days[d - 1].date)) continue;
      if (d === item.day && !(now && now.day === d)) continue;
      const [w0, w1] = P.windows[d].map(toMin);
      let lo = Math.max(w0, item.open ? toMin(item.open) : 0);
      let hi = Math.min(w1, item.close ? toMin(item.close) : 1440);
      if (item.daylight) hi = Math.min(hi, 17 * 60);
      if (now && now.day === d) lo = Math.max(lo, now.min + 20);
      lo = Math.ceil(lo / SNAP) * SNAP;
      const day = others.filter(o => o.day === d);
      for (let s = lo; s + item.dur <= hi; s += SNAP) {
        if (day.every(o => !(s < o.start + o.dur + BUF && o.start < s + item.dur + BUF))) return { day: d, start: s };
      }
    }
    return null;
  }

  function applyOps(S, ops) {
    S.ov = S.ov || {}; S.status = S.status || {}; S.added = S.added || [];
    ops.forEach(op => {
      if (op.op === "move") {
        const o = { day: op.day, start: op.start };
        if (op.dur) o.dur = op.dur;
        S.ov[op.id] = Object.assign(S.ov[op.id] || {}, o);
        if (S.status[op.id] === "skipped") delete S.status[op.id];
      } else if (op.op === "skip") S.status[op.id] = "skipped";
      else if (op.op === "done") S.status[op.id] = "done";
      else if (op.op === "add") S.added.push(Object.assign({ id: "add-" + Date.now() + "-" + S.added.length }, op.item));
    });
  }

  // לא הספקנו: פעילויות שהזמן שלהן עבר ולא סומנו → הצע להעביר
  function localProposals(P, S, now) {
    const out = [];
    if (!now || !now.day) return out;
    const sim = clone(S);
    eff(P, S).filter(i => i.day === now.day && i.status === "pending" && !i.fixed && i.type !== "rest" && i.start + i.dur < now.min - 10)
      .sort((a, b) => a.start - b.start).forEach(i => {
        const slot = findSlot(P, sim, i, now);
        const ops = slot ? [{ op: "move", id: i.id, day: slot.day, start: slot.start }] : [{ op: "skip", id: i.id }];
        out.push({
          text: slot ? `"${i.title}" לא הספקתם — להעביר ל${dayLabel(P, slot.day)} ב-${fmt(slot.start)}`
                     : `"${i.title}" לא הספקתם ואין מקום פנוי בימים הבאים — לוותר?`, ops
        });
        applyOps(sim, ops);
      });
    return out;
  }

  // מאחרים ב-delta דקות: מזיזים את מה שאחרי עד ההזמנה/טיסה הבאה
  function shiftProposal(P, S, now, delta) {
    if (!now || !now.day || !(delta > 0)) return null;
    const L = eff(P, S).filter(i => i.day === now.day && i.status === "pending" && i.start + i.dur > now.min).sort((a, b) => a.start - b.start);
    const sim = clone(S), ops = [], notes = [];
    for (let k = 0; k < L.length; k++) {
      const i = L[k];
      if (i.fixed) break;
      const nf = L.slice(k + 1).find(x => x.fixed);
      const ns = Math.ceil((i.start + delta) / SNAP) * SNAP;
      if (!nf || ns + i.dur + BUF <= nf.start) {
        ops.push({ op: "move", id: i.id, day: now.day, start: ns });
        notes.push(`${i.title} → ${fmt(ns)}`);
      } else if (i.soft) { // מנוחה: מקצרים
        const d = nf.start - BUF - ns;
        if (d >= 45) { ops.push({ op: "move", id: i.id, day: now.day, start: ns, dur: d }); notes.push(`${i.title} מתקצר ל-${d} ד׳`); }
        else { ops.push({ op: "skip", id: i.id }); notes.push(`${i.title} מבוטל`); }
      } else {
        const slot = findSlot(P, sim, i, { day: now.day, min: now.min });
        if (slot && !(slot.day === now.day && slot.start + i.dur + BUF > (nf ? nf.start : 1440))) {
          ops.push({ op: "move", id: i.id, day: slot.day, start: slot.start });
          notes.push(`${i.title} → ${dayLabel(P, slot.day)} ${fmt(slot.start)}`);
        } else { ops.push({ op: "skip", id: i.id }); notes.push(`${i.title} מבוטל`); }
      }
      applyOps(sim, [ops[ops.length - 1]]);
    }
    return ops.length ? { text: `מאחרים ${delta} דק׳: ` + notes.join("; "), ops } : null;
  }

  // אימות הצעות שמגיעות מה-AI
  function validateProposals(P, S, raw) {
    const ids = new Set(eff(P, S).map(i => i.id)), out = [];
    (Array.isArray(raw) ? raw : []).forEach(p => {
      if (!p || typeof p.text !== "string") return;
      const ops = [];
      (Array.isArray(p.ops) ? p.ops : []).forEach(o => {
        if (!o) return;
        const start = o.start == null ? NaN : (typeof o.start === "string" && /^\d{1,2}:\d{2}$/.test(o.start) ? toMin(o.start) : Number(o.start));
        const okDay = Number.isInteger(o.day) && o.day >= 1 && o.day <= P.days.length;
        const okStart = Number.isFinite(start) && start >= 0 && start < 1440;
        if (o.op === "move" && ids.has(o.id) && okDay && okStart) ops.push({ op: "move", id: o.id, day: o.day, start });
        else if (o.op === "skip" && ids.has(o.id)) ops.push({ op: "skip", id: o.id });
        else if (o.op === "add" && o.item && typeof o.item.title === "string" && TYPES.includes(o.item.type) &&
                 Number.isInteger(o.item.day) && o.item.day >= 1 && o.item.day <= P.days.length && Number.isFinite(num(o.item.start)) &&
                 o.item.dur >= 15 && o.item.dur <= 480) {
          const it = o.item;
          ops.push({ op: "add", item: { day: it.day, start: num(it.start), dur: it.dur, type: it.type, title: String(it.title).slice(0, 120),
            notes: String(it.notes || "").slice(0, 300), lat: Number.isFinite(it.lat) ? it.lat : undefined, lng: Number.isFinite(it.lng) ? it.lng : undefined } });
        }
      });
      if (ops.length) out.push({ text: p.text.slice(0, 300), ops });
    });
    return out;
  }

  const api = { toMin, fmt, dist, eff, findSlot, applyOps, localProposals, shiftProposal, validateProposals, dayLabel, clone };
  if (typeof module !== "undefined") module.exports = api; else root.Logic = api;
})(typeof window !== "undefined" ? window : globalThis);
