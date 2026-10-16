// Bali (round 218, the fourth island by ferry: ISLANDS-PLAN.md). Four corners of Bali, one to a screen, side by side the
// way Jeju's are: Seminyak's sunset beach (the ferry comes in here), Ubud's village (the market, the silversmith, the
// palace where the dancers practise, the monkey forest), the Tegallalang rice terraces (the jungle swing, a coffee and
// cacao farm), and Uluwatu's cliff temple (the fire dance at sunset). Green, warm and gentle, with offerings everywhere.
// You arrive bottom left this time, on Seminyak's jetty.
//   ba_tegallalang | ba_ubud
//   ---------------+-----------
//   ba_seminyak    | ba_uluwatu
// Same shapes as data/towns.js (merged in there): the town, its places, gates, bounds, obstacles and goods.

const FRIENDS = ["hana", "theo", "farid", "mei", "bo", "tomi", "posy"];
const famSpots = per => Object.fromEntries(FRIENDS.map((id, i) => [id, Object.fromEntries(Object.entries(per).map(([sc, pts]) => [sc, [pts[i % pts.length], pts[(i + 3) % pts.length]]]))]));
const room = (door, n, say) => ({door, n, music: door.replace(/^ba/, "ba_"), party: [[200, 560], [330, 560], [120, 540], [420, 540]], say});

// the kecak fire dance at Uluwatu, at sunset (minutes)
export const KECAK = {from: 17*60 + 30, to: 19*60 + 30};
export const kecakOn = hm => hm >= KECAK.from && hm < KECAK.to;

export const BL_TOWN = {
  n: "Bali", by: "ferry", fare: 110, free: [], outFrom: 7*60, outTo: 12*60, backTo: 22*60,
  screens: ["ba_tegallalang", "ba_ubud", "ba_seminyak", "ba_uluwatu"], arrive: ["ba_seminyak", [230, 500]], station: "bajetty", music: "bali",
  ferry: {fare: 110, pier: "bajetty", arrive: ["ba_seminyak", [230, 500]],
    blurb: "Warm, green and gentle: Seminyak's sunset beach, Ubud's market and dancers, the rice terraces of Tegallalang, and the cliff temple at Uluwatu, with a fire dance at sunset. The longest crossing of all: boats out until noon.",
    arriveLine: "Bali! The ferry noses up to the jetty at Seminyak. Warm air, frangipani, incense, the sea glittering, and a little offering of flowers on every step."},
  blurb: "Seminyak's sunset beach, Ubud's market and dancers, the Tegallalang rice terraces, and Uluwatu's cliff temple.",
  arriveLine: "Bali! Warm air, frangipani and incense, and a little offering of flowers on every step.",
  hints: {ba_seminyak: "Seminyak: the jetty (ferries home till 10pm), the beach, the warung and the sunset spot. North: Tegallalang. East: Uluwatu.",
    ba_ubud: "Ubud: the market, the silversmith, the palace (the dancers practise inside) and the monkey forest. West: Tegallalang. South: Uluwatu.",
    ba_tegallalang: "Tegallalang: the rice terraces, the water channels, the jungle swing and the coffee and cacao farm. East: Ubud. South: Seminyak.",
    ba_uluwatu: "Uluwatu: the cliff temple, the cliff path, the surf far below, and the fire dance at sunset. West: Seminyak. North: Ubud."},
  spots: famSpots({
    ba_seminyak: [[200, 360], [300, 340], [260, 420], [380, 360], [140, 400], [420, 420]],
    ba_ubud: [[220, 250], [300, 250], [180, 470], [260, 460], [120, 400], [300, 520]],
    ba_tegallalang: [[260, 260], [200, 300], [300, 520], [420, 440], [160, 480], [380, 260]],
    ba_uluwatu: [[200, 250], [280, 260], [340, 480], [380, 300], [160, 500], [260, 520]]}),
  // what your friends do here, and nowhere else: Hana relaxes on a beanbag at sunset, Farid plants rice with Ketut, Tomi
  // rides the jungle swing, Bo cracks open a coconut, Posy sets out a little offering, Theo joins the gamelan
  acts: {
    hana: {ba_seminyak: {act: "beanbag", at: [380, 420], dir: 1}},
    farid: {ba_tegallalang: {act: "riceplant", at: [300, 240], dir: 1}},
    tomi: {ba_tegallalang: {act: "jungleswing", at: [420, 380], dir: -1}},
    bo: {ba_seminyak: {act: "coconut", at: [160, 400], dir: 1}},
    posy: {ba_ubud: {act: "offering", at: [260, 410], dir: 1}},
    theo: {ba_dance: {act: "gamelan", at: [140, 520], dir: 1}}
  },
  rooms: {
    ba_warung: room("bawarung", "The warung", "The warung: a little open-sided café with a palm-thatch roof, low wooden tables, a glass case of rice and curries, fans turning, and the sea through the gaps in the wall."),
    ba_market: room("bamarket", "Ubud market", "Ubud market: stalls of sarongs and baskets, piles of fruit, the smell of incense and frangipani, and a woman folding palm leaves into little trays for offerings."),
    ba_silver: room("basilver", "The silversmith", "The silversmith's: a cool tiled room, glass cases of rings and bangles, and at the back a workbench with a tiny flame, little hammers and a bowl of silver wire."),
    ba_dance: room("bldance", "The dance pavilion", "The dance pavilion: an open hall in the palace courtyard, gilded carved pillars, a gamelan orchestra of bronze gongs and metallophones, and girls practising with their fingers bent back and their eyes darting."),
    ba_cacao: room("bacacao", "The coffee and cacao house", "The coffee and cacao house: a bamboo hut on stilts over the terraces, sacks of beans, a roasting pan over a fire, and little cups set out for tasting.")
  },
  lines: {
    hana: ["A beanbag, the sunset and a fresh coconut. I'm not moving till Tuesday.", "The offerings on every step! Flowers and rice and a little incense. Every single morning.", "Frangipani everywhere. I want to bottle the air."],
    theo: ["The carving on these gateways. Every inch of stone, all done by hand.", "The water for the terraces goes from field to field by little channels. A thousand years old, that system.", "I sat in with the gamelan. Everything interlocks. Nobody plays the tune; everybody plays a bit of it."],
    farid: ["Ketut let me plant rice! Bare feet in the mud. I've never been so happy and so muddy.", "Vanilla, cacao, palm sugar, lemongrass. I need a bigger bag.", "The coffee here! Strong and sweet and thick. I'll be awake until Thursday."],
    mei: ["Very warm. Very green. Very gentle.", "The ducks walk in a line behind the farmer. Like a little army.", "The dancers' eyes! They move their eyes like they're dancing too."],
    bo: ["A monkey took my sunglasses. I gave him a banana. We have an understanding now.", "Coconut. With a straw. Straight from the tree. Life complete.", "I've had nasi goreng three times. It's breakfast, lunch and dinner food. It's all-the-food food."],
    tomi: ["The swing goes right out over the valley! I screamed. In a manly way.", "The surf at Uluwatu! I'm not going in. I'm watching. Respectfully. From up here.", "The fire dance! A hundred men chanting cak-cak-cak. My heart's still going."],
    posy: ["Ibu Sari showed me how to make a canang sari. Every colour goes in a direction!", "I bought a sarong in every colour. I have no regrets.", "The silver ring! With a little frangipani on it. I made it. Me!"]
  },
  say: {
    bajetty: "The jetty: the ferry tied up at the end, fishing boats with outriggers like long legs, and ferries home to Honeybrook until 10pm.",
    babeach: "The beach: wide golden sand, beanbags and umbrellas in rows, surfers out on the waves, and a man selling coconuts from a cart.",
    bawarung: "The warung: a little open-sided café under a palm-thatch roof, with a chalkboard: NASI GORENG, MIE GORENG, ES KELAPA.",
    basunset: "The sunset spot: the best place on the island to watch the sun drop into the sea, everything going orange, then pink, then violet.",
    baboats: "The jukung: little wooden fishing boats with outriggers either side like insect legs, painted with eyes on the bow so they can see their way home.",
    bamarket: "Ubud market: a big covered market with stalls spilling out into the street.",
    basilver: "The silversmith's: a shop with a carved wooden door and rings glinting in the window.",
    bapalace: "The palace: through the split gate (two halves of a carved stone tower, with the doorway between) into a courtyard of red brick and gold.",
    bamonkeys: "The monkey forest: huge old trees, mossy temples, and grey long-tailed macaques everywhere, looking at your bag.",
    baterraces: "The rice terraces: green steps curving down the valley, water glinting in every one, coconut palms on the edges.",
    basubak: "The subak: little channels carrying water from terrace to terrace, shared by the whole village. Over a thousand years old.",
    baswing: "The jungle swing: a long rope swing out over the valley from a palm tree. Strapped in, you fly right out over the terraces.",
    bacacao: "The coffee and cacao house: a bamboo hut on stilts with a view down the terraces, and a smell of roasting.",
    batemple: "Uluwatu temple: a little temple perched right on the edge of a seventy-metre cliff, the sea crashing far below.",
    bakecak: "The amphitheatre: a stone ring on the clifftop facing the sunset, where the kecak fire dance is performed every evening.",
    bacliff: "The cliff path: along the edge with a low wall, the sea a long, long way down, frangipani trees leaning over.",
    basurf: "The surf: from up here the waves look tiny, and the surfers like little dots. They're not tiny waves."
  }
};

export const BL_PLACES = {
  // Seminyak (arrive here): the jetty, the beach, the warung, the sunset spot, the boats
  bajetty: {scene: "ba_seminyak", name: "The jetty", door: [230, 530], spot: true, mark: [300, 500], line: "The jetty. Ferries home to Honeybrook until 10pm."},
  bawarung: {scene: "ba_seminyak", name: "The warung", door: [130, 276], spot: true, mark: [130, 150], line: "The warung."},
  babeach: {scene: "ba_seminyak", name: "The beach", door: [380, 486], spot: true, mark: [380, 400], line: "The beach."},
  basunset: {scene: "ba_seminyak", name: "The sunset spot", door: [440, 330], spot: true, mark: [440, 260], line: "The sunset spot."},
  baboats: {scene: "ba_seminyak", name: "The jukung", door: [100, 520], spot: true, mark: [80, 470], line: "The fishing boats."},
  baToTegallalang: {scene: "ba_seminyak", name: "Up to Tegallalang", door: [262, 26], spot: true, bridge: "ba_tegallalang", mark: [200, 30], line: "North up into the hills to Tegallalang."},
  baToUluwatu: {scene: "ba_seminyak", name: "To Uluwatu", door: [504, 330], spot: true, bridge: "ba_uluwatu", mark: [476, 270], line: "East along the coast to Uluwatu."},
  // Ubud: the market, the silversmith, the palace, the monkey forest
  bamarket: {scene: "ba_ubud", name: "Ubud market", door: [130, 186], spot: true, mark: [130, 60], line: "Ubud market."},
  basilver: {scene: "ba_ubud", name: "The silversmith", door: [390, 186], spot: true, mark: [390, 60], line: "The silversmith."},
  bapalace: {scene: "ba_ubud", name: "The palace", door: [260, 396], spot: true, mark: [260, 290], line: "The palace."},
  bamonkeys: {scene: "ba_ubud", name: "The monkey forest", door: [400, 424], spot: true, mark: [440, 500], line: "The monkey forest."},
  baToTegallalangW: {scene: "ba_ubud", name: "To Tegallalang", door: [16, 300], spot: true, bridge: "ba_tegallalang", mark: [40, 240], line: "West to the rice terraces at Tegallalang."},
  baToUluwatuS: {scene: "ba_ubud", name: "To Uluwatu", door: [262, 612], spot: true, bridge: "ba_uluwatu", mark: [200, 590], line: "South to Uluwatu."},
  // Tegallalang: the terraces, the subak, the swing, the cacao house
  baterraces: {scene: "ba_tegallalang", name: "The rice terraces", door: [260, 236], spot: true, mark: [260, 120], line: "The rice terraces."},
  basubak: {scene: "ba_tegallalang", name: "The water channels", door: [300, 470], spot: true, mark: [300, 400], line: "The water channels."},
  baswing: {scene: "ba_tegallalang", name: "The jungle swing", door: [420, 376], spot: true, mark: [420, 280], line: "The jungle swing."},
  bacacao: {scene: "ba_tegallalang", name: "The coffee and cacao house", door: [120, 436], spot: true, mark: [120, 320], line: "The coffee and cacao house."},
  baToUbud: {scene: "ba_tegallalang", name: "To Ubud", door: [504, 300], spot: true, bridge: "ba_ubud", mark: [476, 240], line: "East to Ubud."},
  baToSeminyak: {scene: "ba_tegallalang", name: "Down to Seminyak", door: [262, 612], spot: true, bridge: "ba_seminyak", mark: [200, 590], line: "South down to the coast at Seminyak."},
  // Uluwatu: the temple, the amphitheatre, the cliff path, the surf
  batemple: {scene: "ba_uluwatu", name: "Uluwatu temple", door: [365, 216], spot: true, mark: [365, 80], line: "Uluwatu temple."},
  bakecak: {scene: "ba_uluwatu", name: "The amphitheatre", door: [200, 456], spot: true, mark: [200, 370], line: "The amphitheatre."},
  bacliff: {scene: "ba_uluwatu", name: "The cliff path", door: [400, 330], spot: true, mark: [420, 260], line: "The cliff path."},
  basurf: {scene: "ba_uluwatu", name: "The surf", door: [380, 520], spot: true, mark: [400, 470], line: "The surf."},
  baToSeminyakW: {scene: "ba_uluwatu", name: "To Seminyak", door: [16, 330], spot: true, bridge: "ba_seminyak", mark: [40, 270], line: "West along the coast to Seminyak."},
  baToUbudN: {scene: "ba_uluwatu", name: "To Ubud", door: [262, 26], spot: true, bridge: "ba_ubud", mark: [200, 30], line: "North to Ubud."},
  // the rooms (their panels, from the counter inside)
  ba_warung: {scene: "ba_seminyak", name: "The warung", door: [130, 276]}, ba_market: {scene: "ba_ubud", name: "Ubud market", door: [130, 186]},
  ba_silver: {scene: "ba_ubud", name: "The silversmith", door: [390, 186]}, ba_dance: {scene: "ba_ubud", name: "The dance pavilion", door: [260, 396]},
  ba_cacao: {scene: "ba_tegallalang", name: "The coffee and cacao house", door: [120, 436]}
};
// the palace's gate leads into the dance pavilion
BL_TOWN.rooms.ba_dance.door = "bapalace";
export const BL_BRIDGES = {ba_seminyak: {ba_tegallalang: "baToTegallalang", ba_uluwatu: "baToUluwatu"}, ba_ubud: {ba_tegallalang: "baToTegallalangW", ba_uluwatu: "baToUluwatuS"},
  ba_tegallalang: {ba_ubud: "baToUbud", ba_seminyak: "baToSeminyak"}, ba_uluwatu: {ba_seminyak: "baToSeminyakW", ba_ubud: "baToUbudN"}};
export const BL_ARRIVE = {"ba_seminyak>ba_tegallalang": [262, 572], "ba_tegallalang>ba_seminyak": [262, 70], "ba_seminyak>ba_uluwatu": [44, 330], "ba_uluwatu>ba_seminyak": [474, 330],
  "ba_tegallalang>ba_ubud": [44, 300], "ba_ubud>ba_tegallalang": [474, 300], "ba_ubud>ba_uluwatu": [262, 70], "ba_uluwatu>ba_ubud": [262, 572]};
export const BL_BOUNDS = {ba_seminyak: [14, 26, 506, 530], ba_ubud: [14, 26, 506, 616], ba_tegallalang: [14, 26, 506, 616], ba_uluwatu: [14, 26, 436, 556],
  ba_warung: [30, 250, 490, 600], ba_market: [30, 250, 490, 600], ba_silver: [30, 250, 490, 600], ba_dance: [30, 250, 490, 600], ba_cacao: [30, 250, 490, 600]};
export const BL_OBST = {
  // Seminyak: the warung, the beanbags and umbrellas, the sea along the bottom (but for the jetty), the boats pulled up on the sand
  ba_seminyak: [[40, 150, 220, 260], [300, 420, 460, 470], [0, 540, 200, 640], [260, 540, 520, 640], [50, 470, 150, 510]],
  // Ubud: the market, the silversmith, the palace gate and courtyard, the monkey forest
  ba_ubud: [[40, 60, 220, 170], [300, 60, 480, 170], [180, 300, 340, 380], [360, 440, 506, 600]],
  // Tegallalang: the terraces (two broad steps), the swing's platform, the cacao house
  ba_tegallalang: [[40, 60, 480, 120], [60, 150, 460, 210], [380, 300, 460, 360], [40, 320, 200, 420]],
  // Uluwatu: the sea to the east and along the bottom, the temple on its headland, the amphitheatre ring
  ba_uluwatu: [[440, 0, 520, 640], [0, 560, 520, 640], [300, 60, 430, 200], [120, 320, 280, 440]],
  // the rooms: round the edges
  ba_warung: [[300, 230, 490, 300], [80, 340, 140, 372], [380, 340, 440, 372], [80, 480, 140, 512], [380, 480, 440, 512]],
  ba_market: [[30, 250, 130, 300], [390, 250, 490, 300], [30, 380, 130, 430], [390, 380, 490, 430]],
  ba_silver: [[180, 280, 340, 330], [30, 250, 100, 480], [420, 250, 490, 480]],
  ba_dance: [[30, 440, 250, 500], [300, 250, 490, 300], [30, 250, 80, 400]],
  ba_cacao: [[180, 300, 340, 350], [30, 250, 110, 460], [420, 250, 490, 460]]
};

// Bali's goods, by room. Cacao, salak and lemongrass go to the kitchen (and into gelato and bonbons). Coconut, vanilla
// and gula melaka are already on Honeybrook's shelves. Every sell price is below its buy price.
export const BL_GOODS = {
  cacao_bl: {n: "Balinese cacao", kind: "ingredient", price: 9, sell: 5, shop: "ba_cacao", art: ["box", "#5A3A2A", "#C9A27E"], what: "beans from the farm above the terraces: a cacao bonbon, coconut and cacao pudding"},
  salak: {n: "Snake fruit (salak)", kind: "ingredient", price: 5, sell: 3, shop: "ba_market", art: ["disc", "#6B3A2A", "#F3E1B0"], what: "scaly brown skin, sweet and tangy inside: salak salad, gelato"},
  lemongrass: {n: "Lemongrass", kind: "ingredient", price: 3, sell: 1, shop: "ba_market", art: ["box", "#B9C98A", "#7FA35A"], what: "for sate lilit at the kitchen, a lemongrass gelato, an infused oil at the mill"},
  b_coffee: {n: "Kintamani coffee", kind: "gift", to: ["farid", "theo", "mei", "tomi"], price: 10, shop: "ba_cacao", art: ["box", "#3A2A20", "#C9A27E"], say: "Coffee from the volcano slopes! Fruity, strong. I'll make it the Bali way, thick and sweet."},
  b_sarong: {n: "A batik sarong", kind: "gift", to: ["hana", "posy", "mei", "bo"], price: 14, shop: "ba_market", art: ["cloth", "#3E6BAE", "#F3D34A"], say: "A sarong! It's a skirt, a scarf, a towel and a blanket. I'm wearing it now."},
  b_basket: {n: "A woven basket", kind: "gift", to: ["farid", "hana", "mei"], price: 9, shop: "ba_market", art: ["box", "#C9A27E", "#8A6A52"], say: "A basket from Ubud, woven by hand! For the market. Or for the shelf. Or for me to just look at."},
  b_carving: {n: "A carved wooden frog", kind: "keepsake", price: 12, shop: "ba_market", art: ["disc", "#8A5A3A", "#5E8A48"], line: "A little frog carved from wood in Ubud, with a lily pad hat. He sits on the shelf and looks pleased with himself."},
  b_bangle: {n: "A silver bangle", kind: "gift", to: ["hana", "posy", "mei"], price: 26, shop: "ba_silver", art: ["disc", "#D6D0C6", "#9A928A"], say: "Balinese silver, with little flowers all the way round! I'm never taking it off."},
  b_magnet: {n: "Bali fridge magnet", kind: "gift", to: "family", price: 3, shop: "ba_market", art: ["disc", "#5E8A48", "#F3D34A"], say: "A tiny rice terrace and a frangipani. For the fridge!"},
  // what you make (never sold)
  b_ring: {n: "Your silver ring", kind: "gift", to: ["hana", "posy", "mei", "farid"], price: 0, art: ["disc", "#E6E2DA", "#F3D34A"], say: "A silver ring! You made this? With the little flower? It fits. It actually fits!"},
  b_canang: {n: "Your canang sari", kind: "keepsake", price: 0, art: ["box", "#7FA35A", "#F4C7CF"], line: "A little palm-leaf tray you folded with Ibu Sari in Ubud market, with flowers in four colours, each at its own point of the compass. It's dried now, but it still smells of frangipani."},
  b_gong: {n: "A little gong", kind: "keepsake", price: 0, art: ["disc", "#C9A24A", "#8A6A3A"], line: "A small bronze gong from the dance pavilion in Ubud, for learning the gamelan. Pak Nyoman gave it to you. Strike it gently: it hums for a whole minute."}
};
export const BL_KEEP = {b_magnet: "A tiny rice terrace and a frangipani, from Bali.", b_sarong: "A batik sarong from Ubud market.", b_basket: "A woven basket from Ubud market."};
// the carved animals (the souvenir collection): one carver at the market makes a different one each day of the week
export const CARVINGS = {gecko: "a gecko with a curly tail", turtle: "a sea turtle, its shell all little hexagons", duck: "one of the rice-field ducks, mid-waddle", monkey: "a monkey holding a stolen banana", owl: "a sleepy owl", cat: "a cat curled round", frog: "a frog in a lily pad hat"};
export const CARVE_DAYS = ["gecko", "turtle", "duck", "monkey", "owl", "cat", "frog"];
Object.entries(CARVINGS).forEach(([k, what]) => { BL_GOODS["bc_" + k] = {n: `A carved ${k}`, kind: "keepsake", price: 0, art: ["disc", "#8A5A3A", "#C9A27E"], line: `A little wooden carving from Ubud market: ${what}.`}; });
BL_GOODS.b_ark = {n: "A shelf of carved animals", kind: "keepsake", price: 0, art: ["box", "#8A5A3A", "#5E8A48"], line: "All seven of the Ubud carver's animals, one for each day of the week, lined up on a little carved shelf he made to go with them."};
delete BL_GOODS.b_carving;
