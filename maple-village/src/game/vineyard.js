// The vineyard (east of home): grow grapes on trellised vines, ferment them in barrels (set it and walk away),
// bottle and name the wines, stock the wine shop's shelves. Villagers buy now and then and leave coins in the
// honesty box; standing behind the counter brings more customers. How busy it gets follows the village's routines
// (evenings and weekends are busiest; villagers dropping in for a tasting add more). State lives in the game save
// (F.vine). Times are real time, so things grow and ferment while Mel is away.
import { esc, plain, H, now } from "../util.js";
import { NPCS } from "../data/npcs.js";
import { ITEMS } from "../data/items.js";
import { eventNow, wineClubNow } from "./tours.js";
import { icon } from "../art/icons.js";
import { DISHES, TAPAS, tapasPrice } from "./kitchen.js";
import { vineCloseup, barrelPic, stageStrip, bottleArt, glassArt, stallIcon, dishArt, oliveArt } from "../art/wine.js";

export const GROW = 8*H;                                     // a watered vine ripens in 8 hours
// Fermenting is a once-a-day rhythm: fill a barrel one evening, bottle it the next day (finishing quests speeds it up).
export const STYLES = {red: {n: "Red", grape: "red", dur: 10*H, price: 18, col: "#7A1F3D"}, rose: {n: "Rosé", grape: "red", dur: 6*H, price: 15, col: "#E98AA0"},
  white: {n: "White", grape: "white", dur: 8*H, price: 16, col: "#E8D57A"}, sparkling: {n: "Sparkling", grape: "white", dur: 8*H, dur2: 5*H, price: 26, col: "#F3E7B0"},
  // round 107: from Rafael's cuttings in Ronda. A deep Spanish red: longer in the barrel, dearer on the shelf
  tempranillo: {n: "Tempranillo", grape: "tempranillo", dur: 12*H, price: 28, col: "#5A1630"}};
// the grapes Mel can grow (Tempranillo once she's brought cuttings home from Ronda)
export const grapeKinds = v => ["red", "white", ...(v.tempra ? ["tempranillo"] : [])];
const GRAPE_N = {red: "Red", white: "White", tempranillo: "Tempranillo"};
export function addCuttings(F, kind, n){ const v = vineState(F); v.cuttings[kind] = (v.cuttings[kind] || 0) + n; if (kind === "tempranillo") v.tempra = true; }
export const SHOP = {cut_red: {n: "Red grape vine", price: 20, say: "A red grape cutting. Plant it on a trellis."}, cut_white: {n: "White grape vine", price: 20, say: "A white grape cutting. Plant it on a trellis."},
  grove: {n: "Olive grove (4 trees)", price: 300, needs: "olive", say: "Four young olive trees, planted in a neat row along the top terrace. Eight more jars every picking."},
  olive: {n: "Olive tree", price: 150, say: "An olive tree, planted by the path. Olives in about eight hours."}, trellis: {n: "Trellis (one row)", price: 80, say: "A new trellis row, ready for three vines."}, barrel: {n: "Oak barrel", price: 150, say: "Another barrel for the cellar."}, terrace: {n: "Shop terrace", price: 600, say: "Tables and a vine-covered pergola outside the wine shop. More people stop for a glass."}};
const BUNCHES = 3, PER_BATCH = 3, BOTTLES = 6, GLASSES = 5;
// the tapas of the day (round 108: up to three a day): v.tapasList = [{day, id, plates, cooked}]
export const tapasOn = (v, day) => (v.tapasList || []).filter(t => t && t.day === day && TAPAS[t.id]);
export const platesLeft = v => Object.values(v.menu || {}).reduce((a, n) => a + n, 0) + (v.tapasList || []).reduce((a, t) => a + (t.plates || 0), 0);
// the olive tree (bought at the stall, planted by the path): ripe every 8 hours, two jars of olives a picking
export const OLIVE = 8*H;
export const oliveRipe = v => !!v.olive && Date.now() - (v.olive.pickedAt || v.olive.planted) >= OLIVE;
// round 110: the olive grove (four more trees along the top terrace, bought at the stall), ripe on the same 8 hours,
// eight jars a picking. Marco and Ines pick the tree and the grove on their shifts (with the grapes) into the olive
// crate (v.oliveCrate), which Mel empties into her backpack at the grove, or the mill takes from directly.
export const GROVE_JARS = 8;
export const groveRipe = v => !!v.grove && Date.now() - (v.grove.pickedAt || v.grove.planted) >= OLIVE;
export function pickGrove(F){ const v = vineState(F); if (!groveRipe(v)) return null; v.grove.pickedAt = Date.now(); F.inv = F.inv || {}; F.inv.olives = (F.inv.olives || 0) + GROVE_JARS; return `${GROVE_JARS} jars of olives from the grove, into your backpack.`; }
export function takeOliveCrate(F){ const v = vineState(F), n = v.oliveCrate || 0; if (!n) return null; v.oliveCrate = 0; F.inv = F.inv || {}; F.inv.olives = (F.inv.olives || 0) + n; return `${n} jar${n > 1 ? "s" : ""} of olives from the crate, into your backpack.`; }
export function vineState(F){
  F.vine = F.vine || {};
  const v = F.vine;
  v.rows = v.rows || [0, 1, 2].map(i => ({trellis: i === 0, vines: [null, null, null]}));
  v.cuttings = v.cuttings || {red: 1, white: 1}; v.grapes = v.grapes || {red: 0, white: 0}; v.keep = v.keep || {red: 0, white: 0};
  v.barrels = v.barrels || [null]; v.cellar = v.cellar || []; v.shelf = v.shelf || []; v.box = v.box || 0; v.sold = v.sold || 0; v.glasses = v.glasses || 0; v.menu = v.menu || {}; v.plates = v.plates || 0; v.fruit = v.fruit || {};
  v.help = Object.assign({cook: true, pick: true, barrels: true, stock: true, fetch: false}, v.help || {}); v.names = v.names || {};
  ["tempranillo"].forEach(k => { v.cuttings[k] = v.cuttings[k] || 0; v.grapes[k] = v.grapes[k] || 0; v.keep[k] = v.keep[k] || 0; });
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
// the second barrel costs 150, the third 300
export const shopPrice = (v, id) => id === "barrel" ? 150*Math.max(1, v.barrels.length) : SHOP[id].price;
export function buy(F, id){
  const v = vineState(F), it = SHOP[id], price = it ? shopPrice(v, id) : 0; if (!it || F.coins < price) return null;
  if (id === "terrace") { if (v.terrace) return "The terrace is already out front."; v.terrace = true; }
  else if (id === "olive") { if (v.olive) return "You've an olive tree already. One's plenty."; v.olive = {planted: Date.now(), pickedAt: 0}; }
  else if (id === "grove") { if (v.grove) return "The grove's already planted."; if (!v.olive) return "Plant the first olive tree by the path, then the grove."; v.grove = {planted: Date.now(), pickedAt: 0}; }
  else if (id === "trellis") { const r = v.rows.find(x => !x.trellis); if (!r) return "Every row has a trellis already."; r.trellis = true; }
  else if (id === "barrel") { if (v.barrels.length >= 3) return "The cellar's full: three barrels is the most it holds."; v.barrels.push(null); }
  else v.cuttings[id === "cut_red" ? "red" : "white"]++;
  F.coins -= price; return it.say;
}
export function plantVine(F, r, i, kind){
  const v = vineState(F), row = v.rows[r]; if (!row || !row.trellis || row.vines[i] || !(v.cuttings[kind] > 0)) return null;
  v.cuttings[kind]--; row.vines[i] = {v: kind, planted: Date.now(), wateredAt: null}; return `A ${kind} vine, planted. Give it some water.`;
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
const W_WORD = {tempranillo: ["Tempranillo", "Reserva", "Crianza", "Tinto"], red: ["Red", "Reserve", "Rouge", "Old Vine"], rose: ["Rosé", "Blush", "Pink"], white: ["White", "Blanc", "Crisp"], sparkling: ["Bubbles", "Fizz", "Brut", "Sparkle"]};
const W_FR = {tempranillo: ["Puente Nuevo", "Tajo Reserva", "Viña Ronda", "Bodega Maple"], red: ["Château Maple", "Clos de la Baie", "Domaine du Lac", "Grand Cru Evan"], rose: ["Rosé de la Jetée", "Vie en Rose", "Clos des Cygnes"], white: ["Blanc de la Baie", "Domaine des Lanternes", "Clos du Matin"], sparkling: ["Cuvée Maple", "Crémant de la Baie", "Pétillant du Lac"]};
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
export function stock(F, id){ const v = vineState(F), c = v.cellar.find(x => x.id === id); if (!c) return null;
  const s = v.shelf.find(x => x.id === id); if (s) s.n += c.n; else v.shelf.push({id: c.id, name: c.name, type: c.type, n: c.n, price: STYLES[c.type].price, open: 0});
  v.cellar = v.cellar.filter(x => x.id !== id); return `${c.name} is on the shelves.`; }
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
      if (v.help.pick) { if (v.olive && at - (v.olive.pickedAt || v.olive.planted) >= OLIVE) { v.olive.pickedAt = at; v.oliveCrate = (v.oliveCrate || 0) + 2; out.olives = (out.olives || 0) + 2; }
        if (v.grove && at - (v.grove.pickedAt || v.grove.planted) >= OLIVE) { v.grove.pickedAt = at; v.oliveCrate = (v.oliveCrate || 0) + GROVE_JARS; out.olives = (out.olives || 0) + GROVE_JARS; } }
      if (v.help.barrels) v.barrels.forEach((b, i) => { if (b) return; const spare = c => v.grapes[c] - (v.keep[c] || 0) >= PER_BATCH, st = spare("tempranillo") ? "tempranillo" : spare("red") ? "red" : spare("white") ? "white" : null;
        if (st) { v.grapes[st] -= PER_BATCH; v.barrels[i] = {style: st, start: at, dur: STYLES[st].dur, stage: 1}; out.filled++; } });
    }
    if (w.staff && v.help.stock && v.cellar.length) { out.stocked += v.cellar.reduce((n, c) => n + c.n, 0); v.cellar.slice().forEach(c => stock(F, c.id)); }
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
    if (hm < 10*60 || hm >= 22*60) continue;
    const onShelf = v.shelf.filter(s => s.n > 0), open = v.shelf.find(s => s.open > 0); const crate = Object.keys(v.fruit).filter(id => v.fruit[id] > 0);
    if (!onShelf.length && !open && !platesLeft(v) && !crate.length) continue;
    const food = Object.keys(v.menu).filter(id => v.menu[id] > 0 && DISHES[id]), tap = tapasOn(v, new Date(at + off + 6*H).toISOString().slice(0, 10)).some(t => t.plates > 0);
    const f = footfall(hm, we, w.visitors) * (opts.serving && k === 1 ? 3 : w.staff ? 2 : 1) * (tap ? 1.4 : food.length ? 1.25 : 1) * (v.terrace ? 1.3 : 1) * (F.goals && F.goals.cellar ? 1.15 : 1);   // the cellar door (a big goal) draws a few more visitors
    const gameDay = new Date(at + off + 6*H).toISOString().slice(0, 10);   // the game's day (it turns over at 2am)
    const plate = () => servePlate(v, gameDay, out);
    if (onShelf.length && Math.random() < .002*f) { const s = onShelf[Math.floor(Math.random()*onShelf.length)]; if (Math.random() < winePf(s)) { s.n--; out.bottles++; out.coins += s.price; } }
    if (Math.random() < .0016*f) { // a glass in the tasting room, poured from an open bottle (a fresh one is opened when needed)
      const s = v.shelf.find(x => x.open > 0) || v.shelf.find(x => x.n > 0); if (s && Math.random() < winePf(s)) { if (!s.open) { s.n--; s.open = GLASSES; } s.open--; out.glasses++; out.coins += Math.max(1, Math.round(s.price/4)); if (Math.random() < .6) plate(); } }
    if (Math.random() < .001*f) plate();   // someone pops in just for a bite
    if (crate.length && Math.random() < .0018*f) { const id = crate[Math.floor(Math.random()*crate.length)]; v.fruit[id]--; if (!v.fruit[id]) delete v.fruit[id]; out.fruit = (out.fruit || 0) + 1; out.coins += (ITEMS[id] && ITEMS[id].sell) || 3; }   // fruit from Ma Ma's orchard
  }
  v.shelf = v.shelf.filter(s => s.n > 0 || s.open > 0);
  if (!out.coins && !out.watered && !out.picked && !out.filled && !out.stocked && !out.olives) return null;
  v.plates += out.plates;
  if (opts.serving) F.coins += out.coins; else v.box += out.coins;
  v.sold += out.bottles; v.glasses += out.glasses;
  const day = new Date(t + 8*H).toISOString().slice(0, 10); if (v.today.day !== day) v.today = {day, bottles: 0, glasses: 0, plates: 0, coins: 0};
  ["picked", "filled", "stocked"].forEach(x => { v.today[x] = (v.today[x] || 0) + out[x]; });
  v.today.plates = (v.today.plates || 0) + out.plates; v.today.bottles += out.bottles; v.today.glasses += out.glasses; v.today.coins += out.coins;
  return out;
}

/* ---------- panels ---------- */
const hrs = ms => { const m = Math.ceil(ms/60000); return m >= 60 ? `${Math.floor(m/60)}h ${m % 60}m` : `${m}m`; };
const bottleSVG = (type, s = 54) => bottleArt(type, s);
export function vinePanel(F, r, i){
  const v = vineState(F), row = v.rows[r], vn = row && row.vines[i];
  let h = `<span class="tape stripe" aria-hidden="true"></span><h2>Vine ${r + 1}.${i + 1}</h2>`;
  h += vineCloseup(vn, vn ? growth(vn) : 0, row.trellis);
  if (!row.trellis) return h + `<p class="sub">This row needs a trellis before vines can climb it. The vineyard stall sells them.</p><div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
  if (!vn) return h + `<p class="sub">An empty spot on the trellis. What shall we plant?</p><div class="actions">${grapeKinds(v).map(k => `<button class="btn ${v.cuttings[k] ? "primary" : "alt"} small" data-vy="plant" data-k="${k}" ${v.cuttings[k] ? "" : "disabled"}>${GRAPE_N[k]} vine (${v.cuttings[k]})</button>`).join("")}<button class="btn alt small" data-close="1">Close</button></div>${!v.cuttings.red && !v.cuttings.white ? `<p class="muted">No cuttings left: the stall has more.</p>` : ""}`;
  const g = growth(vn);
  return h + `<p class="sub">A ${vn.v} grape vine. ${!vn.wateredAt ? "Thirsty! Water it and it starts fruiting." : g >= 1 ? "Heavy with ripe grapes!" : `Ripening: ready in about ${hrs(GROW*(1 - g))}.`}</p>
    ${vn.wateredAt ? `<span class="clbar"><i style="width:${Math.round(g*100)}%"></i></span>` : ""}
    <div class="actions">${!vn.wateredAt ? `<button class="btn primary small" data-vy="water">Water the row</button>` : g >= 1 ? `<button class="btn primary small" data-vy="harvest">Pick the grapes</button>` : ""}<button class="btn alt small" data-close="1">Close</button></div>`;
}
export function stallPanel(F){
  const v = vineState(F);
  return `<span class="tape gingham" aria-hidden="true"></span><h2>Vineyard stall</h2><p class="sub">You have ${F.coins} coins. Cuttings: ${v.cuttings.red} red, ${v.cuttings.white} white${v.tempra ? `, ${v.cuttings.tempranillo} Tempranillo` : ""}. Grapes: ${v.grapes.red} red, ${v.grapes.white} white${v.tempra ? `, ${v.grapes.tempranillo} Tempranillo` : ""} bunches.</p>
    <div class="items shop">${Object.keys(SHOP).map(id => { const it = SHOP[id], price = shopPrice(v, id), have = (id === "grove" && !!v.grove) || (id === "trellis" && v.rows.every(r => r.trellis)) || (id === "barrel" && v.barrels.length >= 3) || (id === "olive" && !!v.olive) || (id === "terrace" && !!v.terrace), off = have || F.coins < price;
      return `<button class="item" data-vybuy="${id}" ${off ? "disabled" : ""}><span class="e">${stallIcon(id, off)}</span><span class="n">${esc(it.n)}</span><span class="c">${have ? "owned" : `<b>${price}</b> coins`}</span>${id === "terrace" ? `<span class="d">a third more customers</span>` : ""}</button>`; }).join("")}</div>
    <div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
}
export const vy = {name: {}};
const grapePic = c => `<svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true">${[[9, 8], [15, 8], [12, 12], [6, 12], [18, 12], [9, 16], [15, 16], [12, 20]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.2" fill="${c === "red" ? "#7A2E5A" : c === "tempranillo" ? "#3A2050" : "#C9D98A"}" stroke="#3A2E28" stroke-width="1"/>`).join("")}<path d="M12 5 V2" stroke="#3A2E28" stroke-width="1.2"/></svg>`;
export function barrelPanel(F){
  const v = vineState(F);
  let h = `<span class="tape stripe" aria-hidden="true"></span><h2>The barrels</h2><p class="sub">Three bunches make a barrel; a barrel makes ${BOTTLES} bottles.</p>`;
  // the grape crates: picked grapes wait here. Take some for the Scoop Shack (or put them back); Marco only fills
  // barrels from what's left over the amount Mel keeps back
  h += `<p class="eyebrow">The grape crates</p><ul class="hlist wlist orflowers grcrates">${grapeKinds(v).map(c => { const back = (F.inv || {})["grape_" + c] || 0;
    return `<li><span class="wpic">${grapePic(c)}</span><span class="wtxt"><b>${v.grapes[c]} ${c} bunch${v.grapes[c] === 1 ? "" : "es"}</b><small>${v.help.barrels ? `Marco keeps ${v.keep[c] || 0} back for you` : "picked and waiting"}</small></span>
      <span class="orbtns"><button class="btn small primary" data-vy="takegr" data-k="${c}" data-n="1" ${v.grapes[c] ? "" : "disabled"}>Take 1</button><button class="btn small alt" data-vy="takegr" data-k="${c}" data-n="99" ${v.grapes[c] ? "" : "disabled"}>All</button>${back ? `<button class="btn small alt" data-vy="putgr" data-k="${c}">Put back ${back}</button>` : ""}</span>
      ${v.help.barrels ? `<span class="grkeep"><span>Keep back from the barrels</span><span class="gstep"><button class="btn small alt" data-vy="keep" data-k="${c}" data-n="-1" aria-label="Keep fewer back">−</button><b>${v.keep[c] || 0}</b><button class="btn small alt" data-vy="keep" data-k="${c}" data-n="1" aria-label="Keep more back">+</button></span></span>` : ""}</li>`; }).join("")}</ul>
    <p class="muted">Grapes you take go in your backpack (for gelato at the Scoop Shack).${v.help.barrels ? " Marco fills empty barrels only from bunches beyond what you keep back." : ""}</p><div class="vbarrels">`;
  v.barrels.forEach((b, i) => {
    const ph = !b ? "empty" : barrelLeft(b) ? (b.style === "sparkling" && b.stage === 2 ? "bubbles" : "ferment") : b.style === "sparkling" && b.stage === 1 ? "await2" : "ready";
    h += `<div class="vbarrel">${barrelPic(ph, b ? STYLES[b.style].col : "", b ? STYLES[b.style].n : "")}<div class="vbody"><b>Barrel ${i + 1}</b>${b ? stageStrip(b.style, ph) : ""}`;
    if (!b) h += `<p class="muted">Empty.</p><div class="vbtns">${Object.keys(STYLES).filter(k => k !== "tempranillo" || v.tempra).map(k => { const st = STYLES[k], ok = v.grapes[st.grape] >= PER_BATCH; return `<button class="btn small ${ok ? "alt" : "alt"}" data-vy="fill" data-i="${i}" data-k="${k}" ${ok ? "" : "disabled"}>${st.n}</button>`; }).join("")}</div>`;
    else { const left = barrelLeft(b), st = STYLES[b.style];
      if (left) h += `<p>${st.n}${b.style === "sparkling" ? (b.stage === 1 ? ", first fermentation" : ", getting its bubbles") : ""}: ready in ${hrs(left)}.</p><span class="clbar"><i style="width:${Math.round(100*(1 - left/b.dur))}%"></i></span>`;
      else if (b.style === "sparkling" && b.stage === 1) h += `<p>First fermentation done. Now the bubbles.</p><button class="btn primary small" data-vy="second" data-i="${i}">Start the second fermentation</button>`;
      else h += `<p>${st.n} is ready to bottle!</p><label class="sr" for="vyName${i}">Name this wine</label><input id="vyName${i}" class="vyname" maxlength="30" placeholder="${esc(wineNames(F, i)[0] || "Name it")}" value="${esc(vy.name[i] || "")}"><button class="btn alt small" data-vy="suggest" data-i="${i}">Suggest a name</button><button class="btn primary small" data-vy="bottle" data-i="${i}">Bottle it</button>`; }
    h += `</div></div>`;
  });
  h += `</div>${v.cellar.length ? `<p class="eyebrow">In the cellar</p><ul class="hlist wlist">${v.cellar.map(c => `<li><span class="wpic">${bottleSVG(c.type)}</span><span class="wtxt"><b>${esc(c.name)}</b><small>${STYLES[c.type].n} · ${c.n} bottles</small></span></li>`).join("")}</ul><p class="muted">Take them to the wine shop to stock the shelves.</p>` : ""}`;
  return h + `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
}
// Fruit from the orchard goes in a crate by the shelves (all of one kind from the backpack at a time)
export function stockFruit(F, id){ const v = vineState(F), n = (F.inv || {})[id] || 0; if (!n || !ITEMS[id] || !ITEMS[id].fruit) return null;
  delete F.inv[id]; v.fruit[id] = (v.fruit[id] || 0) + n; return `${n} ${ITEMS[id].n.toLowerCase()}${n > 1 && !/s$/.test(ITEMS[id].n) ? "s" : ""} into the fruit crate.`; }
const fruitCrate = F => { const v = vineState(F), crate = Object.keys(v.fruit).filter(id => v.fruit[id] > 0), bag = Object.keys(F.inv || {}).filter(id => F.inv[id] > 0 && ITEMS[id] && ITEMS[id].fruit);
  if (!crate.length && !bag.length) return "";
  return `<p class="eyebrow">Fruit crate</p>${crate.length ? `<ul class="hlist wlist">${crate.map(id => `<li><span class="wpic">${icon(id, 36)}</span><span class="wtxt"><b>${esc(ITEMS[id].n)}</b><small>${v.fruit[id]} in the crate · ${ITEMS[id].sell || 3} coins each</small></span></li>`).join("")}</ul>` : `<p class="muted">Empty. Fruit from Ma Ma's orchard sells here too.</p>`}
    ${bag.length ? `<div class="vbtns">${bag.map(id => `<button class="btn small alt" data-vyfruit="${id}">${icon(id, 18)} Add ${F.inv[id]} ${esc(ITEMS[id].n.toLowerCase())}</button>`).join("")}</div>` : ""}`; };
export function shelfPanel(F){
  const v = vineState(F);
  return `<span class="tape gingham" aria-hidden="true"></span><h2>The wine shelves</h2>
    ${v.shelf.length ? `<ul class="hlist wlist wshelf">${v.shelf.map(s => `<li><span class="wpic">${bottleSVG(s.type)}</span><span class="wtxt"><b>${esc(s.name)}</b><small>${STYLES[s.type].n} · ${s.n} on the shelf${s.open ? ` · a bottle open for tasting` : ""}${s.price > STYLES[s.type].price*1.3 ? ` · pricey: fewer buyers` : s.price < STYLES[s.type].price*.75 ? ` · a bargain: flying off` : ""}</small></span><label class="wprice"><span class="sr">Price</span><input type="number" min="1" max="999" data-vyprice="${esc(s.id)}" value="${s.price}"> coins</label></li>`).join("")}</ul>` : `<p class="sub">The shelves are bare.</p>`}
    ${fruitCrate(F)}
    ${v.cellar.length ? `<p class="eyebrow">From the cellar</p><ul class="hlist wlist">${v.cellar.map(c => `<li><span class="wpic">${bottleSVG(c.type)}</span><span class="wtxt"><b>${esc(c.name)}</b><small>${STYLES[c.type].n} · ${c.n} bottles</small></span><button class="btn small primary" data-vystock="${esc(c.id)}">Stock it</button></li>`).join("")}</ul>` : `<p class="muted">Bottled wines wait in the cellar until you stock them here.</p>`}
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
export function pickOlives(F){ const v = vineState(F); if (!oliveRipe(v)) return null; v.olive.pickedAt = Date.now(); F.inv = F.inv || {}; F.inv.olives = (F.inv.olives || 0) + 2; return "Two jars of olives, into your backpack. Send them to the kitchen when you like."; }
// api: {save, rerender, say(line), sfx, r, i}
export function wireVine(root, F, api){
  root.querySelectorAll(".vyname").forEach(inp => inp.oninput = () => { vy.name[+inp.id.slice(6)] = inp.value; });
  root.querySelectorAll("[data-vy]").forEach(b => b.onclick = () => {
    const k = b.dataset.vy, i = +b.dataset.i; let line = null;
    if (k === "plant") line = plantVine(F, api.r, api.i, b.dataset.k);
    else if (k === "water") { line = waterVines(F, api.r); if (line) api.sfx("tap"); }
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
  root.querySelectorAll("[data-vyfruit]").forEach(b => b.onclick = () => { const line = stockFruit(F, b.dataset.vyfruit); if (line) { api.sfx("paper"); api.say(line); api.save(); api.rerender(); } });
  root.querySelectorAll("[data-vystock]").forEach(b => b.onclick = () => { const line = stock(F, b.dataset.vystock); if (line) { api.sfx("paper"); api.say(line); api.save(); api.rerender(); } });
  root.querySelectorAll("[data-vyhelp]").forEach(inp => inp.onchange = () => { vineState(F).help[inp.dataset.vyhelp] = inp.checked; api.save(); });
  root.querySelectorAll("[data-vyprice]").forEach(inp => inp.onchange = () => { setPrice(F, inp.dataset.vyprice, +inp.value); api.save(); });
}
