// Out and about: fishing, Honeybrook Woods, and the foreshore and the bay. Read from the game's own code and data.
import { ITEMS, SEASONS } from "../../src/data/items.js";
import { VILLAGE } from "../../src/data/world.js";
import { GOALS } from "../../src/game/goals.js";
import * as FI from "../../src/game/fishing.js";
import { FORAGE } from "../../src/game/woods.js";
import { VAN_GOODS, VAN_MULT } from "../../src/game/friday.js";
import { STOPS, TAXI_FEE, TAXI_FROM, TAXI_TO, BIKE_FEE, BIKE_MINS } from "../../src/game/transport.js";
import { VAN } from "../../src/game/tours.js";
import { esc, ico, coin, lede, hm } from "../lib.mjs";
import { dur, icon, nameOf, named, sell, T, h2, h3, who } from "./40-farming.mjs";

const WHEN = {day: "In daylight (7am to 6pm)", dawn: "Early morning (5am to 10am)", dusk: "At dusk (6pm to 8pm)", night: "At night (7pm to 6am)"};
const spotsIn = scene => Object.entries(VILLAGE).filter(([, p]) => p.scene === scene && p.line && !p.bridge);

/* ---------- fishing ---------- */
function fishingPage(){
  const spot = k => FI.SPOTS[k].n;
  const rows = Object.entries(FI.FISH).map(([id, f]) => ({id: "fish-" + id, cells: [`${icon(f.item || id, 22, "fish")}<b>${esc(f.n)}</b>${f.rare ? ` <small class="muted">rare</small>` : ""}`,
    [f.spot, ...(f.also || [])].map(k => ({river: "Home river", lake: "Lake", sea: "Sea", pool: "Waterfall pool", bay: "The bay"})[k] || spot(k)).map(esc).join(", "), esc(id === "crayfish" ? "At night, or while it's raining" : f.when ? WHEN[f.when] : f.rain ? "While it's raining" : "Any time"),
    `${f.cm[0]} to ${f.cm[1]}cm`, "●".repeat(f.hard) + `<span class="muted">${"○".repeat(5 - f.hard)}</span>`,
    id === "koi" ? "Goes in your home pond" : f.junk ? `<span class="muted">${id === "seaglass" ? "For the windowsill" : "Journal only"}</span>` : `${f.item === "fish" ? "Fish" : esc(nameOf(f.item))}, ${sell(f.item)}`]}));
  const spots = Object.entries(FI.SPOTS).map(([k, s]) => ({id: "spot-" + k, cells: [`<b>${esc(s.n)}</b>`, esc(s.line), k === "bay" ? "Fridays, 5pm to 8pm" : "Any time"]}));
  const van = Object.entries(VAN_GOODS).map(([id, g]) => [`${icon(id === "worms" ? "rod" : id, 22, "fish")}${esc(g.n)}`, coin(g.price), esc(g.line)]);
  const html = lede(`Five places to fish around Honeybrook, each with its own fish: some only at certain times of day or in the rain, and a rare golden koi on the home river at dusk.`)
    + h2("rod", "Rod, reel and worms", "rod")
    + `<ul class="plain"><li><b>A rod</b> is ${coin(FI.ROD)} (Mei recommends the tackle shop's best one), and it lasts forever. Buy it at any fishing spot.</li>
      <li><b>The better reel</b> (${coin(FI.REEL)}) widens the green zone, so fish are easier to land.</li>
      <li><b>Worms</b> are the bait, and they come from getting things done: ${FI.BAIT_DAY} in the tin every morning, plus one for each quest you finish, up to ${FI.BAIT_MAX}. Each cast uses one. Sal's van sells five more on Friday evenings.</li></ul>`
    + h2("cast", "Casting and reeling", "fish")
    + `<p>Cast, and the float sits, then bobs: a bite, a few seconds later. Tap Reel while the marker's in the green to land it. Harder fish have a narrower green. Miss, or wait too long, and it's gone. Catches go in your backpack and in your fishing journal (how many, and the biggest). A golden koi isn't kept: it goes in the pond at home, where it stays (up to three).</p>`
    + h2("spots", "Where to fish", "water")
    + T(["Spot", "", "Open"], spots)
    + h2("fish", "Every catch", "trout")
    + `<p class="muted">Difficulty is out of five. The everyday river and lake fish go in your backpack as "fish": the grilled fish small plate at the kitchen, or a treat for your pet. The rest are kitchen ingredients for seafood tapas (see <a href="/kitchen-and-tapas">Kitchen and tapas</a>).</p>`
    + T(["Catch", "Where", "When", "Size", "Difficulty", "Gives, and sells for"], rows)
    + h2("selling", "Selling your catch", "coin")
    + `<p>Sell your catch from any fishing spot (the fishmonger's van takes it), at the prices above. On Friday evenings, ${hm(VAN[0])} to ${hm(VAN[1])}, Sal parks his van at the bay and pays half as much again (${VAN_MULT} times). He sells a few things too:</p>`
    + T(["At Sal's van", "Price", ""], van);
  const search = Object.entries(FI.FISH).map(([id, f]) => ({t: f.n, d: `Fishing: ${spot(f.spot).replace(/^The /, "the ")}`, a: "/fishing#fish-" + id}))
    .concat([{t: "Fishing rod", d: `${FI.ROD} coins`, a: "/fishing#rod"}, {t: "Worms", d: "Bait for fishing", a: "/fishing#rod"}, {t: "Sal's fish van", d: "Friday evenings at the bay", a: "/fishing#selling"}]);
  return {slug: "fishing", title: "Fishing", section: "outdoors", blurb: "Rods, worms, every fishing spot and every catch", html, search};
}

/* ---------- Honeybrook Woods ---------- */
function woodsPage(){
  const forage = Object.entries(FORAGE).map(([s, f]) => ({id: "forage-" + f.id, cells: [`<b>${esc(SEASONS[s].n)}</b>`, named(f.id, 24), `${f.n}${f.id === "mushroom" ? ", one more after rain" : ""}`, sell(f.id), esc((ITEMS[f.id].what || "").replace(/^from the woods: /, ""))]}));
  const places = spotsIn("hwoods").map(([id, p]) => [`<b>${esc(p.name)}</b>`, esc(p.line)]);
  const stops = Object.values(STOPS).map(s => [`<b>${esc(s.n)}</b>`, esc(s.line[0].toUpperCase() + s.line.slice(1))]);
  const html = lede(`Honeybrook Woods, up the hill from Makers' Lane: a waterfall and its pool, a foraging patch, a lookout over the whole village, and the cabin where ${who("wren")} the ranger keeps the kettle on.`)
    + h2("places", "Around the woods", "sprout")
    + T(["Place", ""], places)
    + h2("foraging", "Foraging", "mushroom")
    + `<p>Once a day, the foraging patch gives whatever's in season. The noticeboard at the ranger's cabin says what's in.</p>`
    + T(["Season", "What you find", "How many", "Each sells for", "Use it for"], forage)
    + h2("pool", "The waterfall pool", "trout")
    + `<p>Cold, clear water under the falls: brown trout, grayling (in daylight) and minnows. Bring a rod and worms. See <a href="/fishing#spot-pool">Fishing</a>.</p>`
    + h2("wish-tower", "The wish-tower", "sparkle")
    + `<p>A little tower of stones by the river. Add a stone once a day and make a wish.</p>`
    + h2("taxi", "The river taxi", "taxi")
    + `<p>The river taxi runs ${hm(TAXI_FROM)} to ${hm(TAXI_TO)}, ${coin(TAXI_FEE)} a ride, from the waterfall pool downstream. It's the quick way to the orchard and the flower farm.</p>`
    + T(["Stop", "Where it is"], stops)
    + h2("bikes", "Bike hire", "bike")
    + `<p>Hire bikes by the ranger's cabin, at the station and in the town square: ${coin(BIKE_FEE)} for ${dur(BIKE_MINS*60000)}. Faster than walking (not quite the scooter); it goes back to the rack by itself when the hour's up.</p>`;
  const search = Object.values(FORAGE).map(f => ({t: nameOf(f.id), d: "Foraged in Honeybrook Woods", a: "/woods#forage-" + f.id}))
    .concat([{t: "River taxi", d: `${TAXI_FEE} coins, ${hm(TAXI_FROM)} to ${hm(TAXI_TO)}`, a: "/woods#taxi"}, {t: "Bike hire", d: `${BIKE_FEE} coins an hour`, a: "/woods#bikes"}, {t: "Wish-tower", d: "Honeybrook Woods", a: "/woods#wish-tower"}]);
  return {slug: "woods", title: "Honeybrook Woods", navTitle: "Honeybrook Woods", section: "outdoors", blurb: "Foraging by season, the waterfall pool, the river taxi and bike hire", html, search};
}

/* ---------- the foreshore and the bay ---------- */
function shorePage(){
  const shore = spotsIn("shore").filter(([id]) => !["hanatheo", "linjun", "tomiposy"].includes(id)).map(([id, p]) => [`<b>${esc(p.name)}</b>`, esc(p.line)]);
  const bay = spotsIn("bay").filter(([id]) => !["reno"].includes(id)).map(([id, p]) => [`<b>${esc(p.name)}</b>`, esc(p.line || "")]);
  const g = GOALS.boat;
  const html = lede(`The foreshore: sand, the jetty, the paddleboard rack and a boardwalk along the sea. Up the boardwalk to the north is the bay, with the Scoop Shack, the Cocoa Room and the deck.`)
    + h2("foreshore", "Along the foreshore", "water")
    + T(["Place", ""], shore)
    + `<p>Three houses look out over it: Hana and Theo's blue house, Tomi and Posy's lilac house next door, and Lin and Juniper's green cottage by the flower-farm gate.</p>`
    + h2("paddleboarding", "Paddleboarding", "water")
    + `<ul class="plain"><li><b>Paddle about</b> from the rack by the jetty, between 6am and 7pm (not when it's stormy). The dolphins come right up to the boards, and any of Hana, Theo, Tomi and Posy who are about paddle out with you. Your pet minds the towels.</li>
      <li><b>Paddle home:</b> up the stream, across the lake and down the river to your own little jetty, or the other way from home to the foreshore. Your pet hops on the front of the board. Not after 10pm.</li>
      <li>Out-of-towners paddleboard off the foreshore too: two on weekend mornings, one early on weekdays.</li></ul>`
    + h2("dolphins", "The dolphins", "sparkle")
    + `<p>Sit on the boardwalk bench in the morning (6am to 11am) and the dolphins come by, just past the jetty.</p>`
    + h2("boat", "Your own boat", "kite")
    + `<p>${esc(g.n)}: ${coin(g.price)}, a big goal. ${esc(g.line)} From its mooring at the end of the jetty, take a dolphin cruise, or a day trip to an island: Saltwick Harbour (15 coins of fuel, up to seven friends free, dry days only) or Puffin Isle (20 coins of fuel). See <a href="/trips">Trips</a>.</p>`
    + h2("ferry", "The ferry", "kite")
    + `<p>The ferry stop at the end of the jetty: boats to the islands. See <a href="/trips">Trips</a>.</p>`
    + h2("crabbing", "Crabbing", "fish")
    + `<p>There's no crabbing in Honeybrook itself. You can go crabbing off the harbour wall at Saltwick Harbour, across on the ferry: pull up just after the twitch, and three crabs earns you a line of your own.</p>`
    + h2("bay", "The bay", "ic_cone")
    + T(["Place", ""], bay)
    + `<p>The <a href="/scoop-shack">Scoop Shack</a> and the <a href="/cocoa-room">Cocoa Room</a> are yours to run. On Friday evenings Sal's fish van parks here (${hm(VAN[0])} to ${hm(VAN[1])}), and there's <a href="/fishing#spot-bay">sunset fishing</a> off the beach, 5pm to 8pm. The gate to the east leads to <a href="/wildflower-farm">Wildflower Farm</a>.</p>`;
  const search = [{t: "Paddleboarding", d: "The foreshore", a: "/foreshore#paddleboarding"}, {t: "Dolphins", d: "The boardwalk bench, in the morning", a: "/foreshore#dolphins"},
    {t: "Dolphin cruise boat", d: `${g.price} coins`, a: "/foreshore#boat"}, {t: "Crabbing", d: "At Saltwick Harbour", a: "/foreshore#crabbing"}, {t: "The bay", d: "Scoop Shack, Cocoa Room and the deck", a: "/foreshore#bay"}];
  return {slug: "foreshore", title: "Foreshore and the bay", navTitle: "Foreshore and the bay", section: "outdoors", blurb: "Paddleboarding, dolphins, your own boat, the ferry and the bay", html, search};
}

export const pages = () => [fishingPage(), woodsPage(), shorePage()];
