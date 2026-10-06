// Orchard tours and visits. Weekends: four paid tours a day (10am, 11:30, 2pm, 4pm), each led by Ma Ma, Gong Gong,
// Farid or Mei, taking a small group of villagers round the orchard and then the flower farm (a different mix every
// time). Weekdays: Darren leads a tour after work on Tuesdays and Thursdays. Every day a couple of villagers also
// wander over on their own. Tours pay TOUR_FEE a person into the farm shop's tin (orchard.js), once there's something
// to show (a few things planted). All of it is worked out from the date, so every screen agrees on who's where.
// tourSlot / visitSlot return routine-style slots that win over a villager's usual routine (npcs.js slotNow).
import { hash } from "../util.js";

export const TOUR_FEE = 4;
const WEEKEND = [[10*60, 10*60 + 45], [11*60 + 30, 12*60 + 15], [14*60, 14*60 + 45], [16*60, 16*60 + 45]];
const DARREN = [17*60 + 45, 18*60 + 30], DARREN_DAYS = [2, 4];
const GUIDES = ["mama", "gonggong", "farid", "mei"];
export const VISITORS = ["hana", "okada", "juniper", "bo", "lin", "pip", "opal", "theo"];
const dow = day => new Date(day + "T00:00:00Z").getUTCDay();
export const fmtTime = m => `${Math.floor(m/60) > 12 ? Math.floor(m/60) - 12 : Math.floor(m/60)}${m % 60 ? ":" + String(m % 60).padStart(2, "0") : ""}${m >= 12*60 ? "pm" : "am"}`;

// a few villagers picked by the day and the tour (no one twice in a group)
function groupFor(seed, n, skip = []){
  const pool = VISITORS.filter(v => !skip.includes(v)), out = [];
  for (let k = 0; out.length < n && k < 40; k++) { const v = pool[hash(seed + ":" + k) % pool.length]; if (!out.includes(v)) out.push(v); }
  return out;
}
// The day's tours: [{i, from, to, guide, group: [ids]}]
export function toursOn(day){
  const d = dow(day), out = [];
  if (d === 0 || d === 6) WEEKEND.forEach(([from, to], i) => { const guide = GUIDES[(hash(day) + i) % GUIDES.length];
    out.push({i, from, to, guide, group: groupFor(day + ":" + i, 3 + (hash(day + "n" + i) % 2))}); });
  else if (DARREN_DAYS.includes(d)) out.push({i: 0, from: DARREN[0], to: DARREN[1], guide: "darren", group: groupFor(day + ":d", 3)});
  return out;
}
// Where the group stands: round the trees first, then over to the flower beds for the second half
const SPOTS = {orchard: [[300, 418], [336, 432], [316, 448], [352, 414], [372, 444]], flowers: [[300, 376], [336, 392], [318, 410], [356, 380], [376, 404]]};
export function tourSlot(id, day, hm){
  for (const t of toursOn(day)) {
    if (hm < t.from || hm >= t.to || (t.guide !== id && !t.group.includes(id))) continue;
    const mid = t.from + Math.round((t.to - t.from)*.55), first = hm < mid, scene = first ? "orchard" : "flowers";
    return {from: first ? t.from : mid, to: first ? mid : t.to, scene, wander: SPOTS[scene], act: t.guide === id ? "guide" : null, tour: t};
  }
  return null;
}
// Drop-in visitors: weekdays one villager wanders the orchard at lunchtime and one the flower farm after work; at the
// weekend one wanders the flower farm at lunchtime (between tours). Never someone who's on a tour that day.
export function visitsOn(day){
  const d = dow(day), busy = toursOn(day).flatMap(t => [t.guide, ...t.group]), pick = seed => groupFor(day + seed, 1, busy)[0];
  return d === 0 || d === 6 ? [{id: pick("v1"), scene: "flowers", from: 12*60 + 30, to: 13*60 + 30}]
    : [{id: pick("v1"), scene: "orchard", from: 12*60 + 15, to: 13*60}, {id: pick("v2"), scene: "flowers", from: 17*60 + 15, to: 18*60}];
}
const WANDER = {orchard: [[160, 330], [260, 420], [360, 330], [310, 510], [210, 500]], flowers: [[160, 300], [260, 380], [360, 470], [310, 300], [210, 470]]};
export function visitSlot(id, day, hm){
  const v = visitsOn(day).find(x => x.id === id && hm >= x.from && hm < x.to);
  return v ? {from: v.from, to: v.to, scene: v.scene, wander: WANDER[v.scene]} : null;
}
// the tour on right now, if any
export const tourNow = (day, hm) => toursOn(day).find(t => hm >= t.from && hm < t.to) || null;
