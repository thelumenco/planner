// The planning table in the town hall: Mel's Notion plans laid out as three cards (this week, this month, this
// quarter; see plans.js) and a planning chat that sees all three plus today's quests and calendar.
// Nothing is stored: plans are re-read from Notion (30-minute connector cache) and the chat lives in this view.
import { esc, plain, dayKey } from "../util.js";
import { readPlan } from "./plans.js";

const st = {plans: null, busy: false, at: 0, log: [], chatBusy: false};
export async function loadPlans(){
  if (st.busy) return; st.busy = true;
  const out = await Promise.all(["week", "month", "quarter"].map(l => readPlan(l).catch(() => ({level: l, error: "upstream_error"}))));
  st.plans = out; st.at = Date.now(); st.busy = false;
}
const PLAN_ERRORS = {unavailable: "Notion isn't reachable from this view.", "not found": "No page for this one in your Plans yet.", needs_reauth: "Notion needs reconnecting: claude.ai Settings → Connectors.",
  server_not_connected: "Add the Notion connector in claude.ai Settings → Connectors.", not_in_manifest: "Notion is switched off for this page. Turn it on in the page's Permissions."};

// A tiny renderer for the plan pages' Markdown: ## headings, - bullets, **bold**, plain lines. Escaped first.
const inline = s => esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\\([$*_~`])/g, "$1");
// Notion tables come through as <table><tr><td>…</td></tr></table>: drawn as a real table; other tags are dropped.
function tableHTML(src){
  const head = /header-row="true"/.test(src), rows = [...src.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)].map(r => [...r[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map(c => inline(c[1].replace(/<[^>]+>/g, "").trim())));
  if (!rows.length) return "";
  return `<div class="ptable"><table>${rows.map((r, i) => `<tr>${r.map(c => i === 0 && head ? `<th>${c}</th>` : `<td>${c}</td>`).join("")}</tr>`).join("")}</table></div>`;
}
function md(text){
  let h = "", list = false;
  const tables = [];
  text = String(text || "").replace(/<table[\s\S]*?<\/table>/g, m => { tables.push(tableHTML(m)); return `\n\u0000T${tables.length - 1}\n`; });
  text.split("\n").forEach(l => {
    const tm = /^\u0000T(\d+)$/.exec(l.trim()); if (tm) { if (list) { h += "</ul>"; list = false; } h += tables[+tm[1]] || ""; return; }
    const line = l.trim().replace(/<\/?[a-z][^>]*>/gi, "").trim(); if (!line || line === "---") { if (list) { h += "</ul>"; list = false; } return; }
    if (/^#{1,4} /.test(line)) { if (list) { h += "</ul>"; list = false; } h += `<p class="pmh">${inline(line.replace(/^#+ /, ""))}</p>`; return; }
    if (/^[-*] /.test(line)) { if (!list) { h += `<ul class="pml">`; list = true; } h += `<li>${inline(line.slice(2))}</li>`; return; }
    if (list) { h += "</ul>"; list = false; }
    h += `<p class="pmp">${inline(line)}</p>`;
  });
  return h + (list ? "</ul>" : "");
}
// Split a page into its ## sections: [{title, body}]
function sections(text){
  const out = []; let cur = {title: "", body: []};
  String(text || "").split("\n").forEach(l => { const m = /^#{1,3} (.+)/.exec(l.trim()); if (m) { if (cur.title || cur.body.join("").trim()) out.push(cur); cur = {title: m[1].trim(), body: []}; } else cur.body.push(l); });
  if (cur.title || cur.body.join("").trim()) out.push(cur);
  return out.map(s => ({title: s.title, body: s.body.join("\n").trim()}));
}
const WD = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
// This week's card: objectives open, today's slice of "Day by day" pulled out, everything else folded away
function weekCard(p){
  const secs = sections(p.text), today = WD[new Date(dayKey() + "T00:00:00Z").getUTCDay()];
  let h = "";
  secs.forEach(s => {
    if (/day by day/i.test(s.title)) {
      const days = s.body.split(/\n(?=\*\*)/), mine = days.find(d => new RegExp("^\\*\\*" + today, "i").test(d.trim()));
      if (mine) { const [head, ...rest] = mine.trim().split("\n"); h += `<p class="pmh">Today · ${inline(head.replace(/\*\*/g, ""))}</p>${md(rest.join("\n"))}`; }
      h += `<details><summary>The whole week</summary>${md(s.body)}</details>`;
    } else if (/objective|focus|theme/i.test(s.title) || !s.title) h += (s.title ? `<p class="pmh">${inline(s.title)}</p>` : "") + md(s.body);
    else h += `<details><summary>${inline(s.title)}</summary>${md(s.body)}</details>`;
  });
  return h;
}
function card(p, label, cls){
  let h = `<div class="pcard ${cls}"><p class="plabel">${label}</p><p class="ptitle">${esc(p.title || "")}${p.url ? ` <a href="${esc(p.url)}" target="_blank" rel="noopener" class="plink">open in Notion</a>` : ""}</p>`;
  if (p.error) return h + `<p class="muted">${esc(PLAN_ERRORS[p.error] || "Couldn't read this one just now.")}</p></div>`;
  if (p.theme) h += `<p class="ptheme">${esc(p.theme)}</p>`;
  if (cls === "pweek") h += weekCard(p);
  else { const secs = sections(p.text), first = secs[0]; h += first ? (first.title ? `<p class="pmh">${inline(first.title)}</p>` : "") + md(first.body) : ""; if (secs.length > 1) h += `<details><summary>More</summary>${secs.slice(1).map(s => `<p class="pmh">${inline(s.title)}</p>${md(s.body)}`).join("")}</details>`; }
  return h + `</div>`;
}
export function planningPanel(sample){
  let h = `<span class="tape stripe" aria-hidden="true"></span><h2>Planning table</h2>`;
  const fri = new Date(dayKey() + "T00:00:00Z").getUTCDay() === 5;
  if (!st.plans) return h + `<p class="sub">${st.busy ? "Laying your plans out…" : "Your week, month and quarter from Notion."}</p>`;
  h += `<p class="sub">From your Notion Plans${st.busy ? " · refreshing…" : ""}.</p>`;
  if (fri) h += `<p class="pfri">It's Friday: a good day for your CEO debrief. Ask chat for it, or start here with "how did this week go?".</p>`;
  const [w, m, q] = st.plans;
  h += `<div class="pcards">${card(w, "This week", "pweek")}${card(m, "This month", "pmonth")}${card(q, "This quarter", "pquarter")}</div>
    <div class="actions"><button class="btn alt small" data-pl="refresh">Refresh</button></div>`;
  h += `<p class="eyebrow" style="margin-top:12px">Plan with me</p>`;
  if (!sample) return h + `<p class="muted">The planning chat needs Claude, which isn't reachable from this view just now.</p>`;
  return h + `<div class="clchat" id="plChat">${st.log.length ? st.log.map(x => `<p class="${x.role === "user" ? "me" : "fox"}">${esc(x.content)}</p>`).join("") : `<p class="fox">Ask me about your plans: am I on track for October? What should I drop this week? Help me plan next week.</p>`}${st.chatBusy ? `<p class="fox">Thinking it through…</p>` : ""}</div>
    <form class="row" id="plForm"><label class="sr" for="plIn">Ask about your plans</label><input id="plIn" maxlength="500" placeholder="e.g. am I on track this week?" autocomplete="off"><button class="btn small" type="submit" ${st.chatBusy ? "disabled" : ""}>Ask</button></form>`;
}
// ctx: {quests: [{title, done}], events: [{title, time}], coins, water, steps}
export async function askPlans(sample, text, ctx, rerender){
  text = String(text || "").trim(); if (!text || st.chatBusy || !sample) return;
  st.log.push({role: "user", content: text}); st.chatBusy = true; rerender();
  const plans = (st.plans || []).filter(p => p && p.text).map(p => `== ${p.title}${p.theme ? ` (theme: ${p.theme})` : ""} ==\n${p.text}`).join("\n\n");
  const history = st.log.slice(-10, -1).map(x => (x.role === "user" ? "Mel: " : "You: ") + x.content).join("\n");
  const prompt = `You are Mel's planning partner at the planning table in her village game. She runs Fresh Pages Co / Ambidextrous (copywriting, AI training) plus her apps Chord and Chico, and parents Evan (2-3). Coach in her boss-mode style: honest, kind, specific, one clear next step, protect rest and family time, no guilt. Answer in at most 6 short sentences or a short list. Plain text, no emoji, no markdown headings. Base everything on her plans and today's data below; if they don't say, say so rather than inventing.
Today: ${new Date(dayKey() + "T00:00:00Z").toLocaleDateString("en-GB", {weekday: "long", day: "numeric", month: "long", timeZone: "UTC"})}.
Her plans (Notion):
${plans || "(couldn't read the plans just now)"}
Today's quests: ${JSON.stringify(ctx.quests || []).slice(0, 4000)}
Today's calendar: ${JSON.stringify(ctx.events || []).slice(0, 2000)}
${history ? "Conversation so far:\n" + history + "\n" : ""}Mel: ${text}`;
  let reply = "";
  try { const r = await sample(prompt, {modelTier: "default", cache: false}); reply = plain(String((r && r.text) || "")).trim(); }
  catch (e) { reply = e && e.code === "rate_limited" ? "Let's pause a moment. Ask again in a minute?" : "I couldn't think that through just now. Try again?"; }
  st.log.push({role: "assistant", content: reply.slice(0, 2400) || "Hmm, nothing came back. Try again?"}); st.chatBusy = false; rerender();
}
