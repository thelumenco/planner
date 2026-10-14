// Portovenere (boat towns, round 210): the town at the end of the Ligurian coast, a longer sail past Cinque Terre to the
// mouth of the Gulf of Poets. A wall of tall narrow tower-houses along the harbour, the castle above, the striped church
// of San Pietro out on the point, and Palmaria island just across a narrow strait.
//   pv_castle  (Castle Doria) | pv_point   (San Pietro Point)
//   pv_borgo   (The Borgo)    | pv_harbour (The Harbour *)
// You arrive in the harbour (bottom right), where your boat ties up at the quay. A ring: the harbour and the Borgo are
// joined through the old town gate; the harbour and the point by the path along the rocks; the Borgo and the castle by
// the steep steps; the castle and the point by the path along the walls down to the church.
// Rooms: the mussel co-op and the bar on the quay; the marble bottega, the Poets' bookshop and the shell shop in the
// Borgo; San Pietro on the point.
// (rounds 211 to 213: the rooms, the people and the family's acts, filled in below)
import { PV_ROOM_OBST, PV_ROOM_PARTY } from "./porto-rooms-layout.js";

export const PV_TOWNS = {
  porto: {
    n: "Portovenere", by: "boat", fare: 0, free: ["evan"], outFrom: 8*60, outTo: 14*60, backTo: 19*60,   // (trips.js BOAT_HOME: by boat, home before dark)
    screens: ["pv_harbour", "pv_borgo", "pv_castle", "pv_point"], arrive: ["pv_harbour", [300, 560]], station: "pvboat", music: "porto",
    boat: {fuel: 24, pier: "pvboat", arrive: ["pv_harbour", [300, 560]], sight: "porto",
      blurb: "The long sail south, past Cinque Terre to the very end of the coast: a wall of tall painted houses along the harbour, a castle on top, and a striped church out on the rocks. Pack a picnic for the crossing.",
      arriveLine: "Portovenere! You slip through the narrow strait between the town and Palmaria and tie up at the quay, right under a wall of tall painted houses six storeys high. Mussel floats bob in rows out on the water."},
    blurb: "A fortress of a fishing town at the mouth of the Gulf of Poets: tall painted tower-houses, a castle, a striped church on the rocks, and mussels.",
    arriveLine: "Portovenere! A wall of tall painted houses shoulder to shoulder along the water, and a castle keeping watch on top.",
    evanArrive: ["Mama, the houses are SO TALL!", "a castle! a real one!", "kitties! on the step!"],
    evanScreen: {pv_harbour: ["kitty kitty kitty", "black balls in the water!"], pv_borgo: ["a big door in the wall!", "shells! on the door!"], pv_castle: ["a castle! I'm the king!", "birdies going round and round"], pv_point: ["a stripy church!", "a cave in the sea!"]},
    hints: {
      pv_harbour: "The harbour: your boat at the quay, the wall of tower-houses, the mussel co-op, Bar Tonio, the harbour cats, and Palmaria across the strait. West: through the old gate into the Borgo. North: along the rocks to San Pietro.",
      pv_borgo: "The Borgo: the town gate of 1113, Via Capellini, the marble bottega, the Poets' bookshop, the seashell shop and the nonnas' bench. East: out through the gate to the harbour. North: the steep steps up to the castle.",
      pv_castle: "Castle Doria: the ramparts and the keep, the fig and olive slope, and the widest view over the Gulf of Poets. South: down the steps to the Borgo. East: along the walls down to San Pietro.",
      pv_point: "San Pietro Point: the striped church on its rock, the steps down to Byron's Grotto, the flat swimming rocks and the poets' bench. South: along the rocks to the harbour. West: up along the walls to the castle."},
    spots: {
      mum: {pv_harbour: [[220, 380], [300, 470]], pv_borgo: [[200, 300], [380, 360]], pv_castle: [[260, 330], [180, 380]], pv_point: [[380, 440], [300, 400]]},
      dad: {pv_harbour: [[250, 300], [180, 520]], pv_borgo: [[300, 300], [180, 420]], pv_castle: [[150, 260], [300, 300]], pv_point: [[260, 330], [220, 480]]},
      mama: {pv_harbour: [[160, 380], [230, 440]], pv_borgo: [[290, 556], [240, 500]], pv_castle: [[320, 420], [200, 480]], pv_point: [[320, 300], [200, 560]]},
      gonggong: {pv_harbour: [[380, 300], [390, 310]], pv_borgo: [[360, 500], [370, 510]], pv_castle: [[400, 330], [410, 340]], pv_point: [[300, 470], [310, 480]]},
      darren: {pv_harbour: [[340, 420], [140, 540]], pv_borgo: [[256, 120], [400, 300]], pv_castle: [[350, 380], [240, 520]], pv_point: [[420, 520], [340, 360]]},
      marcus: {pv_harbour: [[280, 380], [200, 560]], pv_borgo: [[180, 340], [330, 470]], pv_castle: [[300, 480], [120, 300]], pv_point: [[120, 320], [280, 560]]},
      angelina: {pv_harbour: [[330, 340], [260, 520]], pv_borgo: [[220, 480], [380, 420]], pv_castle: [[420, 420], [180, 560]], pv_point: [[200, 440], [360, 300]]}
    },
    // what the family do (round 213; nothing they've done in any earlier town): Mum swims off the flat rocks, Dad
    // explores the ramparts with his red guidebook, Ma Ma ties on a headscarf and gossips with the nonnas, Gong Gong
    // watches the mussel boats come in with his hands behind his back, Darren jumps off the rocks, Marcus snorkels at
    // Byron's Grotto, Angellina writes a poem on the poets' bench. (Evan's thing is the harbour cats, core.js.)
    acts: {
      mum: {pv_point: {act: "swim", at: [420, 500], dir: -1}},
      dad: {pv_castle: {act: "rampart", at: [236, 262]}},
      mama: {pv_borgo: {act: "gossip", at: [352, 560], dir: -1}},
      gonggong: {pv_harbour: {act: "boatwatch", at: [262, 540]}},
      darren: {pv_point: {act: "rockjump", at: [380, 470]}},
      marcus: {pv_point: {act: "snorkel", at: [126, 318]}},
      angelina: {pv_point: {act: "verse", at: [196, 424], dir: -1}}
    },
    // round 211: six rooms behind the doors on the quay, in the Borgo and on the point
    rooms: {
      pv_mussels: {door: "pvmussels", n: "The mussel co-op", music: "pv_mussels", party: PV_ROOM_PARTY.pv_mussels,
        say: "The mussel co-op: crates of shining black mussels, ropes drying from the beams, and the smell of the sea."},
      pv_bar: {door: "pvbar", n: "The bar on the quay", music: "pv_bar", party: PV_ROOM_PARTY.pv_bar,
        say: "The bar on the quay: a zinc counter, a coffee machine hissing, and tables right by the open doors over the water."},
      pv_bottega: {door: "pvbottega", n: "Ilario's bottega", music: "pv_bottega", party: PV_ROOM_PARTY.pv_bottega,
        say: "Ilario's bottega: marble dust in the sunbeams, shelves of black stone veined with gold, and something big under a dust sheet."},
      pv_books: {door: "pvbooks", n: "The Poets' bookshop", music: "pv_books", party: PV_ROOM_PARTY.pv_books,
        say: "The Poets' bookshop: shelves to the ceiling, a ladder on wheels, Byron's portrait, and the great old visitors' book on its stand."},
      pv_shells: {door: "pvshells", n: "Signora Lia's shells", music: "pv_shells", party: PV_ROOM_PARTY.pv_shells,
        say: "Signora Lia's shell shop: mobiles turning overhead, shells on every surface, and a whole wall of them in swirls and stars."},
      pv_church: {door: "pvchurch", n: "San Pietro", music: "pv_church", party: PV_ROOM_PARTY.pv_church,
        say: "San Pietro: stripes of black and white stone, cool air, candles, and a window full of sea."}
    },
    lines: {
      mum: ["Six storeys and not a lift between them. Those nonnas must have legs of iron.", "I'm swimming off those rocks. The water's that green you only see in paintings.", "Mussels for lunch. With bread for the sauce. Non-negotiable."],
      dad: ["The houses were built as a wall on purpose. Pirates came by sea, so the town turned its back to them.", "That church on the point was a temple to Venus once. Porto Venere. Venus's port. There you go.", "Byron swam from here all the way across to Lerici. I'm going to paddle to that buoy. Same thing, really."],
      mama: ["Mussels this fat! Ma Ma wants to buy the whole rope.", "The cats here have the best seats in town. Ma Ma would like to be a cat here.", "Black marble with gold in it. Very rich-looking. Ma Ma approves."],
      gonggong: ["The mussel boats go out early. Hard work. Gong Gong respects.", "Good castle. Thick walls. Nobody getting in there.", "Gong Gong will sit by the water and watch the boats come through the strait. Best show in town."],
      darren: ["I'm going up to the castle the steep way. Is there another way? Doesn't matter. Steep way.", "Those rocks are perfect for jumping. I've checked the depth. Twice.", "Mel, the bar does a focaccia with mussels on it. I'm just saying."],
      marcus: ["Zeh, the island's RIGHT there. I could swim it. Probably. Ask me later.", "There's a cave Byron used to swim to. I'm getting a mask and going to find it.", "Those birds hanging their wings out like washing. Cormorants. I looked it up."],
      angelina: ["A bookshop named after the poets. I might actually live here now.", "The church is striped like a humbug. In the most beautiful way.", "Shelley and Byron sat looking at this exact view. I'm writing something. Don't look."],
      evan: ["kitty! another kitty!", "the castle is SO big", "boats with black balls"]
    },
    say: {
      pvboat: "Your boat, tied up at the quay under the tall painted houses. Sail home whenever you're ready, before dark.",
      pvwall: "The palazzata: tall narrow tower-houses six storeys high, red and ochre and yellow and salmon, packed shoulder to shoulder along the water like a fortress wall. Green shutters, and washing at the top windows.",
      pvmussels: "The mussel co-op: a blue door, crates stacked outside, and a smell of rope and sea. The mussels come straight off the farm out in the strait.",
      pvbar: "Bar Tonio: a green awning, two little tables on the quay, and the clink of tiny cups. The best seat in town is the one facing the boats.",
      pvpalmaria: "Palmaria, just across the strait: pines and grey cliffs, close enough to call across to. The water in between is deep green and very still.",
      pvcats: "The harbour cats on their sunny step: a ginger one curled up asleep, a tabby keeping watch, and a black one waiting outside the co-op, just in case.",
      pvgate: "The old town gate, a stone arch in the walls with a tower over it. Carved above: COLONIA IANUENSIS 1113. Genoa built these walls nine hundred years ago.",
      pvlane: "Via Capellini: the narrow lane between the tall houses, so deep the sun only reaches the bottom at midday. Washing overhead, cats underfoot.",
      pvbottega: "The marble bottega: a doorway framed in black portoro marble, veined with gold. Fine pale dust on the step.",
      pvbooks: "The Poets' bookshop: a little cart of books outside and a sign with a quill on it. Byron and Shelley both loved this gulf.",
      pvshells: "Signora Lia's seashell shop: garlands of shells round the door and a shell mobile turning in the breeze.",
      pvnonnas: "The nonnas' bench: green, in the shade, with cushions brought from home and a basket of beans to shell. Nothing happens in the Borgo that this bench doesn't hear about.",
      pvcastle: "Castle Doria: grey stone walls and a square keep with the Genoese flag on top. Swifts scream round and round it all summer.",
      pvfigs: "The fig and olive slope: little dry stone terraces below the castle, silvery olives and one huge old fig tree.",
      pvgulfview: "The widest view in Portovenere: the whole Gulf of Poets, Lerici's castle on the far side, and sails all the way out.",
      pvchurch: "San Pietro: a church of black and white stripes standing on the bare rock at the very end of the point, with the sea on three sides.",
      pvgrotto: "Steps cut down the rock to Byron's Grotto, a sea cave where the waves boom in and out. Byron swam from here to Lerici in 1822.",
      pvrocks: "The flat swimming rocks: warm grey slabs sloping straight down into deep clear green water, and a little ladder to climb out.",
      pvbench: "The poets' bench: plain stone, warm from the sun, looking out over the open sea. A little brass plaque for the poets who sat here."
    }
  }
};

// Places on the four screens. bridge: a gate to another screen.
export const PV_PLACES = {
  // the harbour: your boat, the palazzata, the mussel co-op, the bar, Palmaria, the cats
  pvboat: {scene: "pv_harbour", name: "Your boat", door: [330, 578], spot: true, mark: [340, 610], line: "Your boat at the quay. Sail home before dark."},
  pvwall: {scene: "pv_harbour", name: "The palazzata", door: [196, 300], spot: true, mark: [196, 110], line: "The wall of tower-houses."},
  pvmussels: {scene: "pv_harbour", name: "The mussel co-op", door: [150, 232], spot: true, mark: [150, 150], line: "The mussel co-op."},
  pvbar: {scene: "pv_harbour", name: "Bar Tonio", door: [276, 232], spot: true, mark: [276, 150], line: "Bar Tonio, on the quay."},
  pvpalmaria: {scene: "pv_harbour", name: "The view to Palmaria", door: [392, 330], spot: true, mark: [496, 260], line: "Palmaria, across the strait."},
  pvcats: {scene: "pv_harbour", name: "The harbour cats", door: [150, 456], spot: true, mark: [116, 430], line: "The harbour cats on their step."},
  pvToBorgo: {scene: "pv_harbour", name: "Into the Borgo", door: [20, 526], spot: true, bridge: "pv_borgo", mark: [70, 500], line: "West through the old gate into the Borgo."},
  pvToPoint: {scene: "pv_harbour", name: "Along the rocks", door: [398, 40], spot: true, bridge: "pv_point", mark: [398, 90], line: "North along the rocks to San Pietro."},
  // the Borgo: the gate, the lane, the bottega, the bookshop, the shell shop, the bench
  pvgate: {scene: "pv_borgo", name: "The town gate", door: [420, 432], spot: true, mark: [484, 330], line: "The town gate of 1113."},
  pvlane: {scene: "pv_borgo", name: "Via Capellini", door: [250, 340], spot: true, mark: [250, 290], line: "Via Capellini."},
  pvbottega: {scene: "pv_borgo", name: "The marble bottega", door: [130, 232], spot: true, mark: [130, 150], line: "Ilario's marble bottega."},
  pvbooks: {scene: "pv_borgo", name: "The Poets' bookshop", door: [356, 232], spot: true, mark: [356, 150], line: "The Poets' bookshop."},
  pvshells: {scene: "pv_borgo", name: "The seashell shop", door: [61, 490], spot: true, mark: [61, 400], line: "Signora Lia's seashell shop."},
  pvnonnas: {scene: "pv_borgo", name: "The nonnas' bench", door: [320, 566], spot: true, mark: [320, 600], line: "The nonnas' bench."},
  pvToHarbour: {scene: "pv_borgo", name: "Out to the harbour", door: [500, 432], spot: true, bridge: "pv_harbour", mark: [470, 500], line: "East out through the gate to the harbour."},
  pvToCastle: {scene: "pv_borgo", name: "Up the steps", door: [256, 40], spot: true, bridge: "pv_castle", mark: [256, 100], line: "North up the steep steps to the castle."},
  // the castle: the ramparts, the fig and olive slope, the gulf
  pvcastle: {scene: "pv_castle", name: "Castle Doria", door: [196, 250], spot: true, mark: [196, 120], line: "The castle ramparts."},
  pvfigs: {scene: "pv_castle", name: "The fig and olive slope", door: [140, 456], spot: true, mark: [80, 400], line: "The fig and olive slope."},
  pvgulfview: {scene: "pv_castle", name: "The Gulf of Poets", door: [420, 306], spot: true, mark: [450, 150], line: "The view over the Gulf of Poets."},
  pvToBorgoS: {scene: "pv_castle", name: "Down the steps", door: [256, 612], spot: true, bridge: "pv_borgo", mark: [190, 600], line: "South down the steep steps to the Borgo."},
  pvToPointW: {scene: "pv_castle", name: "Along the walls", door: [500, 430], spot: true, bridge: "pv_point", mark: [450, 470], line: "East along the walls down to San Pietro."},
  // the point: the church, the grotto, the rocks, the bench
  pvchurch: {scene: "pv_point", name: "San Pietro", door: [268, 256], spot: true, mark: [268, 120], line: "The church of San Pietro."},
  pvgrotto: {scene: "pv_point", name: "Byron's Grotto", door: [100, 300], spot: true, mark: [50, 250], line: "The steps down to Byron's Grotto."},
  pvrocks: {scene: "pv_point", name: "The swimming rocks", door: [404, 480], spot: true, mark: [410, 520], line: "The flat swimming rocks."},
  pvbench: {scene: "pv_point", name: "The poets' bench", door: [176, 420], spot: true, mark: [176, 390], line: "The poets' bench."},
  pvToHarbourS: {scene: "pv_point", name: "Along the rocks", door: [330, 612], spot: true, bridge: "pv_harbour", mark: [270, 600], line: "South along the rocks to the harbour."},
  pvToCastleE: {scene: "pv_point", name: "Along the walls", door: [20, 460], spot: true, bridge: "pv_castle", mark: [70, 430], line: "West up along the walls to the castle."}
};
// the rooms: the place each room's door is on, for the Exit
Object.assign(PV_PLACES, {pv_mussels: {scene: "pv_harbour", name: "The mussel co-op", door: [150, 232]}, pv_bar: {scene: "pv_harbour", name: "Bar Tonio", door: [276, 232]},
  pv_bottega: {scene: "pv_borgo", name: "The marble bottega", door: [130, 232]}, pv_books: {scene: "pv_borgo", name: "The Poets' bookshop", door: [356, 232]},
  pv_shells: {scene: "pv_borgo", name: "The seashell shop", door: [61, 490]}, pv_church: {scene: "pv_point", name: "San Pietro", door: [268, 256]}});
export const PV_BRIDGES = {
  pv_harbour: {pv_borgo: "pvToBorgo", pv_point: "pvToPoint"}, pv_borgo: {pv_harbour: "pvToHarbour", pv_castle: "pvToCastle"},
  pv_castle: {pv_borgo: "pvToBorgoS", pv_point: "pvToPointW"}, pv_point: {pv_harbour: "pvToHarbourS", pv_castle: "pvToCastleE"}
};
export const PV_ARRIVE = {
  "pv_harbour>pv_borgo": [470, 432], "pv_borgo>pv_harbour": [50, 526], "pv_borgo>pv_castle": [256, 580], "pv_castle>pv_borgo": [256, 80],
  "pv_harbour>pv_point": [330, 580], "pv_point>pv_harbour": [398, 80], "pv_castle>pv_point": [50, 460], "pv_point>pv_castle": [470, 430]
};
// walkable bounds [x1, y1, x2, y2] and obstacles (water, buildings, rocks, trees)
export const PV_BOUNDS = {
  pv_harbour: [14, 26, 506, 600], pv_borgo: [14, 26, 506, 616], pv_castle: [14, 26, 506, 616], pv_point: [14, 26, 506, 616],
  pv_mussels: [30, 250, 490, 600], pv_bar: [30, 250, 490, 600], pv_bottega: [30, 250, 490, 600], pv_books: [30, 250, 490, 600], pv_shells: [30, 250, 490, 600], pv_church: [30, 250, 490, 600]
};
export const PV_OBST = {
  // the palazzata along the top, the rock at its east end, the houses down the west side, the strait (east and south),
  // the co-op's crates, the bar's two tables, the cats' step
  pv_harbour: [[0, 0, 356, 214], [356, 100, 380, 214], [0, 214, 98, 470], [420, 0, 520, 640], [0, 600, 520, 640], [176, 206, 206, 238], [222, 238, 244, 256], [310, 238, 332, 256], [98, 444, 132, 470]],
  // the houses either side of the steps, the town wall and its gate tower (the arch is open), the west row, the houses
  // at the bottom, the low wall behind the nonnas' bench, the book cart
  pv_borgo: [[0, 0, 220, 214], [290, 0, 456, 214], [456, 0, 520, 392], [448, 236, 520, 392], [456, 470, 520, 640], [0, 262, 122, 470], [0, 540, 184, 640], [184, 582, 456, 640], [382, 204, 412, 236]],
  // the castle, the sea below the walls, the bench at the view, the fig, the olives, the pines, the prickly pear
  pv_castle: [[10, 0, 366, 226], [366, 0, 520, 282], [434, 280, 470, 298], [56, 400, 104, 440], [28, 336, 52, 364], [138, 520, 162, 546], [48, 580, 72, 606], [414, 590, 440, 616], [474, 530, 494, 556], [326, 580, 354, 604], [12, 466, 40, 478], [482, 346, 506, 358], [106, 600, 126, 610]],
  // the sea round three sides (the cove at the top left), the church, the old walls, the pine, the prickly pear, the bench
  pv_point: [[0, 0, 520, 60], [0, 0, 136, 274], [456, 0, 520, 640], [136, 40, 392, 240], [0, 500, 44, 640], [120, 596, 148, 622], [76, 540, 104, 566], [154, 384, 198, 404], [14, 400, 42, 412], [222, 618, 242, 628]],
  ...PV_ROOM_OBST
};
export const PV_NAMES = {pv_harbour: "Portovenere: the harbour", pv_borgo: "Portovenere: the Borgo", pv_castle: "Portovenere: the castle", pv_point: "Portovenere: San Pietro"};
export const PV_EVAN = {pv_harbour: [[200, 400], [160, 480], [260, 360], [300, 540]], pv_borgo: [[260, 400], [320, 330], [200, 460], [360, 520]], pv_castle: [[240, 320], [300, 420], [200, 520], [380, 400]], pv_point: [[240, 300], [320, 420], [260, 520], [200, 360]]};
