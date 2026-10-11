// The mill workshop (round 153, Mel: "infused olive oils that sell for more; goat's milk soaps, lotions, olive oil
// soaps, all mixed with berries, fruits and herbs"). At the workbench upstairs in the old mill, beside the press:
//   infused oils: two bottles of olive oil and one or two herbs or fruits (rosemary, garlic, basil, thyme, chives,
//     lemon, orange, lavender) steep for six hours: two bottles worth half as much again as plain oil.
//   soaps: goat's milk (two) or olive oil (one) and one or two add-ins (lavender, rose, honey, rosemary, mint, thyme,
//     orange, lemon, raspberries); a day curing on the rack, then six bars.
//   lotions: goat's milk, olive oil and one scent (lavender, rose, honey, orange, lemon, mint): an hour, three jars.
// Like the gelato flavours, every new mix is found once and named, then made again. Herbs come from the garden and the
// greenhouse, lavender and roses from Ma Ma's flower farm (her bouquets); fruit from the orchard.
// What's made goes onto the mill's shelves (the store). Until the Mill Shop's open the wine shop sells a little of it
// from a "from the mill" shelf by the counter; once it's open, Hazel sells it all day downstairs. Mel can take things
// for herself or to give away. And Tomi (Ines's little brother), at the mill 10 to 5 but Sundays, presses whatever's in the olive crate into the mill's own
// bottles, and infuses oil from the herb basket (Mel leaves herbs there) using the recipes Mel's found.
// State: F.craft = {recipes: [{id, kind, base, adds, name}], steep: [{id, start, dur}], cure: [{id, start, dur}],
//   pot: {id, start, dur} | null, store: {itemId: n}, basket: {herb: n}, oil: n (the mill's own plain bottles), sold}
import { esc, dayKey } from "../util.js";
import { ITEMS } from "../data/items.js";

export const CRAFT = {steep: 6*3600e3, cure: 24*3600e3, lotion: 3600e3, jars: 3, rack: 3, oilPer: 2, soapPer: 6, lotionPer: 3};
export const HERB = {
  rosemary: {n: "Rosemary", col: "#6E8A5A", oil: true, soap: true}, garlic: {n: "Garlic", col: "#EDE6D0", oil: true}, basil: {n: "Basil", col: "#4E8A4E", oil: true},
  thyme: {n: "Thyme", col: "#8AA06A", oil: true, soap: true}, chives: {n: "Chives", col: "#5E9A4A", oil: true}, mint: {n: "Mint", col: "#7FCBA4", soap: true, lotion: true},
  lemon: {n: "Lemon", col: "#F3D24A", oil: true, soap: true, lotion: true}, orange: {n: "Orange", col: "#E8913A", oil: true, soap: true, lotion: true},
  raspberry: {n: "Raspberries", col: "#C2334D", soap: true}, honey: {n: "Honey", col: "#E3B04B", soap: true, lotion: true},
  bq_lavender: {n: "Lavender", col: "#A68FCB", oil: true, soap: true, lotion: true}, bq_rose: {n: "Rose", col: "#E8A0B4", soap: true, lotion: true},
  // round 154 (Mel): more fruit from the garden and orchard, and more of Ma Ma's flowers
  strawberry: {n: "Strawberry", col: "#E8566C", soap: true, lotion: true}, blueberry: {n: "Blueberry", col: "#5A6AB8", soap: true}, apple: {n: "Apple", col: "#9CC27E", soap: true},
  bq_sweetpea: {n: "Sweet pea", col: "#E8B4D8", soap: true, lotion: true}, bq_camellia: {n: "Camellia", col: "#E86A8A", soap: true, lotion: true}, bq_heather: {n: "Heather", col: "#B07AB8", soap: true}
};
export const KINDS = {oil: {n: "Infused oils", max: 2, price: 28, sell: 24}, soap: {n: "Soaps", max: 2, price: 8, sell: 6}, lotion: {n: "Lotions", max: 1, price: 16, sell: 13}};   // (every recipe sells for more than its ingredients cost: smoke test)
export function craftState(F){ F.craft = F.craft || {}; const c = F.craft; c.recipes = c.recipes || []; c.steep = c.steep || []; c.cure = c.cure || []; if (!("pot" in c)) c.pot = null;
  c.store = c.store || {}; c.basket = c.basket || {}; c.oil = c.oil || 0; c.sold = c.sold || {}; return c; }
const keyOf = (kind, base, adds) => `${kind}_${base ? base + "_" : ""}${[...adds].sort().join("-")}`;
const nm = a => HERB[a].n;
export function craftName(kind, base, adds){ const a = [...adds].sort().map(nm), list = a.length === 2 ? `${a[0]} & ${a[1]}` : a[0];
  return kind === "oil" ? `${list} olive oil` : kind === "lotion" ? `${list} hand lotion` : `${list} ${base === "goatmilk" ? "goat's milk" : "olive oil"} soap`; }
export const itemId = r => "mc_" + r.id;
// each recipe is an item: something to keep, give, or sell (the gelato's way, scoop.js registerItems)
export function registerCraft(F){ craftState(F).recipes.forEach(r => { const k = KINDS[r.kind], extra = Math.max(0, r.adds.length - 1);
  ITEMS[itemId(r)] = {n: r.kind === "soap" ? `A bar of ${r.name.toLowerCase()}` : r.kind === "lotion" ? `A jar of ${r.name.toLowerCase()}` : `A bottle of ${r.name.toLowerCase()}`, kind: "gift", to: "family", crafted: true, mill: r.kind,
    price: k.price + extra*2, sell: k.sell + extra*2, ico: r.kind === "oil" ? "olives" : r.kind === "soap" ? "soap_oat" : "honey",
    say: r.kind === "oil" ? `Your own ${r.name.toLowerCase()}! On bread, tonight. Thank you!` : r.kind === "soap" ? `Handmade ${r.name.toLowerCase()}? It smells beautiful.` : `${r.name}! My hands needed this. Thank you.`}; }); }
const have = (F, id) => (F.inv || {})[id] || 0;
const take = (F, id, n = 1) => { F.inv[id] -= n; if (F.inv[id] <= 0) delete F.inv[id]; };
// plain oil for infusing: the backpack first, then the mill's own bottles (Tomi's pressing)
const oilHave = (F, c) => have(F, "oliveoil") + c.oil;
const useOil = (F, c, n) => { const a = Math.min(n, have(F, "oliveoil")); if (a) take(F, "oliveoil", a); c.oil -= n - a; };
// make something: kind oil|soap|lotion, base (soap: goatmilk|oliveoil), adds from the backpack -> {recipe, fresh, msg}
export function craft(F, kind, base, adds, src = "bag"){
  const c = craftState(F), K = KINDS[kind]; adds = [...new Set(adds)].filter(a => HERB[a] && HERB[a][kind]);
  if (!K || !adds.length || adds.length > K.max) return {msg: kind === "lotion" ? "One scent for a lotion." : "One or two things to go in."};
  const pool = src === "basket" ? c.basket : (F.inv || {}); if (adds.some(a => !(pool[a] > 0))) return {msg: "You're missing something for that."};
  if (kind === "oil") { if (c.steep.length >= CRAFT.jars) return {msg: "All three steeping jars are full."}; if (oilHave(F, c) < CRAFT.oilPer) return {msg: "You'll need two bottles of olive oil (press some downstairs)."}; useOil(F, c, CRAFT.oilPer); base = null; }
  else if (kind === "soap") { if (c.cure.length >= CRAFT.rack) return {msg: "The curing rack's full."}; if (base === "goatmilk" ? have(F, "goatmilk") < 2 : oilHave(F, c) < 1) return {msg: base === "goatmilk" ? "You'll need two goat's milk, from Wildflower Farm." : "You'll need a bottle of olive oil."}; if (base === "goatmilk") take(F, "goatmilk", 2); else useOil(F, c, 1); }
  else { if (c.pot) return {msg: "There's a lotion in the pot already."}; if (have(F, "goatmilk") < 1 || oilHave(F, c) < 1) return {msg: "A lotion needs a goat's milk and a bottle of olive oil."}; take(F, "goatmilk"); useOil(F, c, 1); base = null; }
  adds.forEach(a => { if (src === "basket") { c.basket[a]--; if (c.basket[a] <= 0) delete c.basket[a]; } else take(F, a); });
  const id = keyOf(kind, base, adds); let r = c.recipes.find(x => x.id === id), fresh = false;
  if (!r) { fresh = true; r = {id, kind, base, adds: [...adds].sort(), name: craftName(kind, base, adds), found: dayKey()}; c.recipes.push(r); registerCraft(F); }
  const job = {id, start: Date.now(), dur: kind === "oil" ? CRAFT.steep : kind === "soap" ? CRAFT.cure : CRAFT.lotion};
  if (kind === "oil") c.steep.push(job); else if (kind === "soap") c.cure.push(job); else c.pot = job;
  const when = kind === "oil" ? "steeping: ready in six hours" : kind === "soap" ? "on the curing rack for a day" : "warming in the little pot: an hour";
  return {recipe: r, fresh, msg: fresh ? `Something new: ${r.name}! It's ${when}.` : `${r.name} again: ${when}.`};
}
const left = (j, t = Date.now()) => Math.max(0, j.start + j.dur - t);
// finished jars, bars and lotions onto the mill's shelves -> [{recipe, n}]
export function craftDone(F, t = Date.now()){
  const c = craftState(F), out = [], put = (j, n) => { const r = c.recipes.find(x => x.id === j.id); if (!r) return; const id = itemId(r); c.store[id] = (c.store[id] || 0) + n; out.push({recipe: r, n}); };
  c.steep = c.steep.filter(j => left(j, t) ? true : (put(j, CRAFT.oilPer), false));
  c.cure = c.cure.filter(j => left(j, t) ? true : (put(j, CRAFT.soapPer), false));
  if (c.pot && !left(c.pot, t)) { put(c.pot, CRAFT.lotionPer); c.pot = null; }
  return out;
}
export const storeCount = c => Object.values(c.store).reduce((a, b) => a + b, 0);
export function takeFromStore(F, id, n = 1){ const c = craftState(F), k = Math.min(n, c.store[id] || 0); if (!k) return 0; c.store[id] -= k; if (!c.store[id]) delete c.store[id]; F.inv = F.inv || {}; F.inv[id] = (F.inv[id] || 0) + k; return k; }
export function toBasket(F, herb, n = 99){ const c = craftState(F), k = Math.min(n, have(F, herb)); if (!HERB[herb] || !k) return 0; take(F, herb, k); c.basket[herb] = (c.basket[herb] || 0) + k; return k; }

/* ---------- Tomi at the press, and Hazel at the shop (both on the clock) ---------- */
// Tomi (10 to 5, not Sundays, once the mill's open): presses the olive crate into the mill's bottles, and starts an infusion
// from the herb basket when there's oil and a free jar (a recipe Mel's found, the one with the most herbs to hand)
export const PRESSER = {from: 14*60, to: 17*60 + 30}, SHOPKEEP = {from: 10*60, to: 17*60, closed: [1]};
export function inesStep(F, m, v, t = Date.now()){
  const c = craftState(F), did = {};
  if (m.press && m.press.by === "ines" && m.press.start + m.press.dur <= t) { c.oil += m.press.n; m.made = (m.made || 0) + m.press.n; did.pressed = m.press.n; m.press = null; }
  if (!m.press && (v.oliveCrate || 0) >= 3) { const n = Math.min(4, Math.floor(v.oliveCrate/3)); v.oliveCrate -= n*3; m.press = {start: t, dur: 3600e3, n, by: "ines"}; did.started = n; }
  if (c.steep.length < CRAFT.jars && c.oil >= CRAFT.oilPer) { const r = c.recipes.filter(x => x.kind === "oil" && x.adds.every(a => c.basket[a] > 0)).sort((a, b) => b.adds.length - a.adds.length)[0];
    if (r) { const r2 = craft(F, "oil", null, r.adds, "basket"); if (r2.recipe) did.infused = r.name; } }
  return did;
}
// what sells, and how fast: the Mill Shop all day while Hazel's in; before that, a little from the wine shop's shelf
// where: "shop" (the Mill Shop: busier at weekends, when the day-trippers walk up the lane), "wineshop" (its little mill
// shelf), "market" (the crate on Mel's wine stall at the Sunday market), "grace" (Grace's soap stall stocks Mel's soaps)
export function craftSellMinute(F, day, hm, where){
  const c = craftState(F), ids = Object.keys(c.store).filter(id => c.store[id] > 0 && ITEMS[id] && (where !== "grace" || ITEMS[id].mill === "soap")); if (!ids.length) return 0;
  const dw = new Date(day + "T00:00:00Z").getUTCDay(), we = dw === 0 || dw === 6, shopOpen = where === "shop" && hm >= SHOPKEEP.from && hm < SHOPKEEP.to && !SHOPKEEP.closed.includes(dw);
  const p = shopOpen ? .05*(we ? 1.5 : 1) : where === "wineshop" && hm >= 10*60 && hm < 21*60 ? .008 : where === "market" ? .02 : where === "grace" ? .015 : 0; if (!p || Math.random() >= p) return 0;
  const id = ids[Math.floor(Math.random()*ids.length)], price = ITEMS[id].price; c.store[id]--; if (!c.store[id]) delete c.store[id];
  const s = c.sold[day] = c.sold[day] || {n: 0, coins: 0}; s.n++; s.coins += price; if (where === "market" || where === "grace") s[where] = (s[where] || 0) + 1; return price;
}

/* ---------- the workbench panel ---------- */
const shut = `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
const dots = adds => `<span class="mullsw">${adds.map(a => `<i style="background:${HERB[a].col}"></i>`).join("")}</span>`;
const mins = ms => { const m = Math.max(1, Math.ceil(ms/60000)); return m >= 60 ? `${Math.floor(m/60)}h ${m % 60}m` : `${m}m`; };
export function benchPanel(F, st = {}, o = {}){
  const c = craftState(F), tab = st.tab || "oil", K = KINDS[tab] || null;
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>The workbench</h2><div class="tabs" role="tablist">${[["oil", "Oils"], ["soap", "Soaps"], ["lotion", "Lotions"], ["shelves", "Shelves"], ["basket", "Herb basket"]].map(([k, n]) => `<button role="tab" data-mc="tab:${k}" aria-selected="${k === tab}">${n}</button>`).join("")}</div>`;
  const jobs = (list, what) => list.map(j => { const r = c.recipes.find(x => x.id === j.id) || {name: "?"}; return `<li><span class="wtxt"><b>${esc(r.name)}</b><small>${what} · ready in ${mins(left(j))}</small></span></li>`; }).join("");
  if (tab === "shelves") { const ids = Object.keys(c.store);
    return h + `<p class="sub">Everything made, on the mill's shelves. ${o.shop ? "Hazel sells from here, downstairs." : "The wine shop sells a little of it from a shelf by the counter: open the Mill Shop downstairs to sell it all day."} Take some for yourself, or to give away.</p>
      ${ids.length ? `<ul class="hlist wlist">${ids.map(id => `<li><span class="wtxt"><b>${esc(ITEMS[id] ? ITEMS[id].n : id)}</b><small>${c.store[id]} on the shelf · ${ITEMS[id] ? ITEMS[id].price : "?"} coins each</small></span><button class="btn small alt" data-mc="takeit:${id}">Take one</button></li>`).join("")}</ul>` : `<p class="muted">Nothing on the shelves yet.</p>`}
      ${c.steep.length || c.cure.length || c.pot ? `<p class="eyebrow" style="margin:10px 0 6px">On the go</p><ul class="hlist wlist">${jobs(c.steep, "steeping")}${jobs(c.cure, "curing")}${c.pot ? jobs([c.pot], "warming") : ""}</ul>` : ""}
      <p class="muted">Plain oil in the mill: ${c.oil} bottle${c.oil === 1 ? "" : "s"}${o.ines ? " (Tomi presses the olive crate while he's in)" : ""}.</p>` + shut; }
  if (tab === "basket") { const herbs = Object.keys(HERB).filter(a => HERB[a].oil), inBag = herbs.filter(a => have(F, a));
    return h + `<p class="sub">Leave herbs here and Tomi will infuse oil with them while he's in, using the oils you've worked out. ${Object.keys(c.basket).length ? `In the basket: ${Object.entries(c.basket).map(([a, n]) => `${n} ${esc(nm(a).toLowerCase())}`).join(", ")}.` : "The basket's empty."}</p>
      ${inBag.length ? `<div class="actions">${inBag.map(a => `<button class="btn small alt" data-mc="basket:${a}">${dots([a])} Put in ${have(F, a)} ${esc(nm(a).toLowerCase())}</button>`).join("")}</div>` : `<p class="muted">No herbs in your backpack: rosemary, garlic, basil, thyme and chives from the greenhouse; lemons and oranges from Ma Ma's orchard; lavender from her flower farm.</p>`}` + shut; }
  const ok = HERB_OF(tab), base = st.base || "goatmilk", pick = st.adds || [];
  const busy = tab === "oil" ? c.steep.length >= CRAFT.jars : tab === "soap" ? c.cure.length >= CRAFT.rack : !!c.pot;
  h += `<p class="sub">${tab === "oil" ? `Two bottles of olive oil and one or two herbs or fruits, steeped for six hours: two bottles of infused oil. You've ${oilHave(F, c)} bottle${oilHave(F, c) === 1 ? "" : "s"} of plain oil (backpack and mill).` : tab === "soap" ? `Goat's milk (two) or olive oil (one), and one or two things to go in. A day on the curing rack: six bars.` : `A goat's milk, a bottle of olive oil and one scent. An hour in the little pot: three jars.`}</p>`;
  const now = tab === "oil" ? c.steep : tab === "soap" ? c.cure : c.pot ? [c.pot] : [];
  if (now.length) h += `<ul class="hlist wlist">${jobs(now, tab === "oil" ? "steeping" : tab === "soap" ? "curing" : "warming")}</ul>`;
  const known = c.recipes.filter(r => r.kind === tab);
  if (known.length) h += `<p class="eyebrow" style="margin:10px 0 6px">Make one you know</p><ul class="hlist wlist">${known.map(r => { const can = !busy && r.adds.every(a => have(F, a));
    return `<li><span class="wtxt"><b>${esc(r.name)}</b><small>${dots(r.adds)} ${ITEMS[itemId(r)] ? ITEMS[itemId(r)].price : ""} coins each</small></span><button class="btn small ${can ? "primary" : "alt"}" data-mc="again:${r.id}" ${can ? "" : "disabled"}>Make</button></li>`; }).join("")}</ul>`;
  if (busy) return h + `<p class="muted">${tab === "oil" ? "All three jars are steeping." : tab === "soap" ? "The rack's full of curing soap." : "The lotion pot's on."}</p>` + shut;
  if (tab === "soap") h += `<p class="eyebrow" style="margin:10px 0 6px">The base</p><div class="gchips">${[["goatmilk", `Goat's milk (${have(F, "goatmilk")})`], ["oliveoil", `Olive oil (${oilHave(F, c)})`]].map(([k, n]) => `<button class="gchip${base === k ? " on" : ""}" data-mc="base:${k}" aria-pressed="${base === k}">${esc(n)}</button>`).join("")}</div>`;
  const inBag = ok.filter(a => have(F, a));
  h += `<p class="eyebrow" style="margin:10px 0 6px">${tab === "lotion" ? "The scent (one)" : "What goes in (one or two)"}</p>${inBag.length ? `<div class="gchips">${inBag.map(a => `<button class="gchip${pick.includes(a) ? " on" : ""}" data-mc="add:${a}" aria-pressed="${pick.includes(a)}"><i class="mulldot" style="background:${HERB[a].col}"></i>${esc(nm(a))} (${have(F, a)})</button>`).join("")}</div>` : `<p class="muted">Nothing for these in your backpack yet: ${ok.map(a => nm(a).toLowerCase()).join(", ")}.</p>`}`;
  const ready = pick.length >= 1 && pick.length <= K.max;
  return h + `<div class="actions"><button class="btn primary" data-mc="make" ${ready ? "" : "disabled"}>${ready ? (c.recipes.some(r => r.id === keyOf(tab, tab === "soap" ? base : null, pick)) ? `Make ${esc(craftName(tab, base, pick))}` : "Try something new") : "Make it"}</button></div>` + shut;
}
const HERB_OF = kind => Object.keys(HERB).filter(a => HERB[a][kind]);
// the weekend day-trippers who walk up the cottage lane to the Mill Shop (npcs.js): three of the out-of-towners, an hour
// each, never one who's on a farm tour or a stall that day (tours.js passes who's busy)
export const MILL_VISITS = [[11*60, 12*60], [13*60, 14*60], [15*60, 16*60]];
export function millVisitSlot(id, day, hm, open, tourists, busy = []){
  const dw = new Date(day + "T00:00:00Z").getUTCDay(); if (!open || (dw !== 0 && dw !== 6) || !tourists.includes(id) || busy.includes(id)) return null;
  const pool = tourists.filter(t => !busy.includes(t)), h = [...day].reduce((a, ch) => (a*31 + ch.charCodeAt(0)) >>> 0, 7), who = MILL_VISITS.map((_, i) => pool[(h + i*3) % pool.length]);
  const i = who.indexOf(id); if (i < 0) return null; const [from, to] = MILL_VISITS[i]; if (hm < from || hm >= to) return null;
  return {from, to, scene: "mill", wander: [[180, 560], [260, 540], [420, 568]], millvisit: true};
}

/* ---------- the pop-up crate in the campervan ---------- */
// Mel packs a crate at the van's fold-down table: things off the mill's shelves and bottles off the wine shop's shelves
// (up to two dozen). On a campervan trip, with the crate out by the van, passers-by buy from it while she's at the stop.
export const VAN_CRATE = {max: 24, p: .04};
export function vanCrate(F){ const c = craftState(F); c.van = c.van || {items: {}, wine: []}; return c.van; }
export const crateCount = vc => Object.values(vc.items).reduce((a, b) => a + b, 0) + vc.wine.reduce((a, w) => a + w.n, 0);
export function packCrate(F, v, key, n = 1){
  const vc = vanCrate(F), c = craftState(F), room = VAN_CRATE.max - crateCount(vc); n = Math.min(n, room); if (n < 1) return 0;
  if (key.startsWith("w:")) { const s = v.shelf.find(x => x.id === key.slice(2)); if (!s || s.n < 1) return 0; n = Math.min(n, s.n); s.n -= n; const w = vc.wine.find(x => x.sid === s.id); if (w) w.n += n; else vc.wine.push({sid: s.id, name: s.name, type: s.type, price: s.price, n}); return n; }
  n = Math.min(n, c.store[key] || 0); if (!n) return 0; c.store[key] -= n; if (!c.store[key]) delete c.store[key]; vc.items[key] = (vc.items[key] || 0) + n; return n;
}
export function unpackCrate(F, v){ const vc = vanCrate(F), c = craftState(F);
  Object.entries(vc.items).forEach(([id, n]) => { c.store[id] = (c.store[id] || 0) + n; }); vc.items = {};
  vc.wine.forEach(w => { const s = v.shelf.find(x => x.id === w.sid); if (s) s.n += w.n; else v.shelf.push({id: w.sid, name: w.name, type: w.type, price: w.price, n: w.n, open: 0}); }); vc.wine = []; }
// a minute at a campervan stop with the crate out: maybe a passer-by buys something -> {coins, what} or null
export function vanSellMinute(F){
  const vc = vanCrate(F), opts = [...Object.keys(vc.items).filter(id => vc.items[id] > 0 && ITEMS[id]).map(id => ({id})), ...vc.wine.filter(w => w.n > 0).map(w => ({w}))];
  if (!opts.length || Math.random() >= VAN_CRATE.p) return null; const o = opts[Math.floor(Math.random()*opts.length)];
  if (o.w) { o.w.n--; const what = `a bottle of ${o.w.name}`; vc.wine = vc.wine.filter(w => w.n > 0); return {coins: o.w.price, what}; }
  vc.items[o.id]--; if (!vc.items[o.id]) delete vc.items[o.id]; return {coins: ITEMS[o.id].price, what: ITEMS[o.id].n.replace(/^A (bar|jar|bottle) of /i, (m, k) => `a ${k} of `)};
}
export function cratePanel(F, v){
  const vc = vanCrate(F), c = craftState(F), n = crateCount(vc);
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>The pop-up crate</h2><p class="sub">A wooden crate and a little chalkboard. Pack it here; on a campervan trip it goes out by the van, and passers-by buy while you're at the stop. ${n} of ${VAN_CRATE.max} packed.</p>`;
  const packed = [...Object.entries(vc.items).map(([id, k]) => `${k} ${esc(ITEMS[id] ? ITEMS[id].n.replace(/^A (bar|jar|bottle) of /i, "").toLowerCase() : id)}`), ...vc.wine.map(w => `${w.n} ${esc(w.name)}`)];
  if (packed.length) h += `<p class="muted">In the crate: ${packed.join(", ")}.</p><div class="actions"><button class="btn small alt" data-crate="unpack">Unpack it all</button></div>`;
  const mill = Object.keys(c.store).filter(id => c.store[id] > 0 && ITEMS[id]), wines = v.shelf.filter(s => s.n > 0);
  h += `<p class="eyebrow" style="margin:10px 0 6px">From the mill's shelves</p>${mill.length ? `<ul class="hlist wlist">${mill.map(id => `<li><span class="wtxt"><b>${esc(ITEMS[id].n)}</b><small>${c.store[id]} on the shelf · ${ITEMS[id].price} each</small></span><button class="btn small alt" data-crate="${id}" ${n < VAN_CRATE.max ? "" : "disabled"}>Pack 1</button></li>`).join("")}</ul>` : `<p class="muted">Nothing on the mill's shelves just now.</p>`}`;
  h += `<p class="eyebrow" style="margin:10px 0 6px">From the wine shop</p>${wines.length ? `<ul class="hlist wlist">${wines.map(s => `<li><span class="wtxt"><b>${esc(s.name)}</b><small>${s.n} on the shelf · ${s.price} a bottle</small></span><button class="btn small alt" data-crate="w:${s.id}" ${n < VAN_CRATE.max ? "" : "disabled"}>Pack 1</button></li>`).join("")}</ul>` : `<p class="muted">No bottles on the wine shop's shelves.</p>`}`;
  return h + shut;
}
export const MILLSHOP_LINE = "The ground floor of the old mill, opened up as a little shop: shelves of your infused oils, stacks of soap, jars of lotion, and Hazel behind the counter.";
