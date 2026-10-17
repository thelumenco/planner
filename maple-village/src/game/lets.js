// Elena's cottages, and the little landlord business (round 219; data in data/lets.js).
// At five hearts with Elena she offers to sell you Bluebell (3,000) and Fig Tree (2,000). Once one's yours:
//   - order furniture from the catalogue at the hall table; it comes on the next day's train and waits in parcels in
//     the hall, to unpack into its place (a piece already there goes to the spare room: you can put it back later,
//     or in the other cottage). Round 220: two floors; round 221: a bathroom off the bedroom, and a garden;
//   - the game sets the nightly rate: the cottage's cap (plus what its garden extras add) times how complete and how
//     fine it is (a bed made up and a bath are the least it needs to let at all);
//   - round 221: guests book ahead, onto a calendar (you can close days, or pause bookings altogether). Between stays
//     there are changeover days (1 to 3, your choice): go in, tidy up, fill the fruit basket and the fridge with your
//     own things, or hire Hettie to do the changeover for you (she stocks the welcome from a pantry you keep filled).
//     Guests pay when they leave, with a tip for a good welcome, and write a review: stars from the furniture, one
//     more for a good welcome, two fewer if the place wasn't tidy when they arrived.
// State: F.lets = {offered, spare: [piece], orders: [{c, piece} | {c, extra}, day], last, cottages: {id: {owned, slots: {slot: piece},
//   parcels: [piece], extras: {key: day}, stay, bookings: [{from, nights, guests}], closed: {day: 1}, paused, buffer,
//   ready: {tidy, fruit: {id: n}, fridge: {id: n}}, keeper, pantry: {id: n}, book: [review], earned, nights}}}
// A piece: {cat, tier (1-3), col}.
import { esc, dayKey, hash } from "../util.js";
import { icon } from "../art/icons.js";
import { ITEMS } from "../data/items.js";
import { TIERS, COLOURS, CATS, ESSENTIAL, COTTAGES, catOf, STAY, GUEST_POOL, REVIEWS, floorOf, EXTRAS, BOOK, WELCOME, FRIDGE, UNTIDY, KEEPER } from "../data/lets.js";

export const OFFER_HEARTS = 5;
// a switch for the whole feature: on (round 223, Mel: "let's switch on")
export const LIVE = {on: true};
const D = 864e5;
export const addDays = (day, n) => new Date(Date.parse(day + "T00:00:00Z") + n*D).toISOString().slice(0, 10);
const daysBetween = (a, b) => Math.round((Date.parse(b + "T00:00:00Z") - Date.parse(a + "T00:00:00Z"))/D);
const fresh = () => ({tidy: true, fruit: {}, fridge: {}});
export function letsState(F){ F.lets = F.lets || {}; const L = F.lets; L.cottages = L.cottages || {}; L.spare = L.spare || []; L.orders = L.orders || [];
  for (const id of Object.keys(COTTAGES)) { const c = L.cottages[id] = L.cottages[id] || {}; c.slots = c.slots || {}; c.parcels = c.parcels || []; c.book = c.book || []; c.earned = c.earned || 0; c.nights = c.nights || 0; if (!("stay" in c)) c.stay = null;
    c.extras = c.extras || {}; c.bookings = c.bookings || []; c.closed = c.closed || {}; c.buffer = c.buffer || 1; c.ready = c.ready || fresh(); c.pantry = c.pantry || {}; }
  return L; }
export const owns = (F, id) => !!(F.lets && F.lets.cottages && F.lets.cottages[id] && F.lets.cottages[id].owned);
export const ownsAny = F => Object.keys(COTTAGES).some(id => owns(F, id));
// Elena offers once you're friends (and from then on the cottages are for sale)
export const offerOpen = (F, hearts) => LIVE.on && (hearts >= OFFER_HEARTS || !!(F.lets && F.lets.offered));
export function buyCottage(F, id, hearts, day = dayKey()){
  const L = letsState(F), C = COTTAGES[id]; if (!C || owns(F, id) || !offerOpen(F, hearts) || F.coins < C.price) return null;
  F.coins -= C.price; L.offered = L.offered || day; Object.assign(L.cottages[id], {owned: day, ready: fresh()}); return C;
}

/* ---------- the furniture ---------- */
export const pieceName = p => CATS[p.cat].tiers[p.tier - 1];
export const piecePrice = p => CATS[p.cat].prices[p.tier - 1];
export const sameP = (a, b) => a && b && a.cat === b.cat && a.tier === b.tier && a.col === b.col;
// order a piece for a cottage: it comes on tomorrow's train
export function order(F, id, cat, tier, col, day = dayKey()){
  const L = letsState(F); if (!owns(F, id) || !CATS[cat] || !(tier >= 1 && tier <= 3) || !COLOURS[col]) return null;
  const p = {cat, tier, col}, price = piecePrice(p); if (F.coins < price) return null;
  F.coins -= price; L.orders.push({c: id, piece: p, day: addDays(day, 1)}); return {piece: p, price};
}
// round 221: order something for the garden: the builders bring it and put it in the next day
export function orderExtra(F, id, key, day = dayKey()){
  const L = letsState(F), x = EXTRAS[key], c = L.cottages[id]; if (!owns(F, id) || !x || c.extras[key] || L.orders.some(o => o.c === id && o.extra === key) || F.coins < x.price) return null;
  F.coins -= x.price; L.orders.push({c: id, extra: key, day: addDays(day, 1)}); return x;
}
export const extraComing = (F, id, key) => !!(F.lets && F.lets.orders.some(o => o.c === id && o.extra === key));
// orders whose day has come: furniture into the cottage's hall as parcels, garden things straight into the garden
export function deliver(F, day = dayKey()){
  const L = letsState(F), due = L.orders.filter(o => o.day <= day); if (!due.length) return 0;
  due.forEach(o => { if (o.extra) L.cottages[o.c].extras[o.extra] = o.day; else L.cottages[o.c].parcels.push(o.piece); }); L.orders = L.orders.filter(o => o.day > day); return due.filter(o => !o.extra).length;
}
// slots in a cottage a category can go in (beds: either bedroom)
export const slotsFor = (id, cat) => Object.keys(COTTAGES[id].slots).filter(s => catOf(id, s) === cat);
// put a parcel (index) or a spare (index, from: "spare") into a slot; whatever was there goes to the spares
export function place(F, id, slot, from, i){
  const L = letsState(F), c = L.cottages[id]; if (!owns(F, id) || !COTTAGES[id].slots[slot]) return null;
  const list = from === "spare" ? L.spare : c.parcels, p = list[i]; if (!p || catOf(id, slot) !== p.cat) return null;
  list.splice(i, 1); if (c.slots[slot]) L.spare.push(c.slots[slot]); c.slots[slot] = p; return p;
}
export function takeOut(F, id, slot){ const L = letsState(F), c = L.cottages[id], p = c.slots[slot]; if (!p) return null; delete c.slots[slot]; L.spare.push(p); return p; }

/* ---------- the rate and the stars ---------- */
export function scoreOf(F, id){
  const c = letsState(F).cottages[id], slots = Object.keys(COTTAGES[id].slots), filled = slots.filter(s => c.slots[s]);
  const complete = filled.length/slots.length, quality = filled.length ? filled.reduce((a, s) => a + c.slots[s].tier, 0)/(filled.length*3) : 0;
  const ready = ESSENTIAL.every(cat => slotsFor(id, cat).some(s => c.slots[s]));
  return {complete, quality, ready, score: ready ? .5*complete + .5*quality : 0};
}
// the most a night: the cottage's cap, plus whatever its garden extras add
export const capOf = (F, id) => COTTAGES[id].cap + Object.keys(letsState(F).cottages[id].extras).reduce((a, k) => a + (EXTRAS[k] ? EXTRAS[k].add : 0), 0);
// the nightly rate the game sets (0: can't let yet)
export const rateOf = (F, id) => { const s = scoreOf(F, id); return s.ready ? Math.round(capOf(F, id)*(.3 + .7*s.score)) : 0; };
export const starsOf = (F, id) => { const s = scoreOf(F, id); return s.ready ? Math.max(1, Math.min(5, 1 + Math.round(4*s.score))) : 0; };
// what's missing, for the hint in the panel
export const missing = (F, id) => { const c = letsState(F).cottages[id]; return Object.keys(COTTAGES[id].slots).filter(s => !c.slots[s]).map(s => CATS[catOf(id, s)].line).filter((v, i, a) => a.indexOf(v) === i); };

/* ---------- the welcome: fruit basket, fridge, the pantry for Hettie ---------- */
export const isFruit = id => !!(ITEMS[id] && ITEMS[id].fruit);
export const isTreat = id => !!(ITEMS[id] && (ITEMS[id].wine || FRIDGE.includes(id)));
const count = o => Object.values(o || {}).reduce((a, b) => a + b, 0);
const bump = (o, id, n) => { o[id] = (o[id] || 0) + n; if (o[id] <= 0) delete o[id]; };
// move one thing from the backpack into the basket ("fruit"), the fridge ("fridge") or the pantry ("pantry"), or back
export function stock(F, id, where, item){
  const c = letsState(F).cottages[id], box = where === "pantry" ? c.pantry : c.ready[where]; if (!owns(F, id) || !box || !(F.inv || {})[item]) return false;
  if (where === "fruit" ? !isFruit(item) || count(box) >= WELCOME.fruit : where === "fridge" ? !isTreat(item) || count(box) >= WELCOME.fridge : !(isFruit(item) || isTreat(item))) return false;
  bump(F.inv, item, -1); bump(box, item, 1); return true;
}
export function unstock(F, id, where, item){
  const c = letsState(F).cottages[id], box = where === "pantry" ? c.pantry : c.ready[where]; if (!box || !box[item]) return false;
  bump(box, item, -1); F.inv = F.inv || {}; bump(F.inv, item, 1); return true;
}
const goodWelcome = r => r.tidy && count(r.fruit) >= WELCOME.need && count(r.fridge) >= WELCOME.need;
// a tidy-up (by you, or Hettie): the sheets, the floors, the windows
export function tidy(F, id, day = dayKey()){ const c = letsState(F).cottages[id]; if (!c.owned || c.ready.tidy || staying(F, id, day)) return false; c.ready.tidy = true; return true; }
// Hettie's changeover: tidy (for her fee), then the basket and the fridge from the pantry
function keeperRound(F, id){
  const c = F.lets.cottages[id], fee = KEEPER.fee[id]; if (c.ready.tidy) return null; if (F.coins < fee) return {unpaid: true};
  F.coins -= fee; c.ready.tidy = true; let moved = 0;
  for (const [where, ok, max] of [["fruit", isFruit, WELCOME.fruit], ["fridge", isTreat, WELCOME.fridge]])
    for (const item of Object.keys(c.pantry).filter(ok)) while (c.pantry[item] && count(c.ready[where]) < max) { bump(c.pantry, item, -1); bump(c.ready[where], item, 1); moved++; }
  return {fee, moved};
}
export function hireKeeper(F, id, on){ const c = letsState(F).cottages[id]; if (!owns(F, id)) return false; c.keeper = !!on; return true; }

/* ---------- the calendar ---------- */
// two guests (one in Fig Tree if it's a single), picked from the pool by the date, never the same people in both cottages
export function guestsFor(id, day){ const C = COTTAGES[id], n = C.sleeps >= 4 ? 2 : 1 + (hash(day + id) % 2), out = [];
  for (let k = 0; k < 40 && out.length < n; k++) { const g = GUEST_POOL[hash(`${day}:${id}:${k}`) % GUEST_POOL.length]; if (!out.includes(g)) out.push(g); } return out; }
const endOf = b => addDays(b.from, b.nights);   // the morning they leave
// the day after which the next guests could arrive (the last stay's checkout, plus the changeover days)
const freeFrom = c => { const last = c.bookings.length ? c.bookings[c.bookings.length - 1] : c.stay; return last ? addDays(endOf(last), c.buffer - 1) : null; };
const clashes = (c, from, nights) => { for (let k = 0; k <= nights; k++) if (c.closed[addDays(from, k)]) return addDays(from, k); return null; };
// new bookings come in (they're made on `day`, for a few days ahead, no further than the horizon)
function takeBookings(F, id, day){
  const c = F.lets.cottages[id], out = []; if (c.paused || !rateOf(F, id)) return out;
  for (let tries = 0; tries < 3; tries++) {
    const stars = c.book.length ? c.book[0].stars : starsOf(F, id), lead = BOOK.lead[0] + hash(day + id + "lead") % (BOOK.lead[1] - BOOK.lead[0] + 1);
    const ff = freeFrom(c); let from = addDays(day, lead); if (ff && from <= ff) from = addDays(ff, 1);
    if (ff && c.book.length) { const idle = addDays(ff, 1 + BOOK.idle[stars]); if (from < idle) from = idle; }
    if (daysBetween(day, from) > BOOK.horizon) break;
    const nights = STAY.min + hash(from + id + "n") % (STAY.max - STAY.min + 1);
    let clash = clashes(c, from, nights), guard = 0;
    while (clash && guard++ < 30) { from = addDays(clash, 1); clash = clashes(c, from, nights); }
    if (clash || daysBetween(day, from) > BOOK.horizon) break;
    const b = {from, nights, guests: guestsFor(id, from), made: day}; c.bookings.push(b); out.push(b);
  }
  return out;
}
// close or reopen a day (not one that's already booked)
export function toggleDay(F, id, d, day = dayKey()){
  const c = letsState(F).cottages[id]; if (!owns(F, id) || d < day) return false;
  const busy = [...c.bookings, ...(c.stay ? [c.stay] : [])].some(b => d >= b.from && d < endOf(b)); if (busy && !c.closed[d]) return false;
  if (c.closed[d]) delete c.closed[d]; else c.closed[d] = 1; return true;
}
export const setBuffer = (F, id, n) => { const c = letsState(F).cottages[id]; if (!BOOK.buffers.includes(n)) return false; c.buffer = n; return true; };
export const setPaused = (F, id, on) => { const c = letsState(F).cottages[id]; c.paused = !!on; return true; };
// what a day on the calendar is: "in" (guests staying), "arrive", "leave" (a changeover morning), "closed", or "free"
export function dayState(F, id, d){
  const c = letsState(F).cottages[id], all = [...(c.stay ? [c.stay] : []), ...c.bookings];
  const b = all.find(x => d >= x.from && d < endOf(x)); if (b) return {k: b.from === d ? "arrive" : "in", b};
  const out = all.find(x => endOf(x) === d); if (out) return {k: "leave", b: out};
  return {k: c.closed[d] ? "closed" : "free"};
}

/* ---------- running the days ---------- */
// run the cottages forward to `day`: parcels arrive, guests leave (and pay, and review), Hettie does the changeover,
// new guests arrive, and new bookings come in. -> [events]
export function settle(F, day = dayKey()){
  const L = letsState(F), ev = []; if (!ownsAny(F)) return ev;
  const n = deliver(F, day); if (n) ev.push({kind: "parcels", n});
  const from = L.last && L.last < day ? (daysBetween(L.last, day) > 60 ? addDays(day, -60) : addDays(L.last, 1)) : day;   // (a long time away: just the last two months)
  if (L.last === day) { for (const id of Object.keys(COTTAGES)) if (owns(F, id)) takeBookings(F, id, day).forEach(b => ev.push({kind: "booked", id, b})); return ev; }
  for (let d = from; d <= day; d = addDays(d, 1)) {
    for (const id of Object.keys(COTTAGES)) { const c = L.cottages[id]; if (!c.owned) continue;
      if (c.stay && endOf(c.stay) <= d) {   // checkout morning: they pay, with a tip for a good welcome, and write a review
        const s = c.stay, stars = Math.max(1, Math.min(5, s.base + (s.welcome ? 1 : 0) - (s.untidy ? UNTIDY : 0))), tip = s.welcome ? s.items*WELCOME.tip : 0, pay = s.rate*s.nights + tip;
        const txt = REVIEWS[stars][hash(s.from + id) % REVIEWS[stars].length] + (s.welcome ? " And thank you for the fruit and the treats in the fridge: such a lovely welcome." : s.untidy ? " It wasn't quite clean when we arrived." : "");
        F.coins += pay; c.earned += pay; c.nights += s.nights; c.book.unshift({day: d, who: s.guests, stars, nights: s.nights, pay, tip, text: txt}); c.book = c.book.slice(0, 30);
        c.stay = null; c.ready.tidy = false; ev.push({kind: "left", id, pay, tip, stars, who: s.guests});
        if (c.keeper) { const k = keeperRound(F, id); if (k) ev.push({kind: k.unpaid ? "keeperUnpaid" : "keeper", id, ...k}); }
      }
      const b = c.bookings[0];
      if (b && b.from <= d && !c.stay) {   // new guests off the morning train
        c.bookings.shift();
        if (endOf(b) <= d || !rateOf(F, id)) { ev.push({kind: "cancelled", id, b}); }
        else { const r = c.ready, items = count(r.fruit) + count(r.fridge);
          c.stay = {from: b.from, nights: b.nights, guests: b.guests, rate: rateOf(F, id), base: starsOf(F, id), welcome: goodWelcome(r), untidy: !r.tidy, items};
          c.ready = {tidy: true, fruit: {}, fridge: {}}; ev.push({kind: "arrived", id, who: b.guests, nights: b.nights, untidy: !r.tidy}); }
      }
      takeBookings(F, id, d).forEach(x => { if (d === day) ev.push({kind: "booked", id, b: x}); });
    }
  }
  L.last = day; return ev;
}
// who's staying in a cottage today (for the village's schedules), or null
export const staying = (F, id, day = dayKey()) => { const c = F.lets && F.lets.cottages && F.lets.cottages[id]; if (!c || !c.stay) return null; const s = c.stay;
  return s.from <= day && day < endOf(s) ? s : null; };
// round 221: where Hettie goes today: the cottages she's doing a changeover in (a checkout today, and she's hired)
export const keeperDays = (F, day) => !F.lets ? [] : Object.keys(COTTAGES).filter(id => { const c = F.lets.cottages[id]; return c && c.owned && c.keeper && c.book.length && c.book[0].day === day; });

/* ---------- the panels ---------- */
const coin = () => icon("coin", 13);
const shut = `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
const head = (title, sub) => `<span class="tape gingham" aria-hidden="true"></span><h2>${esc(title)}</h2><p class="sub">${sub}</p>`;
const stars = n => "★".repeat(n) + "☆".repeat(5 - n);
const swatch = col => `<i class="letsw" style="background:${COLOURS[col][1]}"></i>`;
const nm = id => (ITEMS[id] && ITEMS[id].n) || id;
const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;
const WHERE = {down: "", up: " (upstairs)", bath: " (bathroom)"};
const DOW = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
// Elena's offer (tapping a cottage before it's yours)
export function offerPanel(F, hearts){
  if (!offerOpen(F, hearts)) return null;
  let h = head("Elena's cottages", "\"I've been thinking,\" Elena says, wiping her hands on her apron. \"The farm's more than enough for Felix and me. I'd rather the cottages went to a friend than a stranger off the train. They're yours, if you'd like them.\"");
  h += `<ul class="hlist wlist">${Object.entries(COTTAGES).map(([id, C]) => `<li><span class="wtxt"><b>${esc(C.n)}</b><small>${esc(C.line)}. Sleeps ${C.sleeps}. Up to ${C.cap} ${coin()} a night once it's furnished.</small></span>${owns(F, id) ? `<span class="muted">Yours</span>` : `<button class="btn small primary" data-let="buy:${id}" ${F.coins >= C.price ? "" : "disabled"}>${C.price.toLocaleString()} ${coin()}</button>`}</li>`).join("")}</ul>`;
  return h + `<p class="muted">Empty when you buy them: furnish them from the catalogue (it comes on the next day's train), then let them. The better the furniture and the more complete the set, the more a night, up to the cap, and the sooner guests book again.</p>` + shut;
}
// the hall table, inside a cottage: the cottage, the welcome, the calendar, the catalogue, the garden, the guest book
export function hallPanel(F, id, st = {}, day = dayKey()){
  const L = letsState(F), c = L.cottages[id], C = COTTAGES[id], s = scoreOf(F, id), rate = rateOf(F, id), stay = staying(F, id, day), tab = st.tab || "home", next = c.bookings[0];
  const sub = stay ? `Guests in: ${stay.guests.length} for ${plural(stay.nights, "night")}, at ${stay.rate} ${coin()} a night.`
    : !rate ? "Not ready to let yet: it needs a bed, made up, and a bath."
    : `${!c.ready.tidy ? "The guests have gone: it needs a tidy. " : ""}Lets at ${rate} ${coin()} a night (up to ${capOf(F, id)}).${next ? ` Next guests: ${next.from === day ? "today" : next.from === addDays(day, 1) ? "tomorrow" : `in ${daysBetween(day, next.from)} days`}.` : c.paused ? " Bookings are paused." : ""}`;
  let h = head(C.n, sub);
  h += `<div class="gchips">${[["home", "The cottage"], ["welcome", "Welcome"], ["cal", "Calendar"], ["shop", "Catalogue"], ["garden", "Garden"], ["book", "Guest book"]].map(([k, n]) => `<button class="gchip${tab === k ? " on" : ""}" data-let="tab:${k}"><span>${n}</span></button>`).join("")}</div>`;
  if (tab === "shop") {
    const cat = st.cat || "bed", col = st.col || "sage";
    h += `<div class="gchips">${Object.entries(CATS).map(([k, x]) => `<button class="gchip${cat === k ? " on" : ""}" data-let="cat:${k}"><span>${esc(x.n)}</span></button>`).join("")}</div>`;
    h += `<p class="muted">Colour: </p><div class="gchips">${Object.entries(COLOURS).map(([k, [n]]) => `<button class="gchip${col === k ? " on" : ""}" data-let="col:${k}">${swatch(k)}<span>${n}</span></button>`).join("")}</div>`;
    h += `<ul class="hlist wlist">${[1, 2, 3].map(t => { const p = {cat, tier: t, col}; return `<li><span class="wtxt"><b>${esc(pieceName(p))}</b><small>${TIERS[t].n} · ${COLOURS[col][0].toLowerCase()}</small></span><button class="btn small primary" data-let="order:${cat}:${t}:${col}" ${F.coins >= piecePrice(p) ? "" : "disabled"}>${piecePrice(p)} ${coin()}</button></li>`; }).join("")}</ul>`;
    const coming = L.orders.filter(o => o.c === id && !o.extra);
    return h + `<p class="muted">Everything comes on tomorrow's train and waits in the hall to be unpacked.${coming.length ? ` On order for ${esc(C.n)}: ${coming.length}.` : ""}</p>` + shut;
  }
  if (tab === "garden") {
    h += `<p class="muted">Out of the back door. Each of these lets the cottage charge a little more a night (now up to ${capOf(F, id)} ${coin()}). The builders bring them the next day.</p>`;
    h += `<ul class="hlist wlist">${Object.entries(EXTRAS).map(([k, x]) => `<li><span class="wtxt"><b>${esc(x.n)}</b><small>${esc(x.line)}. Up to ${x.add} more a night.</small></span>${c.extras[k] ? `<span class="muted">In the garden</span>` : extraComing(F, id, k) ? `<span class="muted">Coming tomorrow</span>` : `<button class="btn small primary" data-let="extra:${k}" ${F.coins >= x.price ? "" : "disabled"}>${x.price.toLocaleString()} ${coin()}</button>`}</li>`).join("")}</ul>`;
    return h + shut;
  }
  if (tab === "book") {
    h += `<p class="muted">${c.nights ? `${plural(c.nights, "night")} let so far, ${c.earned.toLocaleString()} ${coin()} earned.` : "No guests yet."}</p>`;
    h += c.book.length ? `<ul class="bujo">${c.book.slice(0, 8).map(r => `<li><b>${stars(r.stars)}</b> ${esc(r.text)} <small>(${plural(r.nights, "night")}, ${r.pay} ${coin()}${r.tip ? `, with a tip of ${r.tip}` : ""})</small></li>`).join("")}</ul>` : "";
    return h + shut;
  }
  if (tab === "cal") {
    const start = addDays(day, -new Date(day + "T00:00:00Z").getUTCDay()), cells = Array.from({length: 35}, (_, k) => addDays(start, k));
    h += `<p class="muted">Tap a free day to close it (nobody books it); tap again to open it. Booked days can't be closed.</p>`;
    h += `<div class="letcal">${DOW.map(d => `<b>${d}</b>`).join("")}${cells.map(d => { const ds = dayState(F, id, d), past = d < day;
      const lab = ds.k === "arrive" ? "In" : ds.k === "in" ? "●" : ds.k === "leave" ? "Out" : ds.k === "closed" ? "Shut" : "";
      return `<button class="lc ${ds.k}${d === day ? " today" : ""}" data-let="day:${d}" ${past ? "disabled" : ""} aria-label="${d} ${ds.k}"><i>${+d.slice(8)}</i><small>${lab}</small></button>`; }).join("")}</div>`;
    h += `<p class="muted">In: guests arrive · ●: staying · Out: they leave, the changeover · Shut: closed by you.</p>`;
    h += `<h3 class="ph3">Changeover days between guests</h3><div class="gchips">${BOOK.buffers.map(n => `<button class="gchip${c.buffer === n ? " on" : ""}" data-let="buffer:${n}"><span>${n}</span></button>`).join("")}</div>`;
    h += `<div class="actions"><button class="btn small ${c.paused ? "primary" : "alt"}" data-let="pause:${c.paused ? 0 : 1}">${c.paused ? "Take bookings again" : "Pause new bookings"}</button></div>`;
    const up = [...(stay ? [stay] : []), ...c.bookings];
    h += up.length ? `<ul class="hlist wlist">${up.map(b => `<li><span class="wtxt"><b>${b.from === day ? "Today" : b.from}</b><small>${plural(b.nights, "night")} · ${b.guests.length} guest${b.guests.length > 1 ? "s" : ""}</small></span></li>`).join("")}</ul>` : `<p class="muted">No bookings yet.</p>`;
    return h + shut;
  }
  if (tab === "welcome") {
    const r = c.ready, bag = Object.keys(F.inv || {}).filter(k => F.inv[k] > 0), fruit = bag.filter(isFruit), treats = bag.filter(isTreat);
    const box = (o, where) => Object.keys(o).length ? `<ul class="hlist wlist">${Object.entries(o).map(([k, n]) => `<li><span class="wtxt"><b>${esc(nm(k))}</b><small>× ${n}</small></span><button class="btn small alt" data-let="un:${where}:${k}">Take back</button></li>`).join("")}</ul>` : `<p class="muted">Empty.</p>`;
    const add = (list, where, full) => full ? "" : list.length ? `<div class="gchips">${list.map(k => `<button class="gchip" data-let="put:${where}:${k}"><span>+ ${esc(nm(k))}</span></button>`).join("")}</div>` : `<p class="muted">Nothing for it in your backpack.</p>`;
    h += stay ? `<p class="muted">Guests are staying. Get things ready for the next ones once they've gone.</p>`
      : r.tidy ? `<p class="muted">Clean and tidy, beds made.</p>` : `<div class="actions"><button class="btn primary" data-let="tidy">Tidy up and make the beds</button></div>`;
    h += `<h3 class="ph3">The fruit basket (${count(r.fruit)}/${WELCOME.fruit})</h3>${box(r.fruit, "fruit")}${stay ? "" : add(fruit, "fruit", count(r.fruit) >= WELCOME.fruit)}`;
    h += `<h3 class="ph3">The fridge (${count(r.fridge)}/${WELCOME.fridge})</h3>${box(r.fridge, "fridge")}${stay ? "" : add(treats, "fridge", count(r.fridge) >= WELCOME.fridge)}`;
    h += `<p class="muted">Tidy, with ${WELCOME.need} or more in the basket and the fridge: guests add a star, and leave a tip.</p>`;
    h += `<h3 class="ph3">${KEEPER.name}, the housekeeper</h3><p class="muted">${c.keeper ? `${KEEPER.name} does the changeover the day guests leave: ${KEEPER.fee[id]} ${coin()} each time. She fills the basket and fridge from the pantry cupboard.` : `${KEEPER.name} lives on the lane and does changeovers: ${KEEPER.fee[id]} ${coin()} each time, paid on the day. She'll stock the welcome from a pantry cupboard you keep filled.`}</p>`;
    h += `<div class="actions"><button class="btn small ${c.keeper ? "alt" : "primary"}" data-let="keeper:${c.keeper ? 0 : 1}">${c.keeper ? `Let ${KEEPER.name} go` : `Hire ${KEEPER.name}`}</button></div>`;
    if (c.keeper || count(c.pantry)) h += `<h3 class="ph3">The pantry (${count(c.pantry)})</h3>${box(c.pantry, "pantry")}${add([...fruit, ...treats], "pantry", count(c.pantry) >= 30)}`;
    return h + shut;
  }
  // the cottage: the parcels to unpack, the spares, what's in each place
  h += `<p class="muted">How complete: ${Math.round(s.complete*100)}% · how fine: ${Math.round(s.quality*100)}%. ${missing(F, id).length ? `Still wanted: ${esc(missing(F, id).join(", "))}.` : "Everything's in place."}</p>`;
  const unpack = (p, from, i) => `<li><span class="wtxt"><b>${swatch(p.col)} ${esc(pieceName(p))}</b><small>${TIERS[p.tier].n}${from === "spare" ? " · in the spare room" : " · a parcel in the hall"}</small></span><span class="orbtns">${slotsFor(id, p.cat).map(sl => `<button class="btn small alt" data-let="place:${sl}:${from}:${i}">${slotsFor(id, p.cat).length > 1 ? (floorOf(id, sl) === "bath" ? "Bathroom" : sl.endsWith("2") ? "Room 2" : p.cat === "plant" ? "Downstairs" : "Room 1") : "Put it in"}</button>`).join("")}</span></li>`;
  if (c.parcels.length) h += `<h3 class="ph3">Parcels in the hall</h3><ul class="hlist wlist">${c.parcels.map((p, i) => unpack(p, "parcel", i)).join("")}</ul>`;
  const spares = L.spare.map((p, i) => [p, i]).filter(([p]) => slotsFor(id, p.cat).length);
  if (spares.length) h += `<h3 class="ph3">In the spare room</h3><ul class="hlist wlist">${spares.map(([p, i]) => unpack(p, "spare", i)).join("")}</ul>`;
  h += `<h3 class="ph3">In place</h3><ul class="hlist wlist">${Object.keys(C.slots).map(sl => { const p = c.slots[sl]; return `<li><span class="wtxt"><b>${esc(CATS[catOf(id, sl)].n)}${WHERE[floorOf(id, sl)]}${sl.endsWith("2") ? " (room 2)" : ""}</b><small>${p ? `${swatch(p.col)} ${esc(pieceName(p))}` : "Nothing yet"}</small></span>${p && !stay ? `<button class="btn small alt" data-let="out:${sl}">Take out</button>` : ""}</li>`; }).join("")}</ul>`;
  return h + shut;
}
// Elena's letter once you're friends
export const letsMail = (F, hearts, at) => (offerOpen(F, hearts) && !ownsAny(F)) ? [{id: "lets-offer", from: "elena", at: at || 0, title: "About the cottages on the lane", body: "Dear friend,\n\nI've been meaning to say: the farm keeps Felix and me busier than ever, and the two cottages on the lane, Bluebell and Fig Tree, deserve someone with time for them. I'd much rather they went to a friend than a stranger off the train.\n\nIf you'd like them, they're yours: come and knock on either door and we'll sort it out.\n\nElena"}] : [];
