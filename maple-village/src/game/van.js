// The campervan (a big goal, goals.js "van", 3800): a cream-and-mint vintage van with a pop-top roof, parked at its
// spot on the cottage lane. It doesn't drive around town; it's a little home from home, and later it goes on road
// trips (off the map, to destinations of their own). Inside, Mel does it up from the mood board: six things to dress,
// each in one of six styles (the same styles the cottages will use). State in F.van = {owned: [itemId], use: {slot: itemId}}.
import { esc } from "../util.js";
import { icon } from "../art/icons.js";

export const STYLES = {
  cottage: {n: "Cottagecore", a: "#F4C7CF", b: "#9CC27E", c: "#FFF6E8"},
  japandi: {n: "Japandi", a: "#D9C7B0", b: "#6B6460", c: "#F2EDE6"},
  coastal: {n: "Coastal", a: "#9FD3E8", b: "#3E6B8C", c: "#F6F1E8"},
  midcentury: {n: "Mid-century", a: "#E8913A", b: "#5E8A5A", c: "#F3E7C9"},
  peranakan: {n: "Peranakan", a: "#7FB8A8", b: "#E8566C", c: "#F3C969"},
  scandi: {n: "Scandi", a: "#E3E8EC", b: "#8FB3C9", c: "#FFFDF6"}
};
export const SLOTS = {
  bedding: {n: "Bedding", price: 40, names: {cottage: "Patchwork quilt", japandi: "Linen futon set", coastal: "Striped cotton bedding", midcentury: "Mustard wool blanket", peranakan: "Batik bedspread", scandi: "White waffle duvet"}},
  curtains: {n: "Curtains", price: 30, names: {cottage: "Floral café curtains", japandi: "Noren curtain", coastal: "Sailcloth curtains", midcentury: "Geometric curtains", peranakan: "Kebaya-lace curtains", scandi: "Pale linen curtains"}},
  lights: {n: "Lights", price: 25, names: {cottage: "Fairy lights", japandi: "Paper lantern", coastal: "Shell string lights", midcentury: "Globe pendant", peranakan: "Brass lamp", scandi: "Candle lantern"}},
  rug: {n: "Rug", price: 30, names: {cottage: "Rag rug", japandi: "Tatami mat", coastal: "Jute rug", midcentury: "Shag rug", peranakan: "Tiled-pattern rug", scandi: "Sheepskin"}},
  cushions: {n: "Cushions", price: 20, names: {cottage: "Gingham cushions", japandi: "Zabuton cushions", coastal: "Anchor cushions", midcentury: "Orange cushions", peranakan: "Embroidered cushions", scandi: "Knitted cushions"}},
  plant: {n: "Plant", price: 15, names: {cottage: "Geraniums in a tin", japandi: "Bonsai", coastal: "Sea holly", midcentury: "Rubber plant", peranakan: "Orchid", scandi: "Trailing pothos"}}
};
export const itemId = (slot, style) => `van_${slot}_${style}`;
const parse = id => { const m = /^van_(\w+?)_(\w+)$/.exec(id || ""); return m && SLOTS[m[1]] && STYLES[m[2]] ? {slot: m[1], style: m[2]} : null; };
export function vanState(F){ F.van = F.van || {}; const v = F.van; v.owned = v.owned || []; v.use = v.use || {}; return v; }
// buy a piece (it goes straight in) or put back one already owned -> the item's name, or null
export function vanPick(F, slot, style){
  const v = vanState(F), id = itemId(slot, style), s = SLOTS[slot]; if (!s || !STYLES[style]) return null;
  if (!v.owned.includes(id)) { if (F.coins < s.price) return null; F.coins -= s.price; v.owned = [...v.owned, id]; }
  v.use = {...v.use, [slot]: id}; return s.names[style];
}
export function vanClear(F, slot){ const v = vanState(F); if (!v.use[slot]) return false; const u = {...v.use}; delete u[slot]; v.use = u; return true; }
export const vanUse = (F, slot) => { const p = parse(vanState(F).use[slot]); return p ? p.style : null; };
// how it's coming along: how many things are dressed, and the style most of them share
export function vanLook(F){
  const used = Object.values(vanState(F).use).map(parse).filter(Boolean), count = {};
  used.forEach(p => { count[p.style] = (count[p.style] || 0) + 1; });
  const top = Object.entries(count).sort((a, b) => b[1] - a[1])[0];
  return {dressed: used.length, of: Object.keys(SLOTS).length, style: top ? top[0] : null, share: top ? top[1]/Math.max(1, used.length) : 0, styles: Object.keys(count).length};
}
export function lookLine(F){
  const l = vanLook(F); if (!l.dressed) return "Bare walls and a mattress. A blank canvas.";
  const st = STYLES[l.style].n;
  if (l.dressed === l.of && l.styles === 1) return `All ${st}, every last cushion. It's gorgeous.`;
  if (l.share >= .66) return `Mostly ${st}. It's coming together beautifully.`;
  if (l.styles >= 4) return "A bit of everything. Eclectic! Or a bit chaotic, depending who you ask.";
  return "A mix of styles. Cosy, in its own way.";
}

const shut = `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
const coin = () => icon("coin", 13);
// the mood board: one thing at a time, every style for it, buy once and swap freely after
export function moodPanel(F, st = {}){
  const v = vanState(F), slot = SLOTS[st.slot] ? st.slot : "bedding", s = SLOTS[slot], l = vanLook(F);
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>The mood board</h2><p class="sub">Do up the van your way. ${l.dressed} of ${l.of} things dressed. ${esc(lookLine(F))}</p>`;
  h += `<div class="gchips">${Object.entries(SLOTS).map(([k, x]) => `<button class="gchip${k === slot ? " on" : ""}" data-van="slot" data-k="${k}" aria-pressed="${k === slot}"><span>${esc(x.n)}</span></button>`).join("")}</div>`;
  h += `<ul class="hlist wlist">${Object.entries(STYLES).map(([k, y]) => { const id = itemId(slot, k), mine = v.owned.includes(id), on = v.use[slot] === id;
    return `<li><span class="wpic"><span class="gdot" style="background:linear-gradient(135deg, ${y.a} 50%, ${y.b} 50%)"></span></span><span class="wtxt"><b>${esc(s.names[k])}</b><small>${esc(y.n)}${on ? " · in the van" : mine ? " · yours" : ` · ${s.price} ${coin()}`}</small></span>${on ? `<button class="btn small alt" data-van="clear" data-k="${slot}">Take out</button>` : `<button class="btn small ${mine ? "alt" : "primary"}" data-van="pick" data-k="${slot}" data-s="${k}" ${mine || F.coins >= s.price ? "" : "disabled"}>${mine ? "Put in" : "Buy"}</button>`}</li>`; }).join("")}</ul>`;
  return h + shut;
}
