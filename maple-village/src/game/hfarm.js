// Honeybrook Farm (Felix and Elena run it; Mel helps and takes a share). State in F.hfarm:
//   fed / brushed / milked   {animalId: day}  (feeding is per herd, brushing and milking per animal)
//   hives                    [time each hive was last emptied]
// The cows and goats are milked in the morning, 6 to 10, if they've been fed today or yesterday: a cow gives 2 milk,
// a goat 1 goat's milk, into Mel's backpack (the rest goes to Elena's dairy and stall). The five hives fill over three
// days; when Mel collects a full one she gets 2 jars of honey (Felix keeps the rest for his stall). The farm stand by
// the gate sells milk, goat's milk, honey and eggs.
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
  h.fed = h.fed || {}; h.brushed = h.brushed || {}; h.milked = h.milked || {};
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
export function collectHives(F){ const h = hfState(F), full = fullHives(h), t = clock(); if (!full.length) return 0; full.forEach(i => { h.hives[i] = t; }); const n = full.length*JARS; F.inv = F.inv || {}; F.inv.honey = (F.inv.honey || 0) + n; return n; }
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
  let p = `<span class="tape stripe" aria-hidden="true"></span><h2>The beehives</h2><p class="sub">Five hives in the lavender. Each fills over three days; collect a full one and you get ${JARS} jars of honey (Felix keeps the rest for his market stall). ${keeper ? "Felix lends you his bee veil." : "Put on the bee veil from the hook."}</p>`;
  p += `<ul class="hlist wlist">${h.hives.map((_, i) => { const f = hiveFill(h, i); return `<li><span class="wpic">${icon("honey", 22)}</span><span class="wtxt"><b>Hive ${i + 1}</b><small>${f >= 1 ? "full, heavy with honey" : `${Math.round(f*100)}% full`}</small></span><span class="clbar" style="width:80px"><i style="width:${Math.round(f*100)}%"></i></span></li>`; }).join("")}</ul>`;
  return p + `<div class="actions"><button class="btn primary small" data-hf="honey" ${full.length ? "" : "disabled"}>${full.length ? `Collect ${full.length*JARS} jars` : "Nothing ready yet"}</button><button class="btn alt small" data-close="1">Close</button></div>`;
}
export function standPanel(F){
  let p = `<span class="tape gingham" aria-hidden="true"></span><h2>The farm stand</h2><p class="sub">Fresh from the farm, an honesty tin for the coins. You have ${F.coins} ${coin()}.</p>`;
  p += `<ul class="hlist wlist">${Object.entries(STAND).map(([id, pr]) => `<li><span class="wpic">${icon(id, 24)}</span><span class="wtxt"><b>${id === "egg" ? "Fresh eggs" : id === "honey" ? "Wildflower honey" : id === "goatmilk" ? "Goat's milk" : "Milk"}</b><small>${pr} ${coin()} · ${(F.inv || {})[id] || 0} in your backpack</small></span><button class="btn small primary" data-hf="buy" data-k="${id}" ${F.coins >= pr ? "" : "disabled"}>Buy</button></li>`).join("")}</ul>`;
  return p + shut;
}
export const giveName = id => NAMES[id] || id;
