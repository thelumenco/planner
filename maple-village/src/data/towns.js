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
    acts: {
      mum: {kt_lane: {act: "parasol", at: [270, 300], dir: -1}, kt_station: {act: "parasol", at: [230, 380]}},
      dad: {kt_pottery: {act: "wheel", at: [150, 330], dir: 1}},
      mama: {kt_temple: {act: "cranes", at: [180, 420], dir: 1}, kt_river: {act: "cranes", at: [170, 270], dir: 1}},
      gonggong: {kt_temple: {act: "go", at: [300, 470], dir: 1}},
      darren: {kt_market: {act: "skewer", at: [260, 480]}, kt_river: {act: "skewer", at: [330, 250], dir: -1}},
      marcus: {kt_hall: {act: "brush", at: [400, 520], dir: -1}},
      angelina: {kt_temple: {act: "fortune", at: [260, 250], dir: 1}, kt_hall: {act: "fortune", at: [120, 470]}}
    },
    // round 122: the five interiors, behind the doors on the lane, the temple and the river
    rooms: {
      kt_tea: {door: "ktchaya", n: "The tea house", music: "kt_tea", party: [[200, 540], [330, 560], [120, 520], [420, 520]],
        say: "The tea house: tatami mats, paper screens slid open onto a little garden, a scroll in the alcove, and the kettle just beginning to sing."},
      kt_hall: {door: "kthall", n: "The temple hall", music: "kt_hall", party: [[200, 560], [330, 560], [120, 520], [400, 560]],
        say: "Inside the temple hall: candlelight on gold, incense, and a deep quiet. A monk is sitting in the meditation corner by the moss garden."},
      kt_sweets: {door: "ktwagashi", n: "The sweet shop", music: "kt_sweets", party: [[200, 540], [330, 560], [120, 540], [420, 540]],
        say: "The sweet shop: little glass cases of sweets shaped like flowers and leaves, and Mr Tanaka at his counter, shaping one with a wooden stick."},
      kt_market: {door: "ktnishiki", n: "The covered market", music: "kt_market", party: [[200, 480], [320, 480], [260, 560], [140, 420]],
        say: "The covered market: a long arcade of little stalls, steam rising, everyone calling out what's good today."},
      kt_pottery: {door: "ktpottery", n: "The pottery", music: "kt_pottery", party: [[220, 540], [340, 540], [140, 520], [420, 520]],
        say: "The pottery: a wheel turning, shelves of cups drying, and the kiln glowing orange at the back."}
    },
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
  },
  // Jeju (round 127): a volcanic island off the south coast of Korea. Black basalt everywhere (walls, houses, the
  // shore), green crater cones, tangerine orchards behind low stone walls, thatched stone houses, the women divers
  // (haenyeo) and their orange floats, wind and sea. Two ways there: the train over the long sea bridge (into the
  // village, bottom right; Jeju's station is NOT top left like the other towns') or the ferry from Honeybrook's
  // foreshore jetty (into the harbour, bottom left). Go one way, come home the other if you like.
  //   jj_shore   | jj_farms
  //   -----------+-----------
  //   jj_harbour | jj_village   (the station, at the bottom of the village, where the sea bridge comes in)
  jeju: {
    n: "Jeju", by: "train", fare: 70, free: ["evan"], outFrom: 7*60, outTo: 15*60, backTo: 22*60,
    screens: ["jj_shore", "jj_farms", "jj_harbour", "jj_village"], arrive: ["jj_village", [396, 584]], station: "jjtrain", music: "jeju",
    // the ferry: tickets at the foreshore jetty (world.js "ferry"), into the harbour; same hours as the train
    ferry: {fare: 50, pier: "jjpier", arrive: ["jj_harbour", [214, 436]], arriveLine: "Jeju! The ferry noses in past two little horse-shaped lighthouses, one red, one white. Gulls, salt, and black rocks everywhere."},
    blurb: "A volcanic island: black stone walls, tangerine orchards, thatched stone houses, a green crater by the sea and the women divers bobbing out past the rocks. By train over the sea bridge, or by ferry from the foreshore jetty (50).",
    arriveLine: "Jeju! The train rolls off the sea bridge into a little stone station. Black stone walls, orange tangerines, and the wind smells of the sea.",
    evanArrive: ["black rocks, Mama!", "it's windy! my hair!", "oranges on the trees!"],
    evanScreen: {jj_shore: ["a big green mountain!", "swimming ladies!"], jj_farms: ["horsies! little horsies!", "SO many oranges"], jj_harbour: ["red lighthouse! white lighthouse!", "big boats!"], jj_village: ["stone grandpas!", "hairy roofs!"]},
    hints: {jj_shore: "Seongsan: the crater by the sea, the divers' house and the rock pools. East: the tangerine farms. South: the harbour.",
      jj_farms: "The Olle trail through the tangerine farms: the packing shed, the ponies, the wish-towers. West: the shore. South: the village.",
      jj_harbour: "The harbour: the ferry home (till 10pm), the horse lighthouses and the market hall. North: the shore. East: the village.",
      jj_village: "The stone village: the café, the dye workshop, the stone grandfathers, and the station at the bottom (trains home till 10pm). North: the farms. West: the harbour."},
    spots: {
      mum: {jj_shore: [[260, 300], [330, 520]], jj_farms: [[230, 360], [300, 560]], jj_harbour: [[300, 300], [380, 520]], jj_village: [[220, 320], [260, 520]]},
      dad: {jj_shore: [[300, 260], [420, 460]], jj_farms: [[260, 300], [200, 560]], jj_harbour: [[260, 380], [420, 300]], jj_village: [[200, 230], [300, 420]]},
      mama: {jj_shore: [[240, 420], [330, 300]], jj_farms: [[180, 320], [240, 420]], jj_harbour: [[330, 250], [300, 480]], jj_village: [[240, 260], [180, 480]]},
      gonggong: {jj_shore: [[300, 420], [310, 430]], jj_farms: [[270, 470], [280, 480]], jj_harbour: [[280, 520], [290, 530]], jj_village: [[290, 260], [300, 270]]},
      darren: {jj_shore: [[380, 300], [260, 560]], jj_farms: [[300, 420], [220, 260]], jj_harbour: [[240, 300], [440, 480]], jj_village: [[260, 360], [200, 560]]},
      marcus: {jj_shore: [[420, 560], [220, 300]], jj_farms: [[300, 260], [200, 480]], jj_harbour: [[440, 300], [260, 560]], jj_village: [[300, 480], [220, 400]]},
      angelina: {jj_shore: [[440, 300], [280, 360]], jj_farms: [[240, 300], [300, 520]], jj_harbour: [[360, 400], [300, 260]], jj_village: [[240, 440], [300, 300]]}
    },
    // what they do (round 129, nothing they did in Ronda or Kyoto): Mum flies a kite, Dad pats the stone grandfather's
    // nose for luck, Ma Ma picks tangerines, Gong Gong mends nets with Mr Kang, Darren builds a wish-tower, Marcus and
    // Angellina ride a tandem along the coast road. (Evan's rock-pool net is core.js, at the rock pools.)
    acts: {
      mum: {jj_shore: {act: "kite", at: [330, 300], dir: -1}, jj_farms: {act: "kite", at: [300, 380]}},
      dad: {jj_village: {act: "luck", at: [238, 124], dir: -1}},
      mama: {jj_farms: {act: "pick", at: [150, 290], dir: -1}, jj_shed: {act: "pick", at: [140, 520]}},
      gonggong: {jj_harbour: {act: "nets", at: [352, 500], dir: -1}},
      darren: {jj_farms: {act: "stack", at: [176, 540], dir: -1}},
      marcus: {jj_shore: {act: "tandem", at: [400, 330], dir: -1}, jj_harbour: {act: "tandem", at: [400, 340], dir: 1}},
      angelina: {jj_shore: {act: "tandem", at: [440, 336], dir: -1}, jj_harbour: {act: "tandem", at: [440, 346], dir: 1}}
    },
    // round 128: the five interiors, behind the doors on the shore, the farms, the harbour and the village
    rooms: {
      jj_haenyeo: {door: "jjhaenyeo", n: "The divers' house", music: "jj_haenyeo", party: [[200, 560], [330, 560], [120, 520], [420, 540]],
        say: "The divers' house: a stone room warm from the stove, wetsuits and nets hung round the walls, orange floats stacked to the ceiling, and a pot of abalone porridge bubbling."},
      jj_shed: {door: "jjshed", n: "The packing shed", music: "jj_shed", party: [[200, 560], [330, 560], [120, 540], [420, 540]],
        say: "The packing shed: crates of tangerines everywhere, the sorting table down the middle, a radio playing, and the sweet sharp smell of peel."},
      jj_cafe: {door: "jjcafe", n: "The stone-house café", music: "jj_cafe", party: [[200, 540], [330, 560], [120, 520], [420, 520]],
        say: "The café: black stone walls, old wooden beams, low tables by a window full of sea, and a counter piled with tangerines."},
      jj_market: {door: "jjmarket", n: "The market hall", music: "jj_market", party: [[200, 480], [320, 480], [260, 560], [140, 420]],
        say: "The market hall: four stalls under strings of bulbs, grilled fish, sesame, seaweed hanging in sheets, and everyone offering you a tangerine."},
      jj_dye: {door: "jjdye", n: "The dye workshop", music: "jj_dye", party: [[200, 560], [330, 560], [120, 540], [420, 540]],
        say: "The dye workshop: tubs of crushed green persimmon, cloth hung from every beam in every shade from pale green to rust, and Mr Moon with orange hands."}
    },
    lines: {
      mum: ["The wind here! Hold on to your hat, Mel. Hold on to Evan.", "Black stone walls everywhere, with gaps in them. So the wind goes through and they never fall down. Clever.", "I'd like to see the sunrise from that crater. Not at five in the morning, though."],
      dad: ["Every one of those walls is dry stone. No mortar. Just balance.", "Look at the rope on those roofs, tied down in a net against the wind.", "The divers are out. Seventy years old, some of them, and they hold their breath for two minutes."],
      mama: ["Tangerines! Ma Ma want to know how they grow them so sweet.", "So much wind. Good for the washing.", "The divers, all grandmas. Strong grandmas. Ma Ma like this place."],
      gonggong: ["Fishing boats with lights all along. For the squid, at night.", "The sea here, very blue. Very cold, I think. Gong Gong won't check.", "Old stone, old trees, old men by the harbour. Gong Gong fits in."],
      darren: ["Everyone's piled little stone towers along the path. One for each wish, apparently.", "I've had a tangerine, a tangerine juice and a tangerine chocolate. Next: tangerine.", "Those ponies are tiny. And very confident."],
      marcus: ["The crater's a five-thousand-year-old volcano. And they put a café at the bottom.", "Zeh, those ribbons on the posts, blue and orange: that's the trail. Follow the ribbons.", "I could cycle round the whole island. Two hundred and fifty kilometres. I could. I won't."],
      angelina: ["Everything here is black and orange and blue. It's like it was designed.", "The stone statues have such kind faces. Like grandpas.", "I'm sending a postcard from here to myself. Is that weird? It's not weird."],
      evan: ["black rocks!", "oranges! oranges!", "windy windy!", "horsies!"]
    },
    say: {
      jjcone: "Seongsan, the sunrise peak: a crater left by an eruption under the sea, five thousand years ago, now a great green bowl with grass on the rim. People climb it in the dark to watch the sun come up out of the sea.",
      jjhaenyeo: "The divers' house: low black stone walls, a thatched roof, wetsuits drying on a line and orange floats stacked by the door. The haenyeo eat here after a dive.",
      jjpools: "The rock pools: black rock full of little pools, with sea snails, tiny crabs and green weed waving. The tide's going out.",
      jjorchard: "The tangerine orchards: rows of little trees heavy with fruit, each field behind a low black stone wall to keep the wind off.",
      jjshed: "The packing shed: blue roof, crates stacked up, and the sweet smell of tangerines.",
      jjponies: "Jeju ponies: small, sturdy and shaggy, grazing in the stone-walled field. They've lived on the island for hundreds of years.",
      jjcairns: "The wish-towers: little piles of black stones along the trail. Everyone who walks by adds one and makes a wish.",
      jjmarket: "The market hall: the smell of grilled fish and sesame, stalls of dried seaweed, tangerines and chocolate.",
      jjlights: "The horse lighthouses: two little lighthouses shaped like Jeju ponies, one red and one white, guarding the harbour mouth.",
      jjcafe: "The stone-house café: an old black stone house with a tangerine painted on the door.",
      jjdye: "The dye workshop: lengths of cloth drying in the sun, from pale green to deep rusty orange. They're dyed with green persimmon juice.",
      jjstatues: "The stone grandfathers (dol hareubang): carved from black volcanic rock, with big round eyes, hats and hands on their tummies. They keep the village safe."
    }
  },
  // Cinque Terre (rounds 131–134): five fishing villages on the cliffs of the Ligurian coast, painted every colour,
  // joined by a little coastal train and cliff paths, with vineyard terraces and lemon groves above. Four of the five
  // villages, one to a screen. The station's on the TOP RIGHT screen this time (Corniglia: at the foot of its long brick
  // staircase); every town has it somewhere different.
  //   ct_vernazza   | ct_corniglia   (the station, at the bottom of the steps)
  //   --------------+---------------
  //   ct_monterosso | ct_manarola
  cinque: {
    n: "Cinque Terre", by: "train", fare: 80, free: ["evan"], outFrom: 7*60, outTo: 15*60, backTo: 22*60,
    screens: ["ct_vernazza", "ct_corniglia", "ct_monterosso", "ct_manarola"], arrive: ["ct_corniglia", [370, 548]], station: "cttrain", music: "cinque",
    blurb: "Five fishing villages clinging to the cliffs over a very blue sea: houses painted every colour, fishing boats, vineyard terraces, lemon groves, focaccia and pesto. A long ride: trains out until 3pm.",
    arriveLine: "Cinque Terre! The train pops out of a tunnel onto a platform over the sea. Above you, the long brick staircase climbs up to Corniglia, and the air smells of lemons and salt.",
    evanArrive: ["SO many steps, Mama!", "the sea is SO blue", "pink house! yellow house!"],
    evanScreen: {ct_vernazza: ["a castle tower!", "little boats!"], ct_corniglia: ["grapes up high!", "a tiny train up the hill!"], ct_monterosso: ["the BEACH!", "umbrellas! stripy!"], ct_manarola: ["boats on the street!", "houses on a rock!"]},
    hints: {ct_vernazza: "Vernazza: the little harbour, the watchtower, the piazza and the focacceria. East: Corniglia. South: Monterosso.",
      ct_corniglia: "Corniglia, high on the cliff: the vineyard terraces, the monorail, the cantina, and the station at the bottom of the steps (trains home till 10pm). West: Vernazza. South: Manarola.",
      ct_monterosso: "Monterosso: the beach and its umbrellas, the old town, the giant on the rocks, the lemon shop. North: Vernazza. East: Manarola.",
      ct_manarola: "Manarola: the houses on the rock, the boats in the street, the pesto kitchen, the gelateria, the swimming rocks. North: Corniglia. West: Monterosso."},
    spots: {
      mum: {ct_vernazza: [[300, 300], [360, 460]], ct_corniglia: [[260, 360], [200, 460]], ct_monterosso: [[300, 300], [380, 460]], ct_manarola: [[260, 360], [320, 470]]},
      dad: {ct_vernazza: [[260, 330], [400, 440]], ct_corniglia: [[300, 330], [220, 420]], ct_monterosso: [[260, 330], [420, 300]], ct_manarola: [[300, 330], [240, 440]]},
      mama: {ct_vernazza: [[330, 330], [300, 440]], ct_corniglia: [[240, 380], [300, 460]], ct_monterosso: [[330, 280], [260, 360]], ct_manarola: [[280, 380], [330, 460]]},
      gonggong: {ct_vernazza: [[330, 380], [340, 390]], ct_corniglia: [[260, 420], [270, 430]], ct_monterosso: [[300, 330], [310, 340]], ct_manarola: [[290, 420], [300, 430]]},
      darren: {ct_vernazza: [[400, 330], [280, 480]], ct_corniglia: [[330, 300], [200, 360]], ct_monterosso: [[420, 330], [280, 300]], ct_manarola: [[330, 300], [260, 470]]},
      marcus: {ct_vernazza: [[420, 480], [260, 300]], ct_corniglia: [[280, 460], [340, 380]], ct_monterosso: [[440, 300], [260, 380]], ct_manarola: [[420, 480], [260, 330]]},
      angelina: {ct_vernazza: [[440, 300], [300, 360]], ct_corniglia: [[240, 330], [300, 420]], ct_monterosso: [[300, 400], [360, 300]], ct_manarola: [[440, 330], [300, 360]]}
    },
    // what they do (round 134, nothing they did in Ronda, Kyoto or Jeju): Mum sunbathes on the Manarola rocks, Dad fishes
    // off the Vernazza harbour, Ma Ma knits, Gong Gong plays bocce with Nino, Darren hikes with poles, Marcus rows,
    // Angellina reads under a beach umbrella. (Evan's sandcastle is core.js, on Monterosso beach.)
    acts: {
      mum: {ct_manarola: {act: "sunbathe", at: [24, 528]}},
      dad: {ct_vernazza: {act: "fish", at: [214, 392], dir: -1}},
      mama: {ct_corniglia: {act: "knit", at: [404, 318], dir: -1}, ct_monterosso: {act: "knit", at: [430, 300], dir: -1}},
      gonggong: {ct_vernazza: {act: "bocce", at: [350, 500], dir: -1}},
      darren: {ct_corniglia: {act: "poles", at: [196, 400]}, ct_vernazza: {act: "poles", at: [210, 290], dir: -1}},
      marcus: {ct_monterosso: {act: "row", at: [370, 600], dir: -1, free: true}},
      angelina: {ct_monterosso: {act: "read", at: [152, 474], dir: -1}}
    },
    // round 132: the five interiors, behind the doors in Vernazza, Corniglia, Monterosso and Manarola
    rooms: {
      ct_focacceria: {door: "ctfocacceria", n: "The focacceria", music: "ct_focacceria", party: [[200, 560], [330, 560], [120, 520], [420, 540]],
        say: "The focacceria: the wood oven roaring at the back, trays of focaccia glistening with oil and salt, and a queue out of the door."},
      ct_pesto: {door: "ctpesto", n: "The pesto kitchen", music: "ct_pesto", party: [[200, 560], [330, 560], [120, 540], [420, 540]],
        say: "The pesto kitchen: a long marble table, mortars in a row, bunches of basil hanging from the beams, and the whole room smelling green."},
      ct_cantina: {door: "ctcantina", n: "The cantina", music: "ct_cantina", party: [[200, 560], [330, 560], [120, 540], [420, 540]],
        say: "The cantina: cool and dim, barrels along the walls, and racks of grapes drying slowly into raisins for the sweet wine."},
      ct_gelato: {door: "ctgelato", n: "The gelateria", music: "ct_gelato", party: [[200, 540], [330, 560], [120, 520], [420, 520]],
        say: "The gelateria: a long glass counter of gelato in every colour, basil green and lemon yellow and fig purple, and little stools by the window."},
      ct_limoni: {door: "ctlimoni", n: "The lemon shop", music: "ct_limoni", party: [[200, 540], [330, 560], [120, 540], [420, 540]],
        say: "The lemon shop: crates of lemons, bottles of limoncino glowing yellow, lemon soap, linen with lemons on, painted plates, and tins of anchovies."}
    },
    lines: {
      mum: ["Every house a different colour, so the fishermen could find theirs from the sea. That's the story.", "I'm going to lie on those rocks and not move until dinner.", "Lemons the size of my fist! Look!"],
      dad: ["They built those terraces by hand. Thousands of miles of dry stone walls, over a thousand years.", "The tide doesn't come in much here. Good fishing off the wall.", "I'd paint this. If I painted. Which I don't. Any more."],
      mama: ["The nonnas here sit and knit and watch everybody. Ma Ma understands this completely.", "Basil this big! Ma Ma's basil never this big.", "So many steps. Ma Ma counted, then Ma Ma stopped counting."],
      gonggong: ["Old men playing bocce. Gong Gong knows this game. Gong Gong is good at this game.", "Quiet in the afternoon. Everybody sleeping. Very civilised.", "The little train goes in a tunnel, out a tunnel, in a tunnel. Gong Gong likes it."],
      darren: ["The cliff path's a proper hike. Two hours, they said. I said one.", "Focaccia for breakfast. Focaccia for lunch. That's the plan.", "Three hundred and eighty-two steps up from the station. I counted. Mel, don't."],
      marcus: ["Zeh, they pull the boats right up into the street. Into the STREET.", "I'm renting a rowing boat. How hard can it be. Don't answer that.", "The water's so clear you can see the fish."],
      angelina: ["I've found the perfect umbrella and I'm never leaving it.", "Everything here tastes of lemon and sunshine.", "The houses look like a box of crayons someone dropped down a cliff."],
      evan: ["boats! boats!", "the sea is BLUE", "steps steps steps", "ice cream?"]
    },
    say: {
      cttower: "The watchtower: a round stone tower on the rocks, built a thousand years ago to watch for pirates. Now it watches for ferries.",
      ctpiazza: "The piazza: café umbrellas, the church right on the water, old men playing bocce, and everyone eating focaccia.",
      ctharbour: "The little harbour: fishing boats painted blue and red and green, nosed up on the slipway, and kids jumping off the harbour wall.",
      ctterraces: "The vineyard terraces: narrow stripes of vines held up by dry stone walls, climbing straight up the cliff. Every grape is carried down by hand, or on the little monorail.",
      ctmonorail: "The monorail: a tiny rack train on one rail that putters up the terraces, carrying crates of grapes.",
      ctlemons: "The lemon grove: knobbly old trees heavy with lemons, under nets to keep the wind off.",
      ctgigante: "The giant: a huge stone figure carved into the rocks at the end of the beach, holding up a terrace that's long gone. He looks a bit tired.",
      ctbeach: "The beach: the only proper sandy beach in the five villages, with rows of striped umbrellas and the sea so clear you can count the pebbles.",
      ctboats: "The boats: little wooden fishing boats pulled right up into the main street on their trailers, painted every colour.",
      ctrocks: "The swimming rocks: smooth flat rocks below the houses, where everyone lies in the sun and jumps into the deep blue water.",
      ctpadlock: "The lovers' path railing: hundreds of padlocks, each with two names. The sea goes on and on below."
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
  kt_tea: {scene: "kt_lane", name: "The tea house", door: [114, 188]}, kt_sweets: {scene: "kt_lane", name: "The sweet shop", door: [420, 440]},
  kt_pottery: {scene: "kt_lane", name: "The pottery", door: [110, 536]}, kt_hall: {scene: "kt_temple", name: "The temple hall", door: [375, 192]},
  kt_market: {scene: "kt_river", name: "The covered market", door: [145, 190]},
  // Jeju (round 127): every id starts with jj
  jjtrain: {scene: "jj_village", name: "Jeju station", door: [404, 562], spot: true, mark: [420, 452], line: "Jeju's little station, where the sea bridge comes in. Trains home to Honeybrook until 10pm."},
  jjcafe: {scene: "jj_village", name: "The stone-house café", door: [112, 186], spot: true, mark: [112, 56], line: "The café."},
  jjdye: {scene: "jj_village", name: "The dye workshop", door: [410, 352], spot: true, mark: [410, 222], line: "The dye workshop."},
  jjstatues: {scene: "jj_village", name: "The stone grandfathers", door: [262, 120], spot: true, mark: [262, 40], line: "The stone grandfathers."},
  jjToFarmsN: {scene: "jj_village", name: "To the farms", door: [262, 40], spot: true, bridge: "jj_farms", mark: [200, 30], line: "North between the stone grandfathers to the tangerine farms."},
  jjToHarbourW: {scene: "jj_village", name: "To the harbour", door: [16, 400], spot: true, bridge: "jj_harbour", mark: [40, 340], line: "West down to the harbour."},
  jjcone: {scene: "jj_shore", name: "Seongsan, the sunrise peak", door: [150, 226], spot: true, mark: [120, 40], line: "The sunrise peak."},
  jjhaenyeo: {scene: "jj_shore", name: "The divers' house", door: [404, 190], spot: true, mark: [404, 60], line: "The divers' house."},
  jjpools: {scene: "jj_shore", name: "The rock pools", door: [214, 470], spot: true, mark: [120, 380], line: "The rock pools."},
  jjToFarms: {scene: "jj_shore", name: "To the farms", door: [504, 330], spot: true, bridge: "jj_farms", mark: [476, 270], line: "East along the Olle trail to the tangerine farms."},
  jjToHarbour: {scene: "jj_shore", name: "To the harbour", door: [300, 612], spot: true, bridge: "jj_harbour", mark: [300, 540], line: "South along the coast to the harbour."},
  jjorchard: {scene: "jj_farms", name: "The tangerine orchards", door: [150, 288], spot: true, mark: [130, 120], line: "The tangerine orchards."},
  jjshed: {scene: "jj_farms", name: "The packing shed", door: [396, 186], spot: true, mark: [396, 60], line: "The packing shed."},
  jjponies: {scene: "jj_farms", name: "The ponies", door: [396, 408], spot: true, mark: [420, 470], line: "The ponies."},
  jjcairns: {scene: "jj_farms", name: "The wish-towers", door: [150, 548], spot: true, mark: [130, 470], line: "The wish-towers."},
  jjToShore: {scene: "jj_farms", name: "To the shore", door: [16, 330], spot: true, bridge: "jj_shore", mark: [40, 270], line: "West along the trail to the shore and the crater."},
  jjToVillage: {scene: "jj_farms", name: "To the village", door: [262, 612], spot: true, bridge: "jj_village", mark: [262, 540], line: "South down the lane to the stone village."},
  jjpier: {scene: "jj_harbour", name: "The ferry pier", door: [214, 424], spot: true, mark: [110, 350], line: "The ferry pier. Ferries home to Honeybrook until 10pm."},
  jjlights: {scene: "jj_harbour", name: "The horse lighthouses", door: [150, 560], spot: true, mark: [100, 480], line: "The horse lighthouses."},
  jjmarket: {scene: "jj_harbour", name: "The market hall", door: [396, 190], spot: true, mark: [396, 60], line: "The market hall."},
  jjToShoreN: {scene: "jj_harbour", name: "To the shore", door: [300, 26], spot: true, bridge: "jj_shore", mark: [240, 30], line: "North up the coast to the shore and the crater."},
  jj_haenyeo: {scene: "jj_shore", name: "The divers' house", door: [404, 190]}, jj_shed: {scene: "jj_farms", name: "The packing shed", door: [396, 186]},
  jj_cafe: {scene: "jj_village", name: "The stone-house café", door: [112, 186]}, jj_market: {scene: "jj_harbour", name: "The market hall", door: [396, 190]},
  jj_dye: {scene: "jj_village", name: "The dye workshop", door: [410, 352]},
  jjToVillageE: {scene: "jj_harbour", name: "To the village", door: [504, 400], spot: true, bridge: "jj_village", mark: [476, 340], line: "East up into the stone village."},
  // Cinque Terre (round 131): every id starts with ct
  cttrain: {scene: "ct_corniglia", name: "Corniglia station", door: [384, 540], spot: true, mark: [400, 450], line: "Corniglia's station, down by the sea. Trains home to Honeybrook until 10pm."},
  ctcantina: {scene: "ct_corniglia", name: "The cantina", door: [112, 352], spot: true, mark: [112, 230], line: "The cantina."},
  ctmonorail: {scene: "ct_corniglia", name: "The monorail", door: [330, 244], spot: true, mark: [380, 120], line: "The monorail."},
  ctterraces: {scene: "ct_corniglia", name: "The vineyard terraces", door: [200, 210], spot: true, mark: [160, 80], line: "The vineyard terraces."},
  ctlemons: {scene: "ct_corniglia", name: "The lemon grove", door: [440, 330], spot: true, mark: [460, 250], line: "The lemon grove."},
  ctToVernazza: {scene: "ct_corniglia", name: "To Vernazza", door: [16, 440], spot: true, bridge: "ct_vernazza", mark: [40, 380], line: "West along the cliff path to Vernazza."},
  ctToManarola: {scene: "ct_corniglia", name: "To Manarola", door: [160, 612], spot: true, bridge: "ct_manarola", mark: [160, 540], line: "South along the coast to Manarola."},
  ctfocacceria: {scene: "ct_vernazza", name: "The focacceria", door: [394, 196], spot: true, mark: [394, 60], line: "The focacceria."},
  cttower: {scene: "ct_vernazza", name: "The watchtower", door: [150, 262], spot: true, mark: [110, 120], line: "The watchtower."},
  ctpiazza: {scene: "ct_vernazza", name: "The piazza", door: [300, 360], spot: true, mark: [300, 280], line: "The piazza."},
  ctharbour: {scene: "ct_vernazza", name: "The harbour", door: [190, 470], spot: true, mark: [110, 470], line: "The harbour."},
  ctToCorniglia: {scene: "ct_vernazza", name: "To Corniglia", door: [504, 340], spot: true, bridge: "ct_corniglia", mark: [476, 280], line: "East along the cliff path to Corniglia."},
  ctToMonterosso: {scene: "ct_vernazza", name: "To Monterosso", door: [330, 612], spot: true, bridge: "ct_monterosso", mark: [330, 540], line: "South along the coast to Monterosso."},
  ctlimoni: {scene: "ct_monterosso", name: "The lemon shop", door: [396, 196], spot: true, mark: [396, 60], line: "The lemon shop."},
  ctgigante: {scene: "ct_monterosso", name: "The giant", door: [440, 440], spot: true, mark: [470, 380], line: "The giant."},
  ctbeach: {scene: "ct_monterosso", name: "The beach", door: [230, 470], spot: true, mark: [200, 520], line: "The beach."},
  ctToVernazzaN: {scene: "ct_monterosso", name: "To Vernazza", door: [300, 26], spot: true, bridge: "ct_vernazza", mark: [240, 30], line: "North up the coast to Vernazza."},
  ctToManarolaE: {scene: "ct_monterosso", name: "To Manarola", door: [504, 330], spot: true, bridge: "ct_manarola", mark: [476, 270], line: "East along the coast to Manarola."},
  ctpesto: {scene: "ct_manarola", name: "The pesto kitchen", door: [140, 196], spot: true, mark: [140, 60], line: "The pesto kitchen."},
  ctgelato: {scene: "ct_manarola", name: "The gelateria", door: [420, 352], spot: true, mark: [420, 230], line: "The gelateria."},
  ctboats: {scene: "ct_manarola", name: "The boats", door: [262, 380], spot: true, mark: [262, 300], line: "The boats."},
  ctrocks: {scene: "ct_manarola", name: "The swimming rocks", door: [110, 520], spot: true, mark: [80, 470], line: "The swimming rocks."},
  ctpadlock: {scene: "ct_manarola", name: "The lovers' path", door: [236, 486], spot: true, mark: [236, 430], line: "The lovers' path."},
  ctToCornigliaN: {scene: "ct_manarola", name: "To Corniglia", door: [262, 26], spot: true, bridge: "ct_corniglia", mark: [200, 30], line: "North up the coast to Corniglia."},
  ct_focacceria: {scene: "ct_vernazza", name: "The focacceria", door: [394, 196]}, ct_pesto: {scene: "ct_manarola", name: "The pesto kitchen", door: [140, 196]},
  ct_cantina: {scene: "ct_corniglia", name: "The cantina", door: [112, 352]}, ct_gelato: {scene: "ct_manarola", name: "The gelateria", door: [420, 352]},
  ct_limoni: {scene: "ct_monterosso", name: "The lemon shop", door: [396, 196]},
  ctToMonterossoW: {scene: "ct_manarola", name: "To Monterosso", door: [16, 330], spot: true, bridge: "ct_monterosso", mark: [40, 270], line: "West along the coast to Monterosso."},
  rdStepsUp: {scene: "rd_old", name: "Steps up out of the gorge", door: [120, 40], spot: true, bridge: "rd_station", mark: [200, 30], line: "Down into the gorge, over the old bridge and up the steps to the new town."}
};
export const TOWN_BRIDGES = {rd_station: {rd_plaza: "rdToPlaza", rd_old: "rdStepsDown"}, rd_plaza: {rd_station: "rdToStation", rd_bridge: "rdBridgeN"},
  rd_bridge: {rd_plaza: "rdBridgeS", rd_old: "rdToOld"}, rd_old: {rd_bridge: "rdToBridge", rd_station: "rdStepsUp"},
  kt_station: {kt_lane: "ktToLane", kt_river: "ktToRiver"}, kt_lane: {kt_station: "ktToStation", kt_temple: "ktStepsDown"},
  kt_temple: {kt_lane: "ktStepsUp", kt_river: "ktToRiverW"}, kt_river: {kt_station: "ktToStationN", kt_temple: "ktToTemple"},
  jj_shore: {jj_farms: "jjToFarms", jj_harbour: "jjToHarbour"}, jj_farms: {jj_shore: "jjToShore", jj_village: "jjToVillage"},
  jj_harbour: {jj_shore: "jjToShoreN", jj_village: "jjToVillageE"}, jj_village: {jj_farms: "jjToFarmsN", jj_harbour: "jjToHarbourW"},
  ct_vernazza: {ct_corniglia: "ctToCorniglia", ct_monterosso: "ctToMonterosso"}, ct_corniglia: {ct_vernazza: "ctToVernazza", ct_manarola: "ctToManarola"},
  ct_monterosso: {ct_vernazza: "ctToVernazzaN", ct_manarola: "ctToManarolaE"}, ct_manarola: {ct_corniglia: "ctToCornigliaN", ct_monterosso: "ctToMonterossoW"}};
export const TOWN_ARRIVE = {"rd_station>rd_plaza": [44, 330], "rd_plaza>rd_station": [474, 300], "rd_plaza>rd_bridge": [310, 60], "rd_bridge>rd_plaza": [330, 572],
  "rd_bridge>rd_old": [476, 380], "rd_old>rd_bridge": [44, 520], "rd_station>rd_old": [130, 76], "rd_old>rd_station": [180, 566],
  "kt_station>kt_lane": [44, 300], "kt_lane>kt_station": [474, 300], "kt_station>kt_river": [300, 76], "kt_river>kt_station": [330, 576],
  "kt_lane>kt_temple": [150, 80], "kt_temple>kt_lane": [330, 576], "kt_temple>kt_river": [474, 520], "kt_river>kt_temple": [44, 380],
  "jj_shore>jj_farms": [44, 330], "jj_farms>jj_shore": [474, 330], "jj_shore>jj_harbour": [300, 70], "jj_harbour>jj_shore": [300, 572],
  "jj_farms>jj_village": [262, 84], "jj_village>jj_farms": [262, 572], "jj_harbour>jj_village": [44, 400], "jj_village>jj_harbour": [474, 400],
  "ct_vernazza>ct_corniglia": [44, 440], "ct_corniglia>ct_vernazza": [474, 340], "ct_vernazza>ct_monterosso": [300, 70], "ct_monterosso>ct_vernazza": [330, 572],
  "ct_corniglia>ct_manarola": [262, 70], "ct_manarola>ct_corniglia": [160, 572], "ct_monterosso>ct_manarola": [44, 330], "ct_manarola>ct_monterosso": [474, 330]};
// walking areas, and what's in the way (paths.js)
export const TOWN_BOUNDS = {ct_focacceria: [30, 250, 490, 600], ct_pesto: [30, 250, 490, 600], ct_cantina: [30, 250, 490, 600], ct_gelato: [30, 250, 490, 600], ct_limoni: [30, 250, 490, 600],
  ct_vernazza: [14, 200, 506, 616], ct_corniglia: [14, 200, 506, 600], ct_monterosso: [14, 26, 506, 540], ct_manarola: [14, 26, 506, 616],
  jj_haenyeo: [30, 250, 490, 600], jj_shed: [30, 250, 490, 600], jj_cafe: [30, 250, 490, 600], jj_market: [30, 240, 490, 600], jj_dye: [30, 250, 490, 600],
  jj_shore: [14, 200, 506, 616], jj_farms: [14, 190, 506, 616], jj_harbour: [14, 26, 506, 616], jj_village: [14, 40, 506, 590],
  kt_tea: [30, 250, 490, 600], kt_hall: [30, 250, 490, 600], kt_sweets: [30, 260, 490, 600], kt_market: [30, 240, 490, 600], kt_pottery: [30, 250, 490, 600],
  kt_station: [140, 178, 506, 616], kt_lane: [14, 180, 506, 616], kt_temple: [14, 40, 506, 616], kt_river: [14, 40, 506, 616],
  rd_cuero: [30, 250, 490, 600], rd_tapas: [30, 250, 490, 600], rd_cafe: [30, 260, 490, 600], rd_banos: [30, 220, 490, 600], rd_jardin: [30, 176, 490, 606], rd_mercado: [30, 250, 490, 600],
  rd_station: [90, 178, 506, 616], rd_plaza: [14, 180, 506, 616], rd_bridge: [14, 22, 506, 616], rd_old: [14, 36, 506, 616]};
export const TOWN_OBST = {
  // Cinque Terre: the houses, the sea, the tower and the church; the terraces, the cantina, the station; the old town and
  // the sea; the houses on the rock and the harbour water
  // Cinque Terre's rooms (round 132): the oven and counter; the marble table; the barrels and racks; the counter; the shelves
  ct_focacceria: [[300, 230, 500, 330], [30, 250, 110, 420], [180, 420, 340, 470]], ct_pesto: [[140, 330, 380, 400], [30, 250, 90, 420], [430, 250, 490, 420]],
  ct_cantina: [[30, 250, 110, 500], [410, 250, 490, 500], [180, 280, 340, 330]], ct_gelato: [[120, 230, 400, 300], [40, 470, 120, 510], [400, 470, 480, 510]],
  ct_limoni: [[30, 250, 100, 500], [420, 250, 490, 500], [180, 380, 340, 430]],
  ct_vernazza: [[0, 0, 240, 250], [330, 60, 510, 180], [0, 500, 170, 640], [430, 380, 520, 560]],
  ct_corniglia: [[0, 0, 520, 190], [30, 240, 196, 340], [300, 440, 510, 530], [0, 600, 120, 640]],
  ct_monterosso: [[30, 60, 230, 180], [330, 60, 490, 180], [0, 560, 520, 640], [470, 400, 520, 480]],
  ct_manarola: [[40, 60, 240, 180], [330, 60, 520, 180], [330, 230, 510, 340], [0, 560, 200, 640], [310, 440, 520, 640]],
  // Jeju: the crater, the divers' house, the rock pools; the orchards, the shed, the paddock; the sea, the ferry, the
  // lighthouses, the market; the café, the dye workshop, the station and the rails
  // Jeju's rooms (round 128): the stove and the porridge table; the sorting table; the café tables; the four stalls; the tubs
  jj_haenyeo: [[300, 300, 470, 360], [30, 260, 100, 420], [420, 430, 490, 520], [466, 232, 514, 390], [40, 455, 100, 510]],
  jj_shed: [[150, 340, 370, 400], [30, 470, 110, 560], [420, 470, 500, 560], [24, 250, 64, 400], [462, 250, 504, 440], [120, 220, 170, 340]],
  jj_cafe: [[80, 330, 140, 362], [380, 330, 440, 362], [80, 470, 140, 502], [380, 470, 440, 502]],
  jj_market: [[30, 250, 130, 300], [390, 250, 490, 300], [30, 380, 130, 430], [390, 380, 490, 430]], jj_dye: [[150, 330, 250, 380], [300, 330, 400, 380], [30, 460, 100, 540], [24, 240, 116, 430], [416, 290, 490, 342]],
  jj_shore: [[0, 0, 256, 214], [330, 70, 486, 180], [24, 380, 190, 520], [0, 214, 60, 640]],
  jj_farms: [[20, 50, 264, 270], [320, 60, 476, 176], [330, 420, 506, 572], [60, 500, 120, 540]],
  jj_harbour: [[0, 0, 150, 330], [0, 450, 190, 640], [0, 330, 110, 450], [314, 66, 486, 180], [190, 610, 520, 640]],
  jj_village: [[26, 66, 202, 176], [326, 238, 494, 344], [336, 460, 504, 552], [300, 592, 520, 640], [200, 70, 228, 112], [296, 70, 324, 112], [36, 250, 166, 336], [26, 450, 166, 542]],
  kt_tea: [[300, 340, 460, 420]], kt_hall: [[180, 190, 340, 240], [396, 396, 500, 470], [36, 400, 134, 460]], kt_sweets: [[290, 190, 490, 250], [40, 380, 120, 430]],
  kt_market: [[30, 250, 130, 300], [390, 250, 490, 300], [30, 380, 130, 430], [390, 380, 490, 430]], kt_pottery: [[120, 300, 200, 350], [330, 200, 480, 250]],
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
  // (round 120, raised in round 130: oil sells for 16, more than the three jars of olives it takes (9); Rafael's is 18, so there's no
  // buying it in Ronda to sell at home)
  oliveoil: {n: "Olive oil", kind: "ingredient", price: 18, sell: 16, shop: "mercado", art: ["bottle", "#B9B04A"], what: "Rafael's family oil, from Ronda: salmorejo, ajo blanco, bread with oil"},
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
  // round 122: Kyoto's goods. Ingredients go to the Scoop Shack (gelato), the Cocoa Room (bonbon fillings) and the
  // kitchen (Kyoto tapas); the rest are gifts, or keepsakes for a shelf at home
  yuzu: {n: "Yuzu", kind: "ingredient", price: 5, sell: 2, shop: "kt_market", art: ["apple", "#F3D34A", "#7FA35A"], what: "from Kyoto's market: yuzu gelato or bonbons, cold tofu with yuzu at the kitchen"},
  miso: {n: "White miso", kind: "ingredient", price: 6, sell: 2, shop: "kt_market", art: ["jar", "#F3E7C8", "#C9A27E"], what: "sweet Kyoto miso: miso-glazed fish at the kitchen"},
  tofu: {n: "Fresh tofu", kind: "ingredient", price: 4, sell: 1, shop: "kt_market", art: ["box", "#FFFDF6", "#E6DED0"], what: "silky Kyoto tofu: cold tofu with yuzu at the kitchen"},
  mochi: {n: "Mochi", kind: "ingredient", price: 4, sell: 1, shop: "kt_sweets", art: ["disc", "#FFFDF6", "#F6C7D6"], what: "soft rice cakes: mochi gelato, mochi with honey at the kitchen"},
  hojicha: {n: "Hōjicha", kind: "ingredient", price: 5, sell: 2, shop: "kt_tea", art: ["bag", "#8A5A3A", "#C9A27E"], what: "roasted green tea: hōjicha gelato or bonbons"},
  sakura: {n: "Salted sakura blossoms", kind: "ingredient", price: 6, sell: 2, shop: "kt_sweets", art: ["jar", "#F6C7D6", "#F2A0B8"], what: "pickled cherry blossoms: sakura gelato or bonbons"},
  matcha: {n: "Matcha powder", kind: "ingredient", price: 6, sell: 2, shop: "kt_tea", art: ["bag", "#8FB86A", "#5E8A48"], what: "ceremonial matcha from the tea house: gelato, bonbons"},
  shichimi: {n: "Shichimi spice", kind: "gift", to: ["dad", "gonggong", "darren"], price: 6, shop: "kt_market", art: ["bottle", "#C8432F", "#F3E7C8"], say: "Seven-spice pepper from Kyoto! Everything's getting some of this."},
  hocho: {n: "Kyoto kitchen knife", kind: "gift", to: ["dad", "mama", "marcus"], price: 40, shop: "kt_market", art: ["roll", "#BFC3CA", "#5A3A2A"], say: "A proper Kyoto knife, folded steel! I'll guard it with my life."},
  wagashibox: {n: "Box of wagashi", kind: "gift", to: "family", price: 8, shop: "kt_sweets", art: ["box", "#F6C7D6", "#9CC27E"], say: "Little sweets shaped like flowers! Too pretty to eat. Almost."},
  furoshiki: {n: "Furoshiki cloth", kind: "gift", to: ["mum", "mama", "angelina"], price: 9, shop: "ktyukata", art: ["cloth", "#3E5E7A", "#F3C969"], say: "A furoshiki! For wrapping presents, or my lunch. Or both."},
  sensu: {n: "Folding fan", kind: "gift", to: "family", price: 11, shop: "ktyukata", art: ["cloth", "#F3ECDD", "#C8432F"], say: "A folding fan with cranes on it. Very elegant."},
  k_chawan: {n: "Tea bowl", kind: "keepsake", price: 20, shop: "kt_tea", art: ["disc", "#5E7A4A", "#C9A27E"], line: "A rough, beautiful tea bowl from the tea house in Kyoto. Made to be held in two hands."},
  k_tetsubin: {n: "Cast-iron teapot", kind: "keepsake", price: 30, shop: "kt_tea", art: ["jar", "#3A3430", "#5A4636"], line: "A heavy cast-iron teapot from Kyoto, bumpy like a hailstone. It keeps tea hot for an hour."},
  k_maneki: {n: "Lucky cat", kind: "keepsake", price: 12, shop: "kt_pottery", art: ["cat", "#FFFDF6"], line: "A little white lucky cat from Kyoto, one paw up, waving fortune in."},
  k_furin: {n: "Wind chime", kind: "keepsake", price: 10, shop: "kt_pottery", art: ["bell", "#BFE0F2"], line: "A glass wind chime from Kyoto, painted with a goldfish. It tinkles in the smallest breeze."},
  k_daruma: {n: "Daruma doll", kind: "keepsake", price: 8, shop: "kt_pottery", art: ["disc", "#C8432F", "#FFFDF6"], line: "A round red daruma from Kyoto. Paint one eye when you start something big, the other when it's done."},
  k_cranes: {n: "String of paper cranes", kind: "keepsake", price: 0, art: ["crane", "#F2A0B8"], line: "A string of paper cranes Ma Ma folded in Kyoto, one for each of the family. Make a wish."},
  k_mycup: {n: "Your Kyoto teacup", kind: "keepsake", price: 0, art: ["disc", "#3E5E7A", "#C9A27E"], line: "A teacup you threw on the wheel and glazed yourself at the pottery in Kyoto. A little wonky. Perfect."},
  k_dadcup: {n: "Dad's lopsided cup", kind: "keepsake", price: 0, art: ["disc", "#8A6A52", "#C9A27E"], line: "Dad's teacup from the Kyoto pottery. It leans. He says it's 'expressive'."},
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
// souvenirs that can be kept instead of given: the backpack's gift picker offers "Keep it", and they go on a shelf
// (companions.js KEEP_SPOTS) with this line on their card. The magnet goes on the fridge at home.
const KEEP_LINES = {
  abanico: "A painted fan from Ronda, red and gold.", corcho: "Cork coasters from the cork oaks outside Ronda.", encaje: "A black lace fan from the postcard stall in Ronda.",
  cuenco: "A hand-painted bowl from Ronda, blue and yellow like the tiles.", aceitera: "A little olive dish from Ronda, with a pit for the stones.", jarra: "A painted jug from Ronda, just right for garden flowers.",
  postal: "A postcard of the Puente Nuevo in Ronda.", iman: "A little white house with a red roof, from Ronda.",
  cartera: "A leather wallet, hand-stitched in Ubrique.", bolso: "A leather handbag from Ubrique, via Ronda's leather workshop.", cinturon: "A hand-stitched leather belt from Ubrique.",
  libreta: "A leather notebook from Ubrique.", llavero: "A leather keyring with the bridge stamped on it.",
  furoshiki: "A furoshiki cloth from Kyoto, indigo and gold.", sensu: "A folding fan from Kyoto, with cranes on it.", hocho: "A Kyoto kitchen knife, folded steel."
};
Object.entries(KEEP_LINES).forEach(([id, line]) => Object.assign(TOWN_GOODS[id], {keep: true, line}));
TOWN_GOODS.iman.magnet = true;
// Jeju's goods (round 128), by room: the market hall, the divers' house, the packing shed, the café, the dye workshop.
// Tangerines are a real orchard fruit (data/orchard.js TREES.tangerine), so they also make gelato and bonbons.
Object.assign(TOWN_GOODS, {
  tangerine: {n: "Tangerines", kind: "food", price: 4, sell: 3, shop: "jj_market", art: ["apple", "#F29A2E", "#4E7A3A"], what: "Jeju's sweet little tangerines: gelato, bonbons, black pork with tangerine glaze"},
  hallabong: {n: "Hallabong", kind: "ingredient", price: 7, sell: 4, shop: "jj_market", art: ["apple", "#F28C28", "#5E8A3A"], what: "the big tangerine with the bumpy top-knot: gelato, bonbons, hallabong with omija syrup"},
  omija: {n: "Omija berries", kind: "ingredient", price: 6, sell: 3, shop: "jj_market", art: ["jar", "#C8324A", "#F3ECDD"], what: "five-flavour berries (sweet, sour, salty, bitter, spicy): gelato, bonbons, hallabong with omija"},
  blackpork: {n: "Jeju black pork", kind: "ingredient", price: 9, sell: 5, shop: "jj_market", art: ["box", "#C9877A", "#3A3430"], what: "from the island's black pigs: black pork with tangerine glaze at the kitchen"},
  j_choco: {n: "Tangerine chocolates", kind: "gift", to: "family", price: 8, shop: "jj_market", art: ["box", "#F29A2E", "#5A3A2A"], say: "Chocolates shaped like little tangerines! Is it orange inside? It IS."},
  j_hareubang: {n: "Stone grandfather", kind: "keepsake", price: 12, shop: "jj_market", art: ["disc", "#5F5E64", "#7A7980"], line: "A little stone grandfather (dol hareubang) carved from Jeju's black volcanic rock: hat, big eyes, hands on his tummy. He keeps the house safe."},
  j_magnet: {n: "Jeju fridge magnet", kind: "gift", to: "family", price: 3, shop: "jj_market", art: ["disc", "#F29A2E", "#4A494E"], say: "A tiny stone grandfather holding a tangerine. For the fridge!"},
  abalone: {n: "Abalone", kind: "ingredient", price: 10, sell: 6, shop: "jj_haenyeo", art: ["disc", "#8A9A8A", "#C9B8C8"], what: "brought up by the divers: abalone with garlic butter at the kitchen"},
  j_tewak: {n: "Diver's float", kind: "keepsake", price: 10, shop: "jj_haenyeo", art: ["disc", "#F08A2E", "#3A3430"], line: "An orange diving float (tewak) from the divers' house in Jeju. The divers rest on them between dives, and tie their nets underneath."},
  j_shell: {n: "Sea snail shell", kind: "keepsake", price: 0, art: ["disc", "#E6D3B8", "#B98A5A"], line: "A spiral sea snail shell from the divers in Jeju. Halmang Kim gave it to Evan. Hold it to your ear."},
  j_box: {n: "A box of tangerines", kind: "gift", to: ["mama", "gonggong", "mum", "dad"], price: 10, shop: "jj_shed", art: ["box", "#C9A27E", "#F29A2E"], say: "A whole box of Jeju tangerines! The leaves still on. These will be gone by Tuesday."},
  j_jam: {n: "Tangerine marmalade", kind: "gift", to: ["mama", "dad", "darren"], price: 6, shop: "jj_shed", art: ["jar", "#F29A2E", "#FFFDF6"], say: "Tangerine marmalade! On toast. On everything."},
  j_tea: {n: "Green tea from the slopes", kind: "gift", to: ["mama", "gonggong", "angelina"], price: 9, shop: "jj_cafe", art: ["box", "#5E8A48", "#F3ECDD"], say: "Green tea from the fields under Hallasan. Gong Gong will make it properly."},
  j_cake: {n: "Tangerine cake", kind: "gift", to: "family", price: 7, shop: "jj_cafe", art: ["box", "#F3D9A8", "#F29A2E"], say: "A tangerine pound cake from the stone-house café. Still a little warm."},
  j_tote: {n: "Persimmon-dyed tote", kind: "gift", to: ["mum", "angelina", "mama"], price: 18, shop: "jj_dye", art: ["tote", "#B26A36", "#D9A66A"], say: "A tote bag dyed with green persimmons! It smells like sunshine."},
  j_shirt: {n: "Galot shirt", kind: "gift", to: ["dad", "gonggong", "marcus"], price: 24, shop: "jj_dye", art: ["cloth", "#9E5A2E", "#C9874A"], say: "A galot shirt, the old Jeju farmers' shirt dyed with persimmons. Cool in summer, and it never shows the dirt."},
  j_scarf: {n: "Your persimmon scarf", kind: "keepsake", price: 0, art: ["cloth", "#9E5A2E", "#D9A66A"], line: "The scarf you dyed with green persimmons at Mr Moon's workshop in Jeju, darkened in the sun on your own washing line."}
});
Object.assign(KEEP_LINES, {j_magnet: "A tiny stone grandfather holding a tangerine, from Jeju.", j_tote: "A tote bag dyed with green persimmons in Jeju.", j_shirt: "A galot shirt, dyed with persimmons in Jeju."});
["j_magnet", "j_tote", "j_shirt"].forEach(id => Object.assign(TOWN_GOODS[id], {keep: true, line: KEEP_LINES[id]}));
TOWN_GOODS.j_magnet.magnet = true;
// Cinque Terre's goods (round 132), by room: the focacceria, the pesto kitchen, the cantina, the gelateria, the lemon
// shop. Pesto, pine nuts and chickpeas are kitchen ingredients; Mel can make her own pesto, limoncino, salted anchovies
// and raisin wine at home once she's learned how (game/loft.js), and those sell for more (the slow ones most). Buying
// the shop's own is always dearer than selling hers (Sciacchetrà 40 over her raisin wine's 36, limoncino 20 over 18,
// anchovies 16 over 15): a sell price is never above a buy price.
Object.assign(TOWN_GOODS, {
  c_focaccia: {n: "Focaccia", kind: "gift", to: "family", price: 4, shop: "ct_focacceria", art: ["box", "#E8C27A", "#C9A24A"], say: "Focaccia from Vernazza! Salty, oily, still warm. I'm having it now. Sorry."},
  chickpea: {n: "Chickpeas", kind: "ingredient", price: 3, sell: 2, shop: "ct_focacceria", art: ["disc", "#E8D3A0", "#C9B07A"], what: "for farinata at the kitchen (grow your own: chickpea seeds at the market)"},
  pinenuts: {n: "Pine nuts", kind: "ingredient", price: 6, sell: 3, shop: "ct_pesto", art: ["jar", "#F3E7C8", "#C9A27E"], what: "for pesto (yours, in the loft, once Nonna Pina's shown you) and pine nut gelato"},
  pesto: {n: "Jar of pesto", kind: "ingredient", price: 8, sell: 7, shop: "ct_pesto", art: ["jar", "#5E8A3A", "#F3E7C8"], what: "trofie with pesto at the kitchen"},
  c_mortar: {n: "Little marble mortar", kind: "keepsake", price: 18, shop: "ct_pesto", art: ["disc", "#E6E2DA", "#8A8478"], line: "A little white marble mortar and a wooden pestle, from Nonna Pina's kitchen in Manarola. Pesto's made by hand or not at all."},
  c_sciac: {n: "Bottle of Sciacchetrà", kind: "gift", to: ["dad", "gonggong", "mum", "darren"], price: 40, shop: "ct_cantina", art: ["bottle", "#C98A2E", "#5A3A2E"], say: "Sciacchetrà! The sweet wine from the dried grapes. A tiny glass after dinner. Just a tiny one."},
  c_white: {n: "Cinque Terre white", kind: "gift", to: ["dad", "mum", "marcus", "angelina"], price: 14, shop: "ct_cantina", art: ["bottle", "#E8E0A0", "#4E7A5A"], say: "Wine from the terraces! Grown on a cliff, carried down by hand. You can taste the sea."},
  c_limoncino: {n: "Limoncino", kind: "gift", to: ["mum", "mama", "angelina", "darren"], price: 20, shop: "ct_limoni", art: ["bottle", "#F3D34A", "#FFFDF6"], say: "Limoncino from Monterosso! Ice cold, in a tiny glass. It tastes like sunshine."},
  c_soap: {n: "Lemon soap", kind: "gift", to: "family", price: 5, shop: "ct_limoni", art: ["box", "#F3E7A0", "#F3D34A"], say: "Lemon soap! The whole bathroom smells like Italy now."},
  c_linen: {n: "Linen tea towel", kind: "gift", to: ["mum", "mama", "dad"], price: 8, shop: "ct_limoni", art: ["cloth", "#FFFDF6", "#F3D34A"], say: "A linen tea towel with lemons on it. Too nice to dry dishes with. I'll dry dishes with it."},
  c_anchovy: {n: "Monterosso anchovies in oil", kind: "gift", to: ["dad", "gonggong", "marcus"], price: 16, shop: "ct_limoni", art: ["box", "#9FC3D9", "#C9A27E"], say: "Monterosso anchovies! The best in Italy, they say. On toast, with butter."},
  c_plate: {n: "Ceramic lemon plate", kind: "keepsake", price: 12, shop: "ct_limoni", art: ["disc", "#3E6BAE", "#F3D34A"], line: "A hand-painted plate from Monterosso, blue and yellow, with lemons and leaves all round the rim."},
  c_magnet: {n: "Cinque Terre fridge magnet", kind: "gift", to: "family", price: 3, shop: "ct_limoni", art: ["disc", "#E89A9A", "#4F9CC4"], say: "A tiny stack of coloured houses over a blue sea. For the fridge!"},
  c_boat: {n: "Your painted boat (model)", kind: "keepsake", price: 0, art: ["box", "#3E6BAE", "#F3D98A"], line: "A little model of the fishing boat you helped paint in Manarola, with its name on the side in Evan's letters."}
});
Object.assign(KEEP_LINES, {c_magnet: "A tiny stack of coloured houses over a blue sea, from Cinque Terre.", c_linen: "A linen tea towel with lemons on it, from Monterosso."});
["c_magnet", "c_linen"].forEach(id => Object.assign(TOWN_GOODS[id], {keep: true, line: KEEP_LINES[id]}));
TOWN_GOODS.c_magnet.magnet = true;
Object.keys(PAINT.colours).forEach(c => Object.keys(PAINT.patterns).forEach(p => { TOWN_GOODS[`ptile_${c}_${p}`] = {n: "Your painted tile", kind: "keepsake", price: 0, tile: [c, p], art: ["tile", PAINT.colours[c][1], "#FFFDF6"], line: `A tile you painted yourself at Lucía's in Ronda: ${PAINT.patterns[p]}, in ${PAINT.colours[c][0]}.`}; }));
// Round 123: the nerikiri sweets Mel makes with Mr Tanaka in Kyoto (gifts), one shape for each season
[["sakura", "cherry blossom", "#F6C7D6"], ["ajisai", "hydrangea", "#B9A8E0"], ["momiji", "maple leaf", "#E0782E"], ["tsubaki", "camellia", "#C8432F"]].forEach(([k, n, col]) => {
  TOWN_GOODS["nk_" + k] = {n: `Nerikiri: ${n}`, kind: "gift", to: "family", price: 0, art: ["disc", col, "#FFFDF6"], say: `A little sweet shaped like a ${n}! You made this? Too beautiful to eat. I'll eat it anyway.`}; });
TOWN_GOODS.tsukemono = {n: "Fumiko's pickles", kind: "gift", to: ["mama", "gonggong", "dad"], price: 7, shop: "kt_market", art: ["jar", "#C9B04A", "#8E5A6E"], say: "Kyoto pickles! Purple ones, yellow ones... Ma Ma approves."};
// The tapas bar: order a little plate on the terrace and it's yours to cook at home (kitchen.js TAPAS, learn: true)
export const TASTINGS = {
  salmorejo: {price: 5, line: "Salmorejo: cold, thick, tomato and bread and olive oil, with egg and jamón on top. Like eating summer with a spoon."},
  ajoblanco: {price: 5, line: "Ajo blanco: a white soup of almonds and garlic, with a grape floating in it. Strange. Wonderful."},
  croqjamon: {price: 6, line: "Jamón croquetas: crisp outside, molten béchamel inside. You burn your tongue. Worth it."},
  payoyo: {price: 6, line: "Payoyo with membrillo: salty goat's cheese and sweet quince paste. The waiter says it's how grandmothers do it."},
  naranjas: {price: 4, line: "Orange salad: Seville oranges, black olives, olive oil and a pinch of salt. Sweet, bitter, salty. Who knew?"}
};
