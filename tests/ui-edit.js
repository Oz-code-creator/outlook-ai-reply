const { chromium } = require("playwright");
const wait = ms => new Promise(r => setTimeout(r, ms));
(async()=>{const b=await chromium.launch();const errs=[];
const mk=async()=>{const c=await b.newContext({viewport:{width:390,height:800}});const p=await c.newPage();p.on("pageerror",e=>errs.push(e.message));await p.route("https://api.open-meteo.com/**",r=>r.abort());return p};
const A=await mk();let inv=null;A.on("dialog",async d=>{if(d.type()==="prompt"){inv=d.defaultValue();await d.dismiss()}else await d.accept()});
await A.goto("http://localhost:8766/index.html");
await A.click("#tabs button[data-d='4']");console.log("day4:",(await A.$$eval(".item h3",e=>e.map(x=>x.textContent.trim().slice(0,14)))).join(" | "));
await A.click("#tabs button[data-d='2']");
const card=t=>`.item:has-text('${t}')`;
// עריכה: קולוסי
await A.click(card("טירת קולוסי")+" button[data-a='edit']");
await A.fill("#mvName","קולוסי מוקדם");await A.fill("#mvTime","09:30");await A.fill("#mvDur","30");await A.click("#mvOk");
console.log("edited:",(await A.textContent(card("קולוסי מוקדם")+" .time")).replace(/\s+/g," ").trim(),"| chip:",(await A.textContent(card("קולוסי מוקדם")+" h3")).includes("שונה"));
// אזהרת חפיפה
await A.click(card("קולוסי מוקדם")+" button[data-a='edit']");await A.fill("#mvTime","11:40");await A.dispatchEvent("#mvTime","input");console.log("overlap warn:",(await A.textContent("#mvWarn")).slice(0,40));
// איפוס
await A.click("#mvReset");console.log("after reset:",(await A.textContent(card("טירת קולוסי")+" .time")).replace(/\s+/g," ").trim());
// עריכת פריט נעול (ארוחת ערב)
await A.click(card("MEZE Taverna")+" button[data-a='edit']");await A.fill("#mvTime","19:45");await A.click("#mvOk");console.log("fixed item moved:",(await A.textContent(card("MEZE Taverna")+" .time")).replace(/\s+/g," ").trim());
// ולידציה
await A.click("button[data-addday='2']");await A.click("#mvOk");console.log("validation:",(await A.textContent("#mvWarn")).trim(),"| dialog still open:",await A.isVisible("#dlgMove"));
// הוספה
await A.fill("#mvName","קפה בחוף");await A.fill("#mvTime","15:00");await A.fill("#mvDur","45");await A.selectOption("#mvType","food");await A.click("#mvOk");
console.log("added:",(await A.textContent(card("קפה בחוף")+" h3")).includes("נוסף"),"| time:",(await A.textContent(card("קפה בחוף")+" .time")).replace(/\s+/g," ").trim());
// סנכרון
await A.click("#btnSet");await A.fill("#syDb","http://localhost:8767");await A.click("#syGen");await A.click("#syStart");await A.waitForTimeout(900);await A.click("#syInvite");await wait(500);await A.keyboard.press("Escape");
const B=await mk();B.on("dialog",d=>d.accept());await B.goto(inv);await B.waitForTimeout(1500);await B.click("#tabs button[data-d='2']");
console.log("B sees edited fixed:",(await B.textContent(card("MEZE Taverna")+" .time")).replace(/\s+/g," ").trim(),"| B sees added:",await B.isVisible(card("קפה בחוף")));
// A משנה שם לפריט תוכנית ומוחק את הפעילות שנוספה
await A.click(card("אגיו אנדראו – קניות")+" button[data-a='edit']");await A.fill("#mvName","קניות במרכז");await A.click("#mvOk");
await A.click(card("קפה בחוף")+" button[data-a='edit']");await A.click("#mvDel");
await wait(7000);
console.log("B sees renamed:",await B.isVisible(card("קניות במרכז")),"| B added gone:",!(await B.isVisible(card("קפה בחוף"))).valueOf());
// הסרה מהתוכנית
await A.click(card("קוריון")+" button[data-a='edit']");await A.click("#mvDel");console.log("removed → dropped:",(await A.$$(".item.dropped")).length);
console.log("errors:",errs);await b.close()})();
