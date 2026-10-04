// Village NPCs (light-touch neighbours) and agent NPCs (Mel's automations as messengers). All original characters.
//
// Routine slots use Singapore minutes-since-midnight: {from, to, scene, at:[x,y]} stands still,
// {..., wander:[[x,y],...]} strolls between points. Outside every slot the NPC is off-screen (home, asleep).
// `react` lines fire once a day when their condition is true (see npcs.js REACTIONS).

const hm = s => { const [h, m] = s.split(":").map(Number); return h*60 + (m || 0); };
const slot = (from, to, scene, where) => Object.assign({from: hm(from), to: hm(to), scene}, Array.isArray(where[0]) ? {wander: where} : {at: where});

export const NPCS = [
  {
    id: "hana", pitch: 1.15, name: "Hana", job: "Runs the market",
    intro: "Hi love, I'm Hana! I moved here from a little seaside town. The honey toast is mine, and yes, I remember everyone's usual.",
    look: {skin: "#F3D2B8", hair: "#5A3A2A", hairStyle: "bun", top: "#EFA3A6", bottom: "#7A6A8C", extra: "apron"},
    routine: [slot("8:00", "12:00", "market", [260, 352]), slot("12:00", "13:00", "market", [[200, 352], [320, 352], [260, 352]]),
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
    routine: [slot("7:30", "12:00", "village", [455, 512]), slot("12:00", "17:00", "village", [[176, 352], [146, 360], [170, 372]]), slot("17:00", "19:30", "village", [380, 612])],
    lines: ["Letters used to come in sacks. Now it's all on your little phone.", "The well water is sweeter in the afternoon. Don't ask me why.", "I've sorted the pebbles by colour. Then by size. Then by colour again.",
      "A tidy inbox is a tidy mind. Mine is a shoebox.", "Ducks are very punctual, you know. Six o'clock sharp."],
    react: {inbox: "An email quest! Just like the old days. Stamp it and send it.", water: "Good, drink up. Forty years of walking taught me that.", quests3: "Steady work. That's the postmaster's way."}
  },
  {
    id: "juniper", pitch: 1.05, name: "Juniper", job: "Librarian at the Fresh Pages library",
    intro: "Welcome to the library! I'm Juniper. I love a good semicolon; I also write poetry, but that's a secret. One book recommendation a week, guaranteed.",
    look: {skin: "#C99A78", hair: "#2B2320", hairStyle: "bob", top: "#B9D2A6", bottom: "#3F4A6B", extra: "glasses"},
    routine: [slot("8:30", "13:00", "fresh", [[160, 300], [330, 300], [240, 330]]), slot("13:00", "15:30", "fresh", [356, 330]),
      slot("15:30", "16:00", "village", [[400, 300], [440, 320]]), slot("16:00", "18:00", "fresh", [[90, 330], [180, 330], [140, 312]])],
    lines: ["This week's pick: anything with a map in the front.", "A semicolon is a pause that believes in you.", "Shh… the nook is in reading hour. Join me?",
      "Every first draft is allowed to be terrible. That's the rule.", "I shelve by feeling, not by alphabet. Don't tell anyone."],
    react: {writing: "Ooh, a writing quest. Messy first, lovely later.", quests3: "Three chapters done today. Metaphorically."}
  },
  {
    id: "bo", pitch: 0.8, name: "Bo", job: "Carpenter at the Chord workshop",
    intro: "Bo! Carpenter. If it creaks, wobbles or falls off, I'm your guy. Built half this village. *hums*",
    look: {skin: "#E2B590", hair: "#3B2A1E", hairStyle: "short", top: "#E9C46A", bottom: "#4F6B8A", extra: "cap"},
    routine: [slot("8:00", "12:30", "chord", [[150, 330], [210, 320], [120, 340]]), slot("12:30", "13:30", "village", [300, 614]),
      slot("13:30", "18:00", "village", [[150, 300], [380, 300], [300, 450], [210, 420], [440, 560]])],
    lines: ["*hums a tune* Fixed the market's wobbly leg this morning.", "Measure twice, cut once. Or just cut and laugh.", "The workshop smells like sawdust and big ideas.",
      "Shipping is just building, but braver.", "Need a shelf? I always need a shelf."],
    react: {building: "Building something? Tools are out. Go for it.", quests3: "That's three. Nails in straight, every one."}
  },
  {
    id: "lin", pitch: 0.95, name: "Auntie Lin", job: "Gardener",
    intro: "Auntie Lin. I have opinions about soil, and they're all correct. Plant something and I'll tell you what you did wrong. Lovingly.",
    look: {skin: "#E9C2A0", hair: "#7C7570", hairStyle: "bun", top: "#9EBE8C", bottom: "#8A6A52", extra: "sunhat"},
    routine: [slot("6:30", "9:30", "farm", [[45, 250], [475, 400], [250, 560]]), slot("11:30", "14:00", "village", [326, 600]), slot("16:00", "19:00", "farm", [[45, 250], [475, 400], [250, 560]])],
    lines: ["Water in the morning, not at night. The roots know.", "Tulips are for beginners. That's a compliment.", "Strawberries take a whole day. Patience is a fertiliser.",
      "Your soil is lovely. Mine is better, but yours is lovely.", "Talk to your plants. They're good listeners."],
    gift: "tulip_seed",
    react: {harvest: "Look at that harvest! Your soil is coming along.", ready: "Something's ready in your garden. Don't leave it sulking!"}
  },
  {
    id: "pip", pitch: 1.45, name: "Pip", job: "Evan's best friend",
    intro: "I'm Pip! I'm Evan's best friend and I'm the FASTEST. Watch!", kid: true,
    look: {skin: "#D6A27C", hair: "#1F1A17", hairStyle: "spiky", top: "#F28C6A", bottom: "#4C7BB0", extra: "helmet"},
    routine: [slot("15:00", "18:30", "village", [[230, 330], [300, 330], [260, 380], [360, 560], [400, 600], [200, 400]])],
    lines: ["Race you to the pond!", "Evan is SO fast. Almost as fast as me.", "Did you know foxes can't ride bikes? I asked Maple.", "I found a snail! His name is Gary."],
    react: {}
  },
  {
    id: "theo", pitch: 0.9, name: "Theo", job: "Town hall clerk",
    intro: "Theo, town clerk. I keep the village records. And, if you have a moment, I have a stamp collection you would not believe.",
    look: {skin: "#F0D0B4", hair: "#6B4A2E", hairStyle: "short", top: "#C3CDEE", bottom: "#3A3A48", extra: "tie"},
    routine: [slot("9:00", "12:00", "hall", [[200, 320], [330, 320]]), slot("12:00", "13:00", "village", [354, 606]), slot("13:00", "17:00", "hall", [[200, 320], [330, 320]])],
    lines: ["Records say you've been busy. I'm very proud. Officially.", "This stamp is from 1962. Look at the little bird!", "Everything filed, everything stamped. Bliss.",
      "The quest board is the most important document in town.", "I've started a register of Maple's naps. It's long."],
    react: {quests3: "I've stamped three completed quests in the register. Gold stamp!", planning: "A planning quest! My favourite kind of paperwork."}
  }
];

// Agent NPCs: one per automation. `from` on a mail item picks the messenger (unknown -> postie).
export const AGENTS = {
  crier:    {name: "Rosa the town crier", skill: "morning-briefing", look: {skin: "#EDC6A6", hair: "#8A3B2A", hairStyle: "bun", top: "#C2505F", bottom: "#3A2E28", extra: "bell"}, hello: "Hear ye! Your morning briefing!"},
  runner:   {name: "Kip, the library runner", skill: "book-digest", look: {skin: "#D8A882", hair: "#2A211D", hairStyle: "spiky", top: "#7C9F6C", bottom: "#5E5A55", extra: "satchel"}, hello: "Today's book digest, hot off the shelf!"},
  postie:   {name: "Penny the postie", skill: "inbox-triage", look: {skin: "#F2D3BC", hair: "#B5562E", hairStyle: "bob", top: "#6E9FD6", bottom: "#2F3B73", extra: "cap"}, hello: "Post! Your inbox, sorted."},
  chord:    {name: "Cora from Chord", skill: "Chord agent", look: {skin: "#E6BC98", hair: "#3B2A1E", hairStyle: "bun", top: "#B9D2A6", bottom: "#4F6B8A", extra: "satchel"}, hello: "News from the Chord workshop!"},
  chico:    {name: "Coco from Chico", skill: "Chico agent", look: {skin: "#C99A78", hair: "#1F1A17", hairStyle: "bob", top: "#F4C7CF", bottom: "#7A6A8C", extra: "satchel"}, hello: "Chico update, fresh from the cottage!"},
  planner:  {name: "Wren the content planner", skill: "content planning", look: {skin: "#F0D0B4", hair: "#C9A27E", hairStyle: "long", top: "#F5C3A4", bottom: "#3F4A6B", extra: "satchel"}, hello: "Content plan's ready for your eyes!"},
  scout:    {name: "Fennel the tender scout", skill: "gebiz-opportunity-scout", look: {skin: "#E2B590", hair: "#5A3A2A", hairStyle: "short", top: "#BFD6E6", bottom: "#5E5A55", extra: "cap"}, hello: "Scouted some tenders for you!"},
  courier:  {name: "Basil the garden courier", skill: "sunsama-tidy / client-health-check", look: {skin: "#EBC9A8", hair: "#7C7570", hairStyle: "short", top: "#9EBE8C", bottom: "#8A6A52", extra: "satchel"}, hello: "A little tidy-up report!"},
  winddown: {name: "Luna the evening messenger", skill: "evening-wind-down", look: {skin: "#EDC6A6", hair: "#2B2320", hairStyle: "long", top: "#9AA9DD", bottom: "#2F3B73", extra: "lantern"}, hello: "Time to close the day. A note for you."}
};
