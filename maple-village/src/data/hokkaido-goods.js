// Hokkaido's goods (round 223). Ingredients for the kitchen (three Hokkaido specials: king crab hotpot, a seafood rice
// bowl and miso butter corn) and the gelato counter and bonbon table (Hokkaido milk, Yubari melon); gifts and keepsakes
// from Haruko's market hall, Kenta's glassworks, Mrs Sato's ryokan, the ski lodge and the flower farm café.
// Every sell price is below the buy price.
export const HK_GOODS = {
  hk_milk: {n: "Hokkaido milk", kind: "ingredient", price: 3, sell: 1, shop: "hk_cafe", art: ["bottle", "#FFFDF6", "#9FC3D9"], what: "miso butter corn at the kitchen (a Hokkaido special); the creamiest milk gelato; a soft milk bonbon filling"},
  hk_melon: {n: "Yubari melon", kind: "ingredient", price: 9, sell: 4, shop: "hk_cafe", art: ["globe", "#F2A65A", "#9CC27E"], what: "a melon gelato as orange as a sunset; a sweet melon bonbon filling"},
  kingcrab: {n: "King crab legs", kind: "ingredient", price: 9, sell: 4, shop: "hk_hall", art: ["fish", "#D8573A", "#F3E7C8"], what: "king crab hotpot and the seafood rice bowl at the kitchen (Hokkaido specials)"},
  unikura: {n: "Sea urchin and salmon roe tray", kind: "ingredient", price: 8, sell: 4, shop: "hk_hall", art: ["box", "#F2A23A", "#E8563A"], what: "the seafood rice bowl at the kitchen (a Hokkaido special): sweet uni and bright little pearls of ikura"},
  kombu: {n: "Kombu seaweed", kind: "ingredient", price: 3, sell: 1, shop: "hk_hall", art: ["sticks", "#3E5A3A", "#7A8A5A"], what: "the broth for king crab hotpot at the kitchen (a Hokkaido special)"},
  hk_musicbox: {n: "Glass music box", kind: "gift", to: ["angelina", "mum", "evan"], price: 16, shop: "hk_glass", art: ["box", "#9FC3D9", "#E3C26A"], say: "A music box from Otaru! Wind it up and the little glass lid twinkles while it plays. I could listen to it all day."},
  hk_namachoc: {n: "Nama chocolate", kind: "gift", to: "family", price: 8, shop: "hk_cafe", art: ["box", "#5A3A2A", "#F3E7C8"], say: "Nama chocolate, made with Hokkaido cream! It melts the second it touches your tongue. One square each. Maybe two."},
  hk_biscuits: {n: "White chocolate biscuits", kind: "gift", to: "family", price: 6, shop: "hk_hall", art: ["box", "#FFFDF6", "#7FB8E8"], say: "Those crisp butter biscuits with white chocolate in the middle! The tin has snowy mountains on it. Kettle on, everyone."},
  hk_beanie: {n: "Ski beanie", kind: "gift", to: ["darren", "marcus", "dad"], price: 10, shop: "hk_lodge", art: ["beanie", "#C8432F", "#FFFDF6"], say: "A proper ski beanie with a bobble! From Niseko? I'm wearing it now, even indoors. Especially indoors."},
  hk_yukata: {n: "Cotton yukata", kind: "gift", to: ["mum", "mama", "angelina"], price: 18, shop: "hk_ryokan", art: ["cloth", "#2E3A70", "#F6E7DC"], say: "A cotton yukata from a real ryokan! Indigo with little white cranes. I'm wearing it every evening this summer."},
  hk_bathsalts: {n: "Onsen bath salts", kind: "gift", to: "family", price: 5, shop: "hk_ryokan", art: ["jar", "#CFE0EE", "#E3C26A"], say: "Bath salts from the hot springs! A spoonful in the bath and it's like being in the valley. I'm having a long soak tonight."},
  hk_driedflowers: {n: "Dried flower bunch", kind: "gift", to: ["mum", "mama"], price: 7, shop: "hk_cafe", art: ["bouquet", "#B98ACF", "#E8566C"], say: "Dried flowers from the farm in Hokkaido! Lupins and statice and baby's breath. They'll keep their colour all winter."},
  hk_magnet: {n: "Hokkaido fridge magnet", kind: "gift", to: "family", price: 3, shop: "hk_cafe", magnet: true, art: ["disc", "#E8566C", "#FFFDF6"], say: "A tiny snowy mountain with a red crane flying over it! Going on the fridge."},
  hk_float: {n: "Otaru glass float", kind: "keepsake", price: 12, shop: "hk_glass", art: ["globe", "#7FC9C0", "#CFE0EE"], line: "A round glass float in a little rope net, sea green and full of bubbles, like the ones Otaru's herring boats once used. It glows on the windowsill."},
  hk_owl: {n: "Carved fish owl", kind: "keepsake", price: 22, shop: "hk_glass", art: ["owl", "#8A6A52", "#E3C26A"], line: "A Blakiston's fish owl carved from a single block of wood by an Ainu woodcarver from Lake Akan. The Ainu call it the god who protects the village. Every feather is a single cut."}
};
// earned there (round 225): your own glass float, blown at Kenta's furnace; the Hokkaido seasons scroll
Object.assign(HK_GOODS, {
  hk_myfloat: {n: "Your own glass float", kind: "keepsake", price: 0, art: ["globe", "#5FB0D9", "#F3E7C8"], line: "A glass float you blew yourself at Kenta's furnace in Otaru, a little lopsided and full of tiny bubbles. Kenta says the lopsided ones are the ones the sea likes best."},
  hk_scroll: {n: "The Hokkaido seasons scroll", kind: "keepsake", price: 0, art: ["tile", "#F6E7DC", "#E8739A"], line: "A long painted scroll of Hokkaido through the year: cherry blossom on the canal, rainbow stripes of flowers, red maples at Niseko and cranes dancing in the snow. A stamp for every season you came."}
});
