const { chromium } = require("playwright");
const mockOk = () => { for (const k of ["webkitSpeechRecognition", "SpeechRecognition"]) Object.defineProperty(window, k, { configurable: true, value: class { start() { setTimeout(() => { this.onresult({ results: [[{ transcript: "מטריה וגם קרם לחות, כובע" }]] }); this.onend(); }, 100); } stop() {} } }); };
const mockDenied = () => { for (const k of ["webkitSpeechRecognition", "SpeechRecognition"]) Object.defineProperty(window, k, { configurable: true, value: class { start() { setTimeout(() => { this.onerror({ error: "not-allowed" }); this.onend(); }, 50); } stop() {} } }); };
const mockNone = () => { for (const k of ["webkitSpeechRecognition", "SpeechRecognition"]) Object.defineProperty(window, k, { configurable: true, value: undefined }); };
(async () => {
  const b = await chromium.launch(); const errs = [];
  const open = async (mock) => { const c = await b.newContext({ viewport: { width: 390, height: 800 } }); const p = await c.newPage(); p.on("pageerror", e => errs.push(e.message)); await p.addInitScript(mock); await p.goto("http://localhost:8766/index.html"); await p.click("#tabs button[data-d='pack']"); return p; };
  let p = await open(mockOk);
  const n0 = (await p.$$(".li")).length; await p.click("#liMic"); await p.waitForTimeout(500);
  console.log("added:", (await p.$$(".li")).length - n0, "| hint:", await p.textContent("#liHint"));
  console.log("last items:", await p.$$eval(".li span", s => s.slice(-3).map(x => x.textContent)));
  await p.click("#tabs button[data-d='todo']"); console.log("mic on todo:", !!(await p.$("#liMic")));
  p = await open(mockDenied); await p.click("#liMic"); await p.waitForTimeout(300); console.log("denied hint:", await p.textContent("#liHint"));
  p = await open(mockNone); console.log("mic hidden when unsupported:", !(await p.$("#liMic")));
  console.log("errors:", errs); await b.close();
})();
