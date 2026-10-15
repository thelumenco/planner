// Bali's goods (round 219). Ingredients for the kitchen (three Bali specials) and the gelato counter and bonbon
// table (Bali vanilla, lemongrass, kaffir lime leaves, snake fruit); gifts and keepsakes from the market, Ketut's
// silver workshop, Ibu Wayan's offerings house and the warung. Every sell price is below the buy price.
export const BA_GOODS = {
  ba_vanilla: {n: "Bali vanilla pods", kind: "ingredient", price: 12, sell: 6, shop: "ba_market", art: ["sticks", "#3A2A20", "#C9A27E"], what: "the best vanilla gelato you'll ever make; a bonbon filling"},
  lemongrass: {n: "Lemongrass", kind: "ingredient", price: 3, sell: 1, shop: "ba_market", art: ["sticks", "#B9D98A", "#7FA35A"], what: "satay lilit at the kitchen (a Bali special); lemongrass gelato"},
  kaffir: {n: "Kaffir lime leaves", kind: "ingredient", price: 3, sell: 1, shop: "ba_market", art: ["bag", "#5E8A3A", "#B9D98A"], what: "satay lilit at the kitchen; a bonbon filling with a zing"},
  blackrice: {n: "Black rice", kind: "ingredient", price: 4, sell: 2, shop: "ba_market", art: ["bag", "#2F2440", "#8A6A9A"], what: "black rice pudding at the kitchen (a Bali special)"},
  salak: {n: "Snake fruit", kind: "ingredient", price: 5, sell: 2, shop: "ba_market", art: ["apple", "#7A3A2A", "#F3E7C8"], what: "snake fruit fritters at the kitchen; a tangy gelato"},
  ba_coffee: {n: "Bali coffee", kind: "gift", to: ["dad", "darren", "marcus", "gonggong"], price: 9, shop: "ba_market", art: ["bag", "#5A3A2A", "#C9A27E"], say: "Bali coffee from the highlands! Smells like chocolate and smoke. Tomorrow's breakfast is sorted."},
  ba_sarong: {n: "Batik sarong", kind: "gift", to: ["mum", "mama", "angelina"], price: 14, shop: "ba_market", art: ["cloth", "#C9483A", "#E3C26A"], say: "A batik sarong! Look at the pattern, all little birds and flowers. Beach, here I come."},
  ba_basket: {n: "Woven basket", kind: "gift", to: ["mama", "mum"], price: 8, shop: "ba_market", art: ["box", "#C9A27E", "#8A6A52"], say: "A woven basket with a lid! Perfect for the market. Ma Ma approves of the weaving."},
  ba_kite: {n: "Balinese kite", kind: "gift", to: ["evan", "marcus", "dad"], price: 10, shop: "ba_market", art: ["bird", "#E8566C", "#F3D34A"], say: "A kite shaped like a fish with a long ribbon tail! We're flying this the first windy day."},
  ba_carving: {n: "Carved frangipani", kind: "keepsake", price: 12, shop: "ba_market", art: ["disc", "#F6E7DC", "#E3C26A"], line: "A frangipani flower carved from pale wood, so fine you half expect it to smell sweet."},
  ba_silverear: {n: "Silver filigree earrings", kind: "gift", to: ["mum", "angelina", "mama"], price: 28, shop: "ba_silver", art: ["pin", "#D6D0C6", "#FFFDF6"], say: "Silver filigree earrings, like tiny lace! Ketut made these? With his hands? They're perfect."},
  ba_silverfrangi: {n: "Silver frangipani brooch", kind: "keepsake", price: 24, shop: "ba_silver", art: ["disc", "#D6D0C6", "#F3E7C8"], line: "A frangipani made of silver wire, petal by petal, by Ketut. It catches the light like dew."},
  ba_incense: {n: "Frangipani incense", kind: "gift", to: "family", price: 3, shop: "ba_offer", art: ["sticks", "#E8C27A", "#F6E7DC"], say: "Frangipani incense from Ibu Wayan! The house is going to smell like a temple garden."},
  ba_magnet: {n: "Bali fridge magnet", kind: "gift", to: "family", price: 3, shop: "ba_warung", magnet: true, art: ["disc", "#3E8A5A", "#F3D34A"], say: "A tiny rice terrace and a frangipani! Going on the fridge."}
};
// earned there (round 221): the carved Garuda for six offerings at six shrines
Object.assign(BA_GOODS, {
  ba_garuda: {n: "Carved Garuda", kind: "keepsake", price: 0, art: ["bird", "#C9483A", "#E3C26A"], line: "A carved and painted Garuda, wings spread, from Ibu Wayan: for the six offerings you made and placed at six shrines across the island."}
});
