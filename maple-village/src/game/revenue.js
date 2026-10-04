// The revenue chart in the town hall: studio income from Mel's Chord connector (read-only). Paid invoices grouped by
// the month they were paid (last six months), this month against a target Mel sets (F.revTarget), what's still owed,
// and running retainers. Invoices billed to "Internal" aren't client revenue, so they're left out.
import { esc, plain, dayKey } from "../util.js";
import { CHORD, CLIENT_ERRORS } from "./clients.js";

const unwrap = r => { let p = r && r.payload !== undefined ? r.payload : r; if (typeof p === "string") { try { p = JSON.parse(p); } catch {} }
  if (p && Array.isArray(p.content) && p.content[0] && typeof p.content[0].text === "string") { try { return JSON.parse(p.content[0].text); } catch {} } return p; };
async function call(tool, input, fresh){
  let mcp = null; try { mcp = window.claude && claude.use ? await claude.use("mcp") : null; } catch {}
  if (!mcp) throw {code: "unavailable"};
  return unwrap(await mcp.callTool(CHORD, tool, input, {cache: {staleTime: fresh ? 0 : 10*60e3, refresh: !!fresh}}));
}
const st = {data: null, busy: false, error: null, editing: false};
const monthKey = d => String(d || "").slice(0, 7);
function months(){ const [y, m] = dayKey().split("-").map(Number); return Array.from({length: 6}, (_, i) => { const d = new Date(Date.UTC(y, m - 1 - (5 - i), 1)); return d.toISOString().slice(0, 7); }); }
const real = inv => inv && !/^internal$/i.test(String(inv.client || "").trim());

export async function loadRevenue(fresh){
  if (st.busy) return; st.busy = true; st.error = null;
  try {
    const ms = months(), from = ms[0] + "-01";
    // paid invoices are fetched by issue date, from a month earlier so ones issued then and paid in the window count
    const early = new Date(Date.parse(from + "T00:00:00Z") - 40*864e5).toISOString().slice(0, 10);
    const [paid, unpaid, ret] = await Promise.all([call("list_invoices", {status: "paid", from: early, limit: 200}, fresh), call("list_invoices", {status: "unpaid", limit: 100}, fresh), call("list_retainers", {running_only: true}, fresh).catch(() => null)]);
    const byMonth = Object.fromEntries(ms.map(k => [k, 0]));
    ((paid && paid.invoices) || []).filter(real).forEach(i => { const k = monthKey(i.paid || i.issued); if (k in byMonth) byMonth[k] += Number(i.total) || 0; });
    const owed = ((unpaid && unpaid.invoices) || []).filter(real).sort((a, b) => String(a.due || "").localeCompare(String(b.due || "")));
    const rets = (ret && (ret.retainers || ret.items)) || [];
    st.data = {currency: (paid && paid.currency) || "$", byMonth, owed, retainers: rets.filter(r => r.running !== false), retTotal: ret && ret.monthly_total, at: Date.now()};
  } catch (e) { st.error = (e && e.code) || "server_unavailable"; }
  st.busy = false;
}
const money = (n, c) => `${c}${Math.round(Number(n) || 0).toLocaleString()}`;
const mlabel = k => new Date(k + "-01T00:00:00Z").toLocaleDateString("en-GB", {month: "short", timeZone: "UTC"});

function chart(d, target){
  const ms = Object.keys(d.byMonth), vals = ms.map(k => d.byMonth[k]), max = Math.max(1, target || 0, ...vals) * 1.15;
  const W = 320, H = 150, L = 8, B = 128, T = 14, bw = 36, gap = (W - L*2 - bw*6)/5, y = v => B - (B - T)*v/max;
  const bars = ms.map((k, i) => { const x = L + i*(bw + gap), v = vals[i], top = y(v), h = Math.max(0, B - top), cur = i === ms.length - 1;
    const r = Math.min(4, h); // 4px rounded data end, anchored to the baseline
    const path = h > 0 ? `M${x} ${B} V${top + r} Q${x} ${top} ${x + r} ${top} H${x + bw - r} Q${x + bw} ${top} ${x + bw} ${top + r} V${B}z` : "";
    return `<g class="rbar${cur ? " cur" : ""}" tabindex="0" aria-label="${mlabel(k)}: ${money(v, d.currency)}"><title>${mlabel(k)} ${k.slice(0, 4)}: ${money(v, d.currency)}</title><rect x="${x - gap/2}" y="${T}" width="${bw + gap}" height="${B - T}" fill="transparent"/>${path ? `<path d="${path}" fill="#4E9A4A" opacity="${cur ? 1 : .55}"/>` : ""}
      ${cur || v === Math.max(...vals) && v > 0 ? `<text x="${x + bw/2}" y="${top - 4}" text-anchor="middle" class="rval">${money(v, d.currency)}</text>` : ""}<text x="${x + bw/2}" y="${B + 14}" text-anchor="middle" class="rax">${mlabel(k)}</text></g>`; }).join("");
  const tl = target ? `<path d="M${L} ${y(target)} H${W - L}" stroke="#8A8279" stroke-width="1.2" stroke-dasharray="4 4"/><text x="${W - L}" y="${y(target) - 4}" text-anchor="end" class="rax">target ${money(target, d.currency)}</text>` : "";
  return `<svg class="rchart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Paid income by month, last six months"><path d="M${L} ${B} H${W - L}" stroke="#D8CFC2" stroke-width="1"/>${bars}${tl}</svg>`;
}
// this month's paid total (for the revenue-goal trophy); null until the chart has loaded once
export const revenueNow = () => { if (!st.data) return null; const ms = Object.keys(st.data.byMonth); const m = ms[ms.length - 1]; return {month: m, total: st.data.byMonth[m] || 0, cur: st.data.currency}; };
export function revenuePanel(F){
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>Revenue</h2>`;
  if (!st.data) return h + (st.error ? `<p class="sub">${esc(CLIENT_ERRORS[st.error] || "Couldn't reach Chord just now.")}</p><div class="actions"><button class="btn alt small" data-rv="refresh">Try again</button></div>` : `<p class="sub">Counting it up from Chord…</p>`);
  const d = st.data, c = d.currency, ms = Object.keys(d.byMonth), now = d.byMonth[ms[ms.length - 1]], target = Number(F.revTarget) || 0;
  const pct = target ? Math.min(100, Math.round(100*now/target)) : 0, retTotal = Number(d.retTotal) || d.retainers.reduce((s, r) => s + (Number(r.monthly_amount) || 0), 0);
  h += `<p class="sub">Studio income from Chord: paid invoices, by the month they were paid${st.busy ? " · refreshing…" : ""}.</p>
    <div class="rhero"><p class="rbig">${money(now, c)}</p><p class="muted">${esc(new Date(ms[ms.length - 1] + "-01T00:00:00Z").toLocaleDateString("en-GB", {month: "long", timeZone: "UTC"}))} so far${target ? ` · ${pct}% of your ${money(target, c)} target` : ""}</p>
      ${target ? `<span class="clbar rprog"><i style="width:${pct}%"></i></span>` : ""}
      ${st.editing || !target ? `<form class="row rtarget" id="rvForm"><label for="rvIn" class="muted">Monthly target</label><input id="rvIn" type="number" min="0" step="50" inputmode="numeric" value="${target || ""}" placeholder="e.g. 6000"><button class="btn small" type="submit">Set</button></form>` : `<button class="btn alt small" data-rv="edit">Change target</button>`}</div>
    ${chart(d, target)}
    <details class="rtable"><summary>See the numbers</summary><table><thead><tr><th>Month</th><th>Paid</th></tr></thead><tbody>${ms.map(k => `<tr><td>${mlabel(k)} ${k.slice(0, 4)}</td><td>${money(d.byMonth[k], c)}</td></tr>`).join("")}</tbody></table></details>`;
  if (retTotal || d.retainers.length) h += `<p class="muted">${d.retainers.length} retainer${d.retainers.length === 1 ? "" : "s"} running${retTotal ? `: ${money(retTotal, c)} a month` : ""}.</p>`;
  const owedTotal = d.owed.reduce((s, i) => s + (Number(i.total) || 0), 0);
  h += `<p class="eyebrow">Still owed${d.owed.length ? ` · ${money(owedTotal, c)}` : ""}</p>` + (d.owed.length ? `<ul class="hlist clatt">${d.owed.slice(0, 8).map(i => `<li><span><b>${esc(plain(String(i.client || "")).slice(0, 40))}</b> ${money(i.total, c)}<small>${esc(String(i.number || ""))}${i.due ? " · due " + esc(String(i.due)) : ""}</small></span>${i.overdue ? `<span class="hbadge now">overdue</span>` : ""}</li>`).join("")}</ul>` : `<p class="muted">Nothing outstanding. Every invoice is paid.</p>`);
  return h + `<div class="actions"><button class="btn alt small" data-rv="refresh">Refresh</button></div>`;
}
export function wireRevenue(root, F, save, rerender){
  root.querySelectorAll('[data-rv="refresh"]').forEach(b => b.onclick = () => { loadRevenue(true).then(rerender); rerender(); });
  root.querySelectorAll('[data-rv="edit"]').forEach(b => b.onclick = () => { st.editing = true; rerender(); });
  const f = root.querySelector("#rvForm"); if (f) f.onsubmit = ev => { ev.preventDefault(); const v = Math.max(0, Math.round(Number(root.querySelector("#rvIn").value) || 0)); F.revTarget = v || null; st.editing = false; save(); rerender(); };
}
