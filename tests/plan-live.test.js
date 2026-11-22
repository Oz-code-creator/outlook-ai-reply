// בודק את התוכנית החיה (docs/plan.js): הסידור של שבת וראשון אחרי ההחלפה (גרסה 57), בלי חפיפות, עם זמני נסיעה ושעות פתיחה.
const assert = require("assert"), fs = require("fs"), path = require("path");
global.window = {}; eval(fs.readFileSync(path.join(__dirname, "..", "docs", "plan.js"), "utf8"));
const P = window.PLAN, mm = t => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
const ids = d => P.items.filter(i => i.day === d).map(i => i.id).sort();
assert.deepStrictEqual(ids(2), ["d2-bf", "d2-dinner", "d3-lefkara", "d3-lunch", "d3-olive", "d3-rest", "d3-view"].sort(), "שבת = יום לפקארה + MEZE");
assert.deepStrictEqual(ids(3), ["d2-commandaria", "d2-kolossi", "d2-kourion", "d2-lunch", "d2-spa", "d3-bf", "d3-dinner"].sort(), "ראשון = קולוסי וקוריון + Kai Sushi");
assert.match(P.days[1].theme, /לפקארה/); assert.match(P.days[2].theme, /קולוסי/);
for (const d of P.days) {
  const items = P.items.filter(i => i.day === d.n).sort((a, b) => mm(a.start) - mm(b.start));
  items.forEach((i, k) => {
    const s = mm(i.start), e = s + i.dur;
    if (i.close) assert.ok(e <= mm(i.close), `${i.id} נגמר אחרי שעת הסגירה`);
    if (i.open) assert.ok(s >= mm(i.open), `${i.id} מתחיל לפני שעת הפתיחה`);
    assert.ok(!(i.closedDays || []).includes(d.date), `${i.id} סגור ב-${d.date}`);
    const next = items[k + 1]; if (!next) return;
    assert.ok(mm(next.start) - e >= 0, `חפיפה: ${i.id} ← ${next.id}`);
  });
}
// נסיעות קריטיות בימים שהוחלפו (לפי שדה trip, שהוא הערכה):
const it = id => P.items.find(i => i.id === id), end = i => mm(i.start) + i.dur, gap = (a, b) => mm(it(b).start) - end(it(a));
assert.ok(gap("d3-view", "d3-rest") >= it("d3-rest").trip[0], "מהתצפית למלון לפני החשכה: מספיק זמן נסיעה");
assert.ok(gap("d3-rest", "d2-dinner") >= it("d2-dinner").trip[0] + 5, "מהמנוחה ל-MEZE: זמן נסיעה ועוד כמה דקות");
assert.ok(gap("d2-lunch", "d2-spa") >= it("d2-spa").trip[0], "מ-Chris Blue לספא: זמן נסיעה");
assert.ok(gap("d2-spa", "d3-dinner") >= it("d3-dinner").trip[0], "מהספא ל-Kai Sushi: זמן נסיעה");
assert.ok(end(it("d3-view")) <= mm("16:00"), "עוזבים את לפקארה עד 15:45-16:00, לפני החשכה");
// אחרי ההחלפה אין התייחסות ישנה לימים בהערות
assert.ok(!/לפקארה ביום ראשון/.test(JSON.stringify(P.context)), "הקשר ישן");
const migs = P.listMigrations.find(m => m.id === "m12"); assert.ok(migs && migs.remove.includes("d4") && migs.remove.includes("m8-a"), "מיגרציית המשימות של ההחלפה");
console.log("PLAN LIVE OK");
