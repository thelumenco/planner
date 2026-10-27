// Mulled wine (round 153, Mel): from late November (the 20th) until Boxing Day, a big pot on the stove in the wine
// shop's kitchen. A bottle of Mel's own red off the shelves, and two or three things to mull it with: spices from Hana's
// market (cinnamon, cloves, star anise, cardamom, ginger) and fruit or honey from the orchard, the garden and the farm
// (orange, lemon, apple, raspberries, honey). Like the gelato flavours, every new mix is found once and named, then
// made again whenever she likes. Half an hour mulling, then ten cups in the pot: they sell at the wine shop counter, to
// the terrace's occasions (Christmas lunch, New Year's Eve), and the more that's in it, the more a cup costs.
// State: F.mull = {recipes: [{id, adds, name, col}], pot: {id, start, dur} | null, cups, cupId, price, made}
import { esc, dayKey } from "../util.js";
import { icon } from "../art/icons.js";

export const MULL = {cups: 10, dur: 30*60000, base: ["red", "tempranillo", "pinot", "priory"], min: 2, max: 3};
export const ADDS = {
  sp_cinnamon: {n: "Cinnamon", col: "#A8693F", spice: true}, sp_clove: {n: "Cloves", col: "#5A3A2A", spice: true}, sp_anise: {n: "Star anise", col: "#7A4A30", spice: true},
  sp_cardamom: {n: "Cardamom", col: "#9CAA6A", spice: true}, sp_ginger: {n: "Ginger", col: "#E3B04B", spice: true},
  orange: {n: "Orange", col: "#E8913A"}, lemon: {n: "Lemon", col: "#F3D24A"}, apple: {n: "Apple", col: "#C8432F"}, raspberry: {n: "Raspberries", col: "#C2334D"}, honey: {n: "Honey", col: "#E3B04B"}
};
// the season: 20 November to 26 December
export const mulledSeason = (day = dayKey()) => { const md = day.slice(5); return md >= "11-20" && md <= "12-26"; };
export function mullState(F){ F.mull = F.mull || {}; const m = F.mull; m.recipes = m.recipes || []; if (!("pot" in m)) m.pot = null; m.cups = m.cups || 0; m.made = m.made || 0; m.rack = m.rack || {}; return m; }
// round 169: the spice rack beside the pot. Spices (and anything else that mulls) wait here all year; the pot takes
// from the backpack first, then the rack
export const rackable = id => !!ADDS[id];
const got = (F, m, a) => ((F.inv || {})[a] || 0) + (m.rack[a] || 0);
const use = (F, m, a) => { if ((F.inv || {})[a] > 0) { F.inv[a]--; if (F.inv[a] <= 0) delete F.inv[a]; } else { m.rack[a]--; if (m.rack[a] <= 0) delete m.rack[a]; } };
export function toRack(F, id, n = 99){ const m = mullState(F), k = Math.min(n, (F.inv || {})[id] || 0); if (!rackable(id) || !k) return 0; F.inv[id] -= k; if (F.inv[id] <= 0) delete F.inv[id]; m.rack[id] = (m.rack[id] || 0) + k; return k; }
export function fromRack(F, id, n = 99){ const m = mullState(F), k = Math.min(n, m.rack[id] || 0); if (!k) return 0; m.rack[id] -= k; if (m.rack[id] <= 0) delete m.rack[id]; F.inv = F.inv || {}; F.inv[id] = (F.inv[id] || 0) + k; return k; }
const rackHTML = (F, m) => { const on = Object.keys(m.rack).filter(a => m.rack[a] > 0), bag = Object.keys(ADDS).filter(a => ADDS[a].spice && (F.inv || {})[a] > 0);
  return `<p class="eyebrow" style="margin:12px 0 6px">The spice rack</p>${on.length ? `<ul class="hlist wlist">${on.map(a => `<li><span class="wpic">${icon(a, 28)}</span><span class="wtxt"><b>${esc(ADDS[a].n)}</b><small>${m.rack[a]} on the rack</small></span><span class="orbtns"><button class="btn small alt" data-mull="unrack:${a}:1">Take 1</button><button class="btn small alt" data-mull="unrack:${a}:99">All</button></span></li>`).join("")}</ul>` : `<p class="muted">Empty jars, for now.</p>`}`
    + (bag.length ? `<p class="eyebrow" style="margin:10px 0 6px">From your backpack</p><div class="actions">${bag.map(a => `<button class="btn small alt" data-mull="rack:${a}:1">Put 1 ${esc(ADDS[a].n.toLowerCase())} on the rack</button>${F.inv[a] > 1 ? `<button class="btn small alt" data-mull="rack:${a}:99">All ${F.inv[a]}</button>` : ""}`).join("")}</div>` : ""); };
const keyOf = adds => [...adds].sort().join("+");
const SPECIAL = {"orange+sp_cinnamon+sp_clove": "The Classic", "apple+sp_cinnamon+sp_ginger": "Apple Pie", "honey+lemon+sp_ginger": "Hot Toddy Mull", "orange+sp_anise+sp_cardamom": "Spice Market",
  "raspberry+sp_cinnamon": "Winter Berry", "honey+orange+sp_clove": "Golden Hour", "apple+honey+sp_cinnamon": "Grandma's Kitchen", "lemon+sp_anise": "Starlight"};
export function mullName(adds){ const k = keyOf(adds); if (SPECIAL[k]) return SPECIAL[k]; const ns = [...adds].sort((a, b) => (ADDS[b].spice ? 0 : 1) - (ADDS[a].spice ? 0 : 1)).map(a => ADDS[a].n);
  return ns.length === 2 ? `${ns[0]} & ${ns[1]}` : `${ns.slice(0, -1).join(", ")} & ${ns[ns.length - 1]}`; }
export const cupPrice = adds => 4 + adds.length;
export const potLeft = (m, t = Date.now()) => m.pot ? Math.max(0, m.pot.start + m.pot.dur - t) : 0;
export const isBase = s => s && s.n > 0 && MULL.base.includes(s.type);
// start a pot: a bottle off the shelf (v = vineState(F)) and two or three things to mull it with, from the backpack
export function mullStart(F, v, baseId, adds, day = dayKey()){
  const m = mullState(F); adds = [...new Set(adds)].filter(a => ADDS[a]);
  if (!mulledSeason(day)) return {msg: "Mulled wine season starts on the 20th of November."};
  if (m.pot || m.cups > 0) return {msg: m.pot ? "The pot's already on." : "There's still mulled wine in the pot: let it sell first."};
  if (adds.length < MULL.min || adds.length > MULL.max) return {msg: "Two or three things to mull it with."};
  const base = v.shelf.find(s => s.id === baseId); if (!isBase(base)) return {msg: "Pick one of your reds off the shelves."};
  if (adds.some(a => !(got(F, m, a) > 0))) return {msg: "You're missing something for that."};
  base.n--; adds.forEach(a => use(F, m, a));
  const id = keyOf(adds); let r = m.recipes.find(x => x.id === id), fresh = false;
  if (!r) { fresh = true; r = {id, adds: [...adds].sort(), name: mullName(adds), found: day}; m.recipes.push(r); }
  m.pot = {id, start: Date.now(), dur: MULL.dur, base: base.name};
  return {recipe: r, fresh, msg: fresh ? `A new mulled wine: ${r.name}! The pot's on: ready in half an hour.` : `${r.name} again. The pot's on: half an hour.`};
}
// the pot's done: ten cups, ready to sell
export function mullTick(F, t = Date.now()){ const m = mullState(F); if (!m.pot || potLeft(m, t)) return null; const r = m.recipes.find(x => x.id === m.pot.id); m.pot = null;
  m.cups = MULL.cups; m.cupId = r.id; m.price = cupPrice(r.adds); m.made++; return r; }
export function sellCup(F){ const m = mullState(F); if (!(m.cups > 0)) return 0; m.cups--; return m.price || 5; }
const shut = `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
const swatch = adds => `<span class="mullsw">${adds.map(a => `<i style="background:${ADDS[a].col}"></i>`).join("")}</span>`;
export function mullPanel(F, v, st = {}, day = dayKey()){
  const m = mullState(F);
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>The mulling pot</h2>`;
  if (!mulledSeason(day)) return h + `<p class="sub">The big copper pot, scrubbed and waiting on the back of the stove. Mulled wine season starts on the 20th of November and runs till Boxing Day. Pick up some spices at Hana's market before then (cinnamon, cloves, star anise, cardamom, ginger) and keep them on the rack here.</p>${rackHTML(F, m)}${m.recipes.length ? `<p class="muted">Your mulled wines so far: ${m.recipes.map(r => esc(r.name)).join(", ")}.</p>` : ""}` + shut;
  if (m.pot) { const left = potLeft(m); return h + `<p class="sub">${esc((m.recipes.find(r => r.id === m.pot.id) || {}).name || "Mulled wine")} is mulling: the whole kitchen smells of Christmas. Ready in ${Math.max(1, Math.ceil(left/60000))} minutes.</p><span class="clbar"><i style="width:${Math.round(100*(1 - left/m.pot.dur))}%"></i></span>` + shut; }
  if (m.cups > 0) { const r = m.recipes.find(x => x.id === m.cupId) || {name: "Mulled wine", adds: []}; return h + `<p class="sub">${m.cups} cups of ${esc(r.name)} left in the pot, ${m.price} coins a cup. Celeste ladles it out at the counter, and out on the terrace.</p>` + shut; }
  const reds = v.shelf.filter(isBase), have = Object.keys(ADDS).filter(a => got(F, m, a) > 0), pick = st.adds || [];
  h += `<p class="sub">A bottle of your red, and two or three things to mull it with. Half an hour on a low heat, then ten cups.</p>`;
  if (m.recipes.length) h += `<p class="eyebrow" style="margin:10px 0 6px">Make one you know</p><ul class="hlist wlist">${m.recipes.map(r => { const ok = r.adds.every(a => got(F, m, a) > 0) && reds.length;
    return `<li><span class="wtxt"><b>${esc(r.name)}</b><small>${swatch(r.adds)} ${r.adds.map(a => esc(ADDS[a].n)).join(", ")} · ${cupPrice(r.adds)} a cup</small></span><button class="btn small ${ok ? "primary" : "alt"}" data-mull="again:${r.id}" ${ok ? "" : "disabled"}>Mull it</button></li>`; }).join("")}</ul>`;
  if (!reds.length) return h + `<p class="muted">You'll need a bottle of red on the shelves for the base: Merlot-ish house red, Tempranillo or Pinot.</p>` + shut;
  h += `<p class="eyebrow" style="margin:10px 0 6px">The wine</p><div class="gchips">${reds.map(s => `<button class="gchip${st.base === s.id ? " on" : ""}" data-mull="base:${s.id}" aria-pressed="${st.base === s.id}">${esc(s.name)} (${s.n})</button>`).join("")}</div>`;
  h += `<p class="eyebrow" style="margin:10px 0 6px">Mull it with (two or three)</p>${have.length ? `<div class="gchips">${have.map(a => `<button class="gchip${pick.includes(a) ? " on" : ""}" data-mull="add:${a}" aria-pressed="${pick.includes(a)}"><i class="mulldot" style="background:${ADDS[a].col}"></i>${esc(ADDS[a].n)} (${got(F, m, a)})</button>`).join("")}</div>` : `<p class="muted">Nothing to mull with yet: spices from Hana's market; oranges, lemons and apples from Ma Ma's orchard; raspberries; honey from the farm.</p>`}`;
  h += rackHTML(F, m);
  const ready = st.base && pick.length >= MULL.min && pick.length <= MULL.max, known = ready && m.recipes.some(r => r.id === keyOf(pick));
  return h + `<div class="actions"><button class="btn primary" data-mull="go" ${ready ? "" : "disabled"}>${ready ? (known ? `Mull ${esc(mullName(pick))} again` : "Into the pot: something new") : "Into the pot"}</button></div>` + shut;
}
