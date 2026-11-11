const { chromium } = require("playwright");
(async()=>{const b=await chromium.launch();const errs=[];
const p=await (await b.newContext({viewport:{width:390,height:800}})).newPage();p.on("pageerror",e=>errs.push(e.message));
await p.goto("http://localhost:8766/index.html");
await p.click("#tabs button[data-d='info']");
const texts=async()=>p.$$eval(".li .tx",e=>e.map(x=>x.textContent));
const t0=await texts();
console.log("items:",t0.length);
console.log("first up disabled:",await p.$eval(".li:first-child button[data-dir='-1']",e=>e.disabled),"| last down disabled:",await p.$eval(".li:last-child button[data-dir='1']",e=>e.disabled));
// הזזת הפריט הראשון למטה
await p.click(".li:nth-child(1) button[data-dir='1']");
const t1=await texts();
console.log("first moved down:",t1[1]===t0[0]&&t1[0]===t0[1]);
// הזזת הפריט השלישי למעלה
await p.click(".li:nth-child(3) button[data-dir='-1']");
const t2=await texts();
console.log("third moved up:",t2[1]===t1[2]&&t2[2]===t1[1]);
// שמירה אחרי רענון
await p.reload();await p.click("#tabs button[data-d='info']");
const t3=await texts();
console.log("order persists after reload:",JSON.stringify(t3)===JSON.stringify(t2));
// הסדר מסונכרן דרך שדה o: ערכים עוקבים וייחודיים
const os=await p.evaluate(()=>JSON.parse(localStorage.getItem("cyprus-trip-v1")).lists.info.map(x=>x.o));
console.log("o values unique:",new Set(os).size===os.length);
// רשימות אחרות: בלי כפתורי סידור
await p.click("#tabs button[data-d='pack']");
console.log("pack has no reorder buttons:",(await p.$$("button[data-lmv]")).length===0);
console.log("errors:",JSON.stringify(errs));await b.close();})();
