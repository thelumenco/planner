// Bellbird Valley's Coast Road (round 148, Mel): the second region, inspired by the Great Ocean Road. The road leaves
// the valley at Valley Gate and runs along the cliffs: surf beaches, a white lighthouse, a rainforest gully that
// drops to a hidden cove, a fishing harbour, sea stacks with a penguin parade, and a caravan park with koalas and king
// parrots. The sea's on every stop. Same system as the Vines (data/bellbird.js): every stop's a van "town" of two
// screens and three rooms, and the ids start "bv" so the van, the map, the rooms and the panels all just work.
//
//   Breakwater         bv_breakwater:  cw_beach | cw_street        (side by side)
//   Lighthouse Point   bv_lighthouse:  cl_light / cl_cliff         (one above the other)
//   Fern Gully         bv_gully:       cg_ferns / cg_cove
//   Fisher's Harbour   bv_harbour:     ch_wharf | ch_cottages
//   The Sisters        bv_sisters:     cs_lookout / cs_beach
//   Koala Cove         bv_cove:        cc_park | cc_mouth

const VAN = {by: "van", fare: 0, free: ["evan"], outFrom: 7*60, outTo: 18*60, backTo: 22*60};
const FAM = ["mum", "dad", "mama", "gonggong", "darren", "marcus", "angelina"];
// the family's wander points: two each per screen, picked from a screen's open ground
const famSpots = per => Object.fromEntries(FAM.map((id, i) => [id, Object.fromEntries(Object.entries(per).map(([sc, pts]) => [sc, [pts[i % pts.length], pts[(i + 3) % pts.length]]]))]));
const room = (door, n, say) => ({door, n, music: door.replace(/^bv/, "bv_"), party: [[200, 560], [330, 560], [120, 540], [420, 540]], say});

export const CR_TOWNS = {
  bv_breakwater: {...VAN, n: "Breakwater", region: "coast", screens: ["cw_beach", "cw_street"], arrive: ["cw_beach", [130, 560]], station: "bvvan_breakwater", music: "bb_breakwater",
    blurb: "A surf town where the Coast Road meets the sea: a long beach with good little waves, a surf shop, fish and chips, and a bakery with a queue.",
    arriveLine: "The Coast Road! Round the last bend and there it is: the sea, very blue, a long curve of beach, and surfers bobbing out past the break.",
    evanArrive: ["THE SEA! the big sea!", "waves, Mama! big waves!", "can I go in? can I?"],
    evanScreen: {cw_beach: ["sand! sand everywhere!", "a surfboard! standing up!"], cw_street: ["chips! I smell chips!", "a seagull took that man's chip!"]},
    hints: {cw_beach: "Breakwater: the surf beach, the surf shop and the van. East: the main street.", cw_street: "The main street: fish and chips, the bakery, the Norfolk pines and the esplanade. West: back to the beach."},
    spots: famSpots({cw_beach: [[250, 420], [330, 400], [220, 480], [380, 330], [180, 400], [300, 470]], cw_street: [[220, 380], [320, 400], [260, 450], [180, 330], [380, 340], [300, 330]]}),
    acts: {}, rooms: {
      bv_surfshop: room("bvsurfshop", "Swell Surf Shop", "The surf shop: boards in racks to the ceiling, wetsuits on hangers, a wall of photos of big waves, and a dog asleep on a pile of towels."),
      bv_chippy: room("bvchippy", "The Golden Gull", "The fish and chip shop: a hissing fryer, a chalkboard of today's catch, butcher's paper, and salt and vinegar on every table."),
      bv_bakery: room("bvbakery", "Crumb & Co. bakery", "The bakery: pies in the warmer, vanilla slices, cinnamon scrolls, and a queue of sandy surfers out the door.")},
    lines: {mum: ["The sea air! I can feel my skin thanking me.", "Look at the little kids on the foam boards. So brave."],
      dad: ["Those Norfolk pines must be a hundred years old.", "Fish and chips on the beach. Some things you don't improve on."],
      mama: ["Ma Ma will watch from here. Too many waves.", "The bakery smells like heaven. Ma Ma is going in."],
      gonggong: ["Gong Gong used to swim like that. Long time ago.", "Good wind today. The surfers are happy."],
      darren: ["I'm getting a pie. Then another pie.", "Watch the gulls. They're professionals."],
      marcus: ["Zeh, I'm getting on a board. Film it. Don't film the falling.", "This is the life."],
      angelina: ["The water's so clear you can see the sand ripples.", "I want a little beach house here one day."],
      evan: ["the sea is so BIG", "I'm a surfer!", "can I have chips?"]},
    say: {bvsurf: "The surf: little rolling waves, perfect for learning. Jet's lessons are on the hour, from the flags.",
      bvflags: "The red and yellow flags: swim between them. The lifeguard waves from her tall chair.",
      bvbench: "A bench under the Norfolk pines, facing the sea. A seagull is watching you very closely.",
      bvsurfshop: "Swell Surf Shop: boards outside in a rack, wetsuits drying on the rail.",
      bvchippy: "The Golden Gull: fish and chips, potato cakes, and a sign that says DON'T FEED THE GULLS.",
      bvbakery: "Crumb & Co.: pies, pasties and vanilla slices, and a striped awning."}},
  bv_lighthouse: {...VAN, n: "Lighthouse Point", region: "coast", screens: ["cl_light", "cl_cliff"], arrive: ["cl_light", [150, 560]], station: "bvvan_lighthouse", music: "bb_lighthouse",
    blurb: "A white lighthouse with a red cap on a headland of heath and wildflowers, the old keeper's cottage, and a cliff walk where the whales go by in winter.",
    arriveLine: "Up on the headland: the white lighthouse with its red cap, the wind in the heath, and the whole ocean spread out below, glittering.",
    evanArrive: ["a LIGHTHOUSE! a real one!", "it's so tall, Mama!", "is there a light inside?"],
    evanScreen: {cl_light: ["the lighthouse has a red hat!", "a little house!"], cl_cliff: ["the sea is way down there!", "is that a whale? IS IT?"]},
    hints: {cl_light: "Lighthouse Point: the lighthouse, the keeper's cottage tearoom and the van. South: the cliff walk.", cl_cliff: "The cliff walk: the whale lookout, the heath and the gift shop. North: back to the lighthouse."},
    spots: famSpots({cl_light: [[260, 420], [320, 470], [220, 380], [300, 340], [380, 430], [200, 470]], cl_cliff: [[200, 380], [260, 440], [180, 300], [300, 300], [220, 520], [280, 560]]}),
    acts: {}, rooms: {
      bv_lighthouse: room("bvlighthouse", "Inside the lighthouse", "Inside the lighthouse: a spiral of iron stairs going up and up, round windows, and at the top the great glass lens and a balcony right round."),
      bv_tearoom: room("bvtearoom", "The keeper's cottage tearoom", "The keeper's cottage, now a tearoom: lace curtains, a ship in a bottle, scones on the dresser, and the old logbooks on a shelf."),
      bv_giftshop: room("bvgiftshop", "The Point gift shop", "The gift shop: lighthouse models, shell wind chimes, postcards and tea towels, and the sound of the sea through the open door.")},
    lines: {mum: ["Imagine living out here. Just you, the light and the sea.", "Look at the wildflowers in the heath. Purple and yellow."],
      dad: ["A first-order lens. They don't make them like that any more.", "I'd like to paint that lighthouse. In this light."],
      mama: ["Very windy. Ma Ma's hat nearly went to sea.", "Scones in the cottage. Ma Ma is ready."],
      gonggong: ["Gong Gong will look for whales. You go on.", "The old keepers wrote down every ship. Every one."],
      darren: ["How many stairs, do you reckon? Bet you it's over a hundred.", "Whale watching. Patience. Snacks help."],
      marcus: ["Zeh, the view from the top is going to be unreal.", "This wind! Hold onto Evan."],
      angelina: ["The light keeps changing on the water. I need to paint it.", "Ships used to see this light from twenty miles out."],
      evan: ["is there a giant in the lighthouse?", "whales! where are the whales?", "I want to go to the top!"]},
    say: {bvwhales: "The whale lookout: a railing on the cliff edge, a sign of whale shapes, and the whole ocean in front of you.",
      bvheath: "The coastal heath: low, wind-bent bushes, purple and yellow flowers, and honeyeaters darting about.",
      bvlighthouse: "The lighthouse: white, round, with a red cap, a little green door, and 1891 over the lintel.",
      bvtearoom: "The keeper's cottage: whitewashed stone, a picket fence, and a sign: Devonshire teas.",
      bvgiftshop: "The gift shop in the old signal house."}},
  bv_gully: {...VAN, n: "Fern Gully", region: "coast", screens: ["cg_ferns", "cg_cove"], arrive: ["cg_ferns", [150, 560]], station: "bvvan_gully", music: "bb_gully",
    blurb: "Cool rainforest in the hills behind the coast: giant tree ferns, mountain ash, a treetop walk, and a creek that falls down a waterfall onto a hidden cove.",
    arriveLine: "Into the rainforest: suddenly cool and green and dripping, tree ferns taller than the van, and somewhere below, the sound of a waterfall and the sea.",
    evanArrive: ["it's like a dinosaur forest!", "giant ferns!", "where's the waterfall?"],
    evanScreen: {cg_ferns: ["the trees go up to the sky!", "a fern like an umbrella!"], cg_cove: ["a waterfall on the beach!", "a secret beach, Mama!"]},
    hints: {cg_ferns: "Fern Gully: the tree ferns, the treetop walk, the ranger's hut, the mushroom café and the van. South: down to the hidden cove.", cg_cove: "The hidden cove: the waterfall onto the sand, the glow-worm grotto in the cliff, and the sea. North: back up to the ferns."},
    spots: famSpots({cg_ferns: [[260, 430], [320, 470], [220, 500], [300, 400], [380, 470], [200, 440]], cg_cove: [[260, 300], [320, 340], [220, 380], [300, 260], [380, 360], [200, 320]]}),
    acts: {}, rooms: {
      bv_rangerhut: room("bvrangerhut", "The ranger's hut", "The ranger's hut: maps and pinned-up leaves, a jar of lost things, a lyrebird feather, and the treetop-walk tickets."),
      bv_mushcafe: room("bvmushcafe", "The Toadstool café", "The Toadstool café: mismatched chairs, mushroom soup and toasted sandwiches, and a wood stove that's always lit."),
      bv_grotto: room("bvgrotto", "The glow-worm grotto", "The glow-worm grotto: a low overhang in the cliff, cool and dripping. In the dark, the ceiling is speckled with tiny blue-green stars.")},
    lines: {mum: ["Smell that! Wet earth and ferns.", "A beach at the bottom of a rainforest. How is that real?"],
      dad: ["Look at the fungi on that log. Orange, like little shelves.", "Mountain ash. The tallest flowering trees in the world."],
      mama: ["So cool here. Ma Ma likes it.", "Mushroom soup in the café. Ma Ma's choice."],
      gonggong: ["Listen. A lyrebird. Copying a camera.", "Gong Gong will rest by the creek."],
      darren: ["Treetop walk. I'm counting the steps. All of them.", "Glow-worms are just shiny bugs, but I'm still excited."],
      marcus: ["Zeh, this is like a movie.", "A waterfall straight onto the beach. Unreal."],
      angelina: ["Everything's dripping and green. I love it.", "The glow-worms only come out in the dark. Can we stay?"],
      evan: ["dinosaurs live here", "I hear water!", "glow worms! can I hold one?"]},
    say: {bvtreetop: "The treetop walk: a steel walkway high up in the canopy, swaying a little, with the ferns far below.",
      bvcreek: "The creek: clear brown water tumbling over mossy rocks, on its way down to the sea.",
      bvfalls: "The waterfall: the creek drops straight off the cliff onto the sand, into a clear pool, then runs out to the sea.",
      bvrangerhut: "The ranger's hut: a little timber hut under the ferns, a noticeboard, and a lyrebird sign.",
      bvmushcafe: "The Toadstool café: a red door, a chimney puffing, and a hand-painted mushroom on the sign.",
      bvgrotto: "The glow-worm grotto: a dark overhang in the cliff. A sign: Torches off inside, please."}},
  bv_harbour: {...VAN, n: "Fisher's Harbour", region: "coast", screens: ["ch_wharf", "ch_cottages"], arrive: ["ch_wharf", [120, 330]], station: "bvvan_harbour", music: "bb_harbour",
    blurb: "A working fishing harbour: a timber wharf, cray boats, the fishermen's co-op, an old pub, a smokehouse, and a row of little cottages along the bay.",
    arriveLine: "Down into the harbour: cray boats tied up at the wharf, gulls on every post, ropes and pots stacked high, and the smell of salt and smoke.",
    evanArrive: ["BOATS! lots of boats!", "that bird is staring at me", "can we go on a boat?"],
    evanScreen: {ch_wharf: ["a boat with a cage!", "fishies in the water!"], ch_cottages: ["little houses!", "a tiny beach!"]},
    hints: {ch_wharf: "Fisher's Harbour: the wharf and the boats, the co-op and the van. East: the cottages.", ch_cottages: "The cottages along the bay: the old pub, the smokehouse and a little beach. West: back to the wharf."},
    spots: famSpots({ch_wharf: [[200, 300], [260, 320], [380, 300], [440, 330], [300, 280], [180, 340]], ch_cottages: [[200, 340], [300, 380], [380, 340], [260, 450], [160, 400], [420, 400]]}),
    acts: {}, rooms: {
      bv_coop: room("bvcoop", "The fishermen's co-op", "The co-op: tubs of ice, crayfish waving their feelers, prawns, scallops and flathead, and a scale that clanks."),
      bv_pub: room("bvpub", "The Anchor Hotel", "The Anchor: an old pub with a fire, a dartboard, a ship's wheel over the bar, and photos of every big catch since 1920."),
      bv_smokehouse: room("bvsmokehouse", "The smokehouse", "The smokehouse: rows of fish turning gold in the smoke, the smell of woodchips, and jars of smoked trout pâté.")},
    lines: {mum: ["The colours of the boats! Red, blue, yellow.", "Those little cottages are like a postcard."],
      dad: ["Look at the old timber in that wharf. Generations of it.", "A crayfish fresh off the boat. That's dinner sorted."],
      mama: ["Ma Ma wants prawns. Straight off the boat. The best.", "Very fresh fish. Ma Ma can tell by the eyes."],
      gonggong: ["Gong Gong grew up near a harbour like this.", "The fishermen are back early. Good catch."],
      darren: ["I'm getting chips. I'll guard them with my life.", "Those gulls have no fear."],
      marcus: ["Zeh, imagine heading out at four in the morning.", "Smoked fish. Yes."],
      angelina: ["The pub's from 1920! Imagine the stories.", "I love the little beach by the cottages."],
      evan: ["a boat! I want to drive it!", "crabs! in the bucket!", "the seagull said MINE"]},
    say: {bvboats: "The cray boats: blue and red, stacked with cane pots. Mags is getting hers ready for the morning.",
      bvgulls: "The gulls: one on every post, watching every chip in a hundred metres.",
      bvbayshore: "The little beach below the cottages: dinghies pulled up on the sand, and the bay as flat as glass.",
      bvcoop: "The co-op: a big tin shed on the wharf, FRESH FISH painted on the side.",
      bvpub: "The Anchor Hotel: two storeys, an iron-lace veranda, and a ship's anchor out the front.",
      bvsmokehouse: "The smokehouse: a little stone building with a chimney, smoke curling out, smelling wonderful."}},
  bv_sisters: {...VAN, n: "The Sisters", region: "coast", screens: ["cs_lookout", "cs_beach"], arrive: ["cs_lookout", [130, 310]], station: "bvvan_sisters", music: "bb_sisters",
    blurb: "Golden limestone stacks standing in the surf off the cliffs, a boardwalk lookout, steps down to the beach, and little penguins coming home at dusk.",
    arriveLine: "Out to the cliffs: the boardwalk, the wind, and there they are below, the Sisters, great golden stacks of rock standing in the white surf.",
    evanArrive: ["big rocks in the sea!", "they're like giants, Mama!", "is it windy? IT IS WINDY"],
    evanScreen: {cs_lookout: ["the rocks are in the WATER", "they're so big!"], cs_beach: ["the giant rocks are so close!", "penguins live here!"]},
    hints: {cs_lookout: "The Sisters: the boardwalk lookout, the kiosk and the van. Down the steps: the beach.", cs_beach: "The beach below the cliffs: the surf club, the penguin hide, and the stacks right there. Up the steps: the lookout."},
    spots: famSpots({cs_lookout: [[220, 330], [300, 360], [360, 320], [260, 390], [180, 360], [420, 360]], cs_beach: [[200, 300], [260, 360], [320, 280], [220, 400], [380, 380], [300, 410]]}),
    acts: {}, rooms: {
      bv_kiosk: room("bvkiosk", "The lookout kiosk", "The kiosk: hot chips, coffee, ice creams, a rack of postcards of the Sisters at sunset, and a map of the shipwrecks."),
      bv_slsc: room("bvslsc", "The surf club", "The surf lifesaving club: red and yellow everywhere, rescue boards on the wall, a honour board of every patrol, and a canteen."),
      bv_hide: room("bvhide", "The penguin hide", "The penguin hide: a low timber shelter in the dunes, benches, a long window onto the beach, and a sign: no torches, no flash, whisper.")},
    lines: {mum: ["They're so golden in this light.", "Penguins! Tiny ones! I can't wait."],
      dad: ["Thousands of years of waves did that.", "There used to be more of them. The sea takes them, one by one."],
      mama: ["Very beautiful. Ma Ma will take a photo. Many photos.", "Steps down to the beach. Ma Ma counts. Many steps."],
      gonggong: ["Gong Gong likes the wind. It blows the cobwebs away.", "Look for shells, Ma Ma."],
      darren: ["The light at sunset here is meant to be crazy.", "Hot chips at a lookout. Correct."],
      marcus: ["Zeh, this is the photo. This is the one.", "Imagine the shipwrecks out there."],
      angelina: ["The penguins come home every single night. Every night!", "It's like the edge of the world."],
      evan: ["the rocks are giants sleeping", "where are the penguins?", "can I climb the big rock?"]},
    say: {bvplatform: "The lookout platform: the boardwalk ends at a railing over the cliff, and the Sisters stand in the surf below.",
      bvpenguins: "The shoreline where the penguins come in: little tracks in the sand, and a rope to keep people back.",
      bvkiosk: "The lookout kiosk: a little timber hut with a hatch and a striped awning.",
      bvslsc: "The surf club: a red-roofed clubhouse on the dunes, flags out.",
      bvhide: "The penguin hide: a low timber shelter tucked into the dune grass."}},
  bv_cove: {...VAN, n: "Koala Cove", region: "coast", screens: ["cc_park", "cc_mouth"], arrive: ["cc_park", [150, 560]], station: "bvvan_cove", music: "bb_cove",
    blurb: "A caravan park among the gums where a river meets the sea: koalas asleep in the branches, king parrots that land on your arm, and the beach just across the road.",
    arriveLine: "Into the caravan park: big gums, koalas asleep in the forks, red and green king parrots on every railing, and the sound of the surf across the road.",
    evanArrive: ["KOALAS! up in the tree!", "red birds! red and green birds!", "can we stay forever?"],
    evanScreen: {cc_park: ["a parrot on that man's head!", "the koala's asleep"], cc_mouth: ["the river goes into the sea!", "Nippers! I want to do Nippers!"]},
    hints: {cc_park: "Koala Cove: the caravan park, the king parrots, the koala gums, the park store, the laundry café and the van. East: the river mouth.", cc_mouth: "The river mouth: the beach, Nippers on the sand, and the rec hall. West: back to the park."},
    spots: famSpots({cc_park: [[260, 420], [320, 460], [220, 480], [300, 380], [380, 470], [200, 400]], cc_mouth: [[220, 360], [300, 380], [380, 340], [260, 430], [180, 420], [420, 420]]}),
    acts: {}, rooms: {
      bv_parkstore: room("bvparkstore", "The park store", "The park store: milk, bread, bait, icy poles, bird seed for the parrots (one scoop only!), and a lost-property box full of thongs."),
      bv_laundry: room("bvlaundry", "The laundry café", "The laundry café: washing machines along one wall, a coffee machine on the other, a book swap shelf, and the best banana bread on the coast."),
      bv_rechall: room("bvrechall", "The rec hall", "The rec hall: a ping-pong table, a piano, jigsaws, and a board of everyone's high scores on the old pinball machine.")},
    lines: {mum: ["A parrot just landed on me! Look!", "Koalas! Three in that one tree!"],
      dad: ["Caravan parks haven't changed since I was a kid. I love that.", "The river mouth's moved since last time. The sea decides."],
      mama: ["The birds are so bright. Like little lanterns.", "Ma Ma will do the washing. Then coffee."],
      gonggong: ["Gong Gong will sit under the tree. Watch the koalas sleep.", "Quoits! Gong Gong was champion, once."],
      darren: ["Banana bread from a laundry. Only on the coast.", "That koala hasn't moved in an hour. Goals."],
      marcus: ["Zeh, the river and the sea right next to each other.", "Nippers! Evan's going to be a lifesaver."],
      angelina: ["I'm writing postcards to everyone. Everyone.", "The parrots are so cheeky."],
      evan: ["the koala is SNORING", "a red bird on my hat!", "I'm a lifesaver!"]},
    say: {bvparrots: "The king parrots: red heads, green wings, very bold. They'll land on your arm if you stand still.",
      bvkoalas: "The koala gums: look up. One, two, three koalas asleep in the forks, one with a baby on her back.",
      bvnippers: "Nippers on the beach: little lifesavers in red and yellow caps, running to the flags.",
      bvrivermouth: "The river mouth: brown river water meeting the blue sea, pelicans standing about.",
      bvparkstore: "The park store: a timber shop with an ice-cream sign and a parrot on the roof.",
      bvlaundry: "The laundry café: washing flapping on the line out the back, coffee smell out the front.",
      bvrechall: "The rec hall: a big old fibro hall with a basketball hoop on the wall."}}
};

// the places on each screen (a stop's gates between its two screens are bridges)
const P = (scene, name, door, mark, line, more) => ({scene, name, door, spot: true, mark, line, ...(more || {})});
export const CR_PLACES = {
  bvvan_breakwater: P("cw_beach", "The campervan", [130, 560], [130, 470], "Your campervan."),
  bvsurf: P("cw_beach", "The surf", [280, 250], [280, 120], "The surf."), bvflags: P("cw_beach", "The flags", [150, 260], [150, 200], "The flags."),
  bvsurfshop: P("cw_beach", "Swell Surf Shop", [400, 452], [400, 360], "The surf shop."),
  bvToStreet: P("cw_beach", "To the main street", [504, 500], [476, 440], "East to the main street.", {bridge: "cw_street"}),
  bvchippy: P("cw_street", "The Golden Gull", [140, 236], [140, 120], "Fish and chips."), bvbakery: P("cw_street", "Crumb & Co.", [390, 236], [390, 120], "The bakery."),
  bvbench: P("cw_street", "The bench under the pines", [260, 430], [260, 360], "The bench."),
  bvToBeach: P("cw_street", "Back to the beach", [16, 400], [44, 340], "West to the beach.", {bridge: "cw_beach"}),
  bvvan_lighthouse: P("cl_light", "The campervan", [150, 560], [150, 470], "Your campervan."),
  bvlighthouse: P("cl_light", "The lighthouse", [380, 262], [380, 80], "The lighthouse."), bvtearoom: P("cl_light", "The keeper's cottage", [130, 252], [130, 140], "The keeper's cottage."),
  bvToCliff: P("cl_light", "Down to the cliff walk", [300, 612], [300, 560], "Down to the cliff walk.", {bridge: "cl_cliff"}),
  bvwhales: P("cl_cliff", "The whale lookout", [320, 330], [320, 250], "The whale lookout."), bvheath: P("cl_cliff", "The heath", [200, 480], [200, 420], "The heath."),
  bvgiftshop: P("cl_cliff", "The gift shop", [120, 282], [120, 170], "The gift shop."),
  bvToLight: P("cl_cliff", "Up to the lighthouse", [240, 26], [240, 40], "Up to the lighthouse.", {bridge: "cl_light"}),
  bvvan_gully: P("cg_ferns", "The campervan", [150, 560], [150, 470], "Your campervan."),
  bvtreetop: P("cg_ferns", "The treetop walk", [300, 330], [300, 200], "The treetop walk."), bvcreek: P("cg_ferns", "The creek", [270, 470], [270, 420], "The creek."),
  bvrangerhut: P("cg_ferns", "The ranger's hut", [120, 256], [120, 150], "The ranger's hut."), bvmushcafe: P("cg_ferns", "The Toadstool café", [410, 256], [410, 150], "The café."),
  bvToCove: P("cg_ferns", "Down to the hidden cove", [300, 612], [300, 560], "Down to the cove.", {bridge: "cg_cove"}),
  bvfalls: P("cg_cove", "The waterfall", [150, 300], [150, 160], "The waterfall."), bvgrotto: P("cg_cove", "The glow-worm grotto", [400, 244], [400, 150], "The grotto."),
  bvToFerns: P("cg_cove", "Up to the ferns", [270, 26], [270, 40], "Up to the ferns.", {bridge: "cg_ferns"}),
  bvvan_harbour: P("ch_wharf", "The campervan", [110, 330], [110, 240], "Your campervan."),
  bvcoop: P("ch_wharf", "The co-op", [250, 236], [250, 120], "The co-op."), bvboats: P("ch_wharf", "The cray boats", [310, 560], [310, 480], "The boats."),
  bvgulls: P("ch_wharf", "The gulls", [420, 330], [420, 270], "The gulls."),
  bvToCottages: P("ch_wharf", "To the cottages", [504, 320], [476, 260], "East to the cottages.", {bridge: "ch_cottages"}),
  bvpub: P("ch_cottages", "The Anchor Hotel", [140, 236], [140, 110], "The pub."), bvsmokehouse: P("ch_cottages", "The smokehouse", [400, 236], [400, 120], "The smokehouse."),
  bvbayshore: P("ch_cottages", "The little beach", [260, 460], [260, 420], "The little beach."),
  bvToWharf: P("ch_cottages", "Back to the wharf", [16, 320], [44, 260], "West to the wharf.", {bridge: "ch_wharf"}),
  bvvan_sisters: P("cs_lookout", "The campervan", [130, 310], [130, 220], "Your campervan."),
  bvplatform: P("cs_lookout", "The lookout platform", [300, 400], [300, 330], "The lookout."), bvkiosk: P("cs_lookout", "The kiosk", [400, 236], [400, 130], "The kiosk."),
  bvToSand: P("cs_lookout", "Down the steps to the beach", [474, 400], [470, 340], "Down the steps.", {bridge: "cs_beach"}),
  bvslsc: P("cs_beach", "The surf club", [130, 256], [130, 140], "The surf club."), bvhide: P("cs_beach", "The penguin hide", [400, 300], [400, 220], "The penguin hide."),
  bvpenguins: P("cs_beach", "The penguin shore", [250, 412], [250, 370], "The penguin shore."),
  bvToLookout: P("cs_beach", "Up the steps to the lookout", [470, 196], [440, 150], "Up the steps.", {bridge: "cs_lookout"}),
  bvvan_cove: P("cc_park", "The campervan", [150, 560], [150, 470], "Your campervan."),
  bvparrots: P("cc_park", "The king parrots", [270, 400], [270, 330], "The king parrots."), bvkoalas: P("cc_park", "The koala gums", [460, 420], [460, 300], "The koalas."),
  bvparkstore: P("cc_park", "The park store", [130, 256], [130, 150], "The park store."), bvlaundry: P("cc_park", "The laundry café", [390, 256], [390, 150], "The laundry café."),
  bvToMouth: P("cc_park", "To the river mouth", [504, 480], [476, 420], "East to the river mouth.", {bridge: "cc_mouth"}),
  bvnippers: P("cc_mouth", "Nippers", [330, 440], [330, 380], "Nippers."), bvrivermouth: P("cc_mouth", "The river mouth", [240, 340], [240, 280], "The river mouth."),
  bvrechall: P("cc_mouth", "The rec hall", [400, 256], [400, 150], "The rec hall."),
  bvToPark: P("cc_mouth", "Back to the park", [16, 480], [44, 420], "West to the park.", {bridge: "cc_park"})
};
// each room's way out is its own door outside
Object.values(CR_TOWNS).forEach(t => Object.entries(t.rooms).forEach(([rid, r]) => { const p = CR_PLACES[r.door]; CR_PLACES[rid] = {scene: p.scene, name: r.n, door: p.door}; }));
export const CR_BRIDGES = {cw_beach: {cw_street: "bvToStreet"}, cw_street: {cw_beach: "bvToBeach"}, cl_light: {cl_cliff: "bvToCliff"}, cl_cliff: {cl_light: "bvToLight"},
  cg_ferns: {cg_cove: "bvToCove"}, cg_cove: {cg_ferns: "bvToFerns"}, ch_wharf: {ch_cottages: "bvToCottages"}, ch_cottages: {ch_wharf: "bvToWharf"},
  cs_lookout: {cs_beach: "bvToSand"}, cs_beach: {cs_lookout: "bvToLookout"}, cc_park: {cc_mouth: "bvToMouth"}, cc_mouth: {cc_park: "bvToPark"}};
export const CR_ARRIVE = {"cw_beach>cw_street": [44, 400], "cw_street>cw_beach": [474, 500], "cl_light>cl_cliff": [240, 70], "cl_cliff>cl_light": [300, 572],
  "cg_ferns>cg_cove": [270, 70], "cg_cove>cg_ferns": [300, 572], "ch_wharf>ch_cottages": [44, 320], "ch_cottages>ch_wharf": [474, 320],
  "cs_lookout>cs_beach": [440, 230], "cs_beach>cs_lookout": [440, 400], "cc_park>cc_mouth": [44, 480], "cc_mouth>cc_park": [474, 480]};
// where you can walk (outdoors: the sea and the cliffs are off limits), and what's in the way
export const CR_BOUNDS = {
  cw_beach: [14, 200, 506, 616], cw_street: [14, 240, 506, 500], cl_light: [14, 240, 506, 616], cl_cliff: [14, 26, 356, 616], cg_ferns: [14, 240, 506, 616], cg_cove: [14, 26, 506, 430],
  ch_wharf: [14, 230, 506, 600], ch_cottages: [14, 230, 506, 480], cs_lookout: [14, 230, 506, 412], cs_beach: [14, 180, 506, 424], cc_park: [14, 240, 506, 616], cc_mouth: [14, 240, 506, 470],
  ...Object.fromEntries(Object.values(CR_TOWNS).flatMap(t => Object.keys(t.rooms)).map(r => [r, [30, 250, 490, 600]]))
};
export const CR_OBST = {
  cw_beach: [[330, 340, 470, 446]], cw_street: [[70, 120, 210, 230], [320, 120, 460, 230]],
  cl_light: [[340, 60, 420, 252], [60, 150, 200, 246]], cl_cliff: [[60, 180, 180, 276]],
  cg_ferns: [[60, 150, 180, 250], [350, 150, 470, 250]], cg_cove: [[0, 0, 100, 250], [330, 130, 470, 236]],
  ch_wharf: [[0, 380, 280, 640], [340, 380, 520, 640], [180, 130, 320, 230]], ch_cottages: [[70, 110, 210, 230], [340, 120, 460, 230]],
  cs_lookout: [[340, 130, 460, 230]], cs_beach: [[70, 150, 190, 250], [350, 240, 450, 296], [0, 0, 420, 176]],
  cc_park: [[70, 150, 190, 250], [330, 150, 450, 250]], cc_mouth: [[340, 150, 460, 250], [0, 240, 150, 300]]
};
export const CR_EVAN = {cw_beach: [[240, 320], [320, 300], [200, 420]], cw_street: [[200, 380], [320, 420], [260, 470]], cl_light: [[260, 420], [320, 470], [220, 380]], cl_cliff: [[200, 380], [260, 440], [240, 300]],
  cg_ferns: [[260, 430], [320, 470], [220, 500]], cg_cove: [[240, 300], [320, 340], [200, 380]], ch_wharf: [[200, 300], [300, 320], [310, 480]], ch_cottages: [[200, 360], [300, 420], [260, 460]],
  cs_lookout: [[220, 340], [300, 380], [260, 320]], cs_beach: [[200, 300], [260, 380], [320, 300]], cc_park: [[260, 420], [320, 460], [220, 480]], cc_mouth: [[220, 380], [300, 420], [380, 360]]};
// the Coast Road on the road map: its own page (region "coast"); Valley Gate is where the road comes in
export const CR_MAP = {home: [26, 214], bv_gate: [40, 130], bv_breakwater: [96, 178], bv_lighthouse: [150, 158], bv_cove: [204, 182], bv_gully: [238, 110], bv_harbour: [282, 172], bv_sisters: [334, 158]};
export const CR_ROADS = [["bv_gate", "bv_breakwater"], ["bv_breakwater", "bv_lighthouse"], ["bv_lighthouse", "bv_cove"], ["bv_cove", "bv_harbour"], ["bv_cove", "bv_gully"], ["bv_gully", "bv_harbour"], ["bv_harbour", "bv_sisters"]];
export const CR_NAMES = {cw_beach: "Breakwater", cw_street: "Breakwater: the main street", cl_light: "Lighthouse Point", cl_cliff: "Lighthouse Point: the cliff walk",
  cg_ferns: "Fern Gully", cg_cove: "Fern Gully: the hidden cove", ch_wharf: "Fisher's Harbour", ch_cottages: "Fisher's Harbour: the cottages",
  cs_lookout: "The Sisters", cs_beach: "The Sisters: the beach", cc_park: "Koala Cove", cc_mouth: "Koala Cove: the river mouth"};
