// The Lavender Hills' things to join in with (round 163), for you to join in with:
//   the lavender harvest with Émile at Lavender Ridge: cut only the bushes in full flower (deep purple), leave the
//     pale ones for next week. Then into the still. Two bunches of lavender to take home, once a day.
//   pétanque with Monsieur Pagnol in the square at Montrose: short, middle or long, to land nearest the jack.
//   blending a perfume at Madame Arnaud's organ in Rosehill: a top note, a heart note and a base note. Every new blend
//     gets a name, and your first is bottled for you to keep.
//   the hives with Mathis at Sunflower Hill: a puff of smoke before you lift each frame. A jar of sunflower honey once
//     a day.
//   the sunflower maze: left, right or straight at each turn. A certificate the first time you find the middle.
//   Pooh-sticks off the Old Bridge: pick your stick, drop it, race to the other side. Best of three against Theo.
//   the chapel on Chapel Hill: light a candle, and from half past five ring the bell for the sunset, pulling the rope
//     each time it swings back down. A little brass bell to keep, the first time.
//   Céline's banon lesson: soften the leaves, wrap, tie, rest. Then it's yours to make at home in Elena's cheese press
//     (hfarm.js CHEESES.banon, learnt: F.hfarm.learnt.banon).
// One panel and one action for them all, like the Tablelands' (tlacts.js): data-bba="open:<kind>" and "lv:<verb>.<arg>".
// State: the run in bbSt.t; F.bellbird.lv = {cut (day), games, wins, scents: [{id, name}], hives (day), maze, sticks, bells, candles}
import { esc, dayKey } from "../util.js";
import { icon } from "../art/icons.js";
import { bbState } from "./bellbird.js";

export const LV_KINDS = ["harvest", "petanque", "scent", "bees", "maze", "sticks", "bell", "banon"];
const shut = `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
const coin = () => icon("coin", 13);
const tape = (t = "gingham") => `<span class="tape ${t}" aria-hidden="true"></span>`;
const btn = (verb, label, primary = true, off = false) => `<button class="btn ${primary ? "primary" : "alt"}" data-bba="lv:${verb}" ${off ? "disabled" : ""}>${esc(label)}</button>`;
export const lvState = F => { const s = bbState(F); s.lv = s.lv || {}; s.lv.scents = s.lv.scents || []; return s.lv; };
const rnd = (rng, n) => Math.floor(rng()*n);

/* ---------- the lavender harvest ---------- */
export const HARVEST = {BUSHES: 6, BUNCHES: 2};
export function harvestStart(rng = Math.random){ const ready = Array.from({length: HARVEST.BUSHES}, () => rng() < .6); if (!ready.some(Boolean)) ready[0] = true; if (ready.every(Boolean)) ready[HARVEST.BUSHES - 1] = false; return {ready, cut: [], wrong: 0}; }
export function harvestCut(st, i){ if (i < 0 || i >= HARVEST.BUSHES || st.cut.includes(i)) return null; st.cut.push(i); if (!st.ready[i]) { st.wrong++; return "green"; } return "cut"; }
export const harvestDone = st => st.ready.every((r, i) => !r || st.cut.includes(i));

/* ---------- pétanque ---------- */
export const PET = {ENDS: 3};
const DIST = ["short", "middle", "long"];
export function petStart(rng = Math.random){ return {end: 0, jack: Array.from({length: PET.ENDS}, () => rnd(rng, 3)), mine: 0, his: 0, last: null}; }
export function petThrow(st, how, rng = Math.random){ if (st.end >= PET.ENDS) return null; const k = DIST.indexOf(how); if (k < 0) return null;
  const off = Math.abs(k - st.jack[st.end]), his = rng() < .35 ? 0 : 1; const won = off < his || (off === his && rng() < .5);
  if (won) st.mine++; else st.his++; st.last = won ? (off === 0 ? "kiss" : "near") : "far"; st.end++; return st.last; }
export const petDone = st => st.end >= PET.ENDS;

/* ---------- blending a perfume ---------- */
export const SCENT = {price: 20};
export const NOTES = {top: {bergamot: "Bergamot", lemon: "Lemon", mandarin: "Mandarin"}, heart: {rose: "Rose", jasmine: "Jasmine", lavender: "Lavender"}, base: {vanilla: "Vanilla", sandalwood: "Sandalwood", amber: "Amber"}};
const SCENT_NAMES = {"bergamot+rose+vanilla": "Garden Party", "lemon+lavender+sandalwood": "Clean Linen", "mandarin+jasmine+amber": "Midsummer Night", "bergamot+lavender+vanilla": "Lavender Ridge",
  "lemon+rose+amber": "Morning Rose", "mandarin+rose+vanilla": "Sunday Best", "bergamot+jasmine+sandalwood": "The Perfumer's Garden", "lemon+jasmine+vanilla": "Honeysuckle Lane", "mandarin+lavender+amber": "Golden Hour"};
export const scentId = (t, h, b) => [t, h, b].join("+");
export const scentName = (t, h, b) => SCENT_NAMES[scentId(t, h, b)] || `${NOTES.heart[h]} and ${NOTES.base[b]}, with ${NOTES.top[t].toLowerCase()}`;

/* ---------- the hives ---------- */
export const BEES = {FRAMES: 4};
export const beesStart = () => ({frame: 0, smoked: false, calm: 3, lifted: 0});
export function beesDo(st, how){ if (st.frame >= BEES.FRAMES || st.calm <= 0) return null;
  if (how === "smoke") { st.smoked = true; return "smoke"; }
  if (how !== "lift") return null; const ok = st.smoked; st.smoked = false; st.frame++; if (ok) { st.lifted++; return "frame"; } st.calm--; return "buzz"; }
export const beesDone = st => st.frame >= BEES.FRAMES || st.calm <= 0;

/* ---------- the sunflower maze ---------- */
export const MAZE = {TURNS: 4};
const TURN = ["left", "straight", "right"];
export function mazeStart(rng = Math.random){ return {at: 0, path: Array.from({length: MAZE.TURNS}, () => rnd(rng, 3)), wrong: 0}; }
export function mazeTurn(st, how){ if (st.at >= MAZE.TURNS) return null; const k = TURN.indexOf(how); if (k < 0) return null; if (k !== st.path[st.at]) { st.wrong++; return "dead"; } st.at++; return st.at >= MAZE.TURNS ? "middle" : "on"; }
export const mazeDone = st => st.at >= MAZE.TURNS;

/* ---------- Pooh-sticks ---------- */
export const STICKS = {ROUNDS: 3};
const STICK_N = {twig: "A thin twig", fat: "A fat stick", long: "A long stick"};
export function sticksStart(){ return {round: 0, mine: 0, dads: 0, last: null}; }
export function sticksDrop(st, kind, rng = Math.random){ if (st.round >= STICKS.ROUNDS || !STICK_N[kind]) return null; const win = rng() < (kind === "fat" ? .55 : .45); if (win) st.mine++; else st.dads++; st.round++; st.last = win ? "won" : "lost"; return st.last; }
export const sticksDone = st => st.round >= STICKS.ROUNDS;

/* ---------- the chapel bell ---------- */
export const BELL = {from: 17*60 + 30, to: 20*60 + 30, STROKES: 5};
export const bellOpen = hm => hm >= BELL.from && hm < BELL.to;
export function bellStart(rng = Math.random){ return {i: 0, down: Array.from({length: 12}, (_, k) => k % 2 === 1 || rng() < .2), rung: 0, early: 0}; }
export function bellDo(st, how){ if (st.i >= st.down.length || st.rung >= BELL.STROKES) return null; const down = st.down[st.i]; st.i++;
  if (how === "pull") { if (down) { st.rung++; return "dong"; } st.early++; return "early"; } return down ? "missed" : "wait"; }
export const bellDone = st => st.rung >= BELL.STROKES || st.i >= st.down.length;

/* ---------- Céline's banon ---------- */
export const BANON = {price: 25, steps: ["soak", "wrap", "tie", "rest"]};
const B_N = {soak: "Soften the chestnut leaves", wrap: "Wrap the cheese in the leaves", tie: "Tie it with raffia", rest: "Leave it to rest in the cool"};
const B_SAY = {soak: "Into a bowl of warm water go the dry chestnut leaves, until they're soft and bendy.", wrap: "A little round of goat's cheese in the middle, and the leaves folded over it, one by one, like petals closing.", tie: "A loop of raffia round the parcel, criss-cross, and a little bow on top.", rest: "Onto the cool shelf with the others. In two weeks it'll be soft and nutty and wonderful."};
export const knowsBanon = F => !!((F.hfarm || {}).learnt || {}).banon;

/* ---------- the panels ---------- */
export function lvPanel(F, kind, st, o = {}){
  const t = st.t, s = lvState(F), evan = false, hm = o.hm || 12*60;
  switch (kind) {
    case "harvest": { let h = tape("stripe") + `<h2>The lavender harvest</h2>`;
      if (s.cut === dayKey() && !t) return h + `<p class="sub">You've helped with the harvest today. Émile's still is full and bubbling, and the whole farm smells of it.</p>` + shut;
      if (!t) return h + `<p class="sub">Émile hands you a curved sickle. "Only the bushes in full flower: deep purple, buzzing with bees. The pale ones, leave for next week."${("")}</p><div class="actions">${btn("cutgo", "Start cutting")}</div>` + shut;
      if (harvestDone(t)) return h + `<p class="sub">${t.wrong ? "A pale one or two in the basket. Émile shrugs: \"Next time.\"" : "Only the ripe ones. \"Parfait,\" says Émile."} Into the copper still they go, and out drips a thread of golden oil. Émile ties two bunches for you with raffia.</p><div class="actions">${btn("cutdone", "Take the bunches")}</div>`;
      return h + `<ul class="hlist wlist">${t.ready.map((r, i) => `<li><span class="wtxt"><b>Bush ${i + 1}</b><small>${t.cut.includes(i) ? "cut" : r ? "deep purple, humming with bees" : "pale, still opening"}</small></span>${t.cut.includes(i) ? "" : `<button class="btn small primary" data-bba="lv:cut.${i}">Cut</button>`}</li>`).join("")}</ul>`; }
    case "petanque": { let h = tape() + `<h2>Pétanque with Monsieur Pagnol</h2>`;
      if (!t) return h + `<p class="sub">Pagnol tosses the little wooden jack down the gravel. "Three ends. Nearest the jack wins each one. Bend the knees, and let it go like a feather."${s.games ? ` You've played ${s.games}, won ${s.wins || 0}.` : ""}</p><div class="actions">${btn("petgo", "Pick up a boule")}</div>` + shut;
      if (petDone(t)) return h + `<p class="sub">${t.mine > t.his ? "You beat Pagnol! The old men cheer. Fernand is delighted. Pagnol demands a rematch tomorrow." : t.mine === t.his ? "A draw! Pagnol says it doesn't count." : "Pagnol wins, as always, and shakes your hand very graciously."} (${t.mine} to ${t.his})</p><div class="actions">${btn("petdone", "Shake hands")}</div>`;
      const said = {kiss: "Your boule rolls right up and kisses the jack! Point to you.", near: "Closer than Pagnol's! Point to you.", far: "Pagnol's is closer. He twirls his moustache."}[t.last] || "The jack's down the gravel. How hard?";
      return h + `<p class="sub">${esc(said)} (end ${t.end + 1} of ${PET.ENDS}: the jack looks ${["near", "in the middle", "a long way off"][t.jack[t.end]]})</p><div class="actions">${btn("pet.short", "Short and gentle")}${btn("pet.middle", "Middle")}${btn("pet.long", "Long")}</div>`; }
    case "scent": { let h = tape("stripe") + `<h2>Blend your own perfume</h2>`;
      const known = s.scents.length ? `<p class="muted">Your perfumes: ${s.scents.map(x => esc(x.name)).join(", ")}.</p>` : "";
      if (!t) return h + `<p class="sub">Madame Arnaud sits you at the organ. "A top note, to say hello. A heart note, the real you. A base note, the one that stays."${("")}</p>${known}<div class="actions"><button class="btn primary" data-bba="lv:scentgo" ${F.coins >= SCENT.price ? "" : "disabled"}>Sit at the organ · ${SCENT.price} ${coin()}</button></div>` + shut;
      if (t.done) return h + `<p class="sub">${t.fresh ? `A new perfume: <b>${esc(t.name)}</b>! Madame Arnaud writes the name on a label in her curly handwriting.` : `<b>${esc(t.name)}</b> again: one of yours.`} ${t.first ? "She pours it into a little bottle for you to keep." : ""}</p><div class="actions">${btn("scentdone", "Thank Madame Arnaud")}</div>`;
      const stage = !t.top ? "top" : !t.heart ? "heart" : "base";
      return h + `<p class="sub">${{top: "First, the top note: bright, it's what you smell first.", heart: "Now the heart: the middle, the one that lasts an afternoon.", base: "And the base: deep, the one still there tomorrow."}[stage]}</p><div class="actions">${Object.entries(NOTES[stage]).map(([k, n]) => btn(`note.${k}`, n)).join("")}</div>`; }
    case "bees": { let h = tape("stripe") + `<h2>The hives with Mathis</h2>`;
      if (s.hives === dayKey() && !t) return h + `<p class="sub">You've been in the hives today. The bees have had enough of visitors, says Mathis.</p>` + shut;
      if (!t) return h + `<p class="sub">Into the white suit and the veil. Mathis hands you the smoker. "A little puff before you lift each frame. It calms them."${("")}</p><div class="actions">${btn("beesgo", "Suit up")}</div>` + shut;
      if (beesDone(t)) return h + `<p class="sub">${t.calm <= 0 ? "The buzzing rises, and Mathis says it's time to close up. \"They're cross today. Not your fault.\"" : `${t.lifted} frames of capped honey, golden and heavy.`} He gives you a jar from yesterday's spin.</p><div class="actions">${btn("beesdone", "Take off the veil")}</div>`;
      return h + `<p class="sub">${t.last === "buzz" ? "Bzzzz! You lifted it without smoke. The bees are cross." : t.last === "frame" ? "Up comes a frame, thick with honeycomb and slow, calm bees." : t.smoked ? "A puff of cool smoke drifts over the frames." : "The lid's off. Thousands of bees, humming."} (frame ${t.frame + 1} of ${BEES.FRAMES})</p><p class="muted">Calm: ${"●".repeat(t.calm)}${"○".repeat(3 - t.calm)}</p><div class="actions">${btn("bee.smoke", "A puff of smoke", false)}${btn("bee.lift", "Lift the frame")}</div>`; }
    case "maze": { let h = tape() + `<h2>The sunflower maze</h2>`;
      if (!t) return h + `<p class="sub">Paths cut through sunflowers taller than you. Somewhere in the middle there's a bench and a little bell.${("")}</p><div class="actions">${btn("mazego", "In you go")}</div>` + shut;
      if (mazeDone(t)) return h + `<p class="sub">The middle! A little clearing, a bench, and a bell on a post. Ring, ring!${("")} ${t.wrong ? `(Only ${t.wrong} dead end${t.wrong > 1 ? "s" : ""}.)` : "Not one wrong turn!"}</p><div class="actions">${btn("mazedone", "Find the way out")}</div>`;
      return h + `<p class="sub">${t.last === "dead" ? "A dead end! Just sunflowers, all staring at you. Back you go." : t.at ? "On you go, the sunflowers closing in overhead..." : "Sunflowers on every side. Which way?"} (turn ${t.at + 1})</p><div class="actions">${btn("turn.left", "Left")}${btn("turn.straight", "Straight on")}${btn("turn.right", "Right")}</div>`; }
    case "sticks": { let h = tape() + `<h2>Pooh-sticks off the Old Bridge</h2>`;
      if (!t) return h + `<p class="sub">Everyone picks a stick, drops it off the upstream side at the same moment, and runs to the other side to see whose comes out first. Theo says he's never lost. Officially. Best of three.</p><div class="actions">${btn("sticksgo", "Find a stick")}</div>` + shut;
      if (sticksDone(t)) return h + `<p class="sub">${t.mine > t.dads ? "You win! Theo demands a recount. There is no recount in Pooh-sticks." : "Theo wins, and does a small, dignified dance on the bridge."} (${t.mine} to ${t.dads})${("")}</p><div class="actions">${btn("sticksdone", "Back over the bridge")}</div>`;
      return h + `<p class="sub">${t.last === "won" ? "Yours pops out first!" : t.last === "lost" ? "Theo's pops out first. \"Undefeated. Put it in the register.\"" : "Pick your stick."} (race ${t.round + 1} of ${STICKS.ROUNDS})</p><div class="actions">${Object.entries(STICK_N).map(([k, n]) => btn(`stick.${k}`, n)).join("")}</div>`; }
    case "bell": { let h = tape("stripe") + `<h2>The chapel of Saint Anne</h2>`;
      if (!t) return h + `<p class="sub">Light a candle, for anyone, for no reason at all.${bellOpen(hm) ? " And it's nearly sunset: Père Gaston holds out the bell rope. \"Pull when it swings back down to you. Five strokes.\"" : " From half past five, someone rings the bell for the sunset."}</p><div class="actions">${btn("candle", "Light a candle", false)}${bellOpen(hm) ? btn("bellgo", "Take the bell rope") : ""}</div>` + shut;
      if (bellDone(t)) return h + `<p class="sub">${t.rung >= BELL.STROKES ? "Dong. Dong. Dong. Dong. Dong. Out over the hill, over the goats, over the lavender. Outside, everyone's gone quiet, watching the sun go down." : "The rope runs out of swing. A few good dongs, and the sun goes down anyway, orange and gold."}</p><div class="actions">${btn("belldone", "Go out to watch the sunset")}</div>`;
      const down = t.down[t.i];
      return h + `<p class="sub">${down ? "The rope swings back down to your hands..." : "The rope's up, swinging away from you..."} ${t.last === "dong" ? "DONG!" : t.last === "early" ? "Too soon: the rope jerks, nothing." : ""}</p><p class="muted">${t.rung} of ${BELL.STROKES} rung.</p><div class="actions">${btn("bell.pull", "Pull")}${btn("bell.wait", "Wait", false)}</div>`; }
    case "banon": { let h = tape() + `<h2>Céline's banon</h2>`;
      if (knowsBanon(F) && !t) return h + `<p class="sub">You know how to wrap a banon now. Make it at home in Elena's cheese press: three bottles of goat's milk, four days in the cave.</p>` + shut;
      if (!t) return h + `<p class="sub">Céline's banon: a little goat's cheese wrapped in chestnut leaves and tied with raffia. Four steps, in the right order. Then it's yours to make at home.</p><div class="actions"><button class="btn primary" data-bba="lv:banongo" ${F.coins >= BANON.price ? "" : "disabled"}>Roll up your sleeves · ${BANON.price} ${coin()}</button></div>` + shut;
      if (t.at >= BANON.steps.length) return h + `<p class="sub">${esc(B_SAY.rest)} ${t.wrong ? "\"A little out of order,\" says Céline, \"but it will taste the same.\"" : "\"Like my mother,\" says Céline, which is the best thing she can say."}</p><div class="actions">${btn("banondone", "Wash your hands")}</div>`;
      const opts = BANON.steps.slice().sort((a, b) => (a.charCodeAt(1)*5 + t.at) % 4 - (b.charCodeAt(1)*5 + t.at) % 4);
      return h + `<p class="sub">${t.at ? esc(B_SAY[BANON.steps[t.at - 1]]) : "A basket of dry chestnut leaves, a roll of raffia, and little rounds of fresh cheese. What first?"} ${t.last === "wrong" ? "<i>Céline smiles: \"Not yet.\"</i>" : ""}</p><div class="actions">${opts.map(k => btn("bstep." + k, B_N[k])).join("")}</div>`; }
  }
  return "";
}

// what a button does -> {say, sfx, xp, hearts, flash, close}, or null
export function lvAct(F, kind, st, verb, arg, o = {}){
  const s = lvState(F), hm = o.hm || 12*60, add = o.addInv || (() => {}), rng = o.rng || Math.random, t = st.t;
  switch (verb) {
    case "cutgo": if (s.cut === dayKey()) return null; st.t = harvestStart(rng); return {sfx: "paper"};
    case "cut": { if (!t) return null; const r = harvestCut(t, +arg); if (!r) return null; return {sfx: r === "cut" ? "pop" : "tap"}; }
    case "cutdone": if (!t || !harvestDone(t) || s.cut === dayKey()) return null; s.cut = dayKey(); st.t = null; add("bq_lavender", HARVEST.BUNCHES);
      return {close: true, xp: 1, hearts: 2, flash: "Two bunches of lavender", say: "Two bunches of lavender, tied with raffia: for the mill's soaps and oils, or a vase on the kitchen table."};
    case "petgo": st.t = petStart(rng); return {sfx: "paper"};
    case "pet": { if (!t) return null; const r = petThrow(t, arg, rng); if (!r) return null; return {sfx: r === "far" ? "tap" : "chime"}; }
    case "petdone": { if (!t || !petDone(t)) return null; s.games = (s.games || 0) + 1; const won = t.mine > t.his; if (won) s.wins = (s.wins || 0) + 1; st.t = null; return {close: true, xp: won ? 2 : 1, hearts: won ? 2 : 1}; }
    case "scentgo": if (F.coins < SCENT.price) return null; F.coins -= SCENT.price; st.t = {top: null, heart: null, base: null, done: false}; return {sfx: "chaching"};
    case "note": { if (!t || t.done) return null; const stage = !t.top ? "top" : !t.heart ? "heart" : "base"; if (!NOTES[stage][arg]) return null; t[stage] = arg;
      if (stage === "base") { const id = scentId(t.top, t.heart, t.base), name = scentName(t.top, t.heart, t.base); t.done = true; t.name = name; t.fresh = !s.scents.some(x => x.id === id); if (t.fresh) s.scents.push({id, name, day: dayKey()});
        t.first = !(F.inv || {}).b_myperfume && !s.bottled; if (t.first) { s.bottled = true; add("b_myperfume", 1); } }
      return {sfx: "pop"}; }
    case "scentdone": if (!t || !t.done) return null; st.t = null; return {close: true, xp: 2, hearts: 2, flash: t.first ? "Your own perfume" : t.fresh ? `A new perfume: ${t.name}` : null};
    case "beesgo": if (s.hives === dayKey()) return null; st.t = beesStart(); return {sfx: "paper"};
    case "bee": { if (!t) return null; const r = beesDo(t, arg); if (!r) return null; t.last = r; return {sfx: r === "buzz" ? "pop" : "tap"}; }
    case "beesdone": if (!t || !beesDone(t) || s.hives === dayKey()) return null; s.hives = dayKey(); st.t = null; add("honey_sun", 1); return {close: true, xp: 2, hearts: 2, flash: "A jar of sunflower honey", say: "Mathis gives you a jar of sunflower honey, golden and creamy. \"For your gelato,\" he says. Word gets around."};
    case "mazego": st.t = mazeStart(rng); return {sfx: "paper"};
    case "turn": { if (!t) return null; const r = mazeTurn(t, arg); if (!r) return null; t.last = r; return {sfx: r === "dead" ? "tap" : r === "middle" ? "chime" : "pop"}; }
    case "mazedone": { if (!t || !mazeDone(t)) return null; s.maze = (s.maze || 0) + 1; const cert = !s.cert && !(F.inv || {}).b_mazecert; if (cert) { s.cert = true; add("b_mazecert", 1); } st.t = null;
      return {close: true, xp: 1, hearts: 2, flash: cert ? "A sunflower maze certificate" : null, say: cert ? "Odile stamps a little certificate with a sunflower: you found the middle of the maze. It's going in a frame." : "Out of the sunflowers, blinking, with pollen on everything."}; }
    case "sticksgo": st.t = sticksStart(); return {sfx: "paper"};
    case "stick": { if (!t) return null; const r = sticksDrop(t, arg, rng); if (!r) return null; return {sfx: r === "won" ? "chime" : "tap"}; }
    case "sticksdone": { if (!t || !sticksDone(t)) return null; s.sticks = (s.sticks || 0) + 1; if (t.mine > t.dads) s.beatDad = (s.beatDad || 0) + 1; st.t = null; return {close: true, xp: 1, hearts: 2}; }
    case "candle": s.candles = (s.candles || 0) + 1; return {sfx: "chime", hearts: 1, say: "You light a little candle and set it with the others. The flames lean together in the draught from the door."};
    case "bellgo": if (!bellOpen(hm)) return null; st.t = bellStart(rng); return {sfx: "paper"};
    case "bell": { if (!t) return null; const r = bellDo(t, arg); if (!r) return null; t.last = r; return {sfx: r === "dong" ? "chime" : "tap"}; }
    case "belldone": { if (!t || !bellDone(t)) return null; s.bells = (s.bells || 0) + 1; const first = t.rung >= BELL.STROKES && !s.medal && !(F.inv || {}).b_bellmedal; if (first) { s.medal = true; add("b_bellmedal", 1); } st.t = null;
      return {close: true, xp: 2, hearts: 3, flash: first ? "A little chapel bell" : null, say: first ? "Père Gaston presses a tiny brass bell into your hand. \"For the one who rang Saint Anne.\" Outside, the sun's going down over the lavender." : "Out into the evening, the last of the sun on the cypresses."}; }
    case "banongo": if (knowsBanon(F) || F.coins < BANON.price) return null; F.coins -= BANON.price; st.t = {at: 0, wrong: 0, last: null}; return {sfx: "chaching"};
    case "bstep": { if (!t || t.at >= BANON.steps.length) return null; if (arg !== BANON.steps[t.at]) { t.wrong++; t.last = "wrong"; return {sfx: "tap"}; } t.at++; t.last = arg; return {sfx: "pop"}; }
    case "banondone": if (!t || t.at < BANON.steps.length) return null; F.hfarm = F.hfarm || {}; F.hfarm.learnt = {...(F.hfarm.learnt || {}), banon: true}; st.t = null;
      return {close: true, xp: 2, hearts: 2, flash: "A new cheese: banon", say: "Céline gives you a handful of dried chestnut leaves and a roll of raffia. Now you can make banon at home in Elena's cheese press: three bottles of goat's milk, four days in the cave."};
  }
  return null;
}
