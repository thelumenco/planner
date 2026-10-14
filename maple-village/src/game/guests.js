// The guest room (phase 3 of the public edition, replacing the personal edition's child's room): anyone in your
// address book (people met on day trips) can come and stay for three days. Invite them from the guest book in the
// guest room; they come on the 10:30 train the next morning, sleep in the guest room, spend their days about the
// village on a written plan (data/guests.js), and catch the 11 o'clock train on their last morning. A thank-you
// letter follows them home. No coins and no hearts: it's just nice to have someone to stay.
// State: F.guest = {id, day: arrival day, asked: day invited}; F.guestLog = {id: [arrival days]}
import { esc, dayKey, prevDay, hash, pick, now } from "../util.js";
import { GUEST_DAYS, GUEST_LINES, LEAVE } from "../data/guests.js";
import * as BK from "./contacts.js";

export const STAY = 3;
const D = 864e5;
const dayNo = k => Math.round(Date.parse(k + "T00:00:00Z")/D);
const addDays = (k, n) => new Date(Date.parse(k + "T00:00:00Z") + n*D).toISOString().slice(0, 10);
export const nameOf = id => (BK.person(id) || {}).name || "your guest";

// the stay that touches this day (booked, here, or just left), and which day of it this is (0, 1 or 2)
export function stayOn(F, day = dayKey()){
  const g = F.guest; if (!g || !g.id || !BK.person(g.id)) return null;
  const i = dayNo(day) - dayNo(g.day); return i >= 0 && i < STAY ? {...g, i} : null;
}
// the plan for a guest's day: arrival, a whole day (outdoors or gentle, by who it is), or the going-home morning
export const planFor = (id, i) => i === 0 ? GUEST_DAYS.arrive : i === STAY - 1 ? GUEST_DAYS.leave : hash(id) % 2 ? GUEST_DAYS.out : GUEST_DAYS.slow;
export const gone = (F, day = dayKey(), hm = 0) => { const s = stayOn(F, day); return !s || (s.i === STAY - 1 && hm >= LEAVE); };

// npcs.js asks this first for everyone: where a guest is right now (null for anyone else, or when nobody's staying)
export function guestSlot(F, id, day, hm){
  const s = stayOn(F, day); if (!s || s.id !== id) return null;
  const sl = planFor(id, s.i).find(x => hm >= x.from && hm < x.to); if (!sl) return null;
  return {...sl, guest: true, glide: true};
}
export const guestHere = (F, day = dayKey()) => { const s = stayOn(F, day); return s ? s.id : null; };

// a line for a guest to say where they are (or now and then something about home)
export function guestLine(F, id, scene, day = dayKey()){
  const s = stayOn(F, day); if (!s || s.id !== id) return null;
  const local = GUEST_LINES[scene], home = GUEST_LINES[BK.regionOf(id)];
  const r = Math.random();
  return pick(local && r < .55 ? local : home && r < .8 ? home : GUEST_LINES.any);
}

// invite: tomorrow, if nobody's staying or booked, and the last stay ended at least a day ago
export function canInvite(F, day = dayKey()){
  const g = F.guest; if (!g) return true;
  return dayNo(day) > dayNo(g.day) + STAY - 1;
}
export function invite(F, id, day = dayKey()){
  if (!BK.inBook(F, id) || !canInvite(F, day)) return false;
  F.guest = {id, day: addDays(day, 1), asked: day};
  return true;
}
export function cancel(F, day = dayKey()){ const g = F.guest; if (!g || dayNo(day) >= dayNo(g.day)) return false; F.guest = null; return true; }

// the thank-you letter, the morning after they go (mail.js picks it up through the game's letters list)
export function thanksLetter(F, dear){
  const g = F.guest; if (!g) return null;
  const at = Date.parse(addDays(g.day, STAY) + "T00:00:00Z") + 9*3600e3 - (new Date().getTimezoneOffset()*-60e3);
  if (now() < at) return null;
  const nm = nameOf(g.id), where = BK.REGIONS[BK.regionOf(g.id)] || "home";
  return {id: `guest-${g.id}-${g.day}`, from: "postie", at, title: `Thank you from ${nm}`,
    body: `${dear},\n\nHome safe in ${where}, and already missing Honeybrook. Thank you for the guest room, the suppers and the walks. I've told everyone about Hana's honey toast and Farid's cake. My bag smelled of Mei's roses all the way home.\n\nCome and see me again soon. And the room's yours whenever you're passing.\n\nWith love,\n${nm}`};
}

// the guest book panel (the writing desk in the guest room)
export function guestBookHTML(F, day = dayKey()){
  const shut = `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>The guest book</h2>`;
  const s = stayOn(F, day), fmt = m => `${Math.floor(m/60) % 12 || 12}${m % 60 ? ":" + String(m % 60).padStart(2, "0") : ""}${m < 12*60 ? "am" : "pm"}`;
  if (s) {
    const nm = esc(nameOf(s.id)), plan = planFor(s.id, s.i).filter(x => !x.night);
    h += `<p class="sub">${nm} is staying${s.i === STAY - 1 ? ", and goes home on the 11 o'clock train this morning" : s.i === 0 ? ": arriving on the 10:30 train" : ""}. Day ${s.i + 1} of ${STAY}.</p>
      <p class="eyebrow">Today's plan</p><ul class="hlist">${plan.map(x => `<li><span>${fmt(x.from)}</span> ${esc(x.plan)}</li>`).join("")}</ul>`;
    return h + shut;
  }
  if (F.guest && dayNo(F.guest.day) > dayNo(day)) {
    h += `<p class="sub">${esc(nameOf(F.guest.id))} is coming tomorrow on the 10:30 train, for ${STAY} days. The bed's made.</p><div class="actions"><button class="btn small alt" data-guest="cancel">Put it off</button></div>`;
    return h + shut;
  }
  const book = BK.contacts(F);
  h += `<p class="sub">Friends from your travels can come and stay for ${STAY} days: off the morning train, round the village, supper, and the guest room at night.</p>`;
  if (!book.length) return h + `<p class="muted">Nobody to invite yet. Add the people you meet on day trips to your address book first.</p>` + shut;
  if (!canInvite(F, day)) return h + `<p class="muted">The sheets are in the wash. Invite someone tomorrow.</p>` + shut;
  h += `<p class="eyebrow">Invite someone</p><div class="actions">${book.map(id => `<button class="btn small alt" data-guest="ask:${esc(id)}">${esc(nameOf(id))}<small> · ${esc(BK.REGIONS[BK.regionOf(id)] || "")}</small></button>`).join("")}</div>`;
  const log = Object.keys(F.guestLog || {});
  if (log.length) h += `<p class="muted">Signed the book so far: ${log.map(id => esc(nameOf(id))).join(", ")}.</p>`;
  return h + shut;
}
// sign the book once a stay begins
export function signBook(F, day = dayKey()){ const s = stayOn(F, day); if (!s) return; const L = F.guestLog = F.guestLog || {}; L[s.id] = L[s.id] || []; if (!L[s.id].includes(s.day)) L[s.id].push(s.day); }
export { prevDay };
