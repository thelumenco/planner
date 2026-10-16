// Formentera's people (round 233), local: "formentera". All in boat hours (from 8am, home by 7pm).
//   The storytellers (stories.js): Toni, who rakes the salt pans like his father and his grandfather; Margalida, who runs
//   the bakery in Sant Francesc and guards her grandmother's flaó recipe; Rainbow, a silver jeweller at the La Mola hippy
//   market, who came over on the ferry in 1972 "for a week".
//   Also: Joan, who hires out the bikes; Marina, who runs the chiringuito at Ses Illetes; Pep, the last lighthouse
//   keeper's grandson, who looks after La Mola lighthouse's visitors; and visitors: Elsa, a free-diver from Sweden, and
//   Hugo, on a cycling holiday from France.
// Rainbow's stall is at La Mola on market days (Wednesdays and Sundays; routines have no month condition, so it's every
// Wednesday and Sunday); otherwise she's in the village square or at the chiringuito.
import { FM_ROOM_STAND } from "./formentera-rooms-layout.js";
const hm = s => { const [h, m] = s.split(":").map(Number); return h*60 + (m || 0); };
const slot = (from, to, scene, where, opts) => Object.assign({from: hm(from), to: hm(to), scene}, Array.isArray(where[0]) ? {wander: where} : {at: where}, opts || {});
const P = (id, name, job, look, routine, lines, intro, away, more) => ({id, local: "formentera", pitch: .82 + (id.charCodeAt(2) % 6)*.06, name, job, look, routine, lines, intro, away, ...(more || {})});
const at = room => FM_ROOM_STAND[room];
const MARKET = [0, 3];   // Sundays and Wednesdays

export const FM_PEOPLE = [
  P("fmtoni", "Toni", "Rakes the salt pans, like his father and his grandfather before him", {skin: "#C99A70", hair: "#2A2420", hairStyle: "short", top: "#FFFDF6", bottom: "#3E5A7A", hat: "sunhat"},
    [slot("8:00", "12:00", "fm_salines", [[220, 360], [300, 400], [250, 450]]), slot("12:00", "13:30", "fm_bar", [[230, 510], [300, 520]]), slot("13:30", "16:30", "fm_salt", at("fm_salt"), {dir: -1}), slot("16:30", "19:00", "fm_salines", [[240, 380], [320, 420], [270, 460]])],
    ["Rake slow, rake steady. The salt's been waiting since the Romans. It can wait for me to finish my coffee.", "Sea in, sun on, wind across. In August the pans go pink, then white. Then we rake.", "The flamingos think the pans are theirs. Fair enough. They were here first.", "My grandfather's hands were white to the elbow every summer. Mine too. It washes off. The pride doesn't."],
    "Bon dia! Toni. Mind the edges, the mud's soft. You've come to see the salt? Good. Everyone should see where salt comes from once.", "Toni is out on the far pans, checking the water."),
  P("fmmargalida", "Margalida", "Runs the bakery in Sant Francesc, and guards the flaó recipe", {skin: "#E3BC98", hair: "#4A3A32", hairStyle: "bun", top: "#3E6B8C", bottom: "#3E6B8C", dress: "#3E6B8C", extra: "apron"},
    [slot("8:00", "13:00", "fm_bakery", at("fm_bakery"), {dir: -1}), slot("13:00", "14:30", "fm_village", [[220, 380], [300, 420], [260, 460]]), slot("14:30", "19:00", "fm_bakery", at("fm_bakery"), {dir: -1})],
    ["Fresh cheese, eggs, a handful of mint, and a crust with anise in it. That's flaó. The rest is my grandmother's business.", "The oven is lit at five. The first ensaïmadas are out at seven. I'm up at four. Do the sums.", "Figs for the bread, almonds for the biscuits. Everything here grew within a bike ride of this counter.", "Eat it warm. Cold flaó is for people with no patience, and that's nobody on this island."],
    "Bon dia, bon dia! Come in, mind the step. I'm Margalida. You've come for flaó? Everybody comes for flaó. Sit, I'll cut you a slice.", "Margalida has popped out to see her sister."),
  P("fmrainbow", "Rainbow", "Makes silver jewellery at the La Mola market; came over on the ferry in 1972 for a week", {skin: "#EAC2A2", hair: "#C8C4BE", hairStyle: "braids", top: "#B86AA8", bottom: "#B86AA8", dress: "#B86AA8", specs: "#8A6A42"},
    [slot("9:30", "17:00", "fm_mola", [[220, 360], [290, 400], [250, 440], [310, 460]], {dow: MARKET}),
      slot("10:00", "13:00", "fm_village", [[230, 380], [300, 410], [270, 460]]), slot("13:00", "15:00", "fm_bar", [[240, 520], [320, 510]]), slot("15:00", "18:00", "fm_village", [[220, 400], [290, 440]])],
    ["I came over on the ferry in 1972 for a week. I'm still deciding whether to go home.", "Silver's honest. You hammer it, it remembers. Same as people, really.", "Back then there was one shop, no electricity after ten, and a donkey called Picasso. I miss Picasso.", "Everybody who comes here slows down. The island does it to you. You don't get a say."],
    "Hello, lovely. Rainbow. Yes, really. It was 1972 and it seemed like a good idea. Come and look at the rings, they don't bite.", "Rainbow is off somewhere under the pines, chatting."),
  P("fmjoan", "Joan", "Hires out the bikes in Sant Francesc", {skin: "#D9A880", hair: "#2A2420", hairStyle: "curly", top: "#9CC27E", bottom: "#3A3E5A", shorts: true},
    [slot("8:00", "13:00", "fm_bikes", at("fm_bikes"), {dir: -1}), slot("13:00", "14:00", "fm_village", [[240, 400], [310, 440]]), slot("14:00", "19:00", "fm_bikes", at("fm_bikes"), {dir: -1})],
    ["Flat as a plate, this island. The only hill is La Mola, and that's what the low gears are for.", "Follow the Green Routes. Stone walls, fig trees, lizards. Ring your bell at the lizards. They like it.", "Seat up, helmet on, basket for the picnic. That's all the rules."],
    "Hola! Joan. Bikes, helmets, baskets, maps. I've got the lot. Where are we going today?", "Joan is out fixing a puncture somewhere on the Green Route."),
  P("fmmarina", "Marina", "Runs the chiringuito on the sand at Ses Illetes", {skin: "#D8A27A", hair: "#1E1A18", hairStyle: "long", top: "#3EB8C0", bottom: "#FFFDF6"},
    [slot("9:00", "15:00", "fm_bar", at("fm_bar"), {dir: -1}), slot("15:00", "16:00", "fm_illetes", [[230, 420], [300, 450]]), slot("16:00", "19:00", "fm_bar", at("fm_bar"), {dir: -1})],
    ["Shoes off at the sand. Nobody wears shoes at my bar. Not even the mayor.", "The fish came in at eight. It'll be on your plate at one. That's the menu.", "When the water's this clear, the boats look like they're floating in the air. I've seen it every day for twenty years and I still stop and stare."],
    "Hola, guapa! Marina. Find a table with your toes in the sand, I'll bring you something cold.", "Marina has gone for a swim. Back soon, says the sign."),
  P("fmpep", "Pep", "Looks after La Mola lighthouse's visitors; his grandfather was the last keeper", {skin: "#E0B08A", hair: "#5A4A3A", hairStyle: "short", top: "#2E3A70", bottom: "#C9B89A", specs: "#2F2B28"},
    [slot("9:00", "13:00", "fm_light", at("fm_light"), {dir: -1}), slot("13:00", "14:00", "fm_mola", [[230, 380], [300, 420]]), slot("14:00", "18:00", "fm_light", at("fm_light"), {dir: -1})],
    ["My grandfather climbed those stairs every night for thirty years to wind the clockwork. All those steps, round and round, and he never once counted them.", "Jules Verne wrote about this cape. A comet carries it off into space. Grandad thought that was very rude of him.", "On a clear night you can see the light from Ibiza. On a very clear night, Grandad said, you can see it from the moon."],
    "Benvinguts! Pep. My grandfather kept this light. I keep the visitors. Mind the stairs, they go round and round.", "Pep is outside, looking at the sea."),
  P("fmdiver", "Elsa", "A free-diver from Sweden", {skin: "#F6DCC6", hair: "#E8D08A", hairStyle: "long", top: "#2F5A7A", bottom: "#2F5A7A", shorts: true},
    [slot("9:00", "12:00", "fm_illetes", [[220, 400], [290, 430], [250, 470]]), slot("12:00", "13:30", "fm_bar", [[220, 520], [310, 530]]), slot("14:00", "16:00", "fm_illetes", [[240, 420], [310, 460]])],
    ["The seagrass meadows here are thousands of years old. One plant, the size of a town. You swim over it and you feel very young.", "In Stockholm the sea is grey and cold and very serious. This sea is laughing.", "One breath, down, look, up. That's the whole sport. The looking is the best part."],
    "Hej! Elsa, from Sweden. I came to dive and now I can't stop smiling. It's the colour of the water.", null, {tourist: true}),
  P("fmcyclist2", "Hugo", "On a cycling holiday from France", {skin: "#F2D3BC", hair: "#6A4A30", hairStyle: "short", top: "#E8566C", bottom: "#2E3A70", shorts: true, hat: "helmet"},
    [slot("9:00", "11:00", "fm_salines", [[230, 380], [300, 420]]), slot("11:00", "12:30", "fm_bakery", [[220, 520], [310, 530]]), slot("13:00", "15:00", "fm_mola", [[240, 400], [310, 440]]), slot("15:00", "16:30", "fm_bikes", [[230, 520], [300, 520]])],
    ["The whole island in one day! Well, the whole island and four ensaïmadas.", "The climb to La Mola is the only hill. I have told it how I feel about it.", "In Lyon I cycle in the traffic. Here I cycle with lizards. I prefer the lizards."],
    "Bonjour! Hugo, from Lyon. I'm cycling every road on the island. There are not many. I'm doing them twice.", null, {tourist: true})
];
