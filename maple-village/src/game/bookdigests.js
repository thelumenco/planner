// Mel's morning book digests in the library (round 293, Mel: "They come every morning as my skill but I don't get to
// read it. I want to be able to go to the library to read my digests"). Her book-digest skill files each one as a row
// in the Book Digests database in Notion (the five insights as H3s, "Your one move today", her journal and her
// highlights). Juniper's shelf lists them, newest first, and opens one in the notebook. Read through the page's `mcp`
// capability with Mel's own Notion connector (10-minute cache). Read-only; no hourly ration for these.
import { NOTION } from "./plans.js";
const BOOK_DS = "collection://21f2e1e3-6461-48c3-a2fb-1c3cab6dc9af";
export const bd = {list: null, busy: false, error: "", opening: ""};
const ERR = {unavailable: "Notion isn't reachable from this view.", needs_reauth: "Notion needs reconnecting: claude.ai Settings → Connectors.",
  server_not_connected: "Add the Notion connector in claude.ai Settings → Connectors.", not_in_manifest: "Notion is switched off for this page. Turn it on in the page's Permissions."};
const unwrap = r => { let p = r && r.payload !== undefined ? r.payload : r; if (typeof p === "string") { try { p = JSON.parse(p); } catch { return p; } }
  if (p && Array.isArray(p.content) && p.content[0] && typeof p.content[0].text === "string") { try { return JSON.parse(p.content[0].text); } catch { return p.content[0].text; } } return p; };
async function mcp(){ try { return window.claude && claude.use ? await claude.use("mcp") : null; } catch { return null; } }
const cache = {staleTime: 10*60e3};
const clean = s => String(s || "").replace(/<br\s*\/?>/g, "\n").replace(/<[^>]+>/g, "").replace(/\\\$/g, "$").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();

// the shelf's list: two searches of the Book Digests data source, merged, newest edited first
export async function loadMyDigests(rerender){
  if (bd.busy) return; bd.busy = true; bd.error = ""; rerender && rerender();
  const m = await mcp();
  if (!m) { bd.busy = false; bd.error = ERR.unavailable; rerender && rerender(); return; }
  try {
    const seen = new Map();
    for (const query of ["key ideas", "your one move today"]) {
      const s = unwrap(await m.callTool(NOTION, "notion-search", {query, data_source_url: BOOK_DS, page_size: 30, max_highlight_length: 0}, {cache}));
      for (const r of (s && Array.isArray(s.results) ? s.results : [])) if (r && r.id && r.title && !seen.has(r.id)) seen.set(r.id, {id: r.id, title: String(r.title).slice(0, 120), url: /^https:\/\//.test(r.url || "") ? r.url : "", at: Date.parse(r.timestamp || "") || 0});
    }
    bd.list = [...seen.values()].sort((a, b) => b.at - a.at).slice(0, 40);
  } catch (e) { bd.error = ERR[e && e.code] || "Couldn't reach your digests in Notion just now. Try again in a minute."; }
  bd.busy = false; rerender && rerender();
}

// one digest page -> a notebook item {title, author, body, sections, try, link}
export function parseDigest(raw, fallback = {}){
  const text = typeof raw === "string" ? raw : (raw && raw.text) || "", pm = /<properties>\s*(\{[\s\S]*?\})\s*<\/properties>/.exec(text);
  let p = {}; try { p = pm ? JSON.parse(pm[1]) : {}; } catch {}
  const cm = /<content>([\s\S]*?)<\/content>/.exec(text), body = cm ? cm[1] : "";
  const main = body.split(/\n---\n|\n## /)[0];
  const sections = main.split(/\n?### /).slice(1).map(chunk => { const [h, ...rest] = chunk.split("\n"); const para = clean(rest.join("\n")).split(/\n\s*\n/).map(x => x.replace(/\s*\n\s*/g, " ").trim()).filter(Boolean);
    return {heading: clean(h).replace(/^\d+\.\s*/, ""), lines: para}; }).filter(s => s.heading);
  const move = /Your one move today:?\s*<\/b>:?\s*([^\n]+)/i.exec(body) || /Your one move today:?\**\s*([^\n]+)/i.exec(clean(body));
  const hl = /## Highlights[^\n]*\n([\s\S]*?)(?:\n## |$)/.exec(body);
  const highlights = hl ? hl[1].split("\n").map(l => /^\s*-\s+(.*)/.exec(l)).filter(Boolean).map(x => clean(x[1])).filter(Boolean) : [];
  if (highlights.length) sections.push({heading: "Your highlights", lines: highlights});
  const date = p["date:Date:start"] ? new Date(p["date:Date:start"] + "T00:00:00Z").toLocaleDateString("en-GB", {weekday: "short", day: "numeric", month: "short", timeZone: "UTC"}) : "";
  return {id: "n" + (fallback.id || ""), notion: true, title: clean(p.Book || fallback.title || "A book"), author: clean(p.Author || ""),
    body: [p.Category, p.Type, date].filter(Boolean).map(clean).join(" · "), sections, try: move ? clean(move[1]) : "", link: /^https:\/\//.test(p.url || fallback.url || "") ? (p.url || fallback.url) : ""};
}
export async function openMyDigest(d){
  const m = await mcp(); if (!m) return {error: ERR.unavailable};
  try { return parseDigest(unwrap(await m.callTool(NOTION, "notion-fetch", {id: d.id}, {cache})), d); }
  catch (e) { return {error: ERR[e && e.code] || "Couldn't open that digest just now."}; }
}
