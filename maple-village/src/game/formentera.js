// Formentera's rooms and things to join in with (rounds 232 to 234). The shops sell TOWN_GOODS (the shared data-rbuy
// buttons). Things to take part in, each more than a speech bubble:
//   raking salt at the pans with Toni in the harvest (July to September): rake the crystals into a pyramid, skim the
//   flor de sal off the top, into a jar (the first is yours to keep; two jars of flor de sal for the kitchen each day);
//   snorkelling the seagrass off Ses Illetes (once a day: three sightings, a fish card of eight to fill);
//   hiring bikes at Joan's and riding the Green Route to La Mola (you and the family, 3 coins a bike);
//   the hippy market at La Mola (Wednesdays and Sundays, May to October);
//   the three lighthouses: a stamp at the harbour light, Cap de Barbaria and La Mola; all three, a painted lighthouse.
// State: F.formentera = {raked (day), myflor, snorkel (day), seen: {creature: day}, stamps: {harbour, barbaria, mola},
//   lighthouse, rides, treats}
import { esc, dayKey } from "../util.js";
import { icon } from "../art/icons.js";
import { TOWN_GOODS } from "../data/towns.js";
import { saltOn, marketOn } from "../data/formentera.js";

export function fmState(F){ F.formentera = F.formentera || {}; const c = F.formentera; c.seen = c.seen || {}; c.stamps = c.stamps || {}; return c; }
const shut = `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
const coin = () => icon("coin", 13);
const goods = shop => Object.keys(TOWN_GOODS).filter(id => TOWN_GOODS[id].shop === shop);
const row = (F, id) => { const g = TOWN_GOODS[id], have = (F.inv || {})[id] || 0;
  return `<li><span class="wpic">${icon(id, 28)}</span><span class="wtxt"><b>${esc(g.n)}</b><small>${esc(g.what || g.say || g.line || "")}${have ? ` (${have} in your backpack)` : ""}${g.kind === "keepsake" ? " · a keepsake for a shelf" : ""}</small></span><button class="btn small primary" data-rbuy="${id}" ${F.coins >= g.price ? "" : "disabled"}>${g.price} ${coin()}</button></li>`; };
const list = (F, shop, title) => { const ids = goods(shop); return ids.length ? `${title ? `<h3 class="ph3">${esc(title)}</h3>` : ""}<ul class="hlist wlist">${ids.map(id => row(F, id)).join("")}</ul>` : ""; };
const treats = (F, menu, act) => `<ul class="hlist wlist">${Object.entries(menu).map(([k, [n, p, l]]) => `<li><span class="wtxt"><b>${esc(n)}</b><small>${esc(l)}</small></span><button class="btn small primary" data-fm="${act}:${k}" ${F.coins >= p ? "" : "disabled"}>${p} ${coin()}</button></li>`).join("")}</ul>`;
export function treat(F, menu, k){ const t = menu[k]; if (!t || F.coins < t[1]) return null; F.coins -= t[1]; const c = fmState(F); c.treats = (c.treats || 0) + 1; return t; }

/* ---------- the three lighthouses ---------- */
export const LIGHTS = {harbour: "The harbour light at La Savina", barbaria: "Cap de Barbaria", mola: "La Mola"};
// stamp one -> {k, name, n, all} the first time, else null
export function stamp(F, k, addInv){
  const c = fmState(F); if (!LIGHTS[k] || c.stamps[k]) return null; c.stamps[k] = dayKey();
  const n = Object.keys(LIGHTS).filter(x => c.stamps[x]).length, all = n === 3; if (all && !c.lighthouse) { c.lighthouse = dayKey(); addInv("fm_lighthouse", 1); }
  return {k, name: LIGHTS[k], n, all};
}
const stampLine = F => { const c = fmState(F); return `<p class="muted">Your lighthouse stamps: ${Object.keys(LIGHTS).map(k => `${c.stamps[k] ? "✓" : "○"} ${esc(LIGHTS[k])}`).join(" · ")}${c.lighthouse ? ". All three: the painted lighthouse is yours." : ""}</p>`; };

/* ---------- raking salt with Toni ---------- */
export const RAKE = {RAKE: 4, SKIM: 2, flor: 2};
export const rakeStart = () => ({rake: 0, skim: 0});
export function rakeStep(st, what){
  if (what === "rake") { if (st.rake >= RAKE.RAKE) return false; st.rake++; return true; }
  if (what === "skim") { if (st.rake < RAKE.RAKE || st.skim >= RAKE.SKIM) return false; st.skim++; return true; }
  return false; }
export const rakeDone = st => st.skim >= RAKE.SKIM;
export function finishRake(F, st, addInv){ const c = fmState(F); if (!rakeDone(st) || c.raked === dayKey()) return null; c.raked = dayKey();
  addInv("flordesal", RAKE.flor); const first = !c.myflor; if (first) { c.myflor = dayKey(); addInv("fm_myflor", 1); } return {first}; }
export function rakePanel(F, st, {day, evan, here}){
  const c = fmState(F);
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>The salt pans</h2><p class="sub">Shallow pools in a chequerboard, pink and silver, the sea let in and the sun left to do the rest. Toni leans on his long wooden rake.</p>`;
  if (!saltOn(day)) return h + `<p class="muted">The pans are flooded and quiet till the harvest in July. ${here ? "Toni shows you the salt store instead: white hills of last summer's salt under a tin roof. \"My grandfather raked these same pans. So did his.\"" : "Toni will be back for the harvest."}</p>` + shut;
  if (c.raked === day) return h + `<p class="muted">You've raked your pan for today. Toni's still going, slow and steady, singing under his breath.</p>` + shut;
  if (!here) return h + `<p class="muted">The harvest's on, but Toni's not at the pans just now.</p>` + shut;
  if (!st) return h + `<p class="muted">"Want to try? Rake it into a pyramid, then we skim the flor de sal, the flower of the salt, the fine crust from the top. That's the treasure."${evan ? " Evan is given a tiny rake and a very serious face." : ""}</p><div class="actions"><button class="btn primary" data-fm="rake">Take the rake</button></div>` + shut;
  if (st.rake < RAKE.RAKE) return h + `<p class="muted">Drag the crystals in towards the middle, crunch, crunch: ${st.rake}/${RAKE.RAKE}. The pyramid grows.</p><div class="actions"><button class="btn primary big" data-fm="rakeit">Rake</button></div>` + shut;
  if (st.skim < RAKE.SKIM) return h + `<p class="muted">Now gently, with the flat little skimmer, lift the flakes from the top: ${st.skim}/${RAKE.SKIM}.</p><div class="actions"><button class="btn primary big" data-fm="skim">Skim</button></div>` + shut;
  return h + `<p class="muted">Toni tips your flakes into a jar and screws the lid on. "Flor de sal. Only the sun and the wind made this. And you."</p><div class="actions"><button class="btn primary" data-fm="rakedone">Take your salt</button></div>` + shut;
}

/* ---------- snorkelling the seagrass ---------- */
export const SEA = {starfish: "a red starfish", octopus: "an octopus tucked in a crack", wrasse: "a rainbow wrasse", pinna: "a giant fan mussel standing up in the seagrass", turtle: "a loggerhead turtle, slowly", bream: "a shoal of silver bream", seahorse: "a tiny seahorse", ray: "an eagle ray, flying"};
export const SNORKEL_LOOKS = 3;
export const snorkelStart = (F, day) => { const ks = Object.keys(SEA), h = [...day].reduce((a, ch) => a*31 + ch.charCodeAt(0) >>> 0, 7), pick = []; for (let i = 0; pick.length < SNORKEL_LOOKS; i++) { const k = ks[(h + i*5) % ks.length]; if (!pick.includes(k)) pick.push(k); } return {pick, i: 0}; };
export function snorkelLook(F, st){ if (st.i >= st.pick.length) return null; const k = st.pick[st.i++], c = fmState(F), fresh = !c.seen[k]; c.seen[k] = c.seen[k] || dayKey(); return {k, what: SEA[k], fresh}; }
export function finishSnorkel(F){ const c = fmState(F); if (c.snorkel === dayKey()) return null; c.snorkel = dayKey(); return Object.keys(c.seen).length; }
export function snorkelPanel(F, st, day, evan){
  const c = fmState(F), n = Object.keys(c.seen).length;
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>The seagrass meadows</h2><p class="sub">Water so clear the boats look like they're floating in air. Underneath, long green ribbons of posidonia sway, and the whole meadow hums with life.</p>`;
  const card = `<p class="muted">Your fish card: ${n} of ${Object.keys(SEA).length}. ${Object.keys(SEA).map(k => c.seen[k] ? esc(k) : "?").join(" · ")}</p>`;
  if (c.snorkel === day) return h + `<p class="muted">You've had your swim today. Your fingers are still wrinkly.</p>` + card + shut;
  if (!st) return h + `<p class="muted">Mask, snorkel, and in you go.${evan ? " Evan stays in the shallows with a bucket and a very important job: crab inspector." : ""}</p><div class="actions"><button class="btn primary" data-fm="snorkel">Into the water</button></div>` + card + shut;
  if (st.i < st.pick.length) return h + `<p class="muted">Float face down and look: ${st.i}/${st.pick.length}.${st.last ? ` You saw ${esc(st.last)}.` : ""}</p><div class="actions"><button class="btn primary big" data-fm="look">Look</button></div>` + card + shut;
  return h + `<p class="muted">You saw ${esc(st.last)}. Time to float back, warm in the sun.</p><div class="actions"><button class="btn primary" data-fm="snorkeldone">Back to the beach</button></div>` + card + shut;
}

/* ---------- bikes and the Green Route ---------- */
export const BIKE = 3;
export function hireBikes(F, party){ const c = fmState(F), cost = BIKE*(1 + party.filter(id => id !== "evan").length); if (F.coins < cost) return null; F.coins -= cost; c.rides = (c.rides || 0) + 1; c.bikeDay = dayKey(); return cost; }
export function bikesPanel(F, party){
  const cost = BIKE*(1 + party.filter(id => id !== "evan").length);
  return `<span class="tape gingham" aria-hidden="true"></span><h2>Joan's bikes</h2><p class="sub">Rows of bikes with baskets, a wall of helmets, and a big map of the Green Routes, the quiet tracks between the stone walls that go all over the island.</p>
    <p class="muted">A bike each, ${BIKE} coins${party.length ? `, for you and the family${party.includes("evan") ? " (Evan rides in a seat on the back, free)" : ""}` : ""}. Ride the Green Route out past the salt flats and up to La Mola.</p>
    <div class="actions"><button class="btn primary" data-fm="ride" ${F.coins >= cost ? "" : "disabled"}>Hire bikes and ride to La Mola · ${cost} ${coin()}</button></div>` + list(F, "fm_bikes") + shut;
}

/* ---------- treats ---------- */
export const BAR = {fish: ["Grilled fish of the day", 6, "Straight off the boat, a squeeze of lemon, potatoes cooked in seawater. Toes in the sand."],
  juice: ["Fresh orange and carrot juice", 3, "Cold, sweet, and bright orange as the sunset."],
  payesa: ["Ensalada payesa", 5, "The island salad: potato, peppers, tomato, and crumbled dried fish. It's better than it sounds. Much better."]};
export const BAKERY = {flao: ["A slice of flaó", 3, "The island's cheesecake: fresh cheese, eggs and mint in a sweet anise crust. Margalida watches you take the first bite."],
  ensaimada: ["An ensaïmada", 2, "A spiral of buttery pastry under a snow of icing sugar. Somehow it gets everywhere."],
  orelletes: ["Orelletes", 2, "Little anise-scented 'ears', crisp and sugared, in a paper twist."]};

export function formenteraPanel(F, view, st = {}){
  return view === "fm_bar" ? `<span class="tape gingham" aria-hidden="true"></span><h2>The chiringuito</h2><p class="sub">A palm-thatch roof, driftwood tables in the sand, and the sea every shade of blue at once. Marina waves you over.</p>` + treats(F, BAR, "bar") + list(F, "fm_bar") + `<p class="muted">Dried fish from here makes ensalada payesa at the kitchen at home.</p>` + shut
    : view === "fm_salt" ? `<span class="tape gingham" aria-hidden="true"></span><h2>The salt works shop</h2><p class="sub">An old stone salt store, cool inside: sacks, jars, a long rake on the wall, and photos of the salt workers a hundred years ago.</p>` + list(F, "fm_salt") + `<p class="muted">Flor de sal makes a salted caramel gelato at the Scoop Shack, and a bonbon filling.</p>` + shut
    : view === "fm_bakery" ? `<span class="tape gingham" aria-hidden="true"></span><h2>Margalida's bakery</h2><p class="sub">A blue-and-white tiled counter, a wood oven breathing warm air, and trays of flaó cooling in the window.</p>` + treats(F, BAKERY, "bake") + list(F, "fm_bakery") + `<p class="muted">Sheep's cheese, mint and egg make flaó at the kitchen at home; dried figs and almonds make fig bread.</p>` + shut
    : view === "fm_light" || view === "fmstamp" ? `<span class="tape gingham" aria-hidden="true"></span><h2>La Mola lighthouse</h2><p class="sub">A spiral stair, the keeper's old desk, and a window full of nothing but sea. Pep keeps the stamp on a string.</p><div class="actions"><button class="btn primary" data-fm="stamp:mola" ${fmState(F).stamps.mola ? "disabled" : ""}>${fmState(F).stamps.mola ? "Stamped" : "Stamp your book"}</button></div>` + stampLine(F) + list(F, "fm_light") + shut
    : view === "fm_bikes" ? bikesPanel(F, st.party || [])
    : view === "fmrake" ? rakePanel(F, st.rake, st)
    : view === "fmsnorkel" ? snorkelPanel(F, st.snorkel, st.day, st.evan)
    : view === "fmmarket" ? `<span class="tape gingham" aria-hidden="true"></span><h2>The La Mola market</h2>` + (marketOn(st.day) ? `<p class="sub">Stalls under the pines: silver and beads, leather sandals, palm baskets, dreamcatchers turning in the breeze, and someone playing a guitar. Rainbow waves a hand full of rings.</p>` + list(F, "fm_market") : `<p class="sub">Empty trestles under the pines. The market's on Wednesdays and Sundays, May to October.</p>`) + shut
    : "";
}
