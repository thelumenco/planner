// Village layout, building interiors (stations) and task -> place/spot matching.
import { hash, now, H } from "../util.js";

// Outdoor screens. "base" is home (house, garden, pond, shed, swing); "village" is the town square with the work
// buildings. A river joins them: walk onto the bridge to cross. A third screen (say, for Luna) would be one more
// OUTDOOR entry, a pair of bridge places and a BRIDGES/ARRIVE line.
export const OUTDOOR = ["base", "village", "lane"];
export const VILLAGE = {
  // town square
  hall:   {scene:"village", name:"Town hall", short:"the town hall", door:[260,180], mark:[222,64]},
  chord:  {scene:"lane", name:"Chord workshop", short:"the Chord workshop", door:[145,272], mark:[145,150]},
  fresh:  {scene:"village", name:"Fresh Pages library", short:"the library", door:[85,272], mark:[95,160]},
  chico:  {scene:"lane", name:"Chico cottage", short:"Chico cottage", door:[380,282], mark:[380,170]},
  post:   {scene:"village", name:"Post office", short:"the post office", door:[435,502], mark:[435,386]},
  market: {scene:"village", name:"Market", short:"the market", door:[362,350], mark:[362,290]},
  board:  {scene:"village", name:"Quest board", door:[260,338], spot:true, line:"All of today's quests, in one place."},
  well:   {scene:"village", name:"Well", door:[160,350], spot:true, line:"Fresh water! Glug glug."},
  news:   {scene:"village", name:"Good news board", door:[90,488], spot:true, line:"The good news board. Fresh every morning."},
  bench:  {scene:"village", name:"Riverside bench", door:[334,580], spot:true, line:"A bench by the river. Lunch spot for half the town."},
  toLane: {scene:"village", name:"Gate to Makers' Lane", door:[444,218], spot:true, bridge:"lane", mark:[430,170], line:"Through the gate to Makers' Lane: Chord and Chico."},
  // Makers' Lane: the apps (Chord, Chico, and a plot waiting for the next one)
  toTownE:{scene:"lane", name:"Gate to the town square", door:[20,330], spot:true, bridge:"village", mark:[34,282], line:"Back to the town square."},
  plot3:  {scene:"lane", name:"Luna's plot", door:[160,540], spot:true, line:"Luna's plot. Waiting for its building."},
  plot4:  {scene:"lane", name:"Ohayo's plot", door:[362,540], spot:true, line:"Ohayo's plot. Waiting for its building."},
  toBase: {scene:"village", name:"Bridge home", door:[260,598], spot:true, bridge:"base", mark:[260,548], line:"Over the bridge and home."},
  // home base
  home:   {scene:"base", name:"Home", short:"home", door:[260,308], mark:[260,160]},
  farm:   {scene:"base", name:"Garden", short:"the garden", door:[108,492], mark:[108,384]},
  pond:   {scene:"base", name:"Pond", door:[318,560], spot:true, line:"The pond. Best break spot there is."},
  shed:   {scene:"base", name:"Shed", door:[430,280], spot:true, line:"Darren's shed. Tools, seed packets and one very old radio."},
  letterbox:{scene:"base", name:"Letterbox", door:[184,326], spot:true, line:"The letterbox. The morning paper lands here."},
  swing:  {scene:"base", name:"Tree swing", door:[112,318], spot:true, line:"Evan's swing. Push, push, wheee!"},
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
export const BRIDGES = {village:{base:"toBase", lane:"toLane"}, base:{village:"toTown"}, lane:{village:"toTownE"}};
// where Mel steps off, by "from>to"
export const ARRIVE = {"village>base":[260,132], "base>village":[260,578], "village>lane":[48,330], "lane>village":[426,238]};
// the next outdoor screen on the way from one to another (screens form a little chain: base - village - lane)
export function nextHop(from, to){
  if (from === to) return null; if (BRIDGES[from] && BRIDGES[from][to]) return to;
  const seen = {[from]: null}, q = [from];
  while (q.length) { const s = q.shift(); for (const n of Object.keys(BRIDGES[s] || {})) if (!(n in seen)) { seen[n] = s; if (n === to) { let h = n; while (seen[h] !== from) h = seen[h]; return h; } q.push(n); } }
  return null;
}
export const outdoorOf = s => OUTDOOR.includes(s) ? s : (VILLAGE[s] ? VILLAGE[s].scene : "village");
export const WORK = ["hall","chord","fresh","chico","post","home"];
export const POS = {A:[120,250], B:[400,250], C:[120,440], D:[400,440], E:[410,598], F:[112,596], G:[292,334], M:[260,400]};
// Each room may place its slots differently via `pos` (falls back to POS). Stations with a null regex are never
// picked for a quest (the market counter, the library's digest shelf).
// Tall pieces (shelves, boards, cabinets, the phone booth) and wall desks stand against the back wall, which meets
// the floor at y≈165: their front edge sits at 165 + their height. Tables, sofas and baskets stay out on the floor.
// station: [id, name, slot, furniture, keyword regex, line, standDy?]  (standDy: where Mel stands, relative to the front edge; default +42)
export const ROOMS = {
  hall:  {name:"Town hall", wall:"#E6E9F5", trim:"var(--peri)", pos:{A:[448,262], B:[110,258], C:[260,430], D:[334,266]}, stations:[
    ["table","Planning table","C","table",/plan|strategy|review|ceo|goal|week|month|quarter|budget/,"Big-picture thinking lives here."],
    ["whiteboard","Whiteboard","B","whiteboard",/brainstorm|idea|map|outline|launch|offer|pricing/,"Fresh marker, blank board."],
    ["phone","Phone booth","D","phone",/call|meeting|zoom|coffee|interview|podcast|sync/,"Quiet booth for calls."],
    ["shelf","Bookshelf","A","shelf",/read|research|learn|course|study/,"Smart books, cosy spines."]]},
  chord: {name:"Chord workshop", wall:"#E9F0E2", trim:"var(--sage)", pos:{A:[130,218], B:[390,420], C:[420,262], D:[120,540], E:[262,336]}, stations:[
    ["bench","Workbench","A","bench",/build|code|fix|bug|feature|ship|deploy|test|app|flow/,"Tools out. Let's build."],
    ["press","Printing press","B","press",/post|content|social|marketing|launch|campaign|newsletter|reel/,"Hot off the press."],
    ["wall","Client wall","C","cork",/client|user|customer|support|feedback|onboard|lead/,"Every face here is a creative you're helping."],
    ["laptop","Laptop desk","D","desk",/./,"The Chord dashboard awaits."],
    ["status","Health sign","E","healthchord",null,"Last night's Chord bug check."]]},
  fresh: {name:"Fresh Pages library", wall:"#F6E8DC", trim:"var(--peach)", pos:{A:[110,540], B:[410,540], C:[420,250], D:[260,420], E:[100,262]}, stations:[
    ["desk","Writing desk","A","desk",/write|draft|blog|article|essay|journal/,"Pen, paper, quiet."],
    ["typewriter","Typewriter","B","typewriter",/copy|sales page|website|caption|headline|email/,"Clack clack. Words incoming."],
    ["nook","Reading nook","C","nook",/read|review|edit|research|audit|feedback/,"Comfy chair, good lamp."],
    ["bigtable","Client table","D","table",/proposal|client|plan|brief|contract|onboard/,"Room for spreading out."],
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
  home:  {name:"Home", wall:"#F8EED8", trim:"var(--butter)", pos:{A:[120,216], B:[414,228], H:[326,250], C:[96,410], D:[464,452], G:[396,372], E:[436,598], F:[96,596]}, stations:[
    ["desk","Home desk","A","desk",/./,"Your own little desk."],
    ["kitchen","Kitchen","B","kitchen",/cook|meal|lunch|dinner|bake|grocer|prep/,"Something smells good."],
    ["sofa","Sofa","C","sofa",/read|rest|journal|meditat|book|nap/,"Soft cushions, deep breaths."],
    ["laundry","Laundry","D","laundry",/fold|laundry|clothes|wash|iron/,"Fold, stack, done."],
    ["cupboard","Cleaning cupboard","E","cupboard",/clean|tidy|wipe|hestia|dust/,"Hestia's chores live in here."],
    ["fridge","Fridge","H","fridge",null,"The fridge: what we have, and the shopping list."],
    ["treadmill","Treadmill","F","treadmill",/treadmill/,"1.2 and go. Walk and work.",-12],
    ["office","Darren's desk","G","office",null,"Darren's home office. Shh, he might be on a call."]]},
  market:{name:"Market", wall:"#F8E5E2", trim:"var(--blush)", stations:[
    ["stall","Shop counter","M","shopcounter",null,"Welcome in! Have a browse."]]}
};
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
