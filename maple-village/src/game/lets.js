// Elena's cottages, and the little landlord business (round 219; data in data/lets.js).
// At five hearts with Elena she offers to sell you Bluebell (3,000) and Fig Tree (2,000). Once one's yours:
//   - order furniture from the catalogue at the hall table; it comes on the next day's train and waits in parcels in
//     the hall, to unpack into its place (a piece already there goes to the spare room: you can put it back later,
//     or in the other cottage);
//   - the game sets the nightly rate: the cottage's cap times how complete and how fine it is (a bed made up is the
//     least it needs to let at all);
//   - guests book stays of one to five nights. They arrive on the morning train and stay in the cottage; when they
//     leave they pay (the rate for every night) and write a review in the guest book, with stars from the same
//     things. Then the cottage needs a tidy before the next guests: the better the last review, the sooner they book.
// State: F.lets = {offered, cottages: {id: {owned, slots: {slot: piece}, parcels: [piece], stay, needTidy, next, book: [], earned, nights}}, spare: [piece], orders: [{c, piece, day}], last}
// A piece: {cat, tier (1-3), col}.
import { esc, dayKey, hash } from "../util.js";
import { icon } from "../art/icons.js";
import { TIERS, COLOURS, CATS, ESSENTIAL, COTTAGES, catOf, STAY, GUEST_POOL, REVIEWS } from "../data/lets.js";

export const OFFER_HEARTS = 5;
// off on the live game until the cottage rooms are drawn (?lets=1 turns it on, for the tests)
export const LIVE = {on: false};
const D = 864e5;
const addDays = (day, n) => new Date(Date.parse(day + "T00:00:00Z") + n*D).toISOString().slice(0, 10);
const daysBetween = (a, b) => Math.round((Date.parse(b + "T00:00:00Z") - Date.parse(a + "T00:00:00Z"))/D);
export function letsState(F){ F.lets = F.lets || {}; const L = F.lets; L.cottages = L.cottages || {}; L.spare = L.spare || []; L.orders = L.orders || [];
  for (const id of Object.keys(COTTAGES)) { const c = L.cottages[id] = L.cottages[id] || {}; c.slots = c.slots || {}; c.parcels = c.parcels || []; c.book = c.book || []; c.earned = c.earned || 0; c.nights = c.nights || 0; if (!("stay" in c)) c.stay = null; }
  return L; }
export const owns = (F, id) => !!(F.lets && F.lets.cottages && F.lets.cottages[id] && F.lets.cottages[id].owned);
export const ownsAny = F => Object.keys(COTTAGES).some(id => owns(F, id));
// Elena offers once you're friends (and from then on the cottages are for sale)
export const offerOpen = (F, hearts) => LIVE.on && hearts >= OFFER_HEARTS || !!(F.lets && F.lets.offered);
export function buyCottage(F, id, hearts, day = dayKey()){
  const L = letsState(F), C = COTTAGES[id]; if (!C || owns(F, id) || !offerOpen(F, hearts) || F.coins < C.price) return null;
  F.coins -= C.price; L.offered = L.offered || day; Object.assign(L.cottages[id], {owned: day, next: addDays(day, 2)}); return C;
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
// orders whose day has come go into the cottage's hall as parcels
export function deliver(F, day = dayKey()){
  const L = letsState(F), due = L.orders.filter(o => o.day <= day); if (!due.length) return 0;
  due.forEach(o => L.cottages[o.c].parcels.push(o.piece)); L.orders = L.orders.filter(o => o.day > day); return due.length;
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
// the nightly rate the game sets (0: can't let yet)
export const rateOf = (F, id) => { const s = scoreOf(F, id); return s.ready ? Math.round(COTTAGES[id].cap*(.3 + .7*s.score)) : 0; };
export const starsOf = (F, id) => { const s = scoreOf(F, id); return s.ready ? Math.max(1, Math.min(5, 1 + Math.round(4*s.score))) : 0; };
// what's missing, for the hint in the panel
export const missing = (F, id) => { const c = letsState(F).cottages[id]; return Object.keys(COTTAGES[id].slots).filter(s => !c.slots[s]).map(s => CATS[catOf(id, s)].line).filter((v, i, a) => a.indexOf(v) === i); };

/* ---------- the bookings ---------- */
// two guests (one in Fig Tree if it's a single), picked from the pool by the date, never the same people in both cottages
export function guestsFor(id, day){ const C = COTTAGES[id], n = C.sleeps >= 4 ? 2 : 1 + (hash(day + id) % 2), out = [];
  for (let k = 0; out.length < n && k < 40; k++) { const g = GUEST_POOL[hash(`${day}:${id}:${k}`) % GUEST_POOL.length]; if (!out.includes(g)) out.push(g); } return out; }
// run the cottages forward to `day`: guests leave (and pay, and review), parcels arrive, new guests arrive. -> [events]
export function settle(F, day = dayKey()){
  const L = letsState(F), ev = []; if (!ownsAny(F)) return ev;
  const n = deliver(F, day); if (n) ev.push({kind: "parcels", n});
  const from = L.last && L.last < day ? (daysBetween(L.last, day) > 60 ? addDays(day, -60) : L.last) : day;   // (a long time away: just the last two months)
  for (let d = from; d <= day; d = addDays(d, 1)) {
    for (const id of Object.keys(COTTAGES)) { const c = L.cottages[id]; if (!c.owned) continue;
      if (c.stay && addDays(c.stay.from, c.stay.nights) <= d) {   // checkout morning
        const s = c.stay, pay = s.rate*s.nights, txt = REVIEWS[s.stars][hash(s.from + id) % REVIEWS[s.stars].length];
        F.coins += pay; c.earned += pay; c.nights += s.nights; c.book.unshift({day: d, who: s.guests, stars: s.stars, nights: s.nights, pay, text: txt}); c.book = c.book.slice(0, 30);
        c.stay = null; c.needTidy = true; ev.push({kind: "left", id, pay, stars: s.stars, who: s.guests});
      }
      if (!c.stay && !c.needTidy && c.next && c.next <= d && rateOf(F, id)) {   // new guests off the morning train
        const nights = STAY.min + hash(d + id + "n") % (STAY.max - STAY.min + 1);
        c.stay = {from: d, nights, guests: guestsFor(id, d), rate: rateOf(F, id), stars: starsOf(F, id)}; c.next = null; ev.push({kind: "arrived", id, who: c.stay.guests, nights});
      }
    }
  }
  L.last = day; return ev;
}
// a quick tidy after guests leave: the next guests book after a gap (the better the review, the sooner)
export function tidy(F, id, day = dayKey()){ const c = letsState(F).cottages[id]; if (!c.owned || !c.needTidy) return false; c.needTidy = false; const last = c.book[0];
  c.next = addDays(day, STAY.gap[last ? last.stars : 3]); return true; }
// who's staying in a cottage today (for the village's schedules), or null
export const staying = (F, id, day = dayKey()) => { const c = F.lets && F.lets.cottages && F.lets.cottages[id]; if (!c || !c.stay) return null; const s = c.stay;
  return s.from <= day && day < addDays(s.from, s.nights) ? s : null; };

/* ---------- the panels ---------- */
const coin = () => icon("coin", 13);
const shut = `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
const head = (title, sub) => `<span class="tape gingham" aria-hidden="true"></span><h2>${esc(title)}</h2><p class="sub">${sub}</p>`;
const stars = n => "★".repeat(n) + "☆".repeat(5 - n);
const swatch = col => `<i class="letsw" style="background:${COLOURS[col][1]}"></i>`;
// Elena's offer (tapping a cottage before it's yours)
export function offerPanel(F, hearts){
  const L = letsState(F);
  if (!offerOpen(F, hearts)) return null;
  let h = head("Elena's cottages", "\"I've been thinking,\" Elena says, wiping her hands on her apron. \"The farm's more than enough for Felix and me. I'd rather the cottages went to a friend than a stranger off the train. They're yours, if you'd like them.\"");
  h += `<ul class="hlist wlist">${Object.entries(COTTAGES).map(([id, C]) => `<li><span class="wtxt"><b>${esc(C.n)}</b><small>${esc(C.line)}. Sleeps ${C.sleeps}. Up to ${C.cap} ${coin()} a night once it's furnished.</small></span>${owns(F, id) ? `<span class="muted">Yours</span>` : `<button class="btn small primary" data-let="buy:${id}" ${F.coins >= C.price ? "" : "disabled"}>${C.price.toLocaleString()} ${coin()}</button>`}</li>`).join("")}</ul>`;
  return h + `<p class="muted">Empty when you buy them: furnish them from the catalogue (it comes on the next day's train), then let them. The better the furniture and the more complete the set, the more a night, up to the cap, and the sooner guests book again.</p>` + shut;
}
// the hall table, inside a cottage: the parcels, what's in place, the rate, the catalogue, the guest book
export function hallPanel(F, id, st = {}, day = dayKey()){
  const L = letsState(F), c = L.cottages[id], C = COTTAGES[id], s = scoreOf(F, id), rate = rateOf(F, id), stay = staying(F, id, day), tab = st.tab || "home";
  let h = head(C.n, stay ? `Guests in: ${stay.guests.length} for ${stay.nights} night${stay.nights === 1 ? "" : "s"}, at ${stay.rate} ${coin()} a night.` : c.needTidy ? "The guests have gone. The cottage needs a tidy before anyone else can book." : rate ? `Ready to let at ${rate} ${coin()} a night (up to ${C.cap}).${c.next ? ` Next guests: ${c.next <= day ? "any day now" : c.next === addDays(day, 1) ? "tomorrow" : `in ${daysBetween(day, c.next)} days`}.` : ""}` : "Not ready to let yet: it needs a bed, made up.");
  h += `<div class="gchips">${[["home", "The cottage"], ["shop", "Catalogue"], ["book", "Guest book"]].map(([k, n]) => `<button class="gchip${tab === k ? " on" : ""}" data-let="tab:${k}"><span>${n}</span></button>`).join("")}</div>`;
  if (tab === "shop") {
    const cat = st.cat || "bed", col = st.col || "sage";
    h += `<div class="gchips">${Object.entries(CATS).map(([k, x]) => `<button class="gchip${cat === k ? " on" : ""}" data-let="cat:${k}"><span>${esc(x.n)}</span></button>`).join("")}</div>`;
    h += `<p class="muted">Colour: </p><div class="gchips">${Object.entries(COLOURS).map(([k, [n]]) => `<button class="gchip${col === k ? " on" : ""}" data-let="col:${k}">${swatch(k)}<span>${n}</span></button>`).join("")}</div>`;
    h += `<ul class="hlist wlist">${[1, 2, 3].map(t => { const p = {cat, tier: t, col}; return `<li><span class="wtxt"><b>${esc(pieceName(p))}</b><small>${TIERS[t].n} · ${COLOURS[col][0].toLowerCase()}</small></span><button class="btn small primary" data-let="order:${cat}:${t}:${col}" ${F.coins >= piecePrice(p) ? "" : "disabled"}>${piecePrice(p)} ${coin()}</button></li>`; }).join("")}</ul>`;
    const coming = L.orders.filter(o => o.c === id);
    return h + `<p class="muted">Everything comes on tomorrow's train and waits in the hall to be unpacked.${coming.length ? ` On order for ${esc(C.n)}: ${coming.length}.` : ""}</p>` + shut;
  }
  if (tab === "book") {
    h += `<p class="muted">${c.nights ? `${c.nights} night${c.nights === 1 ? "" : "s"} let so far, ${c.earned.toLocaleString()} ${coin()} earned.` : "No guests yet."}</p>`;
    h += c.book.length ? `<ul class="bujo">${c.book.slice(0, 8).map(r => `<li><b>${stars(r.stars)}</b> ${esc(r.text)} <small>(${r.nights} night${r.nights === 1 ? "" : "s"}, ${r.pay} ${coin()})</small></li>`).join("")}</ul>` : "";
    return h + shut;
  }
  // the cottage: a tidy if needed, the parcels to unpack, the spares, what's in each place
  if (c.needTidy) h += `<div class="actions"><button class="btn primary" data-let="tidy">Tidy up for the next guests</button></div>`;
  h += `<p class="muted">How complete: ${Math.round(s.complete*100)}% · how fine: ${Math.round(s.quality*100)}%. ${missing(F, id).length ? `Still wanted: ${esc(missing(F, id).join(", "))}.` : "Everything's in place."}</p>`;
  const unpack = (p, from, i) => `<li><span class="wtxt"><b>${swatch(p.col)} ${esc(pieceName(p))}</b><small>${TIERS[p.tier].n}${from === "spare" ? " · in the spare room" : " · a parcel in the hall"}</small></span><span class="orbtns">${slotsFor(id, p.cat).map(sl => `<button class="btn small alt" data-let="place:${sl}:${from}:${i}">${slotsFor(id, p.cat).length > 1 ? (sl.endsWith("2") ? "Room 2" : "Room 1") : "Put it in"}</button>`).join("")}</span></li>`;
  if (c.parcels.length) h += `<h3 class="ph3">Parcels in the hall</h3><ul class="hlist wlist">${c.parcels.map((p, i) => unpack(p, "parcel", i)).join("")}</ul>`;
  const spares = L.spare.map((p, i) => [p, i]).filter(([p]) => slotsFor(id, p.cat).length);
  if (spares.length) h += `<h3 class="ph3">In the spare room</h3><ul class="hlist wlist">${spares.map(([p, i]) => unpack(p, "spare", i)).join("")}</ul>`;
  h += `<h3 class="ph3">In place</h3><ul class="hlist wlist">${Object.keys(C.slots).map(sl => { const p = c.slots[sl]; return `<li><span class="wtxt"><b>${esc(CATS[catOf(id, sl)].n)}${sl.endsWith("2") ? " (room 2)" : ""}</b><small>${p ? `${swatch(p.col)} ${esc(pieceName(p))}` : "Nothing yet"}</small></span>${p && !stay ? `<button class="btn small alt" data-let="out:${sl}">Take out</button>` : ""}</li>`; }).join("")}</ul>`;
  return h + shut;
}
// Elena's letter once you're friends
export const letsMail = (F, hearts, at) => (offerOpen(F, hearts) && !ownsAny(F)) ? [{id: "lets-offer", from: "elena", at: at || 0, title: "About the cottages on the lane", body: "Dear friend,\n\nI've been meaning to say: the farm keeps Felix and me busier than ever, and the two cottages on the lane, Bluebell and Fig Tree, deserve someone with time for them. I'd much rather they went to a friend than a stranger off the train.\n\nIf you'd like them, they're yours: come and knock on either door and we'll sort it out.\n\nElena"}] : [];
