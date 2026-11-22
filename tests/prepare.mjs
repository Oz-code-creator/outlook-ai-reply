// מכין עותק לבדיקות: בדיקות המנגנונים נכתבו על הסידור שלפני ההחלפה בין שבת לראשון (גרסה 57).
// הסקריפט מעתיק את docs/ ל-tests/.site ואת ה-Worker ל-tests/sync-worker.mjs, ומחזיר בהם את הימים של 10 הפעילויות.
// כך החלפות עתידיות בתוכנית לא שוברות בדיקות של מנגנונים. logic.test.js ובדיקות ה-SW עובדות על הקוד החי.
import fs from "node:fs";
import path from "node:path";
const here = path.dirname(new URL(import.meta.url).pathname), root = path.join(here, "..");
const MAP = { "d2-kolossi": 2, "d2-commandaria": 2, "d2-kourion": 2, "d2-lunch": 2, "d2-spa": 2, "d3-lefkara": 3, "d3-lunch": 3, "d3-olive": 3, "d3-view": 3, "d3-rest": 3 };
const site = path.join(here, ".site");
fs.rmSync(site, { recursive: true, force: true });
fs.cpSync(path.join(root, "docs"), site, { recursive: true });

let plan = fs.readFileSync(path.join(site, "plan.js"), "utf8");
for (const [id, day] of Object.entries(MAP)) {
  const re = new RegExp(`^(    \\{ id: "${id}",[^\\n]*?\\bday: )\\d(,)`, "m");
  if (!re.test(plan)) throw new Error("item not found in plan.js: " + id);
  plan = plan.replace(re, `$1${day}$2`);
}
fs.writeFileSync(path.join(site, "plan.js"), plan);

let w = fs.readFileSync(path.join(root, "cyprus-worker", "sync-worker.js"), "utf8");
for (const [id, day] of Object.entries(MAP)) {
  const re = new RegExp(`("id":"${id}","day":)\\d`);
  if (!re.test(w)) throw new Error("item not found in worker PLAN: " + id);
  w = w.replace(re, `$1${day}`);
}
fs.writeFileSync(path.join(here, "sync-worker.mjs"), w);
console.log("test copies ready (pre-swap arrangement)");
