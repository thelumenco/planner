// Village layout, building interiors (stations) and task -> place/spot matching.
import { hash, now, H } from "../util.js";

// Outdoor screens. "base" is home (house, garden, pond, shed, swing); "village" is the town square with the work
// buildings. A river joins them: walk onto the bridge to cross. A third screen (say, for Luna) would be one more
// OUTDOOR entry, a pair of bridge places and a BRIDGES/ARRIVE line.
export const OUTDOOR = ["base", "village", "lane", "vineyard", "orchard", "flowers"];
export const VILLAGE = {
  // town square
  hall:   {scene:"village", name:"Town hall", short:"the town hall", door:[170,180], mark:[132,64]},
  bank:   {scene:"village", name:"Bank", short:"the bank", door:[380,178], mark:[380,46]},
  chord:  {scene:"lane", name:"Chord workshop", short:"the Chord workshop", door:[145,272], mark:[145,150]},
  fresh:  {scene:"village", name:"Fresh Pages library", short:"the library", door:[85,368], mark:[95,256]},
  chico:  {scene:"lane", name:"Chico cottage", short:"Chico cottage", door:[380,282], mark:[380,170]},
  post:   {scene:"village", name:"Post office", short:"the post office", door:[435,502], mark:[435,386]},
  market: {scene:"village", name:"Market", short:"the market", door:[362,350], mark:[362,290]},
  board:  {scene:"village", name:"Quest board", door:[260,338], spot:true, line:"All of today's quests, in one place."},
  well:   {scene:"village", name:"Well", door:[196,414], spot:true, line:"Fresh water! Glug glug."},
  news:   {scene:"village", name:"Good news board", door:[90,488], spot:true, line:"The good news board. Fresh every morning."},
  bench:  {scene:"village", name:"Riverside bench", door:[334,580], spot:true, line:"A bench by the river. Lunch spot for half the town."},
  toLane: {scene:"village", name:"Gate to Makers' Lane", door:[444,218], spot:true, bridge:"lane", mark:[430,170], line:"Through the gate to Makers' Lane: Chord and Chico."},
  // Makers' Lane: the apps (Chord, Chico, and a plot waiting for the next one)
  toTownE:{scene:"lane", name:"Gate to the town square", door:[20,330], spot:true, bridge:"village", mark:[34,282], line:"Back to the town square."},
  toVineL:{scene:"lane", name:"Path to the vineyard", door:[262,622], spot:true, bridge:"vineyard", mark:[300,586], line:"Down the lane to the vineyard."},
  plot3:  {scene:"lane", name:"Luna's plot", door:[160,540], spot:true, line:"Luna's plot. Waiting for its building."},
  plot4:  {scene:"lane", name:"Ohayo's plot", door:[362,540], spot:true, line:"Ohayo's plot. Waiting for its building."},
  toBase: {scene:"village", name:"Bridge home", door:[260,598], spot:true, bridge:"base", mark:[260,548], line:"Over the bridge and home."},
  // home base
  home:   {scene:"base", name:"Home", short:"home", door:[260,308], mark:[260,160]},
  farm:   {scene:"base", name:"Garden", short:"the garden", door:[108,492], mark:[108,384]},
  pond:   {scene:"base", name:"Pond", door:[318,560], spot:true, line:"The pond. Best break spot there is."},
  shed:   {scene:"base", name:"Shed", door:[430,280], spot:true, line:"Darren's shed. Tools, seed packets and one very old radio."},
  letterbox:{scene:"base", name:"Letterbox", door:[184,326], spot:true, line:"The letterbox. The morning paper lands here."},
  run:    {scene:"base", name:"Animal run", door:[198,566], spot:true, line:"The animal run. Clucks, cheeps and little hops."},
  swing:  {scene:"base", name:"Tree swing", door:[112,318], spot:true, line:"Evan's swing. Push, push, wheee!"},
  toVine: {scene:"base", name:"Gate to the vineyard", door:[490,470], spot:true, bridge:"vineyard", mark:[494,416], line:"Over the footbridge to the vineyard."},
  // the vineyard, east of home: vines, the barrel shed, the stall, the wine shop and a playground
  toBaseV:{scene:"vineyard", name:"Gate home", door:[22,300], spot:true, bridge:"base", mark:[30,250], line:"Back over the footbridge, home."},
  toLaneV:{scene:"vineyard", name:"Path to Makers' Lane", door:[290,16], spot:true, bridge:"lane", mark:[330,40], line:"Up the path to Makers' Lane."},
  wineshop:{scene:"vineyard", name:"Wine shop", short:"the wine shop", door:[390,222], mark:[390,96]},
  barrels:{scene:"vineyard", name:"Barrel shed", door:[112,238], spot:true, mark:[112,130], line:"The barrel shed. Grapes go in, wine comes out. Eventually."},
  vinestall:{scene:"vineyard", name:"Vineyard stall", door:[90,452], spot:true, line:"Cuttings, trellises and barrels."},
  pswing: {scene:"vineyard", name:"Swings", door:[110,594], spot:true, line:"The swings. Wheee!"},
  pslide: {scene:"vineyard", name:"Slide", door:[262,592], spot:true, line:"The slide. Down you go!"},
  olive:  {scene:"vineyard", name:"Olive tree", door:[250,262], spot:true, line:"The olive tree. Olives every few hours, once it's planted."},
  pseesaw:{scene:"vineyard", name:"Seesaw", door:[410,600], spot:true, line:"The seesaw. Up, down, up, down."},
  toOrchard:{scene:"base", name:"Gate to Ma Ma's orchard", door:[26,180], spot:true, bridge:"orchard", mark:[40,120], line:"Along the path to Ma Ma's orchard."},
  // Ma Ma's orchard, west of home: fruit trees, the farm shop and her cottage; her flower farm is further west
  toBaseO:{scene:"orchard", name:"Gate home", door:[498,278], spot:true, bridge:"base", mark:[490,226], line:"Back along the path, home."},
  toFlowers:{scene:"orchard", name:"Gate to the flower farm", door:[22,278], spot:true, bridge:"flowers", mark:[30,226], line:"Through the arch to the flower farm."},
  cottage:{scene:"orchard", name:"Ma Ma's cottage", short:"Ma Ma's cottage", door:[132,228], mark:[132,96]},
  farmshop:{scene:"orchard", name:"Farm shop", door:[415,254], spot:true, mark:[415,140], line:"Ma Ma's farm shop. Fruit and flowers, picked this morning."},
  toOrchardF:{scene:"flowers", name:"Gate to the orchard", door:[498,293], spot:true, bridge:"orchard", mark:[490,240], line:"Back through the arch to the orchard."},
  toTown: {scene:"base", name:"Bridge to town", door:[260,114], spot:true, bridge:"village", mark:[260,62], line:"Over the river to the town square."}
};
// Quests can also happen outdoors at home base: "base" is a quest place whose spots are the base's own places.
VILLAGE.base = {scene:"(quests)", name:"Home base", short:"home base"};
export const BASE_SPOTS = [
  ["swing", /playground|\bpark\b|outing|\bzoo\b|museum|play ?date|play with evan|evan'?s? (activity|class|outing|playtime|swim)|family day|toddler (class|activity)/],
  ["shed",  /garden|plant|weed|prune|repair|diy|gutter|leak|recycl|declutter the|fix (the |a )?(tap|door|shelf|light|sink|toilet|bike|fan)|bike\b|wash the car/],
  ["pond",  /stroll|fresh air|picnic|sit outside|sunshine|walk outside|evening walk|nature walk/]
];
const WORK_HINT = /chord|chico|ambidextrous|fresh pages|client|muse|proposal|invoice|copy|newsletter|launch|website|brand|audit|meeting|call with|zoom/;
// Saturday or Sunday in Singapore
export const isWeekend = () => [0, 6].includes(new Date(now() + 8*H).getUTCDay());
const baseSpotFor = s => (BASE_SPOTS.find(([, re]) => re.test(s)) || [])[0] || null;
// bridges: from outdoor scene -> {to outdoor scene: bridge place}; ARRIVE: where Mel steps off on the other side
export const BRIDGES = {village:{base:"toBase", lane:"toLane"}, base:{village:"toTown", vineyard:"toVine", orchard:"toOrchard"}, lane:{village:"toTownE", vineyard:"toVineL"}, vineyard:{base:"toBaseV", lane:"toLaneV"}, orchard:{base:"toBaseO", flowers:"toFlowers"}, flowers:{orchard:"toOrchardF"}};
// where Mel steps off, by "from>to"
export const ARRIVE = {"village>base":[260,132], "base>village":[260,578], "village>lane":[48,330], "lane>village":[426,238], "base>vineyard":[52,300], "vineyard>base":[462,470], "lane>vineyard":[290,72], "vineyard>lane":[262,586], "base>orchard":[470,278], "orchard>base":[60,196], "orchard>flowers":[466,293], "flowers>orchard":[56,278]};
// the next outdoor screen on the way from one to another (screens form a little chain: base - village - lane)
export function nextHop(from, to){
  if (from === to) return null; if (BRIDGES[from] && BRIDGES[from][to]) return to;
  const seen = {[from]: null}, q = [from];
  while (q.length) { const s = q.shift(); for (const n of Object.keys(BRIDGES[s] || {})) if (!(n in seen)) { seen[n] = s; if (n === to) { let h = n; while (seen[h] !== from) h = seen[h]; return h; } q.push(n); } }
  return null;
}
export const outdoorOf = s => OUTDOOR.includes(s) ? s : INNER[s] ? outdoorOf(INNER[s].parent) : (VILLAGE[s] ? VILLAGE[s].scene : "village");
// Rooms inside another room: Mel's room is through the west door of the house, Evan's through the east door.
// door: where Mel steps into the parent room; arrive: where she steps into the inner room; exit: the inner room's
// own door (on the opposite wall), where she walks to leave.
export const INNER = {
  room: {parent: "home", door: [64, 340], arrive: [456, 400], exit: [486, 410]},
  kidroom: {parent: "home", door: [456, 340], arrive: [70, 420], exit: [34, 410]},
  trophy: {parent: "hall", door: [64, 372], arrive: [456, 400], exit: [486, 410]},
  // the wine shop's kitchen, through the door on its east wall; its own way out is the mat at the bottom
  kitchen: {parent: "wineshop", door: [462, 390], arrive: [260, 560], exit: [260, 606]}
};
export const WORK = ["hall","chord","fresh","chico","post","home"];
export const POS = {A:[120,250], B:[400,250], C:[120,440], D:[400,440], E:[410,598], F:[112,596], G:[292,334], M:[260,400]};
// Each room may place its slots differently via `pos` (falls back to POS). Stations with a null regex are never
// picked for a quest (the market counter, the library's digest shelf).
// Tall pieces (shelves, boards, cabinets, the phone booth) and wall desks stand against the back wall, which meets
// the floor at y≈165: their front edge sits at 165 + their height. Tables, sofas and baskets stay out on the floor.
// station: [id, name, slot, furniture, keyword regex, line, standDy?]  (standDy: where Mel stands, relative to the front edge; default +42)
export const ROOMS = {
  hall:  {name:"Town hall", wall:"#E6E9F5", trim:"var(--peri)", pos:{A:[448,262], B:[110,258], C:[420,474], D:[316,266], E:[118,474], R:[40,362], W:[268,420]}, stations:[
    ["review","Weekly review","W","scrapbook",null,"Your week in the village, in a scrapbook.",30],
    ["trophydoor","Courtyard","R","trophydoor",null,"Out to the courtyard: trophies, kind words, a bench in the sun.",0],
    ["table","Planning table","C","plantable",/plan|strategy|review|ceo|goal|week|month|quarter|budget/,"Your week, month and quarter, from Notion."],
    ["whiteboard","Whiteboard","B","whiteboard",/brainstorm|idea|map|outline|launch|offer|pricing/,"Fresh marker, blank board."],
    ["revenue","Revenue chart","D","chartstand",/invoice|revenue|sales|finance|money|budget|pricing|accounts/,"How the money's flowing, from Chord."],
    ["shelf","Bookshelf","A","shelf",/read|research|learn|course|study/,"Smart books, cosy spines."],
    ["clients","Client table","E","table",/proposal|client|brief|contract|onboard/,"Your client projects, live from Chord."]]},
  chord: {name:"Chord workshop", wall:"#E9F0E2", trim:"var(--sage)", pos:{A:[130,218], B:[370,446], C:[420,262], D:[120,540], E:[262,336]}, stations:[
    ["bench","Workbench","A","bench",/build|code|fix|bug|feature|ship|deploy|test|app|flow/,"Tools out. Let's build."],
    ["press","Printing press","B","press",/post|content|social|marketing|launch|campaign|newsletter|reel/,"Hot off the press."],
    ["wall","Client wall","C","cork",/client|user|customer|support|feedback|onboard|lead/,"Every face here is a creative you're helping."],
    ["laptop","Laptop desk","D","desk",/./,"The Chord dashboard awaits."],
    ["status","Health sign","E","healthchord",null,"Last night's Chord bug check."]]},
  fresh: {name:"Fresh Pages library", wall:"#F6E8DC", trim:"var(--peach)", pos:{A:[110,540], B:[410,540], C:[420,250], D:[260,420], E:[100,262]}, stations:[
    ["desk","Writing desk","A","desk",/write|draft|blog|article|essay|journal/,"Pen, paper, quiet."],
    ["typewriter","Typewriter","B","typewriter",/copy|sales page|website|caption|headline|email/,"Clack clack. Words incoming."],
    ["nook","Reading nook","C","nook",/read|review|edit|research|audit|feedback/,"Comfy chair, good lamp."],
    ["digest","Digest shelf","E","bookcase",null,"Juniper's shelf of book digests."]]},
  chico: {name:"Chico cottage", wall:"#F7E3E6", trim:"var(--blush)", pos:{A:[400,530], B:[420,262], C:[130,530], D:[130,320], E:[290,350]}, stations:[
    ["laptop","Laptop desk","A","desk",/build|fix|app|code|feature|bug|test|ship/,"Chico's engine room."],
    ["shelf","Craft shelf","B","craft",/design|brand|content|post|icon|copy/,"Colours, stickers, ideas."],
    ["sofa","Cosy sofa","C","sofa",/user|beta|tester|feedback|call|interview|parent/,"Perfect for chats with parents."],
    ["kitchen","Kitchen table","D","table",/plan|family|schedule|meal|roadmap/,"Where family plans happen."],
    ["status","Health sign","E","healthchico",null,"Last night's Chico bug check."]]},
  post:  {name:"Post office", wall:"#E3EEF5", trim:"var(--sky)", pos:{A:[260,340], B:[436,258], C:[400,530], D:[110,216], E:[72,440]}, stations:[
    ["counter","Sorting counter","A","counter",/email|inbox|reply|message|dm|respond/,"Letters in, letters out."],
    ["cabinet","Filing cabinet","B","cabinet",/admin|file|doc|contract|tax|form|organi/,"A place for everything."],
    ["scales","Stamps & scales","C","scales",/invoice|pay|bill|stripe|account|bank|receipt|expense|price/,"Weigh it, stamp it, send it."],
    ["ledge","Writing ledge","D","desk",/./,"A tidy little ledge for odd jobs."],
    ["pobox","Post box","E","pobox",null,"Your post box: unread mail from your work inbox."]]},
  // Evan's door is on the east wall (opposite Mel's), so Darren's desk sits where the laundry was and the basket
  // moved down beside the cleaning cupboard: the walk from the exit to either door stays clear.
  home:  {name:"Home", wall:"#F8EED8", trim:"var(--butter)", pos:{A:[120,216], B:[414,228], H:[318,250], C:[124,450], R:[40,330], K:[480,330], D:[350,556], G:[436,448], E:[448,598], F:[96,596]}, stations:[
    ["desk","Home desk","A","desk",/./,"Your own little desk."],
    ["kitchen","Kitchen","B","kitchen",/cook|meal|lunch|dinner|bake|grocer|prep/,"Something smells good."],
    ["sofa","Sofa","C","sofa",/read|rest|journal|meditat|book|nap/,"Soft cushions, deep breaths."],
    ["mydoor","My room","R","sidedoor",null,"Your room. Just you.",0],
    ["kiddoor","Evan's room","K","kiddoor",null,"Evan's room. Dinosaurs welcome.",0],
    ["laundry","Laundry","D","laundry",/fold|laundry|clothes|wash|iron/,"Fold, stack, done."],
    ["cupboard","Cleaning cupboard","E","cupboard",/clean|tidy|wipe|hestia|dust/,"Hestia's chores live in here."],
    ["fridge","Fridge","H","fridge",null,"The fridge: what we have, and the shopping list."],
    ["treadmill","Treadmill","F","treadmill",/treadmill/,"1.2 and go. Walk and work.",-12],
    ["office","Darren's desk","G","office",null,"Darren's home office. Shh, he might be on a call."]]},
  // Mel's own room, through the door on the west wall of the house. Just her (and Maple): no quests, no visitors.
  room:  {name:"My room", wall:"#EFE3EE", trim:"var(--blush)", noBoard:true, pos:{A:[262,300], W:[262,206], B:[72,262], E:[62,396], C:[66,500], D:[434,556], J:[260,594], N:[406,132]}, stations:[
    ["routines","My routines","N","routineboard",null,"Your routines, pinned up.",74],
    ["bed","Bed","A","bed",null,"Your bed. Fluffy pillows, cool sheets."],
    ["window","Window","W","curtwindow",null,"Curtains open, curtains shut.",20],
    ["wardrobe","Wardrobe","B","wardrobe",null,"Today's outfits are hanging in here.",30],
    ["record","Record player","E","record",null,"Pop a record on."],
    ["nook","Calm corner","C","calm",null,"Cushions, a candle, one slow breath."],
    ["journal","Writing desk","D","writedesk",null,"Your journal lives in the top drawer."],
    ["jars","Emotion shelf","J","jarshelf",null,"Feelings, kept safe in jars.",-78]]},
  // Evan's room, through the east door of the house: a toddler-safe play space. Evan taps around; nothing in here
  // touches the rest of the game (no coins, no saves). Mel waits by the door; Maple stays outside.
  kidroom: {name:"Evan's room", wall:"#F9E08A", trim:"#7BB37A", noBoard:true, pos:{A:[160,290], B:[430,262], T:[290,470], D:[420,560], C:[110,592], E:[292,250]}, stations:[
    ["kbed","Car bed","A","carbed",null,"Vroom vroom, time for bed."],
    ["snacks","Snack cupboard","B","snacks",null,"Snacks! What would you like?",30],
    ["balloons","Balloons","E","balloons",null,"Pop pop pop!",20],
    ["train","Train set","T","trainset",null,"Choo choo!",28],
    ["dino","Dino eggs","D","dinonest",null,"What's inside the eggs?",22],
    ["cars","Toy cars","C","garage",null,"Beep beep!",18]]},
  // The courtyard, through the archway on the town hall's west wall: a sunny Spanish-style courtyard with a fountain,
  // a bench, pigeons, the kind words and affirmations boards on the arcade wall, six trophy pedestals and the trophy book
  trophy: {name:"The courtyard", wall:"#F6EEE2", trim:"#C9774D", noBoard:true, pos:{K:[132,132], F:[388,132], B:[260,262], P:[124,296], Q:[396,296], S:[124,448], T:[396,448], U:[124,600], V:[396,600], N:[260,596], W:[260,452]}, stations:[
    ["kudos","Kind words","K","kindboard",null,"Lovely things people have said about you.",72],
    ["affirm","Affirmations","F","affirmboard",null,"Today's affirmations.",72],
    ["tbook","Trophy book","B","lectern",null,"Every trophy, with when and why.",26],
    ["fountain","Fountain","W","fountain",null,"Make a wish.",36],
    ["bench","Bench","N","parkbench",null,"Sit a while.",-14],
    ["ped0","","P","pedestal",null,"",24], ["ped1","","Q","pedestal",null,"",24], ["ped2","","S","pedestal",null,"",24],
    ["ped3","","T","pedestal",null,"",24], ["ped4","","U","pedestal",null,"",24], ["ped5","","V","pedestal",null,"",24]]},
  // The bank: five vault jars (savings goals) along the back wall, Opal's counter in front
  bank: {name:"The bank", wall:"#EEF1E6", trim:"var(--honey)", noBoard:true, pos:{V0:[70,330], V1:[165,330], V2:[260,330], V3:[355,330], V4:[450,330], C:[260,528]}, stations:[
    ["vault0","","V0","vaultjar",null,"",40], ["vault1","","V1","vaultjar",null,"",40], ["vault2","","V2","vaultjar",null,"",40],
    ["vault3","","V3","vaultjar",null,"",40], ["vault4","","V4","vaultjar",null,"",40],
    ["counter","Counter","C","bankcounter",null,"Opal's counter. Your passbook's here.",30]]},
  // The wine shop in the vineyard: shelves of Mel's wines, the counter (stand behind it to serve), the honesty box
  // and the tasting room's little tables
  wineshop: {name:"The wine shop", wall:"#F4E6D6", trim:"#8E2C48", noBoard:true, pos:{S:[92,262], C:[330,318], H:[96,440], T:[340,520], K:[480,390]}, stations:[
    ["kdoor","Kitchen","K","kitchendoor",null,"Into the kitchen.",0],
    ["wshelf","Wine shelves","S","wineshelf",null,"Your wines, waiting for customers.",30],
    ["wcounter","Counter","C","winecounter",null,"Behind the counter. Customers come more often while you serve.",-34],
    ["hbox","Honesty box","H","honestybox",null,"The honesty box.",30],
    ["tasting","Tasting room","T","cafetables",null,"The tasting room.",34]]},
  // The kitchen behind the wine shop: oven (bread from flour), larder (ingredients sent from the backpack), cheese
  // press (goat's milk into cheese) and the stove, where the small plates and the tapas of the day are cooked
  kitchen: {name:"The kitchen", wall:"#F2EBDD", trim:"#7FA36E", noBoard:true, pos:{O:[110,262], L:[410,262], P:[262,470], C:[110,500]}, stations:[
    ["oven","Oven","O","oven",null,"The bread oven. Flour in, loaves out.",30],
    ["larder","Larder","L","larder",null,"The larder. Everything you've sent to the kitchen.",30],
    ["stove","Stove","P","stove",null,"The stove. Small plates and today's tapas.",30],
    ["press","Cheese press","C","cheesepress",null,"The cheese press. Goat's milk in, cheese out.",30]]},
  // Ma Ma's cottage in the orchard: one cosy room with her bed, the TV, a little kitchenette and the tea table
  cottage: {name:"Ma Ma's cottage", wall:"#F6E7D7", trim:"#C2505F", noBoard:true, pos:{B:[110,262], T:[420,250], K:[404,470], C:[200,470]}, stations:[
    ["mbed","Ma Ma's bed","B","grannybed",null,"Ma Ma's bed, the crocheted blanket folded just so.",30],
    ["tv","TV","T","tv",null,"Her dramas. Nobody touches the remote.",30],
    ["kitchenette","Kitchenette","K","kitchenette",null,"The kettle's always warm in here.",30],
    ["tea","Tea table","C","teatable",null,"Tea and cake with Ma Ma.",34]]},
  market:{name:"Market", wall:"#F8E5E2", trim:"var(--blush)", stations:[
    ["stall","Shop counter","M","shopcounter",null,"Welcome in! Have a browse."]]}
};
// Maple's basket sits beside Mel's bed, wherever the bed is
export const MAPLE_BED = [ROOMS.room.pos.A[0] + 110, ROOMS.room.pos.A[1] + 6];
// board spot in every work room
export const BOARD = {id:"board", name:"Quest board", x:260, y:200, mark:[260,60]};
export function stationsOf(scene){
  const r = ROOMS[scene]; if (!r) return [];
  return r.stations.map(([id, name, slot, kind, re, line, dy]) => { const p = (r.pos && r.pos[slot]) || POS[slot];
    return {id, name, kind, re, line, x:p[0], y:p[1], tx:p[0], ty:p[1] + (dy ?? 42)}; });
}
export const spotObj = (scene, id) => scene === "base" ? baseSpot(id) : id === "board" ? {id:"board", name:"Quest board", tx:260, ty:200, line:"This building's quests."} : stationsOf(scene).find(s => s.id === id);

// Tasks that ARE treadmill tasks (a "🚶" or "treadmill" in the title, or chat sent spot "treadmill") always happen on
// the treadmill at home. Tasks that are only treadmill-able (treadmill: true) get it as an offer instead.
export const isTreadTask = t => !!t && (t.spot === "treadmill" || /🚶|treadmill/i.test(t.title || ""));
export function placeOf(t){
  if (isTreadTask(t)) return "home";
  if (t.place === "base") return "base";
  if (t.place && WORK.includes(t.place)) return t.place;
  const s = (t.title + " " + (t.channel || "")).toLowerCase();
  // Personal things that belong outdoors (Evan outings, garden, repairs, a walk) happen at home base, any day.
  if (!WORK_HINT.test(s) && !t.meeting && baseSpotFor(s)) return "base";
  if (/chord/.test(s)) return "chord";
  if (/chico/.test(s)) return "chico";
  if (/ambidextrous|town hall/.test(s)) return "hall";
  if (t.meeting) return "hall";
  if (/clean|fold|laundry|cook|chore|grocer|wash|tidy|evan|hestia|skincare|gym|workout/.test(s)) return "home";
  if (/copy|write|blog|caption|proposal|audit|muse|fresh pages|newsletter|website|brand/.test(s)) return "fresh";
  // Weekends: anything without a work hint is personal, so it happens at home instead of the post office.
  if (isWeekend() && !WORK_HINT.test(s) && !/email|inbox|reply|admin|tax|bank/.test(s)) return "home";
  return "post";
}
function baseSpot(id){ const v = VILLAGE[id]; return v ? {id, name: v.name, tx: v.door[0], ty: v.door[1], x: v.door[0], y: v.door[1], line: v.line} : null; }
export function spotOf(t){
  if (placeOf(t) === "base") { const s = (t.title + " " + (t.channel || "")).toLowerCase();
    return (t.spot && BASE_SPOTS.some(([id]) => id === t.spot)) ? t.spot : baseSpotFor(s) || "pond"; }
  // The cupboard and treadmill are only picked on purpose (the clean, or "Do it on the treadmill").
  const pl = placeOf(t), st = stationsOf(pl).filter(s => (s.id !== "cupboard" || /clean|tidy|wipe|hestia|dust/i.test(t.title)) && s.id !== "treadmill" && s.re);
  if (isTreadTask(t)) return "treadmill";
  if (t.spot && st.find(s => s.id === t.spot)) return t.spot;
  const s = t.title.toLowerCase();
  const hit = st.find(x => x.re && x.re.source !== "." && x.re.test(s));
  if (hit) return hit.id;
  const fallback = st.filter(x => x.id !== "cupboard" && x.re);  // (treadmill already excluded above)
  const dflt = fallback.find(x => x.re && x.re.source === ".");
  return dflt ? dflt.id : fallback[hash(t.id) % fallback.length].id;
}
