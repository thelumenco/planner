// Trips and islands: how day trips work (the train, the ferry, your own boat, the campervan), a page for every town
// and Bellbird Valley stop (from data/towns.js and the per-region files), and the islands by ferry.
import { TOWNS, TOWN_GOODS, TOWN_PLACES, TASTINGS, TILES, PAINT, townOf } from "../../src/data/towns.js";
import { NPCS } from "../../src/data/npcs.js";
import { ITEMS } from "../../src/data/items.js";
import { BB_NAMES, REGION_N, REGIONS } from "../../src/data/bellbird.js";
import { CR_NAMES } from "../../src/data/coast.js";
import { TL_NAMES } from "../../src/data/tablelands.js";
import { LV_NAMES } from "../../src/data/lavender.js";
import { TAPAS, SPECIALS, needText } from "../../src/game/kitchen.js";
import { TRIP_HEARTS } from "../../src/game/quests.js";
import { VAN_SEATS, LEG, legs } from "../../src/game/bellbird.js";
import { GOALS } from "../../src/game/goals.js";
import { POSTAGE } from "../../src/game/contacts.js";
import { PEN_LV } from "../../src/data/pen-lv.js";
import { PEN_BB } from "../../src/data/pen-bb.js";
import { PEN_CR } from "../../src/data/pen-cr.js";
import { PEN_TL } from "../../src/data/pen-tl.js";
import { PEN_OD } from "../../src/data/pen-od.js";
import { PEN_RK } from "../../src/data/pen-rk.js";
import { PEN_JC } from "../../src/data/pen-jc.js";
import { PEN_SW } from "../../src/data/pen-sw.js";
import { PEN_PI } from "../../src/data/pen-pi.js";
import { PEN_HK } from "../../src/data/pen-hk.js";
import { PEN_BL } from "../../src/data/pen-bl.js";
import { esc, table, ico, itemIcon, coin, hm, lede, card, link } from "../lib.mjs";

const PEN = {...PEN_LV, ...PEN_BB, ...PEN_CR, ...PEN_TL, ...PEN_OD, ...PEN_RK, ...PEN_JC, ...PEN_SW, ...PEN_PI, ...PEN_HK, ...PEN_BL};
const LIVE = Object.entries(TOWNS).filter(([, t]) => !t.soon);
const TRAIN = LIVE.filter(([, t]) => t.by === "train"), FERRY = LIVE.filter(([, t]) => t.ferry), VAN = LIVE.filter(([, t]) => t.by === "van");
const ISLES = LIVE.filter(([, t]) => t.by === "ferry");
// the screens' names, as the game shows them on the map (core.js), and the Bellbird Valley stops' (the region files)
const SCREEN = {ct_vernazza: "Vernazza", ct_corniglia: "Corniglia", ct_monterosso: "Monterosso", ct_manarola: "Manarola", ba_seminyak: "Seminyak", ba_ubud: "Ubud", ba_tegallalang: "Tegallalang", ba_uluwatu: "Uluwatu",
  hk_otaru: "Otaru", hk_sapporo: "Sapporo", hk_niseko: "Niseko", hk_furano: "Furano", pi_landing: "The landing", pi_village: "The village", pi_lighthouse: "The lighthouse", pi_cliffs: "The cliffs",
  sw_harbour: "The harbour", sw_wynds: "The wynds", sw_beach: "The beach", sw_clifftop: "The clifftop", jj_shore: "Seongsan", jj_farms: "The tangerine farms", jj_harbour: "The harbour", jj_village: "The stone village",
  kt_station: "The station", kt_lane: "Higashiyama", kt_temple: "The temple", kt_river: "The river", rd_station: "The station", rd_plaza: "The plaza", rd_bridge: "Puente Nuevo", rd_old: "The old town", ...BB_NAMES, ...CR_NAMES, ...TL_NAMES, ...LV_NAMES};
// Ronda has no hints in its town data: these are the map's own (core.js)
const HINTS = {rd_station: "Ronda's station (trains home till 10pm) and the Alameda balcony over the valley. East: the plaza. South: steps down into the gorge.",
  rd_plaza: "The plaza: the market, the tapas bar, Doña Carmen's sweets. West: the station. South: over Puente Nuevo.",
  rd_bridge: "Puente Nuevo over the gorge, the viewpoint and the Moorish garden. North: back over the bridge. West: the old town.",
  rd_old: "La Ciudad: the convent hatch, the tile shop, the Arab baths. North: the gorge steps up to the station. East: the bridge."};
// Ronda's shopping corners (round 118: spices and ceramics at the market, postcards and fans at Doña Carmen's)
const CORNER = {especias: ["ronda", "The covered market (the spice corner)"], ceramica: ["ronda", "The covered market (the ceramics)"], postales: ["ronda", "Doña Carmen's café (the postcards)"]};
// things to join in with, from each town's game code (game/ronda.js, kyoto.js, jeju.js, cinque.js, bbacts.js,
// cracts.js, tlacts.js, lvacts.js and the islands' files)
export const ACTS = {
  ronda: ["Taste a little plate at the tapas bar: once you've tried it there, it's yours to cook at home.", "Collect Lucía's eight painted tiles (some only in season): the full set becomes a tiled bench by the pond at home.", `Paint a tile of your own at Lucía's: a colour and a pattern, four strokes, fired in her kiln (${PAINT.price} coins).`, "Knock at the convent hatch, and the nuns pass out biscuits.", "Take a picnic basket from the market to the Alameda balcony.", "Once Rafael trusts you, he sells Tempranillo vine cuttings at his stall."],
  kyoto: ["The tea ceremony with Sachiko: whisk in time with her, then turn the bowl and bow.", "Meditation with Jōshin in the temple hall: breathe with the circle, then he rings the bell.", "Make a nerikiri sweet with Mr Tanaka: pick the season's shape, in four steps.", "Throw a cup at Ishida's wheel in the pottery: centre the clay three times.", "Hire a yukata for the day at the yukata shop.", "The stamp book: eight ink stamps from round the town. A full book puts a stone lantern by the pond at home."],
  jeju: ["The divers' breath song with Halmang Kim: dive, hold, and come up whistling while the depth is in the green. Three dives.", "Sort tangerines with Mr Ko: small, medium or large, against his clock.", "Dye a scarf with green persimmons at Mr Moon's: four steps in order, then it hangs on your own washing line at home and darkens in the sun over three days.", "The café's drinks, and abalone porridge at the divers' house.", "The slow-post box at the market: a postcard to yourself that arrives two weeks later."],
  cinque: ["Pesto with Nonna Pina: the five ingredients in the right order, pounding each one in. Two jars, and after that you can make it at home in the loft.", "The harvest on the monorail with Signor Bruno: ride up the terraces, pick the ripe bunches and leave the green. He shows you how to dry grapes in your drying loft at home (up the ladder in the barrel shed): for raisin wine, or kept as raisins for rum and raisin at the Scoop Shack.", "Paint a fishing boat with the fishermen in Manarola: hull, stripe and a name. A model to keep, and the same boat turns up by the jetty at home.", "Gelato, focaccia and farinata, a tasting at the cantina, and a padlock."],
  saltwick: ["Fossil hunting on the scar: three stones a day. Find all six ammonites and they go in a glass case.", "Crabbing off the harbour wall: pull up just after the twitch. Three crabs earns your own line.", "A proper pot of tea with Nell: five steps in order, and a Saltwick mug.", "Light the lighthouse lamp with Alfie at dusk: a page from his ledger.", "Sailor's dark rum at Walter's chandlery (15 coins). With raisins from your drying loft it makes rum and raisin at the Scoop Shack."],
  puffin: ["The count in the bird hide: puffins, or seals and pups out of season. Five right earns a volunteer's badge.", "Read the weather in the lamp room: three right in a row earns Morwenna's storm glass.", "Sea glass in the cove (once a day), and a pendant at the post office's workbench.", "The puffin stamps: one a month in season, five framed."],
  hokkaido: ["Blow a glass float at the glassworks (one a day).", "A music box for each season at the music box hall: all four play together.", "The beer tour and tasting at the beer factory: match three beers.", "A ski lesson, December to March: a first ski pass.", "Carving at the snow festival in February.", "The foot bath."],
  bali: ["A canang sari with Ibu Sari: each colour to its compass point.", "A gamelan lesson: play back three patterns for a little gong.", "A silver ring with Wayan.", "Pak Gede's carved animal of the day: collect seven for a shelf.", "The kecak fire dance at sunset.", "The jungle swing, and the monkeys (who sometimes take your sunglasses)."],
  bv_gate: ["Rummage in the op shop at the church hall: second-hand treasures, open till five."],
  bv_lookout: ["A balloon ride with Gus, at dawn (6 to 9) or the golden hour (5 to 7): burner and drift to the right height for each sight, and land gently. A flight certificate to keep."],
  bv_cellar: ["Riddling in the barrel cave with Jono: give every bottle its quarter turn till the chalk marks all point up. A riddling rack goes up in your wine cellar at home."],
  bv_berry: ["Pick your own: the red berries, not the white ones (raspberries and strawberries, once a day).", "Dip strawberries in Sophie's chocolate: dark, milk or white, and sprinkles. A box to give."],
  bv_creek: ["Bottle-feed a joey with Kim at the wildlife hospital. After three feeds, on three days, Pip's strong enough to go back to the bush."],
  bv_camp: ["A canoe down the river with Bodhi: left, right, left, right to go straight, and a kingfisher at the bend.", "Marshmallows at the campfire with the neighbours, from 5pm: take it out when it's golden, not black."],
  bv_breakwater: ["A surf lesson with Jet: paddle, and pop up as the wave lifts you. A photo of your first wave to keep."],
  bv_lighthouse: ["Whale watching from the lighthouse balcony: humpbacks May to November, dolphins the rest of the year. A sighting card the first time."],
  bv_gully: ["Glow-worms in the grotto, from 6pm: torches off, wait for your eyes, then count the little lights."],
  bv_harbour: ["Cray pots with Mags, mornings: keep the big ones, throw back the little ones and the females carrying eggs. Two crayfish to take home, once a day."],
  bv_sisters: ["The penguin parade from the hide, 6 to 9pm: stay very still and very quiet."],
  bv_cove: ["Coach Dimi's grown-ups' surf club morning: a beach sprint, round the buoy and back, and a dive for the flags. A medal the first time.", "The king parrots, with a scoop of seed from the park store."],
  bv_falls: ["A swim in the falls (8 to 5): swim to the falls, float, duck under the veil of water, and get out before you're too cold to talk."],
  bv_crater: ["A kayak round the lake from Lachlan's boat shed: steer towards whatever shows itself (turtles, ducklings, a kingfisher)."],
  bv_town: ["The platypus, from the platform over the creek: rings on the water mean look. Better at dawn and dusk."],
  bv_dairy: ["Bottle-feed the calves with Noah: the hungriest first.", "The milking (2:30 to 5): the cows come in by ear tag, lowest first. Once a day Bill sends you off with two bottles of milk.", "Meg's cheese lesson: then her Tableland havarti is yours to make at home, in Elena's cheese press."],
  bv_nuts: ["Shake a macadamia tree with Pete: gentle shakes bring down the ripe ones. A bag of nuts once a day."],
  bv_gold: ["Gold panning (you need a pan from Dot's): scoop, swirl four times, tip, look for the glint. Your first fleck goes in a tiny bottle.", "The steam train (9 to 4): pull the whistle at the crossings. A punched ticket the first time."],
  bv_lavender: ["The lavender harvest with Émile: cut only the bushes in full flower, then into the still. Two bunches to take home, once a day."],
  bv_hilltown: ["Pétanque with Monsieur Pagnol in the square: short, middle or long, to land nearest the jack.", `The empty shop with the green door can become your own paperie (${GOALS.paperie.price.toLocaleString("en-GB")} coins), and Lise can keep it open for you (${GOALS.paperkeeper.price} coins).`],
  bv_perfume: ["Blend a perfume at Madame Arnaud's organ: a top note, a heart note and a base note. Your first is bottled for you to keep."],
  bv_honey: ["The hives with Mathis: a puff of smoke before you lift each frame. A jar of sunflower honey once a day.", "The sunflower maze: a certificate the first time you find the middle."],
  bv_bridge: ["Pooh-sticks off the Old Bridge: best of three against Theo."],
  bv_chapel: ["Light a candle in the chapel, and from half past five ring the bell for the sunset. A little brass bell to keep, the first time.", "Céline's banon lesson: then it's yours to make at home in Elena's cheese press."]
};
// a Bellbird Valley region's specials are listed under this key in kitchen.js
const SPECIAL_KEY = {vines: "bellbird", coast: "coast", tablelands: "tablelands", lavender: "lavender"};
const KIND = {ingredient: "Ingredient", gift: "Gift", keepsake: "Keepsake", food: "Food", picnic: "Picnic"};

const cap = s => s ? s[0].toUpperCase() + s.slice(1) : "";
const andList = a => a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1];
const slug = id => "trips/" + id;
const regionN = t => REGION_N[t.region] || "";
const howN = t => t.by === "van" ? `Bellbird Valley by campervan (${regionN(t)})` : t.by === "ferry" ? "By ferry" : t.ferry ? "By train or ferry" : "By train";
const sub = (id, t) => t.by === "van" ? regionN(t) : t.by === "ferry" ? `Ferry ${t.ferry.fare} coins` : `Train ${t.fare} coins` + (t.ferry ? `, ferry ${t.ferry.fare}` : "");
const tIcon = t => t.by === "van" ? "b_koala" : t.by === "ferry" ? "water" : "xm_train";

// where a town good is sold: [town, shop name]
function shopOf(g){
  if (!g.shop) return null; if (CORNER[g.shop]) return CORNER[g.shop];
  const p = TOWN_PLACES[g.shop]; if (p) return [townOf(p.scene), p.name];
  const town = townOf(g.shop); return town ? [town, ((TOWNS[town].rooms || {})[g.shop] || {}).n || g.shop] : null;
}
const goodsOf = id => Object.entries(TOWN_GOODS).filter(([, g]) => { const s = shopOf(g); return s && s[0] === id && g.price > 0; });
const goodWhat = g => (g.what || g.line || g.say || "").replace(/\{[a-z]+\}/g, "");
// local people: by the town their routine keeps them in (Bellbird Valley's are all local: "bellbird")
function peopleOf(id){
  return NPCS.filter(n => n.local && !n.tourist).filter(n => { if (n.local === id) return true; if (TOWNS[n.local] || !(n.routine || []).length) return false;
    const c = {}; n.routine.forEach(s => { const t = townOf(s.scene); if (t) c[t] = (c[t] || 0) + (s.to - s.from); });
    const top = Object.entries(c).sort((a, b) => b[1] - a[1])[0]; return top && top[0] === id; });
}
const whereOf = n => [...new Set((n.routine || []).map(s => (TOWN_PLACES[s.scene] && TOWN_PLACES[s.scene].name) || (TOWNS[townOf(s.scene)] && (TOWNS[townOf(s.scene)].rooms || {})[s.scene] && TOWNS[townOf(s.scene)].rooms[s.scene].n) || SCREEN[s.scene]).filter(Boolean))];
const postOf = (id, t) => POSTAGE[t.by === "van" ? (t.region === "vines" ? "bellbird" : t.region) : id];
const nameOfItem = i => (ITEMS[i] && ITEMS[i].n) || (TOWN_GOODS[i] && TOWN_GOODS[i].n) || "";

function getThere(id, t){
  const rows = [];
  if (t.by === "train") rows.push([`${ico("xm_train", 22)}<b>Train</b><br><small class="muted">from Honeybrook station</small>`, `${coin(t.fare)} return, each<br><small class="muted">Out ${hm(t.outFrom)} to ${hm(t.outTo)} · last train home ${hm(t.backTo)}</small>`]);
  if (t.ferry) rows.push([`${ico("water", 22)}<b>Ferry</b><br><small class="muted">from the foreshore jetty</small>`, `${coin(t.ferry.fare)} return, each<br><small class="muted">Out ${hm(t.outFrom)} to ${hm(t.outTo)} · last boat home ${hm(t.backTo)}${t.ferry.dry ? " · no crossing on a rainy day" : ""}</small>`]);
  if (t.boat) rows.push([`${ico("c_boat", 22)}<b>Your own boat</b><br><small class="muted">from the jetty</small>`, `${coin(t.boat.fuel)} of fuel, however many come<br><small class="muted">Set off ${hm(t.outFrom)} to ${hm(t.outTo)} · up to ${t.boat.max} friends aboard · dry days only</small>`]);
  if (t.by === "van") { const n = legs("home", id); rows.push([`${ico("b_koala", 22)}<b>Campervan</b><br><small class="muted">from the cottage lane</small>`, `${coin(n*LEG)} of fuel on your own (${n} leg${n === 1 ? "" : "s"} from home), plus ${coin(n)} for each friend<br><small class="muted">Set off ${hm(t.outFrom)} to ${hm(t.outTo)} · home by ${hm(t.backTo)}</small>`]); }
  return table(["How", "Fare and times"], rows);
}
function specialsOf(id, t){
  const key = t.by === "van" ? SPECIAL_KEY[t.region] : id, ids = Object.keys(SPECIALS).filter(k => SPECIALS[k][0] === key && TAPAS[k]);
  if (!ids.length) return "";
  const note = id === "ronda" ? "Taste each one at the tapas bar first; then it's on the Specials tab at your kitchen's stove." : t.by === "van" ? `On the Specials tab at your kitchen's stove once you've been to any stop in ${esc(regionN(t))}.` : `On the Specials tab at your kitchen's stove once you've been to ${esc(t.n)}.`;
  return `<h2>${ico("bowl", 22)} Kitchen specials</h2><p>${note} Six plates a batch. See <a href="/kitchen-and-tapas">the kitchen and tapas</a>.</p>`
    + table(["Dish", "You need", "A plate"], ids.map(k => [`<b>${esc(TAPAS[k].n)}</b>`, esc(needText(TAPAS[k].need)), coin(TAPAS[k].price)]));
}
function ronda(){
  return `<h2>${ico("chat", 22)} Tastings at the tapas bar</h2>${table(["Tasting", "Price", ""], Object.entries(TASTINGS).map(([k, x]) => [`<b>${esc((TAPAS[k] || {}).n || k)}</b>`, coin(x.price), `<span class="muted">${esc(x.line)}</span>`]))}
    <h2>${ico("painting", 22)} Lucía's painted tiles</h2><p>Eight tiles to collect. The full set becomes a tiled bench by the pond at home.</p>${table(["Tile", "Price", "When"], Object.values(TILES).map(x => [`<b>${esc(x.n)}</b>`, coin(x.price), x.seasons ? cap(andList(x.seasons)) + " only" : "All year"]))}
    <p class="muted">Paint your own for ${coin(PAINT.price)}: ${esc(andList(Object.values(PAINT.colours).map(c => c[0])))}, with ${esc(andList(Object.values(PAINT.patterns)))}.</p>`;
}
function page(id, t){
  const goods = goodsOf(id), folk = peopleOf(id), pens = folk.filter(n => PEN[n.id]), rooms = Object.values(t.rooms || {}), hints = t.hints || (id === "ronda" ? HINTS : null);
  const places = Object.entries(TOWN_PLACES).filter(([k, p]) => t.screens.includes(p.scene) && !p.bridge && t.say && t.say[k]);
  const html = `<div class="hero">${ico(tIcon(t), 48)}<div>${lede(esc(t.blurb))}<p class="muted" style="margin:0">${esc(howN(t))} · ${link("trips", "How trips work")}${t.by === "ferry" ? " · " + link("islands", "The islands") : ""}</p></div></div>
    ${t.arriveLine ? `<blockquote class="box">${esc(t.arriveLine)}</blockquote>` : ""}
    <h2>${ico("steps", 22)} Getting there</h2>${getThere(id, t)}
    <p class="muted">One day trip a day, there and back: you're always home the same night. Friends at ${TRIP_HEARTS} hearts can come along${t.by === "van" ? ` (the van seats ${VAN_SEATS}, you included)` : ""}.</p>
    ${hints ? `<h2>${ico("eyes", 22)} Around ${t.by === "van" ? "the stop" : "town"}</h2>${table(["Where", "What's there"], t.screens.filter(s => hints[s]).map(s => [`<b>${esc(SCREEN[s] || s)}</b>`, esc(hints[s])]))}` : ""}
    ${ACTS[id] ? `<h2>${ico("sparkle", 22)} Things to do</h2><ul class="plain">${ACTS[id].map(a => `<li>${esc(a)}</li>`).join("")}</ul>` : ""}
    ${rooms.length ? `<h2>${ico("home", 22)} Inside</h2>${table(["Room", ""], rooms.map(r => [`<b>${esc(r.n)}</b>`, `<span class="muted">${esc(r.say)}</span>`]))}` : ""}
    ${places.length ? `<h2>${ico("walker", 22)} Places</h2>${table(["Place", ""], places.map(([k, p]) => [`<b>${esc(p.name)}</b>`, `<span class="muted">${esc(t.say[k])}</span>`]))}` : ""}
    ${id === "ronda" ? ronda() : ""}
    ${goods.length ? `<h2>${ico("market", 22)} Things to buy</h2>${table(["Item", "Buy", "Sell"], goods.map(([k, g]) => { const s = shopOf(g); return [`<span id="${esc(k)}">${itemIcon(k, 24)}<b>${esc(g.n)}</b></span> <span class="tag">${esc(KIND[g.kind] || cap(g.kind))}</span><br><small>${esc(s[1])}</small>${goodWhat(g) ? `<br><small class="muted">${esc(goodWhat(g))}</small>` : ""}`, coin(g.price), g.sell ? coin(g.sell) : `<span class="muted">no</span>`]; }))}<p class="muted">Ingredients go to your kitchen, the gelato fridge and the Cocoa Room's fillings like anything else. Gifts can go to any villager; keepsakes go on a shelf at home.</p>` : ""}
    ${specialsOf(id, t)}
    ${folk.length ? `<h2>${ico("heart", 22)} People you'll meet</h2>${table(["Who", "", "Where"], folk.map(n => [`<b>${esc(n.name)}</b>`, esc(n.job || ""), esc(whereOf(n).join(", "))]))}<p class="muted">The visitors and day-trippers about town aren't listed: they're just passing through, like you.</p>` : ""}
    ${pens.length ? `<h2>${ico("letter", 22)} Pen friends</h2><p>Anyone you've met here (not the day-trippers) can go in your address book. Post them a gift or a letter and they write back in a day or so; a parcel to ${esc(t.by === "van" ? regionN(t) : t.n)} costs ${coin(postOf(id, t) || 4)} in postage, a letter is free.</p>${table(["Who", "Signs off", "Now and then tucks in"], pens.map(n => { const p = PEN[n.id], b = p.back && nameOfItem(p.back); return [`<b>${esc(n.name)}</b>`, `<span class="muted">${esc(p.sign || "")}</span>`, b ? itemIcon(p.back, 20) + esc(b) : `<span class="muted">just the letter</span>`]; }))}` : ""}`;
  return {slug: slug(id), title: t.n, section: "trips", hide: true, blurb: t.blurb, html,
    search: [{t: t.n, d: howN(t), a: "/" + slug(id)}, ...goods.map(([k, g]) => ({t: g.n, d: `Sold in ${t.n}`, a: `/${slug(id)}#${k}`})), ...folk.map(n => ({t: n.name, d: `${n.job || "Lives"} (${t.n})`, a: "/" + slug(id)}))]};
}

function tripsPage(){
  const trainRows = TRAIN.map(([id, t]) => [link(slug(id), esc(t.n)), coin(t.fare), `${hm(t.outFrom)} to ${hm(t.outTo)}`, hm(t.backTo)]);
  const ferryRows = FERRY.map(([id, t]) => [link(slug(id), esc(t.n)), coin(t.ferry.fare), `${hm(t.outFrom)} to ${hm(t.outTo)}`, hm(t.backTo), t.ferry.dry ? "Dry days only" : ""]);
  const boatRows = LIVE.filter(([, t]) => t.boat).map(([id, t]) => [link(slug(id), esc(t.n)), coin(t.boat.fuel), `Up to ${t.boat.max}`]);
  const regionCards = REGIONS.map(r => { const stops = VAN.filter(([, t]) => t.region === r); return stops.length ? `<h3>${esc(REGION_N[r])}</h3><div class="cards">${stops.map(([id, t]) => card(slug(id), t.n, `${legs("home", id)} leg${legs("home", id) === 1 ? "" : "s"} from home`, null)).join("")}</div>` : ""; }).join("");
  const html = lede(`A day out from Honeybrook: a white town on a cliff, an old capital, islands across the sea, or a whole valley by campervan. Every trip is a day trip, there and back, so you're always home in your own bed.`)
    + `<h2>${ico("sparkle", 22)} The rules of a day trip</h2><ul class="plain">
      <li><b>One trip a day.</b> Once you've been somewhere today, the next trip is tomorrow.</li>
      <li><b>Who can come:</b> any villager at ${TRIP_HEARTS} hearts. They take the day off from whatever they usually do and follow you round, settling at their favourite spots (and some do things there they do nowhere else). Your pet rides in your bag, free. See <a href="/hearts-and-gifts">Hearts and gifts</a>.</li>
      <li><b>Fares are per person:</b> a ticket for you and one for each friend, return.</li>
      <li><b>Leaving and coming home:</b> each place has a window for setting off and a time for the last train or boat home. Come home whenever you like before that; the trip ends when you're home, at the last train, or at midnight.</li>
      <li><b>Rain:</b> the little island boat to Puffin Isle stays in while it's raining, and so does your own boat.</li></ul>
    <h2>${ico("xm_train", 22)} By train, from Honeybrook station</h2><p>The ticket window at Honeybrook station, on the cottage lane. Pick a town, pick who's coming, and buy the tickets.</p>
    ${table(["Town", "Return fare", "Trains out", "Last train home"], trainRows)}
    <h2>${ico("water", 22)} By ferry, from the foreshore jetty</h2><p>The ferry leaves from the jetty on the foreshore and brings you back to it. Jeju has both: over the sea bridge by train, or the slower crossing by ferry (there are dolphins), and you can come home either way.</p>
    ${table(["Where", "Return fare", "Boats out", "Last boat home", ""], ferryRows)}
    <h2>${ico("c_boat", 22)} Your own boat</h2><p>Save up for the ${esc(GOALS.boat.n.toLowerCase())} (${coin(GOALS.boat.price)}), moored at the end of the jetty. Take your friends on a dolphin cruise up the coast, or sail to an island with a mooring: you pay for the fuel, however many come, and your friends ride free. Daylight and dry days only ("Not in this weather. The harbour master would have words.").</p>
    ${table(["Island", "Fuel", "Friends aboard"], boatRows)}
    <h2>${ico("b_koala", 22)} Bellbird Valley, by campervan</h2><p>Save up for the ${esc(GOALS.van.n.toLowerCase())} (${coin(GOALS.van.price)}), parked at its spot on the cottage lane. Open the road map on the dashboard: pick who's coming (${VAN_SEATS} seats, you included) and a stop, and off you drive. At each stop, tap the van to drive on to another stop or head home.</p>
    <ul class="plain"><li><b>Fuel:</b> ${LEG} coins a leg, plus 1 a leg for each friend, along the shortest way.</li><li><b>Times:</b> set off between ${hm(VAN[0][1].outFrom)} and ${hm(VAN[0][1].outTo)}; home by ${hm(VAN[0][1].backTo)}.</li>
      <li><b>The map</b> only shows what you've found: the stops you've been to, and the ones a road away from them. Valley Gate is there from the start.</li><li><b>The passport:</b> a stamp for every stop, ${VAN.length} in all, across ${andList(REGIONS.map(r => REGION_N[r]))}.</li></ul>
    <h2>${ico("letter", 22)} Pen friends</h2><p>People you meet on your travels (not the day-trippers) can go in your address book. Post them a gift (postage by how far: ${coin(2)} to ${coin(8)}) or a letter (free), and they write back in their own voice, now and then with a little something from home tucked in. Each place's page lists who writes back.</p>
    <h2>${ico("kite", 22)} Where to go</h2><h3>By train</h3><div class="cards">${TRAIN.map(([id, t]) => card(slug(id), t.n, sub(id, t), "xm_train")).join("")}</div>
    <h3>By ferry (the islands)</h3><div class="cards">${ISLES.map(([id, t]) => card(slug(id), t.n, sub(id, t), "water")).join("")}</div>
    <h2>${ico("b_koala", 22)} Bellbird Valley stops</h2>${regionCards}`;
  return {slug: "trips", title: "Trips", section: "trips", blurb: "Day trips by train, ferry, your own boat and the campervan: fares, times and who can come", html,
    search: [{t: "Ferry", d: "Trips: by ferry from the foreshore jetty", a: "/trips"}, {t: "Ticket window", d: "Trips: Honeybrook station", a: "/trips"}, {t: "Campervan road trips", d: "Trips: Bellbird Valley", a: "/trips"}, {t: "Bellbird Valley", d: "Trips: by campervan", a: "/trips"}]};
}
function islandsPage(){
  const html = lede(`Across the sea from the foreshore jetty. ${ISLES.length} islands by ferry, from the closest and cheapest to the longest crossing of all, and two you can sail to in your own boat.`)
    + ISLES.map(([id, t]) => `<h2>${ico("water", 22)} ${link(slug(id), esc(t.n))}</h2><p>${esc(t.ferry.blurb || t.blurb)}</p>
      <p class="muted">Ferry ${coin(t.ferry.fare)} return each · boats out ${hm(t.outFrom)} to ${hm(t.outTo)} · last boat home ${hm(t.backTo)}${t.ferry.dry ? " · no crossing in the rain" : ""}${t.boat ? ` · your own boat: ${coin(t.boat.fuel)} of fuel` : " · too far for your own boat"}</p>`).join("")
    + `<p>Jeju has a ferry too, though it's reached by train as well: see ${link(slug("jeju"), "Jeju")}.</p>`;
  return {slug: "islands", title: "Islands", section: "trips", blurb: `The islands by ferry: ${andList(ISLES.map(([, t]) => t.n))}`, html};
}
export const pages = () => [tripsPage(), islandsPage(), ...LIVE.map(([id, t]) => page(id, t))];
