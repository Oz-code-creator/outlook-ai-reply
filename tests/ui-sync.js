const { chromium } = require("playwright");
const wait = ms => new Promise(r => setTimeout(r, ms));
(async()=>{const b=await chromium.launch();const errs=[];
const mk=async()=>{const c=await b.newContext({viewport:{width:390,height:800}});const p=await c.newPage();p.on("pageerror",e=>errs.push(e.message));return p};
const A=await mk(); let inv=null;
A.on("dialog",async d=>{ if(d.type()==="prompt"){inv=d.defaultValue();await d.dismiss()} else await d.accept()});
await A.goto("http://localhost:8766/index.html");
await A.click("#btnSet");
await A.fill("#syDb","http://localhost:8767");await A.click("#syGen");await A.click("#syStart");await A.waitForTimeout(800);
console.log("A msg:",await A.textContent("#syMsg"));
await A.click("#syInvite");await wait(600);
console.log("invite:",inv?inv.slice(0,70)+"…":null);
await A.keyboard.press("Escape");
// שינויים ב-A
await A.click("#tabs button[data-d='pack']");await A.fill("#liNew","מטריה");await A.press("#liNew","Enter");
await A.click(".li .x >> nth=1"); // מחיקת פריט
await A.click("#tabs button[data-d='1']");await A.click("button[data-a='done'] >> nth=0");
await wait(1500);
// B מצטרף
const B=await mk();B.on("dialog",d=>d.accept());
await B.goto(inv);await B.waitForTimeout(1500);
await B.click("#tabs button[data-d='pack']");
const txt=await B.textContent(".lst");
console.log("B items:",(await B.$$(".li")).length,"has מטריה:",txt.includes("מטריה"),"(A deleted one → 14)");
await B.click("#tabs button[data-d='1']");console.log("B done items:",(await B.$$(".item.done")).length);
// B משנה → A רואה
await B.click("#tabs button[data-d='todo']");await B.click(".li input >> nth=0");await B.click("#tabs button[data-d='1']");await B.click("button[data-a='skip'] >> nth=1");
await wait(7000);
await A.click("#tabs button[data-d='todo']");console.log("A sees todo checked:",await A.$$eval(".li.done",e=>e.length));
await A.click("#tabs button[data-d='1']");console.log("A skipped items:",(await A.$$(".item.skipped")).length,"| status text:",(await A.textContent("#syncSt")).trim());
// רענון ושימור
await A.reload();await A.waitForTimeout(1500);await A.click("#tabs button[data-d='pack']");console.log("A after reload items:",(await A.$$(".li")).length);
console.log("errors:",errs);await b.close()})();
