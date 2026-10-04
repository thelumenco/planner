// Reports other routines send to the village, all read-only here:
//  - "health-chord" / "health-chico": the nightly bug checks. Shown as a standing health sign in each building
//    and a little light on the building in the town square.
//  - "content-chord" / "content-ambidextrous": the two content calendars. Shown on the calendar panel's Content tab.
// Docs live in the per-user collection; routines write them, the page only reads (see ROUTINE-STEPS.md).
import { esc, plain, dayKey } from "../util.js";

export const APPS = {chord: {name: "Chord", room: "chord"}, chico: {name: "Chico", room: "chico"}};
export const BRANDS = {chord: {name: "Chord", color: "var(--sage)"}, ambidextrous: {name: "Ambidextrous", color: "var(--peri)"}};
const DOCS = ["health-chord", "health-chico", "content-chord", "content-ambidextrous", "goodnews"];
const KEY = "fox.feeds";
let D = (() => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } })();
let onChange = () => {};

export function attachFeeds(col, changed){
  onChange = changed;
  DOCS.forEach(id => col.doc(id).onSnapshot(snap => {
    D[id] = snap.exists ? snap.data() || null : null;
    try { localStorage.setItem(KEY, JSON.stringify(D)); } catch {}
    onChange(id);
  }, () => {}));
}

/* ---------- health ---------- */
const STATE = s => /fail|red|error|down/i.test(s || "") ? "red" : /warn|amber|flaky|slow|skip/i.test(s || "") ? "amber" : /pass|ok|green|up|healthy/i.test(s || "") ? "green" : "grey";
export function health(app){
  const d = D["health-" + app]; if (!d || !d.at) return null;
  const checks = (Array.isArray(d.checks) ? d.checks : []).slice(0, 12).map(c => ({name: plain(String(c.name || "")).slice(0, 60), state: STATE(c.state), detail: plain(String(c.detail || "")).slice(0, 120)}));
  const worst = checks.some(c => c.state === "red") ? "red" : checks.some(c => c.state === "amber") ? "amber" : "green";
  const status = d.status ? STATE(d.status) : checks.length ? worst : "grey";
  return {status, headline: plain(String(d.headline || "")).slice(0, 120), checks, at: +d.at, stale: Date.now() - d.at > 36*3600e3, link: /^https:\/\//.test(d.link || "") ? d.link : ""};
}
export const LIGHT = {green: "#7FB069", amber: "#F3B54A", red: "#E8574C", grey: "#B9B0A4"};
const ago = ms => { const m = Math.round((Date.now() - ms)/60000); return m < 60 ? `${Math.max(1, m)} min ago` : m < 1440 ? `${Math.round(m/60)} h ago` : `${Math.round(m/1440)} days ago`; };
export function healthPanel(app){
  const a = APPS[app], h = health(app);
  let s = `<span class="tape stripe" aria-hidden="true"></span><h2>${a.name} health</h2>`;
  if (!h) return s + `<p class="sub">No report yet. When the ${a.name} nightly bug check runs, its results land here.</p>`;
  const word = {green: "All good", amber: "Keep an eye on it", red: "Needs you", grey: "Unknown"}[h.status];
  s += `<p class="hstatus"><i style="background:${LIGHT[h.status]}"></i><b>${word}</b>${h.headline ? ` · ${esc(h.headline)}` : ""}</p>
    <p class="sub">Checked ${ago(h.at)}${h.stale ? " (that's a while: did tonight's check run?)" : ""}.</p>`;
  if (h.checks.length) s += `<ul class="hlist checks">${h.checks.map(c => `<li><i style="background:${LIGHT[c.state]}"></i><span>${esc(c.name)}${c.detail ? ` <small>${esc(c.detail)}</small>` : ""}</span></li>`).join("")}</ul>`;
  if (h.link) s += `<div class="actions"><a class="btn small alt" href="${esc(h.link)}" target="_blank" rel="noopener">Open the ${a.name} founder room</a></div>`;
  return s;
}

/* ---------- content calendar ---------- */
export function contentItems(){
  const out = [];
  Object.keys(BRANDS).forEach(b => { const d = D["content-" + b]; ((d && d.items) || []).forEach(it => {
    if (!it || !/^\d{4}-\d{2}-\d{2}$/.test(it.date || "")) return;
    out.push({brand: b, date: it.date, time: /^\d{1,2}:\d{2}$/.test(it.time || "") ? it.time : "", channel: plain(String(it.channel || "")).slice(0, 30),
      title: plain(String(it.title || "")).slice(0, 140), status: plain(String(it.status || "")).toLowerCase().slice(0, 20), link: /^https:\/\//.test(it.link || "") ? it.link : ""});
  }); });
  return out.sort((x, y) => (x.date + x.time).localeCompare(y.date + y.time));
}
export const contentUpdated = () => Object.keys(BRANDS).map(b => D["content-" + b] && D["content-" + b].at).filter(Boolean);
let brandFilter = "all";
export function contentHTML(){
  const today = dayKey(), end = new Date(Date.parse(today + "T00:00:00Z") + 14*864e5).toISOString().slice(0, 10);
  const all = contentItems().filter(i => i.date >= today && i.date < end && (brandFilter === "all" || i.brand === brandFilter));
  let h = `<div class="chips cfilter">${[["all", "Both"], ...Object.entries(BRANDS).map(([k, v]) => [k, v.name])].map(([k, n]) => `<button type="button" data-cbrand="${k}" aria-pressed="${brandFilter === k}">${esc(n)}</button>`).join("")}</div>`;
  if (!contentUpdated().length) return h + `<p class="muted">No content calendars have reported in yet. Once the Chord and Ambidextrous calendars send their plans, the next two weeks show here.</p>`;
  if (!all.length) return h + `<p class="muted">Nothing planned in the next two weeks${brandFilter === "all" ? "" : " for " + BRANDS[brandFilter].name}.</p>`;
  const days = {}; all.forEach(i => (days[i.date] = days[i.date] || []).push(i));
  h += Object.keys(days).map(d => { const dt = new Date(d + "T00:00:00Z");
    return `<p class="eyebrow cday">${d === today ? "Today" : dt.toLocaleDateString("en-GB", {weekday: "short", day: "numeric", month: "short", timeZone: "UTC"})}</p><ul class="hlist content">${days[d].map(i =>
      `<li><i style="background:${BRANDS[i.brand].color}" title="${BRANDS[i.brand].name}"></i><span>${i.link ? `<a href="${esc(i.link)}" target="_blank" rel="noopener">${esc(i.title)}</a>` : esc(i.title)}<small>${esc(BRANDS[i.brand].name)}${i.channel ? " · " + esc(i.channel) : ""}${i.time ? " · " + esc(i.time) : ""}</small></span>${i.status ? `<span class="hbadge${/posted|published|done/.test(i.status) ? "" : /sched/.test(i.status) ? " sched" : " now"}">${esc(i.status)}</span>` : ""}</li>`).join("")}</ul>`; }).join("");
  return h;
}
export function wireContent(root, rerender){
  root.querySelectorAll("[data-cbrand]").forEach(b => b.onclick = () => { brandFilter = b.dataset.cbrand; rerender(); });
}

/* ---------- good news board (town square): "goodnews" doc from the morning routine + wins the page knows ---------- */
export function goodNews(){ const d = D.goodnews; return d && d.at ? d : null; }
export function goodNewsHTML(localWins){
  const d = goodNews(), clean = s => plain(String(s || "")).slice(0, 220);
  const world = ((d && d.world) || []).slice(0, 6).filter(x => x && x.title);
  const wins = [...(localWins || []), ...(((d && d.wins) || []).map(clean))].filter(Boolean).slice(0, 8);
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>Good news</h2><p class="sub">${d ? `Pinned up ${new Date(d.at).toLocaleDateString("en-GB", {weekday: "long", day: "numeric", month: "short", timeZone: "Asia/Singapore"})}.` : "Fresh every morning."}</p>`;
  h += `<p class="eyebrow">Your wins</p>` + (wins.length ? `<ul class="hlist gnews">${wins.map(w => `<li><span>${esc(w)}</span></li>`).join("")}</ul>` : `<p class="muted">Your wins show up here as the day goes on.</p>`);
  h += `<p class="eyebrow">In the world</p>` + (world.length ? `<ul class="hlist gnews world">${world.map(x => `<li><span>${/^https:\/\//.test(x.link || "") ? `<a href="${esc(x.link)}" target="_blank" rel="noopener">${esc(clean(x.title))}</a>` : esc(clean(x.title))}${x.summary ? `<small>${esc(clean(x.summary))}</small>` : ""}${x.source ? `<small class="src">${esc(clean(x.source))}</small>` : ""}</span></li>`).join("")}</ul>`
    : `<p class="muted">The morning's good news hasn't arrived yet.</p>`);
  return h;
}
