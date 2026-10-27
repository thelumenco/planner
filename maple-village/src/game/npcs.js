// NPC engine: places villagers by their daily routine (local time), walks them about, handles taps and daily reactions,
// and runs agent messengers who carry unread mail to the player. Core owns the frame loop and calls tickNpcs / tapNpc.
import { NPCS, AGENTS } from "../data/npcs.js";
import { petify } from "../art/pets.js";
import { personArt, letterArt, rainGearFor } from "../art/people.js";
import { rainyOn } from "../art/village-extras.js";
import { OUTDOOR } from "../data/world.js";
import { localHM, now, H, pick, rnd, clamp, $, plain, esc, dayKey, LOC } from "../util.js";
import { lunchSlot } from "./lunch.js";
import { occasionSlot } from "./occasions.js";
import { toursOn, visitsOn, eventOn, keepersOn, TOURISTS, NIGHT_TOURISTS, awayToday } from "./tours.js";
import { browseSlot } from "./browse.js";
import { openOn as cocoaOpen, OPEN as CC_OPEN, CLOSE as CC_CLOSE } from "./cocoa.js";
import { keeperOn as giftOpen, GIFT_HOURS } from "./giftshop.js";
import { millSlot } from "./millcraft.js";
import { southSlot } from "./south.js";
import { supperSlot } from "./passage.js";
import { MILL_VISITORS } from "../data/mill-people.js";
import { tourSlot, visitSlot, fieldSlot, tastingSlot, familySlot, eventSlot, classSlot, shoreSlot, dateSlot, clubSlot, discoSlot, scoopSlot, workshopSlot, trainSlot, letSlot, movieSlot, bayMarketSlot } from "./tours.js";
import { SEA } from "../data/npcs.js";
import { findPath, blocked } from "./paths.js";
import { tripSlot, townLine } from "./trips.js";
import { guestSlot, guestLine } from "./guests.js";
import { GUEST_DAYS } from "../data/guests.js";
import { townOf, townRoom, TOWNS } from "../data/towns.js";

const NS = "http://www.w3.org/2000/svg";
const ents = {};            // id -> entity (villagers and the active messenger)
let api = null, storyT = null;             // see core: scene(), bounds(), hero, F(), S(), save(), facts(), bubble(), openMail(), unreadMail(), gift()
let courier = null;         // the messenger currently on screen
let popup = null, popupNext = 0, popupN = 0;   // a customer at the campervan's pop-up crate, and when the next may come
let sayer = null, sayT = null;
const greeted = new Set();  // messengers say hello once, then just tag along quietly

export function initNpcs(a){ api = a; }
const weekend = () => [0, 6].includes(new Date(now() + LOC()).getUTCDay());
const dowNow = () => new Date(now() + LOC()).getUTCDay();
// Orchard tours and drop-in visits (tours.js) win over the usual routine while they're on
// A paddle with friends (the player at the paddleboard rack): any of the family who are on the foreshore come out on boards too
const SUP_FAMILY = ["hana", "theo", "tomi", "posy"];
function supSlot(def){
  const sup = api && api.sup && api.sup(); if (!sup || !SUP_FAMILY.includes(def.id)) return null;
  const base = routineNow(def); if (!base || base.scene !== "shore") return null;
  return {from: sup.from, to: sup.from + 999, scene: "shore", wander: SEA, act: "sup", free: true, glide: true};
}
// Where someone is on a given day at a given time (local minutes): the special happenings first (a family paddle,
// the market, a tour, Hana's class, visits, tastings), then their own routine. slotNow is right now.
const dowOf = day => new Date(day + "T00:00:00Z").getUTCDay();
const routineAt = (def, day, t) => { const dw = dowOf(day), we = dw === 0 || dw === 6, owned = Object.assign({}, (api && api.F().fam && api.F().fam.owned) || {}, (api && api.F().goals) || {}, ...Object.keys((api && api.F().cocoa && api.F().cocoa.up) || {}).map(k => ({["cc_" + k]: 1})));   // things bought for the family, big goals, Cocoa Room upgrades (cc_<k>)
  return def.routine.find(s => t >= s.from && t < s.to && (!s.days || (s.days === "we") === we) && (!s.dow || s.dow.includes(dw)) && (!s.needs || owned[s.needs])) || null; };
const routineNow = def => routineAt(def, dayKey(), localHM());
export function slotAt(def, day, t, live){
  return (api && guestSlot(api.F(), def.id, day, t)) || (api && tripSlot(api.F(), def.id, day, t, live ? api.scene() : null)) || (live && supSlot(def)) || lunchSlot(def.id, day, t, terraceBuilt()) || occasionSlot(def.id, day, t, terraceBuilt()) || millSlot(def.id, day, t, millShopOpen(), MILL_VISITORS, []) || (passageFound() && supperSlot(def.id, day, t, awayToday(day))) || dateSlot(def.id, day, t) || (cellarBuilt() && clubSlot(def.id, day, t)) || (cellarBuilt() && discoSlot(def.id, day, t)) || movieSlot(def.id, day, t) || bayMarketSlot(def.id, day, t) || workshopSlot(def.id, day, t) || trainSlot(def.id, day, t) || nightOk(eventSlot(def.id, day, t), def, day, t) || tourSlot(def.id, day, t) || classSlot(def.id, day, t) || familySlot(def.id, day, t)
    || visitSlot(def.id, day, t) || fieldSlot(def.id, day, t) || tastingSlot(def.id, day, t) || iceOk(shopSlot(def.id, day, t), def, day, t) || shoreSlot(def.id, day, t) || iceOk(scoopSlot(def.id, day, t), def, day, t) || letSlot(def.id, day, t) || southSlot(def.id, day, t, api && api.F()) || routineAt(def, day, t);
}
// round 181: shoppers you can see in the Cocoa Room (day tourists) and the gift shop (the night-market folk, by day)
const some = o => Object.values(o || {}).some(n => n > 0);
function shopSlot(id, day, t){
  if (!api) return null; const F = api.F(), g = F.goals || {};
  if (g.cocoa && TOURISTS.includes(id)) { const c = F.cocoa || {};
    return browseSlot(id, day, t, {shop: "cocoa", open: cocoaOpen(day, t, !!(c.up || {}).assistant), from: CC_OPEN, to: CC_CLOSE, pool: TOURISTS.filter(x => !busyOn(day).includes(x)), stock: some(c.bars) || some(c.trays)}); }
  if (g.giftshop && NIGHT_TOURISTS.includes(id)) { const c = F.cocoa || {}, v = F.vine || {};
    return browseSlot(id, day, t, {shop: "giftshop", open: giftOpen(day, t), from: GIFT_HOURS.from, to: GIFT_HOURS.to, pool: NIGHT_TOURISTS.filter(x => !busyOn(day).includes(x)), stock: (g.cocoa && (some(c.bars) || some(c.trays))) || some((F.craft || {}).store) || (v.shelf || []).some(b => b.n > 0) || ((F.giftshop || {}).pairs || []).length > 0}); }
  return null;
}
// a night-market shopper slot gives way to the wine shop: anyone due at a tasting or in the shop then goes there instead
const nightOk = (s, def, day, t) => !s || !s.night ? s : tastingSlot(def.id, day, t) || (routineAt(def, day, t) || {}).scene === "wineshop" ? null : s;
// an ice cream at the Scoop Shack: only for someone who isn't busy (no routine then, or just out and about)
const iceOk = (s, def, day, t) => { if (!s) return null; const r = routineAt(def, day, t); return !r || ["village", "lane", "field", "shore", "bay", "orchard", "flowers", "base", "vineyard"].includes(r.scene) ? s : null; };
const terraceBuilt = () => !!(api && api.F().vine && api.F().vine.terrace);   // the wine shop's terrace (round 146: the Sunday long lunch)
const millShopOpen = () => !!(api && api.F().goals && api.F().goals.millshop);   // round 153: weekend day-trippers walk up to the Mill Shop
const busyCache = {}; const busyOn = day => busyCache[day] || (busyCache[day] = [...toursOn(day).flatMap(t => [t.guide, ...t.group]), ...visitsOn(day).map(v => v.id), ...keepersOn(day)]);
const passageFound = () => !!(api && api.F().passage && api.F().passage.step >= 5);   // round 229: Monday suppers in the wine cave
const cellarBuilt = () => !!(api && api.F().goals && api.F().goals.cellar);   // the wine club meets in the cellar door
// Where someone should be right now. Working it out walks every tour, visit, tasting and class, so it's kept for the
// rest of the game minute (round 193: it was over half the frame time, and the player felt the game hang). Anything the player does
// that saves the game clears it, so a change still shows at once.
let slotCache = {}, slotKey = "";
export const clearSlots = () => { slotCache = {}; slotKey = ""; };
const slotNow = def => { const sup = api && api.sup && api.sup(), k = `${dayKey()}|${localHM()}|${api ? api.scene() : ""}|${sup ? sup.from : ""}`;
  if (k !== slotKey) { slotCache = {}; slotKey = k; }
  return def.id in slotCache ? slotCache[def.id] : (slotCache[def.id] = slotAt(def, dayKey(), localHM(), true)); };
export const whereIs = id => { const d = NPCS.find(n => n.id === id), s = d && slotNow(d); return s ? s.scene : null; };
// where they are right now, with a point to walk to (their own spot, or the first stop of their stroll), or null
export const whereAt = id => { const d = NPCS.find(n => n.id === id), s = d && slotNow(d); if (!s) return null; const e = ents[id], p = e ? [e.x, e.y] : s.at || (s.wander || [])[0]; return p ? {scene: s.scene, x: p[0], y: p[1]} : null; };
export const npcPos = id => ents[id] ? {x: ents[id].x, y: ents[id].y} : null;
export function npcSay(id, text){ const e = ents[id]; if (!e) return false; e.dir = api.hero.x < e.x ? -1 : 1; say(e, text, 4500); api.sfx && api.sfx("babble", e.def.pitch || 1); return true; }
const PROPS = {water: "can", repair: "hammer", farm: "hoe", cone: "cone", fish: "rod", guitar: "guitar", sketch: "sketchbook", photo: "camera", notes: "notebook", doze: "newspaper",
  parasol: "parasol", wheel: "claycup", cranes: "crane", go: "goboard", skewer: "skewer", brush: "brush", fortune: "fortune",
  kite: "kite", pick: "tbasket", nets: "net", stack: "stone",
  knit: "knit", bocce: "bocce", poles: "poles", row: "oar", read: "book", poem: "notebook",
  rummage: "hanger", binoculars: "binocs", crown: "crownw", drone: "remote", cuppa: "cuppa", footy: "footy", swirl: "wineglass", juggle: "juggle", fan: "fan", carry: "flats", feedroo: "roobag", bbq: "tongs", skim: "skim", cards: "cards", mallow: "mallow",
  bodyboard: "bodyboard", yoga: "yogamat", telescope: "telescope", paint: "easel", macro: "macrocam", count: "clicker", chips: "chipbox", prawns: "prawnbag", shells: "shellpail", shelter: "driftwood", parrot: "parrot", quoits: "quoit", postcard: "postcard",
  flask: "thermos", wade: "wadewater", ducks: "ducks", frisbee: "frisbee", lollybag: "lollybag", pail: "milkpail", fence: "fencerail", shake: "branch", crack: "nutstone", pan: "goldpan", guard: "guardflag", sip: "sarsbottle",
  armful: "armful", bee: "beebuzz", baguette: "baguette", accordion: "accordion", sniff: "sniffstrip", spritz: "atomiser", beesuit: "beeveil", sunflower: "bigflower", float: "ring", picnic: "rug", candle: "candlelit", goat: "kid", lantern: "xlantern", carol: "songsheet", shopbag: "shopbag",
  crab: "crabline", fossil: "hammer", sarnie: "sarnie", railpaint: "brush",
  swim: "swimcap", rampart: "guidebook", gossip: "headscarf", boatwatch: "handsback", rockjump: "splash", snorkel: "snorkelmask", verse: "quillpad",   // Portovenere   // round 215: Saltwick Harbour
  puffinwatch: "binocs", goatfeed: "goatfeed", seaglass: "glassbit",   // round 216: Puffin Isle ("sealwave" is a pose)
  softserve: "softcone", toast: "beerglass", ski: "skipoles",   // round 217: Hokkaido ("footbath" and "flowerlie" are poses)
  riceplant: "seedling", coconut: "coconutstraw", offering: "canang", gamelan: "mallet",
  suitcase: "suitcase"};   // round 219: guests arriving for the cottages   // round 218: Bali ("beanbag" and "jungleswing" are poses)   // round 164: the Lavender Hills ("heart" is a pose)   // round 160: the Tablelands ("hush" is a pose)   // round 150: the Coast Road   // (and these: Bellbird Valley, round 144; "wave", "taichi", "crouch" and "lookup" are poses)   // (and these: Cinque Terre, round 134; "sunbathe" is a towel)   // (and these: Jeju, round 129; "luck" is an arm and "tandem" a bike)   // (and these: Kyoto, round 122)   // (the last five: Ronda, round 107)
const outdoors = s => OUTDOOR.includes(s);
export const isHere = id => { const d = NPCS.find(n => n.id === id), s = d && slotNow(d); return !!(s && s.scene === api.scene()); };

function makeNode(id, look, kid, letter, act){
  const g = document.createElementNS(NS, "g");
  g.setAttribute("class", "ch npc" + (act ? " act-" + act : "")); g.dataset.npc = id; g.setAttribute("role", "button");
  if (act && PROPS[act]) look = Object.assign({}, look, {extra: PROPS[act]});
  if (act === "sup") look = Object.assign({}, look, {board: true, hat: null});
  if (act === "sunbathe") look = Object.assign({}, look, {towel: true, hat: null});   // Cinque Terre: Hana on the Manarola rocks
  if (act === "tandem") look = Object.assign({}, look, {bike: "#C8432F"});   // Jeju: Tomi and Posy on the coast road
  const owned = (api.F().fam && api.F().fam.owned) || {};
  if (id === "bo" && act === "type" && owned.headphones) look = Object.assign({}, look, {headphones: true});
  // a rainy day outdoors: everyone has their own brolly or raincoat (a coat if their right hand's busy or they're on a board)
  if (OUTDOOR.includes(api.scene()) && !townOf(api.scene()) && rainyOn(dayKey(), localHM()) && !look.board) look = Object.assign({}, look, {rain: rainGearFor(id, {coat: !!look.bike || !!look.extra && ["can", "hammer", "hoe", "lantern", "cone", "bell", "rod"].includes(look.extra)})});
  g.innerHTML = personArt(look, kid) + (letter ? `<g class="letter">${letterArt}</g>` : "") + `<g class="storycue" transform="translate(0 ${kid ? -48 : -72})" pointer-events="none"><g filter="url(#wob)"><rect x="-13" y="-9" width="26" height="16" rx="8" style="fill:#FFFDF6;stroke:var(--line)" stroke-width="1.2"/><circle cx="-6" cy="-1" r="1.8" style="fill:var(--line)"/><circle cx="0" cy="-1" r="1.8" style="fill:var(--line)"/><circle cx="6" cy="-1" r="1.8" style="fill:var(--line)"/></g></g>`;
  $("actors").appendChild(g);
  return g;
}
function drop(id){ const e = ents[id]; if (!e) return; e.node.remove(); delete ents[id]; if (sayer === e) hideSay(); }

function stepTo(e, speed, dt){
  const dx = e.tx - e.x, dy = e.ty - e.y, d = Math.hypot(dx, dy);
  if (d < 1.2) { e.x = e.tx; e.y = e.ty; e.moving = false; return true; }
  const s = Math.min(d, speed*dt); e.x += dx/d*s; e.y += dy/d*s; e.moving = true;
  if (Math.abs(dx) > 0.6) e.dir = dx < 0 ? -1 : 1;
  return false;
}
const jitter = ([x, y]) => [x + rnd(-10, 10), y + rnd(-6, 6)];
// Outdoors everyone goes round buildings, the pond and fences: a target becomes waypoints from the route finder
// (the same one the player uses). walk() steps along them and returns true on arrival at the last one.
function route(e, x, y){
  const s = api.scene(); e.goal = [x, y];
  if (outdoors(s) || townRoom(s)) { const pts = findPath(s, [e.x, e.y], [x, y], api.bounds()); const f = pts.shift(); e.tx = f[0]; e.ty = f[1]; e.path = pts; }
  else { e.tx = x; e.ty = y; e.path = []; }
}
function walk(e, speed, dt){
  if (!stepTo(e, speed, dt)) return false;
  if (e.path && e.path.length) { const n = e.path.shift(); e.tx = n[0]; e.ty = n[1]; e.moving = true; return false; }
  return true;
}

/* ---------- villagers ---------- */
function tickVillager(def, dt){
  const scene = api.scene(), slot = slotNow(def), key = slot ? `${slot.scene}:${slot.from}` : null;
  let e = ents[def.id];
  if (!slot || slot.scene !== scene) { if (e) drop(def.id); return; }
  if (!e || e.key !== key) {
    // glide: a new slot in the same scene is walked to (market keepers moving about their stall), not popped into
    const was = slot.glide && e && e.key && e.key.split(":")[0] === slot.scene ? [e.x, e.y] : null;
    if (e) drop(def.id);
    const p = slot.at || jitter(pick(slot.wander)), s0 = was || p;
    e = ents[def.id] = {def, key, act: slot.act, kind: "npc", x: s0[0], y: s0[1], tx: s0[0], ty: s0[1], dir: slot.dir || (Math.random() < .5 ? -1 : 1), moving: false, wait: rnd(1, 4), bike: !!((slot.look && slot.look.bike) || def.look.bike) && OUTDOOR.includes(scene), node: makeNode(def.id, Object.assign({}, def.look, slot.look || {}, outdoors(scene) ? {} : {hat: null}, OUTDOOR.includes(scene) ? {} : {bike: null}), def.kid, false, slot.act)};   // hats come off indoors
    if (was && slot.follow) route(e, p[0], p[1]);   // on a day trip: round things to the next spot
    else if (was) { e.tx = p[0]; e.ty = p[1]; e.path = []; }   // straight across the open field (stalls sit above the walkable area)
    // on a day trip the family come in with the player (from just behind her) and stroll over to their favourite spot
    else if (slot.follow && api.hero) { const b = api.bounds(); e.x = clamp(api.hero.x + rnd(-30, 30), b[0], b[2]); e.y = clamp(api.hero.y + rnd(6, 26), b[1], b[3]); if (slot.free) { e.tx = p[0]; e.ty = p[1]; e.path = []; } else route(e, p[0], p[1]); }   // (free: rowing out to sea, straight off the beach)
  }
  // Now and then a neighbour near the player says hello (each at most every few minutes).
  const near = Math.hypot(e.x - api.hero.x, e.y - api.hero.y) < 110;
  // a story chapter ready to tell (stories.js): the little "…" over their head
  if (!e.cueAt || Date.now() - e.cueAt > 2000) { e.cueAt = Date.now(); e.story = !!(api.storyReady && api.storyReady(def.id)); e.node.classList.toggle("story", e.story); }
  if (near && !sayer && Date.now() - (e.helloAt || 0) > 4*60e3 && Math.random() < dt*.08) {
    e.helloAt = Date.now(); if (!e.act) e.dir = api.hero.x < e.x ? -1 : 1;
    const tl = (slot.trip && townLine(api.F(), def.id, scene)) || (slot.guest && [guestLine(api.F(), def.id, scene)]);
    say(e, e.story ? pick(["Hello! Got a minute?", "Oh, I wanted to tell you something.", "Have you got a moment?"]) : tl && Math.random() < .7 ? pick(tl) : pick(def.hellos || hellos()), tl ? 4200 : 2600); api.sfx && api.sfx("babble", def.pitch || 1);
  }
  const b = api.bounds();
  if (walk(e, def.kid ? 95 : slot.free ? 22 : e.bike ? 86 : 48, dt)) {   // on a bike (look.bike), nearly twice walking pace
    e.wait -= dt;
    if (e.wait <= 0 && slot.wander) {
      let p = jitter(pick(slot.wander));
      for (let k = 0; k < 6 && outdoors(scene) && blocked(scene, p[0], p[1]); k++) p = jitter(pick(slot.wander));   // never wander into a building
      if (def.id === "pip" && scene === "base" && Math.random() < .35) {   // Pip races to the pond
        p = [330 + rnd(-10, 10), 520]; false.tx = 350 + rnd(-14, 14); false.ty = 516; false.run = true;
        if (Math.random() < .6) say(e, "Race you to the pond!");
      }
      if (slot.free) { e.tx = p[0]; e.ty = p[1]; e.path = []; }   // paddleboarders drift straight across the water
      else route(e, clamp(p[0], b[0], b[2]), clamp(p[1], b[1], b[3]));
      e.wait = rnd(3, 8);
    }
  }
  e.node.classList.toggle("run", def.kid && e.moving);
}

const hellos = () => { const t = localHM(); return [t < 720 ? "Morning!" : t < 1080 ? "Afternoon!" : "Evening!", "Hi!", "Hello there!", "Hiya!"]; };
/* ---------- messengers ---------- */
// screens with water down the left-hand side, and where the dry land starts
const WET_LEFT = {shore: 196, bay: 200, field: 200};
function tickCourier(dt){
  const scene = api.scene(), hero = api.hero;
  if (courier && courier.scene !== scene) { drop(courier.id); courier = null; }
  if (scene === "home" || scene === "room" || scene === "guestroom" || scene === "office" || scene === "garage" || townOf(scene)) return;   // (and nobody posts letters to Ronda)   // only family inside the house (and nobody in the player's room); notes wait until the player steps out
  // the note she's carrying was replaced or read elsewhere (e.g. fresh mail arrived just after the page opened)
  if (courier && courier.state !== "leaving" && !api.unreadMail().some(m => m.id === courier.item.id)) { drop(courier.id); courier = null; }
  if (!courier) {
    // The morning paper (from the crier) waits in the letterbox at home; only if the player heads into town without
    // reading it does Rosa come and find her there. Everyone else delivers wherever the player is.
    const item = api.unreadMail().find(m => m.from !== "crier" || scene === "village"); if (!item) return;
    const ag = AGENTS[item.from] || AGENTS.postie;
    // (round 225, Mel: "the postie walks over water"): on screens with water down the left (the sea, the field's lake), she comes in from the dry right
    const start = scene === "field" && hero.y > 300 ? [290, 660] : outdoors(scene) ? (hero.x < 260 || WET_LEFT[scene] ? [540, 330] : [-20, 330]) : [260, 640];   // (the field: below the lake, up the path from the orchard gate)
    const id = "agent-" + item.id;
    courier = ents[id] = {id, kind: "agent", item, ag, scene, state: "coming", x: start[0], y: start[1], tx: hero.x, ty: hero.y, dir: 1, moving: true, wait: 0, node: makeNode(id, ag.look, false, true)};
  }
  const c = courier;
  if (c.state === "coming" || c.state === "waiting") {
    const side = hero.x > 260 ? -1 : 1;
    // stand beside the player, on whichever side isn't inside something (the well, a stall)
    let [gx, gy] = [[side*44, 2], [-side*44, 2], [side*30, 26], [-side*30, 26], [0, 34]].map(([dx, dy]) => [hero.x + dx, hero.y + dy]).find(([x, y]) => !outdoors(scene) || !blocked(scene, x, y)) || [hero.x + side*44, hero.y + 2];
    if (WET_LEFT[scene]) gx = Math.max(gx, WET_LEFT[scene]);   // the player's out paddling (or by the water): wait at the water's edge
    if (!c.goal || Math.hypot(c.goal[0] - gx, c.goal[1] - gy) > 18) route(c, gx, gy);   // re-route only when the player has moved
    const arrived = walk(c, 150, dt);
    if (arrived && c.state === "coming") {
      c.state = "waiting"; c.dir = -side;
      if (!greeted.has(c.item.id)) { greeted.add(c.item.id); say(c, `${c.item.hello || (c.item.from === "crier" && c.ag.helloTown ? c.ag.helloTown : c.ag.hello)} Tap me for the note.`, 6000); }
    }
  } else if (c.state === "leaving") {
    if (walk(c, 140, dt)) { drop(c.id); courier = null; }
  }
  c.node.classList.toggle("run", c.moving && c.state !== "leaving");
  c.node.classList.toggle("walk", c.moving);
}
// round 228: customers at the campervan's pop-up crate. While you're on the van's screen with the crate out, someone from
// the town wanders up every couple of minutes, has a look, buys something (popupSale in core), and strolls off.
const POPUP_GAP = [70, 150], POPUP_SAY = ["Ooh, I'll take {w}, please.", "{W}! Just what I was after.", "Is that {w}? Go on then.", "I'll have {w}. It's for my mum.", "{W}, please. Lovely little stall."];
function tickPopup(dt){
  const scene = api.scene(), spot = api.popup && api.popup(), t = performance.now();
  if (popup && (popup.scene !== scene || (!spot && popup.state !== "leaving"))) { drop(popup.id); popup = null; }
  if (!spot) { popupNext = Math.max(popupNext, t + 20000); return; }   // (the first one comes a little after you get there)
  if (!popup) {
    if (t < popupNext) return;
    // someone from round here who isn't already on the screen: the day-trippers and travelling neighbours, or a local whose day brings them to this spot
    const locals = NPCS.filter(d => d.local === "bellbird" && !d.kid && !ents[d.id] && (d.tourist || d.neighbour || (d.routine || []).some(r => r.scene === scene)));
    if (!locals.length) { popupNext = t + 30000; return; } const def = pick(locals);
    const from = spot.x > 260 ? [-24, spot.y + 30] : [544, spot.y + 30], id = "popup-" + (++popupN);
    popup = ents[id] = {id, kind: "agent", popup: true, ag: {name: def.name, look: def.look}, scene, state: "coming", x: from[0], y: from[1], dir: 1, moving: true, wait: 0, node: makeNode(id, def.look, false, false)};
    route(popup, spot.x + (Math.random() < .5 ? -6 : 6), spot.y);
  }
  const c = popup;
  if (c.state === "coming") { if (walk(c, 110, dt)) { c.state = "looking"; c.wait = 2.2; c.dir = 1; } }
  else if (c.state === "looking") { c.wait -= dt; if (c.wait <= 0) {
    const r = api.popupSale && api.popupSale(); c.state = "paid"; c.wait = 2.6;
    if (r) { const w = r.what.replace(/^(an?) /i, (m, a) => a.toLowerCase() + " "), line = pick(POPUP_SAY); say(c, line.replace("{w}", w).replace("{W}", w[0].toUpperCase() + w.slice(1)), 3200); }
  } }
  else if (c.state === "paid") { c.wait -= dt; if (c.wait <= 0) { c.state = "leaving"; route(c, c.x < 260 ? -30 : 550, c.y + 20); } }
  else if (c.state === "leaving" && walk(c, 120, dt)) { drop(c.id); popup = null; popupNext = t + (POPUP_GAP[0] + Math.random()*(POPUP_GAP[1] - POPUP_GAP[0]))*1000; return; }
  c.node.classList.toggle("walk", c.moving);
}
export function courierDelivered(itemId){
  if (!courier || courier.item.id !== itemId) return;
  courier.state = "leaving"; courier.node.querySelector(".letter")?.remove();
  say(courier, pick(["Off I go!", "Have a lovely day!", "Bye for now!"]), 2200);
  const scene = api.scene(); route(courier, outdoors(scene) ? (courier.x < 260 ? -30 : 550) : 260, outdoors(scene) ? 330 : 650);
}

/* ---------- talking ---------- */
function say(e, text, ms = 3800){
  text = petify(text, api.F());
  if (api.quiet && api.quiet()) return;   // quiet evening: neighbours only talk when tapped
  const el = $("npcSay"); sayer = e;
  const who = e.kind === "agent" ? e.ag.name.split(/[ ,]/)[0] : e.def.name;
  el.innerHTML = `<b class="who">${esc(who)}</b>${esc(plain(text))}`; el.hidden = false;
  clearTimeout(sayT); sayT = setTimeout(hideSay, ms);
}
function hideSay(){ $("npcSay").hidden = true; sayer = null; }

export function tapNpc(id){
  const e = ents[id]; if (!e) return;
  if (e.kind === "agent") { if (e.popup) { say(e, pick(["Lovely stall!", "Did you make all this yourself?", "I'll tell my friends about this."]), 2600); return; } api.openMail(e.item); return; }
  const def = e.def, F = api.F(), S = api.S();
  F.met = F.met || {}; S.npcSaid = S.npcSaid || {};
  if (!e.act) e.dir = api.hero.x < e.x ? -1 : 1;
  api.chatted && api.chatted(def.name);
  if (!F.met[id]) {
    F.met[id] = true; say(e, def.intro, 7000);
    if (def.gift && !(F.gifts || {})[id]) { F.gifts = Object.assign(F.gifts || {}, {[id]: true}); setTimeout(() => { api.gift(def.gift); say(e, "Here, a free packet of seeds. Plant them by morning.", 4500); }, 7200); }
    api.save(); return;
  }
  // their story, a chapter at a time (stories.js): the bubbles follow on, one after another
  { const t = api.story && api.story(id); if (t) { clearTimeout(storyT); let i = 0;
    const next = () => { if (i >= t.lines.length) { if (t.reward) api.flash && api.flash(`From ${def.name}: ${t.reward}`); return; } const line = t.lines[i++], ms = 2400 + line.length*42; say(e, line, ms); storyT = setTimeout(next, ms + 300); };
    next(); e.story = false; e.node.classList.remove("story"); api.sfx && api.sfx("babble", def.pitch || 1); api.save(); return; } }
  const facts = api.facts();
  const cond = Object.keys(def.react || {}).find(k => facts[k] && !S.npcSaid[id + ":" + k]);
  if (cond) { S.npcSaid[id + ":" + cond] = true; say(e, def.react[cond], 4500); api.save(); return; }
  { const tl = townLine(F, id, api.scene()); if (tl && Math.random() < .75) { say(e, pick(tl), 4500); return; } }
  { const gl = guestLine(F, id, api.scene()); if (gl) { say(e, gl, 4500); return; } }   // staying in the guest room   // on a day trip: the town's lines
  if (e.act && def.actLines && def.actLines[e.act] && Math.random() < .6) { say(e, pick(def.actLines[e.act])); return; }
  say(e, pick(def.lines));
}

/* ---------- per-frame ---------- */
export function tickNpcs(dt){
  NPCS.forEach(def => tickVillager(def, dt));
  tickCourier(dt);
  tickPopup(dt);
  Object.values(ents).forEach(e => {
    e.node.setAttribute("transform", `translate(${e.x.toFixed(1)} ${e.y.toFixed(1)})`);
    e.node.firstElementChild.setAttribute("transform", `scale(${e.dir} 1)`);
    if (e.kind === "npc") e.node.classList.toggle("walk", e.moving);
  });
  const el = $("npcSay");
  // Next to the player, the pet's bubble owns the space above, so a neighbour's bubble drops below their feet.
  if (sayer && !el.hidden) api.bubble(el, sayer.x, sayer.y, sayer.kind === "npc" && sayer.def.kid ? 44 : 70, Math.hypot(sayer.x - api.hero.x, sayer.y - api.hero.y) < 90);
}
export const npcActors = () => Object.values(ents).map(e => [e.node, e]);
export function resetScene(){ Object.keys(ents).forEach(drop); courier = null; popup = null; }

// Someone's whole day as a list of stretches: {from, to, scene, act, club} (6am to 11pm, in quarter hours)
const schedCache = {};
export function daySchedule(id, day){
  const ck = id + "|" + day; if (schedCache[ck]) return schedCache[ck];
  const def = NPCS.find(n => n.id === id); if (!def) return [];
  const out = [];
  for (let t = 6*60; t < 23*60; t += 15) {
    const s = slotAt(def, day, t), key = s ? `${s.scene}|${s.act || ""}|${s.club ? 1 : ""}` : "";
    const last = out[out.length - 1];
    if (last && last.key === key) last.to = t + 15; else out.push({key, from: t, to: t + 15, scene: s && s.scene, act: s && s.act, club: !!(s && s.club)});
  }
  return (schedCache[ck] = out.filter(x => x.scene));
}
// Tomo on the mint delivery bike (round 138): when an order goes out and the player's outdoors in Honeybrook, he pedals
// across the screen with the cool box on the back, waves, and is gone. Not a villager entity (no taps, no routine).
// Tomo on the delivery bike, riding past along a route (scene coords, from one edge of the screen to the other) that
// keeps to the paths: core.js plans it round buildings and water with paths.js. ~95 px a second.
export function rideBy(look, pts){
  const host = $("actors"); if (!host || host.querySelector(".rideby") || !pts || pts.length < 2) return null;
  const g = document.createElementNS(NS, "g"); g.setAttribute("class", "ch npc walk rideby"); g.setAttribute("pointer-events", "none");
  g.innerHTML = personArt(Object.assign({}, look, {bike: "#7FC8B4", extra: "helmet", hat: null}), false);
  const box = document.createElementNS(NS, "g"); box.innerHTML = `<g style="stroke:var(--line)" stroke-width="1"><rect x="-24" y="-20" width="13" height="11" rx="2" style="fill:#7FC8B4"/><rect x="-24" y="-20" width="13" height="3" rx="1" style="fill:#FFFDF6"/></g>`;
  g.firstElementChild.appendChild(box.firstElementChild);
  host.appendChild(g);
  const legs = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1])), total = legs.reduce((a, b) => a + b, 0), ms = total/95*1000, t0 = performance.now();
  const step = now => { let d = Math.min(1, (now - t0)/ms)*total, i = 0; while (i < legs.length - 1 && d > legs[i]) { d -= legs[i]; i++; }
    const [ax, ay] = pts[i], [bx, by] = pts[i + 1], k = legs[i] ? Math.min(1, d/legs[i]) : 1, x = ax + (bx - ax)*k, y = ay + (by - ay)*k, bob = Math.sin(now/90)*.6;
    g.firstElementChild.setAttribute("transform", `scale(${bx >= ax ? 1 : -1} 1)`);
    g.setAttribute("transform", `translate(${x.toFixed(1)} ${(y + bob).toFixed(1)})`); if (now - t0 < ms && g.isConnected) requestAnimationFrame(step); else g.remove(); };
  requestAnimationFrame(step); return g;
}
// dev builds only: where everyone is at a given day and time, the day-trip towns' and the house guests' spots, and the
// walking obstacles (round 228: a test checks nobody's put standing on a table, a stall or a roof)
if (globalThis.__hbDevStub) globalThis.__hbSlots = {at: (day, t) => NPCS.map(d => [d.id, slotAt(d, day, t, false)]).filter(([, s]) => s), towns: () => TOWNS, guests: () => GUEST_DAYS, blocked};
