// Bali's people (round 218), local: "bali". Wayan the silversmith (five generations in Celuk), Ketut the rice farmer who
// knows every water channel, his sister Kadek who roasts the coffee and cacao, Made at the warung on the sand, Ibu Sari
// who folds the offerings at Ubud market, Pak Gede the carver, and Pak Nyoman who leads the gamelan. And visitors
// (tourist: true). Two to four people in every room at the busy times.
const hm = s => { const [h, m] = s.split(":").map(Number); return h*60 + (m || 0); };
const slot = (from, to, scene, where, opts) => Object.assign({from: hm(from), to: hm(to), scene}, Array.isArray(where[0]) ? {wander: where} : {at: where}, opts || {});
const P = (id, name, job, look, routine, lines, intro, away, more) => ({id, local: "bali", pitch: .82 + (id.charCodeAt(2) % 6)*.06, name, job, look, routine, lines, intro, away, ...(more || {})});
const T = (id, name, job, look, routine, lines, intro) => ({...P(id, name, job, look, routine, lines, intro, `${name}'s off seeing another bit of Bali.`), tourist: true});

export const BL_PEOPLE = [
  P("blwayan", "Wayan", "A silversmith, the fifth generation of his family", {skin: "#B9825E", hair: "#1E1A18", hairStyle: "short", top: "#FFFDF6", bottom: "#3E6BAE", hat: "cap"},
    [slot("9:00", "18:00", "ba_silver", [262, 270], {dir: 1})],
    ["My great-great-grandfather made silver for the palace. I make silver for everybody. Better, I think.", "Frangipani, waves, geckos. Bali in silver. Small enough to wear.", "Silver remembers your hands. That's why it's warm."],
    "Wayan. Silver. Come, sit, I show you. You make a ring today. Yes, you can. Everyone can.", "Wayan's workshop is shut. A little offering sits on the step."),
  P("blketut", "Ketut", "Grows rice on the Tegallalang terraces, and knows every water channel", {skin: "#A8754F", hair: "#3A3430", hairStyle: "short", top: "#7A8A5A", bottom: "#5A4A3E", hat: "cap"},
    [slot("6:30", "11:00", "ba_tegallalang", [[300, 240], [200, 260], [260, 280]], {act: "farm"}), slot("11:00", "13:00", "ba_cacao", [[200, 540], [330, 560]]), slot("13:00", "17:30", "ba_tegallalang", [[300, 520], [360, 480]])],
    ["The water goes from my field to my neighbour's to his neighbour's. We share. A thousand years, we share.", "The ducks eat the bugs, the ducks make the field rich, then we eat the duck. Everybody works.", "Three harvests a year. The rice never stops. Me neither."],
    "Ketut! Rice farmer. You want to plant? Take off your shoes. The mud is warm. Very good for the feet.", "Ketut's down in the bottom terraces, knee-deep."),
  P("blkadek", "Kadek", "Roasts the coffee and cacao above the terraces", {skin: "#B9825E", hair: "#1E1A18", hairStyle: "bun", top: "#C8432F", bottom: "#3A3430", extra: "apron"},
    [slot("8:00", "17:00", "ba_cacao", [262, 290], {dir: 1})],
    ["Roast slowly. Stir always. When it smells like chocolate cake, stop.", "My brother grows rice. I grow coffee. We argue about which is more work. It's coffee.", "The tasting cups are small so you can try everything. Then you buy everything."],
    "Kadek! Coffee, cacao, tea. Sit, taste, look at the view. No hurry here.", "The coffee house is shut. The roasting pan is cooling on the step."),
  P("blmade", "Made", "Runs the warung on Seminyak beach", {skin: "#A8754F", hair: "#1E1A18", hairStyle: "long", top: "#F3D34A", bottom: "#5E8A48", extra: "apron"},
    [slot("8:00", "21:00", "ba_warung", [400, 314], {dir: -1})],
    ["Best nasi goreng on the coast. I say so. My customers say so. My mother says so.", "Twenty years on this beach. The surfers get older. I don't.", "Es kelapa! The coconut tells you when it's ready. It goes heavy and quiet."],
    "Made! Sit, sit. You're hungry, I can tell. Nasi goreng? Of course nasi goreng.", "The warung's shutters are down. Made's gone to the market."),
  P("blsari", "Ibu Sari", "Folds offerings at Ubud market, every morning since she was a girl", {skin: "#C99A78", hair: "#E6E2DA", hairStyle: "bun", top: "#F4C7CF", bottom: "#3E6BAE"},
    [slot("6:00", "14:00", "ba_market", [262, 330], {dir: 1}), slot("14:00", "16:00", "ba_ubud", [[220, 250], [300, 250]])],
    ["Every morning, a thank-you. For the sun, for the rice, for the day. It takes a minute. It changes everything.", "Each colour has its direction, each direction has its god. Simple. Beautiful.", "My granddaughter folds faster than me now. I pretend I'm letting her win."],
    "Om swastiastu! I am Sari. Sit with me. I teach you canang. Your hands will remember.", "Ibu Sari's gone home to rest. Her little stool is still by the door."),
  P("blgede", "Pak Gede", "Carves animals at Ubud market, a different one each day", {skin: "#A8754F", hair: "#9A928A", hairStyle: "short", top: "#5E8A48", bottom: "#5A4A3E"},
    [slot("8:00", "16:00", "ba_market", [[120, 540], [400, 540]])],
    ["Monday a gecko, Tuesday a turtle. Every day a different friend.", "The wood tells me what it wants to be. Mostly it wants to be a frog.", "Seven days, seven animals. Collect them all. Make an old man happy."],
    "Gede. I carve. Today's animal is on the table: look, he's smiling at you.", "Pak Gede's packed up for the day."),
  P("blnyoman", "Pak Nyoman", "Leads the gamelan in the palace's dance pavilion", {skin: "#B9825E", hair: "#3A3430", hairStyle: "short", top: "#FFFDF6", bottom: "#C9A24A", hat: "cap"},
    [slot("10:00", "13:00", "ba_dance", [140, 520], {dir: 1}), slot("13:00", "14:30", "ba_warung", [[200, 540], [330, 560]]), slot("14:30", "18:00", "ba_dance", [140, 520], {dir: 1})],
    ["Nobody plays the melody. Everybody plays a piece of it. Together, it's whole.", "The gongs are older than the palace. Bronze, from Java, three hundred years.", "The dancers' eyes move to the drum. Watch the eyes, you hear the music."],
    "Nyoman. Gamelan. You want to try? Listen first. Then play. The gongs are patient.", "Pak Nyoman's gone home. The gongs are covered with cloths."),
  T("bllucy", "Lucy", "On a yoga retreat in Ubud (mostly eating)", {skin: "#F6D9C4", hair: "#C9785A", hairStyle: "long", top: "#9FD3B2", bottom: "#FFFDF6"},
    [slot("8:00", "10:00", "ba_ubud", [[220, 250], [180, 470]]), slot("10:00", "11:30", "ba_market", [[200, 540], [330, 540]]), slot("11:30", "13:00", "ba_silver", [[200, 540], [330, 540]]), slot("13:00", "14:30", "ba_cacao", [[200, 540], [330, 560]]), slot("14:30", "17:00", "ba_dance", [[300, 540], [400, 560]])],
    ["Yoga at six, smoothie bowl at seven, nap at eight. Very spiritual.", "A monkey stole my hair clip. He looked so pleased with himself.", "I've bought four sarongs. I came with one bag. I'm leaving with three."],
    "Lucy! From Manchester. On a yoga retreat. I've done one class and eaten nine nasi gorengs."),
  T("blravi", "Ravi", "Here for the surf at Uluwatu", {skin: "#8A5A3E", hair: "#1E1A18", hairStyle: "curly", top: "#3E6BAE", bottom: "#F3D34A"},
    [slot("7:00", "11:00", "ba_uluwatu", [[200, 520], [260, 520]]), slot("11:00", "13:00", "ba_warung", [[200, 540], [330, 560]]), slot("13:00", "16:00", "ba_seminyak", [[260, 420], [140, 400]]), slot("16:00", "19:30", "ba_uluwatu", [[160, 500], [260, 520]])],
    ["The waves at Uluwatu break left. Long and fast. I've fallen off every single one.", "Made's nasi goreng after a surf. Nothing better in the world.", "Stay for the fire dance. Trust me."],
    "Ravi. Surfer. Badly. Enthusiastically."),
  T("blanneke", "Anneke", "Backpacking round Indonesia, from Utrecht", {skin: "#F2D3BC", hair: "#E8C48E", hairStyle: "bob", top: "#F28C28", bottom: "#3A3430", extra: "satchel"},
    [slot("9:00", "11:00", "ba_tegallalang", [[260, 260], [200, 300]]), slot("11:00", "12:30", "ba_cacao", [[200, 540], [330, 540]]), slot("12:30", "14:00", "ba_market", [[200, 540], [330, 540]]), slot("14:00", "16:00", "ba_silver", [[200, 540], [330, 560]]), slot("16:00", "18:00", "ba_warung", [[200, 540], [330, 560]])],
    ["Three months, eleven islands. Bali is the one I keep coming back to.", "The terraces in the early morning, with the mist. I cried a little.", "I made a ring at Wayan's. It's crooked. It's perfect."],
    "Anneke! From Utrecht. I meant to stay two days. It's been two weeks.")
];
