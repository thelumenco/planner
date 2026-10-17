// Collections: trophies, the souvenir collections on trips (stamps, ammonites, music boxes, carvings), keepsakes and
// where they go, fridge magnets, and the gift shop's gallery wall. All lists come from the game's data, so they're complete.
import { ITEMS, LEVELS } from "../../src/data/items.js";
import { TOWNS, TOWN_GOODS, TOWN_SCENES, TOWN_PLACES } from "../../src/data/towns.js";
import { reached, LOOKS, PEDESTALS, trophySVG } from "../../src/game/trophies.js";
import { STAMPS as KT_STAMPS } from "../../src/game/kyoto.js";
import { AMMONITES } from "../../src/data/saltwick.js";
import { STAMPS as PI_STAMPS } from "../../src/data/puffin.js";
import { STAMP_PRICE } from "../../src/game/puffin.js";
import { MUSICBOXES } from "../../src/data/hokkaido.js";
import { BOX_PRICE } from "../../src/game/hokkaido.js";
import { CARVINGS, CARVE_DAYS } from "../../src/data/bali.js";
import { CARVE_PRICE } from "../../src/game/bali.js";
import { KEEP_SPOTS } from "../../src/game/companions.js";
import { POOLS } from "../../src/data/stall-goods.js";
import { PAINTERS, MAKERS, TOKEN, FRAMES } from "../../src/game/gallery.js";
import { NPCS } from "../../src/data/npcs.js";
import { esc, table, ico, coin, lede, spoiler } from "../lib.mjs";

const h2 = (id, t, icon) => `<h2 id="${id}">${icon ? ico(icon, 22) + " " : ""}${esc(t)}</h2>`;
const h3 = (id, t) => `<h3 id="${id}">${esc(t)}</h3>`;
const G = id => ITEMS[id] || TOWN_GOODS[id] || {n: id};
const named = (id, size = 24) => `${ico(G(id).ico || id, size)}<b>${esc(G(id).n)}</b>`;
const capF = s => s ? s[0].toUpperCase() + s.slice(1) : s;
const nm = id => (NPCS.find(n => n.id === id) || {name: id}).name;
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
// which town a shop (a room or a place on a town screen) is in
const townOfShop = s => { const t = TOWN_SCENES[s] || (TOWN_PLACES[s] && TOWN_SCENES[TOWN_PLACES[s].scene]); if (t && TOWNS[t]) return TOWNS[t].n; const k = Object.keys(TOWNS).find(id => JSON.stringify(TOWNS[id]).includes(`"${s}"`)); return k ? TOWNS[k].n : ""; };

// every trophy there is: reached() for a save that has done everything
function allTrophies(){
  const days = Array.from({length: 30}, (_, i) => new Date(Date.UTC(2026, 0, 1 + i)).toISOString().slice(0, 10));
  const F = {totalQuests: 1e9, harvestTotal: 1e9, board: {done: 1e9, hearts: Object.fromEntries(NPCS.slice(0, 40).map(n => [n.id, 5]))}, history: Object.fromEntries(days.map(d => [d, {water: 1e9, steps: 1e9}]))};
  return reached({F, levels: LEVELS, levelIndex: LEVELS.length - 1, journal: 1e9, water: 1, steps: 1});
}
const FAM_N = {quests: "Quests done", favours: "Village requests", friends: "Best friends", water: "Water goal streaks", steps: "Step goal streaks", chum: "Your pet's friendship", harvest: "Harvests", journal: "Journal pages"};
const FAM_HOW = {quests: "Your own tasks and village requests, all counted together.", favours: "Requests handed over in person.", friends: "Villagers with all five hearts.", water: "Days in a row of your water goal (set in the settings).",
  steps: "Days in a row of your step goal.", chum: "Each friendship level with your pet.", harvest: "Crops picked from the garden.", journal: "Pages written in your journal (the writing desk in your room)."};

export const pages = () => {
  const tro = allTrophies(), fams = Object.keys(LOOKS);
  const keepsakes = Object.entries(ITEMS).filter(([, it]) => it.kind === "keepsake");
  const sellerOf = id => { for (const [ev, pools] of Object.entries(POOLS)) for (const [who, list] of Object.entries(pools)) if (list.includes(id)) return `${nm(who)}'s stall at the ${ev === "market" ? "Sunday farmers market" : ev === "night" ? "night market" : "fair"}`; return ""; };
  const market = keepsakes.filter(([id]) => /^k_/.test(id) && sellerOf(id)), xmas = keepsakes.filter(([id]) => /^xm_/.test(id)), story = keepsakes.filter(([id]) => /^s_/.test(id));
  const travel = Object.entries(TOWN_GOODS).filter(([, g]) => g.kind === "keepsake" || g.keep);
  const bought = travel.filter(([, g]) => g.price > 0 && g.shop && !g.magnet && townOfShop(g.shop)), magnets = travel.filter(([, g]) => g.magnet);
  const earnedList = travel.filter(([id, g]) => !(g.price > 0) && !g.magnet && !/^(am_|ps_|mb_|bc_)/.test(id)).filter(([, g], i, a) => a.findIndex(([, x]) => x.n === g.n) === i);
  const html = lede("Things to collect in Honeybrook: trophies for your milestones, souvenir sets from your travels, keepsakes for the shelves at home and in your shops, fridge magnets, and paintings on the gift shop's gallery wall.")
  + `<div class="cards" style="grid-template-columns:repeat(auto-fill,minmax(150px,1fr))">${[["trophies", "Trophies", "sparkle"], ["stamp-book", "Kyoto stamp book", "sakura"], ["ammonites", "Ammonites", "s_case"], ["puffin-stamps", "Puffin stamps", "p_stamps"], ["music-boxes", "Music boxes", "h_boxes"], ["carvings", "Carved animals", "b_ark"], ["keepsakes", "Keepsakes", "k_snowglobe"], ["fridge-magnets", "Fridge magnets", "iman"], ["gallery-wall", "Gallery wall", "painting"]]
    .map(([a, t, i]) => `<a class="card" href="#${a}">${ico(i, 28)}<span><b>${esc(t)}</b></span></a>`).join("")}</div>`
  + h2("trophies", "Trophies", "sparkle")
  + `<p>Milestones earn trophies, kept in the courtyard through the archway in the town hall. The newest ${PEDESTALS} stand on pedestals; when they're full, the oldest moves into the trophy book on the lectern, with a page each saying what it was for and when. Each kind of milestone has its own trophy, with the number on its plinth.</p>`
  + table(["", "Trophy", "Milestones"], fams.map(f => { const list = tro.filter(t => t.fam === f), last = list[list.length - 1] || {fam: f, short: ""};
    return [trophySVG(last, 40), `<b>${esc(FAM_N[f] || f)}</b><br><small class="muted">${esc(FAM_HOW[f] || "")}</small>`, esc(list.map(t => f === "chum" ? t.label.replace("Friendship: ", "") : /d$/.test(t.short) ? t.n + " days" : t.short).join(", "))]; }))
  + h2("souvenir-sets", "Souvenir sets from your travels", "kite")
  + `<p>Some places you visit have a set to collect. Finish a set and it becomes something special for home. See <a href="/trips">Trips</a> and <a href="/islands">Islands</a>.</p>`
  + h3("stamp-book", "The Kyoto stamp book") + `<p>Collect a stamp at each of these places in <a href="/trips/kyoto">Kyoto</a>. A full book puts a stone lantern by the pond at home.</p>`
    + table(["Stamp"], Object.values(KT_STAMPS).map(([n, col]) => [`<span style="display:inline-block;width:14px;height:14px;border-radius:3px;background:${esc(col)};vertical-align:-2px;margin-right:8px"></span>${esc(n)}`]))
  + h3("ammonites", "Ammonites from Saltwick") + `<p>Split stones on the scar at <a href="/trips/saltwick">Saltwick Harbour</a>: three a day, and a stone may hold an ammonite you haven't found yet. All six go into ${named("s_case", 22)}.</p>`
    + table(["Ammonite", ""], Object.keys(AMMONITES).map(k => [named("am_" + k), esc(capF(AMMONITES[k][1]))]))
  + h3("puffin-stamps", "Puffin stamps") + `<p>The island post office on <a href="/trips/puffin">Puffin Isle</a> sells one stamp a month in season (${coin(STAMP_PRICE)} each). All five are framed as ${named("p_stamps", 22)}.</p>`
    + table(["Stamp", ""], Object.keys(PI_STAMPS).map(k => [named("ps_" + k), esc(capF(PI_STAMPS[k][1]))]))
  + h3("music-boxes", "Music boxes from Otaru") + `<p>The music box hall in <a href="/trips/hokkaido">Hokkaido</a> has a box for each season (${coin(BOX_PRICE)} each), one for the season you're in. Collect all four for ${named("h_boxes", 22)}: they all play together at home.</p>`
    + table(["Season", "Music box", ""], Object.entries(MUSICBOXES).map(([s, [n, what]]) => [esc(s[0].toUpperCase() + s.slice(1)), named("mb_" + s), esc(capF(what))]))
  + h3("carvings", "Carved animals from Ubud") + `<p>At the market in <a href="/trips/bali">Bali</a>, Pak Gede carves a different animal each day of the week (${coin(CARVE_PRICE)} each). All seven make ${named("b_ark", 22)}.</p>`
    + table(["Day", "Carving", ""], CARVE_DAYS.map((k, d) => [DAYS[d], named("bc_" + k), esc(capF(CARVINGS[k]))]))
  + h2("keepsakes", "Keepsakes", "k_snowglobe")
  + `<p>Keepsakes are little things to put on a shelf. Tap one in your backpack to choose where it goes; putting one where another stands sends the old one back to your backpack, and a placed one can be taken down again. Souvenirs you've chosen to keep can go up too.</p>
  <p><b>Shelves:</b> ${esc(Object.values(KEEP_SPOTS).filter(s => !s.only).map(s => s.n).join("; "))}. Fridge magnets go on the fridge at home (${Object.values(KEEP_SPOTS).filter(s => s.only).length} spots).</p>`
  + h3("market-keepsakes", "From the markets") + table(["Keepsake", "Price", "Where"], market.map(([id, it]) => [named(id), coin(it.price), esc(sellerOf(id))]))
  + h3("christmas-keepsakes", "Christmas") + table(["Keepsake", "How"], xmas.map(([id, it]) => [named(id), it.price ? `${coin(it.price)} at the Christmas market` : esc(id === "xm_santaphoto" ? "A visit to Santa's grotto" : id === "xm_lantern" ? "The Christmas Eve lantern walk" : "")]))
  + h3("travel-keepsakes", "Bought on your travels") + table(["Keepsake", "Price", "Where"], bought.map(([id, g]) => [named(id), coin(g.price), esc(townOfShop(g.shop))]))
  + h3("earned-keepsakes", "Earned on your travels") + `<p>These come from doing things on trips (a lesson, a game, a set finished), not from shops.</p>` + spoiler("Show the list", table(["Keepsake", ""], earnedList.map(([id, g]) => [named(id), esc(g.line || "")])))
  + (story.length ? h3("story-keepsakes", "From villagers' stories") + spoiler("Story keepsakes", table(["Keepsake"], story.map(([id]) => [named(id)]))) : "")
  + h2("fridge-magnets", "Fridge magnets", "iman")
  + `<p>A magnet from each place, ${coin(3)} each, for the fridge at home (or give one as a present).</p>`
  + table(["Magnet", "Where"], magnets.map(([id, g]) => [named(id), esc(g.n.replace(/ fridge magnet$/, ""))]))
  + h2("gallery-wall", "The gallery wall", "painting")
  + `<p>The <a href="/gift-shop">gift shop</a> has ${FRAMES} frames between its windows. Local painters bring a new painting on Mondays to fill an empty frame. When one sells, you keep a token ${coin(TOKEN)} and the rest goes to the painter, who writes to you about it a week later. You can hang your own sip-and-paint paintings there too: never for sale, and they come down whenever you like.</p>`
  + table(["Painter", "Paints", "Paintings"], Object.values(PAINTERS).map(p => [`<b>${esc(p.name)}</b>`, esc(p.what), p.works.map(w => `${esc(w[0])} ${coin(w[1])}`).join("<br>")]))
  + h3("makers-shelf", "The makers' shelf") + `<p>Villagers' handmade things, on sale in the gift shop and topped up on Mondays. You keep about a fifth of each sale; buy one yourself and it all goes to the maker.</p>`
  + table(["Maker", "What"], Object.values(MAKERS).map(m => [esc(m.name), named(m.item)]))
  + h2("more-collections", "More to collect", "bag")
  + `<ul class="plain"><li>The wine wall at the cellar door keeps a bottle of every wine you've made (see <a href="/vineyard-and-wine">Vineyard and wine</a>).</li>
    <li>Every new gelato flavour and mulled wine mix you discover is named and kept, to make again (see <a href="/scoop-shack">Scoop Shack</a> and <a href="/kitchen-and-tapas">Kitchen and tapas</a>).</li>
    <li>Villagers' stories are kept chapter by chapter in the friends panel's Stories tab (see <a href="/hearts-and-gifts">Hearts and gifts</a>).</li></ul>`;
  const search = [{t: "Trophies", d: "Milestones in the town hall courtyard", a: "/collections#trophies"}, {t: "Trophy book", d: "Older trophies", a: "/collections#trophies"},
    {t: "Kyoto stamp book", d: "Eight stamps, then a lantern at home", a: "/collections#stamp-book"}, {t: "Ammonites", d: "Six from Saltwick's scar", a: "/collections#ammonites"},
    {t: "Puffin stamps", d: "Five from Puffin Isle", a: "/collections#puffin-stamps"}, {t: "Music boxes", d: "Four from Otaru", a: "/collections#music-boxes"}, {t: "Carved animals", d: "Seven from Ubud", a: "/collections#carvings"},
    {t: "Keepsakes", d: "Things for your shelves", a: "/collections#keepsakes"}, {t: "Fridge magnets", d: "One from each place", a: "/collections#fridge-magnets"}, {t: "Gallery wall", d: "Paintings in the gift shop", a: "/collections#gallery-wall"},
    {t: "Makers' shelf", d: "Handmade things in the gift shop", a: "/collections#makers-shelf"},
    ...market.map(([id, it]) => ({t: it.n, d: "A keepsake", a: "/collections#market-keepsakes"})), ...xmas.map(([id, it]) => ({t: it.n, d: "A Christmas keepsake", a: "/collections#christmas-keepsakes"})),
    ...Object.values(PAINTERS).flatMap(p => p.works.map(w => ({t: w[0], d: `A painting by ${p.name}`, a: "/collections#gallery-wall"})))];
  return [{slug: "collections", title: "Collections", section: "collections", blurb: "Trophies, souvenir sets, keepsakes, fridge magnets and the gallery wall", html, search}];
};
