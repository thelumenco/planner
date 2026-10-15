// Puffin Isle's people (round 216), local: "puffin". A handful of islanders and the day's visitors off the boats, all
// in boat hours (from 8am, home by 7pm).
//   The storytellers (stories.js): Morwenna, the lighthouse keeper; Finn, the seabird warden (pifinn: "finn" is
//   already a villager), who names his puffins; Ivy, who makes things from sea glass in the old boathouse (piivy:
//   "ivy" is taken too).
//   Also: Bryn, who runs the farm tearoom and sings while he bakes; Dai, the boatman at the jetty; and visitors: Ruth
//   and Geoff, birdwatchers with very big binoculars, and Amara, walking all the way round the island.
import { PI_ROOM_STAND } from "./puffin-rooms-layout.js";
const hm = s => { const [h, m] = s.split(":").map(Number); return h*60 + (m || 0); };
const slot = (from, to, scene, where, opts) => Object.assign({from: hm(from), to: hm(to), scene}, Array.isArray(where[0]) ? {wander: where} : {at: where}, opts || {});
const P = (id, name, job, look, routine, lines, intro, away, more) => ({id, local: "puffin", pitch: .82 + (id.charCodeAt(2) % 6)*.06, name, job, look, routine, lines, intro, away, ...(more || {})});
const at = room => PI_ROOM_STAND[room];

export const PI_PEOPLE = [
  P("morwenna", "Morwenna", "Keeps the lighthouse on Puffin Isle", {skin: "#F2D3BC", hair: "#8A8478", hairStyle: "bun", top: "#3E4A6A", bottom: "#2F2B28"},
    [slot("8:00", "11:00", "pi_lamp", at("pi_lamp"), {dir: -1}), slot("11:00", "13:00", "pi_kitchen", at("pi_kitchen"), {dir: -1}), slot("13:00", "15:00", "pi_point", [[260, 420], [300, 460], [220, 480]]), slot("15:00", "19:00", "pi_lamp", at("pi_lamp"), {dir: -1})],
    ["The light's automatic now. I still go up every evening. Somebody should say goodnight to it.", "Polish the brass, wind the clock, watch the sea. That's the job. Best job in the world.", "Storm's coming Thursday. You can smell it.", "Thirty-two years on this rock. Never once bored. Cold, yes. Bored, never."],
    "Morwenna. I keep the light. Come up and see the lens if you like: mind the stairs, there are a hundred and two.", "Morwenna's up the lighthouse."),
  P("pifinn", "Finn", "The seabird warden on Puffin Isle", {skin: "#E8C4A0", hair: "#C9785A", hairStyle: "curly", top: "#5E7A4A", bottom: "#5A4A3E", hat: "sunhat"},
    [slot("8:00", "10:30", "pi_wick", [[260, 420], [300, 440]]), slot("10:30", "13:00", "pi_warden", at("pi_warden"), {dir: -1}), slot("13:00", "14:00", "pi_tearoom", [[220, 500], [320, 520]]), slot("14:00", "17:00", "pi_wick", [[240, 430], [300, 460]]), slot("17:00", "19:00", "pi_warden", at("pi_warden"), {dir: -1})],
    ["That one's Captain Pebbles. Eleven years in the same burrow. It's scientific, naming them. Mostly.", "Puffins mate for life. They meet up every spring at the same burrow, like an anniversary.", "The seal pups are born white and fluffy. In three weeks they're grey and grumpy. Like teenagers.", "Shh. Listen. That growly noise under the turf? That's a puffin in its burrow, telling you off."],
    "Finn! I'm the warden. I count the birds, mind the burrows and talk to the puffins. They don't talk back. Well. Sometimes.", "Finn's out on the cliffs counting birds."),
  P("piivy", "Ivy", "Makes things from sea glass in the old boathouse", {skin: "#D8A47E", hair: "#E8C48E", hairStyle: "long", top: "#9FD3B2", bottom: "#3E5E7A"},
    [slot("8:00", "9:30", "pi_point", [[300, 520], [260, 540]]), slot("9:30", "13:00", "pi_studio", at("pi_studio"), {dir: -1}), slot("13:00", "14:00", "pi_tearoom", [[240, 500], [340, 520]]), slot("14:00", "18:00", "pi_studio", at("pi_studio"), {dir: -1})],
    ["Every piece was something once. A bottle, a lamp, a jar. The sea just tidies it up.", "Red's the rarest. I've found four in ten years. Each one I nearly cried.", "Hold it up to the light. See? A whole little world.", "The best finds are after a storm. The sea turns out its pockets."],
    "Hi, I'm Ivy. Welcome to the boathouse. Mind the boat, it's a bench now. Everything else is sea glass."),
  P("bryn", "Bryn", "Runs the farm tearoom on Puffin Isle", {skin: "#F2D3BC", hair: "#3A3430", hairStyle: "short", top: "#C9483A", bottom: "#3A4A5A", extra: "apron"},
    [slot("8:30", "18:00", "pi_tearoom", at("pi_tearoom"), {dir: -1})],
    ["Soup's leek and potato, cariad, and it'll put hair on your chest.", "Bara brith, Welsh cakes, or both? Both. Good answer.", "I sing while I bake. The bread rises better. Proven fact.", "Honey's from our own hives, from the thyme on the cliffs. Taste it. Go on."],
    "Croeso! Welcome! Bryn. Sit anywhere, cariad, the kettle's always on and there's cake if you're quick."),
  P("dai", "Dai", "The boatman at the island jetty", {skin: "#C99A78", hair: "#D6D0C6", hairStyle: "short", top: "#E8C23A", bottom: "#2F2B28", hat: "cap"},
    [slot("8:00", "19:00", "pi_haven", [[300, 240], [320, 260]], {act: "nets", dir: -1})],
    ["Tide's turning at three. Don't be late or you'll be sleeping with the puffins.", "Forty years I've brought folk over. Never lost one. Lost a hat once.", "Calm today. Like a millpond. Make the most of it."],
    "Dai. I mind the jetty and the boats. You tie up there, love, by the steps. Lovely boat."),
  P("pibirder", "Ruth", "A birdwatcher with very big binoculars", {skin: "#F6DCC6", hair: "#E6E2DA", hairStyle: "bob", top: "#5E7A6E", bottom: "#5A4A3E", hat: "sunhat"},
    [slot("9:00", "12:00", "pi_wick", [[220, 460], [260, 480]], {act: "binoculars"}), slot("12:00", "13:30", "pi_tearoom", [[200, 520], [300, 540]]), slot("13:30", "16:30", "pi_point", [[300, 440], [340, 460]], {act: "binoculars"})],
    ["A razorbill! Geoff, a razorbill! Write it down!", "Forty-one species today. Geoff's only got thirty-nine. He's sulking.", "We've come every year since 1987. The puffins remember us. Probably."],
    "Hello! Ruth. That's Geoff. We're birders. Don't mind the binoculars, they're bigger than they look.", null, {tourist: true}),
  P("pibirder2", "Geoff", "A birdwatcher, with a notebook", {skin: "#E2B590", hair: "#8A8478", hairStyle: "short", top: "#7A6A4A", bottom: "#3A4A5A", hat: "cap"},
    [slot("9:00", "12:00", "pi_wick", [[240, 470], [280, 490]], {act: "notes"}), slot("12:00", "13:30", "pi_tearoom", [[220, 530], [320, 550]]), slot("13:30", "16:30", "pi_point", [[320, 450], [360, 470]], {act: "notes"})],
    ["Thirty-nine. Ruth says forty-one but she counted a seagull twice.", "Write it all down. Every bird. That's the rule.", "Shh. Fulmar."],
    "Geoff. Ruth's husband. I hold the notebook. It's an important job.", null, {tourist: true}),
  P("pihiker", "Amara", "Walking all the way round the island", {skin: "#8A5A3A", hair: "#1E1A18", hairStyle: "curly", top: "#E8566C", bottom: "#2F2B28"},
    [slot("9:00", "10:30", "pi_haven", [[260, 300], [300, 340]]), slot("10:30", "12:00", "pi_farm", [[260, 400], [300, 440]]), slot("12:00", "13:00", "pi_tearoom", [[260, 520], [340, 540]]), slot("13:00", "15:00", "pi_point", [[260, 460], [300, 480]]), slot("15:00", "17:00", "pi_wick", [[300, 400], [340, 420]])],
    ["The whole island in a day! Well, the whole island in about two hours. Then cake.", "I've never seen a puffin before today. I've seen four hundred now. I'm ruined for other birds.", "The wind up here! My hat's in Ireland by now."],
    "Hi! Amara. Doing the round-the-island walk. Every single bit of it. Even the muddy bits.", null, {tourist: true})
];
