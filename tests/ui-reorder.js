const { chromium } = require("playwright");
(async()=>{const b=await chromium.launch();const errs=[];
// ---------- עכבר ----------
const p=await (await b.newContext({viewport:{width:390,height:2000}})).newPage();p.on("pageerror",e=>errs.push(e.message));await p.route("https://api.open-meteo.com/**",r=>r.abort());
await p.goto("http://localhost:8766/index.html");
await p.click("#tabs button[data-d='info']");
const texts=async()=>p.$$eval(".li .tx",e=>e.map(x=>x.textContent));
const t0=await texts();
console.log("items:",t0.length,"| each row has a drag handle:",(await p.$$(".li .grip")).length===t0.length);
console.log("no arrow buttons:",(await p.$$("button[data-lmv]")).length===0);
const t2=t0;
// ---- גרירה בעכבר: השורה הראשונה לאחר השלישית ----
const grip=async n=>{const bb=await (await p.$(`.li:nth-child(${n}) .grip`)).boundingBox();return {x:bb.x+bb.width/2,y:bb.y+bb.height/2}};
const rowBox=async n=>(await (await p.$(`.li:nth-child(${n})`)).boundingBox());
const g1=await grip(1), r3=await rowBox(3);
await p.mouse.move(g1.x,g1.y);await p.mouse.down();await p.mouse.move(g1.x,g1.y+6,{steps:2});
await p.mouse.move(g1.x,r3.y+r3.height-3,{steps:12});await p.waitForTimeout(100);
console.log("mouse: ghost visible:",!!(await p.$(".ghost")),"| drop line:",!!(await p.$(".drop-line")));
await p.mouse.up();await p.waitForTimeout(150);
const t3=await texts();
console.log("mouse drag: first row moved after third:",t3[0]===t2[1]&&t3[1]===t2[2]&&t3[2]===t2[0]);
console.log("ghost cleaned up:",!(await p.$(".ghost"))&&!(await p.$(".drop-line")));
// ---- שמירה אחרי רענון ----
await p.reload();await p.click("#tabs button[data-d='info']");
console.log("order persists after reload:",JSON.stringify(await texts())===JSON.stringify(t3));
const os=await p.evaluate(()=>JSON.parse(localStorage.getItem("cyprus-trip-v1")).lists.info.map(x=>x.o));
console.log("o values unique:",new Set(os).size===os.length);
// ---- גרירה למקום הנוכחי: בלי שינוי ----
const g2=await grip(2), r2=await rowBox(2);
await p.mouse.move(g2.x,g2.y);await p.mouse.down();await p.mouse.move(g2.x,g2.y+4,{steps:2});await p.mouse.move(g2.x,r2.y+r2.height/2,{steps:4});await p.mouse.up();await p.waitForTimeout(120);
console.log("drop in place: no change:",JSON.stringify(await texts())===JSON.stringify(t3));
// ---- רשימות אחרות: בלי ידיות סידור ----
await p.click("#tabs button[data-d='pack']");
console.log("pack has no reorder controls:",(await p.$$("button[data-lmv]")).length===0&&(await p.$$(".li .grip")).length===0);
// ---------- מגע ----------
const ctx=await b.newContext({viewport:{width:390,height:2000},hasTouch:true,isMobile:true});const q=await ctx.newPage();q.on("pageerror",e=>errs.push(e.message));await q.route("https://api.open-meteo.com/**",r=>r.abort());
await q.goto("http://localhost:8766/index.html");await q.click("#tabs button[data-d='info']");
const qt=async()=>q.$$eval(".li .tx",e=>e.map(x=>x.textContent));
const q0=await qt();
const cdp=await ctx.newCDPSession(q);
const gb=await (await q.$(".li:nth-child(4) .grip")).boundingBox();const x=gb.x+gb.width/2,y=gb.y+gb.height/2;
const top=await (await q.$(".li:nth-child(1)")).boundingBox();const ty=top.y+3;
await cdp.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[{x,y}]});
for(let i=1;i<=14;i++){await cdp.send("Input.dispatchTouchEvent",{type:"touchMove",touchPoints:[{x,y:y+(ty-y)*i/14}]});await q.waitForTimeout(25)}
console.log("touch: ghost visible:",!!(await q.$(".ghost")));
await cdp.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});await q.waitForTimeout(200);
const q1=await qt();
console.log("touch drag: fourth row moved to top:",q1[0]===q0[3]&&q1[1]===q0[0]);
console.log("errors:",JSON.stringify(errs));await b.close();})();
