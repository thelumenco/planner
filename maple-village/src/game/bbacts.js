// Bellbird Valley's things to join in with (round 143), each more than a speech bubble, and Evan in on every one:
//   a balloon ride with Gus (dawn, 6 to 9, or the golden hour, 5 to 7): burner and drift to the right height for each
//     sight as the valley rolls by, and land gently. A flight certificate to keep.
//   riddling in the barrel cave with Jono: give every bottle on the rack its quarter turn till the chalk marks all
//     point up. Jono shows Mel how, and a riddling rack goes up in her wine cellar at home (round 144: sparkling left
//     on it longer sells for more).
//   pick-your-own at the berry farm: the red ones, not the white ones (raspberries and strawberries to take, once a
//     day), and then dip strawberries in Sophie's chocolate: dark, milk or white, and sprinkles. A box to give.
//   bottle-feeding a joey with Kim at the wildlife hospital: warm the bottle, tuck her in her pouch, feed her, and back
//     in the basket. After three feeds (on three days) Pip's strong enough to go back to the bush.
//   a canoe down the river with Bodhi: left, right, left, right to go straight, and a kingfisher at the bend.
//   marshmallows at the campfire with the neighbours, from 5pm: hold it over the coals and take it out when it's
//     golden, not black.
// State: F.bellbird.{flights, riddle (taught), picked (day), dipped, joey (feeds), joeyDay, canoe, mallows, golden}
import { esc, dayKey } from "../util.js";
import { icon } from "../art/icons.js";
import { bbState } from "./bellbird.js";

const shut = `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
const coin = () => icon("coin", 13);
const BALLOON_SVG = `<svg viewBox="0 0 30 36" width="26" height="31"><path d="M15 2 C4 2 2 12 6 18 L11 25 h8 L24 18 C28 12 26 2 15 2z" fill="#E8566C" stroke="#2F2B28" stroke-width="1.2"/><path d="M15 2 C11 8 11 18 13 25 M15 2 C19 8 19 18 17 25" fill="none" stroke="#F3C969" stroke-width="2"/><rect x="11" y="28" width="8" height="6" rx="1" fill="#C9A27E" stroke="#2F2B28" stroke-width="1"/><path d="M11 25 v3 M19 25 v3" stroke="#2F2B28"/></svg>`;
const CANOE_SVG = `<svg viewBox="0 0 44 16" width="44" height="16"><path d="M2 7 Q22 15 42 7 Q22 11 2 7z" fill="#C9433A" stroke="#2F2B28" stroke-width="1.2"/><circle cx="16" cy="5" r="2.4" fill="#2F2B28"/><circle cx="26" cy="5" r="2" fill="#5A3A2A"/></svg>`;
const tape = (t = "gingham") => `<span class="tape ${t}" aria-hidden="true"></span>`;

/* ---------- the balloon ride ---------- */
export const BALLOON = {price: 30, evan: 10, seat: 15, dawn: [6*60, 9*60], gold: [17*60, 19*60]};
export const balloonOpen = hm => (hm >= BALLOON.dawn[0] && hm < BALLOON.dawn[1]) || (hm >= BALLOON.gold[0] && hm < BALLOON.gold[1]);
export const flightCost = party => BALLOON.price + party.reduce((a, id) => a + (id === "evan" ? BALLOON.evan : BALLOON.seat), 0);
// what floats by, and the height to see it best (1 low, 4 high)
export const SIGHTS = [["The vines in rows, like corduroy", 2], ["A mob of kangaroos, bounding off", 1], ["The Cellar Door's red roof, and Pinot the dog", 2], ["Another balloon, waving people", 3],
  ["The whole valley, and the hills going blue", 4], ["The river, flashing in the sun", 3], ["Cows, very small and very surprised", 1], ["Mist in the hollows, like milk", 2]];
export const flightStart = (rng = Math.random) => { const s = [...SIGHTS].sort(() => rng() - .5).slice(0, 5); return {alt: 1, i: 0, seen: [], sights: s, landed: false, soft: false, aloft: false}; };
export function flightMove(st, how){ if (st.landed || st.i >= st.sights.length) return null; st.aloft = true;
  st.alt = Math.max(1, Math.min(4, st.alt + (how === "burn" ? 1 : how === "drift" ? -1 : 0))); const [n, want] = st.sights[st.i]; const ok = st.alt === want; if (ok) st.seen.push(n); st.i++; return ok; }
export function flightLand(st){ if (st.landed || st.i < st.sights.length) return null; st.landed = true; st.soft = st.alt <= 2; return st.soft; }
export function finishFlight(F, st, addInv){ const s = bbState(F); s.flights = (s.flights || 0) + 1; if (!(F.inv || {}).b_flight && !s.flightCert) { s.flightCert = true; addInv("b_flight", 1); return true; } return false; }
export function balloonPanel(F, st, o){
  const hm = o.hm, party = o.party || [], cost = flightCost(party);
  let h = tape("stripe") + `<h2>A balloon ride with Gus</h2>`;
  if (!st) { h += `<p class="sub">Up before the sun, or in the golden hour before it sets: the burner roars, the basket lifts, and the whole valley opens out below.</p>`;
    if (!balloonOpen(hm)) return h + `<p class="muted">Gus only flies at dawn (6 to 9) and in the golden hour (5 to 7), when the air is still. Come back then.</p>` + shut;
    return h + `<p class="muted">${cost} coins: ${BALLOON.price} for you${party.length ? `, and ${party.map(id => id === "evan" ? `${BALLOON.evan} for Evan` : BALLOON.seat).join(", ")} for the others` : ""}.</p><div class="actions"><button class="btn primary" data-bba="fly" ${F.coins >= cost ? "" : "disabled"}>Up we go · ${cost} ${coin()}</button></div>` + shut; }
  if (st.landed) return h + `<p class="sub">${st.soft ? "A gentle bump, a little skid through the grass, and you're down." : "Bump! Bounce! The basket tips over on its side and everyone tumbles out, laughing."} You saw ${st.seen.length} of ${st.sights.length} things from just the right height.</p>${st.seen.length ? `<ul class="hlist">${st.seen.map(s => `<li>${esc(s)}</li>`).join("")}</ul>` : ""}<div class="actions"><button class="btn primary" data-bba="flown">Champagne breakfast!</button></div>`;
  const done = st.i >= st.sights.length, next = done ? null : st.sights[st.i];
  h += `<div class="bbsky" aria-hidden="true">${[1, 2, 3, 4].map(a => `<span class="bbalt${a === st.alt ? " on" : ""}">${a === st.alt ? BALLOON_SVG : ""}</span>`).join("")}</div>`;
  h += done ? `<p class="sub">The field's coming up. Gus says: "Low and gentle, now." Let some air out, and bring her down.</p><div class="actions"><button class="btn alt" data-bba="drift">Let some air out</button><button class="btn primary" data-bba="land">Land</button></div>`
    : `<p class="sub">Coming up: ${esc(next[0].toLowerCase())}. ${["Lower is better for that.", "Low-ish, Gus says.", "A bit higher.", "Right up high for this one."][next[1] - 1]} You're at ${["treetop height", "low", "middling", "right up high"][st.alt - 1]}.</p><div class="actions"><button class="btn primary" data-bba="burn">Burner (up)</button><button class="btn alt" data-bba="hold">Hold steady</button><button class="btn alt" data-bba="drift">Drift (down)</button></div>`;
  return h + `<p class="muted">${st.seen.length} seen so far.</p>`;
}

/* ---------- riddling in the barrel cave ---------- */
export const RIDDLE = {N: 8};
export const riddleStart = (rng = Math.random) => { const turns = Array.from({length: RIDDLE.N}, () => Math.floor(rng()*4)); if (turns.every(t => !t)) turns[0] = 2; return {turns, taps: 0}; };
export function riddleTap(st, i){ if (i < 0 || i >= st.turns.length) return false; st.turns[i] = (st.turns[i] + 1) % 4; st.taps++; return true; }
export const riddleDone = st => st.turns.every(t => !t);
export function finishRiddle(F){ const s = bbState(F), first = !s.riddle; s.riddle = s.riddle || dayKey(); s.riddles = (s.riddles || 0) + 1; return first; }
export function riddlePanel(F, st){
  let h = tape("stripe") + `<h2>Riddling with Jono</h2>`;
  if (!st) return h + `<p class="sub">The sparkling sits neck-down in the A-frame racks, and every day each bottle gets a quarter turn and a little tap, so the yeast slides down into the neck. Jono's chalked a mark on every base: turn each one till its mark points straight up.</p><div class="actions"><button class="btn primary" data-bba="riddle">Have a go</button></div>${bbState(F).riddle ? `<p class="muted">You know how now: there's a riddling rack in your own wine cellar at home.</p>` : ""}` + shut;
  h += `<p class="sub">Tap a bottle to give it a quarter turn. All the chalk marks pointing up.</p><div class="bbrack">${st.turns.map((t, i) => `<button class="bbbottle" data-bba="turn:${i}" aria-label="Bottle ${i + 1}, mark at ${["12", "3", "6", "9"][t]} o'clock"><svg viewBox="0 0 40 40" width="40" height="40"><circle cx="20" cy="20" r="16" fill="#3E5A3A" stroke="#2F2B28" stroke-width="1.6"/><circle cx="20" cy="20" r="7" fill="#2E3A2A"/><g transform="rotate(${t*90} 20 20)"><path d="M20 5 v8" stroke="#FFFDF6" stroke-width="3" stroke-linecap="round"/></g></svg></button>`).join("")}</div>`;
  return h + (riddleDone(st) ? `<div class="actions"><button class="btn primary" data-bba="riddled">All turned!</button></div>` : `<p class="muted">${st.turns.filter(t => !t).length} of ${st.turns.length} pointing up.</p>`);
}

/* ---------- pick your own, and dipping in chocolate ---------- */
export const BERRIES = {N: 12};
export const berriesStart = (rng = Math.random) => { const ripe = Array.from({length: BERRIES.N}, () => rng() < .6); if (!ripe.some(Boolean)) ripe[0] = true; return {ripe, kind: Array.from({length: BERRIES.N}, () => rng() < .5 ? "rasp" : "straw"), picked: [], oops: 0}; };
export function pickBerry(st, i){ if (st.picked.includes(i) || i < 0 || i >= st.ripe.length) return null; if (!st.ripe[i]) { st.oops++; return "unripe"; } st.picked.push(i); return "ok"; }
export const berriesDone = st => st.ripe.every((r, i) => !r || st.picked.includes(i));
export function finishBerries(F, st, addInv){ const s = bbState(F); s.picks = (s.picks || 0) + 1; if (s.picked === dayKey()) return null; s.picked = dayKey();
  const rasp = Math.max(1, st.picked.filter(i => st.kind[i] === "rasp").length), straw = Math.max(1, st.picked.length - rasp); addInv("raspberry", Math.min(rasp, 4)); addInv("strawberry", Math.min(straw, 4)); return {rasp: Math.min(rasp, 4), straw: Math.min(straw, 4)}; }
export function berriesPanel(F, st, evan){
  let h = tape() + `<h2>Pick your own</h2>`;
  if (!st) return h + `<p class="sub">A little basket each, and the rows to yourselves. Red ones only: the white and green ones aren't ready.${bbState(F).picked === dayKey() ? " (You've picked today: what's in the basket now is for eating.)" : ""}</p><div class="actions"><button class="btn primary" data-bba="pick">Grab a basket</button></div>` + shut;
  h += `<p class="sub">Tap the ripe ones.${evan ? " Evan's \"helping\". Half of his are going straight in." : ""}</p><div class="bbberries">${st.ripe.map((r, i) => { const got = st.picked.includes(i), straw = st.kind[i] === "straw", col = r ? (straw ? "#E8566C" : "#C2334D") : (straw ? "#F3F0DA" : "#D9E3B0");
    return `<button class="bbberry${got ? " got" : ""}" data-bba="berry:${i}" ${got ? "disabled" : ""} aria-label="${r ? "ripe" : "not ripe"} ${straw ? "strawberry" : "raspberry"}"><svg viewBox="0 0 30 30" width="30" height="30">${straw ? `<path d="M15 27 C6 20 5 11 9 8 h12 c4 3 3 12 -6 19z" fill="${col}" stroke="#2F2B28" stroke-width="1.2"/><path d="M9 8 l3 -4 l3 3 l3 -3 l3 4z" fill="#7FA35A" stroke="#2F2B28" stroke-width="1"/>` : `${[[11, 12], [17, 12], [14, 17], [10, 18], [18, 18], [14, 23]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.2" fill="${col}" stroke="#2F2B28" stroke-width=".9"/>`).join("")}<path d="M11 7 l3 -3 l3 3" fill="none" stroke="#7FA35A" stroke-width="1.6"/>`}${got ? `<path d="M6 15 l6 6 l12 -12" fill="none" stroke="#5E8A48" stroke-width="3"/>` : ""}</svg></button>`; }).join("")}</div>`;
  return h + (berriesDone(st) ? `<div class="actions"><button class="btn primary" data-bba="picked">Basket's full</button></div>` : `<p class="muted">${st.picked.length} picked${st.oops ? `, ${st.oops} put back` : ""}.</p>`);
}
export const DIP = {price: 4, need: 2, choc: {dark: "Dark", milk: "Milk", white: "White"}, tops: {none: "Nothing", sprinkles: "Hundreds and thousands", nuts: "Crushed nuts", coconut: "Coconut"}};
export function dipBerries(F, choc, top){ if (!DIP.choc[choc] || !DIP.tops[top] || F.coins < DIP.price || ((F.inv || {}).strawberry || 0) < DIP.need) return null;
  F.coins -= DIP.price; F.inv.strawberry -= DIP.need; if (F.inv.strawberry <= 0) delete F.inv.strawberry; const s = bbState(F); s.dipped = (s.dipped || 0) + 1; return {choc, top}; }
export function dipPanel(F, st = {}, evan){
  const have = (F.inv || {}).strawberry || 0, ok = have >= DIP.need && F.coins >= DIP.price;
  return tape("stripe") + `<h2>Dipping with Sophie</h2><p class="sub">Two strawberries on little forks, into the warm chocolate, a twirl, and something on top while it's wet. ${DIP.price} coins for the chocolate (you bring the berries: you've got ${have}).</p>
    <p class="eyebrow" style="margin:10px 0 6px">Chocolate</p><div class="gchips">${Object.entries(DIP.choc).map(([k, n]) => `<button class="gchip${st.choc === k ? " on" : ""}" data-bba="choc:${k}" aria-pressed="${st.choc === k}">${esc(n)}</button>`).join("")}</div>
    <p class="eyebrow" style="margin:10px 0 6px">On top</p><div class="gchips">${Object.entries(DIP.tops).map(([k, n]) => `<button class="gchip${st.top === k ? " on" : ""}" data-bba="top:${k}" aria-pressed="${st.top === k}">${esc(n)}</button>`).join("")}</div>
    ${evan ? `<p class="muted">Evan gets the spoon to lick after.</p>` : ""}<div class="actions"><button class="btn primary" data-bba="dip" ${ok && st.choc && st.top ? "" : "disabled"}>Dip!</button></div>${have < DIP.need ? `<p class="muted">You'll need strawberries: pick your own in the rows outside.</p>` : ""}` + shut;
}

/* ---------- feeding a joey ---------- */
export const JOEY = {STEPS: ["Warm the bottle", "Tuck her into her pouch", "Feed her, slowly", "Back in her basket"], WARM: 3, FEED: 4, RELEASE: 3};
export const joeyStart = () => ({step: 0, warm: 0, feed: 0, oops: false});
export function joeyDo(st, i){ if (st.step >= 4) return null;
  if (i !== st.step) { st.oops = true; return "oops"; } st.oops = false;
  if (i === 0) { st.warm++; if (st.warm >= JOEY.WARM) st.step++; return "ok"; }
  if (i === 2) { st.feed++; if (st.feed >= JOEY.FEED) st.step++; return "ok"; }
  st.step++; return "ok"; }
export const joeyDone = st => st.step >= 4;
export function finishJoey(F){ const s = bbState(F); if (s.joeyDay === dayKey()) return {again: true, feeds: s.joey || 0}; s.joeyDay = dayKey(); s.joey = (s.joey || 0) + 1; return {feeds: s.joey, release: s.joey === JOEY.RELEASE}; }
export function joeyPanel(F, st, evan){
  const feeds = bbState(F).joey || 0;
  let h = tape() + `<h2>Feeding Pip</h2>`;
  if (!st) return h + `<p class="sub">Pip's an orphaned eastern grey joey, about the size of a loaf of bread, all ears and legs. Kim's handing you her bottle.${feeds >= JOEY.RELEASE ? " (Pip's gone back to the bush now, with her mob! This is her friend Clover, just in.)" : feeds ? ` You've fed her ${feeds} time${feeds === 1 ? "" : "s"}.` : ""}</p><div class="actions"><button class="btn primary" data-bba="joey">Feed her</button></div>` + shut;
  h += `<p class="sub">${st.oops ? "Kim gently stops you: \"Not yet, love. One thing at a time.\"" : st.step === 0 ? `Warm the bottle in the jug (${st.warm} of ${JOEY.WARM}).` : st.step === 2 ? `She's sucking! Hold it steady (${st.feed} of ${JOEY.FEED}).` : "Good. What's next?"}${evan ? " Evan's holding his breath so he doesn't scare her." : ""}</p>`;
  h += `<div class="bbsteps">${JOEY.STEPS.map((n, i) => `<button class="btn ${i < st.step ? "alt" : "primary"} small" data-bba="jstep:${i}" ${i < st.step ? "disabled" : ""}>${i < st.step ? "✓ " : ""}${esc(n)}</button>`).join("")}</div>`;
  return h + (joeyDone(st) ? `<div class="actions"><button class="btn primary" data-bba="fed">Night night, Pip</button></div>` : "");
}

/* ---------- a canoe down the river ---------- */
export const CANOE = {price: 6, STROKES: 8};
export const canoeStart = () => ({strokes: [], wobble: 0, last: null});
export function paddle(st, side){ if (st.strokes.length >= CANOE.STROKES) return null; const ok = side !== st.last; if (!ok) st.wobble++; st.last = side; st.strokes.push(side); return ok; }
export const canoeDone = st => st.strokes.length >= CANOE.STROKES;
export function finishCanoe(F, st){ const s = bbState(F); s.canoe = (s.canoe || 0) + 1; return st.wobble <= 2; }
export function canoePanel(F, st, evan, paid){
  let h = tape("stripe") + `<h2>A canoe down the river</h2>`;
  if (!st) return h + `<p class="sub">Bodhi pushes you off from the bank. The river's slow and green, with gums leaning over it from both sides.${evan ? " Evan's in the middle, in the very small life jacket." : ""}</p><div class="actions"><button class="btn primary" data-bba="canoe" ${paid || F.coins >= CANOE.price ? "" : "disabled"}>Hire a canoe · ${CANOE.price} ${coin()}</button></div>` + shut;
  const n = st.strokes.length;
  h += `<p class="sub">${n ? (st.last && st.strokes.length > 1 && st.strokes[n - 1] === st.strokes[n - 2] ? "Whoa, you're going round in a circle! Swap sides." : "Gliding. The water drips off the paddle.") : "Paddle on one side, then the other, to go straight."} (${n} of ${CANOE.STROKES})</p><div class="bbriver" aria-hidden="true"><span style="left:${10 + n/CANOE.STROKES*78}%">${CANOE_SVG}</span></div>`;
  return h + (canoeDone(st) ? `<div class="actions"><button class="btn primary" data-bba="canoed">Round the bend</button></div>` : `<div class="actions"><button class="btn primary" data-bba="paddle:L">Left</button><button class="btn primary" data-bba="paddle:R">Right</button></div>`);
}

/* ---------- marshmallows at the campfire ---------- */
export const MALLOW = {from: 17*60, GOLD: 3, PER_BAG: 6};
export const fireLit = hm => hm >= MALLOW.from;
export function openBag(F){ if (!((F.inv || {}).mallows > 0)) return null; F.inv.mallows--; if (F.inv.mallows <= 0) delete F.inv.mallows; return {left: MALLOW.PER_BAG, heat: 0, golden: 0, burnt: 0}; }
export function toast(st){ if (!st || st.left <= 0) return null; st.heat++; return st.heat > MALLOW.GOLD ? "burnt" : st.heat === MALLOW.GOLD ? "golden" : "warm"; }
export function pullOut(F, st){ if (!st || st.left <= 0 || !st.heat) return null; const r = st.heat === MALLOW.GOLD ? "golden" : st.heat > MALLOW.GOLD ? "burnt" : "pale"; st[r === "pale" ? "golden" : r] += r === "pale" ? 0 : 1; st.left--; st.heat = 0;
  const s = bbState(F); s.mallows = (s.mallows || 0) + 1; if (r === "golden") s.golden = (s.golden || 0) + 1; return r; }
export function firePanel(F, st, o){
  let h = tape() + `<h2>The campfire</h2>`;
  if (!fireLit(o.hm)) return h + `<p class="sub">The fire rings are cold. Wal lights the big one at five, and everyone drifts over with a chair.</p>` + shut;
  if (!st) { const bags = (F.inv || {}).mallows || 0;
    return h + `<p class="sub">The fire's crackling, the chairs are out, and ${o.folk ? "the neighbours shuffle round to make room." : "it's just you and the stars."}${bags ? "" : " You'll need a bag of marshmallows from the camp store."}</p><div class="actions"><button class="btn primary" data-bba="bag" ${bags ? "" : "disabled"}>Open a bag of marshmallows (${bags})</button></div>` + shut; }
  if (st.left <= 0) return h + `<p class="sub">The bag's empty. ${st.golden} golden, ${st.burnt} black. ${st.golden >= 4 ? "Archie nods. \"You've done this before.\"" : st.burnt >= 3 ? "Archie laughs. \"Charcoal's good for the teeth, they say.\"" : "Sticky fingers all round."}</p><div class="actions"><button class="btn primary" data-bba="mdone">Lovely</button></div>`;
  return h + `<p class="sub">${st.heat === 0 ? "A fresh marshmallow on the stick. Hold it over the coals." : st.heat < MALLOW.GOLD ? "It's going soft and pale. A bit longer..." : st.heat === MALLOW.GOLD ? "Golden brown! Pull it out now!" : "It's on fire! Blow it out, quick!"} (${st.left} left in the bag)</p><div class="bbmallow" aria-hidden="true"><span class="h${Math.min(st.heat, 4)}"></span></div><div class="actions"><button class="btn primary" data-bba="toast">Hold it over</button><button class="btn alt" data-bba="pull" ${st.heat ? "" : "disabled"}>Pull it out</button></div>`;
}
