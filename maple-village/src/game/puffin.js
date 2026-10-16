// Puffin Isle's rooms and things to join in with (round 216). The shops sell TOWN_GOODS (bought through ronda.js
// buyGood, the data-rbuy buttons). Things to take part in, each more than a speech bubble:
//   the puffin count in the bird hide with Rhodri (five looks through the window: how many puffins? In the season,
//     April to July; out of it, the seals, or the seal pups in October and November), reading the weather with
//     Morwenna in the lamp room (the barometer, the wind and the sky: fair, showers or a storm? three right in a row and
//     she gives you her storm glass), beachcombing for sea glass in the cove (once a day), making a sea glass pendant at
//     the post office's workbench, and collecting the island's puffin stamps (one for each puffin month, and the seal
//     pup in the autumn: all five framed).
// State: F.puffin = {counts, countDay, badge, weather, glass, stamps: {k: day}, framed, combDay, pendants, treats, book}
import { esc, dayKey, hash } from "../util.js";
import { icon } from "../art/icons.js";
import { TOWN_GOODS } from "../data/towns.js";
import { STAMPS, puffinsIn, pupsIn } from "../data/puffin.js";

export function piState(F){ F.puffin = F.puffin || {}; const s = F.puffin; s.stamps = s.stamps || {}; return s; }
const shut = `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
const coin = () => icon("coin", 13);
const goods = shop => Object.keys(TOWN_GOODS).filter(id => TOWN_GOODS[id].shop === shop);
const row = (F, id) => { const g = TOWN_GOODS[id], have = (F.inv || {})[id] || 0;
  return `<li><span class="wpic">${icon(id, 28)}</span><span class="wtxt"><b>${esc(g.n)}</b><small>${esc(g.what || g.say || g.line || "")}${have ? ` (${have} in your backpack)` : ""}${g.kind === "keepsake" ? " · a keepsake for a shelf" : g.keep ? " · give it, or keep it" : ""}</small></span><button class="btn small primary" data-rbuy="${id}" ${F.coins >= g.price ? "" : "disabled"}>${g.price} ${coin()}</button></li>`; };
const list = (F, shop, title) => { const ids = goods(shop); return ids.length ? `${title ? `<h3 class="ph3">${esc(title)}</h3>` : ""}<ul class="hlist wlist">${ids.map(id => row(F, id)).join("")}</ul>` : ""; };
const head = (title, sub) => `<span class="tape gingham" aria-hidden="true"></span><h2>${esc(title)}</h2><p class="sub">${sub}</p>`;

/* ---------- the count, in the bird hide ---------- */
// Five looks through the window. Each shows a few birds (or seals); pick how many of today's thing there are.
// Four right and Rhodri writes your name in the survey; five right, the first time, and he gives you a volunteer's badge.
export const COUNT = {LOOKS: 5, OK: 4};
export const countWhat = day => puffinsIn(day) ? "puffin" : pupsIn(day) ? "pup" : "seal";
export function countStart(rng = Math.random){ return {looks: Array.from({length: COUNT.LOOKS}, () => { const n = 2 + Math.floor(rng()*7), others = Math.floor(rng()*4); return {n, others}; }), i: 0, good: 0, done: false}; }
export const choicesFor = (look, i) => { const c = new Set([look.n]); let d = 1; while (c.size < 4) { c.add(Math.max(1, look.n + (((i + d) % 2) ? d : -d))); d++; } return [...c].sort((a, b) => a - b); };
export function countPick(st, n){ if (st.done) return null; const ok = st.looks[st.i].n === n; if (ok) st.good++; st.i++; if (st.i >= COUNT.LOOKS) st.done = true; return ok ? "ok" : "off"; }
export function countDone(F, st, addInv, day = dayKey()){ const s = piState(F); s.counts = (s.counts || 0) + 1; s.countDay = day; if (st.good === COUNT.LOOKS && !s.badge) { s.badge = day; addInv("p_badge", 1); return "badge"; } return st.good >= COUNT.OK ? "ok" : "try"; }
const NOUN = {puffin: ["puffin", "puffins"], pup: ["seal pup", "seal pups"], seal: ["seal", "seals"]};
const lookPic = (look, what) => { const all = Array.from({length: look.n}, () => what); for (let i = 0; i < look.others; i++) all.splice(Math.min(all.length, 1 + i*3), 0, "gull");
  return `<div class="pilook" aria-hidden="true">${all.map(k => `<span class="pib pib-${k}"></span>`).join("")}</div>`; };
export function hidePanel(F, st, day = dayKey()){
  const what = countWhat(day), [one, many] = NOUN[what], s = piState(F);
  let h = head("The bird hide", what === "puffin" ? "Rhodri the warden slides the window open. Below, the clifftop is busy with puffins: popping out of burrows, standing about, whirring in from the sea with beaks full of fish. \"Count with me. Every year we count them, so we know they're all right.\""
    : "Rhodri slides the window open. \"The puffins are out at sea till April. They don't come ashore at all in the winter, can you believe it. But we count everything here.\" Down on the rocks, the seals are hauled out in the cold sun.");
  if (!st) return h + `<p class="muted">Five looks through the window: how many ${many} can you see? (Not the gulls. Rhodri's very firm about the gulls.)${s.counts ? ` You've helped with the count ${s.counts} time${s.counts === 1 ? "" : "s"}.` : ""}</p><div class="actions"><button class="btn primary" data-pi="count">Pick up the binoculars</button></div>` + list(F, "pi_hide") + shut;
  if (st.done) return h + `<p class="sub">${st.good} of ${COUNT.LOOKS} right. ${st.good === COUNT.LOOKS ? `Rhodri writes it all down. "Spot on. You've got the eye."` : st.good >= COUNT.OK ? "\"Good counting,\" says Rhodri, and writes your name in the survey book." : "\"They do move about,\" says Rhodri kindly. \"Try again: they'll still be there.\""}</p><div class="actions"><button class="btn alt" data-pi="count">Count again</button></div>` + shut;
  const look = st.looks[st.i];
  return h + `<h3 class="ph3">Look ${st.i + 1} of ${COUNT.LOOKS}: how many ${many}?</h3>${lookPic(look, what)}<div class="gchips">${choicesFor(look, st.i).map(n => `<button class="gchip" data-pi="pick:${n}"><span>${n} ${n === 1 ? one : many}</span></button>`).join("")}</div>` + shut;
}

/* ---------- reading the weather, in the lamp room ---------- */
// The barometer, the wind and the sky. A storm if the glass is falling fast or there's a gale; showers if it's falling
// or the cloud's heavy and dark; otherwise fair. Three right in a row and Morwenna gives you her storm glass (once).
export const BARO = ["rising", "steady", "falling", "falling fast"], WIND = ["light", "fresh", "a gale"], SKY = ["clear", "high thin cloud", "heavy dark cloud"];
export const forecastOf = ({b, w, k}) => b === 3 || w === 2 ? "storm" : b === 2 || k === 2 ? "showers" : "fair";
export function weatherStart(rng = Math.random){ const r = () => Math.floor(rng()*4); return {rounds: [0, 1, 2].map(() => ({b: r() % 4, w: r() % 3, k: r() % 3})), i: 0, good: 0, run: 0, done: false}; }
export function weatherPick(st, f){ if (st.done) return null; const ok = forecastOf(st.rounds[st.i]) === f; if (ok) { st.good++; st.run++; } else st.run = 0; st.last = ok ? "ok" : forecastOf(st.rounds[st.i]); st.i++; if (st.i >= st.rounds.length) st.done = true; return ok ? "ok" : "off"; }
export function weatherDone(F, st, addInv, day = dayKey()){ const s = piState(F); s.weather = (s.weather || 0) + 1; if (st.run >= 3 && !s.glassGiven) { s.glassGiven = day; addInv("p_stormglass", 1); return true; } return false; }
const FC = {fair: "Fair", showers: "Showers", storm: "A storm coming"};
export function lampPanel(F, st){
  let h = head("The lamp room", "Morwenna keeps the weather log as well as the light: three times a day, in pencil, the way it's been done since 1820. \"Read the glass, feel the wind, look at the sky,\" she says. \"Then decide. The fishermen listen to me.\"");
  if (!st) return h + `<p class="muted">Three readings: is it going to be fair, showers, or a storm? Get all three right and she'll trust you with the log.</p><div class="actions"><button class="btn primary" data-pi="wx">Read the weather</button></div>` + list(F, "pi_lamp") + shut;
  if (st.done) return h + `<p class="sub">${st.good} of 3 right. ${st.run >= 3 ? "Morwenna nods slowly and writes your forecast into the log, word for word." : "\"The sea's a slippery customer,\" says Morwenna. \"Even the glass gets it wrong sometimes. Not often.\""}</p><div class="actions"><button class="btn alt" data-pi="wx">Read it again</button></div>` + shut;
  const r = st.rounds[st.i];
  return h + (st.last ? `<p class="muted">${st.last === "ok" ? "Right!" : `Morwenna shakes her head: "${FC[st.last]}, that one."`}</p>` : "")
    + `<h3 class="ph3">Reading ${st.i + 1} of 3</h3><ul class="bujo"><li>The barometer: <b>${BARO[r.b]}</b></li><li>The wind: <b>${WIND[r.w]}</b></li><li>The sky: <b>${SKY[r.k]}</b></li></ul>`
    + `<div class="gchips">${Object.entries(FC).map(([k, n]) => `<button class="gchip" data-pi="fc:${k}"><span>${esc(n)}</span></button>`).join("")}</div>` + shut;
}

/* ---------- sea glass: the cove, and the post office's workbench ---------- */
export const GLASS = {per: 3, wire: 3};
// beachcombing (once a day): one to three bits of sea glass
export function comb(F, addInv, day = dayKey()){ const s = piState(F); if (s.combDay === day) return 0; s.combDay = day; const n = 1 + hash(day + "glass") % 3; addInv("seaglass", n); return n; }
export function makePendant(F, addInv){ const have = (F.inv || {}).seaglass || 0; if (have < GLASS.per || F.coins < GLASS.wire) return false; F.coins -= GLASS.wire; F.inv.seaglass -= GLASS.per; if (!F.inv.seaglass) delete F.inv.seaglass; addInv("p_pendant", 1); const s = piState(F); s.pendants = (s.pendants || 0) + 1; return true; }

/* ---------- the stamps, at the post office ---------- */
// this month's stamp (2 coins): a puffin one from April to July, the seal pup in October and November
export const STAMP_PRICE = 2;
export const stampNow = day => { const m = +day.slice(5, 7); return STAMPS[m] ? String(m) : pupsIn(day) ? "pup" : null; };
export function buyStamp(F, addInv, day = dayKey()){ const k = stampNow(day), s = piState(F); if (!k || s.stamps[k] || F.coins < STAMP_PRICE) return null; F.coins -= STAMP_PRICE; s.stamps[k] = day; addInv("ps_" + k, 1);
  const all = Object.keys(STAMPS).every(x => s.stamps[x]), framed = all && !s.framed; if (framed) { s.framed = day; addInv("p_stamps", 1); } return {k, framed}; }
export function postPanel(F, day = dayKey()){
  const s = piState(F), k = stampNow(day), have = Object.keys(STAMPS).filter(x => s.stamps[x]).length, glass = (F.inv || {}).seaglass || 0;
  let h = head("The island post office", "Ffion runs the post office, the shop and, on Tuesdays, the island's library (one shelf). Puffin stamps in a frame on the wall, postcards on a spinner, and at the back, a workbench heaped with sea glass.");
  h += `<h3 class="ph3">This month's stamp</h3><p class="muted">${k ? (s.stamps[k] ? `You've got this month's: ${esc(STAMPS[k][0])}.` : `${esc(STAMPS[k][0])}: ${esc(STAMPS[k][1])}.`) : "No new stamp this month. The puffin stamps come out from April to July, and the seal pup one in October and November."} Your stamps: ${have} of ${Object.keys(STAMPS).length}.</p>`;
  if (k && !s.stamps[k]) h += `<div class="actions"><button class="btn primary" data-pi="stamp" ${F.coins >= STAMP_PRICE ? "" : "disabled"}>Buy the stamp · ${STAMP_PRICE} ${coin()}</button></div>`;
  h += list(F, "pi_post", "From the shelves");
  h += `<h3 class="ph3">The sea glass workbench</h3><p class="muted">Three bits of sea glass and a twist of silver wire (${GLASS.wire} ${coin()}) make a pendant: wear it, keep it, or give it away. You've ${glass} bit${glass === 1 ? "" : "s"} of sea glass${glass ? "" : " (the cove's full of it)"}.</p><div class="actions"><button class="btn alt" data-pi="pendant" ${glass >= GLASS.per && F.coins >= GLASS.wire ? "" : "disabled"}>Make a pendant</button></div>`;
  return h + shut;
}

/* ---------- the tearoom, and the keeper's cottage ---------- */
export const CAFE = {cream: ["A cream tea", 5, "Two scones, a pot of tea, clotted cream and sea buckthorn jam that glows like a lamp."],
  toastie: ["A goat's cheese toastie", 6, "Island goat's cheese melted on thick bread, with a little dish of chutney. The goats would be proud."],
  welsh: ["Welsh cakes", 3, "Warm off the griddle, dusted with sugar, studded with currants. Bryony's nan's recipe."],
  choc: ["A hot chocolate", 4, "In a big mug, with a marshmallow going soft on top. For when the wind's got into your bones."]};
export function cafeTreat(F, k){ const c = CAFE[k]; if (!c || F.coins < c[1]) return null; F.coins -= c[1]; const s = piState(F); s.treats = (s.treats || 0) + 1; return c; }
export function tearoomPanel(F){
  return head("The tearoom", "Bryony bakes at five, opens at ten and shuts when the last boat goes. The stove ticks, the china doesn't match, and there's always a cake you haven't tried.")
    + `<h3 class="ph3">Sit down with something</h3><ul class="hlist wlist">${Object.entries(CAFE).map(([k, [n, p, l]]) => `<li><span class="wtxt"><b>${esc(n)}</b><small>${esc(l)}</small></span><button class="btn small primary" data-pi="cafe:${k}" ${F.coins >= p ? "" : "disabled"}>${p} ${coin()}</button></li>`).join("")}</ul>`
    + list(F, "pi_tearoom", "To take home") + shut;
}
export const keeperPanel = F => head("The keeper's cottage", "Morwenna's kitchen: the range, the kettle, charts on every wall, and linocut prints drying on a line over the table. \"Winter evenings,\" she says. \"The lamp doesn't need me every minute.\"") + list(F, "pi_keeper", "Morwenna's prints") + shut;

// the panel for each of Puffin Isle's room spots
export function piPanel(F, view, st = {}, day = dayKey()){
  return view === "pi_hide" ? hidePanel(F, st.count, day) : view === "pi_lamp" ? lampPanel(F, st.wx) : view === "pi_post" ? postPanel(F, day)
    : view === "pi_tearoom" ? tearoomPanel(F) : view === "pi_keeper" ? keeperPanel(F) : "";
}
