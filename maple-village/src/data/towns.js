// Towns you can travel to for the day (round 107: Ronda, the first train town). Each town is four outdoor screens in
// a 2x2 grid, joined by its own gates (never to Honeybrook's: the only way in or out is the journey). See HANDOFF.md
// "DESTINATIONS PLAYBOOK" for the rules every town follows.
//
// Ronda: a white town on a cliff in the south of Spain, split by a gorge (El Tajo). Top row: the new town (the station
// and the Alameda gardens on the west cliff, then the plaza and market). Bottom row: the old town (La Ciudad: lanes,
// the Arab baths, the convent, the tiles) and the bridge screen (Puente Nuevo over the gorge, the viewpoint, the
// Moorish garden). The bridge joins the plaza to the bridge screen; steps down into the gorge and back up join the
// station to the old town.
//
//   rd_station | rd_plaza
//   -----------+----------   (the gorge runs between the rows)
//   rd_old     | rd_bridge

export const TOWNS = {
  ronda: {
    n: "Ronda", by: "train", fare: 40, free: ["evan"], outFrom: 7*60, outTo: 18*60, backTo: 22*60,
    screens: ["rd_station", "rd_plaza", "rd_bridge", "rd_old"], arrive: ["rd_station", [330, 200]], station: "rdtrain", music: "ronda",
    blurb: "A white town on a cliff in the south of Spain, split in two by a deep gorge. Orange trees, a bridge over the abyss, guitar in the streets.",
    // where each of the family likes to be on each screen (they follow Mel round the town and settle near these)
    spots: {
      mum: {rd_plaza: [[290, 392], [250, 400], [310, 380]], rd_station: [[200, 500], [240, 470]], rd_bridge: [[400, 300], [300, 480]], rd_old: [[260, 300], [220, 460]]},
      dad: {rd_bridge: [[452, 300], [440, 312]], rd_plaza: [[330, 280], [190, 300]], rd_station: [[130, 430], [260, 480]], rd_old: [[200, 280], [300, 480]]},
      mama: {rd_plaza: [[130, 220], [160, 230], [100, 226]], rd_station: [[240, 420], [180, 520]], rd_bridge: [[260, 470], [380, 520]], rd_old: [[400, 280], [260, 470]]},
      gonggong: {rd_plaza: [[196, 446], [204, 450]], rd_station: [[140, 400], [150, 410]], rd_bridge: [[420, 300], [240, 560]], rd_old: [[200, 470], [180, 480]]},
      darren: {rd_station: [[180, 560], [210, 556]], rd_bridge: [[380, 250], [300, 240]], rd_plaza: [[330, 560], [260, 540]], rd_old: [[120, 120], [160, 160]]},
      marcus: {rd_old: [[120, 140], [240, 300], [300, 520]], rd_bridge: [[300, 240], [460, 280]], rd_plaza: [[240, 480], [400, 330]], rd_station: [[130, 500], [330, 300]]},
      angelina: {rd_plaza: [[420, 236], [440, 246]], rd_bridge: [[300, 520], [380, 500]], rd_station: [[260, 460], [150, 520]], rd_old: [[300, 470], [420, 480]]}
    },
    // what they do at their favourite spots (some only at certain times: Mum dances while Manolo's playing, Ma Ma
    // haggles while the market's on). act: an npcs.js act (a prop, an animation)
    acts: {
      mum: {rd_plaza: {act: "dance", at: [282, 398], hours: [[11*60, 14*60], [18*60, 22*60]]}},
      dad: {rd_bridge: {act: "sketch", at: [452, 304], dir: -1}, rd_station: {act: "sketch", at: [130, 470], dir: -1}, rd_banos: {act: "sketch", at: [430, 380], dir: -1}},
      mama: {rd_plaza: {act: "haggle", at: [150, 222], dir: -1, hours: [[8*60, 14*60]]}, rd_mercado: {act: "haggle", at: [170, 362], dir: -1}},
      gonggong: {rd_plaza: {act: "doze", at: [206, 446]}, rd_station: {act: "doze", at: [260, 494]}, rd_jardin: {act: "doze", at: [380, 604]}},
      marcus: {rd_bridge: {act: "photo", at: [300, 120]}, rd_old: {act: "photo", at: [124, 130]}, rd_banos: {act: "photo", at: [110, 330]}},
      angelina: {rd_plaza: {act: "notes", at: [440, 248], dir: -1}, rd_bridge: {act: "notes", at: [300, 520]}, rd_cafe: {act: "notes", at: [230, 482], dir: -1}}
    },
    // a word now and then, and what they say when Mel taps them (on top of their usual chat)
    lines: {
      mum: ["Listen to that guitar! See? THIS is how fast a guitar should be.", "Everything's so white it hurts my eyes. In a good way.", "Mel, smell that! Orange blossom. Or oranges. Something orange."],
      dad: ["I've drawn a hundred bridges. This one wins.", "Look at the stonework. Two hundred years old and not a crack.", "Your mum keeps telling me to play faster. I keep telling her: it's not a race."],
      mama: ["Mine are sweeter. But these ones also not bad.", "Two euros for this? Aiyo. In Honeybrook I give for free.", "Ma Ma never see such a big drop. Hold my hand, can?"],
      gonggong: ["Look up. Vultures. Very big. Very patient.", "Good bench. Good shade. Gong Gong stay here a while.", "Mmm. Quiet town. I like."],
      darren: ["Three hundred and something steps down. I lost count at the cat.", "How did they build that bridge without cranes? Forty years, they said. Forty!", "Mel, look at the drop. Don't look at the drop. Okay, look."],
      marcus: ["Free leg day! These steps are no joke.", "Got the bridge, got the gorge, got Ma Ma haggling. Best photos ever.", "I'm getting a churro. Anyone? Zeh?"],
      angelina: ["Everyone here talks with their hands. I'm taking notes.", "That couple at the café have been arguing for an hour and they're so happy.", "I could read in that garden all day."],
      evan: ["so HIGH", "birdies! big birdies!", "pigeons! catch it!", "Mama, hold hand"]
    },
    // round 116: the interiors (see the playbook: every town gets four or five, through the doors on its screens).
    // door: the outdoor place you go in by; music: each room's own live track (audio.js); party: where the family
    // wander inside; say: a line as Mel steps in
    rooms: {
      rd_tapas: {door: "tapas", n: "The tapas bar", music: "rd_tapas", party: [[220, 520], [300, 540], [180, 480], [390, 520], [250, 300]],
        say: "Inside the tapas bar: hams hanging from the beams, tiles on the walls, and everyone talking at once."},
      rd_cafe: {door: "dulces", n: "Doña Carmen's café", music: "rd_cafe", party: [[260, 560], [300, 380], [200, 560], [420, 520], [120, 560]],
        say: "Doña Carmen's: cool tiles, a ceiling fan turning, trays of yemas, and the smell of coffee."},
      rd_banos: {door: "banos", n: "The Arab baths", music: "rd_banos", party: [[160, 520], [360, 520], [260, 560], [120, 360], [400, 360]],
        say: "The Arab baths. Cool and quiet under the domes, with little star-shaped holes letting the sun in."},
      rd_jardin: {door: "jardin", n: "The Moorish garden", music: "rd_jardin", party: [[230, 220], [290, 520], [60, 380], [460, 380], [260, 590]],
        say: "The Moorish garden: water running down the middle, orange trees, myrtle hedges. It's ten degrees cooler in here."},
      rd_cuero: {door: "cuero", n: "The leather workshop", music: "rd_cuero", party: [[200, 520], [320, 540], [140, 440], [400, 470]],
        say: "The leather workshop: the smell of new leather, hides hanging on the walls, and Antonio stitching at his bench. Everything here comes from Ubrique, over the hills."},
      rd_mercado: {door: "mercado", n: "The covered market", music: "rd_mercado", party: [[200, 420], [320, 420], [260, 530], [120, 420], [400, 440]],
        say: "The covered market: iron columns, a glass roof, and a hundred voices haggling."}
    },
    // places on the four screens with nothing else to do yet: a line when Mel walks up
    say: {
      alameda: "The Alameda balcony: an iron railing right on the cliff edge. Far below, the valley: olive groves, cork oaks, little white farms, and the blue mountains beyond.",
      bandstand: "The bandstand in the Alameda gardens. On summer evenings the town band plays here.",
      mercado: "The covered market: almonds, oranges, olive oil, jamón, cheese. Rafael's stall is at the front.",
      tapas: "A tapas bar with a terrace on the plaza. Little plates, big chatter.",
      dulces: "Doña Carmen's sweet shop. The window's full of yemas and almond cakes.",
      fuente: "The fountain in the plaza, with orange trees round it. Pigeons, a busker, old men on benches.",
      mirador: "The viewpoint over the gorge. A hundred metres straight down to the river, and the waterfall roaring under the bridge.",
      jardin: "The Moorish garden: fountains, water channels and cypress hedges, cool even at midday.",
      convento: "The convent. There's a little turntable in the wall: knock, and the nuns pass out biscuits.",
      cuero: "A leather workshop, with bags and belts in the window. A sign says: Piel de Ubrique.",
      azulejos: "Lucía's tile shop: hand-painted tiles of every view in Ronda, cork crafts and painted fans.",
      banos: "The Arab baths: low domes with star-shaped skylights, eight hundred years old.",
      puerta: "The old town gate, with its horseshoe arches. Beyond it the road winds down into the valley."
    }
  },
  // Kyoto (round 121): an old capital in a bowl of wooded hills. Top row: the little station with its tram and the
  // bamboo grove (west), then the stone lane of Higashiyama up to the pagoda. Bottom row: the river and the canal
  // quarter (west) and the temple with its torii tunnel (east).
  //   kt_station | kt_lane
  //   -----------+----------
  //   kt_river   | kt_temple
  kyoto: {
    n: "Kyoto", by: "train", fare: 60, free: ["evan"], outFrom: 7*60, outTo: 15*60, backTo: 22*60,
    screens: ["kt_station", "kt_lane", "kt_temple", "kt_river"], arrive: ["kt_station", [332, 216]], station: "kttrain", music: "kyoto",
    blurb: "An old capital in a bowl of wooded hills: wooden townhouses, stone lanes, paper lanterns, temple bells, moss, maples and the sound of water. A longer ride: trains out until 3pm.",
    arriveLine: "Kyoto! Dark wood and paper lanterns, a tram clanking past, and the bamboo whispering behind the station.",
    evanArrive: ["a TRAM, Mama!", "the trees are so TALL", "is this Japan? is it?"],
    evanScreen: {kt_station: ["bamboo! so tall!", "ding ding tram!"], kt_lane: ["a tower! a tall tower!", "red lanterns!"], kt_temple: ["red gates! lots!", "fishies in the pond!"], kt_river: ["stepping stones! turtles!", "a big bird!"]},
    hints: {kt_station: "Kyoto's little station (trains home till 10pm), the bamboo grove and the yukata shop. East: Higashiyama. South: the river.",
      kt_lane: "The old stone lane up to the pagoda: the tea house, the sweet shop, the pottery. West: the station. South: steps down to the temple.",
      kt_temple: "The temple hall, the torii gates, the gravel garden and the koi pond. North: up to the lane. West: the river.",
      kt_river: "The river and its turtle stones, the covered market and the willow canal. North: the station. East: over the canal to the temple."},
    spots: {
      mum: {kt_station: [[220, 360], [300, 520]], kt_lane: [[260, 300], [300, 520]], kt_temple: [[330, 250], [180, 420]], kt_river: [[200, 270], [330, 500]]},
      dad: {kt_station: [[200, 500], [420, 540]], kt_lane: [[230, 260], [340, 300]], kt_temple: [[420, 470], [260, 240]], kt_river: [[340, 260], [200, 520]]},
      mama: {kt_station: [[250, 470], [380, 560]], kt_lane: [[200, 330], [280, 560]], kt_temple: [[200, 470], [300, 470]], kt_river: [[160, 260], [320, 480]]},
      gonggong: {kt_station: [[230, 450], [240, 460]], kt_lane: [[230, 360], [240, 370]], kt_temple: [[200, 460], [210, 470]], kt_river: [[180, 480], [190, 490]]},
      darren: {kt_station: [[300, 560], [420, 270]], kt_lane: [[160, 300], [300, 400]], kt_temple: [[280, 560], [250, 260]], kt_river: [[220, 230], [300, 250]]},
      marcus: {kt_station: [[440, 560], [200, 330]], kt_lane: [[330, 520], [270, 230]], kt_temple: [[280, 260], [440, 480]], kt_river: [[380, 520], [140, 240]]},
      angelina: {kt_station: [[280, 360], [380, 300]], kt_lane: [[300, 330], [200, 580]], kt_temple: [[330, 470], [270, 380]], kt_river: [[240, 500], [300, 280]]}
    },
    // what they do (new animations come in round 3: Mum's parasol, Dad's wheel, Ma Ma's cranes, Gong Gong's Go,
    // Darren's skewers, Marcus's calligraphy, Angelina's fortunes; nothing they did in Ronda)
    acts: {},
    lines: {
      mum: ["Listen. You can hear the bamboo creaking. Like a boat.", "Everything here is so neat. I want to fold my clothes now. Strange feeling.", "I want a yukata. A blue one. With little white flowers."],
      dad: ["Look at the joinery on that roof. Not a single nail. Not one.", "That pagoda's been standing here longer than anything I've ever fixed.", "I'd like to try making a cup. A bowl. Anything round."],
      mama: ["So clean! You can eat off the street. Ma Ma won't. But you can.", "The moss here, so green. Ma Ma's garden never this green. Must be the rain.", "Paper cranes, a thousand, you get a wish. Ma Ma start now."],
      gonggong: ["Quiet town. Old town. Gong Gong feels young here.", "Koi fish. Very fat. Very lucky.", "Somebody playing Go under that tree. Gong Gong watch only. For now."],
      darren: ["I've eaten four things on sticks and I'm not stopping.", "There's a vending machine for everything here. Even hot soup. HOT SOUP.", "Mel, how do you say 'another one, please'? Asking for me."],
      marcus: ["Everyone here bows. I've bowed to a vending machine twice.", "That brush calligraphy looks easy. It is not easy, is it?", "The steps up to that temple: one hundred and twelve. I counted. Zeh, don't."],
      angelina: ["I drew a fortune. 'Great blessing.' I'm framing it.", "Everyone's so polite I feel loud just breathing.", "The tea house garden has a little waterfall and nobody's even looking at it. I am."],
      evan: ["tram! ding ding!", "red gates! red gates!", "fishies!", "Mama, the trees are talking"]
    },
    say: {
      ktbamboo: "The bamboo grove: thousands of stalks, taller than houses, creaking and knocking together in the wind. The light comes through in green stripes.",
      ktyukata: "The yukata shop: rows of cotton summer kimonos in indigo, red and white. (It opens properly soon.)",
      ktpagoda: "The five-storey pagoda: each roof a little smaller than the last, with a golden spire on top. It's stood through more than four hundred years of earthquakes.",
      ktchaya: "The tea house: a cloth curtain over the door, a red lantern, and the smell of roasted tea. (Its door opens soon.)",
      ktwagashi: "The sweet shop: tiny sweets shaped like flowers and leaves, one for each season, under glass. (Its door opens soon.)",
      ktpottery: "The pottery workshop: cups and bowls drying on boards, and the kiln ticking as it cools. (Its door opens soon.)",
      kthall: "The temple hall: a deep, sweeping roof on red pillars, incense curling up from the burner, and a great bell inside. (Its doors open soon.)",
      kttorii: "The torii gates: a tunnel of vermilion gates climbing the hill, each one given by somebody, with their name painted on the back.",
      ktzen: "The gravel garden: raked lines flowing round three mossy rocks like water round islands. Nobody walks on it. You just sit and look.",
      ktkoi: "The koi pond: orange, white and red koi gliding under the little red bridge. They come up to see if you've brought anything.",
      ktstones: "The turtle stones: stepping stones shaped like turtles, right across the river. You hop from shell to shell.",
      ktnishiki: "The covered market: a long arcade of little stalls: pickles, tofu, rolled omelette, knives, tea. (Its stalls open soon.)"
    }
  }
};
export const TOWN_SCENES = Object.fromEntries(Object.entries(TOWNS).flatMap(([id, t]) => [...t.screens, ...Object.keys(t.rooms || {})].map(s => [s, id])));
// an interior of a town (round 116) -> its room entry, or null
export const townRoom = scene => { const t = TOWNS[TOWN_SCENES[scene]]; return (t && t.rooms && t.rooms[scene]) || null; };
// the room behind an outdoor place's door ("tapas" -> "rd_tapas")
export const roomBehind = (town, place) => Object.keys((TOWNS[town] || {}).rooms || {}).find(r => TOWNS[town].rooms[r].door === place) || null;
export const townOf = scene => TOWN_SCENES[scene] || null;

// Places on the town screens (merged into world.js VILLAGE). bridge: a gate to another screen of the same town.
export const TOWN_PLACES = {
  rdtrain: {scene: "rd_station", name: "Ronda station", door: [330, 186], spot: true, mark: [330, 54], line: "Ronda's little station. Trains home to Honeybrook until 10pm."},
  alameda: {scene: "rd_station", name: "The Alameda balcony", door: [116, 470], spot: true, mark: [116, 380], line: "The balcony over the valley."},
  bandstand: {scene: "rd_station", name: "The bandstand", door: [214, 486], spot: true, mark: [214, 388], line: "The bandstand."},
  rdToPlaza: {scene: "rd_station", name: "To the plaza", door: [500, 300], spot: true, bridge: "rd_plaza", mark: [470, 240], line: "East along the avenue to the plaza."},
  rdStepsDown: {scene: "rd_station", name: "Steps down into the gorge", door: [180, 612], spot: true, bridge: "rd_old", mark: [180, 520], line: "Down the steps into the gorge, over the old bridge and up into the old town."},
  mercado: {scene: "rd_plaza", name: "The covered market", door: [130, 184], spot: true, mark: [130, 60], line: "The covered market."},
  tapas: {scene: "rd_plaza", name: "The tapas bar", door: [392, 184], spot: true, mark: [392, 60], line: "The tapas bar."},
  dulces: {scene: "rd_plaza", name: "Doña Carmen's sweet shop", door: [424, 470], spot: true, mark: [470, 360], line: "The sweet shop."},
  fuente: {scene: "rd_plaza", name: "The fountain", door: [260, 384], spot: true, mark: [260, 270], line: "The fountain."},
  rdToStation: {scene: "rd_plaza", name: "To the station", door: [16, 330], spot: true, bridge: "rd_station", mark: [40, 270], line: "West along the avenue to the station and the Alameda."},
  rdBridgeN: {scene: "rd_plaza", name: "Puente Nuevo", door: [330, 616], spot: true, bridge: "rd_bridge", mark: [330, 530], line: "Across the bridge to the south side of the gorge."},
  mirador: {scene: "rd_bridge", name: "The viewpoint", door: [440, 262], spot: true, mark: [440, 176], line: "The viewpoint."},
  jardin: {scene: "rd_bridge", name: "The Moorish garden", door: [330, 432], spot: true, mark: [330, 330], line: "The Moorish garden."},
  rdBridgeS: {scene: "rd_bridge", name: "Puente Nuevo", door: [310, 26], spot: true, bridge: "rd_plaza", mark: [250, 40], line: "Back over the bridge to the plaza."},
  rdToOld: {scene: "rd_bridge", name: "To the old town", door: [16, 520], spot: true, bridge: "rd_old", mark: [40, 460], line: "West into the old town."},
  convento: {scene: "rd_old", name: "The convent hatch", door: [404, 256], spot: true, mark: [404, 120], line: "The convent."},
  azulejos: {scene: "rd_old", name: "Lucía's tile shop", door: [384, 432], spot: true, mark: [384, 300], line: "The tile shop."},
  banos: {scene: "rd_old", name: "The Arab baths", door: [118, 598], spot: true, mark: [118, 500], line: "The Arab baths."},
  puerta: {scene: "rd_old", name: "The old town gate", door: [330, 604], spot: true, mark: [330, 520], line: "The old town gate."},
  rdToBridge: {scene: "rd_old", name: "To the bridge", door: [504, 380], spot: true, bridge: "rd_bridge", mark: [476, 320], line: "East to Puente Nuevo and the viewpoint."},
  // the interiors' own entries (their way out is back through the door they came in by)
  rd_tapas: {scene: "rd_plaza", name: "The tapas bar", door: [392, 184]}, rd_cafe: {scene: "rd_plaza", name: "Doña Carmen's café", door: [424, 470]},
  rd_mercado: {scene: "rd_plaza", name: "The covered market", door: [130, 184]}, rd_banos: {scene: "rd_old", name: "The Arab baths", door: [118, 598]},
  rd_jardin: {scene: "rd_bridge", name: "The Moorish garden", door: [330, 432]},
  cuero: {scene: "rd_old", name: "The leather workshop", door: [91, 466], spot: true, mark: [91, 320], line: "The leather workshop."},
  rd_cuero: {scene: "rd_old", name: "The leather workshop", door: [91, 466]},
  // Kyoto (round 121)
  kttrain: {scene: "kt_station", name: "Kyoto station", door: [332, 190], spot: true, mark: [332, 54], line: "Kyoto's little station. Trains home to Honeybrook until 10pm."},
  ktbamboo: {scene: "kt_station", name: "The bamboo grove", door: [158, 420], spot: true, mark: [150, 330], line: "The bamboo grove."},
  ktyukata: {scene: "kt_station", name: "The yukata shop", door: [440, 484], spot: true, mark: [440, 360], line: "The yukata shop."},
  ktToLane: {scene: "kt_station", name: "To Higashiyama", door: [500, 300], spot: true, bridge: "kt_lane", mark: [470, 240], line: "East along the tram line to the old lane."},
  ktToRiver: {scene: "kt_station", name: "To the river", door: [330, 612], spot: true, bridge: "kt_river", mark: [330, 540], line: "South to the river and the canal."},
  ktpagoda: {scene: "kt_lane", name: "The pagoda", door: [432, 192], spot: true, mark: [432, 10], line: "The pagoda."},
  ktchaya: {scene: "kt_lane", name: "The tea house", door: [114, 188], spot: true, mark: [114, 50], line: "The tea house."},
  ktwagashi: {scene: "kt_lane", name: "The sweet shop", door: [420, 440], spot: true, mark: [420, 300], line: "The sweet shop."},
  ktpottery: {scene: "kt_lane", name: "The pottery workshop", door: [110, 536], spot: true, mark: [110, 400], line: "The pottery workshop."},
  ktToStation: {scene: "kt_lane", name: "To the station", door: [16, 300], spot: true, bridge: "kt_station", mark: [40, 240], line: "West back to the station."},
  ktStepsDown: {scene: "kt_lane", name: "Steps down to the temple", door: [330, 612], spot: true, bridge: "kt_temple", mark: [330, 540], line: "Down the stone steps to the temple."},
  kthall: {scene: "kt_temple", name: "The temple hall", door: [375, 192], spot: true, mark: [375, 30], line: "The temple hall."},
  kttorii: {scene: "kt_temple", name: "The torii gates", door: [230, 596], spot: true, mark: [230, 260], line: "The torii gates."},
  ktzen: {scene: "kt_temple", name: "The gravel garden", door: [400, 448], spot: true, mark: [400, 280], line: "The gravel garden."},
  ktkoi: {scene: "kt_temple", name: "The koi pond", door: [190, 520], spot: true, mark: [110, 440], line: "The koi pond."},
  ktStepsUp: {scene: "kt_temple", name: "Steps up to the lane", door: [150, 40], spot: true, bridge: "kt_lane", mark: [150, 20], line: "Up the stone steps to the lane."},
  ktToRiverW: {scene: "kt_temple", name: "To the river", door: [16, 380], spot: true, bridge: "kt_river", mark: [40, 320], line: "West along the canal to the river."},
  ktnishiki: {scene: "kt_river", name: "The covered market", door: [145, 190], spot: true, mark: [145, 50], line: "The covered market."},
  ktstones: {scene: "kt_river", name: "The turtle stones", door: [262, 300], spot: true, mark: [262, 250], line: "The turtle stones."},
  ktToStationN: {scene: "kt_river", name: "To the station", door: [300, 40], spot: true, bridge: "kt_station", mark: [300, 20], line: "North along the river to the station."},
  ktToTemple: {scene: "kt_river", name: "To the temple", door: [504, 520], spot: true, bridge: "kt_temple", mark: [476, 460], line: "East over the canal bridge to the temple."},
  rdStepsUp: {scene: "rd_old", name: "Steps up out of the gorge", door: [120, 40], spot: true, bridge: "rd_station", mark: [200, 30], line: "Down into the gorge, over the old bridge and up the steps to the new town."}
};
export const TOWN_BRIDGES = {rd_station: {rd_plaza: "rdToPlaza", rd_old: "rdStepsDown"}, rd_plaza: {rd_station: "rdToStation", rd_bridge: "rdBridgeN"},
  rd_bridge: {rd_plaza: "rdBridgeS", rd_old: "rdToOld"}, rd_old: {rd_bridge: "rdToBridge", rd_station: "rdStepsUp"},
  kt_station: {kt_lane: "ktToLane", kt_river: "ktToRiver"}, kt_lane: {kt_station: "ktToStation", kt_temple: "ktStepsDown"},
  kt_temple: {kt_lane: "ktStepsUp", kt_river: "ktToRiverW"}, kt_river: {kt_station: "ktToStationN", kt_temple: "ktToTemple"}};
export const TOWN_ARRIVE = {"rd_station>rd_plaza": [44, 330], "rd_plaza>rd_station": [474, 300], "rd_plaza>rd_bridge": [310, 60], "rd_bridge>rd_plaza": [330, 572],
  "rd_bridge>rd_old": [476, 380], "rd_old>rd_bridge": [44, 520], "rd_station>rd_old": [130, 76], "rd_old>rd_station": [180, 566],
  "kt_station>kt_lane": [44, 300], "kt_lane>kt_station": [474, 300], "kt_station>kt_river": [300, 76], "kt_river>kt_station": [330, 576],
  "kt_lane>kt_temple": [150, 80], "kt_temple>kt_lane": [330, 576], "kt_temple>kt_river": [474, 520], "kt_river>kt_temple": [44, 380]};
// walking areas, and what's in the way (paths.js)
export const TOWN_BOUNDS = {kt_station: [140, 178, 506, 616], kt_lane: [14, 180, 506, 616], kt_temple: [14, 40, 506, 616], kt_river: [14, 40, 506, 616],
  rd_cuero: [30, 250, 490, 600], rd_tapas: [30, 250, 490, 600], rd_cafe: [30, 260, 490, 600], rd_banos: [30, 220, 490, 600], rd_jardin: [30, 176, 490, 606], rd_mercado: [30, 250, 490, 600],
  rd_station: [90, 178, 506, 616], rd_plaza: [14, 180, 506, 616], rd_bridge: [14, 22, 506, 616], rd_old: [14, 36, 506, 616]};
export const TOWN_OBST = {
  kt_station: [[0, 0, 134, 640], [262, 56, 404, 162], [376, 376, 504, 466]],
  kt_lane: [[26, 56, 206, 174], [26, 414, 198, 522], [336, 312, 508, 428], [380, 10, 486, 178], [218, 382, 296, 438]],
  kt_temple: [[250, 40, 500, 174], [300, 296, 498, 434], [30, 470, 190, 550]],
  kt_river: [[24, 58, 266, 176], [0, 316, 246, 426], [278, 316, 420, 426], [416, 0, 470, 538], [416, 564, 470, 640]],
  // the interiors: the tables, the hedges, the stalls
  rd_tapas: [[96, 362, 144, 392], [276, 402, 324, 432], [396, 282, 444, 312], [30, 486, 116, 510], [372, 498, 520, 552], [466, 376, 520, 480]],
  rd_cafe: [[90, 316, 130, 340], [180, 456, 220, 480], [350, 406, 390, 430], [56, 446, 96, 470], [432, 516, 472, 540], [436, 326, 476, 350]],
  rd_banos: [[214, 440, 306, 500], [388, 556, 452, 576]],
  rd_jardin: [[60, 196, 214, 344], [306, 196, 460, 344], [60, 420, 214, 560], [306, 420, 460, 560], [224, 344, 296, 410]],
  rd_cuero: [[170, 300, 350, 350], [76, 428, 172, 466], [352, 446, 448, 484], [20, 240, 74, 400], [470, 240, 520, 400]],
  rd_mercado: [[40, 296, 156, 350], [364, 296, 480, 350], [40, 466, 136, 514], [374, 466, 486, 514], [424, 356, 512, 412], [48, 396, 112, 418]],
  rd_station: [[0, 0, 84, 640], [244, 60, 418, 160], [178, 418, 250, 474], [84, 588, 156, 640], [206, 588, 520, 640], [400, 380, 470, 440]],
  rd_plaza: [[30, 36, 228, 172], [292, 36, 488, 172], [222, 306, 298, 366], [440, 384, 520, 500], [0, 592, 296, 640], [366, 592, 520, 640], [180, 432, 232, 458], [0, 392, 60, 488], [0, 508, 74, 590]],
  rd_bridge: [[0, 0, 268, 214], [352, 0, 520, 214], [24, 292, 206, 420], [300, 470, 360, 560], [0, 214, 200, 252]],
  rd_old: [[0, 0, 90, 104], [160, 0, 520, 104], [26, 150, 176, 262], [326, 128, 500, 244], [26, 330, 156, 444], [300, 324, 472, 420], [36, 500, 196, 580], [270, 590, 392, 640]]
};

// Ronda's goods (round 107, round 3): things you can't get in Honeybrook. kind ingredient: they go to the kitchen
// (tapas), the Scoop Shack (gelato) and the Cocoa Room (bonbon fillings) like any other; kind gift: give them to the
// family. art: [icons.js shape, colour, second colour]. shop: where in Ronda they're sold.
export const TOWN_GOODS = {
  almond: {n: "Marcona almonds", kind: "ingredient", price: 6, sell: 2, shop: "mercado", art: ["bag", "#E8D3A8", "#C9A27E"], what: "from Ronda's market: ajo blanco and salted almonds at the kitchen, almond gelato, a praline bonbon"},
  sevilla: {n: "Seville oranges", kind: "ingredient", price: 4, sell: 1, shop: "mercado", art: ["apple", "#F28C28", "#7FA35A"], what: "from Ronda's market: orange and olive salad at the kitchen, bitter orange gelato or bonbons"},
  // (round 120: oil sells for 12, more than the three jars of olives it takes (9); Rafael's is 14, so there's no
  // buying it in Ronda to sell at home)
  oliveoil: {n: "Olive oil", kind: "ingredient", price: 14, sell: 12, shop: "mercado", art: ["bottle", "#B9B04A"], what: "Rafael's family oil, from Ronda: salmorejo, ajo blanco, bread with oil"},
  jamon: {n: "Jamón", kind: "ingredient", price: 15, sell: 5, shop: "mercado", art: ["roll", "#B5443A", "#F3E1D0"], what: "from Ronda's market: jamón croquetas at the kitchen"},
  payoyo: {n: "Payoyo goat's cheese", kind: "ingredient", price: 12, sell: 4, shop: "mercado", art: ["wheel", "#F3E7C8", "#C9A27E"], what: "a mountain goat's cheese from Ronda: payoyo with membrillo at the kitchen"},
  membrillo: {n: "Membrillo", kind: "ingredient", price: 6, sell: 2, shop: "mercado", art: ["bar", "#C8643B"], what: "quince paste from Ronda: with payoyo at the kitchen, a quince bonbon filling"},
  picnic: {n: "Picnic basket", kind: "picnic", price: 18, sell: 0, shop: "mercado", art: ["tote", "#C9A27E", "#E8566C"], what: "bread, cheese, jamón and oranges: spread it out at the Alameda balcony"},
  churros: {n: "Churros", kind: "gift", to: "family", price: 4, shop: "dulces", art: ["roll", "#E8C48E", "#C98A4A"], say: "Churros! Still warm, and sugary all over. Is there chocolate?", says: {evan: "CHURROS! Dip dip dip!"}},
  yemas: {n: "Yemas del Tajo", kind: "gift", to: "family", price: 8, shop: "dulces", art: ["box", "#F3C24A", "#FFFDF6"], say: "Yemas! Egg yolk and sugar, like little suns. From Ronda?"},
  tartaalm: {n: "Almond cake", kind: "gift", to: "family", price: 10, shop: "dulces", art: ["tart", "#E8C48E", "#FFFDF6"], say: "An almond cake, all the way from Ronda. Kettle on!"},
  pastas: {n: "Convent biscuits", kind: "gift", to: "family", price: 5, shop: "convento", art: ["disc", "#E8C48E", "#C98A4A"], say: "Biscuits made by nuns! They taste like a hundred years of practice.", says: {evan: "Biscuits from a WALL! Again!"}},
  abanico: {n: "Painted fan", kind: "gift", to: ["mum", "mama", "angelina"], price: 12, shop: "azulejos", art: ["cloth", "#C2307A", "#F3C969"], say: "A painted fan! Very elegant. Very useful in this heat."},
  // round 116: Antonio's leather workshop in the old town, everything made in Ubrique, the leather village over the hills
  cartera: {n: "Leather wallet", kind: "gift", to: ["dad", "darren", "marcus", "gonggong"], price: 24, shop: "cuero", art: ["box", "#8A5A3A", "#C98A4A"], say: "A leather wallet from Ubrique! Smells amazing. Feel those stitches."},
  bolso: {n: "Leather handbag", kind: "gift", to: ["mum", "mama", "angelina"], price: 60, shop: "cuero", art: ["tote", "#7A3A2A", "#C98A4A"], say: "Oh, Mel. A Ubrique bag! This will last me forever."},
  cinturon: {n: "Leather belt", kind: "gift", to: ["dad", "darren", "marcus", "gonggong"], price: 30, shop: "cuero", art: ["roll", "#5A3A2A", "#D9A441"], say: "A proper leather belt, hand-stitched. Very smart."},
  libreta: {n: "Leather notebook", kind: "gift", to: ["angelina", "mum", "darren"], price: 18, shop: "cuero", art: ["box", "#A8754F", "#F3E7C8"], say: "A leather notebook! For lists. And secret lists."},
  llavero: {n: "Leather keyring", kind: "gift", to: "family", price: 6, shop: "cuero", art: ["disc", "#C98A4A", "#D9A441"], say: "A little leather keyring, with a stamped bridge on it. Sweet!"},
  // round 118: shopping corners: spices and ceramics at the market, postcards and fans at Doña Carmen's
  azafran: {n: "Saffron", kind: "gift", to: ["mama", "mum", "gonggong"], price: 12, shop: "especias", art: ["bag", "#C8343A", "#F3C24A"], say: "Real saffron! Worth more than gold, gram for gram. Paella this weekend?"},
  pimenton: {n: "Smoked paprika", kind: "gift", to: ["dad", "gonggong", "darren", "marcus"], price: 6, shop: "especias", art: ["box", "#B5443A", "#F3E7C8"], say: "Smoked paprika in a little tin. Everything I cook is going to taste of Spain now."},
  especiero: {n: "Spice tin set", kind: "gift", to: "family", price: 10, shop: "especias", art: ["box", "#D9A441", "#8A5A3A"], say: "Little spice tins, all labelled in Spanish! So pretty on the shelf."},
  cuenco: {n: "Painted bowl", kind: "gift", to: "family", price: 14, shop: "ceramica", art: ["disc", "#3E6BAE", "#F3C969"], say: "A hand-painted bowl, blue and yellow like the tiles! For olives. Or for looking at."},
  aceitera: {n: "Olive dish", kind: "gift", to: ["mama", "gonggong", "mum"], price: 9, shop: "ceramica", art: ["disc", "#5E8A48", "#F3ECDD"], say: "A little dish with a pit for the stones. Ma Ma approves of practical things."},
  jarra: {n: "Little jug", kind: "gift", to: ["mum", "angelina", "mama"], price: 11, shop: "ceramica", art: ["bottle", "#C8643B", "#F3ECDD"], say: "A painted jug! For flowers from the garden."},
  postal: {n: "Postcard of the bridge", kind: "gift", to: "family", price: 2, shop: "postales", art: ["box", "#7FB8E8", "#FFFDF6"], say: "A postcard of Puente Nuevo! Did you write on the back? You did. Aww."},
  iman: {n: "Ronda fridge magnet", kind: "gift", to: "family", price: 3, shop: "postales", art: ["disc", "#FBF7EE", "#C8643B"], say: "A little white house with a red roof, for the fridge. It's going right in the middle."},
  encaje: {n: "Lace fan", kind: "gift", to: ["mum", "mama", "angelina"], price: 14, shop: "postales", art: ["cloth", "#FFFDF6", "#3A3430"], say: "A black lace fan! So elegant. I feel like a flamenco dancer already."},
  // touches: Rocío's carnation for Evan (free), and the tiles Mel (and Evan) paint at Lucía's (keepsakes)
  clavel: {n: "A red carnation", kind: "gift", to: "family", price: 0, art: ["disc", "#D8343A", "#5E8A48"], say: "A carnation from Ronda! Evan gave it to you? Oh, that boy."},
  etile: {n: "Evan's painted tile", kind: "keepsake", price: 0, art: ["tile", "#7FB8E8", "#F3C969"], line: "Blue thumbprints, a yellow smudge and a lot of love. Painted by Evan at Lucía's in Ronda."},
  corcho: {n: "Cork coasters", kind: "gift", to: ["dad", "darren", "gonggong", "marcus"], price: 9, shop: "azulejos", art: ["disc", "#B98A5A", "#8A6A52"], say: "Cork from the cork oaks! Light as anything."}
};
// Lucía's painted tiles: collect all eight and they become a tiled bench by the pond at home. Some only in season.
export const TILES = {
  bridge: {n: "Puente Nuevo", price: 40, col: "#3E6BAE"}, orange: {n: "An orange branch", price: 25, col: "#F28C28", seasons: ["winter", "spring"]},
  vulture: {n: "A vulture", price: 30, col: "#5A4636"}, pinsapo: {n: "The pinsapo fir", price: 30, col: "#3E5E58"},
  banos: {n: "The Arab baths", price: 35, col: "#C9A27E"}, geranium: {n: "A geranium pot", price: 25, col: "#D8343A", seasons: ["spring", "summer"]},
  guitar: {n: "Manolo's guitar", price: 35, col: "#A8754F"}, almond: {n: "Almond blossom", price: 30, col: "#E890A8", seasons: ["winter"]}
};
// Round 118: paint your own tile at Lucía's: a colour and a pattern, four strokes, fired in her kiln (a keepsake)
export const PAINT = {price: 8, colours: {azul: ["cobalt blue", "#3E6BAE"], amarillo: ["saffron yellow", "#E8B13A"], verde: ["olive green", "#5E8A48"]},
  patterns: {star: "an eight-point star", flower: "a geranium flower", wave: "waves, like the river in the gorge"}};
Object.keys(PAINT.colours).forEach(c => Object.keys(PAINT.patterns).forEach(p => { TOWN_GOODS[`ptile_${c}_${p}`] = {n: "Your painted tile", kind: "keepsake", price: 0, tile: [c, p], art: ["tile", PAINT.colours[c][1], "#FFFDF6"], line: `A tile you painted yourself at Lucía's in Ronda: ${PAINT.patterns[p]}, in ${PAINT.colours[c][0]}.`}; }));
// The tapas bar: order a little plate on the terrace and it's yours to cook at home (kitchen.js TAPAS, learn: true)
export const TASTINGS = {
  salmorejo: {price: 5, line: "Salmorejo: cold, thick, tomato and bread and olive oil, with egg and jamón on top. Like eating summer with a spoon."},
  ajoblanco: {price: 5, line: "Ajo blanco: a white soup of almonds and garlic, with a grape floating in it. Strange. Wonderful."},
  croqjamon: {price: 6, line: "Jamón croquetas: crisp outside, molten béchamel inside. You burn your tongue. Worth it."},
  payoyo: {price: 6, line: "Payoyo with membrillo: salty goat's cheese and sweet quince paste. The waiter says it's how grandmothers do it."},
  naranjas: {price: 4, line: "Orange salad: Seville oranges, black olives, olive oil and a pinch of salt. Sweet, bitter, salty. Who knew?"}
};
