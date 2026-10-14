// The greenhouse (round 109): the little shed at the back of the garden, rebuilt in glass (a big goal, goals.js).
// Inside: six raised beds. Herbs (garlic, basil, mint, rosemary, chives, thyme) grow here all year, and so do the
// greenhouse seed packets Hana sells out of season. The misters keep the beds damp, so nothing needs watering.
// Herbs go to the kitchen (gambas, rosemary potatoes, bruschetta, chive omelette, pumpkin with thyme), the Scoop
// Shack (basil, mint, rosemary, thyme gelato) and the Cocoa Room (bonbon fillings).
// Round 155: the leafy herbs (basil, mint, rosemary, chives, thyme) live in a row of terracotta pots along the
// glass instead. Plant once; harvesting only takes the leaves and clippings, so the plant stays and grows back (in
// half the time it took to start). Garlic is a bulb, so it stays in the beds.
// State: F.gh = {beds: [{crop, seed, plantedAt, bonus} | null] x6, pots: [{crop, plantedAt, bonus, clips, re} | null] x6}
import { esc, H } from "../util.js";
import { icon } from "../art/icons.js";
import { ITEMS, CROPS } from "../data/items.js";

export const GH_BEDS = 6, GH_POTS = 6, POT_HERBS = ["basil", "mint", "rosemary", "chives", "thyme"], REGROW = .5;
export function ghState(F){ F.gh = F.gh || {}; const g = F.gh; g.beds = g.beds || Array(GH_BEDS).fill(null); g.pots = g.pots || Array(GH_POTS).fill(null); return g; }
// finishing quests speeds the greenhouse up too (bonus ms, like the garden)
// the shed's compost (a garden tool) works in here too: everything grows a quarter faster
// round 155: and the fertiliser (another shed tool) adds a bunch to every harvest; the auto seeder re-sows a bed
let tools = () => ({});
export const setGhTools = fn => { tools = fn; };
const speed = () => tools().compost ? 1.25 : 1, extra = () => tools().fertiliser ? 1 : 0;
const need = b => CROPS[b.crop].dur*(b.re ? REGROW : 1)/speed();
export const ghGrowth = b => b && b.crop ? Math.min(1, (Date.now() - b.plantedAt + (b.bonus || 0))/need(b)) : 0;
const isPotSeed = id => ITEMS[id] && ITEMS[id].kind === "seed" && POT_HERBS.includes(ITEMS[id].crop);
// seeds the greenhouse takes: herb packets, greenhouse packets, and ordinary seasonal seeds too
// (the leafy herbs go in the pots, not the beds)
export const ghSeeds = F => Object.keys(F.inv || {}).filter(id => F.inv[id] > 0 && ITEMS[id] && ITEMS[id].kind === "seed" && CROPS[ITEMS[id].crop] && !isPotSeed(id));
export const potSeeds = F => Object.keys(F.inv || {}).filter(id => F.inv[id] > 0 && isPotSeed(id));
export function ghPlant(F, i, seed, addInv){
  const g = ghState(F), it = ITEMS[seed]; if (!it || isPotSeed(seed) || !(F.inv[seed] > 0) || g.beds[i]) return null;
  addInv(seed, -1); g.beds[i] = {crop: it.crop, seed, plantedAt: Date.now(), bonus: 0};
  return `${CROPS[it.crop].n} planted. The misters will keep it damp.`;
}
export function ghHarvest(F, i, addInv){
  const g = ghState(F), b = g.beds[i]; if (!b || ghGrowth(b) < 1) return null;
  const C = CROPS[b.crop], n = (C.yield || 1) + extra(); addInv(b.crop, n); g.beds[i] = null;
  const again = tools().seeder && b.seed && F.inv[b.seed] > 0; if (again) { addInv(b.seed, -1); g.beds[i] = {crop: b.crop, seed: b.seed, plantedAt: Date.now(), bonus: 0}; }
  return {crop: b.crop, n, again, line: `${n} ${C.ns || C.n.toLowerCase()} from the greenhouse, into your backpack.${again ? " The seeder's sown it again." : ""}`};
}
// the herb pots: plant once, then clip it whenever it's grown back
export function potPlant(F, i, seed, addInv){
  const g = ghState(F), it = ITEMS[seed]; if (!isPotSeed(seed) || !(F.inv[seed] > 0) || g.pots[i]) return null;
  addInv(seed, -1); g.pots[i] = {crop: it.crop, plantedAt: Date.now(), bonus: 0, clips: 0};
  return `${CROPS[it.crop].n} potted up by the glass. Once it's grown, just clip it: it grows back.`;
}
export function potClip(F, i, addInv){
  const g = ghState(F), b = g.pots[i]; if (!b || ghGrowth(b) < 1) return null;
  const C = CROPS[b.crop], n = (C.yield || 1) + extra(); addInv(b.crop, n); b.plantedAt = Date.now(); b.bonus = 0; b.re = true; b.clips = (b.clips || 0) + 1;
  return {crop: b.crop, n, line: `${n} ${C.ns || C.n.toLowerCase()}, clipped and into your backpack. The ${C.n.toLowerCase()} will grow back.`};
}
export function potDig(F, i){ const g = ghState(F); if (!g.pots[i]) return null; const c = CROPS[g.pots[i].crop].n; g.pots[i] = null; return `${c} lifted out. The pot's ready for something new.`; }
// everything ripe under the glass, for the auto harvester: [{crop, n}]
export function ghRipe(F, addInv){ const g = ghState(F), out = [];
  g.beds.forEach((b, i) => { if (b && ghGrowth(b) >= 1) { const r = ghHarvest(F, i, addInv); if (r) out.push(r); } });
  g.pots.forEach((b, i) => { if (b && ghGrowth(b) >= 1) { const r = potClip(F, i, addInv); if (r) out.push(r); } });
  return out; }
export function ghBoost(F, ms){ const g = ghState(F); let n = 0; [...g.beds, ...g.pots].forEach(b => { if (b && ghGrowth(b) < 1) { b.bonus = (b.bonus || 0) + ms; n++; } }); return n; }
const dur = ms => { const m = Math.max(1, Math.ceil(ms/60000)); return m >= 60 ? `${Math.floor(m/60)}h${m % 60 ? ` ${m % 60}m` : ""}` : `${m}m`; };

export function bedPanel(F, i){
  const g = ghState(F), b = g.beds[i];
  let h = `<span class="tape stripe" aria-hidden="true"></span><h2>Bed ${i + 1}</h2>`;
  if (!b) { const seeds = ghSeeds(F);
    return h + (seeds.length ? `<p class="sub">What shall we grow? Garlic and anything else grows here all year, whatever the season. (The leafy herbs live in the pots along the glass.)</p><ul class="hlist wlist">${seeds.map(id => `<li><span class="wpic">${icon(ITEMS[id].crop, 26)}</span><span class="wtxt"><b>${esc(ITEMS[id].n)}</b><small>${dur(CROPS[ITEMS[id].crop].dur)} to grow · ${F.inv[id]} in your backpack</small></span><button class="btn small primary" data-gh="plant" data-i="${i}" data-id="${id}">Plant</button></li>`).join("")}</ul>`
      : `<p class="sub">No seeds for the beds in your backpack. Hana's seed shelf has garlic, and greenhouse packets of anything out of season.</p>`) + `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`; }
  const gr = ghGrowth(b), C = CROPS[b.crop];
  h += gr >= 1 ? `<p class="sub">${icon(b.crop, 18)} ${esc(C.n)} is ready!</p><div class="actions"><button class="btn yes" data-gh="harvest" data-i="${i}">Harvest</button><button class="btn alt small" data-close="1">Close</button></div>`
    : `<p class="sub">${icon(b.crop, 18)} ${esc(C.n)}, growing under the glass. About ${dur(need(b)*(1 - gr))} to go. Every finished quest takes 30 minutes off.</p><div class="plotbar"><i style="width:${(gr*100).toFixed(0)}%"></i></div><div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
  return h;
}

export function herbPotPanel(F, i){
  const g = ghState(F), b = g.pots[i], shut = `<button class="btn alt small" data-close="1">Close</button>`;
  let h = `<span class="tape stripe" aria-hidden="true"></span><h2>Herb pot ${i + 1}</h2>`;
  if (!b) { const seeds = potSeeds(F);
    return h + (seeds.length ? `<p class="sub">A terracotta pot on the staging by the glass. Plant a herb once, then clip the leaves whenever it's grown: no replanting.</p><ul class="hlist wlist">${seeds.map(id => `<li><span class="wpic">${icon(ITEMS[id].crop, 26)}</span><span class="wtxt"><b>${esc(ITEMS[id].n)}</b><small>${dur(CROPS[ITEMS[id].crop].dur/speed())} to grow, then ${dur(CROPS[ITEMS[id].crop].dur*REGROW/speed())} to grow back · ${F.inv[id]} in your backpack</small></span><button class="btn small primary" data-gh="pplant" data-i="${i}" data-id="${id}">Plant</button></li>`).join("")}</ul>`
      : `<p class="sub">An empty pot by the glass. Hana's seed shelf has basil, mint, rosemary, chives and thyme.</p>`) + `<div class="actions">${shut}</div>`; }
  const gr = ghGrowth(b), C = CROPS[b.crop], dig = `<button class="btn alt small" data-gh="dig" data-i="${i}">Swap for another herb</button>`;
  const clips = b.clips ? ` Clipped ${b.clips === 1 ? "once" : `${b.clips} times`} so far.` : "";
  return h + (gr >= 1 ? `<p class="sub">${icon(b.crop, 18)} ${esc(C.n)}, bushy and ready to clip.${clips}</p><div class="actions"><button class="btn yes" data-gh="clip" data-i="${i}">Clip it</button>${shut}</div>`
    : `<p class="sub">${icon(b.crop, 18)} ${esc(C.n)}, ${b.re ? "growing back" : "growing"} by the glass. About ${dur(need(b)*(1 - gr))} to go.${clips}</p><div class="plotbar"><i style="width:${(gr*100).toFixed(0)}%"></i></div><div class="actions">${dig}${shut}</div>`);
}
