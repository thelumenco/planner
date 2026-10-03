// Village layout, building interiors (stations) and task -> place/spot matching.
import { hash } from "../util.js";

export const VILLAGE = {
  hall:   {name:"Town hall", short:"the town hall", emo:"🏛️", door:[260,180], mark:[222,64]},
  chord:  {name:"Chord workshop", short:"the Chord workshop", emo:"🛠️", door:[85,272], mark:[85,150]},
  fresh:  {name:"Fresh Pages library", short:"the library", emo:"📚", door:[435,272], mark:[445,160]},
  chico:  {name:"Chico cottage", short:"Chico cottage", emo:"🏡", door:[85,512], mark:[85,400]},
  post:   {name:"Post office", short:"the post office", emo:"📮", door:[435,502], mark:[435,386]},
  home:   {name:"Home", short:"home", emo:"🏠", door:[260,596], mark:[260,476]},
  market: {name:"Market", short:"the market", emo:"🧺", door:[362,350], mark:[362,290]},
  farm:   {name:"Garden", short:"the garden", emo:"🌱", door:[182,500], mark:[182,420]},
  board:  {name:"Quest board", door:[260,338], spot:true, line:"All of today's quests, in one place."},
  well:   {name:"Well", door:[160,350], spot:true, line:"Fresh water! Glug glug."},
  pond:   {name:"Pond", door:[338,614], spot:true, line:"The pond. Best break spot in town."}
};
export const WORK = ["hall","chord","fresh","chico","post","home"];
export const POS = {A:[120,250], B:[400,250], C:[120,440], D:[400,440], E:[410,598], F:[112,596], M:[260,400]};
// Each room may place its slots differently via `pos` (falls back to POS). Stations with a null regex are never
// picked for a quest (the market counter, the library's digest shelf).
// station: [id, name, slot, furniture, keyword regex, line, standDy?]  (standDy: where Mel stands, relative to the front edge; default +42)
export const ROOMS = {
  hall:  {name:"Town hall", wall:"#E6E9F5", trim:"var(--peri)", pos:{A:[430,300], B:[96,300], C:[260,430], D:[440,560]}, stations:[
    ["table","Planning table","C","table",/plan|strategy|review|ceo|goal|week|month|quarter|budget/,"Big-picture thinking lives here."],
    ["whiteboard","Whiteboard","B","whiteboard",/brainstorm|idea|map|outline|launch|offer|pricing/,"Fresh marker, blank board."],
    ["phone","Phone booth","D","phone",/call|meeting|zoom|coffee|interview|podcast|sync/,"Quiet booth for calls."],
    ["shelf","Bookshelf","A","shelf",/read|research|learn|course|study/,"Smart books, cosy spines."]]},
  chord: {name:"Chord workshop", wall:"#E9F0E2", trim:"var(--sage)", pos:{A:[150,300], B:[400,310], C:[400,540], D:[120,540]}, stations:[
    ["bench","Workbench","A","bench",/build|code|fix|bug|feature|ship|deploy|test|app|flow/,"Tools out. Let's build."],
    ["press","Printing press","B","press",/post|content|social|marketing|launch|campaign|newsletter|reel/,"Hot off the press."],
    ["wall","Client wall","C","cork",/client|user|customer|support|feedback|onboard|lead/,"Every face here is a creative you're helping."],
    ["laptop","Laptop desk","D","desk",/./,"The Chord dashboard awaits."]]},
  fresh: {name:"Fresh Pages library", wall:"#F6E8DC", trim:"var(--peach)", pos:{A:[110,540], B:[410,540], C:[420,300], D:[260,420], E:[100,300]}, stations:[
    ["desk","Writing desk","A","desk",/write|draft|blog|article|essay|journal/,"Pen, paper, quiet."],
    ["typewriter","Typewriter","B","typewriter",/copy|sales page|website|caption|headline|email/,"Clack clack. Words incoming."],
    ["nook","Reading nook","C","nook",/read|review|edit|research|audit|feedback/,"Comfy chair, good lamp."],
    ["bigtable","Client table","D","table",/proposal|client|plan|brief|contract|onboard/,"Room for spreading out."],
    ["digest","Digest shelf","E","bookcase",null,"Juniper's shelf of book digests."]]},
  chico: {name:"Chico cottage", wall:"#F7E3E6", trim:"var(--blush)", pos:{A:[400,530], B:[420,290], C:[130,530], D:[130,300]}, stations:[
    ["laptop","Laptop desk","A","desk",/build|fix|app|code|feature|bug|test|ship/,"Chico's engine room."],
    ["shelf","Craft shelf","B","craft",/design|brand|content|post|icon|copy/,"Colours, stickers, ideas."],
    ["sofa","Cosy sofa","C","sofa",/user|beta|tester|feedback|call|interview|parent/,"Perfect for chats with parents."],
    ["kitchen","Kitchen table","D","table",/plan|family|schedule|meal|roadmap/,"Where family plans happen."]]},
  post:  {name:"Post office", wall:"#E3EEF5", trim:"var(--sky)", pos:{A:[260,330], B:[450,320], C:[400,530], D:[120,530]}, stations:[
    ["counter","Sorting counter","A","counter",/email|inbox|reply|message|dm|respond/,"Letters in, letters out."],
    ["cabinet","Filing cabinet","B","cabinet",/admin|file|doc|contract|tax|form|organi/,"A place for everything."],
    ["scales","Stamps & scales","C","scales",/invoice|pay|bill|stripe|account|bank|receipt|expense|price/,"Weigh it, stamp it, send it."],
    ["ledge","Writing ledge","D","desk",/./,"A tidy little ledge for odd jobs."]]},
  home:  {name:"Home", wall:"#F8EED8", trim:"var(--butter)", stations:[
    ["desk","Home desk","A","desk",/./,"Your own little desk."],
    ["kitchen","Kitchen","B","kitchen",/cook|meal|lunch|dinner|bake|grocer|prep/,"Something smells good."],
    ["sofa","Sofa","C","sofa",/read|rest|journal|meditat|book|nap/,"Soft cushions, deep breaths."],
    ["laundry","Laundry basket","D","laundry",/fold|laundry|clothes|wash|iron/,"Fold, stack, done."],
    ["cupboard","Cleaning cupboard","E","cupboard",/clean|tidy|wipe|hestia|dust/,"Wet wipes live here."],
    ["treadmill","Treadmill","F","treadmill",/treadmill/,"1.2 and go. Walk and work.",-12]]},
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
export const spotObj = (scene, id) => id === "board" ? {id:"board", name:"Quest board", tx:260, ty:200, line:"This building's quests."} : stationsOf(scene).find(s => s.id === id);

export function placeOf(t){
  if (t.place && WORK.includes(t.place)) return t.place;
  const s = (t.title + " " + (t.channel || "")).toLowerCase();
  if (/chord/.test(s)) return "chord";
  if (/chico/.test(s)) return "chico";
  if (/ambidextrous|town hall/.test(s)) return "hall";
  if (t.meeting) return "hall";
  if (/clean|fold|laundry|cook|chore|grocer|wash|tidy|evan|hestia|skincare|gym|workout/.test(s)) return "home";
  if (/copy|write|blog|caption|proposal|audit|muse|fresh pages|newsletter|website|brand/.test(s)) return "fresh";
  return "post";
}
export function spotOf(t){
  // The cupboard and treadmill are only picked on purpose (the clean, or "Do it on the treadmill").
  const pl = placeOf(t), st = stationsOf(pl).filter(s => (s.id !== "cupboard" || /clean|tidy|wipe|hestia|dust/i.test(t.title)) && s.id !== "treadmill" && s.re);
  if (t.spot === "treadmill" && pl === "home") return "treadmill";
  if (t.spot && st.find(s => s.id === t.spot)) return t.spot;
  const s = t.title.toLowerCase();
  const hit = st.find(x => x.re && x.re.source !== "." && x.re.test(s));
  if (hit) return hit.id;
  const fallback = st.filter(x => x.id !== "cupboard" && x.re);  // (treadmill already excluded above)
  const dflt = fallback.find(x => x.re && x.re.source === ".");
  return dflt ? dflt.id : fallback[hash(t.id) % fallback.length].id;
}
