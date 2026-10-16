// Puffin Isle's people (round 216), local: "puffin". Morwenna the lighthouse keeper, who keeps the weather log and
// cuts linocut prints on winter evenings; Rhodri the warden, who counts every puffin and every seal; Bryony at the
// tearoom; Ffion at the post office (and the shop, and on Tuesdays the library); Dai, who skippers the island boat.
// And visitors (tourist: true): birdwatchers, a painter, a summer volunteer. Two to four people in every room at the busy times.
const hm = s => { const [h, m] = s.split(":").map(Number); return h*60 + (m || 0); };
const slot = (from, to, scene, where, opts) => Object.assign({from: hm(from), to: hm(to), scene}, Array.isArray(where[0]) ? {wander: where} : {at: where}, opts || {});
const P = (id, name, job, look, routine, lines, intro, away, more) => ({id, local: "puffin", pitch: .82 + (id.charCodeAt(2) % 6)*.06, name, job, look, routine, lines, intro, away, ...(more || {})});
const T = (id, name, job, look, routine, lines, intro) => ({...P(id, name, job, look, routine, lines, intro, `${name}'s off round the island.`), tourist: true});

export const PI_PEOPLE = [
  // Morwenna: sixties, grew up on the mainland in sight of the light, and wrote to the lighthouse board at nine asking
  // for the job. Got it at thirty-one. Weather log three times a day, in pencil. Linocuts in the winter. A dry wit.
  P("pimorwenna", "Morwenna", "Keeps the lighthouse on Puffin Isle, and the weather log", {skin: "#F2D3BC", hair: "#B9B0A4", hairStyle: "bun", top: "#2E3A5A", sleeves: "#2E3A5A", bottom: "#5A4A3E"},
    [slot("8:00", "11:00", "pi_keeper", [404, 300], {dir: -1}), slot("11:00", "13:00", "pi_lighthouse", [[440, 300], [300, 260], [360, 340]]), slot("13:00", "16:00", "pi_lamp", [262, 440], {dir: 1}), slot("16:00", "20:00", "pi_keeper", [404, 300], {dir: -1})],
    ["I wrote to the lighthouse board when I was nine and asked for the job. They said come back when you're grown. I did.", "Pencil, never pen. A pen freezes in January. A pencil never lets you down.", "The puffins come back the same week every April. I could set the calendar by them. I do, in fact.", "Fog's the worst. You can't see the sea, but you can hear it, all round you, waiting.", "A good forecast is mostly listening. The sea tells you. The glass tells you. The goats tell you, if you're daft enough to ask."],
    "Morwenna, keeper of the light. You'll be wanting the lamp room. Everyone does. Mind the stairs: a hundred and twelve, and they're all the same height except the one that isn't.", "Morwenna's up in the lamp room. You can see her at the top, writing in the log.",
    {hellos: ["Wind's westerly, glass is steady. You'll have a good day.", "Back again? The island's got you, then.", "Morning. Kettle's on in the cottage if you want it."]}),
  P("pirhodri", "Rhodri", "The warden: counts every puffin and every seal on Puffin Isle", {skin: "#E8C2A0", hair: "#6B4A3A", hairStyle: "short", top: "#4E6A4A", bottom: "#5A4A3E", hat: "cap"},
    [slot("8:00", "12:00", "pi_hide", [262, 330], {dir: 1}), slot("12:00", "13:00", "pi_tearoom", [[200, 540], [330, 560]]), slot("13:00", "15:00", "pi_cliffs", [[300, 330], [380, 280], [260, 420]]), slot("15:00", "18:00", "pi_landing", [[180, 440], [240, 470]])],
    ["Thirty-one thousand pairs last summer. I counted every one. Well. We counted every one. Kofi did the left side.", "They mate for life, puffins. Same burrow, same partner, every year. Very sensible birds.", "The seals have a song. Long and low, like someone humming in the next room.", "Not the gulls! Never count the gulls. They'll only encourage each other."],
    "Rhodri, the warden. If you're here for the puffins, you're in the right place. If you're here for anything else, I'll show you the puffins anyway.", "Rhodri's out on the clifftop with his clipboard."),
  P("pibryony", "Bryony", "Runs the tearoom on Puffin Isle", {skin: "#EAC4A0", hair: "#C9785A", hairStyle: "long", top: "#9FD3B2", bottom: "#3A3430", extra: "apron"},
    [slot("10:00", "18:00", "pi_tearoom", [400, 314], {dir: -1}), slot("18:00", "20:00", "pi_village", [[200, 230], [300, 250]])],
    ["Sea buckthorn's sharp as a slap. With a scone and cream, though? Heaven.", "I bake at five, before the first boat. The goats watch me through the window. Every morning.", "Nan made Welsh cakes on a griddle on the range. Same griddle. Same range. Different nan. Well, me.", "Everything comes over on Dai's boat. Flour, butter, gossip."],
    "Hiya! Sit anywhere: the window table's the best, you can see the seals. Tea's in the pot.", "The tearoom's shut. Bryony's walking the goats. Or the goats are walking Bryony."),
  P("piffion", "Ffion", "Runs the island post office, the shop and (on Tuesdays) the library", {skin: "#F6D9C4", hair: "#3A2A20", hairStyle: "bobfringe", top: "#C8432F", bottom: "#2E3A5A", extra: "glasses"},
    [slot("9:00", "17:00", "pi_post", [262, 280], {dir: 1})],
    ["People come from all over for the puffin stamps. A man from Japan bought forty.", "The post goes out on Dai's boat at four. If the sea's rough, it waits. Everything waits for the sea here.", "Sea glass: green's from old bottles, brown's from beer, and blue's from medicine. Blue's the rare one.", "The library's one shelf. I've read it all. Twice. Please bring books."],
    "Ffion. Post, stamps, postcards, bread on Thursdays, library on Tuesdays. And sea glass, if you fancy making something.", "The post office is shut. A note on the door: GONE TO MEET THE BOAT."),
  P("pidai", "Dai", "Skippers the island boat from Honeybrook and back", {skin: "#C99A78", hair: "#9A928A", hairStyle: "short", top: "#3E6BAE", bottom: "#2F2B28", hat: "cap"},
    [slot("8:00", "11:00", "pi_landing", [[300, 470], [340, 500]]), slot("11:00", "12:30", "pi_tearoom", [100, 540], {act: "sit", dir: 1}), slot("12:30", "20:00", "pi_landing", [[300, 470], [340, 500], [260, 440]])],
    ["Forty years on this crossing. Never lost a passenger. Lost a hat or two.", "If the sea's lumpy, we don't go. Simple as that. The island's been here a long time. It'll wait.", "Puffins follow the boat in, some days. Like they're seeing us home."],
    "Dai. I'm your boat. Well, I drive your boat. Last one back's at eight: don't make me come looking for you.", "Dai's out on the boat."),
  // visitors
  T("piingrid", "Ingrid", "A birdwatcher from Bergen", {skin: "#F6D9C4", hair: "#E8C48E", hairStyle: "long", top: "#7A8A5A", bottom: "#3A3430", extra: "satchel"},
    [slot("8:30", "11:00", "pi_hide", [[150, 540], [380, 540]]), slot("11:00", "13:00", "pi_cliffs", [380, 280], {act: "binoculars", dir: -1}), slot("13:00", "14:30", "pi_tearoom", [[200, 520], [330, 540]]), slot("14:30", "17:00", "pi_lamp", [[330, 540], [200, 540]])],
    ["We have puffins at home too, but these ones are more cheerful. Don't tell Norway.", "A gannet folds its wings and drops at sixty miles an hour. I never get tired of it.", "I have seen four hundred and twelve species. A puffin is still the best one."],
    "Ingrid. From Bergen. I came for three days of birds. This is my eleventh visit."),
  T("pikofi", "Kofi", "A volunteer on the summer seabird count", {skin: "#7A4E36", hair: "#1E1A18", hairStyle: "short", top: "#F3D34A", bottom: "#2E3A5A"},
    [slot("8:00", "12:00", "pi_hide", [[200, 560], [330, 560]]), slot("12:00", "16:00", "pi_cliffs", [[260, 420], [340, 400]]), slot("16:00", "18:00", "pi_post", [[200, 520], [330, 540]])],
    ["I count the left side of the cliff. Rhodri counts the right. We argue about the middle.", "Six weeks on an island. No phone signal. Best summer of my life.", "That puffin's had the same sand eels in its beak for a minute. It's showing off."],
    "Kofi! I'm a volunteer for the summer count. Ask me anything about puffins. Please. Nobody ever does."),
  T("picelia", "Celia", "Painting the lighthouse, again", {skin: "#EAC4A0", hair: "#D6D0C6", hairStyle: "bob", top: "#B48ED8", bottom: "#5A4A3E"},
    [slot("9:00", "12:00", "pi_lighthouse", [300, 300], {act: "paint", dir: -1}), slot("12:00", "13:00", "pi_keeper", [[200, 540], [330, 540]]), slot("13:00", "15:00", "pi_tearoom", [330, 520], {act: "sit", dir: -1}), slot("15:00", "17:00", "pi_village", [[200, 230], [300, 250]])],
    ["I've painted this lighthouse forty times. It's never been the same lighthouse twice.", "The light here's so clean. Like the sky's been washed.", "Morwenna lets me use her kitchen table. I pay her in paintings. She has a lot of paintings."],
    "Celia. I paint. Mostly that lighthouse. Don't look at the sky in this one, I haven't done it yet."),
  T("pihamid", "Hamid", "On a photography trip, with a very long lens", {skin: "#B9825E", hair: "#2A211D", hairStyle: "short", top: "#3A3430", bottom: "#5A4A3E", hat: "cap"},
    [slot("9:30", "12:00", "pi_cliffs", [[300, 330], [420, 360]]), slot("12:00", "13:30", "pi_post", [[200, 540], [330, 520]]), slot("13:30", "16:00", "pi_landing", [[180, 460], [240, 440]])],
    ["Four hundred photographs. Three of them in focus. All three are of the same puffin.", "The seals pose. They know exactly what they're doing.", "The trick is to lie still in the grass. The puffins come to you. And the goats."],
    "Hamid. I'm meant to be photographing puffins. So far I've mostly photographed a goat.")
];
