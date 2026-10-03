// Shop items, crops, garden plots and friendship levels.
import { H, M } from "../util.js";

export const CROPS = {
  tulip:{n:"Tulip", e:"🌷", dur:1*H}, sunflower:{n:"Sunflower", e:"🌻", dur:1*H},
  carrot:{n:"Carrot", e:"🥕", dur:4*H}, corn:{n:"Corn", e:"🌽", dur:4*H},
  strawberry:{n:"Strawberry", e:"🍓", dur:24*H}, blueberry:{n:"Blueberry", e:"🫐", dur:24*H}
};
export const ITEMS = {
  tulip_seed:{e:"🌷", n:"Tulip seeds", kind:"seed", price:2, crop:"tulip", tab:"seeds"},
  sunflower_seed:{e:"🌻", n:"Sunflower seeds", kind:"seed", price:3, crop:"sunflower", tab:"seeds"},
  carrot_seed:{e:"🥕", n:"Carrot seeds", kind:"seed", price:3, crop:"carrot", tab:"seeds"},
  corn_seed:{e:"🌽", n:"Corn seeds", kind:"seed", price:4, crop:"corn", tab:"seeds"},
  strawberry_seed:{e:"🍓", n:"Strawberry seeds", kind:"seed", price:6, crop:"strawberry", tab:"seeds"},
  blueberry_seed:{e:"🫐", n:"Blueberry seeds", kind:"seed", price:6, crop:"blueberry", tab:"seeds"},
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
  tulip:{e:"🌷", n:"Tulip", kind:"flower", sell:4, say:"For me? I'll tuck it behind my ear."},
  sunflower:{e:"🌻", n:"Sunflower", kind:"flower", sell:5, say:"So sunny! Thank you."},
  carrot:{e:"🥕", n:"Carrot", kind:"food", sell:6, say:"Homegrown crunch!"},
  corn:{e:"🌽", n:"Corn", kind:"food", sell:8, say:"Sweet corn! Nom."},
  strawberry:{e:"🍓", n:"Strawberry", kind:"food", sell:14, xp:2, say:"Strawberries from our garden 🥹"},
  blueberry:{e:"🫐", n:"Blueberries", kind:"food", sell:14, xp:2, say:"Blueberries! My favourite."}
};
export const PLOTS = Array.from({length:12}, (_, i) => ({x:70 + (i%3)*140, y:172 + Math.floor(i/3)*104, w:100, h:66}));
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
