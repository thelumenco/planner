// Village NPCs (light-touch neighbours) and agent NPCs (Mel's automations as messengers). All original characters.
//
// Town folk live in the town square ("village"); Darren stays at home base ("base", "home", "farm").
// Routine slots use Singapore minutes-since-midnight: {from, to, scene, at:[x,y]} stands still,
// {..., wander:[[x,y],...]} strolls between points. Outside every slot the NPC is off-screen (home, asleep).
// `react` lines fire once a day when their condition is true (see npcs.js REACTIONS).

const hm = s => { const [h, m] = s.split(":").map(Number); return h*60 + (m || 0); };
// opts: {days: "wd" | "we" (weekdays / weekends only), act: what they're doing (Darren's props + lines), dir: facing}
const slot = (from, to, scene, where, opts) => Object.assign({from: hm(from), to: hm(to), scene}, Array.isArray(where[0]) ? {wander: where} : {at: where}, opts || {});

export const NPCS = [
  {
    id: "hana", pitch: 1.15, name: "Hana", job: "Runs the market",
    intro: "Hi love, I'm Hana! I moved here from a little seaside town. The honey toast is mine, and yes, I remember everyone's usual.",
    look: {skin: "#F3D2B8", hair: "#5A3A2A", hairStyle: "bun", top: "#EFA3A6", bottom: "#7A6A8C", extra: "apron"},
    routine: [slot("19:30", "21:00", "wineshop", [227, 518], {act: "sit", days: "we"}), slot("8:00", "12:00", "market", [260, 352]), slot("12:00", "13:00", "market", [[200, 352], [320, 352], [260, 352]]),
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
    routine: [slot("19:30", "21:00", "wineshop", [313, 518], {act: "sit", days: "wd"}), slot("7:30", "12:00", "village", [455, 512]), slot("12:00", "14:00", "village", [[226, 420], [170, 440], [236, 444]]), slot("14:00", "15:00", "trophy", [[200, 500], [320, 520], [250, 540]]), slot("15:00", "17:00", "village", [[226, 420], [170, 440], [236, 444]]), slot("17:00", "19:30", "village", [322, 566])],
    lines: ["Letters used to come in sacks. Now it's all on your little phone.", "The well water is sweeter in the afternoon. Don't ask me why.", "I've sorted the pebbles by colour. Then by size. Then by colour again.",
      "A tidy inbox is a tidy mind. Mine is a shoebox.", "The river's high today. Good for the ducks."],
    react: {inbox: "An email quest! Just like the old days. Stamp it and send it.", water: "Good, drink up. Forty years of walking taught me that.", quests3: "Steady work. That's the postmaster's way."}
  },
  {
    id: "juniper", pitch: 1.05, name: "Juniper", job: "Librarian at the Fresh Pages library",
    intro: "Welcome to the library! I'm Juniper. I love a good semicolon; I also write poetry, but that's a secret. One book recommendation a week, guaranteed.",
    look: {skin: "#C99A78", hair: "#2B2320", hairStyle: "bob", top: "#B9D2A6", bottom: "#3F4A6B", extra: "glasses"},
    routine: [slot("18:30", "20:00", "wineshop", [453, 512], {act: "sit"}), slot("8:30", "13:00", "fresh", [[160, 300], [330, 300], [240, 330]]), slot("13:00", "15:30", "fresh", [356, 330]),
      slot("15:30", "16:00", "trophy", [292, 590], {act: "sit"}), slot("16:00", "18:00", "fresh", [[90, 330], [180, 330], [140, 312]])],
    lines: ["This week's pick: anything with a map in the front.", "A semicolon is a pause that believes in you.", "Shh… the nook is in reading hour. Join me?",
      "Every first draft is allowed to be terrible. That's the rule.", "I shelve by feeling, not by alphabet. Don't tell anyone."],
    react: {writing: "Ooh, a writing quest. Messy first, lovely later.", quests3: "Three chapters done today. Metaphorically."}
  },
  {
    id: "bo", pitch: 0.8, name: "Bo", job: "Carpenter at the Chord workshop",
    intro: "Bo! Carpenter. If it creaks, wobbles or falls off, I'm your guy. Built half this village. *hums*",
    look: {skin: "#E2B590", hair: "#3B2A1E", hairStyle: "short", top: "#E9C46A", bottom: "#4F6B8A", extra: "cap"},
    routine: [slot("18:30", "20:00", "wineshop", [227, 518], {act: "sit"}), slot("8:00", "12:30", "chord", [[150, 330], [210, 320], [120, 340]]), slot("12:30", "13:30", "village", [346, 566]),
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
    routine: [slot("16:30", "17:30", "vineyard", [[110, 604], [262, 600], [410, 608], [200, 586], [330, 590]]), slot("15:00", "18:30", "base", [[230, 350], [300, 380], [200, 420], [360, 580], [160, 560], [300, 600]])],
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
      slot("7:00", "8:30", "base", [190, 452], {days: "wd", act: "water", dir: -1}),
      slot("8:30", "12:30", "home", [446, 374], {days: "wd", act: "type", dir: -1}),
      slot("12:30", "13:30", "base", [340, 300], {days: "wd", act: "repair", dir: -1}),
      slot("13:30", "17:30", "home", [446, 374], {days: "wd", act: "type", dir: -1}),
      slot("17:30", "19:00", "farm", [[90, 250], [430, 400], [250, 520]], {days: "wd", act: "farm"}),
      slot("19:00", "22:00", "base", [[230, 360], [300, 590], [200, 600], [400, 330]], {days: "wd"}),
      slot("7:30", "10:30", "farm", [[90, 250], [430, 400], [250, 520]], {days: "we", act: "farm"}),
      slot("10:30", "12:00", "base", [190, 452], {days: "we", act: "water", dir: -1}),
      slot("12:00", "14:30", "base", [340, 300], {days: "we", act: "repair", dir: -1}),
      slot("14:30", "17:00", "base", [[230, 360], [330, 590], [160, 540], [400, 330]], {days: "we"}),
      slot("17:00", "19:00", "farm", [[90, 250], [430, 400], [250, 520]], {days: "we", act: "farm"}),
      slot("19:00", "22:00", "base", [[230, 360], [300, 590], [200, 600]], {days: "we"})],
    lines: ["Coffee's fresh if you want some.", "Evan watered my shoes again. Very thorough.", "Go get 'em. I'll hold the fort.",
      "The shed radio only gets one station. It's a good station.", "Dinner's sorted, don't worry about it.", "You've got this. One thing at a time."],
    actLines: {
      type: ["*typing* Back-to-back calls. Wave if it's urgent.", "On mute. Hi! *waves*", "Two more emails and I'm free."],
      water: ["Morning! The tomatoes say hi.", "Watering before it gets hot. Lin's orders."],
      repair: ["Gutter's nearly fixed. Nearly.", "Hold the ladder? Kidding. Mostly.", "If it squeaks, I fix it."],
      farm: ["Weeding. It's weirdly relaxing.", "These carrots are going to be enormous."],
      rest: ["Best present ever. Don't wake me for anything less than dinner.", "*sways* Five more minutes.", "The stars are out. Come look."]
    },
    react: {harvest: "Nice haul! I'll cook with that.", quests3: "Three done already? Look at you go.", lunch: "Lunch? I'll make toast."}
  },
  // The vineyard's workers: while they're on shift, thirsty vines get watered (Mel still does the picking)
  {
    id: "marco", pitch: 0.8, name: "Marco", job: "Keeps the vineyard",
    intro: "Marco. I look after the vines. You pick, I water, the grapes do the rest. Forty summers of this and I still talk to them.",
    look: {skin: "#C99470", hair: "#4A4038", hairStyle: "short", top: "#9DB88A", bottom: "#6B5444"},
    routine: [slot("8:00", "12:00", "vineyard", [[262, 390], [340, 440], [418, 490], [300, 392], [380, 442]], {act: "water"}),
      slot("12:00", "13:00", "wineshop", [227, 518], {act: "sit"}),
      slot("13:00", "18:00", "vineyard", [[262, 390], [340, 440], [418, 490], [230, 470], [450, 400]], {act: "farm"})],
    lines: ["Talk to them nicely. Vines listen.", "Water in the morning, pick in the afternoon.", "The red ones are show-offs. The white ones are shy.", "A good barrel takes its time. So do I."],
    actLines: {water: ["Watering the thirsty ones. You pick the ripe ones.", "A drink for every vine."], farm: ["Tying up the shoots.", "Checking every bunch. Looking good."]},
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
    actLines: {water: ["Just watering. Picking's yours!", "Hydrated vines, happy vines."], farm: ["Tidying the trellis.", "Pruning a little. Shh, it doesn't hurt."]},
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
