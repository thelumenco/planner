// Bali's rooms and things to join in with (round 218). The shops sell TOWN_GOODS (the data-rbuy buttons). Things to take
// part in, each more than a speech bubble:
//   folding a canang sari with Ibu Sari at Ubud market (each flower colour goes at its own point of the compass: white
//     to the east, red to the south, yellow to the west, blue to the north), a gamelan lesson with Pak Nyoman in the
//     dance pavilion (listen to the pattern, then play it back on the gongs: three rounds, each a note longer), making a
//     silver ring with Wayan (pick a design, hammer it round, polish it), the kecak fire dance at Uluwatu at sunset, the
//     jungle swing over the terraces, and the carver's animal of the day at the market (seven, one for each day of the week).
// State: F.bali = {canang, canangDay, gong, lessons, rings, carved: {k: day}, ark, swings, kecakDay, treats}
import { esc, dayKey } from "../util.js";
import { icon } from "../art/icons.js";
import { TOWN_GOODS } from "../data/towns.js";
import { CARVINGS, CARVE_DAYS, kecakOn } from "../data/bali.js";

export function blState(F){ F.bali = F.bali || {}; const s = F.bali; s.carved = s.carved || {}; return s; }
const shut = `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
const coin = () => icon("coin", 13);
const goods = shop => Object.keys(TOWN_GOODS).filter(id => TOWN_GOODS[id].shop === shop);
const row = (F, id) => { const g = TOWN_GOODS[id], have = (F.inv || {})[id] || 0;
  return `<li><span class="wpic">${icon(id, 28)}</span><span class="wtxt"><b>${esc(g.n)}</b><small>${esc(g.what || g.say || g.line || "")}${have ? ` (${have} in your backpack)` : ""}${g.kind === "keepsake" ? " · a keepsake for a shelf" : g.keep ? " · give it, or keep it" : ""}</small></span><button class="btn small primary" data-rbuy="${id}" ${F.coins >= g.price ? "" : "disabled"}>${g.price} ${coin()}</button></li>`; };
const list = (F, shop, title) => { const ids = goods(shop); return ids.length ? `${title ? `<h3 class="ph3">${esc(title)}</h3>` : ""}<ul class="hlist wlist">${ids.map(id => row(F, id)).join("")}</ul>` : ""; };
const head = (title, sub) => `<span class="tape gingham" aria-hidden="true"></span><h2>${esc(title)}</h2><p class="sub">${sub}</p>`;
const menu = (F, items, tag) => `<ul class="hlist wlist">${Object.entries(items).map(([k, [n, p, l]]) => `<li><span class="wtxt"><b>${esc(n)}</b><small>${esc(l)}</small></span><button class="btn small primary" data-bl="${tag}:${k}" ${F.coins >= p ? "" : "disabled"}>${p} ${coin()}</button></li>`).join("")}</ul>`;

/* ---------- the canang sari, at Ubud market ---------- */
export const CANANG = {white: ["White frangipani", "east"], red: ["Red hibiscus", "south"], yellow: ["Yellow marigolds", "west"], blue: ["Blue butterfly pea", "north"]};
export const DIRS = ["north", "east", "south", "west"];
export const canangStart = () => ({i: 0, oops: false, done: false});
export function canangPlace(st, dir){ if (st.done) return null; const k = Object.keys(CANANG)[st.i]; if (CANANG[k][1] !== dir) { st.oops = true; return "oops"; } st.oops = false; st.i++; if (st.i >= 4) st.done = true; return "ok"; }
// a finished offering -> your canang sari to keep (once a day)
export function canangDone(F, addInv, day = dayKey()){ const s = blState(F); s.canang = (s.canang || 0) + 1; if (s.canangDay === day) return false; s.canangDay = day; addInv("b_canang", 1); return true; }
// the carver's animal of the day (6 coins); all seven and he makes you a shelf for them
export const CARVE_PRICE = 6;
export const carvingToday = day => CARVE_DAYS[new Date(day + "T00:00:00Z").getUTCDay()];
export function buyCarving(F, addInv, day = dayKey()){ const k = carvingToday(day), s = blState(F); if (s.carved[k] || F.coins < CARVE_PRICE) return null; F.coins -= CARVE_PRICE; s.carved[k] = day; addInv("bc_" + k, 1);
  const all = CARVE_DAYS.every(x => s.carved[x]), ark = all && !s.ark; if (ark) { s.ark = day; addInv("b_ark", 1); } return {k, ark}; }
export function marketPanel(F, st, day = dayKey()){
  const s = blState(F), k = carvingToday(day), have = CARVE_DAYS.filter(x => s.carved[x]).length;
  let h = head("Ubud market", "Ibu Sari sits cross-legged by the door, folding palm leaves into little trays faster than you can see. \"Canang sari,\" she says. \"A small thank-you, every morning. Come, I show you.\"");
  h += `<h3 class="ph3">Fold a canang sari with Ibu Sari</h3>`;
  if (!st) h += `<p class="muted">Four flowers, four colours, and each one goes at its own point of the compass. Free: she'll lend you the leaves.</p><div class="actions"><button class="btn alt" data-bl="canang">Sit with Ibu Sari</button></div>`;
  else if (!st.done) { const [n] = CANANG[Object.keys(CANANG)[st.i]]; h += `<p class="muted">${st.i ? "That's right. " : ""}Where does this one go: <b>${esc(n)}</b>?${st.oops ? " (Ibu Sari smiles and shakes her head.)" : ""}</p><div class="gchips">${DIRS.map(d => `<button class="gchip" data-bl="dir:${d}"><span>${d[0].toUpperCase() + d.slice(1)}</span></button>`).join("")}</div>`; }
  else h += `<p class="sub">White to the east, red to the south, yellow to the west, blue to the north, a pinch of rice and a stick of incense in the middle. Ibu Sari claps once. "Beautiful. The gods will be happy. I am happy."</p>`;
  h += `<h3 class="ph3">The carver's animal of the day</h3><p class="muted">Pak Gede carves one animal a day, a different one for each day of the week. Today: ${esc(CARVINGS[k])}. ${s.carved[k] ? "You've got today's." : ""} Your carvings: ${have} of 7.</p>`;
  if (!s.carved[k]) h += `<div class="actions"><button class="btn alt" data-bl="carve" ${F.coins >= CARVE_PRICE ? "" : "disabled"}>Buy today's · ${CARVE_PRICE} ${coin()}</button></div>`;
  return h + list(F, "ba_market", "From the stalls") + shut;
}

/* ---------- the gamelan, in the dance pavilion ---------- */
export const NOTES = ["dong", "deng", "dung", "dang", "ding"];
export const gamelanStart = (rng = Math.random) => ({rounds: [3, 4, 5].map(n => Array.from({length: n}, () => Math.floor(rng()*5))), r: 0, played: [], listening: true, good: 0, done: false});
export function gamelanListen(st){ if (st.done) return false; st.listening = false; st.played = []; return true; }
export function gamelanStrike(st, n){
  if (st.done || st.listening) return null; st.played.push(n); const want = st.rounds[st.r];
  if (want[st.played.length - 1] !== n) { st.listening = true; st.played = []; st.miss = true; return "miss"; }
  if (st.played.length < want.length) return "ok";
  st.good++; st.r++; st.listening = true; st.played = []; st.miss = false; if (st.r >= st.rounds.length) st.done = true; return "round";
}
// all three rounds -> Pak Nyoman gives you a little gong (once)
export function gamelanDone(F, addInv, day = dayKey()){ const s = blState(F); s.lessons = (s.lessons || 0) + 1; if (!s.gong) { s.gong = day; addInv("b_gong", 1); return true; } return false; }
export function dancePanel(F, st){
  let h = head("The dance pavilion", "In the palace courtyard, under carved and gilded beams, the gamelan players sit cross-legged behind their bronze gongs, and girls in gold practise the legong: fingers bent back, eyes flicking left, right, left. Pak Nyoman beckons you over to the metallophones.");
  if (!st) return h + `<p class="muted">"Listen first. Then play it back." Three patterns, each a note longer. Free, and the dancers will keep going around you.</p><div class="actions"><button class="btn primary" data-bl="gamelan">Sit at the gongs</button></div>` + shut;
  if (st.done) return h + `<p class="sub">The last note hums away under the roof. The dancers stop and look over, and one of them claps. Pak Nyoman nods slowly, the way a gong nods.</p>` + shut;
  const pat = st.rounds[st.r];
  if (st.listening) return h + `<h3 class="ph3">Pattern ${st.r + 1} of 3: listen</h3><p class="muted">${st.miss ? "Not quite: listen again. " : ""}Pak Nyoman plays: <b>${pat.map(n => NOTES[n]).join(" · ")}</b></p><div class="actions"><button class="btn primary" data-bl="listen">I've got it</button></div>` + shut;
  return h + `<h3 class="ph3">Pattern ${st.r + 1} of 3: play it back (${st.played.length} of ${pat.length})</h3><div class="gchips blgongs">${NOTES.map((n, i) => `<button class="gchip" data-bl="strike:${i}"><span>${n}</span></button>`).join("")}</div>` + shut;
}

/* ---------- a silver ring, at the silversmith's ---------- */
export const RING = {price: 20, hammers: 5, designs: {frangipani: "a frangipani flower", wave: "a curling wave", gecko: "a tiny gecko"}};
export function ringStart(F, design){ if (!RING.designs[design] || F.coins < RING.price) return null; F.coins -= RING.price; return {design, hits: 0, polished: false, done: false}; }
export function ringStep(st, what){ if (st.done) return null; if (what === "hammer" && st.hits < RING.hammers) { st.hits++; return "ok"; } if (what === "polish" && st.hits >= RING.hammers) { st.polished = true; st.done = true; return "done"; } return null; }
export function ringDone(F, addInv){ const s = blState(F); s.rings = (s.rings || 0) + 1; addInv("b_ring", 1); return true; }
export function silverPanel(F, st){
  let h = head("The silversmith", "Wayan's family have made silver in Celuk for five generations. At his bench, a tiny flame, a little anvil, and his hands moving too fast to follow. \"You choose. I help. You make.\"");
  if (!st) return h + `<h3 class="ph3">Make a silver ring · ${RING.price} ${coin()}</h3><p class="muted">Pick a design for the top:</p><div class="gchips">${Object.entries(RING.designs).map(([k, n]) => `<button class="gchip" data-bl="ring:${k}" ${F.coins >= RING.price ? "" : "disabled"}><span>${esc(n)}</span></button>`).join("")}</div>` + list(F, "ba_silver", "From the cases") + shut;
  if (st.done) return h + `<p class="sub">You rub it with the cloth until it shines like water. ${esc(RING.designs[st.design][0].toUpperCase() + RING.designs[st.design].slice(1))} on the top, a little lopsided, completely yours. Wayan slips it on your finger. "Good. Now you are a silversmith. Small one."</p>` + shut;
  return h + `<p class="muted">${st.hits < RING.hammers ? `Hammer the band round the mandrel: ${st.hits} of ${RING.hammers}. Tap, tap, turn.` : "Round and smooth. Now polish it."}</p><div class="actions">${st.hits < RING.hammers ? `<button class="btn primary" data-bl="hammer">Tap</button>` : `<button class="btn primary" data-bl="polish">Polish</button>`}</div>` + shut;
}

/* ---------- the warung, and the coffee and cacao house ---------- */
export const WARUNG = {nasi: ["Nasi goreng", 6, "Fried rice with a fried egg on top, prawn crackers and a little pot of sambal. Breakfast, lunch or dinner."],
  mie: ["Mie goreng", 6, "Fried noodles with greens and chicken, sweet and smoky."], kelapa: ["Es kelapa muda", 4, "A young coconut with the top hacked off and a straw stuck in. Cold, sweet, perfect."],
  pisang: ["Pisang goreng", 3, "Banana fritters, crisp outside, gooey inside, with a drizzle of palm sugar syrup."]};
export const CACAO = {kopi: ["Kopi Bali", 3, "Thick, dark and sweet, the grounds settling at the bottom. Don't drink the last sip."], coklat: ["Hot cacao", 4, "Made from beans roasted this morning, frothy and bitter-sweet."],
  tasting: ["A tasting flight", 6, "Six little cups: three coffees from the volcano slopes and three teas, ginger, lemongrass and rosella."]};
const MENUS = {warung: WARUNG, cacao: CACAO};
export function treat(F, m, k){ const c = (MENUS[m] || {})[k]; if (!c || F.coins < c[1]) return null; F.coins -= c[1]; const s = blState(F); s.treats = (s.treats || 0) + 1; return c; }
export const warungPanel = F => head("The warung", "Made has run this warung on the sand for twenty years. Plastic stools, a glass case of rice and curries, fans turning, and the best nasi goreng on the coast. She says so herself.") + menu(F, WARUNG, "warung") + list(F, "ba_warung") + shut;
export const cacaoPanel = F => head("The coffee and cacao house", "Ketut's sister Kadek roasts the beans in a pan over a wood fire, stirring with a paddle, and the whole hut smells of chocolate and smoke. Below, the terraces go green all the way down.") + menu(F, CACAO, "cacao") + list(F, "ba_cacao", "To take home") + shut;

/* ---------- outdoors: the kecak at sunset, the swing ---------- */
export const SWING = 10;
export function bliPanel(F, view, st = {}, hm = 12*60, day = dayKey()){
  return view === "ba_market" ? marketPanel(F, st.canang, day) : view === "ba_dance" ? dancePanel(F, st.gamelan) : view === "ba_silver" ? silverPanel(F, st.ring)
    : view === "ba_warung" ? warungPanel(F) : view === "ba_cacao" ? cacaoPanel(F) : "";
}
export { kecakOn };
