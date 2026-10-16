// Village NPCs (light-touch neighbours) and agent NPCs (automations as messengers). All original characters.
//
// Town folk live in the town square ("village"); some stay at home base ("base", "home", "farm").
// Routine slots use local minutes-since-midnight: {from, to, scene, at:[x,y]} stands still,
// {..., wander:[[x,y],...]} strolls between points. Outside every slot the NPC is off-screen (home, asleep).
// `react` lines fire once a day when their condition is true (see npcs.js REACTIONS).

import { BB_PEOPLE } from "./bb-people.js";
import { CR_PEOPLE } from "./cr-people.js";
import { SW_PEOPLE } from "./sw-people.js";
import { PI_PEOPLE } from "./pi-people.js";
import { HK_PEOPLE } from "./hk-people.js";
import { TL_PEOPLE } from "./tl-people.js";
import { LV_PEOPLE } from "./lv-people.js";
import { WEDDING_PEOPLE } from "./terrace-people.js";
import { MILL_PEOPLE } from "./mill-people.js";
const hm = s => { const [h, m] = s.split(":").map(Number); return h*60 + (m || 0); };
// opts: {look: clothes for this slot (over the usual look), dow: [0-6] (only on those days, 0 = Sunday), days: "wd" | "we" (weekdays / weekends only), act: what they're doing (props + lines), dir: facing}
// going-out clothes: a pressed shirt and long trousers (no berms)
const OUT = {top: "#DCE7F2", bottom: "#4A4F5C", shorts: false};
// the foreshore: a walk along the boardwalk and the sand, and the sea (for paddleboarders, who go straight across)
const SHORE_WALK = [[226, 180], [240, 300], [300, 312], [430, 300], [236, 420], [226, 560], [300, 580]];
export const SEA = [[60, 190], [104, 250], [70, 330], [112, 400], [64, 560], [118, 610]];
const BANKER = {top: "#DCE7F2", bottom: "#2F3A4A", extra: "tie"};
// a wander along Makers' Lane (between the workshop and the cottages), and round the Sunday market at the field
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
    lines: ["Your Uncle Wilf bought his bread here every Saturday. Always the seeded loaf, always a bun for {pet}.", "Fresh dumplings today. Don't tell {pet}, they'll want three.", "You look like a honey toast kind of person today.", "Lunch rush is wild. Everyone wants toast at once!",
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
    lines: ["Wilf Song and I played draughts on this bench for twenty years. He cheated. Charmingly.", "Letters used to come in sacks. Now it's all on your little phone.", "The well water is sweeter in the afternoon. Don't ask me why.", "I've sorted the pebbles by colour. Then by size. Then by colour again.",
      "A tidy inbox is a tidy mind. Mine is a shoebox.", "The river's high today. Good for the ducks."],
    react: {inbox: "An email quest! Just like the old days. Stamp it and send it.", water: "Good, drink up. Forty years of walking taught me that.", quests3: "Steady work. That's the postmaster's way."}
  },
  {
    id: "juniper", pitch: 1.05, name: "Juniper", job: "Librarian at the library",
    intro: "Welcome to the library! I'm Juniper. I love a good semicolon; I also write poetry, but that's a secret. One book recommendation a week, guaranteed.",
    look: {skin: "#C99A78", hair: "#2B2320", hairStyle: "bob", top: "#B9D2A6", bottom: "#3F4A6B", extra: "glasses"},
    routine: [slot("7:20", "7:42", "hlane", [250, 150], {dow: [2], dir: 1}), slot("7:00", "8:00", "hwoods", WOODS_RIDE, {dow: [1, 3, 5], look: BIKE}), slot("9:00", "11:00", "hwoods", WOODS_RIDE, {dow: [6], look: BIKE}), slot("15:30", "16:30", "lane", LANE, {dow: [1, 2, 3, 4, 5]}),
      slot("18:30", "20:00", "wineshop", [453, 512], {act: "sit"}), slot("8:30", "13:00", "library", [[160, 300], [330, 300], [240, 330]]), slot("13:00", "15:30", "library", [356, 330]),
      slot("15:30", "16:00", "trophy", [292, 590], {act: "sit"}), slot("16:00", "18:00", "library", [[90, 330], [180, 330], [140, 312]])],
    lines: ["This week's pick: anything with a map in the front.", "A semicolon is a pause that believes in you.", "Shh… the nook is in reading hour. Join me?",
      "Every first draft is allowed to be terrible. That's the rule.", "I shelve by feeling, not by alphabet. Don't tell anyone."],
    react: {writing: "Ooh, a writing quest. Messy first, lovely later.", quests3: "Three chapters done today. Metaphorically."}
  },
  {
    id: "bo", pitch: 0.8, name: "Bo", job: "Carpenter, with a workshop on Makers' Lane",
    intro: "Bo! Carpenter. If it creaks, wobbles or falls off, I'm your guy. Built half this village. *hums*",
    look: {skin: "#E2B590", hair: "#3B2A1E", hairStyle: "short", top: "#E9C46A", bottom: "#4F6B8A", extra: "cap"},
    routine: [slot("12:30", "13:30", "bay", [[180, 420], [240, 430], [300, 420]], {dow: [3, 5]}), slot("8:00", "10:00", "hwoods", WOODS_RIDE, {dow: [6], look: BIKE}), slot("12:30", "13:30", "lane", LANE, {dow: [2, 4]}),
      slot("18:30", "20:00", "wineshop", [227, 518], {act: "sit", dow: [0, 1, 3, 4, 5]}), slot("8:00", "12:30", "carpentry", [[150, 330], [210, 320], [120, 340]]), slot("12:30", "13:30", "village", [346, 566]),
      slot("13:30", "18:00", "village", [[170, 300], [400, 280], [300, 450], [150, 520], [440, 560]])],
    lines: ["I built those trellis posts for Wilf, back in the day. They've leaned a bit since. We'll fix them.", "*hums a tune* Fixed the market's wobbly leg this morning.", "Measure twice, cut once. Or just cut and laugh.", "The workshop smells like sawdust and big ideas.",
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
    id: "pip", pitch: 1.45, name: "Pip", job: "The fastest child in Honeybrook",
    intro: "I'm Pip! I'm seven and I'm the FASTEST. Watch!", kid: true,
    look: {skin: "#D6A27C", hair: "#1F1A17", hairStyle: "spiky", top: "#F28C6A", bottom: "#4C7BB0", extra: "helmet"},
    routine: [slot("16:30", "17:30", "vineyard", [[110, 604], [262, 600], [410, 608], [200, 586], [330, 590]]), slot("15:00", "18:30", "base", [[230, 350], [300, 380], [200, 420], [360, 516], [160, 560], [300, 600]])],
    lines: ["Race you to the pond!", "Nobody is as fast as me. Nobody.", "Did you know a {kind} can't ride a bike? I asked {pet}.", "I found a snail! His name is Gary."],
    react: {}
  },
  {
    id: "opal", pitch: 1.0, name: "Opal", job: "The banker",
    intro: "Welcome to the bank! I'm Opal. The vaults are polished, the pens all work and the mints are free.",
    look: {skin: "#E8C3A2", hair: "#2E2622", hairStyle: "bun", top: "#7FA88A", bottom: "#3F4A3A", extra: "glasses"},
    routine: [slot("10:00", "11:30", "hfarm", [[140, 600], [200, 560], [260, 600]], {dow: [6]}), slot("9:00", "11:00", "hwoods", WOODS_WALK, {dow: [0]}), slot("18:00", "19:30", "wineshop", [367, 512], {act: "sit"}), slot("9:00", "12:30", "bank", [260, 500]), slot("12:30", "13:30", "village", [[300, 214], [262, 230]]), slot("13:30", "17:30", "bank", [260, 500])],
    lines: ["Every jewel counts. Even the little ones. Especially the little ones.", "Pay yourself first, then the rest. That's the banker's secret.", "I polished the sapphires this morning. Don't tell the rubies.",
      "Slow and steady fills a jar. Promise.", "A full jar is the prettiest thing in this town."],
    away: "Opal's on her lunch break. Back soon.",
    react: {quests3: "Three tasks done! That's a good day's work."}
  },
  {
    id: "theo", pitch: 0.9, name: "Theo", job: "Town hall clerk",
    intro: "Theo, town clerk. I keep the village records. And, if you have a moment, I have a stamp collection you would not believe.",
    look: {skin: "#F0D0B4", hair: "#6B4A2E", hairStyle: "short", top: "#C3CDEE", bottom: "#3A3A48", extra: "tie"},
    routine: [slot("9:00", "12:00", "hwoods", WOODS_WALK, {dow: [6]}), slot("15:00", "17:00", "bay", [[180, 420], [240, 430]], {dow: [0], act: "sit"}), slot("17:30", "19:00", "wineshop", [313, 518], {act: "sit"}), slot("9:00", "12:00", "hall", [[200, 320], [330, 320]]), slot("12:00", "13:00", "trophy", [228, 590], {act: "sit"}), slot("13:00", "17:00", "hall", [[200, 320], [330, 320]])],
    lines: ["I filed your uncle's papers myself. Wilfred Song: beautiful handwriting, terrible at forms.", "Records say you've been busy. I'm very proud. Officially.", "This stamp is from 1962. Look at the little bird!", "Everything filed, everything stamped. Bliss.",
      "The quest board is the most important document in town.", "I've started a register of {pet}'s naps. It's long."],
    react: {quests3: "I've stamped three completed quests in the register. Gold stamp!", planning: "A planning quest! My favourite kind of paperwork."}
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
  // round 153: Tomi, Ines's little brother (named after Tomás, who planted the olive by the mill in 1912), works the
  // mill once it's open: presses the olive crate and carries the bottles up to the basket (round 200: that's all), 10 to 5, every day but Sunday
  {
    id: "tomi", pitch: 1.1, name: "Tomi", job: "Works the press at the old mill (Ines's little brother)",
    intro: "Tomi. Ines's brother, the one named after the great-great-grandfather. So the mill's sort of a family thing. I press, I bottle, I carry it upstairs, I sweep up the olive stones.",
    look: {skin: "#E8B996", hair: "#5A2E1A", hairStyle: "spiky", top: "#7FA35A", bottom: "#4F5A6A", extra: "apron"},
    // round 154: his week. Before the mill opened he helped Ines on the vines; Sundays off: football on the field,
    // then the Scoop Shack; Wednesday and Friday evenings at the wine shop, Tuesdays down at the bay with Ines
    routine: [slot("9:30", "10:00", "hlane", [[300, 300], [240, 320]], {needs: "mill", dow: [1, 2, 3, 4, 5, 6]}), slot("10:00", "17:00", "mill", [[300, 520], [300, 250], [380, 520]], {needs: "mill", dow: [1, 2, 3, 4, 5, 6]}),
      slot("10:00", "16:00", "vineyard", [[262, 440], [340, 490], [418, 390]], {act: "farm", dow: [1, 2, 3, 4, 5, 6]}),
      slot("9:00", "11:00", "field", [[200, 420], [260, 400], [320, 430]], {act: "footy", dow: [0]}), slot("13:00", "15:00", "bay", [[180, 420], [240, 430], [300, 420]], {dow: [0]}),
      slot("18:00", "20:00", "wineshop", [[300, 500], [360, 520]], {dow: [3, 5]}), slot("18:00", "19:30", "bay", [[180, 420], [300, 420]], {dow: [2]})],
    lines: ["Three jars to a bottle. Every time. The stone doesn't lie.", "Four bottles, up the stairs, into the basket. Then back down for more.", "T.R. 1912. Ines thinks I carved it. I didn't. Probably.", "Smell that? Green and peppery. That's a good pressing."],
    away: "Tomi's finished at the mill for the day."
  },
  // round 178: Posy keeps the gift shop behind the wine shop, 10 to 6, every day but Monday (giftshop.js)
  {
    id: "posy", pitch: 1.2, name: "Posy", job: "Runs the gift shop at the winery",
    intro: "Posy! I used to work in a cellar door gift shop up in the hills, the kind with tea towels and fudge. This is better: everything here, you made.",
    look: {skin: "#F2C9A8", hair: "#C8643C", hairStyle: "bob", top: "#C9A3E0", bottom: "#4F5A6A", extra: "apron"},
    routine: [slot("09:45", "10:00", "wineshop", [[120, 520], [60, 560]], {needs: "giftshop", dow: [0, 2, 3, 4, 5, 6]}),
      slot("10:00", "18:00", "giftshop", [[300, 520], [180, 380], [380, 380]], {needs: "giftshop", dow: [0, 2, 3, 4, 5, 6]}),
      slot("10:00", "12:00", "village", [[330, 380], [300, 400]], {dow: [1]}), slot("18:30", "20:00", "wineshop", [[300, 500], [360, 520]], {dow: [5, 6]})],
    lines: ["Old Wilf's labels were all hand-drawn. Little grapes in the corner. I've kept one.", "The honey heart bonbons go first. Every time.", "Someone bought three bars just for the box they come in.", "I've moved the soaps next to the wine. People sniff, then buy both.", "Tea towels. One day. Trust me."],
    away: "Posy's gone home. The gift shop's shut."
  },
  // round 153: Hazel runs the Mill Shop (once you've opened it): every day but Monday, 10 to 5, behind the counter
  // downstairs. She made soap for forty years, and has opinions about lavender
  {
    id: "hazel", pitch: .95, name: "Hazel", job: "Runs the Mill Shop",
    intro: "Hazel. I made soap for forty years, in a shed behind my house. Now I get to sell yours. Lavender and honey, that's the one. Trust me.",
    look: {skin: "#F2D3BC", hair: "#D6D0C6", hairStyle: "bun", top: "#9CAA6A", bottom: "#5A4A3E", extra: "apron"},
    // round 154: a whole week in the village. Early walks in the woods; Sunday mornings at the market with Grace, her
    // granddaughter (who's staying with her), before opening up; Mondays, with the shop shut, lavender and roses from Ma
    // Ma's flower farm and lunch in the square; a glass at the wine shop on Friday evenings
    routine: [slot("7:00", "8:30", "hwoods", [[100, 330], [200, 318], [300, 300]], {dow: [1, 2, 3, 4, 5, 6]}),
      slot("8:00", "10:00", "field", [[356, 160], [380, 170]], {dow: [0]}),
      slot("9:30", "10:00", "hlane", [[300, 300], [360, 320]], {needs: "millshop", dow: [0, 2, 3, 4, 5, 6]}), slot("10:00", "17:00", "millup", [214, 500], {needs: "millshop", dow: [0, 2, 3, 4, 5, 6], dir: 1}),
      slot("10:00", "12:00", "flowers", [[160, 300], [260, 380], [210, 300]], {dow: [1]}), slot("12:00", "13:30", "village", [[362, 372], [392, 360]], {dow: [1]}),
      slot("10:00", "12:00", "village", [[362, 372], [340, 380]]), slot("14:00", "16:00", "orchard", [[160, 330], [260, 420]]),
      slot("18:00", "20:00", "wineshop", [[300, 500], [360, 520]], {dow: [5]})],
    lines: ["Lavender and honey. Every time.", "Smell that one. Go on. Rosemary and lemon: clears your head right out.", "A good soap needs a day to cure. Patience, like wine.", "Rose for the mums, rosemary for the dads. I've never been wrong.", "The soap maker in the Lavender Hills cuts it like cheese. I'd go back just for that."],
    away: "Hazel's gone home. The Mill Shop's shut."
  },
  // The wine shop's assistant: while she's behind the counter, more customers come in (coins go in the honesty box)
  {
    id: "celeste", pitch: 1.05, name: "Celeste", job: "Runs the wine shop counter",
    intro: "Bienvenue! I'm Celeste. I mind the counter, pour the tastings and write the chalkboard. Your wines sell themselves, honestly. I just smile.",
    look: {skin: "#B9835F", hair: "#231C19", hairStyle: "bun", top: "#8E2C48", bottom: "#2F2B28", extra: "apron"},
    routine: [slot("9:00", "10:45", "hwoods", [[132, 590], [180, 560], [100, 600]], {dow: [1]}), slot("10:00", "15:00", "wineshop", [372, 286]), slot("15:00", "15:30", "vineyard", [[300, 260], [440, 270], [360, 300]]), slot("15:30", "21:30", "wineshop", [372, 286])],
    lines: ["The honesty box is very honest today.", "Someone asked who makes these. I said a very busy neighbour.", "Evenings are the best. Everyone wants a glass.", "If the shelves are full, I'm happy."],
    away: "Celeste's not on. The honesty box minds the shop."
  },
  // The orchard's two workers: Farid looks after the fruit trees, Mei the flower farm (they take turns
  // leading the weekend tours)
  {
    id: "farid", pitch: 0.85, name: "Farid", job: "Works the fruit orchard",
    intro: "Farid! I keep the orchard: prune, fertilise, climb the ladders. Mei says I talk to the trees too much. She sings to the roses, so.",
    look: {skin: "#B07A55", hair: "#2A211D", hairStyle: "short", top: "#7FA35A", bottom: "#5E5A55", hat: "cap"},
    routine: [slot("8:00", "12:00", "orchard", [[160, 330], [260, 420], [360, 510], [210, 510], [310, 330]], {act: "farm"}),
      slot("12:00", "13:00", "orchard", [470, 330], {act: "sit"}),
      slot("13:00", "17:30", "orchard", [[160, 420], [260, 510], [360, 330], [410, 420]], {act: "water"})],
    lines: ["Wilf traded me a case of red for a crate of plums, every autumn. I'd like to keep that going.", "The trees are the boss. I just carry things.", "The apples are looking good this week.", "I baked too much again. There's cake at the cottage at three.", "Best office in the village, this."],
    actLines: {guide: ["Over here we've got the fruit trees. My pride and joy.", "You can taste one at the farm shop after!", "Step around the hose, please. Everyone always forgets the hose."], farm: ["Pruning the old branches. More fruit next time.", "Mulch. Very glamorous."], water: ["Deep water, twice a week. That's the rule.", "These trees drink more than I do."]},
    away: "Farid's gone home for the day."
  },
  {
    id: "mei", pitch: 1.2, name: "Mei", job: "Works the flower farm",
    intro: "Hi, I'm Mei. I look after the flower beds. My mother taught me to sing to the roses. Don't laugh.",
    look: {skin: "#EAC4A4", hair: "#2B2320", hairStyle: "bob", top: "#F4C7CF", bottom: "#5E6E8C", hat: "sunhat"},
    routine: [slot("7:00", "8:00", "hwoods", [[132, 590], [180, 560], [100, 600]], {dow: [0]}), slot("8:00", "12:00", "flowers", [[160, 300], [260, 380], [360, 470], [210, 470], [310, 300]], {act: "water"}),
      slot("12:00", "13:00", "flowers", [44, 486], {act: "sit"}),
      slot("13:00", "17:30", "flowers", [[160, 380], [260, 470], [360, 300], [410, 380]], {act: "farm"})],
    lines: ["Your uncle always kept a jar of my sweet peas on his kitchen table. I'll bring you some.", "The dahlias are showing off today.", "My mother said flowers know when you're happy.", "Bouquet for someone special? Just say.", "I could do this forever."],
    actLines: {guide: ["These beds bloom again every day or so. Isn't that lovely?", "That one's my favourite. Don't tell the others.", "Bouquets at the farm shop, if anyone's feeling romantic."], water: ["Gentle on the petals.", "Morning water, happy flowers."], farm: ["Deadheading. Snip, snip.", "Cutting a few for the shop."]},
    away: "Mei's finished for the day."
  },
  // Out-of-towners: day trippers who only ever turn up at the wine shop (tastings, a bottle to take home) and Farid's
  // orchard (farm tours, fruit and flowers from the farm shop). No routine of their own: tours.js says when they come.
  ...[["aiko", "Aiko", {skin: "#F0D2B6", hair: "#2B2320", hairStyle: "bob", top: "#F6A23A", bottom: "#3F4A6B", hat: "sunhat"}, "Visiting from the city"],
    ["ben", "Ben", {skin: "#E8C4A0", hair: "#B5562E", hairStyle: "short", top: "#6E9FD6", bottom: "#5E5A55", extra: "satchel"}, "Here on a cycling holiday"],
    ["clara", "Clara", {skin: "#F2D3BC", hair: "#D9B46A", hairStyle: "long", top: "#E8566C", bottom: "#2F3B73"}, "On a weekend away"],
    ["dev", "Dev", {skin: "#A8754F", hair: "#1F1A17", hairStyle: "short", top: "#F3E7B0", bottom: "#4A5568", hat: "cap"}, "Food blogger, just passing through"],
    ["rosa", "Rosa", {skin: "#D9A882", hair: "#2A211D", hairStyle: "long", top: "#C2505F", bottom: "#3E4A43", extra: "satchel"}, "Wine lover on a tasting trip"],
    ["bastien", "Bastien", {skin: "#EBC9A8", hair: "#7C7570", hairStyle: "short", top: "#6E9FD6", bottom: "#8A6A52", extra: "glasses"}, "Retired, touring the countryside"],
    ["grace", "Grace", {skin: "#C99A78", hair: "#2A211D", hairStyle: "long", top: "#F4C7CF", bottom: "#5E6E8C", hat: "sunhat"}, "Makes soap, like her gran Hazel (and sells it at the Sunday market)"],
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
    hellos: ["Morning!", "Ah, a helper!"], away: "Felix is in the farmhouse with his feet up."},
  {id: "elena", pitch: 1.05, name: "Elena", job: "Runs the dairy at Wildflower Farm",
    look: {skin: "#D9A882", hair: "#5A3A2A", hairStyle: "bun", top: "#9C8CD9", bottom: "#3E4A43", extra: "apron"},
    routine: [slot("06:00", "11:00", "hfarm", [[30, 400], [260, 400], [490, 420], [440, 516]]), slot("11:00", "13:00", "barn", [[262, 520], [380, 560], [160, 560]]),
      slot("13:00", "18:00", "hfarm", [[200, 600], [260, 524], [440, 512], [458, 270]])],
    intro: "I'm Elena. Cows, goats, and soon a proper cheese cave in the barn. The cheese at my market stall? Aged right here.",
    lines: ["Wilf used to bring {pet} up to see the goats. Daisy pretended not to care. She cared.", "Daisy's the boss of the paddock. Mochi just pretends.", "Milking at six. The goats prefer six-fifteen.", "A good cheese takes patience. So does a good goat.", "Pepper ate my notebook again."],
    hellos: ["Hi! Grab a bucket.", "Morning! Hay's in the barn."], away: "Elena's done for the day. Even the goats are asleep."},
  // Amara serves at the Cocoa Room's counter (once you open it, goals.js "cocoa"), Tuesday to Sunday
  {id: "amara", pitch: 1.15, name: "Amara", job: "Serves at the Cocoa Room",
    look: {skin: "#A8754F", hair: "#1F1A17", hairStyle: "bun", top: "#8A5A3A", bottom: "#F3E7C9", extra: "apron"},
    routine: [slot("10:45", "20:15", "cocoa", [300, 268], {dow: [0, 2, 3, 4, 5, 6], needs: "cocoa"})],
    intro: "Hi, I'm Amara! I wrap, I sell, and I sneak the broken bits. Don't tell.",
    lines: ["The dark one's flying off the wall today.", "Someone bought six bars. Six!", "It smells like heaven in here, all day long.", "I told a tourist you make it from the bean. They nearly cried.", "Everyone wants the dark. I'm a white chocolate girl, secretly."],
    hellos: ["Hi! The wall's looking good.", "Boss! Want a taste?"], away: "Amara's off. The Cocoa Room's quiet."},
  // Mateo is the Cocoa Room's kitchen hand (cocoa.js handStep): Monday to Saturday 9:30-4:30, evening classes Mon and Tue
  {id: "mateo", pitch: .95, name: "Mateo", job: "Kitchen hand at the Cocoa Room",
    look: {skin: "#C99A78", hair: "#2A211D", hairStyle: "short", top: "#F6F2EA", bottom: "#4A2E22", extra: "apron"},
    // round 177 (he studies at night, at evening classes, and works at your shop during the day), round 180
    // (he works Mondays too): Monday to Saturday 9:30 to 4:30 in the kitchen; food science at the poly on Monday and Tuesday evenings (off the map, 6 to 9),
    // then home to his textbooks
    routine: [slot("08:30", "09:15", "hlane", [[200, 320], [236, 450], [330, 180]]),
      slot("09:30", "16:30", "cocoakitchen", [[250, 330], [410, 330], [180, 500], [360, 500]], {dow: [1, 2, 3, 4, 5, 6], needs: "cocoa"}),
      slot("21:15", "22:30", "honeysuckle", [300, 470], {act: "read", dow: [1, 2]}),
      slot("17:00", "20:30", "hlane", [186, 298], {act: "sit", dow: [0, 3, 4, 5, 6]}), slot("20:30", "22:30", "honeysuckle", [300, 470], {act: "sit", dow: [0, 3, 4, 5, 6]})],   // home: Honeysuckle, with Lila
    intro: "Hola! I'm Mateo. I'm in your kitchen Monday to Saturday, and I study food science at the poly on Monday and Tuesday nights. The bonbons are all yours, boss.",
    lines: ["Your bonbon shelf is full. I didn't touch a crumb!", "Exams next week. Tempering is very calming.", "My lecturer says I'm the only one who's ground beans by hand.", "The grinder's singing today.", "Forty dark bars on the wall. A personal best.", "I bought beans this morning. Don't worry, I kept to your budget."],
    hellos: ["Morning, boss! Roaster's warm.", "Hi! Smell that?"], away: "Mateo's gone home. The kitchen's quiet."},
  // Lila, the Cocoa Room's second assistant (cocoa.js upgrade "assistant"): Mondays (Amara's day off) and weekend afternoons
  {id: "lila", pitch: 1.2, name: "Lila", job: "Serves at the Cocoa Room",
    look: {skin: "#F2D3BC", hair: "#B5562E", hairStyle: "bob", top: "#C2505F", bottom: "#F3E7C9", extra: "apron"},
    routine: [slot("21:00", "22:30", "honeysuckle", [220, 470], {act: "sit"}), slot("20:30", "22:30", "hlane", [206, 306], {act: "sit"}), slot("09:00", "10:30", "hlane", [[150, 300], [236, 400], [120, 500]], {dow: [2, 3, 4, 5]}),   // home: Honeysuckle
      slot("10:45", "20:15", "cocoa", [240, 268], {dow: [1], needs: "cc_assistant"}), slot("13:00", "20:15", "cocoa", [[180, 420], [400, 440], [240, 268]], {dow: [0, 6], needs: "cc_assistant"})],
    intro: "Hi! I'm Lila. Mondays are mine, and I help Amara at weekends. I'm working my way through every bonbon. For research.",
    lines: ["Mondays are quiet, but the regulars are lovely.", "I wrapped forty boxes on Saturday. My fingers are ribbon now.", "Someone asked if we deliver to the moon.", "The fountain is hypnotic. I keep staring at it.", "Next on my research list: those tangerine chocolates from Jeju."],
    hellos: ["Hi!", "Morning, boss!"], away: "Lila's not on today."},
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
    lines: ["Push me on the swing!", "Again! Again!", "The roundabout is the BEST.", "I'm not dizzy. Okay, a bit dizzy.", "Will you play too?"],
    away: `${name}'s gone home.`})),
  // The wine shop's cook: on her shifts she runs the kitchen from whatever's in the larder (see cookTick)
  // Honeybrook Woods' ranger (round 103): cycles up from Makers' Lane in the morning, walks the trails, keeps the
  // Round 107: Ronda's locals (local: "ronda"). They're only ever on Ronda's screens, so you meet them on a day trip.
  // Doña Carmen keeps the sweet shop (and knew Pilar's mother); Rafael sells his family's oil and almonds at the market
  // (and, once he trusts you, Tempranillo cuttings); Lucía paints the tiles; Manolo busks by the fountain.
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
    lines: ["This one's a bulería. Clap on twelve. No, twelve. Never mind.", "A guitar is just wood and string and a bit of heartbreak.", "You have good ears. Especially the lady who dances.", "Requests? I know three songs. And forty more."],
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
    lines: ["Clap on three, six, eight, ten and twelve. It's easy! It's not easy.", "Flamenco is not happy, not sad. It's both, at the same time.", "My grandmother danced on this same stage. Well, the old one. It fell down.", "¡Venga! Clap with me!"],
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
    lines: ["Black stone, white stone. The whole world on one board.", "Your friend plays like a river. Very patient. Then suddenly, flood.", "Sit, watch. You'll learn more watching than playing.", "Again tomorrow? Good. Bring your friend."],
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
    lines: ["That pagoda's been rebuilt after fires, after storms. It always comes back.", "The tea house? Sachiko-san's. Best tea on the lane. Don't tell the others I said.", "Up this hill a thousand times a day. My calves have calves.", "Autumn leaf season! Everyone wants a photo. I'm in most of them."],
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
      ["My mum's in the pottery buying a seventh teapot. Send help.", "The koi in the temple pond are bigger than my cat.", "I didn't think anywhere could be this quiet and this busy at once."]]
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
    lines: ["A net with a hole catches nothing. A man with a hole in his day catches up.", "Your friend? She mends a good knot. Tell her to come back.", "Squid tonight. You can smell it in the wind.", "Pass me that needle. Thank you."],
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
  // Round 133: Cinque Terre's people (local: "cinque"). Nonna Pina makes pesto; Beppe bakes the focaccia; Signor Bruno
  // grows the vines and drives the monorail; Gianni makes gelato; Signora Franca has the lemon shop; Aldo and Piero fish
  // and repaint their boats; Signor Rossi keeps the station; Nino plays bocce in the piazza. And tourists, walking the
  // cliff path between the villages.
  {
    id: "nonnapina", local: "cinque", pitch: 0.9, name: "Nonna Pina", job: "Makes pesto in Manarola, every day since she was six",
    intro: "Pina. Eighty-one years old, and my basil is younger than all of you. Come, come. You make pesto with me. Not with a machine. Never with a machine.",
    look: {skin: "#E2B590", hair: "#E6E2DA", hairStyle: "bun", top: "#3E5E4A", bottom: "#2F2B28", extra: "apron"},
    routine: [slot("9:00", "18:00", "ct_pesto", [262, 318], {dir: 1})],
    lines: ["Young leaves only. The old ones taste of soap.", "Pound, don't grind. Gently. Like a heartbeat.", "My granddaughter lives in Milan. She buys pesto in a jar. I forgive her. Slowly.", "A little salt with the garlic. It helps. Everything needs a little help."],
    away: "Nonna Pina's having her afternoon rest. The basil is resting too."
  },
  {
    id: "beppe", local: "cinque", pitch: 0.82, name: "Beppe", job: "Bakes the focaccia in Vernazza",
    intro: "Beppe! Up at four, oven lit by five, focaccia by six. Then I sleep in the afternoon like a cat. Try the onion one. Trust me.",
    look: {skin: "#E2B590", hair: "#3A3430", hairStyle: "short", top: "#FFFDF6", bottom: "#5A4A3E", extra: "apron"},
    routine: [slot("7:00", "14:00", "ct_focacceria", [[280, 300], [240, 320]]), slot("16:00", "20:00", "ct_focacceria", [[280, 300], [240, 320]])],
    lines: ["Dimples! Press your fingers in, so the oil has somewhere to sit.", "The wood oven was my grandfather's. It's older than the church. Almost.", "Farinata: chickpeas, water, oil, salt. Four things. Perfect.", "Hot! Mind your fingers. Everyone burns their fingers. Everyone comes back."],
    away: "Beppe's asleep upstairs. The oven's resting till four."
  },
  {
    id: "bruno", local: "cinque", pitch: 0.74, name: "Signor Bruno", job: "Grows the vines on Corniglia's terraces",
    intro: "Bruno. My terraces go up, and up, and up. Two hundred years my family carries grapes down this cliff. Now we have the monorail. Progress!",
    look: {skin: "#C99A78", hair: "#B9B0A4", hairStyle: "short", top: "#7A8A5A", bottom: "#5A4A3E", hat: "cap"},
    routine: [slot("8:00", "12:00", "ct_corniglia", [[320, 252], [260, 240]]), slot("12:00", "18:00", "ct_cantina", [262, 262], {dir: 1})],
    lines: ["The sun on the sea, the sun on the rock: the grapes get it twice.", "Sciacchetrà: you dry the grapes until they're raisins. Then you wait. Then you wait more.", "The walls are dry stone. No cement. My great-great-grandfather built that one.", "Don't look down on the monorail. Or do. Everyone does."],
    away: "Signor Bruno's up on the terraces somewhere, with his secateurs."
  },
  {
    id: "gianni", local: "cinque", pitch: 1.02, name: "Gianni", job: "Makes gelato in Manarola",
    intro: "Ciao! Gianni. Everything fresh this morning: basil from Nonna Pina, lemons from Franca, figs from my uncle. What can I give you? Everything?",
    look: {skin: "#E2B590", hair: "#2A211D", hairStyle: "short", top: "#E89A9A", bottom: "#FFFDF6", extra: "apron"},
    routine: [slot("10:00", "21:00", "ct_gelato", [260, 312], {dir: 1})],
    lines: ["Basil gelato. Don't make that face. Try it.", "Two flavours in a cone is normal. Three is a celebration.", "Gelato is not ice cream. Less air. More love.", "Lemon and basil together: that's a secret. Tell nobody. Except your ice cream shop."],
    away: "Gianni's making tomorrow's gelato in the back. Come back later!"
  },
  {
    id: "franca", local: "cinque", pitch: 0.96, name: "Signora Franca", job: "Has the lemon shop in Monterosso",
    intro: "Buongiorno! Franca. Everything in this shop is lemons, or for lemons, or smells of lemons. Here: smell this one. Che profumo!",
    look: {skin: "#EAC4A0", hair: "#5A3A2A", hairStyle: "bob", top: "#F3D34A", bottom: "#3E6BAE"},
    routine: [slot("9:00", "19:00", "ct_limoni", [262, 368], {dir: 1})],
    lines: ["Limoncino: lemon peel, a little sugar, and time. Mostly time.", "The best lemons grow where they can see the sea.", "Monterosso anchovies: the best in Italy. Don't tell Vernazza.", "This plate? Painted by my cousin. Everything here is somebody's cousin."],
    away: "The lemon shop's shutters are half down. Signora Franca's at lunch."
  },
  {
    id: "aldo", local: "cinque", pitch: 0.72, name: "Aldo", job: "A fisherman in Manarola",
    intro: "Aldo. Fisherman. Fifty years. In spring we paint the boats. Every boat a colour, so the wives see from the window who comes home.",
    look: {skin: "#C99A78", hair: "#D6D0C6", hairStyle: "short", top: "#3E6BAE", bottom: "#5A4A3E", hat: "cap"},
    routine: [slot("8:00", "13:00", "ct_manarola", [[230, 340], [260, 360]]), slot("15:00", "19:00", "ct_manarola", [[230, 340], [200, 360]])],
    lines: ["Anchovies run in the spring. Silver, silver, silver, the whole sea.", "Paint it every year, or the sea eats the wood.", "My boat is blue. My wife says it's ugly. She's right. It's still blue.", "Salt the anchovies in a barrel: a layer of salt, a layer of fish. Then forget them."],
    away: "Aldo's out on the water."
  },
  {
    id: "piero", local: "cinque", pitch: 0.86, name: "Piero", job: "A fisherman, Aldo's cousin",
    intro: "Piero. Aldo's cousin. Younger, better looking, worse at fishing. You want to paint a boat? Here, take the brush. Not that one.",
    look: {skin: "#E2B590", hair: "#3A3430", hairStyle: "short", top: "#C9483A", bottom: "#2F2B28"},
    routine: [slot("9:00", "13:00", "ct_manarola", [[300, 330], [280, 350]]), slot("14:00", "18:00", "ct_vernazza", [[200, 440], [240, 430]])],
    lines: ["Red! Always red. The fish like red. I've decided.", "Aldo says I talk too much for a fisherman. The fish don't mind.", "The best focaccia is Beppe's. Don't tell Monterosso.", "In winter they light up the hill like Christmas. You must come back."],
    away: "Piero's down at the harbour mending something."
  },
  {
    id: "srossi", local: "cinque", pitch: 0.8, name: "Signor Rossi", job: "Keeps Corniglia station",
    intro: "Rossi, stationmaster. The trains go in a tunnel, out a tunnel, in a tunnel. I keep count. Three hundred and eighty-two steps up to the village. I don't climb them. I wave.",
    look: {skin: "#EAC4A0", hair: "#3A3430", hairStyle: "short", top: "#3E5E7A", bottom: "#2F2B28", hat: "cap"},
    routine: [slot("7:00", "22:00", "ct_corniglia", [[380, 550], [430, 550]])],
    lines: ["Last train to Honeybrook at ten. Run if you must. Don't run on the steps.", "The tunnels are older than my grandfather. So am I, nearly.", "Lemon? Franca gives me a bag every week. I don't even like lemons.", "From the platform you can see all five villages on a clear day. Today: four and a half."],
    away: "Signor Rossi's in his office with an espresso."
  },
  {
    id: "nino", local: "cinque", pitch: 0.68, name: "Nino", job: "Plays bocce in the piazza, every afternoon",
    intro: "Nino. Retired. Very busy. Bocce at eleven, lunch at one, bocce at three. You play? No? Your friends play, I think. I see it in their eyes.",
    look: {skin: "#C99A78", hair: "#E6E2DA", hairStyle: "short", top: "#F3E7C8", bottom: "#5A4A3E", hat: "cap"},
    routine: [slot("10:30", "13:00", "ct_vernazza", [270, 470], {act: "bocce", dir: 1}), slot("15:00", "19:00", "ct_vernazza", [270, 470], {act: "bocce", dir: 1})],
    lines: ["Close to the little ball. That's all. That's the whole game. It takes a lifetime.", "Sixty years in this piazza. I've seen everything. Twice.", "Your friend with the flowers! Ha! She's good. Too good. I'll beat her tomorrow.", "Siesta is not lazy. Siesta is wisdom."],
    away: "Nino's home for lunch and a sleep."
  },
  // Ornella (id "ornella"): a Vernazza local the player meets on the trip and can keep as a pen pal. Seventy-two, a
  // retired ferry captain (thirty-one years bringing the coast ferry into the harbour), now "on shore leave,
  // indefinitely". Lives on the second floor of the yellow house by the harbour. Brisk, salty, warm and funny; a
  // little verse in her notebook every morning, the Corniglia steps, a swim at Monterosso whatever the weather, and
  // the sunset on the harbour wall with Dario, her old deckhand. White hair in a bun, a navy jumper, a captain's cap.
  {
    id: "ornella", local: "cinque", pitch: 1.0, name: "Ornella", job: "Retired ferry captain. Writes verses at the café, swims every day",
    intro: "Ornella. Thirty-one years I brought the ferry into this harbour, and not once did I scrape the paint. You came by train? A pity. The sea is the proper front door. I'm in the yellow house by the harbour, second floor, geraniums. Wave when you pass. I'll be watching the boats anyway.",
    look: {skin: "#E8C2A0", hair: "#E6E2DA", hairStyle: "bun", top: "#2E3A5A", sleeves: "#2E3A5A", bottom: "#F3E7C8", hat: "cap"},
    routine: [slot("8:00", "10:30", "ct_vernazza", [332, 296], {act: "poem", dir: -1}), slot("10:30", "12:30", "ct_corniglia", [[372, 420], [300, 460], [400, 380]]),
      slot("12:30", "14:00", "ct_focacceria", [[200, 520], [330, 540]]), slot("14:00", "16:30", "ct_monterosso", [[200, 480], [340, 470], [260, 420]]),
      slot("16:30", "18:00", "ct_gelato", [[200, 500], [330, 520]]), slot("18:00", "21:45", "ct_vernazza", [222, 418], {act: "sit", dir: -1})],
    hellos: ["Ah, there you are. Sit. The coffee's coming, whether you want it or not.", "Ciao! The wind's gone round to the south, and now you're here. The day's improving.", "Come and judge the boats with me. Half of them are moored like amateurs."],
    lines: [
      "Thirty-one years on the ferry. I can tell the weather by the colour of the church bell. Today: fair, with a chance of tourists.",
      "Three hundred and eighty-two steps up to Corniglia. I'm seventy-two, and I still pass the young ones on the way up. I say 'buongiorno' very cheerfully as I go by.",
      "I swim at Monterosso every day, January too. The sea is cold and I am stubborn. We have an understanding.",
      "Dario was my deckhand once. Sixteen, all elbows, seasick on a flat calm. Now he mends every engine in the harbour. I take all the credit.",
      "A good knot is a kind of poem. It says exactly what it means, and it holds.",
      "Retired? I'm not retired. I'm on shore leave. Indefinitely.",
      "The houses go pink at six. I saw it ten thousand times from the wheelhouse, and I still stop whatever I'm doing.",
      "Never trust a cloud shaped like an anvil, or a man who ties up with a granny knot.",
      "My barometer has said 'change' since 1984. One day it'll be right, and it'll be unbearable about it.",
      "One must have a little ritual. Mine is a coffee, four lines in my notebook, and pretending I'm not inspecting everybody's mooring.",
      "The first time I saw you, you were on the harbour wall with your map upside down. I liked you at once."
    ],
    actLines: {poem: ["Hush. I need a rhyme for 'starboard'. 'Cupboard' is the best I have, and I'm not proud of it.", "Today's verse is about the cat on Aldo's boat. He's a better sailor than Aldo. That's the whole verse.", "Four lines a morning. The first three come easily. The fourth I have to chase round the harbour."],
      sit: ["Watch the lights come on in the houses, one by one, like boats coming home.", "Dario says a sunset is just science. I say so is a good engine, and he loves those.", "Stay a while. The last train's at ten. I know the timetable by heart."]},
    away: "Ornella's upstairs. Her balcony door is open, and a radio's reading out the shipping forecast."
  },
  // Dario (id "dario"): Vernazza's boat mechanic, in his late twenties; once Ornella's deckhand on the ferry. Cheerful,
  // chatty, learning English from old films and collecting idioms (which he gets nearly right). Another pen pal.
  {
    id: "dario", local: "cinque", pitch: 0.8, name: "Dario", job: "Mends the fishing boats' engines in Vernazza. Collects English idioms",
    intro: "Ciao! Dario. I fix the engines on the boats. You speak English? Fantastic. I am learning. Ornella says I speak like an old film. Anyway, nice to meet you: it's a piece of pie! No. Cake. A piece of cake. You see? Learning.",
    look: {skin: "#C99A78", hair: "#1E1A18", hairStyle: "curly", top: "#C9483A", bottom: "#3E5E7A"},
    routine: [slot("8:00", "13:00", "ct_vernazza", [[200, 440], [180, 470], [230, 450]]), slot("15:00", "18:00", "ct_vernazza", [[200, 440], [230, 450]]), slot("18:00", "21:45", "ct_vernazza", [246, 420], {act: "sit", dir: -1})],
    lines: ["Ornella was my captain when I was sixteen. I was sick over the side every day for a month. She never told anybody. Now she tells everybody.", "Today's idiom: 'it's raining cats and dogs'. Very strange. Here it only rains water. And sometimes lemons, in a strong wind.",
      "This engine is older than me. It's also more stubborn than Ornella. Almost.", "Every evening, the harbour wall, the sunset. Ornella names the stars. I name the engines I can hear. We are both right.",
      "When I finish an engine I say 'Bob's your uncle'. Nobody here has an uncle Bob. It's still very satisfying."],
    away: "Dario's out in a boat, fixing somebody's engine. You can hear him singing over the motor."
  },
  // round 134: the people who keep each room busy all day (the town playbook: 2-4 people in every room)
  {
    id: "ilaria", local: "cinque", pitch: 1.08, name: "Ilaria", job: "Beppe's daughter, on the focacceria counter",
    intro: "Ilaria. Papà bakes, I sell, and when he sleeps in the afternoon I sell what's left. There's always something left. Usually the onion.",
    look: {skin: "#EAC4A0", hair: "#3A2A20", hairStyle: "long", top: "#F3D98A", bottom: "#5A4A3E", extra: "apron"},
    routine: [slot("8:00", "19:00", "ct_focacceria", [[460, 420], [430, 440]])],
    lines: ["Plain, onion or olive? Or all three. Most people say all three.", "Papà's been lighting that oven since before I was born. I'm not allowed to touch it.", "Farinata's best hot. Eat it now, here, standing up."],
    away: "Ilaria's gone home. The focacceria shutters are down."
  },
  {
    id: "marta", local: "cinque", pitch: 1.04, name: "Marta", job: "Grows the basil for Nonna Pina",
    intro: "Marta. I grow the basil on the terrace above the kitchen. Nonna Pina checks every leaf. Every single leaf.",
    look: {skin: "#E2B590", hair: "#5A3A2A", hairStyle: "bun", top: "#9CC27E", bottom: "#3A3430"},
    routine: [slot("9:30", "17:30", "ct_pesto", [[120, 470], [400, 470], [440, 520]])],
    lines: ["Pick it in the morning, before the sun gets cross with it.", "Small leaves. Nonna says the big ones are for tourists. Don't tell the tourists.", "The pine nuts come from the woods up the hill. Toast them? Never. Nonna would faint."],
    away: "Marta's up on the basil terrace."
  },
  {
    id: "carla", local: "cinque", pitch: 0.98, name: "Signora Carla", job: "Bruno's wife, keeps the cantina",
    intro: "Carla. Bruno grows it, I sell it, and I'm the one who remembers to turn the raisins. Taste? A little glass. Very little. It's strong.",
    look: {skin: "#C99A78", hair: "#6B5A4A", hairStyle: "bob", top: "#8A4A5A", bottom: "#3A3430"},
    routine: [slot("9:00", "18:00", "ct_cantina", [[130, 450], [400, 470]])],
    lines: ["Three hundred days, the raisins rest. Then they're wine. Then they're gone in an evening.", "Bruno talks to the vines. I talk to the customers. It works.", "White wine, yes, but the sweet one is our treasure."],
    away: "Signora Carla's closed the cantina for the day."
  },
  {
    id: "enzo", local: "cinque", pitch: 0.78, name: "Enzo", job: "Franca's husband, labels the limoncino",
    intro: "Enzo. Franca does the talking. I do the labels, the corks, the boxes and the agreeing. Mostly the agreeing.",
    look: {skin: "#EAC4A0", hair: "#9A928A", hairStyle: "short", top: "#FFFDF6", bottom: "#3E6BAE", extra: "glasses"},
    routine: [slot("9:30", "18:30", "ct_limoni", [[120, 470], [420, 470]])],
    lines: ["Every label straight. Franca checks.", "The soap is lemon, the towels are lemon, the plates are lemon. I dream in yellow.", "Limoncino in the freezer. Small glass. After dinner. That's the rule."],
    away: "Enzo's gone home with Franca."
  },
  {
    id: "sara", local: "cinque", pitch: 1.12, name: "Sara", job: "Gianni's niece, scooping for the summer",
    intro: "Sara! Zio Gianni lets me scoop in the summer. I'm on my second arm muscle. Which one? Basil's the best, I promise.",
    look: {skin: "#E2B590", hair: "#2A211D", hairStyle: "bobfringe", top: "#FFFDF6", bottom: "#E89A9A", extra: "apron"},
    routine: [slot("12:00", "20:00", "ct_gelato", [[140, 440], [400, 440]])],
    lines: ["Two flavours, and you can have the wafer too.", "Zio says gelato with basil is the Manarola one. I say lemon. We argue every day.", "Careful, it's melting! Lick round the edge."],
    away: "Sara's off at the beach."
  },
  {
    id: "lina", local: "cinque", pitch: 0.88, name: "Signora Lina", job: "Does her shopping round all five villages",
    intro: "Lina. Every day I do my shopping. Bread in Vernazza, lemons in Monterosso, a gelato in Manarola. It takes all day. That's the point.",
    look: {skin: "#E2B590", hair: "#D6D0C6", hairStyle: "bun", top: "#3E6BAE", bottom: "#2F2B28", extra: "satchel"},
    routine: [slot("8:00", "9:30", "ct_focacceria", [[200, 540], [320, 540]]), slot("9:30", "11:00", "ct_vernazza", [[320, 420], [360, 440]]), slot("11:00", "12:30", "ct_pesto", [[200, 540], [320, 560]]),
      slot("13:30", "15:30", "ct_limoni", [[200, 540], [320, 560]]), slot("15:30", "17:00", "ct_gelato", [[200, 520], [320, 540]]), slot("17:00", "18:30", "ct_focacceria", [[200, 540], [320, 540]])],
    lines: ["The bread's better in Vernazza. The lemons are better in Monterosso. So I walk.", "Pina and I were at school together. She was bossy then too.", "Seventy-eight and I take the train like a teenager."],
    away: "Signora Lina's home with her shopping."
  },
  ...[
    ["hannah", "Hannah", {skin: "#F6D9C4", hair: "#C9A06A", hairStyle: "long", top: "#5E8A48", bottom: "#5A4A3E", extra: "satchel", hat: "sunhat"}, "Walking the cliff path, from Edinburgh", "Hannah, from Edinburgh! Walking all five villages in one day. We're on village two. It's eleven o'clock. It's fine.",
      [slot("8:30", "10:30", "ct_vernazza", [[400, 330], [300, 300]]), slot("10:30", "12:30", "ct_corniglia", [[200, 420], [300, 380]]), slot("12:30", "14:00", "ct_focacceria", [[200, 520], [320, 540]]), slot("14:00", "16:00", "ct_manarola", [[262, 420], [200, 460]]), slot("16:00", "18:00", "ct_gelato", [[200, 480], [320, 500]])],
      ["The cliff path's closed past Corniglia. We're taking the train. Don't tell my dad.", "I've had focaccia three times and it's not even lunch.", "Every corner, another postcard. I've stopped taking photos. Almost."]],
    ["tom", "Tom", {skin: "#F2D3BC", hair: "#8A5A3A", hairStyle: "short", top: "#3E6BAE", bottom: "#5A4A3E", extra: "satchel"}, "Walking the cliff path with Hannah", "Tom. Hannah's idea, the five villages in one day. My legs voted against.",
      [slot("8:30", "10:30", "ct_vernazza", [[420, 340], [320, 310]]), slot("10:30", "12:30", "ct_corniglia", [[220, 430], [320, 390]]), slot("12:30", "14:00", "ct_focacceria", [[220, 530], [340, 540]]), slot("14:00", "16:00", "ct_manarola", [[282, 430], [220, 470]]), slot("16:00", "18:00", "ct_gelato", [[220, 490], [340, 500]])],
      ["Three hundred and eighty-two steps from the station. I counted every one. Out loud.", "The monorail looks terrifying. I want a go.", "Is basil gelato a dare? It feels like a dare."]],
    ["colette", "Colette", {skin: "#F6D9C4", hair: "#2A211D", hairStyle: "bob", top: "#F3E7C8", bottom: "#3E5E7A", extra: "sketchbook", hat: "sunhat"}, "A painter from Lyon", "Colette, from Lyon. I paint. Here, I don't know where to point the brush. Everywhere is the picture.",
      [slot("9:00", "12:00", "ct_manarola", [440, 420], {act: "sketch", dir: -1}), slot("12:00", "13:30", "ct_pesto", [[200, 540], [320, 560]]), slot("13:30", "17:00", "ct_vernazza", [400, 460], {act: "sketch", dir: -1}), slot("17:00", "19:00", "ct_limoni", [[200, 520], [320, 540]])],
      ["The colours change every hour. The houses don't. The light does.", "I've used up all my yellow. Again.", "The fishermen let me paint their boats. Not a picture of them. The actual boats."]],
    ["giulia", "Giulia", {skin: "#EAC4A0", hair: "#3A2A20", hairStyle: "long", top: "#E89A9A", bottom: "#FFFDF6"}, "On holiday from Milan with her family", "Giulia! From Milan. My nonna is from here, so every summer we come back and she tells everybody I'm too thin.",
      [slot("9:30", "11:30", "ct_monterosso", [[230, 480], [300, 440]]), slot("11:30", "13:00", "ct_limoni", [[200, 520], [320, 540]]), slot("13:00", "15:00", "ct_gelato", [[200, 500], [320, 520]]), slot("15:00", "17:30", "ct_monterosso", [[180, 470], [260, 500]]), slot("17:30", "19:00", "ct_vernazza", [[300, 360], [260, 320]])],
      ["My nonna knows Nonna Pina. Everyone's nonna knows Nonna Pina.", "The beach at Monterosso is the only proper sandy one. Fight for an umbrella.", "In Milan it's all grey. Here, look: every colour."]],
    ["ravi", "Ravi", {skin: "#B9825E", hair: "#1E1A18", hairStyle: "short", top: "#FFFDF6", bottom: "#5A6A7A"}, "On honeymoon, from Bangalore", "Ravi! On our honeymoon. Anika planned everything. I carry the water and say 'wow'. Wow.",
      [slot("9:00", "11:00", "ct_manarola", [[300, 460], [240, 440]]), slot("11:00", "13:00", "ct_monterosso", [[300, 470], [360, 450]]), slot("13:00", "15:00", "ct_cantina", [[200, 520], [320, 540]]), slot("15:00", "17:00", "ct_vernazza", [[320, 400], [280, 330]]), slot("17:00", "19:30", "ct_manarola", [[236, 470], [280, 460]])],
      ["We put a padlock on the lovers' path. Anika made me write our names neatly.", "Sciacchetrà tastes like honey and apricots and a very good decision.", "Sunset from the rocks at Manarola. That's tonight's plan. That's every night's plan."]],
    ["anika", "Anika", {skin: "#B9825E", hair: "#2A211D", hairStyle: "long", top: "#C9483A", bottom: "#FFFDF6", hat: "sunhat"}, "On honeymoon, from Bangalore", "Anika! Honeymoon. I made a spreadsheet. Ravi lost it on day one. It's been the best trip ever.",
      [slot("9:00", "11:00", "ct_manarola", [[320, 470], [260, 450]]), slot("11:00", "13:00", "ct_monterosso", [[320, 480], [380, 460]]), slot("13:00", "15:00", "ct_cantina", [[220, 530], [340, 540]]), slot("15:00", "17:00", "ct_vernazza", [[340, 410], [300, 340]]), slot("17:00", "19:30", "ct_manarola", [[250, 480], [300, 470]])],
      ["The colours! I want to paint our house pink. Ravi says no. We'll see.", "Pesto with Nonna Pina was the best hour of my life. Sorry, Ravi.", "The little train goes in and out of tunnels like a needle through cloth."]],
    ["finn", "Finn", {skin: "#F6D9C4", hair: "#E8C48E", hairStyle: "short", top: "#9CC27E", bottom: "#3A3430", extra: "satchel"}, "Backpacking round Italy", "Finn! Six weeks round Italy with one rucksack and a lot of focaccia. This is my favourite stop. Don't tell Rome.",
      [slot("9:00", "11:00", "ct_corniglia", [[300, 400], [240, 430]]), slot("11:00", "13:00", "ct_vernazza", [[300, 320], [360, 420]]), slot("13:00", "15:00", "ct_focacceria", [[200, 540], [320, 560]]), slot("15:00", "17:00", "ct_monterosso", [[200, 460], [260, 480]]), slot("17:00", "19:00", "ct_gelato", [[200, 480], [300, 500]])],
      ["I'm sleeping in a room above a boat shed. It smells of paint and fish. I love it.", "The anchovies here are a whole different animal. A fish. A whole different fish.", "Three gelatos a day is a reasonable amount. I've checked."]]
  ].map(([id, name, look, job, intro, routine, lines]) => ({id, local: "cinque", tourist: true, pitch: .95 + (id.charCodeAt(0) % 4)*.07, name, job, intro, look, routine, lines, away: `${name}'s off seeing another of the five villages.`})),
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
    hellos: ["Hi! What'll it be?", "Ciao, boss!", "The new flavour's flying out!"],
    away: "Sofia's finished for the day. The counter's closed."
  },
  {
    id: "tomo", pitch: 0.8, name: "Tomo", job: "Serves on the deck and in the Scoop Shack, and rides the delivery bike for all three shops (till 10pm)",
    intro: "Tomo. I carry the cones to the tables, I wipe the tables, I chat. Give me a bike and I'll deliver too.",
    look: {skin: "#D9A882", hair: "#1F1A17", hairStyle: "short", top: "#FFFDF6", bottom: "#5E5A55", extra: "apron"},
    routine: [slot("10:00", "11:30", "scoopshop", [[200, 440], [380, 450], [140, 560], [300, 560]], {act: "cone"}), slot("11:30", "13:00", "bay", [[150, 440], [230, 440], [200, 312], [262, 380]], {act: "cone"}),
      slot("13:00", "13:45", "bay", [222, 352], {act: "sit"}), slot("13:45", "15:30", "scoopshop", [[200, 440], [380, 450], [140, 560], [300, 560]], {act: "cone"}),
      slot("15:30", "18:00", "bay", [[150, 440], [230, 440], [200, 312], [262, 380]], {act: "cone"}),
      slot("18:00", "22:00", "bay", [[262, 380], [300, 400]])],   // round 155: evenings, just the bike (late-night suppers)
    lines: ["Table four wants another round. Table four always wants another round.", "Best view in the village, this deck.", "Napkins! Who needs napkins?", "I dream in pistachio.", "Tía Pilar brings jamón back from Ronda. Most of it reaches the kitchen."],
    actLines: {cone: ["Two cones for the deck, coming through!", "Mind the drips!", "Anyone for a waffle?", "Enjoy! Don't let the gulls see."]},
    away: "Tomo's off for the day."
  },
  // Phase 4: the haberdasher and the tailor, in what were Lin's cottage and Juniper's house on Makers' Lane (tailor.js).
  // Both open nine thirty to half past five, every day but Sunday, and live upstairs.
  {
    id: "ada", pitch: 1.1, name: "Ada", job: "Runs the haberdashery on Makers' Lane",
    intro: "Ada. Haberdasher. Fabric by the piece, buttons by the card, and advice for nothing. Gingham's half the reason I get up in the morning.",
    look: {skin: "#F2D3BC", hair: "#D9D4CC", hairStyle: "bun", top: "#C98AA8", bottom: "#4F5A6A", extra: "glasses"},
    routine: [slot("9:30", "17:30", "haberdash", [[400, 500], [260, 420], [420, 300]], {dow: [1, 2, 3, 4, 5, 6]}), slot("7:30", "9:00", "village", [[362, 372], [340, 380]], {dow: [1, 2, 3, 4, 5, 6]}),
      slot("10:00", "12:00", "market", [[200, 470], [320, 480]], {dow: [0]}), slot("14:00", "16:00", "flowers", [[160, 300], [260, 380]], {dow: [0]}),
      slot("17:30", "19:00", "lane", [[262, 400], [200, 380], [330, 390]]), slot("19:00", "22:00", "haberdash", [130, 500], {act: "sit"})],
    lines: ["Linen creases. That's how you know it's linen.", "Every button in that jar has a story. Most of them are about coats.", "Gingham never goes out of fashion. It never came in, either. It just stayed.",
      "Measure twice. Then ask me, and I'll measure a third time.", "Idris next door makes the clothes. I make the decisions about the fabric."],
    away: "Ada's shut the haberdashery for the day. The window display's still lit."
  },
  {
    id: "idris", pitch: 0.8, name: "Idris", job: "The tailor on Makers' Lane",
    intro: "Idris. Tailor. I make things that fit. Bring me fabric from Ada next door, tell me what you'd like, and come back tomorrow.",
    look: {skin: "#8D5B3E", hair: "#1E1A18", hairStyle: "short", top: "#3E4A5C", bottom: "#2F2B28", extra: "tie"},
    routine: [slot("9:30", "17:30", "tailor", [[400, 500], [130, 500], [260, 430]], {dow: [1, 2, 3, 4, 5, 6]}), slot("7:00", "8:30", "hwoods", [[100, 330], [200, 318], [300, 300]], {dow: [1, 2, 3, 4, 5, 6]}),
      slot("11:00", "13:00", "bay", [[180, 420], [240, 430]], {dow: [0]}), slot("15:00", "17:00", "village", [[362, 372], [226, 420]], {dow: [0]}),
      slot("17:30", "18:30", "village", [[362, 372], [330, 380]]), slot("18:30", "20:00", "wineshop", [[300, 500], [360, 520]], {dow: [5, 6]}), slot("19:00", "22:00", "tailor", [130, 500], {act: "sit"})],
    lines: ["A good hem is invisible. That's the whole point of it.", "I don't hurry. Clothes can tell.", "Stand up straight. No, that's very good. I was talking to the mannequin.",
      "Buttons first, then the buttonholes. Never the other way round.", "Ada chooses the fabric. I just do what it tells me."],
    away: "Idris has put the needle down for the day. Back at half past nine."
  },
  ...BB_PEOPLE,   // round 143: Bellbird Valley (data/bb-people.js)
  ...CR_PEOPLE,   // round 150: the Coast Road (data/cr-people.js)
  ...SW_PEOPLE,   // round 215: Saltwick Harbour (data/sw-people.js)
  ...PI_PEOPLE,   // round 216: Puffin Isle (data/pi-people.js)
  ...HK_PEOPLE,   // round 217: Hokkaido (data/hk-people.js)
  ...TL_PEOPLE,   // round 159: the Tablelands (data/tl-people.js)
  ...LV_PEOPLE,   // round 163: the Lavender Hills (data/lv-people.js)
  ...WEDDING_PEOPLE,   // round 152: the wedding parties on the terrace (data/terrace-people.js)
  ...MILL_PEOPLE   // round 154: the mill's own day-trippers (data/mill-people.js)
];
// Bo and Mr Okada live on Makers' Lane: you'll find them at home in the evening, and Mr Okada before his early walk too.
const HOMES = {bo: [["carpentry", 1200, 1290]], okada: [["okadahouse", 360, 435], ["okadahouse", 1260, 1320]]};
// Auntie Lin and Juniper share the green cottage by the flower-farm gate on the foreshore: evenings at home
{ const n = NPCS.find(x => x.id === "lin"); if (n) n.routine.push(slot("19:00", "22:50", "linjun", [130, 520], {act: "sit"}), slot("22:50", "23:00", "linjun", [470, 352])); }
{ const n = NPCS.find(x => x.id === "juniper"); if (n) n.routine.push(slot("20:00", "22:50", "linjun", [420, 300], {act: "sit"}), slot("22:50", "23:00", "linjun", [470, 360])); }
for (const [id, slots] of Object.entries(HOMES)) { const n = NPCS.find(x => x.id === id); if (n) slots.forEach(([scene, from, to]) => n.routine.push({from, to, scene, wander: [[200, 340], [320, 350], [260, 430]]})); }
// Three houses for six friends: Hana and Theo on the foreshore, Tomi and Posy next door, Farid and Mei in the orchard
// cottage. Their working days stay as they were; these are the mornings and evenings at home (a slot that matches
// earlier in a routine still wins, so a Friday at the wine shop comes first). `first` slots go to the front.
const AT_HOME = {
  hana: [slot("18:00", "19:00", "shore", SHORE_WALK, {dow: [2, 4]}), slot("19:00", "22:50", "hanatheo", [270, 476], {act: "sit"}), slot("22:50", "23:00", "hanatheo", [454, 352]),
    slot("6:45", "7:45", "shore", SHORE_WALK, {dow: [0, 2, 3, 5, 6]})],
  theo: [slot("7:00", "8:45", "shore", [212, 372], {act: "type", dir: -1}), slot("8:45", "9:00", "village", [[230, 420], [300, 470]]),
    slot("19:00", "22:50", "hanatheo", [112, 292], {act: "type", dow: [0, 2, 4, 6]}), slot("19:00", "22:50", "hanatheo", [262, 300], {act: "type"}), slot("22:50", "23:00", "hanatheo", [434, 360])],
  farid: [slot("7:00", "8:00", "cottage", [[300, 330], [200, 360]]), slot("17:30", "22:50", "cottage", [398, 352], {act: "sit"}), slot("22:50", "23:00", "cottage", [66, 352])],
  mei: [slot("6:30", "7:45", "field", [76, 300], {act: "fish", dow: [1, 3], dir: 1}), slot("17:30", "18:30", "orchard", [[160, 330], [260, 420], [360, 510]], {act: "water"}),
    slot("18:30", "22:50", "cottage", [458, 358], {act: "sit"}), slot("22:50", "23:00", "cottage", [86, 360])],
  tomi: [slot("8:30", "9:30", "shore", SHORE_WALK, {dow: [1, 2, 3, 4, 5, 6]}), slot("16:00", "17:00", "shore", SEA, {dow: [0, 6], act: "sup", free: true}),
    slot("17:00", "18:00", "shore", SHORE_WALK), slot("18:00", "22:50", "tomiposy", [90, 428], {act: "game"}), slot("22:50", "23:00", "tomiposy", [454, 362])],
  posy: [slot("8:00", "9:45", "tomiposy", [322, 302], {act: "type"}), slot("18:00", "19:00", "shore", SHORE_WALK, {dow: [0, 2, 3, 4]}),
    slot("19:00", "22:50", "tomiposy", [132, 428], {act: "sit"}), slot("22:50", "23:00", "tomiposy", [434, 370])]
};
// Farid's afternoon tea at the cottage (core.js haveTea) comes before his orchard shift
const FIRST = {farid: [slot("15:00", "16:00", "cottage", [154, 564], {act: "sit"})]};
for (const [id, slots] of Object.entries(AT_HOME)) { const n = NPCS.find(x => x.id === id); if (n) n.routine.push(...slots); }
for (const [id, slots] of Object.entries(FIRST)) { const n = NPCS.find(x => x.id === id); if (n) n.routine.unshift(...slots); }

// Agent NPCs: one per automation. `from` on a mail item picks the messenger (unknown -> postie).
// round 154: Grace, staying the season with her gran Hazel, has a week too (her Sunday stall comes from tours.js)
{ const g = NPCS.find(n => n.id === "grace"); if (g) g.routine = [slot("9:00", "10:30", "village", [[362, 372], [392, 360], [340, 380]], {dow: [1, 2, 3, 4, 5, 6]}),
  slot("11:00", "12:00", "hlane", [[250, 300], [300, 320]], {dow: [1, 2, 3, 4, 5, 6]}),
  slot("14:00", "16:00", "shore", [[214, 300], [200, 380], [220, 520]], {dow: [1, 3, 5]}), slot("14:00", "16:00", "cocoa", [[200, 450], [320, 470]], {dow: [2, 4, 6]})]; }
export const AGENTS = {
  crier:    {name: "Rosa the town crier", look: {skin: "#EDC6A6", hair: "#8A3B2A", hairStyle: "bun", top: "#C2505F", bottom: "#3A2E28", extra: "bell"}, hello: "Hear ye! The weekend paper!", helloTown: "Hear ye! Your paper's still in your letterbox, so I've brought the news to town!"},
  postie:   {name: "Penny the postie", look: {skin: "#F2D3BC", hair: "#B5562E", hairStyle: "bob", top: "#6E9FD6", bottom: "#2F3B73", extra: "cap"}, hello: "Post! A letter for you."},
  winddown: {name: "Lark the evening messenger", look: {skin: "#EDC6A6", hair: "#2B2320", hairStyle: "long", top: "#9AA9DD", bottom: "#2F3B73", extra: "lantern"}, hello: "Time to close the day. A note for you."}
};
