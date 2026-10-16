// Elena's holiday cottages (round 219, PUBLIC.md "Elena sells her cottages"). Bluebell and Fig Tree on the cottage lane
// by the station are Elena's holiday lets until you reach five hearts with her; then she offers to sell them to you.
// Then they're yours to furnish from the catalogue and let, a little Airbnb: the game sets the nightly rate from how
// nice and how complete the furniture is, up to each cottage's cap.
//
// Each cottage has fixed slots, one piece of furniture each. A piece is a category (what it is), a tier (simple,
// good, fine) and a colour. The catalogue sells every category in every tier and colour; an order comes on the next
// day's train, in parcels in the cottage's hall, to unpack and put in place.

export const TIERS = [null, {n: "Simple", f: 1}, {n: "Good", f: 2}, {n: "Fine", f: 3}];
// colours a piece can come in (the art tints it)
export const COLOURS = {sage: ["Sage", "#9DB08A"], blue: ["Cornflower", "#7FA0D0"], rose: ["Rose", "#E3A5B0"], ochre: ["Ochre", "#D9A84A"], cream: ["Cream", "#F3E7C8"]};
// what each category is called in each tier, and its price ([simple, good, fine])
export const CATS = {
  bed: {n: "Bed", tiers: ["A pine bed", "An oak bed", "A brass bedstead"], prices: [120, 260, 520], line: "somewhere to sleep"},
  linen: {n: "Bed linen", tiers: ["Cotton sheets and a blanket", "A quilt and feather pillows", "A patchwork quilt, linen sheets and a mountain of pillows"], prices: [30, 70, 140], line: "made up and inviting"},
  seat: {n: "Armchair or sofa", tiers: ["A cane armchair", "A comfy sofa", "A velvet sofa and a footstool"], prices: [90, 200, 420], line: "somewhere to sit"},
  table: {n: "Table and chairs", tiers: ["A pine table and two chairs", "An oak table and four chairs", "A farmhouse table and ladderback chairs"], prices: [100, 220, 450], line: "somewhere to eat"},
  shelf: {n: "Shelves", tiers: ["A plank shelf", "A painted bookcase", "A glass-fronted dresser"], prices: [60, 140, 300], line: "somewhere for things"},
  lamp: {n: "Lamp", tiers: ["A paper lantern", "A brass reading lamp", "A stained-glass lamp"], prices: [25, 60, 130], line: "light"},
  rug: {n: "Rug", tiers: ["A rag rug", "A woven wool rug", "A hand-knotted rug"], prices: [30, 80, 170], line: "something underfoot"},
  curtains: {n: "Curtains", tiers: ["Cotton curtains", "Linen curtains", "Lined chintz curtains"], prices: [25, 60, 130], line: "curtains at the window"},
  picture: {n: "Picture", tiers: ["A print in a frame", "A watercolour of the brook", "An oil painting of the vineyard"], prices: [20, 50, 120], line: "something on the walls"},
  plant: {n: "Plant", tiers: ["A pot of geraniums", "A fern on a stand", "A potted lemon tree"], prices: [15, 35, 80], line: "something growing"},
  touches: {n: "Little touches", tiers: ["A jar of wildflowers", "Cushions and a throw", "A tea tray, a vase and a basket of books"], prices: [15, 40, 90], line: "a welcome"}
};
// a cottage won't let without these
export const ESSENTIAL = ["bed", "linen"];

// the two cottages: their price, the cap on the nightly rate, and their slots (and where each piece stands in the room)
export const COTTAGES = {
  bluebell: {n: "Bluebell", price: 3000, cap: 70, sleeps: 4, line: "the bigger one, blue shutters, two bedrooms under the eaves",
    // downstairs: the sitting room and dining table by the fire; upstairs: two little bedrooms either side of the stairs
    slots: {curtains: [110, 124], picture: [246, 96], shelf: [450, 254], seat: [150, 392], lamp: [52, 360], rug: [262, 414], table: [372, 420], plant: [352, 290],
      bed: [130, 330], linen: [130, 338], bed2: [390, 330], linen2: [390, 338], touches: [260, 286]},
    up: ["bed", "linen", "bed2", "linen2", "touches"],
    cats: {bed2: "bed", linen2: "linen"}},
  figtree: {n: "Fig Tree", price: 2000, cap: 50, sleeps: 2, line: "the little one, a fig tree by the door, one bedroom and a window seat",
    // downstairs: the window seat, the range, a sofa and a table; upstairs: the bedroom under the beams
    slots: {curtains: [100, 122], picture: [200, 96], shelf: [450, 254], seat: [150, 400], lamp: [52, 370], rug: [276, 420], table: [380, 430], plant: [222, 300],
      bed: [270, 330], linen: [270, 338], touches: [430, 300]},
    up: ["bed", "linen", "touches"],
    cats: {}}
};
// which floor a slot is on
export const upstairs = (cottage, slot) => COTTAGES[cottage].up.includes(slot);
export const catOf = (cottage, slot) => COTTAGES[cottage].cats[slot] || slot;

// stays: one to five nights; after each stay the cottage needs a tidy before the next booking. The better the last
// review, the sooner the next guests book (days after the tidy).
export const STAY = {min: 1, max: 5, gap: [5, 5, 4, 3, 2, 1]};   // gap[stars]
// who comes: day visitors and couples off the train (reusing the village's tourist pool is done in game/lets.js)
export const GUEST_POOL = ["aiko", "ben", "clara", "dev", "rosa", "bastien", "grace", "hiro", "noa", "jun", "bea", "omar", "tae", "ivy", "rafe"];
// what guests write in the guest book, by stars
export const REVIEWS = {
  5: ["Perfect in every way. We didn't want to leave. We're already planning next year.", "The nicest cottage we've ever stayed in. The bed! The quilt! The view of the brook!", "Like staying with a friend who has wonderful taste. Five stars isn't enough."],
  4: ["Lovely and cosy, everything we needed. We'll be back.", "Beautifully done. A little more on the walls and it'd be perfect.", "Comfortable, clean and charming. The village is a dream."],
  3: ["A nice little place to stay. A bit bare in places, but comfortable enough.", "Clean and quiet. We'd have liked somewhere to sit in the evening.", "Fine for a few nights. It has potential!"],
  2: ["It's a bed and a roof. Pretty village though.", "A bit sparse. We spent most of our time at the wine shop.", "Clean, but it felt half-finished."],
  1: ["Very basic. We hope it gets some love.", "There was a bed. That's about it."]
};
