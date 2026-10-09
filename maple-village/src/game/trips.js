// Day trips (round 107). Buy tickets at Honeybrook station's window, pick who's coming, ride the train, and spend the
// day in the town; take the train home whenever you like (until the last train). Party members drop their usual day
// while they're away and follow Mel round the town; everyone else carries on as normal. The trip ends when Mel
// comes home, at the last train, or when the day changes.
// State: F.trip = {town, day, party: [ids], from: minutes, done?: true}.
import { esc, dayKey, sgHM } from "../util.js";
import { icon } from "../art/icons.js";
import { TOWNS, townOf } from "../data/towns.js";
import { NPCS } from "../data/npcs.js";
import { setAway } from "./tours.js";

// who can come, in the picker's order (Evan isn't a villager: he's Mel's own little follower)
export const FAMILY = ["mum", "dad", "mama", "gonggong", "darren", "evan", "marcus", "angelina"];
export const nameOf = id => id === "evan" ? "Evan" : (NPCS.find(n => n.id === id) || {}).name || id;
const fmt = m => `${Math.floor(m/60) % 12 || 12}${m % 60 ? ":" + String(m % 60).padStart(2, "0") : ""}${m < 12*60 ? "am" : "pm"}`;

// the trip that's on today (null once it's over, or on another day)
export const tripOn = (F, day = dayKey()) => F.trip && F.trip.day === day && !F.trip.done ? F.trip : null;
export const inParty = (F, id, day = dayKey()) => { const t = tripOn(F, day); return !!t && t.party.includes(id); };
// villagers away all day (not Evan: he's handled by core.js evanHere)
export const awayOn = (F, day = dayKey()) => { const t = tripOn(F, day); return t ? t.party.filter(id => id !== "evan") : []; };
export const fareFor = (town, party) => { const t = TOWNS[town]; return t.fare*(1 + party.filter(id => !t.free.includes(id)).length); };
export const canLeave = (town, hm = sgHM()) => hm >= TOWNS[town].outFrom && hm < TOWNS[town].outTo;
export const canReturn = (town, hm = sgHM()) => hm < TOWNS[town].backTo;
export function buyTrip(F, town, party, hm = sgHM()){
  const t = TOWNS[town]; if (!t || !canLeave(town, hm) || tripOn(F)) return null;
  party = FAMILY.filter(id => party.includes(id)); const cost = fareFor(town, party); if (F.coins < cost) return null;
  F.coins -= cost; F.trip = {town, day: dayKey(), party, from: hm}; return {cost, town: t};
}
export function endTrip(F){ if (F.trip && !F.trip.done) F.trip.done = true; }

// tours.js asks who's away (orchard tour guides, Ma Ma's stall, Mum's class, the family dinner)
// (a getter: the save can be swapped for a fresher copy from the cloud)
export function initTrips(getF){ setAway(day => { const F = getF(); return F ? awayOn(F, day) : []; }); }

// A party member's slot while the trip's on: wherever Mel is in the town (or the station, if she's not there yet),
// near their favourite spot on that screen. Not in Honeybrook at all, including while Mel's on the train.
export function tripSlot(F, id, day, hm, melScene){
  const t = tripOn(F, day); if (!t || !t.party.includes(id) || hm < t.from) return null;
  const T = TOWNS[t.town], scene = townOf(melScene) === t.town ? melScene : T.arrive[0], spots = (T.spots[id] || {})[scene];
  // at their spot doing their thing (in its hours), else strolling; the slot starts when the act starts or stops,
  // so they walk over (glide) rather than popping
  const a = ((T.acts || {})[id] || {})[scene], w = a && (a.hours ? a.hours.find(([f, e]) => hm >= f && hm < e) : [t.from, T.backTo]);
  if (w) return {from: Math.max(t.from, w[0]), to: w[1], scene, at: a.at, act: a.act, dir: a.dir, follow: true, glide: true, trip: true};
  const ended = a && a.hours ? Math.max(t.from, ...a.hours.map(([, e]) => e).filter(e => e <= hm)) : t.from;
  return {from: ended, to: T.backTo, scene, wander: spots || [[260, 400], [300, 360]], follow: true, glide: true, trip: true};
}
// a town line for a family member (tapping them in town, or the odd remark)
export const townLine = (F, id, scene) => { const town = townOf(scene), t = town && TOWNS[town]; return t && t.lines[id] ? t.lines[id] : null; };

const shut = `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
const coin = () => icon("coin", 13);
// The ticket window (Honeybrook station): where to, and who's coming
export function ticketPanel(F, pick, town = "ronda", hm = sgHM()){
  const t = TOWNS[town], party = FAMILY.filter(id => pick.includes(id)), cost = fareFor(town, party), open = canLeave(town, hm), on = tripOn(F);
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>Tickets to ${esc(t.n)}</h2><p class="sub">${esc(t.blurb)}</p>
    <p class="muted">${t.fare} ${coin()} return a person (Evan rides free). Trains out ${fmt(t.outFrom)} to ${fmt(t.outTo)}; the last train home leaves ${esc(t.n)} at ${fmt(t.backTo)}. A day trip: you'll be home tonight.</p>`;
  if (on) return h + `<p><b>You've been to ${esc(TOWNS[on.town].n)} today.</b> One trip a day: go again tomorrow.</p>` + shut;
  if (!open) return h + `<p><b>${hm < t.outFrom ? `The first train to ${esc(t.n)} is at ${fmt(t.outFrom)}.` : `That's the last train to ${esc(t.n)} gone for today. Tomorrow!`}</b></p>` + shut;
  h += `<h3 class="ph3">Who's coming?</h3><div class="trippicks">${FAMILY.map(id => `<button class="tpick${party.includes(id) ? " on" : ""}" data-tpick="${id}" aria-pressed="${party.includes(id)}"><b>${esc(nameOf(id))}</b><small>${t.free.includes(id) ? "free" : `${t.fare} ${coin()}`}</small></button>`).join("")}</div>`;
  h += `<p class="muted">${party.length ? `You${party.map(id => ", " + esc(nameOf(id))).join("").replace(/, ([^,]*)$/, " and $1")}: ${party.filter(id => !t.free.includes(id)).length + 1} ticket${party.filter(id => !t.free.includes(id)).length ? "s" : ""}.` : "Just you (and Maple, who rides in your bag)."} They'll take the day off from whatever they usually do.</p>`;
  h += `<div class="actions"><button class="btn primary" data-trip="${town}" ${F.coins >= cost ? "" : "disabled"}>Buy tickets and go · ${cost} ${coin()}</button></div>`;
  return h + shut;
}
// Ronda's station: the train home
export function homePanel(F, town, hm = sgHM()){
  const t = TOWNS[town], on = tripOn(F);
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>${esc(t.n)} station</h2><p class="sub">Trains home to Honeybrook whenever you're ready, until ${fmt(t.backTo)}.</p>`;
  if (on && on.party.length) h += `<p class="muted">With you today: ${on.party.map(nameOf).join(", ").replace(/, ([^,]*)$/, " and $1")}.</p>`;
  h += `<div class="actions"><button class="btn primary" data-triphome="1">Take the train home</button></div>`;
  return h + shut;
}
