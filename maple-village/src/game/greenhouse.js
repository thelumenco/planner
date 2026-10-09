// The greenhouse (round 109): the little shed at the back of the garden, rebuilt in glass (a big goal, goals.js).
// Inside: six raised beds. Herbs (garlic, basil, mint, rosemary, chives, thyme) grow here all year, and so do the
// greenhouse seed packets Hana sells out of season. The misters keep the beds damp, so nothing needs watering.
// Herbs go to the kitchen (gambas, rosemary potatoes, bruschetta, chive omelette, pumpkin with thyme), the Scoop
// Shack (basil, mint, rosemary, thyme gelato) and the Cocoa Room (bonbon fillings).
// State: F.gh = {beds: [{crop, plantedAt} | null] x6}
import { esc, H } from "../util.js";
import { icon } from "../art/icons.js";
import { ITEMS, CROPS } from "../data/items.js";

export const GH_BEDS = 6;
export function ghState(F){ F.gh = F.gh || {}; const g = F.gh; g.beds = g.beds || Array(GH_BEDS).fill(null); return g; }
// finishing quests speeds the greenhouse up too (bonus ms, like the garden)
// the shed's compost (a garden tool) works in here too: everything grows a quarter faster
let compostOn = () => false;
export const setGhCompost = fn => { compostOn = fn; };
export const ghGrowth = b => b && b.crop ? Math.min(1, (Date.now() - b.plantedAt + (b.bonus || 0))/(CROPS[b.crop].dur/(compostOn() ? 1.25 : 1))) : 0;
// seeds the greenhouse takes: herb packets, greenhouse packets, and ordinary seasonal seeds too
export const ghSeeds = F => Object.keys(F.inv || {}).filter(id => F.inv[id] > 0 && ITEMS[id] && ITEMS[id].kind === "seed" && CROPS[ITEMS[id].crop]);
export function ghPlant(F, i, seed, addInv){
  const g = ghState(F), it = ITEMS[seed]; if (!it || !(F.inv[seed] > 0) || g.beds[i]) return null;
  addInv(seed, -1); g.beds[i] = {crop: it.crop, plantedAt: Date.now(), bonus: 0};
  return `${CROPS[it.crop].n} planted. The misters will keep it damp.`;
}
export function ghHarvest(F, i, addInv){
  const g = ghState(F), b = g.beds[i]; if (!b || ghGrowth(b) < 1) return null;
  const C = CROPS[b.crop], n = C.yield || 1; addInv(b.crop, n); g.beds[i] = null;
  return {crop: b.crop, n, line: `${n} ${C.ns || C.n.toLowerCase()} from the greenhouse, into your backpack.`};
}
export function ghBoost(F, ms){ const g = ghState(F); let n = 0; g.beds.forEach(b => { if (b && ghGrowth(b) < 1) { b.bonus = (b.bonus || 0) + ms; n++; } }); return n; }
const dur = ms => { const m = Math.max(1, Math.ceil(ms/60000)); return m >= 60 ? `${Math.floor(m/60)}h${m % 60 ? ` ${m % 60}m` : ""}` : `${m}m`; };

export function bedPanel(F, i){
  const g = ghState(F), b = g.beds[i];
  let h = `<span class="tape stripe" aria-hidden="true"></span><h2>Bed ${i + 1}</h2>`;
  if (!b) { const seeds = ghSeeds(F);
    return h + (seeds.length ? `<p class="sub">What shall we grow? Herbs grow here all year, and so does anything else, whatever the season.</p><ul class="hlist wlist">${seeds.map(id => `<li><span class="wpic">${icon(ITEMS[id].crop, 26)}</span><span class="wtxt"><b>${esc(ITEMS[id].n)}</b><small>${dur(CROPS[ITEMS[id].crop].dur)} to grow · ${F.inv[id]} in your backpack</small></span><button class="btn small primary" data-gh="plant" data-i="${i}" data-id="${id}">Plant</button></li>`).join("")}</ul>`
      : `<p class="sub">No seeds in your backpack. Hana's seed shelf has herbs, and greenhouse packets of anything out of season.</p>`) + `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`; }
  const gr = ghGrowth(b), C = CROPS[b.crop];
  h += gr >= 1 ? `<p class="sub">${icon(b.crop, 18)} ${esc(C.n)} is ready!</p><div class="actions"><button class="btn yes" data-gh="harvest" data-i="${i}">Harvest</button><button class="btn alt small" data-close="1">Close</button></div>`
    : `<p class="sub">${icon(b.crop, 18)} ${esc(C.n)}, growing under the glass. About ${dur(C.dur/(compostOn() ? 1.25 : 1)*(1 - gr))} to go. Every finished quest takes 30 minutes off.</p><div class="plotbar"><i style="width:${(gr*100).toFixed(0)}%"></i></div><div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
  return h;
}
