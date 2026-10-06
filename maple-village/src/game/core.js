// Game core: state + persistence, quest flow, actions, UI renderers and the world sim.
import { H, M, W, HH, now, dayKey, sgHM, prevDay, $, esc, pick, rnd, clamp, dur, plain } from "../util.js";
import { icon, progressBar, progressBarV } from "../art/icons.js";
import { VILLAGE, WORK, ROOMS, MAPLE_BED, OUTDOOR, BRIDGES, ARRIVE, INNER, nextHop, outdoorOf, isWeekend, stationsOf, spotObj, placeOf, spotOf, isTreadTask } from "../data/world.js";
import { CROPS, ITEMS, DECOR, PLOTS, QUEST_BOOST, LEVELS, PEP, YAY, itemIco, seasonOf, SEASONS } from "../data/items.js";
import { UPGRADES, unlocked, nextUpgrade, festivalOn, rainyOn } from "../art/village-extras.js";
import { foreArt, villageArt, baseArt, laneArt, roomArt, farmArt, vineyardArt, orchardArt, flowerFarmArt, setArtContext } from "../art/scenes.js";
import { vineSpot } from "../art/vineyard.js";
import { kitchenState, sendToKitchen, isGood, larderPanel, ovenPanel, pressPanel, stovePanel, wireKitchen, staffDinner, staffLine, tapasToday, TAPAS, cookTick, cookLine } from "./kitchen.js";
import { questBoost } from "./vineyard.js";
import { vineState, sellTick, vinePanel, stallPanel, barrelPanel, shelfPanel, counterPanel, boxPanel, cafePanel, olivePanel, wireVine, shelfStock, vineyardName, shopName, serveGuest } from "./vineyard.js";
import { AGENTS, NPCS } from "../data/npcs.js";
import { initNotebook, openTask, openMail, openDigest, openTracker, closeNotebook, refreshNotebook, notebookOpen } from "../ui/notebook.js";
import { pullSunsama, SUNSAMA_ERRORS, SUNSAMA, completeInSunsama, subtaskInSunsama } from "./sunsama.js";
import { unlockAudio, audioRunning, sfx, alarm, settings as sound, setMusic, setMusicVol, setSfx, TRACKS, setTrack, currentTrack } from "./audio.js";
import { todaysEvents, CAL_ERRORS } from "./calendar.js";
import { findPath, blocked } from "./paths.js";
import { fetchPost, postPanel, postCount } from "./postbox.js";
import { attachFeeds, health, healthPanel, contentHTML, wireContent, goodNews, goodNewsHTML } from "./feeds.js";
import { initHestia, attachHestiaDb, hestiaPanel, wireHestia, hestiaCounts, importHestia, chatLastDone, lastDueCount, chatAddShopping, chatRestock, chatAddChore, chatTickChore, chatTidyTimer, hestiaSummary } from "./hestia.js";
import { ensurePets, addAnimal, feedOne, upgradeRun, runPanel, roomLeft, hungry, hungryCount, KINDS } from "./pets.js";
import { wardrobePanel, newOutfit } from "./wardrobe.js";
import { readPlan, PLAN_WORDS } from "./plans.js";
import { loadClients, clientsPanel, askClients } from "./clients.js";
import { loadPlans, planningPanel, askPlans } from "./planning.js";
import { revenueNow, loadRevenue, revenuePanel, wireRevenue } from "./revenue.js";
import { attachJars, jarsPanel, makeJar, emptyJar, jarById, addCustom, palette as jarPalette, shelf as jarShelf, MAX_BLOBS, MAX_KINDS } from "./jars.js";
import { addJarEntry, removeEntry, journalCount, addEntry, journalSince } from "./myroom.js";
import { reviewPanel, wireReview, loadObjectives, rw as rvw, weekStart } from "./review.js";
import { attachMyDocs, journalPanel, wireJournal, scratchPanel, wireScratch } from "./myroom.js";
import { attachVaults, vaultPanel, bankOverview, wireVault, bv, jarAt, allJars, deposit as vaultDeposit, jarByLabel, fullCounts, money as vaultMoney } from "./bank.js";
import { attachLetters, lettersPanel, wireLetters, lv, writtenSince, arrived as lettersArrived, announce as lettersAnnounce, writeReplies } from "./letters.js";
import { vz, fountainPanel, wireFountain } from "./vision.js";
import { reached, award, onPedestals, nextUp, pedestalPanel, bookPanel, wireTrophies, affirmPanel, wireAffirm, dailyAffirmations, PEDESTALS, trophySVG } from "./trophies.js";
import { attachRoutines, routinesPanel, wireRoutines, rv, setRoutine, todaysSteps, checklistLeft, weekRoutines } from "./routines.js";
import { attachKudos, kudosPanel, wireKudos, kv, addKudos, kudosCount } from "./kudos.js";
import { loadDesk, deskPanel, wireDesk } from "./desk.js";
import { kid, kidPanel, wireKid, stopKidGame, SNACKS, snackPic, EVAN_TAPS, pickSay } from "./kid.js";
import { addReminder, cancelReminder, upcoming as upcomingReminders, dueNow, fmtWhen } from "./reminders.js";
import { initNpcs, tickNpcs, tapNpc, npcActors, resetScene as resetNpcs, courierDelivered, isHere, whereIs, npcSay, npcPos } from "./npcs.js";
import { dishArt, glassArt } from "../art/wine.js";
import { fieldArt } from "../art/field.js";
import { orchState, orchTick, handTin, spotPanel, shopPanel, potPanel, teaPanel, wireOrchard, stateOf } from "./orchard.js";
import { TREES, FLOWERS, TREE_ROWS, TREE_XS, BUSH_Y, BED_ROWS, FLOWER_XS } from "../data/orchard.js";
import { tourNow } from "./tours.js";

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
  ensurePets(F);
  if (!F.early || typeof F.early !== "object") F.early = {};
  if (!Array.isArray(F.plots) || F.plots.length !== 12) F.plots = Array.from({length:12}, () => null);
  if (!F.cool) F.cool = {};
  ["met", "gifts", "mailRead"].forEach(k => { if (!F[k]) F[k] = {}; });
  F.digest = Object.assign({read:{}, lastAt:0, mine:[]}, F.digest || {});
  ["decor", "decorOwned", "history"].forEach(k => { if (!F[k] || typeof F[k] !== "object") F[k] = {}; });
  if (!Array.isArray(F.upgradeLog)) F.upgradeLog = [];
  if (!F.totalQuests) F.totalQuests = 0;
  if (F.harvestTotal == null) F.harvestTotal = Object.values(F.history || {}).reduce((n, h) => n + (h.harvest || 0), 0);   // a start for the harvest trophies
  if (!Array.isArray(S.chats)) S.chats = [];
  ["halfway", "tread", "npcSaid"].forEach(k => { if (!S[k]) S[k] = {}; });
}
migrate();
setArtContext({F:() => F, vine: () => vineState(F), kitchen: () => kitchenState(F), tapas: () => { const t = tapasToday(F, dayKey()); return t ? TAPAS[t.id].n : null; }, vineStock: () => shelfStock(vineState(F)), S:() => S, remaining:() => remaining(), questsIn:pl => questsIn(pl), growth:p => growth(p), stats:() => ST, day:() => dayKey(), postCount:() => postCount(), health: app => health(app), goodNews: () => { const g = goodNews(); return g && F.goodRead !== g.at ? g : null; }, lanterns:() => (S.pond ? (S.pond.shown ?? S.pond.wins.length) : 0), dusk:() => isDusk(), music:() => sound.music, jars:() => jarShelf(), kudos: () => kudosCount(), vault: x => { const i = [70, 165, 260, 355, 450].indexOf(x); return i < 0 ? null : jarAt(i); }, ped: (x, y) => { const i = stationsOf("trophy").filter(s => s.kind === "pedestal").findIndex(s => s.x === x && s.y === y); return i < 0 ? null : onPedestals(F)[i] || null; }, kid: () => ({sleep: kid.sleep || evanNight()})});
function isDusk(){ const t = sgHM(); return t >= 19*60 || t < 6*60; }
let say = null, refs = null, writing = {}, pending = {}, speechT = null, speechLock = 0;
let scene = "base", atSpot = null, boardOpen = false, shelfOpen = false, selPlot = null, shopTab = "seeds";
// In-game UI: the quest note pinned on the map (open, or slim while walking) and the panel over the map.
// The note starts folded when the village opens; it only pops open on step changes after the first few seconds.
let qnOpen = false, qnQuietUntil = Date.now() + 5000, qnKey = "", openView = null, shopClosed = false;
let homeView = null, postOpen = false, healthOpen = false, newsOpen = false, calTab = "today";   // "chores" (the cleaning cupboard) or "fridge" while one is open at home

// Cloud saves wait until the cloud copy has loaded once (synced). Without that, a save made in the first moments after
// opening (from a blank or stale copy in this browser) would overwrite the real save: phone and laptop each keep their
// own browser copy, and the Claude app can clear it between visits.
const loadedAt = {today: S.updatedAt || 0, fox: F.updatedAt || 0}, synced = {today: false, fox: false};
function persist(which){
  const obj = which === "today" ? S : F;
  obj.updatedAt = Date.now();
  try { localStorage.setItem("fox."+which, JSON.stringify(obj)); } catch {}
  if (!refs || !synced[which]) return;
  clearTimeout(pending[which]); pending[which] = setTimeout(() => push(which), 500);
}
// seen: updatedAt of the newest cloud copy this page has loaded or written. Before each save the page re-reads the
// cloud copy: if another device saved since (updates can take up to ~30 s to arrive here, longer for a tab left in the
// background), this page catches up to that instead of writing its older copy over it.
const seen = {today: 0, fox: 0};
async function push(which, direct){
  if (writing[which]) { pending[which] = setTimeout(() => push(which, direct), 400); return; }
  writing[which] = true;
  try {
    if (!direct) {
      const cur = await refs[which].get(), r = cur.exists ? cur.data() : null;
      if (r && (r.updatedAt || 0) > seen[which] && !(which === "today" && r.day !== dayKey())) {
        adopt(which, JSON.parse(JSON.stringify(r))); writing[which] = false;
        speak("Caught up with your other device. That last bit here didn't save, sorry!", 5000); return;
      }
    }
    const body = JSON.parse(JSON.stringify(which === "today" ? S : F));
    await refs[which].set(body); seen[which] = Math.max(seen[which], body.updatedAt || 0);
  } catch(e) {}
  writing[which] = false;
}
function adopt(which, remote){
  if (which === "today") S = Object.assign(freshToday(), remote); else F = Object.assign(freshFox(), remote);
  seen[which] = Math.max(seen[which], remote.updatedAt || 0);
  migrate();
  try { localStorage.setItem("fox."+which, JSON.stringify(which === "today" ? S : F)); } catch {}
  render(true);
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
  attachVaults(col, () => { if (scene === "bank") drawScene(); if (vaultView && !bv.pouring && !/^(vLabel|vGoal|vAmt)$/.test(document.activeElement?.id || "")) ctx(); });
  attachLetters(col, () => { if (lettersOpen && !/^(ltText|ltDate)$/.test(document.activeElement?.id || "")) ctx(); });
  setTimeout(() => writeReplies(sampleCap), 6000);
  attachRoutines(col, () => { if (routOpen && !/^(rtName|rtNew|rtPaste)$/.test(document.activeElement?.id || "") && !document.activeElement?.dataset?.day && !document.activeElement?.dataset?.item) ctx(); });
  attachKudos(col, () => { if (scene === "trophy") drawScene(); if (kudosOpen && !/^(kText|kFrom)$/.test(document.activeElement?.id || "")) ctx(); });
  attachJars(col, () => { if (scene === "room") drawScene(); if (jarsOpen && !/^(jNote|jcName)$/.test(document.activeElement?.id || "")) ctx(); });
  attachMyDocs(col, id => { if ((id === "journal" && journalOpen && document.activeElement?.id !== "jText") || (id === "scratch" && scratchOpen && document.activeElement?.id !== "scratchText")) ctx(); });
  attachFeeds(col, id => {
    if (/^health/.test(id) && ["lane", "chord", "chico"].includes(scene)) { drawScene(); ctx(); }
    if (/^content/.test(id) && openView === "cal" && calTab === "content") renderCal();
    if (id === "goodnews" && scene === "village") drawScene();
  });
  refs = {today: col.doc("today"), fox: col.doc("fox"), plan: col.doc("plan"), mail: col.doc("mail"), stats: col.doc("stats"), library: col.doc("library")};
  refs.library.onSnapshot(snap => {
    LIB = snap.exists ? Object.assign({items:[]}, JSON.parse(JSON.stringify(snap.data()))) : {items:[]};
    try { localStorage.setItem("fox.library", JSON.stringify(LIB)); } catch {}
    if (shelfOpen) ctx();
  }, () => {});
  refs.mail.onSnapshot(snap => {
    MAIL = snap.exists ? Object.assign({items:[]}, JSON.parse(JSON.stringify(snap.data()))) : {items:[]};
    try { localStorage.setItem("fox.mail", JSON.stringify(MAIL)); } catch {}
    render();
  }, () => {});
  refs.stats.onSnapshot(snap => {
    const before = ST; ST = snap.exists ? JSON.parse(JSON.stringify(snap.data() || {})) : {};
    try { localStorage.setItem("fox.stats", JSON.stringify(ST)); } catch {}
    const grew = ["chord", "chico"].find(k => ST[k] && before[k] && ST[k].users > before[k].users);
    if (grew) speak(`${grew === "chord" ? "Chord" : "Chico"} grew to ${ST[grew].users.toLocaleString()} users! New flowers 🌼`, 5000);
    render(outside());
  }, () => {});
  let firstPlan = true;
  refs.plan.onSnapshot(snap => {
    if (snap.exists) {
      const was = remaining().length;
      P = JSON.parse(JSON.stringify(snap.data())); try { localStorage.setItem("fox.plan", JSON.stringify(P)); } catch {}
      markSunsamaDone(); render(true);
      if (!was && remaining().length) speak("New quests on the boards!", 5000);
    }
    if (firstPlan) { firstPlan = false; syncSunsama(); }
  }, () => { if (firstPlan) { firstPlan = false; syncSunsama(); } });
  // A snapshot marked fromCache isn't server-definitive yet: show it, but only start saving after a definitive one.
  const watch = (which) => refs[which].onSnapshot(snap => {
    const local = which === "today" ? S : F, first = !synced[which], cached = !!(snap.metadata && snap.metadata.fromCache);
    if (!cached) synced[which] = true;
    if (!snap.exists) { if (!cached) persist(which); return; }
    const remote = JSON.parse(JSON.stringify(snap.data()));
    seen[which] = Math.max(seen[which], remote.updatedAt || 0);
    if (which === "today" && remote.day !== dayKey()) { if (!cached && local.day === dayKey()) persist(which); return; }
    // First load: the cloud wins unless this browser's copy (as it was when the page opened) is genuinely newer
    if (first && (remote.updatedAt || 0) < loadedAt[which]) { if (!cached) persist(which); return; }
    if (first || (remote.updatedAt || 0) > (local.updatedAt || 0)) adopt(which, remote);
    else if (!cached && (remote.updatedAt || 0) < (local.updatedAt || 0)) persist(which);
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
  if (!quiet) { const ex = String(id).startsWith("x") ? t : null; undoable(`Dropped “${t.title}”`, () => { if (ex) S.extra.push(ex); else S.dropped = (S.dropped || []).filter(x => x !== id); setSay("Back on the board."); save(true); }); }
}
function undropTask(id){ S.dropped = (S.dropped || []).filter(x => x !== id); setSay("Back on the board."); save(true); }
const remaining = () => allTasks().filter(t => !S.doneIds.includes(t.id));
const questsIn = pl => allTasks().filter(t => placeOf(t) === pl);
function phase(){
  if (S.mode === "break") return "break";   // a break Mel asks for comes first, even mid-clean
  if (S.mode === "decompress" && S.decompFree) return "decompress";   // decompress from the calm corner, any time
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
  can:       {n: "Big watering can", price: 60, ico: "wateringCan", what: "Waters every thirsty plot in one go."},
  compost:   {n: "Compost bin", price: 150, ico: "compost", what: "Everything grows a quarter faster."},
  sprinkler: {n: "Sprinkler", price: 300, ico: "sprinkler", what: "New seeds water themselves the moment you plant them."}
};
let orView = null, orAt = null, orTab = null, potItem = null, kView = null, reviewOpen = false, vyView = null, vyAt = null, vaultView = null, lettersOpen = false, trophyView = null, routOpen = false, kudosOpen = false, deskOpen = false, shedOpen = false, runOpen = false, wardOpen = false, bedOpen = false, journalOpen = false, scratchOpen = false, calmOpen = false, recOpen = false, clientsOpen = false, planOpen = false, revOpen = false, jarsOpen = false; deskOpen = false; kudosOpen = false; routOpen = false; trophyView = null; lettersOpen = false; vaultView = null; vyView = null; reviewOpen = false; kView = null; orView = null;
let jv = {mode: "shelf", blobs: [], note: ""};   // the emotion shelf panel: shelf, make (picker) or jar (one jar)
// Guided breathing in the calm corner: a ring grows as she breathes in (4 s), holds (2 s) and shrinks as she breathes out (6 s)
const BREATH = [[4, "Breathe in"], [2, "Hold"], [6, "Breathe out"]], CYCLE = 12;
let breath = null, breathT = null;   // {start, total (ms)}
function startBreath(min){
  breath = {start: Date.now(), total: min*M}; clearInterval(breathT); breathT = setInterval(tickBreath, 200); sfx("bowl"); ctx(); tickBreath();
}
function stopBreath(done){
  clearInterval(breathT); breathT = null; const was = breath; breath = null;
  if (done && was) { sfx("bowl"); gainXp(1); if (!S.breathed) { S.breathed = true; earn(1, "a calm minute"); } speak("Lovely. Notice how you feel now.", 4500); save(); }
  if (calmOpen) ctx();
}
function tickBreath(){
  if (!breath) return; if (!calmOpen || scene !== "room") { stopBreath(false); return; }
  const el = Date.now() - breath.start, left = breath.total - el;
  if (left <= 0) { stopBreath(true); return; }
  let t = (el/1000) % CYCLE, cue = BREATH[0][1]; for (const [d, c] of BREATH) { if (t < d) { cue = c; break; } t -= d; }
  const c = $("breathCue"), l = $("breathLeft"); if (c && c.textContent !== cue) c.textContent = cue;
  if (l) l.textContent = `${Math.floor(left/60000)}:${String(Math.floor(left/1000) % 60).padStart(2, "0")}`;
}
const ward = {busy: false, error: "", ask: ""};
function buyTool(id){
  const t = SHED[id]; if (!t || F.tools[id] || F.coins < t.price) return;
  F.coins -= t.price; F.tools[id] = true; sfx("chaching"); act("cheer"); flash(`New in the shed: ${t.n.toLowerCase()}`);
  speak(isHere("darren") ? `Darren's setting up the ${t.n.toLowerCase()} for you!` : `The ${t.n.toLowerCase()} is ready in the garden.`, 4500);
  if (id === "can") F.plots.forEach((p, i) => { if (p && p.crop && !p.wateredAt) p.wateredAt = Date.now(); });
  save();
}
// The emotion shelf: make a jar (up to 10 blobs from up to 4 feelings, a short note), open one, empty it or send it to
// the journal as a polaroid. No coins: feelings aren't a task. Maple notices, but never reads the note.
function wireJars(c){
  const note = c.querySelector("#jNote"); if (note) note.oninput = () => { jv.note = note.value; };
  c.querySelectorAll("[data-emo]").forEach(b => b.onclick = () => { const id = b.dataset.emo, kinds = new Set(jv.blobs);
    if (jv.blobs.length >= MAX_BLOBS || (!kinds.has(id) && kinds.size >= MAX_KINDS)) return; jv.blobs.push(id); jv.added = ""; sfx("tap"); ctx(); });
  c.querySelectorAll("[data-jarid]").forEach(b => b.onclick = () => { jv = {mode: "jar", id: b.dataset.jarid, blobs: [], note: ""}; sfx("paper", true); ctx(); });
  const jn = c.querySelector("#jcName"); if (jn) jn.oninput = () => { jv.customName = jn.value; jv.customWarn = ""; };
  if (jn) jn.onkeydown = e => { if (e.key === "Enter") { e.preventDefault(); const f = c.querySelector("#jcForm"); if (f) f.requestSubmit ? f.requestSubmit() : f.onsubmit(e); } };
  c.querySelectorAll("[data-sw]").forEach(b => b.onclick = () => { if (jn) jv.customName = jn.value; jv.customColor = b.dataset.sw; jv.customWarn = ""; ctx(); });
  // Adding a feeling never drops a blob in: it joins the picker, and Mel taps it like any other
  const cf = c.querySelector("#jcForm"); if (cf) cf.onsubmit = ev => { ev.preventDefault(); if (jn) jv.customName = jn.value;
    const name = String(jv.customName || "").trim();
    if (!name) { jv.customWarn = "Give it a name first."; ctx(); const n = c.querySelector("#jcName"); if (n) n.focus(); return; }
    if (!jv.customColor) { if (jn) jn.blur(); jv.customWarn = "Now pick a colour for it."; ctx(); return; }
    const e = addCustom(name, jv.customColor); if (e) { jv.adding = false; jv.customName = ""; jv.customColor = ""; jv.customWarn = ""; jv.added = e.name; sfx("tap"); } ctx(); };
  c.querySelectorAll("[data-jar]").forEach(b => b.onclick = () => {
    const k = b.dataset.jar, id = b.dataset.id;
    if (k === "make") { jv = {mode: "make", blobs: [], note: ""}; }
    else if (k === "shelf") { jv = {mode: "shelf", blobs: [], note: ""}; }
    else if (k === "unblob") { jv.blobs.pop(); }
    else if (k === "custom") { jv.adding = !jv.adding; jv.customWarn = ""; jv.added = ""; if (jv.adding) setTimeout(() => { const f = c.querySelector("#jcForm"); if (f) f.scrollIntoView({block: "nearest", behavior: "smooth"}); }, 30); }
    else if (k === "place") { const j = makeJar(jv.blobs, jv.note); if (!j) return; sfx("chime");
      const heavy = j.blobs.filter(x => ["anger", "sad", "fear", "anxious", "tired"].includes(x)).length >= Math.ceil(j.blobs.length/2);
      speak(heavy ? "That's a big feeling. I'm here." : j.blobs.filter(x => ["joy", "love", "proud", "calm"].includes(x)).length > j.blobs.length/2 ? "A happy one. I love that for you." : "Kept safe on the shelf.", 4500);
      jv = {mode: "shelf", blobs: [], note: ""}; drawScene(); }
    else if (k === "empty") { const restore = emptyJar(id); if (restore) { undoable("Jar emptied", () => { restore(); drawScene(); ctx(); }); jv = {mode: "shelf", blobs: [], note: ""}; drawScene(); } }
    else if (k === "send") { const j = jarById(id); if (!j) return; addJarEntry(j); const restore = emptyJar(id); sfx("paper");
      speak("Tucked into your journal, with a little photo of the jar.", 4000);
      undoable("Sent to your journal", () => { if (restore) restore(); removeEntry("p" + id); drawScene(); ctx(); }); jv = {mode: "shelf", blobs: [], note: ""}; drawScene(); }
    ctx();
  });
}
// Mel's bed: a 20-minute nap (wakes with a chime) or lying down until she gets up. Leaving the room wakes her.
function bedAction(k){
  if (k === "up") { S.sleep = null; speak("Morning, sleepyhead. Well, sort of.", 3000); }
  else { S.sleep = {until: k === "nap" ? Date.now() + 20*M : null, at: Date.now()}; speak(k === "nap" ? "Twenty minutes. I'll wake you." : (sgHM() >= 20*60 || sgHM() < 5*60) ? "Goodnight, Mel. Sweet dreams." : "Lie down as long as you like.", 3500); }
  bedOpen = false; save(true);
}
function wakeUp(){ S.sleep = null; sfx("chime"); speak("Rise and shine! Nap done.", 4500); save(true); }
// The animal run at home base (see pets.js): feed from the backpack, upgrade with coins.
function feedAnimals(which){
  const list = which === "all" ? F.pets.animals.filter(a => hungry(a, F)) : F.pets.animals.filter(a => a.id === which);
  let fed = 0, eggs = 0, milk = 0, grew = [], miss = "";
  list.forEach(a => { const r = feedOne(F, a, F.inv, addInv); if (r.ok) { fed++; if (r.egg) eggs++; if (r.milk) milk++; if (r.grew) grew.push(a); } else if (r.msg) miss = r.msg; });
  if (!fed) { if (miss) speak(miss, 4000); ctx(); return 0; }
  sfx("chime"); gainXp(1); if (scene === "base") [0, 300].forEach(d => setTimeout(() => mprop("heart", 110 + rnd(-30, 30), 520, 1700), d));
  const g = grew[0];
  speak(g ? `${g.name} is all grown up! ${g.kind === "chick" ? "A proper hen now, eggs from tomorrow." : g.kind === "goat" ? "A proper goat now, milk from tomorrow." : "A big fluffy rabbit now."}` : milk && !eggs ? `${milk === 1 ? "A bottle of milk" : milk + " bottles of milk"} for your backpack. Cheese, here we come.` : eggs ? `${eggs === 1 ? "An egg" : eggs + " eggs"} for your backpack! Fresh from the coop.` : fed > 1 ? "Everyone's munching away. Happy run." : `${list[0].name} gobbles it up. Happy little face.`, 4500);
  if (eggs || milk) flash([eggs ? `+${eggs} fresh egg${eggs > 1 ? "s" : ""}` : "", milk ? `+${milk} milk` : ""].filter(Boolean).join(", ") + " in your backpack");
  if (miss && fed < list.length) setTimeout(() => speak(miss, 4000), 4600);
  save(true); return fed;
}
function buyRunUpgrade(){
  const nx = upgradeRun(F); if (!nx) return;
  sfx("chaching"); act("cheer"); flash(`The run is now: ${nx.n.toLowerCase()}`);
  speak(isHere("darren") ? `Darren's building the ${nx.n.toLowerCase()}. Hammer, hammer!` : `Ta-da! The ${nx.n.toLowerCase()} is ready.`, 4500); save(true);
}
const readyCount = () => F.plots.filter(p => p && p.crop && growth(p) >= 1).length;

/* =================== PROGRESS =================== */
const level = () => { let i = 0; LEVELS.forEach((l, j) => { if (F.xp >= l.xp) i = j; }); return i; };
function markActive(){
  const k = dayKey(); if (F.lastActive === k) return;
  F.streak = F.lastActive === prevDay(k) ? (F.streak || 0) + 1 : 1;
  F.days = (F.days || 0) + 1; F.xp += 5; F.lastActive = k;
}
// Every delete can be undone for a few seconds: undoable("Removed X", () => put it back)
let undoT = null, undoFn = null;
function undoable(msg, restore){
  undoFn = restore; $("undoMsg").textContent = plain(msg); $("undoBar").hidden = false;
  clearTimeout(undoT); undoT = setTimeout(() => { $("undoBar").hidden = true; undoFn = null; }, 7000);
}
$("undoBtn").onclick = () => { const f = undoFn; undoFn = null; clearTimeout(undoT); $("undoBar").hidden = true; if (f) { f(); sfx("paper", true); } };
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
  if (ph === "decompress") return S.decompFree ? "Clench, breathe, then three quick points in your journal." : `${S.decompFor ? `“${S.decompFor}” is done. ` : ""}Clench, breathe, then jot three quick points.`;
  if (ph === "recap") return "We did it! Garden? Shopping? Snacks?";
  return "No quests yet. Bring some from chat?";
}
// Peace and quiet: whenever there are no active quests (all done, or none yet), nobody pipes up on their own and
// Maple's bubble tucks itself away after a few seconds. Bubbles only appear in answer to a tap. Not during the
// lantern wind-down or a running timer. Settings can turn it off (F.quietEvening === false).
let lastInput = 0;
["pointerdown", "keydown"].forEach(t => document.addEventListener(t, () => { lastInput = Date.now(); }, {capture: true}));
const hushed = () => F.quietEvening !== false && !remaining().length && !(S.pond && (S.pond.shown != null || Date.now() - (S.pond.done || 0) < 20e3)) && !(S.timer && !S.timer.fired) && S.mode !== "decompress";
let speechAt = 0;
const unprompted = () => Date.now() - lastInput > 1500;
const quietNow = () => hushed() && unprompted();
function speak(text, ms, force){
  const el = $("speech");
  if (scene === "kidroom") return;   // Maple waits outside Evan's room
  if (!force && quietNow()) { if (!el.hidden) el.textContent = plain(text); return; }
  el.hidden = false; speechAt = Date.now(); el.textContent = plain(text); el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop");
  clearTimeout(speechT); speechLock = ms ? Date.now() + ms : 0;
  if (ms) speechT = setTimeout(() => { speechLock = 0; el.textContent = plain(say ? say.line : defaultLine()); }, ms);
}
function setSay(line, buttons){ say = {line, buttons}; speak(line); }
let evanT;
// Hugs: every few minutes Evan runs over with his arms up. Tap him and Mel hugs him back; otherwise she still
// gives him a little "aww". Pure fun: nothing is saved or earned.
let hug = null, hugAt = Date.now() + (/[?&]hugsoon/.test(location.search) ? 3 : 60 + Math.random()*90)*1000, melT;   // ?hugsoon: tests
function melSays(t){ const e = $("melSay"); e.innerHTML = `<b class="who">Mel</b>${esc(plain(t))}`; e.hidden = false; clearTimeout(melT); melT = setTimeout(() => e.hidden = true, 2800); }
function hugTick(){
  if (!hug) {
    const busy = !$("panel").hidden || kid.sleep || kid.open || route.length || mel.moving || (scene === "base" && atSpot === "swing");
    if (Date.now() > hugAt && evanHere() && !busy) { hug = {phase: "run", t: Date.now()}; evan.tx = mel.x + (mel.dir > 0 ? 16 : -16); evan.ty = mel.y + 4; evan.run = true; evan.path = null; evan.rk = ""; kid.pending = null; evanSays("Mama!"); }
    return false;
  }
  if (!evanHere() || Date.now() - hug.t > 20000) { endHug(); return false; }
  if (hug.phase === "run") { evan.tx = mel.x + (mel.dir > 0 ? 16 : -16); evan.ty = mel.y + 4;
    if (Math.hypot(evan.x - evan.tx, evan.y - evan.ty) < 6) { hug.phase = "ask"; hug.t = Date.now(); evan.dir = evan.x < mel.x ? 1 : -1; nodes.evan.classList.add("hug"); evanSays("hug?"); mprop("heart", evan.x, evan.y - 36); } }
  else if (hug.phase === "ask" && Date.now() - hug.t > 6000) { mel.dir = evan.x < mel.x ? -1 : 1; mprop("heart", mel.x, mel.y - 56); melSays(pickSay(["Aww, hi baby.", "Hello, you.", "Mwah!"])); endHug(); }
  return true;   // Evan's busy hugging: no wandering off
}
function hugBack(){
  mel.dir = evan.x < mel.x ? -1 : 1; nodes.mel.classList.add("hugging"); nodes.evan.classList.add("hug");
  [0, 250, 500].forEach(d => setTimeout(() => mprop("heart", (mel.x + evan.x)/2 + rnd(-10, 10), mel.y - 50, 1900), d));
  sfx("chime"); melSays(pickSay(["Love you, little one!", "Biggest hug!", "Squeeze!", "My favourite boy."])); setTimeout(() => evanSays(pickSay(["hehe!", "love you Mama!", "again!"])), 900);
  setTimeout(() => nodes.mel.classList.remove("hugging"), 1800); endHug(1800);
}
function endHug(ms){ hug = null; hugAt = Date.now() + (240 + Math.random()*240)*1000; setTimeout(() => nodes.evan.classList.remove("hug"), ms || 0); }
function evanSays(t){ if (scene !== "kidroom" && quietNow()) return; const e = $("evanSay"); e.innerHTML = `<b class="who">Evan</b>${esc(plain(t))}`; e.hidden = false; clearTimeout(evanT); evanT = setTimeout(() => e.hidden = true, 2200); }

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
  if (S.sleep && S.sleep.until && Date.now() > S.sleep.until) wakeUp();
  if (hushed() && !$("speech").hidden && Date.now() > speechLock && Date.now() - speechAt > 6000) $("speech").hidden = true;   // tuck Maple's bubble away
  bedtimeTick(); vineTick(); reviewNudge(); orchardTick();
  $("evan").style.display = evanHere() ? "" : "none";
  if (scene === "kidroom" && evanNight() && !kid.sleep) { kid.sleep = true; kid.open = null; stopKidGame(); ctx(); drawScene(); }
  const due = dueNow(F); if (due.length) { chime(); act("nudge"); speak(`Reminder: ${due.map(r => r.text).join(", and ")}.`, 9000, true); save(); }
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
    if (t.source === "sunsama" && !t.completed) tickSunsama(t.id);
    if (t.early) { F.early[t.id] = t.early; setTimeout(() => speak("Done a day early! It's ticked off in Sunsama, and it'll already be done on tomorrow's board.", 6000), 4200); }
    let grew = 0; F.plots.forEach(p => { if (p && p.crop && p.wateredAt && growth(p) < 1) { p.bonus = (p.bonus || 0) + QUEST_BOOST; grew++; } });
    grew += questBoost(F, QUEST_BOOST);   // the vines, barrels, oven and cheese press move on too
    if (t.meeting) { S.mode = "decompress"; S.decompFor = t.title; }
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
  decompNow(){ if (S.mode !== "decompress") S.modeBefore = S.mode || null; S.mode = "decompress"; S.decompFree = true; S.timer = S.timer && S.timer.kind === "task" ? S.timer : null; setSay("Let's decompress. Clench, breathe, then three quick points."); save(); },
  journal(){ if (scene === "room") { journalOpen = true; render(); } else walkToPlace("journal"); },
  decompressed(){ if (S.decompFree) { S.decompFree = false; S.mode = S.modeBefore || null; S.modeBefore = null; setSay("Decompressed. Lovely. Back to it when you're ready."); save(); return; }
    S.decompFor = null; S.mode = remaining().length ? "break" : null; if (S.mode) startTimer("break", 10); setSay("Decompressed. Now a proper break."); save(); },
  water(ml){ setWater((S.waterMl || 0) + (ml || GLASS)); speak(pick(["Glug glug!", "Hydrated boss!", "Water break, good call."]), 3000); }
};
// Sunsama sync back: a quest finished here is ticked off there. Anything that couldn't get through waits in
// F.sunsamaTodo and is retried every few minutes (and on the next Sunsama pull).
function tickSunsama(id, day = dayKey()){
  F.sunsamaTodo = (F.sunsamaTodo || []).filter(x => x.id !== id).concat({id, day}); save();
  flushSunsama();
}
let sunFlushing = false;
async function flushSunsama(){
  if (sunFlushing || !(F.sunsamaTodo || []).length) return; sunFlushing = true;
  for (const x of F.sunsamaTodo.slice()) {
    if (await completeInSunsama(x.id, x.day)) F.sunsamaTodo = F.sunsamaTodo.filter(y => y.id !== x.id);
    else if (Date.now() - (x.warned || 0) > 30*60e3) { x.warned = Date.now(); flash("Couldn't tick that off in Sunsama just now. I'll keep trying."); }
  }
  sunFlushing = false; save();
}
setInterval(flushSunsama, 3*60e3); setTimeout(flushSunsama, 7000);
/* ---------- Subtasks ---------- */
// A quest's subtasks (from Sunsama, or a checklist in its notes). Ticks live in F.subDone[taskId] = {at, s: {key: done}}
// and win over what Sunsama last said; ticks on real Sunsama subtasks are queued in F.subTodo and retried until
// Sunsama takes them. Older plans kept subtasks as a "Subtasks:" list in the notes text: that's read too.
const subKey = x => x.id || "t:" + norm(x.title);
const norm = s => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
function subView(t){
  if (!t) return {list: [], notes: ""};
  let list = t.subtasks || [], notes = t.notes || "";
  if (!t.subtasks && /(^|\n)Subtasks:\n/.test(notes)) {
    const [before, after] = notes.split(/(?:^|\n)Subtasks:\n/); const rest = [];
    list = []; after.split("\n").forEach(l => { const m = /^\s*-\s*(✓\s*)?(.+)/.exec(l); if (m) list.push({title: m[2].trim(), done: !!m[1], info: []}); else rest.push(l); });
    notes = [before, ...rest].join("\n").trim();
  }
  const st = ((F.subDone || {})[t.id] || {}).s || {};
  return {list: list.map(x => { const key = subKey(x); return Object.assign({}, x, {key, done: key in st ? st[key] : !!x.done}); }), notes};
}
function subTick(t, key, done){
  const x = subView(t).list.find(y => y.key === key); if (!x) return;
  F.subDone = F.subDone || {};
  for (const k of Object.keys(F.subDone)) if (Date.now() - F.subDone[k].at > 21*864e5) delete F.subDone[k];   // forget old quests
  const rec = F.subDone[t.id] = F.subDone[t.id] || {s: {}}; rec.at = Date.now(); rec.s[key] = done;
  if (x.id && t.source === "sunsama") { F.subTodo = (F.subTodo || []).filter(y => !(y.task === t.id && y.sub === x.id)).concat({task: t.id, sub: x.id, done}); flushSubs(); }
  // Subtasks pay the first time they're ticked (rec.paid remembers, so untick and re-tick doesn't pay twice). In a
  // treadmill batch each subtask was a task of its own, so it pays like one: 5 coins and the growing boost.
  rec.paid = rec.paid || {};
  if (done && !rec.paid[key]) { rec.paid[key] = true;
    if (isTreadTask(t)) { sfx("chaching"); earn(5, "batch quest done"); gainXp(1); F.plots.forEach(p => { if (p && p.crop && p.wateredAt && growth(p) < 1) p.bonus = (p.bonus || 0) + QUEST_BOOST; }); questBoost(F, QUEST_BOOST); }
    else earn(1, "subtask"); }
  else sfx(done ? "tap" : "paper", true);
  const left = subView(t).list.filter(y => !y.done).length;
  if (done && !left) speak("Every subtask ticked! Tap Done when you're ready.", 4500, true);
  save(); refreshNotebook();
}
let subFlushing = false;
async function flushSubs(){
  if (subFlushing || !(F.subTodo || []).length) return; subFlushing = true;
  for (const x of F.subTodo.slice()) {
    if (await subtaskInSunsama(x.task, x.sub, x.done)) F.subTodo = F.subTodo.filter(y => y !== x);
    else if (Date.now() - (x.warned || 0) > 30*60e3) { x.warned = Date.now(); flash("Couldn't tick that subtask in Sunsama just now. I'll keep trying."); }
  }
  subFlushing = false; save();
}
setInterval(flushSubs, 3*60e3); setTimeout(flushSubs, 8000);
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
    const q = allTasks().find(x => x.id === t.id); if (q && q.early) F.early[t.id] = q.early;
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
    if (n || fresh.length) save(true); else render();
    return;
  }
  if (n) save(true); else render();   // nothing new: no save (a background tab mustn't rewrite an unchanged copy)
}
setInterval(() => { if (!document.hidden) syncSunsama(); }, 10*60e3);

/* =================== TOMORROW =================== */
// Peek at tomorrow's Sunsama tasks from the quest list and pull any into today. A quest finished early is remembered
// in F.early (id -> the day it was planned for), so when that day's plan arrives it's already ticked, with no second
// lot of coins. Sunsama itself isn't changed: Maple reminds Mel to tick it there too.
const tmr = {list: null, busy: false, error: null, day: null};
const tomorrowKey = () => new Date(Date.parse(dayKey() + "T00:00:00Z") + 864e5).toISOString().slice(0, 10);
async function peekTomorrow(){
  const day = tomorrowKey(); tmr.busy = true; tmr.error = null; tmr.day = day; renderTomorrow();
  const r = await pullSunsama(day, {fresh: true});
  tmr.busy = false; if (r.error) tmr.error = r.error; else tmr.list = r.tasks.filter(t => !t.completed);
  renderTomorrow();
}
function doEarly(id){
  const t = (tmr.list || []).find(x => x.id === id); if (!t || allTasks().some(x => x.id === id)) return;
  S.extra.push(Object.assign({}, t, {early: tmr.day})); sfx("paper", true);
  setSay(`“${t.title}” is on today's board now. Future you says thanks.`); save(true);
}
function creditEarly(){
  const k = dayKey(); Object.keys(F.early || {}).forEach(id => { if (F.early[id] < k) delete F.early[id]; });
  allTasks().forEach(t => { if (F.early[t.id] === k && !S.doneIds.includes(t.id)) S.doneIds.push(t.id); });
}
function renderTomorrow(){
  const el = $("tomorrow"); if (!el) return;
  if (tmr.day && tmr.day !== tomorrowKey()) { tmr.list = null; tmr.day = null; }
  const label = new Date(tomorrowKey() + "T00:00:00Z").toLocaleDateString("en-GB", {weekday: "long", day: "numeric", month: "short", timeZone: "UTC"});
  let h = `<p class="eyebrow tmrh">Tomorrow · ${esc(label)}</p>`;
  if (tmr.busy) h += `<p class="muted">Asking Sunsama…</p>`;
  else if (tmr.error) h += `<p class="muted">${esc(SUNSAMA_ERRORS[tmr.error] || "Couldn't reach Sunsama just now.")} <button class="drop" data-tmr="peek">try again</button></p>`;
  else if (!tmr.list) h += `<button class="btn small alt" data-tmr="peek">Peek at tomorrow's quests</button>`;
  else if (!tmr.list.length) h += `<p class="muted">Nothing planned in Sunsama for tomorrow yet.</p>`;
  else {
    const today = new Set(allTasks().map(t => t.id));
    h += `<ul class="hlist tmr">${tmr.list.map(t => { const early = F.early[t.id] === tmr.day, on = today.has(t.id);
      return `<li><span class="pl">${icon(placeOf(t), 18)}</span><span><b>${esc(t.title)}</b><small>${t.minutes || 25} min</small></span>${early ? `<span class="hbadge">done early</span>` : on ? `<span class="hbadge sched">on today's board</span>` : `<button class="next" data-early="${esc(t.id)}">do today</button>`}</li>`; }).join("")}</ul>`;
  }
  el.innerHTML = h;
  el.querySelectorAll("[data-tmr]").forEach(b => b.onclick = () => peekTomorrow());
  el.querySelectorAll("[data-early]").forEach(b => b.onclick = () => doEarly(b.dataset.early));
}
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
document.addEventListener("visibilitychange", () => { if (!document.hidden) syncSunsama(); else flushSaves(); });
window.addEventListener("pagehide", () => flushSaves());
// Leaving or hiding the page: send any save that's still waiting out its half-second delay right away
function flushSaves(){ ["today", "fox"].forEach(w => { if (pending[w] && refs && synced[w]) { clearTimeout(pending[w]); pending[w] = null; push(w, true); } }); }

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
  pond: "base:pond", garden: "farm", farm: "farm", shed: "base:shed", swing: "base:swing", letterbox: "base:letterbox", "animal run": "base:run", wardrobe: "room:wardrobe", outfit: "room:wardrobe", "my room": "room", bedroom: "room", bed: "room:bed", journal: "room:journal", jars: "room:jars", "emotion shelf": "room:jars", "emotion jar": "room:jars", scratchpad: "hall:whiteboard", whiteboard: "hall:whiteboard", run: "base:run", animals: "base:run", chickens: "base:run", rabbits: "base:run", market: "market", well: "village:well",
  "wine shop kitchen": "kitchen", "shop kitchen": "kitchen", larder: "kitchen:larder", oven: "kitchen:oven", stove: "kitchen:stove", "cheese press": "kitchen:press", "olive tree": "vineyard:olive", olives: "vineyard:olive",
  "weekly review": "hall:review", review: "hall:review", scrapbook: "hall:review", "week review": "hall:review",
  field: "field:lake", lake: "field:lake", swans: "field:lake", picnic: "field:picnic", football: "field:pitch", park: "field:lake",
  orchard: "orchard:farmshop", "farm shop": "orchard:farmshop", "fruit": "orchard:farmshop", "flower farm": "flowers", "ma ma": "cottage", "ma ma's cottage": "cottage", cottage: "cottage", "grandma": "cottage",
  vineyard: "vineyard:barrels", vines: "vineyard:vinestall", "barrel shed": "vineyard:barrels", barrels: "vineyard:barrels", "wine shop": "wineshop", "honesty box": "wineshop:hbox", "tasting room": "wineshop:tasting", playground: "vineyard:pslide",
  "town hall": "hall", hall: "hall", bank: "bank", vaults: "bank", savings: "bank", "kind words": "trophy:kudos", "trophy room": "trophy", courtyard: "trophy", fountain: "trophy:fountain", trophies: "trophy", "trophy book": "trophy:tbook", affirmations: "trophy:affirm", routines: "room:routines", "routine board": "room:routines", compliments: "trophy:kudos", "client table": "hall:clients", clients: "hall:clients", "planning table": "hall:table", plans: "hall:table", revenue: "hall:revenue", "revenue chart": "hall:revenue", chord: "chord", "makers lane": "lane:plot3", lane: "lane:plot3", library: "fresh", "fresh pages": "fresh", chico: "chico", "post office": "post", post: "post", town: "village:board"};
function walkToPlace(name){
  const k = PLACES[String(name || "").toLowerCase().trim()]; if (!k) return null;
  const [pl, sp] = k.split(":");
  if (pl === "base" || pl === "village" || pl === "lane" || pl === "vineyard" || pl === "orchard" || pl === "field") { const v = VILLAGE[sp]; go(pl, v.door[0], v.door[1], () => arriveVillageSpot(sp)); }
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
    case "feed_animals": { const r = feedAnimals("all"); return r ? `Fed ${r} in the run` : null; }
    case "routine_set": { const l = setRoutine(a); return l ? `${l.name} is on your routines board` : null; }
    case "last_done": { const n = chatLastDone(a.what, a.date); return n ? `Logged: ${n}, ${a.date && a.date !== dayKey() ? a.date : "today"}` : null; }
    case "save": { const j = jarByLabel(a.vault); const n = Math.round(Number(a.amount) || 0); if (!j || !n) return null; const r = vaultDeposit(j.slot, n); if (r && r.nowFull) vaultPoured(r.jar, true); drawScene(); return `${n > 0 ? "+" : ""}${vaultMoney(n, j.cur)} in the ${j.label} vault (${vaultMoney(r.jar.amount, j.cur)} of ${vaultMoney(j.goal, j.cur)})`; }
    case "kudos_add": { const e = addKudos(a.text, a.from); return e ? `Pinned to Kind words${e.from ? ` (from ${e.from})` : ""}` : null; }
    case "remind": return addReminder(F, a, () => save()).then(x => x.line);
  }
  return null;
}
function chatContext(){
  const rem = remaining(), cur = phase() === "task" ? rem[0] : null, h = hestiaSummary();
  return JSON.stringify({time: `${String(Math.floor(sgHM()/60)).padStart(2, "0")}:${String(sgHM() % 60).padStart(2, "0")} Singapore, ${WEEKDAY[new Date(dayKey() + "T00:00:00Z").getUTCDay()]}`,
    where: scene, phase: phase(), currentQuest: cur ? cur.title : null, questsLeft: rem.map(t => t.title).slice(0, 15), questsDone: S.doneIds.length,
    timer: S.timer ? {kind: S.timer.kind, minutesLeft: Math.round(tLeft()/M)} : null, waterMl: S.waterMl || 0, steps: S.steps || 0, coins: F.coins,
    home: h, animals: F.pets.animals.map(a => ({name: a.name, kind: a.kind, hungry: hungry(a, F)}))});
}
async function sendChat(text){
  text = String(text || "").trim(); if (!text || chatBusy) return;
  if (!sampleCap) { chatLog.push({role: "user", content: text}, {role: "assistant", content: "I can't reach Claude from this view just now. The buttons all still work!"}); keepChat(); renderChat(); return; }
  chatLog.push({role: "user", content: text}); chatBusy = true; keepChat(); renderChat();
  const history = chatLog.slice(-12, -1).map(m => (m.role === "user" ? "Mel: " : "Maple: ") + m.content).join("\n");
  // Her Notion plans: this week's always (it shapes the coaching), the month and quarter when she asks about plans
  const wantAll = PLAN_WORDS.test(text) || PLAN_WORDS.test(chatLog.slice(-3, -1).map(m => m.content).join(" "));
  const plans = (await Promise.all((wantAll ? ["week", "month", "quarter"] : ["week"]).map(l => readPlan(l).catch(() => null)))).filter(p => p && p.text);
  const planText = plans.length ? `\nMel's plans from Notion (her own words; answer plan questions from these, never invent what isn't there):\n${plans.map(p => `== ${p.title} ==\n${p.text}`).join("\n\n")}\n` : "";
  try {
    const d = await sampleCap.json(`You are ${F.name}, a tiny fox who lives in Mel's cosy village game and coaches her through her day, in boss-mode style: one thing at a time, tiny first steps, breaks, no guilt. Warm, direct, short sentences. Mel is a Singapore-based founder (a copywriting studio, the Chord and Chico apps) and a parent of a toddler, Evan; Darren lives with them.
She can ask you anything. Reply in at most 3 short sentences, plain text, no emoji, no markdown.
When she asks for something the game can do, include it in "actions" and say in your reply that it's done. Never claim something happened that isn't in actions, and never claim to send emails, edit Sunsama or change her calendar events: those happen in chat with Claude. The one exception is reminders: the "remind" action puts a reminder on her calendar that pings her phone.
Available actions (use only these):
{"type":"shopping_add","items":[{"name":"oat milk","where":"Supermarket"}]}  (where is optional; stores: ${hestiaSummary().stores.join(", ")})
{"type":"restocked","items":["rice"]}  (bought or found again: back in the fridge)
{"type":"chore_add","kind":"daily|weekly","text":"..."}
{"type":"chore_done","text":"..."}  (tick a home chore she says she did)
{"type":"tidy_timer","minutes":10|20|30}
{"type":"break","minutes":10}  {"type":"back"}  (start or end a break)
{"type":"quest_add","title":"...","minutes":25}  {"type":"quest_drop","title":"..."}  {"type":"quest_next","title":"..."}
{"type":"water","ml":250}  {"type":"steps","total":4200}
{"type":"go","place":"field|lake|picnic|football|orchard|farm shop|flower farm|ma ma's cottage|wine shop kitchen|larder|olive tree|weekly review|vineyard|barrels|wine shop|honesty box|tasting room|playground|home|fridge|kitchen|cupboard|treadmill|sofa|my room|bed|journal|emotion shelf|wardrobe|scratchpad|pond|garden|shed|swing|letterbox|animal run|client table|planning table|bank|courtyard|trophy room|trophy book|affirmations|kind words|routines|revenue chart|market|well|town hall|chord|library|chico|post office"}
{"type":"open","what":"fridge|chores|quests|bag|mail|cal|settings|friend"}
{"type":"pet"}
{"type":"feed_animals"}  (feed the chicks and bunnies from her backpack)
{"type":"routine_set","name":"Beauty routine","days":{"mon":"...","tue":"..."}}  or  {"type":"routine_set","name":"Morning routine","items":["...","..."]}  (save a routine to the noticeboard in her room: days = one step per weekday, items = a daily checklist; replaces that routine's steps)
{"type":"last_done","what":"Evan's sheets","date":"YYYY-MM-DD"}  (log when an every-so-often household job was last done: aircon servicing, sheets, etc.; date optional, defaults to today)
{"type":"save","vault":"Japan trip","amount":200}  (add savings to one of her bank vaults by its label; a negative amount takes some out)
{"type":"kudos_add","text":"the compliment, in their words","from":"who said it"}  (when she shares something nice someone said about her: pin it to the Kind words board in the town hall)
{"type":"remind","text":"get the laundry in","minutes":60}  or  {"type":"remind","text":"call mum","at":"18:30","date":"YYYY-MM-DD"}  ("remind me to..."; minutes from now, or a 24-hour Singapore time with an optional date; text is short and starts with a verb; say the time back to her)
What's happening in the village right now: ${chatContext()}${planText}
Conversation so far:
${history || "(just started)"}
Mel: ${text}
Return JSON only: {"reply": "...", "actions": [ ... ]}`, {modelTier: "quick", cache: false});
    const reply = plain(String((d && d.reply) || "Hmm, I lost my words. Try again?")).slice(0, 600);
    const did = (await Promise.all((Array.isArray(d && d.actions) ? d.actions : []).slice(0, 8).map(async a => { try { return await runChatAction(a); } catch { return null; } }))).filter(Boolean);
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
  el.innerHTML = (chatLog.length ? "" : `<p class="fox">${icon("fox", 18)}Hi! Ask me anything, or tell me what you need. I can add to your shopping list, tick chores, start a break or a tidy timer, add or drop quests, log water and steps, set reminders that ping your phone, or walk you somewhere.</p>`)
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
      else { delete S.pond.shown; S.pond.done = Date.now(); act("cheer"); setSay(fromRoutine ? "That's the day, Mel. Rest well. Tomorrow's first thing is in the note." : "That's the day, Mel. Tell chat “wind down” whenever you're ready."); save(); }
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
    flash(`Bought ${d.n.toLowerCase()}`); speak(d.where === "me" ? (id === "me_pj" ? "Silk pyjamas! You'll wear them in your room." : id === "me_hat" ? "Sun hat on whenever you're outside!" : "Ooh, that suits you.") : d.where === "room" ? "Ooh! It's waiting in your room." : "Ooh! It's waiting for you at home.", 3500);
  } else if (F.decor[d.slot] === d.val) { delete F.decor[d.slot]; speak("Put away for now.", 2500); }
  else { F.decor[d.slot] = d.val; speak("Swapped in. Go and have a look!", 3000); }
  save(true);
}
function useItem(id){
  const it = ITEMS[id]; if (!it || !F.inv[id]) return;
  if (it.kind === "seed") { speak("Seeds go in the garden. Tap a plot there!", 3500); return; }
  if (it.kind === "gift") { giveGift(id); return; }
  if (it.kind === "bouquet") { giveBouquet(id); return; }
  if (it.kind === "pot") { potItem = id; orView = "pot"; openView = null; render(); return; }
  if (it.kind === "ingredient") { toKitchen(id); return; }
  if (it.kind === "feed") { if (openView) { openView = null; ctx(); } speak("That's for the animals. Off to the run!", 3000); walkToPlace("animal run"); return; }
  if (it.kind === "tool") {
    act(it.act, it); speak(it.say, 4000);
    if (!F.cool[id] || Date.now() - F.cool[id] > 20*M) { F.cool[id] = Date.now(); gainXp(1); }
    save(); return;
  }
  addInv(id, -1); gainXp(it.xp || 1); sfx("purr");
  act(it.kind === "food" ? "eat" : it.kind === "flower" ? "flower" : it.act, it); speak(it.say, 4500); save();
}
// Arriving at the orchard or flower farm: Ma Ma hands over the farm shop's takings and says hello (or calls Mel in
// for tea in the afternoon)
function orchardArrive(id){
  const o = orchState(F), n = handTin(F), here = isHere("mama"), today = dayKey();
  if (n) { sfx("chaching"); flash(`+${n} coins from the farm shop`); S.earned += n; save(true); }
  const empty = !o.trees.some(Boolean) && !o.beds.some(Boolean) && !o.bushes.some(Boolean);
  const faded = [...o.trees.map(p => stateOf("tree", p, today)), ...o.beds.map(p => stateOf("bed", p, today)), ...o.bushes.map(p => stateOf("bush", p, today))].filter(x => x.stage === "faded").length;
  const tea = whereIs("mama") === "cottage" && sgHM() >= 15*60 && sgHM() < 16*60 && o.tea !== today && S.teaAsk !== today;
  const line = tea ? (S.teaAsk = today, "Ma Ma's waving from her cottage door: \"Come, come! Tea and cake!\"")
    : n ? `Ma Ma presses ${n} coins into your hand. "I sold some at the shop today. For you."`
    : empty && id === "orchard" ? "So much empty ground! Ma Ma says: \"Plant some trees, I'll take care of them.\""
    : faded ? `${faded} spot${faded === 1 ? "'s" : "s have"} had their season. Ma Ma's saving the ground for something new.` : null;
  const tr = tourNow(today, sgHM());
  if (tr && !line) { const who = [tr.guide, ...tr.group].map(x => (NPCS.find(n => n.id === x) || {name: x}).name);
    setTimeout(() => speak(`A farm tour's on! ${who[0]} is showing ${who.slice(1, -1).join(", ")} and ${who[who.length - 1]} around.`, 5500), 1200); return; }
  const quote = /"(.+)"$/.exec(line || "");
  if (line) setTimeout(() => { if (here && quote && !tea && !n) npcSay("mama", quote[1]); else speak(line, 5500); }, 1200);
}
// A bouquet goes to whoever's nearest in this scene (a villager, Darren, Evan, or Ma Ma, who loves them most)
const BQ_THANKS = ["Flowers? For me? You're too kind!", "Oh, they're beautiful. Thank you!", "These are going straight in a jar on my table.", "What a lovely surprise. Thank you, Mel."];
const MAMA_THANKS = ["Aiyo, so pretty! You shouldn't spend on Ma Ma. I love you.", "Flowers for Ma Ma? My girl is so sweet.", "I'll put them by the TV. Thank you, sayang."];
function giveBouquet(id){
  const it = ITEMS[id], near = npcActors().map(([, e]) => e).filter(e => e.kind === "npc").map(e => [e, Math.hypot(e.x - mel.x, e.y - mel.y)]).sort((a, b) => a[1] - b[1])[0];
  const ev = evanHere() && Math.hypot(evan.x - mel.x, evan.y - mel.y);
  if (ev !== false && ev < 160 && (!near || ev < near[1])) { addInv(id, -1); if (openView) { openView = null; ctx(); } evanSays("flowers! for me?"); mprop("heart", evan.x, evan.y - 44, 1800); gainXp(1); flash("Evan sniffed every single flower"); save(true); return; }
  if (!near) { speak("Nobody about to give it to. Find a friend, or Ma Ma!", 3500); return; }
  if (near[1] > 170) { speak(`Walk over to ${near[0].def.name} to give it.`, 3200); return; }
  const who = near[0].def; addInv(id, -1); if (openView) { openView = null; ctx(); }
  F.bouquets = F.bouquets || {}; F.bouquets[who.id] = (F.bouquets[who.id] || 0) + 1;
  npcSay(who.id, pick(who.id === "mama" ? MAMA_THANKS : BQ_THANKS)); mprop("heart", near[0].x, near[0].y - 50, 1800); sfx("chime"); gainXp(1);
  flash(`${who.name} loved the ${it.n.toLowerCase()}`); save(true);
}
// Tea and cake with Ma Ma in her cottage, once a day: a few coins, a little xp, and a lot of love
function haveTea(){
  const o = orchState(F); if (o.tea === dayKey() || !isHere("mama")) return;
  o.tea = dayKey(); earn(3, "tea with Ma Ma"); gainXp(1); sfx("chime"); orView = null; ctx();
  npcSay("mama", pick(["Eat more cake! You're too thin.", "Slowly, slowly. Tea is for resting.", "I'm so proud of you, ah girl. I love you.", "Did you sleep enough? You look tired."]));
  setTimeout(() => speak("Pandan chiffon and jasmine tea. Maple got the crumbs.", 4500), 2500); save(true);
}
// Send all of one ingredient from the backpack to the wine shop kitchen's larder
function toKitchen(id){
  const n = sendToKitchen(F, id); if (!n) return;
  sfx("paper", true); speak(`${n} ${(ITEMS[id].n || id).toLowerCase()} off to the kitchen larder at the wine shop.`, 3500); save(true);
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
  } else if (it.to === "grands") {
    // whichever grandparent is nearest (both live in the cottage in the orchard)
    const here = ["mama", "gonggong"].map(g => [g, npcPos(g)]).filter(([, p]) => p).sort((a, b) => Math.hypot(a[1].x - mel.x, a[1].y - mel.y) - Math.hypot(b[1].x - mel.x, b[1].y - mel.y))[0];
    if (!here) { const w = whereIs("mama"); speak(`Ma Ma and Gong Gong aren't here. ${w === "cottage" ? "They're home in the cottage" : w ? "Ma Ma's out at the " + ({orchard: "orchard", flowers: "flower farm", village: "town square", vineyard: "vineyard", base: "house", field: "field"}[w] || w) : "Try the orchard"}. Give it to them in person!`, 4500); return; }
    const [g, p] = here; addInv(id, -1); F.fam.gifts[g] = (F.fam.gifts[g] || 0) + 1;
    showMap(); npcSay(g, it.say + (g === "mama" ? " I love you." : "")); burst(p.x, p.y - 20); sfx("chime"); flash(`${g === "mama" ? "Ma Ma" : "Gong Gong"} loved the ${it.n.toLowerCase()}`);
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
  if (it.kind === "pet") {
    const a = addAnimal(F, it.pet); if (!a) { speak("The run's full. Darren can make it bigger: tap the run at home.", 4000); return; }
    F.coins -= it.price; sfx("chaching"); flash(`${a.name} the ${KINDS[it.pet].n.toLowerCase()} is in the run at home`); speak(`${it.say} I'll call it ${a.name}.`, 5000); save(true); return;
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
  const C = CROPS[p.crop], n = C.yield || 1;
  addInv(p.crop, n); F.plots[i] = null; gainXp(1); S.harvested = (S.harvested || 0) + 1; F.harvestTotal = (F.harvestTotal || 0) + 1; mprop(CROPS[p.crop].ico, PLOTS[i].x + 50, PLOTS[i].y + 20, 1900); act("cheer");
  speak(n > 1 ? `Harvested ${n} ${C.ns || C.n.toLowerCase()}! They're in your backpack.` : `Harvested a ${C.n.toLowerCase()}! It's in your backpack.`, 4000); save(true);
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
        ${(() => { const sl = subView(t).list, nx = sl.find(x => !x.done); return sl.length ? `<li class="subnext">${nx ? `<span class="hl">Up next:</span> ${esc(nx.title)}` : "Every subtask ticked."} <small>${sl.filter(x => x.done).length} of ${sl.length} subtasks done${nx ? " · tick them off in the notebook" : ""}</small></li>` : ""; })()}
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
    h += `<h1><span class="lbl">${S.decompFree || !S.decompFor ? "right now" : "after " + esc(S.decompFor)}</span>Decompress</h1>${clench ? timerHTML("clench and hold") : ""}
      <ul class="bujo"><li class="first"><span><span class="hl">Stomach clench, 30 seconds.</span> Hold, then release.</span></li><li>Three quick points in <span class="hl">your journal</span>${S.decompFree ? "" : " (or tell chat, and it files them)"}, then let it go.</li><li>Make a hot drink and bring it back.</li></ul>
      <div class="actions">${clench ? "" : `<button class="btn primary" data-a="clench">Start the 30 seconds</button>`}<button class="btn alt" data-a="journal">Open my journal</button><button class="btn yes" data-a="decompressed">All done</button></div>`;
  } else if (ph === "recap") {
    const done = allTasks().filter(t => S.doneIds.includes(t.id));
    h += `<h1><span class="lbl">that's a wrap</span>The day is done</h1>
      <ul class="bujo"><li class="tick">Five-minute clean</li>${done.map(t => `<li class="tick">${esc(t.title)}</li>`).join("")}
      <li${S.steps >= 5000 ? ` class="tick"` : ""}>${S.steps.toLocaleString()} / 5,000 steps</li><li>${S.earned} coins earned today</li>
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
    j.innerHTML = `<button class="qnslim" data-qn="open" aria-label="Open the quest note">${icon("note", 20)} <b>${esc(title)}</b>${when}<span class="more">open</span></button>`;
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
  if (view === "settings") { $("setMusic").checked = sound.music; $("setVol").value = sound.musicVol; $("setSfx").checked = sound.sfx; $("setQuiet").checked = F.quietEvening !== false; $("setBed").checked = F.bedLock !== false; }
  ["ctx", "questsView", "bagView", "mailView", "friendView", "calView", "settingsView", "chatView"].forEach(id => $(id).hidden = id !== (views[view] || view));
  p.className = "panel " + (view === "quests" ? "cork" : view === "ctx" ? skin : "paper");
  document.querySelectorAll("[data-open]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.open === openView)));
}
function closePanel(){
  if (openView) { openView = null; ctx(); return; }
  if (kid.open) { kid.open = null; stopKidGame(); ctx(); return; }
  boardOpen = false; shelfOpen = false; shedOpen = false; runOpen = false; wardOpen = false; bedOpen = false; journalOpen = false; scratchOpen = false; calmOpen = false; recOpen = false; clientsOpen = false; planOpen = false; revOpen = false; jarsOpen = false; deskOpen = false; kudosOpen = false; routOpen = false; trophyView = null; lettersOpen = false; vaultView = null; vyView = null; reviewOpen = false; kView = null; orView = null; selPlot = null; homeView = null; postOpen = false; healthOpen = false; newsOpen = false; if (scene === "market") shopClosed = true; ctx();
}
// Today's calendar panel (Google Calendar via the mcp capability).
async function renderCal(fresh){
  const el = $("calBody");
  document.querySelectorAll("[data-caltab]").forEach(b => { b.setAttribute("aria-selected", String(b.dataset.caltab === calTab)); b.onclick = () => { calTab = b.dataset.caltab; renderCal(); }; });
  $("calTitle").textContent = calTab === "content" ? "Content calendar" : "Today";
  if (calTab === "content") { el.innerHTML = contentHTML(); wireContent(el, () => renderCal()); return; }
  el.innerHTML = `<p class="muted">Opening your calendar…</p>`;
  const r = await todaysEvents(dayKey(), fresh), nowT = Date.now();
  if (calTab === "content") return;   // switched tabs while today's events were loading
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
  const rems = upcomingReminders(F);
  h += `<p class="eyebrow" style="margin:16px 0 6px">Reminders</p>` + (rems.length ? `<ul class="qlist rems">${rems.map(x => `<li><span><b>${esc(x.text)}</b><small>${esc(fmtWhen(x.at))}${x.at <= nowT ? " · done" : ""}</small></span>${x.at > nowT ? `<button class="next" data-rem="${esc(x.id)}">cancel</button>` : ""}</li>`).join("")}</ul>`
    : `<p class="muted">None set. Tell ${esc(F.name)} "remind me to get the laundry in in an hour" and your phone will ping you.</p>`);
  h += `<div class="actions"><button class="btn alt small" id="calRefresh">Refresh</button></div>`;
  el.innerHTML = h; $("calRefresh").onclick = () => renderCal(true);
  el.querySelectorAll("[data-rem]").forEach(b => b.onclick = async () => { b.disabled = true;
    const restore = await cancelReminder(F, b.dataset.rem, () => save()); renderCal();
    if (restore) undoable("Reminder cancelled", async () => { await restore(); renderCal(); }); });
}
function itemBtn(id, label, disabled, extra){
  const it = ITEMS[id];
  return `<button class="item" data-id="${id}" ${disabled ? "disabled" : ""}><span class="e">${icon(it.ico, 34)}</span><span class="n">${esc(it.n)}</span><span class="c">${label}</span>${extra || ""}</button>`;
}
function ctx(){
  const c = $("ctx"); let h = "";
  // a game in progress isn't redrawn by background refreshes (it would restart under Evan's fingers)
  if (kid.open && scene === "kidroom" && c.dataset.kid === kid.open && !$("panel").hidden && !openView) return;
  if (vaultView && bv.pouring && !$("panel").hidden && !openView) return;   // never interrupt jewels mid-pour
  c.dataset.kid = kid.open && scene === "kidroom" ? kid.open : "";
  if (kid.open && scene === "kidroom") h = kidPanel(kid.open);
  else if (homeView && scene === "home") h = hestiaPanel(homeView);
  else if (deskOpen && scene === "home") h = deskPanel();
  else if (vaultView && scene === "bank") h = vaultView === "overview" ? bankOverview(isHere("opal")) : vaultPanel();
  else if (reviewOpen && scene === "hall") h = reviewPanel(F, reviewCtx());
  else if (orView === "pot" && potItem) h = potPanel(F, potItem);
  else if (orView === "tea" && scene === "cottage") h = teaPanel(F, dayKey(), isHere("mama"));
  else if (orView && (scene === "orchard" || scene === "flowers")) h = orView === "shop" ? shopPanel(F, dayKey(), orTab) : spotPanel(F, orAt.where, orAt.i, dayKey());
  else if (kView && scene === "kitchen") h = kView === "oven" ? ovenPanel(F) : kView === "press" ? pressPanel(F) : kView === "stove" ? stovePanel(F, dayKey()) : larderPanel(F);
  else if (vyView && (scene === "vineyard" || scene === "wineshop")) h = vyView === "olive" ? olivePanel(F) : vyView === "vine" ? vinePanel(F, vyAt.r, vyAt.i) : vyView === "stall" ? stallPanel(F) : vyView === "barrels" ? barrelPanel(F)
    : vyView === "shelf" ? shelfPanel(F) : vyView === "counter" ? counterPanel(F, serving(), whereIs("celeste") === "wineshop") : vyView === "box" ? boxPanel(F) : cafePanel(F, NPCS.filter(n => n.id !== "celeste" && isHere(n.id)).map(n => n.name), dayKey());
  else if (kudosOpen && scene === "trophy") h = kudosPanel();
  else if (trophyView && scene === "trophy") h = trophyView === "book" ? bookPanel(F, onPedestals(F).length < PEDESTALS) : trophyView === "affirm" ? affirmPanel(F.affirm, affirmBusy, !!sampleCap) : trophyView === "fountain" ? fountainPanel(!!sampleCap) : pedestalPanel(onPedestals(F)[+trophyView.slice(3)], nextUp(trophyCtx()), true);
  else if (routOpen && scene === "room") h = routinesPanel();
  else if (lettersOpen && (scene === "room" || scene === "base")) h = lettersPanel(!!sampleCap);
  else if (postOpen && scene === "post") h = postPanel();
  else if (healthOpen && (scene === "chord" || scene === "chico")) h = healthPanel(scene);
  else if (newsOpen && scene === "village") h = goodNewsHTML(myWins());
  else if (scene === "market" && !shopClosed) {
    const tabs = [["seeds","Seeds"],["treats","Treats"],["deli","Deli"],["care","Care"],["family","Family"],["animals","Animals"],["home","Home"],["me","Me & my room"],["sell","Sell"]];
    h = `<span class="tape gingham" aria-hidden="true"></span><h2>The market</h2><p class="sub">You have ${icon("coin", 16)} ${F.coins}. Seeds and treats go straight into your backpack.</p>
      <div class="tabs" role="tablist">${tabs.map(([k, n]) => `<button role="tab" data-shop="${k}" aria-selected="${shopTab === k}">${n}</button>`).join("")}</div><div class="items shop">`;
    if (shopTab === "home" || shopTab === "me") {
      h += Object.keys(DECOR).filter(id => (DECOR[id].tab || "home") === shopTab).map(id => { const d = DECOR[id], own = F.decorOwned[id], on = own && F.decor[d.slot] === d.val;
        return `<button class="item" data-decor="${id}" ${!own && F.coins < d.price ? "disabled" : ""}><span class="e">${icon(d.ico, 34)}</span><span class="n">${esc(d.n)}</span><span class="c">${on ? (d.where === "me" ? "wearing it" : d.where === "room" ? "in your room" : "in your home") : own ? "tap to use" : `<b>${d.price}</b> ${icon("coin", 13)}`}</span></button>`; }).join("")
        + `<p class="muted" style="grid-column:1/-1">Bought once, kept forever. ${shopTab === "me" ? "Room things appear in your room; the rest you wear around the village." : "They appear inside your house."} Tap something you own to swap it in or put it away.</p>`;
    } else if (shopTab === "sell") {
      const sellable = Object.keys(F.inv).filter(id => ITEMS[id] && ITEMS[id].sell);
      h += sellable.length ? sellable.map(id => itemBtn(id, `sell <b>+${ITEMS[id].sell}</b> ${icon("coin", 13)}`, false, `<span class="cnt">×${F.inv[id]}</span>`)).join("") : `<p class="muted" style="grid-column:1/-1">Nothing to sell yet. Grow something in the garden!</p>`;
    } else {
      const season = seasonOf(dayKey());
      if (shopTab === "seeds") h += `<p class="muted" style="grid-column:1/-1">${SEASONS[season].n} seeds: ${SEASONS[season].line.toLowerCase()}. New ones arrive each season, and anything you've already bought or planted keeps growing.</p>`;
      h += Object.keys(ITEMS).filter(id => ITEMS[id].tab === shopTab && (!ITEMS[id].seasons || ITEMS[id].seasons.includes(season))).map(id => {
        const it = ITEMS[id], locked = it.need && S.earned < it.need, owned = it.kind === "keep" ? F.fam.owned[id] : it.kind === "tool" && F.inv[id];
        const extra = it.kind === "seed" ? ` · ${dur(CROPS[it.crop].dur)} · ${CROPS[it.crop].yield || 1} a harvest` : it.to ? ` · ${it.to === "evan" ? "Evan" : it.to === "grands" ? "Ma Ma and Gong Gong" : "Darren"}` : "";
        if (it.kind === "pet") { const full = roomLeft(F) <= 0; return itemBtn(id, full ? "the run is full" : `<b>${it.price}</b> ${icon("coin", 13)}`, full || F.coins < it.price); }
        return itemBtn(id, locked ? `earn ${it.need} today` : owned ? (it.kind === "keep" ? "at home" : "owned") : `<b>${it.price}</b> ${icon("coin", 13)}${extra}`, locked || owned || F.coins < it.price, F.inv[id] && !owned ? `<span class="cnt">×${F.inv[id]}</span>` : "");
      }).join("");
      if (shopTab === "animals") h += `<p class="muted" style="grid-column:1/-1">Chicks, bunnies and goats go straight to the run at home (${F.pets.animals.length} of ${["2", "4", "6", "8"][F.pets.run]} there now). Each eats once a day (grown hens come for breakfast, lunch and dinner, with an egg each time): a bag of feed is one meal, and bunnies love a garden carrot too. Upgrade the run from the run itself.</p>`;
      if (shopTab === "deli") h += `<p class="muted" style="grid-column:1/-1">For the wine shop's kitchen: flour bakes into loaves in the oven, cheese and olives go on boards and in tapas. They go in your backpack: send them to the kitchen from there.</p>`;
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
  } else if (bedOpen && scene === "room") {
    h = `<span class="tape gingham" aria-hidden="true"></span><h2>Your bed</h2>` + (S.sleep
      ? `<p class="sub">${S.sleep.until ? `Napping. Up in about ${Math.max(1, Math.ceil((S.sleep.until - Date.now())/M))} min.` : "Fast asleep. Sweet dreams."}</p><div class="actions"><button class="btn yes" data-bed="up">Get up</button></div>`
      : `<p class="sub">Fluffy pillows, cool sheets${(F.decor || {}).r_throw ? ", your knitted throw" : ""}.</p><div class="actions"><button class="btn primary" data-bed="nap">Nap for 20 minutes</button><button class="btn alt" data-bed="sleep">${sgHM() >= 20*60 || sgHM() < 5*60 ? "Go to sleep" : "Lie down"}</button></div>`);
  } else if (jarsOpen && scene === "room") {
    h = jarsPanel(jv);
  } else if (recOpen && scene === "room") {
    const on = sound.music, ct = currentTrack();
    h = `<span class="tape gingham" aria-hidden="true"></span><h2>Record player</h2><p class="sub">${on ? `Playing: ${esc(TRACKS[ct].name)}.` : "Pick a record to put on."}</p>
      <div class="records">${Object.entries(TRACKS).map(([id, t]) => `<button class="record${on && id === ct ? " on" : ""}" data-track="${id}"><svg viewBox="0 0 40 40" width="46" height="46" aria-hidden="true"><circle cx="20" cy="20" r="18" fill="#2F2B28"/><circle cx="20" cy="20" r="13" fill="none" stroke="#4A4540" stroke-width=".8"/><circle cx="20" cy="20" r="9" fill="none" stroke="#4A4540" stroke-width=".8"/><circle cx="20" cy="20" r="6.5" style="fill:${t.col}"/><circle cx="20" cy="20" r="1.4" fill="#FFFDF6"/></svg><span class="n">${esc(t.name)}</span><span class="c">${on && id === ct ? "playing now" : esc(t.mood)}</span></button>`).join("")}</div>
      <div class="actions recrow"><label for="recVol" class="muted">Volume</label><input id="recVol" type="range" min="0" max="1" step="0.05" value="${sound.musicVol}">${on ? `<button class="btn alt small" data-rec="stop">Lift the needle</button>` : ""}</div>`;
  } else if (calmOpen && scene === "room") {
    h = `<span class="tape gingham" aria-hidden="true"></span><h2>Calm corner</h2>` + (breath
      ? `<div class="breathe"><div class="ring" style="animation-delay:-${((Date.now() - breath.start)/1000 % CYCLE).toFixed(2)}s"></div><p class="cue" id="breathCue">Breathe in</p></div><p class="sub" style="text-align:center"><span id="breathLeft"></span> left</p><div class="actions" style="justify-content:center"><button class="btn alt small" data-calm="stop">Stop</button></div>`
      : `<p class="sub">Cushions, ${(F.decor || {}).r_candle ? "a candle, " : ""}one slow breath.</p><p class="eyebrow">Guided breathing</p><div class="actions">${[1, 3, 5].map(m => `<button class="btn ${m === 3 ? "primary" : "alt"} small" data-calm="${m}">${m} min</button>`).join("")}</div>
        <p class="eyebrow" style="margin-top:14px">After a call, or any time</p><div class="actions"><button class="btn alt small" data-calm="decompress">Decompress</button></div>`);
  } else if (journalOpen && scene === "room") {
    h = journalPanel(S.mode === "decompress" && S.decompFree);
  } else if (revOpen && scene === "hall") {
    h = revenuePanel(F);
  } else if (planOpen && scene === "hall") {
    h = planningPanel(sampleCap);
  } else if (clientsOpen && scene === "hall") {
    h = clientsPanel(!!sampleCap);
  } else if (scratchOpen && scene === "hall") {
    h = scratchPanel();
  } else if (wardOpen && scene === "room") {
    h = wardrobePanel(F, {sample: !!sampleCap, busy: ward.busy, error: ward.error, ask: ward.ask});
  } else if (runOpen && scene === "base") {
    h = runPanel(F);
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
  if (kid.open && scene === "kidroom") wireKid(c, kid.open, {eat: id => { kid.open = null; ctx(); kidEat(id); }, close: () => { kid.open = null; stopKidGame(); ctx(); }});
  if (homeView && scene === "home") wireHestia(c, homeView);
  if (deskOpen && scene === "home") wireDesk(c, () => ctx());
  if (reviewOpen && scene === "hall") wireReview(c, F, {save: () => save(), rerender: () => ctx(), say: l => speak(l, 5000, true), sfx, canSend: !rvw.noMcp, today: dayKey(), coins: n => { F.coins += n; S.earned = (S.earned || 0) + n; flash(`+${n} coins: weekly review`); }});
  if (kView && scene === "kitchen") wireKitchen(c, F, {save: () => save(true), rerender: () => { ctx(); drawScene(); }, say: l => speak(l, 4500), sfx, today: dayKey()});
  if (orView) wireOrchard(c, F, {save: () => save(true), rerender: () => { ctx(); drawScene(); }, say: l => speak(l, 4500), sfx, today: dayKey(), where: orAt && orAt.where, i: orAt && orAt.i, item: potItem,
    tab: k => { orTab = k; ctx(); }, placed: () => { orView = null; potItem = null; ctx(); drawScene(); }, tea: haveTea});
  if (vyView && (scene === "vineyard" || scene === "wineshop")) wireVine(c, F, {harvest: (festivalOn(dayKey()) || {}).id === "harvest", save: () => save(true), rerender: () => { ctx(); drawScene(); }, say: l => speak(l, 4500), sfx, r: vyAt && vyAt.r, i: vyAt && vyAt.i});
  if (vaultView && scene === "bank") {
    c.querySelectorAll("[data-vopen]").forEach(el => { const go = () => { bv.slot = +el.dataset.vopen; bv.mode = "jar"; vaultView = "jar"; ctx(); }; el.onclick = go; el.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } }; });
    if (vaultView === "jar") wireVault(c, {rerender: () => { ctx(); drawScene(); }, undoable, sfx, close: () => { vaultView = null; vyView = null; reviewOpen = false; kView = null; orView = null; ctx(); drawScene(); }, poured: vaultPoured});
  }
  c.querySelectorAll("[data-letters]").forEach(b => b.onclick = () => { journalOpen = false; lettersOpen = true; lv.mode = "home"; sfx("paper", true); ctx(); });
  if (lettersOpen && (scene === "room" || scene === "base")) wireLetters(c, {rerender: () => ctx(), sample: sampleCap, toJournal: t => { const e = addEntry(t, "letter"); if (e) { sfx("chime"); flash("Saved to your journal"); } return !!e; },
    sent: (k, d) => { sfx("paper"); speak(k === "universe" ? "Posted. The universe always writes back. Keep an eye on the letterbox." : `Sealed. It'll arrive in your letterbox on ${new Date(d + "T00:00:00Z").toLocaleDateString("en-GB", {day: "numeric", month: "long", year: "numeric", timeZone: "UTC"})}.`, 5000); }});
  if (routOpen && scene === "room") wireRoutines(c, {rerender: () => ctx(), undoable, done: routineCoins});
  if (trophyView && scene === "trophy") { wireTrophies(c, F, {save: () => save(true), undoable, rerender: () => { ctx(); drawScene(); }, close: () => { trophyView = null; lettersOpen = false; vaultView = null; vyView = null; reviewOpen = false; kView = null; orView = null; ctx(); drawScene(); }});
    if (trophyView === "fountain") wireFountain(c, {sample: sampleCap, rerender: () => ctx(),
      coin: () => { trophyView = null; lettersOpen = false; vaultView = null; vyView = null; reviewOpen = false; kView = null; orView = null; ctx(); sfx("coin"); mprop("sparkle", 260 + rnd(-20, 20), 400); speak(pick(["Plink. Wish made. I won't ask.", "A coin in the fountain. Something good's coming.", "Make it a big one."]), 3500); },
      keep: v => { F.vision = v; save(); }});
    if (trophyView === "affirm") { F.affirm = F.affirm || {}; wireAffirm(c, F.affirm, (F.affirm.day === dayKey() && F.affirm.items && F.affirm.items.length) ? F.affirm.items : dailyAffirmations(), {save: () => save(), undoable, rerender: () => ctx(), fresh: freshAffirmations}); } }
  if (kudosOpen && scene === "trophy") wireKudos(c, {rerender: () => { ctx(); drawScene(); }, undoable, done: () => { sfx("chime"); hearts(2); speak("Pinned up. That's a keeper.", 3000); }});
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
  c.querySelectorAll("[data-close]").forEach(b => b.onclick = () => { boardOpen = false; shelfOpen = false; shedOpen = false; runOpen = false; wardOpen = false; bedOpen = false; journalOpen = false; scratchOpen = false; calmOpen = false; recOpen = false; clientsOpen = false; planOpen = false; revOpen = false; jarsOpen = false; deskOpen = false; kudosOpen = false; routOpen = false; trophyView = null; lettersOpen = false; vaultView = null; vyView = null; reviewOpen = false; kView = null; orView = null; ctx(); });
  c.querySelectorAll("[data-bed]").forEach(b => b.onclick = () => bedAction(b.dataset.bed));
  if (jarsOpen && scene === "room") wireJars(c);
  c.querySelectorAll("[data-track]").forEach(b => b.onclick = () => { setTrack(b.dataset.track); speak(`${TRACKS[b.dataset.track].name} is on. Mmm.`, 2500); ctx(); drawScene(); });
  c.querySelectorAll('[data-rec="stop"]').forEach(b => b.onclick = () => { setMusic(false); speak("Needle up. Quiet time.", 2500); ctx(); drawScene(); });
  const rv = c.querySelector("#recVol"); if (rv) rv.oninput = () => setMusicVol(+rv.value);
  c.querySelectorAll("[data-calm]").forEach(b => b.onclick = () => { const k = b.dataset.calm;
    if (k === "stop") stopBreath(false); else if (k === "decompress") { calmOpen = false; recOpen = false; clientsOpen = false; planOpen = false; revOpen = false; jarsOpen = false; deskOpen = false; kudosOpen = false; routOpen = false; trophyView = null; lettersOpen = false; vaultView = null; vyView = null; reviewOpen = false; kView = null; orView = null; A.decompNow(); drawScene(); } else startBreath(+k); });
  if (breath) tickBreath();
  if (journalOpen && scene === "room") wireJournal(c, undoable, e => { if (e) { sfx("chime"); speak(S.mode === "decompress" && S.decompFree ? "Written down. Now you can let it go." : "Page kept. Lovely.", 3500); } ctx(); });
  if (scratchOpen && scene === "hall") wireScratch(c, undoable, () => ctx());
  if (revOpen && scene === "hall") wireRevenue(c, F, () => save(), () => { if (revOpen) ctx(); });
  if (planOpen && scene === "hall") {
    c.querySelectorAll('[data-pl="refresh"]').forEach(b => b.onclick = () => { loadPlans().then(() => { if (planOpen) ctx(); }); ctx(); });
    const pf = c.querySelector("#plForm"), pc = c.querySelector("#plChat"); if (pc) pc.scrollTop = pc.scrollHeight;
    if (pf) { const inp = pf.querySelector("#plIn"); pf.onsubmit = async ev => { ev.preventDefault(); const v = inp.value; inp.value = "";
      const ev2 = await todaysEvents(dayKey()).catch(() => ({events: []}));
      const pctx = {quests: allTasks().map(t => ({title: t.title, done: S.doneIds.includes(t.id)})), events: (ev2.events || []).slice(0, 12).map(e => ({title: e.title, time: e.allDay ? "all day" : new Date(e.start).toLocaleTimeString("en-GB", {hour: "2-digit", minute: "2-digit", timeZone: "Asia/Singapore"})}))};
      askPlans(sampleCap, v, pctx, () => { if (planOpen) { ctx(); const i = $("plIn"); if (i) i.focus(); } }); }; }
  }
  if (clientsOpen && scene === "hall") {
    c.querySelectorAll('[data-cl="refresh"]').forEach(b => b.onclick = () => { loadClients(true).then(() => { if (clientsOpen) ctx(); }); ctx(); });
    const cf = c.querySelector("#clForm"), cl = c.querySelector("#clChat"); if (cl) cl.scrollTop = cl.scrollHeight;
    if (cf) { const inp = cf.querySelector("#clIn"); cf.onsubmit = ev => { ev.preventDefault(); const v = inp.value; inp.value = ""; askClients(sampleCap, v, () => { if (clientsOpen) { ctx(); const i = $("clIn"); if (i) i.focus(); } }); }; }
  }
  const of = c.querySelector("#outfitForm");
  if (of) { const inp = c.querySelector("#outfitAsk"); inp.oninput = () => { ward.ask = inp.value; };
    of.onsubmit = async ev => { ev.preventDefault(); if (ward.busy) return; ward.busy = true; ward.error = ""; ctx();
      let o = null; try { const ev = await todaysEvents(dayKey()).catch(() => ({events: []})); o = await newOutfit(F, sampleCap, ward.ask, ev.events || []); } catch {}
      ward.busy = false; if (o) { ward.ask = ""; save(true); speak(`How about this: ${o.label.toLowerCase()}?`, 4000); } else ward.error = "Hmm, nothing came back. Try again?"; ctx(); }; }
  c.querySelectorAll("[data-feed]").forEach(b => b.onclick = () => feedAnimals(b.dataset.feed));
  c.querySelectorAll("[data-runup]").forEach(b => b.onclick = () => buyRunUpgrade());
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
  const order = ["gift","food","ingredient","feed","flower","use","tool","seed"];
  ids.sort((a, b) => order.indexOf(ITEMS[a].kind) - order.indexOf(ITEMS[b].kind));
  $("bag").innerHTML = ids.map(id => { const it = ITEMS[id];
    const lbl = it.kind === "bouquet" ? "give to someone" : it.kind === "pot" ? "place it" : it.kind === "seed" ? "plant in garden" : it.kind === "gift" ? `give to ${it.to === "evan" ? "Evan" : it.to === "grands" ? "Ma Ma or Gong Gong" : "Darren"}` : it.kind === "tool" ? "use" : it.kind === "feed" ? "for the run" : it.kind === "food" ? "feed Maple" : it.kind === "ingredient" ? "send to the kitchen" : it.kind === "flower" ? "give" : "use";
    // kitchen ingredients can go to the wine shop's larder instead (food can still be fed to Maple)
    const kit = isGood(id) && it.kind !== "ingredient" ? `<span class="tokit" role="button" tabindex="0" data-kit="${id}">to the kitchen</span>` : "";
    return itemBtn(id, lbl, it.kind === "seed", (it.kind === "tool" ? "" : `<span class="cnt">×${F.inv[id]}</span>`) + kit); }).join("");
  $("bag").querySelectorAll(".item").forEach(b => b.onclick = ev => { const k = ev.target.closest("[data-kit]"); if (k) { ev.stopPropagation(); toKitchen(k.dataset.kit); return; } useItem(b.dataset.id); });
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
    if (outside() && target.pl === "base") pos = scene === "base" ? (() => { const v = VILLAGE[target.sp]; return v.mark || [v.door[0], v.door[1] - 64]; })() : VILLAGE[BRIDGES[scene][nextHop(scene, "base")]].mark;
    else if (outside()) pos = VILLAGE[target.pl].scene === scene ? VILLAGE[target.pl].mark : VILLAGE[BRIDGES[scene][nextHop(scene, outdoorOf(target.pl))]].mark;
    else if (scene === target.pl) { const s = spotObj(scene, target.sp); pos = [s.x, s.y - 70]; }
    else pos = INNER[scene] ? [INNER[scene].exit[0], 330] : [260, 582];
  }
  if (!pos || scene === "kidroom") { m.style.display = "none"; return; }
  m.style.display = ""; m.setAttribute("transform", `translate(${pos[0]} ${pos[1]})`);
}
function drawScene(){
  const ssn = seasonOf(dayKey()); ["spring", "summer", "autumn", "winter"].forEach(k => document.body.classList.toggle("season-" + k, k === ssn));
  const day = dayKey(), wet = outside() && rainyOn(day), fest = festivalOn(day);
  $("rain").hidden = !wet;
  if (scene === "vineyard" && fest && fest.id === "harvest" && S.harvestSaid !== day) { S.harvestSaid = day; setTimeout(() => speak("It's the grape harvest! Bunting's up, and every vine gives an extra bunch this week.", 6000), 1500); }
  else if (scene === "village" && fest && !fest.vineyard && S.festSaid !== day) { S.festSaid = day; setTimeout(() => speak(`${fest.name} decorations are up in the town square!`, 5000), 1500); }
  else if (scene === "base" && S.hestiaSaid !== day && hestiaCounts().chores) { S.hestiaSaid = day; const n = hestiaCounts().chores; setTimeout(() => speak(`${n} home chore${n > 1 ? "s" : ""} waiting in the cleaning cupboard. No rush.`, 5000), 2600); }
  else if (scene === "base" && isWeekend() && S.weekendSaid !== day) { S.weekendSaid = day; setTimeout(() => speak("Weekend! Home things happen here at home. Any work quests still wait in town.", 5500), 2200); }
  else if (wet && S.rainSaid !== day) { S.rainSaid = day; setTimeout(() => speak("Rainy day! Perfect for cosy indoor quests.", 4500), 1500); }
  $("fore").innerHTML = outside() ? "" : foreArt(scene);
  tableKey = "";
  $("sceneArt").innerHTML = scene === "village" ? villageArt() : scene === "base" ? baseArt() : scene === "lane" ? laneArt() : scene === "vineyard" ? vineyardArt() : scene === "orchard" ? orchardArt() : scene === "flowers" ? flowerFarmArt() : scene === "field" ? fieldArt() : scene === "farm" ? farmArt() : roomArt(scene);
  const names = {village:"Town square", base:"Home base", lane:"Makers' Lane", vineyard:vineyardName(F), farm:"The garden", wineshop:shopName(F), orchard:"Ma Ma's orchard", flowers:"Ma Ma's flower farm", field:"The field"};
  $("sceneName").innerHTML = `<span>${esc(names[scene] || ROOMS[scene].name)}</span>${!outside() ? `<span style="font-family:Mulish,sans-serif;font-size:.85rem">tap Exit to leave</span>` : ""}`;
  $("maphint").textContent = scene === "field" ? "Feed the swans, picnic, or kick a ball about with Evan. Paths: town (east), orchard (south)." : scene === "orchard" ? "Buy saplings at the farm shop (or tap a tree spot). Right gate: home. Left: flowers." : scene === "flowers" ? "Tap a bed or bush to plant, or buy at the farm shop. Right arch: the orchard." : scene === "cottage" ? "Ma Ma's cottage. Tap the table for tea and cake." : scene === "kitchen" ? "Bake bread, press cheese, cook small plates and today's tapas. The mat at the bottom goes back to the shop." : scene === "vineyard" ? "Tap a vine to plant, water or pick. Left gate: home. Top path: Makers' Lane." : scene === "wineshop" ? "Stock the shelves, stand behind the counter to serve, and check the honesty box." : scene === "village" ? "Tap a building to go inside. The bridge at the bottom goes home." : scene === "base" ? "Tap to walk. The bridge at the top goes to town, the gate on the right to the vineyard." : scene === "lane" ? "Chord and Chico live here. Left gate: town square. Bottom path: vineyard." : scene === "farm" ? "Tap a plot to plant, water or harvest." : scene === "market" ? "Tap the counter to open the shop." : scene === "room" ? "Just you. Nap in bed, decompress in the calm corner, write at the desk." : "Tap furniture to walk to it. The board on the wall lists this building's quests.";
}
// The tasting room's tables: a villager who sits down orders straight away (serveGuest: a glass from an open bottle,
// a fresh one opened if needed, and sometimes a plate), and their table shows what they ordered. Orders are kept for
// the day in S.served by who's sitting and which visit it is, so nobody orders twice in one sitting. Pilar, on her
// break, just has a cup of something. Redrawn only when the orders change.
let tableKey = "";
function drawTableware(){
  if (scene !== "wineshop") return;
  S.served = S.served || {};
  const seats = npcActors().map(([, e]) => e).filter(e => e.kind === "npc" && e.act === "sit" && !e.moving);
  seats.forEach(e => { const k = `${e.def.id}:${e.key}`; if (k in S.served || e.def.id === "pilar") return;
    const out = serveGuest(F, {serving: serving(), today: dayKey()}); S.served[k] = out ? {wine: out.wine, dish: out.dish || null} : {};
    if (out) { save(); if (serving()) { sfx("coin"); flash(`+${out.coins} coins: ${e.def.name} ordered ${out.dish ? "a glass and a plate" : "a glass"}`); }
      if (out.opened) setTimeout(() => npcSay(e.def.id, `Ooh, you've opened the ${out.name}! A glass of that, please.`), 600); } });
  const orders = seats.map(e => [e, S.served[`${e.def.id}:${e.key}`] || {}]);
  const key = orders.map(([e, o]) => `${e.def.id}${Math.round(e.x)}${o.wine || ""}${o.dish || ""}`).join();
  if (key === tableKey && $("tableware")) return; tableKey = key;
  const T = ROOMS.wineshop.pos.T, tables = [[T[0] - 70, T[1]], [T[0] + 70, T[1] - 6]];
  let h = "";
  orders.forEach(([e, o]) => { const [tx, ty] = tables.reduce((a, b) => Math.abs(b[0] - e.x) < Math.abs(a[0] - e.x) ? b : a), side = e.x < tx ? -1 : 1;
    if (o.dish) h += `<g transform="translate(${tx + side*13 - 11} ${ty - 36})">${dishArt(o.dish, 22)}</g>`;
    if (o.wine) h += `<g transform="translate(${tx + side*26 - 4} ${ty - 44})">${glassArt(o.wine, 14)}</g>`; });
  let g = $("tableware"); if (!g) { g = document.createElementNS("http://www.w3.org/2000/svg", "g"); g.id = "tableware"; g.setAttribute("pointer-events", "none"); $("sceneArt").appendChild(g); }
  g.innerHTML = h;
}
function dressMel(){
  const d = F.decor || {}, show = (id, on) => { const e = $(id); if (e) e.style.display = on ? "" : "none"; };
  const pj = !!d.me_pj && scene === "room";
  show("melBow", !!d.me_bow); show("melHat", !!d.me_hat && outside()); show("melScarf", !!d.me_scarf && !pj); show("melPj", pj);
  const m = $("mel"); if (m) m.style.visibility = S.sleep && scene === "room" ? "hidden" : "";
}
function render(redraw){
  if (S.day !== dayKey()) S = freshToday();
  $("evan").style.display = evanHere() ? "" : "none";
  creditEarly(); dressMel();
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
    return `<li class="${dn ? "done" : ""}${t.id === cur ? " cur" : ""}${pickable ? " pick" : ""}"${pickable ? ` data-pick="${esc(t.id)}" role="button" tabindex="0"` : ""}><span class="pl">${icon(placeOf(t), 20)}</span><span class="t">${dn ? `<i class="tk" aria-label="done"></i>` : ""}${esc(t.title)}</span><small>${esc(VILLAGE[placeOf(t)].name)} · ${esc(spotObj(placeOf(t), spotOf(t)).name)}${t.id === cur ? " · doing now" : ""}${t.early ? " · from tomorrow" : ""}${!dn ? ` <button class="drop" data-drop="${esc(t.id)}" aria-label="Not needed today: remove from today's quests">not today</button>` : ""}</small>${pickable ? `<button class="next" data-next="${esc(t.id)}">do this now</button>` : "<span></span>"}</li>`; }).join("")
    + ((S.dropped || []).length ? `<li class="dropped"><small>Dropped today: ${(S.dropped || []).map(id => { const t = ((P && P.tasks) || []).find(x => x.id === id); return t ? `${esc(t.title)} <button class="drop" data-undrop="${esc(id)}">bring back</button>` : ""; }).filter(Boolean).join(" · ")}</small></li>` : "");
  $("list").querySelectorAll("[data-drop]").forEach(el => el.onclick = ev => { ev.stopPropagation(); dropTask(el.dataset.drop); });
  $("list").querySelectorAll("[data-undrop]").forEach(el => el.onclick = ev => { ev.stopPropagation(); undropTask(el.dataset.undrop); });
  $("list").querySelectorAll("[data-next]").forEach(el => el.onclick = ev => { ev.stopPropagation(); doNext(el.dataset.next); });
  $("list").querySelectorAll("[data-pick]").forEach(el => el.onclick = () => doNext(el.dataset.pick));
  renderTomorrow();
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
// Evan's bedtime: 8pm to 7am he's asleep in his car bed, so he isn't out at home base or in the house
const evanNight = () => { const m = sgHM(); return m >= 20*60 || m < 7*60; };
const evanHere = () => scene === "kidroom" || ((scene === "base" || scene === "home" || scene === "vineyard" || scene === "field") && !evanNight());
function outside(){ return OUTDOOR.includes(scene); }
const bounds = () => scene === "village" ? [14, 150, W - 14, 598] : scene === "base" ? [14, 114, W - 14, HH - 14] : (scene === "lane" || scene === "vineyard" || scene === "orchard" || scene === "flowers") ? [14, 140, W - 14, HH - 14] : scene === "field" ? [14, 164, W - 14, HH - 14] : [34, 168, W - 34, 612];

function setScene(id, at){
  const w = $("world"), from = scene; w.classList.add("fading");
  setTimeout(() => {
    if (S.sleep && id !== "room") S.sleep = null;
    scene = id; cam.snap = true; atSpot = null; boardOpen = false; shelfOpen = false; selPlot = null; openView = null; shopClosed = false; shedOpen = false; runOpen = false; wardOpen = false; bedOpen = false; journalOpen = false; scratchOpen = false; calmOpen = false; recOpen = false; clientsOpen = false; planOpen = false; revOpen = false; jarsOpen = false; deskOpen = false; kudosOpen = false; routOpen = false; trophyView = null; lettersOpen = false; vaultView = null; vyView = null; reviewOpen = false; kView = null; orView = null; homeView = null; postOpen = false; healthOpen = false; newsOpen = false; resetNpcs();
    if (id === "post") fetchPost().then(() => { if (scene === "post") drawScene(); });
    const p = at || [260, 596];
    mel.x = mel.tx = p[0]; mel.y = mel.ty = p[1]; mel.path = []; maple.x = maple.tx = p[0] - 22; maple.y = maple.ty = p[1] + 2;
    if (id === "base") { evan.x = evan.tx = 300; evan.y = evan.ty = 360; }
    else if (id === "vineyard" || id === "field") { evan.x = evan.tx = p[0] + 26; evan.y = evan.ty = p[1] + 10; evan.run = false; evan.wait = 2; }
    else if (id === "home" && from === "kidroom") { evan.x = evan.tx = p[0] - 24; evan.y = evan.ty = p[1] + 6; evan.run = false; evan.wait = 3; }
    else if (id === "home") { evan.x = evan.tx = 300; evan.y = evan.ty = 520; }
    // Evan's room: he runs in ahead, Mel waits just inside the door, Maple stays out in the house
    kid.open = null; kid.pending = null; stopKidGame();
    if (id === "kidroom") { kid.sleep = evanNight(); mel.dir = 1; evan.x = p[0] + 30; evan.y = p[1] + 8; evan.tx = kid.sleep ? 170 : 200; evan.ty = kid.sleep ? 340 : 440; evan.run = true; evan.path = null; evan.rk = "";
      if (!kid.sleep) setTimeout(() => evanSays(pickSay(["my room!", "yay!", "play!"])), 700); }
    else kid.sleep = false;
    document.body.classList.toggle("kidmode", id === "kidroom");
    $("mmaple").style.display = id === "kidroom" ? "none" : ""; if (id === "kidroom") $("speech").hidden = true;
    $("evan").style.display = evanHere() ? "" : "none";
    render(true); w.classList.remove("fading");
    if (route.length) nextLeg();
    if (id === "base" && hungryCount(F) && !S.petNudge) { S.petNudge = true; setTimeout(() => speak("The chicks and bunnies are peeping for breakfast. Their run is by the garden.", 4500), 1400); }
    if (id === "room" && S.routSaid !== dayKey() && sgHM() < 12*60) { const st = todaysSteps().filter(x => !x.done), left = checklistLeft(); if (st.length || left) { S.routSaid = dayKey(); setTimeout(() => speak(st.length ? `${st[0].name}, today: ${st[0].text}.` : `${left} morning routine step${left > 1 ? "s" : ""} on the board.`, 5000), 1500); } }
    if (id === "hall" && F.trophyIntro) { const n = F.trophyIntro; F.trophyIntro = 0; setTimeout(() => speak(`${n} trophies are waiting for you out in the courtyard, through the archway.`, 6000), 1500); save(); }
    else if (id === "hall" && kudosCount() >= 3 && Date.now() - (F.kudosSeen || 0) > 7*864e5 && S.kudosSaid !== dayKey()) { S.kudosSaid = dayKey(); setTimeout(() => speak(`${kudosCount()} kind words out in the courtyard. Fancy a read?`, 5000), 1500); }
    if (id === "trophy") { fetchObjectives(); if (F.revTarget) loadRevenue().then(checkTrophies); setTimeout(() => speak(onPedestals(F).length ? "The courtyard. Look at all this. You did that." : "The courtyard. Your first trophy goes on a pedestal.", 4000), 900); }
    if (id === "orchard" || id === "flowers") orchardArrive(id);
    if (id === "market") speak(isHere("hana") ? "Welcome to the market! Hana's in. Have a browse." : NPCS.find(n => n.id === "hana").away, 4500);
  }, 220);
}
// route: legs of {scene, x, y, fn}
function go(target, x, y, fn){
  const legs = [];
  let cur = scene;
  if (cur !== target) {
    // An inner room (Mel's room) is reached through its parent room: out through its east door first, in through
    // the parent's west door last.
    const tIn = INNER[target] ? INNER[target].parent : target;
    if (INNER[cur] && cur !== tIn) { const I = INNER[cur], from = cur; legs.push({scene:from, x:I.exit[0], y:I.exit[1], fn:() => setScene(I.parent, I.door)}); cur = I.parent; }
    if (cur !== tIn) {
      const curOut = outdoorOf(cur), tOut = outdoorOf(tIn), c0 = cur;
      // 1. out of the building, 2. over the bridge if the target is on the other screen, 3. in at the target's door
      if (!OUTDOOR.includes(c0)) legs.push({scene:c0, x:260, y:606, fn:() => setScene(curOut, VILLAGE[c0].door)});
      for (let s = curOut, guard = 0; s !== tOut && guard < 6; guard++) {   // one bridge or gate per screen on the way
        const n = nextHop(s, tOut); if (!n) break; const b = VILLAGE[BRIDGES[s][n]], key = s + ">" + n;
        legs.push({scene:s, x:b.door[0], y:b.door[1], fn:() => setScene(n, ARRIVE[key])}); s = n;
      }
      if (!OUTDOOR.includes(tIn)) { const d = VILLAGE[tIn].door; legs.push({scene:tOut, x:d[0], y:d[1], fn:() => setScene(tIn, tIn === "farm" ? [260, 590] : [260, 596])}); }
    }
    if (INNER[target]) { const I = INNER[target]; legs.push({scene:I.parent, x:I.door[0], y:I.door[1], fn:() => setScene(target, I.arrive)}); }
  }
  legs.push({scene:target, x, y, fn});
  route = legs; atSpot = null; boardOpen = false; shelfOpen = false; shedOpen = false; runOpen = false; wardOpen = false; bedOpen = false; journalOpen = false; scratchOpen = false; calmOpen = false; recOpen = false; clientsOpen = false; planOpen = false; revOpen = false; jarsOpen = false; deskOpen = false; kudosOpen = false; routOpen = false; trophyView = null; lettersOpen = false; vaultView = null; vyView = null; reviewOpen = false; kView = null; orView = null; homeView = null; postOpen = false; healthOpen = false; newsOpen = false; openView = null; nextLeg(); render();
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
  if (id === "mydoor") { setScene("room", INNER.room.arrive); return; }
  if (scene === "cottage" && id === "tea") { orView = "tea"; sfx("paper", true); render(); return; }
  if (id === "kiddoor") { setScene("kidroom", INNER.kidroom.arrive); return; }
  if (id === "routines") { routOpen = true; rv.edit = false; sfx("paper", true); render(); return; }
  if (id === "bed") { bedOpen = true; sfx("paper", true); render(); return; }
  if (id === "window") { const shut = F.curtains ? F.curtains === "closed" : (isDusk() || !!S.sleep); F.curtains = shut ? "open" : "closed"; sfx("paper", true); speak(shut ? "Curtains open. Hello, sky." : "Curtains closed. Cosy.", 2500); save(true); return; }
  if (id === "record") { recOpen = true; sfx("paper", true); render(); return; }
  if (id === "nook") { calmOpen = true; sfx("paper", true); render(); return; }
  if (id === "jars") { jarsOpen = true; jv = {mode: "shelf", blobs: [], note: ""}; sfx("paper", true); render(); return; }
  if (id === "journal") { journalOpen = true; sfx("paper", true); render(); return; }
  if (id === "wardrobe") { wardOpen = true; ward.error = ""; sfx("paper", true); speak("Let's see what's hanging in here today.", 3000); render(); return; }
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
  if (scene === "home" && id === "desk") { deskOpen = true; sfx("paper", true); render(); loadDesk(false, () => { if (deskOpen) ctx(); }); return; }   // calendar and both inboxes
  if (scene === "bank" && /^vault\d$/.test(id)) { bv.slot = +id.slice(5); bv.mode = jarAt(bv.slot) ? "jar" : "setup"; bv.form = null; bv.amt = ""; vaultView = "jar"; sfx("paper", true); render(); return; }
  if (scene === "bank" && id === "counter") { vaultView = "overview"; sfx("paper", true); if (!npcSay("opal", pick(["Here's your passbook. Every vault at a glance.", "Lovely to see you! Shall we check on your jars?", "Your jewels are all accounted for."]))) speak("Opal's passbook is on the counter.", 3000); render(); return; }
  if (id === "trophydoor") { setScene("trophy", INNER.trophy.arrive); return; }
  if (id === "kdoor") { setScene("kitchen", INNER.kitchen.arrive); return; }
  if (scene === "kitchen") { kView = id; sfx("paper", true); render(); return; }
  if (scene === "wineshop") { vyView = {wshelf: "shelf", wcounter: "counter", hbox: "box", tasting: "tasting"}[id] || null;
    if (vyView) { sfx("paper", true); if (id === "wcounter") { vineTick(); speak(pick(["Behind the counter. Customers come in more often while you serve.", "Apron on. Who's first?", "Open for business!"]), 3500); if (isHere("celeste")) setTimeout(() => npcSay("celeste", pick(["Two of us! Let's see how busy we get.", "You pour, I'll chat."])), 1200); }
      render(); return; } }
  if (scene === "trophy" && id === "bench") { mel.sitting = true; nodes.mel.classList.add("sit"); mel.dir = 1; sfx("paper", true); speak(pick(["Ahh. Sun on your face. Stay as long as you like.", "A little sit. The fountain's doing all the talking.", "Nowhere to be for a minute."]), 4000); render(); return; }
  if (scene === "trophy" && id === "fountain") { if (vz.step === "done") vz.step = "menu"; trophyView = "fountain"; sfx("paper", true); render(); return; }
  if (scene === "trophy" && id === "tbook") { trophyView = "book"; sfx("paper", true); render(); return; }
  if (scene === "trophy" && id === "affirm") { trophyView = "affirm"; sfx("paper", true); render(); if (!(F.affirm && F.affirm.day === dayKey()) && sampleCap) freshAffirmations(); return; }
  if (scene === "trophy" && /^ped\d$/.test(id)) { trophyView = id; const t = onPedestals(F)[+id.slice(3)]; sfx(t ? "chime" : "paper", true); render(); return; }
  if (scene === "trophy" && id === "kudos") { kudosOpen = true; kv.mode = "board"; F.kudosSeen = Date.now(); sfx("paper", true); speak(kudosCount() ? "All the lovely things people have said about you." : "Pin up the nice things people say. Future you will thank you.", 3500); save(); return; }
  if (scene === "hall" && id === "review") { reviewOpen = true; sfx("paper", true); render(); loadObjectives(dayKey()).then(() => { if (reviewOpen) ctx(); }); return; }
  if (scene === "hall" && id === "whiteboard") { scratchOpen = true; sfx("paper", true); render(); return; }   // the whiteboard is Mel's scratchpad
  if (scene === "hall" && id === "revenue") { revOpen = true; sfx("paper", true); render(); loadRevenue().then(() => { if (revOpen) ctx(); }); return; }   // income from Chord
  if (scene === "hall" && id === "table") { planOpen = true; sfx("paper", true); render(); loadPlans().then(() => { if (planOpen) ctx(); }); return; }   // Notion plans
  if (scene === "hall" && id === "clients") { clientsOpen = true; sfx("paper", true); render(); loadClients().then(() => { if (clientsOpen) ctx(); }); return; }   // live from Chord
  const s = spotObj(scene, id); if (s) speak(s.line, 3500); render();
}
function arriveVillageSpot(id){
  atSpot = id;
  const v = VILLAGE[id];
  if (v.bridge) { atSpot = null; setScene(v.bridge, ARRIVE[scene + ">" + v.bridge]); return; }
  if (id === "plot3" || id === "plot4") { speak(v.line, 4000); render(); return; }
  if (id === "olive") { vyView = "olive"; sfx("paper", true); render(); return; }
  if (id === "farmshop") { orView = "shop"; orTab = null; sfx("paper", true); if (isHere("mama")) npcSay("mama", pick(["Take, take! Ma Ma picked them for you.", "Fresh this morning. Choose any.", "For you, no charge. You're my girl."])); render(); return; }
  if (id === "barrels") { vyView = "barrels"; sfx("paper", true); render(); return; }
  if (id === "vinestall") { vyView = "stall"; sfx("paper", true); render(); return; }
  if (id === "pswing" || id === "pslide" || id === "pseesaw") { playground(id); return; }
  if (id === "lake" || id === "picnic" || id === "pitch") { fieldSpot(id); return; }
  // an outdoor quest at home base (Evan outing at the swing, garden jobs at the shed, a walk by the pond)
  if (scene === "base" && phase() === "task") { const t = remaining()[0];
    if (placeOf(t) === "base" && spotOf(t) === id && !S.arrived[t.id]) { S.arrived[t.id] = true; setSay(`Here at the ${v.name.toLowerCase()}. First tiny step…`); save(); return; } }
  if (id === "swing") { evan.tx = 112 + rnd(-4, 4); evan.ty = 302; evan.run = true; evan.wait = 6; setTimeout(() => evanSays(pick(["wheee!", "push me!", "higher!"])), 900); speak(v.line, 3500); render(); return; }
  if (id === "letterbox" && lettersArrived().length) { lettersOpen = true; lv.mode = "home"; sfx("paper"); speak("Post! Letters for you.", 3000); render(); return; }
  if (id === "letterbox") { const p = paperWaiting(); if (p) { sfx("paper"); openMail(p); } else speak(`Nothing in the letterbox. ${paperName()} comes each morning.`, 3800); render(); return; }
  if (id === "news") { newsOpen = true; const g = goodNews(), fresh = g && F.goodRead !== g.at; if (g) F.goodRead = g.at; sfx("paper"); speak(fresh ? "Pancake the village dog wags hello. Fresh good news this morning!" : "Pancake opens one eye, thumps a sleepy tail, and goes back to napping.", 4500); save(true); return; }
  if (id === "shed") { shedOpen = true; speak(v.line, 3800); render(); return; }
  if (id === "run") { runOpen = true; const n = hungryCount(F); speak(!F.pets.animals.length ? "An empty run. Chicks and bunnies are at the market." : n ? `${n === 1 ? "Someone's" : n + " little ones are"} peeping for breakfast.` : VILLAGE.run.line, 3800); render(); return; }
  if (id === "bench") { speak(v.line, 3800); render(); return; }
  if (id === "well") { A.water(); return; }
  if (id === "board") { arriveSpot("board"); return; }
  if (id === "pond") { speak(phase() === "break" ? "Perfect break spot. Breathe." : VILLAGE.pond.line, 4000); render(); }
}
/* ---------- The weekly review (town hall scrapbook desk) ---------- */
function reviewCtx(){
  noteHistory();
  return {F, today: dayKey(), history: d => F.history[d], routines: weekRoutines, jars: allJars, letters: writtenSince, journal: journalSince, trophySVG, canSend: !rvw.noMcp};
}
// From Friday 2pm (and over the weekend) Maple mentions the review once a day until it's done
function reviewNudge(){
  const d = new Date(dayKey() + "T00:00:00Z").getUTCDay(), hm = sgHM();
  if (!((d === 5 && hm >= 14*60) || d === 6 || d === 0) || (F.reviews || {})[weekStart()] || S.reviewSaid || quietNow()) return;
  S.reviewSaid = true; speak("Your week in the village is ready: a scrapbook at the town hall. Ten minutes, then next week's three priorities.", 7000); save();
}
/* ---------- The vineyard ---------- */
// Mel's serving while she's standing at the wine shop counter
const serving = () => scene === "wineshop" && atSpot === "wcounter";
// Every minute (and on load): customers buy from the shelves, the vineyard hands water thirsty vines.
// Ma Ma picks what's ripe and the farm shop sells; if Mel's watching, the trees and beds redraw
function orchardTick(){
  const out = orchTick(F, dayKey()); if (!out) return;
  const picked = Object.keys(out.picked).length, here = scene === "orchard" || scene === "flowers";
  (out.tours || []).forEach(tr => { if (here && !quietNow()) setTimeout(() => speak(`Tour finished! ${tr.n} visitors paid ${tr.fee} coins into Ma Ma's tin.`, 4500), 800); });
  if (picked && (scene === "orchard" || scene === "flowers")) { drawScene(); if (isHere("mama") && !quietNow()) npcSay("mama", pick(["Picked these for the shop. So sweet this year.", "Look, so many! Ma Ma's back is aching, but worth it.", "Fresh from the tree. Take some home for Evan."])); }
  save(scene === "orchard" || scene === "flowers");
}
function vineTick(){
  const out = sellTick(F, {serving: serving(), harvest: (festivalOn(dayKey()) || {}).id === "harvest"});
  // Pilar runs the kitchen on her shifts (tells Mel what she's done only while Mel's in there with her)
  if (whereIs("pilar") === "kitchen") { const done = cookTick(F, dayKey()); if (done.length) { save(); if (scene === "kitchen" && !quietNow() && $("panel").hidden) speak(cookLine(done), 5500); } }
  // at closing, leftover tapas of the day go to the staff for dinner
  const note = staffDinner(F, dayKey(), sgHM());
  if (note) { save(); if (!quietNow()) setTimeout(() => speak(staffLine(note), 7000), out && out.mins >= 30 ? 9000 : 1500); }
  if (!out) return;
  const typing = !!(document.activeElement && document.activeElement.closest && document.activeElement.closest(".vyname, [data-vyprice]"));
  if (out.coins && serving()) { sfx("coin"); flash(`+${out.coins} coins from the wine shop`); }
  else if (out.mins >= 30 && out.coins) setTimeout(() => speak(`While you were away, villagers bought ${out.bottles ? `${out.bottles} bottle${out.bottles > 1 ? "s" : ""}` : ""}${out.bottles && out.glasses ? " and " : ""}${out.glasses ? `${out.glasses} glass${out.glasses > 1 ? "es" : ""}` : ""} of your wine. ${vineState(F).box} coins are waiting in the honesty box.`, 6500), 2500);
  if (typing) persist("fox"); else save(scene === "vineyard" || scene === "wineshop");
}
// The field: feed the swans (once a day), a rest or a picnic on the blanket, a kickabout with Evan
function fieldSpot(id){
  const today = dayKey();
  if (id === "lake") {
    if (S.swans === today) { speak("The swans have had their crumbs today. They're pretending not to notice you.", 4000); render(); return; }
    S.swans = today; gainXp(1); sfx("chime"); [0, 300].forEach((d, k) => setTimeout(() => mprop("heart", 200 + k*60, 300, 1800), d));
    speak(pick(["You toss some crumbs. The swans glide over, very dignified, and eat every one.", "Crumbs for the swans. One honks politely. The other pretends it didn't."]), 5000);
    if (evanHere()) { evan.tx = 240; evan.ty = 380; evan.run = true; evan.wait = 6; setTimeout(() => evanSays("swan! big swan!"), 900); }
    save(); render(); return;
  }
  if (id === "picnic") {
    mel.sitting = true; nodes.mel.classList.add("sit"); mel.dir = 1; sfx("paper", true);
    if (F.inv.picnic > 0) { addInv("picnic", -1); gainXp(4); act("cheer"); speak("Picnic time! Sandwiches, fruit, and Maple guarding the basket.", 5000);
      if (evanHere()) { evan.tx = mel.x + 30; evan.ty = mel.y + 6; evan.run = true; evan.wait = 10; setTimeout(() => evanSays("sandwich!"), 1200); } }
    else speak(pick(["A rest on the picnic blanket. Clouds, a breeze, nothing to do for a minute.", "Sit, breathe, look at the lake. That counts as a break."]), 4500);
    save(); render(); return;
  }
  // the football pitch: Evan runs to the ball (and Pip, if he's here, wants a pass)
  if (evanHere()) {
    evan.tx = 176 + rnd(-20, 20); evan.ty = 560; evan.run = true; evan.wait = 8; setTimeout(() => evanSays(pick(["goal!", "kick it!", "my ball!"])), 1000);
    if (isHere("pip")) setTimeout(() => npcSay("pip", "Pass, Evan! Pass to me!"), 2200);
    if (S.kickabout !== today) { S.kickabout = today; gainXp(1); setTimeout(() => mprop("heart", evan.x, evan.y - 44, 1800), 1600); }
    speak("A kickabout with Evan. He's mostly running after the ball and shouting. Perfect.", 4500);
  } else speak(isHere("pip") ? "Pip's practising his penalties. He's very serious about it." : VILLAGE.pitch.line, 4000);
  save(); render();
}
// The playground: Evan runs over to play (Pip too, if he's here)
function playground(id){
  const v = VILLAGE[id];
  if (!evanHere()) { speak(v.line, 3500); render(); return; }
  evan.tx = v.door[0] + rnd(-6, 6); evan.ty = v.door[1] - 6; evan.run = true; evan.wait = 8;
  setTimeout(() => evanSays(pick(id === "pswing" ? ["wheee!", "push me!", "higher!"] : id === "pslide" ? ["again!", "whoosh!", "down!"] : ["up!", "down!", "bumpy!"])), 900);
  if (isHere("pip")) setTimeout(() => npcSay("pip", pick(["Evan! Over here!", "My turn, then your turn!", "Race you to the slide!"])), 1800);
  speak(v.line, 3500); render();
}
setTimeout(vineTick, 3000);
// dev builds only (the stub sets the flag): test scripts jump straight to a scene
if (window.__mapleDevStub) window.__mapleScene = id => setScene(id, OUTDOOR.includes(id) ? [260, 330] : INNER[id] ? INNER[id].arrive : [260, 596]);
/* ---------- The bank ---------- */
function vaultPoured(j, nowFull){
  if (nowFull) { sfx("yay"); flash(`${j.label} is full!`); speak(`Your ${j.label} vault is full! Look at it sparkle. That's ${vaultMoney(j.amount, j.cur)} saved.`, 7000, true); setTimeout(checkTrophies, 500); }
  else speak(pick(["Capped and back in the vault.", "Clink clink. Back in the vault it goes.", "Another handful of jewels. Lovely."]), 3000);
}

/* ---------- Routine bonuses: 1 coin a checklist step, 5 for finishing a routine (a weekly one's step counts as
   finishing it). Each pays once a day: unticking and re-ticking earns nothing more. ---------- */
const ROUTINE_STEP = 1, ROUTINE_DONE = 5;
function routineCoins(r){
  S.rCoins = S.rCoins || {}; let n = 0;
  if (!r.weekly && !S.rCoins[r.list + ":" + r.item]) { S.rCoins[r.list + ":" + r.item] = true; n += ROUTINE_STEP; }
  if (r.complete && !S.rCoins[r.list + ":done"]) { S.rCoins[r.list + ":done"] = true; n += ROUTINE_DONE;
    act("cheer"); setTimeout(() => speak(`${r.name}, done for today! Bonus coins.`, 4000, true), 300); }
  if (n) { earn(n, r.complete ? `${r.name} done` : "routine step"); gainXp(r.complete ? 1 : 0); save(); }
  else mprop("sparkle", mel.x, mel.y - 60);
}

/* ---------- Bedtime: Maple chivvies at 11 and 11:30; from 11:45pm to 6am the village rests ---------- */
const nightKey = () => { const m = sgHM(); return m < 6*60 ? prevDay(dayKey()) : dayKey(); };
const bedNow = () => { const m = sgHM(); return m >= 23*60 + 45 || m < 6*60; };
function bedtimeTick(){
  const m = sgHM(), nk = nightKey();
  const lock = F.bedLock !== false && bedNow() && F.bedSkip !== nk, el = $("bedLock");
  if (el.hidden === lock) {
    el.hidden = !lock; document.body.classList.toggle("bedlocked", lock);
    if (lock) { route = []; keys.clear(); openView = null; closePanel(); if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); }
  }
  if (lock) { const left = ((6*60 - m + 24*60) % (24*60)); $("bedLockLeft").textContent = `Good morning in ${Math.floor(left/60)}h ${left % 60}m.`; }
}
// Wind-down, 11pm to bedtime (11:45): a short, calm line about every 30 seconds. No chime, it fades on its own,
// and it waits while Mel's typing or has a panel open.
const WIND = ["Time to start winding down.", "Teeth, then skincare. No rush.", "Phone on charge, across the room.", "Dim the lights a little.",
  "Let the last thing go. It'll keep till morning.", "A glass of water by the bed.", "Slow breath in. Slower breath out.", "The village is tucking in too.",
  "Nothing else needs you tonight.", "Pyjamas on. Soft and cosy."];
let windAt = 0, windI = 0;
setInterval(() => {
  const m = sgHM(); if (F.bedLock === false || m < 23*60 || m >= 23*60 + 45 || document.hidden) return;
  if (Date.now() - windAt < 28e3 || openView || !$("panel").hidden || (document.activeElement && /INPUT|TEXTAREA/.test(document.activeElement.tagName))) return;
  windAt = Date.now(); const left = 23*60 + 45 - m;
  speak(left <= 15 ? `${left} minute${left === 1 ? "" : "s"} till bed. ${WIND[windI++ % WIND.length]}` : WIND[windI++ % WIND.length], 6000, true);
}, 5000);
$("bedUp").onclick = () => { if (!confirm("Get up just for tonight? Stay in bed comes back on tomorrow night.")) return; F.bedSkip = nightKey(); save(); bedtimeTick(); speak("Okay, just this once. Be gentle with yourself.", 5000, true); };
// Backup: every part of the game this browser holds (the save, journal, jars, kind words, routines, letters, home) in one file
$("setBackup").onclick = async () => {
  const data = {}; Object.keys(localStorage).filter(k => k.startsWith("fox.")).forEach(k => { try { data[k] = JSON.parse(localStorage.getItem(k)); } catch { data[k] = localStorage.getItem(k); } });
  const file = JSON.stringify({game: "Maple's village", exportedAt: new Date().toISOString(), data}, null, 1), name = `maples-village-backup-${dayKey()}.json`;
  let dl = null; try { dl = await claude.use("downloads"); } catch {}
  if (!dl) { $("setBackupNote").textContent = "Downloads aren't available in this view. Try the Claude app or claude.ai in a browser."; return; }
  try { await dl.save({filename: name, data: file}); $("setBackupNote").textContent = `Saved ${name}. Keep it somewhere safe, like your Google Drive.`; F.backupAt = Date.now(); save(); }
  catch (e) { $("setBackupNote").textContent = e && e.code === "declined" ? "No worries, nothing saved." : "Couldn't save the backup just now."; }
};
$("setBed").onchange = e => { F.bedLock = e.target.checked; save(); bedtimeTick(); };
// nothing gets through while the village is asleep (keys included)
["keydown", "click", "pointerdown"].forEach(t => document.addEventListener(t, ev => { if (document.body.classList.contains("bedlocked") && !ev.target.closest("#bedLock")) { ev.stopPropagation(); ev.preventDefault(); } }, {capture: true}));

/* ---------- Trophies ---------- */
function trophyCtx(){ const r = revenueNow();
  return {F, ST, levels: LEVELS, levelIndex: level(), kudos: kudosCount(), journal: journalCount(), vaults: fullCounts(), revenue: r && F.revTarget ? {...r, target: Number(F.revTarget)} : null}; }
function checkTrophies(){
  const {fresh, first, moved} = award(F, reached(trophyCtx()));
  if (!fresh.length) return;
  if (first || fresh.length > 3) F.trophyIntro = (F.trophyIntro || 0) + fresh.length;
  else fresh.forEach((t, i) => setTimeout(() => { sfx("yay"); flash(`New trophy: ${t.label}`); speak(`New trophy! ${t.label}. It's on a pedestal in the courtyard.`, 6000, true); }, i*6500));
  if (moved.length && !first) setTimeout(() => flash(`${moved.length === 1 ? "A trophy" : moved.length + " trophies"} stepped into the trophy book to make room.`), 4000);
  save(scene === "trophy");
}
// Sunsama weekly objectives (this week and last): each one completed counts, and a week with every one done earns a rosette
let objAt = 0;
async function fetchObjectives(){
  if (Date.now() - objAt < 20*60e3) return; objAt = Date.now();
  let mcp = null; try { mcp = window.claude && claude.use ? await claude.use("mcp") : null; } catch {}
  if (!mcp) return;
  const monday = d => { const t = new Date(d + "T00:00:00Z"); return new Date(t.getTime() - ((t.getUTCDay() + 6) % 7)*864e5).toISOString().slice(0, 10); };
  const days = [dayKey(), new Date(Date.parse(dayKey() + "T00:00:00Z") - 7*864e5).toISOString().slice(0, 10)];
  for (const d of days) {
    try {
      const r = await mcp.callTool(SUNSAMA, "read_resource", {uri: `sunsama://objectives/${d}`}, {cache: {staleTime: 10*60e3}});
      let p = r && r.payload; if (typeof p === "string") { try { p = JSON.parse(p); } catch {} }
      if (p && Array.isArray(p.contents) && p.contents[0] && p.contents[0].text) { try { p = JSON.parse(p.contents[0].text); } catch {} }
      const list = (p && Array.isArray(p.objectives)) ? p.objectives.filter(o => o && o._id) : [];
      F.objDone = F.objDone || {}; list.filter(o => o.completed).forEach(o => { F.objDone[o._id] = String(o.title || "").slice(0, 80); });
      if (list.length && list.every(o => o.completed)) { F.objWeeks = F.objWeeks || {}; F.objWeeks[monday(d)] = {n: list.length, titles: list.map(o => String(o.title || "").slice(0, 80)).slice(0, 6)}; }
    } catch {}
  }
  checkTrophies();
}
// affirmations: Claude writes five fresh ones from this week's plan; the kind built-in list is the fallback
let affirmBusy = false;
async function freshAffirmations(){
  if (affirmBusy || !sampleCap) return; affirmBusy = true; if (trophyView === "affirm") ctx();
  try {
    const plan = await readPlan("week").catch(() => null);
    const d = await sampleCap.json(`Write 5 short, warm, first-person affirmations for Mel: a Singapore founder (Fresh Pages Co copywriting studio, the apps Chord and Chico, AI training as Ambidextrous) and mum to Evan (2). Plain, believable, specific to her life, max 14 words each, no emoji, no cliches like "I am enough".${plan && plan.text ? "\nThis week's plan, for context:\n" + plan.text.slice(0, 1500) : ""}\nReturn JSON only: {"affirmations": ["...", "..."]}`, {modelTier: "quick", cache: false});
    const items = (d && Array.isArray(d.affirmations) ? d.affirmations : []).map(a => plain(String(a)).trim().slice(0, 140)).filter(Boolean).slice(0, 5);
    if (items.length) { F.affirm = Object.assign(F.affirm || {}, {day: dayKey(), items}); save(); }
  } catch {}
  affirmBusy = false; if (trophyView === "affirm") ctx();
}
setInterval(() => { const n = lettersAnnounce(); if (n.length) { sfx("chime"); speak(n.some(e => e.kind === "universe") ? "A letter from the universe has arrived. It's in your letterbox at home." : "A letter from your past self just arrived in your letterbox.", 6000); }
  if (Math.random() < .2) writeReplies(sampleCap); }, 30000);
setInterval(checkTrophies, 30000); setTimeout(checkTrophies, 4000); setTimeout(fetchObjectives, 9000);

/* ---------- Evan's room: Evan is the one who moves. Nothing here saves or earns. ---------- */
function kidTap(ev){
  if (ev.target.closest("[data-exit]")) { leaveKidRoom(); return; }   // the door always works, even while Evan sleeps
  if (kid.sleep) {
    if (evanNight()) { evanSays("shh… sleeping"); return; }   // bedtime: he stays asleep
    kid.sleep = false; evan.x = evan.tx = 230; evan.y = evan.ty = 340; drawScene(); evanSays(pickSay(["morning!", "awake!", "*yawn*"])); sfx("chime"); return;
  }
  const ent = ev.target.closest("[data-ent]");
  if (ent && ent.dataset.ent === "mel") { evan.tx = mel.x + 18; evan.ty = mel.y + 4; evan.run = true; kid.pending = null; evanSays("Mama!"); mprop("heart", mel.x, mel.y - 50); return; }
  if (ent && ent.dataset.ent === "evan" && hug && hug.phase === "ask") { hugBack(); return; }
  if (ent && ent.dataset.ent === "evan") { evanSays(pickSay(EVAN_TAPS)); mprop("heart", evan.x, evan.y - 36); sfx("tap"); return; }
  const sp = ev.target.closest("[data-spot]");
  if (sp) { const s = spotObj(scene, sp.dataset.spot); if (!s) return; evan.tx = s.tx; evan.ty = s.ty; evan.run = true; kid.pending = s.id; sfx("tap"); return; }
  const [x, y] = toWorld(ev), b = bounds(); evan.tx = clamp(x, b[0] + 30, b[2]); evan.ty = clamp(y, b[1] + 20, b[3]); evan.run = Math.random() < .5; kid.pending = null;
}
function kidAction(id){
  if (id === "kbed") { kid.sleep = true; drawScene(); evanSays("night night"); sfx("bowl"); return; }
  if (id === "snacks" || ["dino", "train", "cars", "balloons"].includes(id)) { kid.open = id; sfx("paper", true); ctx(); return; }
}
function kidEat(id){
  const sn = SNACKS[id]; if (!sn) return;
  const p = document.createElement("div"); p.className = "mprop kprop"; p.innerHTML = snackPic(id, 40);
  p.style.left = (evan.x*cam.s + cam.ox) + "px"; p.style.top = ((evan.y - 52)*cam.s + cam.oy) + "px"; $("mprops").appendChild(p); setTimeout(() => p.remove(), 2600);
  sfx(sn.fx); setTimeout(() => sfx(sn.fx), 700); evanSays(pickSay(sn.say));
  nodes.evan.classList.remove("hop"); void nodes.evan.getBBox(); nodes.evan.classList.add("hop"); setTimeout(() => nodes.evan.classList.remove("hop"), 700);
}
function leaveKidRoom(){ if (scene !== "kidroom") return; kid.open = null; stopKidGame(); kid.sleep = false; const I = INNER.kidroom; setScene("home", [I.door[0] - 10, I.door[1] + 24]); }
function toWorld(ev){ const r = $("map").getBoundingClientRect(); return [(ev.clientX - r.left - cam.ox)/cam.s, (ev.clientY - r.top - cam.oy)/cam.s]; }
svg.addEventListener("click", ev => {
  if (scene === "kidroom") { kidTap(ev); return; }
  const pg = ev.target.closest("[data-pigeon]");
  if (pg) { pg.classList.remove("flap"); void pg.getBBox(); pg.classList.add("flap"); sfx("paper", true); setTimeout(() => pg.classList.remove("flap"), 1600); return; }
  if (S.sleep && scene === "room") { S.sleep = null; speak("Up we get!", 2500); save(true); }   // any tap wakes Mel
  const npc = ev.target.closest("[data-npc]");
  if (npc) { tapNpc(npc.dataset.npc); return; }
  const ug = ev.target.closest("[data-ugarden]");
  if (ug) { const k = ug.dataset.ugarden, st = ST[k] || {}; speak(`${(st.users || 0).toLocaleString()} ${st.label || (k === "chord" ? "studios" : "families")} use ${k === "chord" ? "Chord" : "Chico"}! One flower for every ${st.per > 0 ? st.per : 10}.`, 4500); return; }
  const ent = ev.target.closest("[data-ent]");
  if (ent && ent.dataset.ent === "evan" && hug && hug.phase === "ask") { hugBack(); return; }
  if (ent && ent.dataset.ent === "evan") { evanSays(pick(["Mama!", "hug!", "hehe!", "up up!"])); mprop("heart", evan.x, evan.y - 40); evan.tx = mel.x + 16; evan.ty = mel.y + 4; evan.run = true; return; }
  if (ent && ent.dataset.ent === "maple") { sfx("purr"); if (Math.random() < .35) { hearts(2); speak("Purr… treats and toys are in your backpack. Tap the bag up top!", 4000); return; } hearts(2); speak(pick(["*leans into the pat*", "Happy fox noises!", "More pats please."]), 3000); return; }
  // the orchard's tree spots and the flower farm's beds and bushes: walk over, then the spot's card
  const ot = ev.target.closest("[data-tree], [data-bed], [data-bush]");
  if (ot && (scene === "orchard" || scene === "flowers")) { const where = ot.dataset.tree != null ? "tree" : ot.dataset.bed != null ? "bed" : "bush", i = +(ot.dataset.tree ?? ot.dataset.bed ?? ot.dataset.bush);
    const x = where === "tree" ? TREE_XS[i % 4] : FLOWER_XS[i % 4], y = where === "tree" ? TREE_ROWS[Math.floor(i/4)] + 20 : where === "bush" ? BUSH_Y + 18 : BED_ROWS[Math.floor(i/4)] + 20;
    go(scene, x, y, () => { atSpot = where; orAt = {where, i}; orView = "spot"; sfx("paper", true); render(); }); return; }
  const vt = ev.target.closest("[data-vine]");
  if (vt && scene === "vineyard") { const [r, i] = vt.dataset.vine.split("-").map(Number), p = vineSpot(r, i);
    go("vineyard", p.x, p.y, () => { atSpot = "vine"; vyAt = {r, i}; vyView = "vine"; sfx("paper", true); render(); }); return; }
  const pl = ev.target.closest("[data-place]");
  if (pl && outside()) {
    const id = pl.dataset.place, v = VILLAGE[id];
    if (v.spot) go(scene, v.door[0], v.door[1], () => arriveVillageSpot(id));
    else go(id, 260, id === "farm" ? 560 : 560, null);
    return;
  }
  const sp = ev.target.closest("[data-spot]");
  if (sp) { const s = spotObj(scene, sp.dataset.spot); go(scene, s.tx, s.ty, () => arriveSpot(s.id));
    if (s.id === "kiddoor" && evanHere()) { evan.tx = s.tx - 20; evan.ty = s.ty + 6; evan.run = true; evan.wait = 9; evanSays("my room!"); }   // Evan leads the way
    return; }
  if (ev.target.closest("[data-exit]")) { if (INNER[scene]) { const I = INNER[scene]; go(I.parent, I.door[0] + 30, I.door[1] + 20, null); } else go(outdoorOf(scene), VILLAGE[scene].door[0], VILLAGE[scene].door[1] + 10, null); return; }
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
  if (e.target.closest("input") || notebookOpen() || scene === "kidroom") return;
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
const EVAN_SPOTS = {field:[[150,560],[200,570],[120,470],[230,390],[60,330],[280,470],[110,600]], vineyard:[[110,600],[262,598],[410,606],[200,560],[160,320],[300,330],[230,580]], base:[[260,350],[200,360],[330,360],[150,330],[230,420],[160,540],[300,600],[360,516],[240,560],[420,340]], home:[[150,500],[330,520],[260,340],[200,600],[360,330]]};
// Evan's destination is evan.tx/ty; outdoors he follows route-finder waypoints to it (round the house, not through it)
function evanWalk(speed, dt){
  const key = evan.tx + "," + evan.ty;
  if (key !== evan.rk) { evan.rk = key; evan.path = outside() ? findPath(scene, [evan.x, evan.y], [evan.tx, evan.ty], bounds()) : [[evan.tx, evan.ty]]; }
  const p = evan.path && evan.path[0]; if (!p) { evan.moving = false; return true; }
  const want = [evan.tx, evan.ty]; evan.tx = p[0]; evan.ty = p[1];
  const r = stepTo(evan, speed, dt); evan.tx = want[0]; evan.ty = want[1];
  if (r) { evan.path.shift(); if (evan.path.length) { evan.moving = true; return false; } return true; }
  return false;
}
function tickEvan(dt){
  if (!evanHere()) return;
  if (hugTick()) { evanWalk(140, dt); return; }
  if (scene === "kidroom") { if (kid.sleep) return; if (evanWalk(evan.run ? 140 : 95, dt) && kid.pending) { const id = kid.pending; kid.pending = null; kidAction(id); } return; }
  if (evanWalk(evan.run ? 130 : 70, dt)) {
    evan.wait -= dt;
    if (evan.wait <= 0) {
      const r = Math.random(), b = bounds();
      if (scene === "base" && phase() === "break" && r < .5) { evan.tx = 350 + rnd(-20, 30); evan.ty = 560 + rnd(-6, 8); evan.run = false; }
      else if (r < .3) { evan.tx = clamp(mel.x + rnd(-24, 24), b[0], b[2]); evan.ty = clamp(mel.y + rnd(4, 16), b[1], b[3]); evan.run = true; evan.target = "mel"; }
      else if (r < .5) { evan.tx = clamp(maple.x + rnd(-18, 18), b[0], b[2]); evan.ty = clamp(maple.y + rnd(2, 12), b[1], b[3]); evan.run = true; evan.target = "maple"; }
      else if (scene === "base" && F.pets.animals.length && r < .45 && r > .3) { evan.tx = 196 + rnd(-4, 6); evan.ty = 548 + rnd(-6, 6); evan.run = true; evan.target = null; const k = F.pets.animals.some(a => a.kind === "rabbit"); setTimeout(() => evanSays(pick(k ? ["bunny!", "hop hop!", "soft!"] : ["chick chick!", "cheep!", "birdie!"])), 1500); }
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
    const fx = scene === "kidroom" ? evan.x : mel.x;   // in Evan's room the camera follows Evan
    const s = ch/HH, vw = cw/s, tx = clamp(fx - vw/2, 0, W - vw);
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
      else if (!outside() && scene !== "farm" && !INNER[scene] && mel.y > 592) go(outdoorOf(scene), VILLAGE[scene].door[0], VILLAGE[scene].door[1] + 10, null);
      else if (INNER[scene] && scene !== "kidroom" && Math.abs(mel.x - INNER[scene].exit[0]) < 12 && Math.abs(mel.y - INNER[scene].exit[1]) < 56) { const I = INNER[scene]; go(I.parent, I.door[0] + 30, I.door[1] + 20, null); }
      else if (scene === "farm" && mel.y > 592 && Math.abs(mel.x - 260) < 50) go("base", VILLAGE.farm.door[0], VILLAGE.farm.door[1] + 10, null);
    }
  }
  if (mel.sitting && (mel.moving || (scene !== "trophy" && scene !== "field"))) { mel.sitting = false; nodes.mel.classList.remove("sit"); }
  mel.wasMoving = mel.moving;
  const inRoom = scene === "room", MB = [MAPLE_BED[0], MAPLE_BED[1] + 2];
  if (inRoom) { maple.tx = MB[0]; maple.ty = MB[1]; stepTo(maple, 110, dt); }
  const sleeping = inRoom ? !maple.moving && Math.hypot(maple.x - MB[0], maple.y - MB[1]) < 6 : (phase() === "break" || Date.now() < mapleNap);
  nodes.maple.classList.toggle("sleep", sleeping);
  if (inRoom || scene === "kidroom") {}
  else if (!sleeping) { maple.tx = mel.x - mel.dir*24; maple.ty = mel.y + 3; const d = Math.hypot(maple.tx - maple.x, maple.ty - maple.y); stepTo(maple, Math.max(120, d*3.2), dt); if (!maple.moving) maple.dir = mel.dir; }
  else maple.moving = false;
  tickEvan(dt);
  tickNpcs(dt); updateCam(dt); drawTableware();
  placeNode(nodes.mel, mel); placeNode(nodes.maple, maple); placeNode(nodes.evan, evan);
  nodes.evan.style.visibility = scene === "kidroom" && kid.sleep ? "hidden" : "";
  // On the treadmill with the time box running: Mel walks in place.
  if (scene === "home" && atSpot === "treadmill" && !route.length && S.timer && S.timer.kind === "task" && Math.abs(mel.x - mel.tx) < 2) { nodes.mel.classList.add("walk"); mel.dir = 1; }
  nodes.evan.classList.toggle("run", evan.run && evan.moving);
  const order = [[nodes.mel, mel], [nodes.maple, maple], [nodes.evan, evan], ...npcActors()].sort((a, b) => a[1].y - b[1].y);
  const g = $("actors"); order.forEach(([n]) => { if (g.lastElementChild !== n) g.appendChild(n); });
  const close = Math.hypot(maple.x - mel.x, maple.y - mel.y) < 60;
  bubbleAt($("speech"), close ? (maple.x*0.35 + mel.x*0.65) : maple.x, close ? Math.min(maple.y, mel.y) : maple.y, close ? 76 : (sleeping ? 18 : 30));
  if (evanHere()) bubbleAt($("evanSay"), evan.x, evan.y, 40); else $("evanSay").hidden = true;
  bubbleAt($("melSay"), mel.x, mel.y, 70);
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
// Speech bubbles close with a tap (the next thing anyone says brings them back)
// Tapping a speech bubble closes it, and if someone's standing under it (Penny with the post, a villager), the tap
// reaches them too: a bubble shouldn't make the person beneath it untappable.
["speech", "npcSay", "evanSay", "melSay"].forEach(id => $(id).addEventListener("click", ev => { ev.stopPropagation(); $(id).hidden = true;
  const under = document.elementFromPoint(ev.clientX, ev.clientY), who = under && under.closest("#actors [data-npc], #actors [data-ent]");
  if (who) who.dispatchEvent(new MouseEvent("click", {bubbles: true, clientX: ev.clientX, clientY: ev.clientY})); }));
$("chatForm").onsubmit = e => { e.preventDefault(); const v = $("chatIn").value; $("chatIn").value = ""; sendChat(v); };
$("zoomBtn").onclick = () => toggleZoom();
$("setMusic").onchange = e => setMusic(e.target.checked);
$("setVol").oninput = e => setMusicVol(+e.target.value);
$("setTest").onclick = () => { unlockAudio(); setTimeout(() => { alarm(); $("setTestNote").textContent = audioRunning() ? "Sound is on. If you heard nothing, check the volume and the silent switch." : "Your browser is still blocking sound. Tap anywhere on the map, then try again."; }, 120); };
$("setQuiet").onchange = e => { F.quietEvening = e.target.checked; save(true); };
$("setSfx").onchange = e => { setSfx(e.target.checked); if (e.target.checked) sfx("coin"); };
["pointerdown", "keydown"].forEach(t => document.addEventListener(t, () => { qnQuietUntil = 0; }, {capture: true, once: true}));
document.querySelectorAll("[data-open]").forEach(b => b.onclick = () => { openView = openView === b.dataset.open ? null : b.dataset.open; ctx();
  if (openView === "chat") { renderChat(); setTimeout(() => $("chatIn").focus(), 60); } });
initNotebook({windDown, onTread, subs: subView, subTick, water:() => ({ml: S.waterMl || 0, goal: WATER_GOAL, glass: GLASS}), steps:() => ({n: S.steps, goal: STEP_GOAL}),
  addWater:ml => A.water(ml), setWater, setSteps, task:() => phase() === "task" ? remaining()[0] : null, S:() => S, F:() => F, fs:t => !!S.firstStep[t.id], act:nbAct, timerLeft,
  sayNow:() => say, timerBtns, paperName, sample:() => sampleCap, sampleDenied:() => { sampleCap = null; }, sayButton, markRead, agentName, onClose:() => render(),
  placeLabel:t => `${VILLAGE[placeOf(t)].name} · ${spotObj(placeOf(t), spotOf(t)).name}`});
initHestia({sfx, alarm, speak, flash, undoable, earn: (n, why) => { earn(n, why); save(); }, changed: () => render(),
  refund: (n, why) => { F.coins = Math.max(0, F.coins - n); S.earned = Math.max(0, (S.earned || 0) - n); flash(`-${n} coin: ${why}`); save(); }});
$("hestiaFile").onchange = e => { const f = e.target.files && e.target.files[0]; if (!f) return; const r = new FileReader();
  r.onload = () => { const msg = importHestia(String(r.result)); $("hestiaNote").textContent = msg; speak(/^Imported/.test(msg) ? "Hestia's lists are in the house now!" : msg, 4500); }; r.readAsText(f); e.target.value = ""; };
initNpcs({sfx, quiet: () => quietNow(), chatted:n => { if (!S.chats.includes(n)) { S.chats.push(n); save(); } }, scene:() => scene, bounds, mel, evan, F:() => F, S:() => S, save:() => save(), facts, bubble:bubbleAt, evanSays, unreadMail,
  openMail:item => openMail(item), gift:id => { addInv(id, 1); flash(`Auntie Lin gave you ${ITEMS[id].n.toLowerCase()}`); save(); }});
measureHud();
render(true);
if (F.gift) setTimeout(() => speak("A welcome gift! Seeds are in your backpack 🌷", 5000), 1200);
requestAnimationFrame(frame);
initDb();
