// The Cocoa Room: Mel's chocolate shop on the bay (in the shopfront that was under renovation; opened as a big goal,
// goals.js "cocoa"). Mel makes everything herself, bean to bar:
//   beans   a sack of cacao beans from the sacks in the kitchen (25 coins a sack)
//   roast   a sack at a time in the roaster: ready in 10 minutes
//   grind   roasted beans in the stone grinder, as milk, dark or white chocolate: ready in 2 hours
//   temper  the ground pot on the marble slab: 30 pieces of chocolate, ready to use
//   mould   10 pieces make 10 bars in the moulds, onto the bar wall
//   bonbons a shell (6 pieces of milk, dark or white) and one or two fillings from the kitchen's fillings shelf make
//           a tray of 12 bonbons. Every new combination is a discovery with its own name; known ones make another tray.
//           Up to 6 flavours sit in the shop's display case (customers buy 2-4 at a time); Mel can have one, or pack a
//           gift box of 4 or 9 from what's on display.
// Mateo, the kitchen hand (a student, part-time: Wednesday and Friday afternoons 2 to 6, Saturday 10 to 5), keeps the bar line going on his own: he roasts, grinds,
// tempers and moulds whenever a station's free. Tempered chocolate goes onto the bonbon shelf first (c.res), up to
// Mel's targets (c.keep); only what's beyond that becomes bars (Mel's own pots stay loose: bars or bonbons, her call), so the bonbon chocolate is never moulded. He uses the
// sacks in the kitchen (leaving c.plan.hold of them alone) and, with auto-buy on, orders a sack when they run out,
// never taking Mel's coins below c.plan.floor.
// Around the village (step 3):
//   Scoop Shack  10 pieces of loose dark chocolate go to the gelato fridge as Cocoa Room chocolate (5 of the
//                ingredient "housechoc"), or to the dip station as its house-made dark pot (20 dips; dipped cones in it
//                sell for 2 coins more, scoop.js)
//   wine         a bottle off the wine shop shelf opens into 4 wine fillings (wine_<style>); a pairing box is a bottle
//                plus 4 bonbons from the case (gift "pairbox"); on wine club nights members buy chocolates too
//   festivals    around Christmas, Chinese New Year, Deepavali and Mid-Autumn the bonbon table makes that festival's
//                special (12 pieces of chocolate), sold beside the case while the festival's on, or to give
// Upgrades (step 4, CC_UPS, bought from the catalogue at the counter; c.up): a window display (busier), a hot chocolate
// bar (hot chocolate from the loose chocolate, best in the evening and on rainy days), a second grinder (two pots at
// once: slots grind/ground and grind2/ground2), gift wrapping (customers buy gift boxes; a grand box of 16), a cacao
// tree at Ma Ma's (a free sack every two days), a chocolate fountain (tips; Evan loves it), a supply deal (10 dark
// pieces to the Scoop Shack's fridge each morning), weekend workshops (Saturday 2 to 4: a class pays 48 coins), a
// second assistant (Lila: open Mondays too, a little busier) and a farmers market cart (Mateo, Sunday mornings 8 to 1,
// at stall place 9 on the field: tours.js MARKET, shown once it's bought).
// The shop is open 11am to 8pm, Tuesday to Sunday. Amara serves at the counter; customers buy bars off the wall (more
// often while Mel's serving too). Takings go straight to Mel. Mel can have a bar or take one to give.
import { esc, dayKey, sgHM, hash } from "../util.js";
import { icon } from "../art/icons.js";
import { INGR, farmShelf, scoopState, hasUp, takeBack } from "./scoop.js";
import { wineClubNow } from "./tours.js";
import { festivalOn, rainyOn } from "../art/village-extras.js";

export const OPEN = 11*60, CLOSE = 20*60, ROAST_MIN = 10, GRIND_MIN = 120, POT = 30, MOULD = 10, SACK = 25;
export const KINDS = {milk: {n: "Milk chocolate", col: "#8A5A3A"}, dark: {n: "Dark chocolate", col: "#4A2E22"}, white: {n: "White chocolate", col: "#F3E7C9"}};
export const BAR_ID = k => "bar_" + k;
export const HAND = {3: [14*60, 18*60], 5: [14*60, 18*60], 6: [10*60, 17*60]}, WALL = 40;   // Mateo's shifts by weekday; he stops moulding a kind at 40 bars on the wall
const now = () => Date.now() + (globalThis.__mapleOffset || 0);
export const openOn = (day, hm, mon) => (mon || new Date(day + "T00:00:00Z").getUTCDay() !== 1) && hm >= OPEN && hm < CLOSE;
export const CC_UPS = {
  window: {n: "Window display", price: 300, line: "A proper window: tiered stands of bonbons, a chocolate sculpture, little lights. More passers-by come in (about a fifth busier)."},
  hotchoc: {n: "Hot chocolate bar", price: 400, line: "A steamer on the counter and a row of mugs. Hot chocolate from your own chocolate, 1 piece a cup; best in the evenings and on rainy days."},
  grinder2: {n: "Second grinder", price: 600, line: "Another stone grinder beside the first, so two pots can grind at once."},
  wrap: {n: "Gift wrapping station", price: 350, line: "Ribbons, tissue and boxes. Customers buy bonbons in gift boxes (a little extra each time), and you can pack a grand box of 16."},
  tree: {n: "Cacao tree at Ma Ma's", price: 500, line: "A cacao tree in Ma Ma's orchard. She looks after it, and a free sack of beans turns up in the kitchen every two days."},
  fountain: {n: "Chocolate fountain", price: 450, line: "A three-tier fountain on the end of the counter. Customers linger and leave tips. Evan will want to live here."},
  supply: {n: "Supply deal with the Scoop Shack", price: 250, line: "Every morning, 10 pieces of loose dark chocolate go to the Scoop Shack's gelato fridge on their own (when there are 10 spare)."},
  workshop: {n: "Weekend workshops", price: 700, line: "Saturday afternoons, 2 to 4: a class of six makes their own bonbons at the tables, and pays 8 coins each."},
  assistant: {n: "Second assistant", price: 500, line: "Lila joins the team. The shop opens on Mondays too, and it's a little busier with two behind the counter."},
  cart: {n: "Farmers market cart", price: 400, line: "A little chocolate cart for the Sunday farmers market, 8 to 1. Mateo runs it, selling bars, bonbons and hot chocolate."}
};
export const ccUp = (c, k) => !!(c.up && c.up[k]);
export function buyCcUp(F, k){
  const c = cocoaState(F), u = CC_UPS[k]; if (!u || c.up[k] || F.coins < u.price) return null;
  F.coins -= u.price; c.up[k] = Date.now(); if (k === "tree") c.treeAt = now();
  return {window: "The new window's in: tiered stands, little lights, and a chocolate sculpture of the bay.", hotchoc: "The hot chocolate bar's on the counter, mugs and all. Set its price at the counter.",
    grinder2: "A second stone grinder, rumbling away beside the first.", wrap: "The wrapping station's set up: ribbons, tissue, boxes in every size.",
    tree: "A cacao tree in Ma Ma's orchard! She says she'll talk to it every morning.", fountain: "The chocolate fountain's flowing. Evan is going to lose his mind.",
    supply: "Done: the Scoop Shack gets 10 pieces of your dark chocolate every morning, when there's enough spare.", workshop: "Weekend workshops are on: Saturdays, 2 to 4, at the tables.",
    assistant: "Lila starts Monday! The shop's open seven days now.", cart: "The chocolate cart's ready for Sunday's farmers market. Mateo's thrilled."}[k];
}
export const cartOn = (day, hm) => new Date(day + "T00:00:00Z").getUTCDay() === 0 && hm >= 8*60 && hm < 13*60;   // the Sunday farmers market
export const workshopOn = (day, hm) => new Date(day + "T00:00:00Z").getUTCDay() === 6 && hm >= 14*60 && hm < 16*60;
export const WORKSHOP = 6, WORKSHOP_FEE = 8, TREE_EVERY = 2*864e5, BOX16 = 16;

export function cocoaState(F){
  F.cocoa = F.cocoa || {};
  const c = F.cocoa;
  c.name = c.name || "The Cocoa Room"; c.beans = c.beans || 0; c.roasted = c.roasted || 0; c.roast = c.roast || null; c.grind = c.grind || null;
  c.ground = c.ground || null; c.choc = Object.assign({milk: 0, dark: 0, white: 0}, c.choc || {}); c.bars = Object.assign({milk: 0, dark: 0, white: 0}, c.bars || {});
  c.prices = Object.assign({bar: 6, bonbon: 3}, c.prices || {}); c.sold = c.sold || {}; c.made = c.made || 0;
  c.pantry = c.pantry || {}; c.bonbons = c.bonbons || []; c.trays = c.trays || {};
  c.res = Object.assign({milk: 0, dark: 0, white: 0}, c.res || {}); c.keep = Object.assign({milk: 30, dark: 30, white: 0}, c.keep || {});
  c.plan = Object.assign({on: true, buy: true, floor: 200, hold: 0}, c.plan || {}); c.specials = c.specials || {}; c.up = c.up || {};
  c.prices.hot = c.prices.hot || 5;
  return c;
}
const left = t => { const m = Math.max(0, Math.ceil((t - now())/60000)); return m >= 60 ? `${Math.floor(m/60)}h ${m % 60}m` : `${m} min`; };

/* ---------- making ---------- */
export function buyBeans(F, n = 1){ const c = cocoaState(F), cost = SACK*n; if (F.coins < cost) return false; F.coins -= cost; c.beans += n; return true; }
export function startRoast(F){ const c = cocoaState(F); if (c.roast || c.beans < 1) return false; c.beans--; c.roast = {done: now() + ROAST_MIN*60000}; return true; }
// the grinders: slot "" always, slot "2" with the second grinder; a slot is free when nothing's grinding or waiting in it
export const slots = c => ccUp(c, "grinder2") ? ["", "2"] : [""];
export const freeSlot = c => slots(c).find(g => !c["grind" + g] && !c["ground" + g]);
export const readyPot = c => ["", "2"].find(g => c["ground" + g]);
export function startGrind(F, kind){ const c = cocoaState(F), g = freeSlot(c); if (g === undefined || c.roasted < 1 || !KINDS[kind]) return false; c.roasted--; c["grind" + g] = {kind, done: now() + GRIND_MIN*60000}; return true; }
// a tempered pot: the bonbon shelf first, up to its target; the rest is loose chocolate for bars
function pour(c, k){ const r = Math.max(0, Math.min(POT, c.keep[k] - c.res[k])); c.res[k] += r; c.choc[k] += POT - r; return r; }
export function temper(F){ const c = cocoaState(F), g = readyPot(c); if (g === undefined) return null; const k = c["ground" + g]; c.choc[k] += POT; c["ground" + g] = null; return k; }   // Mel's own pots: loose, for bars or bonbons
export function mould(F, kind){ const c = cocoaState(F); if (!KINDS[kind] || c.choc[kind] < MOULD) return false; c.choc[kind] -= MOULD; c.bars[kind] += MOULD; c.made += MOULD; return true; }
// the timers finishing: roasted beans out of the roaster, a pot out of the grinder (waiting to be tempered)
function finish(c, t = now()){
  let out = null;
  if (c.roast && t >= c.roast.done) { c.roasted++; c.roast = null; out = "roast"; }
  for (const g of ["", "2"]) if (c["grind" + g] && t >= c["grind" + g].done && !c["ground" + g]) { c["ground" + g] = c["grind" + g].kind; c["grind" + g] = null; out = out || "grind"; }
  return out;
}

/* ---------- bonbons ---------- */
export const SHELL = 6, TRAY = 12, CASE = 6;
// what can go in a bonbon: the gelato fridge's ingredients, minus the savoury ones
const NOT_FILLING = ["milk", "goatmilk", "yoghurt", "egg", "olives", "corn", "carrot", "tomato", "housechoc", "pea"];
// and wine from Mel's own bottles: one bottle off the wine shop shelf makes 4 fillings
export const WINE_FILL = {wine_red: ["Red wine", "Red Wine", "#7A1F3D"], wine_rose: ["Rosé", "Rosé", "#E98AA0"], wine_white: ["White wine", "White Wine", "#E8D57A"], wine_sparkling: ["Sparkling wine", "Bubbly", "#F3E7B0"]};
export const WINE_FILLS = 4;
const FL = id => INGR[id] || WINE_FILL[id];
export const isFilling = id => (id in INGR && !NOT_FILLING.includes(id)) || id in WINE_FILL;
export const fillName = id => FL(id)[0];
const STYLE = ["Truffle", "Bonbon", "Praline", "Ganache", "Heart"], POETIC = ["Jetty Sunset", "Lantern Night", "Ma Ma's Garden", "Sea Breeze", "First Light", "Golden Hour", "Low Tide", "Porch Swing", "Maple's Secret", "Night Market"];
const keyOf = (shell, fills) => [shell, ...[...new Set(fills)].sort()].join("+");
export function bonbonName(shell, fills){
  const f = [...new Set(fills)].sort(), h = hash(keyOf(shell, f)), style = STYLE[h % STYLE.length], sh = shell[0].toUpperCase() + shell.slice(1);
  if (f.length === 1) return `${sh} ${FL(f[0])[1]} ${style}`;
  if (h % 3 === 0) return `${POETIC[h % POETIC.length]} ${style}`;
  return `${FL(f[0])[1]} & ${FL(f[1])[1]} ${style}`;
}
export const recipeOf = (c, id) => c.bonbons.find(b => b.id === id);
export const knownBonbon = (c, shell, fills) => recipeOf(c, keyOf(shell, fills));
export const shellChoc = (c, k) => c.res[k] + c.choc[k];   // the bonbon shelf, then loose chocolate
function takeChoc(c, k, n){ const r0 = Math.min(n, c.res[k]); c.res[k] -= r0; c.choc[k] -= n - r0; }
export const canMakeBonbon = (c, shell, fills) => shellChoc(c, shell) >= SHELL && fills.length >= 1 && fills.every(f => (c.pantry[f] || 0) >= 1);
// a tray of 12: discovers a new bonbon, or makes another tray of a known one
export function makeBonbons(F, shell, fills){
  const c = cocoaState(F); fills = [...new Set(fills)].filter(isFilling).slice(0, 2);
  if (!KINDS[shell] || !fills.length || !canMakeBonbon(c, shell, fills)) return null;
  takeChoc(c, shell, SHELL); fills.forEach(f => { c.pantry[f]--; if (c.pantry[f] <= 0) delete c.pantry[f]; });
  let r = knownBonbon(c, shell, fills), isNew = false;
  if (!r) { isNew = true; r = {id: keyOf(shell, fills), shell, fills: [...fills].sort(), name: bonbonName(shell, fills), col: FL([...fills].sort()[0])[2], found: Date.now()}; c.bonbons.push(r);
    if (Array.isArray(c.display) && c.display.length < CASE) c.display = [...c.display, r.id]; }
  c.trays[r.id] = (c.trays[r.id] || 0) + TRAY;
  return {r, isNew};
}
// the display case: up to 6 flavours (auto-filled from stock until Mel arranges it)
export const displayIds = c => (Array.isArray(c.display) ? c.display.filter(id => recipeOf(c, id)) : c.bonbons.filter(b => c.trays[b.id] > 0).map(b => b.id)).slice(0, CASE);
export const onDisplay = c => displayIds(c).map(id => recipeOf(c, id)).filter(b => c.trays[b.id] > 0);
export function toggleDisplay(c, id){
  const ids = displayIds(c); if (!recipeOf(c, id)) return false;
  if (ids.includes(id)) { c.display = ids.filter(x => x !== id); return true; }
  if (ids.length >= CASE) return false; c.display = [...ids, id]; return true;
}
// the fillings shelf, stocked from the backpack or Ma Ma's farm shop shelves (like the gelato fridge)
export const backpackFillings = F => Object.keys(F.inv || {}).filter(id => isFilling(id) && F.inv[id] > 0);
export const farmFillings = orch => farmShelf(orch).filter(isFilling);
export function stockPantry(F, id, n, from, orch){
  const c = cocoaState(F); if (!isFilling(id)) return 0;
  if (from === "bag") { n = Math.min(n, (F.inv || {})[id] || 0); if (n <= 0) return 0; F.inv[id] -= n; if (F.inv[id] <= 0) delete F.inv[id]; }
  else { const key = id.startsWith("fl_") ? "stem:" + id.slice(3) : id; n = Math.min(n, orch.stock[key] || 0); if (n <= 0) return 0; orch.stock[key] -= n; if (orch.stock[key] <= 0) delete orch.stock[key]; }
  c.pantry[id] = (c.pantry[id] || 0) + n; return n;
}
// take fillings back off the shelf (into the backpack, or flower stems back to Ma Ma's shelf); wine fillings stay
export const unstockPantry = (F, id, n, orch) => id.startsWith("wine_") ? null : takeBack(cocoaState(F).pantry, id, n, F, orch);
// gift boxes from what's on display: 4 or 9 bonbons, packed in turn from each flavour. All dark shells (dairy-free)
// makes a box Marcus can have too
export const caseCount = c => onDisplay(c).reduce((a, b) => a + c.trays[b.id], 0);
function pick(c, size){   // size bonbons from the case, in turn from each flavour; true if every shell was dark
  const shown = onDisplay(c); let i = 0, dark = true;
  for (let k = 0; k < size; i++) { const b = shown[i % shown.length]; if (!(c.trays[b.id] > 0)) continue; c.trays[b.id]--; if (b.shell !== "dark") dark = false; k++; if (i > 200) break; }
  return dark;
}
export function packBox(F, size){
  const c = cocoaState(F); if (caseCount(c) < size) return null;
  const id = `box${size}${pick(c, size) ? "d" : ""}`; F.inv[id] = (F.inv[id] || 0) + 1; return id;
}
// the wine shop's shelf (vineyard.js F.vine.shelf): bottles Mel can open for fillings or pair with bonbons
export const wineShelf = F => ((F.vine && F.vine.shelf) || []).filter(b => b.n > 0 && WINE_FILL["wine_" + b.type]);
export function wineToPantry(F, shelfId){
  const c = cocoaState(F), b = wineShelf(F).find(x => x.id === shelfId); if (!b) return null;
  b.n--; const id = "wine_" + b.type; c.pantry[id] = (c.pantry[id] || 0) + WINE_FILLS; return {id, wine: b.name};
}
// a pairing box: a bottle of Mel's wine and 4 bonbons from the case, ribboned together (gift "pairbox")
export function packPairing(F, shelfId){
  const c = cocoaState(F), b = wineShelf(F).find(x => x.id === shelfId); if (!b || caseCount(c) < 4) return null;
  b.n--; pick(c, 4); F.inv.pairbox = (F.inv.pairbox || 0) + 1; return b.name;
}

/* ---------- the Scoop Shack's house chocolate ---------- */
export const SEND = 10, TO_FRIDGE = 5, TO_DIPS = 20;
export function sendScoop(F, to){
  const c = cocoaState(F), s = scoopState(F); if (c.choc.dark < SEND || (to === "dip" && !hasUp(s, "dip"))) return 0;
  c.choc.dark -= SEND;
  if (to === "dip") { s.houseDips = (s.houseDips || 0) + TO_DIPS; s.dips.house = 1; return TO_DIPS; }
  s.fridge.housechoc = (s.fridge.housechoc || 0) + TO_FRIDGE; return TO_FRIDGE;
}

/* ---------- festival specials ---------- */
export const SPECIALS = {
  christmas: {id: "sp_log", n: "Chocolate yule log", kind: "dark", use: 12, make: 4, price: 18, line: "A dark chocolate log with a sprig of holly."},
  cny: {id: "sp_coins", n: "Box of gold chocolate coins", kind: "milk", use: 12, make: 6, price: 12, line: "Milk chocolate coins in gold foil, for luck."},
  deepavali: {id: "sp_spiced", n: "Spiced chocolate box", kind: "dark", use: 12, make: 6, price: 12, line: "Dark chocolate with cardamom, cinnamon and a little chilli."},
  midautumn: {id: "sp_mooncake", n: "Chocolate mooncake", kind: "white", use: 12, make: 6, price: 10, line: "A white chocolate snowskin mooncake with a ganache middle."}
};
export const SPECIAL_IDS = Object.values(SPECIALS).map(x => x.id);
export const specialOn = day => { const f = festivalOn(day); return f && SPECIALS[f.id] ? {...SPECIALS[f.id], fest: f.name} : null; };
export function makeSpecial(F){
  const c = cocoaState(F), sp = specialOn(dayKey()); if (!sp || shellChoc(c, sp.kind) < sp.use) return null;
  takeChoc(c, sp.kind, sp.use); c.specials[sp.id] = (c.specials[sp.id] || 0) + sp.make; return sp;
}
export function takeSpecial(F, id){ const c = cocoaState(F); if (!(c.specials[id] > 0)) return false; c.specials[id]--; F.inv[id] = (F.inv[id] || 0) + 1; return true; }
export function eatBonbon(F, id){ const c = cocoaState(F), b = recipeOf(c, id); if (!b || !(c.trays[id] > 0)) return null; c.trays[id]--; return b; }

/* ---------- Mateo, the kitchen hand ---------- */
export const handOn = (day, hm) => { const w = HAND[new Date(day + "T00:00:00Z").getUTCDay()]; return !!w && hm >= w[0] && hm < w[1]; };
// which pot to grind next: the bonbon shelf's biggest gap, else whichever bar is lowest on the wall
export function nextKind(c){
  const coming = k => ["", "2"].reduce((n, g) => n + (c["ground" + g] === k || (c["grind" + g] && c["grind" + g].kind === k) ? POT : 0), 0);
  const gap = Object.keys(KINDS).map(k => [k, c.keep[k] - c.res[k] - coming(k)]).filter(([, g]) => g > 0).sort((a, b) => b[1] - a[1]);
  if (gap.length) return gap[0][0];
  return Object.keys(KINDS).sort((a, b) => (c.bars[a] + c.choc[a]) - (c.bars[b] + c.choc[b]))[0];
}
// one minute of Mateo's shift at time t: temper a finished pot, start a grind, roast (buying a sack if he may), mould
function handStep(F, c, t, out){
  const h = out.hand;
  for (const g of ["", "2"]) if (c["ground" + g]) { const k = c["ground" + g]; h.res += pour(c, k); c["ground" + g] = null; h.pots++; }
  let g; while (c.roasted > 0 && (g = freeSlot(c)) !== undefined) { const kind = nextKind(c); c.roasted--; c["grind" + g] = {kind, done: t + GRIND_MIN*60000, by: "hand"}; }
  if (!c.roast && c.roasted < 1) {
    if (c.beans <= c.plan.hold && c.plan.buy && F.coins - SACK >= c.plan.floor) { F.coins -= SACK; c.beans++; c.bought = (c.bought || 0) + 1; h.sacks++; h.spent += SACK; }
    if (c.beans > c.plan.hold) { c.beans--; c.roast = {done: t + ROAST_MIN*60000, by: "hand"}; }
  }
  for (const k of Object.keys(KINDS)) while (c.choc[k] >= MOULD && c.bars[k] < WALL) { c.choc[k] -= MOULD; c.bars[k] += MOULD; c.made += MOULD; h.bars += MOULD; }
}

/* ---------- selling ---------- */
// catch up minute by minute (at most two days): customers buy a bar or two of whatever's on the wall
export function cocoaTick(F, opts = {}){
  const c = cocoaState(F), t = now(), from = Math.max(c.at || t, t - 864e5), out = {coins: 0, n: 0, mins: 0, done: null, hand: {pots: 0, bars: 0, sacks: 0, spent: 0, res: 0}};
  for (let at = from + 60000; at <= t; at += 60000) {
    const sg = new Date(at + 8*3600e3), day = sg.toISOString().slice(0, 10), hm = sg.getUTCHours()*60 + sg.getUTCMinutes();
    out.mins++; out.done = finish(c, at) || out.done;
    if (c.plan.on && opts.hand !== false && handOn(day, hm)) handStep(F, c, at, out);
    if (ccUp(c, "tree") && at - (c.treeAt || at) >= TREE_EVERY) { c.treeAt = at; c.beans++; out.tree = (out.tree || 0) + 1; }
    if (ccUp(c, "supply") && hm >= 9*60 && c.supplyDay !== day && c.choc.dark >= SEND) { c.supplyDay = day; c.choc.dark -= SEND; const sc = scoopState(F); sc.fridge.housechoc = (sc.fridge.housechoc || 0) + TO_FRIDGE; out.supply = (out.supply || 0) + TO_FRIDGE; }
    if (ccUp(c, "workshop") && hm === 16*60 && new Date(day + "T00:00:00Z").getUTCDay() === 6 && c.workDay !== day) { c.workDay = day; const fee = WORKSHOP*WORKSHOP_FEE, s = c.sold[day] = c.sold[day] || {n: 0, coins: 0, bonbons: 0}; s.workshop = fee; s.coins += fee; out.coins += fee; out.workshop = fee; }
    if (ccUp(c, "cart") && cartOn(day, hm) && Math.random() < .03*(opts.cart ? 1.6 : 1)) { const r = sellTo(c, day, out, {hot: true}); if (r) { const s = c.sold[day]; s.cart = (s.cart || 0) + 1; out.cart = (out.cart || 0) + r; } }
    if (F.goals && F.goals.cellar && wineClubNow(day, hm) && Math.random() < .04) {   // wine club night: members pick up chocolates at the cellar door
      const shown = onDisplay(c), k = Object.keys(KINDS).find(x => c.bars[x] > 0), s = c.sold[day] = c.sold[day] || {n: 0, coins: 0, bonbons: 0};
      if (shown.length || k) { sellTo(c, day, out, {}); s.club = (s.club || 0) + 1; out.club = (out.club || 0) + 1; }
    }
    if (!openOn(day, hm, ccUp(c, "assistant"))) continue;
    if (ccUp(c, "hotchoc") && hotMinute(c, day, hm, opts, out)) continue;
    const sp = specialOn(day);
    if (sp && c.specials[sp.id] > 0 && Math.random() < .012*(new Date(day + "T00:00:00Z").getUTCDay() % 6 === 0 ? 1.4 : 1)) {   // the festival special, beside the case
      const s = c.sold[day] = c.sold[day] || {n: 0, coins: 0, bonbons: 0}; c.specials[sp.id]--; s.specials = (s.specials || 0) + 1; s.coins += sp.price; out.coins += sp.price; out.specials = (out.specials || 0) + 1; }
    const stocked = Object.keys(KINDS).filter(k => c.bars[k] > 0), shown = onDisplay(c); if (!stocked.length && !shown.length) continue;
    const d = sg.getUTCDay(), we = d === 0 || d === 6, pf = Math.pow(6/Math.max(2, c.prices.bar), 1.3);
    const busy = (ccUp(c, "window") ? 1.2 : 1)*(ccUp(c, "assistant") ? 1.1 : 1);
    if (Math.random() >= .03*(we ? 1.4 : 1)*(hm >= 15*60 && hm < 18*60 ? 1.2 : 1)*(opts.serving ? 1.5 : 1)*pf*busy) continue;
    const got = sellTo(c, day, out, {box: ccUp(c, "wrap")});
    if (got && ccUp(c, "fountain") && Math.random() < .25) { c.sold[day].coins++; c.sold[day].tips = (c.sold[day].tips || 0) + 1; out.coins++; }   // lingering by the fountain
  }
  out.done = finish(c) || out.done; c.at = from + out.mins*60000; if (out.coins) F.coins += out.coins;
  return out;
}
// one customer: a few bonbons from the case (sometimes boxed, with gift wrapping), or a bar or two, or (at the cart) a
// hot chocolate. -> the coins
function sellTo(c, day, out, o){
  const stocked = Object.keys(KINDS).filter(k => c.bars[k] > 0), shown = onDisplay(c), s = c.sold[day] = c.sold[day] || {n: 0, coins: 0, bonbons: 0};
  if (o.hot && ccUp(c, "hotchoc") && Math.random() < .3) { const k = ["milk", "dark", "white"].find(x => c.choc[x] > 0); if (k) { c.choc[k]--; s.hot = (s.hot || 0) + 1; s.coins += c.prices.hot; out.coins += c.prices.hot; out.hot = (out.hot || 0) + 1; return c.prices.hot; } }
  if (shown.length && (!stocked.length || Math.random() < .5)) {
    const boxed = o.box && Math.random() < .25, b = shown[Math.floor(Math.random()*shown.length)], n = Math.min(c.trays[b.id], boxed ? 4 : 2 + Math.floor(Math.random()*3)), coins = n*c.prices.bonbon + (boxed ? 3 : 0);
    c.trays[b.id] -= n; s.bonbons = (s.bonbons || 0) + n; if (boxed) s.boxes = (s.boxes || 0) + 1; s.coins += coins; out.coins += coins; out.bonbons = (out.bonbons || 0) + n; return coins; }
  if (!stocked.length) return 0;
  const k = stocked[Math.floor(Math.random()*stocked.length)], n = Math.min(c.bars[k], Math.random() < .3 ? 2 : 1), coins = n*c.prices.bar;
  c.bars[k] -= n; s.n += n; s.coins += coins; out.coins += coins; out.n += n; return coins;
}
// the hot chocolate bar: a cup from the loose chocolate (milk first), busier in the evening, on rainy days and in the
// wet season -> true if one sold this minute
function hotMinute(c, day, hm, opts, out){
  const k = ["milk", "dark", "white"].find(x => c.choc[x] > 0); if (!k) return false;
  const p = .015*(hm >= 17*60 ? 1.6 : 1)*(rainyOn(day) ? 1.6 : 1)*([11, 12, 1].includes(+day.slice(5, 7)) ? 1.2 : 1)*(opts.serving ? 1.3 : 1)*Math.pow(5/Math.max(2, c.prices.hot), 1.2);
  if (Math.random() >= p) return false;
  const s = c.sold[day] = c.sold[day] || {n: 0, coins: 0, bonbons: 0}; c.choc[k]--; s.hot = (s.hot || 0) + 1; s.coins += c.prices.hot; out.coins += c.prices.hot; out.hot = (out.hot || 0) + 1; return true;
}
export function haveHot(F){ const c = cocoaState(F), k = ["milk", "dark", "white"].find(x => c.choc[x] > 0); if (!ccUp(c, "hotchoc") || !k) return null; c.choc[k]--; return k; }
// a grand box of 16 (gift wrapping station): from the case like the others
export function packGrand(F){ const c = cocoaState(F); if (!ccUp(c, "wrap") || caseCount(c) < BOX16) return null; const id = pick(c, BOX16) ? "box16d" : "box16"; F.inv[id] = (F.inv[id] || 0) + 1; return id; }
// a bar for Mel: eaten now, or into the backpack to give (a gift item, bar_<kind>)
export function takeBar(F, kind, give){ const c = cocoaState(F); if (!(c.bars[kind] > 0)) return false; c.bars[kind]--; if (give) F.inv[BAR_ID(kind)] = (F.inv[BAR_ID(kind)] || 0) + 1; return true; }

/* ---------- panels ---------- */
const coin = () => icon("coin", 13), shut = `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
const dot = c => `<span class="gdot" style="background:${c}"></span>`;
export function counterPanel(F, st){
  const c = cocoaState(F), day = dayKey(), hm = sgHM(), t = c.sold[day] || {n: 0, coins: 0};
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>${esc(c.name)}</h2><p class="sub">${st.cart ? "The farmers market cart. " : ""}${openOn(day, hm, ccUp(c, "assistant")) ? "Open till 8pm." : `Closed: open 11am to 8pm, ${ccUp(c, "assistant") ? "every day" : "Tuesday to Sunday"}.`} ${t.n || t.bonbons ? `Sold today: ${t.n} bar${t.n === 1 ? "" : "s"}${t.bonbons ? ` and ${t.bonbons} bonbon${t.bonbons === 1 ? "" : "s"}` : ""} (${t.coins} ${coin()}).` : "Nothing sold yet today."}${st.server ? " Amara's behind the counter." : ""}</p>`;
  h += `<ul class="hlist wlist">${Object.entries(KINDS).map(([k, d]) => `<li><span class="wpic">${icon(BAR_ID(k), 26)}</span><span class="wtxt"><b>${d.n} bars</b><small>${c.bars[k]} on the wall · ${c.prices.bar} ${coin()} each</small></span><span class="orbtns"><button class="btn small primary" data-cc="eat" data-k="${k}" ${c.bars[k] ? "" : "disabled"}>Have one</button><button class="btn small alt" data-cc="give" data-k="${k}" ${c.bars[k] ? "" : "disabled"}>To give</button></span></li>`).join("")}</ul>`;
  h += `<div class="row gprices"><span>Price of a bar</span><span class="gstep"><button class="btn small alt" data-cc="price" data-n="-1" aria-label="Cheaper">−</button><b>${c.prices.bar}</b><button class="btn small alt" data-cc="price" data-n="1" aria-label="Dearer">+</button></span></div>`;
  if (ccUp(c, "hotchoc")) h += `<div class="row gprices"><span>Hot chocolate${t.hot ? ` <small class="muted">(${t.hot} today)</small>` : ""}</span><span class="gstep"><button class="btn small alt" data-cc="hprice" data-n="-1" aria-label="Cheaper">−</button><b>${c.prices.hot}</b><button class="btn small alt" data-cc="hprice" data-n="1" aria-label="Dearer">+</button></span></div><div class="actions"><button class="btn small primary" data-cc="hot" ${Object.values(c.choc).some(n => n > 0) ? "" : "disabled"}>Have a hot chocolate</button></div>`;
  if (!st.cart) h += `<form class="row hadd" data-ccname="1"><label class="sr" for="ccName">Shop name</label><input id="ccName" maxlength="30" value="${esc(c.name)}"><button class="btn small alt">Rename</button></form>`;
  if (st.cart) return h + counterBonbons(F) + `<p class="muted">Mateo sells from the shop's stock: bars, bonbons from the case${ccUp(c, "hotchoc") ? ", and hot chocolate" : ""}. More people stop while you're serving.</p>` + shut;
  return h + counterBonbons(F) + planPanel(F, st) + `<div class="actions"><button class="btn small alt" data-cc="ups">Shop upgrades</button></div><p class="muted">Yours are free. Tap a bonbon to have one. Customers buy bars and bonbons while the shop's open, more often while you're here.</p>` + shut;
}
export function barWallPanel(F){
  const c = cocoaState(F);
  return `<span class="tape stripe" aria-hidden="true"></span><h2>The bar wall</h2><p class="sub">Wrapped bars, ready to sell. ${c.made} made so far.</p>
    <ul class="hlist wlist">${Object.entries(KINDS).map(([k, d]) => `<li><span class="wpic">${icon(BAR_ID(k), 26)}</span><span class="wtxt"><b>${d.n}</b><small>${c.bars[k]} bars</small></span></li>`).join("")}</ul>
    <p class="muted">${Object.values(c.bars).some(n => n) ? "Make more in the kitchen when it runs low." : "Empty! Beans to bars happens in the kitchen, through the door on the west wall."}</p>` + shut;
}
export function kitchenPanel(F, which){
  const c = cocoaState(F); finish(c);
  const short = k => KINDS[k].n.split(" ")[0].toLowerCase();
  const steps = `<p class="muted">Beans ${c.beans} · roasted ${c.roasted} · for bars ${Object.keys(KINDS).map(k => `${short(k)} ${c.choc[k]}`).join(", ")} · bonbon shelf ${Object.keys(KINDS).map(k => `${short(k)} ${c.res[k]}/${c.keep[k]}`).join(", ")}</p>`;
  if (which === "sacks") return `<span class="tape gingham" aria-hidden="true"></span><h2>Bean sacks</h2><p class="sub">Cacao beans, ${SACK} ${coin()} a sack. A sack makes a pot of chocolate: 30 pieces.</p>
    <p class="olabel">${c.beans} sack${c.beans === 1 ? "" : "s"} in the kitchen</p><div class="actions"><button class="btn primary" data-cc="beans" data-n="1" ${F.coins < SACK ? "disabled" : ""}>Buy a sack (${SACK} ${coin()})</button><button class="btn alt" data-cc="beans" data-n="3" ${F.coins < SACK*3 ? "disabled" : ""}>Three (${SACK*3} ${coin()})</button></div>${steps}` + shut;
  if (which === "roaster") return `<span class="tape stripe" aria-hidden="true"></span><h2>The roaster</h2><p class="sub">${c.roast ? `Roasting a sack: ready in ${left(c.roast.done)}.` : "Roast a sack of beans. Ten minutes, and the whole kitchen smells amazing."}</p>
    <div class="actions"><button class="btn primary" data-cc="roast" ${c.roast || c.beans < 1 ? "disabled" : ""}>${c.beans < 1 ? "No beans: buy a sack" : "Roast a sack"}</button></div>${steps}` + shut;
  const gline = g => c["grind" + g] ? `Grinding ${KINDS[c["grind" + g].kind].n.toLowerCase()}: ready in ${left(c["grind" + g].done)}.` : c["ground" + g] ? `A pot of ${KINDS[c["ground" + g]].n.toLowerCase()} is ready: temper it on the marble slab.` : "";
  if (which === "grinder") return `<span class="tape gingham" aria-hidden="true"></span><h2>The stone grinder${slots(c).length > 1 ? "s" : ""}</h2><p class="sub">${slots(c).map((g, i) => gline(g) ? (slots(c).length > 1 ? `${i ? "Second" : "First"}: ` : "") + gline(g) : "").filter(Boolean).join(" ") || "Roasted beans in, chocolate out. It takes two hours."}</p>
    ${freeSlot(c) === undefined ? "" : `<div class="actions">${Object.entries(KINDS).map(([k, d]) => `<button class="btn ${k === "milk" ? "primary" : "alt"}" data-cc="grind" data-k="${k}" ${c.roasted < 1 ? "disabled" : ""}>${dot(d.col)} ${d.n}</button>`).join("")}</div>${c.roasted < 1 ? `<p class="muted">Roast some beans first.</p>` : ""}`}${steps}` + shut;
  const pot = readyPot(c) === undefined ? null : c["ground" + readyPot(c)];
  if (which === "slab") return `<span class="tape stripe" aria-hidden="true"></span><h2>The marble slab</h2><p class="sub">${pot ? `Temper the ${KINDS[pot].n.toLowerCase()}: spread, scrape, fold, until it shines.` : "Tempering makes chocolate snap and shine. Bring a pot from the grinder."}</p>
    <div class="actions"><button class="btn primary" data-cc="temper" ${pot ? "" : "disabled"}>Temper it (${POT} pieces)</button></div>${steps}` + shut;
  return `<span class="tape gingham" aria-hidden="true"></span><h2>The moulds</h2><p class="sub">${MOULD} pieces of tempered chocolate make ${MOULD} bars, straight onto the bar wall.</p>
    <ul class="hlist wlist">${Object.entries(KINDS).map(([k, d]) => `<li><span class="wpic">${dot(d.col)}</span><span class="wtxt"><b>${d.n}</b><small>${c.choc[k]} pieces</small></span><button class="btn small primary" data-cc="mould" data-k="${k}" ${c.choc[k] < MOULD ? "disabled" : ""}>Mould ${MOULD} bars</button></li>`).join("")}</ul>${scoopSend(F)}${steps}` + shut;
}

// house chocolate for the Scoop Shack, from the loose dark chocolate
function scoopSend(F){
  const c = cocoaState(F), s = scoopState(F), ok = c.choc.dark >= SEND;
  return `<p class="eyebrow" style="margin:12px 0 6px">For ${esc(s.name)}</p><p class="muted">${SEND} pieces of dark chocolate: ${TO_FRIDGE} for the gelato fridge (Cocoa Room chocolate, a new ingredient)${hasUp(s, "dip") ? `, or ${TO_DIPS} dips of house-made dark for the dip station (they sell for more). ${s.houseDips ? `${s.houseDips} house dips left there.` : ""}` : "."}</p>
    <div class="actions"><button class="btn small alt" data-cc="scoop" data-k="fridge" ${ok ? "" : "disabled"}>To the gelato fridge</button>${hasUp(s, "dip") ? `<button class="btn small alt" data-cc="scoop" data-k="dip" ${ok ? "" : "disabled"}>To the dip station</button>` : ""}</div>`;
}

/* ---------- bonbon panels ---------- */
const ingPic = id => id.startsWith("fl_") ? icon("bq_" + id.slice(3), 26) : icon(id, 26);
const bonbonPic = (shell, col) => `<svg class="gscoop" viewBox="0 0 44 44" aria-hidden="true"><rect x="8" y="12" width="28" height="24" rx="7" fill="${KINDS[shell].col}" stroke="#3A2E28" stroke-width="1.2"/><path d="M12 20 q5 -6 10 0 q5 6 10 0" fill="none" stroke="${col}" stroke-width="3" stroke-linecap="round"/><circle cx="15" cy="16" r="2" fill="#fff" opacity=".5"/></svg>`;
const card = (shell, col, name, line, made) => `<div class="gresult${made ? " made" : ""}">${bonbonPic(shell, col)}<span><b>${esc(name)}</b><small>${esc(line)}</small></span></div>`;
export function pantryPanel(F, orch){
  const c = cocoaState(F), inS = Object.keys(c.pantry).filter(id => c.pantry[id] > 0), bag = backpackFillings(F), shelf = farmFillings(orch);
  const cell = (id, n, extra) => `<li><span class="wpic">${ingPic(id)}</span><span class="wtxt"><b>${esc(fillName(id))}</b><small>${n}</small></span>${extra || ""}</li>`;
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>The fillings shelf</h2><p class="sub">What goes inside the bonbons: fruit, flowers, honey, pandan, coffee, nuts... A tray uses one of each filling.</p>`;
  h += inS.length ? `<ul class="hlist wlist">${inS.map(id => cell(id, `${c.pantry[id]} on the shelf`, id.startsWith("wine_") ? "" : `<span class="orbtns"><button class="btn small alt" data-cc="take" data-k="${id}" data-n="1">Take 1</button><button class="btn small alt" data-cc="take" data-k="${id}" data-n="99">All</button></span>`)).join("")}</ul>` : `<p class="muted">Empty for now.</p>`;
  if (bag.length) h += `<p class="eyebrow" style="margin:12px 0 6px">From your backpack</p><ul class="hlist wlist">${bag.map(id => cell(id, `${F.inv[id]} with you`, `<span class="orbtns"><button class="btn small primary" data-cc="fill" data-src="bag" data-k="${id}" data-n="1">Add 1</button><button class="btn small alt" data-cc="fill" data-src="bag" data-k="${id}" data-n="99">All</button></span>`)).join("")}</ul>`;
  if (shelf.length) h += `<p class="eyebrow" style="margin:12px 0 6px">From Ma Ma's farm shop</p><ul class="hlist wlist">${shelf.map(id => cell(id, `${orch.stock[id.startsWith("fl_") ? "stem:" + id.slice(3) : id]} on her shelf`, `<span class="orbtns"><button class="btn small primary" data-cc="fill" data-src="farm" data-k="${id}" data-n="1">Add 1</button><button class="btn small alt" data-cc="fill" data-src="farm" data-k="${id}" data-n="99">All</button></span>`)).join("")}</ul>`;
  const wines = wineShelf(F);
  if (wines.length) h += `<p class="eyebrow" style="margin:12px 0 6px">From the wine shop</p><ul class="hlist wlist">${wines.map(b => cell("wine_" + b.type, `${esc(b.name)} · ${b.n} on the shelf`, `<button class="btn small primary" data-cc="wine" data-k="${esc(b.id)}">Open a bottle (${WINE_FILLS})</button>`)).join("")}</ul>`;
  if (!bag.length && !shelf.length && !wines.length) h += `<p class="muted">Nothing to add right now. Hana's deli has honey, pandan, coffee, nuts and more; Ma Ma's farm shop has fruit and flowers.</p>`;
  return h + shut;
}
export function bonbonPanel(F, st){
  const c = cocoaState(F), inS = Object.keys(c.pantry).filter(id => c.pantry[id] > 0 && isFilling(id)), sel = (st.sel || []).filter(id => inS.includes(id)), shell = KINDS[st.shell] ? st.shell : "dark";
  let h = `<span class="tape stripe" aria-hidden="true"></span><h2>The bonbon table</h2><p class="sub">A shell (${SHELL} pieces of chocolate) and one or two fillings make a tray of ${TRAY}. Every new pairing is a new bonbon. ${c.bonbons.length} discovered so far.</p>`;
  h += `<p class="eyebrow" style="margin:10px 0 6px">Shell</p><div class="gchips">${Object.entries(KINDS).map(([k, d]) => `<button class="gchip${k === shell ? " on" : ""}" data-cc="shell" data-k="${k}" aria-pressed="${k === shell}">${dot(d.col)}<span>${d.n.split(" ")[0]} (${shellChoc(c, k)})</span></button>`).join("")}</div>`;
  h += `<p class="eyebrow" style="margin:10px 0 6px">Fillings</p>` + (inS.length ? `<div class="gchips">${inS.map(id => `<button class="gchip${sel.includes(id) ? " on" : ""}" data-cc="sel" data-k="${id}" aria-pressed="${sel.includes(id)}" ${!sel.includes(id) && sel.length >= 2 ? "disabled" : ""}>${ingPic(id)}<span>${esc(fillName(id))}</span></button>`).join("")}</div>` : `<p class="muted">The fillings shelf is empty. Stock it first.</p>`);
  const made = st.made && recipeOf(c, st.made), known = sel.length ? knownBonbon(c, shell, sel) : null;
  if (made && !sel.length) h += card(made.shell, made.col, made.name, st.isNew ? "A new bonbon! The first tray's ready for the display case." : "Another tray of twelve, ready for the display case.", true);
  else if (sel.length) h += card(shell, FL([...sel].sort()[0])[2], known ? known.name : bonbonName(shell, sel), known ? "You know this one. Make another tray?" : "Something new!");
  const ok = sel.length && canMakeBonbon(c, shell, sel);
  h += `<div class="actions"><button class="btn primary" data-cc="bonbon" ${ok ? "" : "disabled"}>${known ? "Make another tray" : "Make it"}</button><button class="btn alt small" data-close="1">Close</button></div>`;
  if (sel.length && shellChoc(c, shell) < SHELL) h += `<p class="muted">Not enough ${KINDS[shell].n.toLowerCase()}: temper some more first, or raise its bonbon shelf target at the counter so Mateo makes some.</p>`;
  h += specialCard(c);
  if (c.bonbons.length) h += `<p class="eyebrow" style="margin:12px 0 6px">Your bonbons</p><ul class="hlist wlist">${c.bonbons.map(b => `<li><span class="wpic">${dot(KINDS[b.shell].col)}</span><span class="wtxt"><b>${esc(b.name)}</b><small>${c.trays[b.id] || 0} made · ${KINDS[b.shell].n.split(" ")[0].toLowerCase()} shell, ${esc(b.fills.map(fillName).join(" and ").toLowerCase())}</small></span><button class="btn small alt" data-cc="again" data-k="${esc(b.id)}" ${canMakeBonbon(c, b.shell, b.fills) ? "" : "disabled"}>Another tray</button></li>`).join("")}</ul>`;
  return h;
}
function specialCard(c){
  const sp = specialOn(dayKey());
  if (!sp) return `<p class="muted" style="margin-top:12px">Festival specials appear here around Deepavali, Christmas, Chinese New Year and Mid-Autumn.</p>`;
  return `<p class="eyebrow" style="margin:12px 0 6px">${esc(sp.fest)} special</p><div class="gresult">${icon(sp.id, 34)}<span><b>${esc(sp.n)}</b><small>${esc(sp.line)} ${sp.use} pieces of ${KINDS[sp.kind].n.toLowerCase()} make ${sp.make}, at ${sp.price} coins each. ${c.specials[sp.id] || 0} ready.</small></span></div>
    <div class="actions"><button class="btn small primary" data-cc="special" ${shellChoc(c, sp.kind) >= sp.use ? "" : "disabled"}>Make ${sp.make}</button></div>`;
}
export function casePanel(F){
  const c = cocoaState(F), ids = displayIds(c), shown = ids.map(id => recipeOf(c, id)), rest = c.bonbons.filter(b => !ids.includes(b.id) && c.trays[b.id] > 0);
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>The display case</h2><p class="sub">Up to ${CASE} flavours of bonbons, ${c.prices.bonbon} ${coin()} each. Customers pick two to four.</p>`;
  h += `<p class="eyebrow" style="margin:10px 0 6px">In the case (${shown.length} of ${CASE})</p>` + (shown.length ? `<ul class="hlist wlist">${shown.map(b => `<li><span class="wpic">${dot(KINDS[b.shell].col)}</span><span class="wtxt"><b>${esc(b.name)}</b><small>${c.trays[b.id] ? c.trays[b.id] + " left" : "sold out"}</small></span><button class="btn small alt" data-cc="case" data-k="${esc(b.id)}">Take out</button></li>`).join("")}</ul>` : `<p class="muted">Empty. Make bonbons at the bonbon table in the kitchen.</p>`);
  if (rest.length) h += `<p class="eyebrow" style="margin:12px 0 6px">Waiting in the kitchen</p><ul class="hlist wlist">${rest.map(b => `<li><span class="wpic">${dot(KINDS[b.shell].col)}</span><span class="wtxt"><b>${esc(b.name)}</b><small>${c.trays[b.id]} made</small></span><button class="btn small primary" data-cc="case" data-k="${esc(b.id)}" ${ids.length >= CASE ? "disabled" : ""}>Put in</button></li>`).join("")}</ul>`;
  const sp = specialOn(dayKey()); if (sp) h += `<p class="eyebrow" style="margin:12px 0 6px">Beside the case</p><p class="muted">${icon(sp.id, 20)} ${esc(sp.n)}: ${c.specials[sp.id] || 0} left, ${sp.price} ${coin()} each, for ${esc(sp.fest)}.</p>`;
  h += `<div class="row gprices"><span>Price of a bonbon</span><span class="gstep"><button class="btn small alt" data-cc="bprice" data-n="-1" aria-label="Cheaper">−</button><b>${c.prices.bonbon}</b><button class="btn small alt" data-cc="bprice" data-n="1" aria-label="Dearer">+</button></span></div>`;
  return h + shut;
}
// the upgrades catalogue (from the counter)
export function upsPanel(F){
  const c = cocoaState(F), btn = (k, u) => `<button class="btn small ${F.coins >= u.price ? "primary" : "alt"}" data-cc="buyup" data-k="${k}" ${F.coins >= u.price ? "" : "disabled"}>Buy · ${u.price} ${coin()}</button>`;
  return `<span class="tape gingham" aria-hidden="true"></span><h2>Shop upgrades</h2><p class="sub">Things to make ${esc(c.name)} even nicer. You have ${F.coins} ${coin()}.</p><ul class="hlist wlist gups">${Object.entries(CC_UPS).map(([k, u]) => `<li><span class="wtxt"><b>${esc(u.n)}</b><small>${esc(u.line)}</small></span>${c.up[k] ? `<span class="hbadge">yours</span>` : btn(k, u)}</li>`).join("")}</ul><div class="actions"><button class="btn alt small" data-cc="counter">Back</button><button class="btn alt small" data-close="1">Close</button></div>`;
}
// the kitchen plan, at the counter: Mateo on or off, the bonbon shelf's targets, auto-buy, the coin floor, sacks held back
export function planPanel(F, st = {}){
  const c = cocoaState(F), p = c.plan;
  const step = (a, k, v, label) => `<div class="row gprices"><span>${label}</span><span class="gstep"><button class="btn small alt" data-cc="${a}" data-k="${k}" data-n="-1" aria-label="Less">−</button><b>${v}</b><button class="btn small alt" data-cc="${a}" data-k="${k}" data-n="1" aria-label="More">+</button></span></div>`;
  let h = `<p class="eyebrow" style="margin:14px 0 6px">Kitchen plan</p><p class="muted">${p.on ? `Mateo runs the bar line on his shifts (he's a student: Wednesday and Friday 2 to 6, Saturday 10 to 5)${st.hand ? " (he's in the kitchen now)" : ""}. The bonbon shelf fills first and he never moulds it into bars.` : "Mateo's paused: the kitchen only runs when you work it."}</p>`;
  h += `<div class="actions"><button class="btn small ${p.on ? "alt" : "primary"}" data-cc="plan" data-k="on">${p.on ? "Pause Mateo" : "Mateo, back to work"}</button></div>`;
  h += Object.entries(KINDS).map(([k, d]) => step("keep", k, c.keep[k], `${dot(d.col)} Keep for bonbons: ${d.n.split(" ")[0].toLowerCase()} <small class="muted">(${c.res[k]} there)</small>`)).join("");
  h += `<div class="row gprices"><span>Auto-buy beans</span><button class="btn small ${p.buy ? "primary" : "alt"}" data-cc="plan" data-k="buy" aria-pressed="${p.buy}">${p.buy ? "On" : "Off"}</button></div>`;
  h += step("plan", "floor", p.floor, `Never below <small class="muted">(coins)</small>`) + step("plan", "hold", p.hold, `Sacks he leaves alone`);
  return h;
}
// the counter's bonbon part: have one from the case, or pack a gift box of 4 or 9
export function counterBonbons(F){
  const c = cocoaState(F), shown = onDisplay(c), have = shown.reduce((a, b) => a + c.trays[b.id], 0); if (!c.bonbons.length) return giveSpecials(c);
  return `<p class="eyebrow" style="margin:12px 0 6px">Bonbons</p>${shown.length ? `<div class="gchips">${shown.map(b => `<button class="gchip" data-cc="eatbb" data-k="${esc(b.id)}">${dot(KINDS[b.shell].col)}<span>${esc(b.name)}</span></button>`).join("")}</div>` : `<p class="muted">The display case is empty.</p>`}
    <div class="actions"><button class="btn small alt" data-cc="box" data-n="4" ${have >= 4 ? "" : "disabled"}>Gift box of 4</button><button class="btn small alt" data-cc="box" data-n="9" ${have >= 9 ? "" : "disabled"}>Gift box of 9</button>${ccUp(c, "wrap") ? `<button class="btn small alt" data-cc="grand" ${have >= BOX16 ? "" : "disabled"}>Grand box of 16</button>` : ""}</div>${pairing(F, have)}${giveSpecials(c)}`;
}
function pairing(F, have){
  const wines = wineShelf(F).slice(0, 4); if (!wines.length) return "";
  return `<p class="eyebrow" style="margin:12px 0 6px">Wine pairing box</p><p class="muted">A bottle from the wine shop and 4 bonbons from the case, to give.</p><div class="actions">${wines.map(b => `<button class="btn small alt" data-cc="pair" data-k="${esc(b.id)}" ${have >= 4 ? "" : "disabled"}>With ${esc(b.name)}</button>`).join("")}</div>`;
}
function giveSpecials(c){
  const have = Object.values(SPECIALS).filter(x => c.specials[x.id] > 0); if (!have.length) return "";
  return `<div class="actions">${have.map(x => `<button class="btn small alt" data-cc="takesp" data-k="${x.id}">${icon(x.id, 18)} ${esc(x.n)} to give (${c.specials[x.id]})</button>`).join("")}</div>`;
}
