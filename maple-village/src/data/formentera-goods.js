// Formentera's goods (round 232). Ingredients for the kitchen (three Formentera specials: ensalada payesa, flaó and fig
// bread) and the gelato counter and bonbon table (flor de sal, dried figs); gifts and keepsakes from the salt works, the
// chiringuito, Margalida's bakery, La Mola lighthouse, Joan's bikes and the hippy market at La Mola (shop "fm_market").
// Every sell price is below the buy price.
export const FM_GOODS = {
  flordesal: {n: "Flor de sal", kind: "ingredient", price: 6, sell: 2, shop: "fm_salt", art: ["jar", "#FFFDF6", "#9FC3D9"], what: "the fine crust skimmed off the top of the salt pans: a salted caramel gelato at the Scoop Shack; a salted caramel bonbon filling"},
  peixsec: {n: "Dried fish (peix sec)", kind: "ingredient", price: 5, sell: 2, shop: "fm_bar", art: ["fish", "#C9A06A", "#8A6A42"], what: "ensalada payesa at the kitchen (a Formentera special): the island's salad of potato, tomato and dried fish, dried in the sun on the pines by the sea"},
  fm_fig: {n: "Dried Formentera figs", kind: "ingredient", price: 4, sell: 1, shop: "fm_bakery", art: ["bag", "#8A5A7A", "#E3C26A"], what: "fig bread at the kitchen (a Formentera special), with almonds; a fig gelato at the Scoop Shack and a fig bonbon filling"},
  fm_cheese: {n: "Fresh sheep's cheese", kind: "ingredient", price: 5, sell: 2, shop: "fm_bakery", art: ["wedge", "#F6EEDC", "#E3C26A"], what: "flaó at the kitchen (a Formentera special): the island's mint and cheese tart"},
  fm_herbsalt: {n: "Herb salt", kind: "gift", to: "family", price: 6, shop: "fm_salt", art: ["jar", "#9CC27E", "#FFFDF6"], say: "Salt from the Formentera pans with rosemary and thyme in it! I'm putting it on everything. Tomatoes. Eggs. Possibly toast."},
  fm_bathsalt: {n: "Salt bath crystals", kind: "gift", to: ["mei", "hana", "hazel"], price: 8, shop: "fm_salt", art: ["jar", "#F4C7CF", "#9FC3D9"], say: "Bath crystals from the salt pans! Pink and smelling of lavender. A long soak tonight, and nobody is to knock on the door."},
  fm_biscuits: {n: "Almond biscuits", kind: "gift", to: "family", price: 5, shop: "fm_bakery", art: ["box", "#E8C88A", "#FFFDF6"], say: "Almond biscuits from the bakery in Formentera! Crumbly and not too sweet. Kettle on, these won't last."},
  fm_basket: {n: "Woven palm basket", kind: "gift", to: ["farid", "mei"], price: 12, shop: "fm_bar", art: ["tote", "#D9B87A", "#3E9BC7"], say: "A palm basket woven by hand! It smells like a summer holiday. I'm taking it to the market on Sunday."},
  fm_sandals: {n: "Leather sandals", kind: "gift", to: ["posy", "hana"], price: 16, shop: "fm_market", art: ["sock", "#A8794E", "#E3C26A"], say: "Handmade leather sandals from the hippy market! They fit perfectly. My feet feel like they're on holiday already."},
  fm_bracelet: {n: "Hippy bead bracelet", kind: "gift", to: ["posy", "tomi", "juniper"], price: 4, shop: "fm_market", art: ["beads", "#3E9BC7"], say: "A bead bracelet from La Mola market! Turquoise like the sea there. I'm never taking it off."},
  fm_postcards: {n: "Lighthouse postcards", kind: "gift", to: "family", price: 3, shop: "fm_light", art: ["tile", "#3E9BC7", "#FFFDF6"], say: "Postcards of the Formentera lighthouses, all three! I'm sticking the La Mola one on the fridge. The others I'm actually going to send."},
  fm_cyclecap: {n: "Cycling cap", kind: "gift", to: ["tomi", "bo", "theo"], price: 8, shop: "fm_bikes", art: ["beanie", "#3E9BC7", "#FFFDF6"], say: "A proper cycling cap from Formentera! Peak up, very professional. I'm off for a ride. A short one. To the shop."},
  fm_magnet: {n: "Formentera fridge magnet", kind: "gift", to: "family", price: 3, shop: "fm_bar", magnet: true, keep: true, line: "A tiny white lighthouse on a turquoise sea, from Formentera.", art: ["disc", "#3E9BC7", "#FFFDF6"], say: "A tiny white lighthouse on a turquoise sea! Going on the fridge."},
  fm_saltjar: {n: "Painted salt jar", kind: "keepsake", price: 12, shop: "fm_salt", art: ["jar", "#FFFDF6", "#3E6B8C"], line: "A little clay jar painted with blue salt pans and a pink flamingo on one leg, with a cork lid and a wooden spoon tied to it with string. It smells faintly of the sea."},
  fm_dreamcatcher: {n: "Dreamcatcher", kind: "keepsake", price: 14, shop: "fm_market", art: ["ring", "#C9A06A", "#3E9BC7"], line: "A dreamcatcher from the La Mola market: a willow hoop, a web of cotton thread, turquoise beads and a few white feathers. It turns slowly in the window, catching the light."}
};
// earned there (round 234): your own jar of flor de sal from raking with Toni; the painted lighthouse for the three
// lighthouse stamps; and the silver ring Rainbow makes for you
Object.assign(FM_GOODS, {
  fm_myflor: {n: "Your own flor de sal", kind: "keepsake", price: 0, art: ["jar", "#FFFDF6", "#E8739A"], line: "A little jar of flor de sal you raked and skimmed yourself on the Formentera salt pans, with Toni's handwriting on the label. Only the sun, the wind and you made it."},
  fm_lighthouse: {n: "The painted lighthouse", kind: "keepsake", price: 0, art: ["candle", "#FFFDF6", "#3E9BC7"], line: "A little wooden lighthouse painted white with a blue door, for stamping all three of Formentera's lights: the harbour light at La Savina, Cap de Barbaria and La Mola."},
  fm_ring: {n: "Rainbow's silver ring", kind: "keepsake", price: 0, art: ["ring", "#D9DDE2", "#3E9BC7"], line: "A plain silver ring Rainbow made for you at her stall under the pines at La Mola, hammered by hand, with a tiny wave stamped inside. She says it will always find its way back to the island."}
});
