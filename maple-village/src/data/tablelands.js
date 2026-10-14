// Bellbird Valley's Tablelands (round 157, Mel): the third region, inspired by the Atherton Tablelands. Up the range
// from Balloon Lookout, into the cool green high country: rainforest and waterfalls, a round blue crater lake, a little
// river town with a platypus creek, a dairy farm, a macadamia and finger lime farm, and an old gold-rush town with a
// steam train. Misty in the mornings, red earth on the tracks, black-and-white cows on very green grass. Same system
// as the Vines and the Coast Road (data/bellbird.js): every stop's a van "town" of two screens and three rooms, and
// the ids start "bv" (places "bvt", rooms "bv_t") so the van, the map, the rooms and the panels all just work.
//
//   Misty Falls       bv_falls:  tf_top / tf_pool           (one above the other)
//   Crater Lake       bv_crater: tk_shore | tk_fig          (side by side)
//   Willow Bend       bv_town:   tr_street | tr_creek
//   Greenhill Dairy   bv_dairy:  td_paddock / td_yard      (you park in the yard, below)
//   Nutwood Farm      bv_nuts:   tm_grove | tm_shed        (you park by the shed, on the right)
//   Kingsreef         bv_gold:   tg_station / tg_street

const VAN = {by: "van", fare: 0, free: [], outFrom: 7*60, outTo: 18*60, backTo: 22*60};
const FAM = ["hana", "theo", "farid", "mei", "bo", "tomi", "posy"];
const famSpots = per => Object.fromEntries(FAM.map((id, i) => [id, Object.fromEntries(Object.entries(per).map(([sc, pts]) => [sc, [pts[i % pts.length], pts[(i + 3) % pts.length]]]))]));
const room = (door, n, say) => ({door, n, music: door.replace(/^bv/, "bv_"), party: [[200, 560], [330, 560], [120, 540], [420, 540]], say});

export const TL_TOWNS = {
  bv_falls: {...VAN, n: "Misty Falls", region: "tablelands", screens: ["tf_top", "tf_pool"], arrive: ["tf_top", [150, 560]], station: "bvvan_falls", music: "bb_falls",
    blurb: "The top of the range: a lookout over the whole green tableland, a café with pies and scones, and a path down through the rainforest to a waterfall and its swimming hole.",
    arriveLine: "Up and up the range, round a hundred bends, and out at the top: cool air, the smell of rain on leaves, and the whole tableland rolling away green below.",
    evanArrive: ["we're SO high up!", "it's cold, Mama! cold!", "I can hear a waterfall!"],
    evanScreen: {tf_top: ["the clouds are BELOW us", "a pie shop!"], tf_pool: ["the waterfall is SO loud", "a rainbow! in the water!"]},
    hints: {tf_top: "Misty Falls: the lookout, the Range Café, the ranger station and the van. Down the path: the falls.", tf_pool: "The waterfall and the swimming hole, the sunny rock and the gallery. Up the path: back to the top."},
    spots: famSpots({tf_top: [[250, 420], [330, 450], [220, 500], [380, 400], [180, 430], [300, 520]], tf_pool: [[200, 380], [330, 380], [260, 460], [420, 420], [160, 560], [360, 560]]}),
    acts: {mei: {tf_top: {act: "flask", at: [232, 262], dir: 1}}, tomi: {tf_pool: {act: "wade", at: [330, 330], dir: -1}}}, rooms: {
      bv_tcafe: room("bvtcafe", "The Range Café", "The Range Café: a wood stove, a glass case of pies and vanilla slices, scones under tea towels, and a window full of mist."),
      bv_tranger: room("bvtranger", "The ranger station", "The ranger station: a big map of the tableland, a jar of seed pods, a stuffed cassowary (old, very serious), and the swimming hole's rules in big letters."),
      bv_tgallery: room("bvtgallery", "The Mistfall gallery", "The gallery: paintings of the falls in every season, carved timber birds, and a potter's wheel in the corner, still wet.")},
    lines: {hana: ["Smell the air! It's like rain and flowers.", "I could sit by this water all day."],
      theo: ["Look at the view. You can see three towns from here.", "That's a hundred bends we came up. I counted. Well, Darren did."],
      farid: ["Very cold water. Ma Ma will put one foot in. One.", "A pie at the top. Ma Ma earned it, the drive was long."],
      mei: ["Gong Gong likes the mist. Like the mountains at home.", "Listen to the falls. Better than any music."],
      bo: ["A hundred and four bends. I counted every one.", "Swimming hole? Freezing. I'm going in. Probably."],
      tomi: ["Zeh, the waterfall! I'm getting right under it.", "This is the coldest water in Australia, I swear."],
      posy: ["The rainbow in the spray! Look!", "Everything up here is so green."]},
    say: {bvtview: "The lookout: a timber railing at the edge of the range, and the whole tableland below, green and gold, with mist lying in the valleys.",
      bvtfalls: "The falls: one long white veil of water off a mossy cliff, into a round dark pool. Ferns all round. A rainbow in the spray when the sun's out.",
      bvtrock: "The sunny rock: a big flat boulder by the pool, warm to sit on, with the spray drifting over now and then.",
      bvtcafe: "The Range Café: a timber café at the top of the range, smoke from the chimney, and a sign: HOT PIES.",
      bvtranger: "The ranger station: a little green hut with a cassowary sign and a rack of brochures.",
      bvtgallery: "The Mistfall gallery: a tin-roofed cottage painted pale green, with a clay bird on the gatepost."}},
  bv_crater: {...VAN, n: "Crater Lake", region: "tablelands", screens: ["tk_shore", "tk_fig"], arrive: ["tk_shore", [130, 560]], station: "bvvan_crater", music: "bb_crater",
    blurb: "A perfectly round lake in an old volcano, deep and still and very blue, with kayaks at the boat shed, a lakeside café, and a boardwalk to a giant curtain fig.",
    arriveLine: "Through the trees and there it is: a round lake, perfectly still, so blue it looks painted, with the forest standing all round the rim like a crowd.",
    evanArrive: ["it's a ROUND lake!", "a volcano! is it hot?", "boats! little boats!"],
    evanScreen: {tk_shore: ["the water is so blue", "a turtle! I saw a turtle!"], tk_fig: ["the tree has CURTAINS", "a kangaroo in the TREE!"]},
    hints: {tk_shore: "Crater Lake: the lake, the jetty, the boat shed, the Lake House and the van. East: the curtain fig.", tk_fig: "The rainforest boardwalk: the giant curtain fig, the tree-kangaroo, and the wood-turner's shop. West: back to the lake."},
    spots: famSpots({tk_shore: [[220, 460], [320, 470], [260, 520], [400, 520], [180, 500], [360, 580]], tk_fig: [[200, 420], [320, 440], [260, 520], [420, 480], [160, 560], [380, 560]]}),
    acts: {posy: {tk_shore: {act: "ducks", at: [190, 470], dir: -1}}, bo: {tk_shore: {act: "frisbee", at: [380, 480], dir: -1}}}, rooms: {
      bv_tboat: room("bvtboat", "The boat shed", "The boat shed: kayaks in racks, paddles on hooks, life jackets in every size, and a chalkboard of who's out on the water."),
      bv_tlake: room("bvtlake", "The Lake House", "The Lake House: big windows onto the water, pancakes and hot chocolate, and a fireplace with armchairs nobody ever wants to leave."),
      bv_tturner: room("bvtturner", "The wood-turner's shop", "The wood-turner's shop: a lathe humming, shavings curling on the floor, and shelves of bowls in red cedar and silky oak.")},
    lines: {hana: ["It's so still. Like a mirror.", "A volcano made this. A long, long time ago."],
      theo: ["Seventy metres deep, the sign says. Imagine.", "That fig tree started at the top and grew down. Down!"],
      farid: ["Ma Ma wants a pancake by the fire.", "So quiet here. Even the birds whisper."],
      mei: ["Gong Gong will sit and watch the water.", "Turtles! Gong Gong saw two."],
      bo: ["Kayak race. Me and Marcus. Loser buys pancakes.", "That tree's got roots like a bead curtain."],
      tomi: ["Zeh, I'm doing a lap of the whole lake.", "The water's so clear you can see the fish."],
      posy: ["I'm going to hang a hammock and never come down.", "A wooden bowl from the shop. For the kitchen. Maybe two."]},
    say: {bvtjetty: "The jetty: grey old timber out over the water, and below, little turtles poking their heads up.",
      bvtfig: "The curtain fig: a giant fig that grew down from the top of another tree, its roots hanging fifteen metres like a curtain.",
      bvttreeroo: "Up in the vines: a tree-kangaroo, brown and round, asleep on a branch with its long tail hanging down.",
      bvtboat: "The boat shed: kayaks stacked outside, red and yellow, and a jetty of its own.",
      bvtlake: "The Lake House: a timber café with big windows on the water and smoke from the chimney.",
      bvtturner: "The wood-turner's shop: a shed on the boardwalk with sawdust on the step and a bowl in the window."}},
  bv_town: {...VAN, n: "Willow Bend", region: "tablelands", screens: ["tr_street", "tr_creek"], arrive: ["tr_street", [130, 560]], station: "bvvan_town", music: "bb_town",
    blurb: "A little river town of timber shops with verandahs: a bakehouse, a lolly shop with jars to the ceiling, a book barn, and a creek with a wooden bridge where the platypus lives.",
    arriveLine: "Into Willow Bend: one wide street, timber shops with tin verandahs, a dog asleep on the footpath, and the smell of fresh bread.",
    evanArrive: ["a LOLLY shop!", "can we have one lolly? one?", "a dog is sleeping!"],
    evanScreen: {tr_street: ["the jars go up to the sky!", "bread! I smell bread!"], tr_creek: ["the platypus! where is he?", "a wooden bridge!"]},
    hints: {tr_street: "Willow Bend: the main street, the bakehouse, the lolly shop, the book barn, the old horse trough and the van. East: the creek.", tr_creek: "The creek: the wooden bridge, the platypus platform and the picnic park. West: back to the main street."},
    spots: famSpots({tr_street: [[220, 420], [320, 440], [260, 520], [400, 500], [180, 480], [360, 560]], tr_creek: [[160, 300], [360, 300], [380, 480], [140, 480], [400, 560], [160, 560]]}),
    acts: {hana: {tr_creek: {act: "hush", at: [196, 326], dir: 1}}, farid: {tr_street: {act: "lollybag", at: [340, 420], dir: -1}}}, rooms: {
      bv_tbakery: room("bvtbakery", "The Willow Bend bakehouse", "The bakehouse: a big old wood oven, loaves on racks, lamingtons and finger buns in the case, and flour on everything."),
      bv_tlolly: room("bvtlolly", "Jarrah's lolly shop", "The lolly shop: jars to the ceiling on every wall, a sliding ladder, paper bags, and a scale that goes ding."),
      bv_tbooks: room("bvtbooks", "The book barn", "The book barn: a tall old barn of second-hand books, armchairs between the shelves, a ladder, and a cat asleep on the poetry.")},
    lines: {hana: ["Look at these old verandahs! Every shop has one.", "The platypus! Shh, everyone, shh."],
      theo: ["A town that still has a bakehouse with a wood oven. Good.", "The bridge is over a hundred years old. Still solid."],
      farid: ["Ma Ma needs a bag of lollies. For Evan. Mostly.", "Fresh bread. Ma Ma can smell it from the van."],
      mei: ["Gong Gong will find a book about birds.", "Slow town. Gong Gong likes slow towns."],
      bo: ["I'm getting a vanilla slice and nobody's stopping me.", "A barn full of books. Angie's going to live here now."],
      tomi: ["Zeh, the platypus. If we see it, best day ever.", "That dog hasn't moved since we got here. Legend."],
      posy: ["A book barn! A whole barn! Don't wait for me.", "The creek is so clear."]},
    say: {bvttrough: "The old horse trough, full of geraniums now, with a brass plaque from 1908.",
      bvtplatypus: "The platypus platform: a little timber deck over the creek. Be very still, and watch for rings on the water.",
      bvtpark: "The picnic park: a big shady fig, a timber table, a swing, and ducks who know exactly what a picnic is.",
      bvtbakery: "The bakehouse: a red-brick oven chimney, a verandah, and a sign: FRESH FROM 6.",
      bvtlolly: "Jarrah's lolly shop: a striped awning, and jars of every colour in the window.",
      bvtbooks: "The book barn: a tall timber barn with its doors open and a sign: BOOKS. SIT. READ."}},
  bv_dairy: {...VAN, n: "Greenhill Dairy", region: "tablelands", screens: ["td_paddock", "td_yard"], arrive: ["td_yard", [130, 560]], station: "bvvan_dairy", music: "bb_dairy",
    blurb: "A family dairy on very green hills: black-and-white cows, calves to bottle-feed, a milking shed at three, a cheese room, and a farm shop with thick milkshakes.",
    arriveLine: "Up a red dirt track to the dairy: green hills, a windmill turning, and black-and-white cows looking up from the grass all at once, chewing.",
    evanArrive: ["COWS! moo moo!", "baby cows! can I pat one?", "it smells like a farm!"],
    evanScreen: {td_yard: ["a milkshake shop!", "a big tank of milk!"], td_paddock: ["the calf licked me!", "the cows are SO big"]},
    hints: {td_yard: "Greenhill Dairy: the milking shed, the cheese room, the farm shop and the van. Up the lane: the paddock.", td_paddock: "The paddock: the herd, the calf pen and the windmill. Down the lane: back to the yard."},
    spots: famSpots({td_yard: [[220, 360], [300, 380], [260, 460], [200, 520], [330, 540], [260, 300]], td_paddock: [[160, 420], [260, 470], [200, 540], [330, 520], [440, 560], [100, 520]]}),
    acts: {theo: {td_yard: {act: "pail", at: [210, 340], dir: 1}}, mei: {td_paddock: {act: "fence", at: [312, 414], dir: 1}}}, rooms: {
      bv_tmilk: room("bvtmilk", "The milking shed", "The milking shed: a long concrete pit, cups on hoses, a radio playing country music, and the cows walking in on their own, one by one."),
      bv_tcheese: room("bvtcheese", "The cheese room", "The cheese room: white tiles, a big steel vat, cheeses on timber shelves turning gold, and everyone in hairnets."),
      bv_tshop: room("bvtshop", "The farm shop", "The farm shop and café: a fridge of milk in glass bottles, a cheese counter, and milkshakes so thick the straw stands up.")},
    lines: {hana: ["Look how the calves follow you around!", "Milk in glass bottles. Like when I was little."],
      theo: ["A hundred and twenty cows, and they know their own names.", "That windmill must be eighty years old."],
      farid: ["Ma Ma wants the cheese. All the cheese.", "Fresh milk, still a bit warm. Very good."],
      mei: ["Gong Gong will talk to the cows. They are good listeners.", "Green, green hills. Very peaceful."],
      bo: ["Milkshake. Large. Chocolate. Thank you.", "That cow's been staring at me for ten minutes."],
      tomi: ["Zeh, I want to try milking one.", "The cheese room is so clean you could eat off the floor."],
      posy: ["The calves have the longest eyelashes!", "I'm buying a cheese for everyone."]},
    say: {bvtcows: "The herd: black-and-white Holsteins, a few brown Jerseys, all chewing, all very interested in you.",
      bvtcalves: "The calf pen: six calves with big ears and long eyelashes, bumping at the rail for their bottles.",
      bvtwindmill: "The old windmill, creaking round, pumping water into the tank for the troughs.",
      bvtmilk: "The milking shed: a long shed with a concrete yard, and at three the cows line up at the gate by themselves.",
      bvtcheese: "The cheese room: a white building with a little window, and a sign: CHEESE MAKING TODAY.",
      bvtshop: "The farm shop: a cream timber shop with a cow-print door and a milk-bottle sign."}},
  bv_nuts: {...VAN, n: "Nutwood Farm", region: "tablelands", screens: ["tm_grove", "tm_shed"], arrive: ["tm_shed", [390, 560]], station: "bvvan_nuts", music: "bb_nuts",
    blurb: "Rows of macadamia trees on red soil, tarps spread under them, an old cracking machine that clatters in the shed, and a hedge of finger limes full of tiny pearls.",
    arriveLine: "Down a red earth track between rows and rows of dark, shiny trees, tarps spread underneath, and from the shed, the clatter of the cracker.",
    evanArrive: ["nuts! falling nuts!", "the dirt is RED", "what's that noise?"],
    evanScreen: {tm_shed: ["the machine goes CRACK", "tiny lime balls! pop pop!"], tm_grove: ["the nuts fall on the blanket!", "can I shake the tree?"]},
    hints: {tm_shed: "Nutwood Farm: the cracking shed, the farm café, the finger lime hedge and the van. West: the macadamia grove.", tm_grove: "The macadamia grove: shake the trees onto the tarps, and the packing shed. East: back to the cracking shed."},
    spots: famSpots({tm_shed: [[220, 360], [300, 400], [160, 420], [420, 380], [260, 480], [120, 520]], tm_grove: [[200, 420], [320, 420], [260, 500], [420, 500], [140, 460], [360, 580]]}),
    acts: {tomi: {tm_grove: {act: "shake", at: [300, 414], dir: -1}}, farid: {tm_shed: {act: "crack", at: [160, 320], dir: 1}}}, rooms: {
      bv_tcrack: room("bvtcrack", "The cracking shed", "The cracking shed: the old cracker clattering away, nuts rattling down a chute, shells flying, and sacks of kernels by the door."),
      bv_tnutcafe: room("bvtnutcafe", "The Nutwood café", "The farm café: macadamia slice, finger-lime soda, a long table on the verandah, and a view down the rows."),
      bv_tpack: room("bvtpack", "The packing shed", "The packing shed: a sorting table, scales, paper bags of nuts with hand-written labels, and boxes of finger limes going to Sydney.")},
    lines: {hana: ["Finger limes! They look like little green caviar.", "Red soil, green trees, blue sky. What colours."],
      theo: ["Macadamias. They're from here, you know. These very hills.", "That cracker's older than me and twice as loud."],
      farid: ["Ma Ma will crack her own. Ma Ma has a good stone.", "Very hard shells. Very sweet inside."],
      mei: ["Gong Gong will sit in the shade of the trees.", "Smell the soil. Good soil."],
      bo: ["The macadamia slice. I'm having two.", "That machine. I love that machine."],
      tomi: ["Zeh, I'm shaking the whole tree. Stand back.", "Finger lime on everything from now on."],
      posy: ["The finger limes pop in your mouth! Try one!", "I'm taking a bag of nuts for everyone at home."]},
    say: {bvttrees: "A macadamia tree heavy with nuts, a green tarp spread underneath. Give it a shake.",
      bvtlimes: "The finger lime hedge: thorny, with long little limes. Squeeze one and tiny pearls of lime pop out.",
      bvttarps: "The tarps: rolled green and blue tarps, buckets, and a wheelbarrow with a wobbly wheel.",
      bvtcrack: "The cracking shed: a big iron shed, its door open, the clatter of the machine coming out.",
      bvtnutcafe: "The Nutwood café: a farmhouse with a deep verandah and long tables.",
      bvtpack: "The packing shed: a little shed at the top of the rows with sacks stacked at the door."}},
  bv_gold: {...VAN, n: "Kingsreef", region: "tablelands", screens: ["tg_station", "tg_street"], arrive: ["tg_station", [130, 560]], station: "bvvan_gold", music: "bb_gold",
    blurb: "An old gold-rush town: a heritage steam train, the Royal Hotel with its iron-lace verandah, an antique shop, and a creek where you can still pan for gold.",
    arriveLine: "Into Kingsreef, and the first thing you hear is a whistle: a little green steam train puffing at the old station, with the whole town looking a hundred years old.",
    evanArrive: ["a TRAIN! a steam train!", "it's puffing smoke!", "can we go on it? can we?"],
    evanScreen: {tg_station: ["choo choo! CHOO CHOO!", "the train has a face! no it doesn't"], tg_street: ["gold! is there gold?", "an old pub with lace"]},
    hints: {tg_station: "Kingsreef: the old station, the steam train, the ticket office museum and the van. Down the hill: the main street.", tg_street: "The main street: the Royal Hotel, the antique shop and the creek for gold panning. Up the hill: back to the station."},
    spots: famSpots({tg_station: [[220, 380], [320, 400], [260, 460], [400, 440], [180, 520], [360, 540]], tg_street: [[200, 360], [320, 380], [260, 420], [400, 400], [140, 420], [360, 300]]}),
    acts: {bo: {tg_street: {act: "pan", at: [230, 534], dir: 1}}, theo: {tg_station: {act: "guard", at: [400, 262], dir: -1, hours: [[9*60, 16*60]]}}, posy: {tg_street: {act: "sip", at: [150, 300], dir: 1}}}, rooms: {
      bv_tticket: room("bvtticket", "The ticket office museum", "The old ticket office: brass ticket punches, a telegraph key, lanterns, photos of the gold diggings, and a ticket window that still works."),
      bv_tpub: room("bvtpub", "The Royal Hotel", "The Royal Hotel: pressed-tin ceiling, a long cedar bar, a piano, and a photo of the biggest nugget ever found here, held up by a man with a magnificent moustache."),
      bv_tantique: room("bvtantique", "Nugget & Co. antiques", "The antique shop: everything from everywhere, teacups and lanterns and a rocking horse, a gramophone, and a bell on the door.")},
    lines: {hana: ["The whole town's like a photograph from a hundred years ago.", "That pub's iron lace! So pretty."],
      theo: ["A real steam engine. Listen to her breathe.", "Gold was found right here in that creek."],
      farid: ["Ma Ma will find something at the antique shop. Something good.", "Very old town. Very well kept."],
      mei: ["Gong Gong rode trains like this when he was young.", "The whistle! Gong Gong likes the whistle."],
      bo: ["I'm going to find gold. Real gold. Watch me.", "If I find a nugget, dinner's on me."],
      tomi: ["Zeh, the steam train! First carriage, front seat.", "The Royal Hotel. They've got sarsaparilla."],
      posy: ["That antique shop is going to take me an hour.", "A teacup with roses on it. I need it."]},
    say: {bvttrain: "The steam train: a little green engine with a brass bell, three red carriages, and steam puffing out of everything.",
      bvtpanning: "The creek: shallow and gravelly, with a sign: GOLD PANNING. Pans at the antique shop. Swirl and look for the glint.",
      bvtticket: "The old station: cream weatherboards, a red tin roof, a clock, and the platform swept spotless.",
      bvtpub: "The Royal Hotel: two storeys, an iron-lace verandah, and a horse-hitching rail out the front.",
      bvtantique: "Nugget & Co.: a rocking horse in the window and a sign: ANTIQUES, CURIOS & GOLD PANS."}}
};

// the places on each screen (a stop's gates between its two screens are bridges)
const P = (scene, name, door, mark, line, more) => ({scene, name, door, spot: true, mark, line, ...(more || {})});
export const TL_PLACES = {
  bvvan_falls: P("tf_top", "The campervan", [150, 560], [150, 470], "Your campervan."),
  bvtview: P("tf_top", "The lookout", [260, 230], [260, 150], "The lookout."),
  bvtcafe: P("tf_top", "The Range Café", [110, 252], [110, 140], "The Range Café."), bvtranger: P("tf_top", "The ranger station", [410, 252], [410, 140], "The ranger station."),
  bvtToPool: P("tf_top", "Down to the falls", [300, 612], [300, 560], "Down the path to the falls.", {bridge: "tf_pool"}),
  bvtfalls: P("tf_pool", "The falls", [260, 336], [260, 200], "The falls."), bvtrock: P("tf_pool", "The sunny rock", [420, 360], [420, 300], "The sunny rock."),
  bvtgallery: P("tf_pool", "The Mistfall gallery", [110, 506], [110, 400], "The gallery."),
  bvtToTop: P("tf_pool", "Up to the top", [480, 176], [450, 150], "Up the path to the top.", {bridge: "tf_top"}),
  bvvan_crater: P("tk_shore", "The campervan", [130, 560], [130, 470], "Your campervan."),
  bvtjetty: P("tk_shore", "The jetty", [260, 396], [260, 300], "The jetty."),
  bvtlake: P("tk_shore", "The Lake House", [105, 392], [105, 290], "The Lake House."), bvtboat: P("tk_shore", "The boat shed", [420, 392], [420, 290], "The boat shed."),
  bvtToFig: P("tk_shore", "To the curtain fig", [504, 480], [476, 420], "East along the boardwalk.", {bridge: "tk_fig"}),
  bvtfig: P("tk_fig", "The curtain fig", [250, 340], [250, 160], "The curtain fig."), bvttreeroo: P("tk_fig", "The tree-kangaroo", [100, 420], [100, 300], "The tree-kangaroo."),
  bvtturner: P("tk_fig", "The wood-turner's shop", [405, 252], [405, 140], "The wood-turner's."),
  bvtToShore: P("tk_fig", "Back to the lake", [16, 480], [44, 420], "West, back to the lake.", {bridge: "tk_shore"}),
  bvvan_town: P("tr_street", "The campervan", [130, 560], [130, 470], "Your campervan."),
  bvtbakery: P("tr_street", "The bakehouse", [110, 252], [110, 140], "The bakehouse."), bvtlolly: P("tr_street", "Jarrah's lolly shop", [260, 252], [260, 140], "The lolly shop."),
  bvtbooks: P("tr_street", "The book barn", [410, 252], [410, 130], "The book barn."), bvttrough: P("tr_street", "The old horse trough", [300, 470], [300, 430], "The horse trough."),
  bvtToCreek: P("tr_street", "To the creek", [504, 400], [476, 340], "East to the creek.", {bridge: "tr_creek"}),
  bvtplatypus: P("tr_creek", "The platypus platform", [180, 320], [180, 250], "The platypus platform."), bvtpark: P("tr_creek", "The picnic park", [400, 520], [400, 450], "The picnic park."),
  bvtToMain: P("tr_creek", "Back to the main street", [16, 400], [44, 340], "West to the main street.", {bridge: "tr_street"}),
  bvvan_dairy: P("td_yard", "The campervan", [130, 560], [130, 470], "Your campervan."),
  bvtmilk: P("td_yard", "The milking shed", [105, 252], [105, 140], "The milking shed."), bvtshop: P("td_yard", "The farm shop", [415, 252], [415, 140], "The farm shop."),
  bvtcheese: P("td_yard", "The cheese room", [410, 526], [410, 420], "The cheese room."),
  bvtToPaddock: P("td_yard", "Up the lane to the paddock", [260, 26], [260, 40], "Up the lane to the paddock.", {bridge: "td_paddock"}),
  bvtcows: P("td_paddock", "The herd", [200, 330], [200, 250], "The cows."), bvtcalves: P("td_paddock", "The calf pen", [390, 420], [390, 330], "The calves."),
  bvtwindmill: P("td_paddock", "The windmill", [80, 300], [80, 160], "The windmill."),
  bvtToYard: P("td_paddock", "Down the lane to the yard", [260, 612], [260, 560], "Down the lane to the yard.", {bridge: "td_yard"}),
  bvvan_nuts: P("tm_shed", "The campervan", [390, 560], [390, 470], "Your campervan."),
  bvtcrack: P("tm_shed", "The cracking shed", [115, 252], [115, 140], "The cracking shed."), bvtnutcafe: P("tm_shed", "The Nutwood café", [405, 252], [405, 140], "The café."),
  bvtlimes: P("tm_shed", "The finger lime hedge", [250, 410], [250, 350], "The finger limes."),
  bvtToGrove: P("tm_shed", "To the macadamia grove", [16, 420], [44, 360], "West into the grove.", {bridge: "tm_grove"}),
  bvttrees: P("tm_grove", "A macadamia tree", [260, 430], [260, 330], "A macadamia tree."), bvttarps: P("tm_grove", "The tarps and buckets", [120, 560], [120, 510], "The tarps."),
  bvtpack: P("tm_grove", "The packing shed", [265, 246], [265, 140], "The packing shed."),
  bvtToShed: P("tm_grove", "Back to the cracking shed", [504, 420], [476, 360], "East, back to the shed.", {bridge: "tm_shed"}),
  bvvan_gold: P("tg_station", "The campervan", [130, 560], [130, 470], "Your campervan."),
  bvttrain: P("tg_station", "The steam train", [330, 262], [330, 150], "The steam train."), bvtticket: P("tg_station", "The ticket office museum", [100, 252], [100, 160], "The ticket office."),
  bvtToMainSt: P("tg_station", "Down to the main street", [260, 612], [260, 560], "Down the hill to the main street.", {bridge: "tg_street"}),
  bvtpub: P("tg_street", "The Royal Hotel", [120, 252], [120, 120], "The Royal Hotel."), bvtantique: P("tg_street", "Nugget & Co. antiques", [405, 252], [405, 140], "The antique shop."),
  bvtpanning: P("tg_street", "The gold creek", [300, 520], [300, 470], "The creek."),
  bvtToStation: P("tg_street", "Up the hill to the station", [260, 300], [200, 290], "Up the hill to the station.", {bridge: "tg_station"})
};
// each room's way out is its own door outside
Object.values(TL_TOWNS).forEach(t => Object.entries(t.rooms).forEach(([rid, r]) => { const p = TL_PLACES[r.door]; TL_PLACES[rid] = {scene: p.scene, name: r.n, door: p.door}; }));
export const TL_BRIDGES = {tf_top: {tf_pool: "bvtToPool"}, tf_pool: {tf_top: "bvtToTop"}, tk_shore: {tk_fig: "bvtToFig"}, tk_fig: {tk_shore: "bvtToShore"},
  tr_street: {tr_creek: "bvtToCreek"}, tr_creek: {tr_street: "bvtToMain"}, td_yard: {td_paddock: "bvtToPaddock"}, td_paddock: {td_yard: "bvtToYard"},
  tm_shed: {tm_grove: "bvtToGrove"}, tm_grove: {tm_shed: "bvtToShed"}, tg_station: {tg_street: "bvtToMainSt"}, tg_street: {tg_station: "bvtToStation"}};
export const TL_ARRIVE = {"tf_top>tf_pool": [450, 200], "tf_pool>tf_top": [300, 572], "tk_shore>tk_fig": [44, 480], "tk_fig>tk_shore": [474, 480],
  "tr_street>tr_creek": [44, 400], "tr_creek>tr_street": [474, 400], "td_yard>td_paddock": [260, 572], "td_paddock>td_yard": [260, 70],
  "tm_shed>tm_grove": [474, 420], "tm_grove>tm_shed": [44, 420], "tg_station>tg_street": [260, 340], "tg_street>tg_station": [260, 572]};
// where you can walk, and what's in the way (the pool, the lake, the creek, the train and the buildings)
export const TL_BOUNDS = {
  tf_top: [14, 240, 506, 616], tf_pool: [14, 150, 506, 616], tk_shore: [14, 380, 506, 616], tk_fig: [14, 240, 506, 616], tr_street: [14, 240, 506, 616], tr_creek: [14, 200, 506, 616],
  td_yard: [14, 26, 506, 616], td_paddock: [14, 150, 506, 616], tm_shed: [14, 240, 506, 616], tm_grove: [14, 240, 506, 616], tg_station: [14, 240, 506, 616], tg_street: [14, 290, 506, 560],
  ...Object.fromEntries(Object.values(TL_TOWNS).flatMap(t => Object.keys(t.rooms)).map(r => [r, [30, 250, 490, 600]]))
};
export const TL_OBST = {
  tf_top: [[50, 150, 170, 250], [350, 150, 470, 250]], tf_pool: [[140, 160, 380, 320], [44, 404, 176, 500], [380, 300, 470, 340]],
  tk_shore: [[34, 290, 176, 386], [354, 290, 486, 386]], tk_fig: [[190, 150, 310, 320], [340, 150, 470, 250], [60, 280, 140, 400]],
  tr_street: [[44, 150, 176, 250], [194, 150, 326, 250], [344, 150, 476, 250], [270, 440, 330, 464]], tr_creek: [[230, 0, 290, 378], [230, 422, 290, 640], [360, 440, 440, 500]],
  td_yard: [[0, 0, 220, 140], [300, 0, 520, 140], [34, 150, 176, 250], [344, 150, 486, 250], [344, 424, 476, 520]], td_paddock: [[40, 150, 120, 290], [330, 340, 450, 400]],
  tm_shed: [[44, 150, 186, 250], [334, 150, 476, 250], [180, 360, 320, 396]], tm_grove: [[50, 300, 130, 360], [390, 300, 470, 360], [200, 150, 330, 240], [380, 500, 460, 560]],
  tg_station: [[0, 100, 520, 236]], tg_street: [[34, 110, 206, 248], [334, 130, 476, 248], [0, 548, 520, 640]],
  // the rooms (round 158): the counter (or the vat, the lathe, the cracker) and the furniture round the edges
  ...Object.fromEntries(["bv_tcafe", "bv_tranger", "bv_tgallery", "bv_tboat", "bv_tlake", "bv_tturner", "bv_tbakery", "bv_tlolly", "bv_tbooks", "bv_tcheese", "bv_tshop", "bv_tcrack", "bv_tnutcafe", "bv_tpack", "bv_tticket", "bv_tpub", "bv_tantique"]
    .map(r => [r, [[140, 222, 380, 300], [40, 430, 130, 500], [396, 440, 490, 505]]])),
  bv_tmilk: [[120, 300, 400, 360], [40, 440, 110, 500], [420, 440, 480, 500]]
};
export const TL_EVAN = {tf_top: [[260, 420], [320, 470], [220, 500]], tf_pool: [[220, 380], [320, 400], [260, 460]], tk_shore: [[220, 460], [320, 480], [260, 540]], tk_fig: [[200, 420], [320, 460], [260, 520]],
  tr_street: [[220, 420], [320, 440], [260, 520]], tr_creek: [[160, 320], [360, 320], [380, 560]], td_yard: [[220, 360], [300, 400], [260, 460]], td_paddock: [[300, 440], [260, 500], [200, 560]],
  tm_shed: [[220, 380], [300, 420], [160, 440]], tm_grove: [[200, 440], [320, 440], [260, 520]], tg_station: [[220, 400], [320, 420], [260, 480]], tg_street: [[200, 380], [320, 400], [260, 440]]};
// the Tablelands on the road map: its own page (region "tablelands"); the road comes up the range from Balloon Lookout
export const TL_MAP = {home: [24, 226], bv_gate: [62, 214], bv_lookout: [70, 168], bv_falls: [112, 124], bv_crater: [150, 64], bv_town: [212, 116], bv_dairy: [250, 48], bv_nuts: [284, 168], bv_gold: [326, 100]};
export const TL_ROADS = [["bv_lookout", "bv_falls"], ["bv_falls", "bv_crater"], ["bv_falls", "bv_town"], ["bv_crater", "bv_town"], ["bv_town", "bv_dairy"], ["bv_town", "bv_nuts"], ["bv_dairy", "bv_gold"], ["bv_nuts", "bv_gold"]];
export const TL_NAMES = {tf_top: "Misty Falls", tf_pool: "Misty Falls: the swimming hole", tk_shore: "Crater Lake", tk_fig: "Crater Lake: the curtain fig",
  tr_street: "Willow Bend", tr_creek: "Willow Bend: the creek", td_yard: "Greenhill Dairy", td_paddock: "Greenhill Dairy: the paddock",
  tm_shed: "Nutwood Farm", tm_grove: "Nutwood Farm: the macadamia grove", tg_station: "Kingsreef", tg_street: "Kingsreef: the main street"};
// Round 158: what the Tablelands' rooms sell (TOWN_GOODS, by room; merged in data/bellbird.js). Macadamias and finger
// limes go in the larder, the gelato and the bonbons (new, from Nutwood Farm); the gold pan is for the creek at
// Kingsreef; the gold fleck and the steam train ticket are keepsakes you earn there (game/tlacts.js).
export const TL_GOODS = {
  b_rosella: {n: "A jar of rosella jam", kind: "gift", to: ["farid", "hana", "mei"], price: 6, shop: "bv_tcafe", art: ["jar", "#B8243A", "#F3E7C8"], say: "Rosella jam! Ruby red and a bit tart, like rhubarb and raspberries. On scones, tomorrow morning."},
  b_cassowary: {n: "A plush cassowary", kind: "gift", to: ["posy", "farid"], price: 9, shop: "bv_tranger", art: ["plush", "#2F2B28"], say: "A cassowary! Black and fluffy with a blue neck and a little helmet. Evan's named it Boss."},
  b_seedpod: {n: "A rainforest seed pod", kind: "keepsake", price: 3, shop: "bv_tranger", art: ["wedge", "#8A6A42", "#C9A06A"], line: "A big woody seed pod from the rainforest floor at Misty Falls, split open like a little boat. The ranger said keep it, there are plenty."},
  b_fallsprint: {n: "A painting of the falls", kind: "keepsake", price: 18, shop: "bv_tgallery", art: ["tile", "#CFE8F0", "#7FA868"], line: "A small painting of Misty Falls in the morning mist, from the gallery by the swimming hole. The rainbow's in it."},
  b_claybird: {n: "A clay kingfisher", kind: "gift", to: ["hana", "farid", "posy"], price: 10, shop: "bv_tgallery", art: ["bird", "#3E86AE"], say: "A little clay kingfisher, bright blue and orange! It's going on the windowsill where it can see the garden."},
  b_lakecap: {n: "A Crater Lake cap", kind: "gift", to: ["theo", "bo", "tomi"], price: 6, shop: "bv_tboat", art: ["beanie", "#3E86AE"], say: "A cap with a little kayak on it! Very sporty. I'll wear it to the shops."},
  b_cedarbowl: {n: "A red cedar bowl", kind: "gift", to: ["hana", "farid", "theo"], price: 16, shop: "bv_tturner", art: ["bowl", "#A8574A"], say: "A bowl turned from red cedar! Feel how smooth. It's going on the table, for fruit. Only the good fruit."},
  b_spoon: {n: "A silky oak spoon", kind: "gift", to: "family", price: 5, shop: "bv_tturner", art: ["sticks", "#C9A06A"], say: "A wooden spoon, carved from silky oak. Look at the grain! Too nice to stir with. I'll stir with it anyway."},
  b_lamingtons: {n: "A box of lamingtons", kind: "gift", to: "family", price: 6, shop: "bv_tbakery", art: ["box", "#8A5A3A", "#F6F1E8"], say: "Lamingtons! Sponge, chocolate and coconut. I'm having one now and the rest after dinner. Maybe."},
  b_lollies: {n: "A paper bag of lollies", kind: "gift", to: ["farid", "bo"], price: 3, shop: "bv_tlolly", art: ["bag", "#F3C969", "#E8566C"], say: "A whole bag of lollies! Snakes, raspberries, freckles and a musk stick. Sharing. Probably."},
  b_freckles: {n: "A jar of chocolate freckles", kind: "gift", to: ["posy", "hana", "mei"], price: 5, shop: "bv_tlolly", art: ["jar", "#5A3A2A", "#F4C7CF"], say: "Freckles! Little chocolate buttons with hundreds and thousands. Exactly like when I was small."},
  b_oldbook: {n: "A second-hand book", kind: "gift", to: ["posy", "mei", "theo", "hana"], price: 4, shop: "bv_tbooks", art: ["box", "#3E6B8C", "#E8D9B8"], say: "An old book with someone's name written inside the cover, from 1962. I love it already."},
  b_bushpoems: {n: "A book of bush poems", kind: "keepsake", price: 6, shop: "bv_tbooks", art: ["box", "#A8443A", "#C9A24A"], line: "A battered little book of bush poems from the book barn at Willow Bend: droving and drought and rain on a tin roof. Someone's pressed a wattle flower in it."},
  b_cheddar: {n: "A wheel of Greenhill vintage", kind: "gift", to: ["theo", "mei", "farid", "bo"], price: 11, shop: "bv_tcheese", art: ["wheel", "#F3D98A", "#C9A24A"], say: "A little wheel of vintage cheddar from the dairy! Sharp enough to make your eyes water. Perfect."},
  b_milkbottle: {n: "A glass milk bottle", kind: "keepsake", price: 3, shop: "bv_tshop", art: ["bottle", "#FFFDF6", "#3E86AE"], line: "An old glass milk bottle from Greenhill Dairy, with a cow on it in blue. Mel keeps a few wildflowers in it."},
  b_cowtowel: {n: "A cow-print tea towel", kind: "gift", to: ["hana", "farid"], price: 6, shop: "bv_tshop", art: ["cloth", "#FFFDF6", "#2F2B28"], say: "A cow-print tea towel! Black and white patches. It moos when you fold it. (It doesn't.)"},
  macadamia: {n: "Macadamias", kind: "ingredient", price: 6, sell: 3, shop: "bv_tcrack", art: ["bag", "#E8D9B8", "#8A6A42"], what: "fresh-cracked from Nutwood Farm: macadamia gelato, a bonbon filling, macadamia honey slice"},
  b_brittle: {n: "Macadamia brittle", kind: "gift", to: "family", price: 6, shop: "bv_tnutcafe", art: ["box", "#E3B04B", "#E8D9B8"], say: "Macadamia brittle! Golden and crunchy and full of nuts. My teeth are worried. I'm not."},
  fingerlime: {n: "Finger limes", kind: "ingredient", price: 5, sell: 2, shop: "bv_tpack", art: ["tube", "#9CC45A", "#C9A0C0"], what: "little native limes full of pearls: finger-lime sorbet, prawns with finger lime"},
  b_macbag: {n: "A bag of roasted macadamias", kind: "gift", to: ["theo", "bo", "mei", "tomi"], price: 7, shop: "bv_tpack", art: ["bag", "#D9C49A", "#8A6A42"], say: "Roasted macadamias, salted! The best nut. Don't argue. I'm not sharing. I'm sharing a bit."},
  b_tlmagnet: {n: "Tablelands fridge magnet", kind: "gift", to: "family", price: 3, shop: "bv_tticket", art: ["disc", "#3E6A4E", "#F3C969"], say: "A little steam train and a waterfall. For the fridge!"},
  b_teacup: {n: "A rose teacup", kind: "gift", to: ["posy", "hana", "farid"], price: 8, shop: "bv_tantique", art: ["cup", "#F4C7CF", "#FFFDF6"], say: "A bone china teacup with roses on it, from the antique shop! It's even got its saucer. Tea, now."},
  b_lantern: {n: "An old railway lantern", kind: "keepsake", price: 16, shop: "bv_tantique", art: ["lantern", "#B8443A", "#F3E3A0"], line: "A red railway lantern from Nugget & Co. in Kingsreef, from the old line. It still lights, with a candle inside."},
  b_goldpan: {n: "A gold pan", kind: "ingredient", price: 4, sell: 2, shop: "bv_tantique", art: ["plate", "#8A7A6A", "#B9AE9E"], what: "a shallow tin pan for the creek at Kingsreef: swirl, and look for the glint"},
  b_goldfleck: {n: "A gold fleck in a tiny bottle", kind: "keepsake", price: 0, art: ["bottle", "#E6F2F4", "#F3C969"], line: "A real fleck of gold from the creek at Kingsreef, panned by you (and Evan, he says), in a tiny glass bottle with a cork."},
  b_steamticket: {n: "A steam train ticket", kind: "keepsake", price: 0, art: ["tile", "#F3E7C8", "#A8443A"], line: "A little card ticket from the Kingsreef steam train, punched by the guard: Kingsreef to Gold Creek Siding and back."}
};
export const TL_KEEP = {b_tlmagnet: "A little steam train and a waterfall, from the Tablelands."};
