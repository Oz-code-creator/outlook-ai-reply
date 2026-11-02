const { chromium } = require("playwright");
const wait = ms => new Promise(r => setTimeout(r, ms));
(async()=>{const b=await chromium.launch();const errs=[];
const mk=async()=>{const c=await b.newContext({viewport:{width:390,height:800}});const p=await c.newPage();p.on("pageerror",e=>errs.push(e.message));await p.route("https://api.open-meteo.com/**",r=>r.abort());return p};
// מצב קיים: רשימת מידע ישנה (d0..d10) + פריט שהמשתמש הוסיף
const A=await mk();await A.goto("http://localhost:8766/index.html");
await A.evaluate(()=>{const old=["טיסה הלוך","טיסה חזור","מלון","צ׳ק-אין","הסעה","רכב","חירום","MEZE","Kai","קוריון","נהיגה"].map((t,i)=>({id:"d"+i,t,done:false,o:i}));old.push({id:"uMine",t:"הפריט שלי",done:false,o:99});localStorage.setItem("cyprus-trip-v1",JSON.stringify({lists:{info:old},settings:{}}))});
await A.reload();await A.click("#tabs button[data-d='info']");
const texts=await A.$$eval(".li .tx",e=>e.map(x=>x.textContent));
console.log("info count:",texts.length,"(11 -4 old +9 new +1 mine = 17)");
console.log("first:",texts[0].slice(0,40));console.log("has old flight line:",texts.some(t=>t==="טיסה הלוך"),"| has mine:",texts.includes("הפריט שלי"),"| has hotel phone link:",(await A.$$eval("a[href='tel:+35725323351']",a=>a.length))===1);
await A.click("#tabs button[data-d='todo']");console.log("todo has baggage task:",(await A.textContent(".lst")).includes("לברר מול ארקיע כבודה"));
await A.reload();await A.click("#tabs button[data-d='info']");console.log("after reload still 17:",(await A.$$(".li")).length);
// מחיקת פריט שנזרע — לא חוזר אחרי רענון
await A.click(".li .x >> nth=0");await A.reload();await A.click("#tabs button[data-d='info']");console.log("deleted seeded item stays deleted:",(await A.$$(".li")).length===16);
// התקנה חדשה
const C=await mk();await C.goto("http://localhost:8766/index.html");await C.click("#tabs button[data-d='info']");console.log("fresh install info:",(await C.$$(".li")).length,"(7 old defaults + 9 new = 16)");
console.log("errors:",errs);await b.close()})();
