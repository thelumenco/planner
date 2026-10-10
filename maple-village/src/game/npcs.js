// NPC engine: places villagers by their Singapore-time routine, walks them about, handles taps and daily reactions,
// and runs agent messengers who carry unread mail to Mel. Core owns the frame loop and calls tickNpcs / tapNpc.
import { NPCS, AGENTS } from "../data/npcs.js";
import { personArt, letterArt, rainGearFor } from "../art/people.js";
import { rainyOn } from "../art/village-extras.js";
import { OUTDOOR } from "../data/world.js";
import { sgHM, now, H, pick, rnd, clamp, $, plain, esc, dayKey } from "../util.js";
import { tourSlot, visitSlot, fieldSlot, tastingSlot, familySlot, eventSlot, classSlot, shoreSlot, dinnerSlot, dateSlot, clubSlot, scoopSlot, workshopSlot, trainSlot, letSlot, bonfireSlot, movieSlot, bayMarketSlot } from "./tours.js";
import { SEA } from "../data/npcs.js";
import { findPath, blocked } from "./paths.js";
import { tripSlot, townLine } from "./trips.js";
import { townOf, townRoom } from "../data/towns.js";

const NS = "http://www.w3.org/2000/svg";
const ents = {};            // id -> entity (villagers and the active messenger)
let api = null, storyT = null;             // see core: scene(), bounds(), mel, evan, F(), S(), save(), facts(), bubble(), openMail(), unreadMail(), evanSays(), gift()
let courier = null;         // the messenger currently on screen
let sayer = null, sayT = null;
const greeted = new Set();  // messengers say hello once, then just tag along quietly

export function initNpcs(a){ api = a; }
const weekend = () => [0, 6].includes(new Date(now() + 8*H).getUTCDay());
const dowNow = () => new Date(now() + 8*H).getUTCDay();
// Orchard tours and drop-in visits (tours.js) win over the usual routine while they're on
// A family paddle (Mel at the paddleboard rack): any of the family who are on the foreshore come out on boards too
const SUP_FAMILY = ["mum", "dad", "marcus", "angelina"];
function supSlot(def){
  const sup = api && api.sup && api.sup(); if (!sup || !SUP_FAMILY.includes(def.id)) return null;
  const base = routineNow(def); if (!base || base.scene !== "shore") return null;
  return {from: sup.from, to: sup.from + 999, scene: "shore", wander: SEA, act: "sup", free: true, glide: true};
}
// Where someone is on a given day at a given time (Singapore minutes): the special happenings first (a family paddle,
// dinner, the market, a tour, Mum's class, visits, tastings), then their own routine. slotNow is right now.
const dowOf = day => new Date(day + "T00:00:00Z").getUTCDay();
const routineAt = (def, day, t) => { const dw = dowOf(day), we = dw === 0 || dw === 6, owned = Object.assign({}, (api && api.F().fam && api.F().fam.owned) || {}, (api && api.F().goals) || {}, ...Object.keys((api && api.F().cocoa && api.F().cocoa.up) || {}).map(k => ({["cc_" + k]: 1})));   // things bought for the family, big goals, Cocoa Room upgrades (cc_<k>)
  return def.routine.find(s => t >= s.from && t < s.to && (!s.days || (s.days === "we") === we) && (!s.dow || s.dow.includes(dw)) && (!s.needs || owned[s.needs])) || null; };
const routineNow = def => routineAt(def, dayKey(), sgHM());
export function slotAt(def, day, t, live){
  return (api && tripSlot(api.F(), def.id, day, t, live ? api.scene() : null)) || (live && supSlot(def)) || dinnerSlot(def.id, day, t) || dateSlot(def.id, day, t) || (cellarBuilt() && clubSlot(def.id, day, t)) || movieSlot(def.id, day, t) || bonfireSlot(def.id, day, t) || bayMarketSlot(def.id, day, t) || workshopSlot(def.id, day, t) || trainSlot(def.id, day, t) || nightOk(eventSlot(def.id, day, t), def, day, t) || tourSlot(def.id, day, t) || classSlot(def.id, day, t) || familySlot(def.id, day, t)
    || visitSlot(def.id, day, t) || fieldSlot(def.id, day, t) || tastingSlot(def.id, day, t) || shoreSlot(def.id, day, t) || iceOk(scoopSlot(def.id, day, t), def, day, t) || letSlot(def.id, day, t) || routineAt(def, day, t);
}
// a night-market shopper slot gives way to the wine shop: anyone due at a tasting or in the shop then goes there instead
const nightOk = (s, def, day, t) => !s || !s.night ? s : tastingSlot(def.id, day, t) || (routineAt(def, day, t) || {}).scene === "wineshop" ? null : s;
// an ice cream at the Scoop Shack: only for someone who isn't busy (no routine then, or just out and about)
const iceOk = (s, def, day, t) => { if (!s) return null; const r = routineAt(def, day, t); return !r || ["village", "lane", "field", "shore", "bay", "orchard", "flowers", "base", "vineyard"].includes(r.scene) ? s : null; };
const cellarBuilt = () => !!(api && api.F().goals && api.F().goals.cellar);   // the wine club meets in the cellar door
const slotNow = def => slotAt(def, dayKey(), sgHM(), true);
export const whereIs = id => { const d = NPCS.find(n => n.id === id), s = d && slotNow(d); return s ? s.scene : null; };
export const npcPos = id => ents[id] ? {x: ents[id].x, y: ents[id].y} : null;
export function npcSay(id, text){ const e = ents[id]; if (!e) return false; e.dir = api.mel.x < e.x ? -1 : 1; say(e, text, 4500); api.sfx && api.sfx("babble", e.def.pitch || 1); return true; }
const PROPS = {water: "can", repair: "hammer", farm: "hoe", cone: "cone", fish: "rod", guitar: "guitar", sketch: "sketchbook", photo: "camera", notes: "notebook", doze: "newspaper",
  parasol: "parasol", wheel: "claycup", cranes: "crane", go: "goboard", skewer: "skewer", brush: "brush", fortune: "fortune",
  kite: "kite", pick: "tbasket", nets: "net", stack: "stone"};   // (and these: Jeju, round 129; "luck" is an arm and "tandem" a bike)   // (and these: Kyoto, round 122)   // (the last five: Ronda, round 107)
const outdoors = s => OUTDOOR.includes(s);
export const isHere = id => { const d = NPCS.find(n => n.id === id), s = d && slotNow(d); return !!(s && s.scene === api.scene()); };

function makeNode(id, look, kid, letter, act){
  const g = document.createElementNS(NS, "g");
  g.setAttribute("class", "ch npc" + (act ? " act-" + act : "")); g.dataset.npc = id; g.setAttribute("role", "button");
  if (act && PROPS[act]) look = Object.assign({}, look, {extra: PROPS[act]});
  if (act === "sup") look = Object.assign({}, look, {board: true, hat: null});
  if (act === "tandem") look = Object.assign({}, look, {bike: "#C8432F"});   // Jeju: Marcus and Angellina on the coast road
  const owned = (api.F().fam && api.F().fam.owned) || {};
  if (id === "darren" && act === "type" && owned.headphones) look = Object.assign({}, look, {headphones: true});
  // a rainy day outdoors: everyone has their own brolly or raincoat (a coat if their right hand's busy or they're on a board)
  if (OUTDOOR.includes(api.scene()) && !townOf(api.scene()) && rainyOn(dayKey()) && !look.board) look = Object.assign({}, look, {rain: rainGearFor(id, {coat: !!look.bike || !!look.extra && ["can", "hammer", "hoe", "lantern", "cone", "bell", "rod"].includes(look.extra)})});
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
// (the same one Mel uses). walk() steps along them and returns true on arrival at the last one.
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
    // on a day trip the family come in with Mel (from just behind her) and stroll over to their favourite spot
    else if (slot.follow && api.mel) { const b = api.bounds(); e.x = clamp(api.mel.x + rnd(-30, 30), b[0], b[2]); e.y = clamp(api.mel.y + rnd(6, 26), b[1], b[3]); route(e, p[0], p[1]); }
  }
  // Now and then a neighbour near Mel says hello (each at most every few minutes).
  const near = Math.hypot(e.x - api.mel.x, e.y - api.mel.y) < 110;
  // a story chapter ready to tell (stories.js): the little "…" over their head
  if (!e.cueAt || Date.now() - e.cueAt > 2000) { e.cueAt = Date.now(); e.story = !!(api.storyReady && api.storyReady(def.id)); e.node.classList.toggle("story", e.story); }
  if (near && !sayer && Date.now() - (e.helloAt || 0) > 4*60e3 && Math.random() < dt*.08) {
    e.helloAt = Date.now(); if (!e.act) e.dir = api.mel.x < e.x ? -1 : 1;
    const tl = slot.trip && townLine(api.F(), def.id, scene);
    say(e, e.story ? pick(["Mel! Got a minute?", "Oh, Mel, I wanted to tell you something.", "Have you got a moment?"]) : tl && Math.random() < .7 ? pick(tl) : pick(def.hellos || hellos()), tl ? 4200 : 2600); api.sfx && api.sfx("babble", def.pitch || 1);
  }
  const b = api.bounds();
  if (walk(e, def.kid ? 95 : slot.free ? 22 : e.bike ? 86 : 48, dt)) {   // on a bike (look.bike), nearly twice walking pace
    e.wait -= dt;
    if (e.wait <= 0 && slot.wander) {
      let p = jitter(pick(slot.wander));
      for (let k = 0; k < 6 && outdoors(scene) && blocked(scene, p[0], p[1]); k++) p = jitter(pick(slot.wander));   // never wander into a building
      if (def.id === "pip" && scene === "base" && Math.random() < .35) {   // Pip races Evan to the pond
        p = [330 + rnd(-10, 10), 520]; api.evan.tx = 350 + rnd(-14, 14); api.evan.ty = 516; api.evan.run = true;
        if (Math.random() < .6) { say(e, "Race you, Evan!"); setTimeout(() => api.evanSays("race!"), 600); }
      }
      if (slot.free) { e.tx = p[0]; e.ty = p[1]; e.path = []; }   // paddleboarders drift straight across the water
      else route(e, clamp(p[0], b[0], b[2]), clamp(p[1], b[1], b[3]));
      e.wait = rnd(3, 8);
    }
  }
  e.node.classList.toggle("run", def.kid && e.moving);
}

const hellos = () => { const t = sgHM(); return [t < 720 ? "Morning, Mel!" : t < 1080 ? "Afternoon, Mel!" : "Evening, Mel!", "Hi!", "Hello there!", "Hiya, Mel!"]; };
/* ---------- messengers ---------- */
function tickCourier(dt){
  const scene = api.scene(), mel = api.mel;
  if (courier && courier.scene !== scene) { drop(courier.id); courier = null; }
  if (scene === "home" || scene === "room" || scene === "kidroom" || scene === "office" || scene === "garage" || townOf(scene)) return;   // (and nobody posts letters to Ronda)   // only family inside the house (and nobody in Mel's room); notes wait until Mel steps out
  // the note she's carrying was replaced or read elsewhere (e.g. fresh mail arrived just after the page opened)
  if (courier && courier.state !== "leaving" && !api.unreadMail().some(m => m.id === courier.item.id)) { drop(courier.id); courier = null; }
  if (!courier) {
    // The morning paper (from the crier) waits in the letterbox at home; only if Mel heads into town without
    // reading it does Rosa come and find her there. Everyone else delivers wherever Mel is.
    const item = api.unreadMail().find(m => m.from !== "crier" || scene === "village"); if (!item) return;
    const ag = AGENTS[item.from] || AGENTS.postie;
    const start = outdoors(scene) ? (mel.x < 260 ? [540, 330] : [-20, 330]) : [260, 640];
    const id = "agent-" + item.id;
    courier = ents[id] = {id, kind: "agent", item, ag, scene, state: "coming", x: start[0], y: start[1], tx: mel.x, ty: mel.y, dir: 1, moving: true, wait: 0, node: makeNode(id, ag.look, false, true)};
  }
  const c = courier;
  if (c.state === "coming" || c.state === "waiting") {
    const side = mel.x > 260 ? -1 : 1;
    // stand beside Mel, on whichever side isn't inside something (the well, a stall)
    let [gx, gy] = [[side*44, 2], [-side*44, 2], [side*30, 26], [-side*30, 26], [0, 34]].map(([dx, dy]) => [mel.x + dx, mel.y + dy]).find(([x, y]) => !outdoors(scene) || !blocked(scene, x, y)) || [mel.x + side*44, mel.y + 2];
    if (scene === "shore") gx = Math.max(gx, 196);   // Mel's out paddling: wait at the water's edge
    if (!c.goal || Math.hypot(c.goal[0] - gx, c.goal[1] - gy) > 18) route(c, gx, gy);   // re-route only when Mel has moved
    const arrived = walk(c, 150, dt);
    if (arrived && c.state === "coming") {
      c.state = "waiting"; c.dir = -side;
      if (!greeted.has(c.item.id)) { greeted.add(c.item.id); say(c, `${c.item.from === "crier" && c.ag.helloTown ? c.ag.helloTown : c.ag.hello} Tap me for the note.`, 6000); }
    }
  } else if (c.state === "leaving") {
    if (walk(c, 140, dt)) { drop(c.id); courier = null; }
  }
  c.node.classList.toggle("run", c.moving && c.state !== "leaving");
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
  if (api.quiet && api.quiet()) return;   // quiet evening: neighbours only talk when tapped
  const el = $("npcSay"); sayer = e;
  const who = e.kind === "agent" ? e.ag.name.split(/[ ,]/)[0] : e.def.name;
  el.innerHTML = `<b class="who">${esc(who)}</b>${esc(plain(text))}`; el.hidden = false;
  clearTimeout(sayT); sayT = setTimeout(hideSay, ms);
}
function hideSay(){ $("npcSay").hidden = true; sayer = null; }

export function tapNpc(id){
  const e = ents[id]; if (!e) return;
  if (e.kind === "agent") { api.openMail(e.item); return; }
  const def = e.def, F = api.F(), S = api.S();
  F.met = F.met || {}; S.npcSaid = S.npcSaid || {};
  if (!e.act) e.dir = api.mel.x < e.x ? -1 : 1;
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
  { const tl = townLine(F, id, api.scene()); if (tl && Math.random() < .75) { say(e, pick(tl), 4500); return; } }   // on a day trip: the town's lines
  if (e.act && def.actLines && def.actLines[e.act] && Math.random() < .6) { say(e, pick(def.actLines[e.act])); return; }
  say(e, pick(def.lines));
}

/* ---------- per-frame ---------- */
export function tickNpcs(dt){
  NPCS.forEach(def => tickVillager(def, dt));
  tickCourier(dt);
  Object.values(ents).forEach(e => {
    e.node.setAttribute("transform", `translate(${e.x.toFixed(1)} ${e.y.toFixed(1)})`);
    e.node.firstElementChild.setAttribute("transform", `scale(${e.dir} 1)`);
    if (e.kind === "npc") e.node.classList.toggle("walk", e.moving);
  });
  const el = $("npcSay");
  // Next to Mel, Maple's bubble owns the space above, so a neighbour's bubble drops below their feet.
  if (sayer && !el.hidden) api.bubble(el, sayer.x, sayer.y, sayer.kind === "npc" && sayer.def.kid ? 44 : 70, Math.hypot(sayer.x - api.mel.x, sayer.y - api.mel.y) < 90);
}
export const npcActors = () => Object.values(ents).map(e => [e.node, e]);
export function resetScene(){ Object.keys(ents).forEach(drop); courier = null; }

// Someone's whole day as a list of stretches: {from, to, scene, act, dinner} (6am to 11pm, in quarter hours)
const schedCache = {};
export function daySchedule(id, day){
  const ck = id + "|" + day; if (schedCache[ck]) return schedCache[ck];
  const def = NPCS.find(n => n.id === id); if (!def) return [];
  const out = [];
  for (let t = 6*60; t < 23*60; t += 15) {
    const s = slotAt(def, day, t), key = s ? `${s.scene}|${s.act || ""}|${s.dinner ? 1 : ""}|${s.club ? 1 : ""}` : "";
    const last = out[out.length - 1];
    if (last && last.key === key) last.to = t + 15; else out.push({key, from: t, to: t + 15, scene: s && s.scene, act: s && s.act, dinner: !!(s && s.dinner), club: !!(s && s.club)});
  }
  return (schedCache[ck] = out.filter(x => x.scene));
}
