const { chromium } = require("playwright");
(async()=>{const b=await chromium.launch();const errs=[];
const ctx=await b.newContext({viewport:{width:390,height:1500},hasTouch:true,isMobile:true});const p=await ctx.newPage();p.on("pageerror",e=>errs.push(e.message));await p.route("https://api.open-meteo.com/**",r=>r.abort());
await p.goto("http://localhost:8766/index.html");await p.click("#tabs button[data-d='2']");
const card=t=>`.item:has-text('${t}')`;
const snap=async()=>JSON.stringify(await p.$$eval(".item",els=>els.map(e=>e.querySelector("h3").textContent.trim().slice(0,10)+"@"+e.querySelector(".time").firstChild.textContent.trim())));
const before=await snap();
const cdp=await ctx.newCDPSession(p);
const g=await (await p.$(card("טירת קולוסי")+" .grip")).boundingBox();const x=g.x+g.width/2,y=g.y+g.height/2;
const lunch=await (await p.$(card("Chris Blue"))).boundingBox();const ty=lunch.y+lunch.height-5;
await cdp.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[{x,y}]});
for(let i=1;i<=14;i++){await cdp.send("Input.dispatchTouchEvent",{type:"touchMove",touchPoints:[{x,y:y+(ty-y)*i/14}]});await p.waitForTimeout(25)}
console.log("touch: ghost visible:",!!(await p.$(".ghost")),"| page scrolled:",await p.evaluate(()=>scrollY));
await cdp.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});await p.waitForTimeout(200);
const after=await snap();console.log("touch drag changed order:",after!==before,"| toast:",(await p.textContent("#toast")).replace(/\s+/g," ").trim().slice(0,45));
await p.click("#toastUndo");console.log("undo restores exactly:",(await snap())===before);
console.log("errors:",errs);await b.close()})();
