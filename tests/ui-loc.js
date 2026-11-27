const { chromium } = require("playwright");
(async()=>{const b=await chromium.launch();const errs=[];
const c=await b.newContext({viewport:{width:390,height:800}});const p=await c.newPage();p.on("pageerror",e=>errs.push(e.message));
// מיקום מדומה: שומר את הפונקציות כדי שהבדיקה תקרא להן (הצלחה/שגיאה)
await p.addInitScript(()=>{window.__w=[];window.__cleared=0;
  navigator.geolocation.watchPosition=(ok,er)=>{window.__w.push({ok,er});return window.__w.length;};
  navigator.geolocation.clearWatch=()=>{window.__cleared++;};});
await p.goto("http://localhost:8766/index.html");
const loc=()=>p.textContent("#loc");
console.log("start:",await loc());
await p.click("#btnLoc");console.log("after click:",await loc());
await p.evaluate(()=>window.__w[0].ok({coords:{latitude:34.7,longitude:33.09}}));
console.log("with fix:",(await loc()).slice(0,20));
if(!(await loc()).includes("מיקום פעיל"))errs.push("not active after fix");
// שגיאת זמן (3) לא מכבה
await p.evaluate(()=>window.__w[0].er({code:3,message:"Timeout expired"}));
console.log("after timeout error:",(await loc()).slice(0,20));
if(!(await loc()).includes("מיקום פעיל"))errs.push("timeout turned location off");
// פתיחה מחדש: מתחדש לבד
await p.reload();await p.waitForTimeout(300);
const n=await p.evaluate(()=>window.__w.length);console.log("watch restarted after reload:",n);
if(n<1)errs.push("did not restart after reload");
// שגיאת הרשאה (1) מכבה
await p.evaluate(()=>window.__w[0].er({code:1,message:"denied"}));
console.log("after denied:",await loc());
if(!(await loc()).includes("הרשאת מיקום"))errs.push("denied message missing");
await p.reload();await p.waitForTimeout(300);
if(await p.evaluate(()=>window.__w.length)!==0)errs.push("restarted despite denied");
// כיבוי ידני נשמר
await p.click("#btnLoc");await p.click("#btnLoc");
console.log("manual on:",await p.evaluate(()=>window.__w.length));
await p.reload();await p.waitForTimeout(300);
if(await p.evaluate(()=>window.__w.length)!==0)errs.push("manual off not persisted");
console.log("manual off persisted:",(await loc()));
await b.close();console.log("errors:",JSON.stringify(errs));})();
