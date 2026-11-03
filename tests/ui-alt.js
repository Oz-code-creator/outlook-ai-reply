const { chromium } = require("playwright");
(async()=>{const b=await chromium.launch();const errs=[];
const c=await b.newContext({viewport:{width:390,height:800}});const p=await c.newPage();p.on("pageerror",e=>errs.push(e.message));
await p.goto("http://localhost:8766/index.html");
console.log("alt tab present:",(await p.$$("#tabs button[data-d='alt']")).length);
await p.click("#tabs button[data-d='alt']");
console.log("cards:",(await p.$$(".gstop")).length,"(expect 2)");
console.log("food group heading:",(await p.textContent("#list")).includes("מסעדות"),"| no empty sights group:",!(await p.textContent("#list")).includes("אתרים"));
console.log("each has fit line:",(await p.$$(".afit")).length===2,"| fit mentions Mazema:",(await p.textContent("#list")).includes("Mazema"));
console.log("phone tel links:",(await p.$$eval(".gstop a[href^='tel:']",a=>a.map(x=>x.getAttribute("href")))).join(","));
console.log("garden check warning:",(await p.textContent("#list")).includes("לוודא שזו המסעדה"));
// הוסף ללוח
await p.click("button[data-altadd='alt-oldnb']");
console.log("dialog name:",await p.inputValue("#mvName"),"| type:",await p.inputValue("#mvType"),"| dur:",await p.inputValue("#mvDur"));
await p.selectOption("#mvDay","1");await p.fill("#mvTime","21:30");await p.click("#mvOk");
await p.click("#tabs button[data-d='1']");
const day1=await p.$$eval(".item h3",h=>h.map(x=>x.textContent));
console.log("added to day 1:",day1.some(t=>t.includes("Old Neighbourhood")));
console.log("notes carried:",(await p.textContent("#list")).includes("25376082"));
// הפריט 💡 הוסר מרשימת המשימות
await p.click("#tabs button[data-d='todo']");
console.log("todo has no tavern idea:",!(await p.textContent("#list")).includes("Old Neighbourhood"));
// יום 2: Commandaria בין קולוסי לקוריון
await p.click("#tabs button[data-d='2']");
const t2=await p.$$eval(".item h3",h=>h.map(x=>x.textContent));
const iK=t2.findIndex(t=>t.includes("קולוסי")),iC=t2.findIndex(t=>t.includes("Commandaria")),iR=t2.findIndex(t=>t.includes("קוריון"));
console.log("day 2 order kolossi<commandaria<kourion:",iK>=0&&iK<iC&&iC<iR);
console.log("errors:",JSON.stringify(errs));await b.close();})();
