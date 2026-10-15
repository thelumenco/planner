// Hokkaido (boat towns, round 222): the long sail north to Japan's snowy island. Big skies, deep winters, steaming
// valleys, seafood breakfasts and rainbow flower fields. Inspired by Otaru (the canal, stone warehouses, gas lamps and
// glassworks), the Hakodate and Sapporo morning markets, Noboribetsu's Jigokudani (the hot springs valley, red oni and
// the free foot bath), Niseko under Mount Yotei, and Furano and Biei's striped flower farms, with red-crowned cranes.
//   hk_niseko (Niseko)                 | hk_flowers (The flower farm)
//   hk_market (Morning market, canal) *| hk_onsen   (The hot springs valley)
// You arrive at the market (bottom left), where your boat ties up at the harbour pier with the sea in the bottom-left
// corner. A ring: the market and Niseko by the road north over the canal bridge (the market's north edge, Niseko's
// south edge); the market and the hot springs along the harbour road (east / west); Niseko and the flower farm across
// the fields (east / west); the flower farm and the hot springs by the lane down the valley (south / north).
// Rooms: the market hall and Kenta's glassworks on the market; Mrs Sato's ryokan in the valley; the ski lodge at
// Niseko; the farm café at the flower farm. (rounds 223 to 225: the rooms, the people and the family's acts)
import { HK_ROOM_OBST, HK_ROOM_PARTY } from "./hokkaido-rooms-layout.js";

// The seasons, on the real calendar (the art and the game both read these):
//   "winter" December to March (deep snow, skiing, the cranes dancing), "spring" 1 to 19 April (the thaw, old snow in
//   patches, buds), "sakura" 20 April to 31 May (cherry blossom on every screen), "summer" June to September (green,
//   the flower stripes in bloom), "autumn" October and November (golden birches, red maples, the harvest).
const monthOf = day => +String(day).slice(5, 7);
const dateOf = day => +String(day).slice(8, 10);
export function hkSeason(day){
  const m = monthOf(day), d = dateOf(day);
  return m === 12 || m <= 3 ? "winter" : m === 4 ? (d < 20 ? "spring" : "sakura") : m === 5 ? "sakura" : m <= 9 ? "summer" : "autumn";
}
export const snowOn = day => hkSeason(day) === "winter";
export const sakuraOn = day => hkSeason(day) === "sakura";
export const stripesOn = day => { const m = monthOf(day); return m >= 6 && m <= 9; };   // the flower stripes in bloom

// what the boat panel says is on the island in a given month (1 to 12)
const seesMonth = m => m === 12 || m <= 2 ? "Deep winter: powder snow at Niseko, the canal lamps glowing in the snow, steam pouring off the hot springs, and the red-crowned cranes dancing in the snowfields. Wrap up very warm."
  : m === 3 ? "The end of winter: still plenty of snow for skiing at Niseko, bright blue days, and the cranes still dancing. The hot springs are perfect after a cold walk."
  : m === 4 ? "Early spring: the snow melting into streams, buds on the cherry trees, and towards the end of the month the first sakura opens by the canal. Bring a jumper."
  : m === 5 ? "Sakura season: cherry blossom on every street and hillside, petals drifting on the canal, and the first green on the birches. The best month for a picnic."
  : m === 6 ? "Early summer: the flower farm in its first stripes, lupins and poppies, fresh sea urchin at the morning market, and long light evenings."
  : m >= 7 && m <= 8 ? "High summer: the flower farm in full rainbow stripes, wildflowers under Mount Yotei, Yubari melons in season, and cool clean air while everywhere else swelters."
  : m === 9 ? "Late summer: the last of the flower stripes, the harvest coming in, and the king crab and salmon roe at their very best at the market."
  : m === 10 ? "Autumn: the birches gone gold and the maples red at Niseko, the first snow on Yotei's top, and steaming bowls of crab hotpot at the market."
  : "Late autumn: the last gold leaves, frost on the boardwalks, the first proper snow arriving, and the hot springs at their cosiest.";

export const HK_TOWNS = {
  hokkaido: {
    n: "Hokkaido", by: "boat", fare: 0, free: ["evan"], outFrom: 8*60, outTo: 14*60, backTo: 19*60,   // (trips.js BOAT_HOME: by boat, home before dark)
    screens: ["hk_market", "hk_onsen", "hk_niseko", "hk_flowers"], arrive: ["hk_market", [180, 470]], station: "hkboat", music: "hokkaido",
    boat: {fuel: 30, pier: "hkboat", arrive: ["hk_market", [180, 470]], sight: "hokkaido",
      blurb: "A long sail north to Hokkaido, Japan's snowy island: a morning market of crab and sea urchin, a canal of stone warehouses and gas lamps, a steaming hot springs valley, the ski slopes under Mount Yotei and a farm of rainbow flowers. Pack a warm jumper whatever the month.",
      arriveLine: "Hokkaido! You come in past the breakwater and tie up at the old harbour pier. Gulls on every bollard, the morning market already busy with crab and sea urchin, and a perfect white cone of a mountain floating far off over the town.",
      sees: seesMonth},
    blurb: "Japan's snowy northern island: a morning market and an old stone canal, a steaming hot springs valley, Niseko under Mount Yotei, and a farm of rainbow flower stripes where cranes dance in winter.",
    arriveLine: "Hokkaido! Cold clean air, gulls crying over the harbour, the smell of grilled scallops from the market, and the gas lamps along the canal still lit from the night.",
    evanArrive: ["Mama, a GIANT crab! with long legs!", "a mountain like an ice cream!", "birdies! on the posts!"],
    evanScreen: {hk_market: ["crabs! big crabs!", "the lamps are on fire!"], hk_onsen: ["smoky water! is it hot?", "a red monster! he's nice"], hk_niseko: ["sledge! sledge! sledge!", "the chairs are flying!"], hk_flowers: ["rainbow! a rainbow on the ground!", "dancing birdies!"]},
    hints: {
      hk_market: "The morning market: your boat at the harbour pier, the market hall, Kenta's glassworks, the crab and sea urchin stalls, the gull on his bollard, and the old canal with its stone warehouses and gas lamps. North: over the canal bridge to Niseko. East: the harbour road to the hot springs valley.",
      hk_onsen: "The hot springs valley: the steaming vents and boardwalks, the red oni with his club, the free foot bath, the egg spring and Mrs Sato's ryokan. West: the harbour road back to the market. North: up the valley lane to the flower farm.",
      hk_niseko: "Niseko under Mount Yotei: the ski lift and the slope, the ski lodge, the birch grove, the sledging hill and the view of the mountain. South: down over the canal bridge to the market. East: across the fields to the flower farm.",
      hk_flowers: "The flower farm: the rainbow stripes, the farm café, the flower hill with its little bell at the top, and the crane meadow by the pond. West: across the fields to Niseko. South: down the valley lane to the hot springs."},
    spots: {
      mum: {hk_market: [[220, 400], [330, 460]], hk_onsen: [[200, 400], [250, 470]], hk_niseko: [[240, 420], [300, 330]], hk_flowers: [[220, 330], [300, 420]]},
      dad: {hk_market: [[260, 220], [380, 400]], hk_onsen: [[250, 290], [300, 380]], hk_niseko: [[290, 230], [220, 520]], hk_flowers: [[210, 300], [360, 380]]},
      mama: {hk_market: [[340, 500], [130, 380]], hk_onsen: [[160, 470], [200, 330]], hk_niseko: [[200, 360], [330, 450]], hk_flowers: [[260, 300], [180, 520]]},
      gonggong: {hk_market: [[70, 200], [80, 204]], hk_onsen: [[290, 500], [300, 506]], hk_niseko: [[160, 470], [170, 474]], hk_flowers: [[280, 450], [288, 455]]},
      darren: {hk_market: [[440, 520], [300, 360]], hk_onsen: [[360, 280], [230, 540]], hk_niseko: [[160, 320], [380, 470]], hk_flowers: [[120, 460], [400, 300]]},
      marcus: {hk_market: [[310, 206], [240, 470]], hk_onsen: [[180, 290], [330, 470]], hk_niseko: [[290, 560], [250, 300]], hk_flowers: [[340, 330], [230, 440]]},
      angelina: {hk_market: [[190, 196], [300, 300]], hk_onsen: [[220, 280], [130, 400]], hk_niseko: [[200, 470], [340, 410]], hk_flowers: [[430, 200], [180, 380]]}
    },
    // what the family do (round 225; nothing done in any earlier town): filled in by the acts round
    acts: {},
    // round 224: five rooms (the market hall, the glassworks, the ryokan, the ski lodge, the farm café): filled in by the rooms round
    rooms: {},
    lines: {
      mum: ["Feet in the hot spring, snow on the trees, and not a single thing to do. I could stay here all winter.", "Every glass float in that shop catches the light a different colour. I want the green one. And the blue one.", "Cherry blossom over the canal. Mel, take a photo of me under it, and then another one in case I blinked."],
      dad: ["This canal was dug a hundred years ago so the ships could unload straight into the warehouses. Now the warehouses sell glass and music boxes.", "Mount Yotei. They call it Ezo Fuji, because it's nearly a perfect cone. Nearly two thousand metres, and it's a volcano.", "The red-crowned crane was down to about thirty birds once. Farmers fed them through the winters, and now there are well over a thousand. Good people."],
      mama: ["Look at this sea urchin. Orange like the sun. Ma Ma is choosing the best tray, so nobody rush Ma Ma.", "King crab this big for this price? Ma Ma would buy two if the boat had a bigger fridge.", "A bowl of rice with every fish on top. Hokkaido people eat like kings for breakfast. Ma Ma approves."],
      gonggong: ["Gong Gong will cook eggs in the hot spring. No stove, no pan. The mountain does the cooking.", "Very good harbour. Very old boats. Gong Gong likes a harbour that still works.", "Cold air, hot water. Gong Gong's knees have never felt better."],
      darren: ["Mel, they put soft-serve on top of melon here. On top of a whole half melon. I'm going to need a minute.", "I've had a crab leg as long as my arm and a bowl of sea urchin and it's only half nine. Best morning of my life.", "Ben says the powder snow here is so light you can't make a snowball. I'm going to try anyway."],
      marcus: ["Zeh, the snow here squeaks when you walk on it. Listen. It actually squeaks.", "Those cranes are doing a full dance routine. Jumping, bowing, flapping. Better moves than me.", "The steam's coming straight out of the ground and it smells like eggs. I love this place."],
      angelina: ["The music boxes in the glassworks all play at once when the door opens. It sounds like snow falling.", "The flower stripes look like someone painted the hill with a ruler. Red, purple, white, orange, pink.", "The gas lamps along the canal are lit even in the daytime when it snows. Everything glows."],
      evan: ["the crab is waving at me!", "Mama, my feet are in the hot puddle!", "the birdies are dancing! I'm dancing too!"]
    },
    say: {
      hkboat: "Your boat, tied up at the old harbour pier among the fishing boats. Sail home whenever you're ready, before dark.",
      hkhall: "The morning market hall: a long low building with red lanterns along the eaves, open since before dawn. Inside, tanks of king crab, trays of sea urchin and bowls of salmon roe glowing like jewels.",
      hkglass: "Kenta's glassworks, in an old stone warehouse by the canal: iron shutters, a glowing furnace inside, glass floats in the window and the tinkle of music boxes every time the door opens.",
      hkcanal: "The old canal: a hundred years old, lined with stone warehouses where the ships once unloaded herring, and a row of gas lamps that are lit every evening. In winter the snow sits on every lamp like a hat.",
      hkstalls: "The outdoor stalls: polystyrene boxes of crab on ice, trays of sea urchin, scallops grilling in their shells with a splash of soy and butter, and stallholders calling out to everyone who passes.",
      hkgull: "A big grey-backed gull on a bollard, watching the crab stalls with great interest. He's here every morning. He knows exactly what time the scallops come off the grill.",
      hkryokan: "Mrs Sato's ryokan: an old inn with a curved tiled roof, a dark wooden front and a navy noren curtain over the door. Her family have kept it for five generations.",
      hkfootbath: "The free foot bath: a little wooden bench beside a stream of warm milky spring water running down from the valley. Take your shoes off, roll up your trousers, and sit.",
      hkvents: "The steaming valley: ochre, rust and white rock, vents hissing and bubbling, and a smell of sulphur on the breeze. The wooden boardwalks wind right through the middle of it.",
      hkoni: "The red oni: a great red-faced ogre with horns and an iron club, guarding the valley. He looks fierce, but the oni here are said to watch over the hot springs and the people who come to bathe.",
      hkeggs: "The egg spring: a pool so hot that the eggs cook in it, lowered in little baskets on ropes. Ten minutes in the spring and they come out with soft wobbly yolks.",
      hklodge: "The ski lodge: a big timber building with a steep roof and a stone chimney puffing woodsmoke. Skis in the rack, boots drying by the door, and hot chocolate inside.",
      hklift: "The ski lift: chairs swinging up the slope on a long cable towards the top of the run. In winter the slope is deep in powder snow; in summer it's green and the lift carries walkers.",
      hkyotei: "The view of Mount Yotei: a nearly perfect cone, white with snow for most of the year. On a clear day it looks close enough to touch.",
      hkbirch: "The birch grove: white trunks with black marks like eyes, light and quiet. Green in summer, the purest gold in autumn, and silver with frost in winter.",
      hksled: "The little sledging hill: in winter a run of packed snow with a row of plastic sledges at the bottom; in summer a soft grass slope for rolling down.",
      hkcafe: "The farm café: white walls, a red roof and a counter of Hokkaido milk soft-serve, melon and pressed flowers. Kumiko runs it, and she always has dirt on her boots from the fields.",
      hkstripes: "The flower stripes: long rolling bands of red poppies, purple lupins, blue salvia, orange marigolds, pink cosmos and white baby's breath, laid across the hill like a rainbow. In winter it's a smooth white snowfield.",
      hkcranes: "The crane meadow: a pond and a reedy meadow where the red-crowned cranes come. They pair for life, and in winter they dance: bowing, leaping and flinging their wings open in the snow.",
      hkhill: "The flower hill: a soft grassy slope down from the bell at the top. Perfect for rolling down, if you don't mind grass in your hair.",
      hkbell: "The little bell on its post at the top of the hill. Ring it once for luck, and look out over the stripes, the farm and the mountains beyond."
    }
  }
};

// Places on the four screens. bridge: a gate to another screen.
export const HK_PLACES = {
  // the morning market: your boat at the pier, the market hall, the glassworks, the canal, the crab stalls, the gull
  hkboat: {scene: "hk_market", name: "Your boat", door: [150, 498], spot: true, mark: [96, 540], line: "Your boat at the harbour pier. Sail home before dark."},
  hkhall: {scene: "hk_market", name: "The market hall", door: [92, 356], spot: true, mark: [92, 270], line: "The morning market hall."},
  hkglass: {scene: "hk_market", name: "Kenta's glassworks", door: [426, 348], spot: true, mark: [426, 262], line: "Kenta's glassworks."},
  hkcanal: {scene: "hk_market", name: "The canal", door: [150, 196], spot: true, mark: [150, 140], line: "The old canal and its gas lamps."},
  hkstalls: {scene: "hk_market", name: "The crab stalls", door: [400, 528], spot: true, mark: [400, 576], line: "The crab and sea urchin stalls."},
  hkgull: {scene: "hk_market", name: "The gull", door: [262, 506], spot: true, mark: [258, 516], line: "A gull on a bollard."},
  hkToNiseko: {scene: "hk_market", name: "The canal bridge", door: [260, 40], spot: true, bridge: "hk_niseko", mark: [260, 90], line: "North over the canal bridge to Niseko."},
  hkToOnsen: {scene: "hk_market", name: "The harbour road", door: [500, 440], spot: true, bridge: "hk_onsen", mark: [450, 420], line: "East along the harbour road to the hot springs."},
  // the hot springs valley: the ryokan, the foot bath, the vents, the oni, the egg spring
  hkryokan: {scene: "hk_onsen", name: "Mrs Sato's ryokan", door: [420, 452], spot: true, mark: [420, 360], line: "Mrs Sato's ryokan."},
  hkfootbath: {scene: "hk_onsen", name: "The foot bath", door: [128, 504], spot: true, mark: [128, 550], line: "The free foot bath."},
  hkvents: {scene: "hk_onsen", name: "The steaming valley", door: [300, 264], spot: true, mark: [360, 140], line: "The steaming valley."},
  hkoni: {scene: "hk_onsen", name: "The red oni", door: [72, 352], spot: true, mark: [62, 280], line: "The red oni and his club."},
  hkeggs: {scene: "hk_onsen", name: "The egg spring", door: [324, 526], spot: true, mark: [324, 580], line: "The egg spring."},
  hkToMarket: {scene: "hk_onsen", name: "The harbour road", door: [20, 440], spot: true, bridge: "hk_market", mark: [70, 420], line: "West along the harbour road to the market."},
  hkToFlowersS: {scene: "hk_onsen", name: "The valley lane", door: [140, 40], spot: true, bridge: "hk_flowers", mark: [140, 90], line: "North up the valley lane to the flower farm."},
  // Niseko: the lodge, the lift, the Yotei view, the birches, the sledging hill
  hklodge: {scene: "hk_niseko", name: "The ski lodge", door: [420, 396], spot: true, mark: [420, 300], line: "The ski lodge."},
  hklift: {scene: "hk_niseko", name: "The ski lift", door: [150, 300], spot: true, mark: [110, 180], line: "The ski lift and the slope."},
  hkyotei: {scene: "hk_niseko", name: "Mount Yotei", door: [290, 206], spot: true, mark: [330, 70], line: "The view of Mount Yotei."},
  hkbirch: {scene: "hk_niseko", name: "The birch grove", door: [118, 410], spot: true, mark: [56, 360], line: "The birch grove."},
  hksled: {scene: "hk_niseko", name: "The sledging hill", door: [150, 490], spot: true, mark: [100, 560], line: "The little sledging hill."},
  hkToMarketS: {scene: "hk_niseko", name: "The road to the canal", door: [260, 612], spot: true, bridge: "hk_market", mark: [200, 600], line: "South over the canal bridge to the market."},
  hkToFlowers: {scene: "hk_niseko", name: "The field road", door: [500, 470], spot: true, bridge: "hk_flowers", mark: [450, 450], line: "East across the fields to the flower farm."},
  // the flower farm: the café, the stripes, the cranes, the hill and its bell
  hkcafe: {scene: "hk_flowers", name: "The farm café", door: [92, 434], spot: true, mark: [92, 340], line: "The farm café and shop."},
  hkstripes: {scene: "hk_flowers", name: "The flower stripes", door: [190, 268], spot: true, mark: [160, 150], line: "The rainbow flower stripes."},
  hkcranes: {scene: "hk_flowers", name: "The crane meadow", door: [380, 452], spot: true, mark: [430, 540], line: "The crane meadow and the pond."},
  hkhill: {scene: "hk_flowers", name: "The flower hill", door: [430, 280], spot: true, mark: [400, 200], line: "The flower hill."},
  hkbell: {scene: "hk_flowers", name: "The hilltop bell", door: [438, 134], spot: true, mark: [470, 80], line: "The little bell at the top of the hill."},
  hkToNisekoW: {scene: "hk_flowers", name: "The field road", door: [20, 480], spot: true, bridge: "hk_niseko", mark: [70, 470], line: "West across the fields to Niseko."},
  hkToOnsenN: {scene: "hk_flowers", name: "The valley lane", door: [240, 612], spot: true, bridge: "hk_onsen", mark: [180, 600], line: "South down the valley lane to the hot springs."}
};
// the rooms: the place each room's door is on, for the Exit
Object.assign(HK_PLACES, {hk_hall: {scene: "hk_market", name: "The market hall", door: [92, 356]}, hk_glass: {scene: "hk_market", name: "Kenta's glassworks", door: [426, 348]},
  hk_ryokan: {scene: "hk_onsen", name: "Mrs Sato's ryokan", door: [420, 452]}, hk_lodge: {scene: "hk_niseko", name: "The ski lodge", door: [420, 396]},
  hk_cafe: {scene: "hk_flowers", name: "The farm café", door: [92, 434]}});
export const HK_BRIDGES = {
  hk_market: {hk_niseko: "hkToNiseko", hk_onsen: "hkToOnsen"}, hk_onsen: {hk_market: "hkToMarket", hk_flowers: "hkToFlowersS"},
  hk_niseko: {hk_market: "hkToMarketS", hk_flowers: "hkToFlowers"}, hk_flowers: {hk_niseko: "hkToNisekoW", hk_onsen: "hkToOnsenN"}
};
export const HK_ARRIVE = {
  "hk_market>hk_niseko": [260, 580], "hk_niseko>hk_market": [260, 80], "hk_market>hk_onsen": [50, 440], "hk_onsen>hk_market": [470, 440],
  "hk_niseko>hk_flowers": [50, 480], "hk_flowers>hk_niseko": [470, 470], "hk_flowers>hk_onsen": [140, 80], "hk_onsen>hk_flowers": [240, 580]
};
// walkable bounds [x1, y1, x2, y2] and obstacles (sea, canal, buildings, slopes, fields, trees)
export const HK_BOUNDS = {
  hk_market: [14, 26, 506, 616], hk_onsen: [14, 26, 506, 616], hk_niseko: [14, 26, 506, 616], hk_flowers: [14, 26, 506, 616],
  hk_hall: [30, 250, 490, 600], hk_glass: [30, 250, 490, 600], hk_ryokan: [30, 250, 490, 600], hk_lodge: [30, 250, 490, 600], hk_cafe: [30, 250, 490, 600]
};
export const HK_OBST = {
  // the warehouses either side of the road north, the canal either side of the bridge, the market hall, the
  // glassworks, the cherry tree by the glassworks, the harbour and its pier, the gull's bollard, the fish crates and
  // nets, the crab stalls, the cherry tree on the quay
  hk_market: [[0, 0, 222, 112], [298, 0, 520, 112], [0, 112, 224, 180], [296, 112, 520, 180], [0, 212, 184, 344], [336, 212, 520, 336], [478, 356, 520, 394],
    [0, 516, 238, 640], [248, 520, 274, 546], [238, 566, 300, 640], [300, 546, 520, 640], [0, 400, 50, 440]],
  // the trees above the valley lane, the steaming valley and its boardwalks, the oni on his plinth, the ryokan, the
  // foot bath, the egg spring, the garden trees by the ryokan, the bushes along the bottom
  hk_onsen: [[0, 0, 94, 226], [196, 0, 520, 248], [22, 248, 104, 336], [328, 284, 520, 440], [28, 518, 228, 598], [262, 542, 390, 640], [410, 486, 520, 640], [0, 598, 262, 640]],
  // the hills and Mount Yotei along the top, the ski slope, the lift station, the viewing deck's bench, the lodge, the
  // birch grove, the sledging hill, the trees in the bottom-right corner
  hk_niseko: [[210, 0, 520, 160], [0, 0, 210, 236], [96, 236, 208, 288], [262, 160, 318, 186], [330, 236, 520, 384], [0, 300, 98, 476], [0, 504, 216, 640], [318, 528, 520, 640]],
  // the stripes on the hill, the sky over the flower hill, the bell post, the café and its terrace, the crane meadow
  // and pond, the flower beds and cherry trees in the bottom-left corner
  hk_flowers: [[0, 0, 330, 252], [330, 0, 520, 92], [454, 92, 474, 126], [0, 296, 172, 422], [300, 466, 520, 640], [0, 540, 196, 640]],
  ...HK_ROOM_OBST
};
export const HK_NAMES = {hk_market: "Hokkaido: the morning market", hk_onsen: "Hokkaido: the hot springs valley", hk_niseko: "Hokkaido: Niseko", hk_flowers: "Hokkaido: the flower farm"};
export const HK_EVAN = {hk_market: [[260, 420], [200, 300], [340, 460], [300, 240]], hk_onsen: [[220, 360], [180, 460], [300, 320], [250, 500]],
  hk_niseko: [[260, 400], [200, 470], [300, 300], [380, 460]], hk_flowers: [[250, 360], [330, 420], [200, 470], [400, 240]]};
