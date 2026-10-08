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
const slot = (from, to, scene, where, opts) => Object.assign({from: hm(from), to: hm(to), scene}, Array.isArray(where[0]) ? {wander: where} : {at: where}, opts || {});

export const NPCS = [
  {
    id: "hana", pitch: 1.15, name: "Hana", job: "Runs the market",
    intro: "Hi love, I'm Hana! I moved here from a little seaside town. The honey toast is mine, and yes, I remember everyone's usual.",
    look: {skin: "#F3D2B8", hair: "#5A3A2A", hairStyle: "bun", top: "#EFA3A6", bottom: "#7A6A8C", extra: "apron"},
    routine: [slot("19:30", "21:00", "wineshop", [227, 518], {act: "sit", dow: [0]}), slot("8:00", "12:00", "market", [260, 352]), slot("12:00", "13:00", "market", [[200, 352], [320, 352], [260, 352]]),
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
    routine: [slot("14:00", "15:00", "lane", LANE, {dow: [1, 3, 5]}),
      slot("19:30", "21:00", "wineshop", [313, 518], {act: "sit", dow: [1, 3, 4, 5]}), slot("7:30", "12:00", "village", [455, 512]), slot("12:00", "14:00", "village", [[226, 420], [170, 440], [236, 444]]), slot("14:00", "15:00", "trophy", [[200, 500], [320, 520], [250, 540]]), slot("15:00", "17:00", "village", [[226, 420], [170, 440], [236, 444]]), slot("17:00", "19:30", "village", [322, 566])],
    lines: ["Letters used to come in sacks. Now it's all on your little phone.", "The well water is sweeter in the afternoon. Don't ask me why.", "I've sorted the pebbles by colour. Then by size. Then by colour again.",
      "A tidy inbox is a tidy mind. Mine is a shoebox.", "The river's high today. Good for the ducks."],
    react: {inbox: "An email quest! Just like the old days. Stamp it and send it.", water: "Good, drink up. Forty years of walking taught me that.", quests3: "Steady work. That's the postmaster's way."}
  },
  {
    id: "juniper", pitch: 1.05, name: "Juniper", job: "Librarian at the Fresh Pages library",
    intro: "Welcome to the library! I'm Juniper. I love a good semicolon; I also write poetry, but that's a secret. One book recommendation a week, guaranteed.",
    look: {skin: "#C99A78", hair: "#2B2320", hairStyle: "bob", top: "#B9D2A6", bottom: "#3F4A6B", extra: "glasses"},
    routine: [slot("15:30", "16:30", "lane", LANE, {dow: [1, 2, 3, 4, 5]}),
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
    routine: [slot("12:30", "13:30", "lane", LANE, {dow: [2, 4]}),
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
    routine: [slot("18:00", "19:30", "wineshop", [367, 512], {act: "sit"}), slot("9:00", "12:30", "bank", [260, 500]), slot("12:30", "13:30", "village", [[300, 214], [262, 230]]), slot("13:30", "17:30", "bank", [260, 500])],
    lines: ["Every jewel counts. Even the little ones. Especially the little ones.", "Pay yourself first, then the rest. That's the banker's secret.", "I polished the sapphires this morning. Don't tell the rubies.",
      "Slow and steady fills a jar. Promise.", "A full jar is the prettiest thing in this town."],
    away: "Opal's on her lunch break. The vaults are always open to you.",
    react: {quests3: "Three quests done! That's a jewel's worth of effort."}
  },
  {
    id: "theo", pitch: 0.9, name: "Theo", job: "Town hall clerk",
    intro: "Theo, town clerk. I keep the village records. And, if you have a moment, I have a stamp collection you would not believe.",
    look: {skin: "#F0D0B4", hair: "#6B4A2E", hairStyle: "short", top: "#C3CDEE", bottom: "#3A3A48", extra: "tie"},
    routine: [slot("17:30", "19:00", "wineshop", [313, 518], {act: "sit"}), slot("9:00", "12:00", "hall", [[200, 320], [330, 320]]), slot("12:00", "13:00", "trophy", [228, 590], {act: "sit"}), slot("13:00", "17:00", "hall", [[200, 320], [330, 320]])],
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
    routine: [
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
  {
    id: "ines", pitch: 1.2, name: "Ines", job: "Vineyard hand",
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
    routine: [slot("11:00", "15:00", "wineshop", [372, 286]), slot("15:00", "15:30", "vineyard", [[300, 260], [440, 270], [360, 300]]), slot("15:30", "21:30", "wineshop", [372, 286])],
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
    routine: [slot("9:30", "11:30", "village", [[200, 420], [300, 440], [250, 520]], {dow: [6]}),
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
    routine: [slot("10:00", "12:00", "village", [[230, 420], [300, 470], [190, 520]], {dow: [1], look: OUT}),
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
    routine: [slot("8:00", "12:00", "flowers", [[160, 300], [260, 380], [360, 470], [210, 470], [310, 300]], {act: "water"}),
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
    routine: [slot("07:00", "12:00", "hfarm", [[186, 286], [310, 286], [300, 520]]), slot("12:00", "13:00", "hfarm", [60, 270], {act: "sit"}),
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
    routine: [slot("14:00", "18:00", "cocoakitchen", [[250, 330], [410, 330], [180, 500], [360, 500]], {dow: [3, 5], needs: "cocoa"}),
      slot("10:00", "17:00", "cocoakitchen", [[250, 330], [410, 330], [180, 500], [360, 500]], {dow: [6], needs: "cocoa"})],
    intro: "Hola! I'm Mateo. I study food science at the poly, and on Wednesdays, Fridays and Saturdays I keep the bars coming here. The bonbons are all yours, boss.",
    lines: ["Your bonbon shelf is full. I didn't touch a crumb!", "Exams next week. Tempering is very calming.", "My lecturer says I'm the only one who's ground beans by hand.", "The grinder's singing today.", "Forty dark bars on the wall. A personal best.", "I bought beans this morning. Don't worry, I kept to your budget."],
    hellos: ["Morning, boss! Roaster's warm.", "Hi Mel! Smell that?"], away: "Mateo's gone home. The kitchen's quiet."},
  // Lila, the Cocoa Room's second assistant (cocoa.js upgrade "assistant"): Mondays (Amara's day off) and weekend afternoons
  {id: "lila", pitch: 1.2, name: "Lila", job: "Serves at the Cocoa Room",
    look: {skin: "#F2D3BC", hair: "#B5562E", hairStyle: "bob", top: "#C2505F", bottom: "#F3E7C9", extra: "apron"},
    routine: [slot("10:45", "20:15", "cocoa", [240, 268], {dow: [1], needs: "cc_assistant"}), slot("13:00", "20:15", "cocoa", [[180, 420], [400, 440], [240, 268]], {dow: [0, 6], needs: "cc_assistant"})],
    intro: "Hi! I'm Lila. Mondays are mine, and I help Amara at weekends. I'm working my way through every bonbon. For research.",
    lines: ["Mondays are quiet, but the regulars are lovely.", "I wrapped forty boxes on Saturday. My fingers are ribbon now.", "Someone asked if we deliver to the moon.", "The fountain is hypnotic. I keep staring at it."],
    hellos: ["Hi Mel!", "Morning, boss!"], away: "Lila's not on today."},
  // Noor runs the pet adoption corner at the Sunday farmers market and the field fair (tours.js); no routine otherwise
  {id: "noor", pitch: 1.1, name: "Noor", job: "Finds homes for rescued pets", tourist: true, routine: [],
    look: {skin: "#C99A78", hair: "#2A211D", hairStyle: "long", top: "#9FD3C2", bottom: "#4A5568", extra: "apron"},
    intro: "Hi, I'm Noor! I find homes for little ones who need them. Kittens, puppies, bunnies... everyone deserves a cuddle.",
    lines: ["This one loves a chin scratch.", "Every pet that goes home, I cry a little. Happy tears.", "Ask me anything about looking after them!", "The duckling follows everyone. It thinks we're all its mum."],
    away: "Noor's taken the animals home for a rest."},
  ...[["noa", "Noa", {skin: "#F2D3BC", hair: "#D9B46A", hairStyle: "long", top: "#F28C6A", bottom: "#2F3B73"}],
    ["jun", "Jun", {skin: "#EAC4A4", hair: "#231C19", hairStyle: "short", top: "#3E6B8C", bottom: "#5E5A55", extra: "satchel"}],
    ["bea", "Bea", {skin: "#C99A78", hair: "#2A211D", hairStyle: "bun", top: "#F3C969", bottom: "#4A5568"}],
    ["omar", "Omar", {skin: "#A8754F", hair: "#1F1A17", hairStyle: "short", top: "#F6F2EA", bottom: "#3F4A6B", extra: "glasses"}],
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
    routine: [slot("15:00", "16:30", "vineyard", VINE_WALK, {dow: [4]}),
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
    routine: [slot("9:00", "11:00", "field", MARKET_WALK, {dow: [0]}), slot("11:00", "12:30", "lane", LANE, {dow: [2]}), slot("15:00", "16:30", "vineyard", VINE_WALK, {dow: [6]}), slot("17:30", "18:30", "field", [170, 384], {dow: [3], act: "type"}),
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
    routine: [slot("10:00", "12:00", "field", MARKET_WALK, {dow: [0]}), slot("17:30", "19:00", "vineyard", VINE_WALK, {dow: [5]}), slot("13:00", "14:00", "lane", LANE, {dow: [6]}),
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
    routine: [slot("10:00", "12:00", "field", MARKET_WALK, {dow: [0]}), slot("17:30", "19:00", "vineyard", VINE_WALK, {dow: [5]}), slot("12:00", "13:00", "lane", LANE, {dow: [3]}),
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
