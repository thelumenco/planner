// Friday evenings (round 112). Aperitivo hour at the wine shop is in vineyard.js (sellTick) and tours.js (who drops
// in). Here: the fishmonger's van at the bay (5 to 10pm: worms, clams, lemons; and it buys your catch at half as much
// again), the week's lanterns at the bonfire (one paper lantern for every quest finished this week, released over the
// sea, once a Friday), and flying a kite on the field (any day, once you've bought one).
import { esc, dayKey, prevDay } from "../util.js";
import { icon } from "../art/icons.js";
import { ITEMS } from "../data/items.js";
import { addBait, CATCH } from "./fishing.js";

export const VAN_GOODS = {worms: {n: "Five worms", price: 6, line: "For the bait tin. Wriggly."}, clams: {n: "Clams", price: 4, line: "For clams with garlic and lemon, at the kitchen."}, lemon: {n: "Lemon", price: 3, line: "For the clams, or a lemon and petal posset."}};
export const VAN_MULT = 1.5;
export function vanBuy(F, id, addInv){
  const g = VAN_GOODS[id]; if (!g || F.coins < g.price) return null; F.coins -= g.price;
  if (id === "worms") { addBait(F, 5); return "Five worms, into the bait tin."; }
  addInv(id, 1); return `${g.n === "Clams" ? "A bag of clams" : "A lemon"}, into your backpack.`;
}
const shut = `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
const coin = () => icon("coin", 13);
export function vanPanel(F){
  const have = CATCH.filter(x => (F.inv || {})[x] > 0 && ITEMS[x] && ITEMS[x].sell), all = have.reduce((a, x) => a + Math.round(F.inv[x]*ITEMS[x].sell*VAN_MULT), 0);
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>The fishmonger's van</h2><p class="sub">Friday evenings at the bay, five till ten. Ice, a striped awning, and a man called Sal who's been doing this for forty years.</p>`;
  h += `<h3 class="ph3">Buy</h3><ul class="hlist wlist">${Object.entries(VAN_GOODS).map(([id, g]) => `<li><span class="wpic">${icon(id === "worms" ? "rod" : id, 26)}</span><span class="wtxt"><b>${esc(g.n)}</b><small>${esc(g.line)}</small></span><button class="btn small primary" data-van="${id}" ${F.coins >= g.price ? "" : "disabled"}>${g.price} ${coin()}</button></li>`).join("")}</ul>`;
  h += `<h3 class="ph3">Sell your catch</h3>` + (have.length ? `<p class="muted">Sal pays half as much again on a Friday.</p><ul class="hlist wlist">${have.map(x => `<li><span class="wpic">${icon(x, 26)}</span><span class="wtxt"><b>${esc(ITEMS[x].n)} ×${F.inv[x]}</b><small>${Math.round(ITEMS[x].sell*VAN_MULT*10)/10} coins each</small></span></li>`).join("")}</ul><div class="actions"><button class="btn primary small" data-van="sellall">Sell the lot · ${all} ${coin()}</button></div>` : `<p class="muted">Nothing in your backpack to sell. Catch something and come back: Sal pays well on a Friday.</p>`);
  return h + shut;
}
// quests finished this week (the last seven days, today included), from F.history
export function weekQuests(F, day = dayKey()){ let n = 0, d = day; for (let i = 0; i < 7; i++) { n += ((F.history || {})[d] || {}).q || 0; d = prevDay(d); } return n; }
export const lanternsDone = (F, day = dayKey()) => (F.fri || {}).lanterns === day;
export function releaseLanterns(F, day = dayKey()){ if (lanternsDone(F, day)) return null; F.fri = Object.assign(F.fri || {}, {lanterns: day}); return weekQuests(F, day); }
export function bonfirePanel(F, family){
  const n = weekQuests(F), done = lanternsDone(F);
  return `<span class="tape gingham" aria-hidden="true"></span><h2>The bonfire</h2><p class="sub">Driftwood crackling on the sand, logs to sit on, the sea going dark.${family ? ` ${esc(family)}.` : ""}</p>
    <p>${done ? "The week's lanterns are already out over the sea." : n ? `<b>${n} quest${n > 1 ? "s" : ""}</b> finished this week: a paper lantern for each.` : "No quests this week. That's alright: one lantern anyway, for getting through it."}</p>
    <div class="actions">${done ? "" : `<button class="btn primary" data-fire="lanterns">Release the week's lanterns</button>`}<button class="btn alt" data-fire="sit">Sit by the fire</button></div>` + shut;
}

/* ---------- round 113: the Friday market at the bay, and movie night on the field ---------- */
import { POOLS, GOODS as STALL_GOODS } from "../data/stall-goods.js";
import { MARKET, NIGHT, bayKeepers } from "./tours.js";
import { hash } from "../util.js";
import { NPCS } from "../data/npcs.js";
// everything the regular markets sell (gifts and treats; not produce or the pet corner), for a different mix each week
const BAY_POOL = [...new Set([...MARKET, ...NIGHT].flatMap(s => s.items || []).concat(Object.values(POOLS).flatMap(p => Object.values(p).flat())))]
  .filter(id => ITEMS[id] && (ITEMS[id].price || STALL_GOODS[id]) && ITEMS[id].kind !== "pet" && ITEMS[id].kind !== "seed");
export const BAY_NAMES = ["Odds and ends", "Treats and sweets", "Seaside finds"];
// stall k on a Friday: four things, shuffled by the date (no two stalls share one)
export function bayStallGoods(day, k){
  const order = BAY_POOL.map(id => [hash(day + ":bay:" + id), id]).sort((a, b) => a[0] - b[0]).map(([, id]) => id);
  return order.slice(k*4, k*4 + 4);
}
export const bayKeeperName = (day, k) => (NPCS.find(n => n.id === bayKeepers(day)[k]) || {name: "Someone"}).name;

// movie night: a cosy film each month (picked by the month), and popcorn
const FILMS = ["The Lighthouse Cat", "A Picnic for Badger", "The Kite That Flew to Sea", "Lantern Festival", "Grandma's Bakery", "The Little Red Train", "Moon over the Harbour", "The Snail Who Raced", "Fox and the Fireflies", "The Orchard Mystery", "Bicycle Summer", "Snow on the Vineyard"];
export const filmOf = day => FILMS[(+day.slice(5, 7) + +day.slice(0, 4)) % FILMS.length];
if (!ITEMS.popcorn) ITEMS.popcorn = {n: "Popcorn", ico: "popcorn", kind: "gift", to: "family", price: 3, say: "Popcorn! Salty and sweet, the best kind."};
