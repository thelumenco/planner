// Shop items, crops, garden plots and friendship levels.
import { H, M } from "../util.js";
import { TREES, FLOWERS } from "./orchard.js";

export const CROPS = {
  tulip:{n:"Tulip", e:"🌷", dur:1*H}, sunflower:{n:"Sunflower", e:"🌻", dur:1*H},
  carrot:{n:"Carrot", e:"🥕", dur:4*H}, corn:{n:"Corn", e:"🌽", dur:4*H},
  strawberry:{n:"Strawberry", e:"🍓", dur:24*H}, blueberry:{n:"Blueberry", e:"🫐", dur:24*H},
  tomato:{n:"Tomato", dur:6*H}, potato:{n:"Potato", dur:8*H}, pepper:{n:"Pepper", dur:6*H},
  pea:{n:"Peas", dur:4*H}, pumpkin:{n:"Pumpkin", dur:24*H}, leek:{n:"Leek", dur:8*H}
};
export const ITEMS = {
  tulip_seed:{e:"🌷", n:"Tulip seeds", kind:"seed", price:2, crop:"tulip", tab:"seeds", seasons:["spring"]},
  sunflower_seed:{e:"🌻", n:"Sunflower seeds", kind:"seed", price:3, crop:"sunflower", tab:"seeds", seasons:["summer"]},
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
  milk:{n:"Goat's milk", kind:"ingredient", sell:6, what:"two make a cheese in the kitchen press"},
  egg:{n:"Fresh egg", kind:"food", sell:5, say:"A fresh egg from our hens! Breakfast sorted."},
  tulip:{e:"🌷", n:"Tulip", kind:"flower", sell:4, say:"For me? I'll tuck it behind my ear."},
  sunflower:{e:"🌻", n:"Sunflower", kind:"flower", sell:5, say:"So sunny! Thank you."},
  carrot:{e:"🥕", n:"Carrot", kind:"food", sell:6, say:"Homegrown crunch!"},
  corn:{e:"🌽", n:"Corn", kind:"food", sell:8, say:"Sweet corn! Nom."},
  strawberry:{e:"🍓", n:"Strawberry", kind:"food", sell:14, xp:2, say:"Strawberries from our garden 🥹"},
  blueberry:{e:"🫐", n:"Blueberries", kind:"food", sell:14, xp:2, say:"Blueberries! My favourite."},
  tomato:{n:"Tomato", kind:"food", sell:7, say:"A sun-warm tomato. Mmm."},
  potato:{n:"Potato", kind:"food", sell:6, say:"A potato? Raw? Brave. Okay."},
  pepper:{n:"Pepper", kind:"food", sell:7, say:"Crunchy pepper! Spicy? No. Phew."},
  pea:{n:"Peas", kind:"food", sell:5, say:"Pop, pop, pop. Fresh peas!"},
  pumpkin:{n:"Pumpkin", kind:"food", sell:16, xp:2, say:"A whole pumpkin? I'll just... sit on it."},
  leek:{n:"Leek", kind:"food", sell:7, say:"A leek. Very tall. Very serious."}
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
export const itemIco = id => ITEMS[id] && ITEMS[id].kind === "seed" ? "seed:" + ITEMS[id].crop : id;
Object.keys(ITEMS).forEach(id => { ITEMS[id].ico = itemIco(id); });
Object.keys(CROPS).forEach(id => { CROPS[id].ico = id; });
