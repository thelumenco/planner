// Items: everything in data/items.js ITEMS, by group (one page each, from an index), with an icon, what it is, where
// it's from (the shop tab it's sold on, when there is one), its price and what it sells for.
import { ITEMS, CROPS } from "../../src/data/items.js";
import { TOWN_GOODS } from "../../src/data/towns.js";
// the game modules that add their own items to ITEMS when they load (fish, the loft's jars, the paperie's paper, the
// mill's crafts, the dairy's excellent cheeses...), so the list is the same whichever pages were built first
import "../../src/game/fishing.js"; import "../../src/game/loft.js"; import "../../src/game/gallery.js"; import "../../src/game/bikesend.js";
import "../../src/game/millcraft.js"; import "../../src/game/hfarm.js"; import "../../src/game/paperie.js";
// items.js itself, freshly loaded: what it holds before anything else adds to it
const { ITEMS: BASE } = await import("../../src/data/items.js?wiki-base");
import { esc, table, itemIcon, ico, coin, lede, card } from "../lib.mjs";

// the shop tabs (core.js: Hana's market panel; the field's stalls; the Cocoa Room)
const TAB = {seeds: "Hana's market: Seeds", treats: "Hana's market: Treats", deli: "Hana's market: Deli", care: "Hana's market: Care", family: "Hana's market: Gifts", animals: "Hana's market: Animals",
  market: "The Sunday farmers market", night: "The night market", fair: "The field fair", cocoa: "The Cocoa Room"};
const VISITED = {bellbird: "Bellbird Valley", cinque: "Cinque Terre"};
const GROUPS = [
  {id: "seeds", n: "Seeds", icon: "sprout", kinds: ["seed"], line: "Seed packets for the garden and the greenhouse."},
  {id: "food", n: "Crops, food and ingredients", icon: "carrot", kinds: ["food", "ingredient"], line: "What you grow, gather and cook with."},
  {id: "flowers", n: "Flowers", icon: "tulip", kinds: ["flower", "bouquet", "pot"], line: "Cut flowers, bouquets and potted flowers."},
  {id: "gifts", n: "Gifts", icon: "heart", kinds: ["gift"], line: "Presents for your friends and neighbours."},
  {id: "home", n: "Keepsakes and things for home", icon: "lantern", kinds: ["keep", "keepsake", "toy"], line: "For a shelf, the garden or your room."},
  {id: "animals", n: "Pets, animals and pet care", icon: "fox", kinds: ["pet", "feed", "tool", "use"], line: "Animals for the run, their feed, and things for your pet."}
];
const KIND = {seed: "Seeds", food: "Food", ingredient: "Ingredient", flower: "Flower", bouquet: "Bouquet", pot: "Potted flower", gift: "Gift", keep: "For home", keepsake: "Keepsake", toy: "Toy", pet: "Animal", feed: "Feed", tool: "Pet toy", use: "Pet care"};
const HEAD = {food: "Food you grow, gather or make", ingredient: "Ingredients", flower: "Cut flowers", bouquet: "Bouquets", pot: "Potted flowers", gift: "Other gifts", keepsake: "Other keepsakes", keep: "Other things for home", pet: "Other animals", use: "Pet care", tool: "Pet toys", feed: "Feed"};
const SEASON = {spring: "spring", summer: "summer", autumn: "autumn", winter: "winter"};
const clean = s => String(s || "").replace(/\{pet\}/g, "your pet").replace(/\{kind\}/g, "pet").replace(/\{[a-z]+\}/g, "");
const and = a => a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1];

// player-facing items only: a name, and a kind the player sees
// player-facing items: a name and a kind the player sees; things from trips are on each place's page instead
// (ronda.js adds them all to ITEMS), and the delivery placeholders (dlv_) aren't things you hold
const LIST = Object.entries(ITEMS).filter(([id, it]) => it.n && KIND[it.kind] && (BASE[id] || !TOWN_GOODS[id]) && !/^dlv_/.test(id));
function what(id, it){
  if (it.kind === "seed") { const c = CROPS[it.crop]; return [c ? `Grows ${c.ns || c.n.toLowerCase()}` : "", it.greenhouse ? "under glass only, all year" : it.seasons ? "sow in " + and(it.seasons.map(s => SEASON[s] || s)) : ""].filter(Boolean).join(", ") + "."; }
  if (it.what) return clean(it.what);
  if (it.line) return clean(it.line);
  if (it.say) return `<span class="muted">"${esc(clean(it.say))}"</span>`;
  return "";
}
const notes = it => [it.needs === "greenhouse" ? "Once the greenhouse is built" : "", it.visited ? `Once you've been to ${VISITED[it.visited] || it.visited}` : ""].filter(Boolean).join("; ");
const row = ([id, it]) => { const w = what(id, it), at = notes(it);
  return [`<span id="${esc(id)}">${itemIcon(id, 26)}<b>${esc(it.n)}</b></span>${at ? `<br><small>${esc(at)}</small>` : ""}${w ? `<br><small class="muted">${w.startsWith("<") ? w : esc(w)}</small>` : ""}`, it.price ? coin(it.price) : "", it.sell ? coin(it.sell) : ""]; };
const FILTER = `<p><input type="search" class="ifilter" placeholder="Filter this page as you type" aria-label="Filter items" style="width:100%;max-width:360px;padding:8px 14px;border:1px solid var(--edge);border-radius:999px;background:var(--card);color:var(--ink);font:inherit"></p>
<script>(()=>{const q=document.currentScript.previousElementSibling.querySelector("input");q.addEventListener("input",()=>{const v=q.value.trim().toLowerCase();document.querySelectorAll(".main tbody tr").forEach(r=>{r.hidden=!!v&&!r.textContent.toLowerCase().includes(v)});document.querySelectorAll(".main .igroup").forEach(g=>{g.hidden=!!v&&!g.querySelector("tbody tr:not([hidden])")})})})();</script>`;

function groupPage(g){
  const items = LIST.filter(([, it]) => g.kinds.includes(it.kind));
  // within a group, a heading per shop (or per kind, where nothing's sold), in a steady order
  const keyOf = ([id, it]) => /^pp_/.test(id) ? "Handmade paper from your paperie" : /^chz_.*_ex$/.test(id) ? "Excellent cheeses" : it.tab && TAB[it.tab] ? TAB[it.tab] : (HEAD[it.kind] || KIND[it.kind]);
  const keys = [...new Set(items.map(keyOf))].sort((a, b) => (a.startsWith("Hana") ? 0 : a.startsWith("The") ? 1 : 2) - (b.startsWith("Hana") ? 0 : b.startsWith("The") ? 1 : 2) || a.localeCompare(b));
  const html = lede(`${esc(g.line)} ${items.length} in all.`) + FILTER
    + keys.map(k => { const rows = items.filter(x => keyOf(x) === k).sort((a, b) => a[1].n.localeCompare(b[1].n));
      return `<section class="igroup"><h2>${esc(k)}</h2>${table(["Item", "Price", "Sells for"], rows.map(row))}</section>`; }).join("")
    + `<p class="muted">Prices are what the game charges; "Sells for" is what the market's Sell tab pays you (blank: it doesn't buy it). Things from trips are on each place's page in <a href="/trips">Trips</a>.</p>`;
  return {slug: "items/" + g.id, title: g.n, section: "items", hide: true, blurb: g.line, html,
    search: items.map(([id, it]) => ({t: it.n, d: `${KIND[it.kind]}${it.tab && TAB[it.tab] ? ": " + TAB[it.tab] : ""}`, a: `/items/${g.id}#${id}`}))};
}
export const pages = () => {
  const groups = GROUPS.map(g => ({g, p: groupPage(g), count: LIST.filter(([, it]) => g.kinds.includes(it.kind)).length}));
  const index = {slug: "items", title: "Items", section: "items", blurb: `All ${LIST.length} items: seeds, food, flowers, gifts, keepsakes and animals, with prices`,
    html: lede(`Every item in Honeybrook, ${LIST.length} in all: what it is, where to get it, what it costs and what it sells for. Use the search box at the top to jump straight to one.`)
      + `<div class="cards">${groups.map(({g, count}) => card("items/" + g.id, g.n, `${count} items · ${g.line}`, g.icon)).join("")}</div>
      <h2>${ico("market", 22)} Where things are sold</h2>${table(["Shop", "Items"], Object.entries(TAB).map(([k, n]) => [esc(n), LIST.filter(([, it]) => it.tab === k).length]).filter(r => r[1]))}`};
  return [index, ...groups.map(x => x.p)];
};
