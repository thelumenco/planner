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
  const ev = eventOn(day), keepers = ev ? ev.stalls.map(x => x.id) : [];
  const guides = GUIDES.filter(g => !keepers.includes(g));
  if (d === 0 || d === 6) WEEKEND.forEach(([from, to], i) => { const guide = guides[(hash(day) + i) % guides.length], t = 1 + (hash(day + "t" + i) % 2);
    out.push({i, from, to, guide, group: [...groupFor(day + ":" + i, 3 + (hash(day + "n" + i) % 2) - t), ...groupFor(day + ":t" + i, t, keepers, TOURISTS)]}); });
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
const TOURIST_SEATS = [[12*60, 13*60, [SEAT.d, SEAT.e]], [13*60, 14*60, [SEAT.a, SEAT.b]], [14*60 + 30, 15*60 + 30, [SEAT.a, SEAT.b]], [16*60, 17*60, [SEAT.c, SEAT.f]],
  [17*60, 17*60 + 45, [SEAT.d, SEAT.e]], [20*60 + 30, 21*60 + 45, [SEAT.b, SEAT.f]]];
const WEEKEND_SEATS = [[11*60, 12*60, [SEAT.d, SEAT.e]], [16*60 + 30, 17*60 + 30, [SEAT.d, SEAT.e]]];
export function touristTastings(day){
  const d = dow(day), busy = toursOn(day).flatMap(t => t.group), out = [];
  const ev = eventOn(day), stallKeepers = ev ? ev.stalls.map(x => x.id) : [];
  [...TOURIST_SEATS, ...(d === 0 || d === 6 ? WEEKEND_SEATS : [])].forEach(([from, to, seats], k) =>
    groupFor(day + "tt" + k, 2, [...busy, ...stallKeepers], TOURISTS).forEach((id, j) => out.push({id, from, to, at: seats[j]})));
  return out;
}
export function tastingSlot(id, day, hm){
  const d = dow(day), we = d === 0 || d === 6;
  const v = [...TASTINGS, ...touristTastings(day)].find(x => x.id === id && hm >= x.from && hm < x.to && (!x.days || (x.days === "we") === we) && (!x.dow || x.dow.includes(d)));
  return v ? {from: v.from, to: v.to, scene: "wineshop", at: v.at, act: "sit"} : null;
}

// Tourist families at the vineyard playground: the kids run between the swings, slide, seesaw and roundabout while a
// parent watches. One family on weekday afternoons; at weekends the playground is busy morning and afternoon.
export const FAMILIES = [{parent: "sam", kids: ["lily", "max"]}, {parent: "priya", kids: ["noah"]}, {parent: "jonah", kids: ["zara", "ollie"]}, {parent: "mia", kids: ["ava"]}];
const PLAY = [[110, 604], [262, 600], [410, 608], [188, 584], [330, 590], [470, 590], [150, 600]], WATCH = [[180, 556], [346, 560], [60, 560], [420, 548]];
export function familyVisits(day){
  const d = dow(day), we = d === 0 || d === 6, h = hash(day), fam = k => FAMILIES[(h + k) % FAMILIES.length], out = [];
  const add = (f, from, to, scene = "vineyard") => { out.push({id: f.parent, from, to, scene, wander: scene === "vineyard" ? WATCH : FIELD_WALK});
    f.kids.forEach(k => out.push({id: k, from, to, scene, wander: scene === "vineyard" ? PLAY : FIELD_PLAY})); };
  if (we) { add(fam(0), 10*60, 12*60); add(fam(1), 10*60 + 30, 12*60 + 30); add(fam(2), 12*60 + 45, 14*60 + 45); add(fam(3), 15*60, 17*60 + 30); add(fam(0), 15*60 + 30, 17*60 + 30);
    // on market and fair days, a couple of the families go to the field first
    const ev = eventOn(day); if (ev) { out.splice(0, out.length); add(fam(0), ev.from, ev.from + 120, "field"); add(fam(1), ev.from + 60, ev.from + 180, "field");
      add(fam(2), 12*60 + 45, 14*60 + 45); add(fam(3), 15*60, 17*60 + 30); } }
  else add(fam(0), 15*60 + 30, 17*60);
  return out;
}
export function familySlot(id, day, hm){
  const v = familyVisits(day).find(x => x.id === id && hm >= x.from && hm < x.to);
  return v ? {from: v.from, to: v.to, scene: v.scene, wander: v.wander} : null;
}

// Events at the field: the Sunday farmers market (8am to 1pm, every week) and the field fair on the last Saturday of
// each month (10am to 4pm: kites, face painting, lemonade, snacks). The stalls stand in a row along the top of the field,
// above the path. Out-of-towners run most of them; at the Sunday market the wine shop has a stall (Ines minds it, selling
// from the shop's own shelves) and so does Ma Ma (fruit and flowers from the orchard's farm shop stock).
// at: which of the six stall places along the top it stands in
// (place 8 isn't on the top row: it's the Scoop Shack's cart on the grass between the path and the river)
export const STALL_SPOTS = [[36, 128], [96, 128], [156, 128], [216, 128], [276, 128], [336, 128], [396, 128], [456, 128], [306, 520], [196, 520]];
// produce: the stall sells whatever vegetables and berries are in season (core.js works out which)
export const MARKET = [{id: "elena", at: 0, short: "Cheese", n: "Cheese and olives", items: ["cheese", "olives"], col: "#F3C969", line: "Aged on a farm up the hill. Try a slice!"},
  {id: "felix", at: 1, short: "Honey", n: "Honey and bee things", items: ["honey", "honeycomb", "beecandle", "toast"], col: "#E3A23A", line: "Wildflower honey, from my own bees. The candles are pure beeswax."},
  {id: "clara", at: 2, short: "Produce", n: "Fresh produce", items: [], produce: true, col: "#9CC27E", line: "Picked yesterday, whatever's in season. Have a look!"},
  {id: "ines", at: 3, kind: "wine", short: "Our wines", n: "Our wine stall", items: [], col: "#8E2C48", line: "Tastings and bottles, straight from the shop's shelves."},
  {id: "mama", at: 4, kind: "orchard", short: "Ma Ma's", n: "Ma Ma's fruit and flowers", items: [], col: "#E8566C", line: "Fresh from the orchard this morning. Come, take some!"},
  {id: "grace", at: 5, short: "Soap", n: "Handmade soap", items: ["soap_lav", "soap_rose", "soap_duck", "scrub", "crown"], col: "#C9A3E0", line: "All made by hand, in small batches. Smell the lavender!"},
  {id: "ben", at: 6, short: "Craft beer", n: "Craft beer", items: ["paleale", "stout"], col: "#D9A441", line: "Brewed in my shed. Well, the shed's quite big."},
  {id: "dev", at: 7, short: "Bakery", n: "Bakery", items: ["kaya", "currypuff", "flour"], col: "#C98A4A", line: "Still warm! Kaya buns and curry puffs."},
  // Noor's pet adoption corner, on the grass by the river (place 8): a little pen of animals looking for homes
  {id: "noor", at: 8, kind: "pets", short: "Adopt a pet", n: "Pet adoption corner", items: ["pet_kitten"], col: "#9FD3C2", line: "Every one of them needs a home. Who'll look after them?"}];
export const FAIR = [{id: "hiro", at: 2, short: "Kites", n: "Kites", items: [], act: "kite", col: "#7FB8E8", line: "Pick a kite, any kite. They all fly!"},
  {id: "aiko", at: 3, short: "Faces", n: "Face painting", items: [], act: "face", col: "#C9A3E0", line: "Butterflies, tigers, dinosaurs. You choose!"},
  {id: "ben", at: 4, short: "Lemonade", n: "Lemonade", items: ["apple"], col: "#F3D34A", line: "Fresh lemonade, and apples for the road."},
  {id: "clara", at: 5, short: "Snacks", n: "Snacks", items: ["dumpling", "ondeh"], col: "#F2A0B8", line: "Dumplings and ondeh-ondeh, made this morning."},
  {id: "noor", at: 8, kind: "pets", short: "Adopt a pet", n: "Pet adoption corner", items: ["pet_kitten"], col: "#9FD3C2", line: "Every one of them needs a home. Who'll look after them?"}];
// The night market, Tuesday and Thursday evenings 5:30 to 10pm, after the night markets of Taipei and Seoul: street food,
// sweets, hair things, keychains, socks and tees, lanterns for the house. All out-of-towners, a jazz duo on a little
// stage on the football pitch, fairy lights over everything. decor: things for the house (bought like at Hana's Home tab)
export const NIGHT = [{id: "yun", at: 0, short: "Taiwan eats", n: "Taiwanese street snacks", items: ["friedchicken", "scallion", "bubbletea"], col: "#E8566C", line: "Fried chicken as big as your face! And the bubble tea's brown sugar."},
  {id: "jae", at: 1, short: "Seoul eats", n: "Korean street food", items: ["hotteok", "tteokbokki", "eggbread"], col: "#F28C6A", line: "Hotteok, hot off the griddle. Careful, the sugar's molten."},
  {id: "mina", at: 2, short: "Hair things", n: "Hair clips and scrunchies", items: ["pearlclip", "clawclip", "scrunchie"], col: "#F4C7CF", line: "Pearl clips, claw clips, velvet scrunchies. Try them on!"},
  {id: "tomas", at: 3, short: "Charms", n: "Keychains and charms", items: ["dinokey", "luckycharm"], col: "#9C8CD9", line: "Little charms for your keys and your phone. The dino glows in the dark."},
  {id: "sora", at: 4, short: "Socks & tees", n: "Socks, hats and tees", items: ["cosysocks", "buckethat", "dinotee"], col: "#7FB8E8", line: "Cosy socks, three for the price of happy. And a bucket hat for everyone."},
  {id: "lior", at: 5, short: "Lanterns", n: "Lanterns and lamps", items: [], decor: ["n_lanterns", "r_moon"], col: "#F3C969", line: "Paper lanterns for the house, and a moon lamp for your room."},
  {id: "wen", at: 6, short: "Sweets", n: "Sweets", items: ["tanghulu", "eggwaffle"], col: "#C9A3E0", line: "Tanghulu, strawberries in crackly sugar. And egg waffles, still warm."},
  {id: "kai", at: 7, short: "Drinks", n: "Night drinks", items: ["sugarcane", "grassjelly"], col: "#9CC27E", line: "Fresh sugarcane, pressed while you wait. Grass jelly for the old-school ones."},
  // Mel's own: the Scoop Shack's cart, scooping from the shop's display (scoop.js cartOn). Tomo minds it after his day on the deck
  {id: "tomo", at: 8, kind: "scoop", short: "Scoop Shack", n: "The Scoop Shack cart", items: [], col: "#F2A0B8", line: "Gelato from the Scoop Shack! Cup or cone?"},
  // and the Cocoa Room's chocolate cart, once it's bought (cocoa.js upgrade "cart"): Mateo minds it
  {id: "mateo", at: 9, kind: "cocoa", needs: "cc_cart", short: "Cocoa Room", n: "The Cocoa Room cart", items: [], col: "#8A5A3A", line: "Chocolate from the Cocoa Room! Bars, bonbons, hot chocolate."}];
// stalls that only stand once Mel's bought them (needs): core.js tells us what's owned
let ownedNow = () => ({});
export const setStallOwned = fn => { ownedNow = fn; };
const standing = list => { const o = ownedNow(); return list.filter(s => !s.needs || o[s.needs]); };
export const NIGHT_TOURISTS = ["noa", "jun", "bea", "omar", "lucy", "tae", "ivy", "rafe"];
export const STAGE = {x: 452, y: 462}, STAGE_WATCH = [[404, 560], [446, 566], [492, 536], [508, 562], [426, 590]];
function lastSaturday(day){ const dt = new Date(day + "T00:00:00Z"); if (dt.getUTCDay() !== 6) return false; const n = new Date(dt.getTime() + 7*864e5); return n.getUTCMonth() !== dt.getUTCMonth(); }
export function eventOn(day){
  if (dow(day) === 0) return {kind: "market", name: "Sunday farmers market", from: 8*60, to: 13*60, stalls: MARKET, wine: true};
  if (lastSaturday(day)) return {kind: "fair", name: "Field fair", from: 10*60, to: 16*60, stalls: FAIR, wine: false};
  if (dow(day) === 2 || dow(day) === 4) return {kind: "night", name: "Night market", from: 17*60 + 30, to: 22*60, stalls: standing(NIGHT), wine: false};
  return null;
}
export const eventNow = (day, hm) => { const e = eventOn(day); return e && hm >= e.from && hm < e.to ? e : null; };
// the stall standing in place i right now (or null)
export const stallAt = (day, hm, i) => { const e = eventNow(day, hm); return e ? e.stalls.find(s => s.at === i) || null : null; };
// shoppers at the event: villagers drifting between the stalls along the top in two waves; in each wave two of them
// settle on the picnic blankets afterwards with what they bought. The keepers stand by their stalls.
const FIELD_WALK = [[60, 172], [140, 178], [220, 172], [300, 178], [380, 174], [450, 182], [120, 196]], FIELD_PLAY = [[150, 470], [200, 500], [90, 600], [240, 590], [60, 430]];
const PICNICKERS = [[106, 468], [138, 464], [198, 486], [230, 482]];
// Stall keepers don't stand still all morning: every half hour each picks something to do. Behind the table, out
// in front, sitting on the crate, over chatting to shoppers on the path, or off wandering the market (the stall
// runs on an honesty tin while they're away). The first half hour everyone's setting up behind their stall.
const POSES = ["behind", "behind", "front", "sit", "chat", "wander"], POSE_LEN = 30;
export function keeperPose(st, day, hm){
  const e = eventOn(day); if (!e || hm < e.from || hm >= e.to) return null;
  const k = Math.floor((hm - e.from)/POSE_LEN);
  return {k, pose: k === 0 ? "behind" : POSES[hash(day + ":" + st.id + ":" + k) % POSES.length], from: e.from + k*POSE_LEN, to: Math.min(e.to, e.from + (k + 1)*POSE_LEN)};
}
// the keeper's away from the stall (it's an honesty tin while they're gone)
export const keeperAway = (st, day, hm) => { const p = keeperPose(st, day, hm); return !!p && (p.pose === "chat" || p.pose === "wander"); };
function keeperSlot(st, e, day, hm){
  const {k, pose, from, to} = keeperPose(st, day, hm), [x, y] = STALL_SPOTS[st.at], base = {from, to, scene: "field", glide: true};
  if (pose === "behind") return {...base, at: [x + 3, y - 9]};
  if (pose === "front") return {...base, at: [x + 9, y + 9]};
  const side = st.kind === "scoop" || st.kind === "cocoa" || st.kind === "pets";   // the cart and the pen have their crate on the right
  if (pose === "sit") return {...base, at: [x + (side ? 34 : -17), y + 7], act: "sit", dir: side ? -1 : 1};
  if (pose === "chat") { const side = k % 2 ? 1 : -1; return {...base, at: [Math.max(30, Math.min(490, x + side*30)), y + 48], dir: -side}; }
  return {...base, wander: FIELD_WALK};
}
export function eventSlot(id, day, hm){
  const e = eventOn(day); if (!e || hm < e.from || hm >= e.to) return null;
  const st = e.stalls.find(s => s.id === id);
  if (st) return keeperSlot(st, e, day, hm);
  if (e.kind === "night") return nightShopper(id, e, day, hm);
  const mid = e.from + Math.round((e.to - e.from)/2), wave = hm < mid ? 0 : 1, half = Math.round((wave ? e.to - mid : mid - e.from)/2), start = wave ? mid : e.from;
  const crowd = groupFor(day + "ev" + wave, 4, ["pip", ...e.stalls.map(s => s.id), ...toursOn(day).flatMap(t => [t.guide, ...t.group])], [...VISITORS, ...TOURISTS, "sam", "priya"]);
  const k = crowd.indexOf(id);
  if (k >= 2 && hm >= start + half) return {from: start + half, to: wave ? e.to : mid, scene: "field", at: PICNICKERS[wave ? k : k - 2], act: "sit"};
  if (k >= 0 || id === "pip") return {from: start, to: wave ? e.to : mid, scene: "field", wander: id === "pip" ? FIELD_PLAY : FIELD_WALK};
  return null;
}
// Night market shoppers: mostly tourists (five a wave, two waves), plus two villagers a wave. Some browse the stalls,
// some stand by the stage listening to the jazz, two sit on the picnic blankets with their food. These slots are
// marked night: npcs.js skips them for anyone due at the wine shop then, so the evening regulars still drop in.
function nightShopper(id, e, day, hm){
  const mid = e.from + (e.to - e.from)/2, wave = hm < mid ? 0 : 1, from = wave ? mid : e.from, to = wave ? e.to : mid;
  const tour = groupFor(day + "nt" + wave, 5, [], NIGHT_TOURISTS), vill = groupFor(day + "nv" + wave, 2, ["pip"], VISITORS);
  const k = tour.indexOf(id), v = vill.indexOf(id), base = {from, to, scene: "field", night: true};
  if (k === 0 || k === 1) return {...base, at: STAGE_WATCH[k + wave*2], dir: k ? -1 : 1};
  if (k === 2) return {...base, at: PICNICKERS[wave], act: "sit"};
  if (k >= 3) return {...base, wander: FIELD_WALK};
  if (v === 0) return {...base, wander: FIELD_WALK};
  if (v === 1) return {...base, at: STAGE_WATCH[4], dir: 1};
  return null;
}

// Mum's exercise class on the exercise lawn at the field (east of the river), 8 to 9am Monday to Saturday: Pilates on
// Mondays and Wednesdays, Zumba on Tuesdays and Thursdays, Piloxing on Fridays and Saturdays. Three villagers join
// her each morning (Mel can join too: tap the lawn). Not on market Sundays.
export const CLASS_FROM = 8*60, CLASS_TO = 9*60, LAWN = [452, 404];
const CLASS_KIND = {1: "Pilates", 2: "Zumba", 3: "Pilates", 4: "Zumba", 5: "Piloxing", 6: "Piloxing"};
const MATS = [[418, 444], [456, 452], [494, 444], [436, 480]];
const CLASS_POOL = ["lin", "okada", "juniper", "hana", "opal", "bo", "angelina", "priya"];
export const classOn = day => CLASS_KIND[dow(day)] ? {kind: CLASS_KIND[dow(day)], from: CLASS_FROM, to: CLASS_TO,
  who: groupFor(day + ":class", 3, [], CLASS_POOL)} : null;
export function classSlot(id, day, hm){
  const c = classOn(day); if (!c || hm < c.from || hm >= c.to) return null;
  if (id === "mum") return {from: c.from, to: c.to, scene: "field", at: LAWN, act: "lead", dir: -1};
  const k = c.who.indexOf(id); return k >= 0 ? {from: c.from, to: c.to, scene: "field", at: MATS[k], act: "exercise", dir: k % 2 ? -1 : 1} : null;
}

// Out-of-towners paddleboarding off the foreshore: two on weekend mornings (9 to noon), one early on weekdays (7 to 8:30)
const SUP_SEA = [[60, 190], [104, 250], [70, 330], [112, 400], [64, 560], [118, 610]];
export function shoreSlot(id, day, hm){
  if (!TOURISTS.includes(id)) return null;
  const we = [0, 6].includes(dow(day)), from = we ? 9*60 : 7*60, to = we ? 12*60 : 8*60 + 30; if (hm < from || hm >= to) return null;
  const e = eventOn(day), busy = [...(e ? e.stalls.map(s => s.id) : []), ...toursOn(day).flatMap(t => t.group)];
  return groupFor(day + ":sup", we ? 2 : 1, busy, TOURISTS).includes(id) ? {from, to, scene: "shore", wander: SUP_SEA, act: "sup", free: true} : null;
}

// Family dinners: Wednesdays and Sundays, 6:30 to 8pm, at one of the four family houses in turn (Mel's home, Ma Ma's
// cottage, Mum and Dad's, Marcus and Angellina's). Everyone sits round the big dining table: five along the back
// (Ma Ma, Gong Gong, Mum, Dad, Angellina), four along the front (Darren, Marcus, Evan, Mel).
export const DINNER_FROM = 18*60 + 30, DINNER_TO = 20*60;
export const DINNER_HOSTS = ["home", "mumdad", "cottage", "marcus"];
export const HOST_NAME = {home: "your place", mumdad: "Mum and Dad's", cottage: "Ma Ma and Gong Gong's", marcus: "Marcus and Angellina's"};
// where each house's dining table stands: cx = centre, fy = the front edge of the table on the floor
export const DINING = {home: {cx: 260, fy: 452}, mumdad: {cx: 270, fy: 500}, cottage: {cx: 320, fy: 470}, marcus: {cx: 340, fy: 470}};
const BACK = ["mama", "gonggong", "mum", "dad", "angelina"], FRONT = ["darren", "marcus", "evan", "mel"];
export function dinnerSeat(host, who){
  const t = DINING[host]; if (!t) return null;
  const b = BACK.indexOf(who), f = FRONT.indexOf(who);
  if (b >= 0) return [t.cx - 120 + b*60, t.fy - 24];
  if (f >= 0) return [t.cx - 90 + f*60, t.fy + 18];
  return null;
}
export function dinnerOn(day){
  const d = dow(day); if (d !== 3 && d !== 0) return null;
  const week = Math.floor(Date.parse(day + "T00:00:00Z")/(7*864e5));
  return {host: DINNER_HOSTS[(week*2 + (d === 0 ? 1 : 0)) % 4], from: DINNER_FROM, to: DINNER_TO};
}
export const dinnerNow = (day, hm) => { const d = dinnerOn(day); return d && hm >= d.from && hm < d.to ? d : null; };
export function dinnerSlot(id, day, hm){
  if (!BACK.includes(id) && !FRONT.includes(id)) return null;
  const d = dinnerNow(day, hm); if (!d) return null;
  return {from: d.from, to: d.to, scene: d.host, at: dinnerSeat(d.host, id), act: "sit", dir: BACK.includes(id) ? 1 : -1, dinner: true};
}

// Date night: Marcus and Angellina at the middle table of the tasting room, Tuesdays and Saturdays 7:30 to 9pm
// (Mr Okada and Hana, who usually sit there in the evenings, take those nights off)
export const DATE_DAYS = [2, 6], DATE_FROM = 19*60 + 30, DATE_TO = 21*60;
export function dateSlot(id, day, hm){
  if ((id !== "marcus" && id !== "angelina") || !DATE_DAYS.includes(dow(day)) || hm < DATE_FROM || hm >= DATE_TO) return null;
  return {from: DATE_FROM, to: DATE_TO, scene: "wineshop", at: id === "marcus" ? SEAT.c : SEAT.d, act: "sit", dir: id === "marcus" ? 1 : -1, date: true};
}

// The wine club (once the cellar door is built): the first Friday of every month, 6 to 9pm, eight members gather in
// the cellar door to taste and buy. They're picked each month from the regulars and the family.
export const CLUB_FROM = 18*60, CLUB_TO = 21*60;
const CLUB_POOL = ["hana", "okada", "juniper", "bo", "lin", "opal", "theo", "mum", "dad", "marcus", "angelina", "farid", "mei", "marco"];
const CLUB_WALK = [[200, 360], [300, 380], [380, 430], [250, 460], [420, 340], [170, 430], [330, 560], [200, 560]];
export const wineClubOn = day => { const d = new Date(day + "T00:00:00Z"); return d.getUTCDay() === 5 && d.getUTCDate() <= 7; };
export const wineClubNow = (day, hm) => wineClubOn(day) && hm >= CLUB_FROM && hm < CLUB_TO;
export const clubMembers = day => wineClubOn(day) ? groupFor(day + ":club", 8, [], CLUB_POOL) : [];
export function clubSlot(id, day, hm){
  if (!wineClubNow(day, hm) || !clubMembers(day).includes(id)) return null;
  return {from: CLUB_FROM, to: CLUB_TO, scene: "cellar", wander: CLUB_WALK, club: true};
}

// Customers at the Scoop Shack (open 10am to 8pm): a couple each hour (three at weekends, more in the afternoon),
// villagers and tourists. Each queues at the counter for a few minutes, then eats in at a table, takes it out to the
// deck, or wanders off along the foreshore with a cone. npcs.js only lets a villager come when they're free.
const SHOP_SEATS = [[87, 518], [173, 518], [227, 518], [313, 518], [367, 512], [453, 512]], DECK_FREE = [[134, 360], [172, 352], [150, 404], [190, 404]];
const QUEUE = [[256, 392], [344, 392], [300, 404]], STROLL_SHORE = [[260, 200], [240, 420], [200, 360], [262, 520], [214, 250]];
const SCOOP_POOL = [...VISITORS.filter(v => v !== "pip"), ...TOURISTS, ...NIGHT_TOURISTS, "sam", "priya", "jonah", "mia", "mum", "dad", "marcus", "angelina"];
const scoopCache = {};
export function scoopVisits(day){
  if (scoopCache[day]) return scoopCache[day];
  const d = dow(day), we = d === 0 || d === 6, out = [];
  for (let h = 10; h < 20; h++) {
    const n = (we ? 3 : 2) + (h >= 14 && h < 17 ? 1 : 0), who = groupFor(day + ":ice" + h, n, [], SCOOP_POOL);
    who.forEach((id, k) => { const from = h*60 + (hash(day + id + h) % 40), style = ["in", "deck", "walk"][hash(id + day + h) % 3];
      out.push({id, from, to: Math.min(20*60 + 15, from + 35), style, k: out.length}); });
  }
  return (scoopCache[day] = out);
}
export function scoopSlot(id, day, hm){
  const v = scoopVisits(day).find(x => x.id === id && hm >= x.from && hm < x.to); if (!v) return null;
  const base = {scene: "scoopshop", ice: true, glide: true};
  if (hm < v.from + 6) return {...base, from: v.from, to: v.from + 6, at: QUEUE[v.k % QUEUE.length], dir: 1};
  if (v.style === "in") return {...base, from: v.from + 6, to: v.to, at: SHOP_SEATS[v.k % SHOP_SEATS.length], act: "sit"};
  if (v.style === "deck") return {...base, scene: "bay", from: v.from + 6, to: v.to, at: DECK_FREE[v.k % DECK_FREE.length], act: "sit", dir: -1};
  return {...base, scene: "shore", from: v.from + 6, to: v.to, wander: STROLL_SHORE, act: "cone"};
}
