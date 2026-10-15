// Puffin Isle's goods (round 215). Ingredients for the kitchen (three Puffin Isle specials) and the gelato counter and
// bonbon table (sea buckthorn, island thyme honey); gifts from the warden's honesty shelf, the keeper's kitchen, Ivy's
// boathouse and Bryn's tearoom; keepsakes. Every sell price is below the buy price.
export const PI_GOODS = {
  seabuckthorn: {n: "Sea buckthorn berries", kind: "ingredient", price: 6, sell: 3, shop: "pi_tearoom", art: ["jar", "#F28C28", "#FFFDF6"], what: "sea buckthorn tart at the kitchen; a sharp, sunny gelato; a bonbon filling"},
  samphire: {n: "Rock samphire", kind: "ingredient", price: 5, sell: 2, shop: "pi_tearoom", art: ["bag", "#7FA35A", "#C9D9A8"], what: "samphire fritters at the kitchen (a Puffin Isle special)"},
  pi_honey: {n: "Island thyme honey", kind: "ingredient", price: 9, sell: 5, shop: "pi_tearoom", art: ["jar", "#E3B04B", "#B9D9A8"], what: "honey and thyme cake at the kitchen; thyme honey gelato; a bonbon filling"},
  pi_jam: {n: "Bramble jam", kind: "gift", to: "family", price: 5, shop: "pi_tearoom", art: ["jar", "#5A2A4A", "#F3E7C8"], say: "Bramble jam from the island! Blackberries picked off the hedges by the farm. On toast tomorrow."},
  pi_puffin: {n: "Knitted puffin", kind: "gift", to: ["evan", "mama", "angelina", "mum"], price: 8, shop: "pi_warden", art: ["bird", "#2F2B28", "#E8823A"], say: "A little knitted puffin with a bright orange beak! I'm calling him Captain."},
  pi_almanac: {n: "Island almanac", kind: "gift", to: ["dad", "gonggong", "darren", "marcus"], price: 7, shop: "pi_warden", art: ["box", "#3E6B8C", "#F3E7C8"], say: "An island almanac: tides, birds, moons and weather sayings. I'll read it cover to cover."},
  pi_postcard: {n: "Puffin-stamp postcard", kind: "gift", to: "family", price: 2, shop: "pi_kitchen", art: ["tile", "#9FC3D9", "#E8823A"], say: "A postcard from Puffin Isle with the island's very own puffin stamp! Going on the fridge. Well, near it."},
  pi_welshcakes: {n: "Bag of Welsh cakes", kind: "gift", to: "family", price: 4, shop: "pi_kitchen", art: ["box", "#E8C27A", "#C9A24A"], say: "Welsh cakes! Still a bit warm. Sugary and currant-y and gone in about a minute."},
  pi_glassbead: {n: "Sea-glass necklace", kind: "gift", to: ["mum", "angelina", "mama"], price: 18, shop: "pi_studio", art: ["pin", "#9FD3B2", "#FFFDF6"], say: "A sea-glass necklace! Soft green, smoothed by the sea for a hundred years. It's beautiful."},
  pi_driftwood: {n: "Driftwood boat", kind: "keepsake", price: 12, shop: "pi_studio", art: ["fish", "#C9B49C", "#9FC3D9"], line: "A little boat Ivy made from driftwood, with a sea-glass sail. It looks like it's sailing even when it's sitting still."},
  pi_lensmodel: {n: "Little lighthouse lens", kind: "keepsake", price: 20, shop: "pi_kitchen", art: ["globe", "#CFE0EE", "#E3C26A"], line: "A tiny glass model of the great lens in the lamp room, ridged like a beehive. Hold it to a lamp and it throws rainbows."}
};
// made and found there (round 216): your suncatcher from Ivy's bench; the jar of sea glass you find yourself
Object.assign(PI_GOODS, {
  pi_suncatcher: {n: "Sea-glass suncatcher", kind: "keepsake", price: 0, art: ["bell", "#9FD3B2", "#CFE0EE"], line: "Your own suncatcher: pieces of sea glass you chose, wired onto driftwood at Ivy's bench. In a window it scatters coloured light everywhere."},
  pi_glassjar: {n: "Jar of sea glass", kind: "keepsake", price: 0, art: ["jar", "#9FD3B2", "#C8324A"], line: "A jar of sea glass you found yourself on Puffin Isle, one of every colour: white, green, brown, blue, aqua, purple, and the rarest of all, a little piece of red. It glows on the windowsill."}
});
