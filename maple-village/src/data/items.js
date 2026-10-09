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
  leek:{n:"Leek", ns:"leeks", dur:8*H, yield:3}
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
  toast:{e:"🍯", n:"Honey toast", kind:"food", price:8, tab:"treats", say:"Sticky paws, happy fox."},
  picnic:{e:"🧺", n:"Picnic", kind:"food", price:20, need:25, xp:4, tab:"treats", say:"A whole picnic! You earned this."},
  brush:{e:"🪮", n:"Brush", kind:"tool", act:"brush", price:10, tab:"care", say:"Ooh, so fluffy now ✨"},
  ball:{e:"⚽", n:"Ball", kind:"tool", act:"ball", price:12, tab:"care", say:"Fetch! Again, again!"},
  yarn:{e:"🧶", n:"Yarn", kind:"tool", act:"yarn", price:8, tab:"care", say:"Pounce, pounce, pounce."},
  bath:{e:"🛁", n:"Bubble bath", kind:"use", act:"bath", price:5, tab:"care", say:"Bubbles! Squeaky clean."},
  crown:{e:"🌸", n:"Flower crown", kind:"use", act:"crown", price:7, tab:"care", say:"Do I look regal? I feel regal."},
  fort:{e:"⛺", n:"Fort kit", kind:"use", act:"fort", price:20, need:30, xp:4, tab:"care", say:"Best. Fort. Ever."},
  // Family tab: little gifts go in the backpack and are handed over in person; keepsakes stay at home forever.
  icecream:{n:"Ice cream", kind:"gift", to:"evan", price:6, tab:"family", say:"ICE CREAM!! *happy dance*"},
  balloon:{n:"Red balloon", kind:"gift", to:"evan", price:5, tab:"family", say:"Balloooon! Mine!"},
  wand:{n:"Bubble wand", kind:"gift", to:"evan", price:8, tab:"family", say:"Bubbles! Pop pop pop!"},
  storybook:{n:"Storybook", kind:"gift", to:"evan", price:10, tab:"family", say:"Read it! Again! Again!"},
  kopi:{n:"Kopi", kind:"gift", to:"darren", price:5, tab:"family", say:"Kopi! You're the best."},
  kaya:{n:"Kaya toast", kind:"gift", to:"darren", price:7, tab:"family", say:"Kaya toast? Okay, now it's a good day."},
  currypuff:{n:"Curry puff", kind:"gift", to:"darren", price:6, tab:"family", say:"Still warm! Want half?"},
  // for Ma Ma and Gong Gong, and the kuehs and festive treats for Mum and Dad too (given in person, or sent round)
  kuehlapis:{n:"Kueh lapis", kind:"gift", to:["mama", "gonggong", "mum", "dad"], price:5, tab:"family", say:"Kueh lapis! You remember I like to peel the layers one by one.",
    says:{mum:"Kueh lapis! I still peel it layer by layer, like when I was small.", dad:"Kueh lapis. Ah Gong will share with Evan. Maybe."}},
  ondeh:{n:"Ondeh-ondeh", kind:"gift", to:["mama", "gonggong", "mum", "dad"], price:4, tab:"family", say:"Ondeh-ondeh! Careful, the gula melaka squirts out.",
    says:{mum:"Ondeh-ondeh! Eat in one bite, don't make a mess.", dad:"Ondeh-ondeh! Pop, the gula melaka. Shiok."}},
  angku:{n:"Ang ku kueh", kind:"gift", to:["mama", "gonggong", "mum", "dad"], price:4, tab:"family", say:"Ang ku kueh, so soft. Come, we share.",
    says:{mum:"Ang ku kueh! The peanut one? My favourite.", dad:"Ang ku kueh. Good luck one. Thank you, darling."}},
  mooncake:{n:"Mooncake", kind:"gift", to:["mama", "gonggong", "mum", "dad"], price:12, tab:"family", seasons:["autumn"], say:"Mooncake! Come, we cut it together and have with tea.",
    says:{mum:"Mooncake! Come over, we have it with tea under the lanterns.", dad:"Mooncake with double yolk? Wah, you know me."}},
  birdsnest:{n:"Bird's nest", kind:"gift", to:"grands", price:18, tab:"family", say:"Bird's nest? Aiyo, so expensive! You're too good to us."},
  bakkwa:{n:"Bak kwa", kind:"gift", to:["mama", "gonggong", "mum", "dad"], price:10, tab:"family", seasons:["spring"], say:"Bak kwa! The good one, from the queue. Huat ah!",
    says:{mum:"Bak kwa! Don't let Dad finish it in one night.", dad:"Bak kwa! The good one. Huat ah!"}},
  pineappletarts:{n:"Pineapple tarts", kind:"gift", to:["mama", "gonggong", "mum", "dad"], price:8, tab:"family", seasons:["spring"], say:"Pineapple tarts! Just one more. Okay, two.",
    says:{mum:"Pineapple tarts! Hide them from your father.", dad:"Pineapple tarts. Just one. Okay, the whole row."}},
  bakchang:{n:"Rice dumplings", kind:"gift", to:["mama", "gonggong", "mum", "dad"], price:6, tab:"family", seasons:["summer"], say:"Bak chang! Like the ones my mother used to wrap.",
    says:{mum:"Bak chang! Like Ma Ma's. Almost.", dad:"Bak chang! With the salted egg yolk inside? Perfect."}},
  logcake:{n:"Christmas log cake", kind:"gift", to:["mama", "gonggong", "mum", "dad"], price:14, tab:"family", seasons:["winter"], say:"A log cake! So festive. Come, cut a big slice for Evan.",
    says:{mum:"A log cake! We'll have it after Christmas dinner.", dad:"Log cake! Ah Gong will cut the biggest slice for Evan."}},
  essence:{n:"Chicken essence", kind:"gift", to:"grands", price:10, tab:"family", say:"Chicken essence! One every morning, then strong like an ox."},
  // for Marcus (lactose intolerant, loves his protein) and Angellina (studying for her psychology master's)
  protbar:{n:"Plant protein bar", kind:"gift", to:"marcus", price:4, tab:"family", say:"Plant protein, no dairy. You know me too well, Zeh. Post-gym sorted."},
  jerky:{n:"Beef jerky", kind:"gift", to:"marcus", price:7, tab:"family", say:"Jerky! Pure protein. Don't tell Angie, I'm not sharing."},
  chickenbox:{n:"Grilled chicken bento", kind:"gift", to:"marcus", price:9, tab:"family", say:"Grilled chicken and brown rice? Macros on point. Thanks, Zeh!"},
  oatlatte:{n:"Oat milk latte", kind:"gift", to:["marcus", "angelina"], price:6, tab:"family", say:"An oat latte! Thank you!",
    says:{marcus:"Oat milk! No tummy trouble. You're the best sister.", angelina:"Oat latte! Exactly what I need for this reading list."}},
  bubbletea:{n:"Brown sugar bubble tea", kind:"gift", to:"angelina", price:5, tab:"family", say:"Bubble tea! Brain food for my thesis. Thank you!"},
  highlighters:{n:"Pastel highlighters", kind:"gift", to:"angelina", price:6, tab:"family", say:"Pastel highlighters! My journal articles are going to look so pretty."},
  mochi:{n:"Box of mochi", kind:"gift", to:["marcus", "angelina"], price:8, tab:"family", say:"Mochi! Thank you!",
    says:{marcus:"Mochi, no dairy in it, right? Nice. We'll share. Probably.", angelina:"Mochi! We'll have them on the sofa tonight. Thank you, Mel!"}},
  // The night market (Tuesday and Thursday evenings, tab "night": only sold at its stalls). Street food, sweets and
  // little things, all gifts. Nothing with dairy goes to Marcus.
  friedchicken:{n:"XXL fried chicken", kind:"gift", to:["darren", "marcus", "dad", "gonggong"], price:7, tab:"night", say:"Fried chicken as big as my face!",
    says:{darren:"That's the size of a plate. I love it.", marcus:"Pure protein, Zeh. Okay, and batter. Worth it.", dad:"Wah, Taiwan-style! Crispy. Ah Gong share with Evan.", gonggong:"So big! Gong Gong eat slowly, slowly."}},
  scallion:{n:"Scallion pancake", kind:"gift", to:"family", price:5, tab:"night", say:"Flaky scallion pancake, still hot!",
    says:{evan:"Pancake! Can I tear it?", mama:"Cong you bing! Crispy outside. Very good.", angelina:"Ooh, flaky. Thank you, Mel!"}},
  hotteok:{n:"Hotteok", kind:"gift", to:["evan", "mum", "mama", "angelina"], price:5, tab:"night", say:"Hotteok! Careful, the sugar's like lava.",
    says:{evan:"It's got sugar INSIDE!", mum:"Hotteok! Like the one we had in Seoul. Thank you, darling.", angelina:"Brown sugar and nuts? Okay, study break."}},
  tteokbokki:{n:"Tteokbokki", kind:"gift", to:["darren", "marcus", "angelina", "dad"], price:6, tab:"night", say:"Spicy rice cakes! Chewy and fiery.",
    says:{darren:"Spicy! Good spicy. Pass the water.", marcus:"Tteokbokki! No cheese on it, right? Perfect.", angelina:"Spicy rice cakes! My favourite.", dad:"Aiyo, so spicy! But nice. Very nice."}},
  eggbread:{n:"Egg bread", kind:"gift", to:["evan", "gonggong", "mum", "darren"], price:4, tab:"night", say:"Gyeran-ppang: a whole egg baked into sweet bread.",
    says:{evan:"There's an EGG in my bread!", gonggong:"Egg inside bread? Clever. Gong Gong like."}},
  pearlclip:{n:"Pearl hair clip", kind:"gift", to:["mum", "angelina", "mama"], price:6, tab:"night", say:"A pearl hair clip! So pretty.",
    says:{mum:"Pearls! For my bob. You spoil me.", angelina:"Pearl clip! Wearing it to class tomorrow.", mama:"Pearls for Ma Ma? Aiyo, so pretty. Wear to temple."}},
  clawclip:{n:"Tortoiseshell claw clip", kind:"gift", to:["mum", "angelina"], price:5, tab:"night", say:"A claw clip! Exactly what I needed.",
    says:{mum:"For my Pilates! Hair out of the face.", angelina:"Thesis-writing hair, sorted."}},
  scrunchie:{n:"Velvet scrunchie", kind:"gift", to:["angelina", "mum", "mama"], price:3, tab:"night", say:"A velvet scrunchie! So soft."},
  dinokey:{n:"Glow-in-the-dark dino keychain", kind:"gift", to:"evan", price:4, tab:"night", say:"A DINO! It GLOWS! RAWR!"},
  luckycharm:{n:"Lucky cat phone charm", kind:"gift", to:["angelina", "marcus", "darren"], price:4, tab:"night", say:"A lucky cat! It waves!",
    says:{marcus:"Lucky cat for the bank phone. Huat ah.", darren:"A waving cat. Okay, it's on my keys now."}},
  cosysocks:{n:"Cosy socks", kind:"gift", to:"family", price:4, tab:"night", say:"Fluffy socks! Toasty toes.",
    says:{evan:"They have DINOSAURS on!", mama:"Warm socks for aircon. Good girl.", gonggong:"Socks! Gong Gong's always cold feet. Thank you."}},
  buckethat:{n:"Bucket hat", kind:"gift", to:["darren", "marcus", "dad"], price:7, tab:"night", say:"A bucket hat! Very cool.",
    says:{darren:"Garden hat upgrade. Thanks.", marcus:"Bucket hat? I'm wearing it to the gym.", dad:"A hat for my drawing by the sea. Very nice."}},
  dinotee:{n:"Dinosaur tee", kind:"gift", to:"evan", price:6, tab:"night", say:"A dinosaur shirt! I'm wearing it to bed!"},
  tanghulu:{n:"Tanghulu", kind:"gift", to:"family", price:4, tab:"night", say:"Strawberries in crackly sugar! Crunch!",
    says:{evan:"CRUNCH! It's like glass!", marcus:"Tanghulu! Sugar, sure, but it's fruit. Counts."}},
  eggwaffle:{n:"Egg waffle", kind:"gift", to:["evan", "angelina", "mama", "darren"], price:5, tab:"night", say:"An egg waffle! All the little bubbles.",
    says:{evan:"Bubbles I can EAT!", mama:"Gai daan zai! Ma Ma used to buy these for you, you remember?"}},
  sugarcane:{n:"Sugarcane juice", kind:"gift", to:"family", price:3, tab:"night", say:"Fresh sugarcane juice! So refreshing.",
    says:{gonggong:"Sugarcane! With lemon? Shiok.", dad:"Ah, sugarcane. Like the hawker centre. Thank you, darling."}},
  grassjelly:{n:"Grass jelly drink", kind:"gift", to:["gonggong", "mama", "dad", "mum"], price:3, tab:"night", say:"Grass jelly! Cooling for the body.",
    says:{mama:"Leong fun! Very cooling. Good for heaty body.", gonggong:"Grass jelly! Gong Gong's favourite when young."}},
  // Sunday farmers market specials (tab "market": only sold at the market stalls, never at Hana's). Gifts for the family:
  // to "family" goes to whichever of Evan, Darren, Ma Ma and Gong Gong is nearest; a list names who it suits.
  // says: what each one says (falls back to say)
  honey:{n:"Jar of wildflower honey", kind:"gift", to:"family", price:8, tab:"market", say:"Wildflower honey! Straight from the bees.",
    says:{evan:"Honey! Like Pooh bear! Can I lick the spoon?", darren:"Proper honey. That's going in my tea.", mama:"Honey! Good for the throat. Ma Ma will make honey lemon.", gonggong:"Raw honey? Wah, this one is the real thing.",
      mum:"Honey! Perfect after my Zumba. Thank you, darling.", dad:"Honey for my throat. Good for the singing.", marcus:"Honey? For my toast tomorrow. Nice one, Zeh.", angelina:"Honey for my tea! Study fuel. Thank you!"}},
  honeycomb:{n:"Honeycomb", kind:"gift", to:"family", price:10, tab:"market", say:"A whole piece of honeycomb! You chew the wax.",
    says:{evan:"It's all sticky and hexagons! Bees made this?", darren:"Honeycomb on toast tomorrow. Sorted.", mama:"Honeycomb! When Ma Ma was small this was such a treat.", gonggong:"Honeycomb! Chew chew, then spit out the wax. Like last time."}},
  beecandle:{n:"Beeswax candle", kind:"gift", to:["darren", "mama", "gonggong", "mum", "angelina"], price:9, tab:"market", say:"A beeswax candle. It smells like honey when it burns.",
    says:{darren:"Smells like honey. Nice for the evenings.", mama:"So pretty! Ma Ma will light it at dinner.", gonggong:"Beeswax? Burns long, this one. Good quality."}},
  soap_lav:{n:"Lavender soap", kind:"gift", to:["darren", "mama", "gonggong", "mum", "angelina"], price:6, tab:"market", say:"Handmade lavender soap. It smells like a garden.",
    says:{darren:"Lavender. Very relaxing. I'll take the hint.", mama:"Smell! So fragrant. Too nice to use!", gonggong:"Soap? Ah, it smells nice. Put in the bathroom."}},
  soap_rose:{n:"Rose and oat soap", kind:"gift", to:["darren", "mama", "gonggong", "mum", "angelina"], price:6, tab:"market", say:"Rose and oat soap, made by hand.",
    says:{mama:"Rose! Ma Ma's favourite. You remember.", darren:"Rose and oat? Fancy. Thank you.", gonggong:"Rose? For Ma Ma, I think. I'll give it to her."}},
  soap_duck:{n:"Little duck soap", kind:"gift", to:"evan", price:5, tab:"market", say:"A DUCK soap! Bath time! Quack quack!"},
  scrub:{n:"Sugar scrub", kind:"gift", to:["darren", "mama", "mum", "angelina"], price:9, tab:"market", say:"A sugar scrub, all handmade.",
    says:{mama:"Scrub for the hands! After gardening, so good.", darren:"Sugar scrub? I'll try it. Don't tell anyone."}},
  paleale:{n:"Craft pale ale", kind:"gift", to:["darren", "gonggong", "dad", "marcus"], price:8, tab:"market", say:"A craft pale ale. Brewed just up the road.",
    says:{darren:"Ooh, a local pale ale. That's my Sunday arvo sorted.", gonggong:"Beer! Cold one, later. Don't tell Ma Ma."}},
  stout:{n:"Craft stout", kind:"gift", to:["darren", "gonggong", "dad", "marcus"], price:9, tab:"market", say:"A dark craft stout, small batch.",
    says:{darren:"A stout! Rich and dark. I'm saving this for the weekend.", gonggong:"Black beer! Like Guinness last time. Very good."}},
  sandpit:{n:"Sandpit", kind:"keep", to:"evan", price:150, tab:"family", say:"A sandpit at home! Evan's already digging."},
  truck:{n:"Toy truck", kind:"keep", to:"evan", price:80, tab:"family", say:"Vroom vroom! Evan won't put it down."},
  headphones:{n:"Headphones", kind:"keep", to:"darren", price:120, tab:"family", say:"Noise-cancelling! Darren's calls just got calmer."},
  treehouse:{n:"Evan's treehouse", kind:"keep", to:"evan", price:800, tab:"family", say:"A treehouse in the swing tree! Evan's already up the ladder."},
  hammock:{n:"Hammock", kind:"keep", to:"darren", price:250, tab:"family", say:"A hammock by the pond. Darren's evenings are sorted."},
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
  loaf:{n:"Loaf of bread", kind:"ingredient", sell:2, what:"baked in the wine shop's oven"},
  milk:{n:"Milk", kind:"ingredient", price:4, tab:"deli", sell:3, what:"for gelato at the Scoop Shack, or two make a cheese in the wine shop's kitchen press (the farm stand sells it, and Wildflower Farm's cows give it)"},
  goatmilk:{n:"Goat's milk", kind:"ingredient", price:5, sell:3, what:"from Wildflower Farm's goats: for gelato at the Scoop Shack, or the kitchen's cheese press (like milk)"},
  syrup:{n:"Petal syrup", kind:"ingredient", sell:4, what:"from the kitchen (three garden flowers): gelato, a bonbon filling, or a lemon and petal posset"},
  yoghurt:{n:"Pot of yoghurt", kind:"ingredient", price:5, sell:3, what:"made in Wildflower Farm's barn: frozen yoghurt at the Scoop Shack, or yoghurt with honey at the kitchen"},
  honey_lav:{n:"Jar of lavender honey", kind:"gift", to:"family", price:9, say:"Lavender honey! It smells like the flower farm.", says:{mama: "Lavender honey? Ma Ma put in tea. So fragrant!"}},
  honey_blossom:{n:"Jar of orchard blossom honey", kind:"gift", to:"family", price:9, say:"Orchard blossom honey, from Ma Ma's trees? That's lovely.", says:{mama: "From my trees! The bees know where the good flowers are."}},
  chz_fresh:{n:"Fresh goat's cheese", kind:"gift", to:["darren", "mama", "gonggong", "mum", "dad", "angelina"], price:8, say:"Fresh goat's cheese! On toast with honey. Perfect.", says:{darren: "Goat's cheese and crackers tonight. Sorted."}},
  chz_cheddar:{n:"Wedge of farmhouse cheddar", kind:"gift", to:["darren", "mama", "gonggong", "mum", "dad", "angelina"], price:9, say:"Farmhouse cheddar, from Elena's cave! Sharp and crumbly.", says:{dad: "Proper cheese. Ah Gong approves."}},
  chz_blue:{n:"Wedge of Honeybrook blue", kind:"gift", to:["darren", "dad", "angelina"], price:10, say:"A blue! Bold choice. I love it.", says:{darren: "Blue cheese and a glass of your red. Perfect evening."}},
  chz_brie:{n:"Wedge of barn brie", kind:"gift", to:["darren", "mama", "gonggong", "mum", "dad", "angelina"], price:10, say:"Brie! Soft and creamy. I'm having this on everything.", says:{angelina: "Brie and crackers and a quiet evening. Perfect."}},
  chz_halloumi:{n:"Block of goat's halloumi", kind:"gift", to:["darren", "mama", "gonggong", "mum", "dad", "angelina"], price:9, say:"Halloumi! Fried in a pan till it squeaks. Yes please.", says:{darren: "Halloumi on the barbecue this weekend. Sorted."}},
  chz_smoked:{n:"Wedge of smoked farmhouse", kind:"gift", to:["darren", "dad", "gonggong", "angelina"], price:10, say:"Smoked cheese! It smells like a campfire. In a good way.", says:{gonggong: "Smoky one! Gong Gong likes. With beer."}},
  honey_cream:{n:"Jar of creamed honey", kind:"gift", to:"family", price:10, say:"Creamed honey! It spreads like butter. Toast is about to get serious.", says:{evan: "HONEY BUTTER! On everything!"}},
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
// Home decor: bought once, shows up inside Mel's house. Items in the same slot swap (one wallpaper, one rug at a time).
export const DECOR = {
  wall_dots:   {ico:"wallpaper", n:"Polka wallpaper",  slot:"wall", val:"dots",   price:20},
  wall_stripe: {ico:"wallpaper", n:"Stripe wallpaper", slot:"wall", val:"stripe", price:20},
  wall_flower: {ico:"wallpaper", n:"Flower wallpaper", slot:"wall", val:"flower", price:25},
  rug_round:   {ico:"rug",       n:"Round rug",        slot:"rug",  val:"round",  price:20},
  rug_stripe:  {ico:"rug",       n:"Striped rug",      slot:"rug",  val:"stripe", price:20},
  lamp:        {ico:"lamp",      n:"Reading lamp",     slot:"lamp", val:"on",     price:15},
  big_plant:   {ico:"pot",       n:"Big plant",        slot:"plant",val:"on",     price:10},
  painting:    {ico:"painting",  n:"Painting",         slot:"art",  val:"on",     price:20},
  fox_bed:     {ico:"bed",       n:"Maple's cosy bed", slot:"bed",  val:"on",     price:25, tab:"me", where:"room"},   // upgrades her basket in Mel's room
  // "Me & my room" tab: things for Mel's own room, and things Mel wears (shown on her in the village)
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
// Storybook seasons by the real (Singapore) calendar: spring Mar-May, summer Jun-Aug, autumn Sep-Nov, winter Dec-Feb.
// Hana's seeds rotate with them (anything already bought or planted carries on), and so do the tapas of the day.
export const SEASONS = {spring: {n: "Spring", line: "Blossom and fresh greens"}, summer: {n: "Summer", line: "Sun-ripe and juicy"},
  autumn: {n: "Autumn", line: "Harvest time"}, winter: {n: "Winter", line: "Cosy roots and soups"}};
export const seasonOf = day => { const m = +String(day).slice(5, 7); return m >= 3 && m <= 5 ? "spring" : m >= 6 && m <= 8 ? "summer" : m >= 9 && m <= 11 ? "autumn" : "winter"; };
export const QUEST_BOOST = 30*M;

export const LEVELS = [
  {xp:0, name:"new friend"}, {xp:10, name:"snack buddy", gift:"a rose scarf"},
  {xp:25, name:"cushion pal", gift:"a little plant"}, {xp:45, name:"den mate", gift:"fairy lights"},
  {xp:70, name:"cosy companion", gift:"bunting"}, {xp:100, name:"best fox friend"},
  {xp:140, name:"fox soulmate"}, {xp:190, name:"forever den"}
];
export const PEP = ["You don't have to feel ready. You just have to open it.", "Small and steady still counts. This is how the week moves.",
  "You've done harder things than this before lunch.", "Start messy. Tidy later. That's allowed.", "I'll be right here. Go on."];
export const YAY = ["Quest complete! ✨", "Look at you go!", "Done! Happy fox wiggle.", "Quest done. Proud of you, properly."];

// From the orchard and flower farm: fruit (food Maple can eat, or stock for the wine shop's fruit crate), bouquets
// (give one to anybody in the village) and potted flowers (set one in a pot spot: home, the wine shop, your room).
const capi = s => s[0].toUpperCase() + s.slice(1);
const FRUIT_SAY = {cherry: "Cherries! I'll save you the stones.", lemon: "A lemon? *sniff* *sneeze* Fresh!", peach: "Fuzzy and sweet. Ma Ma grew this!", mango: "Mango! Sticky chin, happy fox.",
  apple: "Crunchy! Thank you", pear: "A juicy pear. Drip, drip.", fig: "A fig! Fancy.", orange: "Peel it for me? Please?", persimmon: "Persimmon! Like eating a little sunset."};
Object.values(TREES).forEach(t => { const it = ITEMS[t.fruit] = ITEMS[t.fruit] || {n: capi(t.fn[0]), kind: "food", say: FRUIT_SAY[t.fruit] || "Fruit from Ma Ma's orchard!"}; it.fruit = true; it.sell = it.sell || t.sell; });
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
// round 112: a kite (Hana's Family shelf, the fair's kite stall): fly it on the field with Evan; and clams from the
// fishmonger's van on Friday evenings
Object.assign(ITEMS, {kite: {n: "Kite", kind: "toy", price: 12, tab: "family", what: "fly it on the field (the open grass by the river), with Evan if he's about"},
  clams: {n: "Clams", kind: "ingredient", sell: 2, what: "from the fishmonger's van: clams with garlic and lemon, at the kitchen"}});
// the herbs themselves (mint is already on Hana's deli shelf)
Object.assign(ITEMS, {garlic: {n: "Garlic", kind: "ingredient", sell: 1, what: "from the greenhouse: gambas, garlicky tapas"}, basil: {n: "Basil", kind: "ingredient", sell: 1, what: "from the greenhouse: bruschetta, basil gelato, a bonbon filling"},
  rosemary: {n: "Rosemary", kind: "ingredient", sell: 1, what: "from the greenhouse: rosemary potatoes, a rosemary bonbon, gelato"}, chives: {n: "Chives", kind: "ingredient", sell: 1, what: "from the greenhouse: a chive omelette"},
  thyme: {n: "Thyme", kind: "ingredient", sell: 1, what: "from the greenhouse: roast tapas, thyme and lemon gelato"}});
export const itemIco = id => ITEMS[id] && ITEMS[id].kind === "seed" ? "seed:" + ITEMS[id].crop : id;
Object.keys(ITEMS).forEach(id => { ITEMS[id].ico = itemIco(id); });
Object.keys(CROPS).forEach(id => { CROPS[id].ico = id; });
