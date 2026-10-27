// Portovenere's goods (round 211). Ingredients for the kitchen (three Portovenere specials) and the gelato counter and
// bonbon table (chestnut flour, salted capers, wild fennel seeds); gifts; and (round 204, the creator: "a shop that sells
// seashell ornaments that I can bring home"), Signora Lia's shell ornaments, every one a keepsake for a shelf.
// Every sell price is below the buy price.
export const PV_GOODS = {
  mussels: {n: "Mussels", kind: "ingredient", price: 8, sell: 4, shop: "pv_mussels", art: ["bag", "#2F3A4A", "#8FA8B8"], what: "stuffed mussels at the kitchen (a Portovenere special)"},
  chestnutflour: {n: "Chestnut flour", kind: "ingredient", price: 6, sell: 3, shop: "pv_bar", art: ["bag", "#A8754F", "#E8D3B8"], what: "castagnaccio at the kitchen; chestnut gelato; a bonbon filling"},
  capers: {n: "Salted capers", kind: "ingredient", price: 4, sell: 2, shop: "pv_bar", art: ["jar", "#7A8A4A", "#E8E2D0"], what: "spaghetti with capers and tomato at the kitchen; a savoury gelato surprise"},
  fennelseed: {n: "Wild fennel seeds", kind: "ingredient", price: 3, sell: 1, shop: "pv_bar", art: ["jar", "#A8B86A", "#F3E7C8"], what: "a fennel gelato, or a bonbon filling"},
  pv_pandolce: {n: "Pandolce", kind: "gift", to: "family", price: 9, shop: "pv_bar", art: ["loaf", "#D9A86A", "#8A5A3A"], say: "Pandolce! Raisins and candied peel and pine nuts and fennel. It's like Christmas cake went on holiday."},
  pv_poems: {n: "Poems of the Gulf", kind: "gift", to: ["juniper", "theo", "posy", "hazel"], price: 12, shop: "pv_books", art: ["box", "#3E6B8C", "#E3C26A"], say: "A little book of the poems written about the Gulf of Poets! I'll read one every night."},
  pv_bookmark: {n: "Pressed-flower bookmark", kind: "gift", to: "family", price: 4, shop: "pv_books", art: ["tile", "#F3E7C8", "#E8A0B4"], say: "A bookmark with a real pressed caper flower in it. So delicate!"},
  pv_magnet: {n: "Striped church magnet", kind: "gift", to: "family", price: 3, shop: "pv_books", magnet: true, keep: true, line: "The little striped church of San Pietro on its rock, from Portovenere.", art: ["disc", "#2F2B28", "#FFFDF6"], say: "The little striped church on its rock! Going on the fridge."},
  pv_coaster: {n: "Portoro marble coaster", kind: "keepsake", price: 14, shop: "pv_bottega", art: ["disc", "#1E1E22", "#E3C26A"], line: "A coaster of black portoro marble, veined with gold like lightning. Ilario says the gold is older than the dinosaurs."},
  pv_bowl: {n: "Little marble bowl", kind: "keepsake", price: 28, shop: "pv_bottega", art: ["plate", "#1E1E22", "#E3C26A"], line: "A small bowl carved from one piece of black and gold marble, smooth and cool, for keeping sea glass in."},
  pv_pebble: {n: "Marble pebble paperweight", kind: "gift", to: ["bo", "farid", "okada"], price: 10, shop: "pv_bottega", art: ["disc", "#3A3A40", "#E3C26A"], say: "A marble paperweight shaped like a sea pebble. It's heavy in the best way."},
  // Signora Lia's seashell ornaments
  pv_shellmobile: {n: "Seashell mobile", kind: "keepsake", price: 18, shop: "pv_shells", art: ["bell", "#F6E7DC", "#E8A0B4"], line: "Little white and pink shells strung on driftwood, turning in the slightest breeze and clinking softly, like the sea whispering."},
  pv_shellbox: {n: "Shell-covered box", kind: "keepsake", price: 16, shop: "pv_shells", art: ["box", "#F6E7DC", "#C9A0A8"], line: "A wooden box covered all over in tiny shells, cockles and limpets and one perfect cowrie on the lid. For your smallest treasures."},
  pv_shellmirror: {n: "Shell mirror", kind: "keepsake", price: 30, shop: "pv_shells", art: ["globe", "#CFE0EE", "#F6E7DC"], line: "A round mirror framed in a crown of shells, each one placed by hand. Signora Lia says it took her a whole winter."},
  pv_shellwreath: {n: "Shell wreath", kind: "keepsake", price: 22, shop: "pv_shells", art: ["wheel", "#F6E7DC", "#9FC3D9"], line: "A wreath of scallop and cockle shells with a sea-blue ribbon, for hanging on a door. It looks like summer all year."},
  pv_shellboat: {n: "Little shell boat", kind: "keepsake", price: 12, shop: "pv_shells", art: ["fish", "#F6E7DC", "#E3C26A"], line: "A tiny boat made from a mussel shell, with a paper sail and a crew of three even tinier shells."},
  pv_shellframe: {n: "Shell photo frame", kind: "keepsake", price: 14, shop: "pv_shells", art: ["tile", "#F6E7DC", "#C9A27E"], line: "A little photo frame edged with shells and sea glass. Just right for a picture of everyone on the boat."},
  pv_shellgarland: {n: "Shell garland", kind: "gift", to: "family", price: 8, shop: "pv_shells", art: ["roll", "#F6E7DC", "#E8A0B4"], say: "A garland of shells to hang in the window! They clink when the wind blows. I love it."}
};
// earned there (round 212): your line, framed, from the Poets' bookshop; the poet's notebook, all six lines
Object.assign(PV_GOODS, {
  pv_verse: {n: "Your line, framed", kind: "keepsake", price: 0, art: ["tile", "#FFFDF6", "#3E6B8C"], line: "Your own line of poetry, copied out in Signora Bianca's beautiful handwriting and framed, just like the one in her visitors' book."},
  pv_notebook: {n: "The poet's notebook", kind: "keepsake", price: 0, art: ["box", "#7A2E2E", "#E3C26A"], line: "A little red notebook with six lines of poetry in it, one from each corner of Portovenere: the castle, the swifts, the grotto, the church, the mussel ropes and the strait."}
});
