// Ronda's places (round 107, round 3): the covered market (Rafael's almonds and oil, jamón, payoyo, membrillo,
// Seville oranges, a picnic basket, and once he trusts you, Tempranillo vine cuttings), the tapas bar (taste a
// dish and it's yours to cook at home), Doña Carmen's sweet shop, the convent hatch, and Lucía's tile shop (eight
// painted tiles: the full set becomes a tiled bench by the pond at home). A picnic at the Alameda balcony.
// State: F.ronda = {days: [day keys visited], tiles: {id: true}, bench, picnics, picnicDay}; F.learned = {tapas id: true}.
import { esc, dayKey } from "../util.js";
import { icon } from "../art/icons.js";
import { ITEMS, seasonOf } from "../data/items.js";
import { TOWN_GOODS, TILES, TASTINGS, PAINT } from "../data/towns.js";
import { TAPAS, needText } from "./kitchen.js";
import { addCuttings, vineState } from "./vineyard.js";

// the goods become ordinary items (the backpack, the kitchen, the gelato fridge, the fillings shelf, gifts)
Object.entries(TOWN_GOODS).forEach(([id, g]) => { if (!ITEMS[id]) ITEMS[id] = {n: g.n, ico: id, kind: g.kind, price: g.price, sell: g.sell, what: g.what, ...(g.line ? {line: g.line} : {}), ...(g.to ? {to: g.to, say: g.say} : {}), ...(g.says ? {says: g.says} : {})}; });

export const VINES = {price: 120, n: 3};   // three Tempranillo cuttings
export function rondaState(F){ F.ronda = F.ronda || {}; const r = F.ronda; r.days = r.days || []; r.tiles = r.tiles || {}; r.picnics = r.picnics || 0; return r; }
// a day in Ronda (counted once per day): Rafael sells vines from the second visit
export function rondaVisit(F, day = dayKey()){ const r = rondaState(F); if (!r.days.includes(day)) r.days = [...r.days, day].slice(-30); return r.days.length; }
export const trusted = F => rondaState(F).days.length >= 2;

export function buyGood(F, id, addInv){
  const g = TOWN_GOODS[id]; if (!g || F.coins < g.price) return null;
  F.coins -= g.price; addInv(id, 1); return g;
}
export function buyVines(F){ if (!trusted(F) || F.coins < VINES.price) return null; F.coins -= VINES.price; addCuttings(F, "tempranillo", VINES.n); return true; }
export function taste(F, id){
  const t = TASTINGS[id]; if (!t || F.coins < t.price) return null;
  F.coins -= t.price; F.learned = F.learned || {}; const fresh = !F.learned[id]; F.learned[id] = true; return {fresh, line: t.line};
}
export const tileOn = (id, day = dayKey()) => !TILES[id].seasons || TILES[id].seasons.includes(seasonOf(day));
export function buyTile(F, id, day = dayKey()){
  const r = rondaState(F), t = TILES[id]; if (!t || r.tiles[id] || !tileOn(id, day) || F.coins < t.price) return null;
  F.coins -= t.price; r.tiles[id] = true; const all = Object.keys(TILES).every(k => r.tiles[k]); if (all) r.bench = true;
  return {t, all};
}
// round 116: a café con leche and a churro at one of Doña Carmen's marble tables
// (or churros con chocolate: thick hot chocolate for dipping)
export const CAFE_PRICE = 3, CAFE = {leche: {n: "Café con leche and a churro", price: 3, line: "Sit down at a marble table under the fan. Doña Carmen brings it over."},
  choc: {n: "Churros con chocolate", price: 4, line: "A plate of hot churros and a cup of chocolate so thick the spoon stands up."}};
export function cafeTreat(F, kind = "leche"){ const c = CAFE[kind]; if (!c || F.coins < c.price) return null; F.coins -= c.price; const r = rondaState(F); r.cafes = (r.cafes || 0) + 1; return r.cafes; }
export function picnic(F, addInv, day = dayKey()){
  const r = rondaState(F); if (!(F.inv && F.inv.picnic > 0)) return null;
  addInv("picnic", -1); r.picnics++; r.picnicDay = day; return true;
}

/* ---------- panels ---------- */
const shut = `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
const coin = () => icon("coin", 13);
const goodRow = (F, id) => { const g = TOWN_GOODS[id], have = (F.inv || {})[id] || 0;
  return `<li><span class="wpic">${icon(id, 28)}</span><span class="wtxt"><b>${esc(g.n)}</b><small>${esc(g.what || g.say || "")}${have ? ` (${have} in your backpack)` : ""}</small></span><button class="btn small primary" data-rbuy="${id}" ${F.coins >= g.price ? "" : "disabled"}>${g.price} ${coin()}</button></li>`; };
const shopGoods = shop => Object.keys(TOWN_GOODS).filter(id => TOWN_GOODS[id].shop === shop);
export function marketPanel(F){
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>The covered market</h2><p class="sub">Crates of oranges, sacks of almonds, hams hanging from the beams. Rafael's family stall is at the front: five generations of olive oil.</p>`;
  h += `<ul class="hlist wlist">${shopGoods("mercado").map(id => goodRow(F, id)).join("")}</ul>`;
  const v = vineState(F);
  h += `<h3 class="ph3">Vine cuttings</h3>` + (trusted(F)
    ? `<ul class="hlist wlist"><li><span class="wpic">${icon("grape_tempranillo", 28)}</span><span class="wtxt"><b>Tempranillo cuttings (${VINES.n})</b><small>From Rafael's own vines in the valley. Plant them on a trellis at home for a deep Spanish red.${v.tempra ? ` You have ${v.cuttings.tempranillo || 0} to plant.` : ""}</small></span><button class="btn small primary" data-rbuy="vines" ${F.coins >= VINES.price ? "" : "disabled"}>${VINES.price} ${coin()}</button></li></ul>`
    : `<p class="muted">Rafael's got Tempranillo vines in the valley. "Cuttings? For a stranger? Come back again, and we'll talk."</p>`);
  return h + shut;
}
export function tapasBarPanel(F){
  const L = F.learned || {};
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>The tapas bar</h2><p class="sub">A table on the terrace, a little plate at a time. Taste a dish and you'll know how to make it: it goes on your stove at home.</p>`;
  h += `<ul class="hlist wlist">${Object.entries(TASTINGS).map(([id, t]) => { const T = TAPAS[id];
    return `<li><span class="wtxt"><b>${esc(T.n)}${L[id] ? " ✓" : ""}</b><small>${L[id] ? `In your recipe book: ${esc(needText(T.need))}.` : "Not tried yet."}</small></span><button class="btn small ${L[id] ? "alt" : "primary"}" data-rtaste="${id}" ${F.coins >= t.price ? "" : "disabled"}>${L[id] ? "Again" : "Taste"} · ${t.price} ${coin()}</button></li>`; }).join("")}</ul>`;
  return h + shut;
}
export function shopPanel(F, shop){
  const head = {dulces: ["Doña Carmen's café", "Trays of yemas like little golden suns, and almond cakes dusted with sugar. Doña Carmen learned the yemas from the nuns when she was a girl."],
    especias: ["The spice stall", "Sacks and tins of everything: saffron from La Mancha, smoked paprika from La Vera, cumin, cinnamon, little bags of mixed spices for paella."],
    ceramica: ["The ceramics corner", "Plates, bowls and jugs painted blue, yellow and green, in the old Moorish patterns. Some are a bit wonky. Those are the best ones."],
    postales: ["The postcard stand", "A creaky spinning stand by the door: postcards of the bridge, magnets of little white houses, and lace fans in a basket."],
    cuero: ["Antonio's leather workshop", "Everything here was cut and stitched by hand in Ubrique, the leather village over the hills: wallets, bags, belts, notebooks. Antonio does the repairs himself, at the bench."],
    convento: ["The convent hatch", "A wooden turntable in the wall. You knock, say what you'd like, put your coins on it, and it turns: biscuits, from nuns you never see."]}[shop];
  const cafe = shop === "dulces" ? `<h3 class="ph3">At a table</h3><ul class="hlist wlist">${Object.entries(CAFE).map(([k, c]) => `<li><span class="wpic">${icon(k === "leche" ? "coffee" : "churros", 28)}</span><span class="wtxt"><b>${esc(c.n)}</b><small>${esc(c.line)}</small></span><button class="btn small primary" data-rcafe="${k}" ${F.coins >= c.price ? "" : "disabled"}>${c.price} ${coin()}</button></li>`).join("")}</ul><h3 class="ph3">To take away</h3>` : "";
  return `<span class="tape gingham" aria-hidden="true"></span><h2>${esc(head[0])}</h2><p class="sub">${esc(head[1])}</p>${cafe}<ul class="hlist wlist">${shopGoods(shop).map(id => goodRow(F, id)).join("")}</ul>` + shut;
}
const tilePic = (t, own) => `<svg viewBox="0 0 40 40" width="44" height="44" aria-hidden="true"><rect x="2" y="2" width="36" height="36" rx="2" fill="${own ? "#FFFDF6" : "#EFE8DA"}" stroke="#3b3530" stroke-width="1.4"/><rect x="6" y="6" width="28" height="28" fill="none" stroke="#3E6BAE" stroke-width="2"/><circle cx="20" cy="20" r="8" fill="${t.col}" opacity="${own ? 1 : .35}"/><path d="M6 6l5 5M34 6l-5 5M6 34l5-5M34 34l-5-5" stroke="#3E6BAE" stroke-width="1.4"/></svg>`;
export function tilePanel(F, day = dayKey(), st = {}){
  const r = rondaState(F), n = Object.keys(TILES).filter(k => r.tiles[k]).length;
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>Lucía's tile shop</h2><p class="sub">Lucía paints a tile of every view in Ronda. Collect all eight and they'll make a tiled bench by your pond at home. ${n}/8 so far.${r.bench ? " The bench is done!" : ""}</p>`;
  h += `<div class="tilegrid">${Object.entries(TILES).map(([id, t]) => { const own = r.tiles[id], on = tileOn(id, day);
    return `<button class="tile${own ? " own" : ""}" data-rtile="${id}" ${own || !on || F.coins < t.price ? "disabled" : ""}>${tilePic(t, own)}<b>${esc(t.n)}</b><small>${own ? "yours" : on ? `${t.price} coins` : `in ${t.seasons.join(" and ")}`}</small></button>`; }).join("")}</div>`;
  h += paintHtml(F, st);
  h += `<h3 class="ph3">And for presents</h3><ul class="hlist wlist">${shopGoods("azulejos").map(id => goodRow(F, id)).join("")}</ul>`;
  return h + shut;
}

/* ---------- round 118: three things to join in with, Ronda style ---------- */
// Flamenco in the tapas bar (1 to 3, 8 to 10): clap the palmas along with Manolo's bulería. Twelve beats, the claps
// fall on 3, 6, 8, 10 and 12; two rounds. Seven good claps (and not too many stray ones) and Rosario pulls you up.
export const SHOWS = [[13*60, 15*60], [20*60, 22*60]], COMPAS = 12, ACCENTS = [2, 5, 7, 9, 11], BEAT_MS = 380, ROUNDS = 2, COUNT_IN = 1500;
export const showOn = hm => SHOWS.some(([a, b]) => hm >= a && hm < b);
export const palmasStart = (now = Date.now()) => ({t0: now + COUNT_IN, clapped: [], hits: 0, misses: 0, done: false});
export const palmasEnd = st => st.t0 + COMPAS*ROUNDS*BEAT_MS;
// a clap at time `now` -> "hit", "miss", "early", "dup" or null (it's over)
export function clap(st, now = Date.now()){
  if (now < st.t0) return "early"; const b = Math.floor((now - st.t0)/BEAT_MS); if (b >= COMPAS*ROUNDS) return null;
  if (st.clapped.includes(b)) return "dup"; st.clapped.push(b);
  if (ACCENTS.includes(b % COMPAS)) { st.hits++; return "hit"; } st.misses++; return "miss";
}
export const ole = st => st.hits >= 7 && st.misses <= 3;
export function flamencoPanel(F, st, hm){
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>Flamenco</h2>`;
  if (!showOn(hm)) return h + `<p class="sub">A little wooden stage in the corner, a chair for the guitarist, and a pair of red shoes under it. Manolo and Rosario do a show at one and at eight.</p>` + shut;
  if (!st || !st.t0) return h + `<p class="sub">Manolo's playing a bulería, Rosario's dancing, and the whole bar is clapping the rhythm: twelve beats, with the claps on <b>3, 6, 8, 10 and 12</b>. Want to join in?</p>
    <div class="actions"><button class="btn primary" data-rflam="start">Clap along</button></div>` + shut;
  const left = st.done ? 0 : 1, cells = Array.from({length: COMPAS}, (_, i) => `<span class="ccell${ACCENTS.includes(i) ? " acc" : ""}">${i + 1}</span>`).join("");
  if (st.done) return h + `<p class="sub">${ole(st) ? `<b>¡Olé!</b> ${st.hits} claps right on the beat. Rosario points at you, laughs, and pulls you up onto the stage for a twirl.` : `${st.hits} claps on the beat. "Not bad!" says Rosario. "Flamenco takes a lifetime. Try again!"`}</p>
    <div class="actions"><button class="btn primary" data-rflam="start">Again</button></div>` + shut;
  return h + `<p class="sub">Clap on the dark beats: 3, 6, 8, 10, 12. Two rounds.${Date.now() < st.t0 ? " Ready... (Manolo counts you in)" : ""}</p>
    <div class="compas">${cells}<span class="cmark" style="animation-delay:${st.t0 - Date.now()}ms;animation-duration:${COMPAS*BEAT_MS}ms;animation-iteration-count:${ROUNDS}"></span></div>
    <p class="muted">On the beat: ${st.hits} · stray: ${st.misses}</p><div class="actions"><button class="btn primary big" data-rflam="clap">Clap!</button></div>` + (left ? "" : shut);
}

// Paint your own tile at Lucía's: pick a colour and a pattern, then the four brush strokes in order (Lucía guides
// your hand if you go wrong); fired in her kiln, it's a keepsake for a shelf at home. Evan does a finger-painted one.
export const paintId = (c, p) => `ptile_${c}_${p}`;
export function paintTile(F, c, p, withEvan, addInv){
  if (!PAINT.colours[c] || !PAINT.patterns[p] || F.coins < PAINT.price) return null;
  F.coins -= PAINT.price; addInv(paintId(c, p), 1); if (withEvan) addInv("etile", 1); const r = rondaState(F); r.painted = (r.painted || 0) + 1; return paintId(c, p);
}
const motif = (p, col, k = 4) => p === "star" ? [`M20 8 L22 17 L31 14 L24 20 L31 26 L22 23 L20 32`, `M20 32 L18 23 L9 26 L16 20 L9 14 L18 17 L20 8`, `M14 20 h12`, `M20 14 v12`].slice(0, k)
  : p === "flower" ? [`M20 20 m-7 0 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0`, `M20 13 q4 -6 0 -6 q-4 0 0 6`, `M27 20 q6 4 6 0 q0 -4 -6 0 M13 20 q-6 4 -6 0 q0 -4 6 0`, `M20 27 v6 M17 31 h6`].slice(0, k)
  : [`M8 14 q6 -6 12 0 t12 0`, `M8 20 q6 -6 12 0 t12 0`, `M8 26 q6 -6 12 0 t12 0`, `M8 32 q6 -6 12 0 t12 0`].slice(0, k);
export const paintPic = (c, p, k = 4, size = 64) => `<svg viewBox="0 0 40 40" width="${size}" height="${size}" aria-hidden="true"><rect x="2" y="2" width="36" height="36" rx="2" fill="#FFFDF6" stroke="#3b3530" stroke-width="1.4"/><rect x="5" y="5" width="30" height="30" fill="none" stroke="${PAINT.colours[c][1]}" stroke-width="1.6"/>${motif(p, 0, k).map(d => `<path d="${d}" fill="none" stroke="${PAINT.colours[c][1]}" stroke-width="2.2" stroke-linecap="round"/>`).join("")}</svg>`;
function paintHtml(F, st = {}){
  const s = st.paint || {}, n = (rondaState(F).painted || 0);
  let h = `<h3 class="ph3">Paint your own tile · ${PAINT.price} ${coin()}</h3>`;
  if (!s.c || !s.p) return h + `<p class="muted">Lucía sits you at her table with a brush.${n ? ` (You've painted ${n} so far.)` : ""} Pick a colour and a pattern:</p>
    <div class="gchips">${Object.entries(PAINT.colours).map(([k, [nm, col]]) => `<button class="gchip${s.c === k ? " on" : ""}" data-rpaint="c:${k}"><span style="color:${col}">●</span> <span>${esc(nm)}</span></button>`).join("")}</div>
    <div class="gchips">${Object.keys(PAINT.patterns).map(k => `<button class="gchip${s.p === k ? " on" : ""}" data-rpaint="p:${k}"><span>${k === "star" ? "Star" : k === "flower" ? "Flower" : "Waves"}</span></button>`).join("")}</div>`;
  const step = s.step || 0;
  if (step < 4) return h + `<div class="paintrow">${paintPic(s.c, s.p, step, 76)}<div><p class="muted">${step ? `Stroke ${step} done. ` : ""}Now stroke ${step + 1} of 4: tap it.${s.oops ? " (Lucía steadies your hand: that one comes later.)" : ""}</p>
    <div class="gchips">${[3, 1, 4, 2].map(i => `<button class="gchip" data-rpaint="s:${i}"><span>Stroke ${i}</span></button>`).join("")}</div></div></div>`;
  return h + `<div class="paintrow">${paintPic(s.c, s.p, 4, 76)}<p class="muted">Lovely. Into the kiln it goes: ${esc(PAINT.patterns[s.p])} in ${esc(PAINT.colours[s.c][0])}.</p></div>
    <div class="actions"><button class="btn primary" data-rpaint="fire" ${F.coins >= PAINT.price ? "" : "disabled"}>Fire it and take it home · ${PAINT.price} ${coin()}</button><button class="btn alt small" data-rpaint="reset">Start again</button></div>`;
}

// Mint tea in the Arab baths, Amina's way: pour from high up so it froths. Three glasses; tap Pour while the teapot's
// high (the marker in the green). Free: she's offering.
export const TEA_ZONE = {at: .82, width: .24}, TEA_GLASSES = 3;
export function teaPanel(F, st, here){
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>Mint tea</h2>`;
  if (!here) return h + `<p class="sub">A low brass table and cushions, a silver teapot, little painted glasses. Amina makes the tea when she's here (10 to 2, and 4 to 7).</p>` + shut;
  if (!st || !st.t0) return h + `<p class="sub">Amina pours mint tea the old way: from high, high up, so it froths in the glass. "You try. Higher! Higher!"</p><div class="actions"><button class="btn primary" data-rtea="start">Pour the tea</button></div>` + shut;
  const glasses = Array.from({length: TEA_GLASSES}, (_, i) => `<span class="tglass${st.glasses[i] === true ? " good" : st.glasses[i] === false ? " meh" : ""}"></span>`).join("");
  if (st.glasses.length >= TEA_GLASSES) { const good = st.glasses.filter(Boolean).length;
    return h + `<div class="tglasses">${glasses}</div><p class="sub">${good >= 2 ? `"¡Perfecto!" Amina claps. ${good} glasses with a proper froth on top.` : `"More height!" Amina laughs, and drinks the flat one herself.`}</p><div class="actions"><button class="btn primary" data-rtea="start">Pour again</button></div>` + shut; }
  return h + `<div class="tglasses">${glasses}</div><p class="sub">Tap Pour when the teapot's up high (in the green).</p>
    <div class="fbar"><span class="fzone" style="left:${((TEA_ZONE.at - TEA_ZONE.width/2)*100).toFixed(1)}%;width:${(TEA_ZONE.width*100).toFixed(1)}%"></span><span class="fmark" style="animation-delay:-${(Date.now() - st.t0) % 1800}ms"></span></div>
    <div class="actions"><button class="btn primary" data-rtea="pour">Pour</button></div>`;
}
// the marker sweeps 0..1 and back every 1.8s (the same as the fishing reel bar)
export const teaAt = (t0, now = Date.now()) => { const p = ((now - t0)/900) % 2; return p < 1 ? p : 2 - p; };
export function pour(st, now = Date.now()){ const ok = Math.abs(teaAt(st.t0, now) - TEA_ZONE.at) <= TEA_ZONE.width/2; st.glasses.push(ok); return ok; }
export function rondaPanel(F, view, st = {}){
  return view === "mercado" ? marketPanel(F) : view === "tapas" ? tapasBarPanel(F) : view === "azulejos" ? tilePanel(F, dayKey(), st) : view === "flamenco" ? flamencoPanel(F, st.flam, st.hm)
    : view === "tea" ? teaPanel(F, st.tea, st.amina) : shopPanel(F, view);
}
// the tiled bench by the pond at home, once all eight tiles are collected (core.js draws it at home base)
export const tileBench = (x, y) => `<g class="tilebench" pointer-events="none" filter="url(#wob)"><rect x="${x - 34}" y="${y - 20}" width="68" height="14" rx="2" fill="#FFFDF6" stroke="#3b3530" stroke-width="1.2"/>${Object.values(TILES).map((t, i) => `<rect x="${x - 32 + i*8}" y="${y - 18}" width="7" height="10" fill="${i % 2 ? "#3E6BAE" : "#FFFDF6"}" stroke="#3b3530" stroke-width=".5"/><circle cx="${x - 28.5 + i*8}" cy="${y - 13}" r="2.2" fill="${t.col}"/>`).join("")}
  <rect x="${x - 36}" y="${y - 6}" width="72" height="16" rx="2" fill="#F3ECDD" stroke="#3b3530" stroke-width="1.2"/>${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<rect x="${x - 34 + i*8.6}" y="${y - 3}" width="7.6" height="9" fill="${i % 2 ? "#F3C969" : "#3E6BAE"}" stroke="#3b3530" stroke-width=".5"/>`).join("")}</g>`;
