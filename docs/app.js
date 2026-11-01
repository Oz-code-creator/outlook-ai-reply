(() => {
  const P = window.PLAN, L = window.Logic, $ = id => document.getElementById(id);
  const KEY = "cyprus-trip-v1";
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
  const S = Object.assign({ status: {}, ov: {}, added: [], settings: {} }, load());
  const save = () => localStorage.setItem(KEY, JSON.stringify(S));
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
    const day = P.days[selDay - 1];
    const list = items.filter(i => i.day === selDay).sort((a, b) => a.start - b.start);
    const cur = n.day === selDay ? list.find(i => i.status === "pending" && i.start <= n.min && n.min < i.start + i.dur) : null;
    $("list").innerHTML = `<div class="theme">${esc(day.theme)}</div>` + (list.map(i => card(i, i === cur)).join("") || "<p class='muted'>אין פעילויות ביום הזה.</p>");
    if (!n.day) $("list").insertAdjacentHTML("afterbegin", `<p class="muted">הטיול עוד לא התחיל (מצב צפייה). אפשר להפעיל מצב הדגמה בהגדרות.</p>`);
    renderPrompt();
    renderLoc();
  }

  function card(i, isNow) {
    const nav = i.lat ? `<a class="btn" target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination=${i.lat},${i.lng}">🧭 נווט</a>` : "";
    const ta = (i.ta ? `<a class="btn" target="_blank" rel="noopener" href="${esc(i.ta)}">⭐ TripAdvisor</a>` : "") + (i.ta2 ? `<a class="btn" target="_blank" rel="noopener" href="${esc(i.ta2)}">⭐ To Piperi</a>` : "");
    const moved = (S.ov[i.id] && (S.ov[i.id].day || S.ov[i.id].start)) ? `<span class="chip">הוזז</span>` : "";
    const added = String(i.id).startsWith("add-") ? `<span class="chip">נוסף</span>` : "";
    const st = i.status === "done" ? "✅" : i.status === "skipped" ? "⏭" : "";
    const acts = i.status === "pending"
      ? `<button data-a="done" data-id="${i.id}">✅ בוצע</button><button data-a="skip" data-id="${i.id}">⏭ דילגנו</button>${i.fixed ? "" : `<button data-a="move" data-id="${i.id}">↪ הזז</button>`}${nav}${ta}`
      : `<button data-a="undo" data-id="${i.id}">↩ בטל</button>${nav}${ta}`;
    return `<article class="item ${i.type} ${i.status} ${isNow ? "now" : ""}"><div class="time">${L.fmt(i.start)}<small>${i.dur} ד׳</small></div>
      <div class="body"><h3>${st} ${esc(i.title)}${i.fixed ? " 🔒" : ""}${moved}${added}</h3>${i.notes ? `<p>${esc(i.notes)}</p>` : ""}${i.reserve ? `<p class="warn">⚠ ${esc(i.reserve)}</p>` : ""}<div class="acts">${acts}</div></div></article>`;
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

  // ---- שאלות אקטיביות: הגעה / עבר הזמן ----
  function computePrompt() {
    const n = now(); if (!n.day) return null;
    const pend = L.eff(P, S).filter(i => i.day === n.day && i.status === "pending").sort((a, b) => a.start - b.start);
    if (pos) for (const i of pend) {
      if (i.lat && L.dist(pos, i) <= (i.radius || 150) && Math.abs(n.min - i.start) <= 120 && !dismissed.has("arr" + i.id))
        return { key: "arr" + i.id, id: i.id, text: `נראה שהגעתם ל"${i.title}". סיימתם?`, acts: [["done", "✅ סיימנו"], ["later", "עוד לא"]] };
    }
    for (const i of pend) {
      if (i.start + i.dur + 20 < n.min && !dismissed.has("od" + i.id))
        return { key: "od" + i.id, id: i.id, text: `הזמן של "${i.title}" עבר. הספקתם?`, acts: [["done", "✅ כן"], ["skip", "⏭ דילגנו"], ["adapt", "🤖 התאם לי"], ["later", "אחר כך"]] };
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
    if (t.dataset.d) { selDay = +t.dataset.d; render(); return; }
    const id = t.dataset.id;
    if (t.dataset.a === "done") setStatus(id, "done");
    else if (t.dataset.a === "skip") setStatus(id, "skipped");
    else if (t.dataset.a === "undo") setStatus(id, null);
    else if (t.dataset.a === "move") openMove(id);
    else if (t.dataset.pa) {
      const a = t.dataset.pa; dismissed.add(t.dataset.key);
      if (a === "done") setStatus(id, "done"); else if (a === "skip") setStatus(id, "skipped");
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

  $("adAI").addEventListener("click", async () => {
    const st = S.settings, n = now();
    if (!st.endpoint) { $("adStatus").textContent = "צריך להגדיר כתובת שרת AI בהגדרות (⚙️). ראו README."; return; }
    $("adStatus").textContent = "Claude חושב…"; $("adAIList").innerHTML = "";
    try {
      const body = {
        now: { day: n.day, time: L.fmt(n.min), position: pos ? { lat: +pos.lat.toFixed(5), lng: +pos.lng.toFixed(5) } : null },
        days: P.days, windows: P.windows, context: P.context,
        items: L.eff(P, S).map(i => ({ id: i.id, day: i.day, start: L.fmt(i.start), dur: i.dur, type: i.type, title: i.title, fixed: !!i.fixed, status: i.status, open: i.open, close: i.close, closedDays: i.closedDays, notes: i.notes })),
        request: $("adText").value.trim()
      };
      const r = await fetch(st.endpoint, { method: "POST", headers: Object.assign({ "content-type": "application/json" }, st.token ? { "x-app-token": st.token } : {}), body: JSON.stringify(body) });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const data = await r.json();
      aiList = L.validateProposals(P, S, data.proposals);
      $("adStatus").textContent = "";
      $("adAIList").innerHTML = (data.summary ? `<div class="sum">${esc(data.summary)}</div>` : "") + (aiList.length ? proposalsHtml(aiList, "ai") : "<p class='muted'>אין הצעות תקינות. נסו לנסח אחרת.</p>");
    } catch (err) {
      $("adStatus").textContent = "שגיאה בפנייה ל-AI (" + err.message + "). בלי קליטה אפשר להשתמש בהצעות המקומיות.";
    }
  });
  $("btnAdapt").addEventListener("click", openAdapt);

  // ---- הגדרות ----
  $("stSimDay").innerHTML = P.days.map(d => `<option value="${d.n}">${d.label}</option>`).join("");
  $("btnSet").addEventListener("click", () => {
    const st = S.settings;
    $("stEndpoint").value = st.endpoint || ""; $("stToken").value = st.token || "";
    $("stSim").checked = !!st.sim; $("stSimDay").value = st.simDay || 1; $("stSimTime").value = st.simTime || "14:00";
    $("dlgSet").showModal();
  });
  $("stOk").addEventListener("click", () => {
    Object.assign(S.settings, { endpoint: $("stEndpoint").value.trim(), token: $("stToken").value.trim(), sim: $("stSim").checked, simDay: +$("stSimDay").value, simTime: $("stSimTime").value });
    if (S.settings.sim) selDay = S.settings.simDay;
    save(); render();
  });
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

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) navigator.serviceWorker.register("sw.js").catch(() => {});
  setInterval(render, 30000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) render(); });
  render();
})();
