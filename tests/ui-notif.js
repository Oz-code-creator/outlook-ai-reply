const { chromium } = require("playwright");
(async()=>{const b=await chromium.launch();const errs=[];
const mk=async()=>{const c=await b.newContext({viewport:{width:390,height:800}});const p=await c.newPage();p.on("pageerror",e=>errs.push(e.message));return p};
const A=await mk(); let inv=null;
A.on("dialog",async d=>{ if(d.type()==="prompt"){inv=d.defaultValue();await d.dismiss()} else await d.accept()});
await A.goto("http://localhost:8766/index.html");
await A.click("#btnSet");await A.click("summary:has-text('זמני התראות')");
console.log("defaults:",await A.inputValue("#ntMorning"),await A.inputValue("#ntLead"),await A.inputValue("#ntFood"),await A.inputValue("#ntAfter"));
console.log("msg without sync:",(await A.textContent("#ntMsg")).includes("סנכרון"));
await A.fill("#syDb","http://localhost:8767");await A.click("#syGen");await A.click("#syStart");await A.waitForTimeout(800);
await A.click("#syInvite");await A.waitForTimeout(600);
await A.fill("#ntMorning","09:30");await A.dispatchEvent("#ntMorning","change");
await A.fill("#ntLead","40");await A.dispatchEvent("#ntLead","change");
await A.fill("#ntAfter","999");await A.dispatchEvent("#ntAfter","change");
console.log("after clamp:",await A.inputValue("#ntAfter"),"(expect 120)");
await A.waitForTimeout(1500);
// שרת: הערכים נשמרו בחדר
const room=await (await fetch("http://localhost:8767/rooms/"+(await A.evaluate(()=>Sync.config().code))+".json")).json();
console.log("server notif:",JSON.stringify(room.notif));
// B מצטרף ורואה את אותם ערכים
const B=await mk();B.on("dialog",d=>d.accept());
await B.goto(inv);await B.waitForTimeout(1500);
await B.click("#btnSet");await B.click("summary:has-text('זמני התראות')");
console.log("B sees:",await B.inputValue("#ntMorning"),await B.inputValue("#ntLead"),await B.inputValue("#ntFood"),await B.inputValue("#ntAfter"));
// איפוס
await B.click("#ntDefault");await B.waitForTimeout(7000);
console.log("A after reset by B:",await A.inputValue("#ntMorning"),await A.inputValue("#ntLead"),await A.inputValue("#ntAfter"));
console.log("errors:",JSON.stringify(errs));await b.close();})();
