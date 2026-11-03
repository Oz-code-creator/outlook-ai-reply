const { chromium } = require("playwright");
(async()=>{const b=await chromium.launch();const errs=[];const p=await (await b.newContext({viewport:{width:390,height:800}})).newPage();p.on("pageerror",e=>errs.push(e.message));
await p.goto("http://localhost:8766/index.html");
await p.evaluate(()=>localStorage.setItem("cyprus-trip-v1",JSON.stringify({status:{"d3-olive":"dropped","d3-view":"dropped"},settings:{sim:true,simDay:2,simTime:"08:00"}})));await p.reload();
await p.click("#tabs button[data-d='2']");
// דילגנו על קולוסי
await p.click(".item:has-text('טירת קולוסי') button[data-a='skip']");
console.log("prompt:",(await p.textContent("#prompt")).replace(/\s+/g," "));
await p.click("#prompt button[data-pa='mv']");
console.log("after mv prompt hidden:",await p.isHidden("#prompt"),"| kolossi still on day2:",(await p.textContent("#list")).includes("קולוסי"));
await p.click("#tabs button[data-d='3']");console.log("kolossi on day3:",(await p.textContent("#list")).includes("קולוסי"),"moved chip:",(await p.textContent("#list")).includes("הוזז"));
// ויתרנו
await p.click("#tabs button[data-d='2']");
await p.click(".item:has-text('קוריון') button[data-a='drop']");
console.log("dropped count:",(await p.$$(".item.dropped")).length,"prompt hidden:",await p.isHidden("#prompt"));
// דילגנו -> השאר כמדולג
await p.click(".item:has-text('אגיו אנדראו – קניות') button[data-a='skip']");
console.log("prompt2:",(await p.textContent("#prompt")).replace(/\s+/g," ").slice(0,70));
await p.click("#prompt button[data-pa='keep']");
console.log("skipped count:",(await p.$$(".item.skipped")).length,"prompt hidden:",await p.isHidden("#prompt"));
// בטל
await p.click(".item.dropped button[data-a='undo']");console.log("after undo dropped:",(await p.$$(".item.dropped")).length);
console.log("errors:",errs);await b.close()})();
