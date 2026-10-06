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
// out-of-towners (data/npcs.js, tourist: true): they only come for tours, tastings and the farm shop
export const TOURISTS = ["aiko", "ben", "clara", "dev", "elena", "felix", "grace", "hiro"];
const dow = day => new Date(day + "T00:00:00Z").getUTCDay();
export const fmtTime = m => `${Math.floor(m/60) > 12 ? Math.floor(m/60) - 12 : Math.floor(m/60)}${m % 60 ? ":" + String(m % 60).padStart(2, "0") : ""}${m >= 12*60 ? "pm" : "am"}`;

// a few villagers picked by the day and the tour (no one twice in a group)
function groupFor(seed, n, skip = [], from = VISITORS){
  const pool = from.filter(v => !skip.includes(v)), out = [];
  for (let k = 0; out.length < n && k < 40; k++) { const v = pool[hash(seed + ":" + k) % pool.length]; if (!out.includes(v)) out.push(v); }
  return out;
}
// The day's tours: [{i, from, to, guide, group: [ids]}]
export function toursOn(day){
  const d = dow(day), out = [];
  // groups are a mix: a couple of villagers and one or two out-of-towners
  if (d === 0 || d === 6) WEEKEND.forEach(([from, to], i) => { const guide = GUIDES[(hash(day) + i) % GUIDES.length], t = 1 + (hash(day + "t" + i) % 2);
    out.push({i, from, to, guide, group: [...groupFor(day + ":" + i, 3 + (hash(day + "n" + i) % 2) - t), ...groupFor(day + ":t" + i, t, [], TOURISTS)]}); });
  else if (DARREN_DAYS.includes(d)) out.push({i: 0, from: DARREN[0], to: DARREN[1], guide: "darren", group: [...groupFor(day + ":d", 2), ...groupFor(day + ":dt", 1, [], TOURISTS)]});
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
  // out-of-towners browsing the farm shop in the morning and the flower beds in the afternoon (never someone touring)
  const tbusy = toursOn(day).flatMap(t => t.group), [t1, t2, t3] = groupFor(day + "tv", 3, tbusy, TOURISTS);
  const tourists = [{id: t1, scene: "orchard", from: 10*60 + 30, to: 11*60 + 30, wander: SHOPSIDE}, {id: t2, scene: "orchard", from: 10*60 + 45, to: 11*60 + 45, wander: SHOPSIDE},
    {id: t3, scene: "flowers", from: 14*60 + 30, to: 15*60 + 30}];
  return (d === 0 || d === 6 ? [{id: pick("v1"), scene: "flowers", from: 12*60 + 30, to: 13*60 + 30}]
    : [{id: pick("v1"), scene: "orchard", from: 12*60 + 15, to: 13*60}, {id: pick("v2"), scene: "flowers", from: 17*60 + 15, to: 18*60}]).concat(tourists);
}
const SHOPSIDE = [[390, 290], [430, 296], [460, 300], [400, 318]];
const WANDER = {orchard: [[160, 330], [260, 420], [360, 330], [310, 510], [210, 500]], flowers: [[160, 300], [260, 380], [360, 470], [310, 300], [210, 470]]};
export function visitSlot(id, day, hm){
  const v = visitsOn(day).find(x => x.id === id && hm >= x.from && hm < x.to);
  return v ? {from: v.from, to: v.to, scene: v.scene, wander: v.wander || WANDER[v.scene]} : null;
}
// the tour on right now, if any
export const tourNow = (day, hm) => toursOn(day).find(t => hm >= t.from && hm < t.to) || null;

// The field: picnickers at lunchtime, someone feeding the swans in the early evening, Pip playing football after school
// (and on weekend mornings), and Ma Ma and Gong Gong strolling round the lake on Friday afternoons and Sunday mornings.
const PICNIC = [[106, 468], [138, 464]], LAKESIDE = [[196, 384], [236, 388], [272, 380]], PITCH = [[96, 560], [150, 548], [204, 566], [130, 574]], STROLL = [[60, 330], [100, 380], [300, 380], [70, 250]];
export function fieldVisits(day){
  const d = dow(day), we = d === 0 || d === 6, busy = [...toursOn(day).flatMap(t => [t.guide, ...t.group]), ...visitsOn(day).map(v => v.id)];
  const pool = seed => groupFor(day + seed, 2, [...busy, "pip"]);
  const [p1, p2] = pool("pic"), [s1] = groupFor(day + "swan", 1, [...busy, "pip", p1, p2]);
  const out = [{id: p1, from: 12*60, to: 13*60 + 30, at: PICNIC[0], act: "sit"}, {id: p2, from: 12*60, to: 13*60 + 30, at: PICNIC[1], act: "sit"},
    {id: s1, from: 17*60 + 30, to: 18*60 + 30, wander: LAKESIDE}];
  if (we) out.push({id: "pip", from: 10*60, to: 11*60 + 30, wander: PITCH}, {id: "pip", from: 15*60, to: 16*60 + 30, wander: PITCH});
  else out.push({id: "pip", from: 15*60 + 30, to: 16*60 + 30, wander: PITCH});
  if (d === 5) out.push({id: "mama", from: 16*60, to: 17*60 + 30, wander: STROLL}, {id: "gonggong", from: 16*60, to: 17*60 + 30, wander: STROLL});
  if (d === 0) out.push({id: "mama", from: 8*60, to: 9*60 + 30, wander: STROLL}, {id: "gonggong", from: 8*60, to: 9*60 + 30, wander: STROLL});
  return out;
}
export function fieldSlot(id, day, hm){
  const v = fieldVisits(day).find(x => x.id === id && hm >= x.from && hm < x.to);
  return v ? Object.assign({from: v.from, to: v.to, scene: "field"}, v.at ? {at: v.at} : {wander: v.wander}, v.act ? {act: v.act} : {}) : null;
}

// Extra tasting-room regulars at the wine shop (on top of everyone's usual evening seat in npcs.js): afternoon drop-ins,
// the vineyard and orchard hands after work, Ma Ma and Gong Gong on Saturday afternoons, Darren on Friday nights.
// Seats are the chairs round the tasting room's three tables; nobody shares a chair at the same time.
const SEAT = {a: [87, 518], b: [173, 518], c: [227, 518], d: [313, 518], e: [367, 512], f: [453, 512]};
const TASTINGS = [
  {id: "lin", from: 14*60, to: 15*60 + 30, at: SEAT.c},
  {id: "okada", from: 15*60, to: 16*60, at: SEAT.e, days: "wd"},
  {id: "juniper", from: 15*60, to: 16*60 + 30, at: SEAT.e, days: "we"},
  {id: "hana", from: 15*60 + 30, to: 16*60 + 30, at: SEAT.d, dow: [1, 3, 5]},
  {id: "bo", from: 14*60, to: 15*60, at: SEAT.d, days: "we"},
  {id: "mama", from: 16*60 + 30, to: 17*60 + 30, at: SEAT.a, dow: [6]},
  {id: "gonggong", from: 16*60 + 30, to: 17*60 + 30, at: SEAT.b, dow: [6]},
  // after work: the vineyard hands first, then the orchard's farmhands
  {id: "ines", from: 17*60 + 30, to: 18*60 + 30, at: SEAT.a},
  {id: "marco", from: 18*60, to: 19*60, at: SEAT.b},
  {id: "farid", from: 18*60 + 45, to: 20*60 + 15, at: SEAT.a},
  {id: "mei", from: 19*60, to: 20*60 + 30, at: SEAT.b},
  {id: "darren", from: 20*60, to: 21*60 + 30, at: SEAT.e, dow: [5]}
];
// Out-of-towners at the tasting tables, in the gaps between the regulars: a pair at lunchtime, a pair late afternoon,
// a pair late evening, and an extra pair late morning at weekends (a different pair each time, from whoever isn't touring)
const TOURIST_SEATS = [[13*60, 14*60, [SEAT.a, SEAT.b]], [16*60, 17*60, [SEAT.c, SEAT.f]], [20*60 + 30, 21*60 + 45, [SEAT.b, SEAT.f]]], WEEKEND_SEATS = [11*60, 12*60, [SEAT.d, SEAT.e]];
export function touristTastings(day){
  const d = dow(day), busy = toursOn(day).flatMap(t => t.group), out = [];
  [...TOURIST_SEATS, ...(d === 0 || d === 6 ? [WEEKEND_SEATS] : [])].forEach(([from, to, seats], k) =>
    groupFor(day + "tt" + k, 2, busy, TOURISTS).forEach((id, j) => out.push({id, from, to, at: seats[j]})));
  return out;
}
export function tastingSlot(id, day, hm){
  const d = dow(day), we = d === 0 || d === 6;
  const v = [...TASTINGS, ...touristTastings(day)].find(x => x.id === id && hm >= x.from && hm < x.to && (!x.days || (x.days === "we") === we) && (!x.dow || x.dow.includes(d)));
  return v ? {from: v.from, to: v.to, scene: "wineshop", at: v.at, act: "sit"} : null;
}
