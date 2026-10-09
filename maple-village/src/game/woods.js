// Honeybrook Woods (round 103): the foraging patch and the ranger's cabin. Foraging gives whatever's in season, once a
// day: wild garlic in spring, blackberries in summer, mushrooms in autumn (one more after rain), chestnuts in winter.
// Each has uses: the kitchen (a tapas or a small plate), gelato at the Scoop Shack, bonbons at the Cocoa Room.
// State: F.woods = {forageDay}.
import { esc, dayKey } from "../util.js";
import { icon } from "../art/icons.js";
import { ITEMS, seasonOf } from "../data/items.js";
import { rainyOn } from "../art/village-extras.js";

export const FORAGE = {
  spring: {id: "wildgarlic", n: 3, line: "Wild garlic under the trees: you can smell it before you see it."},
  summer: {id: "blackberry", n: 4, line: "Blackberries, warm from the sun. Some even made it into the basket."},
  autumn: {id: "mushroom", n: 3, line: "A ring of mushrooms by the old oak. The ranger says these ones are safe."},
  winter: {id: "chestnut", n: 4, line: "Chestnuts, cracked out of their spiky cases. Mind your fingers."}
};
const NEW = {wildgarlic: ["Wild garlic", 2, "a wild garlic tortilla at the kitchen"], blackberry: ["Blackberries", 3, "blackberry crumble at the kitchen, gelato, or a bonbon"],
  mushroom: ["Wild mushrooms", 3, "wild mushrooms on toast at the kitchen"], chestnut: ["Chestnuts", 2, "roast chestnuts with honey at the kitchen, gelato, or a bonbon"]};
Object.entries(NEW).forEach(([id, [n, sell, what]]) => { if (!ITEMS[id]) ITEMS[id] = {n, ico: id, kind: "ingredient", sell, what: "from the woods: " + what}; });

export function woodsState(F){ F.woods = F.woods || {}; return F.woods; }
export const foragedToday = (F, day = dayKey()) => woodsState(F).forageDay === day;
// -> {id, n, line} (already in the backpack) or null if Mel's foraged today
export function forage(F, addInv, day = dayKey()){
  const w = woodsState(F); if (w.forageDay === day) return null;
  const f = FORAGE[seasonOf(day)], n = f.n + (f.id === "mushroom" && rainyOn(day) ? 1 : 0);
  w.forageDay = day; addInv(f.id, n); return {id: f.id, n, line: f.line};
}
const shut = `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
export function rangerPanel(F, wrenHere, day = dayKey()){
  const f = FORAGE[seasonOf(day)], it = ITEMS[f.id];
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>The ranger's cabin</h2><p class="sub">${wrenHere ? "Wren's in, kettle on." : "Wren's out on the trails; the noticeboard's by the door."} Honeybrook Woods: the waterfall, the pool, and every tree from here to Makers' Lane.</p>`;
  h += `<h3 class="ph3">On the noticeboard</h3><ul class="hlist wlist">
    <li><span class="wpic">${icon(f.id, 26)}</span><span class="wtxt"><b>In season: ${esc(it.n.toLowerCase())}</b><small>At the foraging patch, once a day.${f.id === "mushroom" ? " One more after rain." : ""} For ${esc(NEW[f.id][2])}.${foragedToday(F, day) ? " (You've been today.)" : ""}</small></span></li>
    <li><span class="wpic">${icon("trout", 26)}</span><span class="wtxt"><b>The waterfall pool</b><small>Brown trout, grayling (daytime) and minnows. Bring a rod and worms.</small></span></li>
    <li><span class="wpic">${icon("bike", 26)}</span><span class="wtxt"><b>Bike hire</b><small>By the cabin, at the station and in the town square. An hour for 5 coins.</small></span></li>
    <li><span class="wpic">${icon("taxi", 26)}</span><span class="wtxt"><b>The river taxi</b><small>From the pool down to Makers' Lane, home, the lake and the sea, 7am to 9pm. The quick way to Ma Ma's.</small></span></li></ul>`;
  return h + shut;
}
