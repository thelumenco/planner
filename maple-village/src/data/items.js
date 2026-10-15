// Shop items, crops, garden plots and friendship levels.
import { H, M } from "../util.js";
import { TREES, FLOWERS } from "./orchard.js";
import { GOODS } from "./stall-goods.js";

// yield: how many one plot gives at harvest (prices per piece are set so a whole harvest is worth a little more than
// the old one-per-plot did: more ingredients for the kitchen, without flooding the market)
export const CROPS = {
  tulip:{n:"Tulip", ns:"tulips", e:"🌷", dur:1*H, yield:2}, sunflower:{n:"Sunflower", ns:"sunflowers", e:"🌻", dur:1*H, yield:2},
  carrot:{n:"Carrot", ns:"carrots", e:"🥕", dur:4*H, yield:3}, corn:{n:"Corn", ns:"corn cobs", e:"🌽", dur:4*H, yield:3},
  strawberry:{n:"Strawberry", ns:"strawberries", e:"🍓", dur:24*H, yield:5}, blueberry:{n:"Blueberry", ns:"handfuls of blueberries", e:"🫐", dur:24*H, yield:5},
  tomato:{n:"Tomato", ns:"tomatoes", dur:6*H, yield:3}, potato:{n:"Potato", ns:"potatoes", dur:8*H, yield:4}, pepper:{n:"Pepper", ns:"peppers", dur:6*H, yield:3},
  pea:{n:"Peas", ns:"handfuls of peas", dur:4*H, yield:4}, pumpkin:{n:"Pumpkin", ns:"pumpkins", dur:24*H, yield:2}, // round 109: herbs, grown in the greenhouse (game/greenhouse.js)
  garlic:{n:"Garlic", ns:"bulbs of garlic", dur:8*H, yield:4, herb:true}, basil:{n:"Basil", ns:"bunches of basil", dur:4*H, yield:3, herb:true},
  mint:{n:"Mint", ns:"bunches of mint", dur:4*H, yield:3, herb:true}, rosemary:{n:"Rosemary", ns:"sprigs of rosemary", dur:6*H, yield:3, herb:true},
  chives:{n:"Chives", ns:"bunches of chives", dur:3*H, yield:3, herb:true}, thyme:{n:"Thyme", ns:"bunches of thyme", dur:6*H, yield:3, herb:true},
  leek:{n:"Leek", ns:"leeks", dur:8*H, yield:3},
  chickpea:{n:"Chickpeas", ns:"handfuls of chickpeas", dur:6*H, yield:3},   // round 132: for farinata (Cinque Terre)
  raspberry:{n:"Raspberry", ns:"punnets of raspberries", dur:24*H, yield:4}   // round 144: canes from Bellbird Valley's berry farm
};
export const ITEMS = {
  tulip_seed:{e:"🌷", n:"Tulip bulbs", kind:"seed", price:2, crop:"tulip", tab:"seeds", seasons:["autumn","winter","spring"]},
  sunflower_seed:{e:"🌻", n:"Sunflower seeds", kind:"seed", price:3, crop:"sunflower", tab:"seeds", seasons:["summer","autumn"]},
  carrot_seed:{e:"🥕", n:"Carrot seeds", kind:"seed", price:3, crop:"carrot", tab:"seeds", seasons:["spring","autumn","winter"]},
  corn_seed:{e:"🌽", n:"Corn seeds", kind:"seed", price:4, crop:"corn", tab:"seeds", seasons:["summer","autumn"]},
  strawberry_seed:{e:"🍓", n:"Strawberry seeds", kind:"seed", price:6, crop:"strawberry", tab:"seeds", seasons:["spring"]},
  blueberry_seed:{e:"🫐", n:"Blueberry seeds", kind:"seed", price:6, crop:"blueberry", tab:"seeds", seasons:["summer"]},
  tomato_seed:{n:"Tomato seeds", kind:"seed", price:4, crop:"tomato", tab:"seeds", seasons:["summer","autumn"]},
  potato_seed:{n:"Seed potatoes", kind:"seed", price:4, crop:"potato", tab:"seeds", seasons:["spring","autumn","winter"]},
  pea_seed:{n:"Pea seeds", kind:"seed", price:3, crop:"pea", tab:"seeds", seasons:["spring"]},
  pumpkin_seed:{n:"Pumpkin seeds", kind:"seed", price:6, crop:"pumpkin", tab:"seeds", seasons:["autumn","winter"]},
  leek_seed:{n:"Leek seedlings", kind:"seed", price:4, crop:"leek", tab:"seeds", seasons:["winter"]},
  raspberry_cane:{n:"Raspberry canes", kind:"seed", ico:"seed:raspberry", price:6, crop:"raspberry", tab:"seeds", visited:"bellbird", seasons:["spring","summer","autumn"]},
  chickpea_seed:{n:"Chickpea seeds", kind:"seed", ico:"seed:chickpea", price:4, crop:"chickpea", tab:"seeds", visited:"cinque", seasons:["spring","summer","autumn"]},
  // round 132: pine nuts at the market's deli once you've been to Cinque Terre (visited)
  chickpea:{n:"Chickpeas", kind:"ingredient", price:3, sell:2, what:"for farinata at the kitchen"},
  raspberry:{n:"Raspberries", kind:"ingredient", price:3, sell:2, what:"berry pavlova at the kitchen, raspberry gelato and bonbons"},
  pinenuts:{n:"Pine nuts", kind:"ingredient", price:6, sell:3, tab:"deli", visited:"cinque", what:"for pesto (in the loft, once Nonna Pina's shown you) and pine nut gelato"},
  pepper_seed:{n:"Pepper seeds", kind:"seed", price:5, crop:"pepper", tab:"seeds", seasons:["summer"]},
  // round 109: herb seeds, for the greenhouse only (all year round, once the greenhouse is built)
  garlic_seed:{n:"Garlic cloves", kind:"seed", price:4, crop:"garlic", tab:"seeds", greenhouse:true, needs:"greenhouse"},
  basil_seed:{n:"Basil seeds", kind:"seed", price:3, crop:"basil", tab:"seeds", greenhouse:true, needs:"greenhouse"},
  mint_seed:{n:"Mint cuttings", kind:"seed", price:3, crop:"mint", tab:"seeds", greenhouse:true, needs:"greenhouse"},
  rosemary_seed:{n:"Rosemary cuttings", kind:"seed", price:4, crop:"rosemary", tab:"seeds", greenhouse:true, needs:"greenhouse"},
  chives_seed:{n:"Chive seeds", kind:"seed", price:3, crop:"chives", tab:"seeds", greenhouse:true, needs:"greenhouse"},
  thyme_seed:{n:"Thyme seeds", kind:"seed", price:3, crop:"thyme", tab:"seeds", greenhouse:true, needs:"greenhouse"},
  // Hana's deli shelf: ingredients for the wine shop's kitchen (send them there from the backpack)
  flour:{n:"Bag of flour", kind:"ingredient", price:3, tab:"deli", what:"bakes two loaves in the kitchen oven"},
  cheese:{n:"Cheese", kind:"ingredient", price:9, tab:"deli", what:"for cheese boards and tostas"},
  olives:{n:"Jar of olives", kind:"ingredient", price:5, tab:"deli", what:"a bowl of olives, or with carrots", sell:3},
  apple:{e:"🍎", n:"Apple", kind:"food", price:2, tab:"treats", say:"Crunchy! Thank you 🍎"},
  dumpling:{e:"🥟", n:"Dumpling", kind:"food", price:4, tab:"treats", say:"A dumpling?! Best boss ever."},
  fish:{e:"🐟", n:"Fish", kind:"food", price:6, tab:"treats", say:"Fishy feast. Mmm."},
  toast:{e:"🍯", n:"Honey toast", kind:"food", price:8, tab:"treats", say:"Sticky paws, happy {kind}."},
  picnic:{e:"🧺", n:"Picnic", kind:"food", price:20, need:25, xp:4, tab:"treats", say:"A whole picnic! You earned this."},
  brush:{e:"🪮", n:"Brush", kind:"tool", act:"brush", price:10, tab:"care", say:"Ooh, so fluffy now ✨"},
  ball:{e:"⚽", n:"Ball", kind:"tool", act:"ball", price:12, tab:"care", say:"Fetch! Again, again!"},
  yarn:{e:"🧶", n:"Yarn", kind:"tool", act:"yarn", price:8, tab:"care", say:"Pounce, pounce, pounce."},
  bath:{e:"🛁", n:"Bubble bath", kind:"use", act:"bath", price:5, tab:"care", say:"Bubbles! Squeaky clean."},
  crown:{e:"🌸", n:"Flower crown", kind:"use", act:"crown", price:7, tab:"care", say:"Do I look regal? I feel regal."},
  fort:{e:"⛺", n:"Fort kit", kind:"use", act:"fort", price:20, need:30, xp:4, tab:"care", say:"Best. Fort. Ever."},
  // Family tab: little gifts go in the backpack and are handed over in person; keepsakes stay at home forever.
  icecream:{n:"Ice cream", kind:"gift", to:"family", price:6, tab:"family", say:"Ice cream! I'm eating it right now, before it melts.",
    says:{tomi:"Ice cream! Two scoops would've been better. Kidding. Thank you!", hana:"Ice cream! Don't tell my Zumba class, love."}},
  balloon:{n:"Red balloon", kind:"gift", to:["posy", "mei"], price:5, tab:"family", say:"A red balloon! It's made my whole afternoon.",
    says:{posy:"A red balloon! I'm tying it to the gift shop door. Customers will smile.", mei:"A red balloon. I'll tie it over the roses. They'll like the colour."}},
  wand:{n:"Bubble wand", kind:"gift", to:["tomi", "posy", "mei"], price:8, tab:"family", say:"Bubbles! I haven't done this in years.",
    says:{tomi:"Bubbles! Bet I can make a bigger one than you.", mei:"Bubbles. They float over the water so slowly. Lovely."}},
  storybook:{n:"Storybook", kind:"gift", to:["theo", "posy", "mei"], price:10, tab:"family", say:"A storybook! I'll read it in one sitting.",
    says:{theo:"A storybook. I shall read it properly, first page to last, with the voices.", posy:"A storybook! Fairy tales are full of psychology, you know."}},
  kopi:{n:"Kopi", kind:"gift", to:"bo", price:5, tab:"family", say:"Strong coffee! That's the morning sorted. Thanks."},
  kaya:{n:"Kaya toast", kind:"gift", to:"bo", price:7, tab:"family", say:"Kaya toast? Okay, now it's a good day."},
  currypuff:{n:"Curry puff", kind:"gift", to:"bo", price:6, tab:"family", say:"Still warm! Want half?"},
  // for Farid and Mei, and the kuehs and festive treats for Hana and Theo too (given in person, or sent round)
  kuehlapis:{n:"Kueh lapis", kind:"gift", to:["farid", "mei", "hana", "theo"], price:5, tab:"family", say:"Kueh lapis! I like to peel the layers off one by one.",
    says:{hana:"Kueh lapis! I peel it layer by layer, every time. Don't judge me, love.", theo:"Kueh lapis. Nine layers. I counted. Thank you."}},
  ondeh:{n:"Ondeh-ondeh", kind:"gift", to:["farid", "mei", "hana", "theo"], price:4, tab:"family", say:"Ondeh-ondeh! Careful, the palm sugar squirts out.",
    says:{hana:"Ondeh-ondeh! One bite, love, or it goes everywhere.", theo:"Ondeh-ondeh. One bite, and pop goes the syrup. Delightful."}},
  angku:{n:"Ang ku kueh", kind:"gift", to:["farid", "mei", "hana", "theo"], price:4, tab:"family", say:"Ang ku kueh, so soft. Shall we share?",
    says:{hana:"Ang ku kueh! The peanut one? My favourite.", theo:"Ang ku kueh. A lucky one, I'm told. Thank you very much."}},
  mooncake:{n:"Mooncake", kind:"gift", to:["farid", "mei", "hana", "theo"], price:12, tab:"family", seasons:["autumn"], say:"Mooncake! Let's cut it together and have it with tea.",
    says:{hana:"Mooncake! Come over, love, we'll have it with tea under the lanterns.", theo:"Mooncake with a double yolk? You know me rather well."}},
  birdsnest:{n:"Bird's nest", kind:"gift", to:"grands", price:18, tab:"family", say:"Bird's nest? That's far too generous! You're too good to us."},
  bakkwa:{n:"Bak kwa", kind:"gift", to:["farid", "mei", "hana", "theo"], price:10, tab:"family", seasons:["spring"], say:"Bak kwa! The good one, from the long queue.",
    says:{hana:"Bak kwa! Don't let Theo finish it in one night.", theo:"Bak kwa! The good one. I shall ration it. Officially."}},
  pineappletarts:{n:"Pineapple tarts", kind:"gift", to:["farid", "mei", "hana", "theo"], price:8, tab:"family", seasons:["spring"], say:"Pineapple tarts! Just one more. Okay, two.",
    says:{hana:"Pineapple tarts! I'm hiding them from Theo.", theo:"Pineapple tarts. Just one. Okay, the whole row."}},
  bakchang:{n:"Rice dumplings", kind:"gift", to:["farid", "mei", "hana", "theo"], price:6, tab:"family", seasons:["summer"], say:"Rice dumplings! Like the ones my mother used to wrap.",
    says:{hana:"Rice dumplings! I'll have mine with a big pot of tea.", theo:"Rice dumplings! With the salted egg yolk inside? Perfect."}},
  logcake:{n:"Christmas log cake", kind:"gift", to:["farid", "mei", "hana", "theo"], price:14, tab:"family", seasons:["winter"], say:"A log cake! So festive. Let's cut a big slice each.",
    says:{hana:"A log cake! We'll have it after Christmas supper.", theo:"Log cake! I'll cut it into perfectly even slices."}},
  essence:{n:"Chicken essence", kind:"gift", to:"grands", price:10, tab:"family", say:"Chicken essence! One every morning and I'll be as strong as an ox."},
  // for Tomi (loves his food and his football) and Posy (reads psychology books for fun)
  protbar:{n:"Plant protein bar", kind:"gift", to:"tomi", price:4, tab:"family", say:"A protein bar! After-football snack, sorted. You know me too well."},
  jerky:{n:"Beef jerky", kind:"gift", to:"tomi", price:7, tab:"family", say:"Jerky! Don't tell Posy, I'm not sharing."},
  chickenbox:{n:"Grilled chicken bento", kind:"gift", to:"tomi", price:9, tab:"family", say:"Grilled chicken and rice? Fuel for paddleboarding. Thanks!"},
  oatlatte:{n:"Oat milk latte", kind:"gift", to:["tomi", "posy"], price:6, tab:"family", say:"An oat latte! Thank you!",
    says:{tomi:"An oat latte! One more round of coffee. You're the best.", posy:"Oat latte! Exactly what I need for this psychology book."}},
  bubbletea:{n:"Brown sugar bubble tea", kind:"gift", to:"posy", price:5, tab:"family", say:"Bubble tea! Brain food for my reading pile. Thank you!"},
  highlighters:{n:"Pastel highlighters", kind:"gift", to:"posy", price:6, tab:"family", say:"Pastel highlighters! My psychology books are going to look so pretty."},
  mochi:{n:"Box of mochi", kind:"gift", to:["tomi", "posy"], price:8, tab:"family", say:"Mochi! Thank you!",
    says:{tomi:"Mochi! We'll share. Probably.", posy:"Mochi! We'll have them on the sofa tonight. Thank you!"}},
  // The night market (Tuesday and Thursday evenings, tab "night": only sold at its stalls). Street food, sweets and
  // little things, all gifts.
  friedchicken:{n:"XXL fried chicken", kind:"gift", to:["bo", "tomi", "theo", "mei"], price:7, tab:"night", say:"Fried chicken as big as my face!",
    says:{bo:"That's the size of a plate. I love it.", tomi:"As big as my face! Okay, that's dinner sorted.", theo:"Remarkably crispy. And remarkably large. Thank you.", mei:"So big! I'll take it down to the lake and eat it slowly."}},
  scallion:{n:"Scallion pancake", kind:"gift", to:"family", price:5, tab:"night", say:"Flaky scallion pancake, still hot!",
    says:{farid:"Crispy outside, soft inside. Very good pastry work.", posy:"Ooh, flaky. Thank you!"}},
  hotteok:{n:"Hotteok", kind:"gift", to:["hana", "farid", "posy"], price:5, tab:"night", say:"Hotteok! Careful, the sugar's like lava.",
    says:{hana:"Hotteok! Like the ones we had in Seoul. Thank you, love.", posy:"Brown sugar and nuts? Okay, reading break."}},
  tteokbokki:{n:"Tteokbokki", kind:"gift", to:["bo", "tomi", "posy", "theo"], price:6, tab:"night", say:"Spicy rice cakes! Chewy and fiery.",
    says:{bo:"Spicy! Good spicy. Pass the water.", tomi:"Tteokbokki! Spicy. Love it. Seconds?", posy:"Spicy rice cakes! My favourite.", theo:"Goodness, that's spicy. But very nice."}},
  eggbread:{n:"Egg bread", kind:"gift", to:["mei", "hana", "bo"], price:4, tab:"night", say:"Gyeran-ppang: a whole egg baked into sweet bread.",
    says:{mei:"Egg inside bread? Clever. I like it."}},
  pearlclip:{n:"Pearl hair clip", kind:"gift", to:["hana", "posy", "mei"], price:6, tab:"night", say:"A pearl hair clip! So pretty.",
    says:{hana:"Pearls! For my bob. You spoil me, love.", posy:"Pearl clip! Wearing it to the shop tomorrow.", mei:"Pearls. Very pretty. I'll wear it to sing to the roses."}},
  clawclip:{n:"Tortoiseshell claw clip", kind:"gift", to:["hana", "posy"], price:5, tab:"night", say:"A claw clip! Exactly what I needed.",
    says:{hana:"For my Pilates! Hair out of the face.", posy:"Shop-day hair, sorted."}},
  scrunchie:{n:"Velvet scrunchie", kind:"gift", to:["posy", "hana", "mei"], price:3, tab:"night", say:"A velvet scrunchie! So soft."},
  dinokey:{n:"Glow-in-the-dark dino keychain", kind:"gift", to:["tomi", "bo"], price:4, tab:"night", say:"A dino that glows! It's going on my keys.",
    says:{tomi:"A glowing dino! RAWR. It's going on my keys.", bo:"Glow-in-the-dark. Now I'll find my keys in the workshop."}},
  luckycharm:{n:"Lucky cat phone charm", kind:"gift", to:["posy", "tomi", "bo"], price:4, tab:"night", say:"A lucky cat! It waves!",
    says:{tomi:"A lucky cat for my phone. It'll wave when I win.", bo:"A waving cat. Okay, it's on my keys now."}},
  cosysocks:{n:"Cosy socks", kind:"gift", to:"family", price:4, tab:"night", say:"Fluffy socks! Toasty toes.",
    says:{farid:"Warm socks! For early mornings in the orchard.", mei:"Socks! My feet are always cold. Thank you."}},
  buckethat:{n:"Bucket hat", kind:"gift", to:["bo", "tomi", "theo"], price:7, tab:"night", say:"A bucket hat! Very cool.",
    says:{bo:"Garden hat upgrade. Thanks.", tomi:"Bucket hat? I'm wearing it paddleboarding.", theo:"A hat for sketching by the water. Very nice."}},
  dinotee:{n:"Dinosaur tee", kind:"gift", to:["tomi", "bo"], price:6, tab:"night", say:"A dinosaur tee! I'm wearing it tomorrow.",
    says:{tomi:"A dinosaur tee! I'm wearing it to football.", bo:"A dinosaur tee. That's my new workshop shirt."}},
  tanghulu:{n:"Tanghulu", kind:"gift", to:"family", price:4, tab:"night", say:"Strawberries in crackly sugar! Crunch!",
    says:{tomi:"Tanghulu! Sugar, sure, but it's fruit. Counts."}},
  eggwaffle:{n:"Egg waffle", kind:"gift", to:["posy", "farid", "bo"], price:5, tab:"night", say:"An egg waffle! All the little bubbles.",
    says:{farid:"Egg waffle! All those little bubbles. I want to bake some myself."}},
  sugarcane:{n:"Sugarcane juice", kind:"gift", to:"family", price:3, tab:"night", say:"Fresh sugarcane juice! So refreshing.",
    says:{mei:"Sugarcane juice! With lemon? Lovely.", theo:"Sugarcane juice. Most refreshing. Thank you."}},
  grassjelly:{n:"Grass jelly drink", kind:"gift", to:["mei", "farid", "theo", "hana"], price:3, tab:"night", say:"Grass jelly! Very cooling.",
    says:{farid:"Grass jelly! Very cooling on a hot day.", mei:"Grass jelly! I loved this when I was young."}},
  // Sunday farmers market specials (tab "market": only sold at the market stalls, never at Hana's). Gifts for friends:
  // to "family" can go to any friend (three hearts or more); a list names who it suits.
  // says: what each one says (falls back to say)
  honey:{n:"Jar of wildflower honey", kind:"gift", to:"family", price:8, tab:"market", say:"Wildflower honey! Straight from the bees.",
    says:{bo:"Proper honey. That's going in my tea.", farid:"Honey! I'll make honey lemon. And a honey cake. Probably two.", mei:"Raw honey? This one is the real thing.",
      hana:"Honey! Perfect after my Zumba. Thank you, love.", theo:"Honey for my tea. Thank you very much indeed.", tomi:"Honey? For my toast tomorrow. Nice one.", posy:"Honey for my tea! Reading fuel. Thank you!"}},
  honeycomb:{n:"Honeycomb", kind:"gift", to:"family", price:10, tab:"market", say:"A whole piece of honeycomb! You chew the wax.",
    says:{bo:"Honeycomb on toast tomorrow. Sorted.", farid:"Honeycomb! When I was small this was such a treat.", mei:"Honeycomb! Chew, chew, then the wax. Lovely."}},
  beecandle:{n:"Beeswax candle", kind:"gift", to:["bo", "farid", "mei", "hana", "posy"], price:9, tab:"market", say:"A beeswax candle. It smells like honey when it burns.",
    says:{bo:"Smells like honey. Nice for the evenings.", farid:"So pretty! I'll light it at afternoon tea.", mei:"Beeswax? Burns long, this one. Good quality."}},
  soap_lav:{n:"Lavender soap", kind:"gift", to:["bo", "farid", "mei", "hana", "posy"], price:6, tab:"market", say:"Handmade lavender soap. It smells like a garden.",
    says:{bo:"Lavender. Very relaxing. I'll take the hint.", farid:"Smell! So fragrant. Too nice to use!", mei:"Lavender soap. It smells nice. It's going by the bath."}},
  soap_rose:{n:"Rose and oat soap", kind:"gift", to:["bo", "farid", "mei", "hana", "posy"], price:6, tab:"market", say:"Rose and oat soap, made by hand.",
    says:{farid:"Rose! Mei will say it's hers. She's probably right.", bo:"Rose and oat? Fancy. Thank you.", mei:"Rose. My favourite. Thank you."}},
  soap_duck:{n:"Little duck soap", kind:"gift", to:["posy", "hana", "mei"], price:5, tab:"market", say:"A little duck soap! Too sweet to use. Quack.",
    says:{posy:"A duck soap! It's going on the gift shop counter. Not for sale."}},
  scrub:{n:"Sugar scrub", kind:"gift", to:["bo", "farid", "hana", "posy"], price:9, tab:"market", say:"A sugar scrub, all handmade.",
    says:{farid:"Scrub for the hands! After a day in the orchard, so good.", bo:"Sugar scrub? I'll try it. Don't tell anyone."}},
  paleale:{n:"Craft pale ale", kind:"gift", to:["bo", "mei", "theo", "tomi"], price:8, tab:"market", say:"A craft pale ale. Brewed just up the road.",
    says:{bo:"Ooh, a local pale ale. That's my Sunday arvo sorted.", mei:"Beer! A cold one later, down by the lake."}},
  stout:{n:"Craft stout", kind:"gift", to:["bo", "mei", "theo", "tomi"], price:9, tab:"market", say:"A dark craft stout, small batch.",
    says:{bo:"A stout! Rich and dark. I'm saving this for the weekend.", mei:"A dark beer. Very good. I'll save it for fishing."}},
  sandpit:{n:"Digging sandpit", kind:"keep", price:150, tab:"family", say:"A sandpit in the garden, all for your pet! The first hole's already dug."},
  truck:{n:"Vintage tin truck", kind:"keep", price:80, tab:"family", say:"A little red tin truck for the windowsill at home. Wind it up and it trundles."},
  headphones:{n:"Headphones", kind:"keep", to:"bo", price:120, tab:"family", say:"Noise-cancelling headphones for Bo! Now he can hum over the saw in peace."},
  treehouse:{n:"Your treehouse", kind:"keep", price:800, tab:"family", say:"A treehouse in the swing tree! A reading nook with a view, and a ladder up."},
  hammock:{n:"Hammock", kind:"keep", price:250, tab:"family", say:"A hammock by the pond. Your evenings are sorted."},
  // Animals tab: chicks and bunnies live in the run at home base; their food goes in the backpack.
  chick:{n:"Chick", kind:"pet", pet:"chick", price:25, tab:"animals", say:"A fluffy little chick! Cheep cheep."},
  rabbit:{n:"Bunny", kind:"pet", pet:"rabbit", price:35, tab:"animals", say:"A baby bunny! Look at those ears."},
  chickfeed:{n:"Chick feed", kind:"feed", price:2, tab:"animals", what:"one meal for a chick or hen"},
  rabbitfeed:{n:"Rabbit pellets", kind:"feed", price:2, tab:"animals", what:"one meal for a bunny"},
  goat:{n:"Goat kid", kind:"pet", pet:"goat", price:150, tab:"animals", say:"A little goat! She's already nibbling my sleeve."},
  goatfeed:{n:"Goat feed", kind:"feed", price:2, tab:"animals", what:"one meal for a goat"},
  // pantry staples on Hana's deli shelf, mostly for the Scoop Shack's gelato (chocolate will come from the
  // chocolatier on the bay once it opens)
  chocolate:{n:"Bar of dark chocolate", kind:"ingredient", price:5, tab:"deli", sell:2, what:"for gelato at the Scoop Shack"},
  vanilla:{n:"Vanilla pods", kind:"ingredient", price:6, tab:"deli", sell:2, what:"for gelato at the Scoop Shack"},
  coffee:{n:"Bag of coffee beans", kind:"ingredient", price:5, tab:"deli", sell:2, what:"for gelato at the Scoop Shack"},
  pistachio:{n:"Pistachios", kind:"ingredient", price:6, tab:"deli", sell:2, what:"for gelato at the Scoop Shack"},
  hazelnut:{n:"Hazelnuts", kind:"ingredient", price:5, tab:"deli", sell:2, what:"for gelato at the Scoop Shack"},
  coconut:{n:"Coconut", kind:"ingredient", price:4, tab:"deli", sell:2, what:"for gelato at the Scoop Shack"},
  matcha:{n:"Matcha powder", kind:"ingredient", price:6, tab:"deli", sell:2, what:"for gelato at the Scoop Shack"},
  pandan:{n:"Pandan leaves", kind:"ingredient", price:3, tab:"deli", sell:1, what:"for gelato at the Scoop Shack"},
  gulamelaka:{n:"Gula melaka", kind:"ingredient", price:4, tab:"deli", sell:2, what:"for gelato at the Scoop Shack"},
  sesame:{n:"Black sesame", kind:"ingredient", price:4, tab:"deli", sell:2, what:"for gelato at the Scoop Shack"},
  mint:{n:"Fresh mint", kind:"ingredient", price:3, tab:"deli", sell:1, what:"for gelato at the Scoop Shack"},
  banana:{n:"Bananas", kind:"ingredient", price:3, tab:"deli", sell:1, what:"for gelato at the Scoop Shack"},
  // from the vineyard's grape crates (take them out in the barrel shed)
  grape_red:{n:"Red grapes", kind:"ingredient", sell:2, what:"for gelato at the Scoop Shack, or back in the crates for wine"},
  grape_white:{n:"White grapes", kind:"ingredient", sell:2, what:"for gelato at the Scoop Shack, or back in the crates for wine"},
  grape_tempranillo:{n:"Tempranillo grapes", kind:"ingredient", sell:3, what:"for gelato at the Scoop Shack, or back in the crates for wine"},
  grape_pinot:{n:"Pinot Noir grapes", kind:"ingredient", sell:3, what:"for gelato at the Scoop Shack, or back in the crates for wine"},
  grape_chardonnay:{n:"Chardonnay grapes", kind:"ingredient", sell:3, what:"for gelato at the Scoop Shack, or back in the crates for wine"},
  loaf:{n:"Loaf of bread", kind:"ingredient", sell:2, what:"baked in the wine shop's oven"},
  milk:{n:"Milk", kind:"ingredient", price:4, tab:"deli", sell:3, what:"for gelato at the Scoop Shack, or two make a cheese in the wine shop's kitchen press (the farm stand sells it, and Wildflower Farm's cows give it)"},
  goatmilk:{n:"Goat's milk", kind:"ingredient", price:5, sell:3, what:"from Wildflower Farm's goats: for gelato at the Scoop Shack, or the kitchen's cheese press (like milk)"},
  syrup:{n:"Petal syrup", kind:"ingredient", sell:4, what:"from the kitchen (three garden flowers): gelato, a bonbon filling, or a lemon and petal posset"},
  yoghurt:{n:"Pot of yoghurt", kind:"ingredient", price:5, sell:3, what:"made in Wildflower Farm's barn: frozen yoghurt at the Scoop Shack, or yoghurt with honey at the kitchen"},
  honey_lav:{n:"Jar of lavender honey", kind:"gift", to:"family", price:9, say:"Lavender honey! It smells like the flower farm.", says:{farid: "Lavender honey? In my tea. So fragrant!"}},
  honey_blossom:{n:"Jar of orchard blossom honey", kind:"gift", to:"family", price:9, say:"Orchard blossom honey, from Farid's trees? That's lovely.", says:{farid: "From my trees! The bees know where the good flowers are."}},
  chz_fresh:{n:"Fresh goat's cheese", kind:"gift", to:["bo", "farid", "mei", "hana", "theo", "posy"], price:8, say:"Fresh goat's cheese! On toast with honey. Perfect.", says:{bo: "Goat's cheese and crackers tonight. Sorted."}},
  chz_cheddar:{n:"Wedge of farmhouse cheddar", kind:"gift", to:["bo", "farid", "mei", "hana", "theo", "posy"], price:9, say:"Farmhouse cheddar, from Elena's cave! Sharp and crumbly.", says:{theo: "Proper cheese. Officially approved."}},
  chz_blue:{n:"Wedge of Honeybrook blue", kind:"gift", to:["bo", "theo", "posy"], price:10, say:"A blue! Bold choice. I love it.", says:{bo: "Blue cheese and a glass of your red. Perfect evening."}},
  chz_brie:{n:"Wedge of barn brie", kind:"gift", to:["bo", "farid", "mei", "hana", "theo", "posy"], price:10, say:"Brie! Soft and creamy. I'm having this on everything.", says:{posy: "Brie and crackers and a quiet evening. Perfect."}},
  chz_halloumi:{n:"Block of goat's halloumi", kind:"gift", to:["bo", "farid", "mei", "hana", "theo", "posy"], price:9, say:"Halloumi! Fried in a pan till it squeaks. Yes please.", says:{bo: "Halloumi on the barbecue this weekend. Sorted."}},
  chz_havarti:{n:"Wedge of Tableland havarti", kind:"gift", to:["bo", "farid", "mei", "hana", "theo", "posy"], price:10, say:"Havarti! Buttery, with the little holes. On toast, melted. Heaven.", says:{farid: "I like this one. Soft. Not too strong. Very good."}},
  chz_banon:{n:"A little banon in chestnut leaves", kind:"gift", to:["bo", "farid", "mei", "hana", "theo", "posy"], price:10, say:"A banon! Wrapped in leaves and tied with raffia, like a present. Soft and nutty inside.", says:{mei: "Wrapped in leaves. Very clever. Very tasty."}},
  chz_smoked:{n:"Wedge of smoked farmhouse", kind:"gift", to:["bo", "theo", "mei", "posy"], price:10, say:"Smoked cheese! It smells like a campfire. In a good way.", says:{mei: "A smoky one! I like it. With a beer, by the lake."}},
  honey_cream:{n:"Jar of creamed honey", kind:"gift", to:"family", price:10, say:"Creamed honey! It spreads like butter. Toast is about to get serious.", says:{}},
  egg:{n:"Fresh egg", kind:"food", sell:5, say:"A fresh egg from our hens! Breakfast sorted."},
  tulip:{e:"🌷", n:"Tulip", kind:"flower", sell:2, say:"For me? I'll tuck it behind my ear."},
  sunflower:{e:"🌻", n:"Sunflower", kind:"flower", sell:3, say:"So sunny! Thank you."},
  carrot:{e:"🥕", n:"Carrot", kind:"food", sell:3, say:"Homegrown crunch!"},
  corn:{e:"🌽", n:"Corn", kind:"food", sell:4, say:"Sweet corn! Nom."},
  strawberry:{e:"🍓", n:"Strawberry", kind:"food", sell:4, xp:2, say:"Strawberries from our garden 🥹"},
  blueberry:{e:"🫐", n:"Blueberries", kind:"food", sell:4, xp:2, say:"Blueberries! My favourite."},
  tomato:{n:"Tomato", kind:"food", sell:3, say:"A sun-warm tomato. Mmm."},
  potato:{n:"Potato", kind:"food", sell:2, say:"A potato? Raw? Brave. Okay."},
  pepper:{n:"Pepper", kind:"food", sell:3, say:"Crunchy pepper! Spicy? No. Phew."},
  pea:{n:"Peas", kind:"food", sell:2, say:"Pop, pop, pop. Fresh peas!"},
  pumpkin:{n:"Pumpkin", kind:"food", sell:10, xp:2, say:"A whole pumpkin? I'll just... sit on it."},
  leek:{n:"Leek", kind:"food", sell:3, say:"A leek. Very tall. Very serious."}
};
// Home decor: bought once, shows up inside your house. Items in the same slot swap (one wallpaper, one rug at a time).
export const DECOR = {
  wall_dots:   {ico:"wallpaper", n:"Polka wallpaper",  slot:"wall", val:"dots",   price:20},
  wall_stripe: {ico:"wallpaper", n:"Stripe wallpaper", slot:"wall", val:"stripe", price:20},
  wall_flower: {ico:"wallpaper", n:"Flower wallpaper", slot:"wall", val:"flower", price:25},
  rug_round:   {ico:"rug",       n:"Round rug",        slot:"rug",  val:"round",  price:20},
  rug_stripe:  {ico:"rug",       n:"Striped rug",      slot:"rug",  val:"stripe", price:20},
  lamp:        {ico:"lamp",      n:"Reading lamp",     slot:"lamp", val:"on",     price:15},
  big_plant:   {ico:"pot",       n:"Big plant",        slot:"plant",val:"on",     price:10},
  painting:    {ico:"painting",  n:"Painting",         slot:"art",  val:"on",     price:20},
  fox_bed:     {ico:"bed",       n:"A cosy pet bed", slot:"bed",  val:"on",     price:25, tab:"me", where:"room"},   // upgrades her basket in your room
  // "Me & my room" tab: things for your own room, and things you wear (shown on you in the village)
  r_lights:    {ico:"lantern",   n:"Fairy lights",     slot:"r_lights", val:"on", price:20, tab:"me", where:"room"},
  r_plant:     {ico:"pot",       n:"Monstera",         slot:"r_plant",  val:"on", price:15, tab:"me", where:"room"},
  r_rug:       {ico:"rug",       n:"Cloud rug",        slot:"r_rug",    val:"on", price:25, tab:"me", where:"room"},
  r_art:       {ico:"painting",  n:"Flower print",     slot:"r_art",    val:"on", price:20, tab:"me", where:"room"},
  r_shelf:     {ico:"storybook", n:"Little bookshelf", slot:"r_shelf",  val:"on", price:35, tab:"me", where:"room"},
  r_vanity:    {ico:"mirror",    n:"Vanity mirror",    slot:"r_vanity", val:"on", price:45, tab:"me", where:"room"},
  r_throw:     {ico:"throw",     n:"Knitted throw",    slot:"r_throw",  val:"on", price:20, tab:"me", where:"room"},
  r_candle:    {ico:"candle",    n:"Calm candle",      slot:"r_candle", val:"on", price:10,  tab:"me", where:"room"},
  // from the night market's lantern stall (tab "night": only sold there)
  n_lanterns:  {ico:"lantern",   n:"Paper lanterns",   slot:"lanterns", val:"on", price:18, tab:"night"},
  r_moon:      {ico:"lamp",      n:"Moon lamp",        slot:"r_moon",   val:"on", price:16, tab:"night", where:"room"},
  me_bow:      {ico:"bow",       n:"Velvet hair bow",  slot:"me_bow",   val:"on", price:15,  tab:"me", where:"me"},
  me_scarf:    {ico:"scarf",     n:"Silk neck scarf",  slot:"me_scarf", val:"on", price:20, tab:"me", where:"me"},
  me_hat:      {ico:"sunhat",    n:"Straw sun hat",    slot:"me_hat",   val:"on", price:20, tab:"me", where:"me"},
  me_pj:       {ico:"pyjamas",   n:"Silk pyjamas",     slot:"me_pj",    val:"on", price:25, tab:"me", where:"me"}
};

export const PLOTS = Array.from({length:12}, (_, i) => ({x:70 + (i%3)*140, y:172 + Math.floor(i/3)*104, w:100, h:66}));
// Storybook seasons by the real calendar: spring Mar-May, summer Jun-Aug, autumn Sep-Nov, winter Dec-Feb.
// Hana's seeds rotate with them (anything already bought or planted carries on), and so do the tapas of the day.
export const SEASONS = {spring: {n: "Spring", line: "Blossom and fresh greens"}, summer: {n: "Summer", line: "Sun-ripe and juicy"},
  autumn: {n: "Autumn", line: "Harvest time"}, winter: {n: "Winter", line: "Cosy roots and soups"}};
export const seasonOf = day => { const m = +String(day).slice(5, 7); return m >= 3 && m <= 5 ? "spring" : m >= 6 && m <= 8 ? "summer" : m >= 9 && m <= 11 ? "autumn" : "winter"; };
export const QUEST_BOOST = 30*M;

export const LEVELS = [
  {xp:0, name:"new friend"}, {xp:10, name:"snack buddy", gift:"a rose scarf"},
  {xp:25, name:"cushion pal", gift:"a little plant"}, {xp:45, name:"den mate", gift:"fairy lights"},
  {xp:70, name:"cosy companion", gift:"bunting"}, {xp:100, name:"best friends"},
  {xp:140, name:"soulmates"}, {xp:190, name:"forever den"}
];
export const PEP = ["You don't have to feel ready. You just have to open it.", "Small and steady still counts. This is how the week moves.",
  "You've done harder things than this before lunch.", "Start messy. Tidy later. That's allowed.", "I'll be right here. Go on."];
export const YAY = ["Quest complete! ✨", "Look at you go!", "Done! Happy {kind} wiggle.", "Quest done. Proud of you, properly."];

// From the orchard and flower farm: fruit (food the pet can eat, or stock for the wine shop's fruit crate), bouquets
// (give one to anybody in the village) and potted flowers (set one in a pot spot: home, the wine shop, your room).
const capi = s => s[0].toUpperCase() + s.slice(1);
const FRUIT_SAY = {cherry: "Cherries! I'll save you the stones.", lemon: "A lemon? *sniff* *sneeze* Fresh!", peach: "Fuzzy and sweet. Farid grew this!", mango: "Mango! Sticky chin, happy {kind}.",
  apple: "Crunchy! Thank you", pear: "A juicy pear. Drip, drip.", fig: "A fig! Fancy.", orange: "Peel it for me? Please?", persimmon: "Persimmon! Like eating a little sunset.", tangerine: "A tangerine! Easy to peel. Here, half for you."};
Object.values(TREES).forEach(t => { const it = ITEMS[t.fruit] = ITEMS[t.fruit] || {n: capi(t.fn[0]), kind: "food", say: FRUIT_SAY[t.fruit] || "Fruit from Farid's orchard!"}; it.fruit = true; it.sell = it.sell || t.sell; });
Object.keys(FLOWERS).forEach(id => { const f = FLOWERS[id];
  ITEMS["bq_" + id] = {n: `Bouquet of ${f.n.toLowerCase()}`, kind: "bouquet", flower: id};
  ITEMS["pot_" + id] = {n: `Potted ${f.n.toLowerCase()}`, kind: "pot", flower: id}; });
// Hand-drawn icon name for an item (see art/icons.js): seeds draw as a seed packet of their crop.
// the market stalls' extra goods (data/stall-goods.js)
Object.entries(GOODS).forEach(([id, g]) => { if (!ITEMS[id]) ITEMS[id] = g; });
// Round 109: out-of-season seeds for the greenhouse. Every seasonal packet has a greenhouse twin (half as dear again)
// that Hana sells all year once the greenhouse is built; it only grows under glass (the garden won't take it).
Object.keys(ITEMS).filter(id => ITEMS[id].kind === "seed" && ITEMS[id].seasons).forEach(id => { const s = ITEMS[id];
  ITEMS["gh_" + id] = {n: s.n + " (greenhouse)", kind: "seed", price: Math.ceil(s.price*1.5), crop: s.crop, tab: "seeds", greenhouse: true, needs: "greenhouse", ghOf: id}; });
// round 112: a kite (Hana's Gifts shelf, the fair's kite stall): fly it on the field yourself; and clams from the
// fishmonger's van on Friday evenings
Object.assign(ITEMS, {kite: {n: "Kite", kind: "toy", price: 12, tab: "family", what: "fly it on the field (the open grass by the river), on a breezy day"},
  clams: {n: "Clams", kind: "ingredient", sell: 2, what: "from the fishmonger's van: clams with garlic and lemon, at the kitchen"}});
// the herbs themselves (mint is already on Hana's deli shelf)
Object.assign(ITEMS, {garlic: {n: "Garlic", kind: "ingredient", sell: 1, what: "from the greenhouse: gambas, garlicky tapas"}, basil: {n: "Basil", kind: "ingredient", sell: 1, what: "from the greenhouse: bruschetta, basil gelato, a bonbon filling"},
  rosemary: {n: "Rosemary", kind: "ingredient", sell: 1, what: "from the greenhouse: rosemary potatoes, a rosemary bonbon, gelato"}, chives: {n: "Chives", kind: "ingredient", sell: 1, what: "from the greenhouse: a chive omelette"},
  thyme: {n: "Thyme", kind: "ingredient", sell: 1, what: "from the greenhouse: roast tapas, thyme and lemon gelato"}});
// round 153: the spices, on Hana's market shelves (items.js picks these up)
Object.assign(ITEMS, {
  sp_cinnamon: {n: "Cinnamon sticks", kind: "ingredient", price: 2, sell: 1, tab: "deli", what: "for mulled wine (late November to Boxing Day), in the wine shop kitchen's big pot"},
  sp_clove: {n: "Whole cloves", kind: "ingredient", price: 2, sell: 1, tab: "deli", what: "for mulled wine, in the wine shop kitchen's big pot"},
  sp_anise: {n: "Star anise", kind: "ingredient", price: 3, sell: 1, tab: "deli", what: "for mulled wine, in the wine shop kitchen's big pot"},
  sp_cardamom: {n: "Cardamom pods", kind: "ingredient", price: 3, sell: 1, tab: "deli", what: "for mulled wine, in the wine shop kitchen's big pot"},
  sp_ginger: {n: "Fresh ginger", kind: "ingredient", price: 2, sell: 1, tab: "deli", what: "for mulled wine, in the wine shop kitchen's big pot"}
});
export const itemIco = id => ITEMS[id] && ITEMS[id].kind === "seed" ? "seed:" + ITEMS[id].crop : id;
Object.keys(ITEMS).forEach(id => { ITEMS[id].ico = itemIco(id); });
Object.keys(CROPS).forEach(id => { CROPS[id].ico = id; });

