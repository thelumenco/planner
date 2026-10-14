// Saltwick Harbour (boat towns, round 206): the first town you sail to in your own boat. Inspired by Whitby and Robin
// Hood's Bay on the North Yorkshire coast: dark sandstone, red pantile roofs, cobbles, gulls, sea fret and hot tea.
// A river mouth splits the town: the West Side (the quay, and up on the West Cliff) and the East Side (the old town,
// and up the stone steps to the abbey on the headland). The swing bridge joins the two.
//   sw_west  (West Cliff)  | sw_abbey (Abbey Headland)
//   sw_quay  (The Quay *)  | sw_east  (East Side)
// You arrive on the quay (bottom left), where your boat ties up at the pontoon. The quay and the West Cliff are joined
// by the slope; the quay and the East Side by the swing bridge; the East Side and the abbey by the stone steps. There's
// no way across the river mouth up top, so the four screens make a horseshoe, not a ring.
// Rooms come in round 207, the people in round 208, the family's acts in round 209.

export const SW_TOWNS = {
  saltwick: {
    n: "Saltwick Harbour", by: "boat", fare: 0, free: ["evan"], outFrom: 8*60, outTo: 14*60, backTo: 19*60,   // (trips.js BOAT_HOME: by boat, home before dark)
    screens: ["sw_quay", "sw_east", "sw_west", "sw_abbey"], arrive: ["sw_quay", [300, 560]], station: "swboat", music: "saltwick",
    boat: {fuel: 10, pier: "swboat", arrive: ["sw_quay", [300, 560]], sight: "saltwick",
      blurb: "Up the coast to an old Yorkshire fishing town: red roofs climbing the cliffs, a swing bridge, a fish market on the quay and the abbey ruins on the headland. The nearest sail.",
      arriveLine: "Saltwick Harbour! You bring the boat in between the two little pier lighthouses and tie up at the pontoon. Gulls, red roofs piled up the cliffs, and the smell of salt and hot chips."},
    blurb: "An old fishing town on the Yorkshire coast: red roofs, a swing bridge, a fish market and the abbey on the cliff.",
    arriveLine: "Saltwick Harbour! Gulls, red roofs piled up the cliffs, and the smell of salt and hot chips.",
    evanArrive: ["Mama, the birdies are SHOUTING!", "red roofs! all red!", "a bridge that MOVES?"],
    evanScreen: {sw_quay: ["boats! fishing boats!", "lobster cages!"], sw_east: ["a bumpy road!", "steps steps steps"], sw_west: ["a big bone arch!", "little huts on the sand!"], sw_abbey: ["a broken castle!", "the sea is all the way down there"]},
    hints: {
      sw_quay: "The quay: your boat at the pontoon, the fish market, the Copper Kettle, the lobster pots and the two pier lighthouses. East: over the swing bridge to the old town. North: up the slope to the West Cliff.",
      sw_east: "The East Side: the cobbled lane, the jet workshop, the Fisherman's Arms and the chandlery. West: back over the swing bridge to the quay. North: the stone steps up to the abbey.",
      sw_west: "The West Cliff: the whalebone arch, the bandstand, the beach huts on the sands and the clifftop lawn. South: down the slope to the quay.",
      sw_abbey: "The headland: the abbey ruins, the clifftop church and its churchyard, the pond, and the view. South: down the steps to the old town."},
    spots: {
      mum: {sw_quay: [[200, 400], [260, 520]], sw_east: [[240, 420], [300, 360]], sw_west: [[240, 420], [330, 330]], sw_abbey: [[260, 380], [200, 470]]},
      dad: {sw_quay: [[240, 420], [180, 540]], sw_east: [[280, 470], [220, 360]], sw_west: [[200, 360], [300, 460]], sw_abbey: [[300, 420], [240, 330]]},
      mama: {sw_quay: [[180, 400], [240, 360]], sw_east: [[260, 440], [320, 400]], sw_west: [[260, 460], [200, 400]], sw_abbey: [[220, 420], [280, 470]]},
      gonggong: {sw_quay: [[270, 330], [280, 340]], sw_east: [[300, 470], [310, 480]], sw_west: [[160, 460], [170, 470]], sw_abbey: [[330, 470], [340, 480]]},
      darren: {sw_quay: [[280, 300], [230, 480]], sw_east: [[340, 330], [200, 470]], sw_west: [[360, 340], [240, 520]], sw_abbey: [[360, 360], [220, 520]]},
      marcus: {sw_quay: [[300, 440], [220, 330]], sw_east: [[200, 430], [330, 440]], sw_west: [[300, 300], [200, 500]], sw_abbey: [[240, 520], [320, 330]]},
      angelina: {sw_quay: [[230, 450], [280, 380]], sw_east: [[240, 380], [280, 520]], sw_west: [[280, 400], [180, 330]], sw_abbey: [[200, 380], [260, 440]]}
    },
    acts: {},
    rooms: {},
    lines: {
      mum: ["Every roof's red! Like someone dropped a box of tomatoes down the cliff.", "It's cold, but it's a lovely cold. Good for the skin.", "We're having fish and chips. I've decided."],
      dad: ["Captain Cook learned his trade in a town just like this. Coal ships, up and down this coast.", "That's a coble. Flat bottom, so they can land it on the beach. Clever.", "The tea here comes in a pot the size of a bucket. Marvellous."],
      mama: ["Lobster here very cheap. Ma Ma checking.", "So windy! Ma Ma's hair going everywhere.", "These fishermen's wives, very strong. Ma Ma respects."],
      gonggong: ["Cold sea. Strong fish. Good place.", "Gong Gong likes the boats. Old boats, still working.", "The gulls here are robbers. Watch your chips."],
      darren: ["One hundred and ninety-nine steps up to the abbey, apparently. I'm going to check.", "The swing bridge opens for the boats. Proper engineering, that.", "Mel, there's a pie shop. Just noting it."],
      marcus: ["Zeh, it's like the town's falling into the sea, but nicely.", "That gull just looked me in the eye. I don't trust it.", "The pub says there's singing tonight. I'm in."],
      angelina: ["It's so atmospheric. All this fog and ruins. I love it.", "The jet jewellery's gorgeous. Black, but shiny.", "I could sit on that bench and write all day."],
      evan: ["birdies!", "boats boats boats", "is the bridge going to MOVE?", "chips?"]
    },
    say: {
      swboat: "Your boat, tied up at the pontoon with the fishing boats either side of her. Sail home whenever you're ready, before dark.",
      swmarket: "The fish market: a long open shed on the quay, fish boxes stacked on ice, the morning's catch laid out in rows.",
      swkettle: "The Copper Kettle: a little tearoom with steamed-up windows and a brass kettle hanging over the door.",
      swpots: "Lobster pots stacked against the harbour wall: rope and netting and orange floats, smelling of the sea.",
      swpiers: "The two piers curl out into the sea, each with a little lighthouse on the end: green on one side, red on the other. Kittiwakes nest on the ledges.",
      swbridge: "The swing bridge: a little iron bridge across the river. When a boat comes, the whole thing swings open and everyone waits.",
      swjet: "The jet workshop: a tiny shop window full of black jewellery that shines like wet stones.",
      swpub: "The Fisherman's Arms: low beams, a fire, and a chalkboard that says SHANTY NIGHT THURSDAY.",
      swchandlery: "The chandlery: rope, brass, oilskins and lanterns, piled up to the ceiling.",
      swlane: "The cobbled lane: so narrow you could touch the cottages on both sides, climbing up and round towards the steps.",
      swarch: "The whalebone arch: two great curved jawbones of a whale, set up on the clifftop to remember the whaling ships. The abbey frames perfectly through it.",
      swbandstand: "The bandstand: green and white, with a brass band on Sunday afternoons and deckchairs all around.",
      swhuts: "The beach huts: a row of little painted huts on the sands below the cliff, every one a different colour.",
      swlawn: "The clifftop lawn: a bench, a blanket's worth of grass, and the whole bay below. The wind tries to take your sandwiches.",
      swabbey: "The abbey ruins: tall broken arches of dark stone against the sky, open to the wind. Over a thousand years old.",
      swchurch: "The clifftop church: squat and sturdy, its churchyard full of leaning gravestones worn smooth by the salt wind.",
      swpond: "The abbey pond: still and grey, reflecting the arches. A pair of ducks, very unbothered.",
      swview: "The view from the headland: the whole town below, red roofs tumbling down to the harbour, the piers, and the sea going on for ever."
    }
  }
};

// Places on the four screens. bridge: a gate to another screen.
export const SW_PLACES = {
  // the quay: your boat at the pontoon, the fish market shed, the tearoom, the pots, the piers, the swing bridge
  swboat: {scene: "sw_quay", name: "Your boat", door: [330, 572], spot: true, mark: [400, 520], line: "Your boat at the pontoon. Sail home before dark."},
  swmarket: {scene: "sw_quay", name: "The fish market", door: [120, 352], spot: true, mark: [120, 250], line: "The fish market."},
  swkettle: {scene: "sw_quay", name: "The Copper Kettle", door: [96, 546], spot: true, mark: [96, 440], line: "The Copper Kettle tearoom."},
  swpots: {scene: "sw_quay", name: "Lobster pots", door: [262, 312], spot: true, mark: [262, 250], line: "Lobster pots."},
  swpiers: {scene: "sw_quay", name: "The piers", door: [300, 150], spot: true, mark: [240, 90], line: "The two piers and their little lighthouses."},
  swToEast: {scene: "sw_quay", name: "Over the swing bridge", door: [500, 450], spot: true, bridge: "sw_east", mark: [470, 380], line: "East over the swing bridge to the old town."},
  swToWest: {scene: "sw_quay", name: "Up to the West Cliff", door: [70, 40], spot: true, bridge: "sw_west", mark: [120, 40], line: "North up the slope to the West Cliff."},
  // the East Side: the lane, the jet workshop, the pub, the chandlery, the steps
  swjet: {scene: "sw_east", name: "The jet workshop", door: [236, 330], spot: true, mark: [236, 230], line: "The jet workshop."},
  swpub: {scene: "sw_east", name: "The Fisherman's Arms", door: [430, 452], spot: true, mark: [430, 350], line: "The Fisherman's Arms."},
  swchandlery: {scene: "sw_east", name: "The chandlery", door: [350, 612], spot: true, mark: [380, 500], line: "The chandlery."},
  swlane: {scene: "sw_east", name: "The cobbled lane", door: [330, 400], spot: true, mark: [330, 330], line: "The cobbled lane."},
  swToQuay: {scene: "sw_east", name: "Over the swing bridge", door: [20, 450], spot: true, bridge: "sw_quay", mark: [60, 380], line: "West over the swing bridge to the quay."},
  swToAbbey: {scene: "sw_east", name: "Up the steps", door: [440, 40], spot: true, bridge: "sw_abbey", mark: [390, 40], line: "North up the stone steps to the abbey."},
  // the West Cliff: the arch, the bandstand, the huts, the lawn
  swarch: {scene: "sw_west", name: "The whalebone arch", door: [240, 330], spot: true, mark: [240, 230], line: "The whalebone arch."},
  swbandstand: {scene: "sw_west", name: "The bandstand", door: [400, 470], spot: true, mark: [400, 380], line: "The bandstand."},
  swhuts: {scene: "sw_west", name: "The beach huts", door: [260, 196], spot: true, mark: [380, 150], line: "The beach huts."},
  swlawn: {scene: "sw_west", name: "The clifftop lawn", door: [140, 450], spot: true, mark: [100, 380], line: "The clifftop lawn."},
  swToQuayS: {scene: "sw_west", name: "Down to the quay", door: [70, 612], spot: true, bridge: "sw_quay", mark: [130, 600], line: "South down the slope to the quay."},
  // the headland: the abbey, the church, the pond, the view
  swabbey: {scene: "sw_abbey", name: "The abbey ruins", door: [250, 300], spot: true, mark: [250, 120], line: "The abbey ruins."},
  swchurch: {scene: "sw_abbey", name: "The church and churchyard", door: [120, 520], spot: true, mark: [80, 410], line: "The clifftop church."},
  swpond: {scene: "sw_abbey", name: "The pond", door: [380, 400], spot: true, mark: [430, 360], line: "The abbey pond."},
  swview: {scene: "sw_abbey", name: "The view", door: [450, 230], spot: true, mark: [460, 170], line: "The view over the town."},
  swToEastS: {scene: "sw_abbey", name: "Down the steps", door: [440, 612], spot: true, bridge: "sw_east", mark: [380, 600], line: "South down the steps to the old town."}
};
export const SW_BRIDGES = {
  sw_quay: {sw_east: "swToEast", sw_west: "swToWest"}, sw_east: {sw_quay: "swToQuay", sw_abbey: "swToAbbey"},
  sw_west: {sw_quay: "swToQuayS"}, sw_abbey: {sw_east: "swToEastS"}
};
export const SW_ARRIVE = {
  "sw_quay>sw_east": [50, 450], "sw_east>sw_quay": [470, 450], "sw_quay>sw_west": [80, 580], "sw_west>sw_quay": [90, 80],
  "sw_east>sw_abbey": [440, 580], "sw_abbey>sw_east": [440, 80]
};
// walkable bounds [x1, y1, x2, y2] and obstacles (water, buildings, the ruins)
export const SW_BOUNDS = {
  sw_quay: [14, 26, 506, 600], sw_east: [14, 26, 506, 616], sw_west: [14, 190, 506, 616], sw_abbey: [14, 150, 506, 616]
};
export const SW_OBST = {
  // the harbour (the river down the east side and the mouth along the top; the pier and the swing bridge cross it), the
  // pontoon's sides, the fish market's stalls, the Copper Kettle, the cottages up the bank, the stacked pots
  sw_quay: [[180, 0, 286, 100], [314, 0, 350, 100], [350, 0, 520, 424], [350, 478, 520, 546], [470, 546, 520, 640], [350, 588, 470, 640],
    [20, 222, 216, 330], [10, 430, 180, 530], [110, 0, 180, 110], [0, 120, 50, 200], [222, 280, 306, 306]],
  // the river down the west side (the bridge crosses it) and the bridge keeper's hut, the cottages either side of the lane
  sw_east: [[0, 0, 110, 424], [0, 478, 110, 640], [108, 384, 140, 422], [136, 170, 304, 308], [356, 300, 520, 430], [146, 476, 244, 550],
    [316, 500, 440, 600], [440, 500, 520, 640], [200, 0, 372, 80], [476, 0, 520, 210]],
  // the guest houses along the clifftop, the bandstand
  sw_west: [[448, 190, 520, 384], [346, 372, 454, 458]],
  // the abbey's walls, the church, the pond
  sw_abbey: [[150, 84, 352, 282], [36, 390, 156, 500], [328, 364, 432, 396]]
};
export const SW_NAMES = {sw_quay: "Saltwick: the quay", sw_east: "Saltwick: the East Side", sw_west: "Saltwick: the West Cliff", sw_abbey: "Saltwick: the abbey"};
export const SW_EVAN = {sw_quay: [[260, 420], [220, 520], [280, 360], [300, 560]], sw_east: [[220, 440], [300, 420], [260, 520], [160, 450]], sw_west: [[240, 400], [300, 480], [200, 520], [340, 360]], sw_abbey: [[260, 360], [220, 460], [300, 500], [400, 460]]};
