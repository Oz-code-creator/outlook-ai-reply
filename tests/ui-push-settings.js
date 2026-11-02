const { chromium } = require("playwright");
(async()=>{const b=await chromium.launch();const errs=[];const ctx=await b.newContext({viewport:{width:390,height:800}});const p=await ctx.newPage();p.on("pageerror",e=>errs.push(e.message));p.on("dialog",d=>d.accept());
await p.addInitScript(()=>{
  const calls={subscribe:0,key:null,unsub:0};window.__calls=calls;let sub=null;
  const fakeSub={endpoint:"https://fcm.googleapis.com/fcm/send/fake-endpoint-123",toJSON(){return{endpoint:this.endpoint,keys:{}}},async unsubscribe(){calls.unsub++;sub=null;return true}};
  const reg={scope:location.origin+"/",pushManager:{async getSubscription(){return sub},async subscribe(o){calls.subscribe++;calls.key=o.applicationServerKey.length;sub=fakeSub;return fakeSub}},update(){}};
  Object.defineProperty(navigator,"serviceWorker",{configurable:true,value:{ready:Promise.resolve(reg),register:()=>Promise.resolve(reg),addEventListener(){}}});
  window.PushManager=window.PushManager||function(){};Notification.requestPermission=async()=>"granted";try{Object.defineProperty(Notification,"permission",{get:()=>"granted"});Object.defineProperty(Notification,"maxActions",{get:()=>2})}catch(e){}
});
await p.goto("http://localhost:8766/index.html");await p.click("#btnSet");
console.log("enable without sync:");await p.click("#pnEnable");await p.waitForTimeout(400);console.log("  msg:",await p.textContent("#pnMsg"));
await p.fill("#syDb","http://localhost:8767");await p.click("#syGen");await p.click("#syStart");await p.waitForTimeout(800);
console.log("sync:",await p.textContent("#syMsg"));
await p.click("#pnEnable");await p.waitForTimeout(800);console.log("enable msg:",await p.textContent("#pnMsg"));
console.log("subscribe calls:",JSON.stringify(await p.evaluate(()=>window.__calls)));
const cfg=await p.evaluate(async()=>{const c=await caches.open("cyprus-cfg");const r=await c.match(new URL("cfg-store",location.origin+"/").href);return r?await r.json():null});
console.log("cfg cached keys:",cfg&&Object.keys(cfg).join(","),"| hash ok:",cfg&&/^[a-f0-9]{16}$/.test(cfg.hash));
const ob=await p.evaluate(async(c)=>{const r=await fetch(`${c.url}/outbox/${c.code}/${c.hash}`);return r.json()},cfg);
console.log("outbox on server:",ob.map(x=>x.title+"["+(x.actions||[]).length+"]").join("|"));
console.log("state:",await p.evaluate(()=>Push.state()));
await p.click("#pnOff");await p.waitForTimeout(500);console.log("off:",await p.textContent("#pnMsg"),"| unsub calls:",(await p.evaluate(()=>window.__calls)).unsub,"| state:",await p.evaluate(()=>Push.state()));
console.log("errors:",errs);await b.close()})();
