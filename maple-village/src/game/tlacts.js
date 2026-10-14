// The Tablelands' things to join in with (round 159), each with Evan in on it when he's come along:
//   a swim in the falls at Misty Falls (8 to 5): swim to the falls, float and look up, duck under the veil of water,
//     and get out before you're too cold to talk.
//   a kayak round Crater Lake (Lachlan's boat shed): steer towards whatever shows itself (turtles, ducklings, a
//     kingfisher...). Evan sits in the front with a little paddle.
//   the platypus at Willow Bend (the platform over the creek): rings on the water mean look; nothing means wait. Move
//     at the wrong moment and she's gone. Better at dawn and dusk.
//   bottle-feeding the calves at Greenhill Dairy with Noah: the hungriest first (the one bumping hardest).
//   the milking at Greenhill Dairy (2:30 to 5): the cows come in by ear tag, lowest first; once a day Bill sends you
//     off with two bottles of milk.
//   Meg's cheese lesson: warm, culture, cut, stir, press, in the right order; then Meg's Tableland havarti is yours to
//     make at home, in Elena's cheese press (hfarm.js CHEESES.havarti, learnt: F.hfarm.learnt.havarti).
//   shaking a macadamia tree at Nutwood Farm with Pete: gentle shakes bring down the ripe ones; big shakes bring down
//     green ones too. A bag of nuts once a day.
//   gold panning at Kingsreef (you need a pan from Dot's): scoop, swirl four times, tip, look for the glint. Your first
//     fleck goes in a tiny bottle.
//   the steam train at Kingsreef (9 to 4): look out of the window, and pull the whistle at the crossings. A punched
//     ticket the first time.
// One panel and one action for them all: core.js opens one with data-bba="open:<kind>" (from a room or a place
// outside: townSpot bbOut) and sends every button as data-bba="tl:<verb>.<arg>" to tlAct, which returns what to do.
// State: the run in bbSt.t; F.bellbird.tl = {swims, kayaks, platypus, calves, milked (day), shaken (day), flecks, rides, ...}
import { esc, dayKey } from "../util.js";
import { icon } from "../art/icons.js";
import { bbState } from "./bellbird.js";

export const TL_KINDS = ["swim", "kayak", "platypus", "calves", "milking", "cheese", "shake", "pan", "steam"];
const shut = `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
const coin = () => icon("coin", 13);
const tape = (t = "gingham") => `<span class="tape ${t}" aria-hidden="true"></span>`;
const btn = (verb, label, primary = true, off = false) => `<button class="btn ${primary ? "primary" : "alt"}" data-bba="tl:${verb}" ${off ? "disabled" : ""}>${esc(label)}</button>`;
export const tlState = F => { const s = bbState(F); s.tl = s.tl || {}; return s.tl; };
const rnd = (rng, n) => Math.floor(rng()*n);

/* ---------- a swim in the falls ---------- */
export const SWIM = {COLD: 4, from: 8*60, to: 17*60};
export const swimOpen = hm => hm >= SWIM.from && hm < SWIM.to;
const SWIM_DO = {falls: "You swim across the pool to the falls. The spray's like rain, the roar fills your ears, and the cold takes your breath away.", float: "You float on your back and look up: the ferns, the cliff, the white water falling out of the sky. Everything goes quiet.", veil: "You take a breath and duck under the veil. Behind it, a little cave of rock and green light, and the falls like a glass curtain."};
export function swimDo(st, how){ if (st.out) return null;
  if (how === "out") { st.out = true; return "out"; }
  if (!SWIM_DO[how] || st.done.includes(how)) return null; st.done.push(how); st.cold++; if (st.cold >= SWIM.COLD) st.out = true; return how; }

/* ---------- a kayak round the lake ---------- */
export const KAYAK = {price: 12, LEGS: 6};
export const kayakCost = evan => KAYAK.price + ((0));
const SIGHTS = ["A turtle, poking its head up for a breath", "A mother duck and seven ducklings in a line", "A kingfisher, a flash of blue off a branch", "Little fish darting in the clear shallows", "The curtain fig's roots, right down to the water", "A water dragon sunning itself on a log", "A rainbow in the mist off the far shore"];
export function kayakStart(rng = Math.random){ const order = SIGHTS.slice().sort(() => rng() - .5); return {leg: 0, at: Array.from({length: KAYAK.LEGS}, () => rnd(rng, 3)), sights: order, seen: [], last: null}; }
export function kayakSteer(st, dir){ if (st.leg >= KAYAK.LEGS || ![0, 1, 2].includes(dir)) return null; const hit = st.at[st.leg] === dir; if (hit) st.seen.push(st.sights[st.leg % st.sights.length]); st.last = hit ? st.sights[st.leg % st.sights.length] : "miss"; st.leg++; return st.last; }
export const kayakDone = st => st.leg >= KAYAK.LEGS;

/* ---------- the platypus ---------- */
export const PLATY = {ROUNDS: 6};
export const platyOdds = hm => hm < 9*60 || hm >= 17*60 ? .55 : .3;
export function platyStart(hm, rng = Math.random){ const p = platyOdds(hm), r = Array.from({length: PLATY.ROUNDS}, () => rng() < p); if (!r.some(Boolean)) r[2 + rnd(rng, 3)] = true; return {round: 0, rings: r, seen: 0, gone: false}; }
export function platyDo(st, how){ if (st.gone || st.round >= PLATY.ROUNDS) return null; const rings = st.rings[st.round];
  let r; if (how === "look") { if (rings) { st.seen++; r = "seen"; } else { st.gone = true; r = "gone"; } } else r = rings ? "missed" : "wait";
  st.round++; return r; }
export const platyDone = st => st.gone || st.round >= PLATY.ROUNDS;

/* ---------- the calves ---------- */
const CALVES = ["Buttercup", "Clover", "Pudding", "Socks"];
export function calvesStart(rng = Math.random){ const h = CALVES.map((n, i) => ({n, hunger: i + 1})).sort(() => rng() - .5); return {calves: h, fed: [], wrong: 0}; }
export function calfFeed(st, i){ const c = st.calves[i]; if (!c || st.fed.includes(i)) return null; const hungriest = st.calves.map((x, k) => [x, k]).filter(([, k]) => !st.fed.includes(k)).sort((a, b) => b[0].hunger - a[0].hunger)[0][1];
  st.fed.push(i); if (i !== hungriest) st.wrong++; return i === hungriest ? "right" : "wrong"; }
export const calvesDone = st => st.fed.length >= st.calves.length;

/* ---------- the milking ---------- */
export const MILK = {from: 14*60 + 30, to: 17*60, n: 6, bottles: 2};
export const milkOpen = hm => hm >= MILK.from && hm < MILK.to;
const COWS = ["Daisy", "Bella", "Rosie", "Molly", "Lulu", "Peg", "Hazelnut", "Mabel"];
export function milkStart(rng = Math.random){ const tags = new Set(); for (let k = 0; tags.size < MILK.n; k++) { let t = 10 + rnd(rng, 90); while (tags.has(t)) t = 10 + (t - 10 + 7 + k) % 90; tags.add(t); } const names = COWS.slice().sort(() => rng() - .5);
  return {cows: [...tags].map((t, i) => ({tag: t, n: names[i]})), in: [], wrong: 0}; }
export function milkIn(st, i){ const c = st.cows[i]; if (!c || st.in.includes(i)) return null; const next = st.cows.map((x, k) => [x, k]).filter(([, k]) => !st.in.includes(k)).sort((a, b) => a[0].tag - b[0].tag)[0][1];
  if (i !== next) { st.wrong++; return "wrong"; } st.in.push(i); return "right"; }
export const milkDone = st => st.in.length >= st.cows.length;

/* ---------- Meg's cheese lesson ---------- */
export const CHEESE_LESSON = {price: 30, steps: ["warm", "culture", "cut", "stir", "press"]};
const STEP_N = {warm: "Warm the milk", culture: "Add the culture", cut: "Cut the curd", stir: "Stir and drain the whey", press: "Pack it into the mould and press"};
const STEP_SAY = {warm: "Into the vat, and the milk warms slowly, steaming a little. \"Not too hot,\" says Meg, \"like a bath for a baby.\"", culture: "A spoonful of culture and a few drops of rennet, stirred in, and then you wait. The milk sets like a soft jelly.", cut: "Meg hands you a long knife with lots of blades. Criss-cross through the curd, into little cubes.", stir: "Stir, stir, stir, and the yellowish whey runs off. The curds go squeaky.", press: "Into the round mould, a press on top, and there it is: your first havarti, a little wheel."};
export const lessonStart = () => ({at: 0, wrong: 0});
export function lessonDo(st, step){ if (st.at >= CHEESE_LESSON.steps.length) return null; if (step !== CHEESE_LESSON.steps[st.at]) { st.wrong++; return "wrong"; } st.at++; return step; }
export const lessonDone = st => st.at >= CHEESE_LESSON.steps.length;
export const knowsHavarti = F => !!((F.hfarm || {}).learnt || {}).havarti;
function learnHavarti(F){ F.hfarm = F.hfarm || {}; F.hfarm.learnt = {...(F.hfarm.learnt || {}), havarti: true}; }

/* ---------- shaking a macadamia tree ---------- */
export const SHAKE = {N: 4, MAX: 3};
export function shakeStart(){ return {n: 0, ripe: 0, green: 0}; }
export function shakeDo(st, how, rng = Math.random){ if (st.n >= SHAKE.N) return null; st.n++;
  if (how === "big") { if (rng() < .4) { st.green += 2; return "green"; } st.ripe += 2; return "lots"; } st.ripe += 1; return "some"; }
export const shakeDone = st => st.n >= SHAKE.N;
export const shakeBags = st => Math.max(1, Math.min(SHAKE.MAX, Math.floor(st.ripe/2)));

/* ---------- gold panning ---------- */
export const PAN = {SWIRLS: 4};
export const panStart = () => ({scooped: false, swirls: 0, result: null});
export function panDo(st, how){ if (st.result) return null;
  if (how === "scoop") { if (st.scooped) return null; st.scooped = true; return "scoop"; }
  if (!st.scooped) return null;
  if (how === "swirl") { st.swirls++; return "swirl"; }
  if (how === "look") { st.result = st.swirls < PAN.SWIRLS - 1 ? "gravel" : st.swirls > PAN.SWIRLS + 1 ? "washed" : "gold"; return st.result; }
  return null; }

/* ---------- the steam train ---------- */
export const STEAM = {price: 8, from: 9*60, to: 16*60, LEGS: 6};
export const steamOpen = hm => hm >= STEAM.from && hm < STEAM.to;
export const steamCost = evan => STEAM.price + ((0));
const VIEWS = ["Paddocks and black-and-white cows, all turning to watch", "Into the rainforest: ferns brushing the carriage windows", "Over a trestle bridge, the creek far below", "Past the old mine, its chimney still standing", "A mob of kangaroos bounding alongside", "Through a cutting of red rock, the steam rolling back"];
export function steamStart(rng = Math.random){ const c1 = 1 + rnd(rng, STEAM.LEGS - 1), cross = [c1, 1 + (c1 + 1 + rnd(rng, STEAM.LEGS - 3)) % (STEAM.LEGS - 1)]; return {leg: 0, cross, whistled: 0, missed: 0, views: VIEWS.slice().sort(() => rng() - .5)}; }
export function steamDo(st, how){ if (st.leg >= STEAM.LEGS) return null; const c = st.cross.includes(st.leg);
  const r = how === "whistle" ? (c ? "whistle" : "early") : (c ? "missed" : "view"); if (r === "whistle") st.whistled++; if (r === "missed") st.missed++; st.leg++; return r; }
export const steamDone = st => st.leg >= STEAM.LEGS;

/* ---------- the panels ---------- */
export function tlPanel(F, kind, st, o = {}){
  const t = st.t, s = tlState(F), evan = false, hm = o.hm || 12*60;
  switch (kind) {
    case "swim": { let h = tape("stripe") + `<h2>A swim in the falls</h2>`;
      if (!swimOpen(hm)) return h + `<p class="sub">Swimming's from 8 till 5, while Kirra's about. The pool's dark and still now.</p>` + shut;
      if (!t) return h + `<p class="sub">Eleven degrees, says Kirra's sign. A round dark pool, ferns all round, and the falls pouring in at the far side.${("")}${s.swims ? ` You've swum here ${s.swims} time${s.swims > 1 ? "s" : ""}.` : ""}</p><div class="actions">${btn("swimin", "In you go")}</div>` + shut;
      if (t.out) return h + `<p class="sub">${t.cold >= SWIM.COLD ? "Teeth chattering, you scramble out onto the sunny rock, laughing, wrapped in a towel." : "Out onto the warm rock, tingling all over, wrapped in a towel."} ${t.done.length >= 3 ? "The falls, the float, behind the veil: you did the lot." : ""}</p><div class="actions">${btn("swimdone", "Get dressed")}</div>`;
      return h + `<p class="sub">${esc(t.last ? SWIM_DO[t.last] || "" : "In! The cold hits like a slap, then it's wonderful.")}</p><p class="muted">Cold: ${"●".repeat(t.cold)}${"○".repeat(SWIM.COLD - t.cold)}</p><div class="actions">${["falls", "float", "veil"].filter(k => !t.done.includes(k)).map(k => btn("swim." + k, {falls: "Swim to the falls", float: "Float and look up", veil: "Duck under the veil"}[k])).join("")}${btn("swim.out", "Get out", false)}</div>`; }
    case "kayak": { let h = tape("stripe") + `<h2>Once round the lake</h2>`;
      if (!t) return h + `<p class="sub">A red kayak, a paddle, and the whole round lake.${("")} Steer towards whatever shows itself.</p><div class="actions"><button class="btn primary" data-bba="tl:kayakgo" ${F.coins >= kayakCost(false) || st.paid ? "" : "disabled"}>Push off · ${kayakCost(false)} ${coin()}</button></div>` + shut;
      if (kayakDone(t)) return h + `<p class="sub">Back at the boat shed, arms aching. ${t.seen.length ? `You saw: ${t.seen.map(x => esc(x.toLowerCase())).join("; ")}.` : "A quiet lap: the lake kept its secrets today."}</p><div class="actions">${btn("kayakdone", "Climb out")}</div>`;
      const msg = t.last ? (t.last === "miss" ? "Just ripples where you looked. Something splashed the other way." : `${t.last}!`) : "Out onto the still water. Somewhere a splash.";
      return h + `<p class="sub">${esc(msg)} (stretch ${t.leg + 1} of ${KAYAK.LEGS})</p><div class="actions">${btn("steer.0", "Left, by the reeds")}${btn("steer.1", "Straight ahead")}${btn("steer.2", "Right, under the trees")}</div><p class="muted">${t.seen.length} seen so far.</p>`; }
    case "platypus": { let h = tape() + `<h2>The platypus platform</h2>`;
      if (!t) return h + `<p class="sub">Be very still. Watch the water by the far bank. When you see rings spreading on the water, look closer. When there's nothing, wait. ${hm < 9*60 || hm >= 17*60 ? "Dawn and dusk are her busy times: good timing." : "Middle of the day: she might be asleep in her burrow, but you never know."}${s.platypus ? ` You've seen her ${s.platypus} time${s.platypus > 1 ? "s" : ""}.` : ""}</p><div class="actions">${btn("platygo", "Watch the water")}</div>` + shut;
      if (platyDone(t)) return h + `<p class="sub">${t.gone ? "A creak of the boards, a splash, and she's gone. Maybe next time." : t.seen ? `You saw her ${t.seen} time${t.seen > 1 ? "s" : ""}: a little brown back, a duck's bill, a flick of a tail, and then just rings on the water.` : "Nothing but leaves floating by. She's somewhere downstream."}</p><div class="actions">${btn("platydone", "Tiptoe off")}</div>`;
      const rings = t.rings[t.round];
      return h + `<p class="sub">${rings ? "Rings on the water by the far bank, spreading..." : "The creek slides by. Nothing. A leaf turns over."}${("")}</p><div class="actions">${btn("platy.look", "Look closer")}${btn("platy.wait", "Stay still", false)}</div>`; }
    case "calves": { let h = tape() + `<h2>Feeding the calves</h2>`;
      if (!t) return h + `<p class="sub">Noah has four warm bottles. "Hungriest first," he says. "You can tell: they bump hardest."${("")}</p><div class="actions">${btn("calvesgo", "Fill the bottles")}</div>` + shut;
      if (calvesDone(t)) return h + `<p class="sub">${t.wrong ? `All fed, all sleepy, though ${t.wrong === 1 ? "one" : "a couple"} got a bit cross waiting.` : "Perfect: hungriest first, and four very full, very happy calves."} Buttercup licks your hand all the way up to the elbow.</p><div class="actions">${btn("calvesdone", "Wipe your hands")}</div>`;
      const bump = n => ["nuzzling gently", "nudging the rail", "bumping the rail", "BUMPING HARD and bellowing"][n - 1];
      return h + `<ul class="hlist wlist">${t.calves.map((c, i) => `<li><span class="wtxt"><b>${esc(c.n)}</b><small>${t.fed.includes(i) ? "full and sleepy" : bump(c.hunger)}</small></span>${t.fed.includes(i) ? "" : `<button class="btn small primary" data-bba="tl:calf.${i}">Feed</button>`}</li>`).join("")}</ul>`; }
    case "milking": { let h = tape("stripe") + `<h2>The milking</h2>`;
      if (!milkOpen(hm)) return h + `<p class="sub">Milking's at three: come back from half past two. The shed's hosed down and quiet, and Bill's radio is playing to nobody.</p>` + shut;
      if (!t) return h + `<p class="sub">"They come in by their ear tags," says Bill. "Lowest number first. Open the gate for the right one."${s.milked === dayKey() ? " (You've helped today already: Bill's glad of the hand anyway.)" : ""}</p><div class="actions">${btn("milkgo", "Open the yard gate")}</div>` + shut;
      if (milkDone(t)) return h + `<p class="sub">All six in, cups on, and the milk running silver down the pipes. ${t.wrong ? "A couple of cows tried to push in, but Bill laughed it off." : "\"You're a natural,\" says Bill."}</p><div class="actions">${btn("milkdone", "Wash up")}</div>`;
      return h + `<ul class="hlist wlist">${t.cows.map((c, i) => `<li><span class="wtxt"><b>${esc(c.n)}</b><small>ear tag ${c.tag}${t.in.includes(i) ? " · in her bail" : ""}</small></span>${t.in.includes(i) ? "" : `<button class="btn small primary" data-bba="tl:cow.${i}">Let her in</button>`}</li>`).join("")}</ul>`; }
    case "cheese": { let h = tape() + `<h2>Meg's cheese lesson</h2>`;
      if (knowsHavarti(F) && !t) return h + `<p class="sub">You know Meg's havarti now. Make it at home with Elena's cheese press: three bottles of milk, three days in the cave.</p>` + shut;
      if (!t) return h + `<p class="sub">Meg teaches her Tableland havarti: creamy, buttery, little holes. Five steps, in the right order. Then it's yours to make at home in Elena's cheese press.</p><div class="actions"><button class="btn primary" data-bba="tl:lessongo" ${F.coins >= CHEESE_LESSON.price ? "" : "disabled"}>Hairnet on · ${CHEESE_LESSON.price} ${coin()}</button></div>` + shut;
      if (lessonDone(t)) return h + `<p class="sub">${esc(STEP_SAY.press)} ${t.wrong ? "\"A wobble or two,\" says Meg, \"but that's how you learn.\"" : "\"Perfect,\" says Meg. \"You've done this before.\" You haven't."}</p><div class="actions">${btn("lessondone", "Take off the hairnet")}</div>`;
      const opts = CHEESE_LESSON.steps.slice().sort((a, b) => (a.charCodeAt(1) * 7 + t.at) % 5 - (b.charCodeAt(1) * 7 + t.at) % 5);
      return h + `<p class="sub">${t.at ? esc(STEP_SAY[CHEESE_LESSON.steps[t.at - 1]]) : "The milk's in the vat. What first?"} ${t.last === "wrong" ? "<i>Meg shakes her head, smiling: \"Not yet.\"</i>" : ""}</p><div class="actions">${opts.map(k => btn("step." + k, STEP_N[k], true)).join("")}</div>`; }
    case "shake": { let h = tape() + `<h2>Shake a macadamia tree</h2>`;
      if (s.shaken === dayKey() && !t) return h + `<p class="sub">You've shaken a tree today. "Leave some for tomorrow," says Pete. "The tree's not going anywhere."</p>` + shut;
      if (!t) return h + `<p class="sub">Pete's spread the tarp. "Gentle shakes bring down the ripe ones. Shake too hard and you get green ones too, and they're no good."${("")}</p><div class="actions">${btn("shakego", "Grab a branch")}</div>` + shut;
      if (shakeDone(t)) return h + `<p class="sub">Raked up off the tarp: ${t.ripe} ripe ones${t.green ? `, and ${t.green} green ones Pete tuts at` : ""}. He cracks you a bag's worth in the old machine.</p><div class="actions">${btn("shakedone", `Take ${shakeBags(t)} bag${shakeBags(t) > 1 ? "s" : ""} of macadamias`)}</div>`;
      const said = {some: "A gentle shake: a patter of round nuts on the tarp.", lots: "A big shake: nuts raining down! Ripe ones, luckily.", green: "A big shake, and down come green ones too. Pete winces."}[t.last] || "Hold the branch. Gentle, or big?";
      return h + `<p class="sub">${esc(said)} (shake ${t.n + 1} of ${SHAKE.N})</p><div class="actions">${btn("shk.gentle", "A gentle shake")}${btn("shk.big", "A big shake", false)}</div>`; }
    case "pan": { let h = tape() + `<h2>Panning for gold</h2>`;
      if (!t) return (F.inv || {}).b_goldpan ? h + `<p class="sub">Old Mac squats beside you. "Scoop some gravel. Swirl it, gently, about four times, and the light stuff washes over the edge. Gold's heavy. It stays."${s.flecks ? ` You've found ${s.flecks} fleck${s.flecks > 1 ? "s" : ""}.` : ""}</p><div class="actions">${btn("pango", "Into the creek")}</div>` + shut
        : h + `<p class="sub">You'll need a gold pan: Dot sells them at Nugget & Co., by the door.</p>` + shut;
      if (t.result) return h + `<p class="sub">${{gold: "There! In the black sand at the bottom of the pan: a glint. A real fleck of gold, tiny and bright.", gravel: "Still too much gravel to see anything. Swirl a bit more next time.", washed: "You swirled so long the pan's empty. \"Washed it out,\" says Mac. \"Gently does it.\""}[t.result]}</p><div class="actions">${btn("pandone", "Rinse the pan")}</div>`;
      if (!t.scooped) return h + `<p class="sub">Cold water round your ankles. Gravel and sand under the surface.${("")}</p><div class="actions">${btn("pan.scoop", "Scoop some gravel")}</div>`;
      return h + `<p class="sub">${t.swirls ? `Swirl ${t.swirls}: the sand slides round and over the lip.` : "A pan full of gravel and water."}</p><div class="actions">${btn("pan.swirl", "Swirl")}${btn("pan.look", "Tip off and look", false)}</div>`; }
    case "steam": { let h = tape("stripe") + `<h2>The steam train</h2>`;
      if (!steamOpen(hm)) return h + `<p class="sub">The train runs from 9 to 4. She's resting now, ticking as she cools.</p>` + shut;
      if (!t) return h + `<p class="sub">The 10.15 (and every hour after) to Gold Creek Siding and back. Clive's on the footplate, Fred punches the tickets. "Pull the whistle at the crossings," says Clive. "Not before."${("")}</p><div class="actions"><button class="btn primary" data-bba="tl:steamgo" ${F.coins >= steamCost(false) ? "" : "disabled"}>All aboard · ${steamCost(false)} ${coin()}</button></div>` + shut;
      if (steamDone(t)) return h + `<p class="sub">Back into Kingsreef in a cloud of steam. ${t.whistled === t.cross.length ? "Every crossing whistled, right on time. Clive gives you a thumbs up from the cab." : t.whistled ? "A whistle or two right on time." : "You were so busy looking, you forgot the whistle. Clive did it for you."}</p><div class="actions">${btn("steamdone", "Climb down")}</div>`;
      const c = t.cross.includes(t.leg);
      return h + `<p class="sub">${c ? "A road crossing ahead! A little white gate, and a farmer waiting in a ute." : esc(t.views[t.leg % t.views.length])}.</p><div class="actions">${btn("steam.whistle", "Pull the whistle")}${btn("steam.look", "Look out of the window", false)}</div>`; }
  }
  return "";
}

// what a button does: changes the run (st.t) and F, and returns {say, sfx, evan, xp, hearts, flash, close}
export function tlAct(F, kind, st, verb, arg, o = {}){
  const s = tlState(F), evan = false, hm = o.hm || 12*60, add = o.addInv || (() => {}), rng = o.rng || Math.random, t = st.t;
  switch (verb) {
    case "swimin": if (!swimOpen(hm)) return null; st.t = {cold: 0, done: [], out: false, last: null}; return {sfx: "pop"};
    case "swim": { if (!t) return null; const r = swimDo(t, arg); if (!r) return null; t.last = r === "out" ? t.last : r; return {sfx: r === "out" ? "tap" : "pop"}; }
    case "swimdone": if (!t || !t.out) return null; s.swims = (s.swims || 0) + 1; st.t = null; return {close: true, xp: 1, hearts: t.done.length >= 3 ? 2 : 1, say: "Back on the warm rock in the sun, pink and tingling, very, very awake."};
    case "kayakgo": { const c = kayakCost(false); if (!st.paid) { if (F.coins < c) return null; F.coins -= c; st.paid = true; } st.t = kayakStart(rng); return {sfx: "chaching"}; }
    case "steer": { if (!t) return null; const r = kayakSteer(t, +arg); if (!r) return null; return {sfx: r === "miss" ? "tap" : "chime"}; }
    case "kayakdone": if (!t || !kayakDone(t)) return null; s.kayaks = (s.kayaks || 0) + 1; s.kayakSeen = (s.kayakSeen || 0) + t.seen.length; st.t = null; st.paid = false; return {close: true, xp: 2, hearts: 2, say: t.seen.length >= 4 ? "Once round the whole lake, and so much to see. Lachlan's impressed." : "Back on the jetty, arms aching, grinning."};
    case "platygo": st.t = platyStart(hm, rng); return {sfx: "paper"};
    case "platy": { if (!t) return null; const r = platyDo(t, arg); if (!r) return null; return {sfx: r === "seen" ? "chime" : "tap"}; }
    case "platydone": if (!t || !platyDone(t)) return null; s.platypus = (s.platypus || 0) + t.seen; st.t = null; return {close: true, xp: t.seen ? 2 : 1, hearts: t.seen ? 2 : 1};
    case "calvesgo": st.t = calvesStart(rng); return {sfx: "paper"};
    case "calf": { if (!t) return null; const r = calfFeed(t, +arg); if (!r) return null; return {sfx: r === "right" ? "pop" : "tap"}; }
    case "calvesdone": if (!t || !calvesDone(t)) return null; s.calves = (s.calves || 0) + 1; st.t = null; return {close: true, xp: 1, hearts: 2, say: "Four full calves, flopping down in the straw. Noah shakes your hand, very seriously."};
    case "milkgo": if (!milkOpen(hm)) return null; st.t = milkStart(rng); return {sfx: "paper"};
    case "cow": { if (!t) return null; const r = milkIn(t, +arg); if (!r) return null; return {sfx: r === "right" ? "pop" : "tap"}; }
    case "milkdone": { if (!t || !milkDone(t)) return null; const first = s.milked !== dayKey(); s.milked = dayKey(); s.milkings = (s.milkings || 0) + 1; st.t = null; if (first) add("milk", MILK.bottles);
      return {close: true, xp: 2, hearts: 2, flash: first ? "Two bottles of fresh milk" : null, say: first ? "Bill sends you off with two glass bottles of this afternoon's milk, still cold from the vat." : "Bill thanks you. The cows don't, but they look pleased."}; }
    case "lessongo": if (knowsHavarti(F) || F.coins < CHEESE_LESSON.price) return null; F.coins -= CHEESE_LESSON.price; st.t = lessonStart(); return {sfx: "chaching"};
    case "step": { if (!t) return null; const r = lessonDo(t, arg); if (!r) return null; t.last = r; return {sfx: r === "wrong" ? "tap" : "pop"}; }
    case "lessondone": if (!t || !lessonDone(t)) return null; learnHavarti(F); st.t = null; return {close: true, xp: 2, hearts: 2, flash: "A new cheese: Tableland havarti", say: "Meg writes the recipe on a card for you. Now you can make havarti at home, in Elena's cheese press: three bottles of milk, three days in the cave."};
    case "shakego": if (s.shaken === dayKey()) return null; st.t = shakeStart(); return {sfx: "paper"};
    case "shk": { if (!t) return null; const r = shakeDo(t, arg, rng); if (!r) return null; t.last = r; return {sfx: r === "green" ? "tap" : "pop"}; }
    case "shakedone": { if (!t || !shakeDone(t) || s.shaken === dayKey()) return null; const n = shakeBags(t); s.shaken = dayKey(); st.t = null; add("macadamia", n);
      return {close: true, xp: 1, hearts: 1, flash: `${n} bag${n > 1 ? "s" : ""} of macadamias`, say: `Pete hands you ${n} bag${n > 1 ? "s" : ""} of fresh-cracked macadamias. "For the gelato," he says, "or just for eating. I won't tell."`}; }
    case "pango": if (!(F.inv || {}).b_goldpan) return null; st.t = panStart(); return {sfx: "paper"};
    case "pan": { if (!t) return null; const r = panDo(t, arg); if (!r) return null; if (r === "gold") { s.flecks = (s.flecks || 0) + 1; }
      return {sfx: r === "gold" ? "chime" : "tap"}; }
    case "pandone": { if (!t || !t.result) return null; const first = t.result === "gold" && !s.fleckKept && !(F.inv || {}).b_goldfleck; if (first) { s.fleckKept = true; add("b_goldfleck", 1); } st.t = null;
      return {close: true, xp: t.result === "gold" ? 2 : 1, hearts: t.result === "gold" ? 2 : 1, flash: first ? "A gold fleck in a tiny bottle" : null, say: first ? "Old Mac tips your fleck into a tiny glass bottle and corks it. \"Your first,\" he says. \"Never sell the first.\"" : t.result === "gold" ? "Another fleck! Old Mac whistles." : "Mac grins. \"Again tomorrow. That's gold panning.\""}; }
    case "steamgo": { if (!steamOpen(hm)) return null; const c = steamCost(false); if (F.coins < c) return null; F.coins -= c; st.t = steamStart(rng); return {sfx: "chaching"}; }
    case "steam": { if (!t) return null; const r = steamDo(t, arg); if (!r) return null; return {sfx: r === "whistle" ? "chime" : "tap"}; }
    case "steamdone": { if (!t || !steamDone(t)) return null; s.rides = (s.rides || 0) + 1; const first = !s.ticketKept && !(F.inv || {}).b_steamticket; if (first) { s.ticketKept = true; add("b_steamticket", 1); } st.t = null;
      return {close: true, xp: 2, hearts: 2, flash: first ? "A punched steam train ticket" : null, say: first ? "Fred punches your ticket one last time and hands it back. \"Keep that,\" he says. \"Proof you rode the old girl.\"" : "Steam, soot, and a grin you can't get rid of."}; }
  }
  return null;
}
