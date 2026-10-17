// The guest room (phase 3 of the public edition): friends from your address book come to Honeybrook for three days.
// Each stay follows a written plan: the day they arrive, one whole day in the village, and the morning they go home.
// There are two plans for the middle day (an outdoors one and a gentle one), picked by who's visiting. Each slot has a
// line for the guest book ("plan") and the place they'll be; game/guests.js turns them into NPC slots.
const hm = s => { const [h, m] = s.split(":").map(Number); return h*60 + (m || 0); };
const at = (from, to, scene, where, plan, opts) => Object.assign({from: hm(from), to: hm(to), scene, plan}, Array.isArray(where[0]) ? {wander: where} : {at: where}, opts || {});

// in the guest room: asleep under the patchwork quilt, then up and pottering
const NIGHT = [at("0:00", "7:00", "guestroom", [176, 330], "Asleep in the guest room", {act: "doze", night: true}),
  at("22:30", "24:00", "guestroom", [176, 330], "Asleep in the guest room", {act: "doze", night: true})];

export const GUEST_DAYS = {
  // day one: off the morning train, a look round, settling in
  arrive: [
    at("10:30", "11:15", "hlane", [[300, 300], [250, 300], [200, 320]], "Off the 10:30 train at Honeybrook station"),
    at("11:15", "12:30", "market", [[200, 470], [320, 480], [260, 500]], "A look round Hana's market"),
    at("12:30", "14:00", "bay", [[180, 420], [262, 380]], "Lunch on the deck at the bay"),
    at("14:00", "15:30", "guestroom", [[300, 460], [200, 420]], "Unpacking in the guest room"),
    at("15:30", "17:30", "orchard", [[160, 330], [260, 420], [360, 510]], "A wander round the orchard with Farid"),
    at("17:30", "19:00", "base", [[230, 350], [340, 526]], "Sitting out in your garden"),
    at("19:00", "21:00", "wineshop", [[300, 500], [227, 518]], "Supper at the wine shop"),
    at("21:00", "22:30", "home", [[200, 330], [300, 460]], "Tea and talking in the living room"),
    ...NIGHT],
  // the whole day, outdoors: woods, the field, the foreshore, the vineyard
  out: [
    at("7:00", "8:30", "home", [[300, 460], [200, 330]], "Breakfast at yours"),
    at("8:30", "10:00", "hwoods", [[132, 590], [100, 330], [214, 266]], "An early walk in the woods"),
    at("10:00", "12:00", "field", [[200, 420], [96, 352], [260, 400]], "Feeding the swans on the field"),
    at("12:00", "13:30", "village", [[362, 372], [226, 420], [330, 380]], "Lunch in the town square"),
    at("13:30", "15:30", "shore", [[214, 300], [212, 372], [240, 300]], "Out on the foreshore, looking for dolphins"),
    at("15:30", "17:30", "vineyard", [[262, 440], [262, 390], [300, 260]], "Through the vineyard rows"),
    at("17:30", "19:00", "bay", [[150, 440], [180, 420]], "An ice cream at the bay"),
    at("19:00", "22:30", "home", [[200, 330], [300, 460]], "Cards at the round table", {act: "sit"}),
    ...NIGHT],
  // the whole day, gently: the market, the flowers, a book, the wine shop
  slow: [
    at("7:00", "9:30", "home", [[300, 460], [200, 330]], "A slow breakfast at yours"),
    at("9:30", "11:00", "village", [[362, 372], [330, 380], [300, 214]], "Postcards on a bench in the square"),
    at("11:00", "12:30", "flowers", [[160, 300], [160, 380], [260, 380]], "Picking a posy with Mei"),
    at("12:30", "14:00", "market", [[200, 470], [320, 480]], "Honey toast at Hana's market"),
    at("14:00", "16:00", "guestroom", [[300, 460], [200, 420]], "A nap and a book in the guest room"),
    at("16:00", "18:00", "lane", [[262, 600], [200, 560], [320, 580]], "Poking round Makers' Lane"),
    at("18:00", "21:00", "wineshop", [[300, 500], [227, 518]], "A long supper at the wine shop"),
    at("21:00", "22:30", "base", [[230, 350], [340, 526]], "Stars from your garden"),
    ...NIGHT],
  // the last morning: breakfast, a present to take home, the 11 o'clock train
  leave: [
    at("0:00", "7:00", "guestroom", [176, 330], "Asleep in the guest room", {act: "doze", night: true}),
    at("7:00", "9:00", "home", [[300, 460], [200, 330]], "A last breakfast at yours"),
    at("9:00", "10:30", "village", [[362, 372], [226, 420]], "Shopping for something to take home"),
    at("10:30", "11:00", "hlane", [[300, 300], [250, 300]], "The 11 o'clock train home")]
};
export const ARRIVE = hm("10:30"), LEAVE = hm("11:00");

// what a guest says while they're here, by where they are (any guest), and a few by where they're from
export const GUEST_LINES = {
  any: ["I could get used to this.", "Everyone here says hello. Everyone!", "Thank you for having me. Really.", "I've written four postcards already.", "Your pet has adopted me. I think."],
  guestroom: ["The quilt is perfect. I slept like a stone.", "I've put my things in the top drawer. Is that all right?", "There's a sprig of lavender on the pillow. You thought of everything."],
  home: ["Your kitchen smells of toast. Good sign.", "More tea? I'll make it. I know where the cups are now.", "Deal me in. I warn you, I'm ruthless at cards."],
  base: ["What a garden. Did you plant all this?", "Look at that sky.", "Listen. Nothing but birds."],
  market: ["Hana gave me a free dumpling. And a hug.", "I want one of everything.", "Honey toast. I see why people talk about it."],
  orchard: ["Farid's told me the name of every tree.", "He's sending me home with a cake. Possibly two."],
  flowers: ["Mei sings to them, did you know? Very quietly.", "I've never smelled roses like it."],
  bay: ["Dolphins! Over there! Oh. A wave. Still lovely.", "Best lunch I've had all year."],
  village: ["The town hall clock is three minutes slow. Theo says it's tradition.", "What a square. You could sit here all day."],
  wineshop: ["A glass of your own wine? Go on then.", "These are your vines? I'm very impressed."],
  field: ["The swans have no manners at all. I love them.", "Shall we come back for the movie on the field?"],
  hwoods: ["So quiet. Just the brook.", "I'm sure I saw a deer. Or a very big dog."],
  shore: ["Salt air. I'm sleeping well tonight.", "Hana and Theo's blue house! It's just like the postcards."],
  vineyard: ["Rows and rows. Which one's the oldest?"],
  lane: ["Bo showed me his workshop. It smells of sawdust and big ideas, he says."],
  hlane: ["What a sweet little station.", "Here I am! I'd know that brook anywhere from your letters."],
  bellbird: ["It's so green here after the valley.", "No campervans in the lane? I'll miss mine."],
  coast: ["No surf here, but I'll forgive you.", "Your foreshore's calmer than ours. I like it."],
  tablelands: ["It's warmer down here than at home.", "Not a single cassowary. Very relaxing."],
  lavender: ["Your flower farm would make our lavender jealous.", "I brought you a lavender bag. It's in the guest room."],
  ronda: ["No gorge, but such a lovely brook.", "It's quieter than Ronda. I'm sleeping like a baby."],
  kyoto: ["Your village has its own kind of calm. Like a temple garden.", "I've been bowing to everyone. They bow back!"],
  jeju: ["No black stones here, but the wind's just as friendly.", "Not one tangerine tree. Farid says he'll fix that."],
  cinque: ["No terraces, no cliffs, and I love it anyway.", "The coffee's different. I'll say no more."],
  saltwick: ["No steps! I keep looking for steps. Your village is so flat and kind.", "I brought kippers. Sid insisted. They're in your fridge, sorry about the smell."],
  puffin: ["So many trees! And not one puffin. I keep looking at the ground for burrows.", "It's so still here. I keep waiting for the wind to start."],
  hokkaido: ["It's so warm here! I've taken off two jumpers.", "No soft-serve stand on every corner. How do you live?"],
  bali: ["Where are your offerings? I made you one for the doorstep.", "It's so cool here at night! I'm wearing all my sarongs at once."]
};
