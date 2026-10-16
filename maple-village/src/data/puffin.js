// Puffin Isle (round 216, the second of the islands by ferry: ISLANDS-PLAN.md). A small wild island off the British
// coast, after the Farne Islands, Skomer and Lundy: a green hump with sheer cliffs on the west and a sheltered landing
// in the east, short turf, sea pinks and bracken, stone walls, one track from the landing to the lighthouse. Puffins
// nest in burrows on the clifftop from April to July; grey seals pup on the beach in October and November. The sea's
// on every screen. Reached by the island ferry (not on rainy days: the crossing's too rough) or your own boat.
// You arrive on the bottom right, at the landing.
//   pi_lighthouse | pi_village
//   --------------+-----------
//   pi_cliffs     | pi_landing   (the jetty)
// Same shapes as data/towns.js (merged in there): the town, its places, gates, bounds, obstacles and goods.

const FRIENDS = ["hana", "theo", "farid", "mei", "bo", "tomi", "posy"];
const famSpots = per => Object.fromEntries(FRIENDS.map((id, i) => [id, Object.fromEntries(Object.entries(per).map(([sc, pts]) => [sc, [pts[i % pts.length], pts[(i + 3) % pts.length]]]))]));
const room = (door, n, say) => ({door, n, music: door.replace(/^pi/, "pi_"), party: [[200, 560], [330, 560], [120, 540], [420, 540]], say});

// the seasons: puffins April to July, seal pups October and November (months, 1-12)
export const PUFFIN_MONTHS = [4, 5, 6, 7], PUP_MONTHS = [10, 11];
export const puffinsIn = day => PUFFIN_MONTHS.includes(+day.slice(5, 7));
export const pupsIn = day => PUP_MONTHS.includes(+day.slice(5, 7));

export const PI_TOWN = {
  soon: true,   // hidden from the ferry and boat menus until its art is in
  n: "Puffin Isle", by: "ferry", fare: 40, free: [], outFrom: 8*60, outTo: 14*60, backTo: 20*60,
  screens: ["pi_lighthouse", "pi_village", "pi_cliffs", "pi_landing"], arrive: ["pi_landing", [330, 540]], station: "pipier", music: "puffin",
  boat: {fuel: 20, max: 7},
  // dry: no ferry on a rainy day (the crossing's too rough for the island boat)
  ferry: {fare: 40, pier: "pipier", arrive: ["pi_landing", [330, 540]], dry: true,
    blurb: "A green hump of an island with a lighthouse, a handful of cottages and cliffs full of seabirds. Puffins from April to July, seal pups in October and November. A small boat and a short day: back by 8pm, and no crossing in rough weather.",
    arriveLine: "Puffin Isle! The little boat bumps against the jetty. Seals watching from the rocks, gulls wheeling, and the wind full of the smell of salt and grass."},
  blurb: "A small wild island: a lighthouse, a handful of cottages, cliffs full of seabirds, seals on the rocks.",
  arriveLine: "Puffin Isle! Seals on the rocks, gulls wheeling, and the wind full of salt and grass.",
  hints: {pi_landing: "The landing: the jetty (the boat home till 8pm), the boathouse, the post office and the seals. North: the village. West: the cliffs.",
    pi_village: "The village: the cottages, the tearoom, the walled garden, the little church and the goats. South: the landing. West: the lighthouse.",
    pi_lighthouse: "The lighthouse: the tower, the keeper's cottage, the foghorn and the bird hide. East: the village. South: the cliffs.",
    pi_cliffs: "The cliffs: the puffin burrows, the seabird ledges and the sea glass cove. North: the lighthouse. East: the landing."},
  spots: famSpots({
    pi_landing: [[200, 300], [260, 380], [160, 420], [330, 300], [240, 460], [380, 380]],
    pi_village: [[200, 230], [300, 250], [260, 300], [180, 520], [420, 260], [120, 260]],
    pi_lighthouse: [[300, 260], [200, 300], [400, 340], [180, 360], [250, 560], [440, 400]],
    pi_cliffs: [[300, 300], [380, 260], [260, 420], [340, 400], [420, 360], [200, 360]]}),
  // what your friends do here, and nowhere else: Hana watches the puffins (or the seabirds, out of season), Mei feeds
  // the island goats, Posy beachcombs for sea glass, and Bo waves at the seals (who don't wave back)
  acts: {
    hana: {pi_cliffs: {act: "puffinwatch", at: [300, 330], dir: -1}},
    mei: {pi_village: {act: "goatfeed", at: [310, 500], dir: 1}},
    posy: {pi_cliffs: {act: "seaglass", at: [220, 552], dir: 1}},
    bo: {pi_landing: {act: "sealwave", at: [176, 500], dir: -1}}
  },
  rooms: {
    pi_keeper: room("pikeeper", "The keeper's cottage", "The keeper's cottage: a kitchen with a black range, charts on every wall, a barometer by the door, oilskins on pegs and a kettle that never quite stops."),
    pi_lamp: room("pilamp", "The lamp room", "The lamp room: up the spiral stairs into a glass room full of sky, the great lens in the middle like a crystal beehive, and the whole island spread out below."),
    pi_hide: room("pihide", "The bird hide", "The bird hide: a long wooden room with a slot of a window, a bench, binoculars on hooks, and a chalkboard of today's sightings."),
    pi_tearoom: room("pitearoom", "The tearoom", "The tearoom: four tables, a dresser of mismatched china, a stove ticking over, cakes under domes and jars of orange sea buckthorn jam."),
    pi_post: room("pipost", "The island post office", "The island post office: one counter, a wall of pigeonholes, puffin stamps in a frame, and at the back a little workbench heaped with sea glass.")
  },
  lines: {
    hana: ["Look at their little orange feet! I can't. I can't cope.", "There's no cars, no shops, no noise. Just wind and birds. My shoulders have dropped two inches.", "I could live here. For a week. Then I'd want a hairdresser."],
    theo: ["The lighthouse is older than the cottages. The island grew up round it.", "Granite. The whole island's one lump of granite with grass on top.", "That stone wall's been mended so many times there's barely any of the original left. Like a good jumper."],
    farid: ["Sea buckthorn! It's sour, then sweet, then sour. I need to cook with this.", "Island goat's cheese. The goats eat the sea pinks, Bryony says. You can taste it. I can taste it.", "Samphire! Salty and green. Some butter, some pepper. Done."],
    mei: ["The goats are very polite. Except the brown one.", "Very quiet here. The quiet is loud.", "On an island, everybody waves. I like that."],
    bo: ["The seals are judging me. I can tell.", "I've seen a puffin, a gannet and a razorbill. I'm basically a birdwatcher now.", "The post office sells stamps with puffins on. Real stamps. I'm writing to everyone."],
    tomi: ["You can walk round the whole island in an hour. I've done it twice.", "No phone signal. My phone keeps looking for it. Poor thing.", "That cliff's a hundred metres straight down. I'm not going near the edge. I'm going quite near the edge."],
    posy: ["Sea glass! Green, white, a blue one! Look, it's like jewels.", "I want to send a postcard with a puffin stamp to absolutely everyone I've ever met.", "Everything here's so small and tidy and brave. The houses, the church, the puffins."]
  },
  say: {
    pipier: "The jetty: a stone landing in the shelter of the island, the boat bumping at the steps, ferries home to Honeybrook until 8pm.",
    piboathouse: "The old boathouse: a tarred shed with a slipway, the island's rowing boat inside, and a sign: LANDING FEE 0. WELCOME.",
    piseals: "The seal rocks: grey seals hauled out just offshore, flopping and singing their long low songs.",
    pipost: "The island post office: a tiny whitewashed building with a red postbox in the wall and a puffin painted on the door.",
    picottages: "The cottages: a short white row with slate roofs and painted doors, washing flapping in the wind, a bicycle against every wall.",
    pitearoom: "The tearoom: a low stone cottage with a blue door, a chalkboard of cakes, and a bench outside facing the sea.",
    pigarden: "The walled garden: high stone walls to keep the wind out, and inside, sheltered and warm, vegetables, herbs and a fig tree that shouldn't grow this far north.",
    pichurch: "The little church: grey stone, a bell under a stone hood, and inside six pews and a window that looks straight out to sea.",
    pigoats: "The goats: the island's herd, shaggy and bearded, who have opinions about everybody. The brown one is in charge.",
    pilighthouse: "The lighthouse: tall and white with a black lantern on top, built in 1820 and still turning every night.",
    pikeeper: "The keeper's cottage: low and white beside the tower, with a weather vane on the roof and a garden of sea kale.",
    pifoghorn: "The foghorn: a great red trumpet facing the sea. Morwenna sounds it on foggy nights, and the whole island jumps.",
    pihide: "The bird hide: a long low hut of weathered planks at the edge of the cliff, with a slot of a window for watching.",
    piburrows: "The puffin burrows: the clifftop turf is full of holes, each one a puffin's front door.",
    piledges: "The seabird ledges: gannets, guillemots and razorbills packed on every ledge of the cliff, shouting at each other.",
    picove: "The sea glass cove: a little pebble beach at the bottom of a zig-zag path, where the sea brings in bits of old glass, worn smooth and frosted."
  }
};

export const PI_PLACES = {
  // the landing (arrive here): the jetty, the boathouse, the post office, the seals
  pipier: {scene: "pi_landing", name: "The jetty", door: [330, 560], spot: true, mark: [400, 500], line: "The jetty. The boat home to Honeybrook until 8pm."},
  piboathouse: {scene: "pi_landing", name: "The boathouse", door: [116, 186], spot: true, mark: [116, 60], line: "The boathouse."},
  pipost: {scene: "pi_landing", name: "The island post office", door: [370, 186], spot: true, mark: [370, 60], line: "The island post office."},
  piseals: {scene: "pi_landing", name: "The seal rocks", door: [150, 530], spot: true, mark: [100, 480], line: "The seal rocks."},
  piToVillage: {scene: "pi_landing", name: "Up to the village", door: [300, 26], spot: true, bridge: "pi_village", mark: [240, 30], line: "North up the track to the village."},
  piToCliffs: {scene: "pi_landing", name: "To the cliffs", door: [16, 330], spot: true, bridge: "pi_cliffs", mark: [40, 270], line: "West along the path to the cliffs."},
  // the village: the cottages, the tearoom, the walled garden, the church, the goats
  picottages: {scene: "pi_village", name: "The cottages", door: [170, 166], spot: true, mark: [170, 60], line: "The cottages."},
  pitearoom: {scene: "pi_village", name: "The tearoom", door: [410, 186], spot: true, mark: [410, 60], line: "The tearoom."},
  pigarden: {scene: "pi_village", name: "The walled garden", door: [140, 486], spot: true, mark: [140, 400], line: "The walled garden."},
  pichurch: {scene: "pi_village", name: "The little church", door: [400, 436], spot: true, mark: [400, 330], line: "The little church."},
  pigoats: {scene: "pi_village", name: "The goats", door: [330, 470], spot: true, mark: [330, 520], line: "The goats."},
  piToLanding: {scene: "pi_village", name: "Down to the landing", door: [300, 612], spot: true, bridge: "pi_landing", mark: [240, 590], line: "South down the track to the landing."},
  piToLighthouse: {scene: "pi_village", name: "To the lighthouse", door: [16, 240], spot: true, bridge: "pi_lighthouse", mark: [40, 180], line: "West along the wall to the lighthouse."},
  // the lighthouse: the tower, the keeper's cottage, the foghorn, the bird hide
  pilighthouse: {scene: "pi_lighthouse", name: "The lighthouse", door: [116, 236], spot: true, mark: [116, 90], line: "The lighthouse."},
  pikeeper: {scene: "pi_lighthouse", name: "The keeper's cottage", door: [310, 196], spot: true, mark: [310, 90], line: "The keeper's cottage."},
  pifoghorn: {scene: "pi_lighthouse", name: "The foghorn", door: [460, 266], spot: true, mark: [460, 190], line: "The foghorn."},
  pihide: {scene: "pi_lighthouse", name: "The bird hide", door: [330, 496], spot: true, mark: [330, 390], line: "The bird hide."},
  piToVillageE: {scene: "pi_lighthouse", name: "To the village", door: [504, 240], spot: true, bridge: "pi_village", mark: [476, 180], line: "East along the wall to the village."},
  piToCliffsS: {scene: "pi_lighthouse", name: "To the cliffs", door: [262, 612], spot: true, bridge: "pi_cliffs", mark: [200, 590], line: "South along the clifftop."},
  // the cliffs: the puffin burrows, the seabird ledges, the sea glass cove
  piburrows: {scene: "pi_cliffs", name: "The puffin burrows", door: [300, 300], spot: true, mark: [300, 220], line: "The puffin burrows."},
  piledges: {scene: "pi_cliffs", name: "The seabird ledges", door: [160, 200], spot: true, mark: [150, 120], line: "The seabird ledges."},
  picove: {scene: "pi_cliffs", name: "The sea glass cove", door: [250, 540], spot: true, mark: [250, 480], line: "The sea glass cove."},
  piToLighthouseN: {scene: "pi_cliffs", name: "To the lighthouse", door: [262, 26], spot: true, bridge: "pi_lighthouse", mark: [200, 30], line: "North along the clifftop to the lighthouse."},
  piToLandingE: {scene: "pi_cliffs", name: "To the landing", door: [504, 330], spot: true, bridge: "pi_landing", mark: [476, 270], line: "East down to the landing."},
  // the rooms (their panels, from the counter inside)
  pi_keeper: {scene: "pi_lighthouse", name: "The keeper's cottage", door: [310, 196]}, pi_lamp: {scene: "pi_lighthouse", name: "The lamp room", door: [116, 236]},
  pi_hide: {scene: "pi_lighthouse", name: "The bird hide", door: [330, 496]}, pi_tearoom: {scene: "pi_village", name: "The tearoom", door: [410, 186]},
  pi_post: {scene: "pi_landing", name: "The island post office", door: [370, 186]}
};
// the lighthouse door leads up to the lamp room
PI_TOWN.rooms.pi_lamp.door = "pilighthouse";
export const PI_BRIDGES = {pi_landing: {pi_village: "piToVillage", pi_cliffs: "piToCliffs"}, pi_village: {pi_landing: "piToLanding", pi_lighthouse: "piToLighthouse"},
  pi_lighthouse: {pi_village: "piToVillageE", pi_cliffs: "piToCliffsS"}, pi_cliffs: {pi_lighthouse: "piToLighthouseN", pi_landing: "piToLandingE"}};
export const PI_ARRIVE = {"pi_landing>pi_village": [300, 572], "pi_village>pi_landing": [300, 70], "pi_landing>pi_cliffs": [474, 330], "pi_cliffs>pi_landing": [44, 330],
  "pi_village>pi_lighthouse": [474, 240], "pi_lighthouse>pi_village": [44, 240], "pi_lighthouse>pi_cliffs": [262, 70], "pi_cliffs>pi_lighthouse": [262, 572]};
export const PI_BOUNDS = {pi_landing: [14, 26, 466, 600], pi_village: [14, 40, 476, 616], pi_lighthouse: [40, 50, 506, 616], pi_cliffs: [120, 26, 506, 596],
  pi_keeper: [30, 250, 490, 600], pi_lamp: [30, 250, 490, 600], pi_hide: [30, 250, 490, 600], pi_tearoom: [30, 250, 490, 600], pi_post: [30, 250, 490, 600]};
export const PI_OBST = {
  // the landing: the boathouse, the post office, the sea along the east and the bottom (but for the jetty)
  pi_landing: [[40, 60, 190, 170], [290, 60, 450, 170], [470, 0, 520, 640], [0, 572, 300, 640], [360, 572, 520, 640]],
  // the village: the cottage row, the tearoom, the walled garden, the church, the goats' paddock, the sea to the east
  pi_village: [[40, 60, 300, 150], [340, 60, 480, 170], [60, 330, 220, 470], [330, 300, 470, 420], [250, 480, 420, 560], [480, 0, 520, 640]],
  // the lighthouse: the sea to the north and west, the tower, the keeper's cottage, the foghorn, the bird hide
  pi_lighthouse: [[0, 0, 520, 44], [0, 0, 40, 640], [60, 60, 170, 220], [220, 80, 400, 180], [420, 200, 500, 250], [260, 400, 400, 480]],
  // the cliffs: the cliff and the sea to the west, the sea along the bottom, the cove's rocks either side
  pi_cliffs: [[0, 0, 120, 640], [0, 600, 520, 640], [120, 560, 150, 600], [360, 560, 420, 600]],
  // the rooms: round the edges
  pi_keeper: [[300, 240, 490, 300], [30, 250, 100, 420], [180, 400, 340, 450], [420, 470, 490, 540]],
  pi_lamp: [[180, 300, 340, 400], [30, 250, 90, 330], [430, 250, 490, 330]],
  pi_hide: [[30, 240, 490, 290], [80, 400, 440, 430]],
  pi_tearoom: [[300, 230, 490, 300], [80, 340, 140, 372], [380, 340, 440, 372], [80, 480, 140, 512], [30, 250, 70, 420]],
  pi_post: [[180, 290, 340, 340], [30, 250, 100, 480], [400, 460, 490, 540]]
};

// Puffin Isle's goods, by room. Sea buckthorn, samphire, smoked mackerel and the goats' cheese go to the kitchen (and
// buckthorn into gelato and bonbons). Every sell price is below its buy price.
export const PI_GOODS = {
  buckthorn: {n: "Sea buckthorn berries", kind: "ingredient", price: 6, sell: 3, shop: "pi_tearoom", art: ["jar", "#F29A2E", "#7A8A5A"], what: "sharp orange berries from the island bushes: gelato, bonbons, goat's cheese toast"},
  samphire: {n: "Samphire", kind: "ingredient", price: 4, sell: 2, shop: "pi_post", art: ["box", "#7FA35A", "#4E7A3A"], what: "picked on the shore at low tide: samphire with butter at the kitchen"},
  smokedmack: {n: "Smoked mackerel", kind: "ingredient", price: 7, sell: 4, shop: "pi_post", art: ["box", "#C98A3A", "#5E7A8A"], what: "smoked in the boathouse: smoked mackerel pâté at the kitchen"},
  goatcheese: {n: "Island goat's cheese", kind: "ingredient", price: 8, sell: 5, shop: "pi_tearoom", art: ["disc", "#FFF8EC", "#C9B07A"], what: "a little round from the island goats: goat's cheese and buckthorn toast"},
  p_jam: {n: "Sea buckthorn jam", kind: "gift", to: ["farid", "hana", "bo", "posy"], price: 6, shop: "pi_tearoom", art: ["jar", "#F29A2E", "#FFFDF6"], say: "Sea buckthorn jam! Orange as a sunset and sharp as anything. On a scone. Now, please."},
  p_flapjack: {n: "Bryony's flapjack", kind: "gift", to: "family", price: 4, shop: "pi_tearoom", art: ["box", "#C9A24A", "#8A5A2E"], say: "Flapjack from the island! Oats and golden syrup and a lot of butter. I'll walk it off. Eventually."},
  p_puffin: {n: "A knitted puffin", kind: "gift", to: ["hana", "posy", "mei", "tomi"], price: 12, shop: "pi_post", art: ["disc", "#2F2B28", "#F28C28"], say: "A knitted puffin! With little orange feet! I'm naming him. He's called Captain."},
  p_card: {n: "A puffin postcard", kind: "gift", to: "family", price: 2, shop: "pi_post", art: ["tile", "#9FD3E8", "#F28C28"], say: "A postcard from Puffin Isle, with a puffin stamp! It's going on the fridge."},
  p_magnet: {n: "Puffin Isle fridge magnet", kind: "gift", to: "family", price: 3, shop: "pi_post", art: ["disc", "#FFFDF6", "#F28C28"], say: "A tiny puffin on a tiny lighthouse. For the fridge!"},
  p_print: {n: "Lighthouse print", kind: "keepsake", price: 14, shop: "pi_keeper", art: ["tile", "#E6E2DA", "#2E3A5A"], line: "A linocut print of Puffin Isle's lighthouse, black on cream, cut by Morwenna on winter evenings when the lamp needs no help from her."},
  // what you make and find (never sold)
  seaglass: {n: "Sea glass", kind: "ingredient", price: 0, sell: 1, art: ["disc", "#9FD3B2", "#CFE6EE"], what: "a frosted bit of old glass from the cove: a pendant at the post office's workbench"},
  p_pendant: {n: "Your sea glass pendant", kind: "gift", to: ["hana", "posy", "mei", "farid"], price: 0, art: ["disc", "#9FD3B2", "#C9A24A"], say: "Sea glass! Did you make this? From Puffin Isle? I'm never taking it off."},
  p_stormglass: {n: "Morwenna's storm glass", kind: "keepsake", price: 0, art: ["bottle", "#E6F2F6", "#8A9AA8"], line: "A little sealed glass of clear liquid that turns cloudy before a storm and grows feathery crystals before a frost. Morwenna gave it to you for reading the weather right three times running."},
  p_badge: {n: "A volunteer's badge", kind: "keepsake", price: 0, art: ["disc", "#2E5E3A", "#F28C28"], line: "A little enamel badge with a puffin on it: PUFFIN ISLE SEABIRD COUNT, VOLUNTEER. Rhodri pinned it on you himself after you counted five out of five."},
  p_stamps: {n: "A framed sheet of puffin stamps", kind: "keepsake", price: 0, art: ["tile", "#FFFDF6", "#F28C28"], line: "Every stamp from the island post office, one for each puffin month and one for the seal pups, framed by Ffion. Puffin Isle in five little squares."}
};
export const PI_KEEP = {p_magnet: "A tiny puffin on a tiny lighthouse, from Puffin Isle.", p_puffin: "A knitted puffin with little orange feet, from Puffin Isle.", p_pendant: "A pendant you made from sea glass at the island post office."};
// the stamps (the souvenir collection): one for each puffin month, and the seal pup stamp in October and November
export const STAMPS = {4: ["April", "the first puffins back from the sea"], 5: ["May", "puffins among the sea pinks"], 6: ["June", "a puffin with a beak full of sand eels"], 7: ["July", "a puffling peeping out of its burrow"], pup: ["Seal pup", "a white-coated seal pup on the beach"]};
Object.entries(STAMPS).forEach(([k, [n, what]]) => { PI_GOODS["ps_" + k] = {n: `Puffin stamp: ${n}`, kind: "keepsake", price: 0, art: ["tile", "#FFFDF6", k === "pup" ? "#9A9AA2" : "#F28C28"], line: `A stamp from the island post office: ${what}.`}; });
