// מעדכן את קטע ה-PLAN בתוך sync-worker.js לפי docs/plan.js. הרצה: node cyprus-worker/build-plan.mjs
import fs from "node:fs";
globalThis.window = {};
await import("../docs/plan.js");
const P = window.PLAN;
const compact = {
  days: P.days.map(d => ({ n: d.n, date: d.date, label: d.label })),
  items: P.items.map(i => ({ id: i.id, day: i.day, start: i.start, dur: i.dur, type: i.type, title: i.title, fixed: !!i.fixed, lat: i.lat, lng: i.lng }))
};
const f = new URL("./sync-worker.js", import.meta.url);
let src = fs.readFileSync(f, "utf8");
src = src.replace(/\/\/ PLAN-BEGIN[\s\S]*?\/\/ PLAN-END/, "// PLAN-BEGIN\nconst PLAN = " + JSON.stringify(compact) + ";\n// PLAN-END");
fs.writeFileSync(f, src);
console.log("plan embedded:", compact.items.length, "items");
