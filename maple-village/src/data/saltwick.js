// Saltwick Harbour (round 215, the first of the islands by ferry: ISLANDS-PLAN.md). A North Yorkshire fishing village
// in a narrow cove between two cliffs: red pantile roofs stacked up a steep slope, cobbled lanes (wynds) zig-zagging
// down to the water, a harbour wall curling round like an arm with the lighthouse at its tip, a fish market, the
// smokehouse, the scar (flat rocks at low tide, full of fossils) and the abbey ruin on the headland. Grey-green sea,
// grey stone, rust-red roofs. Reached by the ferry from Honeybrook's foreshore jetty (or your own boat, once you've
// bought it). You arrive on the bottom right this time, at the harbour.
//   sw_clifftop | sw_wynds
//   ------------+-----------
//   sw_beach    | sw_harbour   (the ferry pier)
// Same shapes as data/towns.js (merged in there): the town, its places, gates, bounds, obstacles and goods.

const FRIENDS = ["hana", "theo", "farid", "mei", "bo", "tomi", "posy"];
// your friends' wander points: two each per screen, picked from a screen's open ground
const famSpots = per => Object.fromEntries(FRIENDS.map((id, i) => [id, Object.fromEntries(Object.entries(per).map(([sc, pts]) => [sc, [pts[i % pts.length], pts[(i + 3) % pts.length]]]))]));
const room = (door, n, say) => ({door, n, music: door.replace(/^sw/, "sw_"), party: [[200, 560], [330, 560], [120, 540], [420, 540]], say});

export const SW_TOWN = {
  soon: true,   // hidden from the ferry and boat menus until its outdoor art is in
  n: "Saltwick Harbour", by: "ferry", fare: 30, free: [], outFrom: 7*60, outTo: 16*60, backTo: 22*60,
  screens: ["sw_clifftop", "sw_wynds", "sw_beach", "sw_harbour"], arrive: ["sw_harbour", [230, 548]], station: "swpier", music: "saltwick",
  // your own boat (the dolphin cruise boat, a big goal): fuel for the day, up to seven friends aboard, daylight and dry days only
  boat: {fuel: 15, max: 7},
  ferry: {fare: 30, pier: "swpier", arrive: ["sw_harbour", [230, 548]],
    blurb: "A fishing village tucked into a cove on the north-east coast: red roofs tumbling down to the harbour, a fish market, the smokehouse, fossils on the beach and a lighthouse on the harbour wall. The closest of the islands' ferries, and the cheapest.",
    arriveLine: "Saltwick! The ferry slides in past the lighthouse on the end of the harbour wall. Red roofs stacked up the cliff, gulls everywhere, and the smell of salt and woodsmoke."},
  blurb: "A fishing village in a cove: red roofs, cobbled wynds, a fish market, the smokehouse, fossils on the beach and a lighthouse on the harbour wall.",
  arriveLine: "Saltwick! Red roofs stacked up the cliff, gulls everywhere, and the smell of salt and woodsmoke.",
  hints: {sw_harbour: "The harbour: the ferry home (till 10pm), the fish market, the chandlery and the lighthouse on the harbour wall. North: up the wynds. West: the beach.",
    sw_wynds: "The wynds: the steep cobbled lanes, the quay café, the smokehouse and the hundred and ninety-nine steps. South: the harbour. West: the clifftop.",
    sw_beach: "The beach: the scar (fossils at low tide), the rock pools, the beach huts and the seals out on the rocks. North: the clifftop. East: the harbour.",
    sw_clifftop: "The clifftop: the abbey ruin, the coastguard cottages, the sheep and a bench with the whole sea in front of it. East: the wynds. South: down to the beach."},
  spots: famSpots({
    sw_harbour: [[150, 280], [240, 260], [200, 360], [330, 300], [120, 380], [260, 400]],
    sw_wynds: [[262, 220], [300, 400], [250, 560], [220, 300], [280, 470], [200, 220]],
    sw_beach: [[200, 300], [300, 260], [260, 380], [360, 330], [160, 360], [420, 360]],
    sw_clifftop: [[220, 300], [300, 260], [250, 440], [180, 380], [330, 560], [400, 260]]}),
  // what your friends do here, and nowhere else: Tomi goes crabbing off the harbour wall, Bo taps the scar for
  // fossils, Farid eats a crab sandwich on the clifftop bench, and Theo helps Alfie paint the lighthouse railings
  acts: {
    tomi: {sw_harbour: {act: "crab", at: [446, 404], dir: -1}},
    bo: {sw_beach: {act: "fossil", at: [214, 488], dir: 1}},
    farid: {sw_clifftop: {act: "sarnie", at: [164, 488], dir: 1}},
    theo: {sw_harbour: {act: "railpaint", at: [470, 330], dir: -1, hours: [[10*60, 16*60]]}}
  },
  // five rooms, behind the doors on the harbour (two), up the wynds (two) and on the harbour wall (the lighthouse)
  rooms: {
    sw_market: room("swmarket", "The fish market", "The fish market: a long cold hall with a wet stone floor, crates of ice, lobsters in a tank, the day's catch chalked up on a board, and Ruth in her white coat and wellies."),
    sw_chandlery: room("swchandlery", "The chandlery", "The chandlery: ropes in coils to the ceiling, brass lamps, oilskins on pegs, tins of everything, jars of buttons and hooks, and a ship in a bottle in the window."),
    sw_cafe: room("swcafe", "The quay café", "The quay café: steamed-up windows, oilcloth on the tables, a teapot the size of a bucket, crab sandwiches under a glass dome and Nell waving you to the window seat."),
    sw_smokehouse: room("swsmokehouse", "The smokehouse", "The smokehouse: black beams, rows and rows of kippers hanging golden in the oak smoke, and a smell that'll stay in your jumper till Tuesday."),
    sw_lighthouse: room("swlighthouse", "The lighthouse", "Inside the lighthouse: a spiral of iron stairs, a round room with a desk and the keeper's ledger, and up at the very top, the great glass lamp.")
  },
  lines: {
    hana: ["Smell that! Salt and seaweed. My skin's thanking me already.", "All these little steps. My calves will be beautiful by tonight.", "I want a cottage with a red roof and a blue door. That one. Exactly that one."],
    theo: ["Pantiles. Every roof. They came over as ballast in the Dutch boats, they say.", "Look at the stonework on that harbour wall. Two hundred years of storms and not a stone out.", "A hundred and ninety-nine steps. I counted. Twice."],
    farid: ["Fish this fresh you don't need to do anything to it. A little butter. Maybe.", "I need to know what goes in that crab sandwich. I'm going to ask Nell.", "The gulls here are not shy. One looked at my sandwich like it owed him money."],
    mei: ["Cold wind, warm tea. That's the right way round.", "The boats come in on the tide. Everyone watches. I like that.", "Very old village. Very steep. Very good."],
    bo: ["There are fossils in every rock on that beach. Every rock! I'm not leaving.", "I've found two ammonites and a stone that's definitely a dinosaur's tooth. Probably.", "Chips, a kipper and a stick of rock. I'm doing Saltwick properly."],
    tomi: ["Crabbing! Bacon on a string, that's the trick. And patience. Mostly bacon.", "I'm going to count the gulls. I've stopped. There's too many.", "Race you up the steps. Actually, no. Walk you up the steps."],
    posy: ["Every door's a different colour. I'm taking a photo of every single one.", "Look at the little boats, all leaning over in the mud when the tide's out. They look sleepy.", "I'm buying a jumper from the chandlery. A proper fisherman's jumper. I've decided."]
  },
  say: {
    swpier: "The ferry pier: the ferry tied up alongside, gulls on every post, ferries home to Honeybrook until 10pm.",
    swmarket: "The fish market: a long stone building right on the quay, with a slate roof and the day's catch chalked up by the door.",
    swchandlery: "The chandlery: ropes, lamps and oilskins in the window, and a brass bell over the door.",
    swlighthouse: "The lighthouse on the end of the harbour wall: white, round and stubby, with a green light on top that winks all night.",
    swboats: "The cobles: the old Yorkshire fishing boats, broad and low, painted blue and white and red, with their names in big letters.",
    swcrab: "The harbour wall: the best crabbing spot in Saltwick. A line, a bit of bacon and a bucket of seawater, and patience.",
    swsteps: "The hundred and ninety-nine steps: up from the harbour to the clifftop, with a bench on every landing for getting your breath back.",
    swcat: "The harbour cat: a big grey tom asleep on a lobster pot. He belongs to everyone and no one, and he's been fed six times today.",
    swcafe: "The quay café: a little white cottage with a blue door, steamed-up windows and a chalkboard: CRAB SANDWICHES. TEA. CAKE.",
    swsmokehouse: "The smokehouse: a tarred black shed with a tall chimney, oak smoke curling out of the louvres, and kippers hanging golden inside.",
    swscar: "The scar: wide flat ledges of grey rock left by the tide, full of cracks and pools. Split the right stone and there's an ammonite inside, curled up for a hundred and eighty million years.",
    swpools: "The rock pools: anemones like blobs of jam, a shore crab in a hurry, and tiny fish that vanish when your shadow falls on them.",
    swhuts: "The beach huts: a row of little wooden huts painted every colour, with deckchairs out front and kettles going.",
    swseals: "The seals: grey seals hauled out on the rocks off the point, flopping and grumbling and watching you with big dark eyes.",
    swabbey: "The abbey ruin: tall grey arches and empty windows on the headland, open to the sky. The wind sings through them.",
    swcoastguard: "The coastguard cottages: a white terrace on the cliff edge, with a flagpole and a lookout window facing the sea.",
    swsheep: "The sheep: a field of them right to the cliff edge, unbothered by the view, the wind or you.",
    swbench: "A bench on the clifftop with the whole grey-green sea in front of it, and a little brass plaque: FOR PEG, WHO LOVED THIS VIEW."
  }
};

// places on the screens (merged into world.js VILLAGE); bridge: a gate to another of the town's screens
export const SW_PLACES = {
  // the harbour (arrive here): the pier, the fish market, the chandlery, the cobles, the harbour wall and the lighthouse
  swpier: {scene: "sw_harbour", name: "The ferry pier", door: [230, 560], spot: true, mark: [160, 500], line: "The ferry pier. Ferries home to Honeybrook until 10pm."},
  swmarket: {scene: "sw_harbour", name: "The fish market", door: [396, 196], spot: true, mark: [396, 60], line: "The fish market."},
  swchandlery: {scene: "sw_harbour", name: "The chandlery", door: [116, 186], spot: true, mark: [116, 60], line: "The chandlery."},
  swboats: {scene: "sw_harbour", name: "The cobles", door: [330, 426], spot: true, mark: [330, 470], line: "The cobles."},
  swcrab: {scene: "sw_harbour", name: "Crabbing off the harbour wall", door: [440, 420], spot: true, mark: [470, 380], line: "The harbour wall."},
  swlighthouse: {scene: "sw_harbour", name: "The lighthouse", door: [462, 506], spot: true, mark: [470, 440], line: "The lighthouse."},
  swToWynds: {scene: "sw_harbour", name: "Up the wynds", door: [300, 26], spot: true, bridge: "sw_wynds", mark: [240, 30], line: "North up the cobbled wynds."},
  swToBeach: {scene: "sw_harbour", name: "To the beach", door: [16, 330], spot: true, bridge: "sw_beach", mark: [40, 270], line: "West along the sands to the beach and the scar."},
  // the wynds: the café, the smokehouse, the steps, the cat
  swcafe: {scene: "sw_wynds", name: "The quay café", door: [120, 186], spot: true, mark: [120, 60], line: "The quay café."},
  swsmokehouse: {scene: "sw_wynds", name: "The smokehouse", door: [410, 376], spot: true, mark: [410, 260], line: "The smokehouse."},
  swsteps: {scene: "sw_wynds", name: "The 199 steps", door: [60, 400], spot: true, mark: [60, 330], line: "The hundred and ninety-nine steps."},
  swcat: {scene: "sw_wynds", name: "The harbour cat", door: [250, 470], spot: true, mark: [250, 420], line: "The harbour cat."},
  swToHarbour: {scene: "sw_wynds", name: "Down to the harbour", door: [300, 612], spot: true, bridge: "sw_harbour", mark: [240, 590], line: "South down the wynds to the harbour."},
  swToClifftop: {scene: "sw_wynds", name: "To the clifftop", door: [16, 240], spot: true, bridge: "sw_clifftop", mark: [40, 180], line: "West up onto the clifftop."},
  // the beach: the scar, the rock pools, the huts, the seals
  swscar: {scene: "sw_beach", name: "The scar", door: [200, 470], spot: true, mark: [200, 410], line: "The scar."},
  swpools: {scene: "sw_beach", name: "The rock pools", door: [420, 452], spot: true, mark: [420, 400], line: "The rock pools."},
  swhuts: {scene: "sw_beach", name: "The beach huts", door: [370, 156], spot: true, mark: [370, 60], line: "The beach huts."},
  swseals: {scene: "sw_beach", name: "The seals", door: [120, 540], spot: true, mark: [80, 500], line: "The seals."},
  swToCliffN: {scene: "sw_beach", name: "Up to the clifftop", door: [262, 26], spot: true, bridge: "sw_clifftop", mark: [200, 30], line: "North up the cliff path."},
  swToHarbourE: {scene: "sw_beach", name: "To the harbour", door: [504, 330], spot: true, bridge: "sw_harbour", mark: [476, 270], line: "East along the sands to the harbour."},
  // the clifftop: the abbey, the coastguard cottages, the sheep, the bench
  swabbey: {scene: "sw_clifftop", name: "The abbey ruin", door: [250, 206], spot: true, mark: [250, 60], line: "The abbey ruin."},
  swcoastguard: {scene: "sw_clifftop", name: "The coastguard cottages", door: [440, 186], spot: true, mark: [440, 60], line: "The coastguard cottages."},
  swsheep: {scene: "sw_clifftop", name: "The sheep", door: [390, 372], spot: true, mark: [390, 440], line: "The sheep."},
  swbench: {scene: "sw_clifftop", name: "The clifftop bench", door: [150, 470], spot: true, mark: [150, 410], line: "The clifftop bench."},
  swToWyndsE: {scene: "sw_clifftop", name: "To the wynds", door: [504, 240], spot: true, bridge: "sw_wynds", mark: [476, 180], line: "East down into the wynds."},
  swToBeachS: {scene: "sw_clifftop", name: "Down to the beach", door: [262, 612], spot: true, bridge: "sw_beach", mark: [200, 590], line: "South down the cliff path to the beach."},
  // the rooms (their panels, from the counter inside)
  sw_market: {scene: "sw_harbour", name: "The fish market", door: [396, 196]}, sw_chandlery: {scene: "sw_harbour", name: "The chandlery", door: [116, 186]},
  sw_cafe: {scene: "sw_wynds", name: "The quay café", door: [120, 186]}, sw_smokehouse: {scene: "sw_wynds", name: "The smokehouse", door: [410, 376]},
  sw_lighthouse: {scene: "sw_harbour", name: "The lighthouse", door: [462, 506]}
};
export const SW_BRIDGES = {sw_harbour: {sw_wynds: "swToWynds", sw_beach: "swToBeach"}, sw_wynds: {sw_harbour: "swToHarbour", sw_clifftop: "swToClifftop"},
  sw_beach: {sw_clifftop: "swToCliffN", sw_harbour: "swToHarbourE"}, sw_clifftop: {sw_wynds: "swToWyndsE", sw_beach: "swToBeachS"}};
export const SW_ARRIVE = {"sw_harbour>sw_wynds": [300, 572], "sw_wynds>sw_harbour": [300, 70], "sw_harbour>sw_beach": [474, 330], "sw_beach>sw_harbour": [44, 330],
  "sw_wynds>sw_clifftop": [474, 240], "sw_clifftop>sw_wynds": [44, 240], "sw_beach>sw_clifftop": [262, 572], "sw_clifftop>sw_beach": [262, 70]};
// walking areas: [x0, y0, x1, y1]
export const SW_BOUNDS = {sw_harbour: [14, 26, 506, 600], sw_wynds: [14, 26, 506, 616], sw_beach: [14, 26, 506, 556], sw_clifftop: [90, 26, 506, 616],
  sw_market: [30, 250, 490, 600], sw_chandlery: [30, 250, 490, 600], sw_cafe: [30, 250, 490, 600], sw_smokehouse: [30, 250, 490, 600], sw_lighthouse: [30, 250, 490, 600]};
// what's in the way (paths.js)
export const SW_OBST = {
  // the harbour: the chandlery, the fish market, the harbour basin (between the pier and the wall), the sea to the
  // south-west, the lighthouse, the fish boxes on the quay
  sw_harbour: [[30, 60, 200, 170], [300, 60, 490, 180], [262, 440, 420, 640], [0, 576, 200, 640], [200, 600, 262, 640], [434, 524, 506, 600], [140, 420, 190, 452]],
  // the wynds: the cottage blocks either side of the zig-zag lane (the café's, the smokehouse's)
  sw_wynds: [[30, 40, 220, 170], [300, 40, 500, 150], [330, 250, 506, 360], [90, 250, 200, 340], [30, 430, 190, 530], [330, 450, 506, 560]],
  // the beach: the cliff on the north-west, the beach huts, the rock pools, the sea along the bottom
  sw_beach: [[0, 0, 200, 170], [260, 60, 480, 140], [380, 470, 470, 520], [0, 560, 520, 640]],
  // the clifftop: the sea to the west, the abbey, the coastguard cottages, the sheep field
  sw_clifftop: [[0, 0, 90, 640], [140, 60, 360, 190], [380, 60, 506, 170], [300, 390, 480, 520]],
  // the rooms: the counters and tables round the edges
  sw_market: [[30, 250, 140, 320], [380, 250, 490, 320], [170, 360, 350, 410], [30, 440, 110, 520], [410, 440, 490, 520]],
  sw_chandlery: [[30, 240, 100, 480], [420, 240, 490, 480], [180, 300, 340, 350], [140, 470, 220, 510]],
  sw_cafe: [[300, 230, 490, 300], [80, 330, 140, 362], [80, 470, 140, 502], [380, 470, 440, 502], [30, 250, 70, 420]],
  sw_smokehouse: [[30, 250, 110, 500], [410, 250, 490, 500], [180, 280, 340, 330], [200, 470, 320, 510]],
  sw_lighthouse: [[180, 300, 340, 400], [30, 250, 110, 340], [410, 440, 490, 520]]
};

// Saltwick's goods, by room. Lobster, sea salt, seaweed and onions are kitchen ingredients (and sea salt and seaweed
// find their way into gelato and bonbons through discovery). Every sell price is below its buy price.
export const SW_GOODS = {
  lobster: {n: "Lobster", kind: "ingredient", price: 18, sell: 10, shop: "sw_market", art: ["disc", "#2E4A6A", "#C8432F"], what: "from Ruth's tank at the fish market: lobster with garlic butter at the kitchen"},
  seasalt: {n: "Saltwick sea salt", kind: "ingredient", price: 4, sell: 2, shop: "sw_market", art: ["jar", "#F3F1EA", "#9FB8C8"], what: "flaky salt from the pans on the point: sea salt gelato, salted dark chocolate bonbons"},
  seaweed: {n: "Dulse seaweed", kind: "ingredient", price: 4, sell: 2, shop: "sw_market", art: ["box", "#7A2E3A", "#4E7A5A"], what: "red seaweed off the scar, dried: seaweed butter, savoury gelato"},
  onion: {n: "Onions", kind: "ingredient", price: 2, sell: 1, shop: "sw_market", art: ["disc", "#C9874A", "#F3E1B0"], what: "for the Saltwick onion tart at the kitchen"},
  kipper: {n: "Kippers", kind: "ingredient", price: 7, sell: 4, shop: "sw_smokehouse", art: ["box", "#C98A3A", "#6B4A2E"], what: "oak-smoked herring from the smokehouse: kippers and toast at the kitchen"},
  s_kipperbox: {n: "A box of kippers", kind: "gift", to: ["farid", "theo", "mei"], price: 12, shop: "sw_smokehouse", art: ["box", "#3A3430", "#C98A3A"], say: "Kippers! From a proper smokehouse. Breakfast tomorrow, with brown bread and butter."},
  s_rock: {n: "A stick of Saltwick rock", kind: "gift", to: "family", price: 3, shop: "sw_cafe", art: ["bottle", "#F4C7CF", "#FFFDF6"], say: "Seaside rock with SALTWICK all the way through! I'll break my teeth on it and I don't care."},
  s_parkin: {n: "Parkin", kind: "gift", to: ["farid", "bo", "hana", "tomi"], price: 6, shop: "sw_cafe", art: ["box", "#8A5A2E", "#E8C27A"], say: "Parkin! Sticky ginger cake with oats and treacle. It's better the next day. It won't last till the next day."},
  s_gansey: {n: "Fisherman's gansey", kind: "gift", to: ["theo", "mei", "tomi", "posy"], price: 28, shop: "sw_chandlery", art: ["cloth", "#2E3A5A", "#4A5A7A"], say: "A gansey! Navy wool, knitted tight enough to keep the sea out. Every village had its own pattern, so they'd know you anywhere."},
  s_jet: {n: "A jet brooch", kind: "gift", to: ["hana", "posy", "mei"], price: 22, shop: "sw_chandlery", art: ["disc", "#1E1A18", "#6A6A72"], say: "Jet from the cliffs, polished black as liquorice. It's warm when you hold it. Thank you!"},
  s_bottle: {n: "Ship in a bottle", kind: "keepsake", price: 16, shop: "sw_chandlery", art: ["bottle", "#CFE6EE", "#8A5A3A"], line: "A little three-masted ship in a bottle from the chandlery in Saltwick. Nobody's quite sure how it got in there, including Walter's grandad, who made it."},
  s_lamp: {n: "Brass storm lamp", kind: "keepsake", price: 18, shop: "sw_chandlery", art: ["bottle", "#C9A24A", "#F3D98A"], line: "A brass storm lamp from the Saltwick chandlery: the kind they hung on the boats, so the harbour could see them coming home."},
  s_magnet: {n: "Saltwick fridge magnet", kind: "gift", to: "family", price: 3, shop: "sw_chandlery", art: ["disc", "#C8432F", "#4F9CC4"], say: "A tiny lighthouse and a red-roofed cottage. For the fridge!"},
  s_case: {n: "A glass case of ammonites", kind: "keepsake", price: 0, art: ["box", "#CFE6EE", "#8A7A6A"], line: "All six ammonites from the scar at Saltwick, in a little glass-topped case Jack made from driftwood. A hundred and eighty million years old, every one, and you found them yourself."},
  s_crabline: {n: "Your crabbing line", kind: "keepsake", price: 0, art: ["disc", "#F3D34A", "#C8432F"], line: "A yellow crabbing line on a plastic reel, with a little mesh bag on the end for the bacon. Jack says it's lucky now. It caught three."},
  s_mug: {n: "A Saltwick mug", kind: "keepsake", price: 0, art: ["jar", "#2E3A5A", "#FFFDF6"], line: "A navy enamel mug from the quay café, chipped on the rim. Nell gave it to you after your first proper brew. \"For when you need reminding.\""},
  s_ledger: {n: "A page from the keeper's ledger", kind: "keepsake", price: 0, art: ["tile", "#F3E7C8", "#2E3A5A"], line: "A page Alfie tore from the back of his ledger for you: tonight's date, the weather (fresh, backing west), the boats home safe, and at the bottom, in his careful hand, your name: helped light the lamp."}
};
// the souvenirs that can be kept instead of given (the backpack's "Keep it"), with the line on their card
export const SW_KEEP = {s_magnet: "A tiny lighthouse and a red-roofed cottage, from Saltwick Harbour.", s_gansey: "A navy fisherman's gansey from Saltwick, knitted in the village pattern.", s_jet: "A Whitby-style jet brooch from Saltwick, polished black."};
// The ammonites on the scar (the souvenir collection): six kinds. Find them all and they go in a glass case at home.
export const AMMONITES = {
  dactylioceras: ["Dactylioceras", "the snakestone: a tight coil of ribs, like a curled-up snake with no head", "#8A7A6A"],
  hildoceras: ["Hildoceras", "named for Saint Hilda, who turned the snakes to stone (so the story goes)", "#9A8C78"],
  harpoceras: ["Harpoceras", "flat and sleek, with a sharp keel like the edge of a sickle", "#7A6E62"],
  phylloceras: ["Phylloceras", "smooth and round, with leafy patterns where its chambers joined", "#A89A86"],
  pyrite: ["A golden ammonite", "turned to fool's gold: it glitters in the sun like treasure", "#C9A24A"],
  eleganticeras: ["Eleganticeras", "tiny, delicate, with fine ribs like a fingerprint", "#8E8274"]
};
Object.entries(AMMONITES).forEach(([id, [n, line, col]]) => { SW_GOODS["am_" + id] = {n: `Ammonite: ${n}`, kind: "keepsake", price: 0, art: ["disc", col, "#5A4E44"], line: `An ammonite you split from a stone on the scar at Saltwick: ${line}.`}; });
