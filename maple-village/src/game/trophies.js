// Trophies: milestones you reach, kept in the trophy room off the town hall. Each family of milestone has its own
// trophy (same look, a new number on the plinth each time). The newest six stand on pedestals; the rest live in the
// trophy book (a journal-like page each: what it was for, when, and a polaroid of the trophy). When the pedestals
// are full, the oldest moves to the book on its own. Stored in the game save (F.trophies), so it follows you.
import { esc, dayKey } from "../util.js";

export const PEDESTALS = 6;
const fmt = n => Number(n).toLocaleString("en-GB");
// families: id prefix -> {shape, col, emblem}
export const LOOKS = {
  quests: {shape: "cup", col: "#E8B84A", emblem: "star"}, favours: {shape: "rosette", col: "#5B8FD6", emblem: "check"},
  water: {shape: "medal", col: "#7FB8E8", emblem: "drop"}, steps: {shape: "medal", col: "#F2A65A", emblem: "shoe"},
  chum: {shape: "plaque", col: "#EE8B3A", emblem: "fox"}, friends: {shape: "plaque", col: "#F4A0B5", emblem: "heart"},
  harvest: {shape: "cup", col: "#7BB37A", emblem: "sprout"}, journal: {shape: "star", col: "#C9A3E8", emblem: "book"}
};
const TH = {quests: [10, 25, 50, 100, 250, 500, 1000, 2500], favours: [5, 10, 25, 50, 100], friends: [1, 3, 5, 10], harvest: [10, 50, 100, 250, 500], journal: [10, 50, 100, 250], streak: [7, 14]};

// ctx: {F, levels, levelIndex, journal, water, steps (your daily goals)}
// -> every milestone reached so far, as {id, fam, n, label, note, short}
export function reached(c){
  const out = [], add = (fam, id, n, label, note, short) => out.push({id, fam, n, label, note, short});
  TH.quests.filter(t => (c.F.totalQuests || 0) >= t).forEach(t => add("quests", "quests-" + t, t, `${fmt(t)} quests done`, `${fmt(t)} tasks and favours done, one at a time.`, fmt(t)));
  const board = c.F.board || {}, favours = board.done || 0, best = Object.values(board.hearts || {}).filter(n => n >= 5).length;
  TH.favours.filter(t => favours >= t).forEach(t => add("favours", "favours-" + t, t, `${t} village requests`, `${t} villagers' requests, handed over in person.`, String(t)));
  TH.friends.filter(t => best >= t).forEach(t => add("friends", "friends-" + t, t, `${t} best friend${t > 1 ? "s" : ""} in the village`, `${t} villager${t > 1 ? "s" : ""} with all five hearts.`, String(t)));
  const hist = c.F.history || {}, days = Object.keys(hist).sort(), streak = key => { let n = 0, best = 0, prev = null;
    days.forEach(d => { const ok = !!key(hist[d]), next = prev && Date.parse(d) - Date.parse(prev) === 864e5; n = ok ? (next && n > 0 ? n + 1 : 1) : 0; best = Math.max(best, n); prev = d; }); return best; };
  const wS = streak(h => (h.water || 0) >= (c.water || 2000)), sS = streak(h => (h.steps || 0) >= (c.steps || 5000));
  TH.streak.filter(t => wS >= t).forEach(t => add("water", "water-" + t, t, `${t} days of your water goal in a row`, `Your water goal, ${t} days running.`, t + "d"));
  TH.streak.filter(t => sS >= t).forEach(t => add("steps", "steps-" + t, t, `${t} days of your step goal in a row`, `Your step goal or more, ${t} days running.`, t + "d"));
  (c.levels || []).forEach((l, i) => { if (i > 0 && i <= c.levelIndex) add("chum", "chum-" + i, i, `Friendship: ${l.name}`, `Your pet's friendship reached "${l.name}".`, "Lv" + i); });
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
  const board = c.F.board || {}, fv = TH.favours.find(t => (board.done || 0) < t); if (fv) row(`${fv} village requests`, board.done || 0, fv);
  const best = Object.values(board.hearts || {}).filter(n => n >= 5).length, fr = TH.friends.find(t => best < t); if (fr) row(`${fr} best friend${fr > 1 ? "s" : ""}`, best, fr);
  const hv = TH.harvest.find(t => (c.F.harvestTotal || 0) < t); if (hv) row(`${hv} harvests`, c.F.harvestTotal || 0, hv);
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
const when = ms => new Date(ms).toLocaleDateString("en-GB", {day: "numeric", month: "long", year: "numeric"});
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
