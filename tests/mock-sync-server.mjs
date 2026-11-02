import http from "node:http";
import worker from "./sync-worker.mjs";
const __realFetch = globalThis.fetch;
globalThis.fetch = async (u, i) => {
  if (/api\.anthropic\.com/.test(String(u))) { const b = JSON.parse(i.body), m = JSON.parse(b.messages[0].content).message || ""; // __claude mock
    const input = /קולוסי/.test(m) ? { relevant: true, proposals: [{ text: "קולוסי סגורה בשבת. להעביר לראשון ב-15:00?", ops: [{ op: "move", id: "d2-kolossi", day: 3, start: "15:00" }] }] } : { relevant: false, proposals: [] };
    return new Response(JSON.stringify({ content: [{ type: "tool_use", name: "analyze_message", input }] }), { status: 200 }); }
  return /push|fcm/.test(String(u)) ? new Response(null, { status: 201 }) : __realFetch(u, i); };
const store = new Map();
const env = { ANTHROPIC_API_KEY: "sk-test", ROOMS: { async get(k, o) { const v = store.get(k); return v === undefined ? null : JSON.parse(v); }, async put(k, v) { store.set(k, v); }, async delete(k) { store.delete(k); }, async list({ prefix }) { return { keys: [...store.keys()].filter(k => k.startsWith(prefix)).map(name => ({ name })), list_complete: true }; } } };
http.createServer(async (rq, rs) => {
  const chunks = []; for await (const c of rq) chunks.push(c);
  const body = chunks.length ? Buffer.concat(chunks) : undefined;
  const r = new Request("http://localhost:8767" + rq.url, { method: rq.method, headers: rq.headers, body: ["GET", "HEAD", "OPTIONS"].includes(rq.method) ? undefined : body });
  const res = await worker.fetch(r, env);
  const h = {}; res.headers.forEach((v, k) => { h[k] = v; });
  rs.writeHead(res.status, h); rs.end(Buffer.from(await res.arrayBuffer()));
}).listen(8767, () => console.log("sync up"));
