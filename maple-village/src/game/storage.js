// Storage at home (round 166, Mel: "can my fridge at home be something that I put stuff into and it holds till I
// need to transfer it to one of my shops"). Two places, both kept forever (nothing goes off):
//   the fridge (its "Stored" side; the pantry side stays Hestia's real shopping list): food, ingredients, flowers
//   the storage shelf in the garage: everything else (soaps and oils from the mill, gifts, keepsakes, seeds...)
// Things go in from the backpack and come back out to it, or straight to a shop that uses them: Tomo drops them off
// on the delivery bike, instantly. Each shop's own stocking rules decide what it takes (sending borrows the backpack
// for a moment and hands the shop's usual "from your backpack" function the lot; whatever it won't take comes home).
import { ITEMS } from "../data/items.js";
import { esc } from "../util.js";
import { icon } from "../art/icons.js";
import { isIngr, stockFridge } from "./scoop.js";
import { isFilling, stockPantry } from "./cocoa.js";
import { isGood, sendToKitchen } from "./kitchen.js";
import { HERB, toBasket, craftState } from "./millcraft.js";

export const PLACES = {fridge: "the fridge", shelf: "the garage shelf"};
const FRIDGE_KINDS = ["food", "ingredient", "flower", "bouquet"];
const NEVER = ["tool", "pet", "use"];   // tools stay with Mel; a pet needs a home, not a shelf

export function storeState(F){ F.storage = F.storage || {}; const s = F.storage; s.fridge = s.fridge || {}; s.shelf = s.shelf || {}; return s; }
export const storable = id => !!ITEMS[id] && !NEVER.includes(ITEMS[id].kind);
export const placeFor = id => !storable(id) ? null : (FRIDGE_KINDS.includes(ITEMS[id].kind) || isIngr(id) || isGood(id)) && !ITEMS[id].mill ? "fridge" : "shelf";
export const storedCount = (F, where) => Object.values(storeState(F)[where]).reduce((a, b) => a + b, 0);

export function putAway(F, where, id, n = 99){
  const have = (F.inv || {})[id] || 0, k = Math.min(n, have); if (!k || placeFor(id) !== where) return 0;
  F.inv[id] -= k; if (F.inv[id] <= 0) delete F.inv[id]; const s = storeState(F)[where]; s[id] = (s[id] || 0) + k; return k;
}
export function takeOut(F, where, id, n = 99){
  const s = storeState(F)[where], k = Math.min(n, s[id] || 0); if (!k) return 0;
  s[id] -= k; if (!s[id]) delete s[id]; F.inv = F.inv || {}; F.inv[id] = (F.inv[id] || 0) + k; return k;
}

// the shops things can be sent to: what each takes, and how
export const SHOPS = [
  {k: "scoop", n: "the Scoop Shack fridge", ok: id => isIngr(id), go: (F, id, n) => stockFridge(F, id, n, "bag")},
  {k: "cocoa", n: "the Cocoa Room's fillings shelf", own: "cocoa", ok: id => isFilling(id), go: (F, id, n) => stockPantry(F, id, n, "bag")},
  {k: "kitchen", n: "the wine shop's larder", ok: id => isGood(id), go: (F, id, n) => sendToKitchen(F, id, n, false)},
  {k: "basket", n: "the mill's herb basket", own: "mill", ok: id => !!(HERB[id] && HERB[id].oil), go: (F, id, n) => toBasket(F, id, n)},
  {k: "millshelf", n: "the mill's shelves", own: "mill", ok: id => !!(ITEMS[id] && ITEMS[id].mill),
    go: (F, id, n) => { const k = Math.min(n, F.inv[id] || 0); if (!k) return 0; F.inv[id] -= k; if (F.inv[id] <= 0) delete F.inv[id]; const c = craftState(F); c.store[id] = (c.store[id] || 0) + k; return k; }}
];
export const shopsFor = (id, owns) => SHOPS.filter(s => (!s.own || owns(s.own)) && s.ok(id));

export function sendOff(F, where, id, shop, n = 99){
  const sh = SHOPS.find(s => s.k === shop), st = storeState(F)[where], k = Math.min(n, st[id] || 0); if (!sh || !k || !sh.ok(id)) return 0;
  F.inv = F.inv || {}; const before = F.inv[id] || 0; F.inv[id] = before + k;
  const sent = sh.go(F, id, k) || 0;
  if (before) F.inv[id] = before; else delete F.inv[id];   // whatever the shop didn't take never left home
  st[id] -= sent; if (!st[id]) delete st[id]; return sent;
}

const nm = id => ITEMS[id] ? ITEMS[id].n : id;
export function storePanel(F, where, o = {}){
  const s = storeState(F)[where], ids = Object.keys(s).filter(id => s[id] > 0 && ITEMS[id]).sort((a, b) => nm(a).localeCompare(nm(b)));
  const bag = Object.keys(F.inv || {}).filter(id => F.inv[id] > 0 && placeFor(id) === where).sort((a, b) => nm(a).localeCompare(nm(b)));
  const cell = (id, sub, btns) => `<li><span class="wpic">${icon(ITEMS[id].ico, 30)}</span><span class="wtxt"><b>${esc(nm(id))}</b><small>${sub}</small></span><span class="orbtns">${btns}</span></li>`;
  let h = where === "fridge" ? `<p class="sub">Food, ingredients and flowers keep in here as long as you like. Take them out, or send them to a shop: Tomo drops them off on the bike.</p>`
    : `<span class="tape gingham" aria-hidden="true"></span><h2>The storage shelf</h2><p class="sub">Next to the boxes labelled "Christmas" and "misc": soaps, oils, gifts, seeds, anything that isn't for the fridge. Take them out, or send them to a shop.</p>`;
  h += ids.length ? `<ul class="hlist wlist orflowers">${ids.map(id => cell(id, `${s[id]} stored`, `<button class="btn small alt" data-st="take" data-id="${id}" data-n="1">Take 1</button><button class="btn small alt" data-st="take" data-id="${id}" data-n="99">All</button>`
      + shopsFor(id, o.owns).map(sh => `<button class="btn small primary" data-st="send" data-id="${id}" data-to="${sh.k}">To ${esc(sh.n.replace(/^the /, ""))}</button>`).join(""))).join("")}</ul>`
    : `<p class="muted">Nothing stored yet.</p>`;
  if (bag.length) h += `<p class="eyebrow" style="margin:12px 0 6px">From your backpack</p><ul class="hlist wlist orflowers">${bag.map(id => cell(id, `${F.inv[id]} with you`, `<button class="btn small primary" data-st="put" data-id="${id}" data-n="1">Put away 1</button><button class="btn small alt" data-st="put" data-id="${id}" data-n="99">All</button>`)).join("")}</ul>
    <div class="actions"><button class="btn small alt" data-st="putall">Put everything away</button></div>`;
  return h + `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
}

// a line for a shop's own stocking panel: what's waiting at home that it could use
export function homeNote(F, shop, owns){
  const sh = SHOPS.find(s => s.k === shop); if (!sh) return "";
  const got = ["fridge", "shelf"].flatMap(w => Object.entries(storeState(F)[w]).filter(([id, n]) => n > 0 && ITEMS[id] && sh.ok(id)).map(([id, n]) => `${n} ${nm(id).toLowerCase()}`));
  return got.length ? `<p class="muted">At home, waiting: ${esc(got.slice(0, 6).join(", "))}${got.length > 6 ? "…" : ""}. Send them from the fridge or the garage shelf.</p>` : "";
}
