const { chromium } = require("playwright");
const wx = { daily: { time: ["2026-11-27","2026-11-28","2026-11-29","2026-11-30"], weather_code: [0,63,3,1], temperature_2m_max: [22.4,19.2,21,23], temperature_2m_min: [16.6,15.1,14,17], precipitation_probability_max: [10,80,30,5], precipitation_sum: [0,6.5,0.4,0] } };
(async()=>{const b=await chromium.launch();const errs=[];
const open=async(route)=>{const c=await b.newContext({viewport:{width:390,height:800}});const p=await c.newPage();p.on("pageerror",e=>errs.push(e.message));await p.route("https://api.open-meteo.com/**",route);await p.goto("http://localhost:8766/index.html");return p};
// --- תחזית זמינה
let p=await open(r=>r.fulfill({status:200,contentType:"application/json",headers:{"access-control-allow-origin":"*"},body:JSON.stringify(wx)}));
await p.waitForTimeout(600);
await p.click("#tabs button[data-d='1']");console.log("day1 wx:",(await p.textContent(".wx")).trim());
await p.click("#tabs button[data-d='2']");console.log("day2 wx:",(await p.textContent(".wx")).replace(/\s+/g," ").trim());
await p.click("button[data-rain='2']");await p.waitForTimeout(200);console.log("rain prefill:",(await p.inputValue("#adText")).slice(0,60),"| dialog open:",await p.isVisible("#dlgAdapt"));
await p.keyboard.press("Escape");
await p.click("#tabs button[data-d='3']");console.log("day3 has rain button:",!!(await p.$("button[data-rain]")));
// --- payload ל-Claude כולל מזג אוויר
let body=null;await p.route("https://api.anthropic.com/**",async r=>{body=JSON.parse(JSON.parse(r.request().postData()).messages[0].content);await r.fulfill({status:200,contentType:"application/json",headers:{"access-control-allow-origin":"*"},body:JSON.stringify({content:[{type:"tool_use",name:"propose_changes",input:{summary:"ok",proposals:[]}}]})})});
await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem("cyprus-trip-v1")||"{}");s.settings=Object.assign(s.settings||{},{apiKey:"sk-ant-T"});localStorage.setItem("cyprus-trip-v1",JSON.stringify(s))});await p.reload();await p.waitForTimeout(500);
await p.click("#btnAdapt");await p.click("#adAI");await p.waitForTimeout(600);console.log("claude payload has weather:",!!(body&&body.weather&&body.weather.time.length===4));
// --- בלי תחזית (400) -> הודעה
let q=await open(r=>r.fulfill({status:400,contentType:"application/json",headers:{"access-control-allow-origin":"*"},body:JSON.stringify({error:true,reason:"out of range"})}));
await q.waitForTimeout(600);await q.click("#tabs button[data-d='1']");console.log("no-forecast note:",(await q.textContent("#list")).includes("תחזית מזג אוויר תופיע"));
// --- טאב מידע
p=await open(r=>r.abort());await p.click("#tabs button[data-d='info']");
const rows=(await p.$$(".li")).length;console.log("info rows:",rows,"| no checkboxes:",(await p.$$("input[type=checkbox]")).length===0);
console.log("tel links:",await p.$$eval("a[href^='tel:']",as=>as.map(a=>a.getAttribute("href"))));
await p.fill("#liNew","מלון: טלפון +357 25 123456");await p.press("#liNew","Enter");console.log("after add:",(await p.$$(".li")).length,"links:",(await p.$$("a[href^='tel:']")).length);
await p.click(".li .x >> nth=0");console.log("after delete:",(await p.$$(".li")).length);
console.log("errors:",errs);await b.close()})();
