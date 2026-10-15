// Puffin Isle's rooms and things to join in with (rounds 215 to 217). The shops sell TOWN_GOODS (ronda.js buyGood,
// the shared data-rbuy buttons). What there is to do changes with the seasons (data/puffin.js puffinSeason): puffins
// April to early August, seal pups September to December, winter seas January to March.
//   The bird count with Finn at the warden's hut window: the birds go past one at a time, click the counter only for
//   the season's bird (puffins; or, in autumn, the seal pups on the beach; in winter, gannets far out); your tally
//   goes in the island logbook. Polishing the great lens with Morwenna in the lamp room (the four panels, then three
//   turns of the clockwork: the beam goes round). A suncatcher at Ivy's bench (five pieces of glass, wired onto
//   driftwood: a keepsake). Evan joins in each.
//   Sea glass on the cove (round 217): up to three finds a day, rarer colours less often, red rarest of all. One of
//   every colour, and it's a jar of sea glass for the windowsill at home.
// State: F.puffin = {glass: {white: n, ...}, jar, counts: [..], lens, suncatcher, treats}
import { esc, dayKey } from "../util.js";
import { icon } from "../art/icons.js";
import { TOWN_GOODS } from "../data/towns.js";
import { puffinSeason } from "../data/puffin.js";

export function piState(F){ F.puffin = F.puffin || {}; F.puffin.glass = F.puffin.glass || {}; F.puffin.counts = F.puffin.counts || []; return F.puffin; }
const shut = `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
const coin = () => icon("coin", 13);
const goods = shop => Object.keys(TOWN_GOODS).filter(id => TOWN_GOODS[id].shop === shop);
const row = (F, id) => { const g = TOWN_GOODS[id], have = (F.inv || {})[id] || 0;
  return `<li><span class="wpic">${icon(id, 28)}</span><span class="wtxt"><b>${esc(g.n)}</b><small>${esc(g.what || g.say || g.line || "")}${have ? ` (${have} in your backpack)` : ""}${g.kind === "keepsake" ? " · a keepsake for a shelf" : ""}</small></span><button class="btn small primary" data-rbuy="${id}" ${F.coins >= g.price ? "" : "disabled"}>${g.price} ${coin()}</button></li>`; };
const list = (F, shop, title) => { const ids = goods(shop); return ids.length ? `${title ? `<h3 class="ph3">${esc(title)}</h3>` : ""}<ul class="hlist wlist">${ids.map(id => row(F, id)).join("")}</ul>` : ""; };
const treats = (F, menu, act) => `<ul class="hlist wlist">${Object.entries(menu).map(([k, [n, p, l]]) => `<li><span class="wtxt"><b>${esc(n)}</b><small>${esc(l)}</small></span><button class="btn small primary" data-pi="${act}:${k}" ${F.coins >= p ? "" : "disabled"}>${p} ${coin()}</button></li>`).join("")}</ul>`;
export function treat(F, menu, k){ const t = menu[k]; if (!t || F.coins < t[1]) return null; F.coins -= t[1]; const c = piState(F); c.treats = (c.treats || 0) + 1; return t; }

/* ---------- sea glass on the cove ---------- */
export const GLASS = {white: ["Frosted white", 30, "#F3F1EC"], green: ["Bottle green", 25, "#7FB86A"], brown: ["Amber brown", 20, "#B9824A"], blue: ["Cornflower blue", 10, "#6E8FD0"],
  aqua: ["Seafoam aqua", 8, "#9FD3C8"], purple: ["Lavender purple", 5, "#B9A0D6"], red: ["Ruby red", 2, "#C8324A"]};
export const GLASS_PER_DAY = 3;
export function findGlass(F, addInv, rng = Math.random){
  const c = piState(F); if (c.glassDay !== dayKey()) { c.glassDay = dayKey(); c.glassToday = 0; }
  if (c.glassToday >= GLASS_PER_DAY) return {none: true};
  c.glassToday++; const total = Object.values(GLASS).reduce((a, g) => a + g[1], 0); let r = rng()*total, k = "white";
  for (const [id, g] of Object.entries(GLASS)) { if (r < g[1]) { k = id; break; } r -= g[1]; }
  const first = !c.glass[k]; c.glass[k] = (c.glass[k] || 0) + 1;
  const all = Object.keys(GLASS).every(x => c.glass[x]); let jar = false; if (all && !c.jar) { c.jar = dayKey(); jar = true; addInv("pi_glassjar", 1); }
  return {k, name: GLASS[k][0], first, jar, left: GLASS_PER_DAY - c.glassToday};
}
export const glassHave = F => Object.keys(GLASS).filter(k => piState(F).glass[k]);

/* ---------- the bird count with Finn ---------- */
// Eight things go past the window, one at a time; click for the season's bird, let the others go.
export const COUNT = {N: 8, target: {puffins: "puffin", late: "puffin", seals: "seal pup", winter: "gannet"},
  others: {puffins: ["gull", "razorbill", "fulmar"], late: ["gull", "fulmar", "shag"], seals: ["gull", "cormorant", "a seal mum"], winter: ["gull", "fulmar", "eider duck"]}};
export function countStart(season, rng = Math.random){ const t = COUNT.target[season], o = COUNT.others[season]; const seq = Array.from({length: COUNT.N}, () => rng() < .55 ? t : o[Math.floor(rng()*o.length)]); if (!seq.includes(t)) seq[0] = t; return {season, seq, i: 0, tally: 0, oops: 0}; }
export function countPress(st, click){ if (st.i >= st.seq.length) return null; const t = COUNT.target[st.season], is = st.seq[st.i] === t; if (click && is) st.tally++; else if (click && !is) st.oops++; st.i++; return click ? is : !is; }
export const countDone = st => st.i >= st.seq.length;
export function finishCount(F, st){ const c = piState(F); const real = st.seq.filter(x => x === COUNT.target[st.season]).length; c.counts.push({day: dayKey(), season: st.season, n: st.tally}); return {n: st.tally, real}; }
export function countPanel(F, st, evan){
  const season = puffinSeason(dayKey()), t = COUNT.target[season];
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>The bird count</h2><p class="sub">Finn's window looks straight out at the cliffs. On the sill: binoculars, a pencil, the island logbook, and a little silver clicker counter.</p>`;
  if (!st) return h + `<h3 class="ph3">Help Finn count</h3><p class="muted">Today's count: ${t === "puffin" ? "puffins" : t === "seal pup" ? "seal pups on the beach" : "gannets out at sea"}. Click the counter for every one that goes past, and let everything else go.${evan ? " Evan holds the clicker. He's very serious about it." : ""}</p><div class="actions"><button class="btn primary" data-pi="count">Pick up the clicker</button></div>` + (F.puffin && F.puffin.counts && F.puffin.counts.length ? `<p class="muted">In the logbook in your handwriting: ${F.puffin.counts.slice(-3).map(x => `${x.n} ${COUNT.target[x.season]}${x.n === 1 ? "" : "s"}`).join(", ")}.</p>` : "") + shut;
  if (!countDone(st)) { const b = st.seq[st.i];
    return h + `<p style="font-family:'Klee One',serif;font-size:1.15rem;text-align:center;margin:12px 0">${b === t ? `A ${esc(b)}!` : `A ${esc(b)}...`}</p><p class="muted">Tally: ${st.tally}.${st.oops ? ` Finn, gently: "That one wasn't a ${esc(t)}."` : ""}</p>
      <div class="actions"><button class="btn primary big" data-pi="click">Click!</button><button class="btn alt big" data-pi="let">Let it go</button></div>`; }
  return h + `<p class="muted">${st.tally} ${esc(t)}${st.tally === 1 ? "" : "s"}. Finn writes it in the logbook, and underneath, in brackets: "(counted by Mel${evan ? " and Evan" : ""})".</p><div class="actions"><button class="btn primary" data-pi="countdone">Sign the logbook</button></div>` + shut;
}
export function wardenPanel(F){ return `<span class="tape gingham" aria-hidden="true"></span><h2>The warden's hut</h2><p class="sub">Maps and bird charts on every wall, feathers and a gannet skull in a cabinet, and an honesty box by the door.</p>` + list(F, "pi_warden", "The honesty shelf") + `<div class="actions"><button class="btn alt" data-pi="countopen">The bird count</button></div>` + shut; }

/* ---------- polishing the great lens with Morwenna ---------- */
export const LENS = {PANELS: ["the top panel", "the left panel", "the right panel", "the bottom panel"], WIND: 3};
export const lensStart = () => ({done: [], wind: 0});
export function lensStep(st, what, v){ if (what === "panel") { const i = +v; if (st.done.includes(i) || !LENS.PANELS[i]) return false; st.done.push(i); return true; }
  if (what === "wind") { if (st.done.length < LENS.PANELS.length || st.wind >= LENS.WIND) return false; st.wind++; return true; } return false; }
export const lensDone = st => st.done.length >= LENS.PANELS.length && st.wind >= LENS.WIND;
export function finishLens(F){ const c = piState(F); c.lens = (c.lens || 0) + 1; return c.lens; }
export function lensPanel(F, st, evan){
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>The lamp room</h2><p class="sub">The great lens stands taller than you: rings of glass like a giant beehive, catching the sky. Morwenna hands you a soft cloth. "Gently. She's a hundred and forty years old."</p>`;
  if (!st) return h + `<h3 class="ph3">Polish the lens and wind the clock</h3><p class="muted">Every panel, round and round, then three turns of the clockwork that turns the light.${evan ? " Evan gets the little cloth for the brass." : ""}</p><div class="actions"><button class="btn primary" data-pi="lens">Take the cloth</button></div>` + shut;
  if (st.done.length < LENS.PANELS.length) return h + `<p class="muted">Round and round, until the glass squeaks. ${st.done.length}/${LENS.PANELS.length} panels.</p><div class="gchips">${LENS.PANELS.map((p, i) => `<button class="gchip${st.done.includes(i) ? " on" : ""}" data-pi="panel:${i}" ${st.done.includes(i) ? "disabled" : ""}><span>Polish ${esc(p)}</span></button>`).join("")}</div>`;
  if (st.wind < LENS.WIND) return h + `<p class="muted">Now the clockwork: a big brass handle, heavy and smooth. ${st.wind}/${LENS.WIND} turns.</p><div class="actions"><button class="btn primary big" data-pi="wind">Wind</button></div>`;
  return h + `<p class="muted">With a soft click the lens begins to turn, slow as a planet. Rainbows slide round the walls, over Morwenna, over you. "There," she says. "Now she'll shine tonight."</p><div class="actions"><button class="btn primary" data-pi="lensdone">Watch it turn</button></div>` + shut;
}

/* ---------- a suncatcher at Ivy's bench ---------- */
export const SUN = {price: 6, N: 5};
export const sunStart = () => ({picks: []});
export function sunPick(st, k){ if (!GLASS[k] || st.picks.length >= SUN.N) return false; st.picks.push(k); return true; }
export function finishSun(F, st, addInv){ if (st.picks.length < SUN.N || F.coins < SUN.price) return null; F.coins -= SUN.price; const c = piState(F); const first = !c.suncatcher; c.suncatcher = (c.suncatcher || 0) + 1; addInv("pi_suncatcher", 1); return {first}; }
export function studioPanel(F, st, evan){
  const have = glassHave(F);
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>Ivy's boathouse</h2><p class="sub">Jars of sea glass sorted by colour glow in the window. Ivy looks up from her bench. "Make a suncatcher? Five pieces. Any you've found yourself go in first."</p>`;
  h += `<h3 class="ph3">Make a suncatcher · ${SUN.price} ${coin()}</h3>`;
  if (!st) h += `<p class="muted">${have.length ? `Your own finds: ${have.map(k => GLASS[k][0].toLowerCase()).join(", ")}.` : "You haven't found any yet: Ivy lends you some from her jars."} Wired onto a bit of driftwood, to hang in a window.${evan ? " Evan chooses the shiniest piece. Obviously." : ""}</p><div class="actions"><button class="btn primary" data-pi="sun" ${F.coins >= SUN.price ? "" : "disabled"}>Sit at the bench</button></div>`;
  else if (st.picks.length < SUN.N) h += `<p class="muted">Pick five pieces: ${st.picks.length}/${SUN.N}${st.picks.length ? ` (${st.picks.map(k => GLASS[k][0].toLowerCase()).join(", ")})` : ""}.</p><div class="gchips">${Object.entries(GLASS).map(([k, [n, , col]]) => `<button class="gchip" data-pi="glass:${k}"><span style="display:inline-block;width:12px;height:12px;border-radius:4px;background:${col};border:1px solid #3b3530;vertical-align:-2px"></span> <span>${esc(n)}${have.includes(k) ? " (yours)" : ""}</span></button>`).join("")}</div>`;
  else h += `<p class="muted">Ivy twists the wire, ties on a loop, and holds it to the window. Coloured light everywhere.</p><div class="actions"><button class="btn primary" data-pi="sundone" ${F.coins >= SUN.price ? "" : "disabled"}>Take it home · ${SUN.price} ${coin()}</button></div>`;
  return h + list(F, "pi_studio", "Ivy's shelf") + shut;
}

/* ---------- the tearoom and the keeper's kitchen ---------- */
export const TEAROOM = {soup: ["Leek and potato soup", 4, "Thick and hot, with a hunk of bread. Bryn sings to the soup pot while he ladles."], brith: ["A slice of bara brith", 3, "Fruity tea bread with a thick layer of salty butter."],
  cream: ["A cream tea", 4, "Two scones, thyme-honey butter, bramble jam and a pot of tea."], cocoa: ["A mug of hot chocolate", 2, "With a marshmallow puffin floating on top. Bryn's own invention."]};
export const KITCHEN = {tea: ["Tea and Welsh cakes with Morwenna", 2, "At the scrubbed table, with the cat watching the Welsh cakes and Morwenna telling you about the storm of '89."]};
export function tearoomPanel(F, evan){ return `<span class="tape gingham" aria-hidden="true"></span><h2>The farm tearoom</h2><p class="sub">Long tables, walking boots by the door, a huge stove, and Bryn singing in Welsh over the soup.</p>${treats(F, TEAROOM, "tea")}${evan ? `<p class="muted">Evan's hot chocolate gets two marshmallow puffins.</p>` : ""}` + list(F, "pi_tearoom", "Made on the island") + shut; }
export function kitchenPanel(F, evan){ return `<span class="tape gingham" aria-hidden="true"></span><h2>The keeper's kitchen</h2><p class="sub">A warm range, blue and white china, Welsh cakes cooling on the rack, and a postcard rack by the door with the island's own puffin stamps.</p>${treats(F, KITCHEN, "kitchen")}${evan ? `<p class="muted">The cat lets Evan stroke it. This, Morwenna says, has never happened before.</p>` : ""}` + list(F, "pi_kitchen", "From the keeper") + shut; }

export function puffinPanel(F, view, st = {}){
  return view === "pi_warden" ? wardenPanel(F) : view === "picount" ? countPanel(F, st.count, st.evan) : view === "pipolish" ? lensPanel(F, st.lens, st.evan)
    : view === "pi_studio" || view === "pisuncatcher" ? studioPanel(F, st.sun, st.evan) : view === "pi_tearoom" ? tearoomPanel(F, st.evan) : view === "pi_kitchen" ? kitchenPanel(F, st.evan) : "";
}
