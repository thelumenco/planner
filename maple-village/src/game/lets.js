// The holiday cottages (round 236, Mel: "a mini landlord game in itself"): Elena sells Fig Tree, then Bluebell.
// Mel picks a look, buys furniture out of the catalogue (it comes on the next morning's train), sets a buffer
// between guests and blocks off weeks on the bookings calendar. Guests come and go on the train: check-in at three,
// check-out at ten. After every stay the cottage needs turning round (beds, bathroom, tidy, the hot tub); a fruit
// basket and welcome treats in the fridge are the touches that earn the best reviews. Hattie can be hired to do
// the cleaning part. Pure logic: core.js draws the rooms and panels.
import { hash } from "../util.js";
import { COTTAGES, COTTAGE_IDS, STYLES, PIECES, PIECE_IDS, ACCESSORIES, ACC_IDS, BASICS, TASKS, FRUIT, TREATS, HOUSEKEEPER, CHECKOUT, CHECKIN, DELIVERY, HORIZON } from "../data/cottages.js";

// the out-of-towners who come to stay (the same people as tours.js TOURISTS; listed here to keep imports one way)
export const GUESTS = ["aiko", "ben", "clara", "dev", "rosa", "bastien", "grace", "hiro"];
const DAY = 864e5;
export const addDays = (day, n) => new Date(Date.parse(day + "T00:00:00Z") + n*DAY).toISOString().slice(0, 10);
const dow = day => new Date(day + "T00:00:00Z").getUTCDay();
export const mondayOf = day => addDays(day, -((dow(day) + 6) % 7));
const due = (day, hm, d, t) => day > d || (day === d && hm >= t);

export function letState(F){
  const L = F.lets = F.lets || {};
  for (const k of ["owned", "style", "tiers", "acc", "blocked", "buffer", "stays", "horizon", "turn", "keeper", "basket", "fridge"]) L[k] = L[k] || {};
  COTTAGE_IDS.forEach(c => { L.tiers[c] = L.tiers[c] || {}; L.acc[c] = L.acc[c] || {}; L.blocked[c] = L.blocked[c] || []; L.stays[c] = L.stays[c] || []; if (L.buffer[c] == null) L.buffer[c] = 1; });
  L.orders = L.orders || []; L.reviews = L.reviews || []; L.earned = L.earned || 0;
  return L;
}
export const owns = (F, c) => !!letState(F).owned[c];
export const ownsAny = F => COTTAGE_IDS.some(c => owns(F, c));
// Fig Tree's for sale from the start (Elena's letter); Bluebell once Fig Tree has had its first guests
export const forSale = (F, c) => !owns(F, c) && (c === "figtree" || (owns(F, "figtree") && letState(F).stays.figtree.some(s => s.done)));
export function buy(F, c, day){
  const L = letState(F), p = COTTAGES[c].price;
  if (!forSale(F, c)) return {ok: false, msg: "That one's not for sale yet."};
  if ((F.coins || 0) < p) return {ok: false, msg: `${COTTAGES[c].n} is ${p.toLocaleString()} coins. Not quite yet.`};
  F.coins -= p; L.owned[c] = day; return {ok: true};
}
export function setStyle(F, c, style){
  const L = letState(F); if (!owns(F, c) || !STYLES[style] || L.style[c] === style) return {ok: false};
  const cost = L.style[c] ? 120 : 0;
  if ((F.coins || 0) < cost) return {ok: false, msg: `Repainting costs ${cost} coins.`};
  F.coins -= cost; L.style[c] = style; return {ok: true, cost};
}

/* ---------- the catalogue ---------- */
export const tierOf = (F, c, id) => letState(F).tiers[c][id] || 0;
export const pending = (F, c, id) => letState(F).orders.find(o => o.c === c && o.id === id);
// what the catalogue offers next for a piece: {tier (1..3), n, price} or null when it's at its best
export function nextTier(F, c, id){
  const p = PIECES[id], t = tierOf(F, c, id); if (!p || t >= 3) return null;
  return {tier: t + 1, ...p.tiers[t]};
}
export function order(F, c, id, day){
  const L = letState(F); if (!owns(F, c)) return {ok: false, msg: "Buy the cottage first."};
  if (pending(F, c, id)) return {ok: false, msg: "That's already coming on tomorrow's train."};
  let price, tier = 1, n;
  if (PIECES[id]) { const nx = nextTier(F, c, id); if (!nx) return {ok: false, msg: "That's as lovely as it gets."}; ({price, tier, n} = nx); }
  else if (ACCESSORIES[id]) { if (L.acc[c][id]) return {ok: false, msg: "Already there."}; ({price, n} = ACCESSORIES[id]); }
  else return {ok: false};
  if ((F.coins || 0) < price) return {ok: false, msg: `${n} is ${price} coins.`};
  F.coins -= price; L.orders.push({c, id, tier, n, price, day: addDays(day, 1)});
  return {ok: true, n, price};
}
export const ordersFor = (F, c) => letState(F).orders.filter(o => o.c === c);

/* ---------- how nice it is, and what it earns ---------- */
export function comfort(F, c){
  const L = letState(F);
  return PIECE_IDS.reduce((n, k) => n + (L.tiers[c][k] || 0)*(k === "hottub" || k === "bed" ? 2 : 1), 0) + ACC_IDS.filter(k => L.acc[c][k]).length;
}
export const isOpen = (F, c) => owns(F, c) && !!letState(F).style[c] && BASICS.every(k => tierOf(F, c, k) > 0);
// the listing's stars, from 2 (the basics) up to 5 (comfort 48 and over); in halves
export const stars = (F, c) => Math.min(5, Math.max(2, Math.round((2 + comfort(F, c)/16)*2)/2));
export function rating(F, c){
  const r = letState(F).reviews.filter(v => v.c === c).slice(0, 10); if (!r.length) return null;
  return Math.round(r.reduce((n, v) => n + v.score, 0)/r.length*10)/10;
}
export const rate = (F, c) => Math.round(COTTAGES[c].base*(0.7 + 0.1*stars(F, c)));
// the chance (in a hundred) that any free day starts a booking: nicer cottages with better reviews fill up
export function occupancy(F, c){ const r = rating(F, c); return Math.max(30, Math.min(85, Math.round(38 + stars(F, c)*6 + (r == null ? 0 : (r - 3.5)*10)))); }

/* ---------- the bookings calendar ---------- */
export const isBlocked = (F, c, day) => letState(F).blocked[c].includes(mondayOf(day));
const guestsFor = (id, n) => { const out = []; let k = 0; while (out.length < n && k < 20) { const g = GUESTS[hash(id + ":" + k++) % GUESTS.length]; if (!out.includes(g)) out.push(g); } return out; };
// fill the calendar up to HORIZON days ahead; bookings start no sooner than the day after tomorrow, and each one
// leaves the cottage's buffer free before the next (0 days: a same-day changeover between ten and three)
export function extend(F, c, today){
  const L = letState(F); if (!isOpen(F, c)) return;
  const st = L.stays[c], last = st[st.length - 1], end = addDays(today, HORIZON), buf = L.buffer[c];
  let cur = [L.horizon[c], last ? addDays(last.out, buf) : null, addDays(today, 2)].filter(Boolean).sort().pop();
  const occ = occupancy(F, c);
  while (cur <= end) {
    if (isBlocked(F, c, cur)) { cur = addDays(mondayOf(cur), 7); continue; }
    if (hash(`${c}:${cur}`) % 100 < occ) {
      let n = 2 + hash(`${c}:${cur}:n`) % 3;
      while (n >= 2 && Array.from({length: n}, (_, i) => addDays(cur, i)).some(d => isBlocked(F, c, d))) n--;
      if (n >= 2) { const id = `${c}:${cur}`; st.push({id, in: cur, out: addDays(cur, n), n, who: guestsFor(id, 2)}); cur = addDays(cur, n + buf); continue; }
    }
    cur = addDays(cur, 1);
  }
  L.horizon[c] = cur;
}
// after a change of buffer or a blocked week: keep stays that have started or begin within three days (unless
// they fall in a blocked week), and let the rest of the calendar fill again round the new rules
function refill(F, c, today){
  const L = letState(F), soon = addDays(today, 3);
  const keep = s => s.checkedIn || (s.in <= soon && !Array.from({length: s.n}, (_, i) => addDays(s.in, i)).some(d => isBlocked(F, c, d)));
  const before = L.stays[c].filter(s => !s.done && !s.checkedIn).length;
  L.stays[c] = L.stays[c].filter(s => s.done || keep(s)); delete L.horizon[c];
  extend(F, c, today);
  return before;
}
export function setBlocked(F, c, monday, on, today){
  const L = letState(F), b = L.blocked[c];
  const had = L.stays[c].filter(s => !s.done && !s.checkedIn && Array.from({length: s.n}, (_, i) => addDays(s.in, i)).some(d => mondayOf(d) === monday)).length;
  if (on && !b.includes(monday)) b.push(monday); if (!on) L.blocked[c] = b.filter(m => m !== monday);
  refill(F, c, today); return {cancelled: on ? had : 0};
}
export function setBuffer(F, c, n, today){ const L = letState(F); L.buffer[c] = Math.max(0, Math.min(3, n)); refill(F, c, today); }
export const staysFor = (F, c) => letState(F).stays[c];
export const current = (F, c) => letState(F).stays[c].find(s => s.checkedIn && !s.done) || null;
export const nextStay = (F, c) => letState(F).stays[c].find(s => !s.checkedIn && !s.done) || null;
// what a calendar day looks like: "in" (arrival), "stay", "out" (departure morning), "turn" (out and in the same day),
// "buffer", "blocked" or "free"
export function dayState(F, c, day){
  const L = letState(F), st = L.stays[c];
  const out = st.find(s => s.out === day), inn = st.find(s => s.in === day);
  if (out && inn) return {k: "turn", s: inn};
  if (inn) return {k: "in", s: inn};
  const stay = st.find(s => s.in < day && s.out > day); if (stay) return {k: "stay", s: stay};
  if (out) return {k: "out", s: out};
  if (isBlocked(F, c, day)) return {k: "blocked"};
  const prev = [...st].reverse().find(s => s.out < day), buf = L.buffer[c];
  if (prev && day < addDays(prev.out, buf)) return {k: "buffer"};
  return {k: "free"};
}

/* ---------- the changeover ---------- */
const need = (F, c) => Object.keys(TASKS).filter(k => TASKS[k].need && (!TASKS[k].only || tierOf(F, c, TASKS[k].only) > 0));
export const turn = (F, c) => letState(F).turn[c] || null;
export const ready = (F, c) => !turn(F, c) || need(F, c).every(k => turn(F, c)[k]);
export const occupied = (F, c) => !!current(F, c);
// a mix where she can: one of each kind in turn
const takeFrom = (F, list, n) => { const inv = F.inv || (F.inv = {}), used = [];
  while (used.length < n) { const ks = list.filter(k => inv[k] > 0); if (!ks.length) break;
    for (const k of ks) { if (used.length >= n) break; inv[k]--; if (!inv[k]) delete inv[k]; used.push(k); } }
  return used; };
const countOf = (F, list) => list.reduce((n, k) => n + ((F.inv || {})[k] || 0), 0);
// do one changeover job; the basket and the fridge can be done any time the cottage is empty
export function doTask(F, c, k){
  const L = letState(F), T = TASKS[k]; if (!T || !owns(F, c)) return {ok: false};
  if (occupied(F, c)) return {ok: false, msg: "Guests are staying. Leave them in peace."};
  if (k === "basket" || k === "fridge") {
    const flag = k === "basket" ? L.basket : L.fridge; if (flag[c]) return {ok: false, msg: k === "basket" ? "The fruit basket's already full." : "The fridge is already stocked."};
    const list = k === "basket" ? FRUIT : TREATS, n = k === "basket" ? T.fruit : T.treats;
    if (countOf(F, list) < n) return {ok: false, msg: k === "basket" ? `The basket needs ${n} pieces of fruit from your backpack: from the orchard, the berry bushes, or a trip.` : `The fridge needs ${n} treats from your backpack: milk, eggs, honey or cheese from the farm.`};
    const used = takeFrom(F, list, n); flag[c] = used; return {ok: true, used};
  }
  const t = L.turn[c]; if (!t) return {ok: false, msg: "All fresh already. Nothing to do here."};
  if (t[k]) return {ok: false, msg: "Done already."};
  t[k] = true; if (need(F, c).every(x => t[x])) L.turn[c] = null;
  return {ok: true, done: !L.turn[c]};
}
export const toDo = (F, c) => { const t = turn(F, c); return t ? need(F, c).filter(k => !t[k]) : []; };

/* ---------- reviews ---------- */
const PRAISE = {
  sofa: "We sank into that sofa every evening", fireplace: "The fire made it so cosy", kitchen: "The kitchen had everything we needed",
  dining: "Long breakfasts at that table", bed: "The comfiest bed we've slept in all year", bath: "That bath! We took turns",
  windowseat: "I read a whole book on the window seat", hottub: "The hot tub under the stars was magic", festoon: "The garden lights at dusk were dreamy",
  firepit: "Marshmallows by the fire pit", hammock: "Lazy afternoons in the hammock", beds: "The flowers in the garden were gorgeous", bookshelf: "Such a lovely little library"
};
function writeReview(F, c, s){
  const p = s.prep || {}, L = letState(F);
  let score = p.stars || 2; if (!p.ready) score -= 1.5; if (p.basket) score += 0.5; if (p.fridge) score += 0.5; if (p.hottub) score += 0.3;
  score = Math.max(1, Math.min(5, Math.round(score)));
  const best = PIECE_IDS.filter(k => PRAISE[k] && (L.tiers[c][k] || 0) >= 2).sort((a, b) => (L.tiers[c][b] || 0) - (L.tiers[c][a] || 0) || hash(s.id + a) % 7 - hash(s.id + b) % 7);
  const bits = [];
  bits.push(score >= 5 ? "Perfect in every way." : score >= 4 ? "Such a lovely stay." : score >= 3 ? "A sweet little cottage." : "A pretty spot.");
  if (best.length) bits.push(PRAISE[best[0]] + ".");
  if (p.basket) bits.push("The fruit basket was such a kind touch.");
  if (p.fridge) bits.push("Milk and cheese in the fridge when we arrived, after a long train ride. Thank you!");
  if (!p.ready) bits.push("It wasn't quite ready when we got in, but we made ourselves at home.");
  if (!best.length && score < 4) bits.push("It could do with a few more home comforts.");
  bits.push(score >= 4 ? "We'll be back!" : "Thank you for having us.");
  return {id: s.id, c, who: s.who, in: s.in, out: s.out, score, text: bits.join(" ")};
}

/* ---------- the day's ticking: deliveries, arrivals, departures ---------- */
// -> events [{k: "delivery"|"in"|"out", c, ...}] for core.js to announce
export function step(F, day, hm){
  const L = letState(F), ev = [];
  if (!L.offered) L.offered = day;
  if (owns(F, "figtree") && forSale(F, "bluebell") && !L.blueOffered) L.blueOffered = day;
  // the train brings the orders
  const arrived = L.orders.filter(o => due(day, hm, o.day, DELIVERY));
  if (arrived.length) { L.orders = L.orders.filter(o => !arrived.includes(o));
    arrived.forEach(o => { if (PIECES[o.id]) L.tiers[o.c][o.id] = Math.max(L.tiers[o.c][o.id] || 0, o.tier); else L.acc[o.c][o.id] = true; });
    ev.push({k: "delivery", items: arrived}); }
  for (const c of COTTAGE_IDS) {
    if (!owns(F, c)) continue;
    extend(F, c, day);
    for (const s of [...L.stays[c]].sort((a, b) => a.in < b.in ? -1 : 1)) {
      if (s.done) continue;
      if (!s.checkedIn && due(day, hm, s.in, CHECKIN)) {
        s.checkedIn = true; s.rate = rate(F, c);
        s.prep = {ready: ready(F, c), basket: !!L.basket[c], fridge: !!L.fridge[c], stars: stars(F, c), hottub: tierOf(F, c, "hottub") > 0};
        L.turn[c] = null; ev.push({k: "in", c, s});
      }
      if (s.checkedIn && !s.done && due(day, hm, s.out, CHECKOUT)) {
        s.done = true; let pay = s.n*s.rate, fee = 0;
        const r = writeReview(F, c, s); L.reviews.unshift(r); L.reviews.length = Math.min(L.reviews.length, 60);
        L.basket[c] = false; L.fridge[c] = false;
        L.turn[c] = {beds: false, bath: false, tidy: false, hottub: false};
        if (L.keeper[c]) { fee = HOUSEKEEPER.fee; pay -= fee; L.turn[c] = null; }   // Hattie turns it round at eleven
        F.coins = (F.coins || 0) + pay; L.earned += pay;
        ev.push({k: "out", c, s, pay, fee, review: r});
      }
    }
    // old stays drop off the calendar after a fortnight (the reviews keep them)
    L.stays[c] = L.stays[c].filter(s => !s.done || s.out >= addDays(day, -14));
  }
  return ev;
}
export const setKeeper = (F, c, on) => { letState(F).keeper[c] = !!on; };

// the porch guests on the lane (tours.js letSlot): [Bluebell's two, Fig Tree's two] while Mel owns a cottage;
// null for one she doesn't (Elena's own lets carry on as before). With the time of day (hm), arriving guests aren't
// about till they've checked in at three (Mel: they shouldn't be out in the woods before they've arrived)
export const porchGuests = (F, day, hm) => ["bluebell", "figtree"].map(c => {
  if (!owns(F, c)) return null;
  const s = letState(F).stays[c].find(x => x.in <= day && x.out > day && x.checkedIn !== false && !(hm != null && x.in === day && hm < CHECKIN));
  return s ? s.who : [];
});

// Elena's letters (core.js localMail)
export function letsMail(F, t){
  const L = letState(F), out = [], at = d => Date.parse(d + "T08:30:00+08:00");
  if (L.offered && at(L.offered) <= t) out.push({id: "lets-offer", from: "postie", at: at(L.offered), title: "A letter from Elena",
    body: "Dear Mel,\nFelix and I have decided to sell the two holiday cottages on the lane. The animals keep us busier every year, and we'd love them to go to someone who'll make them special.\nFig Tree first: 2,000 coins. The little one with the fig tree by the door. Bluebell later, when you're ready.\nCome and have a look whenever you like. The key's under the flowerpot.\nElena"});
  if (L.blueOffered && at(L.blueOffered) <= t) out.push({id: "lets-bluebell", from: "postie", at: at(L.blueOffered), title: "Bluebell, if you'd like it",
    body: "Mel,\nI hear Fig Tree's first guests loved it. Felix says it looks better than when we had it, and he's right, as usual.\nBluebell's yours for 3,000 whenever you want it. It's the bigger one, with the blue shutters.\nElena"});
  return out;
}
