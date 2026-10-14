// The shopping list on the fridge door: a plain real-life list. Add things, tick them off as they go in the basket,
// clear the ticked ones. No coins (it's a list, not a quest). A new game starts with a few sample items.
// State: F.shopList = {items: [{id, name, got}], seeded: true}
import { esc } from "../util.js";

const SAMPLE = ["Milk", "Bread", "Eggs", "Bananas", "Tea bags", "Washing-up liquid"];
const newId = () => "s" + Date.now().toString(36) + Math.floor(Math.random()*1e4).toString(36);
export function shopList(F){
  const L = F.shopList = F.shopList || {};
  if (!Array.isArray(L.items)) L.items = [];
  if (!L.seeded) { L.seeded = true; L.items = SAMPLE.map((name, i) => ({id: "sample" + i, name, got: false})); }
  return L;
}
export const shopLeft = F => shopList(F).items.filter(i => !i.got).length;
export function addItem(F, name){
  name = String(name || "").replace(/\s+/g, " ").trim().slice(0, 60); if (!name) return null;
  const it = {id: newId(), name, got: false}; shopList(F).items.push(it); return it;
}
export function toggleItem(F, id){ const it = shopList(F).items.find(i => i.id === id); if (it) it.got = !it.got; return it; }
export function removeItem(F, id){ const L = shopList(F), i = L.items.findIndex(x => x.id === id); if (i < 0) return null; const [it] = L.items.splice(i, 1); return {it, i}; }
export function restoreItem(F, r){ const L = shopList(F); if (r && !L.items.some(x => x.id === r.it.id)) L.items.splice(Math.min(r.i, L.items.length), 0, r.it); }
// -> the items taken off (for undo)
export function clearGot(F){ const L = shopList(F), gone = L.items.filter(i => i.got); L.items = L.items.filter(i => !i.got); return gone; }

export function shopPanelHTML(F){
  const L = shopList(F), todo = L.items.filter(i => !i.got), got = L.items.filter(i => i.got);
  const row = i => `<li class="${i.got ? "done" : ""}"><label><input type="checkbox" data-sl="tick" data-id="${esc(i.id)}" ${i.got ? "checked" : ""}> <span>${esc(i.name)}</span></label><button class="hx" data-sl="del" data-id="${esc(i.id)}" aria-label="Remove ${esc(i.name)}">✕</button></li>`;
  let h = `<p class="sub">${todo.length ? `${todo.length} thing${todo.length === 1 ? "" : "s"} to buy. Tick them off as they go in the basket.` : "Nothing to buy. Add something when it runs out."}</p>`;
  if (todo.length) h += `<ul class="hlist shoplist">${todo.map(row).join("")}</ul>`;
  if (got.length) h += `<p class="eyebrow" style="margin:12px 0 4px">In the basket</p><ul class="hlist shoplist">${got.map(row).join("")}</ul><div class="actions"><button class="btn small alt" data-sl="clear">Clear what's in the basket</button></div>`;
  h += `<form class="row hadd" id="slForm"><label class="sr" for="slIn">Add to the shopping list</label><input id="slIn" maxlength="60" placeholder="add to the shopping list"><button class="btn small alt">Add</button></form>`;
  return h;
}
