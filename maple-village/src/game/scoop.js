// The Scoop Shack: Mel's ice cream shop on the bay, north of the foreshore. Open 10am to 8pm.
//   ingredients  stocked into the kitchen fridge from the backpack, or straight off Ma Ma's farm shop shelves
//                (fruit and flower stems); milk from Mel's goats or Hana's market
//   discovery    at the mixing bench, any 1 to 4 ingredients make a flavour, and every combination is a new one
//                (never a bad recipe). The first tub is made there and then. With milk it's a gelato, without a
//                (dairy-free) sorbet
//   tubs         Mel makes them herself: another tub (20 scoops) of a flavour she knows, from the recipe book on
//                the kitchen wall or the mixing bench, uses one of each of its ingredients from the fridge
//   sales        customers buy cups, cones, floats and waffles while it's open; the takings come to Mel. Prices
//                are set per type, and a flavour marked special costs a little more
//   for Mel      a free one at the counter (and one for Evan), or one to take away and give
//   upgrades     bought from the catalogue in the shop (s.up): an honesty freezer out front that sells cups while
//                the shop's shut (coins wait in its box), a striped awning and fairy lights over the deck (tips),
//                a neon cone sign (busier evenings), a delivery bike (Tomo pedals ice creams round to the family
//                from anywhere), and the chocolate dip station: a little room off the shop with dips and toppings,
//                each bought separately, for dipped cones and waffles
import { esc, dayKey, sgHM, hash } from "../util.js";
import { icon } from "../art/icons.js";
import { ITEMS } from "../data/items.js";
import { TREES, FLOWERS } from "../data/orchard.js";

export const OPEN = 10*60, CLOSE = 20*60, TUB = 20;
// the churner: every tub (a new flavour's first, or another of a known one) blends and then freezes before it's ready,
// an hour in all; it holds two batches at once (s.churn: [{id, done, isNew}])
export const CHURN_MIN = 60, CHURNS = 2;
const clock = () => Date.now() + (globalThis.__mapleOffset || 0);
export const churnFull = s => s.churn.length >= CHURNS;
export const churnLeft = b => { const m = Math.max(0, Math.ceil((b.done - clock())/60000)); return m >= 60 ? `${Math.floor(m/60)}h ${m % 60}m` : `${m} min`; };
// batches whose time is up go into the freezer (and the display, if it's arranged and has room) -> the recipes done
export function finishChurn(s, t = clock()){
  const done = s.churn.filter(b => t >= b.done); if (!done.length) return [];
  s.churn = s.churn.filter(b => t < b.done);
  return done.map(b => { const r = recipeOf(s, b.id); if (!r) return null; s.tubs[r.id] = (s.tubs[r.id] || 0) + TUB;
    if (Array.isArray(s.display) && !s.display.includes(r.id) && s.display.length < SLOTS) s.display = [...s.display, r.id];
    s.log = [`${r.name}: frozen and ready`, ...s.log].slice(0, 6); return r; }).filter(Boolean);
}
const toChurn = (s, id, isNew) => { s.churn = [...s.churn, {id, done: clock() + CHURN_MIN*60000, isNew}]; };
// Sofia runs the counter; Tomo serves out on the floor and the deck (a little busier while he's on) and does the
// deliveries once there's a bike
export const SERVER = "sofia", WAITER = "tomo";
export const FORMATS = {cup: {n: "Cup", p: 4}, cone: {n: "Cone", p: 4}, float: {n: "Float", p: 6}, waffle: {n: "Waffle", p: 7}};
const FMT_W = [["cup", .34], ["cone", .4], ["float", .1], ["waffle", .16]];

// What can go into a flavour: [display name, the word used in flavour names, colour]
const FRUIT_COL = {cherry: "#C2334D", lemon: "#F3E27A", peach: "#F5B08A", mango: "#F3B33A", apple: "#B9D98A", pear: "#D9E39A", fig: "#8C5A7A", orange: "#F39A3A", persimmon: "#E8823A"};
export const INGR = {
  milk: ["Milk", "Milk", "#FFFBEF"], honey: ["Honey", "Honey", "#F3C969"], egg: ["Egg", "Custard", "#F6E3A1"], olives: ["Olives", "Olive", "#9DAF6A"],
  strawberry: ["Strawberries", "Strawberry", "#E8566C"], blueberry: ["Blueberries", "Blueberry", "#5E6EB8"], pumpkin: ["Pumpkin", "Pumpkin", "#E8913A"],
  corn: ["Sweetcorn", "Sweetcorn", "#F3D34A"], carrot: ["Carrots", "Carrot", "#F28C3A"], tomato: ["Tomatoes", "Tomato", "#E05A44"],
  chocolate: ["Dark chocolate", "Chocolate", "#5A3A2A"], vanilla: ["Vanilla", "Vanilla", "#F6EBC8"], coffee: ["Coffee", "Coffee", "#8A5A3A"], pistachio: ["Pistachios", "Pistachio", "#A8C98A"],
  hazelnut: ["Hazelnuts", "Hazelnut", "#B98A5A"], coconut: ["Coconut", "Coconut", "#F6F1E8"], matcha: ["Matcha", "Matcha", "#8FB86A"], pandan: ["Pandan", "Pandan", "#7FB86A"],
  gulamelaka: ["Gula melaka", "Gula Melaka", "#9A5A2E"], sesame: ["Black sesame", "Black Sesame", "#4A4440"], mint: ["Mint", "Mint", "#9FD3B2"], banana: ["Bananas", "Banana", "#F3E07A"],
  grape_red: ["Red grapes", "Red Grape", "#7A2E5A"], grape_white: ["White grapes", "White Grape", "#C9D98A"],
  housechoc: ["Cocoa Room chocolate", "House Chocolate", "#3F2519"],
  goatmilk: ["Goat's milk", "Goat's Milk", "#FFF8EC"],
  yoghurt: ["Yoghurt", "Yoghurt", "#FFF6F0"], honey_lav: ["Lavender honey", "Lavender Honey", "#E3C8E8"], honey_blossom: ["Orchard blossom honey", "Blossom Honey", "#F6D98A"],   // from Honeybrook Farm's goats (hfarm.js): a dairy base, like milk   // from Mel's own chocolate shop (cocoa.js sendScoop)
  ...Object.fromEntries(Object.values(TREES).map(t => [t.fruit, [t.fruit[0].toUpperCase() + t.fruit.slice(1), t.fruit[0].toUpperCase() + t.fruit.slice(1), FRUIT_COL[t.fruit] || "#F3C969"]])),
  ...Object.fromEntries(Object.entries(FLOWERS).map(([id, f]) => ["fl_" + id, [f.n, f.n.replace(/s$/, "").replace(/ie$/, "y").replace("Sweet pea", "Sweet Pea"), f.col || "#F4C7CF"]]))
};
export const isIngr = id => id in INGR;
export const isDairy = ings => ings.includes("milk") || ings.includes("goatmilk") || ings.includes("yoghurt");   // milk or goat's milk makes it a gelato
const word = id => INGR[id][1];

export function scoopState(F){
  F.scoop = F.scoop || {};
  const s = F.scoop;
  s.name = s.name || "The Scoop Shack"; s.fridge = s.fridge || {}; s.recipes = s.recipes || []; s.tubs = s.tubs || {};
  s.prices = Object.assign({cup: 4, cone: 4, float: 6, waffle: 7, special: 2, dip: 2, top: 1}, s.prices || {});
  s.plan = s.plan && s.plan.day === dayKey() ? s.plan : {day: dayKey(), ids: []};
  s.made = s.made || {}; s.sold = s.sold || {}; s.log = s.log || [];
  s.up = s.up || {}; s.dips = s.dips || {milk: 1}; s.tops = s.tops || {sprinkles: 1}; s.box = s.box || 0; s.notes = s.notes || []; s.dipIds = s.dipIds || []; s.churn = s.churn || [];
  return s;
}
export const recipeOf = (s, id) => s.recipes.find(r => r.id === id);
// The display holds 8 flavours (s.display, in slot order). Until Mel arranges it herself, it fills itself with
// whatever's in stock. Customers (and the honesty freezer) only buy what's in the display.
export const SLOTS = 8;
export const displayIds = s => Array.isArray(s.display) ? s.display.filter(id => recipeOf(s, id)).slice(0, SLOTS) : s.recipes.filter(r => s.tubs[r.id] > 0).slice(0, SLOTS).map(r => r.id);
export const onDisplay = s => displayIds(s).map(id => recipeOf(s, id)).filter(r => s.tubs[r.id] > 0);
// put a flavour out (in place of `out` when the display's full), or take one off
export function setDisplay(s, id, out){
  const ids = displayIds(s); if (!recipeOf(s, id)) return false;
  if (ids.includes(id)) s.display = ids.filter(x => x !== id);
  else if (out && ids.includes(out)) s.display = ids.map(x => x === out ? id : x);
  else if (ids.length < SLOTS) s.display = [...ids, id];
  else return false;
  return true;
}
export const flavourName = r => r ? r.name : "a flavour";
export const scoopsLeft = s => Object.values(s.tubs).reduce((a, b) => a + b, 0);
export const openNow = hm => hm >= OPEN && hm < CLOSE;
// Tomo's shift: every day 10am to 6pm, lunch 1 to 1:45 (npcs.js has the same hours)
export const waiterOn = hm => hm >= OPEN && hm < 18*60 && !(hm >= 13*60 && hm < 13*60 + 45);

/* ---------- upgrades ---------- */
export const UPGRADES = {
  honesty: {n: "Honesty freezer", price: 400, line: "A little freezer out front with pre-scooped cups and a wooden coin box. It sells while the shop's shut (7 to 10am, 8 to 10pm), and the coins wait in the box for you."},
  awning: {n: "Striped awning and fairy lights", price: 250, line: "A pink striped awning over the deck, strung with fairy lights that glow in the evenings. Customers linger, and leave tips."},
  neon: {n: "Neon cone sign", price: 350, line: "A pink neon cone by the door. It glows from 5pm, so more people find you in the evenings."},
  bike: {n: "Delivery bike", price: 800, line: "A mint delivery bike with a cool box. Tomo pedals ice creams round to the family from anywhere (send one from your backpack), and a cone from the shop can be sent round without melting."},
  dip: {n: "Chocolate dip station", price: 500, line: "A little room off the shop: warm pots of chocolate and a shelf of toppings. Cones and waffles can be dipped and topped (customers pay a bit extra), and you can make your own. Comes with milk chocolate and rainbow sprinkles; more dips and toppings to buy."}
};
export const DIPS = {
  milk: {n: "Milk chocolate", w: "milk-chocolate", col: "#8A5A3A", price: 0},
  dark: {n: "Dark chocolate", w: "dark-chocolate", col: "#4A2E22", price: 150},
  white: {n: "White chocolate", w: "white-chocolate", col: "#F6EBD2", price: 180},
  house: {n: "House-made dark", w: "house-made-dark-chocolate", col: "#3F2519", price: 0, house: true},   // from the Cocoa Room, not bought: s.houseDips
  pink: {n: "Strawberry pink", w: "strawberry", col: "#F2A0B8", price: 200},
  matcha: {n: "Matcha", w: "matcha", col: "#8FB86A", price: 220}
};
export const TOPPINGS = {
  sprinkles: {n: "Rainbow sprinkles", w: "sprinkles", col: "#F3C969", price: 0},
  coconut: {n: "Coconut shavings", w: "coconut shavings", col: "#FFFDF6", price: 100},
  nuts: {n: "Crushed hazelnuts", w: "crushed hazelnuts", col: "#B98A5A", price: 120},
  marsh: {n: "Mini marshmallows", w: "mini marshmallows", col: "#F4C7CF", price: 120},
  caramel: {n: "Salted caramel", w: "salted caramel", col: "#C98A3A", price: 160},
  strawb: {n: "Freeze-dried strawberries", w: "strawberry bits", col: "#E8566C", price: 160},
  gula: {n: "Gula melaka drizzle", w: "gula melaka", col: "#9A5A2E", price: 180},
  pop: {n: "Popping candy", w: "popping candy", col: "#9FD3C2", price: 220}
};
export const hasUp = (s, k) => !!(s.up && s.up[k]);
export const HOUSE_EXTRA = 2;   // a cone dipped in the Cocoa Room's house-made dark costs this much more
export const dipReady = (s, k) => !!(DIPS[k] && s.dips[k] && (k !== "house" || s.houseDips > 0));
// -> a line to say, or null if it can't be bought
export function buyUpgrade(F, k){
  const s = scoopState(F), u = UPGRADES[k]; if (!u || s.up[k] || F.coins < u.price) return null;
  F.coins -= u.price; s.up[k] = Date.now();
  return {honesty: "The honesty freezer's out front, full of little cups. It sells from 7 to 10am and 8 to 10pm while the shop's shut.",
    awning: "The striped awning's up over the deck, fairy lights and all. Wait till you see it at dusk.",
    neon: "The neon cone's on the wall by the door. It switches on at 5pm.",
    bike: "A mint delivery bike, parked by the shop. Send an ice cream from your backpack any time the shop's open.",
    dip: "The chocolate dip station's open! Through the new door on the shop's east wall."}[k];
}
export function buyDip(F, k){ const s = scoopState(F), d = DIPS[k]; if (!d || d.house || s.dips[k] || F.coins < d.price) return false; F.coins -= d.price; s.dips[k] = 1; return true; }
export function buyTopping(F, k){ const s = scoopState(F), t = TOPPINGS[k]; if (!t || s.tops[k] || F.coins < t.price) return false; F.coins -= t.price; s.tops[k] = 1; return true; }
const nDips = s => Object.keys(s.dips).filter(k => DIPS[k]).length, nTops = s => Object.keys(s.tops).filter(k => TOPPINGS[k]).length;
// the cart at the night market (Tuesday and Thursday, 5:30 to 10pm): scoops cups and cones from the display, busy
export const cartOn = (day, hm) => { const d = new Date(day + "T00:00:00Z").getUTCDay(); return (d === 2 || d === 4) && hm >= 17*60 + 30 && hm < 22*60; };
function cartMinute(s, day, hm, opts){
  if (!cartOn(day, hm)) return null;
  const stocked = onDisplay(s); if (!stocked.length) return null;
  const price = s.prices.cup + s.prices.cone, pf = Math.pow(8/Math.max(2, price), 1.3);
  if (Math.random() >= .03*pf*(opts.cart ? 1.6 : 1)) return null;
  const fmt = Math.random() < .45 ? "cup" : "cone", r = stocked[Math.floor(Math.random()*stocked.length)];
  s.tubs[r.id]--; if (s.tubs[r.id] <= 0) delete s.tubs[r.id];
  let coins = priceOf(s, fmt, r); if (fmt === "cone" && hasUp(s, "dip") && Math.random() < .3) coins += s.prices.dip;
  const t = s.sold[day] = s.sold[day] || {n: 0, coins: 0}; t.n++; t.coins += coins; t.cart = (t.cart || 0) + 1; t.cartCoins = (t.cartCoins || 0) + coins;
  return {coins, fmt, r};
}
// the honesty freezer sells while the shop's shut: 7 to 10am, 8 to 10pm
export const honestyOpen = hm => (hm >= 7*60 && hm < OPEN) || (hm >= CLOSE && hm < 22*60);
const NOTES = ["Best pandan ever. Sorry, only had coins for one! x", "For the little one's birthday. He says thank you.", "Left a bit extra. You deserve it!", "Took two, paid for three. Pay it forward :)",
  "Midnight snack, technically. Thank you!", "The dolphins came by while I ate it. Perfect.", "My grandma says it tastes like when she was a girl.", "Extra coin for the jar. Keep making the good stuff."];

/* ---------- discovering flavours ---------- */
const GELATO = ["Gelato", "Cream", "Swirl", "Ripple", "Velvet", "Dream"], SORBET = ["Sorbet", "Sorbetto", "Ice", "Frost"];
const POETIC = ["Dolphin Bay", "Jetty Sunset", "Ma Ma's Garden", "Lantern Night", "Sea Breeze", "Sunday Picnic", "Orchard Morning", "First Light", "Evan's Dream", "Maple's Secret", "Night Market", "Low Tide", "Paddleboard", "Golden Hour", "Rainy Window", "Swan Lake", "Wildflower", "Porch Swing"];
export function nameFor(ings){
  const dairy = isDairy(ings), flav = ings.filter(i => i !== "milk"), h = hash(ings.join("+"));
  if (!flav.length) return "Fior di Latte";
  const style = (dairy ? GELATO : SORBET)[h % (dairy ? GELATO.length : SORBET.length)];
  if (flav.length === 1) return `${word(flav[0])} ${style}`;
  if (flav.length === 2) return `${word(flav[0])} & ${word(flav[1])} ${style}`;
  return `${POETIC[h % POETIC.length]} ${style}`;
}
const blend = ings => { const cs = ings.map(i => INGR[i][2]).filter(c => c !== "#FFFBEF"); if (!cs.length) return "#FFF6DC";
  const rgb = cs.map(c => [1, 3, 5].map(k => parseInt(c.slice(k, k + 2), 16))), avg = [0, 1, 2].map(k => Math.round(rgb.reduce((a, r) => a + r[k], 0)/rgb.length));
  const soft = isDairy(ings) ? .45 : .15;   // milk makes it paler and creamier
  return "#" + avg.map(v => Math.round(v + (255 - v)*soft).toString(16).padStart(2, "0")).join(""); };
const keyOf = ings => [...new Set(ings)].sort().join("+");
export const knownRecipe = (s, ings) => s.recipes.find(r => r.id === keyOf(ings));
const hasAll = (s, ings) => ings.every(i => (s.fridge[i] || 0) >= 1);
const useAll = (s, ings) => ings.forEach(i => { s.fridge[i]--; if (s.fridge[i] <= 0) delete s.fridge[i]; });
// mix up to 4 ingredients from the fridge: a new flavour (and its first tub), or the one already known
export function discover(F, ings){
  const s = scoopState(F); ings = [...new Set(ings)].filter(isIngr).slice(0, 4);
  if (!ings.length) return {msg: "Pick something from the fridge to mix."};
  const known = knownRecipe(s, ings); if (known) return {known, msg: `You already know this one: ${known.name}. Make another tub of it instead.`};
  if (!hasAll(s, ings)) return {msg: "The fridge is missing some of that."};
  if (churnFull(s)) return {msg: `The churner's full: two batches are blending and freezing. The next one's ready in ${churnLeft(s.churn[0])}.`};
  useAll(s, ings);
  const r = {id: keyOf(ings), ings: [...ings].sort(), name: nameFor([...ings].sort()), col: blend(ings), dairy: isDairy(ings), special: false, found: Date.now()};
  s.recipes.push(r); toChurn(s, r.id, true); registerItems(F);
  return {recipe: r, msg: `A new flavour: ${r.name}! It's in the churner now: blending, then freezing. The first tub's ready in an hour.`};
}

/* ---------- the kitchen fridge ---------- */
export const backpackIngr = F => Object.keys(F.inv || {}).filter(id => isIngr(id) && F.inv[id] > 0);
export function stockFridge(F, id, n, from, orch){
  const s = scoopState(F);
  if (from === "bag") { const have = (F.inv || {})[id] || 0; n = Math.min(n, have); if (n <= 0) return 0; F.inv[id] -= n; if (F.inv[id] <= 0) delete F.inv[id]; }
  else { const key = id.startsWith("fl_") ? "stem:" + id.slice(3) : id, have = orch.stock[key] || 0; n = Math.min(n, have); if (n <= 0) return 0; orch.stock[key] -= n; if (orch.stock[key] <= 0) delete orch.stock[key]; }
  s.fridge[id] = (s.fridge[id] || 0) + n; return n;
}
// what Ma Ma's farm shop has on its shelves that could go in the fridge (fruit, and flower stems)
export const farmShelf = orch => Object.keys(orch.stock || {}).filter(k => orch.stock[k] > 0).map(k => k.startsWith("stem:") ? "fl_" + k.slice(5) : k).filter(isIngr);

/* ---------- making tubs ---------- */
export const canMake = (s, r) => r && hasAll(s, r.ings) && !churnFull(s);
// Mel makes another tub of a flavour she knows: one of each ingredient from the fridge, 20 scoops into the freezer
// (and straight into the display if it's arranged and has a free slot)
export function makeTub(F, rid){
  const s = scoopState(F), r = recipeOf(s, rid); if (!canMake(s, r)) return null;
  useAll(s, r.ings); toChurn(s, r.id, false); const day = dayKey(); s.made[day] = (s.made[day] || 0) + 1;
  s.log = [`${r.name}: into the churner`, ...s.log].slice(0, 6);
  return r;
}

/* ---------- customers ---------- */
export const priceOf = (s, fmt, r) => s.prices[fmt] + (r && r.special ? s.prices.special : 0);
const DEFAULT = 4 + 4 + 6 + 7;
function saleMinute(s, day, hm, opts){
  const box = !openNow(hm) && hasUp(s, "honesty") && honestyOpen(hm); if (!openNow(hm) && !box) return null;
  const stocked = onDisplay(s); if (!stocked.length) return null;
  const d = new Date(day + "T00:00:00Z").getUTCDay(), we = d === 0 || d === 6, night = (d === 2 || d === 4) && hm >= 17*60 + 30;
  const glow = hasUp(s, "neon") && hm >= 17*60 ? 1.3 : 1;
  if (box) {   // the honesty freezer: cups only, and the coins go in its box
    if (Math.random() >= .012*(we ? 1.3 : 1)*(night ? 1.4 : 1)*glow) return null;
    const r = stocked[Math.floor(Math.random()*stocked.length)]; s.tubs[r.id]--; if (s.tubs[r.id] <= 0) delete s.tubs[r.id];
    let coins = s.prices.cup; if (Math.random() < .15) { coins++; s.notes = [{t: NOTES[Math.floor(Math.random()*NOTES.length)], day}, ...s.notes].slice(0, 4); }
    s.box += coins; const t = s.sold[day] = s.sold[day] || {n: 0, coins: 0}; t.n++; t.coins += coins; return {coins, box: true, fmt: "cup", r};
  }
  const price = s.prices.cup + s.prices.cone + s.prices.float + s.prices.waffle, pf = Math.pow(DEFAULT/Math.max(4, price), 1.3);
  const p = .035*(we ? 1.5 : 1)*(night ? 1.4 : 1)*(hm >= 14*60 && hm < 17*60 ? 1.25 : 1)*pf*(opts.serving ? 1.5 : 1)*glow*(waiterOn(hm) ? 1.2 : 1);
  if (Math.random() >= p) return null;
  let x = Math.random(), fmt = "cone"; for (const [f, w] of FMT_W) { if ((x -= w) < 0) { fmt = f; break; } }
  const r = stocked[Math.floor(Math.random()*stocked.length)];
  s.tubs[r.id]--; if (s.tubs[r.id] <= 0) delete s.tubs[r.id];
  let coins = priceOf(s, fmt, r), dipped = false; const t = s.sold[day] = s.sold[day] || {n: 0, coins: 0};
  // dipped (and maybe topped): more choice at the dip station, more people go for it
  if (hasUp(s, "dip") && (fmt === "cone" || fmt === "waffle") && Math.random() < Math.min(.6, .25 + .03*(nDips(s) - 1 + nTops(s)))) {
    dipped = true; coins += s.prices.dip; if (Math.random() < .6) coins += s.prices.top; t.dipped = (t.dipped || 0) + 1;
    if (s.houseDips > 0 && Math.random() < .45) { s.houseDips--; coins += HOUSE_EXTRA; t.house = (t.house || 0) + 1; } }   // the Cocoa Room's house-made dark
  if (hasUp(s, "awning") && Math.random() < .25) { coins++; t.tips = (t.tips || 0) + 1; }   // lingering under the fairy lights
  t.n++; t.coins += coins; return {coins, fmt, r, dipped};
}
// catch up minute by minute since the last tick (at most two days): the kitchen, then the counter
export function scoopTick(F, opts = {}){
  const s = scoopState(F), now = Date.now() + (globalThis.__mapleOffset || 0), from = Math.max(s.at || now, now - 2*864e5);
  if (s.batch) { s.tubs[s.batch.id] = (s.tubs[s.batch.id] || 0) + TUB; s.batch = null; }   // a batch Tomo had on the go (from when he still cooked)
  const out = {coins: 0, n: 0, mins: 0, box: 0, churned: finishChurn(s, now)};
  for (let at = from + 60000; at <= now; at += 60000) {
    const sg = new Date(at + 8*3600e3), day = sg.toISOString().slice(0, 10), hm = sg.getUTCHours()*60 + sg.getUTCMinutes();
    const sale = saleMinute(s, day, hm, opts); if (sale && sale.box) out.box += sale.coins; else if (sale) { out.coins += sale.coins; out.n++; }
    const cs = cartMinute(s, day, hm, opts); if (cs) { out.coins += cs.coins; out.n++; out.cart = (out.cart || 0) + cs.coins; }
    out.mins++;
  }
  if (out.mins || !s.at) s.at = from + out.mins*60000;
  if (out.coins) F.coins += out.coins;
  return out;
}

export function collectBox(F){ const s = scoopState(F), n = s.box; if (!n) return 0; s.box = 0; F.coins += n; return n; }

/* ---------- gifts: an ice cream to take away ---------- */
// every flavour in each type becomes a backpack gift ("Mango Sorbet cone"); sorbets suit everyone, gelato everyone
// but Marcus (lactose intolerant)
const NO_DAIRY = ["evan", "darren", "mama", "gonggong", "mum", "dad", "angelina"];
export const giftId = (r, fmt) => `gel_${fmt}_${r.id.replace(/[^a-z0-9]+/g, "-")}`;
// dipped ones ("Mango Gelato cone, dark-chocolate dipped with sprinkles") are registered as they're made (s.dipIds)
const DAIRY_DIP = ["milk", "white", "matcha"];
export const dipId = (r, fmt, dip, top) => `gel_dip_${fmt}_${dip}_${top || "none"}_${r.id.replace(/[^a-z0-9]+/g, "-")}`;
const dipName = (r, fmt, dip, top) => `${r.name} ${FORMATS[fmt].n.toLowerCase()}, ${DIPS[dip].w} dipped${top && TOPPINGS[top] ? ` with ${TOPPINGS[top].w}` : ""}`;
function registerDip(s, id){
  const m = /^gel_dip_(\w+?)_(\w+?)_(\w+?)_(.+)$/.exec(id); if (!m || !FORMATS[m[1]] || !DIPS[m[2]]) return;
  const r = s.recipes.find(x => x.id.replace(/[^a-z0-9]+/g, "-") === m[4]); if (!r) return;
  const top = m[3] === "none" ? null : m[3], dairy = r.dairy || DAIRY_DIP.includes(m[2]);
  ITEMS[id] = {n: dipName(r, m[1], m[2], top), kind: "gift", to: dairy ? NO_DAIRY : "family", tab: "scoop", ico: "ic_" + m[1], gel: true, dip: true,
    say: `Dipped AND topped? You spoil me. ${r.name}, wow.`, says: {evan: "CHOCOLATE ONE!! *chocolate everywhere*", marcus: "Dark choc and sorbet, so no tummy trouble. Legend, Zeh.", mama: "So fancy! Ma Ma eat slowly, slowly.", dad: "Now that's an ice cream. Your mum wants a bite. She can't have one."}};
}
export function registerItems(F){
  const s0 = scoopState(F); s0.dipIds.forEach(id => registerDip(s0, id)); Object.keys(F.inv || {}).filter(k => k.startsWith("gel_dip_")).forEach(id => registerDip(s0, id));
  s0.recipes.forEach(r => Object.keys(FORMATS).forEach(fmt => { const id = giftId(r, fmt);
    ITEMS[id] = {n: `${r.name} ${FORMATS[fmt].n.toLowerCase()}`, kind: "gift", to: r.dairy ? NO_DAIRY : "family", tab: "scoop", ico: "ic_" + fmt, gel: true,
      say: `Ice cream! ${r.name}? Ooh, I've never had that one.`, says: {evan: "ICE CREAM!! *happy dance*", marcus: "A sorbet, so no tummy trouble. Nice one, Zeh.", mama: "Ice cream for Ma Ma? Aiyo, so cold! So nice.", dad: "Ah Gong loves ice cream. Don't tell your mum."}}; }));
}
export function takeAway(F, rid, fmt){
  const s = scoopState(F), r = recipeOf(s, rid); if (!r || !(s.tubs[rid] > 0) || !FORMATS[fmt]) return null;
  s.tubs[rid]--; if (s.tubs[rid] <= 0) delete s.tubs[rid]; registerItems(F);
  const id = giftId(r, fmt); F.inv[id] = (F.inv[id] || 0) + 1; return ITEMS[id];
}
// a dipped (and maybe topped) cone or waffle from the dip station: to eat now (null fmt) or to give
export function makeDipped(F, rid, fmt, dip, top, give){
  const s = scoopState(F), r = recipeOf(s, rid);
  if (!hasUp(s, "dip") || !r || !(s.tubs[rid] > 0) || (fmt !== "cone" && fmt !== "waffle") || !dipReady(s, dip) || (top && !s.tops[top])) return null;
  s.tubs[rid]--; if (dip === "house") s.houseDips--; if (s.tubs[rid] <= 0) delete s.tubs[rid];
  if (!give) return {r, name: dipName(r, fmt, dip, top), col: r.col, dip: DIPS[dip].col};
  const id = dipId(r, fmt, dip, top); if (!s.dipIds.includes(id)) s.dipIds = [...s.dipIds, id].slice(-200);
  registerDip(s, id); F.inv[id] = (F.inv[id] || 0) + 1; return ITEMS[id];
}
export function eatOne(F, rid){
  const s = scoopState(F), r = recipeOf(s, rid); if (!r || !(s.tubs[rid] > 0)) return null;
  s.tubs[rid]--; if (s.tubs[rid] <= 0) delete s.tubs[rid]; return r;
}

/* ---------- panels ---------- */
const coin = () => icon("coin", 13);
const dot = c => `<span class="gdot" style="background:${c}"></span>`;
const ingPic = id => id.startsWith("fl_") ? icon("bq_" + id.slice(3), 26) : icon(id, 26);
const shut = `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
const tubList = s => s.recipes.filter(r => s.tubs[r.id] > 0);
const upBtn = `<div class="actions"><button class="btn small alt" data-gview="upgrade">Shop upgrades</button></div>`;
const buyBtn = (F, price, attr, label = "Buy") => `<button class="btn small ${F.coins >= price ? "primary" : "alt"}" ${attr} ${F.coins >= price ? "" : "disabled"}>${label} · ${price} ${coin()}</button>`;
// the upgrades catalogue (a clipboard by the door, or from the counter)
export function upgradePanel(F){
  const s = scoopState(F);
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>Shop upgrades</h2><p class="sub">Things to make ${esc(s.name)} even nicer. You have ${F.coins} ${coin()}.</p><ul class="hlist wlist gups">`;
  h += Object.entries(UPGRADES).map(([k, u]) => `<li><span class="wtxt"><b>${esc(u.n)}</b><small>${esc(u.line)}</small></span>${s.up[k] ? `<span class="hbadge">yours</span>` : buyBtn(F, u.price, `data-gbuy="${k}"`)}</li>`).join("");
  return h + `</ul>` + shut;
}
// the honesty freezer out front: what's in its coin box, and any notes left with the coins
export function honestyPanel(F){
  const s = scoopState(F);
  if (!hasUp(s, "honesty")) return `<span class="tape gingham" aria-hidden="true"></span><h2>${esc(UPGRADES.honesty.n)}</h2><p class="sub">${esc(UPGRADES.honesty.line)}</p><div class="actions">${buyBtn(F, UPGRADES.honesty.price, 'data-gbuy="honesty"')}</div>` + shut;
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>The honesty freezer</h2><p class="sub">Little cups at ${s.prices.cup} ${coin()} each, 7 to 10am and 8 to 10pm while the shop's shut. It takes from the same tubs as the counter.</p>`;
  h += `<p class="muted">${s.box ? `<b>${s.box} coins</b> in the box.` : "The box is empty for now."}</p>`;
  if (s.notes.length) h += `<p class="eyebrow" style="margin:10px 0 6px">Notes left with the coins</p><ul class="hlist">${s.notes.map(n => `<li><small>"${esc(n.t)}"</small></li>`).join("")}</ul>`;
  return h + `<div class="actions">${s.box ? `<button class="btn primary" data-gcollect="1">Collect the coins</button>` : ""}<button class="btn alt small" data-close="1">Close</button></div>`;
}
// the dip station: its chocolate pots, the toppings shelf, and the bar where Mel makes one
export function dipPotsPanel(F){
  const s = scoopState(F);
  return `<span class="tape stripe" aria-hidden="true"></span><h2>The chocolate pots</h2><p class="sub">Warm dips for cones and waffles. Customers pay ${s.prices.dip} ${coin()} extra for a dipped one (set it on the menu); more dips, more takers.</p>
    <ul class="hlist wlist">${Object.entries(DIPS).map(([k, d]) => `<li><span class="wpic">${dot(d.col)}</span><span class="wtxt"><b>${esc(d.n)}</b><small>${d.house ? (s.houseDips > 0 ? `${s.houseDips} dips left, from the Cocoa Room` : "send dark chocolate from the Cocoa Room's moulds") : s.dips[k] ? "warming in its pot" : "not yet"}</small></span>${d.house ? "" : s.dips[k] ? `<span class="hbadge">yours</span>` : buyBtn(F, d.price, `data-gdipbuy="${k}"`)}</li>`).join("")}</ul>` + shut;
}
export function toppingsPanel(F){
  const s = scoopState(F);
  return `<span class="tape gingham" aria-hidden="true"></span><h2>The toppings shelf</h2><p class="sub">Scattered on a dipped cone while it's still warm. ${s.prices.top} ${coin()} extra each (set it on the menu); the more jars on the shelf, the more people go for a dipped one.</p>
    <ul class="hlist wlist">${Object.entries(TOPPINGS).map(([k, t]) => `<li><span class="wpic">${dot(t.col)}</span><span class="wtxt"><b>${esc(t.n)}</b><small>${s.tops[k] ? "on the shelf" : "not yet"}</small></span>${s.tops[k] ? `<span class="hbadge">yours</span>` : buyBtn(F, t.price, `data-gtopbuy="${k}"`)}</li>`).join("")}</ul>` + shut;
}
export function dipBarPanel(F, st){
  const s = scoopState(F), tubs = tubList(s);
  let h = `<span class="tape stripe" aria-hidden="true"></span><h2>The dip bar</h2><p class="sub">Pick a flavour, dip it, top it. Yours are free.</p>`;
  if (!tubs.length) return h + `<p class="muted">No tubs in the display. Make some from the recipe book in the kitchen.</p>` + shut;
  const r = st.pick && s.tubs[st.pick] > 0 ? recipeOf(s, st.pick) : null;
  if (!r) return h + `<ul class="hlist wlist">${tubs.map(x => `<li><span class="wpic">${dot(x.col)}</span><span class="wtxt"><b>${esc(x.name)}</b><small>${s.tubs[x.id]} scoops</small></span><button class="btn small primary" data-gdpick="${esc(x.id)}">Choose</button></li>`).join("")}</ul>` + shut;
  const dip = dipReady(s, st.dip) ? st.dip : "milk", top = st.top && s.tops[st.top] ? st.top : null, fmt = st.fmt === "waffle" ? "waffle" : "cone";
  const chip = (attr, k, on, label, col) => `<button class="gchip${on ? " on" : ""}" ${attr}="${k}" aria-pressed="${on}">${dot(col)}<span>${esc(label)}</span></button>`;
  h += `<p class="olabel">${dot(r.col)} ${esc(r.name)}</p>`;
  h += `<p class="eyebrow" style="margin:10px 0 6px">On a</p><div class="gchips">${["cone", "waffle"].map(f => chip("data-gdfmt", f, f === fmt, FORMATS[f].n, "#E8C48E")).join("")}</div>`;
  h += `<p class="eyebrow" style="margin:10px 0 6px">Dipped in</p><div class="gchips">${Object.keys(DIPS).filter(k => dipReady(s, k)).map(k => chip("data-gddip", k, k === dip, DIPS[k].n, DIPS[k].col)).join("")}</div>`;
  h += `<p class="eyebrow" style="margin:10px 0 6px">Topped with</p><div class="gchips">${chip("data-gdtop", "none", !top, "Nothing", "#FFFDF6")}${Object.keys(TOPPINGS).filter(k => s.tops[k]).map(k => chip("data-gdtop", k, k === top, TOPPINGS[k].n, TOPPINGS[k].col)).join("")}</div>`;
  h += `<p class="muted">${esc(dipName(r, fmt, dip, top))}</p>`;
  return h + `<div class="actions"><button class="btn primary" data-gdmake="eat">Have it now</button><button class="btn alt" data-gdmake="give">Make one to give</button></div><div class="actions"><button class="btn alt small" data-gdback="1">Back</button><button class="btn alt small" data-close="1">Close</button></div>`;
}
// the delivery bike: pick a flavour and a type, then who it's for (st.who: [[id, name]] from the game)
export function deliverPanel(F, st){
  const s = scoopState(F), tubs = tubList(s), hm = sgHM();
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>Scoop Shack delivery</h2><p class="sub">Tomo pedals it round in the cool box, and a thank-you note comes back to your mailbox.</p>`;
  if (!hasUp(s, "bike")) return `<span class="tape gingham" aria-hidden="true"></span><h2>${esc(UPGRADES.bike.n)}</h2><p class="sub">${esc(UPGRADES.bike.line)}</p><div class="actions">${buyBtn(F, UPGRADES.bike.price, 'data-gbuy="bike"')}</div>` + shut;
  if (!waiterOn(hm)) return h + `<p class="muted">${hm >= 13*60 && hm < 13*60 + 45 ? "Tomo's on his lunch break till 1:45." : "Tomo's not on. Deliveries go out 10am to 6pm."}</p>` + shut;
  if (!tubs.length) return h + `<p class="muted">Nothing in the display to send.</p>` + shut;
  const r = st.pick && s.tubs[st.pick] > 0 ? recipeOf(s, st.pick) : null;
  if (!r) return h + `<ul class="hlist wlist">${tubs.map(x => `<li><span class="wpic">${dot(x.col)}</span><span class="wtxt"><b>${esc(x.name)}</b><small>${s.tubs[x.id]} scoops${x.dairy ? "" : " · dairy-free"}</small></span><button class="btn small primary" data-gvpick="${esc(x.id)}">Choose</button></li>`).join("")}</ul>` + shut;
  const fmt = FORMATS[st.fmt] ? st.fmt : "cone";
  h += `<p class="olabel">${dot(r.col)} ${esc(r.name)}</p><div class="gchips">${Object.keys(FORMATS).map(f => `<button class="gchip${f === fmt ? " on" : ""}" data-gvfmt="${f}" aria-pressed="${f === fmt}"><span>${FORMATS[f].n}</span></button>`).join("")}</div>`;
  h += `<p class="eyebrow" style="margin:10px 0 6px">Send it to</p><div class="actions">${(st.who || []).filter(([w]) => !r.dairy || w !== "marcus").map(([w, n]) => `<button class="btn small alt" data-gvto="${w}">${esc(n)}</button>`).join("")}</div>`;
  return h + `<div class="actions"><button class="btn alt small" data-gvback="1">Back</button><button class="btn alt small" data-close="1">Close</button></div>`;
}
export function counterPanel(F, st){
  const s = scoopState(F), hm = sgHM(), t = s.sold[dayKey()] || {n: 0, coins: 0}, tubs = onDisplay(s);
  let h = st.cart ? `<span class="tape gingham" aria-hidden="true"></span><h2>${esc(s.name)} cart</h2><p class="sub">At the night market till 10pm, scooping from tubs already made (no batches at the market, just serving).${st.keeper ? " Tomo's minding it." : " Tomo's off wandering: it's on an honesty tin."} ${t.cart ? `Sold tonight: ${t.cart} (${t.cartCoins} ${coin()}).` : "Nothing sold yet tonight."} Stay and scoop, and more people stop.</p>`
    : `<span class="tape gingham" aria-hidden="true"></span><h2>${esc(s.name)}</h2><p class="sub">${openNow(hm) ? "Open till 8pm." : "Closed: open 10am to 8pm."} ${t.n ? `Sold today: ${t.n} (${t.coins} ${coin()}).` : "Nothing sold yet today."}${st.server ? " Sofia's behind the counter." : ""}</p>`;
  if (st.cart && !tubs.length) return h + `<p class="muted">Nothing to scoop: the shop's display is empty tonight.</p>` + shut;
  if (!tubs.length && scoopsLeft(s)) return h + `<p class="muted">Nothing in the display, but there are tubs in the freezer.</p><div class="actions"><button class="btn small primary" data-gview="freezer">Put some out</button></div>` + upBtn + shut;
  if (!tubs.length) return h + `<p class="muted">The display's empty. Discover a flavour at the mixing bench in the kitchen (through the door on the west wall), then make more tubs from the recipe book there.</p>` + upBtn + shut;
  const pick = st.pick && s.tubs[st.pick] > 0 ? recipeOf(s, st.pick) : null;
  if (pick) return h + `<div class="gpick"><p class="olabel">${dot(pick.col)} ${esc(pick.name)}${pick.dairy ? "" : ' <span class="hbadge">dairy-free</span>'}</p><p class="muted">${esc(pick.ings.map(i => INGR[i][0]).join(", "))} · ${s.tubs[pick.id]} scoops left</p>
    <p class="eyebrow" style="margin:10px 0 6px">For you (free)</p><div class="actions"><button class="btn primary" data-geat="${esc(pick.id)}">Have one now${st.evan ? ", and one for Evan" : ""}</button></div>
    <p class="eyebrow" style="margin:12px 0 6px">To give someone</p><div class="actions">${Object.keys(FORMATS).map(f => `<button class="btn small alt" data-gtake="${f}">${FORMATS[f].n}</button>`).join("")}</div>
    <div class="actions"><button class="btn alt small" data-gback="1">Back</button><button class="btn alt small" data-close="1">Close</button></div></div>`;
  h += `<ul class="hlist wlist">${tubs.map(r => `<li><span class="wpic">${dot(r.col)}</span><span class="wtxt"><b>${esc(r.name)}</b><small>${s.tubs[r.id]} scoops${r.dairy ? "" : " · dairy-free"}${r.special ? " · special" : ""}</small></span><button class="btn small primary" data-gpick="${esc(r.id)}">Choose</button></li>`).join("")}</ul>`;
  if (st.cart) return h + `<p class="muted">Yours are free. Cups and cones at the shop's prices.</p>` + shut;
  return h + `<p class="muted">Yours are free. Customers pay what's on the chalkboard menu.</p><div class="actions"><button class="btn small alt" data-gview="freezer">Change what's in the display</button></div>` + upBtn + shut;
}
export function menuPanel(F, st){
  const s = scoopState(F), step = k => `<span class="gstep"><button class="btn small alt" data-gprice="${k}:-1" aria-label="Cheaper">−</button><b>${s.prices[k]}</b><button class="btn small alt" data-gprice="${k}:1" aria-label="Dearer">+</button></span>`;
  let h = `<span class="tape stripe" aria-hidden="true"></span><h2>The menu</h2><p class="sub">Prices by type. A flavour marked special costs a little extra.</p>
    <ul class="hlist wlist gprices">${Object.keys(FORMATS).map(f => `<li><span class="wtxt"><b>${FORMATS[f].n}</b><small>${f === "float" ? "a scoop in a fizzy float" : f === "waffle" ? "a scoop on a warm waffle" : "one scoop"}</small></span>${step(f)}</li>`).join("")}
    <li><span class="wtxt"><b>Special surcharge</b><small>added to anything in a special flavour</small></span>${step("special")}</li>${hasUp(s, "dip") ? `
    <li><span class="wtxt"><b>Chocolate dip</b><small>extra for a dipped cone or waffle</small></span>${step("dip")}</li><li><span class="wtxt"><b>Topping</b><small>extra for a topping on a dipped one</small></span>${step("top")}</li>` : ""}</ul>`;
  h += s.recipes.length ? `<p class="eyebrow" style="margin:12px 0 6px">Flavours</p><ul class="hlist wlist gflav">${s.recipes.map(r => `<li><span class="wpic">${dot(r.col)}</span><span class="wtxt"><b>${esc(r.name)}</b><small>${s.tubs[r.id] ? s.tubs[r.id] + " scoops" : "sold out"}</small></span><label class="gspec"><input type="checkbox" data-gspecial="${esc(r.id)}" ${r.special ? "checked" : ""}> special</label></li>`).join("")}</ul>` : `<p class="muted">No flavours yet: discover some at the mixing bench in the kitchen.</p>`;
  h += `<form class="row hadd" data-gname="1"><label class="sr" for="gName">Shop name</label><input id="gName" name="n" maxlength="30" value="${esc(s.name)}"><button class="btn small alt">Rename</button></form>`;
  return h + shut;
}
export function fridgePanel(F, orch){
  const s = scoopState(F), inF = Object.keys(s.fridge).filter(id => s.fridge[id] > 0), bag = backpackIngr(F), shelf = farmShelf(orch);
  const cell = (id, n, extra) => `<li><span class="wpic">${ingPic(id)}</span><span class="wtxt"><b>${esc(INGR[id][0])}</b><small>${n}</small></span>${extra || ""}</li>`;
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>The fridge</h2><p class="sub">What your gelato's made from. Each tub uses one of each of a flavour's ingredients.</p>`;
  h += inF.length ? `<ul class="hlist wlist">${inF.map(id => cell(id, `${s.fridge[id]} in the fridge`)).join("")}</ul>` : `<p class="muted">Empty. Add fruit, berries, flowers, milk, honey...</p>`;
  if (bag.length) h += `<p class="eyebrow" style="margin:12px 0 6px">From your backpack</p><ul class="hlist wlist">${bag.map(id => cell(id, `${F.inv[id]} with you`, `<span class="orbtns"><button class="btn small primary" data-gfill="bag:${id}:1">Add 1</button><button class="btn small alt" data-gfill="bag:${id}:99">All</button></span>`)).join("")}</ul>`;
  if (shelf.length) h += `<p class="eyebrow" style="margin:12px 0 6px">From Ma Ma's farm shop</p><ul class="hlist wlist">${shelf.map(id => { const n = orch.stock[id.startsWith("fl_") ? "stem:" + id.slice(3) : id];
    return cell(id, `${n} on her shelf`, `<span class="orbtns"><button class="btn small primary" data-gfill="farm:${id}:1">Add 1</button><button class="btn small alt" data-gfill="farm:${id}:99">All</button></span>`); }).join("")}</ul>`;
  if (!bag.length && !shelf.length) h += `<p class="muted">Nothing to add right now. Milk comes from your goats or Hana's market; fruit and flowers from the orchard.</p>`;
  return h + shut;
}
const scoopPic = col => `<svg class="gscoop" viewBox="0 0 44 44" aria-hidden="true"><path d="M14 22 l8 20 l8 -20z" fill="#E8C48E" stroke="#3A2E28" stroke-width="1.2" stroke-linejoin="round"/><path d="M16 28 l12 6 M28 28 l-12 6" stroke="#3A2E28" stroke-width=".8" opacity=".5"/><circle cx="22" cy="16" r="11" fill="${col}" stroke="#3A2E28" stroke-width="1.2"/><path d="M12 19 q3 4 6 0 q3 4 6 0 q3 4 6 0 q2 3 2 0" fill="${col}" stroke="#3A2E28" stroke-width="1.1"/><circle cx="18" cy="12" r="2.4" fill="#fff" opacity=".6"/></svg>`;
const resultCard = (col, name, line, made) => `<div class="gresult${made ? " made" : ""}">${scoopPic(col)}<span><b>${esc(name)}</b><small>${esc(line)}</small></span></div>`;
export function benchPanel(F, st){
  const s = scoopState(F), inF = Object.keys(s.fridge).filter(id => s.fridge[id] > 0), sel = (st.sel || []).filter(id => inF.includes(id));
  const known = sel.length ? knownRecipe(s, sel) : null;
  let h = `<span class="tape stripe" aria-hidden="true"></span><h2>The mixing bench</h2><p class="sub">Pick up to four things from the fridge and mix. Every combination makes a new flavour; there's no such thing as a bad one. ${s.recipes.length} discovered so far.</p>`;
  if (!inF.length) return h + `<p class="muted">The fridge is empty. Stock it first.</p>` + shut;
  h += `<div class="gchips">${inF.map(id => `<button class="gchip${sel.includes(id) ? " on" : ""}" data-gsel="${id}" aria-pressed="${sel.includes(id)}" ${!sel.includes(id) && sel.length >= 4 ? "disabled" : ""}>${ingPic(id)}<span>${esc(INGR[id][0])}</span></button>`).join("")}</div>`;
  // what it'll be (or, just mixed, what it is): a scoop in its colour, and its name
  const made = st.made && recipeOf(s, st.made);
  if (made && !sel.length) h += resultCard(made.col, made.name, `New flavour! ${made.dairy ? "A gelato" : "A dairy-free sorbet"}. It's in the churner: blending, then freezing, ready in an hour.`, true);
  else if (sel.length) { const ss = [...sel].sort(); h += known ? resultCard(known.col, known.name, canMake(s, known) ? "You know this one already. Make another tub?" : "You know this one already.")
    : resultCard(blend(ss), nameFor(ss), `${isDairy(ss) ? "A gelato" : "A dairy-free sorbet"}. Something new!`); }
  else h += `<p class="muted">Nothing picked yet.</p>`;
  return h + churnLine(s) + `<div class="actions">${known ? `<button class="btn primary" data-gmake="${esc(known.id)}" ${canMake(s, known) ? "" : "disabled"}>Make another tub</button>` : `<button class="btn primary" data-gmix="1" ${!sel.length || churnFull(s) ? "disabled" : ""}>Mix it</button>`}<button class="btn alt small" data-close="1">Close</button></div>`;
}
// what's in the churner, and when it'll be ready
export function churnLine(s){
  finishChurn(s);
  if (!s.churn.length) return `<p class="muted">The churner's free: a tub takes an hour to blend and freeze, two at a time.</p>`;
  return `<p class="eyebrow" style="margin:10px 0 6px">In the churner (${s.churn.length} of ${CHURNS})</p><ul class="hlist">${s.churn.map(b => { const r = recipeOf(s, b.id); return r ? `<li>${dot(r.col)} <b>${esc(r.name)}</b> <small class="muted">${b.isNew ? "new! " : ""}ready in ${churnLeft(b)}</small></li>` : ""; }).join("")}</ul>`;
}
// the recipe book on the kitchen wall: every flavour Mel knows, how much is left, and another tub at a tap
export function recipePanel(F){
  const s = scoopState(F), day = dayKey();
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>The recipe book</h2><p class="sub">Every flavour you've discovered. A tub is 20 scoops, uses one of each ingredient from the fridge, and takes an hour in the churner. ${s.made[day] ? `${s.made[day]} made today.` : ""}</p>`;
  if (!s.recipes.length) return h + `<p class="muted">No flavours yet. Discover one at the mixing bench.</p>` + shut;
  h += `<ul class="hlist wlist">${[...s.recipes].sort((a, b) => (s.tubs[a.id] || 0) - (s.tubs[b.id] || 0)).map(r => `<li><span class="wpic">${dot(r.col)}</span><span class="wtxt"><b>${esc(r.name)}</b><small>${s.tubs[r.id] ? `${s.tubs[r.id]} scoops left` : "none left"} · ${canMake(s, r) ? esc(r.ings.map(i => INGR[i][0]).join(", ")) : "missing: " + esc(r.ings.filter(i => !(s.fridge[i] > 0)).map(i => INGR[i][0]).join(", "))}</small></span><button class="btn small ${canMake(s, r) ? "primary" : "alt"}" data-gmake="${esc(r.id)}" ${canMake(s, r) ? "" : "disabled"}>Make a tub</button></li>`).join("")}</ul>`;
  h += churnLine(s);
  if (s.log.length) h += `<p class="eyebrow" style="margin:12px 0 6px">Lately</p><ul class="hlist">${s.log.map(l => `<li><small>${esc(l)}</small></li>`).join("")}</ul>`;
  return h + shut;
}
export function freezerPanel(F, st = {}){
  const s = scoopState(F), ids = displayIds(s), shown = ids.map(id => recipeOf(s, id)), rest = s.recipes.filter(r => !ids.includes(r.id) && s.tubs[r.id] > 0);
  const ings = r => esc(r.ings.map(i => INGR[i][0]).join(", ")), swap = st.swap && recipeOf(s, st.swap);
  let h = `<span class="tape stripe" aria-hidden="true"></span><h2>The freezer</h2><p class="sub">Tubs keep frozen until they're sold. ${scoopsLeft(s)} scoops in all. The display out front holds ${SLOTS}; customers only buy what's in it.${Array.isArray(s.display) ? "" : " For now it fills itself with whatever's in stock."}</p>`;
  if (swap) return h + `<p class="olabel">${dot(swap.col)} Put ${esc(swap.name)} out in place of…</p><ul class="hlist wlist">${shown.map(r => `<li><span class="wpic">${dot(r.col)}</span><span class="wtxt"><b>${esc(r.name)}</b><small>${s.tubs[r.id] ? s.tubs[r.id] + " scoops" : "sold out"}</small></span><button class="btn small primary" data-gswapout="${esc(r.id)}">Swap</button></li>`).join("")}</ul>
    <div class="actions"><button class="btn alt small" data-gswapcancel="1">Back</button><button class="btn alt small" data-close="1">Close</button></div>`;
  h += `<p class="eyebrow" style="margin:12px 0 6px">In the display (${shown.length} of ${SLOTS})</p>`;
  h += shown.length ? `<ul class="hlist wlist">${shown.map(r => `<li><span class="wpic">${dot(r.col)}</span><span class="wtxt"><b>${esc(r.name)}</b><small>${s.tubs[r.id] ? `${s.tubs[r.id]} scoops` : "sold out: the slot's empty till you make more"} · ${ings(r)}</small></span><button class="btn small alt" data-gdisp="${esc(r.id)}">Take off</button></li>`).join("")}</ul>` : `<p class="muted">Empty.</p>`;
  h += `<p class="eyebrow" style="margin:12px 0 6px">Waiting in the freezer</p>`;
  h += rest.length ? `<ul class="hlist wlist">${rest.map(r => `<li><span class="wpic">${dot(r.col)}</span><span class="wtxt"><b>${esc(r.name)}</b><small>${s.tubs[r.id]} scoops · ${ings(r)}</small></span><button class="btn small primary" data-gdisp="${esc(r.id)}">${ids.length < SLOTS ? "Put out" : "Swap in"}</button></li>`).join("")}</ul>` : `<p class="muted">Nothing else in stock.</p>`;
  return h + shut;
}
export const RENO_LINE = "Boarded up for now, with scaffolding out front. The sign says: \"Coming soon: a craft brewery? A chocolatier?\" Someone's pencilled \"both!!\" underneath.";
