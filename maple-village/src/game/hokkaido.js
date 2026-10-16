// Hokkaido's rooms and things to join in with (round 217). The shops sell TOWN_GOODS (the data-rbuy buttons). Things to
// take part in, each more than a speech bubble:
//   blowing a glass float with Haruki (pick a colour, then blow: three or four breaths to bring it to size, but not so
//     many it bursts), choosing a music box tune for the season (four seasons, four boxes: all four and they play
//     together), the beer factory tour and tasting with Kenji (match three beers to their notes), a ski lesson with
//     Aiko in the snow months (three runs down the nursery slope: through each gate on the right side), helping carve a
//     snow sculpture in Sapporo's park in February, and the foot bath in Niseko.
// State: F.hokkaido = {floats, glassDay, boxes: {season: day}, boxed, tastes, glassMug, ski, pass, carved, soaks, soakDay, treats}
import { esc, dayKey } from "../util.js";
import { icon } from "../art/icons.js";
import { TOWN_GOODS } from "../data/towns.js";
import { seasonOf } from "../data/items.js";
import { MUSICBOXES, snowIn, festivalIn } from "../data/hokkaido.js";

export function hkState(F){ F.hokkaido = F.hokkaido || {}; const s = F.hokkaido; s.boxes = s.boxes || {}; return s; }
const shut = `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
const coin = () => icon("coin", 13);
const goods = shop => Object.keys(TOWN_GOODS).filter(id => TOWN_GOODS[id].shop === shop);
const row = (F, id) => { const g = TOWN_GOODS[id], have = (F.inv || {})[id] || 0;
  return `<li><span class="wpic">${icon(id, 28)}</span><span class="wtxt"><b>${esc(g.n)}</b><small>${esc(g.what || g.say || g.line || "")}${have ? ` (${have} in your backpack)` : ""}${g.kind === "keepsake" ? " · a keepsake for a shelf" : g.keep ? " · give it, or keep it" : ""}</small></span><button class="btn small primary" data-rbuy="${id}" ${F.coins >= g.price ? "" : "disabled"}>${g.price} ${coin()}</button></li>`; };
const list = (F, shop, title) => { const ids = goods(shop); return ids.length ? `${title ? `<h3 class="ph3">${esc(title)}</h3>` : ""}<ul class="hlist wlist">${ids.map(id => row(F, id)).join("")}</ul>` : ""; };
const head = (title, sub) => `<span class="tape gingham" aria-hidden="true"></span><h2>${esc(title)}</h2><p class="sub">${sub}</p>`;
const menu = (F, items, tag) => `<ul class="hlist wlist">${Object.entries(items).map(([k, [n, p, l]]) => `<li><span class="wtxt"><b>${esc(n)}</b><small>${esc(l)}</small></span><button class="btn small primary" data-hk="${tag}:${k}" ${F.coins >= p ? "" : "disabled"}>${p} ${coin()}</button></li>`).join("")}</ul>`;

/* ---------- blowing a glass float, at the glassworks ---------- */
// 12 coins. Each breath grows the bubble by 18 to 30; stop between 70 and 100 and it's a float; past 100 it bursts
// (Haruki laughs and gathers another gob of glass). One float a day to take home.
export const GLASS = {price: 12, lo: 70, hi: 100, cols: {blue: ["sea blue", "#5E8AB8"], green: ["bottle green", "#5E9A6A"], amber: ["amber", "#D9963A"], rose: ["rose pink", "#E39AB0"]}};
export const glassStart = col => ({col, size: 0, burst: false, done: false});
export function blow(st, rng = Math.random){ if (st.done || st.burst) return null; st.size += 18 + Math.floor(rng()*13); if (st.size > GLASS.hi) { st.burst = true; return "burst"; } return "grow"; }
export function glassDone(F, st, addInv, day = dayKey()){ const s = hkState(F); if (st.burst || st.size < GLASS.lo || s.glassDay === day || F.coins < GLASS.price) return false; F.coins -= GLASS.price; st.done = true; s.glassDay = day; s.floats = (s.floats || 0) + 1; addInv("h_float", 1); return true; }
export function glassPanel(F, st, day = dayKey()){
  const s = hkState(F);
  let h = head("The glassworks", "Haruki is the third Haruki to work this furnace. He gathers a glowing gob of glass on the end of a long pipe, turns it, and holds it out to you. \"Gently. Like blowing on soup.\"");
  if (s.glassDay === day && !(st && st.done)) return h + `<p class="muted">Your float's cooling in the annealing oven: it'll be ready to take home. One a day: the furnace is greedy.</p>` + list(F, "hk_glass", "From the shelves") + shut;
  if (!st) return h + `<h3 class="ph3">Blow a glass float · ${GLASS.price} ${coin()}</h3><p class="muted">Pick a colour:</p><div class="gchips">${Object.entries(GLASS.cols).map(([k, [n]]) => `<button class="gchip" data-hk="col:${k}" ${F.coins >= GLASS.price ? "" : "disabled"}><span>${esc(n)}</span></button>`).join("")}</div>` + list(F, "hk_glass", "From the shelves") + shut;
  if (st.done) return h + `<p class="sub">Haruki snaps it off the pipe, lets it cool in the oven, and wraps it in newspaper for the journey. Your own glass float, a little lopsided and full of tiny bubbles. It's in your backpack.</p>` + shut;
  const pct = Math.min(100, Math.round(st.size)), [n, hex] = GLASS.cols[st.col];
  h += `<div class="hkbubble" aria-hidden="true"><span style="width:${20 + pct*0.7}px;height:${20 + pct*0.7}px;background:${hex}"></span><i style="left:${GLASS.lo*0.9}%"></i><i style="left:${GLASS.hi*0.9}%"></i></div>`;
  if (st.burst) return h + `<p class="sub">Pop! Too much breath: the ${esc(n)} bubble bursts into a shower of glittering bits. Haruki laughs and gathers another gob. "Everyone does that. I did it for a year."</p><div class="actions"><button class="btn alt" data-hk="col:${st.col}">Try again</button></div>` + shut;
  return h + `<p class="muted">${st.size < GLASS.lo ? "Keep blowing, gently." : "That's a good size. Stop now, or risk one more breath."}</p><div class="actions"><button class="btn primary" data-hk="blow">Blow</button>${st.size >= GLASS.lo ? `<button class="btn alt" data-hk="glassdone" ${F.coins >= GLASS.price ? "" : "disabled"}>That's the one · ${GLASS.price} ${coin()}</button>` : ""}</div>` + shut;
}

/* ---------- the music box hall ---------- */
// Each season's tune (14 coins), once. All four, and they play together at home (a keepsake).
export const BOX_PRICE = 14;
export function buyBox(F, addInv, day = dayKey()){ const k = seasonOf(day), s = hkState(F); if (!MUSICBOXES[k] || s.boxes[k] || F.coins < BOX_PRICE) return null; F.coins -= BOX_PRICE; s.boxes[k] = day; addInv("mb_" + k, 1);
  const all = Object.keys(MUSICBOXES).every(x => s.boxes[x]), set = all && !s.boxed; if (set) { s.boxed = day; addInv("h_boxes", 1); } return {k, set}; }
export function musicPanel(F, day = dayKey()){
  const k = seasonOf(day), s = hkState(F), [n, what] = MUSICBOXES[k] || ["", ""], have = Object.keys(MUSICBOXES).filter(x => s.boxes[x]).length;
  return head("The music box hall", "Thousands of music boxes on every shelf, all tinkling at once, and somehow it's lovely. Ms Yuki winds one for you. \"Each season has its tune. Choose this season's, and come back for the next.\"")
    + `<h3 class="ph3">This season's music box: ${esc(n)}</h3><p class="muted">It plays ${esc(what)}. ${s.boxes[k] ? "You've got this season's already." : ""} Your music boxes: ${have} of 4.</p>`
    + (s.boxes[k] ? "" : `<div class="actions"><button class="btn primary" data-hk="box" ${F.coins >= BOX_PRICE ? "" : "disabled"}>Wind it up and take it home · ${BOX_PRICE} ${coin()}</button></div>`)
    + list(F, "hk_musicbox", "From the shop") + shut;
}

/* ---------- the beer factory: the tour and the tasting ---------- */
// 8 coins. Three beers, three notes: match each one. All three right, the first time: a factory glass.
export const BEERS = [["The classic lager", "crisp and clean, a little bitter at the end"], ["The black lager", "dark as coffee, smooth, a hint of chocolate"], ["The wheat beer", "cloudy and soft, like bananas and cloves"]];
export const TOUR = 8;
export const tasteStart = (F) => { if (F.coins < TOUR) return null; F.coins -= TOUR; return {i: 0, good: 0, done: false, order: [2, 0, 1]}; };
export function tastePick(st, note){ if (st.done) return null; const ok = st.order[st.i] === note; if (ok) st.good++; st.i++; if (st.i >= BEERS.length) st.done = true; return ok ? "ok" : "off"; }
export function tasteDone(F, st, addInv, day = dayKey()){ const s = hkState(F); s.tastes = (s.tastes || 0) + 1; if (st.good === BEERS.length && !s.glassMug) { s.glassMug = day; addInv("h_beerglass", 1); return true; } return false; }
export function beerPanel(F, st){
  let h = head("The beer factory", "Kenji has worked these copper kettles for forty years. He walks you along the brewing line (malt, hops, the great kettles, the cold dark cellars) and into the long tasting hall, where three little glasses are waiting.");
  if (!st) return h + `<h3 class="ph3">The tour and the tasting · ${TOUR} ${coin()}</h3><p class="muted">Three beers, three notes on the card: can you match them? (Little glasses. Very little.)</p><div class="actions"><button class="btn primary" data-hk="tour" ${F.coins >= TOUR ? "" : "disabled"}>Join the tour</button></div>` + list(F, "hk_beer", "From the factory shop") + shut;
  if (st.done) return h + `<p class="sub">${st.good} of 3. ${st.good === 3 ? "Kenji bows, delighted. \"A good tongue. Rare.\"" : "\"The black one fools everybody,\" says Kenji. \"It fooled me for ten years.\""}</p>` + list(F, "hk_beer", "From the factory shop") + shut;
  return h + `<h3 class="ph3">Glass ${st.i + 1} of 3</h3><p class="muted">Which note is this one?</p><div class="gchips">${BEERS.map(([, note], k) => `<button class="gchip" data-hk="note:${k}"><span>${esc(note)}</span></button>`).join("")}</div>` + shut;
}

/* ---------- the ramen shop, the lodge and the dairy ---------- */
export const RAMEN = {miso: ["Miso ramen with butter and corn", 9, "Sapporo's own: a rich miso broth, springy noodles, a pat of butter melting on top and a heap of sweet corn."],
  shio: ["Shio ramen", 8, "A clear, salty broth from the coast, with scallops and spring onions."], gyoza: ["Gyoza", 5, "Six crisp-bottomed dumplings with a little dish of vinegar and chilli oil."]};
export const LODGE = {choc: ["A hot chocolate", 4, "Thick and dark, in a big mug, by the stove with your boots off."], soup: ["Corn potage", 5, "Hokkaido corn soup, sweet and creamy, with a crust of bread."]};
export const SOFT = {milk: ["Milk soft-serve", 4, "Pure white and so creamy it tastes of the fields."], melon: ["Melon soft-serve", 5, "Orange, sweet, and exactly like a ripe Furano melon."], lavender: ["Lavender soft-serve", 5, "Pale purple and faintly flowery. Strange. Wonderful."]};
const MENUS = {ramen: RAMEN, lodge: LODGE, soft: SOFT};
export function treat(F, menu, k){ const c = (MENUS[menu] || {})[k]; if (!c || F.coins < c[1]) return null; F.coins -= c[1]; const s = hkState(F); s.treats = (s.treats || 0) + 1; return c; }
export const ramenPanel = F => head("The ramen shop", "Mr Oda has made one thing for thirty years, and he's still getting better at it. Eight stools at the counter, steam everywhere, and the slurping is encouraged.") + menu(F, RAMEN, "ramen") + shut;
export const dairyPanel = F => head("The Furano dairy", "Sachi's cows graze the hill behind the barn. The milk comes in at dawn and goes out in glass bottles, cheese, butter and the best soft-serve on the island.") + `<h3 class="ph3">A soft-serve</h3>` + menu(F, SOFT, "soft") + list(F, "hk_dairy", "To take home") + shut;
export const marketPanel = F => head("The morning market", "Crushed ice, blue awnings and shouting: crab, scallops, salmon roe, sweet corn, kombu, and an old man who insists you try the sea urchin.") + list(F, "hkmarket") + shut;

/* ---------- the ski lesson (Niseko, in the snow months) ---------- */
// Three runs down the nursery slope, three gates a run: go round each gate on the side Aiko calls. Two clean runs and
// she gives you your first ski pass (once). 10 coins for the boots, skis and the lesson.
export const SKI = {price: 10, runs: 3, gates: 3};
export function skiStart(F, rng = Math.random){ if (F.coins < SKI.price) return null; F.coins -= SKI.price; return {runs: Array.from({length: SKI.runs}, () => Array.from({length: SKI.gates}, () => rng() < .5 ? "left" : "right")), r: 0, g: 0, clean: 0, slip: false, done: false}; }
export function skiTurn(st, side){ if (st.done) return null; const ok = st.runs[st.r][st.g] === side; if (!ok) st.slip = true; st.g++;
  if (st.g >= SKI.gates) { if (!st.slip) st.clean++; st.r++; st.g = 0; st.slip = false; if (st.r >= SKI.runs) st.done = true; } return ok ? "ok" : "slip"; }
export function skiDone(F, st, addInv, day = dayKey()){ const s = hkState(F); s.ski = (s.ski || 0) + 1; if (st.clean >= 2 && !s.pass) { s.pass = day; addInv("h_skipass", 1); return true; } return false; }
export function slopePanel(F, st, day = dayKey()){
  if (!snowIn(day)) return head("The slopes", "No snow now: the slopes are green and full of wildflowers, and the lift's carrying walkers up instead of skiers. Aiko teaches skiing from December to March. \"Come back when it's white,\" she says, \"and I'll have you down the nursery slope by lunch.\"") + shut;
  let h = head("The ski lesson", "Aiko grew up on these slopes under Mount Yotei and has been teaching for twenty years. \"Knees bent. Look where you want to go, not at your skis. Your skis know where they are.\"");
  if (!st) return h + `<p class="muted">Three runs down the nursery slope. At each gate Aiko calls left or right: go round it on that side.</p><div class="actions"><button class="btn primary" data-hk="ski" ${F.coins >= SKI.price ? "" : "disabled"}>Boots, skis and a lesson · ${SKI.price} ${coin()}</button></div>` + shut;
  if (st.done) return h + `<p class="sub">${st.clean} clean run${st.clean === 1 ? "" : "s"} of ${SKI.runs}. ${st.clean >= 2 ? "Aiko whoops and skis a circle round you. \"You're a skier now. Officially.\"" : "You're mostly covered in snow, and grinning. \"Everyone falls,\" says Aiko. \"The good ones laugh.\""}</p><div class="actions"><button class="btn alt" data-hk="ski" ${F.coins >= SKI.price ? "" : "disabled"}>Another lesson · ${SKI.price} ${coin()}</button></div>` + shut;
  return h + `<h3 class="ph3">Run ${st.r + 1} of ${SKI.runs} · gate ${st.g + 1}</h3><p class="muted">Aiko calls: <b>${st.runs[st.r][st.g] === "left" ? "Left!" : "Right!"}</b></p><div class="actions"><button class="btn primary" data-hk="turn:left">Round to the left</button><button class="btn primary" data-hk="turn:right">Round to the right</button></div>` + shut;
}

/* ---------- the snow sculpture (Sapporo's park, in February) ---------- */
export const CARVE = ["Pack the snow into the frame", "Carve out the shape", "Smooth it with a little water"];
export function carveStep(st, i){ if (st.done) return null; if (i !== st.step) { st.oops = true; return "oops"; } st.oops = false; st.step++; if (st.step >= CARVE.length) st.done = true; return "ok"; }
export function sculptPanel(F, st, day = dayKey()){
  if (!festivalIn(day)) return head("The snow sculpture plot", "A fountain now, splashing in the park. In February the whole park fills with snow sculptures, castles and dragons and giant cats, and anyone can help carve the little ones.") + shut;
  let h = head("The snow festival", "Giant snow sculptures all down the park, and in the middle a small one waiting for help: a snow fox, half finished. The team leader hands you a little spade.");
  if (!st) return h + `<div class="actions"><button class="btn primary" data-hk="carve">Pick up the spade</button></div>` + shut;
  if (st.done) return h + `<p class="sub">The fox sits up in the snow, ears sharp, tail curled, glittering in the cold sun. Everyone claps. Somebody takes your photo with it. You're part of the snow festival now.</p>` + shut;
  return h + `<p class="muted">${st.step ? `${esc(CARVE[st.step - 1])}: done. ` : ""}What's next?${st.oops ? " (Not yet: the team leader shakes her head, smiling.)" : ""}</p><div class="gchips">${[2, 0, 1].map(i => `<button class="gchip" data-hk="cstep:${i}"><span>${esc(CARVE[i])}</span></button>`).join("")}</div>` + shut;
}

export function hkPanel(F, view, st = {}, day = dayKey()){
  return view === "hk_glass" ? glassPanel(F, st.glass, day) : view === "hk_musicbox" ? musicPanel(F, day) : view === "hk_beer" ? beerPanel(F, st.taste)
    : view === "hk_ramen" ? ramenPanel(F) : view === "hk_lodge" ? head("The ski lodge", "Skis in racks, boots steaming by the stove, and Mount Yotei filling the window.") + menu(F, LODGE, "lodge") + shut
    : view === "hk_dairy" ? dairyPanel(F) : view === "market" ? marketPanel(F) : view === "slope" ? slopePanel(F, st.ski, day) : view === "sculpt" ? sculptPanel(F, st.carve, day) : "";
}
