// The bottom row of the village (rounds 262 to 264, Mel: "I want the game to become a 4 by 4 screen"): Honeybrook
// Green (south of home), the Stables (south of the orchard) and Lighthouse Point (south of the flower farm, where the
// coast path ends). Small, calm things to do; nothing here is a way to make money. State: F.south.
import { pick, now } from "../util.js";
import { CARBOOT } from "../data/carboot.js";
import { BOTTLES, BOTTLE_AFTER } from "../data/bottles.js";
import { ITEMS } from "../data/items.js";
export { CARBOOT };
import { icon } from "../art/icons.js";
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

export const southState = F => { F.south = F.south || {}; const s = F.south;
  s.ponies = s.ponies || {}; for (const id of [...Object.keys(PONIES), ...(s.mine ? ["mine"] : [])]) s.ponies[id] = Object.assign({trust: 0, fed: "", brushed: ""}, s.ponies[id] || {});
  return s; };
const dow = day => new Date(day + "T00:00:00Z").getUTCDay();

/* ---------- Honeybrook Green ---------- */
export const BAND = {dow: 0, from: 14*60, to: 16*60};      // the brass band, Sunday afternoons
export const CRICKET = {dow: 6, from: 14*60, to: 17*60};   // cricket on the lawn, Saturday afternoons
export const bandNow = (day, hm) => dow(day) === BAND.dow && hm >= BAND.from && hm < BAND.to;
export const cricketNow = (day, hm) => dow(day) === CRICKET.dow && hm >= CRICKET.from && hm < CRICKET.to;
export const DUCK_FOOD = 1;
// feed the ducks: a scoop of duck food from the honesty tin (1 coin), once a day
export function feedDucks(F, day, hm){
  const s = southState(F);
  if (hm < 6*60 || hm >= 20*60) return {line: "The ducks are asleep on the bank, beaks tucked under their wings. Best let them be."};
  if (s.ducks === day) return {line: "The ducks have had their breakfast and lunch and, frankly, a second lunch. They paddle off, full."};
  // round 276 (Mel: "Can I bring something to feed the ducks? What do they eat?"): peas or sweetcorn from the garden
  // are just right (bread's bad for them); otherwise a scoop of duck food from the honesty tin, a coin
  const own = ["pea", "corn"].find(k => (F.inv || {})[k] > 0);
  if (own) { F.inv[own]--; if (F.inv[own] <= 0) delete F.inv[own]; s.ducks = day;
    return {fed: true, line: own === "pea" ? "You scatter a handful of peas from the garden. The ducks go wild: peas are their very favourite. One of them follows you halfway to the gate." : "You crumble a cob of sweetcorn into the water and the ducks come paddling from every corner of the pond, quacking about it."}; }
  if ((F.coins || 0) < DUCK_FOOD) return {line: "Ducks love peas and sweetcorn (never bread, it's bad for them). Bring some from the garden, or a scoop of duck food from the honesty tin is a coin."};
  F.coins -= DUCK_FOOD; s.ducks = day;
  return {line: pick(["You scatter a scoop of duck food and the whole pond comes at once: three ducks, a moorhen, and a very determined duckling.", "The ducks waddle up the bank in a line, quacking about it. One of them eats from your hand.", "Splash, splash, splash. The ducks race for the food, and the smallest one wins."]), fed: true};
}
// the allotments' swap crate: whoever has too much of something leaves it out; take one thing a day
export const SWAP = ["leek", "potato", "pea", "pumpkin", "carrot", "tomato", "garlic", "corn", "pepper"];
export function swapCrate(F, day){
  const s = southState(F); if (s.swap === day) return {line: "You've had your pick from the swap crate today. Someone's chalked \"plenty more tomorrow\" on the lid."};
  let h = 0; for (const c of day) h = (h*31 + c.charCodeAt(0)) >>> 0;
  const id = SWAP[h % SWAP.length]; s.swap = day; F.inv = F.inv || {}; F.inv[id] = (F.inv[id] || 0) + 1;
  return {id, line: "The swap crate by the potting shed: whoever grows too much leaves it out, with a note saying help yourself."};
}

// the allotment holders' plots (round 277): what each says about theirs, here or not
export const PLOT_LINES = {
  gonggong: {here: ["Pak choi, long beans, chillies. Ma Ma says I grow too much. Is there such thing?", "This one is for your ma ma's soup. That one also."], away: "Gong Gong's plot: pak choi in neat rows, long beans up the canes, and chillies going red. A little stool at the end for sitting and looking at it."},
  mei: {here: ["Tomatoes, basil, and a bit of everything I miss from home.", "Pinch the side shoots off the tomatoes. Like this. See?"], away: "Mei's plot: tomatoes staked in a row, a jungle of basil, and a label for everything in her tiny handwriting."},
  theo: {here: ["That pumpkin is entered in the county show. Don't tell it. It gets nervous.", "I talk to it every morning. For science."], away: "Theo's plot: mostly one enormous pumpkin, with a sign saying PLEASE DO NOT TOUCH (ROBERT)."},
  juniper: {here: ["Sweet peas and cornflowers. For drying, and for poems.", "The more you pick sweet peas, the more they flower. Life lesson, that."], away: "Juniper's plot: sweet peas up the canes in every colour, and cornflowers going wild along the edge."},
  bo: {here: ["Strawberries! Netted, because the blackbirds are criminals.", "Have one. Go on. Just the one. All right, two."], away: "Bo's plot: strawberries under netting, and a scarecrow in a bucket hat that looks suspiciously like Bo."},
  felix: {here: ["Runner beans, and a bee hotel. The solitary bees love it.", "The bees from my hives come down here too. Busman's holiday."], away: "Felix's plot: runner beans with red flowers, and a little wooden bee hotel full of holes."}
};
export const plotLine = (id, here) => { const p = PLOT_LINES[id]; return p ? (here ? pick(p.here) : p.away) : null; };

/* ---------- The Stables ---------- */
export const PONIES = {biscuit: {n: "Biscuit", coat: "chestnut", like: "apple"}, pebble: {n: "Pebble", coat: "dapple grey", like: "carrot"}};
export const TRUST_MAX = 10, RIDE_TRUST = 3, RIDE_COST = 15;
// round 270 (Mel: "Yes to pony"): a pony of Mel's own, named by her, bought at the stable block; she lives in the
// paddock with Biscuit and Pebble and is cared for the same way (her keep is included: no running costs)
export const MY_PONY = {price: 1200, coat: "bay and white", like: "apple"};
const ponyOf = (F, id) => id === "mine" ? (F.south && F.south.mine ? {n: F.south.mine.name, coat: MY_PONY.coat, like: MY_PONY.like} : null) : PONIES[id];
export const ponyIds = F => [...Object.keys(PONIES), ...(F.south && F.south.mine ? ["mine"] : [])];
export function buyPony(F, name, day){
  const s = southState(F), n = String(name || "").replace(/[<>&"]/g, "").trim().slice(0, 16);
  if (s.mine) return {line: `${s.mine.name}'s already yours.`};
  if (!n) return {line: "She'll need a name first."};
  if ((F.coins || 0) < MY_PONY.price) return {line: `A pony of your own is ${MY_PONY.price.toLocaleString("en-GB")} coins.`};
  F.coins -= MY_PONY.price; s.mine = {name: n, since: day}; southState(F);
  return {ok: true, line: `${n} is yours! A ${MY_PONY.coat} pony with a white star on her nose. Lila leads her out to the paddock, where Biscuit and Pebble come over to say hello.`};
}
const TREATS = ["apple", "carrot"];
export const ponyTreat = F => TREATS.find(t => (F.inv || {})[t] > 0) || null;
// feed a pony a treat from the backpack (once a day each); the one it likes best counts double
export function feedPony(F, id, day){
  const s = southState(F), p = s.ponies[id], P = ponyOf(F, id); if (!p || !P) return null;
  if (p.fed === day) return {line: `${P.n} has had a treat today. She noses your pocket anyway, just in case.`};
  const t = ponyTreat(F); if (!t) return {line: `${P.n} would love an apple or a carrot. The orchard and the garden have both.`};
  F.inv[t]--; if (F.inv[t] <= 0) delete F.inv[t]; p.fed = day; p.trust = Math.min(TRUST_MAX, p.trust + (t === P.like ? 2 : 1));
  return {line: t === P.like ? `${P.n} crunches the ${t} with her eyes half closed. Her favourite.` : `${P.n} takes the ${t} very politely, lips first, and crunches it slowly.`, ok: true};
}
export function brushPony(F, id, day){
  const s = southState(F), p = s.ponies[id], P = ponyOf(F, id); if (!p || !P) return null;
  if (p.brushed === day) return {line: `${P.n} is already gleaming. Any more brushing and she'll start to glow.`};
  p.brushed = day; p.trust = Math.min(TRUST_MAX, p.trust + 1);
  return {line: pick([`You brush ${P.n} from her ears to her tail. She leans into it and sighs.`, `Long, slow strokes with the soft brush. ${P.n}'s ${P.coat} coat starts to shine.`, `${P.n} stands very still while you brush her, one back hoof tipped up, dozing.`]), ok: true};
}
// round 283 (Mel: "Riding pony"): riding your own pony about the village. Tack from the tack room once; then, when she
// knows you, saddle up at the stable block for an hour's ride (once a day, 7am to 7pm), out on every screen at home.
// Evan rides up in front of you. She trots home to the stables on her own when the hour's up. State: s.tack, s.hack.
export const TACK = 150, HACK_MIN = 60;
export const riding = F => !!(F.south && F.south.hack && F.south.hack.until > now());
export function buyTack(F){
  const s = southState(F); if (!s.mine) return null; if (s.tack) return {line: "Her saddle and bridle are on her peg in the tack room already."};
  if ((F.coins || 0) < TACK) return {line: `A saddle, bridle and riding hat are ${TACK} coins.`};
  F.coins -= TACK; s.tack = true;
  return {ok: true, line: `Lila helps you choose a saddle, a bridle and a riding hat, and hangs them on a peg with ${s.mine.name}'s name over it.`};
}
export function saddleUp(F, day, hm){
  const s = southState(F), p = s.mine && s.ponies.mine; if (!p) return null;
  if (!s.tack) return {line: `You'll need a saddle and bridle first. The tack room has them, ${TACK} coins.`};
  if (p.trust < RIDE_TRUST) return {line: `${s.mine.name} doesn't quite know you yet. A few more days of treats and brushing (${p.trust} of ${RIDE_TRUST}).`};
  if (hm < 7*60 || hm >= 18*60 + 45) return {line: `${s.mine.name}'s settled for the night. Ride her in the daytime, 7am to 7pm.`};
  if (riding(F)) return {line: `You're already out on ${s.mine.name}.`};
  if (s.hack && s.hack.day === day) return {line: `${s.mine.name}'s had her ride today. Tomorrow.`};
  const mins = Math.min(HACK_MIN, 19*60 - hm); s.hack = {until: now() + mins*60000, day};
  return {ok: true, line: `You tack up ${s.mine.name}, swing up into the saddle, and off you go at a gentle walk. She knows her own way home when you're done.`};
}
export function unsaddle(F){
  const s = southState(F); if (!riding(F)) return null; s.hack.until = 0;
  return {ok: true, line: `You slide down and give ${s.mine.name} a pat. She ambles back to the paddock, swishing her tail.`};
}
export function tackPanel(F, day){
  const s = southState(F), n = esc(s.mine.name), p = s.ponies.mine, out = riding(F), left = out ? Math.max(1, Math.ceil((s.hack.until - now())/60000)) : 0;
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>The tack room</h2>`;
  if (!s.tack) return h + `<p class="sub">Saddles on their racks, bridles on hooks, a rosette board, and the smell of leather soap. To ride ${n} out you'll want a saddle, a bridle and a riding hat of your own: ${TACK} coins.</p>
    <div class="actions"><button class="btn primary" data-ride="tack"${(F.coins || 0) < TACK ? " disabled" : ""}>Buy her tack (${TACK} coins)</button><button class="btn alt small" data-close="1">Not yet</button></div>`;
  const ready = p.trust >= RIDE_TRUST, done = s.hack && s.hack.day === day && !out;
  return h + `<p class="sub">${n}'s saddle and bridle hang on her own peg. ${out ? `You're out riding: ${left} minute${left === 1 ? "" : "s"} left before she heads home.` : done ? "She's had her ride today." : ready ? "An hour's ride, anywhere at home, once a day. Evan can sit up in front of you." : `She needs to know you a little better first (${p.trust} of ${RIDE_TRUST} hearts).`}</p>
    <div class="actions">${out ? `<button class="btn primary" data-ride="stop">Bring her home</button>` : `<button class="btn primary" data-ride="go"${ready && !done ? "" : " disabled"}>Saddle up</button>`}<button class="btn alt small" data-close="1">Close</button></div>`;
}
// out on the sand along the bottom row, once a day: a canter at low tide, a walk in the shallows at high
export function canter(F, day, scene, tide){
  const s = southState(F); if (!riding(F) || !SOUTH_BEACH.includes(scene) || s.hack.beach === day) return null;
  s.hack.beach = day; const p = s.ponies.mine, n = s.mine.name; p.trust = Math.min(TRUST_MAX, p.trust + 1);
  return {line: tide === "low" ? pick([`The tide's out and the sand's hard and wet. ${n} breaks into a canter all on her own, and you whoop.`, `A long canter along the wet sand, the sea flashing beside you. A seal pokes its head up to watch you go by.`])
    : pick([`${n} splashes through the shallows, lifting her feet high like she's dancing.`, `You walk ${n} along the tideline. She stops to sniff a crab, and snorts at it.`])};
}
const SOUTH_BEACH = ["lighthouse", "stables", "green", "lowervine"];
// round 283 (Mel: "Bram's cottage"): the keeper's cottage at the foot of the lighthouse. Tea with Bram when he's in
// (he comes in for a cup at three), a page of his father's keeper's log a day, and the things on his shelves.
export const LOGBOOK = [
  "12 March. Wind north-west, fresh. Lamp lit 18.40. Planted twelve vines on the slope below the old press. Bram, aged six, helped, and ate some of the soil.",
  "3 June. Calm. Lamp lit 21.15. The vines have their first leaves. The old press is sound; only wants a new beam.",
  "28 September. Gale from the south-west all night. Lamp kept. Picked the first grapes this morning, wet through. Small and sweet. Made four bottles. Terrible. Drank them all.",
  "14 October. Fog. Foghorn sounded 02.00 till 07.30. Bram asked why the light has to turn. Told him so the ships know it's ours and not another.",
  "2 January. Clear, frost. Found a cross and a vine cut in the rock by the pools. The same mark as on the press. Priory work, I think.",
  "19 August. Calm, a big moon. Old Ned at the harbour says his grandfather told of a priory boat lost off this point with a cargo of wine. Bram wants to dive for it. Told him when he's taller."
];
const TEA = ["Bram pours two mugs, strong enough to stand a spoon in, and tells you about the winter the harbour nearly froze. \"Well. Very nearly.\"",
  "Tea and a ginger biscuit by the fire. Bram talks about the ships he's watched go by, and which ones always toot.",
  "Bram makes the tea in a brown pot with a knitted cosy. You sit by the round window and watch the gulls, not saying much. It's lovely.",
  "He warms the pot first, the proper way, and tells you the light's lamp was made in Birmingham in 1889. He's very proud of Birmingham."];
export function bramSpot(F, id, day, home, withEvan){
  const s = southState(F), b = s.bram = Object.assign({tea: "", log: 0, logDay: ""}, s.bram || {});
  if (id === "kettle") {
    if (!home) return {line: "The kettle's cold on the hob. Bram's out on the point; he's usually in for a cup around three."};
    if (b.tea === day) return {line: "Bram tops up your mug without asking. \"There's always another cup in that pot.\""};
    b.tea = day; const vines = F.vine && F.vine.lower && F.vine.lower !== "before";
    return {ok: true, line: pick(TEA) + (vines ? " He asks how the lower rows are coming on, and looks very pleased with the answer." : "") + (withEvan ? " He finds Evan a biscuit from a tin shaped like a lighthouse and lets him wear his cap." : "")};
  }
  if (id === "log") {
    if (b.log >= LOGBOOK.length) return {line: "You've read the whole of his father's logbook. You turn back to the page about the priory boat and read it again."};
    if (b.logDay === day) return {line: "You've read a page today. Bram says a keeper's log keeps better a page at a time."};
    b.logDay = day; const e = LOGBOOK[b.log++];
    return {ok: true, line: `His father's keeper's log, in faded pencil: "${e}"`};
  }
  if (id === "ship") return {line: "A little ship in a bottle on the mantel, every rope and sail. Bram built it one winter with tweezers and a knitting needle. It took him four months, and he says he'd do it again."};
  if (id === "window") return {line: pick(["The round window looks straight out to sea. A fishing boat's heading home, gulls trailing it like kite tails.", "From the window you can see right along the coast: the beach huts, the Stables, and a sliver of the lower vineyard."])};
  if (id === "fire") return {line: home ? "A driftwood fire, crackling green and blue from the salt. Bram's boots are steaming gently in front of it." : "The fire's banked down low, waiting for Bram to come in and poke it back to life."};
  return null;
}
// a pony ride round the sand ring for Evan, on Pebble (she's the steady one), once a day
export function ponyRide(F, day, withEvan){
  const s = southState(F), p = s.ponies.pebble;
  if (!withEvan) return {line: "Pony rides are for little ones. Bring Evan along."};
  if (p.trust < RIDE_TRUST) return {line: `Pebble doesn't know you well enough yet. A few days of treats and brushing first (${p.trust} of ${RIDE_TRUST}).`};
  if (s.ride === day) return {line: "Evan's had his ride today. He's still telling everyone about it."};
  if ((F.coins || 0) < RIDE_COST) return {line: `A pony ride is ${RIDE_COST} coins.`};
  F.coins -= RIDE_COST; s.ride = day;
  return {line: "Evan sits up very straight in the little saddle, both hands on the strap, and Pebble walks him round the ring twice, slow and careful.", ok: true};
}

export function stablePanel(F){
  const s = southState(F);
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>The stable block</h2>`;
  if (s.mine) return h + `<p class="sub">${esc(s.mine.name)}'s stall is the one on the end, with her name painted over the door. She's out in the paddock most days.</p><div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
  return h + `<p class="sub">There's an empty stall on the end. Lila says a ${MY_PONY.coat} pony from the farm over the hill needs a home: gentle, a bit greedy, very fond of apples. ${MY_PONY.price.toLocaleString("en-GB")} coins, and her keep's included.</p>
    <label class="sub" for="ponyName">What will you call her?</label><input id="ponyName" class="input" maxlength="16" placeholder="Her name" style="margin:6px 0 10px;width:100%">
    <div class="actions"><button class="btn primary" data-ponybuy="1"${(F.coins || 0) < MY_PONY.price ? " disabled" : ""}>Make her yours</button><button class="btn alt small" data-close="1">Not yet</button></div>`;
}

/* ---------- Lighthouse Point ---------- */
export const CHIPS = 9;
export function climb(F, day, hm){
  const s = southState(F), night = hm >= 19*60 || hm < 6*60;
  if (night) return {line: "Up the spiral stairs to the lamp room. The great lens turns slowly, throwing its light out over the dark water, and somewhere out there a boat flashes back."};
  const first = s.climb !== day; s.climb = day;
  return {line: pick(["A hundred and eight steps, round and round. At the top, the whole coast: the bay, the shore, the flower fields, and the sea going on for ever.", "From the gallery you can see Honeybrook laid out like a map: the orchard, the green, the vines, and the smoke from your own chimney.", "The wind up here takes your breath away. Gulls hang level with you, not flapping at all."]), first};
}
// Bram's tales: one a day, in turn, when you climb the lighthouse and he's about
export const TALES = [
  "\"The winter of the big storm, a fishing boat lost her engine off the point. I kept the light turning by hand all night, and in the morning there she was, safe in the bay, the skipper waving his hat.\"",
  "\"My father kept this light before me. He used to say the lamp's a promise: somebody's out there, and somebody's watching for them.\"",
  "\"There's a seal that comes into the cove every September. Same scar on her nose, twelve years now. I call her Maud. She doesn't answer to it.\"",
  "\"Saw the northern lights from up here once. Green, rippling, like the sky had a tide. Never again, mind. Once was plenty.\"",
  "\"A little girl wrote to the light once, care of the lighthouse. Wanted to know if it got lonely. I wrote back: not with the gulls about.\"",
  "\"The fog comes in so thick some nights you can't see the rail. That's when the foghorn earns its keep. Wakes half the village, mind.\"",
  "\"Dolphins came right up the coast one summer, a whole pod, leaping in the lamp beam. Best night of my life, that, and I've had a few.\"",
  "\"They say there's a wreck under the headland, an old trading ship, full of tea. On a still low tide you can smell it. Or I like to think so.\""
];
export function keeperTale(F, day){
  const s = southState(F); if (s.tale && s.tale.day === day) return null;
  const i = s.tale ? (s.tale.i + 1) % TALES.length : 0; s.tale = {day, i}; return TALES[i];
}
const POOLS = ["a hermit crab trying on a new shell", "a starfish the colour of a sunset", "a tiny fish that darts under a rock", "a sea anemone, closing up when you touch the water", "a crab scuttling sideways, very offended", "a periwinkle, slowly going somewhere"];
export function rockPools(F, day, tide){
  if (tide === "high") return {line: "The tide's in, and the rock pools are under the sea. Come back when it's out."};
  const s = southState(F); s.pools = day;
  // round 273: once the cave's found and Bram has told you about the priory boat, the sea gives something back
  const heard = id => (((F.story || {}).heard || {})[id] || 0);
  if (!s.flask && F.secret && F.secret.step >= 5 && heard("bram") >= 2) { s.flask = day; F.inv = F.inv || {}; F.inv.s_flask = (F.inv.s_flask || 0) + 1;
    return {flask: true, line: "Wedged between two rocks in the deepest pool: a stoneware flask, sealed with wax, a little cross and a vine stamped on its side. You lift it out, dripping. Hazel will want to see this."}; }
  if (((F.story || {}).flags || {}).seacave) return {cave: true, line: "Behind the rock pools, where Bram said: a low arch in the rock, only above water at low tide. The sea door."};
  return {line: `You crouch over the rock pools. In the clearest one: ${pick(POOLS)}.`};
}
// low tide in the morning and early evening (a simple daily rhythm, not the real tides)
export const tideAt = hm => (hm >= 6*60 && hm < 11*60) || (hm >= 17*60 && hm < 20*60) ? "low" : "high";
// round 276 (Mel: "Fish and chip shop should open a menu. I should also be able to sell fish to them"): Dot's
// hatch. A menu to eat there and then, and she buys your catch for the fryer (fair prices, never more than the fish
// fetches anywhere else; up to six a day)
export const CHIP_MENU = {
  cod: {n: "Cod and chips", price: 9, line: "Crisp battered cod, a mountain of chips, salt and vinegar, in paper. You eat it on the sea wall and fight off one very bold gull."},
  haddock: {n: "Haddock and chips", price: 9, line: "Haddock, flakier than cod, Dot says, and she'd know. With chips, a wedge of lemon and a little wooden fork."},
  mackerel: {n: "Grilled mackerel bap", price: 6, line: "Mackerel straight off the grill in a soft floury bap, with a bit of horseradish. Bram swears by it."},
  chips: {n: "A cone of chips", price: 4, line: "A paper cone of chips, too hot to hold. You blow on every one and burn your mouth anyway."},
  peas: {n: "Mushy peas", price: 2, line: "A little pot of mushy peas, bright green and very, very hot."}
};
export const CHIP_BUYS = ["fish", "mackerel", "sardine", "anchovy", "seabream", "mullet", "squid", "clams", "mussels"], CHIP_CAP = 6;
const chipSell = id => id === "fish" ? 3 : ((ITEMS[id] || {}).sell || 0);
// round 287: the gull on Dot's roof
export const gullLine = F => (F.inv || {}).chips_out ? "The gull on Dot's roof stares very hard at the takeaway in your backpack. You hold it a little tighter." : pick(["A herring gull on the chip hatch roof, one foot tucked up, watching everyone's chips.", "The gull puts its head back and laughs at the sky. Kee-ow, kee-ow, kee-ow.", "Dot says this one's called Gerald, and he's banned."]);
// round 286 (Mel: "Can I also buy fish and chips as takeaway? As gifts"): wrapped in paper to take away, for the family
export const TAKEAWAY = 9;
export function takeaway(F){
  if ((F.coins || 0) < TAKEAWAY) return {line: `Fish and chips to take away are ${TAKEAWAY} coins.`};
  F.coins -= TAKEAWAY; F.inv = F.inv || {}; F.inv.chips_out = (F.inv.chips_out || 0) + 1;
  return {ok: true, line: "Dot wraps it up tight in paper, two layers, \"to keep the heat in, love,\" and tucks in a little wooden fork. Into your backpack, still hot."};
}
export function eatChips(F, k, withEvan){
  const m = CHIP_MENU[k]; if (!m) return null;
  if ((F.coins || 0) < m.price) return {line: `${m.n} is ${m.price} coins.`};
  F.coins -= m.price; return {ok: true, line: m.line + (withEvan && k !== "peas" ? " Evan has most of your chips." : "")};
}
export function sellCatch(F, id, day){
  const s = southState(F); s.chipSold = s.chipSold && s.chipSold.day === day ? s.chipSold : {day, n: 0};
  if (!CHIP_BUYS.includes(id) || !((F.inv || {})[id] > 0)) return null;
  if (s.chipSold.n >= CHIP_CAP) return {line: "\"That's my fryer full for today, love. Bring me more tomorrow.\""};
  const c = chipSell(id); F.inv[id]--; if (F.inv[id] <= 0) delete F.inv[id]; F.coins = (F.coins || 0) + c; s.chipSold.n++;
  return {ok: true, coins: c, line: `Dot weighs it, nods, and hands over ${c} coin${c === 1 ? "" : "s"}. "Lovely. That'll be in the fryer by teatime."`};
}
export function chipsPanel(F, day){
  const s = southState(F), sold = s.chipSold && s.chipSold.day === day ? s.chipSold.n : 0, have = CHIP_BUYS.filter(id => (F.inv || {})[id] > 0);
  return `<span class="tape gingham" aria-hidden="true"></span><h2>Dot's fish and chips</h2><p class="sub">Dot leans out of the hatch in her striped apron. "What can I get you, love?"</p>
    <ul class="hlist wlist">${Object.entries(CHIP_MENU).map(([k, m]) => `<li><span class="wtxt"><b>${esc(m.n)}</b></span><button class="btn small primary" data-chips="${k}"${(F.coins || 0) < m.price ? " disabled" : ""}>${m.price} coins</button></li>`).join("")}</ul>
    <h3 class="ph3">To take away</h3><ul class="hlist wlist"><li><span class="wpic">${icon("chips_out", 26)}</span><span class="wtxt"><b>Fish and chips, wrapped</b><small>A present for the family, in person or sent round.${(F.inv || {}).chips_out ? ` You have ${F.inv.chips_out}.` : ""}</small></span><button class="btn small primary" data-chipsout="1"${(F.coins || 0) < TAKEAWAY ? " disabled" : ""}>${TAKEAWAY} coins</button></li></ul>
    <h3 class="ph3">Sell her your catch</h3><p class="sub">She buys fresh fish for the fryer, up to ${CHIP_CAP} a day (${sold} so far today).</p>
    ${have.length ? `<ul class="hlist wlist">${have.map(id => `<li><span class="wpic">${icon(id, 26)}</span><span class="wtxt"><b>${esc((ITEMS[id] || {n: id}).n)}</b><small>You have ${F.inv[id]}.</small></span><button class="btn small alt" data-chipsell="${id}"${sold >= CHIP_CAP ? " disabled" : ""}>Sell for ${chipSell(id)}</button></li>`).join("")}</ul>` : `<p class="muted">Nothing in your backpack she can fry. Mackerel off the rocks is her favourite.</p>`}
    <div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
}
export function buyChips(F){
  if ((F.coins || 0) < CHIPS) return {line: `Fish and chips are ${CHIPS} coins.`};
  F.coins -= CHIPS;
  return {line: pick(["Hot chips and crisp battered cod, salt and vinegar, in paper. You eat them on the sea wall and fight off one very bold gull.", "A cone of chips, a piece of haddock, and a little wooden fork. The best thing you've eaten all week.", "Fish and chips, wrapped in paper, too hot to hold. You blow on every chip and burn your mouth anyway."]), ok: true};
}

/* ---------- the priory ruins (round 291) ---------- */
// Mel: "Yes build the ruins... Can I just have sage and lavender for the herbs though, the rest I can get at home". Behind
// the old press on the lower vineyard (once it's yours): a broken arch and the tumbled walls of the monks' herb garden.
// Restore it a step a day (coins only); then sage and Ma Ma's lavender to pick once a day, and a seat in the low sun.
export const RUIN_STEPS = [
  {n: "Clear the brambles", cost: 40, line: "A whole day with loppers and thick gloves. Under the brambles: the old garden walls, tumbled, and the arch standing on its own like it's been waiting."},
  {n: "Rebuild the wall", cost: 250, line: "A waller from over the hill spends the day fitting the old stones back together, dry, the way the monks did it. Not a drop of mortar."},
  {n: "Hang a gate", cost: 120, line: "A little oak gate in the gap at the front, with a latch that clicks. The garden feels like a garden again."},
  {n: "Plant sage and lavender", cost: 60, line: "Two rows of sage and two of lavender, the way a monks' garden would have had them. Hazel walks down to see and stands a long while under the arch. \"The brothers would be glad.\""}
];
export const ruinState = F => { const s = southState(F); return s.ruins = Object.assign({step: 0, day: "", picked: ""}, s.ruins || {}); };
export function ruinStep(F, day){
  const r = ruinState(F), st = RUIN_STEPS[r.step]; if (!st) return null;
  if (r.day === day) return {line: "That's enough for one day. The ruins have waited six hundred years; they can wait till tomorrow."};
  if ((F.coins || 0) < st.cost) return {line: `${st.n}: ${st.cost} coins.`};
  F.coins -= st.cost; r.step++; r.day = day; return {ok: true, done: r.step === RUIN_STEPS.length, line: st.line};
}
export function pickHerbs(F, day){
  const r = ruinState(F); if (r.step < RUIN_STEPS.length) return null; if (r.picked === day) return {line: "You've picked today. The sage needs a day to forgive you."};
  r.picked = day; F.inv = F.inv || {}; F.inv.sage = (F.inv.sage || 0) + 3; F.inv.bq_lavender = (F.inv.bq_lavender || 0) + 2;
  return {ok: true, line: "Three bunches of sage, soft and grey-green, and two of lavender. Your hands smell lovely for an hour."};
}
export const ruinSit = hm => hm >= 17*60 && hm < 20*60 ? "You sit on the warm wall. The low sun comes straight through the arch and lays a long golden doorway across the grass." : pick(["You sit on the wall among the sage and listen to the bees. Six hundred years of quiet, and it's still working.", "The cross and the vine are carved in the arch, worn soft. Someone's run their thumb over that a lot of times."]);
export function ruinsPanel(F, day){
  const r = ruinState(F), st = RUIN_STEPS[r.step], done = !st;
  const desc = ["Brambles over everything: a broken stone arch standing on its own, and the tumbled walls of what was the monks' herb garden.", "The brambles are gone. The old walls lie tumbled in the grass, and the arch stands over them.", "The walls are back up, dry stone, the monks' way. There's a gap at the front for a gate.", "Walls, a gate with a latch, and bare earth inside, waiting for the herbs.", "The priory garden: sage and lavender inside the old walls, the arch over the gate, bees everywhere."][r.step];
  let h = `<span class="tape stripe" aria-hidden="true"></span><h2>The priory ruins</h2><p class="sub">${desc}</p>`;
  if (!done) h += `<p class="sub">Next: <b>${st.n}</b>, ${st.cost} coins. One step a day.</p><div class="actions"><button class="btn primary" data-ruin="step"${(F.coins || 0) < st.cost || r.day === day ? " disabled" : ""}>${st.n} (${st.cost} coins)</button></div>`;
  else h += `<div class="actions"><button class="btn primary" data-ruin="pick"${r.picked === day ? " disabled" : ""}>${r.picked === day ? "Picked today" : "Pick sage and lavender"}</button></div>`;
  return h + `<div class="actions"><button class="btn alt" data-ruin="sit">Sit a while</button><button class="btn alt small" data-close="1">Close</button></div>`;
}

/* ---------- messages in bottles (round 288) ---------- */
// Every third day or so a bottle bobs in the shallows on one of the bottom-row beaches, from first light till dusk.
// Each one holds the next unread message (data/bottles.js); found ones go into the mailbox, already open, to reread.
const BOTTLE_X = {lighthouse: 380, stables: 300, green: 230, lowervine: 420};
export function bottleToday(F, day){
  const h = hsh(day + ":bottle"), s = southState(F); if (h % 3) return null;
  const b = s.bottles || {found: []}; if (b.day === day || b.found.length >= BOTTLES.length) return null;
  const scene = SOUTH_BEACH[hsh(day + ":where") % SOUTH_BEACH.length]; return {scene, x: BOTTLE_X[scene], y: 606};
}
export function pickBottle(F, day, at){
  const s = southState(F), b = s.bottles = s.bottles || {found: []}; if (!bottleToday(F, day)) return null;
  const left = BOTTLES.map((_, i) => i).filter(i => !b.found.some(f => f.i === i)), i = left[hsh(day + ":which") % left.length];
  b.day = day; b.found.push({i, at});
  return {i, ...BOTTLES[i], after: BOTTLE_AFTER[i] || ""};
}
export const bottleTitle = m => m.kind === "poem" ? "A poem in a bottle" : m.kind === "kind" ? "A kind word in a bottle" : "A letter in a bottle";
export const bottleBody = m => `${m.date}\n\n${m.text}${m.from ? `\n\n${m.from}` : ""}`;
// the mailbox keeps them (core.js marks them read when found)
export const bottleMail = F => ((F.south && F.south.bottles && F.south.bottles.found) || []).map(f => ({id: "bottle-" + f.i, from: "postie", at: f.at, title: bottleTitle(BOTTLES[f.i]) + ", washed up " + new Date(f.at).toLocaleDateString("en-GB", {day: "numeric", month: "long"}), body: bottleBody(BOTTLES[f.i])}));
export function bottlePanel(m){
  return `<span class="tape stripe" aria-hidden="true"></span><h2>${esc(bottleTitle(m))}</h2><p class="sub">You work the cork out and shake the little roll of paper free. It's dry inside.</p>
    <div class="bottlenote"><p class="muted" style="text-align:right">${esc(m.date)}</p>${m.text.split("\n\n").map(p => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`).join("")}${m.from ? `<p style="text-align:right"><i>${esc(m.from)}</i></p>` : ""}</div>
    ${m.after ? `<p class="sub">${esc(m.after)}</p>` : ""}<p class="muted">You keep it. It's in your mailbox to read again.</p><div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
}

/* ---------- beachcombing (round 278) ---------- */
// Each day a couple of things wash up on each bottom-row beach, in different spots: shells (now and then a conch),
// clams and mussels. Tap one to pick it up; it's gone till tomorrow's tide brings more.
export const BEACH_SPOTS = {lighthouse: [130, 182, 352, 452, 492], stables: [56, 132, 206, 300, 420], green: [56, 140, 300, 420, 486], lowervine: [150, 220, 380, 456, 496]};
const BEACH_Y = {lighthouse: 580, stables: 584, green: 580, lowervine: 580};
export function beachFinds(F, scene, day){
  const xs = BEACH_SPOTS[scene]; if (!xs) return [];
  const got = (((F.south || {}).beach || {})[day]) || [];
  return some(xs.map(String), 2, day + ":beach:" + scene).map(x => { const k = scene + ":" + x, h = hsh(day + k) % 20;
    return {k, x: +x, y: BEACH_Y[scene], id: h === 0 ? "b_conch" : h < 9 ? "b_shell" : h < 15 ? "clams" : "mussels"}; }).filter(f => !got.includes(f.k));
}
export function pickBeach(F, scene, k, day){
  const f = beachFinds(F, scene, day).find(x => x.k === k); if (!f) return null;
  const s = southState(F); s.beach = s.beach && s.beach[day] ? s.beach : {[day]: []}; s.beach[day].push(k);
  const n = f.id === "clams" ? 2 : 1; F.inv = F.inv || {}; F.inv[f.id] = (F.inv[f.id] || 0) + n;
  const line = {b_shell: "A seashell, ribbed and pink inside. Into your pocket it goes.", b_conch: "A spiral conch! You almost never find these here. You hold it to your ear: the sea.", clams: "You dig your fingers into the wet sand and come up with a couple of clams. Four make clams with garlic and lemon at the kitchen.", mussels: "A cluster of mussels on a rock, blue-black and shining. You twist off a bagful: two make Rosa's stuffed mussels at the kitchen."}[f.id];
  return {id: f.id, n, line};
}

/* ---------- the paddock panel ---------- */
const hearts = n => "♥".repeat(Math.ceil(n/2)) + "♡".repeat(Math.max(0, TRUST_MAX/2 - Math.ceil(n/2)));
export function paddockPanel(F, day){
  const s = southState(F), t = ponyTreat(F);
  const mine = s.mine ? s.mine.name : "";
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>The paddock</h2><p class="sub">${mine ? `Biscuit, Pebble and your own ${esc(mine)}.` : "Two ponies, Biscuit and Pebble."} A treat and a brush each day and they'll get to know you. ${t ? `You've got ${t === "apple" ? "an apple" : "a carrot"} in your backpack.` : "Bring an apple or a carrot."}</p><ul class="hlist wlist">`;
  for (const id of ponyIds(F)) { const P = ponyOf(F, id), p = s.ponies[id];
    h += `<li><span class="wtxt"><b>${esc(P.n)}</b><small>A ${esc(P.coat)} pony. Loves ${P.like === "apple" ? "apples" : "carrots"}. <span aria-label="${p.trust} of ${TRUST_MAX}">${hearts(p.trust)}</span></small>
      <span class="actions" style="margin-top:6px"><button class="btn small ${p.fed === day ? "alt" : "primary"}" data-pony="feed:${id}"${p.fed === day ? " disabled" : ""}>${p.fed === day ? "Fed" : "Give a treat"}</button>
      <button class="btn small ${p.brushed === day ? "alt" : "primary"}" data-pony="brush:${id}"${p.brushed === day ? " disabled" : ""}>${p.brushed === day ? "Brushed" : "Brush"}</button></span></span></li>`; }
  return h + `</ul><p class="muted">Once Pebble knows you (${RIDE_TRUST} hearts' worth), Evan can have a ride round the sand ring, ${RIDE_COST} coins.</p><div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
}

/* ---------- who's about on the bottom row (round 265, Mel: "change some of the villagers' schedules so they're also moving around those screens") ---------- */
const hsh = s => { let h = 0; for (const c of s) h = (h*31 + c.charCodeAt(0)) >>> 0; return h; };
// a steady handful from a pool, different each day (or week)
const some = (pool, n, key) => pool.map(id => [id, hsh(key + id)]).sort((a, b) => a[1] - b[1]).slice(0, n).map(x => x[0]);
const W = (from, to, scene, wander, act) => ({from, to, scene, wander, ...(act ? {act} : {})});
const BAND_POOL = ["hana", "juniper", "opal", "theo", "farid", "mei", "amara", "lila", "noor", "sofia"];
const CRICKET_POOL = ["bo", "theo", "farid", "noor", "juniper", "lila", "felix", "wren"];
const WALK_POOL = ["hana", "opal", "mei", "amara", "sofia", "elena", "bo", "noor"];
const BAND_LAWN = [[290, 300], [340, 296], [420, 300], [460, 288], [320, 330], [400, 326]];
const CRICKET_LAWN = [[300, 440], [360, 470], [420, 500], [330, 520], [400, 430], [290, 500]];
const CLIFF_WALK = [[200, 300], [300, 380], [380, 330], [250, 420], [180, 260]];
export function southSlot(id, day, t, F){
  const dw = dow(day), we = dw === 0 || dw === 6, ev = eventSlotSouth(id, day, t); if (ev) return ev;
  if (dw === BAND.dow && t >= BAND.from && t < BAND.to && some(BAND_POOL, 6, day + ":band").includes(id)) return W(BAND.from, BAND.to, "green", BAND_LAWN);
  if (dw === CRICKET.dow && t >= CRICKET.from && t < CRICKET.to && some(CRICKET_POOL, 6, day + ":cricket").includes(id)) return W(CRICKET.from, CRICKET.to, "green", CRICKET_LAWN);
  // Gong Gong's allotment, Tuesday and Thursday mornings; Mei's on Saturdays
  if (id === "gonggong" && (dw === 2 || dw === 4) && t >= 7*60 + 30 && t < 9*60 + 30) return W(7*60 + 30, 9*60 + 30, "allotment", [[244, 214], [200, 270], [120, 270]], "farm");
  if (id === "mei" && dw === 6 && t >= 9*60 && t < 11*60) return W(9*60, 11*60, "allotment", [[276, 214], [330, 270], [420, 270]], "farm");
  // a stable hand: Lila mucks out and turns the ponies out first thing, weekdays
  if (id === "lila" && !we && t >= 7*60 && t < 8*60 + 30) return W(7*60, 8*60 + 30, "stables", [[260, 300], [300, 320], [214, 420], [180, 300]], "farm");
  // Marco and Ines tend the lower rows too, once they're yours (round 282: until then they're Bram's, gone to grass)
  const lowerYours = !F || !!(F.vine && F.vine.lower);
  if (id === "ines" && lowerYours && dw !== 0 && t >= 14*60 && t < 15*60) return W(14*60, 15*60, "lowervine", [[262, 268], [340, 350], [418, 432], [300, 514]], "water");
  if (id === "marco" && lowerYours && dw !== 0 && t >= 15*60 && t < 16*60) return W(15*60, 16*60, "lowervine", [[262, 268], [340, 350], [418, 432], [300, 514]], "farm");
  // walks out to the lighthouse: a couple at weekends after breakfast, and someone most evenings
  if (we && t >= 9*60 && t < 10*60 + 30 && some(WALK_POOL, 2, day + ":lhm").includes(id)) return W(9*60, 10*60 + 30, "lighthouse", CLIFF_WALK);
  if (t >= 18*60 && t < 19*60 && some(WALK_POOL, 1, day + ":lhe").includes(id)) return W(18*60, 19*60, "lighthouse", CLIFF_WALK);
  return null;
}

/* ---------- the car boot sale and the lamp lighting (round 271, Mel: "Car boot sale and lamp lighting") ---------- */
// Sunday mornings, 8 till 12, on the green: two cars with their boots open and a trestle table. Four curios each week,
// different every Sunday; keepsakes for the shelves at home, a few coins each. Buy each one once.
export const BOOT = {dow: 0, from: 8*60, to: 12*60};
export const bootNow = (day, hm) => dow(day) === BOOT.dow && hm >= BOOT.from && hm < BOOT.to;

const CB_IDS = Object.keys(CARBOOT);
// this Sunday's four (the same all morning, different next week)
export function bootFinds(day){ return some(CB_IDS, 4, "boot:" + day); }
// round 275: the story finds. Now and then (once each, in turn) something at the sale belongs to somebody's story;
// it turns up once that villager has told enough, and stays on the table each Sunday till Mel buys it
export const STORY_FINDS = [
  {key: "tin", item: "s_tin", price: 8, who: "celeste", heard: 2, n: "An old chocolate tin", line: "A battered red tin with gold holly on the lid, and on the bottom, faintly: Marchand et Fille."},
  {key: "seal", item: "s_seal", price: 8, who: "hazel", heard: 7, n: "A brass wax seal", line: "A heavy little brass seal. Pressed into the wax on the tray beside it: a cross, and a vine."},
  {key: "railkey", item: "s_railkey", price: 6, who: "ines", heard: 7, n: "An old iron key", line: "A big iron key, the kind for a railway signal box, with a letter R worked into the bow."},
  {key: "notebook", item: "s_notebook", price: 4, who: "juniper", heard: 6, n: "A child's notebook", line: "A little notebook with a pony on the cover, full of drawings and poems in a twelve-year-old's handwriting."}
];
export function storyFind(F){
  const s = southState(F), found = s.finds || {}, heard = id => (((F.story || {}).heard || {})[id] || 0);
  return STORY_FINDS.find(f => !found[f.key] && heard(f.who) >= f.heard) || null;
}
export function buyFind(F, id, day){
  const sf = STORY_FINDS.find(f => f.key === id), s0 = southState(F);
  if (sf) { if (!bootNow(day, 9*60) || storyFind(F) !== sf) return null; if ((F.coins || 0) < sf.price) return {line: `That's ${sf.price} coins.`};
    F.coins -= sf.price; s0.finds = s0.finds || {}; s0.finds[sf.key] = day; F.inv = F.inv || {}; F.inv[sf.item] = (F.inv[sf.item] || 0) + 1;
    return {ok: true, story: true, line: `"That old thing? ${sf.price} coins, love." You can't quite believe your luck.`}; }
  const it = CARBOOT[id], s = southState(F); if (!it || !bootFinds(day).includes(id)) return null;
  s.boot = s.boot && s.boot.day === day ? s.boot : {day, got: []};
  if (s.boot.got.includes(id)) return {line: "You've already bought that one."};
  if ((F.coins || 0) < it.price) return {line: `That's ${it.price} coins.`};
  F.coins -= it.price; s.boot.got.push(id); F.inv = F.inv || {}; F.inv[id] = (F.inv[id] || 0) + 1;
  return {ok: true, line: pick([`"${it.n}? ${it.price} coins to you." Wrapped in yesterday's Gazette.`, `You haggle a little, out of politeness. ${it.price} coins, and a smile.`, `"Oh, that was my nan's. She'd love it going to a good home." ${it.price} coins.`])};
}
export function bootPanel(F, day){
  const s = southState(F), got = s.boot && s.boot.day === day ? s.boot.got : [];
  return `<span class="tape gingham" aria-hidden="true"></span><h2>The car boot sale</h2><p class="sub">Two car boots and a trestle table on the green. Everything's a few coins; most of it's wonderful.</p><ul class="hlist wlist">${(() => { const sf = storyFind(F); return sf ? `<li><span class="wpic">${icon(sf.item, 28)}</span><span class="wtxt"><b>${esc(sf.n)}</b><small>${esc(sf.line)}</small></span><button class="btn small primary" data-boot="${sf.key}"${(F.coins || 0) < sf.price ? " disabled" : ""}>${sf.price} coins</button></li>` : ""; })()}${bootFinds(day).map(id => { const it = CARBOOT[id], had = got.includes(id);
    return `<li><span class="wpic">${icon(id, 28)}</span><span class="wtxt"><b>${esc(it.n)}</b><small>${esc(it.line)}</small></span><button class="btn small ${had ? "alt" : "primary"}" data-boot="${id}"${had || (F.coins || 0) < it.price ? " disabled" : ""}>${had ? "Yours" : it.price + " coins"}</button></li>`; }).join("")}</ul>
    <p class="muted">Keepsakes: put them on a shelf at home from your backpack.</p><div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
}
// Monday evenings: the lamp lighting. Half the village walks down to Lighthouse Point to watch Bram light the lamp.
export const LAMP = {dow: 1, from: 18*60 + 30, to: 19*60 + 30, lit: 19*60};
export const lampNow = (day, hm) => dow(day) === LAMP.dow && hm >= LAMP.from && hm < LAMP.to;
export function lampLighting(F, day, hm){
  const s = southState(F), first = s.lamp !== day; s.lamp = day;
  if (hm < LAMP.lit) return {line: "Everyone's gathered at the foot of the lighthouse, hands in pockets, waiting. Bram's up the stairs. A hush, then a little cheer when his torch shows in the lamp room window.", first};
  return {line: pick(["The lamp catches, the great lens starts to turn, and the beam sweeps out over the sea. Everyone cheers, as if it's the first time. Bram waves from the gallery.", "Click, a flicker, then the light, steady and gold, turning out over the water. Somebody starts clapping and everyone joins in."]), first};
}
const LAMP_POOL = ["hana", "juniper", "opal", "theo", "farid", "mei", "amara", "noor", "sofia", "felix", "elena", "wren"];
const BOOT_POOL = ["hana", "opal", "mei", "amara", "sofia", "theo", "noor", "juniper"];
export function eventSlotSouth(id, day, t){
  if (lampNow(day, t) && some(LAMP_POOL, 7, day + ":lamp").includes(id)) return W(LAMP.from, LAMP.to, "lighthouse", [[200, 470], [250, 440], [300, 470], [230, 500], [280, 420]]);
  if (bootNow(day, t) && some(BOOT_POOL, 5, day + ":boot").includes(id)) return W(BOOT.from, BOOT.to, "green", [[290, 400], [340, 396], [400, 402], [360, 410]]);
  return null;
}


/* ---------- the sea cave (round 274): below the lighthouse, through the sea door at low tide ---------- */
export function seaCavePanel(F){
  const s = southState(F), got = !!s.cavebottle;
  const pic = `<svg viewBox="0 0 300 150" width="100%" style="max-width:340px;display:block;margin:6px auto 10px" aria-hidden="true"><g filter="url(#wob)" style="stroke:#3b3530" stroke-width="1.3">
    <rect width="300" height="150" fill="#3E4A55"/><path d="M0 150 V60 Q40 10 150 8 Q260 10 300 60 V150z" fill="#5B6772"/><path d="M0 150 V96 Q150 70 300 96 V150z" fill="#4F8FA8"/><path d="M20 120 q10 -4 20 0 M120 128 q10 -4 20 0 M220 118 q10 -4 20 0" fill="none" stroke="#DCEFF5"/>
    <path d="M200 96 l12 -16 h16 l12 -16 h16 l12 -16" fill="none" stroke="#B9B0A4" stroke-width="5"/><path d="M118 40 v26 M108 50 h20" stroke="#E8D9B0" stroke-width="2.4"/><path d="M128 64 q8 -6 14 2 q-6 6 -14 -2z" fill="#9CC27E"/>
    <rect x="44" y="52" width="34" height="26" rx="4" fill="#2E3740"/>${got ? "" : `<path d="M58 76 v-14 h6 v14z" fill="#3A1428"/>`}<circle cx="150" cy="30" r="3" fill="#FFE9A0" opacity=".7"/></g></svg>`;
  return `<span class="tape gingham" aria-hidden="true"></span><h2>The sea cave</h2>${pic}<p class="sub">Through the sea door, under the headland. Green light off the water, the sound of the tide in the rock. Worn stone steps climb away into the dark: the end of the monks' passage.</p>
    <div class="actions" style="flex-wrap:wrap"><button class="btn alt" data-sea="carving">The carving</button><button class="btn alt" data-sea="steps">The old steps</button><button class="btn ${got ? "alt" : "primary"}" data-sea="niche">The niche in the rock</button></div><div class="actions"><button class="btn alt small" data-close="1">Back out at low tide</button></div>`;
}
export function seaCave(F, what){
  const s = southState(F);
  if (what === "carving") return {line: "Cut deep into the rock, worn soft by the sea: a cross, and a vine curling round it. The same mark as on the old press, the flask, and the seal."};
  if (what === "steps") return {line: "You climb a little way. The steps go up and up into the dark, towards the bay and the Scoop Shack, and the cellar beyond. The monks rolled their barrels down here to the boats. You turn back before your candle does."};
  if (what === "niche") { if (s.cavebottle) return {line: "The niche is empty now. You've the bottle at home."};
    s.cavebottle = true; F.inv = F.inv || {}; F.inv.s_priorybottle = (F.inv.s_priorybottle || 0) + 1;
    return {ok: true, line: "In a niche cut into the rock, behind a curtain of weed: one squat dark bottle, still corked, still sealed. The last of the brothers' wine, waiting six hundred years for somebody to come back for it."}; }
  return null;
}
