const { chromium } = require("playwright");
(async()=>{const b=await chromium.launch();const errs=[];
const p=await (await b.newContext({viewport:{width:390,height:1500}})).newPage();p.on("pageerror",e=>errs.push(e.message));await p.route("https://api.open-meteo.com/**",r=>r.abort());
await p.goto("http://localhost:8766/index.html");await p.click("#tabs button[data-d='2']");
const card=t=>`.item:has-text('${t}')`;
const times=async()=>Object.fromEntries(await p.$$eval(".item",els=>els.map(e=>[e.querySelector("h3").textContent.trim().replace(/[🔒✅⏭✖]/g,"").trim().slice(0,12),e.querySelector(".time").firstChild.textContent.trim()])));
const drag=async(fromText,toY,steps=12)=>{const g=await p.$(card(fromText)+" .grip");const bb=await g.boundingBox();const x=bb.x+bb.width/2,y=bb.y+bb.height/2;await p.mouse.move(x,y);await p.mouse.down();await p.mouse.move(x,y-5,{steps:2});await p.mouse.move(x,toY,{steps});await p.waitForTimeout(100);return async()=>{await p.mouse.up();await p.waitForTimeout(150)}};
const rect=async t=>(await (await p.$(card(t))).boundingBox());
console.log("before:",JSON.stringify(await times()));
// 1) קולוסי (10:30) → אחרי ארוחת הצהריים (Chris Blue), לפני ספא
let lunch=await rect("Chris Blue");let up=await drag("טירת קולוסי",lunch.y+lunch.height-5);
console.log("ghost visible:",!!(await p.$(".ghost")),"| drop line:",!!(await p.$(".drop-line")));await up();
const t1=await times();console.log("after drag:",JSON.stringify(t1));
console.log("toast:",(await p.textContent("#toast")).replace(/\s+/g," ").trim());
// 2) ביטול
await p.click("#toastUndo");const t2=await times();console.log("after undo kolossi:",t2["טירת קולוסי"],"| spa:",t2["ספא או מנוח"]);
// 3) שחרור באותו מקום -> אין שינוי ואין טוסט
const kb=await rect("טירת קולוסי");up=await drag("טירת קולוסי",kb.y+kb.height/2+2,4);await up();console.log("same-place drop → toast hidden:",await p.isHidden("#toast"),"| time unchanged:",(await times())["טירת קולוסי"]);
// 4) גרירה ללשונית של ראשון
const tab=await (await p.$("#tabs button[data-d='3']")).boundingBox();
up=await drag("טירת קולוסי",tab.y+tab.height/2,15);
await p.mouse.move(tab.x+tab.width/2,tab.y+tab.height/2,{steps:6});await p.waitForTimeout(120);console.log("tab highlighted:",!!(await p.$("#tabs button.over")));await up();
console.log("now on day:",await p.$eval("#tabs button.sel",e=>e.dataset.d),"| kolossi on day3:",!!(await p.$(card("טירת קולוסי"))),"| toast:",(await p.textContent("#toast")).replace(/\s+/g," ").trim().slice(0,40));
console.log("day3 list:",JSON.stringify(await times()));
// 5) לשונית לא-יום (אריזה) — אין העברה
await p.click("#tabs button[data-d='2']");
console.log("errors:",errs);await b.close()})();
