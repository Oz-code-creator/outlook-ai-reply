// Cloudflare Worker: מתווך בין האפליקציה ל-Claude API כדי שהמפתח לא יישאר בטלפון.
// סודות (wrangler secret put): ANTHROPIC_API_KEY, APP_TOKEN (אופציונלי). משתנה: MODEL (ברירת מחדל claude-sonnet-5-5), ALLOW_ORIGIN.
const SYSTEM = `אתה עוזר טיולים בזמן אמת לזוג בלימסול, קפריסין. תקבל JSON עם: השעה והיום הנוכחיים, מיקום (אם קיים), כל פריטי התוכנית עם סטטוס (pending/done/skipped), חלונות זמן ליום, הקשר והעדפות, ובקשה חופשית.
תפקידך להציע התאמות להמשך הטיול: להזיז פעילויות שלא הספיקו ליום אחר, לדלג, לקצר או להוסיף אפשרויות קרובות ורלוונטיות לזמן ולמיקום.
כללים:
- פריטים עם fixed=true (הזמנות, טיסות, ארוחות בוקר) לא זזים אלא אם המשתמש ביקש במפורש.
- כבד שעות פתיחה (open/close/closedDays), שקיעה בסביבות 16:45, ואל תחפוף לפריטים קיימים (השאר ~20 דקות מרווח נסיעה).
- אל תציע דבר שהוא בעבר. יום 4 (30/11) מסתיים בנסיעה לשדה — אל תעמיס עליו.
- הצעות הוספה (add) רק למקומות אמיתיים שאתה בטוח בהם; ציין בהערות לאמת שעות פתיחה. אל תמציא קואורדינטות — השמט lat/lng אם אינך בטוח.
- מקסימום 4 הצעות, קצרות, בעברית.
החזר JSON בלבד, ללא טקסט נוסף, בצורה:
{"summary":"משפט אחד","proposals":[{"text":"תיאור קצר","ops":[
 {"op":"move","id":"<id קיים>","day":1-4,"start":"HH:MM"},
 {"op":"skip","id":"<id קיים>"},
 {"op":"add","item":{"day":1-4,"start":"HH:MM","dur":15-480,"type":"sight|food|rest|shop|travel","title":"...","notes":"..."}}]}]}`;

export default {
  async fetch(req, env) {
    const cors = { "access-control-allow-origin": env.ALLOW_ORIGIN || "*", "access-control-allow-headers": "content-type,x-app-token", "access-control-allow-methods": "POST,OPTIONS" };
    if (req.method === "OPTIONS") return new Response(null, { headers: cors });
    if (req.method !== "POST") return new Response("POST only", { status: 405, headers: cors });
    if (env.APP_TOKEN && req.headers.get("x-app-token") !== env.APP_TOKEN) return new Response("unauthorized", { status: 401, headers: cors });
    let body; try { body = await req.json(); } catch { return new Response("bad json", { status: 400, headers: cors }); }
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: env.MODEL || "claude-sonnet-5-5", max_tokens: 1500, system: SYSTEM, messages: [{ role: "user", content: JSON.stringify(body) }] })
    });
    if (!r.ok) return new Response("upstream " + r.status, { status: 502, headers: cors });
    const data = await r.json();
    const text = (data.content || []).map(b => b.text || "").join("");
    const m = text.match(/\{[\s\S]*\}/);
    let out = { summary: "", proposals: [] };
    try { out = JSON.parse(m ? m[0] : text); } catch { out.summary = "התשובה לא הייתה בפורמט תקין, נסו שוב."; }
    return new Response(JSON.stringify(out), { headers: { ...cors, "content-type": "application/json" } });
  }
};
