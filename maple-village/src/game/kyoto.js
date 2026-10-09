// Kyoto's places and things to join in with (rounds 122–124). The shops sell TOWN_GOODS (bought through ronda.js
// buyGood, the same data-rbuy buttons as Ronda's). Four things to take part in, each a little more than a speech bubble:
//   the tea ceremony with Sachiko (whisk in time with her, then turn the bowl and bow), meditation with Jōshin
//   (breathe with the circle, then he rings the bell), making a nerikiri sweet with Mr Tanaka (pick the season's
//   shape, four steps), and throwing a cup at Ishida's wheel (centre the clay three times). Evan joins in each.
// The yukata shop rents yukata for the day (Mel's dress, Evan's little jinbei). The stamp book: eight ink stamps
// from round the town; a full book puts a stone lantern by the pond at home.
// State: F.kyoto = {stamps: {k: day}, lantern, yukata: {day, col}, teas, sits, sweets, cups, fortunes}
import { esc, dayKey } from "../util.js";
import { icon } from "../art/icons.js";
import { ITEMS, seasonOf } from "../data/items.js";
import { TOWN_GOODS } from "../data/towns.js";

export function kyotoState(F){ F.kyoto = F.kyoto || {}; const k = F.kyoto; k.stamps = k.stamps || {}; return k; }
const shut = `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
const coin = () => icon("coin", 13);
const goods = shop => Object.keys(TOWN_GOODS).filter(id => TOWN_GOODS[id].shop === shop);
const row = (F, id) => { const g = TOWN_GOODS[id], have = (F.inv || {})[id] || 0;
  return `<li><span class="wpic">${icon(id, 28)}</span><span class="wtxt"><b>${esc(g.n)}</b><small>${esc(g.what || g.say || g.line || "")}${have ? ` (${have} in your backpack)` : ""}${g.kind === "keepsake" ? " · a keepsake for a shelf" : ""}</small></span><button class="btn small primary" data-rbuy="${id}" ${F.coins >= g.price ? "" : "disabled"}>${g.price} ${coin()}</button></li>`; };
const list = (F, shop, title) => { const ids = goods(shop); return ids.length ? `${title ? `<h3 class="ph3">${esc(title)}</h3>` : ""}<ul class="hlist wlist">${ids.map(id => row(F, id)).join("")}</ul>` : ""; };

/* ---------- the stamp book ---------- */
export const STAMPS = {bamboo: ["Bamboo grove", "#6E9A44"], pagoda: ["The pagoda", "#C8432F"], tea: ["The tea house", "#5E7A4A"], sweets: ["The sweet shop", "#E8A0B4"],
  torii: ["Torii gates", "#D0452F"], zen: ["Gravel garden", "#8A8478"], stones: ["Turtle stones", "#3E6B8C"], market: ["The market", "#C98A3A"]};
// the places that give a stamp (outdoor spots and the rooms you walk into)
export const STAMP_AT = {ktbamboo: "bamboo", ktpagoda: "pagoda", kt_tea: "tea", kt_sweets: "sweets", kttorii: "torii", ktzen: "zen", ktstones: "stones", kt_market: "market"};
// -> the stamp's name if it's new, else null; a full book lights the lantern at home
export function stamp(F, place, day = dayKey()){
  const s = STAMP_AT[place], k = kyotoState(F); if (!s || k.stamps[s]) return null;
  k.stamps = {...k.stamps, [s]: day}; const full = Object.keys(STAMPS).every(x => k.stamps[x]); if (full) k.lantern = true;
  return {n: STAMPS[s][0], full};
}
export const stampCount = F => Object.keys(kyotoState(F).stamps).length;
const stampPic = (s, on) => `<svg viewBox="0 0 40 40" width="46" height="46" aria-hidden="true"><rect x="2" y="2" width="36" height="36" rx="3" fill="${on ? "#FFFDF6" : "#EFE8DA"}" stroke="#3b3530" stroke-width="1.2"/>${on ? `<circle cx="20" cy="20" r="13" fill="none" stroke="${STAMPS[s][1]}" stroke-width="2.4"/><circle cx="20" cy="20" r="8" fill="${STAMPS[s][1]}" opacity=".85"/><path d="M14 30 l12 -20" stroke="#FFFDF6" stroke-width="1.6"/>` : `<text x="20" y="25" text-anchor="middle" font-size="12" fill="#B9B0A4">?</text>`}</svg>`;
export function bookHtml(F){
  const k = kyotoState(F), n = stampCount(F);
  return `<h3 class="ph3">Your stamp book · ${n}/8</h3><p class="muted">Ink seal stamps from round Kyoto: walk up to each place and it's stamped in.${k.lantern ? " The book's full: there's a stone lantern by your pond at home." : " Fill the book and there'll be a little stone lantern by your pond at home."}</p>
    <div class="tilegrid">${Object.entries(STAMPS).map(([s, [nm]]) => `<div class="tile${k.stamps[s] ? " own" : ""}">${stampPic(s, !!k.stamps[s])}<b>${esc(nm)}</b></div>`).join("")}</div>`;
}

/* ---------- the yukata shop ---------- */
export const YUKATA = {price: 15, cols: {indigo: ["Indigo with white flowers", "indigo"], red: ["Red with gold fans", "crimson"], sky: ["Pale blue with goldfish", "pale blue"]}};
export const yukataOn = (F, day = dayKey()) => { const y = kyotoState(F).yukata; return y && y.day === day ? y.col : null; };
export function rentYukata(F, col, day = dayKey()){ if (!YUKATA.cols[col] || F.coins < YUKATA.price || yukataOn(F, day)) return null; F.coins -= YUKATA.price; kyotoState(F).yukata = {day, col}; return YUKATA.cols[col][0]; }
export function yukataPanel(F, evanToo){
  const on = yukataOn(F);
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>The yukata shop</h2><p class="sub">Rows of cotton summer kimonos, an obi sash to go with each, and wooden sandals. Wear one round Kyoto for the day; bring it back on your way to the train.</p>`;
  h += on ? `<p><b>You're wearing the ${esc(YUKATA.cols[on][0].toLowerCase())} today.</b>${evanToo ? " Evan's in his little jinbei, very pleased with himself." : ""}</p>`
    : `<h3 class="ph3">Rent one for the day · ${YUKATA.price} ${coin()}</h3><ul class="hlist wlist">${Object.entries(YUKATA.cols).map(([k, [nm]]) => `<li><span class="wtxt"><b>${esc(nm)}</b><small>${evanToo ? "Evan gets a matching jinbei, free." : "With an obi and sandals."}</small></span><button class="btn small primary" data-kt="yukata:${k}" ${F.coins >= YUKATA.price ? "" : "disabled"}>Wear it</button></li>`).join("")}</ul>`;
  return h + list(F, "ktyukata", "And to take home") + shut;
}

/* ---------- the tea ceremony (the tea house) ---------- */
// Whisk the matcha in time with Sachiko: she taps a soft beat; eight whisks, each one close to a beat counts. Six or
// more and the tea's a perfect froth. Then turn the bowl twice and bow.
export const TEA = {price: 10, BEAT: 560, WHISKS: 8, WINDOW: 150, COUNT_IN: 1200};
export const whiskStart = (now = Date.now()) => ({t0: now + TEA.COUNT_IN, good: 0, n: 0, done: false, bowed: false});
export function whisk(st, now = Date.now()){
  if (st.n >= TEA.WHISKS || now < st.t0 - TEA.WINDOW) return null;
  const off = ((now - st.t0) % TEA.BEAT + TEA.BEAT) % TEA.BEAT, d = Math.min(off, TEA.BEAT - off), ok = d <= TEA.WINDOW;
  st.n++; if (ok) st.good++; if (st.n >= TEA.WHISKS) st.done = true; return ok;
}
export const froth = st => st.good >= 6;
export function teaPanel(F, st){
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>The tea house</h2><p class="sub">Sachiko kneels by the kettle. A scroll in the alcove, one branch in a vase, the garden through the open screens.</p>`;
  if (st && st.t0) {
    if (!st.done) return h + `<p class="sub">Whisk when the circle pulses: quick little "M" shapes. ${st.n}/${TEA.WHISKS}${Date.now() < st.t0 ? " · Sachiko counts you in..." : ""}</p>
      <div class="ktpulse"><span style="animation-duration:${TEA.BEAT}ms;animation-delay:${st.t0 - Date.now()}ms"></span></div><div class="actions"><button class="btn primary big" data-kt="whisk">Whisk</button></div>`;
    if (!st.bowed) return h + `<p class="sub">${froth(st) ? `A perfect jade froth, fine as silk. Sachiko nods once. That means a great deal.` : `A bit of froth, a few bubbles. "Good," says Sachiko kindly. "Next time, lighter wrist."`}</p>
      <p class="muted">Now the last part: turn the bowl twice, so its prettiest side faces your host, and bow.</p><div class="actions"><button class="btn primary" data-kt="bow">Turn the bowl, and bow</button></div>`;
    return h + `<p class="sub">You drink in three sips. Bitter, then sweet, then quiet. "One meeting, one chance," says Sachiko.</p><div class="actions"><button class="btn alt" data-kt="teaagain">Another bowl</button></div>` + list(F, "kt_tea", "From the tea house") + shut;
  }
  return h + `<h3 class="ph3">The tea ceremony · ${TEA.price} ${coin()}</h3><p class="muted">Sachiko shows you how: warm the bowl, whisk the matcha, turn the bowl, bow. Evan gets a little sweet (and copies the bow).</p>
    <div class="actions"><button class="btn primary" data-kt="tea" ${F.coins >= TEA.price ? "" : "disabled"}>Sit down for tea · ${TEA.price} ${coin()}</button></div>` + list(F, "kt_tea", "From the tea house") + shut;
}

/* ---------- meditation (the temple hall) ---------- */
// Breathe with Jōshin: the circle grows (breathe in) for four seconds, then shrinks (breathe out). Tap the right one
// each time, three breaths. Then he strikes the bell (and Evan rings it after, too hard).
export const BREATH = {HALF: 4000, BREATHS: 3, COUNT_IN: 1500};
export const sitStart = (now = Date.now()) => ({t0: now + BREATH.COUNT_IN, taps: [], done: false});
export const breathPhase = (st, now = Date.now()) => now < st.t0 ? "ready" : Math.floor((now - st.t0)/BREATH.HALF) % 2 ? "out" : "in";
export function breathe(st, which, now = Date.now()){
  const ph = breathPhase(st, now); if (ph === "ready" || st.done) return null;
  const half = Math.floor((now - st.t0)/BREATH.HALF); if (st.taps.some(t => t.half === half)) return "again";
  const ok = ph === which; st.taps.push({half, ok}); if (st.taps.length >= BREATH.BREATHS*2) st.done = true; return ok ? "ok" : "off";
}
export const calm = st => st.taps.filter(t => t.ok).length >= 5;
const FORTUNES = [["Great blessing", "Everything you start this season will grow. Water it."], ["Blessing", "A small kindness comes back to you twice."], ["Middle blessing", "Patience. The kettle is nearly ready."], ["Small blessing", "A good day for tidying and cups of tea."], ["Future blessing", "Not yet. But soon. Keep going."], ["Bad luck", "Tie this one to the rack and leave it behind. The temple will look after it."]];
export function drawFortune(F, rng = Math.random){ if (F.coins < 1) return null; F.coins -= 1; const k = kyotoState(F); k.fortunes = (k.fortunes || 0) + 1; return FORTUNES[Math.floor(rng()*FORTUNES.length)]; }
export function hallPanel(F, st, fortune){
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>The temple hall</h2><p class="sub">Candlelight, incense, the great bronze bell, and a corner of cushions facing the moss garden, where Jōshin sits.</p>`;
  if (st && st.t0) {
    const ph = breathPhase(st);
    if (!st.done) return h + `<p class="sub">${ph === "ready" ? "Sit comfortably. Let your shoulders drop..." : ph === "in" ? "<b>Breathe in</b>, as the circle grows." : "<b>Breathe out</b>, as the circle shrinks."} (${Math.floor(st.taps.length/2)}/${BREATH.BREATHS} breaths)</p>
      <div class="ktbreath"><span style="animation-duration:${BREATH.HALF*2}ms;animation-delay:${st.t0 - Date.now()}ms"></span></div>
      <div class="actions"><button class="btn primary" data-kt="in">Breathe in</button><button class="btn primary" data-kt="out">Breathe out</button></div>`;
    return h + `<p class="sub">${calm(st) ? "Three slow breaths, right with the circle. Jōshin smiles, picks up the beater, and strikes the bell. The sound goes on and on, and so do you." : "Your breathing wandered a little. \"Mine too, every morning,\" laughs Jōshin, and strikes the bell anyway."}</p><div class="actions"><button class="btn alt" data-kt="sit">Sit again</button></div>` + shut;
  }
  h += `<h3 class="ph3">Sit with Jōshin</h3><p class="muted">Three slow breaths with the breathing circle. Free; there's a little box for a coin if you'd like.</p><div class="actions"><button class="btn primary" data-kt="sit">Sit and breathe</button><button class="btn alt small" data-kt="donate" ${F.coins >= 2 ? "" : "disabled"}>A coin in the box · 2 ${coin()}</button></div>`;
  h += `<h3 class="ph3">A fortune slip · 1 ${coin()}</h3>` + (fortune ? `<p><b>${esc(fortune[0])}.</b> ${esc(fortune[1])}${fortune[0] === "Bad luck" ? " You fold it and tie it to the rack with all the others." : ""}</p>` : `<p class="muted">Shake the wooden box until a stick falls out, and find your slip.</p>`) + `<div class="actions"><button class="btn alt" data-kt="fortune" ${F.coins >= 1 ? "" : "disabled"}>Draw a fortune</button></div>`;
  return h + bookHtml(F) + shut;
}

/* ---------- nerikiri (the sweet shop) ---------- */
// Pick the season's shape, then the four steps in order (Mr Tanaka steadies your hand if you go wrong). It goes in a
// little box, a gift for the family.
export const NERI = {price: 8, shapes: {sakura: ["A cherry blossom", "#F6C7D6", "spring"], ajisai: ["A hydrangea", "#B9A8E0", "summer"], momiji: ["A maple leaf", "#E0782E", "autumn"], tsubaki: ["A camellia", "#C8432F", "winter"]},
  steps: ["Knead the bean paste", "Wrap the filling", "Shape it", "Press in the details"]};
// (the sweets themselves are TOWN_GOODS nk_<shape>, gifts for the family)
export const seasonShape = (day = dayKey()) => Object.keys(NERI.shapes).find(k => NERI.shapes[k][2] === seasonOf(day)) || "momiji";
export function makeNerikiri(F, shape, addInv){ if (!NERI.shapes[shape] || F.coins < NERI.price) return null; F.coins -= NERI.price; addInv("nk_" + shape, 1); const k = kyotoState(F); k.sweets = (k.sweets || 0) + 1; return "nk_" + shape; }
export function sweetsPanel(F, st = {}){
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>The sweet shop</h2><p class="sub">Glass cases of tiny sweets, a different one for every few weeks of the year. Mr Tanaka works at a little wooden counter with a bowl of bean paste and a bamboo stick.</p>`;
  const sh = st.shape, step = st.step || 0;
  h += `<h3 class="ph3">Make a nerikiri with Mr Tanaka · ${NERI.price} ${coin()}</h3>`;
  if (!sh) h += `<p class="muted">Pick a shape. This season's is ${esc(NERI.shapes[seasonShape()][0].toLowerCase())}.</p><div class="gchips">${Object.entries(NERI.shapes).map(([k, [n, col]]) => `<button class="gchip" data-kt="shape:${k}"><span style="color:${col}">●</span> <span>${esc(n)}</span></button>`).join("")}</div>`;
  else if (step < 4) h += `<p class="muted">${esc(NERI.shapes[sh][0])}. ${step ? `${esc(NERI.steps[step - 1])}: done. ` : ""}Next: tap the right step.${st.oops ? " (Mr Tanaka guides your hands: not that one yet.)" : ""}</p><div class="gchips">${[2, 0, 3, 1].map(i => `<button class="gchip" data-kt="step:${i}"><span>${esc(NERI.steps[i])}</span></button>`).join("")}</div>`;
  else h += `<p class="muted">${esc(NERI.shapes[sh][0])}, finished with a tiny wooden press. Mr Tanaka puts it in a box with a paper ribbon.</p><div class="actions"><button class="btn primary" data-kt="neri" ${F.coins >= NERI.price ? "" : "disabled"}>Box it up · ${NERI.price} ${coin()}</button><button class="btn alt small" data-kt="nerireset">Start again</button></div>`;
  return h + list(F, "kt_sweets", "From the shop") + shut;
}

/* ---------- the potter's wheel (the pottery) ---------- */
// Centre the clay: tap while the marker's in the middle (the same sweep as the fishing reel), three times. Pick a
// glaze; Ishida fires it and it's a keepsake. Dad's comes out too, if he's there. (Lopsided.)
export const CUP = {price: 10, glazes: {indigo: "deep indigo", celadon: "pale celadon green", amber: "warm amber"}, ZONE: {at: .5, width: .22}};
export const cupAt = (t0, now = Date.now()) => { const p = ((now - t0)/900) % 2; return p < 1 ? p : 2 - p; };
export const centre = (st, now = Date.now()) => { const ok = Math.abs(cupAt(st.t0, now) - CUP.ZONE.at) <= CUP.ZONE.width/2; st.tries++; if (ok) st.good++; return ok; };
export function throwCup(F, withDad, addInv){ if (F.coins < CUP.price) return null; F.coins -= CUP.price; addInv("k_mycup", 1); if (withDad) addInv("k_dadcup", 1); const k = kyotoState(F); k.cups = (k.cups || 0) + 1; return true; }
export function potteryPanel(F, st = {}){
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>The pottery</h2><p class="sub">Shelves of drying cups, buckets of slip, a cat asleep on a sack of clay, and the kiln ticking at the back.</p>`;
  h += `<h3 class="ph3">Throw a cup on the wheel · ${CUP.price} ${coin()}</h3>`;
  if (st.t0 && st.good < 3) h += `<p class="muted">Centre the clay: press when the marker's in the middle. ${st.good}/3${st.tries > st.good ? " (Ishida: \"Gently!\")" : ""}</p><div class="fbar"><span class="fzone" style="left:${((CUP.ZONE.at - CUP.ZONE.width/2)*100).toFixed(1)}%;width:${(CUP.ZONE.width*100).toFixed(1)}%"></span><span class="fmark" style="animation-delay:-${(Date.now() - st.t0) % 1800}ms"></span></div><div class="actions"><button class="btn primary" data-kt="centre">Press</button></div>`;
  else if (st.t0) h += `<p class="muted">The clay rises into a little cup. Pick a glaze:</p><div class="gchips">${Object.entries(CUP.glazes).map(([k, n]) => `<button class="gchip" data-kt="glaze:${k}"><span>${esc(n)}</span></button>`).join("")}</div>`;
  else h += `<p class="muted">Ishida sits you at the wheel. Wet hands, a lump of clay, and three tries to centre it.</p><div class="actions"><button class="btn primary" data-kt="wheel" ${F.coins >= CUP.price ? "" : "disabled"}>Sit at the wheel</button></div>`;
  return h + list(F, "kt_pottery", "From the shelves") + shut;
}

/* ---------- the covered market ---------- */
export function marketPanel(F){
  return `<span class="tape gingham" aria-hidden="true"></span><h2>The covered market</h2><p class="sub">Fumiko's pickles in wooden tubs, a tofu shop with steam rolling out, a man folding omelettes, knives laid out on blue cloth. Everyone offers you a taste.</p>`
    + list(F, "kt_market") + shut;
}

// the room spots and the panel for each
export function kyotoPanel(F, view, st = {}){
  return view === "kt_tea" ? teaPanel(F, st.tea) : view === "kt_hall" ? hallPanel(F, st.sit, st.fortune) : view === "kt_sweets" ? sweetsPanel(F, st.neri) : view === "kt_pottery" ? potteryPanel(F, st.cup)
    : view === "kt_market" ? marketPanel(F) : view === "ktyukata" ? yukataPanel(F, st.evan) : "";
}
