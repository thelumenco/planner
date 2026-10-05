// Trophies: milestones Mel reaches, kept in the trophy room off the town hall. Each family of milestone has its own
// trophy (same look, a new number on the plinth each time). The newest six stand on pedestals; the rest live in the
// trophy book (a journal-like page each: what it was for, when, and a polaroid of the trophy). When the pedestals
// are full, the oldest moves to the book on its own. Stored in the game save (F.trophies), so it follows Mel.
import { esc, dayKey } from "../util.js";

export const PEDESTALS = 6;
const APPS = {chord: {n: "Chord", unit: "studios", col: "#7BB37A", emblem: "note"}, chico: {n: "Chico", unit: "families", col: "#F4A0B5", emblem: "chick"},
  ohayo: {n: "Ohayo", unit: "users", col: "#F2A65A", emblem: "sun"}, luna: {n: "Luna", unit: "users", col: "#B9A6E8", emblem: "moon"}};
const fmt = n => Number(n).toLocaleString("en-GB");
const monthName = ym => new Date(ym + "-01T00:00:00Z").toLocaleDateString("en-GB", {month: "long", year: "numeric", timeZone: "UTC"});
// families: id prefix -> {shape, col, emblem}
export const LOOKS = {
  quests: {shape: "cup", col: "#E8B84A", emblem: "star"}, revenue: {shape: "coins", col: "#E8B84A", emblem: "coin"},
  objweek: {shape: "rosette", col: "#5B8FD6", emblem: "check"}, objcount: {shape: "medal", col: "#5B8FD6", emblem: "flag"},
  water: {shape: "medal", col: "#7FB8E8", emblem: "drop"}, steps: {shape: "medal", col: "#F2A65A", emblem: "shoe"},
  maple: {shape: "plaque", col: "#EE8B3A", emblem: "fox"}, kind: {shape: "plaque", col: "#F4A0B5", emblem: "heart"},
  harvest: {shape: "cup", col: "#7BB37A", emblem: "sprout"}, vault: {shape: "coins", col: "#C9A227", emblem: "star"}, journal: {shape: "star", col: "#C9A3E8", emblem: "book"},
  ...Object.fromEntries(Object.entries(APPS).map(([k, a]) => [k, {shape: "cup", col: a.col, emblem: a.emblem}]))
};
const TH = {quests: [10, 25, 50, 100, 250, 500, 1000, 2500], app: [20, 50, 100, 250, 500, 1000, 2500, 5000, 10000], objcount: [5, 10, 25, 50, 100],
  kind: [10, 25, 50, 100], harvest: [10, 50, 100, 250, 500], journal: [10, 50, 100, 250], streak: [7, 14]};

// ctx: {F, ST, levels, levelIndex, kudos, journal, revenue:{month, total, target}|null, objectives:{week, list:[{_id, title, completed}]}|null}
// -> every milestone reached so far, as {id, fam, n, label, note, short}
export function reached(c){
  const out = [], add = (fam, id, n, label, note, short) => out.push({id, fam, n, label, note, short});
  TH.quests.filter(t => (c.F.totalQuests || 0) >= t).forEach(t => add("quests", "quests-" + t, t, `${fmt(t)} quests done`, `${fmt(t)} quests finished, one tiny first step at a time.`, fmt(t)));
  Object.entries(APPS).forEach(([k, a]) => { const s = c.ST && c.ST[k]; if (!s || !(s.users > 0)) return; const unit = s.label || a.unit;
    TH.app.filter(t => s.users >= t).forEach(t => add(k, `${k}-${t}`, t, `${fmt(t)} ${unit} on ${a.n}`, `${a.n} reached ${fmt(t)} ${unit}.`, fmt(t))); });
  if (c.revenue && c.revenue.target > 0 && c.revenue.total >= c.revenue.target)
    add("revenue", "rev-" + c.revenue.month, c.revenue.target, `Revenue goal · ${monthName(c.revenue.month)}`, `Hit the monthly target of ${c.revenue.cur || "$"}${fmt(Math.round(c.revenue.target))} in ${monthName(c.revenue.month)}.`, monthName(c.revenue.month).split(" ")[0].slice(0, 3));
  const objs = c.F.objDone || {}, done = Object.keys(objs).length;
  TH.objcount.filter(t => done >= t).forEach(t => add("objcount", "objc-" + t, t, `${t} weekly objectives done`, `${t} Sunsama weekly objectives ticked off.`, String(t)));
  Object.entries(c.F.objWeeks || {}).forEach(([wk, w]) => add("objweek", "objw-" + wk, w.n, `Every objective · week of ${new Date(wk + "T00:00:00Z").toLocaleDateString("en-GB", {day: "numeric", month: "short", timeZone: "UTC"})}`, `Every weekly objective done: ${w.titles.join("; ")}.`, "All"));
  const hist = c.F.history || {}, days = Object.keys(hist).sort(), streak = key => { let n = 0, best = 0, prev = null;
    days.forEach(d => { const ok = !!key(hist[d]), next = prev && Date.parse(d) - Date.parse(prev) === 864e5; n = ok ? (next && n > 0 ? n + 1 : 1) : 0; best = Math.max(best, n); prev = d; }); return best; };
  const wS = streak(h => (h.water || 0) >= 2000), sS = streak(h => (h.steps || 0) >= 5000);
  TH.streak.filter(t => wS >= t).forEach(t => add("water", "water-" + t, t, `${t} days of 2L water in a row`, `Two litres of water, ${t} days running.`, t + "d"));
  TH.streak.filter(t => sS >= t).forEach(t => add("steps", "steps-" + t, t, `${t} days of 5,000 steps in a row`, `5,000 steps or more, ${t} days running.`, t + "d"));
  (c.levels || []).forEach((l, i) => { if (i > 0 && i <= c.levelIndex) add("maple", "maple-" + i, i, `Maple: ${l.name}`, `Maple's friendship reached "${l.name}".`, "Lv" + i); });
  (c.vaults || []).forEach(v => { for (let k = 1; k <= (v.fills || 0); k++) add("vault", `vault-${v.id}-${k}`, k, `Filled the ${v.label} vault${k > 1 ? ` (${k}x)` : ""}`, `The ${v.label} savings jar filled to the top with jewels.`, k > 1 ? k + "x" : "Full"); });
  TH.kind.filter(t => c.kudos >= t).forEach(t => add("kind", "kind-" + t, t, `${t} kind words pinned`, `${t} compliments pinned to the Kind words board.`, String(t)));
  TH.harvest.filter(t => (c.F.harvestTotal || 0) >= t).forEach(t => add("harvest", "harvest-" + t, t, `${t} harvests`, `${t} crops picked from the garden.`, String(t)));
  TH.journal.filter(t => c.journal >= t).forEach(t => add("journal", "journal-" + t, t, `${t} journal pages`, `${t} pages written in your journal.`, String(t)));
  return out;
}
// Award anything new. Returns the newly earned trophies (oldest-first order of reaching). First run backfills quietly.
export function award(F, list){
  const first = !Array.isArray(F.trophies); if (first) F.trophies = [];
  const have = new Set(F.trophies.map(t => t.id)), now = Date.now(), fresh = [];
  list.forEach((m, i) => { if (have.has(m.id)) return; const t = {...m, at: now + i, book: false}; F.trophies.push(t); fresh.push(t); });
  // keep the newest six on pedestals; older ones go to the book
  const shown = F.trophies.filter(t => !t.book).sort((a, b) => b.at - a.at);
  const moved = shown.slice(PEDESTALS); moved.forEach(t => { t.book = true; t.bookAt = now; });
  return {fresh, first, moved};
}
export const onPedestals = F => (F.trophies || []).filter(t => !t.book).sort((a, b) => b.at - a.at).slice(0, PEDESTALS);
export const inBook = F => (F.trophies || []).filter(t => t.book).sort((a, b) => b.at - a.at);
// what's next in each family, with progress (for the empty pedestal's "coming up")
export function nextUp(c){
  const rows = [], row = (label, have, need) => rows.push({label, have, need});
  const q = TH.quests.find(t => (c.F.totalQuests || 0) < t); if (q) row(`${fmt(q)} quests`, c.F.totalQuests || 0, q);
  Object.entries(APPS).forEach(([k, a]) => { const s = c.ST && c.ST[k]; if (!s || !(s.users > 0)) return; const t = TH.app.find(x => s.users < x); if (t) row(`${fmt(t)} ${s.label || a.unit} on ${a.n}`, s.users, t); });
  const o = TH.objcount.find(t => Object.keys(c.F.objDone || {}).length < t); if (o) row(`${o} weekly objectives`, Object.keys(c.F.objDone || {}).length, o);
  const k = TH.kind.find(t => c.kudos < t); if (k) row(`${k} kind words`, c.kudos, k);
  if (c.revenue && c.revenue.target > 0 && c.revenue.total < c.revenue.target) row(`This month's revenue goal`, Math.round(c.revenue.total), Math.round(c.revenue.target));
  return rows.slice(0, 6);
}

/* ---------- drawings: each family has its own trophy; the plinth carries the number ---------- */
const INK = "#3A2E28", sw = `stroke="${INK}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"`;
function emblem(kind, x, y){
  switch (kind){
    case "star": return `<path d="M${x} ${y-7} l2.1 4.4 4.8 .6 -3.5 3.3 .9 4.8 -4.3 -2.4 -4.3 2.4 .9 -4.8 -3.5 -3.3 4.8 -.6z" fill="#FFFDF6" ${sw}/>`;
    case "note": return `<path d="M${x-2} ${y+5} v-11 l7 -2 v10" fill="none" ${sw}/><circle cx="${x-4}" cy="${y+5}" r="2.6" fill="#FFFDF6" ${sw}/><circle cx="${x+3}" cy="${y+3}" r="2.6" fill="#FFFDF6" ${sw}/>`;
    case "chick": return `<circle cx="${x}" cy="${y+1}" r="6" fill="#FFE38A" ${sw}/><circle cx="${x+1.5}" cy="${y-1}" r=".9" fill="${INK}"/><path d="M${x+5} ${y+1} l3 1 -3 1z" fill="#F2A65A" ${sw}/>`;
    case "sun": return `<circle cx="${x}" cy="${y}" r="4.5" fill="#FFE38A" ${sw}/><path d="M${x} ${y-9} v2 M${x} ${y+7} v2 M${x-9} ${y} h2 M${x+7} ${y} h2" ${sw}/>`;
    case "moon": return `<path d="M${x+3} ${y-7} a7 7 0 1 0 4 11 a6 6 0 0 1 -4 -11z" fill="#FFF6D6" ${sw}/>`;
    case "coin": return `<circle cx="${x}" cy="${y}" r="6.5" fill="#FFE38A" ${sw}/><path d="M${x} ${y-3.5} v7 M${x+2.4} ${y-2.2} q-2.4 -1.6 -4.4 0 q-1 2 2 2.4 q3 .6 2 2.6 q-2 1.5 -4.6 0" fill="none" stroke="${INK}" stroke-width="1.2"/>`;
    case "check": return `<path d="M${x-5} ${y} l3.5 3.5 l7 -7" fill="none" stroke="#FFFDF6" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`;
    case "flag": return `<path d="M${x-4} ${y+7} v-14 l9 3 -9 4" fill="#FFFDF6" ${sw}/>`;
    case "drop": return `<path d="M${x} ${y-7} q6 7 0 13 q-6 -6 0 -13z" fill="#DCEBF6" ${sw}/>`;
    case "shoe": return `<path d="M${x-7} ${y+3} v-6 h5 l2 3 q6 0 7 3 z" fill="#FFFDF6" ${sw}/>`;
    case "fox": return `<path d="M${x-6} ${y-5} l3 3 h6 l3 -3 v6 q-6 7 -12 0z" fill="#FFFDF6" ${sw}/><circle cx="${x-2.4}" cy="${y}" r=".8" fill="${INK}"/><circle cx="${x+2.4}" cy="${y}" r=".8" fill="${INK}"/>`;
    case "heart": return `<path d="M${x} ${y+5} c-8 -5 -6 -12 0 -8 c6 -4 8 3 0 8z" fill="#FFFDF6" ${sw}/>`;
    case "sprout": return `<path d="M${x} ${y+6} v-8 M${x} ${y-1} q-6 -1 -6 -6 q5 0 6 5 M${x} ${y-2} q5 -1 6 -6 q-5 0 -6 5" fill="#DCEFD2" ${sw}/>`;
    case "book": return `<path d="M${x-7} ${y-5} h6 q1 0 1 1 v10 q0 -1 -1 -1 h-6z M${x+7} ${y-5} h-6 q-1 0 -1 1 v10 q0 -1 1 -1 h6z" fill="#FFFDF6" ${sw}/>`;
  }
  return "";
}
export function trophySVG(t, size = 64){
  const L = LOOKS[t.fam] || LOOKS.quests, c = L.col;
  let top = "";
  if (L.shape === "cup") top = `<path d="M16 10 h32 v6 q0 20 -16 22 q-16 -2 -16 -22z" fill="${c}" ${sw}/><path d="M16 14 q-9 0 -8 8 q1 7 10 7 M48 14 q9 0 8 8 q-1 7 -10 7" fill="none" ${sw}/><rect x="28" y="38" width="8" height="8" fill="${c}" ${sw}/><path d="M20 12 q2 14 8 20" fill="none" stroke="#FFFFFF" stroke-width="2" opacity=".55"/>${emblem(L.emblem, 32, 22)}`;
  else if (L.shape === "star") top = `<path d="M32 4 l7 14 15 2 -11 10 3 15 -14 -8 -14 8 3 -15 -11 -10 15 -2z" fill="${c}" ${sw}/><rect x="29" y="40" width="6" height="6" fill="${c}" ${sw}/>${emblem(L.emblem, 32, 24)}`;
  else if (L.shape === "medal") top = `<path d="M22 4 l8 18 M42 4 l-8 18" stroke="${c}" stroke-width="7" stroke-linecap="round"/><path d="M22 4 l8 18 M42 4 l-8 18" fill="none" stroke="${INK}" stroke-width="1" opacity=".5"/><circle cx="32" cy="32" r="13" fill="${c}" ${sw}/><circle cx="32" cy="32" r="9.5" fill="none" stroke="#FFFFFF" stroke-width="1.4" opacity=".6"/>${emblem(L.emblem, 32, 32)}`;
  else if (L.shape === "rosette") top = `<path d="M26 34 l-6 14 5 -2 3 5 4 -14 M38 34 l6 14 -5 -2 -3 5 -4 -14" fill="${c}" ${sw}/>${Array.from({length: 12}, (_, i) => { const a = i*Math.PI/6; return `<circle cx="${(32 + Math.cos(a)*12).toFixed(1)}" cy="${(24 + Math.sin(a)*12).toFixed(1)}" r="5" fill="${c}" ${sw}/>`; }).join("")}<circle cx="32" cy="24" r="10" fill="#FFFDF6" ${sw}/><circle cx="32" cy="24" r="7" fill="${c}"/>${emblem(L.emblem, 32, 24)}`;
  else if (L.shape === "plaque") top = `<path d="M14 8 h36 v18 q0 16 -18 20 q-18 -4 -18 -20z" fill="${c}" ${sw}/><path d="M18 12 h28 v14 q0 12 -14 15 q-14 -3 -14 -15z" fill="none" stroke="#FFFFFF" stroke-width="1.4" opacity=".6"/>${emblem(L.emblem, 32, 24)}`;
  else top = `<ellipse cx="32" cy="42" rx="16" ry="4" fill="${c}" ${sw}/><rect x="16" y="30" width="32" height="12" fill="${c}" ${sw}/><ellipse cx="32" cy="30" rx="16" ry="4" fill="${c}" ${sw}/><rect x="20" y="18" width="24" height="12" fill="${c}" ${sw}/><ellipse cx="32" cy="18" rx="12" ry="3.5" fill="${c}" ${sw}/><path d="M22 12 l4 -7 6 6 6 -6 4 7z" fill="${c}" ${sw}/>${emblem(L.emblem, 32, 25)}`;
  const label = esc(String(t.short || t.n || "")).slice(0, 6);
  return `<svg viewBox="0 0 64 72" width="${size}" height="${size*72/64}" aria-hidden="true">${top}<path d="M18 46 h28 l3 10 h-34z" fill="#8B5E3C" ${sw}/><rect x="12" y="56" width="40" height="12" rx="2" fill="#6B4630" ${sw}/><rect x="20" y="58.5" width="24" height="7" rx="1" fill="#E8D3A8"/><text x="32" y="64.2" text-anchor="middle" font-family="Mulish, sans-serif" font-weight="800" font-size="${label.length > 4 ? 4.6 : 5.6}" fill="${INK}">${label}</text></svg>`;
}

/* ---------- panels ---------- */
const when = ms => new Date(ms).toLocaleDateString("en-GB", {day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Singapore"});
export function pedestalPanel(t, nexts, canBook){
  if (!t) return `<span class="tape gingham" aria-hidden="true"></span><h2>An empty pedestal</h2><p class="sub">Your next trophy stands here. Coming up:</p>`
    + (nexts.length ? `<ul class="hlist tnext">${nexts.map(r => `<li><span><b>${esc(r.label)}</b><small>${fmt(r.have)} of ${fmt(r.need)}</small></span><span class="clbar"><i style="width:${Math.min(100, Math.round(100*r.have/r.need))}%"></i></span></li>`).join("")}</ul>` : `<p class="muted">Keep going: quests, objectives and app milestones all earn trophies.</p>`)
    + `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
  return `<span class="tape gingham" aria-hidden="true"></span><div class="tcard"><div class="tbig">${trophySVG(t, 150)}</div><h2>${esc(t.label)}</h2><p class="sub">${esc(t.note)}</p><p class="muted">Earned ${esc(when(t.at))}</p></div>
    <div class="actions">${canBook ? `<button class="btn primary small" data-tr="book" data-id="${esc(t.id)}">Put it in the trophy book</button>` : ""}<button class="btn alt small" data-close="1">Close</button></div>`;
}
export function bookPanel(F, free){
  const pages = inBook(F);
  return `<span class="tape stripe" aria-hidden="true"></span><h2>The trophy book</h2><p class="sub">Every trophy that's stepped off its pedestal, with when and why.</p>`
    + (pages.length ? `<div class="tbook">${pages.map(t => `<article class="tpage"><figure class="polaroid tpol">${trophySVG(t, 92)}<figcaption>${esc(t.short || "")}</figcaption></figure><div><h3>${esc(t.label)}</h3><p>${esc(t.note)}</p><p class="muted">Earned ${esc(when(t.at))}</p>${free ? `<button class="btn alt small" data-tr="unbook" data-id="${esc(t.id)}">Back on a pedestal</button>` : ""}</div></article>`).join("")}</div>`
      : `<p class="muted">No pages yet. When the pedestals fill up, the oldest trophy steps into the book.</p>`)
    + `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
}
export function wireTrophies(root, F, api){
  root.querySelectorAll("[data-tr]").forEach(b => b.onclick = () => {
    const t = (F.trophies || []).find(x => x.id === b.dataset.id); if (!t) return;
    if (b.dataset.tr === "book") { t.book = true; t.bookAt = Date.now(); api.save(); api.undoable("Into the trophy book", () => { t.book = false; api.save(); api.rerender(); }); api.close(); }
    if (b.dataset.tr === "unbook" && onPedestals(F).length < PEDESTALS) { t.book = false; api.save(); api.rerender(); }
  });
}

/* ---------- affirmations: fresh every day (Claude writes them from Mel's plans when it can; a kind list otherwise) ---------- */
const BASE = ["I build things that help people, and it shows.", "I can do hard things and still be gentle with myself.", "Small steps every day add up to big change.",
  "I'm allowed to rest. Rest is part of the work.", "My ideas are worth sharing.", "I'm a good mum and a good founder, both at once.",
  "I don't have to do it all today. Just the next thing.", "Clients come back because I care.", "Progress, not perfection.", "I trust myself to figure it out.",
  "My voice is clear and it matters.", "I'm proud of how far I've come.", "Today I choose calm over rush.", "I'm building something that lasts.",
  "Good things are on their way to me.", "I keep my promises to myself.", "I am creative, capable and kind.", "Every 'no' makes room for the right 'yes'.",
  "I celebrate my wins, even the tiny ones.", "My family and my work both get the best of me, in turn."];
export function dailyAffirmations(day = dayKey()){
  const n = Math.floor(Date.parse(day + "T00:00:00Z")/864e5), out = [];
  for (let i = 0; out.length < 5; i++) { const a = BASE[(n*7 + i*3) % BASE.length]; if (!out.includes(a)) out.push(a); }
  return out;
}
export function affirmPanel(A, busy, canWrite){
  const list = (A && A.day === dayKey() && A.items && A.items.length) ? A.items : dailyAffirmations();
  return `<span class="tape dots" aria-hidden="true"></span><h2>Affirmations</h2><p class="sub">Today's, fresh every morning. Read one out loud.</p>
    <ul class="taff">${list.map((a, i) => `<li><span>${esc(a)}</span><button class="kdel tkeep${(A && A.kept || []).includes(a) ? " on" : ""}" data-af="keep" data-i="${i}" aria-label="Keep this one">♡</button></li>`).join("")}</ul>
    ${(A && A.kept && A.kept.length) ? `<p class="eyebrow" style="margin-top:14px">Ones you kept</p><ul class="taff kept">${A.kept.map((a, i) => `<li><span>${esc(a)}</span><button class="kdel" data-af="unkeep" data-i="${i}" aria-label="Let this one go">×</button></li>`).join("")}</ul>` : ""}
    <div class="actions">${canWrite ? `<button class="btn alt small" data-af="fresh" ${busy ? "disabled" : ""}>${busy ? "Writing…" : "Write me new ones"}</button>` : ""}<button class="btn alt small" data-close="1">Close</button></div>`;
}
export function wireAffirm(root, A, list, api){
  root.querySelectorAll("[data-af]").forEach(b => b.onclick = () => {
    const k = b.dataset.af; A.kept = A.kept || [];
    if (k === "keep") { const a = list[+b.dataset.i]; if (a && !A.kept.includes(a)) A.kept.unshift(a); else A.kept = A.kept.filter(x => x !== a); A.kept = A.kept.slice(0, 30); api.save(); api.rerender(); }
    if (k === "unkeep") { const [gone] = A.kept.splice(+b.dataset.i, 1); api.save(); api.undoable("Affirmation let go", () => { A.kept.unshift(gone); api.save(); api.rerender(); }); api.rerender(); }
    if (k === "fresh") api.fresh();
  });
}
