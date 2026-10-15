// Bali's rooms and things to join in with (rounds 219 to 221). The shops sell TOWN_GOODS (ronda.js buyGood, the
// shared data-rbuy buttons). Things to take part in, each more than a speech bubble:
//   making a canang sari with Ibu Wayan (fold the palm-leaf tray, the flowers to their directions: white east, red
//   south, yellow west, blue north, then rice and incense): an offering to carry; then placing it at a shrine.
//   Playing in Made's gamelan (when he's there: 9 to 12 and 3 to 6.30): strike on your notes, rest on the gaps
//   (kotekan, the interlocking parts), and the big gong on the last beat. Evan gets the little cymbals.
// The six shrines (round 221): an offering at each of six shrines (the beach, the market, the terraces, the temple,
// the banyan tree, the monkey forest gate), and Ibu Wayan gives you a carved Garuda.
// State: F.bali = {offerings: n (carried), placed: {shrine: day}, garuda, canang, gamelan, treats}
import { esc, dayKey } from "../util.js";
import { icon } from "../art/icons.js";
import { TOWN_GOODS } from "../data/towns.js";

export function baState(F){ F.bali = F.bali || {}; F.bali.placed = F.bali.placed || {}; F.bali.offerings = F.bali.offerings || 0; return F.bali; }
const shut = `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
const coin = () => icon("coin", 13);
const goods = shop => Object.keys(TOWN_GOODS).filter(id => TOWN_GOODS[id].shop === shop);
const row = (F, id) => { const g = TOWN_GOODS[id], have = (F.inv || {})[id] || 0;
  return `<li><span class="wpic">${icon(id, 28)}</span><span class="wtxt"><b>${esc(g.n)}</b><small>${esc(g.what || g.say || g.line || "")}${have ? ` (${have} in your backpack)` : ""}${g.kind === "keepsake" ? " · a keepsake for a shelf" : ""}</small></span><button class="btn small primary" data-rbuy="${id}" ${F.coins >= g.price ? "" : "disabled"}>${g.price} ${coin()}</button></li>`; };
const list = (F, shop, title) => { const ids = goods(shop); return ids.length ? `${title ? `<h3 class="ph3">${esc(title)}</h3>` : ""}<ul class="hlist wlist">${ids.map(id => row(F, id)).join("")}</ul>` : ""; };
const treats = (F, menu, act) => `<ul class="hlist wlist">${Object.entries(menu).map(([k, [n, p, l]]) => `<li><span class="wtxt"><b>${esc(n)}</b><small>${esc(l)}</small></span><button class="btn small primary" data-ba="${act}:${k}" ${F.coins >= p ? "" : "disabled"}>${p} ${coin()}</button></li>`).join("")}</ul>`;
export function treat(F, menu, k){ const t = menu[k]; if (!t || F.coins < t[1]) return null; F.coins -= t[1]; const c = baState(F); c.treats = (c.treats || 0) + 1; return t; }

/* ---------- the six shrines ---------- */
export const SHRINES = {bashrine1: "the beach shrine", bashrine2: "the market shrine", bashrine3: "the rice goddess's shrine", bashrine4: "the temple shrine", babanyan: "the great banyan tree", bamonkeys: "the monkey forest gate"};
// place a carried offering at a shrine -> {placed, all} | {none} (no offering) | {done} (already one there)
export function placeOffering(F, shrine, addInv){
  const c = baState(F); if (!SHRINES[shrine]) return null; if (c.placed[shrine]) return {done: true}; if (c.offerings < 1) return {none: true};
  c.offerings--; c.placed[shrine] = dayKey();
  const all = Object.keys(SHRINES).every(k => c.placed[k]); let garuda = false; if (all && !c.garuda) { c.garuda = dayKey(); garuda = true; addInv("ba_garuda", 1); }
  return {placed: SHRINES[shrine], all, garuda, n: Object.keys(c.placed).filter(k => SHRINES[k]).length};
}

/* ---------- a canang sari with Ibu Wayan ---------- */
export const CANANG = {price: 2, FOLD: 3, dirs: [["east", "white"], ["south", "red"], ["west", "yellow"], ["north", "blue"]], colours: ["white", "red", "yellow", "blue"]};
export const canangStart = () => ({fold: 0, dir: 0, oops: false, rice: false});
export function canangStep(st, what, v){
  if (what === "fold") { if (st.fold >= CANANG.FOLD) return false; st.fold++; return true; }
  if (what === "flower") { if (st.fold < CANANG.FOLD || st.dir >= CANANG.dirs.length) return false; if (CANANG.dirs[st.dir][1] !== v) { st.oops = true; return "oops"; } st.dir++; st.oops = false; return true; }
  if (what === "rice") { if (st.dir < CANANG.dirs.length || st.rice) return false; st.rice = true; return true; }
  return false; }
export const canangDone = st => st.fold >= CANANG.FOLD && st.dir >= CANANG.dirs.length && st.rice;
export function finishCanang(F){ if (F.coins < CANANG.price) return null; F.coins -= CANANG.price; const c = baState(F); c.offerings++; c.canang = (c.canang || 0) + 1; return c.offerings; }
export function offerPanel(F, st, evan){
  const c = baState(F), left = Object.keys(SHRINES).filter(k => !c.placed[k]);
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>Ibu Wayan's offerings</h2><p class="sub">A courtyard pavilion heaped with palm leaves and baskets of petals sorted by colour, the air sweet with incense. Ibu Wayan pats the mat beside her.</p>`;
  h += `<h3 class="ph3">Make a canang sari · ${CANANG.price} ${coin()}</h3>`;
  if (!st) h += `<p class="muted">A little palm-leaf tray of flowers, each colour for its direction, for the shrines. ${c.offerings ? `You're carrying ${c.offerings} offering${c.offerings > 1 ? "s" : ""}.` : ""} ${left.length ? `Shrines still waiting: ${left.length} of 6.` : "You've placed one at all six shrines."}${evan ? " Evan is given one petal of each colour to hold very carefully." : ""}</p><div class="actions"><button class="btn primary" data-ba="canang" ${F.coins >= CANANG.price ? "" : "disabled"}>Sit on the mat</button></div>`;
  else if (st.fold < CANANG.FOLD) h += `<p class="muted">Fold the palm leaf into a little square tray and pin it with a bamboo sliver: ${st.fold}/${CANANG.FOLD}.</p><div class="actions"><button class="btn primary big" data-ba="fold">Fold and pin</button></div>`;
  else if (st.dir < CANANG.dirs.length) h += `<p class="muted">Now the flowers. Which colour goes to the <b>${esc(CANANG.dirs[st.dir][0])}</b>?${st.oops ? ` Ibu Wayan gently moves your hand: "Not that one, child."` : ""}</p><div class="gchips">${CANANG.colours.map(col => `<button class="gchip" data-ba="flower:${col}"><span>${esc(col[0].toUpperCase() + col.slice(1))} petals</span></button>`).join("")}</div>`;
  else if (!st.rice) h += `<p class="muted">Last of all: a pinch of rice, a sweet, and a stick of incense.</p><div class="actions"><button class="btn primary big" data-ba="rice">Rice and incense</button></div>`;
  else h += `<p class="muted">Ibu Wayan turns it in her hands and nods. "Beautiful. Take it to a shrine, sprinkle a little water, and say thank you."</p><div class="actions"><button class="btn primary" data-ba="canangdone" ${F.coins >= CANANG.price ? "" : "disabled"}>Take your offering · ${CANANG.price} ${coin()}</button></div>`;
  return h + list(F, "ba_offer", "From the offerings house") + shut;
}

/* ---------- the gamelan with Made ---------- */
// Eight beats: on yours, strike; on the gaps, rest (the other half of the kotekan plays them); the eighth, the gong.
export const GAMELAN = {times: [[9*60, 12*60], [15*60, 18*60 + 30]], pattern: ["strike", "rest", "strike", "strike", "rest", "strike", "rest", "gong"]};
export const gamelanOn = hm => GAMELAN.times.some(([f, t]) => hm >= f && hm < t);
export const gamelanStart = () => ({i: 0, right: 0});
export function gamelanPress(st, what){ if (st.i >= GAMELAN.pattern.length) return null; const ok = GAMELAN.pattern[st.i] === what; if (ok) st.right++; st.i++; return ok; }
export const gamelanDone = st => st.i >= GAMELAN.pattern.length;
export function finishGamelan(F){ const c = baState(F); c.gamelan = (c.gamelan || 0) + 1; return c.gamelan; }
export function gamelanPanel(F, st, {hm, evan, here}){
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>The gamelan pavilion</h2><p class="sub">Rows of bronze bars in carved red-and-gold frames, great gongs hanging like moons, and drums. Made sits cross-legged at the front with a mallet.</p>`;
  if (!gamelanOn(hm) || !here) return h + `<p class="muted">${gamelanOn(hm) ? "Made's not here just now. He'll be back soon." : "Made teaches from nine till noon and from three in the afternoon. Come back then."}</p>` + shut;
  if (!st) return h + `<h3 class="ph3">Play with the orchestra</h3><p class="muted">Made gives you a gangsa and a mallet. "You play your notes. Wira plays the gaps. Together, one melody. And at the end, the gong."${evan ? " Evan gets the little cymbals (ceng-ceng). The whole pavilion braces itself." : ""}</p><div class="actions"><button class="btn primary" data-ba="gamelan">Take a mallet</button></div>` + shut;
  if (!gamelanDone(st)) { const beat = GAMELAN.pattern[st.i];
    return h + `<p class="muted">Beat ${st.i + 1} of ${GAMELAN.pattern.length}. Made calls it out: <b>${beat === "strike" ? "\"Yours!\"" : beat === "rest" ? "\"Wira's!\"" : "\"The GONG!\""}</b>${st.i ? ` (${st.right} of ${st.i} together)` : ""}</p>
      <div class="actions"><button class="btn primary big" data-ba="strike">Strike</button><button class="btn alt big" data-ba="rest">Rest</button><button class="btn primary big" data-ba="gong">Gong</button></div>`; }
  return h + `<p class="muted">The gong booms and the sound hangs in the air, shimmering. ${st.right === GAMELAN.pattern.length ? "Made laughs and claps: \"You! You have gamelan hands!\"" : "Made grins: \"Good! Again tomorrow, and you'll be in the band.\""}</p><div class="actions"><button class="btn primary" data-ba="gamelandone">Bow to the gong</button></div>` + shut;
}

/* ---------- the warung, the market, the silver workshop ---------- */
export const WARUNG = {campur: ["Nasi campur", 4, "Rice with a little of everything around it: satay, egg, vegetables, peanuts and Nyoman's mother's sambal."],
  satay: ["Satay lilit", 3, "Minced fish wrapped round lemongrass sticks and grilled over coconut husks."], kelapa: ["A fresh coconut", 2, "Nyoman whacks the top off with a machete and pops in a straw. Cold, sweet, perfect."],
  injin: ["Black rice pudding", 3, "Warm, purple-black, with a pour of coconut cream. Like eating a cosy blanket."]};
export function warungPanel(F, evan){ return `<span class="tape gingham" aria-hidden="true"></span><h2>Nyoman's warung</h2><p class="sub">Low tables on the sand, a glass cabinet of dishes, coconuts piled by the door. "Sit, friend! The sea comes free."</p>${treats(F, WARUNG, "warung")}${evan ? `<p class="muted">Evan's coconut gets a hibiscus flower stuck in the top.</p>` : ""}` + list(F, "ba_warung") + shut; }
export function marketPanel(F){ return `<span class="tape gingham" aria-hidden="true"></span><h2>The market hall</h2><p class="sub">Spices in pyramids, vanilla in bundles, fruit you've never seen, sarongs in every colour. Komang waves you over. "Smell! Smell this!"</p>` + list(F, "ba_market") + `<p class="muted">Bali vanilla, lemongrass, kaffir lime leaves, black rice and snake fruit make three Bali specials at the kitchen at home, and go into gelato and bonbons.</p>` + shut; }
export function silverPanel(F){ return `<span class="tape gingham" aria-hidden="true"></span><h2>Ketut's silver workshop</h2><p class="sub">A tiny flame, tweezers, a coil of silver wire as thin as hair, and Ketut bent over his bench, breathing very softly.</p>` + list(F, "ba_silver") + shut; }

export function baliPanel(F, view, st = {}){
  return view === "ba_offer" || view === "bacanang" ? offerPanel(F, st.canang, st.evan) : view === "bagong" ? gamelanPanel(F, st.gamelan, st)
    : view === "ba_warung" ? warungPanel(F, st.evan) : view === "ba_market" ? marketPanel(F) : view === "ba_silver" ? silverPanel(F) : "";
}
