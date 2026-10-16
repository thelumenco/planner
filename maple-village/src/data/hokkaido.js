// Hokkaido (round 217, the third island by ferry: ISLANDS-PLAN.md). Mel's picks: four corners of Hokkaido, one to a
// screen, side by side the way Jeju's are: Otaru's canal and glassworks (the ferry comes in here), Sapporo with its
// red-brick beer factory, Niseko under Mount Yotei, and a Furano flower farm. Snow from December to March (snow
// sculptures in Sapporo's park in February), cherry blossom in May, lavender in July, gold fields in autumn. Pale cool
// colours: grey-blue stone, white, lavender, birch-bark and soft green. Wide, open and northern: no temples, no maples.
// You arrive top left this time, at Otaru's ferry pier (the harbour faces the sea to the north).
//   hk_otaru  | hk_sapporo
//   ----------+-----------
//   hk_niseko | hk_furano
// Same shapes as data/towns.js (merged in there): the town, its places, gates, bounds, obstacles and goods.

const FRIENDS = ["hana", "theo", "farid", "mei", "bo", "tomi", "posy"];
const famSpots = per => Object.fromEntries(FRIENDS.map((id, i) => [id, Object.fromEntries(Object.entries(per).map(([sc, pts]) => [sc, [pts[i % pts.length], pts[(i + 3) % pts.length]]]))]));
const room = (door, n, say) => ({door, n, music: door.replace(/^hk/, "hk_"), party: [[200, 560], [330, 560], [120, 540], [420, 540]], say});

// the seasons (months, 1-12)
export const SNOW_MONTHS = [12, 1, 2, 3];
export const snowIn = day => SNOW_MONTHS.includes(+day.slice(5, 7));
export const festivalIn = day => +day.slice(5, 7) === 2;   // the snow festival
export const lavenderIn = day => +day.slice(5, 7) === 7;

export const HK_TOWN = {
  n: "Hokkaido", by: "ferry", fare: 90, free: [], outFrom: 7*60, outTo: 13*60, backTo: 22*60,
  screens: ["hk_otaru", "hk_sapporo", "hk_niseko", "hk_furano"], arrive: ["hk_otaru", [130, 110]], station: "hkpier", music: "hokkaido",
  ferry: {fare: 90, pier: "hkpier", arrive: ["hk_otaru", [130, 110]],
    blurb: "The far north of Japan: Otaru's canal and glassworks, Sapporo's beer factory, the ski slopes of Niseko under Mount Yotei, and the flower farms of Furano. Deep snow in winter, lavender in July. A long crossing: boats out until 1pm.",
    arriveLine: "Hokkaido! The ferry glides into Otaru past a little red lighthouse. Stone warehouses along the canal, gas lamps, and the air so clean and cold it fizzes."},
  blurb: "Otaru's canal and glassworks, Sapporo's beer factory, Niseko under Mount Yotei and the flower farms of Furano.",
  arriveLine: "Hokkaido! Stone warehouses, gas lamps along the canal, and the air so clean and cold it fizzes.",
  hints: {hk_otaru: "Otaru: the ferry pier (boats home till 10pm), the canal, the glassworks and the music box hall. East: Sapporo. South: Niseko.",
    hk_sapporo: "Sapporo: the clock tower, the beer factory, the ramen shop and the long park. West: Otaru. South: Furano.",
    hk_niseko: "Niseko: Mount Yotei, the slopes (skiing in winter, the river in summer), the ski lodge and the foot bath. North: Otaru. East: Furano.",
    hk_furano: "Furano: the flower farm, the dairy, the melon stall and the lone tree on the hill. North: Sapporo. West: Niseko."},
  spots: famSpots({
    hk_otaru: [[200, 400], [300, 420], [380, 500], [260, 280], [160, 520], [420, 400]],
    hk_sapporo: [[300, 260], [140, 520], [260, 500], [420, 280], [200, 280], [440, 560]],
    hk_niseko: [[200, 240], [300, 260], [260, 450], [420, 260], [160, 460], [440, 460]],
    hk_furano: [[200, 260], [300, 260], [260, 460], [420, 470], [180, 380], [380, 520]]}),
  // what your friends do here, and nowhere else: Hana soaks her feet in the foot bath, Bo has a soft-serve, Posy lies in
  // the flower fields, Theo raises a glass in the beer garden, and Tomi skis down the nursery slope (in the snow months)
  acts: {
    hana: {hk_niseko: {act: "footbath", at: [380, 420], dir: 1}},
    bo: {hk_furano: {act: "softserve", at: [400, 460], dir: -1}},
    posy: {hk_furano: {act: "flowerlie", at: [200, 260], dir: 1}},
    theo: {hk_sapporo: {act: "toast", at: [400, 540], dir: -1, hours: [[11*60, 21*60]]}},
    tomi: {hk_niseko: {act: "ski", at: [220, 200], dir: 1}}
  },
  rooms: {
    hk_glass: room("hkglass", "The glassworks", "The glassworks: the roar of the furnace, glowing gobs of glass on long pipes, and shelves to the ceiling of floats, lamps and little glass animals catching the light."),
    hk_musicbox: room("hkmusicbox", "The music box hall", "The music box hall: a great brick room full of tinkling, thousands of music boxes on every shelf, and a steam clock outside that whistles on the quarter hour."),
    hk_beer: room("hkbeer", "The beer factory", "The beer factory: tall copper kettles shining, a long brick hall with high windows, the smell of malt, and long wooden tables in the tasting hall."),
    hk_ramen: room("hkramen", "The ramen shop", "The ramen shop: a counter with eight stools, clouds of steam, a pot that's been simmering since dawn, and the clatter of bowls."),
    hk_lodge: room("hklodge", "The ski lodge", "The ski lodge: skis in racks, boots drying by a roaring stove, big windows full of Mount Yotei, and hot chocolate on the go."),
    hk_dairy: room("hkdairy", "The Furano dairy", "The Furano dairy: steel churns, a cheese cellar down a few steps, milk in glass bottles, and a soft-serve machine humming in the corner.")
  },
  lines: {
    hana: ["The air! It's like breathing cold water. In a good way.", "Snow on the canal and the gas lamps lit. I'm in a postcard.", "A foot bath, outside, in the snow. Hokkaido has thought of everything."],
    theo: ["Those warehouses are stone from the 1890s. Built for herring, would you believe.", "Red brick, a tall chimney and a star on the gable. The beer factory's a beauty.", "Mount Yotei: they call it the Fuji of Hokkaido. You can see why."],
    farid: ["Corn on the cob with butter, from a stall! Just like home. Better than home. Don't tell home.", "The milk here is so creamy. I want to make cheese with it immediately.", "Miso ramen with butter and corn. Hokkaido puts butter on everything. I respect it."],
    mei: ["Clean, cold air. Very good for the lungs.", "The glassblowers make it look easy. It is not easy.", "Wide sky. Big fields. Nobody in a hurry. I like it."],
    bo: ["I've had a melon soft-serve, a lavender soft-serve and a milk soft-serve. Research.", "The music boxes! There's one that plays a tune I know and I can't think what it is.", "Snow up to my knees. Up to my knees!"],
    tomi: ["Powder snow! Real powder! It squeaks when you walk on it.", "I'm going up the slope. Then I'm coming down the slope. Very fast. Maybe.", "Beer, ramen, soft-serve. In that order. Or any order."],
    posy: ["The flower stripes go all the way up the hill. Purple, white, pink, red, yellow.", "A glass float in every colour. I want every colour.", "The steam clock whistled at me. I whistled back."]
  },
  say: {
    hkpier: "The ferry pier: the ferry tied up at Otaru's harbour, a little red lighthouse on the breakwater, ferries home to Honeybrook until 10pm.",
    hkcanal: "Otaru canal: old stone warehouses along the water, gas lamps on iron posts, and swans in the winter. In February, the canal's lined with snow lanterns.",
    hkglass: "The glassworks: an old stone warehouse with its doors open and the furnace glowing orange inside.",
    hkmusicbox: "The music box hall: a red-brick building with a green steam clock outside, puffing and whistling on the quarter hour.",
    hkmarket: "The morning market: crab, scallops, salmon roe, sea urchin and kelp, laid out on crushed ice under a blue awning.",
    hkclock: "The steam clock: a green iron clock tower on the corner, puffing steam and whistling the Westminster chimes.",
    hkclocktower: "Sapporo clock tower: a white wooden building with a red roof and a clock that's kept time since 1881.",
    hkbeer: "The beer factory: red brick, a tall chimney, and a red star on the gable. The tours start on the hour.",
    hkramen: "The ramen shop: a red lantern, a noren curtain across the door, and a queue that's worth it.",
    hkpark: "The long park: a ribbon of green right through the middle of the city, with fountains, flower beds and a TV tower at the end.",
    hksculpt: "The snow sculpture plot: in February, giant sculptures of castles and animals, carved from snow, all down the park. The rest of the year, a fountain.",
    hkgarden: "The beer garden: long tables under the trees in summer, jugs of beer and lamb sizzling on little domed grills.",
    hkslope: "The slopes: Mount Yotei behind, the ski lift creaking up. In the snow months, the softest powder in the world. In summer, green and full of wildflowers.",
    hkriver: "The river: clear and cold and fast from the mountain. In summer, the rafts go down it, everyone shrieking.",
    hklodge: "The ski lodge: a big log building with a deep roof, skis outside, and a chimney going full blast.",
    hkfootbath: "The foot bath: a wooden trough of hot spring water under a little roof. Sit on the edge, take off your shoes, and put your feet in. Bliss.",
    hkflowers: "The flower farm: stripes of flowers running up the hill: lavender, poppies, baby's breath, marigolds, salvia. In July the whole hill's purple.",
    hkdairy: "The Furano dairy: a red barn with a silo, cows in the field, and a sign: SOFT-SERVE.",
    hkmelon: "The melon stall: Furano's famous melons, orange inside, sweet as honey, cut into wedges and sold on sticks.",
    hktree: "The lone tree: one tall poplar on the crest of the hill, all on its own. It's been there for a hundred years, and everyone photographs it."
  }
};

export const HK_PLACES = {
  // Otaru (arrive here): the pier, the canal, the glassworks, the music box hall, the market, the steam clock
  hkpier: {scene: "hk_otaru", name: "The ferry pier", door: [130, 96], spot: true, mark: [200, 80], line: "The ferry pier. Ferries home to Honeybrook until 10pm."},
  hkglass: {scene: "hk_otaru", name: "The glassworks", door: [130, 270], spot: true, mark: [130, 150], line: "The glassworks."},
  hkmusicbox: {scene: "hk_otaru", name: "The music box hall", door: [390, 270], spot: true, mark: [390, 150], line: "The music box hall."},
  hkcanal: {scene: "hk_otaru", name: "The canal", door: [270, 300], spot: true, mark: [270, 330], line: "The canal."},
  hkmarket: {scene: "hk_otaru", name: "The morning market", door: [130, 516], spot: true, mark: [130, 440], line: "The morning market."},
  hkclock: {scene: "hk_otaru", name: "The steam clock", door: [440, 470], spot: true, mark: [440, 400], line: "The steam clock."},
  hkToSapporo: {scene: "hk_otaru", name: "To Sapporo", door: [504, 560], spot: true, bridge: "hk_sapporo", mark: [476, 500], line: "East to Sapporo."},
  hkToNiseko: {scene: "hk_otaru", name: "To Niseko", door: [262, 612], spot: true, bridge: "hk_niseko", mark: [200, 590], line: "South to Niseko."},
  // Sapporo: the clock tower, the beer factory, the ramen shop, the park, the sculpture, the beer garden
  hkclocktower: {scene: "hk_sapporo", name: "The clock tower", door: [120, 216], spot: true, mark: [120, 90], line: "The clock tower."},
  hkbeer: {scene: "hk_sapporo", name: "The beer factory", door: [390, 226], spot: true, mark: [390, 90], line: "The beer factory."},
  hkramen: {scene: "hk_sapporo", name: "The ramen shop", door: [390, 436], spot: true, mark: [390, 330], line: "The ramen shop."},
  hkpark: {scene: "hk_sapporo", name: "The long park", door: [140, 300], spot: true, mark: [140, 340], line: "The long park."},
  hksculpt: {scene: "hk_sapporo", name: "The snow sculpture plot", door: [140, 476], spot: true, mark: [140, 400], line: "The snow sculpture plot."},
  hkgarden: {scene: "hk_sapporo", name: "The beer garden", door: [400, 520], spot: true, mark: [440, 560], line: "The beer garden."},
  hkToOtaru: {scene: "hk_sapporo", name: "To Otaru", door: [16, 560], spot: true, bridge: "hk_otaru", mark: [40, 500], line: "West to Otaru."},
  hkToFurano: {scene: "hk_sapporo", name: "To Furano", door: [262, 612], spot: true, bridge: "hk_furano", mark: [200, 590], line: "South to Furano."},
  // Niseko: the slopes, the river, the lodge, the foot bath
  hkslope: {scene: "hk_niseko", name: "The slopes", door: [200, 230], spot: true, mark: [200, 120], line: "The slopes."},
  hkriver: {scene: "hk_niseko", name: "The river", door: [300, 504], spot: true, mark: [300, 560], line: "The river."},
  hklodge: {scene: "hk_niseko", name: "The ski lodge", door: [120, 416], spot: true, mark: [120, 300], line: "The ski lodge."},
  hkfootbath: {scene: "hk_niseko", name: "The foot bath", door: [380, 416], spot: true, mark: [380, 330], line: "The foot bath."},
  hkToOtaruN: {scene: "hk_niseko", name: "To Otaru", door: [262, 26], spot: true, bridge: "hk_otaru", mark: [200, 30], line: "North to Otaru."},
  hkToFuranoE: {scene: "hk_niseko", name: "To Furano", door: [504, 300], spot: true, bridge: "hk_furano", mark: [476, 240], line: "East to Furano."},
  // Furano: the flower farm, the dairy, the melon stall, the lone tree
  hkflowers: {scene: "hk_furano", name: "The flower farm", door: [260, 236], spot: true, mark: [260, 120], line: "The flower farm."},
  hkdairy: {scene: "hk_furano", name: "The Furano dairy", door: [390, 426], spot: true, mark: [390, 320], line: "The Furano dairy."},
  hkmelon: {scene: "hk_furano", name: "The melon stall", door: [120, 326], spot: true, mark: [120, 280], line: "The melon stall."},
  hktree: {scene: "hk_furano", name: "The lone tree", door: [106, 500], spot: true, mark: [106, 430], line: "The lone tree."},
  hkToSapporoN: {scene: "hk_furano", name: "To Sapporo", door: [262, 26], spot: true, bridge: "hk_sapporo", mark: [200, 30], line: "North to Sapporo."},
  hkToNisekoW: {scene: "hk_furano", name: "To Niseko", door: [16, 300], spot: true, bridge: "hk_niseko", mark: [40, 240], line: "West to Niseko."},
  // the rooms (their panels, from the counter inside)
  hk_glass: {scene: "hk_otaru", name: "The glassworks", door: [130, 270]}, hk_musicbox: {scene: "hk_otaru", name: "The music box hall", door: [390, 270]},
  hk_beer: {scene: "hk_sapporo", name: "The beer factory", door: [390, 226]}, hk_ramen: {scene: "hk_sapporo", name: "The ramen shop", door: [390, 436]},
  hk_lodge: {scene: "hk_niseko", name: "The ski lodge", door: [120, 416]}, hk_dairy: {scene: "hk_furano", name: "The Furano dairy", door: [390, 426]}
};
export const HK_BRIDGES = {hk_otaru: {hk_sapporo: "hkToSapporo", hk_niseko: "hkToNiseko"}, hk_sapporo: {hk_otaru: "hkToOtaru", hk_furano: "hkToFurano"},
  hk_niseko: {hk_otaru: "hkToOtaruN", hk_furano: "hkToFuranoE"}, hk_furano: {hk_sapporo: "hkToSapporoN", hk_niseko: "hkToNisekoW"}};
export const HK_ARRIVE = {"hk_otaru>hk_sapporo": [44, 560], "hk_sapporo>hk_otaru": [474, 560], "hk_otaru>hk_niseko": [262, 70], "hk_niseko>hk_otaru": [262, 572],
  "hk_sapporo>hk_furano": [262, 44], "hk_furano>hk_sapporo": [262, 572], "hk_niseko>hk_furano": [44, 300], "hk_furano>hk_niseko": [474, 300]};
export const HK_BOUNDS = {hk_otaru: [14, 70, 506, 616], hk_sapporo: [14, 40, 506, 616], hk_niseko: [14, 26, 506, 516], hk_furano: [14, 26, 506, 616],
  hk_glass: [30, 250, 490, 600], hk_musicbox: [30, 250, 490, 600], hk_beer: [30, 250, 490, 600], hk_ramen: [30, 250, 490, 600], hk_lodge: [30, 250, 490, 600], hk_dairy: [30, 250, 490, 600]};
export const HK_OBST = {
  // Otaru: the sea and the harbour along the top (but for the pier), the two stone warehouses, the canal (but for the
  // bridge), the market stall, the steam clock
  hk_otaru: [[0, 0, 100, 70], [160, 0, 520, 70], [40, 140, 220, 254], [300, 140, 480, 254], [0, 320, 240, 380], [300, 320, 520, 380], [60, 430, 200, 500], [420, 410, 460, 456]],
  // Sapporo: the clock tower, the beer factory, the ramen shop, the sculpture (or fountain), the beer garden's tables
  hk_sapporo: [[60, 60, 180, 200], [280, 50, 500, 210], [300, 320, 480, 420], [90, 380, 190, 460], [430, 500, 500, 540]],
  // Niseko: the ski lift and the slope's fences, the lodge, the foot bath, the river along the bottom
  hk_niseko: [[300, 40, 420, 200], [40, 300, 200, 400], [320, 340, 440, 400], [0, 520, 520, 640]],
  // Furano: the flower rows, the dairy, the melon stall, the lone tree
  hk_furano: [[40, 60, 480, 220], [300, 300, 480, 410], [70, 280, 170, 310], [80, 440, 130, 484]],
  // the rooms: round the edges
  hk_glass: [[180, 280, 340, 340], [30, 250, 100, 480], [420, 250, 490, 480]],
  hk_musicbox: [[30, 250, 100, 520], [420, 250, 490, 520], [180, 360, 340, 400]],
  hk_beer: [[60, 240, 200, 320], [320, 240, 460, 320], [100, 440, 420, 480]],
  hk_ramen: [[60, 280, 460, 330], [30, 250, 60, 420]],
  hk_lodge: [[300, 240, 460, 300], [30, 250, 100, 460], [160, 420, 260, 460]],
  hk_dairy: [[180, 280, 340, 330], [30, 250, 110, 480], [410, 250, 490, 480]]
};

// Hokkaido's goods, by room. Milk, melon, scallops, sweetcorn and kombu go to the kitchen (and milk and melon into
// gelato and bonbons). Every sell price is below its buy price.
export const HK_GOODS = {
  hkmilk: {n: "Hokkaido milk", kind: "ingredient", price: 6, sell: 3, shop: "hk_dairy", art: ["bottle", "#FFFDF6", "#3E6BAE"], what: "rich milk from Furano's cows, in a glass bottle: gelato, bonbons, butter corn"},
  hkmelon: {n: "Furano melon", kind: "ingredient", price: 20, sell: 12, shop: "hk_dairy", art: ["disc", "#B9D98A", "#F2A65A"], what: "orange inside and sweet as honey: melon gelato, a melon bonbon"},
  scallop_hk: {n: "Hokkaido scallops", kind: "ingredient", price: 12, sell: 7, shop: "hkmarket", art: ["disc", "#F3E1C8", "#C98A5A"], what: "fat sweet scallops from the morning market: seared scallops with butter at the kitchen"},
  sweetcorn: {n: "Sweetcorn", kind: "ingredient", price: 3, sell: 2, shop: "hkmarket", art: ["box", "#F3D34A", "#7FA35A"], what: "Hokkaido's sweet corn: butter corn at the kitchen, corn gelato"},
  kombu: {n: "Kombu", kind: "ingredient", price: 4, sell: 2, shop: "hkmarket", art: ["box", "#3A4A3A", "#7A8A6A"], what: "dried kelp from the Hokkaido coast: a dashi for miso ramen at home"},
  h_beer: {n: "Sapporo beer", kind: "gift", to: ["theo", "tomi", "bo", "farid"], price: 6, shop: "hk_beer", art: ["bottle", "#C9A24A", "#C8432F"], say: "A beer from the Sapporo factory! With the red star on it. Cold, please. Very cold."},
  h_choc: {n: "White chocolate biscuits", kind: "gift", to: "family", price: 8, shop: "hk_musicbox", art: ["box", "#FFFDF6", "#4E8AC8"], say: "The famous Hokkaido white chocolate biscuits! Thin, crisp, a layer of white chocolate. I'll share. Probably."},
  h_glass: {n: "A glass float", kind: "keepsake", price: 15, shop: "hk_glass", art: ["disc", "#9FD3E8", "#5E8AB8"], line: "A glass fishing float from Otaru, blown by hand: once, the fishermen tied them to their nets. Now they hang in windows, catching the light."},
  h_lamp: {n: "A little glass lamp", kind: "gift", to: ["hana", "posy", "mei"], price: 18, shop: "hk_glass", art: ["bottle", "#F3C969", "#9FD3E8"], say: "A glass lamp from Otaru! Look how the light comes through it, all blues and golds. For my bedside."},
  h_lavender: {n: "Furano lavender sachet", kind: "gift", to: ["hana", "posy", "mei", "farid"], price: 5, shop: "hk_dairy", art: ["box", "#B48ED8", "#F3E7C8"], say: "Lavender from Furano! It smells like a whole purple hill. Under my pillow it goes."},
  h_magnet: {n: "Hokkaido fridge magnet", kind: "gift", to: "family", price: 3, shop: "hk_musicbox", art: ["disc", "#FFFDF6", "#B48ED8"], say: "A tiny lavender field and a snowy mountain. For the fridge!"},
  // what you make (never sold)
  h_boxes: {n: "Four music boxes", kind: "keepsake", price: 0, art: ["box", "#8A5A3A", "#B48ED8"], line: "All four of Otaru's seasonal music boxes, side by side: blossom, lavender, harvest moon and snow. Wind them all at once and they play together, just about in tune."},
  h_beerglass: {n: "A beer factory glass", kind: "keepsake", price: 0, art: ["bottle", "#F3D98A", "#C8432F"], line: "A tall glass with the red star on it, from the Sapporo beer factory, for matching all three beers to their notes. Kenji signed the bottom with a felt pen."},
  h_skipass: {n: "Your first ski pass", kind: "keepsake", price: 0, art: ["tile", "#9FD3E8", "#C8432F"], line: "A little laminated ski pass from Niseko, on its elastic, with ONE DAY: NURSERY SLOPE on it and Aiko's thumbs-up drawn on the back in biro."},
  h_float: {n: "Your glass float", kind: "keepsake", price: 0, art: ["disc", "#5E8AB8", "#CFE6EE"], line: "A glass float you blew yourself at the Otaru glassworks: a little lopsided, a little bubbly, and the most beautiful thing in the house."}
};
export const HK_KEEP = {h_magnet: "A tiny lavender field and a snowy mountain, from Hokkaido.", h_lamp: "A little glass lamp from the Otaru glassworks.", h_lavender: "A sachet of lavender from Furano."};
// the music boxes (the souvenir collection): one tune for each season, chosen at the music box hall. All four play at home.
export const MUSICBOXES = {spring: ["Cherry blossom waltz", "a lilting waltz for the blossom in May"], summer: ["Lavender fields", "a slow, sunny tune that smells of July"],
  autumn: ["Harvest moon", "a tune like gold fields under a big moon"], winter: ["Snow on the canal", "a tinkling tune like snow falling past the gas lamps"]};
Object.entries(MUSICBOXES).forEach(([k, [n, what]]) => { HK_GOODS["mb_" + k] = {n: `Music box: ${n}`, kind: "keepsake", price: 0, art: ["box", "#8A5A3A", "#F3D98A"], line: `A little wooden music box from Otaru that plays ${what}.`}; });
