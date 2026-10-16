// The holiday cottages on the lane (round 236, Mel: "a mini landlord game in itself"). Elena sells Fig Tree, then
// Bluebell; each has a downstairs (sitting room and kitchen), an upstairs (bedroom and bathroom) up a flight of
// wooden stairs like the mill's, and a back garden with a hot tub. Furniture comes out of a catalogue in three
// tiers and arrives on the next morning's train; accessories are one-off touches. Shared by the logic
// (game/lets.js) and the drawings (art/cottages.js), so the two always agree on where everything stands.

export const COTTAGES = {
  figtree:  {n: "Fig Tree", price: 2000, base: 34, line: "the little one with the fig tree by the door"},
  bluebell: {n: "Bluebell", price: 3000, base: 44, line: "the bigger one with the blue shutters"}
};
export const COTTAGE_IDS = Object.keys(COTTAGES);
// scene ids: `${c}_down`, `${c}_up`, `${c}_garden`
export const FLOORS = ["down", "up", "garden"];
export const coScene = (c, f) => `${c}_${f}`;
export const coOf = scene => { const m = /^(figtree|bluebell)_(down|up|garden)$/.exec(scene || ""); return m ? {c: m[1], f: m[2]} : null; };

// Six looks (decided with the farm, round 93). Colours the drawings use for walls, floor, wood, fabric and accents.
export const STYLES = {
  cottagecore: {n: "Cottagecore", line: "Florals, gingham, dried flowers and a dresser full of mismatched china.",
    wall: "#F6EBDD", wall2: "#E9D7C2", floor: "#C99B6D", floor2: "#B5865A", wood: "#A8754F", fabric: "#E8A6A0", fabric2: "#F4D3C8", accent: "#7FA06B", metal: "#B9A27A"},
  japandi: {n: "Japandi", line: "Pale oak, linen, low furniture, one perfect branch in a vase.",
    wall: "#EFEAE2", wall2: "#E0D8CC", floor: "#D9C6A6", floor2: "#C8B38F", wood: "#C2A27C", fabric: "#D8D0C4", fabric2: "#BDB3A4", accent: "#5E6B5A", metal: "#3E3A36"},
  coastal: {n: "Coastal", line: "White and sea blue, rope, driftwood and striped cushions.",
    wall: "#EEF5F7", wall2: "#D8E8EE", floor: "#D8CDB8", floor2: "#C6B99F", wood: "#C9B79A", fabric: "#7FB0CF", fabric2: "#DDEBF2", accent: "#2F6E9E", metal: "#9FB3BF"},
  midcentury: {n: "Mid-century", line: "Teak, mustard and teal, tapered legs and a sunburst clock.",
    wall: "#F3EBDC", wall2: "#E2D4BA", floor: "#B07B4E", floor2: "#9A6840", wood: "#8E5A34", fabric: "#D9A33A", fabric2: "#2F7F7A", accent: "#C8553D", metal: "#C9A86A"},
  peranakan: {n: "Peranakan", line: "Jade and pink, painted tiles, carved teak and pretty porcelain.",
    wall: "#F4E9E4", wall2: "#E5D2CB", floor: "#E9DCC8", floor2: "#5FA59A", wood: "#6E4430", fabric: "#E58FA6", fabric2: "#7CC0B0", accent: "#2E6E8E", metal: "#C9A23A"},
  scandi: {n: "Scandi", line: "White walls, birch, sheepskin and candles in the windows.",
    wall: "#F7F6F2", wall2: "#E8E6E0", floor: "#E3D5BF", floor2: "#D2C2A8", wood: "#D9BE96", fabric: "#C9CED2", fabric2: "#F2F0EA", accent: "#3E5A72", metal: "#2F2F2F"}
};
export const STYLE_IDS = Object.keys(STYLES);
export const REPAINT = 120;   // changing a cottage's look later (the furniture keeps its tier and takes the new colours)

// Furniture: three tiers each (tier 0 = not there yet). `at` is where the piece stands (its front edge, centre x);
// `stand` is where Mel stands to use it. `basic` pieces must all be in before a cottage can open for bookings.
const T = (a, b, c, p) => [{n: a, price: p[0]}, {n: b, price: p[1]}, {n: c, price: p[2]}];
export const PIECES = {
  // downstairs: the sitting room on the left, the kitchen on the right
  sofa:      {room: "down", n: "Sofa", at: [170, 372], stand: [170, 410], basic: true, tiers: T("Second-hand sofa", "Linen sofa", "Deep velvet sofa", [80, 220, 420])},
  armchair:  {room: "down", n: "Armchair", at: [300, 380], stand: [300, 418], tiers: T("Wicker chair", "Reading armchair", "Wingback with a footstool", [40, 120, 260])},
  coffee:    {room: "down", n: "Coffee table", at: [226, 446], stand: [226, 480], tiers: T("Crate table", "Oak coffee table", "Table with a glass top and books", [30, 90, 180])},
  rug:       {room: "down", n: "Rug", at: [226, 470], stand: [226, 500], tiers: T("Rag rug", "Wool rug", "Big hand-knotted rug", [25, 80, 170])},
  fireplace: {room: "down", n: "Fireplace", at: [110, 250], stand: [110, 290], tiers: T("Little wood burner", "Stone fireplace", "Fireplace with a carved mantel", [90, 240, 450])},
  lamp:      {room: "down", n: "Floor lamp", at: [56, 372], stand: [60, 410], tiers: T("Paper lamp", "Brass reading lamp", "Arc lamp", [20, 60, 130])},
  kitchen:   {room: "down", n: "Kitchen", at: [400, 254], stand: [400, 292], basic: true, tiers: T("Two-ring hob and a sink", "Range cooker and dresser", "Farmhouse kitchen with an island shelf", [120, 320, 600])},
  dining:    {room: "down", n: "Dining table", at: [400, 446], stand: [400, 484], basic: true, tiers: T("Fold-out table", "Farmhouse table", "Long table with a bench", [50, 150, 300])},
  bookshelf: {room: "down", n: "Bookshelf", at: [250, 252], stand: [250, 292], tiers: T("Plank shelf", "Full bookcase", "Library wall with a ladder", [30, 100, 220])},
  // upstairs: the bedroom, and the bath behind a half wall on the left
  bed:       {room: "up", n: "Bed", at: [270, 330], stand: [270, 372], basic: true, tiers: T("Metal bed", "Double bed with a quilt", "Four-poster with drapes", [90, 260, 520])},
  bedside:   {room: "up", n: "Bedside tables", at: [270, 316], stand: [190, 360], tiers: T("Stools as tables", "Matching bedsides", "Bedsides with little lamps", [25, 70, 150])},
  wardrobe:  {room: "up", n: "Wardrobe", at: [452, 262], stand: [452, 300], tiers: T("Clothes rail", "Painted wardrobe", "Armoire with a mirror", [30, 110, 240])},
  bath:      {room: "up", n: "Bath", at: [92, 300], stand: [100, 340], tiers: T("Shower tray", "Clawfoot bath", "Copper tub by the window", [80, 260, 520])},
  windowseat:{room: "up", n: "Window seat", at: [400, 172], stand: [380, 230], tiers: T("Cushion on the sill", "Window seat with a throw", "Window seat, bookshelf and fairy lights", [25, 80, 170])},
  bedrug:    {room: "up", n: "Bedroom rug", at: [270, 470], stand: [270, 500], tiers: T("Cotton rug", "Sheepskin", "Big round rug", [20, 70, 150])},
  vanity:    {room: "up", n: "Dressing table", at: [92, 470], stand: [100, 506], tiers: T("Little shelf and mirror", "Dressing table", "Vanity with bulbs round the mirror", [30, 100, 220])},
  // the back garden
  hottub:    {room: "garden", n: "Hot tub", at: [370, 340], stand: [300, 380], tiers: T("Wooden hot tub", "Cedar tub with steps", "Hot tub with lights and a canopy", [600, 900, 1300])},
  patio:     {room: "garden", n: "Garden table", at: [160, 430], stand: [160, 470], tiers: T("Bistro set", "Table and four chairs", "Long table under a pergola", [40, 130, 280])},
  festoon:   {room: "garden", n: "Festoon lights", at: [260, 214], stand: [260, 250], tiers: T("A string of bulbs", "Lights zigzagging over", "Lanterns and lights everywhere", [30, 80, 160])},
  beds:      {room: "garden", n: "Flower beds", at: [260, 244], stand: [260, 280], tiers: T("Pots by the fence", "Cottage borders", "Roses round an arch", [30, 100, 220])},
  hammock:   {room: "garden", n: "Hammock", at: [430, 520], stand: [400, 560], tiers: T("Deckchair", "Hammock", "Hammock and a little day bed", [30, 90, 190])},
  firepit:   {room: "garden", n: "Fire pit", at: [250, 524], stand: [250, 560], tiers: T("Brazier", "Stone fire pit", "Sunken fire pit with benches", [40, 130, 280])}
};
export const PIECE_IDS = Object.keys(PIECES);
export const BASICS = PIECE_IDS.filter(k => PIECES[k].basic);

// Home accessories: one-off buys, each with its place in a room. Small things that make guests happy.
export const ACCESSORIES = {
  cushions: {room: "down", n: "Cushions and a throw", at: [170, 352], price: 25},
  candles:  {room: "down", n: "Candles on the mantel", at: [110, 196], price: 15},
  flowers:  {room: "down", n: "A jug of fresh flowers", at: [400, 412], price: 12},
  prints:   {room: "down", n: "Framed prints", at: [180, 96], price: 30},
  records:  {room: "down", n: "Record player and records", at: [250, 196], price: 60},
  diffuser: {room: "down", n: "A lavender diffuser", at: [330, 236], price: 18},
  linen:    {room: "up", n: "Crisp linen and a quilt", at: [270, 300], price: 40},
  robes:    {room: "up", n: "Two fluffy robes", at: [150, 236], price: 35},
  towels:   {room: "up", n: "Fluffy towels", at: [60, 236], price: 20},
  plant:    {room: "up", n: "A big leafy plant", at: [470, 540], price: 22},
  mirror:   {room: "up", n: "A round mirror", at: [330, 96], price: 28},
  lanterns: {room: "garden", n: "Lanterns on the path", at: [120, 560], price: 24},
  blankets: {room: "garden", n: "Blankets by the fire", at: [290, 524], price: 20},
  birdbath: {room: "garden", n: "A bird bath", at: [80, 300], price: 30}
};
export const ACC_IDS = Object.keys(ACCESSORIES);

// Other places in each room (where Mel stands for them)
export const SPOTS = {
  down: {stairs: [446, 600], garden: [40, 470], calendar: [330, 230], guestbook: [96, 560], catalogue: [150, 560], fridge: [480, 290], basket: [400, 484], tidy: [300, 520]},
  up: {stairs: [80, 600]},   // the bed and the bath are pieces (their own spots)
  garden: {house: [260, 600]}   // the hot tub is a piece
};
export const ARRIVE = {down: [260, 560], up: [130, 560], garden: [260, 560]};
export const BOUNDS = [30, 250, 490, 600];

// the changeover after guests leave: the first three must be done before the next guests arrive (the hot tub too,
// if there is one); the fruit basket and the welcome fridge are the extra touches guests love
export const TASKS = {
  beds:   {n: "Strip and make the bed", floor: "up", spot: "bed", need: true},
  bath:   {n: "Clean the bathroom, fresh towels", floor: "up", spot: "bath", need: true},
  tidy:   {n: "Tidy, sweep and wash up", floor: "down", spot: "tidy", need: true},
  hottub: {n: "Skim and test the hot tub", floor: "garden", spot: "hottub", need: true, only: "hottub"},
  basket: {n: "Fill the fruit basket", floor: "down", spot: "basket", fruit: 3},
  fridge: {n: "Welcome treats in the fridge", floor: "down", spot: "fridge", treats: 2}
};
export const FRUIT = ["apple", "pear", "fig", "orange", "peach", "cherry", "lemon", "mango", "persimmon", "tangerine", "strawberry", "blueberry"];
export const TREATS = ["milk", "egg", "honey", "cheese", "chz_fresh", "chz_cheddar", "chz_blue", "chz_brie", "chz_halloumi", "chz_havarti", "chz_banon", "chz_smoked"];
export const HOUSEKEEPER = {n: "Hattie", fee: 14};   // does the beds, bathroom, tidy and hot tub at eleven; the basket and fridge stay Mel's
export const CHECKOUT = 10*60, CHECKIN = 15*60, DELIVERY = 9*60 + 17;   // deliveries come off the 9:15 morning train
export const HORIZON = 28;   // days of bookings ahead
