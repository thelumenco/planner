// Bali (boat towns, round 218): the long sail east to the island of the gods. Inspired by Sanur's fishing beach, Ubud,
// the Jatiluwih rice terraces and the Tirta Empul water temple. Warm, green and gold; offerings (canang sari) on every
// step; gamelan in the air; frangipani; slow mornings.
//   ba_terraces (Rice terraces) | ba_beach (Sanur beach *)
//   ba_temple   (Water temple)  | ba_ubud  (Ubud village)
// You arrive on the beach (top right), where your boat comes in among the jukung outrigger boats with the sea along the
// top. A ring: the beach and the terraces are joined along the coconut track (the beach's west edge, the terraces'
// east edge); the beach and Ubud by the lane inland (south / north); the terraces and the temple by the path down
// through the paddies (south / north); the temple and Ubud along the village road (east / west).
// Rooms: Nyoman's warung on the sand; Ibu Wayan's offerings house, Ketut's silver workshop and the market hall in Ubud;
// the gamelan pavilion at the temple. (rounds 219 to 221: the rooms, the people and the family's acts)
import { BA_ROOM_OBST, BA_ROOM_PARTY } from "./bali-rooms-layout.js";

// The seasons, on the real calendar (the art and the game both read these):
//   "dry" April to October (golden light; the rice harvest turns the terraces gold August to October; kites over the
//   beach July to September), "wet" November to March (vivid green, short afternoon downpours).
const monthOf = day => +String(day).slice(5, 7);
export function baliSeason(day){ const m = monthOf(day); return m >= 4 && m <= 10 ? "dry" : "wet"; }
export const baHarvest = day => [8, 9, 10].includes(monthOf(day));   // the terraces gold and the harvest in
export const baKites = day => [7, 8, 9].includes(monthOf(day));      // kite season over the beach
export const baNyepi = day => monthOf(day) === 3;                    // the month of the Day of Silence
// Galungan: penjor poles (tall curved bamboo, decorated with palm-leaf) line the lanes on some days: the first five
// days of every thirty, counting the days of the year from 0 on the 1st of January.
export function galunganOn(day){
  const d = String(day).slice(0, 10), doy = Math.round((Date.parse(d + "T00:00:00Z") - Date.parse(d.slice(0, 4) + "-01-01T00:00:00Z"))/864e5);
  return doy % 30 < 5;
}

// what the boat panel says is on the island in a given month (1 to 12)
const seesMonth = m => m >= 8 && m <= 9 ? "The dry season, and harvest time: the rice terraces have turned gold and the farmers are cutting it by hand. Kites the size of boats over the beach on the trade winds."
  : m === 7 ? "The dry season: blue skies, cool mornings, and kite season on the beach. Huge fish and bird kites humming over the sea all afternoon."
  : m === 10 ? "The end of the dry season: the last of the harvest gold on the terraces, warm still evenings, and the first clouds building over the mountains."
  : m >= 4 && m <= 6 ? "The dry season: golden light, calm seas, and the terraces flooded like mirrors with the young rice just planted."
  : m === 3 ? "The tail of the wet season: everything vivid green, and in March the island keeps Nyepi, the Day of Silence. Afternoon showers, then sunshine."
  : "The wet season: the terraces a vivid electric green, frangipani everywhere, and a warm short downpour most afternoons. Mornings are lovely.";

export const BA_TOWNS = {
  bali: {
    n: "Bali", by: "boat", fare: 0, free: ["evan"], outFrom: 8*60, outTo: 14*60, backTo: 19*60,   // (trips.js BOAT_HOME: by boat, home before dark)
    screens: ["ba_beach", "ba_ubud", "ba_terraces", "ba_temple"], arrive: ["ba_beach", [300, 220]], station: "baboat", music: "bali",
    boat: {fuel: 30, pier: "baboat", arrive: ["ba_beach", [300, 220]], sight: "bali",
      blurb: "The longest sail of all, east to the island of the gods: a palm-fringed beach of painted outrigger boats, a volcano in the clouds, rice terraces like green stairs, and a little offering of flowers on every step. Pack a picnic and a sunhat.",
      arriveLine: "Bali! You come in over the reef at Sanur and nose up onto the sand among the jukung, the painted outrigger boats with eyes on their bows. Mount Agung floats in the haze above the palms, and the air smells of frangipani and incense.",
      sees: seesMonth},
    blurb: "The island of the gods: a fishing beach of painted outrigger boats, the village of Ubud, rice terraces like green stairs, and a water temple with sacred springs.",
    arriveLine: "Bali! Warm sand, painted boats, palms leaning over the water, and a little tray of flowers and incense on the step of every shrine.",
    evanArrive: ["Mama, the boats have EYES!", "a volcano! is it hot?", "flowers on the ground! for me?"],
    evanScreen: {ba_beach: ["boats with eyes!", "kites! big kites!"], ba_ubud: ["monkeys! cheeky monkeys!", "a giant tree with hair!"], ba_terraces: ["duckies! in a line!", "big green stairs!"], ba_temple: ["fishies! orange fishies!", "water coming out of the mouths!"]},
    hints: {
      ba_beach: "Sanur beach: your boat by the jukung outriggers, Nyoman's warung on the sand, the kites, and the little beach shrine. West: the coconut track up to the rice terraces. South: the lane inland to Ubud.",
      ba_ubud: "Ubud: Ibu Wayan's offerings house, Ketut's silver workshop, the market hall and its shrine, the great banyan and the gate of the monkey forest. North: the lane back to the beach. West: the road to the water temple.",
      ba_terraces: "The rice terraces: green stairs down the hillside, the bamboo pavilion, the paddy ducks, the scarecrow with bells and Dewi Sri's shrine. East: the coconut track down to the beach. South: the path through the paddies to the water temple.",
      ba_temple: "The water temple: the split gate, the spring pools and their fountain spouts, the lotus and koi pond, the gamelan pavilion and the temple shrine. North: up through the paddies to the terraces. East: the road to Ubud."},
    spots: {
      mum: {ba_beach: [[262, 300], [330, 460]], ba_ubud: [[200, 300], [300, 460]], ba_terraces: [[200, 296], [250, 470]], ba_temple: [[230, 300], [300, 400]]},
      dad: {ba_beach: [[180, 470], [380, 380]], ba_ubud: [[150, 320], [260, 330]], ba_terraces: [[360, 280], [270, 560]], ba_temple: [[200, 400], [330, 460]]},
      mama: {ba_beach: [[140, 400], [260, 520]], ba_ubud: [[330, 520], [220, 420]], ba_terraces: [[160, 320], [230, 400]], ba_temple: [[160, 420], [280, 280]]},
      gonggong: {ba_beach: [[120, 380], [130, 390]], ba_ubud: [[180, 400], [190, 410]], ba_terraces: [[100, 340], [110, 345]], ba_temple: [[110, 400], [120, 410]]},
      darren: {ba_beach: [[380, 330], [200, 560]], ba_ubud: [[300, 300], [240, 450]], ba_terraces: [[300, 320], [220, 520]], ba_temple: [[330, 330], [326, 566]]},
      marcus: {ba_beach: [[260, 260], [420, 530]], ba_ubud: [[304, 548], [340, 380]], ba_terraces: [[420, 320], [290, 440]], ba_temple: [[340, 600], [212, 330]]},
      angelina: {ba_beach: [[340, 270], [100, 520]], ba_ubud: [[90, 300], [230, 560]], ba_terraces: [[180, 290], [210, 600]], ba_temple: [[250, 410], [300, 340]]}
    },
    acts: {},
    rooms: {},
    lines: {
      mum: ["Every single step has a little tray of flowers on it. Somebody made all of those this morning. By hand.", "I'm tucking a frangipani behind my ear and nobody can stop me.", "Listen. That's the gamelan. It sounds like water running over bells."],
      dad: ["The terraces are watered by the subak: one shared system of channels, run by the farmers together for a thousand years. It's on the World Heritage list.", "Those outrigger boats are called jukung. The eyes on the bow are so the boat can see its way home.", "Mount Agung. Over three thousand metres, and the holiest mountain on the island. Every temple faces it."],
      mama: ["Snake fruit! Skin like a snake, inside like a pineapple and an apple together. Ma Ma is buying a bag.", "The ladies carry the whole market on their heads. Ma Ma could do this. Ma Ma used to do this.", "Ma Ma will learn to make the little flower trays. Very neat. Very patient."],
      gonggong: ["Rice growing on stairs all the way up the mountain. Gong Gong respects these farmers very much.", "Gong Gong will sit in the bamboo hut and watch the ducks. Nobody needs to hurry here.", "Good boats. Light and quick. The arms keep them steady in the waves. Clever."],
      darren: ["Mel, the warung does a nasi campur with about nine things on one plate. I've counted. I'm going back for a tenth.", "I'm going to help plant some rice. How hard can it be? Don't answer that.", "A fresh coconut with a straw in it. This is the best decision I've made all year."],
      marcus: ["Zeh, a monkey just looked me dead in the eye and took someone's sunglasses. Respect.", "Those kites are bigger than our car. People fly them in teams with a rope like a tug of war.", "There's a carp in that pond the size of my arm. I've named him Kevin."],
      angelina: ["The water from the springs comes out of carved mouths, one after another. It's like a poem that keeps going.", "A whole tree that grows down from its own branches. Banyans are ridiculous. I love them.", "The incense smoke goes straight up when there's no wind. Everything here feels like it's listening."],
      evan: ["the boat is looking at me!", "monkey! a monkey on a man!", "duckies walking walking walking"]
    },
    say: {
      baboat: "Your boat, pulled up among the jukung at the edge of the reef. Sail home whenever you're ready, before dark.",
      bawarung: "Nyoman's warung on the sand: a thatched roof, low wooden tables, a glass cabinet of nasi campur dishes and a pile of green coconuts by the door.",
      bajukung: "The jukung, the fishing outriggers of Sanur: slim painted hulls on bamboo arms, a swordfish snout on the bow and a big painted eye so each boat can see its way home.",
      bakites: "The kites of Sanur: fish and birds and leaves of cloth and bamboo, some so big it takes a whole team with a rope to fly them. Kite season is July to September, when the trade winds blow.",
      bashrine1: "A little beach shrine on its stone step, wrapped in a yellow cloth under a white umbrella. Fresh canang sari on the ledge this morning, and a thread of incense smoke.",
      baoffer: "Ibu Wayan's offerings house: a carved family gate under a thatched roof, baskets of petals by the step, and the sound of palm leaves being folded inside.",
      basilver: "Ketut's silver workshop: a little carved shopfront, a case of bright filigree in the window, and the tick tick tick of a tiny hammer.",
      bamarket: "The market hall: two great roofs on wooden posts, and underneath it everything at once: spices, snake fruit, sarongs, baskets, coffee and kites.",
      bamonkeys: "The gate of the Sacred Monkey Forest: mossy stone, dragon steps, and long-tailed macaques sitting on the carvings watching who comes in. Hold on to your hat.",
      babanyan: "The great banyan: a whole forest of a tree, its roots hanging down from its branches like curtains. Its trunk is wrapped in a black-and-white checked cloth, because it is sacred.",
      bashrine2: "The market shrine: a little stone house on a post, its ledge heaped with offerings by the stallholders before they open. The first sale of the day is for the gods.",
      bapaddy: "The paddies: terrace after terrace stepping down the hillside, each one brimming with water from the channel above, rice in neat rows, and the sky in every pool.",
      babale: "The bamboo pavilion: a raised platform under a thatched roof where the farmers rest in the hottest part of the day. There's a breeze up here, and a view down all the terraces.",
      baducks: "The paddy ducks: tall, upright runner ducks marching in a line behind their keeper's flag, eating the snails and weeds between the rice. Very busy. Very serious.",
      bascarecrow: "The scarecrow in the paddy: an old shirt and a rice farmer's hat, with strings of bells and tin cans running out to the bamboo poles. When the wind blows the whole field jingles.",
      bashrine3: "Dewi Sri's shrine: a tiny shrine on a bamboo post at the corner of the paddy, for the goddess of rice. Yellow cloth, a palm-leaf offering, and a few grains of rice.",
      bagamelan: "The gamelan pavilion: an open bale with a tiered roof, carved red and gold, and the bronze instruments shining inside. Somebody is practising a pattern, over and over.",
      bapools: "The spring pools: holy water rising cold and clear from the ground, pouring out of a long row of carved stone spouts. People wade from one spout to the next in their sarongs, praying.",
      bakoi: "The lotus and koi pond: pink lotus standing up out of the leaves, and great slow orange and white koi turning underneath.",
      bagate: "The split gate, the candi bentar: one tall carved tower of brick and stone cut cleanly in two, so you walk through the middle. Put on a sash or a sarong to go in.",
      bashrine4: "The temple shrine: a meru, its roofs of black palm fibre stacked one above another, under yellow and white umbrellas. Canang sari all along the steps."
    }
  }
};

// Places on the four screens. bridge: a gate to another screen.
export const BA_PLACES = {
  // the beach: your boat, the jukung, the warung, the kites, the beach shrine
  baboat: {scene: "ba_beach", name: "Your boat", door: [300, 200], spot: true, mark: [300, 140], line: "Your boat on the reef edge. Sail home before dark."},
  bajukung: {scene: "ba_beach", name: "The jukung", door: [430, 314], spot: true, mark: [440, 230], line: "The jukung outrigger boats."},
  bawarung: {scene: "ba_beach", name: "Nyoman's warung", door: [96, 358], spot: true, mark: [96, 250], line: "Nyoman's warung on the sand."},
  bakites: {scene: "ba_beach", name: "The kites", door: [214, 364], spot: true, mark: [214, 310], line: "The kites of Sanur."},
  bashrine1: {scene: "ba_beach", name: "The beach shrine", door: [452, 490], spot: true, mark: [452, 420], line: "The little beach shrine."},
  baToTerraces: {scene: "ba_beach", name: "The coconut track", door: [20, 470], spot: true, bridge: "ba_terraces", mark: [70, 450], line: "West up the coconut track to the rice terraces."},
  baToUbud: {scene: "ba_beach", name: "The lane inland", door: [300, 612], spot: true, bridge: "ba_ubud", mark: [240, 600], line: "South along the lane inland to Ubud."},
  // Ubud: the offerings house, the silver workshop, the market hall and its shrine, the banyan, the monkey forest gate
  baoffer: {scene: "ba_ubud", name: "Ibu Wayan's offerings house", door: [130, 242], spot: true, mark: [130, 160], line: "Ibu Wayan's offerings house."},
  basilver: {scene: "ba_ubud", name: "Ketut's silver workshop", door: [424, 242], spot: true, mark: [424, 160], line: "Ketut's silver workshop."},
  bamarket: {scene: "ba_ubud", name: "The market hall", door: [440, 458], spot: true, mark: [440, 360], line: "The market hall."},
  bashrine2: {scene: "ba_ubud", name: "The market shrine", door: [338, 488], spot: true, mark: [338, 440], line: "The market shrine."},
  babanyan: {scene: "ba_ubud", name: "The great banyan", door: [212, 520], spot: true, mark: [110, 500], line: "The great banyan tree."},
  bamonkeys: {scene: "ba_ubud", name: "The monkey forest gate", door: [300, 572], spot: true, mark: [300, 540], line: "The gate of the monkey forest."},
  baToBeach: {scene: "ba_ubud", name: "The lane to the beach", door: [290, 40], spot: true, bridge: "ba_beach", mark: [290, 90], line: "North along the lane to the beach."},
  baToTemple: {scene: "ba_ubud", name: "The village road", door: [20, 330], spot: true, bridge: "ba_temple", mark: [70, 310], line: "West along the village road to the water temple."},
  // the terraces: the paddies, the pavilion, the ducks, the scarecrow, Dewi Sri's shrine
  bapaddy: {scene: "ba_terraces", name: "The paddies", door: [250, 264], spot: true, mark: [250, 170], line: "The rice paddies."},
  babale: {scene: "ba_terraces", name: "The bamboo pavilion", door: [92, 342], spot: true, mark: [92, 270], line: "The bamboo pavilion."},
  baducks: {scene: "ba_terraces", name: "The paddy ducks", door: [306, 500], spot: true, mark: [400, 490], line: "The paddy ducks."},
  bascarecrow: {scene: "ba_terraces", name: "The scarecrow", door: [214, 440], spot: true, mark: [140, 430], line: "The scarecrow with bells."},
  bashrine3: {scene: "ba_terraces", name: "Dewi Sri's shrine", door: [306, 380], spot: true, mark: [344, 360], line: "Dewi Sri's shrine, for the rice goddess."},
  baToBeachE: {scene: "ba_terraces", name: "The coconut track", door: [500, 300], spot: true, bridge: "ba_beach", mark: [450, 280], line: "East down the coconut track to the beach."},
  baToTempleS: {scene: "ba_terraces", name: "Down through the paddies", door: [260, 612], spot: true, bridge: "ba_temple", mark: [200, 600], line: "South down through the paddies to the water temple."},
  // the water temple: the split gate, the gamelan pavilion, the shrine, the spring pools, the koi pond
  bagate: {scene: "ba_temple", name: "The split gate", door: [260, 222], spot: true, mark: [260, 120], line: "The split gate, the candi bentar."},
  bagamelan: {scene: "ba_temple", name: "The gamelan pavilion", door: [108, 388], spot: true, mark: [108, 290], line: "The gamelan pavilion."},
  bashrine4: {scene: "ba_temple", name: "The temple shrine", door: [420, 380], spot: true, mark: [420, 270], line: "The temple shrine."},
  bapools: {scene: "ba_temple", name: "The spring pools", door: [326, 520], spot: true, mark: [160, 520], line: "The holy spring pools."},
  bakoi: {scene: "ba_temple", name: "The lotus pond", door: [380, 460], spot: true, mark: [440, 550], line: "The lotus and koi pond."},
  baToTerracesN: {scene: "ba_temple", name: "Up through the paddies", door: [260, 40], spot: true, bridge: "ba_terraces", mark: [260, 90], line: "North up through the paddies to the terraces."},
  baToUbudE: {scene: "ba_temple", name: "The village road", door: [500, 418], spot: true, bridge: "ba_ubud", mark: [450, 400], line: "East along the village road to Ubud."}
};
// the rooms: the place each room's door is on, for the Exit
Object.assign(BA_PLACES, {ba_warung: {scene: "ba_beach", name: "Nyoman's warung", door: [96, 358]}, ba_offer: {scene: "ba_ubud", name: "Ibu Wayan's offerings house", door: [130, 242]},
  ba_silver: {scene: "ba_ubud", name: "Ketut's silver workshop", door: [424, 242]}, ba_market: {scene: "ba_ubud", name: "The market hall", door: [440, 458]},
  ba_gamelan: {scene: "ba_temple", name: "The gamelan pavilion", door: [108, 388]}});
export const BA_BRIDGES = {
  ba_beach: {ba_terraces: "baToTerraces", ba_ubud: "baToUbud"}, ba_ubud: {ba_beach: "baToBeach", ba_temple: "baToTemple"},
  ba_terraces: {ba_beach: "baToBeachE", ba_temple: "baToTempleS"}, ba_temple: {ba_terraces: "baToTerracesN", ba_ubud: "baToUbudE"}
};
export const BA_ARRIVE = {
  "ba_beach>ba_terraces": [470, 300], "ba_terraces>ba_beach": [50, 470], "ba_beach>ba_ubud": [290, 80], "ba_ubud>ba_beach": [300, 580],
  "ba_terraces>ba_temple": [260, 80], "ba_temple>ba_terraces": [260, 580], "ba_ubud>ba_temple": [470, 418], "ba_temple>ba_ubud": [50, 330]
};
// walkable bounds [x1, y1, x2, y2] and obstacles (sea, buildings, paddies, pools, trees)
export const BA_BOUNDS = {
  ba_beach: [14, 26, 506, 616], ba_ubud: [14, 26, 506, 616], ba_terraces: [14, 26, 506, 616], ba_temple: [14, 26, 506, 616],
  ba_warung: [30, 250, 490, 600], ba_offer: [30, 250, 490, 600], ba_gamelan: [30, 250, 490, 600], ba_silver: [30, 250, 490, 600], ba_market: [30, 250, 490, 600]
};
export const BA_OBST = {
  // the sea along the top, the warung and its tables, the kite rack, the jukung pulled up on the sand, the beach
  // shrine, the palms and hibiscus along the bottom either side of the lane, the palm on the sand
  ba_beach: [[0, 0, 520, 180], [0, 180, 176, 340], [184, 300, 240, 346], [356, 186, 520, 296], [414, 404, 496, 474], [0, 572, 220, 640], [380, 572, 520, 640], [20, 400, 44, 420]],
  // the offerings house compound, the silver workshop, the market hall, the market shrine, the banyan's trunk and the
  // ferns round its foot, the two halves of the monkey forest gate and the forest behind, the rooster in his basket
  ba_ubud: [[0, 0, 238, 226], [344, 0, 520, 226], [356, 268, 520, 440], [316, 432, 352, 474], [40, 450, 180, 590], [0, 580, 236, 640], [236, 524, 280, 640], [320, 524, 364, 640], [280, 600, 320, 640], [364, 476, 520, 640], [14, 230, 48, 264]],
  // the upper terraces, the pavilion, the lower terraces either side of the path down, Dewi Sri's shrine
  ba_terraces: [[0, 0, 520, 246], [28, 268, 154, 330], [0, 352, 204, 640], [318, 352, 520, 640], [318, 340, 352, 376]],
  // the trees outside the temple, the wall and the two halves of the split gate, the gamelan pavilion, the meru and its
  // umbrellas, the spring pools, the koi pond, the frangipani by the east wall
  ba_temple: [[0, 0, 150, 140], [370, 0, 520, 140], [0, 140, 240, 200], [280, 140, 520, 200], [178, 56, 240, 140], [280, 56, 342, 140], [20, 240, 196, 372], [360, 200, 500, 362], [20, 424, 304, 640], [346, 476, 520, 640], [490, 200, 520, 380]],
  ...BA_ROOM_OBST
};
export const BA_NAMES = {ba_beach: "Bali: Sanur beach", ba_ubud: "Bali: Ubud", ba_terraces: "Bali: the rice terraces", ba_temple: "Bali: the water temple"};
export const BA_EVAN = {ba_beach: [[260, 400], [180, 500], [340, 520], [300, 300]], ba_ubud: [[200, 360], [300, 420], [260, 300], [120, 330]], ba_terraces: [[260, 300], [240, 420], [380, 300], [260, 540]], ba_temple: [[260, 300], [220, 420], [310, 380], [322, 452]]};
