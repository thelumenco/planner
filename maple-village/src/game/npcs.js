// NPC engine: places villagers by their Singapore-time routine, walks them about, handles taps and daily reactions,
// and runs agent messengers who carry unread mail to Mel. Core owns the frame loop and calls tickNpcs / tapNpc.
import { NPCS, AGENTS } from "../data/npcs.js";
import { personArt, letterArt } from "../art/people.js";
import { sgHM, now, H, pick, rnd, clamp, $, plain } from "../util.js";

const NS = "http://www.w3.org/2000/svg";
const ents = {};            // id -> entity (villagers and the active messenger)
let api = null;             // see core: scene(), bounds(), mel, evan, F(), S(), save(), facts(), bubble(), openMail(), unreadMail(), evanSays(), gift()
let courier = null;         // the messenger currently on screen
let sayer = null, sayT = null;
const greeted = new Set();  // messengers say hello once, then just tag along quietly

export function initNpcs(a){ api = a; }
const weekend = () => [0, 6].includes(new Date(now() + 8*H).getUTCDay());
const slotNow = def => { const t = sgHM(), we = weekend();
  const owned = (api && api.F().fam && api.F().fam.owned) || {};
  return def.routine.find(s => t >= s.from && t < s.to && (!s.days || (s.days === "we") === we) && (!s.needs || owned[s.needs])) || null; };
export const whereIs = id => { const d = NPCS.find(n => n.id === id), s = d && slotNow(d); return s ? s.scene : null; };
export const npcPos = id => ents[id] ? {x: ents[id].x, y: ents[id].y} : null;
export function npcSay(id, text){ const e = ents[id]; if (!e) return false; e.dir = api.mel.x < e.x ? -1 : 1; say(e, text, 4500); api.sfx && api.sfx("babble", e.def.pitch || 1); return true; }
const PROPS = {water: "can", repair: "hammer", farm: "hoe"};
const outdoors = s => s === "village" || s === "base";
export const isHere = id => { const d = NPCS.find(n => n.id === id), s = d && slotNow(d); return !!(s && s.scene === api.scene()); };

function makeNode(id, look, kid, letter, act){
  const g = document.createElementNS(NS, "g");
  g.setAttribute("class", "ch npc" + (act ? " act-" + act : "")); g.dataset.npc = id; g.setAttribute("role", "button");
  if (act && PROPS[act]) look = Object.assign({}, look, {extra: PROPS[act]});
  const owned = (api.F().fam && api.F().fam.owned) || {};
  if (id === "darren" && act === "type" && owned.headphones) look = Object.assign({}, look, {headphones: true});
  g.innerHTML = personArt(look, kid) + (letter ? `<g class="letter">${letterArt}</g>` : "");
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

/* ---------- villagers ---------- */
function tickVillager(def, dt){
  const scene = api.scene(), slot = slotNow(def), key = slot ? `${slot.scene}:${slot.from}` : null;
  let e = ents[def.id];
  if (!slot || slot.scene !== scene) { if (e) drop(def.id); return; }
  if (!e || e.key !== key) {
    if (e) drop(def.id);
    const p = slot.at || jitter(pick(slot.wander));
    e = ents[def.id] = {def, key, act: slot.act, kind: "npc", x: p[0], y: p[1], tx: p[0], ty: p[1], dir: slot.dir || (Math.random() < .5 ? -1 : 1), moving: false, wait: rnd(1, 4), node: makeNode(def.id, def.look, def.kid, false, slot.act)};
  }
  // Now and then a neighbour near Mel says hello (each at most every few minutes).
  const near = Math.hypot(e.x - api.mel.x, e.y - api.mel.y) < 110;
  if (near && !sayer && Date.now() - (e.helloAt || 0) > 4*60e3 && Math.random() < dt*.08) {
    e.helloAt = Date.now(); if (!e.act) e.dir = api.mel.x < e.x ? -1 : 1;
    say(e, pick(hellos()), 2600); api.sfx && api.sfx("babble", def.pitch || 1);
  }
  const b = api.bounds();
  if (stepTo(e, def.kid ? 95 : 48, dt)) {
    e.wait -= dt;
    if (e.wait <= 0 && slot.wander) {
      let p = jitter(pick(slot.wander));
      if (def.id === "pip" && scene === "base" && Math.random() < .35) {   // Pip races Evan to the pond
        p = [340 + rnd(-10, 10), 572]; api.evan.tx = 360 + rnd(-14, 14); api.evan.ty = 578; api.evan.run = true;
        if (Math.random() < .6) { say(e, "Race you, Evan!"); setTimeout(() => api.evanSays("race!"), 600); }
      }
      e.tx = clamp(p[0], b[0], b[2]); e.ty = clamp(p[1], b[1], b[3]); e.wait = rnd(3, 8);
    }
  }
  e.node.classList.toggle("run", def.kid && e.moving);
}

const hellos = () => { const t = sgHM(); return [t < 720 ? "Morning, Mel!" : t < 1080 ? "Afternoon, Mel!" : "Evening, Mel!", "Hi!", "Hello there!", "Hiya, Mel!"]; };
/* ---------- messengers ---------- */
function tickCourier(dt){
  const scene = api.scene(), mel = api.mel;
  if (courier && courier.scene !== scene) { drop(courier.id); courier = null; }
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
    c.tx = mel.x + side*44; c.ty = mel.y + 2;
    const arrived = stepTo(c, 150, dt);
    if (arrived && c.state === "coming") {
      c.state = "waiting"; c.dir = -side;
      if (!greeted.has(c.item.id)) { greeted.add(c.item.id); say(c, `${c.item.from === "crier" && c.ag.helloTown ? c.ag.helloTown : c.ag.hello} Tap me for the note.`, 6000); }
    }
  } else if (c.state === "leaving") {
    if (stepTo(c, 140, dt)) { drop(c.id); courier = null; }
  }
  c.node.classList.toggle("run", c.moving && c.state !== "leaving");
  c.node.classList.toggle("walk", c.moving);
}
export function courierDelivered(itemId){
  if (!courier || courier.item.id !== itemId) return;
  courier.state = "leaving"; courier.node.querySelector(".letter")?.remove();
  say(courier, pick(["Off I go!", "Have a lovely day!", "Bye for now!"]), 2200);
  const scene = api.scene(); courier.tx = outdoors(scene) ? (courier.x < 260 ? -30 : 550) : 260; courier.ty = outdoors(scene) ? 330 : 650;
}

/* ---------- talking ---------- */
function say(e, text, ms = 3800){
  const el = $("npcSay"); sayer = e;
  el.textContent = plain(e.kind === "agent" ? text : `${e.def.name}: ${text}`); el.hidden = false;
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
  const facts = api.facts();
  const cond = Object.keys(def.react || {}).find(k => facts[k] && !S.npcSaid[id + ":" + k]);
  if (cond) { S.npcSaid[id + ":" + cond] = true; say(e, def.react[cond], 4500); api.save(); return; }
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
