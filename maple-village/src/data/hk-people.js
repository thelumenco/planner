// Hokkaido's people (round 224), local: "hokkaido". All in boat hours (from 8am, home by 7pm).
//   The storytellers (stories.js): Haruko, who has fed the fishermen breakfast at the morning market for forty years;
//   Kenta, a young glassblower who left Tokyo for Otaru's canal; Mrs Sato, the fifth generation to keep the ryokan.
//   Also: Kumiko, the flower farmer, who runs the farm café; Ben, an Australian ski instructor who came for one winter
//   twelve years ago (a hiking guide out of season); Takeshi, a fisherman; and visitors: Mia, a snowboarder from
//   Melbourne, and Tom, cycling round Hokkaido.
import { HK_ROOM_STAND } from "./hokkaido-rooms-layout.js";
const hm = s => { const [h, m] = s.split(":").map(Number); return h*60 + (m || 0); };
const slot = (from, to, scene, where, opts) => Object.assign({from: hm(from), to: hm(to), scene}, Array.isArray(where[0]) ? {wander: where} : {at: where}, opts || {});
const P = (id, name, job, look, routine, lines, intro, away, more) => ({id, local: "hokkaido", pitch: .82 + (id.charCodeAt(2) % 6)*.06, name, job, look, routine, lines, intro, away, ...(more || {})});
const at = room => HK_ROOM_STAND[room];

export const HK_PEOPLE = [
  P("hkharuko", "Haruko", "Has fed the fishermen breakfast at the morning market for forty years", {skin: "#EBC8A8", hair: "#B8B2AA", hairStyle: "bun", top: "#E8566C", bottom: "#3A3E5A", extra: "apron"},
    [slot("7:30", "13:00", "hk_hall", at("hk_hall"), {dir: -1}), slot("13:00", "15:00", "hk_market", [[230, 380], [300, 420], [260, 460]]), slot("15:00", "19:00", "hk_onsen", [[240, 400], [300, 440]])],
    ["Rice first, then the uni, then the ikura on top like little jewels. Never the other way round.", "The boats come in at four. I'm here at half past three with the rice on. Forty years, and they've never once beaten me.", "Eat, eat. You're on holiday. Holidays don't count.", "Crab in winter, uni in summer, salmon in autumn. The sea tells you what's for breakfast."],
    "Ohayo! Morning! You look hungry. Everyone looks hungry at a fish market. Sit, I'm Haruko, the bowls are mine.", "Haruko is off having a soak, after forty years of early mornings."),
  P("hkkenta", "Kenta", "Blows glass in an old stone warehouse on the canal", {skin: "#E8C2A0", hair: "#1E1A18", hairStyle: "spiky", top: "#3E6B8C", bottom: "#2F2B28", extra: "apron"},
    [slot("9:00", "12:00", "hk_glass", at("hk_glass"), {dir: -1}), slot("12:00", "13:00", "hk_market", [[220, 340], [290, 360]]), slot("13:00", "18:00", "hk_glass", at("hk_glass"), {dir: -1})],
    ["Glass is honey at eleven hundred degrees. You keep it turning, always turning, or it goes to sleep on you.", "In Tokyo I made spreadsheets. Here I make bubbles. Much better bubbles.", "The canal at night with the gas lamps on, and the snow coming down. That's the colour I'm trying to get into the glass.", "Don't worry about the lopsided ones. Lopsided means a person made it."],
    "Hi! Kenta. Mind the furnace, it's in a mood today. Want to try blowing one? Everyone's first float looks like a potato. That's tradition.", "Kenta is eating his lunch by the canal."),
  P("hksato", "Mrs Sato", "Keeps the ryokan, the fifth generation of her family to do it", {skin: "#EFD2B8", hair: "#4A4440", hairStyle: "bun", top: "#6A3A5A", bottom: "#6A3A5A", dress: "#6A3A5A"},
    [slot("8:00", "12:00", "hk_ryokan", at("hk_ryokan"), {dir: -1}), slot("12:00", "13:00", "hk_onsen", [[250, 420], [310, 450]]), slot("13:00", "19:00", "hk_ryokan", at("hk_ryokan"), {dir: -1})],
    ["Wash first, sitting on the little stool. Then into the water, slowly. The bath is for soaking, not for washing.", "My great-great-grandmother poured the first cup of tea in this room. The teapot is newer. Only ninety years old.", "Snow falling into a hot bath. If there's a better feeling, nobody has told me about it.", "A guest who leaves rested is a guest who comes back. That is the whole of the business."],
    "Irasshaimase. Welcome. Please, shoes off at the step, and slippers on. I am Sato. You must be tired from the sea. Tea first.", "Mrs Sato is out walking in the valley."),
  P("hkkumiko", "Kumiko", "Grows the flower farm's rainbow stripes and runs its café", {skin: "#E3BC98", hair: "#2A2420", hairStyle: "bob", top: "#F3D34A", bottom: "#5E8A5A", hat: "sunhat"},
    [slot("8:00", "10:00", "hk_cafe", at("hk_cafe"), {dir: -1}), slot("10:00", "12:00", "hk_flowers", [[220, 380], [300, 420], [260, 470]]), slot("12:00", "15:30", "hk_cafe", at("hk_cafe"), {dir: -1}), slot("15:30", "17:00", "hk_flowers", [[240, 400], [320, 440]]), slot("17:00", "19:00", "hk_cafe", at("hk_cafe"), {dir: -1})],
    ["Poppies, then lupins, then salvia, then marigolds. I plant them in stripes so the hill looks like a paintbox.", "In winter the stripes are all asleep under the snow. The cranes come and dance on them instead. Fair swap.", "The soft-serve is made with milk from the farm down the road. The cows are called Hana, Momo and Mrs Ito.", "Take some seeds home. Flowers like to travel. They just can't buy tickets."],
    "Hello! Kumiko. I grow the stripes. Would you like a soft-serve? Everyone says no and then they say yes.", "Kumiko is out in the flower stripes."),
  P("hkben", "Ben", "Teaches skiing at the Niseko lodge, and guides hikes out of season", {skin: "#F2CBB0", hair: "#C9A06A", hairStyle: "curly", top: "#E8913A", bottom: "#2E3A70", hat: "cap"},
    [slot("8:00", "12:00", "hk_lodge", at("hk_lodge"), {dir: -1}), slot("12:00", "14:00", "hk_niseko", [[230, 360], [300, 400], [270, 460]]), slot("14:00", "18:00", "hk_lodge", at("hk_lodge"), {dir: -1})],
    ["Came over from Ballarat for one winter. That was twelve years ago. The powder here's ruined me for anywhere else, mate.", "Snow so dry you can't make a snowball with it. Locals call it japow. I call it the reason I never went home.", "Summer's just as good, honestly. Bears, wildflowers, and Yotei standing there like a kid's drawing of a mountain.", "Pizza first, then pizza wedge, then you're skiing. That's the whole lesson. Well, nearly."],
    "G'day! Ben. I teach the skiing, and in summer I walk people up hills and point at things. Keen for a lesson?", "Ben is out on the mountain."),
  P("hktakeshi", "Takeshi", "Fishes for crab and sea urchin off the harbour", {skin: "#D9A880", hair: "#2A2420", hairStyle: "short", top: "#2F5A7A", bottom: "#3A3430", hat: "cap"},
    [slot("8:00", "12:00", "hk_market", [[210, 340], [280, 380], [250, 440]]), slot("12:00", "13:30", "hk_hall", [[220, 520], [320, 520]]), slot("13:30", "16:00", "hk_onsen", [[230, 380], [300, 420]])],
    ["Out at three, back at seven, breakfast at Haruko's at five past. Same for thirty years.", "That crab was in the sea this morning. Now it's going on a boat with you. Lucky crab.", "Winter here, the sea ice comes down from Russia and the whole coast goes quiet. Even the gulls whisper."],
    "Takeshi. Fisherman. My crab, my uni, Haruko's rice. Best breakfast in Japan. I'm not biased. Very slightly biased."),
  P("hkskier", "Mia", "A snowboarder from Melbourne", {skin: "#F6DCC6", hair: "#5A3A2A", hairStyle: "long", top: "#7FB8A8", bottom: "#2F2B28"},
    [slot("9:00", "12:00", "hk_niseko", [[220, 340], [300, 380], [260, 440]]), slot("12:00", "13:30", "hk_lodge", [[220, 520], [320, 530]]), slot("14:00", "16:00", "hk_onsen", [[240, 420], [310, 460]])],
    ["Ben taught me to snowboard four years ago. I've come back every year since. I'm still mostly falling over, but stylishly.", "The hot springs after a day on the mountain. Honestly. Life changing.", "I've eaten my body weight in soft-serve. No regrets."],
    "Hiya! Mia, from Melbourne. Here for the snow, staying for the noodles.", null, {tourist: true}),
  P("hkcyclist", "Tom", "Cycling round Hokkaido", {skin: "#F2D3BC", hair: "#8A5A3A", hairStyle: "short", top: "#C8432F", bottom: "#3A3E5A", shorts: true, hat: "helmet"},
    [slot("9:00", "11:00", "hk_flowers", [[230, 360], [300, 400]]), slot("11:00", "12:30", "hk_cafe", [[220, 520], [310, 530]]), slot("13:00", "15:00", "hk_market", [[240, 420], [310, 450]])],
    ["Two thousand kilometres so far. My legs have filed a formal complaint.", "Every town here has a different soft-serve flavour. I'm collecting them. Melon is winning.", "I stopped to watch the cranes for ten minutes and stayed for an hour. Worth every pedal."],
    "Hello! Tom, from Leeds. Cycling round the whole island. Slowly. With many snack stops.", null, {tourist: true})
];
