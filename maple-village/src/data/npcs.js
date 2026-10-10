// Village NPCs (light-touch neighbours) and agent NPCs (Mel's automations as messengers). All original characters.
//
// Town folk live in the town square ("village"); Darren stays at home base ("base", "home", "farm").
// Routine slots use Singapore minutes-since-midnight: {from, to, scene, at:[x,y]} stands still,
// {..., wander:[[x,y],...]} strolls between points. Outside every slot the NPC is off-screen (home, asleep).
// `react` lines fire once a day when their condition is true (see npcs.js REACTIONS).

const hm = s => { const [h, m] = s.split(":").map(Number); return h*60 + (m || 0); };
// opts: {look: clothes for this slot (over the usual look), dow: [0-6] (only on those days, 0 = Sunday), days: "wd" | "we" (weekdays / weekends only), act: what they're doing (Darren's props + lines), dir: facing}
// Gong Gong's going-out clothes: a pressed shirt and long trousers (no berms)
const OUT = {top: "#DCE7F2", bottom: "#4A4F5C", shorts: false};
// the foreshore: a walk along the boardwalk and the sand, and the sea (for paddleboarders, who go straight across)
const SHORE_WALK = [[226, 180], [240, 300], [300, 312], [430, 300], [236, 420], [226, 560], [300, 580]];
export const SEA = [[60, 190], [104, 250], [70, 330], [112, 400], [64, 560], [118, 610]];
const BANKER = {top: "#DCE7F2", bottom: "#2F3A4A", extra: "tie"};
// a wander along Makers' Lane (between Chord, Chico and the empty plots), and round the Sunday market at the field
const LANE = [[262, 320], [200, 390], [320, 400], [262, 470], [110, 360], [420, 380]];
const MARKET_WALK = [[120, 200], [220, 196], [320, 200], [420, 200], [130, 470]];
const VINE_WALK = [[262, 390], [340, 440], [300, 300], [200, 560], [418, 490]];
// round 103: Honeybrook Woods (the trails, the lookout, the pool), and the cottage lane on the way through
const WOODS_WALK = [[100, 330], [200, 318], [300, 300], [330, 420], [300, 560], [200, 470], [420, 330], [440, 510]];
const WOODS_RIDE = [[60, 330], [300, 300], [330, 600], [330, 420], [200, 318]];
const BIKE = {bike: true};
const slot = (from, to, scene, where, opts) => Object.assign({from: hm(from), to: hm(to), scene}, Array.isArray(where[0]) ? {wander: where} : {at: where}, opts || {});

export const NPCS = [
  {
    id: "hana", pitch: 1.15, name: "Hana", job: "Runs the market",
    intro: "Hi love, I'm Hana! I moved here from a little seaside town. The honey toast is mine, and yes, I remember everyone's usual.",
    look: {skin: "#F3D2B8", hair: "#5A3A2A", hairStyle: "bun", top: "#EFA3A6", bottom: "#7A6A8C", extra: "apron"},
    routine: [slot("7:00", "7:45", "hfarm", [[130, 600], [190, 590]], {dow: [1, 4]}), slot("19:30", "21:00", "wineshop", [227, 518], {act: "sit", dow: [0]}), slot("8:00", "12:00", "market", [260, 352]), slot("12:00", "13:00", "market", [[200, 352], [320, 352], [260, 352]]),
      slot("13:00", "15:00", "market", [260, 352]), slot("15:00", "15:40", "village", [[362, 372], [392, 360], [340, 380]]), slot("15:40", "19:00", "market", [260, 352])],
    lines: ["Fresh dumplings today. Don't tell Maple, she'll want three.", "You look like a honey toast kind of person today.", "Lunch rush is wild. Everyone wants toast at once!",
      "Remember to eat something proper, not just snacks.", "The strawberries sell out first. Every time."],
    away: "Hana's popped out. The shop still works: honesty box on the counter.",
    react: {harvest: "Ooh, homegrown! I'll buy anything you grow, you know.", quests3: "Three quests done already? Have a dumpling, you've earned it.", lunch: "Have you had lunch? Proper lunch?"}
  },
  {
    id: "okada", pitch: 0.75, name: "Mr Okada", job: "Retired postmaster, unofficial well-keeper",
    intro: "Okada. Forty years delivering letters. Retired now, but I still can't stop sorting things. Even the pebbles by the well.",
    look: {skin: "#EBC9A8", hair: "#D9D4CC", hairStyle: "short", top: "#8FA7C8", bottom: "#5E5A55", extra: "glasses"},
    routine: [slot("7:15", "7:30", "hlane", [[250, 300], [250, 180], [460, 186]], {dow: [2, 4]}), slot("7:30", "9:00", "hwoods", WOODS_WALK, {dow: [2, 4]}), slot("6:30", "9:00", "field", [96, 352], {act: "fish", dow: [0], dir: 1}), slot("14:00", "15:00", "lane", LANE, {dow: [1, 3, 5]}),
      slot("19:30", "21:00", "wineshop", [313, 518], {act: "sit", dow: [1, 3, 4, 5]}), slot("7:30", "12:00", "village", [455, 512]), slot("12:00", "14:00", "village", [[226, 420], [170, 440], [236, 444]]), slot("14:00", "15:00", "trophy", [[200, 500], [320, 520], [250, 540]]), slot("15:00", "17:00", "village", [[226, 420], [170, 440], [236, 444]]), slot("17:00", "19:30", "village", [322, 566])],
    lines: ["Letters used to come in sacks. Now it's all on your little phone.", "The well water is sweeter in the afternoon. Don't ask me why.", "I've sorted the pebbles by colour. Then by size. Then by colour again.",
      "A tidy inbox is a tidy mind. Mine is a shoebox.", "The river's high today. Good for the ducks."],
    react: {inbox: "An email quest! Just like the old days. Stamp it and send it.", water: "Good, drink up. Forty years of walking taught me that.", quests3: "Steady work. That's the postmaster's way."}
  },
  {
    id: "juniper", pitch: 1.05, name: "Juniper", job: "Librarian at the Fresh Pages library",
    intro: "Welcome to the library! I'm Juniper. I love a good semicolon; I also write poetry, but that's a secret. One book recommendation a week, guaranteed.",
    look: {skin: "#C99A78", hair: "#2B2320", hairStyle: "bob", top: "#B9D2A6", bottom: "#3F4A6B", extra: "glasses"},
    routine: [slot("7:20", "7:42", "hlane", [250, 150], {dow: [2], dir: 1}), slot("7:00", "8:00", "hwoods", WOODS_RIDE, {dow: [1, 3, 5], look: BIKE}), slot("9:00", "11:00", "hwoods", WOODS_RIDE, {dow: [6], look: BIKE}), slot("15:30", "16:30", "lane", LANE, {dow: [1, 2, 3, 4, 5]}),
      slot("18:30", "20:00", "wineshop", [453, 512], {act: "sit"}), slot("8:30", "13:00", "fresh", [[160, 300], [330, 300], [240, 330]]), slot("13:00", "15:30", "fresh", [356, 330]),
      slot("15:30", "16:00", "trophy", [292, 590], {act: "sit"}), slot("16:00", "18:00", "fresh", [[90, 330], [180, 330], [140, 312]])],
    lines: ["This week's pick: anything with a map in the front.", "A semicolon is a pause that believes in you.", "Shh… the nook is in reading hour. Join me?",
      "Every first draft is allowed to be terrible. That's the rule.", "I shelve by feeling, not by alphabet. Don't tell anyone."],
    react: {writing: "Ooh, a writing quest. Messy first, lovely later.", quests3: "Three chapters done today. Metaphorically."}
  },
  {
    id: "bo", pitch: 0.8, name: "Bo", job: "Carpenter at the Chord workshop",
    intro: "Bo! Carpenter. If it creaks, wobbles or falls off, I'm your guy. Built half this village. *hums*",
    look: {skin: "#E2B590", hair: "#3B2A1E", hairStyle: "short", top: "#E9C46A", bottom: "#4F6B8A", extra: "cap"},
    routine: [slot("12:30", "13:30", "bay", [[180, 420], [240, 430], [300, 420]], {dow: [3, 5]}), slot("8:00", "10:00", "hwoods", WOODS_RIDE, {dow: [6], look: BIKE}), slot("12:30", "13:30", "lane", LANE, {dow: [2, 4]}),
      slot("18:30", "20:00", "wineshop", [227, 518], {act: "sit", dow: [0, 1, 3, 4, 5]}), slot("8:00", "12:30", "chord", [[150, 330], [210, 320], [120, 340]]), slot("12:30", "13:30", "village", [346, 566]),
      slot("13:30", "18:00", "village", [[170, 300], [400, 280], [300, 450], [150, 520], [440, 560]])],
    lines: ["*hums a tune* Fixed the market's wobbly leg this morning.", "Measure twice, cut once. Or just cut and laugh.", "The workshop smells like sawdust and big ideas.",
      "Shipping is just building, but braver.", "Need a shelf? I always need a shelf."],
    react: {building: "Building something? Tools are out. Go for it.", quests3: "That's three. Nails in straight, every one."}
  },
  {
    id: "lin", pitch: 0.95, name: "Auntie Lin", job: "Gardener",
    intro: "Auntie Lin. I have opinions about soil, and they're all correct. Plant something and I'll tell you what you did wrong. Lovingly.",
    look: {skin: "#E9C2A0", hair: "#7C7570", hairStyle: "bun", top: "#9EBE8C", bottom: "#8A6A52", extra: "sunhat"},
    routine: [slot("6:30", "9:30", "farm", [[45, 250], [475, 400], [250, 560]]), slot("11:30", "14:00", "base", [360, 556]), slot("16:00", "19:00", "farm", [[45, 250], [475, 400], [250, 560]])],
    lines: ["Water in the morning, not at night. The roots know.", "Tulips are for beginners. That's a compliment.", "Strawberries take a whole day. Patience is a fertiliser.",
      "Your soil is lovely. Mine is better, but yours is lovely.", "I came to feed your ducks. They're practically mine now.", "Talk to your plants. They're good listeners."],
    gift: "tulip_seed",
    react: {harvest: "Look at that harvest! Your soil is coming along.", ready: "Something's ready in your garden. Don't leave it sulking!"}
  },
  {
    id: "pip", pitch: 1.45, name: "Pip", job: "Evan's best friend",
    intro: "I'm Pip! I'm Evan's best friend and I'm the FASTEST. Watch!", kid: true,
    look: {skin: "#D6A27C", hair: "#1F1A17", hairStyle: "spiky", top: "#F28C6A", bottom: "#4C7BB0", extra: "helmet"},
    routine: [slot("16:30", "17:30", "vineyard", [[110, 604], [262, 600], [410, 608], [200, 586], [330, 590]]), slot("15:00", "18:30", "base", [[230, 350], [300, 380], [200, 420], [360, 516], [160, 560], [300, 600]])],
    lines: ["Race you to the pond!", "Evan is SO fast. Almost as fast as me.", "Did you know foxes can't ride bikes? I asked Maple.", "I found a snail! His name is Gary."],
    react: {}
  },
  {
    id: "opal", pitch: 1.0, name: "Opal", job: "The banker",
    intro: "Welcome to the bank! I'm Opal. Five vaults, all yours. Every little deposit is a jewel in the jar, and yes, I polish them.",
    look: {skin: "#E8C3A2", hair: "#2E2622", hairStyle: "bun", top: "#7FA88A", bottom: "#3F4A3A", extra: "glasses"},
    routine: [slot("10:00", "11:30", "hfarm", [[140, 600], [200, 560], [260, 600]], {dow: [6]}), slot("9:00", "11:00", "hwoods", WOODS_WALK, {dow: [0]}), slot("18:00", "19:30", "wineshop", [367, 512], {act: "sit"}), slot("9:00", "12:30", "bank", [260, 500]), slot("12:30", "13:30", "village", [[300, 214], [262, 230]]), slot("13:30", "17:30", "bank", [260, 500])],
    lines: ["Every jewel counts. Even the little ones. Especially the little ones.", "Pay yourself first, then the rest. That's the banker's secret.", "I polished the sapphires this morning. Don't tell the rubies.",
      "Slow and steady fills a jar. Promise.", "A full jar is the prettiest thing in this town."],
    away: "Opal's on her lunch break. The vaults are always open to you.",
    react: {quests3: "Three quests done! That's a jewel's worth of effort."}
  },
  {
    id: "theo", pitch: 0.9, name: "Theo", job: "Town hall clerk",
    intro: "Theo, town clerk. I keep the village records. And, if you have a moment, I have a stamp collection you would not believe.",
    look: {skin: "#F0D0B4", hair: "#6B4A2E", hairStyle: "short", top: "#C3CDEE", bottom: "#3A3A48", extra: "tie"},
    routine: [slot("9:00", "12:00", "hwoods", WOODS_WALK, {dow: [6]}), slot("15:00", "17:00", "bay", [[180, 420], [240, 430]], {dow: [0], act: "sit"}), slot("17:30", "19:00", "wineshop", [313, 518], {act: "sit"}), slot("9:00", "12:00", "hall", [[200, 320], [330, 320]]), slot("12:00", "13:00", "trophy", [228, 590], {act: "sit"}), slot("13:00", "17:00", "hall", [[200, 320], [330, 320]])],
    lines: ["Records say you've been busy. I'm very proud. Officially.", "This stamp is from 1962. Look at the little bird!", "Everything filed, everything stamped. Bliss.",
      "The quest board is the most important document in town.", "I've started a register of Maple's naps. It's long."],
    react: {quests3: "I've stamped three completed quests in the register. Gold stamp!", planning: "A planning quest! My favourite kind of paperwork."}
  },
  {
    id: "darren", pitch: 0.7, name: "Darren", job: "Keeps the home running",
    intro: "Hey you. I'm on garden duty, roof duty and meeting duty today. Shout if you need anything.",
    look: {skin: "#E6BC98", hair: "#1A1716", hairStyle: "short", top: "#9A9A9A", bottom: "#4F6B8A", tall: true},
    // Weekdays: water the garden, work at the home office desk, fix something at lunch, tend the farm after work.
    // Weekends: mostly outdoors.
    routine: [slot("14:30", "16:00", "hwoods", WOODS_WALK, {dow: [6]}), 
      slot("19:30", "21:30", "base", [430, 606], {act: "rest", needs: "hammock"}),   // once Mel buys him the hammock
      slot("15:00", "16:30", "shore", SEA, {dow: [0], act: "sup", free: true}),   // Sunday afternoons: paddleboarding off the foreshore
      slot("7:00", "8:30", "base", [190, 452], {days: "wd", act: "water", dir: -1}),
      slot("8:30", "12:30", "office", [430, 258], {days: "wd", act: "type", dir: -1}),
      slot("12:30", "13:30", "base", [340, 300], {days: "wd", act: "repair", dir: -1}),
      slot("13:30", "17:30", "office", [430, 258], {days: "wd", act: "type", dir: -1}),
      slot("17:30", "19:00", "farm", [[90, 250], [430, 400], [250, 520]], {days: "wd", act: "farm"}),
      slot("19:00", "22:00", "base", [[230, 360], [300, 590], [200, 600], [400, 330]], {days: "wd"}),
      slot("7:30", "10:30", "farm", [[90, 250], [430, 400], [250, 520]], {days: "we", act: "farm"}),
      slot("10:30", "12:00", "base", [190, 452], {days: "we", act: "water", dir: -1}),
      slot("12:00", "14:30", "base", [340, 300], {days: "we", act: "repair", dir: -1}),
      slot("14:30", "17:00", "base", [[230, 360], [310, 612], [160, 540], [400, 330]], {days: "we"}),
      slot("17:00", "19:00", "farm", [[90, 250], [430, 400], [250, 520]], {days: "we", act: "farm"}),
      slot("19:00", "22:00", "base", [[230, 360], [300, 590], [200, 600]], {days: "we"}),
      slot("22:00", "23:00", "home", [150, 262], {act: "sit"})],   // winds down on the sofa, then bed by 11 (drawn in Mel's bed: darrenAsleep)
    lines: ["Coffee's fresh if you want some.", "Evan watered my shoes again. Very thorough.", "Go get 'em. I'll hold the fort.",
      "The shed radio only gets one station. It's a good station.", "Dinner's sorted, don't worry about it.", "You've got this. One thing at a time."],
    actLines: {guide: ["Welcome to the farm tour! I'll be your guide. My qualifications: enthusiasm.", "Mel planted this one. I watered it. Once.", "And these are flowers. Moving on."], 
      type: ["*typing* Back-to-back calls. Wave if it's urgent.", "On mute. Hi! *waves*", "Two more emails and I'm free."],
      water: ["Morning! The tomatoes say hi.", "Watering before it gets hot. Lin's orders."],
      repair: ["Gutter's nearly fixed. Nearly.", "Hold the ladder? Kidding. Mostly.", "If it squeaks, I fix it."],
      farm: ["Weeding. It's weirdly relaxing.", "These carrots are going to be enormous."],
      sup: ["Sunday paddle. Best hour of the week.", "Saw a dolphin! Well, a fin. It counts.", "Don't tell Evan I nearly fell in."],
      rest: ["Best present ever. Don't wake me for anything less than dinner.", "*sways* Five more minutes.", "The stars are out. Come look."]
    },
    react: {harvest: "Nice haul! I'll cook with that.", quests3: "Three done already? Look at you go.", lunch: "Lunch? I'll make toast."}
  },
  // The vineyard's workers: while they're on shift they water, pick ripe grapes and fill empty barrels (each can be
// switched off in the staff card at the shop counter)
  {
    id: "marco", pitch: 0.8, name: "Marco", job: "Keeps the vineyard",
    intro: "Marco. I look after the vines. I water, Ines and I pick, the barrels get filled, and you name the wine. Forty summers of this and I still talk to them.",
    look: {skin: "#C99470", hair: "#4A4038", hairStyle: "short", top: "#9DB88A", bottom: "#6B5444"},
    routine: [slot("8:00", "12:00", "vineyard", [[262, 390], [340, 440], [418, 490], [300, 392], [380, 442]], {act: "water"}),
      slot("12:00", "13:00", "wineshop", [227, 518], {act: "sit"}),
      slot("13:00", "18:00", "vineyard", [[262, 390], [340, 440], [418, 490], [230, 470], [450, 400]], {act: "farm"})],
    lines: ["Talk to them nicely. Vines listen.", "Water in the morning, pick in the afternoon.", "The red ones are show-offs. The white ones are shy.", "A good barrel takes its time. So do I."],
    actLines: {water: ["Watering the thirsty ones.", "A drink for every vine.", "Ripe ones go straight to the barrels."], farm: ["Tying up the shoots.", "Checking every bunch. Looking good."]},
    away: "Marco's gone home. The vines can wait till morning.",
    react: {harvest: "Lovely bunches! Into the barrel with them.", quests3: "Hard work. Like a good harvest."}
  },
  // round 120: Ines is Tomás Ruiz's great-great-granddaughter (the railwayman who planted the olive by the mill in
  // 1912); her story (data/stories.js) tells it
  {
    id: "ines", pitch: 1.2, name: "Ines", job: "Vineyard hand (and Tomás's great-great-granddaughter)",
    intro: "Hi! I'm Ines. Summers here, winters dreaming about here. I'm in charge of the trellises, and of telling Marco to take a break.",
    look: {skin: "#E8B996", hair: "#7A3B22", hairStyle: "long", top: "#F3C969", bottom: "#5E6E8C"},
    routine: [slot("9:00", "13:00", "vineyard", [[262, 440], [340, 490], [418, 390], [230, 420], [450, 470]], {act: "farm"}),
      slot("14:00", "17:30", "vineyard", [[262, 490], [340, 390], [418, 440], [190, 430]], {act: "water"})],
    lines: ["The rosé grapes are my favourite. Don't tell the others.", "Sun's out, vines are happy.", "Every trellis in this row, I tied myself.", "Smell that? That's next year's wine."],
    actLines: {water: ["Just watering. We'll pick the ripe ones.", "Hydrated vines, happy vines."], farm: ["Tidying the trellis.", "Pruning a little. Shh, it doesn't hurt."]},
    away: "Ines is off for the day."
  },
  // The wine shop's assistant: while she's behind the counter, more customers come in (coins go in the honesty box)
  {
    id: "celeste", pitch: 1.05, name: "Celeste", job: "Runs the wine shop counter",
    intro: "Bienvenue! I'm Celeste. I mind the counter, pour the tastings and write the chalkboard. Your wines sell themselves, honestly. I just smile.",
    look: {skin: "#B9835F", hair: "#231C19", hairStyle: "bun", top: "#8E2C48", bottom: "#2F2B28", extra: "apron"},
    routine: [slot("9:00", "10:45", "hwoods", [[132, 590], [180, 560], [100, 600]], {dow: [1]}), slot("10:00", "15:00", "wineshop", [372, 286]), slot("15:00", "15:30", "vineyard", [[300, 260], [440, 270], [360, 300]]), slot("15:30", "21:30", "wineshop", [372, 286])],
    lines: ["The honesty box is very honest today.", "Someone asked who makes these. I said a very busy lady.", "Evenings are the best. Everyone wants a glass.", "If the shelves are full, I'm happy."],
    away: "Celeste's not on. The honesty box minds the shop."
  },
  // Ma Ma, Mel's grandma: she tends the orchard and the flower farm (watering, picking), has tea in her cottage in
  // the afternoon, and now and then pops up in town (Saturdays), at the vineyard (Tuesdays and Thursdays) and at
  // Mel's home (Sundays). Specific days come first: the first slot that matches wins.
  {
    id: "mama", pitch: 0.9, name: "Ma Ma", job: "Grandma, keeper of the orchard",
    intro: "Ah girl! Come, come. Have you eaten? I've cut some fruit for you. I love you, you know that?",
    look: {skin: "#D9A57E", hair: "#1E1A18", hairStyle: "curly", top: "#3E6B8C", bottom: "#7A4A2E", batik: "#F3D9A0", hat: "sunhat"},
    routine: [slot("15:00", "16:30", "hfarm", [[200, 530], [280, 520], [340, 530]], {dow: [2]}), slot("9:30", "11:30", "village", [[200, 420], [300, 440], [250, 520]], {dow: [6]}),
      slot("15:00", "17:00", "base", [[230, 360], [300, 590], [160, 520]], {dow: [0]}),
      slot("16:00", "17:30", "vineyard", [[262, 390], [340, 440], [300, 300]], {dow: [2, 4]}),
      slot("7:00", "11:00", "orchard", [[160, 330], [260, 420], [360, 510], [210, 500], [310, 330]], {act: "water"}),
      slot("11:00", "13:00", "flowers", [[160, 300], [260, 380], [360, 470], [210, 300]], {act: "water"}),
      slot("13:00", "15:00", "cottage", [[300, 330], [200, 360], [470, 530]]),
      slot("15:00", "16:00", "cottage", [154, 564], {act: "sit"}),
      slot("16:00", "18:00", "flowers", [[160, 380], [260, 470], [360, 300], [310, 300]], {act: "farm"}),
      slot("18:00", "22:50", "cottage", [398, 352], {act: "sit"}), slot("22:50", "23:00", "cottage", [66, 352])],
    lines: ["I love you, ah girl.", "Have you eaten? Come, I cut fruit for you.", "Don't work so hard. Rest a little.", "Eat more. You're too thin.",
      "Bring Evan to see the flowers, ok?", "Wear a jacket. The office aircon is very cold.", "You're doing very well. Ma Ma is proud of you.", "Drink some water. And not only coffee."],
    actLines: {guide: ["And this is my apple tree. Planted it with my granddaughter!", "Smell this rose. Go on, smell.", "This way, this way. Mind the mud."], water: ["Watering, watering. The trees are thirsty today.", "Plants are like children. Talk to them nicely.", "The fruit is coming along. Patience."],
      farm: ["The flowers grow better when you sing to them.", "Look at this one. So pretty, like you.", "Cutting some for the shop. Want some?"]},
    away: "Ma Ma's resting. She'll be out in the garden in the morning.",
    react: {harvest: "So clever! You grow things like Ma Ma.", quests3: "Three already? Don't forget to eat lunch.", lunch: "Lunch time! Eat properly, ok?"}
  },
  // Gong Gong, Mel's grandpa: lives with Ma Ma in the cottage. At home he's in his white singlet and berms, watching
  // TV or helping in the orchard and flower farm; going out (town on Mondays and Saturdays, the vineyard on Wednesdays,
  // Mel's home at the weekend) he puts on a pressed shirt and long trousers.
  {
    id: "gonggong", pitch: 0.75, name: "Gong Gong", job: "Grandpa, Ma Ma's helper in the orchard",
    intro: "Ah, my girl is here. Sit, sit. Gong Gong is just watching the news. Have you eaten?",
    look: {skin: "#F2D6BD", hair: "#D9D4CC", hairStyle: "short", top: "#FFFFFF", bottom: "#8C8F7A", shorts: true, specs: "#C9A23A", tall: true},
    routine: [slot("6:30", "9:00", "field", [76, 300], {act: "fish", dow: [0], dir: 1}), slot("15:00", "16:30", "hfarm", [[180, 520], [260, 520], [330, 520]], {dow: [2], look: OUT}), slot("10:00", "12:00", "village", [[230, 420], [300, 470], [190, 520]], {dow: [1], look: OUT}),
      slot("9:30", "11:30", "village", [[220, 430], [290, 450], [260, 520]], {dow: [6], look: OUT}),
      slot("15:00", "17:00", "vineyard", [[300, 300], [380, 300], [262, 440]], {dow: [3], look: OUT}),
      slot("15:00", "17:00", "base", [[250, 360], [320, 590], [180, 520]], {dow: [0, 6], look: OUT}),
      slot("7:30", "9:00", "cottage", [458, 358], {act: "sit"}),
      slot("9:00", "11:30", "orchard", [[160, 420], [260, 510], [360, 420], [210, 330]], {act: "farm"}),
      slot("11:30", "13:00", "cottage", [458, 358], {act: "sit"}),
      slot("13:00", "14:00", "flowers", [[160, 330], [260, 420], [360, 510]], {act: "water"}),
      slot("14:00", "15:00", "cottage", [458, 358], {act: "sit"}),
      slot("15:00", "16:00", "cottage", [66, 564], {act: "sit"}),
      slot("16:00", "17:00", "cottage", [458, 358], {act: "sit"}),
      slot("17:00", "18:00", "orchard", [[160, 330], [260, 420], [360, 510]], {act: "water"}),
      slot("18:00", "22:50", "cottage", [458, 358], {act: "sit"}), slot("22:50", "23:00", "cottage", [86, 360])],
    lines: ["Have you eaten? Ma Ma made too much again.", "Work is important, but rest is also important.", "Come, sit with Gong Gong. The news is on.", "Your Ma Ma's flowers are the best in the village. Don't tell her I said.",
      "Slowly, slowly. No need to rush.", "Gong Gong is very proud of you.", "Bring Evan next time, ok? I want to see how tall he is."],
    actLines: {guide: ["This tree here is older than my eldest grandson. Almost.", "Ma Ma does the flowers, I do the talking.", "Any questions? No? Good, I don't know the answers."], farm: ["Loosening the soil for Ma Ma. She's the boss here.", "These trees will give good fruit. Patience."], water: ["Gong Gong waters, Ma Ma checks. Teamwork.", "A little water, a little sun. Same as people."],
      sit: ["Shh, the drama is at the good part.", "Ma Ma says I watch too much TV. She's watching also."]},
    away: "Gong Gong's having his afternoon nap.",
    react: {harvest: "Wah, so much! You grow like Ma Ma.", quests3: "Three already? Clever girl.", lunch: "Lunchtime. Don't skip, ok?"}
  },
  // The orchard's two workers: Farid looks after the fruit trees, Mei the flower farm (both help Ma Ma, and take turns
  // leading the weekend tours)
  {
    id: "farid", pitch: 0.85, name: "Farid", job: "Works the fruit orchard",
    intro: "Farid! I prune, I fertilise, I carry Ma Ma's ladders. She says I talk to the trees too much. She's one to talk.",
    look: {skin: "#B07A55", hair: "#2A211D", hairStyle: "short", top: "#7FA35A", bottom: "#5E5A55", hat: "cap"},
    routine: [slot("8:00", "12:00", "orchard", [[160, 330], [260, 420], [360, 510], [210, 510], [310, 330]], {act: "farm"}),
      slot("12:00", "13:00", "orchard", [470, 330], {act: "sit"}),
      slot("13:00", "17:30", "orchard", [[160, 420], [260, 510], [360, 330], [410, 420]], {act: "water"})],
    lines: ["Ma Ma's the boss. I just carry things.", "The apples are looking good this week.", "Want to help? Kidding. Ma Ma would never let you lift anything.", "Best office in the village, this."],
    actLines: {guide: ["Over here we've got the fruit trees. Ma Ma's pride and joy.", "You can taste one at the farm shop after!", "Step around the hose, please. Everyone always forgets the hose."], farm: ["Pruning the old branches. More fruit next time.", "Mulch. Very glamorous."], water: ["Deep water, twice a week. Ma Ma's rule.", "These trees drink more than I do."]},
    away: "Farid's gone home for the day."
  },
  {
    id: "mei", pitch: 1.2, name: "Mei", job: "Works the flower farm",
    intro: "Hi, I'm Mei! I look after the flower beds. Ma Ma taught me everything, including how to sing to the roses. Don't laugh.",
    look: {skin: "#EAC4A4", hair: "#2B2320", hairStyle: "bob", top: "#F4C7CF", bottom: "#5E6E8C", hat: "sunhat"},
    routine: [slot("7:00", "8:00", "hwoods", [[132, 590], [180, 560], [100, 600]], {dow: [0]}), slot("8:00", "12:00", "flowers", [[160, 300], [260, 380], [360, 470], [210, 470], [310, 300]], {act: "water"}),
      slot("12:00", "13:00", "flowers", [44, 486], {act: "sit"}),
      slot("13:00", "17:30", "flowers", [[160, 380], [260, 470], [360, 300], [410, 380]], {act: "farm"})],
    lines: ["The dahlias are showing off today.", "Ma Ma says flowers know when you're happy.", "Bouquet for someone special? Just say.", "I could do this forever."],
    actLines: {guide: ["These beds bloom again every day or so. Isn't that lovely?", "That one's my favourite. Don't tell the others.", "Bouquets at the farm shop, if anyone's feeling romantic."], water: ["Gentle on the petals.", "Morning water, happy flowers."], farm: ["Deadheading. Snip, snip.", "Cutting a few for the shop."]},
    away: "Mei's finished for the day."
  },
  // Out-of-towners: day trippers who only ever turn up at the wine shop (tastings, a bottle to take home) and Ma Ma's
  // orchard (farm tours, fruit and flowers from the farm shop). No routine of their own: tours.js says when they come.
  ...[["aiko", "Aiko", {skin: "#F0D2B6", hair: "#2B2320", hairStyle: "bob", top: "#F6A23A", bottom: "#3F4A6B", hat: "sunhat"}, "Visiting from the city"],
    ["ben", "Ben", {skin: "#E8C4A0", hair: "#B5562E", hairStyle: "short", top: "#6E9FD6", bottom: "#5E5A55", extra: "satchel"}, "Here on a cycling holiday"],
    ["clara", "Clara", {skin: "#F2D3BC", hair: "#D9B46A", hairStyle: "long", top: "#E8566C", bottom: "#2F3B73"}, "On a weekend away"],
    ["dev", "Dev", {skin: "#A8754F", hair: "#1F1A17", hairStyle: "short", top: "#F3E7B0", bottom: "#4A5568", hat: "cap"}, "Food blogger, just passing through"],
    ["rosa", "Rosa", {skin: "#D9A882", hair: "#2A211D", hairStyle: "long", top: "#C2505F", bottom: "#3E4A43", extra: "satchel"}, "Wine lover on a tasting trip"],
    ["bastien", "Bastien", {skin: "#EBC9A8", hair: "#7C7570", hairStyle: "short", top: "#6E9FD6", bottom: "#8A6A52", extra: "glasses"}, "Retired, touring the countryside"],
    ["grace", "Grace", {skin: "#C99A78", hair: "#2A211D", hairStyle: "long", top: "#F4C7CF", bottom: "#5E6E8C", hat: "sunhat"}, "Visiting her sister for the week"],
    ["hiro", "Hiro", {skin: "#EAC4A4", hair: "#231C19", hairStyle: "spiky", top: "#3E6B8C", bottom: "#2F2B28", extra: "satchel"}, "Here for the farm tours"]
  ].map(([id, name, look, job]) => ({id, pitch: .9 + (id.charCodeAt(0) % 5)*.08, name, job, tourist: true, look, routine: [],
    intro: `Hi! I'm ${name}. ${job}. What a lovely place this is!`,
    lines: ["First time here. It's gorgeous!", "We came for the wine and stayed for the view.", "Is it always this peaceful?", "I'm taking some of this home, for sure.", "Do you live here? Lucky you.", "My friends are going to be so jealous."],
    actLines: {sit: ["This rosé is lovely. Who makes it?", "Cheers! To holidays.", "I'm buying a bottle before I go."]},
    away: `${name}'s gone back to town.`})),
  // The night market's traders (Tuesday and Thursday evenings, tours.js NIGHT): out-of-towners who drive in with
  // their stalls, and the evening's tourists. No routine of their own.
  ...[["yun", "Yun", {skin: "#EAC4A4", hair: "#1F1A17", hairStyle: "bob", top: "#E8566C", bottom: "#2F2B28"}, "Street snacks, up from Taipei"],
    ["jae", "Jae", {skin: "#F0D2B6", hair: "#231C19", hairStyle: "spiky", top: "#F6F2EA", bottom: "#3F4A6B", hat: "cap"}, "Korean street food, from Seoul"],
    ["mina", "Mina", {skin: "#F2D3BC", hair: "#3A2A22", hairStyle: "long", top: "#F4C7CF", bottom: "#5E6E8C"}, "Makes hair clips and scrunchies"],
    ["tomas", "Tomás", {skin: "#C99A78", hair: "#2A211D", hairStyle: "short", top: "#9C8CD9", bottom: "#4A5568", extra: "glasses"}, "Sells keychains and charms"],
    ["sora", "Sora", {skin: "#EAC4A4", hair: "#7A4A32", hairStyle: "bun", top: "#7FB8E8", bottom: "#F6F2EA"}, "Socks, hats and tees"],
    ["lior", "Lior", {skin: "#D9A882", hair: "#5A3A2A", hairStyle: "short", top: "#F3C969", bottom: "#3E4A43"}, "Makes paper lanterns"],
    ["wen", "Wen", {skin: "#F0D2B6", hair: "#1F1A17", hairStyle: "long", top: "#C9A3E0", bottom: "#2F3B73"}, "Tanghulu and egg waffles"],
    ["kai", "Kai", {skin: "#A8754F", hair: "#1F1A17", hairStyle: "spiky", top: "#9CC27E", bottom: "#4A5568"}, "Presses sugarcane to order"]
  ].map(([id, name, look, job]) => ({id, pitch: .9 + (id.charCodeAt(0) % 5)*.08, name, job, tourist: true, look, routine: [],
    intro: `Hi! I'm ${name}. ${job}. We're here Tuesdays and Thursdays, half five till ten.`,
    lines: ["Busy night! Everyone's out.", "Have you heard the band? They're so good.", "Love this little town. Best market on our route.", "Come back Thursday, I'll have a new batch."],
    away: `${name}'s packed up and driven home.`})),
  // Felix and Elena run Wildflower Farm, east of the bay (game/hfarm.js): Felix keeps the bees, Elena the cows, goats
  // and the dairy. Sunday mornings they're at their market stalls (tours.js MARKET), selling the farm's honey and cheese
  {id: "felix", pitch: .85, name: "Felix", job: "Keeps the bees at Wildflower Farm",
    look: {skin: "#EBC9A8", hair: "#7C7570", hairStyle: "short", top: "#7FB069", bottom: "#8A6A52", extra: "glasses", hat: "sunhat"},
    routine: [slot("7:15", "7:50", "hlane", [300, 150], {dir: -1}), slot("14:00", "16:00", "barn", [[200, 400], [320, 400], [262, 500]], {dow: [1, 3, 5]}), slot("07:00", "12:00", "hfarm", [[186, 286], [310, 286], [300, 520]]), slot("12:00", "13:00", "hfarm", [60, 270], {act: "sit"}),
      slot("13:00", "18:00", "hfarm", [[186, 286], [200, 524], [300, 520], [310, 286]])],
    intro: "Felix. I keep the bees up here at Wildflower Farm. Lavender honey, orchard blossom, wildflower... they decide, not me.",
    lines: ["The bees are cheerful today. Can you hear them?", "Never wear blue near a hive. They think you're a flower.", "Elena says I talk to the bees more than to her. She's not wrong.", "Hive three is my favourite. Don't tell the others."],
    hellos: ["Morning, Mel!", "Ah, a helper!"], away: "Felix is in the farmhouse with his feet up."},
  {id: "elena", pitch: 1.05, name: "Elena", job: "Runs the dairy at Wildflower Farm",
    look: {skin: "#D9A882", hair: "#5A3A2A", hairStyle: "bun", top: "#9C8CD9", bottom: "#3E4A43", extra: "apron"},
    routine: [slot("06:00", "11:00", "hfarm", [[30, 400], [260, 400], [490, 420], [440, 516]]), slot("11:00", "13:00", "barn", [[262, 520], [380, 560], [160, 560]]),
      slot("13:00", "18:00", "hfarm", [[200, 600], [260, 524], [440, 512], [458, 270]])],
    intro: "I'm Elena. Cows, goats, and soon a proper cheese cave in the barn. The cheese at my market stall? Aged right here.",
    lines: ["Daisy's the boss of the paddock. Mochi just pretends.", "Milking at six. The goats prefer six-fifteen.", "A good cheese takes patience. So does a good goat.", "Pepper ate my notebook again."],
    hellos: ["Hi Mel! Grab a bucket.", "Morning! Hay's in the barn."], away: "Elena's done for the day. Even the goats are asleep."},
  // Amara serves at the Cocoa Room's counter (once Mel opens it, goals.js "cocoa"), Tuesday to Sunday
  {id: "amara", pitch: 1.15, name: "Amara", job: "Serves at the Cocoa Room",
    look: {skin: "#A8754F", hair: "#1F1A17", hairStyle: "bun", top: "#8A5A3A", bottom: "#F3E7C9", extra: "apron"},
    routine: [slot("10:45", "20:15", "cocoa", [300, 268], {dow: [0, 2, 3, 4, 5, 6], needs: "cocoa"})],
    intro: "Hi, I'm Amara! I wrap, I sell, and I sneak the broken bits. Don't tell.",
    lines: ["The dark one's flying off the wall today.", "Someone bought six bars. Six!", "It smells like heaven in here, all day long.", "I told a tourist you make it from the bean. They nearly cried."],
    hellos: ["Hi Mel! The wall's looking good.", "Boss! Want a taste?"], away: "Amara's off. The Cocoa Room's quiet."},
  // Mateo is the Cocoa Room's kitchen hand (cocoa.js handStep), a student working part-time: Wed and Fri 2-6, Sat 10-5
  {id: "mateo", pitch: .95, name: "Mateo", job: "Kitchen hand at the Cocoa Room",
    look: {skin: "#C99A78", hair: "#2A211D", hairStyle: "short", top: "#F6F2EA", bottom: "#4A2E22", extra: "apron"},
    routine: [slot("20:30", "22:00", "honeysuckle", [300, 470], {act: "sit"}), slot("08:00", "09:30", "hlane", [[200, 320], [236, 450], [330, 180]]), slot("19:00", "22:00", "hlane", [186, 298], {act: "sit"}),   // home: Honeysuckle, with Lila
      slot("14:00", "18:00", "cocoakitchen", [[250, 330], [410, 330], [180, 500], [360, 500]], {dow: [3, 5], needs: "cocoa"}),
      slot("10:00", "17:00", "cocoakitchen", [[250, 330], [410, 330], [180, 500], [360, 500]], {dow: [6], needs: "cocoa"})],
    intro: "Hola! I'm Mateo. I study food science at the poly, and on Wednesdays, Fridays and Saturdays I keep the bars coming here. The bonbons are all yours, boss.",
    lines: ["Your bonbon shelf is full. I didn't touch a crumb!", "Exams next week. Tempering is very calming.", "My lecturer says I'm the only one who's ground beans by hand.", "The grinder's singing today.", "Forty dark bars on the wall. A personal best.", "I bought beans this morning. Don't worry, I kept to your budget."],
    hellos: ["Morning, boss! Roaster's warm.", "Hi Mel! Smell that?"], away: "Mateo's gone home. The kitchen's quiet."},
  // Lila, the Cocoa Room's second assistant (cocoa.js upgrade "assistant"): Mondays (Amara's day off) and weekend afternoons
  {id: "lila", pitch: 1.2, name: "Lila", job: "Serves at the Cocoa Room",
    look: {skin: "#F2D3BC", hair: "#B5562E", hairStyle: "bob", top: "#C2505F", bottom: "#F3E7C9", extra: "apron"},
    routine: [slot("21:00", "22:30", "honeysuckle", [220, 470], {act: "sit"}), slot("20:30", "22:30", "hlane", [206, 306], {act: "sit"}), slot("09:00", "10:30", "hlane", [[150, 300], [236, 400], [120, 500]], {dow: [2, 3, 4, 5]}),   // home: Honeysuckle
      slot("10:45", "20:15", "cocoa", [240, 268], {dow: [1], needs: "cc_assistant"}), slot("13:00", "20:15", "cocoa", [[180, 420], [400, 440], [240, 268]], {dow: [0, 6], needs: "cc_assistant"})],
    intro: "Hi! I'm Lila. Mondays are mine, and I help Amara at weekends. I'm working my way through every bonbon. For research.",
    lines: ["Mondays are quiet, but the regulars are lovely.", "I wrapped forty boxes on Saturday. My fingers are ribbon now.", "Someone asked if we deliver to the moon.", "The fountain is hypnotic. I keep staring at it."],
    hellos: ["Hi Mel!", "Morning, boss!"], away: "Lila's not on today."},
  // Noor runs the pet adoption corner at the Sunday farmers market and the field fair (tours.js); no routine otherwise
  // Noor lives at Clover on the cottage lane, with a pen of rescues in the garden
  {id: "noor", pitch: 1.1, name: "Noor", job: "Finds homes for rescued pets", routine: [slot("18:30", "19:30", "clover", [262, 470], {act: "sit"}), slot("08:00", "12:00", "hlane", [[198, 456], [150, 470], [236, 470]], {dow: [1, 2, 3, 4, 5, 6]}), slot("16:00", "19:30", "hlane", [176, 456], {act: "sit"})],
    look: {skin: "#C99A78", hair: "#2A211D", hairStyle: "long", top: "#9FD3C2", bottom: "#4A5568", extra: "apron"},
    intro: "Hi, I'm Noor! I find homes for little ones who need them. Kittens, puppies, bunnies... everyone deserves a cuddle.",
    lines: ["This one loves a chin scratch.", "Every pet that goes home, I cry a little. Happy tears.", "Ask me anything about looking after them!", "The duckling follows everyone. It thinks we're all its mum."],
    away: "Noor's taken the animals home for a rest."},
  ...[["noa", "Noa", {skin: "#F2D3BC", hair: "#D9B46A", hairStyle: "long", top: "#F28C6A", bottom: "#2F3B73"}],
    ["jun", "Jun", {skin: "#EAC4A4", hair: "#231C19", hairStyle: "short", top: "#3E6B8C", bottom: "#5E5A55", extra: "satchel"}],
    ["bea", "Bea", {skin: "#C99A78", hair: "#2A211D", hairStyle: "bun", top: "#F3C969", bottom: "#4A5568"}],
    ["omar", "Ezra", {skin: "#A8754F", hair: "#1F1A17", hairStyle: "short", top: "#F6F2EA", bottom: "#3F4A6B", extra: "glasses"}],
    ["lucy", "Lucy", {skin: "#F2D3BC", hair: "#B5562E", hairStyle: "bob", top: "#9C8CD9", bottom: "#5E6E8C"}],
    ["tae", "Tae", {skin: "#F0D2B6", hair: "#1F1A17", hairStyle: "spiky", top: "#E8566C", bottom: "#2F2B28", hat: "cap"}],
    ["ivy", "Ivy", {skin: "#D9A882", hair: "#3A2A22", hairStyle: "long", top: "#9CC27E", bottom: "#3E4A43"}],
    ["rafe", "Rafe", {skin: "#EBC9A8", hair: "#7C7570", hairStyle: "short", top: "#7FB8E8", bottom: "#8A6A52"}]
  ].map(([id, name, look]) => ({id, pitch: .9 + (id.charCodeAt(0) % 5)*.08, name, job: "Here for the night market", tourist: true, look, routine: [],
    intro: `Hi! I'm ${name}. We drove up for the night market. Have you tried the fried chicken?`,
    lines: ["This band is amazing.", "I've eaten three things already. No regrets.", "The fairy lights! So pretty.", "We're coming back Thursday.", "Is it always this lively here?"],
    away: `${name}'s gone back to town.`})),
  // Out-of-town families: a parent and their kids, who only come for the vineyard playground (and the field on market
  // and fair days). tours.js (familyVisits) says when.
  ...[["sam", "Sam", {skin: "#E8C4A0", hair: "#5A3A2A", hairStyle: "short", top: "#7FB8E8", bottom: "#4A5568", hat: "cap"}],
    ["priya", "Priya", {skin: "#B07A55", hair: "#1F1A17", hairStyle: "long", top: "#E8566C", bottom: "#3F4A6B"}],
    ["jonah", "Jonah", {skin: "#F2D3BC", hair: "#D9B46A", hairStyle: "short", top: "#9CC27E", bottom: "#5E5A55", extra: "glasses"}],
    ["mia", "Mia", {skin: "#D9A882", hair: "#2B2320", hairStyle: "bob", top: "#F3C969", bottom: "#5E6E8C", hat: "sunhat"}]
  ].map(([id, name, look]) => ({id, pitch: .95, name, job: "Visiting with the kids", tourist: true, look, routine: [],
    intro: `Hi, I'm ${name}! We drove up for the day. The kids haven't stopped running since we got here.`,
    lines: ["They'll sleep well tonight!", "A glass of wine while they play? Perfect day.", "We'll definitely be back.", "Is the roundabout always this popular?"],
    away: `${name}'s family has gone home.`})),
  ...[["lily", "Lily", {skin: "#E8C4A0", hair: "#5A3A2A", hairStyle: "long", top: "#F4C7CF", bottom: "#7FB8E8"}],
    ["max", "Max", {skin: "#E8C4A0", hair: "#5A3A2A", hairStyle: "spiky", top: "#F3C969", bottom: "#4C7BB0"}],
    ["noah", "Noah", {skin: "#B07A55", hair: "#1F1A17", hairStyle: "spiky", top: "#9CC27E", bottom: "#5E5A55"}],
    ["zara", "Zara", {skin: "#F2D3BC", hair: "#D9B46A", hairStyle: "bob", top: "#C9A3E0", bottom: "#E8566C"}],
    ["ollie", "Ollie", {skin: "#F2D3BC", hair: "#D9B46A", hairStyle: "short", top: "#F28C6A", bottom: "#3F4A6B"}],
    ["ava", "Ava", {skin: "#D9A882", hair: "#2B2320", hairStyle: "bun", top: "#8FB3E8", bottom: "#F3C969"}]
  ].map(([id, name, look]) => ({id, pitch: 1.45, name, job: "Here for the playground", tourist: true, kid: true, look, routine: [],
    intro: `I'm ${name}! Wanna race?`,
    lines: ["Push me on the swing!", "Again! Again!", "The roundabout is the BEST.", "I'm not dizzy. Okay, a bit dizzy.", "Can Evan play too?"],
    away: `${name}'s gone home.`})),
  // The wine shop's cook: on her shifts she runs the kitchen from whatever's in the larder (see cookTick)
  // Honeybrook Woods' ranger (round 103): cycles up from Makers' Lane in the morning, walks the trails, keeps the
  // Round 107: Ronda's locals (local: "ronda"). They're only ever on Ronda's screens, so Mel meets them on a day trip.
  // Doña Carmen keeps the sweet shop (and knew Pilar's mother); Rafael sells his family's oil and almonds at the market
  // (and, once he trusts Mel, Tempranillo cuttings); Lucía paints the tiles; Manolo busks by the fountain.
  {
    id: "carmen", local: "ronda", pitch: 0.9, name: "Doña Carmen", job: "Keeps the sweet shop on Ronda's plaza",
    intro: "¡Hola, guapa! Doña Carmen. Yemas, almond cake, and sixty years of gossip. Come in, come in, out of the sun.",
    look: {skin: "#D9A47E", hair: "#E8E4DE", hairStyle: "bun", top: "#3A3430", bottom: "#3A3430", extra: "apron"},
    routine: [slot("9:00", "14:00", "rd_cafe", [[336, 262], [458, 262], [400, 300]]), slot("17:30", "21:00", "rd_cafe", [[336, 262], [458, 262]]), slot("21:00", "22:00", "rd_plaza", [320, 290], {act: "sit"})],
    lines: ["Sit, sit. Have a yema. Have two.", "In my day this plaza was all donkeys. Now it's all telephones.", "The nuns taught me everything. Except patience.", "Too thin! Eat something."],
    away: "Doña Carmen's having her siesta. The shop opens again at half past five."
  },
  {
    id: "rafael", local: "ronda", pitch: 0.65, name: "Rafael", job: "Olive farmer, with a stall at Ronda's market",
    intro: "Rafael. Oil, almonds. My family has pressed olives in the valley for five generations. Taste. No bread, just taste.",
    look: {skin: "#B9825E", hair: "#4A4440", hairStyle: "short", top: "#7A8A5A", bottom: "#5A4A3E", extra: "cap"},
    routine: [slot("8:00", "14:00", "rd_mercado", [312, 262], {dir: -1}), slot("18:00", "20:00", "rd_plaza", [440, 296], {act: "sit", dir: -1})],
    lines: ["Good oil, you taste it in the back of the throat. It bites a little.", "The olives don't care about your problems. That's why I like them.", "Almonds this year: small, but sweet. Like my grandmother.", "Hmph. You again. Good."],
    away: "Rafael's back at the farm in the valley. The market stall's covered up till morning."
  },
  {
    id: "lucia", local: "ronda", pitch: 1.15, name: "Lucía", job: "Paints the tiles at her shop in the old town",
    intro: "Hola! Lucía. Every tile in here I painted myself. I'm doing every view in Ronda. Two hundred and eleven so far.",
    look: {skin: "#E2B590", hair: "#2A211D", hairStyle: "long", top: "#3E6BAE", bottom: "#F3ECDD", extra: "apron"},
    routine: [slot("10:00", "14:00", "rd_old", [[384, 450], [360, 452], [404, 452]]), slot("14:00", "15:30", "rd_bridge", [420, 300], {act: "sketch", dir: -1}), slot("17:00", "20:30", "rd_old", [[384, 450], [360, 452]])],
    lines: ["The light at five o'clock: that's when the bridge goes gold.", "Blue from the mountains, yellow from the sun. That's all you need.", "A tile is a little window. You can hang a view on the wall.", "Careful, that one's still drying!"],
    away: "Lucía's shop is closed for lunch. A sign on the door: 'Painting the bridge. Back at five.'"
  },
  {
    id: "manolo", local: "ronda", pitch: 0.8, name: "Manolo", job: "Plays flamenco guitar by the fountain",
    intro: "Manolo. I play, people walk past, some of them stop. The pigeons always stop. They never tip.",
    look: {skin: "#C68E68", hair: "#1E1A18", hairStyle: "short", top: "#F6EFE3", bottom: "#2F2B28"},
    // (and plays for Paloma's flamenco in the tapas bar, 1 to 3 and 8 to 10)
    routine: [slot("11:00", "13:00", "rd_plaza", [306, 378], {act: "guitar", dir: -1}), slot("13:00", "15:00", "rd_tapas", [404, 520], {act: "guitar", dir: 1}), slot("15:30", "18:00", "rd_station", [232, 500], {act: "guitar", dir: -1}),
      slot("18:00", "20:00", "rd_plaza", [306, 378], {act: "guitar", dir: -1}), slot("20:00", "22:00", "rd_tapas", [404, 520], {act: "guitar", dir: 1})],
    lines: ["This one's a bulería. Clap on twelve. No, twelve. Never mind.", "A guitar is just wood and string and a bit of heartbreak.", "Your family has good ears. Especially the lady who dances.", "Requests? I know three songs. And forty more."],
    actLines: {guitar: ["*strums*", "Olé!", "This one's for the pigeons."]},
    away: "Manolo's guitar case is shut. He's having a coffee somewhere."
  },
  // Round 116: the people in Ronda's interiors (local: "ronda"), so the rooms never feel empty: Paco the waiter,
  // Pepe with his paper, Lola with her shopping, Amina who shows people round the baths, Joaquín the gardener,
  // Rocío's flowers at the market, and three tourists doing the sights (a few in each room at a time, never a crowd)
  {
    id: "paco", local: "ronda", pitch: 0.75, name: "Paco", job: "Waiter at the tapas bar",
    intro: "Paco! Sit anywhere, anywhere. The croquetas are hot, the beer is cold, and my feet are tired.",
    look: {skin: "#C99470", hair: "#2A211D", hairStyle: "short", top: "#FFFDF6", bottom: "#2F2B28", extra: "apron"},
    routine: [slot("9:30", "16:00", "rd_tapas", [[200, 290], [360, 270], [240, 360], [380, 400], [160, 330]]), slot("19:00", "22:30", "rd_tapas", [[200, 290], [360, 270], [240, 360], [380, 400]])],
    lines: ["Two salmorejo, one croqueta, coming!", "In Ronda we eat late. Lunch at three, dinner at ten. Breakfast? Coffee.", "The ham's from the mountains. The pigs ate acorns all their lives. Happy pigs.", "Mind the step, guapa."],
    away: "Paco's having his own lunch, in the kitchen, standing up."
  },
  {
    id: "pepe", local: "ronda", pitch: 0.6, name: "Pepe", job: "Retired, reads the paper all over town",
    intro: "Pepe. Eighty-one. I've read the paper in every chair in Ronda. This one's the best.",
    look: {skin: "#C08B66", hair: "#E8E4DE", hairStyle: "short", top: "#7A6A5A", bottom: "#4A4440", extra: "cap"},
    routine: [slot("9:00", "12:00", "rd_cafe", [80, 340], {act: "sit"}), slot("12:30", "15:00", "rd_tapas", [92, 392], {act: "sit"}), slot("17:00", "20:00", "rd_jardin", [120, 604], {act: "doze"})],
    lines: ["The news is the same as yesterday. Only louder.", "When I was a boy we swam in the river at the bottom of the gorge. Mad.", "Sit, sit. The chair's free. The advice is free too.", "Hmm? Oh. I was resting my eyes."],
    away: "Pepe's having his siesta. Nobody disturbs Pepe's siesta."
  },
  {
    id: "lola", local: "ronda", pitch: 1.05, name: "Lola", job: "Lives above the plaza, shops every morning",
    intro: "Lola. I live up there, the balcony with all the geraniums. You're the family from the train? Welcome!",
    look: {skin: "#D9A47E", hair: "#3A2A22", hairStyle: "bun", top: "#C2307A", bottom: "#2F2B28", extra: "satchel"},
    routine: [slot("8:30", "12:00", "rd_mercado", [[220, 400], [300, 440], [190, 420], [340, 380]]), slot("12:00", "13:30", "rd_cafe", [140, 342], {act: "sit", dir: -1}), slot("18:00", "20:00", "rd_tapas", [148, 394], {act: "sit", dir: -1})],
    lines: ["Rafael's almonds, Carmen's yemas, Paco's croquetas. That's my whole diet.", "Every morning the same walk, and every morning it's beautiful.", "Don't buy the oranges at the front. The good ones are at the back.", "¡Qué niño más guapo!"],
    away: "Lola's up on her balcony, watering the geraniums."
  },
  {
    id: "amina", local: "ronda", pitch: 1.1, name: "Amina", job: "Shows people round the Arab baths",
    intro: "Welcome to the baths! Amina. Eight hundred years old, these domes. Look up: the stars are holes in the roof.",
    look: {skin: "#B9825E", hair: "#1E1A18", hairStyle: "long", top: "#3E8A8A", bottom: "#F3ECDD", extra: "glasses"},
    routine: [slot("10:00", "14:00", "rd_banos", [[200, 300], [320, 300], [260, 380], [180, 420]]), slot("16:00", "19:00", "rd_banos", [[200, 300], [320, 300], [260, 380]])],
    lines: ["Three rooms: cold, warm, hot. Like a sauna, before saunas.", "The water came up from the river on a wheel, turned by a donkey.", "Clap your hands. Hear that echo? Eight hundred years.", "The star holes kept the heat in and let the light down. Clever, no?"],
    away: "The baths are closed for lunch. Amina's in the shade with a book."
  },
  {
    id: "joaquin", local: "ronda", pitch: 0.7, name: "Joaquín", job: "Keeps the Moorish garden",
    intro: "Joaquín. Gardener. The water does most of the work. I just tell it where to go.",
    look: {skin: "#B07A55", hair: "#4A4440", hairStyle: "short", top: "#5E8A5A", bottom: "#6B5A44", hat: "sunhat"},
    routine: [slot("9:00", "13:00", "rd_jardin", [214, 360], {act: "water", dir: 1}), slot("16:00", "19:00", "rd_jardin", [306, 410], {act: "water", dir: -1})],
    lines: ["Myrtle, orange, cypress. The same plants for a thousand years. They know what they're doing.", "Listen. The water. That's the whole point of a garden like this.", "Don't pick the oranges. Bitter! For marmalade only.", "Shade, water, quiet. Stay as long as you like."],
    away: "Joaquín's gone home for lunch. The water keeps on running."
  },
  {
    id: "paloma", local: "ronda", pitch: 1.1, name: "Paloma", job: "Dances flamenco in the tapas bar",
    intro: "Paloma. I dance. Manolo plays, I dance, and if you clap in the right places, I dance better. Olé!",
    look: {skin: "#D9A47E", hair: "#1E1A18", hairStyle: "bun", top: "#C8343A", bottom: "#C8343A"},
    routine: [slot("13:00", "15:00", "rd_tapas", [462, 516], {act: "dance", dir: -1}), slot("20:00", "22:00", "rd_tapas", [462, 516], {act: "dance", dir: -1})],
    lines: ["Clap on three, six, eight, ten and twelve. It's easy! It's not easy.", "Flamenco is not happy, not sad. It's both, at the same time.", "My grandmother danced on this same stage. Well, the old one. It fell down.", "¡Venga, Evan! Clap with me!"],
    away: "Paloma's resting her feet. The show's at one and at eight."
  },
  {
    id: "antonio", local: "ronda", pitch: 0.7, name: "Antonio", job: "Leatherworker from Ubrique, with a workshop in the old town",
    intro: "Antonio. From Ubrique, over the hills: a whole village of leatherworkers. My grandfather made saddles. I make bags. Same stitch.",
    look: {skin: "#C08B66", hair: "#3A3430", hairStyle: "short", top: "#8A5A3A", bottom: "#3A3430", extra: "apron"},
    routine: [slot("10:00", "14:00", "rd_cuero", [262, 296], {act: "repair"}), slot("17:00", "20:00", "rd_cuero", [262, 296], {act: "repair"})],
    lines: ["Saddle stitch: two needles, one thread. A machine can't do it.", "Smell that? Good leather smells like a library.", "This wallet will outlive both of us.", "Ubrique: two thousand people, and every one of them can sew."],
    away: "Antonio's gone home to Ubrique for lunch. Twenty minutes of bends in the road."
  },
  {
    id: "rocio", local: "ronda", pitch: 1.2, name: "Rocío", job: "Sells flowers at the covered market",
    intro: "¡Hola! Rocío. Carnations, roses, whatever the hills give me this week. Smell!",
    look: {skin: "#E2B590", hair: "#6A3A22", hairStyle: "curly", top: "#F3C969", bottom: "#3E6BAE", extra: "apron"},
    routine: [slot("8:00", "14:00", "rd_mercado", [150, 500], {dir: -1})],
    lines: ["Red carnations for love, white for luck. Yellow? Yellow's for my mother.", "Up at five, down to the valley, back by eight. Every day.", "Take one for the little boy. Free! Go on.", "The flowers in winter come from the coast. The ones in spring, from my field."],
    away: "Rocío's stall is just empty buckets. She's sold out and gone home."
  },
  ...[
    ["ingrid", "Ingrid", {skin: "#F6D9C4", hair: "#E8D27A", hairStyle: "long", top: "#7FB8E8", bottom: "#F3ECDD", hat: "sunhat"}, "On holiday from Sweden", "Ingrid, from Sweden! I came for one day. That was four days ago.",
      [slot("10:00", "11:30", "rd_banos", [[160, 300], [340, 320], [260, 420]]), slot("11:30", "13:00", "rd_jardin", [[230, 250], [290, 520], [60, 380], [460, 380]]), slot("13:00", "15:00", "rd_tapas", [392, 312], {act: "sit"}), slot("16:00", "17:30", "rd_cafe", [340, 430], {act: "sit"}), slot("17:30", "19:00", "rd_mercado", [[220, 420], [320, 400], [260, 520]])],
      ["It's so hot! In Sweden it's snowing. Probably.", "I've eaten six yemas today. Don't tell anyone.", "The light here! Everything glows."]],
    ["kenji", "Kenji", {skin: "#EAC4A0", hair: "#1E1A18", hairStyle: "short", top: "#F3ECDD", bottom: "#5A6A7A", extra: "satchel"}, "Photographing his way round Spain", "Kenji. Tokyo. I have taken eleven hundred photographs of the bridge. One more.",
      [slot("9:30", "11:00", "rd_mercado", [420, 420], {act: "photo", dir: -1}), slot("11:00", "12:30", "rd_banos", [380, 330], {act: "photo", dir: -1}), slot("13:30", "15:00", "rd_cafe", [400, 432], {act: "sit", dir: -1}), slot("15:00", "17:00", "rd_jardin", [300, 470], {act: "photo"}), slot("19:00", "21:30", "rd_tapas", [272, 432], {act: "sit"})],
      ["The light through the star holes! Perfect.", "Smile? No, natural. Okay, smile.", "Tomorrow, Granada. Then Seville. Then... more bridges."]],
    ["chloe", "Chloé", {skin: "#F0CBB0", hair: "#8A4A2A", hairStyle: "bob", top: "#E8566C", bottom: "#3A2E28", extra: "satchel"}, "Backpacking through Andalusia", "Chloé! From Lyon. Backpacking, sleeping very little, eating very much.",
      [slot("10:00", "12:00", "rd_cafe", [170, 480], {act: "sit"}), slot("12:00", "13:30", "rd_mercado", [[200, 400], [330, 450], [260, 380]]), slot("14:00", "16:00", "rd_jardin", [406, 604], {act: "notes", dir: -1}), slot("16:30", "18:00", "rd_banos", [[200, 320], [330, 340], [260, 420]]), slot("18:00", "19:30", "rd_cuero", [[200, 420], [330, 440], [260, 500]]), slot("20:00", "22:00", "rd_tapas", [328, 434], {act: "sit", dir: -1})],
      ["I'm writing a postcard to every friend I have. I have too many friends.", "The tapas! Free with a drink! France must learn.", "Have you been to the baths? So peaceful."]]
  ].map(([id, name, look, job, intro, routine, lines]) => ({id, local: "ronda", tourist: true, pitch: .95 + (id.charCodeAt(0) % 4)*.07, name, job, intro, look, routine, lines, away: `${name}'s off seeing another bit of Ronda.`})),
  // Round 122: Kyoto's people (local: "kyoto"). Sachiko keeps the tea house (Okada's grandmother taught her the tea
  // ceremony); Jōshin is the temple's cheerful monk; Mr Tanaka makes the sweets; Fumiko runs a pickle stall at the
  // market; Ishida throws pots; Mr Mori plays Go under the maples. And two tourists, so the rooms never feel empty.
  {
    id: "sachiko", local: "kyoto", pitch: 0.95, name: "Sachiko", job: "Keeps the tea house on the lane",
    intro: "Welcome. I am Sachiko. Please, sit. The water is nearly ready. In this room, nothing is in a hurry.",
    look: {skin: "#EAC4A0", hair: "#2A211D", hairStyle: "bun", top: "#7A8A5A", bottom: "#7A8A5A"},
    routine: [slot("9:00", "17:00", "kt_tea", [[300, 300], [380, 300]], {act: "sit"}), slot("17:00", "21:00", "kt_tea", [340, 300], {act: "sit"})],
    lines: ["Turn the bowl twice, so the prettiest side faces me. That is a kindness.", "One meeting, one chance. Every cup of tea happens only once.", "The scroll says 'calm water'. I change it with the seasons.", "Slowly. You are doing very well."],
    away: "The tea house is resting. Sachiko is arranging tomorrow's flowers."
  },
  {
    id: "joshin", local: "kyoto", pitch: 0.85, name: "Jōshin", job: "A monk at the temple",
    intro: "Jōshin! I'm a monk. I used to sell insurance in Tokyo, which was much harder. Would you like to sit and breathe a little?",
    look: {skin: "#E2B590", hair: "#E2B590", hairStyle: "short", top: "#C98A3A", bottom: "#5A4A3E"},
    routine: [slot("7:00", "12:00", "kt_hall", [[150, 330], [210, 330]], {act: "sit"}), slot("12:00", "13:00", "kt_temple", [[300, 260], [200, 420], [350, 250]]), slot("13:00", "20:00", "kt_hall", [[150, 330], [210, 330]], {act: "sit"})],
    lines: ["Breathe in. Breathe out. That's it. That's the whole secret. Don't tell anyone.", "The garden is raked every morning. It never stays perfect. That's the lesson.", "Ring the bell gently. It's very old and very loud.", "I laugh a lot for a monk. My teacher says it's my practice."],
    away: "Jōshin is at evening prayers. The bell will ring soon."
  },
  {
    id: "tanaka", local: "kyoto", pitch: 0.7, name: "Mr Tanaka", job: "Makes wagashi, the fourth generation",
    intro: "Tanaka. My great-grandfather opened this shop. Every sweet is a season. Today's is a maple leaf. Tomorrow? We'll see.",
    look: {skin: "#E2B590", hair: "#B9B0A4", hairStyle: "short", top: "#FFFDF6", bottom: "#3A3430", extra: "apron"},
    routine: [slot("8:30", "18:30", "kt_sweets", [390, 262], {dir: -1})],
    lines: ["White bean paste, a little sugar, warm hands. That's all.", "A sweet should look like the weather outside the window.", "My father's hands were faster. Mine are more patient.", "Please, try. It's only sugar. It forgives."],
    away: "Mr Tanaka has closed the shop for the day. The shutters have a little drawing of a camellia."
  },
  {
    id: "fumiko", local: "kyoto", pitch: 1.1, name: "Fumiko", job: "Sells pickles at the covered market",
    intro: "Fumiko! Pickles for forty years. Try this one. And this one. You're too thin, try three.",
    look: {skin: "#E2B590", hair: "#3A3430", hairStyle: "curly", top: "#C8432F", bottom: "#3A3430", extra: "apron"},
    routine: [slot("8:00", "17:00", "kt_market", [80, 320], {dir: 1})],
    lines: ["Purple ones are shiso. Yellow ones are radish. Green ones are a mystery even to me.", "Everybody in this market knows everybody's business. It's very efficient.", "Tofu man, knife man, tea lady, me. We've been neighbours longer than some marriages.", "Ahh, the little boy! A rice cracker for him."],
    away: "Fumiko's stall is covered with a cloth. A sign says: back tomorrow, with more pickles."
  },
  {
    id: "ishida", local: "kyoto", pitch: 0.8, name: "Ishida", job: "A potter on the lane",
    intro: "Ishida. Potter. Clay is honest: if you rush it, it tells you.",
    look: {skin: "#D9A47E", hair: "#2A211D", hairStyle: "short", top: "#5E6670", bottom: "#4A4440", extra: "apron"},
    routine: [slot("9:00", "18:00", "kt_pottery", [[360, 300], [300, 420]], {act: "repair"})],
    lines: ["The kiln decides the colour. I only suggest.", "A cup with a little crack mended in gold is more beautiful than a perfect one.", "Your father has strong hands. Too strong. Gently!", "Wonky is fine. Wonky has character."],
    away: "Ishida is firing the kiln tonight. It's too hot to go in."
  },
  {
    id: "mori", local: "kyoto", pitch: 0.65, name: "Mr Mori", job: "Plays Go under the maples",
    intro: "Mori. I play Go here every day. Forty years. I win most days. Not always against myself.",
    look: {skin: "#D9A47E", hair: "#E8E4DE", hairStyle: "short", top: "#3E5E7A", bottom: "#4A4440", hat: "cap"},
    routine: [slot("9:30", "17:30", "kt_temple", [330, 470], {act: "sit", dir: -1})],
    lines: ["Black stone, white stone. The whole world on one board.", "Your grandfather plays like a river. Very patient. Then suddenly, flood.", "Sit, watch. You'll learn more watching than playing.", "Again tomorrow? Good. Bring your grandfather."],
    away: "Mr Mori's gone home for supper. The Go board waits under its cloth."
  },
  {
    id: "kato", local: "kyoto", pitch: 0.75, name: "Mr Kato", job: "Station attendant",
    intro: "Kato. Station attendant, thirty-one years. The trams are never late. If they are, it's my fault, so they aren't.",
    look: {skin: "#E2B590", hair: "#3A3430", hairStyle: "short", top: "#3E5E7A", bottom: "#2F3A55", hat: "cap"},
    routine: [slot("7:00", "13:00", "kt_station", [[350, 220], [300, 230]]), slot("14:00", "22:00", "kt_station", [[350, 220], [300, 230]])],
    lines: ["The bamboo grove is best early, before the crowds. And the last half-hour before dark.", "Your train home is the 10pm. I'll wave.", "Lost? Everyone is, the first day. That's the fun part.", "The little one likes the tram? Ding ding!"],
    away: "Mr Kato's on his lunch break, eating rice balls on the bench."
  },
  {
    id: "ren", local: "kyoto", pitch: 0.95, name: "Ren", job: "Pulls a rickshaw up and down the lane",
    intro: "Ren! Rickshaw, best legs in Kyoto. I know every story on this lane. Ask me anything.",
    look: {skin: "#C99470", hair: "#1E1A18", hairStyle: "spiky", top: "#2F2B28", bottom: "#2F2B28", extra: "satchel"},
    routine: [slot("9:00", "18:00", "kt_lane", [[262, 430], [300, 420]], {dir: -1})],
    lines: ["That pagoda's been rebuilt after fires, after storms. It always comes back.", "The tea house? Sachiko-san's. Best tea on the lane. Don't tell the others I said.", "Up this hill a thousand times a day. My calves have calves.", "Maple season! Everyone wants a photo. I'm in most of them."],
    away: "Ren's rickshaw is parked. He's off for noodles."
  },
  {
    id: "haru", local: "kyoto", pitch: 0.7, name: "Haru", job: "Rakes the temple's gravel garden",
    intro: "Haru. Every morning I rake the gravel into waves. Every afternoon, the wind and the cats undo it. Then again tomorrow.",
    look: {skin: "#D9A47E", hair: "#B9B0A4", hairStyle: "short", top: "#7E9A5A", bottom: "#5A4A3E", hat: "sunhat"},
    routine: [slot("8:00", "12:00", "kt_temple", [300, 446], {act: "farm", dir: 1}), slot("14:00", "17:00", "kt_temple", [[260, 260], [200, 430]])],
    lines: ["The three rocks are islands. The gravel is the sea. Don't step in the sea.", "Moss grows slowly. That's why it's beautiful.", "The koi know my footsteps. They think I'm lunch.", "Sit, look, don't think. That's the garden's job."],
    away: "Haru's resting under the eaves with a cup of tea."
  },
  ...[
    ["lena", "Lena", {skin: "#F6D9C4", hair: "#C98A4A", hairStyle: "long", top: "#9CC27E", bottom: "#3E5E7A", extra: "satchel"}, "Here from Berlin for the autumn leaves", "Lena, from Berlin! I came for the leaves. I've taken four hundred photos of one tree.",
      [slot("9:00", "11:00", "kt_market", [[240, 460], [320, 360], [180, 500]]), slot("11:00", "13:00", "kt_temple", [[300, 260], [260, 560], [200, 420]]), slot("13:00", "15:00", "kt_tea", [140, 300], {act: "sit"}), slot("15:00", "17:00", "kt_pottery", [[260, 460], [200, 520]]), slot("17:00", "19:00", "kt_lane", [[260, 300], [300, 540]])],
      ["Every corner here looks like a painting.", "I bought a tea bowl. I can't carry anything else now.", "The monk made me laugh during meditation. Is that allowed?"]],
    ["arjun", "Arjun", {skin: "#B9825E", hair: "#1E1A18", hairStyle: "short", top: "#F3ECDD", bottom: "#5A6A7A", extra: "satchel"}, "Backpacking round Japan", "Arjun! Two weeks in Japan, eleven cities, one very tired backpack.",
      [slot("9:30", "11:30", "kt_hall", [[300, 440], [200, 480]]), slot("11:30", "13:30", "kt_sweets", [[200, 480], [300, 520]]), slot("13:30", "15:30", "kt_river", [[200, 260], [330, 500]]), slot("15:30", "17:30", "kt_market", [[280, 460], [200, 360]]), slot("18:00", "20:00", "kt_lane", [[230, 300], [320, 520]])],
      ["I've eaten my weight in mochi. No regrets.", "The tram here is older than my grandad. And faster.", "Did you try the tea ceremony? My legs went to sleep."]],
    ["sophie", "Sophie", {skin: "#F6D9C4", hair: "#8A5A3A", hairStyle: "bob", top: "#E8566C", bottom: "#3A3430", hat: "sunhat"}, "On her honeymoon, from Bristol", "Sophie! From Bristol, on our honeymoon. My husband's lost. Again. Somewhere near a temple.",
      [slot("9:00", "11:00", "kt_station", [[230, 520], [420, 560], [300, 380]]), slot("11:00", "13:00", "kt_lane", [[250, 300], [320, 560]]), slot("13:00", "15:00", "kt_sweets", [[200, 480], [300, 540]]), slot("15:00", "17:30", "kt_river", [[180, 260], [340, 520]]), slot("17:30", "19:30", "kt_temple", [[260, 260], [200, 420]])],
      ["We wore yukata yesterday. I fell over twice. Worth it.", "Have you seen the turtle stones? I made it across! He didn't.", "Everything's so beautiful I keep forgetting to eat. Then I eat everything."]],
    ["mateus", "Mateus", {skin: "#C08B66", hair: "#2A211D", hairStyle: "curly", top: "#F3C969", bottom: "#3E5E7A", extra: "satchel"}, "From São Paulo, on a food trip", "Mateus, from São Paulo. I came for the food. I'm staying for the food. Also the food.",
      [slot("9:00", "11:30", "kt_market", [[300, 470], [200, 360], [260, 520]]), slot("11:30", "13:00", "kt_river", [[220, 230], [340, 270]]), slot("13:00", "15:00", "kt_station", [[260, 500], [400, 560]]), slot("15:00", "17:00", "kt_tea", [200, 300], {act: "sit"}), slot("17:00", "20:00", "kt_lane", [[300, 520], [230, 300]])],
      ["Grilled mochi on a stick. Life-changing. I'm not exaggerating.", "Fumiko gave me eleven pickles to try. ELEVEN.", "The tea was bitter, then sweet. Like a good story."]],
    ["chika", "Chika", {skin: "#EAC4A0", hair: "#3A2A22", hairStyle: "long", top: "#B9A8E0", bottom: "#F3ECDD"}, "Visiting from Osaka", "Chika, from Osaka! Kyoto's very polite. Osaka's very loud. I like both.",
      [slot("10:00", "12:00", "kt_temple", [[280, 270], [210, 430], [300, 560]]), slot("12:00", "14:00", "kt_lane", [[240, 320], [300, 460]]), slot("14:00", "16:00", "kt_hall", [[300, 470], [220, 520]]), slot("16:00", "18:00", "kt_station", [[250, 450], [380, 300]]), slot("18:00", "20:00", "kt_river", [[200, 270], [330, 500]])],
      ["In Osaka we'd say: 'Are you eating properly?' instead of hello.", "The fortune slips here are strict. I got 'small blessing'. Small!", "Try the yuzu. Then try it again in tofu. Trust me."]],
    ["jin", "Jin", {skin: "#EAC4A0", hair: "#1E1A18", hairStyle: "short", top: "#3A3430", bottom: "#5A6A7A", extra: "satchel"}, "A student from Seoul, sketching temples", "Jin. Architecture student, Seoul. I'm drawing every roof in Kyoto. Two hundred and six so far.",
      [slot("9:00", "11:00", "kt_lane", [[300, 260], [240, 520]]), slot("11:00", "13:00", "kt_pottery", [[240, 460], [300, 520]]), slot("13:00", "15:00", "kt_temple", [[320, 260], [220, 560]]), slot("15:00", "17:00", "kt_river", [[300, 260], [200, 500]]), slot("17:00", "19:00", "kt_station", [[220, 400], [300, 560]])],
      ["Look at the eaves. They curve up so the rain jumps off. Clever.", "No nails in that pagoda. Just joints. Like a puzzle.", "I'll be drawing roofs in my sleep tonight."]],
    ["tess", "Tess", {skin: "#8A5A3A", hair: "#1E1A18", hairStyle: "curly", top: "#9CC27E", bottom: "#F3ECDD", hat: "sunhat"}, "From Melbourne, travelling with her mum", "Tess! From Melbourne, here with my mum. She's bought six teapots. We have one suitcase.",
      [slot("9:30", "11:30", "kt_tea", [260, 300], {act: "sit"}), slot("11:30", "13:30", "kt_market", [[220, 470], [320, 520]]), slot("13:30", "15:30", "kt_lane", [[260, 540], [320, 300]]), slot("15:30", "17:30", "kt_temple", [[240, 400], [300, 560]]), slot("17:30", "19:30", "kt_river", [[180, 500], [320, 270]])],
      ["Mum's in the pottery buying a seventh teapot. Send help.", "The koi in the temple pond are bigger than my cat.", "I didn't think anywhere could be this quiet and this busy at once."]]
  ].map(([id, name, look, job, intro, routine, lines]) => ({id, local: "kyoto", tourist: true, pitch: .95 + (id.charCodeAt(0) % 4)*.07, name, job, intro, look, routine, lines, away: `${name}'s off seeing another bit of Kyoto.`})),
  // Round 129: Jeju's people (local: "jeju"). Halmang Kim is a diver (haenyeo), seventy-four, and Seo-yeon is learning
  // from her; Mr Ko grows tangerines; Ha-eun keeps the café in her grandmother's house; Mi-ok and Mrs Boo have stalls at
  // the market; Mr Moon dyes cloth with green persimmons; Captain Oh runs the ferry; Mr Kang mends nets by the harbour;
  // Mr Hyun keeps the station. And six tourists, so the rooms and the trail never feel empty.
  {
    id: "halmang", local: "jeju", pitch: 0.9, name: "Halmang Kim", job: "A haenyeo diver, seventy-four, diving since she was fifteen",
    intro: "Kim. Everyone calls me Halmang: grandma. Sixty years in the sea, and it still surprises me. You want to learn the breath song?",
    look: {skin: "#D9A57E", hair: "#B9B0A4", hairStyle: "curly", top: "#2F2B28", bottom: "#2F2B28"},
    routine: [slot("8:00", "12:00", "jj_shore", [[300, 250], [360, 250]], {dir: -1}), slot("12:00", "18:00", "jj_haenyeo", [250, 262], {act: "sit"})],
    lines: ["Breathe like the sea. In slowly, out slowly. Then dive.", "When we come up, we whistle. Fweee! So the others know we're alive.", "Never take the small ones. The sea is a field: you leave some for next year.", "My knees are old. Under the water, I'm twenty."],
    away: "Halmang's resting. Even the sea has a tide out."
  },
  {
    id: "seoyeon", local: "jeju", pitch: 1.12, name: "Seo-yeon", job: "Learning to dive from Halmang Kim",
    intro: "Seo-yeon! I was an accountant in Seoul. Now I'm the youngest diver in the village, by forty years. Halmang says I breathe too loud.",
    look: {skin: "#EAC4A0", hair: "#1E1A18", hairStyle: "long", top: "#3E7CC0", bottom: "#2F2B28"},
    routine: [slot("8:00", "12:00", "jj_shore", [[440, 300], [400, 280]]), slot("13:00", "17:00", "jj_haenyeo", [[380, 390], [300, 400]])],
    lines: ["Two minutes, I can hold my breath now. Halmang can do three. At seventy-four.", "There used to be thousands of divers here. Now there are a few hundred. I'm going to be one.", "The porridge is the best part. Don't tell Halmang I said that.", "Spreadsheets were safer. This is better."],
    away: "Seo-yeon's out practising in the shallows."
  },
  {
    id: "mrko", local: "jeju", pitch: 0.78, name: "Mr Ko", job: "Grows tangerines, the fourth generation",
    intro: "Ko. My great-grandfather planted the first trees here. The walls keep the wind off. The wind makes them sweet. You see? Everything helps.",
    look: {skin: "#C99A78", hair: "#3A3430", hairStyle: "short", top: "#5E8A48", bottom: "#5A4A3E", hat: "cap"},
    routine: [slot("8:00", "12:00", "jj_shed", [260, 326], {dir: 1}), slot("12:00", "14:00", "jj_farms", [[150, 300], [220, 330]]), slot("14:00", "18:00", "jj_shed", [260, 326], {dir: 1})],
    lines: ["Small ones are the sweetest. Everyone wants the big ones. Strange people.", "Hallabong, that's the one with the top-knot. Like a little hat.", "The trees don't care about you. Care about them anyway.", "Sort, sort, sort. December is a long month."],
    away: "Mr Ko's out in the orchard, talking to the trees."
  },
  {
    id: "haeun", local: "jeju", pitch: 1.08, name: "Ha-eun", job: "Runs the café in her grandmother's stone house",
    intro: "Welcome! I'm Ha-eun. This was my grandmother's house: she'd hate the coffee machine and love the view. Sit anywhere!",
    look: {skin: "#EAC4A0", hair: "#3A2A20", hairStyle: "bob", top: "#F3ECDD", bottom: "#5E7A8A", extra: "apron"},
    routine: [slot("9:00", "19:00", "jj_cafe", [300, 262], {dir: -1})],
    lines: ["The tangerine latte sounds strange. Trust me.", "My grandmother dried persimmons on that beam. I hang plants there now.", "Every table has the sea in the window. I made sure.", "Omija means five flavours. The sixth is the view."],
    away: "The café's closed. Ha-eun's walking the coast path."
  },
  {
    id: "miok", local: "jeju", pitch: 1.0, name: "Mi-ok", job: "Sells tangerines and sweets at the market",
    intro: "Mi-ok! Here, take a tangerine. Everybody gets one. That's the rule. My rule.",
    look: {skin: "#D9A57E", hair: "#2A211D", hairStyle: "curly", top: "#F29A2E", bottom: "#3A3430", extra: "apron"},
    routine: [slot("8:00", "18:00", "jj_market", [440, 316], {dir: -1})],
    lines: ["Tangerine chocolate! Tangerine jelly! Tangerine tangerines!", "You look tired. Have a tangerine.", "My husband grows them, I sell them, my son eats them. Family business.", "The hallabong are good this week. Feel how heavy."],
    away: "Mi-ok's stall is covered with a cloth. Back tomorrow!"
  },
  {
    id: "mrsboo", local: "jeju", pitch: 0.86, name: "Mrs Boo", job: "Sells omija and tea by the scoop",
    intro: "Boo. Omija, five flavours: sweet, sour, salty, bitter, spicy. Like life. One scoop or two?",
    look: {skin: "#C99A78", hair: "#D6D0C6", hairStyle: "bun", top: "#C8324A", bottom: "#5A4A3E"},
    routine: [slot("8:00", "17:00", "jj_market", [80, 446], {dir: 1})],
    lines: ["Omija tea in summer, cold. In winter, hot. All year, good.", "This green tea grew on the mountain. You can taste the clouds.", "Young people want everything sweet. Life isn't only sweet.", "Two scoops. You look like a two-scoop person."],
    away: "Mrs Boo's gone home for her nap."
  },
  {
    id: "jaewon", local: "jeju", pitch: 0.8, name: "Mr Moon", job: "Dyes cloth with green persimmons (galot)",
    intro: "Moon Jae-won. My hands? Persimmon juice. They've been orange for thirty years. The cloth starts green, and the sun finishes it.",
    look: {skin: "#C99A78", hair: "#3A3430", hairStyle: "short", top: "#B26A36", bottom: "#9E5A2E"},
    routine: [slot("9:00", "18:00", "jj_dye", [200, 412], {dir: 1})],
    lines: ["Galot doesn't hold dirt. Farmers loved it. Their wives loved it more.", "Three days of sun. Every day, a different colour.", "Crush, soak, wring, sun. That's all. That's everything.", "The green persimmons must be picked in August. Not before, not after."],
    away: "Mr Moon's turning the cloth out in the sun."
  },
  {
    id: "captoh", local: "jeju", pitch: 0.74, name: "Captain Oh", job: "Captains the ferry to Honeybrook",
    intro: "Oh. Captain Oh. I've crossed to Honeybrook four thousand times. I still look for the dolphins every time.",
    look: {skin: "#D9A57E", hair: "#3A3430", hairStyle: "short", top: "#FFFDF6", bottom: "#2E3A5A", hat: "cap"},
    routine: [slot("7:00", "22:00", "jj_harbour", [[240, 420], [260, 440]])],
    lines: ["The last ferry's at ten. I don't wait. Well. I wait a bit.", "The horse lighthouses: red on the left coming in, white on the right.", "Squid boats go out at dusk. All those lights on the sea: like a city.", "Calm crossing today. Tell the little one to look for dolphins."],
    away: "Captain Oh's ferry is out on the water."
  },
  {
    id: "mrkang", local: "jeju", pitch: 0.7, name: "Mr Kang", job: "Mends fishing nets by the harbour",
    intro: "Kang. Nets. Fifty years of nets. Sit, if you like. The gulls will keep you company.",
    look: {skin: "#C99A78", hair: "#D6D0C6", hairStyle: "short", top: "#5E7A8A", bottom: "#5A4A3E", hat: "cap"},
    routine: [slot("9:00", "17:00", "jj_harbour", [300, 480], {act: "nets", dir: 1})],
    lines: ["A net with a hole catches nothing. A man with a hole in his day catches up.", "Your grandfather? He mends a good knot. Tell him to come back.", "Squid tonight. You can smell it in the wind.", "Pass me that needle. Thank you."],
    away: "Mr Kang's gone for lunch: grilled mackerel, every day."
  },
  {
    id: "mrhyun", local: "jeju", pitch: 0.82, name: "Mr Hyun", job: "Keeps Jeju station",
    intro: "Hyun, stationmaster! The sea bridge is the longest in the country. I check every train across it myself. Well. I wave at them.",
    look: {skin: "#EAC4A0", hair: "#3A3430", hairStyle: "short", top: "#3E7CC0", bottom: "#2F2B28", hat: "cap"},
    routine: [slot("7:00", "22:00", "jj_village", [[440, 584], [380, 584]])],
    lines: ["Last train to Honeybrook at ten. Not one minute after.", "On a clear day you can see Hallasan from the platform. Today: clouds. Tomorrow: maybe.", "The stone grandfathers watch the station too. Very reliable.", "Tangerine? Mi-ok gave me forty."],
    away: "Mr Hyun's in the ticket office with the kettle on."
  },
  ...[
    ["jiho", "Ji-ho", {skin: "#EAC4A0", hair: "#1E1A18", hairStyle: "short", top: "#FFFDF6", bottom: "#3E5E7A"}, "On honeymoon from Seoul", "Ji-ho! From Seoul, on our honeymoon. Everyone comes to Jeju on honeymoon. My parents did. Their parents did.",
      [slot("9:00", "11:00", "jj_shore", [[260, 320], [420, 460]]), slot("11:00", "13:00", "jj_cafe", [380, 520], {act: "sit"}), slot("13:00", "15:00", "jj_farms", [[262, 360], [300, 520]]), slot("15:00", "17:00", "jj_market", [[220, 470], [320, 520]]), slot("17:00", "19:00", "jj_village", [[240, 320], [300, 420]])],
      ["My wife wants a photo with every stone grandfather on the island. There are forty-five.", "We climbed the crater for the sunrise. It was cloudy. Worth it.", "Have you tried the black pork? Twice? Good."]],
    ["minji", "Min-ji", {skin: "#F2D3BC", hair: "#2A211D", hairStyle: "long", top: "#F2A0B8", bottom: "#FFFDF6", hat: "sunhat"}, "On honeymoon from Seoul", "Min-ji! We're on honeymoon. Ji-ho's carrying all the tangerines. That's marriage.",
      [slot("9:00", "11:00", "jj_shore", [[280, 330], [440, 470]]), slot("11:00", "13:00", "jj_cafe", [420, 520], {act: "sit"}), slot("13:00", "15:00", "jj_farms", [[282, 370], [320, 520]]), slot("15:00", "17:00", "jj_dye", [[300, 460], [360, 520]]), slot("17:00", "19:00", "jj_village", [[260, 330], [320, 430]])],
      ["I want a persimmon dress. Mr Moon says three days. We fly home tomorrow!", "The divers are so strong. I want to be like that at seventy.", "Everything here is orange. My new favourite colour."]],
    ["takeshi", "Takeshi", {skin: "#EAC4A0", hair: "#1E1A18", hairStyle: "short", top: "#E8B13A", bottom: "#2F2B28", hat: "helmet"}, "Cycling round the whole island", "Takeshi, from Osaka! I'm cycling round the island. Two hundred and thirty kilometres. Day three. My legs have opinions.",
      [slot("9:00", "11:00", "jj_harbour", [[300, 300], [420, 480]]), slot("11:00", "13:00", "jj_market", [[300, 520], [200, 480]]), slot("13:00", "15:00", "jj_shed", [[200, 540], [320, 540]]), slot("15:00", "17:00", "jj_shore", [[420, 340], [300, 520]]), slot("17:00", "19:00", "jj_cafe", [110, 516], {act: "sit"})],
      ["The coast road has a stamp booth every twenty kilometres. I've got eleven.", "Headwind. Always headwind. How is it headwind both ways?", "Tangerine juice is a sports drink. I've decided."]],
    ["bronwyn", "Bronwyn", {skin: "#F6D9C4", hair: "#C9A06A", hairStyle: "bob", top: "#5E8A48", bottom: "#8A6A52", extra: "satchel", hat: "sunhat"}, "Walking the Olle trail, from Brisbane", "Bronwyn, from Brisbane! I'm walking the Olle trail: follow the blue and orange ribbons. Twenty-seven routes. I'm on route seven. Ish.",
      [slot("8:30", "10:30", "jj_farms", [[262, 300], [300, 460]]), slot("10:30", "12:30", "jj_shed", [[140, 520], [380, 530]]), slot("12:30", "14:30", "jj_haenyeo", [[200, 540], [320, 560]]), slot("14:30", "16:30", "jj_shore", [[260, 300], [440, 440]]), slot("16:30", "18:30", "jj_dye", [[240, 480], [340, 470]])],
      ["Follow the ribbons. Blue goes forward, orange goes back. Or the other way. Look, I'm here, aren't I.", "Mr Ko let me sort tangerines. He said I'm 'acceptable'. Highest praise.", "The divers whistled at me. I whistled back. Now we're friends."]],
    ["lukas", "Lukas", {skin: "#F6D9C4", hair: "#8A5A3A", hairStyle: "short", top: "#3E5E7A", bottom: "#5A4A3E", extra: "satchel", hat: "glasses"}, "A geology student from Munich", "Lukas, from Munich. I'm studying the crater. It's a tuff cone, from an eruption under the sea. Sorry. I get excited.",
      [slot("8:30", "11:00", "jj_shore", [[230, 260], [180, 300]]), slot("11:00", "13:00", "jj_market", [[260, 520], [200, 400]]), slot("13:00", "15:00", "jj_village", [[230, 260], [300, 300]]), slot("15:00", "17:00", "jj_cafe", [430, 376], {act: "sit"}), slot("17:00", "19:00", "jj_harbour", [[300, 260], [400, 400]])],
      ["Every black stone here was once lava. Every single one. Even the grandfathers.", "The walls have gaps on purpose: the wind goes through, the walls stay up.", "I've taken eight hundred photos of rocks. My mother is worried."]],
    ["meili", "Mei-li", {skin: "#F2D3BC", hair: "#1E1A18", hairStyle: "bobfringe", top: "#F3D34A", bottom: "#5E7A8A"}, "On holiday with her family, from Taipei", "Mei-li! From Taipei, with my parents and my little brother. He's somewhere. Probably eating.",
      [slot("9:30", "11:30", "jj_village", [[220, 400], [300, 480]]), slot("11:30", "13:30", "jj_dye", [[240, 460], [320, 520]]), slot("13:30", "15:30", "jj_market", [[220, 480], [300, 540]]), slot("15:30", "17:30", "jj_haenyeo", [[150, 540], [300, 560]]), slot("17:30", "19:30", "jj_farms", [[262, 420], [300, 540]])],
      ["My brother rode a pony and now he wants one. We live in a flat.", "I dyed a scarf! It's green. Mr Moon says it'll be brown. I'm confused.", "The porridge at the divers' house is green too. Everything's green and orange here."]]
  ].map(([id, name, look, job, intro, routine, lines]) => ({id, local: "jeju", tourist: true, pitch: .95 + (id.charCodeAt(0) % 4)*.07, name, job, intro, look, routine, lines, away: `${name}'s off seeing another bit of Jeju.`})),
  // cabin, and fishes the pool on Saturday evenings
  {
    id: "wren", pitch: 1.05, name: "Wren", job: "Honeybrook Woods' ranger",
    intro: "Wren, the ranger. I look after the woods: the trails, the waterfall, the foraging patch. If it grows up here, I know about it.",
    look: {skin: "#E6B892", hair: "#8A5A3A", hairStyle: "short", top: "#5E8A5A", bottom: "#6B5A44", extra: "satchel", hat: "cap"},
    routine: [slot("7:30", "8:00", "lane", [[262, 600], [262, 420], [330, 160]], {look: BIKE}), slot("17:00", "18:30", "hwoods", [214, 266], {act: "fish", dow: [6], dir: 1}),
      slot("8:00", "12:00", "hwoods", WOODS_WALK), slot("12:00", "13:00", "hwoods", [414, 300], {act: "sit"}), slot("13:00", "17:00", "hwoods", WOODS_WALK)],
    lines: ["Stay on the trails and the woods stay wild.", "The waterfall's loud today. All that rain up the hill.", "Mushrooms: if you're not sure, don't. Ask me.", "Kingfisher by the pool this morning. Blink and you miss it.", "Bikes are a lovely way up here. Mind the roots."],
    actLines: {fish: ["Shh. Trout.", "Catch and release, mostly. Mostly."]},
    away: "Wren's off duty. The noticeboard at the cabin has everything."
  },
  {
    id: "pilar", pitch: 0.95, name: "Pilar", job: "Cooks in the wine shop kitchen",
    intro: "Pilar! I cook. You keep the larder full, I keep the oven warm, the cheese pressing and the tapas coming. Deal?",
    look: {skin: "#C68E68", hair: "#3A2A22", hairStyle: "bun", top: "#F6EFE3", bottom: "#4A5568", extra: "apron"},
    routine: [slot("10:00", "14:30", "kitchen", [[150, 320], [380, 320], [262, 520], [150, 540]], {act: "cook"}), slot("14:30", "16:00", "wineshop", [453, 512], {act: "sit"}),
      slot("16:00", "21:30", "kitchen", [[150, 320], [380, 320], [262, 520], [150, 540]], {act: "cook"})],
    lines: ["Full larder, happy cook.", "Taste this. No, really, taste it.", "The oven's my favourite colleague.", "Bring me tomatoes and I'll bring you bravas."],
    actLines: {cook: ["Stirring, tasting, stirring.", "Bread's in. Don't open the door!", "The cheese is coming along nicely.", "If the larder's empty, I just tidy. Hint, hint."]},
    away: "Pilar's gone home. The kitchen's all yours."
  },
  // The Scoop Shack's staff: Sofia on the counter every day it's open (lunch on the deck), Tomo serving out on the
  // shop floor and the deck every day 10 to 6 (and doing the deliveries once there's a bike; scoop.js waiterOn)
  {
    id: "sofia", pitch: 1.2, name: "Sofia", job: "Runs the counter at the Scoop Shack",
    intro: "Ciao, I'm Sofia! I scoop, I chat, I tell everyone the new flavour is the best one. Because it is.",
    look: {skin: "#E8C4A0", hair: "#3A2A22", hairStyle: "bun", top: "#F4C7CF", bottom: "#3F4A6B", extra: "apron"},
    routine: [slot("9:45", "14:00", "scoopshop", [300, 268]), slot("14:00", "14:30", "bay", [196, 360], {act: "sit"}), slot("14:30", "20:15", "scoopshop", [300, 268])],
    lines: ["Cup or cone? Trick question: both.", "The deck's lovely this time of day.", "Someone ordered four scoops before lunch. Respect.", "Tomo's run off his feet on the deck. Bless him."],
    hellos: ["Hi Mel! What'll it be?", "Ciao, boss!", "The new flavour's flying out!"],
    away: "Sofia's finished for the day. The counter's closed."
  },
  {
    id: "tomo", pitch: 0.8, name: "Tomo", job: "Serves on the deck and in the Scoop Shack (and does the deliveries)",
    intro: "Tomo. I carry the cones to the tables, I wipe the tables, I chat. Give me a bike and I'll deliver too.",
    look: {skin: "#D9A882", hair: "#1F1A17", hairStyle: "short", top: "#FFFDF6", bottom: "#5E5A55", extra: "apron"},
    routine: [slot("10:00", "11:30", "scoopshop", [[200, 440], [380, 450], [140, 560], [300, 560]], {act: "cone"}), slot("11:30", "13:00", "bay", [[150, 440], [230, 440], [200, 312], [262, 380]], {act: "cone"}),
      slot("13:00", "13:45", "bay", [222, 352], {act: "sit"}), slot("13:45", "15:30", "scoopshop", [[200, 440], [380, 450], [140, 560], [300, 560]], {act: "cone"}),
      slot("15:30", "18:00", "bay", [[150, 440], [230, 440], [200, 312], [262, 380]], {act: "cone"})],
    lines: ["Table four wants another round. Table four always wants another round.", "Best view in the village, this deck.", "Napkins! Who needs napkins?", "I dream in pistachio."],
    actLines: {cone: ["Two cones for the deck, coming through!", "Mind the drips!", "Anyone for a waffle?", "Enjoy! Don't let the gulls see."]},
    away: "Tomo's off for the day."
  },
  // Mel's family on the foreshore (west of the field): Mum and Dad in one house, her brother Marcus and his fiancee
  // Angellina in the other. All four help Ma Ma and Gong Gong in the orchard now and then, and walk about town.
  // Mum: always off to an exercise class (she leads one at the field most mornings, see classSlot in tours.js) or
  // volunteering. Dad: music (piano, double bass) and drawing (the easel, sketching on the sand).
  {
    id: "mum", pitch: 1.05, name: "Mum", job: "Mel's mum: exercise classes and volunteering",
    intro: "Hello darling! Can't stop long, I'm going for my Pilates. Have you eaten? There's food at home, take some!", hellos: ["Hello darling! Have you eaten?", "Darling! Off to my Zumba, see you!"],
    look: {skin: "#E8C3A2", hair: "#1E1A18", hairStyle: "bobfringe", top: "#E8566C", bottom: "#2F2B28"},
    routine: [slot("13:00", "15:00", "hwoods", WOODS_WALK, {dow: [3]}), slot("15:00", "16:30", "vineyard", VINE_WALK, {dow: [4]}),
      slot("15:00", "17:00", "base", [[230, 360], [300, 590], [160, 520]], {dow: [0]}),
      slot("8:00", "13:00", "field", [[120, 200], [220, 196], [320, 200], [130, 470]], {dow: [0]}),
      slot("6:45", "7:45", "shore", SHORE_WALK),
      slot("9:00", "11:00", "fresh", [[200, 330], [300, 420], [160, 450]], {dow: [1, 3]}),
      slot("9:00", "11:00", "orchard", [[160, 330], [260, 420], [360, 510], [210, 500]], {dow: [2, 4], act: "water"}),
      slot("9:00", "11:00", "hall", [[200, 320], [330, 320]], {dow: [5]}),
      slot("9:30", "11:30", "village", [[200, 420], [300, 440], [250, 520]], {dow: [6]}),
      slot("11:00", "13:00", "mumdad", [270, 476], {act: "sit"}),
      slot("13:00", "15:00", "flowers", [[160, 300], [260, 380], [360, 470]], {dow: [1, 2, 3, 4, 5], act: "farm"}),
      slot("15:00", "17:00", "village", [[220, 430], [290, 450], [260, 520], [330, 400]], {dow: [1, 2, 3, 4, 5, 6]}),
      slot("17:00", "18:00", "mumdad", [104, 404], {act: "exercise"}),
      slot("18:00", "22:50", "mumdad", [270, 476], {act: "sit"}), slot("22:50", "23:00", "mumdad", [454, 352])],
    lines: ["I'm going for my Pilates! Back in an hour.", "Going for Zumba later, want to come?", "Piloxing tonight. It's pilates AND boxing, very good for the arms.", "Volunteering at the library this morning. The children love the stories.",
      "Have you eaten? Take some food home for Evan.", "Drink more water, darling.", "Your dad is playing that same song again.", "Come to my class! First one's free. They're all free, actually."],
    actLines: {lead: ["And stretch! Two, three, four!", "Big smiles, everybody!", "Keep going, nearly there!"], exercise: ["Just my stretches. Don't mind me.", "Core, darling. It's all about the core."],
      water: ["Helping Ma Ma. She says I'm too slow.", "Watering for Ma Ma. Good for the arms too!"], farm: ["Ma Ma's flowers are so beautiful this year.", "Weeding is basically a workout."]},
    away: "Mum's out. Probably at an exercise class.",
    react: {quests3: "Three done already? That's my girl!", lunch: "Lunch! Eat properly, ok?", harvest: "So much! You must bring some to Ma Ma."}
  },
  {
    id: "dad", pitch: 0.72, name: "Dad", job: "Mel's dad: music and drawing",
    intro: "Hi darling! Love you, have a good day. Oh, and come listen to this. I've been working on it all week.", hellos: ["Hi darling! Love you, have a good day.", "Hi darling, love you!", "Hi darling! Have a good day, ok?"],
    look: {skin: "#E6BC98", hair: "#141110", hairStyle: "short", top: "#5B7DB1", bottom: "#8C8F7A", shorts: true, specs: "#141110"},
    routine: [slot("7:00", "9:00", "shore", [140, 468], {act: "fish", dow: [6], dir: -1}), slot("9:00", "11:00", "field", MARKET_WALK, {dow: [0]}), slot("11:00", "12:30", "lane", LANE, {dow: [2]}), slot("15:00", "16:30", "vineyard", VINE_WALK, {dow: [6]}), slot("17:30", "18:30", "field", [170, 384], {dow: [3], act: "type"}),
      slot("15:00", "17:00", "base", [[250, 360], [320, 590], [180, 520]], {dow: [0]}),
      slot("7:00", "9:00", "shore", [212, 372], {act: "type", dir: -1}),
      slot("9:00", "11:00", "mumdad", [112, 292], {act: "type"}),
      slot("11:00", "12:30", "village", [[230, 420], [300, 470], [190, 520], [340, 420]]),
      slot("12:30", "13:30", "mumdad", [330, 476], {act: "sit"}),
      slot("13:30", "15:30", "orchard", [[160, 420], [260, 510], [360, 420], [210, 330]], {dow: [1, 3, 5], act: "farm"}),
      slot("13:30", "15:30", "mumdad", [262, 300], {act: "type"}),
      slot("15:30", "17:30", "mumdad", [446, 362], {act: "type", dir: -1}),
      slot("17:30", "19:00", "shore", SHORE_WALK),
      slot("19:00", "22:50", "mumdad", [112, 292], {act: "type", dow: [0, 2, 4, 6]}),
      slot("19:00", "22:50", "mumdad", [262, 300], {act: "type"}), slot("22:50", "23:00", "mumdad", [434, 360])],
    lines: ["Hi darling, love you, have a good day.", "Listen to this bit. No, wait, listen.", "Ah Gong loves who the most? Evan knows.", "I drew the dolphins this morning. They wouldn't sit still.", "Music is good for the soul. And the brain.", "Have you heard of this band? No? Let me play it for you.",
      "I'm sketching Evan next time he visits. He has to sit still for ten minutes. We'll see.", "Your mum's at Zumba. Or Pilates. One of those.", "Proud of you, you know."],
    actLines: {type: ["*plays a little jazz*", "This bar is tricky. Again.", "Just shading the clouds. Nearly done.", "*hums along*"], farm: ["Helping your Ma Ma. She's the boss.", "Gong Gong and I are on soil duty."]},
    away: "Dad's out. Maybe drawing by the water.",
    react: {quests3: "Three already? Clever girl.", lunch: "Have you had lunch? Don't skip."}
  },
  // Marcus, Mel's brother: a banker (he covers Opal's counter at the village bank on Mondays, Wednesdays and Fridays,
  // and works in the city on Tuesdays and Thursdays); loves games. Angellina, his fiancee, is studying for her master's
  // in psychology (the library in the mornings, her desk at home after lunch). Weekend afternoons they paddleboard.
  {
    id: "marcus", pitch: 0.7, name: "Marcus", job: "Mel's brother, a banker",
    intro: "Zeh! Want a game later? I'll go easy on you. Probably.", hellos: ["Zeh!", "Oi, Zeh!", "Hey Zeh. Eaten yet?"],
    look: {skin: "#E6BC98", hair: "#1A1716", hairStyle: "short", top: "#3E4A5C", bottom: "#2F3A4A", specs: "#C0C4CC", tall: true},
    routine: [slot("7:30", "9:30", "hwoods", WOODS_RIDE, {dow: [0], look: BIKE}), slot("10:00", "12:00", "field", MARKET_WALK, {dow: [0]}), slot("17:30", "19:00", "vineyard", VINE_WALK, {dow: [5]}), slot("13:00", "14:00", "lane", LANE, {dow: [6]}),
      slot("8:30", "9:00", "shore", SHORE_WALK, {days: "wd"}),
      slot("12:30", "13:30", "bank", [260, 500], {dow: [1, 3, 5], look: BANKER}),
      slot("9:00", "17:30", "bank", [404, 500], {dow: [1, 3, 5], look: BANKER}),
      slot("17:30", "19:00", "shore", SHORE_WALK, {days: "wd"}),
      slot("19:00", "22:50", "marcus", [90, 428], {act: "game"}), slot("22:50", "23:00", "marcus", [454, 362]),
      slot("9:00", "11:00", "orchard", [[160, 330], [260, 420], [360, 510], [210, 500]], {days: "we", act: "farm"}),
      slot("11:00", "13:00", "village", [[220, 430], [290, 450], [260, 520]], {days: "we"}),
      slot("13:00", "16:00", "marcus", [90, 428], {act: "game", days: "we"}),
      slot("16:00", "17:00", "shore", SEA, {days: "we", act: "sup", free: true}),
      slot("17:00", "19:00", "shore", SHORE_WALK, {days: "we"})],
    lines: ["One more game. Then I'll sleep. Probably.", "Need a hand with your jars? Compound interest, Zeh.", "Angellina's studying, so I'm being very quiet.", "Paddleboarding this weekend, Zeh? Bring Evan!", "Date night at the wine shop on Tuesday. Don't tell Mum we skipped her Zumba.", "Evan wants Spiderman again. I've created a monster.",
      "Mum's at Zumba again.", "Dad played the same song four times today. Four.", "Banker tip, Zeh: pay yourself first. You're welcome."],
    actLines: {game: ["Shh, boss fight.", "Nearly beat this level.", "Okay one more round."], farm: ["Ma Ma says I'm doing it wrong. I'm doing it great.", "Gong Gong's supervising. From the shade."], sup: ["Don't splash! Don't splash!", "Dolphin! Over there!"]},
    away: "Marcus is at work in the city.",
    react: {quests3: "Three done? Okay, overachiever.", lunch: "Lunch break! Even bankers eat."}
  },
  {
    id: "angelina", pitch: 1.15, name: "Angellina", job: "Studying for her master's in psychology",
    intro: "Hi Mel! Sorry, I'm in exam mode. Ask me anything about attachment theory. Actually don't.",
    look: {skin: "#F0D0B4", hair: "#3A2A22", hairStyle: "long", top: "#C9A3E0", bottom: "#F0D0B4", dress: "#C9A3E0"},
    routine: [slot("8:00", "9:00", "bay", [[180, 420], [240, 430]], {dow: [6]}), slot("10:00", "12:00", "field", MARKET_WALK, {dow: [0]}), slot("17:30", "19:00", "vineyard", VINE_WALK, {dow: [5]}), slot("12:00", "13:00", "lane", LANE, {dow: [3]}),
      slot("9:00", "12:00", "fresh", [420, 300], {days: "wd", act: "type"}),
      slot("12:00", "13:00", "village", [[220, 430], [290, 450], [260, 520]], {days: "wd"}),
      slot("13:00", "16:30", "marcus", [322, 302], {days: "wd", act: "type"}),
      slot("16:30", "17:30", "flowers", [[160, 300], [260, 380], [360, 470]], {days: "wd", act: "water"}),
      slot("17:30", "19:00", "shore", SHORE_WALK, {days: "wd"}),
      slot("9:00", "11:00", "flowers", [[160, 300], [260, 380], [360, 470]], {days: "we", act: "water"}),
      slot("11:00", "13:00", "village", [[220, 430], [290, 450], [260, 520]], {days: "we"}),
      slot("13:00", "16:00", "marcus", [322, 302], {days: "we", act: "type"}),
      slot("16:00", "17:00", "shore", SEA, {days: "we", act: "sup", free: true}),
      slot("17:00", "19:00", "shore", SHORE_WALK, {days: "we"}),
      slot("19:00", "22:50", "marcus", [132, 428], {act: "sit"}), slot("22:50", "23:00", "marcus", [434, 370])],
    lines: ["Did you know naming a feeling makes it smaller? It's true. I read it last night.", "Three more chapters. Then a break. Then three more chapters.", "Marcus says he's 'helping'. He's playing games.",
      "How are you, really? Not the polite answer.", "The library's so quiet in the mornings. Perfect for studying.", "Your mum invited me to Zumba again. I'm scared.", "Marcus booked us a table at your wine shop. Very romantic. He's had two cheese boards.", "Evan made me watch Mario jump for twenty minutes. Fascinating, honestly."],
    actLines: {type: ["Highlighting everything. That's how studying works, right?", "Footnotes. So many footnotes.", "Nearly done this essay."], water: ["Helping Mei with the flowers. Good study break.", "Plants are very calming. That's actual research."], sup: ["I'm standing! I'm standing!", "Look, a dolphin!"]},
    away: "Angellina's studying somewhere quiet.",
    react: {quests3: "Three already? That's real momentum.", lunch: "Brain food time!"}
  }
];

// Agent NPCs: one per automation. `from` on a mail item picks the messenger (unknown -> postie).
export const AGENTS = {
  crier:    {name: "Rosa the town crier", skill: "morning-briefing", look: {skin: "#EDC6A6", hair: "#8A3B2A", hairStyle: "bun", top: "#C2505F", bottom: "#3A2E28", extra: "bell"}, hello: "Hear ye! Your morning briefing!", helloTown: "Hear ye! Your paper's still in your letterbox, so I've brought the news to town!"},
  runner:   {name: "Kip, the library runner", skill: "book-digest", look: {skin: "#D8A882", hair: "#2A211D", hairStyle: "spiky", top: "#7C9F6C", bottom: "#5E5A55", extra: "satchel"}, hello: "Today's book digest, hot off the shelf!"},
  postie:   {name: "Penny the postie", skill: "inbox-triage", look: {skin: "#F2D3BC", hair: "#B5562E", hairStyle: "bob", top: "#6E9FD6", bottom: "#2F3B73", extra: "cap"}, hello: "Post! Your inbox, sorted."},
  chord:    {name: "Cora from Chord", skill: "Chord agent", look: {skin: "#E6BC98", hair: "#3B2A1E", hairStyle: "bun", top: "#B9D2A6", bottom: "#4F6B8A", extra: "satchel"}, hello: "News from the Chord workshop!"},
  chico:    {name: "Coco from Chico", skill: "Chico agent", look: {skin: "#C99A78", hair: "#1F1A17", hairStyle: "bob", top: "#F4C7CF", bottom: "#7A6A8C", extra: "satchel"}, hello: "Chico update, fresh from the cottage!"},
  planner:  {name: "Wren the content planner", skill: "content planning", look: {skin: "#F0D0B4", hair: "#C9A27E", hairStyle: "long", top: "#F5C3A4", bottom: "#3F4A6B", extra: "satchel"}, hello: "Content plan's ready for your eyes!"},
  scout:    {name: "Fennel the tender scout", skill: "gebiz-opportunity-scout", look: {skin: "#E2B590", hair: "#5A3A2A", hairStyle: "short", top: "#BFD6E6", bottom: "#5E5A55", extra: "cap"}, hello: "Scouted some tenders for you!"},
  courier:  {name: "Basil the garden courier", skill: "sunsama-tidy / client-health-check", look: {skin: "#EBC9A8", hair: "#7C7570", hairStyle: "short", top: "#9EBE8C", bottom: "#8A6A52", extra: "satchel"}, hello: "A little tidy-up report!"},
  winddown: {name: "Luna the evening messenger", skill: "evening-wind-down", look: {skin: "#EDC6A6", hair: "#2B2320", hairStyle: "long", top: "#9AA9DD", bottom: "#2F3B73", extra: "lantern"}, hello: "Time to close the day. A note for you."}
};
