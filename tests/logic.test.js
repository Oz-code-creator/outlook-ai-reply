global.window = {}; require("/home/user/outlook-ai-reply/docs/plan.js");
const L = require("/home/user/outlook-ai-reply/docs/logic.js"); const P = window.PLAN;
const assert = require("assert");
let S = { status: {}, ov: {}, added: [] };
// שבת 17:00: לא הספקנו קולוסי+קוריון
let now = { day: 2, min: L.toMin("17:00") };
let ps = L.localProposals(P, S, now); console.log(ps.map(p => p.text));
assert(ps.length === 4); // קולוסי, Commandaria, קוריון, צהריים
// קולוסי/קוריון נסגרים ב-17:00 ולכן בראשון בבוקר? יום 3 חלון 10:00 — לפקארה תופסת 11:00-13:15
ps.forEach(p => L.applyOps(S, p.ops));
// בדיקת אי-חפיפה בכל יום
const E = L.eff(P, S).filter(i => i.status !== "skipped");
for (const a of E) for (const b of E) if (a.id < b.id && a.day === b.day && !(a.type==="rest"&&a.soft) && !(b.type==="rest"&&b.soft))
  assert(!(a.start < b.start + b.dur && b.start < a.start + a.dur), `overlap ${a.id} ${b.id}`);
// MEZE לא עובר לראשון
S = { status: {}, ov: {}, added: [] };
const meze = P.items.find(i => i.id === "d2-dinner");
const slot = L.findSlot(P, S, Object.assign({}, meze, { fixed: false, start: L.toMin(meze.start) }), { day: 2, min: L.toMin("21:00") });
console.log("meze slot", slot); assert(!slot || slot.day !== 3);
// איחור של 60 דקות ביום 1 ב-14:30
S = { status: { "d1-lunch": "done" }, ov: {}, added: [] };
const sp = L.shiftProposal(P, S, { day: 1, min: L.toMin("14:30") }, 60); console.log(sp.text);
assert(sp.ops.every(o => o.op !== "move" || o.start + 0 > 0));
// אימות AI
const v = L.validateProposals(P, S, [{ text: "x", ops: [{ op: "move", id: "nope", day: 1, start: "10:00" }, { op: "move", id: "d1-port", day: 9, start: "10:00" }, { op: "skip", id: "d1-port" }, { op: "add", item: { title: "קפה", type: "food", day: 1, start: "17:00", dur: 45 } }] }, { text: 3 }]);
console.log(JSON.stringify(v)); assert(v.length === 1 && v[0].ops.length === 2);
console.log("dist", Math.round(L.dist({lat:34.6727,lng:33.0431},{lat:34.6743,lng:33.0475})));
console.log("OK");
