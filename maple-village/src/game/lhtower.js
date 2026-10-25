// Inside the lighthouse (round 297, Mel: "Need three interior screens for lighthouse - ground floor with a staircase
// leading up, second floor with a staircase leading up also, and third floor"; then "Treats only, just be nice to
// fill, skip the radio"). Three round rooms up the spiral stairs:
//   lhtower1  the store room and little museum: the wreck case (curios from the rock pools, and her bottles), the
//             visitor book (sign it once a day, read a line someone left), the tide board, oilskins, the old fog bell
//   lhtower2  the watch room: the brass telescope (a spotting list to fill), the weather log (once a day; a full
//             week and Bram leaves a treat), the wall chart, and Bram's armchair (his tales, when he's up here)
//   lhtower3  the lamp room: polish the lens once a day (now and then a treat from Bram, never coins), the beam at
//             night, lighting the lamp with him on Monday evenings, and the gallery door out to the view
// Nothing here pays: the collections are just nice to fill. State: F.tower.
import { pick, esc } from "../util.js";
import { icon } from "../art/icons.js";
import { ITEMS } from "../data/items.js";

export const towerState = F => { const t = F.tower = F.tower || {}; for (const [k, v] of Object.entries({curios: {}, book: "", bookI: 0, seen: {}, log: [], polish: "", polished: 0, scope: ""})) if (t[k] === undefined) t[k] = v; return t; };

/* ---------- the wreck case ---------- */
// curios turn up in the rock pools now and then (one a day at most, at low tide), go in the backpack, then the case
export const CURIOS = {
  greenglass: ["Green sea glass", "A nugget of bottle-green glass, frosted smooth by the sea."],
  blueglass: ["Blue sea glass", "Cornflower blue, the rarest colour. Probably an old poison bottle, Bram says, cheerfully."],
  pipe: ["A clay pipe bowl", "A little white clay pipe bowl, two hundred years old, with a tiny anchor stamped on it."],
  button: ["A brass button", "From a sailor's coat, green with age. You can just make out a crown."],
  nail: ["A ship's nail", "Square, hand-forged, as long as your hand. From a wreck, or a jetty, or both."],
  penny: ["An old penny", "Worn almost smooth. You can read 1898, if you tilt it to the light."],
  purse: ["A mermaid's purse", "A dry little egg case, black and curly at the corners. A skate's, or a shark's."],
  willow: ["A piece of willow pattern", "A blue and white china shard: half a bridge and one tiny bird."],
  float: ["A glass fishing float", "A green glass ball the size of an orange, from the nets of long ago."],
  whelk: ["A big whelk shell", "Spiral and creamy, and if you hold it to your ear, the sea."],
  stopper: ["A bottle stopper", "A glass marble stopper from an old pop bottle. It still rattles."],
  compass: ["A compass lid", "The brass lid of a pocket compass, with initials scratched inside: J. T."]
};
export const CURIO_IDS = Object.keys(CURIOS), itemOf = c => "cu_" + c;
CURIO_IDS.forEach(c => { ITEMS[itemOf(c)] = {n: CURIOS[c][0], kind: "curio", sell: 0, what: "for the wreck case on the lighthouse's ground floor"}; });
ITEMS.lh_parkin = {n: "Slab of Bram's parkin", kind: "gift", to: "family", sell: 1, say: "Parkin! Sticky ginger cake, the proper kind. Is that Bram's? Put the kettle on."};
const owned = (F, c) => towerState(F).curios[c] || ((F.inv || {})[itemOf(c)] > 0);
// a rock pool find: about one visit in three, each curio once, while there are any left to find -> {id, line} or null
export function poolFind(F, day, r = Math.random()){
  const t = towerState(F); if (t.poolDay === day) return null; t.poolDay = day;
  const left = CURIO_IDS.filter(c => !owned(F, c)); if (!left.length || r > .34) return null;
  const c = left[Math.floor(r*1000) % left.length]; F.inv = F.inv || {}; F.inv[itemOf(c)] = 1;
  return {id: c, line: `Something glints at the bottom of the pool: ${CURIOS[c][0].toLowerCase()}. ${CURIOS[c][1]} One for the wreck case.`};
}
export function placeCurio(F, c){
  const t = towerState(F); if (!CURIOS[c] || !((F.inv || {})[itemOf(c)] > 0)) return null;
  delete F.inv[itemOf(c)]; t.curios[c] = 1; const n = Object.keys(t.curios).length;
  return {ok: true, line: `${CURIOS[c][0]}, on the velvet with a little handwritten label.${n === CURIO_IDS.length ? " That's every space in the case filled. Bram stands and looks at it for a long time." : ""}`};
}
export const bottlesFound = F => ((F.south && F.south.bottles && F.south.bottles.found) || []).length;

/* ---------- the visitor book ---------- */
export const VISITORS = [
  "\"Climbed it with Grandad, 1974. Still a hundred and eight.\"",
  "\"Saw a seal from the top!!! Its name is Gerald.\" (in crayon)",
  "\"Honeymoon. Windy. Perfect.\" B and K, June 1989",
  "\"My knees will never forgive me. Worth it.\"",
  "\"Proposed on the gallery. She said yes. Bram cried. Don't tell him we said.\"",
  "\"Lovely clean lens. 10/10 would climb again.\"",
  "\"The view! I could see my house! (I live in the house next door.)\"",
  "\"Dad said there'd be a gift shop at the top. There wasn't. 4/5.\"",
  "\"Came every summer as a girl. Brought my granddaughter today. Nothing's changed but me.\"",
  "\"Counted 108 steps up, 109 down. Investigating.\"",
  "\"Rain all day, but the fog bell was worth it.\"",
  "\"Thank you, Bram, for the tea and the story about the priory boat.\"",
  "\"First time seeing the sea. It's bigger than I thought.\"",
  "\"Watched the lamp lit on a Monday. Clapped like an idiot. Everyone did.\"",
  "\"A gull stole my sandwich on the point. Ten out of ten for him, really.\""
];
export function signBook(F, day){
  const t = towerState(F); if (t.book === day) return {line: "You've signed today already. You read a few more of the old entries instead, smiling."};
  t.book = day; const l = VISITORS[t.bookI % VISITORS.length]; t.bookI++;
  return {ok: true, line: `You sign the visitor book in your best handwriting. On the page before: ${l}`};
}

/* ---------- the watch room ---------- */
// what the telescope finds: {n, when(hm, rainy, dow) -> bool, w weight, line}
export const SIGHTS = {
  boat: ["A fishing boat", 30, () => true, "A little blue fishing boat heading home, gulls trailing it like kite tails."],
  dolphins: ["The dolphins", 10, hm => hm >= 6*60 && hm < 19*60, "Dolphins! Three of them, arcing through the swell off the point."],
  seal: ["A seal", 12, hm => hm >= 6*60 && hm < 20*60, "A grey seal on the rocks below, belly up, having a lovely time."],
  ship: ["A big ship", 14, () => true, "A container ship far out on the horizon, slow as a cloud."],
  ferry: ["The ferry", 12, hm => hm >= 8*60 && hm < 18*60, "The ferry chugging out from the foreshore jetty, someone waving from the back."],
  taxi: ["The river taxi", 10, hm => hm >= 8*60 && hm < 19*60, "The river taxi pottering round to the lighthouse jetty, its little flag flapping."],
  yacht: ["A yacht race", 6, (hm, rain, dow) => (dow === 0 || dow === 6) && hm >= 10*60 && hm < 16*60, "A yacht race! A string of white sails leaning into the wind, all on the same tack."],
  gannets: ["Gannets diving", 8, hm => hm >= 7*60 && hm < 18*60, "Gannets, folding their wings and dropping into the sea like arrows. Splash, splash, splash."],
  puffin: ["A puffin", 4, hm => hm >= 7*60 && hm < 18*60, "A puffin, whirring past low over the water like a wind-up toy. From Puffin Isle, surely."],
  storm: ["A squall at sea", 10, (hm, rain) => rain, "A dark curtain of rain far out at sea, sweeping slowly along the horizon."],
  rainbow: ["A rainbow over the bay", 6, (hm, rain) => rain && hm >= 7*60 && hm < 18*60, "A rainbow, one end in the sea and the other somewhere over the Stables."],
  lights: ["Ships' lights", 20, hm => hm >= 19*60 || hm < 6*60, "Ships' lights out in the dark, red and green, and one flashing back at the beam."],
  moon: ["Moonlight on the water", 14, hm => hm >= 20*60 || hm < 5*60, "A long silver road of moonlight across the water, all the way to the edge of the world."],
  whale: ["A whale", 1, hm => hm >= 7*60 && hm < 18*60, "A WHALE. A great dark back rolling through the sea, and a spout like a sigh. You'll tell everyone."]
};
export const SIGHT_IDS = Object.keys(SIGHTS);
export function lookOut(F, hm, rainy, dow, r = Math.random()){
  const t = towerState(F), ok = SIGHT_IDS.filter(id => SIGHTS[id][2](hm, rainy, dow)), tot = ok.reduce((a, id) => a + SIGHTS[id][1], 0);
  let x = r*tot, id = ok[0]; for (const k of ok) { if (x < SIGHTS[k][1]) { id = k; break; } x -= SIGHTS[k][1]; }
  const first = !t.seen[id]; t.seen[id] = 1;
  return {id, first, line: SIGHTS[id][3] + (first ? ` (A new one for your spotting list: ${Object.keys(t.seen).length} of ${SIGHT_IDS.length}.)` : "")};
}
// the weather log: once a day, in the keepers' way; seven days running and Bram leaves a slab of parkin by the log
const WEATHER = {rain: ["Rain from the west, steady. Sea grey and lumpy.", "Showers, bright between. Wind fresh.", "Drizzle and low cloud. Visibility poor; the light was on early."],
  fine: ["Fair. Wind light, south-westerly. Sea slight.", "Clear and bright, a few high clouds. Visibility good: Puffin Isle in sight.", "Sunny, calm. Sea like a millpond. Gulls lazy."]};
export function writeLog(F, day, rainy){
  const t = towerState(F); if (t.log[0] && t.log[0].day === day) return {line: `You've written today's weather: "${t.log[0].w}" Bram's initialled it.`};
  const w = pick(WEATHER[rainy ? "rain" : "fine"]), prev = t.log[0], run = prev && Date.parse(day) - Date.parse(prev.day) === 864e5 ? (prev.run || 1) + 1 : 1;
  t.log = [{day, w, run}, ...t.log].slice(0, 14);
  if (run % 7 === 0) { F.inv = F.inv || {}; F.inv.lh_parkin = (F.inv.lh_parkin || 0) + 1;
    return {ok: true, treat: true, line: `You write it in the log in your neatest hand: "${w}" A whole week of entries. Beside the log, wrapped in greaseproof paper, a slab of Bram's parkin and a note: "Good log keeping. B."`}; }
  return {ok: true, line: `You write it in the log in your neatest hand: "${w}" ${run > 1 ? `${run} days running.` : "The first entry in your hand."}`};
}

/* ---------- the lamp room ---------- */
// polish the lens once a day (by day); every third time, a treat from Bram: parkin or a mackerel, never coins
export function polishLens(F, day, night){
  const t = towerState(F);
  if (night) return {line: "The great lens turns slowly, throwing its light out over the dark water. You stand and watch it go round, and round, and round."};
  if (t.polish === day) return {line: "The lens is gleaming already. You can see a hundred tiny yous in it."};
  t.polish = day; t.polished++;
  if (t.polished % 3 === 0) { const k = t.polished % 6 === 0 ? "mackerel" : "lh_parkin"; F.inv = F.inv || {}; F.inv[k] = (F.inv[k] || 0) + 1;
    return {ok: true, treat: k, line: `You polish every prism and the brass till it shines. Bram puts his head up the stairs: "Champion. Here." ${k === "mackerel" ? "A fresh mackerel off the rocks, wrapped in newspaper." : "A slab of his parkin, still sticky."}`}; }
  return {ok: true, line: pick(["You polish the lens with Bram's soft cloth, prism by prism. The sun comes through it in a hundred rainbows.", "A dab of polish on the brass, and round and round with the cloth. You can see your face in it now.", "You wipe the salt from the lens, every curved ring of glass. It throws little rainbows all over the walls."])};
}
// the gallery: the view, by what's going on
export function galleryView(o){
  const bits = [];
  if (o.night) bits.push("The village is all little lit windows, and the beam sweeps over your head and out to sea.");
  else bits.push(pick(["The whole coast laid out like a map: the bay, the foreshore, the beach huts in a row.", "Wind in your hair, gulls below you, and the sea going on for ever."]));
  if (o.boot) bits.push("Down on the green, the car boot's in full swing: a patchwork of tables and car roofs.");
  if (o.cricket) bits.push("On the green, little white figures playing cricket. Someone's just been bowled.");
  if (o.band) bits.push("You can just hear the brass band on the green, drifting up on the wind.");
  if (o.rain) bits.push("Rain sweeping in from the sea in long grey curtains.");
  if (o.pet) bits.push(`${o.pet} has its nose through the railings, sniffing the sea air.`);
  return bits.join(" ");
}

/* ---------- panels: the wreck case and the spotting list ---------- */
const shut = `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
export function towerPanel(F, view){
  const t = towerState(F);
  if (view === "case") { const n = Object.keys(t.curios).length, mine = CURIO_IDS.filter(c => (F.inv || {})[itemOf(c)] > 0);
    return `<span class="tape stripe" aria-hidden="true"></span><h2>The wreck case</h2><p class="sub">Things the sea's given back, on faded velvet. ${n} of ${CURIO_IDS.length} spaces filled. Curios turn up in the rock pools at low tide, now and then.</p>
      ${mine.length ? `<ul class="hlist wlist">${mine.map(c => `<li><span class="wpic">${icon(itemOf(c), 26)}</span><span class="wtxt"><b>${esc(CURIOS[c][0])}</b><small>In your backpack.</small></span><button class="btn small primary" data-tw="place:${c}">Put it in the case</button></li>`).join("")}</ul>` : ""}
      <ul class="hlist wlist">${CURIO_IDS.map(c => t.curios[c] ? `<li><span class="wpic">${icon(itemOf(c), 26)}</span><span class="wtxt"><b>${esc(CURIOS[c][0])}</b><small>${esc(CURIOS[c][1])}</small></span></li>` : `<li><span class="wtxt"><small class="muted">An empty space on the velvet.</small></span></li>`).join("")}</ul>
      <p class="sub">On the bottom shelf: ${bottlesFound(F) ? `${bottlesFound(F)} of your bottles from the sea, their messages kept in your mailbox.` : "room for the bottles that wash up on the beaches."}</p>` + shut; }
  if (view === "list") { const n = Object.keys(t.seen).length;
    return `<span class="tape stripe" aria-hidden="true"></span><h2>Your spotting list</h2><p class="sub">Pinned beside the coast chart, in your handwriting. ${n} of ${SIGHT_IDS.length} spotted from the telescope.</p>
      <ul class="hlist wlist">${SIGHT_IDS.map(id => `<li><span class="wtxt"><b>${t.seen[id] ? esc(SIGHTS[id][0]) : "?"}</b>${t.seen[id] ? "" : "<small class=\"muted\">Not yet.</small>"}</span></li>`).join("")}</ul>` + shut; }
  return "";
}
