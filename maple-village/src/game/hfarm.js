// Wildflower Farm (Felix and Elena run it; Mel helps and takes a share). State in F.hfarm:
//   fed / brushed / milked   {animalId: day}  (feeding is per herd, brushing and milking per animal)
//   hives                    [time each hive was last emptied]
// The cows and goats are milked in the morning, 6 to 10, if they've been fed today or yesterday: a cow gives 2 milk,
// a goat 1 goat's milk, into Mel's backpack (the rest goes to Elena's dairy and stall). The five hives fill over three
// days; when Mel collects a full one she gets 2 frames of comb (Felix keeps the rest for his stall). The farm stand by
// the gate sells milk, goat's milk, honey and eggs.
// Inside the barn (step 2): the hives give frames, spun into jars at the honey extractor (this week's honey: wildflower,
// lavender or orchard blossom, turn and turn about); milk becomes yoghurt in the crocks straight away; and the cheese
// press makes a named wheel (suggested names, like the wines) that ages on a shelf in the cave (6 shelves): fresh goat's
// cheese in a day, farmhouse cheddar in four, Honeybrook blue in six. A ripe wheel is cut into wedges for the backpack.
import { esc, dayKey, sgHM } from "../util.js";
import { icon } from "../art/icons.js";

export const COWS = [{id: "daisy", n: "Daisy", col: "#FFFDF6", spots: "#3A2E28", line: "Daisy leans into the brush and closes her eyes."},
  {id: "buttercup", n: "Buttercup", col: "#E8C48E", line: "Buttercup moos, very politely."},
  {id: "mochi", n: "Mochi", col: "#F6F1E8", spots: "#8A5A3A", line: "Mochi licks your sleeve. Thank you, Mochi."}];
export const GOATS = [{id: "pepper", n: "Pepper", col: "#6B6460", line: "Pepper tries to eat the brush."},
  {id: "biscuit", n: "Biscuit", col: "#D9B48A", line: "Biscuit headbutts you, gently. It's love."},
  {id: "nutmeg", n: "Nutmeg", col: "#A8754F", line: "Nutmeg hops onto the spool and poses."},
  {id: "toffee", n: "Toffee", col: "#F3E7C9", line: "Toffee nibbles your shoelace."}];
export const HERDS = {cows: {n: "cow paddock", list: COWS, gives: "milk", per: 2}, goats: {n: "goat paddock", list: GOATS, gives: "goatmilk", per: 1}};
export const MILK_FROM = 6*60, MILK_TO = 10*60, HIVES = 5, HIVE_DAYS = 3, JARS = 2;
export const HIVE_SPOTS = [[204, 214], [240, 200], [276, 214], [222, 242], [262, 242]];
export const STAND = {milk: 3, goatmilk: 4, honey: 6, egg: 3};
const clock = () => Date.now() + (globalThis.__mapleOffset || 0);
const yesterday = day => new Date(Date.parse(day + "T00:00:00Z") - 864e5).toISOString().slice(0, 10);

export function hfState(F){
  F.hfarm = F.hfarm || {};
  const h = F.hfarm, t = clock();
  h.fed = h.fed || {}; h.brushed = h.brushed || {}; h.milked = h.milked || {}; h.frames = h.frames || 0; h.cave = h.cave || []; h.names = h.names || [];
  if (!Array.isArray(h.hives) || h.hives.length !== HIVES) h.hives = Array.from({length: HIVES}, (_, i) => t - (i*0.7 + .4)*864e5);   // staggered, so one's nearly full on day one
  return h;
}
export const hiveFill = (h, i) => Math.min(1, (clock() - h.hives[i])/(HIVE_DAYS*864e5));
export const fullHives = h => h.hives.map((_, i) => i).filter(i => hiveFill(h, i) >= 1);
export const milkingNow = (hm = sgHM()) => hm >= MILK_FROM && hm < MILK_TO;
export const wellFed = (h, id, day = dayKey()) => h.fed[id] === day || h.fed[id] === yesterday(day);

// the whole herd gets hay and water -> how many were hungry
export function feedHerd(F, herd){ const h = hfState(F), day = dayKey(), list = HERDS[herd].list.filter(a => h.fed[a.id] !== day); list.forEach(a => { h.fed[a.id] = day; }); return list.length; }
export function brush(F, id){ const h = hfState(F), day = dayKey(); if (h.brushed[id] === day) return null; h.brushed[id] = day; return [...COWS, ...GOATS].find(a => a.id === id); }
// milk one animal -> {n, gives} or a reason it can't be milked
export function milkOne(F, herd, id){
  const h = hfState(F), day = dayKey(), H = HERDS[herd], a = H.list.find(x => x.id === id); if (!a) return {err: "?"};
  if (!milkingNow()) return {err: "Milking's in the morning, 6 to 10."};
  if (h.milked[id] === day) return {err: `${a.n}'s been milked today.`};
  if (!wellFed(h, id, day)) return {err: `${a.n} needs her hay first.`};
  h.milked[id] = day; F.inv = F.inv || {}; F.inv[H.gives] = (F.inv[H.gives] || 0) + H.per; return {n: H.per, gives: H.gives, a};
}
export function milkHerd(F, herd){ let n = 0; HERDS[herd].list.forEach(a => { const r = milkOne(F, herd, a.id); if (r.n) n += r.n; }); return n; }
// full hives give frames of comb, to spin into jars at the barn's honey extractor
export function collectHives(F){ const h = hfState(F), full = fullHives(h), t = clock(); if (!full.length) return 0; full.forEach(i => { h.hives[i] = t; }); const n = full.length*JARS; h.frames += n; return n; }
export const HONEYS = [{id: "honey", n: "wildflower"}, {id: "honey_lav", n: "lavender"}, {id: "honey_blossom", n: "orchard blossom"}];
export const honeyNow = (day = dayKey()) => HONEYS[Math.floor(Date.parse(day + "T00:00:00Z")/(7*864e5)) % HONEYS.length];   // what the bees are on this week
export function spinFrames(F){ const h = hfState(F), n = h.frames, kind = honeyNow(); if (!n) return null; h.frames = 0; F.inv = F.inv || {}; F.inv[kind.id] = (F.inv[kind.id] || 0) + n; return {n, kind}; }
// the yoghurt crocks: a bottle of milk (or goat's milk) becomes a pot of yoghurt
export function makeYoghurt(F, all){ const inv = F.inv || {}; let n = 0; for (const m of ["milk", "goatmilk"]) while ((inv[m] || 0) > 0 && (all || !n)) { inv[m]--; if (!inv[m]) delete inv[m]; n++; } if (n) inv.yoghurt = (inv.yoghurt || 0) + n; F.inv = inv; return n; }

/* ---------- cheese: the press and the cave ---------- */
export const CHEESES = {
  fresh: {n: "Fresh goat's cheese", milk: "goatmilk", need: 2, days: 1, wedges: 4, id: "chz_fresh", col: "#FFF8EC", words: ["Chèvre", "Little Log", "Fresh", "Curd"]},
  cheddar: {n: "Farmhouse cheddar", milk: "milk", need: 3, days: 4, wedges: 6, id: "chz_cheddar", col: "#F3C969", words: ["Cheddar", "Clothbound", "Farmhouse", "Tasty"]},
  blue: {n: "Honeybrook blue", milk: "milk", need: 3, days: 6, wedges: 6, id: "chz_blue", col: "#DCE3E8", words: ["Blue", "Bleu", "Veined Blue"]}
};
export const CAVE = 6;
const C_PLACE = ["Lavender Hill", "Barn Door", "Honeybrook", "Hay Loft", "Morning Mist", "Stone Wall", "Sunday", "Windmill", "Brookside", "Old Gate", "Clover Field", "Harvest", "Lantern", "Bee Hive", "Rainy Day", "Golden Hour"];
const C_FR = {fresh: ["Petit Chèvre de Honeybrook", "Chèvre du Ruisseau", "Frais de la Ferme"], cheddar: ["Tomme de Honeybrook", "Vieux Grange", "Tomme du Moulin"], blue: ["Bleu de la Baie", "Bleu du Ruisseau", "Bleu de Honeybrook"]};
// suggested names for a new wheel: places on the farm, the animal it came from, and a few in French; never one in use
export function cheeseNames(F, kind, seed = 0){
  const h = hfState(F), c = CHEESES[kind]; if (!c) return [];
  const used = new Set([...h.names, ...h.cave.map(w => w.name)].map(x => x.toLowerCase())), from = kind === "fresh" ? GOATS : COWS, out = [];
  const sd = Math.floor(seed) + h.names.length*31 + Object.keys(CHEESES).indexOf(kind)*7;
  for (let k = 0; out.length < 12 && k < 200; k++) {
    const w = c.words[(sd + k) % c.words.length], a = from[(sd + k*3) % from.length].n, kind3 = k % 3;
    const nm = kind3 === 0 ? `${C_PLACE[(sd + k*5) % C_PLACE.length]} ${w}` : kind3 === 1 ? `${a}'s ${C_PLACE[(sd + k*7 + 2) % C_PLACE.length]} ${w}` : C_FR[kind][(sd + k) % C_FR[kind].length];
    if (!used.has(nm.toLowerCase()) && !out.includes(nm)) out.push(nm);
  }
  return out;
}
export const caveLeft = w => Math.max(0, w.done - clock());
export function pressCheese(F, kind, name){
  const h = hfState(F), c = CHEESES[kind], inv = F.inv || {}; if (!c || h.cave.length >= CAVE || (inv[c.milk] || 0) < c.need) return null;
  inv[c.milk] -= c.need; if (!inv[c.milk]) delete inv[c.milk];
  const nm = String(name || "").replace(/[<>&"]/g, "").trim().slice(0, 30) || cheeseNames(F, kind, clock()/864e5)[0] || c.n, t = clock();
  const w = {kind, name: nm, start: t, done: t + c.days*864e5}; h.cave.push(w); h.names = [...h.names, nm].slice(-60); return w;
}
// a ripe wheel, cut into wedges for the backpack
export function takeWheel(F, i){ const h = hfState(F), w = h.cave[i]; if (!w || caveLeft(w)) return null; const c = CHEESES[w.kind]; h.cave.splice(i, 1); F.inv = F.inv || {}; F.inv[c.id] = (F.inv[c.id] || 0) + c.wedges; return {w, c}; }
export function buyStand(F, id){ const p = STAND[id]; if (!p || F.coins < p) return false; F.coins -= p; F.inv = F.inv || {}; F.inv[id] = (F.inv[id] || 0) + 1; return true; }

/* ---------- panels ---------- */
const shut = `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
const coin = () => icon("coin", 13);
const NAMES = {milk: "milk", goatmilk: "goat's milk", honey: "honey", egg: "eggs"};
export function herdPanel(F, herd, keeper){
  const h = hfState(F), day = dayKey(), H = HERDS[herd], cow = herd === "cows", hungry = H.list.filter(a => h.fed[a.id] !== day).length;
  let p = `<span class="tape gingham" aria-hidden="true"></span><h2>The ${H.n}</h2><p class="sub">${cow ? "Daisy, Buttercup and Mochi." : "Pepper, Biscuit, Nutmeg and Toffee, and their climbing spool."} ${milkingNow() ? "It's milking time (6 to 10)." : "Milking's in the morning, 6 to 10."} ${cow ? "Each cow gives 2 milk" : "Each goat gives 1 goat's milk"}, if she's had her hay today or yesterday. ${keeper ? "Elena's here to help." : ""}</p>`;
  p += `<div class="actions"><button class="btn primary small" data-hf="feed" data-k="${herd}" ${hungry ? "" : "disabled"}>${hungry ? `Hay and water for everyone` : "Everyone's fed today"}</button><button class="btn alt small" data-hf="milkall" data-k="${herd}" ${milkingNow() ? "" : "disabled"}>Milk them all</button></div>`;
  p += `<ul class="hlist wlist">${H.list.map(a => `<li><span class="wpic"><span class="gdot" style="background:${a.col}"></span></span><span class="wtxt"><b>${esc(a.n)}</b><small>${h.fed[a.id] === day ? "fed" : wellFed(h, a.id, day) ? "fed yesterday" : "hungry"} · ${h.brushed[a.id] === day ? "brushed" : "unbrushed"} · ${h.milked[a.id] === day ? "milked" : "not milked"}</small></span><span class="orbtns"><button class="btn small alt" data-hf="brush" data-k="${a.id}" ${h.brushed[a.id] === day ? "disabled" : ""}>Brush</button><button class="btn small primary" data-hf="milk" data-herd="${herd}" data-k="${a.id}" ${milkingNow() && h.milked[a.id] !== day && wellFed(h, a.id, day) ? "" : "disabled"}>Milk</button></span></li>`).join("")}</ul>`;
  return p + shut;
}
export function hivesPanel(F, keeper){
  const h = hfState(F), full = fullHives(h);
  let p = `<span class="tape stripe" aria-hidden="true"></span><h2>The beehives</h2><p class="sub">Five hives in the lavender. Each fills over three days; collect a full one and you get ${JARS} frames of comb to spin into jars at the extractor in the barn (Felix keeps the rest for his market stall). This week the bees are on the ${honeyNow().n}. ${keeper ? "Felix lends you his bee veil." : "Put on the bee veil from the hook."}</p>`;
  p += `<ul class="hlist wlist">${h.hives.map((_, i) => { const f = hiveFill(h, i); return `<li><span class="wpic">${icon("honey", 22)}</span><span class="wtxt"><b>Hive ${i + 1}</b><small>${f >= 1 ? "full, heavy with honey" : `${Math.round(f*100)}% full`}</small></span><span class="clbar" style="width:80px"><i style="width:${Math.round(f*100)}%"></i></span></li>`; }).join("")}</ul>`;
  return p + `<div class="actions"><button class="btn primary small" data-hf="honey" ${full.length ? "" : "disabled"}>${full.length ? `Collect ${full.length*JARS} frames` : "Nothing ready yet"}</button><button class="btn alt small" data-close="1">Close</button></div>`;
}
export function standPanel(F){
  let p = `<span class="tape gingham" aria-hidden="true"></span><h2>The farm stand</h2><p class="sub">Fresh from the farm, an honesty tin for the coins. You have ${F.coins} ${coin()}.</p>`;
  p += `<ul class="hlist wlist">${Object.entries(STAND).map(([id, pr]) => `<li><span class="wpic">${icon(id, 24)}</span><span class="wtxt"><b>${id === "egg" ? "Fresh eggs" : id === "honey" ? "Wildflower honey" : id === "goatmilk" ? "Goat's milk" : "Milk"}</b><small>${pr} ${coin()} · ${(F.inv || {})[id] || 0} in your backpack</small></span><button class="btn small primary" data-hf="buy" data-k="${id}" ${F.coins >= pr ? "" : "disabled"}>Buy</button></li>`).join("")}</ul>`;
  return p + shut;
}
export const giveName = id => NAMES[id] || id;

/* ---------- the barn's panels ---------- */
const dur = ms => { const hrs = Math.ceil(ms/36e5); return hrs >= 24 ? `${Math.floor(hrs/24)}d ${hrs % 24}h` : `${hrs}h`; };
export function extractorPanel(F){
  const h = hfState(F), k = honeyNow();
  return `<span class="tape stripe" aria-hidden="true"></span><h2>The honey extractor</h2><p class="sub">Frames of comb from the hives go in the drum; a good spin, and the honey runs into jars. This week it's ${k.n} honey. ${h.frames ? `${h.frames} frame${h.frames === 1 ? "" : "s"} waiting.` : "No frames waiting: collect them from the hives."}</p>
    <div class="actions"><button class="btn primary small" data-hf="spin" ${h.frames ? "" : "disabled"}>${h.frames ? `Spin and jar (${h.frames})` : "Nothing to spin"}</button><button class="btn alt small" data-close="1">Close</button></div>`;
}
export function crockPanel(F){
  const inv = F.inv || {}, m = (inv.milk || 0) + (inv.goatmilk || 0);
  return `<span class="tape gingham" aria-hidden="true"></span><h2>The yoghurt crocks</h2><p class="sub">A bottle of milk or goat's milk makes a pot of thick yoghurt: for frozen yoghurt at the Scoop Shack, or breakfast. You have ${m} bottle${m === 1 ? "" : "s"} of milk${inv.yoghurt ? ` and ${inv.yoghurt} pot${inv.yoghurt === 1 ? "" : "s"} of yoghurt` : ""}.</p>
    <div class="actions"><button class="btn primary small" data-hf="yog" ${m ? "" : "disabled"}>Make one</button><button class="btn alt small" data-hf="yogall" ${m > 1 ? "" : "disabled"}>All of it</button><button class="btn alt small" data-close="1">Close</button></div>`;
}
export function pressPanel(F, st = {}){
  const h = hfState(F), inv = F.inv || {}, kind = CHEESES[st.kind] ? st.kind : "cheddar", c = CHEESES[kind], ok = h.cave.length < CAVE && (inv[c.milk] || 0) >= c.need, sug = cheeseNames(F, kind, Math.floor(clock()/864e5));
  let p = `<span class="tape stripe" aria-hidden="true"></span><h2>The cheese press</h2><p class="sub">Choose a cheese, give the wheel a name, and press it. It ages on a shelf in the cave until it's ripe. ${h.cave.length} of ${CAVE} shelves in use.</p>`;
  p += `<div class="gchips">${Object.entries(CHEESES).map(([k, x]) => `<button class="gchip${k === kind ? " on" : ""}" data-hf="ckind" data-k="${k}" aria-pressed="${k === kind}"><span class="gdot" style="background:${x.col}"></span><span>${esc(x.n)}</span></button>`).join("")}</div>`;
  p += `<p class="muted">${esc(c.n)}: ${c.need} ${c.milk === "goatmilk" ? "goat's milk" : "milk"} (you have ${inv[c.milk] || 0}), ripe in ${c.days} day${c.days === 1 ? "" : "s"}, ${c.wedges} wedges.</p>`;
  p += `<label class="sr" for="hfName">Name this wheel</label><input id="hfName" class="vyname" maxlength="30" placeholder="${esc(sug[0] || "Name it")}" value="${esc(st.name || "")}"><div class="actions"><button class="btn alt small" data-hf="csug">Suggest a name</button><button class="btn primary small" data-hf="press" ${ok ? "" : "disabled"}>Press it</button><button class="btn alt small" data-close="1">Close</button></div>`;
  if (!ok) p += `<p class="muted">${h.cave.length >= CAVE ? "The cave's full: take a ripe wheel out first." : `Not enough ${c.milk === "goatmilk" ? "goat's milk" : "milk"}: milk the ${c.milk === "goatmilk" ? "goats" : "cows"} in the morning.`}</p>`;
  return p;
}
export function cavePanel(F){
  const h = hfState(F);
  let p = `<span class="tape gingham" aria-hidden="true"></span><h2>The cheese cave</h2><p class="sub">Cool and dark, with wheels on oak shelves. Elena turns them every morning. ${h.cave.length} of ${CAVE} shelves in use.</p>`;
  p += h.cave.length ? `<ul class="hlist wlist">${h.cave.map((w, i) => { const c = CHEESES[w.kind], left = caveLeft(w); return `<li><span class="wpic"><span class="gdot" style="background:${c.col}"></span></span><span class="wtxt"><b>${esc(w.name)}</b><small>${esc(c.n)} · ${left ? `ripe in ${dur(left)}` : "ripe!"}</small></span>${left ? `<span class="clbar" style="width:70px"><i style="width:${Math.round(100*(1 - left/(c.days*864e5)))}%"></i></span>` : `<button class="btn small primary" data-hf="wheel" data-k="${i}">Cut it</button>`}</li>`; }).join("")}</ul>` : `<p class="muted">Empty shelves. Press a wheel at the cheese press.</p>`;
  return p + shut;
}
