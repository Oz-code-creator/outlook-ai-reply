(() => {
  const P = window.PLAN, L = window.Logic, $ = id => document.getElementById(id);
  const KEY = "cyprus-trip-v1";
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
  const S = Object.assign({ status: {}, ov: {}, added: [], settings: {} }, load());
  const saveQuiet = () => localStorage.setItem(KEY, JSON.stringify(S));
  const save = () => { saveQuiet(); if (window.Sync) Sync.touch(); };
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const dismissed = new Set();
  let pos = null, watchId = null, selDay = null;

  // ---- זמן נוכחי (אמיתי או מדומה) ----
  function now() {
    const st = S.settings;
    if (st.sim) return { day: st.simDay, min: L.toMin(st.simTime || "12:00"), sim: true };
    const d = new Date(), date = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    const day = (P.days.find(x => x.date === date) || {}).n || null;
    return { day, min: d.getHours() * 60 + d.getMinutes() };
  }

  // ---- רינדור ----
  function render() {
    const n = now(), items = L.eff(P, S);
    if (!selDay) selDay = n.day || 1;
    $("tabs").innerHTML = P.days.map(d => `<button data-d="${d.n}" class="${d.n === selDay ? "sel" : ""}">${d.label.split(" ")[0]}<small>${d.label.split(" ")[1]}${n.day === d.n ? " • היום" : ""}</small></button>`).join("");
    $("tabs").insertAdjacentHTML("beforeend", `<button data-d="pack" class="${selDay === "pack" ? "sel" : ""}">🎒<small>אריזה</small></button><button data-d="todo" class="${selDay === "todo" ? "sel" : ""}">✅<small>משימות</small></button><button data-d="info" class="${selDay === "info" ? "sel" : ""}">ℹ️<small>מידע</small></button>`);
    if (typeof selDay === "string") { $("list").innerHTML = listHtml(selDay); renderPrompt(); renderLoc(); return; }
    const day = P.days[selDay - 1];
    const list = items.filter(i => i.day === selDay).sort((a, b) => a.start - b.start);
    const cur = n.day === selDay ? list.find(i => i.status === "pending" && i.start <= n.min && n.min < i.start + i.dur) : null;
    $("list").innerHTML = `<div class="theme">${esc(day.theme)}</div>${wxLine(day)}${bookWarn(day)}` + (list.map(i => card(i, i === cur)).join("") || "<p class='muted'>אין פעילויות ביום הזה.</p>");
    if (!n.day) $("list").insertAdjacentHTML("afterbegin", `<p class="muted">הטיול עוד לא התחיל (מצב צפייה). אפשר להפעיל מצב הדגמה בהגדרות.</p>`);
    renderPrompt();
    renderLoc();
  }

  function card(i, isNow) {
    const booked = !!(S.booked || {})[i.id];
    const bk = i.book ? `<button data-book="${i.id}" class="${booked ? "booked" : ""}">${booked ? "✅ הוזמן" : "☐ סמן כהוזמן"}</button>` : "";
    const nav = i.lat ? `<a class="btn" target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination=${i.lat},${i.lng}">🧭 נווט</a>` : "";
    const ta = (i.ta ? `<a class="btn" target="_blank" rel="noopener" href="${esc(i.ta)}">⭐ TripAdvisor</a>` : "") + (i.ta2 ? `<a class="btn" target="_blank" rel="noopener" href="${esc(i.ta2)}">⭐ To Piperi</a>` : "");
    const moved = (S.ov[i.id] && (S.ov[i.id].day || S.ov[i.id].start)) ? `<span class="chip">הוזז</span>` : "";
    const added = String(i.id).startsWith("add-") ? `<span class="chip">נוסף</span>` : "";
    const st = i.status === "done" ? "✅" : i.status === "skipped" ? "⏭" : i.status === "dropped" ? "✖" : "";
    const acts = i.status === "pending"
      ? `<button data-a="done" data-id="${i.id}">✅ בוצע</button><button data-a="skip" data-id="${i.id}">⏭ דילגנו</button><button data-a="drop" data-id="${i.id}">✖ ויתרנו</button>${i.fixed ? "" : `<button data-a="move" data-id="${i.id}">↪ הזז</button>`}${nav}${ta}${bk}`
      : `<button data-a="undo" data-id="${i.id}">↩ בטל</button>${nav}${ta}${bk}`;
    return `<article class="item ${i.type} ${i.status} ${isNow ? "now" : ""}"><div class="time">${L.fmt(i.start)}<small>${i.dur} ד׳</small></div>
      <div class="body"><h3>${st} ${esc(i.title)}${i.fixed ? " 🔒" : ""}${moved}${added}</h3>${i.notes ? `<p>${esc(i.notes)}</p>` : ""}${i.reserve ? `<p class="warn">⚠ ${linkify(esc(i.reserve))}</p>` : ""}<div class="acts">${acts}</div></div></article>`;
  }

  function renderLoc() {
    const el = $("loc"), n = now();
    if (!pos) { el.textContent = watchId == null ? "מיקום כבוי — לחצו 📍" : "מחפש מיקום…"; return; }
    let txt = "📍 מיקום פעיל";
    const c = L.eff(P, S).filter(i => i.status === "pending" && i.lat && (!n.day || i.day === n.day))
      .map(i => ({ i, d: L.dist(pos, i) })).sort((a, b) => a.d - b.d)[0];
    if (c) txt += ` · הכי קרוב: ${c.i.title.split(" – ")[0]} (${c.d < 1000 ? Math.round(c.d) + " מ׳" : (c.d / 1000).toFixed(1) + " ק״מ"})`;
    el.textContent = txt;
  }

  // הצעה אחרי "דילגנו": אם הזמן של הפעילות עוד לא הגיע — מציעים יום אחר; אם כבר עבר — מהיום והלאה
  function skipSlot(it) {
    const n = now(), cur = n.day ? n : null;
    const future = !cur || it.day > n.day || (it.day === n.day && it.start + it.dur > n.min);
    return L.findSlot(P, S, it, cur, future ? it.day + 1 : 0);
  }
  // ---- שאלות אקטיביות: הגעה / עבר הזמן ----
  function computePrompt() {
    const n = now(), cur = n.day ? n : null;
    S.offered = S.offered || {};
    const sk = L.eff(P, S).filter(i => i.status === "skipped" && !S.offered[i.id] && !dismissed.has("sk" + i.id)).sort((x, y) => x.day - y.day || x.start - y.start)[0];
    if (sk) {
      const slot = skipSlot(sk);
      return slot
        ? { key: "sk" + sk.id, id: sk.id, text: `דילגתם על "${sk.title}". להעביר ל${L.dayLabel(P, slot.day)} ב-${L.fmt(slot.start)}?`, acts: [["mv", "✅ כן, העבר"], ["drop", "✖ ויתרנו"], ["keep", "השאר כמדולג"]] }
        : { key: "sk" + sk.id, id: sk.id, text: `דילגתם על "${sk.title}" ואין מקום פנוי בימים הבאים. לוותר עליה?`, acts: [["drop", "✖ ויתרנו"], ["keep", "השאר כמדולג"]] };
    }
    if (!n.day) return null;
    const pend = L.eff(P, S).filter(i => i.day === n.day && i.status === "pending").sort((a, b) => a.start - b.start);
    if (pos) for (const i of pend) {
      if (i.lat && L.dist(pos, i) <= (i.radius || 150) && Math.abs(n.min - i.start) <= 120 && !dismissed.has("arr" + i.id))
        return { key: "arr" + i.id, id: i.id, text: `נראה שהגעתם ל"${i.title}". סיימתם?`, acts: [["done", "✅ סיימנו"], ["later", "עוד לא"]] };
    }
    for (const i of pend) {
      if (i.start + i.dur + 20 < n.min && !dismissed.has("od" + i.id))
        return { key: "od" + i.id, id: i.id, text: `הזמן של "${i.title}" עבר. הספקתם?`, acts: [["done", "✅ כן"], ["skip", "⏭ דילגנו"], ["drop", "✖ ויתרנו"], ["adapt", "🤖 התאם לי"], ["later", "אחר כך"]] };
    }
    return null;
  }
  let lastKey = null;
  function renderPrompt() {
    const p = computePrompt(), el = $("prompt");
    if (!p) { el.hidden = true; lastKey = null; return; }
    el.hidden = false;
    el.innerHTML = `<p>${esc(p.text)}</p><div class="acts">${p.acts.map(([a, t]) => `<button data-pa="${a}" data-key="${p.key}" data-id="${p.id}">${t}</button>`).join("")}</div>`;
    if (p.key !== lastKey) {
      lastKey = p.key;
      if (document.hidden && window.Notification && Notification.permission === "granted") new Notification("טיול קפריסין", { body: p.text });
    }
  }

  // ---- פעולות ----
  function setStatus(id, st) { if (st) S.status[id] = st; else delete S.status[id]; save(); render(); }

  document.addEventListener("click", e => {
    const t = e.target.closest("button"); if (!t) return;
    if (t.dataset.d) { selDay = /^\d+$/.test(t.dataset.d) ? +t.dataset.d : t.dataset.d; render(); return; }
    if (t.dataset.book) { S.booked = S.booked || {}; if (S.booked[t.dataset.book]) delete S.booked[t.dataset.book]; else S.booked[t.dataset.book] = true; save(); render(); return; }
    if (t.dataset.rain) {
      const d = P.days[+t.dataset.rain - 1];
      openAdapt(); $("adText").value = `צפוי גשם ב${d.label}. הצע חלופות מתוך: האגורה, מוזיאון Paradox במרינה, מתחם טחנת החרובים והספא במלון, ושמור על ההזמנות.`;
      return;
    }
    if (t.dataset.lx) { const arr = lists()[t.dataset.lx], i = arr.findIndex(x => x.id === t.dataset.lid); if (i >= 0) { arr.splice(i, 1); save(); render(); } return; }
    if (t.dataset.mic) { dictate(t.dataset.mic); return; }
    if (t.dataset.ladd) { addListItem(t.dataset.ladd); return; }
    if (t.dataset.lreset) { if (confirm("להחזיר את הרשימה לברירת המחדל? פריטים שהוספתם יימחקו.")) { S.lists[t.dataset.lreset] = mkItems(LISTS[t.dataset.lreset].def()); save(); render(); } return; }
    if (t.dataset.share) { shareState(); return; }
    const id = t.dataset.id;
    if (t.dataset.a === "done") setStatus(id, "done");
    else if (t.dataset.a === "skip") setStatus(id, "skipped");
    else if (t.dataset.a === "drop") setStatus(id, "dropped");
    else if (t.dataset.a === "undo") setStatus(id, null);
    else if (t.dataset.a === "move") openMove(id);
    else if (t.dataset.pa) {
      const a = t.dataset.pa; dismissed.add(t.dataset.key);
      const offered = () => { S.offered = S.offered || {}; S.offered[id] = 1; };
      if (a === "done") setStatus(id, "done"); else if (a === "skip") setStatus(id, "skipped");
      else if (a === "drop") { offered(); setStatus(id, "dropped"); }
      else if (a === "keep") { offered(); save(); render(); }
      else if (a === "mv") {
        const it = L.eff(P, S).find(x => x.id === id), slot = it && skipSlot(it);
        offered(); if (slot) L.applyOps(S, [{ op: "move", id, day: slot.day, start: slot.start }]); save(); render();
      }
      else if (a === "adapt") openAdapt(); else renderPrompt();
    }
  });

  // הזזה ידנית
  let movingId = null;
  function openMove(id) {
    const it = L.eff(P, S).find(x => x.id === id); movingId = id;
    $("mvTitle").textContent = "הזזה: " + it.title;
    $("mvDay").innerHTML = P.days.map(d => `<option value="${d.n}" ${d.n === it.day ? "selected" : ""}>${d.label}</option>`).join("");
    $("mvTime").value = L.fmt(it.start);
    $("dlgMove").showModal();
  }
  $("mvOk").addEventListener("click", () => {
    if (!movingId || !$("mvTime").value) return;
    L.applyOps(S, [{ op: "move", id: movingId, day: +$("mvDay").value, start: L.toMin($("mvTime").value) }]); save(); render();
  });

  // ---- התאמת תוכנית ----
  function proposalsHtml(list, cls) {
    return list.map((p, k) => `<div class="prop"><div>${esc(p.text)}</div><button class="primary" data-ap="${cls}" data-k="${k}">אשר והחל</button></div>`).join("");
  }
  let localList = [], aiList = [];
  function refreshLocal() {
    const n = now();
    $("adNow").textContent = n.day ? `עכשיו: ${P.days[n.day - 1].label}, ${L.fmt(n.min)}${n.sim ? " (הדגמה)" : ""}` : "הטיול עוד לא התחיל — ההצעות המקומיות פעילות רק בזמן הטיול.";
    localList = L.localProposals(P, S, n);
    $("adLocal").innerHTML = localList.length ? "<b>לא הספקתם:</b>" + proposalsHtml(localList, "local") : (n.day ? "<p class='muted'>הכול מסודר לפי התוכנית 👍</p>" : "");
  }
  function openAdapt() { refreshLocal(); $("adAIList").innerHTML = ""; $("adStatus").textContent = ""; if (!$("dlgAdapt").open) $("dlgAdapt").showModal(); }

  $("adShift").addEventListener("click", () => {
    const sp = L.shiftProposal(P, S, now(), +$("adDelay").value);
    if (sp) { localList.push(sp); $("adLocal").innerHTML = "<b>לא הספקתם / איחור:</b>" + proposalsHtml(localList, "local"); }
    else $("adLocal").insertAdjacentHTML("beforeend", "<p class='muted'>אין מה להזיז.</p>");
  });
  $("dlgAdapt").addEventListener("click", e => {
    const b = e.target.closest("button[data-ap]"); if (!b) return;
    const p = (b.dataset.ap === "local" ? localList : aiList)[+b.dataset.k];
    L.applyOps(S, p.ops); save(); b.closest(".prop").remove(); render();
    if (b.dataset.ap === "local") refreshLocal();
  });

  const SYSTEM = `אתה עוזר טיולים בזמן אמת לזוג בלימסול, קפריסין. תקבל JSON עם: השעה והיום הנוכחיים, מיקום (אם קיים), כל פריטי התוכנית עם סטטוס (pending/done/skipped), חלונות זמן ליום, הקשר והעדפות, ובקשה חופשית.
תפקידך להציע התאמות להמשך הטיול: להזיז פעילויות שלא הספיקו ליום אחר, לדלג, לקצר או להוסיף אפשרויות קרובות ורלוונטיות לזמן ולמיקום.
כללים:
- פריטים עם fixed=true (הזמנות, טיסות, ארוחות בוקר) לא זזים אלא אם המשתמש ביקש במפורש.
- כבד שעות פתיחה (open/close/closedDays), שקיעה בסביבות 16:45, ואל תחפוף לפריטים קיימים (השאר ~20 דקות מרווח נסיעה).
- אל תציע דבר שהוא בעבר. יום 4 (30/11) מסתיים בנסיעה לשדה — אל תעמיס עליו.
- הצעות הוספה (add) רק למקומות אמיתיים שאתה בטוח בהם; ציין בהערות לאמת שעות פתיחה. אל תמציא קואורדינטות — השמט lat/lng אם אינך בטוח.
- מקסימום 4 הצעות, קצרות, בעברית.
החזר JSON בלבד, ללא טקסט נוסף, בצורה:
{"summary":"משפט אחד","proposals":[{"text":"תיאור קצר","ops":[
 {"op":"move","id":"<id קיים>","day":1-4,"start":"HH:MM"},
 {"op":"skip","id":"<id קיים>"},
 {"op":"add","item":{"day":1-4,"start":"HH:MM","dur":15-480,"type":"sight|food|rest|shop|travel","title":"...","notes":"..."}}]}]}`;
  const STATUS_NOTE = "\nסטטוסים: pending, done (בוצע), skipped (דילגו, ייתכן שיועברו), dropped (ויתרו, אל תציע אותם שוב).";
  const TOOL = {
    name: "propose_changes",
    description: "החזרת הצעות התאמה לתוכנית הטיול",
    input_schema: {
      type: "object",
      properties: {
        summary: { type: "string", description: "משפט אחד בעברית" },
        proposals: {
          type: "array", maxItems: 4,
          items: {
            type: "object",
            properties: {
              text: { type: "string", description: "תיאור קצר בעברית" },
              ops: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    op: { type: "string", enum: ["move", "skip", "add"] },
                    id: { type: "string", description: "id קיים (move/skip)" },
                    day: { type: "integer" },
                    start: { type: "string", description: "HH:MM" },
                    item: {
                      type: "object",
                      description: "לפעולת add",
                      properties: {
                        day: { type: "integer" }, start: { type: "string" }, dur: { type: "integer" },
                        type: { type: "string", enum: ["sight", "food", "rest", "shop", "travel"] },
                        title: { type: "string" }, notes: { type: "string" }
                      },
                      required: ["day", "start", "dur", "type", "title"]
                    }
                  },
                  required: ["op"]
                }
              }
            },
            required: ["text", "ops"]
          }
        }
      },
      required: ["summary", "proposals"]
    }
  };
  async function callClaude(key, body) {
    const send = payload => fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
      body: JSON.stringify(payload)
    });
    const base = { model: "claude-sonnet-5-5", max_tokens: 4000, messages: [{ role: "user", content: JSON.stringify(body) }] };
    const apiErr = async r => {
      let msg = "";
      try { const j = await r.json(); msg = (j.error && j.error.message) || ""; } catch (e) { /* ignore */ }
      return new Error("HTTP " + r.status + (r.status === 401 ? " – המפתח שגוי" : "") + (msg ? ": " + msg.slice(0, 220) : ""));
    };
    // ניסיון 1: כלי עם מבנה מוגדר
    let r = await send(Object.assign({}, base, { system: SYSTEM + STATUS_NOTE + "\nהחזר את התשובה אך ורק דרך הכלי propose_changes.", tools: [TOOL], tool_choice: { type: "tool", name: "propose_changes" } }));
    // גיבוי: אם הבקשה נדחתה (400) — טקסט רגיל
    if (r.status === 400) r = await send(Object.assign({}, base, { system: SYSTEM + STATUS_NOTE + "\nאל תשתמש בגרשיים כפולים בתוך מחרוזות. החזר JSON תקין בלבד." }));
    if (!r.ok) throw await apiErr(r);
    const d = await r.json(), blocks = d.content || [];
    const tu = blocks.find(b => b.type === "tool_use");
    if (tu && tu.input) return tu.input;
    const text = blocks.map(b => b.text || "").join("").replace(/```(?:json)?/g, ""), m = text.match(/\{[\s\S]*\}/);
    try { return JSON.parse(m ? m[0] : text); }
    catch { throw new Error("תשובה לא תקינה (" + (d.stop_reason || "?") + "): " + text.slice(0, 80)); }
  }

  $("adAI").addEventListener("click", async () => {
    const st = S.settings, n = now();
    if (!st.apiKey && !st.endpoint) { $("adStatus").textContent = "צריך להדביק מפתח Claude בהגדרות (⚙️)."; return; }
    $("adStatus").textContent = "Claude חושב…"; $("adAIList").innerHTML = "";
    try {
      const body = {
        now: { day: n.day, time: L.fmt(n.min), position: pos ? { lat: +pos.lat.toFixed(5), lng: +pos.lng.toFixed(5) } : null },
        days: P.days, windows: P.windows, context: P.context, weather: W ? W.daily : null,
        items: L.eff(P, S).map(i => ({ id: i.id, day: i.day, start: L.fmt(i.start), dur: i.dur, type: i.type, title: i.title, fixed: !!i.fixed, status: i.status, open: i.open, close: i.close, closedDays: i.closedDays, notes: i.notes })),
        request: $("adText").value.trim()
      };
      let data;
      if (st.apiKey) data = await callClaude(st.apiKey, body);
      else {
        const r = await fetch(st.endpoint, { method: "POST", headers: Object.assign({ "content-type": "application/json" }, st.token ? { "x-app-token": st.token } : {}), body: JSON.stringify(body) });
        if (!r.ok) throw new Error("HTTP " + r.status);
        data = await r.json();
      }
      aiList = L.validateProposals(P, S, data.proposals);
      $("adStatus").textContent = "";
      $("adAIList").innerHTML = (data.summary ? `<div class="sum">${esc(data.summary)}</div>` : "") + (aiList.length ? proposalsHtml(aiList, "ai") : "<p class='muted'>אין הצעות תקינות. נסו לנסח אחרת.</p>");
    } catch (err) {
      $("adStatus").textContent = "שגיאה בפנייה ל-AI (" + err.message + "). בלי קליטה אפשר להשתמש בהצעות המקומיות.";
    }
  });
  $("btnAdapt").addEventListener("click", openAdapt);



  // ---- מזג אוויר (Open-Meteo, חינמי ובלי מפתח; זמין כ-16 יום מראש) ----
  const WK = "cyprus-weather";
  let W = null, wxNote = "";
  try { W = JSON.parse(localStorage.getItem(WK) || "null"); } catch (e) { W = null; }
  const wxIcon = c => c === 0 ? "☀️" : c <= 2 ? "🌤" : c === 3 ? "☁️" : c <= 48 ? "🌫" : c <= 57 ? "🌦" : c <= 67 ? "🌧" : c <= 77 ? "❄️" : c <= 82 ? "🌧" : "⛈";
  function wxFor(date) {
    const d = W && W.daily, i = d && d.time ? d.time.indexOf(date) : -1;
    if (i < 0) return null;
    const code = (d.weather_code || d.weathercode || [])[i];
    return { icon: wxIcon(code), max: Math.round(d.temperature_2m_max[i]), min: Math.round(d.temperature_2m_min[i]), pp: (d.precipitation_probability_max || [])[i], sum: (d.precipitation_sum || [])[i] };
  }
  function bookWarn(day) {
    const miss = L.eff(P, S).filter(i => i.day === day.n && i.book && i.status === "pending" && !(S.booked || {})[i.id]).sort((x, y) => x.start - y.start);
    return miss.length ? `<div class="bk-warn">⚠ עדיין לא הוזמן: ${miss.map(i => esc(i.title.split(" – ").pop())).join(" · ")}</div>` : "";
  }
  const rainy = w => !!w && ((w.pp || 0) >= 50 || (w.sum || 0) >= 2);
  function wxLine(day) {
    const w = wxFor(day.date);
    if (!w) return wxNote ? `<div class="muted" style="margin:0 4px 8px">${esc(wxNote)}</div>` : "";
    return `<div class="wx">${w.icon} ${w.max}°/${w.min}°${w.pp != null ? " · גשם " + w.pp + "%" : ""}${rainy(w) ? ` <button data-rain="${day.n}">☔ תוכנית גשם</button>` : ""}</div>`;
  }
  async function loadWeather() {
    if (W && Date.now() - W.ts < 3 * 3600e3) return;
    const first = P.days[0].date, last = P.days[P.days.length - 1].date;
    try {
      const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=34.68&longitude=33.04&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum&timezone=Asia%2FNicosia&start_date=${first}&end_date=${last}`);
      if (!r.ok) throw new Error("HTTP " + r.status);
      const j = await r.json(); if (!j.daily || !j.daily.time) throw new Error("no data");
      W = { ts: Date.now(), daily: j.daily }; wxNote = ""; localStorage.setItem(WK, JSON.stringify(W)); render();
    } catch (e) {
      const from = new Date(first + "T00:00:00"); from.setDate(from.getDate() - 16);
      wxNote = Date.now() < from.getTime() ? "תחזית מזג אוויר תופיע החל מ-" + from.getDate() + "/" + (from.getMonth() + 1) + " (זמינה כ-16 יום לפני)" : "";
      if (wxNote) render();
    }
  }

  // ---- רשימות: אריזה, משימות ומידע ----
  const LISTS = { pack: { title: "🎒 רשימת אריזה", def: () => P.packing }, todo: { title: "✅ משימות לפני הטיול", def: () => P.todos }, info: { title: "ℹ️ מידע שימושי", def: () => P.info, plain: true } };
  const mkItems = arr => arr.map((t, i) => ({ id: "d" + i, t, done: false, o: i }));
  function lists() {
    if (!S.lists) S.lists = {};
    for (const k of Object.keys(LISTS)) {
      if (!Array.isArray(S.lists[k])) S.lists[k] = mkItems(LISTS[k].def());
      S.lists[k].forEach((x, i) => { if (!Number.isFinite(x.o)) x.o = i; });
    }
    S.migrated = S.migrated || {};
    let changed = false;
    (P.listMigrations || []).forEach(m => {
      if (S.migrated[m.id] || !Array.isArray(S.lists[m.list])) return;
      const arr = S.lists[m.list];
      (m.remove || []).forEach(id => { const i = arr.findIndex(x => x.id === id); if (i >= 0) arr.splice(i, 1); });
      (m.add || []).forEach((x, k) => { if (!arr.some(y => y.id === x.id)) arr.splice(Math.min(k, arr.length), 0, { id: x.id, t: x.t, done: false, o: -1000 + k }); });
      S.migrated[m.id] = 1; changed = true;
    });
    if (changed) saveQuiet();
    return S.lists;
  }
  const linkify = s => s.replace(/(\+?\d[\d ]{6,}\d|\b112\b)/g, m => `<a href="tel:${m.replace(/\s/g, "")}">${m}</a>`);
  const rowHtml = (key, x) => LISTS[key].plain
    ? `<div class="li"><span class="tx">${linkify(esc(x.t))}</span><button class="x" data-lx="${key}" data-lid="${esc(x.id)}" aria-label="מחק">✕</button></div>`
    : `<div class="li ${x.done ? "done" : ""}"><label><input type="checkbox" data-lk="${key}" data-lid="${esc(x.id)}" ${x.done ? "checked" : ""}><span>${esc(x.t)}</span></label><button class="x" data-lx="${key}" data-lid="${esc(x.id)}" aria-label="מחק">✕</button></div>`;
  function listHtml(key) {
    const arr = lists()[key], done = arr.filter(x => x.done).length;
    return `<div class="theme">${LISTS[key].title}${LISTS[key].plain ? "" : " · " + done + "/" + arr.length}</div>
      <div class="lst">${arr.map(x => rowHtml(key, x)).join("") || "<p class='muted'>הרשימה ריקה.</p>"}</div>
      <div class="add"><input id="liNew" data-key="${key}" placeholder="הוסיפו פריט…" maxlength="120">${SR ? `<button class="mic" id="liMic" data-mic="${key}" aria-label="הקלטה קולית">🎤</button>` : ""}<button class="primary" data-ladd="${key}">הוסף</button></div>
      <div id="liHint" class="muted" style="margin:6px 4px"></div>
      <div class="acts" style="margin:10px 4px">${window.Sync && Sync.enabled() ? '<button data-share="1">📤 הזמן את שרית</button>' : ""}<button data-lreset="${key}">↺ ברירת מחדל</button></div>`;
  }
  function addListItem(key) {
    const inp = $("liNew"), t = inp && inp.value.trim();
    if (!t) return;
    lists()[key].push({ id: "u" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), t: t.slice(0, 120), done: false, o: Date.now() });
    save(); render(); const n = $("liNew"); if (n) n.focus();
  }

  // ---- הקלטה קולית להוספת פריטים ----
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let rec = null;
  const hint = t => { const h = $("liHint"); if (h) h.textContent = t; };
  function addSpoken(key, txt) {
    const parts = txt.split(/\s*(?:,|،|\sוגם\s|\sואחר כך\s)\s*/).map(s => s.trim()).filter(Boolean).slice(0, 10);
    if (!parts.length) { hint("לא שמעתי פריט. נסו שוב."); return; }
    parts.forEach((t, i) => lists()[key].push({ id: "u" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5) + i, t: t.slice(0, 120), done: false, o: Date.now() + i }));
    save(); render(); hint("נוסף: " + parts.join(" · "));
  }
  function dictate(key) {
    if (!SR) { hint("הדפדפן לא תומך בהקלטה קולית."); return; }
    if (rec) { rec.stop(); return; }
    const r = rec = new SR();
    r.lang = "he-IL"; r.interimResults = false; r.maxAlternatives = 1; r.continuous = false;
    const btn = $("liMic"); if (btn) btn.classList.add("rec");
    hint("מקשיבים… אמרו פריט, או כמה פריטים עם \"וגם\" ביניהם.");
    let got = false;
    r.onresult = e => { got = true; addSpoken(key, e.results[0][0].transcript.trim()); };
    r.onerror = e => { got = true; hint(e.error === "not-allowed" || e.error === "service-not-allowed" ? "אין הרשאת מיקרופון. אשרו בהגדרות הדפדפן." : e.error === "no-speech" ? "לא שמעתי כלום. נסו שוב." : "ההקלטה נכשלה (" + e.error + "). צריך חיבור לאינטרנט."); };
    r.onend = () => { rec = null; const b = $("liMic"); if (b) b.classList.remove("rec"); if (!got) hint(""); };
    try { r.start(); } catch (e) { rec = null; hint("לא ניתן להתחיל הקלטה."); }
  }
  function dictateText(inputEl, btn) {
    const msg = t => { $("adStatus").textContent = t; };
    if (!SR) { msg("הדפדפן לא תומך בהקלטה קולית."); return; }
    if (rec) { rec.stop(); return; }
    const r = rec = new SR();
    r.lang = "he-IL"; r.interimResults = false; r.maxAlternatives = 1; r.continuous = false;
    btn.classList.add("rec"); msg("מקשיבים… אפשר לדבר חופשי.");
    let got = false;
    r.onresult = e => { got = true; const t = e.results[0][0].transcript.trim(); inputEl.value = (inputEl.value.trim() ? inputEl.value.trim() + " " : "") + t; msg("הוקלט. אפשר להוסיף עוד, או ללחוץ 'בקש הצעות'."); };
    r.onerror = e => { got = true; msg(e.error === "not-allowed" || e.error === "service-not-allowed" ? "אין הרשאת מיקרופון. אשרו בהגדרות הדפדפן." : e.error === "no-speech" ? "לא שמעתי כלום. נסו שוב." : "ההקלטה נכשלה (" + e.error + "). צריך חיבור לאינטרנט."); };
    r.onend = () => { rec = null; btn.classList.remove("rec"); if (!got) msg(""); };
    try { r.start(); } catch (e) { rec = null; btn.classList.remove("rec"); msg("לא ניתן להתחיל הקלטה."); }
  }
  $("adMic").hidden = !SR;
  $("adMic").addEventListener("click", () => dictateText($("adText"), $("adMic")));
  document.addEventListener("change", e => {
    const c = e.target.closest("input[data-lk]"); if (!c) return;
    const it = lists()[c.dataset.lk].find(x => x.id === c.dataset.lid); if (it) { it.done = c.checked; save(); render(); }
  });
  document.addEventListener("keydown", e => { if (e.key === "Enter" && e.target.id === "liNew") { e.preventDefault(); addListItem(e.target.dataset.key); } });

  // ---- שיתוף עם שרית (קישור עם הרשימות והסימונים; בלי מפתח ה-API) ----
  const enc = o => btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const dec = s => JSON.parse(decodeURIComponent(escape(atob(s.replace(/-/g, "+").replace(/_/g, "/")))));
  const inviteUrl = () => { const c = Sync.config(); return location.origin + location.pathname + "#j=" + enc({ u: c.url, c: c.code }); };
  async function shareState() {
    if (!(window.Sync && Sync.enabled())) { alert("קודם מתחילים סנכרון בהגדרות (⚙️)."); return; }
    const url = inviteUrl(), text = "הצטרפי לטיול בקפריסין 🇨🇾 (פתחי את הקישור באפליקציה):";
    if (navigator.share) { try { await navigator.share({ title: "טיול לקפריסין", text, url }); return; } catch (e) { if (e && e.name === "AbortError") return; } }
    try { await navigator.clipboard.writeText(url); alert("הקישור הועתק. אפשר להדביק בוואטסאפ."); }
    catch (e) { prompt("העתיקו את הקישור:", url); }
  }
  async function joinFromLink() {
    const m = location.hash.match(/^#j=(.+)$/); if (!m) return false;
    let d; try { d = dec(m[1]); } catch (e) { d = null; }
    history.replaceState(null, "", location.pathname);
    if (!d) return true;
    try {
      const res = await Sync.start({ url: d.u, code: d.c }, () => confirm("להצטרף לסנכרון החי של הטיול? הרשימות והסימונים אצלך יוחלפו."));
      if (res !== "cancel") { S.settings.sync = Sync.config(); saveQuiet(); render(); alert("הצטרפת! מעכשיו הכול מסתנכרן."); }
    } catch (e) { alert("ההצטרפות נכשלה: " + e.message); }
    return true;
  }

  // ---- הגדרות ----
  $("stSimDay").innerHTML = P.days.map(d => `<option value="${d.n}">${d.label}</option>`).join("");
  $("btnSet").addEventListener("click", () => {
    const st = S.settings;
    $("stKey").value = st.apiKey || ""; $("stEndpoint").value = st.endpoint || ""; $("stToken").value = st.token || "";
    $("stSim").checked = !!st.sim; $("stSimDay").value = st.simDay || 1; $("stSimTime").value = st.simTime || "14:00";
    $("dlgSet").showModal();
  });
  $("stOk").addEventListener("click", () => {
    Object.assign(S.settings, { apiKey: $("stKey").value.trim(), endpoint: $("stEndpoint").value.trim(), token: $("stToken").value.trim(), sim: $("stSim").checked, simDay: +$("stSimDay").value, simTime: $("stSimTime").value });
    if (S.settings.sim) selDay = S.settings.simDay;
    save(); render();
  });
  $("stRefresh").addEventListener("click", async () => {
    try {
      if ("serviceWorker" in navigator) for (const r of await navigator.serviceWorker.getRegistrations()) await r.unregister();
      if (window.caches) for (const k of await caches.keys()) await caches.delete(k);
    } catch (e) { /* ignore */ }
    location.href = location.pathname + "?fresh=" + Date.now();
  });
  const syMsg = t => { $("syMsg").textContent = t; };
  function fillSync() {
    const c = S.settings.sync; $("syDb").value = c ? c.url : ""; $("syCode").value = c ? c.code : "";
    syMsg(c ? "סנכרון פעיל." : "לא מחובר. ראו הוראות הקמה ב-README.");
  }
  $("btnSet").addEventListener("click", fillSync);
  const pnMsg = t => { $("pnMsg").textContent = t; };
  async function fillPush() { pnMsg("מצב: " + (window.Push ? await Push.state() : "לא נתמך")); }
  $("btnSet").addEventListener("click", fillPush);
  $("pnEnable").addEventListener("click", async () => { pnMsg("מפעיל…"); try { await Push.enable(); pnMsg("ההתראות הופעלו ✅ " + await Push.state() + ". לחצו 'שלח בדיקת התראה'."); } catch (e) { pnMsg("שגיאה: " + e.message); } });
  $("pnTest2").addEventListener("click", async () => { pnMsg("שולח…"); try { await Push.test(true); pnMsg("נשלחה בדיקת התראה. " + await Push.state()); } catch (e) { pnMsg("שגיאה: " + e.message); } });
  $("pnOff").addEventListener("click", async () => { try { await Push.disable(); pnMsg("כובו במכשיר הזה."); } catch (e) { pnMsg("שגיאה: " + e.message); } });
  $("syGen").addEventListener("click", () => { $("syCode").value = Sync.genCode(); });
  $("syStart").addEventListener("click", async () => {
    syMsg("מתחבר…");
    try {
      const res = await Sync.start({ url: $("syDb").value.trim(), code: $("syCode").value.trim().toLowerCase() }, () => confirm("החדר כבר קיים. להצטרף ולהחליף את הרשימות והסימונים אצלך?"));
      if (res === "cancel") { syMsg("בוטל."); return; }
      S.settings.sync = Sync.config(); saveQuiet(); syMsg(res === "created" ? "נוצר סנכרון חדש ✅. לחצו 'הזמן את שרית'." : "הצטרפת לסנכרון ✅"); render();
    } catch (e) { syMsg("שגיאה: " + e.message); }
  });
  $("syStop").addEventListener("click", () => { Sync.stop(); delete S.settings.sync; saveQuiet(); syMsg("הסנכרון הופסק. הנתונים נשארו אצלך."); });
  $("syInvite").addEventListener("click", () => { if (!Sync.enabled()) { syMsg("קודם התחילו סנכרון."); return; } shareState(); });
  $("stReset").addEventListener("click", () => {
    if (!confirm("לאפס את כל הסימונים וההזזות?")) return;
    S.status = {}; S.ov = {}; S.added = []; save(); dismissed.clear(); $("dlgSet").close(); render();
  });

  // ---- מיקום ----
  $("btnLoc").addEventListener("click", () => {
    if (!navigator.geolocation) { $("loc").textContent = "אין תמיכה במיקום בדפדפן"; return; }
    if (watchId != null) { navigator.geolocation.clearWatch(watchId); watchId = null; pos = null; render(); return; }
    if (window.Notification && Notification.permission === "default") Notification.requestPermission();
    watchId = navigator.geolocation.watchPosition(
      p => { pos = { lat: p.coords.latitude, lng: p.coords.longitude }; render(); },
      err => { watchId = null; $("loc").textContent = "אין גישה למיקום (" + err.message + ")"; },
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 30000 });
    renderLoc();
  });

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) navigator.serviceWorker.register("sw.js").then(r => r.update()).catch(() => {});
  if ("serviceWorker" in navigator) navigator.serviceWorker.addEventListener("message", e => { if (e.data && e.data.type === "status-changed" && window.Sync) Sync.refresh(); });
  setInterval(() => { if (rec || (document.activeElement && document.activeElement.id === "liNew")) return; render(); }, 30000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) render(); });
  Sync.init({
    cfg: S.settings.sync, days: P.days.length,
    get: () => { lists(); return { lists: S.lists, status: S.status, ov: S.ov, added: S.added, booked: S.booked || {} }; },
    set: st => { S.lists = st.lists; S.status = st.status; S.ov = st.ov; S.added = st.added; S.booked = st.booked || {}; saveQuiet(); if (!(document.activeElement && document.activeElement.id === "liNew")) render(); },
    onStatus: t => { const el = $("syncSt"); if (el) el.textContent = t ? " · " + t : ""; }
  });
  joinFromLink().then(() => render());
  loadWeather();
  render();
})();
