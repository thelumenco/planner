// Cinque Terre's rooms and things to join in with (rounds 132–133). The shops sell TOWN_GOODS (bought through ronda.js
// buyGood, the shared data-rbuy buttons). Three things to take part in, each more than a speech bubble:
//   pesto with Nonna Pina (the five ingredients in the right order, pounding each one in: two jars, and now Mel can
//   make it at home in the loft), the harvest on the monorail with Signor Bruno (ride up the terraces, pick the ripe
//   bunches and leave the green: he shows her how to dry grapes for raisin wine), and painting a fishing boat with the
//   fishermen in Manarola (hull, stripe, and Evan's letters for the name: a model to keep, and the same boat turns up
//   by the jetty at home). Evan joins in each. Also: gelato, focaccia and farinata, a tasting at the cantina, a padlock.
// State: F.cinque = {pestoLesson, raisin, boat: {hull, stripe, name}, pesto, harvests, boats, padlock, treats, bread}
import { esc, dayKey } from "../util.js";
import { icon } from "../art/icons.js";
import { TOWN_GOODS } from "../data/towns.js";

export function cinqueState(F){ F.cinque = F.cinque || {}; return F.cinque; }
const shut = `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
const coin = () => icon("coin", 13);
const goods = shop => Object.keys(TOWN_GOODS).filter(id => TOWN_GOODS[id].shop === shop);
const row = (F, id) => { const g = TOWN_GOODS[id], have = (F.inv || {})[id] || 0;
  return `<li><span class="wpic">${icon(id, 28)}</span><span class="wtxt"><b>${esc(g.n)}</b><small>${esc(g.what || g.say || g.line || "")}${have ? ` (${have} in your backpack)` : ""}${g.kind === "keepsake" ? " · a keepsake for a shelf" : g.keep ? " · give it, or keep it" : ""}</small></span><button class="btn small primary" data-rbuy="${id}" ${F.coins >= g.price ? "" : "disabled"}>${g.price} ${coin()}</button></li>`; };
const list = (F, shop, title) => { const ids = goods(shop); return ids.length ? `${title ? `<h3 class="ph3">${esc(title)}</h3>` : ""}<ul class="hlist wlist">${ids.map(id => row(F, id)).join("")}</ul>` : ""; };
const treats = (F, menu, act) => `<ul class="hlist wlist">${Object.entries(menu).map(([k, [n, p, l]]) => `<li><span class="wtxt"><b>${esc(n)}</b><small>${esc(l)}</small></span><button class="btn small primary" data-ct="${act}:${k}" ${F.coins >= p ? "" : "disabled"}>${p} ${coin()}</button></li>`).join("")}</ul>`;
export function treat(F, menu, k){ const t = menu[k]; if (!t || F.coins < t[1]) return null; F.coins -= t[1]; const c = cinqueState(F); c.treats = (c.treats || 0) + 1; return t; }

/* ---------- pesto with Nonna Pina (the pesto kitchen) ---------- */
// The five ingredients in order; each one goes in and gets pounded (three taps of the pestle) before the next. Wrong
// order and Nonna Pina tuts and puts your hand right. Two jars to take home, and the loft's mortar unlocks.
export const PESTO = {price: 6, POUNDS: 3, steps: ["Garlic and a pinch of salt", "Pine nuts", "Basil leaves", "Cheese", "Olive oil"]};
export const pestoStart = () => ({step: 0, pounds: 0, oops: false});
export function pestoAdd(st, i){ if (st.step >= 5 || st.pounds < (st.step ? PESTO.POUNDS : 0)) return "pound"; if (i !== st.step) { st.oops = true; return "oops"; } st.step++; st.pounds = 0; st.oops = false; return "ok"; }
export function pestoPound(st){ if (!st.step || st.pounds >= PESTO.POUNDS) return false; st.pounds++; return true; }
export const pestoDone = st => st.step >= 5 && st.pounds >= PESTO.POUNDS;
export function finishPesto(F, addInv){ if (F.coins < PESTO.price) return null; F.coins -= PESTO.price; addInv("pesto", 2); const c = cinqueState(F); c.pestoLesson = true; c.pesto = (c.pesto || 0) + 1; return true; }
export function pestoPanel(F, st, evan){
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>The pesto kitchen</h2><p class="sub">Nonna Pina is eighty-one and has made pesto every day since she was six. "Never a blender," she says, tapping the marble. "The basil gets frightened."</p>`;
  h += `<h3 class="ph3">Make pesto with Nonna Pina · ${PESTO.price} ${coin()}</h3>`;
  if (!st) h += `<p class="muted">Five ingredients into the marble mortar, in the right order, pounding each one in. Two jars to take home${cinqueState(F).pestoLesson ? "" : ", and she'll tell you her secret so you can make it at home"}.${evan ? " Evan gets his own little mortar and some basil to bash." : ""}</p><div class="actions"><button class="btn primary" data-ct="pesto" ${F.coins >= PESTO.price ? "" : "disabled"}>Roll up your sleeves</button></div>`;
  else if (!pestoDone(st)) {
    const needPound = st.step && st.pounds < PESTO.POUNDS;
    h += `<p class="muted">${st.step ? `${esc(PESTO.steps[st.step - 1])}: in. ` : ""}${needPound ? `Pound it in: ${st.pounds}/${PESTO.POUNDS}.` : st.step < 5 ? "What goes in next?" : ""}${st.oops ? " (Nonna Pina tuts and moves your hand: not that one yet.)" : ""}</p>
      <div class="ctmortar"><span style="height:${Math.min(100, st.step*18 + st.pounds*2)}%"></span></div>
      ${needPound ? `<div class="actions"><button class="btn primary big" data-ct="pound">Pound</button></div>` : `<div class="gchips">${[2, 0, 4, 1, 3].map(i => `<button class="gchip" data-ct="padd:${i}"><span>${esc(PESTO.steps[i])}</span></button>`).join("")}</div>`}`;
  } else h += `<p class="muted">Bright green, glossy, smelling like summer. "Brava," says Nonna Pina, and means it. She spoons it into two jars.</p><div class="actions"><button class="btn primary" data-ct="pestodone" ${F.coins >= PESTO.price ? "" : "disabled"}>Jar it up · ${PESTO.price} ${coin()}</button></div>`;
  return h + list(F, "ct_pesto", "From the kitchen") + shut;
}

/* ---------- the harvest on the monorail (Corniglia, and the cantina) ---------- */
// Ride the monorail up the terraces, then nine bunches on the vines: pick the ripe (purple-gold) ones, leave the green.
// All the ripe ones picked and Signor Bruno lays them on his cane racks and shows Mel how: raisin wine at home.
export const HARVEST = {N: 9};
export const harvestStart = (rng = Math.random) => { const ripe = Array.from({length: HARVEST.N}, () => rng() < .6); if (!ripe.some(Boolean)) ripe[0] = true; return {ripe, picked: [], oops: 0, riding: true}; };
export function pick(st, i){ if (st.riding || st.picked.includes(i)) return null; if (!st.ripe[i]) { st.oops++; return "green"; } st.picked.push(i); return "ok"; }
export const harvestDone = st => !st.riding && st.ripe.every((r, i) => !r || st.picked.includes(i));
export function finishHarvest(F, addInv){ const c = cinqueState(F); c.raisin = true; c.harvests = (c.harvests || 0) + 1; if (c.harvestDay !== dayKey()) { c.harvestDay = dayKey(); addInv("grape_white", 3); return 3; } return 0; }
export function harvestPanel(F, st, evan){
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>The monorail</h2><p class="sub">Signor Bruno's terraces go straight up the cliff. Everything comes down on the monorail: a tiny rack train on one rail, with a seat for him and a box for the grapes. "Hold on," he says. "And don't look down. Or do. It's beautiful."</p>`;
  if (!st) return h + `<h3 class="ph3">Help with the harvest</h3><p class="muted">Ride up the terraces and pick the ripe bunches. Free: he's glad of the help.${cinqueState(F).raisin ? "" : " He'll show you how he dries them for the sweet wine, too."}${evan ? " Evan rides in the grape box. He is delighted." : ""}</p><div class="actions"><button class="btn primary" data-ct="ride">Climb aboard</button></div>` + shut;
  if (st.riding) return h + `<p class="muted">Putt-putt-putt... up between the vines, the sea dropping away below.</p><div class="ctride"><span></span></div><div class="actions"><button class="btn primary" data-ct="arrive">At the top: start picking</button></div>`;
  if (!harvestDone(st)) return h + `<p class="muted">Pick the ripe bunches (golden and heavy); leave the green ones for next week.${st.oops ? ` Signor Bruno: "Not that one! Too sour."` : ""} ${st.picked.length}/${st.ripe.filter(Boolean).length}</p>
    <div class="ctvines">${st.ripe.map((r, i) => `<button class="ctbunch${st.picked.includes(i) ? " done" : ""}" data-ct="pick:${i}" aria-label="${r ? "a ripe bunch" : "a green bunch"}" data-ripe="${r ? 1 : 0}" ${st.picked.includes(i) ? "disabled" : ""}><svg viewBox="0 0 30 34" width="40" height="44" aria-hidden="true">${st.picked.includes(i) ? `<path d="M15 4 v6" stroke="#6B5444" stroke-width="2"/>` : `<path d="M15 2 v6" stroke="#6B5444" stroke-width="2"/>${[[15, 12], [10, 16], [20, 16], [12, 21], [18, 21], [15, 26]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.4" fill="${r ? "#C9A24A" : "#9DBF72"}" stroke="#3b3530" stroke-width=".8"/>`).join("")}`}</svg></button>`).join("")}</div>`;
  return h + `<p class="muted">The box is full. Back down at the cantina, Signor Bruno lays the bunches on his cane racks in the warm loft. "Three days, they go to raisins. Then the cask. That's Sciacchetrà." Your own barrel shed has a loft too, he says. Why not?</p><div class="actions"><button class="btn primary" data-ct="harvestdone">Thank him</button></div>`;
}
// the cantina: a tasting, the shop, and the harvest from here too
export const TASTE = {price: 6};
export function cantinaPanel(F){
  return `<span class="tape gingham" aria-hidden="true"></span><h2>The cantina</h2><p class="sub">Signor Bruno's family have made wine on these terraces for two hundred years. The racks of grapes drying in the loft above smell of honey.</p>
    <h3 class="ph3">A tasting · ${TASTE.price} ${coin()}</h3><p class="muted">A glass of the white from the terraces, and a tiny one of Sciacchetrà, amber and sweet.</p><div class="actions"><button class="btn primary" data-ct="taste" ${F.coins >= TASTE.price ? "" : "disabled"}>A tasting, please</button><button class="btn alt" data-ct="monorail">Help with the harvest</button></div>`
    + list(F, "ct_cantina", "To take home") + shut;
}

/* ---------- painting a boat with the fishermen (Manarola) ---------- */
export const BOAT = {hulls: {blue: ["Sea blue", "#3E6BAE"], red: ["Harbour red", "#C9483A"], green: ["Fisherman's green", "#2E7A5A"], yellow: ["Lemon yellow", "#F3D34A"]},
  stripes: {white: ["White", "#FFFDF6"], yellow: ["Yellow", "#F3D98A"], red: ["Red", "#C9483A"], blue: ["Pale blue", "#9FC3D9"]}, names: ["Maple", "Evan", "Nonna", "Honeybrook"]};
export function paintBoat(F, hull, stripe, name, addInv){ if (!BOAT.hulls[hull] || !BOAT.stripes[stripe] || !BOAT.names.includes(name)) return null; const c = cinqueState(F); c.boat = {hull, stripe, name}; c.boats = (c.boats || 0) + 1; if (!F.inv.c_boat) addInv("c_boat", 1); return c.boat; }
export const boatCols = F => { const b = (F.cinque || {}).boat; return b ? [BOAT.hulls[b.hull][1], BOAT.stripes[b.stripe][1], b.name] : ["#3E6BAE", "#F3D98A", ""]; };
export function boatPanel(F, st = {}, evan){
  const b = cinqueState(F).boat;
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>The boats</h2><p class="sub">Aldo and Piero repaint their boats every spring, pulled up in the main street on their trailers. "Every boat a different colour," says Aldo, "so the wives can see from the window who's coming home." They hand you a brush.</p>`;
  const sw = (k, col, on, act) => `<button class="gchip${on ? " on" : ""}" data-ct="${act}:${k}" aria-pressed="${on}"><span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${col};border:1px solid #3b3530;vertical-align:-2px"></span> <span>${esc((act === "hull" ? BOAT.hulls : BOAT.stripes)[k][0])}</span></button>`;
  h += `<h3 class="ph3">Paint a boat</h3>${b ? `<p class="muted">Last time: ${esc(BOAT.hulls[b.hull][0].toLowerCase())} with a ${esc(BOAT.stripes[b.stripe][0].toLowerCase())} stripe, called "${esc(b.name)}". It's by your jetty at home.</p>` : ""}
    <p class="eyebrow">The hull</p><div class="gchips">${Object.entries(BOAT.hulls).map(([k, [, c]]) => sw(k, c, st.hull === k, "hull")).join("")}</div>
    <p class="eyebrow">The stripe</p><div class="gchips">${Object.entries(BOAT.stripes).map(([k, [, c]]) => sw(k, c, st.stripe === k, "stripe")).join("")}</div>
    <p class="eyebrow">The name${evan ? " (Evan paints the letters, mostly the right way round)" : ""}</p><div class="gchips">${BOAT.names.map(n => `<button class="gchip${st.name === n ? " on" : ""}" data-ct="bname:${n}" aria-pressed="${st.name === n}"><span>${esc(n)}</span></button>`).join("")}</div>
    <div class="actions"><button class="btn primary" data-ct="paint" ${st.hull && st.stripe && st.name ? "" : "disabled"}>Paint it</button></div>`;
  return h + shut;
}

/* ---------- the gelateria and the focacceria ---------- */
export const GELATO = {basilico: ["Basil gelato", 3, "Green and sweet and a little peppery. It shouldn't work. It really works."], limone: ["Lemon gelato", 3, "Monterosso lemons, sharp as anything, in a crunchy cone."], fico: ["Fig gelato", 3, "Purple, jammy, with little seeds. Like eating September."]};
export const FOCACCIA = {plain: ["A slice of focaccia", 2, "Dimpled, oily, salty, crisp on the bottom. Eaten standing up, like everyone else."], farinata: ["Farinata", 3, "A thin chickpea pancake from the wood oven, black pepper on top, too hot to hold."], onion: ["Onion focaccia", 3, "Sweet soft onions baked right into the top."]};
export function gelatoPanel(F, evan){ return `<span class="tape gingham" aria-hidden="true"></span><h2>The gelateria</h2><p class="sub">Gianni makes everything fresh each morning. "Basil and lemon together," he says, "that's a secret. Tell the ice cream shop at home." Wink.</p>${treats(F, GELATO, "gelato")}${evan ? `<p class="muted">Evan's gets a little wafer fan stuck in the top.</p>` : ""}` + shut; }
export function focacceriaPanel(F, evan){ return `<span class="tape gingham" aria-hidden="true"></span><h2>The focacceria</h2><p class="sub">Beppe slides another tray out of the oven with a long wooden paddle. The whole of Vernazza seems to be in the queue.</p>${treats(F, FOCACCIA, "focaccia")}${evan ? `<p class="muted">Beppe always slips the little one a warm heel of focaccia.</p>` : ""}` + list(F, "ct_focacceria", "To take home") + shut; }
export function limoniPanel(F){ return `<span class="tape gingham" aria-hidden="true"></span><h2>The lemon shop</h2><p class="sub">Signora Franca grows the lemons on the terraces behind the shop and turns them into everything. She cuts you a slice to smell.</p>` + list(F, "ct_limoni") + shut; }

// the room spots and the panel for each
export function cinquePanel(F, view, st = {}){
  return view === "ct_pesto" ? pestoPanel(F, st.pesto, st.evan) : view === "ct_cantina" ? cantinaPanel(F) : view === "monorail" ? harvestPanel(F, st.harvest, st.evan)
    : view === "boats" ? boatPanel(F, st.boat, st.evan) : view === "ct_gelato" ? gelatoPanel(F, st.evan) : view === "ct_focacceria" ? focacceriaPanel(F, st.evan) : view === "ct_limoni" ? limoniPanel(F) : "";
}
