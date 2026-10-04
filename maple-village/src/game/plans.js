// Mel's plans from Notion, for Maple's chat: the "Plans" database holds one page per quarter ("Q4 2026"), month
// ("October 2026") and week ("Week of 5 Oct 2026", Monday start). Read through the page's `mcp` capability with the
// viewer's own Notion connector: search the Plans data source for this period's title, then fetch that page.
// Results are cached by the connector layer for 30 minutes. Read-only.
import { dayKey } from "../util.js";
export const NOTION = "Notion";   // connector display name, must match the published manifest
const PLANS_DS = "collection://ccad9e3d-7bc6-415b-85f3-1f396982d597";
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function planTitles(day = dayKey()){
  const d = new Date(day + "T00:00:00Z"), y = d.getUTCFullYear(), m = d.getUTCMonth();
  const mon = new Date(d.getTime() - ((d.getUTCDay() + 6) % 7)*864e5);
  return {quarter: `Q${Math.floor(m/3) + 1} ${y}`, month: `${MONTH[m]} ${y}`, week: `Week of ${mon.getUTCDate()} ${MON[mon.getUTCMonth()]} ${mon.getUTCFullYear()}`};
}
const unwrap = r => {
  let p = r && r.payload !== undefined ? r.payload : r;
  if (typeof p === "string") { try { p = JSON.parse(p); } catch { return p; } }
  if (p && Array.isArray(p.content) && p.content[0] && typeof p.content[0].text === "string") { try { return JSON.parse(p.content[0].text); } catch { return p.content[0].text; } }
  return p;
};
const pageText = p => { const t = typeof p === "string" ? p : (p && (p.text || p.content || "")) || ""; const m = /<content>([\s\S]*?)<\/content>/.exec(String(t)); return (m ? m[1] : String(t)).replace(/\\\$/g, "$").trim(); };

// -> {level, title, text} or {level, title, error}
export async function readPlan(level, opts = {}){
  const title = planTitles()[level]; if (!title) return {level, error: "unknown level"};
  let mcp = null; try { mcp = window.claude && claude.use ? await claude.use("mcp") : null; } catch {}
  if (!mcp) return {level, title, error: "unavailable"};
  const cache = {staleTime: 30*60e3}, signal = opts.signal;
  try {
    const s = unwrap(await mcp.callTool(NOTION, "notion-search", {query: title, data_source_url: PLANS_DS, page_size: 5}, {cache, signal}));
    const list = (s && Array.isArray(s.results)) ? s.results : [];
    const hit = list.find(x => x && String(x.title || "").trim() === title) || null;
    if (!hit) return {level, title, error: "not found"};
    const page = unwrap(await mcp.callTool(NOTION, "notion-fetch", {id: hit.id || hit.url}, {cache, signal}));
    return {level, title, text: pageText(page).slice(0, 5000)};
  } catch (e) { return {level, title, error: (e && e.code) || "upstream_error"}; }
}
export const PLAN_WORDS = /\b(plan|plans|planned|quarter|q[1-4]|month|monthly|week|weekly|goal|goals|objective|priorit|focus|theme|revenue|target|on track|this week|next week)\b/i;
