// Village layout, building interiors (stations) and task -> place/spot matching.
import { hash, now, H } from "../util.js";
import { TOWNS, TOWN_PLACES, TOWN_BRIDGES, TOWN_ARRIVE } from "./towns.js";

// Outdoor screens. "base" is home (house, garden, pond, shed, swing); "village" is the town square with the work
// buildings. A river joins them: walk onto the bridge to cross. A third screen (say, for Luna) would be one more
// OUTDOOR entry, a pair of bridge places and a BRIDGES/ARRIVE line.
export const OUTDOOR = ["base", "village", "lane", "vineyard", "orchard", "flowers", "field", "shore", "bay", "hfarm", "hlane", "hwoods", ...Object.values(TOWNS).flatMap(t => t.screens)];   // + the towns (towns.js)
export const VILLAGE = {
  // town square
  hall:   {scene:"village", name:"Town hall", short:"the town hall", door:[170,180], mark:[132,64]},
  bank:   {scene:"village", name:"Bank", short:"the bank", door:[380,178], mark:[380,46]},
  chord:  {scene:"lane", name:"Chord workshop", short:"the Chord workshop", door:[145,272], mark:[145,150]},
  fresh:  {scene:"village", name:"Fresh Pages library", short:"the library", door:[85,368], mark:[95,256]},
  chico:  {scene:"lane", name:"Chico cottage", short:"Chico cottage", door:[380,282], mark:[380,170]},
  luna:   {scene:"lane", name:"Luna house", short:"the Luna house", door:[160,520], mark:[160,380]},
  ohayo:  {scene:"lane", name:"Ohayo house", short:"the Ohayo house", door:[362,520], mark:[362,380]},
  post:   {scene:"village", name:"Post office", short:"the post office", door:[435,502], mark:[435,386]},
  market: {scene:"village", name:"Market", short:"the market", door:[362,350], mark:[362,290]},
  board:  {scene:"village", name:"Quest board", door:[260,338], spot:true, line:"All of today's quests, in one place."},
  well:   {scene:"village", name:"Well", door:[196,414], spot:true, line:"Fresh water! Glug glug."},
  news:   {scene:"village", name:"Good news board", door:[90,488], spot:true, line:"The good news board. Fresh every morning."},
  bench:  {scene:"village", name:"Riverside bench", door:[334,580], spot:true, line:"A bench by the river. Lunch spot for half the town."},
  toLane: {scene:"village", name:"Gate to Makers' Lane", door:[444,218], spot:true, bridge:"lane", mark:[430,170], line:"Through the gate to Makers' Lane: Chord, Chico, Luna and Ohayo."},
  // Makers' Lane: the apps (Chord, Chico, and a plot waiting for the next one)
  toTownE:{scene:"lane", name:"Gate to the town square", door:[20,330], spot:true, bridge:"village", mark:[34,282], line:"Back to the town square."},
  toVineL:{scene:"lane", name:"Path to the vineyard", door:[262,622], spot:true, bridge:"vineyard", mark:[300,586], line:"Down the lane to the vineyard."},
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
  grove:  {scene:"vineyard", name:"Olive grove", door:[205,142], spot:true, line:"The olive grove along the top terrace."},
  // round 110: the old mill (the windmill on the cottage lane, once it's opened up as an olive mill): its inside
  mill:   {scene:"hlane", name:"The old mill", short:"the old mill", door:[440,356]},
  olive:  {scene:"vineyard", name:"Olive tree", door:[250,262], spot:true, line:"The olive tree. Olives every few hours, once it's planted."},
  pround: {scene:"vineyard", name:"Roundabout", door:[188,598], spot:true, line:"The roundabout. Round and round and round!"},
  pseesaw:{scene:"vineyard", name:"Seesaw", door:[410,600], spot:true, line:"The seesaw. Up, down, up, down."},
  toOrchard:{scene:"base", name:"Gate to Ma Ma's orchard", door:[26,180], spot:true, bridge:"orchard", mark:[40,120], line:"Along the path to Ma Ma's orchard."},
  // Ma Ma's orchard, west of home: fruit trees, the farm shop and her cottage; her flower farm is further west
  toBaseO:{scene:"orchard", name:"Gate home", door:[498,278], spot:true, bridge:"base", mark:[490,226], line:"Back along the path, home."},
  toFlowers:{scene:"orchard", name:"Gate to the flower farm", door:[22,278], spot:true, bridge:"flowers", mark:[30,226], line:"Through the arch to the flower farm."},
  cottage:{scene:"orchard", name:"Ma Ma's cottage", short:"Ma Ma's cottage", door:[132,228], mark:[132,96]},
  cacao:{scene:"orchard", name:"Cacao tree", door:[466,486], spot:true, mark:[484,380], line:"Ma Ma's cacao tree, for the Cocoa Room."},
  farmshop:{scene:"orchard", name:"Farm shop", door:[415,254], spot:true, mark:[415,140], line:"Ma Ma's farm shop. Fruit and flowers, picked this morning."},
  toOrchardF:{scene:"flowers", name:"Gate to the orchard", door:[498,293], spot:true, bridge:"orchard", mark:[490,240], line:"Back through the arch to the orchard."},
  // the field: an open meadow with a lake, north of the orchard and west of the town square
  toField:{scene:"village", name:"Path to the field", door:[24,206], spot:true, bridge:"field", mark:[24,140], line:"West along the path to the field and the lake."},
  toursign:{scene:"orchard", name:"Tour sign", door:[298,256], spot:true, line:"The tour board: when the next tour is and who's coming."},
  toFieldO:{scene:"orchard", name:"Path to the field", door:[260,158], spot:true, bridge:"field", mark:[300,110], line:"Up the path to the field and the lake."},
  toTownF:{scene:"field", name:"Path to the town square", door:[500,198], spot:true, bridge:"village", mark:[490,140], line:"East along the path to the town square."},
  toOrchardN:{scene:"field", name:"Path to the orchard", door:[260,626], spot:true, bridge:"orchard", mark:[300,560], line:"Down the path to Ma Ma's orchard."},
  lake:   {scene:"field", name:"The lake", door:[220,378], spot:true, line:"The lake. Two swans, very dignified."},
  picnic: {scene:"field", name:"Picnic spot", door:[140,484], spot:true, line:"A blanket and a basket. Perfect for lunch outside."},
  // market and fair days: the stalls (who's behind each one comes from tours.js) and the wine shop's own stall
  jazzhat:{scene:"field", name:"Jazz stage", door:[424,494], spot:true, line:"The little stage on the pitch. Night market nights, there's a jazz duo."},
  mstall0:{scene:"field", name:"Stall", door:[36,164], spot:true, line:"A market stall."},
  mstall1:{scene:"field", name:"Stall", door:[96,164], spot:true, line:"A market stall."},
  mstall2:{scene:"field", name:"Stall", door:[156,164], spot:true, line:"A market stall."},
  mstall3:{scene:"field", name:"Stall", door:[216,164], spot:true, line:"A market stall."},
  mstall4:{scene:"field", name:"Stall", door:[276,164], spot:true, line:"A market stall."},
  mstall5:{scene:"field", name:"Stall", door:[336,164], spot:true, line:"A market stall."},
  mstall6:{scene:"field", name:"Stall", door:[396,164], spot:true, line:"A market stall."},
  mstall7:{scene:"field", name:"Stall", door:[456,164], spot:true, line:"A market stall."},
  mstall8:{scene:"field", name:"Scoop Shack cart", door:[306,556], spot:true, line:"The Scoop Shack's cart at the night market."},
  mstall9:{scene:"field", name:"Cocoa Room cart", door:[196,556], spot:true, line:"The Cocoa Room's chocolate cart at the night market."},
  pitch:  {scene:"field", name:"Football pitch", door:[150,600], spot:true, line:"The football pitch. Kids play here after school."},
  // the foreshore, west of the field and north of the flower farm: the sea along its west side (dolphins, paddleboarders),
  // a boardwalk, a jetty with the paddleboard rack, and two family houses
  toShoreF:{scene:"field", name:"Gate to the foreshore", door:[22,300], spot:true, bridge:"shore", mark:[30,246], line:"West through the gate to the foreshore."},
  toShoreFl:{scene:"flowers", name:"Gate to the foreshore", door:[52,152], spot:true, bridge:"shore", mark:[52,96], line:"Up through the arch to the foreshore."},
  toFieldS:{scene:"shore", name:"Gate to the field", door:[498,300], spot:true, bridge:"field", mark:[490,246], line:"East through the gate to the field and the lake."},
  toFlowersS:{scene:"shore", name:"Gate to the flower farm", door:[250,622], spot:true, bridge:"flowers", mark:[290,560], line:"Down the boardwalk to Ma Ma's flower farm."},
  mumdad: {scene:"shore", name:"Mum and Dad's", short:"Mum and Dad's house", door:[360,226], mark:[360,110]},
  marcus: {scene:"shore", name:"Marcus and Angellina's", short:"Marcus and Angellina's house", door:[400,470], mark:[400,354]},
  suprack:{scene:"shore", name:"Paddleboards", door:[216,488], spot:true, line:"The paddleboard rack by the jetty. Fancy a paddle?"},
  boat:   {scene:"shore", name:"Cruise boat", door:[206,550], spot:true, line:"The mooring at the end of the jetty."},
  dolphins:{scene:"shore", name:"Boardwalk bench", door:[214,262], spot:true, line:"A bench looking out to sea. Dolphins come by most mornings."},
  exlawn: {scene:"field", name:"Exercise lawn", door:[452,430], spot:true, line:"The exercise lawn. Mum's class is here most mornings at 8."},
  // the bay, north of the foreshore up the boardwalk: Mel's ice cream shop (The Scoop Shack) and its deck, and a
  // shopfront under renovation
  toBay:  {scene:"shore", name:"Boardwalk north", door:[250,22], spot:true, bridge:"bay", mark:[290,40], line:"Up the boardwalk to the bay and the Scoop Shack."},
  toShoreB:{scene:"bay", name:"Boardwalk to the foreshore", door:[250,622], spot:true, bridge:"shore", mark:[290,560], line:"Down the boardwalk to the foreshore."},
  scoopshop:{scene:"bay", name:"The Scoop Shack", short:"the Scoop Shack", door:[386,262], mark:[386,96]},
  // round 112: Friday evenings at the bay (the fire pit on the beach; the fishmonger's van 5 to 10pm), and kite flying on the field
  bonfire:{scene:"bay", name:"The bonfire", door:[404,392], spot:true, line:"A fire pit on the beach. On Friday nights there's a bonfire."},
  fishvan:{scene:"bay", name:"The fishmonger's van", door:[330,620], spot:true, line:"Sal's fish van parks here on Friday evenings."},
  // round 113: the Friday market (4:30 to 7:15) and movie night (the last Friday, 7:30 to 9:30), both on the field where the Sunday market stands
  bm0:    {scene:"field", name:"Market stall", door:[156,156], spot:true, line:"A market stall."}, bm1: {scene:"field", name:"Market stall", door:[236,156], spot:true, line:"A market stall."},
  bm2:    {scene:"field", name:"Market stall", door:[316,156], spot:true, line:"A market stall."}, kites: {scene:"field", name:"Hiro's kites", door:[380,162], spot:true, line:"Kites!"},
  screen: {scene:"field", name:"The outdoor cinema", door:[236,240], spot:true, line:"Movie night."}, popcorn: {scene:"field", name:"Popcorn cart", door:[406,196], spot:true, line:"Popcorn."},
  kitefly:{scene:"field", name:"Kite flying", door:[440,330], spot:true, line:"Open grass and a good breeze off the sea: the place to fly a kite."},
  deck:   {scene:"bay", name:"The deck", door:[215,412], spot:true, line:"The deck, looking out over the foreshore. Bring an ice cream."},
  hfreezer:{scene:"bay", name:"Honesty freezer", door:[432,290], spot:true, line:"The honesty freezer: little cups while the shop's shut."},
  dbike:  {scene:"bay", name:"Delivery bike", door:[300,290], spot:true, line:"The delivery bike."},
  cocoa:  {scene:"bay", name:"The Cocoa Room", short:"the Cocoa Room", door:[396,516], mark:[396,372]},
  toFarmB:{scene:"bay", name:"Gate to Wildflower Farm", door:[500,378], spot:true, bridge:"hfarm", mark:[490,320], line:"East through the gate to Wildflower Farm."},
  // Wildflower Farm (Felix and Elena's), east of the bay (art/hfarm.js, game/hfarm.js)
  toBayF: {scene:"hfarm", name:"Gate to the bay", door:[22,286], spot:true, bridge:"bay", mark:[30,226], line:"West through the gate to the bay."},
  hfEast: {scene:"hfarm", name:"Gate to the cottage lane", door:[498,560], spot:true, bridge:"hlane", mark:[490,506], line:"East through the gate to the cottages and Honeybrook station."},
  // the cottage lane and Honeybrook station, east of the farm, above the town square (art/hlane.js, game/rail.js)
  toFarmL:{scene:"hlane", name:"Gate to Wildflower Farm", door:[22,560], spot:true, bridge:"hfarm", mark:[30,506], line:"West through the gate to Wildflower Farm."},
  toTownL:{scene:"hlane", name:"Station road", door:[280,622], spot:true, bridge:"village", mark:[320,560], line:"Down the station road to the town square."},
  station:{scene:"hlane", name:"Honeybrook station", door:[330,170], spot:true, mark:[330,40], line:"Honeybrook station: a platform, a shelter, a bench, and the brook burbling underneath."},
  timetable:{scene:"hlane", name:"Timetable board", door:[400,170], spot:true, mark:[420,40], line:"The timetable board."},
  honeysuckle:{scene:"hlane", name:"Honeysuckle", short:"Honeysuckle cottage", door:[110,264], mark:[110,150]},
  clover: {scene:"hlane", name:"Clover", short:"Clover cottage", door:[110,434], mark:[110,320]},
  bluebell:{scene:"hlane", name:"Bluebell", door:[338,262], spot:true, mark:[338,150], line:"Bluebell: a holiday cottage with blue shutters. Guests come and go on the train."},
  figtree:{scene:"hlane", name:"Fig Tree", door:[338,436], spot:true, mark:[338,320], line:"Fig Tree: a holiday cottage with a fig tree by the door. Guests come and go on the train."},
  windmill:{scene:"hlane", name:"The windmill", door:[440,356], spot:true, mark:[458,180], line:"The windmill, turning slowly on the slope. It's been here longer than anyone can remember."},
  vanspot:{scene:"hlane", name:"Campervan spot", door:[420,600], spot:true, mark:[420,500], line:"A gravel spot just big enough for a campervan. One day..."},
  van:    {scene:"hlane", name:"The campervan", short:"the campervan", door:[420,600], mark:[420,500]},
  toStationV:{scene:"village", name:"Station road", door:[281,156], spot:true, bridge:"hlane", mark:[300,90], line:"Up the station road to Honeybrook station and the cottages."},
  farmhouse:{scene:"hfarm", name:"The farmhouse", door:[105,246], spot:true, mark:[105,100], line:"Felix and Elena's farmhouse. The kettle's always on."},
  barn:   {scene:"hfarm", name:"The barn", short:"the barn", door:[400,250], mark:[400,90]},
  hives:  {scene:"hfarm", name:"The beehives", door:[250,256], spot:true, mark:[250,150], line:"Felix's beehives, in the lavender."},
  cows:   {scene:"hfarm", name:"The cow paddock", door:[135,490], spot:true, mark:[135,300], line:"Daisy, Buttercup and Mochi."},
  goats:  {scene:"hfarm", name:"The goat paddock", door:[385,490], spot:true, mark:[385,300], line:"Pepper, Biscuit, Nutmeg and Toffee."},
  stray:  {scene:"hfarm", name:"A runaway goat", door:[260,524], spot:true, line:"A goat on the loose!"},
  fstand: {scene:"hfarm", name:"Farm stand", door:[130,580], spot:true, mark:[130,500], line:"The farm stand: milk, honey and eggs."},
  reno:   {scene:"bay", name:"Under renovation", door:[396,520], spot:true, line:"Boarded up for now. Coming soon: a brewery? A chocolatier?"},
  // round 103: Honeybrook Woods, bike hire, the river taxi
  toLaneW:{scene:"hwoods", name:"Gate to the cottage lane", door:[22,330], spot:true, bridge:"hlane", mark:[30,276], line:"West through the gate to the cottage lane and the station."},
  toMakersW:{scene:"hwoods", name:"Path down to Makers' Lane", door:[330,622], spot:true, bridge:"lane", mark:[370,560], line:"Down the hill to Makers' Lane."},
  ranger: {scene:"hwoods", name:"The ranger's cabin", door:[414,292], spot:true, mark:[414,180], line:"The ranger's cabin. Maps, a kettle, and a noticeboard of what's growing in the woods."},
  bikeswoods:{scene:"hwoods", name:"Bike hire", door:[478,346], spot:true, mark:[478,290], line:"Hire bikes, by the ranger's cabin."},
  forage: {scene:"hwoods", name:"The foraging patch", door:[132,576], spot:true, mark:[132,500], line:"Brambles, a mushroom ring, a chestnut tree and wild garlic: whatever's in season."},
  lookout:{scene:"hwoods", name:"The lookout", door:[460,512], spot:true, mark:[460,360], line:"The lookout. On a clear day you can see the whole of Honeybrook, all the way to the sea."},
  fishpool:{scene:"hwoods", name:"Fishing spot", door:[322,270], spot:true, mark:[322,220], line:"A good spot for fishing."},
  taxiwoods:{scene:"hwoods", name:"River taxi", door:[168,282], spot:true, mark:[168,220], line:"The river taxi's first stop, under the waterfall."},
  toWoodsL:{scene:"hlane", name:"Gate to Honeybrook Woods", door:[498,176], spot:true, bridge:"hwoods", mark:[490,120], line:"East through the gate into Honeybrook Woods."},
  bikesst:{scene:"hlane", name:"Bike hire", door:[232,212], spot:true, mark:[232,150], line:"Hire bikes, by the station."},
  toWoodsM:{scene:"lane", name:"Path up to Honeybrook Woods", door:[330,146], spot:true, bridge:"hwoods", mark:[330,40], line:"Up the hill into Honeybrook Woods."},
  taxilane:{scene:"lane", name:"River taxi", door:[62,226], spot:true, mark:[52,160], line:"The river taxi stop on Makers' Lane."},
  taxilake:{scene:"field", name:"River taxi", door:[300,362], spot:true, mark:[300,300], line:"The river taxi stop on the lake."},
  taxishore:{scene:"shore", name:"River taxi", door:[214,156], spot:true, mark:[214,100], line:"The river taxi stop, where the river meets the sea."},
  bikesvillage:{scene:"village", name:"Bike hire", door:[196,580], spot:true, mark:[196,500], line:"Hire bikes, in the town square."},
  fishriver:{scene:"base", name:"Fishing spot", door:[396,118], spot:true, mark:[396,70], line:"A good spot for fishing."},
  fishlake:{scene:"field", name:"Fishing spot", door:[60,290], spot:true, mark:[60,236], line:"A good spot for fishing."},
  fishsea:{scene:"shore", name:"Fishing spot", door:[204,376], spot:true, mark:[234,320], line:"A good spot for fishing."},
  homejetty:{scene:"base", name:"Little jetty", door:[150,132], spot:true, line:"Your little jetty. Paddle down the river and out to the foreshore."},
  toTown: {scene:"base", name:"Bridge to town", door:[260,114], spot:true, bridge:"village", mark:[260,62], line:"Over the river to the town square."}
};
Object.assign(VILLAGE, TOWN_PLACES);   // the towns' places and gates (towns.js)
// Quests can also happen outdoors at home base: "base" is a quest place whose spots are the base's own places.
VILLAGE.base = {scene:"(quests)", name:"Home base", short:"home base"};
export const BASE_SPOTS = [
  ["swing", /playground|\bpark\b|outing|\bzoo\b|museum|play ?date|play with evan|evan'?s? (activity|class|outing|playtime|swim)|family day|toddler (class|activity)/],
  ["shed",  /garden|plant|weed|prune|repair|diy|gutter|leak|recycl|declutter the|fix (the |a )?(tap|door|shelf|light|sink|toilet|bike|fan)|bike\b|wash the car/],
  ["pond",  /stroll|fresh air|picnic|sit outside|sunshine|walk outside|evening walk|nature walk/]
];
const WORK_HINT = /chord|chico|luna|ohayo|ambidextrous|fresh pages|client|muse|proposal|invoice|copy|newsletter|launch|website|brand|audit|meeting|call with|zoom/;
// Saturday or Sunday in Singapore
export const isWeekend = () => [0, 6].includes(new Date(now() + 8*H).getUTCDay());
const baseSpotFor = s => (BASE_SPOTS.find(([, re]) => re.test(s)) || [])[0] || null;
// bridges: from outdoor scene -> {to outdoor scene: bridge place}; ARRIVE: where Mel steps off on the other side
export const BRIDGES = {village:{base:"toBase", lane:"toLane", field:"toField", hlane:"toStationV"}, base:{village:"toTown", vineyard:"toVine", orchard:"toOrchard"}, lane:{village:"toTownE", vineyard:"toVineL", hwoods:"toWoodsM"}, vineyard:{base:"toBaseV", lane:"toLaneV"}, orchard:{base:"toBaseO", flowers:"toFlowers", field:"toFieldO"}, field:{village:"toTownF", orchard:"toOrchardN", shore:"toShoreF"}, flowers:{orchard:"toOrchardF", shore:"toShoreFl"}, shore:{field:"toFieldS", flowers:"toFlowersS", bay:"toBay"}, bay:{shore:"toShoreB", hfarm:"toFarmB"}, hfarm:{bay:"toBayF", hlane:"hfEast"}, hlane:{hfarm:"toFarmL", village:"toTownL", hwoods:"toWoodsL"}, hwoods:{hlane:"toLaneW", lane:"toMakersW"}, ...TOWN_BRIDGES};
// where Mel steps off, by "from>to"
export const ARRIVE = {"village>base":[260,132], "base>village":[260,578], "village>lane":[48,330], "lane>village":[426,238], "base>vineyard":[52,300], "vineyard>base":[462,470], "lane>vineyard":[290,72], "vineyard>lane":[262,586], "base>orchard":[470,278], "orchard>base":[60,196], "orchard>flowers":[466,293], "flowers>orchard":[56,278], "village>field":[470,198], "field>village":[52,212], "orchard>field":[260,592], "field>orchard":[260,184], "field>shore":[470,304], "shore>field":[56,300], "flowers>shore":[250,590], "shore>flowers":[56,190], "shore>bay":[250,590], "bay>shore":[250,96], "bay>hfarm":[60,284], "hfarm>bay":[462,374], "hfarm>hlane":[60,560], "hlane>hfarm":[462,560], "hlane>village":[281,170], "village>hlane":[280,590], "hlane>hwoods":[60,330], "hwoods>hlane":[462,186], "lane>hwoods":[330,590], "hwoods>lane":[330,170], ...TOWN_ARRIVE};
// the next outdoor screen on the way from one to another (screens form a little chain: base - village - lane)
export function nextHop(from, to){
  if (from === to) return null; if (BRIDGES[from] && BRIDGES[from][to]) return to;
  const seen = {[from]: null}, q = [from];
  while (q.length) { const s = q.shift(); for (const n of Object.keys(BRIDGES[s] || {})) if (!(n in seen)) { seen[n] = s; if (n === to) { let h = n; while (seen[h] !== from) h = seen[h]; return h; } q.push(n); } }
  return null;
}
export const outdoorOf = s => OUTDOOR.includes(s) ? s : INNER[s] ? outdoorOf(INNER[s].parent) : (VILLAGE[s] ? VILLAGE[s].scene : "village");
// Rooms inside another room: Mel's room is through the west door of the house, Evan's through the lower east door (the garage is the upper one).
// door: where Mel steps into the parent room; arrive: where she steps into the inner room; exit: the inner room's
// own door (on the opposite wall), where she walks to leave.
export const INNER = {
  room: {parent: "home", door: [64, 340], arrive: [456, 400], exit: [486, 410]},
  kidroom: {parent: "home", door: [456, 512], arrive: [70, 420], exit: [34, 410]},
  trophy: {parent: "hall", door: [64, 372], arrive: [456, 400], exit: [486, 410]},
  // the wine shop's kitchen, through the door on its east wall; its own way out is the mat at the bottom
  kitchen: {parent: "wineshop", door: [462, 390], arrive: [260, 560], exit: [260, 606]},
  // round 109: the greenhouse, through the glass door at the back of the garden
  greenhouse: {parent: "farm", door: [260, 128], arrive: [260, 560], exit: [260, 606]},
  // big goals: the garage through the back door of the house, the cellar door through the wine shop's west wall
  garage: {parent: "home", door: [456, 340], arrive: [70, 450], exit: [34, 440]},
  office: {parent: "home", door: [64, 512], arrive: [450, 450], exit: [486, 440]},
  cellar: {parent: "wineshop", door: [64, 400], arrive: [450, 430], exit: [486, 430]},
  // the Scoop Shack's kitchen, through the door on the shop's west wall; its own way back is the door on its east wall
  scoopkitchen: {parent: "scoopshop", door: [64, 400], arrive: [450, 440], exit: [486, 440]},
  // the chocolate dip station (an upgrade), through the door on the shop's east wall
  scoopdip: {parent: "scoopshop", door: [456, 410], arrive: [70, 450], exit: [34, 440]},
  // the Cocoa Room's kitchen, through the door on the shop's west wall
  cocoakitchen: {parent: "cocoa", door: [64, 400], arrive: [450, 440], exit: [486, 440]}
};
export const WORK = ["hall","chord","fresh","chico","luna","ohayo","post","home"];
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
  luna: {name:"Luna house", wall:"#EEE9F8", trim:"#B9A6E8", pos:{A:[400,530], B:[420,262], C:[130,530], D:[130,320], E:[290,350]}, stations:[
    ["laptop","Laptop desk","A","desk",/build|fix|app|code|feature|bug|test|ship/,"Luna's engine room."],
    ["shelf","Bookshelf","B","shelf",/design|brand|content|post|icon|copy/,"Star charts and notebooks."],
    ["sofa","Cosy sofa","C","sofa",/user|beta|tester|feedback|call|interview/,"For evening chats with users."],
    ["table","Planning table","D","table",/plan|schedule|roadmap|launch/,"Where Luna's plans happen."],
    ["status","Health sign","E","healthluna",null,"Last night's Luna bug check."]]},
  // Ohayo (not launched yet: it sends video hellos): a reactions board and a hello chart from the founder desk's
  // numbers (feeds.js ohayoHellos), the health sign, and the usual desk, shelf and sofa
  ohayo: {name:"Ohayo house", wall:"#FFF4E6", trim:"#F2A65A", pos:{A:[400,530], B:[420,262], C:[130,530], R:[110,262], H:[372,420], E:[170,420]}, stations:[
    ["laptop","Laptop desk","A","desk",/build|fix|app|code|feature|bug|test|ship|plan|schedule|roadmap|launch/,"Ohayo's engine room."],
    ["shelf","Plant shelf","B","craft",/design|brand|content|post|icon|copy/,"Colours, ideas, a lot of plants."],
    ["sofa","Cosy sofa","C","sofa",/user|beta|tester|feedback|call|interview|hello|video/,"For morning chats with users."],
    ["reactions","Reactions board","R","reactboard",null,"What people sent back from their hellos.",34],
    ["hellos","Hello chart","H","hellochart",null,"How many people are waiting, and how many watched.",30],
    ["status","Health sign","E","healthohayo",null,"Last night's Ohayo bug check."]]},
  post:  {name:"Post office", wall:"#E3EEF5", trim:"var(--sky)", pos:{A:[260,340], B:[436,258], C:[400,530], D:[110,216], E:[72,440]}, stations:[
    ["counter","Sorting counter","A","counter",/email|inbox|reply|message|dm|respond/,"Letters in, letters out."],
    ["cabinet","Filing cabinet","B","cabinet",/admin|file|doc|contract|tax|form|organi/,"A place for everything."],
    ["scales","Stamps & scales","C","scales",/invoice|pay|bill|stripe|account|bank|receipt|expense|price/,"Weigh it, stamp it, send it."],
    ["ledge","Writing ledge","D","desk",/./,"A tidy little ledge for odd jobs."],
    ["pobox","Post box","E","pobox",null,"Your post box: unread mail from your work inbox."]]},
  // Evan's door is on the east wall (opposite Mel's), so Darren's desk sits where the laundry was and the basket
  // moved down beside the cleaning cupboard: the walk from the exit to either door stays clear.
  // the living room: the family dining table in the middle, the sofa, kitchen and fridge along the back, and four doors:
  // Mel's room (left, top), the home office (left, below it), the garage (right, top), Evan's room (right, below it)
  home:  {name:"Home", wall:"#F8EED8", trim:"var(--butter)", pos:{X:[260,452], C:[130,250], B:[436,228], H:[334,250], R:[40,330], K:[480,512], O:[40,512], Q:[480,330]}, stations:[
    ["kitchen","Kitchen","B","kitchen",/cook|meal|lunch|dinner|bake|grocer|prep/,"Something smells good."],
    ["sofa","Sofa","C","sofa",/read|rest|journal|meditat|book|nap/,"Soft cushions, deep breaths."],
    ["mydoor","My room","R","sidedoor",null,"Your room. Just you.",0],
    ["kiddoor","Evan's room","K","kiddoor",null,"Evan's room. Dinosaurs welcome.",0],
    ["officedoor","Home office","O","officedoor",null,"The home office: your desk, Darren's desk and the treadmill.",0],
    ["gdoor","Garage","Q","garagedoor",null,"Through to the garage.",0],
    ["fridge","Fridge","H","fridge",null,"The fridge: what we have, and the shopping list."],
    ["dine","Dining table","X","dining",null,"The big family table. Room for all nine of us.",44]]},
  // the home office, through the lower door on the living room's west wall: Mel's desk, Darren's desk, the treadmill
  office: {name:"Home office", wall:"#EEF1E6", trim:"var(--sage)", noBoard:true, pos:{A:[140,262], K:[300,261], G:[420,330], F:[120,540]}, stations:[
    ["desk","Home desk","A","desk",/./,"Your own little desk."],
    ["obooks","Bookshelf","K","bookcase",null,"Files, notebooks, and Darren's one surviving plant.",34],
    ["office","Darren's desk","G","office",null,"Darren's side of the office. Shh, he might be on a call."],
    ["treadmill","Treadmill","F","treadmill",/treadmill/,"1.2 and go. Walk and work.",-12]]},
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
  wineshop: {name:"The wine shop", wall:"#F4E6D6", trim:"#8E2C48", noBoard:true, pos:{S:[92,238], C:[330,318], H:[206,318], T:[340,520], K:[480,390], M:[465,128], Z:[40,400]}, stations:[
    ["menu","Menu","M","chalkmenu",null,"The chalkboard: today's menu.",44],
    ["kdoor","Kitchen","K","kitchendoor",null,"Into the kitchen.",0],
    ["cdoor","Cellar door","Z","cellardoor",null,"The cellar door: barrel racks, a tasting bar and your wine wall.",0],
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
  cottage: {name:"Ma Ma's cottage", wall:"#F6E7D7", trim:"#C2505F", noBoard:true, pos:{R:[40,330], T:[420,250], K:[276,262], C:[110,560], X:[320,470]}, stations:[
    ["bedroom","Bedroom","R","bedroomdoor",null,"Ma Ma and Gong Gong's room. Her bed has the crocheted blanket, folded just so.",0],
    ["tv","TV","T","tv",null,"Her dramas. Nobody touches the remote.",30],
    ["kitchenette","Kitchenette","K","kitchenette",null,"The kettle's always warm in here.",30],
    ["tea","Tea table","C","teatable",null,"Tea and cake with Ma Ma.",34],
    ["dine","Dining table","X","dining",null,"Ma Ma's big table. She cooks for twenty, every time.",44]]},
  // Mum and Dad's house on the foreshore: Dad's piano, double bass and easel, Mum's exercise mat, the kitchen table
  mumdad: {name:"Mum and Dad's", wall:"#EAF2F5", trim:"#3E6B8C", noBoard:true, pos:{P:[112,250], B:[232,262], E:[376,290], Y:[110,392], X:[270,500], R:[480,330]}, stations:[
    ["bedroom","Bedroom","R","bedroomdoor",null,"Mum and Dad's room.",0],
    ["piano","Piano","P","piano",null,"Dad's piano. He's been working on the same song all week.",42],
    ["bass","Double bass","B","doublebass",null,"Dad's double bass. Taller than Evan. Much taller.",38],
    ["easel","Easel","E","easel",null,"Dad's sketches: the jetty, the dolphins, and Evan (twice).",34],
    ["mat","Mum's mat","Y","yogamat",null,"Mum's mat. Pilates, Zumba, Piloxing: she does them all.",26],
    ["dine","Dining table","X","dining",null,"The family table. There's always food on it. Take some home.",44]]},
  // Marcus and Angellina's: the games corner, Angellina's study desk and psychology books, the sofa
  marcus: {name:"Marcus and Angellina's", wall:"#F3ECF7", trim:"#8E5B9A", noBoard:true, pos:{G:[110,262], K:[432,261], D:[284,262], S:[110,420], X:[340,470], R:[480,340]}, stations:[
    ["bedroom","Bedroom","R","bedroomdoor",null,"Marcus and Angellina's room.",0],
    ["games","Games corner","G","gamingtv",null,"Marcus's games. He says he's 'nearly finished' this one. He's been nearly finished for a month.",36],
    ["books","Bookshelf","K","psychshelf",null,"Angellina's psychology books, all with sticky notes.",36],
    ["study","Angellina's desk","D","studydesk",null,"Angellina's study desk. Highlighters in every colour.",36],
    ["msofa","Sofa","S","sofa",null,"The comfiest sofa on the foreshore.",30],
    ["dine","Dining table","X","dining",null,"Their dining table. Wedding magazines at one end, bank papers at the other.",44]]},
  // The Scoop Shack on the bay: the gelato counter (the display is drawn over the people, so Sofia stands behind it),
  // the chalkboard menu, tables, and the kitchen door on the west wall
  scoopshop: {name:"The Scoop Shack", wall:"#E3F2EC", trim:"#F2A0B8", noBoard:true, pos:{C:[300,330], M:[465,128], Z:[40,400], T:[340,520], U:[96,262], D:[480,400]}, stations:[
    ["gupgrades","Upgrades","U","gcatalogue",null,"The upgrades catalogue: things to make the shop even nicer.",34],
    ["gddoor","Dip station","D","gdipdoor",null,"The chocolate dip station.",0],
    ["gmenu","Menu","M","chalkmenu",null,"The chalkboard menu: prices and flavours.",44],
    ["gcounter","Gelato counter","C","gcounter",null,"The gelato counter. Yours are free.",46],
    ["gkdoor","Kitchen","Z","gkdoor",null,"Into the gelato kitchen.",0],
    ["gtables","Tables","T","cafetables",null,"Tables for eating in. Bring an ice cream.",34]]},
  // The gelato kitchen behind it: the fridge (ingredients), the freezer (tubs), the recipe book and the mixing bench
  scoopkitchen: {name:"The gelato kitchen", wall:"#EEF2F4", trim:"#7FB8E8", noBoard:true, pos:{F:[110,262], Z:[262,262], B:[420,262], P:[262,470]}, stations:[
    ["gfridge","Fridge","F","gfridge",null,"The fridge: everything the gelato's made from.",30],
    ["gfreezer","Freezer","Z","gfreezer",null,"The freezer: tubs waiting for the display.",30],
    ["gboard","Recipe book","B","gboard",null,"The recipe book: make another tub of any flavour you know.",74],
    ["gbench","Mixing bench","P","gbench",null,"The mixing bench: discover new flavours.",30]]},
  // the chocolate dip station off the shop (an upgrade): the chocolate pots, the toppings shelf, and the dip bar
  scoopdip: {name:"The dip station", wall:"#F6E6DA", trim:"#8A5A3A", noBoard:true, pos:{P:[340,262], S:[130,262], B:[300,480]}, stations:[
    ["gpots","Chocolate pots","P","gpots",null,"Warm pots of chocolate for dipping.",34],
    ["gtops","Toppings shelf","S","gtopshelf",null,"Jars of toppings.",34],
    ["gdipbar","Dip bar","B","gdipbar",null,"Dip it, top it.",34]]},
  // The Cocoa Room (a big goal, in the bay's old shopfront): the counter (Amara serves behind it; the front is drawn
  // over the people), the bar wall, a table, and the kitchen door; behind it the chocolate kitchen, bean to bar
  // the campervan (goals.js "van", game/van.js): a cosy inside, done up from the mood board
  van: {name:"The campervan", wall:"#F6EBC8", trim:"#9FD3C2", noBoard:true, pos:{B:[260,170], K:[328,360], T:[204,500], M:[186,300]}, stations:[
    ["vbed","Bed","B","vanbed",null,"The bed, tucked in under the pop-top. You can see the stars through the roof window.",30],
    ["vkitchen","Kitchenette","K","vankitchen",null,"A two-ring stove, a tiny sink, and a kettle that whistles.",30],
    ["vtable","Table","T","vantable",null,"A fold-down table with a bench either side. Cards, tea, or both.",30],
    ["vboard","Mood board","M","vanboard",null,"The mood board: do up the van.",30]]},
  // the two lived-in cottages on the lane: Honeysuckle (Mateo and Lila) and Clover (Noor and her rescues)
  honeysuckle: {name:"Honeysuckle", wall:"#FFF3E6", trim:"#B5443A", noBoard:true, pos:{D:[110,262], S:[300,262], K:[440,262], R:[120,470], X:[360,470]}, stations:[
    ["mdesk","Mateo's desk","D","studydesk",null,"Mateo's desk: food science textbooks, a cocoa-stained notebook, and a lot of highlighters.",30],
    ["msofa","Sofa","S","sofa",null,"A squashy sofa with Lila's knitting on one end.",34],
    ["mkitchen","Kitchenette","K","kitchenette",null,"The kitchenette. Mateo's sourdough starter lives here. It has a name: Gerald.",30],
    ["mrecord","Record player","R","record",null,"Lila's records. Mostly jazz, one embarrassing pop album.",30],
    ["mtable","Table","X","teatable",null,"A little table for two, and a jam jar of wildflowers.",34]]},
  clover: {name:"Clover", wall:"#EEF5EC", trim:"#5E8A5A", noBoard:true, pos:{S:[120,262], K:[420,262], B:[270,262], P:[260,470]}, stations:[
    ["nsofa","Sofa","S","sofa",null,"Noor's sofa, covered in a blanket and, usually, a cat.",34],
    ["nkitchen","Kitchenette","K","kitchenette",null,"Noor's kitchenette: a shelf of pet food tins, and one of biscuits for her.",30],
    ["nbooks","Bookcase","B","bookcase",null,"Books on animal care, and a photo of every pet she's ever rehomed.",30],
    ["npets","Pet beds","P","petbeds",null,"A heap of cushions where the rescues curl up. Someone's asleep in the middle.",34]]},
  // Wildflower Farm's barn: milking stalls and the hay loft, the honey extractor, the yoghurt crocks, the cheese press
  // and the cheese cave (game/hfarm.js)
  barn: {name:"The barn", wall:"#C98A6A", trim:"#8E2C2C", noBoard:true, pos:{S:[110,262], H:[262,262], X:[420,262], Y:[100,470], P:[262,450], C:[424,480]}, stations:[
    ["stalls","Milking stalls","S","stalls",null,"The milking stalls. Daisy, Buttercup and Mochi come in here when it rains; the rest of the time they're milked out in the paddock.",30],
    ["hayloft","Hay loft","H","hayloft",null,"Bales of sweet hay, all the way up to the rafters. Biscuit the goat has tried to climb it twice.",30],
    ["extractor","Honey extractor","X","extractor",null,"The honey extractor: frames in, honey out.",30],
    ["crock","Yoghurt crocks","Y","crock",null,"Crocks of yoghurt, setting.",30],
    ["press","Cheese press","P","hfpress",null,"The cheese press.",30],
    ["cave","Cheese cave","C","cheesecave",null,"The cheese cave.",30]]},
  cocoa: {name:"The Cocoa Room", wall:"#F3E4D2", trim:"#6B4430", noBoard:true, pos:{C:[300,330], W:[110,262], Z:[40,400], T:[340,520], D:[440,262]}, stations:[
    ["case","Display case","D","bonboncase",null,"The display case: bonbons, six flavours at a time.",36],
    ["ccounter","Counter","C","ccounter",null,"The counter. Yours are free.",46],
    ["barwall","Bar wall","W","barwall",null,"Wrapped bars of your own chocolate.",36],
    ["ckdoor","Kitchen","Z","gkdoor",null,"Into the chocolate kitchen.",0],
    ["ctables","Tables","T","cafetables",null,"A table for a little something.",34]]},
  cocoakitchen: {name:"The chocolate kitchen", wall:"#F6EEE4", trim:"#8A5A3A", noBoard:true, pos:{S:[96,262], R:[260,262], G:[420,262], M:[170,560], O:[370,560], P:[70,420], B:[270,410]}, stations:[
    ["pantry","Fillings shelf","P","pantry",null,"The fillings shelf: what goes inside the bonbons.",30],
    ["bonbon","Bonbon table","B","bonbontable",null,"The bonbon table: a shell and a filling or two.",30],
    ["sacks","Bean sacks","S","beansacks",null,"Sacks of cacao beans.",30],
    ["roaster","Roaster","R","roaster",null,"The bean roaster.",30],
    ["grinder","Stone grinder","G","grinder",null,"The stone grinder: roasted beans in, chocolate out.",30],
    ["slab","Marble slab","M","slab",null,"The marble slab, for tempering.",30],
    ["moulds","Moulds","O","moulds",null,"Bar moulds.",30]]},
  // the garage (a big goal): Darren's workbench, storage, the scooter and the car once they're bought
  garage: {name:"The garage", wall:"#E3E6EA", trim:"#8FA3B8", noBoard:true, pos:{W:[130,250], E:[300,262], K:[436,261], C:[310,480], D:[120,566], S:[440,566]}, stations:[
    ["gbench","Workbench","W","bench",null,"Darren's tools, all hung up on the wall. Mostly.",34],
    ["cupboard","Cleaning cupboard","E","cupboard",/clean|tidy|wipe|hestia|dust/,"Hestia's chores live in here."],
    ["gshelf","Storage","K","shelf",null,"Boxes labelled 'Christmas', 'Evan's baby clothes' and 'misc'.",34],
    ["laundry","Laundry corner","D","laundry",/fold|laundry|clothes|wash|iron/,"Fold, stack, done."],
    ["scooter","Scooter","S","scooterbay",null,"The scooter's spot.",30],
    ["car","Car","C","carbay",null,"The car's spot.",30]]},
  // the cellar door (a big goal): Mel's wine wall, the tasting bar, barrel racks, a high table
  cellar: {name:"The cellar door", wall:"#E9DCCB", trim:"#6B3A2A", noBoard:true, pos:{W:[130,262], B:[340,262], R:[140,500], T:[360,500]}, stations:[
    ["winewall","Wine wall","W","winewall",null,"A bottle of every wine you've made. It's getting full.",36],
    ["flight","Tasting bar","B","tastebar",null,"The tasting bar. Pour yourself a flight (and on the first Friday of the month, host the wine club).",34],
    ["racks","Barrel racks","R","barrelrack",null,"Barrels resting, quietly getting better.",30],
    ["ctable","High table","T","table",null,"A high table for tastings. Visitors linger here.",40]]},
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
// Writing of any kind (for any business) happens at the Fresh Pages library's writing desk (Mel's call)
export const isWriting = t => !!t && /\b(write|writing|rewrite|draft|drafting|blog|article|essay|newsletter|copywrit\w*|copy|caption|script|outline|headline|journal|post copy)\b/i.test(t.title || "");
// Home quests can land at stations in the home office or the garage (rooms off the living room): spotOf picks from
// all three, and placeOf says which room that station is actually in.
const HOME_ROOMS = ["home", "office", "garage"];
const homeStations = () => HOME_ROOMS.flatMap(r => stationsOf(r));
const roomOfStation = id => HOME_ROOMS.find(r => ROOMS[r] && ROOMS[r].stations.some(st => st[0] === id)) || "home";
export function placeOf(t){ const p = basePlace(t); return p === "home" ? roomOfStation(spotOf(t)) : p; }
function basePlace(t){
  if (isTreadTask(t)) return "home";
  if (t.place === "base") return "base";
  if (isWriting(t)) return "fresh";
  if (t.place && WORK.includes(t.place)) return t.place;
  const s = (t.title + " " + (t.channel || "")).toLowerCase();
  // Personal things that belong outdoors (Evan outings, garden, repairs, a walk) happen at home base, any day.
  if (!WORK_HINT.test(s) && !t.meeting && baseSpotFor(s)) return "base";
  if (/chord/.test(s)) return "chord";
  if (/chico/.test(s)) return "chico";
  if (/\bluna\b/.test(s)) return "luna";
  if (/ohayo/.test(s)) return "ohayo";
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
  if (basePlace(t) === "base") { const s = (t.title + " " + (t.channel || "")).toLowerCase();
    return (t.spot && BASE_SPOTS.some(([id]) => id === t.spot)) ? t.spot : baseSpotFor(s) || "pond"; }
  // The cupboard and treadmill are only picked on purpose (the clean, or "Do it on the treadmill").
  const pl = basePlace(t), st = (pl === "home" ? homeStations() : stationsOf(pl)).filter(s => (s.id !== "cupboard" || /clean|tidy|wipe|hestia|dust/i.test(t.title)) && s.id !== "treadmill" && s.re);
  if (isTreadTask(t)) return "treadmill";
  if (pl === "fresh" && isWriting(t)) return "desk";
  if (t.spot && st.find(s => s.id === t.spot)) return t.spot;
  const s = t.title.toLowerCase();
  const hit = st.find(x => x.re && x.re.source !== "." && x.re.test(s));
  if (hit) return hit.id;
  const fallback = st.filter(x => x.id !== "cupboard" && x.re);  // (treadmill already excluded above)
  const dflt = fallback.find(x => x.re && x.re.source === ".");
  return dflt ? dflt.id : fallback[hash(t.id) % fallback.length].id;
}
