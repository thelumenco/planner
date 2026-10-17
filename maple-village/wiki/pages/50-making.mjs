// Making things: the vineyard and wine, the olive mill, the kitchen, the Scoop Shack, the Cocoa Room, the gift shop,
// the paperie and the tailor's. All of it read from the game's own code and data.
import { ITEMS, CROPS } from "../../src/data/items.js";
import { TREES, FLOWERS } from "../../src/data/orchard.js";
import { GOALS } from "../../src/game/goals.js";
import * as VY from "../../src/game/vineyard.js";
import * as MILL from "../../src/game/mill.js";
import * as MC from "../../src/game/millcraft.js";
import * as K from "../../src/game/kitchen.js";
import * as MU from "../../src/game/mulled.js";
import * as SC from "../../src/game/scoop.js";
import * as CC from "../../src/game/cocoa.js";
import * as GS from "../../src/game/giftshop.js";
import * as WR from "../../src/game/wrap.js";
import * as GA from "../../src/game/gallery.js";
import * as PP from "../../src/game/paperie.js";
import * as SW from "../../src/data/sewing.js";
import { sellBack } from "../../src/game/tailor.js";
import { BOX as TRAVEL_BOX, TRADE } from "../../src/game/contacts.js";
import { APERITIVO, CLUB_FROM, CLUB_TO, DISCO_FROM, DISCO_TO } from "../../src/game/tours.js";
import { esc, ico, coin, lede, hm } from "../lib.mjs";
import { dur, seasonsText, icon, nameOf, named, sell, T, h2, h3, box, who, needs, literal } from "./40-farming.mjs";

const cap = s => s ? s[0].toUpperCase() + s.slice(1) : s;
const list = a => a.length > 1 ? a.slice(0, -1).join(", ") + " and " + a[a.length - 1] : a.join("");
const yes = `<span aria-label="yes">✓</span>`, no = `<span class="muted" aria-label="no">·</span>`;
const goal = k => `${esc(GOALS[k].n)} costs ${coin(GOALS[k].price)}`;

/* ---------- the vineyard and wine ---------- */
function vineyardPage(){
  const v = VY.vineState({}), BUNCHES = 3, BOTTLES = 6, GLASSES = 5;
  const grapeRows = [["red", "Red grapes", "Two cuttings to start (one red, one white); more at the vineyard stall"], ["white", "White grapes", ""],
    ["tempranillo", "Tempranillo", "Cuttings from Rafael in Ronda, once he trusts you"], ["pinot", "Pinot Noir", "Cuttings from Kel in Bellbird Valley"], ["chardonnay", "Chardonnay", "Cuttings from Kel in Bellbird Valley"]]
    .map(([k, n, from]) => ({id: "grape-" + k, cells: [named("grape_" + k, 24, n), esc(from), sell("grape_" + k)]}));
  const styles = Object.entries(VY.STYLES).map(([k, s]) => ({id: "wine-" + k, cells: [`${ico("wine_" + (["red", "rose", "white", "sparkling"].includes(k) ? k : k === "chardonnay" ? "white" : "red"), 22)} <b>${esc(s.n)}</b>`, esc(nameOf("grape_" + s.grape)),
    dur(s.dur) + (s.dur2 ? `, then ${dur(s.dur2)} more for the bubbles` : ""), coin(s.price), coin(Math.max(1, Math.round(s.price/4)))]}));
  const barrelPrices = [2, 3, 4, 5, 6].map(n => coin(VY.shopPrice({barrels: Array(n - 1)}, "barrel"))).join(", ");
  const stall = Object.entries(VY.SHOP).map(([id, it]) => ({id: "stall-" + id, cells: [`<b>${esc(it.n)}</b>`, id === "barrel" ? `${barrelPrices} (the 2nd to the 6th); ${coin(VY.BARRELS.cellarPrice)} each on the cellar racks` : coin(it.price), esc(it.say)]}));
  const help = VY.HELP.map(([id, n, d]) => [`<b>${esc(n)}</b>`, esc(cap(d)), id === "fetch" ? "Off" : "On"]);
  const html = lede(`The vineyard east of home, left to you by your great-uncle Wilf with the house. Grow grapes on trellised vines, ferment them in oak barrels, bottle and name your wines, and sell them at your own wine shop. It all runs on real time: vines ripen and barrels ferment while you're away.`)
    + h2("vines", "Vines and grapes", "grape_red")
    + `<ul class="plain"><li>Three rows, three vines a row. The first row has a trellis; a trellis for each other row is ${coin(VY.SHOP.trellis.price)} at the vineyard stall.</li>
      <li>Plant a cutting on a trellis, then water the row. A watered vine ripens in ${dur(VY.GROW)} and gives ${BUNCHES} bunches; water it again and it fruits again. In the grape harvest week every vine gives an extra bunch.</li>
      <li>Dig a vine up any time: the cutting goes back in the box to plant somewhere else.</li>
      <li>Picked grapes wait in the crates in the barrel shed. Take bunches for gelato at the <a href="/scoop-shack">Scoop Shack</a> (or put them back).</li></ul>`
    + T(["Grape", "Where the cuttings come from", "A bunch sells for"], grapeRows)
    + h2("barrels", "Barrels and bottling", "wine_red")
    + `<p>${BUNCHES} bunches fill a barrel; a barrel makes ${BOTTLES} bottles. Fill one in the evening, bottle it the next day: it doesn't need you while it ferments. Sparkling has a second fermentation for its bubbles. When a barrel's ready, name the wine (the game suggests names, or type your own) and the bottles go into the cellar. Every finished quest moves the barrels on too.</p>`
    + T(["Wine", "Grapes", "In the barrel", "A bottle", "A glass"], styles)
    + `<p class="muted">Bottle prices are where each wine starts; you can set your own on the shelves. Dearer bottles sell less often, cheaper ones a little more. A glass is a quarter of the bottle price.</p>`
    + `<p>The first barrel comes with the shed. The shed holds ${VY.BARRELS.shed}, and once the <a href="#cellar">cellar door</a> is built its racks take ${VY.BARRELS.cellar} more.</p>`
    + h3("riddling", "The riddling rack") + `<p>Once Jono has shown you how in Bellbird Valley's barrel cave, sparkling can go on the riddling rack in the cellar. Every day on the rack it fetches ${coin(VY.RIDDLE.day)} more a bottle, up to ${VY.RIDDLE.max} days.</p>`
    + h2("shop", "The wine shop", "lantern")
    + `<ul class="plain"><li>Open 10am to 10pm. Villagers buy bottles and glasses now and then and leave the coins in the honesty box; step behind the counter to serve and more people come in, and they pay you straight away.</li>
      <li>Evenings and weekends are busiest, and villagers drop in to the tasting room for a glass. Food brings more people in, the tapas of the day most of all (see <a href="/kitchen-and-tapas">Kitchen and tapas</a>).</li>
      <li>Fruit from the <a href="/orchard">orchard</a> goes in a crate by the shelves, and customers buy it too.</li>
      <li>You can rename the vineyard and the shop in the staff card at the counter.</li></ul>`
    + h3("staff", "Your staff") + `<p>${who("marco")} and ${who("ines")} work the vines, ${who("celeste")} minds the shop and ${who("pilar")} cooks. Untick any job you'd rather do yourself.</p>`
    + T(["Who does what", "", "To start"], help)
    + h2("stall", "The vineyard stall", "coin")
    + T(["For sale", "Price", ""], stall)
    + h2("olives", "Olives", "olives")
    + `<p>The olive tree by the path is ripe every ${dur(VY.OLIVE)}: ${VY.TREE_JARS} jars of olives. The grove along the top terrace gives ${VY.GROVE_JARS} jars a picking (twice that with the second row). Marco and Ines pick them on their shifts into the olive crate; take the crate for the kitchen, gelato, or the <a href="/olive-mill">olive mill</a>, which presses three jars into a bottle of oil.</p>`
    + h2("cellar", "The cellar door", "wine_sparkling")
    + `<p>${goal("cellar")}. ${esc(GOALS.cellar.line)}</p>`
    + h2("evenings", "Busy times", "calendar")
    + T(["When", "What happens"], [
      ["Sunday mornings", "The wine stall at the <a href=\"/field#sunday-market\">farmers market</a>, minded by Ines, selling from the shop's shelves. Serve there yourself and more people stop."],
      [`Fridays, ${hm(APERITIVO[0])} to ${hm(APERITIVO[1])}`, "Aperitivo hour: busier, and everyone wants a plate. Serve and they tip."],
      [`First Friday of the month, ${hm(CLUB_FROM)} to ${hm(CLUB_TO)}`, "The wine club in the cellar door (once it's built). Host it and they buy half as much again."],
      [`Saturdays, ${hm(DISCO_FROM)} to ${hm(DISCO_TO)}`, "Disco night in the cellar (once it's built): a packed floor and thirsty dancers."],
      ["Sundays", "The long lunch on the terrace (once it's built), and the terrace's other occasions: guests order whole bottles and plates."],
      ["20 November to Boxing Day", "Mulled wine by the cup, from the big pot in the <a href=\"/kitchen-and-tapas#mulled-wine\">kitchen</a>."]])
    + `<p class="muted">With the Scoop Shack's <a href="/scoop-shack#bike">delivery bike</a>, Tomo also takes tapas, small plates and bottles round to people's homes and picnics.</p>`;
  const search = Object.entries(VY.STYLES).map(([k, s]) => ({t: `${s.n} wine`, d: `Wine: ${dur(s.dur)} in the barrel, ${s.price} coins a bottle`, a: "/vineyard-and-wine#wine-" + k}))
    .concat([{t: "Riddling rack", d: "Sparkling wine on the rack fetches more", a: "/vineyard-and-wine#riddling"}, {t: "Cellar door", d: `${GOALS.cellar.price} coins`, a: "/vineyard-and-wine#cellar"},
      {t: "Wine club", d: "First Friday of the month, in the cellar door", a: "/vineyard-and-wine#evenings"}, {t: "Olive grove", d: `Vineyard stall, ${VY.SHOP.grove.price} coins`, a: "/vineyard-and-wine#stall-grove"}]);
  return {slug: "vineyard-and-wine", title: "Vineyard and wine", section: "making", blurb: "Vines, barrels, every wine, the wine shop and its staff", html, search};
}

/* ---------- the olive mill ---------- */
const KIND_BASE = {oil: `${MC.CRAFT.oilPer} × ${named("oliveoil", 20)}`, soap: `2 × ${named("goatmilk", 20)}, or 1 × ${named("oliveoil", 20)}`, lotion: `1 × ${named("goatmilk", 20)} + 1 × ${named("oliveoil", 20)}`,
  balm: `1 × ${named("beeswax", 20)} + 1 × ${named("oliveoil", 20)}`, lipoil: `1 × ${named("oliveoil", 20)}`};
const KIND_TIME = {oil: [MC.CRAFT.steep, MC.CRAFT.oilPer, "bottles", "three steeping jars"], soap: [MC.CRAFT.cure, MC.CRAFT.soapPer, "bars", `a curing rack of ${MC.CRAFT.rack}`], lotion: [MC.CRAFT.lotion, MC.CRAFT.lotionPer, "jars", "one little pot"],
  balm: [MC.CRAFT.balm, MC.CRAFT.balmPer, "tins", "one tray of tins"], lipoil: [MC.CRAFT.lipoil, MC.CRAFT.lipoilPer, "bottles", `${MC.CRAFT.rollers} roller trays`]};
function millPage(){
  const kinds = Object.entries(MC.KINDS).map(([k, x]) => ({id: k === "balm" ? "lip-balms" : "craft-" + k, cells: [`<b>${esc(x.n)}</b>`, KIND_BASE[k], `${x.max === 1 ? "One" : "One or two"}${k === "balm" || k === "lipoil" ? ", and a flower for the colour if you like" : ""}`,
    dur(KIND_TIME[k][0]), `${KIND_TIME[k][1]} ${KIND_TIME[k][2]}`, esc(cap(KIND_TIME[k][3])), coin(x.price), coin(x.sell)]}));
  const adds = Object.entries(MC.HERB).map(([id, h]) => [named(id, 20, h.n), ...["oil", "soap", "lotion", "balm", "lipoil"].map(k => h[k] ? yes : no)]);
  const html = lede(`The old windmill on the cottage lane, opened up as an olive mill: a millstone, a press and clay jars downstairs, and a workbench upstairs for infused oils, soaps, lotions, lip balms and lip oils. ${goal("mill")}.`)
    + h2("press", "Pressing olive oil", "olives")
    + `<p>${MILL.JARS_PER_BOTTLE} jars of olives make a bottle of ${named("oliveoil", 20, "olive oil")}: crushed under the millstone, pressed between the mats. Up to ${MILL.PRESS_MAX} bottles a pressing, in about ${dur(MILL.PRESS_DUR)}. Olives come from your backpack first, then the vineyard's olive crate (see <a href="/vineyard-and-wine#olives">olives</a>). A bottle sells for ${sell("oliveoil")}.</p>
      <p>${who("tomi")} also works the press: he takes the olives from the crate, presses them, and carries the bottles up to the basket by the workbench. That's all he does upstairs: the infusing is yours.</p>
      <p class="muted">By the door hangs an old photograph: the mill was built in 1887 for flour, and Tomás, a railwayman from near Ronda, planted an olive tree beside it in 1912 and said it would press olives one day.</p>`
    + h2("bench", "The workbench", "soap_oat")
    + `<p>Like the gelato flavours, every new mix is a discovery: made once, named, then made again whenever you like. Herbs come from the garden and the <a href="/greenhouse">greenhouse</a>, flowers from Mei's <a href="/flower-farm">flower farm</a> (her bouquets), fruit from the <a href="/orchard">orchard</a>, and honey from <a href="/wildflower-farm">Wildflower Farm</a> and your trips. The bench takes from your backpack first, then the mill's basket, which holds anything the bench uses.</p>`
    + T(["Make", "Base", "Add-ins", "Takes", "Makes", "Room for", "Shop price", "Sells for"], kinds)
    + `<p class="muted">Each extra add-in adds ${coin(2)} to an oil, soap or lotion; a flower tint adds ${coin(1)} to a lip balm or lip oil. Prices are what the Mill Shop charges; "sells for" is the market's Sell tab.</p>`
    + h3("beeswax", "Beeswax") + `<p>Melt down a honeycomb at the bench for ${MC.CRAFT.waxPer} blocks of ${named("beeswax", 20, "beeswax")}, or buy a block at Sunflower Hill's honey house in the Lavender Hills.</p>`
    + h3("add-ins", "What goes in what") + `<p class="muted">Columns: infused oil, soap, lotion, lip balm, lip oil.</p>`
    + T(["Add-in", "Oil", "Soap", "Lotion", "Balm", "Lip oil"], adds)
    + h2("selling", "Selling what you make", "coin")
    + `<ul class="plain"><li>Until the Mill Shop opens, the wine shop sells a little of it from a "from the mill" crate by the counter.</li>
      <li><b>The Mill Shop:</b> ${goal("millshop")} (you'll need the mill first). ${esc(GOALS.millshop.line)} ${who("hazel")} is in 10am to 5pm, closed on Mondays; it's busier at weekends, when the day-trippers walk up the lane.</li>
      <li>On Sundays a crate on your wine stall at the <a href="/field#sunday-market">farmers market</a> sells some too, and Grace's soap stall there stocks your soaps.</li>
      <li>Things on the mill's shelves also sell in the <a href="/gift-shop">gift shop</a>, from the same stock.</li>
      <li>For a <a href="/trips">campervan trip</a>, pack a pop-up crate of up to ${MC.VAN_CRATE.max} things from the mill's shelves and the wine shop's.</li></ul>`
    + h2("tastings", "Olive oil tastings", "olives")
    + `<p>Once the Mill Shop's open, Hazel runs tastings at the long table upstairs every day at ${hm(MC.TASTE.at[0])}, and at ${hm(MC.TASTE.weekend[0])} at weekends: ${MC.TASTE.size} day-trippers at a time, ${MC.TASTE.dur} minutes. Sit in and name up to three notes in each glass (${list(MC.NOTES.map(n => n.toLowerCase()))}): your own plain oil, then up to three of your infused ones. Afterwards the oils sell twice as fast for an hour. Your first tasting gives you ${named("t_glass", 20, "a cobalt tasting glass")} to keep.</p>`
    + h2("workshops", "Soap workshops", "soap_lav")
    + `<p>Wednesdays and Saturdays, ${hm(MC.WORKSHOP.from)} to ${hm(MC.WORKSHOP.to)}: Hazel teaches ${MC.WORKSHOP.size} people soap-making in the corner, ${coin(MC.WORKSHOP.fee)} a ticket, paid to you at four. Lend a hand once a day for a few coins in tips, and Hazel tells you about a mix you haven't tried yet.</p>`;
  const search = Object.entries(MC.KINDS).map(([k, x]) => ({t: x.n, d: "Made at the olive mill's workbench", a: "/olive-mill#" + (k === "balm" ? "lip-balms" : "craft-" + k)}))
    .concat([{t: "Olive oil", d: `${MILL.JARS_PER_BOTTLE} jars of olives make a bottle, at the mill`, a: "/olive-mill#press"}, {t: "Mill Shop", d: `${GOALS.millshop.price} coins, upstairs at the old mill`, a: "/olive-mill#selling"},
      {t: "Olive oil tastings", d: "At the Mill Shop", a: "/olive-mill#tastings"}, {t: "Soap workshops", d: "Wednesdays and Saturdays at the Mill Shop", a: "/olive-mill#workshops"}, {t: "Beeswax", d: "Melted from honeycomb at the mill", a: "/olive-mill#beeswax"}]);
  return {slug: "olive-mill", title: "Olive mill", section: "making", blurb: "Pressing oil, infused oils, soaps, lotions, lip balms, the Mill Shop and tastings", html, search};
}

/* ---------- the kitchen and tapas ---------- */
const kName = (id, n) => K.GOODS[id] ? K.GOODS[id][n === 1 ? 0 : 1] : nameOf(id).toLowerCase();
const kIco = id => K.GROUP_ICON[id] || id;
const kNeeds = need => needs(need, kName, kIco);
function kitchenPage(){
  const dish = Object.entries(K.DISHES).map(([id, d]) => ({id: "dish-" + id, cells: [`<b>${esc(d.n)}</b>`, kNeeds(d.need), `${d.plates}`, coin(d.price)]}));
  const local = Object.entries(K.TAPAS).filter(([, t]) => !t.special);
  const tap = ([id, t]) => ({id: "tapa-" + id, cells: [`<b>${esc(t.n)}</b>`, kNeeds(t.need), coin(t.price), seasonsText(t.seasons)]});
  const towns = [...new Set(Object.values(K.SPECIALS).map(([town]) => town))];
  const specials = towns.map(town => h3("specials-" + town, `From ${K.TOWN_NAME[town]}`) + T(["Special", "Ingredients", "A plate", "Season"], Object.entries(K.TAPAS).filter(([, t]) => t.special === town).map(tap))).join("");
  const src = Object.entries(K.SOURCE).map(([id, w]) => [named(kIco(id), 20, cap(kName(id, 2))), esc(w)]);
  const SPECIAL_MULL = literal("game/mulled.js", "SPECIAL") || {};
  const mulls = Object.entries(SPECIAL_MULL).map(([key, n]) => { const adds = key.split("+"); return [`<b>${esc(n)}</b>`, adds.map(a => named(a, 20, MU.ADDS[a].n)).join(" + "), coin(MU.cupPrice(adds))]; });
  const spices = Object.keys(MU.ADDS).filter(a => MU.ADDS[a].spice).map(a => `${named(a, 20)} ${coin(ITEMS[a].price)}`).join(", ");
  const html = lede(`The kitchen behind the wine shop: an oven, a cheese press and a stove. Cook small plates for the tasting room and up to ${K.TAPAS_MAX} tapas of the day, and they sell to the wine shop's customers. ${who("pilar")} cooks here on her shifts.`)
    + h2("larder", "The larder", "fridge")
    + `<p>Send ingredients to the kitchen from your backpack (or bring them over at the larder): garden crops, eggs, milk, cheese, honey, fish, fruit, herbs and anything from your trips. Any of the farm's cheeses does for "cheese" in a recipe, goat's milk does for milk, and any jar of honey for honey. Set how many of something to keep back and Pilar won't touch them; anything you've just brought in waits ${dur(K.FRESH_HOLD)} before she can use it, so there's time to decide.</p>`
    + T(["Station", "What it does"], [
      [`${ico("loaf", 22)} <b>Oven</b>`, `1 × ${named("flour", 20)} bakes 2 loaves in an hour.`],
      [`${ico("cheese", 22)} <b>Cheese press</b>`, `2 × ${named("milk", 20)} make a little round of cheese in about three hours.`],
      [`<span id="petal-syrup"></span>${ico("syrup", 22)} <b>Petal syrup</b>`, `${K.SYRUP_PETALS} garden flowers (tulips or sunflowers) make 2 bottles of ${named("syrup", 20, "petal syrup")}: for gelato, a bonbon filling, or the lemon and petal posset.`],
      [`${ico("bowl", 22)} <b>Stove</b>`, "Small plates and the tapas of the day."]])
    + h2("small-plates", "Small plates", "bowl")
    + T(["Plate", "Ingredients", "Plates", "Each"], dish)
    + h2("tapas", "Tapas of the day", "tomato")
    + `<ul class="plain"><li>Choose up to ${K.TAPAS_MAX} tapas for today's chalkboard (or plan tomorrow's the day before). Each batch is ${K.TAPAS_PLATES} plates; cook another when they're running low.</li>
      <li><b>The chef's request:</b> each day someone in the village has a craving for one of the season's tapas. Make it a tapas of the day and it sells for half as much again.</li>
      <li>At closing (10pm) any leftover tapas go to the staff for dinner, and they leave something in the larder to say thanks (olives, eggs or flour).</li>
      <li>Seasonal tapas can only go on the chalkboard in their seasons; the rest are all year.</li></ul>`
    + T(["Tapa", "Ingredients", "A plate", "Season"], local.map(tap))
    + h2("specials", "Specials from your trips", "kite")
    + `<p>Dishes from the places you've been, in their own tab at the stove, and always dearer than the local ones. A town's specials appear once you've been there; Ronda's also need tasting at the tapas bar in Ronda first. See <a href="/trips">Trips</a>.</p>` + specials
    + h2("ingredients", "Where the ingredients come from", "bag")
    + `<p class="muted">As the stove tells you when something's missing.</p>` + T(["Ingredient", "Where to get it"], src)
    + h2("mulled-wine", "Mulled wine", "xm_mulled")
    + `<p>From 20 November until Boxing Day, a big pot on the stove. A bottle of your own red, Tempranillo or Pinot Noir off the shelves and ${MU.MULL.min} or ${MU.MULL.max} things to mull it with: spices from Hana's deli shelf (${spices}), and fruit or honey (orange, lemon, apple, raspberries, honey). ${dur(MU.MULL.dur)} mulling makes ${MU.MULL.cups} cups. A cup costs ${coin(4)} plus a coin for each thing in it, and they sell at the wine shop counter, the Christmas market stall and the terrace's winter occasions. Every new mix is found once and named; some have names of their own. A spice rack by the pot keeps spices all year.</p>`
    + T(["Named mix", "In it", "A cup"], mulls);
  const search = [...Object.entries(K.TAPAS).map(([id, t]) => ({t: t.n, d: t.special ? `Tapas special from ${K.TOWN_NAME[t.special]}, ${t.price} coins a plate` : `Tapas, ${t.price} coins a plate`, a: "/kitchen-and-tapas#tapa-" + id})),
    ...Object.entries(K.DISHES).map(([id, d]) => ({t: d.n, d: `Small plate, ${d.price} coins`, a: "/kitchen-and-tapas#dish-" + id})),
    {t: "Mulled wine", d: "20 November to Boxing Day, at the wine shop kitchen", a: "/kitchen-and-tapas#mulled-wine"}, {t: "Petal syrup", d: "Made from garden flowers at the kitchen", a: "/kitchen-and-tapas#petal-syrup"},
    ...Object.values(SPECIAL_MULL).map(n => ({t: n, d: "A named mulled wine", a: "/kitchen-and-tapas#mulled-wine"}))];
  return {slug: "kitchen-and-tapas", title: "Kitchen and tapas", section: "making", blurb: "The wine shop kitchen: every small plate, tapa and trip special, and mulled wine", html, search};
}

/* ---------- the Scoop Shack ---------- */
function scoopPage(){
  const groups = [["Dairy bases (make it a gelato)", id => ["milk", "goatmilk", "yoghurt"].includes(id)], ["From Hana's deli shelf", id => ITEMS[id] && ITEMS[id].tab === "deli"],
    ["From the garden, the greenhouse and the kitchen", id => !!CROPS[id] || id === "syrup"], ["From the orchard", id => Object.values(TREES).some(t => t.fruit === id)], ["Flower stems from the flower farm", id => id.startsWith("fl_")],
    ["Grapes from the vineyard", id => id.startsWith("grape_")], ["Honey", id => /^honey|euchoney/.test(id)], ["Everything else: the woods, your shops and your trips", () => true]];
  const left = new Set(Object.keys(SC.INGR)); const chip = id => `<span style="white-space:nowrap;display:inline-block;margin:2px 10px 2px 0">${icon(id.startsWith("fl_") ? "bq_" + id.slice(3) : id, 22)}${esc(SC.INGR[id][0])}</span>`;
  const ingr = groups.map(([n, f], k) => { const ids = [...left].filter(f); ids.forEach(i => left.delete(i)); return ids.length ? `${h3("ingredients-" + (k + 1), n)}<p>${ids.map(chip).join(" ")}</p>` : ""; }).join("");
  const fmt = Object.entries(SC.FORMATS).map(([k, f]) => [`${ico("ic_" + k, 22)} <b>${esc(f.n)}</b>`, coin(f.p)]);
  const dips = Object.entries(SC.DIPS).map(([k, d]) => ({id: "dip-" + k, cells: [`<span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${d.col};border:1px solid var(--line);vertical-align:-2px;margin-right:6px"></span><b>${esc(d.n)}</b>`, d.house ? "From the Cocoa Room" : d.price ? coin(d.price) : "Comes with the dip station"]}));
  const tops = Object.entries(SC.TOPPINGS).map(([k, d]) => ({id: "topping-" + k, cells: [`<span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${d.col};border:1px solid var(--line);vertical-align:-2px;margin-right:6px"></span><b>${esc(d.n)}</b>`, d.price ? coin(d.price) : "Comes with the dip station"]}));
  const ups = Object.entries(SC.UPGRADES).map(([k, u]) => ({id: k === "bike" ? "bike" : "upgrade-" + k, cells: [`<b>${esc(u.n)}</b>`, coin(u.price), esc(u.line)]}));
  const html = lede(`Your ice cream shop on the bay, up the boardwalk from the foreshore. Open ${hm(SC.OPEN)} to ${hm(SC.CLOSE)}. Discover flavours at the mixing bench, churn tubs, and sell cups, cones, floats and waffles. ${who("sofia")} runs the counter and ${who("tomo")} serves on the deck.`)
    + h2("flavours", "Discovering flavours", "ic_cone")
    + `<ul class="plain"><li>Stock the kitchen fridge from your backpack, or straight off the orchard's farm shop shelves (fruit and flower stems).</li>
      <li>At the mixing bench, any 1 to 4 ingredients make a flavour. Every combination is a new one, and there's no such thing as a bad recipe.</li>
      <li>With milk, goat's milk or yoghurt it's a gelato; without, a dairy-free sorbet. Milk on its own is Fior di Latte. A flavour of one or two things is named after them (${esc(SC.nameFor(["milk", "strawberry"]))}, ${esc(SC.nameFor(["honey", "mint"]))}...); three or four get a name of their own.</li>
      <li>Every tub, a new flavour's first or another of one you know, goes into the churner for an hour (blending, then freezing). The churner holds ${SC.CHURNS} batches at once. A tub is ${SC.TUB} scoops, and another tub uses one of each ingredient again.</li>
      <li>The display holds ${SC.SLOTS} flavours, and customers only buy what's in it. Arrange it yourself, or let it fill itself from what's in the freezer.</li></ul>`
    + h2("ingredients", "What can go in", "strawberry") + ingr
    + h2("menu", "The menu", "coin")
    + `<p>Prices are set per format, and a flavour you mark as special costs ${coin(2)} more. These are the starting prices; change them on the menu.</p>`
    + T(["Format", "Starting price"], fmt)
    + `<p class="muted">Yours are free at the counter, or take one away to give.</p>`
    + h2("dips", "The dip station", "chocolate")
    + `<p>A little room off the shop (an upgrade, below): warm pots of chocolate and a shelf of toppings, for dipped cones and waffles. Customers pay ${coin(2)} extra for a dip and ${coin(1)} for a topping; a cone dipped in the Cocoa Room's house-made dark costs ${coin(SC.HOUSE_EXTRA)} more. Make your own too.</p>`
    + T(["Dip", "Price"], dips) + T(["Topping", "Price"], tops)
    + `<p class="muted">The <a href="/cocoa-room#scoop-shack">Cocoa Room</a> can send 10 pieces of its dark chocolate here: 5 of "Cocoa Room chocolate" for the gelato fridge, or 20 dips of house-made dark for the dip station.</p>`
    + h2("upgrades", "Upgrades", "sparkle")
    + T(["Upgrade", "Price", ""], ups)
    + h3("delivery", "Deliveries by bike") + `<p>With the bike, from ${hm(SC.DELIV_HOURS[0])} to ${hm(SC.DELIV_HOURS[1])} villagers order from wherever they are and Tomo pedals it round: cups and cones from here (never floats or waffles: they'd melt), chocolates from the Cocoa Room, and tapas, small plates and bottles from the wine shop. Each order pays the shop's price plus ${coin(SC.DELIVERY.fee)} for delivery.</p>`
    + h2("trolley", "The ice cream trolley", "ic_cup")
    + `<p>Load up to ${SC.TROLLEY.flavours} flavours, ${SC.TROLLEY.scoops} scoops each, from the shop's tubs and push it round Honeybrook: tap people to sell them a cup or a cone. It's heavy, so you walk slower (and can't ride or drive with it), and the ice packs last ${dur(SC.TROLLEY.ms)}: wheel it back in time and what's left goes back in the freezer. Each person buys once a day at most.</p>`
    + h2("cart", "The night market cart", "lantern")
    + `<p>Tuesday and Thursday evenings, ${hm(17*60 + 30)} to ${hm(22*60)}, the Scoop Shack's cart at the <a href="/field#night-market">night market</a> scoops cups and cones from the shop's display. Tomo minds it after his day on the deck.</p>`;
  const search = [...Object.entries(SC.UPGRADES).map(([k, u]) => ({t: u.n, d: `Scoop Shack upgrade, ${u.price} coins`, a: "/scoop-shack#" + (k === "bike" ? "bike" : "upgrade-" + k)})),
    ...Object.entries(SC.DIPS).map(([k, d]) => ({t: `${d.n} dip`, d: "The Scoop Shack's dip station", a: "/scoop-shack#dip-" + k})),
    ...Object.entries(SC.TOPPINGS).map(([k, d]) => ({t: d.n, d: "Topping at the Scoop Shack's dip station", a: "/scoop-shack#topping-" + k})),
    {t: "Gelato flavours", d: "Discover them at the Scoop Shack's mixing bench", a: "/scoop-shack#flavours"}, {t: "Ice cream trolley", d: "The Scoop Shack", a: "/scoop-shack#trolley"}];
  return {slug: "scoop-shack", title: "Scoop Shack", section: "making", blurb: "Gelato and sorbet: ingredients, formats, the dip station, upgrades and the delivery bike", html, search};
}

/* ---------- the Cocoa Room ---------- */
function cocoaPage(){
  const steps = [[ico("bag", 22) + " <b>Beans</b>", `A sack of cacao beans from the sacks in the kitchen, ${coin(CC.SACK)}.`], [ico("hearth", 22) + " <b>Roast</b>", `A sack at a time in the roaster: ${CC.ROAST_MIN} minutes.`],
    [ico("bowl", 22) + " <b>Grind</b>", `Roasted beans in the stone grinder, as milk, dark or white chocolate: ${dur(CC.GRIND_MIN*60000)}.`], [ico("chocolate", 22) + " <b>Temper</b>", `The ground pot on the marble slab: ${CC.POT} pieces of chocolate, ready to use.`],
    [ico("bar_dark", 22) + " <b>Mould</b>", `${CC.MOULD} pieces make ${CC.MOULD} bars, onto the bar wall.`]];
  const fills = Object.keys(SC.INGR).filter(CC.isFilling).map(id => `<span style="white-space:nowrap;display:inline-block;margin:2px 10px 2px 0">${icon(id.startsWith("fl_") ? "bq_" + id.slice(3) : id, 20)}${esc(CC.fillName(id))}</span>`).join(" ");
  const wineFills = Object.entries(CC.WINE_FILL).map(([id, w]) => esc(w[0])).join(", ");
  const ups = Object.entries(CC.CC_UPS).map(([k, u]) => ({id: "upgrade-" + k, cells: [`<b>${esc(u.n)}</b>`, coin(u.price), esc(u.line)]}));
  const specials = Object.values(CC.SPECIALS).map(s => ({id: s.id, cells: [named(s.id, 22, s.n), `${s.use} pieces of ${s.kind} chocolate make ${s.make}`, coin(s.price), esc(s.line)]}));
  const boxes = ["box4", "box9", "box16"].filter(id => ITEMS[id]).map(id => [named(id, 22), coin(ITEMS[id].price)]);
  const html = lede(`Your chocolate shop on the bay, in what was a boarded-up shopfront. ${goal("cocoa")}. You make everything yourself, bean to bar: a wall of bars, a case of bonbons, and a kitchen out the back. ${who("amara")} serves at the counter; ${who("mateo")} is the kitchen hand.`)
    + h2("hours", "Opening hours", "clock")
    + `<p>${hm(CC.OPEN)} to ${hm(CC.CLOSE)}, Tuesday to Sunday (Mondays too, once Lila joins). Customers buy bars off the wall and bonbons from the case, more often while you're serving. Bars start at ${coin(6)} and bonbons at ${coin(3)} each; set your own prices at the counter.</p>
      <p>Mateo works Monday to Saturday, 9:30am to 4:30pm. He keeps the bar line going on his own, roasting, grinding, tempering and moulding whenever a station's free (he stops a kind at ${CC.WALL} bars on the wall), and keeps chocolate back on the bonbon shelf for you. With auto-buy on he orders a sack when the beans run out, never taking your coins below the floor you set.</p>`
    + h2("bean-to-bar", "Bean to bar", "chocolate")
    + T(["Step", ""], steps)
    + `<p class="muted">Milk, dark and white chocolate: ${Object.values(CC.KINDS).map(k => esc(k.n)).join(", ")}.</p>`
    + h2("bonbons", "Bonbons", "box4")
    + `<ul class="plain"><li>A shell (${CC.SHELL} pieces of milk, dark or white chocolate) and one or two fillings from the fillings shelf make a tray of ${CC.TRAY} bonbons.</li>
      <li>Every new combination is a discovery with its own name; known ones make another tray.</li>
      <li>Up to ${CC.CASE} flavours sit in the display case, and customers buy two to four at a time. Have one yourself, or pack a gift box from what's on display.</li>
      <li>Bonbons start in dome moulds. Heart, square, seashell and star moulds are upgrades; a flavour takes the shape of the mould its last tray was made in, and its name follows.</li></ul>`
    + h3("fillings", "Fillings") + `<p>The fillings shelf is stocked from your backpack or straight off the orchard's farm shop shelves, like the gelato fridge. Almost anything sweet that goes in gelato goes in a bonbon:</p><p>${fills}</p>
      <p>And wine: a bottle of your own off the wine shop's shelves opens into ${CC.WINE_FILLS} wine fillings (${wineFills}).</p>`
    + h3("boxes", "Gift boxes") + `<p>Pack a box of 4 or 9 from the case (a grand box of 16 with the gift wrapping station), choosing the bonbons or letting the game fill it. All dark shells makes it dairy-free. A <b>pairing box</b> is a bottle of your wine and 4 bonbons, ribboned together, for the <a href="/gift-shop#pairing">gift shop</a>.</p>`
    + T(["Box", "Price"], boxes)
    + h3("specials", "Festival specials and little extras")
    + `<p>Around Christmas, Chinese New Year, Deepavali and the Mid-Autumn Festival, the bonbon table makes that festival's special, sold beside the case while the festival's on (or to give).</p>`
    + T(["Special", "Makes", "Price", ""], specials)
    + `<p>All year, ${CC.COIN_TINS.use} pieces of milk chocolate make ${CC.COIN_TINS.make} ${named("coin_tin", 20, "little tins of gold chocolate coins")}, to give.</p>`
    + h2("scoop-shack", "With the Scoop Shack", "ic_cone")
    + `<p>Send ${CC.SEND} pieces of loose dark chocolate to the <a href="/scoop-shack">Scoop Shack</a>: ${CC.TO_FRIDGE} of "Cocoa Room chocolate" for the gelato fridge, or (with its dip station) ${CC.TO_DIPS} dips of house-made dark. The supply deal upgrade does it every morning.</p>`
    + h2("upgrades", "Upgrades", "sparkle")
    + T(["Upgrade", "Price", ""], ups)
    + `<p class="muted">On wine club nights the members buy chocolates too, and with the <a href="/scoop-shack#bike">delivery bike</a> Tomo takes chocolates round.</p>`;
  const search = [...Object.entries(CC.CC_UPS).map(([k, u]) => ({t: u.n, d: `Cocoa Room upgrade, ${u.price} coins`, a: "/cocoa-room#upgrade-" + k})),
    ...Object.values(CC.SPECIALS).map(s => ({t: s.n, d: "Cocoa Room festival special", a: "/cocoa-room#" + s.id})),
    {t: "Bonbons", d: "Made at the Cocoa Room", a: "/cocoa-room#bonbons"}, {t: "Chocolate bars", d: "Bean to bar at the Cocoa Room", a: "/cocoa-room#bean-to-bar"}, {t: "Pairing box", d: "A bottle of your wine and 4 bonbons", a: "/cocoa-room#boxes"}];
  return {slug: "cocoa-room", title: "Cocoa Room", section: "making", blurb: "Bean to bar, bonbons and fillings, gift boxes, upgrades and the vending machine", html, search};
}

/* ---------- the gift shop ---------- */
function giftPage(){
  const painters = Object.entries(GA.PAINTERS).flatMap(([id, p]) => p.works.map(([t, price]) => [who(id), esc(t), coin(price)]));
  const makers = Object.entries(GA.MAKERS).map(([id, m]) => ({id: "maker-" + id, cells: [named(m.item, 22), who(id), coin(ITEMS[m.item].price)]}));
  const paper = Object.entries(WR.STORE_PAPER).map(([k, p]) => [named("gw_" + k, 22, `${p.n} wrapping paper`), coin(p.price) + " a sheet"]);
  const ribbons = Object.entries(WR.RIBBONS).map(([k, r]) => [named("rb_" + k, 22, r.n), `${coin(r.price)} a reel of ${WR.REEL} bows`]);
  const html = lede(`A little gift shop through a new door in the wine shop's corner. ${goal("giftshop")}. ${who("posy")} keeps it, ${hm(GS.GIFT_HOURS.from)} to ${hm(GS.GIFT_HOURS.to)}, every day but Monday; stand behind the till yourself and it's open, and people browse longer while you're chatting.`)
    + h2("shelves", "The shelves", "bag")
    + `<p>Everything here is shared stock: a sale here is one fewer in your other shops. You can take anything off the displays for yourself, too.</p>`
    + T(["Display", "What's on it"], [["<b>The bonbon case</b>", "Filled from the <a href=\"/cocoa-room\">Cocoa Room</a>'s own display case. Have one, or box four."], ["<b>The chocolate shelf</b>", "Bars from the Cocoa Room's wall."],
      ["<b>From the mill</b>", "Oils, soaps and lotions off the <a href=\"/olive-mill\">mill</a>'s shelves."], ["<b>The wine corner</b>", "Bottles from the <a href=\"/vineyard-and-wine\">wine shop</a>'s shelves, and pairing boxes."],
      ["<b>The wrapping table and gift basket</b>", "Wrap gifts here; wrapped ones go in the basket to sell."], ["<b>The gallery wall</b>", "Paintings by villagers, for sale."], ["<b>The makers' shelf</b>", "Villagers' handmade things, and goods from your travels."]])
    + h2("pairing", "Pairing boxes", "pairbox")
    + `<p>A bottle of your wine and 4 bonbons, packed at the Cocoa Room's bonbon table or right here in the wine corner ("Pair it" on a bottle), choosing the bonbons yourself. Each sells for what went into it: the bottle's price plus 4 bonbons. They go more often in the weeks before Valentine's Day (1 to 14 February), Mother's Day (1 to 14 May) and Christmas (1 to 24 December).</p>`
    + h2("wrapping", "Wrapping", "wrp_red_none_none_gingham_plain")
    + `<p>Wrap any gift from your backpack in a sheet of paper, then, if you like, stamp it, tie a ribbon and add a tag; the parcel's picture builds up with every choice. A wrapped gift is its own item that remembers what's inside. Villagers love the wrapping, and a seeded tag gets planted.</p>
      <ul class="plain"><li><b>Paper:</b> shop-bought sheets from the wrapping table, or your own handmade paper from the <a href="/paperie">paperie</a> (worth more).</li>
      <li><b>Ribbons and stamps:</b> from the ribbon rack at the paperie in Montrose. Rubber stamps (${list(Object.values(WR.STAMPS).map(s => s.toLowerCase()))}) are ${coin(WR.STAMP_SET)} for the set, once.</li>
      <li><b>Tags:</b> a pack of ${WR.TAG_PACK.n} for ${coin(WR.TAG_PACK.price)} at the wrapping table, or cut ${WR.TAGS_PER_SHEET} from one of your own sheets (seeded paper makes seeded tags).</li>
      <li>A wrapped gift is worth the gift plus a little: a coin for shop paper or two for handmade, and one more each for a ribbon, a tag and a stamp. Put wrapped gifts in the basket beside the table and they sell, more in the gift seasons.</li></ul>`
    + T(["Paper", "Price"], paper) + T(["Ribbon", "Price"], ribbons)
    + h2("gallery", "The gallery wall", "painting")
    + `<p>Four frames on the back wall. Local painters bring a new painting on Mondays to fill an empty frame. When one sells you keep ${coin(GA.TOKEN)}, the rest goes to the painter, and they write to you about it a week later. You can hang your own paintings there too: never for sale, and they come down whenever you like.</p>`
    + T(["Painter", "Painting", "Price"], painters)
    + h2("makers", "The makers' shelf", "carpentry")
    + `<p>Small handmade things from around Honeybrook, on consignment: when one sells, the maker gets the money and you keep about a fifth. They top it up on Mondays. Buy one yourself at the full price (it all goes to the maker).</p>`
    + T(["Thing", "Maker", "Price"], makers)
    + h3("travel", "From our travels") + `<p>Write to the friends you make on your trips. After a few letters, some of them offer to send a box of their own goods each week: ${TRAVEL_BOX} at a time, which you pay for when it arrives (${Math.round(TRADE*100)}% of their price), and which sell here at their own price.</p>`;
  const search = [...Object.entries(GA.MAKERS).map(([id, m]) => ({t: ITEMS[m.item].n, d: `The gift shop's makers' shelf, ${ITEMS[m.item].price} coins`, a: "/gift-shop#maker-" + id})),
    {t: "Gallery wall", d: "Paintings for sale at the gift shop", a: "/gift-shop#gallery"}, {t: "Gift wrapping", d: "Paper, ribbons, stamps and tags", a: "/gift-shop#wrapping"}, {t: "Pairing boxes", d: "Wine and bonbons, at the gift shop", a: "/gift-shop#pairing"}];
  return {slug: "gift-shop", title: "Gift shop", section: "making", blurb: "Shared shelves, pairing boxes, wrapping, the gallery wall and the makers' shelf", html, search};
}

/* ---------- the paperie ---------- */
function paperiePage(){
  const cols = Object.entries(PP.COLOURS).map(([k, c]) => [`<span style="display:inline-block;width:14px;height:14px;border-radius:3px;background:${c.col};border:1px solid var(--line);vertical-align:-2px;margin-right:6px"></span><b>${esc(c.n)}</b>`, c.cost ? coin(c.cost) + " of pigment" : "Free"]);
  const adds = Object.entries(PP.ADDS).filter(([k]) => k !== "none").map(([k, a]) => ({id: "add-" + k, cells: [`<b>${esc(a.n)}</b>`, coin(a.cost) + (a.inv ? ` (or a ${esc(nameOf(a.inv).toLowerCase())} from your backpack)` : ""), `+${a.bonus}`]}));
  const steps = [["Scraps", `Bundles of scrap paper: wine labels, chocolate wrappers, receipts. Each of your shops at home puts one bundle aside a day (up to ${PP.SCRAP_CAP} wait), and they ride up in the van when you visit; or buy a bundle at the paperie for ${coin(PP.SCRAP_PRICE)}.`],
    ["Soak", `${PP.SOAK} bundles torn into the tub of water: soft in ${PP.SOAK_MIN} minutes.`], ["Beat", "Into pulp in the vat, in a colour (below)."], ["Add-in", "One, if you like (below)."],
    ["Pull", `The mould and deckle through the vat: ${PP.BATCH} wet sheets, couched onto felts.`], ["Press", `The screw press squeezes the water out: ${PP.PRESS_MIN} minutes.`], ["Dry", "Pegged on the line: dry by the same time tomorrow, with torn deckle edges."]].map(([a, b]) => [`<b>${a}</b>`, b]);
  const html = lede(`A paperie of your own in Montrose's lanes, in the Lavender Hills (a <a href="/trips">van day trip</a>). ${goal("paperie")}. You make every sheet of handmade paper yourself in the back room, from scraps your shops save up, and sell it from the shelves in the front.`)
    + h2("making", "Making paper", "pp_natural_none")
    + T(["Step", ""], steps)
    + h3("colours", "Colours") + T(["Colour", "Cost"], cols)
    + h3("add-ins", "Add-ins") + `<p class="muted">Stirred into the vat; each makes the sheet worth more.</p>` + T(["Add-in", "Cost", "Sheet price"], adds)
    + `<p>A sheet sells for ${coin(PP.BASE)}, plus its add-in's bonus, plus ${coin(1)} for ink blue. Dry sheets go on the shelves or into your backpack: they're gifts too, and they make <a href="/gift-shop#wrapping">wrapping paper</a> and gift tags. Seeded paper (with wildflower seeds) can be planted, and wildflowers come up; a seeded tag on a wrapped gift gets planted by whoever you give it to.</p>`
    + h2("selling", "The shop", "coin")
    + `<ul class="plain"><li>The paperie sells while you're in Montrose (turn the sign round), and twice as much in the gift seasons: 1 to 14 February, 1 to 14 May and 1 to 24 December.</li>
      <li><b>A keeper:</b> ${goal("paperkeeper")}. ${esc(GOALS.paperkeeper.line)}</li>
      <li><b>The Saturday card class:</b> ${hm(PP.CLASS.from)} to ${hm(PP.CLASS.to)}, ${PP.CLASS.size} people make cards at the big table, ${coin(PP.CLASS.fee)} each, with ${PP.CLASS.size} of your sheets. It runs if you or Lise are there and there are ${PP.CLASS.size} sheets on the shelves.</li></ul>`
    + h2("lip-balms", "Lip balms", "balm_none")
    + `<p>Lip balms and lip oils are made at the <a href="/olive-mill#lip-balms">olive mill's workbench</a>, from beeswax, your olive oil and a flavour, tinted with a flower if you like.</p>`;
  const search = [{t: "Handmade paper", d: "Made at your paperie in Montrose", a: "/paperie#making"}, {t: "Seeded paper", d: "Paper with wildflower seeds, at the paperie", a: "/paperie#add-seeds"}, {t: "Saturday card class", d: "At the paperie", a: "/paperie#selling"}];
  return {slug: "paperie", title: "Paperie", section: "making", blurb: "Handmade paper from scraps: colours, add-ins, the shop and the card class", html, search};
}

/* ---------- the tailor and haberdashery ---------- */
function tailorPage(){
  const mats = Object.entries(SW.MATERIALS).map(([k, m]) => ({id: "fabric-" + k, cells: [`<b>${esc(m.n)}</b>`, coin(m.price) + " a piece", esc(m.line), coin(sellBack(`${k}:#FFFDF6:plain`))]}));
  const pats = Object.values(SW.PATTERNS).map(p => [esc(p.n), p.extra ? `+${coin(p.extra)} a piece` : "No extra"]);
  const swatch = Object.entries(SW.COLOURS).map(([c, n]) => `<span style="white-space:nowrap;display:inline-block;margin:2px 10px 2px 0"><span style="display:inline-block;width:14px;height:14px;border-radius:3px;background:${c};border:1px solid var(--line);vertical-align:-2px;margin-right:5px"></span>${esc(n)}</span>`).join(" ");
  const buttons = Object.entries(SW.BUTTONS).map(([k, b]) => [`<span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${b.col};border:1px solid var(--line);vertical-align:-2px;margin-right:6px"></span>${esc(b.n)}`, coin(b.price) + " a card"]);
  const opt = (k, vals) => Array.isArray(vals) ? vals.map(v => SW.OPT_NAMES[k][v]).join(", ") : "";
  const garments = Object.entries(SW.GARMENTS).map(([k, g]) => ({id: "garment-" + k, cells: [`<b>${esc(g.n)}</b>`, `${g.pieces}`, coin(g.fee),
    [opt("sleeves", g.opts.sleeves), opt("neck", g.opts.neck), opt("length", g.opts.length), g.opts.buttons === "need" ? "Buttons" : g.opts.buttons ? "Buttons if you like" : "", g.opts.pockets ? "Pockets if you like" : ""].filter(Boolean).map(esc).join("; ")]}));
  const html = lede(`Two shops on Makers' Lane, both open 9:30am to 5:30pm every day but Sunday: ${who("ada")}'s haberdashery for fabric and buttons, and ${who("idris")} the tailor's, where he makes clothes to your design.`)
    + h2("haberdashery", "Ada's haberdashery", "haberdash")
    + `<p>Fabric comes by the piece: one material, in one of twelve colours and a pattern. Buttons come by the card. Ada buys back unused fabric at half what you paid (never more than she sells it for).</p>`
    + T(["Fabric", "Price", "", "Ada buys it back for"], mats)
    + `<p class="muted">Buy-back shown for a plain piece; patterns add to both.</p>`
    + T(["Pattern", "Extra"], pats)
    + h3("colours", "Colours") + `<p>${swatch}</p>`
    + h3("buttons", "Buttons") + T(["Buttons", "Price"], buttons)
    + h2("tailor", "Idris the tailor", "tailor")
    + `<p>Choose a garment, a fabric from your sewing basket and the details, with a live preview on you. A garment takes a few pieces of one fabric (a long one a piece more). His fee is paid when you finalise; it's ready the next morning from ${SW.READY_HOUR}am. Collect it and it's in your wardrobe.</p>`
    + T(["Garment", "Pieces", "His fee", "Choices"], garments)
    + `<p>Extras on his fee: ${coin(3)} for puff sleeves, ${coin(3)} for a collar (a shirt's comes with it), ${coin(2)} for pockets and ${coin(4)} for a long hem. Buttons use one card from your basket.</p>`;
  const search = [...Object.entries(SW.GARMENTS).map(([k, g]) => ({t: g.n, d: `Made by Idris the tailor, from ${g.fee} coins`, a: "/tailor-and-haberdashery#garment-" + k})),
    ...Object.entries(SW.MATERIALS).map(([k, m]) => ({t: `${m.n} fabric`, d: `Ada's haberdashery, ${m.price} coins a piece`, a: "/tailor-and-haberdashery#fabric-" + k}))];
  return {slug: "tailor-and-haberdashery", title: "Tailor and haberdashery", navTitle: "Tailor and haberdashery", section: "making", blurb: "Ada's fabric and buttons, and clothes made to your design by Idris", html, search};
}

export const pages = () => [vineyardPage(), millPage(), kitchenPage(), scoopPage(), cocoaPage(), giftPage(), paperiePage(), tailorPage()];
