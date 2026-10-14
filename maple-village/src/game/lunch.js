// The Sunday long lunch on the terrace (round 146, Mel). Once the wine shop has its terrace, every Sunday from 12 to 3
// one long table on the alfresco terrace fills up with people who've booked: villagers, families up for the day,
// tourists, now and then a birthday, and one lot of Mel's own family (a different pair each week). The bookings book
// (on the lectern by the terrace doors) shows who's coming next Sunday, filling up as
// the week goes on: so Mel can stock the shelves to suit. At lunch the tables order whole bottles (a pair gets
// through about one an hour, and they go for the dearer bottles) and plates from the kitchen; with Mel out on the
// terrace hosting, they order faster and tip. The art is art/terrace.js; sales are in vineyard.js sellTick.
import { esc, dayKey, hash } from "../util.js";

export const LUNCH = {from: 12*60, to: 15*60, seats: 12};
const dow = day => new Date(day + "T00:00:00Z").getUTCDay();
const addDays = (day, n) => new Date(Date.parse(day + "T00:00:00Z") + n*864e5).toISOString().slice(0, 10);
export const lunchOn = day => dow(day) === 0;
export const lunchNow = (day, hm) => lunchOn(day) && hm >= LUNCH.from && hm < LUNCH.to;
// the Sunday whose bookings are showing: today if it's Sunday, else the coming one
export const nextSunday = (day = dayKey()) => addDays(day, (7 - dow(day)) % 7);

// who might book (no one who keeps a stall at the Sunday market; and Ma Ma comes after hers closes at one)
const PARTIES = [
  {ids: ["hana", "pip"]}, {ids: ["okada", "lin"]}, {ids: ["juniper", "bo"]}, {ids: ["opal", "theo"]},
  {ids: ["aiko", "hiro"], from: "Up from the city"}, {ids: ["rosa", "bastien"], from: "On holiday"},
  {ids: ["sam", "lily", "max"], from: "A family up for the day"}, {ids: ["priya", "noah"], from: "A family up for the day"},
  {ids: ["jonah", "zara"], from: "A family up for the day"}, {ids: ["mia", "ava", "ollie"], from: "A family up for the day"}
];
const BIRTHDAY = {ids: ["juniper", "bo", "opal", "theo"], birthday: true};
const FAMILY_TURNS = [{ids: ["farid", "mei"], family: true, at: 13*60 + 15}, {ids: ["hana", "theo"], family: true}, {ids: ["tomi", "posy"], family: true}];
const weekNo = day => Math.floor(Date.parse(day + "T00:00:00Z")/(7*864e5));
const cache = {};
// one Sunday's bookings -> [{ids, size, at (arrival minute), family?, birthday?, from?}]
export function bookingsFor(sunday){
  if (cache[sunday]) return cache[sunday];
  const out = [], used = new Set(), take = p => { if (p.ids.some(id => used.has(id))) return false; p.ids.forEach(id => used.add(id)); out.push({...p, size: p.ids.length}); return true; };
  // round 152: Mother's Day (the second Sunday in May): the whole family, Mum and Ma Ma guests of honour, and the
  // village's families round the rest of the table
  const mday = sunday.slice(5, 7) === "05" && +sunday.slice(8) >= 8 && +sunday.slice(8) <= 14;
  if (mday) take({ids: ["hana", "farid", "theo", "mei", "tomi", "posy", "bo"], family: true, mothers: true});
  else take(FAMILY_TURNS[weekNo(sunday) % FAMILY_TURNS.length]);
  if (!mday && hash(sunday + ":bday") % 3 === 0) take(BIRTHDAY);
  const order = PARTIES.map((p, i) => [hash(sunday + ":" + i), p]).sort((a, b) => a[0] - b[0]).map(([, p]) => p);
  const want = 9 + hash(sunday) % 3;   // nine to eleven seats taken
  for (const p of order) { if (out.reduce((n, b) => n + b.size, 0) + p.ids.length > Math.min(want + 1, LUNCH.seats)) continue; take(p); if (out.reduce((n, b) => n + b.size, 0) >= want) break; }
  // arrivals between 12 and half past, family after
  out.forEach((b, i) => { if (b.at == null) b.at = LUNCH.from + (hash(sunday + ":at" + i) % 3)*15; });
  return (cache[sunday] = out);
}
// how much of next Sunday's book is filled in by today (Monday a little, Saturday and Sunday all of it)
export function bookOpen(day = dayKey()){ const sun = nextSunday(day), all = bookingsFor(sun), d = dow(day);
  const n = d === 0 || d === 6 ? all.length : Math.max(1, Math.ceil(all.length*d/6)); return {sunday: sun, list: all.slice(0, n), all: all.length}; }
export const seatsTaken = list => list.reduce((n, b) => n + b.size, 0);

// the long table runs down the middle of the terrace: six chairs down each side, everyone facing in
export const SEATS = [0, 1, 2, 3, 4, 5].flatMap(i => [[214, 334 + i*44, 1], [306, 334 + i*44, -1]]);   // on the chairs (art/terrace.js), facing in
const seatCache = {};
export function seating(sunday){
  if (seatCache[sunday]) return seatCache[sunday];
  const out = {}; let k = 0; bookingsFor(sunday).forEach(b => b.ids.forEach(id => { if (k < SEATS.length) out[id] = {seat: SEATS[k++], at: b.at}; }));
  return (seatCache[sunday] = out);
}
// npcs.js: where a booked guest is during lunch (needs the terrace built: opts.terrace)
export function lunchSlot(id, day, hm, terrace){
  if (!terrace || !lunchNow(day, hm)) return null; const s = seating(day)[id]; if (!s || hm < s.at) return null;
  return {from: s.at, to: LUNCH.to, scene: "terrace", at: [s.seat[0], s.seat[1]], dir: s.seat[2], act: "sit", lunch: true};
}
// who's at the table at a given minute (for sales: how many pairs are ordering)
export const seatedAt = (day, hm) => lunchNow(day, hm) ? bookingsFor(day).filter(b => hm >= b.at).reduce((n, b) => n + b.size, 0) : 0;

// the bookings book
const fmt = m => `${Math.floor(m/60) > 12 ? Math.floor(m/60) - 12 : Math.floor(m/60)}${m % 60 ? ":" + String(m % 60).padStart(2, "0") : ""}${m >= 12*60 ? "pm" : "am"}`;
const pretty = d => new Date(d + "T00:00:00Z").toLocaleDateString("en-GB", {day: "numeric", month: "long", timeZone: "UTC"});
const shut = `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
export function bookPanel(F, nameOf, opts = {}){
  const day = opts.day || dayKey(), {sunday, list, all} = bookOpen(day), seats = seatsTaken(list), shelf = opts.shelf || 0;
  const label = b => b.mothers ? "The whole family, for Mother's Day (Mum and Ma Ma are guests of honour)" : b.birthday ? `Birthday lunch for ${nameOf(b.ids[2] || b.ids[0])}` : b.family ? `${b.ids.map(nameOf).join(" and ")} (family!)` : b.ids.length === 1 ? nameOf(b.ids[0]) : `${nameOf(b.ids[0])} and ${b.ids.length === 2 ? nameOf(b.ids[1]) : `${b.ids.length - 1} more`}`;
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>The bookings book</h2><p class="sub">Sunday long lunch on the terrace, ${pretty(sunday)}, 12 to 3. ${seats} of ${LUNCH.seats} seats booked${list.length < all ? " so far: more will ring this week" : ""}.</p>`;
  if (!opts.terrace) return h + `<p class="muted">You'll need the terrace first: Darren can build it, from the vineyard stall.</p>` + shut;
  h += `<ul class="hlist lunchbook">${list.map(b => `<li><b>${fmt(b.at)}</b><span>${esc(label(b))}</span><small>${b.size} ${b.size === 1 ? "seat" : "seats"}${b.from ? ` · ${esc(b.from)}` : ""}</small></li>`).join("")}</ul>`;
  const want = Math.ceil(seats/2*3);
  h += `<p class="muted">Expect about ${want} bottles over lunch (a pair gets through one an hour, and Sunday tables go for the good stuff). You've ${shelf} on the shelves.${shelf < want ? " Worth bottling a bit more before Sunday." : ""} Host out on the terrace yourself and they'll order faster, and tip.</p>`;
  return h + shut;
}
