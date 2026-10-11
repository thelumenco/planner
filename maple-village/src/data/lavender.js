// Bellbird Valley's Lavender Hills (round 161, Mel): the fourth and last region, inspired by Provence. Past Riverside
// Camp the road climbs into soft limestone hills: rows of lavender in long purple stripes, a hilltop village with a
// fountain and plane trees, a perfumery in a rose garden, sunflower fields humming with bees, a river with an old
// stone bridge, and a goat farm under a little chapel where everyone goes for the sunset. Warm stone, blue shutters,
// terracotta roofs, cypress trees, and purple everywhere. Same system as the other regions (data/bellbird.js): every
// stop's a van "town" of two screens and three rooms; places start "bvh", rooms "bv_h".
//
//   Lavender Ridge     bv_lavender: hv_rows / hv_still       (one above the other)
//   Montrose           bv_hilltown: hm_square | hm_lanes     (side by side)
//   Rosehill           bv_perfume:  hp_garden / hp_street    (you park in the street, below)
//   Sunflower Hill     bv_honey:    hs_fields | hs_hives     (you park by the hives, on the right)
//   The Old Bridge     bv_bridge:   hb_bridge | hb_bank
//   Chapel Hill        bv_chapel:   hc_goats | hc_chapel

const VAN = {by: "van", fare: 0, free: ["evan"], outFrom: 7*60, outTo: 18*60, backTo: 22*60};
const FAM = ["mum", "dad", "mama", "gonggong", "darren", "marcus", "angelina"];
const famSpots = per => Object.fromEntries(FAM.map((id, i) => [id, Object.fromEntries(Object.entries(per).map(([sc, pts]) => [sc, [pts[i % pts.length], pts[(i + 3) % pts.length]]]))]));
const room = (door, n, say) => ({door, n, music: door.replace(/^bv/, "bv_"), party: [[200, 560], [330, 560], [120, 540], [420, 540]], say});

export const LV_TOWNS = {
  bv_lavender: {...VAN, n: "Lavender Ridge", region: "lavender", screens: ["hv_rows", "hv_still"], arrive: ["hv_rows", [150, 560]], station: "bvvan_lavender", music: "bb_lavender",
    blurb: "Rows and rows of lavender over a soft hill, bees in every one, an old copper still that turns the flowers into oil, a farm shop, and a tea room with lavender scones.",
    arriveLine: "Over the crest and there it is: the whole hillside in purple stripes, the smell coming in through the van windows before you've even stopped, and the hum of a thousand bees.",
    evanArrive: ["it's ALL purple!", "bees! so many bees!", "it smells like Ma Ma's soap!"],
    evanScreen: {hv_rows: ["the bees are on every flower!", "purple, purple, purple!"], hv_still: ["a big copper pot!", "steam! it's cooking flowers!"]},
    hints: {hv_rows: "Lavender Ridge: the lavender rows and the van. Down the lane: the still, the farm shop and the tea room.", hv_still: "The farmyard: the copper still, the farm shop, the tea room. Up the lane: back to the rows."},
    spots: famSpots({hv_rows: [[250, 420], [330, 450], [220, 500], [380, 400], [180, 430], [300, 520]], hv_still: [[220, 360], [300, 380], [260, 460], [200, 520], [330, 540], [260, 300]]}),
    acts: {}, rooms: {
      bv_hstill: room("bvhstill", "The distillery", "The distillery: a great copper still bubbling, glass bottles catching the golden oil, and the whole shed smelling of lavender so strongly your eyes water."),
      bv_hshop: room("bvhshop", "The lavender farm shop", "The farm shop: bunches hanging from the beams, little bags of dried flowers, oil in blue bottles, soaps, and a shelf of lavender honey."),
      bv_htea: room("bvhtea", "The Lavender Ridge tea room", "The tea room: lace curtains, a view down the rows, lavender scones, and lavender lemonade in tall glasses.")},
    lines: {mum: ["I could lie down in these rows and never get up.", "Smell it! You can taste it in the air."],
      dad: ["Every row's planted on the curve of the hill. Clever.", "That still must be a hundred years old. Look at the copper."],
      mama: ["Ma Ma's soap smells like this. Now Ma Ma knows why.", "Lavender scones? Ma Ma will judge them."],
      gonggong: ["Gong Gong likes the bees. Busy, busy. Like Ma Ma.", "Very peaceful. Gong Gong could stay all day."],
      darren: ["There's a bee on me. There's a bee ON me. It's fine. It's fine.", "Lavender lemonade. Sounds weird. Tastes amazing."],
      marcus: ["Zeh, this is going straight on the fridge as a photo.", "Purple as far as you can see."],
      angelina: ["Lavender in everything! The soap, the honey, the scones!", "I'm taking a whole armful home."],
      evan: ["the bees are SINGING", "it's a purple sea!", "can I pick one?"]},
    say: {bvhrows: "The lavender rows: long purple stripes over the hill, humming with bees, each bush a round soft cushion.",
      bvhbench: "A bench at the top of the rows, looking down over all that purple to the hills.",
      bvhstill: "The distillery: a stone shed with a copper chimney puffing sweet-smelling steam.",
      bvhshop: "The farm shop: a stone cottage with blue shutters and bunches drying under the eaves.",
      bvhtea: "The tea room: a little stone house with a vine over the door and tables out front."}},
  bv_hilltown: {...VAN, n: "Montrose", region: "lavender", screens: ["hm_square", "hm_lanes"], arrive: ["hm_square", [130, 560]], station: "bvvan_hilltown", music: "bb_hilltown",
    blurb: "A hilltop village of honey-coloured stone: a square with a fountain and plane trees, a boulangerie, a nougat shop, a café, old men playing pétanque, and lanes that climb to the ramparts.",
    arriveLine: "Up the last switchback into Montrose: a square of warm stone, the fountain splashing, plane trees making dappled shade, and the click of pétanque balls.",
    evanArrive: ["a FOUNTAIN!", "the houses are made of rocks!", "I smell bread!"],
    evanScreen: {hm_square: ["the men are throwing balls!", "a fountain with a fish!"], hm_lanes: ["steps! so many steps!", "a tiny door!"]},
    hints: {hm_square: "Montrose: the square, the fountain, the pétanque piste, the boulangerie, the nougat shop, the café and the van. East: the lanes.", hm_lanes: "The lanes: the old washhouse, the steps up to the ramparts. West: back to the square."},
    spots: famSpots({hm_square: [[220, 400], [320, 420], [260, 520], [180, 460], [360, 560], [300, 300]], hm_lanes: [[200, 380], [300, 420], [380, 380], [260, 500], [160, 520], [420, 520]]}),
    acts: {}, rooms: {
      bv_hboul: room("bvhboul", "La Boulangerie", "The boulangerie: baskets of baguettes standing up like umbrellas, fougasse shaped like leaves, tarts in the window, and a bell on the door."),
      bv_hnougat: room("bvhnougat", "The nougat shop", "The nougat shop: great slabs of white nougat studded with almonds, little calissons in rows, and Madame cutting slices with a big knife."),
      bv_hcafe: room("bvhcafe", "Café de la Place", "The café: little round tables, wicker chairs, a zinc bar, citron pressé, and everyone watching the pétanque through the window.")},
    lines: {mum: ["Everything's the colour of honey here.", "Those blue shutters! I want blue shutters."],
      dad: ["These walls are seven hundred years old. Seven hundred.", "From the ramparts you can see the lavender, the sunflowers and the river."],
      mama: ["A baguette. Ma Ma will carry it. Ma Ma will eat the end.", "Nougat! Ma Ma's teeth say no. Ma Ma says yes."],
      gonggong: ["Gong Gong wants to play with the old men. Gong Gong will win.", "Very old village. Gong Gong feels young here."],
      darren: ["Fresh baguette, still warm. I'm not sharing the crust.", "The steps up to the ramparts. Let's count them. Darren counts."],
      marcus: ["Zeh, this square. This is the life.", "Someone's playing an accordion somewhere. Of course they are."],
      angelina: ["The little doors! Every one a different colour.", "A café in a square under the trees. I've dreamt of this."],
      evan: ["can I put my hand in the fountain?", "the bread is longer than me!", "throw the ball, Gong Gong!"]},
    say: {bvhfountain: "The fountain: an old stone fish spouting water into a mossy basin, and pigeons taking turns to drink.",
      bvhpiste: "The pétanque piste: a gravel strip under the plane trees, old men in caps, and the click of steel balls.",
      bvhramparts: "The ramparts: the old village wall, warm stone, and below, the whole valley in stripes of purple and gold.",
      bvhlavoir: "The old washhouse: a stone basin under a tiled roof, fed by a spring, where the village used to do its laundry.",
      bvhboul: "La Boulangerie: a blue shopfront, baguettes in the window, and a queue on the step.",
      bvhnougat: "The nougat shop: a striped awning and a sign: NOUGAT DE MONTROSE.",
      bvhcafe: "Café de la Place: tables out under the plane trees, and a waiter in a long white apron."}},
  bv_perfume: {...VAN, n: "Rosehill", region: "lavender", screens: ["hp_garden", "hp_street"], arrive: ["hp_street", [130, 560]], station: "bvvan_perfume", music: "bb_perfume",
    blurb: "A little perfume town: a walled garden of roses, jasmine and tuberose, the old perfumery where you can blend your own scent, a soap maker, and a glassblower who makes the bottles.",
    arriveLine: "Into Rosehill, and the air is sweet before you're even out of the van: roses climbing every wall, and a perfumery with its doors open and its windows full of tiny bottles.",
    evanArrive: ["it smells like FLOWERS!", "tiny bottles!", "a man is blowing glass!"],
    evanScreen: {hp_street: ["the glass is ON FIRE", "soap that looks like cake!"], hp_garden: ["roses bigger than my face!", "a bee in the rose!"]},
    hints: {hp_street: "Rosehill: the perfumery, the soap maker, the glassblower and the van. Up the steps: the flower garden.", hp_garden: "The perfumer's garden: the roses, the jasmine and the tuberose. Down the steps: back to the street."},
    spots: famSpots({hp_street: [[220, 360], [300, 380], [260, 460], [200, 520], [330, 540], [260, 300]], hp_garden: [[200, 450], [320, 470], [260, 540], [420, 520], [140, 520], [380, 300]]}),
    acts: {}, rooms: {
      bv_hperfume: room("bvhperfume", "The perfumery", "The perfumery: the perfumer's organ, a curved desk of hundreds of little brown bottles in rows, paper strips for smelling, and old copper stills in the corner."),
      bv_hsavon: room("bvhsavon", "The soap maker", "The soap maker's: blocks of soap stacked like bricks, olive, lavender and rose, a big wooden stamp, and soap cut fresh while you watch."),
      bv_hglass: room("bvhglass", "The glassblower", "The glassblower's: the furnace roaring orange, Luc turning a glowing blob on a long pipe, and shelves of little coloured bottles catching the light.")},
    lines: {mum: ["I'm making a perfume. Mine. Nobody else will smell like me.", "The roses! Smell this one. And this one."],
      dad: ["Watch him blow the glass. That's a skill you can't rush.", "A thousand roses for one tiny bottle. Imagine."],
      mama: ["Ma Ma's soap. From here. Now Ma Ma knows.", "Very nice smell. Ma Ma will wear it to mahjong."],
      gonggong: ["Gong Gong will sit in the garden with the roses.", "The glassblower is very patient. Gong Gong respects him."],
      darren: ["I'm going to make a perfume called Darren. It'll smell like chips.", "That furnace is HOT. I'm standing over here."],
      marcus: ["Zeh, I'm making one for Angie. Don't tell her.", "The soap looks like slices of cake. Don't eat it, Evan."],
      angelina: ["I could spend all day in that perfume shop. Smelling everything.", "Jasmine at night must be amazing here."],
      evan: ["the glass is like honey!", "this soap smells like a cake", "I'm making a perfume for Maple!"]},
    say: {bvhroses: "The rose beds: old roses, pink and cream and deep red, so heavy with flowers they lean on each other.",
      bvhjasmine: "The jasmine walk: a tunnel of white stars, strongest at dusk.",
      bvhperfume: "The perfumery: an old stone building with tall windows full of tiny bottles.",
      bvhsavon: "The soap maker's: a little shop with soap stacked in the window like bricks.",
      bvhglass: "The glassblower's: a workshop with its doors wide open and the glow of the furnace inside."}},
  bv_honey: {...VAN, n: "Sunflower Hill", region: "lavender", screens: ["hs_fields", "hs_hives"], arrive: ["hs_hives", [390, 560]], station: "bvvan_honey", music: "bb_honey",
    blurb: "A honey farm among fields of sunflowers taller than Dad: rows of painted hives, a honey house, a beeswax candle shop, a farmhouse kitchen, and a sunflower maze.",
    arriveLine: "Down a lane between walls of sunflowers, every face turned to the sun, and at the end, a row of hives painted every colour, and the deep, slow hum of bees.",
    evanArrive: ["the flowers are TALLER than Daddy!", "the boxes are for bees!", "a maze! a sunflower maze!"],
    evanScreen: {hs_hives: ["the bees live in the boxes!", "honey! honey!"], hs_fields: ["I'm lost in the sunflowers!", "they're all looking at the sun!"]},
    hints: {hs_hives: "Sunflower Hill: the hives, the honey house, the candle shop and the van. West: the sunflower fields.", hs_fields: "The sunflower fields: the maze, and the farmhouse kitchen. East: back to the hives."},
    spots: famSpots({hs_hives: [[220, 360], [300, 400], [160, 420], [420, 380], [260, 480], [120, 520]], hs_fields: [[200, 420], [320, 420], [260, 500], [420, 500], [140, 460], [360, 580]]}),
    acts: {}, rooms: {
      bv_hhoney: room("bvhhoney", "The honey house", "The honey house: the extractor spinning, honey running gold into buckets, frames of comb against the window, and jars of every shade from pale lemon to dark amber."),
      bv_hcandle: room("bvhcandle", "The beeswax candle shop", "The candle shop: candles rolled from sheets of honeycomb wax, dipped tapers hanging in pairs, and the warm smell of beeswax and honey."),
      bv_hkitchen: room("bvhkitchen", "The farmhouse kitchen", "The farmhouse kitchen: a long scrubbed table, a stove, bunches of herbs, honey cake under a cloth, and Odile's lunch for whoever's there.")},
    lines: {mum: ["Every sunflower's facing the same way. Following the sun.", "Honey still warm from the hive. On bread. Heaven."],
      dad: ["Bees fly two kilometres for one load. Those little legs.", "The sunflowers turn east every night to wait for the sun."],
      mama: ["Lavender honey from here. Ma Ma buys three. No, four.", "A farmhouse lunch. Ma Ma approves."],
      gonggong: ["Gong Gong will watch the bees. Good workers.", "Sunflowers like little suns. Very cheerful."],
      darren: ["I'm going into the maze. If I'm not back in an hour, send honey.", "Bees. Lots of bees. Calm. Stay calm, Darren."],
      marcus: ["Zeh, these sunflowers are like two metres.", "Beekeeping. I want to try it. In the suit. The whole suit."],
      angelina: ["Beeswax candles! They smell like honey when they burn.", "The hives are painted like little houses!"],
      evan: ["I found the middle of the maze!", "the bees said bzzzz to me", "can I have honey on everything?"]},
    say: {bvhhives: "The hives: a row of wooden boxes painted blue, yellow, green and pink, bees streaming in and out.",
      bvhmaze: "The sunflower maze: paths cut through sunflowers taller than you, with a little bench in the middle.",
      bvhhoney: "The honey house: a stone barn with a bee painted over the door.",
      bvhcandle: "The candle shop: a tiny shop with candles in the window, glowing even in the day.",
      bvhkitchen: "The farmhouse: thick stone walls, green shutters, and a long table under a vine outside."}},
  bv_bridge: {...VAN, n: "The Old Bridge", region: "lavender", screens: ["hb_bridge", "hb_bank"], arrive: ["hb_bridge", [130, 560]], station: "bvvan_bridge", music: "bb_bridge",
    blurb: "A green river under a humpbacked stone bridge, willows trailing in the water, a meadow for picnics, an old water mill that's a restaurant now, an épicerie and an ice-cream shop.",
    arriveLine: "Down to the river: a humpbacked bridge of old stone, willows trailing their hair in the green water, dragonflies, and the slow turn of a mill wheel.",
    evanArrive: ["a BRIDGE! a round bridge!", "can we throw sticks?", "a water wheel!"],
    evanScreen: {hb_bridge: ["sticks! I need sticks!", "a duck under the bridge!"], hb_bank: ["ice cream! ICE CREAM!", "the wheel goes round and round"]},
    hints: {hb_bridge: "The Old Bridge: the bridge over the river, the willow and its swing, and the van. East: the riverbank.", hb_bank: "The riverbank: the meadow, the old mill restaurant, the épicerie and the ice-cream shop. West: back to the bridge."},
    spots: famSpots({hb_bridge: [[220, 400], [320, 420], [260, 520], [400, 500], [180, 460], [360, 560]], hb_bank: [[200, 420], [320, 440], [260, 520], [420, 480], [140, 500], [380, 560]]}),
    acts: {}, rooms: {
      bv_hepicerie: room("bvhepicerie", "L'Épicerie", "The épicerie: cheeses and saucisson hanging, olives in tubs, jars of tapenade, picnic baskets ready to go, and a bicycle parked against the counter."),
      bv_hglace: room("bvhglace", "Glacier du Pont", "The ice-cream shop: a long glass case of gelato in swirls, lavender, honey, apricot and melon, and a little bench outside in the shade."),
      bv_hmill: room("bvhmill", "Le Vieux Moulin", "The old mill, now a restaurant: the great wheel turning outside the window, stone walls, white tablecloths, and the sound of water under the floor.")},
    lines: {mum: ["A picnic by the river under the willows. Perfect.", "Listen: the water, the wheel, the birds. That's all."],
      dad: ["That bridge was built without a single drop of mortar. Just stones.", "Pooh-sticks. I'm the champion. Ask anyone."],
      mama: ["A picnic. Ma Ma brought the good containers.", "Apricot ice cream. Ma Ma says yes."],
      gonggong: ["Gong Gong will sit under the willow and rest.", "Old bridge, old mill, old man. Good company."],
      darren: ["I'm going in the river. On a rubber ring. Watch me float.", "Lavender ice cream? Fine. Two scoops."],
      marcus: ["Zeh, dinner at the mill. With the wheel turning. Romantic.", "Dragonflies! Blue ones!"],
      angelina: ["The willow swing! I'm having a go.", "I want to live in a house by this river."],
      evan: ["my stick won! my stick won!", "the wheel is splashing!", "a dragonfly landed on me!"]},
    say: {bvhbridge: "The old bridge: a humpback of grey stone over the green river, worn smooth by centuries of feet. Perfect for Pooh-sticks.",
      bvhwillow: "The willow: its branches trailing in the water, and a rope swing hanging from the big bough.",
      bvhmeadow: "The meadow: long grass and poppies down to the water, perfect for a picnic rug.",
      bvhepicerie: "L'Épicerie: a little grocer's with a striped awning and baskets out front.",
      bvhglace: "Glacier du Pont: a pale blue shop with a big ice-cream cone on the sign.",
      bvhmill: "The old mill: stone walls, a great wooden wheel turning in the race, and tables by the water."}},
  bv_chapel: {...VAN, n: "Chapel Hill", region: "lavender", screens: ["hc_goats", "hc_chapel"], arrive: ["hc_goats", [130, 560]], station: "bvvan_chapel", music: "bb_chapel",
    blurb: "A goat farm on a hillside of wild thyme, with a fromagerie and a farm bistro, and at the top of the hill a tiny stone chapel among the cypresses, where everyone comes to watch the sunset.",
    arriveLine: "Up a white gravel track through wild thyme, past goats with bells clanking, to a farm on the hillside, and above it all, a tiny chapel and three dark cypress trees against the sky.",
    evanArrive: ["GOATS! with BELLS!", "a tiny church!", "the goat is eating my shoe!"],
    evanScreen: {hc_goats: ["the baby goat jumped!", "ding ding ding, the goats!"], hc_chapel: ["we're on top of the world!", "the sun is going down!"]},
    hints: {hc_goats: "Chapel Hill: the goats, the fromagerie, the farm bistro and the van. East: up to the chapel.", hc_chapel: "The hilltop: the little chapel, the cypresses, and the sunset bench. West: back down to the goats."},
    spots: famSpots({hc_goats: [[220, 460], [320, 480], [260, 540], [400, 520], [160, 500], [360, 580]], hc_chapel: [[180, 380], [340, 380], [260, 460], [420, 460], [140, 500], [380, 540]]}),
    acts: {}, rooms: {
      bv_hfromage: room("bvhfromage", "The fromagerie", "The fromagerie: little goat's cheeses on straw mats, some rolled in herbs, some wrapped in chestnut leaves and tied with raffia, and Céline in her white apron."),
      bv_hbistro: room("bvhbistro", "The farm bistro", "The farm bistro: one long table under a vine, warm goat's cheese on toast, salad from the garden, and a view all the way to the lavender."),
      bv_hchapel: room("bvhchapel", "The chapel of Saint Anne", "The chapel: cool and dim, whitewashed walls, a few wooden benches, candles flickering, a little painted ceiling of stars, and the bell rope hanging by the door.")},
    lines: {mum: ["The sunset from up here. I'm not leaving till it's dark.", "Goat's cheese with honey. Try it. Trust me."],
      dad: ["That chapel's nine hundred years old. Still standing.", "The cypresses are like exclamation marks on the hill."],
      mama: ["The goats are very naughty. Ma Ma likes them.", "Ma Ma will light a candle in the little church."],
      gonggong: ["Gong Gong will sit on the bench and watch the sun go.", "Wild thyme everywhere. Smell it when you walk."],
      darren: ["A goat ate my map. Fine. I didn't need it.", "Warm goat's cheese on toast. Life is good."],
      marcus: ["Zeh, the best sunset of the whole trip. Bet you.", "The little church bell. I want to ring it."],
      angelina: ["Cheese wrapped in leaves and tied with string! Like a present!", "The stars on the chapel ceiling. Someone painted every one."],
      evan: ["the goat said MEH", "the sun is so orange!", "ding dong, the bell!"]},
    say: {bvhgoats: "The goats: brown and white, bells clanking, kids leaping off rocks, and one very bold one eyeing your bag.",
      bvhsunset: "The sunset bench: an old stone bench by the cypresses, facing west over the whole valley.",
      bvhfromage: "The fromagerie: a low stone dairy with a cheese on the sign.",
      bvhbistro: "The farm bistro: a long table under a vine pergola, with lanterns strung above.",
      bvhchapel: "The chapel of Saint Anne: tiny, white, with a little bell tower and a wooden door worn grey."}}
};

const P = (scene, name, door, mark, line, more) => ({scene, name, door, spot: true, mark, line, ...(more || {})});
export const LV_PLACES = {
  bvvan_lavender: P("hv_rows", "The campervan", [150, 560], [150, 470], "Your campervan."),
  bvhrows: P("hv_rows", "The lavender rows", [260, 430], [260, 330], "The lavender rows."), bvhbench: P("hv_rows", "The bench at the top", [400, 300], [400, 250], "The bench."),
  bvhToStill: P("hv_rows", "Down the lane to the farmyard", [300, 612], [300, 560], "Down the lane.", {bridge: "hv_still"}),
  bvhstill: P("hv_still", "The distillery", [105, 252], [105, 140], "The distillery."), bvhshop: P("hv_still", "The farm shop", [415, 252], [415, 140], "The farm shop."),
  bvhtea: P("hv_still", "The tea room", [410, 526], [410, 420], "The tea room."),
  bvhToRows: P("hv_still", "Up the lane to the rows", [260, 26], [260, 40], "Up the lane to the rows.", {bridge: "hv_rows"}),
  bvvan_hilltown: P("hm_square", "The campervan", [130, 560], [130, 470], "Your campervan."),
  bvhboul: P("hm_square", "La Boulangerie", [110, 252], [110, 140], "The boulangerie."), bvhnougat: P("hm_square", "The nougat shop", [260, 252], [260, 140], "The nougat shop."),
  bvhcafe: P("hm_square", "Café de la Place", [410, 252], [410, 140], "The café."), bvhfountain: P("hm_square", "The fountain", [260, 476], [260, 420], "The fountain."),
  bvhpiste: P("hm_square", "The pétanque piste", [400, 540], [400, 490], "The pétanque piste."),
  bvhToLanes: P("hm_square", "Up into the lanes", [504, 400], [476, 340], "East into the lanes.", {bridge: "hm_lanes"}),
  bvhramparts: P("hm_lanes", "The ramparts", [300, 262], [300, 150], "The ramparts."), bvhlavoir: P("hm_lanes", "The old washhouse", [140, 440], [140, 370], "The washhouse."),
  bvhToSquare: P("hm_lanes", "Back down to the square", [16, 400], [44, 340], "West to the square.", {bridge: "hm_square"}),
  bvvan_perfume: P("hp_street", "The campervan", [130, 560], [130, 470], "Your campervan."),
  bvhperfume: P("hp_street", "The perfumery", [105, 252], [105, 140], "The perfumery."), bvhsavon: P("hp_street", "The soap maker", [415, 252], [415, 140], "The soap maker."),
  bvhglass: P("hp_street", "The glassblower", [410, 526], [410, 420], "The glassblower."),
  bvhToGarden: P("hp_street", "Up the steps to the garden", [260, 26], [260, 40], "Up the steps to the garden.", {bridge: "hp_garden"}),
  bvhroses: P("hp_garden", "The rose beds", [200, 396], [200, 320], "The roses."), bvhjasmine: P("hp_garden", "The jasmine walk", [390, 416], [390, 340], "The jasmine."),
  bvhToStreet: P("hp_garden", "Down the steps to the street", [260, 612], [260, 560], "Down the steps.", {bridge: "hp_street"}),
  bvvan_honey: P("hs_hives", "The campervan", [390, 560], [390, 470], "Your campervan."),
  bvhhoney: P("hs_hives", "The honey house", [115, 252], [115, 140], "The honey house."), bvhcandle: P("hs_hives", "The candle shop", [405, 252], [405, 140], "The candle shop."),
  bvhhives: P("hs_hives", "The hives", [250, 410], [250, 350], "The hives."),
  bvhToFields: P("hs_hives", "Into the sunflowers", [16, 420], [44, 360], "West into the sunflowers.", {bridge: "hs_fields"}),
  bvhmaze: P("hs_fields", "The sunflower maze", [260, 430], [260, 330], "The maze."), bvhkitchen: P("hs_fields", "The farmhouse kitchen", [265, 246], [265, 140], "The farmhouse."),
  bvhToHives: P("hs_fields", "Back to the hives", [504, 420], [476, 360], "East, back to the hives.", {bridge: "hs_hives"}),
  bvvan_bridge: P("hb_bridge", "The campervan", [130, 560], [130, 470], "Your campervan."),
  bvhbridge: P("hb_bridge", "The old bridge", [260, 252], [260, 170], "The bridge."), bvhwillow: P("hb_bridge", "The willow and the swing", [420, 420], [420, 320], "The willow."),
  bvhToBank: P("hb_bridge", "Along the riverbank", [504, 480], [476, 420], "East along the bank.", {bridge: "hb_bank"}),
  bvhepicerie: P("hb_bank", "L'Épicerie", [110, 252], [110, 140], "The épicerie."), bvhglace: P("hb_bank", "Glacier du Pont", [260, 252], [260, 140], "The ice-cream shop."),
  bvhmill: P("hb_bank", "Le Vieux Moulin", [410, 252], [410, 130], "The old mill."), bvhmeadow: P("hb_bank", "The meadow", [300, 470], [300, 420], "The meadow."),
  bvhToBridge: P("hb_bank", "Back to the bridge", [16, 480], [44, 420], "West, back to the bridge.", {bridge: "hb_bridge"}),
  bvvan_chapel: P("hc_goats", "The campervan", [130, 560], [130, 470], "Your campervan."),
  bvhfromage: P("hc_goats", "The fromagerie", [110, 252], [110, 140], "The fromagerie."), bvhbistro: P("hc_goats", "The farm bistro", [410, 252], [410, 140], "The bistro."),
  bvhgoats: P("hc_goats", "The goats", [260, 430], [260, 350], "The goats."),
  bvhToChapel: P("hc_goats", "Up to the chapel", [504, 420], [476, 360], "East, up the hill.", {bridge: "hc_chapel"}),
  bvhchapel: P("hc_chapel", "The chapel of Saint Anne", [260, 252], [260, 120], "The chapel."), bvhsunset: P("hc_chapel", "The sunset bench", [390, 430], [390, 370], "The sunset bench."),
  bvhToGoats: P("hc_chapel", "Back down to the goats", [16, 420], [44, 360], "West, back down to the goats.", {bridge: "hc_goats"})
};
Object.values(LV_TOWNS).forEach(t => Object.entries(t.rooms).forEach(([rid, r]) => { const p = LV_PLACES[r.door]; LV_PLACES[rid] = {scene: p.scene, name: r.n, door: p.door}; }));
export const LV_BRIDGES = {hv_rows: {hv_still: "bvhToStill"}, hv_still: {hv_rows: "bvhToRows"}, hm_square: {hm_lanes: "bvhToLanes"}, hm_lanes: {hm_square: "bvhToSquare"},
  hp_street: {hp_garden: "bvhToGarden"}, hp_garden: {hp_street: "bvhToStreet"}, hs_hives: {hs_fields: "bvhToFields"}, hs_fields: {hs_hives: "bvhToHives"},
  hb_bridge: {hb_bank: "bvhToBank"}, hb_bank: {hb_bridge: "bvhToBridge"}, hc_goats: {hc_chapel: "bvhToChapel"}, hc_chapel: {hc_goats: "bvhToGoats"}};
export const LV_ARRIVE = {"hv_rows>hv_still": [260, 70], "hv_still>hv_rows": [300, 572], "hm_square>hm_lanes": [44, 400], "hm_lanes>hm_square": [474, 400],
  "hp_street>hp_garden": [260, 572], "hp_garden>hp_street": [260, 70], "hs_hives>hs_fields": [474, 420], "hs_fields>hs_hives": [44, 420],
  "hb_bridge>hb_bank": [44, 480], "hb_bank>hb_bridge": [474, 480], "hc_goats>hc_chapel": [44, 420], "hc_chapel>hc_goats": [474, 420]};
const YARD = [[0, 0, 220, 140], [300, 0, 520, 140], [34, 150, 176, 250], [344, 150, 486, 250], [344, 424, 476, 520]];   // a lane up the middle, two buildings at the top, one low right
const ROW3 = [[44, 150, 176, 250], [194, 150, 326, 250], [344, 150, 476, 250]];   // three shops along the top
export const LV_BOUNDS = {
  hv_rows: [14, 240, 506, 616], hv_still: [14, 26, 506, 616], hm_square: [14, 240, 506, 616], hm_lanes: [14, 240, 506, 616], hp_street: [14, 26, 506, 616], hp_garden: [14, 240, 506, 616],
  hs_hives: [14, 240, 506, 616], hs_fields: [14, 240, 506, 616], hb_bridge: [14, 240, 506, 616], hb_bank: [14, 240, 506, 616], hc_goats: [14, 240, 506, 616], hc_chapel: [14, 240, 506, 616],
  ...Object.fromEntries(Object.values(LV_TOWNS).flatMap(t => Object.keys(t.rooms)).map(r => [r, [30, 250, 490, 600]]))
};
export const LV_OBST = {
  hv_rows: [[360, 270, 440, 296]], hv_still: YARD, hm_square: [...ROW3, [222, 430, 298, 464], [360, 500, 440, 520]], hm_lanes: [[90, 380, 190, 430], [240, 200, 360, 250]],
  hp_street: YARD, hp_garden: [[130, 340, 270, 386], [320, 360, 460, 406]], hs_hives: [[44, 150, 186, 250], [334, 150, 476, 250], [180, 360, 320, 396]], hs_fields: [[200, 150, 330, 240], [190, 360, 330, 420]],
  hb_bridge: [[380, 300, 460, 400]], hb_bank: [...ROW3, [250, 420, 350, 460]], hc_goats: [[44, 150, 176, 250], [344, 150, 476, 250], [190, 350, 330, 410]], hc_chapel: [[190, 90, 330, 246], [350, 400, 430, 420]],
  // the rooms (round 162): the counter (or the organ, the furnace, the extractor) and the furniture round the edges
  ...Object.fromEntries(["bv_hstill", "bv_hshop", "bv_htea", "bv_hboul", "bv_hnougat", "bv_hcafe", "bv_hperfume", "bv_hsavon", "bv_hglass", "bv_hhoney", "bv_hcandle", "bv_hkitchen", "bv_hepicerie", "bv_hglace", "bv_hmill", "bv_hfromage", "bv_hbistro"]
    .map(r => [r, [[140, 222, 380, 300], [40, 430, 130, 500], [396, 440, 490, 505]]])),
  bv_hchapel: [[120, 380, 220, 420], [300, 380, 400, 420], [210, 200, 310, 300]]
};
export const LV_EVAN = {hv_rows: [[260, 420], [320, 470], [220, 500]], hv_still: [[220, 360], [300, 400], [260, 460]], hm_square: [[220, 420], [320, 440], [260, 520]], hm_lanes: [[200, 380], [300, 420], [260, 500]],
  hp_street: [[220, 360], [300, 400], [260, 460]], hp_garden: [[200, 450], [320, 470], [260, 540]], hs_hives: [[220, 380], [300, 420], [160, 440]], hs_fields: [[200, 440], [320, 440], [260, 520]],
  hb_bridge: [[220, 400], [320, 420], [260, 520]], hb_bank: [[200, 420], [320, 440], [260, 520]], hc_goats: [[220, 460], [320, 480], [260, 540]], hc_chapel: [[180, 380], [340, 380], [260, 460]]};
// the Lavender Hills on the road map: its own page (region "lavender"); the road comes in from Riverside Camp
export const LV_MAP = {home: [24, 226], bv_gate: [62, 214], bv_camp: [84, 168], bv_lavender: [130, 124], bv_hilltown: [176, 62], bv_honey: [206, 170], bv_perfume: [244, 100], bv_bridge: [286, 186], bv_chapel: [326, 96]};
export const LV_ROADS = [["bv_camp", "bv_lavender"], ["bv_lavender", "bv_hilltown"], ["bv_lavender", "bv_honey"], ["bv_hilltown", "bv_perfume"], ["bv_honey", "bv_bridge"], ["bv_perfume", "bv_chapel"], ["bv_bridge", "bv_chapel"], ["bv_honey", "bv_perfume"]];
export const LV_NAMES = {hv_rows: "Lavender Ridge", hv_still: "Lavender Ridge: the farmyard", hm_square: "Montrose", hm_lanes: "Montrose: the lanes",
  hp_street: "Rosehill", hp_garden: "Rosehill: the perfumer's garden", hs_hives: "Sunflower Hill", hs_fields: "Sunflower Hill: the fields",
  hb_bridge: "The Old Bridge", hb_bank: "The Old Bridge: the riverbank", hc_goats: "Chapel Hill", hc_chapel: "Chapel Hill: the chapel"};
// Round 162: what the Lavender Hills' rooms sell (TOWN_GOODS, by room; merged in data/bellbird.js). Sunflower honey
// goes in the gelato and the bonbons; the lavender itself you pick at Lavender Ridge (game/lvacts.js: bunches, for the
// mill and the gelato). Your own perfume, Evan's maze certificate and the chapel's little medal are keepsakes you earn.
export const LV_GOODS = {
  b_lavoil: {n: "Lavender oil in a blue bottle", kind: "gift", to: ["mum", "mama", "angelina"], price: 9, shop: "bv_hshop", art: ["bottle", "#3E6B8C", "#9A7CC8"], say: "Lavender oil from the still! One drop on the pillow and I'll sleep like a baby."},
  b_lavbags: {n: "Little lavender bags", kind: "gift", to: "family", price: 4, shop: "bv_hshop", art: ["bag", "#E6DCF3", "#9A7CC8"], say: "Lavender bags for the drawers! Everything's going to smell like Provence."},
  b_lavbunch: {n: "A dried lavender bunch", kind: "keepsake", price: 5, shop: "bv_hstill", art: ["sticks", "#9A7CC8"], line: "A bunch of lavender from Lavender Ridge, tied with raffia, hung upside down to dry. The whole room smells of it."},
  b_fougasse: {n: "A fougasse", kind: "gift", to: "family", price: 4, shop: "bv_hboul", art: ["loaf", "#D9A05A"], say: "A fougasse! Bread shaped like a leaf, with olives and rosemary. Tear and share. Or don't share."},
  b_nougat: {n: "A slab of nougat", kind: "gift", to: ["mama", "darren", "gonggong", "evan"], price: 6, shop: "bv_hnougat", art: ["box", "#FFFDF6", "#D9A05A"], say: "White nougat with almonds and lavender honey! Chewy. Gooey. Gone."},
  b_calissons: {n: "A box of calissons", kind: "gift", to: ["mum", "angelina", "dad"], price: 8, shop: "bv_hnougat", art: ["box", "#F3E7B0", "#C8643B"], say: "Calissons! Little diamond sweets of almond and melon, iced white. So pretty I almost can't eat them. Almost."},
  b_savon: {n: "A block of Provence soap", kind: "gift", to: "family", price: 5, shop: "bv_hsavon", art: ["soap", "#E6DCF3"], say: "Real olive oil soap from Rosehill, with lavender! It's stamped and everything."},
  b_soapstamp: {n: "A wooden soap stamp", kind: "keepsake", price: 9, shop: "bv_hsavon", art: ["sticks", "#B98A5E"], line: "An old wooden soap stamp from the soap maker at Rosehill, carved with a little sprig of lavender. Mel stamps her own soaps with it now."},
  b_glassbird: {n: "A blown-glass bird", kind: "keepsake", price: 14, shop: "bv_hglass", art: ["bird", "#9FD3C2"], line: "A little blue-green bird blown from glass by Luc at Rosehill. It catches the morning light on the windowsill."},
  b_scentbottle: {n: "A tiny glass scent bottle", kind: "gift", to: ["angelina", "mum", "mama"], price: 10, shop: "bv_hglass", art: ["bottle", "#B79BDC", "#F3C969"], say: "A tiny glass bottle, hand-blown, with a glass stopper like a flower! For perfume. Or just for looking at."},
  honey_sun: {n: "Sunflower honey", kind: "ingredient", price: 7, sell: 4, shop: "bv_hhoney", art: ["jar", "#E3B04B", "#F3C93A"], what: "golden and creamy, from Sunflower Hill: for gelato and bonbons"},
  b_honeypot: {n: "A pot of honey with a dipper", kind: "gift", to: "family", price: 8, shop: "bv_hhoney", art: ["jar", "#F3D98A", "#8A6A42"], say: "Honey with a little wooden dipper! Drizzle, drizzle. On toast. On everything."},
  b_candle: {n: "A beeswax candle", kind: "gift", to: ["mum", "mama", "angelina", "gonggong"], price: 6, shop: "bv_hcandle", art: ["candle", "#F3D98A"], say: "A beeswax candle! It smells like honey when it burns. For the dinner table."},
  b_tapenade: {n: "A jar of tapenade", kind: "gift", to: ["dad", "darren", "gonggong", "marcus"], price: 6, shop: "bv_hepicerie", art: ["jar", "#4A4A3A", "#9DAF6A"], say: "Tapenade! Olives, capers, a bit of anchovy. On a cracker with a glass of something. Bliss."},
  b_picnic: {n: "A little picnic basket", kind: "keepsake", price: 15, shop: "bv_hepicerie", art: ["tote", "#C9A06A"], line: "A wicker picnic basket from the épicerie by the Old Bridge, with a gingham lining. For every picnic from now on."},
  b_chevre: {n: "A goat's cheese in a chestnut leaf", kind: "gift", to: ["dad", "mama", "gonggong", "darren", "angelina"], price: 7, shop: "bv_hfromage", art: ["wheel", "#FFF8EC", "#7A5A3A"], say: "A little goat's cheese wrapped in a chestnut leaf and tied with raffia! Like a present. It is a present."},
  b_myperfume: {n: "Your own perfume", kind: "keepsake", price: 0, art: ["bottle", "#E8A0B4", "#F3C969"], line: "A little bottle of the perfume you blended yourself at the perfumery in Rosehill, with your own name for it on the label in the perfumer's handwriting."},
  b_mazecert: {n: "Evan's sunflower maze certificate", kind: "keepsake", price: 0, art: ["tile", "#F3C93A", "#5E8A3A"], line: "A certificate from Sunflower Hill: Evan found the middle of the sunflower maze, with a sunflower stamp and Odile's signature."},
  b_bellmedal: {n: "A little chapel bell", kind: "keepsake", price: 0, art: ["bell", "#C9A24A"], line: "A tiny brass bell from the chapel of Saint Anne on Chapel Hill, for ringing the bell at sunset. It tinkles when the door opens."}
};
export const LV_KEEP = {};
