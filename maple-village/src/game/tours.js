// Orchard tours and visits. Weekends: four paid tours a day (10am, 11:30, 2pm, 4pm), each led by Farid or Mei,
// taking a small group of villagers round the orchard and then the flower farm (a different mix every
// time). Weekdays: Bo leads a tour after work on Tuesdays and Thursdays. Every day a couple of villagers also
// wander over on their own. Tours pay TOUR_FEE a person into the farm shop's tin (orchard.js), once there's something
// to show (a few things planted). All of it is worked out from the date, so every screen agrees on who's where.
// tourSlot / visitSlot return routine-style slots that win over a villager's usual routine (npcs.js slotNow).
import { hash } from "../util.js";

export const TOUR_FEE = 4;
// Round 107: friends away on a day trip (trips.js says who). Tours, Farid's stall, Hana's class and the village supper
// all work round them: someone else leads or minds it, the class is off, supper moves to another house.
let awayOf = () => [];
export const setAway = fn => { awayOf = fn; };
export const awayToday = day => awayOf(day) || [];
const WEEKEND = [[10*60, 10*60 + 45], [11*60 + 30, 12*60 + 15], [14*60, 14*60 + 45], [16*60, 16*60 + 45]];
const BO_TOUR = [17*60 + 45, 18*60 + 30], BO_DAYS = [2, 4];
const GUIDES = ["farid", "mei"];
export const VISITORS = ["hana", "okada", "juniper", "bo", "lin", "pip", "opal", "theo"];
// out-of-towners (data/npcs.js, tourist: true): they only come for tours, tastings and the farm shop
export const TOURISTS = ["aiko", "ben", "clara", "dev", "rosa", "bastien", "grace", "hiro"];   // Felix and Elena farm at Wildflower Farm now
const dow = day => new Date(day + "T00:00:00Z").getUTCDay();
export const fmtTime = m => `${Math.floor(m/60) > 12 ? Math.floor(m/60) - 12 : Math.floor(m/60)}${m % 60 ? ":" + String(m % 60).padStart(2, "0") : ""}${m >= 12*60 ? "pm" : "am"}`;

// a few villagers picked by the day and the tour (no one twice in a group)
function groupFor(seed, n, skip = [], from = VISITORS){
  const pool = from.filter(v => !skip.includes(v)), out = [];
  for (let k = 0; pool.length && out.length < n && k < 40; k++) { const v = pool[hash(seed + ":" + k) % pool.length]; if (!out.includes(v)) out.push(v); }
  return out;
}
// The day's tours: [{i, from, to, guide, group: [ids]}]
export function toursOn(day){
  const d = dow(day), out = [];
  // groups are a mix: a couple of villagers and one or two out-of-towners
  const keepers = keepersOn(day);
  const away = awayToday(day), guides = GUIDES.filter(g => !keepers.includes(g) && !away.includes(g));
  if (d === 0 || d === 6) WEEKEND.forEach(([from, to], i) => { const guide = guides[(hash(day) + i) % guides.length], t = 1 + (hash(day + "t" + i) % 2);
    out.push({i, from, to, guide, group: [...groupFor(day + ":" + i, 3 + (hash(day + "n" + i) % 2) - t), ...groupFor(day + ":t" + i, t, keepers, TOURISTS)]}); });
  else if (BO_DAYS.includes(d)) out.push({i: 0, from: BO_TOUR[0], to: BO_TOUR[1], guide: away.includes("bo") ? "farid" : "bo", group: [...groupFor(day + ":d", 2), ...groupFor(day + ":dt", 1, [], TOURISTS)]});
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
// (and on weekend mornings), and Farid and Mei strolling round the lake on Friday afternoons and Sunday mornings.
const PICNIC = [[106, 468], [138, 464]], LAKESIDE = [[196, 384], [236, 388], [272, 380]], PITCH = [[96, 560], [150, 548], [204, 566], [130, 574]], STROLL = [[60, 330], [100, 380], [300, 380], [70, 250]];
export function fieldVisits(day){
  const d = dow(day), we = d === 0 || d === 6, busy = [...toursOn(day).flatMap(t => [t.guide, ...t.group]), ...visitsOn(day).map(v => v.id)];
  const pool = seed => groupFor(day + seed, 2, [...busy, "pip"]);
  const [p1, p2] = pool("pic"), [s1] = groupFor(day + "swan", 1, [...busy, "pip", p1, p2]);
  const out = [{id: p1, from: 12*60, to: 13*60 + 30, at: PICNIC[0], act: "sit"}, {id: p2, from: 12*60, to: 13*60 + 30, at: PICNIC[1], act: "sit"},
    {id: s1, from: 17*60 + 30, to: 18*60 + 30, wander: LAKESIDE}];
  if (we) out.push({id: "pip", from: 10*60, to: 11*60 + 30, wander: PITCH}, {id: "pip", from: 15*60, to: 16*60 + 30, wander: PITCH});
  else out.push({id: "pip", from: 15*60 + 30, to: 16*60 + 30, wander: PITCH});
  if (d === 5) out.push({id: "farid", from: 16*60, to: 17*60 + 30, wander: STROLL}, {id: "mei", from: 16*60, to: 17*60 + 30, wander: STROLL});
  if (d === 0) out.push({id: "farid", from: 8*60, to: 9*60 + 30, wander: STROLL}, {id: "mei", from: 8*60, to: 9*60 + 30, wander: STROLL});
  return out;
}
export function fieldSlot(id, day, hm){
  const v = fieldVisits(day).find(x => x.id === id && hm >= x.from && hm < x.to);
  return v ? Object.assign({from: v.from, to: v.to, scene: "field"}, v.at ? {at: v.at} : {wander: v.wander}, v.act ? {act: v.act} : {}) : null;
}

// Extra tasting-room regulars at the wine shop (on top of everyone's usual evening seat in npcs.js): afternoon drop-ins,
// the vineyard and orchard hands after work, Farid and Mei on Saturday afternoons, Bo on Friday nights.
// Seats are the chairs round the tasting room's three tables; nobody shares a chair at the same time.
const SEAT = {a: [87, 518], b: [173, 518], c: [227, 518], d: [313, 518], e: [367, 512], f: [453, 512]};
const TASTINGS = [
  {id: "lin", from: 14*60, to: 15*60 + 30, at: SEAT.c},
  {id: "okada", from: 15*60, to: 16*60, at: SEAT.e, days: "wd"},
  {id: "juniper", from: 15*60, to: 16*60 + 30, at: SEAT.e, days: "we"},
  {id: "hana", from: 15*60 + 30, to: 16*60 + 30, at: SEAT.d, dow: [1, 3, 5]},
  {id: "bo", from: 14*60, to: 15*60, at: SEAT.d, days: "we"},
  {id: "farid", from: 16*60 + 30, to: 17*60 + 30, at: SEAT.a, dow: [6]},
  {id: "mei", from: 16*60 + 30, to: 17*60 + 30, at: SEAT.b, dow: [6]},
  // after work: the vineyard hands first, then the orchard's farmhands
  {id: "ines", from: 17*60 + 30, to: 18*60 + 30, at: SEAT.a},
  {id: "marco", from: 18*60, to: 19*60, at: SEAT.b},
  {id: "farid", from: 18*60 + 45, to: 20*60 + 15, at: SEAT.a},
  {id: "mei", from: 19*60, to: 20*60 + 30, at: SEAT.b},
  {id: "bo", from: 20*60, to: 21*60 + 30, at: SEAT.e, dow: [5]},
  // round 112: Friday aperitivo hour (4:30 to 7): the end of the week, and the tasting room fills up
  {id: "lin", from: 16*60 + 30, to: 18*60, at: SEAT.c, dow: [5]}, {id: "opal", from: 16*60 + 30, to: 18*60 + 30, at: SEAT.d, dow: [5]},
  {id: "theo", from: 16*60 + 45, to: 19*60, at: SEAT.f, dow: [5]}, {id: "bo", from: 17*60, to: 19*60, at: SEAT.e, dow: [5]}, {id: "juniper", from: 18*60, to: 19*60, at: SEAT.c, dow: [5]}
];
// Out-of-towners at the tasting tables, in the gaps between the regulars: a pair at lunchtime, a pair late afternoon,
// a pair late evening, and an extra pair late morning at weekends (a different pair each time, from whoever isn't touring)
const TOURIST_SEATS = [[12*60, 13*60, [SEAT.d, SEAT.e]], [13*60, 14*60, [SEAT.a, SEAT.b]], [14*60 + 30, 15*60 + 30, [SEAT.a, SEAT.b]], [16*60, 17*60, [SEAT.c, SEAT.f]],
  [17*60, 17*60 + 45, [SEAT.d, SEAT.e]], [20*60 + 30, 21*60 + 45, [SEAT.b, SEAT.f]]];
const WEEKEND_SEATS = [[11*60, 12*60, [SEAT.d, SEAT.e]], [16*60 + 30, 17*60 + 30, [SEAT.d, SEAT.e]]];
// round 130: the shop opens at 10, and every morning a pair come in to browse the shelves before lunch (standing, not
// at the tasting tables: it's a bit early for a glass)
const BROWSE_SEATS = [[10*60, 11*60 + 15, [[106, 300], [164, 312]], "browse"], [11*60 + 15, 12*60, [[126, 306], [76, 316]], "browse"]];
export function touristTastings(day){
  const d = dow(day), busy = toursOn(day).flatMap(t => t.group), out = [];
  const stallKeepers = keepersOn(day);
  [...TOURIST_SEATS, ...(d === 0 || d === 6 ? WEEKEND_SEATS : []), ...BROWSE_SEATS].forEach(([from, to, seats, act], k) =>
    groupFor(day + "tt" + k, 2, [...busy, ...stallKeepers], act ? [...TOURISTS, ...NIGHT_TOURISTS] : TOURISTS).forEach((id, j) => out.push({id, from, to, at: seats[j], act})));   // (the morning browsers can be night-market folk too: on Sundays every day tourist's busy)
  return out;
}
export function tastingSlot(id, day, hm){
  const d = dow(day), we = d === 0 || d === 6;
  const v = [...TASTINGS, ...touristTastings(day)].find(x => x.id === id && hm >= x.from && hm < x.to && (!x.days || (x.days === "we") === we) && (!x.dow || x.dow.includes(d)));
  return v ? {from: v.from, to: v.to, scene: "wineshop", at: v.at, act: v.act === "browse" ? null : "sit"} : null;
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
    const ev = eventsOn(day).find(e => e.kind !== "xmas"); if (ev) { out.splice(0, out.length); add(fam(0), ev.from, ev.from + 120, "field"); add(fam(1), ev.from + 60, ev.from + 180, "field");
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
// from the shop's own shelves) and so does Farid (fruit and flowers from the orchard's farm shop stock).
// at: which of the six stall places along the top it stands in
// (place 8 isn't on the top row: it's the Scoop Shack's cart on the grass between the path and the river)
export const STALL_SPOTS = [[36, 128], [96, 128], [156, 128], [216, 128], [276, 128], [336, 128], [396, 128], [456, 128], [306, 520], [196, 520]];
// produce: the stall sells whatever vegetables and berries are in season (core.js works out which)
export const MARKET = [{id: "elena", at: 0, short: "Cheese", n: "Cheese and olives", items: ["cheese", "olives"], col: "#F3C969", line: "Aged on a farm up the hill. Try a slice!"},
  {id: "felix", at: 1, short: "Honey", n: "Honey and bee things", items: ["honey", "honeycomb", "beecandle", "toast"], col: "#E3A23A", line: "Wildflower honey, from my own bees. The candles are pure beeswax."},
  {id: "clara", at: 2, short: "Produce", n: "Fresh produce", items: [], produce: true, col: "#9CC27E", line: "Picked yesterday, whatever's in season. Have a look!"},
  {id: "ines", at: 3, kind: "wine", short: "Our wines", n: "Our wine stall", items: [], col: "#8E2C48", line: "Tastings and bottles, straight from the shop's shelves."},
  {id: "farid", at: 4, kind: "orchard", short: "Orchard", n: "Farid's fruit and flowers", items: [], col: "#E8566C", line: "Fresh from the orchard this morning. Do have a taste!"},
  {id: "grace", at: 5, short: "Soap", n: "Handmade soap", items: ["soap_lav", "soap_rose", "soap_duck", "scrub", "crown"], col: "#C9A3E0", line: "All made by hand, in small batches. Gran taught me. Smell the lavender!"},
  {id: "ben", at: 6, short: "Craft beer", n: "Craft beer", items: ["paleale", "stout"], col: "#D9A441", line: "Brewed in my shed. Well, the shed's quite big."},
  {id: "dev", at: 7, short: "Bakery", n: "Bakery", items: ["kaya", "currypuff", "flour"], col: "#C98A4A", line: "Still warm! Kaya buns and curry puffs."},
  // Noor's pet adoption corner, on the grass by the river (place 8): a little pen of animals looking for homes
  {id: "noor", at: 8, kind: "pets", short: "Adopt a pet", n: "Pet adoption corner", items: ["pet_kitten"], col: "#9FD3C2", line: "Every one of them needs a home. Who'll look after them?"},
  // the Cocoa Room's chocolate cart, once it's bought (cocoa.js upgrade "cart"), beside Noor's pen where the Scoop
  // Shack's cart stands on night market evenings. Mateo minds it
  {id: "mateo", at: 9, kind: "cocoa", needs: "cc_cart", short: "Cocoa Room", n: "The Cocoa Room cart", items: [], col: "#8A5A3A", line: "Chocolate from the Cocoa Room! Bars, bonbons, hot chocolate."}];
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
  // your own: the Scoop Shack's cart, scooping from the shop's display (scoop.js cartOn). Tomo minds it after his day on the deck
  {id: "tomo", at: 8, kind: "scoop", short: "Scoop Shack", n: "The Scoop Shack cart", items: [], col: "#F2A0B8", line: "Gelato from the Scoop Shack! Cup or cone?"}];
// stalls that only stand once you've bought them (needs): core.js tells us what's owned
let ownedNow = () => ({});
export const setStallOwned = fn => { ownedNow = fn; };
const standing = (list, day) => { const o = ownedNow(), away = awayToday(day);
  return list.filter(s => !s.needs || o[s.needs]).map(s => s.id === "farid" && away.includes("farid") ? {...s, id: "mei", line: "Farid's away for the day, so I'm minding his stall. Same fruit, same prices."}
    : s.kind === "mine" && o.millshop ? {...s, id: "hazel", line: "I'm minding your stall. Everything here, you made."} : s); };   // round 173: with the Mill Shop open, Hazel minds your Christmas stall
export const NIGHT_TOURISTS = ["noa", "jun", "bea", "omar", "lucy", "tae", "ivy", "rafe"];
export const STAGE = {x: 452, y: 462}, STAGE_WATCH = [[404, 560], [446, 566], [492, 536], [508, 562], [426, 590]];
function lastSaturday(day){ const dt = new Date(day + "T00:00:00Z"); if (dt.getUTCDay() !== 6) return false; const n = new Date(dt.getTime() + 7*864e5); return n.getUTCMonth() !== dt.getUTCMonth(); }
// Round 172 ("let's do Christmas markets and gift hampers"): the Christmas market, every evening 5 to 9 from 20
// November to Christmas Eve. On those days it takes the place of the night market and the fair; the Sunday morning
// farmers market carries on. Wooden stalls under garlands, the big tree on the football pitch, up all season (lit at half past five;
// the first night the whole village counts it down), lanterns along the paths.
// at: 0-7 along the top as ever; your own stall is place 2. kind: "mine" (yours: game/xmas.js), "mulled" (cups from
// your pot, Celeste ladling), "cocoa" (the Cocoa Room's cart, once it's yours), the rest are ordinary stalls (treats:
// eaten on the spot, game/xmas.js)
export const xmasOn = day => { const md = day.slice(5); return md >= "11-20" && md <= "12-24"; };
export const XMAS_FROM = 17*60, XMAS_TO = 21*60, XMAS_LIT = 17*60 + 30, XMAS_TREE = [184, 600];
export const XMAS = [{id: "farid", at: 0, short: "Wreaths", n: "Farid's wreaths and winter flowers", items: ["xm_wreath", "xm_bouquet", "xm_mistletoe"], col: "#4F7A4A", line: "Holly from the orchard hedge, ivy from the back fence. I make every one by hand!"},
  {id: "hana", at: 1, short: "Gingerbread", n: "Hana's gingerbread and ornaments", items: ["xm_ginger", "xm_bauble", "xm_star", "xm_angel"], col: "#C8432F", line: "Gingerbread people, iced this afternoon. And ornaments for your tree!"},
  {id: "mel", at: 2, kind: "mine", short: "Your stall", n: "Your stall", items: [], col: "#8E2C48", line: ""},
  {id: "celeste", at: 3, kind: "mulled", short: "Mulled wine", n: "Mulled wine", items: [], col: "#7A1F3D", line: "Mind, it's hot! Cinnamon on top?"},
  {id: "hiro", at: 4, short: "Wooden toys", n: "Wooden toys", items: ["xm_train", "xm_horse", "xm_yoyo", "xm_ark"], col: "#7FB8E8", line: "Every one carved and painted in my workshop. No batteries, ever."},
  {id: "dev", at: 5, short: "Chestnuts", n: "Roast chestnuts", items: [], treats: ["xm_chestnut"], col: "#8A5A3A", line: "Hot chestnuts! Mind your fingers, they're straight off the coals."},
  {id: "sofia", at: 6, short: "Hot chocolate", n: "The Scoop Shack's hot chocolate", items: [], treats: ["xm_hotchoc", "xm_hotchoc_m"], col: "#F2A0B8", line: "The Scoop Shack's winter stand! Marshmallows on top?"},
  {id: "mateo", at: 7, kind: "cocoa", needs: "cocoa", short: "Cocoa Room", n: "The Cocoa Room's Christmas stall", items: [], col: "#8A5A3A", line: "Gift boxes for Christmas! Bonbons and bars, all from the Cocoa Room."}].map(st => ({...st, xmas: true}));
// every event on the field that day, in time order: [{kind, name, from, to, stalls}]
export function eventsOn(day){
  const out = [], x = xmasOn(day);
  if (dow(day) === 0) out.push({kind: "market", name: "Sunday farmers market", from: 8*60, to: 13*60, stalls: standing(MARKET, day), wine: true});
  if (!x && lastSaturday(day)) out.push({kind: "fair", name: "Field fair", from: 10*60, to: 16*60, stalls: FAIR, wine: false});
  if (!x && (dow(day) === 2 || dow(day) === 4)) out.push({kind: "night", name: "Night market", from: 17*60 + 30, to: 22*60, stalls: NIGHT, wine: false});
  if (x) out.push({kind: "xmas", name: "Christmas market", from: XMAS_FROM, to: XMAS_TO, stalls: standing(XMAS, day), wine: false});
  return out;
}
// the event at the field at a given time (or, without one, the day's first); everyone who keeps a stall that day
export function eventOn(day, hm){ const l = eventsOn(day); return hm == null ? l[0] || null : l.find(e => hm >= e.from && hm < e.to) || null; }
export const keepersOn = day => eventsOn(day).flatMap(e => e.stalls.map(s => s.id));
export const eventNow = (day, hm) => eventOn(day, hm);
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
  const e = eventOn(day, hm); if (!e || hm < e.from || hm >= e.to) return null;
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
// round 172: the first night of the Christmas market, everyone gathers round the tree from 5:15 for the lighting
const TREE_RING = [[112, 570], [118, 604], [92, 546], [72, 588], [134, 636], [52, 618], [300, 560], [300, 600], [96, 630], [316, 630]];
const LIGHTERS = ["hana", "theo", "farid", "mei", "bo", "tomi", "posy", "okada", "juniper", "lin", "pip", "opal"];
// round 174: carols by the tree on Friday evenings at 7, Santa's grotto on weekend evenings, and on Christmas Eve a
// lantern walk round the field to close the market
export const CAROLS = [19*60, 19*60 + 40], GROTTO = [17*60, 20*60], GROTTO_AT = [64, 548], LANTERN_WALK = [20*60 + 15, 21*60];
export const carolsNow = (day, hm) => xmasOn(day) && dow(day) === 5 && hm >= CAROLS[0] && hm < CAROLS[1];
export const grottoOn = day => xmasOn(day) && (dow(day) === 0 || dow(day) === 6);
export const grottoNow = (day, hm) => grottoOn(day) && hm >= GROTTO[0] && hm < GROTTO[1];
export const lanternWalkNow = (day, hm) => day.slice(5) === "12-24" && hm >= LANTERN_WALK[0] && hm < LANTERN_WALK[1];
const WALK_ROUTE = [[278, 600], [242, 540], [278, 470], [242, 414], [176, 404], [104, 380], [62, 340], [112, 206], [180, 202], [302, 202], [440, 202]];
function lightingSlot(id, e, day, hm){
  if (e.kind === "xmas" && carolsNow(day, hm)) { const k = LIGHTERS.filter(x => !e.stalls.some(s => s.id === x)).indexOf(id); if (k >= 0 && k < TREE_RING.length) return {from: CAROLS[0], to: CAROLS[1], scene: "field", at: TREE_RING[k], dir: TREE_RING[k][0] < XMAS_TREE[0] ? 1 : -1, act: "carol"}; }
  if (e.kind === "xmas" && lanternWalkNow(day, hm)) { const k = [...LIGHTERS, ...NIGHT_TOURISTS].indexOf(id); if (k >= 0) return {from: LANTERN_WALK[0], to: LANTERN_WALK[1], scene: "field", wander: WALK_ROUTE, act: "lantern"}; }
  if (e.kind !== "xmas" || day.slice(5) !== "11-20" || hm < XMAS_FROM + 15 || hm >= XMAS_LIT + 10) return null;
  const k = LIGHTERS.filter(x => !e.stalls.some(s => s.id === x)).indexOf(id); if (k < 0 || k >= TREE_RING.length) return null;
  return {from: XMAS_FROM + 15, to: XMAS_LIT + 10, scene: "field", at: TREE_RING[k], dir: TREE_RING[k][0] < XMAS_TREE[0] ? 1 : -1};
}
export function eventSlot(id, day, hm){
  const e = eventOn(day, hm); if (!e || hm < e.from || hm >= e.to) return null;
  const st = e.stalls.find(s => s.id === id);
  if (st) return keeperSlot(st, e, day, hm);
  { const g = lightingSlot(id, e, day, hm); if (g) return g; }
  { const f = familyAtEvent(id, e, day, hm); if (f) return f; }
  if (e.kind === "night" || e.kind === "xmas") return nightShopper(id, e, day, hm);
  const mid = e.from + Math.round((e.to - e.from)/2), wave = hm < mid ? 0 : 1, half = Math.round((wave ? e.to - mid : mid - e.from)/2), start = wave ? mid : e.from;
  const crowd = groupFor(day + "ev" + wave, 4, ["pip", ...e.stalls.map(s => s.id), ...toursOn(day).flatMap(t => [t.guide, ...t.group])], [...VISITORS, ...TOURISTS, "sam", "priya"]);
  const k = crowd.indexOf(id);
  if (k >= 2 && hm >= start + half) return {from: start + half, to: wave ? e.to : mid, scene: "field", at: PICNICKERS[wave ? k : k - 2], act: "sit"};
  if (k >= 0 || id === "pip") return {from: start, to: wave ? e.to : mid, scene: "field", wander: id === "pip" ? FIELD_PLAY : FIELD_WALK};
  return null;
}
// Round 104: your friends go to the night market and the fair too (the Sunday market they already do in their routines).
// Night market: Tuesdays Tomi and Posy, and Farid and Mei early for a look round; Thursdays Hana and Theo,
// and Bo for an hour. The fair: everyone, in turns through the day.
const FAMILY_EVENTS = {
  night: {2: [["farid", 17*60 + 45, 19*60], ["mei", 17*60 + 45, 19*60], ["tomi", 18*60 + 30, 20*60 + 30], ["posy", 18*60 + 30, 20*60 + 30]],
    4: [["hana", 18*60, 20*60], ["theo", 18*60, 20*60], ["bo", 19*60, 20*60 + 30]]},
  // round 172: the Christmas market, a few of your friends most evenings (not the supper nights, Wednesday and Sunday,
  // when they're round the table by 6:30)
  xmas: {1: [["hana", 17*60 + 15, 18*60 + 45], ["theo", 17*60 + 15, 18*60 + 45]], 2: [["tomi", 18*60, 20*60], ["posy", 18*60, 20*60]],
    3: [["bo", 17*60, 18*60 + 15]], 4: [["farid", 17*60 + 15, 18*60 + 30], ["mei", 17*60 + 15, 18*60 + 30]], 5: [["bo", 18*60 + 30, 20*60 + 30], ["hana", 18*60 + 30, 20*60], ["theo", 18*60 + 30, 20*60]],
    6: [["farid", 17*60, 19*60], ["mei", 17*60, 19*60], ["tomi", 18*60, 20*60 + 30], ["posy", 18*60, 20*60 + 30], ["bo", 18*60 + 30, 20*60 + 30]], 0: [["bo", 17*60, 18*60 + 15]]},
  fair: [["hana", 10*60, 12*60], ["theo", 10*60, 12*60], ["farid", 11*60, 13*60], ["mei", 11*60, 13*60], ["bo", 13*60, 15*60], ["tomi", 13*60, 15*60 + 30], ["posy", 13*60, 15*60 + 30]]
};
export function familyAtEvent(id, e, day, hm){
  const list = e.kind === "night" || e.kind === "xmas" ? (FAMILY_EVENTS[e.kind][dow(day)] || []) : e.kind === "fair" ? FAMILY_EVENTS.fair : [];
  const f = list.find(([who, from, to]) => who === id && hm >= from && hm < to); if (!f) return null;
  return {from: f[1], to: f[2], scene: "field", wander: FIELD_WALK};
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

// Hana's exercise class on the exercise lawn at the field (east of the river), 8 to 9am Monday to Saturday: Pilates on
// Mondays and Wednesdays, Zumba on Tuesdays and Thursdays, Piloxing on Fridays and Saturdays. Three villagers join
// her each morning (you can join too: tap the lawn). Not on market Sundays.
export const CLASS_FROM = 8*60, CLASS_TO = 9*60, LAWN = [452, 404];
const CLASS_KIND = {1: "Pilates", 2: "Zumba", 3: "Pilates", 4: "Zumba", 5: "Piloxing", 6: "Piloxing"};
const MATS = [[418, 444], [456, 452], [494, 444], [436, 480]];
const CLASS_POOL = ["lin", "okada", "juniper", "opal", "bo", "posy", "priya"];
export const classOn = day => CLASS_KIND[dow(day)] && !awayToday(day).includes("hana") ? {kind: CLASS_KIND[dow(day)], from: CLASS_FROM, to: CLASS_TO,
  who: groupFor(day + ":class", 3, [], CLASS_POOL)} : null;
export function classSlot(id, day, hm){
  const c = classOn(day); if (!c || hm < c.from || hm >= c.to) return null;
  if (id === "hana") return {from: c.from, to: c.to, scene: "field", at: LAWN, act: "lead", dir: -1};
  const k = c.who.indexOf(id); return k >= 0 ? {from: c.from, to: c.to, scene: "field", at: MATS[k], act: "exercise", dir: k % 2 ? -1 : 1} : null;
}

// Out-of-towners paddleboarding off the foreshore: two on weekend mornings (9 to noon), one early on weekdays (7 to 8:30)
const SUP_SEA = [[60, 190], [104, 250], [70, 330], [112, 400], [64, 560], [118, 610]];
export function shoreSlot(id, day, hm){
  if (!TOURISTS.includes(id)) return null;
  const we = [0, 6].includes(dow(day)), from = we ? 9*60 : 7*60, to = we ? 12*60 : 8*60 + 30; if (hm < from || hm >= to) return null;
  const busy = [...keepersOn(day), ...toursOn(day).flatMap(t => t.group)];
  return groupFor(day + ":sup", we ? 2 : 1, busy, TOURISTS).includes(id) ? {from, to, scene: "shore", wander: SUP_SEA, act: "sup", free: true} : null;
}

// The village supper: Wednesdays and Sundays, 6:30 to 8pm, at one of four houses in turn (your place, Farid and Mei's
// cottage, Hana and Theo's, Tomi and Posy's). Everyone sits round the big dining table: five along the back
// (Farid, Mei, Hana, Theo, Posy), three along the front (Bo, Tomi, you).
export const DINNER_FROM = 18*60 + 30, DINNER_TO = 20*60;
export const DINNER_HOSTS = ["home", "hanatheo", "cottage", "tomiposy"];
const HOST_FAMILY = {hanatheo: ["hana", "theo"], cottage: ["farid", "mei"], tomiposy: ["tomi", "posy"]};
// Round 112: Friday evenings. Aperitivo hour at the wine shop (4:30 to 7), the fishmonger's van at the bay (5 to 10)
// and the bonfire (7 to 10) at the firepit at home, with your friends round it.
export const APERITIVO = [16*60 + 30, 19*60], VAN = [17*60, 22*60], BONFIRE = [19*60, 22*60];
const isFri = day => dow(day) === 5;
export const aperitivoNow = (day, hm) => isFri(day) && hm >= APERITIVO[0] && hm < APERITIVO[1];
export const vanNow = (day, hm) => isFri(day) && hm >= VAN[0] && hm < VAN[1];
export const bonfireNow = (day, hm) => isFri(day) && hm >= BONFIRE[0] && hm < BONFIRE[1];
// the bonfire is the firepit at home (base scene, bottom of the garden)
export const FIRE = [276, 608];
// round the fire: along the back and the sides (nobody in front of the flames); Tomi and Posy on the bench
const LOGS = {theo: [[224, 612], 1], hana: [[242, 584], 1], farid: [[276, 572], 1], mei: [[310, 584], -1], tomi: [[340, 604], -1], posy: [[364, 604], -1]};
const BONFIRE_FAMILY = {theo: 19*60, hana: 19*60, mei: 19*60, farid: 19*60, tomi: 19*60 + 30, posy: 19*60 + 30};
// Round 113: movie night on the field, the last Friday of the month, 7:30 to 9:30 (everyone's on the blankets
// instead of round the bonfire that night); and a little Friday market on the field, 4:30 to 7:15 (a quarter of an hour before the film): three stalls with a
// different mix every week, and Hiro selling kites on the beach.
export const MOVIE = [19*60 + 30, 21*60 + 30], BAYMKT = [16*60 + 30, 19*60 + 15];   // the market packs up a quarter of an hour before the film
export const lastFriday = day => { const dt = new Date(day + "T00:00:00Z"); return dt.getUTCDay() === 5 && new Date(dt.getTime() + 7*864e5).getUTCMonth() !== dt.getUTCMonth(); };
export const movieNow = (day, hm) => lastFriday(day) && !xmasOn(day) && hm >= MOVIE[0] && hm < MOVIE[1];   // (not in the Christmas market's season: its stalls have the top of the field)
export const SCREEN = [236, 128];   // the screen stands where the Sunday market's stalls go, along the top of the field
// spread out over the field, not bunched at the screen: two on the blanket by the screen, two at the picnic
// spot, and two strolling round the exercise lawn
const BLANKET = {hana: [222, 210], theo: [252, 212], farid: [92, 502], mei: [178, 504]};
const LAWN_STROLL = [[410, 470], [450, 505], [480, 465], [430, 530], [470, 525]], STROLLERS = ["tomi", "posy"];
export function movieSlot(id, day, hm){
  if (!movieNow(day, hm) || awayToday(day).includes(id)) return null;
  if (STROLLERS.includes(id)) return {from: MOVIE[0], to: MOVIE[1], scene: "field", wander: LAWN_STROLL, movie: true};
  if (!BLANKET[id]) return null;
  return {from: MOVIE[0], to: MOVIE[1], scene: "field", at: BLANKET[id], act: "sit", dir: id === "mei" ? -1 : 1, movie: true};
}
export const bayMarketNow = (day, hm) => dow(day) === 5 && !xmasOn(day) && hm >= BAYMKT[0] && hm < BAYMKT[1];
// (the "bay market" lives on the field now, where the Sunday market stands, so the bay stays calm)
export const BAY_STALLS = [[156, 128], [236, 128], [316, 128]], KITE_SELLER = [396, 150];
export const bayKeepers = day => groupFor(day + ":baymkt", 3, [], NIGHT_TOURISTS);
export function bayMarketSlot(id, day, hm){
  if (!bayMarketNow(day, hm)) return null;
  if (id === "hiro") return {from: BAYMKT[0], to: BAYMKT[1], scene: "field", at: KITE_SELLER, dir: -1, act: "kites"};
  const k = bayKeepers(day).indexOf(id); if (k < 0) return null;
  const [x, y] = BAY_STALLS[k]; return {from: BAYMKT[0], to: BAYMKT[1], scene: "field", at: [x + 3, y - 9], dir: 1};
}
export function bonfireSlot(id, day, hm){
  if (!bonfireNow(day, hm) || awayToday(day).includes(id)) return null;
  const from = BONFIRE_FAMILY[id]; if (from == null || hm < from) return null;
  const [at, dir] = LOGS[id]; return {from, to: BONFIRE[1], scene: "base", at, act: id === "theo" ? "guitar" : "sit", dir, bonfire: true};
}
export const HOST_NAME = {home: "your place", hanatheo: "Hana and Theo's", cottage: "Farid and Mei's", tomiposy: "Tomi and Posy's"};
// where each house's dining table stands: cx = centre, fy = the front edge of the table on the floor
export const DINING = {home: {cx: 260, fy: 452}, hanatheo: {cx: 270, fy: 500}, cottage: {cx: 320, fy: 470}, tomiposy: {cx: 340, fy: 470}};
const BACK = ["farid", "mei", "hana", "theo", "posy"], FRONT = ["bo", "tomi", "mel"];
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
  const away = awayToday(day), k = (week*2 + (d === 0 ? 1 : 0)) % 4;
  // the hosts are off on a trip: supper moves to the next house along (your place is always there to fall back on)
  const host = [0, 1, 2, 3].map(i => DINNER_HOSTS[(k + i) % 4]).find(h => !(HOST_FAMILY[h] || []).every(id => away.includes(id)) || h === "home");
  return {host, from: DINNER_FROM, to: DINNER_TO};
}
export const dinnerNow = (day, hm) => { const d = dinnerOn(day); return d && hm >= d.from && hm < d.to ? d : null; };
export function dinnerSlot(id, day, hm){
  if (!BACK.includes(id) && !FRONT.includes(id)) return null;
  const d = dinnerNow(day, hm); if (!d) return null;
  return {from: d.from, to: d.to, scene: d.host, at: dinnerSeat(d.host, id), act: "sit", dir: BACK.includes(id) ? 1 : -1, dinner: true};
}

// Date night: Tomi and Posy at the middle table of the tasting room, Tuesdays and Saturdays 7:30 to 9pm
// (Mr Okada and Hana, who usually sit there in the evenings, take those nights off)
export const DATE_DAYS = [2, 6], DATE_FROM = 19*60 + 30, DATE_TO = 21*60;
export function dateSlot(id, day, hm){
  if ((id !== "tomi" && id !== "posy") || !DATE_DAYS.includes(dow(day)) || hm < DATE_FROM || hm >= DATE_TO) return null;
  return {from: DATE_FROM, to: DATE_TO, scene: "wineshop", at: id === "tomi" ? SEAT.c : SEAT.d, act: "sit", dir: id === "tomi" ? 1 : -1, date: true};
}

// The wine club (once the cellar door is built): the first Friday of every month, 6 to 9pm, eight members gather in
// the cellar door to taste and buy. They're picked each month from the regulars and your friends.
export const CLUB_FROM = 18*60, CLUB_TO = 21*60;
const CLUB_POOL = ["hana", "okada", "juniper", "bo", "lin", "opal", "theo", "tomi", "posy", "farid", "mei", "marco"];
const CLUB_WALK = [[200, 360], [300, 380], [380, 430], [250, 460], [420, 340], [170, 430], [330, 560], [200, 560]];
export const wineClubOn = day => { const d = new Date(day + "T00:00:00Z"); return d.getUTCDay() === 5 && d.getUTCDate() <= 7; };
export const wineClubNow = (day, hm) => wineClubOn(day) && hm >= CLUB_FROM && hm < CLUB_TO;
export const clubMembers = day => wineClubOn(day) ? groupFor(day + ":club", 8, [], CLUB_POOL) : [];
// The Cocoa Room's Saturday bonbon workshop (cocoa.js upgrade "workshop"), 2 to 4: six villagers and visitors at the
// shop's tables, making their own bonbons
export const WS_FROM = 14*60, WS_TO = 16*60, WS_SEATS = [[87, 518], [173, 518], [227, 518], [313, 518], [367, 512], [453, 512]];
export const workshopGroup = day => new Date(day + "T00:00:00Z").getUTCDay() === 6 && ownedNow().cc_workshop ? groupFor(day + ":workshop", 6, [], [...VISITORS.filter(v => v !== "pip"), ...TOURISTS]) : [];
export function workshopSlot(id, day, hm){
  if (hm < WS_FROM || hm >= WS_TO) return null; const i = workshopGroup(day).indexOf(id); if (i < 0) return null;
  return {from: WS_FROM, to: WS_TO, scene: "cocoa", at: WS_SEATS[i], act: "sit", dir: i % 2 ? -1 : 1, workshop: true};
}
// Honeybrook station (game/rail.js): today's tour-goers step off the 9:15 and wander down the lane to the station
// road; on night market days the crowd comes in on the 5:05 and waits for the 10:30 home. And the holiday lets on the
// lane (Bluebell and Fig Tree) each have two guests for the week, out on the porch in the mornings and evenings.
const LANE_WALK = [[330, 176], [236, 300], [232, 440], [236, 540], [280, 600]], PLATFORM_WAIT = [[300, 178], [350, 180], [380, 184], [270, 186], [400, 182]];
const nightDay = day => [2, 4].includes(dow(day));
export function trainSlot(id, day, hm){
  if (hm >= 9*60 + 15 && hm < 9*60 + 27 && toursOn(day).flatMap(t => t.group).filter(g => TOURISTS.includes(g)).includes(id)) return {from: 9*60 + 15, to: 9*60 + 27, scene: "hlane", wander: LANE_WALK};
  if (nightDay(day) && NIGHT_TOURISTS.includes(id)) {
    if (hm >= 17*60 + 5 && hm < 17*60 + 25) return {from: 17*60 + 5, to: 17*60 + 25, scene: "hlane", wander: LANE_WALK};
    const i = NIGHT_TOURISTS.indexOf(id); if (hm >= 22*60 + 8 && hm < 22*60 + 31 && i < PLATFORM_WAIT.length) return {from: 22*60 + 8, to: 22*60 + 31, scene: "hlane", at: PLATFORM_WAIT[i]};
  }
  return null;
}
const weekOf = day => { const t = Date.parse(day + "T00:00:00Z"); return new Date(t - ((dow(day) + 6) % 7)*864e5).toISOString().slice(0, 10); };
export const letGuests = day => { const g = groupFor(weekOf(day) + ":lets", 4, [], TOURISTS); return [g.slice(0, 2), g.slice(2, 4)]; };
const LET_SEATS = [[[300, 292], [376, 292]], [[300, 466], [376, 466]]];
export function letSlot(id, day, hm){
  const lets = letGuests(day), c = lets.findIndex(g => g.includes(id)); if (c < 0) return null;
  const k = lets[c].indexOf(id), at = LET_SEATS[c][k];
  if (hm >= 7*60 + 30 && hm < 9*60) return {from: 7*60 + 30, to: 9*60, scene: "hlane", at, act: "sit", dir: k ? -1 : 1};
  if (hm >= 18*60 && hm < 21*60 + 30) return {from: 18*60, to: 21*60 + 30, scene: "hlane", at, act: "sit", dir: k ? -1 : 1};
  // round 103: holidaymakers explore Honeybrook Woods: one rides a hire bike round the trails, the other walks up to the lookout
  if (k === 0 && hm >= 10*60 && hm < 12*60) return {from: 10*60, to: 12*60, scene: "hwoods", wander: [[60, 330], [300, 300], [330, 600], [330, 420]], look: {bike: true}};
  if (k === 1 && hm >= 14*60 && hm < 15*60 + 30) return {from: 14*60, to: 15*60 + 30, scene: "hwoods", wander: [[200, 318], [330, 420], [440, 510], [300, 300]]};
  return null;
}
// Disco night (round 140): every Saturday once the cellar door is built, 8 to 11:30pm. The disco ball comes out,
// the lights flash, the music's on, and the floor's packed: most of the village (not Mr Okada or Lin,
// who'd rather be in bed, nor whoever's working) and a handful of tourists, all dancing. Wine sells much faster.
export const DISCO_FROM = 20*60, DISCO_TO = 23*60 + 30;
export const discoOn = day => dow(day) === 6, discoNow = (day, hm) => discoOn(day) && hm >= DISCO_FROM && hm < DISCO_TO;
const DISCO_POOL = ["hana", "juniper", "bo", "opal", "theo", "marco", "ines", "farid", "mei", "felix", "elena", "amara", "mateo", "lila", "noor", "wren", "sofia", "tomo", "tomi", "posy"];
// Not a grid ("they should be mingling"): little knots of two or three round the floor, couples together facing
// each other (Hana and Theo; Tomi and Posy once their date night's over at 9), each with their own move. About
// half drift between their knot and the next one now and then; the rest stay put and dance.
export const DISCO_MOVES = ["dance", "boogie", "armsup", "twirl", "shuffle", "point"];
const KNOTS = [[215, 350], [345, 340], [455, 395], [190, 435], [315, 425], [420, 470], [265, 505]];
const COUPLES = [["hana", "theo"], ["tomi", "posy"]];
export const discoCrowd = day => discoOn(day) ? [...groupFor(day + ":disco", 11, [], DISCO_POOL), ...groupFor(day + ":discot", 5, [], NIGHT_TOURISTS)] : [];
const floorCache = {};
// who stands where tonight -> {id: {at, dir, move, drift}}
export function discoFloor(day){
  if (floorCache[day]) return floorCache[day];
  const crowd = discoCrowd(day), out = {}, left = crowd.slice(), knots = KNOTS.map(() => []);
  let k = hash(day) % KNOTS.length; const nextKnot = () => { k = (k + 1 + (hash(day + k) % 2)) % KNOTS.length; return k; };
  COUPLES.forEach(([a, b]) => { if (left.includes(a) && left.includes(b)) { const n = nextKnot(); knots[n].push(a, b); left.splice(left.indexOf(a), 1); left.splice(left.indexOf(b), 1); } });
  left.forEach(id => { let n = nextKnot(); for (let t = 0; t < KNOTS.length && knots[n].length >= 3; t++) n = (n + 1) % KNOTS.length; knots[n].push(id); });
  knots.forEach((ids, n) => { const [cx, cy] = KNOTS[n];
    ids.forEach((id, i) => { const h = hash(day + ":" + id), ang = (i/ids.length)*Math.PI*2 + (h % 7)*.3, r = ids.length === 1 ? 0 : 20 + (h % 9);
      const at = [Math.round(cx + Math.cos(ang)*r*1.3), Math.round(cy + Math.sin(ang)*r*.6)];
      out[id] = {at, dir: at[0] <= cx ? 1 : -1, move: DISCO_MOVES[h % DISCO_MOVES.length], drift: ids.length > 1 && !COUPLES.some(c => c.includes(id)) && h % 2 === 0 ? KNOTS[(n + 1) % KNOTS.length] : null}; }); });
  return (floorCache[day] = out);
}
export function discoSlot(id, day, hm){
  if (!discoNow(day, hm)) return null; const f = discoFloor(day)[id]; if (!f) return null;
  return {from: DISCO_FROM, to: DISCO_TO, scene: "cellar", ...(f.drift ? {wander: [f.at, f.at, f.drift]} : {at: f.at, dir: f.dir}), act: f.move, disco: true};
}
export function clubSlot(id, day, hm){
  if (!wineClubNow(day, hm) || !clubMembers(day).includes(id)) return null;
  return {from: CLUB_FROM, to: CLUB_TO, scene: "cellar", wander: CLUB_WALK, club: true};
}

// Customers at the Scoop Shack (open 10am to 8pm): a couple each hour (three at weekends, more in the afternoon),
// villagers and tourists. Each queues at the counter for a few minutes, then eats in at a table, takes it out to the
// deck, or wanders off along the foreshore with a cone. npcs.js only lets a villager come when they're free.
const SHOP_SEATS = [[87, 518], [173, 518], [227, 518], [313, 518], [367, 512], [453, 512]], DECK_FREE = [[134, 360], [172, 352], [150, 404], [190, 404]];
const QUEUE = [[256, 392], [344, 392], [300, 404]], STROLL_SHORE = [[260, 200], [240, 420], [200, 360], [262, 520], [214, 250]];
const SCOOP_POOL = [...VISITORS.filter(v => v !== "pip"), ...TOURISTS, ...NIGHT_TOURISTS, "sam", "priya", "jonah", "mia", "hana", "theo", "tomi", "posy"];
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
