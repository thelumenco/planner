// Puffin Isle (boat towns, round 214): a small wild green island ringed by cliffs, a sail out past Saltwick to the
// edge of the open sea. Inspired by Skomer, the Farne Islands and Lundy: no cars and no village, just turf, sea pinks,
// bluebells, rabbit and puffin burrows, a stone jetty, the warden's hut, an old farm with a walled garden and a pond,
// and a white lighthouse on the far tip with the keeper's cottage, rock pools, a sea-glass cove and a seal beach.
//   pi_haven (North Haven) *  | pi_wick  (The Wick)
//   pi_farm  (The Old Farm)    | pi_point (Lighthouse Point)
// You land in North Haven (top left): the cove and the stone jetty are along the TOP of the screen, and the steep path
// climbs up from the cove onto the island. A ring: the haven and the Wick are joined along the clifftop; the haven
// and the farm by the track down the middle of the island; the Wick and the point by the coast path; the farm and the
// point by the lane out to the lighthouse.
// Seasons matter here (see puffinSeason): puffins April to early August, seal pups September to December, winter seas
// January to March. Rooms: the warden's hut in the haven, the tearoom at the farm, and the lighthouse lamp room, the
// keeper's kitchen and Ivy's boathouse studio on the point.
import { PI_ROOM_OBST, PI_ROOM_PARTY } from "./puffin-rooms-layout.js";

// What's on the island on a given day: "puffins" (April to July, and August 1st to 10th), "late" (the rest of August:
// the puffins have just gone, a few late ones), "seals" (September to December: grey seal pups on the beach) or
// "winter" (January to March: big seas, the island to yourself). The art and the game both read this.
export function puffinSeason(day){
  const m = +String(day).slice(5, 7), d = +String(day).slice(8, 10);
  return (m >= 4 && m <= 7) || (m === 8 && d <= 10) ? "puffins" : m === 8 ? "late" : m >= 9 ? "seals" : "winter";
}
// the flowers: bluebells in April and May, sea pinks (thrift) and sea campion May to July
export const piBluebells = day => [4, 5].includes(+String(day).slice(5, 7));
export const piThrift = day => [5, 6, 7].includes(+String(day).slice(5, 7));

// what the boat panel says is on the island in a given month (1 to 12)
const seesMonth = m => m >= 4 && m <= 7 ? "Puffins! Thousands of them on the cliffs and by their burrows, April to early August. Guillemots and razorbills packed onto the ledges too."
  : m === 8 ? "The very end of puffin season: they leave for the open sea around the tenth of August. Catch the last ones early in the month."
  : m >= 9 ? "The puffins have gone to sea for the winter. Grey seal pups on the beach at the point, white and fluffy, September to December."
  : "Winter: big seas and the island to yourself. Gannets far out, rabbits on the turf. The puffins are back in April.";

// seasonal lines for the places that change: the cliffs and the seal beach (null when the plain say line will do)
export function seasonSay(id, day){
  const s = puffinSeason(day);
  if (id === "picliffs") return s === "puffins" ? "The Wick in puffin season: puffins everywhere, standing by their burrows, whirring in from the sea with beaks full of sand eels, and the ledges packed with guillemots and razorbills. The noise!"
    : s === "late" ? "Nearly all the puffins have gone to sea. Just a few late ones left, still feeding a chick down a burrow. The ledges are quiet now."
    : s === "seals" ? "The burrows are empty: the puffins are out on the open Atlantic until spring. Fulmars glide along the cliff on stiff wings, and the bracken's turned rusty."
    : "The cliffs in winter: empty ledges, spray flying up the Wick, and the wind straight off the sea. The puffins will be back in April.";
  if (id === "piseals") return s === "seals" ? "The seal beach: white fluffy pups lying on the pebbles like dropped pillows, and their mothers watching from the shallows. Keep back and keep quiet."
    : s === "winter" ? "The seal beach, empty now. The pups have moulted grey and gone to sea. Big waves rolling the pebbles up and down."
    : "The seal beach: a couple of grey seals bobbing in the shallows, watching you with big dark eyes. The pups come in the autumn.";
  if (id === "pirabbits" && s === "winter") return "The rabbit warren, nibbled down to a lawn. The rabbits are out all winter, ears flat against the wind.";
  if (id === "pigarden" && s === "winter") return "The walled garden asleep for the winter: kale, leeks, and a robin on the spade handle.";
  return null;
}

export const PI_TOWNS = {
  puffin: {
    n: "Puffin Isle", by: "boat", fare: 0, free: ["evan"], outFrom: 8*60, outTo: 14*60, backTo: 19*60,   // (trips.js BOAT_HOME: by boat, home before dark)
    screens: ["pi_haven", "pi_wick", "pi_farm", "pi_point"], arrive: ["pi_haven", [260, 160]], station: "piboat", music: "puffin",
    boat: {fuel: 14, pier: "piboat", arrive: ["pi_haven", [260, 160]], sight: "puffin",
      blurb: "Out past the headland to the little wild island on the edge of the open sea: cliffs, sea pinks, a lighthouse on the far tip, and nobody living there but the keeper, the warden and a great many birds.",
      arriveLine: "Puffin Isle! You nose into North Haven and tie up at the little stone jetty. Above the cove the island rises green and wild, and the air is full of birds.",
      sees: seesMonth},
    blurb: "A small wild island ringed by cliffs: puffins in summer, seal pups in autumn, a white lighthouse, and no cars at all.",
    arriveLine: "Puffin Isle! Green turf, grey cliffs, a white lighthouse on the far tip, and the wind smelling of salt and grass.",
    evanArrive: ["Mama, a ISLAND!", "where the puffins? where?", "bunnies! a bunny!"],
    evanScreen: {pi_haven: ["bunny holes!", "a boat on the wall!"], pi_wick: ["PUFFINS!", "funny beaks!"], pi_farm: ["duck! in the pond!", "a garden with walls"], pi_point: ["a big lighthouse!", "fluffy seal babies!"]},
    hints: {
      pi_haven: "North Haven: your boat at the stone jetty, the steep path up from the cove, the warden's hut and the rabbit warren. East: along the clifftop to the Wick. South: the track down to the old farm.",
      pi_wick: "The Wick: the great seabird cliffs and the puffin burrows, the rope line to watch from, and the bench at the cliff edge. West: back to North Haven. South: the coast path to Lighthouse Point.",
      pi_farm: "The Old Farm: the farmhouse tearoom, the walled garden, the pond and the picnic meadow. North: up the track to North Haven. East: the lane out to the lighthouse.",
      pi_point: "Lighthouse Point: the lighthouse, the keeper's cottage, Ivy's boathouse, the rock pools, the sea-glass cove and the seal beach. North: the coast path to the Wick. West: the lane back to the farm."},
    spots: {
      mum: {pi_haven: [[200, 380], [300, 290]], pi_wick: [[250, 420], [160, 330]], pi_farm: [[260, 300], [330, 520]], pi_point: [[200, 300], [270, 420]]},
      dad: {pi_haven: [[160, 430], [330, 520]], pi_wick: [[340, 460], [220, 500]], pi_farm: [[200, 310], [420, 380]], pi_point: [[260, 300], [180, 470]]},
      mama: {pi_haven: [[300, 420], [220, 520]], pi_wick: [[400, 420], [120, 470]], pi_farm: [[340, 300], [250, 460]], pi_point: [[300, 400], [230, 480]]},
      gonggong: {pi_haven: [[180, 260], [190, 270]], pi_wick: [[300, 400], [310, 410]], pi_farm: [[260, 380], [270, 390]], pi_point: [[350, 300], [360, 310]]},
      darren: {pi_haven: [[300, 170], [380, 300]], pi_wick: [[260, 540], [380, 500]], pi_farm: [[400, 520], [160, 540]], pi_point: [[160, 370], [320, 430]]},
      marcus: {pi_haven: [[260, 460], [140, 380]], pi_wick: [[180, 400], [420, 470]], pi_farm: [[120, 300], [300, 560]], pi_point: [[340, 360], [140, 300]]},
      angelina: {pi_haven: [[350, 370], [200, 560]], pi_wick: [[230, 380], [330, 540]], pi_farm: [[380, 260], [460, 420]], pi_point: [[220, 380], [280, 500]]}
    },
    acts: {},
    rooms: {},
    lines: {
      mum: ["No cars, no shops, no signal. Just birds and wind. I could stay a week.", "Sea pinks all along the cliff. I'm going to lie down in them and not move.", "Smell that air. That's proper air. You could bottle it."],
      dad: ["Did you know puffins can carry ten fish at once? Crosswise in the beak. Nobody knows how they hold the tenth.", "The lighthouse went automatic in the nineties. The keeper stayed anyway. I respect that.", "Mind the burrows. The whole clifftop is hollow. It's a puffin block of flats under there."],
      mama: ["So many rabbits. Ma Ma counts twelve. No, thirteen. Fourteen!", "Samphire on the rocks! You blanch it, a little butter. Ma Ma knows.", "The seal babies look like dumplings. Very white, very round. Ma Ma wants to tuck them in."],
      gonggong: ["Good wind today. Gong Gong can hear the sea from every side.", "The lighthouse keeper polishes the brass every day. Gong Gong understands this. A thing should shine.", "Quiet island. Very good. Gong Gong will sit on this rock for one hour."],
      darren: ["I helped tie the boat up. Proper knots. Dai said they were fine. Fine! From a boatman!", "The whole island in an afternoon. I've done the maths. Lighthouse first.", "Mel, there's a tearoom at the farm and they do soup with bread you tear. I'm just saying."],
      marcus: ["Zeh, that puffin's got about eight fish in its mouth. How. HOW.", "If I lie really still the seals might come closer. Don't talk to me for ten minutes.", "Those birds on the ledge are standing in a line like a bus queue."],
      angelina: ["Sea glass is just broken bottles the sea spent fifty years polishing. That's actually beautiful.", "The puffins look like they're wearing little tuxedos and clown noses at the same time.", "I'm writing down the colours of the cliff. Grey isn't one colour here, it's about nine."],
      evan: ["puffin! PUFFIN!", "bunny in the hole!", "the lighthouse is so tall"]
    },
    say: {
      piboat: "Your boat, tied up at the end of the little stone jetty in North Haven. Sail home whenever you're ready, before dark.",
      piwarden: "The warden's hut: grey stone, a green door, a chalkboard of today's sightings, and a pair of binoculars always on the windowsill.",
      pipath: "The steep path up from the cove: stone steps cut into the bank, a rope to hold, and puffin burrows right beside the path. Mind your feet.",
      pirabbits: "The rabbit warren: little sandy mounds all over the turf, and rabbits everywhere, nibbling, ears up, white tails bobbing when they run.",
      picliffs: "The Wick: a great cleft in the island, sheer grey cliff on one side and a steep turf slope full of burrows on the other.",
      piropeline: "The rope line: a low rope on posts along the top of the slope, so the burrows don't get trodden in. The best seat in the house is just behind it.",
      piedge: "A weathered bench right at the cliff edge, looking straight down the Wick to the open sea. Hold on to your hat.",
      pitearoom: "The old farmhouse, whitewashed, with a slate roof and smoke from the chimney. Bryn's tearoom: soup, cake, and walking boots by the door.",
      pigarden: "The walled garden: old stone walls keeping the wind off rows of beans and kale, fuchsia in the corners, and bees in the borage.",
      pipond: "The farm pond: yellow flag irises, a moorhen picking about in the reeds, and a heron who pretends not to see you.",
      pimeadow: "The picnic meadow: soft turf full of little flowers, a picnic rug, and a view of the sea on two sides.",
      pilighthouse: "The lighthouse: white and round, a hundred and two steps up to the lamp room, and a brass plaque by the door that someone polishes every day.",
      pikeeper: "The keeper's cottage: thick white walls, a blue door, washing on the line, and a cat in the window. Morwenna's kettle is always on.",
      piboathouse: "The old boathouse at the top of the slipway, its doors open and jars of sea glass glowing in the window. Ivy's studio.",
      pipools: "The rock pools: anemones like blobs of red jelly, little crabs, shrimps, limpets, and samphire growing in the cracks.",
      piglass: "The sea-glass cove: a little pebble beach, and in among the pebbles, glass the sea has polished smooth. Green, brown, white, and once in a while blue.",
      piseals: "The seal beach, a quiet cove under the lighthouse where the grey seals haul out."
    }
  }
};

// Places on the four screens. bridge: a gate to another screen.
export const PI_PLACES = {
  // North Haven: your boat at the jetty, the cove path, the warden's hut, the rabbit warren
  piboat: {scene: "pi_haven", name: "Your boat", door: [262, 132], spot: true, mark: [330, 50], line: "Your boat at the jetty. Sail home before dark."},
  pipath: {scene: "pi_haven", name: "The cove path", door: [262, 210], spot: true, mark: [300, 190], line: "The steep path up from the cove."},
  piwarden: {scene: "pi_haven", name: "The warden's hut", door: [104, 326], spot: true, mark: [104, 230], line: "The warden's hut."},
  pirabbits: {scene: "pi_haven", name: "The rabbit warren", door: [404, 482], spot: true, mark: [404, 420], line: "The rabbit warren."},
  piToWick: {scene: "pi_haven", name: "Along the clifftop", door: [500, 352], spot: true, bridge: "pi_wick", mark: [460, 330], line: "East along the clifftop to the Wick."},
  piToFarm: {scene: "pi_haven", name: "Down the track", door: [260, 612], spot: true, bridge: "pi_farm", mark: [200, 600], line: "South down the track to the old farm."},
  // The Wick: the seabird cliffs, the rope line, the bench at the edge
  picliffs: {scene: "pi_wick", name: "The seabird cliffs", door: [320, 346], spot: true, mark: [330, 200], line: "The seabird cliffs and the puffin burrows."},
  piropeline: {scene: "pi_wick", name: "The rope line", door: [440, 352], spot: true, mark: [440, 326], line: "The rope line along the burrows."},
  piedge: {scene: "pi_wick", name: "The bench at the edge", door: [150, 236], spot: true, mark: [150, 200], line: "The bench at the cliff edge."},
  piToHaven: {scene: "pi_wick", name: "Along the clifftop", door: [20, 410], spot: true, bridge: "pi_haven", mark: [70, 390], line: "West along the clifftop to North Haven."},
  piToPoint: {scene: "pi_wick", name: "The coast path", door: [300, 612], spot: true, bridge: "pi_point", mark: [240, 600], line: "South along the coast path to Lighthouse Point."},
  // The Old Farm: the tearoom, the walled garden, the pond, the meadow
  pitearoom: {scene: "pi_farm", name: "The farm tearoom", door: [130, 216], spot: true, mark: [130, 120], line: "Bryn's tearoom in the old farmhouse."},
  pigarden: {scene: "pi_farm", name: "The walled garden", door: [385, 226], spot: true, mark: [385, 130], line: "The walled garden."},
  pipond: {scene: "pi_farm", name: "The pond", door: [130, 492], spot: true, mark: [130, 420], line: "The farm pond."},
  pimeadow: {scene: "pi_farm", name: "The picnic meadow", door: [360, 456], spot: true, mark: [360, 430], line: "The picnic meadow."},
  piToHavenN: {scene: "pi_farm", name: "Up the track", door: [260, 40], spot: true, bridge: "pi_haven", mark: [260, 90], line: "North up the track to North Haven."},
  piToPointE: {scene: "pi_farm", name: "The lighthouse lane", door: [500, 330], spot: true, bridge: "pi_point", mark: [460, 300], line: "East along the lane to Lighthouse Point."},
  // Lighthouse Point: the lighthouse, the keeper's cottage, the boathouse, the rock pools, the cove, the seal beach
  pilighthouse: {scene: "pi_point", name: "The lighthouse", door: [398, 246], spot: true, mark: [398, 120], line: "The lighthouse."},
  pikeeper: {scene: "pi_point", name: "The keeper's cottage", door: [292, 236], spot: true, mark: [292, 160], line: "The keeper's cottage."},
  piboathouse: {scene: "pi_point", name: "Ivy's boathouse", door: [96, 528], spot: true, mark: [96, 460], line: "Ivy's boathouse studio."},
  pipools: {scene: "pi_point", name: "The rock pools", door: [356, 470], spot: true, mark: [400, 530], line: "The rock pools."},
  piglass: {scene: "pi_point", name: "The sea-glass cove", door: [236, 534], spot: true, mark: [240, 570], line: "The sea-glass cove."},
  piseals: {scene: "pi_point", name: "The seal beach", door: [360, 372], spot: true, mark: [420, 380], line: "The seal beach."},
  piToWickN: {scene: "pi_point", name: "The coast path", door: [200, 40], spot: true, bridge: "pi_wick", mark: [200, 90], line: "North along the coast path to the Wick."},
  piToFarmW: {scene: "pi_point", name: "The lighthouse lane", door: [20, 330], spot: true, bridge: "pi_farm", mark: [70, 310], line: "West along the lane to the old farm."}
};
// the rooms: the place each room's door is on, for the Exit
Object.assign(PI_PLACES, {pi_warden: {scene: "pi_haven", name: "The warden's hut", door: [104, 326]}, pi_tearoom: {scene: "pi_farm", name: "The farm tearoom", door: [130, 216]},
  pi_lamp: {scene: "pi_point", name: "The lighthouse", door: [398, 246]}, pi_kitchen: {scene: "pi_point", name: "The keeper's cottage", door: [292, 236]},
  pi_studio: {scene: "pi_point", name: "Ivy's boathouse", door: [96, 528]}});
export const PI_BRIDGES = {
  pi_haven: {pi_wick: "piToWick", pi_farm: "piToFarm"}, pi_wick: {pi_haven: "piToHaven", pi_point: "piToPoint"},
  pi_farm: {pi_haven: "piToHavenN", pi_point: "piToPointE"}, pi_point: {pi_wick: "piToWickN", pi_farm: "piToFarmW"}
};
export const PI_ARRIVE = {
  "pi_haven>pi_wick": [50, 410], "pi_wick>pi_haven": [470, 352], "pi_haven>pi_farm": [260, 80], "pi_farm>pi_haven": [260, 580],
  "pi_wick>pi_point": [200, 80], "pi_point>pi_wick": [300, 580], "pi_farm>pi_point": [50, 330], "pi_point>pi_farm": [470, 330]
};
// walkable bounds [x1, y1, x2, y2] and obstacles (sea, cliffs, buildings, burrows, walls, bracken)
export const PI_BOUNDS = {
  pi_haven: [14, 26, 506, 616], pi_wick: [14, 26, 506, 616], pi_farm: [14, 26, 506, 616], pi_point: [14, 26, 506, 616],
  pi_warden: [30, 250, 490, 600], pi_lamp: [30, 250, 490, 600], pi_kitchen: [30, 250, 490, 600], pi_studio: [30, 250, 490, 600], pi_tearoom: [30, 250, 490, 600]
};
export const PI_OBST = {
  // the sea and the rocks either side of the cove, the cove and the jetty, Dai's lobster pots, the puffin burrows on the
  // east clifftop, the warden's hut and its water butt, the rabbit warren, the bracken and the old walls in the bottom
  // corners, the west cliff, the signpost
  pi_haven: [[0, 0, 164, 198], [164, 0, 384, 116], [384, 0, 520, 190], [200, 116, 248, 150], [404, 192, 520, 258], [40, 206, 170, 316], [340, 400, 472, 466], [0, 540, 124, 640], [404, 548, 520, 640], [0, 198, 30, 300], [196, 288, 208, 306]],
  // the sea along the top, the cliffs and the Wick, the burrow slope behind the rope, the east cliffs, the bench, the
  // boulders, the bracken and the old wall in the bottom corners
  pi_wick: [[0, 0, 520, 64], [186, 56, 520, 236], [196, 236, 520, 324], [480, 324, 520, 640], [124, 200, 176, 220], [66, 450, 96, 470], [0, 560, 134, 640], [392, 566, 520, 640], [0, 64, 40, 300]],
  // the farmhouse, the walled garden, the pond, the sea along the bottom, the hawthorn, the woodpile, the beehives
  pi_farm: [[20, 56, 240, 204], [282, 56, 488, 214], [40, 372, 222, 478], [0, 574, 520, 640], [438, 498, 480, 528], [200, 160, 240, 204], [470, 140, 520, 280]],
  // the sea down the east side and along the bottom, the lighthouse and its wall, the keeper's cottage, the seal beach,
  // the rock pools, the sea-glass cove, the boathouse, the gorse, the washing line posts
  pi_point: [[460, 0, 520, 640], [0, 588, 520, 640], [362, 26, 436, 236], [226, 110, 356, 226], [376, 264, 520, 466], [336, 482, 520, 640], [166, 552, 330, 640], [34, 410, 158, 516], [0, 26, 120, 200], [130, 150, 136, 214]],
  ...PI_ROOM_OBST
};
export const PI_NAMES = {pi_haven: "Puffin Isle: North Haven", pi_wick: "Puffin Isle: the Wick", pi_farm: "Puffin Isle: the Old Farm", pi_point: "Puffin Isle: Lighthouse Point"};
export const PI_EVAN = {pi_haven: [[220, 400], [300, 300], [260, 500], [340, 560]], pi_wick: [[240, 400], [300, 460], [200, 520], [360, 420]], pi_farm: [[260, 320], [320, 420], [220, 520], [400, 500]], pi_point: [[240, 300], [320, 400], [260, 470], [180, 420]]};
