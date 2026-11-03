const { chromium } = require("playwright");
(async()=>{const b=await chromium.launch();const errs=[];
const c=await b.newContext({viewport:{width:390,height:800}});const p=await c.newPage();p.on("pageerror",e=>errs.push(e.message));
await p.goto("http://localhost:8766/index.html");
// זמן נסיעה בכרטיס
await p.click("#tabs button[data-d='3']");
const trips=await p.$$eval(".item .trip",e=>e.map(x=>x.textContent.replace(/\s+/g," ").trim()));
console.log("day 3 trip lines:",trips.length,"| lefkara:",trips[0]);
console.log("estimate label shown:",trips.every(t=>t.includes("הערכה")));
// פעילות שהוזזה: אין זמן נסיעה
await p.evaluate(()=>{const S=JSON.parse(localStorage.getItem("cyprus-trip-v1")||"{}");S.ov=S.ov||{};S.ov["d3-view"]={start:16*60};localStorage.setItem("cyprus-trip-v1",JSON.stringify(S));});
await p.reload();await p.click("#tabs button[data-d='3']");
console.log("moved item hides trip:",(await p.$$eval(".item .trip",e=>e.length))===trips.length-1);
// הדפסה
await p.evaluate(()=>{window.__printed=0;window.print=()=>{window.__printed++;};});
await p.click("#btnSet");await p.click("#stPrint");await p.waitForTimeout(500);
console.log("print called:",await p.evaluate(()=>window.__printed));
const html=await p.$eval("#printRoot",e=>e.textContent);
console.log("print has 4 days:",(await p.$$("#printRoot .pday h2")).length>=4,"| has info+pack:",html.includes("מידע שימושי")&&html.includes("רשימת אריזה"));
console.log("print has guide+alternatives:",html.includes("הדרך בתוך פאנו לפקארה")&&html.includes("אלטרנטיבות"));
console.log("print has booking marks:",html.includes("להזמין"));
console.log("no personal details in print:",!/IZ16|Arkia|ארקיע|Apollonia|עוז|שרית|בנות צעירות/.test(html));
console.log("dialog closed for print:",await p.$eval("#dlgSet",e=>!e.open));
console.log("errors:",JSON.stringify(errs));await b.close();})();
