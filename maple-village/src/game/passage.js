// Round 229: the secret passage (the creator's brief). Long ago the Scoop Shack was a little priory by the bay: its
// brothers kept vines on the hill and dug a wine cave and a passage under the vineyard down to the boats. In 1912 Tomás,
// the railwayman who planted the olive by the old mill, found it mending the cellar, laid down a few bottles of his own,
// bricked the cellar end up and hid the key under the millstone.
// The clue trail starts once the cellar door is built, at most one new clue a day (missed days just wait):
//   1 a draught (walking into the cellar: the candle leans, the pet noses at the racks), 2 the bricks (a later day: tap
//   the racks), 3 the photograph (a later day: the back of the one at the mill), 4 the key (straight after: under the
//   millstone's lip), 5 the door (the scratched brick hides a keyhole). On a new day mid-trail the pet gives a nudge.
// Then the wine cave (art/cave.js): ageing alcoves, Tomás's three forgotten bottles, the brothers' press, Monday
// candlelit suppers, and the gate through to a hidden panel in the Scoop Shack's gelato kitchen.
// State: F.passage = {step, day (of the last clue), nudged, cave, kitchen, aged: [{id, name, type, n, at, base}],
//   bottles: {id: "kept" | "opened"}, supper (the Monday last hosted), pressN}
import { ITEMS } from "../data/items.js";
import { STYLES, RIDDLE, riddleDays, vineState } from "./vineyard.js";
import { esc, hash } from "../util.js";
import { icon } from "../art/icons.js";
import { bottleArt } from "../art/wine.js";

export const STEP = {draught: 1, bricks: 2, photo: 3, key: 4, open: 5};
export const AGE = {perWeek: .1, maxWeeks: 8, cap: 24};   // up to 24 bottles; +10% of the base price a bottle for each full week, up to 8 weeks (+80%)
export const SUPPER = {dow: 1, from: 19*60, to: 21*60, fee: 22, guests: 4};
const WEEK = 7*864e5;
export function passState(F){ F.passage = F.passage || {}; const p = F.passage; p.step = p.step || 0; p.day = p.day || ""; p.aged = p.aged || []; p.bottles = p.bottles || {}; p.supper = p.supper || ""; return p; }
export const found = F => ((F.passage && F.passage.step) || 0) >= STEP.open;
const built = F => !!(F.goals && F.goals.cellar);

// the trail: can step k happen today? (the draught on any visit once the cellar's built; the bricks and the photograph
// on a later day than the clue before; the key straight after the photograph; the door whenever you've the key)
export function due(F, k, day){ const p = passState(F); if (!built(F) || p.step !== k - 1) return false; return k === STEP.bricks || k === STEP.photo ? day > p.day : true; }
const LINES = {
  draught: "The candle on the high table keeps leaning sideways, though there isn't a window down here. {pet} noses at the barrel racks, sniffing hard.",
  bricks: "You roll the end barrel aside. Behind the racks the plaster's crumbled away: old bricks, cold air whistling through, and one brick scratched with T.R. 1912.",
  photo: "You turn the old photograph over. Under “Tomás, 1912”, in faded ink: “Where the stone turns, the key sleeps. T.R.”",
  key: "You feel under the millstone's lip. Wrapped in oilcloth and tucked in tight: a heavy iron key.",
  open: "The scratched brick slides out to show a keyhole. The iron key turns with a clunk, and a narrow arched door swings open onto a stone passage. Cool air, and the smell of old oak."
};
// move the trail on if step k is due today: -> its line, or null
export function clue(F, k, day){ const n = STEP[k]; if (!due(F, n, day)) return null; const p = passState(F); p.step = n; p.day = day; return LINES[k]; }
// the old bricks, once found and before the door's open
export const BRICKS_LINE = "Old bricks, cold air whistling through the gaps. One's scratched T.R. 1912: the same initials as the beam over the press at the old mill.";
// walking into the cellar: the draught the first time, and a gentle nudge from the pet on a new day mid-trail
const NUDGE = {1: "{pet} trots straight over to the barrel racks again and sniffs along the bottom. That draught's still there.",
  2: "{pet} sits by the old bricks, nose to the scratched one. T.R. 1912... Perhaps the old mill knows more.",
  3: "{pet} looks from the old bricks to you. Where does a stone turn, at the old mill?",
  4: "{pet} paws at the scratched brick, tail going. That iron key's still in your pocket."};
export function cellarLine(F, day){
  const p = passState(F); if (!built(F)) return null;
  if (!p.step) return clue(F, "draught", day);
  if (p.step >= STEP.open || p.nudged === day || day <= p.day) return null;
  p.nudged = day; return NUDGE[p.step];
}

// ageing in the cave: a wine's base price (its own, or its style's plus any riddling), and what resting adds
export const basePrice = (c, now = Date.now()) => c.price || STYLES[c.type].price + RIDDLE.day*riddleDays(c, now);
export const ageWeeks = (lot, now = Date.now()) => Math.min(AGE.maxWeeks, Math.floor(Math.max(0, now - lot.at)/WEEK));
export const ageBonus = (lot, now = Date.now()) => Math.round(lot.base*AGE.perWeek*ageWeeks(lot, now));
export const agedCount = F => passState(F).aged.reduce((a, l) => a + l.n, 0);
// lay down as much of a wine from the cellar as the alcoves hold: -> bottles laid down, or 0
export function layDown(F, id, now = Date.now()){
  const v = vineState(F), c = v.cellar.find(x => x.id === id), p = passState(F), n = c ? Math.min(c.n, AGE.cap - agedCount(F)) : 0; if (!n) return 0;
  p.aged.push({id: c.id, name: c.name, type: c.type, n, at: now, base: basePrice(c, now)});
  c.n -= n; if (!c.n) v.cellar = v.cellar.filter(x => x !== c); return n;
}
// bring a lot back up: to the cellar, kept back from the staff, at its base price plus the ageing -> the cellar entry
export function bringUp(F, i, now = Date.now()){
  const p = passState(F), lot = p.aged[i]; if (!lot) return null;
  const v = vineState(F), bonus = ageBonus(lot, now), id = bonus ? `${lot.id}-aged${bonus}` : lot.id, price = lot.base + bonus;
  p.aged.splice(i, 1);
  let c = v.cellar.find(x => x.id === id && (x.price || basePrice(x, now)) === price);
  if (c) { c.n += lot.n; c.keep = true; } else { c = {id, name: bonus ? `${lot.name} (cave-aged)` : lot.name, type: lot.type, n: lot.n, price, keep: true}; v.cellar.push(c); }
  return Object.assign({bonus}, c);
}
export function alcovePanel(F, now = Date.now()){
  const p = passState(F), v = vineState(F), left = AGE.cap - agedCount(F);
  let h = `<span class="tape stripe" aria-hidden="true"></span><h2>The ageing alcoves</h2><p class="sub">The brothers' old alcoves hold ${AGE.cap} bottles. A wine resting here gains ${Math.round(AGE.perWeek*100)}% of its bottle price for every full week, up to ${AGE.maxWeeks} weeks (${Math.round(AGE.perWeek*AGE.maxWeeks*100)}% more). Bring it up and it waits in the cellar (kept back from the staff) to sell for the extra.</p>`;
  h += p.aged.length ? `<ul class="hlist wlist">${p.aged.map((l, i) => { const w = Math.floor((now - l.at)/WEEK), b = ageBonus(l, now);
    return `<li><span class="wpic">${bottleArt(l.type, 54)}</span><span class="wtxt"><b>${esc(l.name)}</b><small>${l.n} bottle${l.n === 1 ? "" : "s"} · ${w ? `${w} week${w === 1 ? "" : "s"} resting${w >= AGE.maxWeeks ? " (as good as it gets)" : ""}` : "laid down this week"} · ${l.base + b} a bottle${b ? ` (+${b})` : ""}</small></span><button class="btn small alt" data-pass="up" data-k="${i}">Bring up</button></li>`; }).join("")}</ul>` : `<p class="muted">Empty, and cobwebby. Lay some wine down from the cellar.</p>`;
  h += `<p class="eyebrow">In the cellar (room for ${left} more)</p>`;
  h += v.cellar.length ? `<ul class="hlist wlist">${v.cellar.map(c => `<li><span class="wpic">${bottleArt(c.type, 54)}</span><span class="wtxt"><b>${esc(c.name)}</b><small>${c.n} bottle${c.n === 1 ? "" : "s"} · ${basePrice(c, now)} a bottle</small></span><button class="btn small primary" data-pass="lay" data-k="${esc(c.id)}" ${left ? "" : "disabled"}>Lay down ${Math.min(c.n, left) || ""}</button></li>`).join("")}</ul>` : `<p class="muted">No bottles waiting in the cellar just now.</p>`;
  return h + `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
}

// Tomás's three forgotten bottles: keep one (a keepsake, to treasure or give a friend) or open it here
export const OLD = [
  {id: "ob_1923", type: "red", n: "Tomás's 1923 red", tag: "Red, 1923. The year the olive first fruited. T.R.",
    taste: "You ease the cork out. Brick red at the rim and still singing: dried cherries, cedar and a breath of the hill. You raise your glass to the vault: to Tomás."},
  {id: "ob_1931", type: "white", n: "Tomás's 1931 white", tag: "White, 1931. A dry summer, a sweet harvest. T.R.",
    taste: "Gold as old honey now, nutty, with a twist of lemon peel at the end. You raise your glass to the candles: to Tomás, and his dry summer."},
  {id: "ob_1958", type: "sparkling", n: "Tomás's 1958 sparkling", tag: "Sparkling, 1958. For whoever finds the key. T.R.",
    taste: "The cork goes with a soft sigh, not a pop. Tiny lazy bubbles, toasted brioche and baked apple. {pet} sneezes at the fizz. To Tomás, who left it for whoever found the key."}];
OLD.forEach(b => { ITEMS[b.id] = {n: b.n, kind: "keepsake", to: "family", price: 0, ico: b.id, line: `A dusty bottle from the wine cave, with a tag in Tomás's hand: “${b.tag}” Too precious to sell: treasure it, or give it to a friend.`,
  say: "From the old wine cave? With Tomás's own tag on it! I'll never open it. Well. Maybe on a very special day."}; });
export const bottlesLeft = F => OLD.filter(b => !passState(F).bottles[b.id]);
export function bottlesPanel(F){
  const left = bottlesLeft(F);
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>Forgotten bottles</h2><p class="sub">Dusty bottles in an old crate, each with a paper tag tied round its neck in Tomás's careful hand.</p>`;
  h += left.length ? `<ul class="hlist wlist">${left.map(b => `<li><span class="wpic">${icon(b.id, 44)}</span><span class="wtxt"><b>${esc(b.n)}</b><small>“${esc(b.tag)}”</small><span class="actions" style="margin-top:6px"><button class="btn small primary" data-pass="keep" data-k="${b.id}">Keep it</button><button class="btn small alt" data-pass="open" data-k="${b.id}">Open it here</button></span></span></li>`).join("")}</ul>` : `<p class="muted">Just straw and dust now.</p>`;
  return h + `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
}
// -> {line, keep?} or null; keeping puts it in the backpack (addInv)
export function takeBottle(F, id, how, addInv){
  const b = OLD.find(x => x.id === id), p = passState(F); if (!b || p.bottles[id]) return null;
  p.bottles[id] = how === "keep" ? "kept" : "opened";
  if (how === "keep") { addInv(id, 1); return {keep: true, line: `${b.n}, wrapped in your scarf and into the backpack: a keepsake to treasure, or to give a friend.`}; }
  return {line: b.taste};
}

// the brothers' old press
export const PRESS_LINES = ["The brothers' wine press: an oak beam as thick as a tree, and a wooden screw worn smooth by hands.",
  "There are still purple stains in the grain of the basket. Hundreds of years of harvests.",
  "Someone has carved a tiny bunch of grapes into the beam, and a date too worn to read.",
  "You give the great screw a push. It creaks round a quarter turn, and stops. Strong, those brothers."];

// Monday candlelit suppers, 7 to 9pm: four villagers at the long table; host once a night, 22 coins a guest
export const supperOn = day => new Date(day + "T00:00:00Z").getUTCDay() === SUPPER.dow;
export const supperNow = (day, hm) => supperOn(day) && hm >= SUPPER.from && hm < SUPPER.to;
const SUP_POOL = ["hana", "okada", "juniper", "bo", "lin", "opal", "theo", "marco", "ines", "hazel", "farid", "mei", "felix", "elena", "noor"];
// beside the long table, not on it: two on the bench behind, two on the bench in front ([x, y, facing])
export const SUP_SEATS = [[206, 374, 1], [314, 374, -1], [206, 466, 1], [314, 466, -1]];
export function supperGuests(day, skip = []){
  const pool = SUP_POOL.filter(v => !skip.includes(v)), out = [];
  for (let k = 0; pool.length && out.length < SUPPER.guests && k < 40; k++) { const v = pool[hash(day + ":supper:" + k) % pool.length]; if (!out.includes(v)) out.push(v); }
  return out;
}
export function supperSlot(id, day, hm, skip){
  if (!supperNow(day, hm)) return null; const k = supperGuests(day, skip).indexOf(id); if (k < 0) return null;
  const [x, y, d] = SUP_SEATS[k]; return {from: SUPPER.from, to: SUPPER.to, scene: "cave", at: [x, y], dir: d, act: "sit", supper: true};
}
// tapping the table: -> {coins, line} when hosting, else {line}
export function supperTap(F, day, hm){
  const p = passState(F);
  if (!supperNow(day, hm)) return {line: `The brothers' long table. On Monday evenings, ${fmt(SUPPER.from)} to ${fmt(SUPPER.to)}, it's laid with candles for a supper: four friends come down, and you can host them, ${SUPPER.fee} coins a guest.`};
  if (p.supper === day) return {line: "Second helpings all round, and the candles burning low. Tonight's supper is already yours."};
  p.supper = day; return {coins: SUPPER.fee*SUPPER.guests, line: "You host the candlelit supper: bread, olives, a pot of stew and your own wine poured by candlelight. Everyone talks at once, and the old vault rings with laughing."};
}
const fmt = m => `${Math.floor(m/60) % 12 || 12}${m % 60 ? ":" + String(m % 60).padStart(2, "0") : ""}${m >= 12*60 ? "pm" : "am"}`;

// the gate to the Scoop Shack, and the hidden panel there (only once you've come through)
export const GATE_IN = [260, 214], KITCHEN_IN = [70, 446];
export const CAVE_FIRST = "A wine cave! A brick vault, candles in their niches and the smell of old oak. Over the far gate someone has carved VINUM LAETIFICAT COR: wine gladdens the heart.";
export function throughGate(F){ const p = passState(F), first = !p.kitchen; p.kitchen = 1;
  return first ? "The passage runs downhill under the vineyard, then a section of shelving swings open and you're... in the Scoop Shack's kitchen! Of course: long ago the Scoop Shack was the brothers' little priory by the bay." : null; }
// the info the cave's art needs
export const caveInfo = (F, day, hm) => { const p = passState(F); return {aged: agedCount(F), bottles: bottlesLeft(F).map(b => b.id), laid: supperNow(day, hm)}; };
