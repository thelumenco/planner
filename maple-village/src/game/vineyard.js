// The vineyard (east of home): grow grapes on trellised vines, ferment them in barrels (set it and walk away),
// bottle and name the wines, stock the wine shop's shelves. Villagers buy now and then and leave coins in the
// honesty box; standing behind the counter brings more customers. How busy it gets follows the village's routines
// (evenings and weekends are busiest; villagers dropping in for a tasting add more). State lives in the game save
// (F.vine). Times are real time, so things grow and ferment while Mel is away.
import { lunchNow, seatedAt } from "./lunch.js";
import { esc, plain, H, now } from "../util.js";
import { NPCS } from "../data/npcs.js";
import { ITEMS } from "../data/items.js";
import { eventNow, wineClubNow, aperitivoNow, discoNow } from "./tours.js";
import { icon } from "../art/icons.js";
import { DISHES, TAPAS, tapasPrice } from "./kitchen.js";
import { bikeOwned, DELIVERY, deliveryHours } from "./scoop.js";
import { occasionNow, OCC, weddingCases } from "./occasions.js";
import { mulledSeason, sellCup, mullState } from "./mulled.js";
import { vineCloseup, barrelPic, stageStrip, bottleArt, glassArt, stallIcon, dishArt, oliveArt } from "../art/wine.js";
import { agedCoins } from "./secret.js";

export const GROW = 8*H;                                     // a watered vine ripens in 8 hours
// Fermenting is a once-a-day rhythm: fill a barrel one evening, bottle it the next day (finishing quests speeds it up).
export const STYLES = {red: {n: "Red", grape: "red", dur: 10*H, price: 18, col: "#7A1F3D"}, rose: {n: "Rosé", grape: "red", dur: 6*H, price: 15, col: "#E98AA0"},
  white: {n: "White", grape: "white", dur: 8*H, price: 16, col: "#E8D57A"}, sparkling: {n: "Sparkling", grape: "white", dur: 8*H, dur2: 5*H, price: 26, col: "#F3E7B0"},
  // round 107: from Rafael's cuttings in Ronda. A deep Spanish red: longer in the barrel, dearer on the shelf
  tempranillo: {n: "Tempranillo", grape: "tempranillo", dur: 12*H, price: 28, col: "#5A1630"},
  // round 145: from Kel's cuttings in Bellbird Valley. A light, cherry-ish Pinot Noir and a buttery Chardonnay
  pinot: {n: "Pinot Noir", grape: "pinot", dur: 11*H, price: 24, col: "#8A2E3E"}, chardonnay: {n: "Chardonnay", grape: "chardonnay", dur: 9*H, price: 22, col: "#E8C96A"},
  // round 272: the monks' own grape, found alive behind the old press on the lower vineyard (Marco's story)
  priory: {n: "Priory Red", grape: "priory", dur: 13*H, price: 30, col: "#4A1B2E"}};
// the grapes Mel can grow (Tempranillo once she's brought cuttings home from Ronda)
export const grapeKinds = v => ["red", "white", ...(v.tempra ? ["tempranillo"] : []), ...(v.pinot ? ["pinot"] : []), ...(v.chard ? ["chardonnay"] : []), ...(v.priory ? ["priory"] : [])];
const GRAPE_N = {red: "Red", white: "White", tempranillo: "Tempranillo", pinot: "Pinot Noir", chardonnay: "Chardonnay", priory: "Priory Red"};
const FLAG = {tempranillo: "tempra", pinot: "pinot", chardonnay: "chard", priory: "priory"};
const gName = k => k === "red" || k === "white" ? k : GRAPE_N[k];
export const hasGrape = (v, k) => !FLAG[k] || !!v[FLAG[k]];
export function addCuttings(F, kind, n){ const v = vineState(F); v.cuttings[kind] = (v.cuttings[kind] || 0) + n; if (FLAG[kind]) v[FLAG[kind]] = true; }
export const SHOP = {cut_red: {n: "Red grape vine", price: 20, say: "A red grape cutting. Plant it on a trellis."}, cut_white: {n: "White grape vine", price: 20, say: "A white grape cutting. Plant it on a trellis."},
  grove: {n: "Olive grove (4 trees)", price: 300, needs: "olive", say: "Four young olive trees, planted in a neat row along the top terrace. Twelve more jars every picking."},
  grove2: {n: "Second grove row (4 more trees)", price: 500, needs: "grove", say: "Four more olive trees along the top terrace. Twice the olives from the grove, every picking."},
  olive: {n: "Olive tree", price: 150, say: "An olive tree, planted by the path. Olives in about six hours."}, trellis: {n: "Trellis (one row)", price: 80, say: "A new trellis row, ready for three vines."}, barrel: {n: "Oak barrel", price: 150, say: "Another barrel for the cellar."}, terrace: {n: "Shop terrace", price: 600, say: "Tables and a vine-covered pergola outside the wine shop. More people stop for a glass."}};
const BUNCHES = 3, PER_BATCH = 3, BOTTLES = 6, GLASSES = 5;
// the tapas of the day (round 108: up to three a day): v.tapasList = [{day, id, plates, cooked}]
export const tapasOn = (v, day) => (v.tapasList || []).filter(t => t && t.day === day && TAPAS[t.id]);
export const platesLeft = v => Object.values(v.menu || {}).reduce((a, n) => a + n, 0) + (v.tapasList || []).reduce((a, t) => a + (t.plates || 0), 0);
// the olive tree (bought at the stall, planted by the path): ripe every 8 hours, two jars of olives a picking
export const OLIVE = 6*H;   // (round 154, Mel: "not enough": every six hours now, and more a picking)
export const oliveRipe = v => !!v.olive && Date.now() - (v.olive.pickedAt || v.olive.planted) >= OLIVE;
// round 110: the olive grove (four more trees along the top terrace, bought at the stall), ripe on the same 8 hours,
// eight jars a picking. Marco and Ines pick the tree and the grove on their shifts (with the grapes) into the olive
// crate (v.oliveCrate), which Mel empties into her backpack at the grove, or the mill takes from directly.
export const GROVE_JARS = 12, TREE_JARS = 3;
export const groveRipe = v => !!v.grove && Date.now() - (v.grove.pickedAt || v.grove.planted) >= OLIVE;
export function pickGrove(F){ const v = vineState(F); if (!groveRipe(v)) return null; v.grove.pickedAt = Date.now(); F.inv = F.inv || {}; F.inv.olives = (F.inv.olives || 0) + GROVE_JARS*(v.grove2 ? 2 : 1); return `${GROVE_JARS} jars of olives from the grove, into your backpack.`; }
export function takeOliveCrate(F){ const v = vineState(F), n = v.oliveCrate || 0; if (!n) return null; v.oliveCrate = 0; F.inv = F.inv || {}; F.inv.olives = (F.inv.olives || 0) + n; return `${n} jar${n > 1 ? "s" : ""} of olives from the crate, into your backpack.`; }
export const ROWS = 7;   // three on the vineyard, four on the lower vineyard (round 261)
const UPPER_ROWS = 3;
// round 282 (Mel: "Make it such that the lower vineyard is actually Bram's and he's been looking to sell. So I buy from
// him"): the four rows down the hill were Bram's father's. Bram can't keep them and the light both, so there's a For
// Sale sign by the gate; until you buy, no trellis goes down there. His father's old posts in the first row come with it.
export const LOWER = {price: 2500};
export const lowerOwned = F => !!vineState(F).lower;
export function buyLower(F, day){
  const v = vineState(F); if (v.lower) return {line: "The lower vineyard's yours already."};
  if ((F.coins || 0) < LOWER.price) return {line: `Bram's asking ${LOWER.price.toLocaleString("en-GB")} coins for the lower vineyard.`};
  F.coins -= LOWER.price; v.lower = day; v.rows[UPPER_ROWS].trellis = true;
  return {ok: true, line: "Bram walks down from the lighthouse to shake on it, and pulls up the For Sale sign himself. \"Father's old trellis is still good on the first row. The rest is yours to plant. He'd be glad to see vines on it again.\""};
}
export function lowerSalePanel(F){
  const v = vineState(F), h = `<span class="tape gingham" aria-hidden="true"></span><h2>For Sale: the lower vineyard</h2>`;
  if (v.lower) return h + `<p class="sub">The sign's gone. The lower vineyard's yours.</p><div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
  return h + `<p class="sub">A note in a careful hand is pinned under the sign, in a plastic sleeve against the weather:</p>
    <p class="sub"><i>"Four rows of good south-facing slope, down to the sea, with the old stone press and the bench. My father planted vines here and tended them every morning after he came down from the light. I'm up there all night now and asleep half the day, and the rows have gone to grass. I'd like them to go to someone who'll plant them. ${LOWER.price.toLocaleString("en-GB")} coins. Ask at the lighthouse. Bram."</i></p>
    <div class="actions"><button class="btn primary" data-lvbuy="1"${(F.coins || 0) < LOWER.price ? " disabled" : ""}>Buy it from Bram (${LOWER.price.toLocaleString("en-GB")} coins)</button><button class="btn alt small" data-close="1">Not yet</button></div>`;
}
export function vineState(F){
  F.vine = F.vine || {};
  const v = F.vine;
  v.rows = v.rows || [0, 1, 2].map(i => ({trellis: i === 0, vines: [null, null, null]}));
  while (v.rows.length < ROWS) v.rows.push({trellis: false, vines: [null, null, null]});   // round 261: four more down on the lower vineyard
  if (v.lower === undefined) v.lower = v.rows.slice(UPPER_ROWS).some(r => r.trellis) ? "before" : false;   // round 282: a save already planting down there owns it
  v.cuttings = v.cuttings || {red: 1, white: 1}; v.grapes = v.grapes || {red: 0, white: 0}; v.keep = v.keep || {red: 0, white: 0};
  v.barrels = v.barrels || [null]; v.cellar = v.cellar || []; v.shelf = v.shelf || []; v.box = v.box || 0; v.sold = v.sold || 0; v.glasses = v.glasses || 0; v.menu = v.menu || {}; v.plates = v.plates || 0; v.fruit = v.fruit || {};
  v.help = Object.assign({cook: true, pick: true, barrels: true, stock: true, fetch: false}, v.help || {}); v.names = v.names || {};
  ["tempranillo", "pinot", "chardonnay", "priory"].forEach(k => { v.cuttings[k] = v.cuttings[k] || 0; v.grapes[k] = v.grapes[k] || 0; v.keep[k] = v.keep[k] || 0; });
  if (v.tapas) { v.tapasList = [v.tapas]; delete v.tapas; }   // (saves from before round 108 had one tapas a day)
  v.tapasList = v.tapasList || [];
  v.lastTick = v.lastTick || Date.now(); v.today = v.today || {day: "", bottles: 0, glasses: 0, coins: 0};
  return v;
}
// Mel can rename both (in the staff card at the shop counter); these are the names everything shows
export const vineyardName = F => (F.vine && F.vine.names && F.vine.names.vineyard) || "The vineyard";
export const shopName = F => (F.vine && F.vine.names && F.vine.names.shop) || "The wine shop";
export function rename(F, which, name){ const v = vineState(F), n = plain(String(name || "")).trim().slice(0, 28); if (n) v.names[which] = n; else delete v.names[which]; }
// The staff: what each of them takes off Mel's hands (each can be switched off in the staff card)
export const HELP = [["pick", "Marco and Ines pick ripe grapes", "and water the vines again, as before"], ["barrels", "Marco fills empty barrels", "red grapes become red wine, white grapes white; you still name and bottle them"],
  ["stock", "Celeste stocks the shelves", "bottles go from the cellar to the shop when she's on"], ["cook", "Pilar runs the kitchen", "oven, cheese press, the tapas of the day and small plates, from what's in the larder"],
  ["fetch", "Pilar takes kitchen goods from my backpack", "crops, eggs, milk, flour, cheese and olives go straight to the larder (Maple keeps her treats)"]];
// Finishing a quest moves the vineyard and kitchen on too: ripening vines, fermenting barrels, the oven and the
// cheese press each jump ahead by `ms` (the garden gets the same boost in core).
export function questBoost(F, ms){
  const v = vineState(F); let n = 0;
  v.rows.forEach(row => row.vines.forEach(vn => { if (vn && vn.wateredAt && growth(vn) < 1) { vn.wateredAt -= ms; n++; } }));
  v.barrels.forEach(b => { if (b && barrelLeft(b)) { b.start -= ms; n++; } });
  const k = F.kitchen || {}; [k.oven, k.press].forEach(t => { if (t && t.start + t.dur > Date.now()) { t.start -= ms; n++; } });
  return n;
}
export const growth = vn => vn && vn.wateredAt ? Math.min(1, (Date.now() - vn.wateredAt)/GROW) : 0;
export const barrelLeft = b => b ? Math.max(0, b.start + b.dur - Date.now()) : 0;
export const shelfStock = v => v.shelf.reduce((n, s) => n + s.n, 0);

/* ---------- actions (return a line for Maple, or null) ---------- */
// round 152 (Mel: "3 is too few"): up to six in the barrel shed (the second 150, then 75 more each: 450 for the sixth),
// and once the cellar door's open, twelve more on its barrel racks (250 each)
export const BARRELS = {shed: 6, cellar: 12, cellarPrice: 250};
export const maxBarrels = F => BARRELS.shed + (F && F.goals && F.goals.cellar ? BARRELS.cellar : 0);
export const shopPrice = (v, id) => id === "barrel" ? (v.barrels.length >= BARRELS.shed ? BARRELS.cellarPrice : 150 + 75*Math.max(0, v.barrels.length - 1)) : SHOP[id].price;
export function buy(F, id){
  const v = vineState(F), it = SHOP[id], price = it ? shopPrice(v, id) : 0; if (!it || F.coins < price) return null;
  if (id === "terrace") { if (v.terrace) return "The terrace is already out front."; v.terrace = true; }
  else if (id === "olive") { if (v.olive) return "You've an olive tree already. One's plenty."; v.olive = {planted: Date.now(), pickedAt: 0}; }
  else if (id === "grove") { if (v.grove) return "The grove's already planted."; if (!v.olive) return "Plant the first olive tree by the path, then the grove."; v.grove = {planted: Date.now(), pickedAt: 0}; }
  else if (id === "grove2") { if (v.grove2) return "Both grove rows are planted."; if (!v.grove) return "Plant the first grove row, then the second."; v.grove2 = Date.now(); }
  else if (id === "trellis") { const k = v.rows.findIndex((x, i) => !x.trellis && (i < UPPER_ROWS || v.lower)); if (k < 0) return v.lower ? "Every row has a trellis already, up top and down the hill." : "All three rows up here have trellises. The rows down the hill are Bram's: there's a For Sale sign by the gate."; v.rows[k].trellis = true;
    if (k >= 3) { F.coins -= price; return "A new trellis row on the lower vineyard, down the hill, ready for three vines."; } }
  else if (id === "barrel") { if (v.barrels.length >= maxBarrels(F)) return v.barrels.length >= BARRELS.shed + BARRELS.cellar ? "Every rack's full: eighteen barrels, six in the shed and twelve in the cellar." : "The shed's full: six barrels. Open the cellar door and its racks take twelve more.";
    v.barrels.push(null); if (v.barrels.length > BARRELS.shed) { F.coins -= price; return "Another oak barrel, rolled down onto the racks in the cellar."; } }
  else v.cuttings[id === "cut_red" ? "red" : "white"]++;
  F.coins -= price; return it.say;
}
export function plantVine(F, r, i, kind){
  const v = vineState(F), row = v.rows[r]; if (!row || !row.trellis || row.vines[i] || !(v.cuttings[kind] > 0)) return null;
  v.cuttings[kind]--; row.vines[i] = {v: kind, planted: Date.now(), wateredAt: null}; return `A ${gName(kind)} vine, planted. Give it some water.`;
}
// dig a vine up (round 147, Mel): the cutting goes back in the box to plant somewhere else (another kind can go in
// its place); if it was ripe, its grapes are picked first
export function uprootVine(F, r, i){
  const v = vineState(F), row = v.rows[r], vn = row && row.vines[i]; if (!vn) return null;
  const ripe = growth(vn) >= 1 ? BUNCHES : 0; if (ripe) v.grapes[vn.v] += ripe;
  v.cuttings[vn.v] = (v.cuttings[vn.v] || 0) + 1; row.vines[i] = null;
  return `You dig the ${gName(vn.v)} vine up carefully, roots and all, and wrap it in damp sacking: the cutting's back in the box to plant again.${ripe ? ` (You picked its ${ripe} ripe bunches first.)` : ""}`;
}
export function waterVines(F, r){ const v = vineState(F), row = v.rows[r]; let n = 0; (row ? row.vines : []).forEach(vn => { if (vn && !vn.wateredAt) { vn.wateredAt = Date.now(); n++; } }); return n ? `Watered ${n} vine${n > 1 ? "s" : ""}. Ripe in about six hours.` : null; }
export function harvestVine(F, r, i, opts = {}){
  const v = vineState(F), vn = v.rows[r] && v.rows[r].vines[i]; if (!vn || growth(vn) < 1) return null;
  const n = BUNCHES + (opts.harvest ? 1 : 0);   // the autumn grape harvest: an extra bunch from every vine
  v.grapes[vn.v] += n; vn.wateredAt = null; return `${n} bunches of ${vn.v} grapes!${opts.harvest ? " Harvest week!" : ""} Water the vine again and it'll fruit again.`;
}
export function fillBarrel(F, slot, style){
  const v = vineState(F), st = STYLES[style]; if (!st || v.barrels[slot] || v.grapes[st.grape] < PER_BATCH) return null;
  v.grapes[st.grape] -= PER_BATCH; v.barrels[slot] = {style, start: Date.now(), dur: st.dur, stage: 1};
  return `Into the barrel. It'll be ready in about ${Math.round(st.dur/H)} hours. Off you go, it doesn't need you.`;
}
export function secondFerment(F, slot){ const v = vineState(F), b = v.barrels[slot]; if (!b || b.style !== "sparkling" || b.stage !== 1 || barrelLeft(b)) return null; b.stage = 2; b.start = Date.now(); b.dur = STYLES.sparkling.dur2; return "Second fermentation for the bubbles. Two more hours."; }
// suggested names for a barrel (like the ice cream flavours and bonbons): places and moments from the village, the
// family, and a few in French, matched to the style. Each barrel gets its own list; ones already in the cellar or on
// the shelves are skipped. k picks the next suggestion.
const W_PLACE = ["Jetty Sunset", "Dolphin Bay", "Lantern Night", "Low Tide", "Sea Breeze", "Golden Hour", "Swan Lake", "Porch Swing", "First Light", "Rainy Window", "Orchard Hill", "Wildflower", "Night Market", "Paddleboard", "Harvest Moon", "Morning Mist", "Kite Day", "Sunday Picnic", "Firefly", "Boardwalk", "Lighthouse", "Monsoon", "Frangipani", "Hammock"];
const W_WHO = ["Maple's", "Evan's", "Ma Ma's", "Gong Gong's", "Ah Gong's", "Ah Ma's", "Darren's", "Marco's", "Ines's", "Grandpa's Porch"];
const W_WORD = {priory: ["Priory Red", "Vinum Prioris", "Brothers' Red", "Old Root"], pinot: ["Pinot", "Pinot Noir", "Reserve", "Cherry Hill"], chardonnay: ["Chardonnay", "Chardy", "Golden", "Reserve"], tempranillo: ["Tempranillo", "Reserva", "Crianza", "Tinto"], red: ["Red", "Reserve", "Rouge", "Old Vine"], rose: ["Rosé", "Blush", "Pink"], white: ["White", "Blanc", "Crisp"], sparkling: ["Bubbles", "Fizz", "Brut", "Sparkle"]};
const W_FR = {priory: ["The Priory Vine", "Monks' Hill", "Lower Press"], pinot: ["Bellbird Ridge", "Gum Creek Pinot", "Kel's Row"], chardonnay: ["Wattle Hill", "Balloon Lookout", "Riverside Chardonnay"], tempranillo: ["Puente Nuevo", "Tajo Reserva", "Viña Ronda", "Bodega Maple"], red: ["Château Maple", "Clos de la Baie", "Domaine du Lac", "Grand Cru Evan"], rose: ["Rosé de la Jetée", "Vie en Rose", "Clos des Cygnes"], white: ["Blanc de la Baie", "Domaine des Lanternes", "Clos du Matin"], sparkling: ["Cuvée Maple", "Crémant de la Baie", "Pétillant du Lac"]};
export function wineNames(F, slot){
  const v = vineState(F), b = v.barrels[slot]; if (!b) return [];
  const used = new Set([...v.cellar, ...v.shelf].map(x => x.name.toLowerCase())), st = b.style, seed = Math.floor(b.start || 0) + slot*7919, out = [];
  for (let k = 0; out.length < 12 && k < 200; k++) {
    const kind = k % 3, w = W_WORD[st][(seed + k) % W_WORD[st].length];
    const nm = kind === 0 ? `${W_PLACE[(seed + k*5) % W_PLACE.length]} ${w}` : kind === 1 ? `${W_WHO[(seed + k*3) % W_WHO.length]} ${W_PLACE[(seed + k*7 + 3) % W_PLACE.length]}` : W_FR[st][(seed + k) % W_FR[st].length] + (k > 8 ? ` ${new Date().getFullYear()}` : "");
    if (!used.has(nm.toLowerCase()) && !out.includes(nm)) out.push(nm);
  }
  return out;
}
export function bottle(F, slot, name){
  const v = vineState(F), b = v.barrels[slot]; if (!b || barrelLeft(b) || (b.style === "sparkling" && b.stage !== 2)) return null;
  const nm = plain(String(name || "")).trim().slice(0, 30) || wineNames(F, slot)[0] || `Maple's ${STYLES[b.style].n}`;
  v.cellar.push({id: "w" + Date.now().toString(36), name: nm, type: b.style, n: BOTTLES}); v.barrels[slot] = null;
  return `${BOTTLES} bottles of ${nm}, into the cellar. Stock them on the shop shelves.`;
}
// The riddling rack (round 144, once Jono's shown Mel how in Bellbird Valley's barrel cave): sparkling laid on it in
// the cellar is turned a little every day, and comes off clearer and finer: 2 coins more a bottle for every day on
// the rack, up to five days. (It stays on the rack, not auto-stocked, till Mel stocks it herself.)
export const RIDDLE = {day: 2, max: 5};
export const riddleDays = (c, now = Date.now()) => c && c.rack ? Math.min(RIDDLE.max, Math.floor((now - c.rack)/(24*H))) : 0;
export const canRiddle = F => !!(F.bellbird && F.bellbird.riddle);
export function onRack(F, id){ const c = vineState(F).cellar.find(x => x.id === id); if (!c || c.type !== "sparkling" || c.rack || !canRiddle(F)) return null; c.rack = Date.now(); return c; }
const bottlePrice = c => STYLES[c.type].price + RIDDLE.day*riddleDays(c) + agedCoins(c.type, c.aged);
export function stock(F, id){ const v = vineState(F), c = v.cellar.find(x => x.id === id); if (!c) return null;
  const s = v.shelf.find(x => x.id === id); if (s) s.n += c.n; else v.shelf.push({id: c.id, name: c.name, type: c.type, n: c.n, price: bottlePrice(c), open: 0});   // round 244: + what it gained resting in the cave (10% of the style's price a week)
  v.cellar = v.cellar.filter(x => x.id !== id); return `${c.name} is on the shelves.`; }
// round 243 (Mel: "space for stocking wines I don't want to put on shelves yet"): the cellar is the store. A wine
// kept back stays down here (Celeste won't stock it); bottles can come back down off the shelves too.
export function hold(F, id, on){ const c = vineState(F).cellar.find(x => x.id === id); if (!c) return null; c.hold = !!on; return c; }
export function unstock(F, id){ const v = vineState(F), s = v.shelf.find(x => x.id === id); if (!s || s.n < 1) return null;
  const c = v.cellar.find(x => x.id === id); if (c) { c.n += s.n; c.hold = true; } else v.cellar.push({id: s.id, name: s.name, type: s.type, n: s.n, hold: true});
  const n = s.n; s.n = 0; if (!s.open) v.shelf = v.shelf.filter(x => x !== s); return `${n} bottle${n === 1 ? "" : "s"} of ${s.name}, back down to the cellar.`; }
// round 251 (Mel: wine as an ice cream ingredient): a bottle from the cellar goes in the backpack as a cooking wine for
// the Scoop Shack's fridge. Grown-up flavours: Evan gets something else.
export const KITCHEN_WINE = {priory: "wine_red", red: "wine_red", pinot: "wine_red", tempranillo: "wine_red", rose: "wine_rose", white: "wine_white", chardonnay: "wine_white", sparkling: "wine_sparkling"};
Object.assign(ITEMS, {
  wine_red: {n: "Bottle of your red, for the kitchen", kind: "ingredient", price: 18, sell: 12, art: ["bottle", "#7A1F3D", "#F3E7C8"], what: "red wine gelato at the Scoop Shack (try it with dark chocolate)"},
  wine_rose: {n: "Bottle of your rosé, for the kitchen", kind: "ingredient", price: 15, sell: 10, art: ["bottle", "#E98AA0", "#F3E7C8"], what: "a pink rosé sorbet at the Scoop Shack"},
  wine_white: {n: "Bottle of your white, for the kitchen", kind: "ingredient", price: 16, sell: 10, art: ["bottle", "#E8D57A", "#F3E7C8"], what: "a white wine sorbet at the Scoop Shack (lovely with peach)"},
  wine_sparkling: {n: "Bottle of your sparkling, for the kitchen", kind: "ingredient", price: 26, sell: 16, art: ["bottle", "#F3E7B0", "#2E3A34"], what: "a sparkling sorbet at the Scoop Shack (with lemon)"}
});
export function toKitchen(F, id){ const v = vineState(F), c = v.cellar.find(x => x.id === id), k = c && KITCHEN_WINE[c.type]; if (!k || c.n < 1) return null;
  c.n--; if (!c.n) v.cellar = v.cellar.filter(x => x !== c); F.inv = F.inv || {}; F.inv[k] = (F.inv[k] || 0) + 1; return `A bottle of ${c.name} into your backpack, for the Scoop Shack's fridge.`; }
export function cellarPanel(F){
  const v = vineState(F), down = v.barrels.length - BARRELS.shed;
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>The cellar</h2><p class="sub">Cool, dark and quiet: wine waits down here until you want it upstairs. Anything you keep back stays here, and Celeste leaves it alone.</p>`;
  h += `<p class="eyebrow">In the cellar</p>` + (v.cellar.length ? `<ul class="hlist wlist">${v.cellar.map(c => `<li style="flex-wrap:wrap"><span class="wpic">${bottleSVG(c.type)}</span><span class="wtxt"><b>${esc(c.name)}</b><small>${STYLES[c.type].n} · ${c.n} bottle${c.n === 1 ? "" : "s"}${c.hold ? " · kept back" : ""}${c.rack ? " · on the riddling rack" : ""}</small></span>
      <span class="orbtns" style="flex-basis:100%;display:flex;flex-wrap:wrap;gap:6px;justify-content:flex-end"><button class="btn small primary" data-vystock="${c.id}">To the shelves</button><button class="btn small alt" data-vyhold="${c.id}" data-on="${c.hold ? 0 : 1}">${c.hold ? "Let Celeste stock it" : "Keep it here"}</button><button class="btn small alt" data-vykitchen="${c.id}">A bottle for the ice cream</button></span></li>`).join("")}</ul>` : `<p class="muted">Nothing down here just now. Bottled wine comes here first.</p>`);
  const up = v.shelf.filter(s => s.n > 0);
  if (up.length) h += `<p class="eyebrow">Upstairs on the shelves</p><ul class="hlist wlist">${up.map(s => `<li><span class="wpic">${bottleSVG(s.type)}</span><span class="wtxt"><b>${esc(s.name)}</b><small>${s.n} on the shelf</small></span><button class="btn small alt" data-vyunstock="${s.id}">Back down</button></li>`).join("")}</ul>`;
  const max = maxBarrels(F), p = shopPrice(v, "barrel");
  h += `<p class="eyebrow">Barrel racks</p><p class="muted">${Math.max(0, down)} of ${BARRELS.cellar} barrels on the racks down here, plus ${Math.min(v.barrels.length, BARRELS.shed)} in the shed. Tap the racks to fill or bottle them.</p>`;
  if (v.barrels.length < max) h += `<div class="actions"><button class="btn small ${F.coins >= p ? "primary" : "alt"}" data-vybuy="barrel" ${F.coins >= p ? "" : "disabled"}>Another barrel · ${p} coins</button></div>`;
  return h + `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
}
// Pricier bottles sell less often (and cheaper ones a little more), like the Scoop Shack and the Cocoa Room: each
// style's usual price is the sweet spot. Glasses are a quarter of the bottle price and follow it.
export const winePf = s => Math.min(1.6, Math.pow(((STYLES[s.type] || {}).price || 18)/Math.max(2, s.price || 1), 1.3));
export function setPrice(F, id, p){ const s = vineState(F).shelf.find(x => x.id === id); if (s) s.price = Math.max(1, Math.min(999, Math.round(p) || 1)); }
export function collect(F){ const v = vineState(F), n = v.box; if (!n) return 0; F.coins += n; v.box = 0; return n; }

/* ---------- the shop's customers, and the workers ---------- */
// Who's where at a given moment, from the villagers' routines: the shop assistant on shift, villagers in for a
// tasting, the vineyard hands at work.
const WORKERS = ["marco", "ines"], STAFF = "celeste";
function whoAt(at){
  const d = new Date(at + 8*H), hm = d.getUTCHours()*60 + d.getUTCMinutes(), we = [0, 6].includes(d.getUTCDay()), dw = d.getUTCDay();
  const out = {staff: false, visitors: 0, workers: false};
  for (const n of NPCS) { const s = n.routine.find(x => hm >= x.from && hm < x.to && (!x.days || (x.days === "we") === we) && (!x.dow || x.dow.includes(dw))); if (!s) continue;
    if (n.id === STAFF) out.staff = out.staff || s.scene === "wineshop";
    else if (WORKERS.includes(n.id) && s.scene === "vineyard") out.workers = true;
    else if (s.scene === "wineshop" || s.scene === "vineyard") out.visitors++; }
  return out;
}
// busier in the evening and at weekends, and with villagers about; open 10am to 10pm
function footfall(hm, weekend, visitors){ return (hm >= 17*60 && hm < 21*60 ? 2 : hm >= 12*60 && hm < 14*60 ? 1.3 : 1) * (weekend ? 1.5 : 1) * (1 + .4*visitors); }
// Simulates the minutes since the last tick (up to 12 hours): customers buying (into the honesty box, or straight
// to Mel while she's serving behind the counter), and the vineyard hands watering thirsty vines while on shift.
// -> {bottles, glasses, coins, toBox, watered, mins} or null when nothing happened
// One plate for a customer: the tapas of the day first (65% of the time, on its own day), else a small plate
function servePlate(v, gameDay, out){
  const taps = tapasOn(v, gameDay).filter(t => t.plates > 0);
  if (taps.length && Math.random() < .65) { const t = taps[Math.floor(Math.random()*taps.length)]; t.plates--; out.plates++; out.tapas = (out.tapas || 0) + 1; out.coins += tapasPrice(t.id, gameDay); out.dish = "tapas:" + t.id; return; }
  const live = Object.keys(v.menu).filter(id => v.menu[id] > 0 && DISHES[id]); if (!live.length) return; const id = live[Math.floor(Math.random()*live.length)];
  v.menu[id]--; if (!v.menu[id]) delete v.menu[id]; out.plates++; out.coins += DISHES[id].price; out.dish = id;
}
// A villager who sits down in the tasting room while Mel's there orders straight away: a glass of whatever's open (a
// bottle from the shelf is opened if none is) and, 6 times in 10, a plate. Paid into the honesty box, or to Mel if
// she's serving. -> {glasses, plates, coins, wine (type), dish, opened} or null when there's nothing to pour
export function serveGuest(F, opts = {}){
  const v = vineState(F), s = v.shelf.find(x => x.open > 0) || v.shelf.find(x => x.n > 0); if (!s) return null;
  const out = {glasses: 1, plates: 0, coins: Math.max(1, Math.round(s.price/4)), wine: s.type, name: s.name, opened: !s.open};
  if (!s.open) { s.n--; s.open = GLASSES; } s.open--;
  if (Math.random() < .6) servePlate(v, opts.today, out);
  // out-of-towners often take a bottle home as a souvenir
  const b = opts.tourist && Math.random() < .5*winePf(s) && (v.shelf.find(x => x.id === s.id && x.n > 0) || v.shelf.find(x => x.n > 0));
  if (b) { b.n--; out.bottle = b.name; out.coins += b.price; v.sold++; out.bottles = 1; }
  v.shelf = v.shelf.filter(x => x.n > 0 || x.open > 0);
  if (opts.serving || opts.stall || opts.club) F.coins += out.coins; else v.box += out.coins;
  v.glasses++; v.plates += out.plates;
  const day = new Date(Date.now() + 8*H).toISOString().slice(0, 10); if (v.today.day !== day) v.today = {day, bottles: 0, glasses: 0, plates: 0, coins: 0};
  v.today.glasses++; v.today.plates = (v.today.plates || 0) + out.plates; v.today.coins += out.coins; v.today.bottles += out.bottles || 0;
  return out;
}
export function sellTick(F, opts = {}){
  const v = vineState(F), t = Date.now(), mins = Math.min(1440, Math.floor((t - v.lastTick)/60000)); if (mins < 1) return null;
  if (t - v.lastTick > 1440*60000) v.lastTick = t - 1440*60000;
  v.lastTick += mins*60000;
  const out = {bottles: 0, glasses: 0, plates: 0, coins: 0, toBox: !opts.serving, watered: 0, picked: 0, filled: 0, stocked: 0, mins};
  let w = null; const off = now() - t;   // the game clock (equal to real time outside tests)
  for (let k = mins; k > 0; k--) {
    const at = t - k*60000, d = new Date(at + off + 8*H), hm = d.getUTCHours()*60 + d.getUTCMinutes(), we = [0, 6].includes(d.getUTCDay());
    if (!w || k % 10 === 0 || k === 1) w = whoAt(at + off);
    if (w.workers) {
      if (v.help.pick) v.rows.forEach(row => row.trellis && row.vines.forEach(vn => { if (vn && vn.wateredAt && at - vn.wateredAt >= GROW) { const n = BUNCHES + (opts.harvest ? 1 : 0); v.grapes[vn.v] += n; vn.wateredAt = null; out.picked += n; } }));
      v.rows.forEach(row => row.trellis && row.vines.forEach(vn => { if (vn && !vn.wateredAt) { vn.wateredAt = at; out.watered++; } }));
      if (v.help.pick) { if (v.olive && at - (v.olive.pickedAt || v.olive.planted) >= OLIVE) { v.olive.pickedAt = at; v.oliveCrate = (v.oliveCrate || 0) + TREE_JARS; out.olives = (out.olives || 0) + TREE_JARS; }
        if (v.grove && at - (v.grove.pickedAt || v.grove.planted) >= OLIVE) { v.grove.pickedAt = at; const n = GROVE_JARS*(v.grove2 ? 2 : 1); v.oliveCrate = (v.oliveCrate || 0) + n; out.olives = (out.olives || 0) + n; } }
      if (v.help.barrels) v.barrels.forEach((b, i) => { if (b) return; const spare = c => v.grapes[c] - (v.keep[c] || 0) >= PER_BATCH, st = spare("priory") ? "priory" : spare("tempranillo") ? "tempranillo" : spare("pinot") ? "pinot" : spare("chardonnay") ? "chardonnay" : spare("red") ? "red" : spare("white") ? "white" : null;
        if (st) { v.grapes[st] -= PER_BATCH; v.barrels[i] = {style: st, start: at, dur: STYLES[st].dur, stage: 1}; out.filled++; } });
    }
    if (w.staff && v.help.stock && v.cellar.length) { out.stocked += v.cellar.filter(c => !c.rack && !c.hold).reduce((n, c) => n + c.n, 0); v.cellar.filter(c => !c.rack && !c.hold).forEach(c => stock(F, c.id)); }
    // the Sunday farmers market: the wine shop's stall at the field sells from these same shelves (Ines minds it;
    // standing at the stall yourself brings more people over, and they pay you)
    const ev = eventNow(new Date(at + off + 6*H).toISOString().slice(0, 10), hm);
    if (ev && ev.wine) { const st = opts.stall && k === 1 ? 3 : 1, stock = v.shelf.filter(x => x.n > 0);
      if (stock.length && Math.random() < .012*st) { const b = stock[Math.floor(Math.random()*stock.length)]; if (Math.random() < winePf(b)) { b.n--; out.bottles++; out.coins += b.price; out.market = (out.market || 0) + 1; } }
      if (Math.random() < .008*st) { const g = v.shelf.find(x => x.open > 0) || v.shelf.find(x => x.n > 0); if (g && Math.random() < winePf(g)) { if (!g.open) { g.n--; g.open = GLASSES; } g.open--; out.glasses++; out.coins += Math.max(1, Math.round(g.price/4)); out.market = (out.market || 0) + 1; } } }
    // the monthly wine club in the cellar door (first Friday, 6 to 9pm): members buy bottles and glasses off the same
    // shelves; with Mel there hosting they buy half as much again, and pay her
    if (F.goals && F.goals.cellar && wineClubNow(new Date(at + off + 6*H).toISOString().slice(0, 10), hm)) { const hst = opts.club && k === 1 ? 1.5 : 1, stock = v.shelf.filter(x => x.n > 0);
      if (stock.length && Math.random() < .04*hst) { const b = stock[Math.floor(Math.random()*stock.length)]; if (Math.random() < winePf(b)) { b.n--; out.bottles++; out.coins += b.price; out.club = (out.club || 0) + 1; } }
      if (Math.random() < .03*hst) { const g = v.shelf.find(x => x.open > 0) || v.shelf.find(x => x.n > 0); if (g && Math.random() < winePf(g)) { if (!g.open) { g.n--; g.open = GLASSES; } g.open--; out.glasses++; out.coins += Math.max(1, Math.round(g.price/4)); out.club = (out.club || 0) + 1; } } }
    // Saturday disco night in the cellar (round 140): a packed floor, thirsty dancers, bottles and glasses flying off
    // the shelves; with Mel there behind the tasting bar, half as much again
    if (F.goals && F.goals.cellar && discoNow(new Date(at + off + 6*H).toISOString().slice(0, 10), hm)) { const hst = opts.disco && k === 1 ? 1.5 : 1, stock = v.shelf.filter(x => x.n > 0);
      if (stock.length && Math.random() < .07*hst) { const b = stock[Math.floor(Math.random()*stock.length)]; if (Math.random() < winePf(b)) { b.n--; out.bottles++; out.coins += b.price; out.disco = (out.disco || 0) + 1; } }
      if (Math.random() < .09*hst) { const g = v.shelf.find(x => x.open > 0) || v.shelf.find(x => x.n > 0); if (g && Math.random() < winePf(g)) { if (!g.open) { g.n--; g.open = GLASSES; } g.open--; out.glasses++; out.coins += Math.max(1, Math.round(g.price/4)); out.disco = (out.disco || 0) + 1; } } }
    // the Sunday long lunch on the terrace (round 146, lunch.js): everyone who's booked and sat down orders whole
    // bottles (a pair gets through about one an hour, and they lean to the dearer bottles) and plates from the
    // kitchen; with Mel out there hosting, half as much again, they tip, and they pay her
    if (v.terrace) { const lday = new Date(at + off + 6*H).toISOString().slice(0, 10), seated = lunchNow(lday, hm) ? seatedAt(lday, hm) : 0;
      if (seated) { const host = opts.lunch && k === 1 ? 1.5 : 1, stock = v.shelf.filter(x => x.n > 0);
        if (stock.length && Math.random() < seated/2/60*host) { const w8 = stock.map(x => Math.pow(x.price, 1.5)), tot = w8.reduce((a, b) => a + b, 0); let r = Math.random()*tot, i = 0; while (r > w8[i] && i < stock.length - 1) { r -= w8[i]; i++; }
          const b = stock[i]; b.n--; out.bottles++; out.coins += b.price; out.lunchB = (out.lunchB || 0) + 1; if (opts.lunch) out.lunchTips = (out.lunchTips || 0) + Math.max(1, Math.round(b.price*.15)); }
        if (Math.random() < seated/60*.8*host) { const p0 = out.plates; servePlate(v, lday, out); if (out.plates > p0) out.lunchP = (out.lunchP || 0) + 1; } }
      // round 152: the terrace's other occasions (game/occasions.js): a wedding (sparkling by the case), trivia night,
      // sip and paint (glasses), Valentine's, Christmas lunch, New Year's Eve. Mel out there hosting: faster, and tips
      const oc = occasionNow(lday, hm);
      if (oc) { const host = opts.lunch && k === 1 ? 1.5 : 1, stock = v.shelf.filter(x => x.n > 0), fizz = oc.kind === "wedding" || oc.kind === "nye";
        // round 284: the couple's order, cases of sparkling straight from the cellar (kept-back ones too, not the
        // riddling rack), at the shelf price, once the wedding's begun; anything short comes off the shelves as before
        if (oc.kind === "wedding" && v.wedCases !== lday) { v.wedCases = lday; const want = weddingCases(lday)*BOTTLES; let took = 0;
          for (const c of v.cellar.filter(x => x.type === "sparkling" && !x.rack)) { const n = Math.min(c.n, want - took); if (n <= 0) break; c.n -= n; took += n; out.coins += n*bottlePrice(c); }
          v.cellar = v.cellar.filter(x => x.n > 0); if (took) { out.bottles += took; out.occB = (out.occB || 0) + took; out.cases = took; } }
        if (oc.glasses) { if (Math.random() < oc.guests/60*oc.drink*host) { const g = v.shelf.find(x => x.open > 0) || v.shelf.find(x => x.n > 0); if (g) { if (!g.open) { g.n--; g.open = GLASSES; } g.open--; out.glasses++; out.coins += Math.max(1, Math.round(g.price/4)); out.occB = (out.occB || 0) + 1; } } }
        else if (stock.length && Math.random() < oc.guests/2/60*oc.drink*host) { const w8 = stock.map(x => Math.pow(x.price, 1.5)*(fizz && x.type === "sparkling" ? 6 : 1)), tot = w8.reduce((a, b) => a + b, 0); let r = Math.random()*tot, i = 0; while (r > w8[i] && i < stock.length - 1) { r -= w8[i]; i++; }
          const b = stock[i]; b.n--; out.bottles++; out.coins += b.price; out.occB = (out.occB || 0) + 1; if (opts.lunch) out.lunchTips = (out.lunchTips || 0) + Math.max(1, Math.round(b.price*.15)); }
        if (oc.food && Math.random() < oc.guests/60*.5*host) { const p0 = out.plates; servePlate(v, lday, out); if (out.plates > p0) out.occP = (out.occP || 0) + 1; }
        if (mulledSeason(lday) && (F.mull || {}).cups > 0 && Math.random() < oc.guests/60*.25*host) { const c = sellCup(F); if (c) { out.coins += c; out.mulled = (out.mulled || 0) + 1; } }
        out.occ = oc.kind; } }
    if (hm < 10*60 || hm >= 22*60) continue;
    const onShelf = v.shelf.filter(s => s.n > 0), open = v.shelf.find(s => s.open > 0); const crate = Object.keys(v.fruit).filter(id => v.fruit[id] > 0);
    if (!onShelf.length && !open && !platesLeft(v) && !crate.length) continue;
    const food = Object.keys(v.menu).filter(id => v.menu[id] > 0 && DISHES[id]), tap = tapasOn(v, new Date(at + off + 6*H).toISOString().slice(0, 10)).some(t => t.plates > 0);
    const f = (aperitivoNow(new Date(at + off + 6*H).toISOString().slice(0, 10), hm) ? 1.6 : 1) * footfall(hm, we, w.visitors) * (opts.serving && k === 1 ? 3 : w.staff ? 2 : 1) * (tap ? 1.4 : food.length ? 1.25 : 1) * (v.terrace ? 1.3 : 1) * (F.goals && F.goals.cellar ? 1.15 : 1);   // the cellar door (a big goal) draws a few more visitors
    const gameDay = new Date(at + off + 6*H).toISOString().slice(0, 10);   // the game's day (it turns over at 2am)
    const apero = aperitivoNow(gameDay, hm); if (apero) out.apero = true;   // Friday aperitivo hour: busier, and everyone wants a plate
    const plate = () => servePlate(v, gameDay, out);
    // round 153: mulled wine by the cup, late November to Boxing Day, while there's some in the pot
    if (mulledSeason(gameDay) && (F.mull || {}).cups > 0 && Math.random() < .012*f) { const c = sellCup(F); if (c) { out.coins += c; out.mulled = (out.mulled || 0) + 1; } }
    // round 172: and at the Christmas market, Celeste ladling it out at the stall (busier than the shop counter)
    { const xm = eventNow(gameDay, hm); if (xm && xm.kind === "xmas" && (F.mull || {}).cups > 0 && Math.random() < .06) { const c = sellCup(F); if (c) { out.coins += c; out.mulled = (out.mulled || 0) + 1; out.mulledMkt = (out.mulledMkt || 0) + 1; } } }
    // a delivery order (round 137): with the Scoop Shack's bike, Tomo takes tapas, small plates and a bottle round to
    // people's homes and picnics (the field, the woods, the foreshore), plus a delivery fee
    if (bikeOwned(F) && deliveryHours(hm) && Math.random() < DELIVERY.winery) { const c0 = out.coins, p0 = out.plates, bits = [];
      for (let i = Math.random() < .45 ? 2 : 1; i > 0; i--) { const d0 = out.plates; plate(); if (out.plates > d0) bits.push(out.dish); }
      if (onShelf.length && (Math.random() < .3 || !bits.length)) { const s = onShelf[Math.floor(Math.random()*onShelf.length)]; if (s.n > 0) { s.n--; out.bottles++; out.coins += s.price; bits.push("bottle"); } }
      if (bits.length) { out.coins += DELIVERY.fee; const dish = id => id === "bottle" ? "a bottle of wine" : /^tapas:/.test(id) ? (TAPAS[id.slice(6)] || {n: "tapas"}).n.toLowerCase() : (DISHES[id] || {n: "a small plate"}).n.toLowerCase();
        (out.orders = out.orders || []).push({shop: "winery", coins: out.coins - c0, picnic: Math.random() < .45, what: bits.map(dish).join(" and ")}); out.deliv = (out.deliv || 0) + 1; if (F.scoop) F.scoop.bikeOut = at + off; } }
    if (onShelf.length && Math.random() < .002*f) { const s = onShelf[Math.floor(Math.random()*onShelf.length)]; if (Math.random() < winePf(s)) { s.n--; out.bottles++; out.coins += s.price; } }
    if (Math.random() < .0016*f) { // a glass in the tasting room, poured from an open bottle (a fresh one is opened when needed)
      const s = v.shelf.find(x => x.open > 0) || v.shelf.find(x => x.n > 0); if (s && Math.random() < winePf(s)) { if (!s.open) { s.n--; s.open = GLASSES; } s.open--; out.glasses++; out.coins += Math.max(1, Math.round(s.price/4)); if (Math.random() < (apero ? .9 : .6)) plate(); } }
    if (Math.random() < (apero ? .005 : .0016)*f) plate();   // someone pops in just for a bite (round 112: a bit more often, and lots more at aperitivo hour)
    if (crate.length && Math.random() < .0018*f) { const id = crate[Math.floor(Math.random()*crate.length)]; v.fruit[id]--; if (!v.fruit[id]) delete v.fruit[id]; out.fruit = (out.fruit || 0) + 1; out.coins += (ITEMS[id] && ITEMS[id].sell) || 3; }   // fruit from Ma Ma's orchard
  }
  v.shelf = v.shelf.filter(s => s.n > 0 || s.open > 0);
  if (!out.coins && !out.plates && !out.watered && !out.picked && !out.filled && !out.stocked && !out.olives) return null;
  v.plates += out.plates;
  if (opts.serving && out.apero && out.coins) { out.tips = Math.max(1, Math.round(out.coins*.2)); out.coins += out.tips; }   // serving at aperitivo hour: people tip
  if (out.lunchTips) { out.tips = (out.tips || 0) + out.lunchTips; out.coins += out.lunchTips; }   // hosting the Sunday lunch: the tables tip
  if (opts.serving || opts.lunch) F.coins += out.coins; else v.box += out.coins;
  v.sold += out.bottles; v.glasses += out.glasses;
  const day = new Date(t + 8*H).toISOString().slice(0, 10); if (v.today.day !== day) v.today = {day, bottles: 0, glasses: 0, plates: 0, coins: 0};
  ["picked", "filled", "stocked"].forEach(x => { v.today[x] = (v.today[x] || 0) + out[x]; });
  v.today.plates = (v.today.plates || 0) + out.plates; v.today.deliv = (v.today.deliv || 0) + (out.deliv || 0); v.today.lunchB = (v.today.lunchB || 0) + (out.lunchB || 0); v.today.occB = (v.today.occB || 0) + (out.occB || 0); v.today.cases = (v.today.cases || 0) + (out.cases || 0); v.today.mulled = (v.today.mulled || 0) + (out.mulled || 0); v.today.occP = (v.today.occP || 0) + (out.occP || 0); if (out.occ) v.today.occ = out.occ; v.today.lunchP = (v.today.lunchP || 0) + (out.lunchP || 0); v.today.bottles += out.bottles; v.today.glasses += out.glasses; v.today.coins += out.coins;
  return out;
}

/* ---------- panels ---------- */
const hrs = ms => { const m = Math.ceil(ms/60000); return m >= 60 ? `${Math.floor(m/60)}h ${m % 60}m` : `${m}m`; };
const bottleSVG = (type, s = 54) => bottleArt(type, s);
export function vinePanel(F, r, i){
  const v = vineState(F), row = v.rows[r], vn = row && row.vines[i];
  let h = `<span class="tape stripe" aria-hidden="true"></span><h2>Vine ${r + 1}.${i + 1}</h2>`;
  h += vineCloseup(vn, vn ? growth(vn) : 0, row.trellis);
  if (!row.trellis && r >= UPPER_ROWS && !v.lower) return h + `<p class="sub">This row's Bram's, with his father's old posts leaning in the long grass. There's a For Sale sign by the gate.</p><div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
  if (!row.trellis) return h + `<p class="sub">This row needs a trellis before vines can climb it. The vineyard stall sells them.</p><div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
  if (!vn) return h + `<p class="sub">An empty spot on the trellis. What shall we plant?</p><div class="actions">${grapeKinds(v).map(k => `<button class="btn ${v.cuttings[k] ? "primary" : "alt"} small" data-vy="plant" data-k="${k}" ${v.cuttings[k] ? "" : "disabled"}>${GRAPE_N[k]} vine (${v.cuttings[k]})</button>`).join("")}<button class="btn alt small" data-close="1">Close</button></div>${!v.cuttings.red && !v.cuttings.white ? `<p class="muted">No cuttings left: the stall has more.</p>` : ""}`;
  const g = growth(vn);
  return h + `<p class="sub">A ${vn.v === "red" || vn.v === "white" ? vn.v + " grape" : GRAPE_N[vn.v] || vn.v} vine. ${!vn.wateredAt ? "Thirsty! Water it and it starts fruiting." : g >= 1 ? "Heavy with ripe grapes!" : `Ripening: ready in about ${hrs(GROW*(1 - g))}.`}</p>
    ${vn.wateredAt ? `<span class="clbar"><i style="width:${Math.round(g*100)}%"></i></span>` : ""}
    <div class="actions">${!vn.wateredAt ? `<button class="btn primary small" data-vy="water">Water the row</button>` : g >= 1 ? `<button class="btn primary small" data-vy="harvest">Pick the grapes</button>` : ""}<button class="btn alt small" data-vy="uproot">Dig it up</button><button class="btn alt small" data-close="1">Close</button></div>
    <p class="muted">Digging it up puts the cutting back in your box, so you can plant a different grape here${g >= 1 ? " (its ripe grapes are picked first)" : ""}.</p>`;
}
export function stallPanel(F){
  const v = vineState(F);
  return `<span class="tape gingham" aria-hidden="true"></span><h2>Vineyard stall</h2><p class="sub">You have ${F.coins} coins. Cuttings: ${grapeKinds(v).map(k => `${v.cuttings[k]} ${gName(k)}`).join(", ")}. Grapes: ${grapeKinds(v).map(k => `${v.grapes[k]} ${gName(k)}`).join(", ")} bunches.</p>
    <div class="items shop">${Object.keys(SHOP).map(id => { const it = SHOP[id], price = shopPrice(v, id), have = (id === "grove" && !!v.grove) || (id === "grove2" && (!!v.grove2 || !v.grove)) || (id === "trellis" && v.rows.every((r, i) => r.trellis || (i >= UPPER_ROWS && !v.lower))) || (id === "barrel" && v.barrels.length >= maxBarrels(F)) || (id === "olive" && !!v.olive) || (id === "terrace" && !!v.terrace), off = have || F.coins < price;
      return `<button class="item" data-vybuy="${id}" ${off ? "disabled" : ""}><span class="e">${stallIcon(id, off)}</span><span class="n">${esc(it.n)}</span><span class="c">${have ? "owned" : `<b>${price}</b> coins`}</span>${id === "terrace" ? `<span class="d">a third more customers</span>` : ""}</button>`; }).join("")}</div>
    <div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
}
export const vy = {name: {}};
export const GRAPE_COL = {priory: "#3A1428", red: "#7A2E5A", white: "#C9D98A", tempranillo: "#3A2050", pinot: "#4A2A4E", chardonnay: "#D9D27A"};
const grapePic = c => `<svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true">${[[9, 8], [15, 8], [12, 12], [6, 12], [18, 12], [9, 16], [15, 16], [12, 20]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.2" fill="${GRAPE_COL[c] || "#C9D98A"}" stroke="#3A2E28" stroke-width="1"/>`).join("")}<path d="M12 5 V2" stroke="#3A2E28" stroke-width="1.2"/></svg>`;
export function barrelPanel(F){
  const v = vineState(F);
  let h = `<span class="tape stripe" aria-hidden="true"></span><h2>The barrels</h2><p class="sub">Three bunches make a barrel; a barrel makes ${BOTTLES} bottles.</p>`;
  // round 132: the ladder up to the drying loft, once Mel's been to Cinque Terre (game/loft.js)
  if (F.towns && F.towns.cinque) h += `<div class="actions"><button class="btn alt small" data-loft="1">Up the ladder to the drying loft</button></div>`;
  // the grape crates: picked grapes wait here. Take some for the Scoop Shack (or put them back); Marco only fills
  // barrels from what's left over the amount Mel keeps back
  h += `<p class="eyebrow">The grape crates</p><ul class="hlist wlist orflowers grcrates">${grapeKinds(v).map(c => { const back = (F.inv || {})["grape_" + c] || 0;
    return `<li><span class="wpic">${grapePic(c)}</span><span class="wtxt"><b>${v.grapes[c]} ${c} bunch${v.grapes[c] === 1 ? "" : "es"}</b><small>${v.help.barrels ? `Marco keeps ${v.keep[c] || 0} back for you` : "picked and waiting"}</small></span>
      <span class="orbtns"><button class="btn small primary" data-vy="takegr" data-k="${c}" data-n="1" ${v.grapes[c] ? "" : "disabled"}>Take 1</button><button class="btn small alt" data-vy="takegr" data-k="${c}" data-n="99" ${v.grapes[c] ? "" : "disabled"}>All</button>${back ? `<button class="btn small alt" data-vy="putgr" data-k="${c}">Put back ${back}</button>` : ""}</span>
      ${v.help.barrels ? `<span class="grkeep"><span>Keep back from the barrels</span><span class="gstep"><button class="btn small alt" data-vy="keep" data-k="${c}" data-n="-1" aria-label="Keep fewer back">−</button><b>${v.keep[c] || 0}</b><button class="btn small alt" data-vy="keep" data-k="${c}" data-n="1" aria-label="Keep more back">+</button></span></span>` : ""}</li>`; }).join("")}</ul>
    <p class="muted">Grapes you take go in your backpack (for gelato at the Scoop Shack).${v.help.barrels ? " Marco fills empty barrels only from bunches beyond what you keep back." : ""}</p><div class="vbarrels">`;
  v.barrels.forEach((b, i) => {
    const ph = !b ? "empty" : barrelLeft(b) ? (b.style === "sparkling" && b.stage === 2 ? "bubbles" : "ferment") : b.style === "sparkling" && b.stage === 1 ? "await2" : "ready";
    if (i === BARRELS.shed) h += `</div><p class="eyebrow">On the racks in the cellar</p><div class="vbarrels">`;
    h += `<div class="vbarrel">${barrelPic(ph, b ? STYLES[b.style].col : "", b ? STYLES[b.style].n : "")}<div class="vbody"><b>Barrel ${i + 1}</b>${b ? stageStrip(b.style, ph) : ""}`;
    if (!b) h += `<p class="muted">Empty.</p><div class="vbtns">${Object.keys(STYLES).filter(k => hasGrape(v, STYLES[k].grape)).map(k => { const st = STYLES[k], ok = v.grapes[st.grape] >= PER_BATCH; return `<button class="btn small ${ok ? "alt" : "alt"}" data-vy="fill" data-i="${i}" data-k="${k}" ${ok ? "" : "disabled"}>${st.n}</button>`; }).join("")}</div>`;
    else { const left = barrelLeft(b), st = STYLES[b.style];
      if (left) h += `<p>${st.n}${b.style === "sparkling" ? (b.stage === 1 ? ", first fermentation" : ", getting its bubbles") : ""}: ready in ${hrs(left)}.</p><span class="clbar"><i style="width:${Math.round(100*(1 - left/b.dur))}%"></i></span>`;
      else if (b.style === "sparkling" && b.stage === 1) h += `<p>First fermentation done. Now the bubbles.</p><button class="btn primary small" data-vy="second" data-i="${i}">Start the second fermentation</button>`;
      else h += `<p>${st.n} is ready to bottle!</p><label class="sr" for="vyName${i}">Name this wine</label><input id="vyName${i}" class="vyname" maxlength="30" placeholder="${esc(wineNames(F, i)[0] || "Name it")}" value="${esc(vy.name[i] || "")}"><button class="btn alt small" data-vy="suggest" data-i="${i}">Suggest a name</button><button class="btn primary small" data-vy="bottle" data-i="${i}">Bottle it</button>`; }
    h += `</div></div>`;
  });
  h += `</div>${v.cellar.length ? `<p class="eyebrow">In the cellar</p><ul class="hlist wlist">${v.cellar.map(c => `<li><span class="wpic">${bottleSVG(c.type)}</span><span class="wtxt"><b>${esc(c.name)}</b><small>${STYLES[c.type].n} · ${c.n} bottles${c.rack ? ` · on the riddling rack, ${riddleDays(c)} day${riddleDays(c) === 1 ? "" : "s"} (+${RIDDLE.day*riddleDays(c)} a bottle${riddleDays(c) >= RIDDLE.max ? ", as fine as it gets" : ""})` : ""}</small></span>${c.type === "sparkling" && !c.rack && canRiddle(F) ? `<button class="btn small primary" data-vyrack="${esc(c.id)}">Onto the riddling rack</button>` : ""}</li>`).join("")}</ul><p class="muted">Take them to the wine shop to stock the shelves.</p>` : ""}`;
  const max = maxBarrels(F), p = shopPrice(v, "barrel");   // Mel: "there's no option to buy extra barrels for the cellar"
  if (v.barrels.length < max) h += `<p class="muted">${v.barrels.length} of ${max} barrels${max > BARRELS.shed ? `: six in the shed, twelve on the cellar's racks` : ""}.</p><div class="actions"><button class="btn small ${F.coins >= p ? "primary" : "alt"}" data-vybuy="barrel" ${F.coins >= p ? "" : "disabled"}>${v.barrels.length >= BARRELS.shed ? "Another barrel for the cellar" : "Another barrel"} · ${p} coins</button></div>`;
  return h + `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
}
// Fruit from the orchard goes in a crate by the shelves (all of one kind from the backpack at a time)
export function stockFruit(F, id, k = 99){ const v = vineState(F), n = Math.min(k, (F.inv || {})[id] || 0); if (!n || !ITEMS[id] || !ITEMS[id].fruit) return null;
  F.inv[id] -= n; if (F.inv[id] <= 0) delete F.inv[id]; v.fruit[id] = (v.fruit[id] || 0) + n; return `${n} ${ITEMS[id].n.toLowerCase()}${n > 1 && !/s$/.test(ITEMS[id].n) ? "s" : ""} into the fruit crate.`; }
const fruitCrate = F => { const v = vineState(F), crate = Object.keys(v.fruit).filter(id => v.fruit[id] > 0), bag = Object.keys(F.inv || {}).filter(id => F.inv[id] > 0 && ITEMS[id] && ITEMS[id].fruit);
  if (!crate.length && !bag.length) return "";
  return `<p class="eyebrow">Fruit crate</p>${crate.length ? `<ul class="hlist wlist">${crate.map(id => `<li><span class="wpic">${icon(id, 36)}</span><span class="wtxt"><b>${esc(ITEMS[id].n)}</b><small>${v.fruit[id]} in the crate · ${ITEMS[id].sell || 3} coins each</small></span></li>`).join("")}</ul>` : `<p class="muted">Empty. Fruit from Ma Ma's orchard sells here too.</p>`}
    ${bag.length ? `<div class="vbtns">${bag.map(id => `<button class="btn small alt" data-vyfruit="${id}" data-n="1">${icon(id, 18)} Add 1 ${esc(ITEMS[id].n.toLowerCase())}</button>${F.inv[id] > 1 ? `<button class="btn small alt" data-vyfruit="${id}" data-n="99">All ${F.inv[id]}</button>` : ""}`).join("")}</div>` : ""}`; };
export function shelfPanel(F){
  const v = vineState(F);
  return `<span class="tape gingham" aria-hidden="true"></span><h2>The wine shelves</h2>
    ${v.shelf.length ? `<ul class="hlist wlist wshelf">${v.shelf.map(s => `<li><span class="wpic">${bottleSVG(s.type)}</span><span class="wtxt"><b>${esc(s.name)}</b><small>${STYLES[s.type].n} · ${s.n} on the shelf${s.open ? ` · a bottle open for tasting` : ""}${s.price > STYLES[s.type].price*1.3 ? ` · pricey: fewer buyers` : s.price < STYLES[s.type].price*.75 ? ` · a bargain: flying off` : ""}</small></span><label class="wprice"><span class="sr">Price</span><input type="number" min="1" max="999" data-vyprice="${esc(s.id)}" value="${s.price}"> coins</label></li>`).join("")}</ul>` : `<p class="sub">The shelves are bare.</p>`}
    ${fruitCrate(F)}
    ${v.cellar.length ? `<p class="eyebrow">From the cellar</p><ul class="hlist wlist">${v.cellar.map(c => `<li><span class="wpic">${bottleSVG(c.type)}</span><span class="wtxt"><b>${esc(c.name)}</b><small>${STYLES[c.type].n} · ${c.n} bottles${c.rack ? ` · riddled ${riddleDays(c)} day${riddleDays(c) === 1 ? "" : "s"}, ${STYLES[c.type].price + RIDDLE.day*riddleDays(c)} a bottle` : ""}</small></span><button class="btn small primary" data-vystock="${esc(c.id)}">Stock it</button></li>`).join("")}</ul>` : `<p class="muted">Bottled wines wait in the cellar until you stock them here.</p>`}
    <div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
}
export function counterPanel(F, serving, staff){
  const v = vineState(F), t = v.today;
  return `<span class="tape gingham" aria-hidden="true"></span><h2>Behind the counter</h2><p class="sub">${serving ? "You're serving: customers come in more often while you're here, and pay you straight away." : "Step behind the counter to serve."} Evenings and weekends are busiest.${staff ? " Celeste's on shift too, so it's a little busier than usual (her takings go in the honesty box)." : ""}</p>
    <p>Today: <b>${t.bottles}</b> bottle${t.bottles === 1 ? "" : "s"} and <b>${t.glasses}</b> glass${t.glasses === 1 ? "" : "es"} and <b>${t.plates || 0}</b> plate${t.plates === 1 ? "" : "s"} sold, <b>${t.coins}</b> coins. On the shelves: ${shelfStock(v)} bottles.</p>
    <h3 class="ph3">Your staff</h3><p class="sub">They do the everyday jobs so you can do the fun ones. Untick anything you'd rather do yourself.</p>
    <div class="vhelp">${HELP.map(([id, n, d]) => `<label class="vhelpi"><input type="checkbox" data-vyhelp="${id}" ${v.help[id] ? "checked" : ""}><span><b>${esc(n)}</b><small>${esc(d)}</small></span></label>`).join("")}</div>
    ${t.picked || t.filled || t.stocked ? `<p class="muted">Today the staff picked ${t.picked || 0} bunch${t.picked === 1 ? "" : "es"}, filled ${t.filled || 0} barrel${t.filled === 1 ? "" : "s"} and stocked ${t.stocked || 0} bottle${t.stocked === 1 ? "" : "s"}.</p>` : ""}
    <h3 class="ph3">Names</h3><div class="vnames"><label>Vineyard<input id="vyNameV" maxlength="28" placeholder="The vineyard" value="${esc(v.names.vineyard || "")}"></label><label>Wine shop<input id="vyNameS" maxlength="28" placeholder="The wine shop" value="${esc(v.names.shop || "")}"></label><button class="btn primary small" data-vy="names">Save names</button></div>
    <div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
}
export function boxPanel(F){ const v = vineState(F);
  return `<span class="tape gingham" aria-hidden="true"></span><h2>The honesty box</h2><p class="sub">${v.box ? `${v.box} coins inside, left by customers while you were away.` : "Empty for now. Villagers drop coins in when they buy."}</p>
    <div class="actions">${v.box ? `<button class="btn primary" data-vy="collect">Collect ${v.box} coins</button>` : ""}<button class="btn alt small" data-close="1">Close</button></div>`; }
export function cafePanel(F, guests, today){ const v = vineState(F), open = v.shelf.filter(s => s.n > 0 || s.open > 0), menu = Object.keys(v.menu).filter(id => v.menu[id] > 0 && DISHES[id]);
  const taps = tapasOn(v, today);
  return `<span class="tape stripe" aria-hidden="true"></span><h2>The tasting room</h2><p class="sub">${guests.length ? `${guests.join(" and ")} ${guests.length > 1 ? "are" : "is"} in for a tasting.` : "Quiet for now. Villagers drop in for a glass, mostly in the evenings and at weekends."}</p>
    <p class="eyebrow">Tapas of the day</p>${taps.length ? `<ul class="hlist wlist">${taps.map(t => { const T = TAPAS[t.id]; return `<li><span class="wpic">${dishArt("tapas:" + t.id, 52)}</span><span class="wtxt"><b>${esc(T.n)}</b><small>${t.plates ? `${t.plates} plate${t.plates === 1 ? "" : "s"} left · ${T.price} coins each` : "All gone! Cook another batch in the kitchen."}</small></span></li>`; }).join("")}</ul>` : `<p class="muted">Not chosen yet today. Pick one at the stove in the kitchen.</p>`}
    <p class="eyebrow">Small plates</p>${menu.length ? `<ul class="hlist wlist">${menu.map(id => `<li><span class="wpic">${dishArt(id, 46)}</span><span class="wtxt"><b>${esc(DISHES[id].n)}</b><small>${v.menu[id]} plate${v.menu[id] === 1 ? "" : "s"} left · ${DISHES[id].price} coins each</small></span></li>`).join("")}</ul>` : `<p class="muted">None on the menu. They're cooked at the stove in the kitchen.</p>`}
    <p class="eyebrow">By the glass</p>${open.length ? `<ul class="hlist wlist">${open.map(s => `<li><span class="wpic">${glassArt(s.type, 40)}</span><span class="wtxt"><b>${esc(s.name)}</b><small>${STYLES[s.type].n} · ${Math.max(1, Math.round(s.price/4))} coins a glass</small></span></li>`).join("")}</ul>` : `<p class="muted">Stock the shelves and your wines are poured here too.</p>`}
    ${v.staffNote && v.staffNote.plates ? `<p class="muted">Last night's staff dinner: ${esc(v.staffNote.dish.toLowerCase())}. Marco, Ines and Celeste left something in the larder to say thanks.</p>` : ""}
    <p class="muted">Served so far: ${v.glasses} glass${v.glasses === 1 ? "" : "es"} and ${v.plates} plate${v.plates === 1 ? "" : "s"}. Food brings more people in, and the tapas of the day most of all.</p>
    <div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`; }
// The wine shop's stall at the Sunday farmers market: the same bottles as the shop's shelves (stock is shared)
export function stallMarketPanel(F, serving){
  const v = vineState(F), t = v.today;
  return `<span class="tape gingham" aria-hidden="true"></span><h2>${esc(shopName(F))}: market stall</h2>
    <p class="sub">${serving ? "You're serving at the stall: more people stop by, and they pay you straight away." : "Ines is minding the stall. Step behind it to serve yourself."} These are the same bottles as the shop's shelves, so anything sold here comes off them.</p>
    ${v.shelf.length ? `<ul class="hlist wlist">${v.shelf.map(s => `<li><span class="wpic">${bottleArt(s.type, 40)}</span><span class="wtxt"><b>${esc(s.name)}</b><small>${STYLES[s.type].n} · ${s.n} bottle${s.n === 1 ? "" : "s"} left${s.open ? " · one open for tastings" : ""}</small></span><span class="mprice">${s.price}</span></li>`).join("")}</ul>` : `<p class="muted">Nothing on the shelves to bring. Bottle some wine and stock the shop first.</p>`}
    <p class="muted">Today: ${t.bottles} bottles and ${t.glasses} glasses sold, ${t.coins} coins (shop and stall together).</p>
    <div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
}
// The chalkboard menu: everything that's actually available right now, with prices
export function menuPanel(F, today){
  const v = vineState(F), taps = tapasOn(v, today).filter(t => t.plates > 0);
  const plates = Object.keys(v.menu).filter(id => v.menu[id] > 0 && DISHES[id]), wines = v.shelf.filter(s => s.n > 0 || s.open > 0), fruit = Object.keys(v.fruit).filter(id => v.fruit[id] > 0 && ITEMS[id]);
  const row = (pic, name, note, price) => `<li><span class="wpic">${pic}</span><span class="wtxt"><b>${esc(name)}</b><small>${note}</small></span><span class="mprice">${price}</span></li>`;
  const sec = (title, items) => items.length ? `<p class="eyebrow">${title}</p><ul class="hlist wlist chalk">${items.join("")}</ul>` : "";
  let h = `<span class="tape stripe" aria-hidden="true"></span><h2>Today's menu</h2><p class="sub">${shopName(F)}, open 10am to 10pm.</p>`;
  const body = sec("Tapas of the day", taps.map(t => row(dishArt("tapas:" + t.id, 46), TAPAS[t.id].n, `${t.plates} plate${t.plates === 1 ? "" : "s"} left`, TAPAS[t.id].price)))
    + sec("Small plates", plates.map(id => row(dishArt(id, 42), DISHES[id].n, `${v.menu[id]} left`, DISHES[id].price)))
    + sec("By the glass", wines.map(s => row(glassArt(s.type, 36), s.name, STYLES[s.type].n, Math.max(1, Math.round(s.price/4)))))
    + sec("By the bottle", v.shelf.filter(s => s.n > 0).map(s => row(bottleArt(s.type, 40), s.name, `${STYLES[s.type].n} · ${s.n} on the shelf`, s.price)))
    + sec("From Ma Ma's orchard", fruit.map(id => row(icon(id, 34), ITEMS[id].n, `${v.fruit[id]} in the crate`, ITEMS[id].sell || 3)));
  h += body || `<p class="muted">Nothing on today. Bottle some wine and stock the shelves, or cook something in the kitchen.</p>`;
  return h + `<p class="muted">Prices in coins.</p><div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
}
// The olive tree's card
export function grovePanel(F){
  const v = vineState(F), g = v.grove, ripe = groveRipe(v), p = g ? Math.min(1, (Date.now() - (g.pickedAt || g.planted))/OLIVE) : 0, crate = v.oliveCrate || 0;
  return `<span class="tape stripe" aria-hidden="true"></span><h2>The olive grove</h2><p class="sub">${ripe ? `All four trees are heavy with olives: ${GROVE_JARS} jars' worth.` : `Olives ripening: ready in about ${hrs(OLIVE*(1 - p))}.`}${v.help.pick ? " Marco and Ines pick them on their shifts, into the olive crate." : ""}</p>
    ${ripe ? "" : `<span class="clbar"><i style="width:${Math.round(p*100)}%"></i></span>`}
    <p class="muted">The olive crate: ${crate} jar${crate === 1 ? "" : "s"}${crate ? " picked and waiting" : ""}. The mill on the cottage lane presses olives into oil (three jars a bottle).</p>
    <div class="actions">${ripe ? `<button class="btn primary" data-vy="grove">Pick the olives</button>` : ""}${crate ? `<button class="btn alt" data-vy="crate">Take the crate (${crate})</button>` : ""}<button class="btn alt small" data-close="1">Close</button></div>`;
}
export function olivePanel(F){
  const v = vineState(F), o = v.olive, ripe = oliveRipe(v), g = o ? Math.min(1, (Date.now() - (o.pickedAt || o.planted))/OLIVE) : 0;
  return `<span class="tape stripe" aria-hidden="true"></span><h2>The olive tree</h2>${oliveArt(o ? (ripe ? "ripe" : "growing") : "none", 150)}
    <p class="sub">${!o ? "A sunny spot by the path, waiting for an olive tree. The stall sells them." : ripe ? "Heavy with olives! Two jars' worth." : `Olives ripening: ready in about ${hrs(OLIVE*(1 - g))}.`}</p>
    ${o && !ripe ? `<span class="clbar"><i style="width:${Math.round(g*100)}%"></i></span>` : ""}
    ${o ? `<p class="muted">The olive crate: ${v.oliveCrate || 0} jar${v.oliveCrate === 1 ? "" : "s"}${v.help.pick ? " (Marco and Ines put what they pick in here)" : ""}. Take them for the kitchen, gelato, or the mill.</p>` : ""}
    <div class="actions">${ripe ? `<button class="btn primary" data-vy="olives">Pick the olives</button>` : ""}${v.oliveCrate ? `<button class="btn alt" data-vy="crate">Take the crate (${v.oliveCrate})</button>` : ""}<button class="btn alt small" data-close="1">Close</button></div>`;
}
export function pickOlives(F){ const v = vineState(F); if (!oliveRipe(v)) return null; v.olive.pickedAt = Date.now(); F.inv = F.inv || {}; F.inv.olives = (F.inv.olives || 0) + TREE_JARS; return "Three jars of olives, into your backpack. Send them to the kitchen when you like."; }
// api: {save, rerender, say(line), sfx, r, i}
export function wireVine(root, F, api){
  root.querySelectorAll(".vyname").forEach(inp => inp.oninput = () => { vy.name[+inp.id.slice(6)] = inp.value; });
  root.querySelectorAll("[data-vy]").forEach(b => b.onclick = () => {
    const k = b.dataset.vy, i = +b.dataset.i; let line = null;
    if (k === "plant") line = plantVine(F, api.r, api.i, b.dataset.k);
    else if (k === "water") { line = waterVines(F, api.r); if (line) api.sfx("tap"); }
    else if (k === "uproot") { line = uprootVine(F, api.r, api.i); if (line) api.sfx("paper"); }
    else if (k === "harvest") { line = harvestVine(F, api.r, api.i, {harvest: api.harvest}); if (line) api.sfx("coin"); }
    else if (k === "fill") { line = fillBarrel(F, i, b.dataset.k); if (line) api.sfx("paper"); }
    else if (k === "takegr") { const v = vineState(F), c = b.dataset.k, n = Math.min(+b.dataset.n, v.grapes[c]); if (n > 0) { v.grapes[c] -= n; F.inv = F.inv || {}; F.inv["grape_" + c] = (F.inv["grape_" + c] || 0) + n; line = `${n} bunch${n > 1 ? "es" : ""} of ${c} grapes into your backpack.`; api.sfx("paper"); } }
    else if (k === "putgr") { const v = vineState(F), c = b.dataset.k, n = (F.inv || {})["grape_" + c] || 0; if (n) { v.grapes[c] += n; delete F.inv["grape_" + c]; line = `${n} bunch${n > 1 ? "es" : ""} back in the crates.`; } }
    else if (k === "keep") { const v = vineState(F), c = b.dataset.k; v.keep[c] = Math.max(0, Math.min(30, (v.keep[c] || 0) + +b.dataset.n)); }
    else if (k === "second") line = secondFerment(F, i);
    else if (k === "suggest") { const ns = wineNames(F, i); vy.sug = vy.sug || {}; vy.sug[i] = ((vy.sug[i] ?? 0) + 1) % Math.max(1, ns.length); vy.name[i] = ns[vy.sug[i]] || ""; api.sfx("tap"); }
    else if (k === "bottle") { line = bottle(F, i, vy.name[i]); if (line) { vy.name[i] = ""; api.sfx("chime"); } }
    else if (k === "olives") { line = pickOlives(F); if (line) api.sfx("coin"); }
    else if (k === "grove") { line = pickGrove(F); if (line) api.sfx("coin"); }
    else if (k === "crate") { line = takeOliveCrate(F); if (line) api.sfx("coin"); }
    else if (k === "names") { rename(F, "vineyard", (root.querySelector("#vyNameV") || {}).value); rename(F, "shop", (root.querySelector("#vyNameS") || {}).value); line = `${vineyardName(F)} and ${shopName(F)}. Lovely names!`; api.sfx("chime"); }
    else if (k === "collect") { const n = collect(F); if (n) { api.sfx("chaching"); line = `${n} coins from the honesty box. Thank you, neighbours!`; } }
    if (line) api.say(line); api.save(); api.rerender();
  });
  root.querySelectorAll("[data-vybuy]").forEach(b => b.onclick = () => { const line = buy(F, b.dataset.vybuy); if (line) { api.sfx("coin"); api.say(line); api.save(); api.rerender(); } });
  root.querySelectorAll("[data-vyfruit]").forEach(b => b.onclick = () => { const line = stockFruit(F, b.dataset.vyfruit, +b.dataset.n || 99); if (line) { api.sfx("paper"); api.say(line); api.save(); api.rerender(); } });
  root.querySelectorAll("[data-vyrack]").forEach(b => b.onclick = () => { const c = onRack(F, b.dataset.vyrack); if (c) { api.sfx("chime"); api.say(`${c.name}, neck-down on the riddling rack. A quarter turn a day, like Jono showed you. The longer it stays, the finer it gets.`); api.save(); api.rerender(); } });
  root.querySelectorAll("[data-vyhold]").forEach(b => b.onclick = () => { const c = hold(F, b.dataset.vyhold, b.dataset.on === "1"); if (c) { api.sfx("paper"); api.say(c.hold ? `${c.name} stays in the cellar till you say so.` : `Celeste can put ${c.name} out when she's on.`); api.save(); api.rerender(); } });
  root.querySelectorAll("[data-vykitchen]").forEach(b => b.onclick = () => { const line = toKitchen(F, b.dataset.vykitchen); if (line) { api.sfx("paper"); api.say(line); api.save(); api.rerender(); } });
  root.querySelectorAll("[data-vyunstock]").forEach(b => b.onclick = () => { const line = unstock(F, b.dataset.vyunstock); if (line) { api.sfx("paper"); api.say(line); api.save(); api.rerender(); } });
  root.querySelectorAll("[data-vystock]").forEach(b => b.onclick = () => { const line = stock(F, b.dataset.vystock); if (line) { api.sfx("paper"); api.say(line); api.save(); api.rerender(); } });
  root.querySelectorAll("[data-vyhelp]").forEach(inp => inp.onchange = () => { vineState(F).help[inp.dataset.vyhelp] = inp.checked; api.save(); });
  root.querySelectorAll("[data-vyprice]").forEach(inp => inp.onchange = () => { setPrice(F, inp.dataset.vyprice, +inp.value); api.save(); });
}
// the day's takings once the winery shuts at 10 (round 139): -> a line, or null. v.reported
export function wineNews(F, day, hm){
  const v = vineState(F), t = v.today; if (hm < 22*60 || v.reported === day) return null; v.reported = day; if (!t || t.day !== day || !t.coins) return null;
  const bits = [t.bottles ? `${t.bottles} bottle${t.bottles === 1 ? "" : "s"}` : "", t.glasses ? `${t.glasses} glass${t.glasses === 1 ? "" : "es"}` : "", t.plates ? `${t.plates} plate${t.plates === 1 ? "" : "s"}` : ""].filter(Boolean);
  return `Today ${shopName(F).replace(/^The /, "the ")} sold ${bits.length ? bits.join(", ").replace(/, ([^,]*)$/, " and $1") : "a little"}: ${t.coins} coins${t.deliv ? `, with ${t.deliv} order${t.deliv === 1 ? "" : "s"} out by bike` : ""}${t.lunchB || t.lunchP ? `. The Sunday lunch on the terrace: ${t.lunchB || 0} bottle${t.lunchB === 1 ? "" : "s"} and ${t.lunchP || 0} plate${t.lunchP === 1 ? "" : "s"}` : ""}${t.mulled ? `. ${t.mulled} cup${t.mulled === 1 ? "" : "s"} of mulled wine` : ""}${t.occ && (t.occB || t.occP) ? `. ${OCC[t.occ].n} on the terrace: ${t.occB || 0} ${t.occ === "paint" ? "glass" : "bottle"}${t.occB === 1 ? "" : t.occ === "paint" ? "es" : "s"}${t.occP ? ` and ${t.occP} plate${t.occP === 1 ? "" : "s"}` : ""}${t.cases ? `, ${t.cases} of them the couple's sparkling, by the case from your cellar` : ""}` : ""}. Anything you didn't serve yourself is waiting in the honesty box by the counter.`;
}
