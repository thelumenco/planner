// Game core: state + persistence, quest flow, actions, UI renderers and the world sim.
import { H, M, W, HH, now, dayKey, sgHM, prevDay, $, esc, pick, rnd, clamp, dur, plain } from "../util.js";
import { icon } from "../art/icons.js";
import { VILLAGE, WORK, ROOMS, stationsOf, spotObj, placeOf, spotOf } from "../data/world.js";
import { CROPS, ITEMS, PLOTS, QUEST_BOOST, LEVELS, PEP, YAY, itemIco } from "../data/items.js";
import { villageArt, roomArt, farmArt, setArtContext } from "../art/scenes.js";
import { AGENTS, NPCS } from "../data/npcs.js";
import { initNotebook, openTask, openMail, openDigest, closeNotebook, refreshNotebook, notebookOpen } from "../ui/notebook.js";
import { pullSunsama, SUNSAMA_ERRORS } from "./sunsama.js";
import { initNpcs, tickNpcs, tapNpc, npcActors, resetScene as resetNpcs, courierDelivered, isHere } from "./npcs.js";

/* =================== STATE =================== */
const freshToday = () => ({day:dayKey(), cleanDone:false, wipe:false, order:[], doneIds:[], extra:[], tweaks:{}, firstStep:{}, stalls:{}, arrived:{},
  mode:null, timer:null, berries:0, earned:0, steps:0, stepMs:0, water:0, crown:false, lunch:false, water2:false, last:null,
  halfway:{}, tread:{}, npcSaid:{}, harvested:0, digestMark:0, updatedAt:0});
const freshFox = () => ({name:"Maple", xp:0, days:0, streak:0, lastActive:null, coins:null, inv:null, plots:null, cool:{}, met:{}, gifts:{}, mailRead:{}, digest:{read:{}, lastAt:0, mine:[]}, updatedAt:0});
const load = (k, f) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ? Object.assign(f(), v) : f(); } catch { return f(); } };
let S = load("fox.today", freshToday), F = load("fox.fox", freshFox), P = load("fox.plan", () => ({day:null, tasks:[]}));
// Written by chat / agents, read-only here: mail = {items:[{id, from, title, body, link?, at}]}, stats = {chord:{users, per?}, chico:{...}}
let MAIL = load("fox.mail", () => ({items:[]})), ST = load("fox.stats", () => ({}));
// library = {items:[{id, title, author, body, sections?, try?, link?, added}]}: book digests waiting on Juniper's shelf
let LIB = load("fox.library", () => ({items:[]}));
let sampleCap = null;   // the sample capability once granted to this view, else null
function migrate(){
  if (S.day !== dayKey()) S = freshToday();
  if (!S.arrived) S.arrived = {};
  if (F.coins == null) F.coins = S.berries || 0;
  if (!F.inv) { F.inv = {tulip_seed:2, carrot_seed:1}; F.gift = true; }
  if (!Array.isArray(F.plots) || F.plots.length !== 12) F.plots = Array.from({length:12}, () => null);
  if (!F.cool) F.cool = {};
  ["met", "gifts", "mailRead"].forEach(k => { if (!F[k]) F[k] = {}; });
  F.digest = Object.assign({read:{}, lastAt:0, mine:[]}, F.digest || {});
  ["halfway", "tread", "npcSaid"].forEach(k => { if (!S[k]) S[k] = {}; });
}
migrate();
setArtContext({F:() => F, S:() => S, remaining:() => remaining(), questsIn:pl => questsIn(pl), growth:p => growth(p), stats:() => ST});
let say = null, refs = null, writing = {}, pending = {}, speechT = null, speechLock = 0;
let scene = "village", atSpot = null, boardOpen = false, shelfOpen = false, selPlot = null, shopTab = "seeds";
// In-game UI: the quest note pinned on the map (open, or slim while walking) and the panel over the map.
let qnOpen = true, qnKey = "", openView = null, shopClosed = false;

function persist(which){
  const obj = which === "today" ? S : F;
  obj.updatedAt = Date.now();
  try { localStorage.setItem("fox."+which, JSON.stringify(obj)); } catch {}
  if (!refs) return;
  clearTimeout(pending[which]); pending[which] = setTimeout(() => push(which), 500);
}
async function push(which){
  if (writing[which]) { pending[which] = setTimeout(() => push(which), 400); return; }
  writing[which] = true;
  try { await refs[which].set(JSON.parse(JSON.stringify(which === "today" ? S : F))); } catch(e) {}
  writing[which] = false;
}
const save = (redraw) => { persist("today"); persist("fox"); render(redraw); };

async function initDb(){
  if (!window.claude || !claude.use) return;
  setTimeout(() => { if (!refs) syncSunsama(); }, 12000);   // no db in this view: still pull Sunsama into the local plan
  claude.use("sample").then(sm => { sampleCap = sm || null; refreshNotebook(); }, () => {});
  const [db, user] = await Promise.all([claude.use("db"), claude.use("user")]);
  if (!db || !user) return;
  const uid = await user.id(); if (!uid) return;
  const col = db.collection("data/users/" + uid);
  refs = {today: col.doc("today"), fox: col.doc("fox"), plan: col.doc("plan"), mail: col.doc("mail"), stats: col.doc("stats"), library: col.doc("library")};
  refs.library.onSnapshot(snap => {
    LIB = snap.exists ? Object.assign({items:[]}, snap.data()) : {items:[]};
    try { localStorage.setItem("fox.library", JSON.stringify(LIB)); } catch {}
    if (shelfOpen) ctx();
  }, () => {});
  refs.mail.onSnapshot(snap => {
    MAIL = snap.exists ? Object.assign({items:[]}, snap.data()) : {items:[]};
    try { localStorage.setItem("fox.mail", JSON.stringify(MAIL)); } catch {}
    render();
  }, () => {});
  refs.stats.onSnapshot(snap => {
    const before = ST; ST = snap.exists ? snap.data() || {} : {};
    try { localStorage.setItem("fox.stats", JSON.stringify(ST)); } catch {}
    const grew = ["chord", "chico"].find(k => ST[k] && before[k] && ST[k].users > before[k].users);
    if (grew) speak(`${grew === "chord" ? "Chord" : "Chico"} grew to ${ST[grew].users.toLocaleString()} users! New flowers 🌼`, 5000);
    render(scene === "village");
  }, () => {});
  let firstPlan = true;
  refs.plan.onSnapshot(snap => {
    if (snap.exists) {
      const was = remaining().length;
      P = snap.data(); try { localStorage.setItem("fox.plan", JSON.stringify(P)); } catch {}
      markSunsamaDone(); render(true);
      if (!was && remaining().length) speak("New quests on the boards!", 5000);
    }
    if (firstPlan) { firstPlan = false; syncSunsama(); }
  }, () => { if (firstPlan) { firstPlan = false; syncSunsama(); } });
  const watch = (which) => refs[which].onSnapshot(snap => {
    const local = which === "today" ? S : F;
    if (!snap.exists) { persist(which); return; }
    const remote = JSON.parse(JSON.stringify(snap.data()));
    if (which === "today" && remote.day !== dayKey()) { if (local.day === dayKey()) persist(which); return; }
    if ((remote.updatedAt || 0) > (local.updatedAt || 0)) {
      if (which === "today") S = Object.assign(freshToday(), remote); else F = Object.assign(freshFox(), remote);
      migrate();
      try { localStorage.setItem("fox."+which, JSON.stringify(which === "today" ? S : F)); } catch {}
      render(true);
    } else if ((remote.updatedAt || 0) < (local.updatedAt || 0)) persist(which);
  }, () => {});
  watch("today"); watch("fox");
}

/* =================== QUESTS =================== */
function allTasks(){
  const base = (P && P.day === dayKey() && Array.isArray(P.tasks)) ? P.tasks : [];
  const list = [...base, ...S.extra].filter(t => t && t.id && t.title).map(t => Object.assign({}, t, S.tweaks[t.id] || {}));
  const ids = list.map(t => t.id);
  const order = S.order.filter(id => ids.includes(id));
  ids.forEach(id => { if (!order.includes(id)) order.push(id); });
  return order.map(id => list.find(t => t.id === id));
}
const remaining = () => allTasks().filter(t => !S.doneIds.includes(t.id));
const questsIn = pl => allTasks().filter(t => placeOf(t) === pl);
function phase(){
  if (!S.cleanDone) return "clean";
  if (S.mode === "decompress") return "decompress";
  if (S.mode === "break") return "break";
  if (remaining().length) return "task";
  return S.doneIds.length ? "recap" : "empty";
}
const arrivedFor = t => S.arrived[t.id] || (scene === placeOf(t) && atSpot === spotOf(t));
const atClean = () => S.wipe || (scene === "home" && atSpot === "cupboard");

/* =================== FARM =================== */
function growth(p){ if (!p || !p.crop || !p.wateredAt) return 0; return clamp((Date.now() - p.wateredAt + (p.bonus || 0)) / CROPS[p.crop].dur, 0, 1); }
const readyCount = () => F.plots.filter(p => p && p.crop && growth(p) >= 1).length;

/* =================== PROGRESS =================== */
const level = () => { let i = 0; LEVELS.forEach((l, j) => { if (F.xp >= l.xp) i = j; }); return i; };
function markActive(){
  const k = dayKey(); if (F.lastActive === k) return;
  F.streak = F.lastActive === prevDay(k) ? (F.streak || 0) + 1 : 1;
  F.days = (F.days || 0) + 1; F.xp += 5; F.lastActive = k;
}
let earnT;
function flash(msg){ const e = $("earn"); e.textContent = plain(msg); clearTimeout(earnT); earnT = setTimeout(() => e.textContent = "", 4000); }
function earn(n, why){ F.coins += n; S.earned += n; markActive(); flash(`+${n} coins: ${why}`); mprop("coin", mel.x, mel.y - 60, 1800); }
function gainXp(n){
  const before = level(); F.xp += n;
  if (level() > before) { const L = LEVELS[level()]; setTimeout(() => { act("cheer"); speak(`We're ${L.name}s now 💕${L.gift ? " I got " + L.gift + "!" : ""}`, 6000); }, 2600); }
}
const addInv = (id, n) => { F.inv[id] = (F.inv[id] || 0) + n; if (F.inv[id] <= 0) delete F.inv[id]; };

/* =================== SPEECH =================== */
function defaultLine(){
  const ph = phase();
  if (scene === "market") return "Shop's open! Have a browse.";
  if (scene === "farm") return readyCount() ? "Something's ready to harvest!" : "Tap a plot to plant or water.";
  if (ph === "clean") return atClean() ? (S.wipe ? "Five minutes. Hard stop, promise." : (sgHM() < 720 ? "Morning! Wet wipe first?" : "Hi! Wet wipe first?")) : "To the cleaning cupboard at home!";
  if (ph === "task") { const t = remaining()[0]; return arrivedFor(t) ? (S.firstStep[t.id] ? "You're doing it. I'm watching the clock." : "We're here. Just the first tiny step.") : `Next quest: the ${spotObj(placeOf(t), spotOf(t)).name.toLowerCase()} at ${VILLAGE[placeOf(t)].short}.`; }
  if (ph === "break") return "Zzz… break time. Wander, or rest.";
  if (ph === "decompress") return "Go tell chat “call done” 💬";
  if (ph === "recap") return "We did it! Garden? Shopping? Snacks?";
  return "No quests yet. Bring some from chat?";
}
function speak(text, ms){
  const el = $("speech");
  el.textContent = plain(text); el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop");
  clearTimeout(speechT); speechLock = ms ? Date.now() + ms : 0;
  if (ms) speechT = setTimeout(() => { speechLock = 0; el.textContent = plain(say ? say.line : defaultLine()); }, ms);
}
function setSay(line, buttons){ say = {line, buttons}; speak(line); }
let evanT;
function evanSays(t){ const e = $("evanSay"); e.textContent = t; e.hidden = false; clearTimeout(evanT); evanT = setTimeout(() => e.hidden = true, 2200); }

/* =================== PORTRAIT ANIMATION =================== */
const portrait = $("scene"), props = $("props");
let animT = null, mapleNap = 0;
function prop(txt, cls, x, y, life){
  const p = document.createElement("div"); p.className = "prop " + cls; p.innerHTML = icon(txt, cls === "p-fort" ? 96 : 30);
  if (x != null) { p.style.left = x + "%"; p.style.top = y + "%"; }
  props.appendChild(p); setTimeout(() => p.remove(), life || 3000);
}
function mprop(txt, x, y, life){
  const p = document.createElement("div"); p.className = "mprop"; p.innerHTML = icon(txt, 18); p.style.left = ((x - cam.x)*cam.s) + "px"; p.style.top = (y*cam.s) + "px";
  $("mprops").appendChild(p); setTimeout(() => p.remove(), life || 1900);
}
function hearts(n){ for (let i = 0; i < n; i++) setTimeout(() => { prop("heart", "p-heart", 58 + Math.random()*16, 48 + Math.random()*10, 1900); mprop("heart", maple.x + rnd(-8, 8), maple.y - 30, 1900); }, i*240); }
function pose(){ portrait.classList.toggle("sleeping", phase() === "break" || portrait.dataset.nap === "1"); }
function act(kind, item){
  clearTimeout(animT);
  [...portrait.classList].filter(c => c.startsWith("fox-")).forEach(c => portrait.classList.remove(c)); void portrait.offsetWidth;
  portrait.dataset.nap = "0";
  const cls = {eat:"fox-eat", brush:"fox-brush", bath:"fox-bath", ball:"fox-ball", yarn:"fox-yarn", hide:"fox-hide", cheer:"fox-cheer", nudge:"fox-nudge", crown:"fox-cheer", fort:"fox-cheer", flower:"fox-cheer"}[kind];
  if (cls) portrait.classList.add(cls);
  const mm = $("mmaple"); mm.classList.remove("hop"); void mm.getBBox();
  if (kind !== "nudge" && kind !== "nap") mm.classList.add("hop");
  if (item) mprop(item.ico, maple.x, maple.y - 34, 1900);
  let d = 3200;
  if (kind === "eat") { prop(item.ico, "p-food", null, null, 2300); setTimeout(() => hearts(3), 1800); }
  if (kind === "flower") { prop(item.ico, "p-food", null, null, 2300); setTimeout(() => hearts(4), 1600); }
  if (kind === "brush") { prop("brush", "p-brush", null, null, 2900); setTimeout(() => prop("sparkle", "p-heart", 72, 66, 1900), 900); setTimeout(() => prop("sparkle", "p-heart", 58, 72, 1900), 1600); }
  if (kind === "bath") { for (let i = 0; i < 9; i++) setTimeout(() => prop("bubbles", "p-bubble", 54 + Math.random()*24, 84, 2700), i*220); }
  if (kind === "ball") { prop("ball", "p-ball", null, null, 1800); setTimeout(() => hearts(2), 1500); }
  if (kind === "yarn") prop("yarn", "p-yarn", null, null, 3300);
  if (kind === "hide") { d = 4300; prop("eyes", "p-peek", 65, 84, 4300); setTimeout(() => hearts(3), 3900); }
  if (kind === "nap") { d = 7000; portrait.dataset.nap = "1"; mapleNap = Date.now() + 7000; [0, 800, 1600, 2400].forEach(t => setTimeout(() => prop("z", "p-z", 52, 56, 4800), t)); }
  if (kind === "crown") { S.crown = true; hearts(3); }
  if (kind === "fort") { d = 5000; prop("fort", "p-fort", 65, 70, 5000); setTimeout(() => hearts(4), 3000); }
  if (kind === "cheer") hearts(3);
  pose();
  animT = setTimeout(() => { [...portrait.classList].filter(c => c.startsWith("fox-")).forEach(c => portrait.classList.remove(c)); portrait.dataset.nap = "0"; mm.classList.remove("hop"); pose(); }, d);
}

/* =================== SOUND + TIMERS =================== */
let ac = null;
document.addEventListener("pointerdown", () => { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); } catch {} }, {once:true});
function chime(){
  try { if (!ac) return; [660, 880, 1320].forEach((f, i) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = "sine"; o.frequency.value = f;
    g.gain.setValueAtTime(0, ac.currentTime + i*.18); g.gain.linearRampToValueAtTime(.14, ac.currentTime + i*.18 + .02); g.gain.exponentialRampToValueAtTime(.0001, ac.currentTime + i*.18 + .9);
    o.connect(g).connect(ac.destination); o.start(ac.currentTime + i*.18); o.stop(ac.currentTime + i*.18 + 1); }); } catch {}
  try { navigator.vibrate && navigator.vibrate([120, 80, 120]); } catch {}
}
function startTimer(kind, mins, id){ S.timer = {kind, endAt: Date.now() + mins*M, total: mins*M, id: id || null, fired:false}; }
const fmt = left => left ? `${Math.floor(left/M)}:${String(Math.floor(left/1e3)%60).padStart(2,"0")}` : "time!";
function timerHTML(label){
  if (!S.timer) return "";
  const left = Math.max(0, S.timer.endAt - Date.now()), C = 2*Math.PI*28;
  return `<div class="timer"><svg class="ring" viewBox="0 0 66 66" aria-hidden="true"><circle class="bg" cx="33" cy="33" r="28"/><circle class="fg" id="ringFg" cx="33" cy="33" r="28" stroke-dasharray="${C}" stroke-dashoffset="${C*(1-left/S.timer.total)}"/></svg>
    <div><span class="t" id="tLeft">${fmt(left)}</span><small>${esc(label)}</small></div></div>`;
}
let lastReady = readyCount();
setInterval(() => {
  if (S.day !== dayKey()) { S = freshToday(); say = null; save(true); speak(defaultLine()); syncSunsama(); return; }
  const rc = readyCount();
  if (rc > lastReady) { speak(rc === 1 ? "Psst… something in the garden is ready!" : `${rc} crops ready in the garden!`, 5000); if (scene === "farm") drawScene(); }
  lastReady = rc;
  if (scene === "farm" && Math.random() < .2) { drawScene(); if (selPlot != null) ctx(); }
  if (shelfOpen && Math.floor(Date.now()/1000) % 20 === 0) ctx();   // keep "next digest in N min" fresh
  if (!S.timer) return;
  const left = Math.max(0, S.timer.endAt - Date.now());
  const t = $("tLeft"), r = $("ringFg");
  if (t) t.textContent = fmt(left);
  document.querySelectorAll("[data-tleft]").forEach(el => el.textContent = fmt(left));
  if (r) r.style.strokeDashoffset = 2*Math.PI*28*(1 - left/S.timer.total);
  if (!left && !S.timer.fired) { S.timer.fired = true; timerDone(S.timer.kind); }
}, 1000);
function timerDone(kind){
  chime(); act(kind === "break" ? "cheer" : "nudge");
  if (kind === "clean") setSay("Five minutes! Wipe down. That's your first tick.");
  if (kind === "task") setSay("Time box is up. Done? Or five more?", [["5 more minutes", () => { startTimer("task", 5, S.timer.id); setSay("Five more. You've got this."); }]]);
  if (kind === "deal") setSay("Five minutes done 🎉 Stop or keep rolling. Both count.");
  if (kind === "break") setSay("Break's up! Come back when you're ready.");
  if (kind === "clench") { S.timer = null; setSay("Release. Now three quick points in chat, then a hot drink."); }
  save();
}
/* =================== ACTIONS =================== */
function goQuest(t){
  if (phase() === "clean") { const c = spotObj("home", "cupboard"); go("home", c.tx, c.ty, () => arriveSpot("cupboard")); return; }
  const pl = placeOf(t), sp = spotObj(pl, spotOf(t)); go(pl, sp.tx, sp.ty, () => arriveSpot(sp.id));
}
const A = {
  walk(t){ goQuest(t); },
  pond(){ go("village", VILLAGE.pond.door[0], VILLAGE.pond.door[1], () => arriveVillageSpot("pond")); },
  gotWipe(){ S.wipe = true; startTimer("clean", 5); setSay("Nearest, most annoying spot. You pick!"); save(); },
  cleanDone(){ S.cleanDone = true; S.timer = null; earn(3, "five-minute clean"); gainXp(1); S.last = "clean"; act("cheer"); setSay("First tick of the day! Look at that ✨"); save(); },
  firstStep(t){ S.firstStep[t.id] = true; S.arrived[t.id] = true; startTimer("task", t.minutes || 25, t.id); setSay("Hard part's done. Now the rest, on the clock."); save(); },
  done(t){
    S.doneIds.push(t.id); S.timer = null; earn(5, "quest complete"); gainXp(1); S.last = t.title;
    let grew = 0; F.plots.forEach(p => { if (p && p.crop && p.wateredAt && growth(p) < 1) { p.bonus = (p.bonus || 0) + QUEST_BOOST; grew++; } });
    if (t.meeting) S.mode = "decompress";
    else if (remaining().length) { S.mode = "break"; startTimer("break", 10); }
    act("cheer"); if (evanHere()) evanSays(pick(["yaaay!", "Mama did it!", "hooray!"]));
    if (S.tread[t.id]) setSay(pick(YAY) + (grew ? " The garden grew a little 🌱" : "") + " Steps showing?", [["Log my steps", () => openSteps(true)]]);
    else setSay(pick(YAY) + (grew ? " The garden grew a little 🌱" : ""));
    save(true);
  },
  notebook(t){ openTask(t); },
  treadmill(t){
    S.tread[t.id] = true; S.arrived[t.id] = false;
    S.tweaks[t.id] = Object.assign({}, S.tweaks[t.id], {place:"home", spot:"treadmill"});
    closeNotebook(); setSay("Treadmill it is! 1.2 and go. I'll walk with you.");
    save(true); goQuest(allTasks().find(x => x.id === t.id));
  },
  proc(t){
    S.stalls[t.id] = (S.stalls[t.id] || 0) + 1; act("nudge");
    if (S.stalls[t.id] >= 2) {
      setSay("No shame. What's going on with this one?", [
        ["It's unclear", () => setSay("Tell chat “boss, this one's unclear”. We'll untangle it.")],
        ["It's too big", () => { S.tweaks[t.id] = {firstStep:"do just ten minutes of it. Messy is fine.", minutes:10}; S.firstStep[t.id] = false; S.stalls[t.id] = 0; S.timer = null; setSay("Shrunk it! Ten minutes, then you can stop."); }],
        ["I don't want to", () => { const ids = allTasks().map(x => x.id); S.order = ids.filter(id => id !== t.id).concat(t.id); S.stalls[t.id] = 0; S.firstStep[t.id] = false; S.timer = null; setSay("Fair. Moved it to the end. Here's another."); }]
      ]);
    } else {
      setSay("Totally normal. Smaller: just open it. Nothing else.", [
        ["5-minute deal", () => { startTimer("deal", 5, t.id); setSay("Five minutes, then you're allowed to stop."); }],
        ["Wet-wipe reset", () => { startTimer("deal", 5, t.id); setSay("Wipe something for five. Then back to me."); }],
        ["Check the basics", () => setSay("Water? Snack? Too hot? Tired? Fix that first.")]
      ]);
    }
    save();
  },
  back(){ S.mode = null; S.timer = null; earn(2, "proper break"); gainXp(1); setSay("Welcome back! Fresh quest coming up."); save(); },
  flow(){ S.mode = null; S.timer = null; setSay("In flow? Ride it! Break after this one."); save(); },
  clench(){ startTimer("clench", .5); setSay("Clench and hold. Breathe through your nose."); save(); },
  decompressed(){ S.mode = remaining().length ? "break" : null; if (S.mode) startTimer("break", 10); setSay("Decompressed. Now a proper break."); save(); },
  water(){ S.water += 1; if (S.water <= 4) earn(1, "water"); speak(pick(["Glug glug 💧", "Hydrated boss!", "Water break, good call."]), 3000); save(); }
};
function doNext(id){
  const ids = allTasks().map(x => x.id);
  if (S.timer && S.timer.kind !== "break") S.timer = null;
  S.order = [id, ...ids.filter(x => x !== id)]; say = null; openView = null; boardOpen = false; speak("New quest picked! Off we go.", 3000); save(true);
}
// Progress buttons on the notebook page.
const HALF = ["Halfway! The downhill bit starts now.", "Halfway there. Look at you go.", "Half done. Sip of water, then onwards."];
function nbAct(kind, t){
  if (kind === "started") { if (!S.firstStep[t.id]) A.firstStep(t); return; }
  if (kind === "halfway") { S.halfway[t.id] = true; act("cheer"); setSay(pick(HALF)); save(); return; }
  if (kind === "stuck") { A.proc(t); return; }
  if (kind === "more") {
    const tm = S.timer;
    if (tm && tm.id === t.id && !tm.fired && tm.endAt > Date.now()) { tm.endAt += 10*M; tm.total += 10*M; }
    else startTimer("task", 10, t.id);
    setSay("Ten more minutes on the clock. Take them, no guilt."); save(); return;
  }
  if (kind === "treadmill") { A.treadmill(t); return; }
  if (kind === "done") { A.done(t); return; }
}
function sayButton(i){ if (!say || !say.buttons || !say.buttons[i]) return; const fn = say.buttons[i][1]; say.buttons = null; fn(); save(); }
function timerLeft(t){
  if (!S.timer || S.timer.id !== t.id || (S.timer.kind !== "task" && S.timer.kind !== "deal")) return null;
  return fmt(Math.max(0, S.timer.endAt - Date.now()));
}

/* =================== SUNSAMA PULL =================== */
// On open (and when the day rolls over or the tab comes back on a new day) the page fetches today's Sunsama tasks.
// Chat's plan wins: a pull only writes the plan when today has none, or when today's came from an earlier pull.
// With chat's plan in place, "Check Sunsama" just adds tasks the plan doesn't have yet to the end of the line.
const sun = {busy: false, at: 0, error: null, added: 0};
function markSunsamaDone(){
  (P && P.day === dayKey() && Array.isArray(P.tasks) ? P.tasks : []).forEach(t => { if (t && t.completed && !S.doneIds.includes(t.id)) S.doneIds.push(t.id); });
}
async function syncSunsama(manual){
  if (sun.busy) return;
  const fromPull = !P || P.day !== dayKey() || P.source === "sunsama";
  if (!manual && !fromPull) return;
  sun.busy = true; sun.error = null; render();
  const day = dayKey(), r = await pullSunsama(day, {fresh: !!manual});
  sun.busy = false; sun.at = Date.now();
  if (r.error) { sun.error = r.error === "unavailable" && !manual ? null : r.error; render(); return; }
  if (fromPull || !P || P.day !== day || P.source === "sunsama") {
    if (!r.tasks.length && !(P && P.day === day && P.source === "sunsama")) { sun.added = 0; render(); return; }
    const was = remaining().length;
    P = {day, source: "sunsama", pulledAt: Date.now(), tasks: r.tasks};
    try { localStorage.setItem("fox.plan", JSON.stringify(P)); } catch {}
    if (refs) refs.plan.set(JSON.parse(JSON.stringify(P))).catch(() => {});
    markSunsamaDone(); save(true);
    if (!was && remaining().length) speak(`${remaining().length} quests from Sunsama on the boards!`, 5000);
  } else {
    const have = new Set(allTasks().map(t => t.id));
    const fresh = r.tasks.filter(t => !t.completed && !have.has(t.id));
    S.extra.push(...fresh); sun.added = fresh.length; save(true);
    speak(fresh.length ? `Added ${fresh.length} new Sunsama task${fresh.length === 1 ? "" : "s"} to the end of the line.` : "Sunsama and the boards match. All set!", 4000);
  }
}
function sunsamaLine(){
  const el = $("sunsamaLine"); if (!el) return;
  const src = P && P.day === dayKey() ? (P.source === "sunsama" ? "sunsama" : "chat") : null;
  let txt = sun.busy ? "Checking Sunsama…"
    : sun.error ? (SUNSAMA_ERRORS[sun.error] || "Couldn't reach Sunsama just now.")
    : src === "sunsama" ? `Today's quests came straight from Sunsama${P.pulledAt ? " at " + new Date(P.pulledAt).toLocaleTimeString("en-GB", {hour: "numeric", minute: "2-digit", timeZone: "Asia/Singapore"}) : ""}. Chat's boss-mode plan replaces them with first steps and pep talks.`
    : src === "chat" ? "Today's plan is from chat's boss mode."
    : "Your Sunsama tasks load here when you open the village.";
  el.innerHTML = `${esc(txt)} <button class="next" id="sunBtn" ${sun.busy ? "disabled" : ""}>${src === "chat" ? "check Sunsama for new tasks" : "refresh from Sunsama"}</button>`;
  $("sunBtn").onclick = () => syncSunsama(true);
}
document.addEventListener("visibilitychange", () => { if (!document.hidden && (!P || P.day !== dayKey())) syncSunsama(); });

/* =================== LIBRARY DIGESTS =================== */
// Rationed: one when an hour has passed since the last, or once a quest has been finished since the last. No stacking.
const DIGEST_GAP = 60*M;
let digestBusy = false;
const digestReady = () => Date.now() - (F.digest.lastAt || 0) >= DIGEST_GAP || S.doneIds.length > (S.digestMark || 0);
const nextDigest = () => (LIB.items || []).filter(d => d && d.id && d.title && !F.digest.read[d.id]).sort((a, b) => (a.added || 0) - (b.added || 0))[0] || null;
function pastDigests(){
  const all = [...(LIB.items || []), ...(F.digest.mine || [])].filter(d => d && d.id && F.digest.read[d.id]);
  return all.sort((a, b) => F.digest.read[b.id] - F.digest.read[a.id]).slice(0, 12);
}
function readDigest(d){
  F.digest.read[d.id] = Date.now(); F.digest.lastAt = Date.now(); S.digestMark = S.doneIds.length;
  const keep = new Set([...(LIB.items || []), ...(F.digest.mine || [])].map(x => x && x.id));
  Object.keys(F.digest.read).forEach(id => { if (!keep.has(id)) delete F.digest.read[id]; });
  gainXp(1); save(); openDigest(d);
}
async function askJuniper(){
  if (!sampleCap || digestBusy || !digestReady()) return;
  digestBusy = true; ctx();
  const seen = pastDigests().map(d => d.title).concat((LIB.items || []).map(d => d.title)).filter(Boolean).slice(0, 40);
  try {
    const d = await sampleCap.json(`You are Juniper, the librarian in a cosy village game. Pick ONE real, well-regarded nonfiction book that would help Mel: a Singapore-based founder running a small copywriting and brand studio plus two software products, and a parent of a toddler. Favour practical books on creative business, focus, pricing, writing, product, or calm productivity.
Don't pick any of these: ${seen.join("; ") || "(none yet)"}.
Return JSON only: {"title": "...", "author": "...", "body": "5 key ideas, one per line, each starting with '- ', each under 25 words", "try": "one small thing to try today, under 20 words"}.
Only describe ideas the book is genuinely known for; don't invent quotes.`, {modelTier: "quick", cache: false});
    if (!d || !d.title) throw {code: "empty_completion"};
    const item = {id: "j" + Date.now().toString(36), gen: true, title: String(d.title).slice(0, 120), author: String(d.author || "").slice(0, 80), body: String(d.body || "").slice(0, 1600), try: String(d.try || "").slice(0, 200)};
    F.digest.mine = [item, ...(F.digest.mine || [])].slice(0, 30);
    readDigest(item);
  } catch (e) {
    if (e && e.code === "not_granted") sampleCap = null;
    speak(e && e.code === "rate_limited" ? "Juniper needs a minute. Try again soon." : "Juniper couldn't find one just now. Try again later?", 4000);
  }
  digestBusy = false; ctx();
}

/* =================== MAIL (agent notes) =================== */
const unreadMail = () => (MAIL.items || []).filter(m => m && m.id && !F.mailRead[m.id] && (!m.at || Date.now() - m.at < 36*H)).sort((a, b) => (a.at || 0) - (b.at || 0));
function markRead(item){
  if (!F.mailRead[item.id]) {
    F.mailRead[item.id] = Date.now();
    const ids = Object.keys(F.mailRead).sort((a, b) => F.mailRead[b] - F.mailRead[a]);
    ids.slice(150).forEach(id => delete F.mailRead[id]);
    gainXp(1); save();
  }
  courierDelivered(item.id);
}
const agentName = from => (AGENTS[from] && AGENTS[from].name) || from || "the postie";
function mailCard(){
  const items = (MAIL.items || []).filter(m => m && m.id).sort((a, b) => (b.at || 0) - (a.at || 0)).slice(0, 20);
  const unread = items.filter(m => !F.mailRead[m.id]).length;
  $("mailBadge").hidden = !unread; $("mailBadge").textContent = unread;
  if (!items.length) { $("mailList").innerHTML = `<li><span></span><span class="muted">No letters yet.</span></li>`; return; }
  $("mailSum").textContent = unread ? `Letters · ${unread} new` : "Letters";
  $("mailList").innerHTML = items.map((m, i) => `<li class="${F.mailRead[m.id] ? "" : "unread"}"><span class="pl">${icon(F.mailRead[m.id] ? "letterOpen" : "letter", 22)}</span>
    <button class="open" data-mail="${i}"><span class="t">${esc(m.title || "A note")}</span><br><small>${esc(agentName(m.from))}${m.at ? " · " + new Date(m.at).toLocaleString("en-GB", {weekday:"short", hour:"numeric", minute:"2-digit", timeZone:"Asia/Singapore"}) : ""}</small></button><span></span></li>`).join("");
  $("mailList").querySelectorAll("[data-mail]").forEach(b => b.onclick = () => openMail(items[+b.dataset.mail]));
}

/* =================== NPC FACTS (for reactions) =================== */
function facts(){
  const hm = sgHM(), t = phase() === "task" ? remaining()[0] : null, sp = t ? spotOf(t) : null, pl = t ? placeOf(t) : null;
  return {quests3: S.doneIds.length >= 3, harvest: S.harvested > 0, ready: readyCount() > 0, lunch: hm >= 690 && hm <= 810, water: S.water >= 4,
    inbox: pl === "post" && sp === "counter", writing: pl === "fresh" && (sp === "desk" || sp === "typewriter"),
    building: sp === "bench" || (sp === "laptop" && pl !== "post"), planning: sp === "table" || (sp === "kitchen" && pl === "chico")};
}

function useItem(id){
  const it = ITEMS[id]; if (!it || !F.inv[id]) return;
  if (it.kind === "seed") { speak("Seeds go in the garden. Tap a plot there!", 3500); return; }
  if (it.kind === "tool") {
    act(it.act, it); speak(it.say, 4000);
    if (!F.cool[id] || Date.now() - F.cool[id] > 20*M) { F.cool[id] = Date.now(); gainXp(1); }
    save(); return;
  }
  addInv(id, -1); gainXp(it.xp || 1);
  act(it.kind === "food" ? "eat" : it.kind === "flower" ? "flower" : it.act, it); speak(it.say, 4500); save();
}
function playFree(kind){
  const lines = {pet:["*leans into the pat*", "Happy fox noises!", "More pats please."], hide:["You found me!"], nap:["Mmm… cosy…"]};
  if (kind === "pet") { hearts(2); speak(pick(lines.pet), 3000); return; }
  act(kind); speak(pick(lines[kind]), 4500);
  if (!F.cool[kind] || Date.now() - F.cool[kind] > 30*M) { F.cool[kind] = Date.now(); gainXp(1); save(); }
}
function buy(id){
  const it = ITEMS[id]; if (!it || F.coins < it.price || (it.need && S.earned < it.need)) return;
  if (it.kind === "tool" && F.inv[id]) return;
  F.coins -= it.price; addInv(id, 1); flash(`Bought ${it.n.toLowerCase()}`); speak(pick(["Ooh, good choice!", "Into the backpack it goes.", "Lovely pick!"]), 2500); save();
}
function sell(id){
  const it = ITEMS[id]; if (!it || !it.sell || !F.inv[id]) return;
  addInv(id, -1); F.coins += it.sell; flash(`Sold ${it.n.toLowerCase()} +${it.sell} coins`); speak("Fresh from the garden, sold!", 2500); save();
}
function plant(i, seedId){
  const it = ITEMS[seedId]; if (!it || !F.inv[seedId] || (F.plots[i] && F.plots[i].crop)) return;
  addInv(seedId, -1); F.gift = false; F.plots[i] = {crop:it.crop, plantedAt:Date.now(), wateredAt:null, bonus:0};
  speak(`${CROPS[it.crop].n} planted! Now give it some water.`, 3500); save(true);
}
function waterPlot(i){ const p = F.plots[i]; if (!p || !p.crop || p.wateredAt) return; p.wateredAt = Date.now(); mprop("drop", PLOTS[i].x + 50, PLOTS[i].y + 10); speak("Watered! Growing starts now. Finished quests speed it up.", 4000); save(true); }
function harvest(i){
  const p = F.plots[i]; if (!p || !p.crop || growth(p) < 1) return;
  addInv(p.crop, 1); F.plots[i] = null; gainXp(1); S.harvested = (S.harvested || 0) + 1; mprop(CROPS[p.crop].ico, PLOTS[i].x + 50, PLOTS[i].y + 20, 1900); act("cheer");
  speak(`Harvested a ${CROPS[p.crop].n.toLowerCase()}! It's in your backpack.`, 4000); save(true);
}

/* =================== UI =================== */
function notes(){
  const hm = sgHM(); let out = "";
  if (!S.lunch && hm >= 645 && hm <= 690 && S.cleanDone) out += `<p class="note">${icon("bowl", 20)} Start cooking or order lunch now, so it's on its way. <button data-dismiss="lunch">got it</button></p>`;
  if (!S.water2 && hm >= 780 && hm <= 870 && S.cleanDone) out += `<p class="note">${icon("drop", 20)} Top up your water bottle, or visit the well. <button data-water2>topped up</button></p>`;
  return out;
}
function journal(){
  const ph = phase(), j = $("journal");
  const tapes = {clean:"dots", task:"dots", break:"sky", decompress:"gingham", recap:"stripe", empty:"gingham"};
  let h = `<span class="tape ${tapes[ph]}" aria-hidden="true"></span>` + notes();
  if (ph === "clean") {
    h += `<h1><span class="lbl">daily quest · home · cleaning cupboard</span>Five-minute clean</h1>`;
    if (!atClean()) h += `<ul class="bujo"><li>Every day starts at the cleaning cupboard at home.</li></ul><div class="actions"><button class="btn primary" data-a="walk">Walk to the cupboard</button></div>`;
    else h += `${S.wipe ? timerHTML("hard stop at five") + `<ul class="bujo"><li>Wipe down whatever's nearest and most annoying.</li><li>Stop at five, even on a roll.</li></ul>`
        : `<ul class="bujo"><li class="first"><span><span class="hl">First step only:</span> go get a wet wipe. Grab your water on the way.</span></li>
           <li>Then five minutes on the clock. Hard stop.</li><li class="pep">A tiny win before anything else.</li></ul><p class="checkin">Tell me when you've got the wipe.</p>`}
      <div class="actions">${S.wipe ? `<button class="btn yes" data-a="cleanDone">Clean done</button>` : `<button class="btn primary" data-a="gotWipe">Got the wipe</button>`}</div>`;
  } else if (ph === "task") {
    const t = remaining()[0], fs = S.firstStep[t.id], pl = placeOf(t), sp = spotObj(pl, spotOf(t)), at = arrivedFor(t);
    h += `${S.last ? `<p class="ack">✓ ${esc(S.last === "clean" ? "clean done" : S.last)}</p>` : ""}
      <h1><span class="lbl">quest · ${esc(VILLAGE[pl].name)} · ${esc(sp.name)}</span>${esc(t.title)}</h1>
      ${(t.at || t.treadmill || t.chat || t.notes || t.email) ? `<p class="stickers">${t.at ? `<span class="sticker">${icon("clock", 14)} ${esc(t.at)}</span>` : ""}${t.treadmill ? `<span class="sticker">${icon("walker", 14)} ${S.tread[t.id] ? "on the treadmill" : "treadmill-able, 1.2 and go"}</span>` : ""}${t.notes ? `<span class="sticker">${icon("note", 14)} notes</span>` : ""}${t.email ? `<span class="sticker">${icon("letter", 14)} email</span>` : ""}${t.chat ? `<span class="sticker">${icon("chat", 14)} happens in chat</span>` : ""}</p>` : ""}
      ${(fs || (S.timer && S.timer.id === t.id)) ? timerHTML(S.timer && S.timer.kind === "deal" ? "five-minute deal, then you may stop" : `${t.minutes || 25}-minute time box`) : `<p class="stickers"><span class="sticker">${icon("clock", 14)} ${t.minutes || 25}-minute time box once you start</span></p>`}
      <ul class="bujo">${fs ? `<li>Keep going. One thing at a time.</li>` : `<li class="first"><span><span class="hl">First step only:</span> ${esc(t.firstStep || "open whatever you need for it. Just open it.")}</span></li><li>Then ${t.minutes || 25} minutes on the rest.</li>`}
        <li class="pep">${esc(t.pep || PEP[t.title.length % PEP.length])}</li></ul>
      ${at ? `<p class="checkin">${fs ? "Tap done when it's done." : "Tap when the first step's done."}</p>` : ""}
      <div class="actions">${!at ? `<button class="btn primary" data-a="walk">Walk to the ${esc(sp.name.toLowerCase())}</button>`
        : fs ? `<button class="btn yes" data-a="done">Quest done</button><button class="btn alt" data-a="notebook">Open the notebook</button>`
        : `<button class="btn primary" data-a="notebook">Do task</button><button class="btn alt" data-a="firstStep">First step done</button>`}
        <button class="btn alt" data-a="proc">I'm procrastinating</button></div>`;
  } else if (ph === "break") {
    const fresh = S.timer && S.timer.kind === "break" && (S.timer.total - (S.timer.endAt - Date.now())) < 60e3;
    h += `<h1><span class="lbl">side quest · rest</span>Ten-minute break</h1>${timerHTML("away from the desk")}
      <ul class="bujo"><li>Treadmill counts. Scrolling at your desk doesn't.</li><li>Check the garden, or sit by the pond.</li><li class="pep">Rest is part of the plan.</li></ul>
      <div class="actions"><button class="btn yes" data-a="back">I'm back</button>${!(scene === "village" && atSpot === "pond") ? `<button class="btn alt" data-a="pond">Sit by the pond</button>` : ""}${fresh ? `<button class="btn alt" data-a="flow">I'm in flow</button>` : ""}</div>`;
  } else if (ph === "decompress") {
    const clench = S.timer && S.timer.kind === "clench";
    h += `<h1><span class="lbl">right now</span>Decompress</h1>${clench ? timerHTML("clench and hold") : ""}
      <ul class="bujo"><li class="first"><span><span class="hl">Stomach clench, 30 seconds.</span> Hold, then release.</span></li><li>Tell chat <span class="hl">“call done”</span> and type three quick points. Chat files them.</li><li>Make a hot drink and bring it back.</li></ul>
      <div class="actions">${clench ? "" : `<button class="btn primary" data-a="clench">Start the 30 seconds</button>`}<button class="btn yes" data-a="decompressed">Done in chat</button></div>`;
  } else if (ph === "recap") {
    const done = allTasks().filter(t => S.doneIds.includes(t.id));
    h += `<h1><span class="lbl">that's a wrap</span>Work day's shut</h1>
      <ul class="bujo"><li>× five-minute clean</li>${done.map(t => `<li>× ${esc(t.title)}</li>`).join("")}
      <li>${S.steps.toLocaleString()} / 5,000 steps</li><li>${S.earned} coins earned today</li>
      <li class="pep">Garden, shop, spoil Maple. Then tell chat <span class="hl">“wind down”</span>.</li></ul>`;
  } else {
    h += `<h1><span class="lbl">ready when you are</span>The boards are empty</h1>
      <ul class="bujo">${sun.busy ? `<li>Fetching today's Sunsama tasks…</li>` : `<li>Start boss mode in chat, or open the village, and today's Sunsama tasks land on the boards.</li>`}<li>Or add one yourself under All quests.</li></ul>`;
  }
  if (say && say.buttons) h = h.replace(/<h1>/, `<div class="actions saybtns">${say.buttons.map((x, i) => `<button class="btn alt small" data-say="${i}">${esc(x[0])}</button>`).join("")}</div><h1>`);
  // The note re-opens whenever the quest step changes; it folds to one line while walking or when tapped away.
  const key = ph + ":" + (ph === "task" ? remaining()[0].id + (arrivedFor(remaining()[0]) ? ":here" : "") + (S.firstStep[remaining()[0].id] ? ":go" : "") : (S.wipe ? "w" : "") + (atClean() ? "c" : ""));
  if (key !== qnKey) { qnKey = key; qnOpen = true; }
  const slim = !qnOpen || (route.length > 0 && !(say && say.buttons));
  j.classList.toggle("slim", slim);
  j.innerHTML = h + `<button class="qnx" data-qn="min" aria-label="Fold the note away">–</button>`;
  if (slim) {
    const title = j.querySelector("h1") ? [...j.querySelector("h1").childNodes].filter(n => !(n.classList && n.classList.contains("lbl"))).map(n => n.textContent).join("").trim() : "";
    const when = S.timer ? `<span class="when" data-tleft>${fmt(Math.max(0, S.timer.endAt - Date.now()))}</span>` : "";
    j.innerHTML = `<button class="qnslim" data-qn="open" aria-label="Open the quest note">${icon("note", 20)} <b>${esc(route.length ? "Walking… " + title : title)}</b>${when}<span class="more">open</span></button>`;
  }
  j.querySelectorAll("[data-qn]").forEach(el => el.onclick = ev => { ev.stopPropagation(); qnOpen = el.dataset.qn === "open"; journal(); });
  j.querySelectorAll("[data-a]").forEach(el => el.onclick = () => { const t = remaining()[0]; A[el.dataset.a](t); });
  j.querySelectorAll("[data-say]").forEach(el => el.onclick = () => { const fn = say.buttons[+el.dataset.say][1]; say.buttons = null; fn(); save(); });
  j.querySelectorAll("[data-dismiss]").forEach(el => el.onclick = () => { S[el.dataset.dismiss] = true; save(); });
  j.querySelectorAll("[data-water2]").forEach(el => el.onclick = () => { S.water2 = true; A.water(); });
}
// One panel over the map. A HUD view (quests / backpack / letters) takes it when opened; otherwise whatever the
// current spot offers (shop, room quest board, garden plot, digest shelf).
function showPanel(hasCtx, skin){
  const views = {quests:"questsView", bag:"bagView", mail:"mailView", friend:"friendView"};
  const view = openView || (hasCtx ? "ctx" : null), p = $("panel");
  p.hidden = !view; $("map").classList.toggle("panel-open", !!view);
  ["ctx", "questsView", "bagView", "mailView", "friendView"].forEach(id => $(id).hidden = id !== (views[view] || view));
  p.className = "panel " + (view === "quests" ? "cork" : view === "ctx" ? skin : "paper");
  document.querySelectorAll("[data-open]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.open === openView)));
}
function closePanel(){
  if (openView) { openView = null; ctx(); return; }
  boardOpen = false; shelfOpen = false; selPlot = null; if (scene === "market") shopClosed = true; ctx();
}
function itemBtn(id, label, disabled, extra){
  const it = ITEMS[id];
  return `<button class="item" data-id="${id}" ${disabled ? "disabled" : ""}><span class="e">${icon(it.ico, 34)}</span><span class="n">${esc(it.n)}</span><span class="c">${label}</span>${extra || ""}</button>`;
}
function ctx(){
  const c = $("ctx"); let h = "";
  if (scene === "market" && !shopClosed) {
    const tabs = [["seeds","Seeds"],["treats","Treats"],["care","Care"],["sell","Sell"]];
    h = `<span class="tape gingham" aria-hidden="true"></span><h2>The market</h2><p class="sub">You have ${icon("coin", 16)} ${F.coins}. Seeds and treats go straight into your backpack.</p>
      <div class="tabs" role="tablist">${tabs.map(([k, n]) => `<button role="tab" data-shop="${k}" aria-selected="${shopTab === k}">${n}</button>`).join("")}</div><div class="items shop">`;
    if (shopTab === "sell") {
      const sellable = Object.keys(F.inv).filter(id => ITEMS[id] && ITEMS[id].sell);
      h += sellable.length ? sellable.map(id => itemBtn(id, `sell <b>+${ITEMS[id].sell}</b> ${icon("coin", 13)}`, false, `<span class="cnt">×${F.inv[id]}</span>`)).join("") : `<p class="muted" style="grid-column:1/-1">Nothing to sell yet. Grow something in the garden!</p>`;
    } else {
      h += Object.keys(ITEMS).filter(id => ITEMS[id].tab === shopTab).map(id => {
        const it = ITEMS[id], locked = it.need && S.earned < it.need, owned = it.kind === "tool" && F.inv[id];
        const extra = it.kind === "seed" ? ` · ${dur(CROPS[it.crop].dur)}` : "";
        return itemBtn(id, locked ? `earn ${it.need} today` : owned ? "owned" : `<b>${it.price}</b> ${icon("coin", 13)}${extra}`, locked || owned || F.coins < it.price, F.inv[id] && !owned ? `<span class="cnt">×${F.inv[id]}</span>` : "");
      }).join("");
    }
    h += `</div>`;
  } else if (scene === "farm" && selPlot != null) {
    const p = F.plots[selPlot], i = selPlot;
    h = `<span class="tape stripe" aria-hidden="true"></span><h2>Plot ${i + 1}</h2>`;
    if (!p || !p.crop) {
      const seeds = Object.keys(F.inv).filter(id => ITEMS[id] && ITEMS[id].kind === "seed");
      h += seeds.length ? `<p class="sub">Pick seeds to plant.</p><div class="items">${seeds.map(id => itemBtn(id, `${dur(CROPS[ITEMS[id].crop].dur)} to grow`, false, `<span class="cnt">×${F.inv[id]}</span>`)).join("")}</div>`
        : `<p class="sub">No seeds in your backpack. The market sells them.</p>`;
    } else {
      const g = growth(p), cr = CROPS[p.crop];
      if (!p.wateredAt) h += `<p class="sub">${icon(cr.ico, 18)} ${cr.n} seeds, waiting for water.</p><div class="actions"><button class="btn primary" data-farm="water">Water it</button></div>`;
      else if (g < 1) { const left = cr.dur*(1 - g); h += `<p class="sub">${icon(cr.ico, 18)} ${cr.n}, growing. About ${dur(left)} to go. Every finished quest takes 30 minutes off.</p><div class="plotbar"><i style="width:${(g*100).toFixed(0)}%"></i></div>`; }
      else h += `<p class="sub">${icon(cr.ico, 18)} ${cr.n} is ready!</p><div class="actions"><button class="btn yes" data-farm="harvest">Harvest</button></div>`;
    }
  } else if (shelfOpen) {
    const ready = digestReady(), next = nextDigest(), past = pastDigests();
    const wait = Math.max(1, Math.ceil(((F.digest.lastAt || 0) + DIGEST_GAP - Date.now())/M));
    h = `<span class="tape stripe" aria-hidden="true"></span><h2>Juniper's digest shelf</h2>
      <p class="sub">One book digest an hour, or one after each quest you finish.</p>
      <div class="shelf">`;
    if (ready && next) h += `<p class="status"><b>A digest is ready:</b> ${esc(next.title)}${next.author ? ` by ${esc(next.author)}` : ""}.</p><div class="actions"><button class="btn primary" data-dig="next">Read it</button></div>`;
    else if (ready && sampleCap) h += `<p class="status">The shelf's empty for now. Ask chat for more digests, or let Juniper pick a book.</p><div class="actions"><button class="btn primary" data-dig="ask" ${digestBusy ? "disabled" : ""}>${digestBusy ? "Juniper's choosing…" : "Ask Juniper to pick one"}</button></div>`;
    else if (ready) h += `<p class="status">The shelf's empty for now. Ask chat to stock it with your book digests.</p>`;
    else h += `<p class="status">Next digest in <b>${wait} min</b>, or finish a quest to unlock it sooner.${next ? ` Waiting on the shelf: ${(LIB.items || []).filter(d => d && d.id && !F.digest.read[d.id]).length}.` : ""}</p>`;
    if (past.length) h += `<p class="eyebrow" style="margin:22px 0 6px">Read before</p><ul class="qlist">${past.map((d, i) => `<li><span><b>${esc(d.title)}</b><small>${esc(d.author || "")}</small></span><button class="next" data-dig="past" data-i="${i}">reread</button></li>`).join("")}</ul>`;
    h += `</div><div class="actions"><button class="btn alt small" data-close="1">Close shelf</button></div>`;
  } else if (boardOpen) {
    const list = scene === "village" ? allTasks() : questsIn(scene), cur = phase() === "task" ? remaining()[0].id : null;
    h = `<span class="tape gingham" aria-hidden="true"></span><h2>${scene === "village" ? "Town quest board" : esc(ROOMS[scene].name) + " quests"}</h2>
      ${list.length ? `<ul class="qlist">${list.map(t => { const dn = S.doneIds.includes(t.id), sp = spotObj(placeOf(t), spotOf(t));
        return `<li class="${dn ? "done" : ""}${t.id === cur ? " cur" : ""}"${!dn && t.id !== cur && phase() !== "clean" ? ` data-next="${esc(t.id)}" role="button"` : ""}><span><b>${esc(t.title)}</b><small>${scene === "village" ? icon(placeOf(t), 16) + " " + esc(VILLAGE[placeOf(t)].name) + " · " : ""}${esc(sp.name)}</small></span>${!dn && t.id !== cur && phase() !== "clean" ? `<button class="next" data-next="${esc(t.id)}">do next</button>` : "<span></span>"}</li>`; }).join("")}</ul>`
        : `<p class="sub">No quests ${scene === "village" ? "today yet" : "in here today"}.</p>`}
      <div class="actions"><button class="btn alt small" data-close="1">Close board</button></div>`;
  }
  c.innerHTML = h;
  showPanel(!!h, scene === "market" ? "shop" : boardOpen ? "cork" : "paper");
  c.querySelectorAll("[data-shop]").forEach(b => b.onclick = () => { shopTab = b.dataset.shop; ctx(); });
  c.querySelectorAll(".item[data-id]").forEach(b => b.onclick = () => {
    const id = b.dataset.id;
    if (scene === "market") { shopTab === "sell" ? sell(id) : buy(id); }
    else if (scene === "farm") plant(selPlot, id);
  });
  c.querySelectorAll("[data-farm]").forEach(b => b.onclick = () => b.dataset.farm === "water" ? waterPlot(selPlot) : harvest(selPlot));
  c.querySelectorAll("[data-next]").forEach(b => b.onclick = ev => { ev.stopPropagation(); doNext(b.dataset.next); });
  c.querySelectorAll("[data-close]").forEach(b => b.onclick = () => { boardOpen = false; shelfOpen = false; ctx(); });
  c.querySelectorAll("[data-dig]").forEach(b => b.onclick = () => {
    const k = b.dataset.dig;
    if (k === "next") { const d = nextDigest(); if (d && digestReady()) readDigest(d); }
    else if (k === "ask") askJuniper();
    else if (k === "past") { const d = pastDigests()[+b.dataset.i]; if (d) openDigest(d); }
  });
}
function bag(){
  const ids = Object.keys(F.inv).filter(id => ITEMS[id] && F.inv[id] > 0);
  const order = ["food","flower","use","tool","seed"];
  ids.sort((a, b) => order.indexOf(ITEMS[a].kind) - order.indexOf(ITEMS[b].kind));
  $("bag").innerHTML = ids.map(id => { const it = ITEMS[id];
    const lbl = it.kind === "seed" ? "plant in garden" : it.kind === "tool" ? "use" : it.kind === "food" ? "feed" : it.kind === "flower" ? "give" : "use";
    return itemBtn(id, lbl, it.kind === "seed", it.kind === "tool" ? "" : `<span class="cnt">×${F.inv[id]}</span>`); }).join("");
  $("bag").querySelectorAll(".item").forEach(b => b.onclick = () => useItem(b.dataset.id));
  $("bagHint").textContent = !ids.length ? "Your backpack's empty. Visit the market, or harvest something." : F.gift ? "A welcome gift of seeds is in here. Plant them in the garden." : "";
  $("play").innerHTML = [["pet","Pet"],["hide","Hide-and-seek"],["nap","Nap together"]].map(([k, n]) => `<button class="btn alt small" data-play="${k}">${n}</button>`).join("");
  $("play").querySelectorAll("[data-play]").forEach(b => b.onclick = () => playFree(b.dataset.play));
}
function trackers(){
  const w = $("waterBoxes"); w.innerHTML = "";
  for (let i = 0; i < 8; i++) { const b = document.createElement("button"); b.className = "box" + (i < S.water ? " on" : ""); b.setAttribute("aria-label", `Water bottle ${i+1}`); b.onclick = () => { if (i >= S.water) A.water(); }; w.appendChild(b); }
  const s = $("stepBoxes"); s.innerHTML = "";
  for (let i = 0; i < 5; i++) { const b = document.createElement("button"); b.className = "box step" + (i < Math.floor(S.steps/1000) ? " on" : ""); b.setAttribute("aria-label", "Update steps"); b.onclick = openSteps; s.appendChild(b); }
  $("stepNote").textContent = S.steps ? S.steps.toLocaleString() : "log";
}
function openSteps(force){
  const f = $("stepForm"); f.classList.toggle("open", force === true ? true : !f.classList.contains("open"));
  measureHud();
  if (f.classList.contains("open")) $("stepIn").focus({preventScroll: true});
}
function questMark(){
  const ph = phase(), m = $("qmarkWrap");
  let target = null;
  if (ph === "clean" && !atClean()) target = {pl:"home", sp:"cupboard"};
  if (ph === "task") { const t = remaining()[0]; if (!arrivedFor(t)) target = {pl:placeOf(t), sp:spotOf(t)}; }
  let pos = null;
  if (target) {
    if (scene === "village") pos = VILLAGE[target.pl].mark;
    else if (scene === target.pl) { const s = spotObj(scene, target.sp); pos = [s.x, s.y - 70]; }
    else if (scene !== "village") pos = [260, 582];
  }
  if (!pos) { m.style.display = "none"; return; }
  m.style.display = ""; m.setAttribute("transform", `translate(${pos[0]} ${pos[1]})`);
}
function drawScene(){
  $("sceneArt").innerHTML = scene === "village" ? villageArt() : scene === "farm" ? farmArt() : roomArt(scene);
  const names = {village:"The village", farm:"The garden"};
  $("sceneName").innerHTML = `<span>${esc(names[scene] || ROOMS[scene].name)}</span>${scene !== "village" ? `<span style="font-family:Mulish,sans-serif;font-size:.85rem">tap Exit to leave</span>` : ""}`;
  $("maphint").textContent = scene === "village" ? "Tap anywhere to walk. Tap a building to go inside." : scene === "farm" ? "Tap a plot to plant, water or harvest." : scene === "market" ? "Tap the counter to open the shop." : "Tap furniture to walk to it. The board on the wall lists this building's quests.";
}
function render(redraw){
  if (S.day !== dayKey()) S = freshToday();
  if (redraw) drawScene();
  const L = level(), next = LEVELS[L+1];
  $("title").firstChild.textContent = `${F.name}'s village`;
  $("trayName").textContent = F.name; $("friendName").textContent = F.name;
  const d = new Date(now() + 6*H);
  $("dateLine").textContent = d.toLocaleDateString("en-GB", {weekday:"long", day:"numeric", month:"long", timeZone:"UTC"}) + (F.streak >= 2 && F.lastActive === dayKey() ? ` · ${F.streak} cosy days in a row` : "");
  $("coins").textContent = F.coins;
  document.title = `${F.name}'s village`;
  $("scarf").style.display = L >= 1 ? "" : "none";
  $("plant").style.display = L >= 2 ? "" : "none";
  $("lights").style.display = L >= 3 ? "" : "none";
  $("bunting").style.display = L >= 4 ? "" : "none";
  $("crown").style.display = S.crown ? "" : "none";
  pose();
  if (!speechLock) $("speech").textContent = plain(say ? say.line : defaultLine());
  const span = next ? next.xp - LEVELS[L].xp : 1, into = next ? F.xp - LEVELS[L].xp : 1, filled = Math.round(Math.min(1, into/span)*5);
  $("friendBody").innerHTML = `<p class="hearts" aria-label="${filled} of 5 hearts to next level">${Array.from({length: 5}, (_, i) => icon("heart", 22, i < filled ? "" : "faint")).join("")}</p>
    <p class="muted">${esc(F.name)} is your ${LEVELS[L].name}. ${next ? `Next up: ${next.name}${next.gift ? `, which brings ${next.gift}` : ""}.` : "Friendship maxed!"} ${F.days || 0} day${F.days === 1 ? "" : "s"} together. It grows when you show up, feed, play and garden, and never goes down.</p>`;
  const all = allTasks(), rem = remaining(), cur = (phase() === "task" && rem[0]) ? rem[0].id : null;
  $("logSum").textContent = all.length ? `All quests · ${rem.length} left` : "All quests";
  $("qBadge").hidden = !rem.length; $("qBadge").textContent = rem.length;
  $("list").innerHTML = all.map(t => { const dn = S.doneIds.includes(t.id);
    const pickable = !dn && t.id !== cur && phase() !== "clean";
    return `<li class="${dn ? "done" : ""}${t.id === cur ? " cur" : ""}${pickable ? " pick" : ""}"${pickable ? ` data-pick="${esc(t.id)}" role="button" tabindex="0"` : ""}><span class="pl">${icon(placeOf(t), 20)}</span><span class="t">${dn ? "× " : ""}${esc(t.title)}</span><small>${esc(VILLAGE[placeOf(t)].name)} · ${esc(spotObj(placeOf(t), spotOf(t)).name)}${t.id === cur ? " · doing now" : ""}</small>${pickable ? `<button class="next" data-next="${esc(t.id)}">do this now</button>` : String(t.id).startsWith("x") && !dn ? `<button data-rm="${esc(t.id)}" aria-label="Remove">✕</button>` : "<span></span>"}</li>`; }).join("");
  $("list").querySelectorAll("[data-rm]").forEach(el => el.onclick = () => { S.extra = S.extra.filter(x => x.id !== el.dataset.rm); save(true); });
  $("list").querySelectorAll("[data-next]").forEach(el => el.onclick = ev => { ev.stopPropagation(); doNext(el.dataset.next); });
  $("list").querySelectorAll("[data-pick]").forEach(el => el.onclick = () => doNext(el.dataset.pick));
  questMark(); journal(); ctx(); bag(); trackers(); mailCard(); sunsamaLine(); refreshNotebook();
}
/* =================== WORLD SIM =================== */
const mel = {x:VILLAGE.home.door[0], y:VILLAGE.home.door[1], tx:VILLAGE.home.door[0], ty:VILLAGE.home.door[1], dir:1, moving:false};
const maple = {x:mel.x - 24, y:mel.y + 2, tx:mel.x - 24, ty:mel.y + 2, dir:1, moving:false};
const evan = {x:250, y:360, tx:250, ty:360, dir:1, moving:false, run:false, wait:2};
let route = [], keys = new Set();
const svg = $("world");
const evanHere = () => scene === "village" || scene === "home";
const bounds = () => scene === "village" ? [14, 150, W - 14, HH - 14] : [34, 168, W - 34, 612];

function setScene(id, at){
  const w = $("world"); w.classList.add("fading");
  setTimeout(() => {
    scene = id; cam.snap = true; atSpot = null; boardOpen = false; shelfOpen = false; selPlot = null; openView = null; shopClosed = false; resetNpcs();
    const p = at || [260, 596];
    mel.x = mel.tx = p[0]; mel.y = mel.ty = p[1]; maple.x = maple.tx = p[0] - 22; maple.y = maple.ty = p[1] + 2;
    if (id === "village") { evan.x = evan.tx = 250; evan.y = evan.ty = 380; }
    else if (id === "home") { evan.x = evan.tx = 300; evan.y = evan.ty = 520; }
    $("evan").style.display = evanHere() ? "" : "none";
    render(true); w.classList.remove("fading");
    if (route.length) nextLeg();
    if (id === "market") speak(isHere("hana") ? "Welcome to the market! Hana's in. Have a browse." : NPCS.find(n => n.id === "hana").away, 4500);
  }, 220);
}
// route: legs of {scene, x, y, fn}
function go(target, x, y, fn){
  const legs = [];
  let cur = scene;
  if (cur !== target) {
    if (cur !== "village") legs.push({scene:cur, x:260, y:606, fn:() => setScene("village", VILLAGE[curDoorKey(cur)].door)});
    if (target !== "village") { const d = VILLAGE[target].door; legs.push({scene:"village", x:d[0], y:d[1], fn:() => setScene(target, target === "farm" ? [260, 590] : [260, 596])}); }
  }
  legs.push({scene:target, x, y, fn});
  route = legs; atSpot = null; boardOpen = false; shelfOpen = false; openView = null; nextLeg(); render();
}
function curDoorKey(s){ return s; }
function nextLeg(){
  const l = route[0]; if (!l || l.scene !== scene) return;
  const b = bounds(); mel.tx = clamp(l.x, b[0], b[2]); mel.ty = clamp(l.y, b[1], b[3]); mel.force = true;
}
function arriveSpot(id){
  atSpot = id;
  const ph = phase();
  if (id === "digest") { shelfOpen = true; speak(digestReady() ? (isHere("juniper") ? "Juniper's waving a digest at you!" : "A fresh digest is ready on the shelf.") : "Digests are rationed. Like dessert.", 3500); render(); return; }
  if (id === "stall") { shopClosed = false; render(); return; }
  if (id === "board" && scene === "village") { openView = "quests"; speak("All of today's quests!", 3500); render(); return; }
  if (id === "board") { boardOpen = true; speak(scene === "village" ? "All of today's quests!" : "Here's what needs doing in here.", 3500); render(); return; }
  if (ph === "clean" && scene === "home" && id === "cupboard") { setSay(S.wipe ? "Five minutes. Hard stop, promise." : "Wet wipes live here. Grab one!"); render(); return; }
  if (ph === "task") {
    const t = remaining()[0];
    if (placeOf(t) === scene && spotOf(t) === id && !S.arrived[t.id]) { S.arrived[t.id] = true; setSay(`Here at the ${spotObj(scene, id).name.toLowerCase()}. First tiny step…`); save(); return; }
  }
  const s = spotObj(scene, id); if (s) speak(s.line, 3500); render();
}
function arriveVillageSpot(id){
  atSpot = id;
  if (id === "well") { A.water(); return; }
  if (id === "board") { arriveSpot("board"); return; }
  if (id === "pond") { speak(phase() === "break" ? "Perfect break spot. Breathe." : VILLAGE.pond.line, 4000); render(); }
}
function toWorld(ev){ const pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY; const p = pt.matrixTransform(svg.getScreenCTM().inverse()); return [p.x, p.y]; }
svg.addEventListener("click", ev => {
  const npc = ev.target.closest("[data-npc]");
  if (npc) { tapNpc(npc.dataset.npc); return; }
  const ug = ev.target.closest("[data-ugarden]");
  if (ug) { const k = ug.dataset.ugarden, st = ST[k] || {}; speak(`${(st.users || 0).toLocaleString()} ${k === "chord" ? "creatives use Chord" : "families use Chico"}! One flower for every ${st.per > 0 ? st.per : 10}.`, 4500); return; }
  const ent = ev.target.closest("[data-ent]");
  if (ent && ent.dataset.ent === "evan") { evanSays(pick(["Mama!", "hug!", "hehe!", "up up!"])); mprop("heart", evan.x, evan.y - 40); evan.tx = mel.x + 16; evan.ty = mel.y + 4; evan.run = true; return; }
  if (ent && ent.dataset.ent === "maple") { hearts(2); speak(pick(["*leans into the pat*", "Happy fox noises!", "More pats please."]), 3000); return; }
  const pl = ev.target.closest("[data-place]");
  if (pl && scene === "village") {
    const id = pl.dataset.place, v = VILLAGE[id];
    if (v.spot) go("village", v.door[0], v.door[1], () => arriveVillageSpot(id));
    else go(id, 260, id === "farm" ? 560 : 560, null);
    return;
  }
  const sp = ev.target.closest("[data-spot]");
  if (sp) { const s = spotObj(scene, sp.dataset.spot); go(scene, s.tx, s.ty, () => arriveSpot(s.id)); return; }
  if (ev.target.closest("[data-exit]")) { go("village", VILLAGE[scene].door[0], VILLAGE[scene].door[1] + 10, null); return; }
  const pt = ev.target.closest("[data-plot]");
  if (pt) { const i = +pt.dataset.plot, p = PLOTS[i]; go("farm", p.x + p.w/2, p.y + p.h + 18, () => { selPlot = i; atSpot = "plot"; ctx(); const s = F.plots[i]; speak(!s || !s.crop ? "Empty plot. What shall we grow?" : !s.wateredAt ? "Thirsty seeds!" : growth(s) >= 1 ? "Ready to pick!" : "Growing nicely.", 3000); }); return; }
  const [x, y] = toWorld(ev); route = []; atSpot = null;
  if (qnOpen && phase() !== "clean") { qnOpen = false; journal(); }   // tapping the map to wander folds the note away
  const b = bounds(); mel.tx = clamp(x, b[0], b[2]); mel.ty = clamp(y, b[1], b[3]);
});
window.addEventListener("keydown", e => {
  if (e.target.closest("input") || notebookOpen()) return;
  const k = {ArrowUp:"u", ArrowDown:"d", ArrowLeft:"l", ArrowRight:"r", w:"u", s:"d", a:"l", d:"r"}[e.key];
  if (k) { keys.add(k); route = []; atSpot = null; if (e.key.startsWith("Arrow")) e.preventDefault(); }
});
window.addEventListener("keyup", e => { const k = {ArrowUp:"u", ArrowDown:"d", ArrowLeft:"l", ArrowRight:"r", w:"u", s:"d", a:"l", d:"r"}[e.key]; if (k) keys.delete(k); });
function stepTo(e, speed, dt){
  const dx = e.tx - e.x, dy = e.ty - e.y, d = Math.hypot(dx, dy);
  if (d < 1.2) { e.x = e.tx; e.y = e.ty; e.moving = false; return true; }
  const s = Math.min(d, speed*dt); e.x += dx/d*s; e.y += dy/d*s; e.moving = true;
  if (Math.abs(dx) > 0.6) e.dir = dx < 0 ? -1 : 1;
  return false;
}
function nearSpot(){
  if (scene === "village") return Object.keys(VILLAGE).find(k => Math.hypot(VILLAGE[k].door[0] - mel.x, VILLAGE[k].door[1] - mel.y) < 22) || null;
  if (scene === "farm") return null;
  const list = [...stationsOf(scene), scene !== "market" ? {id:"board", tx:260, ty:200} : null].filter(Boolean);
  const s = list.find(s => Math.hypot(s.tx - mel.x, s.ty - mel.y) < 26); return s ? s.id : null;
}
const EVAN_SPOTS = {village:[[260,360],[210,330],[320,330],[170,380],[360,380],[300,600],[380,630],[190,470],[120,540],[300,470]], home:[[150,500],[330,520],[260,340],[200,600],[360,330]]};
function tickEvan(dt){
  if (!evanHere()) return;
  if (stepTo(evan, evan.run ? 130 : 70, dt)) {
    evan.wait -= dt;
    if (evan.wait <= 0) {
      const r = Math.random(), b = bounds();
      if (scene === "village" && phase() === "break" && r < .5) { evan.tx = 360 + rnd(-20, 30); evan.ty = 620 + rnd(-6, 8); evan.run = false; }
      else if (r < .3) { evan.tx = clamp(mel.x + rnd(-24, 24), b[0], b[2]); evan.ty = clamp(mel.y + rnd(4, 16), b[1], b[3]); evan.run = true; evan.target = "mel"; }
      else if (r < .5) { evan.tx = clamp(maple.x + rnd(-18, 18), b[0], b[2]); evan.ty = clamp(maple.y + rnd(2, 12), b[1], b[3]); evan.run = true; evan.target = "maple"; }
      else { const s = pick(EVAN_SPOTS[scene]); evan.tx = s[0] + rnd(-14, 14); evan.ty = s[1] + rnd(-8, 8); evan.run = Math.random() < .35; evan.target = null; }
      evan.wait = rnd(2.5, 6);
    } else if (evan.target && evan.wait > 1.9 && evan.wait < 2.0 + dt) {
      if (Math.random() < .5) evanSays(evan.target === "maple" ? pick(["doggy!", "fox fox!", "hi Maple!"]) : pick(["Mama!", "hehe!", "look!"]));
      evan.target = null;
    }
  }
}
const nodes = {mel: $("mel"), evan: $("evan"), maple: $("mmaple")};
function placeNode(n, e){
  n.setAttribute("transform", `translate(${e.x.toFixed(1)} ${e.y.toFixed(1)})`);
  n.firstElementChild.setAttribute("transform", `scale(${e.dir} 1)`);
  n.classList.toggle("walk", e.moving);
}
// Camera: when the map box is narrower than the 520x640 scene (phone, full screen), show the full height and pan
// left/right to follow Mel. Overlays (bubbles, floating icons) convert scene coords with cam.
const cam = {x: 0, w: W, s: 1, top: 0, snap: true, key: ""};
function updateCam(dt){
  const m = $("map"), cw = m.clientWidth, ch = m.clientHeight; if (!cw || !ch) return;
  const a = cw/ch, vw = a < W/HH - .005 ? HH*a : W;
  const tx = clamp(mel.x - vw/2, 0, W - vw);
  cam.x = cam.snap ? tx : cam.x + (tx - cam.x)*Math.min(1, dt*3.2); cam.snap = false;
  cam.w = vw; cam.s = vw < W ? ch/HH : cw/W;
  const key = cam.x.toFixed(1) + "," + vw.toFixed(1);
  if (key !== cam.key) { cam.key = key; svg.setAttribute("viewBox", `${cam.x.toFixed(1)} 0 ${vw.toFixed(1)} ${HH}`); }
}
function measureHud(){
  const hb = document.querySelector(".hudbar"), m = $("map");
  cam.top = getComputedStyle(hb).position === "fixed" ? Math.max(0, hb.getBoundingClientRect().bottom - m.getBoundingClientRect().top + 4) : 0;
  m.style.setProperty("--ovTop", (cam.top ? cam.top + 4 : 8) + "px");
}
addEventListener("resize", () => { cam.snap = true; measureHud(); });
function bubbleAt(el, ex, ey, off, forceBelow){
  if (el.hidden) return;
  const wrap = $("map"), cw = wrap.clientWidth, sc = cam.s;
  const bw = el.offsetWidth, bh = el.offsetHeight, px = (ex - cam.x)*sc, py = (ey - off)*sc;
  const left = clamp(px, bw/2 + 2, cw - bw/2 - 2);
  el.style.left = left + "px"; el.style.setProperty("--tail", clamp(px - left + bw/2, 16, bw - 16) + "px");
  const roomBelow = (ey + 8)*sc + 10 + bh < wrap.clientHeight + 4;
  const below = (forceBelow && roomBelow) || py - bh - 10 < cam.top - 6; el.classList.toggle("below", below);
  el.style.top = (below ? (ey + 8)*sc + 10 : py - 10) + "px";
}
let last = performance.now();
function frame(now){
  const dt = Math.min(.05, (now - last)/1000); last = now;
  if (keys.size) {
    const v = 190*dt, b = bounds(); let dx = 0, dy = 0;
    if (keys.has("l")) dx -= v; if (keys.has("r")) dx += v; if (keys.has("u")) dy -= v; if (keys.has("d")) dy += v;
    mel.tx = clamp(mel.x + dx, b[0], b[2]); mel.ty = clamp(mel.y + dy, b[1], b[3]);
  }
  const arrived = stepTo(mel, keys.size ? 190 : 220, dt);
  if (arrived && !keys.size && (mel.wasMoving || mel.force)) {
    mel.force = false;
    if (route.length && route[0].scene === scene) { const l = route.shift(); if (l.fn) l.fn(); else { atSpot = null; render(); } if (route.length && route[0].scene === scene) nextLeg(); }
    else if (!route.length) {
      const n = nearSpot();
      if (n) { if (scene === "village") { const v = VILLAGE[n]; if (v.spot) arriveVillageSpot(n); else go(n, 260, 560, null); } else arriveSpot(n); }
      else if (scene !== "village" && scene !== "farm" && mel.y > 592) go("village", VILLAGE[scene].door[0], VILLAGE[scene].door[1] + 10, null);
      else if (scene === "farm" && mel.y > 592 && Math.abs(mel.x - 260) < 50) go("village", VILLAGE.farm.door[0], VILLAGE.farm.door[1] + 10, null);
    }
  }
  mel.wasMoving = mel.moving;
  const sleeping = phase() === "break" || Date.now() < mapleNap;
  nodes.maple.classList.toggle("sleep", sleeping);
  if (!sleeping) { maple.tx = mel.x - mel.dir*24; maple.ty = mel.y + 3; const d = Math.hypot(maple.tx - maple.x, maple.ty - maple.y); stepTo(maple, Math.max(120, d*3.2), dt); if (!maple.moving) maple.dir = mel.dir; }
  else maple.moving = false;
  tickEvan(dt);
  tickNpcs(dt); updateCam(dt);
  placeNode(nodes.mel, mel); placeNode(nodes.maple, maple); placeNode(nodes.evan, evan);
  // On the treadmill with the time box running: Mel walks in place.
  if (scene === "home" && atSpot === "treadmill" && !route.length && S.timer && S.timer.kind === "task" && Math.abs(mel.x - mel.tx) < 2) { nodes.mel.classList.add("walk"); mel.dir = 1; }
  nodes.evan.classList.toggle("run", evan.run && evan.moving);
  const order = [[nodes.mel, mel], [nodes.maple, maple], [nodes.evan, evan], ...npcActors()].sort((a, b) => a[1].y - b[1].y);
  const g = $("actors"); order.forEach(([n]) => { if (g.lastElementChild !== n) g.appendChild(n); });
  // The quest note docks on the opposite half of the map from Mel, so it never sits on top of her.
  const jn = $("journal"), low = jn.classList.contains("low");
  if (!low && mel.y < 300) jn.classList.add("low"); else if (low && mel.y > 360) jn.classList.remove("low");
  const close = Math.hypot(maple.x - mel.x, maple.y - mel.y) < 60;
  bubbleAt($("speech"), close ? (maple.x*0.35 + mel.x*0.65) : maple.x, close ? Math.min(maple.y, mel.y) : maple.y, close ? 76 : (sleeping ? 18 : 30));
  if (evanHere()) bubbleAt($("evanSay"), evan.x, evan.y, 40); else $("evanSay").hidden = true;
  requestAnimationFrame(frame);
}

/* =================== WIRING =================== */
$("stepForm").onsubmit = e => {
  e.preventDefault(); const v = Math.max(0, parseInt($("stepIn").value, 10) || 0);
  S.steps = v; const ms = Math.floor(v/1000);
  if (ms > S.stepMs) { earn(2*(ms - S.stepMs), "steps"); S.stepMs = ms; }
  speak(v >= 5000 ? `${v.toLocaleString()}! 5,000 smashed 🎉` : `${v.toLocaleString()}. ${(5000 - v).toLocaleString()} to go!`, 5000);
  $("stepIn").value = ""; $("stepForm").classList.remove("open"); measureHud(); act(v >= 5000 ? "cheer" : "nudge"); save();
};
$("addForm").onsubmit = e => {
  e.preventDefault(); const title = $("addTitle").value.trim(); if (!title) return;
  S.extra.push({id:"x" + Date.now().toString(36), title, minutes: Math.min(180, Math.max(5, parseInt($("addMin").value, 10) || 25))});
  $("addTitle").value = ""; $("addMin").value = ""; save(true);
};
$("nameSave").onclick = () => { const v = $("nameIn").value.trim(); if (v) { F.name = v; $("nameIn").value = ""; act("cheer"); speak(`Hi! I'm ${v} now 🦊`, 4000); save(); } };
$("pet").onclick = () => { hearts(2); speak(pick(["*leans into the pat*", "Happy fox noises!", "More pats please.", "You're my favourite human."]), 3000); };

document.querySelectorAll("[data-ico]").forEach(el => el.insertAdjacentHTML("afterbegin", icon(el.dataset.ico, +el.dataset.size || 20)));
$("pclose").onclick = closePanel;
document.querySelectorAll("[data-open]").forEach(b => b.onclick = () => { openView = openView === b.dataset.open ? null : b.dataset.open; ctx(); });
initNotebook({task:() => phase() === "task" ? remaining()[0] : null, S:() => S, F:() => F, fs:t => !!S.firstStep[t.id], act:nbAct, timerLeft,
  sayNow:() => say, sample:() => sampleCap, sampleDenied:() => { sampleCap = null; }, sayButton, markRead, agentName, onClose:() => render(),
  placeLabel:t => `${VILLAGE[placeOf(t)].name} · ${spotObj(placeOf(t), spotOf(t)).name}`});
initNpcs({scene:() => scene, bounds, mel, evan, F:() => F, S:() => S, save:() => save(), facts, bubble:bubbleAt, evanSays, unreadMail,
  openMail:item => openMail(item), gift:id => { addInv(id, 1); flash(`Auntie Lin gave you ${ITEMS[id].n.toLowerCase()}`); save(); }});
measureHud();
render(true);
if (F.gift) setTimeout(() => speak("A welcome gift! Seeds are in your backpack 🌷", 5000), 1200);
requestAnimationFrame(frame);
initDb();
