// The kitchen behind the wine shop. Ingredients come from the backpack (send them to the kitchen from the backpack,
// or bring them over at the larder): garden crops, eggs and goat's milk from the animal run, olives from the olive
// tree, and flour, cheese and olives from Hana's deli shelf.
//   Oven: 1 flour bakes 2 loaves in an hour.   Cheese press: 2 milk make a cheese in 3 hours.
//   Stove: small plates for the tasting room (bread, olives, cheese boards, market treats), and the tapas of the day:
//   Mel picks one garden dish a day and cooks batches of it. At closing (10pm) any leftover tapas go to the staff for
//   dinner, and they leave something for the larder by way of thanks.
// State: F.kitchen = {larder: {id: n}, oven: {start, dur} | null, press: {start, dur} | null}; plates live in F.vine
// (v.menu for small plates, v.tapas = {day, id, plates} for today's tapas, v.staffNote for the last staff dinner).
import { esc, H, hash } from "../util.js";
import { vineState, tapasOn } from "./vineyard.js";
import { dishArt } from "../art/wine.js";
import { icon } from "../art/icons.js";
import { seasonOf, SEASONS, ITEMS } from "../data/items.js";

export const GOODS = {
  carrot: ["carrot", "carrots"], corn: ["corn cob", "corn cobs"], strawberry: ["strawberry", "strawberries"], blueberry: ["blueberry", "blueberries"],
  tomato: ["tomato", "tomatoes"], potato: ["potato", "potatoes"], pepper: ["pepper", "peppers"], egg: ["egg", "eggs"], milk: ["milk", "milk"],
  flour: ["bag of flour", "bags of flour"], cheese: ["cheese", "cheeses"], olives: ["jar of olives", "jars of olives"], loaf: ["loaf", "loaves"],
  apple: ["apple", "apples"], dumpling: ["dumpling", "dumplings"], fish: ["fish", "fish"], toast: ["honey toast", "honey toasts"],
  pea: ["handful of peas", "handfuls of peas"], pumpkin: ["pumpkin", "pumpkins"], leek: ["leek", "leeks"],
  trout: ["rainbow trout", "rainbow trout"], crayfish: ["crayfish", "crayfish"], sardine: ["sardine", "sardines"], mackerel: ["mackerel", "mackerel"],
  seabream: ["sea bream", "sea bream"], squid: ["squid", "squid"], octopus: ["octopus", "octopuses"],
  goatmilk: ["goat's milk", "goat's milk"], yoghurt: ["pot of yoghurt", "pots of yoghurt"], pear: ["pear", "pears"], fig: ["fig", "figs"],
  honeycomb: ["piece of honeycomb", "pieces of honeycomb"], lemon: ["lemon", "lemons"], wildgarlic: ["bunch of wild garlic", "bunches of wild garlic"], blackberry: ["blackberry", "blackberries"], mushroom: ["wild mushroom", "wild mushrooms"], chestnut: ["chestnut", "chestnuts"], syrup: ["bottle of petal syrup", "bottles of petal syrup"],
  // groups (round 101): anything that fits, see ALT
  farmcheese: ["farm cheese", "farm cheeses"], halloumi: ["halloumi", "halloumi"], bluecheese: ["Honeybrook blue", "Honeybrook blue"], cheddar: ["farmhouse cheddar", "farmhouse cheddar"],
  honey: ["jar of honey", "jars of honey"], petals: ["garden flower", "garden flowers"],
  // round 107: from Ronda's market
  almond: ["bag of almonds", "bags of almonds"], sevilla: ["Seville orange", "Seville oranges"], oliveoil: ["bottle of olive oil", "bottles of olive oil"], jamon: ["piece of jamón", "pieces of jamón"],
  payoyo: ["payoyo cheese", "payoyo cheeses"], membrillo: ["block of membrillo", "blocks of membrillo"]};
export const GROUP_ICON = {farmcheese: "chz_cheddar", halloumi: "chz_halloumi", bluecheese: "chz_blue", cheddar: "chz_cheddar", honey: "honey", petals: "tulip"};
// Wildflower Farm's cheeses (chz_*) come in as themselves: any of them does for "cheese" in a recipe, and the farm
// cheese board wants one; goat's milk does for milk (the press, the crema). See ALT.
export const isGood = id => (id in GOODS && !GROUP_ICON[id]) || /^chz_|^honey(_lav|_blossom|_cream)?$/.test(id) || id === "tulip" || id === "sunflower";   // (loaves are only ever baked in the oven, but one taken out can go back in)
const nm = (id, n) => GOODS[id] ? GOODS[id][n === 1 ? 0 : 1] : ITEMS[id] ? ITEMS[id].n.toLowerCase() : id;
export const needText = need => Object.entries(need).map(([k, n]) => `${n} ${nm(k, n)}`).join(" + ");

// small plates for the tasting room, cooked at the stove
export const DISHES = {
  bread: {n: "Bread and butter", need: {loaf: 1}, plates: 4, price: 3},
  olives: {n: "Bowl of olives", need: {olives: 1}, plates: 4, price: 4},
  cheese: {n: "Cheese board", need: {cheese: 1, loaf: 1}, plates: 4, price: 8},
  farmboard: {n: "Farm cheese board", need: {farmcheese: 1, loaf: 1}, plates: 4, price: 12},
  dumplings: {n: "Dumplings", need: {dumpling: 2}, plates: 4, price: 6},
  honeytoast: {n: "Honey toast soldiers", need: {toast: 1}, plates: 3, price: 7},
  fish: {n: "Grilled fish", need: {fish: 1}, plates: 3, price: 8},
  apples: {n: "Apple slices", need: {apple: 2}, plates: 4, price: 3},
  honeycake: {n: "Honey cake", need: {egg: 1, honey: 1, flour: 1}, plates: 4, price: 7},
  shortbread: {n: "Flower shortbread", need: {flour: 1, petals: 2}, plates: 4, price: 5},
  bluetart: {n: "Blueberry tart", need: {blueberry: 3, flour: 1}, plates: 4, price: 6},
  posset: {n: "Lemon and petal posset", need: {milk: 1, lemon: 1, syrup: 1}, plates: 4, price: 7},
  crumble: {n: "Blackberry crumble", need: {blackberry: 3, flour: 1}, plates: 4, price: 6},
  // round 107: with Ronda's almonds and olive oil
  almendras: {n: "Salted almonds", need: {almond: 1}, plates: 4, price: 5},
  panaceite: {n: "Bread with olive oil", need: {loaf: 1, oliveoil: 1}, plates: 4, price: 5}};
// the tapas of the day: garden dishes, one chosen each day, 6 plates a batch
export const TAPAS = {
  patatas: {n: "Patatas bravas", need: {potato: 2, tomato: 1}, price: 8, seasons: ["autumn"]},
  tortilla: {n: "Tortilla española", need: {potato: 2, egg: 2}, price: 9, seasons: ["spring", "autumn", "winter"]},
  pancon: {n: "Pan con tomate", need: {loaf: 1, tomato: 2}, price: 7, seasons: ["summer", "autumn"]},
  pimientos: {n: "Pimientos asados", need: {pepper: 3}, price: 7, seasons: ["summer"]},
  fritters: {n: "Corn fritters", need: {corn: 2, egg: 1}, price: 7, seasons: ["summer", "autumn"]},
  carrots: {n: "Carrots with olives", need: {carrot: 2, olives: 1}, price: 6, seasons: ["spring", "autumn", "winter"]},
  crema: {n: "Strawberry crema", need: {strawberry: 2, milk: 1}, price: 9, seasons: ["spring"]},
  tostas: {n: "Tomato and cheese tostas", need: {loaf: 1, tomato: 1, cheese: 1}, price: 10, seasons: ["summer", "autumn"]},
  rellenos: {n: "Stuffed peppers", need: {pepper: 2, cheese: 1}, price: 10, seasons: ["summer"]},
  guisantes: {n: "Peas with mint and cheese", need: {pea: 2, cheese: 1}, price: 8, seasons: ["spring", "summer"]},
  croquetas: {n: "Pumpkin croquetas", need: {pumpkin: 1, egg: 1, loaf: 1}, price: 10, seasons: ["autumn", "winter"]},
  calabaza: {n: "Roast pumpkin with olives", need: {pumpkin: 1, olives: 1}, price: 8, seasons: ["autumn", "winter"]},
  puerros: {n: "Leek and potato soup cups", need: {leek: 2, potato: 1}, price: 8, seasons: ["autumn", "winter"]},
  // from the fishing spots, all year round
  sardinas: {n: "Grilled sardines", need: {sardine: 3}, price: 8},
  escabeche: {n: "Mackerel escabeche", need: {mackerel: 2, pepper: 1}, price: 10},
  calamares: {n: "Fried calamari", need: {squid: 2, flour: 1}, price: 11},
  pulpo: {n: "Pulpo a la gallega", need: {octopus: 1, potato: 2}, price: 12},
  dorada: {n: "Sea bream with olives", need: {seabream: 1, olives: 1}, price: 11},
  trucha: {n: "Trout with almond butter", need: {trout: 2, milk: 1}, price: 10},
  cangrejos: {n: "Garlic crayfish on toast", need: {crayfish: 4, loaf: 1}, price: 10},
  // round 101: more ways to use eggs, tomatoes, yoghurt, honey, the farm's cheeses, pears and leeks
  huevos: {n: "Huevos rotos", need: {egg: 2, potato: 2}, price: 9},
  tomatoegg: {n: "Ma Ma's tomato and egg", need: {tomato: 2, egg: 2}, price: 8, seasons: ["summer", "autumn"]},
  yogur: {n: "Yoghurt with honey and walnuts", need: {yoghurt: 2, honey: 1}, price: 8},
  halloumi: {n: "Grilled halloumi with honey", need: {halloumi: 1, honey: 1}, price: 11},
  azul: {n: "Honeybrook blue with pear", need: {bluecheese: 1, pear: 2}, price: 11},
  manzana: {n: "Apple and cheddar tostas", need: {cheddar: 1, apple: 2, loaf: 1}, price: 11},
  tarta: {n: "Leek and cheese tart", need: {leek: 2, cheese: 1, flour: 1}, price: 10, seasons: ["autumn", "winter"]},
  panal: {n: "Honeycomb with farm cheese", need: {honeycomb: 1, farmcheese: 1}, price: 12},
  // round 103: from the woods (foraging, woods.js)
  ajo: {n: "Wild garlic tortilla", need: {wildgarlic: 2, egg: 2, potato: 1}, price: 10, seasons: ["spring"]},
  setas: {n: "Wild mushrooms on toast", need: {mushroom: 2, loaf: 1}, price: 10, seasons: ["autumn", "winter"]},
  castanas: {n: "Roast chestnuts with honey", need: {chestnut: 4, honey: 1}, price: 9, seasons: ["autumn", "winter"]},
  // round 107: tasted at the tapas bar in Ronda (learn: only once Mel's tried them there, towns.js TASTINGS)
  salmorejo: {n: "Salmorejo", need: {tomato: 2, loaf: 1, oliveoil: 1}, price: 11, seasons: ["summer", "autumn"], learn: true},
  ajoblanco: {n: "Ajo blanco", need: {almond: 2, loaf: 1, oliveoil: 1}, price: 11, learn: true},
  croqjamon: {n: "Jamón croquetas", need: {jamon: 1, milk: 1, flour: 1}, price: 13, learn: true},
  payoyo: {n: "Payoyo with membrillo", need: {payoyo: 1, membrillo: 1}, price: 14, learn: true},
  naranjas: {n: "Orange and olive salad", need: {sevilla: 2, olives: 1, oliveoil: 1}, price: 10, learn: true}};
// a tapas Mel can cook: the Ronda ones once she's tasted them there
export const knows = (F, id) => !TAPAS[id].learn || !!(F.learned && F.learned[id]);
export const inSeason = (id, season) => !TAPAS[id].seasons || TAPAS[id].seasons.includes(season);
export const TAPAS_PLATES = 6, TAPAS_MAX = 3;   // round 108: up to three tapas a day
// The chef's request: each day someone in town has a craving for one of the season's tapas. Make it the tapas of the
// day and it sells for half as much again (a reason to cook something different each day).
const ASKERS = ["Rosa", "Bastien", "Noor", "Felix", "Elena", "Mateo", "Lila", "Celeste"];
export function requestOf(today){ const ids = Object.keys(TAPAS).filter(id => inSeason(id, seasonOf(today)) && !TAPAS[id].learn), h = hash(today + "crave"); return {id: ids[h % ids.length], who: ASKERS[(h >> 5) % ASKERS.length]}; }
export const tapasPrice = (id, today) => Math.round(TAPAS[id].price*(requestOf(today).id === id ? 1.5 : 1));
const OVEN = 1*H, PRESS = 3*H;
const KP = {};   // which of the stove's fold-out sections are open (kept across redraws)
const nextDay = d => new Date(Date.parse(d + "T00:00:00Z") + 864e5).toISOString().slice(0, 10);

export function kitchenState(F){ F.kitchen = F.kitchen || {}; const k = F.kitchen; k.larder = k.larder || {}; k.keep = k.keep || {}; k.pilarNo = k.pilarNo || {}; if (!("oven" in k)) k.oven = null; if (!("press" in k)) k.press = null; return k; }
// what in the larder does for a need: the thing itself first, then its stand-ins
const ALT = {cheese: id => id === "cheese" || /^chz_/.test(id), milk: id => id === "milk" || id === "goatmilk", farmcheese: id => /^chz_/.test(id),
  halloumi: id => /^chz_halloumi/.test(id), bluecheese: id => /^chz_blue/.test(id), cheddar: id => /^chz_cheddar/.test(id),
  honey: id => /^honey(_lav|_blossom|_cream)?$/.test(id), petals: id => id === "tulip" || id === "sunflower"};
const pool = (k, g) => ALT[g] ? Object.keys(k.larder).filter(ALT[g]).sort((a, b) => (b === g) - (a === g)) : [g];
export const larderCount = (k, g) => pool(k, g).reduce((a, id) => a + (k.larder[id] || 0), 0);
const has = (k, need) => Object.entries(need).every(([id, n]) => larderCount(k, id) >= n);
const use = (k, need) => Object.entries(need).forEach(([g, n]) => { for (const id of pool(k, g)) { if (n <= 0) break; const m = Math.min(n, k.larder[id] || 0); k.larder[id] -= m; n -= m; if (k.larder[id] <= 0) delete k.larder[id]; } });
// Round 108: what Pilar may use. Mel keeps some of anything back (k.keep: larder id -> how many), and Pilar never
// touches those; Mel cooking herself can use everything.
const spareOf = (k, id) => Math.max(0, (k.larder[id] || 0) - (k.keep[id] || 0));
const spareCount = (k, g) => pool(k, g).reduce((a, id) => a + spareOf(k, id), 0);
const canSpare = (k, need, also = {}) => Object.entries(need).every(([g, n]) => spareCount(k, g) - (also[g] || 0) >= n);
const useSpare = (k, need) => Object.entries(need).forEach(([g, n]) => { for (const id of pool(k, g)) { if (n <= 0) break; const m = Math.min(n, spareOf(k, id)); k.larder[id] -= m; n -= m; if (k.larder[id] <= 0) delete k.larder[id]; } });
export function setKeep(F, id, d){ const k = kitchenState(F), n = Math.max(0, Math.min(99, (k.keep[id] || 0) + d)); if (n) k.keep[id] = n; else delete k.keep[id]; return n; }
const add = (k, id, n) => { k.larder[id] = (k.larder[id] || 0) + n; };
const left = t => t ? Math.max(0, t.start + t.dur - Date.now()) : 0;
const hrs = ms => { const m = Math.ceil(ms/60000); return m >= 60 ? `${Math.floor(m/60)}h ${m % 60}m` : `${m}m`; };

/* ---------- moving things in ---------- */
// from the backpack (F.inv) into the larder. n: how many (default all). -> how many moved
export function sendToKitchen(F, id, n){
  if (!isGood(id) || !(F.inv && F.inv[id] > 0)) return 0; const k = kitchenState(F), m = Math.min(F.inv[id], n || F.inv[id]);
  F.inv[id] -= m; if (F.inv[id] <= 0) delete F.inv[id]; add(k, id, m); return m;
}
export const backpackGoods = F => Object.keys(F.inv || {}).filter(id => isGood(id) && F.inv[id] > 0);

/* ---------- oven, press, stove ---------- */
export function bake(F){ const k = kitchenState(F); if (k.oven || !has(k, {flour: 1})) return null; use(k, {flour: 1}); k.oven = {start: Date.now(), dur: OVEN}; return "Loaves in the oven. Ready in an hour."; }
export function takeLoaves(F){ const k = kitchenState(F); if (!k.oven || left(k.oven)) return null; k.oven = null; add(k, "loaf", 2); return "Two warm loaves, into the larder. Smells amazing."; }
export function pressCheese(F){ const k = kitchenState(F); if (k.press || !has(k, {milk: 2})) return null; use(k, {milk: 2}); k.press = {start: Date.now(), dur: PRESS}; return "Milk in the press. Cheese in about three hours."; }
export function takeCheese(F){ const k = kitchenState(F); if (!k.press || left(k.press)) return null; k.press = null; add(k, "cheese", 1); return "A little round of cheese, into the larder."; }
// Petal syrup: three garden flowers (tulips, sunflowers) simmered with sugar make two bottles, into the backpack:
// for gelato at the Scoop Shack, a bonbon filling at the Cocoa Room, or the lemon and petal posset here
export const SYRUP_PETALS = 3;
export function makeSyrup(F){ const k = kitchenState(F); if (!has(k, {petals: SYRUP_PETALS})) return null; use(k, {petals: SYRUP_PETALS}); F.inv = F.inv || {}; F.inv.syrup = (F.inv.syrup || 0) + 2; return "Two bottles of petal syrup, pink and fragrant. Into your backpack."; }
export function cookDish(F, id, pilar){ const k = kitchenState(F), d = DISHES[id], v = vineState(F); if (!d || !(pilar ? canSpare(k, d.need) : has(k, d.need))) return null; (pilar ? useSpare : use)(k, d.need); v.menu[id] = (v.menu[id] || 0) + d.plates; return `${d.plates} plates of ${d.n.toLowerCase()}, out to the tasting room.`; }
// Today's tapas (up to TAPAS_MAX). A plan Mel made yesterday for today goes on the chalkboard the first time anyone looks.
export function tapasAll(F, today){
  const v = vineState(F), p = v.tapasPlan;
  if (p && p.day === today && !p.done) { p.done = true; (p.ids || []).forEach(id => chooseTapas(F, id, today)); }
  return tapasOn(v, today);
}
export const tapasToday = (F, today) => tapasAll(F, today)[0] || null;
// add a tapas to today's chalkboard (until there are three)
export function chooseTapas(F, id, today){ const v = vineState(F), list = tapasOn(v, today); if (!TAPAS[id] || !knows(F, id) || !inSeason(id, seasonOf(today)) || list.length >= TAPAS_MAX || list.some(t => t.id === id)) return null;
  v.tapasList = [...(v.tapasList || []).filter(t => t.day === today || t.plates > 0), {day: today, id, plates: 0, cooked: 0}]; return `${TAPAS[id].n} is on today's chalkboard.`; }
// take one off the chalkboard again (only before a batch is cooked)
export function dropTapas(F, id, today){ const v = vineState(F), t = tapasOn(v, today).find(x => x.id === id); if (!t || t.cooked) return null; v.tapasList = v.tapasList.filter(x => x !== t); return "Okay, it's off the chalkboard."; }
export function cookTapas(F, today, id, pilar){ const k = kitchenState(F), list = tapasAll(F, today), t = (id && list.find(x => x.id === id)) || (!id && list[0]); if (!t) return null; const need = TAPAS[t.id].need;
  if (!(pilar ? canSpare(k, need) : has(k, need))) return null; (pilar ? useSpare : use)(k, need); t.plates += TAPAS_PLATES; t.cooked++; return `${TAPAS_PLATES} plates of ${TAPAS[t.id].n.toLowerCase()}! Out they go.`; }
// plan tomorrow's tapas (toggle one on or off; up to three)
export function planTapas(F, id, tomorrow){ const v = vineState(F); if (!v.tapasPlan || v.tapasPlan.day !== tomorrow) v.tapasPlan = {day: tomorrow, ids: []};
  const p = v.tapasPlan; if (p.ids.includes(id)) p.ids = p.ids.filter(x => x !== id); else if (p.ids.length < TAPAS_MAX && TAPAS[id] && knows(F, id)) p.ids = [...p.ids, id]; else return null;
  return p.ids.length ? `Tomorrow's chalkboard: ${p.ids.map(x => TAPAS[x].n).join(", ")}.` : "Nothing planned for tomorrow yet."; }
// At closing (or the next day), leftover tapas feed the staff, who leave something for the larder. -> note or null
const THANKS = [["olives", "Marco"], ["egg", "Ines"], ["flour", "Celeste"]];
export function staffDinner(F, today, hm){
  const v = vineState(F), over = (v.tapasList || []).filter(t => t.plates > 0 && !(t.day === today && hm < 22*60)); if (!over.length) return null;
  const k = kitchenState(F), plates = over.reduce((a, t) => a + t.plates, 0), gifts = {}, t = over[0];
  for (let i = 0; i < Math.ceil(plates/2); i++) { const [id] = THANKS[i % 3]; add(k, id, 1); gifts[id] = (gifts[id] || 0) + 1; }
  over.forEach(x => { x.plates = 0; }); v.tapasList = v.tapasList.filter(x => x.day === today);
  v.staffNote = {day: t.day, plates, dish: over.map(x => TAPAS[x.id] ? TAPAS[x.id].n : "tapas").join(" and "), gifts, seen: false};
  return v.staffNote;
}
export const staffLine = n => `Leftover ${n.dish.toLowerCase()} (${n.plates} plate${n.plates === 1 ? "" : "s"}) went to Marco, Ines and Celeste for dinner. They left ${Object.entries(n.gifts).map(([id, c]) => `${c} ${nm(id, c)}`).join(", ")} in the larder to say thanks.`;

/* ---------- Pilar, the cook ---------- */
// While she's on shift (and Mel hasn't sent her home in the staff card at the shop counter) Pilar runs the kitchen:
// takes out finished loaves and cheese, keeps the oven and press going, picks a tapas of the day if Mel hasn't
// (the dearest one the larder can make), cooks more when the last plates are going, and keeps small plates topped
// up with whatever's left. She never touches the backpack unless Mel ticks "fetch". -> list of things done
export const COOK = "pilar";
const cookLog = (k, line) => { k.log = [line, ...(k.log || [])].slice(0, 4); };
export function cookTick(F, today){
  const k = kitchenState(F), v = vineState(F), help = v.help || {}, done = [];
  if (help.cook === false) return done;
  if (help.fetch) { const moved = backpackGoods(F).map(x => [x, sendToKitchen(F, x)]).filter(([, n]) => n); if (moved.length) done.push(`brought in ${moved.map(([x, n]) => `${n} ${nm(x, n)}`).join(", ")} from your backpack`); }
  if (k.oven && !left(k.oven)) { takeLoaves(F); done.push("took two loaves out of the oven"); }
  if (k.press && !left(k.press)) { takeCheese(F); done.push("unwrapped a new cheese"); }
  if (!k.press && !k.pilarNo.press && canSpare(k, {milk: 2})) { useSpare(k, {milk: 2}); k.press = {start: Date.now(), dur: PRESS}; done.push("started a cheese in the press"); }
  if (!k.oven && !k.pilarNo.bread && (k.larder.loaf || 0) < 3 && canSpare(k, {flour: 1})) { useSpare(k, {flour: 1}); k.oven = {start: Date.now(), dur: OVEN}; done.push("put bread in the oven"); }
  let list = tapasAll(F, today);
  if (!list.length && !k.pilarNo.tapas) { const best = Object.keys(TAPAS).filter(id => inSeason(id, seasonOf(today)) && knows(F, id) && canSpare(k, TAPAS[id].need)).sort((a, b) => tapasPrice(b, today) - tapasPrice(a, today))[0];
    if (best) { chooseTapas(F, best, today); list = tapasAll(F, today); done.push(`chose ${TAPAS[best].n.toLowerCase()} for the tapas of the day`); } }
  list.forEach(t => { if (t.plates < 2 && cookTapas(F, today, t.id, true)) done.push(`cooked ${TAPAS_PLATES} plates of ${TAPAS[t.id].n.toLowerCase()}`); });
  // small plates she's allowed to make (Pilar's list), from what's spare, keeping back one more batch of each tapas
  const keep = {}; list.forEach(t => Object.entries(TAPAS[t.id].need).forEach(([g, n]) => { keep[g] = (keep[g] || 0) + n; }));
  for (const id of Object.keys(DISHES)) { const d = DISHES[id]; if ((v.menu[id] || 0) >= 2 || k.pilarNo[id]) continue;
    if (canSpare(k, d.need, keep) && cookDish(F, id, true)) done.push(`made ${d.n.toLowerCase()}`); }
  if (done.length) { k.cookAt = Date.now(); cookLog(k, done.join(", ")); }
  return done;
}
export const cookLine = done => `Pilar ${done.length > 1 ? done.slice(0, -1).join(", ") + " and " + done[done.length - 1] : done[0]}.`;

/* ---------- panels ---------- */
const pic = (id, s = 34) => icon(id, s);
const larderGrid = k => { const ids = Object.keys(k.larder).filter(id => k.larder[id] > 0);
  return ids.length ? `<div class="kgoods">${ids.map(id => `<div class="kgoodw"><button class="kgood kbtn" data-k="take" data-id="${id}">${pic(id)}<b>${k.larder[id]}</b><small>${esc(nm(id, k.larder[id]))}</small><em>Take one</em></button>
      <span class="kkeep" title="Pilar leaves these alone"><button class="btn small alt" data-k="keep" data-id="${id}" data-n="-1" aria-label="Keep fewer back">−</button><span>${k.keep[id] ? `keep ${k.keep[id]}` : "keep 0"}</span><button class="btn small alt" data-k="keep" data-id="${id}" data-n="1" aria-label="Keep one more back">+</button></span></div>`).join("")}</div><p class="muted">Tap one to take it back to your backpack (for the Scoop Shack, or a gift). <b>Keep</b>: how many Pilar must leave alone (say, flowers you're saving for petal syrup). You can still use them yourself.</p>` : `<p class="muted">Empty. Send ingredients here from your backpack.</p>`; };
const needList = (k, need) => Object.entries(need).map(([id, n]) => `<span class="kneed ${larderCount(k, id) >= n ? "ok" : ""}">${pic(GROUP_ICON[id] || id, 22)}${n} ${esc(nm(id, n))} <small>(${larderCount(k, id)})</small></span>`).join("");
export function larderPanel(F){
  const k = kitchenState(F), bag = backpackGoods(F);
  return `<span class="tape gingham" aria-hidden="true"></span><h2>The larder</h2>${larderGrid(k)}
    <h3 class="ph3">In your backpack</h3>${bag.length ? `<div class="kgoods">${bag.map(id => `<button class="kgood kbtn" data-k="send" data-id="${id}">${pic(id)}<b>${F.inv[id]}</b><small>${esc(nm(id, F.inv[id]))}</small><em>Bring in</em></button>`).join("")}</div>
    <div class="actions"><button class="btn primary small" data-k="sendall">Bring everything in</button></div>` : `<p class="muted">Nothing for the kitchen in your backpack right now. Crops from the garden, eggs and milk from the animal run, olives from the olive tree, and Hana's deli shelf all help.</p>`}
    <h3 class="ph3">Petal syrup</h3><p class="muted">${SYRUP_PETALS} garden flowers (tulips or sunflowers) make two bottles: for gelato, a bonbon filling, or the lemon and petal posset. Flowers in the larder: ${larderCount(k, "petals")}.</p>
    <div class="actions"><button class="btn small ${larderCount(k, "petals") >= SYRUP_PETALS ? "primary" : "alt"}" data-k="syrup" ${larderCount(k, "petals") >= SYRUP_PETALS ? "" : "disabled"}>Make petal syrup</button></div>
    <div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
}
export function ovenPanel(F){
  const k = kitchenState(F), l = left(k.oven);
  return `<span class="tape stripe" aria-hidden="true"></span><h2>The oven</h2><p class="sub">One bag of flour bakes two loaves in an hour. Flour: ${k.larder.flour || 0} · loaves in the larder: ${k.larder.loaf || 0}.</p>
    ${k.oven ? (l ? `<p>Baking: ready in ${hrs(l)}.</p><span class="clbar"><i style="width:${Math.round(100*(1 - l/k.oven.dur))}%"></i></span>` : `<p>The loaves are ready!</p>`) : `<p class="muted">The oven's warm and empty.</p>`}
    <div class="actions">${k.oven ? (l ? "" : `<button class="btn primary" data-k="loaves">Take out the loaves</button>`) : `<button class="btn primary" data-k="bake" ${(k.larder.flour || 0) >= 1 ? "" : "disabled"}>Bake bread</button>`}<button class="btn alt small" data-close="1">Close</button></div>
    ${!(k.larder.flour) && !k.oven ? `<p class="muted">No flour in the larder. Hana's deli shelf has it.</p>` : ""}`;
}
export function pressPanel(F){
  const k = kitchenState(F), l = left(k.press);
  return `<span class="tape stripe" aria-hidden="true"></span><h2>The cheese press</h2><p class="sub">Two bottles of milk (cow's or goat's) make a little round of cheese in three hours. Milk: ${larderCount(k, "milk")} · cheese in the larder: ${k.larder.cheese || 0}.</p>
    ${k.press ? (l ? `<p>Pressing: ready in ${hrs(l)}.</p><span class="clbar"><i style="width:${Math.round(100*(1 - l/k.press.dur))}%"></i></span>` : `<p>The cheese is ready!</p>`) : `<p class="muted">Empty.</p>`}
    <div class="actions">${k.press ? (l ? "" : `<button class="btn primary" data-k="cheese">Take out the cheese</button>`) : `<button class="btn primary" data-k="press" ${larderCount(k, "milk") >= 2 ? "" : "disabled"}>Press cheese</button>`}<button class="btn alt small" data-close="1">Close</button></div>
    ${larderCount(k, "milk") < 2 && !k.press ? `<p class="muted">Milk comes from a goat in the animal run at home (the market's Animals tab), or buy cheese ready-made on Hana's deli shelf.</p>` : ""}`;
}
export function stovePanel(F, today){
  const k = kitchenState(F), t = tapasToday(F, today), T = t && TAPAS[t.id];
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>The stove</h2>`;
  const v = vineState(F), on = !v.help || v.help.cook !== false;
  h += `<p class="sub kcook">${on ? `Pilar runs the kitchen on her shifts (10am to 2:30pm, 4 to 9:30pm). You can still cook anything yourself.` : `Pilar's off for now. Turn her back on in the staff card at the shop counter.`}</p>${on && k.log && k.log.length ? `<ul class="klog">${k.log.map(l => `<li>${esc(l[0].toUpperCase() + l.slice(1))}.</li>`).join("")}</ul>` : ""}`;
  h += `<section class="ktapas"><h3 class="ph3">Tapas of the day</h3>`;
  const list = tapasAll(F, today), tomorrow = nextDay(today), plan = v.tapasPlan && v.tapasPlan.day === tomorrow ? v.tapasPlan.ids : [];
  { const rq = requestOf(today), R = TAPAS[rq.id]; h += `<p class="krequest">${icon("heart", 16)} <b>${esc(rq.who)}</b> has been craving <b>${esc(R.n.toLowerCase())}</b>. Put it on today's chalkboard and it sells for ${tapasPrice(rq.id, today)} coins a plate instead of ${R.price}.${list.some(t => t.id === rq.id) ? " It's on!" : ""} <small>Needs ${esc(needText(R.need))}.</small></p>`; }
  list.forEach(t => { const T = TAPAS[t.id]; h += `<div class="kdish chosen">${dishArt("tapas:" + t.id, 52)}<span><b>${esc(T.n)}</b><small>${t.plates} plate${t.plates === 1 ? "" : "s"} on the menu · ${tapasPrice(t.id, today)} coins each · needs ${needText(T.need)}</small><span class="kneeds">${needList(k, T.need)}</span></span></div>
      <div class="actions"><button class="btn primary small" data-k="cooktapas" data-id="${t.id}" ${has(k, T.need) ? "" : "disabled"}>Cook a batch (${TAPAS_PLATES} plates)</button>${!t.cooked ? `<button class="btn alt small" data-k="untapas" data-id="${t.id}">Take it off</button>` : ""}</div>`; });
  if (list.length) h += `<p class="muted">Leftovers at closing time (10pm) go to the staff for dinner.</p>`;
  const chooser = (ids, act, on = []) => `<div class="kdishes">${ids.map(id => { const d = TAPAS[id], ok = has(k, d.need);
      return `<button class="kdish ${ok ? "ok" : ""}${on.includes(id) ? " chosen" : ""}" data-k="${act}" data-id="${id}" aria-pressed="${on.includes(id)}">${dishArt("tapas:" + id, 46)}<span><b>${esc(d.n)}${on.includes(id) ? " ✓" : ""}</b><small>${d.price} coins a plate</small><span class="kneeds">${needList(k, d.need)}</span></span></button>`; }).join("")}</div>`;
  if (list.length < TAPAS_MAX) h += `<p class="sub">${list.length ? `Add another (${list.length} of ${TAPAS_MAX})` : "Pick today's dish"}: it goes on the chalkboard, sells for more than the small plates and brings extra people in. <b>${SEASONS[seasonOf(today)].n}</b> menu: ${SEASONS[seasonOf(today)].line.toLowerCase()}.</p>${chooser(Object.keys(TAPAS).filter(id => inSeason(id, seasonOf(today)) && knows(F, id) && !list.some(t => t.id === id)), "tapas")}`;
  h += `<details class="kplan" data-kp="plan"${KP.plan ? " open" : ""}><summary><b>Plan tomorrow's tapas</b> <small>${plan.length ? plan.map(x => esc(TAPAS[x].n)).join(", ") : `up to ${TAPAS_MAX}, they go on the chalkboard first thing`}</small></summary>${chooser(Object.keys(TAPAS).filter(id => inSeason(id, seasonOf(tomorrow)) && knows(F, id)), "plantapas", plan)}</details>`;
  // Pilar's list: what she may make on her own
  h += `<details class="kplan" data-kp="pilar"${KP.pilar ? " open" : ""}><summary><b>Pilar's list</b> <small>what she may make without asking</small></summary><div class="gchips">${[["tapas", "Pick a tapas if I haven't"], ["bread", "Bake bread"], ["press", "Press cheese"], ...Object.keys(DISHES).map(id => [id, DISHES[id].n])].map(([id, n]) => `<button class="gchip${k.pilarNo[id] ? "" : " on"}" data-k="pilarno" data-id="${id}" aria-pressed="${!k.pilarNo[id]}">${esc(n)}</button>`).join("")}</div><p class="muted">Untick anything you'd rather do yourself. To save particular ingredients, use <b>keep</b> in the larder.</p></details>`;
  h += `</section><h3 class="ph3">Small plates</h3><div class="items shop dishes">${Object.keys(DISHES).map(id => { const d = DISHES[id], ok = has(k, d.need);
    return `<button class="item" data-k="dish" data-dish="${id}" ${ok ? "" : "disabled"}><span class="e">${dishArt(id, 44, !ok)}</span><span class="n">${esc(d.n)}</span><span class="c">${esc(needText(d.need))}</span><span class="d">${d.plates} plates · ${d.price} coins each</span></button>`; }).join("")}</div>`;
  return h + `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
}
// api: {save, rerender, say, sfx, today}
export function wireKitchen(root, F, api){
  root.querySelectorAll("details[data-kp]").forEach(d => d.ontoggle = () => { KP[d.dataset.kp] = d.open; });
  root.querySelectorAll("[data-k]").forEach(b => b.onclick = () => {
    const k = b.dataset.k, id = b.dataset.dish || b.dataset.id; let line = null;   // (dish buttons avoid data-id: the market claims .item[data-id])
    if (k === "send") { const n = sendToKitchen(F, id); if (n) line = `${n} ${nm(id, n)} into the larder.`; }
    else if (k === "syrup") line = makeSyrup(F);
    else if (k === "take") { const kk = kitchenState(F); if ((kk.larder[id] || 0) > 0) { kk.larder[id]--; if (kk.larder[id] <= 0) delete kk.larder[id]; F.inv = F.inv || {}; F.inv[id] = (F.inv[id] || 0) + 1; line = `One ${nm(id, 1)} back in your backpack.`; } }
    else if (k === "sendall") { const moved = backpackGoods(F).map(x => [x, sendToKitchen(F, x)]).filter(([, n]) => n); if (moved.length) line = `Brought in ${moved.map(([x, n]) => `${n} ${nm(x, n)}`).join(", ")}.`; }
    else if (k === "bake") line = bake(F); else if (k === "loaves") line = takeLoaves(F);
    else if (k === "press") line = pressCheese(F); else if (k === "cheese") line = takeCheese(F);
    else if (k === "dish") line = cookDish(F, id);
    else if (k === "tapas") line = chooseTapas(F, id, api.today);
    else if (k === "untapas") line = dropTapas(F, id, api.today);
    else if (k === "cooktapas") line = cookTapas(F, api.today, id);
    else if (k === "plantapas") line = planTapas(F, id, nextDay(api.today));
    else if (k === "keep") { const n = setKeep(F, id, +b.dataset.n); api.save(); api.rerender(); return; }
    else if (k === "pilarno") { const kk = kitchenState(F); if (kk.pilarNo[id]) delete kk.pilarNo[id]; else kk.pilarNo[id] = true; api.save(); api.rerender(); return; }
    if (line) { api.sfx(k === "send" || k === "sendall" ? "paper" : "chime"); api.say(line); api.save(); }
    api.rerender();
  });
}
