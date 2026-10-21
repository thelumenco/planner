// Farming: the garden, the greenhouse, the orchard, the flower farm, the field and Wildflower Farm. Everything here is
// read from the game's own data (src/data, src/game), so the pages follow the game. Also exports the small helpers the
// making and outdoors pages share (tables with row anchors, durations, item names and icons).
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { CROPS, ITEMS, SEASONS, PLOTS, QUEST_BOOST, seasonOf } from "../../src/data/items.js";
import { TREES, FLOWERS, TREE_GROW, TREE_FIRST, TREE_AGAIN, BED_GROW, BED_AGAIN, BUSH_GROW, BUSH_AGAIN, BED_YIELD, BUSH_YIELD, BOUQUET_STEMS, POT_STEMS, STEM_PRICE, POT_SPOTS } from "../../src/data/orchard.js";
import { NPCS } from "../../src/data/npcs.js";
import { VILLAGE } from "../../src/data/world.js";
import { TOWN_GOODS } from "../../src/data/towns.js";
import { ICON_NAMES } from "../../src/art/icons.js";
import { GH_BEDS, GH_POTS, POT_HERBS, REGROW } from "../../src/game/greenhouse.js";
import { ORDER_PAY } from "../../src/game/orchard.js";
import { TOUR_FEE, MARKET, FAIR, NIGHT, XMAS, eventsOn, classOn, MOVIE, BAYMKT, XMAS_FROM, XMAS_TO, GROTTO, CAROLS, LANTERN_WALK, CLASS_FROM, CLASS_TO } from "../../src/game/tours.js";
import * as HF from "../../src/game/hfarm.js";
import { GOALS } from "../../src/game/goals.js";
import { GOODS as KGOODS, TAPAS, DISHES } from "../../src/game/kitchen.js";
import { INGR } from "../../src/game/scoop.js";
import { BIKE_FEE } from "../../src/game/transport.js";
import { DECOR } from "../../src/data/items.js";
// the game registers more items as its modules load (trip goods, catches, crafts): load them so names and prices are all there
import "../../src/game/ronda.js"; import "../../src/game/kyoto.js"; import "../../src/game/jeju.js"; import "../../src/game/cinque.js";
import "../../src/game/saltwick.js"; import "../../src/game/puffin.js"; import "../../src/game/hokkaido.js"; import "../../src/game/bali.js";
import "../../src/game/bellbird.js"; import "../../src/game/bbrooms.js"; import "../../src/game/loft.js"; import "../../src/game/fishing.js";
import "../../src/game/woods.js"; import "../../src/game/millcraft.js"; import "../../src/game/paperie.js"; import "../../src/game/wrap.js"; import "../../src/game/gallery.js";
import { esc, ico, coin, lede, slugify, hm } from "../lib.mjs";

/* ---------- shared helpers ---------- */
const H = 3600e3;
// "4 hours", "1 day", "1 hour 30 min"
export const dur = ms => { const m = Math.round(ms/60000); if (m < 60) return `${m} min`;
  const d = Math.floor(m/1440), h = Math.floor((m % 1440)/60), mm = m % 60;
  return [d ? `${d} day${d > 1 ? "s" : ""}` : "", h ? `${h} hour${h > 1 ? "s" : ""}` : "", mm ? `${mm} min` : ""].filter(Boolean).join(" "); };
export const seasonsText = list => !list || !list.length || list.length === 4 ? "All year" : Object.keys(SEASONS).filter(s => list.includes(s)).map(s => SEASONS[s].n).join(", ");
export const every = ms => ms === 864e5 ? "every day" : `every ${dur(ms)}`;
const ICONS = new Set(ICON_NAMES);
const drawn = n => ICONS.has(n) || /^(seed:|pp_|wrp_|rb_|tag_|stamp_|gw_|balm_|lipoil_|beeswax$|dpc_)/.test(n);
// an icon for an item id (or any icon name), falling back to something sensible rather than the game's sparkle
export const icon = (id, size = 22, fb = "sprout") => { const n = (ITEMS[id] && ITEMS[id].ico) || id; return ico(drawn(n) ? n : drawn(id) ? id : fb, size); };
const cap = s => s ? s[0].toUpperCase() + s.slice(1) : s;
// an item's name, wherever the game keeps it
export const nameOf = id => (ITEMS[id] && ITEMS[id].n) || (TOWN_GOODS[id] && TOWN_GOODS[id].n) || (KGOODS[id] && cap(KGOODS[id][1])) || (INGR[id] && INGR[id][0]) || cap(id);
export const named = (id, size = 22, label) => `<span style="white-space:nowrap">${icon(id, size)}${esc(label || nameOf(id))}</span>`;
export const sell = id => ITEMS[id] && ITEMS[id].sell ? coin(ITEMS[id].sell) : `<span class="muted">not sold</span>`;
// a table whose rows can carry an id (for search links): rows are arrays of cells, or {id, cells}
export const T = (head, rows) => rows.length ? `<div class="tw"><table><thead><tr>${head.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map(r => Array.isArray(r) ? r : r.cells ? r : {cells: r})
  .map(r => `<tr${r.id ? ` id="${esc(r.id)}"` : ""}>${(r.cells || r).map(c => `<td>${c ?? ""}</td>`).join("")}</tr>`).join("")}</tbody></table></div>` : `<p class="muted">Nothing here yet.</p>`;
export const h2 = (id, text, iconName) => `<h2 id="${esc(id)}">${iconName ? icon(iconName, 22, "sparkle") + " " : ""}${esc(text)}</h2>`;
export const h3 = (id, text) => `<h3 id="${esc(id)}">${esc(text)}</h3>`;
export const box = html => `<div class="box">${html}</div>`;
// a villager's name, linked to their page when they have one
const VILLAGERS = new Set(NPCS.filter(n => !n.tourist && !n.local && !n.kid).map(n => n.id));
export const who = id => { const n = NPCS.find(x => x.id === id); return !n ? esc(id) : VILLAGERS.has(id) ? `<a href="/villagers/${id}">${esc(n.name)}</a>` : esc(n.name); };
// a recipe's ingredients: {id: n} -> "2 icon Potatoes + 1 icon Tomato"
export const needs = (need, nm = nameOf, ic = id => id) => Object.entries(need).map(([id, n]) => `<span style="white-space:nowrap">${n} × ${icon(ic(id), 20)}${esc(nm(id, n))}</span>`).join(" + ");
export const S = {}; // (spare)
export const anchorOf = (slug, id) => `/${slug}#${id}`;
export const goalLine = k => GOALS[k] ? `${esc(GOALS[k].n)}: ${coin(GOALS[k].price)}` : "";
// read a plain object literal out of a game file that doesn't export it (the garden shed lives inside core.js)
export function literal(file, name){
  const src = readFileSync(fileURLToPath(new URL("../../src/" + file, import.meta.url)), "utf8"), at = src.indexOf(`const ${name} = {`); if (at < 0) return null;
  let i = src.indexOf("{", at), depth = 0, j = i; for (; j < src.length; j++) { const c = src[j]; if (c === "{") depth++; else if (c === "}" && --depth === 0) break; }
  try { return Function(`"use strict"; return (${src.slice(i, j + 1)});`)(); } catch { return null; }
}
const months = {spring: "March to May", summer: "June to August", autumn: "September to November", winter: "December to February"};
// check the months against the game's own season function
for (const [s, m] of Object.entries({spring: "2026-04-01", summer: "2026-07-01", autumn: "2026-10-01", winter: "2026-01-01"})) if (seasonOf(m) !== s) throw new Error("season months moved: " + s);

/* ---------- the garden ---------- */
const SHED = literal("game/core.js", "SHED") || {};
const SEEDS = Object.keys(ITEMS).filter(id => ITEMS[id].kind === "seed" && !id.startsWith("gh_"));
const gardenSeeds = SEEDS.filter(id => !ITEMS[id].greenhouse && CROPS[ITEMS[id].crop]);
const seedOf = crop => gardenSeeds.find(id => ITEMS[id].crop === crop);
const VISIT = {bellbird: "Bellbird Valley", cinque: "Cinque Terre"};
const inNeed = (crop, need) => crop in need || ((crop === "tulip" || crop === "sunflower") && "petals" in need);
const cropUses = crop => { const t = Object.entries(TAPAS).filter(([, d]) => inNeed(crop, d.need)).map(([id, d]) => `<a href="/kitchen-and-tapas#tapa-${id}">${esc(d.n)}</a>`);
  const p = Object.entries(DISHES).filter(([, d]) => inNeed(crop, d.need)).map(([id, d]) => `<a href="/kitchen-and-tapas#dish-${id}">${esc(d.n)}</a>`);
  return [...t, ...p, ...(crop === "tulip" || crop === "sunflower" ? [`<a href="/kitchen-and-tapas#petal-syrup">Petal syrup</a>`] : [])]; };
function gardenPage(){
  const crops = Object.keys(CROPS).filter(c => !CROPS[c].herb && seedOf(c));
  const row = c => { const s = seedOf(c), C = CROPS[c], it = ITEMS[s];
    return {id: c, cells: [named(c, 24, C.n), named(s, 20, it.n) + (it.visited ? `<br><small class="muted">after a trip to ${esc(VISIT[it.visited] || it.visited)}</small>` : ""), coin(it.price), seasonsText(it.seasons), dur(C.dur), `${C.yield}`, sell(c), ITEMS[c] && ITEMS[c].sell ? coin(C.yield*ITEMS[c].sell) : ""]}; };
  const bySeason = Object.keys(SEASONS).map(s => { const here = crops.filter(c => (ITEMS[seedOf(c)].seasons || []).includes(s));
    return `${h3("season-" + s, `${SEASONS[s].n} (${months[s]})`)}<p class="muted">${esc(SEASONS[s].line)}.</p><p>${here.map(c => named(seedOf(c), 24)).join(" &nbsp; ")}</p>`; }).join("");
  const shed = Object.entries(SHED).map(([id, t]) => ({id: "tool-" + id, cells: [`${ico(t.ico, 24)} ${esc(t.n)}`, coin(t.price), esc(t.what)]}));
  const kitchen = crops.map(c => [named(c, 22, CROPS[c].n), cropUses(c).join(", ") || `<span class="muted">not in a kitchen recipe</span>`]);
  const html = lede(`The garden by your house has ${PLOTS.length} plots. Buy seeds from Hana's market, plant them, give them water, and pick what's ripe. The seeds change with the seasons, and anything already bought or planted keeps growing.`)
    + h2("plots", "How the plots work", "sprout")
    + `<ul class="plain"><li><b>Plant:</b> tap an empty plot and pick a packet from your backpack.</li>
      <li><b>Water:</b> a new seed waits for water. Growing only starts once it's watered.</li>
      <li><b>Wait:</b> each crop has its own growing time (below). Every finished quest on the quest board takes ${dur(QUEST_BOOST)} off everything that's growing.</li>
      <li><b>Harvest:</b> tap a ripe plot and the whole harvest goes into your backpack. The plot's empty again, ready for the next packet.</li></ul>`
    + box(`${ico("sparkle", 20)} A new game starts with a welcome gift from the village: three packets each of the three cheapest seeds in season, in your backpack, and 200 coins.`)
    + h2("seasons", "Seeds by season", "calendar")
    + `<p>Seasons follow the real calendar. Hana's seed shelf changes with them; once the <a href="/greenhouse">greenhouse</a> is built she also sells greenhouse packets of anything out of season.</p>` + bySeason
    + h2("crops", "Every crop", "carrot")
    + `<p class="muted">Yield is how many one plot gives at harvest. Sell prices are what the market's Sell tab pays for each one.</p>`
    + T(["Crop", "Seeds", "Packet", "Seasons", "Grows in", "Yield", "Sells for", "A plot's worth"], crops.map(row))
    + h2("shed", "The garden shed", "wateringCan")
    + `<p>Tools for the garden, each bought once and kept forever. ${who("bo")} sets them up for you. They work on every plot at once, and the compost, fertiliser, seeder and harvester work in the greenhouse too.</p>`
    + T(["Tool", "Price", "What it does"], shed)
    + h2("selling", "Selling and using crops", "coin")
    + `<p>Sell anything from your backpack at the market's Sell tab. Village requests on the quest board often ask for in-season garden crops, and pay more than the market does (about 1.4 times the sell price). Crops are also ingredients: tapas at the <a href="/kitchen-and-tapas">wine shop kitchen</a>, gelato at the <a href="/scoop-shack">Scoop Shack</a>, and treats for the goats at <a href="/wildflower-farm">Wildflower Farm</a>.</p>`
    + h3("in-the-kitchen", "Crops in the kitchen") + T(["Crop", "Cooked into"], kitchen);
  const search = crops.flatMap(c => [{t: CROPS[c].n, d: `Crop: ${dur(CROPS[c].dur)} to grow, ${seasonsText(ITEMS[seedOf(c)].seasons).toLowerCase()}`, a: "/garden-and-crops#" + c},
    {t: ITEMS[seedOf(c)].n, d: `Seeds, ${ITEMS[seedOf(c)].price} coins at Hana's market`, a: "/garden-and-crops#" + c}])
    .concat(Object.entries(SHED).map(([id, t]) => ({t: t.n, d: `Garden shed tool, ${t.price} coins`, a: "/garden-and-crops#tool-" + id})));
  return {slug: "garden-and-crops", title: "Garden and crops", navTitle: "Garden and crops", section: "farming", blurb: "Plots, seeds by season, growing times, yields and the garden shed", html, search};
}

/* ---------- the greenhouse ---------- */
function greenhousePage(){
  const g = GOALS.greenhouse, herbs = Object.keys(CROPS).filter(c => CROPS[c].herb), seedFor = c => SEEDS.find(id => ITEMS[id].crop === c && ITEMS[id].greenhouse);
  const rows = herbs.map(c => { const C = CROPS[c], s = seedFor(c), pot = POT_HERBS.includes(c);
    return {id: c, cells: [named(c, 24, C.n), pot ? "A herb pot" : "A bed", s ? `${named(s, 20)} ${coin(ITEMS[s].price)}` : "", dur(C.dur), pot ? dur(C.dur*REGROW) : `<span class="muted">replant</span>`, `${C.yield}`, sell(c), esc(((ITEMS[c] || {}).what || "").replace(/^from the greenhouse: /, ""))]}; });
  const twins = Object.keys(ITEMS).filter(id => id.startsWith("gh_")).map(id => { const t = ITEMS[id], o = ITEMS[t.ghOf];
    return {id: "gh-" + t.crop, cells: [named(t.crop, 22, CROPS[t.crop].n), coin(t.price), coin(o.price), seasonsText(o.seasons)]}; });
  const html = lede(`${esc(g.line)} It costs ${coin(g.price)}, saved up for at the garden.`)
    + h2("inside", "Inside", "pot")
    + `<ul class="plain"><li><b>${GH_BEDS} raised beds.</b> Garlic grows here, and so does any seed packet, in or out of season: greenhouse packets, and ordinary seasonal seeds too.</li>
      <li><b>${GH_POTS} terracotta herb pots</b> along the glass, for the leafy herbs (${POT_HERBS.map(c => CROPS[c].n.toLowerCase()).join(", ")}). Plant once, then clip it whenever it's grown: clipping takes the leaves and the plant grows back in ${Math.round(REGROW*100)}% of the time it first took. Swap a herb out whenever you like.</li>
      <li><b>No watering.</b> The misters keep everything damp.</li>
      <li>Every finished quest takes ${dur(QUEST_BOOST)} off whatever's growing. From the <a href="/garden-and-crops#shed">garden shed</a>, the compost (a quarter faster), fertiliser (one more each harvest), auto seeder (re-sows a bed after picking) and auto harvester all work under the glass too.</li></ul>`
    + h2("herbs", "Herbs", "sprout")
    + `<p class="muted">Herb seeds are on Hana's seed shelf all year once the greenhouse is built. Times are without the compost bin.</p>`
    + T(["Herb", "Grows in", "Seeds", "First crop", "Grows back", "Yield", "Sells for", "Used for"], rows)
    + h2("packets", "Greenhouse seed packets", "seed:tomato")
    + `<p>Every seasonal packet has a greenhouse twin, half as dear again, that Hana sells all year while the ordinary one is out of season. It only grows under the glass: the garden won't take it.</p>`
    + T(["Crop", "Greenhouse packet", "Ordinary packet", "Ordinary season"], twins);
  const search = herbs.map(c => ({t: CROPS[c].n, d: `Greenhouse herb, ${dur(CROPS[c].dur)} to grow`, a: "/greenhouse#" + c}));
  return {slug: "greenhouse", title: "Greenhouse", section: "farming", blurb: "Herbs all year, herb pots that grow back, and out-of-season packets", html, search};
}

/* ---------- the orchard ---------- */
function orchardPage(){
  const rows = Object.entries(TREES).map(([id, t]) => ({id: "tree-" + id, cells: [named(t.fruit, 24, t.n), seasonsText(t.seasons), coin(t.price), `${t.yield} ${esc(t.fn[1])} a day`, sell(t.fruit),
    t.unlock === "jeju" ? `<small>Only once Farid has brought a sapling home from Jeju</small>` : ""]}));
  const H_ = HF.HONEYS.map(x => x.n).join(", ").replace(/, ([^,]*)$/, " and $1");
  const html = lede(`Farid's orchard, west of home through the gate. You buy the saplings and plant them; ${who("farid")} waters, tends and picks. Everything belongs to its seasons: when the season turns, a tree fades and its spot wants replanting. Tap a faded tree and plant something in season in its place (or buy from the farm shop: it goes into the first empty or faded spot). A tree that's still in season can be dug up too, with Undo, if you'd rather plant something else there.`)
    + h2("how", "How it works", "apple")
    + `<ul class="plain"><li>The orchard has 12 tree spots. Buy a sapling on the farm shop's Plant tab (it goes in the next free spot) or tap a spot.</li>
      <li>A sapling grows for ${dur(TREE_GROW)}, its first fruit ripens ${dur(TREE_FIRST)} after that, and then there's fruit again ${every(TREE_AGAIN)}.</li>
      <li>Farid picks whatever's ripe between 7am and 7pm and puts it on the farm shop's shelves. Anything there is free for you to take.</li>
      <li>Villagers buy from the farm shop while it's open (9am to 6pm), and Farid keeps the takings in a tin he hands you when you visit. On Sunday mornings he takes the same shelves to his stall at the <a href="/field#markets">farmers market</a>.</li></ul>`
    + h2("trees", "Fruit trees", "cherry")
    + T(["Tree", "Season", "Sapling", "Fruit", "Each sells for", ""], rows)
    + `<p class="muted">Fruit can go to the wine shop's fruit crate (customers buy it at the sell price), to your pet, into gelato at the <a href="/scoop-shack">Scoop Shack</a> or bonbons at the <a href="/cocoa-room">Cocoa Room</a>, and lemons, oranges and apples into mulled wine at the <a href="/kitchen-and-tapas#mulled-wine">kitchen</a>.</p>`
    + h2("tours", "Farm tours", "walker")
    + `<p>Weekends at 10am, 11:30am, 2pm and 4pm, Farid or Mei takes a small group round the orchard and the <a href="/flower-farm">flower farm</a>; ${who("bo")} leads one after work on Tuesday and Thursday evenings. Each person pays ${coin(TOUR_FEE)} into the orchard tin, once there's something to see: plant at least three trees or flowers first. Out-of-towners on a tour each buy something from the farm shop on the way out. The tour board by the path shows who's signed up.</p>`
    + h2("tea", "Tea with Farid", "toast")
    + `<p>Visit Farid at home and he puts the kettle on: tea, and cake (he always bakes too much). Once a day.</p>`
    + h2("honey", "Orchard blossom honey", "honey_blossom")
    + `<p>The bees at <a href="/wildflower-farm#honey">Wildflower Farm</a> work a different flower each week, turn and turn about: ${H_}. Spin your frames in the week they're on the orchard blossom for ${named("honey_blossom", 20, "jars of orchard blossom honey")}.</p>`
    + `<p class="muted">The <a href="/cocoa-room#upgrades">Cocoa Room</a> can also plant a cacao tree in Farid's orchard, for a free sack of beans every two days.</p>`;
  const search = Object.entries(TREES).map(([id, t]) => ({t: t.n, d: `Orchard tree, ${seasonsText(t.seasons).toLowerCase()}, ${t.price} coins`, a: "/orchard#tree-" + id}));
  return {slug: "orchard", title: "Orchard", section: "farming", blurb: "Fruit trees by season, Farid's farm shop, tours and blossom honey", html, search};
}

/* ---------- the flower farm ---------- */
function flowerPage(){
  const rows = Object.entries(FLOWERS).map(([id, f]) => ({id: "flower-" + id, cells: [named("bq_" + id, 24, f.n), f.bush ? "Bush" : "Bed", seasonsText(f.seasons), coin(f.price), f.bush ? `${BUSH_YIELD} stems, ${every(BUSH_AGAIN)}` : `${BED_YIELD} stems, ${every(BED_AGAIN)}`]}));
  const spots = Object.values(POT_SPOTS).map(s => cap(s.n)).join("; ");
  const html = lede(`Mei's flower farm, next to the orchard. Buy seedlings and bushes at the orchard's farm shop; ${who("mei")} plants them (and sings to them), waters them and cuts the stems. Like the trees, flowers live in their own seasons and fade when the season turns: plant something in season over a faded bed or bush, or dig up one that's still in season (with Undo) to make room.`)
    + h2("beds", "Beds and bushes", "tulip")
    + `<ul class="plain"><li><b>12 flower beds</b> for seedlings: they grow for ${dur(BED_GROW)}, flower, are cut, and bloom again ${dur(BED_AGAIN)} later. ${BED_YIELD} stems a picking.</li>
      <li><b>4 bushes</b> along the top row: they grow for ${dur(BUSH_GROW)}, then bloom ${every(BUSH_AGAIN)}. ${BUSH_YIELD} stems a picking.</li>
      <li>Picked stems go on the farm shop's Flowers tab, free for you. Villagers buy the rest, ${coin(STEM_PRICE)} a stem into Farid's tin.</li></ul>`
    + h2("flowers", "Every flower", "rose")
    + T(["Flower", "Grows in", "Season", "Price", "Stems"], rows)
    + h2("bouquets", "Bouquets and potted flowers", "bq_rose")
    + `<p>At the farm shop's Flowers tab, Mei ties ${BOUQUET_STEMS} stems into a bouquet, or pots up ${POT_STEMS} stems.</p>
      <ul class="plain"><li><b>Bouquets</b> can be given to anyone in the village. See <a href="/hearts-and-gifts">Hearts and gifts</a>.</li>
      <li><b>Potted flowers</b> go in a pot spot (tap one in your backpack): ${esc(spots)}.</li>
      <li><b>Bouquet orders:</b> most days someone in the village asks Mei for a bouquet for an occasion (a birthday, a housewarming, a first date...). Hand over any bouquet for ${coin(ORDER_PAY)}. One order a day.</li></ul>`
    + `<p class="muted">Stems also go into gelato at the <a href="/scoop-shack">Scoop Shack</a>, bonbons at the <a href="/cocoa-room">Cocoa Room</a>, and tints for lip balms and lip oils at the <a href="/olive-mill#lip-balms">olive mill</a>. Bouquets of lavender, roses, sweet peas, camellias and heather go into the mill's soaps and lotions, and lavender and rose into <a href="/paperie">handmade paper</a>.</p>`;
  const search = Object.entries(FLOWERS).map(([id, f]) => ({t: f.n, d: `Flower farm, ${seasonsText(f.seasons).toLowerCase()}, ${f.price} coins`, a: "/flower-farm#flower-" + id}))
    .concat([{t: "Bouquet orders", d: `Mei's daily bouquet order, ${ORDER_PAY} coins`, a: "/flower-farm#bouquets"}]);
  return {slug: "flower-farm", title: "Flower farm", section: "farming", blurb: "Flowers by season, bouquets, potted flowers and bouquet orders", html, search};
}

/* ---------- the field ---------- */
const DOW = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const stallRow = s => { const items = (s.items || []).concat(s.decor || [], s.treats || []).filter(id => ITEMS[id] || DECOR[id]);
  const nm = id => ITEMS[id] ? named(id, 20) : DECOR[id] ? `${ico(DECOR[id].ico, 20)}${esc(DECOR[id].n)}` : esc(id);
  return [esc(s.n), s.id === "hero" ? "You" : who(s.id), items.length ? items.map(nm).join(", ") : esc(s.line || "")]; };
function fieldPage(){
  // a sample week, to read the class timetable from the game itself
  const base = Date.parse("2026-03-01T00:00:00Z"), week = Array.from({length: 7}, (_, i) => new Date(base + i*864e5).toISOString().slice(0, 10));
  const cls = week.map(d => [DOW[new Date(d + "T00:00:00Z").getUTCDay()], (classOn(d) || {}).kind]).filter(x => x[1]);
  const spots = Object.entries(VILLAGE).filter(([id, p]) => p.scene === "field" && p.line && !p.bridge && !/^(mstall|bm\d)/.test(id));
  const html = lede(`The field: open meadow and a lake, north of the orchard and west of the town square. Most days it's swans, picnics and a morning class; on market days and evenings it fills up with stalls.`)
    + h2("places", "Around the field", "picnic")
    + T(["Place", ""], spots.filter(([id]) => !["kites", "popcorn", "mstall8", "mstall9"].includes(id)).map(([id, p]) => ({id: "spot-" + id, cells: [`<b>${esc(p.name)}</b>`, esc(p.line)]})))
    + h2("class", "Hana's morning class", "walker")
    + `<p>${who("hana")} leads a class on the exercise lawn, ${hm(CLASS_FROM)} to ${hm(CLASS_TO)}, with three villagers each morning. Tap the lawn to join in. Not on market Sundays, and not while Hana's away on a trip.</p>`
    + T(["Day", "Class"], cls.map(([d, k]) => [d, esc(k)]))
    + h2("kite", "Flying a kite", "kite")
    + `<p>Buy a ${named("kite", 20)} (${coin(ITEMS.kite.price)} on the Gifts shelf at Hana's market, or from Hiro's kite stall) and fly it from your backpack at the kite-flying spot: open grass and a breeze off the sea.</p>`
    + h2("markets", "Markets and evenings", "market")
    + T(["What", "When"], [
      ["Sunday farmers market", `Sundays, ${hm(8*60)} to ${hm(13*60)}`], ["Field fair", `The last Saturday of the month, ${hm(10*60)} to ${hm(16*60)} (not in the Christmas market's season)`],
      ["Night market", `Tuesdays and Thursdays, ${hm(17*60 + 30)} to ${hm(22*60)}, with a jazz duo on the little stage`], ["Friday market", `Fridays, ${hm(BAYMKT[0])} to ${hm(BAYMKT[1])}: three stalls with a different mix every week, and Hiro's kites`],
      ["Movie night", `The last Friday of the month, ${hm(MOVIE[0])} to ${hm(MOVIE[1])}, everyone on blankets`],
      ["Christmas market", `Every evening from 20 November to Christmas Eve, ${hm(XMAS_FROM)} to ${hm(XMAS_TO)}. It takes the night market's and the fair's place; the Sunday market carries on`]].map(r => r.map(esc)))
    + `<p class="muted">See the <a href="/calendar">Calendar</a> for the whole year.</p>`
    + h3("sunday-market", "The Sunday farmers market") + T(["Stall", "Keeper", "Sells"], MARKET.map(stallRow))
    + `<p class="muted">Clara's produce stall sells whatever vegetables and berries are in season. The wine stall sells from your own <a href="/vineyard-and-wine">wine shop</a> shelves, and Farid's from the orchard's farm shop. The Cocoa Room cart stands once you've bought it.</p>`
    + h3("fair", "The field fair") + T(["Stall", "Keeper", "Sells"], FAIR.map(stallRow))
    + h3("night-market", "The night market") + T(["Stall", "Keeper", "Sells"], NIGHT.map(stallRow))
    + `<p class="muted">The Scoop Shack's cart scoops from your <a href="/scoop-shack">Scoop Shack</a>'s display.</p>`
    + h3("christmas-market", "The Christmas market") + T(["Stall", "Keeper", "Sells"], XMAS.map(stallRow))
    + `<p>In the Christmas season the village tree stands on the football pitch, lit at half past five (the first night, everyone counts it down). Carols on Fridays at ${hm(CAROLS[0])}, Santa's grotto on weekend evenings, ${hm(GROTTO[0])} to ${hm(GROTTO[1])}, and a lantern walk on Christmas Eve at ${hm(LANTERN_WALK[0])}.</p>`
    + `<p class="muted">Fishing at the lake is on the <a href="/fishing">Fishing</a> page; the river taxi stops at the lake too (see <a href="/woods#taxi">the woods</a>).</p>`;
  return {slug: "field", title: "The field", section: "farming", blurb: "The lake, the morning class, kites, markets and the Christmas market", html,
    search: [{t: "Sunday farmers market", d: "The field, Sundays 8am to 1pm", a: "/field#sunday-market"}, {t: "Night market", d: "The field, Tuesday and Thursday evenings", a: "/field#night-market"},
      {t: "Christmas market", d: "The field, 20 November to Christmas Eve", a: "/field#christmas-market"}, {t: "Field fair", d: "The field, last Saturday of the month", a: "/field#fair"},
      {t: "Hana's morning class", d: "Pilates, Zumba and Piloxing on the field", a: "/field#class"}, {t: "Kite flying", d: "On the field", a: "/field#kite"}]};
}

/* ---------- Wildflower Farm ---------- */
function farmPage(){
  const herd = (k, H_) => H_.list.map(a => esc(a.n)).join(", ");
  const cheeses = Object.entries(HF.CHEESES).map(([k, c]) => ({id: "cheese-" + k, cells: [named(c.id, 24, c.n), `${c.need} × ${named(c.milk, 20)}`, dur(c.days*864e5), `${c.wedges}`, sell(c.id),
    c.lvl ? `Once you're their ${HF.LEVELS[c.lvl].n.toLowerCase()}` : c.learn ? (k === "havarti" ? "Taught by Meg in the Tablelands" : "Taught by Céline in the Lavender Hills") : "From the start"]}));
  const crafted = Object.entries(HF.CRAFTED_SELL).filter(([id]) => !/^chz_/.test(id) && ITEMS[id]).map(([id, n]) => ({id: "made-" + id, cells: [named(id, 22), coin(n)]}));
  const html = lede(`Felix and Elena's farm, north of the field: cows, goats, five beehives, a barn with a honey extractor, yoghurt crocks and a cheese press, and a cheese cave. ${who("felix")} and ${who("elena")} run it; you help, and take a share.`)
    + h2("animals", "The cows and goats", "goat")
    + `<p>The cows are ${herd("cows", HF.HERDS.cows)}; the goats are ${herd("goats", HF.HERDS.goats)}, with their climbing spool.</p>
      <ul class="plain"><li><b>Feed</b> each herd hay and water once a day.</li><li><b>Brush</b> each animal, and <b>muck out</b> the stalls.</li>
      <li><b>Milk</b> in the morning, ${hm(HF.MILK_FROM)} to ${hm(HF.MILK_TO)}, if they've been fed today or yesterday. A grumpy cow gives 1 ${esc(nameOf("milk").toLowerCase())}, a content one 2, a happy one (fed, brushed and a clean stall) 3. A goat gives 1 goat's milk, or 2 when happy.</li>
      <li><b>Latch the goat gate</b> in the evening, or someone's out exploring in the morning: round them up.</li></ul>`
    + h2("honey", "The beehives", "honey")
    + `<ul class="plain"><li>${HF.HIVES} hives, each filling over ${HF.HIVE_DAYS} days (a downpour keeps the bees in and slows them; a light shower doesn't).</li>
      <li>A full hive gives you ${HF.JARS} frames of comb (Felix keeps the rest). Don't leave it too long: a hive left full for ${HF.SWARM_DAYS} more days swarms, and the honey's lost.</li>
      <li>Spin the frames in the barn's extractor. Each frame makes a jar of this week's honey: the bees work ${HF.HONEYS.map(x => x.n).join(", ")}, a week each, turn and turn about.</li>
      <li>Once you're a trusted hand you get your own bee veil and a hive of your own to name: all ${HF.MY_FRAMES} of its frames are yours.</li></ul>`
    + h2("barn", "The barn", "yoghurt")
    + `<ul class="plain"><li><b>Yoghurt crocks:</b> a bottle of milk or goat's milk makes a ${named("yoghurt", 20)}.</li>
      <li><b>Honey extractor:</b> spin frames into jars. As their apprentice, Felix also shows you how to cut a frame as ${named("honeycomb", 20)} and whip a jar into ${named("honey_cream", 20)}.</li>
      <li><b>Cheese press:</b> choose a cheese, name the wheel (the game suggests names) and press it. It ages on a shelf in the cave, ${HF.CAVE} shelves to start.</li></ul>`
    + h2("cheese", "Cheeses", "chz_cheddar")
    + T(["Cheese", "Milk", "Ripe in", "Wedges", "A wedge sells for", "Who makes it"], cheeses)
    + `<p>Turn the wheels in the cave every day or so while they age. Turned faithfully, a wheel comes out excellent (a dearer, separate item that sells for ${coin(6)} more a wedge); forgotten, it's rustic, with a wedge fewer.</p>`
    + h2("trust", "Trust", "heart")
    + `<p>Every bit of help earns Felix and Elena's trust: feeding, brushing, mucking out, milking, the hives, turning the cheese. Each day one of them also asks a small favour on the farmhouse chalkboard, for a big helping of trust.</p>`
    + T(["Level", "Trust", "What it brings"], HF.LEVELS.map(l => [`<b>${esc(l.n)}</b>`, `${l.at}`, esc(l.gives || "Where everyone starts")]))
    + T(["Today's ask", "From"], HF.REQUESTS.map(r => [esc(r.ask), r.who === "felix" ? who("felix") : who("elena")]))
    + h2("stand", "The farm stand", "milk")
    + `<p>By the gate, with an honesty tin. Once you're their partner, a shelf of your own here sells your cheese and honey to passers-by, 8am to 6pm, at full price.</p>`
    + T(["For sale", "Price"], Object.entries(HF.STAND).map(([id, p]) => ({id: "stand-" + id, cells: [named(id, 22), coin(p)]})))
    + h3("selling", "Selling what you make") + `<p class="muted">Your own honey and yoghurt sell at the market's Sell tab for these prices.</p>`
    + T(["Made at the farm", "Sells for"], crafted);
  const search = Object.entries(HF.CHEESES).map(([k, c]) => ({t: c.n, d: `Cheese at Wildflower Farm, ripe in ${dur(c.days*864e5)}`, a: "/wildflower-farm#cheese-" + k}))
    .concat([{t: "Beehives", d: "Wildflower Farm's hives and honey", a: "/wildflower-farm#honey"}, {t: "Milking", d: `Wildflower Farm, ${hm(HF.MILK_FROM)} to ${hm(HF.MILK_TO)}`, a: "/wildflower-farm#animals"},
      ...HF.HONEYS.map(x => ({t: nameOf(x.id), d: "Honey from Wildflower Farm's extractor", a: "/wildflower-farm#honey"}))]);
  return {slug: "wildflower-farm", title: "Wildflower Farm", section: "farming", blurb: "Cows, goats, beehives, yoghurt and cheese with Felix and Elena", html, search};
}

export const pages = () => [gardenPage(), greenhousePage(), orchardPage(), flowerPage(), fieldPage(), farmPage()];
