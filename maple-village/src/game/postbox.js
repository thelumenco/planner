// Mel's post box at the post office: her unread Primary inbox (Gmail connector, read-only), a glance without
// leaving the village. Each letter opens the thread in Gmail; nothing here sends, archives or marks read.
import { esc } from "../util.js";
export const GMAIL = "Gmail";   // connector display name, must match the published manifest
let cache = {at: 0, threads: [], error: null, busy: false};

export async function fetchPost(fresh){
  if (cache.busy || (!fresh && Date.now() - cache.at < 2*60e3)) return cache;
  let mcp = null;
  try { mcp = window.claude && claude.use ? await claude.use("mcp") : null; } catch {}
  if (!mcp) return (cache = {at: Date.now(), threads: [], error: "unavailable", busy: false});
  cache.busy = true;
  try {
    const r = await mcp.callTool(GMAIL, "search_threads", {query: "is:unread in:inbox category:primary", pageSize: 15, view: "THREAD_VIEW_MINIMAL"}, {cache: {staleTime: fresh ? 0 : 60000, refresh: !!fresh}});
    let p = r && r.payload; if (typeof p === "string") { try { p = JSON.parse(p); } catch {} }
    const threads = ((p && p.threads) || []).map(t => {
      const ms = t.messages || [], last = ms[ms.length - 1] || {}, first = ms[0] || {};
      return {id: t.id, subject: first.subject || last.subject || "(no subject)", from: last.sender || "", snippet: last.snippet || first.snippet || "",
        at: Date.parse(last.date || "") || 0, count: t.messageCount || ms.length, url: t.viewUrl || last.viewUrl || ""};
    }).sort((a, b) => b.at - a.at);
    cache = {at: Date.now(), threads, error: null, busy: false};
  } catch (e) { cache = {at: Date.now(), threads: cache.threads, error: (e && e.code) || "upstream_error", busy: false}; }
  return cache;
}
export const postCount = () => cache.threads.length;
export const postThreads = () => cache;
const ago = ms => { const m = Math.round((Date.now() - ms)/60000); return m < 60 ? `${Math.max(1, m)}m` : m < 1440 ? `${Math.round(m/60)}h` : `${Math.round(m/1440)}d`; };
const who = s => { const m = /^(.*?)\s*<.*>$/.exec(s); const n = m ? m[1] : s; return n.includes("@") ? n.split("@")[0].replace(/[._]/g, " ") : n; };
export const POST_ERRORS = {
  unavailable: "Your inbox isn't reachable from this view.",
  needs_reauth: "Gmail needs reconnecting: claude.ai Settings, Connectors.",
  server_not_connected: "Add the Gmail connector in claude.ai Settings, Connectors.",
  not_in_manifest: "Gmail is switched off for this page. Turn it on in the page's Permissions.",
  server_unavailable: "Gmail didn't answer. Try again in a minute."
};
export function postPanel(){
  const c = cache;
  let h = `<span class="tape stripe" aria-hidden="true"></span><h2>Your post box</h2><p class="sub">Unread in your work inbox (Primary). Tap a letter to open it in Gmail.</p>`;
  if (c.busy && !c.threads.length) h += `<p class="muted">Penny's checking the post…</p>`;
  else if (c.error && !c.threads.length) h += `<p class="muted">${esc(POST_ERRORS[c.error] || "Couldn't fetch your post just now. Try again in a minute.")}</p>`;
  else if (!c.threads.length) h += `<p class="muted">Nothing unread. A tidy post box!</p>`;
  else h += `<ul class="hlist post">${c.threads.map(t => `<li><a href="${esc(t.url)}" target="_blank" rel="noopener"><b>${esc(who(t.from))}</b><span>${esc(t.subject)}${t.count > 1 ? ` <small>(${t.count})</small>` : ""}</span><small>${esc(t.snippet.slice(0, 90))}</small></a><small class="when">${t.at ? ago(t.at) : ""}</small></li>`).join("")}</ul>`;
  h += `<div class="actions"><a class="btn small alt" href="https://mail.google.com/mail/?authuser=mel@freshpages.co" target="_blank" rel="noopener">Open Gmail</a><button class="btn small alt" data-postfresh="1">Check again</button></div>`;
  return h;
}
