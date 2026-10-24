// The secret passage (round 244, Mel: "what if the cellar had a secret passageway that needed to be discovered"). Tomás
// Ruiz (the railwayman of 1912, Ines's great-great-grandfather: stories.js) found it. Mel's backstory: the Scoop Shack
// was once a little priory by the bay, and its monks dug the cave to bring wine down from the vineyard. Tomás bricked
// up the cellar end in 1912 and hid the key; his own bottles still sleep in a niche.
// A trail of clues over a few days, at most one new clue a day, and nothing is lost if Mel misses a day: each step
// waits for her.
//   1 a draught: the candle on the cellar's high table leans, Maple noses the barrel racks (on walking into the cellar)
//   2 the bricks: rolling a barrel aside shows old bricks, one scratched "T.R. 1912" (tap the racks, a later day)
//   3 the photograph: on the back of the old photo at the mill, "Where the stone turns, the key sleeps" (a later day)
//   4 the key: under the edge of the millstone, wrapped in oilcloth (straight after)
//   5 the door: the loose brick hides a keyhole; a narrow door opens on a passage to Tomás's old wine cave
// The cave: ageing alcoves (wine laid down gains 10% of its price a week, up to 80%), three forgotten bottles, a
// candlelit supper for four on Mondays 7 to 9pm that Mel hosts, and a rusty gate out to a hidden panel in the Scoop
// Shack's gelato kitchen.
import { ITEMS } from "../data/items.js";
import { esc } from "../util.js";
import { icon } from "../art/icons.js";
import { STYLES } from "./vineyard.js";

export const OLD = {
  old_r1923: {n: "A dusty 1923 red", ico: "oldred", label: "Tomás Ruiz, 1923. The year the mill's sails were mended."},
  old_s1958: {n: "A dusty 1958 sparkling", ico: "oldfizz", label: "Ruiz, 1958. Kept for a wedding."},
  old_w1931: {n: "A dusty 1931 white", ico: "oldwhite", label: "Ruiz, 1931. The good summer."}
};
Object.entries(OLD).forEach(([id, o]) => { ITEMS[id] = ITEMS[id] || {n: o.n, ico: o.ico, kind: "gift", to: ["dad", "gonggong", "mum", "darren", "mama", "angelina", "marcus"], price: 0, sell: 0,
  say: "From a secret cave under the vineyard? A hundred years old? I'm going to save it for something very special.", says: {gonggong: "Gong Gong was born after this bottle! Very old. Very precious.", dad: "Wah, 1920-something. We open this at Chinese New Year."}}; });

export const CAVE_MAX = 24, AGE_STEP = 7, AGE_MAX = 8, AGE_PCT = 10;   // bottles in the alcoves; `aged` counts weeks rested, each +10% of the style's price, up to eight (80%)
// coins a bottle gained for `weeks` rested (vineyard stock() adds this to the shelf price)
export const agedCoins = (type, weeks) => Math.round(((STYLES[type] || {}).price || 18)*AGE_PCT/100*Math.min(AGE_MAX, weeks || 0));
const agedTxt = (type, w) => `+${w*AGE_PCT}% (+${agedCoins(type, w)} a bottle)`;
export const SUPPER = {dow: 1, from: 19*60, to: 21*60, pay: 22, seats: [[200, 430, 1], [320, 430, -1], [200, 480, 1], [320, 480, -1]]};
const POOL = ["noor", "felix", "elena", "lila", "mateo", "hazel", "farid", "pilar", "celeste", "opal", "aiko", "ben"];
const hash = s => { let h = 0; for (const c of String(s)) h = (h*31 + c.charCodeAt(0)) | 0; return Math.abs(h); };
const DAY = 864e5, days = (a, b) => Math.round((Date.parse(b + "T00:00:00Z") - Date.parse(a + "T00:00:00Z"))/DAY);

export function secretState(F){ const s = F.secret = F.secret || {}; s.step = s.step || 0; s.laid = s.laid || []; s.old = s.old || {old_r1923: 1, old_s1958: 1, old_w1931: 1}; s.hosted = s.hosted || {}; return s; }
export const caveOpen = F => secretState(F).step >= 5;
// may the next clue happen today? (at most one a day, and never before the cellar door's built)
const fresh = (s, day) => s.day !== day;
const advance = (s, n, day) => { s.step = n; s.day = day; return n; };

// walking into the cellar -> a line for Maple (the first clue, or a nudge if Mel's mid-trail on a new day), or null
export function cellarEnter(F, day){
  const s = secretState(F); if (!(F.goals && F.goals.cellar)) return null;
  if (s.step === 0) { advance(s, 1, day); return "The candle on the high table keeps leaning sideways, as if something's breathing. Maple's nose is pressed to the barrel racks."; }
  if (!fresh(s, day) || s.said === day) return null; s.said = day;
  if (s.step === 1) return "That draught again, from behind the barrel racks. Maple won't leave them alone.";
  if (s.step === 2) return "T.R. 1912, scratched in the old bricks. The same initials are carved in the beam at the old mill. Maple looks at you as if to say: the mill?";
  if (s.step === 3) return "Where the stone turns, the key sleeps. The old millstone?";
  if (s.step === 4) return "The iron key's heavy in your pocket. The loose brick, perhaps?";
  return null;
}
// walking up to the old mill mid-trail on a new day -> a nudge from Maple, or null
export function millEnter(F, day){
  const s = secretState(F); if (!fresh(s, day) || s.millSaid === day) return null;
  if (s.step === 2) { s.millSaid = day; return "Maple trots straight to the old photograph by the mill door, and sits, tail sweeping. Tap the photograph."; }
  if (s.step === 3) { s.millSaid = day; return "Where the stone turns, the key sleeps. Maple's pawing at the old millstone by the press."; }
  return null;
}
// tapping the barrel racks: the bricks (step 1 -> 2 on a later day) -> line or null (null: open the barrel panel as usual)
export function racksTap(F, day){
  const s = secretState(F);
  if (s.step === 1 && fresh(s, day)) { advance(s, 2, day); return "You roll the end barrel aside. Behind the racks the plaster's crumbled away: old bricks, cold air whistling through, and one brick scratched with T.R. 1912. Tomás Ruiz carved those same initials at the old mill. Sleep on it, and tomorrow have a look round the mill."; }
  if (s.step === 1) return null;
  return null;
}
// the bricks themselves -> line
export function brickTap(F, day){
  const s = secretState(F);
  if (s.step === 4) { advance(s, 5, day); return "The scratched brick slides out. Behind it: a keyhole, crusted with rust. The iron key turns, stiff, then all at once. A narrow door groans open onto a stone passage, worn smooth by feet long gone, and a breath of cool air that smells of old oak and the sea."; }
  if (s.step >= 5) return null;
  if (s.step === 3) return "T.R. 1912. You still need that key: where the stone turns... The old millstone, by the mill's press?";
  if (s.step === 2 && !fresh(s, day)) return "T.R. 1912. The brick moves, just a little, but it won't come out. Tomás's initials are carved at the old mill too: have a look there tomorrow.";
  if (s.step === 2) return "T.R. 1912. The brick won't budge. Tomás left his mark at the old mill too: the old photograph by the mill door, perhaps?";
  return "T.R. 1912. Tomás Ruiz? The railwayman who planted the olive tree by the mill, Ines's great-great-grandfather. His initials are carved in the beam at the old mill too. You run a finger over the brick: it moves, just a little.";
}
// the old photograph at the mill (step 2 -> 3 on a later day) -> line or null (null: the usual story)
export function photoTap(F, day){
  const s = secretState(F);
  if (s.step === 2 && fresh(s, day)) { advance(s, 3, day); return "You lift the old photograph off its nail. On the back, in faded brown ink: \"Where the stone turns, the key sleeps. T.R.\" The stone that turns: the old millstone, by the press."; }
  if (s.step === 2) return "The old photograph: the mill in 1912, and a man on a ladder mending the sails. You've had enough secrets for one day. Come back tomorrow and look again.";   // Mel: it said nothing when it was too early
  return null;
}
// the millstone (step 3 -> 4 the same day or later) -> line or null
export function stoneTap(F, day){
  const s = secretState(F);
  if (s.step === 3) { s.step = 4; s.key = day; return "You run your hand under the lip of the old millstone. Wrapped in oilcloth, wedged in a gap in the stone: a heavy iron key, long as your hand."; }
  return null;
}

/* ---------- the ageing alcoves ---------- */
export const laidCount = F => secretState(F).laid.reduce((n, l) => n + l.n, 0);
export const bonus = (l, day) => Math.min(AGE_MAX, Math.floor(Math.max(0, days(l.at, day))/AGE_STEP));
// lay a cellar wine down (as many bottles as fit) -> {n} or {msg}
export function layDown(F, v, id, day){
  const s = secretState(F), c = v.cellar.find(x => x.id === id); if (!c) return {msg: "That's not in the cellar."};
  const room = CAVE_MAX - laidCount(F); if (room < 1) return {msg: "The alcoves are full: twenty-four bottles resting."};
  const n = Math.min(room, c.n); c.n -= n; if (!c.n) v.cellar = v.cellar.filter(x => x !== c);
  s.laid.push({id: c.id, name: c.name, type: c.type, n, at: day, aged: c.aged || 0}); return {n};
}
// bring a laid-down lot back up to the cellar, wiser: its bonus rides on the bottles (vineyard stock() adds c.aged)
export function bringUp(F, v, i, day){
  const s = secretState(F), l = s.laid[i]; if (!l) return null;
  const aged = Math.min(AGE_MAX, (l.aged || 0) + bonus(l, day)); s.laid.splice(i, 1);
  v.cellar.push({id: l.id + "a" + Date.now().toString(36).slice(-3), name: l.name, type: l.type, n: l.n, aged, hold: true});
  return {n: l.n, aged, name: l.name, pct: aged*AGE_PCT, coins: agedCoins(l.type, aged)};
}

/* ---------- the forgotten bottles ---------- */
export function takeOld(F, id, open){
  const s = secretState(F); if (!s.old[id]) return null; s.old[id] = 0;
  if (open) return {opened: true};
  F.inv = F.inv || {}; F.inv[id] = (F.inv[id] || 0) + 1; return {opened: false};
}

/* ---------- Monday suppers ---------- */
export const supperOn = day => new Date(day + "T00:00:00Z").getUTCDay() === SUPPER.dow;
export const supperNow = (day, hm) => supperOn(day) && hm >= SUPPER.from && hm < SUPPER.to;
export function supperGuests(day){ const pool = [...POOL], out = []; let k = 0; while (out.length < 4 && pool.length) { const i = hash(day + ":supper:" + k++) % pool.length; out.push(pool.splice(i, 1)[0]); } return out; }
export function supperSlot(id, day, hm){
  if (!supperNow(day, hm)) return null; const i = supperGuests(day).indexOf(id); if (i < 0) return null;
  const [x, y, d] = SUPPER.seats[i]; return {from: SUPPER.from, to: SUPPER.to, scene: "winecave", at: [x, y], dir: d, act: "sit"};
}
// Mel hosts (tap the table during supper): once a night -> {coins} or null
export function host(F, day){ const s = secretState(F); if (s.hosted[day]) return null; s.hosted = {[day]: true}; const coins = 4*SUPPER.pay; F.coins = (F.coins || 0) + coins; return {coins}; }

/* ---------- the cave's panels (core.js opens them with caveView) ---------- */
const tape = `<span class="tape gingham" aria-hidden="true"></span>`, shut = `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
const TYPE = {red: "Red", rose: "Rosé", white: "White", sparkling: "Sparkling", pinot: "Pinot noir", priory: "Priory red", tempranillo: "Tempranillo", chardonnay: "Chardonnay"};
export function alcovesPanel(F, v, day){
  const s = secretState(F), n = laidCount(F);
  let h = `${tape}<h2>The ageing alcoves</h2><p class="sub">Cool and still, the way the monks built it. Wine laid down here gains ${AGE_PCT}% of its price for every week it rests, up to ${AGE_MAX*AGE_PCT}%. ${n} of ${CAVE_MAX} places taken.</p>`;
  if (s.laid.length) h += `<p class="eyebrow">Resting</p><ul class="hlist wlist">${s.laid.map((l, i) => { const b = Math.min(AGE_MAX, (l.aged || 0) + bonus(l, day));
    return `<li><span class="wtxt"><b>${esc(l.name)}</b><small>${TYPE[l.type] || ""} · ${l.n} bottle${l.n === 1 ? "" : "s"} · ${b ? `${agedTxt(l.type, b)} so far` : "laid down this week"}</small></span><button class="btn small alt" data-cave="up:${i}">Bring it up</button></li>`; }).join("")}</ul>`;
  const down = (v.cellar || []).filter(c => c.n > 0 && !c.rack);
  h += `<p class="eyebrow">From the cellar</p>` + (down.length ? `<ul class="hlist wlist">${down.map(c => `<li><span class="wtxt"><b>${esc(c.name)}</b><small>${TYPE[c.type] || ""} · ${c.n} bottle${c.n === 1 ? "" : "s"}${c.aged ? ` · already ${agedTxt(c.type, c.aged)}` : ""}</small></span><button class="btn small primary" data-cave="lay:${esc(c.id)}" ${n >= CAVE_MAX ? "disabled" : ""}>Lay it down</button></li>`).join("")}</ul>` : `<p class="muted">Nothing waiting in the cellar. Bottle a barrel, or keep a wine back, and it can rest here.</p>`);
  return h + `<p class="muted">Brought up, it waits in the cellar (kept back) and sells for the extra on the shelves.</p>` + shut;
}
export function oldPanel(F){
  const s = secretState(F), left = Object.keys(OLD).filter(k => s.old[k]);
  let h = `${tape}<h2>Forgotten bottles</h2><p class="sub">Three bottles under a hundred years of dust, each with a paper tag in Tomás's hand.</p>`;
  if (!left.length) return h + `<p class="muted">The niche is empty now, just a candle and the cobwebs.</p>` + shut;
  h += `<ul class="hlist wlist">${left.map(k => `<li style="flex-wrap:wrap"><span class="wpic">${icon(OLD[k].ico, 34)}</span><span class="wtxt"><b>${esc(OLD[k].n)}</b><small>"${esc(OLD[k].label)}"</small></span>
    <span style="flex-basis:100%;display:flex;gap:6px;justify-content:flex-end"><button class="btn small primary" data-cave="take:${k}">Keep it</button><button class="btn small alt" data-cave="open:${k}">Open it here</button></span></li>`).join("")}</ul>`;
  return h + `<p class="muted">Kept, it goes in your backpack: a gift the family will treasure.</p>` + shut;
}
export function tablePanel(F, day, hm, here){
  const s = secretState(F), on = supperNow(day, hm);
  let h = `${tape}<h2>The supper table</h2>`;
  if (!on) return h + `<p class="sub">Mondays, 7 to 9pm: a candlelit supper for four down here. Come and host, and they'll pay ${SUPPER.pay} coins each.</p>` + shut;
  if (s.hosted[day]) return h + `<p class="sub">Supper's under way: candlelight, old stories and the good glasses. You're hosting tonight.</p>` + shut;
  return h + `<p class="sub">Four guests at the long table${here ? "" : " (on their way down)"}. Light the candelabra and pour?</p><div class="actions"><button class="btn primary" data-cave="host">Host supper</button></div>` + shut;
}
