// Day trips (round 107). Buy tickets at Honeybrook station's window, pick who's coming, ride the train, and spend the
// day in the town; take the train home whenever you like (until the last train). Party members drop their usual day
// while they're away and follow you round the town; everyone else carries on as normal. The trip ends when you
// come home, at the last train, or when the day changes.
// State: F.trip = {town, day, party: [ids], from: minutes, done?: true}.
import { esc, dayKey, localHM, hash } from "../util.js";
import { icon } from "../art/icons.js";
import { TOWNS, townOf } from "../data/towns.js";
import { NPCS } from "../data/npcs.js";
import { setAway } from "./tours.js";
import { friendIds, TRIP_HEARTS } from "./quests.js";

// who can come, in the picker's order: anyone in the village at five hearts, the ones you know best first
export const tripFriends = F => friendIds(F, TRIP_HEARTS);
export const NOBODY = "Nobody's close enough to come along yet. Friends at five hearts can join you on a day trip.";
export const nameOf = id => ((NPCS.find(n => n.id === id) || {}).name || id);
const fmt = m => `${Math.floor(m/60) % 12 || 12}${m % 60 ? ":" + String(m % 60).padStart(2, "0") : ""}${m < 12*60 ? "am" : "pm"}`;

// the trip that's on today (null once it's over, or on another day)
export const tripOn = (F, day = dayKey()) => F.trip && F.trip.day === day && !F.trip.done ? F.trip : null;
export const inParty = (F, id, day = dayKey()) => { const t = tripOn(F, day); return !!t && t.party.includes(id); };
// villagers away all day
export const awayOn = (F, day = dayKey()) => { const t = tripOn(F, day); return t ? t.party.slice() : []; };
// by: "train" (the train towns) or "ferry" (towns with a ferry: Jeju, round 127; the islands, round 215)
export const fareFor = (town, party, by = "train") => { const t = TOWNS[town]; if (by === "boat") return t.boat ? t.boat.fuel : 0; const f = by === "ferry" && t.ferry ? t.ferry.fare : t.fare; return f*(1 + party.filter(id => !t.free.includes(id)).length); };
export const canLeave = (town, hm = localHM()) => hm >= TOWNS[town].outFrom && hm < TOWNS[town].outTo;
export const canReturn = (town, hm = localHM()) => hm < TOWNS[town].backTo;
export function buyTrip(F, town, party, hm = localHM(), by = "train"){
  const t = TOWNS[town]; if (!t || !canLeave(town, hm) || tripOn(F) || (by === "ferry" && !t.ferry) || (by === "boat" && !t.boat)) return null;
  party = tripFriends(F).filter(id => party.includes(id)); if (by === "boat") party = party.slice(0, t.boat.max); const cost = fareFor(town, party, by); if (F.coins < cost) return null;
  F.coins -= cost; F.trip = {town, day: dayKey(), party, from: hm, by: by === "boat" ? "ferry" : by, ...(by === "boat" ? {own: true} : {})};   // (your own boat lands where the ferry does)
  F.towns = {...(F.towns || {}), [town]: F.towns && F.towns[town] || dayKey()};   // F.towns: where you've been (first visit), round 132
  return {cost, town: t, by};
}
export function endTrip(F){ if (F.trip && !F.trip.done) F.trip.done = true; }

// tours.js asks who's away (the farm tour guides, Farid's stall, Hana's class)
// (a getter: the save can be swapped for a fresher copy from the cloud)
export function initTrips(getF){ setAway(day => { const F = getF(); return F ? awayOn(F, day) : []; }); }

// someone with no spots of their own here (only the first friends to come along have them) borrows a set nobody
// else in the party is using, so they still keep to the paths
const borrow = (T, party, id, scene) => { const ks = Object.keys(T.spots || {}).filter(k => T.spots[k][scene]), free = ks.filter(k => !party.includes(k)), pool = free.length ? free : ks;
  return pool.length ? T.spots[pool[hash(id) % pool.length]][scene] : null; };
// A party member's slot while the trip's on: wherever the player is in the town (or the station, if they're not there yet),
// near their favourite spot on that screen. Not in Honeybrook at all, including while the player's on the train.
export function tripSlot(F, id, day, hm, melScene){
  const t = tripOn(F, day); if (!t || !t.party.includes(id) || hm < t.from) return null;
  const T = TOWNS[t.town], scene = townOf(melScene) === t.town ? melScene : t.by === "ferry" && T.ferry ? T.ferry.arrive[0] : T.arrive[0], spots = (T.spots[id] || {})[scene] || ((T.rooms || {})[scene] || {}).party || borrow(T, t.party, id, scene);   // (inside, the room's own spots)
  // at their spot doing their thing (in its hours), else strolling; the slot starts when the act starts or stops,
  // so they walk over (glide) rather than popping
  const a = ((T.acts || {})[id] || {})[scene], w = a && (a.hours ? a.hours.find(([f, e]) => hm >= f && hm < e) : [t.from, T.backTo]);
  if (w) return {from: Math.max(t.from, w[0]), to: w[1], scene, at: a.at, act: a.act, dir: a.dir, free: a.free, follow: true, glide: true, trip: true};
  const ended = a && a.hours ? Math.max(t.from, ...a.hours.map(([, e]) => e).filter(e => e <= hm)) : t.from;
  return {from: ended, to: T.backTo, scene, wander: spots || [[260, 400], [300, 360]], follow: true, glide: true, trip: true};
}
// a town line for a party member (null for anyone without one: they say their usual things) (tapping them in town, or the odd remark)
export const townLine = (F, id, scene) => { const town = townOf(scene), t = town && TOWNS[town]; return t && t.lines[id] ? t.lines[id] : null; };

const shut = `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
const coin = () => icon("coin", 13);
// The ticket window (Honeybrook station): where to, and who's coming
export function ticketPanel(F, pick, town = "ronda", hm = localHM(), by = "train"){
  const t = TOWNS[town], who = tripFriends(F), party = who.filter(id => pick.includes(id)), cost = fareFor(town, party, by), open = canLeave(town, hm), on = tripOn(F), boat = by === "ferry", fare = boat ? t.ferry.fare : t.fare, ride = boat ? "ferry" : "train";
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>${boat ? "The ferry" : "Tickets"} to ${esc(t.n)}</h2><div class="gchips">${Object.entries(TOWNS).filter(([, x]) => boat ? !!x.ferry && !x.soon : x.by === "train").map(([k, x]) => `<button class="gchip${k === town ? " on" : ""}" data-${boat ? "f" : "t"}town="${k}" aria-pressed="${k === town}"><span>${esc(x.n)}</span></button>`).join("")}</div><p class="sub">${esc(boat ? t.ferry.blurb || t.blurb : t.blurb)}</p>
    <p class="muted">${fare} ${coin()} return a person. ${boat ? "Ferries" : "Trains"} out ${fmt(t.outFrom)} to ${fmt(t.outTo)}; the last ${ride} home leaves ${esc(t.n)} at ${fmt(t.backTo)}. A day trip: you'll be home tonight.</p>`;
  if (on) return h + `<p><b>You've been to ${esc(TOWNS[on.town].n)} today.</b> One trip a day: go again tomorrow.</p>` + shut;
  if (!open) return h + `<p><b>${hm < t.outFrom ? `The first ${ride} to ${esc(t.n)} is at ${fmt(t.outFrom)}.` : `That's the last ${ride} to ${esc(t.n)} gone for today. Tomorrow!`}</b></p>` + shut;
  h += `<h3 class="ph3">Who's coming?</h3>${who.length ? "" : `<p class="muted">${NOBODY}</p>`}<div class="trippicks">${who.map(id => `<button class="tpick${party.includes(id) ? " on" : ""}" data-tpick="${id}" aria-pressed="${party.includes(id)}"><b>${esc(nameOf(id))}</b><small>${t.free.includes(id) ? "free" : `${fare} ${coin()}`}</small></button>`).join("")}</div>`;
  h += `<p class="muted">${party.length ? `You${party.map(id => ", " + esc(nameOf(id))).join("").replace(/, ([^,]*)$/, " and $1")}: ${party.filter(id => !t.free.includes(id)).length + 1} ticket${party.filter(id => !t.free.includes(id)).length ? "s" : ""}.` : `Just you (and ${esc(F.name)}, who rides in your bag).`} They'll take the day off from whatever they usually do.</p>`;
  h += `<div class="actions"><button class="btn primary" data-trip="${town}" data-by="${by}" ${F.coins >= cost ? "" : "disabled"}>Buy tickets and go · ${cost} ${coin()}</button></div>`;
  return h + shut;
}
// Ronda's station: the train home
export function homePanel(F, town, hm = localHM(), by = "train"){
  const t = TOWNS[town], on = tripOn(F), boat = by === "ferry";
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>${esc(t.n)} ${boat ? "ferry pier" : "station"}</h2><p class="sub">${boat ? "Ferries home to Honeybrook's foreshore jetty" : "Trains home to Honeybrook"} whenever you're ready, until ${fmt(t.backTo)}.</p>`;
  if (on && on.party.length) h += `<p class="muted">With you today: ${on.party.map(nameOf).join(", ").replace(/, ([^,]*)$/, " and $1")}.</p>`;
  h += `<div class="actions"><button class="btn primary" data-triphome="${by}">Take the ${boat ? "ferry" : "train"} home</button></div>`;
  return h + shut;
}
// Your own boat (round 215, once the dolphin cruise boat's bought): a cruise to see the dolphins, or a day out to an
// island that has a mooring for it (Saltwick Harbour): just the fuel, and up to seven friends aboard. Daylight and dry days.
export function boatPanel(F, pick, town, hm = localHM(), wet = false){
  const isles = Object.entries(TOWNS).filter(([, x]) => x.boat && !x.soon);
  if (!isles.length) return `<span class="tape gingham" aria-hidden="true"></span><h2>Your boat</h2><div class="actions"><button class="btn alt" data-boat="cruise">A dolphin cruise up the coast</button></div>` + shut;
  const t = TOWNS[town] || TOWNS[isles[0][0]], id = TOWNS[town] ? town : isles[0][0], who = tripFriends(F), party = who.filter(x => pick.includes(x)).slice(0, t.boat.max), on = tripOn(F), open = canLeave(id, hm) && !wet;
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>Your boat</h2><p class="sub">She's tied up at the end of the jetty, rocking gently, with a full tank and a flask of tea in the cabin.</p>
    <div class="actions"><button class="btn alt" data-boat="cruise">A dolphin cruise up the coast</button></div>
    <h3 class="ph3">Or sail somewhere for the day</h3><div class="gchips">${isles.map(([k, x]) => `<button class="gchip${k === id ? " on" : ""}" data-btown="${k}" aria-pressed="${k === id}"><span>${esc(x.n)}</span></button>`).join("")}</div>
    <p class="muted">${t.boat.fuel} ${coin()} of fuel, however many come. Up to ${t.boat.max} friends aboard. Set off between ${fmt(t.outFrom)} and ${fmt(t.outTo)}, and be home by dark.</p>`;
  if (on) return h + `<p><b>You've been to ${esc(TOWNS[on.town].n)} today.</b> One trip a day: go again tomorrow.</p>` + shut;
  if (wet) return h + `<p><b>Not in this weather. The harbour master would have words.</b></p>` + shut;
  if (!open) return h + `<p><b>${hm < t.outFrom ? `Too early to set off: from ${fmt(t.outFrom)}.` : "Too late to set off today. Tomorrow!"}</b></p>` + shut;
  h += `<h3 class="ph3">Who's coming?</h3>${who.length ? "" : `<p class="muted">${NOBODY}</p>`}<div class="trippicks">${who.map(x => `<button class="tpick${party.includes(x) ? " on" : ""}" data-tpick="${x}" aria-pressed="${party.includes(x)}"><b>${esc(nameOf(x))}</b><small>free</small></button>`).join("")}</div>`;
  return h + `<div class="actions"><button class="btn primary" data-trip="${id}" data-by="boat" ${F.coins >= t.boat.fuel ? "" : "disabled"}>Cast off · ${t.boat.fuel} ${coin()}</button></div>` + shut;
}
