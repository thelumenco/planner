// round 228: the creator's surprise bouquets, one for each of her eight notes, each in its own colours (the first is
// the original pink one, "cr_bouquet"). Shared by the items (game/creator.js), the icons (art/icons.js) and the vase
// in your room (art/orchard.js).
export const CR_BOUQUETS = [
  {id: "cr_bouquet",  n: "Surprise bouquet", what: "Roses, sweet peas and a sprig of lavender", cols: ["#E8728A", "#F2B8C8", "#D9435A", "#B9A3E0", "#F6E3A1"]},
  {id: "cr_bouquet2", n: "Sunshine bouquet", what: "Sunflowers, buttercups and marigolds", cols: ["#F6C744", "#F9E08B", "#F29A3A", "#FFF3C4", "#E8B04A"]},
  {id: "cr_bouquet3", n: "Bluebell bouquet", what: "Bluebells, cornflowers and white stocks", cols: ["#7FA6E0", "#B9CDF0", "#5A7FC8", "#FFFFFF", "#C8B8E8"]},
  {id: "cr_bouquet4", n: "Peony bouquet", what: "Coral peonies and peach roses", cols: ["#F49A80", "#F7C3B0", "#E8705A", "#FBE3D6", "#F2B8C8"]},
  {id: "cr_bouquet5", n: "Meadow bouquet", what: "Daisies, cow parsley and a few buttercups", cols: ["#FFFFFF", "#F6E3A1", "#DDEBC8", "#FFFFFF", "#F9E08B"]},
  {id: "cr_bouquet6", n: "Berry bouquet", what: "Deep red dahlias, plum anemones and pink astilbe", cols: ["#A8324A", "#C8506E", "#7A3A6E", "#E8A0B4", "#9A7CC8"]},
  {id: "cr_bouquet7", n: "Lavender bouquet", what: "Lavender, lilac and purple stocks", cols: ["#9A7CC8", "#B9A3E0", "#C8B8E8", "#7E62B0", "#E8DDF6"]},
  {id: "cr_bouquet8", n: "Sweet pea bouquet", what: "Sweet peas in every pastel", cols: ["#F2B8C8", "#C8B8E8", "#B9E0D0", "#F9E08B", "#F7C3B0"]}
];
export const crBouquet = id => CR_BOUQUETS.find(b => b.id === id) || null;
