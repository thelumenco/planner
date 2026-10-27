// Formentera (boat towns, round 231): the smallest, flattest and quietest of the Balearics, a short hop south of Ibiza.
// Pale sand, water so clear the boats seem to float in the air, whitewashed walls with blue and green shutters, fig
// trees propped up on wooden crutches, salt flats with flamingos, dry-stone walls, pines and juniper, and everyone on a
// bicycle. Inspired by La Savina's little harbour and the long white spit of Ses Illetes, the Ses Salines salt pans,
// Sant Francesc Xavier and its fortress church, and the high plateau of La Mola with its lighthouse and hippy market.
//   fm_salines (The salt flats)              | fm_mola    (La Mola: cliffs and lighthouse)
//   fm_illetes (Ses Illetes and La Savina) * | fm_village (Sant Francesc)
// You arrive at La Savina (bottom left), where your boat (or the ferry) ties up at the quay in the bottom-left corner.
// A ring: Ses Illetes and the salt flats by the dune boardwalk (Ses Illetes' north edge, the salt flats' south edge);
// Ses Illetes and Sant Francesc along the road east (east / west); the salt flats and La Mola by the Green Route
// (east / west); La Mola and Sant Francesc down the old road (south / north).
// Rooms: Marina's chiringuito at Ses Illetes; the salt works shop on the salt flats; Margalida's bakery and Joan's bike
// hire in Sant Francesc; inside La Mola lighthouse. (rounds 232 to 234: the rooms, the people and the family's acts)
import { FM_ROOM_OBST, FM_ROOM_PARTY } from "./formentera-rooms-layout.js";

const FRIENDS = ["hana", "theo", "farid", "mei", "bo", "tomi", "posy"];
const famSpots = per => Object.fromEntries(FRIENDS.map((id, i) => [id, Object.fromEntries(Object.entries(per).map(([sc, pts]) => [sc, [pts[i % pts.length], pts[(i + 3) % pts.length]]]))]));

// The seasons, on the real calendar (the art and the game both read these):
//   flamingos on the salt flats September to April; the La Mola hippy market on Wednesdays and Sundays, May to
//   October; the salt harvest (white pyramids on pink pans) July to September, the pans flooded and silvery the rest
//   of the year; summer (June to September) a busier beach; winter (December to February) quieter, greener, the fig
//   trees bare.
const monthOf = day => +String(day).slice(5, 7);
const weekdayOf = day => new Date(String(day).slice(0, 10) + "T00:00:00Z").getUTCDay();   // 0 Sunday to 6 Saturday
export function fmSeason(day){
  const m = monthOf(day);
  return m === 12 || m <= 2 ? "winter" : m <= 5 ? "spring" : m <= 9 ? "summer" : "autumn";
}
export const flamingosOn = day => { const m = monthOf(day); return m >= 9 || m <= 4; };
export const marketOn = day => { const m = monthOf(day), w = weekdayOf(day); return m >= 5 && m <= 10 && (w === 3 || w === 0); };
export const saltOn = day => { const m = monthOf(day); return m >= 7 && m <= 9; };

// what the boat panel says is on the island in a given month (1 to 12)
const seesMonth = m => m === 12 || m <= 2 ? "Quiet green winter: the fields green after the rain, the fig trees bare on their crutches, the beaches empty and the flamingos wading in the flooded salt pans. Bring a jumper for the boat."
  : m <= 4 ? "Spring: wildflowers along the dry-stone walls, the flamingos still on the salt flats, the water clear and cold, and the bike lanes nearly empty."
  : m === 5 ? "Early summer: the hippy market up at La Mola opens again on Wednesdays and Sundays, the sea warming up, and the fig trees in new leaf."
  : m === 6 ? "Summer: turquoise water at Ses Illetes, bikes everywhere, the hippy market at La Mola on Wednesdays and Sundays, and long light evenings."
  : m <= 8 ? "High summer: the salt harvest on the flats, white pyramids on pink pans, the beach at its busiest and the water like glass. The hippy market on Wednesdays and Sundays."
  : m === 9 ? "Late summer: the last of the salt harvest, the first flamingos back on the salt flats, figs ripe on the trees and the sea at its warmest."
  : m === 10 ? "Autumn: the flamingos back on the salt flats, the hippy market's last Wednesdays and Sundays of the year, and the beaches quiet and golden."
  : "Late autumn: the flamingos on the flooded salt pans, the first rain turning the fields green, and the whole island to yourselves.";

export const FM_TOWNS = {
  formentera: {
    n: "Formentera", by: "boat", fare: 0, free: [], outFrom: 8*60, outTo: 14*60, backTo: 19*60,   // (by your own boat there are no hours: trips.js timeToGo)
    screens: ["fm_illetes", "fm_village", "fm_salines", "fm_mola"], arrive: ["fm_illetes", [190, 470]], station: "fmboat", music: "formentera",
    boat: {fuel: 28, max: 7, pier: "fmboat", arrive: ["fm_illetes", [190, 470]], sight: "formentera",
      blurb: "A sail south to Formentera, the quietest of the Balearic islands: the long white spit of Ses Illetes with turquoise water on both sides, salt flats with flamingos, the whitewashed village of Sant Francesc, and La Mola's red cliffs and lighthouse. Everyone goes by bike.",
      arriveLine: "Formentera! You glide in over water so clear the boat's shadow follows you along the sandy bottom, and tie up at La Savina's little quay. White walls, blue shutters, a row of bicycles, and the long white spit of Ses Illetes running off into the turquoise.",
      sees: seesMonth},
    blurb: "The quietest of the Balearics: a long white sand spit with turquoise water both sides, pink salt flats with flamingos, the whitewashed village of Sant Francesc and its fortress church, and La Mola's lighthouse on the red cliffs. Flat, white and turquoise, and everyone on a bike.",
    arriveLine: "Formentera! Warm salty air, the smell of pine and sun cream, bicycles ticking past on the quay, and water so clear you can count the pebbles on the bottom of La Savina harbour.",
    hints: {
      fm_illetes: "Ses Illetes and La Savina: your boat at the quay in La Savina's little harbour, the harbour light, the long white spit with turquoise water both sides, Marina's chiringuito, the rock pools and the dune boardwalk. North: along the boardwalk to the salt flats. East: the road to Sant Francesc.",
      fm_salines: "The salt flats: the salt pans in their grid, the flamingo pool, the stone salt works and the old salt windmill. South: the boardwalk back to Ses Illetes. East: the Green Route up to La Mola.",
      fm_village: "Sant Francesc: the white fortress church and its square, Margalida's bakery, Joan's bike hire, the fig tree on its crutches and the signpost to Cap de Barbaria. West: the road back to La Savina and Ses Illetes. North: the old road up to La Mola.",
      fm_mola: "La Mola: the red cliffs and the sea, the lighthouse on the edge of the world, the pines, the hippy market on Wednesdays and Sundays in summer, and the old flour windmill. West: the Green Route down to the salt flats. South: the old road down to Sant Francesc."},
    spots: famSpots({
      fm_illetes: [[240, 300], [380, 300], [300, 280], [160, 300], [420, 470], [200, 270], [340, 400], [300, 460]],
      fm_salines: [[210, 300], [300, 300], [400, 440], [200, 360], [330, 360], [260, 300], [180, 450], [280, 470]],
      fm_village: [[240, 290], [320, 320], [210, 520], [200, 270], [280, 380], [260, 450], [330, 540], [300, 470]],
      fm_mola: [[330, 400], [250, 170], [300, 380], [170, 170], [230, 360], [180, 420], [260, 300], [200, 300]]}),
    // what your friends do here, and nowhere else: Mei trying on sandals at the La Mola market, Tomi on a hire bike
    // ringing the bell, Farid picking figs off the propped-up tree, Theo watching the flamingos through binoculars, Bo
    // building a stone stack on the beach, Hana with her snorkel mask pushed up, and Posy on the turquoise shore
    acts: {
      mei: {fm_mola: {act: "sandals", at: [320, 384]}},
      tomi: {fm_village: {act: "bikebell", at: [300, 462]}},
      farid: {fm_village: {act: "figpick", at: [232, 540], dir: -1}},
      theo: {fm_salines: {act: "flamingos", at: [204, 420], dir: -1}},
      bo: {fm_illetes: {act: "stonestack", at: [300, 304]}},
      hana: {fm_illetes: {act: "maskup", at: [218, 290]}},
      posy: {fm_illetes: {act: "shorepose", at: [384, 420], dir: -1}}
    },
    // round 233: five rooms (the chiringuito, the salt works shop, the bakery, La Mola lighthouse, the bike hire)
    rooms: {
      fm_bar: {door: "fmchiringuito", n: "The chiringuito", music: "fm_bar", party: FM_ROOM_PARTY.fm_bar,
        say: "The chiringuito: a palm-thatch roof, driftwood tables in the sand, grilled fish, cold juices, and the turquoise water right there."},
      fm_salt: {door: "fmsaltworks", n: "The salt works shop", music: "fm_salt", party: FM_ROOM_PARTY.fm_salt,
        say: "The salt works shop: a cool old stone store with sacks and jars of salt, a long rake on the wall and photos of the salt workers."},
      fm_bakery: {door: "fmbakery", n: "Margalida's bakery", music: "fm_bakery", party: FM_ROOM_PARTY.fm_bakery,
        say: "Margalida's bakery: a blue-and-white tiled counter, a wood oven, trays of flaó and the smell of anise and mint."},
      fm_light: {door: "fmlighthouse", n: "La Mola lighthouse", music: "fm_light", party: FM_ROOM_PARTY.fm_light,
        say: "Inside La Mola lighthouse: a spiral stair, the keeper's desk and logbook, and a window full of nothing but sea."},
      fm_bikes: {door: "fmbikes", n: "Joan's bikes", music: "fm_bikes", party: FM_ROOM_PARTY.fm_bikes,
        say: "Joan's bike hire: rows of bikes with baskets, helmets on pegs and a big map of the Green Routes."}
    },
    lines: {
      hana: ["Look at the colour of that water. If I painted it nobody would believe me. I'm not getting out until lunch.", "I put my head under and there were fish everywhere, and the seagrass waving like a lawn in the wind.", "Grilled fish with my feet in the sand. I've decided this is how I'm having all my lunches now."],
      theo: ["The water's this clear because of the seagrass, posidonia. The meadows out there are thousands of years old, some of the oldest living things on earth.", "That church was built like a fortress, thick walls and hardly a window, because pirates used to raid the island. The bell rang to send everyone running inside.", "Jules Verne wrote about this lighthouse. In one of his books a comet carries off a piece of the earth, and La Mola is the last bit of land they see."],
      farid: ["The bakery does fig bread AND almond biscuits AND a cheesecake with mint in it. I'm going to need a bigger basket on my bike.", "Salt from the sea, dried by the sun. No factory. I'm taking a big jar home for the kitchen.", "This flaó has mint and cheese inside. Strange idea. I'll need a second slice to decide."],
      mei: ["Leather sandals made right here by the man on the stall. I'm trying on every pair, so get comfortable.", "Everything is white and blue and smells of pine. Why don't we all live somewhere like this?", "A fig tree with walking sticks. Very clever. I approve."],
      bo: ["Pink birds on one leg. Flamingos. They eat tiny shrimp, that's why they're pink. I looked it up.", "Flat island, everyone on a bicycle. Good. No hills to push up.", "I'm building a stone stack on the beach. Seven stones so far. Don't breathe near it."],
      tomi: ["Joan says the Green Route goes right across the island. I've done three of them already. Well, one. Mostly downhill.", "I'm ringing my bell at every lizard I pass. They don't care. I do it anyway.", "The lighthouse man says on a clear night you can see the beam from Ibiza. Right across the sea."],
      posy: ["The houses are so white it hurts my eyes, and then a blue shutter. And then a green one. I'm writing it all down.", "The woman on the jewellery stall came here on the ferry in 1972 for a week. She never left. I completely understand.", "The salt pans are pink. Actually pink. Like someone spilled rosé across the whole flat."]
    },
    say: {
      fmboat: "Your boat, tied up at La Savina's little quay, the water under it so clear the hull seems to float in the air. Sail home whenever you're ready.",
      fmchiringuito: "Marina's chiringuito: a little beach bar with a palm-thatch roof, driftwood stools in the sand, lanterns in the rafters and fish on the grill. The sea is about ten steps from the bar.",
      fmsnorkel: "The clear water off the spit: pale sand, then dark meadows of posidonia seagrass waving underneath. The seagrass keeps the water clean, which is why it's this turquoise. Fish everywhere.",
      fmdunes: "The dune boardwalk: a raised wooden path over the dunes, so nobody tramples the sea lilies and the juniper that hold the sand together. It runs north to the salt flats.",
      fmcrabs: "The rock pools at the end of the beach: warm shallow water in the hollows of the rocks, little green crabs scuttling sideways, sea anemones and the odd tiny fish.",
      fmharbourlight: "The little harbour light at the end of La Savina's breakwater: a white tower with a green lantern, blinking the boats in and out. A lighthouse to stamp in your book.",
      fmsaltworks: "The salt works: an old stone salt store with a heavy wooden door, sacks of salt stacked outside and a rusty rake leaning by the step. Inside, jars of flor de sal and herb salts.",
      fmpans: "The salt pans: a grid of shallow pools where the sea water slowly dries in the sun. In summer the water turns pink and the salt is raked into white pyramids; the rest of the year they lie flooded and silvery.",
      fmflamingos: "The flamingo pool: from September to April the flamingos come to wade in the salty water, upside-down heads sweeping for tiny pink shrimp. In summer they've flown off and the pool is quiet.",
      fmwindmill: "The old salt windmill: a round white tower with wooden sails, built to pump sea water between the pans. The sails haven't turned for years, but it still stands guard over the flats.",
      fmbakery: "Margalida's bakery: a white house with a green door and a wooden sign, the smell of almonds and warm bread drifting out into the square. Flaó tarts, fig bread and ensaïmadas.",
      fmbikes: "Joan's bike hire: a whitewashed shop with a row of bicycles outside, baskets on the front, helmets on hooks. The whole island is only twenty kilometres long, and almost all of it is flat.",
      fmchurch: "The church of Sant Francesc Xavier: built in the 1700s like a little fortress, with walls thick enough to stop a cannonball and hardly any windows, because pirates raided the island. Cool and quiet inside.",
      fmfig: "The fig tree on its crutches: its branches spread so wide they're propped up on a ring of juniper poles, so the shade covers the ground like a tent. Bare in winter, sweet figs at the end of summer.",
      fmbarbaria: "The signpost to Cap de Barbaria: a dusty track across the flat stony scrub to the lighthouse at the island's southern tip. Nothing out there but lizards, wild thyme and the sea. A lighthouse to stamp.",
      fmlighthouse: "La Mola lighthouse: a tall pale stone tower on the edge of the red cliffs, looking out over nothing but sea. Jules Verne wrote about it, and a little plaque by the door remembers him.",
      fmmarket: "The hippy market at El Pilar de La Mola: stalls under the pines of jewellery, leather sandals, dreamcatchers and woven baskets, someone playing guitar. Wednesdays and Sundays, May to October.",
      fmcliffs: "The red cliffs of La Mola: a sheer drop to the deep blue sea, swifts wheeling below you and the whole island stretched out flat behind. The wall at the edge is the only thing between you and Africa.",
      fmwindmill2: "The old flour windmill: a stout white tower with a wooden cap and six sails, where the farmers of La Mola once brought their wheat to be ground. The oldest windmill on the island."
    }
  }
};

// Places on the four screens. bridge: a gate to another screen.
export const FM_PLACES = {
  // Ses Illetes and La Savina: your boat at the quay, the harbour light, the spit, the chiringuito, the rock pools, the dunes
  fmboat: {scene: "fm_illetes", name: "Your boat", door: [130, 500], spot: true, mark: [70, 560], line: "Your boat at La Savina's quay. Sail home whenever you're ready."},
  fmchiringuito: {scene: "fm_illetes", name: "Marina's chiringuito", door: [334, 252], spot: true, mark: [334, 160], line: "Marina's chiringuito."},
  fmsnorkel: {scene: "fm_illetes", name: "The clear water", door: [206, 252], spot: true, mark: [210, 150], line: "The clear water over the seagrass."},
  fmdunes: {scene: "fm_illetes", name: "The dune boardwalk", door: [452, 150], spot: true, mark: [360, 70], line: "The dune boardwalk."},
  fmcrabs: {scene: "fm_illetes", name: "The rock pools", door: [126, 326], spot: true, mark: [78, 300], line: "The rock pools and their little crabs."},
  fmharbourlight: {scene: "fm_illetes", name: "The harbour light", door: [272, 556], spot: true, mark: [229, 600], line: "The little harbour light."},
  fmToSalines: {scene: "fm_illetes", name: "The dune boardwalk", door: [452, 40], spot: true, bridge: "fm_salines", mark: [452, 90], line: "North along the boardwalk to the salt flats."},
  fmToVillage: {scene: "fm_illetes", name: "The road to Sant Francesc", door: [500, 436], spot: true, bridge: "fm_village", mark: [450, 420], line: "East along the road to Sant Francesc."},
  // the salt flats: the pans, the flamingo pool, the salt works, the salt windmill
  fmsaltworks: {scene: "fm_salines", name: "The salt works", door: [430, 408], spot: true, mark: [430, 310], line: "The salt works shop."},
  fmpans: {scene: "fm_salines", name: "The salt pans", door: [250, 268], spot: true, mark: [250, 150], line: "The salt pans."},
  fmflamingos: {scene: "fm_salines", name: "The flamingo pool", door: [172, 380], spot: true, mark: [80, 360], line: "The flamingo pool."},
  fmwindmill: {scene: "fm_salines", name: "The salt windmill", door: [152, 560], spot: true, mark: [70, 500], line: "The old salt windmill."},
  fmToIlletes: {scene: "fm_salines", name: "The dune boardwalk", door: [260, 612], spot: true, bridge: "fm_illetes", mark: [200, 600], line: "South along the boardwalk to Ses Illetes."},
  fmToMola: {scene: "fm_salines", name: "The Green Route", door: [500, 470], spot: true, bridge: "fm_mola", mark: [450, 456], line: "East along the Green Route to La Mola."},
  // Sant Francesc: the bakery, the bike hire, the church, the fig tree, the Cap de Barbaria signpost
  fmbakery: {scene: "fm_village", name: "Margalida's bakery", door: [84, 368], spot: true, mark: [84, 280], line: "Margalida's bakery."},
  fmbikes: {scene: "fm_village", name: "Joan's bike hire", door: [470, 426], spot: true, mark: [440, 330], line: "Joan's bike hire."},
  fmchurch: {scene: "fm_village", name: "The fortress church", door: [366, 240], spot: true, mark: [366, 130], line: "The fortress church of Sant Francesc."},
  fmfig: {scene: "fm_village", name: "The fig tree", door: [196, 534], spot: true, mark: [96, 520], line: "The fig tree on its crutches."},
  fmbarbaria: {scene: "fm_village", name: "The road to Cap de Barbaria", door: [404, 540], spot: true, mark: [470, 560], line: "The signpost to Cap de Barbaria."},
  fmToIlletesW: {scene: "fm_village", name: "The road to La Savina", door: [20, 440], spot: true, bridge: "fm_illetes", mark: [70, 430], line: "West along the road to La Savina and Ses Illetes."},
  fmToMolaN: {scene: "fm_village", name: "The old road", door: [206, 40], spot: true, bridge: "fm_mola", mark: [206, 90], line: "North up the old road to La Mola."},
  // La Mola: the lighthouse, the market, the cliffs, the flour windmill
  fmlighthouse: {scene: "fm_mola", name: "La Mola lighthouse", door: [412, 228], spot: true, mark: [412, 130], line: "La Mola lighthouse."},
  fmmarket: {scene: "fm_mola", name: "The hippy market", door: [360, 356], spot: true, mark: [380, 290], line: "The hippy market among the pines."},
  fmcliffs: {scene: "fm_mola", name: "The red cliffs", door: [200, 128], spot: true, mark: [200, 60], line: "The red cliffs and the view."},
  fmwindmill2: {scene: "fm_mola", name: "The flour windmill", door: [352, 566], spot: true, mark: [440, 520], line: "The old flour windmill."},
  fmToSalinesW: {scene: "fm_mola", name: "The Green Route", door: [20, 396], spot: true, bridge: "fm_salines", mark: [70, 396], line: "West along the Green Route to the salt flats."},
  fmToVillageS: {scene: "fm_mola", name: "The old road", door: [240, 612], spot: true, bridge: "fm_village", mark: [180, 600], line: "South down the old road to Sant Francesc."}
};
// the rooms: the place each room's door is on, for the Exit
Object.assign(FM_PLACES, {fm_bar: {scene: "fm_illetes", name: "Marina's chiringuito", door: [334, 252]}, fm_salt: {scene: "fm_salines", name: "The salt works", door: [430, 408]},
  fm_bakery: {scene: "fm_village", name: "Margalida's bakery", door: [84, 368]}, fm_bikes: {scene: "fm_village", name: "Joan's bike hire", door: [470, 426]},
  fm_light: {scene: "fm_mola", name: "La Mola lighthouse", door: [412, 228]}});
export const FM_BRIDGES = {
  fm_illetes: {fm_salines: "fmToSalines", fm_village: "fmToVillage"}, fm_salines: {fm_illetes: "fmToIlletes", fm_mola: "fmToMola"},
  fm_village: {fm_illetes: "fmToIlletesW", fm_mola: "fmToMolaN"}, fm_mola: {fm_salines: "fmToSalinesW", fm_village: "fmToVillageS"}
};
export const FM_ARRIVE = {
  "fm_illetes>fm_salines": [260, 580], "fm_salines>fm_illetes": [452, 84], "fm_illetes>fm_village": [50, 440], "fm_village>fm_illetes": [470, 436],
  "fm_salines>fm_mola": [50, 396], "fm_mola>fm_salines": [470, 470], "fm_mola>fm_village": [206, 80], "fm_village>fm_mola": [240, 580]
};
// walkable bounds [x1, y1, x2, y2] and obstacles (sea, salt pans, buildings, trees, walls)
export const FM_BOUNDS = {
  fm_illetes: [14, 26, 506, 616], fm_salines: [14, 26, 506, 616], fm_village: [14, 26, 506, 616], fm_mola: [14, 26, 506, 616],
  fm_bar: [30, 250, 490, 600], fm_salt: [30, 250, 490, 600], fm_bakery: [30, 250, 490, 600], fm_bikes: [30, 250, 490, 600], fm_light: [30, 250, 490, 600]
};
export const FM_OBST = {
  // the sea west of the spit, the sea east of it, the water round its tip, the dunes either side of the boardwalk, the
  // chiringuito and its deck, the shallows down the west beach, the rock pools, La Savina harbour, the breakwater and
  // its light, the La Savina houses in the bottom-right corner, the junipers along the east edge
  fm_illetes: [[0, 0, 100, 236], [170, 0, 250, 236], [100, 0, 170, 40], [250, 0, 424, 128], [480, 0, 520, 172], [262, 128, 404, 236],
    [0, 236, 46, 516], [46, 284, 108, 340], [0, 520, 214, 640], [214, 512, 244, 640], [300, 562, 520, 640], [474, 186, 520, 392]],
  // the salt pans across the top, the flamingo pool, the salt windmill, the salt works, the pines and salt carts in
  // the bottom-right corner
  fm_salines: [[0, 0, 520, 250], [0, 250, 150, 468], [0, 478, 130, 640], [350, 284, 520, 392], [360, 528, 520, 640]],
  // the houses top left, the church, the trees top right, the bakery, the bike hire and its bikes, the fig tree and
  // its crutches, the dry-stone wall along the bottom, the Barbaria signpost, the wall and juniper in the corner
  fm_village: [[0, 0, 160, 206], [262, 0, 474, 222], [474, 0, 520, 250], [0, 236, 150, 352], [356, 292, 520, 410], [0, 480, 176, 640],
    [176, 604, 520, 640], [432, 498, 450, 526], [470, 470, 520, 604]],
  // the sea and the cliff along the top, the cliff down the east edge, the lighthouse, the pines on the west, the
  // market grove, the pines bottom left, the windmill, the scrub along the bottom
  fm_mola: [[0, 0, 520, 108], [480, 108, 520, 500], [356, 100, 470, 212], [0, 108, 96, 352], [290, 262, 480, 338], [424, 338, 480, 470],
    [0, 440, 110, 640], [372, 500, 520, 640], [110, 598, 196, 640], [290, 598, 372, 640]],
  ...FM_ROOM_OBST
};
export const FM_NAMES = {fm_illetes: "Formentera: Ses Illetes", fm_salines: "Formentera: the salt flats", fm_village: "Formentera: Sant Francesc", fm_mola: "Formentera: La Mola"};
