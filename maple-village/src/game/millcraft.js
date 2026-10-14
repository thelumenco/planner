// The mill workshop (round 153, Mel: "infused olive oils that sell for more; goat's milk soaps, lotions, olive oil
// soaps, all mixed with berries, fruits and herbs"). At the workbench upstairs in the old mill, beside the press:
//   infused oils: two bottles of olive oil and one or two herbs or fruits (rosemary, garlic, basil, thyme, chives,
//     lemon, orange, lavender) steep for six hours: two bottles worth half as much again as plain oil.
//   soaps: goat's milk (two) or olive oil (one) and one or two add-ins (lavender, rose, every honey, rosemary, mint, thyme,
//     orange, lemon, raspberries); a day curing on the rack, then six bars.
//   lotions: goat's milk, olive oil and one scent (lavender, rose, every honey but comb, orange, lemon, mint): an hour, three jars.
// Like the gelato flavours, every new mix is found once and named, then made again. Herbs come from the garden and the
// greenhouse, lavender and roses from Ma Ma's flower farm (her bouquets); fruit from the orchard.
// What's made goes onto the mill's shelves (the store). Until the Mill Shop's open the wine shop sells a little of it
// from a "from the mill" shelf by the counter; once it's open, Hazel sells it all day downstairs. Mel can take things
// for herself or to give away. And Tomi (Ines's little brother), at the mill 10 to 5 but Sundays, presses whatever's in the olive crate into the mill's own
// bottles and carries them up to the basket (round 200: that's all; the infusing is Mel's).
// State: F.craft = {recipes: [{id, kind, base, adds, name}], steep: [{id, start, dur}], cure: [{id, start, dur}],
//   pot: {id, start, dur} | null, store: {itemId: n}, basket: {herb: n}, oil: n (the mill's own plain bottles), sold}
import { esc, dayKey } from "../util.js";
import { ITEMS } from "../data/items.js";
import { icon } from "../art/icons.js";
import { FLOWERS } from "../data/orchard.js";

export const CRAFT = {steep: 6*3600e3, cure: 24*3600e3, lotion: 3600e3, jars: 3, rack: 3, oilPer: 2, soapPer: 6, lotionPer: 3, balm: 3600e3, balmPer: 4, lipoil: 24*3600e3, lipoilPer: 3, rollers: 2, waxPer: 2};
export const HERB = {
  rosemary: {n: "Rosemary", col: "#6E8A5A", oil: true, soap: true}, garlic: {n: "Garlic", col: "#EDE6D0", oil: true}, basil: {n: "Basil", col: "#4E8A4E", oil: true},
  thyme: {n: "Thyme", col: "#8AA06A", oil: true, soap: true}, chives: {n: "Chives", col: "#5E9A4A", oil: true}, mint: {n: "Mint", col: "#7FCBA4", soap: true, lotion: true},
  lemon: {n: "Lemon", col: "#F3D24A", oil: true, soap: true, lotion: true}, orange: {n: "Orange", col: "#E8913A", oil: true, soap: true, lotion: true},
  raspberry: {n: "Raspberries", col: "#C2334D", soap: true}, honey: {n: "Honey", col: "#E3B04B", soap: true, lotion: true},
  bq_lavender: {n: "Lavender", col: "#A68FCB", oil: true, soap: true, lotion: true}, bq_rose: {n: "Rose", col: "#E8A0B4", soap: true, lotion: true},
  // round 154 (Mel): more fruit from the garden and orchard, and more of Ma Ma's flowers
  strawberry: {n: "Strawberry", col: "#E8566C", soap: true, lotion: true}, blueberry: {n: "Blueberry", col: "#5A6AB8", soap: true}, apple: {n: "Apple", col: "#9CC27E", soap: true},
  bq_sweetpea: {n: "Sweet pea", col: "#E8B4D8", soap: true, lotion: true}, bq_camellia: {n: "Camellia", col: "#E86A8A", soap: true, lotion: true}, bq_heather: {n: "Heather", col: "#B07AB8", soap: true},
  // round 167 (Mel: "honey should also be an ingredient in the mill stuff"): every honey, from the hives and the trips
  honey_lav: {n: "Lavender honey", col: "#C9A3E0", soap: true, lotion: true}, honey_blossom: {n: "Blossom honey", col: "#F3C9A0", soap: true, lotion: true},
  honey_cream: {n: "Creamed honey", col: "#F3E1A0", soap: true, lotion: true}, honeycomb: {n: "Honeycomb", col: "#E8B04A", soap: true},
  honey_sun: {n: "Sunflower honey", col: "#F3C93A", soap: true, lotion: true}, honey_heath: {n: "Heath honey", col: "#C9A060", soap: true, lotion: true},
  euchoney: {n: "Eucalyptus honey", col: "#C98A2E", soap: true, lotion: true}
};
export const KINDS = {oil: {n: "Infused oils", max: 2, price: 28, sell: 24}, soap: {n: "Soaps", max: 2, price: 8, sell: 6}, lotion: {n: "Lotions", max: 1, price: 16, sell: 13},
  balm: {n: "Lip balms", max: 1, price: 6, sell: 5}, lipoil: {n: "Lip oils", max: 1, price: 10, sell: 8}};
// round 187 (Mel: "can lip balms and lip oils be part of the mill shop offers... and they can be dyed by the flowers I have"):
//   beeswax  melted down from honeycomb at the bench (one comb, two blocks), or a block from Sunflower Hill's honey house
//   balm     a block of beeswax, a bottle of olive oil and one flavour, and if she likes a flower for the colour: an hour
//            setting in the tins, four tins
//   lip oil  a bottle of olive oil, one flavour and (if she likes) a flower: a day steeping in the rollers, three bottles
// The dye is a stem of any flower from Ma Ma's flower farm (its shed), or a tulip or sunflower from Mel's garden; the
// tin's lid and the oil take its colour.
for (const a of ["honey", "honey_lav", "honey_blossom", "honey_cream", "honey_sun", "honey_heath", "euchoney", "mint", "orange", "lemon", "bq_lavender", "bq_rose", "strawberry", "bq_sweetpea", "bq_camellia"]) if (HERB[a]) Object.assign(HERB[a], {balm: true, lipoil: true});
if (HERB.raspberry) HERB.raspberry.lipoil = true;
ITEMS.beeswax = Object.assign(ITEMS.beeswax || {}, {n: "A block of beeswax", kind: "ingredient", ico: "beeswax", price: 4, sell: 2});
export const dyeHave = (F, d) => (((F.orch || {}).stock || {})["stem:" + d] || 0) + ((F.inv || {})[d] && ITEMS[d] && ITEMS[d].kind === "flower" ? F.inv[d] : 0);
const useDye = (F, d) => { if ((F.inv || {})[d] > 0 && ITEMS[d] && ITEMS[d].kind === "flower") { F.inv[d]--; if (!F.inv[d]) delete F.inv[d]; return; } F.orch.stock["stem:" + d]--; if (F.orch.stock["stem:" + d] <= 0) delete F.orch.stock["stem:" + d]; };
const capW = w => w[0].toUpperCase() + w.slice(1);   // (every recipe sells for more than its ingredients cost: smoke test)
export function craftState(F){ F.craft = F.craft || {}; const c = F.craft; c.recipes = c.recipes || []; c.steep = c.steep || []; c.cure = c.cure || []; if (!("pot" in c)) c.pot = null;
  c.store = c.store || {}; c.basket = c.basket || {}; c.oil = c.oil || 0; c.sold = c.sold || {};
  if (c.oil > 0) { c.basket.oliveoil = (c.basket.oliveoil || 0) + c.oil; c.oil = 0; }   // round 200: the mill's bottles all live in the basket now
  return c; }
const keyOf = (kind, base, adds, dye) => `${kind}_${base ? base + "_" : ""}${[...adds].sort().join("-")}${dye ? "~" + dye : ""}`;
const nm = a => HERB[a].n;
export function craftName(kind, base, adds, dye){ const a = [...adds].sort().map(nm), list = a.length === 2 ? `${a[0]} & ${a[1]}` : a[0];
  if (kind === "balm" || kind === "lipoil") return `${dye && FLOWERS[dye] ? `${capW(FLOWERS[dye].one)}-tinted ${list.toLowerCase()}` : list} ${kind === "balm" ? "lip balm" : "lip oil"}`;
  return kind === "oil" ? `${list} olive oil` : kind === "lotion" ? `${list} hand lotion` : `${list} ${base === "goatmilk" ? "goat's milk" : "olive oil"} soap`; }
export const itemId = r => "mc_" + r.id;
// each recipe is an item: something to keep, give, or sell (the gelato's way, scoop.js registerItems)
export function registerCraft(F){ craftState(F).recipes.forEach(r => { const k = KINDS[r.kind], extra = Math.max(0, r.adds.length - 1);
  if (r.kind === "balm" || r.kind === "lipoil") { const b = r.kind === "balm"; ITEMS[itemId(r)] = {n: `${b ? "A tin" : "A bottle"} of ${r.name.toLowerCase()}`, kind: "gift", to: ["mum", "angelina", "mama"], crafted: true, mill: r.kind,
    price: k.price + (r.dye ? 1 : 0), sell: k.sell + (r.dye ? 1 : 0), ico: `${r.kind}_${r.dye || "none"}`,
    say: b ? `Lip balm! ${r.dye ? "And it's tinted, so pretty. " : ""}It smells like ${HERB[r.adds[0]] ? HERB[r.adds[0]].n.toLowerCase() : "honey"}.` : `A lip oil! ${r.dye ? "Look at the colour. " : ""}It's going straight in my handbag.`}; return; }
  ITEMS[itemId(r)] = {n: r.kind === "soap" ? `A bar of ${r.name.toLowerCase()}` : r.kind === "lotion" ? `A jar of ${r.name.toLowerCase()}` : `A bottle of ${r.name.toLowerCase()}`, kind: "gift", to: "family", crafted: true, mill: r.kind,
    price: k.price + extra*2, sell: k.sell + extra*2, ico: r.kind === "oil" ? "olives" : r.kind === "soap" ? "soap_oat" : "honey",
    say: r.kind === "oil" ? `Your own ${r.name.toLowerCase()}! On bread, tonight. Thank you!` : r.kind === "soap" ? `Handmade ${r.name.toLowerCase()}? It smells beautiful.` : `${r.name}! My hands needed this. Thank you.`}; }); }
const have = (F, id) => (F.inv || {})[id] || 0;
const take = (F, id, n = 1) => { F.inv[id] -= n; if (F.inv[id] <= 0) delete F.inv[id]; };
// plain oil for the bench: the backpack first, then the basket (round 199/200: Mel: "I put four bottles of olive oil in the
// basket and it disappeared": Tomi was infusing with them. He doesn't infuse any more; his pressing goes into the basket).
const oilHave = (F, c) => have(F, "oliveoil") + (c.basket.oliveoil || 0) + c.oil;
// round 168: the mill's basket holds anything the bench uses (herbs, fruit, flowers, honey, goat's milk); the bench
// takes from the backpack first, then the basket.
export const basketable = id => !!HERB[id] || id === "goatmilk" || id === "oliveoil" || id === "beeswax";   // (olive oil goes in with the mill's own bottles, round 175)
const got = (F, c, id) => have(F, id) + (c.basket[id] || 0);
const use = (F, c, id, n = 1) => { const a = Math.min(n, have(F, id)); if (a) take(F, id, a); if (n - a) { c.basket[id] -= n - a; if (c.basket[id] <= 0) delete c.basket[id]; } };
const useOil = (F, c, n, tomi) => { if (tomi) { c.oil -= n; return; } let a = Math.min(n, have(F, "oliveoil")); if (a) take(F, "oliveoil", a); n -= a;
  a = Math.min(n, c.basket.oliveoil || 0); if (a) { c.basket.oliveoil -= a; if (c.basket.oliveoil <= 0) delete c.basket.oliveoil; } c.oil -= n - a; };
// make something: kind oil|soap|lotion, base (soap: goatmilk|oliveoil), adds from the backpack -> {recipe, fresh, msg}
// round 187: melt honeycomb down into beeswax -> blocks made
export function renderWax(F){ const c = craftState(F); if (!(got(F, c, "honeycomb") > 0)) return 0; use(F, c, "honeycomb"); F.inv = F.inv || {}; F.inv.beeswax = (F.inv.beeswax || 0) + CRAFT.waxPer; return CRAFT.waxPer; }
export function craft(F, kind, base, adds, src = "bag", dye = null){
  const c = craftState(F), K = KINDS[kind]; adds = [...new Set(adds)].filter(a => HERB[a] && HERB[a][kind]);
  if (dye && (!FLOWERS[dye] || !(kind === "balm" || kind === "lipoil"))) dye = null;
  if (!K || !adds.length || adds.length > K.max) return {msg: kind === "lotion" ? "One scent for a lotion." : "One or two things to go in."};
  if (adds.some(a => !((src === "basket" ? c.basket[a] || 0 : got(F, c, a)) > 0))) return {msg: "You're missing something for that."};
  if (kind === "oil") { if (c.steep.length >= CRAFT.jars) return {msg: "All three steeping jars are full."}; if ((src === "basket" ? c.oil : oilHave(F, c)) < CRAFT.oilPer) return {msg: "You'll need two bottles of olive oil (press some downstairs)."}; useOil(F, c, CRAFT.oilPer, src === "basket"); base = null; }
  else if (kind === "soap") { if (c.cure.length >= CRAFT.rack) return {msg: "The curing rack's full."}; if (base === "goatmilk" ? got(F, c, "goatmilk") < 2 : oilHave(F, c) < 1) return {msg: base === "goatmilk" ? "You'll need two goat's milk, from Wildflower Farm." : "You'll need a bottle of olive oil."}; if (base === "goatmilk") use(F, c, "goatmilk", 2); else useOil(F, c, 1); }
  else if (kind === "balm") { if (c.balm) return {msg: "There's a tray of balm setting already."}; if (got(F, c, "beeswax") < 1 || oilHave(F, c) < 1) return {msg: "A lip balm needs a block of beeswax (melt down some honeycomb) and a bottle of olive oil."};
    if (dye && !(dyeHave(F, dye) > 0)) return {msg: "No stems of that flower left."}; use(F, c, "beeswax"); useOil(F, c, 1); base = null; }
  else if (kind === "lipoil") { c.lipoil = c.lipoil || []; if (c.lipoil.length >= CRAFT.rollers) return {msg: "Both roller trays are steeping."}; if (oilHave(F, c) < 1) return {msg: "A lip oil needs a bottle of olive oil."};
    if (dye && !(dyeHave(F, dye) > 0)) return {msg: "No stems of that flower left."}; useOil(F, c, 1); base = null; }
  else { if (c.pot) return {msg: "There's a lotion in the pot already."}; if (got(F, c, "goatmilk") < 1 || oilHave(F, c) < 1) return {msg: "A lotion needs a goat's milk and a bottle of olive oil."}; use(F, c, "goatmilk"); useOil(F, c, 1); base = null; }
  adds.forEach(a => { if (src === "basket") { c.basket[a]--; if (c.basket[a] <= 0) delete c.basket[a]; } else use(F, c, a); });
  if (dye) useDye(F, dye);
  const id = keyOf(kind, base, adds, dye); let r = c.recipes.find(x => x.id === id), fresh = false;
  if (!r) { fresh = true; r = {id, kind, base, adds: [...adds].sort(), ...(dye ? {dye} : {}), name: craftName(kind, base, adds, dye), found: dayKey()}; c.recipes.push(r); registerCraft(F); }
  const job = {id, start: Date.now(), dur: kind === "oil" ? CRAFT.steep : kind === "soap" ? CRAFT.cure : kind === "balm" ? CRAFT.balm : kind === "lipoil" ? CRAFT.lipoil : CRAFT.lotion};
  if (kind === "oil") c.steep.push(job); else if (kind === "soap") c.cure.push(job); else if (kind === "balm") c.balm = job; else if (kind === "lipoil") c.lipoil.push(job); else c.pot = job;
  const when = kind === "oil" ? "steeping: ready in six hours" : kind === "soap" ? "on the curing rack for a day" : kind === "balm" ? "poured into the tins to set: an hour" : kind === "lipoil" ? "steeping in the rollers: ready tomorrow" : "warming in the little pot: an hour";
  return {recipe: r, fresh, msg: fresh ? `Something new: ${r.name}! It's ${when}.` : `${r.name} again: ${when}.`};
}
const left = (j, t = Date.now()) => Math.max(0, j.start + j.dur - t);
// finished jars, bars and lotions onto the mill's shelves -> [{recipe, n}]
export function craftDone(F, t = Date.now()){
  const c = craftState(F), out = [], put = (j, n) => { const r = c.recipes.find(x => x.id === j.id); if (!r) return; const id = itemId(r); c.store[id] = (c.store[id] || 0) + n; out.push({recipe: r, n}); };
  c.steep = c.steep.filter(j => left(j, t) ? true : (put(j, CRAFT.oilPer), false));
  c.cure = c.cure.filter(j => left(j, t) ? true : (put(j, CRAFT.soapPer), false));
  if (c.pot && !left(c.pot, t)) { put(c.pot, CRAFT.lotionPer); c.pot = null; }
  if (c.balm && !left(c.balm, t)) { put(c.balm, CRAFT.balmPer); c.balm = null; }
  if (c.lipoil) c.lipoil = c.lipoil.filter(j => left(j, t) ? true : (put(j, CRAFT.lipoilPer), false));
  return out;
}
export const storeCount = c => Object.values(c.store).reduce((a, b) => a + b, 0);
export function takeFromStore(F, id, n = 1){ const c = craftState(F), k = Math.min(n, c.store[id] || 0); if (!k) return 0; c.store[id] -= k; if (!c.store[id]) delete c.store[id]; F.inv = F.inv || {}; F.inv[id] = (F.inv[id] || 0) + k; return k; }
export function fromBasket(F, id, n = 99){ const c = craftState(F); if (id === "milloil") { const k = Math.min(n, c.oil); if (!k) return 0; c.oil -= k; F.inv = F.inv || {}; F.inv.oliveoil = (F.inv.oliveoil || 0) + k; return k; }   // the mill's own pressing
  const k = Math.min(n, c.basket[id] || 0); if (!k) return 0; c.basket[id] -= k; if (c.basket[id] <= 0) delete c.basket[id]; F.inv = F.inv || {}; F.inv[id] = (F.inv[id] || 0) + k; return k; }
export function toBasket(F, herb, n = 99){ const c = craftState(F), k = Math.min(n, have(F, herb)); if (!basketable(herb) || !k) return 0;
  take(F, herb, k); c.basket[herb] = (c.basket[herb] || 0) + k; return k; }

/* ---------- Tomi at the press, and Hazel at the shop (both on the clock) ---------- */
// Tomi (10 to 5, not Sundays, once the mill's open) has three jobs and only three (round 200, Mel: "take the olives from the
// crate, press it into bottles of olive oil, and then put them into the basket upstairs... That's it"). Nothing else upstairs.
export const PRESSER = {from: 14*60, to: 17*60 + 30}, SHOPKEEP = {from: 10*60, to: 17*60, closed: [1]};
export function inesStep(F, m, v, t = Date.now()){
  const c = craftState(F), did = {};
  if (m.press && m.press.by === "ines" && m.press.start + m.press.dur <= t) { c.basket.oliveoil = (c.basket.oliveoil || 0) + m.press.n; m.made = (m.made || 0) + m.press.n; did.pressed = m.press.n; m.press = null; }
  if (!m.press && (v.oliveCrate || 0) >= 3) { const n = Math.min(4, Math.floor(v.oliveCrate/3)); v.oliveCrate -= n*3; m.press = {start: t, dur: 3600e3, n, by: "ines"}; did.started = n; }
  return did;
}
// what sells, and how fast: the Mill Shop all day while Hazel's in; before that, a little from the wine shop's shelf
// where: "shop" (the Mill Shop: busier at weekends, when the day-trippers walk up the lane), "wineshop" (its little mill
// shelf), "market" (the crate on Mel's wine stall at the Sunday market), "grace" (Grace's soap stall stocks Mel's soaps)
export function craftSellMinute(F, day, hm, where){
  const c = craftState(F), ids = Object.keys(c.store).filter(id => c.store[id] > 0 && ITEMS[id] && (where !== "grace" || ITEMS[id].mill === "soap")); if (!ids.length) return 0;
  const dw = new Date(day + "T00:00:00Z").getUTCDay(), we = dw === 0 || dw === 6, shopOpen = where === "shop" && hm >= SHOPKEEP.from && hm < SHOPKEEP.to && !SHOPKEEP.closed.includes(dw);
  const boost = shopOpen && tastingJustDone(day, hm), oils = boost ? ids.filter(id => ITEMS[id].mill === "oil") : []; if (oils.length) ids.splice(0, ids.length, ...oils);
  const p = shopOpen ? .05*(we ? 1.5 : 1)*(boost ? 2 : 1) : where === "wineshop" && hm >= 10*60 && hm < 21*60 ? .008 : where === "market" ? .02 : where === "grace" ? .015 : 0; if (!p || Math.random() >= p) return 0;
  const id = ids[Math.floor(Math.random()*ids.length)], price = ITEMS[id].price; c.store[id]--; if (!c.store[id]) delete c.store[id];
  const s = c.sold[day] = c.sold[day] || {n: 0, coins: 0}; s.n++; s.coins += price; if (where === "market" || where === "grace") s[where] = (s[where] || 0) + 1; return price;
}

/* ---------- the workbench panel ---------- */
const shut = `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
// the crate by the wine shop's counter (till the Mill Shop opens): it holds whatever's on the mill's shelves
export function crateMix(F){ const c = craftState(F), m = {oil: 0, soap: 0, lotion: 0}; for (const [id, n] of Object.entries(c.store)) { const k = ITEMS[id] && ITEMS[id].mill; if (k in m) m[k] += n; } return m; }
export function wineCratePanel(F, day){
  const c = craftState(F), ids = Object.keys(c.store).filter(id => c.store[id] > 0 && ITEMS[id]), s = c.sold[day] || {};
  let h = `<h2>From the mill</h2><p class="sub">A wooden crate by the counter, filled from the mill's shelves. Customers pick a little from it while the wine shop's open, 10 till 9. Make more at the workbench upstairs in the mill.</p>`;
  h += ids.length ? `<ul class="bujo">${ids.map(id => `<li>${c.store[id]} × ${esc(ITEMS[id].n)} · ${ITEMS[id].price} each</li>`).join("")}</ul>` : `<p class="muted">Empty for now. Oils, soaps and lotions you make at the mill land here.</p>`;
  h += `<p class="muted">${s.n ? `Sold today: ${s.n}, for ${s.coins} coins.` : "Nothing sold yet today."} Once the Mill Shop opens, Hazel sells it all at the mill instead, and much faster.</p>`;
  return h + shut;
}
const dots = adds => `<span class="mullsw">${adds.map(a => `<i style="background:${HERB[a].col}"></i>`).join("")}</span>`;
const mins = ms => { const m = Math.max(1, Math.ceil(ms/60000)); return m >= 60 ? `${Math.floor(m/60)}h ${m % 60}m` : `${m}m`; };
export function benchPanel(F, st = {}, o = {}){
  const c = craftState(F), tab = st.tab || "oil", K = KINDS[tab] || null;
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>The workbench</h2><div class="tabs" role="tablist">${[["oil", "Oils"], ["soap", "Soaps"], ["lotion", "Lotions"], ["balm", "Lip balms"], ["lipoil", "Lip oils"], ["shelves", "Shelves"], ["basket", "Basket"]].map(([k, n]) => `<button role="tab" data-mc="tab:${k}" aria-selected="${k === tab}">${n}</button>`).join("")}</div>`;
  const jobs = (list, what) => list.map(j => { const r = c.recipes.find(x => x.id === j.id) || {name: "?"}; return `<li><span class="wtxt"><b>${esc(r.name)}</b><small>${what} · ready in ${mins(left(j))}</small></span></li>`; }).join("");
  if (tab === "shelves") { const ids = Object.keys(c.store);
    return h + `<p class="sub">Everything made, on the mill's shelves. ${o.shop ? "Hazel sells from here, downstairs." : "The wine shop sells a little of it from a shelf by the counter: open the Mill Shop downstairs to sell it all day."} Take some for yourself, or to give away.</p>
      ${ids.length ? `<ul class="hlist wlist">${ids.map(id => `<li><span class="wtxt"><b>${esc(ITEMS[id] ? ITEMS[id].n : id)}</b><small>${c.store[id]} on the shelf · ${ITEMS[id] ? ITEMS[id].price : "?"} coins each</small></span><button class="btn small alt" data-mc="takeit:${id}">Take one</button></li>`).join("")}</ul>` : `<p class="muted">Nothing on the shelves yet.</p>`}
      ${c.steep.length || c.cure.length || c.pot ? `<p class="eyebrow" style="margin:10px 0 6px">On the go</p><ul class="hlist wlist">${jobs(c.steep, "steeping")}${jobs(c.cure, "curing")}${c.pot ? jobs([c.pot], "warming") : ""}</ul>` : ""}
      <p class="muted">Olive oil in the basket: ${c.basket.oliveoil || 0} bottle${c.basket.oliveoil === 1 ? "" : "s"}${o.ines ? " (Tomi presses the olive crate while he's in, and brings it up)" : ""}.</p>` + shut; }
  if (tab === "basket") { const herbs = [...Object.keys(HERB), "goatmilk", "oliveoil"], inBag = herbs.filter(a => have(F, a)), bn = a => a === "goatmilk" ? "Goat's milk" : a === "oliveoil" ? "Olive oil" : nm(a);
    return h + `<p class="sub">Anything the bench uses can wait here: herbs, fruit, flowers, honey, goat's milk, olive oil. The bench takes from it as well as your backpack. Tomi brings up the oil he presses and leaves it here for you.</p>
      <p class="eyebrow" style="margin:10px 0 6px">In the basket</p>${Object.keys(c.basket).some(a => c.basket[a] > 0) || c.oil > 0 ? `<ul class="hlist wlist">${Object.keys(c.basket).filter(a => c.basket[a] > 0).concat(c.oil > 0 ? ["milloil"] : []).map(a => `<li><span class="wpic">${icon(a === "milloil" ? "oliveoil" : (ITEMS[a] || {}).ico || a, 28)}</span><span class="wtxt"><b>${esc(a === "milloil" ? "The mill's own olive oil" : a === "oliveoil" ? "Your olive oil" : bn(a))}</b><small>${a === "milloil" ? `${c.oil} bottle${c.oil === 1 ? "" : "s"} from Tomi's pressing (he infuses with these)` : a === "oliveoil" ? `${c.basket[a]} bottle${c.basket[a] === 1 ? "" : "s"}, yours and Tomi's pressing` : `${c.basket[a]} in the basket`}</small></span><span class="orbtns"><button class="btn small alt" data-mc="unbasket:${a}:1">Take 1</button><button class="btn small alt" data-mc="unbasket:${a}:99">All</button></span></li>`).join("")}</ul>` : `<p class="muted">The basket's empty.</p>`}
      <p class="eyebrow" style="margin:10px 0 6px">From your backpack</p>
      ${inBag.length ? `<div class="actions">${inBag.map(a => `<button class="btn small alt" data-mc="basket:${a}">${HERB[a] ? dots([a]) : ""} Put in ${have(F, a)} ${esc(bn(a).toLowerCase())}</button>`).join("")}</div>` : `<p class="muted">Nothing for the basket in your backpack. Herbs come from the greenhouse, fruit from Ma Ma's orchard and the garden, flowers from her flower farm, honey from your hives and goat's milk from Wildflower Farm.</p>`}` + shut; }
  const ok = HERB_OF(tab), base = st.base || "goatmilk", pick = st.adds || [];
  const lip = tab === "balm" || tab === "lipoil", rollers = c.lipoil || [];
  const busy = tab === "oil" ? c.steep.length >= CRAFT.jars : tab === "soap" ? c.cure.length >= CRAFT.rack : tab === "balm" ? !!c.balm : tab === "lipoil" ? rollers.length >= CRAFT.rollers : !!c.pot;
  if (lip) { const wax = got(F, c, "beeswax"), comb = got(F, c, "honeycomb");
    h += `<p class="sub">${tab === "balm" ? `A block of beeswax, a bottle of olive oil and one flavour, set in tins for an hour: four tins. You've ${wax} block${wax === 1 ? "" : "s"} of beeswax and ${oilHave(F, c)} of olive oil.` : `A bottle of olive oil and one flavour, steeped in the rollers for a day: three little bottles. You've ${oilHave(F, c)} bottle${oilHave(F, c) === 1 ? "" : "s"} of olive oil.`} Add a flower for colour, if you like.</p>`
      + (tab === "balm" && comb ? `<div class="actions"><button class="btn small alt" data-mc="render">Melt down a honeycomb (${comb}): ${CRAFT.waxPer} blocks of beeswax</button></div>` : tab === "balm" && !wax ? `<p class="muted">No beeswax: melt down honeycomb from your hives here, or buy a block at the honey house on Sunflower Hill.</p>` : "");
    const nowL = tab === "balm" ? (c.balm ? [c.balm] : []) : rollers; if (nowL.length) h += `<ul class="hlist wlist">${jobs(nowL, tab === "balm" ? "setting" : "steeping")}</ul>`;
    const known = c.recipes.filter(r => r.kind === tab);
    if (known.length) h += `<p class="eyebrow" style="margin:10px 0 6px">Make one you know</p><ul class="hlist wlist">${known.map(r => { const can = !busy && r.adds.every(a => got(F, c, a)) && (!r.dye || dyeHave(F, r.dye) > 0) && oilHave(F, c) >= 1 && (tab !== "balm" || got(F, c, "beeswax") >= 1);
      return `<li><span class="wpic">${icon(`${tab}_${r.dye || "none"}`, 28)}</span><span class="wtxt"><b>${esc(r.name)}</b><small>${dots(r.adds)} ${ITEMS[itemId(r)] ? ITEMS[itemId(r)].price : ""} coins each</small></span><button class="btn small ${can ? "primary" : "alt"}" data-mc="again:${r.id}" ${can ? "" : "disabled"}>Make</button></li>`; }).join("")}</ul>`;
    if (busy) return h + `<p class="muted">${tab === "balm" ? "A tray of balm's setting." : "Both roller trays are steeping."}</p>` + shut;
    const pick = st.adds || [], dye = st.dye || null, flav = HERB_OF(tab).filter(a => got(F, c, a)), dyes = Object.keys(FLOWERS).filter(d => dyeHave(F, d) > 0);
    h += `<div class="ppbatch">${icon(`${tab}_${dye || "none"}`, 64)}</div>`;
    h += `<p class="eyebrow" style="margin:10px 0 6px">The flavour (one)</p>${flav.length ? `<div class="gchips">${flav.map(a => `<button class="gchip${pick.includes(a) ? " on" : ""}" data-mc="add:${a}" aria-pressed="${pick.includes(a)}"><i class="mulldot" style="background:${HERB[a].col}"></i><span>${esc(nm(a))}</span></button>`).join("")}</div>` : `<p class="muted">No flavours with you: honey, mint, orange, lemon, lavender, rose, strawberries...</p>`}`;
    h += `<p class="eyebrow" style="margin:10px 0 6px">The colour (a flower, if you like)</p><div class="gchips"><button class="gchip${!dye ? " on" : ""}" data-mc="dye:" aria-pressed="${!dye}"><span>None</span></button>${dyes.map(d => `<button class="gchip${dye === d ? " on" : ""}" data-mc="dye:${d}" aria-pressed="${dye === d}"><i class="mulldot" style="background:${FLOWERS[d].col}"></i><span>${esc(capW(FLOWERS[d].one))} (${dyeHave(F, d)})</span></button>`).join("")}</div>${dyes.length ? "" : `<p class="muted">Stems from Ma Ma's flower farm (in its shed) or tulips and sunflowers from your garden make the colours.</p>`}`;
    const ready = pick.length === 1;
    return h + `<div class="actions"><button class="btn primary" data-mc="make" ${ready ? "" : "disabled"}>${ready ? (c.recipes.some(r => r.id === keyOf(tab, null, pick, dye)) ? `Make ${esc(craftName(tab, null, pick, dye))}` : "Try something new") : "Make it"}</button></div>` + shut;
  }
  h += `<p class="sub">${tab === "oil" ? `Two bottles of olive oil and one or two herbs or fruits, steeped for six hours: two bottles of infused oil. You've ${oilHave(F, c)} bottle${oilHave(F, c) === 1 ? "" : "s"} of plain oil (backpack and mill).` : tab === "soap" ? `Goat's milk (two) or olive oil (one), and one or two things to go in. A day on the curing rack: six bars.` : `A goat's milk, a bottle of olive oil and one scent. An hour in the little pot: three jars.`}</p>`;
  const now = tab === "oil" ? c.steep : tab === "soap" ? c.cure : c.pot ? [c.pot] : [];
  if (now.length) h += `<ul class="hlist wlist">${jobs(now, tab === "oil" ? "steeping" : tab === "soap" ? "curing" : "warming")}</ul>`;
  const known = c.recipes.filter(r => r.kind === tab);
  if (known.length) h += `<p class="eyebrow" style="margin:10px 0 6px">Make one you know</p><ul class="hlist wlist">${known.map(r => { const can = !busy && r.adds.every(a => got(F, c, a));
    return `<li><span class="wtxt"><b>${esc(r.name)}</b><small>${dots(r.adds)} ${ITEMS[itemId(r)] ? ITEMS[itemId(r)].price : ""} coins each</small></span><button class="btn small ${can ? "primary" : "alt"}" data-mc="again:${r.id}" ${can ? "" : "disabled"}>Make</button></li>`; }).join("")}</ul>`;
  if (busy) return h + `<p class="muted">${tab === "oil" ? "All three jars are steeping." : tab === "soap" ? "The rack's full of curing soap." : "The lotion pot's on."}</p>` + shut;
  if (tab === "soap") h += `<p class="eyebrow" style="margin:10px 0 6px">The base</p><div class="gchips">${[["goatmilk", `Goat's milk (${got(F, c, "goatmilk")})`], ["oliveoil", `Olive oil (${oilHave(F, c)})`]].map(([k, n]) => `<button class="gchip${base === k ? " on" : ""}" data-mc="base:${k}" aria-pressed="${base === k}">${esc(n)}</button>`).join("")}</div>`;
  const inBag = ok.filter(a => got(F, c, a));
  h += `<p class="eyebrow" style="margin:10px 0 6px">${tab === "lotion" ? "The scent (one)" : "What goes in (one or two)"}</p>${inBag.length ? `<div class="gchips">${inBag.map(a => `<button class="gchip${pick.includes(a) ? " on" : ""}" data-mc="add:${a}" aria-pressed="${pick.includes(a)}"><i class="mulldot" style="background:${HERB[a].col}"></i>${esc(nm(a))} (${got(F, c, a)})</button>`).join("")}</div>` : `<p class="muted">Nothing for these in your backpack or the basket yet: ${ok.map(a => nm(a).toLowerCase()).join(", ")}.</p>`}`;
  const ready = pick.length >= 1 && pick.length <= K.max;
  return h + `<div class="actions"><button class="btn primary" data-mc="make" ${ready ? "" : "disabled"}>${ready ? (c.recipes.some(r => r.id === keyOf(tab, tab === "soap" ? base : null, pick)) ? `Make ${esc(craftName(tab, base, pick))}` : "Try something new") : "Make it"}</button></div>` + shut;
}
const HERB_OF = kind => Object.keys(HERB).filter(a => HERB[a][kind]);
// round 154: upstairs (art/millup.js). Olive oil tastings at the long table, every day at 11 (and 4:15 at weekends, round 200), led by
// Hazel, four day-trippers at a time; afterwards the oils sell twice as fast for an hour. Soap workshops in the corner,
// Wednesdays and Saturdays 2 to 4, Hazel teaching five: a ticket each to the till. And at weekends a few day-trippers
// walk up the lane just to browse the shelves.
export const TASTE = {at: [11*60], weekend: [16*60 + 15], dur: 45, size: 4, boost: 60};   // round 200: Hazel hosts now, so the weekend one follows her Saturday workshop
export const WORKSHOP = {dow: [3, 6], from: 14*60, to: 16*60, size: 5, fee: 15};
const weekend = day => { const d = new Date(day + "T00:00:00Z").getUTCDay(); return d === 0 || d === 6; };
export const tastingTimes = day => [...TASTE.at, ...(weekend(day) ? TASTE.weekend : [])];
export const tastingNow = (day, hm) => tastingTimes(day).find(t => hm >= t && hm < t + TASTE.dur);
export const tastingJustDone = (day, hm) => tastingTimes(day).some(t => hm >= t + TASTE.dur && hm < t + TASTE.dur + TASTE.boost);
export const workshopNow = (day, hm) => WORKSHOP.dow.includes(new Date(day + "T00:00:00Z").getUTCDay()) && hm >= WORKSHOP.from && hm < WORKSHOP.to;
export const MILL_VISITS = [[12*60, 13*60], [13*60 + 30, 14*60 + 30], [16*60, 17*60]], MILL_WEEKDAY = [[12*60, 12*60 + 45], [15*60, 15*60 + 45]];
const hsh = s => [...s].reduce((a, ch) => (a*31 + ch.charCodeAt(0)) >>> 0, 7);
const pickN = (pool, n, seed) => { const out = []; for (let k = 0; out.length < Math.min(n, pool.length) && k < 60; k++) { const v = pool[hsh(seed + ":" + k) % pool.length]; if (!out.includes(v)) out.push(v); } return out; };
const TASTE_SEATS = [0, 1, 2, 3].flatMap(i => [[191 + i*46, 300, 1], [191 + i*46, 420, -1]]);
const WORK_SEATS = [[380, 452, 1], [408, 452, 1], [436, 452, -1], [380, 556, 1], [436, 556, -1]];
// npcs.js: where someone is, upstairs (needs the Mill Shop open); tourists are the out-of-towners, busy = touring or a stall
export function millSlot(id, day, hm, open, tourists, busy = []){
  if (!open) return null; const pool = tourists.filter(t => !busy.includes(t)), t0 = tastingNow(day, hm);
  if (t0 != null) { const w = [t0, t0 + TASTE.dur]; if (id === "hazel") return {from: w[0], to: w[1], scene: "millup", at: [150, 356], dir: 1, act: "point", tasting: true};
    const k = pickN(pool, TASTE.size, day + "taste" + t0).indexOf(id); if (k >= 0) { const [x, y, d] = TASTE_SEATS[[0, 3, 4, 7][k]]; return {from: w[0], to: w[1], scene: "millup", at: [x, y], dir: d, act: "sit", tasting: true}; } }
  if (workshopNow(day, hm)) { const w = [WORKSHOP.from, WORKSHOP.to]; if (id === "hazel") return {from: w[0], to: w[1], scene: "millup", at: [410, 508], dir: -1, act: "point", workshop: true};
    const k = pickN(pool, WORKSHOP.size, day + "work").indexOf(id); if (k >= 0) { const [x, y, d] = WORK_SEATS[k]; return {from: w[0], to: w[1], scene: "millup", at: [x, y], dir: d, act: "sit", workshop: true}; } }
  const dw = new Date(day + "T00:00:00Z").getUTCDay(); if (!tourists.includes(id) || SHOPKEEP.closed.includes(dw)) return null;
  const visits = weekend(day) ? MILL_VISITS : MILL_WEEKDAY;   // round 181: weekday browsers too, fewer
  const who = visits.map((_, i) => pool[(hsh(day) + i*3) % pool.length]), i = who.indexOf(id); if (i < 0) return null; const [from, to] = visits[i]; if (hm < from || hm >= to) return null;
  const wander = [[100, 300], [100, 440], [440, 320], [300, 480], [150, 250]];
  if (hm >= to - 8) return {from: to - 8, to, scene: "millup", wander, millvisit: true, act: "shopbag"};   // out with a paper bag
  return {from, to: to - 8, scene: "millup", wander, millvisit: true};
}
// kept for the earlier tests' sake: the browsing visits on their own
export const millVisitSlot = (id, day, hm, open, tourists, busy = []) => { const s = millSlot(id, day, hm, open, tourists, busy); return s && s.millvisit ? s : null; };

/* ---------- Mel at a tasting ---------- */
export const NOTES = ["Fruity", "Grassy", "Peppery", "Bitter", "Almond", "Tomato leaf", "Herby", "Citrus", "Floral", "Garlicky"];
const ADD_NOTE = {rosemary: "Herby", thyme: "Herby", basil: "Herby", chives: "Herby", lemon: "Citrus", orange: "Citrus", bq_lavender: "Floral", garlic: "Garlicky"};
// the oils on the table today: Mel's own plain oil, then up to three of her infused ones -> [{name, notes}]
export function tastingOils(F){ const c = craftState(F), out = [{name: "Your own olive oil, plain", notes: ["Fruity", "Grassy", "Peppery"]}];
  c.recipes.filter(r => r.kind === "oil").slice(0, 3).forEach(r => out.push({name: r.name, notes: [...new Set(["Fruity", ...r.adds.map(a => ADD_NOTE[a]).filter(Boolean), "Peppery"])].slice(0, 3)}));
  if (out.length < 3) out.push({name: "Elena's olives, pressed young", notes: ["Grassy", "Bitter", "Tomato leaf"]}, {name: "A late-harvest oil from up the hill", notes: ["Fruity", "Almond", "Peppery"]});
  return out.slice(0, 4); }
export const tasteStart = F => ({oils: tastingOils(F), i: 0, picks: [], score: 0, said: null});
export function tastePick(st, note){ if (st.i >= st.oils.length) return; const p = st.picks[st.i] = st.picks[st.i] || []; if (p.includes(note)) st.picks[st.i] = p.filter(n => n !== note); else if (p.length < 3) p.push(note); }
export function tasteNext(st){ if (st.i >= st.oils.length) return null; const o = st.oils[st.i], p = st.picks[st.i] || [], hits = p.filter(n => o.notes.includes(n)).length; st.score += hits; st.said = {oil: o.name, notes: o.notes, hits}; st.i++; return hits; }
export const tasteDone = st => st.i >= st.oils.length;
export function finishTaste(F, st, addInv){ const c = craftState(F); c.tasted = dayKey(); c.tastings = (c.tastings || 0) + 1; if (!c.glass && !(F.inv || {}).t_glass) { c.glass = true; addInv("t_glass", 1); return true; } return false; }
ITEMS.t_glass = {n: "A cobalt tasting glass", kind: "keepsake", price: 0, ico: "olives", line: "A little cobalt-blue tasting glass from your first olive oil tasting upstairs at the mill. Blue so the colour can't fool you: you taste with your nose and your tongue, Hazel says. Like that afternoon in Córdoba."};
export function tastePanel(F, st, o = {}){
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>The tasting table</h2>`;
  if (o.shop === false) return h + `<p class="sub">A long table under dust sheets. Once the Mill Shop opens, Hazel will run olive oil tastings here: every day at 11, and at quarter past 4 at the weekend. Afterwards, people buy more oil.</p>` + shut;
  if (!o.on) return h + `<p class="sub">Olive oil tastings at the long table: every day at 11, and at quarter past 4 at the weekend. Hazel pours, everyone tastes, and after, they buy.${craftState(F).tastings ? ` You've sat in on ${craftState(F).tastings}.` : ""}</p>` + shut;
  if (o.done) return h + `<p class="sub">You've tasted today. The bread's all gone and the glasses are in the sink.</p>` + shut;
  if (!st) return h + `<p class="sub">Bottles down the middle, a little cobalt glass at every place, a board of bread and saucers for dipping. Hazel: "Warm the glass in your hand. Smell first. Then a sip, and suck in some air over it. Tell me what you get."</p><div class="actions"><button class="btn primary" data-tst="sit">Take a seat</button></div>` + shut;
  if (tasteDone(st)) { const max = st.oils.reduce((a, x) => a + x.notes.length, 0);
    return h + `<p class="sub">${st.score >= max - 2 ? 'Hazel raises her glass to you. "You\'ve got the nose. Seriously."' : st.score >= max/2 ? '"Not bad at all," Hazel says. "The pepper\'s the hardest to name."' : '"It takes years," Tomi says kindly. "I still argue with Ines about bitter."'} You found ${st.score} of ${max} notes. Around the table, everyone's reaching for their purses: bottles for the road.</p><div class="actions"><button class="btn primary" data-tst="done">Mop up the last of the bread</button></div>`; }
  const ol = st.oils[st.i], p = st.picks[st.i] || [];
  h += st.said ? `<p class="muted">Hazel, on ${esc(st.said.oil.toLowerCase())}: "${st.said.notes.join(", ")}." You got ${st.said.hits}.</p>` : "";
  h += `<p class="eyebrow">Glass ${st.i + 1} of ${st.oils.length}</p><p class="sub">${esc(ol.name)}. Warm it, smell it, sip. What do you taste? (Up to three.)</p><div class="gchips">${NOTES.map(n => `<button class="gchip${p.includes(n) ? " on" : ""}" data-tst="note:${n}" aria-pressed="${p.includes(n)}">${n}</button>`).join("")}</div>`;
  return h + `<div class="actions"><button class="btn primary" data-tst="next" ${p.length ? "" : "disabled"}>${st.i + 1 < st.oils.length ? "Next glass" : "Last one"}</button></div>`;
}
export function workshopPanel(F, o = {}){
  const c = craftState(F), today = dayKey();
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>The workshop corner</h2>`;
  if (o.shop === false) return h + `<p class="sub">An empty corner by the window. Once the Mill Shop opens, Hazel will teach soap-making here on Wednesdays and Saturdays, 2 to 4: five people at ${WORKSHOP.fee} coins a ticket.</p>` + shut;
  if (!o.on) return h + `<p class="sub">Soap-making workshops, Wednesdays and Saturdays, 2 to 4: Hazel teaches five at a time, and they take their bars home. ${WORKSHOP.fee} coins a ticket, paid to you at 4.</p>` + shut;
  if ((c.helped || "") === today) return h + `<p class="sub">You've helped today. Hazel's got it from here.</p>` + shut;
  return h + `<p class="sub">Hazel's at the head of the table, five day-trippers in aprons, everyone stirring. "Gently! Like you're tucking it in." Lend a hand?</p><div class="actions"><button class="btn primary" data-tst="help">Help Hazel</button></div>` + shut;
}
const UNMADE = [["soap", "goatmilk", ["bq_lavender", "honey"]], ["soap", "oliveoil", ["rosemary", "lemon"]], ["soap", "goatmilk", ["strawberry", "bq_sweetpea"]], ["lotion", null, ["bq_camellia"]], ["soap", "goatmilk", ["blueberry", "bq_heather"]], ["oil", null, ["garlic", "chives"]], ["soap", "oliveoil", ["orange", "thyme"]]];
// helping: tips, and Hazel tells Mel about a mix she hasn't made yet
export function helpWorkshop(F){ const c = craftState(F); c.helped = dayKey(); const tips = 12; F.coins = (F.coins || 0) + tips;
  const next = UNMADE.find(([k, b, a]) => !c.recipes.some(r => r.kind === k && (r.base || null) === (k === "soap" ? b : null) && r.adds.join() === [...a].sort().join()));
  return {tips, hint: next ? craftName(next[0], next[1], next[2]) : null}; }
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
export const MILLSHOP_LINE = "Upstairs at the old mill, opened up as a little shop: shelves of your infused oils, stacks of soap, jars of lotion, and Hazel behind the counter.";
