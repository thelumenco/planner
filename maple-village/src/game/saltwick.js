// Saltwick Harbour's rooms and things to join in with (round 215). The shops sell TOWN_GOODS (bought through ronda.js
// buyGood, the same data-rbuy buttons as every town's). Four things to take part in, each more than a speech bubble:
//   fossil hunting on the scar (split the stones with a little hammer: three a day, and some have an ammonite inside;
//     find all six kinds and Ruth's grandson Jack makes you a glass case for them), crabbing off the harbour wall
//     (drop the line, wait for the twitch, pull up in time; five drops, then tip them all back), a proper pot of tea
//     with Nell at the quay café (five steps in the right order), and lighting the lighthouse lamp with Alfie at dusk
//     (polish the lens, wind the clockwork, light it).
// State: F.saltwick = {found: {kind: day}, splitDay, splits, crabs, crabDay, best, line, tea, teaDay, mug, lamp, lampDay, ledger, treats, cased}
import { esc, dayKey, hash } from "../util.js";
import { icon } from "../art/icons.js";
import { TOWN_GOODS } from "../data/towns.js";
import { AMMONITES } from "../data/saltwick.js";

export function swState(F){ F.saltwick = F.saltwick || {}; const s = F.saltwick; s.found = s.found || {}; return s; }
const shut = `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
const coin = () => icon("coin", 13);
const goods = shop => Object.keys(TOWN_GOODS).filter(id => TOWN_GOODS[id].shop === shop);
const row = (F, id) => { const g = TOWN_GOODS[id], have = (F.inv || {})[id] || 0;
  return `<li><span class="wpic">${icon(id, 28)}</span><span class="wtxt"><b>${esc(g.n)}</b><small>${esc(g.what || g.say || g.line || "")}${have ? ` (${have} in your backpack)` : ""}${g.kind === "keepsake" ? " · a keepsake for a shelf" : g.keep ? " · give it, or keep it" : ""}</small></span><button class="btn small primary" data-rbuy="${id}" ${F.coins >= g.price ? "" : "disabled"}>${g.price} ${coin()}</button></li>`; };
const list = (F, shop, title) => { const ids = goods(shop); return ids.length ? `${title ? `<h3 class="ph3">${esc(title)}</h3>` : ""}<ul class="hlist wlist">${ids.map(id => row(F, id)).join("")}</ul>` : ""; };
const head = (title, sub) => `<span class="tape gingham" aria-hidden="true"></span><h2>${esc(title)}</h2><p class="sub">${sub}</p>`;

/* ---------- fossil hunting on the scar ---------- */
// Six stones on the ledge today (the same six all day). Three of them hold an ammonite; you can split three a day.
// A find is a kind you haven't got yet, if there are any left.
export const SCAR = {STONES: 6, SPLITS: 3, HAS: 3};
export const KINDS = Object.keys(AMMONITES);
export const stonesToday = (day = dayKey()) => { const h = hash(day + "scar"), order = Array.from({length: SCAR.STONES}, (_, i) => i).sort((a, b) => ((h >> a) & 7) - ((h >> b) & 7) || a - b); return new Set(order.slice(0, SCAR.HAS)); };
export function splitStone(F, i, addInv, day = dayKey()){
  const s = swState(F); if (s.splitDay !== day) { s.splitDay = day; s.splits = []; }
  if (s.splits.length >= SCAR.SPLITS || s.splits.includes(i) || i < 0 || i >= SCAR.STONES) return null;
  s.splits.push(i);
  if (!stonesToday(day).has(i)) return {empty: true};
  const missing = KINDS.filter(k => !s.found[k]), kind = missing.length ? missing[hash(day + i) % missing.length] : KINDS[hash(day + i) % KINDS.length], fresh = !s.found[kind];
  if (fresh) s.found[kind] = day; addInv("am_" + kind, 1);
  const all = KINDS.every(k => s.found[k]), cased = all && !s.cased; if (cased) { s.cased = day; addInv("s_case", 1); }
  return {kind, fresh, cased};
}
export function scarPanel(F, last, day = dayKey()){
  const s = swState(F), done = s.splitDay === day ? s.splits : [], left = SCAR.SPLITS - done.length, n = KINDS.filter(k => s.found[k]).length;
  let h = head("The scar", "Flat grey ledges left by the tide, cracked into stones the size of loaves. Jack showed you the trick: look for a round one with a ridge round its middle, and tap it, sharp, along the line.");
  if (last) h += `<p><b>${last.empty ? "Crack! Just stone inside, grey all the way through." : `Crack! It falls open, and there it is: ${esc(AMMONITES[last.kind][0])}, ${esc(AMMONITES[last.kind][1])}.${last.fresh ? " A new one for your collection!" : ""}`}</b>${last.cased ? " That's all six! Jack's going to make you a glass case for them: it's in your backpack." : ""}</p>`;
  h += `<div class="gchips swstones">${Array.from({length: SCAR.STONES}, (_, i) => { const split = done.includes(i); return `<button class="gchip${split ? " on" : ""}" data-sw="split:${i}" ${split || !left ? "disabled" : ""}><span>${split ? "split" : "a stone"}</span></button>`; }).join("")}</div>`;
  h += `<p class="muted">${left ? `${left} more stone${left === 1 ? "" : "s"} to split today.` : "That's your three for today. The tide brings new stones down overnight."} Your ammonites: ${n} of ${KINDS.length}.</p>`;
  if (n) h += `<ul class="bujo">${KINDS.filter(k => s.found[k]).map(k => `<li>${esc(AMMONITES[k][0])}</li>`).join("")}</ul>`;
  return h + shut;
}

/* ---------- crabbing off the harbour wall ---------- */
// Drop the line; somewhere between 1.5 and 4 seconds later it twitches; pull up within 1.2 seconds of the twitch and
// there's a crab on the bacon. Five drops, then you tip the bucket back into the harbour.
export const CRAB = {DROPS: 5, WIN: 1200, MIN: 1500, MAX: 4000};
export const crabStart = () => ({n: 0, got: 0, t0: 0, twitch: 0, last: null, done: false});
export function dropLine(st, rng = Math.random, now = Date.now()){ if (st.done || st.t0) return 0; st.t0 = now; st.twitch = now + CRAB.MIN + Math.floor(rng()*(CRAB.MAX - CRAB.MIN)); return st.twitch - now; }
export function pullUp(st, now = Date.now()){
  if (!st.t0 || st.done) return null;
  const r = now < st.twitch ? "soon" : now - st.twitch <= CRAB.WIN ? "crab" : "late";
  st.n++; st.t0 = 0; if (r === "crab") st.got++; st.last = r; if (st.n >= CRAB.DROPS) st.done = true; return r;
}
// the bucket tipped back -> a keepsake the first time you catch three or more (your own crabbing line)
export function crabDone(F, st, addInv, day = dayKey()){
  const s = swState(F); s.crabs = (s.crabs || 0) + st.got; s.best = Math.max(s.best || 0, st.got); s.crabDay = day;
  if (st.got >= 3 && !s.line) { s.line = day; addInv("s_crabline", 1); return true; } return false;
}
export function crabPanel(F, st, now = Date.now()){
  const s = swState(F);
  let h = head("Crabbing off the harbour wall", "A line, a bit of bacon tied on the end, and a bucket of seawater. Jack swears by smoked bacon. Drop it down by the weed on the wall, wait for the twitch, and pull up steady.");
  if (!st) return h + `<p class="muted">Five drops. ${s.best ? `Your best bucket: ${s.best} crab${s.best === 1 ? "" : "s"}.` : "Then you tip them all back in, and they scuttle off home."}</p><div class="actions"><button class="btn primary" data-sw="crab">Bacon on the line</button></div>` + shut;
  if (st.done) return h + `<p class="sub">${st.got ? `${st.got} crab${st.got === 1 ? "" : "s"} in the bucket, all waving their claws at you. You tip them gently back over the wall and they sink away sideways, offended.` : "Not a single crab. They're in a mood today. Jack says it happens to him too. (It doesn't.)"}</p><div class="actions"><button class="btn alt" data-sw="crab">Go again</button></div>` + shut;
  const down = !!st.t0, twitching = down && now >= st.twitch;
  h += `<h3 class="ph3">Drop ${Math.min(st.n + 1, CRAB.DROPS)} of ${CRAB.DROPS} · ${st.got} in the bucket</h3>`;
  h += `<p class="muted">${down ? (twitching ? "<b>The line twitches! Pull up!</b>" : "The line hangs down by the weed. Wait for it...") : st.last === "soon" ? "Up too soon: just the bacon, a bit nibbled." : st.last === "late" ? "Too slow: a crab lets go just as it reaches the top, and plops back in." : st.last === "crab" ? "A crab! Hanging on to the bacon by one claw. Into the bucket it goes." : "Lower the line down the wall."}</p>`;
  h += `<div class="swline${down ? " down" : ""}${twitching ? " twitch" : ""}" aria-hidden="true"><span></span></div>`;
  return h + `<div class="actions">${down ? `<button class="btn primary big" data-sw="pull">Pull up</button>` : `<button class="btn primary" data-sw="drop">Drop the line</button>`}</div>` + shut;
}

/* ---------- the quay café, and a proper pot of tea ---------- */
export const CAFE = {sarnie: ["A crab sandwich", 6, "White crab meat, brown bread, plenty of butter, a squeeze of lemon. Nell won't make it any other way."],
  scone: ["A pot of tea and a scone", 4, "A fat scone, still warm, with jam and clotted cream. Jam first. Nell's firm about it."],
  chips: ["A cone of chips", 4, "Hot chips in a paper cone with salt and vinegar, to eat on the harbour wall. Mind the gulls."],
  crumble: ["Rhubarb crumble and custard", 5, "Yorkshire rhubarb under a buttery crumble, and custard poured from a jug."]};
export function cafeTreat(F, k){ const c = CAFE[k]; if (!c || F.coins < c[1]) return null; F.coins -= c[1]; const s = swState(F); s.treats = (s.treats || 0) + 1; return c; }
export const TEA = ["Warm the pot", "Two teabags in the pot", "Water straight off the boil", "Let it brew four minutes", "A splash of milk in the cup"];
const TEA_ORDER = [3, 0, 4, 2, 1];   // the order the buttons sit in
export function teaStep(st, i){ if (st.done) return null; if (i !== st.step) { st.oops = true; return "oops"; } st.oops = false; st.step++; if (st.step >= TEA.length) st.done = true; return "ok"; }
// a proper brew -> a Saltwick mug the first time
export function teaDone(F, addInv, day = dayKey()){ const s = swState(F); s.tea = (s.tea || 0) + 1; s.teaDay = day; if (!s.mug) { s.mug = day; addInv("s_mug", 1); return true; } return false; }
export function cafePanel(F, st){
  let h = head("The quay café", "Nell came for a weekend twenty years ago and never went home. The windows are steamed up, the teapot's the size of a bucket, and she knows everyone's order before they open the door.");
  h += `<h3 class="ph3">Sit down with something</h3><ul class="hlist wlist">${Object.entries(CAFE).map(([k, [n, p, l]]) => `<li><span class="wtxt"><b>${esc(n)}</b><small>${esc(l)}</small></span><button class="btn small primary" data-sw="cafe:${k}" ${F.coins >= p ? "" : "disabled"}>${p} ${coin()}</button></li>`).join("")}</ul>`;
  h += `<h3 class="ph3">A proper pot of tea, with Nell</h3>`;
  if (!st) h += `<p class="muted">"Anyone can make tea," says Nell. "Not everyone can make a brew." Five steps, in the right order. Free, and she'll put the kettle on.</p><div class="actions"><button class="btn alt" data-sw="tea">Show me</button></div>`;
  else if (!st.done) h += `<p class="muted">${st.step ? `${esc(TEA[st.step - 1])}: done. ` : ""}What's next?${st.oops ? " (Nell tuts, kindly. \"Not yet, love.\")" : ""}</p><div class="gchips">${TEA_ORDER.map(i => `<button class="gchip" data-sw="step:${i}"><span>${esc(TEA[i])}</span></button>`).join("")}</div>`;
  else h += `<p class="sub">Nell takes a sip, closes her eyes, and nods slowly. "Now that's a brew. You can come again." She pours you a mug and sends the rest round the tables.</p>`;
  return h + list(F, "sw_cafe", "To take home") + shut;
}

/* ---------- the lighthouse: lighting the lamp with Alfie ---------- */
// At dusk (from 6pm, or 5pm in the winter months) Alfie climbs to the lamp room: polish the lens (three wipes), wind the
// clockwork that turns it (five turns), and light it. Before dusk you can still go up and look at the lens.
export const LAMP = {wipes: 3, turns: 5};
export const duskFrom = day => { const m = +day.slice(5, 7); return m >= 10 || m <= 3 ? 17*60 : 18*60; };
export const lampStart = () => ({wipes: 0, turns: 0, lit: false});
export function lampStep(st, what){
  if (st.lit) return null;
  if (what === "wipe" && st.wipes < LAMP.wipes) { st.wipes++; return "ok"; }
  if (what === "wind" && st.wipes >= LAMP.wipes && st.turns < LAMP.turns) { st.turns++; return "ok"; }
  if (what === "light" && st.turns >= LAMP.turns) { st.lit = true; return "lit"; }
  return null;
}
// the lamp lit -> the ledger page the first time
export function lampDone(F, addInv, day = dayKey()){ const s = swState(F); s.lamp = (s.lamp || 0) + 1; s.lampDay = day; if (!s.ledger) { s.ledger = day; addInv("s_ledger", 1); return true; } return false; }
export function lampPanel(F, st, hm, day = dayKey()){
  const dusk = hm >= duskFrom(day), s = swState(F);
  let h = head("The lamp room", "Up a hundred and eight iron steps to a little glass room right at the top. The lens is taller than you: rings and rings of glass like a giant beehive, and every one has to shine.");
  if (!dusk) return h + `<p class="muted">"Come back at dusk," says Alfie, "and you can light her with me." (From ${duskFrom(day) === 17*60 ? "five" : "six"} o'clock.)${s.lamp ? ` You've lit the lamp ${s.lamp} time${s.lamp === 1 ? "" : "s"}.` : ""}</p>` + shut;
  if (!st) return h + `<p class="muted">The sky's going violet over the sea. Alfie hands you a soft cloth. "Lens first. Then the clockwork. Then we light her."</p><div class="actions"><button class="btn primary" data-sw="lamp">Climb up</button></div>` + shut;
  if (st.lit) return h + `<p class="sub">The lamp catches, and the whole lens blazes green. Then it starts to turn, slow and steady, and out across the dark water a fishing boat flashes its lights back. "That's Davey on the Morning Star," says Alfie. "He'll be home for his tea now." He writes it in the ledger.</p>` + shut;
  h += `<p class="muted">${st.wipes < LAMP.wipes ? `Polish the lens: ${st.wipes} of ${LAMP.wipes} rings shining.` : st.turns < LAMP.turns ? `Wind the clockwork: ${st.turns} of ${LAMP.turns} turns. It ticks like a grandfather clock.` : "All wound. Alfie hands you the long taper."}</p>`;
  return h + `<div class="actions">${st.wipes < LAMP.wipes ? `<button class="btn primary" data-sw="wipe">Polish</button>` : st.turns < LAMP.turns ? `<button class="btn primary" data-sw="wind">Wind</button>` : `<button class="btn primary big" data-sw="light">Light the lamp</button>`}</div>` + shut;
}

/* ---------- the shops ---------- */
export function marketPanel(F){
  return head("The fish market", "Ruth's family have sold fish on this quay for four generations. Today's catch is chalked on the board, the lobsters are sulking in their tank, and Jack's shovelling ice.")
    + list(F, "sw_market") + `<p class="muted">"Clams? Friday's van at your bay has those. I do the things you can't get." Ruth winks.</p>` + shut;
}
export const chandleryPanel = F => head("The chandlery", "Walter's grandad opened the chandlery in 1931 and nothing's been thrown away since. Rope, lamps, oilskins, hooks, buttons, ganseys, and a brass bell over the door that rings when you breathe on it.") + list(F, "sw_chandlery")
  + `<p class="muted">"The dark rum's the kind the boats took to sea," says Walter. "For your Scoop Shack? Rum and raisin, then. My grandad's favourite. Dry your own grapes for the raisins, mind."</p>` + shut;   // round 231
export const smokehousePanel = F => head("The smokehouse", "Sid splits the herring at dawn, salts them, and hangs them on the speats over smouldering oak for sixteen hours. \"No shortcuts,\" he says. \"The smoke knows.\"") + list(F, "sw_smokehouse") + shut;

// the panel for each of Saltwick's room spots and outdoor activities
export function swPanel(F, view, st = {}, hm = 12*60){
  return view === "sw_market" ? marketPanel(F) : view === "sw_chandlery" ? chandleryPanel(F) : view === "sw_smokehouse" ? smokehousePanel(F)
    : view === "sw_cafe" ? cafePanel(F, st.tea) : view === "sw_lighthouse" ? lampPanel(F, st.lamp, hm) : view === "scar" ? scarPanel(F, st.last) : view === "crab" ? crabPanel(F, st.crab) : "";
}
