// The drying loft (round 132), up the ladder in the barrel shed: what Mel learned in Cinque Terre, made at home with her
// own produce. The slow things fetch the most at the market (Mel: effort should pay, and the longer it takes, the more).
//   raisin wine   six bunches of her own grapes dry on the cane racks for 3 days (once Signor Bruno's shown her, at
//                 the monorail harvest), then go into the little cask for 4 more: 3 bottles of raisin wine (36 each)
//   limoncino     three lemons from Ma Ma's tree steep in a bottle for 5 days: 2 bottles (18 each)
//   anchovies     six fresh anchovies (the sea, the bay) packed in salt for 4 days: 2 jars (15 each)
//   pesto         at the mortar, right away (once Nonna Pina's shown her): basil and garlic from the greenhouse, pine
//                 nuts, her own olive oil and any cheese: 2 jars (7 each; quick, so cheap)
// Raisin wine, limoncino and anchovies unlock with a first trip to Cinque Terre; pesto and the raisin wine need their
// lessons. State: F.loft = {rack: {at, n}|null, cask: {at}|null, lemon: {at}|null, salt: {at}|null, made: {k: n}}
import { esc, H } from "../util.js";
import { icon } from "../art/icons.js";
import { ITEMS } from "../data/items.js";

const DAY = 24*H;
Object.assign(ITEMS, {
  w_raisin: {n: "Your raisin wine", kind: "gift", to: ["dad", "gonggong", "mum", "darren", "marcus"], price: 36, sell: 36, crafted: true, say: "Your own raisin wine? Amber, like honey. You MADE this? Just a tiny glass. Maybe two.", what: "dried on the racks and aged in the cask: the slowest thing you make"},
  limoncino: {n: "Your limoncino", kind: "gift", to: ["mum", "mama", "angelina", "darren"], price: 18, sell: 18, crafted: true, say: "Homemade limoncino from Ma Ma's lemons! Into the freezer. Then a tiny glass.", what: "steeped from Ma Ma's lemons: for the family, the market, or gelato"},
  anchovy_salt: {n: "Jar of salted anchovies", kind: "ingredient", price: 15, sell: 15, crafted: true, what: "packed in salt in the loft: anchovy and lemon toasts at the kitchen"}
});
export const LOFT = {
  rack: {n: "The cane drying racks", need: {grapes: 6}, days: 3, then: "cask"}, cask: {n: "The little cask", days: 4, gives: ["w_raisin", 3]},
  lemon: {n: "The steeping shelf", need: {lemon: 3}, days: 5, gives: ["limoncino", 2]},
  salt: {n: "The salting barrel", need: {anchovy: 6}, days: 4, gives: ["anchovy_salt", 2]},
  pesto: {n: "The mortar", need: {basil: 2, garlic: 1, pinenuts: 1, oliveoil: 1, cheese: 1}, gives: ["pesto", 2]}
};
export const loftState = F => { F.loft = F.loft || {}; F.loft.made = F.loft.made || {}; return F.loft; };
const ct = F => F.cinque || {};
export const loftOpen = F => !!(F.towns && F.towns.cinque);
export const canRaisin = F => !!ct(F).raisin, canPesto = F => !!ct(F).pestoLesson;
const GRAPES = ["grape_red", "grape_white", "grape_tempranillo"];
const grapesHave = inv => GRAPES.reduce((n, k) => n + (inv[k] || 0), 0);
const cheeseOf = inv => ["cheese", ...Object.keys(inv).filter(k => /^chz_/.test(k))].find(k => inv[k] > 0);
const take = (inv, k, n) => { inv[k] -= n; if (!inv[k]) delete inv[k]; };
export const left = (b, now = Date.now(), days) => b ? Math.max(0, b.at + days*DAY - now) : 0;
// what's missing for a batch (a list of words), or [] if Mel has it all
export function missing(F, k){
  const inv = F.inv || {}, need = LOFT[k].need || {}, out = [];
  Object.entries(need).forEach(([id, n]) => { const have = id === "grapes" ? grapesHave(inv) : id === "cheese" ? (cheeseOf(inv) ? 1 : 0) : inv[id] || 0; if (have < n) out.push(`${n - have} more ${id === "grapes" ? "bunches of grapes" : id === "pinenuts" ? "bag of pine nuts" : id === "oliveoil" ? "bottle of olive oil" : id}`); });
  return out;
}
// start a batch -> true, or null
export function startBatch(F, k, now = Date.now()){
  const L = loftState(F), inv = F.inv = F.inv || {}; if (!loftOpen(F) || !LOFT[k] || missing(F, k).length) return null;
  if (k === "rack" && (!canRaisin(F) || L.rack || L.cask)) return null;
  if (k === "pesto") { if (!canPesto(F)) return null; Object.entries(LOFT.pesto.need).forEach(([id, n]) => take(inv, id === "cheese" ? cheeseOf(inv) : id, n)); inv.pesto = (inv.pesto || 0) + 2; L.made.pesto = (L.made.pesto || 0) + 2; return true; }
  if (L[k]) return null;
  if (k === "rack") { let n = 6; for (const g of GRAPES) { const t = Math.min(n, inv[g] || 0); if (t) { take(inv, g, t); n -= t; } } L.rack = {at: now, n: 6}; return true; }
  Object.entries(LOFT[k].need).forEach(([id, n]) => take(inv, id, n)); L[k] = {at: now}; return true;
}
// collect a finished batch -> {id, n} (or, for the rack, "cask": the raisins go into the cask), or null
export function collect(F, k, now = Date.now()){
  const L = loftState(F), b = L[k]; if (!b || left(b, now, LOFT[k].days)) return null;
  if (k === "rack") { L.rack = null; L.cask = {at: now}; return {cask: true}; }
  const [id, n] = LOFT[k].gives; L[k] = null; F.inv[id] = (F.inv[id] || 0) + n; L.made[id] = (L.made[id] || 0) + n; return {id, n};
}
const hrs = ms => ms >= DAY ? `${Math.ceil(ms/DAY)} day${Math.ceil(ms/DAY) === 1 ? "" : "s"}` : `${Math.max(1, Math.ceil(ms/H))} hour${Math.ceil(ms/H) === 1 ? "" : "s"}`;
const shut = `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
function row(F, k, title, pic, body){ return `<li><span class="wpic">${icon(pic, 28)}</span><span class="wtxt"><b>${esc(title)}</b><small>${body}</small></span>`; }
export function loftPanel(F, now = Date.now()){
  const L = loftState(F);
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>The drying loft</h2><p class="sub">Up the ladder in the barrel shed: warm, dry and smelling of grapes. What you learned in Cinque Terre, made with your own produce. The slower it is, the more it fetches at the market.</p><ul class="hlist wlist">`;
  // the racks and the cask (raisin wine)
  if (!canRaisin(F)) h += row(F, "rack", "Raisin wine", "grape_white", "Help Signor Bruno with the harvest on the monorail in Corniglia, and he'll show you how.") + `</li>`;
  else if (L.cask) { const t = left(L.cask, now, LOFT.cask.days); h += row(F, "cask", "The little cask: raisin wine", "w_raisin", t ? `Ageing: ready in ${hrs(t)}.` : "Ready! Three bottles of amber raisin wine.") + `${t ? "" : `<button class="btn small primary" data-lf="collect:cask">Bottle it</button>`}</li>`; }
  else if (L.rack) { const t = left(L.rack, now, LOFT.rack.days); h += row(F, "rack", "The cane racks: drying grapes", "grape_white", t ? `Six bunches, slowly turning to raisins: ${hrs(t)} to go.` : "Wrinkled and sweet: ready for the cask.") + `${t ? "" : `<button class="btn small primary" data-lf="collect:rack">Into the cask</button>`}</li>`; }
  else { const m = missing(F, "rack"); h += row(F, "rack", "Raisin wine: lay grapes on the racks", "grape_white", `Six bunches of your grapes (from the barrel shed's crates). 3 days on the racks, then 4 in the cask: 3 bottles, 36 each.${m.length ? ` You need ${m.join(", ")}.` : ""}`) + `<button class="btn small primary" data-lf="start:rack" ${m.length ? "disabled" : ""}>Lay them out</button></li>`; }
  // the steeping shelf (limoncino) and the salting barrel (anchovies)
  for (const [k, title, pic, what] of [["lemon", "Limoncino", "limoncino", "Three lemons from Ma Ma's tree, peeled and steeped for 5 days: 2 bottles, 18 each."], ["salt", "Salted anchovies", "anchovy_salt", "Six fresh anchovies from the sea, packed in salt for 4 days: 2 jars, 15 each."]]) {
    const b = L[k], t = b ? left(b, now, LOFT[k].days) : 0, m = missing(F, k);
    if (b) h += row(F, k, `${title}: ${t ? "on its way" : "ready!"}`, pic, t ? `Ready in ${hrs(t)}.` : "Done. Take it down.") + `${t ? "" : `<button class="btn small primary" data-lf="collect:${k}">Take it</button>`}</li>`;
    else h += row(F, k, title, pic, `${what}${m.length ? ` You need ${m.join(", ")}.` : ""}`) + `<button class="btn small primary" data-lf="start:${k}" ${m.length ? "disabled" : ""}>Start</button></li>`;
  }
  // the mortar (pesto, straight away)
  { const m = missing(F, "pesto"); h += row(F, "pesto", "Pesto at the mortar", "pesto", canPesto(F) ? `Basil 2, garlic 1, pine nuts, olive oil and a bit of cheese: 2 jars, right now.${m.length ? ` You need ${m.join(", ")}.` : ""}` : "Make pesto with Nonna Pina in Manarola first, and she'll lend you her secret.") + (canPesto(F) ? `<button class="btn small primary" data-lf="start:pesto" ${m.length ? "disabled" : ""}>Pound it</button>` : "") + `</li>`; }
  return h + `</ul>` + shut;
}
