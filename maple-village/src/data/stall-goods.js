// More things to buy at the market stalls: each stall keeps a signature item (the first in its tours.js list) and
// rotates a few more from its pool, so no two market days offer quite the same things (core.js stallItems).
// Every good is a gift. art: [icon shape, colour, second colour] drawn by icons.js (marketIcon). Nothing with dairy
// goes to Marcus (lactose intolerant), so dairy things name who they suit instead of "family".
const NOM = ["bo", "farid", "mei", "hana", "theo", "posy"];   // everyone but Marcus
const G = (n, to, price, tab, say, art, says) => ({n, kind: "gift", to, price, tab, say, art, ...(says ? {says} : {})});
export const GOODS = {
  // ---- Sunday farmers market ----
  // Elena: cheese and olives
  cheddar: G("Aged cheddar wedge", ["bo", "theo", "mei"], 9, "market", "A wedge of aged cheddar! Crumbly and sharp.", ["wedge", "#F3C969"], {bo: "Cheese and crackers tonight. Sorted."}),
  olivejar: G("Jar of marinated olives", ["bo", "theo", "hana", "posy", "tomi"], 8, "market", "Marinated olives, with garlic and herbs.", ["jar", "#7D8F45", "#E8D3A6"], {tomi: "Olives! Healthy fats, Zeh. Approved."}),
  figjam: G("Fig and walnut jam", "family", 7, "market", "Fig jam! That's going on everything.", ["jar", "#7A4A6E", "#F4EEE3"]),
  crackers: G("Rosemary crackers", "family", 5, "market", "Rosemary crackers, still crisp.", ["box", "#E3C59F", "#9CC27E"]),
  goatcheese: G("Herbed goat's cheese", ["bo", "hana", "posy", "theo"], 9, "market", "Soft goat's cheese rolled in herbs.", ["wheel", "#FFFDF6", "#9CC27E"]),
  // Felix: honey and bee things
  lavhoney: G("Lavender honey", "family", 9, "market", "Lavender honey! It tastes like a garden.", ["jar", "#C9A3E0", "#E8D3A6"]),
  honeysticks: G("Honey sticks", ["posy", "farid", "mei"], 4, "market", "Honey straws! Bite the end and slurp.", ["sticks", "#F3C969"], {}),
  lipbalm: G("Beeswax lip balm", ["hana", "posy", "farid"], 5, "market", "Beeswax lip balm. Smells like honey.", ["tube", "#F3D98A"]),
  beewraps: G("Beeswax food wraps", ["farid", "hana", "bo"], 8, "market", "Beeswax wraps for the leftovers. No more cling film.", ["cloth", "#F3C969", "#E8566C"], {farid: "Aiyo, so clever! Ma Ma's using these for the kueh."}),
  honeylemon: G("Honey lemon cordial", "family", 7, "market", "Honey lemon cordial. Add hot water, feel better.", ["bottle", "#F3D34A"]),
  mead: G("Bottle of mead", ["bo", "theo", "mei"], 12, "market", "Honey wine! The oldest drink there is.", ["bottle", "#E3A23A"]),
  // Grace: handmade soap
  soap_oat: G("Oat and milk soap", ["bo", "farid", "mei", "hana", "posy"], 6, "market", "Oat and milk soap, gentle as anything.", ["soap", "#F3E7C9"]),
  soap_citrus: G("Citrus soap", "family", 6, "market", "Citrus soap! Smells like oranges.", ["soap", "#F3B33A"]),
  bathbomb: G("Bath bomb", ["hana", "posy", "farid"], 5, "market", "A fizzy bath bomb!", ["ball", "#C9A3E0", "#F4C7CF"], {}),
  shampoobar: G("Shampoo bar", ["bo", "hana", "posy", "tomi"], 7, "market", "A shampoo bar. No plastic bottle!", ["soap", "#9FD3C2"]),
  handcream: G("Rose hand cream", ["farid", "hana", "posy"], 8, "market", "Rose hand cream, for after the garden.", ["tube", "#F2A0B8"]),
  bathsalts: G("Lavender bath salts", ["hana", "posy", "farid", "bo"], 7, "market", "Bath salts. A long soak tonight.", ["jar", "#C9A3E0", "#FFFDF6"]),
  soap_dino: G("Dinosaur soap", "evan", 5, "market", "A DINOSAUR SOAP! RAWR in the bath!", ["soap", "#9CC27E"]),
  loofah: G("Natural loofah", ["bo", "hana", "farid"], 4, "market", "A loofah. Grown, not made!", ["loaf", "#E3D29A"]),
  soycandle: G("Fig soy candle", ["hana", "posy", "farid", "bo"], 9, "market", "A fig-scented candle in a tin.", ["candle", "#7A4A6E"]),
  // Ben: craft beer
  gingerbeer: G("Ginger beer", "family", 5, "market", "Fiery ginger beer, no alcohol.", ["bottle", "#E3B06A"], {}),
  lager: G("Craft lager", ["bo", "mei", "theo", "tomi"], 7, "market", "A crisp craft lager.", ["bottle", "#F3D34A"]),
  cider: G("Apple cider", ["bo", "theo", "posy", "tomi"], 8, "market", "Dry apple cider, pressed up the hill.", ["bottle", "#B9D98A"]),
  rootbeer: G("Root beer", ["bo", "tomi"], 4, "market", "Old-fashioned root beer!", ["bottle", "#6B3A2A"], {}),
  // Dev: bakery
  eggtart: G("Egg tart", NOM, 4, "market", "A warm egg tart! The pastry's so flaky.", ["tart", "#F3C969"], {farid: "Dan tat! Still warm. Ma Ma's favourite."}),
  croissant: G("Butter croissant", NOM, 4, "market", "A croissant, all buttery layers.", ["crescent", "#E3A85A"]),
  bananabread: G("Banana bread", "family", 6, "market", "A slice of banana bread, still warm.", ["loaf", "#C98A4A"]),
  cinnamonbun: G("Cinnamon bun", NOM, 5, "market", "A sticky cinnamon bun!", ["bun", "#C98A4A", "#FFFDF6"]),
  sourdough: G("Sourdough loaf", "family", 9, "market", "A whole sourdough loaf. Crackly crust.", ["loaf", "#D9A86A"], {bo: "Proper bread! Toast for a week."}),
  pineapplebun: G("Pineapple bun", NOM, 4, "market", "A bolo bao! Crumbly sugar top.", ["bun", "#F3C969", "#E3A23A"]),

  // ---- Field fair (last Saturday) ----
  pinklemonade: G("Pink lemonade", "family", 3, "fair", "Pink lemonade! Fizzy and sour.", ["cup", "#F2A0B8"]),
  candyapple: G("Candy apple", ["posy", "farid", "hana"], 4, "fair", "A candy apple! Shiny and crunchy.", ["apple", "#C2334D"]),
  popcorn: G("Bag of popcorn", "family", 3, "fair", "Popcorn, salty and sweet.", ["bag", "#FFFDF6", "#E8566C"]),
  cottoncandy: G("Cotton candy", ["posy", "farid"], 3, "fair", "Pink cotton candy!", ["cloud", "#F4C7CF"], {}),
  muahchee: G("Muah chee", "family", 4, "fair", "Muah chee, rolled in peanuts.", ["box", "#FFFDF6", "#C98A4A"], {mei: "Muah chee! Like the pasar malam last time."}),
  minipancakes: G("Mini pancakes", "family", 4, "fair", "A paper boat of mini pancakes!", ["boat", "#E3A85A"]),

  // ---- Night market ----
  // Yun: Taiwanese street snacks
  popcornchicken: G("Popcorn chicken", ["bo", "tomi", "theo", "mei"], 6, "night", "Taiwanese popcorn chicken, with basil!", ["boat", "#D99A4A"], {tomi: "Protein bites! Zeh, you get me."}),
  pepperbun: G("Pepper bun", ["bo", "theo", "mei", "tomi"], 5, "night", "Hu jiao bing, straight off the tandoor wall.", ["bun", "#D9A86A", "#4A3226"]),
  guabao: G("Gua bao", ["bo", "theo", "tomi", "posy"], 6, "night", "Braised pork in a fluffy bun.", ["bao", "#FFFDF6", "#A8432E"]),
  taroballs: G("Taro ball dessert", "family", 5, "night", "Chewy taro balls in syrup.", ["bowl", "#C9A3E0"]),
  lurourice: G("Braised pork rice", ["bo", "tomi", "theo", "mei"], 6, "night", "Lu rou fan! Sticky braised pork on rice.", ["bowl", "#8A5A3A"]),
  oysteromelette: G("Oyster omelette", ["theo", "mei", "farid"], 7, "night", "An oyster omelette with sweet chilli sauce.", ["plate", "#F3D98A", "#E8566C"]),
  // Jae: Korean street food
  kimbap: G("Kimbap roll", "family", 5, "night", "Kimbap! Sesame and pickled radish.", ["roll", "#3F4A3B", "#F3D34A"]),
  corndog: G("Korean corn dog", ["bo", "posy"], 5, "night", "A corn dog with crispy potato bits!", ["skewer", "#E3A85A"], {}),
  bungeoppang: G("Bungeoppang", "family", 4, "night", "A fish-shaped bun full of red bean!", ["fish", "#D9A86A"]),
  odeng: G("Odeng skewer", ["bo", "theo", "mei", "tomi"], 4, "night", "Fish cake skewer in hot broth.", ["skewer", "#F3E7C9"]),
  dalgona: G("Dalgona candy", ["posy", "tomi"], 3, "night", "Dalgona! Carve out the star without breaking it.", ["disc", "#E3A23A"]),
  hobakjuk: G("Sweet pumpkin porridge", ["farid", "mei", "hana"], 5, "night", "Hobakjuk, warm and sweet.", ["bowl", "#F2A65A"]),
  // Mina: hair things
  hairribbon: G("Silk hair ribbon", ["hana", "posy", "farid"], 4, "night", "A silk ribbon for my hair!", ["bow", "#E8566C"]),
  pearlband: G("Pearl headband", ["hana", "posy"], 7, "night", "A pearl headband! So elegant.", ["band", "#FFFDF6"]),
  butterflyclips: G("Butterfly clips", ["posy", "hana"], 3, "night", "Butterfly clips! So nostalgic.", ["clip", "#9FD3C2"], {posy: "These were EVERYWHERE when I was little. Love them."}),
  bowclip: G("Velvet bow clip", ["hana", "posy", "farid"], 5, "night", "A velvet bow clip!", ["bow", "#5E2A44"]),
  hairpins: G("Gold hair pins", ["hana", "posy", "farid"], 4, "night", "Little gold hair pins. So pretty.", ["pins", "#F3C969"]),
  beadtie: G("Beaded hair ties", ["posy", "hana"], 3, "night", "Beaded hair ties, every colour.", ["beads", "#C9A3E0"]),
  // Tomas: keychains and charms
  catplush: G("Cat plushie keychain", ["posy", "farid"], 5, "night", "A squishy cat keychain!", ["plush", "#F3C969"]),
  enamelpin: G("Enamel pin", ["posy", "tomi", "bo"], 4, "night", "An enamel pin for my bag!", ["pin", "#7FB8E8"]),
  phonestrap: G("Beaded phone strap", ["posy", "hana"], 4, "night", "A beaded phone strap. Cute!", ["beads", "#F2A0B8"]),
  starcharm: G("Star charm", ["posy", "hana"], 3, "night", "A little star charm that sparkles.", ["star", "#F3C969"]),
  // Sora: socks, hats and tees
  stripesocks: G("Striped socks", "family", 4, "night", "Rainbow striped socks!", ["sock", "#E8566C", "#7FB8E8"]),
  cattee: G("Cat tee", ["posy", "hana"], 7, "night", "A tee with a cat on it!", ["tee", "#F4C7CF"]),
  tote: G("Canvas tote bag", ["hana", "posy", "farid"], 6, "night", "A tote bag! For the market.", ["tote", "#F3E7C9", "#E8566C"]),
  sleepmask: G("Silk sleep mask", ["hana", "posy", "bo"], 6, "night", "A silk sleep mask. Proper rest.", ["mask", "#C3CDEE"]),
  beanie: G("Knit beanie", ["bo", "tomi", "theo", "mei"], 6, "night", "A knit beanie for the aircon.", ["beanie", "#7FA35A"]),
  dinosocks: G("Dinosaur socks", "evan", 3, "night", "DINOSAUR SOCKS!", ["sock", "#9CC27E", "#F3C969"]),
  // Lior: lanterns and lamps (the decor stays; these are gifts)
  minilantern: G("Mini paper lantern", ["farid", "mei", "hana"], 5, "night", "A little paper lantern!", ["lantern", "#E8566C"]),
  starlights: G("Jar of fairy lights", ["posy", "hana"], 7, "night", "Fairy lights in a jar! For the bedroom.", ["jar", "#FFF3C4", "#E8D3A6"]),
  rabbitlamp: G("Rabbit night light", "evan", 8, "night", "A bunny night light! It glows!", ["plush", "#FFFDF6"]),
  incense: G("Sandalwood incense", ["farid", "mei", "theo"], 4, "night", "Sandalwood incense. Very calming.", ["sticks", "#A8754F"]),
  // Wen: sweets
  dragonbeard: G("Dragon's beard candy", "family", 5, "night", "Dragon's beard candy, like silk threads!", ["box", "#FFFDF6", "#F3C969"]),
  qqballs: G("Sweet potato balls", "family", 4, "night", "QQ sweet potato balls! Crispy and chewy.", ["boat", "#F3B33A"]),
  mangomochi: G("Mango mochi", "family", 5, "night", "Mango mochi, soft and fruity.", ["ball", "#F3B33A", "#FFFDF6"]),
  castella: G("Honey castella", NOM, 6, "night", "A fluffy honey castella cake!", ["loaf", "#F3C969"]),
  // Kai: night drinks
  limejuice: G("Fresh lime juice", "family", 3, "night", "Fresh lime juice with sour plum!", ["cup", "#B9D98A"]),
  soymilk: G("Soy milk", "family", 3, "night", "Fresh soy milk, not too sweet.", ["cup", "#F6EBD2"], {tomi: "Soy milk! No lactose. You remembered."}),
  wintermelon: G("Winter melon tea", "family", 3, "night", "Winter melon tea. Sweet and cooling.", ["cup", "#D9A86A"]),
  chrystea: G("Chrysanthemum tea", ["farid", "mei", "theo", "hana"], 3, "night", "Chrysanthemum tea. Good for the eyes!", ["cup", "#F3D34A"]),
  coconutshake: G("Coconut shake", "family", 5, "night", "A coconut shake, straight from the coconut.", ["coconut", "#7FA35A"])
};
// The Cocoa Room's bars (cocoa.js), to give: dark is dairy-free, so it suits Marcus too
Object.assign(GOODS, {
  bar_milk: {...G("Milk chocolate bar", NOM, 6, "cocoa", "Your own chocolate! Smooth and creamy.", ["bar", "#8A5A3A"]), says: {farid: "You made this? From the bean? Aiyo, so clever."}},
  bar_dark: {...G("Dark chocolate bar", "family", 6, "cocoa", "Dark chocolate, made from the bean! Rich.", ["bar", "#4A2E22"]), says: {tomi: "Dark choc, no dairy. Antioxidants, Zeh. Approved.", theo: "Dark chocolate with my coffee. Perfect."}},
  pairbox: G("Wine and chocolate pairing box", ["bo", "theo", "hana", "posy", "farid", "mei"], 40, "cocoa", "Your wine AND your bonbons? In one box? I'm saving this for a special night.", ["box", "#7A1F3D", "#F3C969"], {bo: "Wine and chocolate. You know me so well.", theo: "Ah Gong will share it with your mum. Maybe."}),
  sp_log: G("Chocolate yule log", "family", 18, "cocoa", "A chocolate log! It's Christmas now, officially.", null, {tomi: "Dark choc log, no dairy. Merry Christmas, Zeh."}),
  sp_coins: G("Box of gold chocolate coins", NOM, 12, "cocoa", "Gold coins! Huat ah! So much luck in one box.", ["box", "#F3C969", "#D9433A"], {farid: "Gold coins for Ma Ma? Huat ah!"}),
  sp_spiced: G("Spiced chocolate box", "family", 12, "cocoa", "Cardamom and chocolate? Oh, that's lovely. Happy Deepavali!", ["box", "#4A2E22", "#F6A23A"], {tomi: "Dark and spiced, dairy-free. Happy Deepavali, Zeh."}),
  sp_mooncake: G("Chocolate mooncake", NOM, 10, "cocoa", "A chocolate mooncake! Let's have it under the lanterns.", null, {farid: "Chocolate mooncake? Ma Ma never try before. So modern!"}),
  box16: G("Grand box of 16 bonbons", NOM, 50, "cocoa", "Sixteen bonbons, in a ribbon box! I'm going to make these last. I'm not.", ["box", "#C2505F", "#F3C969"]),
  box16d: G("Grand box of 16 dark bonbons", "family", 50, "cocoa", "Sixteen dark bonbons, all dairy-free! This is a treasure chest.", ["box", "#4A2E22", "#C2505F"], {tomi: "Sixteen, dairy-free. You spoil me, Zeh."}),
  box4: G("Box of 4 bonbons", NOM, 14, "cocoa", "A little box of your bonbons! Too pretty to eat. Almost.", ["box", "#8A5A3A", "#F3E7C9"]),
  box4d: G("Box of 4 dark bonbons", "family", 14, "cocoa", "Dark chocolate bonbons, all dairy-free!", ["box", "#4A2E22", "#F3C969"], {tomi: "Dairy-free bonbons? You thought of everything, Zeh."}),
  box9: G("Box of 9 bonbons", NOM, 30, "cocoa", "A whole box of bonbons! Every one different.", ["box", "#8A5A3A", "#E8566C"], {hana: "Nine! I'll share them with Dad. Maybe.", farid: "So beautiful, like jewels. Ma Ma keep for special guests."}),
  box9d: G("Box of 9 dark bonbons", "family", 30, "cocoa", "Nine dark bonbons, all dairy-free!", ["box", "#4A2E22", "#E8566C"]),
  bar_white: {...G("White chocolate bar", NOM, 6, "cocoa", "White chocolate, sweet and vanilla-y.", ["bar", "#F3E7C9"]), says: {}}
});
// Keepsakes: little things to put on a shelf in Mel's buildings (the Scoop Shack, the wine shop, home, her room, the
// app houses): companions.js places them. Pets: adopted at the market's adoption corner, then given to someone in
// the family, who looks after it on the screen Mel picks (companions.js).
const K = (n, price, line, art) => ({n, kind: "keepsake", price, line, art});
const P = (n, price, line, art, pet) => ({n, kind: "pet", price, line, art, pet, say: "A new friend! I promise to look after it, always."});
// story rewards (game/stories.js): not sold anywhere, given by villagers as their stories unfold
Object.assign(GOODS, {
  s_recipebook: K("Henri's recipe book", 0, "Henri Marchand's chocolate recipes, in faded ink, 1962 onwards.", ["box", "#8A5A3A"]),
  s_label: K("The first Marchand label", 0, "Dad's painting of the Marchand & Fille label: a ribbon and a copper pot.", ["star", "#E8C48E"]),
  s_praline: G("Henri's hazelnut pralines", "family", 0, null, "Hazelnut pralines, from Henri's own recipe. Melt-in-the-mouth.", ["box", "#C98A4A"]),
  s_toast: G("Postman's toast", "family", 0, null, "Honey, butter and a pinch of sea salt. Hana's new favourite.", ["loaf", "#E3B04B"]),
  s_spoon: K("Tomás's olive-wood spoon", 0, "An olive-wood spoon Tomás Ruiz carved in 1913 from a branch of the tree by the mill. Worn smooth by four generations of soup.", ["roll", "#C9A27E"]),
  s_poem: K("A poem from Jason", 0, "In Jason's neat hand, on cream paper: 'The late train came. The harbour lights stayed on. / The pizza cooled; I'd read my book twice through. / Some evenings are not lost, they're only long. / I'd wait again. I'd always wait for you.'", ["roll", "#FFFDF6"]),
  s_nonna: G("Nonna's fior di latte", "family", 0, null, "Just milk and sugar, the way Sofia's nonna made it in Napoli.", ["cone", "#FFF6DC"])
});
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
// round 172: the Christmas market (20 November to Christmas Eve, game/tours.js XMAS). Ma Ma's wreaths, Hana's
// gingerbread and tree ornaments, Hiro's wooden toys. (The chestnuts and hot chocolate are treats, eaten on the spot:
// game/xmas.js TREATS.) Ornaments and wreaths are keepsakes: a shelf, or the tree at home
Object.assign(GOODS, {
  xm_wreath: K("Holly wreath", 12, "A wreath Ma Ma made at her Christmas market stall: holly from the orchard hedge, ivy from the back fence, a red ribbon. She tied the bow twice to get it right.", ["ring", "#4F7A4A", "#C8432F"]),
  xm_bouquet: G("Winter bouquet", "family", 8, "market", "Winter flowers from Ma Ma! Red and white, with a sprig of pine.", ["bouquet", "#C8432F", "#FFFDF6"], {farid: "Aiyo, you buy Ma Ma's own flowers back? Silly girl. Thank you."}),
  xm_mistletoe: K("Sprig of mistletoe", 4, "A sprig of mistletoe from Ma Ma's stall, tied with red thread. Darren keeps hanging it in doorways.", ["sprig", "#7FA35A", "#FFFDF6"]),
  xm_ginger: G("Gingerbread person", ["bo", "farid", "mei", "hana", "theo", "posy", "tomi"], 3, "market", "A gingerbread person, iced by Hana! Which leg first?", ["ginger", "#C98A4A", "#FFFDF6"], {}),
  xm_bauble: K("Glass bauble", 5, "A glass bauble from Hana's Christmas stall, deep red with a gold band. It catches the fairy lights.", ["bauble", "#C8432F", "#F3C969"]),
  xm_star: K("Straw star", 4, "A star woven from straw, the old way, from Hana's Christmas stall. It's for the top of the tree, or a window.", ["star", "#F3D98A"]),
  xm_angel: K("Felt angel", 6, "A little felt angel with a gold halo, sewn by Hana's aunt. Her wings are slightly different sizes. That's the charm.", ["angel", "#FFFDF6", "#F3C969"]),
  xm_train: G("Wooden train", "evan", 14, "market", "A wooden train! Three carriages and a funnel.", ["train", "#C8432F", "#7FB8E8"], {}),
  xm_horse: G("Little rocking horse", "evan", 18, "market", "A little rocking horse, painted dapple grey.", ["horse", "#E6DDF2", "#C8432F"], {}),
  xm_yoyo: G("Painted yo-yo", ["tomi", "bo"], 4, "market", "A painted wooden yo-yo!", ["yoyo", "#F3C969", "#E8566C"], {tomi: "Walk the dog. Watch. ...okay, watch again."}),
  // round 174: keepsakes from the grotto and the Christmas Eve lantern walk (not for sale anywhere)
  xm_santaphoto: K("Evan's photo with Santa", 0, "Evan on Santa's knee in the grotto on the field, holding his present with both hands, very serious. Pip the elf is photobombing in the corner.", ["tile", "#C8432F", "#FFFDF6"]),
  xm_lantern: K("A paper lantern from the Christmas Eve walk", 0, "The paper lantern you carried round the field on Christmas Eve, the whole village walking together in the dark, the tree lit up at the end. The candle's burnt down to a stub. You kept it anyway.", ["lantern", "#FFE9A8"]),
  xm_ark: G("Noah's ark", "evan", 22, "market", "A wooden ark, with animals two by two!", ["ark", "#A8754F", "#9CC27E"], {})
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
