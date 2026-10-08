// More things to buy at the market stalls: each stall keeps a signature item (the first in its tours.js list) and
// rotates a few more from its pool, so no two market days offer quite the same things (core.js stallItems).
// Every good is a gift. art: [icon shape, colour, second colour] drawn by icons.js (marketIcon). Nothing with dairy
// goes to Marcus (lactose intolerant), so dairy things name who they suit instead of "family".
const NOM = ["evan", "darren", "mama", "gonggong", "mum", "dad", "angelina"];   // everyone but Marcus
const G = (n, to, price, tab, say, art, says) => ({n, kind: "gift", to, price, tab, say, art, ...(says ? {says} : {})});
export const GOODS = {
  // ---- Sunday farmers market ----
  // Elena: cheese and olives
  cheddar: G("Aged cheddar wedge", ["darren", "dad", "gonggong"], 9, "market", "A wedge of aged cheddar! Crumbly and sharp.", ["wedge", "#F3C969"], {darren: "Cheese and crackers tonight. Sorted."}),
  olivejar: G("Jar of marinated olives", ["darren", "dad", "mum", "angelina", "marcus"], 8, "market", "Marinated olives, with garlic and herbs.", ["jar", "#7D8F45", "#E8D3A6"], {marcus: "Olives! Healthy fats, Zeh. Approved."}),
  figjam: G("Fig and walnut jam", "family", 7, "market", "Fig jam! That's going on everything.", ["jar", "#7A4A6E", "#F4EEE3"]),
  crackers: G("Rosemary crackers", "family", 5, "market", "Rosemary crackers, still crisp.", ["box", "#E3C59F", "#9CC27E"]),
  goatcheese: G("Herbed goat's cheese", ["darren", "mum", "angelina", "dad"], 9, "market", "Soft goat's cheese rolled in herbs.", ["wheel", "#FFFDF6", "#9CC27E"]),
  // Felix: honey and bee things
  lavhoney: G("Lavender honey", "family", 9, "market", "Lavender honey! It tastes like a garden.", ["jar", "#C9A3E0", "#E8D3A6"]),
  honeysticks: G("Honey sticks", ["evan", "angelina", "mama", "gonggong"], 4, "market", "Honey straws! Bite the end and slurp.", ["sticks", "#F3C969"], {evan: "HONEY STRAWS! Can I have all of them?"}),
  lipbalm: G("Beeswax lip balm", ["mum", "angelina", "mama"], 5, "market", "Beeswax lip balm. Smells like honey.", ["tube", "#F3D98A"]),
  beewraps: G("Beeswax food wraps", ["mama", "mum", "darren"], 8, "market", "Beeswax wraps for the leftovers. No more cling film.", ["cloth", "#F3C969", "#E8566C"], {mama: "Aiyo, so clever! Ma Ma's using these for the kueh."}),
  honeylemon: G("Honey lemon cordial", "family", 7, "market", "Honey lemon cordial. Add hot water, feel better.", ["bottle", "#F3D34A"]),
  mead: G("Bottle of mead", ["darren", "dad", "gonggong"], 12, "market", "Honey wine! The oldest drink there is.", ["bottle", "#E3A23A"]),
  // Grace: handmade soap
  soap_oat: G("Oat and milk soap", ["darren", "mama", "gonggong", "mum", "angelina"], 6, "market", "Oat and milk soap, gentle as anything.", ["soap", "#F3E7C9"]),
  soap_citrus: G("Citrus soap", "family", 6, "market", "Citrus soap! Smells like oranges.", ["soap", "#F3B33A"]),
  bathbomb: G("Bath bomb", ["evan", "mum", "angelina", "mama"], 5, "market", "A fizzy bath bomb!", ["ball", "#C9A3E0", "#F4C7CF"], {evan: "It FIZZES! Bath time NOW!"}),
  shampoobar: G("Shampoo bar", ["darren", "mum", "angelina", "marcus"], 7, "market", "A shampoo bar. No plastic bottle!", ["soap", "#9FD3C2"]),
  handcream: G("Rose hand cream", ["mama", "mum", "angelina"], 8, "market", "Rose hand cream, for after the garden.", ["tube", "#F2A0B8"]),
  bathsalts: G("Lavender bath salts", ["mum", "angelina", "mama", "darren"], 7, "market", "Bath salts. A long soak tonight.", ["jar", "#C9A3E0", "#FFFDF6"]),
  soap_dino: G("Dinosaur soap", "evan", 5, "market", "A DINOSAUR SOAP! RAWR in the bath!", ["soap", "#9CC27E"]),
  loofah: G("Natural loofah", ["darren", "mum", "mama"], 4, "market", "A loofah. Grown, not made!", ["loaf", "#E3D29A"]),
  soycandle: G("Fig soy candle", ["mum", "angelina", "mama", "darren"], 9, "market", "A fig-scented candle in a tin.", ["candle", "#7A4A6E"]),
  // Ben: craft beer
  gingerbeer: G("Ginger beer", "family", 5, "market", "Fiery ginger beer, no alcohol.", ["bottle", "#E3B06A"], {evan: "It's SPICY lemonade!"}),
  lager: G("Craft lager", ["darren", "gonggong", "dad", "marcus"], 7, "market", "A crisp craft lager.", ["bottle", "#F3D34A"]),
  cider: G("Apple cider", ["darren", "dad", "angelina", "marcus"], 8, "market", "Dry apple cider, pressed up the hill.", ["bottle", "#B9D98A"]),
  rootbeer: G("Root beer", ["evan", "darren", "marcus"], 4, "market", "Old-fashioned root beer!", ["bottle", "#6B3A2A"], {evan: "Beer for kids! Fizzy!"}),
  // Dev: bakery
  eggtart: G("Egg tart", NOM, 4, "market", "A warm egg tart! The pastry's so flaky.", ["tart", "#F3C969"], {mama: "Dan tat! Still warm. Ma Ma's favourite."}),
  croissant: G("Butter croissant", NOM, 4, "market", "A croissant, all buttery layers.", ["crescent", "#E3A85A"]),
  bananabread: G("Banana bread", "family", 6, "market", "A slice of banana bread, still warm.", ["loaf", "#C98A4A"]),
  cinnamonbun: G("Cinnamon bun", NOM, 5, "market", "A sticky cinnamon bun!", ["bun", "#C98A4A", "#FFFDF6"]),
  sourdough: G("Sourdough loaf", "family", 9, "market", "A whole sourdough loaf. Crackly crust.", ["loaf", "#D9A86A"], {darren: "Proper bread! Toast for a week."}),
  pineapplebun: G("Pineapple bun", NOM, 4, "market", "A bolo bao! Crumbly sugar top.", ["bun", "#F3C969", "#E3A23A"]),

  // ---- Field fair (last Saturday) ----
  pinklemonade: G("Pink lemonade", "family", 3, "fair", "Pink lemonade! Fizzy and sour.", ["cup", "#F2A0B8"]),
  candyapple: G("Candy apple", ["evan", "angelina", "mama", "mum"], 4, "fair", "A candy apple! Shiny and crunchy.", ["apple", "#C2334D"]),
  popcorn: G("Bag of popcorn", "family", 3, "fair", "Popcorn, salty and sweet.", ["bag", "#FFFDF6", "#E8566C"]),
  cottoncandy: G("Cotton candy", ["evan", "angelina", "mama"], 3, "fair", "Pink cotton candy!", ["cloud", "#F4C7CF"], {evan: "It's a CLOUD I can eat!"}),
  muahchee: G("Muah chee", "family", 4, "fair", "Muah chee, rolled in peanuts.", ["box", "#FFFDF6", "#C98A4A"], {gonggong: "Muah chee! Like the pasar malam last time."}),
  minipancakes: G("Mini pancakes", "family", 4, "fair", "A paper boat of mini pancakes!", ["boat", "#E3A85A"]),

  // ---- Night market ----
  // Yun: Taiwanese street snacks
  popcornchicken: G("Popcorn chicken", ["darren", "marcus", "dad", "gonggong", "evan"], 6, "night", "Taiwanese popcorn chicken, with basil!", ["boat", "#D99A4A"], {marcus: "Protein bites! Zeh, you get me."}),
  pepperbun: G("Pepper bun", ["darren", "dad", "gonggong", "marcus"], 5, "night", "Hu jiao bing, straight off the tandoor wall.", ["bun", "#D9A86A", "#4A3226"]),
  guabao: G("Gua bao", ["darren", "dad", "marcus", "angelina"], 6, "night", "Braised pork in a fluffy bun.", ["bao", "#FFFDF6", "#A8432E"]),
  taroballs: G("Taro ball dessert", "family", 5, "night", "Chewy taro balls in syrup.", ["bowl", "#C9A3E0"]),
  lurourice: G("Braised pork rice", ["darren", "marcus", "dad", "gonggong"], 6, "night", "Lu rou fan! Sticky braised pork on rice.", ["bowl", "#8A5A3A"]),
  oysteromelette: G("Oyster omelette", ["dad", "gonggong", "mama"], 7, "night", "An oyster omelette with sweet chilli sauce.", ["plate", "#F3D98A", "#E8566C"]),
  // Jae: Korean street food
  kimbap: G("Kimbap roll", "family", 5, "night", "Kimbap! Sesame and pickled radish.", ["roll", "#3F4A3B", "#F3D34A"]),
  corndog: G("Korean corn dog", ["evan", "darren", "angelina"], 5, "night", "A corn dog with crispy potato bits!", ["skewer", "#E3A85A"], {evan: "A sausage on a STICK!"}),
  bungeoppang: G("Bungeoppang", "family", 4, "night", "A fish-shaped bun full of red bean!", ["fish", "#D9A86A"]),
  odeng: G("Odeng skewer", ["darren", "dad", "gonggong", "marcus"], 4, "night", "Fish cake skewer in hot broth.", ["skewer", "#F3E7C9"]),
  dalgona: G("Dalgona candy", ["evan", "angelina", "marcus"], 3, "night", "Dalgona! Carve out the star without breaking it.", ["disc", "#E3A23A"]),
  hobakjuk: G("Sweet pumpkin porridge", ["mama", "gonggong", "mum"], 5, "night", "Hobakjuk, warm and sweet.", ["bowl", "#F2A65A"]),
  // Mina: hair things
  hairribbon: G("Silk hair ribbon", ["mum", "angelina", "mama"], 4, "night", "A silk ribbon for my hair!", ["bow", "#E8566C"]),
  pearlband: G("Pearl headband", ["mum", "angelina"], 7, "night", "A pearl headband! So elegant.", ["band", "#FFFDF6"]),
  butterflyclips: G("Butterfly clips", ["angelina", "mum"], 3, "night", "Butterfly clips! So nostalgic.", ["clip", "#9FD3C2"], {angelina: "These were EVERYWHERE when I was little. Love them."}),
  bowclip: G("Velvet bow clip", ["mum", "angelina", "mama"], 5, "night", "A velvet bow clip!", ["bow", "#5E2A44"]),
  hairpins: G("Gold hair pins", ["mum", "angelina", "mama"], 4, "night", "Little gold hair pins. So pretty.", ["pins", "#F3C969"]),
  beadtie: G("Beaded hair ties", ["angelina", "mum"], 3, "night", "Beaded hair ties, every colour.", ["beads", "#C9A3E0"]),
  // Tomas: keychains and charms
  catplush: G("Cat plushie keychain", ["evan", "angelina", "mama"], 5, "night", "A squishy cat keychain!", ["plush", "#F3C969"]),
  enamelpin: G("Enamel pin", ["angelina", "marcus", "darren"], 4, "night", "An enamel pin for my bag!", ["pin", "#7FB8E8"]),
  phonestrap: G("Beaded phone strap", ["angelina", "mum"], 4, "night", "A beaded phone strap. Cute!", ["beads", "#F2A0B8"]),
  starcharm: G("Star charm", ["evan", "angelina", "mum"], 3, "night", "A little star charm that sparkles.", ["star", "#F3C969"]),
  // Sora: socks, hats and tees
  stripesocks: G("Striped socks", "family", 4, "night", "Rainbow striped socks!", ["sock", "#E8566C", "#7FB8E8"]),
  cattee: G("Cat tee", ["angelina", "mum", "evan"], 7, "night", "A tee with a cat on it!", ["tee", "#F4C7CF"]),
  tote: G("Canvas tote bag", ["mum", "angelina", "mama"], 6, "night", "A tote bag! For the market.", ["tote", "#F3E7C9", "#E8566C"]),
  sleepmask: G("Silk sleep mask", ["mum", "angelina", "darren"], 6, "night", "A silk sleep mask. Proper rest.", ["mask", "#C3CDEE"]),
  beanie: G("Knit beanie", ["darren", "marcus", "dad", "gonggong"], 6, "night", "A knit beanie for the aircon.", ["beanie", "#7FA35A"]),
  dinosocks: G("Dinosaur socks", "evan", 3, "night", "DINOSAUR SOCKS!", ["sock", "#9CC27E", "#F3C969"]),
  // Lior: lanterns and lamps (the decor stays; these are gifts)
  minilantern: G("Mini paper lantern", ["mama", "gonggong", "mum", "evan"], 5, "night", "A little paper lantern!", ["lantern", "#E8566C"]),
  starlights: G("Jar of fairy lights", ["angelina", "mum", "evan"], 7, "night", "Fairy lights in a jar! For the bedroom.", ["jar", "#FFF3C4", "#E8D3A6"]),
  rabbitlamp: G("Rabbit night light", "evan", 8, "night", "A bunny night light! It glows!", ["plush", "#FFFDF6"]),
  incense: G("Sandalwood incense", ["mama", "gonggong", "dad"], 4, "night", "Sandalwood incense. Very calming.", ["sticks", "#A8754F"]),
  // Wen: sweets
  dragonbeard: G("Dragon's beard candy", "family", 5, "night", "Dragon's beard candy, like silk threads!", ["box", "#FFFDF6", "#F3C969"]),
  qqballs: G("Sweet potato balls", "family", 4, "night", "QQ sweet potato balls! Crispy and chewy.", ["boat", "#F3B33A"]),
  mangomochi: G("Mango mochi", "family", 5, "night", "Mango mochi, soft and fruity.", ["ball", "#F3B33A", "#FFFDF6"]),
  castella: G("Honey castella", NOM, 6, "night", "A fluffy honey castella cake!", ["loaf", "#F3C969"]),
  // Kai: night drinks
  limejuice: G("Fresh lime juice", "family", 3, "night", "Fresh lime juice with sour plum!", ["cup", "#B9D98A"]),
  soymilk: G("Soy milk", "family", 3, "night", "Fresh soy milk, not too sweet.", ["cup", "#F6EBD2"], {marcus: "Soy milk! No lactose. You remembered."}),
  wintermelon: G("Winter melon tea", "family", 3, "night", "Winter melon tea. Sweet and cooling.", ["cup", "#D9A86A"]),
  chrystea: G("Chrysanthemum tea", ["mama", "gonggong", "dad", "mum"], 3, "night", "Chrysanthemum tea. Good for the eyes!", ["cup", "#F3D34A"]),
  coconutshake: G("Coconut shake", "family", 5, "night", "A coconut shake, straight from the coconut.", ["coconut", "#7FA35A"])
};
// Keepsakes: little things to put on a shelf in Mel's buildings (the Scoop Shack, the wine shop, home, her room, the
// app houses): companions.js places them. Pets: adopted at the market's adoption corner, then given to someone in
// the family, who looks after it on the screen Mel picks (companions.js).
const K = (n, price, line, art) => ({n, kind: "keepsake", price, line, art});
const P = (n, price, line, art, pet) => ({n, kind: "pet", price, line, art, pet, say: "A new friend! I promise to look after it, always."});
Object.assign(GOODS, {
  k_luckycat: K("Lucky cat figurine", 9, "A golden lucky cat, waving for good fortune.", ["plush", "#F3C969"]),
  k_bonsai: K("Tiny bonsai", 12, "A tiny juniper bonsai in a blue pot.", ["bonsai", "#7FA35A", "#7FB8E8"]),
  k_snowglobe: K("Snow globe", 10, "A snow globe with a little village inside.", ["globe", "#C3CDEE"]),
  k_seaglass: K("Jar of sea glass", 7, "Sea glass from the foreshore, in a jar.", ["jar", "#9FD3C2", "#E8D3A6"]),
  k_conelamp: K("Ice cream cone lamp", 11, "A little lamp shaped like a cone. Perfect for a gelato shop.", ["cone", "#F4C7CF"]),
  k_corkowl: K("Wine cork owl", 8, "An owl made of wine corks. Made for a wine shop.", ["owl", "#C9A27E"]),
  k_crane: K("Paper crane mobile", 6, "Paper cranes on threads, turning in the breeze.", ["crane", "#F2A0B8"]),
  k_bell: K("Little brass bell", 6, "A little brass bell for the door.", ["bell", "#E3B04A"]),
  k_terrarium: K("Mossy terrarium", 12, "A tiny world of moss and pebbles in glass.", ["jar", "#7FA35A", "#C3CDEE"]),
  k_honeypot: K("Honey pot ornament", 7, "A ceramic honey pot, with a bee on the lid.", ["jar", "#F3C969", "#F3D34A"]),
  k_teaset: K("Mini tea set", 9, "A doll-sized tea set, cups and all.", ["cup", "#C3E8B8"]),
  k_radio: K("Tiny retro radio", 10, "A little retro radio. It actually plays!", ["radio", "#E8566C"]),
  pet_kitten: P("Kitten", 20, "A ginger kitten, looking for a home.", ["cat", "#F2A65A"], "kitten"),
  pet_puppy: P("Puppy", 25, "A floppy-eared puppy, looking for a home.", ["dog", "#C98A4A"], "puppy"),
  pet_bunny: P("Bunny", 18, "A soft grey bunny, looking for a home.", ["bunny", "#C9C2BA"], "bunny"),
  pet_hamster: P("Hamster", 10, "A round little hamster, looking for a home.", ["hamster", "#E3B06A"], "hamster"),
  pet_goldfish: P("Goldfish", 8, "A goldfish in a bowl, looking for a home.", ["fishbowl", "#F28C3A"], "goldfish"),
  pet_budgie: P("Budgie", 14, "A chirpy blue budgie, looking for a home.", ["bird", "#7FB8E8"], "budgie"),
  pet_tortoise: P("Tortoise", 22, "A slow, wise little tortoise, looking for a home.", ["tortoise", "#7FA35A"], "tortoise"),
  pet_duckling: P("Duckling", 12, "A fluffy yellow duckling, looking for a home.", ["duck", "#F3D34A"], "duckling")
});
// what else each stall keeps in its pool, besides the items in tours.js (keyed by stall keeper)
export const POOLS = {
  market: {noor: ["pet_puppy", "pet_bunny", "pet_hamster", "pet_goldfish", "pet_budgie", "pet_tortoise", "pet_duckling"], elena: ["cheddar", "olivejar", "figjam", "crackers", "goatcheese"], felix: ["k_honeypot", "lavhoney", "honeysticks", "lipbalm", "beewraps", "honeylemon", "mead"],
    grace: ["k_terrarium", "soap_oat", "soap_citrus", "bathbomb", "shampoobar", "handcream", "bathsalts", "soap_dino", "loofah", "soycandle"], ben: ["k_corkowl", "gingerbeer", "lager", "cider", "rootbeer"],
    dev: ["k_teaset", "eggtart", "croissant", "bananabread", "cinnamonbun", "sourdough", "pineapplebun"]},
  fair: {noor: ["pet_puppy", "pet_bunny", "pet_hamster", "pet_goldfish", "pet_budgie", "pet_tortoise", "pet_duckling"], ben: ["pinklemonade", "candyapple"], clara: ["popcorn", "cottoncandy", "muahchee", "minipancakes"]},
  night: {yun: ["popcornchicken", "pepperbun", "guabao", "taroballs", "lurourice", "oysteromelette"], jae: ["kimbap", "corndog", "bungeoppang", "odeng", "dalgona", "hobakjuk"],
    mina: ["hairribbon", "pearlband", "butterflyclips", "bowclip", "hairpins", "beadtie"], tomas: ["k_luckycat", "k_snowglobe", "k_bell", "catplush", "enamelpin", "phonestrap", "starcharm"],
    sora: ["k_radio", "stripesocks", "cattee", "tote", "sleepmask", "beanie", "dinosocks"], lior: ["k_bonsai", "k_crane", "k_seaglass", "minilantern", "starlights", "rabbitlamp", "incense"],
    wen: ["k_conelamp", "dragonbeard", "qqballs", "mangomochi", "castella"], kai: ["limejuice", "soymilk", "wintermelon", "chrystea", "coconutshake"]}
};
