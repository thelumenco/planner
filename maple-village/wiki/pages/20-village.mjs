// The village: every place in Honeybrook (outdoor screens, buildings and the rooms inside them), and the markets
// on the field with every stall. From src/data/world.js (VILLAGE, ROOMS, INNER) and src/game/tours.js.
import { VILLAGE, ROOMS, INNER } from "../../src/data/world.js";
import { ITEMS, DECOR } from "../../src/data/items.js";
import { NPCS } from "../../src/data/npcs.js";
import { GOALS } from "../../src/game/goals.js";
import { SHOP as VINE_SHOP } from "../../src/game/vineyard.js";
import { OPEN as SC_OPEN, CLOSE as SC_CLOSE } from "../../src/game/scoop.js";
import { OPEN as CC_OPEN, CLOSE as CC_CLOSE } from "../../src/game/cocoa.js";
import { GIFT_HOURS } from "../../src/game/giftshop.js";
import { TAXI_FEE, TAXI_FROM, TAXI_TO, BIKE_FEE, BIKE_MINS } from "../../src/game/transport.js";
import { TRAINS } from "../../src/game/rail.js";
import { MARKET, FAIR, NIGHT, XMAS, eventsOn, XMAS_FROM, XMAS_TO } from "../../src/game/tours.js";
import { POOLS } from "../../src/data/stall-goods.js";
import { TREATS as XM_TREATS } from "../../src/game/xmas.js";
import { thingName } from "../lib.mjs";
import { SALON, PRICE as SALON_PRICE } from "../../src/game/salon.js";
import { STYLES as HAIR_STYLES, HAIRS } from "../../src/game/look.js";
import { esc, table, ico, itemIcon, coin, lede, hm, slugify } from "../lib.mjs";

const h2 = (id, t, icon) => `<h2 id="${id}">${icon ? ico(icon, 22) + " " : ""}${esc(t)}</h2>`;
const h3 = (id, t) => `<h3 id="${id}">${esc(t)}</h3>`;
const nm = id => (NPCS.find(n => n.id === id) || {name: id}).name;
const cap = s => s ? s[0].toUpperCase() + s.slice(1) : s;
const goal = k => `Once you've bought ${GOALS[k].n.replace(/^The /, "the ")} (${coin(GOALS[k].price)})`;

// the outdoor screens, in walking order, with what's there
const AREAS = [
  {scene: "base", id: "home", n: "Home", icon: "home", line: "Uncle Wilf's old house and garden, over the river from the town square: the pond, the shed, the animal run, the tree swing and your little jetty."},
  {scene: "village", id: "town-square", n: "The town square", icon: "hall", line: "The middle of Honeybrook: the town hall, the bank, the library, the post office, the market and the quest board, with paths out to everywhere."},
  {scene: "lane", id: "makers-lane", n: "Makers' Lane", icon: "carpentry", line: "Through the gate from the town square: Bo's workshop, Ada's haberdashery, Idris the tailor's and Mr Okada's house."},
  {scene: "vineyard", id: "the-vineyard", n: "The vineyard", icon: "grape_red", more: "/vineyard-and-wine", line: "Over the footbridge from home: your vines, the barrel shed, the vineyard stall, the wine shop and a playground."},
  {scene: "orchard", id: "the-orchard", n: "The orchard", icon: "apple", more: "/orchard", line: "Farid's fruit trees, west of home, with the farm shop, the tour sign and Farid and Mei's cottage."},
  {scene: "flowers", id: "the-flower-farm", n: "The flower farm", icon: "tulip", more: "/flower-farm", line: "Mei's flower farm, through the arch beyond the orchard."},
  {scene: "field", id: "the-field", n: "The field", icon: "kite", more: "/field", line: "An open meadow with a lake, west of the town square: the markets and fairs, the football pitch, the exercise lawn, kite flying and, at Christmas, the tree and Santa's grotto."},
  {scene: "shore", id: "the-foreshore", n: "The foreshore", icon: "fish", more: "/foreshore", line: "The sea along the west side, a boardwalk and a jetty, with the paddleboard rack, the ferry and three villagers' homes."},
  {scene: "bay", id: "the-bay", n: "The bay", icon: "icecream", line: "Up the boardwalk from the foreshore: the Scoop Shack and its deck, and the old shopfront that becomes the Cocoa Room."},
  {scene: "hfarm", id: "wildflower-farm", n: "Wildflower Farm", icon: "goat", line: "Felix and Elena's farm, east of the bay and above the field: the farmhouse, the barn, the beehives, the cows and the goats."},
  {scene: "hlane", id: "the-cottage-lane", n: "The cottage lane and Honeybrook station", icon: "lantern", line: "Above the town square: the station, four cottages, the old windmill and a spot for a campervan."},
  {scene: "hwoods", id: "honeybrook-woods", n: "Honeybrook Woods", icon: "mushroom", more: "/woods", line: "East through the gate from the cottage lane: the ranger's cabin, the foraging patch, the lookout, a fishing spot and the wish-tower."}
];
// where a place's own page is (other sections of the wiki)
const MORE = {wineshop: "/vineyard-and-wine", kitchen: "/kitchen-and-tapas", cellar: "/vineyard-and-wine", cave: "/secret-passage", giftshop: "/gift-shop", scoopshop: "/scoop-shack", cocoa: "/cocoa-room", mill: "/olive-mill",
  farm: "/garden-and-crops", bluebell: "/elenas-cottages", figtree: "/elenas-cottages", station: "/trips", timetable: "/trips", ferry: "/islands", boat: "/islands", barrels: "/vineyard-and-wine", vinestall: "/vineyard-and-wine",
  grove: "/olive-mill", olive: "/olive-mill", farmshop: "/orchard", toursign: "/orchard", cacao: "/cocoa-room", forage: "/woods", ranger: "/woods", reno: "/cocoa-room",
  fishriver: "/fishing", fishlake: "/fishing", fishsea: "/fishing", fishpool: "/fishing", fishbay: "/fishing", fishvan: "/fishing", hives: "/places#wildflower-farm", run: "/pets#the-animal-run", mstall: "/markets"};
// what's needed first, or when it's open
const NEED = {cave: "A secret, found over a few days of clues once the cellar door is built", terrace: `Once the terrace is built (${coin(VINE_SHOP.terrace.price)} at the vineyard stall)`, cellar: goal("cellar"), giftshop: goal("giftshop"), cocoa: goal("cocoa"), cocoakitchen: goal("cocoa"),
  mill: goal("mill"), millup: goal("millshop"), van: goal("van"), boat: goal("boat"), greenhouse: goal("greenhouse"), reno: "Until it becomes the Cocoa Room",
  scoopdip: "Once the Scoop Shack has its dip station (an upgrade)", hfreezer: "Once the Scoop Shack has its honesty freezer (an upgrade)", dbike: "Once the Scoop Shack has its delivery bike (an upgrade)",
  bluebell: "A holiday let of Elena's, until you buy it", figtree: "A holiday let of Elena's, until you buy it", olive: "Once it's planted (bought at the vineyard stall)", treehouse: `Once you've bought it on the Gifts tab at Hana's market (${coin(ITEMS.treehouse.price)})`};
const HOURS = {
  scoopshop: `${hm(SC_OPEN)} to ${hm(SC_CLOSE)}, every day`, hfreezer: `${hm(7*60)} to ${hm(SC_OPEN)} and ${hm(SC_CLOSE)} to ${hm(22*60)}, while the shop's shut`,
  cocoa: `${hm(CC_OPEN)} to ${hm(CC_CLOSE)}, closed Mondays (open Mondays too with a second assistant)`,
  giftshop: `${hm(GIFT_HOURS.from)} to ${hm(GIFT_HOURS.to)} with Posy behind the till, closed Mondays`,
  haberdash: `${hm(9*60 + 30)} to ${hm(17*60 + 30)}, every day but Sunday`, tailor: `${hm(9*60 + 30)} to ${hm(17*60 + 30)}, every day but Sunday`,
  millup: `Hazel's there ${hm(10*60)} to ${hm(17*60)}, every day but Monday`, wineshop: `Customers ${hm(10*60)} to ${hm(22*60)}`,
  fishvan: `Fridays, ${hm(17*60)} to ${hm(22*60)}`, fishbay: `Fridays, ${hm(17*60)} to ${hm(20*60)}`, xgrotto: `Weekend evenings in the Christmas season, ${hm(17*60)} to ${hm(20*60)}`,
  taxiwoods: `${hm(TAXI_FROM)} to ${hm(TAXI_TO)}`, taxilane: `${hm(TAXI_FROM)} to ${hm(TAXI_TO)}`, taxilake: `${hm(TAXI_FROM)} to ${hm(TAXI_TO)}`, taxishore: `${hm(TAXI_FROM)} to ${hm(TAXI_TO)}`,
  exlawn: `Hana's class, ${hm(8*60)} to ${hm(9*60)}, Monday to Saturday`,
  okadahouse: `Mika's chair, ${hm(SALON.from)} to ${hm(SALON.to)}, Tuesday to Saturday`
};
// a few places want a word more than their one line in the game
const EXTRA = {
  market: "Hana's shop, with tabs for seeds, treats, the deli, pet care, gifts, animals, things for your home, things for you and your room, and selling what you've grown and made.",
  haberdash: "Ada sells fabric by the piece and buttons by the card, and buys unused fabric back at half price. She always has every fabric and button in stock.",
  tailor: "Idris makes clothes to your design from your fabric: ready the next morning from 9.",
  treehouse: "Up the ladder in the swing tree: a window seat at a round window (the view follows the time of day and the weather), a shelf with your letters, the daydream jar, and floor cushions for you and your pet. See <a href=\"/home#treehouse\">Home</a>.",
  okadahouse: `Mr Okada lives here with his granddaughter <a href="/villagers/mika">Mika</a>, who cuts hair in the corner of his front room (look for her sign by the path: "Mika's: hair, by appointment"). Tap her chair and pick a style and a colour; you see it on you before you decide. A new style is ${coin(SALON_PRICE.style)}, a new colour ${coin(SALON_PRICE.colour)}, both ${coin(SALON_PRICE.style + SALON_PRICE.colour)}. Keep it as it is and there's nothing to pay, and there's an Undo straight after. ${HAIR_STYLES.length} styles (${HAIR_STYLES.map(([, n]) => n.toLowerCase()).join(", ")}) and ${HAIRS.length} colours. Her last story chapter makes your next visit free.`,
  hall: "Through the archway on the west wall: the courtyard, with your trophies (see <a href=\"/collections#trophies\">Collections</a>).",
  news: "Tap it for your wins, and the village calendar: what's on over the next fortnight, and the festivals coming up (see the <a href=\"/calendar\">Calendar</a>).",
  post: "Letters, parcels and your post box. Penny's hamper table comes out for Valentine's, Mother's Day and Christmas.",
  library: "", home: "Four doors off the living room: your room, the home office, the garage and the guest room.",
  bikesvillage: `Hire a bike for an hour: ${coin(BIKE_FEE)}. It goes back to the nearest rack by itself.`, bikesst: `Hire a bike for an hour: ${coin(BIKE_FEE)}.`, bikeswoods: `Hire a bike for an hour: ${coin(BIKE_FEE)}.`,
  taxiwoods: `Any stop to any other: ${coin(TAXI_FEE)}.`, taxilane: `Any stop to any other: ${coin(TAXI_FEE)}.`, taxilake: `Any stop to any other: ${coin(TAXI_FEE)}.`, taxishore: `Any stop to any other: ${coin(TAXI_FEE)}.`,
  homejetty: `The river taxi stops here too (${hm(TAXI_FROM)} to ${hm(TAXI_TO)}).`, suprack: "Paddle about with the dolphins, or paddle home up the river. Your pet hops on the front of your board.",
  ferry: "Boats to the islands: see Islands.", station: "Day trips by train: see Trips.", mill: "Opened up as an olive mill: a millstone, a press and clay jars. Upstairs becomes the Mill Shop."
};
const ICON = {treehouse: "treehouse", hall: "hall", carpentry: "carpentry", library: "library", haberdash: "haberdash", tailor: "tailor", okadahouse: "okadahouse", post: "post", market: "market", home: "home", farm: "farm", board: "board",
  well: "well", news: "note", bench: "chat", pond: "water", shed: "wateringCan", letterbox: "letter", run: "hen", swing: "sparkle", wineshop: "wine_red", barrels: "wine_red", vinestall: "grape_red", grove: "olives", olive: "olives",
  cottage: "home", cacao: "chocolate", farmshop: "apple", toursign: "board", lake: "water", picnic: "picnic", jazzhat: "music", xgrotto: "xm_santaphoto", xtree: "xm_star", pitch: "ball", hanatheo: "home", linjun: "home", tomiposy: "home",
  suprack: "water", ferry: "taxi", wishtower: "sparkle", boat: "taxi", dolphins: "eyes", exlawn: "walker", scoopshop: "icecream", fishvan: "fish", kites: "kite", screen: "popcorn", popcorn: "popcorn", kitefly: "kite", deck: "ic_cone",
  hfreezer: "ic_cup", dbike: "bike", cocoa: "chocolate", station: "taxi", timetable: "clock", honeysuckle: "home", clover: "home", bluebell: "bed", figtree: "bed", mill: "oliveoil", windmill: "oliveoil", vanspot: "taxi", van: "taxi",
  farmhouse: "home", barn: "goatmilk", hives: "honey", cows: "milk", goats: "goat", fstand: "honey", reno: "hammock", ranger: "home", forage: "mushroom", lookout: "eyes", bikeswoods: "bike", bikesst: "bike", bikesvillage: "bike",
  fishriver: "rod", fishlake: "rod", fishsea: "rod", fishpool: "rod", fishbay: "rod", taxiwoods: "taxi", taxilane: "taxi", taxilake: "taxi", taxishore: "taxi", homejetty: "water", terrace: "wine_rose", pswing: "sparkle", pslide: "sparkle", pround: "sparkle", pseesaw: "sparkle"};
// leftover stations kept for old saves that do nothing much now, and decorations without a name
const SKIP_ST = new Set(["kudos", "affirm", "jars", "ped0", "ped1", "ped2", "ped3", "ped4", "ped5", "vault0", "vault1", "vault2", "vault3", "vault4"]);
const SKIP_PLACE = new Set(["stray", "van", "base"]);
const LET_INNER = /^(bluebell|figtree)(up|bath|gdn)$/;

const anchor = id => "p-" + slugify(id);
const more = id => MORE[id] || (/^mstall|^bm\d/.test(id) ? MORE.mstall : "");
const ROOM_N = {greenhouse: "The greenhouse", millup: "The Mill Shop, upstairs"};
const ROOM_LINE = {greenhouse: GOALS.greenhouse.line, millup: GOALS.millshop.line};
const roomName = id => ROOM_N[id] || (ROOMS[id] && ROOMS[id].name) || (VILLAGE[id] && VILLAGE[id].name) || id;
// the rooms inside a building, in order: itself, then anything whose door is in it (not the holiday cottages' own rooms)
const innerOf = id => Object.keys(INNER).filter(k => INNER[k].parent === id && !LET_INNER.test(k)).flatMap(k => [k, ...innerOf(k)]);
function stationsHTML(roomId){
  const r = ROOMS[roomId]; if (!r) return "";
  const st = r.stations.filter(s => s[1] && !SKIP_ST.has(s[0]) && !/door$/.test(s[3]) && s[3] !== "bedroomdoor");
  return st.length ? `<ul class="plain">${st.map(s => `<li><b>${esc(s[1])}</b>: ${esc(s[5])}</li>`).join("")}</ul>` : "";
}
function buildingHTML(id){
  const v = VILLAGE[id], rooms = innerOf(id).filter(r => ROOMS[r] || ROOM_N[r]);
  const notes = [NEED[id], HOURS[id] ? "Open " + HOURS[id] : "", EXTRA[id], more(id) ? `<a href="${more(id)}">Read more</a>` : ""].filter(Boolean);
  let h = `<div class="box" id="${anchor(id)}"><h3 style="margin-top:0">${ico(ICON[id] || "home", 24)} ${esc(v.name)}</h3>${notes.map(n => `<p class="muted" style="margin:.2em 0">${n}</p>`).join("")}`;
  if (ROOMS[id] && id !== "bluebell" && id !== "figtree") h += stationsHTML(id);
  for (const r of rooms) {
    const n2 = [NEED[r], HOURS[r] ? "Open " + HOURS[r] : "", MORE[r] ? `<a href="${MORE[r]}">More</a>` : ""].filter(Boolean);
    h += `<h4 style="margin:.9em 0 .2em" id="${anchor(r)}">${esc(roomName(r))}</h4>${ROOM_LINE[r] ? `<p style="margin:.1em 0">${esc(ROOM_LINE[r])}</p>` : ""}${n2.length ? `<p class="muted" style="margin:.1em 0">${n2.join(" · ")}</p>` : ""}${stationsHTML(r)}`;
  }
  return h + "</div>";
}

function placesPage(){
  const search = [];
  let body = "";
  for (const a of AREAS) {
    const all = Object.entries(VILLAGE).filter(([id, v]) => v.scene === a.scene && !SKIP_PLACE.has(id));
    const gates = all.filter(([, v]) => v.bridge), spots = all.filter(([, v]) => v.spot && !v.bridge), blds = all.filter(([, v]) => !v.spot && !v.bridge);
    // the market stalls along the field are one row
    const stalls = spots.filter(([id]) => /^mstall|^bm\d/.test(id)), plain = spots.filter(([id]) => !/^mstall|^bm\d/.test(id));
    const rows = plain.map(([id, v]) => [`<span id="${anchor(id)}">${ico(ICON[id] || "sparkle", 22)}<b>${esc(v.name)}</b></span>`,
      [esc(v.line || ""), EXTRA[id] || "", NEED[id] ? `<span class="muted">${NEED[id]}.</span>` : "", HOURS[id] ? `<span class="tag">${esc(HOURS[id])}</span>` : "", more(id) ? `<a href="${more(id)}">More</a>` : ""].filter(Boolean).join(" ")]);
    if (stalls.length) rows.push([`${ico("market", 22)}<b>Market stalls</b>`, `A row of stalls along the top of the field, and carts on the grass, for the markets and fairs. <a href="/markets">See every stall</a>.`]);
    body += h2(a.id, a.n, a.icon) + `<p>${esc(a.line)}${a.more ? ` <a href="${a.more}">More about ${esc(a.n.replace(/^The /, "the "))}</a>.` : ""}</p>`;
    if (blds.length) body += blds.map(([id]) => buildingHTML(id)).join("");
    if (rows.length) body += h3(a.id + "-around", "Around " + a.n.replace(/^The /, "the ")) + table(["Place", "What's there"], rows);
    if (gates.length) body += `<p class="muted">Ways out: ${gates.map(([, v]) => esc(v.name)).join(" · ")}.</p>`;
    if (a.scene === "hlane") body += h3("train-times", "Train times") + table(["Time", "Train", ""], TRAINS.map(t => [hm(t.t), `<b>${esc(t.n)}</b> ${esc(t.to)}`, esc(t.line)]));
    search.push({t: a.n, d: "A place in Honeybrook", a: "/places#" + a.id});
    for (const [id, v] of [...blds, ...plain]) search.push({t: v.name, d: `In ${a.n.replace(/^The /, "the ")}`, a: "/places#" + anchor(id)});
    for (const [id] of blds) for (const r of innerOf(id)) if (ROOMS[r] || ROOM_N[r]) search.push({t: roomName(r), d: `Inside ${VILLAGE[id].name}`, a: "/places#" + anchor(r)});
  }
  search.push({t: "Train times", d: "Honeybrook station's timetable", a: "/places#train-times"}, {t: "River taxi", d: `${hm(TAXI_FROM)} to ${hm(TAXI_TO)}, ${TAXI_FEE} coins`, a: "/places#" + anchor("taxilane")}, {t: "Bike hire", d: `${BIKE_FEE} coins for ${BIKE_MINS} minutes`, a: "/places#" + anchor("bikesvillage")});
  const contents = `<div class="cards" style="grid-template-columns:repeat(auto-fill,minmax(150px,1fr))">${AREAS.map(a => `<a class="card" href="#${a.id}">${ico(a.icon, 26)}<span><b>${esc(a.n)}</b></span></a>`).join("")}</div>`;
  const html = lede("Every place in Honeybrook, screen by screen: the buildings and the rooms inside them, what there is to do, and opening hours where a place keeps them. Places that need something bought first say so.")
    + contents
    + `<p class="muted">Getting about: walk between screens through the gates and paths, hire a bike (${coin(BIKE_FEE)} for an hour), take the river taxi (${coin(TAXI_FEE)}, ${hm(TAXI_FROM)} to ${hm(TAXI_TO)}), paddle the river, or save up for a scooter or a car.</p>`
    + body;
  return {slug: "places", title: "Places", section: "village", blurb: "Every place in Honeybrook, with what you can do there and when it's open", html, search};
}

// the markets on the field
// (the Christmas market's hot treats live in xmas.js: eaten on the spot, so they aren't items)
const goodName = id => DECOR[id] && !ITEMS[id] ? DECOR[id].n : XM_TREATS[id] ? `${XM_TREATS[id].n} (${XM_TREATS[id].price} coins)` : thingName(id);
const goodIcon = id => ITEMS[id] ? itemIcon(id, 22) : DECOR[id] ? ico(DECOR[id].ico, 22) : XM_TREATS[id] ? ico(id, 22) : "";
const goodsCell = (st, pool) => {
  const ids = [...(st.items || []), ...(st.treats || []), ...(st.decor || []), ...((pool || {})[st.id] || [])];
  if (st.produce) return "Whatever vegetables and berries are in season";
  if (st.kind === "wine") return "Bottles and tastings from your own wine shop's shelves";
  if (st.kind === "orchard") return "Fruit and flowers from the orchard's farm shop";
  if (st.kind === "scoop") return "Gelato from your Scoop Shack's display";
  if (st.kind === "cocoa") return "Bars and bonbons from your Cocoa Room";
  if (st.kind === "mine") return "Your own stall: things you've made, which sell while you stand behind it";
  if (st.kind === "mulled") return "Cups of mulled wine from your own pot";
  if (st.act === "kite") return "Kites, to fly on the field";
  if (st.act === "face") return "Face painting: butterflies, tigers, dinosaurs";
  return [...new Set(ids)].map(id => `${goodIcon(id)}${esc(goodName(id))}`).join("<br>");
};
const keeper = st => st.kind === "mine" ? "You" : nm(st.id);
const stallTable = (list, pool) => table(["Stall", "Kept by", "What it can have"], list.map(st => [`<b>${esc(st.n)}</b>${st.line ? `<br><small class="muted">"${esc(st.line)}"</small>` : ""}`, esc(keeper(st)) + (st.needs ? ` <span class="muted">(once it's yours)</span>` : ""), goodsCell(st, pool)]));
function marketsPage(){
  // times straight from the game's own events (a Sunday, the last Saturday of a month, a Tuesday, a December day)
  const ev = (day, kind) => eventsOn(day).find(e => e.kind === kind);
  const sun = ev("2026-10-18", "market"), fair = ev("2026-10-31", "fair"), night = ev("2026-10-20", "night"), xm = ev("2026-12-10", "xmas");
  const when = e => `${hm(e.from)} to ${hm(e.to)}`;
  const html = lede("The field west of the town square hosts Honeybrook's markets. Out-of-towners run most of the stalls, villagers keep a few, and some are yours. Stalls go up along the top of the field, with carts on the grass by the river.")
    + h2("sunday-farmers-market", "Sunday farmers market", "market") + `<p><span class="tag">Every Sunday, ${when(sun)}</span> It carries on right through the Christmas season. Your wine stall is here (Ines minds it), and so is Farid's (Mei minds it if he's away). Noor's pet adoption corner is on the grass by the river.</p>` + stallTable(MARKET, POOLS.market)
    + h2("field-fair", "The field fair", "kite") + `<p><span class="tag">The last Saturday of each month, ${when(fair)}</span> Kites, face painting, lemonade and snacks. Not held in the Christmas season.</p>` + stallTable(FAIR, POOLS.fair)
    + h2("night-market", "The night market", "lantern") + `<p><span class="tag">Tuesdays and Thursdays, ${when(night)}</span> Street food, sweets, hair things, keychains, socks and tees, and lanterns for the house, all from out-of-towners, with a jazz duo on the little stage and fairy lights over everything. The crowd comes in on the evening train. Not held in the Christmas season.</p>` + stallTable(NIGHT, POOLS.night)
    + h2("friday-market", "The Friday market", "popcorn") + `<p><span class="tag">Fridays, ${hm(16*60 + 30)} to ${hm(19*60 + 15)}</span> Three little stalls with a different mix every week, picked from what the other markets sell, and Hiro selling kites. On the last Friday of the month it packs up a quarter of an hour before movie night on the field. Not held in the Christmas season.</p>`
    + h2("christmas-market", "The Christmas market", "xm_star") + `<p><span class="tag">Every evening, 20 November to Christmas Eve, ${hm(XMAS_FROM)} to ${hm(XMAS_TO)}</span> Wooden stalls under garlands and the big tree on the football pitch, lit at half past five. It takes the place of the night market and the fair. See the <a href="/calendar#christmas">Christmas season</a>.</p>` + stallTable(XMAS, {});
  void xm;
  const search = [["sunday-farmers-market", "Sunday farmers market", "Every Sunday on the field"], ["field-fair", "Field fair", "Last Saturday of the month"], ["night-market", "Night market", "Tuesday and Thursday evenings"],
    ["friday-market", "Friday market", "Friday evenings on the field"], ["christmas-market", "Christmas market", "20 November to Christmas Eve"], ["sunday-farmers-market", "Pet adoption corner", "Noor's stall at the markets"]]
    .map(([a, t, d]) => ({t, d, a: "/markets#" + a}));
  return {slug: "markets", title: "Markets", section: "village", blurb: "The Sunday farmers market, the fair, the night market and the Christmas market, stall by stall", html, search};
}

export const pages = () => [placesPage(), marketsPage()];
