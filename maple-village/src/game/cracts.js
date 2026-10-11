// The Coast Road's things to join in with (round 150), each with Evan in on it:
//   a surf lesson with Jet at Breakwater: paddle, paddle, and pop up as the wave lifts you (too soon and it rolls past,
//     too late and it dumps you). Evan's on a foam board in the whitewash with Jet holding the tail. A photo of your
//     first wave to keep.
//   whale watching from the lighthouse balcony at Lighthouse Point (humpbacks May to November, dolphins the rest of the
//     year): sweep the binoculars across the sea and look for a blow. Win stamps a sighting card the first time.
//   glow-worms in the grotto at Fern Gully, from 6pm: torches off, wait for your eyes, then count the little lights.
//   cray pots with Mags at Fisher's Harbour (mornings): haul each pot, measure against the gauge, keep the big ones,
//     throw back the little ones and the mums carrying eggs. Two crayfish to take home, once a day.
//   the penguin parade from the hide at The Sisters, 6 to 9pm: stay very still and very quiet, and shush Evan when
//     he's about to squeal.
//   Nippers for Evan at Koala Cove with Coach Dimi, mornings: a beach sprint, round the buoy and back, and a dive for
//     the flags. A medal the first time.
//   (and the king parrots at Koala Cove, with a scoop of seed from the park store: core.js townSpot)
// State: F.bellbird.{surfs, surfPhoto, whales, whaleCard, dolphins, glow (best), pots (day), crays, penguins, nippers, medal}
import { esc, dayKey } from "../util.js";
import { icon } from "../art/icons.js";
import { bbState } from "./bellbird.js";

const shut = `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
const coin = () => icon("coin", 13);
const tape = (t = "gingham") => `<span class="tape ${t}" aria-hidden="true"></span>`;
const WAVE_SVG = `<svg viewBox="0 0 60 24" width="60" height="24"><path d="M2 22 C14 22 18 4 34 4 C46 4 50 14 44 16 C40 17 38 12 42 11" fill="none" stroke="#2F6F8C" stroke-width="3" stroke-linecap="round"/><path d="M2 22 C16 22 20 8 34 8" fill="none" stroke="#FFFDF6" stroke-width="2" stroke-linecap="round"/></svg>`;
const WHALE_SVG = `<svg viewBox="0 0 40 20" width="36" height="18"><path d="M4 14 Q12 4 26 8 Q32 10 34 6 L38 3 L36 10 Q30 18 14 17 Q6 17 4 14z" fill="#4E6E8C" stroke="#2F2B28" stroke-width="1.2"/><path d="M14 6 q-1 -4 -3 -5 M14 6 q1 -4 3 -5" stroke="#9CC4D0" stroke-width="1.4" fill="none"/></svg>`;
const DOLPHIN_SVG = `<svg viewBox="0 0 40 20" width="36" height="18"><path d="M3 15 Q14 2 30 8 L37 6 L33 11 Q22 9 12 15 L8 18z" fill="#7A8C9A" stroke="#2F2B28" stroke-width="1.2"/><path d="M18 6 l2 -5 l3 6" fill="#7A8C9A" stroke="#2F2B28" stroke-width="1.2"/></svg>`;
const PENG_SVG = `<svg viewBox="0 0 14 20" width="12" height="18"><ellipse cx="7" cy="12" rx="5" ry="7" fill="#4E6E8C" stroke="#2F2B28" stroke-width="1"/><ellipse cx="7.6" cy="13" rx="3" ry="5" fill="#FFFDF6"/><circle cx="7" cy="4.6" r="3.4" fill="#4E6E8C" stroke="#2F2B28" stroke-width="1"/><path d="M9.6 4.6 l3 .8 l-3 .6z" fill="#2F2B28"/></svg>`;
const BOARD_SVG = `<svg viewBox="0 0 40 20" width="40" height="20"><ellipse cx="20" cy="15" rx="18" ry="3.4" fill="#F3C969" stroke="#2F2B28" stroke-width="1.2"/><circle cx="20" cy="4" r="3" fill="#2F2B28"/><path d="M20 7 v5 M14 9 l6 -1 l6 1" stroke="#2F2B28" stroke-width="2" stroke-linecap="round"/></svg>`;

/* ---------- a surf lesson with Jet ---------- */
// each wave: paddle to build up, and pop up when it peaks (phase 3). Up early: it rolls past. Paddling past the peak: dumped.
export const SURF = {price: 15, evan: 5, WAVES: 5, PEAK: 3};
export const surfCost = evan => SURF.price + (evan ? SURF.evan : 0);
export const surfStart = () => ({wave: 0, phase: 0, rides: 0, last: null});
export function surfDo(st, how){ if (st.wave >= SURF.WAVES) return null;
  if (how === "paddle") { st.phase++; if (st.phase > SURF.PEAK) { st.last = "dumped"; st.wave++; st.phase = 0; } else st.last = "paddle"; return st.last; }
  st.last = st.phase === SURF.PEAK ? "ride" : "early"; if (st.last === "ride") st.rides++; st.wave++; st.phase = 0; return st.last; }
export const surfDone = st => st.wave >= SURF.WAVES;
export function finishSurf(F, st, addInv){ const s = bbState(F); s.surfs = (s.surfs || 0) + 1;
  if (st.rides && !s.surfPhoto && !(F.inv || {}).b_surfphoto) { s.surfPhoto = true; addInv("b_surfphoto", 1); return true; } return false; }
export function surfPanel(F, st, evan, paid){
  let h = tape("stripe") + `<h2>A surf lesson with Jet</h2>`;
  if (!st) return h + `<p class="sub">First on the sand: lie on the board, paddle, and pop up onto your feet. Then out into the little waves between the flags.${evan ? " Evan gets a soft foam board and Jet holding the tail, in the whitewash where it's only up to his knees." : ""}</p><p class="muted">${surfCost(evan)} coins with the board and wetsuit${evan ? ` (${SURF.evan} of it for Evan)` : ""}. ${bbState(F).surfs ? `You've had ${bbState(F).surfs} lesson${bbState(F).surfs === 1 ? "" : "s"}.` : ""}</p><div class="actions"><button class="btn primary" data-bba="surf" ${paid || F.coins >= surfCost(evan) ? "" : "disabled"}>Out we go · ${surfCost(evan)} ${coin()}</button></div>` + shut;
  if (surfDone(st)) return h + `<p class="sub">${st.rides >= 3 ? "Jet's whooping from the shallows. \"Look at you! You're a surfer!\"" : st.rides ? "You stood up! Wobbly, brief, and absolutely glorious." : "Lots of wipeouts and a mouthful of sea. Jet laughs: \"Everyone's first go. Next time.\""} ${st.rides} of ${SURF.WAVES} waves ridden.${evan ? " Evan rode his foam board all the way to the sand, on his tummy, then on his knees, then for one second on his feet." : ""}</p><div class="actions"><button class="btn primary" data-bba="surfed">Back to the sand</button></div>`;
  const msg = {paddle: ["Paddle, paddle...", "The wave's lifting behind you...", "It's picking you up! NOW!"][st.phase - 1], ride: "You pop up, and you're standing! The wave carries you right in. Then back out for the next.", early: "Up too soon: the wave rolls past under you. Back out.", dumped: "Too late! The wave dumps you, board and all. Up you come, laughing."}[st.last] || "A set's coming. Lie on the board and start paddling.";
  h += `<p class="sub">${esc(msg)} (wave ${st.wave + 1} of ${SURF.WAVES})</p><div class="crsurf" aria-hidden="true"><span class="w p${st.phase}">${WAVE_SVG}</span><span class="b">${BOARD_SVG}</span></div>`;
  return h + `<div class="actions"><button class="btn primary" data-bba="spaddle">Paddle</button><button class="btn primary" data-bba="popup">Pop up!</button></div><p class="muted">${st.rides} ridden so far.</p>`;
}

/* ---------- whale watching from the lighthouse ---------- */
export const WHALES = {LOOKS: 6, SECTORS: 8};
export const whaleSeason = day => { const m = +day.slice(5, 7); return m >= 5 && m <= 11; };   // humpbacks heading north in winter, south with calves in spring
const W_SIGNS = ["A blow! A puff of spray, then another", "A tail, lifted right out of the water, then gone", "A breach! The whole whale, up and out, and a huge splash", "A mother and her calf, rolling side by side", "A fin slapping the water, over and over"];
const D_SIGNS = ["Dolphins! A pod of them, arcing through the swell", "A dolphin leaping clean out of a wave", "Dolphins riding the bow wave of a fishing boat", "A baby dolphin, sticking close to its mum"];
export function whaleStart(day = dayKey(), rng = Math.random){ const n = 3, at = new Set(); while (at.size < n) at.add(Math.floor(rng()*WHALES.SECTORS));
  const signs = (whaleSeason(day) ? W_SIGNS : D_SIGNS).slice().sort(() => rng() - .5); return {at: [...at], signs, looked: [], seen: [], whales: whaleSeason(day)}; }
export function whaleLook(st, i){ if (st.looked.includes(i) || st.looked.length >= WHALES.LOOKS || i < 0 || i >= WHALES.SECTORS) return null; st.looked.push(i);
  const k = st.at.indexOf(i); if (k < 0) return "sea"; const sign = st.signs[st.seen.length % st.signs.length]; st.seen.push(sign); return sign; }
export const whaleDone = st => st.looked.length >= WHALES.LOOKS || st.seen.length >= st.at.length;
export function finishWhales(F, st, addInv){ const s = bbState(F), key = st.whales ? "whales" : "dolphins"; s[key] = (s[key] || 0) + st.seen.length;
  if (st.whales && st.seen.length && !s.whaleCard && !(F.inv || {}).b_whalecard) { s.whaleCard = true; addInv("b_whalecard", 1); return true; } return false; }
export function whalePanel(F, st, evan){
  const season = whaleSeason(dayKey());
  let h = tape("stripe") + `<h2>Whale watching</h2>`;
  if (!st) return h + `<p class="sub">Up all hundred and twenty-eight steps, out onto the balcony round the lamp, and the whole ocean's in front of you. ${season ? "It's whale season: the humpbacks are passing, mums and calves heading south." : "The humpbacks are away (they pass from May to November), but the dolphins are here all year."} Win hands you the big binoculars.${evan ? " Evan's got the little ones, upside down." : ""}</p><div class="actions"><button class="btn primary" data-bba="whales">Look out to sea</button></div>` + shut;
  if (whaleDone(st)) return h + `<p class="sub">${st.seen.length ? `You saw: ${st.seen.map(s => s.split("!")[0].split(",")[0].toLowerCase()).join("; ")}.` : "Just sea, and more sea, and a container ship very far away. They're out there, though. Win says come back in an hour."}</p>${st.seen.length ? `<ul class="hlist">${st.seen.map(s => `<li>${esc(s)}</li>`).join("")}</ul>` : ""}<div class="actions"><button class="btn primary" data-bba="whaled">Back down the steps</button></div>`;
  h += `<p class="sub">Sweep the binoculars across the water: tap a stretch of sea to look there. ${WHALES.LOOKS - st.looked.length} looks left before your arms get tired.</p>`;
  h += `<div class="crsea">${Array.from({length: WHALES.SECTORS}, (_, i) => { const l = st.looked.includes(i), hit = l && st.at.includes(i);
    return `<button class="crsect${l ? " l" : ""}${hit ? " hit" : ""}" data-bba="look:${i}" ${l ? "disabled" : ""} aria-label="${l ? (hit ? "something there" : "just sea") : "look here"}">${hit ? (st.whales ? WHALE_SVG : DOLPHIN_SVG) : ""}</button>`; }).join("")}</div>`;
  return h + `<p class="muted">${st.seen.length ? esc(st.seen[st.seen.length - 1]) + "!" : "Nothing yet. Patience."}</p>`;
}

/* ---------- glow-worms in the grotto ---------- */
export const GLOW = {from: 18*60, WAIT: 3, SPOTS: 10};
export const glowOpen = hm => hm >= GLOW.from;
export const glowStart = (rng = Math.random) => ({wait: 0, lit: Array.from({length: GLOW.SPOTS}, () => 3 + Math.floor(rng()*14)), counted: []});
export function glowWait(st){ if (st.wait >= GLOW.WAIT) return null; st.wait++; return st.wait >= GLOW.WAIT; }
export function glowCount(st, i){ if (st.wait < GLOW.WAIT || st.counted.includes(i) || i < 0 || i >= st.lit.length) return null; st.counted.push(i); return st.lit[i]; }
export const glowTotal = st => st.counted.reduce((a, i) => a + st.lit[i], 0);
export const glowDone = st => st.counted.length >= st.lit.length;
export function finishGlow(F, st){ const s = bbState(F), n = glowTotal(st); s.glowVisits = (s.glowVisits || 0) + 1; const best = n > (s.glow || 0); if (best) s.glow = n; return {n, best}; }
export function glowPanel(F, st, o){
  let h = tape() + `<h2>The glow-worm grotto</h2>`;
  if (!glowOpen(o.hm)) return h + `<p class="sub">In the daylight it's just a damp, mossy overhang with a drippy fern curtain. The glow-worms only show once it's dark: Tash brings people down from six.</p>` + shut;
  if (!st) return h + `<p class="sub">Down the steps by the waterfall, under the dripping overhang. Tash whispers: "Torches off. Give your eyes a minute. And no loud voices, they'll switch off."${o.evan ? " Evan's holding your hand very tightly." : ""}</p><div class="actions"><button class="btn primary" data-bba="glow">Torches off</button></div>` + shut;
  if (st.wait < GLOW.WAIT) return h + `<p class="sub">${["Pitch black. You can hear the waterfall, and your own breathing.", "Something faint... or is it your eyes playing tricks?", "There. And there. Little blue-green pinpricks, coming out one by one."][st.wait]}</p><div class="crcave dim${st.wait}" aria-hidden="true"></div><div class="actions"><button class="btn primary" data-bba="gwait">Wait a little longer</button></div>`;
  if (glowDone(st)) return h + `<p class="sub">${glowTotal(st)} glow-worms, give or take. Tash says there are thousands further in, where nobody goes. It looks like the night sky has come down to sit on the rocks.</p><div class="actions"><button class="btn primary" data-bba="glowed">Tiptoe back out</button></div>`;
  h += `<p class="sub">Tap each patch of the ceiling to count its lights.</p><div class="crcave lit">${st.lit.map((n, i) => { const c = st.counted.includes(i);
    return `<button class="crglow${c ? " c" : ""}" data-bba="gcount:${i}" ${c ? "disabled" : ""} aria-label="${c ? n + " counted" : "count this patch"}">${Array.from({length: Math.min(n, 8)}, (_, k) => `<i style="left:${(k*37 + i*13) % 80 + 6}%;top:${(k*23 + i*7) % 60 + 14}%"></i>`).join("")}${c ? `<b>${n}</b>` : ""}</button>`; }).join("")}</div>`;
  return h + `<p class="muted">${glowTotal(st)} so far.</p>`;
}

/* ---------- cray pots with Mags ---------- */
// each pot: a cray over the gauge (keep), under it (throw back), a berried female (throw back: she's carrying eggs), or empty
export const POTS = {N: 5, GAUGE: 105, from: 6*60, to: 13*60, TAKE: 2};
export const potsOpen = hm => hm >= POTS.from && hm < POTS.to;
export function potsStart(rng = Math.random){ const pots = Array.from({length: POTS.N}, () => { const r = rng();
  return r < .15 ? {what: "empty"} : r < .3 ? {what: "berried", mm: 110 + Math.floor(rng()*20)} : {what: "cray", mm: 85 + Math.floor(rng()*45)}; });
  if (!pots.some(p => p.what === "cray" && p.mm >= POTS.GAUGE)) pots[0] = {what: "cray", mm: 112}; return {pots, i: 0, hauled: false, kept: 0, right: 0, last: null}; }
export const potKeepable = p => p.what === "cray" && p.mm >= POTS.GAUGE;
export function potHaul(st){ if (st.i >= st.pots.length || st.hauled) return null; st.hauled = true; const p = st.pots[st.i]; if (p.what === "empty") { st.last = "empty"; st.i++; st.hauled = false; } else st.last = null; return p; }
export function potChoose(st, keep){ if (st.i >= st.pots.length || !st.hauled) return null; const p = st.pots[st.i], ok = keep === potKeepable(p);
  if (ok) st.right++; if (keep && ok) st.kept++; st.last = ok ? (keep ? "kept" : "back") : (keep ? (p.what === "berried" ? "berried" : "small") : "big"); st.i++; st.hauled = false; return ok; }
export const potsDone = st => st.i >= st.pots.length;
export function finishPots(F, st, addInv){ const s = bbState(F); s.potRuns = (s.potRuns || 0) + 1; if (s.pots === dayKey()) return 0; s.pots = dayKey(); s.crays = (s.crays || 0) + POTS.TAKE; addInv("crayfish", POTS.TAKE); return POTS.TAKE; }
export function potsPanel(F, st, o){
  let h = tape("stripe") + `<h2>Cray pots with Mags</h2>`;
  if (!st) { if (!potsOpen(o.hm)) return h + `<p class="sub">Mags goes out at first light and she's back and done by lunch. Come in the morning and she'll take you out to her pots.</p>` + shut;
    return h + `<p class="sub">Out in the bay in Mags's little boat, the Molly B. Five floats bobbing: five pots on the bottom. She hands you the brass gauge: "Under it, back it goes. And any mum with eggs under her tail goes back too, whatever her size."${o.evan ? " Evan's in a life jacket, in charge of the bait bucket. He's thrilled and appalled." : ""}${bbState(F).pots === dayKey() ? " (You've had your crays today: this one's for the fun of it.)" : ""}</p><div class="actions"><button class="btn primary" data-bba="pots">Out to the pots</button></div>` + shut; }
  if (potsDone(st)) return h + `<p class="sub">${st.right === st.pots.length ? "Mags nods slowly. \"You'd make a deckhand.\"" : st.right >= st.pots.length - 1 ? "\"Nearly perfect,\" says Mags. \"Better than Davo his first week.\"" : "\"You'll get the hang of the gauge,\" Mags says, and checks the crays you kept, just in case."} Back to the wharf with the gulls following.</p><div class="actions"><button class="btn primary" data-bba="potted">Tie up at the wharf</button></div>`;
  const p = st.pots[st.i], say = {kept: "Into the tank! A beauty.", back: "Over the side, and off she scoots backwards. Good call.", small: "Mags shakes her head: \"Under the gauge, love. Back he goes.\" Over the side.", berried: "\"See those eggs under her tail? She stays.\" Mags lowers her back in, gently.", big: "\"That one was over the gauge!\" Too late: it's off. Mags laughs. \"Next one.\"", empty: "Empty. Just a bit of weed and a cranky crab, who goes back."}[st.last];
  h += say ? `<p class="muted">${esc(say)}</p>` : "";
  if (!st.hauled) return h + `<p class="sub">Pot ${st.i + 1} of ${st.pots.length}. Grab the float, and pull...${o.evan ? " Evan pulls too. Mostly on your shirt." : ""}</p><div class="actions"><button class="btn primary" data-bba="haul">Haul it up</button></div>`;
  const what = p.what === "berried" ? `A big red cray, ${p.mm}mm on the gauge... and her tail's full of orange eggs.` : `A cray! Red and waving. On the gauge: ${p.mm}mm (the line's at ${POTS.GAUGE}).`;
  return h + `<p class="sub">${what}</p><div class="actions"><button class="btn primary" data-bba="keep:1">Keep it</button><button class="btn alt" data-bba="keep:0">Throw it back</button></div>`;
}

/* ---------- the penguin parade ---------- */
// rounds as the light goes: mostly just stay still; now and then Evan's about to squeal and needs a shush
export const PENG = {from: 18*60, to: 21*60, ROUNDS: 6};
export const pengOpen = hm => hm >= PENG.from && hm < PENG.to;
export function pengStart(evan, rng = Math.random){ return {round: 0, here: 0, fright: 0, evan: !!evan, squeal: Array.from({length: PENG.ROUNDS}, () => !!evan && rng() < .35), last: null}; }
export function pengDo(st, how, rng = Math.random){ if (st.round >= PENG.ROUNDS) return null; const need = st.squeal[st.round] ? "shush" : "still";
  const ok = how === need; const n = ok ? 2 + Math.floor(rng()*5) : 0; st.here += n; if (!ok) st.fright++; st.last = ok ? (how === "shush" ? "shushed" : "still") : (need === "shush" ? "squeal" : "fidget"); st.round++; return n; }
export const pengDone = st => st.round >= PENG.ROUNDS;
export function finishPeng(F, st){ const s = bbState(F); s.penguins = (s.penguins || 0) + st.here; s.parades = (s.parades || 0) + 1; return st.here; }
export function pengPanel(F, st, o){
  let h = tape() + `<h2>The penguin parade</h2>`;
  if (!pengOpen(o.hm)) return h + `<p class="sub">The little penguins are out at sea all day, fishing. They come home across the beach just after sunset: the hide opens at six. Back then.</p>` + shut;
  if (!st) return h + `<p class="sub">Into the hide, onto the long bench, and the window onto the sand. No torches, no cameras, and not a peep: they're shy. The sun's going down behind the Sisters.${o.evan ? " Evan has promised to be quieter than a mouse. He's practising." : ""}</p><div class="actions"><button class="btn primary" data-bba="peng">Settle in</button></div>` + shut;
  if (pengDone(st)) return h + `<p class="sub">${st.here} little penguins waddled home up the beach, flippers out, chattering, and disappeared into their burrows in the dunes.${st.fright ? " A couple of groups scuttled back into the sea first, but they'll try again later." : " Not one of them was frightened."}${o.evan ? " Evan whispers: \"Goodnight, penguins.\"" : ""}</p><div class="actions"><button class="btn primary" data-bba="penged">Tiptoe out</button></div>`;
  const lights = ["The sun's touching the sea.", "Pink sky. Something moves at the edge of the water...", "A little huddle of penguins, standing in the shallows, deciding.", "They're coming! Up the sand, in a line, flippers out.", "More, and more. One falls over and gets straight back up.", "Nearly dark. The last few hurry past right under the window."][st.round];
  const was = {still: "They pass right by. You hold your breath.", shushed: "A finger to your lips; Evan clamps his hands over his mouth, eyes huge. The penguins keep coming.", squeal: "\"PENGUINS!\" squeaks Evan. The whole group turns and scurries back into the waves.", fidget: "The bench creaks. Three penguins freeze, then hop back into the sea."}[st.last];
  const evanAbout = st.squeal[st.round];
  return h + (was ? `<p class="muted">${esc(was)}</p>` : "") + `<p class="sub">${lights}${evanAbout ? " Evan's bouncing on the bench. He's taking a big breath in..." : ""}</p><div class="crpeng" aria-hidden="true">${PENG_SVG.repeat(Math.min(st.here, 24))}</div><div class="actions"><button class="btn primary" data-bba="pstill">Stay very still</button>${st.evan ? `<button class="btn alt" data-bba="pshush">Shush Evan</button>` : ""}</div><p class="muted">${st.here} so far.</p>`;
}

/* ---------- Nippers for Evan ---------- */
// legs of the race: cheer him on, and when a wave comes, tell him to duck under it
export const NIP = {from: 9*60, to: 12*60, LEGS: ["The beach sprint", "Wading out to the buoy", "Round the buoy", "Back up the sand", "The dive for the flags"]};
export const nipOpen = hm => hm >= NIP.from && hm < NIP.to;
export const nipStart = (rng = Math.random) => ({leg: 0, wave: NIP.LEGS.map((_, i) => (i === 1 || i === 2) && rng() < .6), slips: 0, last: null});
export function nipDo(st, how){ if (st.leg >= NIP.LEGS.length) return null; const need = st.wave[st.leg] ? "duck" : "cheer", ok = how === need; if (!ok) st.slips++; st.last = ok ? how : (need === "duck" ? "dunked" : "dawdle"); st.leg++; return ok; }
export const nipDone = st => st.leg >= NIP.LEGS.length;
export const nipPlace = st => Math.min(st.slips + 1, 4);
export function finishNip(F, st, addInv){ const s = bbState(F); s.nippers = (s.nippers || 0) + 1; const place = nipPlace(st); if (place === 1) s.nipWins = (s.nipWins || 0) + 1;
  if (!s.medal && !(F.inv || {}).b_nipmedal) { s.medal = true; addInv("b_nipmedal", 1); return {place, medal: true}; } return {place, medal: false}; }
export function nipPanel(F, st, o){
  let h = tape("stripe") + `<h2>Nippers</h2>`;
  if (!o.evan) return h + `<p class="sub">Little lifesavers, five to thirteen, in red and yellow caps, racing to the flags. Coach Dimi says Evan can join in any morning: bring him along.</p>` + shut;
  if (!nipOpen(o.hm)) return h + `<p class="sub">Nippers is on in the mornings, nine till twelve, at the river mouth beach. Coach Dimi says bring Evan back then.</p>` + shut;
  if (!st) return h + `<p class="sub">Coach Dimi pulls a red and yellow cap down over Evan's ears and lines him up with the under-sixes. "Run to the water, out round the buoy, back up the sand, and dive for a flag. Parents cheer. Loudly."${(bbState(F).nippers || 0) ? ` (Evan's done Nippers ${bbState(F).nippers} time${bbState(F).nippers === 1 ? "" : "s"}.)` : ""}</p><div class="actions"><button class="btn primary" data-bba="nip">On your marks...</button></div>` + shut;
  if (nipDone(st)) { const place = nipPlace(st); return h + `<p class="sub">${["Evan's first! He's holding the flag over his head and running in circles.", "Second! He dived for the flag and got a mouthful of sand, and he doesn't care at all.", "Third! He's beaming. Coach Dimi high-fives him.", "He came in last, smiling the whole way, and stopped to show a shell to the girl next to him."][place - 1]}</p><div class="actions"><button class="btn primary" data-bba="nipped">Hot chips at the surf club</button></div>`; }
  const was = {cheer: "\"GO EVAN!\" He goes faster.", duck: "\"Duck under!\" He does, and pops up the other side, spluttering and grinning.", dunked: "A wave knocks him flat! He comes up, wipes his eyes, keeps going.", dawdle: "He stopped to wave at you. Lots of waving."}[st.last];
  const wave = st.wave[st.leg];
  return h + (was ? `<p class="muted">${esc(was)}</p>` : "") + `<p class="sub">${esc(NIP.LEGS[st.leg])}.${wave ? " A wave's rolling in towards the little ones..." : ""}</p><div class="actions"><button class="btn primary" data-bba="ncheer">Cheer!</button><button class="btn alt" data-bba="nduck">"Duck under!"</button></div>`;
}
