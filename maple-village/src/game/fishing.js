// Fishing: three spots (the home river by the bridge, the lake on the field, the sea by the pier), each with its own
// fish, some only at certain times or in the rain, and a rare golden koi on the home river at dusk.
// Worms are the bait, and they come from real life: three in the tin every morning, plus one for each quest done
// (up to 20 in the tin). Each cast uses one. So fishing is a reward for getting things done, not a replacement for it.
// A cast: the float sits, then bobs (a bite, 2 to 6 seconds later); tap Reel while the marker's in the green to land
// it. Harder fish have a narrower green; the better reel (an upgrade) widens it. Miss, or wait too long, and it's gone.
// Catches go in the backpack (most are kitchen ingredients for the new seafood tapas; river and lake fish are "fish",
// the grilled fish small plate, or a treat for Maple), and in the journal: how many, and the biggest.
// A golden koi isn't kept: it goes in the home pond, where it stays (up to three).
// State in F.fish = {rod, reel, bait, baitDay, caught: {id: {n, best}}, koi, log: [{id, cm, day}]}.
import { esc, dayKey, sgHM } from "../util.js";
import { icon } from "../art/icons.js";
import { ITEMS } from "../data/items.js";
import { rainyOn } from "../art/village-extras.js";

export const SPOTS = {
  river: {scene: "base", n: "The home river", place: "fishriver", line: "The river runs quick and clear past the bridge."},
  lake: {scene: "field", n: "The lake", place: "fishlake", line: "Still water, reeds, and the swans keeping an eye on you."},
  sea: {scene: "shore", n: "The sea by the pier", place: "fishsea", line: "Waves on the sand, and gulls hoping you're bad at this."},
  pool: {scene: "hwoods", n: "The waterfall pool", place: "fishpool", line: "Cold, clear water under the falls. The trout here are wily."}
};
export const spotIn = scene => Object.keys(SPOTS).find(k => SPOTS[k].scene === scene) || null;
// when: "day" 7am-6pm, "dawn" 5-10am, "dusk" 6-8pm, "night" 7pm-6am; rain: only on a rainy day
// item: what goes in the backpack (null: journal only). hard 1-5 narrows the green zone.
export const FISH = {
  roach: {n: "Roach", spot: "river", w: 34, cm: [10, 24], hard: 1, item: "fish", hint: "The river, any time at all."},
  trout: {n: "Rainbow trout", spot: "river", w: 22, when: "day", cm: [24, 52], hard: 2, item: "trout", hint: "The river, in daylight."},
  perch: {n: "Perch", spot: "river", w: 18, cm: [14, 34], hard: 2, item: "fish", hint: "The river, any time. Stripy."},
  pike: {n: "Pike", spot: "river", w: 9, rain: true, cm: [50, 100], hard: 4, item: "fish", hint: "The river, when it's raining."},
  koi: {n: "Golden koi", spot: "river", w: 3, when: "dusk", cm: [30, 60], hard: 5, item: null, rare: true, hint: "The river, at dusk. Very rare. Some say lucky."},
  boot: {n: "Old boot", spot: "river", w: 6, cm: [26, 30], hard: 1, item: null, junk: true, hint: "The river. Not a fish, strictly."},
  carp: {n: "Mirror carp", spot: "lake", w: 30, cm: [30, 75], hard: 3, item: "fish", hint: "The lake, any time."},
  tench: {n: "Tench", spot: "lake", w: 18, when: "dawn", cm: [25, 50], hard: 2, item: "fish", hint: "The lake, early in the morning."},
  rudd: {n: "Rudd", spot: "lake", w: 26, cm: [12, 26], hard: 1, item: "fish", hint: "The lake, any time. Red fins."},
  crayfish: {n: "Crayfish", spot: "lake", w: 16, cm: [8, 15], hard: 1, item: "crayfish", hint: "The lake, at night or in the rain."},
  eel: {n: "Eel", spot: "lake", w: 9, when: "night", cm: [40, 90], hard: 4, item: "fish", hint: "The lake, at night."},
  sardine: {n: "Sardine", spot: "sea", w: 32, cm: [12, 20], hard: 1, item: "sardine", hint: "The sea, any time."},
  mackerel: {n: "Mackerel", spot: "sea", w: 24, when: "day", cm: [25, 40], hard: 2, item: "mackerel", hint: "The sea, in daylight."},
  seabream: {n: "Sea bream", spot: "sea", w: 14, cm: [25, 45], hard: 3, item: "seabream", hint: "The sea, any time. Fussy."},
  squid: {n: "Squid", spot: "sea", w: 14, when: "night", cm: [20, 40], hard: 3, item: "squid", hint: "The sea, after dark."},
  octopus: {n: "Octopus", spot: "sea", w: 8, rain: true, cm: [40, 80], hard: 4, item: "octopus", hint: "The sea, when it's raining."},
  minnow: {n: "Minnow", spot: "pool", w: 30, cm: [4, 9], hard: 1, item: "fish", hint: "The waterfall pool, any time. Tiny."},
  browntrout: {n: "Brown trout", spot: "pool", w: 22, cm: [25, 55], hard: 3, item: "trout", hint: "The waterfall pool, any time."},
  grayling: {n: "Grayling", spot: "pool", w: 14, when: "day", cm: [25, 40], hard: 3, item: "fish", hint: "The waterfall pool, in daylight. A big sail of a fin."},
  shrimp: {n: "Shrimp", spot: "sea", w: 26, when: "dawn", cm: [6, 12], hard: 1, item: "shrimp", hint: "The sea, in the morning. For gambas!"},   // round 109
  seaglass: {n: "Sea glass", spot: "sea", w: 6, cm: [2, 4], hard: 1, item: null, junk: true, hint: "The sea. Smoothed by the waves; it goes on the windowsill."}
};
// crayfish come out at night or in the rain
const OK_WHEN = {day: m => m >= 7*60 && m < 18*60, dawn: m => m >= 5*60 && m < 10*60, dusk: m => m >= 18*60 && m < 20*60, night: m => m >= 19*60 || m < 6*60};
export function canBite(id, day = dayKey(), hm = sgHM()){
  const f = FISH[id]; if (f.when && !OK_WHEN[f.when](hm)) return false; if (f.rain && !rainyOn(day)) return false;
  if (id === "crayfish" && !(OK_WHEN.night(hm) || rainyOn(day))) return false;
  return true;
}
export const fishHere = (spot, day, hm) => Object.keys(FISH).filter(id => FISH[id].spot === spot && canBite(id, day, hm));

// the backpack items (the generic "fish" already exists: a market treat)
const ING = {trout: ["Rainbow trout", 4, "with almond butter, at the kitchen"], crayfish: ["Crayfish", 2, "four on toast with garlic, at the kitchen"],
  sardine: ["Sardine", 2, "three on the grill, at the kitchen"], mackerel: ["Mackerel", 3, "escabeche with peppers, at the kitchen"],
  seabream: ["Sea bream", 5, "baked with olives, at the kitchen"], squid: ["Squid", 4, "fried calamari, at the kitchen"], octopus: ["Octopus", 6, "pulpo a la gallega, at the kitchen"], shrimp: ["Shrimp", 2, "gambas al ajillo with garlic and olive oil, at the kitchen"]};
Object.entries(ING).forEach(([id, [n, sell, what]]) => { if (!ITEMS[id]) ITEMS[id] = {n, ico: id, kind: "ingredient", sell, what}; });

export const ROD = 80, REEL = 400, BAIT_DAY = 3, BAIT_MAX = 20;
export function fishState(F){
  F.fish = F.fish || {}; const s = F.fish; s.caught = s.caught || {}; s.log = s.log || []; s.koi = s.koi || 0; s.bait = s.bait || 0;
  if (s.baitDay !== dayKey()) { s.baitDay = dayKey(); s.bait = Math.min(BAIT_MAX, s.bait + BAIT_DAY); }   // the morning's worms
  return s;
}
export const addBait = (F, n = 1) => { const s = fishState(F); s.bait = Math.min(BAIT_MAX, s.bait + n); return s.bait; };
export function buyRod(F){ const s = fishState(F); if (s.rod || F.coins < ROD) return false; F.coins -= ROD; s.rod = 1; return true; }
export function buyReel(F){ const s = fishState(F); if (!s.rod || s.reel || F.coins < REEL) return false; F.coins -= REEL; s.reel = 1; return true; }

// pick what's biting (weighted), with rng for tests
export function pickFish(spot, day = dayKey(), hm = sgHM(), rng = Math.random){
  const ids = fishHere(spot, day, hm), tot = ids.reduce((a, id) => a + FISH[id].w, 0); let r = rng()*tot;
  for (const id of ids) { r -= FISH[id].w; if (r <= 0) return id; } return ids[ids.length - 1];
}
// the reel game: a marker sweeps 0..1 and back (DUR ms each way); the green zone is centred at `at`, `width` wide
export const DUR = 900;
export const markerAt = (t0, t = Date.now()) => { const p = ((t - t0)/DUR) % 2; return p < 1 ? p : 2 - p; };
export const zoneFor = (id, reel, seed = Math.random()) => { const w = Math.max(.1, .42 - FISH[id].hard*.06) * (reel ? 1.35 : 1); return {at: Math.min(1 - w/2, Math.max(w/2, .2 + seed*.6)), width: w}; };
export const inZone = (z, p) => Math.abs(p - z.at) <= z.width/2;

// start a cast -> the cast {spot, fish, bite (ms), zone, t0: null} or a reason string
export const BITE_MIN = 2000, BITE_MAX = 6000, ESCAPE = 3500;
export function cast(F, spot, rng = Math.random){
  const s = fishState(F); if (!s.rod) return "rod"; if (s.bait <= 0) return "bait";
  s.bait--; const fish = pickFish(spot, dayKey(), sgHM(), rng);
  return {spot, fish, bite: Date.now() + BITE_MIN + rng()*(BITE_MAX - BITE_MIN), zone: zoneFor(fish, s.reel, rng()), t0: null};
}
// land it -> {id, cm, isNew, best, item} (it's in the journal and the backpack)
export function land(F, id, rng = Math.random, addInv){
  const s = fishState(F), f = FISH[id], cm = Math.round(f.cm[0] + Math.pow(rng(), 1.6)*(f.cm[1] - f.cm[0]));
  const c = s.caught[id] || {n: 0, best: 0}, isNew = !c.n, best = cm > c.best;
  s.caught = {...s.caught, [id]: {n: c.n + 1, best: Math.max(c.best, cm)}};
  s.log = [{id, cm, day: dayKey()}, ...s.log].slice(0, 30);
  if (id === "koi") s.koi = Math.min(3, s.koi + 1);
  if (f.item && addInv) addInv(f.item, 1);
  return {id, cm, isNew, best: best && !isNew, item: f.item};
}
export const journalCount = F => Object.keys(fishState(F).caught).length;

/* ---------- the panel ---------- */
const coin = () => icon("coin", 13);
const shut = `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
const worms = n => `${n} worm${n === 1 ? "" : "s"}`;
// st: {view: "fish"|"journal", cast, result, msg}
export function fishPanel(F, spot, st = {}){
  const s = fishState(F), sp = SPOTS[spot];
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>${esc(sp.n)}</h2>`;
  h += `<div class="gchips"><button class="gchip${st.view !== "journal" ? " on" : ""}" data-fish="view" data-k="fish"><span>Fishing</span></button><button class="gchip${st.view === "journal" ? " on" : ""}" data-fish="view" data-k="journal"><span>Journal · ${journalCount(F)} of ${Object.keys(FISH).length}</span></button></div>`;
  if (st.view === "journal") return h + journalHtml(F) + shut;
  if (!s.rod) return h + `<p class="sub">${esc(sp.line)} You'll need a rod. Gong Gong says the tackle shop's best one is 80 coins, and it'll last forever.</p><div class="actions"><button class="btn primary" data-fish="rod" ${F.coins >= ROD ? "" : "disabled"}>Buy a rod · ${ROD} ${coin()}</button></div>` + shut;
  h += `<p class="sub">${esc(sp.line)} <b>${worms(s.bait)}</b> in the bait tin. Every quest you finish digs up another.</p>`;
  const c = st.cast;
  if (c && !c.t0) h += `<div class="fishwater"><span class="fbob wait"></span></div><p class="muted">The float sits on the water... wait for the bite.</p><div class="actions"><button class="btn alt" data-fish="reel">Reel in</button></div>`;
  else if (c && c.t0) h += `<div class="fishwater bite"><span class="fbob"></span><b class="fbang">!</b></div><p><b>A bite!</b> Tap Reel when the marker's in the green.</p>
    <div class="fbar" data-t0="${c.t0}" data-dur="${DUR}" data-at="${c.zone.at.toFixed(3)}" data-w="${c.zone.width.toFixed(3)}"><span class="fzone" style="left:${((c.zone.at - c.zone.width/2)*100).toFixed(1)}%;width:${(c.zone.width*100).toFixed(1)}%"></span><span class="fmark" style="animation-delay:-${(Date.now() - c.t0)%(DUR*2)}ms"></span></div>
    <div class="actions"><button class="btn primary" data-fish="reel">Reel!</button></div>`;
  else {
    if (st.result) { const r = st.result, f = FISH[r.id];
      h += `<div class="fcatch"><span class="wpic">${icon(f.item || r.id, 34)}</span><span class="wtxt"><b>${r.id === "boot" ? "An old boot!" : r.id === "seaglass" ? "Some sea glass!" : `${r.cm}cm ${f.n.toLowerCase()}!`}${r.isNew ? " New in the journal." : r.best && !f.junk ? " Your biggest yet!" : ""}</b><small>${esc(catchLine(r))}</small></span></div>`; }
    else if (st.msg) h += `<p class="muted">${esc(st.msg)}</p>`;
    h += `<div class="actions"><button class="btn primary" data-fish="cast" ${s.bait > 0 ? "" : "disabled"}>${s.bait > 0 ? "Cast" : "Out of worms"}</button></div>`;
    if (!s.bait) h += `<p class="muted">No worms left. Finish a quest and you'll dig up another (three more turn up tomorrow morning anyway).</p>`;
    if (!s.reel) h += `<p class="muted">The better reel makes every fish easier to land (the green's wider). <button class="btn small alt" data-fish="reelup" ${F.coins >= REEL ? "" : "disabled"}>Buy · ${REEL} ${coin()}</button></p>`;
  }
  return h + shut;
}
export function catchLine(r){
  const f = FISH[r.id];
  if (r.id === "koi") return "Too beautiful to keep. You carry it home and let it go in the pond. It'll live there now.";
  if (r.id === "boot") return "Somebody's old wellington. Into the bin it goes.";
  if (r.id === "seaglass") return "A piece of sea glass, smoothed by the waves. It goes on the windowsill.";
  return f.item === "fish" ? "In the backpack: grill it at the kitchen, or give it to Maple." : `In the backpack: ${ING[f.item][2]}.`;
}
function journalHtml(F){
  const s = fishState(F);
  return Object.entries(SPOTS).map(([k, sp]) => `<p class="eyebrow" style="margin:12px 0 4px">${esc(sp.n)}</p><ul class="hlist wlist">${Object.entries(FISH).filter(([, f]) => f.spot === k).map(([id, f]) => { const c = s.caught[id];
    return c ? `<li><span class="wpic">${icon(f.item || id, 22)}</span><span class="wtxt"><b>${esc(f.n)}</b><small>${c.n} caught${f.junk ? "" : ` · biggest ${c.best}cm`}${id === "koi" ? ` · ${s.koi} in the pond` : ""}</small></span></li>`
      : `<li class="locked"><span class="wpic">?</span><span class="wtxt"><b>???</b><small>${esc(f.hint)}</small></span></li>`; }).join("")}</ul>`).join("");
}
