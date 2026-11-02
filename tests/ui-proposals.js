const { chromium } = require("playwright");
const wait = ms => new Promise(r => setTimeout(r, ms));
(async()=>{const b=await chromium.launch();const errs=[];const p=await (await b.newContext({viewport:{width:390,height:900}})).newPage();p.on("pageerror",e=>errs.push(e.message));await p.route("https://api.open-meteo.com/**",r=>r.abort());
await p.goto("http://localhost:8766/index.html");
await p.click("#btnSet");console.log("before sync:",(await p.textContent("#waMsg")).trim());
await p.fill("#syDb","http://localhost:8767");await p.click("#syGen");await p.click("#syStart");await p.waitForTimeout(800);
await p.keyboard.press("Escape");await p.click("#btnSet");
await p.click("summary:has-text('חיבור קבוצת וואטסאפ')");
console.log("ingest url shown:",/^http:\/\/localhost:8767\/ingest\/[a-z0-9]{16}$/.test(await p.inputValue("#waUrl")));
await p.click("#waTest");await p.waitForTimeout(900);console.log("test msg:",(await p.textContent("#waMsg")).trim());
await p.keyboard.press("Escape");
// באנר הצעה
await p.click("#tabs button[data-d='2']");await p.waitForTimeout(300);
console.log("banner:",(await p.textContent("#prompt")).replace(/\s+/g," ").trim().slice(0,70));
await p.click("#prompt button[data-pa='pap']");await p.waitForTimeout(1500);
console.log("kolossi on day2 after approve:",await p.isVisible(".item:has-text('טירת קולוסי')"));
await p.click("#tabs button[data-d='3']");console.log("kolossi on day3:",await p.isVisible(".item:has-text('טירת קולוסי')"),"| time:",(await p.textContent(".item:has-text('טירת קולוסי') .time")).replace(/\s+/g," ").trim());
console.log("banner gone:",await p.isHidden("#prompt"));
// דחייה
await p.evaluate(async()=>{const u=document.getElementById("waUrl")});
const url=await p.evaluate(()=>document.getElementById("waUrl").value);
await p.evaluate(async(u)=>{await fetch(u,{method:"POST",body:JSON.stringify({title:"שרית",text:"קולוסי סגורה גם ביום ראשון, אחרת"})})},url);
await p.evaluate(()=>document.dispatchEvent(new Event("visibilitychange")));await p.waitForTimeout(800);
console.log("2nd banner:",(await p.textContent("#prompt")).replace(/\s+/g," ").trim().slice(0,40));
await p.click("#prompt button[data-pa='prj']");await p.waitForTimeout(1200);console.log("after reject banner hidden:",await p.isHidden("#prompt"));
console.log("errors:",errs);await b.close()})();
