// The bottom row of the village (rounds 262 to 264, the creator: "I want the game to become a 4 by 4 screen"): Honeybrook
// Green (south of home), the Stables (south of the orchard) and Lighthouse Point (south of the flower farm, where the
// coast path ends). Small, calm things to do; nothing here is a way to make money. State: F.south.
import { pick } from "../util.js";
import { CARBOOT } from "../data/carboot.js";
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
  if ((F.coins || 0) < DUCK_FOOD) return {line: "A scoop of duck food from the honesty tin is a coin. You've nothing on you."};
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

/* ---------- The Stables ---------- */
export const PONIES = {biscuit: {n: "Biscuit", coat: "chestnut", like: "apple"}, pebble: {n: "Pebble", coat: "dapple grey", like: "carrot"}};
export const TRUST_MAX = 10, RIDE_TRUST = 3, RIDE_COST = 15;
// round 270 (the creator: "Yes to pony"): a pony of your own, named by you, bought at the stable block; she lives in the
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
// a pony ride round the sand ring on Pebble (she's the steady one), once a day
export function ponyRide(F, day){
  const s = southState(F), p = s.ponies.pebble;
  if (p.trust < RIDE_TRUST) return {line: `Pebble doesn't know you well enough yet. A few days of treats and brushing first (${p.trust} of ${RIDE_TRUST}).`};
  if (s.ride === day) return {line: "You've had your ride today. Pebble's having a well-earned doze in the shade."};
  if ((F.coins || 0) < RIDE_COST) return {line: `A pony ride is ${RIDE_COST} coins.`};
  F.coins -= RIDE_COST; s.ride = day;
  return {line: "You sit up very straight in the saddle, both hands on the strap, and Pebble walks you round the ring twice, slow and careful.", ok: true};
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
  if (!s.flask && F.passage && F.passage.step >= 5 && heard("bram") >= 2) { s.flask = day; F.inv = F.inv || {}; F.inv.s_flask = (F.inv.s_flask || 0) + 1;
    return {flask: true, line: "Wedged between two rocks in the deepest pool: a stoneware flask, sealed with wax, a little cross and a vine stamped on its side. You lift it out, dripping. Hazel will want to see this."}; }
  if (((F.story || {}).flags || {}).seacave) return {cave: true, line: "Behind the rock pools, where Bram said: a low arch in the rock, only above water at low tide. The sea door."};
  return {line: `You crouch over the rock pools. In the clearest one: ${pick(POOLS)}.`};
}
// low tide in the morning and early evening (a simple daily rhythm, not the real tides)
export const tideAt = hm => (hm >= 6*60 && hm < 11*60) || (hm >= 17*60 && hm < 20*60) ? "low" : "high";
export function buyChips(F){
  if ((F.coins || 0) < CHIPS) return {line: `Fish and chips are ${CHIPS} coins.`};
  F.coins -= CHIPS;
  return {line: pick(["Hot chips and crisp battered cod, salt and vinegar, in paper. You eat them on the sea wall and fight off one very bold gull.", "A cone of chips, a piece of haddock, and a little wooden fork. The best thing you've eaten all week.", "Fish and chips, wrapped in paper, too hot to hold. You blow on every chip and burn your mouth anyway."]), ok: true};
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
  return h + `</ul><p class="muted">Once Pebble knows you (${RIDE_TRUST} hearts' worth), you can have a ride round the sand ring, ${RIDE_COST} coins.</p><div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
}

/* ---------- who's about on the bottom row (round 265, the creator: "change some of the villagers' schedules so they're also moving around those screens") ---------- */
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
export function southSlot(id, day, t){
  const dw = dow(day), we = dw === 0 || dw === 6, ev = eventSlotSouth(id, day, t); if (ev) return ev;
  if (dw === BAND.dow && t >= BAND.from && t < BAND.to && some(BAND_POOL, 6, day + ":band").includes(id)) return W(BAND.from, BAND.to, "green", BAND_LAWN);
  if (dw === CRICKET.dow && t >= CRICKET.from && t < CRICKET.to && some(CRICKET_POOL, 6, day + ":cricket").includes(id)) return W(CRICKET.from, CRICKET.to, "green", CRICKET_LAWN);
  // Mr Okada's allotment, Tuesday and Thursday mornings; Mei's on Saturdays
  if (id === "okada" && (dw === 2 || dw === 4) && t >= 7*60 + 30 && t < 9*60 + 30) return W(7*60 + 30, 9*60 + 30, "green", [[70, 222], [110, 230], [150, 214]], "farm");
  if (id === "mei" && dw === 6 && t >= 9*60 && t < 11*60) return W(9*60, 11*60, "green", [[70, 222], [110, 230], [150, 214]], "farm");
  // a stable hand: Lila mucks out and turns the ponies out first thing, weekdays
  if (id === "lila" && !we && t >= 7*60 && t < 8*60 + 30) return W(7*60, 8*60 + 30, "stables", [[260, 300], [300, 320], [214, 420], [180, 300]], "farm");
  // Marco and Ines tend the lower rows too
  if (id === "ines" && dw !== 0 && t >= 14*60 && t < 15*60) return W(14*60, 15*60, "lowervine", [[262, 268], [340, 350], [418, 432], [300, 514]], "water");
  if (id === "marco" && dw !== 0 && t >= 15*60 && t < 16*60) return W(15*60, 16*60, "lowervine", [[262, 268], [340, 350], [418, 432], [300, 514]], "farm");
  // walks out to the lighthouse: a couple at weekends after breakfast, and someone most evenings
  if (we && t >= 9*60 && t < 10*60 + 30 && some(WALK_POOL, 2, day + ":lhm").includes(id)) return W(9*60, 10*60 + 30, "lighthouse", CLIFF_WALK);
  if (t >= 18*60 && t < 19*60 && some(WALK_POOL, 1, day + ":lhe").includes(id)) return W(18*60, 19*60, "lighthouse", CLIFF_WALK);
  return null;
}

/* ---------- the car boot sale and the lamp lighting (round 271, the creator: "Car boot sale and lamp lighting") ---------- */
// Sunday mornings, 8 till 12, on the green: two cars with their boots open and a trestle table. Four curios each week,
// different every Sunday; keepsakes for the shelves at home, a few coins each. Buy each one once.
export const BOOT = {dow: 0, from: 8*60, to: 12*60};
export const bootNow = (day, hm) => dow(day) === BOOT.dow && hm >= BOOT.from && hm < BOOT.to;

const CB_IDS = Object.keys(CARBOOT);
// this Sunday's four (the same all morning, different next week)
export function bootFinds(day){ return some(CB_IDS, 4, "boot:" + day); }
// round 275: the story finds. Now and then (once each, in turn) something at the sale belongs to somebody's story;
// it turns up once that villager has told enough, and stays on the table each Sunday till you buy it
export const STORY_FINDS = [
  {key: "tin", item: "s_tin", price: 8, who: "celeste", heard: 2, n: "An old chocolate tin", line: "A battered red tin with gold holly on the lid, and on the bottom, faintly: Marchand et Fille."},
  {key: "seal", item: "s_seal", price: 8, who: "hazel", heard: 7, n: "A brass wax seal", line: "A heavy little brass seal. Pressed into the wax on the tray beside it: a cross, and a vine."},
  {key: "railkey", item: "s_railkey", price: 6, who: "ines", heard: 7, n: "An old iron key", line: "A big iron key, the kind for a railway signal box, with a letter R worked into the bow."},
  {key: "notebook", item: "s_notebook", price: 4, who: "juniper", heard: 7, n: "A child's notebook", line: "A little notebook with a pony on the cover, full of drawings and poems in a twelve-year-old's handwriting."}
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
