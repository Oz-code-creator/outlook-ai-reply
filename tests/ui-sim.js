const { chromium } = require("playwright");
(async()=>{const b=await chromium.launch();const errs=[];
const p=await (await b.newContext({viewport:{width:390,height:800}})).newPage();p.on("pageerror",e=>errs.push(e.message));
await p.goto("http://localhost:8766/index.html");
console.log("banner hidden by default:",await p.isHidden("#simBanner"));
// הפעלת מצב הדגמה
await p.evaluate(()=>localStorage.setItem("cyprus-trip-v1",JSON.stringify({settings:{sim:true,simDay:2,simTime:"10:00"}})));
await p.reload();
console.log("banner visible in demo mode:",await p.isVisible("#simBanner"));
console.log("banner text:",(await p.textContent("#simBanner")).trim());
console.log("banner is red:",await p.$eval("#simBanner",e=>getComputedStyle(e).backgroundColor==="rgb(179, 38, 30)"));
console.log("banner inside sticky header:",await p.$eval("#simBanner",e=>!!e.closest("header")));
// לחיצה פותחת הגדרות, ואפשר לכבות
await p.click("#simBanner");
console.log("click opens settings:",await p.$eval("#dlgSet",e=>e.open));
await p.uncheck("#stSim");await p.click("#stOk");await p.waitForTimeout(300);
console.log("banner hidden after turning off:",await p.isHidden("#simBanner"));
console.log("errors:",JSON.stringify(errs));await b.close();})();
