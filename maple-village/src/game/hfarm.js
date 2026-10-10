// Wildflower Farm (Felix and Elena run it; Mel helps and takes a share). State in F.hfarm:
//   fed / brushed / milked   {animalId: day}  (feeding is per herd, brushing and milking per animal)
//   hives                    [time each hive was last emptied]
// The cows and goats are milked in the morning, 6 to 10, if they've been fed today or yesterday: a cow gives 2 milk,
// a goat 1 goat's milk, into Mel's backpack (the rest goes to Elena's dairy and stall). The five hives fill over three
// days; when Mel collects a full one she gets 2 frames of comb (Felix keeps the rest for his stall). The farm stand by
// the gate sells milk, goat's milk, honey and eggs.
// Inside the barn (step 2): the hives give frames, spun into jars at the honey extractor (this week's honey: wildflower,
// lavender or orchard blossom, turn and turn about); milk becomes yoghurt in the crocks straight away; and the cheese
// press makes a named wheel (suggested names, like the wines) that ages on a shelf in the cave (6 shelves): fresh goat's
// cheese in a day, farmhouse cheddar in four, Honeybrook blue in six. A ripe wheel is cut into wedges for the backpack.
import { esc, dayKey, sgHM, hash } from "../util.js";
import { icon } from "../art/icons.js";
import { ITEMS } from "../data/items.js";
import { stormyOn } from "../art/village-extras.js";
// Round 99, making it a real job:
//   trust       every bit of help earns Felix and Elena's trust (h.trust); four levels (LEVELS), each giving something:
//               a hive of Mel's own, new cheeses and honeys, a shelf at the farm stand and a bigger cave
//   moods       an animal fed, brushed and with a mucked-out stall is happy and gives more milk; a goat gets out if
//               the gate wasn't latched the evening before (round it up)
//   cheese      wheels want turning every day or so; how faithfully decides the cut: excellent, good or rustic
//   bees        a full hive left too long swarms (the honey's lost); a downpour keeps the bees at home (slower filling; a light shower doesn't)
//   requests    a small ask from Felix or Elena each day, for a big helping of trust

export const COWS = [{id: "daisy", n: "Daisy", col: "#FFFDF6", spots: "#3A2E28", line: "Daisy leans into the brush and closes her eyes."},
  {id: "buttercup", n: "Buttercup", col: "#E8C48E", line: "Buttercup moos, very politely."},
  {id: "mochi", n: "Mochi", col: "#F6F1E8", spots: "#8A5A3A", line: "Mochi licks your sleeve. Thank you, Mochi."}];
export const GOATS = [{id: "pepper", n: "Pepper", col: "#6B6460", line: "Pepper tries to eat the brush."},
  {id: "biscuit", n: "Biscuit", col: "#D9B48A", line: "Biscuit headbutts you, gently. It's love."},
  {id: "nutmeg", n: "Nutmeg", col: "#A8754F", line: "Nutmeg hops onto the spool and poses."},
  {id: "toffee", n: "Toffee", col: "#F3E7C9", line: "Toffee nibbles your shoelace."}];
export const HERDS = {cows: {n: "cow paddock", list: COWS, gives: "milk", per: 2}, goats: {n: "goat paddock", list: GOATS, gives: "goatmilk", per: 1}};
export const MILK_FROM = 6*60, MILK_TO = 10*60, HIVES = 5, HIVE_DAYS = 3, JARS = 2;
export const HIVE_SPOTS = [[204, 214], [240, 200], [276, 214], [222, 242], [262, 242]], MY_HIVE_SPOT = [300, 182], MY_FRAMES = 4, SWARM_DAYS = 2;
export const LEVELS = [{n: "Helper", at: 0, gives: ""}, {n: "Trusted hand", at: 40, gives: "your own bee veil, and a hive of your own to name (all its honey is yours)"},
  {n: "Apprentice", at: 100, gives: "Elena teaches you brie, halloumi and a smoked cheese; Felix teaches creamed honey and cut honeycomb"},
  {n: "Partner", at: 200, gives: "a shelf of your own at the farm stand, and three more shelves in the cave"}];
export const levelOf = h => LEVELS.reduce((l, x, i) => h.trust >= x.at ? i : l, 0);
// trust for a bit of help -> the new level's index if this tipped Mel into it (the unlocks come with it)
export function gainTrust(F, n){ const h = hfState(F), before = levelOf(h); h.trust += n; const after = levelOf(h); if (after > before) { if (after >= 1 && !h.myHive) h.myHive = {t: clock(), name: "Maple's Meadow"}; return after; } return null; }
export const STAND = {milk: 3, goatmilk: 4, honey: 6, egg: 3};
const clock = () => Date.now() + (globalThis.__mapleOffset || 0);
const yesterday = day => new Date(Date.parse(day + "T00:00:00Z") - 864e5).toISOString().slice(0, 10);

export function hfState(F){
  F.hfarm = F.hfarm || {};
  const h = F.hfarm, t = clock();
  h.fed = h.fed || {}; h.brushed = h.brushed || {}; h.milked = h.milked || {}; h.frames = h.frames || 0; h.cave = h.cave || []; h.names = h.names || [];
  if (!Array.isArray(h.hives) || h.hives.length !== HIVES) h.hives = Array.from({length: HIVES}, (_, i) => t - (i*0.7 + .4)*864e5);   // staggered, so one's nearly full on day one
  h.trust = h.trust || 0; h.mucked = h.mucked || {}; h.since = h.since || dayKey(); h.shelf = h.shelf || {}; h.sold = h.sold || {}; h.swarms = h.swarms || 0;
  return h;
}
// how long a hive has been filling, in "bee days": downpour days count half (the bees stay home)
const DAY = 864e5;
function beeTime(t0){ const now = clock(), span = now - t0; if (span <= 0) return 0; let rain = 0;
  for (let d = Math.floor(t0/DAY); d <= Math.floor(now/DAY); d++) { const k = new Date(d*DAY).toISOString().slice(0, 10); if (stormyOn(k)) rain += Math.max(0, Math.min(now, (d + 1)*DAY) - Math.max(t0, d*DAY)); }
  return span - rain/2; }
const hiveT = (h, i) => i === "mine" ? (h.myHive ? h.myHive.t : clock()) : h.hives[i];
export const hiveFill = (h, i) => Math.min(1, beeTime(hiveT(h, i))/(HIVE_DAYS*DAY));
export const restless = (h, i) => beeTime(hiveT(h, i)) >= (HIVE_DAYS + SWARM_DAYS*.5)*DAY;   // full a while: the bees are getting ideas
export const fullHives = h => h.hives.map((_, i) => i).filter(i => hiveFill(h, i) >= 1);
// a hive left full too long swarms: the bees move out with the honey, and it starts again -> the hives that went
export function swarmCheck(F){ const h = hfState(F), t = clock(), gone = [];
  h.hives.forEach((t0, i) => { if (beeTime(t0) >= (HIVE_DAYS + SWARM_DAYS)*DAY) { h.hives[i] = t; gone.push(i + 1); } });
  if (h.myHive && beeTime(h.myHive.t) >= (HIVE_DAYS + SWARM_DAYS)*DAY) { h.myHive.t = t; gone.push(h.myHive.name); }
  h.swarms += gone.length; return gone; }
export const milkingNow = (hm = sgHM()) => hm >= MILK_FROM && hm < MILK_TO;
export const wellFed = (h, id, day = dayKey()) => h.fed[id] === day || h.fed[id] === yesterday(day);
const recent = (d, day) => d === day || d === yesterday(day);
export const herdOf = id => COWS.some(a => a.id === id) ? "cows" : "goats";
// 0 grumpy, 1 content, 2 happy: hay (today or yesterday), and a brush plus a mucked-out stall
export const moodOf = (h, id, day = dayKey()) => (wellFed(h, id, day) ? 1 : 0) + (recent(h.brushed[id], day) && recent(h.mucked[herdOf(id)], day) ? 1 : 0);
export const MOODS = ["grumpy", "content", "happy"];
const yieldOf = (herd, mood) => herd === "cows" ? [1, 2, 3][mood] : [1, 1, 2][mood];
export function muckOut(F, herd){ const h = hfState(F), day = dayKey(); if (!HERDS[herd] || h.mucked[herd] === day) return false; h.mucked[herd] = day; return true; }
// the goat gate: latch it in the evening, or someone's out tomorrow
export const latchGate = F => { const h = hfState(F), day = dayKey(); if (h.latched === day) return false; h.latched = day; return true; };
export function strayGoat(F, day = dayKey()){ const h = hfState(F); if (h.caught === day || h.latched === yesterday(day) || h.since >= yesterday(day) || hash(day + "gate") % 10 >= 6) return null;
  return {goat: GOATS[hash(day + "goat") % GOATS.length], at: [[60, 520], [470, 300], [200, 600], [380, 560]][hash(day + "where") % 4]}; }
export function catchGoat(F){ const h = hfState(F), g = strayGoat(F); if (!g) return null; h.caught = dayKey(); return g.goat; }

// the whole herd gets hay and water -> how many were hungry
export function feedHerd(F, herd){ const h = hfState(F), day = dayKey(), list = HERDS[herd].list.filter(a => h.fed[a.id] !== day); list.forEach(a => { h.fed[a.id] = day; }); return list.length; }
export function brush(F, id){ const h = hfState(F), day = dayKey(); if (h.brushed[id] === day) return null; h.brushed[id] = day; return [...COWS, ...GOATS].find(a => a.id === id); }
// milk one animal -> {n, gives} or a reason it can't be milked
export function milkOne(F, herd, id){
  const h = hfState(F), day = dayKey(), H = HERDS[herd], a = H.list.find(x => x.id === id); if (!a) return {err: "?"};
  if (!milkingNow()) return {err: "Milking's in the morning, 6 to 10."};
  if (h.milked[id] === day) return {err: `${a.n}'s been milked today.`};
  const mood = moodOf(h, id, day), n = yieldOf(herd, mood);
  h.milked[id] = day; F.inv = F.inv || {}; F.inv[H.gives] = (F.inv[H.gives] || 0) + n; return {n, gives: H.gives, a, mood};
}
export function milkHerd(F, herd){ let n = 0; HERDS[herd].list.forEach(a => { const r = milkOne(F, herd, a.id); if (r.n) n += r.n; }); return n; }
// full hives give frames of comb, to spin into jars at the barn's honey extractor
export function collectHives(F){ const h = hfState(F), full = fullHives(h), t = clock(); let n = full.length*JARS; full.forEach(i => { h.hives[i] = t; });
  if (h.myHive && hiveFill(h, "mine") >= 1) { h.myHive.t = t; n += MY_FRAMES; } h.frames += n; return n; }
export const myHiveFull = h => !!h.myHive && hiveFill(h, "mine") >= 1;
export function nameHive(F, name){ const h = hfState(F), n = String(name || "").replace(/[<>&"]/g, "").trim().slice(0, 24); if (!h.myHive || !n) return null; h.myHive.name = n; return n; }
// Felix's specialities, once Mel's his apprentice: a jar of honey whipped into creamed honey; a frame cut as comb
export function creamHoney(F){ const inv = F.inv || {}, k = ["honey", "honey_lav", "honey_blossom"].find(x => inv[x] > 0); if (!k || levelOf(hfState(F)) < 2) return null; inv[k]--; if (!inv[k]) delete inv[k]; inv.honey_cream = (inv.honey_cream || 0) + 1; F.inv = inv; return k; }
export function cutComb(F){ const h = hfState(F); if (!h.frames || levelOf(h) < 2) return false; h.frames--; F.inv = F.inv || {}; F.inv.honeycomb = (F.inv.honeycomb || 0) + 1; return true; }
export const HONEYS = [{id: "honey", n: "wildflower"}, {id: "honey_lav", n: "lavender"}, {id: "honey_blossom", n: "orchard blossom"}];
export const honeyNow = (day = dayKey()) => HONEYS[Math.floor(Date.parse(day + "T00:00:00Z")/(7*864e5)) % HONEYS.length];   // what the bees are on this week
export function spinFrames(F){ const h = hfState(F), n = h.frames, kind = honeyNow(); if (!n) return null; h.frames = 0; F.inv = F.inv || {}; F.inv[kind.id] = (F.inv[kind.id] || 0) + n; return {n, kind}; }
// the yoghurt crocks: a bottle of milk (or goat's milk) becomes a pot of yoghurt
export function makeYoghurt(F, all){ const inv = F.inv || {}; let n = 0; for (const m of ["milk", "goatmilk"]) while ((inv[m] || 0) > 0 && (all || !n)) { inv[m]--; if (!inv[m]) delete inv[m]; n++; } if (n) inv.yoghurt = (inv.yoghurt || 0) + n; F.inv = inv; return n; }

/* ---------- cheese: the press and the cave ---------- */
export const CHEESES = {
  fresh: {n: "Fresh goat's cheese", milk: "goatmilk", need: 2, days: 1, wedges: 4, id: "chz_fresh", col: "#FFF8EC", words: ["Chèvre", "Little Log", "Fresh", "Curd"]},
  cheddar: {n: "Farmhouse cheddar", milk: "milk", need: 3, days: 4, wedges: 6, id: "chz_cheddar", col: "#F3C969", words: ["Cheddar", "Clothbound", "Farmhouse", "Tasty"]},
  blue: {n: "Honeybrook blue", milk: "milk", need: 3, days: 6, wedges: 6, id: "chz_blue", col: "#DCE3E8", words: ["Blue", "Bleu", "Veined Blue"]},
  // Elena's to teach, once Mel's her apprentice (level 2)
  brie: {n: "Barn brie", milk: "milk", need: 3, days: 3, wedges: 5, id: "chz_brie", col: "#FFF6E0", words: ["Brie", "Soft White", "Bloomy"], lvl: 2},
  halloumi: {n: "Goat's halloumi", milk: "goatmilk", need: 3, days: 2, wedges: 5, id: "chz_halloumi", col: "#F6F1E8", words: ["Halloumi", "Squeaky", "Grilling"], lvl: 2},
  smoked: {n: "Smoked farmhouse", milk: "milk", need: 3, days: 5, wedges: 6, id: "chz_smoked", col: "#D9944A", words: ["Smoked", "Applewood", "Oak Smoked"], lvl: 2}
};
export const CAVE = 6;
export const caveSize = h => levelOf(h) >= 3 ? 9 : CAVE;
export const cheesesFor = h => Object.entries(CHEESES).filter(([, c]) => !c.lvl || levelOf(h) >= c.lvl);
// the cut, by how faithfully the wheel was turned while it aged
export const quality = w => { const r = (w.turns || 0)/Math.max(1, CHEESES[w.kind].days); return r >= .75 ? "excellent" : r >= .35 ? "good" : "rustic"; };
export function turnWheels(F){ const h = hfState(F), day = dayKey(); let n = 0; h.cave.forEach(w => { if (caveLeft(w) && w.lastTurn !== day) { w.turns = (w.turns || 0) + 1; w.lastTurn = day; n++; } }); return n; }
// excellent wedges are their own gift items: a little dearer, a warmer thank-you
const exName = n => n.startsWith("Wedge of ") ? n.replace("Wedge of ", "Wedge of excellent ") : "Excellent " + n[0].toLowerCase() + n.slice(1);
Object.values(CHEESES).forEach(c => { const base = ITEMS[c.id]; if (base && !ITEMS[c.id + "_ex"]) ITEMS[c.id + "_ex"] = {...base, n: exName(base.n), price: (base.price || 8) + 5, say: `${base.say} And this one's extraordinary. You made this?!`}; });
// Round 130 (Mel: things that take effort should fetch more at the market): Mel's own cheeses and honey can be sold
// at the market's Sell tab, for more than plain produce, and an excellent wheel for more again. Never more than they
// cost to buy anywhere (the farm stand's honey is 6, the market's honeycomb 10), so buying to resell never pays.
// Tiered by time (Mel): the longer a cheese ripens in the cave, the more it fetches: 9 + 2 a day (fresh 11 ... blue 21).
export const CRAFTED_SELL = {...Object.fromEntries(Object.values(CHEESES).map(c => [c.id, 9 + 2*c.days])),
  honey: 6, honey_lav: 10, honey_blossom: 10, honey_cream: 12, honeycomb: 10, yoghurt: 4};
Object.entries(CRAFTED_SELL).forEach(([id, n]) => { if (!ITEMS[id]) return; ITEMS[id].sell = n; ITEMS[id].crafted = true; if (ITEMS[id + "_ex"]) Object.assign(ITEMS[id + "_ex"], {sell: n + 6, crafted: true}); });
const C_PLACE = ["Lavender Hill", "Barn Door", "Honeybrook", "Hay Loft", "Morning Mist", "Stone Wall", "Sunday", "Windmill", "Brookside", "Old Gate", "Clover Field", "Harvest", "Lantern", "Bee Hive", "Rainy Day", "Golden Hour"];
const C_FR = {fresh: ["Petit Chèvre de Honeybrook", "Chèvre du Ruisseau", "Frais de la Ferme"], cheddar: ["Tomme de Honeybrook", "Vieux Grange", "Tomme du Moulin"], blue: ["Bleu de la Baie", "Bleu du Ruisseau", "Bleu de Honeybrook"]};
// suggested names for a new wheel: places on the farm, the animal it came from, and a few in French; never one in use
export function cheeseNames(F, kind, seed = 0){
  const h = hfState(F), c = CHEESES[kind]; if (!c) return [];
  const used = new Set([...h.names, ...h.cave.map(w => w.name)].map(x => x.toLowerCase())), from = kind === "fresh" ? GOATS : COWS, out = [];
  const sd = Math.floor(seed) + h.names.length*31 + Object.keys(CHEESES).indexOf(kind)*7;
  for (let k = 0; out.length < 12 && k < 200; k++) {
    const w = c.words[(sd + k) % c.words.length], a = from[(sd + k*3) % from.length].n, kind3 = k % 3;
    const nm = kind3 === 0 ? `${C_PLACE[(sd + k*5) % C_PLACE.length]} ${w}` : kind3 === 1 ? `${a}'s ${C_PLACE[(sd + k*7 + 2) % C_PLACE.length]} ${w}` : C_FR[kind][(sd + k) % C_FR[kind].length];
    if (!used.has(nm.toLowerCase()) && !out.includes(nm)) out.push(nm);
  }
  return out;
}
export const caveLeft = w => Math.max(0, w.done - clock());
export function pressCheese(F, kind, name){
  const h = hfState(F), c = CHEESES[kind], inv = F.inv || {}; if (!c || (c.lvl && levelOf(h) < c.lvl) || h.cave.length >= caveSize(h) || (inv[c.milk] || 0) < c.need) return null;
  inv[c.milk] -= c.need; if (!inv[c.milk]) delete inv[c.milk];
  const nm = String(name || "").replace(/[<>&"]/g, "").trim().slice(0, 30) || cheeseNames(F, kind, clock()/864e5)[0] || c.n, t = clock();
  const w = {kind, name: nm, start: t, done: t + c.days*864e5}; h.cave.push(w); h.names = [...h.names, nm].slice(-60); return w;
}
// a ripe wheel, cut into wedges for the backpack
export function takeWheel(F, i){ const h = hfState(F), w = h.cave[i]; if (!w || caveLeft(w)) return null; const c = CHEESES[w.kind], q = quality(w), id = q === "excellent" ? c.id + "_ex" : c.id, n = q === "rustic" ? c.wedges - 1 : c.wedges;
  h.cave.splice(i, 1); F.inv = F.inv || {}; F.inv[id] = (F.inv[id] || 0) + n; return {w, c, q, n, id}; }

/* ---------- Felix and Elena's asks: one a day, for a big helping of trust ---------- */
export const REQUESTS = [
  {id: "eggs", who: "elena", ask: "Could you bring me 3 eggs? I'm teaching a cheese class tomorrow.", need: {egg: 3}},
  {id: "apples", who: "felix", ask: "Two apples from Ma Ma's? The bees deserve a treat. Well. I do.", need: {apple: 2}},
  {id: "carrots", who: "elena", ask: "Bring 2 carrots for the goats? Biscuit's been very good. Ish.", need: {carrot: 2}},
  {id: "muck", who: "elena", ask: "Could you muck out both stalls today? My back's complaining.", act: "muck"},
  {id: "brush", who: "felix", ask: "The cows are in the Gazette this week. Could you brush all three for their photo?", act: "brush"},
  {id: "turn", who: "elena", ask: "Turn the wheels in the cave for me today? I'm run off my feet.", act: "turn"},
  {id: "hive", who: "felix", ask: "Help me move hive four, out of the wind? Grab the other side, would you?", act: "hive"},
  {id: "milkall", who: "elena", ask: "Milk everyone this morning? Cows and goats. I'll make you a cheese toastie.", act: "milkall"}
];
export const requestToday = (day = dayKey()) => REQUESTS[hash(day + "req") % REQUESTS.length];
export function requestReady(F, day = dayKey()){
  const h = hfState(F), r = requestToday(day), inv = F.inv || {}; if (h.reqDone === day) return false;
  if (r.need) return Object.entries(r.need).every(([k, n]) => (inv[k] || 0) >= n);
  if (r.act === "muck") return h.mucked.cows === day && h.mucked.goats === day;
  if (r.act === "brush") return COWS.every(a => h.brushed[a.id] === day);
  if (r.act === "turn") return h.turnedDay === day;
  if (r.act === "milkall") return [...COWS, ...GOATS].every(a => h.milked[a.id] === day);
  return r.act === "hive";
}
// what's left of today's ask (so a greyed-out button says why): "" when it's ready or done
export function requestLeft(F, day = dayKey()){
  const h = hfState(F), r = requestToday(day), inv = F.inv || {}; if (h.reqDone === day || requestReady(F, day)) return "";
  const names = l => l.map(a => a.n).join(", ").replace(/, ([^,]*)$/, " and $1");
  if (r.need) return `Still to find: ${Object.entries(r.need).filter(([k, n]) => (inv[k] || 0) < n).map(([k, n]) => `${n - (inv[k] || 0)} more ${giveName(k)}`).join(", ")}.`;
  if (r.act === "brush") { const l = COWS.filter(a => h.brushed[a.id] !== day); return `Still to brush: ${names(l)} (the Brush buttons in the cow paddock).`; }
  if (r.act === "milkall") { const l = [...COWS, ...GOATS].filter(a => h.milked[a.id] !== day); return `Still to milk: ${names(l)} (milking's 6 to 10 in the morning).`; }
  if (r.act === "muck") return `Still to muck out: ${["cows", "goats"].filter(k => h.mucked[k] !== day).map(k => `the ${k}' stalls`).join(" and ")}.`;
  if (r.act === "turn") return "Still to do: turn the wheels in the cheese cave.";
  return "";
}
// the backpack brush at the farm (round 130): brushes the next animal in the nearer paddock, the same as its Brush button
export function brushNearest(F, herd){ const h = hfState(F), day = dayKey(), a = HERDS[herd].list.find(x => h.brushed[x.id] !== day); return a ? brush(F, a.id) : null; }
export function finishRequest(F){ const h = hfState(F), day = dayKey(), r = requestToday(day); if (!requestReady(F, day)) return null;
  if (r.need) { const inv = F.inv; Object.entries(r.need).forEach(([k, n]) => { inv[k] -= n; if (!inv[k]) delete inv[k]; }); }
  h.reqDone = day; return r; }

/* ---------- the farm stand: Mel's own shelf, once she's a partner ---------- */
const SELLABLE = id => /^chz_|^honey|^honeycomb$/.test(id) && ITEMS[id];
export const sellables = F => Object.keys(F.inv || {}).filter(id => F.inv[id] > 0 && SELLABLE(id));
export const shelfPrice = id => (ITEMS[id] && ITEMS[id].price) || 8;
export function stockShelf(F, id, n){ const h = hfState(F), inv = F.inv || {}; if (levelOf(h) < 3 || !SELLABLE(id)) return 0; n = Math.min(n, inv[id] || 0); if (n <= 0) return 0; inv[id] -= n; if (!inv[id]) delete inv[id]; h.shelf[id] = (h.shelf[id] || 0) + n; return n; }
// catch up minute by minute (at most two days): passers-by buy off Mel's shelf, 8am to 6pm, and any hive left too long swarms
export function hfTick(F){
  const h = hfState(F), t = clock(), from = Math.max(h.at || t, t - DAY), out = {coins: 0, n: 0, swarms: swarmCheck(F)};
  for (let at = from + 60000; at <= t; at += 60000) {
    const sg = new Date(at + 8*3600e3), day = sg.toISOString().slice(0, 10), hm = sg.getUTCHours()*60 + sg.getUTCMinutes();
    if (hm < 8*60 || hm >= 18*60) continue; const ids = Object.keys(h.shelf).filter(k => h.shelf[k] > 0); if (!ids.length || Math.random() >= .02) continue;
    const id = ids[Math.floor(Math.random()*ids.length)], p = shelfPrice(id); h.shelf[id]--; if (!h.shelf[id]) delete h.shelf[id];
    const s = h.sold[day] = h.sold[day] || {n: 0, coins: 0}; s.n++; s.coins += p; out.coins += p; out.n++;
  }
  h.at = t; if (out.coins) F.coins += out.coins; return out;
}
export function buyStand(F, id){ const p = STAND[id]; if (!p || F.coins < p) return false; F.coins -= p; F.inv = F.inv || {}; F.inv[id] = (F.inv[id] || 0) + 1; return true; }

/* ---------- panels ---------- */
const shut = `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
const coin = () => icon("coin", 13);
const NAMES = {milk: "milk", goatmilk: "goat's milk", honey: "honey", egg: "eggs"};
export function herdPanel(F, herd, keeper){
  const h = hfState(F), day = dayKey(), H = HERDS[herd], cow = herd === "cows", hungry = H.list.filter(a => h.fed[a.id] !== day).length;
  let p = `<span class="tape gingham" aria-hidden="true"></span><h2>The ${H.n}</h2><p class="sub">${cow ? "Daisy, Buttercup and Mochi." : "Pepper, Biscuit, Nutmeg and Toffee, and their climbing spool."} ${milkingNow() ? "It's milking time (6 to 10)." : "Milking's in the morning, 6 to 10."} A happy animal (hay, a brush, and a mucked-out stall) gives the most: ${cow ? "a cow up to 3 milk" : "a goat up to 2 goat's milk"}. ${keeper ? "Elena's here to help." : ""}</p>`;
  p += `<div class="actions"><button class="btn primary small" data-hf="feed" data-k="${herd}" ${hungry ? "" : "disabled"}>${hungry ? "Hay and water" : "Everyone's fed"}</button><button class="btn alt small" data-hf="muck" data-k="${herd}" ${h.mucked[herd] === day ? "disabled" : ""}>${h.mucked[herd] === day ? "Stalls are clean" : "Muck out the stalls"}</button><button class="btn alt small" data-hf="milkall" data-k="${herd}" ${milkingNow() ? "" : "disabled"}>Milk them all</button>${cow ? "" : `<button class="btn alt small" data-hf="latch" ${h.latched === day ? "disabled" : ""}>${h.latched === day ? "Gate's latched" : "Latch the gate"}</button>`}</div>`;
  if (!cow) p += `<p class="muted">${h.latched === day ? "Gate latched for the night. Everyone will be here in the morning." : "Latch the gate before you go, or someone will be out exploring tomorrow."}</p>`;
  p += `<ul class="hlist wlist">${H.list.map(a => { const m = moodOf(h, a.id, day); return `<li><span class="wpic"><span class="gdot" style="background:${a.col}"></span></span><span class="wtxt"><b>${esc(a.n)} <small class="muted">· ${MOODS[m]}</small></b><small>${h.fed[a.id] === day ? "fed" : wellFed(h, a.id, day) ? "fed yesterday" : "hungry"} · ${h.brushed[a.id] === day ? "brushed" : "unbrushed"} · ${h.milked[a.id] === day ? "milked" : "not milked"}</small></span><span class="orbtns"><button class="btn small alt" data-hf="brush" data-k="${a.id}" ${h.brushed[a.id] === day ? "disabled" : ""}>Brush</button><button class="btn small primary" data-hf="milk" data-herd="${herd}" data-k="${a.id}" ${milkingNow() && h.milked[a.id] !== day ? "" : "disabled"}>Milk</button></span></li>`; }).join("")}</ul>`;
  return p + shut;
}
export function hivesPanel(F, keeper){
  const h = hfState(F), full = fullHives(h), mine = myHiveFull(h), rain = stormyOn(dayKey()), n = full.length*JARS + (mine ? MY_FRAMES : 0);
  let p = `<span class="tape stripe" aria-hidden="true"></span><h2>The beehives</h2><p class="sub">Each hive fills over three days${rain ? " (slower today: it's raining, so the bees are staying in)" : ""}. Collect a full one for ${JARS} frames of comb to spin at the barn's extractor (Felix keeps the rest), but don't leave it too long: a full hive gets restless and swarms. This week the bees are on the ${honeyNow().n}. ${keeper ? "Felix lends you his bee veil." : levelOf(h) >= 1 ? "Your own veil's on its hook." : "Put on the bee veil from the hook."}</p>`;
  const row = (label, f, warn, extra = "") => `<li><span class="wpic">${icon("honey", 22)}</span><span class="wtxt"><b>${label}</b><small>${f >= 1 ? (warn ? "full, and the bees are restless: collect it soon!" : "full, heavy with honey") : `${Math.round(f*100)}% full`}</small>${extra}</span><span class="clbar" style="width:70px"><i style="width:${Math.round(f*100)}%"></i></span></li>`;
  p += `<ul class="hlist wlist">${h.hives.map((_, i) => row(`Hive ${i + 1}`, hiveFill(h, i), restless(h, i))).join("")}${h.myHive ? row(`${esc(h.myHive.name)} <small class="muted">(yours: all ${MY_FRAMES} frames)</small>`, hiveFill(h, "mine"), restless(h, "mine")) : ""}</ul>`;
  if (h.myHive) p += `<form class="row hadd" data-hfname="1"><label class="sr" for="hfHive">Name your hive</label><input id="hfHive" maxlength="24" value="${esc(h.myHive.name)}"><button class="btn small alt">Rename</button></form>`;
  if (h.swarms) p += `<p class="muted">${h.swarms} swarm${h.swarms === 1 ? "" : "s"} so far. Felix says every beekeeper has a few.</p>`;
  return p + `<div class="actions"><button class="btn primary small" data-hf="honey" ${n ? "" : "disabled"}>${n ? `Collect ${n} frames` : "Nothing ready yet"}</button><button class="btn alt small" data-close="1">Close</button></div>`;
}
export function standPanel(F){
  const h = hfState(F), partner = levelOf(h) >= 3;
  let p = `<span class="tape gingham" aria-hidden="true"></span><h2>The farm stand</h2><p class="sub">Fresh from the farm, an honesty tin for the coins. You have ${F.coins} ${coin()}.</p>`;
  p += `<ul class="hlist wlist">${Object.entries(STAND).map(([id, pr]) => `<li><span class="wpic">${icon(id, 24)}</span><span class="wtxt"><b>${id === "egg" ? "Fresh eggs" : id === "honey" ? "Wildflower honey" : id === "goatmilk" ? "Goat's milk" : "Milk"}</b><small>${pr} ${coin()} · ${(F.inv || {})[id] || 0} in your backpack</small></span><button class="btn small primary" data-hf="buy" data-k="${id}" ${F.coins >= pr ? "" : "disabled"}>Buy</button></li>`).join("")}</ul>`;
  if (!partner) return p + `<p class="muted">One day, when you're Felix and Elena's partner, there'll be a shelf here for your own cheese and honey.</p>` + shut;
  const on = Object.keys(h.shelf).filter(k => h.shelf[k] > 0), mine = sellables(F), t = h.sold[dayKey()];
  p += `<p class="eyebrow" style="margin:12px 0 6px">Your shelf</p><p class="muted">Passers-by buy from it, 8 to 6, at full price. ${t ? `Sold today: ${t.n} (${t.coins} ${coin()}).` : ""}</p>`;
  p += on.length ? `<ul class="hlist wlist">${on.map(id => `<li><span class="wpic">${icon(id, 22)}</span><span class="wtxt"><b>${esc(ITEMS[id].n)}</b><small>${h.shelf[id]} on the shelf · ${shelfPrice(id)} ${coin()}</small></span></li>`).join("")}</ul>` : `<p class="muted">Empty.</p>`;
  if (mine.length) p += `<ul class="hlist wlist">${mine.map(id => `<li><span class="wpic">${icon(id, 22)}</span><span class="wtxt"><b>${esc(ITEMS[id].n)}</b><small>${F.inv[id]} with you</small></span><span class="orbtns"><button class="btn small primary" data-hf="shelf" data-k="${id}" data-n="1">Put 1 out</button><button class="btn small alt" data-hf="shelf" data-k="${id}" data-n="99">All</button></span></li>`).join("")}</ul>`;
  return p + shut;
}
// the farmhouse: how much Felix and Elena trust Mel, what's next, and today's ask
export function farmhousePanel(F, here){
  const h = hfState(F), lv = levelOf(h), next = LEVELS[lv + 1], r = requestToday(), done = h.reqDone === dayKey(), ready = requestReady(F);
  const who = r.who === "felix" ? "Felix" : "Elena", pct = next ? Math.round(100*(h.trust - LEVELS[lv].at)/(next.at - LEVELS[lv].at)) : 100;
  let p = `<span class="tape gingham" aria-hidden="true"></span><h2>The farmhouse</h2><p class="sub">The kettle's on, and there's a chalkboard by the door.</p>`;
  p += `<p class="olabel">You're their ${LEVELS[lv].n.toLowerCase()}</p><span class="clbar"><i style="width:${pct}%"></i></span><p class="muted">${next ? `${next.at - h.trust} more trust to become their ${next.n.toLowerCase()}: ${next.gives}.` : "Partners, officially. Elena's had a sign made."} Every bit of help counts: feeding, brushing, mucking out, milking, the hives, turning the cheese.</p>`;
  p += `<p class="eyebrow" style="margin:12px 0 6px">${who} asks</p><p>"${esc(r.ask)}"</p>`;
  const left = done ? "" : requestLeft(F);
  p += done ? `<p class="muted">Done today. ${who} is very grateful.</p>` : `${left ? `<p class="muted">${esc(left)}</p>` : ""}<div class="actions"><button class="btn primary small" data-hf="req" ${ready && (r.act !== "hive" || here) ? "" : "disabled"}>${r.need ? "Hand them over" : r.act === "hive" ? (here ? `Help ${who}` : `${who}'s not here just now`) : "Tell them it's done"}</button></div>`;
  if (lv >= 1) p += `<p class="eyebrow" style="margin:12px 0 6px">What you've earned</p><ul class="hlist">${LEVELS.slice(1, lv + 1).map(x => `<li><small><b>${x.n}:</b> ${esc(x.gives)}</small></li>`).join("")}</ul>`;
  return p + shut;
}
export const giveName = id => NAMES[id] || id;

/* ---------- the barn's panels ---------- */
const dur = ms => { const hrs = Math.ceil(ms/36e5); return hrs >= 24 ? `${Math.floor(hrs/24)}d ${hrs % 24}h` : `${hrs}h`; };
export function extractorPanel(F){
  const h = hfState(F), k = honeyNow();
  return `<span class="tape stripe" aria-hidden="true"></span><h2>The honey extractor</h2><p class="sub">Frames of comb from the hives go in the drum; a good spin, and the honey runs into jars. This week it's ${k.n} honey. ${h.frames ? `${h.frames} frame${h.frames === 1 ? "" : "s"} waiting.` : "No frames waiting: collect them from the hives."}</p>
    <div class="actions"><button class="btn primary small" data-hf="spin" ${h.frames ? "" : "disabled"}>${h.frames ? `Spin and jar (${h.frames})` : "Nothing to spin"}</button>${levelOf(h) >= 2 ? `<button class="btn alt small" data-hf="comb" ${h.frames ? "" : "disabled"}>Cut a frame as comb</button><button class="btn alt small" data-hf="cream" ${["honey", "honey_lav", "honey_blossom"].some(k => (F.inv || {})[k] > 0) ? "" : "disabled"}>Cream a jar</button>` : ""}<button class="btn alt small" data-close="1">Close</button></div>${levelOf(h) >= 2 ? `<p class="muted">Felix's tricks: comb straight from the frame, or a jar whipped into creamed honey.</p>` : ""}`;
}
export function crockPanel(F){
  const inv = F.inv || {}, m = (inv.milk || 0) + (inv.goatmilk || 0);
  return `<span class="tape gingham" aria-hidden="true"></span><h2>The yoghurt crocks</h2><p class="sub">A bottle of milk or goat's milk makes a pot of thick yoghurt: for frozen yoghurt at the Scoop Shack, or breakfast. You have ${m} bottle${m === 1 ? "" : "s"} of milk${inv.yoghurt ? ` and ${inv.yoghurt} pot${inv.yoghurt === 1 ? "" : "s"} of yoghurt` : ""}.</p>
    <div class="actions"><button class="btn primary small" data-hf="yog" ${m ? "" : "disabled"}>Make one</button><button class="btn alt small" data-hf="yogall" ${m > 1 ? "" : "disabled"}>All of it</button><button class="btn alt small" data-close="1">Close</button></div>`;
}
export function pressPanel(F, st = {}){
  const h = hfState(F), inv = F.inv || {}, kind = CHEESES[st.kind] ? st.kind : "cheddar", c = CHEESES[kind], ok = h.cave.length < caveSize(h) && (inv[c.milk] || 0) >= c.need && (!c.lvl || levelOf(h) >= c.lvl), sug = cheeseNames(F, kind, Math.floor(clock()/864e5));
  let p = `<span class="tape stripe" aria-hidden="true"></span><h2>The cheese press</h2><p class="sub">Choose a cheese, give the wheel a name, and press it. It ages on a shelf in the cave until it's ripe. ${h.cave.length} of ${caveSize(h)} shelves in use. Turn the wheels in the cave every day or so: the better they're looked after, the better the cut.</p>`;
  p += `<div class="gchips">${cheesesFor(h).map(([k, x]) => `<button class="gchip${k === kind ? " on" : ""}" data-hf="ckind" data-k="${k}" aria-pressed="${k === kind}"><span class="gdot" style="background:${x.col}"></span><span>${esc(x.n)}</span></button>`).join("")}</div>`;
  p += `<p class="muted">${esc(c.n)}: ${c.need} ${c.milk === "goatmilk" ? "goat's milk" : "milk"} (you have ${inv[c.milk] || 0}), ripe in ${c.days} day${c.days === 1 ? "" : "s"}, ${c.wedges} wedges.</p>`;
  p += `<label class="sr" for="hfName">Name this wheel</label><input id="hfName" class="vyname" maxlength="30" placeholder="${esc(sug[0] || "Name it")}" value="${esc(st.name || "")}"><div class="actions"><button class="btn alt small" data-hf="csug">Suggest a name</button><button class="btn primary small" data-hf="press" ${ok ? "" : "disabled"}>Press it</button><button class="btn alt small" data-close="1">Close</button></div>`;
  if (!ok) p += `<p class="muted">${h.cave.length >= caveSize(h) ? "The cave's full: take a ripe wheel out first." : `Not enough ${c.milk === "goatmilk" ? "goat's milk" : "milk"}: milk the ${c.milk === "goatmilk" ? "goats" : "cows"} in the morning.`}</p>`;
  return p;
}
export function cavePanel(F){
  const h = hfState(F), day = dayKey(), toTurn = h.cave.filter(w => caveLeft(w) && w.lastTurn !== day).length;
  let p = `<span class="tape gingham" aria-hidden="true"></span><h2>The cheese cave</h2><p class="sub">Cool and dark, with wheels on oak shelves. Turn them every day or so while they age: turned faithfully, a wheel comes out excellent; forgotten, rustic. ${h.cave.length} of ${caveSize(h)} shelves in use.</p>`;
  if (h.cave.some(w => caveLeft(w))) p += `<div class="actions"><button class="btn primary small" data-hf="turn" ${toTurn ? "" : "disabled"}>${toTurn ? `Turn the wheels (${toTurn})` : "All turned today"}</button></div>`;
  const QW = {excellent: "on track for excellent", good: "looking good", rustic: "could do with more turning"};
  p += h.cave.length ? `<ul class="hlist wlist">${h.cave.map((w, i) => { const c = CHEESES[w.kind], left = caveLeft(w), q = quality(w); return `<li><span class="wpic"><span class="gdot" style="background:${c.col}"></span></span><span class="wtxt"><b>${esc(w.name)}</b><small>${esc(c.n)} · ${left ? `ripe in ${dur(left)} · turned ${w.turns || 0}× · ${QW[q]}` : `ripe! ${q === "excellent" ? "Excellent." : q === "good" ? "A good one." : "A bit rustic."}`}</small></span>${left ? `<span class="clbar" style="width:70px"><i style="width:${Math.round(100*(1 - left/(c.days*864e5)))}%"></i></span>` : `<button class="btn small primary" data-hf="wheel" data-k="${i}">Cut it</button>`}</li>`; }).join("")}</ul>` : `<p class="muted">Empty shelves. Press a wheel at the cheese press.</p>`;
  return p + shut;
}
