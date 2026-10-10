// Game core: state + persistence, quest flow, actions, UI renderers and the world sim.
import { H, M, W, HH, now, dayKey, sgHM, prevDay, $, esc, pick, rnd, clamp, dur, plain, hash } from "../util.js";
import { icon, progressBar, progressBarV } from "../art/icons.js";
import { VILLAGE, WORK, ROOMS, MAPLE_BED, OUTDOOR, BRIDGES, ARRIVE, INNER, nextHop, outdoorOf, isWeekend, stationsOf, spotObj, placeOf, spotOf, isTreadTask } from "../data/world.js";
import { CROPS, ITEMS, DECOR, PLOTS, QUEST_BOOST, LEVELS, PEP, YAY, itemIco, seasonOf, SEASONS } from "../data/items.js";
import { brollyArt, hoodArt } from "../art/people.js";
import { UPGRADES, unlocked, nextUpgrade, festivalOn, rainyOn, stormyOn, rainLevel, FESTIVALS } from "../art/village-extras.js";
import { foreArt, villageArt, baseArt, laneArt, roomArt, farmArt, vineyardArt, orchardArt, flowerFarmArt, setArtContext } from "../art/scenes.js";
import { vineSpot } from "../art/vineyard.js";
import { kitchenState, sendToKitchen, isGood, larderPanel, ovenPanel, pressPanel, stovePanel, wireKitchen, staffDinner, staffLine, tapasToday, tapasAll, TAPAS, cookTick, cookLine } from "./kitchen.js";
import { questBoost } from "./vineyard.js";
import { vineState, sellTick, vinePanel, stallPanel, barrelPanel, shelfPanel, counterPanel, boxPanel, cafePanel, olivePanel, grovePanel, wireVine, shelfStock, vineyardName, shopName, serveGuest, menuPanel, stallMarketPanel } from "./vineyard.js";
import { AGENTS, NPCS } from "../data/npcs.js";
import { initNotebook, openTask, openMail, openDigest, openTracker, closeNotebook, refreshNotebook, notebookOpen } from "../ui/notebook.js";
import { pullSunsama, SUNSAMA_ERRORS, SUNSAMA, completeInSunsama, subtaskInSunsama } from "./sunsama.js";
import { unlockAudio, audioRunning, sfx, alarm, settings as sound, setMusic, setMusicVol, setSfx, TRACKS, setTrack, currentTrack, setLive } from "./audio.js";
import { todaysEvents, CAL_ERRORS } from "./calendar.js";
import { findPath, blocked } from "./paths.js";
import { fetchPost, postPanel, postCount } from "./postbox.js";
import { attachFeeds, health, healthPanel, contentHTML, wireContent, goodNews, goodNewsHTML, ohayoHellos, reactionsPanel, helloPanel } from "./feeds.js";
import { initHestia, attachHestiaDb, hestiaPanel, wireHestia, hestiaCounts, importHestia, chatLastDone, lastDueCount, chatAddShopping, chatRestock, chatAddChore, chatTickChore, chatTidyTimer, hestiaSummary } from "./hestia.js";
import { ensurePets, addAnimal, feedOne, upgradeRun, runPanel, scatterTreat, roomLeft, hungry, hungryCount, KINDS } from "./pets.js";
import { wardrobePanel, newOutfit, outfitsToday, wearing, ACCESSORIES } from "./wardrobe.js";
import { colourOf } from "../art/garments.js";
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
import { initNpcs, tickNpcs, tapNpc, npcActors, resetScene as resetNpcs, courierDelivered, isHere, whereIs, npcSay, npcPos, daySchedule } from "./npcs.js";
import { dishArt, glassArt } from "../art/wine.js";
import { fieldArt, stallFront } from "../art/field.js";
import { shoreArt } from "../art/shore.js";
import { bayArt, DECK_SEATS } from "../art/bay.js";
import { hfarmArt } from "../art/hfarm.js";
import { hlaneArt } from "../art/hlane.js";
import { hwoodsArt } from "../art/hwoods.js";
import { greenhouseArt, GH_BED_AT } from "../art/greenhouse.js";
import { millArt } from "../art/mill.js";
import { bonfireArt, fishVanArt, kiteArt, bayStallArt, kiteSellerArt, movieArt } from "../art/friday.js";
import { vanPanel, vanBuy, VAN_MULT, bonfirePanel, releaseLanterns, grillFish, bayStallGoods, bayKeeperName, filmOf } from "./friday.js";
import { millState, pressLeft, millPanel, startPress, collectOil, millStory } from "./mill.js";
import { ghState, ghGrowth, bedPanel, ghPlant, ghHarvest, ghBoost, setGhCompost } from "./greenhouse.js";
import { rondaArt, trainRideArt } from "../art/town-ronda.js";
import { rondaRoomArt } from "../art/ronda-rooms.js";
import { kyotoArt } from "../art/town-kyoto.js";
import { jejuArt, ferryRideArt, wishTower } from "../art/town-jeju.js";
import { cinqueArt, homeBoat } from "../art/town-cinque.js";
import { loftPanel, startBatch, collect as loftCollect, loftState } from "./loft.js";
import { cinqueRoomArt } from "../art/cinque-rooms.js";
import { cinquePanel, cinqueState, treat as ctTreat, GELATO, FOCACCIA, pestoStart, pestoAdd, pestoPound, pestoDone, finishPesto, harvestStart, pick as ctPick, harvestDone, finishHarvest, TASTE, paintBoat, boatCols } from "./cinque.js";
import { jejuRoomArt, dyeCloth } from "../art/jeju-rooms.js";
import { jejuPanel, jejuState, diveStart, descend, surface, diveReward, JUK, sortStart, sortTap, sortReward, cafeTreat as jjCafe, slowPost, slowMail, DYE, dyeScarf, dyeDays, takeDye } from "./jeju.js";
import { kyotoRoomArt } from "../art/kyoto-rooms.js";
import { kyotoPanel, kyotoState, stamp as ktStamp, rentYukata, yukataOn, YUKATA, whiskStart, whisk, froth, TEA, sitStart, breathe, calm, drawFortune, makeNerikiri, seasonShape, centre as ktCentre, throwCup, NERI } from "./kyoto.js";
import { TOWNS, townOf, townRoom, roomBehind, TOWN_BOUNDS } from "../data/towns.js";
import { rondaPanel, rondaVisit, buyGood, buyVines, taste, buyTile, picnic as rondaPicnic, tileBench, cafeTreat, showOn, palmasStart, palmasEnd, clap, ole, paintTile, pour, TEA_GLASSES, rondaState } from "./ronda.js";
import { tripOn, inParty, buyTrip, endTrip, ticketPanel, homePanel, initTrips, nameOf as tripName, awayOn } from "./trips.js";
import { bikeArt, taxiBoat, taxiBank, transportArt } from "../art/transport.js";
import { bikeOn, bikeLeft, hireBike, returnBike, bikeExpired, bikePanel, STOPS as TAXI_STOPS, taxiPanel, takeTaxi } from "./transport.js";
import { forage, rangerPanel } from "./woods.js";
import { tellStory, storyReady, storiesHTML, applyFlags as storyFlags, storyState } from "./stories.js";
import { fishState, fishPanel, spotIn, SPOTS as FISH_SPOTS, cast as fishCast, land as fishLand, buyRod, buyReel, addBait, markerAt, inZone, ESCAPE as FISH_ESCAPE, FISH, sellCatch, spotOpen } from "./fishing.js";
import { fishSpotArt, koiArt } from "../art/fishing.js";
import { timetablePanel, trainKey, trainHere, fmt as railTime } from "./rail.js";
import { moodPanel, vanPick, vanClear, lookLine as vanLookLine } from "./van.js";
import { hfState, herdPanel, hivesPanel, standPanel, feedHerd, brush as hfBrush, brushNearest, milkOne, milkHerd, collectHives, buyStand, giveName, fullHives,
  extractorPanel, crockPanel, pressPanel as hfPressPanel, cavePanel as hfCavePanel, spinFrames, makeYoghurt, pressCheese, takeWheel, cheeseNames, CHEESES as HF_CHEESES,
  gainTrust, muckOut, latchGate, catchGoat, nameHive, creamHoney, cutComb, turnWheels, finishRequest, stockShelf, hfTick, farmhousePanel, LEVELS as HF_LEVELS, MOODS as HF_MOODS } from "./hfarm.js";
import { scoopState, scoopTick, scoopNews, trolleyPanel, loadTrolley, returnTrolley, trolleySell, trolleyOn, trolleyMelted, TROLLEY, registerItems, counterPanel as scCounterPanel, menuPanel as scMenuPanel, fridgePanel, benchPanel, recipePanel, makeTub, freezerPanel, RENO_LINE, discover, stockFridge, unstockFridge, takeAway, eatOne, recipeOf, FORMATS, openNow, displayIds, setDisplay, SLOTS, upgradePanel, honestyPanel, dipPotsPanel, toppingsPanel, dipBarPanel, deliverPanel, buyUpgrade, buyDip, buyTopping, collectBox, makeDipped, hasUp, DIPS, TOPPINGS } from "./scoop.js";
import { POOLS } from "../data/stall-goods.js";
import { cocoaState, cocoaTick, counterPanel as ccCounterPanel, barWallPanel, kitchenPanel as ccKitchenPanel, buyBeans, startRoast, startGrind, temper as ccTemper, mould as ccMould, takeBar, KINDS as CC_KINDS,
  pantryPanel, bonbonPanel, casePanel, stockPantry, unstockPantry, makeBonbons, recipeOf as bonbonOf, toggleDisplay as ccToggle, packBox, eatBonbon,
  sendScoop, wineToPantry, packPairing, makeSpecial, takeSpecial, upsPanel as ccUpsPanel, buyCcUp, haveHot, packGrand, readyPot, ccUp } from "./cocoa.js";
import { canKeep, keepPanel, placedPanel, placeKeep, takeKeep, keepsakesIn, adoptPanel, adopt as adoptPet, petPanel, petsIn, companions, playLine, ownerLine, fill as petFill, PET_HOMES, OWNER_NAME, PETS, petAt } from "./companions.js";
import { GOALS, owns, buyGoal, goalPanel, garagePanel, jettyPanel, ride, rideSpeed } from "./goals.js";
import { diningTable, darrenAsleep, skyWash, tapeLabel } from "../art/scenes.js";
import { orchState, orchTick, handTin, spotPanel, shopPanel, potPanel, teaPanel, wireOrchard, stateOf, tourBoard } from "./orchard.js";
import { TREES, FLOWERS, TREE_ROWS, TREE_XS, BUSH_Y, BED_ROWS, FLOWER_XS } from "../data/orchard.js";
import { aperitivoNow, bonfireNow, vanNow, FIRE, movieNow, bayMarketNow, BAY_STALLS, KITE_SELLER, SCREEN, lastFriday, tourNow, eventNow, eventOn, stallAt, STALL_SPOTS, STAGE, keeperAway, classOn, dinnerOn, dinnerNow, dinnerSeat, DINING, HOST_NAME, fmtTime, wineClubOn, wineClubNow, clubMembers, setStallOwned, workshopGroup, letGuests } from "./tours.js";

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
setArtContext({cocoa: () => cocoaState(F), ohayo: () => ohayoHellos(), F:() => F, scoop: () => scoopState(F), vine: () => vineState(F), kitchen: () => kitchenState(F), tapas: () => { const l = tapasAll(F, dayKey()); return l.length ? l.map(t => TAPAS[t.id].n).join(" · ") : null; }, vineStock: () => shelfStock(vineState(F)), S:() => S, remaining:() => remaining(), questsIn:pl => questsIn(pl), growth:p => growth(p), stats:() => ST, day:() => dayKey(), postCount:() => postCount(), health: app => health(app), goodNews: () => { const g = goodNews(); return g && F.goodRead !== g.at ? g : null; }, lanterns:() => (S.pond ? (S.pond.shown ?? S.pond.wins.length) : 0), dusk:() => isDusk(), music:() => sound.music, jars:() => jarShelf(), kudos: () => kudosCount(), vault: x => { const i = [70, 165, 260, 355, 450].indexOf(x); return i < 0 ? null : jarAt(i); }, ped: (x, y) => { const i = stationsOf("trophy").filter(s => s.kind === "pedestal").findIndex(s => s.x === x && s.y === y); return i < 0 ? null : onPedestals(F)[i] || null; }, kid: () => ({sleep: kid.sleep || evanNight()})});
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
const save = (redraw) => { F.where = {scene, x: Math.round(mel.x), y: Math.round(mel.y), day: dayKey()}; noteHistory(); persist("today"); persist("fox"); render(redraw); };

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
    if ((/^health/.test(id) || id === "ohayo-hellos") && ["lane", ...APP_IDS].includes(scene)) { drawScene(); ctx(); }
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
    const grew = APP_IDS.find(k => ST[k] && before[k] && ST[k].users > before[k].users);
    if (grew) speak(`${APP_NAME[grew]} grew to ${ST[grew].users.toLocaleString()} users! New flowers 🌼`, 5000);
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
// a quest's place for labels: a village building, or a room off one (the home office, the garage)
const placeInfo = pl => VILLAGE[pl] || (ROOMS[pl] ? {name: ROOMS[pl].name, short: ROOMS[pl].name.toLowerCase().replace(/^the /, "the ")} : {name: pl, short: pl});
const questsIn = pl => allTasks().filter(t => placeOf(t) === pl || (pl === "home" && (placeOf(t) === "office" || placeOf(t) === "garage")));
function phase(){
  if (S.mode === "break") return "break";   // a break Mel asks for comes first, even mid-clean
  if (S.mode === "decompress" && S.decompFree) return "decompress";   // decompress from the calm corner, any time
  if (!S.cleanDone && !S.cleanLater) return "clean";   // the five-minute clean opens the day, unless Mel picked a quest first (it waits on the board)
  if (S.mode === "decompress") return "decompress";
  if (remaining().length) return "task";
  return S.doneIds.length ? "recap" : "empty";
}
const arrivedFor = t => S.arrived[t.id] || (scene === placeOf(t) && atSpot === spotOf(t));
const atClean = () => S.wipe || (scene === "garage" && atSpot === "cupboard");

/* =================== FARM =================== */
function growth(p){ if (!p || !p.crop || !p.wateredAt) return 0; return clamp((Date.now() - p.wateredAt + (p.bonus || 0)) / (CROPS[p.crop].dur / ((F.tools || {}).compost ? 1.25 : 1)), 0, 1); }
// Darren's shed: garden tools bought once with coins, kept forever.
const SHED = {
  can:       {n: "Big watering can", price: 60, ico: "wateringCan", what: "Waters every thirsty plot in one go."},
  compost:   {n: "Compost bin", price: 150, ico: "compost", what: "Everything grows a quarter faster."},
  sprinkler: {n: "Sprinkler", price: 300, ico: "sprinkler", what: "New seeds water themselves the moment you plant them."}
};
// keepsakes and pets (companions.js): the keepsake being placed, a placed one's shelf, the pet being adopted (and for
// whom), and the pet whose card is open
// the Cocoa Room's open card: "counter", "wall", or a kitchen station ("sacks", "roaster", "grinder", "slab", "moulds")
let vanView = null, vanSt = {slot: "bedding"};   // the campervan's mood board
let friView = null, lastFri = "";   // round 112: the bonfire or the fishmonger's van panel; the Friday art key
let ghBed = null, millOpen = false, lastMill = "";   // round 110: the olive press panel, and the mill's art key   // round 109: the greenhouse bed being looked at
let rondaView = null;   // round 107: a Ronda shop (ronda.js): "mercado", "tapas", "dulces", "convento", "azulejos"
let woodsView = null;   // round 103: "ranger", "bike" or a river taxi stop id (transport.js, woods.js)
let fishSpot = null, fishSt = {}, fishT = null;   // fishing: which spot Mel is at, and the cast in progress (fishing.js)
let railOpen = false, lastTrain = "", tripPick = [], tripTown = "ronda";   // the timetable board on Honeybrook's platform
let lastFarm = 0;
// the farm's clock: Mel's shelf at the farm stand sells, and a hive left full too long swarms
function farmNow(){
  lastFarm = Date.now(); if (!F.hfarm) return;
  const out = hfTick(F);
  if (out.swarms.length) { if (scene === "hfarm") { speak(`Oh no: ${out.swarms.map(x => typeof x === "number" ? `hive ${x}` : x).join(" and ")} swarmed! A cloud of bees off over the barn. Felix sighs: "Next time, collect it a bit sooner."`, 6000); drawScene(); } else flash(`A hive swarmed at Wildflower Farm`); }
  if (out.coins && scene === "hfarm") { sfx("coin"); flash(`+${out.coins} coins from your shelf at the farm stand`); }
  if (out.coins || out.swarms.length) save();
}
// trust from Felix and Elena: a little for every chore, and a celebration at each new level
function farmTrust(n){ const lv = gainTrust(F, n); if (lv == null) return;
  const L = HF_LEVELS[lv]; setTimeout(() => { sfx("chaching"); act("cheer"); [0, 300, 600].forEach((d, k) => setTimeout(() => mprop("sparkle", mel.x + (k - 1)*24, mel.y - 60, 1800), d)); speak(`Felix and Elena trust you more and more: you're their ${L.n.toLowerCase()} now! They've given you ${L.gives}.`, 7000); }, 900); }
let hfView = null, hfSt = {kind: "cheddar", name: "", sug: 0};   // Wildflower Farm: "cows" / "goats" / "hives" / "stand"; in the barn "extractor" / "crock" / "press" / "cave"
let ccView = null, lastCocoa = 0, ccSt = {shell: "dark", sel: []};   // ccSt: the bonbon table's picks
const COCOA_IN = ["cocoa", "cocoakitchen"];
let keepItem = null, keepSpot = null, adoptItem = null, adoptSt = {}, petView = null;
let goalView = null, paddling = false, scView = null, scSt = {pick: null, sel: []}, evanSeat = null, lastScoop = 0;
// the Scoop Shack's rooms, and its panels that open from anywhere (the catalogue, the honesty freezer, the delivery bike)
const SCOOP_IN = ["scoopshop", "scoopkitchen", "scoopdip"], SC_ANY = ["upgrade", "honesty", "deliver", "trolley"];   // a big goal's "save up for it" card ("garagepick": the garage's ride chooser)
let fieldView = null, orView = null, orAt = null, orTab = null, potItem = null, kView = null, reviewOpen = false, vyView = null, vyAt = null, vaultView = null, lettersOpen = false, trophyView = null, routOpen = false, kudosOpen = false, deskOpen = false, shedOpen = false, runOpen = false, wardOpen = false, bedOpen = false, journalOpen = false, scratchOpen = false, calmOpen = false, recOpen = false, clientsOpen = false, planOpen = false, revOpen = false, jarsOpen = false; deskOpen = false; kudosOpen = false; routOpen = false; trophyView = null; lettersOpen = false; vaultView = null; vyView = null; reviewOpen = false; kView = null; orView = null; fieldView = null; goalView = null;
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
  list.forEach(a => { const r = feedOne(F, a, F.inv, addInv); if (r.ok) { fed++; if (r.egg) eggs += r.egg; if (r.milk) milk++; if (r.grew) grew.push(a); } else if (r.msg) miss = r.msg; });
  if (!fed) { if (miss) speak(miss, 4000); ctx(); return 0; }
  sfx("chime"); gainXp(1); if (scene === "base") [0, 300].forEach(d => setTimeout(() => mprop("heart", 110 + rnd(-30, 30), 520, 1700), d));
  const g = grew[0];
  speak(g ? `${g.name} is all grown up! ${g.kind === "chick" ? "A proper hen now, eggs from tomorrow." : g.kind === "goat" ? "A proper goat now, milk from tomorrow." : "A big fluffy rabbit now."}` : milk && !eggs ? `${milk === 1 ? "A bottle of milk" : milk + " bottles of milk"} for your backpack. Cheese, here we come.` : eggs ? `${eggs === 1 ? "An egg" : eggs + " eggs"} for your backpack! Fresh from the coop.` : fed > 1 ? "Everyone's munching away. Happy run." : `${list[0].name} gobbles it up. Happy little face.`, 4500);
  if (eggs || milk) flash([eggs ? `+${eggs} fresh egg${eggs > 1 ? "s" : ""}` : "", milk ? `+${milk} goat's milk` : ""].filter(Boolean).join(", ") + " in your backpack");
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
  undoMark++; undoFn = restore; $("undoMsg").textContent = plain(msg); $("undoBar").hidden = false;
  clearTimeout(undoT); undoT = setTimeout(() => { $("undoBar").hidden = true; undoFn = null; }, 7000);
}
// Anything bought by mistake can be undone: every tap remembers the save as it was, and if the tap spent coins
// (a shop, a stall, the shed, decor, seedlings, the vineyard shop...) the undo bar offers to put it all back.
// A tap that already offered its own undo, or a coin taken back for an unticked chore, is left alone.
let undoMark = 0, lastFlash = "";
document.addEventListener("click", e => {
  if (!F || e.target.closest && e.target.closest("#undoBar")) return;
  const c0 = F.coins, snap = JSON.stringify(F), m0 = undoMark, F0 = F; lastFlash = "";
  setTimeout(() => {
    if (F !== F0 || F.coins >= c0 || undoMark !== m0 || /^-/.test(lastFlash)) return;
    const spent = c0 - F.coins, what = lastFlash;
    undoable(`${what ? what.replace(/[.!]$/, "") + " · " : "Spent "}${spent} coin${spent === 1 ? "" : "s"}`, () => {
      const was = JSON.parse(snap); Object.keys(F).forEach(k => delete F[k]); Object.assign(F, was);
      flash(`Undone: ${spent} coin${spent === 1 ? "" : "s"} back`); resetNpcs(); save(true); ctx(); drawScene(); render(); });
  }, 0);
}, true);
$("undoBtn").onclick = () => { const f = undoFn; undoFn = null; clearTimeout(undoT); $("undoBar").hidden = true; if (f) { f(); sfx("paper", true); } };
let earnT;
function flash(msg){ lastFlash = msg; const e = $("earn"); e.textContent = plain(msg); clearTimeout(earnT); earnT = setTimeout(() => e.textContent = "", 4000); }
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
  if (townOf(scene)) return `A day in ${TOWNS[townOf(scene)].n}. ${ph === "clean" || ph === "task" ? "Quests will keep till you're home." : "Wander, look, taste."}`;
  if (ph === "clean") return atClean() ? (S.wipe ? "Five minutes. Hard stop, promise." : (sgHM() < 720 ? "Morning! Wet wipe first?" : "Hi! Wet wipe first?")) : "To the cleaning cupboard at home!";
  if (ph === "task") { const t = remaining()[0]; return arrivedFor(t) ? (S.firstStep[t.id] ? "You're doing it. I'm watching the clock." : "We're here. Just the first tiny step.") : `Next quest: the ${spotObj(placeOf(t), spotOf(t)).name.toLowerCase()} at ${placeInfo(placeOf(t)).short}.`; }
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
let lastReady = readyCount(), lastDusk = null, lastFieldEv = null, lastSky = null;
const skyKey = () => skyWash(sgHM()) + scene;
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
  if (Date.now() - lastScoop > 20000) scoopNow();
  if (Date.now() - lastCocoa > 20000) cocoaNow();
  if (Date.now() - lastFarm > 20000) farmNow();
  { const l = bikeExpired(F); if (l) { speak(l, 4500); save(); } }
  townTick();
  { const k = scene === "base" ? `${bonfireNow(dayKey(), sgHM())}` : scene === "bay" ? `${vanNow(dayKey(), sgHM())}${spotOpen("bay")}` : scene === "field" ? `${!!(S.kite && S.kite.until > Date.now())}${movieNow(dayKey(), sgHM())}${bayMarketNow(dayKey(), sgHM())}` : ""; if (k !== lastFri) { lastFri = k; if (k) drawScene(); } }
  if (scene === "mill") { const m = millState(F), k = m.press ? (pressLeft(m) ? "on" : "ready") : ""; if (k !== lastMill) { lastMill = k; drawScene(); if (millOpen) ctx(); } }
  if (outside() && skyKey() !== lastSky) { lastSky = skyKey(); drawScene(); }
  { const tk = outside() ? trainKey(scene) : ""; if (tk !== lastTrain) { lastTrain = tk; drawScene();   // a train coming through: draw it (it runs on from where it is)
      const t = tk && trainHere(scene); if (t && scene === "hlane" && t.mode === "arrive") speak(`Here comes the ${railTime(t.t)}: ${t.n.toLowerCase()} ${t.to}.`, 4000); else if (t && t.mode === "pass") speak(t.dir === "e" ? "Toot toot! A train rattles past, on its way to Honeybrook station." : "A train chuffs by along the top, off to the city.", 3500); } }   // the sunset deepens: redraw every 5 minutes through the evening
  // the field when a market, fair or night market starts or packs up (and the night market's light drops at 7): redraw, and the jazz starts or stops
  if (scene === "field") { const ev = eventNow(dayKey(), sgHM()), k = ev ? ev.kind + (sgHM() >= 19*60) : ""; if (k !== lastFieldEv) { lastFieldEv = k; drawScene(); } }
  setLive(liveNow());
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
  if (phase() === "clean") { const c = spotObj("garage", "cupboard"); go("garage", c.tx, c.ty, () => arriveSpot("cupboard")); return; }
  const pl = placeOf(t), sp = spotObj(pl, spotOf(t)); go(pl, sp.tx, sp.ty, () => pl === "base" ? arriveVillageSpot(sp.id) : arriveSpot(sp.id));
}
const A = {
  walk(t){ goQuest(t); },
  pond(){ go("base", VILLAGE.pond.door[0], VILLAGE.pond.door[1], () => arriveVillageSpot("pond")); },
  gotWipe(){ S.wipe = true; startTimer("clean", 5); setSay("Nearest, most annoying spot. You pick!"); save(); },
  cleanDone(){ S.cleanDone = true; S.timer = null; earn(3, "five-minute clean"); gainXp(1); S.last = "clean"; act("cheer"); setSay("First tick of the day! Look at that ✨"); save(); },
  firstStep(t){ S.firstStep[t.id] = true; S.arrived[t.id] = true; startTimer("task", t.minutes || 25, t.id); setSay("Hard part's done. Now the rest, on the clock."); save(); },
  done(t){
    S.doneIds.push(t.id); S.timer = null; sfx("chaching"); earn(QUEST_PAY, "quest complete"); gainXp(1); S.last = t.title; countQuest();
    if (t.source === "sunsama" && !t.completed) tickSunsama(t.id);
    if (t.early) { F.early[t.id] = t.early; setTimeout(() => speak("Done a day early! It's ticked off in Sunsama, and it'll already be done on tomorrow's board.", 6000), 4200); }
    let grew = 0; F.plots.forEach(p => { if (p && p.crop && p.wateredAt && growth(p) < 1) { p.bonus = (p.bonus || 0) + QUEST_BOOST; grew++; } });
    grew += questBoost(F, QUEST_BOOST) + ghBoost(F, QUEST_BOOST);   // the vines, barrels, oven and cheese press move on too
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
  const paid = done ? paySub(t, key) : 0;
  if (paid) { if (paid > 1) sfx("chaching"); earn(paid, paid > 1 ? "batch quest done" : "subtask"); }
  else sfx(done ? "tap" : "paper", true);
  const left = subView(t).list.filter(y => !y.done).length;
  if (done && !left) speak("Every subtask ticked! Tap Done when you're ready.", 4500, true);
  save(); refreshNotebook();
}
// Subtasks pay the first time they're ticked, in the village or in Sunsama (F.subDone[task].paid remembers, so unticking
// and re-ticking doesn't pay twice). In a treadmill batch each subtask was a task of its own, so it pays like one: 5 coins,
// 1 xp and the growing boost; any other subtask pays 1. -> coins owed (the caller pays them), 0 if already paid
const QUEST_PAY = 8;   // a quest done (round 101: up from 5, so real life keeps pace with the shops)
function paySub(t, key){
  F.subDone = F.subDone || {}; const rec = F.subDone[t.id] = F.subDone[t.id] || {s: {}, at: Date.now()}; rec.paid = rec.paid || {};
  if (rec.paid[key]) return 0; rec.paid[key] = true;
  if (!isTreadTask(t)) return 1;
  gainXp(1); F.plots.forEach(p => { if (p && p.crop && p.wateredAt && growth(p) < 1) p.bonus = (p.bonus || 0) + QUEST_BOOST; }); questBoost(F, QUEST_BOOST); ghBoost(F, QUEST_BOOST);
  return QUEST_PAY;
}
// Subtasks ticked over in Sunsama (today's tasks, and later days' tasks started early) pay too. The first time this
// runs, whatever's already ticked is just noted, so nothing done before pays twice. -> coins paid
function paySunsamaSubs(list){
  const first = !F.subBaseline; let coins = 0;
  (list || []).forEach(t => (t.subtasks || []).forEach(x => { if (!x.done) return; const key = subKey(x);
    if (first) { F.subDone = F.subDone || {}; const rec = F.subDone[t.id] = F.subDone[t.id] || {s: {}, at: Date.now()}; (rec.paid = rec.paid || {})[key] = true; }
    else coins += paySub(t, key); }));
  F.subBaseline = true;
  if (coins) { sfx("chaching"); earn(coins, "ticked in Sunsama"); }
  return coins;
}
// A later day's task ticked off early in Sunsama: 5 coins now, and it's already done when its day comes (F.early)
function creditAhead(list){
  let n = 0;
  (list || []).forEach(t => { if (!t.completed || F.early[t.id]) return; F.early[t.id] = t.day; earn(QUEST_PAY, "done early in Sunsama"); gainXp(1); countQuest(); n++; });
  if (n) setTimeout(() => speak(n === 1 ? "You ticked one of tomorrow's quests off early in Sunsama. Coins now, and it's already done when tomorrow comes!" : `${n} of tomorrow's quests done early in Sunsama! Coins now.`, 5500), 1200);
  return n;
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
  const later = !S.cleanDone && !S.cleanLater; if (later) S.cleanLater = true;
  S.order = [id, ...ids.filter(x => x !== id)]; say = null; openView = null; boardOpen = false; speak(later ? "New quest picked! The five-minute clean will wait on the board for later." : "New quest picked! Off we go.", 3500); save(true);
}
// Every finished quest (here or in Sunsama) counts towards village upgrades, which stay forever.
function countQuest(){
  const before = unlocked(F.totalQuests || 0).length;
  F.totalQuests = (F.totalQuests || 0) + 1;
  F.storyDay = dayKey();   // villagers tell their stories on days Mel's done something real (stories.js)
  addBait(F, 1);   // every quest done digs up a worm for the bait tin (fishing.js)
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
    if (F.early[t.id]) { S.doneIds.push(t.id); return; }   // done early (paid back then)
    S.doneIds.push(t.id); got.push(t); if (got.length === 1) sfx("chaching");
    const q = allTasks().find(x => x.id === t.id); if (q && q.early) F.early[t.id] = q.early;
    earn(QUEST_PAY, "done in Sunsama"); gainXp(1); countQuest();
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
  const extraPay = creditAhead(r.ahead) + paySunsamaSubs([...r.tasks, ...(r.ahead || [])]);
  if (extraPay) save(true);
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
      return `<li><span class="pl">${icon(placeOf(t) === "office" || placeOf(t) === "garage" ? "home" : placeOf(t), 18)}</span><span><b>${esc(t.title)}</b><small>${t.minutes || 25} min</small></span>${early ? `<span class="hbadge">done early</span>` : on ? `<span class="hbadge sched">on today's board</span>` : `<button class="next" data-early="${esc(t.id)}">do today</button>`}</li>`; }).join("")}</ul>`;
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
const PLACES = {home: "home", house: "home", fridge: "home:fridge", kitchen: "home:kitchen", cupboard: "garage:cupboard", "cleaning cupboard": "garage:cupboard", laundry: "garage:laundry", garage: "garage", treadmill: "office:treadmill", "home office": "office", office: "office", desk: "office:desk", "home desk": "office:desk", "darren's desk": "office:office", sofa: "home:sofa",
  pond: "base:pond", garden: "farm", farm: "farm", shed: "base:shed", swing: "base:swing", letterbox: "base:letterbox", "animal run": "base:run", wardrobe: "room:wardrobe", outfit: "room:wardrobe", "my room": "room", bedroom: "room", bed: "room:bed", journal: "room:journal", jars: "room:jars", "emotion shelf": "room:jars", "emotion jar": "room:jars", scratchpad: "hall:whiteboard", whiteboard: "hall:whiteboard", run: "base:run", animals: "base:run", chickens: "base:run", rabbits: "base:run", market: "market", well: "village:well",
  "wine shop kitchen": "kitchen", "shop kitchen": "kitchen", larder: "kitchen:larder", oven: "kitchen:oven", stove: "kitchen:stove", "cheese press": "kitchen:press", "olive tree": "vineyard:olive", olives: "vineyard:olive",
  "weekly review": "hall:review", review: "hall:review", scrapbook: "hall:review", "week review": "hall:review",
  field: "field:lake", lake: "field:lake", swans: "field:lake", picnic: "field:picnic", football: "field:pitch", park: "field:lake",
  orchard: "orchard:farmshop", "farm shop": "orchard:farmshop", "tour sign": "orchard:toursign", tours: "orchard:toursign", "fruit": "orchard:farmshop", "flower farm": "flowers", foreshore: "shore:dolphins", beach: "shore:dolphins", seaside: "shore:dolphins", "dolphin bench": "shore:dolphins", dolphins: "shore:dolphins", paddleboard: "shore:suprack", paddleboards: "shore:suprack", "paddleboarding": "shore:suprack", "mum's house": "mumdad", "mum and dad's": "mumdad", "parents' house": "mumdad", "marcus's house": "marcus", "marcus and angelina's": "marcus", "exercise lawn": "field:exlawn", "exercise class": "field:exlawn", pilates: "field:exlawn", zumba: "field:exlawn", "ma ma": "cottage", "ma ma's cottage": "cottage", cottage: "cottage", "grandma": "cottage",
  vineyard: "vineyard:barrels", vines: "vineyard:vinestall", "barrel shed": "vineyard:barrels", barrels: "vineyard:barrels", "wine shop": "wineshop", "honesty box": "wineshop:hbox", "tasting room": "wineshop:tasting", playground: "vineyard:pslide",
  "town hall": "hall", hall: "hall", bank: "bank", vaults: "bank", savings: "bank", "kind words": "trophy:kudos", "trophy room": "trophy", courtyard: "trophy", fountain: "trophy:fountain", trophies: "trophy", "trophy book": "trophy:tbook", affirmations: "trophy:affirm", routines: "room:routines", "routine board": "room:routines", compliments: "trophy:kudos", "client table": "hall:clients", clients: "hall:clients", "planning table": "hall:table", plans: "hall:table", revenue: "hall:revenue", "revenue chart": "hall:revenue", chord: "chord", "makers lane": "lane:plot3", lane: "lane:plot3", library: "fresh", "fresh pages": "fresh", chico: "chico", luna: "luna", "luna house": "luna", ohayo: "ohayo", "ohayo house": "ohayo", "post office": "post", post: "post", town: "village:board"};
function walkToPlace(name){
  if (/dinner|dining table/.test(String(name || "").toLowerCase())) { const d = dinnerOn(dayKey()), host = d ? d.host : "home", st = spotObj(host, "dine"); go(host, st.tx, st.ty, () => arriveSpot("dine")); return name; }
  const k = PLACES[String(name || "").toLowerCase().trim()]; if (!k) return null;
  const [pl, sp] = k.split(":");
  if (pl === "base" || pl === "village" || pl === "lane" || pl === "vineyard" || pl === "orchard" || pl === "field" || pl === "shore") { const v = VILLAGE[sp]; go(pl, v.door[0], v.door[1], () => arriveVillageSpot(sp)); }
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
{"type":"go","place":"family dinner|foreshore|dolphin bench|paddleboards|mum's house|marcus's house|exercise lawn|field|lake|picnic|football|orchard|farm shop|tour sign|flower farm|ma ma's cottage|wine shop kitchen|larder|olive tree|weekly review|vineyard|barrels|wine shop|honesty box|tasting room|playground|home|fridge|kitchen|cupboard|treadmill|sofa|my room|bed|journal|emotion shelf|wardrobe|scratchpad|pond|garden|shed|swing|letterbox|animal run|client table|planning table|bank|courtyard|trophy room|trophy book|affirmations|kind words|routines|revenue chart|market|well|town hall|chord|library|chico|luna|ohayo|post office"}
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
// The village calendar, pinned on the good news board: festivals coming up (the next three months), and what's on
// each day for the next two weeks (markets, the field fair, the night market, the wine club, family dinners)
const CAL_DAYS = 14, FEST_DAYS = 92;
function villageCalendar(){
  const today = dayKey(), addD = (k, n) => new Date(Date.parse(k + "T00:00:00Z") + n*864e5).toISOString().slice(0, 10);
  const fmtD = k => new Date(k + "T00:00:00Z").toLocaleDateString("en-GB", {weekday: "short", day: "numeric", month: "short", timeZone: "UTC"});
  const hhmm = m => { const h = Math.floor(m/60), mm = m % 60; return `${h % 12 || 12}${mm ? ":" + String(mm).padStart(2, "0") : ""}${h < 12 ? "am" : "pm"}`; };
  const until = k => { const n = Math.round((Date.parse(k + "T00:00:00Z") - Date.parse(today + "T00:00:00Z"))/864e5); return n === 0 ? "today" : n === 1 ? "tomorrow" : `in ${n} days`; };
  const fests = FESTIVALS.flatMap(f => f.dates.map(k => ({f, k, from: addD(k, -f.before), to: addD(k, f.after)}))).filter(x => x.to >= today && x.k <= addD(today, FEST_DAYS)).sort((a, b) => a.k.localeCompare(b.k));
  const days = [];
  for (let i = 0; i < CAL_DAYS; i++) {
    const k = addD(today, i), ev = eventOn(k), dn = dinnerOn(k), list = [];
    if (ev) list.push(`${ev.name}, ${hhmm(ev.from)} to ${hhmm(ev.to)} on the field${ev.kind === "market" ? ` (our wine stall's there${F.cocoa && F.cocoa.up && F.cocoa.up.cart ? `, and ${cocoaState(F).name}'s chocolate cart` : ""})` : ev.kind === "night" ? ` (with a jazz duo, and the cart from ${scoopState(F).name})` : ""}`);
    if (F.cocoa && F.cocoa.up && F.cocoa.up.workshop && new Date(k + "T00:00:00Z").getUTCDay() === 6) list.push(`Bonbon workshop at ${cocoaState(F).name}, 2 to 4pm`);
    if (owns(F, "cellar") && wineClubOn(k)) list.push(`Wine club at the cellar door, 6 to 9pm`);
    if (dn) list.push(`Family dinner at ${HOST_NAME[dn.host]}, 6:30pm`);
    fests.filter(x => x.k === k).forEach(x => list.push(`${x.f.name}!`));
    if (list.length) days.push({k, list});
  }
  return {fests: fests.map(x => ({name: x.f.name, when: x.k === x.from && x.k === x.to ? fmtD(x.k) : fmtD(x.k), until: x.from <= today && today <= x.to ? (x.k < today ? "on now (decorations still up)" : x.k === today ? "today!" : `${until(x.k)}, decorations are up`) : until(x.k)})),
    days: days.map(d => ({when: d.k === today ? "Today" : d.k === addD(today, 1) ? "Tomorrow" : fmtD(d.k), list: d.list}))};
}
// the apps on Makers' Lane, each with a building, a nightly bug check (health-<id>) and a user garden (stats.<id>)
const APP_IDS = ["chord", "chico", "luna", "ohayo"], APP_NAME = {chord: "Chord", chico: "Chico", luna: "Luna", ohayo: "Ohayo"};
function myWins(){
  const w = [], y = F.history && F.history[prevDay(dayKey())];
  if (S.doneIds.length) w.push(`${S.doneIds.length} quest${S.doneIds.length > 1 ? "s" : ""} done today`);
  if (y && y.q) w.push(`${y.q} quest${y.q > 1 ? "s" : ""} finished yesterday`);
  if (F.streak >= 2) w.push(`${F.streak} cosy days in a row with ${F.name}`);
  if (S.harvested) w.push(`${S.harvested} harvest${S.harvested > 1 ? "s" : ""} from the garden today`);
  APP_IDS.forEach(a => { const h = health(a); if (h && h.status === "green") w.push(`${APP_NAME[a]}: all checks green last night`); });
  if (ST.chord && ST.chord.users) w.push(`Chord is home to ${ST.chord.users} ${ST.chord.label || "studios"}`);
  if (ST.chico && ST.chico.users) w.push(`${ST.chico.users} ${ST.chico.label || "families"} use Chico`);
  ["luna", "ohayo"].forEach(a => { if (ST[a] && ST[a].users) w.push(`${ST[a].users} ${ST[a].label || "users"} use ${APP_NAME[a]}`); });
  return w;
}

/* =================== MAIL (agent notes) =================== */
// Notes the page writes itself: the Friday "weekend edition" of the paper and the 6pm wind-down at the pond.
const sgAt = (day, h, m = 0) => Date.UTC(+day.slice(0, 4), +day.slice(5, 7) - 1, +day.slice(8, 10), h - 8, m);
const WEEKDAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
let localCache = {key: "", items: []};
const dayKeyAt = ms => new Date(ms + 6*H).toISOString().slice(0, 10);   // same 2am reset as dayKey()
function localMail(){
  const day = dayKey(), hm = sgHM(), mi = MAIL.items || [], key = `${day}:${Math.floor(hm/10)}:${S.doneIds.length}:${S.cleanDone}:${mi.length}:${mi.length ? mi[mi.length - 1].id : ""}:${thanksMail().length}:${slowMail(F).length}`;
  if (key === localCache.key) return localCache.items;
  const out = [], wd = new Date(day + "T00:00:00Z").getUTCDay();
  if ((wd === 5 && hm >= 900) || wd === 6 || wd === 0) out.push(weeklyPaper(wd === 5 ? day : wd === 6 ? prevDay(day) : prevDay(prevDay(day))));
  // The page's own 6pm note only when the evening wind-down routine hasn't already sent today's.
  const routineWind = (MAIL.items || []).some(m => m && m.from === "winddown" && m.at && dayKeyAt(m.at) === day);
  if (hm >= 1080 && !routineWind && (S.cleanDone || S.doneIds.length)) out.push({id: "wind-" + day, from: "winddown", at: sgAt(day, 18), pond: true,
    title: "Time to close the day", body: "Meet me at the pond. Each of today's wins gets a lantern on the water.\nThen tell chat \"wind down\" whenever you're ready."});
  out.push(...thanksMail(), ...slowMail(F));   // round 129: Jeju's slow-post postcards, two weeks on
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
// Only the newest paper counts (the daily one and the weekend edition each): once today's is out, yesterday's unread
// one isn't "new post" any more, so it doesn't put the flag up on the letterbox again after Mel's read today's.
const paperKind = m => String(m.id).startsWith("weekly-") ? "weekly" : "daily";
function stalePapers(){
  const newest = {}; allMail().forEach(m => { if (m && m.id && m.from === "crier") { const k = paperKind(m); if (!newest[k] || (m.at || 0) > (newest[k].at || 0)) newest[k] = m; } });
  return new Set(allMail().filter(m => m && m.id && m.from === "crier" && newest[paperKind(m)] !== m).map(m => m.id));
}
const unreadMail = () => { const stale = stalePapers(); return allMail().filter(m => m && m.id && !F.mailRead[m.id] && !stale.has(m.id) && (!m.at || Date.now() - m.at < 36*H)).sort((a, b) => (a.at || 0) - (b.at || 0)); };
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
    flash(`Bought ${d.n.toLowerCase()}`); speak(d.where === "me" ? (id === "me_pj" ? "Silk pyjamas! You'll wear them in your room. They live in your wardrobe: take them off there any time." : id === "me_hat" ? "Sun hat on whenever you're outside! It lives in your wardrobe: take it off there any time." : "Ooh, that suits you. It lives in your wardrobe now: take it off there any time.") : d.where === "room" ? "Ooh! It's waiting in your room." : "Ooh! It's waiting for you at home.", 3500);
  } else if (F.decor[d.slot] === d.val) { delete F.decor[d.slot]; speak("Put away for now.", 2500); }
  else { F.decor[d.slot] = d.val; speak("Swapped in. Go and have a look!", 3000); }
  save(true);
}
function useItem(id){
  const it = ITEMS[id]; if (!it || !F.inv[id]) return;
  if (it.kind === "seed") { speak("Seeds go in the garden. Tap a plot there!", 3500); return; }
  if (it.kind === "gift") { giftPick = giftPick === id ? null : id; bag(); return; }
  if (it.kind === "bouquet") { giftPick = giftPick === id ? null : id; bag(); return; }   // choose who it's for, like a gift
  if (it.kind === "pot") { potItem = id; orView = "pot"; openView = null; render(); return; }
  if (it.kind === "keepsake") { keepItem = id; openView = null; render(); return; }
  if (it.kind === "pet") { adoptItem = id; adoptSt = {}; openView = null; render(); return; }
  if (it.kind === "ingredient") { toKitchen(id); return; }
  if (it.kind === "feed") { if (openView) { openView = null; ctx(); } speak("That's for the animals. Off to the run!", 3000); walkToPlace("animal run"); return; }
  // a toy (the kite) is never used up: fly it on the field, and anywhere else it stays in the backpack (round 130)
  if (it.kind === "toy") { if (id === "kite" && scene === "field") { if (openView) { openView = null; ctx(); } flyKite(); } else speak(id === "kite" ? "Kites need open grass and a breeze: take it to the field by the river." : "Let's save that for later.", 4000); return; }
  // the brush at Wildflower Farm brushes the animals (the next one in the nearer paddock), and counts for Felix's ask
  if (id === "brush" && scene === "hfarm") { const herd = mel.x < 260 ? "cows" : "goats", an = brushNearest(F, herd); if (openView) { openView = null; ctx(); }
    if (!an) { speak(`Everyone in the ${herd === "cows" ? "cow" : "goat"} paddock's been brushed today. Very glossy.`, 4000); render(); return; }
    act("brush", it); sfx("chime"); gainXp(1); farmTrust(1); mprop("heart", mel.x, mel.y - 60, 1600); speak(an.line, 3500); save(); render(); return; }
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
// a bouquet handed to one of the family who's right here
function bouquetTo(id, w){
  const it = ITEMS[id]; if (!it || !F.inv[id]) return;
  addInv(id, -1); F.bouquets = F.bouquets || {}; F.bouquets[w] = (F.bouquets[w] || 0) + 1; F.fam.gifts[w] = (F.fam.gifts[w] || 0) + 1;
  if (w === "evan") { evanSays("flowers! for me?"); mprop("heart", evan.x, evan.y - 44, 1800); flash("Evan sniffed every single flower"); }
  else { const p = npcPos(w); npcSay(w, pick(w === "mama" ? MAMA_THANKS : BQ_THANKS)); if (p) mprop("heart", p.x, p.y - 50, 1800); flash(`${GIFT_NAME[w]} loved the ${it.n.toLowerCase()}`); }
  sfx("chime"); gainXp(1); save(true);
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
// Who a gift suits: one of the family, Ma Ma and Gong Gong ("grands"), anyone in the family ("family"), or a list
const GIFT_NAME = {evan: "Evan", darren: "Darren", mama: "Ma Ma", gonggong: "Gong Gong", mum: "Mum", dad: "Dad", marcus: "Marcus", angelina: "Angellina"};
const FOLKS = ["mum", "dad", "marcus", "angelina"];   // Mel's family on the foreshore: gifts go to them in person, wherever they are
const giftWho = to => to === "family" ? ["evan", "darren", "mama", "gonggong", ...FOLKS] : to === "grands" ? ["mama", "gonggong"] : Array.isArray(to) ? to : [to];
// a bouquet can go to anyone in the family (in person, or sent round), or to whoever's standing nearby
const FAMILY_ALL = ["evan", "darren", "mama", "gonggong", ...FOLKS];
function nearVillager(){ const n = npcActors().map(([, e]) => e).filter(e => e.kind === "npc" && !FAMILY_ALL.includes(e.def.id)).map(e => [e, Math.hypot(e.x - mel.x, e.y - mel.y)]).sort((a, b) => a[1] - b[1])[0]; return n && n[1] < 170 ? n[0] : null; }
const recipients = it => it.kind === "bouquet" ? [...FAMILY_ALL, ...(nearVillager() ? ["near"] : [])] : giftWho(it.to);
const recipName = w => w === "near" ? ((nearVillager() || {}).def || {name: "someone nearby"}).name : GIFT_NAME[w];
const giftNames = to => to === "grands" ? "Ma Ma or Gong Gong" : to === "family" ? "the family" : giftWho(to).map(g => GIFT_NAME[g]).join(giftWho(to).length > 2 ? ", " : " or ").replace(/, ([^,]*)$/, " or $1");
// Who's close enough to hand a gift to in person (null if they're not on this screen)
const giftPos = w => w === "evan" ? (evanHere() ? evan : null) : w === "darren" ? (isHere("darren") ? npcPos("darren") : null) : npcPos(w);
// Tapping a gift in the backpack opens a little chooser of who it suits. Someone here gets it in person; anyone else
// gets it sent round, and their thank-you note arrives in the mailbox a little later (F.thanks).
let giftPick = null;
function giftPickHTML(id){
  const it = ITEMS[id]; if (!it || !F.inv[id]) return "";
  return `<div class="giftpick" style="grid-column:1/-1"><p><b>Give the ${esc(it.n.toLowerCase())} to…</b></p><div class="actions">${recipients(it).map(w => `<button class="btn small ${w === "near" || giftPos(w) ? "primary" : "alt"}" data-giveto="${w}">${esc(recipName(w))}<small>${giftPos(w) ? " · here" : " · send it"}</small></button>`).join("")}${canKeep(it) ? `<button class="btn small alt" data-keepit="1">Keep it${it.magnet ? "<small> · for the fridge</small>" : "<small> · on a shelf</small>"}</button>` : ""}<button class="btn small alt" data-giveto="">Cancel</button></div>
    <p class="muted">Anyone who isn't here gets it sent round, and their thank-you note comes to your mailbox.${canKeep(it) ? " Or keep it, and put it up somewhere of yours." : ""}</p></div>`;
}
function giveTo(id, w){
  giftPick = null; const it = ITEMS[id]; if (!w || !it || !F.inv[id]) { bag(); return; }
  if (w === "near") { giveBouquet(id); bag(); return; }
  if (giftPos(w)) { if (it.kind === "bouquet") bouquetTo(id, w); else giveGift(id, w); bag(); return; }
  if (it.gel && !hasUp(scoopState(F), "bike")) { speak(`It'd melt on the way! Give it to ${GIFT_NAME[w]} in person, or get the Scoop Shack a delivery bike.`, 4500); bag(); return; }
  addInv(id, -1); F.fam.gifts[w] = (F.fam.gifts[w] || 0) + 1; gainXp(1);
  F.thanks = [...(F.thanks || []), {id: `thanks-${w}-${Date.now()}`, who: w, item: id, at: Date.now() + 10*M}].slice(-30);
  sfx("chime"); flash(`Sent to ${GIFT_NAME[w]}`); speak(`Wrapped up and sent to ${GIFT_NAME[w]}. Watch your mailbox for a thank-you note.`, 4500); save(); bag();
}
const SIGNOFF = {mum: "Love, Mum xx", dad: "Love, Dad", mama: "Love you, ah girl. Ma Ma", gonggong: "Gong Gong", marcus: "Cheers Zeh, Marcus", angelina: "Love, Angellina", darren: "Love you. D", evan: "Love, Evan (Darren held the pencil)"};
const BQ_NOTE = {mama: "Ma Ma put them by the TV. So pretty, I look at them every day.", gonggong: "Gong Gong put them in water for Ma Ma. Okay, also for me.", mum: "They're on the dining table. Dad keeps saying they're from him.", dad: "I'm going to draw them before they fade.",
  marcus: "Angie put them in a vase. The flat smells amazing.", angelina: "They're on my desk while I study. Thank you!", darren: "In a jar by the kettle. Very fancy.", evan: "I smelled ALL of them."};
function thankNote(t){
  const it = ITEMS[t.item] || {n: "present", say: ""}, line = it.kind === "bouquet" ? BQ_NOTE[t.who] || "They're beautiful." : (it.says && it.says[t.who]) || it.say || "";
  return `${t.who === "evan" ? "Dear Mama" : "Dear Mel"},\n\nThank you for the ${it.n.toLowerCase()}! ${line}\n\n${SIGNOFF[t.who] || ""}`;
}
// thank-you notes that have arrived (they take about ten minutes to come back)
const thanksMail = () => (F.thanks || []).filter(t => t.at <= Date.now()).map(t => ({id: t.id, from: "postie", at: t.at, title: `Thank you from ${GIFT_NAME[t.who] || "someone"}`, body: thankNote(t)}));
function giveGift(id, chosen){
  const it = ITEMS[id]; if (!it || !F.inv[id]) return;
  const burst = (x, y) => [0, 250, 500].forEach((d, k) => setTimeout(() => mprop("heart", x + (k - 1)*14, y - 40 - k*6, 1800), d));
  const showMap = () => { if (openView) { openView = null; ctx(); } };
  const who = chosen ? [chosen] : giftWho(it.to);
  // more than one person it'd suit: hand it to whichever of them is nearest
  let to = it.to, g = null;
  if (who.length > 1 && it.to !== "grands") {
    const here = who.map(w => [w, w === "evan" ? (evanHere() ? evan : null) : w === "darren" ? (isHere("darren") ? npcPos("darren") : null) : npcPos(w)]).filter(([, p]) => p)
      .sort((a, b) => Math.hypot(a[1].x - mel.x, a[1].y - mel.y) - Math.hypot(b[1].x - mel.x, b[1].y - mel.y))[0];
    if (!here) { speak(`That's a present for ${giftNames(it.to)}. Give it to ${who.length > 2 ? "one of them" : "either of them"} in person!`, 4500); return; }
    to = here[0] === "mama" || here[0] === "gonggong" ? "grands" : here[0]; g = to === "grands" ? here[0] : null;
  } else if (who.length === 1 && (who[0] === "mama" || who[0] === "gonggong")) { to = "grands"; g = who[0]; }
  else if (who.length === 1) to = who[0];
  const say = w => (it.says && it.says[w]) || it.say;
  if (FOLKS.includes(to)) {
    const p = npcPos(to); if (!p) { speak(`${GIFT_NAME[to]}'s not here. Give it to ${to === "dad" || to === "marcus" ? "him" : "her"} in person!`, 3500); return; }
    addInv(id, -1); F.fam.gifts[to] = (F.fam.gifts[to] || 0) + 1;
    showMap(); npcSay(to, say(to)); burst(p.x, p.y - 20); sfx("chime"); flash(`${GIFT_NAME[to]} loved the ${it.n.toLowerCase()}`); gainXp(1); save(); return;
  }
  if (to === "evan") {
    if (!evanHere()) { speak("Evan's at home. Give it to him there!", 3500); return; }
    addInv(id, -1); const n = ++F.fam.gifts.evan;
    evan.tx = mel.x + 16; evan.ty = mel.y + 4; evan.run = true; evan.wait = 5;
    showMap(); evanSays(say("evan")); burst(evan.x, evan.y); sfx("chime"); flash(`Evan loved the ${it.n.toLowerCase()}!`);
    if (id === "icecream" || id === "storybook") S.evanHold = {k: id, until: Date.now() + 3*M};
    if (it.gel) S.evanHold = {k: "icecream", until: Date.now() + 3*M};
    if (id === "balloon") S.evanHold = {k: "balloon", until: 0};
    if (id === "storybook" && scene === "home") { const s = spotObj("home", "dine"); evan.tx = s.tx + 20; evan.ty = s.ty; }
    if (id === "wand") { clearInterval(bubbleT); let k = 0; bubbleT = setInterval(() => { if (++k > 16 || !evanHere()) return clearInterval(bubbleT); mprop("bubbles", evan.x + rnd(-14, 14), evan.y - 34); }, 1200); }
    if (n % 3 === 0) setTimeout(() => { evanSays("for you, Mama!"); addInv("tulip", 1); flash("Evan picked you a tulip"); save(); }, 4000);
  } else if (to === "grands") {
    // whichever grandparent is nearest (both live in the cottage in the orchard)
    const here = (g ? [g] : ["mama", "gonggong"]).map(g => [g, npcPos(g)]).filter(([, p]) => p).sort((a, b) => Math.hypot(a[1].x - mel.x, a[1].y - mel.y) - Math.hypot(b[1].x - mel.x, b[1].y - mel.y))[0];
    if (!here) { const w = whereIs("mama"); speak(`Ma Ma and Gong Gong aren't here. ${w === "cottage" ? "They're home in the cottage" : w ? "Ma Ma's out at the " + ({orchard: "orchard", flowers: "flower farm", village: "town square", vineyard: "vineyard", base: "house", field: "field"}[w] || w) : "Try the orchard"}. Give it to them in person!`, 4500); return; }
    const [gp, p] = here; addInv(id, -1); F.fam.gifts[gp] = (F.fam.gifts[gp] || 0) + 1;
    showMap(); npcSay(gp, say(gp) + (gp === "mama" ? " I love you." : "")); burst(p.x, p.y - 20); sfx("chime"); flash(`${gp === "mama" ? "Ma Ma" : "Gong Gong"} loved the ${it.n.toLowerCase()}`);
  } else {
    if (!isHere("darren")) { const w = whereIs("darren"); speak(w ? `Darren's ${DARREN_AT[w] || "around"} right now. Give it to him there!` : "Darren's not around right now.", 4000); return; }
    addInv(id, -1); const n = ++F.fam.gifts.darren;
    showMap(); npcSay("darren", say("darren")); const p = npcPos("darren"); if (p) burst(p.x, p.y - 20); sfx("chime"); flash(`Darren says thanks for the ${it.n.toLowerCase()}`);
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
    dino: `<path d="M6 -14 q3 -6 7 -3 q3 0 4 4 l-2 0 l-1 3 h-6z" fill="#7FA35A"/><circle cx="14.5" cy="-14.5" r=".7" fill="#2F2B28"/>`,
    plane: `<path d="M4 -16 h12 l3 -2 v4 l-3 -1 h-12z" fill="#7FB8E8"/><path d="M9 -16 l-2 -5 h3 l2 5z M9 -15 l-2 4 h3 l2 -4z" fill="#E8566C"/>`,
    robot: `<rect x="7" y="-18" width="8" height="8" rx="1.5" fill="#C9CED6"/><rect x="8.5" y="-22" width="5" height="4" rx="1" fill="#C9CED6"/><circle cx="10" cy="-20" r=".6" fill="#2F2B28"/><circle cx="12" cy="-20" r=".6" fill="#2F2B28"/><path d="M11 -22 v-2" stroke="#E8566C" stroke-width=".8"/>`,
    truck: `<rect x="7" y="-6.5" width="7" height="4" rx=".8" fill="#F3C969"/><path d="M14 -5.5 h2.5 l1.5 1.8 v1.2 h-4z" fill="#EFA3A6"/><circle cx="9" cy="-1.8" r="1.3" fill="#5E5A55"/><circle cx="15.5" cy="-1.8" r="1.3" fill="#5E5A55"/>`
  }[k] || "";
}
function playFree(kind){
  const lines = {pet:["*leans into the pat*", "Happy fox noises!", "More pats please."], hide:["You found me!"], nap:["Mmm… cosy…"]};
  if (kind === "pet") { sfx("purr"); hearts(2); speak(pick(lines.pet), 3000); return; }
  act(kind); speak(pick(lines[kind]), 4500);
  if (!F.cool[kind] || Date.now() - F.cool[kind] > 30*M) { F.cool[kind] = Date.now(); gainXp(1); save(); }
}
function buy(id, price){
  const it = ITEMS[id]; if (!it) return; price = price || it.price; if (!price || F.coins < price || (it.need && S.earned < it.need)) return;
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
  F.coins -= price; addInv(id, 1); flash(`Bought ${it.n.toLowerCase()}`); speak(pick(["Ooh, good choice!", "Into the backpack it goes.", "Lovely pick!"]), 2500); save();
}
function sell(id){
  const it = ITEMS[id]; if (!it || !it.sell || !F.inv[id]) return;
  addInv(id, -1); F.coins += it.sell; flash(`Sold ${it.n.toLowerCase()} +${it.sell} coins`);
  speak(it.crafted || id === "oliveoil" ? pick(["Made with your own hands: it fetches a good price.", "Hana holds it up to the light. \"You made this? I'll take it.\"", "Sold! Worth every minute it took."]) : "Fresh from the garden, sold!", 2500); save();
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
      <h1><span class="lbl">quest · ${esc(placeInfo(pl).name)} · ${esc(sp.name)}</span>${esc(t.title)}</h1>
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
  boardOpen = false; shelfOpen = false; shedOpen = false; runOpen = false; wardOpen = false; bedOpen = false; journalOpen = false; scratchOpen = false; calmOpen = false; recOpen = false; clientsOpen = false; planOpen = false; revOpen = false; jarsOpen = false; deskOpen = false; kudosOpen = false; routOpen = false; trophyView = null; lettersOpen = false; vaultView = null; vyView = null; reviewOpen = false; kView = null; orView = null; fieldView = null; goalView = null; selPlot = null; homeView = null; postOpen = false; healthOpen = false; newsOpen = false; ccView = null; hfView = null; railOpen = false; fishSpot = null; woodsView = null; rondaView = null; kyotoView = null; ktSt = {}; jejuView = null; jjSt = {}; loftView = false; cinqueView = null; ctSt = {}; ghBed = null; millOpen = false; friView = null; vanView = null; keepItem = null; keepSpot = null; adoptItem = null; adoptSt = {}; petView = null; scView = null; scSt.pick = null; scSt.dpick = null; scSt.vpick = null; scSt.swap = null; if (scene === "market") shopClosed = true; ctx();
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
  else if (homeView && (scene === "home" || scene === "garage")) h = hestiaPanel(homeView);
  else if (deskOpen && scene === "office") h = deskPanel();
  else if (vaultView && scene === "bank") h = vaultView === "overview" ? bankOverview(isHere("opal")) : vaultPanel();
  else if (reviewOpen && scene === "hall") h = reviewPanel(F, reviewCtx());
  else if (scView && (SCOOP_IN.includes(scene) || SC_ANY.includes(scView))) h = scView === "trolley" ? trolleyPanel(F, {sel: scSt.tsel || []}) : scView === "upgrade" ? upgradePanel(F) : scView === "honesty" ? honestyPanel(F) : scView === "deliver" ? deliverPanel(F, {pick: scSt.vpick, fmt: scSt.vfmt, who: deliverTo()})
    : scView === "pots" ? dipPotsPanel(F) : scView === "tops" ? toppingsPanel(F) : scView === "dipbar" ? dipBarPanel(F, {pick: scSt.dpick, dip: scSt.dip, top: scSt.top, fmt: scSt.dfmt}) : scView === "counter" ? scCounterPanel(F, {pick: scSt.pick, evan: evanHere(), server: isHere("sofia")}) : scView === "menu" ? scMenuPanel(F)
    : scView === "fridge" ? fridgePanel(F, orchState(F)) : scView === "bench" ? benchPanel(F, scSt) : scView === "batch" ? recipePanel(F) : freezerPanel(F, {swap: scSt.swap});
  else if (goalView) h = goalView === "garagepick" ? garagePanel(F) : goalView === "jetty" ? jettyPanel(scene, evanHere()) : goalPanel(F, goalView);
  else if (fieldView && scene === "field") { const st = stallAt(dayKey(), sgHM(), +fieldView.slice(-1)); h = !st ? "" : st.kind === "wine" ? stallMarketPanel(F, serving()) : st.kind === "orchard" ? shopPanel(F, dayKey(), orTab, true) : st.kind === "scoop" ? scCounterPanel(F, {pick: scSt.pick, evan: evanHere(), cart: true, keeper: isHere("tomo") && !keeperAway(st, dayKey(), sgHM())}) : st.kind === "cocoa" ? ccCounterPanel(F, {cart: true, server: isHere("mateo")}) : marketStallPanel(st); }
  else if (railOpen === "tickets" && scene === "hlane") h = ticketPanel(F, tripPick, tripTown);
  else if (railOpen === "ferry" && scene === "shore") h = ticketPanel(F, tripPick, "jeju", sgHM(), "ferry");   // round 127: the Jeju ferry from the jetty
  else if (railOpen && scene === "hlane") h = timetablePanel(dayKey(), sgHM(), true);
  else if (railOpen && townOf(scene)) h = homePanel(F, townOf(scene), sgHM(), railOpen === "ferry" ? "ferry" : "train");
  else if (kyotoView && townOf(scene) === "kyoto") h = kyotoPanel(F, kyotoView, {...ktSt, evan: inParty(F, "evan") && !evanNight()});
  else if (jejuView && townOf(scene) === "jeju") h = jejuPanel(F, jejuView, {...jjSt, evan: inParty(F, "evan") && !evanNight()});
  else if (cinqueView && townOf(scene) === "cinque") h = cinquePanel(F, cinqueView, {...ctSt, evan: inParty(F, "evan") && !evanNight()});
  else if (rondaView && townOf(scene)) h = rondaPanel(F, rondaView, {flam: flamSt, hm: sgHM(), tea: teaSt, amina: isHere("amina"), paint: paintSt});
  else if (fishSpot && FISH_SPOTS[fishSpot].scene === scene) h = fishPanel(F, fishSpot, fishSt);
  else if (woodsView === "ranger" && scene === "hwoods") h = rangerPanel(F, isHere("wren"));
  else if (woodsView === "bike" && outside()) h = bikePanel(F, F.ride === "car" && owns(F, "car") ? "car" : owns(F, "scooter") && F.ride !== "walk" ? "scooter" : "");
  else if (woodsView && TAXI_STOPS[woodsView] && TAXI_STOPS[woodsView].scene === scene) h = taxiPanel(F, woodsView);
  else if (vanView && scene === "van") h = moodPanel(F, vanSt);
  else if (hfView && scene === "barn") h = hfView === "extractor" ? extractorPanel(F) : hfView === "crock" ? crockPanel(F) : hfView === "press" ? hfPressPanel(F, hfSt) : hfCavePanel(F);
  else if (hfView && scene === "hfarm") h = hfView === "house" ? farmhousePanel(F, isHere("felix")) : hfView === "hives" ? hivesPanel(F, isHere("felix")) : hfView === "stand" ? standPanel(F) : herdPanel(F, hfView, isHere("elena"));
  else if (orView === "pot" && potItem) h = potPanel(F, potItem);
  else if (ccView && COCOA_IN.includes(scene)) h = ccView === "counter" ? ccCounterPanel(F, {server: isHere("amara"), hand: isHere("mateo")}) : ccView === "wall" ? barWallPanel(F) : ccView === "pantry" ? pantryPanel(F, orchState(F)) : ccView === "bonbon" ? bonbonPanel(F, ccSt) : ccView === "case" ? casePanel(F) : ccView === "ups" ? ccUpsPanel(F) : ccKitchenPanel(F, ccView);
  else if (keepItem && F.inv[keepItem]) h = keepPanel(F, keepItem);
  else if (keepSpot) h = placedPanel(F, keepSpot);
  else if (adoptItem && F.inv[adoptItem]) h = adoptPanel(F, adoptItem, adoptSt);
  else if (petView && companions(F).some(c => c.id === petView)) { const c = companions(F).find(c => c.id === petView); h = petPanel(F, c, !!giftPos(c.owner)); }
  else if (orView === "tea" && scene === "cottage") h = teaPanel(F, dayKey(), isHere("mama"));
  else if (orView && (scene === "orchard" || scene === "flowers")) h = orView === "shop" ? shopPanel(F, dayKey(), orTab) : orView === "tours" ? tourBoard(F, dayKey(), sgHM()) : spotPanel(F, orAt.where, orAt.i, dayKey());
  else if (kView && scene === "kitchen") h = kView === "oven" ? ovenPanel(F) : kView === "press" ? pressPanel(F) : kView === "stove" ? stovePanel(F, dayKey()) : larderPanel(F);
  else if (loftView && scene === "vineyard") h = loftPanel(F);
  else if (vyView && (scene === "vineyard" || scene === "wineshop")) h = vyView === "olive" ? olivePanel(F) : vyView === "grove" ? grovePanel(F) : vyView === "vine" ? vinePanel(F, vyAt.r, vyAt.i) : vyView === "stall" ? stallPanel(F) : vyView === "barrels" ? barrelPanel(F)
    : vyView === "shelf" ? shelfPanel(F) : vyView === "menu" ? menuPanel(F, dayKey()) : vyView === "counter" ? counterPanel(F, serving(), whereIs("celeste") === "wineshop") : vyView === "box" ? boxPanel(F) : cafePanel(F, NPCS.filter(n => n.id !== "celeste" && isHere(n.id)).map(n => n.name), dayKey());
  else if (kudosOpen && scene === "trophy") h = kudosPanel();
  else if (trophyView && scene === "trophy") h = trophyView === "book" ? bookPanel(F, onPedestals(F).length < PEDESTALS) : trophyView === "affirm" ? affirmPanel(F.affirm, affirmBusy, !!sampleCap) : trophyView === "fountain" ? fountainPanel(!!sampleCap) : pedestalPanel(onPedestals(F)[+trophyView.slice(3)], nextUp(trophyCtx()), true);
  else if (routOpen && scene === "room") h = routinesPanel();
  else if (lettersOpen && (scene === "room" || scene === "base")) h = lettersPanel(!!sampleCap);
  else if (postOpen && scene === "post") h = postPanel();
  else if (healthOpen && APP_IDS.includes(scene)) h = healthOpen === "reactions" ? reactionsPanel() : healthOpen === "hellos" ? helloPanel() : healthPanel(scene);
  else if (newsOpen && scene === "village") h = goodNewsHTML(myWins(), villageCalendar());
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
      // greenhouse packets (herbs, and out-of-season seeds) once the greenhouse is built; a seed's greenhouse twin only while the ordinary one is out of season
      const inSeasonNow = id => !ITEMS[id].seasons || ITEMS[id].seasons.includes(season);
      h += Object.keys(ITEMS).filter(id => ITEMS[id].tab === shopTab && inSeasonNow(id) && (!ITEMS[id].needs || owns(F, ITEMS[id].needs)) && (!ITEMS[id].visited || ((F.towns || {})[ITEMS[id].visited])) && (!ITEMS[id].ghOf || !inSeasonNow(ITEMS[id].ghOf))).map(id => {
        const it = ITEMS[id], locked = it.need && S.earned < it.need, owned = it.kind === "keep" ? F.fam.owned[id] : it.kind === "tool" && F.inv[id];
        const extra = it.kind === "seed" ? ` · ${dur(CROPS[it.crop].dur)} · ${CROPS[it.crop].yield || 1} a harvest` : it.to ? ` · for ${giftNames(it.to)}` : "";
        if (it.kind === "pet") { const full = roomLeft(F) <= 0; return itemBtn(id, full ? "the run is full" : `<b>${it.price}</b> ${icon("coin", 13)}`, full || F.coins < it.price); }
        return itemBtn(id, locked ? `earn ${it.need} today` : owned ? (it.kind === "keep" ? "at home" : "owned") : `<b>${it.price}</b> ${icon("coin", 13)}${extra}`, locked || owned || F.coins < it.price, F.inv[id] && !owned ? `<span class="cnt">×${F.inv[id]}</span>` : "");
      }).join("");
      if (shopTab === "animals") h += `<p class="muted" style="grid-column:1/-1">Chicks, bunnies and goats go straight to the run at home (${F.pets.animals.length} of ${["2", "4", "6", "8"][F.pets.run]} there now). Each eats once a day (grown hens come for breakfast, lunch and dinner, with an egg each time): a bag of feed is one meal, and bunnies love a garden carrot too. Upgrade the run from the run itself.</p>`;
      if (shopTab === "deli") h += `<p class="muted" style="grid-column:1/-1">For the wine shop's kitchen: flour bakes into loaves in the oven, cheese and olives go on boards and in tapas. They go in your backpack: send them to the kitchen from there.</p>`;
      if (shopTab === "family") h += `<p class="muted" style="grid-column:1/-1">Little treats go in your backpack: give them in person from there. Keepsakes go straight home and stay forever.</p>`;
    }
    h += `</div>`;
  } else if (scene === "greenhouse" && ghBed != null) { h = bedPanel(F, ghBed);
  } else if (scene === "mill" && millOpen) { h = millOpen === "story" ? millStory(F) : millPanel(F);
  } else if (friView && scene === "field" && (/^bm\d$/.test(friView) || friView === "kites")) { h = bayMarketPanel(friView);
  } else if (friView && (scene === "bay" || scene === "field" || scene === "base")) { const fam = ["dad", "mum", "gonggong", "mama", "marcus", "angelina", "darren"].filter(isHere).map(n => NPCS.find(d => d.id === n).name);
    h = friView === "van" ? vanPanel(F) : bonfirePanel(F, fam.length ? `${fam.join(", ").replace(/, ([^,]*)$/, " and $1")} ${fam.length > 1 ? "are" : "is"} round the fire` : "");
  } else if (scene === "farm" && selPlot != null) {
    const p = F.plots[selPlot], i = selPlot;
    h = `<span class="tape stripe" aria-hidden="true"></span><h2>Plot ${i + 1}</h2>`;
    if (!p || !p.crop) {
      const seeds = Object.keys(F.inv).filter(id => ITEMS[id] && ITEMS[id].kind === "seed" && !ITEMS[id].greenhouse);   // greenhouse packets only grow under glass
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
      ? `<p class="sub">${S.sleep.until ? `Napping. Up in about ${Math.max(1, Math.ceil((S.sleep.until - Date.now())/M))} min.` : `Fast asleep${darrenAsleep() ? ", Darren snoring softly beside you" : ""}. Sweet dreams.`}</p><div class="actions"><button class="btn yes" data-bed="up">Get up</button></div>`
      : `<p class="sub">Fluffy pillows, cool sheets${(F.decor || {}).r_throw ? ", your knitted throw" : ""}.${darrenAsleep() ? " Darren's already fast asleep on his side. Tiptoe in." : ""}</p><div class="actions"><button class="btn primary" data-bed="nap">Nap for 20 minutes</button><button class="btn alt" data-bed="sleep">${sgHM() >= 20*60 || sgHM() < 5*60 ? "Go to sleep" : "Lie down"}</button></div>`);
  } else if (jarsOpen && scene === "room") {
    h = jarsPanel(jv);
  } else if (recOpen && scene === "room") {
    const on = sound.music, ct = currentTrack();
    h = `<span class="tape gingham" aria-hidden="true"></span><h2>Record player</h2><p class="sub">${on ? `Playing: ${esc(TRACKS[ct].name)}.` : "Pick a record to put on."}</p>
      <div class="records">${Object.entries(TRACKS).filter(([, t]) => !t.live).map(([id, t]) => `<button class="record${on && id === ct ? " on" : ""}" data-track="${id}"><svg viewBox="0 0 40 40" width="46" height="46" aria-hidden="true"><circle cx="20" cy="20" r="18" fill="#2F2B28"/><circle cx="20" cy="20" r="13" fill="none" stroke="#4A4540" stroke-width=".8"/><circle cx="20" cy="20" r="9" fill="none" stroke="#4A4540" stroke-width=".8"/><circle cx="20" cy="20" r="6.5" style="fill:${t.col}"/><circle cx="20" cy="20" r="1.4" fill="#FFFDF6"/></svg><span class="n">${esc(t.name)}</span><span class="c">${on && id === ct ? "playing now" : esc(t.mood)}</span></button>`).join("")}</div>
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
    h = wardrobePanel(F, {sample: !!sampleCap, busy: ward.busy, error: ward.error, ask: ward.ask, pick: ward.pick});
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
        return `<li class="${dn ? "done" : ""}${t.id === cur ? " cur" : ""}"${!dn && t.id !== cur && phase() !== "clean" ? ` data-next="${esc(t.id)}" role="button"` : ""}><span><b>${esc(t.title)}</b><small>${outside() ? icon(placeOf(t), 16) + " " + esc(placeInfo(placeOf(t)).name) + " · " : ""}${esc(sp.name)}</small></span>${!dn && t.id !== cur && phase() !== "clean" ? `<button class="next" data-next="${esc(t.id)}">do next</button>` : "<span></span>"}</li>`; }).join("")}</ul>`
        : `<p class="sub">No quests ${outside() ? "today yet" : "in here today"}.</p>`}
      <div class="actions"><button class="btn alt small" data-close="1">Close board</button></div>`;
  }
  c.innerHTML = h;
  if (kid.open && scene === "kidroom") wireKid(c, kid.open, {eat: id => { kid.open = null; ctx(); kidEat(id); }, close: () => { kid.open = null; stopKidGame(); ctx(); }});
  if (homeView && (scene === "home" || scene === "garage")) wireHestia(c, homeView);
  if (deskOpen && scene === "office") wireDesk(c, () => ctx());
  if (reviewOpen && scene === "hall") wireReview(c, F, {save: () => save(), rerender: () => ctx(), say: l => speak(l, 5000, true), sfx, canSend: !rvw.noMcp, today: dayKey(), coins: n => { F.coins += n; S.earned = (S.earned || 0) + n; flash(`+${n} coins: weekly review`); }});
  if (kView && scene === "kitchen") wireKitchen(c, F, {save: () => save(true), rerender: () => { ctx(); drawScene(); }, say: l => speak(l, 4500), sfx, today: dayKey()});
  c.querySelectorAll("[data-goal]").forEach(b => b.onclick = () => { const line = buyGoal(F, b.dataset.goal); if (!line) return; sfx("chaching"); act("cheer"); flash(`${GOALS[b.dataset.goal].n}: yours!`); gainXp(5);
    [0, 300, 600].forEach((d, k) => setTimeout(() => mprop("sparkle", mel.x + (k - 1)*24, mel.y - 60, 1800), d)); speak(line, 7000); if (b.dataset.goal === "scooter" || b.dataset.goal === "car") goalView = "garagepick"; else goalView = null; save(true); drawScene(); ctx(); });
  if (scView || (fieldView === "mstall8" && scene === "field")) wireScoop(c);
  wireCompanions(c);
  if (ccView || (fieldView === "mstall9" && scene === "field")) wireCocoa(c);
  if (hfView && (scene === "hfarm" || scene === "barn")) wireFarm(c);
  if (vanView && scene === "van") c.querySelectorAll("[data-van]").forEach(b => b.onclick = () => { const a = b.dataset.van, k = b.dataset.k;
    if (a === "slot") vanSt.slot = k;
    else if (a === "pick") { const n = vanPick(F, k, b.dataset.s); if (!n) return; sfx("chime"); gainXp(1); flash(`${n}, in the van`); }
    else if (a === "clear") { if (!vanClear(F, k)) return; sfx("tap"); }
    save(); ctx(); drawScene(); });
  c.querySelectorAll("[data-bike]").forEach(b => b.onclick = () => { const line = b.dataset.bike === "hire" ? hireBike(F) : returnBike(F); if (!line) return; sfx(b.dataset.bike === "hire" ? "chaching" : "tap"); speak(line, 4000); save(true); ctx(); });
  c.querySelectorAll("[data-taxi]").forEach(b => b.onclick = () => rideTaxi(b.dataset.taxi));
  c.querySelectorAll("[data-salvan]").forEach(b => b.onclick = () => { const id = b.dataset.salvan;
    if (id === "sellall") { const g = sellCatch(F, null, VAN_MULT); if (!g) return; sfx("chaching"); speak(`Sal weighs it all up: ${g.coins} coins for ${g.n}. "Good fish, that."`, 4000); }
    else { const l = vanBuy(F, id, addInv); if (!l) return; sfx("chaching"); speak(l, 3000); }
    save(); ctx(); });
  c.querySelectorAll("[data-fire]").forEach(b => b.onclick = () => {
    if (b.dataset.fire === "lanterns") { const n = releaseLanterns(F); if (n == null) return; friView = null; ctx(); lanternFlight(Math.max(1, n)); gainXp(Math.min(5, 1 + Math.floor(n/3))); sfx("chime");
      speak(n ? `${n} paper lantern${n > 1 ? "s" : ""}, one for each quest this week, lifting off over the house. Look at that.` : "One lantern, for getting through the week. It drifts up over the roof.", 7000);
      if (evanHere()) setTimeout(() => evanSays(pick(["lanterns! so many!", "bye bye lanterns!", "up up up!"])), 1800);
      ["mum", "dad", "mama"].filter(isHere).slice(0, 1).forEach(id => setTimeout(() => npcSay(id, pick(["Look at all of them! You worked hard this week.", "So pretty. Well done, my girl.", "Every one of those is something you did."])), 3600));
      save(); return; }
    if (b.dataset.fire === "grill") { const n = grillFish(F); if (!n) return; friView = null; ctx(); gainXp(2); hearts(3); sfx("chime");
      speak(`${n} fish on the grill, a squeeze of lemon, and everyone eating with their fingers. Perfect.`, 6000);
      if (evanHere() && !evanNight()) setTimeout(() => evanSays(pick(["fishy! yum!", "more please!", "I ate the crispy bit!"])), 1800);
      const who = ["gonggong", "dad", "mum", "mama"].filter(isHere)[0]; if (who) setTimeout(() => npcSay(who, pick(["Ah, that's the smell of a Friday.", "Grilled just right. Who taught you that?", "Best sardines this side of the sea!"])), 3600);
      save(); return; }
    mel.sitting = true; nodes.mel.classList.add("sit"); friView = null; ctx(); sfx("paper", true); speak(pick(["The fire pops and crackles. Nobody needs to say anything.", "Warm on your face, cool on your back. Friday.", "Sparks going up into the dark. The week's done."]), 4500); });
  c.querySelectorAll("[data-mill]").forEach(b => b.onclick = () => { const l = b.dataset.mill === "press" ? startPress(F, +b.dataset.n) : collectOil(F, addInv);
    if (l) { sfx(b.dataset.mill === "press" ? "crunch" : "chime"); if (b.dataset.mill !== "press") { gainXp(1); act("cheer"); } speak(l, 4500); save(true); } ctx(); });
  c.querySelectorAll("[data-gh]").forEach(b => b.onclick = () => { const i = +b.dataset.i;
    if (b.dataset.gh === "plant") { const l = ghPlant(F, i, b.dataset.id, addInv); if (l) { sfx("pop"); speak(l, 3500); F.gift = false; } }
    else { const r = ghHarvest(F, i, addInv); if (r) { gainXp(1); act("cheer"); sfx("chime"); speak(r.line, 4000); const p = GH_BED_AT[i]; mprop(r.crop, p.x + 50, p.y + 20, 1900); ghBed = null; } }
    save(true); ctx(); });
  c.querySelectorAll("[data-tickets]").forEach(b => b.onclick = () => { railOpen = "tickets"; sfx("paper", true); ctx(); });
  c.querySelectorAll("[data-ttown]").forEach(b => b.onclick = () => { tripTown = b.dataset.ttown; sfx("tap"); ctx(); });
  c.querySelectorAll("[data-tpick]").forEach(b => b.onclick = () => { const id = b.dataset.tpick; tripPick = tripPick.includes(id) ? tripPick.filter(x => x !== id) : [...tripPick, id]; sfx("tap"); ctx(); });
  c.querySelectorAll("[data-trip]").forEach(b => b.onclick = () => startTrip(b.dataset.trip, b.dataset.by || "train"));
  c.querySelectorAll("[data-triphome]").forEach(b => b.onclick = () => tripHome(false, b.dataset.triphome === "ferry" ? "ferry" : "train"));
  c.querySelectorAll("[data-rbuy]").forEach(b => b.onclick = () => { const id = b.dataset.rbuy;
    if (id === "vines") { if (!buyVines(F)) return; sfx("chaching"); flash("Three Tempranillo cuttings"); speak("Rafael wraps three cuttings in damp newspaper. \"Plant them in the sun. Talk to them. They're from my grandfather's vines.\" Plant them on a trellis at home.", 7000); }
    else { const g = buyGood(F, id, addInv); if (!g) return; sfx("chaching"); flash(g.n);
      if (g.shop === "cuero" && id !== "llavero") speak("Antonio takes a little brass stamp and presses an M into the corner. \"For free. So everyone knows it's yours.\"", 5000);
      else if (g.shop === "postales" && id === "postal") speak("Doña Carmen stamps it for you, and points: \"The postbox is by the fountain.\"", 4000); }
    save(); ctx(); });
  c.querySelectorAll("[data-rcafe]").forEach(b => b.onclick = () => { if (!cafeTreat(F, b.dataset.rcafe)) return; rondaView = null; ctx(); sfx("chime"); gainXp(1); hearts(2);
    mel.sitting = true; nodes.mel.classList.add("sit"); if (b.dataset.rcafe === "choc") speak(pick(["Dip, bite, dip again. The chocolate's so thick the churro stands up in it.", "Hot churros, crisp and sugary, and a cup of chocolate you could stand a spoon in. Heaven."]), 6000); else speak(pick(["Café con leche in a glass, a churro to dip, and the fan ticking round overhead. Bliss.", "Doña Carmen sets it down: \"Eat, eat. You're too thin.\" The churro's still hot.", "Coffee, sugar, the plaza going by outside the window. Nobody's in a rush."]), 6000);
    if (inParty(F, "evan") && !evanNight()) setTimeout(() => evanSays(pick(["churro! mine!", "sugar on my nose!", "more churro please"])), 1800); save(); });
  c.querySelectorAll("[data-kt]").forEach(b => b.onclick = () => { const [a, v] = b.dataset.kt.split(":"), evanOn = inParty(F, "evan") && !evanNight(), ev = (l, d = 1600) => { if (evanOn) setTimeout(() => evanSays(pick(l)), d); };
    if (a === "yukata") { const n = rentYukata(F, v); if (!n) return; sfx("chaching"); flash("A yukata for the day"); speak(`You change into the ${n.toLowerCase()}, an obi tied at the back, wooden sandals clacking.${evanOn ? " Evan's in a little indigo jinbei and won't stop twirling." : ""}`, 6000); ev(["look at me, Mama!", "I'm a samurai!", "twirl twirl!"], 2200); save(); dressMel(); }
    else if (a === "tea") { if (F.coins < TEA.price) return; F.coins -= TEA.price; ktSt = {tea: whiskStart()}; sfx("paper", true); save(); }
    else if (a === "teaagain") { ktSt = {}; }
    else if (a === "whisk") { if (!ktSt.tea) return; const ok = whisk(ktSt.tea); sfx(ok ? "tap" : "paper", true); }
    else if (a === "bow") { if (!ktSt.tea || !ktSt.tea.done) return; ktSt.tea.bowed = true; const k = kyotoState(F); k.teas = (k.teas || 0) + 1; gainXp(froth(ktSt.tea) ? 2 : 1); hearts(froth(ktSt.tea) ? 3 : 1); sfx("chime");
      speak(froth(ktSt.tea) ? "You turn the bowl twice and bow. Sachiko bows back, very low. That's the best thing that's happened all week." : "You turn the bowl twice and bow. Sachiko bows back and smiles.", 5500); ev(["I bowed too!", "sweetie for me?", "bow bow!"]); save(); }
    else if (a === "sit") { ktSt = {sit: sitStart()}; sfx("paper", true); [0, 1, 2, 3, 4, 5, 6].forEach(i => setTimeout(() => { if (kyotoView === "kt_hall" && ktSt.sit && !ktSt.sit.done) ctx(); }, 1600 + i*4000)); }
    else if (a === "in" || a === "out") { if (!ktSt.sit) return; const r = breathe(ktSt.sit, a); if (!r) return; sfx(r === "ok" ? "tap" : "paper", true);
      if (ktSt.sit.done) { const k = kyotoState(F); k.sits = (k.sits || 0) + 1; gainXp(calm(ktSt.sit) ? 2 : 1); sfx("chime"); mel.sitting = true; nodes.mel.classList.add("sit"); ev(["BONG!", "can I ring it? can I?", "shhh, Mama's being quiet"], 2000); save(); } }
    else if (a === "donate") { if (F.coins < 2) return; F.coins -= 2; sfx("coin"); speak("The coin drops into the wooden box. Jōshin bows, smiling.", 3500); save(); }
    else if (a === "fortune") { const f = drawFortune(F); if (!f) return; ktSt = {fortune: f}; sfx("paper", true); speak(f[0] === "Bad luck" ? "Bad luck! You tie the slip to the rack and leave it there. Already feeling better." : `${f[0]}! ${f[1]}`, 5000); save(); }
    else if (a === "shape") { ktSt = {neri: {shape: v, step: 0}}; sfx("tap"); }
    else if (a === "step") { const n = ktSt.neri; if (!n) return; if (+v === n.step) { n.step++; n.oops = false; sfx("tap"); } else { n.oops = true; sfx("paper", true); } }
    else if (a === "nerireset") { ktSt = {}; }
    else if (a === "neri") { const n = ktSt.neri; if (!n || !makeNerikiri(F, n.shape, addInv)) return; ktSt = {}; sfx("chime"); gainXp(1); flash(`Nerikiri: ${NERI.shapes[n.shape][0].replace(/^A /, "").toLowerCase()}`);
      speak(`${NERI.shapes[n.shape][0]}, in a little box with a paper ribbon. "Very good," says Mr Tanaka. "My father would say: too good for a beginner." A gift for someone at home.`, 6500); ev(["can I eat it? please?", "I made one too!", "pink! pretty!"]); save(); }
    else if (a === "wheel") { if (F.coins < 10) return; ktSt = {cup: {t0: Date.now(), good: 0, tries: 0}}; sfx("paper", true); }
    else if (a === "centre") { const c = ktSt.cup; if (!c || c.good >= 3) return; sfx(ktCentre(c) ? "tap" : "paper", true); }
    else if (a === "glaze") { const c = ktSt.cup; if (!c || c.good < 3) return; const dadToo = inParty(F, "dad"); if (!throwCup(F, dadToo, addInv)) return; ktSt = {}; sfx("chime"); gainXp(1); flash("Your Kyoto teacup");
      speak(`Ishida dips it in ${v === "indigo" ? "deep indigo" : v === "celadon" ? "pale celadon" : "warm amber"} glaze and fires it. A little wonky. Perfect. It's a keepsake for a shelf at home.${dadToo ? " Dad's comes out too, leaning badly. He's thrilled." : ""}`, 6500);
      if (dadToo && isHere("dad")) setTimeout(() => npcSay("dad", "Expressive. That's the word. It's expressive."), 2400); save(); }
    ctx(); });
  // Cinque Terre (rounds 132–133): pesto, the harvest, the boats, gelato, focaccia, the tasting
  c.querySelectorAll("[data-ct]").forEach(b => b.onclick = () => { const [a, v] = b.dataset.ct.split(":"), evanOn = inParty(F, "evan") && !evanNight(), ev = (l, d = 1600) => { if (evanOn) setTimeout(() => evanSays(pick(l)), d); };
    if (a === "pesto") { ctSt = {pesto: pestoStart()}; sfx("paper", true); ev(["bash bash bash!", "it smells green, Mama!", "my pesto!"], 1200); }
    else if (a === "padd") { const r = pestoAdd(ctSt.pesto, +v); sfx(r === "ok" ? "tap" : "paper", true); }
    else if (a === "pound") { if (pestoPound(ctSt.pesto)) sfx("tap"); }
    else if (a === "pestodone") { if (!ctSt.pesto || !pestoDone(ctSt.pesto) || !finishPesto(F, addInv)) return; ctSt = {}; sfx("chime"); gainXp(2); hearts(2); flash("Two jars of pesto"); speak("Two jars of your own pesto. Nonna Pina leans in: \"The secret? Ligurian basil, young leaves, and patience.\" Now you can make it at home too, in the loft over the barrels.", 7000); save(); }
    else if (a === "ride" || a === "monorail") { cinqueView = "monorail"; ctSt = a === "ride" ? {harvest: harvestStart()} : {}; sfx("paper", true); if (a === "ride") ev(["choo choo! up up up!", "SO high, Mama!", "grapes! everywhere!"], 1400); }
    else if (a === "arrive") { if (ctSt.harvest) ctSt.harvest.riding = false; sfx("tap"); }
    else if (a === "pick") { const r = ctPick(ctSt.harvest, +v); if (!r) return; sfx(r === "ok" ? "tap" : "paper", true); }
    else if (a === "harvestdone") { if (!ctSt.harvest || !harvestDone(ctSt.harvest)) return; const n = finishHarvest(F, addInv); ctSt = {}; sfx("chime"); gainXp(2); act("cheer"); if (n) flash(`${n} bunches of white grapes`); speak(`Signor Bruno shakes your hand. "Next year you come back." ${n ? "He gives you three bunches to start your own racks. " : ""}Up the ladder in your barrel shed at home, the drying loft is ready for raisin wine.`, 7000); save(); }
    else if (a === "hull" || a === "stripe" || a === "bname") { ctSt.boat = {...(ctSt.boat || {}), [a === "bname" ? "name" : a]: v}; sfx("tap"); }
    else if (a === "paint") { const st = ctSt.boat || {}; const bt = paintBoat(F, st.hull, st.stripe, st.name, addInv); if (!bt) return; ctSt = {boat: {}}; sfx("chime"); gainXp(2); hearts(2); flash("Your painted boat");
      speak(`Fresh paint, gleaming: "${st.name}" along the bow${evanOn ? ", in Evan's wobbly letters" : ""}. Aldo gives you a little carved model of her to keep, and says he'll see one just like her at your jetty. Fishermen talk.`, 7000); ev(["I painted the E!", "my boat! MY boat!", "it says EVAN, Mama"], 1800); drawScene(); save(); }
    else if (a === "gelato" || a === "focaccia") { const t = ctTreat(F, a === "gelato" ? GELATO : FOCACCIA, v); if (!t) return; sfx("slurp"); gainXp(1); hearts(2); speak(`${t[0]}. ${t[2]}`, 5500); ev(a === "gelato" ? ["green ice cream!", "lick lick", "can I have the lemon one too?"] : ["crunchy bread!", "more please!", "yummy"]); save(); }
    else if (a === "taste") { if (F.coins < TASTE.price) return; F.coins -= TASTE.price; sfx("chime"); gainXp(1); speak("The white tastes of salt and sunshine. Then the Sciacchetrà: amber, honey, apricots, a long sweet finish. Signor Bruno watches your face and nods.", 6500); save(); }
    ctx(); });
  // the drying loft (round 132): up the ladder from the barrels; start a batch, collect a finished one
  c.querySelectorAll("[data-loft]").forEach(b => b.onclick = () => { vyView = null; loftView = true; sfx("paper", true); render(); });
  c.querySelectorAll("[data-lf]").forEach(b => b.onclick = () => { const [a, k] = b.dataset.lf.split(":");
    if (a === "start") { if (!startBatch(F, k)) return; sfx(k === "pesto" ? "tap" : "paper", true); gainXp(1);
      speak({rack: "Six bunches laid out on the cane racks in the warm air. In three days they'll be raisins.", lemon: "Lemon peel into the bottle. Five days, and it'll be limoncino.", salt: "Layer of salt, layer of anchovies, layer of salt. Lid on. Four days.", pesto: "Pound, pound, pound: garlic, pine nuts, basil, cheese, a stream of your own olive oil. Two jars of bright green pesto."}[k], 5000); save(); }
    else if (a === "collect") { const r = loftCollect(F, k); if (!r) return; sfx("chime"); gainXp(2); act("cheer");
      if (r.cask) speak("The grapes have shrivelled into sweet little raisins. Pressed, and into the cask for four days.", 5000); else { flash(`${r.n} × ${ITEMS[r.id].n.toLowerCase()}`); speak(r.id === "w_raisin" ? "Three bottles of amber raisin wine, sticky and sweet. A week of waiting, and worth every day." : `${ITEMS[r.id].n}, ready. Into the backpack.`, 5000); } save(); }
    ctx(); });
  // Jeju (rounds 128–129): the breath song, the sorting, the café, the porridge, the slow post, the dye
  c.querySelectorAll("[data-jj]").forEach(b => b.onclick = () => { const [a, v] = b.dataset.jj.split(":"), evanOn = inParty(F, "evan") && !evanNight(), ev = (l, d = 1600) => { if (evanOn) setTimeout(() => evanSays(pick(l)), d); };
    if (a === "dive" || a === "again") { jjSt = {dive: diveStart()}; sfx("paper", true); }
    else if (a === "down") { const d = jjSt.dive; if (!d || !descend(d)) return; sfx("tap"); }
    else if (a === "up") { const d = jjSt.dive; if (!d) return; const r = surface(d); sfx(r === "ok" ? "chime" : "paper", true); if (r === "ok") ev(["fweee!", "FWEEEEE!", "I whistled too, Mama!"], 600);
      if (d.done) { const got = diveReward(F, d, addInv); gainXp(d.good >= 2 ? 2 : 1); if (got) { flash("Abalone from Halmang Kim"); hearts(3); } save(); } }
    else if (a === "juk") { if (F.coins < JUK) return; F.coins -= JUK; const j = jejuState(F); j.juk = (j.juk || 0) + 1; sfx("slurp"); gainXp(1); hearts(2); speak("A bowl of abalone porridge: green, silky, a swirl of sesame oil. The divers at the next table nod at you. You're one of them now. Nearly.", 6000); ev(["more please!", "it's GREEN", "yummy porridge"]); save(); }
    else if (a === "sort") { jjSt = {sort: sortStart()}; sfx("paper", true); setTimeout(() => { if (jejuView === "jj_shed" && jjSt.sort && !jjSt.sort.done) { jjSt.sort.done = true; jjSt.sort.late = true; ctx(); } }, 30500); }
    else if (a === "crate") { const st = jjSt.sort; if (!st) return; const r = sortTap(st, v); sfx(r === "ok" ? "tap" : "paper", true);
      if (st.done) { const n = sortReward(F, st, addInv); gainXp(st.good >= 6 ? 2 : 1); if (n) { flash(`${n} tangerines from Mr Ko`); hearts(2); } ev(["I sorted the BIG one!", "can I eat this one?", "orange orange orange!"]); save(); } }
    else if (a === "cafe") { const c = jjCafe(F, v); if (!c) return; sfx("slurp"); gainXp(1); hearts(2); speak(`${c[0]}. ${c[2]}`, 5500); ev(["juice! with a straw!", "orange juice! for me!", "slurrrp"]); save(); }
    else if (a === "post") { const at = slowPost(F, v); if (!at) return; sfx("paper", true); flash("Into the slow-post box"); speak(v === "family" ? "A postcard to the family, into the orange box. It'll turn up in Honeybrook in two weeks, when everyone's forgotten about it. Perfect." : "A postcard to yourself, into the orange box. In two weeks, a little bit of Jeju will arrive in your mailbox.", 5500); save(); }
    else if (a === "dyego") { jjSt = {dye: {step: 0}}; sfx("paper", true); ev(["squish! squish!", "it's sticky, Mama", "green and squishy!"], 1200); }
    else if (a === "dstep") { const d = jjSt.dye; if (!d) return; if (+v === d.step) { d.step++; d.oops = false; sfx("tap"); } else { d.oops = true; sfx("paper", true); } }
    else if (a === "dyedone") { if (!dyeScarf(F)) return; jjSt = {}; sfx("chime"); gainXp(1); flash("A scarf to dry at home"); speak("Mr Moon rolls the damp scarf in paper. \"Hang it in the sun. Look at it every day.\" It'll be on your washing line when you're home.", 6000); save(); }
    ctx(); });
  c.querySelectorAll("[data-rflam]").forEach(b => b.onclick = () => {
    if (b.dataset.rflam === "start") { flamSt = palmasStart(); clearTimeout(flamT); sfx("tap"); if (inParty(F, "evan") && !evanNight()) setTimeout(() => evanSays(pick(["clap clap CLAP!", "I'm clapping, Mama!", "olé! olé!"])), 2400);
      flamT = setTimeout(() => { flamSt.done = true; const won = ole(flamSt); const r = rondaState(F); if (won) { r.oles = (r.oles || 0) + 1; gainXp(2); hearts(3); sfx("yay"); act("cheer"); go(scene, 430, 540, () => { act("cheer"); mprop("sparkle", mel.x, mel.y - 60, 1600); });
          speak("Paloma takes your hands and spins you round the stage. The whole bar shouts ¡Olé!", 6000); if (isHere("mum")) setTimeout(() => npcSay("mum", "THAT'S my girl! Olé!"), 2000); } else sfx("chime");
        if (inParty(F, "evan") && !evanNight()) setTimeout(() => evanSays(won ? "Mama DANCED!" : "again! again!"), 1600); save(); ctx(); }, palmasEnd(flamSt) - Date.now() + 300);
      ctx(); return; }
    if (!flamSt || flamSt.done) return; const r = clap(flamSt); if (r === "hit") sfx("tap"); else if (r === "miss") sfx("paper", true); ctx(); });
  c.querySelectorAll("[data-rtea]").forEach(b => b.onclick = () => {
    if (b.dataset.rtea === "start") { teaSt = {t0: Date.now(), glasses: []}; sfx("paper", true); ctx(); return; }
    if (!teaSt || teaSt.glasses.length >= TEA_GLASSES) return; const ok = pour(teaSt); sfx(ok ? "chime" : "tap");
    if (teaSt.glasses.length >= TEA_GLASSES) { const good = teaSt.glasses.filter(Boolean).length, r = rondaState(F); if (r.teaDay !== dayKey()) { r.teaDay = dayKey(); gainXp(good >= 2 ? 2 : 1); }
      if (good >= 2) hearts(2); speak(good >= 2 ? "Sweet, minty, frothy on top. Amina raises her glass: \"To Ronda.\"" : "A bit flat, but still lovely. Amina says the froth comes with practice.", 5000);
      if (inParty(F, "evan") && !evanNight()) setTimeout(() => { evanSays(pick(["sugar cube! for me?", "crunch crunch", "Amina gave me sugar!"])); }, 1600); save(); }
    ctx(); });
  c.querySelectorAll("[data-rpaint]").forEach(b => b.onclick = () => { const [k, v] = b.dataset.rpaint.split(":");
    if (k === "c" || k === "p") paintSt = {...paintSt, [k]: v, step: 0, oops: false};
    else if (k === "s") { const want = (paintSt.step || 0) + 1; if (+v === want) { paintSt = {...paintSt, step: want, oops: false}; sfx("tap"); } else { paintSt = {...paintSt, oops: true}; sfx("paper", true); } }
    else if (k === "reset") paintSt = {};
    else if (k === "fire") { const evanToo = inParty(F, "evan") && !evanNight(), id = paintTile(F, paintSt.c, paintSt.p, evanToo, addInv); if (!id) return; paintSt = {}; sfx("chime"); gainXp(1); flash("Your painted tile");
      speak(`Lucía slides it into the kiln and brings it out an hour later, glazed and shiny. Yours to keep: put it on a shelf at home.${evanToo ? " Evan's finger-painted one comes out too, mostly thumbprints." : ""}`, 7000);
      if (evanToo) setTimeout(() => evanSays(pick(["I PAINTED it!", "blue! my blue!", "for my room!"])), 1800); save(); }
    ctx(); });
  c.querySelectorAll("[data-rtaste]").forEach(b => b.onclick = () => { const r = taste(F, b.dataset.rtaste); if (!r) return; sfx("chime"); act("cheer"); gainXp(r.fresh ? 1 : 0);
    speak(r.line + (r.fresh ? " You've got the recipe now: it's on your stove at home." : ""), 8000); if (inParty(F, "evan") && !evanNight()) setTimeout(() => evanSays(pick(["more!", "yummy!", "Mama, can I try?"])), 1800); save(); ctx(); });
  c.querySelectorAll("[data-rtile]").forEach(b => b.onclick = () => { const r = buyTile(F, b.dataset.rtile); if (!r) return; sfx("chaching"); flash(`Tile: ${r.t.n}`);
    speak(r.all ? "The eighth tile! Lucía claps. \"A bench! Send me a photo.\" Your tiled bench is waiting by the pond at home." : `Lucía wraps the tile in newspaper: ${r.t.n.toLowerCase()}.`, 6000); if (r.all) { gainXp(3); mprop("sparkle", mel.x, mel.y - 60, 1800); } save(); ctx(); });
  c.querySelectorAll("[data-taxiopen]").forEach(b => b.onclick = () => { goalView = null; woodsView = b.dataset.taxiopen; sfx("paper", true); ctx(); });   // the home jetty: the taxi stops there too
  if (fishSpot) c.querySelectorAll("[data-fish]").forEach(b => b.onclick = () => fishGo(b.dataset.fish, b.dataset.k));
  c.querySelectorAll("[data-sup]").forEach(b => b.onclick = () => { goalView = null; ctx(); if (b.dataset.sup === "play") familyPaddle(); else paddleTo(b.dataset.sup); });
  c.querySelectorAll("[data-ride]").forEach(b => b.onclick = () => { F.ride = b.dataset.ride; sfx("paper", true); speak(F.ride === "car" ? "Keys in hand. You'll drive between screens." : F.ride === "scooter" ? "Helmet on. Scooter it is." : "On foot today. Nice and slow.", 3500); save(); ctx(); });
  if (orView || (fieldView && scene === "field" && (stallAt(dayKey(), sgHM(), +fieldView.slice(-1)) || {}).kind === "orchard")) wireOrchard(c, F, {save: () => save(true), rerender: () => { ctx(); drawScene(); }, say: l => speak(l, 4500), sfx, today: dayKey(), where: orAt && orAt.where, i: orAt && orAt.i, item: potItem,
    tab: k => { orTab = k; ctx(); }, placed: () => { orView = null; potItem = null; ctx(); drawScene(); }, tea: haveTea});
  if (vyView && (scene === "vineyard" || scene === "wineshop")) wireVine(c, F, {harvest: (festivalOn(dayKey()) || {}).id === "harvest", save: () => save(true), rerender: () => { ctx(); drawScene(); }, say: l => speak(l, 4500), sfx, r: vyAt && vyAt.r, i: vyAt && vyAt.i});
  if (vaultView && scene === "bank") {
    c.querySelectorAll("[data-vopen]").forEach(el => { const go = () => { bv.slot = +el.dataset.vopen; bv.mode = "jar"; vaultView = "jar"; ctx(); }; el.onclick = go; el.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } }; });
    if (vaultView === "jar") wireVault(c, {rerender: () => { ctx(); drawScene(); }, undoable, sfx, close: () => { vaultView = null; vyView = null; reviewOpen = false; kView = null; orView = null; fieldView = null; goalView = null; ctx(); drawScene(); }, poured: vaultPoured});
  }
  c.querySelectorAll("[data-letters]").forEach(b => b.onclick = () => { journalOpen = false; lettersOpen = true; lv.mode = "home"; sfx("paper", true); ctx(); });
  if (lettersOpen && (scene === "room" || scene === "base")) wireLetters(c, {rerender: () => ctx(), sample: sampleCap, toJournal: t => { const e = addEntry(t, "letter"); if (e) { sfx("chime"); flash("Saved to your journal"); } return !!e; },
    sent: (k, d) => { sfx("paper"); speak(k === "universe" ? "Posted. The universe always writes back. Keep an eye on the letterbox." : `Sealed. It'll arrive in your letterbox on ${new Date(d + "T00:00:00Z").toLocaleDateString("en-GB", {day: "numeric", month: "long", year: "numeric", timeZone: "UTC"})}.`, 5000); }});
  if (routOpen && scene === "room") wireRoutines(c, {rerender: () => ctx(), undoable, done: routineCoins});
  if (trophyView && scene === "trophy") { wireTrophies(c, F, {save: () => save(true), undoable, rerender: () => { ctx(); drawScene(); }, close: () => { trophyView = null; lettersOpen = false; vaultView = null; vyView = null; reviewOpen = false; kView = null; orView = null; fieldView = null; goalView = null; ctx(); drawScene(); }});
    if (trophyView === "fountain") wireFountain(c, {sample: sampleCap, rerender: () => ctx(),
      coin: () => { trophyView = null; lettersOpen = false; vaultView = null; vyView = null; reviewOpen = false; kView = null; orView = null; fieldView = null; goalView = null; ctx(); sfx("coin"); mprop("sparkle", 260 + rnd(-20, 20), 400); speak(pick(["Plink. Wish made. I won't ask.", "A coin in the fountain. Something good's coming.", "Make it a big one."]), 3500); },
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
    else if (scene === "field" && fieldView) { buy(id, stallPrice(id)); ctx(); }   // a market or fair stall
    else if (scene === "field" && friView && (/^bm\d$/.test(friView) || friView === "kites")) { buy(id, friView === "kites" ? ITEMS.kite.price : stallPrice(id)); ctx(); }   // the Friday bay market
    else if (scene === "farm") plant(selPlot, id);
  });
  c.querySelectorAll("[data-farm]").forEach(b => b.onclick = () => b.dataset.farm === "water" ? waterPlot(selPlot) : harvest(selPlot));
  c.querySelectorAll("[data-next]").forEach(b => b.onclick = ev => { ev.stopPropagation(); doNext(b.dataset.next); });
  c.querySelectorAll("[data-fair]").forEach(b => b.onclick = () => fairActivity(b.dataset.fair));
  c.querySelectorAll("[data-close]").forEach(b => b.onclick = () => { ccView = null; hfView = null; railOpen = false; fishSpot = null; woodsView = null; rondaView = null; kyotoView = null; ktSt = {}; jejuView = null; jjSt = {}; loftView = false; cinqueView = null; ctSt = {}; ghBed = null; millOpen = false; friView = null; vanView = null; ccSt.made = null; keepItem = null; keepSpot = null; adoptItem = null; adoptSt = {}; petView = null; scView = null; scSt.pick = null; boardOpen = false; shelfOpen = false; shedOpen = false; runOpen = false; wardOpen = false; bedOpen = false; journalOpen = false; scratchOpen = false; calmOpen = false; recOpen = false; clientsOpen = false; planOpen = false; revOpen = false; jarsOpen = false; deskOpen = false; kudosOpen = false; routOpen = false; trophyView = null; lettersOpen = false; vaultView = null; vyView = null; reviewOpen = false; kView = null; orView = null; fieldView = null; goalView = null; ctx(); });
  c.querySelectorAll("[data-bed]").forEach(b => b.onclick = () => bedAction(b.dataset.bed));
  if (jarsOpen && scene === "room") wireJars(c);
  c.querySelectorAll("[data-track]").forEach(b => b.onclick = () => { setTrack(b.dataset.track); speak(`${TRACKS[b.dataset.track].name} is on. Mmm.`, 2500); ctx(); drawScene(); });
  c.querySelectorAll('[data-rec="stop"]').forEach(b => b.onclick = () => { setMusic(false); speak("Needle up. Quiet time.", 2500); ctx(); drawScene(); });
  const rv = c.querySelector("#recVol"); if (rv) rv.oninput = () => setMusicVol(+rv.value);
  c.querySelectorAll("[data-calm]").forEach(b => b.onclick = () => { const k = b.dataset.calm;
    if (k === "stop") stopBreath(false); else if (k === "decompress") { calmOpen = false; recOpen = false; clientsOpen = false; planOpen = false; revOpen = false; jarsOpen = false; deskOpen = false; kudosOpen = false; routOpen = false; trophyView = null; lettersOpen = false; vaultView = null; vyView = null; reviewOpen = false; kView = null; orView = null; fieldView = null; goalView = null; A.decompNow(); drawScene(); } else startBreath(+k); });
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
  // wearing an outfit: choose one, untick anything you're skipping, put it on (kept for the day: applyWear)
  c.querySelectorAll("[data-wear]").forEach(b => b.onclick = () => { ward.pick = +b.dataset.wear; sfx("paper", true); ctx(); });
  c.querySelectorAll("[data-wearback]").forEach(b => b.onclick = () => { ward.pick = null; ctx(); });
  c.querySelectorAll("[data-acc]").forEach(b => b.onclick = () => { const k = b.dataset.acc, on = !wearing(F, k), n = (ACCESSORIES.find(a => a[0] === k) || [])[2] || "it";
    if (on) F.decor[k] = "on"; else delete F.decor[k]; sfx("paper", true); save(); render(); drawScene();
    speak(on ? `${n} on.${k === "me_hat" ? " It'll go on when you head outside." : k === "me_pj" ? " Cosy." : ""}` : `${n} off. It's back in the wardrobe.`, 3000); });
  c.querySelectorAll("[data-wearoff]").forEach(b => b.onclick = () => { delete F.wear; save(); render(); speak("Back in your usual. Comfy.", 3000); });
  c.querySelectorAll("[data-wearok]").forEach(b => b.onclick = () => { const o = outfitsToday(F)[+b.dataset.wearok]; if (!o) return;
    const w = {day: dayKey(), label: o.label || "Today's outfit"}; c.querySelectorAll("[data-wearf]").forEach(x => { if (x.checked) w[x.dataset.wearf] = o[x.dataset.wearf]; });
    F.wear = w; ward.pick = null; sfx("chime"); act("cheer"); save(); render(); mprop("sparkle", mel.x, mel.y - 60, 1600);
    speak(pick([`${w.label}. You look wonderful.`, "Oh, that works. Ready for the day.", "Very you. Let's go."]), 4000); });
  const of = c.querySelector("#outfitForm");
  if (of) { const inp = c.querySelector("#outfitAsk"); inp.oninput = () => { ward.ask = inp.value; };
    of.onsubmit = async ev => { ev.preventDefault(); if (ward.busy) return; ward.busy = true; ward.error = ""; ctx();
      let o = null; try { const ev = await todaysEvents(dayKey()).catch(() => ({events: []})); o = await newOutfit(F, sampleCap, ward.ask, ev.events || []); } catch {}
      ward.busy = false; if (o) { ward.ask = ""; save(true); speak(`How about this: ${o.label.toLowerCase()}?`, 4000); } else ward.error = "Hmm, nothing came back. Try again?"; ctx(); }; }
  c.querySelectorAll("[data-feed]").forEach(b => b.onclick = () => feedAnimals(b.dataset.feed));
  c.querySelectorAll("[data-runup]").forEach(b => b.onclick = () => buyRunUpgrade());
  c.querySelectorAll("[data-treat]").forEach(b => b.onclick = () => { const line = scatterTreat(F, addInv); if (!line) return; sfx("chime"); gainXp(1); speak(line, 4500); if (scene === "base") mprop("heart", 110, 520, 1700); save(true); ctx(); });
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
    const lbl = it.kind === "bouquet" ? "give or send to someone" : it.kind === "pot" ? "place it" : it.kind === "keepsake" ? "put on a shelf" : it.kind === "pet" ? "find it a home" : it.kind === "seed" ? "plant in garden" : it.kind === "gift" ? `give to ${giftNames(it.to)}` : it.kind === "tool" ? "use" : it.kind === "feed" ? "for the run" : it.kind === "food" ? "feed Maple" : it.kind === "ingredient" ? "send to the kitchen" : it.kind === "flower" ? "give" : "use";
    // kitchen ingredients can go to the wine shop's larder instead (food can still be fed to Maple)
    const kit = isGood(id) && it.kind !== "ingredient" ? `<span class="tokit" role="button" tabindex="0" data-kit="${id}">to the kitchen</span>` : "";
    return itemBtn(id, lbl, it.kind === "seed", (it.kind === "tool" ? "" : `<span class="cnt">×${F.inv[id]}</span>`) + kit); }).join("");
  if (giftPick && F.inv[giftPick]) $("bag").insertAdjacentHTML("afterbegin", giftPickHTML(giftPick)); else giftPick = null;
  if (hasUp(scoopState(F), "bike")) { $("bag").insertAdjacentHTML("beforeend", `<button class="btn small alt" data-deliver="1" style="grid-column:1/-1">Send an ice cream (Scoop Shack delivery)</button>`);
    $("bag").querySelector("[data-deliver]").onclick = () => { openView = null; scView = "deliver"; scSt.vpick = null; scoopNow(); ctx(); }; }
  $("bag").querySelectorAll("[data-giveto]").forEach(b => b.onclick = ev => { ev.stopPropagation(); giveTo(giftPick, b.dataset.giveto); });
  $("bag").querySelectorAll("[data-keepit]").forEach(b => b.onclick = ev => { ev.stopPropagation(); keepItem = giftPick; giftPick = null; openView = null; render(); });   // a souvenir kept: off to the shelf chooser
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
    const gd = spotObj("home", "gdoor"), fr = spotObj("home", "fridge");
    if (c.chores) h += badge(gd.x + 26, gd.y - 120, c.chores, "broom");   // the chores are in the cupboard, in the garage
    if (c.shop) h += badge(fr.x, fr.y - 100, c.shop, "fridge");
  }
  if (scene === "garage" && c.chores) { const cb = spotObj("garage", "cupboard"); h += badge(cb.x, cb.y - 100, c.chores, "broom"); }
  g.innerHTML = h;
}
function questMark(){
  const ph = phase(), m = $("qmarkWrap");
  let target = null;
  if (ph === "clean" && !atClean()) target = {pl:"garage", sp:"cupboard"};
  if (ph === "task") { const t = remaining()[0]; if (!arrivedFor(t)) target = {pl:placeOf(t), sp:spotOf(t)}; }
  let pos = null;
  if (target) {
    // a room off another room (the garage, the home office): outdoors aim for its building; in the parent room, its door
    const inner = INNER[target.pl], bld = inner ? inner.parent : target.pl, DOOR = {garage: "gdoor", office: "officedoor", room: "mydoor", kidroom: "kiddoor", kitchen: "kdoor", cellar: "cdoor"};
    if (inner && scene === bld && DOOR[target.pl]) { const d = spotObj(scene, DOOR[target.pl]); pos = [d.x + (d.x > 260 ? 26 : -26), d.y - 120]; }
    else if (townRoom(scene)) pos = [260, 560];   // inside a room in a town: out the door first
    else if (townOf(scene)) { const T = TOWNS[townOf(scene)], st = T.arrive[0]; pos = scene === st ? VILLAGE[T.station].mark : VILLAGE[BRIDGES[scene][nextHop(scene, st)]].mark; }   // a quest back home: the way to the train
    else if (outside() && bld === "base") pos = scene === "base" ? (() => { const v = VILLAGE[target.sp]; return v.mark || [v.door[0], v.door[1] - 64]; })() : VILLAGE[BRIDGES[scene][nextHop(scene, "base")]].mark;
    else if (outside()) pos = VILLAGE[bld].scene === scene ? VILLAGE[bld].mark : VILLAGE[BRIDGES[scene][nextHop(scene, outdoorOf(bld))]].mark;
    else if (scene === target.pl) { const s = spotObj(scene, target.sp); pos = [s.x, s.y - 70]; }
    else pos = INNER[scene] ? [INNER[scene].exit[0], 330] : [260, 582];
  }
  if (!pos || scene === "kidroom") { m.style.display = "none"; return; }
  m.style.display = ""; m.setAttribute("transform", `translate(${pos[0]} ${pos[1]})`);
}
function drawScene(){
  const ssn = seasonOf(dayKey()); ["spring", "summer", "autumn", "winter"].forEach(k => document.body.classList.toggle("season-" + k, k === ssn));
  const day = dayKey(), wet = outside() && !townOf(scene) && rainyOn(day), fest = festivalOn(day);
  $("rain").hidden = !wet; $("rain").classList.toggle("light", rainLevel(day) === 1);
  if (scene === "vineyard" && fest && fest.id === "harvest" && S.harvestSaid !== day) { S.harvestSaid = day; setTimeout(() => speak("It's the grape harvest! Bunting's up, and every vine gives an extra bunch this week.", 6000), 1500); }
  else if (scene === "village" && fest && !fest.vineyard && S.festSaid !== day) { S.festSaid = day; setTimeout(() => speak(`${fest.name} decorations are up in the town square!`, 5000), 1500); }
  else if (scene === "base" && S.hestiaSaid !== day && hestiaCounts().chores) { S.hestiaSaid = day; const n = hestiaCounts().chores; setTimeout(() => speak(`${n} home chore${n > 1 ? "s" : ""} waiting in the cleaning cupboard. No rush.`, 5000), 2600); }
  else if (scene === "base" && isWeekend() && S.weekendSaid !== day) { S.weekendSaid = day; setTimeout(() => speak("Weekend! Home things happen here at home. Any work quests still wait in town.", 5500), 2200); }
  else if (wet && S.rainSaid !== day) { S.rainSaid = day; const light = rainLevel(day) === 1; setTimeout(() => speak(light ? "A light shower today. Brollies up!" : "Rainy day! Perfect for cosy indoor quests.", 4500), 1500); }
  $("fore").innerHTML = outside() ? "" : foreArt(scene);
  tableKey = "";
  $("sceneArt").innerHTML = scene === "village" ? villageArt() : scene === "base" ? baseArt() : scene === "lane" ? laneArt() : scene === "vineyard" ? vineyardArt() : scene === "orchard" ? orchardArt() : scene === "flowers" ? flowerFarmArt() : scene === "field" ? fieldArt() : scene === "shore" ? shoreArt() : scene === "bay" ? bayArt() : scene === "hfarm" ? hfarmArt() : scene === "hlane" ? hlaneArt() : scene === "hwoods" ? hwoodsArt() : townRoom(scene) ? (townOf(scene) === "kyoto" ? kyotoRoomArt(scene) : townOf(scene) === "jeju" ? jejuRoomArt(scene) : townOf(scene) === "cinque" ? cinqueRoomArt(scene) : rondaRoomArt(scene)) : townOf(scene) === "kyoto" ? kyotoArt(scene) : townOf(scene) === "jeju" ? jejuArt(scene) : townOf(scene) === "cinque" ? cinqueArt(scene) : townOf(scene) ? rondaArt(scene) : scene === "farm" ? farmArt() : scene === "greenhouse" ? greenhouseArt(ghState(F).beds, ghGrowth) : scene === "mill" ? millArt(!!millState(F).press && pressLeft(millState(F)) > 0, !!millState(F).press && !pressLeft(millState(F))) : roomArt(scene);
  $("sceneArt").insertAdjacentHTML("beforeend", keepsakesIn(F, scene) + petsIn(F, scene) + fishSpotArt(scene, scene !== "bay" || spotOpen("bay")) + transportArt(scene) + fridayLayer(scene) + (scene === "base" ? koiArt((F.fish && F.fish.koi) || 0) + (F.ronda && F.ronda.bench ? tileBench(236, 548) : "") + (F.kyoto && F.kyoto.lantern ? homeLantern(492, 588) : "") + (F.jeju && F.jeju.dye ? dyeCloth(dyeDays(F)) : "") + (F.towns && F.towns.cinque ? homeBoat(206, 150, ...boatCols(F)) : "") : "") + (scene === "hwoods" ? wishTower(112, 462, (F.wish || {}).n || 3) : ""));   // shelves with keepsakes, and pets at home here
  if (outside() && scene !== "base" && scene !== "field") $("sceneArt").insertAdjacentHTML("beforeend", skyWash(sgHM()));   // the same evening light everywhere outdoors
  if (outside() && isDusk()) nightLights();
  const names = {village:"Town square", base:"Home base", lane:"Makers' Lane", vineyard:vineyardName(F), farm:"The garden", wineshop:shopName(F), orchard:"Ma Ma's orchard", flowers:"Ma Ma's flower farm", field:"The field", shore:"The foreshore", bay:"The bay", hfarm:"Wildflower Farm", hlane:"Honeybrook station", hwoods:"Honeybrook Woods", greenhouse:"The greenhouse", mill:"The old mill", scoopshop: scoopState(F).name, ct_vernazza:"Cinque Terre: Vernazza", ct_corniglia:"Cinque Terre: Corniglia", ct_monterosso:"Cinque Terre: Monterosso", ct_manarola:"Cinque Terre: Manarola", jj_shore:"Jeju: Seongsan", jj_farms:"Jeju: the tangerine farms", jj_harbour:"Jeju: the harbour", jj_village:"Jeju: the stone village", kt_station:"Kyoto: the station", kt_lane:"Kyoto: Higashiyama", kt_temple:"Kyoto: the temple", kt_river:"Kyoto: the river", rd_station:"Ronda: the station", rd_plaza:"Ronda: the plaza", rd_bridge:"Ronda: Puente Nuevo", rd_old:"Ronda: the old town"};
  $("sceneName").innerHTML = `<span>${esc(names[scene] || (townRoom(scene) ? `${TOWNS[townOf(scene)].n}: ${townRoom(scene).n.replace(/^The /, "the ")}` : ROOMS[scene].name))}</span>${!outside() ? `<span style="font-family:Mulish,sans-serif;font-size:.85rem">tap Exit to leave</span>` : ""}`;
  $("maphint").textContent = townRoom(scene) ? `${townRoom(scene).say} Exit at the bottom, back out the way you came.` : townOf(scene) && TOWNS[townOf(scene)].hints ? TOWNS[townOf(scene)].hints[scene] : townOf(scene) ? {rd_station: "Ronda's station (trains home till 10pm) and the Alameda balcony over the valley. East: the plaza. South: steps down into the gorge.", rd_plaza: "The plaza: the market, the tapas bar, Doña Carmen's sweets. West: the station. South: over Puente Nuevo.", rd_bridge: "Puente Nuevo over the gorge, the viewpoint and the Moorish garden. North: back over the bridge. West: the old town.", rd_old: "La Ciudad: the convent hatch, the tile shop, the Arab baths. North: the gorge steps up to the station. East: the bridge."}[scene] : scene === "shore" ? "Watch for dolphins from the bench, or take the paddleboards out. Gates: the field (east), the flower farm (south)." : scene === "field" ? "Feed the swans, picnic, kick a ball about, or join Mum's class at 8. Paths: town (east), orchard (south), foreshore (west)." : scene === "orchard" ? "Buy saplings at the farm shop (or tap a tree spot). Right gate: home. Left: flowers." : scene === "flowers" ? "Tap a bed or bush to plant, or buy at the farm shop. Right arch: the orchard." : scene === "cottage" ? "Ma Ma's cottage. Tap the table for tea and cake." : scene === "kitchen" ? "Bake bread, press cheese, cook small plates and today's tapas. The mat at the bottom goes back to the shop." : scene === "vineyard" ? "Tap a vine to plant, water or pick. Left gate: home. Top path: Makers' Lane." : scene === "wineshop" ? "Stock the shelves, stand behind the counter to serve, and check the honesty box." : scene === "village" ? "Tap a building to go inside. The bridge at the bottom goes home." : scene === "base" ? "Tap to walk. The bridge at the top goes to town, the gate on the right to the vineyard." : scene === "lane" ? "Chord and Chico live here. Left gate: town square. Bottom path: vineyard." : scene === "farm" ? "Tap a plot to plant, water or harvest." : scene === "market" ? "Tap the counter to open the shop." : scene === "room" ? "Just you. Nap in bed, decompress in the calm corner, write at the desk." : "Tap furniture to walk to it. The board on the wall lists this building's quests.";
}
// The tasting room's tables: a villager who sits down orders straight away (serveGuest: a glass from an open bottle,
// a fresh one opened if needed, and sometimes a plate), and their table shows what they ordered. Orders are kept for
// the day in S.served by who's sitting and which visit it is, so nobody orders twice in one sitting. Pilar, on her
// break, just has a cup of something. Redrawn only when the orders change.
// After 7pm outdoors: every street lamp lights up, drawn again above the dusk wash so it glows, and the place names
// are drawn again above it on white tape so they read in the dark (copies that ignore taps: the originals underneath
// still take them). Home's two lamps are already lit by its own dusk art.
function nightLights(){
  const art = $("sceneArt"); if (!art.querySelector("rect.dusk")) return;
  const base = art.getCTM(); if (!base) return;
  const inv = base.inverse(), mtx = el => { const m = inv.multiply(el.getCTM()); return `matrix(${[m.a, m.b, m.c, m.d, m.e, m.f].map(v => +v.toFixed(3)).join(" ")})`; };
  let h = "";
  if (scene !== "base") art.querySelectorAll(".lglow").forEach(g => { const c = g.querySelector("circle"), x = +c.getAttribute("cx"), y = +c.getAttribute("cy"), r = +c.getAttribute("r");
    h += `<g transform="${mtx(g)}"><circle cx="${x}" cy="${y + 6}" r="${r + 10}" fill="url(#lampg)"/><circle class="flick" cx="${x}" cy="${y}" r="${(r*.45).toFixed(1)}" fill="#FFE3A3" opacity=".4"/>${r > 30 ? `<rect x="${x - 5}" y="${y - 6}" width="10" height="12" rx="2" fill="#FFE9A8" stroke="#3b3530" stroke-width="1.1"/>` : ""}</g>`; });
  art.querySelectorAll(".nglow").forEach(g => { const k = g.cloneNode(true); k.setAttribute("transform", mtx(g)); k.removeAttribute("class"); h += k.outerHTML; });   // neon, fairy lights
  art.querySelectorAll("text.lab").forEach(t => { const g = t.parentNode; if (!g || g.closest(".nightcopy")) return;
    const k = g.cloneNode(true), p = k.querySelector("path"); if (p) { p.style.fill = "#FFFDF6"; p.setAttribute("opacity", "1"); }
    k.setAttribute("transform", mtx(g)); k.setAttribute("class", "nightlab"); h += k.outerHTML; });
  art.insertAdjacentHTML("beforeend", `<g class="nightcopy" pointer-events="none">${h}</g>`);
}
let tableKey = "";
// Market days: each stall's table is also a prop sorted among the people, so a keeper behind it is hidden from the waist down
let frontKey = "", fronts = [];
function stallFronts(){
  const ev = scene === "field" ? eventNow(dayKey(), sgHM()) : null, dine = DINING[scene], key = ev ? dayKey() + ev.kind : dine ? "dine:" + scene : "";
  if (key !== frontKey) { fronts.forEach(([n]) => n.remove()); fronts = []; frontKey = key;
    // a house's dining table: drawn among the people too, so the family along the back sit behind it
    if (dine) { const g = document.createElementNS("http://www.w3.org/2000/svg", "g"); g.setAttribute("class", "sfront"); g.setAttribute("pointer-events", "none"); g.innerHTML = diningTable(dine.cx, dine.fy); fronts = [[g, {y: dine.fy - 1}]]; }
    if (ev) fronts = ev.stalls.map(st => { const [x, y] = STALL_SPOTS[st.at], g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("class", "sfront"); g.setAttribute("pointer-events", "none"); g.innerHTML = stallFront(st.at, x, y, st); return [g, {y: y - 1}]; }); }
  return fronts;
}
function drawTableware(){
  if (scene !== "wineshop") return;
  S.served = S.served || {};
  const seats = npcActors().map(([, e]) => e).filter(e => e.kind === "npc" && e.act === "sit" && !e.moving);
  seats.forEach(e => { const k = `${e.def.id}:${e.key}`; if (k in S.served || e.def.id === "pilar") return;
    const out = serveGuest(F, {serving: serving(), today: dayKey(), tourist: !!e.def.tourist}); S.served[k] = out ? {wine: out.wine, dish: out.dish || null} : {};
    if (out) { save(); if (serving()) { sfx("coin"); flash(`+${out.coins} coins: ${e.def.name} ordered ${out.dish ? "a glass and a plate" : "a glass"}`); }
      if (out.opened) setTimeout(() => npcSay(e.def.id, `Ooh, you've opened the ${out.name}! A glass of that, please.`), 600);
      else if (out.bottle) setTimeout(() => npcSay(e.def.id, `I'll take a bottle of the ${out.bottle} home too. It's for my mum. Mostly.`), 900); } });
  const orders = seats.map(e => [e, S.served[`${e.def.id}:${e.key}`] || {}]);
  const key = orders.map(([e, o]) => `${e.def.id}${Math.round(e.x)}${o.wine || ""}${o.dish || ""}`).join();
  if (key === tableKey && $("tableware")) return; tableKey = key;
  const T = ROOMS.wineshop.pos.T, tables = [[T[0] - 210, T[1] + 2], [T[0] - 70, T[1]], [T[0] + 70, T[1] - 6]];
  let h = "";
  orders.forEach(([e, o]) => { const [tx, ty] = tables.reduce((a, b) => Math.abs(b[0] - e.x) < Math.abs(a[0] - e.x) ? b : a), side = e.x < tx ? -1 : 1;
    if (o.dish) h += `<g transform="translate(${tx + side*13 - 11} ${ty - 36})">${dishArt(o.dish, 22)}</g>`;
    if (o.wine) h += `<g transform="translate(${tx + side*26 - 4} ${ty - 44})">${glassArt(o.wine, 14)}</g>`; });
  let g = $("tableware"); if (!g) { g = document.createElementNS("http://www.w3.org/2000/svg", "g"); g.id = "tableware"; g.setAttribute("pointer-events", "none"); $("sceneArt").appendChild(g); }
  g.innerHTML = h;
}
// Today's outfit from the wardrobe (F.wear, kept for the day): colours come from the item names (garments.js colourOf).
// The top and bottom recolour Mel's own; a dress, layer, shoes, bag, earrings, sunglasses (outdoors only) and hair worn
// down are drawn over her. Pyjamas in her room win.
const wearToday = () => F.wear && F.wear.day === dayKey() ? F.wear : null;
function applyWear(pj){
  const m = $("mel"); if (!m) return; const yk = !pj && townOf(scene) === "kyoto" && yukataOn(F), w = yk ? {dress: `${YUKATA.cols[yk][1]} maxi`, shoes: "tan"} : pj ? null : wearToday(), c = (f, fb) => colourOf(w[f], fb);
  { const e = $("evan"); if (e) { if (yk && inParty(F, "evan")) { e.style.setProperty("--tee", "#3E5E7A"); e.style.setProperty("--pants", "#3E5E7A"); } else { e.style.removeProperty("--tee"); e.style.removeProperty("--pants"); } } }
  const fill = (el, col) => { el.style.display = col ? "" : "none"; if (col) el.style.fill = col; };
  if (w && w.top && !w.dress) m.style.setProperty("--tank", c("top", "#FFFDF6")); else m.style.removeProperty("--tank");
  if (w && w.bottom && !w.dress) m.style.setProperty("--denim", c("bottom", "#2F2B28")); else m.style.removeProperty("--denim");
  fill($("oDress"), w && w.dress ? c("dress", "#2E3A70") : null);
  fill($("oLayer"), w && w.layer ? c("layer", "#6B6B72") : null);
  m.querySelectorAll(".osleeve").forEach(e => fill(e, w && w.layer ? c("layer", "#6B6B72") : null));
  m.querySelectorAll(".oshoe").forEach(e => fill(e, w && w.shoes ? c("shoes", "#2F2B28") : null));
  // trousers go all the way down to the shoes; shorts and skirts stay short
  const long = !!(w && w.bottom && !w.dress && !/short|skirt|skort|mini/i.test(w.bottom));
  m.querySelectorAll(".otrouser").forEach(e => fill(e, long ? c("bottom", "#2F2B28") : null));
  // trousers: the hips run straight on into the legs (no shorts hem drawn across them)
  { const hips = $("oHips"), sides = $("oHipSides"); if (hips) { hips.setAttribute("d", long ? "M-8.6 -23 h17.2 l-0.4 8.6 h-16.4z" : "M-8.6 -23 h17.2 l1 9.5 h-8 l-1.6 -3 l-1.6 3 h-8z"); hips.style.stroke = long ? "none" : ""; } if (sides) sides.style.display = long ? "" : "none"; }
  const bag = $("oBag"); bag.style.display = w && w.bag ? "" : "none"; if (w && w.bag) bag.querySelector("rect").style.fill = c("bag", "#2F2B28");
  const ear = $("oEar"); ear.style.display = w && w.jewellery ? "" : "none";
  if (w && w.jewellery) ear.querySelectorAll("circle").forEach(e => e.style.fill = /silver|platinum|white gold/i.test(w.jewellery) ? "#BFC3CA" : /pearl/i.test(w.jewellery) ? "#F6F1E8" : "#D9A93A");
  $("oShades").style.display = w && w.sunglasses && outside() ? "" : "none";
  const down = !!(w && w.hair && /down/i.test(w.hair)); $("oHairDown").style.display = down ? "" : "none"; m.classList.toggle("hairdown", down);
  m.classList.toggle("restyled", !!(w && (w.hair || w.dress || w.top))); // the blue hair tie and sprigs belong to the usual look only
}
// The river taxi (transport.js): pay, a few seconds on the launch (an overlay), then step off at the other stop
function rideTaxi(to){
  const s = takeTaxi(F, to); if (!s) return;
  woodsView = null; rondaView = null; ghBed = null; millOpen = false; friView = null; ctx(); sfx("chaching"); save(true);
  const o = document.createElement("div"); o.className = "taxiride"; o.innerHTML = `${taxiBank}<div class="taxiboat">${taxiBoat}</div><p>Down the river to ${esc(s.n.replace(/^The /, "the "))}...</p>`; $("map").appendChild(o);
  setTimeout(() => { o.remove(); setScene(s.scene, s.at); setTimeout(() => speak(`The river taxi drops you at ${s.n}.`, 3500), 700); }, 2600);
}
// Friday evenings (round 112): the bonfire at home, the fish van at the bay, and a kite on the field
const isFri = () => new Date(dayKey() + "T00:00:00Z").getUTCDay() === 5;
function fridayLayer(sc){
  if (sc === "base") return bonfireArt(FIRE[0], FIRE[1], bonfireNow(dayKey(), sgHM()));
  if (sc === "bay") return vanNow(dayKey(), sgHM()) ? fishVanArt(330, 600) : "";
  if (sc === "field") return (movieNow(dayKey(), sgHM()) ? movieArt(SCREEN[0], SCREEN[1], filmOf(dayKey())) : "")
    + (bayMarketNow(dayKey(), sgHM()) ? BAY_STALLS.map(([x, y], k) => bayStallArt(k, x, y, `${bayKeeperName(dayKey(), k)}'s stall`)).join("") + kiteSellerArt(KITE_SELLER[0] - 22, KITE_SELLER[1] + 4) : "") + `<g data-place="kitefly" aria-label="Kite flying"><ellipse class="hov" cx="440" cy="334" rx="30" ry="9" style="fill:var(--butter)"/><g filter="url(#wob)" style="stroke:var(--line)" stroke-width="1.1"><path d="M452 336 v-46" stroke-width="2"/><path d="M452 292 l18 4 l-2 8 l-16 2z" style="fill:#E8913A"/><path d="M458 293 v12 M464 294 v10" style="stroke:#FFFDF6" stroke-width="2"/></g>${tapeLabel(440, 352, "Kite flying", "#DCEBF6", 9)}</g>`
    + (S.kite && S.kite.until > Date.now() ? kiteArt(S.kite.x, S.kite.y) : "");
  return "";
}
// a stall at the Friday bay market (or Hiro's kites on the beach)
function bayMarketPanel(v){
  const kites = v === "kites", k = kites ? -1 : +v.slice(2), items = kites ? ["kite"] : bayStallGoods(dayKey(), k), who = kites ? "Hiro" : bayKeeperName(dayKey(), k);
  return `<span class="tape gingham" aria-hidden="true"></span><h2>${kites ? "Hiro's kites" : `${esc(who)}'s stall`}</h2><p class="sub">${kites ? "\"Red, blue or yellow? They all fly. The breeze off the sea does the rest.\" Fly yours over by the river, at the kite flying spot." : "The Friday market on the field: a different mix every week."}</p>
    <div class="items shop">${items.map(id => itemBtn(id, `<b>${kites ? ITEMS.kite.price : stallPrice(id)}</b> ${icon("coin", 13)}${ITEMS[id].to ? ` · for ${giftNames(ITEMS[id].to)}` : ""}`, F.coins < (kites ? ITEMS.kite.price : stallPrice(id)), F.inv[id] ? `<span class="cnt">×${F.inv[id]}</span>` : "")).join("")}</div>
    <div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
}
function flyKite(){
  if (!(F.inv.kite > 0)) { speak("A good breeze for a kite! Hana sells them (the Family shelf at the market).", 4500); render(); return; }
  S.kite = {until: Date.now() + 60e3, x: mel.x, y: mel.y}; mel.dir = -1; sfx("whistle"); drawScene(); gainXp(1);
  speak(pick(["Up it goes! The red kite catches the wind.", "Run, run... and up! It's flying.", "The kite tugs on the string like it wants to go to sea."]), 4500);
  if (evanHere() && !evanNight()) { evan.tx = mel.x - 40; evan.ty = mel.y + 10; evan.run = true; evan.wait = 8; [900, 4000, 8000].forEach((d, i) => setTimeout(() => evanSays(["kite! up up!", "my turn! my turn!", "it's so HIGH, Mama!"][i]), d)); }
  save(); render();
}
// the week's lanterns: little glowing paper lanterns rising from the fire and drifting up over the house
function lanternFlight(n){
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g"); g.setAttribute("pointer-events", "none");
  const t0 = $("world").getCurrentTime ? $("world").getCurrentTime() : 0;   // SVG animations count from page load: start them now
  g.innerHTML = Array.from({length: Math.min(n, 24)}, (_, i) => { const x = FIRE[0] - 20 + (i*37) % 60, dx = -60 - (i*53) % 110, d = 6 + (i % 5);
    return `<g opacity="0"><rect x="${x - 5}" y="${FIRE[1] - 30}" width="10" height="13" rx="3" fill="#F6C26B" stroke="#3b3530" stroke-width=".8"/><circle cx="${x}" cy="${FIRE[1] - 24}" r="9" fill="url(#lampg)"/>
      <animateTransform attributeName="transform" type="translate" from="0 0" to="${dx} ${-260 - (i*29) % 160}" dur="${d}s" begin="${(t0 + i*.35).toFixed(2)}s" fill="freeze"/><animate attributeName="opacity" values="0;1;1;0" dur="${d}s" begin="${(t0 + i*.35).toFixed(2)}s" fill="freeze"/></g>`; }).join("");
  let fx = $("fxLayer"); if (!fx) { fx = document.createElementNS("http://www.w3.org/2000/svg", "g"); fx.id = "fxLayer"; fx.setAttribute("pointer-events", "none"); $("world").appendChild(fx); }   // above everyone
  fx.appendChild(g); setTimeout(() => g.remove(), 20000);
}
// Day trips (trips.js, round 107): tickets at Honeybrook station, the train, a day in the town, the train home.
const liveNow = () => { const room = townRoom(scene); if (room) return room.music; const town = townOf(scene); if (town) return TOWNS[town].music; const ev = scene === "field" ? eventNow(dayKey(), sgHM()) : null; return ev && ev.kind === "night" ? "jazz" : null; };
function trainRide(text, town, then){
  const o = document.createElement("div"); o.className = "taxiride trainride"; o.innerHTML = trainRideArt(town) + `<p>${esc(text)}</p>`; $("map").appendChild(o); sfx("choo");
  setTimeout(() => { o.remove(); then(); }, 2600);
}
const partyList = t => t.party.map(tripName).join(", ").replace(/, ([^,]*)$/, " and $1");
// the ferry crossing (round 127: Jeju): longer than the train, and the sea has dolphins in it
function ferryRide(text, home, then){
  const o = document.createElement("div"); o.className = "taxiride trainride ferryride"; o.innerHTML = ferryRideArt(home) + `<p>${esc(text)}</p>`; $("map").appendChild(o); sfx("honk");
  setTimeout(() => { o.remove(); then(); }, 6000);   // (a slow crossing: 6s, the CSS .ferryride matches)
}
function startTrip(town, by = "train"){
  const r = buyTrip(F, town, tripPick, sgHM(), by); if (!r) return;
  const t = tripOn(F), boat = by === "ferry", land = boat ? r.town.ferry.arrive : r.town.arrive; railOpen = false; tripPick = []; ctx(); sfx("chaching"); flash(`Tickets to ${r.town.n}`); save(true);
  (boat ? ferryRide : trainRide)(boat ? `All aboard the ferry for ${r.town.n}!` : `All aboard for ${r.town.n}!`, boat ? false : town, () => { if (town === "ronda") rondaVisit(F); setScene(land[0], land[1]);
    if (town === "jeju" && sgHM() < 8*60) setTimeout(() => speak("And look: the sun's just coming up out of the sea behind Seongsan, turning the crater gold. Worth the early start.", 6000), 8000);   // round 129: the early boat
    setTimeout(() => speak(`${(boat && r.town.ferry.arriveLine) || r.town.arriveLine || `${r.town.n}! Whitewashed walls, orange trees and a sky so blue it hums.`}${t.party.length ? ` ${partyList(t)} pile${t.party.length > 1 ? "" : "s"} off the ${boat ? "ferry" : "train"} behind you.` : ""} The last ${boat ? "ferry" : "train"} home is at 10pm.`, 6500), 900);
    if (inParty(F, "evan")) setTimeout(() => evanSays(pick(r.town.evanArrive || ["Mama, it's SO sunny!", "Big birdies in the sky!", "Are we in Spain? Is this Spain?"])), 3200); });
}
function tripHome(late, by){
  const t = tripOn(F), town = t ? TOWNS[t.town] : TOWNS[townOf(scene) || "ronda"]; endTrip(F); railOpen = false; kyotoView = null; ctx();
  // home the way you choose (Jeju: the train or the ferry); at the last call, the way you came
  const boat = (by || (t && t.by)) === "ferry" && !!town.ferry;
  // Ma Ma folded paper cranes all day in Kyoto: a string of them comes home, one for each of the family (once)
  // Ma Ma brings a tangerine sapling home from Jeju: the orchard can grow tangerine trees now (once)
  if (t && t.town === "jeju" && t.party.includes("mama") && !jejuState(F).sapling) { jejuState(F).sapling = true; setTimeout(() => { flash("Ma Ma's tangerine sapling"); speak("Ma Ma's carried a tangerine sapling all the way home on her lap. \"For the orchard. Mr Ko says: lots of sun, lots of wind.\" Tangerine trees are in the orchard's planting list now.", 7000); }, 3400); }
  if (t && t.town === "kyoto" && t.party.includes("mama") && !kyotoState(F).cranes) { kyotoState(F).cranes = true; addInv("k_cranes", 1); setTimeout(() => flash("Ma Ma's paper cranes"), 3400); }
  save(true);
  (boat ? ferryRide : trainRide)(late ? `The last ${boat ? "ferry" : "train"} home, everyone sleepy...` : boat ? "Home across the sea to Honeybrook..." : "Home to Honeybrook...", boat ? true : null, () => { setScene(boat ? "shore" : "hlane", boat ? VILLAGE.ferry.door : VILLAGE.timetable.door);
    setTimeout(() => speak(`Back in Honeybrook. ${town.n} was ${pick(["unforgettable", "a proper adventure", "glorious"])}.${t && t.party.length ? ` ${partyList(t)} head${t.party.length > 1 ? "" : "s"} off home.` : ""}`, 5000), 800); });
}
// places on a town's screens (the gates are handled as bridges): the station, and a line for everywhere else
// inside one of a town's rooms (round 116): the bar, the café counter and Rafael's stall open their panels; the
// baths' skylights tell you something about them; the garden's fountain is for sitting by
let bathFact = 0, flamSt = null, flamT = 0, teaSt = null, paintSt = {};   // round 118: the flamenco palmas, Amina's mint tea, Lucía's tile painting
const BATH_FACTS = ["Eight hundred years old: the best-kept Arab baths in Spain. The water came up from the river on a wheel turned by a donkey.",
  "Three rooms, cold, warm and hot, like a hammam. The star-shaped holes let the light down and the steam out.",
  "Under the floor, hot air from a furnace ran through channels, so the stones were warm under your feet.",
  "People came to wash, but mostly to talk. Like a café, with more steam."];
// Kyoto (round 123): a stamp in the book for each place; the room spots open the activities
let kyotoView = null, ktSt = {};
// Jeju (round 128): the room panels and their little games (jeju.js)
let jejuView = null, jjSt = {};
let loftView = false;   // round 132: the drying loft over the barrel shed (loft.js)
let cinqueView = null, ctSt = {};   // round 132: Cinque Terre's room panels and activities (cinque.js)
function stampHere(place){ const s = ktStamp(F, place); if (!s) return; sfx("chime"); flash(`Stamp: ${s.n}`); gainXp(1);
  if (s.full) setTimeout(() => speak("The stamp book's full! Eight ink stamps from round Kyoto. Back home, there's a little stone lantern by the pond now.", 6500), 1200); save(); }
const homeLantern = (x, y) => `<g pointer-events="none" class="homelantern"><g style="stroke:var(--line)" stroke-width="1.3" stroke-linejoin="round"><rect x="${x-4}" y="${y-22}" width="8" height="22" fill="#B9B0A4"/><path d="M${x-12} ${y-22} h24 l-4 -6 h-16z" fill="#CFC6B8"/><rect x="${x-8}" y="${y-38}" width="16" height="10" fill="#E6DED0"/><rect x="${x-4}" y="${y-36}" width="8" height="6" fill="#F6D98A"/><path d="M${x-14} ${y-38} q14 -12 28 0z" fill="#B9B0A4"/><circle cx="${x}" cy="${y-48}" r="2.5" fill="#B9B0A4"/></g><circle cx="${x}" cy="${y-33}" r="14" fill="#F6D98A" opacity=".18"/></g>`;
function roomSpot(id){
  if (id === "dyecloth") { const r = takeDye(F, addInv); if (!r) return; if (r.ready) { sfx("chime"); gainXp(2); flash("Your persimmon scarf"); speak("You unpeg the scarf: three days of sun have turned it a deep, warm rust, like Mr Moon's. It's a keepsake now. It smells like summer.", 6500); save(); }
    else speak(`Still drying: it's ${["pale and green-ish", "turning golden", "nearly rust"][Math.min(2, DYE.DAYS - r.left)]}. ${r.left} more day${r.left === 1 ? "" : "s"} of sun.`, 4500); render(); return; }
  // Cinque Terre (round 132): each room's panel
  if (id === "ct_focacceria" || id === "ct_pesto" || id === "ct_cantina" || id === "ct_gelato" || id === "ct_limoni") { cinqueView = id; ctSt = {}; sfx("paper", true); render(); return; }
  // Jeju (round 128): each room's thing to do, and the slow-post box
  if (id === "jj_haenyeo" || id === "jj_shed" || id === "jj_cafe" || id === "jj_market" || id === "jj_dye" || id === "jjpost") { jejuView = id; jjSt = {}; sfx("paper", true); render(); return; }
  if (id === "jjjuk") { jejuView = "jj_haenyeo"; jjSt = {}; sfx("paper", true); render(); return; }
  if (id === "jjradio") { sfx("chime"); speak(pick(["The radio's playing a trot song, all trumpets and heartbreak. Mr Ko hums along without looking up.", "The weather forecast: wind, sun, more wind. Mr Ko nods. Good tangerine weather.", "A call-in show about the best way to peel a tangerine. Mr Ko has opinions."]), 5000); render(); return; }
  if (id === "jjwindow") { mel.sitting = true; nodes.mel.classList.add("sit"); speak(pick(["The sea, the crater, a fishing boat, the divers' orange floats. You could watch this all afternoon.", "A ferry slides across the window. Somewhere out there is Honeybrook.", "The wind's whipping the sea white. Inside, it's warm, and smells of coffee and tangerines."]), 5000); render(); return; }
  if (id === "kt_tea" || id === "kt_hall" || id === "kt_sweets" || id === "kt_market" || id === "kt_pottery") { kyotoView = id; ktSt = {}; sfx("paper", true); render(); return; }
  if (id === "ktbell") { sfx("chime"); speak(pick(["BONNNG. The sound rolls round the hall and out over the garden, and keeps going long after.", "You strike the bell gently. It hums for a whole minute."]), 5000); if (inParty(F, "evan") && !evanNight()) setTimeout(() => evanSays(pick(["BONG! again!", "it's SO loud", "my turn! BONG!"])), 1600); render(); return; }
  if (id === "ktchime") { sfx("chime"); speak("The wind chime tinkles: a little glass bell with a goldfish painted on it. Ishida sells them for 10.", 4000); render(); return; }
  if (id === "flamenco" || id === "tea") { rondaView = id; if (id === "flamenco") { flamSt = null; clearTimeout(flamT); } else teaSt = null; sfx("paper", true); render(); return; }
  if (id === "cat") { sfx("chime"); speak(pick(["The workshop cat opens one eye, decides you're alright, and goes back to sleep on the hides.", "A purr like a little engine. Antonio says she's called Piel. Of course she is.", "The cat stretches, yawns, and rolls over onto a half-finished belt."]), 4500);
    if (inParty(F, "evan") && !evanNight()) setTimeout(() => evanSays(pick(["kitty!", "soft kitty", "she's purring, Mama!"])), 1400); render(); return; }
  if (id === "tapas" || id === "mercado" || id === "dulces" || id === "cuero" || id === "especias" || id === "ceramica" || id === "postales") { rondaView = id; sfx("paper", true); render(); return; }
  if (id === "banos") { mel.dir = 1; speak(BATH_FACTS[bathFact++ % BATH_FACTS.length], 7000); if (inParty(F, "evan") && !evanNight()) setTimeout(() => evanSays(pick(["stars! in the roof!", "echo! ECHO!", "it's dark and sparkly"])), 1600); render(); return; }
  if (id === "jardin") { mel.sitting = true; nodes.mel.classList.add("sit"); sfx("chime"); speak(pick(["The fountain splashes, the water runs off down the channel, and the noise of the town just... stops.", "Orange blossom, myrtle, cool stone. You could sit here all afternoon.", "A sparrow drinks from the edge of the fountain. Nobody's in a hurry."]), 5500);
    const t = tripOn(F), who = t ? t.party.filter(x => x !== "evan" && isHere(x)) : []; if (who.length) setTimeout(() => npcSay(who[0], pick(TOWNS[townOf(scene)].lines[who[0]] || ["Lovely."])), 2600); render(); return; }
}
function townSpot(id){
  const town = townOf(scene), T = TOWNS[town];
  if (id === T.station) { railOpen = true; sfx("paper", true); render(); return; }
  if (T.ferry && id === T.ferry.pier) { railOpen = "ferry"; sfx("paper", true); render(); return; }   // Jeju: the ferry home
  const room = roomBehind(town, id);   // round 116: the tapas bar, the café, the market, the baths and the garden have insides
  if (room) { sfx("paper", true); setScene(room, [260, 560]); setTimeout(() => speak(T.rooms[room].say, 5000), 700); if (town === "kyoto") setTimeout(() => stampHere(room), 5800);
    // a touch (round 134): Beppe gives Evan a warm heel of focaccia (once a day)
    if (room === "ct_focacceria" && inParty(F, "evan") && !evanNight() && cinqueState(F).bread !== dayKey()) setTimeout(() => { if (scene !== "ct_focacceria" || !isHere("beppe")) return; cinqueState(F).bread = dayKey(); npcSay("beppe", "Per il piccolo! The best bit, the crusty end."); setTimeout(() => evanSays("warm bread! mmm!"), 2200); save(); }, 3200);
    // a touch (round 129): the divers give Evan a sea snail shell (once)
    if (room === "jj_haenyeo" && inParty(F, "evan") && !evanNight() && !jejuState(F).shell) setTimeout(() => { if (scene !== "jj_haenyeo" || !isHere("halmang")) return; jejuState(F).shell = true; addInv("j_shell", 1);
      npcSay("halmang", "For the little one. Listen: the sea's inside."); setTimeout(() => evanSays("I can hear it, Mama! the SEA!"), 2400); flash("A sea snail shell for Evan"); save(); }, 3200);
    // a touch: at Kyoto's market, Fumiko gives Evan a rice cracker (once a day)
    if (room === "kt_market" && inParty(F, "evan") && !evanNight() && kyotoState(F).cracker !== dayKey()) setTimeout(() => { if (scene !== "kt_market" || !isHere("fumiko")) return; kyotoState(F).cracker = dayKey(); npcSay("fumiko", "A rice cracker for the little one! Careful, crunchy."); setTimeout(() => evanSays("CRUNCH! more?"), 2200); save(); }, 3200);
    // a touch: Rocío gives Evan a carnation (once a day), and he gives it straight to Mel
    const r = rondaState(F); if (room === "rd_mercado" && inParty(F, "evan") && !evanNight() && r.flowerDay !== dayKey() && NPCS.some(n => n.id === "rocio") ) setTimeout(() => { if (scene !== "rd_mercado" || !isHere("rocio")) return; r.flowerDay = dayKey(); addInv("clavel", 1);
      npcSay("rocio", "¡Para ti, guapo! A carnation, for the little one."); setTimeout(() => evanSays("for you, Mama!"), 2200); save(); }, 3200);
    return; }
  if (["mercado", "tapas", "dulces", "convento", "azulejos"].includes(id)) { rondaView = id; sfx("paper", true); speak(T.say[id], 4000);
    if (id === "convento" && inParty(F, "evan") && !evanNight()) setTimeout(() => evanSays(pick(["Knock knock! Hello nuns!", "The wall is spinning!", "Biscuits from a WALL?"])), 1600);
    render(); return; }
  if (id === "alameda" && (F.inv.picnic || 0) > 0) { rondaPicnic(F, addInv); mel.sitting = true; nodes.mel.classList.add("sit"); mel.dir = -1; sfx("chime"); gainXp(1);
    const t = tripOn(F), who = t ? t.party.filter(x => x !== "evan") : [];
    speak(`A picnic at the balcony: bread, payoyo, jamón and oranges, with the whole valley below.${who.length ? " Everyone squeezes onto the blanket." : ""}`, 6500);
    [0, 300, 600].forEach((d, i) => setTimeout(() => mprop("heart", mel.x + (i - 1)*16, mel.y - 50, 1600), d));
    who.slice(0, 3).forEach((id, i) => setTimeout(() => npcSay(id, pick(T.lines[id] || ["Mmm."])), 2400 + i*2600));
    if (inParty(F, "evan") && !evanNight()) setTimeout(() => evanSays(pick(["Picnic!", "Orange for Evan!", "Look, the birdies want some!"])), 1800);
    save(); render(); return; }
  if (id === "ktyukata") { kyotoView = "ktyukata"; sfx("paper", true); render(); return; }
  // Cinque Terre (rounds 132–134): the monorail harvest and the boat painting open their panels; a padlock on the
  // lovers' path; Evan's sandcastle on the beach; a cat asleep in a boat
  if (id === "ctmonorail") { cinqueView = "monorail"; ctSt = {}; sfx("paper", true); render(); return; }
  if (id === "ctboats") { cinqueView = "boats"; ctSt = {boat: {}}; sfx("paper", true); if (Math.random() < .4) setTimeout(() => speak("A ginger cat is asleep in the red boat, in a coil of rope. Nobody's going to move him.", 4000), 600); render(); return; }
  if (id === "ctpadlock") { const c = cinqueState(F); if (!c.padlock && F.coins >= 3) { F.coins -= 3; c.padlock = dayKey(); sfx("chime"); gainXp(1); speak("A little brass padlock, two sets of initials scratched on with a key, clicked onto the railing over the sea. It stays there now.", 6000); drawScene(); save(); }
    else speak(c.padlock ? "Your padlock's still there, among the hundreds, catching the sun." : T.say.ctpadlock, 5000); render(); return; }
  if (id === "ctbeach" && inParty(F, "evan") && !evanNight()) { speak(T.say.ctbeach, 4500); setTimeout(() => { evanSays(pick(["a castle! for you, Mama!", "dig dig dig", "the sea is coming for my castle!"])); mprop("sparkle", mel.x + 30, mel.y - 20, 1600); }, 2000); gainXp(1); render(); return; }
  // Jason (round 135): on the harbour in the evening he's saved Mel a slice of pizza, like the night in 2015 (once a day)
  if (id === "ctharbour" && sgHM() >= 18*60 && isHere("jason") && cinqueState(F).pizza !== dayKey()) { cinqueState(F).pizza = dayKey(); mel.sitting = true; nodes.mel.classList.add("sit"); sfx("chime"); hearts(2);
    speak("Jason pats the cold stones beside him and opens a pizza box. \"I saved you a slice. Some traditions ought to be kept.\" The harbour lights come on, one by one, over the dark water.", 7500);
    setTimeout(() => npcSay("jason", pick(["Just like 2015. Except this time your train was on time. I'm almost disappointed.", "I'd have waited, you know. I always would.", "Margherita. Some things one doesn't improve upon."])), 4200);
    if (inParty(F, "evan") && !evanNight()) setTimeout(() => evanSays(pick(["pizza on the rocks!", "Uncle Jason, more please!"])), 8500);
    save(); render(); return; }
  // Jeju (round 129): Evan's rock-pool net; add a stone to a wish-tower; pat the stone grandfather's nose
  if (id === "jjpools" && inParty(F, "evan") && !evanNight()) { speak(T.say.jjpools, 5000); setTimeout(() => { evanSays(pick(["a CRAB! a tiny crab!", "Mama, a snail! it's walking!", "look in my net! LOOK!"])); mprop("sparkle", mel.x - 20, mel.y - 50, 1400); }, 2200); gainXp(1); render(); return; }
  if (id === "jjcairns") { sfx("chime"); speak(pick(["You find a flat black stone and balance it on the tallest tower. A wish for everyone at home.", "One more stone, very carefully. It wobbles, and holds."]), 4500); if (inParty(F, "evan") && !evanNight()) setTimeout(() => evanSays("my stone! my wish!"), 1600); render(); return; }
  if (id === "jjstatues") { speak(T.say.jjstatues + " People rub their noses for luck; the noses are worn smooth.", 6500); if (inParty(F, "evan") && !evanNight()) setTimeout(() => evanSays(pick(["hello stone grandpa!", "his nose is shiny!", "he's smiling at me"])), 1800); render(); return; }
  if (town === "kyoto") stampHere(id);
  speak(T.say[id] || VILLAGE[id].line, 6000);
  if (inParty(F, "evan") && (id === "mirador" || id === "alameda") && !evanNight()) setTimeout(() => evanSays(pick(["so HIGH", "Mama, hold hand", "big birdies!"])), 1800);
  render();
}
// in town: someone in the party says something about the place now and then; and the last train home at 10pm
let townSaid = 0;
function townTick(){
  const town = townOf(scene); if (!town) return;
  if (sgHM() >= TOWNS[town].backTo && !document.querySelector(".trainride")) { const t0 = tripOn(F); speak(`That's the last ${t0 && t0.by === "ferry" ? "ferry" : "train"}! Everyone on, quick.`, 3500); tripHome(true); return; }
  if (scene === "ct_vernazza" && sgHM() >= 12*60 && sgHM() < 12*60 + 5 && S.ctBells !== dayKey()) { S.ctBells = dayKey(); sfx("chime"); speak("Noon: the church bells ring out over the harbour, and the whole of Vernazza stops for lunch.", 5000); }   // round 134
  const t = tripOn(F); if (!t || !t.party.length || Date.now() - townSaid < 70000 || Math.random() > .25) return;
  const who = t.party.filter(id => id !== "evan" && isHere(id)), id = pick(who.length ? who : [null]); if (!id) return;
  const l = TOWNS[town].lines[id]; if (l) { townSaid = Date.now(); npcSay(id, pick(l)); }
}
// Fishing (fishing.js): cast, wait for the bite, reel while the marker's in the green
function fishGo(a, k){
  if (a === "view") fishSt = {...fishSt, view: k};
  else if (a === "sell" || a === "sellall") { const g = sellCatch(F, a === "sell" ? k : null, fishSpot === "bay" ? VAN_MULT : 1); if (!g) return; sfx("chaching"); speak(g.n > 1 ? `Sold ${g.n} to the fishmonger: ${g.coins} coins.` : `Sold to the fishmonger: ${g.coins} coin${g.coins === 1 ? "" : "s"}.`, 3500); }
  else if (a === "rod") { if (!buyRod(F)) return; sfx("chaching"); flash("A fishing rod"); speak("A proper rod! Let's see what's biting.", 3500); }
  else if (a === "reelup") { if (!buyReel(F)) return; sfx("chime"); flash("The better reel"); speak("Smooth as anything. Fish beware.", 3000); }
  else if (a === "cast") { const c = fishCast(F, fishSpot); if (typeof c === "string") return; clearTimeout(fishT); fishSt = {cast: c}; sfx("pop"); fishT = setTimeout(fishBite, Math.max(0, c.bite - Date.now())); }
  else if (a === "reel") { const c = fishSt.cast; if (!c) return; clearTimeout(fishT);
    if (!c.t0) fishSt = {msg: "Too soon! Whatever it was swam off with the worm."};
    else if (!inZone(c.zone, markerAt(c.t0))) { fishSt = {msg: "Splash! It got away."}; sfx("tap"); }
    else { const r = fishLand(F, c.fish, Math.random, addInv); fishSt = {result: r}; gainXp(r.isNew ? 2 : 1);
      if (r.isNew || r.id === "koi") { sfx("yay"); act("cheer"); [0, 300].forEach((d, i) => setTimeout(() => mprop("sparkle", mel.x + (i ? 20 : -20), mel.y - 60, 1600), d)); } else sfx("chime");
      if (r.id === "koi") { speak("A golden koi! It's going in the pond at home.", 5000); drawScene(); }
      else if (evanHere() && !FISH[r.id].junk) setTimeout(() => evanSays(pick(["A fish! A real fish!", "It's wiggly!", "Can I hold it?", "Big one, Mama!"])), 800); }
  }
  save(); dressMel(); ctx();
}
function fishBite(){ const c = fishSt.cast; if (!c || !fishSpot) return; c.t0 = Date.now(); sfx("chime"); dressMel(); ctx();
  fishT = setTimeout(() => { if (fishSt.cast === c) { fishSt = {msg: "It nibbled the worm and slipped away while you weren't looking."}; dressMel(); ctx(); } }, FISH_ESCAPE); }
// Rainy days outdoors: Mel under her periwinkle brolly with white dots; Evan in a yellow raincoat, hood up, red wellies.
const MEL_BROLLY = {kind: "brolly", a: "#9AA9DD", b: "#FFFDF6", pat: "dots"}, EVAN_COAT = {kind: "coat", a: "#F3C969", b: "#E8566C"};
let rainDressed = null;
function dressRain(){
  const wet = outside() && !townOf(scene) && rainyOn(dayKey()) && !($("mel") && $("mel").classList.contains("sup")), k = wet ? "y" : "";
  if (k === rainDressed) return; rainDressed = k;
  const mr = $("melRain"), er = $("evanRain"), ev = $("evan");
  if (mr) mr.innerHTML = wet ? brollyArt(MEL_BROLLY, 1) : "";
  if (er) er.innerHTML = wet ? hoodArt(EVAN_COAT, .61, -28, 8.6) : "";
  if (ev) { ev.classList.toggle("raincoat", wet); if (wet) ev.style.setProperty("--tee", EVAN_COAT.a); else ev.style.removeProperty("--tee"); }
}
function dressMel(){
  const d = F.decor || {}, show = (id, on) => { const e = $(id); if (e) e.style.display = on ? "" : "none"; };
  const pj = wearing(F, "me_pj") && scene === "room";
  { const cone = !!(S.cone && Date.now() < S.cone.until), el = $("melCone"); if (el) { el.style.display = cone ? "" : "none"; if (cone) $("melConeTop").style.fill = S.cone.col || "#F4C7CF"; } }
  show("melRod", !!fishSpot && FISH_SPOTS[fishSpot].scene === scene); { const r = $("melRod"); if (r) r.classList.toggle("bite", !!(fishSt.cast && fishSt.cast.t0)); }
  show("melBow", wearing(F, "me_bow")); show("melHat", wearing(F, "me_hat") && outside()); show("melScarf", wearing(F, "me_scarf") && !pj); show("melPj", pj);
  applyWear(pj);
  dressRain();
  const m = $("mel"); if (m) m.style.visibility = (S.sleep && scene === "room") || cruisingNow() ? "hidden" : "";
}
function render(redraw){
  if (S.day !== dayKey()) S = freshToday();
  storyFlags(F);   // story rewards that change the game (the koi tip, Farid's pastries)
  registerItems(F);   // each discovered gelato flavour is a gift item (one per type) in the backpack
  setLive(liveNow());   // the jazz duo at the night market, the guitar in Ronda: live, over the record player
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
  $("friendBody").insertAdjacentHTML("beforeend", whosWhereHTML() + storiesHTML(F, Object.fromEntries(NPCS.map(n => [n.id, n.name]))));
  $("friendBody").insertAdjacentHTML("beforeend", `<h3 class="ph3">Family</h3><p class="muted">${icon("heart", 14)} Gifts for Evan: ${F.fam.gifts.evan} · for Darren: ${F.fam.gifts.darren}. Every third gift, they give you something back. Treats and keepsakes are in the market's Family tab.</p>`);
  renderEvanHold();
  const all = allTasks(), rem = remaining(), cur = (phase() === "task" && rem[0]) ? rem[0].id : null;
  $("logSum").textContent = all.length ? `All quests · ${rem.length} left` : "All quests";
  $("qBadge").hidden = !rem.length; $("qBadge").textContent = rem.length;
  $("list").innerHTML = (!S.cleanDone && S.cleanLater ? `<li class="pick" data-cleannow="1" role="button" tabindex="0"><span class="pl">${icon("home", 20)}</span><span class="t">Five-minute clean</span><small>waiting for later</small><button class="next" data-cleannow="1">do this now</button></li>` : "") + all.map(t => { const dn = S.doneIds.includes(t.id);
    const pickable = !dn && t.id !== cur;
    return `<li class="${dn ? "done" : ""}${t.id === cur ? " cur" : ""}${pickable ? " pick" : ""}"${pickable ? ` data-pick="${esc(t.id)}" role="button" tabindex="0"` : ""}><span class="pl">${icon(placeOf(t), 20)}</span><span class="t">${dn ? `<i class="tk" aria-label="done"></i>` : ""}${esc(t.title)}</span><small>${esc(placeInfo(placeOf(t)).name)} · ${esc(spotObj(placeOf(t), spotOf(t)).name)}${t.id === cur ? " · doing now" : ""}${t.early ? " · from tomorrow" : ""}${!dn ? ` <button class="drop" data-drop="${esc(t.id)}" aria-label="Not needed today: remove from today's quests">not today</button>` : ""}</small>${pickable ? `<button class="next" data-next="${esc(t.id)}">do this now</button>` : "<span></span>"}</li>`; }).join("")
    + ((S.dropped || []).length ? `<li class="dropped"><small>Dropped today: ${(S.dropped || []).map(id => { const t = ((P && P.tasks) || []).find(x => x.id === id); return t ? `${esc(t.title)} <button class="drop" data-undrop="${esc(id)}">bring back</button>` : ""; }).filter(Boolean).join(" · ")}</small></li>` : "");
  $("list").querySelectorAll("[data-drop]").forEach(el => el.onclick = ev => { ev.stopPropagation(); dropTask(el.dataset.drop); });
  $("list").querySelectorAll("[data-undrop]").forEach(el => el.onclick = ev => { ev.stopPropagation(); undropTask(el.dataset.undrop); });
  $("list").querySelectorAll("[data-next]").forEach(el => el.onclick = ev => { ev.stopPropagation(); doNext(el.dataset.next); });
  $("list").querySelectorAll("[data-pick]").forEach(el => el.onclick = () => doNext(el.dataset.pick));
  $("list").querySelectorAll("[data-cleannow]").forEach(el => el.onclick = ev => { ev.stopPropagation(); S.cleanLater = false; if (S.timer && S.timer.kind !== "break") S.timer = null; say = null; openView = null; boardOpen = false; speak("Five-minute clean first, then. Grab a wet wipe from the cleaning cupboard.", 4000); save(true); });
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
const evanHere = () => scene === "kidroom" || (townOf(scene) && inParty(F, "evan") && !evanNight()) || ((scene === "base" || scene === "home" || scene === "vineyard" || scene === "field" || scene === "shore" || scene === "bay" || scene === "hfarm" || scene === "hwoods" || scene === "barn" || scene === "hlane" || scene === "honeysuckle" || scene === "clover" || scene === "van" || scene === "scoopshop" || scene === "scoopkitchen" || scene === "scoopdip" || scene === "cocoa" || scene === "cocoakitchen" || scene === "mumdad" || scene === "marcus") && !evanNight()) || evanAtDinner();
// family dinner nights: Evan's at the table wherever dinner is (then home to bed)
const evanAtDinner = () => { const d = dinnerNow(dayKey(), sgHM()); return !!d && scene === d.host; };
function outside(){ return OUTDOOR.includes(scene); }
const bounds = () => TOWN_BOUNDS[scene] ? TOWN_BOUNDS[scene] : scene === "van" ? [182, 210, 338, 612] : scene === "village" ? [14, 150, W - 14, 598] : scene === "base" ? [14, 114, W - 14, HH - 14] : (scene === "lane" || scene === "vineyard" || scene === "orchard" || scene === "flowers") ? [14, 140, W - 14, HH - 14] : scene === "field" ? [14, 150, W - 14, HH - 14] : scene === "shore" ? [186, 140, W - 14, HH - 14] : [34, 168, W - 34, 612];

function setScene(id, at){
  const w = $("world"), from = scene; w.classList.add("fading");
  setTimeout(() => {
    if (S.sleep && id !== "room") S.sleep = null;
    scView = null; scSt.pick = null; scSt.dpick = null; evanSeat = null;
    scene = id; cam.snap = true; atSpot = null; boardOpen = false; shelfOpen = false; selPlot = null; openView = null; shopClosed = false; shedOpen = false; runOpen = false; wardOpen = false; bedOpen = false; journalOpen = false; scratchOpen = false; calmOpen = false; recOpen = false; clientsOpen = false; planOpen = false; revOpen = false; jarsOpen = false; deskOpen = false; kudosOpen = false; routOpen = false; trophyView = null; lettersOpen = false; vaultView = null; vyView = null; reviewOpen = false; kView = null; orView = null; fieldView = null; goalView = null; homeView = null; postOpen = false; healthOpen = false; newsOpen = false; keepSpot = null; petView = null; ccView = null; hfView = null; railOpen = false; fishSpot = null; woodsView = null; rondaView = null; kyotoView = null; ktSt = {}; jejuView = null; jjSt = {}; loftView = false; cinqueView = null; ctSt = {}; ghBed = null; millOpen = false; friView = null; vanView = null; resetNpcs();
    if (id === "post") fetchPost().then(() => { if (scene === "post") drawScene(); });
    const p = at || [260, 596];
    mel.x = mel.tx = p[0]; mel.y = mel.ty = p[1]; mel.path = []; maple.x = maple.tx = p[0] - 22; maple.y = maple.ty = p[1] + 2;
    if (id === "base") { evan.x = evan.tx = 300; evan.y = evan.ty = 360; }
    else if (townOf(id) || id === "vineyard" || id === "field" || id === "shore" || id === "bay" || id === "hfarm" || id === "hwoods" || id === "barn" || id === "hlane" || id === "honeysuckle" || id === "clover" || id === "van" || id === "scoopshop" || id === "scoopkitchen" || id === "scoopdip" || id === "cocoa" || id === "cocoakitchen" || id === "mumdad" || id === "marcus" || id === "cottage") { evan.x = evan.tx = p[0] + 26; evan.y = evan.ty = p[1] + 10; evan.run = false; evan.wait = 2; }
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
    if (townOf(id)) save();   // a day out: remember which screen of the town (reopening puts Mel back there)
    if (townOf(id) && evanHere() && (TOWNS[townOf(id)].evanScreen || {})[id]) setTimeout(() => evanSays(pick(TOWNS[townOf(id)].evanScreen[id])), 1400);
    else if (townOf(id) && evanHere()) setTimeout(() => { evanSays(pick(id === "rd_bridge" ? ["so HIGH", "Mama, hold hand", "big big hole!"] : id === "rd_plaza" ? ["pigeons!", "catch it!", "birdies, come back!"] : ["Spain!", "big birdies!", "it's SO sunny"]));
      if (id === "rd_bridge") { evan.tx = mel.x + 16; evan.ty = mel.y + 4; evan.target = "mel"; evan.wait = 6; } }, 1400);
    if (route.length) nextLeg();
    if (id === "base" && hungryCount(F) && !S.petNudge) { S.petNudge = true; setTimeout(() => speak("The chicks and bunnies are peeping for breakfast. Their run is by the garden.", 4500), 1400); }
    if (id === "room" && S.routSaid !== dayKey() && sgHM() < 12*60) { const st = todaysSteps().filter(x => !x.done), left = checklistLeft(); if (st.length || left) { S.routSaid = dayKey(); setTimeout(() => speak(st.length ? `${st[0].name}, today: ${st[0].text}.` : `${left} morning routine step${left > 1 ? "s" : ""} on the board.`, 5000), 1500); } }
    if (id === "hall" && F.trophyIntro) { const n = F.trophyIntro; F.trophyIntro = 0; setTimeout(() => speak(`${n} trophies are waiting for you out in the courtyard, through the archway.`, 6000), 1500); save(); }
    else if (id === "hall" && kudosCount() >= 3 && Date.now() - (F.kudosSeen || 0) > 7*864e5 && S.kudosSaid !== dayKey()) { S.kudosSaid = dayKey(); setTimeout(() => speak(`${kudosCount()} kind words out in the courtyard. Fancy a read?`, 5000), 1500); }
    if (id === "trophy") { fetchObjectives(); if (F.revTarget) loadRevenue().then(checkTrophies); setTimeout(() => speak(onPedestals(F).length ? "The courtyard. Look at all this. You did that." : "The courtyard. Your first trophy goes on a pedestal.", 4000), 900); }
    if (id === "orchard" || id === "flowers") orchardArrive(id);
    { const m = sgHM(); if (owns(F, "cellar") && wineClubOn(dayKey()) && m >= 12*60 && m < 21*60 && S.clubSaid !== dayKey() && id !== "cellar") { S.clubSaid = dayKey();
      setTimeout(() => speak(m < 18*60 ? "Wine club tonight at the cellar door, 6pm! Eight members are coming to taste and buy." : "The wine club's on at the cellar door right now! Pop in and host.", 6000), 2800); } }
    if (SCOOP_IN.includes(id) || id === "bay") scoopNow();   // catch up on arrival: sales, and anything the churner's finished
    if (id === "scoopshop" && trolleyOn(F)) setTimeout(trolleyHome, 900);   // wheeling the trolley back in puts it away
    if (id === "cocoa" && evanHere() && ccUp(cocoaState(F), "fountain")) setTimeout(() => evanSays(pick(["THE FOUNTAIN!! Can I put my hand in? Just one finger?", "Mama, it's a chocolate waterfall!", "Can we dip a strawberry? Pleeease?"])), 1400);
    if (id === "wineshop" && aperitivoNow(dayKey(), sgHM()) && S.aperoSaid !== dayKey()) { S.aperoSaid = dayKey(); setTimeout(() => speak("Friday aperitivo hour! The whole village is knocking off for a glass and a plate. Stand behind the counter: they tip.", 6000), 1200); }
    if (id === "cellar" && wineClubNow(dayKey(), sgHM())) setTimeout(() => speak("The wine club's here! Glasses clinking, everyone talking at once. Tap the tasting bar to host.", 5000), 1200);
    if (id === "marcus" && evanHere()) setTimeout(() => { evanSays(pick(["Uncle Marcus! Can I play Mario?", "Can we watch Spiderman? Pleeease?", "Game! Game! Can I play the game?"])); if (isHere("marcus")) setTimeout(() => npcSay("marcus", "Ha! Ask your mum, little man. Zeh? One level?"), 2200); }, 1500);
    if (id === "wineshop" && isHere("marcus") && isHere("angelina") && sgHM() >= 19*60 + 30 && S.dateSaid !== dayKey()) { S.dateSaid = dayKey(); setTimeout(() => speak("Marcus and Angellina are on a date night at the middle table. Act natural.", 5000), 1600); }
    { const dn = dinnerOn(dayKey()), m = sgHM(); if (dn && m >= 17*60 + 30 && m < dn.to && S.dinnerSaid !== dayKey()) { S.dinnerSaid = dayKey();
      setTimeout(() => speak(m < dn.from ? `Family dinner tonight at ${HOST_NAME[dn.host]}, 6:30! Tap the table when you get there.` : `Family dinner's on at ${HOST_NAME[dn.host]}! Everyone's at the table.`, 6000), 2600); } }
    if (id === "shore" && S.shoreSaid !== dayKey()) { S.shoreSaid = dayKey(); const fam = ["mum", "dad", "marcus", "angelina"].filter(isHere).map(n => NPCS.find(d => d.id === n).name);
      setTimeout(() => speak(`The foreshore. Sea breeze, Norfolk pines, and keep an eye out for dolphins.${fam.length ? ` ${fam.join(fam.length > 2 ? ", " : " and ").replace(/, ([^,]*)$/, " and $1")} ${fam.length > 1 ? "are" : "is"} out too.` : ""}`, 5500), 1200); }
    if (id === "field") { const ev = eventNow(dayKey(), sgHM()); if (ev && S.eventSaid !== dayKey()) { S.eventSaid = dayKey(); setTimeout(() => speak(ev.kind === "market" ? "It's the Sunday farmers market! Stalls all along the top, our wine stall with Ines, and Ma Ma's fruit and flowers." : ev.kind === "night" ? "The night market! Fairy lights, street food all along the top, and a jazz duo on the little stage." : "It's the field fair! Kites, face painting, lemonade. Evan's going to love this.", 6000), 1200); } }
    if (id === "market") speak(isHere("hana") ? "Welcome to the market! Hana's in. Have a browse." : NPCS.find(n => n.id === "hana").away, 4500);
  }, 220);
}
// route: legs of {scene, x, y, fn}
function go(target, x, y, fn){
  const legs = [];
  let cur = scene;
  if (townOf(outdoorOf(cur)) !== townOf(outdoorOf(target))) { speak(townOf(scene) ? `That's back in Honeybrook: head home first. The train's at ${TOWNS[townOf(scene)].n} station.` : "That's a train ride away: tickets at Honeybrook station.", 4500); return; }
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
  route = legs; atSpot = null; boardOpen = false; shelfOpen = false; shedOpen = false; runOpen = false; wardOpen = false; bedOpen = false; journalOpen = false; scratchOpen = false; calmOpen = false; recOpen = false; clientsOpen = false; planOpen = false; revOpen = false; jarsOpen = false; deskOpen = false; kudosOpen = false; routOpen = false; trophyView = null; lettersOpen = false; vaultView = null; vyView = null; reviewOpen = false; kView = null; orView = null; fieldView = null; goalView = null; homeView = null; postOpen = false; healthOpen = false; newsOpen = false; openView = null; nextLeg(); render();
}
function nextLeg(){
  const l = route[0]; if (!l || l.scene !== scene) return;
  walkTo(l.x, l.y); mel.force = true;
}
// Outdoors Mel walks round buildings and the pond (paths.js); indoors she goes straight.
function walkTo(x, y){
  const b = bounds(), to = [clamp(x, b[0], b[2]), clamp(y, b[1], b[3])];
  const pts = outside() || townRoom(scene) ? findPath(scene, [mel.x, mel.y], to, b) : [to];
  const first = pts.shift(); mel.tx = first[0]; mel.ty = first[1]; mel.path = pts;
}
function arriveSpot(id){
  atSpot = id;
  const ph = phase();
  if (id === "mydoor") { setScene("room", INNER.room.arrive); return; }
  if (scene === "cottage" && id === "tea") { orView = "tea"; sfx("paper", true); render(); return; }
  if (id === "dine") { sitForDinner(); return; }
  if (id === "bedroom") { const m = sgHM(), who = {cottage: "Ma Ma and Gong Gong", mumdad: "Mum and Dad", marcus: "Marcus and Angellina"}[scene] || "They";
    speak(m >= 23*60 || m < 6*60 + 30 ? `Shh. ${who} are fast asleep. See them in the morning.` : `${who}'s bedroom. Private! The door stays shut.`, 4000); render(); return; }
  if (id === "gdoor") { setScene("garage", INNER.garage.arrive); return; }
  if (id === "officedoor") { setScene("office", INNER.office.arrive); return; }
  if (id === "cdoor") { if (owns(F, "cellar")) setScene("cellar", INNER.cellar.arrive); else { goalView = "cellar"; sfx("paper", true); render(); } return; }
  if (scene === "garage" && (id === "scooter" || id === "car")) { goalView = owns(F, id) ? "garagepick" : id; sfx("paper", true); render(); return; }
  if (scene === "cellar" && id === "flight" && owns(F, "cellar") && wineClubNow(dayKey(), sgHM())) {   // hosting the wine club
    const first = S.clubHost !== dayKey(); if (first) { S.clubHost = dayKey(); gainXp(3); act("cheer"); save(); }
    const here = clubMembers(dayKey()).filter(isHere);
    here.slice(0, 2).forEach((n, k) => setTimeout(() => npcSay(n, pick(["Ooh, what are we tasting first?", "Is this the new red? Pour me a big one.", "I'll take two bottles of that. No, three.", "Best club in the village, this.", "Cheers to the winemaker!"])), 900 + k*1800));
    speak(first ? "You're hosting the wine club! Pouring tastings, telling the story of each bottle. Everyone buys more when the winemaker's here." : "Another round for the club. The bottles are flying off the shelves.", 5500); render(); return; }
  if (scene === "cellar" && id === "flight") { const first = S.flightDay !== dayKey(); if (first) { S.flightDay = dayKey(); gainXp(2); save(); }
    speak(first ? "A tasting flight: a splash of each of your wines, lined up on the bar. Honestly? They're good." : "Another little pour. Just to be sure.", 4500); render(); return; }
  if (scene === "marcus" && id === "games") { marcusGames(); return; }
  if (id === "kiddoor") { setScene("kidroom", INNER.kidroom.arrive); return; }
  if (id === "routines") { routOpen = true; rv.edit = false; sfx("paper", true); render(); return; }
  if (id === "bed") { bedOpen = true; sfx("paper", true); render(); return; }
  if (id === "window") { const shut = F.curtains ? F.curtains === "closed" : (isDusk() || !!S.sleep); F.curtains = shut ? "open" : "closed"; sfx("paper", true); speak(shut ? "Curtains open. Hello, sky." : "Curtains closed. Cosy.", 2500); save(true); return; }
  if (id === "record") { recOpen = true; sfx("paper", true); render(); return; }
  if (id === "nook") { calmOpen = true; sfx("paper", true); render(); return; }
  if (id === "jars") { jarsOpen = true; jv = {mode: "shelf", blobs: [], note: ""}; sfx("paper", true); render(); return; }
  if (id === "journal") { journalOpen = true; sfx("paper", true); render(); return; }
  if (id === "wardrobe") { wardOpen = true; ward.error = ""; ward.pick = null; sfx("paper", true); speak("Let's see what's hanging in here today.", 3000); render(); return; }
  if (id === "digest") { shelfOpen = true; speak(digestReady() ? (isHere("juniper") ? "Juniper's waving a digest at you!" : "A fresh digest is ready on the shelf.") : "Digests are rationed. Like dessert.", 3500); render(); return; }
  if (id === "stall") { shopClosed = false; render(); return; }
  if (id === "status") { healthOpen = true; sfx("paper"); render(); return; }
  if (scene === "ohayo" && (id === "reactions" || id === "hellos")) { healthOpen = id; sfx("paper"); render(); return; }   // Ohayo's reactions board and hello chart
  if (id === "pobox") { postOpen = true; sfx("paper"); render(); fetchPost().then(() => { ctx(); drawScene(); }); return; }
  if (id === "board" && outside()) { openView = "quests"; speak("All of today's quests!", 3500); render(); return; }
  if (id === "board") { boardOpen = true; speak(outside() ? "All of today's quests!" : "Here's what needs doing in here.", 3500); render(); return; }
  if (ph === "clean" && scene === "garage" && id === "cupboard" && !S.wipe) { setSay("Wet wipes live here. Grab one!"); render(); return; }
  // Hestia: the cupboard holds the chores, the fridge the pantry and shopping list (not quests)
  if ((scene === "home" || scene === "garage") && (id === "cupboard" || id === "fridge") && !(ph === "task" && placeOf(remaining()[0]) === scene && spotOf(remaining()[0]) === id && !S.arrived[remaining()[0].id])) {
    homeView = id === "fridge" ? "fridge" : "chores"; sfx(id === "fridge" ? "tap" : "paper"); render(); return; }
  if (ph === "task") {
    const t = remaining()[0];
    if (placeOf(t) === scene && spotOf(t) === id && !S.arrived[t.id]) { S.arrived[t.id] = true; setSay(`Here at the ${spotObj(scene, id).name.toLowerCase()}. First tiny step…`); save(); return; }
  }
  if (scene === "office" && id === "desk") { deskOpen = true; sfx("paper", true); render(); loadDesk(false, () => { if (deskOpen) ctx(); }); return; }   // calendar and both inboxes
  if (scene === "bank" && /^vault\d$/.test(id)) { bv.slot = +id.slice(5); bv.mode = jarAt(bv.slot) ? "jar" : "setup"; bv.form = null; bv.amt = ""; vaultView = "jar"; sfx("paper", true); render(); return; }
  if (scene === "bank" && id === "counter") { vaultView = "overview"; sfx("paper", true); if (!npcSay("opal", pick(["Here's your passbook. Every vault at a glance.", "Lovely to see you! Shall we check on your jars?", "Your jewels are all accounted for."]))) speak("Opal's passbook is on the counter.", 3000); render(); return; }
  if (id === "trophydoor") { setScene("trophy", INNER.trophy.arrive); return; }
  if (id === "kdoor") { setScene("kitchen", INNER.kitchen.arrive); return; }
  if (id === "gkdoor") { setScene("scoopkitchen", INNER.scoopkitchen.arrive); return; }
  if (scene === "scoopshop" && id === "gtables") { sitAt(SHOP_SEATS); return; }
  if (id === "ckdoor") { setScene("cocoakitchen", INNER.cocoakitchen.arrive); return; }
  if (scene === "cocoa" && id === "ctables" && workshopGroup(dayKey()).length && sgHM() >= 14*60 && sgHM() < 16*60) { speak("The bonbon workshop's on! Six makers at the tables, piping ganache and arguing about sprinkles. You show them how to temper.", 5500); gainXp(1);
    if (evanHere()) setTimeout(() => evanSays(pick(["Can I make one? I'll make a dinosaur one!", "I'm helping! *licks spoon*", "Mine has sprinkles AND more sprinkles."])), 1500); render(); return; }
  if (scene === "cocoa" && id === "ctables") { sitAt(SHOP_SEATS); return; }
  if (scene === "van" && id === "vboard") { vanView = "board"; sfx("paper", true); render(); return; }
  if (scene === "van" && id === "vbed") { speak(pick(["You stretch out under the pop-top. Stars through the roof window. Bliss.", "A little lie-down. Maple curls up at your feet.", "The quietest bed in Honeybrook."]), 4500); if (evanHere()) setTimeout(() => evanSays(pick(["Can we sleep in the van tonight? PLEASE?", "This is my bed now.", "It's like a tiny house!"])), 1200); render(); return; }
  if (scene === "barn" && (id === "extractor" || id === "crock" || id === "press" || id === "cave")) { hfView = id; hfState(F); sfx("paper", true);
    if (id === "cave" && isHere("elena")) npcSay("elena", pick(["Turn them every morning. They like the attention.", "Smell that? That's a cheese thinking."]));
    else if (id === "press" && isHere("elena")) npcSay("elena", "Name it something nice. A wheel with a good name ages better. Everyone knows that.");
    render(); return; }
  if (COCOA_IN.includes(scene)) { ccView = {ccounter: "counter", barwall: "wall", case: "case", pantry: "pantry", bonbon: "bonbon", sacks: "sacks", roaster: "roaster", grinder: "grinder", slab: "slab", moulds: "moulds"}[id] || null;
    if (ccView) { cocoaNow(); sfx("paper", true); if (id === "ccounter" && isHere("amara")) npcSay("amara", pick(["Hi boss! The wall's looking good.", "Want a taste? I saved you a broken one.", "Dark's flying today."])); render(); return; } }
  if (id === "gddoor") { if (hasUp(scoopState(F), "dip")) { setScene("scoopdip", INNER.scoopdip.arrive); setTimeout(() => speak("Warm chocolate and a whole shelf of sprinkles. Dangerous.", 3500), 900); } else { scView = "upgrade"; sfx("paper", true); render(); } return; }
  if (SCOOP_IN.includes(scene)) { scView = {gcounter: "counter", gmenu: "menu", gfridge: "fridge", gfreezer: "freezer", gboard: "batch", gbench: "bench", gupgrades: "upgrade", gpots: "pots", gtops: "tops", gdipbar: "dipbar"}[id] || null;
    if (scView) { scSt.pick = null; scSt.dpick = null; scSt.made = null; scSt.swap = null; scoopNow(); sfx("paper", true); if (id === "gcounter" && isHere("sofia")) npcSay("sofia", pick(["Hi Mel! What'll it be?", "On the house, boss. Which one?", "The new one's going fast!"])); render(); return; } }
  if (scene === "kitchen") { kView = id; sfx("paper", true); render(); return; }
  if (scene === "wineshop") { vyView = {wshelf: "shelf", wcounter: "counter", hbox: "box", tasting: "tasting", menu: "menu"}[id] || null;
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
  if (townOf(scene)) { townSpot(id); return; }
  if (id === "plot3" || id === "plot4") { speak(v.line, 4000); render(); return; }
  if (id === "olive") { vyView = "olive"; sfx("paper", true); render(); return; }
  if (id === "bonfire") { if (bonfireNow(dayKey(), sgHM())) { friView = "fire"; sfx("paper", true); if (evanHere() && !evanNight()) setTimeout(() => evanSays(pick(["marshmallow! please!", "it's so warm!", "fire! big fire!"])), 1200); }
    else speak(isFri() && sgHM() < 19*60 ? "The bonfire's lit at seven tonight. Bring the family." : "Your firepit. On Friday nights the family come round for a bonfire, 7 to 10.", 4500); render(); return; }
  if (id === "fishvan") { if (vanNow(dayKey(), sgHM())) { friView = "van"; sfx("paper", true); } else speak("Sal's fish van parks here on Friday evenings, five till ten.", 4000); render(); return; }
  if (id === "kitefly") { flyKite(); return; }
  if (/^bm\d$/.test(id) || id === "kites") { if (!bayMarketNow(dayKey(), sgHM())) { speak("The Friday market's packed away. It's on Fridays, 4:30 to 7:15, here on the field.", 4000); render(); return; } friView = id; sfx("paper", true); render(); return; }
  if (id === "screen") { if (!movieNow(dayKey(), sgHM())) { render(); return; } mel.sitting = true; nodes.mel.classList.add("sit"); sfx("paper", true); gainXp(S.movieDay !== dayKey() ? 1 : 0); S.movieDay = dayKey();
    speak(`Movie night: "${filmOf(dayKey())}". Blankets, the dark, the whole village laughing at the same bits.`, 6000); if (evanHere() && !evanNight()) setTimeout(() => evanSays(pick(["shh Mama, it's starting!", "is it a fox? IT'S A FOX!", "popcorn please?"])), 2000); render(); return; }
  if (id === "popcorn") { if (!movieNow(dayKey(), sgHM())) { render(); return; } if (F.coins < 3) { speak("Popcorn's 3 coins.", 2500); return; } F.coins -= 3; addInv("popcorn", 1); sfx("pop"); speak("A paper cone of popcorn, still warm. (It's in your backpack: give it to someone, or Evan.)", 4500); save(); render(); return; }
  if (id === "grove") { vyView = "grove"; sfx("paper", true); if (isHere("marco")) npcSay("marco", pick(["Olives are coming on nicely.", "I'll put what I pick in the crate.", "Taste one? No! Not raw. Trust me."])); render(); return; }
  if (id === "windmill") { if (owns(F, "mill")) { setScene("mill", [260, 560]); setTimeout(() => speak(millState(F).press ? "The millstone's still turning..." : "The old mill. Smells of olives and old wood.", 3500), 600); }
    else { goalView = "mill"; sfx("paper", true); speak("The old windmill. Inside it's dusty... but you could make olive oil here.", 4000); render(); } return; }
  if (id === "toursign") { orView = "tours"; sfx("paper", true); render(); return; }
  if (id === "vanspot" && scene === "hlane") { if (!owns(F, "van")) { goalView = "van"; sfx("paper", true); speak("A gravel spot just big enough for a campervan...", 4000); } render(); return; }
  if (id === "timetable" && scene === "hlane") { railOpen = true; sfx("paper", true); render(); return; }
  if (id === "ranger") { woodsView = "ranger"; sfx("paper", true); if (isHere("wren")) npcSay("wren", pick(["Morning! Mind the roots on the top trail.", "Kettle's on. Have you been to the lookout yet?", "The pool's full of trout this week."])); render(); return; }
  if (id === "bikeswoods" || id === "bikesst" || id === "bikesvillage") { woodsView = "bike"; sfx("paper", true); render(); return; }
  if (TAXI_STOPS[id]) { woodsView = id; sfx("paper", true); render(); return; }
  if (id === "forage") { const r = forage(F, addInv); if (!r) { speak("You've foraged here today. Come back tomorrow: the woods need time to grow back.", 4000); render(); return; }
    sfx("chime"); gainXp(1); act("cheer"); speak(`${r.line} +${r.n} ${ITEMS[r.id].n.toLowerCase()} in your backpack.`, 5500); mprop("sparkle", mel.x, mel.y - 60, 1600); if (evanHere()) setTimeout(() => evanSays(pick(["I found one!", "In the basket!", "Can I eat it?"])), 1200); save(); render(); return; }
  if (id === "fishriver" || id === "fishlake" || id === "fishsea" || id === "fishpool" || id === "fishbay") { fishSpot = spotIn(scene); fishSt = {}; fishState(F); mel.dir = scene === "shore" || scene === "bay" ? -1 : 1; sfx("paper", true); render(); return; }
  if ((id === "bluebell" || id === "figtree") && scene === "hlane") { const g = letGuests(dayKey())[id === "bluebell" ? 0 : 1]; speak(`${VILLAGE[id].line}${g && g.length ? ` Staying this week: ${g.map(x => (NPCS.find(n => n.id === x) || {}).name).join(" and ")}.` : ""}`, 5000); render(); return; }
  if (scene === "hfarm" && id === "farmhouse") { hfView = "house"; hfState(F); sfx("paper", true); render(); return; }
  if (scene === "hfarm" && id === "stray") { const g = catchGoat(F); if (!g) { render(); return; } sfx("chime"); act("cheer"); gainXp(1); farmTrust(3); speak(`Got you, ${g.n}! Back in the paddock you go. Latch the gate tonight and nobody gets out.`, 5000); if (evanHere()) setTimeout(() => evanSays("The goat ran away! I helped catch it!"), 1200); save(); drawScene(); render(); return; }
  if (scene === "hfarm" && (id === "cows" || id === "goats" || id === "hives" || id === "fstand")) { hfView = id === "fstand" ? "stand" : id; hfState(F); sfx("paper", true);
    if (id === "hives" && isHere("felix")) npcSay("felix", fullHives(hfState(F)).length ? "There's honey ready! Here, take the veil." : "Not quite ready. The bees are still busy.");
    else if ((id === "cows" || id === "goats") && isHere("elena")) npcSay("elena", pick(id === "cows" ? ["Daisy first, she insists.", "Mind Mochi's tail. It has opinions."] : ["Keep your shoelaces away from Toffee.", "Pepper! Out of the bucket!"]));
    if (evanHere() && (id === "cows" || id === "goats")) setTimeout(() => evanSays(pick(id === "cows" ? ["MOO! Mama, the cow said moo!", "Can I pat her? Is she soft?"] : ["The goat is eating my shoe!", "Baby goat! Can we take it home?"])), 1300);
    render(); return; }
  if (id === "farmshop") { orView = "shop"; orTab = null; sfx("paper", true); if (isHere("mama")) npcSay("mama", pick(["Take, take! Ma Ma picked them for you.", "Fresh this morning. Choose any.", "For you, no charge. You're my girl."])); render(); return; }
  if (id === "barrels") { vyView = "barrels"; sfx("paper", true); render(); return; }
  if (id === "vinestall") { vyView = "stall"; sfx("paper", true); render(); return; }
  if (id === "pswing" || id === "pslide" || id === "pseesaw" || id === "pround") { playground(id); return; }
  if (/^mstall\d$/.test(id)) { const st = stallAt(dayKey(), sgHM(), +id.slice(-1)); if (!st) { speak(eventNow(dayKey(), sgHM()) ? "Nobody's set up a stall there today." : "The stalls are packed away till the next market.", 3500); render(); return; }
    fieldView = id; orTab = null; sfx("paper", true); if (st.kind === "wine") { vineTick(); speak("Behind the stall. Shoppers stop by more while you serve.", 3500); }
    else if (st.kind === "scoop") { scSt.pick = null; scoopNow(); speak("Behind the cart. More people stop for a scoop while you're serving.", 3500); if (isHere("tomo") && !keeperAway(st, dayKey(), sgHM())) setTimeout(() => npcSay("tomo", pick(["Night market crowd loves the gelato. Look at that queue.", "Cones are flying. Grab a scoop, boss.", "The jazz makes people hungry. Good for us."])), 1200); }
    else if (st.kind === "cocoa") { cocoaNow(); speak("Behind the chocolate cart. More people stop while you're serving.", 3500); if (isHere("mateo") && !keeperAway(st, dayKey(), sgHM())) setTimeout(() => npcSay("mateo", pick(["Market people LOVE hot chocolate, even in the morning.", "Better than studying, boss.", "Ma Ma traded me a mango for a bar. Good deal?"])), 1200); }
    else if (st.kind === "orchard") { orchardTick(); if (isHere("mama")) npcSay("mama", pick(["Take, take! Ma Ma brought plenty.", "Everybody wants Ma Ma's fruit today.", "For you, free. For them, they pay!"])); }
    else if (isHere(st.id) && !keeperAway(st, dayKey(), sgHM())) npcSay(st.id, st.line);
    else speak("Nobody's minding this one just now. It's an honesty tin: pop your coins in.", 3500); render(); return; }
  if (id === "deck") { sitAt(DECK_SEATS); return; }
  if (id === "reno") { if (!owns(F, "cocoa")) { goalView = "cocoa"; sfx("paper", true); speak("The old shopfront. It would make a lovely chocolate shop...", 4000); } else speak(RENO_LINE, 6000); render(); return; }
  if (id === "hfreezer") { scoopNow(); scView = "honesty"; sfx("paper", true); render(); return; }
  if (id === "dbike") { scoopNow(); scView = "deliver"; scSt.vpick = null; sfx("paper", true); render(); return; }
  if (id === "lake" || id === "picnic" || id === "pitch") { fieldSpot(id); return; }
  if (id === "exlawn") { joinClass(); return; }
  if (id === "jazzhat") { tipBand(); return; }
  if (id === "suprack" || id === "homejetty") { goalView = "jetty"; sfx("paper", true); render(); return; }
  if (id === "ferry") { railOpen = "ferry"; tripPick = []; sfx("paper", true); render(); return; }   // round 127: the Jeju ferry's ticket board
  if (id === "wishtower") { const w = F.wish = F.wish || {n: 3}; if (w.day === dayKey()) { speak("You've added your stone today. The wish is in there now: it just needs time.", 4000); render(); return; }
    w.day = dayKey(); if (w.n < 9) w.n++; sfx("chime"); gainXp(1); speak(pick(["You find a flat black-ish pebble by the river, balance it on top, and make a wish. Don't tell anyone what it was.", "Clack. One more stone on the tower. A wish for today.", "Very carefully... there. The tower's a little taller, and so is the wish."]), 5000);
    if (evanHere() && !evanNight()) setTimeout(() => evanSays(pick(["my turn! my stone!", "wish wish wish", "don't let it fall, Mama!"])), 1800); save(); render(); return; }
  if (id === "boat") { if (owns(F, "boat")) startCruise(); else { goalView = "boat"; sfx("paper", true); render(); } return; }
  if (id === "dolphins") { mel.sitting = true; nodes.mel.classList.add("sit"); mel.dir = -1; sfx("paper", true);
    const m = sgHM(), morning = m >= 6*60 && m < 11*60;
    if (morning && S.dolphinDay !== dayKey()) { S.dolphinDay = dayKey(); gainXp(1); setTimeout(() => { speak(pick(["There! Dolphins, three of them, just past the jetty.", "A fin! Then another. The dolphins are out this morning."]), 5000); [0, 300].forEach((d, k) => setTimeout(() => mprop("heart", 90 + k*30, 220, 1800), d)); if (evanHere()) evanSays("DOLPHIN! Mama, dolphin!"); }, 2400); save(); }
    speak(morning ? "A sit on the bench, looking out to sea. The dolphins come by most mornings." : pick(["The sea's all sparkly. Nothing to do but look at it for a minute.", "Sea breeze. A pelican going past. A proper break."]), 4500); render(); return; }
  // an outdoor quest at home base (Evan outing at the swing, garden jobs at the shed, a walk by the pond)
  if (scene === "base" && phase() === "task") { const t = remaining()[0];
    if (placeOf(t) === "base" && spotOf(t) === id && !S.arrived[t.id]) { S.arrived[t.id] = true; setSay(`Here at the ${v.name.toLowerCase()}. First tiny step…`); save(); return; } }
  if (id === "swing") { evan.tx = 112 + rnd(-4, 4); evan.ty = 302; evan.run = true; evan.wait = 6; setTimeout(() => evanSays(pick(["wheee!", "push me!", "higher!"])), 900); speak(v.line, 3500); render(); return; }
  if (id === "letterbox" && lettersArrived().length) { lettersOpen = true; lv.mode = "home"; sfx("paper"); speak("Post! Letters for you.", 3000); render(); return; }
  if (id === "letterbox") { const p = paperWaiting(); if (p) { sfx("paper"); openMail(p); } else speak(`Nothing in the letterbox. ${paperName()} comes each morning.`, 3800); render(); return; }
  if (id === "news") { newsOpen = true; const g = goodNews(), fresh = g && F.goodRead !== g.at; if (g) F.goodRead = g.at; sfx("paper"); speak(fresh ? "Pancake the village dog wags hello. Fresh good news this morning!" : "Pancake opens one eye, thumps a sleepy tail, and goes back to napping.", 4500); save(true); return; }
  if (id === "cacao") { const c = cocoaState(F), h = Math.max(1, Math.round(((c.treeAt || Date.now()) + 2*864e5 - Date.now() - (globalThis.__mapleOffset || 0))/36e5));
    speak(`Ma Ma's cacao tree, heavy with pods. She picks them and sends a sack of beans to the Cocoa Room's kitchen every two days: the next in about ${h} hour${h === 1 ? "" : "s"}.`, 5500); if (isHere("mama")) setTimeout(() => npcSay("mama", pick(["Ma Ma talk to it every morning. That's why so many pods!", "Chocolate tree! Who knew can grow here?"])), 1500); render(); return; }
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
const serving = () => (scene === "wineshop" && atSpot === "wcounter") || (scene === "field" && /^mstall\d$/.test(atSpot || "") && (stallAt(dayKey(), sgHM(), +atSpot.slice(-1)) || {}).kind === "wine");
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
  const out = sellTick(F, {serving: scene === "wineshop" && serving(), stall: scene === "field" && serving(), club: scene === "cellar" && wineClubNow(dayKey(), sgHM()), harvest: (festivalOn(dayKey()) || {}).id === "harvest"});
  // Pilar runs the kitchen on her shifts (tells Mel what she's done only while Mel's in there with her)
  if (whereIs("pilar") === "kitchen") { const done = cookTick(F, dayKey()); if (done.length) { save(); if (scene === "kitchen" && !quietNow() && $("panel").hidden) speak(cookLine(done), 5500); } }
  // at closing, leftover tapas of the day go to the staff for dinner
  const note = staffDinner(F, dayKey(), sgHM());
  if (note) { save(); if (!quietNow()) setTimeout(() => speak(staffLine(note), 7000), out && out.mins >= 30 ? 9000 : 1500); }
  if (!out) return;
  if (out.mins < 30) orderNote(out.orders, "Winery", !serving());
  const typing = !!(document.activeElement && document.activeElement.closest && document.activeElement.closest(".vyname, [data-vyprice]"));
  if (out.coins && serving()) { sfx("coin"); flash(`+${out.coins} coins from the wine shop`); }
  else if (out.coins && out.club && scene === "cellar") { sfx("coin"); flash(`+${out.coins} coins: the wine club`); }
  else if (out.mins >= 30 && out.coins) setTimeout(() => speak(`While you were away, villagers bought ${out.bottles ? `${out.bottles} bottle${out.bottles > 1 ? "s" : ""}` : ""}${out.bottles && out.glasses ? " and " : ""}${out.glasses ? `${out.glasses} glass${out.glasses > 1 ? "es" : ""}` : ""} of your wine. ${vineState(F).box} coins are waiting in the honesty box.`, 6500), 2500);
  if (typing) persist("fox"); else save(scene === "vineyard" || scene === "wineshop");
}
// A stall at the market or fair: what it sells (bought like at Hana's), or an activity for Evan (a kite, face paint)
// what a stall has out: the produce stall's vegetables and berries follow the season (the same as the seed packets at Hana's)
// A stall's goods today: its signature item (the first in tours.js) always, plus a different handful each market day
// from the rest of its range (data/stall-goods.js POOLS), picked by the date so the day's mix stays put
const stallItems = st => !st.produce ? todaysGoods(st) : Object.keys(CROPS).filter(c => !["tulip", "sunflower"].includes(c) && (c !== "chickpea" || (F.towns && F.towns.cinque)) && ITEMS[c] && !CROPS[c].herb && Object.values(ITEMS).some(it => it.crop === c && !it.greenhouse && (!it.seasons || it.seasons.includes(seasonOf(dayKey())))));
function todaysGoods(st, day = dayKey()){
  const ev = eventOn(day), pool = [...(st.items || []).slice(1), ...(((POOLS[ev ? ev.kind : ""] || {})[st.id]) || [])].filter(id => ITEMS[id]);
  const n = Math.max(2, (st.items || []).length);
  return [...(st.items || []).slice(0, 1), ...pool.map(id => [hash(day + ":" + st.id + ":" + id), id]).sort((a, b) => a[0] - b[0]).slice(0, n).map(([, id]) => id)];
}
const stallPrice = id => ITEMS[id].price || (ITEMS[id].sell || 2) + 2;
function marketStallPanel(st){
  const ev = eventNow(dayKey(), sgHM()); if (!ev) return "";
  const who = (NPCS.find(n => n.id === st.id) || {name: "Someone"}).name;
  const away = keeperAway(st, dayKey(), sgHM());
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>${esc(st.n)}</h2><p class="sub">${esc(who)}'s stall at the ${esc(ev.name.toLowerCase())}. ${away ? `${esc(who)}'s off wandering the market, so it's on the honesty tin: take what you like and pop the coins in.` : `"${esc(st.line)}"`}</p>`;
  const items = stallItems(st);
  if (items.length) h += `<div class="items shop">${items.map(id => itemBtn(id, `<b>${stallPrice(id)}</b> ${icon("coin", 13)}${ITEMS[id].to ? ` · for ${giftNames(ITEMS[id].to)}` : ""}`, F.coins < stallPrice(id), F.inv[id] ? `<span class="cnt">×${F.inv[id]}</span>` : "")).join("")}</div><p class="muted">You have ${F.coins} coins.${st.produce ? " Handy when the garden's between harvests: it all goes to the kitchen or to Maple." : ""}</p>`;
  if (st.decor) h += `<div class="items shop">${st.decor.map(id => { const d = DECOR[id], own = F.decorOwned[id], on = own && F.decor[d.slot] === d.val;
    return `<button class="item" data-decor="${id}" ${!own && F.coins < d.price ? "disabled" : ""}><span class="e">${icon(d.ico, 34)}</span><span class="n">${esc(d.n)}</span><span class="c">${on ? (d.where === "room" ? "in your room" : "in your home") : own ? "tap to use" : `<b>${d.price}</b> ${icon("coin", 13)}`}</span></button>`; }).join("")}</div><p class="muted">Bought once, kept forever. You have ${F.coins} coins.</p>`;
  if (st.act) h += `<div class="actions"><button class="btn primary" data-fair="${st.act}" ${evanHere() ? "" : "disabled"}>${st.act === "kite" ? "Get Evan a kite (3 coins)" : "Face paint for Evan (3 coins)"}</button></div>${evanHere() ? "" : `<p class="muted">Bring Evan along for this one.</p>`}`;
  return h + `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
}
function fairActivity(k){
  if (!evanHere() || F.coins < 3) return; F.coins -= 3; gainXp(1); sfx("chime"); fieldView = null; goalView = null; ctx();
  if (k === "kite") { evan.tx = 200; evan.ty = 420; evan.run = true; evan.wait = 10; setTimeout(() => evanSays(pick(["kite! up up!", "it's flying!", "look Mama!"])), 900); speak("A red kite for Evan. He's running with it and it's actually flying. Mostly.", 5000); }
  else { setTimeout(() => evanSays(pick(["I'm a tiger! RAWR", "butterfly!", "dinosaur face!"])), 800); speak("Face paint for Evan. He chose a tiger and won't stop roaring.", 5000); }
  [0, 300].forEach((d, k2) => setTimeout(() => mprop("heart", evan.x + (k2 - .5)*20, evan.y - 44, 1800), d)); save(true);
}
// The Scoop Shack: the shop ticks along (customers buying) whenever Mel's anywhere in the village
const SHOP_SEATS = [[87, 518], [173, 518], [227, 518], [313, 518], [367, 512], [453, 512]];
// Mel's at the Scoop Shack's night market cart (stall place 8), scooping
const atCart = () => scene === "field" && atSpot === "mstall8" && (stallAt(dayKey(), sgHM(), 8) || {}).kind === "scoop";
// delivery orders (round 137): a little note now and then as Tomo pedals one round (not while Mel's been away)
const ORDER_WHO = ["hana", "okada", "juniper", "bo", "lin", "opal", "theo", "farid", "mei", "felix", "elena", "amara", "lila", "noor", "wren", "mum", "dad", "marcus", "angelina", "darren", "mama", "gonggong"];
function orderNote(orders, shop, till){
  if (!orders || !orders.length || Date.now() - (S.orderAt || 0) < 150000) return; S.orderAt = Date.now();
  const o = orders[orders.length - 1], names = ORDER_WHO.map(id => NPCS.find(n => n.id === id)).filter(Boolean), who = names.length ? pick(names).name : "A neighbour";
  const where = o.picnic ? ` to a picnic on ${pick(["the field", "the foreshore", "the edge of the woods"])}` : pick([" to their door", " to the town square", " round to the lane", ""]);
  sfx("coin"); flash(`${shop} order: ${who}, ${o.what}${where} (+${o.coins}${till ? " in the till" : ""})`);
}
// the ice cream trolley (round 137): put it away (unsold scoops back in the freezer, unless they've melted)
function trolleyHome(){ const r = returnTrolley(F); if (!r) return; sfx(r.melted ? "paper" : "chime");
  speak(`Trolley's back${r.n ? `: ${r.n} sold, ${r.coins} coins` : ""}. ${r.back ? `${r.back} scoop${r.back === 1 ? "" : "s"} back in the freezer.` : r.melted ? `The last ${r.melted} scoop${r.melted === 1 ? "" : "s"} had melted, sadly.` : "Sold out!"}`, 6000); save(); }
// someone tapped while Mel's pushing the trolley outdoors in Honeybrook: do they want one? -> true if it was an offer
function trolleyOffer(id){
  const def = NPCS.find(n => n.id === id), fam = FAMILY_ALL.includes(id); if (!def && !fam) return false;
  const r = trolleySell(F, id, dayKey(), {kid: !!(def && def.kid) || id === "evan", family: fam, rainy: rainyOn(dayKey()), season: seasonOf(dayKey()), hm: sgHM()}); if (!r) return false;
  if (r.no) { npcSay(id, pick(["Not today, thanks!", "Ooh, tempting. Maybe later!", "I've just had lunch, sorry!", "Not for me, but it looks lovely."])); return true; }
  const what = r.items.map(([f, n]) => `a ${f} of ${n.replace(/ (Gelato|Sorbet)$/, "").toLowerCase()}`).join(" and ");
  npcSay(id, pick([`Yes please! ${what[0].toUpperCase() + what.slice(1)}.`, `Oh, perfect timing. ${what[0].toUpperCase() + what.slice(1)}, please!`, `Go on then: ${what}.`]));
  sfx("coin"); flash(`+${r.coins} coins: the trolley`); save(); return true;
}
function scoopNow(){
  lastScoop = Date.now();
  const s = scoopState(F), out = scoopTick(F, {serving: scene === "scoopshop" && atSpot === "gcounter", cart: atCart()});
  if (out.mins < 30) orderNote(out.orders, s.name, false);
  if (s.trolley && trolleyMelted(s) && !s.trolley.told) { s.trolley.told = true; speak("The trolley's ice packs have given up, and what's left has melted. Wheel it back to the Scoop Shack.", 6000); save(); }
  if (out.churned.length) { const r = out.churned[out.churned.length - 1], where = displayIds(s).includes(r.id) ? "in the display" : "in the freezer";
    if (SCOOP_IN.includes(scene) || scene === "bay") { sfx("chime"); speak(`Ding! ${out.churned.length > 1 ? `${out.churned.map(x => x.name).join(" and ")} are` : `${r.name} is`} frozen and ready, ${where}.`, 5000); }
    save(); if (scView) ctx(); }
  // round 136: the display's running low, and the day's takings at closing time
  { const news = scoopNews(s, dayKey(), sgHM()); news.forEach((t, i) => setTimeout(() => speak(t, 6000), 2500 + i*6500)); if (news.length) save(); }
  if (!out.coins && !out.mins) return;
  if (out.box && (scene === "bay" || out.mins >= 30)) setTimeout(() => speak(`The honesty freezer's been busy: ${s.box} coins waiting in its box.`, 4500), out.coins ? 6000 : 1500);
  if (out.cart && scene === "field") { sfx("coin"); flash(`+${out.cart} coins: the ${s.name} cart`); }
  else if (out.coins && (scene === "scoopshop" || scene === "bay")) { sfx("coin"); flash(`+${out.coins} coins: ${s.name}`); }
  else if (out.coins && out.mins >= 30) setTimeout(() => speak(`While you were away, ${s.name} sold ${out.n} ice cream${out.n > 1 ? "s" : ""}: ${out.coins} coins.`, 5000), 1500);
  if (out.coins || out.box || out.mins >= 5) save(); if (scView) ctx(); if (SCOOP_IN.includes(scene)) drawScene();
}
// sit on a free seat (the deck, or the shop's tables), with Evan beside if he's here; an ice cream in hand gets eaten
function sitAt(seats){
  const taken = npcActors().map(([, e]) => e).filter(e => e.kind === "npc");
  const free = seats.filter(([x, y]) => !taken.some(e => Math.hypot(e.x - x, e.y - y) < 14));
  if (!free.length) { speak("Every seat's taken. Busy day!", 3000); render(); return; }
  const near = free.map(p => [p, Math.hypot(p[0] - mel.x, p[1] - mel.y)]).sort((a, b) => a[1] - b[1])[0][0];
  mel.tx = near[0]; mel.ty = near[1]; mel.path = []; setTimeout(() => { mel.sitting = true; nodes.mel.classList.add("sit"); mel.dir = scene === "bay" ? -1 : 1; }, 700);
  const mate = evanHere() && free.find(p => p !== near && Math.hypot(p[0] - near[0], p[1] - near[1]) < 70);
  if (mate) evanSeat = {x: mate[0], y: mate[1], scene};
  const cone = S.cone && Date.now() < S.cone.until;
  speak(cone ? (scene === "bay" ? "Ice cream on the deck, the whole foreshore in front of you. Bliss." : "A little sit with an ice cream. Lovely.") : scene === "bay" ? "A seat on the deck. The dolphins might come by." : "A seat by the window.", 4000);
  if (mate && cone) setTimeout(() => evanSays(pick(["mine's melting!", "yummy!", "Mama, taste mine!"])), 1800);
  render();
}
// a free ice cream at the counter: Mel has one (and Evan, if he's here)
function haveIceCream(rid){
  const r = eatOne(F, rid); if (!r) return;
  S.cone = {until: Date.now() + 4*M, col: r.col}; if (evanHere() && eatOne(F, rid) !== null) S.evanHold = {k: "icecream", until: Date.now() + 4*M};
  scView = null; scSt.pick = null; if (fieldView === "mstall8") fieldView = null; ctx(); sfx("chime"); act("cheer"); mprop("heart", mel.x, mel.y - 60, 1600);
  if (S.iceDay !== dayKey()) { S.iceDay = dayKey(); gainXp(1); }
  speak(`${r.name}! ${evanHere() ? "Evan's got one too and it's already on his nose." : "Find a seat, or take it for a walk along the foreshore."}`, 5000);
  if (evanHere()) setTimeout(() => evanSays(pick(["ICE CREAM!!", "yummy yummy!", "it's so cold!"])), 900);
  save(); render();
}
// the delivery bike: Tomo pedals one round to someone in the family, and a thank-you note comes back
const deliverTo = () => FAMILY_ALL.map(w => [w, GIFT_NAME[w]]);
function deliver(w){
  const it = takeAway(F, scSt.vpick, FORMATS[scSt.vfmt] ? scSt.vfmt : "cone"); if (!it) return;
  const id = Object.keys(ITEMS).find(k => ITEMS[k] === it);
  addInv(id, -1); F.fam.gifts[w] = (F.fam.gifts[w] || 0) + 1; gainXp(1);
  F.thanks = [...(F.thanks || []), {id: `thanks-${w}-${Date.now()}`, who: w, item: id, at: Date.now() + 10*M}].slice(-30);
  sfx("chime"); flash(`On its way to ${GIFT_NAME[w]}`); speak(`Tomo's pedalling a ${it.n.toLowerCase()} over to ${GIFT_NAME[w]} in the cool box. Watch your mailbox for a thank-you note.`, 5000);
  scSt.vpick = null; scView = null; save(); ctx(); render();
}
// The Cocoa Room: beans to bars in the kitchen, bars off the wall at the counter; ticks along like the Scoop Shack
function cocoaNow(){
  if (!owns(F, "cocoa")) return; lastCocoa = Date.now();
  const out = cocoaTick(F, {serving: scene === "cocoa" && atSpot === "ccounter", cart: scene === "field" && atSpot === "mstall9"});
  if (out.mins < 30) orderNote(out.orders, cocoaState(F).name, false);
  if (out.cart && scene === "field") { sfx("coin"); flash(`+${out.cart} coins: the ${cocoaState(F).name} cart`); }
  if (out.workshop) setTimeout(() => speak(`The Saturday workshop's done: six happy bonbon makers, ${out.workshop} coins.`, 5000), 1500);
  if (out.tree && COCOA_IN.includes(scene)) speak("Ma Ma's sent a sack of beans from the cacao tree. They're with the others in the kitchen.", 4500);
  if (out.coins && (scene === "cocoa" || scene === "bay")) { sfx("coin"); flash(`+${out.coins} coins: ${cocoaState(F).name}`); }
  else if (out.coins && out.mins >= 30) setTimeout(() => speak(`While you were away, ${cocoaState(F).name} sold ${out.n} bar${out.n > 1 ? "s" : ""}: ${out.coins} coins.`, 5000), 2500);
  const hd = out.hand; if (hd && (hd.pots || hd.bars) && out.mins >= 30) setTimeout(() => speak(`Mateo's been busy: ${hd.pots} pot${hd.pots === 1 ? "" : "s"} tempered${hd.res ? `, ${hd.res} pieces onto the bonbon shelf` : ""}${hd.bars ? `, ${hd.bars} bars on the wall` : ""}${hd.sacks ? `, ${hd.sacks} sack${hd.sacks === 1 ? "" : "s"} of beans bought (${hd.spent} coins)` : ""}.`, 6000), out.coins ? 8000 : 2500);
  else if (hd && hd.pots && COCOA_IN.includes(scene) && isHere("mateo")) npcSay("mateo", hd.res ? "Another pot tempered. Some on your bonbon shelf!" : "Pot tempered. More bars for the wall.");
  if (out.done === "grind" && readyPot(cocoaState(F)) !== undefined && COCOA_IN.includes(scene)) speak("Ding! The grinder's done: a pot of chocolate, ready to temper on the marble slab.", 4500);
  if (out.coins || out.done || out.mins >= 5) save(); if (ccView) ctx(); if (COCOA_IN.includes(scene)) drawScene();
}
function wireCocoa(c){
  const re = () => { save(); ctx(); drawScene(); };
  c.querySelectorAll("[data-cc]").forEach(b => b.onclick = () => { const k = b.dataset.k, n = +b.dataset.n, a = b.dataset.cc;
    if (a === "beans") { if (buyBeans(F, n)) { sfx("coin"); flash(`${n} sack${n > 1 ? "s" : ""} of cacao beans`); } }
    else if (a === "roast") { if (startRoast(F)) { sfx("paper", true); speak("Beans in the roaster. Ten minutes, and the whole kitchen will smell of chocolate.", 4000); } }
    else if (a === "grind") { if (startGrind(F, k)) { sfx("paper", true); speak(`${CC_KINDS[k].n} in the stone grinder. It'll be ready in two hours.`, 4000); } }
    else if (a === "temper") { const kk = ccTemper(F); if (kk) { sfx("chime"); act("cheer"); gainXp(1); speak(`Spread, scrape, fold... it shines! 30 pieces of ${CC_KINDS[kk].n.toLowerCase()}.`, 4500); } }
    else if (a === "mould") { if (ccMould(F, k)) { sfx("chime"); flash(`10 ${CC_KINDS[k].n.toLowerCase()} bars on the wall`); gainXp(1); } }
    else if (a === "price") { const s = cocoaState(F); s.prices.bar = Math.max(1, Math.min(30, s.prices.bar + n)); }
    else if (a === "keep") { const s = cocoaState(F); s.keep[k] = Math.max(0, Math.min(120, s.keep[k] + n*6)); }
    else if (a === "plan") { const p = cocoaState(F).plan; if (k === "on" || k === "buy") p[k] = !p[k]; else if (k === "floor") p.floor = Math.max(0, Math.min(5000, p.floor + n*50)); else if (k === "hold") p.hold = Math.max(0, Math.min(20, p.hold + n)); sfx("tap");
      if (k === "on") speak(p.on ? "Mateo's back on the bar line." : "Mateo's taking a break from the bar line. The kitchen's all yours.", 3500); }
    else if (a === "ups" || a === "counter") { ccView = a; }
    else if (a === "buyup") { const line = buyCcUp(F, k); if (!line) return; sfx("coin"); act("cheer"); gainXp(2); speak(line, 5000); if (k === "cart") render(); }
    else if (a === "hprice") { const s = cocoaState(F); s.prices.hot = Math.max(1, Math.min(20, s.prices.hot + n)); }
    else if (a === "hot") { const kk = haveHot(F); if (!kk) return; sfx("chime"); mprop("heart", mel.x, mel.y - 60, 1600); speak(pick(["Hot chocolate, from your own chocolate. Pure comfort.", "Mmm. Thick, rich, a little bit of foam.", "The perfect rainy-day cup."]), 4000); if (evanHere()) setTimeout(() => evanSays(pick(["Can I have one too? With marshmallows?", "Mama, you have a chocolate moustache!"])), 900); }
    else if (a === "grand") { const id = packGrand(F); if (!id) return; sfx("paper", true); flash(`${ITEMS[id].n} in your backpack`); }
    else if (a === "bprice") { const s = cocoaState(F); s.prices.bonbon = Math.max(1, Math.min(20, s.prices.bonbon + n)); }
    else if (a === "fill") { const got = stockPantry(F, k, n, b.dataset.src, orchState(F)); if (got) { sfx("tap"); flash(`+${got} on the fillings shelf`); } }
    else if (a === "take") { const got = unstockPantry(F, k, n, orchState(F)); if (got) { sfx("tap"); flash(got.to === "bag" ? `${got.n} back into your backpack` : `${got.n} back to Ma Ma's shelf`); } }
    else if (a === "shell") { ccSt.shell = k; ccSt.made = null; }
    else if (a === "sel") { ccSt.made = null; ccSt.sel = ccSt.sel.includes(k) ? ccSt.sel.filter(x => x !== k) : [...ccSt.sel, k].slice(0, 2); }
    else if (a === "bonbon" || a === "again") { const r0 = a === "again" ? bonbonOf(cocoaState(F), k) : null, out = r0 ? makeBonbons(F, r0.shell, r0.fills) : makeBonbons(F, ccSt.shell, ccSt.sel); if (!out) return;
      ccSt.sel = []; ccSt.made = out.r.id; ccSt.isNew = out.isNew; sfx("chime"); act("cheer"); gainXp(out.isNew ? 2 : 1);
      if (out.isNew) { [0, 250, 500].forEach((t, k2) => setTimeout(() => mprop("sparkle", mel.x + (k2 - 1)*22, mel.y - 60, 1600), t)); speak(`A new bonbon: ${out.r.name}! Twelve of them, ready for the display case.`, 5000); }
      else flash(`Another tray of ${out.r.name}`); }
    else if (a === "case") { if (!ccToggle(cocoaState(F), k)) return; sfx("tap"); }
    else if (a === "scoop") { const got = sendScoop(F, k); if (!got) return; sfx("paper", true); gainXp(1);
      speak(k === "dip" ? `${got} dips of house-made dark, off to the Scoop Shack's dip station. Cones dipped in it sell for more.` : `${got} bars of Cocoa Room chocolate, into the Scoop Shack's gelato fridge. Try it at the mixing bench!`, 5000); }
    else if (a === "wine") { const got = wineToPantry(F, k); if (!got) return; sfx("tap"); flash(`${got.wine}: 4 fillings on the shelf`); }
    else if (a === "pair") { const w = packPairing(F, k); if (!w) return; sfx("paper", true); flash(`Pairing box with ${w}, in your backpack`); speak("A bottle and four bonbons, ribboned together. Tap it in your backpack to choose who it's for.", 4500); }
    else if (a === "special") { const sp = makeSpecial(F); if (!sp) return; sfx("chime"); act("cheer"); gainXp(2); [0, 250].forEach((t, i) => setTimeout(() => mprop("sparkle", mel.x + (i ? 20 : -20), mel.y - 60, 1500), t)); speak(`${sp.make} ${sp.n.toLowerCase()}${sp.make > 1 && !/s$/.test(sp.n) ? "s" : ""} for ${sp.fest}! They'll sell beside the display case.`, 5000); }
    else if (a === "takesp") { if (!takeSpecial(F, k)) return; sfx("chime"); flash(`${ITEMS[k].n} in your backpack`); }
    else if (a === "eatbb") { const bb = eatBonbon(F, k); if (!bb) return; sfx("chime"); mprop("heart", mel.x, mel.y - 60, 1600); speak(`${bb.name}. Oh, that's good.`, 3500); if (evanHere() && eatBonbon(F, k)) setTimeout(() => evanSays(pick(["chocolate!!", "another one!", "mmm!"])), 900); }
    else if (a === "box") { const id = packBox(F, n); if (!id) return; sfx("paper", true); flash(`${ITEMS[id].n} in your backpack`); speak("Packed with a ribbon and in your backpack. Tap it there to choose who it's for.", 4500); }
    else if (a === "eat" || a === "give") { if (!takeBar(F, k, a === "give")) return; sfx("chime");
      if (a === "give") { flash(`${CC_KINDS[k].n} bar in your backpack`); speak("Wrapped and in your backpack. Tap it there to choose who it's for.", 4000); }
      else { mprop("heart", mel.x, mel.y - 60, 1600); speak(pick(["Snap! Your own chocolate. Perfect.", "It melts just right. You made this!", "From the bean. Mmm."]), 4000); if (evanHere() && takeBar(F, k, false)) setTimeout(() => evanSays(pick(["chocolate!!", "more Mama!", "mmm!"])), 900); } }
    re(); });
  const nf = c.querySelector("[data-ccname]"); if (nf) nf.onsubmit = e => { e.preventDefault(); const v = (nf.querySelector("input").value || "").trim().slice(0, 30); if (!v) return; cocoaState(F).name = v; speak(`The sign now says ${v}.`, 3500); re(); render(); };
}
// Wildflower Farm: hay, brushing, milking, honey, the farm stand
function wireFarm(c){
  const re = () => { save(); ctx(); drawScene(); };
  const nm = c.querySelector("#hfName"); if (nm) nm.oninput = () => { hfSt.name = nm.value; };
  const hn = c.querySelector("[data-hfname]"); if (hn) hn.onsubmit = e => { e.preventDefault(); const n = nameHive(F, hn.querySelector("input").value); if (n) { speak(`Your hive's called ${n} now. Felix paints it on the lid.`, 4000); re(); } };
  c.querySelectorAll("[data-hf]").forEach(b => b.onclick = () => { const a = b.dataset.hf, k = b.dataset.k;
    if (a === "feed") { const n = feedHerd(F, k); if (!n) return; sfx("tap"); gainXp(1); farmTrust(2); speak(k === "cows" ? "Hay in the rack, water in the trough. Three happy munchers." : "Hay for the goats. Pepper's already climbing the rack.", 4000); }
    else if (a === "brush") { const an = hfBrush(F, k); if (!an) return; sfx("chime"); gainXp(1); farmTrust(1); mprop("heart", mel.x, mel.y - 60, 1600); speak(an.line, 3500); }
    else if (a === "milk") { const r = milkOne(F, b.dataset.herd, k); if (!r.n) { speak(r.err, 3500); return; } sfx("paper", true); farmTrust(1); if (r.mood === 0) speak(`${r.a.n}'s a bit grumpy: hay, a brush and a clean stall, and she'll give more.`, 4500); else if (r.mood === 2) speak(`${r.a.n}'s a happy ${b.dataset.herd === "cows" ? "cow" : "goat"} today. A full bucket!`, 3500); flash(`+${r.n} ${giveName(r.gives)}: ${r.a.n}`); }
    else if (a === "milkall") { const n = milkHerd(F, k); if (n) farmTrust(2); if (!n) { speak("Nobody to milk: they've been done today, or need their hay first.", 4000); return; } sfx("chime"); gainXp(1); flash(`+${n} ${giveName(k === "cows" ? "milk" : "goatmilk")} in your backpack`); }
    else if (a === "honey") { const n = collectHives(F); if (!n) return; sfx("chime"); act("cheer"); gainXp(2); farmTrust(Math.ceil(n/2)); speak(`${n} jars of honey, golden and still warm from the sun. Felix keeps the rest for his stall.`, 5000); }
    else if (a === "buy") { if (!buyStand(F, k)) return; sfx("coin"); flash(`${giveName(k)} from the farm stand`); }
    else if (a === "spin") { const r = spinFrames(F); if (!r) return; sfx("chime"); act("cheer"); gainXp(1); speak(`Whirr, whirr... ${r.n} jar${r.n === 1 ? "" : "s"} of ${r.kind.n} honey, golden and still warm.`, 4500); }
    else if (a === "yog" || a === "yogall") { const n = makeYoghurt(F, a === "yogall"); if (!n) return; sfx("tap"); flash(`${n} pot${n === 1 ? "" : "s"} of yoghurt`); }
    else if (a === "muck") { if (!muckOut(F, k)) return; sfx("tap"); gainXp(1); farmTrust(2); speak(k === "cows" ? "Old straw out, fresh straw in. Daisy approves, loudly." : "The goat stalls, mucked out. Pepper immediately lies down in the clean straw.", 4000); }
    else if (a === "latch") { if (!latchGate(F)) return; sfx("tap"); farmTrust(1); speak("Click. The goat gate's latched for the night. Toffee looks betrayed.", 3500); }
    else if (a === "turn") { const n = turnWheels(F); if (!n) return; sfx("paper", true); gainXp(1); if (hfState(F).turnedDay !== dayKey()) { hfState(F).turnedDay = dayKey(); farmTrust(2); } speak(`${n} wheel${n === 1 ? "" : "s"} turned. They smell more like cheese every day.`, 3500); }
    else if (a === "comb") { if (!cutComb(F)) return; sfx("tap"); flash("A slab of honeycomb in your backpack"); }
    else if (a === "cream") { if (!creamHoney(F)) return; sfx("tap"); flash("A jar of creamed honey in your backpack"); }
    else if (a === "shelf") { const n = stockShelf(F, k, +b.dataset.n); if (!n) return; sfx("tap"); flash(`${n} on your shelf at the farm stand`); }
    else if (a === "req") { const r = finishRequest(F); if (!r) return; sfx("chime"); act("cheer"); gainXp(2); const who = r.who === "felix" ? "Felix" : "Elena"; speak(`${who} beams. "You're a star. Thank you!"`, 4500); if (isHere(r.who)) npcSay(r.who, pick(["You're a natural.", "What would we do without you?", "That's exactly what I needed."])); farmTrust(10); }
    else if (a === "ckind") { hfSt.kind = k; hfSt.name = ""; hfSt.sug = 0; }
    else if (a === "csug") { const ns = cheeseNames(F, hfSt.kind, Math.floor((Date.now() + (globalThis.__mapleOffset || 0))/864e5)); hfSt.sug = (hfSt.sug + 1) % Math.max(1, ns.length); hfSt.name = ns[hfSt.sug] || ""; sfx("tap"); }
    else if (a === "press") { const w = pressCheese(F, hfSt.kind, hfSt.name); if (!w) return; hfSt.name = ""; hfSt.sug = 0; sfx("chime"); act("cheer"); gainXp(2); speak(`${w.name} is pressed and on a shelf in the cave. Ripe in ${HF_CHEESES[w.kind].days} day${HF_CHEESES[w.kind].days === 1 ? "" : "s"}.`, 5000); }
    else if (a === "wheel") { const r = takeWheel(F, +k); if (!r) return; sfx("chime"); act("cheer"); gainXp(r.q === "excellent" ? 3 : 1); mprop("heart", mel.x, mel.y - 60, 1600);
      speak(`${r.w.name}: ${r.q === "excellent" ? "excellent! Elena actually gasps." : r.q === "good" ? "a good, honest cheese." : "a bit rustic. Still tasty. Turn the next one more often."} ${r.n} wedges in your backpack.`, 5500); }
    re(); });
}
// keepsakes: put one on a shelf, or take one down; pets: adopt (who, then where), pat, play with the owner, rename, move
function wireCompanions(c){
  const done = () => { save(); render(); drawScene(); };
  c.querySelectorAll("[data-keepat]").forEach(b => b.onclick = () => { const line = placeKeep(F, keepItem, b.dataset.keepat); if (!line) return; keepItem = null; sfx("chime"); speak(line, 4500); gainXp(1); done(); });
  c.querySelectorAll("[data-keepdown]").forEach(b => b.onclick = () => { const it = takeKeep(F, b.dataset.keepdown); if (!it) return; keepSpot = null; sfx("paper", true); flash(`${it.n} back in your backpack`); done(); });
  c.querySelectorAll("[data-adoptfor]").forEach(b => b.onclick = () => { adoptSt = {owner: b.dataset.adoptfor}; ctx(); });
  c.querySelectorAll("[data-adoptback]").forEach(b => b.onclick = () => { adoptSt = {}; ctx(); });
  c.querySelectorAll("[data-adoptat]").forEach(b => b.onclick = () => { const item = adoptItem, p = adoptPet(F, item, adoptSt.owner, b.dataset.adoptat); if (!p) return;
    adoptItem = null; adoptSt = {}; F.fam.gifts[p.owner] = (F.fam.gifts[p.owner] || 0) + 1; gainXp(2); sfx("chime"); act("cheer");
    const where = PET_HOMES[p.scene].n.replace(/ \(.*\)$/, ""), who = OWNER_NAME[p.owner];
    if (giftPos(p.owner)) { const line = petFill(`A ${PETS[p.kind].n}! I'm calling it {p}!`, p); if (p.owner === "evan") evanSays(line); else npcSay(p.owner, line); }
    else F.thanks = [...(F.thanks || []), {id: `thanks-${p.owner}-${Date.now()}`, who: p.owner, item, at: Date.now() + 10*M}].slice(-30);
    speak(`${p.name} the ${PETS[p.kind].n} is ${who}'s now, and lives at ${where}.${giftPos(p.owner) ? "" : ` ${who}'ll send a thank-you note.`} Tap ${p.name} there to say hello.`, 6000); done(); });
  const pc = () => companions(F).find(x => x.id === petView);
  c.querySelectorAll("[data-petdo]").forEach(b => b.onclick = () => { const p = pc(); if (!p) return; const [x, y] = petAt(p);
    if (b.dataset.petdo === "pat") { mprop("heart", x, y - 30, 1600); sfx("purr"); if (p.patDay !== dayKey()) { p.patDay = dayKey(); gainXp(1); } speak(petFill(["{p} leans into the pat.", "{p} looks very pleased with itself.", "A happy little wiggle from {p}."][Math.floor(Math.random()*3)], p), 3500); save(); return; }
    if (!giftPos(p.owner) || p.playDay === dayKey()) return;
    p.playDay = dayKey(); gainXp(2); [0, 300, 600].forEach((t, k) => setTimeout(() => mprop("heart", x + (k - 1)*14, y - 34, 1800), t)); sfx("chime");
    speak(playLine(p), 5000); setTimeout(() => { const l = ownerLine(p); if (p.owner === "evan") evanSays(l); else npcSay(p.owner, l); }, 1800); done(); });
  const nf = c.querySelector("[data-petname]"); if (nf) nf.onsubmit = e => { e.preventDefault(); const p = pc(), v = (nf.querySelector("input").value || "").trim().slice(0, 20); if (!p || !v) return; p.name = v; flash(`Say hello to ${v}`); done(); };
  const hs = c.querySelector("[data-pethome]"); if (hs) hs.onchange = () => { const p = pc(); if (!p || !PET_HOMES[hs.value]) return; p.scene = hs.value; p.spot = companions(F).filter(x => x.scene === hs.value && x !== p).length; speak(`${p.name} has moved to ${PET_HOMES[hs.value].n.replace(/ \(.*\)$/, "")}.`, 4000); done(); };
}
function wireScoop(c){
  const s = scoopState(F), re = () => { save(); ctx(); drawScene(); };
  c.querySelectorAll("[data-gpick]").forEach(b => b.onclick = () => { scSt.pick = b.dataset.gpick; ctx(); });
  c.querySelectorAll("[data-gback]").forEach(b => b.onclick = () => { scSt.pick = null; ctx(); });
  c.querySelectorAll("[data-geat]").forEach(b => b.onclick = () => haveIceCream(b.dataset.geat));
  c.querySelectorAll("[data-gtake]").forEach(b => b.onclick = () => { const it = takeAway(F, scSt.pick, b.dataset.gtake); if (!it) return; sfx("paper", true); flash(`${it.n} in your backpack`);
    speak(`One ${it.n.toLowerCase()} to give. It's in your backpack: tap it there to choose who it's for.`, 4500); scSt.pick = null; re(); });
  c.querySelectorAll("[data-gprice]").forEach(b => b.onclick = () => { const [k, d] = b.dataset.gprice.split(":"); s.prices[k] = Math.max(k === "special" ? 0 : 1, Math.min(30, s.prices[k] + +d)); re(); });
  c.querySelectorAll("[data-gspecial]").forEach(b => b.onchange = () => { const r = recipeOf(s, b.dataset.gspecial); if (r) { r.special = b.checked; re(); } });
  const nf = c.querySelector("[data-gname]"); if (nf) nf.onsubmit = ev => { ev.preventDefault(); const v = (nf.querySelector("input").value || "").trim().slice(0, 30); if (!v) return; s.name = v; speak(`The sign now says ${v}.`, 3500); re(); render(); };
  c.querySelectorAll("[data-gback]").forEach(b => b.onclick = () => { const [id, n] = b.dataset.gback.split(":"), got = unstockFridge(F, id, +n, orchState(F)); if (!got) return; sfx("tap"); flash(got.to === "bag" ? `${got.n} back into your backpack` : `${got.n} back to Ma Ma's shelf`); re(); });
  c.querySelectorAll("[data-gfill]").forEach(b => b.onclick = () => { const [from, id, n] = b.dataset.gfill.split(":"), got = stockFridge(F, id, +n, from, orchState(F)); if (!got) return; sfx("tap"); flash(`+${got} into the fridge`); re(); });
  c.querySelectorAll("[data-gsel]").forEach(b => b.onclick = () => { scSt.made = null; const id = b.dataset.gsel; scSt.sel = scSt.sel.includes(id) ? scSt.sel.filter(x => x !== id) : [...scSt.sel, id].slice(0, 4); ctx(); });
  c.querySelectorAll("[data-gmix]").forEach(b => b.onclick = () => { const out = discover(F, scSt.sel); speak(out.msg, 5500);
    if (out.recipe) { scSt.sel = []; scSt.made = out.recipe.id; sfx("chime"); act("cheer"); [0, 250, 500].forEach((t, k) => setTimeout(() => mprop("sparkle", mel.x + (k - 1)*22, mel.y - 60, 1600), t)); gainXp(2);
      if (isHere("tomo")) setTimeout(() => npcSay("tomo", pick(["Bellissimo! Can I taste?", "Never had that before. Never! Wonderful.", "I'll tell the deck about it."])), 1400); }
    re(); });
  // upgrades, the honesty freezer, the dip station and the delivery bike
  const up = () => { save(); ctx(); drawScene(); if (scene === "bay" || scene === "scoopshop") render(); };
  c.querySelectorAll("[data-gview]").forEach(b => b.onclick = () => { scView = b.dataset.gview; if (scView === "trolley") scSt.tsel = []; sfx("paper", true); ctx(); });
  // the ice cream trolley (round 137): pick up to three flavours, load up, head out; or put it away
  c.querySelectorAll("[data-gtsel]").forEach(b => b.onclick = () => { const id = b.dataset.gtsel, sel = scSt.tsel = scSt.tsel || []; if (sel.includes(id)) scSt.tsel = sel.filter(x => x !== id); else if (sel.length < TROLLEY.flavours) sel.push(id); sfx("tap"); ctx(); });
  c.querySelectorAll("[data-gtrolley]").forEach(b => b.onclick = () => {
    if (b.dataset.gtrolley === "go") { const tr = loadTrolley(F, scSt.tsel || []); if (!tr) return; const n = Object.values(tr.tubs).reduce((a, x) => a + x, 0); scView = null; sfx("chime"); flash(`Trolley loaded: ${n} scoops`);
      speak(`The cool box is packed: ${n} scoops, ice packs in. It's heavy, so take it slowly. Tap people outside to offer them a cup or a cone. Back within two hours, before the ice packs give up.`, 7000); save(); render(); return; }
    trolleyHome(); ctx(); });
  c.querySelectorAll("[data-gbuy]").forEach(b => b.onclick = () => { const line = buyUpgrade(F, b.dataset.gbuy); if (!line) return; sfx("chaching"); act("cheer"); gainXp(2);
    [0, 250, 500].forEach((t, k) => setTimeout(() => mprop("sparkle", mel.x + (k - 1)*22, mel.y - 60, 1600), t)); speak(line, 6000); scView = b.dataset.gbuy === "honesty" ? "honesty" : b.dataset.gbuy === "bike" ? "deliver" : "upgrade"; up(); });
  c.querySelectorAll("[data-gcollect]").forEach(b => b.onclick = () => { const n = collectBox(F); if (!n) return; sfx("chaching"); flash(`+${n} coins from the honesty freezer`); speak(`${n} coins from the honesty box. Thank you, neighbours!`, 3500); up(); });
  c.querySelectorAll("[data-gdipbuy]").forEach(b => b.onclick = () => { if (!buyDip(F, b.dataset.gdipbuy)) return; sfx("chaching"); flash(`${DIPS[b.dataset.gdipbuy].n} in its pot`); up(); });
  c.querySelectorAll("[data-gtopbuy]").forEach(b => b.onclick = () => { if (!buyTopping(F, b.dataset.gtopbuy)) return; sfx("chaching"); flash(`${TOPPINGS[b.dataset.gtopbuy].n} on the shelf`); up(); });
  c.querySelectorAll("[data-gdpick]").forEach(b => b.onclick = () => { scSt.dpick = b.dataset.gdpick; ctx(); });
  c.querySelectorAll("[data-gdback]").forEach(b => b.onclick = () => { scSt.dpick = null; ctx(); });
  c.querySelectorAll("[data-gdfmt]").forEach(b => b.onclick = () => { scSt.dfmt = b.dataset.gdfmt; ctx(); });
  c.querySelectorAll("[data-gddip]").forEach(b => b.onclick = () => { scSt.dip = b.dataset.gddip; ctx(); });
  c.querySelectorAll("[data-gdtop]").forEach(b => b.onclick = () => { scSt.top = b.dataset.gdtop === "none" ? null : b.dataset.gdtop; ctx(); });
  c.querySelectorAll("[data-gdmake]").forEach(b => b.onclick = () => { const give = b.dataset.gdmake === "give", dip = s.dips[scSt.dip] ? scSt.dip : "milk", top = scSt.top && s.tops[scSt.top] ? scSt.top : null;
    const out = makeDipped(F, scSt.dpick, scSt.dfmt === "waffle" ? "waffle" : "cone", dip, top, give); if (!out) return;
    if (give) { sfx("paper", true); flash(`${out.n} in your backpack`); speak("Wrapped in a napkin and into the cool pocket of your backpack. Tap it there to choose who it's for.", 4500); }
    else { S.cone = {until: Date.now() + 4*M, col: out.col}; sfx("chime"); act("cheer"); mprop("heart", mel.x, mel.y - 60, 1600); if (S.iceDay !== dayKey()) { S.iceDay = dayKey(); gainXp(1); }
      speak(`${out.name[0].toUpperCase() + out.name.slice(1)}. The chocolate's still setting. Eat fast!`, 5000); if (evanHere()) setTimeout(() => evanSays(pick(["I want chocolate one!", "sprinkles!! for me?", "Mama, share!"])), 1000); scView = null; }
    scSt.dpick = null; save(); ctx(); render(); });
  c.querySelectorAll("[data-gvpick]").forEach(b => b.onclick = () => { scSt.vpick = b.dataset.gvpick; ctx(); });
  c.querySelectorAll("[data-gvback]").forEach(b => b.onclick = () => { scSt.vpick = null; ctx(); });
  c.querySelectorAll("[data-gvfmt]").forEach(b => b.onclick = () => { scSt.vfmt = b.dataset.gvfmt; ctx(); });
  c.querySelectorAll("[data-gvto]").forEach(b => b.onclick = () => deliver(b.dataset.gvto));
  // the display: put a flavour out, take one off, or (when it's full) swap one in for another
  c.querySelectorAll("[data-gdisp]").forEach(b => b.onclick = () => { const id = b.dataset.gdisp, ids = displayIds(s);
    if (!ids.includes(id) && ids.length >= SLOTS) { scSt.swap = id; ctx(); return; }
    if (setDisplay(s, id)) { sfx("tap"); flash(ids.includes(id) ? `${recipeOf(s, id).name} back in the freezer` : `${recipeOf(s, id).name} in the display`); re(); } });
  c.querySelectorAll("[data-gswapout]").forEach(b => b.onclick = () => { const r = recipeOf(s, scSt.swap), out = recipeOf(s, b.dataset.gswapout);
    if (r && setDisplay(s, r.id, b.dataset.gswapout)) { sfx("tap"); flash(`${r.name} out, ${out.name} back in the freezer`); } scSt.swap = null; re(); });
  c.querySelectorAll("[data-gswapcancel]").forEach(b => b.onclick = () => { scSt.swap = null; ctx(); });
  c.querySelectorAll("[data-gmake]").forEach(b => b.onclick = () => { const r = makeTub(F, b.dataset.gmake); if (!r) return; scSt.sel = []; sfx("chime"); act("cheer"); mprop("sparkle", mel.x, mel.y - 60, 1600);
    flash(`${r.name}: into the churner`); speak(`${r.name} is in the churner: blending, then freezing. Twenty scoops, ready in an hour.`, 4500); re(); });
  c.querySelectorAll("[data-gplan]").forEach(b => b.onchange = () => { const id = b.dataset.gplan; s.plan.ids = b.checked ? [...s.plan.ids.filter(x => x !== id), id] : s.plan.ids.filter(x => x !== id); re(); });
}
// The night market's jazz duo: drop a couple of coins in the hat on the front of the stage
function tipBand(){
  const ev = eventNow(dayKey(), sgHM());
  if (!ev || ev.kind !== "night") { speak("The stage is empty. The jazz duo plays the night market, Tuesday and Thursday evenings.", 4000); render(); return; }
  if (F.coins < 2) { speak("Not even two coins! Next time.", 3000); render(); return; }
  F.coins -= 2; S.tips = (S.tips || 0) + 1; sfx("coin"); flash("-2 coins in the hat");
  [0, 250, 500].forEach((d, k) => setTimeout(() => mprop("heart", STAGE.x - 20 + k*20, STAGE.y - 70, 1800), d));
  speak(pick(["Clink! The bass player tips his hat back at you.", "Two coins in the hat. The keys player plays a little flourish just for you.", "\"Thank you! This next one's for the lady with the fox.\"", "Clink. The duo grin and slide into something slower."]), 4500);
  if (S.tips === 1) gainXp(1); save(); render();
}
// A family paddle off the foreshore: Mel (and Evan, if he's here) take boards out from the rack by the jetty for a
// minute, and any of the family on the foreshore paddle out too. Maple guards the towels. Tap the shore to come back.
let sup = null;   // {from: Singapore minutes when it started, until: ms, out: reached the water}
const SUP_BOARD = k => `<g class="supboard"><ellipse cx="0" cy="${-1*k}" rx="${22*k}" ry="${3.6*k}" style="fill:#7FB8E8;stroke:var(--line)" stroke-width="1"/><path d="M${-18*k} ${-1*k} h${36*k}" style="stroke:#FFFDF6" stroke-width=".9"/><path d="M${12*k} ${-30*k} l${5*k} ${32*k}" fill="none" stroke-width="1.6" style="stroke:#8A5A3A"/><path d="M${16*k} ${-2*k} l${2*k} ${8*k} l${3*k} ${-1*k} l${-2*k} ${-8*k}z" style="fill:#F3C969;stroke:var(--line)" stroke-width=".8"/></g>`;
[["mel", 1], ["evan", .62]].forEach(([id, k]) => { const b = document.querySelector(`#${id} .bob`); if (b) b.insertAdjacentHTML("beforebegin", SUP_BOARD(k)); });
// Mel's scooter (under her feet) and car (round her, her head above the roof line), shown while she's on the move outdoors
{ const b = document.querySelector("#mel .bob"); if (b) {
  // a hire bike (transport.js): a child seat on the back for Evan, a basket on the front for Maple
  b.insertAdjacentHTML("beforebegin", `<g class="rideBike" transform="translate(0 7)">${bikeArt("#5E8A5A")}</g>`);
  b.insertAdjacentHTML("afterend", `<g class="rideBike" transform="translate(0 7)" style="stroke:var(--line)" stroke-width="1"><g class="bikeEvan"><path d="M-22 -18 h10 v8 h-10z" style="fill:#3E6B8C"/><path d="M-22 -18 v-8" stroke-width="1.6"/><circle cx="-17" cy="-26" r="4.6" style="fill:var(--skin)"/><path d="M-21.6 -27 q4.6 -7 9.2 0" style="fill:var(--hair)"/><path d="M-22.6 -27.6 q5.6 -9 11.2 0z" style="fill:#F3C969"/><circle cx="-18.4" cy="-25.6" r=".7" style="fill:#2F2B28" stroke="none"/><path d="M-13 -14 l5 -1" stroke-width="1.6"/></g>
    <path d="M14 -24 h12 l-2 9 h-8z" style="fill:#C9A27E"/><path d="M15 -21 h10 M16 -18 h8" opacity=".5"/><g class="bikeMaple"><path d="M17 -27 l1 -6 l3 3z M25 -27 l-1 -6 l-3 3z" style="fill:var(--fox)"/><ellipse cx="21" cy="-26" rx="5" ry="4" style="fill:var(--fox)"/><path d="M17.5 -25 q3.5 3 7 0" style="fill:var(--cream)" stroke="none"/><circle cx="19.4" cy="-27" r=".7" style="fill:#2F2B28" stroke="none"/><circle cx="22.6" cy="-27" r=".7" style="fill:#2F2B28" stroke="none"/></g></g>`);
  // the ice cream trolley (round 137): a little pink push-cart in front of her, like the night market's but no parasol
  b.insertAdjacentHTML("afterend", `<g class="rideTrolley" style="stroke:var(--line)" stroke-width="1"><path d="M10 -22 l6 3" stroke-width="1.6" fill="none"/><rect x="15" y="-24" width="26" height="17" rx="2" style="fill:#F4C7CF"/><rect x="15" y="-24" width="26" height="4" rx="1.5" style="fill:#FFFDF6"/><path d="M15 -15 h26" stroke-width="2.2" style="stroke:#FFFDF6"/><path d="M24 -12 l2 5 l2 -5z" style="fill:#E8C48E"/><circle cx="26" cy="-13" r="2" style="fill:#F8D59A"/><path d="M32 -12 l2 5 l2 -5z" style="fill:#E8C48E"/><circle cx="34" cy="-13" r="2" style="fill:#C3E8B8"/><circle cx="19" cy="-3" r="3" style="fill:#2F2B28"/><circle cx="37" cy="-3" r="3" style="fill:#2F2B28"/></g>`);
  b.insertAdjacentHTML("beforebegin", `<g class="rideScoot" style="stroke:var(--line)" stroke-width="1"><rect x="-15" y="-3" width="30" height="3.4" rx="1.6" style="fill:#7FB8E8"/><circle cx="-12" cy="1" r="2.6" style="fill:#2F2B28"/><circle cx="12" cy="1" r="2.6" style="fill:#2F2B28"/><path d="M12 -3 l3 -26 M10 -29 h9" fill="none" stroke-width="2"/></g>`);
  // the cream convertible, roof down: Mel at the wheel, Maple in the back, Evan beside her when he's along (and awake)
  b.insertAdjacentHTML("afterend", `<g class="rideCar" style="stroke:var(--line)" stroke-width="1.1"><g class="carEvan"><circle cx="-21" cy="-26" r="5" style="fill:var(--skin)"/><path d="M-26 -27 q5 -8 10 -1" style="fill:#2A211D"/><circle cx="-22.5" cy="-25.5" r=".7" style="fill:#2F2B28" stroke="none"/></g>
    <path d="M-38 -22 l3 -8 l4 5z M-32 -23 l3 -7 l3 6z" style="fill:var(--fox)"/><ellipse cx="-32" cy="-19" rx="6" ry="4.6" style="fill:var(--fox)"/><path d="M-37 -17.5 q5 3 10 0" style="fill:#FFFDF6"/><circle cx="-34" cy="-20" r=".7" style="fill:#2F2B28" stroke="none"/>
    <path d="M-40 -4 v-12 q0 -4 4 -5 h56 l8 4 q4 2 4 6 v7z" style="fill:#F3E7C9"/><path d="M-38 -14 h58" opacity=".5"/><path d="M14 -21 l4 -9" style="stroke:#9CC3E0" stroke-width="2.2"/>
    <circle cx="-26" cy="-3" r="5" style="fill:#2F2B28"/><circle cx="16" cy="-3" r="5" style="fill:#2F2B28"/><circle cx="-26" cy="-3" r="2" style="fill:#CFC8BE"/><circle cx="16" cy="-3" r="2" style="fill:#CFC8BE"/><circle cx="29" cy="-11" r="1.6" style="fill:#F3C969"/></g>`); } }
function familyPaddle(){
  if (sup) return;
  const m = sgHM(); if (m >= 19*60 || m < 6*60) { speak("Too dark for paddling now. The boards will be here in the morning.", 3500); render(); return; }
  if (stormyOn(dayKey())) { speak("Choppy and rainy out there. Better on a sunny day.", 3500); render(); return; }
  sup = {from: m, until: Date.now() + 60000, out: false};
  route = []; atSpot = null; mel.path = []; mel.tx = 104; mel.ty = 372; mel.sitting = false; nodes.mel.classList.remove("sit"); nodes.mel.classList.add("sup"); sfx("paper", true);
  if (evanHere()) { evan.tx = 132; evan.ty = 404; evan.rk = "132,404"; evan.path = [[132, 404]]; evan.run = false; evan.wait = 99; evan.target = null; nodes.evan.classList.add("sup"); setTimeout(() => evanSays(pick(["I'm standing up! Look!", "wobbly! wobbly!", "paddle paddle!"])), 2500); }
  const fam = ["mum", "dad", "marcus", "angelina"].filter(isHere);
  speak(fam.length ? `Boards out! ${fam.map(n => NPCS.find(d => d.id === n).name).join(" and ").replace(/ and (?=.* and )/g, ", ")} ${fam.length > 1 ? "are" : "is"} paddling out with you.` : "Boards out! Off the jetty and onto the water. Maple's minding the towels.", 4500);
  setTimeout(() => { if (sup && scene === "shore") { speak("Dolphins! Right next to the boards. Don't fall in. Okay, maybe a little.", 4500); [0, 300, 600].forEach((d, k) => setTimeout(() => mprop("heart", 80 + k*24, 330, 1800), d)); if (fam.length) npcSay(fam[0], "Dolphin! Over there, look!"); } }, 20000);
  render();
}
// Paddling between the home jetty and the foreshore: the river, the lake and the stream join them. Board on, a blink,
// and Mel steps off by the other jetty (Evan and Maple too)
const JETTY = {shore: [216, 500], base: [150, 134]};
function paddleTo(dest){
  if (paddling || sup) return;
  const m = sgHM(); if (m >= 22*60 || m < 6*60) { speak("Too dark to paddle the river now. Walk tonight, paddle in the morning.", 3500); render(); return; }
  const kid = evanHere(), off = scene === "shore" ? [[104, 372], [132, 404]] : [[124, 84], [96, 88]]; paddling = true; route = []; atSpot = null; mel.path = []; mel.sitting = false;
  mel.x = mel.tx = off[0][0]; mel.y = mel.ty = off[0][1]; maple.x = maple.tx = off[0][0] + 6; maple.y = maple.ty = off[0][1] - 2; nodes.mel.classList.remove("sit"); nodes.mel.classList.add("sup");
  if (kid) { evan.x = evan.tx = off[1][0]; evan.y = evan.ty = off[1][1]; evan.rk = off[1].join(","); evan.path = [off[1]]; evan.run = false; evan.wait = 99; evan.target = null; nodes.evan.classList.add("sup"); }
  sfx("paper", true); speak(dest === "shore" ? (kid ? "Boards on! Evan's kneeling on his, Maple's on yours. Off down the river." : "Board on, Maple on the front. Off down the river.") : (kid ? "Boards on! Up the stream, across the lake and home." : "Board on. Up the stream and home."), 2500);
  setTimeout(() => {
    nodes.mel.classList.remove("sup"); nodes.evan.classList.remove("sup"); paddling = false;
    setScene(dest, JETTY[dest]);
    setTimeout(() => { if (evanHere()) { evan.x = evan.tx = JETTY[dest][0] + 26; evan.y = evan.ty = JETTY[dest][1] + 10; evan.run = false; evan.wait = 3; }
      speak(dest === "shore" ? "Out at the foreshore. Salty air, and the dolphins are about." : "Home! Boards back on the rack.", 3500); }, 450);
  }, 1300);
}
// The dolphin cruise (once the boat's bought): the boat sails up the coast and back with Mel, Evan and Maple aboard
const cruisingNow = () => !!(S.cruise && Date.now() < S.cruise.until && scene === "shore");
function startCruise(){
  if (S.cruise && Date.now() < S.cruise.until) return;
  const m = sgHM(); if (m >= 19*60 || m < 6*60) { speak("Too dark for a cruise. The dolphins are tucked up for the night.", 3500); render(); return; }
  S.cruise = {until: Date.now() + 45000}; route = []; mel.path = []; atSpot = null;
  [nodes.mel, nodes.maple, nodes.evan].forEach(n => n.style.visibility = "hidden"); sfx("chime"); drawScene();
  speak(evanHere() ? "All aboard! Evan's at the front, Maple's on your lap. Off up the coast." : "All aboard! Maple's on your lap. Off up the coast.", 5000);
  setTimeout(() => { if (S.cruise && scene === "shore") { speak("Dolphins! A whole pod, right alongside the boat. One jumps clean out of the water.", 5500); [0, 300, 600].forEach((d, k) => setTimeout(() => mprop("heart", 90 + k*20, 260, 1800), d)); } }, 16000);
  render();
}
function endCruise(){
  S.cruise = null; [nodes.mel, nodes.maple, nodes.evan].forEach(n => n.style.visibility = "");
  if (scene !== "shore") return;
  mel.x = mel.tx = 206; mel.y = mel.ty = 556; maple.x = maple.tx = 184; maple.y = maple.ty = 558;
  if (S.cruiseDay !== dayKey()) { S.cruiseDay = dayKey(); gainXp(3); act("cheer"); }
  speak("Back at the jetty. Salty hair, very happy faces.", 4500); save(); drawScene();
}
function endPaddle(walkBack){
  if (!sup) return; const was = sup; sup = null;
  nodes.mel.classList.remove("sup"); nodes.evan.classList.remove("sup"); evan.wait = 1;
  if (scene !== "shore") return;
  if (walkBack) { walkTo(216, 500); if (evanHere()) { evan.tx = 240; evan.ty = 508; } }
  if (was.out && S.supDay !== dayKey()) { S.supDay = dayKey(); gainXp(2); act("cheer"); speak("Back on the sand. Wet, salty and very happy. Same time next weekend?", 4500); save(); }
}
// Who's where today: everyone's day at a glance (in the friendship view), family first, then the village
const PLACE_NAME = {greenhouse: "the greenhouse", mill: "the old mill", rd_station: "Ronda (the station)", rd_plaza: "Ronda (the plaza)", rd_bridge: "Ronda (the bridge)", rd_old: "Ronda (the old town)", base: "outside at home", home: "your house", farm: "the garden", village: "the town square", lane: "Makers' Lane", vineyard: "the vineyard",
  orchard: "the orchard", flowers: "the flower farm", field: "the field", shore: "the foreshore", kitchen: "the wine shop kitchen", bay: "the bay", hfarm: "Wildflower Farm", hwoods: "Honeybrook Woods", hlane: "the cottage lane", van: "the campervan", honeysuckle: "Honeysuckle cottage", clover: "Clover cottage", barn: "the barn at Wildflower Farm", scoopshop: "the Scoop Shack", scoopkitchen: "the gelato kitchen", scoopdip: "the dip station", cocoa: "the Cocoa Room", cocoakitchen: "the chocolate kitchen"};
const ACT_WORD = {water: "watering", farm: "gardening", sit: "sitting down", game: "gaming", sup: "paddleboarding", guide: "leading a tour", lead: "leading the class",
  exercise: "exercise class", cone: "with an ice cream", cook: "cooking", rest: "in the hammock", repair: "fixing things", type: "busy", play: "playing"};
const placeName = sc => PLACE_NAME[sc] || (ROOMS[sc] && ROOMS[sc].name) || sc;
const WHO_FAMILY = ["darren", "mama", "gonggong", "mum", "dad", "marcus", "angelina"];
function whosWhereHTML(){
  const day = dayKey(), t = sgHM(), hhmm = m => fmtTime(m);
  const row = n => { const sch = daySchedule(n.id, day), cur = sch.find(x => t >= x.from && t < x.to);
    const cls = classOn(day), word = a => a === "lead" && cls ? `leading ${cls.kind}` : a === "exercise" && cls && n.id !== "mum" ? `${cls.kind} with Mum` : ACT_WORD[a];
    const what = x => x.club ? "the wine club at the cellar door" : x.dinner ? `family dinner at ${HOST_NAME[x.scene] || placeName(x.scene)}` : `${placeName(x.scene)}${x.act && word(x.act) ? ` (${word(x.act)})` : ""}`;
    return `<details class="whowhere"><summary><b>${esc(n.name)}</b> <small class="muted">${cur ? `now: ${esc(what(cur))}` : "not about just now"}</small></summary>
      <ul>${sch.map(x => `<li class="${x === cur ? "now" : ""}"><span>${hhmm(x.from)}–${hhmm(x.to)}</span> ${esc(what(x))}</li>`).join("") || "<li>Not in the village today.</li>"}</ul></details>`; };
  const fam = WHO_FAMILY.map(id => NPCS.find(n => n.id === id)).filter(Boolean);
  const town = NPCS.filter(n => !WHO_FAMILY.includes(n.id) && !n.tourist && !n.kid && !n.local);
  const dn = dinnerOn(day);
  const club = owns(F, "cellar") && wineClubOn(day);
  return `<h3 class="ph3">Who's where today</h3>${dn ? `<p class="muted">Family dinner tonight at ${HOST_NAME[dn.host]}, 6:30.</p>` : ""}${club ? `<p class="muted">Wine club tonight at the cellar door, 6 to 9pm.</p>` : ""}<p class="eyebrow">Family</p>${fam.map(row).join("")}<p class="eyebrow" style="margin-top:10px">Around the village</p>${town.map(row).join("")}`;
}
// Ah Gong and Ah Ma (Mel's dad and mum) with Evan: every minute or two when they're on the same screen, a little
// exchange (Ah Gong: "Ah Gong loves who the most?"; Evan's cheeky with them), and once a day a surprise toy for him
const SURPRISES = [["dino", "a little dinosaur"], ["plane", "a toy aeroplane"], ["robot", "a wind-up robot"]];
let banterAt = Date.now() + 20000;
function grandBanter(){
  if (Date.now() < banterAt || !evanHere() || quietNow() || route.length) return;
  const here = ["dad", "mum"].filter(w => npcPos(w)); if (!here.length) return;
  banterAt = Date.now() + (60 + Math.random()*60)*1000;
  const g = pick(here), title = g === "dad" ? "Ah Gong" : "Ah Ma", p = npcPos(g);
  if (S.surpriseDay !== dayKey() && Math.random() < .6) {
    const [k, n] = pick(SURPRISES); S.surpriseDay = dayKey();
    npcSay(g, g === "dad" ? "Evan! Come, come. Ah Gong has a surprise for you!" : "Evan, come here! Ah Ma brought you something!");
    setTimeout(() => { evan.tx = p.x + 20; evan.ty = p.y + 6; evan.run = true; evan.wait = 8; }, 800);
    setTimeout(() => { S.evanHold = {k, until: Date.now() + 3*H}; renderEvanHold(); evanSays(`WOW! ${n[0].toUpperCase() + n.slice(1)}! Thank you ${title}!`); [0, 250, 500].forEach((d, i) => setTimeout(() => mprop("heart", evan.x + (i - 1)*14, evan.y - 40, 1600), d)); save(); }, 2600);
    return;
  }
  if (g === "dad") { npcSay("dad", pick(["Ah Gong loves who the most?", "Evan! Ah Gong loves who the most?"]));
    setTimeout(() => evanSays(pick(["ME!", "Evan! Hehe.", "Maple! Hehe. No, ME!", "Spiderman!", "Ah Ma! ...no, ME!"])), 1800);
    setTimeout(() => npcSay("dad", pick(["Correct answer!", "Aiyo, this cheeky boy!", "Hahaha, so smart!"])), 4200); }
  else { npcSay("mum", pick(["Evan, come give Ah Ma a hug!", "Evan, have you eaten? Come, Ah Ma feeds you.", "Evan, so handsome today!"]));
    setTimeout(() => { evanSays(pick(["Catch me first, Ah Ma!", "No! Hehehe.", "Only if you say please!", "Ah Ma, look! I can jump!"])); const b = bounds(); evan.tx = clamp(evan.x + rnd(-80, 80), b[0] + 20, b[2] - 20); evan.ty = clamp(evan.y + rnd(-30, 30), b[1] + 20, b[3] - 20); evan.run = true; evan.wait = 5; }, 1800);
    setTimeout(() => npcSay("mum", pick(["Aiyo, this boy!", "Come back here, cheeky!", "So naughty! Come, Ah Ma wants a hug."])), 4200); }
}
setInterval(grandBanter, 5000);
// Evan at Marcus and Angellina's: he wants games (Mario, Spiderman) the moment he's in the door
function marcusGames(){
  if (!evanHere()) { speak(VILLAGE.marcus ? ROOMS.marcus.stations.find(x => x[0] === "games")[5] : "", 4000); render(); return; }
  evan.tx = 150; evan.ty = 300; evan.run = true; evan.wait = 12; sfx("chime");
  setTimeout(() => evanSays(pick(["Mario jump! Again! Again!", "Spiderman! Thwip thwip!", "I'm winning! I'm winning!"])), 1200);
  if (isHere("marcus")) setTimeout(() => npcSay("marcus", pick(["Okay, one level. Then we ask your mum. Right, Zeh?", "Jump! No, the other jump! Haha.", "He's better than me already, Zeh."])), 2600);
  if (S.gamesDay !== dayKey()) { S.gamesDay = dayKey(); gainXp(1); save(); }
  speak(isHere("marcus") ? "Evan and Uncle Marcus play Mario. Evan mostly jumps into holes and laughs." : "One level of Mario for Evan. He mostly jumps into holes and laughs.", 4500); render();
}
// Family dinner: Mel takes her seat at the table (once a night it's a little xp, and a lot of hearts)
function sitForDinner(){
  const d = dinnerNow(dayKey(), sgHM()), next = dinnerOn(dayKey());
  if (!d || d.host !== scene) {
    speak(d ? `Dinner's at ${HOST_NAME[d.host]} tonight. Everyone's there already!` : next && sgHM() < next.from ? `Family dinner tonight at ${HOST_NAME[next.host]}, 6:30.` : "The family table. Dinners are on Wednesdays and Sundays, at a different house each time.", 4500); render(); return; }
  const seat = dinnerSeat(scene, "mel"); mel.tx = seat[0]; mel.ty = seat[1]; mel.path = []; setTimeout(() => { mel.sitting = true; nodes.mel.classList.add("sit"); mel.dir = -1; }, 700);
  if (S.dinnerDay !== dayKey()) { S.dinnerDay = dayKey(); gainXp(3); [0, 250, 500, 750].forEach((t, k) => setTimeout(() => mprop("heart", seat[0] - 120 + k*70, seat[1] - 70, 1800), t)); save(); }
  const who = ["mama", "mum", "gonggong", "dad"].find(isHere);
  if (who) setTimeout(() => npcSay(who, pick(who === "mama" ? ["Eat, eat! Ma Ma made too much again.", "Come, sit next to Ma Ma."] : who === "mum" ? ["Have more! You're too thin.", "Everyone's here. This is the best."] : who === "gonggong" ? ["Have you eaten? Now you have.", "Pass the soup, pass the soup."] : ["Who wants to hear what I played today?", "Evan, eat your vegetables. For Grandpa."])), 1200);
  // bring two tomatoes and two eggs and Ma Ma makes her tomato and egg for the table (once a dinner)
  if (S.tomeggDay !== dayKey() && (F.inv.tomato || 0) >= 2 && (F.inv.egg || 0) >= 2) { S.tomeggDay = dayKey(); addInv("tomato", -2); addInv("egg", -2); gainXp(2);
    setTimeout(() => { if (isHere("mama")) npcSay("mama", "Tomatoes and eggs! Ma Ma makes her tomato and egg. Everybody eat!"); if (evanHere()) setTimeout(() => evanSays(pick(["Ma Ma's eggs are the best!", "More rice please!", "Yummy yummy!"])), 1800); }, 2600);
    speak("You hand Ma Ma two tomatoes and two eggs. Ten minutes later: her tomato and egg, over rice. Everyone goes quiet, then asks for seconds.", 6500); save(); render(); return; }
  speak((F.inv.tomato || 0) || (F.inv.egg || 0) ? "Family dinner. Everyone round one table, all talking at once. (Two tomatoes and two eggs and Ma Ma will make her tomato and egg.)" : "Family dinner. Everyone round one table, all talking at once. The best.", 4500); render();
}
// Mum's exercise class on the exercise lawn at the field: Mel joins on the spare mat (once a day it earns a little)
let melEx = null;
function joinClass(){
  const c = classOn(dayKey()), m = sgHM();
  if (awayOn(F).includes("mum") && m < 9*60) { speak(`No class this morning: Mum's away in ${TOWNS[tripOn(F).town].n} for the day.`, 4500); render(); return; }
  if (!c || m < c.from || m >= c.to) { const next = classOn(dayKey());
    speak(`Mum's classes are here at 8am: Pilates on Mondays and Wednesdays, Zumba on Tuesdays and Thursdays, Piloxing on Fridays and Saturdays.${next && m < next.from ? ` Today's is ${next.kind}.` : ""}`, 6000); render(); return; }
  melEx = [436, 482]; walkTo(436, 482); sfx("paper", true);
  if (isHere("mum")) setTimeout(() => npcSay("mum", pick([`My girl's here! Everybody, this is my daughter. ${c.kind} time!`, "Come, come, there's a mat for you. Follow me!", "Darling! Good, good. Stretch first."])), 900);
  if (S.classDay !== dayKey()) { S.classDay = dayKey(); setTimeout(() => { gainXp(2); earn(2, `Mum's ${c.kind} class`); save(); }, 6000); }
  speak(`${c.kind} with Mum on the lawn. Arms up, and breathe.`, 4000); render();
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
  setTimeout(() => evanSays(pick(id === "pswing" ? ["wheee!", "push me!", "higher!"] : id === "pslide" ? ["again!", "whoosh!", "down!"] : id === "pround" ? ["round round!", "faster!", "dizzy!"] : ["up!", "down!", "bumpy!"])), 900);
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
const ROUTINE_STEP = 1, ROUTINE_DONE = 8;
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
// (asked inside the card: pop-up confirms are blocked inside the artifact frame, so confirm() always said no)
const bedAsk = on => { $("bedSure").hidden = !on; $("bedUp").hidden = on; };
$("bedUp").onclick = () => bedAsk(true);
$("bedNo").onclick = () => bedAsk(false);
$("bedYes").onclick = () => { bedAsk(false); F.bedSkip = nightKey(); save(); bedtimeTick(); speak("Okay, just this once. Be gentle with yourself.", 5000, true); };
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
  if (npc) { if (!(trolleyOn(F) && outside() && !townOf(scene) && trolleyOffer(npc.dataset.npc))) tapNpc(npc.dataset.npc); return; }
  const pet = ev.target.closest("[data-pet]");
  if (pet) { const c = companions(F).find(x => x.id === pet.dataset.pet); if (c) { const [x, y] = petAt(c); go(scene, x + 22, y + 8, null); petView = c.id; sfx("paper", true); render(); } return; }
  const kp = ev.target.closest("[data-keep]");
  if (kp) { keepSpot = kp.dataset.keep; sfx("paper", true); render(); return; }
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
  const rs = ev.target.closest("[data-rdspot]");
  if (rs && (townRoom(scene) || rs.dataset.rdspot === "dyecloth")) { go(scene, +rs.dataset.x, +rs.dataset.y, () => { atSpot = "rd"; roomSpot(rs.dataset.rdspot); }); return; }
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
  const ghd = ev.target.closest("[data-gh]");
  if (ghd && scene === "farm") { go("farm", 260, 132, () => { if (owns(F, "greenhouse")) setScene("greenhouse", INNER.greenhouse.arrive); else { goalView = "greenhouse"; sfx("paper", true); speak("The old shed. With a bit of glass, it would make a lovely greenhouse...", 4000); render(); } }); return; }
  const ms = ev.target.closest("[data-millspot]");
  if (ms && scene === "mill" && ms.dataset.millspot === "photo") { go("mill", 150, 260, () => { millOpen = "story"; atSpot = "photo"; sfx("paper", true); ctx(); }); return; }
  if (ms && scene === "mill") { go("mill", 300, 560, () => { millOpen = true; atSpot = "press"; sfx("paper", true); ctx(); }); return; }
  const gb = ev.target.closest("[data-ghbed]");
  if (gb && scene === "greenhouse") { const i = +gb.dataset.ghbed, p = GH_BED_AT[i]; go("greenhouse", p.x + p.w/2, p.y + p.h + 22, () => { ghBed = i; atSpot = "ghbed"; sfx("paper", true); ctx(); }); return; }
  const pt = ev.target.closest("[data-plot]");
  if (pt) { const i = +pt.dataset.plot, p = PLOTS[i]; go("farm", p.x + p.w/2, p.y + p.h + 18, () => { selPlot = i; atSpot = "plot"; ctx(); const s = F.plots[i]; speak(!s || !s.crop ? "Empty plot. What shall we grow?" : !s.wateredAt ? "Thirsty seeds!" : growth(s) >= 1 ? "Ready to pick!" : "Growing nicely.", 3000); }); return; }
  const [x, y] = toWorld(ev);
  // Fingers miss small people: a tap close to a villager or messenger counts as tapping them.
  const near = npcActors().map(([n, e]) => [n, Math.hypot(e.x - x, (e.y - 30) - y)]).filter(([, d]) => d < 34).sort((a, b) => a[1] - b[1])[0];
  if (near) { if (!(trolleyOn(F) && outside() && !townOf(scene) && trolleyOffer(near[0].dataset.npc))) tapNpc(near[0].dataset.npc); return; }
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
const EVAN_SPOTS = {ct_vernazza:[[300,360],[200,440],[400,330],[330,560]], ct_corniglia:[[200,420],[300,380],[440,350],[160,520]], ct_monterosso:[[200,480],[260,420],[300,300],[150,500]], ct_manarola:[[262,400],[150,500],[300,320],[420,500]], jj_shore:[[200,470],[300,320],[420,300],[260,560]], jj_farms:[[400,410],[150,540],[262,360],[300,520]], jj_harbour:[[214,436],[260,300],[360,480],[300,540]], jj_village:[[262,150],[220,330],[300,440],[404,580]], kt_station:[[220,420],[300,540],[400,300],[260,260]], kt_lane:[[200,320],[300,520],[260,240],[160,580]], kt_temple:[[230,520],[260,250],[200,420],[330,260]], kt_river:[[262,300],[200,260],[320,500],[160,500]], rd_station:[[200,520],[300,330],[240,460],[160,420]], rd_plaza:[[220,300],[300,420],[180,380],[340,330],[260,460]], rd_bridge:[[310,120],[300,260],[420,300],[330,520]], rd_old:[[220,300],[300,480],[160,300],[420,300]], hwoods:[[240,360],[300,440],[200,480],[380,400],[260,560]], van:[[220,560],[330,600]], hlane:[[230,520],[200,560],[300,580],[230,300],[120,500]], honeysuckle:[[200,560],[330,600]], clover:[[200,560],[360,600],[160,380]], barn:[[200,560],[330,600],[160,380]], hfarm:[[260,520],[200,560],[330,580],[260,290],[60,500],[460,520]], bay:[[300,400],[250,560],[300,330],[200,300],[290,500]], scoopshop:[[200,440],[380,440],[300,560],[140,560],[260,420]], scoopkitchen:[[200,560],[380,540],[300,580]], scoopdip:[[180,560],[420,560],[140,420]], cocoa:[[200,440],[380,450],[140,560]], cocoakitchen:[[200,560],[380,560]], mumdad:[[300,560],[200,380],[420,420],[150,560],[460,560]], marcus:[[230,560],[120,500],[460,560],[250,340],[300,600]], cottage:[[200,560],[440,540],[300,340]], shore:[[230,200],[246,320],[300,320],[236,430],[260,560],[200,380],[214,520]], field:[[150,560],[200,570],[120,470],[230,390],[60,330],[280,470],[110,600]], vineyard:[[110,600],[262,598],[410,606],[200,560],[160,320],[300,330],[230,580]], base:[[260,350],[200,360],[330,360],[150,330],[230,420],[160,540],[300,600],[360,516],[240,560],[420,340]], home:[[150,340],[260,330],[380,330],[200,580],[330,590]]};
// Evan's destination is evan.tx/ty; outdoors he follows route-finder waypoints to it (round the house, not through it)
function evanWalk(speed, dt){
  const key = evan.tx + "," + evan.ty;
  if (key !== evan.rk) { evan.rk = key; evan.path = outside() || townRoom(scene) ? findPath(scene, [evan.x, evan.y], [evan.tx, evan.ty], bounds()) : [[evan.tx, evan.ty]]; }
  const p = evan.path && evan.path[0]; if (!p) { evan.moving = false; return true; }
  const want = [evan.tx, evan.ty]; evan.tx = p[0]; evan.ty = p[1];
  const r = stepTo(evan, speed, dt); evan.tx = want[0]; evan.ty = want[1];
  if (r) { evan.path.shift(); if (evan.path.length) { evan.moving = true; return false; } return true; }
  return false;
}
function tickEvan(dt){
  if (!evanHere()) return;
  if (evanAtDinner() && !route.length) { const st = dinnerSeat(scene, "evan"); evan.tx = st[0]; evan.ty = st[1]; evan.run = false; evan.wait = 9; evanWalk(90, dt); nodes.evan.classList.toggle("sit", !evan.moving); return; }
  if (evanSeat && !route.length) { evan.tx = evanSeat.x; evan.ty = evanSeat.y; evan.run = false; evan.wait = 9; evanWalk(90, dt); nodes.evan.classList.toggle("sit", !evan.moving); return; }
  nodes.evan.classList.remove("sit");
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
      else { const s = pick(EVAN_SPOTS[scene] || (townRoom(scene) || {}).party || [[260, 420]]); evan.tx = s[0] + rnd(-14, 14); evan.ty = s[1] + rnd(-8, 8); evan.run = Math.random() < .35; evan.target = null; }
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
  const arrived = stepTo(mel, (keys.size ? 190 : 220)*(outside() && !sup && !townOf(scene) ? rideSpeed(F) : 1), dt);   // the scooter and car (big goals) are faster
  if (arrived && !keys.size && mel.path && mel.path.length) { const n = mel.path.shift(); mel.tx = n[0]; mel.ty = n[1]; mel.moving = true; }
  else if (arrived && !keys.size && (mel.wasMoving || mel.force)) {
    mel.force = false;
    if (route.length && route[0].scene === scene) { const l = route.shift(); if (l.fn) l.fn(); else { atSpot = null; render(); } if (route.length && route[0].scene === scene) nextLeg(); }
    else if (!route.length) {
      const n = nearSpot();
      if (n) { if (outside()) { const v = VILLAGE[n]; if (v.spot) arriveVillageSpot(n); else go(n, 260, 560, null); } else arriveSpot(n); }
      else if (!outside() && scene !== "farm" && !INNER[scene] && mel.y > 592) go(outdoorOf(scene), VILLAGE[scene].door[0], VILLAGE[scene].door[1] + 10, null);
      else if (INNER[scene] && scene !== "kidroom" && ((Math.abs(mel.x - INNER[scene].exit[0]) < 12 && Math.abs(mel.y - INNER[scene].exit[1]) < 56) || (mel.y > 592 && Math.abs(mel.x - 260) < 60))) { const I = INNER[scene]; go(I.parent, I.door[0] + 30, I.door[1] + 20, null); }
      else if (scene === "farm" && mel.y > 592 && Math.abs(mel.x - 260) < 50) go("base", VILLAGE.farm.door[0], VILLAGE.farm.door[1] + 10, null);
    }
  }
  if (S.cruise && (scene !== "shore" || Date.now() > S.cruise.until)) endCruise();
  { const rd = outside() && !townOf(scene) ? ride(F) : "walk", drive = rd === "car" && mel.moving && !sup, carry = (drive || rd === "bike") && mel.moving && !sup, withEvan = carry && evanHere() && !evanNight();
    nodes.mel.classList.toggle("trolley", trolleyOn(F) && outside() && !townOf(scene) && !sup);
    nodes.mel.classList.toggle("scoot", rd === "scooter" && mel.moving && !sup); nodes.mel.classList.toggle("biking", rd === "bike" && mel.moving && !sup);
    if (rd === "bike" && F.bike && nodes.mel.dataset.bikeCol !== F.bike.col) { nodes.mel.dataset.bikeCol = F.bike.col; nodes.mel.querySelectorAll(".rideBike .bikeArt > path").forEach(p => p.style.stroke = F.bike.col); } nodes.mel.classList.toggle("drive", drive); nodes.mel.classList.toggle("withEvan", withEvan);
    // Maple and Evan ride along in the convertible (or on the hire bike: Evan in the child seat, Maple in the front
    // basket), and hop out beside Mel when she stops
    if (carry) { mel.carEvan = withEvan; } else if (mel.wasDriving) { maple.x = maple.tx = mel.x - mel.dir*22; maple.y = maple.ty = mel.y + 3; if (mel.carEvan) { evan.x = evan.tx = mel.x + 18; evan.y = evan.ty = mel.y + 6; evan.path = [[evan.x, evan.y]]; evan.rk = evan.tx + "," + evan.ty; } mel.carEvan = false; }
    mel.wasDriving = carry; }
  if (sup) { if (scene !== "shore" || Date.now() > sup.until) endPaddle(true); else if (!sup.out && mel.x < 160) sup.out = true; else if (sup.out && mel.tx > 170) endPaddle(false); }
  if (melEx && (scene !== "field" || Math.hypot(mel.tx - melEx[0], mel.ty - melEx[1]) > 4 || !classOn(dayKey()) || sgHM() >= classOn(dayKey()).to)) melEx = null;
  nodes.mel.classList.toggle("exercise", !!melEx && !mel.moving);
  if (mel.sitting && (mel.moving || (scene !== "trophy" && scene !== "field" && scene !== "shore" && scene !== "bay" && scene !== "scoopshop" && !DINING[scene]))) { mel.sitting = false; nodes.mel.classList.remove("sit"); }
  if (evanSeat && (!mel.sitting || evanSeat.scene !== scene)) evanSeat = null;
  mel.wasMoving = mel.moving;
  const inRoom = scene === "room", MB = [MAPLE_BED[0], MAPLE_BED[1] + 2];
  if (inRoom) { maple.tx = MB[0]; maple.ty = MB[1]; stepTo(maple, 110, dt); }
  const sleeping = inRoom ? !maple.moving && Math.hypot(maple.x - MB[0], maple.y - MB[1]) < 6 : (phase() === "break" || Date.now() < mapleNap);
  nodes.maple.classList.toggle("sleep", sleeping);
  if (inRoom || scene === "kidroom") {}
  else if (sup && scene === "shore") { maple.tx = 196; maple.ty = 486; stepTo(maple, 120, dt); }
  else if (!sleeping) { maple.tx = mel.x - mel.dir*24; maple.ty = mel.y + 3; const d = Math.hypot(maple.tx - maple.x, maple.ty - maple.y); stepTo(maple, Math.max(120, d*3.2), dt); if (!maple.moving) maple.dir = mel.dir; }
  else maple.moving = false;
  tickEvan(dt);
  tickNpcs(dt); updateCam(dt); drawTableware();
  placeNode(nodes.mel, mel); placeNode(nodes.maple, maple); placeNode(nodes.evan, evan);
  nodes.evan.style.visibility = (scene === "kidroom" && kid.sleep) || cruisingNow() || (mel.wasDriving && mel.carEvan) ? "hidden" : "";
  nodes.maple.style.visibility = cruisingNow() || mel.wasDriving ? "hidden" : "";
  // On the treadmill with the time box running: Mel walks in place.
  if (scene === "office" && atSpot === "treadmill" && !route.length && S.timer && S.timer.kind === "task" && Math.abs(mel.x - mel.tx) < 2) { nodes.mel.classList.add("walk"); mel.dir = 1; }
  nodes.evan.classList.toggle("run", evan.run && evan.moving);
  const order = [[nodes.mel, mel], [nodes.maple, maple], [nodes.evan, evan], ...npcActors(), ...stallFronts()].sort((a, b) => a[1].y - b[1].y);
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
  placeLabel:t => `${(VILLAGE[placeOf(t)] || ROOMS[placeOf(t)]).name} · ${spotObj(placeOf(t), spotOf(t)).name}`});
initHestia({sfx, alarm, speak, flash, undoable, earn: (n, why) => { earn(n, why); save(); }, changed: () => render(),
  refund: (n, why) => { F.coins = Math.max(0, F.coins - n); S.earned = Math.max(0, (S.earned || 0) - n); flash(`-${n} coin: ${why}`); save(); }});
$("hestiaFile").onchange = e => { const f = e.target.files && e.target.files[0]; if (!f) return; const r = new FileReader();
  r.onload = () => { const msg = importHestia(String(r.result)); $("hestiaNote").textContent = msg; speak(/^Imported/.test(msg) ? "Hestia's lists are in the house now!" : msg, 4500); }; r.readAsText(f); e.target.value = ""; };
setStallOwned(() => ({cc_cart: !!(F.cocoa && F.cocoa.up && F.cocoa.up.cart), cc_workshop: !!(F.cocoa && F.cocoa.up && F.cocoa.up.workshop)}));   // the Cocoa Room's market cart and Saturday workshop, once bought
initNpcs({sfx, story: id => tellStory(F, id, addInv), storyReady: id => !!storyReady(F, id), flash, quiet: () => quietNow(), chatted:n => { if (!S.chats.includes(n)) { S.chats.push(n); save(); } }, scene:() => scene, bounds, mel, evan, sup: () => sup, F:() => F, S:() => S, save:() => save(), facts, bubble:bubbleAt, evanSays, unreadMail,
  openMail:item => openMail(item), gift:id => { addInv(id, 1); flash(`Auntie Lin gave you ${ITEMS[id].n.toLowerCase()}`); save(); }});
measureHud();
initTrips(() => F);
setGhCompost(() => !!(F.tools || {}).compost);
// Pick up where Mel left off (round 105): the same game day, back on the screen she closed the game on (a new day, she
// wakes up at home as usual). F.where is kept by save().
{ const w = !globalThis.__mapleNoResume && F.where, ok = w && w.day === dayKey() && w.scene && w.scene !== scene && (OUTDOOR.includes(w.scene) || ROOMS[w.scene] || INNER[w.scene] || VILLAGE[w.scene]) && !["kidroom", "room"].includes(w.scene) && (!townOf(w.scene) || !!tripOn(F));
  if (ok) { scene = w.scene; mel.x = mel.tx = w.x; mel.y = mel.ty = w.y; mel.path = []; maple.x = maple.tx = w.x - 22; maple.y = maple.ty = w.y + 2; } }
render(true);
if (F.gift) setTimeout(() => speak("A welcome gift! Seeds are in your backpack 🌷", 5000), 1200);
requestAnimationFrame(frame);
initDb();
