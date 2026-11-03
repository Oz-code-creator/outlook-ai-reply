import http from "node:http";
import worker from "./sync-worker.mjs";
const __realFetch = globalThis.fetch;
globalThis.fetch = async (u, i) => {
  return /push|fcm/.test(String(u)) ? new Response(null, { status: 201 }) : __realFetch(u, i); };
const store = new Map();
const env = { ROOMS: { async get(k, o) { const v = store.get(k); return v === undefined ? null : JSON.parse(v); }, async put(k, v) { store.set(k, v); }, async delete(k) { store.delete(k); }, async list({ prefix }) { return { keys: [...store.keys()].filter(k => k.startsWith(prefix)).map(name => ({ name })), list_complete: true }; } } };
http.createServer(async (rq, rs) => {
  const chunks = []; for await (const c of rq) chunks.push(c);
  const body = chunks.length ? Buffer.concat(chunks) : undefined;
  const r = new Request("http://localhost:8767" + rq.url, { method: rq.method, headers: rq.headers, body: ["GET", "HEAD", "OPTIONS"].includes(rq.method) ? undefined : body });
  const res = await worker.fetch(r, env);
  const h = {}; res.headers.forEach((v, k) => { h[k] = v; });
  rs.writeHead(res.status, h); rs.end(Buffer.from(await res.arrayBuffer()));
}).listen(8767, () => console.log("sync up"));
