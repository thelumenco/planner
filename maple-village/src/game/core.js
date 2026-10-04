// Game core: state + persistence, quest flow, actions, UI renderers and the world sim.
import { H, M, W, HH, now, dayKey, sgHM, prevDay, $, esc, pick, rnd, clamp, dur, plain } from "../util.js";
import { icon, progressBar, progressBarV } from "../art/icons.js";
import { VILLAGE, WORK, ROOMS, OUTDOOR, BRIDGES, ARRIVE, outdoorOf, isWeekend, stationsOf, spotObj, placeOf, spotOf, isTreadTask } from "../data/world.js";
import { CROPS, ITEMS, DECOR, PLOTS, QUEST_BOOST, LEVELS, PEP, YAY, itemIco } from "../data/items.js";
import { UPGRADES, unlocked, nextUpgrade, festivalOn, rainyOn } from "../art/village-extras.js";
import { villageArt, baseArt, roomArt, farmArt, setArtContext } from "../art/scenes.js";
import { AGENTS, NPCS } from "../data/npcs.js";
import { initNotebook, openTask, openMail, openDigest, openTracker, closeNotebook, refreshNotebook, notebookOpen } from "../ui/notebook.js";
import { pullSunsama, SUNSAMA_ERRORS } from "./sunsama.js";
import { unlockAudio, audioRunning, sfx, alarm, settings as sound, setMusic, setMusicVol, setSfx } from "./audio.js";
import { todaysEvents, CAL_ERRORS } from "./calendar.js";
import { findPath, blocked } from "./paths.js";
import { fetchPost, postPanel, postCount } from "./postbox.js";
import { attachFeeds, health, healthPanel, contentHTML, wireContent, goodNews, goodNewsHTML } from "./feeds.js";
import { initHestia, attachHestiaDb, hestiaPanel, wireHestia, hestiaCounts, importHestia, chatAddShopping, chatRestock, chatAddChore, chatTickChore, chatTidyTimer, hestiaSummary } from "./hestia.js";
import { initNpcs, tickNpcs, tapNpc, npcActors, resetScene as resetNpcs, courierDelivered, isHere, whereIs, npcSay, npcPos } from "./npcs.js";

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
  if (S.waterMl == null) { S.waterMl = (S.water || 0)*250; S.waterPaid = Math.min(4, S.water || 0); }
  if (F.coins == null) F.coins = S.berries || 0;
  if (!F.inv) { F.inv = {tulip_seed:2, carrot_seed:1}; F.gift = true; }
  if (!F.tools) F.tools = {};
  if (!F.fam) F.fam = {owned: {}, gifts: {evan: 0, darren: 0}};
  if (!Array.isArray(F.plots) || F.plots.length !== 12) F.plots = Array.from({length:12}, () => null);
  if (!F.cool) F.cool = {};
  ["met", "gifts", "mailRead"].forEach(k => { if (!F[k]) F[k] = {}; });
  F.digest = Object.assign({read:{}, lastAt:0, mine:[]}, F.digest || {});
  ["decor", "decorOwned", "history"].forEach(k => { if (!F[k] || typeof F[k] !== "object") F[k] = {}; });
  if (!Array.isArray(F.upgradeLog)) F.upgradeLog = [];
  if (!F.totalQuests) F.totalQuests = 0;
  if (!Array.isArray(S.chats)) S.chats = [];
  ["halfway", "tread", "npcSaid"].forEach(k => { if (!S[k]) S[k] = {}; });
}
migrate();
setArtContext({F:() => F, S:() => S, remaining:() => remaining(), questsIn:pl => questsIn(pl), growth:p => growth(p), stats:() => ST, day:() => dayKey(), postCount:() => postCount(), health: app => health(app), goodNews: () => { const g = goodNews(); return g && F.goodRead !== g.at ? g : null; }, lanterns:() => (S.pond ? (S.pond.shown ?? S.pond.wins.length) : 0), dusk:() => isDusk()});
function isDusk(){ const t = sgHM(); return t >= 19*60 || t < 6*60; }
let say = null, refs = null, writing = {}, pending = {}, speechT = null, speechLock = 0;
let scene = "base", atSpot = null, boardOpen = false, shelfOpen = false, selPlot = null, shopTab = "seeds";
// In-game UI: the quest note pinned on the map (open, or slim while walking) and the panel over the map.
// The note starts folded when the village opens; it only pops open on step changes after the first few seconds.
let qnOpen = false, qnQuietUntil = Date.now() + 5000, qnKey = "", openView = null, shopClosed = false;
let homeView = null, postOpen = false, healthOpen = false, newsOpen = false, calTab = "today";   // "chores" (the cleaning cupboard) or "fridge" while one is open at home

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
// A small per-day record for the Friday paper (last 21 days).
function noteHistory(){
  if (!F.history) return;
  F.history[S.day] = {q: S.doneIds.length, steps: S.steps || 0, water: S.waterMl || 0, harvest: S.harvested || 0, coins: S.earned || 0, chats: (S.chats || []).slice(0, 12)};
  Object.keys(F.history).sort().slice(0, -21).forEach(k => delete F.history[k]);
}
const save = (redraw) => { noteHistory(); persist("today"); persist("fox"); render(redraw); };

async function initDb(){
  if (!window.claude || !claude.use) return;
  setTimeout(() => { if (!refs) syncSunsama(); }, 12000);   // no db in this view: still pull Sunsama into the local plan
  claude.use("sample").then(sm => { sampleCap = sm || null; refreshNotebook(); }, () => {});
  const [db, user] = await Promise.all([claude.use("db"), claude.use("user")]);
  if (!db || !user) return;
  const uid = await user.id(); if (!uid) return;
  const col = db.collection("data/users/" + uid);
  attachHestiaDb(col.doc("hestia"));
  attachFeeds(col, id => {
    if (/^health/.test(id) && ["village", "chord", "chico"].includes(scene)) { drawScene(); ctx(); }
    if (/^content/.test(id) && openView === "cal" && calTab === "content") renderCal();
    if (id === "goodnews" && scene === "village") drawScene();
  });
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
    render(outside());
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
  const list = [...base, ...S.extra].filter(t => t && t.id && t.title && !(S.dropped || []).includes(t.id)).map(t => Object.assign({}, t, S.tweaks[t.id] || {}));
  const ids = list.map(t => t.id);
  const order = S.order.filter(id => ids.includes(id));
  ids.forEach(id => { if (!order.includes(id)) order.push(id); });
  return order.map(id => list.find(t => t.id === id));
}
// "Not today": a quest that no longer applies leaves today's boards (no coins, no guilt). Sunsama itself is untouched.
function dropTask(id, quiet){
  const t = allTasks().find(x => x.id === id); if (!t) return;
  if (String(id).startsWith("x")) S.extra = S.extra.filter(x => x.id !== id);
  else { S.dropped = S.dropped || []; S.dropped.push(id); }
  if (S.timer && S.timer.id === id) S.timer = null;
  S.firstStep[id] = false; sfx("paper", true);
  setSay(`Dropped “${t.title}” for today. One less thing.`); if (!quiet) save(true);
}
function undropTask(id){ S.dropped = (S.dropped || []).filter(x => x !== id); setSay("Back on the board."); save(true); }
const remaining = () => allTasks().filter(t => !S.doneIds.includes(t.id));
const questsIn = pl => allTasks().filter(t => placeOf(t) === pl);
function phase(){
  if (S.mode === "break") return "break";   // a break Mel asks for comes first, even mid-clean
  if (!S.cleanDone) return "clean";
  if (S.mode === "decompress") return "decompress";
  if (remaining().length) return "task";
  return S.doneIds.length ? "recap" : "empty";
}
const arrivedFor = t => S.arrived[t.id] || (scene === placeOf(t) && atSpot === spotOf(t));
const atClean = () => S.wipe || (scene === "home" && atSpot === "cupboard");

/* =================== FARM =================== */
function growth(p){ if (!p || !p.crop || !p.wateredAt) return 0; return clamp((Date.now() - p.wateredAt + (p.bonus || 0)) / (CROPS[p.crop].dur / ((F.tools || {}).compost ? 1.25 : 1)), 0, 1); }
// Darren's shed: garden tools bought once with coins, kept forever.
const SHED = {
  can:       {n: "Big watering can", price: 30, ico: "wateringCan", what: "Waters every thirsty plot in one go."},
  compost:   {n: "Compost bin", price: 60, ico: "compost", what: "Everything grows a quarter faster."},
  sprinkler: {n: "Sprinkler", price: 90, ico: "sprinkler", what: "New seeds water themselves the moment you plant them."}
};
let shedOpen = false;
function buyTool(id){
  const t = SHED[id]; if (!t || F.tools[id] || F.coins < t.price) return;
  F.coins -= t.price; F.tools[id] = true; sfx("chaching"); act("cheer"); flash(`New in the shed: ${t.n.toLowerCase()}`);
  speak(isHere("darren") ? `Darren's setting up the ${t.n.toLowerCase()} for you!` : `The ${t.n.toLowerCase()} is ready in the garden.`, 4500);
  if (id === "can") F.plots.forEach((p, i) => { if (p && p.crop && !p.wateredAt) p.wateredAt = Date.now(); });
  save();
}
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
function earn(n, why){ if (!/quest|Sunsama/.test(why)) sfx("coin"); F.coins += n; S.earned += n; markActive(); flash(`+${n} coins: ${why}`); mprop("coin", mel.x, mel.y - 60, 1800); }
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
function evanSays(t){ const e = $("evanSay"); e.innerHTML = `<b class="who">Evan</b>${esc(plain(t))}`; e.hidden = false; clearTimeout(evanT); evanT = setTimeout(() => e.hidden = true, 2200); }

/* =================== PORTRAIT ANIMATION =================== */
const portrait = $("scene"), props = $("props");
let animT = null, mapleNap = 0;
function prop(txt, cls, x, y, life){
  const p = document.createElement("div"); p.className = "prop " + cls; p.innerHTML = icon(txt, cls === "p-fort" ? 96 : 30);
  if (x != null) { p.style.left = x + "%"; p.style.top = y + "%"; }
  props.appendChild(p); setTimeout(() => p.remove(), life || 3000);
}
function mprop(txt, x, y, life){
  const p = document.createElement("div"); p.className = "mprop"; p.innerHTML = icon(txt, 18); p.style.left = (x*cam.s + cam.ox) + "px"; p.style.top = (y*cam.s + cam.oy) + "px";
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
// Timers always chime (an alarm shouldn't be muted with the cosy effects), and buzz where phones allow it.
function chime(){
  alarm();
  try { navigator.vibrate && navigator.vibrate([120, 80, 120]); } catch {}
}
function startTimer(kind, mins, id){ S.timer = {kind, endAt: Date.now() + mins*M, total: mins*M, id: id || null, fired:false}; }
// Time left on the running timer (a paused timer keeps its remaining time in `pausedLeft`).
const tLeft = () => !S.timer ? 0 : S.timer.pausedLeft != null ? S.timer.pausedLeft : Math.max(0, S.timer.endAt - Date.now());
function timerCtl(what){
  const tm = S.timer; if (!tm) return;
  if (what === "pause" && tm.pausedLeft == null) { tm.pausedLeft = tLeft(); setSay("Paused. The time box waits for you."); }
  else if (what === "play" && tm.pausedLeft != null) { tm.endAt = Date.now() + tm.pausedLeft; tm.pausedLeft = null; setSay("And we're off again."); }
  else if (what === "reset") { tm.endAt = Date.now() + tm.total; tm.pausedLeft = null; tm.fired = false; setSay("Fresh start on the clock."); }
  sfx("tap"); save();
}
const timerBtns = () => S.timer ? `<span class="tctl"><button class="tbtn" data-tctl="${S.timer.pausedLeft != null ? "play" : "pause"}" aria-label="${S.timer.pausedLeft != null ? "Resume the timer" : "Pause the timer"}">${icon(S.timer.pausedLeft != null ? "play" : "pause", 18)}</button><button class="tbtn" data-tctl="reset" aria-label="Restart the timer">${icon("reset", 18)}</button></span>` : "";
document.addEventListener("click", ev => { const b = ev.target.closest("[data-tctl]"); if (b) { ev.stopPropagation(); timerCtl(b.dataset.tctl); } }, true);
const fmt = left => left ? `${Math.floor(left/M)}:${String(Math.floor(left/1e3)%60).padStart(2,"0")}` : "time!";
function timerHTML(label){
  if (!S.timer) return "";
  const left = tLeft(), C = 2*Math.PI*28;
  return `<div class="timer"><svg class="ring" viewBox="0 0 66 66" aria-hidden="true"><circle class="bg" cx="33" cy="33" r="28"/><circle class="fg" id="ringFg" cx="33" cy="33" r="28" stroke-dasharray="${C}" stroke-dashoffset="${C*(1-left/S.timer.total)}"/></svg>
    <div><span class="t" id="tLeft">${fmt(left)}</span><small>${S.timer.pausedLeft != null ? "paused" : esc(label)}</small></div>${timerBtns()}</div>`;
}
let lastReady = readyCount(), lastDusk = null;
setInterval(() => {
  if (S.day !== dayKey()) { S = freshToday(); say = null; save(true); speak(defaultLine()); syncSunsama(); return; }
  const rc = readyCount();
  if (rc > lastReady) { speak(rc === 1 ? "Psst… something in the garden is ready!" : `${rc} crops ready in the garden!`, 5000); if (scene === "farm") drawScene(); }
  lastReady = rc;
  if (scene === "farm" && Math.random() < .2) { drawScene(); if (selPlot != null) ctx(); }
  if (scene === "base" && isDusk() !== lastDusk) drawScene();
  renderEvanHold();
  lastDusk = isDusk();
  if (shelfOpen && Math.floor(Date.now()/1000) % 20 === 0) ctx();   // keep "next digest in N min" fresh
  if (!S.timer) return;
  const left = tLeft();
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
  const pl = placeOf(t), sp = spotObj(pl, spotOf(t)); go(pl, sp.tx, sp.ty, () => pl === "base" ? arriveVillageSpot(sp.id) : arriveSpot(sp.id));
}
const A = {
  walk(t){ goQuest(t); },
  pond(){ go("base", VILLAGE.pond.door[0], VILLAGE.pond.door[1], () => arriveVillageSpot("pond")); },
  gotWipe(){ S.wipe = true; startTimer("clean", 5); setSay("Nearest, most annoying spot. You pick!"); save(); },
  cleanDone(){ S.cleanDone = true; S.timer = null; earn(3, "five-minute clean"); gainXp(1); S.last = "clean"; act("cheer"); setSay("First tick of the day! Look at that ✨"); save(); },
  firstStep(t){ S.firstStep[t.id] = true; S.arrived[t.id] = true; startTimer("task", t.minutes || 25, t.id); setSay("Hard part's done. Now the rest, on the clock."); save(); },
  done(t){
    S.doneIds.push(t.id); S.timer = null; sfx("chaching"); earn(5, "quest complete"); gainXp(1); S.last = t.title; countQuest();
    let grew = 0; F.plots.forEach(p => { if (p && p.crop && p.wateredAt && growth(p) < 1) { p.bonus = (p.bonus || 0) + QUEST_BOOST; grew++; } });
    if (t.meeting) S.mode = "decompress";
    else if (remaining().length) { S.mode = "break"; startTimer("break", 10); }
    act("cheer"); if (evanHere()) evanSays(pick(["yaaay!", "Mama did it!", "hooray!"]));
    if (onTread(t)) setSay(pick(YAY) + (grew ? " The garden grew a little 🌱" : "") + " Steps showing?", [["Log my steps", () => openSteps(true)]]);
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
        ["Not needed any more", () => { dropTask(t.id, true); }],
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
  water(ml){ setWater((S.waterMl || 0) + (ml || GLASS)); speak(pick(["Glug glug!", "Hydrated boss!", "Water break, good call."]), 3000); }
};
function doNext(id){
  const ids = allTasks().map(x => x.id);
  if (S.timer && S.timer.kind !== "break") S.timer = null;
  S.order = [id, ...ids.filter(x => x !== id)]; say = null; openView = null; boardOpen = false; speak("New quest picked! Off we go.", 3000); save(true);
}
// Every finished quest (here or in Sunsama) counts towards village upgrades, which stay forever.
function countQuest(){
  const before = unlocked(F.totalQuests || 0).length;
  F.totalQuests = (F.totalQuests || 0) + 1;
  const now = unlocked(F.totalQuests);
  if (now.length > before) {
    const u = now[now.length - 1]; F.upgradeLog.push({id: u.id, day: dayKey()});
    setTimeout(() => { act("cheer"); speak(`Village upgrade! ${u.name[0].toUpperCase() + u.name.slice(1)}.`, 6000); flash(`Village upgrade: ${u.name}`); if (outside()) drawScene(); }, 2400);
  }
}
// Progress buttons on the notebook page.
const HALF = ["Halfway! The downhill bit starts now.", "Halfway there. Look at you go.", "Half done. Sip of water, then onwards."];
const onTread = t => !!(t && (S.tread[t.id] || isTreadTask(t)));
function nbAct(kind, t){
  if (kind === "started") { if (!S.firstStep[t.id]) A.firstStep(t); return; }
  if (kind === "halfway") { S.halfway[t.id] = true; act("cheer"); setSay(pick(HALF)); save(); return; }
  if (kind === "stuck") { A.proc(t); return; }
  if (kind === "more") {
    const tm = S.timer;
    if (tm && tm.id === t.id && !tm.fired && tLeft() > 0) { if (tm.pausedLeft != null) tm.pausedLeft += 10*M; tm.endAt += 10*M; tm.total += 10*M; }
    else startTimer("task", 10, t.id);
    setSay("Ten more minutes on the clock. Take them, no guilt."); save(); return;
  }
  if (kind === "treadmill") { A.treadmill(t); return; }
  if (kind === "done") { A.done(t); return; }
}
function sayButton(i){ if (!say || !say.buttons || !say.buttons[i]) return; const fn = say.buttons[i][1]; say.buttons = null; fn(); save(); }
function timerLeft(t){
  if (!S.timer || S.timer.id !== t.id || (S.timer.kind !== "task" && S.timer.kind !== "deal")) return null;
  return fmt(tLeft());
}

/* =================== SUNSAMA PULL =================== */
// On open (and when the day rolls over or the tab comes back on a new day) the page fetches today's Sunsama tasks.
// Chat's plan wins: a pull only writes the plan when today has none, or when today's came from an earlier pull.
// With chat's plan in place, "Check Sunsama" just adds tasks the plan doesn't have yet to the end of the line.
const sun = {busy: false, at: 0, error: null, added: 0};
// Tasks ticked off in Sunsama (by Mel or by chat) count in the village too: marked done, with the usual coins.
function creditDone(tasks, quiet){
  const ids = new Set(allTasks().map(t => t.id)), cur = phase() === "task" ? remaining()[0] : null, got = [];
  (tasks || []).forEach(t => {
    if (!t || !t.completed || !ids.has(t.id) || S.doneIds.includes(t.id)) return;
    S.doneIds.push(t.id); got.push(t); if (got.length === 1) sfx("chaching");
    earn(5, "done in Sunsama"); gainXp(1); countQuest();
    if (cur && cur.id === t.id) { if (S.timer && S.timer.id === t.id) S.timer = null; S.firstStep[t.id] = false; }
  });
  if (got.length && !quiet) { act("cheer"); speak(got.length === 1 ? `You already did “${got[0].title}” in Sunsama! Counted.` : `${got.length} quests already done in Sunsama! Counted.`, 5000); }
  return got.length;
}
const markSunsamaDone = () => creditDone(P && P.day === dayKey() && Array.isArray(P.tasks) ? P.tasks : [], true);
// manual: the refresh button. Otherwise it runs on open, when the tab comes back, and every 10 minutes (throttled).
async function syncSunsama(manual){
  if (sun.busy || (!manual && Date.now() - sun.at < 2*60e3)) return;
  const fromPull = !P || P.day !== dayKey() || P.source === "sunsama";
  sun.busy = true; sun.error = null; render();
  const day = dayKey(), r = await pullSunsama(day, {fresh: true});
  sun.busy = false; sun.at = Date.now();
  if (r.error) { sun.error = r.error === "unavailable" && !manual ? null : r.error; render(); return; }
  if (fromPull) {
    if (!r.tasks.length && !(P && P.day === day && P.source === "sunsama")) { sun.added = 0; render(); return; }
    const was = remaining().length;
    P = {day, source: "sunsama", pulledAt: Date.now(), tasks: r.tasks};
    try { localStorage.setItem("fox.plan", JSON.stringify(P)); } catch {}
    if (refs) refs.plan.set(JSON.parse(JSON.stringify(P))).catch(() => {});
    creditDone(r.tasks, !was); save(true);
    if (!was && remaining().length) speak(`${remaining().length} quests from Sunsama on the boards!`, 5000);
    return;
  }
  // Chat's or the morning routine's plan stays; Sunsama only tells us what's been ticked off (and, on request, what's new).
  const n = creditDone(r.tasks);
  if (manual) {
    const have = new Set(allTasks().map(t => t.id));
    const fresh = r.tasks.filter(t => !t.completed && !have.has(t.id));
    S.extra.push(...fresh); sun.added = fresh.length;
    if (!n) speak(fresh.length ? `Added ${fresh.length} new Sunsama task${fresh.length === 1 ? "" : "s"} to the end of the line.` : "Sunsama and the boards match. All set!", 4000);
  }
  save(true);
}
setInterval(() => { if (!document.hidden) syncSunsama(); }, 10*60e3);
function sunsamaLine(){
  const el = $("sunsamaLine"); if (!el) return;
  const src = P && P.day === dayKey() ? (P.source === "sunsama" ? "sunsama" : P.source === "routine" ? "routine" : "chat") : null;
  let txt = sun.busy ? "Checking Sunsama…"
    : sun.error ? (SUNSAMA_ERRORS[sun.error] || "Couldn't reach Sunsama just now.")
    : src === "sunsama" ? `Today's quests came straight from Sunsama${P.pulledAt ? " at " + new Date(P.pulledAt).toLocaleTimeString("en-GB", {hour: "numeric", minute: "2-digit", timeZone: "Asia/Singapore"}) : ""}. Chat's boss-mode plan replaces them with first steps and pep talks.`
    : src === "routine" ? "Today's plan was loaded this morning, with first steps and pep talks. Anything you tick off in Sunsama counts here too."
    : src === "chat" ? "Today's plan is from chat's boss mode. Anything you tick off in Sunsama counts here too."
    : "Your Sunsama tasks load here when you open the village.";
  el.innerHTML = `${esc(txt)} <button class="next" id="sunBtn" ${sun.busy ? "disabled" : ""}>${src === "chat" || src === "routine" ? "check Sunsama for new tasks" : "refresh from Sunsama"}</button>`;
  $("sunBtn").onclick = () => syncSunsama(true);
}
document.addEventListener("visibilitychange", () => { if (!document.hidden) syncSunsama(); });

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

/* =================== TALK TO MAPLE (Claude, anytime) =================== */
// Mel can ask for anything. Maple answers in a line or two and, when it's something the village can do, sends
// actions that run straight away (shopping list, chores, breaks, timers, quests, water, steps, walking somewhere).
let chatLog = (() => { try { return JSON.parse(localStorage.getItem("fox.chat")) || []; } catch { return []; } })(), chatBusy = false;
const keepChat = () => { chatLog = chatLog.slice(-30); try { localStorage.setItem("fox.chat", JSON.stringify(chatLog)); } catch {} };
const PLACES = {home: "home", house: "home", fridge: "home:fridge", kitchen: "home:kitchen", cupboard: "home:cupboard", treadmill: "home:treadmill", sofa: "home:sofa",
  pond: "base:pond", garden: "farm", farm: "farm", shed: "base:shed", swing: "base:swing", letterbox: "base:letterbox", market: "market", well: "village:well",
  "town hall": "hall", hall: "hall", chord: "chord", library: "fresh", "fresh pages": "fresh", chico: "chico", "post office": "post", post: "post", town: "village:board"};
function walkToPlace(name){
  const k = PLACES[String(name || "").toLowerCase().trim()]; if (!k) return null;
  const [pl, sp] = k.split(":");
  if (pl === "base" || pl === "village") { const v = VILLAGE[sp]; go(pl, v.door[0], v.door[1], () => arriveVillageSpot(sp)); }
  else if (sp) { const s = spotObj(pl, sp); go(pl, s.tx, s.ty, () => arriveSpot(sp)); }
  else go(pl, 260, pl === "farm" ? 560 : 560, null);
  return name;
}
const fuzzyTask = q => { const n = String(q || "").toLowerCase(); return remaining().find(t => t.title.toLowerCase().includes(n)) || remaining().find(t => n.includes(t.title.toLowerCase().slice(0, 18))); };
function runChatAction(a){
  if (!a || !a.type) return null;
  switch (a.type) {
    case "shopping_add": { const d = chatAddShopping(a.items || (a.item ? [a.item] : [])); return d.length ? `On the shopping list: ${d.join(", ")}` : null; }
    case "restocked": { const d = chatRestock(a.items || []); return d.length ? `Back in the fridge: ${d.join(", ")}` : null; }
    case "chore_add": { const t = chatAddChore(a.kind, a.text); return t ? `New ${a.kind === "weekly" ? "weekly" : "daily"} chore: ${t}` : null; }
    case "chore_done": { const t = chatTickChore(a.text); return t ? `Ticked: ${t}` : null; }
    case "tidy_timer": return `Tidy timer: ${chatTidyTimer(+a.minutes)} minutes`;
    case "break": { const m = Math.max(5, Math.min(30, +a.minutes || 10)); if (S.timer && S.timer.kind === "task" && S.timer.pausedLeft == null) S.timer.pausedLeft = Math.max(0, S.timer.endAt - Date.now());
      S.mode = "break"; startTimer("break", m); setSay(`Break time. ${m} minutes, away from the desk.`); save(); return `${m}-minute break started`; }
    case "back": if (S.mode === "break") { A.back(); return "Break over"; } return null;
    case "quest_add": { const title = String(a.title || "").trim().slice(0, 120); if (!title) return null; S.extra.push({id: "x" + Date.now().toString(36), title, minutes: Math.min(180, Math.max(5, +a.minutes || 25))}); save(true); return `New quest: ${title}`; }
    case "quest_drop": { const t = fuzzyTask(a.title); if (!t) return null; dropTask(t.id); return `Dropped for today: ${t.title}`; }
    case "quest_next": { const t = fuzzyTask(a.title); if (!t) return null; doNext(t.id); return `Up next: ${t.title}`; }
    case "water": { const ml = Math.max(50, Math.min(2000, +a.ml || GLASS)); A.water(ml); return `+${ml} ml water`; }
    case "steps": { const n = Math.max(0, Math.min(60000, +a.total || 0)); if (!n) return null; setSteps(n); return `Steps: ${n.toLocaleString()}`; }
    case "go": { const p = walkToPlace(a.place); return p ? `Walking to the ${p}` : null; }
    case "open": { const w = String(a.what || ""); if (["quests", "bag", "mail", "cal", "settings", "friend"].includes(w)) { setTimeout(() => { openView = w; ctx(); }, 900); return `Opening ${w}`; }
      if (w === "fridge" || w === "chores") { walkToPlace(w === "fridge" ? "fridge" : "cupboard"); return `Off to the ${w === "fridge" ? "fridge" : "cleaning cupboard"}`; } return null; }
    case "pet": hearts(3); sfx("purr"); return null;
  }
  return null;
}
function chatContext(){
  const rem = remaining(), cur = phase() === "task" ? rem[0] : null, h = hestiaSummary();
  return JSON.stringify({time: `${String(Math.floor(sgHM()/60)).padStart(2, "0")}:${String(sgHM() % 60).padStart(2, "0")} Singapore, ${WEEKDAY[new Date(dayKey() + "T00:00:00Z").getUTCDay()]}`,
    where: scene, phase: phase(), currentQuest: cur ? cur.title : null, questsLeft: rem.map(t => t.title).slice(0, 15), questsDone: S.doneIds.length,
    timer: S.timer ? {kind: S.timer.kind, minutesLeft: Math.round(tLeft()/M)} : null, waterMl: S.waterMl || 0, steps: S.steps || 0, coins: F.coins,
    home: h});
}
async function sendChat(text){
  text = String(text || "").trim(); if (!text || chatBusy) return;
  if (!sampleCap) { chatLog.push({role: "user", content: text}, {role: "assistant", content: "I can't reach Claude from this view just now. The buttons all still work!"}); keepChat(); renderChat(); return; }
  chatLog.push({role: "user", content: text}); chatBusy = true; keepChat(); renderChat();
  const history = chatLog.slice(-12, -1).map(m => (m.role === "user" ? "Mel: " : "Maple: ") + m.content).join("\n");
  try {
    const d = await sampleCap.json(`You are ${F.name}, a tiny fox who lives in Mel's cosy village game and coaches her through her day, in boss-mode style: one thing at a time, tiny first steps, breaks, no guilt. Warm, direct, short sentences. Mel is a Singapore-based founder (a copywriting studio, the Chord and Chico apps) and a parent of a toddler, Evan; Darren lives with them.
She can ask you anything. Reply in at most 3 short sentences, plain text, no emoji, no markdown.
When she asks for something the game can do, include it in "actions" and say in your reply that it's done. Never claim something happened that isn't in actions, and never claim to send emails, edit Sunsama or her calendar: those happen in chat with Claude.
Available actions (use only these):
{"type":"shopping_add","items":[{"name":"oat milk","where":"Supermarket"}]}  (where is optional; stores: ${hestiaSummary().stores.join(", ")})
{"type":"restocked","items":["rice"]}  (bought or found again: back in the fridge)
{"type":"chore_add","kind":"daily|weekly","text":"..."}
{"type":"chore_done","text":"..."}  (tick a home chore she says she did)
{"type":"tidy_timer","minutes":10|20|30}
{"type":"break","minutes":10}  {"type":"back"}  (start or end a break)
{"type":"quest_add","title":"...","minutes":25}  {"type":"quest_drop","title":"..."}  {"type":"quest_next","title":"..."}
{"type":"water","ml":250}  {"type":"steps","total":4200}
{"type":"go","place":"home|fridge|kitchen|cupboard|treadmill|sofa|pond|garden|shed|swing|letterbox|market|well|town hall|chord|library|chico|post office"}
{"type":"open","what":"fridge|chores|quests|bag|mail|cal|settings|friend"}
{"type":"pet"}
What's happening in the village right now: ${chatContext()}
Conversation so far:
${history || "(just started)"}
Mel: ${text}
Return JSON only: {"reply": "...", "actions": [ ... ]}`, {modelTier: "quick", cache: false});
    const reply = plain(String((d && d.reply) || "Hmm, I lost my words. Try again?")).slice(0, 600);
    const did = (Array.isArray(d && d.actions) ? d.actions : []).slice(0, 8).map(a => { try { return runChatAction(a); } catch { return null; } }).filter(Boolean);
    chatLog.push({role: "assistant", content: reply, did}); speak(reply, 5000);
  } catch (e) {
    if (e && e.code === "not_granted") sampleCap = null;
    chatLog.push({role: "assistant", content: e && e.code === "rate_limited" ? "I need a little breather. Try again in a minute." : e && e.code === "not_granted" ? "Talking needs your OK first. The buttons still work!" : "I couldn't reach Claude just now. Try again?"});
  }
  chatBusy = false; keepChat(); renderChat(); render();
}
function renderChat(){
  const el = $("chatLog"); if (!el) return;
  $("chatName").textContent = F.name;
  el.innerHTML = (chatLog.length ? "" : `<p class="fox">${icon("fox", 18)}Hi! Ask me anything, or tell me what you need. I can add to your shopping list, tick chores, start a break or a tidy timer, add or drop quests, log water and steps, or walk you somewhere.</p>`)
    + chatLog.map(m => m.role === "user" ? `<p class="me">${esc(m.content)}</p>` : `<p class="fox">${icon("fox", 18)}${esc(m.content)}</p>${(m.did || []).map(d => `<span class="did">${esc(d)}</span>`).join("")}`).join("")
    + (chatBusy ? `<p class="fox">${icon("fox", 18)}…</p>` : "");
  el.scrollTop = el.scrollHeight;
  $("chatChips").innerHTML = ["What's next?", "I need a break", "Add milk to the shopping list", "I did the dishes"].map(c => `<button type="button" data-chip="${esc(c)}">${esc(c)}</button>`).join("");
  $("chatChips").querySelectorAll("[data-chip]").forEach(b => b.onclick = () => sendChat(b.dataset.chip));
}

// Wins the page itself knows about, for the good news board (the morning routine adds more).
function myWins(){
  const w = [], y = F.history && F.history[prevDay(dayKey())];
  if (S.doneIds.length) w.push(`${S.doneIds.length} quest${S.doneIds.length > 1 ? "s" : ""} done today`);
  if (y && y.q) w.push(`${y.q} quest${y.q > 1 ? "s" : ""} finished yesterday`);
  if (F.streak >= 2) w.push(`${F.streak} cosy days in a row with ${F.name}`);
  if (S.harvested) w.push(`${S.harvested} harvest${S.harvested > 1 ? "s" : ""} from the garden today`);
  ["chord", "chico"].forEach(a => { const h = health(a); if (h && h.status === "green") w.push(`${a === "chord" ? "Chord" : "Chico"}: all checks green last night`); });
  if (ST.chord && ST.chord.users) w.push(`Chord is home to ${ST.chord.users} ${ST.chord.label || "studios"}`);
  if (ST.chico && ST.chico.users) w.push(`${ST.chico.users} ${ST.chico.label || "families"} use Chico`);
  return w;
}

/* =================== MAIL (agent notes) =================== */
// Notes the page writes itself: the Friday "weekend edition" of the paper and the 6pm wind-down at the pond.
const sgAt = (day, h, m = 0) => Date.UTC(+day.slice(0, 4), +day.slice(5, 7) - 1, +day.slice(8, 10), h - 8, m);
const WEEKDAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
let localCache = {key: "", items: []};
const dayKeyAt = ms => new Date(ms + 6*H).toISOString().slice(0, 10);   // same 2am reset as dayKey()
function localMail(){
  const day = dayKey(), hm = sgHM(), mi = MAIL.items || [], key = `${day}:${Math.floor(hm/10)}:${S.doneIds.length}:${S.cleanDone}:${mi.length}:${mi.length ? mi[mi.length - 1].id : ""}`;
  if (key === localCache.key) return localCache.items;
  const out = [], wd = new Date(day + "T00:00:00Z").getUTCDay();
  if ((wd === 5 && hm >= 900) || wd === 6 || wd === 0) out.push(weeklyPaper(wd === 5 ? day : wd === 6 ? prevDay(day) : prevDay(prevDay(day))));
  // The page's own 6pm note only when the evening wind-down routine hasn't already sent today's.
  const routineWind = (MAIL.items || []).some(m => m && m.from === "winddown" && m.at && dayKeyAt(m.at) === day);
  if (hm >= 1080 && !routineWind && (S.cleanDone || S.doneIds.length)) out.push({id: "wind-" + day, from: "winddown", at: sgAt(day, 18), pond: true,
    title: "Time to close the day", body: "Meet me at the pond. Each of today's wins gets a lantern on the water.\nThen tell chat \"wind down\" whenever you're ready."});
  return (localCache = {key, items: out}).items;
}
const allMail = () => [...(MAIL.items || []), ...localMail()];
function weeklyPaper(fri){
  noteHistory();
  const days = Array.from({length: 7}, (_, i) => { let d = fri; for (let k = 0; k < 6 - i; k++) d = prevDay(d); return d; });
  const rows = days.map(d => ({d, ...(F.history[d] || {q: 0, steps: 0, water: 0, harvest: 0, coins: 0, chats: []})}));
  const sum = k => rows.reduce((a, r) => a + (r[k] || 0), 0);
  const q = sum("q"), steps = sum("steps"), coins = sum("coins"), harvest = sum("harvest");
  const best = rows.reduce((a, r) => r.q > a.q ? r : a, {q: 0});
  const wDays = rows.filter(r => r.water > 0), avgW = wDays.length ? sum("water")/wDays.length/1000 : 0;
  const walked = rows.filter(r => r.steps >= STEP_GOAL).length;
  const chats = [...new Set(rows.flatMap(r => r.chats || []))];
  const ups = (F.upgradeLog || []).filter(u => days.includes(u.day)).map(u => (UPGRADES.find(x => x.id === u.id) || {}).name).filter(Boolean);
  let soon = null; for (let i = 1, d = fri; i <= 14; i++) { d = new Date(Date.parse(d + "T00:00:00Z") + 864e5).toISOString().slice(0, 10); const f = festivalOn(d); if (f) { soon = f; break; } }
  const sections = [{heading: "The week in numbers", lines: [`${q} quest${q === 1 ? "" : "s"} finished`, `${coins} coins earned`, `${steps.toLocaleString()} steps${walked ? `, ${walked} day${walked === 1 ? "" : "s"} past 5,000` : ""}`, wDays.length ? `${avgW.toFixed(1)} L of water a day, on average` : "Water not logged this week"]}];
  if (best.q) sections.push({heading: "Best day", lines: [`${WEEKDAY[new Date(best.d + "T00:00:00Z").getUTCDay()]}: ${best.q} quest${best.q === 1 ? "" : "s"}`]});
  sections.push({heading: "In the garden", lines: [harvest ? `${harvest} harvest${harvest === 1 ? "" : "s"} brought in` : "Nothing harvested yet. Hana has seeds."]});
  if (chats.length) sections.push({heading: "Around the village", lines: [`You chatted with ${chats.length > 1 ? chats.slice(0, -1).join(", ") + " and " + chats.slice(-1) : chats[0]}`]});
  if (ups.length) sections.push({heading: "New in the village", lines: ups.map(n => n[0].toUpperCase() + n.slice(1))});
  if (soon) sections.push({heading: "Coming up", lines: [`${soon.name} decorations go up soon`]});
  return {id: "weekly-" + fri, from: "crier", edition: "Weekend edition", at: sgAt(fri, 15),
    title: q >= 15 ? `${q} quests: a big week in the village` : q ? `${q} quests and a steady week` : "A quiet week in the village",
    body: q ? "Here's your week in the village, Saturday to Friday. Have a lovely weekend." : "Rest weeks count too. The village will be here on Monday.", sections};
}
// 6pm ritual: walk to the pond, one lantern per win, Maple reads them out, then hand over to chat's wind-down.
function windDown(item){
  // The evening routine's note lists the day's wins (from Sunsama, the calendar and so on): one lantern each.
  // Without one, the page counts what it saw today.
  const sec = item && Array.isArray(item.sections) && item.sections.find(x => x && /win/i.test(x.heading || "") && (x.lines || []).length);
  const fromRoutine = !!sec;
  const wins = sec ? sec.lines.map(l => plain(String(l))).filter(Boolean).slice(0, 9) : [];
  if (!fromRoutine) {
    if (S.cleanDone) wins.push("Five-minute clean");
    allTasks().filter(t => S.doneIds.includes(t.id)).forEach(t => wins.push(t.title));
    if (S.steps >= STEP_GOAL) wins.push(`${S.steps.toLocaleString()} steps`);
    if ((S.waterMl || 0) >= WATER_GOAL) wins.push("Two litres of water");
    if (S.harvested) wins.push(`${S.harvested} harvest${S.harvested > 1 ? "s" : ""}`);
  }
  if (!wins.length) wins.push("Showing up today");
  go("base", VILLAGE.pond.door[0], VILLAGE.pond.door[1], () => {
    atSpot = "pond"; S.pond = {wins, at: Date.now(), shown: 0}; save(true);
    let i = 0;
    const next = () => {
      if (i < wins.length) { speak(`Lantern ${i + 1}: ${wins[i]}`, 3300); i++; S.pond.shown = i; sfx("chime"); if (scene === "base") drawScene(); setTimeout(next, 3400); }
      else { delete S.pond.shown; act("cheer"); setSay(fromRoutine ? "That's the day, Mel. Rest well. Tomorrow's first thing is in the note." : "That's the day, Mel. Tell chat “wind down” whenever you're ready."); save(); }
    };
    next();
  });
}
const unreadMail = () => allMail().filter(m => m && m.id && !F.mailRead[m.id] && (!m.at || Date.now() - m.at < 36*H)).sort((a, b) => (a.at || 0) - (b.at || 0));
// The village paper's name: Mel can rename it in Settings (kept with the fox doc, so it follows her across devices).
const paperName = () => (F.paperName || "").trim() || "The Morning Crier";
const paperWaiting = () => unreadMail().find(m => m.from === "crier");
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
  const items = allMail().filter(m => m && m.id).sort((a, b) => (b.at || 0) - (a.at || 0)).slice(0, 20);
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

function decorClick(id){
  const d = DECOR[id]; if (!d) return;
  if (!F.decorOwned[id]) {
    if (F.coins < d.price) return;
    F.coins -= d.price; F.decorOwned[id] = true; F.decor[d.slot] = d.val; gainXp(1);
    flash(`Bought ${d.n.toLowerCase()}`); speak("Ooh! It's waiting for you at home.", 3500);
  } else if (F.decor[d.slot] === d.val) { delete F.decor[d.slot]; speak("Put away for now.", 2500); }
  else { F.decor[d.slot] = d.val; speak("Swapped in. Go and have a look!", 3000); }
  save(scene === "home");
}
function useItem(id){
  const it = ITEMS[id]; if (!it || !F.inv[id]) return;
  if (it.kind === "seed") { speak("Seeds go in the garden. Tap a plot there!", 3500); return; }
  if (it.kind === "gift") { giveGift(id); return; }
  if (it.kind === "tool") {
    act(it.act, it); speak(it.say, 4000);
    if (!F.cool[id] || Date.now() - F.cool[id] > 20*M) { F.cool[id] = Date.now(); gainXp(1); }
    save(); return;
  }
  addInv(id, -1); gainXp(it.xp || 1); sfx("purr");
  act(it.kind === "food" ? "eat" : it.kind === "flower" ? "flower" : it.act, it); speak(it.say, 4500); save();
}
// Gifts for the family. Evan is wherever home is (home base or inside); Darren follows his routine.
const DARREN_AT = {base: "outside at home", home: "inside the house", farm: "in the garden"};
let bubbleT = null;
function giveGift(id){
  const it = ITEMS[id]; if (!it || !F.inv[id]) return;
  const burst = (x, y) => [0, 250, 500].forEach((d, k) => setTimeout(() => mprop("heart", x + (k - 1)*14, y - 40 - k*6, 1800), d));
  const showMap = () => { if (openView) { openView = null; ctx(); } };
  if (it.to === "evan") {
    if (!evanHere()) { speak("Evan's at home. Give it to him there!", 3500); return; }
    addInv(id, -1); const n = ++F.fam.gifts.evan;
    evan.tx = mel.x + 16; evan.ty = mel.y + 4; evan.run = true; evan.wait = 5;
    showMap(); evanSays(it.say); burst(evan.x, evan.y); sfx("chime"); flash(`Evan loved the ${it.n.toLowerCase()}!`);
    if (id === "icecream" || id === "storybook") S.evanHold = {k: id, until: Date.now() + 3*M};
    if (id === "balloon") S.evanHold = {k: "balloon", until: 0};
    if (id === "storybook" && scene === "home") { const s = spotObj("home", "sofa"); evan.tx = s.tx + 20; evan.ty = s.ty; }
    if (id === "wand") { clearInterval(bubbleT); let k = 0; bubbleT = setInterval(() => { if (++k > 16 || !evanHere()) return clearInterval(bubbleT); mprop("bubbles", evan.x + rnd(-14, 14), evan.y - 34); }, 1200); }
    if (n % 3 === 0) setTimeout(() => { evanSays("for you, Mama!"); addInv("tulip", 1); flash("Evan picked you a tulip"); save(); }, 4000);
  } else {
    if (!isHere("darren")) { const w = whereIs("darren"); speak(w ? `Darren's ${DARREN_AT[w] || "around"} right now. Give it to him there!` : "Darren's not around right now.", 4000); return; }
    addInv(id, -1); const n = ++F.fam.gifts.darren;
    showMap(); npcSay("darren", it.say); const p = npcPos("darren"); if (p) burst(p.x, p.y - 20); sfx("chime"); flash(`Darren says thanks for the ${it.n.toLowerCase()}`);
    if (n % 3 === 0) setTimeout(() => { npcSay("darren", "Got you something too. Found it in the shed."); addInv("strawberry_seed", 1); flash("Darren gave you strawberry seeds"); save(); }, 4500);
  }
  gainXp(1); save();
}
// What Evan is holding: a gift from today, or his toy truck.
let holdKey = "";
function renderEvanHold(){
  const h = S.evanHold, k = h && (h.until === 0 || Date.now() < h.until) ? h.k : F.fam.owned.truck ? "truck" : "";
  if (k === holdKey) return; holdKey = k;
  let el = $("evanHold");
  if (!el) { const bob = document.querySelector("#evan .bob"); if (!bob) return; el = document.createElementNS("http://www.w3.org/2000/svg", "g"); el.id = "evanHold"; bob.appendChild(el); }
  el.innerHTML = {
    balloon: `<path d="M7.4 -11 C10 -22 9 -30 12 -40" fill="none" stroke-width=".8"/><ellipse cx="12" cy="-47" rx="5.2" ry="6.4" fill="#E8574C"/><path d="M11 -40.6 h2 l-1 1.4z" fill="#E8574C"/>`,
    icecream: `<path d="M5.6 -14 h4.4 l-2.2 7z" fill="#E8C48E"/><circle cx="7.8" cy="-15.5" r="2.6" fill="#F4C7CF"/>`,
    storybook: `<rect x="5" y="-17" width="8" height="6" rx="1" fill="#B9D2A6"/><path d="M9 -17 v6" fill="none" stroke-width=".6"/>`,
    truck: `<rect x="7" y="-6.5" width="7" height="4" rx=".8" fill="#F3C969"/><path d="M14 -5.5 h2.5 l1.5 1.8 v1.2 h-4z" fill="#EFA3A6"/><circle cx="9" cy="-1.8" r="1.3" fill="#5E5A55"/><circle cx="15.5" cy="-1.8" r="1.3" fill="#5E5A55"/>`
  }[k] || "";
}
function playFree(kind){
  const lines = {pet:["*leans into the pat*", "Happy fox noises!", "More pats please."], hide:["You found me!"], nap:["Mmm… cosy…"]};
  if (kind === "pet") { sfx("purr"); hearts(2); speak(pick(lines.pet), 3000); return; }
  act(kind); speak(pick(lines[kind]), 4500);
  if (!F.cool[kind] || Date.now() - F.cool[kind] > 30*M) { F.cool[kind] = Date.now(); gainXp(1); save(); }
}
function buy(id){
  const it = ITEMS[id]; if (!it || F.coins < it.price || (it.need && S.earned < it.need)) return;
  if (it.kind === "keep") {
    if (F.fam.owned[id]) return;
    F.coins -= it.price; F.fam.owned[id] = true; sfx("chaching"); flash(`${it.n} delivered home`); speak(it.say, 5000);
    resetNpcs(); save(true); return;
  }
  if (it.kind === "tool" && F.inv[id]) return;
  F.coins -= it.price; addInv(id, 1); flash(`Bought ${it.n.toLowerCase()}`); speak(pick(["Ooh, good choice!", "Into the backpack it goes.", "Lovely pick!"]), 2500); save();
}
function sell(id){
  const it = ITEMS[id]; if (!it || !it.sell || !F.inv[id]) return;
  addInv(id, -1); F.coins += it.sell; flash(`Sold ${it.n.toLowerCase()} +${it.sell} coins`); speak("Fresh from the garden, sold!", 2500); save();
}
function plant(i, seedId){
  const it = ITEMS[seedId]; if (!it || !F.inv[seedId] || (F.plots[i] && F.plots[i].crop)) return;
  addInv(seedId, -1); F.gift = false; F.plots[i] = {crop:it.crop, plantedAt:Date.now(), wateredAt: F.tools.sprinkler ? Date.now() : null, bonus:0};
  speak(F.tools.sprinkler ? `${CROPS[it.crop].n} planted, and the sprinkler's on it!` : `${CROPS[it.crop].n} planted! Now give it some water.`, 3500); save(true);
}
function waterPlot(i){ const p = F.plots[i]; if (!p || !p.crop || p.wateredAt) return;
  const all = F.tools.can ? F.plots.map((q, j) => q && q.crop && !q.wateredAt ? j : -1).filter(j => j >= 0) : [i];
  all.forEach(j => { F.plots[j].wateredAt = Date.now(); mprop("drop", PLOTS[j].x + 50, PLOTS[j].y + 10); });
  speak(all.length > 1 ? `Big can! ${all.length} plots watered at once.` : "Watered! Growing starts now. Finished quests speed it up.", 4000); save(true); }
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
      ${(t.at || t.treadmill || isTreadTask(t) || t.chat || t.notes || t.email) ? `<p class="stickers">${t.at ? `<span class="sticker">${icon("clock", 14)} ${esc(t.at)}</span>` : ""}${(t.treadmill || isTreadTask(t)) ? `<span class="sticker">${icon("walker", 14)} ${onTread(t) ? "on the treadmill" : "treadmill-able, 1.2 and go"}</span>` : ""}${t.notes ? `<span class="sticker">${icon("note", 14)} notes</span>` : ""}${t.email ? `<span class="sticker">${icon("letter", 14)} email</span>` : ""}${t.chat ? `<span class="sticker">${icon("chat", 14)} happens in chat</span>` : ""}</p>` : ""}
      ${(fs || (S.timer && S.timer.id === t.id)) ? timerHTML(S.timer && S.timer.kind === "deal" ? "five-minute deal, then you may stop" : `${t.minutes || 25}-minute time box`) : `<p class="stickers"><span class="sticker">${icon("clock", 14)} ${t.minutes || 25}-minute time box once you start</span></p>`}
      <ul class="bujo">${fs ? `<li>Keep going. One thing at a time.</li>` : `<li class="first"><span><span class="hl">First step only:</span> ${esc(t.firstStep || "open whatever you need for it. Just open it.")}</span></li><li>Then ${t.minutes || 25} minutes on the rest.</li>`}
        <li class="pep">${esc(t.pep || PEP[t.title.length % PEP.length])}</li></ul>
      ${at ? `<p class="checkin">${fs ? "Tap done when it's done." : "Tap when the first step's done."}</p>` : ""}
      <div class="actions">${!at ? `<button class="btn primary" data-a="walk">Walk to the ${esc(sp.name.toLowerCase())}</button>`
        : fs ? `<button class="btn yes" data-a="done">Quest done</button><button class="btn alt" data-a="notebook">Open the notebook</button>`
        : `<button class="btn primary" data-a="notebook">Do task</button><button class="btn alt" data-a="firstStep">First step done</button>`}
        <button class="btn alt" data-a="proc">I'm procrastinating</button></div>`;
  } else if (ph === "break") {
    const fresh = S.timer && S.timer.kind === "break" && (S.timer.total - tLeft()) < 60e3;
    h += `<h1><span class="lbl">side quest · rest</span>Ten-minute break</h1>${timerHTML("away from the desk")}
      <ul class="bujo"><li>Treadmill counts. Scrolling at your desk doesn't.</li><li>Check the garden, or sit by the pond.</li><li class="pep">Rest is part of the plan.</li></ul>
      <div class="actions"><button class="btn yes" data-a="back">I'm back</button>${!(scene === "base" && atSpot === "pond") ? `<button class="btn alt" data-a="pond">Sit by the pond</button>` : ""}${fresh ? `<button class="btn alt" data-a="flow">I'm in flow</button>` : ""}</div>`;
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
  if (key !== qnKey) { qnKey = key; if (Date.now() > qnQuietUntil) qnOpen = true; }
  const slim = !qnOpen || (route.length > 0 && !(say && say.buttons));
  j.classList.toggle("slim", slim);
  j.innerHTML = h + `<button class="qnx" data-qn="min" aria-label="Fold the note away">–</button>`;
  if (slim) {
    const title = j.querySelector("h1") ? [...j.querySelector("h1").childNodes].filter(n => !(n.classList && n.classList.contains("lbl"))).map(n => n.textContent).join("").trim() : "";
    const when = S.timer ? `<span class="when" data-tleft>${fmt(tLeft())}</span>` : "";
    j.innerHTML = `<button class="qnslim" data-qn="open" aria-label="Open the quest note">${icon("note", 20)} <b>${esc(route.length ? "Walking… " + title : title)}</b>${when}<span class="more">open</span></button>`;
  }
  j.classList.toggle("intop", !outside());
  j.querySelectorAll("[data-qn]").forEach(el => el.onclick = ev => { ev.stopPropagation(); qnOpen = el.dataset.qn === "open"; sfx("paper", true); journal(); });
  j.querySelectorAll("[data-a]").forEach(el => el.onclick = () => { const t = remaining()[0]; A[el.dataset.a](t); });
  j.querySelectorAll("[data-say]").forEach(el => el.onclick = () => { const fn = say.buttons[+el.dataset.say][1]; say.buttons = null; fn(); save(); });
  j.querySelectorAll("[data-dismiss]").forEach(el => el.onclick = () => { S[el.dataset.dismiss] = true; save(); });
  j.querySelectorAll("[data-water2]").forEach(el => el.onclick = () => { S.water2 = true; A.water(); });
}
// One panel over the map. A HUD view (quests / backpack / letters) takes it when opened; otherwise whatever the
// current spot offers (shop, room quest board, garden plot, digest shelf).
function showPanel(hasCtx, skin){
  const views = {quests:"questsView", bag:"bagView", mail:"mailView", friend:"friendView", cal:"calView", settings:"settingsView", chat:"chatView"};
  const view = openView || (hasCtx ? "ctx" : null), p = $("panel");
  if (p.hidden === !!view) sfx("paper", true);
  p.hidden = !view; $("map").classList.toggle("panel-open", !!view);
  if (view === "cal" && !p.dataset.cal) { p.dataset.cal = "1"; renderCal(); } else if (view !== "cal") delete p.dataset.cal;
  if (view === "settings") { $("setMusic").checked = sound.music; $("setVol").value = sound.musicVol; $("setSfx").checked = sound.sfx; }
  ["ctx", "questsView", "bagView", "mailView", "friendView", "calView", "settingsView", "chatView"].forEach(id => $(id).hidden = id !== (views[view] || view));
  p.className = "panel " + (view === "quests" ? "cork" : view === "ctx" ? skin : "paper");
  document.querySelectorAll("[data-open]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.open === openView)));
}
function closePanel(){
  if (openView) { openView = null; ctx(); return; }
  boardOpen = false; shelfOpen = false; selPlot = null; homeView = null; postOpen = false; healthOpen = false; newsOpen = false; if (scene === "market") shopClosed = true; ctx();
}
// Today's calendar panel (Google Calendar via the mcp capability).
async function renderCal(fresh){
  const el = $("calBody");
  document.querySelectorAll("[data-caltab]").forEach(b => { b.setAttribute("aria-selected", String(b.dataset.caltab === calTab)); b.onclick = () => { calTab = b.dataset.caltab; renderCal(); }; });
  $("calTitle").textContent = calTab === "content" ? "Content calendar" : "Today";
  if (calTab === "content") { el.innerHTML = contentHTML(); wireContent(el, () => renderCal()); return; }
  el.innerHTML = `<p class="muted">Opening your calendar…</p>`;
  const r = await todaysEvents(dayKey(), fresh), nowT = Date.now();
  const fmtT = t => new Date(t).toLocaleTimeString("en-GB", {hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Singapore"}).replace(" ", "").toLowerCase();
  let h = `<p class="sub">${new Date(now() + 8*H).toLocaleDateString("en-GB", {weekday: "long", day: "numeric", month: "long", timeZone: "UTC"})}</p>`;
  if (r.error && !r.events.length) h += `<p class="muted">${esc(CAL_ERRORS[r.error] || "Couldn't reach your calendar just now.")}</p>`;
  else if (!r.events.length) h += `<p class="muted">Nothing on the calendar today. A clear runway.</p>`;
  else {
    let nowShown = false;
    h += `<ol class="calday">` + r.events.map(e => {
      let mark = "";
      if (!e.allDay && !nowShown && e.start > nowT) { nowShown = true; mark = `<li class="now"><span>now</span></li>`; }
      const past = !e.allDay && e.end && e.end < nowT;
      return mark + `<li class="${past ? "past" : ""}"><span class="when">${e.allDay ? "all day" : fmtT(e.start)}</span><span class="what"><i style="background:${e.color}"></i><b>${esc(plain(e.title) || e.title)}</b>${e.where ? `<small>${esc(e.where.split("\n")[0].slice(0, 60))}</small>` : ""}<small>${esc(e.cal)}${!e.allDay && e.end ? ` · until ${fmtT(e.end)}` : ""}</small></span>${e.link ? `<a href="${esc(e.link)}" target="_blank" rel="noopener noreferrer" aria-label="Open in Google Calendar">↗</a>` : ""}</li>`;
    }).join("") + (nowShown ? "" : `<li class="now"><span>now</span></li>`) + `</ol>`;
  }
  h += `<div class="actions"><button class="btn alt small" id="calRefresh">Refresh</button></div>`;
  el.innerHTML = h; $("calRefresh").onclick = () => renderCal(true);
}
function itemBtn(id, label, disabled, extra){
  const it = ITEMS[id];
  return `<button class="item" data-id="${id}" ${disabled ? "disabled" : ""}><span class="e">${icon(it.ico, 34)}</span><span class="n">${esc(it.n)}</span><span class="c">${label}</span>${extra || ""}</button>`;
}
function ctx(){
  const c = $("ctx"); let h = "";
  if (homeView && scene === "home") h = hestiaPanel(homeView);
  else if (postOpen && scene === "post") h = postPanel();
  else if (healthOpen && (scene === "chord" || scene === "chico")) h = healthPanel(scene);
  else if (newsOpen && scene === "village") h = goodNewsHTML(myWins());
  else if (scene === "market" && !shopClosed) {
    const tabs = [["seeds","Seeds"],["treats","Treats"],["care","Care"],["family","Family"],["home","Home"],["sell","Sell"]];
    h = `<span class="tape gingham" aria-hidden="true"></span><h2>The market</h2><p class="sub">You have ${icon("coin", 16)} ${F.coins}. Seeds and treats go straight into your backpack.</p>
      <div class="tabs" role="tablist">${tabs.map(([k, n]) => `<button role="tab" data-shop="${k}" aria-selected="${shopTab === k}">${n}</button>`).join("")}</div><div class="items shop">`;
    if (shopTab === "home") {
      h += Object.keys(DECOR).map(id => { const d = DECOR[id], own = F.decorOwned[id], on = own && F.decor[d.slot] === d.val;
        return `<button class="item" data-decor="${id}" ${!own && F.coins < d.price ? "disabled" : ""}><span class="e">${icon(d.ico, 34)}</span><span class="n">${esc(d.n)}</span><span class="c">${on ? "in your home" : own ? "tap to use" : `<b>${d.price}</b> ${icon("coin", 13)}`}</span></button>`; }).join("")
        + `<p class="muted" style="grid-column:1/-1">Bought once, kept forever. They appear inside your house. Tap something you own to swap it in or put it away.</p>`;
    } else if (shopTab === "sell") {
      const sellable = Object.keys(F.inv).filter(id => ITEMS[id] && ITEMS[id].sell);
      h += sellable.length ? sellable.map(id => itemBtn(id, `sell <b>+${ITEMS[id].sell}</b> ${icon("coin", 13)}`, false, `<span class="cnt">×${F.inv[id]}</span>`)).join("") : `<p class="muted" style="grid-column:1/-1">Nothing to sell yet. Grow something in the garden!</p>`;
    } else {
      h += Object.keys(ITEMS).filter(id => ITEMS[id].tab === shopTab).map(id => {
        const it = ITEMS[id], locked = it.need && S.earned < it.need, owned = it.kind === "keep" ? F.fam.owned[id] : it.kind === "tool" && F.inv[id];
        const extra = it.kind === "seed" ? ` · ${dur(CROPS[it.crop].dur)}` : it.to ? ` · ${it.to === "evan" ? "Evan" : "Darren"}` : "";
        return itemBtn(id, locked ? `earn ${it.need} today` : owned ? (it.kind === "keep" ? "at home" : "owned") : `<b>${it.price}</b> ${icon("coin", 13)}${extra}`, locked || owned || F.coins < it.price, F.inv[id] && !owned ? `<span class="cnt">×${F.inv[id]}</span>` : "");
      }).join("");
      if (shopTab === "family") h += `<p class="muted" style="grid-column:1/-1">Little treats go in your backpack: give them in person from there. Keepsakes go straight home and stay forever.</p>`;
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
  } else if (shedOpen) {
    h = `<span class="tape stripe" aria-hidden="true"></span><h2>Darren's shed</h2><p class="sub">You have ${icon("coin", 16)} ${F.coins}. Tools for the garden, bought once and kept forever.${isHere("darren") ? " Darren's around to set them up." : ""}</p><div class="items shop">`
      + Object.keys(SHED).map(id => { const t = SHED[id], own = F.tools[id];
        return `<button class="item" data-tool="${id}" ${own || F.coins < t.price ? "disabled" : ""}><span class="e">${icon(t.ico, 34)}</span><span class="n">${esc(t.n)}</span><span class="c">${own ? "in use" : `<b>${t.price}</b> ${icon("coin", 13)}`}</span><span class="d">${esc(t.what)}</span></button>`; }).join("")
      + `</div><div class="actions"><button class="btn alt small" data-close="1">Close the shed</button></div>`;
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
    const list = outside() ? allTasks() : questsIn(scene), cur = phase() === "task" ? remaining()[0].id : null;
    h = `<span class="tape gingham" aria-hidden="true"></span><h2>${outside() ? "Town quest board" : esc(ROOMS[scene].name) + " quests"}</h2>
      ${list.length ? `<ul class="qlist">${list.map(t => { const dn = S.doneIds.includes(t.id), sp = spotObj(placeOf(t), spotOf(t));
        return `<li class="${dn ? "done" : ""}${t.id === cur ? " cur" : ""}"${!dn && t.id !== cur && phase() !== "clean" ? ` data-next="${esc(t.id)}" role="button"` : ""}><span><b>${esc(t.title)}</b><small>${outside() ? icon(placeOf(t), 16) + " " + esc(VILLAGE[placeOf(t)].name) + " · " : ""}${esc(sp.name)}</small></span>${!dn && t.id !== cur && phase() !== "clean" ? `<button class="next" data-next="${esc(t.id)}">do next</button>` : "<span></span>"}</li>`; }).join("")}</ul>`
        : `<p class="sub">No quests ${outside() ? "today yet" : "in here today"}.</p>`}
      <div class="actions"><button class="btn alt small" data-close="1">Close board</button></div>`;
  }
  c.innerHTML = h;
  if (homeView && scene === "home") wireHestia(c, homeView);
  c.querySelectorAll("[data-postfresh]").forEach(b => b.onclick = () => { fetchPost(true).then(() => { ctx(); drawScene(); }); ctx(); });
  showPanel(!!h, homeView === "fridge" && scene === "home" ? "fridge" : scene === "market" ? "shop" : boardOpen ? "cork" : "paper");
  c.querySelectorAll("[data-shop]").forEach(b => b.onclick = () => { shopTab = b.dataset.shop; ctx(); });
  c.querySelectorAll("[data-decor]").forEach(b => b.onclick = () => decorClick(b.dataset.decor));
  c.querySelectorAll(".item[data-id]").forEach(b => b.onclick = () => {
    const id = b.dataset.id;
    if (scene === "market") { shopTab === "sell" ? sell(id) : buy(id); }
    else if (scene === "farm") plant(selPlot, id);
  });
  c.querySelectorAll("[data-farm]").forEach(b => b.onclick = () => b.dataset.farm === "water" ? waterPlot(selPlot) : harvest(selPlot));
  c.querySelectorAll("[data-next]").forEach(b => b.onclick = ev => { ev.stopPropagation(); doNext(b.dataset.next); });
  c.querySelectorAll("[data-close]").forEach(b => b.onclick = () => { boardOpen = false; shelfOpen = false; shedOpen = false; ctx(); });
  c.querySelectorAll("[data-tool]").forEach(b => b.onclick = () => buyTool(b.dataset.tool));
  c.querySelectorAll("[data-dig]").forEach(b => b.onclick = () => {
    const k = b.dataset.dig;
    if (k === "next") { const d = nextDigest(); if (d && digestReady()) readDigest(d); }
    else if (k === "ask") askJuniper();
    else if (k === "past") { const d = pastDigests()[+b.dataset.i]; if (d) openDigest(d); }
  });
}
function bag(){
  const ids = Object.keys(F.inv).filter(id => ITEMS[id] && F.inv[id] > 0);
  const order = ["gift","food","flower","use","tool","seed"];
  ids.sort((a, b) => order.indexOf(ITEMS[a].kind) - order.indexOf(ITEMS[b].kind));
  $("bag").innerHTML = ids.map(id => { const it = ITEMS[id];
    const lbl = it.kind === "seed" ? "plant in garden" : it.kind === "gift" ? `give to ${it.to === "evan" ? "Evan" : "Darren"}` : it.kind === "tool" ? "use" : it.kind === "food" ? "feed" : it.kind === "flower" ? "give" : "use";
    return itemBtn(id, lbl, it.kind === "seed", it.kind === "tool" ? "" : `<span class="cnt">×${F.inv[id]}</span>`); }).join("");
  $("bag").querySelectorAll(".item").forEach(b => b.onclick = () => useItem(b.dataset.id));
  $("bagHint").textContent = !ids.length ? "Your backpack's empty. Visit the market, or harvest something." : F.gift ? "A welcome gift of seeds is in here. Plant them in the garden." : "";
  $("play").innerHTML = [["pet","Pet"],["hide","Hide-and-seek"],["nap","Nap together"]].map(([k, n]) => `<button class="btn alt small" data-play="${k}">${n}</button>`).join("");
  $("play").querySelectorAll("[data-play]").forEach(b => b.onclick = () => playFree(b.dataset.play));
}
function trackers(){
  $("waterBoxes").innerHTML = progressBarV((S.waterMl || 0)/WATER_GOAL, "#9CC3E0", 8);
  $("stepBoxes").innerHTML = progressBarV(S.steps/STEP_GOAL, "var(--sage)", 5);
  $("waterNote").textContent = S.waterMl ? `${+(S.waterMl/1000).toFixed(2)}L` : "0L";
  $("stepNote").textContent = S.steps >= 1000 ? `${+(S.steps/1000).toFixed(1)}k` : String(S.steps || 0);
}
// Water is kept in ml (goal 2 litres). `water` stays as a glass count (250 ml) because chat reads it.
// Every glass up to a litre earns a coin; every 1,000 steps earns 2.
const GLASS = 250, WATER_GOAL = 2000, STEP_GOAL = 5000;
function setWater(ml){
  ml = clamp(Math.round(ml), 0, 6000); S.waterMl = ml;
  const glasses = Math.floor(ml/GLASS), paid = Math.min(4, S.waterPaid || 0), owed = Math.min(4, glasses);
  if (owed > paid) { earn(owed - paid, "water"); S.waterPaid = owed; }
  S.water = glasses; save();
}
function setSteps(v){
  v = Math.max(0, Math.round(v) || 0); S.steps = v; const ms = Math.floor(v/1000);
  if (ms > S.stepMs) { earn(2*(ms - S.stepMs), "steps"); S.stepMs = ms; }
  speak(v >= STEP_GOAL ? `${v.toLocaleString()}! 5,000 smashed!` : `${v.toLocaleString()}. ${(STEP_GOAL - v).toLocaleString()} to go!`, 5000);
  act(v >= STEP_GOAL ? "cheer" : "nudge"); save();
}
function openSteps(){ openTracker("steps"); }
function hestiaMarks(){
  const g = $("hmarks"); if (!g) return;
  const c = hestiaCounts(), badge = (x, y, n, ico) => `<g transform="translate(${x} ${y})" class="hmark" pointer-events="none"><g class="qmark">${`<circle r="13" fill="#FFF6E2" style="stroke:var(--line)" stroke-width="1.3"/>`}<svg x="-9" y="-10" width="18" height="18" viewBox="0 0 24 24" overflow="visible">${icon(ico, 18).replace(/^<svg[^>]*>|<\/svg>$/g, "")}</svg>${n ? `<circle cx="11" cy="-10" r="7" fill="#E8574C"/><text x="11" y="-6.6" text-anchor="middle" font-size="9.5" font-weight="700" fill="#fff" font-family="Mulish,sans-serif">${n}</text>` : ""}</g></g>`;
  let h = "";
  if (scene === "base" && (c.chores || c.shop)) h = badge(232, 170, c.chores + c.shop, "broom");
  if (scene === "home") {
    const cb = spotObj("home", "cupboard"), fr = spotObj("home", "fridge");
    if (c.chores) h += badge(cb.x, cb.y - 100, c.chores, "broom");
    if (c.shop) h += badge(fr.x, fr.y - 100, c.shop, "fridge");
  }
  g.innerHTML = h;
}
function questMark(){
  const ph = phase(), m = $("qmarkWrap");
  let target = null;
  if (ph === "clean" && !atClean()) target = {pl:"home", sp:"cupboard"};
  if (ph === "task") { const t = remaining()[0]; if (!arrivedFor(t)) target = {pl:placeOf(t), sp:spotOf(t)}; }
  let pos = null;
  if (target) {
    if (outside() && target.pl === "base") pos = scene === "base" ? (() => { const v = VILLAGE[target.sp]; return v.mark || [v.door[0], v.door[1] - 64]; })() : VILLAGE[BRIDGES[scene].base].mark;
    else if (outside()) pos = VILLAGE[target.pl].scene === scene ? VILLAGE[target.pl].mark : VILLAGE[BRIDGES[scene][outdoorOf(target.pl)]].mark;
    else if (scene === target.pl) { const s = spotObj(scene, target.sp); pos = [s.x, s.y - 70]; }
    else pos = [260, 582];
  }
  if (!pos) { m.style.display = "none"; return; }
  m.style.display = ""; m.setAttribute("transform", `translate(${pos[0]} ${pos[1]})`);
}
function drawScene(){
  const day = dayKey(), wet = outside() && rainyOn(day), fest = festivalOn(day);
  $("rain").hidden = !wet;
  if (scene === "village" && fest && S.festSaid !== day) { S.festSaid = day; setTimeout(() => speak(`${fest.name} decorations are up in the town square!`, 5000), 1500); }
  else if (scene === "base" && S.hestiaSaid !== day && hestiaCounts().chores) { S.hestiaSaid = day; const n = hestiaCounts().chores; setTimeout(() => speak(`${n} home chore${n > 1 ? "s" : ""} waiting in the cleaning cupboard. No rush.`, 5000), 2600); }
  else if (scene === "base" && isWeekend() && S.weekendSaid !== day) { S.weekendSaid = day; setTimeout(() => speak("Weekend! Home things happen here at home. Any work quests still wait in town.", 5500), 2200); }
  else if (wet && S.rainSaid !== day) { S.rainSaid = day; setTimeout(() => speak("Rainy day! Perfect for cosy indoor quests.", 4500), 1500); }
  $("sceneArt").innerHTML = scene === "village" ? villageArt() : scene === "base" ? baseArt() : scene === "farm" ? farmArt() : roomArt(scene);
  const names = {village:"Town square", base:"Home base", farm:"The garden"};
  $("sceneName").innerHTML = `<span>${esc(names[scene] || ROOMS[scene].name)}</span>${!outside() ? `<span style="font-family:Mulish,sans-serif;font-size:.85rem">tap Exit to leave</span>` : ""}`;
  $("maphint").textContent = scene === "village" ? "Tap a building to go inside. The bridge at the bottom goes home." : scene === "base" ? "Tap anywhere to walk. The bridge at the top goes to the town square." : scene === "farm" ? "Tap a plot to plant, water or harvest." : scene === "market" ? "Tap the counter to open the shop." : "Tap furniture to walk to it. The board on the wall lists this building's quests.";
}
function render(redraw){
  if (S.day !== dayKey()) S = freshToday();
  if (redraw) drawScene();
  const L = level(), next = LEVELS[L+1];
  $("title").firstChild.textContent = `${F.name}'s village`;
  $("trayName").textContent = F.name; if (document.activeElement !== $("paperNameIn")) $("paperNameIn").placeholder = paperName(); $("friendName").textContent = F.name;
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
    <p class="muted">${esc(F.name)} is your ${LEVELS[L].name}. ${next ? `Next up: ${next.name}${next.gift ? `, which brings ${next.gift}` : ""}.` : "Friendship maxed!"} ${F.days || 0} day${F.days === 1 ? "" : "s"} together. It grows when you show up, feed, play and garden, and never goes down.</p>
    <h3 class="ph3">Village upgrades</h3>
    <p class="muted">${F.totalQuests || 0} quests finished so far. ${(() => { const nx = nextUpgrade(F.totalQuests || 0); return nx ? `Next at ${nx.at}: ${esc(nx.name)}.` : "Every upgrade unlocked!"; })()}</p>
    <ul class="uplist">${UPGRADES.map(u => `<li class="${(F.totalQuests || 0) >= u.at ? "got" : ""}">${icon((F.totalQuests || 0) >= u.at ? "sparkle" : "clock", 16)} <span>${esc(u.name)}</span> <small>${u.at}</small></li>`).join("")}</ul>`;
  $("friendBody").insertAdjacentHTML("beforeend", `<h3 class="ph3">Family</h3><p class="muted">${icon("heart", 14)} Gifts for Evan: ${F.fam.gifts.evan} · for Darren: ${F.fam.gifts.darren}. Every third gift, they give you something back. Treats and keepsakes are in the market's Family tab.</p>`);
  renderEvanHold();
  const all = allTasks(), rem = remaining(), cur = (phase() === "task" && rem[0]) ? rem[0].id : null;
  $("logSum").textContent = all.length ? `All quests · ${rem.length} left` : "All quests";
  $("qBadge").hidden = !rem.length; $("qBadge").textContent = rem.length;
  $("list").innerHTML = all.map(t => { const dn = S.doneIds.includes(t.id);
    const pickable = !dn && t.id !== cur && phase() !== "clean";
    return `<li class="${dn ? "done" : ""}${t.id === cur ? " cur" : ""}${pickable ? " pick" : ""}"${pickable ? ` data-pick="${esc(t.id)}" role="button" tabindex="0"` : ""}><span class="pl">${icon(placeOf(t), 20)}</span><span class="t">${dn ? "× " : ""}${esc(t.title)}</span><small>${esc(VILLAGE[placeOf(t)].name)} · ${esc(spotObj(placeOf(t), spotOf(t)).name)}${t.id === cur ? " · doing now" : ""}${!dn ? ` <button class="drop" data-drop="${esc(t.id)}" aria-label="Not needed today: remove from today's quests">not today</button>` : ""}</small>${pickable ? `<button class="next" data-next="${esc(t.id)}">do this now</button>` : "<span></span>"}</li>`; }).join("")
    + ((S.dropped || []).length ? `<li class="dropped"><small>Dropped today: ${(S.dropped || []).map(id => { const t = ((P && P.tasks) || []).find(x => x.id === id); return t ? `${esc(t.title)} <button class="drop" data-undrop="${esc(id)}">bring back</button>` : ""; }).filter(Boolean).join(" · ")}</small></li>` : "");
  $("list").querySelectorAll("[data-drop]").forEach(el => el.onclick = ev => { ev.stopPropagation(); dropTask(el.dataset.drop); });
  $("list").querySelectorAll("[data-undrop]").forEach(el => el.onclick = ev => { ev.stopPropagation(); undropTask(el.dataset.undrop); });
  $("list").querySelectorAll("[data-next]").forEach(el => el.onclick = ev => { ev.stopPropagation(); doNext(el.dataset.next); });
  $("list").querySelectorAll("[data-pick]").forEach(el => el.onclick = () => doNext(el.dataset.pick));
  const pin = $("paperIn"), paper = paperWaiting(); if (pin) pin.style.display = paper ? "" : "none";
  if (scene === "base" && paper && S.paperSaid !== paper.id) { S.paperSaid = paper.id; setTimeout(() => speak(`${paperName()} is in the letterbox!`, 4500), 1800); }
  hestiaMarks(); questMark(); journal(); ctx(); bag(); trackers(); mailCard(); sunsamaLine(); refreshNotebook();
}
/* =================== WORLD SIM =================== */
const mel = {x:VILLAGE.home.door[0], y:VILLAGE.home.door[1], tx:VILLAGE.home.door[0], ty:VILLAGE.home.door[1], dir:1, moving:false};
const maple = {x:mel.x - 24, y:mel.y + 2, tx:mel.x - 24, ty:mel.y + 2, dir:1, moving:false};
const evan = {x:250, y:360, tx:250, ty:360, dir:1, moving:false, run:false, wait:2};
let route = [], keys = new Set();
const svg = $("world");
const evanHere = () => scene === "base" || scene === "home";
function outside(){ return OUTDOOR.includes(scene); }
const bounds = () => scene === "village" ? [14, 150, W - 14, 598] : scene === "base" ? [14, 114, W - 14, HH - 14] : [34, 168, W - 34, 612];

function setScene(id, at){
  const w = $("world"); w.classList.add("fading");
  setTimeout(() => {
    scene = id; cam.snap = true; atSpot = null; boardOpen = false; shelfOpen = false; selPlot = null; openView = null; shopClosed = false; shedOpen = false; homeView = null; postOpen = false; healthOpen = false; newsOpen = false; resetNpcs();
    if (id === "post") fetchPost().then(() => { if (scene === "post") drawScene(); });
    const p = at || [260, 596];
    mel.x = mel.tx = p[0]; mel.y = mel.ty = p[1]; mel.path = []; maple.x = maple.tx = p[0] - 22; maple.y = maple.ty = p[1] + 2;
    if (id === "base") { evan.x = evan.tx = 300; evan.y = evan.ty = 360; }
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
  const cur = scene;
  if (cur !== target) {
    const curOut = outdoorOf(cur), tOut = outdoorOf(target);
    // 1. out of the building, 2. over the bridge if the target is on the other screen, 3. in at the target's door
    if (!OUTDOOR.includes(cur)) legs.push({scene:cur, x:260, y:606, fn:() => setScene(curOut, VILLAGE[cur].door)});
    if (curOut !== tOut) { const b = VILLAGE[BRIDGES[curOut][tOut]]; legs.push({scene:curOut, x:b.door[0], y:b.door[1], fn:() => setScene(tOut, ARRIVE[tOut])}); }
    if (!OUTDOOR.includes(target)) { const d = VILLAGE[target].door; legs.push({scene:tOut, x:d[0], y:d[1], fn:() => setScene(target, target === "farm" ? [260, 590] : [260, 596])}); }
  }
  legs.push({scene:target, x, y, fn});
  route = legs; atSpot = null; boardOpen = false; shelfOpen = false; shedOpen = false; homeView = null; postOpen = false; healthOpen = false; newsOpen = false; openView = null; nextLeg(); render();
}
function nextLeg(){
  const l = route[0]; if (!l || l.scene !== scene) return;
  walkTo(l.x, l.y); mel.force = true;
}
// Outdoors Mel walks round buildings and the pond (paths.js); indoors she goes straight.
function walkTo(x, y){
  const b = bounds(), to = [clamp(x, b[0], b[2]), clamp(y, b[1], b[3])];
  const pts = outside() ? findPath(scene, [mel.x, mel.y], to, b) : [to];
  const first = pts.shift(); mel.tx = first[0]; mel.ty = first[1]; mel.path = pts;
}
function arriveSpot(id){
  atSpot = id;
  const ph = phase();
  if (id === "digest") { shelfOpen = true; speak(digestReady() ? (isHere("juniper") ? "Juniper's waving a digest at you!" : "A fresh digest is ready on the shelf.") : "Digests are rationed. Like dessert.", 3500); render(); return; }
  if (id === "stall") { shopClosed = false; render(); return; }
  if (id === "status") { healthOpen = true; sfx("paper"); render(); return; }
  if (id === "pobox") { postOpen = true; sfx("paper"); render(); fetchPost().then(() => { ctx(); drawScene(); }); return; }
  if (id === "board" && outside()) { openView = "quests"; speak("All of today's quests!", 3500); render(); return; }
  if (id === "board") { boardOpen = true; speak(outside() ? "All of today's quests!" : "Here's what needs doing in here.", 3500); render(); return; }
  if (ph === "clean" && scene === "home" && id === "cupboard" && !S.wipe) { setSay("Wet wipes live here. Grab one!"); render(); return; }
  // Hestia: the cupboard holds the chores, the fridge the pantry and shopping list (not quests)
  if (scene === "home" && (id === "cupboard" || id === "fridge") && !(ph === "task" && placeOf(remaining()[0]) === "home" && spotOf(remaining()[0]) === id && !S.arrived[remaining()[0].id])) {
    homeView = id === "fridge" ? "fridge" : "chores"; sfx(id === "fridge" ? "tap" : "paper"); render(); return; }
  if (ph === "task") {
    const t = remaining()[0];
    if (placeOf(t) === scene && spotOf(t) === id && !S.arrived[t.id]) { S.arrived[t.id] = true; setSay(`Here at the ${spotObj(scene, id).name.toLowerCase()}. First tiny step…`); save(); return; }
  }
  const s = spotObj(scene, id); if (s) speak(s.line, 3500); render();
}
function arriveVillageSpot(id){
  atSpot = id;
  const v = VILLAGE[id];
  if (v.bridge) { atSpot = null; setScene(v.bridge, ARRIVE[v.bridge]); return; }
  // an outdoor quest at home base (Evan outing at the swing, garden jobs at the shed, a walk by the pond)
  if (scene === "base" && phase() === "task") { const t = remaining()[0];
    if (placeOf(t) === "base" && spotOf(t) === id && !S.arrived[t.id]) { S.arrived[t.id] = true; setSay(`Here at the ${v.name.toLowerCase()}. First tiny step…`); save(); return; } }
  if (id === "swing") { evan.tx = 112 + rnd(-4, 4); evan.ty = 302; evan.run = true; evan.wait = 6; setTimeout(() => evanSays(pick(["wheee!", "push me!", "higher!"])), 900); speak(v.line, 3500); render(); return; }
  if (id === "letterbox") { const p = paperWaiting(); if (p) { sfx("paper"); openMail(p); } else speak(`Nothing in the letterbox. ${paperName()} comes each morning.`, 3800); render(); return; }
  if (id === "news") { newsOpen = true; const g = goodNews(); if (g) F.goodRead = g.at; sfx("paper"); save(true); return; }
  if (id === "shed") { shedOpen = true; speak(v.line, 3800); render(); return; }
  if (id === "bench") { speak(v.line, 3800); render(); return; }
  if (id === "well") { A.water(); return; }
  if (id === "board") { arriveSpot("board"); return; }
  if (id === "pond") { speak(phase() === "break" ? "Perfect break spot. Breathe." : VILLAGE.pond.line, 4000); render(); }
}
function toWorld(ev){ const r = $("map").getBoundingClientRect(); return [(ev.clientX - r.left - cam.ox)/cam.s, (ev.clientY - r.top - cam.oy)/cam.s]; }
svg.addEventListener("click", ev => {
  const npc = ev.target.closest("[data-npc]");
  if (npc) { tapNpc(npc.dataset.npc); return; }
  const ug = ev.target.closest("[data-ugarden]");
  if (ug) { const k = ug.dataset.ugarden, st = ST[k] || {}; speak(`${(st.users || 0).toLocaleString()} ${st.label || (k === "chord" ? "studios" : "families")} use ${k === "chord" ? "Chord" : "Chico"}! One flower for every ${st.per > 0 ? st.per : 10}.`, 4500); return; }
  const ent = ev.target.closest("[data-ent]");
  if (ent && ent.dataset.ent === "evan") { evanSays(pick(["Mama!", "hug!", "hehe!", "up up!"])); mprop("heart", evan.x, evan.y - 40); evan.tx = mel.x + 16; evan.ty = mel.y + 4; evan.run = true; return; }
  if (ent && ent.dataset.ent === "maple") { sfx("purr"); if (Math.random() < .35) { hearts(2); speak("Purr… treats and toys are in your backpack. Tap the bag up top!", 4000); return; } hearts(2); speak(pick(["*leans into the pat*", "Happy fox noises!", "More pats please."]), 3000); return; }
  const pl = ev.target.closest("[data-place]");
  if (pl && outside()) {
    const id = pl.dataset.place, v = VILLAGE[id];
    if (v.spot) go(scene, v.door[0], v.door[1], () => arriveVillageSpot(id));
    else go(id, 260, id === "farm" ? 560 : 560, null);
    return;
  }
  const sp = ev.target.closest("[data-spot]");
  if (sp) { const s = spotObj(scene, sp.dataset.spot); go(scene, s.tx, s.ty, () => arriveSpot(s.id)); return; }
  if (ev.target.closest("[data-exit]")) { go(outdoorOf(scene), VILLAGE[scene].door[0], VILLAGE[scene].door[1] + 10, null); return; }
  const pt = ev.target.closest("[data-plot]");
  if (pt) { const i = +pt.dataset.plot, p = PLOTS[i]; go("farm", p.x + p.w/2, p.y + p.h + 18, () => { selPlot = i; atSpot = "plot"; ctx(); const s = F.plots[i]; speak(!s || !s.crop ? "Empty plot. What shall we grow?" : !s.wateredAt ? "Thirsty seeds!" : growth(s) >= 1 ? "Ready to pick!" : "Growing nicely.", 3000); }); return; }
  const [x, y] = toWorld(ev);
  // Fingers miss small people: a tap close to a villager or messenger counts as tapping them.
  const near = npcActors().map(([n, e]) => [n, Math.hypot(e.x - x, (e.y - 30) - y)]).filter(([, d]) => d < 34).sort((a, b) => a[1] - b[1])[0];
  if (near) { tapNpc(near[0].dataset.npc); return; }
  route = []; atSpot = null;
  if (qnOpen && phase() !== "clean") { qnOpen = false; journal(); }   // tapping the map to wander folds the note away
  walkTo(x, y);
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
  if (outside()) return Object.keys(VILLAGE).find(k => VILLAGE[k].scene === scene && Math.hypot(VILLAGE[k].door[0] - mel.x, VILLAGE[k].door[1] - mel.y) < 22) || null;
  if (scene === "farm") return null;
  const list = [...stationsOf(scene), scene !== "market" ? {id:"board", tx:260, ty:200} : null].filter(Boolean);
  const s = list.find(s => Math.hypot(s.tx - mel.x, s.ty - mel.y) < 26); return s ? s.id : null;
}
const EVAN_SPOTS = {base:[[260,350],[200,360],[330,360],[150,330],[230,420],[160,540],[300,600],[380,580],[240,560],[420,340]], home:[[150,500],[330,520],[260,340],[200,600],[360,330]]};
function tickEvan(dt){
  if (!evanHere()) return;
  if (stepTo(evan, evan.run ? 130 : 70, dt)) {
    evan.wait -= dt;
    if (evan.wait <= 0) {
      const r = Math.random(), b = bounds();
      if (scene === "base" && phase() === "break" && r < .5) { evan.tx = 350 + rnd(-20, 30); evan.ty = 560 + rnd(-6, 8); evan.run = false; }
      else if (r < .3) { evan.tx = clamp(mel.x + rnd(-24, 24), b[0], b[2]); evan.ty = clamp(mel.y + rnd(4, 16), b[1], b[3]); evan.run = true; evan.target = "mel"; }
      else if (r < .5) { evan.tx = clamp(maple.x + rnd(-18, 18), b[0], b[2]); evan.ty = clamp(maple.y + rnd(2, 12), b[1], b[3]); evan.run = true; evan.target = "maple"; }
      else if (scene === "base" && F.fam.owned.sandpit && r < .75) { evan.tx = 236 + rnd(-10, 10); evan.ty = 530 + rnd(-3, 3); evan.run = true; evan.target = null; if (Math.random() < .4) setTimeout(() => evanSays(pick(["dig dig!", "sandcastle!", "look Mama!"])), 1500); }
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
// Camera. Screen = scene * cam.s + (cam.ox, cam.oy). On a phone (map box narrower than the 520x640 scene) the camera
// follows Mel at full height; "zoomed out" (cam.fit) shows the whole map at once. Panning slides the already-drawn
// SVG with a GPU transform: re-filtering the hand-drawn scene every frame made phones flicker and drop outlines.
const cam = {x: 0, s: 1, ox: 0, oy: 0, top: 0, snap: true, key: "", fit: false, canFollow: false};
try { cam.fit = localStorage.getItem("fox.zoom") === "out"; } catch {}
function updateCam(dt){
  const m = $("map"), cw = m.clientWidth, ch = m.clientHeight; if (!cw || !ch) return;
  cam.canFollow = cw/ch < W/HH - .005;
  if (cam.canFollow && !cam.fit) {
    const s = ch/HH, vw = cw/s, tx = clamp(mel.x - vw/2, 0, W - vw);
    cam.x = cam.snap ? tx : cam.x + (tx - cam.x)*Math.min(1, dt*3.2);
    cam.s = s; cam.ox = -cam.x*s; cam.oy = 0;
  } else {
    const s = Math.min(cw/W, (ch - cam.top)/HH);
    cam.s = s; cam.ox = (cw - W*s)/2; cam.oy = Math.max(cam.top, (ch - HH*s)/2); cam.x = 0;
  }
  cam.snap = false;
  const ox = Math.round(cam.ox), oy = Math.round(cam.oy), key = `${ox},${oy},${cw}x${ch},${cam.s.toFixed(4)}`;
  if (key !== cam.key) {
    cam.key = key;
    svg.style.width = (W*cam.s) + "px"; svg.style.height = (HH*cam.s) + "px"; svg.style.transform = `translate3d(${ox}px,${oy}px,0)`;
    const z = $("zoomBtn"); if (z) { z.hidden = !cam.canFollow; z.setAttribute("aria-label", cam.fit ? "Zoom in" : "Zoom out to see the whole map"); z.innerHTML = icon(cam.fit ? "zoomIn" : "zoomOut", 26); }
  }
}
function toggleZoom(){ cam.fit = !cam.fit; cam.snap = true; cam.key = ""; try { localStorage.setItem("fox.zoom", cam.fit ? "out" : "in"); } catch {} }
function measureHud(){
  const sb = document.querySelector(".scenebar"), m = $("map");
  cam.top = getComputedStyle(sb).position === "fixed" ? Math.max(0, sb.getBoundingClientRect().bottom - m.getBoundingClientRect().top + 4) : 0;
  m.style.setProperty("--ovTop", (cam.top ? cam.top + 4 : 8) + "px");
  cam.key = "";
}
addEventListener("resize", () => { cam.snap = true; measureHud(); });
// overflow:hidden boxes can still be scrolled by focus or scrollIntoView; keep the map pinned
$("map").addEventListener("scroll", () => { const m = $("map"); if (m.scrollLeft || m.scrollTop) { m.scrollLeft = 0; m.scrollTop = 0; } });
function bubbleAt(el, ex, ey, off, forceBelow){
  if (el.hidden) return;
  const wrap = $("map"), cw = wrap.clientWidth, sc = cam.s;
  const bw = el.offsetWidth, bh = el.offsetHeight, px = ex*sc + cam.ox, py = (ey - off)*sc + cam.oy;
  const left = clamp(px, bw/2 + 2, cw - bw/2 - 2);
  el.style.left = left + "px"; el.style.setProperty("--tail", clamp(px - left + bw/2, 16, bw - 16) + "px");
  const roomBelow = (ey + 8)*sc + cam.oy + 10 + bh < wrap.clientHeight + 4;
  const below = (forceBelow && roomBelow) || py - bh - 10 < cam.top - 6; el.classList.toggle("below", below);
  el.style.top = (below ? (ey + 8)*sc + cam.oy + 10 : py - 10) + "px";
}
let last = performance.now();
function frame(now){
  const dt = Math.min(.05, (now - last)/1000); last = now;
  if (keys.size) {
    const v = 190*dt, b = bounds(); let dx = 0, dy = 0;
    if (keys.has("l")) dx -= v; if (keys.has("r")) dx += v; if (keys.has("u")) dy -= v; if (keys.has("d")) dy += v;
    mel.path = [];
    let nx = clamp(mel.x + dx, b[0], b[2]), ny = clamp(mel.y + dy, b[1], b[3]);
    if (outside() && blocked(scene, nx, ny)) { if (!blocked(scene, nx, mel.y)) ny = mel.y; else if (!blocked(scene, mel.x, ny)) nx = mel.x; else { nx = mel.x; ny = mel.y; } }
    mel.tx = nx; mel.ty = ny;
  }
  const arrived = stepTo(mel, keys.size ? 190 : 220, dt);
  if (arrived && !keys.size && mel.path && mel.path.length) { const n = mel.path.shift(); mel.tx = n[0]; mel.ty = n[1]; mel.moving = true; }
  else if (arrived && !keys.size && (mel.wasMoving || mel.force)) {
    mel.force = false;
    if (route.length && route[0].scene === scene) { const l = route.shift(); if (l.fn) l.fn(); else { atSpot = null; render(); } if (route.length && route[0].scene === scene) nextLeg(); }
    else if (!route.length) {
      const n = nearSpot();
      if (n) { if (outside()) { const v = VILLAGE[n]; if (v.spot) arriveVillageSpot(n); else go(n, 260, 560, null); } else arriveSpot(n); }
      else if (!outside() && scene !== "farm" && mel.y > 592) go(outdoorOf(scene), VILLAGE[scene].door[0], VILLAGE[scene].door[1] + 10, null);
      else if (scene === "farm" && mel.y > 592 && Math.abs(mel.x - 260) < 50) go("base", VILLAGE.farm.door[0], VILLAGE.farm.door[1] + 10, null);
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
  const close = Math.hypot(maple.x - mel.x, maple.y - mel.y) < 60;
  bubbleAt($("speech"), close ? (maple.x*0.35 + mel.x*0.65) : maple.x, close ? Math.min(maple.y, mel.y) : maple.y, close ? 76 : (sleeping ? 18 : 30));
  if (evanHere()) bubbleAt($("evanSay"), evan.x, evan.y, 40); else $("evanSay").hidden = true;
  requestAnimationFrame(frame);
}

/* =================== WIRING =================== */
document.querySelectorAll("[data-track]").forEach(b => b.onclick = () => openTracker(b.dataset.track));
$("addForm").onsubmit = e => {
  e.preventDefault(); const title = $("addTitle").value.trim(); if (!title) return;
  S.extra.push({id:"x" + Date.now().toString(36), title, minutes: Math.min(180, Math.max(5, parseInt($("addMin").value, 10) || 25))});
  $("addTitle").value = ""; $("addMin").value = ""; save(true);
};
$("paperSave").onclick = () => { const v = $("paperNameIn").value.trim(); F.paperName = v; $("paperNameIn").value = ""; $("paperNameIn").placeholder = paperName(); sfx("paper"); speak(v ? `Hot off the press: ${v}!` : "Back to The Morning Crier.", 4000); save(); };
$("paperNameIn").placeholder = paperName();
$("nameSave").onclick = () => { const v = $("nameIn").value.trim(); if (v) { F.name = v; $("nameIn").value = ""; act("cheer"); speak(`Hi! I'm ${v} now 🦊`, 4000); save(); } };
$("pet").onclick = () => { sfx("purr"); hearts(2); speak(pick(["*leans into the pat*", "Happy fox noises!", "More pats please.", "You're my favourite human."]), 3000); };

document.querySelectorAll("[data-ico]").forEach(el => el.insertAdjacentHTML("afterbegin", icon(el.dataset.ico, +el.dataset.size || 20)));
$("pclose").onclick = closePanel;
$("chatForm").onsubmit = e => { e.preventDefault(); const v = $("chatIn").value; $("chatIn").value = ""; sendChat(v); };
$("zoomBtn").onclick = () => toggleZoom();
$("setMusic").onchange = e => setMusic(e.target.checked);
$("setVol").oninput = e => setMusicVol(+e.target.value);
$("setTest").onclick = () => { unlockAudio(); setTimeout(() => { alarm(); $("setTestNote").textContent = audioRunning() ? "Sound is on. If you heard nothing, check the volume and the silent switch." : "Your browser is still blocking sound. Tap anywhere on the map, then try again."; }, 120); };
$("setSfx").onchange = e => { setSfx(e.target.checked); if (e.target.checked) sfx("coin"); };
["pointerdown", "keydown"].forEach(t => document.addEventListener(t, () => { qnQuietUntil = 0; }, {capture: true, once: true}));
document.querySelectorAll("[data-open]").forEach(b => b.onclick = () => { openView = openView === b.dataset.open ? null : b.dataset.open; ctx();
  if (openView === "chat") { renderChat(); setTimeout(() => $("chatIn").focus(), 60); } });
initNotebook({windDown, onTread, water:() => ({ml: S.waterMl || 0, goal: WATER_GOAL, glass: GLASS}), steps:() => ({n: S.steps, goal: STEP_GOAL}),
  addWater:ml => A.water(ml), setWater, setSteps, task:() => phase() === "task" ? remaining()[0] : null, S:() => S, F:() => F, fs:t => !!S.firstStep[t.id], act:nbAct, timerLeft,
  sayNow:() => say, timerBtns, paperName, sample:() => sampleCap, sampleDenied:() => { sampleCap = null; }, sayButton, markRead, agentName, onClose:() => render(),
  placeLabel:t => `${VILLAGE[placeOf(t)].name} · ${spotObj(placeOf(t), spotOf(t)).name}`});
initHestia({sfx, alarm, speak, flash, earn: (n, why) => { earn(n, why); save(); }, changed: () => render(),
  refund: (n, why) => { F.coins = Math.max(0, F.coins - n); S.earned = Math.max(0, (S.earned || 0) - n); flash(`-${n} coin: ${why}`); save(); }});
$("hestiaFile").onchange = e => { const f = e.target.files && e.target.files[0]; if (!f) return; const r = new FileReader();
  r.onload = () => { const msg = importHestia(String(r.result)); $("hestiaNote").textContent = msg; speak(/^Imported/.test(msg) ? "Hestia's lists are in the house now!" : msg, 4500); }; r.readAsText(f); e.target.value = ""; };
initNpcs({sfx, chatted:n => { if (!S.chats.includes(n)) { S.chats.push(n); save(); } }, scene:() => scene, bounds, mel, evan, F:() => F, S:() => S, save:() => save(), facts, bubble:bubbleAt, evanSays, unreadMail,
  openMail:item => openMail(item), gift:id => { addInv(id, 1); flash(`Auntie Lin gave you ${ITEMS[id].n.toLowerCase()}`); save(); }});
measureHud();
render(true);
if (F.gift) setTimeout(() => speak("A welcome gift! Seeds are in your backpack 🌷", 5000), 1200);
requestAnimationFrame(frame);
initDb();
