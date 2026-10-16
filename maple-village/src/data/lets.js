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
  // round 221: the bathroom, through a door in the bedroom
  bath: {n: "Bath", tiers: ["A tin tub", "An enamel bath", "A clawfoot bath"], prices: [150, 320, 650], line: "a bath"},
  basin: {n: "Basin and mirror", tiers: ["A washstand and a little mirror", "A china basin and an oval mirror", "A marble basin and a gilt mirror"], prices: [60, 140, 300], line: "a basin"},
  towels: {n: "Towels", tiers: ["Cotton towels on a hook", "Fluffy towels on a rail", "Thick towels on a warm rail"], prices: [20, 50, 110], line: "towels"},
  bathmat: {n: "Bath mat", tiers: ["A cotton bath mat", "A tufted bath mat", "A wooden slatted mat"], prices: [15, 35, 80], line: "a bath mat"},
  toiletries: {n: "Toiletries", tiers: ["Soap in a dish", "A basket of soaps and salts", "A tray of oils, salts and candles"], prices: [15, 40, 90], line: "nice things to wash with"},
  touches: {n: "Little touches", tiers: ["A jar of wildflowers", "Cushions and a throw", "A tea tray, a vase and a basket of books"], prices: [15, 40, 90], line: "a welcome"}
};
// a cottage won't let without these
export const ESSENTIAL = ["bed", "linen", "bath"];

// the two cottages: their price, the cap on the nightly rate, and their slots (and where each piece stands in the room)
export const COTTAGES = {
  bluebell: {n: "Bluebell", price: 3000, cap: 70, sleeps: 4, line: "the bigger one, blue shutters, two bedrooms under the eaves",
    // downstairs: the sitting room and dining table by the fire; upstairs: two beds under the eaves; through the bedroom: the bathroom
    slots: {curtains: [110, 124], picture: [246, 96], shelf: [450, 254], seat: [150, 392], lamp: [52, 360], rug: [262, 414], table: [372, 420], plant: [352, 290],
      bed: [116, 330], linen: [116, 338], bed2: [364, 330], linen2: [364, 338], touches: [220, 286],
      bath: [150, 336], basin: [372, 262], towels: [462, 262], bathmat: [150, 410], toiletries: [282, 304], bplant: [454, 476]},
    up: ["bed", "linen", "bed2", "linen2", "touches"], bath: ["bath", "basin", "towels", "bathmat", "toiletries", "bplant"],
    cats: {bed2: "bed", linen2: "linen", bplant: "plant"}},
  figtree: {n: "Fig Tree", price: 2000, cap: 50, sleeps: 2, line: "the little one, a fig tree by the door, one bedroom and a window seat",
    // downstairs: the window seat, the range, a sofa and a table; upstairs: the bedroom under the beams, and the bathroom off it
    slots: {curtains: [100, 122], picture: [200, 96], shelf: [450, 254], seat: [150, 400], lamp: [52, 370], rug: [276, 420], table: [380, 430], plant: [222, 300],
      bed: [250, 330], linen: [250, 338], touches: [356, 300],
      bath: [150, 336], basin: [372, 262], towels: [462, 262], bathmat: [150, 410], toiletries: [282, 304], bplant: [454, 476]},
    up: ["bed", "linen", "touches"], bath: ["bath", "basin", "towels", "bathmat", "toiletries", "bplant"],
    cats: {bplant: "plant"}}
};
// which floor a slot is on: "down", "up" or "bath" (the bathroom, off the bedroom)
export const floorOf = (cottage, slot) => COTTAGES[cottage].bath.includes(slot) ? "bath" : COTTAGES[cottage].up.includes(slot) ? "up" : "down";
export const upstairs = (cottage, slot) => floorOf(cottage, slot) !== "down";

// round 221: the garden out of the back door, and things for it. Each raises the most the cottage can charge a night.
export const EXTRAS = {
  garden: {n: "A proper garden", line: "flower beds, a mown lawn and a gravel path", price: 300, add: 5},
  patio: {n: "Patio table and chairs", line: "for breakfast outside", price: 250, add: 4},
  lights: {n: "Fairy lights", line: "strung along the fence", price: 120, add: 2},
  hammock: {n: "A hammock", line: "between two posts", price: 180, add: 3},
  firepit: {n: "A fire pit", line: "with logs and a ring of stones", price: 400, add: 6},
  bbq: {n: "A barbecue", line: "a little charcoal one", price: 350, add: 5},
  bikes: {n: "Bikes for guests", line: "two bikes with baskets", price: 500, add: 6},
  hottub: {n: "A hot tub", line: "wood-fired, with a view of the hills", price: 1500, add: 15}
};

// round 221: bookings, changeovers and the welcome
// guests book a few days ahead (LEAD), no further than HORIZON days; between stays there are `buffer` changeover days
// (1 to 3, your choice: the day they leave counts as the first). The better the last review, the sooner the next booking (IDLE[stars] extra days).
export const BOOK = {lead: [2, 4], horizon: 21, buffers: [1, 2, 3], idle: [3, 3, 2, 1, 1, 0]};
// what you can leave for the guests: a fruit basket (up to 3) and the fridge (up to 4: your wine, cheese, chocolate, bread...)
export const WELCOME = {fruit: 3, fridge: 4, tip: 4, need: 2};   // a good welcome (2+ fruit and 2+ in the fridge, and tidy) adds a star; a tip of 4 a thing
export const FRIDGE = ["cheese", "chz_fresh", "chz_blue", "goatcheese", "chocolate", "bar_milk", "bar_dark", "bar_white", "box4", "box4d", "box9", "box9d", "loaf", "croissant", "figjam", "honey", "honey_lav",
  "honey_blossom", "honey_cream", "lavhoney", "olivejar", "olives", "cider", "milk", "egg", "bananabread", "eggtart", "pinklemonade", "honeylemon", "pairbox"];
// an untidy cottage when guests arrive costs two stars
export const UNTIDY = 2;
// Nell, who'll do the changeovers for you (and stock the welcome from a pantry cupboard you keep filled)
export const KEEPER = {name: "Nell", fee: {bluebell: 35, figtree: 25}};
export const catOf = (cottage, slot) => COTTAGES[cottage].cats[slot] || slot;

// stays: one to five nights; after each stay the cottage needs a tidy before the next booking. The better the last
// review, the sooner the next guests book (days after the tidy).
export const STAY = {min: 1, max: 5};
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
