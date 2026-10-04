// The home desk: Mel's personal inbox (baymelody@gmail.com, through her Zapier connector's Gmail "Find
// Email" search). All read-only, nothing stored: each letter opens in Gmail.
import { esc, plain, dayKey } from "../util.js";

export const ZAPIER = "Zapier";   // connector display name, must match the published manifest
const ZAP_GMAIL = {selected_api: "GoogleMailV2CLIAPI", action: "message", tool_name: "gmail_find_email", connection_id: "0259b139-2fcc-8b64-a2ef-82ac9a87ed8c"};
// Primary only: the promotions tab can hold dozens of unread mails, and Zapier returns every body in full
const PERSONAL_QUERY = "in:inbox category:primary is:unread newer_than:3d";
const st = { mine: null, mineErr: null, busy: false};

const unwrap = r => { let p = r && r.payload !== undefined ? r.payload : r; if (typeof p === "string") { try { p = JSON.parse(p); } catch {} }
  if (p && Array.isArray(p.content) && p.content[0] && typeof p.content[0].text === "string") { try { return JSON.parse(p.content[0].text); } catch {} } return p; };
async function fetchPersonal(fresh){
  let mcp = null; try { mcp = window.claude && claude.use ? await claude.use("mcp") : null; } catch {}
  if (!mcp) { st.mineErr = "unavailable"; return; }
  try {
    const p = unwrap(await mcp.callTool(ZAPIER, "execute_zapier_read_action", {...ZAP_GMAIL, params: {query: PERSONAL_QUERY}}, {cache: {staleTime: fresh ? 0 : 5*60e3, refresh: !!fresh}}));
    const list = (p && Array.isArray(p.results)) ? p.results : [];
    st.mine = list.slice(0, 12).map(m => ({from: plain(String((m.from && (m.from.name || m.from.email)) || "")).slice(0, 40), subject: plain(String(m.subject || "(no subject)")).slice(0, 90),
      snippet: plain(String((m.raw && m.raw.snippet) || m.body_plain || "")).replace(/\s+/g, " ").slice(0, 90), at: Date.parse(m.date || "") || 0,
      url: /^https:\/\/mail\.google\.com\//.test(m.message_url || "") ? m.message_url : ""})).sort((a, b) => b.at - a.at);
    st.mineErr = null;
  } catch (e) { st.mineErr = (e && e.code) || "upstream_error"; }
}
// each source fills in as soon as it answers (a slow one never holds up the others)
export async function loadDesk(fresh, rerender = () => {}){
  if (st.busy) return; st.busy = true;
  await fetchPersonal(fresh).catch(() => {});
  st.busy = false; rerender();
}
const ZAP_ERRORS = {unavailable: "Your personal inbox isn't reachable from this view.", server_not_connected: "Add the Zapier connector in claude.ai Settings, Connectors.",
  not_in_manifest: "Zapier is switched off for this page. Turn it on in the page's Permissions.", needs_reauth: "Zapier needs reconnecting: claude.ai Settings, Connectors."};
const ago = ms => { const m = Math.round((Date.now() - ms)/60000); return m < 60 ? `${Math.max(1, m)}m` : m < 1440 ? `${Math.round(m/60)}h` : `${Math.round(m/1440)}d`; };
const who = s => { const m = /^(.*?)\s*<.*>$/.exec(s); const n = m ? m[1] : s; return n.includes("@") ? n.split("@")[0].replace(/[._]/g, " ") : n; };
const fmtT = t => new Date(t).toLocaleTimeString("en-GB", {hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Singapore"}).replace(" ", "").toLowerCase();
const letters = (list, empty) => list.length ? `<ul class="hlist post">${list.map(t => `<li>${t.url ? `<a href="${esc(t.url)}" target="_blank" rel="noopener">` : "<span>"}<b>${esc(who(t.from))}</b><span>${esc(t.subject)}</span><small>${esc(t.snippet)}</small>${t.url ? "</a>" : "</span>"}${t.at ? `<small class="when">${ago(t.at)}</small>` : ""}</li>`).join("")}</ul>` : `<p class="muted">${empty}</p>`;

export function deskPanel(){
  let h = `<span class="tape stripe" aria-hidden="true"></span><h2>Home desk</h2><p class="sub">Your personal inbox, baymelody@gmail.com: unread in Primary from the last 3 days${st.busy ? " · checking…" : ""}.</p>`;
  h += st.mineErr && !st.mine ? `<p class="muted">${esc(ZAP_ERRORS[st.mineErr] || "Couldn't fetch it just now.")}</p>` : !st.mine ? `<p class="muted">Checking…</p>` : letters(st.mine, "Nothing unread in your personal inbox.");
  return h + `<div class="actions"><a class="btn small alt" href="https://mail.google.com/mail/?authuser=baymelody@gmail.com" target="_blank" rel="noopener">Open Gmail</a><button class="btn alt small" data-desk="refresh">Refresh</button><button class="btn alt small" data-close="1">Close</button></div>`;
}
export function wireDesk(root, rerender){
  root.querySelectorAll("[data-desk]").forEach(b => b.onclick = () => { const k = b.dataset.desk;
    if (k === "refresh") { loadDesk(true, rerender); rerender(); } });
}
