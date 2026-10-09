// Ronda's places (round 107, round 3): the covered market (Rafael's almonds and oil, jamón, payoyo, membrillo,
// Seville oranges, a picnic basket, and once he trusts you, Tempranillo vine cuttings), the tapas bar (taste a
// dish and it's yours to cook at home), Doña Carmen's sweet shop, the convent hatch, and Lucía's tile shop (eight
// painted tiles: the full set becomes a tiled bench by the pond at home). A picnic at the Alameda balcony.
// State: F.ronda = {days: [day keys visited], tiles: {id: true}, bench, picnics, picnicDay}; F.learned = {tapas id: true}.
import { esc, dayKey } from "../util.js";
import { icon } from "../art/icons.js";
import { ITEMS, seasonOf } from "../data/items.js";
import { TOWN_GOODS, TILES, TASTINGS } from "../data/towns.js";
import { TAPAS, needText } from "./kitchen.js";
import { addCuttings, vineState } from "./vineyard.js";

// the goods become ordinary items (the backpack, the kitchen, the gelato fridge, the fillings shelf, gifts)
Object.entries(TOWN_GOODS).forEach(([id, g]) => { if (!ITEMS[id]) ITEMS[id] = {n: g.n, ico: id, kind: g.kind, price: g.price, sell: g.sell, what: g.what, ...(g.to ? {to: g.to, say: g.say} : {}), ...(g.says ? {says: g.says} : {})}; });

export const VINES = {price: 120, n: 3};   // three Tempranillo cuttings
export function rondaState(F){ F.ronda = F.ronda || {}; const r = F.ronda; r.days = r.days || []; r.tiles = r.tiles || {}; r.picnics = r.picnics || 0; return r; }
// a day in Ronda (counted once per day): Rafael sells vines from the second visit
export function rondaVisit(F, day = dayKey()){ const r = rondaState(F); if (!r.days.includes(day)) r.days = [...r.days, day].slice(-30); return r.days.length; }
export const trusted = F => rondaState(F).days.length >= 2;

export function buyGood(F, id, addInv){
  const g = TOWN_GOODS[id]; if (!g || F.coins < g.price) return null;
  F.coins -= g.price; addInv(id, 1); return g;
}
export function buyVines(F){ if (!trusted(F) || F.coins < VINES.price) return null; F.coins -= VINES.price; addCuttings(F, "tempranillo", VINES.n); return true; }
export function taste(F, id){
  const t = TASTINGS[id]; if (!t || F.coins < t.price) return null;
  F.coins -= t.price; F.learned = F.learned || {}; const fresh = !F.learned[id]; F.learned[id] = true; return {fresh, line: t.line};
}
export const tileOn = (id, day = dayKey()) => !TILES[id].seasons || TILES[id].seasons.includes(seasonOf(day));
export function buyTile(F, id, day = dayKey()){
  const r = rondaState(F), t = TILES[id]; if (!t || r.tiles[id] || !tileOn(id, day) || F.coins < t.price) return null;
  F.coins -= t.price; r.tiles[id] = true; const all = Object.keys(TILES).every(k => r.tiles[k]); if (all) r.bench = true;
  return {t, all};
}
export function picnic(F, addInv, day = dayKey()){
  const r = rondaState(F); if (!(F.inv && F.inv.picnic > 0)) return null;
  addInv("picnic", -1); r.picnics++; r.picnicDay = day; return true;
}

/* ---------- panels ---------- */
const shut = `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
const coin = () => icon("coin", 13);
const goodRow = (F, id) => { const g = TOWN_GOODS[id], have = (F.inv || {})[id] || 0;
  return `<li><span class="wpic">${icon(id, 28)}</span><span class="wtxt"><b>${esc(g.n)}</b><small>${esc(g.what || g.say || "")}${have ? ` (${have} in your backpack)` : ""}</small></span><button class="btn small primary" data-rbuy="${id}" ${F.coins >= g.price ? "" : "disabled"}>${g.price} ${coin()}</button></li>`; };
const shopGoods = shop => Object.keys(TOWN_GOODS).filter(id => TOWN_GOODS[id].shop === shop);
export function marketPanel(F){
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>The covered market</h2><p class="sub">Crates of oranges, sacks of almonds, hams hanging from the beams. Rafael's family stall is at the front: five generations of olive oil.</p>`;
  h += `<ul class="hlist wlist">${shopGoods("mercado").map(id => goodRow(F, id)).join("")}</ul>`;
  const v = vineState(F);
  h += `<h3 class="ph3">Vine cuttings</h3>` + (trusted(F)
    ? `<ul class="hlist wlist"><li><span class="wpic">${icon("grape_tempranillo", 28)}</span><span class="wtxt"><b>Tempranillo cuttings (${VINES.n})</b><small>From Rafael's own vines in the valley. Plant them on a trellis at home for a deep Spanish red.${v.tempra ? ` You have ${v.cuttings.tempranillo || 0} to plant.` : ""}</small></span><button class="btn small primary" data-rbuy="vines" ${F.coins >= VINES.price ? "" : "disabled"}>${VINES.price} ${coin()}</button></li></ul>`
    : `<p class="muted">Rafael's got Tempranillo vines in the valley. "Cuttings? For a stranger? Come back again, and we'll talk."</p>`);
  return h + shut;
}
export function tapasBarPanel(F){
  const L = F.learned || {};
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>The tapas bar</h2><p class="sub">A table on the terrace, a little plate at a time. Taste a dish and you'll know how to make it: it goes on your stove at home.</p>`;
  h += `<ul class="hlist wlist">${Object.entries(TASTINGS).map(([id, t]) => { const T = TAPAS[id];
    return `<li><span class="wtxt"><b>${esc(T.n)}${L[id] ? " ✓" : ""}</b><small>${L[id] ? `In your recipe book: ${esc(needText(T.need))}.` : "Not tried yet."}</small></span><button class="btn small ${L[id] ? "alt" : "primary"}" data-rtaste="${id}" ${F.coins >= t.price ? "" : "disabled"}>${L[id] ? "Again" : "Taste"} · ${t.price} ${coin()}</button></li>`; }).join("")}</ul>`;
  return h + shut;
}
export function shopPanel(F, shop){
  const head = {dulces: ["Doña Carmen's sweet shop", "Trays of yemas like little golden suns, and almond cakes dusted with sugar. Doña Carmen learned the yemas from the nuns when she was a girl."],
    convento: ["The convent hatch", "A wooden turntable in the wall. You knock, say what you'd like, put your coins on it, and it turns: biscuits, from nuns you never see."]}[shop];
  return `<span class="tape gingham" aria-hidden="true"></span><h2>${esc(head[0])}</h2><p class="sub">${esc(head[1])}</p><ul class="hlist wlist">${shopGoods(shop).map(id => goodRow(F, id)).join("")}</ul>` + shut;
}
const tilePic = (t, own) => `<svg viewBox="0 0 40 40" width="44" height="44" aria-hidden="true"><rect x="2" y="2" width="36" height="36" rx="2" fill="${own ? "#FFFDF6" : "#EFE8DA"}" stroke="#3b3530" stroke-width="1.4"/><rect x="6" y="6" width="28" height="28" fill="none" stroke="#3E6BAE" stroke-width="2"/><circle cx="20" cy="20" r="8" fill="${t.col}" opacity="${own ? 1 : .35}"/><path d="M6 6l5 5M34 6l-5 5M6 34l5-5M34 34l-5-5" stroke="#3E6BAE" stroke-width="1.4"/></svg>`;
export function tilePanel(F, day = dayKey()){
  const r = rondaState(F), n = Object.keys(TILES).filter(k => r.tiles[k]).length;
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>Lucía's tile shop</h2><p class="sub">Lucía paints a tile of every view in Ronda. Collect all eight and they'll make a tiled bench by your pond at home. ${n}/8 so far.${r.bench ? " The bench is done!" : ""}</p>`;
  h += `<div class="tilegrid">${Object.entries(TILES).map(([id, t]) => { const own = r.tiles[id], on = tileOn(id, day);
    return `<button class="tile${own ? " own" : ""}" data-rtile="${id}" ${own || !on || F.coins < t.price ? "disabled" : ""}>${tilePic(t, own)}<b>${esc(t.n)}</b><small>${own ? "yours" : on ? `${t.price} coins` : `in ${t.seasons.join(" and ")}`}</small></button>`; }).join("")}</div>`;
  h += `<h3 class="ph3">And for presents</h3><ul class="hlist wlist">${shopGoods("azulejos").map(id => goodRow(F, id)).join("")}</ul>`;
  return h + shut;
}
export function rondaPanel(F, view){
  return view === "mercado" ? marketPanel(F) : view === "tapas" ? tapasBarPanel(F) : view === "azulejos" ? tilePanel(F) : shopPanel(F, view);
}
// the tiled bench by the pond at home, once all eight tiles are collected (core.js draws it at home base)
export const tileBench = (x, y) => `<g class="tilebench" pointer-events="none" filter="url(#wob)"><rect x="${x - 34}" y="${y - 20}" width="68" height="14" rx="2" fill="#FFFDF6" stroke="#3b3530" stroke-width="1.2"/>${Object.values(TILES).map((t, i) => `<rect x="${x - 32 + i*8}" y="${y - 18}" width="7" height="10" fill="${i % 2 ? "#3E6BAE" : "#FFFDF6"}" stroke="#3b3530" stroke-width=".5"/><circle cx="${x - 28.5 + i*8}" cy="${y - 13}" r="2.2" fill="${t.col}"/>`).join("")}
  <rect x="${x - 36}" y="${y - 6}" width="72" height="16" rx="2" fill="#F3ECDD" stroke="#3b3530" stroke-width="1.2"/>${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<rect x="${x - 34 + i*8.6}" y="${y - 3}" width="7.6" height="9" fill="${i % 2 ? "#F3C969" : "#3E6BAE"}" stroke="#3b3530" stroke-width=".5"/>`).join("")}</g>`;
