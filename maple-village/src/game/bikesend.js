// Sending more than ice cream by the delivery bike (round 139, Mel): from the Scoop Shack's delivery panel, Tomo can
// also take the family a box of bonbons or a chocolate bar from the Cocoa Room, or a plate of today's tapas or a small
// plate from the winery. Each uses real stock, and a thank-you note comes back like the ice creams.
import { esc } from "../util.js";
import { ITEMS } from "../data/items.js";
import { cocoaState, onDisplay, KINDS, BAR_ID } from "./cocoa.js";
import { vineState, tapasOn } from "./vineyard.js";
import { TAPAS, DISHES } from "./kitchen.js";

Object.assign(ITEMS, {
  dlv_bonbons: {n: "Box of bonbons", kind: "gift", price: 0, say: "Bonbons, delivered! I've hidden them from everyone else. Well. Mostly."},
  dlv_tapas: {n: "Plate of tapas", kind: "gift", price: 0, say: "Tapas on a bike, still warm! Tomo even brought a napkin."}
});
const BONBONS = 4;
// what can go out right now -> [{k, n, sub}]
export function sendOptions(F, today, ownsCocoa){
  const out = [];
  if (ownsCocoa) { const c = cocoaState(F), shown = onDisplay(c), tot = shown.reduce((a, b) => a + c.trays[b.id], 0);
    if (tot >= BONBONS) out.push({k: "bonbons", n: `A box of ${BONBONS} bonbons`, sub: "from the Cocoa Room's case"});
    Object.keys(KINDS).filter(k => c.bars[k] > 0).forEach(k => out.push({k: "bar:" + k, n: `A ${KINDS[k].n.toLowerCase()} bar`, sub: "from the Cocoa Room's wall"})); }
  const v = vineState(F);
  tapasOn(v, today).filter(t => t.plates > 0).forEach(t => out.push({k: "tapas:" + t.id, n: `A plate of ${TAPAS[t.id].n.toLowerCase()}`, sub: "today's tapas, from the winery"}));
  Object.keys(v.menu || {}).filter(id => v.menu[id] > 0 && DISHES[id]).forEach(id => out.push({k: "plate:" + id, n: DISHES[id].n, sub: "a small plate, from the winery"}));
  return out;
}
// take it out of stock -> the item id for the thank-you note, or null
export function takeSend(F, k, today){
  const [a, b] = k.split(":");
  if (a === "bonbons") { const c = cocoaState(F); let n = BONBONS; for (const r of onDisplay(c)) { const t = Math.min(n, c.trays[r.id]); c.trays[r.id] -= t; n -= t; if (!n) break; } return n ? null : "dlv_bonbons"; }
  if (a === "bar") { const c = cocoaState(F); if (!(c.bars[b] > 0)) return null; c.bars[b]--; return BAR_ID(b); }
  if (a === "tapas") { const t = tapasOn(vineState(F), today).find(x => x.id === b && x.plates > 0); if (!t) return null; t.plates--; return "dlv_tapas"; }
  if (a === "plate") { const v = vineState(F); if (!(v.menu[b] > 0)) return null; v.menu[b]--; if (!v.menu[b]) delete v.menu[b]; return "dlv_tapas"; }
  return null;
}
export function sendMorePanel(opts, chosen, who){
  if (chosen) { const o = opts.find(x => x.k === chosen);
    return `<p class="olabel">${esc(o ? o.n : "")}</p><p class="eyebrow" style="margin:10px 0 6px">Send it to</p><div class="actions">${who.map(([w, n]) => `<button class="btn small alt" data-gvto="${w}">${esc(n)}</button>`).join("")}</div><div class="actions"><button class="btn alt small" data-gvother="">Back</button></div>`; }
  if (!opts.length) return "";
  return `<p class="eyebrow" style="margin:14px 0 6px">Or from your other shops</p><ul class="hlist wlist">${opts.map(o => `<li><span class="wtxt"><b>${esc(o.n)}</b><small>${esc(o.sub)}</small></span><button class="btn small primary" data-gvother="${esc(o.k)}">Choose</button></li>`).join("")}</ul>`;
}
