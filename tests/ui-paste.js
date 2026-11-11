const { chromium } = require("playwright");
(async()=>{const b=await chromium.launch();const errs=[];
const p=await (await b.newContext({viewport:{width:390,height:800}})).newPage();p.on("pageerror",e=>errs.push(e.message));
await p.goto("http://localhost:8766/index.html");
await p.click("#tabs button[data-d='info']");
const before=(await p.$$(".li")).length;
// הדבקה של 3 שורות (אחת ארוכה מ-120 תווים)
const long="א".repeat(200);
await p.evaluate((long)=>{const el=document.getElementById("liNew");el.focus();const dt=new DataTransfer();dt.setData("text/plain","שורה ראשונה\n"+long+"\r\n\nשורה שלישית");el.dispatchEvent(new ClipboardEvent("paste",{clipboardData:dt,bubbles:true,cancelable:true}));},long);
await p.waitForTimeout(300);
const after=await p.$$eval(".li .tx",e=>e.map(x=>x.textContent));
console.log("added 3 items:",(await p.$$(".li")).length-before);
console.log("has first/third:",after.includes("שורה ראשונה")&&after.includes("שורה שלישית"));
console.log("long line kept (200 chars):",after.some(t=>t.length===200));
// הדבקת שורה בודדת לא נחסמת (נשארת בשדה)
await p.evaluate(()=>{const el=document.getElementById("liNew");const dt=new DataTransfer();dt.setData("text/plain","שורה אחת");el.dispatchEvent(new ClipboardEvent("paste",{clipboardData:dt,bubbles:true,cancelable:true}));});
console.log("single line not intercepted:",(await p.$$(".li")).length-before===3);
console.log("errors:",JSON.stringify(errs));await b.close();})();
