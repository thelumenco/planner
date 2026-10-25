// The bottom row of the village (rounds 262 to 264, the creator: "I want the game to become a 4 by 4 screen"): Honeybrook
// Green (south of home), the Stables (south of the orchard) and Lighthouse Point (south of the flower farm, where the
// coast path ends). Small, calm things to do; nothing here is a way to make money. State: F.south.
import { pick } from "../util.js";

export const southState = F => { F.south = F.south || {}; const s = F.south;
  s.ponies = s.ponies || {}; for (const id of Object.keys(PONIES)) s.ponies[id] = Object.assign({trust: 0, fed: "", brushed: ""}, s.ponies[id] || {});
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
const TREATS = ["apple", "carrot"];
export const ponyTreat = F => TREATS.find(t => (F.inv || {})[t] > 0) || null;
// feed a pony a treat from the backpack (once a day each); the one it likes best counts double
export function feedPony(F, id, day){
  const s = southState(F), p = s.ponies[id], P = PONIES[id]; if (!p) return null;
  if (p.fed === day) return {line: `${P.n} has had a treat today. She noses your pocket anyway, just in case.`};
  const t = ponyTreat(F); if (!t) return {line: `${P.n} would love an apple or a carrot. The orchard and the garden have both.`};
  F.inv[t]--; if (F.inv[t] <= 0) delete F.inv[t]; p.fed = day; p.trust = Math.min(TRUST_MAX, p.trust + (t === P.like ? 2 : 1));
  return {line: t === P.like ? `${P.n} crunches the ${t} with her eyes half closed. Her favourite.` : `${P.n} takes the ${t} very politely, lips first, and crunches it slowly.`, ok: true};
}
export function brushPony(F, id, day){
  const s = southState(F), p = s.ponies[id], P = PONIES[id]; if (!p) return null;
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

/* ---------- Lighthouse Point ---------- */
export const CHIPS = 9;
export function climb(F, day, hm){
  const s = southState(F), night = hm >= 19*60 || hm < 6*60;
  if (night) return {line: "Up the spiral stairs to the lamp room. The great lens turns slowly, throwing its light out over the dark water, and somewhere out there a boat flashes back."};
  const first = s.climb !== day; s.climb = day;
  return {line: pick(["A hundred and eight steps, round and round. At the top, the whole coast: the bay, the shore, the flower fields, and the sea going on for ever.", "From the gallery you can see Honeybrook laid out like a map: the orchard, the green, the vines, and the smoke from your own chimney.", "The wind up here takes your breath away. Gulls hang level with you, not flapping at all."]), first};
}
const POOLS = ["a hermit crab trying on a new shell", "a starfish the colour of a sunset", "a tiny fish that darts under a rock", "a sea anemone, closing up when you touch the water", "a crab scuttling sideways, very offended", "a periwinkle, slowly going somewhere"];
export function rockPools(F, day, tide){
  if (tide === "high") return {line: "The tide's in, and the rock pools are under the sea. Come back when it's out."};
  const s = southState(F); s.pools = day;
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
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const hearts = n => "♥".repeat(Math.ceil(n/2)) + "♡".repeat(Math.max(0, TRUST_MAX/2 - Math.ceil(n/2)));
export function paddockPanel(F, day){
  const s = southState(F), t = ponyTreat(F);
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>The paddock</h2><p class="sub">Two ponies, Biscuit and Pebble. A treat and a brush each day and they'll get to know you. ${t ? `You've got ${t === "apple" ? "an apple" : "a carrot"} in your backpack.` : "Bring an apple or a carrot."}</p><ul class="hlist wlist">`;
  for (const [id, P] of Object.entries(PONIES)) { const p = s.ponies[id];
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
  const dw = dow(day), we = dw === 0 || dw === 6;
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
