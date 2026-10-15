// Portovenere's people (round 212), local: "porto". Two to four in the rooms at the busy times and folk out on every
// screen, all in boat hours (from 8am, home by 7pm).
//   The storytellers (stories.js): Rosa, who farms mussels on ropes out in the gulf; Ilario, who carves the black and
//   gold marble (and has a secret piece under a dust sheet); Signora Bianca of the Poets' bookshop.
//   Also: Signora Lia of the seashell shop; Tonio at the bar on the quay; Don Piero, who runs the choir at San Pietro,
//   and two of his singers, Giulia and Matteo; and visitors: Sofia, who swims off the rocks every day of the year, and
//   Hugo, an English painter at his easel.
// (Jason and Luca, from Cinque Terre, pop over on the little ferry on Tuesdays and Saturdays: npcs.js.)
import { PV_ROOM_STAND, PV_CHOIR } from "./porto-rooms-layout.js";
const hm = s => { const [h, m] = s.split(":").map(Number); return h*60 + (m || 0); };
const slot = (from, to, scene, where, opts) => Object.assign({from: hm(from), to: hm(to), scene}, Array.isArray(where[0]) ? {wander: where} : {at: where}, opts || {});
const P = (id, name, job, look, routine, lines, intro, away, more) => ({id, local: "porto", pitch: .82 + (id.charCodeAt(1) % 6)*.06, name, job, look, routine, lines, intro, away, ...(more || {})});
const at = room => PV_ROOM_STAND[room];

export const PV_PEOPLE = [
  P("pvrosa", "Rosa", "Farms mussels on ropes out in the gulf", {skin: "#D8A47E", hair: "#3A2A20", hairStyle: "curly", top: "#3E6B8C", bottom: "#2F2B28", extra: "apron"},
    [slot("8:00", "11:30", "pv_mussels", at("pv_mussels"), {dir: -1}), slot("11:30", "13:00", "pv_harbour", [[260, 480], [320, 500], [220, 520]]), slot("13:00", "14:30", "pv_bar", [[200, 500], [320, 520]]), slot("14:30", "19:00", "pv_mussels", at("pv_mussels"), {dir: -1})],
    ["Out to the ropes at five, back by eight. The gulf is still asleep. I like it like that.", "Those are Franco's mussels. Small. Sad. Don't buy Franco's mussels.", "Muscoli, we say here. Not cozze. Muscoli.", "The water's cold and clean from the open sea. That's the secret. No, I'm not telling you the other secret."],
    "Rosa! I farm the mussels, out there on the ropes. You want the best mussels in the gulf? You found them. You're welcome.", "Rosa's out on the water with her ropes."),
  P("ilario", "Ilario", "Carves the black and gold portoro marble", {skin: "#E2B590", hair: "#8A8478", hairStyle: "short", top: "#C9C2B2", bottom: "#3A4A5A", extra: "apron"},
    [slot("9:00", "13:00", "pv_bottega", at("pv_bottega"), {dir: -1}), slot("13:00", "14:00", "pv_bar", [[220, 520], [340, 500]]), slot("14:00", "18:30", "pv_bottega", at("pv_bottega"), {dir: -1})],
    ["Portoro. Black as night, gold like lightning. Only from here. Only from these cliffs.", "Slowly. Marble doesn't forgive.", "The thing under the sheet? Nothing. A stone. Go away. Kindly.", "My father carved. His father carved. My daughter studies computers. Bah. Also, I'm very proud."],
    "Ilario. I carve. I don't talk much. The marble talks enough for both of us.", "Ilario's gone to the quarry to look at a block."),
  P("bianca", "Signora Bianca", "Keeps the Poets' bookshop", {skin: "#F6DCC6", hair: "#E6E2DA", hairStyle: "bun", top: "#7A2E5A", bottom: "#2F2B28"},
    [slot("9:30", "13:00", "pv_books", at("pv_books"), {dir: -1}), slot("13:00", "15:00", "pv_point", [[260, 420], [300, 460]]), slot("15:00", "18:30", "pv_books", at("pv_books"), {dir: -1})],
    ["'The sea is the same as it was in Byron's day.' That's not a quote. That's me. I'm quotable.", "You asked for the toilets? 'O for a beaker full of the warm South.' Keats. Second door on the left.", "Shelley sailed from here. Byron swam the gulf. I take the bus.", "Every book in this shop has been read by me at least twice. Some of them three times, against their will."],
    "Benvenuta! Bianca. This is the Poets' bookshop. The poets are all dead, but the shop is very much alive. Come in, come in.", "The bookshop's closed for lunch. Signora Bianca is reading on the point."),
  P("lia", "Signora Lia", "Makes seashell ornaments", {skin: "#E8C4A0", hair: "#C9785A", hairStyle: "long", top: "#9FC3D9", bottom: "#F6E7DC"},
    [slot("9:00", "18:30", "pv_shells", at("pv_shells"), {dir: -1})],
    ["Every morning at dawn I walk the beach on Palmaria. The sea leaves me presents.", "This one is a cowrie. They used them for money once. Imagine paying for bread with this.", "No two shells the same. Like people. Like snowflakes. Like Ilario's moods.", "Hold it to your ear. Yes, it's the sea. It's always the sea."],
    "Ciao, cara! Lia. Everything here came out of the sea, then through my fingers. Look, touch, take your time."),
  P("tonio", "Tonio", "Runs the bar on the quay", {skin: "#C99A78", hair: "#2A2420", hairStyle: "short", top: "#FFFDF6", bottom: "#2F2B28"},
    [slot("8:00", "19:00", "pv_bar", at("pv_bar"), {dir: -1})],
    ["Aperitivo! The most important meal of the day.", "Pandolce from my mother. She'd want you to have two slices.", "Sit by the door, the sea comes right up to your table. Well, nearly.", "Chestnut biscuits. Crunchy. Dip them in something."],
    "Tonio! Coffee, aperitivo, a little something sweet? Sit, sit. The boats go by, you watch, I bring things. Simple."),
  P("donpiero", "Don Piero", "Leads the choir at San Pietro", {skin: "#F2D3BC", hair: "#D6D0C6", hairStyle: "short", top: "#2F2B28", bottom: "#2F2B28"},
    [slot("9:00", "12:30", "pv_church", at("pv_church"), {dir: 1}), slot("12:30", "15:00", "pv_point", [[240, 440], [280, 460]]), slot("15:00", "17:30", "pv_church", at("pv_church"), {dir: 1})],
    ["Rehearsal at eleven and at four. Everyone is welcome. Even the ones who sing flat. Especially them.", "The stripes? Black stone and white. For eight hundred years they've watched the sea.", "Listen to the echo. The church sings back."],
    "Don Piero. Welcome to San Pietro. If you hear singing at eleven or four, come in and sit. You may even join the last note.", "Don Piero is out walking on the point."),
  P("choir1", "Giulia", "Sings in the choir at San Pietro", {skin: "#E8C4A0", hair: "#5A3A2A", hairStyle: "bob", top: "#5E7A6E", bottom: "#2F2B28"},
    [slot("10:45", "12:15", "pv_church", PV_CHOIR[0], {dir: 1}), slot("15:45", "17:15", "pv_church", PV_CHOIR[0], {dir: 1}), slot("12:15", "14:00", "pv_bar", [[220, 500], [300, 520]])],
    ["I'm an alto. We are the heart of the choir. Nobody notices us. That's fine.", "Don Piero says sing like the sea. I say which bit, the calm or the storm?"],
    "Giulia! Alto. Come and listen, we're terrible for the first ten minutes and wonderful after."),
  P("choir2", "Matteo", "Sings in the choir at San Pietro", {skin: "#D8A47E", hair: "#1E1A18", hairStyle: "spiky", top: "#3E4A6A", bottom: "#2F2B28"},
    [slot("10:45", "12:15", "pv_church", PV_CHOIR[1], {dir: -1}), slot("15:45", "17:15", "pv_church", PV_CHOIR[1], {dir: -1}), slot("8:30", "10:30", "pv_harbour", [[240, 470], [300, 500]])],
    ["Tenor. The high notes are mine. I guard them jealously.", "I fix boats in the morning, I sing in the afternoon. A good life."],
    "Matteo. Tenor. I'll hit the top note today. Probably."),
  P("pvsofia", "Sofia", "Swims off the rocks every day of the year", {skin: "#D8A47E", hair: "#E6E2DA", hairStyle: "short", top: "#E8566C", bottom: "#E8566C"},
    [slot("8:00", "10:00", "pv_point", [[300, 460], [340, 480]]), slot("10:00", "11:30", "pv_bar", [[200, 500], [320, 520]]), slot("11:30", "13:00", "pv_borgo", [[260, 420], [300, 460]])],
    ["Seventy-four, and I swim every day. January too. January especially.", "Cold water is good for the soul. Also it's free.", "Byron swam the whole gulf. I only swim to the buoy. Byron was showing off."],
    "Buongiorno! Sofia. You swim? No? You should. Every day, the sea, then a coffee. That's the whole secret.", null, {tourist: true}),
  P("pvhugo", "Hugo", "An English painter at his easel", {skin: "#F6DCC6", hair: "#C9C2BA", hairStyle: "short", top: "#E3C26A", bottom: "#5A4A3E", hat: "sunhat"},
    [slot("9:30", "12:30", "pv_harbour", [[280, 420], [300, 440]], {act: "sketch"}), slot("12:30", "14:00", "pv_bar", [[220, 520], [340, 540]]), slot("14:00", "17:30", "pv_castle", [[260, 420], [280, 440]], {act: "sketch"})],
    ["Forty years I've painted these houses. Still can't get the yellow right.", "The light at four o'clock. That's when the wall goes gold. Wait for it.", "Watercolour's mostly water. The trick is knowing where not to put it."],
    "Hugo, from Dorset. I paint Portovenere every autumn. My wife says I'm in love with a wall. She's not wrong.", null, {tourist: true})
];
