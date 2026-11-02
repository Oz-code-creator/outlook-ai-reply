const { chromium } = require("playwright");
const mockOk = () => { for (const k of ["webkitSpeechRecognition", "SpeechRecognition"]) Object.defineProperty(window, k, { configurable: true, value: class { start() { setTimeout(() => { this.onresult({ results: [[{ transcript: "אנחנו עייפים רוצים משהו רגוע" }]] }); this.onend(); }, 100); } stop() {} } }); };
const mockNone = () => { for (const k of ["webkitSpeechRecognition", "SpeechRecognition"]) Object.defineProperty(window, k, { configurable: true, value: undefined }); };
(async () => {
  const b = await chromium.launch(); const errs = [];
  for (const [name, mock] of [["supported", mockOk], ["unsupported", mockNone]]) {
    const p = await (await b.newContext({ viewport: { width: 390, height: 800 } })).newPage(); p.on("pageerror", e => errs.push(e.message));
    await p.addInitScript(mock); await p.goto("http://localhost:8766/index.html"); await p.click("#btnAdapt");
    const vis = await p.isVisible("#adMic"); let val = "";
    if (vis) { await p.click("#adMic"); await p.waitForTimeout(400); val = await p.inputValue("#adText"); await p.click("#adMic"); await p.waitForTimeout(400); val = await p.inputValue("#adText"); }
    console.log(name, "| mic visible:", vis, "| text:", val, "|", vis ? await p.textContent("#adStatus") : "");
  }
  console.log("errors:", errs); await b.close();
})();
