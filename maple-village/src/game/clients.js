// The client table in the town hall: a live snapshot of Mel's studio from her Chord connector (read-only), and a chat
// about her clients. The chat's Claude can look things up in Chord itself (a project's tasks, what's coming up, a
// client) through page tools that call the connector. Nothing from Chord is stored: it lives in this page view only.
import { esc, plain } from "../util.js";
export const CHORD = "Chord";   // connector display name, must match the published manifest

const unwrap = r => {
  let p = r && r.payload !== undefined ? r.payload : r;
  if (typeof p === "string") { try { p = JSON.parse(p); } catch {} }
  if (p && Array.isArray(p.content) && p.content[0] && typeof p.content[0].text === "string") { try { return JSON.parse(p.content[0].text); } catch { return p.content[0].text; } }
  return p;
};
async function mcpUse(){ try { return window.claude && claude.use ? await claude.use("mcp") : null; } catch { return null; } }
async function call(tool, input, fresh){
  const mcp = await mcpUse(); if (!mcp) throw {code: "unavailable"};
  return unwrap(await mcp.callTool(CHORD, tool, input || {}, {cache: {staleTime: fresh ? 0 : 5*60e3, refresh: !!fresh}}));
}
export const CLIENT_ERRORS = {
  unavailable: "Chord isn't reachable from this view.",
  needs_reauth: "Chord needs reconnecting: claude.ai Settings → Connectors.",
  server_not_connected: "Add the Chord connector in claude.ai Settings → Connectors.",
  not_in_manifest: "Chord is switched off for this page. Turn it on in the page's Permissions.",
  not_granted: "Chord isn't allowed for this page yet.",
  server_unavailable: "Chord didn't answer just now. Try again in a minute."
};

/* ---------- snapshot ---------- */
const st = {snap: null, busy: false, error: null, at: 0, log: [], chatBusy: false};
export async function loadClients(fresh){
  if (st.busy) return; st.busy = true; st.error = null;
  try {
    const [overview, projects, attention] = await Promise.all([call("studio_overview", {}, fresh), call("list_projects", {status: "active", limit: 60}, fresh), call("needs_attention", {}, fresh).catch(() => null)]);
    st.snap = {overview: overview || {}, projects: (projects && projects.projects) || [], attention: (attention && attention.items) || []}; st.at = Date.now();
  } catch (e) { st.error = (e && e.code) || "server_unavailable"; }
  st.busy = false;
}
export const clientsLoaded = () => !!st.snap;
const t = (s, n = 90) => esc(plain(String(s ?? "")).slice(0, n));
const when = d => { if (!d) return ""; const x = new Date(d + "T00:00:00Z"); return isNaN(x) ? t(d, 20) : x.toLocaleDateString("en-GB", {day: "numeric", month: "short", timeZone: "UTC"}); };

export function clientsPanel(sample){
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>Client table</h2>`;
  if (st.busy && !st.snap) return h + `<p class="sub">Spreading the client files out…</p>`;
  if (st.error && !st.snap) return h + `<p class="sub">${esc(CLIENT_ERRORS[st.error] || "Couldn't reach Chord just now.")}</p><div class="actions"><button class="btn alt small" data-cl="refresh">Try again</button></div>`;
  if (!st.snap) return h + `<p class="sub">Your client projects, live from Chord.</p><div class="actions"><button class="btn primary small" data-cl="refresh">Open the files</button></div>`;
  const o = st.snap.overview, cur = o.currency || "$";
  const chip = (n, label, warn) => `<span class="clchip${warn && n ? " warn" : ""}"><b>${Number(n) || 0}</b> ${label}</span>`;
  h += `<p class="sub">${t(o.studio || "Your studio", 40)} · today in Chord${st.busy ? " · refreshing…" : ""}</p>
    <div class="clchips">${chip(o.projects_active, "active projects")}${chip(o.tasks_overdue, "overdue tasks", true)}${chip(o.tasks_waiting_on_clients, "waiting on clients")}${chip(o.client_comments_open, "client comments", true)}${chip(o.proposals_awaiting_reply, "proposals out")}${chip(o.leads_open, "open leads")}</div>
    <p class="muted clmoney">${o.retainers_running ? `${o.retainers_running} retainers · ${cur}${Number(o.retainer_income_per_month || 0).toLocaleString()}/month` : ""}${o.money_overdue ? ` · <b>${cur}${Number(o.money_overdue).toLocaleString()} overdue</b>` : o.money_owed ? ` · ${cur}${Number(o.money_owed).toLocaleString()} owed` : ""}</p>`;
  const ps = st.snap.projects;
  h += `<p class="eyebrow">Active projects</p>` + (ps.length ? `<ul class="hlist clprojects">${ps.slice(0, 20).map(p => { const pct = p.tasks_total ? Math.round(100*p.tasks_done/p.tasks_total) : 0;
    return `<li><span><b>${t(p.name, 70)}</b><small>${t(p.client, 40)}${p.category ? " · " + t(p.category, 20) : ""}${p.due ? " · due " + when(p.due) : ""}${p.key_date ? ` · ${t(p.key_date_label || "key date", 20)} ${when(p.key_date)}` : ""}</small>
      ${p.tasks_total ? `<span class="clbar"><i style="width:${pct}%"></i></span><small>${p.tasks_done}/${p.tasks_total} tasks</small>` : ""}</span></li>`; }).join("")}</ul>` : `<p class="muted">No active projects right now.</p>`);
  const att = st.snap.attention;
  if (att.length) h += `<p class="eyebrow">Needs your attention</p><ul class="hlist clatt">${att.slice(0, 8).map(a => `<li><span>${t(a.title || a.what || a.summary || a.type || "Item", 90)}<small>${t(a.action || a.todo || a.detail || "", 110)}</small></span></li>`).join("")}</ul>`;
  const nb = (o.next_bookings || [])[0];
  if (nb) h += `<p class="muted">Next booking: ${t(nb.meeting, 40)} with ${t(nb.with, 40)}, ${t(nb.starts, 40)}.</p>`;
  h += `<div class="actions"><button class="btn alt small" data-cl="refresh">Refresh</button></div>`;
  // chat
  h += `<p class="eyebrow" style="margin-top:14px">Ask about your clients</p>`;
  if (!sample) h += `<p class="muted">The chat needs Claude, which isn't reachable from this view just now.</p>`;
  else h += `<div class="clchat" id="clChat">${st.log.length ? st.log.map(m => `<p class="${m.role === "user" ? "me" : "fox"}">${esc(m.content)}</p>`).join("") : `<p class="fox">Ask me anything about your clients: who's waiting on you, what's due this week, where a project's at.</p>`}${st.chatBusy ? `<p class="fox">Looking through the files…</p>` : ""}</div>
    <form class="row" id="clForm"><label class="sr" for="clIn">Ask about your clients</label><input id="clIn" maxlength="400" placeholder="e.g. what's waiting on me this week?" autocomplete="off"><button class="btn small" type="submit" ${st.chatBusy ? "disabled" : ""}>Ask</button></form>`;
  return h;
}

// Page tools the chat's Claude may call: read-only Chord look-ups, small results.
const TOOLS = [
  {name: "chord_project", description: "One Chord project: its stages and every task in order (status, due date, who it's waiting on) and its invoices. Pass a project id from the snapshot.", inputSchema: {type: "object", properties: {project_id: {type: "string"}}, required: ["project_id"]},
    execute: async i => JSON.stringify(await call("get_project", {project_id: String(i.project_id || "")})).slice(0, 24000)},
  {name: "chord_upcoming", description: "What's coming up in the next N days in Chord: booked meetings, project key dates, task deadlines and invoices falling due.", inputSchema: {type: "object", properties: {days: {type: "integer", minimum: 1, maximum: 90}}},
    execute: async i => JSON.stringify(await call("list_upcoming", {days: Math.min(90, Math.max(1, Number(i.days) || 14))})).slice(0, 24000)},
  {name: "chord_clients", description: "Search Chord clients by name, company, email or tag (active by default).", inputSchema: {type: "object", properties: {search: {type: "string"}, status: {type: "string", enum: ["active", "archived", "all"]}}},
    execute: async i => JSON.stringify(await call("list_clients", {search: String(i.search || ""), status: ["active", "archived", "all"].includes(i.status) ? i.status : "active", limit: 30})).slice(0, 24000)}
];
export async function askClients(sample, text, rerender){
  text = String(text || "").trim(); if (!text || st.chatBusy || !sample) return;
  st.log.push({role: "user", content: text}); st.chatBusy = true; rerender();
  const snap = JSON.stringify({overview: st.snap && st.snap.overview, projects: st.snap && st.snap.projects, needs_attention: st.snap && st.snap.attention}).slice(0, 40000);
  const history = st.log.slice(-10, -1).map(m => (m.role === "user" ? "Mel: " : "You: ") + m.content).join("\n");
  const prompt = `You are the client desk in Mel's village game: a calm, practical assistant who knows her studio (she runs Fresh Pages Co / Ambidextrous, a copywriting and AI studio in Singapore). Answer in at most 5 short sentences or a short list, plain text, no emoji, no markdown headings. Be specific: names, dates, what's waiting on whom. Only state what the data shows; if it doesn't say, say so. You can't change anything in Chord.
Snapshot from Chord (today): ${snap}
${history ? "Conversation so far:\n" + history + "\n" : ""}Mel: ${text}`;
  let reply = "";
  try {
    const lim = sample.limits ? await sample.limits().catch(() => null) : null;
    const r = lim && lim.tools ? await sample(prompt, {tools: TOOLS, modelTier: "default"}) : await sample(prompt, {modelTier: "default", cache: false});
    reply = plain(String((r && r.text) || "")).trim();
  } catch (e) { reply = e && e.code === "rate_limited" ? "I need a breather. Ask again in a minute?" : "I couldn't get to the files just now. Try again?"; }
  st.log.push({role: "assistant", content: reply.slice(0, 2000) || "Hmm, nothing came back. Try again?"}); st.chatBusy = false; rerender();
}
