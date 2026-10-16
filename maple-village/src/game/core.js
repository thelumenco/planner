// Game core: state + persistence, quest flow, actions, UI renderers and the world sim.
import { H, M, W, HH, now, dayKey, localHM, prevDay, $, esc, pick, rnd, clamp, dur, plain, hash, LOC } from "../util.js";
import { icon, progressBar, progressBarV } from "../art/icons.js";
import { VILLAGE, ROOMS, PET_BED, OUTDOOR, BRIDGES, ARRIVE, INNER, nextHop, outdoorOf, isWeekend, stationsOf, spotObj } from "../data/world.js";
import { CROPS, ITEMS, DECOR, PLOTS, QUEST_BOOST, LEVELS, YAY, itemIco, seasonOf, SEASONS } from "../data/items.js";
import { brollyArt, hoodArt } from "../art/people.js";
import { UPGRADES, unlocked, nextUpgrade, festivalOn, rainyOn, stormyOn, rainLevel, FESTIVALS } from "../art/village-extras.js";
import { foreArt, villageArt, baseArt, laneArt, roomArt, farmArt, vineyardArt, orchardArt, flowerFarmArt, setArtContext } from "../art/scenes.js";
import { vineSpot } from "../art/vineyard.js";
import { kitchenState, sendToKitchen, isGood, larderPanel, ovenPanel, pressPanel, stovePanel, wireKitchen, staffDinner, staffLine, tapasToday, tapasAll, TAPAS, cookTick, cookLine } from "./kitchen.js";
import { questBoost } from "./vineyard.js";
import { wineNews, vineState, sellTick, vinePanel, stallPanel, barrelPanel, shelfPanel, counterPanel, boxPanel, cafePanel, olivePanel, grovePanel, wireVine, shelfStock, vineyardName, shopName, serveGuest, menuPanel, stallMarketPanel } from "./vineyard.js";
import { AGENTS, NPCS } from "../data/npcs.js";
import { isLove, loveThanks } from "../data/loves.js";
import { initNotebook, openMail, openTracker, refreshNotebook, notebookOpen } from "../ui/notebook.js";
import { unlockAudio, audioRunning, sfx, alarm, settings as sound, setMusic, setMusicVol, setSfx, TRACKS, setTrack, currentTrack, setLive } from "./audio.js";
import { findPath, blocked } from "./paths.js";
import { ensurePets, addAnimal, feedOne, upgradeRun, runPanel, scatterTreat, roomLeft, hungry, hungryCount, KINDS } from "./pets.js";
import { wardrobePanel, wearing, ACCESSORIES } from "./wardrobe.js";
import { goodNewsHTML } from "./gazette.js";
import * as QB from "./quests.js";
import * as SL from "./shopping.js";
import { colourOf } from "../art/garments.js";
import { journalCount } from "./myroom.js";
import { attachMyDocs, journalPanel, wireJournal } from "./myroom.js";
import { reached, award, onPedestals, nextUp, pedestalPanel, bookPanel, wireTrophies, PEDESTALS } from "./trophies.js";
import { attachRoutines, routinesPanel, wireRoutines, rv, todaysSteps, checklistLeft } from "./routines.js";
import { myName, dearMe } from "./me.js";
import * as GU from "./guests.js";
import * as TL from "./tailor.js";
import { lookOf, applyLook } from "./look.js";
import { openSetup, setupOpen } from "./setup.js";
import { openIntro, introOpen, introAt } from "./intro.js";
import { openTitle, titleOpen, refreshTitle } from "./title.js";
import { activeSlot, summaryOf, clearAllSlots } from "./slots.js";
import * as CL from "./cloud.js";
import { PLACES, placeOf, placeAt } from "../data/places.js";
import { SPECIES, speciesOf, petArt, petify } from "../art/pets.js";
import { sendOptions, takeSend, sendMorePanel } from "./bikesend.js";
import { rideBy, initNpcs, tickNpcs, tapNpc, npcActors, resetScene as resetNpcs, courierDelivered, isHere, whereIs, whereAt, npcSay, npcPos, daySchedule, clearSlots } from "./npcs.js";
import { dishArt, glassArt } from "../art/wine.js";
import { fieldArt, stallFront } from "../art/field.js";
import { shoreArt } from "../art/shore.js";
import { bayArt, DECK_SEATS } from "../art/bay.js";
import { hfarmArt } from "../art/hfarm.js";
import { hlaneArt } from "../art/hlane.js";
import { hwoodsArt } from "../art/hwoods.js";
import { greenhouseArt, GH_BED_AT, GH_POT_AT } from "../art/greenhouse.js";
import { millArt } from "../art/mill.js";
import { fishVanArt, kiteArt, bayStallArt, kiteSellerArt, movieArt } from "../art/friday.js";
import { vanPanel, vanBuy, VAN_MULT, bayStallGoods, bayKeeperName, filmOf } from "./friday.js";
import { millState, pressLeft, millPanel, startPress, collectOil, millStory } from "./mill.js";
import { ghState, ghGrowth, bedPanel, ghPlant, ghHarvest, ghBoost, setGhTools, herbPotPanel, potPlant, potClip, potDig, ghRipe } from "./greenhouse.js";
import { rondaArt, trainRideArt } from "../art/town-ronda.js";
import { rondaRoomArt } from "../art/ronda-rooms.js";
import { kyotoArt } from "../art/town-kyoto.js";
import { jejuArt, ferryRideArt, wishTower } from "../art/town-jeju.js";
import { cinqueArt, homeBoat, dryingRack } from "../art/town-cinque.js";
import { discoArt } from "../art/disco.js";
import { bellbirdArt, vanRideArt } from "../art/bellbird-vines.js";
import { BB_NAMES, BB_EVAN } from "../data/bellbird.js";
import { mapPanel as bbMapPanel, passportPanel as bbPassport, setOff as bbSetOff, driveOn as bbDriveOn, homeFuel as bbHomeFuel, bbState } from "./bellbird.js";
import { bbRoomPanel, treat as bbTreat, chocTaste, watchWater, NOTES as BB_NOTES, buyCuttings as bbCuttings } from "./bbrooms.js";
import * as BBA from "./bbacts.js";
import * as CRA from "./cracts.js";
import * as TLA from "./tlacts.js";
import * as LVA from "./lvacts.js";
import { FIRE_FOLK } from "../data/bb-people.js";
import { loftPanel, startBatch, collect as loftCollect, loftState } from "./loft.js";
import { cinqueRoomArt } from "../art/cinque-rooms.js";
import { saltwickArt, swFerryRideArt } from "../art/town-saltwick.js";
import { saltwickRoomArt } from "../art/saltwick-rooms.js";
import { bellbirdRoomArt } from "../art/bellbird-rooms.js";
import { terraceArt } from "../art/terrace.js";
import { coastArt } from "../art/coast.js";
import { coastRoomArt } from "../art/coast-rooms.js";
import { tablelandsArt } from "../art/tablelands.js";
import { lavenderArt } from "../art/lavender.js";
import { lavenderRoomArt } from "../art/lavender-rooms.js";
import { tablelandsRoomArt } from "../art/tablelands-rooms.js";
import { bookPanel as lunchBookPanel, lunchNow, bookingsFor, seatedAt, LUNCH, setCloseFriends } from "./lunch.js";
import { craftState, craft as millCraft, renderWax, craftDone, registerCraft, benchPanel as millBenchPanel, inesStep, fromBasket, craftSellMinute, takeFromStore, toBasket, storeCount, cratePanel, packCrate, unpackCrate, vanCrate, crateCount, vanSellMinute, itemId as craftItemId, KINDS as CRAFT_KINDS, SHOPKEEP, crateMix, wineCratePanel } from "./millcraft.js";
import { hamperSeason, xmasState, TREATS, treatsHTML, mulledStallPanel, treePanel, treeLit, countdownDue, myStallPanel as xmStallPanel, putOut, takeBack as xmTakeBack, putWine, takeWine, stallSellMinute, registerHampers, hamperPanel, packStart, packAdd, packWine, packRemove, packTie, singCarol, lanternWalk, grottoPanel, grottoVisit, sendHamper, hamperMail, collectReplies, fillOrder } from "./xmas.js";
import * as BK from "./contacts.js";
import * as GAL from "./gallery.js";
import { giftPanel, giftSellMinute, keeperOn as giftKeeperOn, putOutPairs, takeBackPair, putWrapped, takeWrapped, giftState, takeBottle, registerBottles } from "./giftshop.js";
import * as PP from "./paperie.js";
import * as WR from "./wrap.js";
import { setPaperArtF } from "../art/paperie-room.js";
import { storePanel, putAway, takeOut, sendOff, placeFor, homeNote, SHOPS as STORE_SHOPS, storeState } from "./storage.js";
import { millUpArt } from "../art/millup.js";
import { tastePanel, tasteStart, tastePick, tasteNext, tasteDone, finishTaste, tastingNow, workshopNow, workshopPanel, helpWorkshop, WORKSHOP } from "./millcraft.js";
import { mullPanel, mullStart, mullTick, mullState, mulledSeason, MULL, ADDS as MULL_ADDS, toRack, fromRack } from "./mulled.js";
import { occasionOn, occasionNow, OCC, weddingOn, WED, dancingNow, triviaPanel, triviaStart, triviaAnswer, triviaNext, finishTrivia, TEAM_NAMES, QUIZ, paintPanel, paintStart, paintStep, paintDone, finishPaint, PAINT_PRICE, PAINT_SUBJECTS, comingUpHTML, mothersDay } from "./occasions.js";
import { swPanel, swState, splitStone, crabStart, dropLine, pullUp, crabDone, cafeTreat as swCafe, teaStep, teaDone, lampStart, lampStep, lampDone } from "./saltwick.js";
import { cinquePanel, cinqueState, treat as ctTreat, GELATO, FOCACCIA, pestoStart, pestoAdd, pestoPound, pestoDone, finishPesto, harvestStart, pick as ctPick, harvestDone, finishHarvest, TASTE, paintBoat, boatCols } from "./cinque.js";
import { jejuRoomArt, dyeCloth } from "../art/jeju-rooms.js";
import { jejuPanel, jejuState, diveStart, descend, surface, diveReward, JUK, sortStart, sortTap, sortReward, cafeTreat as jjCafe, slowPost, slowMail, DYE, dyeScarf, dyeDays, takeDye } from "./jeju.js";
import { kyotoRoomArt } from "../art/kyoto-rooms.js";
import { kyotoPanel, kyotoState, stamp as ktStamp, rentYukata, yukataOn, YUKATA, whiskStart, whisk, froth, TEA, sitStart, breathe, calm, drawFortune, makeNerikiri, seasonShape, centre as ktCentre, throwCup, NERI } from "./kyoto.js";
import { TOWNS, townOf, townRoom, roomBehind, TOWN_BOUNDS, TOWN_PLACES } from "../data/towns.js";
import { rondaPanel, rondaVisit, buyGood, buyVines, taste, buyTile, picnic as rondaPicnic, tileBench, cafeTreat, showOn, palmasStart, palmasEnd, clap, ole, paintTile, pour, TEA_GLASSES, rondaState } from "./ronda.js";
import { tripOn, inParty, buyTrip, endTrip, ticketPanel, homePanel, boatPanel, initTrips, nameOf as tripName, awayOn } from "./trips.js";
import { bikeArt, taxiBoat, taxiBank, transportArt } from "../art/transport.js";
import { bikeOn, bikeLeft, hireBike, returnBike, bikeExpired, bikePanel, STOPS as TAXI_STOPS, taxiPanel, takeTaxi } from "./transport.js";
import { forage, rangerPanel } from "./woods.js";
import { tellStory, storyReady, storiesHTML, applyFlags as storyFlags, storyState, storyGiven } from "./stories.js";
import { STORIES } from "../data/stories.js";
import { fishState, fishPanel, spotIn, SPOTS as FISH_SPOTS, cast as fishCast, land as fishLand, buyRod, buyReel, addBait, markerAt, inZone, ESCAPE as FISH_ESCAPE, FISH, sellCatch, spotOpen } from "./fishing.js";
import { fishSpotArt, koiArt } from "../art/fishing.js";
import { timetablePanel, trainKey, trainHere, fmt as railTime } from "./rail.js";
import { moodPanel, vanPick, vanClear, lookLine as vanLookLine } from "./van.js";
import { hfState, herdPanel, hivesPanel, standPanel, feedHerd, brush as hfBrush, brushNearest, milkOne, milkHerd, collectHives, buyStand, giveName, fullHives,
  extractorPanel, crockPanel, pressPanel as hfPressPanel, cavePanel as hfCavePanel, spinFrames, makeYoghurt, pressCheese, takeWheel, cheeseNames, CHEESES as HF_CHEESES,
  gainTrust, muckOut, latchGate, catchGoat, nameHive, creamHoney, cutComb, turnWheels, finishRequest, stockShelf, hfTick, farmhousePanel, LEVELS as HF_LEVELS, MOODS as HF_MOODS } from "./hfarm.js";
import { waiterOn, riderOn, scoopState, scoopTick, scoopNews, trolleyPanel, loadTrolley, returnTrolley, trolleySell, trolleyOn, trolleyMelted, TROLLEY, registerItems, makeNonna, counterPanel as scCounterPanel, menuPanel as scMenuPanel, fridgePanel, benchPanel, recipePanel, makeTub, freezerPanel, RENO_LINE, discover, stockFridge, unstockFridge, takeAway, eatOne, recipeOf, FORMATS, openNow, displayIds, setDisplay, SLOTS, upgradePanel, honestyPanel, dipPotsPanel, toppingsPanel, dipBarPanel, deliverPanel, buyUpgrade, buyDip, buyTopping, collectBox, makeDipped, hasUp, DIPS, TOPPINGS } from "./scoop.js";
import { POOLS } from "../data/stall-goods.js";
import { cocoaNews, cocoaState, cocoaTick, counterPanel as ccCounterPanel, barWallPanel, kitchenPanel as ccKitchenPanel, buyBeans, startRoast, startGrind, temper as ccTemper, mould as ccMould, takeBar, KINDS as CC_KINDS,
  pantryPanel, bonbonPanel, casePanel, onDisplay as ccOnDisplay, stockPantry, unstockPantry, makeBonbons, recipeOf as bonbonOf, toggleDisplay as ccToggle, packBox, eatBonbon,
  sendScoop, wineToPantry, packPairing, makeSpecial, takeSpecial, upsPanel as ccUpsPanel, buyCcUp, haveHot, packGrand, readyPot, ccUp, emptyVending, pickAdd, pickFill,
  registerBoxes, makePralines, makeCoinTins } from "./cocoa.js";
import { canKeep, keepPanel, placedPanel, placeKeep, takeKeep, keepsakesIn, adoptPanel, adopt as adoptPet, petPanel, petsIn, companions, playLine, ownerLine, fill as petFill, PET_HOMES, ownerName, PETS, petAt } from "./companions.js";
import { GOALS, owns, buyGoal, goalPanel, garagePanel, jettyPanel, ride, rideSpeed } from "./goals.js";
import { diningTable, skyWash, tapeLabel } from "../art/scenes.js";
import { orchState, orchTick, handTin, spotPanel, shopPanel, potPanel, teaPanel, wireOrchard, stateOf, tourBoard } from "./orchard.js";
import { TREES, FLOWERS, TREE_ROWS, TREE_XS, BUSH_Y, BED_ROWS, FLOWER_XS } from "../data/orchard.js";
import { discoNow, discoOn, DISCO_FROM, aperitivoNow, vanNow, movieNow, bayMarketNow, BAY_STALLS, KITE_SELLER, SCREEN, lastFriday, tourNow, eventNow, eventOn, eventsOn, xmasOn, XMAS_FROM, XMAS_TO, XMAS_LIT, XMAS_TREE, stallAt, STALL_SPOTS, STAGE, keeperAway, classOn, DINING, tableSeat, fmtTime, wineClubOn, wineClubNow, clubMembers, setStallOwned, workshopGroup, letGuests } from "./tours.js";

/* =================== STATE =================== */
const freshToday = () => ({day:dayKey(), berries:0, earned:0, steps:0, stepMs:0, water:0, crown:false, npcSaid:{}, harvested:0, updatedAt:0});
const freshFox = () => ({name:"", xp:0, days:0, streak:0, lastActive:null, coins:null, inv:null, plots:null, cool:{}, met:{}, gifts:{}, mailRead:{}, updatedAt:0});
const load = (k, f) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ? Object.assign(f(), v) : f(); } catch { return f(); } };
let S = load("fox.today", freshToday), F = load("fox.fox", freshFox);
function migrate(){
  if (S.day !== dayKey()) S = freshToday();
  if (S.waterMl == null) { S.waterMl = (S.water || 0)*250; S.waterPaid = Math.min(4, S.water || 0); }
  if (F.coins == null) F.coins = S.berries || 0;
  if (!F.inv) { F.inv = {tulip_seed:2, carrot_seed:1}; F.gift = true; }
  if (!F.tools) F.tools = {};
  if (!F.fam) F.fam = {owned: {}, gifts: {bo: 0}};
  ensurePets(F);
  if (!Array.isArray(F.plots) || F.plots.length !== 12) F.plots = Array.from({length:12}, () => null);
  if (!F.cool) F.cool = {};
  ["met", "gifts", "mailRead"].forEach(k => { if (!F[k]) F[k] = {}; });
  ["decor", "decorOwned", "history"].forEach(k => { if (!F[k] || typeof F[k] !== "object") F[k] = {}; });
  if (!Array.isArray(F.upgradeLog)) F.upgradeLog = [];
  if (!F.totalQuests) F.totalQuests = 0;
  if (F.harvestTotal == null) F.harvestTotal = Object.values(F.history || {}).reduce((n, h) => n + (h.harvest || 0), 0);   // a start for the harvest trophies
  if (!Array.isArray(S.chats)) S.chats = [];
  if (!S.npcSaid) S.npcSaid = {};
  renameIds(F);
  QB.board(F);
}
// Saves from before the internal names changed: old place and villager ids become the new ones (once; harmless after)
const OLD_IDS = {chord: "carpentry", fresh: "library", chico: "haberdash", luna: "tailor", ohayo: "okadahouse", kidroom: "guestroom", jason: "ornella", luca: "dario"};
const OLD_PEOPLE = {jason: "ornella", luca: "dario"};
function renameIds(F){
  const keys = o => { if (!o || typeof o !== "object") return; Object.entries(OLD_PEOPLE).forEach(([a, b]) => { if (a in o) { if (!(b in o)) o[b] = o[a]; delete o[a]; } }); };
  if (F.where && OLD_IDS[F.where.scene]) F.where.scene = OLD_IDS[F.where.scene];
  const b = F.board || {}; [b.hearts, b.giftPts, b.gifted, b.story, F.fam && F.fam.gifts, F.bouquets, F.met, F.gifts, F.guestLog, F.book && F.book.ids, F.book && F.book.offers, F.book && F.book.lines].forEach(keys);
  const st = F.story || {}; [st.heard, st.day].forEach(keys);
  if (F.guest && OLD_PEOPLE[F.guest.id]) F.guest.id = OLD_PEOPLE[F.guest.id];
  if (F.trip && Array.isArray(F.trip.party)) F.trip.party = F.trip.party.map(id => OLD_PEOPLE[id] || id);
  (F.book && F.book.sent || []).forEach(x => { if (OLD_PEOPLE[x.to]) x.to = OLD_PEOPLE[x.to]; });
  (F.trophies || []).forEach(t => { if (t.fam === "maple") { t.fam = "chum"; t.id = String(t.id).replace(/^maple-/, "chum-"); } });   // the pet's friendship plaques
}
migrate();
setPaperArtF(() => F);
setArtContext({cocoa: () => cocoaState(F), F:() => F, scoop: () => scoopState(F), vine: () => vineState(F), kitchen: () => kitchenState(F), tapas: () => { const l = tapasAll(F, dayKey()); return l.length ? l.map(t => TAPAS[t.id].n).join(" · ") : null; }, vineStock: () => shelfStock(vineState(F)), S:() => S, boardCount: () => QB.tasksLeft(F) + QB.board(F).reqs.length, growth:p => growth(p), stats:() => ({}), day:() => dayKey(), lanterns:() => (S.pond ? (S.pond.shown ?? S.pond.wins.length) : 0), dusk:() => isDusk(), music:() => sound.music, ped: (x, y) => { const i = stationsOf("trophy").filter(s => s.kind === "pedestal").findIndex(s => s.x === x && s.y === y); return i < 0 ? null : onPedestals(F)[i] || null; }, millCrate: () => owns(F, "mill") && !owns(F, "millshop") && !owns(F, "giftshop") ? crateMix(F) : null, giftMill: () => crateMix(F), galleryStock: () => owns(F, "giftshop") && GAL.stockUp(F, dayKey()), xmasSeason: () => xmasOn(dayKey())});
function isDusk(){ const t = localHM(); return t >= 19*60 || t < 6*60; }
let say = null, refs = null, writing = {}, pending = {}, speechT = null, speechLock = 0;
let scene = "base", atSpot = null, boardOpen = false, selPlot = null, shopTab = "seeds";
// In-game UI: the quest note pinned on the map (open, or slim while walking) and the panel over the map.
// The note starts folded when the village opens; it only pops open on step changes after the first few seconds.
let qnOpen = false, qnQuietUntil = Date.now() + 5000, qnKey = "", openView = null, shopClosed = false;
let guestView = false, habView = false, habSt = {}, tailView = false, tailSt = {}, homeView = null, newsOpen = false, friendTab = "where", newsTab = "wins";   // homeView: "stored" (the fridge) or "shelf" (the garage shelf) while one is open

// Cloud saves wait until the cloud copy has loaded once (synced). Without that, a save made in the first moments after
// opening (from a blank or stale copy in this browser) would overwrite the real save: phone and laptop each keep their
// own browser copy, and the Claude app can clear it between visits.
const loadedAt = {today: S.updatedAt || 0, fox: F.updatedAt || 0}, synced = {today: false, fox: false};
let leaving = false;   // switching save slots: nothing more gets written before the page reloads
function persist(which){
  if (leaving) return;
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
// Your pet (art/pets.js): its colours on :root, and its drawings in the backpack portrait, the follower on the map,
// and the heads in the bike basket and the car. Redrawn only when the species changes (a new game).
function dressPet(){
  const k = speciesOf(F), a = petArt(k), [c1, c2, c3] = SPECIES[k].cols, r = document.documentElement.style;
  r.setProperty("--pet1", c1); r.setProperty("--pet2", c2); r.setProperty("--pet3", c3);
  if (document.body.dataset.petkind === k) return; document.body.dataset.petkind = k;
  $("fTail").innerHTML = a.tail; $("fBody").innerHTML = a.body; $("fHeadArt").innerHTML = a.head; $("napBody").innerHTML = a.nap;
  const mm = $("mchum"); mm.querySelector(".bob.stand").innerHTML = a.stand; mm.querySelector(".curl").innerHTML = a.curl;
  document.querySelectorAll(".petPeek").forEach(g => { g.innerHTML = a.peek; });
}
// A new game starts with the setup card (setup.js): your name, pronouns and look, then your pet. Dev builds skip it
// (with a plain look and a fox) unless the page asks for it with ?setup=1, so test pages start straight in the village.
function needSetup(){
  if (F.me && F.pet) return;
  if (window.__hbDevStub && !/[?&](setup|intro)=1/.test(location.search)) { F.me = F.me || {name: "", pron: {they: "they", them: "them", their: "their"}, look: lookOf(F)}; if (!F.pet) { F.pet = "fox"; F.name = F.name || SPECIES.fox.names[0]; } return; }
  const setup = () => openSetup(F, {done: () => { dressPet(); applyWear(); save(true);
    speak(`Welcome to Honeybrook, ${myName(F)}. The neighbours have aired out Uncle Wilf's house and left bread on the table, and ${F.name} has already found the best spot in it.`, 7000); }});
  setTimeout(() => { if ((F.me && F.pet) || setupOpen() || introOpen()) return;
    // a new game starts with the story (intro.js), once; then the setup card
    if (F.introSeen) { setup(); return; }
    openIntro({trainArt: () => trainRideArt(false), sfx, done: () => { F.introSeen = true; setup(); }}); }, 900);
}
// A small per-day record for the Friday paper (last 21 days).
function noteHistory(){
  if (!F.history) return;
  F.history[S.day] = {q: doneToday(), steps: S.steps || 0, water: S.waterMl || 0, harvest: S.harvested || 0, coins: S.earned || 0, chats: (S.chats || []).slice(0, 12)};
  Object.keys(F.history).sort().slice(0, -21).forEach(k => delete F.history[k]);
}
const save = (redraw) => { clearSlots(); F.where = {scene, x: Math.round(hero.x), y: Math.round(hero.y), day: dayKey()}; noteHistory(); persist("today"); persist("fox"); render(redraw); };

// The cloud: the dev builds' stand-in, or Firebase for the public game (cloud.js), once you've signed in. Each save slot
// is its own collection of documents (fox, today, routines, journal). Not signed in, the game saves in this browser only.
let player = null, remote = {};   // the signed-in player, and the slots' cloud summaries for the welcome screen
async function initDb(){
  const dev = window.__hbDevCloud;
  if (dev) { const [db, user] = await Promise.all([dev.use("db"), dev.use("user")]); if (!db || !user) return;
    const uid = await user.id(); if (uid) connect(db.collection("data/users/" + uid + (activeSlot() > 1 ? "/slot" + activeSlot() : ""))); return; }
  CL.watchPlayer(p => {
    const was = player; player = p; refreshTitle({checking: false});
    // another account signed in on this browser: its own games only (this browser's copies belonged to someone else,
    // and are safe in their account)
    if (p) { let owner = null; try { owner = localStorage.getItem("hb.owner"); localStorage.setItem("hb.owner", p.uid); } catch {}
      if (owner && owner !== p.uid) { leaving = true; clearAllSlots(); location.reload(); return; } }
    if (p && !refs) connect(CL.slotCollection(p.uid, activeSlot()));
    if (was && !p) { leaving = true; location.reload(); return; }   // signed out: back to this browser's copy only
    if (p) cloudSummaries(); else refreshTitle({player: null, remote: {}});
  });
}
async function cloudSummaries(){
  if (!player) return; remote = {};
  await Promise.all([1, 2, 3].map(async n => { try { const s = await CL.slotCollection(player.uid, n).doc("fox").get(); if (s.exists) remote[n] = summaryOf(s.data()); } catch {} }));
  refreshTitle({player, remote});
}
// signed in: wait (a few seconds at most) for this slot's cloud copy before deciding it's a new game
function whenSynced(fn){ const t0 = Date.now(), go = () => (!player || synced.fox || Date.now() - t0 > 6000) ? fn() : setTimeout(go, 150); go(); }
function connect(col){
  attachRoutines(col, () => { if (routOpen && !/^(rtName|rtNew|rtPaste)$/.test(document.activeElement?.id || "") && !document.activeElement?.dataset?.day && !document.activeElement?.dataset?.item) ctx(); });
  attachMyDocs(col, id => { if (id === "journal" && journalOpen && document.activeElement?.id !== "jText") ctx(); });
  refs = {today: col.doc("today"), fox: col.doc("fox")};
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
// The quest board's state lives in F.board (quests.js). A day with something ticked is a quest day.
const doneToday = () => QB.myTasks(F).filter(t => QB.isDone(t)).length;   // tasks ticked off today
/* =================== FARM =================== */
function growth(p){ if (!p || !p.crop || !p.wateredAt) return 0; return clamp((Date.now() - p.wateredAt + (p.bonus || 0)) / (CROPS[p.crop].dur / ((F.tools || {}).compost ? 1.25 : 1)), 0, 1); }
// The garden shed: garden tools bought once with coins, kept forever.
const SHED = {
  can:       {n: "Big watering can", price: 60, ico: "wateringCan", what: "Waters every thirsty plot in one go."},
  compost:   {n: "Compost bin", price: 150, ico: "compost", what: "Everything grows a quarter faster."},
  sprinkler: {n: "Sprinkler", price: 300, ico: "sprinkler", what: "New seeds water themselves the moment you plant them."},
  // round 155: three more, each working on every plot at once
  seeder:     {n: "Auto seeder", price: 350, ico: "seeder", what: "One tap sows every empty plot, and it re-sows each plot after picking."},
  fertiliser: {n: "Fertiliser", price: 250, ico: "fertiliser", what: "One more of everything you pick, in the garden and the greenhouse."},
  harvester:  {n: "Auto harvester", price: 450, ico: "harvester", what: "Anything ripe in the garden or greenhouse comes straight into your backpack."}
};
// keepsakes and pets (companions.js): the keepsake being placed, a placed one's shelf, the pet being adopted (and for
// whom), and the pet whose card is open
// the Cocoa Room's open card: "counter", "wall", or a kitchen station ("sacks", "roaster", "grinder", "slab", "moulds")
let vanView = null, vanSt = {slot: "bedding"};   // the campervan's mood board
let friView = null, lastFri = "";   // round 112: the fishmonger's van panel (or a Friday market stall); the Friday art key
let xmPick = null;   // round 174: the hamper picked to post
let ghBed = null, millOpen = false, lastMill = "";   // round 110: the olive press panel, and the mill's art key   // round 109: the greenhouse bed being looked at
let rondaView = null;   // round 107: a Ronda shop (ronda.js): "mercado", "tapas", "dulces", "convento", "azulejos"
let woodsView = null;   // round 103: "ranger", "bike" or a river taxi stop id (transport.js, woods.js)
let fishSpot = null, fishSt = {}, fishT = null;   // fishing: which spot you're at, and the cast in progress (fishing.js)
let railOpen = false, lastTrain = "", tripPick = [], tripTown = "ronda", ferryTown = "saltwick", boatTown = "saltwick";   // (round 215: the ferry goes to the islands too)   // the timetable board on Honeybrook's platform
let lastFarm = 0;
// the farm's clock: your shelf at the farm stand sells, and a hive left full too long swarms
function farmNow(){
  lastFarm = Date.now(); if (!F.hfarm) return;
  const out = hfTick(F);
  if (out.swarms.length) { if (scene === "hfarm") { speak(`Oh no: ${out.swarms.map(x => typeof x === "number" ? `hive ${x}` : x).join(" and ")} swarmed! A cloud of bees off over the barn. Felix sighs: "Next time, collect it a bit sooner."`, 6000); drawScene(); } else flash(`A hive swarmed at Wildflower Farm`); }
  if (out.coins && scene === "hfarm") { sfx("coin"); flash(`+${out.coins} coins from your shelf at the farm stand`); }
  if (out.coins || out.swarms.length) save();
}
// trust from Felix and Elena: a little for every chore, and a celebration at each new level
function farmTrust(n){ const lv = gainTrust(F, n); if (lv == null) return;
  const L = HF_LEVELS[lv]; setTimeout(() => { sfx("chaching"); act("cheer"); [0, 300, 600].forEach((d, k) => setTimeout(() => mprop("sparkle", hero.x + (k - 1)*24, hero.y - 60, 1800), d)); speak(`Felix and Elena trust you more and more: you're their ${L.n.toLowerCase()} now! They've given you ${L.gives}.`, 7000); }, 900); }
let hfView = null, hfSt = {kind: "cheddar", name: "", sug: 0};   // Wildflower Farm: "cows" / "goats" / "hives" / "stand"; in the barn "extractor" / "crock" / "press" / "cave"
let ccView = null, lastCocoa = 0, ccSt = {shell: "dark", sel: []};   // ccSt: the bonbon table's picks
const COCOA_IN = ["cocoa", "cocoakitchen"];
let keepItem = null, keepSpot = null, adoptItem = null, adoptSt = {}, petView = null;
let goalView = null, paddling = false, scView = null, scSt = {pick: null, sel: []}, lastScoop = 0;
// the Scoop Shack's rooms, and its panels that open from anywhere (the catalogue, the honesty freezer, the delivery bike)
const SCOOP_IN = ["scoopshop", "scoopkitchen", "scoopdip"], SC_ANY = ["upgrade", "honesty", "deliver", "trolley"];   // a big goal's "save up for it" card ("garagepick": the garage's ride chooser)
let fieldView = null, orView = null, orAt = null, orTab = null, potItem = null, kView = null, vyView = null, vyAt = null, trophyView = null, routOpen = false, shedOpen = false, runOpen = false, wardOpen = false, bedOpen = false, journalOpen = false, calmOpen = false, recOpen = false;
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
function buyTool(id){
  const t = SHED[id]; if (!t || F.tools[id] || F.coins < t.price) return;
  F.coins -= t.price; F.tools[id] = true; sfx("chaching"); act("cheer"); flash(`New in the shed: ${t.n.toLowerCase()}`);
  speak(isHere("bo") ? `Bo's setting up the ${t.n.toLowerCase()} for you!` : `The ${t.n.toLowerCase()} is ready in the garden.`, 4500);
  if (id === "can") F.plots.forEach((p, i) => { if (p && p.crop && !p.wateredAt) p.wateredAt = Date.now(); });
  save();
}
// Your bed: a 20-minute nap (wakes with a chime) or lying down until you get up. Leaving the room wakes you.
function bedAction(k){
  if (k === "up") { S.sleep = null; speak("Morning, sleepyhead. Well, sort of.", 3000); }
  else { S.sleep = {until: k === "nap" ? Date.now() + 20*M : null, at: Date.now()}; speak(k === "nap" ? "Twenty minutes. I'll wake you." : (localHM() >= 20*60 || localHM() < 5*60) ? "Goodnight. Sweet dreams." : "Lie down as long as you like.", 3500); }
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
  speak(isHere("bo") ? `Bo's building the ${nx.n.toLowerCase()}. Hammer, hammer!` : `Ta-da! The ${nx.n.toLowerCase()} is ready.`, 4500); save(true);
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
function flash(msg){ msg = petify(msg, F); lastFlash = msg; const e = $("earn"); e.textContent = plain(msg); clearTimeout(earnT); earnT = setTimeout(() => e.textContent = "", 4000); }
function earn(n, why){ if (!/task|request/.test(why)) sfx("coin"); F.coins += n; S.earned += n; markActive(); flash(`+${n} coins: ${why}`); mprop("coin", hero.x, hero.y - 60, 1800); }
function gainXp(n){
  const before = level(); F.xp += n;
  if (level() > before) { const L = LEVELS[level()]; setTimeout(() => { act("cheer"); speak(`We're ${L.name}s now 💕${L.gift ? " I got " + L.gift + "!" : ""}`, 6000); }, 2600); }
}
const addInv = (id, n) => { F.inv[id] = (F.inv[id] || 0) + n; if (F.inv[id] <= 0) delete F.inv[id]; };

/* =================== SPEECH =================== */
function defaultLine(){
  if (scene === "market") return "Shop's open! Have a browse.";
  if (scene === "farm") return readyCount() ? "Something's ready to harvest!" : "Tap a plot to plant or water.";
  if (townOf(scene)) return `A day in ${TOWNS[townOf(scene)].n}. Wander, look, taste.`;
  const left = QB.tasksLeft(F), reqs = QB.board(F).reqs.length;
  if (left) return `${left} task${left === 1 ? "" : "s"} on your list today. One at a time.`;
  if (reqs) return `${QB.board(F).reqs[0].name} is hoping for a hand. It's on the quest board.`;
  return pick(["What shall we do today?", "Garden? Shopping? Snacks?", "Lovely day for a wander."]);
}
// Peace and quiet: whenever there are no active quests (all done, or none yet), nobody pipes up on their own and
// the pet's bubble tucks itself away after a few seconds. Bubbles only appear in answer to a tap. Not during the
// lantern wind-down or a running timer. Settings can turn it off (F.quietEvening === false).
let lastInput = 0;
["pointerdown", "keydown"].forEach(t => document.addEventListener(t, () => { lastInput = Date.now(); }, {capture: true}));
const hushed = () => F.quietEvening !== false && !QB.tasksLeft(F) && !(S.pond && (S.pond.shown != null || Date.now() - (S.pond.done || 0) < 20e3));
let speechAt = 0;
const unprompted = () => Date.now() - lastInput > 1500;
const quietNow = () => hushed() && unprompted();
function speak(text, ms, force){
  text = petify(text, F);
  const el = $("speech");
  if (!force && quietNow()) { if (!el.hidden) el.textContent = plain(text); return; }
  el.hidden = false; speechAt = Date.now(); el.textContent = plain(text); el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop");
  clearTimeout(speechT); speechLock = ms ? Date.now() + ms : 0;
  if (ms) speechT = setTimeout(() => { speechLock = 0; el.textContent = plain(say ? say.line : defaultLine()); }, ms);
}
function setSay(line, buttons){ say = {line, buttons}; speak(line); }

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
function hearts(n){ for (let i = 0; i < n; i++) setTimeout(() => { prop("heart", "p-heart", 58 + Math.random()*16, 48 + Math.random()*10, 1900); mprop("heart", chum.x + rnd(-8, 8), chum.y - 30, 1900); }, i*240); }
function pose(){ portrait.classList.toggle("sleeping", portrait.dataset.nap === "1"); }
function act(kind, item){
  clearTimeout(animT);
  [...portrait.classList].filter(c => c.startsWith("fox-")).forEach(c => portrait.classList.remove(c)); void portrait.offsetWidth;
  portrait.dataset.nap = "0";
  const cls = {eat:"fox-eat", brush:"fox-brush", bath:"fox-bath", ball:"fox-ball", yarn:"fox-yarn", hide:"fox-hide", cheer:"fox-cheer", nudge:"fox-nudge", crown:"fox-cheer", fort:"fox-cheer", flower:"fox-cheer"}[kind];
  if (cls) portrait.classList.add(cls);
  const mm = $("mchum"); mm.classList.remove("hop"); void mm.getBBox();
  if (kind !== "nudge" && kind !== "nap") mm.classList.add("hop");
  if (item) mprop(item.ico, chum.x, chum.y - 34, 1900);
  let d = 3200;
  if (kind === "eat") { prop(item.ico, "p-food", null, null, 2300); setTimeout(() => hearts(3), 1800); }
  if (kind === "flower") { prop(item.ico, "p-food", null, null, 2300); setTimeout(() => hearts(4), 1600); }
  if (kind === "brush") { prop("brush", "p-brush", null, null, 2900); setTimeout(() => prop("sparkle", "p-heart", 72, 66, 1900), 900); setTimeout(() => prop("sparkle", "p-heart", 58, 72, 1900), 1600); }
  if (kind === "bath") { for (let i = 0; i < 9; i++) setTimeout(() => prop("bubbles", "p-bubble", 54 + Math.random()*24, 84, 2700), i*220); }
  if (kind === "ball") { prop("ball", "p-ball", null, null, 1800); setTimeout(() => hearts(2), 1500); }
  if (kind === "yarn") prop("yarn", "p-yarn", null, null, 3300);
  if (kind === "hide") { d = 4300; prop("eyes", "p-peek", 65, 84, 4300); setTimeout(() => hearts(3), 3900); }
  if (kind === "nap") { d = Math.round(7000*SPECIES[speciesOf(F)].sleepy); portrait.dataset.nap = "1"; mapleNap = Date.now() + d;   /* a capybara naps longest */ [0, 800, 1600, 2400].forEach(t => setTimeout(() => prop("z", "p-z", 52, 56, 4800), t)); }
  if (kind === "crown") { S.crown = true; hearts(3); }
  if (kind === "fort") { d = 5000; prop("fort", "p-fort", 65, 70, 5000); setTimeout(() => hearts(4), 3000); }
  if (kind === "cheer") hearts(3);
  pose();
  animT = setTimeout(() => { [...portrait.classList].filter(c => c.startsWith("fox-")).forEach(c => portrait.classList.remove(c)); portrait.dataset.nap = "0"; mm.classList.remove("hop"); pose(); }, d);
}

/* =================== SOUND + TIMERS =================== */
let lastReady = readyCount(), lastDusk = null, lastFieldEv = null, lastSky = null;
const skyKey = () => skyWash(localHM()) + scene;
setInterval(() => {
  if (S.sleep && S.sleep.until && Date.now() > S.sleep.until) wakeUp();
  if (hushed() && !$("speech").hidden && Date.now() > speechLock && Date.now() - speechAt > 6000) $("speech").hidden = true;   // tuck the pet's bubble away
  bedtimeTick(); vineTick(); orchardTick();
  if (scene === "field" && countdownDue(F, dayKey(), localHM())) treeCountdown();
  { const got = collectReplies(F, Date.now() + (globalThis.__hbOffset || 0)); if (got.length) { save(); got.forEach((g, k) => setTimeout(() => { if (g.gift) { flash(ITEMS[g.gift] ? ITEMS[g.gift].n : "A little something"); speak(`A parcel from ${g.from}, with a postcard. It's in your backpack, and the postcard's in your letterbox.`, 5500); } else speak(`${g.from} wrote to say thank you for the hamper, and they've pinned up an order for another at the post office.`, 5500); }, 1500 + k*6000)); } }
  if (S.day !== dayKey()) { S = freshToday(); say = null; save(true); speak(defaultLine()); return; }
  // the morning's village requests go up once the save has loaded (so a cloud copy can't wipe them straight away)
  if (QB.board(F).lastPost !== dayKey() && (!refs || synced.fox)) { if (postRequests()) save(true); else persist("fox"); }
  harvesterTick();
  const rc = readyCount();
  if (rc > lastReady) { speak(rc === 1 ? "Psst… something in the garden is ready!" : `${rc} crops ready in the garden!`, 5000); if (scene === "farm") drawScene(); }
  lastReady = rc;
  if (scene === "farm" && Math.random() < .2) { drawScene(); if (selPlot != null) ctx(); }
  if (Date.now() - lastScoop > 20000) scoopNow();
  if (Date.now() - lastCocoa > 20000) cocoaNow();
  paperNow();
  if (Date.now() - lastFarm > 20000) farmNow();
  { const l = bikeExpired(F); if (l) { speak(l, 4500); save(); } }
  townTick();
  { const k = scene === "bay" ? `${vanNow(dayKey(), localHM())}${spotOpen("bay")}` : scene === "field" ? `${!!(S.kite && S.kite.until > Date.now())}${movieNow(dayKey(), localHM())}${bayMarketNow(dayKey(), localHM())}` : ""; if (k !== lastFri) { lastFri = k; if (k) drawScene(); } }
  if (scene === "mill") { const m = millState(F), k = m.press ? (pressLeft(m) ? "on" : "ready") : ""; if (k !== lastMill) { lastMill = k; drawScene(); if (millOpen) ctx(); } }
  if ((outside() || scene === "terrace") && skyKey() !== lastSky) { lastSky = skyKey(); drawScene(); }
  { const tk = outside() ? trainKey(scene) : ""; if (tk !== lastTrain) { lastTrain = tk; drawScene();   // a train coming through: draw it (it runs on from where it is)
      const t = tk && trainHere(scene); if (t && scene === "hlane" && t.mode === "arrive") speak(`Here comes the ${railTime(t.t)}: ${t.n.toLowerCase()} ${t.to}.`, 4000); else if (t && t.mode === "pass") speak(t.dir === "e" ? "Toot toot! A train rattles past, on its way to Honeybrook station." : "A train chuffs by along the top, off to the city.", 3500); } }   // the sunset deepens: redraw every 5 minutes through the evening
  // the field when a market, fair or night market starts or packs up (and the night market's light drops at 7): redraw, and the jazz starts or stops
  if (scene === "field") { const ev = eventNow(dayKey(), localHM()), k = ev ? ev.kind + (localHM() >= 19*60) : ""; if (k !== lastFieldEv) { lastFieldEv = k; drawScene(); } }
  setLive(liveNow());
  lastDusk = isDusk();
}, 1000);
/* =================== ACTIONS =================== */
const A = {
  pond(){ go("base", VILLAGE.pond.door[0], VILLAGE.pond.door[1], () => arriveVillageSpot("pond")); },
  journal(){ if (scene === "room") { journalOpen = true; render(); } else { const sp = spotObj("room", "journal"); go("room", sp.tx, sp.ty, () => arriveSpot("journal")); } },
  water(ml){ setWater((S.waterMl || 0) + (ml || GLASS)); speak(pick(["Glug glug!", "Hydrated!", "Water break, good call."]), 3000); }
};
/* ---------- the quest board: your tasks (quests.js) ---------- */
function tickMine(id){
  const r = QB.tickTask(F, id); if (!r) return;
  sfx("chaching");
  if (r.coins) { earn(r.coins, "task done"); gainXp(1); }
  else flash(`Done! (Today's ${QB.PAID_PER_DAY} paid ticks are used up.)`);
  if (r.first && r.coins) {
    countQuest();
    let grew = 0; F.plots.forEach(p => { if (p && p.crop && p.wateredAt && growth(p) < 1) { p.bonus = (p.bonus || 0) + QUEST_BOOST; grew++; } });
    grew += questBoost(F, QUEST_BOOST) + ghBoost(F, QUEST_BOOST);   // the vines, barrels, oven and cheese press move on too
    act("cheer"); speak(pick(YAY) + (grew ? " The garden grew a little." : ""), 4000);
  } else act("cheer");
  undoable(`Ticked “${r.t.title}”`, () => untickMine(id, true));
  save(true);
}
function untickMine(id, quiet){
  const back = QB.untickTask(F, id); if (back) { F.coins -= back; S.earned = Math.max(0, (S.earned || 0) - back); }
  if (!quiet) sfx("paper", true);
  save(true);
}
function addMine(title, daily){
  const t = QB.addTask(F, title, daily); if (!t) return null;
  sfx("paper", true); speak(daily ? `“${t.title}” is on your list every day now.` : `“${t.title}” is pinned to the board.`, 3500); save(true); return t;
}
function removeMine(id){
  const r = QB.removeTask(F, id); if (!r) return;
  sfx("paper", true); undoable(`Took down “${r.t.title}”`, () => { QB.restoreTask(F, r); save(true); }); save(true);
}
/* ---------- the quest board: village requests (quests.js) ---------- */
// villagers who live in Honeybrook and could ask for something (quests.js ASKERS: not family, not visitors)
const askers = () => NPCS.filter(n => QB.ASKERS[n.id]).map(n => ({id: n.id, name: n.name}));
function postRequests(){
  const fresh = QB.refreshRequests(F, askers(), dayKey());
  if (fresh.length) setTimeout(() => speak(fresh.length === 1 ? `${fresh[0].name} pinned a request to the quest board.` : "New requests on the quest board!", 5000), 2500);
  return fresh.length;
}
const haveOf = id => F.inv[id] || 0;
// walk to wherever the villager is right now (the board's "find" button); hand it over on arrival if it's ready
function findAsker(who){
  const w = whereAt(who); if (!w) { speak(`${QB.requestFrom(F, who)?.name || "They"}'s at home just now. Try again later.`, 4000); return; }
  openView = null; boardOpen = false; render();
  go(w.scene, w.x, w.y + 24, () => { atSpot = null; offerHandOver(who); });
}
// tapping a villager with a request open: hand it over if the backpack has it -> true if a request was mentioned
function offerHandOver(who){
  const r = QB.requestFrom(F, who); if (!r) return false;
  if (haveOf(r.item) < r.n) {   // not enough yet: a gentle reminder once a day, then their usual chat
    if (S.npcSaid["req:" + r.id] || storyReady(F, who)) return false;   // a story chapter waiting comes first
    S.npcSaid["req:" + r.id] = true;
    npcSay(who, `Still hoping for ${QB.reqLine(r)} ${QB.dueLine(r)}, if you can. No rush!`); save(); return true; }
  setSay(`${r.name} needs ${QB.reqLine(r)}. You have them.`, [[`Hand over ${QB.reqLine(r)}`, () => handOverTo(who)], ["Not yet", () => setSay("Keeping them for now.")]]);
  qnOpen = true; journal(); return true;
}
function handOverTo(who){
  const res = QB.handOver(F, who, (id, n) => addInv(id, -n), addInv); if (!res) return;
  sfx("chaching"); earn(res.coins, `${res.r.name}'s request`); gainXp(2); hearts(3); countQuest();
  npcSay(who, pick(["Oh, perfect! Thank you so much.", "You're a star. Exactly what I needed.", "Brilliant, thank you! Come by any time."]));
  setSay(`${res.r.name}: ${res.hearts} heart${res.hearts === 1 ? "" : "s"}.${res.gift ? " There's a little gift in your letterbox." : res.letter ? " Watch your letterbox." : ""}`);
  save(true);
}
// Every paid task ticked counts towards village upgrades, which stay forever.
function countQuest(){
  const before = unlocked(F.totalQuests || 0).length;
  F.totalQuests = (F.totalQuests || 0) + 1;
  F.storyDay = dayKey();   // villagers tell their stories on days you've done something real (stories.js)
  addBait(F, 1);   // every quest done digs up a worm for the bait tin (fishing.js)
  const now = unlocked(F.totalQuests);
  if (now.length > before) {
    const u = now[now.length - 1]; F.upgradeLog.push({id: u.id, day: dayKey()});
    setTimeout(() => { act("cheer"); speak(`Village upgrade! ${u.name[0].toUpperCase() + u.name.slice(1)}.`, 6000); flash(`Village upgrade: ${u.name}`); if (outside()) drawScene(); }, 2400);
  }
}
document.addEventListener("visibilitychange", () => { if (document.hidden) flushSaves(); });
window.addEventListener("pagehide", () => flushSaves());
// Leaving or hiding the page: send any save that's still waiting out its half-second delay right away
function flushSaves(){ ["today", "fox"].forEach(w => { if (pending[w] && refs && synced[w]) { clearTimeout(pending[w]); pending[w] = null; push(w, true); } }); }

const CAL_DAYS = 14, FEST_DAYS = 92;
function villageCalendar(){
  const today = dayKey(), addD = (k, n) => new Date(Date.parse(k + "T00:00:00Z") + n*864e5).toISOString().slice(0, 10);
  const fmtD = k => new Date(k + "T00:00:00Z").toLocaleDateString("en-GB", {weekday: "short", day: "numeric", month: "short", timeZone: "UTC"});
  const hhmm = m => { const h = Math.floor(m/60), mm = m % 60; return `${h % 12 || 12}${mm ? ":" + String(mm).padStart(2, "0") : ""}${h < 12 ? "am" : "pm"}`; };
  const until = k => { const n = Math.round((Date.parse(k + "T00:00:00Z") - Date.parse(today + "T00:00:00Z"))/864e5); return n === 0 ? "today" : n === 1 ? "tomorrow" : `in ${n} days`; };
  const fests = FESTIVALS.flatMap(f => f.dates.map(k => ({f, k, from: addD(k, -f.before), to: addD(k, f.after)}))).filter(x => x.to >= today && x.k <= addD(today, FEST_DAYS)).sort((a, b) => a.k.localeCompare(b.k));
  const days = [];
  for (let i = 0; i < CAL_DAYS; i++) {
    const k = addD(today, i), list = [];
    for (const ev of eventsOn(k)) list.push(`${ev.name}, ${hhmm(ev.from)} to ${hhmm(ev.to)} on the field${ev.kind === "market" ? ` (our wine stall's there${F.cocoa && F.cocoa.up && F.cocoa.up.cart ? `, and ${cocoaState(F).name}'s chocolate cart` : ""})` : ev.kind === "night" ? ` (with a jazz duo, and the cart from ${scoopState(F).name})` : ev.kind === "xmas" ? ` (the tree's lit at 5:30${k.slice(5) === "11-20" ? ", for the very first time tonight" : ""})` : ""}`);
    if (xmasOn(k)) { const d = new Date(k + "T00:00:00Z").getUTCDay(); if (d === 5) list.push("Carols by the Christmas tree, 7pm"); if (d === 0 || d === 6) list.push("Santa's grotto on the field, 5 to 8pm"); if (k.slice(5) === "12-24") list.push("The lantern walk round the field, 8:15pm"); if (k.slice(5) === "12-01") list.push("Hamper orders start at the post office"); }
    if (F.cocoa && F.cocoa.up && F.cocoa.up.workshop && new Date(k + "T00:00:00Z").getUTCDay() === 6) list.push(`Bonbon workshop at ${cocoaState(F).name}, 2 to 4pm`);
    if (owns(F, "cellar") && wineClubOn(k)) list.push(`Wine club at the cellar door, 6 to 9pm`);
    if (owns(F, "cellar") && discoOn(k)) list.push(`Disco night at the cellar door, 8 to 11:30pm`);
    if (vineState(F).terrace && new Date(k + "T00:00:00Z").getUTCDay() === 0) list.push(`${mothersDay(k) ? "Mother's Day long lunch" : "Sunday long lunch"} on the terrace, 12 to 3pm (${bookingsFor(k).reduce((n, b) => n + b.size, 0)} booked)`);
    if (vineState(F).terrace) { const oc = occasionOn(k), w = oc === "wedding" && weddingOn(k), hm2 = m => hhmm(m % (24*60)); if (oc) list.push(w ? `A wedding on the terrace: ${w.couple}, 2 to 7pm` : `${OCC[oc].n} on the terrace, ${hm2(OCC[oc].from)} to ${hm2(OCC[oc].to)}`); }
    if (k.slice(5) === "11-20") list.push("Mulled wine season starts: the big pot's on in the wine shop kitchen, till Boxing Day");   // round 153
    fests.filter(x => x.k === k).forEach(x => list.push(`${x.f.name}!`));
    if (list.length) days.push({k, list});
  }
  return {fests: fests.map(x => ({name: x.f.name, when: x.k === x.from && x.k === x.to ? fmtD(x.k) : fmtD(x.k), until: x.from <= today && today <= x.to ? (x.k < today ? "on now (decorations still up)" : x.k === today ? "today!" : `${until(x.k)}, decorations are up`) : until(x.k)})),
    days: days.map(d => ({when: d.k === today ? "Today" : d.k === addD(today, 1) ? "Tomorrow" : fmtD(d.k), list: d.list}))};
}
function myWins(){
  const w = [], y = F.history && F.history[prevDay(dayKey())];
  if (doneToday()) w.push(`${doneToday()} task${doneToday() > 1 ? "s" : ""} done today`);
  if (y && y.q) w.push(`${y.q} task${y.q > 1 ? "s" : ""} finished yesterday`);
  if (F.streak >= 2) w.push(`${F.streak} cosy days in a row with ${F.name}`);
  if (S.harvested) w.push(`${S.harvested} harvest${S.harvested > 1 ? "s" : ""} from the garden today`);
  if (F.scoop && F.scoop.up && F.scoop.up.bike) { const sg = new Date(Date.now() + (globalThis.__hbOffset || 0) + LOC()).toISOString().slice(0, 10), v = vineState(F);
    const n = (((scoopState(F).sold || {})[sg] || {}).deliv || 0) + (((cocoaState(F).sold || {})[sg] || {}).deliv || 0) + (v.today && v.today.day === sg ? v.today.deliv || 0 : 0);
    if (n) w.push(`Tomo delivered ${n} order${n > 1 ? "s" : ""} on the bike today`); }
  return w;
}

/* =================== MAIL =================== */
// Letters the village writes: the Friday "weekend edition" of the paper, the 6pm wind-down at the pond, villagers'
// thank-yous, postcards and parcels.
const sgAt = (day, h, m = 0) => Date.UTC(+day.slice(0, 4), +day.slice(5, 7) - 1, +day.slice(8, 10), h, m) - LOC();   // a local time on a day, as a timestamp
const WEEKDAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
let localCache = {key: "", items: []};
function localMail(){
  const day = dayKey(), hm = localHM(), key = `${day}:${Math.floor(hm/10)}:${doneToday()}:${QB.villageLetters(F).length}:${thanksMail().length}:${slowMail(F).length}:${PP.bloomMail(F).length}:${BK.bookMail(F).length}:${GAL.galleryMail(F, Date.now()).length}`;
  if (key === localCache.key) return localCache.items;
  const out = [], wd = new Date(day + "T00:00:00Z").getUTCDay();
  if ((wd === 5 && hm >= 900) || wd === 6 || wd === 0) out.push(weeklyPaper(wd === 5 ? day : wd === 6 ? prevDay(day) : prevDay(prevDay(day))));
  if (hm >= 1080 && doneToday()) out.push({id: "wind-" + day, from: "winddown", at: sgAt(day, 18), pond: true,
    title: "Time to close the day", body: "Meet me at the pond. Each of today's wins gets a lantern on the water."});
  { const gl = GU.thanksLetter(F, dearMe(F)); if (gl) out.push(gl); }
  out.push(...QB.villageLetters(F), ...thanksMail(), ...slowMail(F), ...hamperMail(F, Date.now() + (globalThis.__hbOffset || 0)), ...PP.bloomMail(F), ...BK.bookMail(F), ...GAL.galleryMail(F, Date.now()));   // round 129: Jeju's slow-post postcards, two weeks on
  return (localCache = {key, items: out}).items;
}
const allMail = () => localMail();
function weeklyPaper(fri){
  noteHistory();
  const days = Array.from({length: 7}, (_, i) => { let d = fri; for (let k = 0; k < 6 - i; k++) d = prevDay(d); return d; });
  const rows = days.map(d => ({d, ...(F.history[d] || {q: 0, steps: 0, water: 0, harvest: 0, coins: 0, chats: []})}));
  const sum = k => rows.reduce((a, r) => a + (r[k] || 0), 0);
  const q = sum("q"), steps = sum("steps"), coins = sum("coins"), harvest = sum("harvest");
  const best = rows.reduce((a, r) => r.q > a.q ? r : a, {q: 0});
  const wDays = rows.filter(r => r.water > 0), avgW = wDays.length ? sum("water")/wDays.length/1000 : 0;
  const walked = rows.filter(r => r.steps >= stepGoal()).length;
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
// 6pm ritual: walk to the pond, one lantern per win, the pet reads them out, then hand over to chat's wind-down.
function windDown(){
  const wins = QB.myTasks(F).filter(t => QB.isDone(t)).map(t => t.title).slice(0, 8);
  if (S.steps >= stepGoal()) wins.push(`${S.steps.toLocaleString()} steps`);
  if ((S.waterMl || 0) >= waterGoal()) wins.push(`${(waterGoal()/1000).toLocaleString()} litres of water`);
  if (S.harvested) wins.push(`${S.harvested} harvest${S.harvested > 1 ? "s" : ""}`);
  if (!wins.length) wins.push("Showing up today");
  go("base", VILLAGE.pond.door[0], VILLAGE.pond.door[1], () => {
    atSpot = "pond"; S.pond = {wins, at: Date.now(), shown: 0}; save(true);
    let i = 0;
    const next = () => {
      if (i < wins.length) { speak(`Lantern ${i + 1}: ${wins[i]}`, 3300); i++; S.pond.shown = i; sfx("chime"); if (scene === "base") drawScene(); setTimeout(next, 3400); }
      else { delete S.pond.shown; S.pond.done = Date.now(); act("cheer"); setSay("That's the day. Rest well."); save(); }
    };
    next();
  });
}
// Only the newest paper counts (the daily one and the weekend edition each): once today's is out, yesterday's unread
// one isn't "new post" any more, so it doesn't put the flag up on the letterbox again after you've read today's.
const paperKind = m => String(m.id).startsWith("weekly-") ? "weekly" : "daily";
function stalePapers(){
  const newest = {}; allMail().forEach(m => { if (m && m.id && m.from === "crier") { const k = paperKind(m); if (!newest[k] || (m.at || 0) > (newest[k].at || 0)) newest[k] = m; } });
  return new Set(allMail().filter(m => m && m.id && m.from === "crier" && newest[paperKind(m)] !== m).map(m => m.id));
}
const unreadMail = () => { const stale = stalePapers(); return allMail().filter(m => m && m.id && !F.mailRead[m.id] && !stale.has(m.id) && (!m.at || now() - m.at < (m.from === "crier" ? 72 : 36)*H)).sort((a, b) => (a.at || 0) - (b.at || 0)); };
// The village paper's name: the player can rename it in Settings (kept with the fox doc, so it follows them across devices).
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
  if (!items.length) { $("mailList").innerHTML = `<li><span></span><span class="muted">No letters yet.</span></li>`; bookCard(); return; }
  $("mailSum").textContent = unread ? `Letters · ${unread} new` : "Letters";
  $("mailList").innerHTML = items.map((m, i) => `<li class="${F.mailRead[m.id] ? "" : "unread"}"><span class="pl">${icon(F.mailRead[m.id] ? "letterOpen" : "letter", 22)}</span>
    <button class="open" data-mail="${i}"><span class="t">${esc(m.title || "A note")}</span><br><small>${esc(agentName(m.from))}${m.at ? " · " + new Date(m.at).toLocaleString("en-GB", {weekday:"short", hour:"numeric", minute:"2-digit"}) : ""}</small></button><span></span></li>`).join("");
  $("mailList").querySelectorAll("[data-mail]").forEach(b => b.onclick = () => openMail(items[+b.dataset.mail]));
  bookCard();
}
// round 190: the address book, under the letters
let bkSt = {};
function bookCard(){
  const box = $("bookBox"); if (!box) return;
  BK.collectBack(F).forEach(g => flash(`${g.who} tucked ${ITEMS[g.item].n.toLowerCase()} in with their letter`));
  if (box.contains(document.activeElement) && document.activeElement.id === "bkText") return;   // don't wipe a letter mid-sentence
  box.innerHTML = BK.bookHTML(F, bkSt);
  const txt = box.querySelector("#bkText"); if (txt) txt.oninput = () => { bkSt.letter = {...(bkSt.letter || {}), text: txt.value}; };
  box.querySelectorAll("[data-bk]").forEach(b => b.onclick = () => { const [a, v] = b.dataset.bk.split(/:(.*)/s);
    if (a === "more") bkSt.more = true; else if (a === "less") bkSt.more = false;
    else if (a === "add") { if (BK.addContact(F, v, dayKey())) { sfx("paper", true); flash(`${BK.person(v).name}, in your address book`); } }
    else if (a === "del") { if (bkSt.del === v) { BK.removeContact(F, v); bkSt = {}; flash("Taken out of your address book"); } else { bkSt.del = v; flash("Tap × again to take them out"); } }
    else if (a === "write") { bkSt = {open: bkSt.open === v ? null : v, letter: {}}; }
    else if (a === "cancel") bkSt = {};
    else if (a === "open") { bkSt.letter = {...(bkSt.letter || {}), open: bkSt.letter && bkSt.letter.open === v ? "" : v}; }
    else if (a === "yes") { if (BK.acceptOffer(F, v)) { sfx("chime"); flash(`${BK.person(v).name} will send a box each week`); } }   // round 198: from our travels
    else if (a === "no") { BK.declineOffer(F, v); flash("Maybe another time"); }
    else if (a === "stop") { if (BK.stopLine(F, v)) flash(`No more boxes from ${BK.person(v).name}. You can still write.`); }
    else if (a === "send") { const l = bkSt.letter || {}, r = BK.postTo(F, v, {open: l.open, text: l.text}); if (r.err) { flash(r.err); return; } sfx("chime"); flash(`Posted to ${BK.person(v).name}`); speak(`Off it goes to ${BK.REGIONS[BK.regionOf(v)]}. Watch your mailbox for a reply.`, 4000); bkSt = {}; }
    save(); bookCard(); });
}

/* =================== NPC FACTS (for reactions) =================== */
function facts(){
  const hm = localHM();
  return {quests3: doneToday() >= 3, harvest: S.harvested > 0, ready: readyCount() > 0, lunch: hm >= 690 && hm <= 810, water: S.water >= 4};
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
  if (giveMode && GIVE_KINDS.includes(it.kind)) { giveToVillager(id, giveMode); return; }
  if (it.kind === "seed") { speak("Seeds go in the garden. Tap a plot there!", 3500); return; }
  if (it.kind === "gift") { giftPick = giftPick === id ? null : id; postPick = false; bag(); return; }
  if (it.kind === "bouquet") { giftPick = giftPick === id ? null : id; postPick = false; bag(); return; }   // choose who it's for, like a gift
  if (it.kind === "pot") { potItem = id; orView = "pot"; openView = null; render(); return; }
  if (it.kind === "keepsake" && it.to) { giftPick = giftPick === id ? null : id; postPick = false; bag(); return; }   // round 197: a painting of hers, to give or to keep
  if (it.kind === "keepsake") { keepItem = id; openView = null; render(); return; }
  if (it.kind === "pet") { adoptItem = id; adoptSt = {}; openView = null; render(); return; }
  if (it.kind === "ingredient") { toKitchen(id); return; }
  if (it.kind === "feed") { if (openView) { openView = null; ctx(); } speak("That's for the animals. Off to the run!", 3000); go("base", VILLAGE.run.door[0], VILLAGE.run.door[1], () => arriveVillageSpot("run")); return; }
  // a toy (the kite) is never used up: fly it on the field, and anywhere else it stays in the backpack (round 130)
  if (it.kind === "toy") { if (id === "kite" && scene === "field") { if (openView) { openView = null; ctx(); } flyKite(); } else speak(id === "kite" ? "Kites need open grass and a breeze: take it to the field by the river." : "Let's save that for later.", 4000); return; }
  // the brush at Wildflower Farm brushes the animals (the next one in the nearer paddock), and counts for Felix's ask
  if (id === "brush" && scene === "hfarm") { const herd = hero.x < 260 ? "cows" : "goats", an = brushNearest(F, herd); if (openView) { openView = null; ctx(); }
    if (!an) { speak(`Everyone in the ${herd === "cows" ? "cow" : "goat"} paddock's been brushed today. Very glossy.`, 4000); render(); return; }
    act("brush", it); sfx("chime"); gainXp(1); farmTrust(1); mprop("heart", hero.x, hero.y - 60, 1600); speak(an.line, 3500); save(); render(); return; }
  if (it.kind === "tool") {
    act(it.act, it); speak(it.say, 4000);
    if (!F.cool[id] || Date.now() - F.cool[id] > 20*M) { F.cool[id] = Date.now(); gainXp(1); }
    save(); return;
  }
  addInv(id, -1); gainXp(it.xp || 1); sfx("purr");
  act(it.kind === "food" ? "eat" : it.kind === "flower" ? "flower" : it.act, it); speak(it.say, 4500); save();
}
// Arriving at the orchard or flower farm: Farid hands over the farm shop's takings and says hello (or calls you in
// for tea in the afternoon)
function orchardArrive(id){
  const o = orchState(F), n = handTin(F), here = isHere("farid"), today = dayKey();
  if (n) { sfx("chaching"); flash(`+${n} coins from the farm shop`); S.earned += n; save(true); }
  const empty = !o.trees.some(Boolean) && !o.beds.some(Boolean) && !o.bushes.some(Boolean);
  const faded = [...o.trees.map(p => stateOf("tree", p, today)), ...o.beds.map(p => stateOf("bed", p, today)), ...o.bushes.map(p => stateOf("bush", p, today))].filter(x => x.stage === "faded").length;
  const tea = whereIs("farid") === "cottage" && localHM() >= 15*60 && localHM() < 16*60 && o.tea !== today && S.teaAsk !== today;
  const line = tea ? (S.teaAsk = today, "Farid's waving from the cottage door: \"Kettle's on! Tea and cake?\"")
    : n ? `Farid presses ${n} coins into your hand. "Your share from the farm shop today. Don't argue."`
    : empty && id === "orchard" ? "So much empty ground! Farid says: \"Plant some trees, I'll look after them.\""
    : faded ? `${faded} spot${faded === 1 ? "'s" : "s have"} had their season. Farid's saving the ground for something new.` : null;
  const tr = tourNow(today, localHM());
  if (tr && !line) { const who = [tr.guide, ...tr.group].map(x => (NPCS.find(n => n.id === x) || {name: x}).name);
    setTimeout(() => speak(`A farm tour's on! ${who[0]} is showing ${who.slice(1, -1).join(", ")} and ${who[who.length - 1]} around.`, 5500), 1200); return; }
  const quote = /"(.+)"$/.exec(line || "");
  if (line) setTimeout(() => { if (here && quote && !tea && !n) npcSay("farid", quote[1]); else speak(line, 5500); }, 1200);
}
// A bouquet goes to whoever's nearest in this scene
const BQ_THANKS = ["Flowers? For me? You're too kind!", "Oh, they're beautiful. Thank you!", "These are going straight in a jar on my table.", "What a lovely surprise. Thank you!"];
function giveBouquet(id){
  const it = ITEMS[id], near = npcActors().map(([, e]) => e).filter(e => e.kind === "npc").map(e => [e, Math.hypot(e.x - hero.x, e.y - hero.y)]).sort((a, b) => a[1] - b[1])[0];
  if (!near) { speak("Nobody about to give it to. Go and find a friend!", 3500); return; }
  if (near[1] > 170) { speak(`Walk over to ${near[0].def.name} to give it.`, 3200); return; }
  const who = near[0].def; if (giftedAlready(who.id)) return; addInv(id, -1); if (openView) { openView = null; ctx(); }
  F.bouquets = F.bouquets || {}; F.bouquets[who.id] = (F.bouquets[who.id] || 0) + 1; F.fam.gifts[who.id] = (F.fam.gifts[who.id] || 0) + 1;
  npcSay(who.id, loveThanks(who.id, id) || pick(BQ_THANKS)); mprop("heart", near[0].x, near[0].y - 50, 1800); sfx("chime"); gainXp(1);
  const h = giftHeart(who.id, id); flash(`${who.name} loved the ${it.n.toLowerCase()}`); if (h) setTimeout(() => speak(h.trim(), 4500), 1600); save(true);
}
// a bouquet handed to one of your friends who's right here
function bouquetTo(id, w){
  const it = ITEMS[id]; if (!it || !F.inv[id]) return;
  if (giftedAlready(w)) return;
  addInv(id, -1); F.bouquets = F.bouquets || {}; F.bouquets[w] = (F.bouquets[w] || 0) + 1; F.fam.gifts[w] = (F.fam.gifts[w] || 0) + 1;
  { const h = giftHeart(w, id); if (h) setTimeout(() => speak(h.trim(), 4500), 1600); }
  { const p = npcPos(w); npcSay(w, loveThanks(w, id) || pick(BQ_THANKS)); if (p) mprop("heart", p.x, p.y - 50, 1800); flash(`${villagerName(w)} loved the ${it.n.toLowerCase()}`); }
  sfx("chime"); gainXp(1); save(true);
}
// Tea and cake with Farid in the orchard cottage, once a day: a few coins, a little xp, and a lot of kindness
function haveTea(){
  const o = orchState(F); if (o.tea === dayKey() || !isHere("farid")) return;
  o.tea = dayKey(); earn(3, "tea with Farid"); gainXp(1); sfx("chime"); orView = null; ctx();
  npcSay("farid", pick(["Another slice? I baked too much again. I always bake too much.", "Slowly. Tea is for resting.", "My uncle's recipe. Don't tell Mei it has three kinds of butter.", "You look like you needed a sit down."]));
  setTimeout(() => speak(`Almond cake, still warm, and mint tea in little glasses. ${F.name} got the crumbs.`, 4500), 2500); save(true);
}
// Send all of one ingredient from the backpack to the wine shop kitchen's larder
function toKitchen(id){
  const n = sendToKitchen(F, id); if (!n) return;
  sfx("paper", true); speak(`${n} ${(ITEMS[id].n || id).toLowerCase()} off to the kitchen larder at the wine shop.`, 3500); save(true);
}
// Gifts for your friends in the village: they get them in person, wherever they are (or sent round)
let bubbleT = null;
// Who a gift suits: one friend, Farid and Mei at the orchard cottage ("grands"), any friend at three hearts or more
// ("family": a present for anyone), or a list. A bouquet goes to any friend too, or to whoever's standing nearby.
const friends = () => QB.friendIds(F);
const giftWho = to => to === "family" ? friends() : to === "grands" ? ["farid", "mei"] : Array.isArray(to) ? to : [to];
// Tomi's lactose intolerant: dairy (cheese, milk, butter, milk chocolate, a dairy ice cream) earns no hearts from him
const DAIRY_IDS = new Set(["milk", "goatmilk", "icecream", "s_toast", "s_nonna"]);
const isDairy = id => { const it = ITEMS[id] || {}; return !!it.dairy || DAIRY_IDS.has(id) || /^chz_/.test(id); };
const TOMI_NO = "Oh, that's kind. Dairy and I don't get on, though. I'll pass it to Posy.";
const NO_FRIENDS = "Nobody's at three hearts yet, so there's no one to send it to. Walk up to someone and give it to them in person instead.";
// Ada's and Idris's hours: nine thirty to half past five, every day but Sunday
const GARMENT_N = k => (TL.GARMENT_NAME[k] || "piece").toLowerCase();
const sewOpen = () => { const m = localHM(), d = new Date(dayKey() + "T00:00:00Z").getUTCDay(); return d !== 0 && m >= 9*60 + 30 && m < 17*60 + 30; };
const nextDay = k => new Date(Date.parse(k + "T00:00:00Z") + 864e5).toISOString().slice(0, 10);
// the tailor's preview: a copy of you, wearing what's being designed (over whatever else you have on)
function tailorPreview(){
  const g = $("tlFig"), fig = $("hero"); if (!g || !fig) return;
  const c = fig.cloneNode(true); c.removeAttribute("id"); c.querySelectorAll("[id]").forEach(e => e.removeAttribute("id")); c.removeAttribute("transform"); c.removeAttribute("style"); c.setAttribute("class", "ch me");
  g.replaceChildren(c); const d = TL.designOf(F, tailSt); applyLook(c, lookOf(F), d.fab ? {...TL.wornSpec(F), ...TL.specOf(d), ...(TL.specOf(d).top && TL.specOf(d).top.kind === "dress" ? {bottom: null} : {})} : TL.wornSpec(F));
}
// Gifts and hearts (quests.js giveTo): one gift per villager a day, in person or sent round. One of their loves
// (data/loves.js: from their stories, a combination, or an everyday favourite) is worth a heart, anything else half a
// heart. A story love says its own thank-you (loveThanks), before any line the item has for them (it.says).
const villagerName = w => (NPCS.find(n => n.id === w) || {}).name || "them";
const isFav = (w, id) => isLove(w, id);
function giftedAlready(w){ if (!QB.giftedToday(F, w)) return false; speak(`You've already given ${villagerName(w)} something today. Save it for tomorrow!`, 4000); return true; }
function giftHeart(w, id){
  const r = QB.giveTo(F, w, villagerName(w), id, w === "tomi" && isDairy(id) ? "none" : isFav(w, id), addInv); if (!r) return "";
  if (r.none) return ` ${villagerName(w)} can't have dairy, so no heart this time.`;
  return ` ${r.fav ? "A favourite! " : ""}${villagerName(w)}: ${r.hearts}${r.half ? "½" : ""} heart${r.hearts === 1 && !r.half ? "" : "s"}.${r.gift ? " There's a little gift in your letterbox." : r.letter ? " Watch your letterbox." : ""}`;
}
// the backpack's "give something" mode: whoever's nearest and in the village (not visitors) gets the next thing tapped
const GIVE_KINDS = ["gift", "bouquet", "food", "ingredient", "flower", "keepsake"];
function nearestVillager(){ const n = npcActors().map(([, e]) => e).filter(e => e.kind === "npc" && !e.def.tourist && !e.def.local).map(e => [e, Math.hypot(e.x - hero.x, e.y - hero.y)]).sort((a, b) => a[1] - b[1])[0]; return n && n[1] < 170 ? n[0] : null; }
let giveMode = null;   // a villager id while "give something" is on
const GIFT_THANKS = ["Oh, how thoughtful! Thank you.", "For me? You're so kind.", "That's made my day, thank you."], FAV_THANKS = ["My favourite! How did you know?", "Oh, I love these! Thank you!", "You remembered! Thank you so much."];
function giveToVillager(id, w){
  const it = ITEMS[id], e = npcActors().map(([, x]) => x).find(x => x.def && x.def.id === w); if (!it || !F.inv[id]) return;
  if (!e) { giveMode = null; speak(`${villagerName(w)}'s wandered off. Find them again to give it.`, 3500); bag(); return; }
  if (giftedAlready(w)) { giveMode = null; bag(); return; }
  addInv(id, -1); giveMode = null; if (openView) { openView = null; ctx(); }
  F.fam.gifts[w] = (F.fam.gifts[w] || 0) + 1;
  if (it.kind === "bouquet") { F.bouquets = F.bouquets || {}; F.bouquets[w] = (F.bouquets[w] || 0) + 1; }
  const fav = isFav(w, id), line = w === "tomi" && isDairy(id) ? TOMI_NO : loveThanks(w, id) || (it.says && it.says[w]) || (fav ? pick(FAV_THANKS) : it.kind === "bouquet" ? pick(BQ_THANKS) : pick(GIFT_THANKS));
  npcSay(w, line); [0, 250, 500].forEach((d, k) => setTimeout(() => mprop("heart", e.x + (k - 1)*14, e.y - 50 - k*6, 1800), d)); sfx("chime"); gainXp(1);
  const h = giftHeart(w, id); flash(`${villagerName(w)} loved the ${it.n.toLowerCase()}`); if (h) setTimeout(() => speak(h.trim(), 4500), 1600); save(true);
}
function nearVillager(){ const fr = friends(), n = npcActors().map(([, e]) => e).filter(e => e.kind === "npc" && !fr.includes(e.def.id)).map(e => [e, Math.hypot(e.x - hero.x, e.y - hero.y)]).sort((a, b) => a[1] - b[1])[0]; return n && n[1] < 170 ? n[0] : null; }
// anything can go to any friend at three hearts or more (and in person, to anyone at all)
const recipients = it => it.kind === "bouquet" ? [...friends(), ...(nearVillager() ? ["near"] : [])] : friends();
const recipName = w => w === "near" ? ((nearVillager() || {}).def || {name: "someone nearby"}).name : villagerName(w);
const giftNames = to => to === "grands" ? "Farid or Mei" : to === "family" ? "a friend" : giftWho(to).map(villagerName).join(giftWho(to).length > 2 ? ", " : " or ").replace(/, ([^,]*)$/, " or $1");
// Who's close enough to hand a gift to in person (null if they're not on this screen)
const giftPos = w => npcPos(w);
// Tapping a gift in the backpack opens a little chooser of who it suits. Someone here gets it in person; anyone else
// gets it sent round, and their thank-you note arrives in the mailbox a little later (F.thanks).
let giftPick = null, postPick = false;
// round 190: post it to someone in the address book (postage by how far; their reply comes in a day or three)
const postPickHTML = it => `<p style="margin-top:10px"><b>Post it to…</b></p><div class="actions">${BK.contacts(F).map(id => `<button class="btn small alt" data-postto="${id}" ${F.coins >= BK.postage(id) && !it.gel ? "" : "disabled"}>${esc(BK.person(id).name)}<small> · ${BK.postage(id)} coins</small></button>`).join("")}</div>${it.gel ? `<p class="muted">Ice cream would melt in the post.</p>` : ""}`;
function giftPickHTML(id){
  const it = ITEMS[id], who = it && recipients(it); if (!it || !F.inv[id]) return "";
  return `<div class="giftpick" style="grid-column:1/-1"><p><b>Give the ${esc(it.n.toLowerCase())} to…</b></p>${who.length ? "" : `<p class="muted">${NO_FRIENDS}</p>`}<div class="actions">${who.map(w => `<button class="btn small ${w === "near" || giftPos(w) ? "primary" : "alt"}" data-giveto="${w}">${esc(recipName(w))}<small>${giftPos(w) ? " · here" : " · send it"}</small></button>`).join("")}${canKeep(it) ? `<button class="btn small alt" data-keepit="1">Keep it${it.magnet ? "<small> · for the fridge</small>" : "<small> · on a shelf</small>"}</button>` : ""}${BK.contacts(F).length ? `<button class="btn small alt" data-bypost="1">By post…</button>` : ""}<button class="btn small alt" data-giveto="">Cancel</button></div>${postPick ? postPickHTML(it) : ""}
    <p class="muted">Anyone who isn't here gets it sent round, and their thank-you note comes to your mailbox.${canKeep(it) ? " Or keep it, and put it up somewhere of yours." : ""}</p></div>`;
}
function giveTo(id, w){
  giftPick = null; const it = ITEMS[id]; if (!w || !it || !F.inv[id]) { bag(); return; }
  if (w === "near") { giveBouquet(id); bag(); return; }
  if (giftPos(w)) { if (it.kind === "bouquet") bouquetTo(id, w); else giveGift(id, w); bag(); return; }
  if (it.gel && !hasUp(scoopState(F), "bike")) { speak(`It'd melt on the way! Give it to ${villagerName(w)} in person, or get the Scoop Shack a delivery bike.`, 4500); bag(); return; }
  if (giftedAlready(w)) { bag(); return; }
  addInv(id, -1); F.fam.gifts[w] = (F.fam.gifts[w] || 0) + 1; gainXp(1); PP.bloomFor(F, id, w); giftHeart(w, id);
  F.thanks = [...(F.thanks || []), {id: `thanks-${w}-${Date.now()}`, who: w, item: id, at: Date.now() + 10*M}].slice(-30);
  sfx("chime"); flash(`Sent to ${villagerName(w)}`); speak(`Wrapped up and sent to ${villagerName(w)}. Watch your mailbox for a thank-you note.`, 4500); save(); bag();
}
const SIGNOFF = {hana: "Love, Hana x", theo: "Yours sincerely (and gratefully), Theo", farid: "Your friend, Farid", mei: "Mei x", tomi: "Cheers, Tomi", posy: "Posy x", bo: "Bo"};
const BQ_NOTE = {farid: "They're on the cottage table, next to the cake tin. Mei says they're nearly as nice as hers.", mei: "A flower farmer, given flowers! I put them in my best jug. Nobody ever does that.", hana: "They're on the counter at the market. Three people have asked where they're from.", theo: "I've pressed one in the village register. For the record.",
  tomi: "They're on the windowsill. Posy says I have to change the water. I will.", posy: "They're by the till in the gift shop. Customers keep sniffing them.", bo: "In a jar on the workbench. Sawdust and roses. Not bad."};
function thankNote(t){
  const it = ITEMS[t.item] || {n: "present", say: ""}, line = loveThanks(t.who, t.item) || (it.kind === "bouquet" ? BQ_NOTE[t.who] || "They're beautiful." : (it.says && it.says[t.who]) || it.say || "");
  // name the present once: if their line already says what it is, just say thank you
  const nm = it.n.toLowerCase().replace(/, wrapped in.*$/, "").replace(/^(a|an|the) /, ""), low = (line || "").toLowerCase();
  const says = !!line && (low.includes(nm) || nm.split(/[^a-zé'-]+/).filter(w => w.length >= 4).some(w => low.includes(w.replace(/s$/, ""))));
  return `${dearMe(F)},\n\n${says ? "Thank you so much!" : `Thank you for the ${it.n.toLowerCase()}!`} ${line}\n\n${SIGNOFF[t.who] || villagerName(t.who)}`;
}
// thank-you notes that have arrived (they take about ten minutes to come back)
const thanksMail = () => (F.thanks || []).filter(t => t.at <= Date.now()).map(t => ({id: t.id, from: "postie", at: t.at, title: `Thank you from ${(NPCS.find(n => n.id === t.who) || {name: "someone"}).name}`, body: thankNote(t)}));
function giveGift(id, chosen){
  const it = ITEMS[id]; if (!it || !F.inv[id]) return;
  const burst = (x, y) => [0, 250, 500].forEach((d, k) => setTimeout(() => mprop("heart", x + (k - 1)*14, y - 40 - k*6, 1800), d));
  const showMap = () => { if (openView) { openView = null; ctx(); } };
  const who = chosen ? [chosen] : giftWho(it.to);
  if (!who.length) { speak(NO_FRIENDS, 5000); return; }
  // more than one person it'd suit: hand it to whichever of them is nearest
  let to = it.to, g = null;
  if (who.length > 1 && it.to !== "grands") {
    const here = who.map(w => [w, npcPos(w)]).filter(([, p]) => p)
      .sort((a, b) => Math.hypot(a[1].x - hero.x, a[1].y - hero.y) - Math.hypot(b[1].x - hero.x, b[1].y - hero.y))[0];
    if (!here) { speak(`That's a present for ${giftNames(it.to)}. Give it to ${who.length > 2 ? "one of them" : "either of them"} in person!`, 4500); return; }
    to = here[0] === "farid" || here[0] === "mei" ? "grands" : here[0]; g = to === "grands" ? here[0] : null;
  } else if (who.length === 1 && (who[0] === "farid" || who[0] === "mei")) { to = "grands"; g = who[0]; }
  else if (who.length === 1) to = who[0];
  const say = w => loveThanks(w, id) || (it.says && it.says[w]) || it.say;
  if (to !== "grands") {
    const p = npcPos(to); if (!p) { speak(`${villagerName(to)}'s not here. Give it to them in person!`, 3500); return; }
    if (giftedAlready(to)) return;
    addInv(id, -1); F.fam.gifts[to] = (F.fam.gifts[to] || 0) + 1; PP.bloomFor(F, id, to);
    showMap(); npcSay(to, say(to)); burst(p.x, p.y - 20); sfx("chime"); flash(`${villagerName(to)} loved the ${it.n.toLowerCase()}`); gainXp(1);
    { const h = giftHeart(to, id); if (h) setTimeout(() => speak(h.trim(), 4500), 1600); } save(); return;
  }
  if (to === "grands") {
    // whichever grandparent is nearest (both live in the cottage in the orchard)
    const here = (g ? [g] : ["farid", "mei"]).map(g => [g, npcPos(g)]).filter(([, p]) => p).sort((a, b) => Math.hypot(a[1].x - hero.x, a[1].y - hero.y) - Math.hypot(b[1].x - hero.x, b[1].y - hero.y))[0];
    if (!here) { const w = whereIs("farid"); speak(`Farid and Mei aren't here. ${w === "cottage" ? "They're home in the cottage" : w ? "Farid's out at the " + ({orchard: "orchard", flowers: "flower farm", village: "town square", vineyard: "vineyard", base: "house", field: "field"}[w] || w) : "Try the orchard"}. Give it to them in person!`, 4500); return; }
    const [gp, p] = here; if (giftedAlready(gp)) return; addInv(id, -1); F.fam.gifts[gp] = (F.fam.gifts[gp] || 0) + 1; PP.bloomFor(F, id, "grands");
    showMap(); npcSay(gp, say(gp)); burst(p.x, p.y - 20); sfx("chime"); flash(`${villagerName(gp)} loved the ${it.n.toLowerCase()}`);
    { const h = giftHeart(gp, id); if (h) setTimeout(() => speak(h.trim(), 4500), 1600); }
  }
  gainXp(1); save();
}
function playFree(kind){
  const lines = {pet:["*leans into the pat*", "Happy {kind} noises!", "More pats please."], hide:["You found me!"], nap:["Mmm… cosy…"]};
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
  // a pet from Noor's adoption corner (a kitten, a puppy...) isn't a run animal: it goes to someone in the family, and
  // The player picks who and where it lives (companions.js). Only chicks, bunnies and goats from the market go in the run.
  if (it.kind === "pet" && !KINDS[it.pet]) { F.coins -= price; addInv(id, 1); sfx("chaching"); adoptItem = id; adoptSt = {}; fieldView = null; friView = null; openView = null; speak(it.say, 3500); save(); render(); return; }
  if (it.kind === "pet") {
    const a = addAnimal(F, it.pet); if (!a) { speak("The run's full. Bo can make it bigger: tap the run at home.", 4000); return; }
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
const sowOne = (i, seedId) => { const it = ITEMS[seedId]; addInv(seedId, -1); F.plots[i] = {crop:it.crop, seed: seedId, plantedAt:Date.now(), wateredAt: F.tools.sprinkler ? Date.now() : null, bonus:0}; };
function plant(i, seedId){
  const it = ITEMS[seedId]; if (!it || !F.inv[seedId] || (F.plots[i] && F.plots[i].crop)) return;
  F.gift = false; sowOne(i, seedId); let n = 1;
  if (F.tools.seeder) F.plots.forEach((p, j) => { if (j !== i && !(p && p.crop) && F.inv[seedId] > 0) { sowOne(j, seedId); n++; } });   // the auto seeder: every empty plot
  const what = n > 1 ? `The seeder's sown ${CROPS[it.crop].n.toLowerCase()} in ${n} plots` : `${CROPS[it.crop].n} planted`;
  speak(F.tools.sprinkler ? `${what}, and the sprinkler's on it!` : `${what}! Now give ${n > 1 ? "them" : "it"} some water.`, 3500); save(true);
}
function waterPlot(i){ const p = F.plots[i]; if (!p || !p.crop || p.wateredAt) return;
  const all = F.tools.can ? F.plots.map((q, j) => q && q.crop && !q.wateredAt ? j : -1).filter(j => j >= 0) : [i];
  all.forEach(j => { F.plots[j].wateredAt = Date.now(); mprop("drop", PLOTS[j].x + 50, PLOTS[j].y + 10); });
  speak(all.length > 1 ? `Big can! ${all.length} plots watered at once.` : "Watered! Growing starts now. Finished quests speed it up.", 4000); save(true); }
// pick plot i (the fertiliser adds one more; the auto seeder sows it again if there's a seed for it) -> {crop, n, again}
function pickPlot(i){
  const p = F.plots[i], C = CROPS[p.crop], n = (C.yield || 1) + (F.tools.fertiliser ? 1 : 0);
  addInv(p.crop, n); F.plots[i] = null; gainXp(1); S.harvested = (S.harvested || 0) + 1; F.harvestTotal = (F.harvestTotal || 0) + 1;
  const seed = F.tools.seeder && (p.seed && F.inv[p.seed] > 0 ? p.seed : Object.keys(F.inv).find(id => F.inv[id] > 0 && ITEMS[id] && ITEMS[id].kind === "seed" && !ITEMS[id].greenhouse && ITEMS[id].crop === p.crop));
  if (seed) sowOne(i, seed);
  return {crop: p.crop, n, again: !!seed};
}
function harvest(i){
  const p = F.plots[i]; if (!p || !p.crop || growth(p) < 1) return;
  const C = CROPS[p.crop], r = pickPlot(i), n = r.n; mprop(CROPS[p.crop].ico, PLOTS[i].x + 50, PLOTS[i].y + 20, 1900); act("cheer");
  speak((n > 1 ? `Harvested ${n} ${C.ns || C.n.toLowerCase()}! They're in your backpack.` : `Harvested a ${C.n.toLowerCase()}! It's in your backpack.`) + (r.again ? " The seeder's sown it again." : ""), 4000); save(true);
}
// round 155: the auto harvester brings in anything ripe, in the garden and under the glass
function harvesterTick(){
  if (!F.tools.harvester) return; const got = {};
  F.plots.forEach((p, i) => { if (p && p.crop && growth(p) >= 1) { const r = pickPlot(i); got[r.crop] = (got[r.crop] || 0) + r.n; } });
  if (F.goals && F.goals.greenhouse) ghRipe(F, addInv).forEach(r => { got[r.crop] = (got[r.crop] || 0) + r.n; });
  const k = Object.keys(got); if (!k.length) return; save();
  const list = k.map(c => `${got[c]} ${CROPS[c].ns || CROPS[c].n.toLowerCase()}`).join(", ");
  flash(`The harvester brought in ${list}`); if (scene === "farm" || scene === "greenhouse") { drawScene(); if (!quietNow()) speak(`The auto harvester's been round: ${list}, into your backpack.`, 4500); }
}

/* =================== UI =================== */
// The quest note pinned on the map: today's open tasks (tick them right here) and the village's requests.
function journal(){
  const j = $("journal"), list = QB.myTasks(F), open = list.filter(t => !QB.isDone(t)), reqs = QB.board(F).reqs;
  let h = `<span class="tape dots" aria-hidden="true"></span>`;
  h += `<h1><span class="lbl">today · your quests</span>${open.length ? `${open.length} task${open.length === 1 ? "" : "s"} to go` : list.length ? "All ticked off" : "Your quest board"}</h1>`;
  if (open.length) h += `<ul class="bujo qtasks">${open.slice(0, 3).map(t => `<li class="qt"><button class="tick" data-tick="${esc(t.id)}" aria-label="Done: ${esc(t.title)}"></button><span>${esc(t.title)}</span></li>`).join("")}${open.length > 3 ? `<li class="more">and ${open.length - 3} more on the board</li>` : ""}</ul>`;
  else h += `<ul class="bujo"><li>${list.length ? "Lovely work. The rest of the day is yours." : "Pin your own tasks to the quest board, one-off or daily, and tick them off as you go."}</li></ul>`;
  if (reqs.length) h += `<ul class="bujo reqs">${reqs.map(r => `<li>${icon("letter", 16)} <span><b>${esc(r.name)}</b> needs ${esc(QB.reqLine(r))} ${esc(QB.dueLine(r))}</span></li>`).join("")}</ul>`;
  h += `<div class="actions"><button class="btn primary small" data-a="board">Open the quest board</button></div>`;
  if (say && say.buttons) h = h.replace(/<h1>/, `<div class="actions saybtns">${say.buttons.map((x, i) => `<button class="btn alt small" data-say="${i}">${esc(x[0])}</button>`).join("")}</div><h1>`);
  // The note folds to one line while walking or when tapped away; it opens again when something new needs a look.
  const key = `${open.length}:${reqs.map(r => r.id).join(",")}`;
  if (key !== qnKey) { qnKey = key; if (Date.now() > qnQuietUntil) qnOpen = true; }
  const slim = !qnOpen || (route.length > 0 && !(say && say.buttons));
  j.classList.toggle("slim", slim);
  j.innerHTML = h + `<button class="qnx" data-qn="min" aria-label="Fold the note away">–</button>`;
  if (slim) j.innerHTML = `<button class="qnslim" data-qn="open" aria-label="Open the quest note">${icon("note", 20)} <b>${open.length ? `${open.length} task${open.length === 1 ? "" : "s"} to go` : "Quest board"}</b>${reqs.length ? `<span class="when">${reqs.length} request${reqs.length === 1 ? "" : "s"}</span>` : ""}<span class="more">open</span></button>`;
  j.classList.toggle("intop", !outside());
  j.querySelectorAll("[data-qn]").forEach(el => el.onclick = ev => { ev.stopPropagation(); qnOpen = el.dataset.qn === "open"; sfx("paper", true); journal(); });
  j.querySelectorAll("[data-tick]").forEach(el => el.onclick = ev => { ev.stopPropagation(); tickMine(el.dataset.tick); });
  j.querySelectorAll('[data-a="board"]').forEach(el => el.onclick = () => { openView = "quests"; render(); });
  j.querySelectorAll("[data-say]").forEach(el => el.onclick = () => { const fn = say.buttons[+el.dataset.say][1]; say.buttons = null; fn(); save(); });
}
// One panel over the map. A HUD view (quests / backpack / letters) takes it when opened; otherwise whatever the
// current spot offers (shop, garden plot, a room's furniture).
function showPanel(hasCtx, skin){
  const views = {quests:"questsView", bag:"bagView", mail:"mailView", friend:"friendView", settings:"settingsView"};
  const view = openView || (hasCtx ? "ctx" : null), p = $("panel");
  if (p.hidden === !!view) sfx("paper", true);
  p.hidden = !view; $("map").classList.toggle("panel-open", !!view);
  if (view === "settings") { prefsUI(); $("setMusic").checked = sound.music; $("setVol").value = sound.musicVol; $("setSfx").checked = sound.sfx; $("setQuiet").checked = F.quietEvening !== false; $("setBed").checked = F.bedLock !== false; }
  ["ctx", "questsView", "bagView", "mailView", "friendView", "settingsView"].forEach(id => $(id).hidden = id !== (views[view] || view));
  p.className = "panel " + (view === "quests" ? "cork" : view === "ctx" ? skin : "paper");
  document.querySelectorAll("[data-open]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.open === openView)));
}
function closePanel(){
  if (openView) { openView = null; ctx(); return; }
  boardOpen = false; guestView = false; habView = false; tailView = false; shedOpen = false; runOpen = false; wardOpen = false; bedOpen = false; journalOpen = false; calmOpen = false; recOpen = false; routOpen = false; trophyView = null; vyView = null; kView = null; orView = null; fieldView = null; goalView = null; selPlot = null; homeView = null; newsOpen = false; ccView = null; hfView = null; railOpen = false; fishSpot = null; woodsView = null; rondaView = null; kyotoView = null; ktSt = {}; jejuView = null; jjSt = {}; swView = null; swSt = {}; loftView = false; cinqueView = null; ctSt = {}; ghBed = null; millOpen = false; friView = null; vanView = null; bbRoom = null; bbSt = {}; lunchView = null; occView = null; trvSt = null; pntSt = null; keepItem = null; keepSpot = null; adoptItem = null; adoptSt = {}; petView = null; scView = null; scSt.pick = null; scSt.dpick = null; scSt.vpick = null; scSt.swap = null; if (scene === "market") shopClosed = true; ctx();
}
/* ---------- storage at home (round 166, game/storage.js): the fridge's "Stored" tab, and the garage shelf ---------- */
// the fridge: what's stored for the shops (storage.js), and the shopping list on the door (shopping.js)
const fridgeHead = () => { const n = SL.shopLeft(F); return `<span class="tape stripe" aria-hidden="true"></span><h2>The fridge</h2><div class="tabs" role="tablist"><button role="tab" data-ftab="stored" aria-selected="${homeView === "stored"}">Stored</button><button role="tab" data-ftab="shoplist" aria-selected="${homeView === "shoplist"}">Shopping list${n ? ` (${n})` : ""}</button></div>`; };
const slDraft = {text: "", focus: false, showText: false};
function wireStorage(c){
  c.querySelectorAll("[data-ftab]").forEach(b => b.onclick = ev => { ev.stopPropagation(); homeView = b.dataset.ftab; slDraft.showText = false; sfx("tap"); ctx(); });
  c.querySelectorAll("[data-relook]").forEach(b => b.onclick = ev => { ev.stopPropagation(); sfx("paper", true); openSetup(F, {lookOnly: true, done: () => { applyWear(); save(true); speak("A new look. Very you.", 3500); }}); });
  c.querySelectorAll("[data-sew]").forEach(b => b.onclick = ev => { ev.stopPropagation(); const v = b.dataset.sew, i = v.indexOf(":"), a = i < 0 ? v : v.slice(0, i), x = i < 0 ? "" : v.slice(i + 1);
    if (["tab", "mat", "col", "pat"].includes(a)) { habSt[a] = x; sfx("tap"); }
    else if (a === "buy") { const k = `${habSt.mat || "cotton"}:${habSt.col || "#9CC27E"}:${habSt.pat || "plain"}`, c = TL.buyFabric(F, k, +x); if (c) { sfx("chaching"); flash(`${x} piece${x === "1" ? "" : "s"} of ${TL.fabricLabel(k)}`); save(); } }
    else if (a === "btn") { const c = TL.buyButtons(F, x); if (c) { sfx("chaching"); flash(`A card of ${x} buttons`); save(); } }
    else if (a === "giftcard") buy("btncard");   // the loves round: a card of buttons to give (Ada loves one)
    else if (a === "sell") { const p = TL.sellFabric(F, x); if (p) { sfx("chaching"); flash(`Sold a piece back to Ada: +${p}`); save(); } }
    else if (["kind", "fab", "sleeves", "neck", "length", "buttons"].includes(a)) { tailSt[a] = x; sfx("tap"); }
    else if (a === "pockets") { tailSt.pockets = !!x; sfx("tap"); }
    else if (a === "order") { const r = TL.placeOrder(F, TL.designOf(F, tailSt), nextDay(dayKey())); if (r.err) { speak(r.err, 3500); return; } sfx("chaching"); flash(`Idris's fee for the ${GARMENT_N(r.kind)}`); if (isHere("idris")) npcSay("idris", "Tomorrow from nine. I'll press it twice."); speak(`Your ${r.name} goes on Idris's table. Ready tomorrow from nine.`, 5000); tailSt = {}; save(); }
    else if (a === "collect") { const piece = TL.collect(F, dayKey(), localHM()); if (piece) { sfx("chime"); act("cheer"); flash(`Your ${piece.name}`); speak(`Your ${piece.name}, in tissue paper. It's in your wardrobe at home: wear it whenever you like.`, 5500); save(); } }
    ctx(); });
  c.querySelectorAll("[data-wear]").forEach(b => b.onclick = ev => { ev.stopPropagation(); if (b.dataset.wear) TL.wear(F, b.dataset.wear); else TL.everyday(F); applyWear(); sfx("paper", true); save(true); });
  c.querySelectorAll("[data-guest]").forEach(b => b.onclick = ev => { ev.stopPropagation(); const [a, id] = b.dataset.guest.split(":");
    if (a === "ask" && GU.invite(F, id)) { sfx("paper", true); flash(`${GU.nameOf(id)} is coming to stay`); speak(`A letter's on its way to ${GU.nameOf(id)}. They'll be on the 10:30 train tomorrow, for three days.`, 5000); save(); }
    else if (a === "cancel" && GU.cancel(F)) { sfx("tap"); speak("Another time. The bed stays made.", 3500); save(); }
    ctx(); });
  c.querySelectorAll("[data-sl]").forEach(b => b.onclick = ev => { ev.stopPropagation(); const a = b.dataset.sl, id = b.dataset.id;
    if (a === "copy") { const text = SL.listText(F), fallback = () => { slDraft.showText = true; ctx(); const t = $("slText"); if (t) { t.focus(); t.select(); } flash("Copying's blocked here: the list is selected, ready to copy"); };
      try { navigator.clipboard.writeText(text).then(() => { slDraft.showText = false; sfx("paper", true); flash("Shopping list copied"); }, fallback); } catch { fallback(); } return; }
    if (a === "tick") { SL.toggleItem(F, id); sfx("tap"); }
    else if (a === "del") { const r = SL.removeItem(F, id); if (r) undoable(`Took “${r.it.name}” off the list`, () => { SL.restoreItem(F, r); save(); ctx(); }); sfx("paper", true); }
    else if (a === "clear") { const gone = SL.clearGot(F); if (gone.length) undoable(`Cleared ${gone.length} from the basket`, () => { SL.shopList(F).items.push(...gone); save(); ctx(); }); sfx("paper", true); }
    save(); ctx(); });
  // a half-typed item survives the game redrawing round it
  const sf = c.querySelector("#slForm"), si = c.querySelector("#slIn");
  if (si) { si.value = slDraft.text; si.oninput = () => { slDraft.text = si.value; }; si.onfocus = () => { slDraft.focus = true; }; si.onblur = () => { slDraft.focus = false; }; if (slDraft.focus) si.focus(); }
  if (sf) sf.onsubmit = ev => { ev.preventDefault(); if (SL.addItem(F, si.value)) { slDraft.text = ""; sfx("paper", true); save(); ctx(); } };
  const where = homeView === "shelf" ? "shelf" : "fridge";
  c.querySelectorAll("[data-st]").forEach(b => b.onclick = ev => { ev.stopPropagation(); const a = b.dataset.st, id = b.dataset.id, n = +b.dataset.n || 99; let line = "";
    if (a === "put") { const k = putAway(F, where, id, n); if (k) line = `${k} ${ITEMS[id].n.toLowerCase()}, put away.`; }
    else if (a === "putall") { const ids = Object.keys(F.inv || {}).filter(x => placeFor(x) === where), k = ids.reduce((t, x) => t + putAway(F, where, x), 0); if (k) line = `${k} thing${k > 1 ? "s" : ""}, put away in ${where === "shelf" ? "the garage" : "the fridge"}.`; }
    else if (a === "take") { const k = takeOut(F, where, id, n); if (k) line = `${k} ${ITEMS[id].n.toLowerCase()}, into your backpack.`; }
    else if (a === "send") { const sh = STORE_SHOPS.find(x => x.k === b.dataset.to), k = sendOff(F, where, id, b.dataset.to); if (k) line = `Tomo's on his way: ${k} ${ITEMS[id].n.toLowerCase()} to ${sh.n}.`; else line = `${sh.n[0].toUpperCase() + sh.n.slice(1)} can't take any more of those.`; }
    if (!line) return; sfx(a === "send" ? "chime" : "paper"); flash(line); save(); ctx(); });
}
// the loves round: the post office's stamps and scales, with Penny's drawer of rubber stamps (one to give: Theo loves it)
function stampsPanel(){ const it = ITEMS.rubberstamp, n = F.inv.rubberstamp || 0;
  return `<span class="tape stripe" aria-hidden="true"></span><h2>Stamps and scales</h2><p class="sub">Weigh it, stamp it, send it. Penny keeps a drawer of rubber stamps behind the scales: "Received with thanks", "Fragile", a little bee. You have ${icon("coin", 16)} ${F.coins}.</p>
    <div class="items shop">${itemBtn("rubberstamp", `<b>${it.price}</b> ${icon("coin", 13)}`, F.coins < it.price, n ? `<span class="cnt">×${n}</span>` : "")}</div><p class="muted">A rubber stamp to give. It goes in your backpack.</p><div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`; }
function itemBtn(id, label, disabled, extra){
  const it = ITEMS[id];
  return `<button class="item" data-id="${id}" ${disabled ? "disabled" : ""}><span class="e">${icon(it.ico, 34)}</span><span class="n">${esc(it.n)}</span><span class="c">${label}</span>${extra || ""}</button>`;
}
function ctx(){
  const c = $("ctx"); let h = "";
  if (guestView && scene === "guestroom") h = GU.guestBookHTML(F);
  else if (habView && scene === "haberdash") h = TL.haberdasheryHTML(F, habSt, sewOpen());
  else if (tailView && scene === "tailor") h = TL.tailorHTML(F, tailSt, sewOpen(), dayKey(), localHM());
  else if (homeView && (scene === "home" || scene === "garage")) h = homeView === "shelf" ? storePanel(F, "shelf", {owns: k => owns(F, k)}) : fridgeHead() + (homeView === "shoplist" ? SL.shopPanelHTML(F, slDraft.showText) : storePanel(F, "fridge", {owns: k => owns(F, k)}));
  else if (scView && (SCOOP_IN.includes(scene) || SC_ANY.includes(scView))) h = scView === "trolley" ? trolleyPanel(F, {sel: scSt.tsel || []}) : scView === "upgrade" ? upgradePanel(F) : scView === "honesty" ? honestyPanel(F) : scView === "deliver" ? deliverMore(deliverPanel(F, {pick: scSt.vpick, fmt: scSt.vfmt, who: deliverTo()}))
    : scView === "pots" ? dipPotsPanel(F) : scView === "tops" ? toppingsPanel(F) : scView === "dipbar" ? dipBarPanel(F, {pick: scSt.dpick, dip: scSt.dip, top: scSt.top, fmt: scSt.dfmt}) : scView === "counter" ? scCounterPanel(F, {pick: scSt.pick, server: isHere("sofia"), nonna: storyGiven(F, "nonna")}) : scView === "menu" ? scMenuPanel(F)
    : scView === "fridge" ? fridgePanel(F, orchState(F)) : scView === "bench" ? benchPanel(F, scSt) : scView === "batch" ? recipePanel(F) : freezerPanel(F, {swap: scSt.swap});
  else if (goalView) h = goalView === "garagepick" ? garagePanel(F) : goalView === "jetty" ? jettyPanel(scene, false) : goalPanel(F, goalView);
  else if (fieldView === "xtree" && scene === "field") h = treePanel(F, dayKey(), localHM());
  else if (fieldView === "xgrotto" && scene === "field") h = grottoPanel(F, dayKey(), localHM(), {});
  else if (fieldView && scene === "field") { const st = stallAt(dayKey(), localHM(), +fieldView.slice(-1)); h = !st ? "" : st.kind === "wine" ? stallMarketPanel(F, serving()) : st.kind === "orchard" ? shopPanel(F, dayKey(), orTab, true) : st.kind === "scoop" ? scCounterPanel(F, {pick: scSt.pick, cart: true, keeper: isHere("tomo") && !keeperAway(st, dayKey(), localHM())}) : st.kind === "cocoa" ? ccCounterPanel(F, {cart: true, xmas: !!st.xmas, server: isHere("mateo"), pk: ccSt.pk}) : st.kind === "mulled" ? mulledStallPanel(F, {keeper: isHere("celeste") && !keeperAway(st, dayKey(), localHM())}) : st.kind === "mine" ? xmStallPanel(F, vineState(F), {day: dayKey(), here: atSpot === fieldView, hazel: st.id === "hazel" && isHere("hazel") && !keeperAway(st, dayKey(), localHM())}) : marketStallPanel(st); }
  else if ((lunchView === "book" || lunchView === "coming") && scene === "terrace") { const tabs = `<div class="tabs" role="tablist"><button role="tab" data-lbtab="book" aria-selected="${lunchView === "book"}">Sunday lunch</button><button role="tab" data-lbtab="coming" aria-selected="${lunchView === "coming"}">Coming up</button></div>`;
    h = lunchView === "book" ? lunchBookPanel(F, id => NPCS.find(n => n.id === id) ? NPCS.find(n => n.id === id).name : id, {terrace: !!vineState(F).terrace, shelf: shelfStock(vineState(F))}).replace("</h2>", "</h2>" + tabs)
      : `<span class="tape gingham" aria-hidden="true"></span><h2>The bookings book</h2>${tabs}<p class="sub">What's on at the terrace: weddings pencilled in weeks ahead, trivia on Wednesdays, sip and paint on Thursdays, and the special days.</p>${comingUpHTML(dayKey(), !!vineState(F).terrace)}<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`; }
  else if (occView === "trivia" && scene === "terrace") { const t = F.terraceEv || {}; h = triviaPanel(F, trvSt, {on: (occasionNow(dayKey(), localHM()) || {}).kind === "trivia", played: t.trivia === dayKey() && !trvSt ? t.quizLine : null}); }
  else if (occView === "paint" && scene === "terrace") h = paintPanel(F, pntSt, {on: (occasionNow(dayKey(), localHM()) || {}).kind === "paint", painted: (F.terraceEv || {}).painted === dayKey() && !pntSt});
  else if (lunchView === "table" && scene === "terrace") h = lunchTablePanel();
  else if (ppView && scene === "bv_hpaper") h = ppView === "pp_rack" ? WR.rackPanel(F) : ppView === "pp_wrap" ? WR.wrapPanel(F, wrSt, {where: "paperie"}) : PP.paperPanel(F, ppView, {day: dayKey(), came: ppCame, lise: isHere("lvlise")});   // round 183, 185
  else if (fieldView === "gwrap" && scene === "giftshop") h = WR.wrapPanel(F, wrSt, {where: "giftshop", table: giftState(F).wrapped});   // round 185
  else if (bbRoom && townOf(scene) && TOWNS[townOf(scene)].by === "van") { const evanOn = false, tp = tripOn(F) ? tripOn(F).party : [];
    h = bbRoom === "balloon" ? BBA.balloonPanel(F, bbSt.flight, {hm: localHM(), party: tp}) : bbRoom === "riddle" ? BBA.riddlePanel(F, bbSt.riddle) : bbRoom === "berries" ? BBA.berriesPanel(F, bbSt.berries, false)
      : bbRoom === "dip" ? BBA.dipPanel(F, bbSt.dip, false) : bbRoom === "joey" ? BBA.joeyPanel(F, bbSt.joey, false) : bbRoom === "canoe" ? BBA.canoePanel(F, bbSt.canoe, false, bbSt.paid)
      : bbRoom === "fire" ? BBA.firePanel(F, bbSt.bag, {hm: localHM(), folk: FIRE_FOLK.some(isHere)})
      : bbRoom === "surf" ? CRA.surfPanel(F, bbSt.surf, false, bbSt.paid) : bbRoom === "whales" ? CRA.whalePanel(F, bbSt.whale, false) : bbRoom === "glow" ? CRA.glowPanel(F, bbSt.glow, {hm: localHM()})
      : bbRoom === "pots" ? CRA.potsPanel(F, bbSt.pots, {hm: localHM()}) : bbRoom === "penguins" ? CRA.pengPanel(F, bbSt.peng, {hm: localHM()}) : bbRoom === "nippers" ? CRA.nipPanel(F, bbSt.nip, {hm: localHM()}) : TLA.TL_KINDS.includes(bbRoom) ? TLA.tlPanel(F, bbRoom, bbSt, {hm: localHM()}) : LVA.LV_KINDS.includes(bbRoom) ? LVA.lvPanel(F, bbRoom, bbSt, {hm: localHM()}) : bbRoomPanel(F, bbRoom, {party: !!tp.length}); }
  else if (bvView) h = bvView === "passport" ? bbPassport(F) : bbMapPanel(F, {pick: tripPick, ownsVan: owns(F, "van"), region: bvRegion});
  else if (railOpen === "tickets" && scene === "hlane") h = ticketPanel(F, tripPick, tripTown);
  else if (railOpen === "boat" && scene === "shore") h = boatPanel(F, tripPick, boatTown, localHM(), rainyOn(dayKey()));   // round 215: your own boat: the cruise, or an island
  else if (railOpen === "ferry" && scene === "shore") h = ticketPanel(F, tripPick, TOWNS[ferryTown] && !TOWNS[ferryTown].soon ? ferryTown : "jeju", localHM(), "ferry");   // round 127: the Jeju ferry from the jetty (round 215: and the islands)
  else if (railOpen && scene === "hlane") h = timetablePanel(dayKey(), localHM(), true);
  else if (railOpen && townOf(scene)) h = homePanel(F, townOf(scene), localHM(), railOpen === "ferry" ? "ferry" : "train");
  else if (kyotoView && townOf(scene) === "kyoto") h = kyotoPanel(F, kyotoView, {...ktSt});
  else if (jejuView && townOf(scene) === "jeju") h = jejuPanel(F, jejuView, {...jjSt});
  else if (cinqueView && townOf(scene) === "cinque") h = cinquePanel(F, cinqueView, {...ctSt});
  else if (swView && townOf(scene) === "saltwick") h = swPanel(F, swView, {...swSt}, localHM());
  else if (rondaView && townOf(scene)) h = rondaPanel(F, rondaView, {flam: flamSt, hm: localHM(), tea: teaSt, amina: isHere("amina"), paint: paintSt});
  else if (fishSpot && FISH_SPOTS[fishSpot].scene === scene) h = fishPanel(F, fishSpot, fishSt);
  else if (woodsView === "ranger" && scene === "hwoods") h = rangerPanel(F, isHere("wren"));
  else if (woodsView === "bike" && outside()) h = bikePanel(F, F.ride === "car" && owns(F, "car") ? "car" : owns(F, "scooter") && F.ride !== "walk" ? "scooter" : "");
  else if (woodsView && TAXI_STOPS[woodsView] && TAXI_STOPS[woodsView].scene === scene) h = taxiPanel(F, woodsView);
  else if (vanView === "crate" && scene === "van") h = cratePanel(F, vineState(F));
  else if (vanView && scene === "van") h = moodPanel(F, vanSt);
  else if (hfView && scene === "barn") h = hfView === "extractor" ? extractorPanel(F) : hfView === "crock" ? crockPanel(F) : hfView === "press" ? hfPressPanel(F, hfSt) : hfCavePanel(F);
  else if (hfView && scene === "hfarm") h = hfView === "house" ? farmhousePanel(F, isHere("felix")) : hfView === "hives" ? hivesPanel(F, isHere("felix")) : hfView === "stand" ? standPanel(F) : herdPanel(F, hfView, isHere("elena"));
  else if (orView === "pot" && potItem) h = potPanel(F, potItem);
  else if (ccView && COCOA_IN.includes(scene)) h = ccView === "counter" ? ccCounterPanel(F, {server: isHere("amara"), hand: isHere("mateo"), pk: ccSt.pk}) : ccView === "wall" ? barWallPanel(F) : ccView === "pantry" ? pantryPanel(F, orchState(F)) : ccView === "bonbon" ? bonbonPanel(F, {...ccSt, book: storyGiven(F, "henri")}) : ccView === "case" ? casePanel(F) : ccView === "ups" ? ccUpsPanel(F) : ccKitchenPanel(F, ccView);
  else if (keepItem && F.inv[keepItem]) h = keepPanel(F, keepItem);
  else if (keepSpot) h = placedPanel(F, keepSpot);
  else if (adoptItem && F.inv[adoptItem]) h = adoptPanel(F, adoptItem, adoptSt);
  else if (petView && companions(F).some(c => c.id === petView)) { const c = companions(F).find(c => c.id === petView); h = petPanel(F, c, !!giftPos(c.owner)); }
  else if (orView === "tea" && scene === "cottage") h = teaPanel(F, dayKey(), isHere("farid"));
  else if (orView && (scene === "orchard" || scene === "flowers")) h = orView === "shop" ? shopPanel(F, dayKey(), orTab) : orView === "tours" ? tourBoard(F, dayKey(), localHM()) : spotPanel(F, orAt.where, orAt.i, dayKey());
  else if (kView === "mull" && scene === "kitchen") h = mullPanel(F, vineState(F), mullSt);   // round 153: mulled wine
  else if (kView && scene === "kitchen") h = kView === "oven" ? ovenPanel(F) : kView === "press" ? pressPanel(F) : kView === "stove" ? stovePanel(F, dayKey()) : larderPanel(F);
  else if (loftView && scene === "vineyard") h = loftPanel(F);
  else if (vyView && (scene === "vineyard" || scene === "wineshop" || scene === "cellar")) h = vyView === "olive" ? olivePanel(F) : vyView === "grove" ? grovePanel(F) : vyView === "vine" ? vinePanel(F, vyAt.r, vyAt.i) : vyView === "stall" ? stallPanel(F) : vyView === "barrels" ? barrelPanel(F)
    : vyView === "mcrate" ? wineCratePanel(F, dayKey()) : vyView === "shelf" ? shelfPanel(F) : vyView === "menu" ? menuPanel(F, dayKey()) : vyView === "counter" ? counterPanel(F, serving(), whereIs("celeste") === "wineshop") : vyView === "box" ? boxPanel(F) : cafePanel(F, NPCS.filter(n => n.id !== "celeste" && isHere(n.id)).map(n => n.name), dayKey());
  else if (trophyView && scene === "trophy") h = trophyView === "book" ? bookPanel(F, onPedestals(F).length < PEDESTALS) : pedestalPanel(onPedestals(F)[+trophyView.slice(3)], nextUp(trophyCtx()), true);
  else if (routOpen && scene === "room") h = routinesPanel();
  else if (fieldView && scene === "giftshop") h = giftPanel(F, fieldView, giftOpts());   // round 178
  else if (fieldView === "stamps" && scene === "post") h = stampsPanel();   // the loves round
  else if (fieldView === "hampers" && scene === "post") h = hamperPanel(F, vineState(F), {day: dayKey(), pick: xmPick, season: hamperSeason(dayKey()) || "xmas"});   // round 173
  else if (newsOpen && scene === "village") h = goodNewsHTML(myWins(), villageCalendar(), newsTab);
  else if (scene === "market" && !shopClosed) {
    const tabs = [["seeds","Seeds"],["treats","Treats"],["deli","Deli"],["care","Care"],["family","Gifts"],["animals","Animals"],["home","Home"],["me","Me & my room"],["sell","Sell"]];
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
      h += Object.keys(ITEMS).filter(id => ITEMS[id].tab === shopTab && inSeasonNow(id) && (!ITEMS[id].needs || owns(F, ITEMS[id].needs)) && (!ITEMS[id].visited || ((F.towns || {})[ITEMS[id].visited])) && (!ITEMS[id].story || storyGiven(F, ITEMS[id].story)) && (!ITEMS[id].ghOf || !inSeasonNow(ITEMS[id].ghOf))).map(id => {
        const it = ITEMS[id], locked = it.need && S.earned < it.need, owned = it.kind === "keep" ? F.fam.owned[id] : it.kind === "tool" && F.inv[id];
        const extra = it.kind === "seed" ? ` · ${dur(CROPS[it.crop].dur)} · ${CROPS[it.crop].yield || 1} a harvest` : "";
        if (it.kind === "pet" && KINDS[it.pet]) { const full = roomLeft(F) <= 0; return itemBtn(id, full ? "the run is full" : `<b>${it.price}</b> ${icon("coin", 13)}`, full || F.coins < it.price); }
        return itemBtn(id, locked ? `earn ${it.need} today` : owned ? (it.kind === "keep" ? "at home" : "owned") : `<b>${it.price}</b> ${icon("coin", 13)}${extra}`, locked || owned || F.coins < it.price, F.inv[id] && !owned ? `<span class="cnt">×${F.inv[id]}</span>` : "");
      }).join("");
      if (shopTab === "animals") h += `<p class="muted" style="grid-column:1/-1">Chicks, bunnies and goats go straight to the run at home (${F.pets.animals.length} of ${["2", "4", "6", "8"][F.pets.run]} there now). Each eats once a day (grown hens come for breakfast, lunch and dinner, with an egg each time): a bag of feed is one meal, and bunnies love a garden carrot too. Upgrade the run from the run itself.</p>`;
      if (shopTab === "deli") h += `<p class="muted" style="grid-column:1/-1">For the wine shop's kitchen: flour bakes into loaves in the oven, cheese and olives go on boards and in tapas. They go in your backpack: send them to the kitchen from there.</p>`;
      if (shopTab === "family") h += `<p class="muted" style="grid-column:1/-1">Little treats go in your backpack: give them in person from there. Keepsakes go straight home and stay forever.</p>`;
    }
    h += `</div>`;
  } else if (scene === "greenhouse" && ghBed != null) { h = typeof ghBed === "string" ? herbPotPanel(F, +ghBed.slice(1)) : bedPanel(F, ghBed);
  } else if (scene === "millup" && millOpen === "tasting") { h = tastePanel(F, tstSt, {on: tastingNow(dayKey(), localHM()) != null && owns(F, "millshop"), shop: owns(F, "millshop"), done: craftState(F).tasted === dayKey() && !tstSt});
  } else if (scene === "millup" && millOpen === "workshop") { h = workshopPanel(F, {on: workshopNow(dayKey(), localHM()) && owns(F, "millshop"), shop: owns(F, "millshop")});
  } else if ((scene === "mill" || scene === "millup") && millOpen) { h = millOpen === "story" ? millStory(F) : millOpen === "bench" ? millBenchPanel(F, mcSt, {shop: owns(F, "millshop"), ines: owns(F, "mill")}) : millOpen === "shop" ? millShopPanel() : millPanel(F);
  } else if (friView && scene === "field" && (/^bm\d$/.test(friView) || friView === "kites")) { h = bayMarketPanel(friView);
  } else if (friView === "van" && scene === "bay") { h = vanPanel(F);
  } else if (scene === "farm" && selPlot != null) {
    const p = F.plots[selPlot], i = selPlot;
    h = `<span class="tape stripe" aria-hidden="true"></span><h2>Plot ${i + 1}</h2>`;
    if (!p || !p.crop) {
      const seeds = Object.keys(F.inv).filter(id => ITEMS[id] && (ITEMS[id].kind === "seed" || ITEMS[id].plantable) && !ITEMS[id].greenhouse);   // greenhouse packets only grow under glass; seeded paper (round 186) grows wildflowers
      h += seeds.length ? `<p class="sub">${F.tools.seeder && F.plots.filter(q => !(q && q.crop)).length > 1 ? "Pick seeds: the auto seeder sows every empty plot at once." : "Pick seeds to plant."}</p><div class="items">${seeds.map(id => itemBtn(id, `${dur(CROPS[ITEMS[id].crop].dur)} to grow`, false, `<span class="cnt">×${F.inv[id]}</span>`)).join("")}</div>`
        : `<p class="sub">No seeds in your backpack. The market sells them.</p>`;
    } else {
      const g = growth(p), cr = CROPS[p.crop];
      if (!p.wateredAt) h += `<p class="sub">${icon(cr.ico, 18)} ${cr.n} seeds, waiting for water.</p><div class="actions"><button class="btn primary" data-farm="water">Water it</button></div>`;
      else if (g < 1) { const left = cr.dur*(1 - g); h += `<p class="sub">${icon(cr.ico, 18)} ${cr.n}, growing. About ${dur(left)} to go. Every task you tick off takes 30 minutes off.</p><div class="plotbar"><i style="width:${(g*100).toFixed(0)}%"></i></div>`; }
      else h += `<p class="sub">${icon(cr.ico, 18)} ${cr.n} is ready!</p><div class="actions"><button class="btn yes" data-farm="harvest">Harvest</button></div>`;
    }
  } else if (bedOpen && scene === "room") {
    h = `<span class="tape gingham" aria-hidden="true"></span><h2>Your bed</h2>` + (S.sleep
      ? `<p class="sub">${S.sleep.until ? `Napping. Up in about ${Math.max(1, Math.ceil((S.sleep.until - Date.now())/M))} min.` : "Fast asleep. Sweet dreams."}</p><div class="actions"><button class="btn yes" data-bed="up">Get up</button></div>`
      : `<p class="sub">Fluffy pillows, cool sheets${(F.decor || {}).r_throw ? ", your knitted throw" : ""}.</p><div class="actions"><button class="btn primary" data-bed="nap">Nap for 20 minutes</button><button class="btn alt" data-bed="sleep">${localHM() >= 20*60 || localHM() < 5*60 ? "Go to sleep" : "Lie down"}</button></div>`);
  } else if (recOpen && scene === "room") {
    const on = sound.music, ct = currentTrack();
    h = `<span class="tape gingham" aria-hidden="true"></span><h2>Record player</h2><p class="sub">${on ? `Playing: ${esc(TRACKS[ct].name)}.` : "Pick a record to put on."}</p>
      <div class="records">${Object.entries(TRACKS).filter(([, t]) => !t.live).map(([id, t]) => `<button class="record${on && id === ct ? " on" : ""}" data-track="${id}"><svg viewBox="0 0 40 40" width="46" height="46" aria-hidden="true"><circle cx="20" cy="20" r="18" fill="#2F2B28"/><circle cx="20" cy="20" r="13" fill="none" stroke="#4A4540" stroke-width=".8"/><circle cx="20" cy="20" r="9" fill="none" stroke="#4A4540" stroke-width=".8"/><circle cx="20" cy="20" r="6.5" style="fill:${t.col}"/><circle cx="20" cy="20" r="1.4" fill="#FFFDF6"/></svg><span class="n">${esc(t.name)}</span><span class="c">${on && id === ct ? "playing now" : esc(t.mood)}</span></button>`).join("")}</div>
      <div class="actions recrow"><label for="recVol" class="muted">Volume</label><input id="recVol" type="range" min="0" max="1" step="0.05" value="${sound.musicVol}">${on ? `<button class="btn alt small" data-rec="stop">Lift the needle</button>` : ""}</div>`;
  } else if (calmOpen && scene === "room") {
    h = `<span class="tape gingham" aria-hidden="true"></span><h2>Calm corner</h2>` + (breath
      ? `<div class="breathe"><div class="ring" style="animation-delay:-${((Date.now() - breath.start)/1000 % CYCLE).toFixed(2)}s"></div><p class="cue" id="breathCue">Breathe in</p></div><p class="sub" style="text-align:center"><span id="breathLeft"></span> left</p><div class="actions" style="justify-content:center"><button class="btn alt small" data-calm="stop">Stop</button></div>`
      : `<p class="sub">Cushions, ${(F.decor || {}).r_candle ? "a candle, " : ""}one slow breath.</p><p class="eyebrow">Guided breathing</p><div class="actions">${[1, 3, 5].map(m => `<button class="btn ${m === 3 ? "primary" : "alt"} small" data-calm="${m}">${m} min</button>`).join("")}</div>`);
  } else if (journalOpen && scene === "room") {
    h = journalPanel();
  } else if (wardOpen && scene === "room") {
    h = wardrobePanel(F);
  } else if (runOpen && scene === "base") {
    h = runPanel(F);
  } else if (shedOpen) {
    h = `<span class="tape stripe" aria-hidden="true"></span><h2>The garden shed</h2><p class="sub">You have ${icon("coin", 16)} ${F.coins}. Tools for the garden, bought once and kept forever.${isHere("bo") ? " Bo's here to set them up." : " Bo pops round to set them up."}</p><div class="items shop">`
      + Object.keys(SHED).map(id => { const t = SHED[id], own = F.tools[id];
        return `<button class="item" data-tool="${id}" ${own || F.coins < t.price ? "disabled" : ""}><span class="e">${icon(t.ico, 34)}</span><span class="n">${esc(t.n)}</span><span class="c">${own ? "in use" : `<b>${t.price}</b> ${icon("coin", 13)}`}</span><span class="d">${esc(t.what)}</span></button>`; }).join("")
      + `</div><div class="actions"><button class="btn alt small" data-close="1">Close the shed</button></div>`;
  }
  // round 166: a shop's stocking panel mentions what's waiting in storage at home that it could use
  { const hn = scView === "fridge" && SCOOP_IN.includes(scene) ? "scoop" : ccView === "pantry" && COCOA_IN.includes(scene) ? "cocoa" : kView === "larder" && scene === "kitchen" ? "kitchen" : kView === "mull" && scene === "kitchen" ? "rack" : null, note = hn ? homeNote(F, hn) : "";
    if (note) { const i = h.lastIndexOf('<div class="actions">'); h = i < 0 ? h + note : h.slice(0, i) + note + h.slice(i); } }
  c.innerHTML = h;
  if ((homeView && (scene === "home" || scene === "garage")) || (guestView && scene === "guestroom") || (wardOpen && scene === "room") || (habView && scene === "haberdash") || (tailView && scene === "tailor")) wireStorage(c);
  if (tailView && scene === "tailor") tailorPreview();
  if (ppView && scene === "bv_hpaper") wirePaper(c);
  if ((ppView && scene === "bv_hpaper") || (fieldView === "gwrap" && scene === "giftshop")) wireWrap(c);
  if (fieldView && scene === "giftshop") c.querySelectorAll("[data-gs]").forEach(b => b.onclick = ev => { ev.stopPropagation(); const [a, v] = b.dataset.gs.split(/:(.*)/s), cc = owns(F, "cocoa") ? cocoaState(F) : null;   // round 188: take from the displays
    if (a === "eat" && cc) { const bb = eatBonbon(F, v); if (bb) { sfx("chime"); mprop("heart", hero.x, hero.y - 60, 1600); speak(`${bb.name}. Oh, that's good.`, 3500); } }
    else if (a === "box" && cc) { const id = packBox(F, 4, {[v]: 4}); if (id) { sfx("paper", true); flash(`${ITEMS[id].n} in your backpack`); } }
    else if (a === "bar" && cc) { if (takeBar(F, v, true)) { sfx("chime"); flash(`${CC_KINDS[v].n} bar in your backpack`); } }
    else if (a === "mill") { if (takeFromStore(F, v, 1)) { sfx("paper", true); flash(`${ITEMS[v].n} in your backpack`); } }
    else if (a === "wine") { const id = takeBottle(F, vineState(F), v); if (id) { sfx("paper", true); flash(`${ITEMS[id].n} in your backpack`); } }
    else if (a === "wput") { if (putWrapped(F, v)) { sfx("paper", true); flash("In the gift basket"); } }   // round 202: the gift basket
    else if (a === "wback") { const id = takeWrapped(F, +v); if (id) { sfx("paper", true); flash(`${ITEMS[id].n}, back in your backpack`); } }
    else if (a === "pair" && cc) { gsPk = {kind: "pair", k: v, size: 4, sel: {}}; sfx("paper", true); }   // round 189: pack a pairing box here
    else if ((a === "padd" || a === "psub") && gsPk) pickAdd(F, gsPk, v, a === "padd" ? 1 : -1);
    else if (a === "pfill" && gsPk) pickFill(F, gsPk);
    else if (a === "pcancel") gsPk = null;
    else if (a === "pgo" && gsPk && cc) { const w = packPairing(F, gsPk.k, gsPk.sel); if (w) { putOutPairs(F, cc, 1); gsPk = null; sfx("paper", true); flash(`A pairing box with ${w}, out in the wine corner`); } }
    save(true); ctx(); });
  if (fieldView && scene === "giftshop") c.querySelectorAll("[data-gg]").forEach(b => b.onclick = ev => { ev.stopPropagation(); const [a, v] = b.dataset.gg.split(/:(.*)/s);   // round 196: the gallery and the makers' shelf
    if (a === "hang") { if (GAL.hangOwn(F, v)) { sfx("paper", true); flash("Up on the gallery wall"); } }
    else if (a === "down") { if (GAL.takeDown(F, +v)) { sfx("paper", true); flash("Back in your backpack"); } }
    else if (a === "take") { if (GAL.takeTravel(F, v)) { sfx("paper", true); flash(`${ITEMS[v].n}, in your backpack`); } }
    else if (a === "buy") { if (GAL.buyMade(F, v)) { sfx("coin"); flash(`${ITEMS[v].n}, in your backpack (the coins go to ${GAL.MAKERS[ITEMS[v].maker].name})`); } }
    save(true); ctx(); });
  if (fieldView && scene === "giftshop") c.querySelectorAll("[data-gp]").forEach(b => b.onclick = ev => { ev.stopPropagation(); const cc = owns(F, "cocoa") ? cocoaState(F) : null;   // round 179
    if (b.dataset.gp === "put") { const k = putOutPairs(F, cc, +b.dataset.n || 1); if (k) { sfx("paper", true); flash(`${k} pairing box${k > 1 ? "es" : ""} out in the wine corner`); } }
    else if (takeBackPair(F, cc)) { sfx("paper", true); flash("A pairing box, back in your backpack"); }
    save(); ctx(); });
  if (kView && scene === "kitchen") wireKitchen(c, F, {save: () => save(true), rerender: () => { ctx(); drawScene(); }, say: l => speak(l, 4500), sfx, today: dayKey()});
  c.querySelectorAll("[data-goal]").forEach(b => b.onclick = () => { const line = buyGoal(F, b.dataset.goal); if (!line) return; sfx("chaching"); act("cheer"); flash(`${GOALS[b.dataset.goal].n}: yours!`); gainXp(5);
    [0, 300, 600].forEach((d, k) => setTimeout(() => mprop("sparkle", hero.x + (k - 1)*24, hero.y - 60, 1800), d)); if (b.dataset.goal === "paperie") { const pp = PP.paperState(F); pp.scrapDay = dayKey(); pp.scraps += 4; }   // a first box of scraps from home
    speak(line, 7000); if (b.dataset.goal === "scooter" || b.dataset.goal === "car") goalView = "garagepick"; else goalView = null; save(true); drawScene(); ctx(); });
  if (scView || (fieldView === "mstall8" && scene === "field")) wireScoop(c);
  wireCompanions(c);
  if (ccView || (fieldView && scene === "field" && fieldKind() === "cocoa")) wireCocoa(c);
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
  c.querySelectorAll("[data-mill]").forEach(b => b.onclick = () => { const l = b.dataset.mill === "press" ? startPress(F, +b.dataset.n) : collectOil(F, addInv);
    if (l) { sfx(b.dataset.mill === "press" ? "crunch" : "chime"); if (b.dataset.mill !== "press") { gainXp(1); act("cheer"); } speak(l, 4500); save(true); } ctx(); });
  c.querySelectorAll("[data-gh]").forEach(b => b.onclick = () => { const i = +b.dataset.i, gh = b.dataset.gh;
    if (gh === "plant" || gh === "pplant") { const l = (gh === "plant" ? ghPlant : potPlant)(F, i, b.dataset.id, addInv); if (l) { sfx("pop"); speak(l, 3500); F.gift = false; } }
    else if (gh === "dig") { const l = potDig(F, i); if (l) { sfx("paper", true); speak(l, 3500); } }
    else if (gh === "clip") { const r = potClip(F, i, addInv); if (r) { gainXp(1); act("cheer"); sfx("chime"); speak(r.line, 4000); const p = GH_POT_AT[i]; mprop(r.crop, p.x, p.y - 30, 1900); ghBed = null; } }
    else { const r = ghHarvest(F, i, addInv); if (r) { gainXp(1); act("cheer"); sfx("chime"); speak(r.line, 4000); const p = GH_BED_AT[i]; mprop(r.crop, p.x + 50, p.y + 20, 1900); ghBed = null; } }
    save(true); ctx(); });
  c.querySelectorAll("[data-tickets]").forEach(b => b.onclick = () => { railOpen = "tickets"; sfx("paper", true); ctx(); });
  // Bellbird Valley (round 141): who's coming in the van, where to, home; the passport
  c.querySelectorAll("[data-bvpick]").forEach(b => b.onclick = () => { const id = b.dataset.bvpick; tripPick = tripPick.includes(id) ? tripPick.filter(x => x !== id) : tripPick.length < 4 ? [...tripPick, id] : tripPick; sfx("tap"); ctx(); });
  c.querySelectorAll("[data-bvgo]").forEach(b => b.onclick = () => vanGo(b.dataset.bvgo));
  c.querySelectorAll("[data-bvhome]").forEach(b => b.onclick = () => vanHome(false));
  c.querySelectorAll("[data-bvregion]").forEach(b => b.onclick = () => { bvRegion = b.dataset.bvregion; sfx("paper", true); ctx(); });
  c.querySelectorAll("[data-bvpass]").forEach(b => b.onclick = () => { bvView = "passport"; sfx("paper", true); ctx(); });
  c.querySelectorAll("[data-ttown]").forEach(b => b.onclick = () => { tripTown = b.dataset.ttown; sfx("tap"); ctx(); });
  c.querySelectorAll("[data-btown]").forEach(b => b.onclick = () => { boatTown = b.dataset.btown; sfx("tap"); ctx(); });
  c.querySelectorAll("[data-boat]").forEach(b => b.onclick = () => { railOpen = false; ctx(); startCruise(); });
  c.querySelectorAll("[data-ftown]").forEach(b => b.onclick = () => { ferryTown = b.dataset.ftown; sfx("tap"); ctx(); });
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
    hero.sitting = true; nodes.hero.classList.add("sit"); if (b.dataset.rcafe === "choc") speak(pick(["Dip, bite, dip again. The chocolate's so thick the churro stands up in it.", "Hot churros, crisp and sugary, and a cup of chocolate you could stand a spoon in. Heaven."]), 6000); else speak(pick(["Café con leche in a glass, a churro to dip, and the fan ticking round overhead. Bliss.", "Doña Carmen sets it down: \"Eat, eat. You're too thin.\" The churro's still hot.", "Coffee, sugar, the plaza going by outside the window. Nobody's in a rush."]), 6000);
    ; save(); });
  c.querySelectorAll("[data-kt]").forEach(b => b.onclick = () => { const [a, v] = b.dataset.kt.split(":"), evanOn = false, ev = (l, d = 1600) => { ; };
    if (a === "yukata") { const n = rentYukata(F, v); if (!n) return; sfx("chaching"); flash("A yukata for the day"); speak(`You change into the ${n.toLowerCase()}, an obi tied at the back, wooden sandals clacking.${("")}`, 6000); ; save(); dressMel(); }
    else if (a === "tea") { if (F.coins < TEA.price) return; F.coins -= TEA.price; ktSt = {tea: whiskStart()}; sfx("paper", true); save(); }
    else if (a === "teaagain") { ktSt = {}; }
    else if (a === "whisk") { if (!ktSt.tea) return; const ok = whisk(ktSt.tea); sfx(ok ? "tap" : "paper", true); }
    else if (a === "bow") { if (!ktSt.tea || !ktSt.tea.done) return; ktSt.tea.bowed = true; const k = kyotoState(F); k.teas = (k.teas || 0) + 1; gainXp(froth(ktSt.tea) ? 2 : 1); hearts(froth(ktSt.tea) ? 3 : 1); sfx("chime");
      speak(froth(ktSt.tea) ? "You turn the bowl twice and bow. Sachiko bows back, very low. That's the best thing that's happened all week." : "You turn the bowl twice and bow. Sachiko bows back and smiles.", 5500); ; save(); }
    else if (a === "sit") { ktSt = {sit: sitStart()}; sfx("paper", true); [0, 1, 2, 3, 4, 5, 6].forEach(i => setTimeout(() => { if (kyotoView === "kt_hall" && ktSt.sit && !ktSt.sit.done) ctx(); }, 1600 + i*4000)); }
    else if (a === "in" || a === "out") { if (!ktSt.sit) return; const r = breathe(ktSt.sit, a); if (!r) return; sfx(r === "ok" ? "tap" : "paper", true);
      if (ktSt.sit.done) { const k = kyotoState(F); k.sits = (k.sits || 0) + 1; gainXp(calm(ktSt.sit) ? 2 : 1); sfx("chime"); hero.sitting = true; nodes.hero.classList.add("sit"); ; save(); } }
    else if (a === "donate") { if (F.coins < 2) return; F.coins -= 2; sfx("coin"); speak("The coin drops into the wooden box. Jōshin bows, smiling.", 3500); save(); }
    else if (a === "fortune") { const f = drawFortune(F); if (!f) return; ktSt = {fortune: f}; sfx("paper", true); speak(f[0] === "Bad luck" ? "Bad luck! You tie the slip to the rack and leave it there. Already feeling better." : `${f[0]}! ${f[1]}`, 5000); save(); }
    else if (a === "shape") { ktSt = {neri: {shape: v, step: 0}}; sfx("tap"); }
    else if (a === "step") { const n = ktSt.neri; if (!n) return; if (+v === n.step) { n.step++; n.oops = false; sfx("tap"); } else { n.oops = true; sfx("paper", true); } }
    else if (a === "nerireset") { ktSt = {}; }
    else if (a === "neri") { const n = ktSt.neri; if (!n || !makeNerikiri(F, n.shape, addInv)) return; ktSt = {}; sfx("chime"); gainXp(1); flash(`Nerikiri: ${NERI.shapes[n.shape][0].replace(/^A /, "").toLowerCase()}`);
      speak(`${NERI.shapes[n.shape][0]}, in a little box with a paper ribbon. "Very good," says Mr Tanaka. "My father would say: too good for a beginner." A gift for someone at home.`, 6500); ; save(); }
    else if (a === "wheel") { if (F.coins < 10) return; ktSt = {cup: {t0: Date.now(), good: 0, tries: 0}}; sfx("paper", true); }
    else if (a === "centre") { const c = ktSt.cup; if (!c || c.good >= 3) return; sfx(ktCentre(c) ? "tap" : "paper", true); }
    else if (a === "glaze") { const c = ktSt.cup; if (!c || c.good < 3) return; const dadToo = inParty(F, "theo"); if (!throwCup(F, dadToo, addInv)) return; ktSt = {}; sfx("chime"); gainXp(1); flash("Your Kyoto teacup");
      speak(`Ishida dips it in ${v === "indigo" ? "deep indigo" : v === "celadon" ? "pale celadon" : "warm amber"} glaze and fires it. A little wonky. Perfect. It's a keepsake for a shelf at home.${dadToo ? " Theo's comes out too, leaning badly. He's thrilled." : ""}`, 6500);
      if (dadToo && isHere("theo")) setTimeout(() => npcSay("theo", "Expressive. That's the word. It's expressive."), 2400); save(); }
    ctx(); });
  // Cinque Terre (rounds 132–133): pesto, the harvest, the boats, gelato, focaccia, the tasting
  // Bellbird Valley's rooms (round 142): treats, the long lunch, the chocolaterie's free tasting
  c.querySelectorAll("[data-bb]").forEach(b => b.onclick = () => { const [a, room, k] = b.dataset.bb.split(":"), evanOn = false, ev = (l, d = 1600) => { ; };
    if (a === "treat") { if (room === "bv_restaurant" && bbState(F).lunch === dayKey()) return; const t = bbTreat(F, room, k); if (!t) return; sfx(k === "flight" ? "chime" : "slurp"); gainXp(1); hearts(2); speak(`${t[0]}. ${t[2]}`, 6500);
      if (room === "bv_restaurant") { bbState(F).lunch = dayKey(); const tr = tripOn(F), who = tr ? tr.party.filter(x => (isHere(x))) : []; who.slice(0, 3).forEach((id, i) => setTimeout(() => npcSay(id, pick(["Pass the bread down? Thank you, love.", "This lamb. I'm not talking for a minute.", "We should do this every Sunday.", "Look at the view. Look at it!"])), 2400 + i*2400)); }
      ; }
    else if (a === "pingpong") { sfx("tap"); gainXp(1); speak(pick(["Ping. Pong. Ping. Pong. A rally of twenty-two! Then you hit it into the piano.", "You win 11 to 9. Your opponent demands a rematch. You say no.", "A long, ridiculous rally, both of you laughing. The ball ends up under the pinball machine."]), 5500); ; }
    else if (a === "cut") { const n = bbCuttings(F, room); if (!n) return; sfx("chaching"); gainXp(1); flash(`Three ${n} cuttings`); speak(`Kel snips three ${n} cuttings, wraps them in damp newspaper and a bit of hessian. "Full sun, a good drink, and talk to them now and then." Plant them on a trellis at home.`, 7000); }
    else if (a === "choc") { if (!chocTaste(F)) return; sfx("chime"); gainXp(1); hearts(2); speak("Sophie sets down a little dish: dark, milk, white, and one speckled with wattleseed, nutty and toasty. \"The wattleseed's from the bush out the back,\" she says.", 6500); ; }
    save(); ctx(); });
  c.querySelectorAll("[data-newstab]").forEach(b => b.onclick = () => { newsTab = b.dataset.newstab; sfx("tap"); ctx(); });
  // round 152: the terrace's bookings book tabs, trivia night and sip and paint (occasions.js)
  // round 153: the mill workbench (millcraft.js)
  c.querySelectorAll("[data-mc]").forEach(b => b.onclick = () => { const i = b.dataset.mc.indexOf(":"), a = i < 0 ? b.dataset.mc : b.dataset.mc.slice(0, i), v = i < 0 ? "" : b.dataset.mc.slice(i + 1);
    if (a === "tab") { mcSt = {tab: v}; sfx("tap"); }
    else if (a === "base") { mcSt.base = v; sfx("tap"); }
    else if (a === "dye") { mcSt.dye = v || null; sfx("tap"); }   // round 187: a flower for the colour
    else if (a === "render") { const k = renderWax(F); if (k) { sfx("chime"); speak(`The comb melts down in the little pan, honey on the bottom, gold wax on top. ${k} blocks of beeswax.`, 4500); save(); } }
    else if (a === "add") { const max = (CRAFT_KINDS[mcSt.tab] || {max: 1}).max; mcSt.adds = mcSt.adds || []; if (mcSt.adds.includes(v)) mcSt.adds = mcSt.adds.filter(x => x !== v); else { if (mcSt.adds.length >= max) mcSt.adds.shift(); mcSt.adds.push(v); } sfx("tap"); }
    else if (a === "make" || a === "again") { const r0 = a === "again" ? craftState(F).recipes.find(r => r.id === v) : null, kind = r0 ? r0.kind : mcSt.tab, base = r0 ? r0.base : mcSt.base || "goatmilk", adds = r0 ? r0.adds : mcSt.adds || [];
      const r = millCraft(F, kind, kind === "soap" ? base : null, adds, "bag", r0 ? r0.dye || null : mcSt.dye || null); speak(r.msg, 5000); if (r.recipe) { sfx("chime"); gainXp(r.fresh ? 2 : 1); if (r.fresh) flash(`New: ${r.recipe.name}`); mcSt = {tab: kind}; save(); drawScene(); } }
    else if (a === "takeit") { if (takeFromStore(F, v, 1)) { sfx("tap"); save(); } }
    else if (a === "unbasket") { const [id, n] = v.split(":"), k = fromBasket(F, id, +n || 99); if (k) { sfx("paper", true); flash(`${k} back into your backpack`); save(); } }
    else if (a === "basket") { const k = toBasket(F, v); if (k) { sfx("paper", true); speak(`${k} into the mill's basket, ready for the bench.`, 3500); save(); } }
    ctx(); });
  // round 153: the mulling pot (mulled.js)
  c.querySelectorAll("[data-mull]").forEach(b => b.onclick = () => { const [a, v] = b.dataset.mull.split(":"), st = mullSt;
    if (a === "base") { st.base = v; sfx("tap"); }
    else if (a === "unrack") { const k = fromRack(F, v, +b.dataset.mull.split(":")[2] || 99); if (k) { sfx("paper", true); flash(`${k} back into your backpack`); save(); } }
    else if (a === "rack") { const k = toRack(F, v); if (k) { sfx("paper", true); flash(`${k} ${MULL_ADDS[v].n.toLowerCase()}, onto the spice rack`); save(); } }
    else if (a === "add") { st.adds = st.adds || []; if (st.adds.includes(v)) st.adds = st.adds.filter(x => x !== v); else if (st.adds.length < MULL.max) st.adds.push(v); sfx("tap"); }
    else if (a === "go" || a === "again") { const vs = vineState(F), adds = a === "again" ? (mullState(F).recipes.find(r => r.id === v) || {adds: []}).adds : st.adds || [], base = a === "again" ? (vs.shelf.find(x => x.n > 0 && MULL.base.includes(x.type)) || {}).id : st.base;
      const r = mullStart(F, vs, base, adds, dayKey()); speak(r.msg, 5000); if (r.recipe) { sfx("chime"); gainXp(r.fresh ? 2 : 1); if (r.fresh) flash(`New mulled wine: ${r.recipe.name}`); mullSt = {}; if (isHere("pilar")) setTimeout(() => npcSay("pilar", pick(["Mmm, the whole kitchen smells like Christmas.", "Low heat! Never let it boil.", "Save me a cup, eh?"])), 1800); save(); } }
    ctx(); });
  c.querySelectorAll("[data-tst]").forEach(b => b.onclick = () => { const i = b.dataset.tst.indexOf(":"), a = i < 0 ? b.dataset.tst : b.dataset.tst.slice(0, i), v = i < 0 ? "" : b.dataset.tst.slice(i + 1);
    if (a === "sit") { tstSt = tasteStart(F); hero.sitting = true; nodes.hero.classList.add("sit"); sfx("paper", true); if (isHere("hazel")) npcSay("hazel", "Cup the glass. Warm it. Now smell."); }
    else if (a === "note") { if (tstSt) { tastePick(tstSt, v); sfx("tap"); } }
    else if (a === "next") { if (!tstSt) return; const hits = tasteNext(tstSt); sfx(hits >= 2 ? "chime" : "tap"); }
    else if (a === "done") { if (!tstSt || !tasteDone(tstSt)) return; const glass = finishTaste(F, tstSt, addInv); tstSt = null; gainXp(2); hearts(2); sfx("chime"); if (glass) { flash("A cobalt tasting glass"); speak("Tomi rinses your little blue glass and hands it to you. \"Keep it. Your first tasting.\" Just like Córdoba.", 6500); } save(); }
    else if (a === "help") { const r = helpWorkshop(F); sfx("coin"); gainXp(2); hearts(2); flash(`+${r.tips} in tips`); speak(r.hint ? `You go round with the jug and the moulds. After, Hazel leans over: "Try ${r.hint.toLowerCase()} sometime. Trust me."` : "You go round with the jug and the moulds. Five very proud soap makers.", 7000); save(); }
    ctx(); });
  c.querySelectorAll("[data-crate]").forEach(b => b.onclick = () => { const k = b.dataset.crate;
    if (k === "unpack") { unpackCrate(F, vineState(F)); speak("Everything back where it came from.", 3000); } else if (packCrate(F, vineState(F), k, 1)) sfx("tap"); save(); ctx(); });
  c.querySelectorAll("[data-lbtab]").forEach(b => b.onclick = () => { lunchView = b.dataset.lbtab; sfx("tap"); ctx(); });
  c.querySelectorAll("[data-trv]").forEach(b => b.onclick = () => { const [a, v] = b.dataset.trv.split(":");
    if (a === "join") { if ((occasionNow(dayKey(), localHM()) || {}).kind !== "trivia" || F.coins < QUIZ.entry) return; F.coins -= QUIZ.entry; trvSt = triviaStart(dayKey(), TEAM_NAMES[+v]); sfx("chaching"); if (isHere("amara")) npcSay("amara", "Round one! Eyes on the screen, phones in pockets."); save(); }
    else if (a === "ans") { const ok = trvSt && triviaAnswer(trvSt, +v); if (ok == null) return; sfx(ok ? "chime" : "tap"); if (ok && Math.random() < .3) { const who = pick(["bo", "posy"]); if (isHere(who)) npcSay(who, pick(["Yes! Knew it.", "Write it down, write it down!", "Team genius."])); } }
    else if (a === "next") { if (!trvSt) return; triviaNext(trvSt); sfx("paper", true); if (trvSt.q === 0 && !trvSt.done && isHere("amara")) npcSay("amara", `Round ${trvSt.r + 1}: ${trvSt.rounds[trvSt.r].n}!`); }
    else if (a === "end" || a === "tie") { if (!trvSt || !trvSt.done) return; const r = finishTrivia(F, trvSt, a === "tie" ? +v : null); trvSt = null; gainXp(r.win ? 3 : 2); hearts(r.win ? 3 : 2); sfx(r.win ? "chaching" : "chime"); if (r.win) { act("cheer"); flash(`Trivia winners! +${r.pot}`); }
      speak(a === "tie" ? (r.win ? "128! Spot on. The jar's yours." : "It's 128. So close! The other lot take it.") : r.win ? `Amara reads it out: "And the winners, with ${r.score}..." Your team cheers so loudly someone knocks a chair over.` : `${r.score} out of 20. Next week, you're all agreed: more geography.`, 6000); save(); }
    ctx(); });
  c.querySelectorAll("[data-pnt]").forEach(b => b.onclick = () => { const [a, v] = b.dataset.pnt.split(":");
    if (a === "sub") { if ((occasionNow(dayKey(), localHM()) || {}).kind !== "paint" || F.coins < PAINT_PRICE) return; F.coins -= PAINT_PRICE; pntSt = paintStart(v); sfx("chaching"); if (isHere("theo")) npcSay("theo", pick(["Big brush first. Don't be shy with it.", "Background, then the middle, then the bit you love.", "There are no mistakes. Only happy little hills."])); save(); }
    else if (a === "col") { if (!pntSt || paintStep(pntSt, +v) == null) return; sfx("tap"); }
    else if (a === "done") { if (!pntSt || !paintDone(pntSt)) return; const got = finishPaint(F, pntSt, addInv), n = PAINT_SUBJECTS[pntSt.subject].n.toLowerCase(); pntSt = null; gainXp(2); hearts(2); sfx("chime"); if (got) flash("Your painting");
      speak(got ? `You carry ${n} home, still a bit wet. It's a keepsake now: it can go on a wall at home.` : `Another go at ${n}. Better than the last, and you mean it.`, 6000); save(); }
    ctx(); });
  // Bellbird Valley's activities (round 143: bbacts.js)
  c.querySelectorAll("[data-bba]").forEach(b => b.onclick = () => { const [a, v] = b.dataset.bba.split(":"), evanOn = false, ev = (l, d = 1600) => { ; }, tp = tripOn(F) ? tripOn(F).party : [];
    if (a === "open") { bbRoom = v; bbSt = {}; sfx("paper", true); }
    // the balloon
    else if (a === "fly") { const cost = BBA.flightCost(tp); if (!BBA.balloonOpen(localHM()) || F.coins < cost) return; F.coins -= cost; bbSt.flight = BBA.flightStart(); sfx("chaching"); speak("The burner roars, the basket creaks, and the ground just... lets go. Gus grins. \"Here we go.\"", 5000); ; save(); }
    else if (a === "burn" || a === "hold" || a === "drift") { const st = bbSt.flight; if (!st) return; if (st.i >= st.sights.length) { if (a === "drift") st.alt = Math.max(1, st.alt - 1); sfx("tap"); }
      else { const ok = BBA.flightMove(st, a); sfx(a === "burn" ? "pop" : "tap"); if (ok) { gainXp(0); ; } } }
    else if (a === "land") { const st = bbSt.flight; if (!st || BBA.flightLand(st) == null) return; sfx(st.soft ? "chime" : "tap"); ; }
    else if (a === "flown") { const st = bbSt.flight; if (!st || !st.landed) return; const cert = BBA.finishFlight(F, st, addInv); bbSt = {}; gainXp(2); hearts(3); act("cheer"); if (cert) flash("A flight certificate"); speak(`Gus pops a bottle of sparkling and pours little cups for everyone${("")}. ${cert ? "He signs a certificate for you: you've flown over Bellbird Valley." : "\"Back again! You're a regular.\""}`, 7000); save(); }
    // riddling
    else if (a === "riddle") { bbSt.riddle = BBA.riddleStart(); sfx("paper", true); ; }
    else if (a === "turn") { if (!bbSt.riddle || !BBA.riddleTap(bbSt.riddle, +v)) return; sfx("tap"); }
    else if (a === "riddled") { if (!bbSt.riddle || !BBA.riddleDone(bbSt.riddle)) return; const first = BBA.finishRiddle(F); bbSt = {}; sfx("chime"); gainXp(2); hearts(2);
      speak(first ? "Jono claps. \"You've got the wrist for it.\" He draws you a plan of a riddling rack on a napkin. Back home, there's one in your wine cellar now: lay your sparkling on it, and the longer it's riddled the more it sells for." : "Every mark pointing up. Jono nods. \"Same time tomorrow?\"", 7500); ; save(); }
    // berries and dipping
    else if (a === "pick") { bbSt.berries = BBA.berriesStart(); sfx("paper", true); ; }
    else if (a === "berry") { const r = BBA.pickBerry(bbSt.berries, +v); if (!r) return; sfx(r === "ok" ? "tap" : "paper", true); if (r === "unripe" && Math.random() < .5) ; }
    else if (a === "picked") { if (!bbSt.berries || !BBA.berriesDone(bbSt.berries)) return; const got = BBA.finishBerries(F, bbSt.berries, addInv); bbSt = {}; sfx("chime"); gainXp(1); hearts(2);
      if (got) { flash(`${got.rasp} raspberries, ${got.straw} strawberries`); speak("A basket of berries, warm from the sun. Pay at the gate by the weight: Shaz waves you through. \"First basket's on the house.\"", 6000); } else speak("Another basket! These ones are for eating, right here, right now.", 4500);
      ; save(); }
    else if (a === "choc" || a === "top") { bbSt.dip = {...(bbSt.dip || {}), [a]: v}; sfx("tap"); }
    else if (a === "dip") { const d = bbSt.dip || {}; if (!BBA.dipBerries(F, d.choc, d.top)) return; addInv("b_dipped", 1); bbSt = {}; sfx("chime"); gainXp(1); hearts(2); flash("Chocolate-dipped strawberries");
      speak(`Into the ${d.choc} chocolate, a twirl, ${d.top === "none" ? "and nothing else: perfect as they are" : `and a roll in ${BBA.DIP.tops[d.top].toLowerCase()}`}. Sophie boxes them up with a ribbon.`, 6000); ; save(); }
    // the joey
    else if (a === "joey") { bbSt.joey = BBA.joeyStart(); sfx("paper", true); ; }
    else if (a === "jstep") { const r = BBA.joeyDo(bbSt.joey, +v); if (!r) return; sfx(r === "ok" ? "tap" : "paper", true); }
    else if (a === "fed") { if (!bbSt.joey || !BBA.joeyDone(bbSt.joey)) return; const r = BBA.finishJoey(F); bbSt = {}; sfx("chime"); gainXp(r.again ? 1 : 2); hearts(3);
      speak(r.again ? "Pip's already had her feed today, so Kim lets you give her a cuddle instead. She smells of milk and hay." : r.release ? "Kim smiles. \"That's her third feed with you, and she's strong now. Jack's taking her back to the mob at the creek this week.\" Pip sticks her head out of her pouch and sniffs your hand, like she's saying goodbye." : `Pip drains the bottle, does a hiccup, and falls asleep in her pouch. Kim writes your name in the feeding book. (${r.feeds} of ${BBA.JOEY.RELEASE} feeds before she goes home to the bush.)`, 7500);
      ; save(); }
    // the canoe
    else if (a === "canoe") { if (!bbSt.paid) { if (F.coins < BBA.CANOE.price) return; F.coins -= BBA.CANOE.price; bbSt.paid = true; sfx("chaching"); } bbSt.canoe = BBA.canoeStart(); ; save(); }
    else if (a === "paddle") { if (!bbSt.canoe || BBA.paddle(bbSt.canoe, v) == null) return; sfx("tap"); }
    else if (a === "canoed") { if (!bbSt.canoe || !BBA.canoeDone(bbSt.canoe)) return; const straight = BBA.finishCanoe(F, bbSt.canoe); bbSt = {}; sfx("chime"); gainXp(2); hearts(2);
      speak(straight ? "Round the bend, smooth as anything, and there: a flash of blue on a dead branch. A kingfisher! It dives, comes up with a tiny fish, and is gone." : "You zigzag round the bend, bump the bank, and get the giggles. A kingfisher watches from a branch, unimpressed.", 7000); ; save(); }
    // marshmallows
    else if (a === "bag") { const st = BBA.openBag(F); if (!st) return; bbSt.bag = st; sfx("paper", true); const who = FIRE_FOLK.filter(isHere); if (who.length) setTimeout(() => npcSay(who[0], pick(["Here, take my good stick. It's the long one.", "Not too close! Patience.", "Golden. Not black. Golden."])), 1200); save(); }
    else if (a === "toast") { const r = BBA.toast(bbSt.bag); if (!r) return; sfx(r === "burnt" ? "pop" : "tap"); if (r === "burnt") ; }
    else if (a === "pull") { const r = BBA.pullOut(F, bbSt.bag); if (!r) return; sfx(r === "golden" ? "chime" : "tap"); if (r === "golden") { mprop("sparkle", hero.x, hero.y - 50, 1000); ; } save(); }
    else if (a === "mdone") { bbSt = {}; gainXp(1); hearts(2); const who = FIRE_FOLK.filter(isHere); who.slice(0, 2).forEach((id, i) => setTimeout(() => npcSay(id, pick(NPCS.find(n => n.id === id).lines)), 800 + i*2600)); }
    // the Coast Road's (round 150: cracts.js)
    else if (a === "surf") { if (!bbSt.paid) { const cost = CRA.surfCost(false); if (F.coins < cost) return; F.coins -= cost; bbSt.paid = true; sfx("chaching"); } bbSt.surf = CRA.surfStart(); if (isHere("crjet")) npcSay("crjet", "Chest up, look at the beach, not your feet. Here comes one!"); ; save(); }
    else if (a === "spaddle" || a === "popup") { const st = bbSt.surf; if (!st) return; const r = CRA.surfDo(st, a === "spaddle" ? "paddle" : "pop"); if (!r) return; sfx(r === "ride" ? "chime" : r === "dumped" ? "pop" : "tap"); if (r === "ride") { mprop("sparkle", hero.x, hero.y - 50, 900); ; } }
    else if (a === "surfed") { const st = bbSt.surf; if (!st || !CRA.surfDone(st)) return; const photo = CRA.finishSurf(F, st, addInv); bbSt = {}; gainXp(2); hearts(2); act("cheer"); if (photo) flash("A photo of your first wave"); speak(photo ? "Jet's mate on the sand got a photo of you on your first wave: arms out, mouth wide open. Jet prints it at the shop for you." : "Wetsuit off, towel on, sand everywhere. The best kind of tired.", 6000); save(); }
    else if (a === "whales") { bbSt.whale = CRA.whaleStart(dayKey()); sfx("paper", true); ; }
    else if (a === "look") { const st = bbSt.whale; if (!st) return; const r = CRA.whaleLook(st, +v); if (!r) return; sfx(r === "sea" ? "tap" : "chime"); if (r !== "sea") ; }
    else if (a === "whaled") { const st = bbSt.whale; if (!st || !CRA.whaleDone(st)) return; const card = CRA.finishWhales(F, st, addInv); bbSt = {}; gainXp(st.seen.length ? 2 : 1); hearts(st.seen.length ? 2 : 1); if (card) flash("A whale sighting card"); if (card) speak("Win stamps a sighting card for you, with the date and a little humpback, and writes what you saw in the lighthouse log.", 6000); save(); }
    else if (a === "glow") { if (!CRA.glowOpen(localHM())) return; bbSt.glow = CRA.glowStart(); sfx("paper", true); }
    else if (a === "gwait") { if (!bbSt.glow || CRA.glowWait(bbSt.glow) == null) return; sfx("tap"); if (bbSt.glow.wait >= CRA.GLOW.WAIT) ; }
    else if (a === "gcount") { if (!bbSt.glow || CRA.glowCount(bbSt.glow, +v) == null) return; sfx("tap"); }
    else if (a === "glowed") { const st = bbSt.glow; if (!st || !CRA.glowDone(st)) return; const r = CRA.finishGlow(F, st); bbSt = {}; gainXp(2); hearts(2); speak(`Back out into the evening, blinking. ${r.n} glow-worms.${r.best ? " Your best count yet." : ""} Tash says that's a good night for it.`, 5000); save(); }
    else if (a === "pots") { if (!CRA.potsOpen(localHM())) return; bbSt.pots = CRA.potsStart(); sfx("paper", true); ; }
    else if (a === "haul") { if (!bbSt.pots || !CRA.potHaul(bbSt.pots)) return; sfx("tap"); if (bbSt.pots.last !== "empty") ; }
    else if (a === "keep") { if (!bbSt.pots || CRA.potChoose(bbSt.pots, v === "1") == null) return; sfx("tap"); }
    else if (a === "potted") { const st = bbSt.pots; if (!st || !CRA.potsDone(st)) return; const n = CRA.finishPots(F, st, addInv); bbSt = {}; gainXp(2); hearts(2); if (n) flash(`${n} crayfish from Mags`); speak(n ? `Mags wraps two crays in wet newspaper for you: "For a crayfish roll. Lemon, butter, soft bun. Nothing else." (Crayfish rolls are on the kitchen's specials now.)` : "Mags gives you a wave from the wheelhouse. \"Same time tomorrow, deckhand.\"", 7000); save(); }
    else if (a === "peng") { if (!CRA.pengOpen(localHM())) return; bbSt.peng = CRA.pengStart(false); sfx("paper", true); }
    else if (a === "pstill" || a === "pshush") { if (!bbSt.peng || CRA.pengDo(bbSt.peng, a === "pstill" ? "still" : "shush") == null) return; }
    else if (a === "penged") { const st = bbSt.peng; if (!st || !CRA.pengDone(st)) return; const n = CRA.finishPeng(F, st); bbSt = {}; gainXp(2); hearts(3); sfx("chime"); speak(`${n} little penguins home for the night. Outside, the stars are out over the Sisters.`, 5000); ; save(); }
    else if (a === "nip") { bbSt.nip = CRA.nipStart(); sfx("paper", true); if (isHere("crdimi")) npcSay("crdimi", "On your marks... get set... GO!"); }
    else if (a === "ncheer" || a === "nduck") { if (!bbSt.nip || CRA.nipDo(bbSt.nip, a === "ncheer" ? "cheer" : "duck") == null) return; sfx("tap"); }
    // the Tablelands' (round 159: tlacts.js): one action for them all
    else if (a === "tl" || a === "lv") { const [verb, arg] = v.split("."), r = (a === "tl" ? TLA.tlAct : LVA.lvAct)(F, bbRoom, bbSt, verb, arg, {hm: localHM(), addInv}); if (!r) return;   // (round 163: and the Lavender Hills', lvacts.js)
      if (r.sfx) sfx(r.sfx); ; if (r.xp) gainXp(r.xp); if (r.hearts) hearts(r.hearts); if (r.flash) flash(r.flash); if (r.say) speak(r.say, 5500); if (r.close) { bbRoom = null; bbSt = {}; act("cheer"); } save(true); }
    else if (a === "nipped") { const st = bbSt.nip; if (!st || !CRA.nipDone(st)) return; const r = CRA.finishNip(F, st, addInv); bbSt = {}; gainXp(2); hearts(3); act("cheer"); if (r.medal) flash("A surf club medal"); speak(r.medal ? "Coach Dimi hangs a medal round your neck: your first surf club swim. You might wear it in the bath." : "Hot chips on the surf club balcony, still in your swim cap.", 6500); ; save(); }
    ctx(); });
  c.querySelectorAll("[data-ct]").forEach(b => b.onclick = () => { const [a, v] = b.dataset.ct.split(":"), evanOn = false, ev = (l, d = 1600) => { ; };
    if (a === "pesto") { ctSt = {pesto: pestoStart()}; sfx("paper", true); ; }
    else if (a === "padd") { const r = pestoAdd(ctSt.pesto, +v); sfx(r === "ok" ? "tap" : "paper", true); }
    else if (a === "pound") { if (pestoPound(ctSt.pesto)) sfx("tap"); }
    else if (a === "pestodone") { if (!ctSt.pesto || !pestoDone(ctSt.pesto) || !finishPesto(F, addInv)) return; ctSt = {}; sfx("chime"); gainXp(2); hearts(2); flash("Two jars of pesto"); speak("Two jars of your own pesto. Nonna Pina leans in: \"The secret? Ligurian basil, young leaves, and patience.\" Now you can make it at home too, in the loft over the barrels.", 7000); save(); }
    else if (a === "ride" || a === "monorail") { cinqueView = "monorail"; ctSt = a === "ride" ? {harvest: harvestStart()} : {}; sfx("paper", true); if (a === "ride") ; }
    else if (a === "arrive") { if (ctSt.harvest) ctSt.harvest.riding = false; sfx("tap"); }
    else if (a === "pick") { const r = ctPick(ctSt.harvest, +v); if (!r) return; sfx(r === "ok" ? "tap" : "paper", true); }
    else if (a === "harvestdone") { if (!ctSt.harvest || !harvestDone(ctSt.harvest)) return; const n = finishHarvest(F, addInv); ctSt = {}; sfx("chime"); gainXp(2); act("cheer"); if (n) flash(`${n} bunches of white grapes`); speak(`Signor Bruno shakes your hand. "Next year you come back." ${n ? "He gives you three bunches to start your own racks. " : ""}Up the ladder in your barrel shed at home, the drying loft is ready for raisin wine.`, 7000); save(); }
    else if (a === "hull" || a === "stripe" || a === "bname") { ctSt.boat = {...(ctSt.boat || {}), [a === "bname" ? "name" : a]: v}; sfx("tap"); }
    else if (a === "paint") { const st = ctSt.boat || {}; const bt = paintBoat(F, st.hull, st.stripe, st.name, addInv); if (!bt) return; ctSt = {boat: {}}; sfx("chime"); gainXp(2); hearts(2); flash("Your painted boat");
      speak(`Fresh paint, gleaming: "${st.name}" along the bow${("")}. Aldo gives you a little carved model of her to keep, and says he'll see one just like her at your jetty. Fishermen talk.`, 7000); ; drawScene(); save(); }
    else if (a === "gelato" || a === "focaccia") { const t = ctTreat(F, a === "gelato" ? GELATO : FOCACCIA, v); if (!t) return; sfx("slurp"); gainXp(1); hearts(2); speak(`${t[0]}. ${t[2]}`, 5500); ; save(); }
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
  // Saltwick Harbour (round 215): the scar, the crab line, the café and its brew, the lamp
  c.querySelectorAll("[data-sw]").forEach(b => b.onclick = () => { const [a, v] = b.dataset.sw.split(":");
    if (a === "split") { const r = splitStone(F, +v, addInv); if (!r) return; swSt = {last: r}; sfx(r.empty ? "tap" : "chime"); if (!r.empty) { gainXp(r.fresh ? 2 : 1); act("cheer"); flash(r.cased ? "A glass case of ammonites" : "An ammonite"); } save(); }
    else if (a === "crab") { clearTimeout(swCrabT); swSt = {crab: crabStart()}; sfx("paper", true); }
    else if (a === "drop") { const st = swSt.crab; if (!st) return; const ms = dropLine(st); if (!ms) return; sfx("tap"); clearTimeout(swCrabT); swCrabT = setTimeout(() => { if (swView === "crab" && swSt.crab === st) { sfx("tap"); ctx(); } }, ms + 30); }
    else if (a === "pull") { const st = swSt.crab; if (!st) return; clearTimeout(swCrabT); const r = pullUp(st); sfx(r === "crab" ? "chime" : "paper", true);
      if (st.done) { const first = crabDone(F, st, addInv); gainXp(st.got >= 3 ? 2 : 1); if (st.got) hearts(1); if (first) { flash("Your crabbing line"); speak("Jack grins and hands you the line to keep. \"Three! You're a natural. That one's lucky now.\"", 5500); } save(); } }
    else if (a === "cafe") { const c0 = swCafe(F, v); if (!c0) return; sfx("slurp"); gainXp(1); hearts(2); speak(c0[2], 5500); save(); }
    else if (a === "tea") { swSt = {tea: {step: 0, done: false}}; sfx("paper", true); }
    else if (a === "step") { const st = swSt.tea; if (!st) return; const r = teaStep(st, +v); sfx(r === "ok" ? "tap" : "paper", true); if (st.done) { const first = teaDone(F, addInv); gainXp(2); hearts(2); if (first) flash("A Saltwick mug"); save(); } }
    else if (a === "lamp") { swSt = {lamp: lampStart()}; sfx("paper", true); }
    else if (a === "wipe" || a === "wind" || a === "light") { const st = swSt.lamp; if (!st) return; const r = lampStep(st, a); if (!r) return; sfx(r === "lit" ? "chime" : "tap");
      if (r === "lit") { const first = lampDone(F, addInv); gainXp(3); hearts(2); act("cheer"); if (first) flash("A page from the keeper's ledger"); save(); } }
    ctx(); });
  c.querySelectorAll("[data-jj]").forEach(b => b.onclick = () => { const [a, v] = b.dataset.jj.split(":"), evanOn = false, ev = (l, d = 1600) => { ; };
    if (a === "dive" || a === "again") { jjSt = {dive: diveStart()}; sfx("paper", true); }
    else if (a === "down") { const d = jjSt.dive; if (!d || !descend(d)) return; sfx("tap"); }
    else if (a === "up") { const d = jjSt.dive; if (!d) return; const r = surface(d); sfx(r === "ok" ? "chime" : "paper", true); if (r === "ok");
      if (d.done) { const got = diveReward(F, d, addInv); gainXp(d.good >= 2 ? 2 : 1); if (got) { flash("Abalone from Halmang Kim"); hearts(3); } save(); } }
    else if (a === "juk") { if (F.coins < JUK) return; F.coins -= JUK; const j = jejuState(F); j.juk = (j.juk || 0) + 1; sfx("slurp"); gainXp(1); hearts(2); speak("A bowl of abalone porridge: green, silky, a swirl of sesame oil. The divers at the next table nod at you. You're one of them now. Nearly.", 6000); ; save(); }
    else if (a === "sort") { jjSt = {sort: sortStart()}; sfx("paper", true); setTimeout(() => { if (jejuView === "jj_shed" && jjSt.sort && !jjSt.sort.done) { jjSt.sort.done = true; jjSt.sort.late = true; ctx(); } }, 30500); }
    else if (a === "crate") { const st = jjSt.sort; if (!st) return; const r = sortTap(st, v); sfx(r === "ok" ? "tap" : "paper", true);
      if (st.done) { const n = sortReward(F, st, addInv); gainXp(st.good >= 6 ? 2 : 1); if (n) { flash(`${n} tangerines from Mr Ko`); hearts(2); } ; save(); } }
    else if (a === "cafe") { const c = jjCafe(F, v); if (!c) return; sfx("slurp"); gainXp(1); hearts(2); speak(`${c[0]}. ${c[2]}`, 5500); ; save(); }
    else if (a === "post") { const at = slowPost(F, v); if (!at) return; sfx("paper", true); flash("Into the slow-post box"); speak(v === "family" ? "A postcard to your friends back home, into the orange box. It'll turn up in Honeybrook in two weeks, when everyone's forgotten about it. Perfect." : "A postcard to yourself, into the orange box. In two weeks, a little bit of Jeju will arrive in your mailbox.", 5500); save(); }
    else if (a === "dyego") { jjSt = {dye: {step: 0}}; sfx("paper", true); ; }
    else if (a === "dstep") { const d = jjSt.dye; if (!d) return; if (+v === d.step) { d.step++; d.oops = false; sfx("tap"); } else { d.oops = true; sfx("paper", true); } }
    else if (a === "dyedone") { if (!dyeScarf(F)) return; jjSt = {}; sfx("chime"); gainXp(1); flash("A scarf to dry at home"); speak("Mr Moon rolls the damp scarf in paper. \"Hang it in the sun. Look at it every day.\" It'll be on your washing line when you're home.", 6000); save(); }
    ctx(); });
  c.querySelectorAll("[data-rflam]").forEach(b => b.onclick = () => {
    if (b.dataset.rflam === "start") { flamSt = palmasStart(); clearTimeout(flamT); sfx("tap"); ;
      flamT = setTimeout(() => { flamSt.done = true; const won = ole(flamSt); const r = rondaState(F); if (won) { r.oles = (r.oles || 0) + 1; gainXp(2); hearts(3); sfx("yay"); act("cheer"); go(scene, 430, 540, () => { act("cheer"); mprop("sparkle", hero.x, hero.y - 60, 1600); });
          speak("Paloma takes your hands and spins you round the stage. The whole bar shouts ¡Olé!", 6000); if (isHere("hana")) setTimeout(() => npcSay("hana", "Look at you go! Olé!"), 2000); } else sfx("chime");
        ; save(); ctx(); }, palmasEnd(flamSt) - Date.now() + 300);
      ctx(); return; }
    if (!flamSt || flamSt.done) return; const r = clap(flamSt); if (r === "hit") sfx("tap"); else if (r === "miss") sfx("paper", true); ctx(); });
  c.querySelectorAll("[data-rtea]").forEach(b => b.onclick = () => {
    if (b.dataset.rtea === "start") { teaSt = {t0: Date.now(), glasses: []}; sfx("paper", true); ctx(); return; }
    if (!teaSt || teaSt.glasses.length >= TEA_GLASSES) return; const ok = pour(teaSt); sfx(ok ? "chime" : "tap");
    if (teaSt.glasses.length >= TEA_GLASSES) { const good = teaSt.glasses.filter(Boolean).length, r = rondaState(F); if (r.teaDay !== dayKey()) { r.teaDay = dayKey(); gainXp(good >= 2 ? 2 : 1); }
      if (good >= 2) hearts(2); speak(good >= 2 ? "Sweet, minty, frothy on top. Amina raises her glass: \"To Ronda.\"" : "A bit flat, but still lovely. Amina says the froth comes with practice.", 5000);
      ; save(); }
    ctx(); });
  c.querySelectorAll("[data-rpaint]").forEach(b => b.onclick = () => { const [k, v] = b.dataset.rpaint.split(":");
    if (k === "c" || k === "p") paintSt = {...paintSt, [k]: v, step: 0, oops: false};
    else if (k === "s") { const want = (paintSt.step || 0) + 1; if (+v === want) { paintSt = {...paintSt, step: want, oops: false}; sfx("tap"); } else { paintSt = {...paintSt, oops: true}; sfx("paper", true); } }
    else if (k === "reset") paintSt = {};
    else if (k === "fire") { const evanToo = false, id = paintTile(F, paintSt.c, paintSt.p, false, addInv); if (!id) return; paintSt = {}; sfx("chime"); gainXp(1); flash("Your painted tile");
      speak(`Lucía slides it into the kiln and brings it out an hour later, glazed and shiny. Yours to keep: put it on a shelf at home.${("")}`, 7000);
      ; save(); }
    ctx(); });
  c.querySelectorAll("[data-rtaste]").forEach(b => b.onclick = () => { const r = taste(F, b.dataset.rtaste); if (!r) return; sfx("chime"); act("cheer"); gainXp(r.fresh ? 1 : 0);
    speak(r.line + (r.fresh ? " You've got the recipe now: it's on your stove at home." : ""), 8000); ; save(); ctx(); });
  c.querySelectorAll("[data-rtile]").forEach(b => b.onclick = () => { const r = buyTile(F, b.dataset.rtile); if (!r) return; sfx("chaching"); flash(`Tile: ${r.t.n}`);
    speak(r.all ? "The eighth tile! Lucía claps. \"A bench! Send me a photo.\" Your tiled bench is waiting by the pond at home." : `Lucía wraps the tile in newspaper: ${r.t.n.toLowerCase()}.`, 6000); if (r.all) { gainXp(3); mprop("sparkle", hero.x, hero.y - 60, 1800); } save(); ctx(); });
  c.querySelectorAll("[data-taxiopen]").forEach(b => b.onclick = () => { goalView = null; woodsView = b.dataset.taxiopen; sfx("paper", true); ctx(); });   // the home jetty: the taxi stops there too
  if (fishSpot) c.querySelectorAll("[data-fish]").forEach(b => b.onclick = () => fishGo(b.dataset.fish, b.dataset.k));
  c.querySelectorAll("[data-sup]").forEach(b => b.onclick = () => { goalView = null; ctx(); if (b.dataset.sup === "play") familyPaddle(); else paddleTo(b.dataset.sup); });
  c.querySelectorAll("[data-ride]").forEach(b => b.onclick = () => { F.ride = b.dataset.ride; sfx("paper", true); speak(F.ride === "car" ? "Keys in hand. You'll drive between screens." : F.ride === "scooter" ? "Helmet on. Scooter it is." : "On foot today. Nice and slow.", 3500); save(); ctx(); });
  if (orView || (fieldView && scene === "field" && (stallAt(dayKey(), localHM(), +fieldView.slice(-1)) || {}).kind === "orchard")) wireOrchard(c, F, {save: () => save(true), rerender: () => { ctx(); drawScene(); }, say: l => speak(l, 4500), sfx, today: dayKey(), where: orAt && orAt.where, i: orAt && orAt.i, item: potItem,
    tab: k => { orTab = k; ctx(); }, placed: () => { orView = null; potItem = null; ctx(); drawScene(); }, tea: haveTea});
  if (vyView && (scene === "vineyard" || scene === "wineshop")) wireVine(c, F, {harvest: (festivalOn(dayKey()) || {}).id === "harvest", save: () => save(true), rerender: () => { ctx(); drawScene(); }, say: l => speak(l, 4500), sfx, r: vyAt && vyAt.r, i: vyAt && vyAt.i});
  if (routOpen && scene === "room") wireRoutines(c, {rerender: () => ctx(), undoable, done: routineCoins});
  if (trophyView && scene === "trophy") { wireTrophies(c, F, {save: () => save(true), undoable, rerender: () => { ctx(); drawScene(); }, close: () => { trophyView = null; vyView = null; kView = null; orView = null; fieldView = null; goalView = null; ctx(); drawScene(); }}); }
  showPanel(!!h, (homeView === "shoplist" || homeView === "stored") && scene === "home" ? "fridge" : scene === "market" ? "shop" : boardOpen ? "cork" : "paper");
  c.querySelectorAll("[data-shop]").forEach(b => b.onclick = () => { shopTab = b.dataset.shop; ctx(); });
  c.querySelectorAll("[data-decor]").forEach(b => b.onclick = () => decorClick(b.dataset.decor));
  c.querySelectorAll(".item[data-id]").forEach(b => b.onclick = () => {
    const id = b.dataset.id;
    if (scene === "market") { shopTab === "sell" ? sell(id) : buy(id); }
    else if (scene === "field" && fieldView) { buy(id, stallPrice(id)); ctx(); }   // a market or fair stall
    else if (scene === "field" && friView && (/^bm\d$/.test(friView) || friView === "kites")) { buy(id, friView === "kites" ? ITEMS.kite.price : stallPrice(id)); ctx(); }   // the Friday bay market
    else if (scene === "farm") plant(selPlot, id);
    else if (scene === "post" && fieldView === "stamps") { buy(id); ctx(); }   // the loves round: a rubber stamp from Penny's drawer
  });
  c.querySelectorAll("[data-farm]").forEach(b => b.onclick = () => b.dataset.farm === "water" ? waterPlot(selPlot) : harvest(selPlot));
  c.querySelectorAll("[data-fair]").forEach(b => b.onclick = () => fairActivity(b.dataset.fair));
  c.querySelectorAll("[data-xtreat]").forEach(b => b.onclick = () => xmasTreat(b.dataset.xtreat));
  c.querySelectorAll("[data-xcarol]").forEach(b => b.onclick = () => { const r = singCarol(F, dayKey(), +b.dataset.xcarol); sfx("chime"); hearts(2); if (r.fresh) gainXp(1); speak(`You call "${r.song.n}" and the whole tree joins in: ${r.song.a}`, 5500);
    const near = ["hana", "okada", "farid", "mei", "theo", "pip", "juniper"].filter(id => isHere(id)); near.slice(0, 2).forEach((id, k) => setTimeout(() => npcSay(id, r.song.b), 2400 + k*1600)); ; save(true); ctx(); });
  c.querySelectorAll("[data-xlwalk]").forEach(b => b.onclick = () => { const first = lanternWalk(F, dayKey()); if (first) { addInv("xm_lantern", 1); flash("A paper lantern"); } fieldView = null; ctx(); sfx("chime"); hearts(3); gainXp(2);
    speak("A lantern each, and off you all go round the field: past the stalls, along the lake, the tree glowing at the end. Nobody talks much. Nobody needs to.", 7000); go("field", 104, 380, () => go("field", 302, 202, () => go("field", 184, 640 - 14, () => { ; mprop("heart", hero.x, hero.y - 60, 2200); }))); save(true); });
  c.querySelectorAll("[data-xgrotto]").forEach(b => b.onclick = () => { const r = grottoVisit(F, dayKey()); if (!r) return; addInv(r.gift, 1); if (r.photo) addInv("xm_santaphoto", 1); fieldView = null; ctx(); sfx("chime"); hearts(3); gainXp(2);
    speak(`You sit down next to Santa and whisper a wish: ${r.wish} Santa nods very seriously and writes it in his big book. Then a little parcel: ${r.giftN}!${r.photo ? " And Pip takes a photo for you to keep." : ""}`, 8000);
    save(true); });
  // round 173: your stall, and the hamper table
  c.querySelectorAll("[data-xst]").forEach(b => b.onclick = () => { const [a, id, n] = b.dataset.xst.split(":"), v = vineState(F); let k = 0;
    if (a === "put") k = putOut(F, id, +n || 99); else if (a === "take") k = xmTakeBack(F, id); else if (a === "wine") k = putWine(F, v, id); else if (a === "unwine") k = takeWine(F, v, id);
    if (k) { sfx("paper", true); flash(a === "put" || a === "wine" ? `${k} onto your stall` : `${k} back`); save(true); } ctx(); });
  c.querySelectorAll("[data-xh]").forEach(b => b.onclick = () => { const i = b.dataset.xh.indexOf(":"), a = i < 0 ? b.dataset.xh : b.dataset.xh.slice(0, i), v0 = i < 0 ? "" : b.dataset.xh.slice(i + 1), v = vineState(F);
    if (a === "start") { if (packStart(F, v0, hamperSeason(dayKey()) || "xmas")) sfx("coin"); }
    else if (a === "add") { if (packAdd(F, v0)) sfx("tap"); }
    else if (a === "wine") { if (packWine(F, v, v0)) sfx("tap"); }
    else if (a === "out") { if (packRemove(F, v, +v0)) sfx("tap"); }
    else if (a === "pick") { xmPick = xmPick === v0 ? null : v0; sfx("tap"); }
    else if (a === "send") { const r = sendHamper(F, xmPick, v0, Date.now() + (globalThis.__hbOffset || 0)); if (r) { xmPick = null; sfx("chime"); gainXp(2); hearts(2); speak(`Penny weighs the ${r.hp.name} hamper, sticks on a row of stamps and a "FRAGILE: CHRISTMAS" label. "Off it goes to ${r.r.n}!"`, 5500); } }
    else if (a === "fill") { const [oid, hid] = v0.split("|"), pay = fillOrder(F, oid, hid, dayKey()); if (pay) { sfx("coin"); gainXp(2); flash(`+${pay}: a hamper order`); speak("Penny takes the hamper and the envelope of coins, and crosses the order off. \"They'll be thrilled.\"", 5000); } }
    else if (a === "tie") { const hp = packTie(F); if (hp) { sfx("chime"); hearts(2); gainXp(2); flash(`${hp.name} hamper`); speak(`Penny ties a fat red bow on top and writes the tag: "${hp.name}". It's in your backpack.`, 5500); } }
    save(true); ctx(); });
  c.querySelectorAll("[data-close]").forEach(b => b.onclick = () => { gsPk = null; ppView = null; ccSt.pk = null; bvView = null; ccView = null; hfView = null; railOpen = false; fishSpot = null; woodsView = null; rondaView = null; kyotoView = null; ktSt = {}; jejuView = null; jjSt = {}; swView = null; swSt = {}; loftView = false; cinqueView = null; ctSt = {}; ghBed = null; millOpen = false; friView = null; vanView = null; bbRoom = null; bbSt = {}; lunchView = null; occView = null; trvSt = null; pntSt = null; ccSt.made = null; keepItem = null; keepSpot = null; adoptItem = null; adoptSt = {}; petView = null; scView = null; scSt.pick = null; boardOpen = false; guestView = false; habView = false; tailView = false; shedOpen = false; runOpen = false; wardOpen = false; bedOpen = false; journalOpen = false; calmOpen = false; recOpen = false; routOpen = false; trophyView = null; vyView = null; kView = null; orView = null; fieldView = null; goalView = null; ctx(); });
  c.querySelectorAll("[data-bed]").forEach(b => b.onclick = () => bedAction(b.dataset.bed));
  c.querySelectorAll("[data-track]").forEach(b => b.onclick = () => { setTrack(b.dataset.track); speak(`${TRACKS[b.dataset.track].name} is on. Mmm.`, 2500); ctx(); drawScene(); });
  c.querySelectorAll('[data-rec="stop"]').forEach(b => b.onclick = () => { setMusic(false); speak("Needle up. Quiet time.", 2500); ctx(); drawScene(); });
  const rv = c.querySelector("#recVol"); if (rv) rv.oninput = () => setMusicVol(+rv.value);
  c.querySelectorAll("[data-calm]").forEach(b => b.onclick = () => { const k = b.dataset.calm;
    if (k === "stop") stopBreath(false); else startBreath(+k); });
  if (breath) tickBreath();
  if (journalOpen && scene === "room") wireJournal(c, undoable, e => { if (e) { sfx("chime"); speak("Page kept. Lovely.", 3500); } ctx(); });
  c.querySelectorAll("[data-acc]").forEach(b => b.onclick = () => { const k = b.dataset.acc, on = !wearing(F, k), n = (ACCESSORIES.find(a => a[0] === k) || [])[2] || "it";
    if (on) F.decor[k] = "on"; else delete F.decor[k]; sfx("paper", true); save(); render(); drawScene();
    speak(on ? `${n} on.${k === "me_hat" ? " It'll go on when you head outside." : k === "me_pj" ? " Cosy." : ""}` : `${n} off. It's back in the wardrobe.`, 3000); });
  c.querySelectorAll("[data-feed]").forEach(b => b.onclick = () => feedAnimals(b.dataset.feed));
  c.querySelectorAll("[data-runup]").forEach(b => b.onclick = () => buyRunUpgrade());
  c.querySelectorAll("[data-treat]").forEach(b => b.onclick = () => { const line = scatterTreat(F, addInv); if (!line) return; sfx("chime"); gainXp(1); speak(line, 4500); if (scene === "base") mprop("heart", 110, 520, 1700); save(true); ctx(); });
  c.querySelectorAll("[data-tool]").forEach(b => b.onclick = () => buyTool(b.dataset.tool));

}
function bag(){
  const ids = Object.keys(F.inv).filter(id => ITEMS[id] && F.inv[id] > 0);
  const order = ["gift","food","ingredient","feed","flower","use","tool","seed"];
  ids.sort((a, b) => order.indexOf(ITEMS[a].kind) - order.indexOf(ITEMS[b].kind));
  $("bag").innerHTML = ids.map(id => { const it = ITEMS[id];
    const lbl = it.kind === "bouquet" ? "give or send to someone" : it.kind === "pot" ? "place it" : it.kind === "keepsake" ? "put on a shelf" : it.kind === "pet" ? "find it a home" : it.kind === "seed" ? "plant in garden" : it.kind === "gift" ? "give to someone" : it.kind === "tool" ? "use" : it.kind === "feed" ? "for the run" : it.kind === "food" ? "feed your pet" : it.kind === "ingredient" ? "send to the kitchen" : it.kind === "flower" ? "give" : "use";
    // kitchen ingredients can go to the wine shop's larder instead (food can still be fed to the pet)
    const kit = isGood(id) && it.kind !== "ingredient" ? `<span class="tokit" role="button" tabindex="0" data-kit="${id}">to the kitchen</span>` : "";
    return itemBtn(id, lbl, it.kind === "seed", (it.kind === "tool" ? "" : `<span class="cnt">×${F.inv[id]}</span>`) + kit); }).join("");
  if (giftPick && F.inv[giftPick]) $("bag").insertAdjacentHTML("afterbegin", giftPickHTML(giftPick)); else giftPick = null;
  { const nv = nearestVillager(); if (!nv || (giveMode && giveMode !== nv.def.id)) giveMode = null;
    if (nv && !giftPick) { const w = nv.def.id, done = QB.giftedToday(F, w);
      $("bag").insertAdjacentHTML("afterbegin", `<div class="giftpick" style="grid-column:1/-1">${giveMode ? `<p><b>Giving to ${esc(nv.def.name)}:</b> tap a present, a bunch of flowers or something you've grown or made.</p><div class="actions"><button class="btn small alt" data-givemode="off">Never mind</button></div>` : done ? `<p class="muted">You've given ${esc(nv.def.name)} something today. Tomorrow!</p>` : `<div class="actions"><button class="btn small primary" data-givemode="${esc(w)}">Give ${esc(nv.def.name)} something</button></div>`}</div>`); } }
  $("bag").querySelectorAll("[data-givemode]").forEach(b => b.onclick = ev => { ev.stopPropagation(); giveMode = b.dataset.givemode === "off" ? null : b.dataset.givemode; sfx("tap"); bag(); });
  if (hasUp(scoopState(F), "bike")) { $("bag").insertAdjacentHTML("beforeend", `<button class="btn small alt" data-deliver="1" style="grid-column:1/-1">Send something by delivery bike</button>`);
    $("bag").querySelector("[data-deliver]").onclick = () => { openView = null; scView = "deliver"; scSt.vpick = null; scSt.vother = null; scoopNow(); ctx(); }; }
  $("bag").querySelectorAll("[data-giveto]").forEach(b => b.onclick = ev => { ev.stopPropagation(); giveTo(giftPick, b.dataset.giveto); });
  $("bag").querySelectorAll("[data-bypost]").forEach(b => b.onclick = ev => { ev.stopPropagation(); postPick = !postPick; bag(); });
  $("bag").querySelectorAll("[data-postto]").forEach(b => b.onclick = ev => { ev.stopPropagation(); const to = b.dataset.postto, r = BK.postTo(F, to, {item: giftPick}); if (r.err) { flash(r.err); return; }
    postPick = false; giftPick = null; sfx("chime"); flash(`Posted to ${BK.person(to).name}`); speak(`Wrapped in brown paper and off to ${BK.REGIONS[BK.regionOf(to)]}. Watch your mailbox for a thank-you.`, 4500); save(); bag(); });
  $("bag").querySelectorAll("[data-keepit]").forEach(b => b.onclick = ev => { ev.stopPropagation(); keepItem = giftPick; giftPick = null; openView = null; render(); });   // a souvenir kept: off to the shelf chooser
  $("bag").querySelectorAll(".item").forEach(b => b.onclick = ev => { const k = ev.target.closest("[data-kit]"); if (k) { ev.stopPropagation(); toKitchen(k.dataset.kit); return; } useItem(b.dataset.id); });
  $("bagHint").textContent = !ids.length ? "Your backpack's empty. Visit the market, or harvest something." : F.gift ? "A welcome gift of seeds is in here. Plant them in the garden." : "";
  $("play").innerHTML = [["pet","Pet"],["hide","Hide-and-seek"],["nap","Nap together"]].map(([k, n]) => `<button class="btn alt small" data-play="${k}">${n}</button>`).join("");
  $("play").querySelectorAll("[data-play]").forEach(b => b.onclick = () => playFree(b.dataset.play));
}
function trackers(){
  $("waterBoxes").innerHTML = progressBarV((S.waterMl || 0)/waterGoal(), "#9CC3E0", 8);
  $("stepBoxes").innerHTML = progressBarV(S.steps/stepGoal(), "var(--sage)", 5);
  $("waterNote").textContent = S.waterMl ? `${+(S.waterMl/1000).toFixed(2)}L` : "0L";
  $("stepNote").textContent = S.steps >= 1000 ? `${+(S.steps/1000).toFixed(1)}k` : String(S.steps || 0);
}
// Water is kept in ml (goal 2 litres). `water` stays as a glass count (250 ml) because chat reads it.
// Every glass up to a litre earns a coin; every 1,000 steps earns 2.
const GLASS = 250;
// your own goals and bedtime, chosen in Settings (F.prefs); bed can run past midnight (24*60 + 30 is half past twelve)
const PREF = {water: 2000, steps: 5000, bed: 23*60 + 45, wake: 6*60};
const pref = k => (F.prefs && F.prefs[k] != null ? F.prefs[k] : PREF[k]);
const waterGoal = () => pref("water"), stepGoal = () => pref("steps");
function setWater(ml){
  ml = clamp(Math.round(ml), 0, 6000); S.waterMl = ml;
  const glasses = Math.floor(ml/GLASS), paid = Math.min(4, S.waterPaid || 0), owed = Math.min(4, glasses);
  if (owed > paid) { earn(owed - paid, "water"); S.waterPaid = owed; }
  S.water = glasses; save();
}
function setSteps(v){
  v = Math.max(0, Math.round(v) || 0); S.steps = v; const ms = Math.floor(v/1000);
  if (ms > S.stepMs) { earn(2*(ms - S.stepMs), "steps"); S.stepMs = ms; }
  speak(v >= stepGoal() ? `${v.toLocaleString()}! ${stepGoal().toLocaleString()} smashed!` : `${v.toLocaleString()}. ${(stepGoal() - v).toLocaleString()} to go!`, 5000);
  act(v >= stepGoal() ? "cheer" : "nudge"); save();
}
function questMark(){ $("qmarkWrap").style.display = "none"; }   // the old one-quest-at-a-time marker; the quest board needs no arrow
function drawScene(){
  const ssn = seasonOf(dayKey()); ["spring", "summer", "autumn", "winter"].forEach(k => document.body.classList.toggle("season-" + k, k === ssn));
  const day = dayKey(), wet = outside() && !townOf(scene) && rainyOn(day), fest = festivalOn(day);
  $("rain").hidden = !wet; $("rain").classList.toggle("light", rainLevel(day) === 1);
  if (scene === "vineyard" && fest && fest.id === "harvest" && S.harvestSaid !== day) { S.harvestSaid = day; setTimeout(() => speak("It's the grape harvest! Bunting's up, and every vine gives an extra bunch this week.", 6000), 1500); }
  else if (scene === "village" && fest && !fest.vineyard && S.festSaid !== day) { S.festSaid = day; setTimeout(() => speak(`${fest.name} decorations are up in the town square!`, 5000), 1500); }
  else if (scene === "base" && isWeekend() && S.weekendSaid !== day) { S.weekendSaid = day; setTimeout(() => speak("Weekend! A slow morning, then the garden?", 4500), 2200); }
  else if (wet && S.rainSaid !== day) { S.rainSaid = day; const light = rainLevel(day) === 1; setTimeout(() => speak(light ? "A light shower today. Brollies up!" : "Rainy day! Perfect for something cosy indoors.", 4500), 1500); }
  $("fore").innerHTML = outside() ? "" : foreArt(scene);
  tableKey = "";
  $("sceneArt").innerHTML = scene === "terrace" ? terraceArt(F) : scene === "village" ? villageArt() : scene === "base" ? baseArt() : scene === "lane" ? laneArt() : scene === "vineyard" ? vineyardArt() : scene === "orchard" ? orchardArt() : scene === "flowers" ? flowerFarmArt() : scene === "field" ? fieldArt() : scene === "shore" ? shoreArt() : scene === "bay" ? bayArt() : scene === "hfarm" ? hfarmArt() : scene === "hlane" ? hlaneArt() : scene === "hwoods" ? hwoodsArt() : townRoom(scene) ? (townOf(scene) === "saltwick" ? saltwickRoomArt(scene) : townOf(scene) === "kyoto" ? kyotoRoomArt(scene) : townOf(scene) === "jeju" ? jejuRoomArt(scene) : townOf(scene) === "cinque" ? cinqueRoomArt(scene) : TOWNS[townOf(scene)].region === "lavender" ? lavenderRoomArt(scene): TOWNS[townOf(scene)].region === "tablelands" ? tablelandsRoomArt(scene): TOWNS[townOf(scene)].region === "coast" ? coastRoomArt(scene) : TOWNS[townOf(scene)].by === "van" ? bellbirdRoomArt(scene) : rondaRoomArt(scene)) : townOf(scene) === "saltwick" ? saltwickArt(scene) : townOf(scene) === "kyoto" ? kyotoArt(scene) : townOf(scene) === "jeju" ? jejuArt(scene) : townOf(scene) && TOWNS[townOf(scene)].region === "lavender" ? lavenderArt(scene): townOf(scene) && TOWNS[townOf(scene)].region === "tablelands" ? tablelandsArt(scene): townOf(scene) && TOWNS[townOf(scene)].region === "coast" ? coastArt(scene) : townOf(scene) && TOWNS[townOf(scene)].by === "van" ? bellbirdArt(scene) : townOf(scene) === "cinque" ? cinqueArt(scene) : townOf(scene) ? rondaArt(scene) : scene === "farm" ? farmArt() : scene === "greenhouse" ? greenhouseArt(ghState(F).beds, ghGrowth, ghState(F).pots) : scene === "millup" ? millUpArt(millUpInfo()) : scene === "mill" ? millArt(!!millState(F).press && pressLeft(millState(F)) > 0, !!millState(F).press && !pressLeft(millState(F)), {shop: owns(F, "millshop"), cure: craftState(F).cure.length, steep: craftState(F).steep.length, store: storeCount(craftState(F))}) : roomArt(scene);
  $("sceneArt").insertAdjacentHTML("beforeend", keepsakesIn(F, scene) + petsIn(F, scene) + fishSpotArt(scene, scene !== "bay" || spotOpen("bay")) + transportArt(scene) + fridayLayer(scene) + (scene === "base" ? koiArt((F.fish && F.fish.koi) || 0) + (F.ronda && F.ronda.bench ? tileBench(236, 548) : "") + (F.kyoto && F.kyoto.lantern ? homeLantern(492, 588) : "") + (F.jeju && F.jeju.dye ? dyeCloth(dyeDays(F)) : "") : "") + (scene === "shore" && F.towns && F.towns.cinque ? homeBoat(204, 380, ...boatCols(F)) : "") + (scene === "cellar" && owns(F, "cellar") && discoNow(dayKey(), localHM()) ? discoArt() : "") + vanCrateArt() + (scene === "hwoods" ? wishTower(112, 462, (F.wish || {}).n || 3) : ""));   // shelves with keepsakes, and pets at home here
  if ((outside() || scene === "terrace") && scene !== "base" && scene !== "field") $("sceneArt").insertAdjacentHTML("beforeend", skyWash(localHM()));   // (round 153: the terrace too)   // the same evening light everywhere outdoors
  if ((outside() || scene === "terrace") && isDusk()) nightLights();
  const names = {village:"Town square", base:"Home base", lane:"Makers' Lane", vineyard:vineyardName(F), farm:"The garden", wineshop:shopName(F), terrace:"The terrace", millup:"The old mill: upstairs", orchard:"The orchard", flowers:"The flower farm", field:"The field", shore:"The foreshore", bay:"The bay", hfarm:"Wildflower Farm", hlane:"Honeybrook station", hwoods:"Honeybrook Woods", greenhouse:"The greenhouse", mill:"The old mill", scoopshop: scoopState(F).name, ct_vernazza:"Cinque Terre: Vernazza", ct_corniglia:"Cinque Terre: Corniglia", ct_monterosso:"Cinque Terre: Monterosso", ct_manarola:"Cinque Terre: Manarola", ...Object.fromEntries(Object.entries(BB_NAMES).map(([k, v]) => [k, "Bellbird Valley: " + v])), sw_harbour:"Saltwick: the harbour", sw_wynds:"Saltwick: the wynds", sw_beach:"Saltwick: the beach", sw_clifftop:"Saltwick: the clifftop", jj_shore:"Jeju: Seongsan", jj_farms:"Jeju: the tangerine farms", jj_harbour:"Jeju: the harbour", jj_village:"Jeju: the stone village", kt_station:"Kyoto: the station", kt_lane:"Kyoto: Higashiyama", kt_temple:"Kyoto: the temple", kt_river:"Kyoto: the river", rd_station:"Ronda: the station", rd_plaza:"Ronda: the plaza", rd_bridge:"Ronda: Puente Nuevo", rd_old:"Ronda: the old town"};
  $("sceneName").innerHTML = `<span>${esc(names[scene] || (townRoom(scene) ? `${TOWNS[townOf(scene)].n}: ${townRoom(scene).n.replace(/^The /, "the ")}` : ROOMS[scene].name))}</span>${!outside() ? `<span style="font-family:Mulish,sans-serif;font-size:.85rem">tap Exit to leave</span>` : ""}`;
  $("maphint").textContent = townRoom(scene) ? `${townRoom(scene).say} Exit at the bottom, back out the way you came.` : townOf(scene) && TOWNS[townOf(scene)].hints ? TOWNS[townOf(scene)].hints[scene] : townOf(scene) ? {rd_station: "Ronda's station (trains home till 10pm) and the Alameda balcony over the valley. East: the plaza. South: steps down into the gorge.", rd_plaza: "The plaza: the market, the tapas bar, Doña Carmen's sweets. West: the station. South: over Puente Nuevo.", rd_bridge: "Puente Nuevo over the gorge, the viewpoint and the Moorish garden. North: back over the bridge. West: the old town.", rd_old: "La Ciudad: the convent hatch, the tile shop, the Arab baths. North: the gorge steps up to the station. East: the bridge."}[scene] : scene === "shore" ? "Watch for dolphins from the bench, or take the paddleboards out. Gates: the field (east), the flower farm (south)." : scene === "field" ? "Feed the swans, picnic, kick a ball about, or join Hana's class at 8. Paths: town (east), orchard (south), foreshore (west)." : scene === "orchard" ? "Buy saplings at the farm shop (or tap a tree spot). Right gate: home. Left: flowers." : scene === "flowers" ? "Tap a bed or bush to plant, or buy at the farm shop. Right arch: the orchard." : scene === "cottage" ? "Farid and Mei's cottage. Tap the table for tea and cake." : scene === "kitchen" ? "Bake bread, press cheese, cook small plates and today's tapas. The mat at the bottom goes back to the shop." : scene === "vineyard" ? "Tap a vine to plant, water or pick. Left gate: home. Top path: Makers' Lane." : scene === "wineshop" ? "Stock the shelves, stand behind the counter to serve, and check the honesty box." : scene === "village" ? "Tap a building to go inside. The bridge at the bottom goes home." : scene === "base" ? "Tap to walk. The bridge at the top goes to town, the gate on the right to the vineyard." : scene === "lane" ? "Bo's workshop, and Auntie Lin's, Juniper's and Mr Okada's homes. Left gate: town square. Bottom path: vineyard." : scene === "farm" ? "Tap a plot to plant, water or harvest." : scene === "market" ? "Tap the counter to open the shop." : scene === "room" ? "Just you. Nap in bed, decompress in the calm corner, write at the desk." : "Tap furniture to walk to it. The board on the wall lists this building's quests.";
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
  const ev = scene === "field" ? eventNow(dayKey(), localHM()) : null, dine = DINING[scene], key = ev ? dayKey() + ev.kind : dine ? "dine:" + scene : "";
  if (key !== frontKey) { fronts.forEach(([n]) => n.remove()); fronts = []; frontKey = key;
    // a house's dining table: drawn among the people too, so the family along the back sit behind it
    if (dine) { const g = document.createElementNS("http://www.w3.org/2000/svg", "g"); g.setAttribute("class", "sfront"); g.setAttribute("pointer-events", "none"); g.innerHTML = diningTable(dine.cx, dine.fy, scene); fronts = [[g, {y: dine.fy - 1}]]; }
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
// The top and bottom recolour the player's own; a dress, layer, shoes, bag, earrings, sunglasses (outdoors only) and hair worn
// down are drawn over her. Pyjamas in her room win.
function applyWear(pj){
  // your look (look.js), with anything tailor-made you're wearing; in Kyoto, in a yukata from the yukata shop, a long
  // dress in its colour goes over the top
  const m = $("hero"); if (!m) return; const look = lookOf(F), yk = !pj && townOf(scene) === "kyoto" && yukataOn(F);
  applyLook(m, look, yk ? {top: {kind: "dress", length: "long", sleeves: "long", neck: "v", col: colourOf(`${YUKATA.cols[yk][1]} maxi`, "#2E3A70")}} : TL.wornSpec(F));
  m.querySelectorAll(".oshoe").forEach(e => { e.style.display = yk ? "" : "none"; if (yk) e.style.fill = colourOf("tan", "#C9A27E"); });
  $("oBag").style.display = "none"; $("oEar").style.display = "none"; $("oShades").style.display = "none";
}
// The river taxi (transport.js): pay, a few seconds on the launch (an overlay), then step off at the other stop
function rideTaxi(to){
  const s = takeTaxi(F, to); if (!s) return;
  woodsView = null; rondaView = null; ghBed = null; millOpen = false; friView = null; ctx(); sfx("chaching"); save(true);
  const o = document.createElement("div"); o.className = "taxiride"; o.innerHTML = `${taxiBank}<div class="taxiboat">${taxiBoat}</div><p>Down the river to ${esc(s.n.replace(/^The /, "the "))}...</p>`; $("map").appendChild(o);
  setTimeout(() => { o.remove(); setScene(s.scene, s.at); setTimeout(() => speak(`The river taxi drops you at ${s.n}.`, 3500), 700); }, 2600);
}
// Friday evenings (round 112): the fish van at the bay, and a kite on the field
function fridayLayer(sc){
  if (sc === "bay") return vanNow(dayKey(), localHM()) ? fishVanArt(330, 600) : "";
  if (sc === "field") return (movieNow(dayKey(), localHM()) ? movieArt(SCREEN[0], SCREEN[1], filmOf(dayKey())) : "")
    + (bayMarketNow(dayKey(), localHM()) ? BAY_STALLS.map(([x, y], k) => bayStallArt(k, x, y, `${bayKeeperName(dayKey(), k)}'s stall`)).join("") + kiteSellerArt(KITE_SELLER[0] - 22, KITE_SELLER[1] + 4) : "") + `<g data-place="kitefly" aria-label="Kite flying"><ellipse class="hov" cx="440" cy="334" rx="30" ry="9" style="fill:var(--butter)"/><g filter="url(#wob)" style="stroke:var(--line)" stroke-width="1.1"><path d="M452 336 v-46" stroke-width="2"/><path d="M452 292 l18 4 l-2 8 l-16 2z" style="fill:#E8913A"/><path d="M458 293 v12 M464 294 v10" style="stroke:#FFFDF6" stroke-width="2"/></g>${tapeLabel(440, 352, "Kite flying", "#DCEBF6", 9)}</g>`
    + (S.kite && S.kite.until > Date.now() ? kiteArt(S.kite.x, S.kite.y) : "");
  return "";
}
// a stall at the Friday bay market (or Hiro's kites on the beach)
function bayMarketPanel(v){
  const kites = v === "kites", k = kites ? -1 : +v.slice(2), items = kites ? ["kite"] : bayStallGoods(dayKey(), k), who = kites ? "Hiro" : bayKeeperName(dayKey(), k);
  return `<span class="tape gingham" aria-hidden="true"></span><h2>${kites ? "Hiro's kites" : `${esc(who)}'s stall`}</h2><p class="sub">${kites ? "\"Red, blue or yellow? They all fly. The breeze off the sea does the rest.\" Fly yours over by the river, at the kite flying spot." : "The Friday market on the field: a different mix every week."}</p>
    <div class="items shop">${items.map(id => itemBtn(id, `<b>${kites ? ITEMS.kite.price : stallPrice(id)}</b> ${icon("coin", 13)}`, F.coins < (kites ? ITEMS.kite.price : stallPrice(id)), F.inv[id] ? `<span class="cnt">×${F.inv[id]}</span>` : "")).join("")}</div>
    <div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
}
function flyKite(){
  if (!(F.inv.kite > 0)) { speak("A good breeze for a kite! Hana sells them (the Gifts shelf at the market).", 4500); render(); return; }
  S.kite = {until: Date.now() + 60e3, x: hero.x, y: hero.y}; hero.dir = -1; sfx("whistle"); drawScene(); gainXp(1);
  speak(pick(["Up it goes! The red kite catches the wind.", "Run, run... and up! It's flying.", "The kite tugs on the string like it wants to go to sea."]), 4500);
  save(); render();
}
// Day trips (trips.js, round 107): tickets at Honeybrook station, the train, a day in the town, the train home.
const liveNow = () => { if (scene === "cellar" && owns(F, "cellar") && discoNow(dayKey(), localHM())) return "disco"; if (scene === "terrace") return vineState(F).terrace && dancingNow(dayKey(), localHM()) ? "disco" : "terrace"; const room = townRoom(scene); if (room) return room.music; const town = townOf(scene); if (town) return TOWNS[town].music; const ev = scene === "field" ? eventNow(dayKey(), localHM()) : null; return ev && ev.kind === "night" ? "jazz" : null; };
function trainRide(text, town, then){
  const o = document.createElement("div"); o.className = "taxiride trainride"; o.innerHTML = trainRideArt(town) + `<p>${esc(text)}</p>`; $("map").appendChild(o); sfx("choo");
  setTimeout(() => { o.remove(); then(); }, 2600);
}
const partyList = t => t.party.map(tripName).join(", ").replace(/, ([^,]*)$/, " and $1");
// the ferry crossing (round 127: Jeju): longer than the train, and the sea has dolphins in it
function ferryRide(text, home, then, town){
  const o = document.createElement("div"); o.className = "taxiride trainride ferryride"; o.innerHTML = (town === "saltwick" ? swFerryRideArt(home) : ferryRideArt(home)) + `<p>${esc(text)}</p>`; $("map").appendChild(o); sfx("honk");
  setTimeout(() => { o.remove(); then(); }, 6000);   // (a slow crossing: 6s, the CSS .ferryride matches)
}
function startTrip(town, by = "train"){
  const r = buyTrip(F, town, tripPick, localHM(), by); if (!r) return;
  const t = tripOn(F), own = by === "boat", boat = by === "ferry" || own, land = boat ? r.town.ferry.arrive : r.town.arrive; railOpen = false; tripPick = []; ctx(); sfx("chaching"); flash(own ? "Fuel for the boat" : `Tickets to ${r.town.n}`); save(true);
  (boat ? ferryRide : trainRide)(own ? `Casting off for ${r.town.n}!` : boat ? `All aboard the ferry for ${r.town.n}!` : `All aboard for ${r.town.n}!`, boat ? false : town, () => { if (town === "ronda") rondaVisit(F); setScene(land[0], land[1]);
    if (town === "jeju" && localHM() < 8*60) setTimeout(() => speak("And look: the sun's just coming up out of the sea behind Seongsan, turning the crater gold. Worth the early start.", 6000), 8000);   // round 129: the early boat
    setTimeout(() => speak(`${(boat && r.town.ferry.arriveLine) || r.town.arriveLine || `${r.town.n}! Whitewashed walls, orange trees and a sky so blue it hums.`}${t.party.length ? ` ${partyList(t)} pile${t.party.length > 1 ? "" : "s"} off the ${boat ? "ferry" : "train"} behind you.` : ""} The last ${boat ? "ferry" : "train"} home is at 10pm.`, 6500), 900);
    ; }, town);
}
// Bellbird Valley (round 141): set off in the van, drive between stops, drive home
function vanRide(text, then, ms = 3200){
  const o = document.createElement("div"); o.className = "taxiride trainride vanride"; o.innerHTML = vanRideArt() + `<p>${esc(text)}</p>`; $("map").appendChild(o); sfx("honk");
  setTimeout(() => { o.remove(); then(); }, ms);
}
function vanGo(stop){
  const on = tripOn(F), r = on ? bbDriveOn(F, stop) : bbSetOff(F, stop, tripPick, localHM(), owns(F, "van")); if (!r) return;
  const t = tripOn(F), T = TOWNS[stop]; bvView = null; tripPick = []; ctx(); sfx("chaching"); flash("Fuel for the drive"); save(true);
  vanRide(on ? `On down the road to ${T.n}...` : `Off to Bellbird Valley!${t.party.length ? ` ${partyList(t)} pile${t.party.length > 1 ? "" : "s"} in.` : ""}`, () => { setScene(T.arrive[0], T.arrive[1]);
    setTimeout(() => speak(`${T.arriveLine}${!on && t.party.length ? ` ${partyList(t)} climb${t.party.length > 1 ? "" : "s"} out behind you.` : ""} ${!on || (r && r.first) ? "A new stamp in the passport!" : ""}`.trim(), 7000), 700);
    ; });
}
function vanCrateArt(){
  const t = tripOn(F), T = t && TOWNS[t.town]; if (!T || T.by !== "van" || !crateCount(vanCrate(F))) return ""; const st = TOWN_PLACES[T.station]; if (!st || st.scene !== scene) return "";
  const [x, y] = st.door, cx = x + 68, cy = y - 4;
  return `<g pointer-events="none" aria-hidden="true"><rect x="${cx - 16}" y="${cy - 16}" width="32" height="16" rx="2" fill="#C9A27E" stroke="#2F2B28" stroke-width="1"/><path d="M${cx - 16} ${cy - 8} h32" stroke="#8A6A52"/>${[-10, -3, 4, 11].map((dx, i) => `<rect x="${cx + dx - 2.5}" y="${cy - 26 + (i % 2)*4}" width="5" height="${12 - (i % 2)*4}" rx="1.4" fill="${["#7A1F3D", "#B9B04A", "#C9B3E3", "#F3E7B0"][i]}" stroke="#2F2B28" stroke-width=".5"/>`).join("")}
    <path d="M${cx + 22} ${cy} l4 -22 l4 22" fill="none" stroke="#8A6A52" stroke-width="1.6"/><rect x="${cx + 18}" y="${cy - 30}" width="16" height="12" rx="1" fill="#3A4A44"/><text x="${cx + 26}" y="${cy - 22}" text-anchor="middle" font-family="Klee One,serif" font-size="4.6" fill="#FFFDF6">For sale</text></g>`;
}
function vanHome(late){
  const t = tripOn(F); if (!t) return; const cost = Math.min(F.coins, bbHomeFuel(F)); F.coins -= cost; endTrip(F); bvView = null; ctx(); save(true);
  vanRide(late ? "The long drive home in the dark, everyone sleepy..." : "Home along the valley road to Honeybrook...", () => { setScene("hlane", VILLAGE.van.door);
    const sleepy = false;
    setTimeout(() => speak(`Back home in the lane. Bellbird Valley was ${pick(["glorious", "a proper adventure", "just lovely"])}.${t.party.length ? ` ${partyList(t)} head${t.party.length > 1 ? "" : "s"} off home.` : ""}`, 5000), 800); });
}
function tripHome(late, by){
  const t = tripOn(F), town = t ? TOWNS[t.town] : TOWNS[townOf(scene) || "ronda"]; endTrip(F); railOpen = false; kyotoView = null; ctx();
  // home the way you choose (Jeju: the train or the ferry); at the last call, the way you came
  const boat = (by || (t && t.by)) === "ferry" && !!town.ferry;
  // Farid folded paper cranes all day in Kyoto: a string of them comes home (once)
  // Farid brings a tangerine sapling home from Jeju: the orchard can grow tangerine trees now (once)
  if (t && t.town === "jeju" && t.party.includes("farid") && !jejuState(F).sapling) { jejuState(F).sapling = true; setTimeout(() => { flash("Farid's tangerine sapling"); speak("Farid's carried a tangerine sapling all the way home on his lap. \"For the orchard. Mr Ko says: lots of sun, lots of wind.\" Tangerine trees are in the orchard's planting list now.", 7000); }, 3400); }
  if (t && t.town === "kyoto" && t.party.includes("farid") && !kyotoState(F).cranes) { kyotoState(F).cranes = true; addInv("k_cranes", 1); setTimeout(() => flash("Farid's paper cranes"), 3400); }
  save(true);
  (boat ? ferryRide : trainRide)(late ? `The last ${boat ? "ferry" : "train"} home, everyone sleepy...` : boat ? "Home across the sea to Honeybrook..." : "Home to Honeybrook...", boat ? true : null, () => { setScene(boat ? "shore" : "hlane", boat ? VILLAGE.ferry.door : VILLAGE.timetable.door);
    setTimeout(() => speak(`Back in Honeybrook. ${town.n} was ${pick(["unforgettable", "a proper adventure", "glorious"])}.${t && t.party.length ? ` ${partyList(t)} head${t.party.length > 1 ? "" : "s"} off home.` : ""}`, 5000), 800); }, t ? t.town : townOf(scene));
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
let cinqueView = null, ctSt = {};
let swView = null, swSt = {}, swCrabT = 0;   // round 215: Saltwick Harbour's panels and activities (saltwick.js)
let lunchView = null, occView = null, trvSt = null, pntSt = null, mullSt = {};   // round 152: occView "trivia" or "paint" on the terrace (occasions.js)
   // round 146: the bookings book ("book") and the long table ("table") on the terrace
let bbRoom = null, bbSt = {}, ppView = null, ppCame = 0, wrSt = {};   // wrSt: the gift being wrapped (round 185)   // round 183: the paperie's station panels (paperie.js)
   // round 142: Bellbird Valley's room panels (bbrooms.js) and, round 143, its activities (bbacts.js)
let bvView = null, bvRegion = null;   // round 148: which page of the road map (vines, coast)   // round 141: Bellbird Valley's road map ("map") and passport ("passport")   // round 132: Cinque Terre's room panels and activities (cinque.js)
function stampHere(place){ const s = ktStamp(F, place); if (!s) return; sfx("chime"); flash(`Stamp: ${s.n}`); gainXp(1);
  if (s.full) setTimeout(() => speak("The stamp book's full! Eight ink stamps from round Kyoto. Back home, there's a little stone lantern by the pond now.", 6500), 1200); save(); }
const homeLantern = (x, y) => `<g pointer-events="none" class="homelantern"><g style="stroke:var(--line)" stroke-width="1.3" stroke-linejoin="round"><rect x="${x-4}" y="${y-22}" width="8" height="22" fill="#B9B0A4"/><path d="M${x-12} ${y-22} h24 l-4 -6 h-16z" fill="#CFC6B8"/><rect x="${x-8}" y="${y-38}" width="16" height="10" fill="#E6DED0"/><rect x="${x-4}" y="${y-36}" width="8" height="6" fill="#F6D98A"/><path d="M${x-14} ${y-38} q14 -12 28 0z" fill="#B9B0A4"/><circle cx="${x}" cy="${y-48}" r="2.5" fill="#B9B0A4"/></g><circle cx="${x}" cy="${y-33}" r="14" fill="#F6D98A" opacity=".18"/></g>`;
// the terrace (round 146): the bookings book on its lectern, the long table, the view over the lavender
function terraceSpot(id){
  // round 152: the occasions' spots
  if (id === "screen") { occView = "trivia"; trvSt = null; sfx("paper", true); render(); return; }
  if (id === "easel") { occView = "paint"; pntSt = null; sfx("paper", true); render(); return; }
  if (id === "arch") { const w = weddingOn(dayKey()), hm = localHM(); if (!w) return;
    speak(hm < WED.ceremony[0] ? `The arch is ready: roses, lavender and olive leaves. ${w.couple} are getting married here at two.` : hm < WED.ceremony[1] ? `${w.couple} say their vows under the arch. Someone's grandmother is crying already. So is {pet}, a bit.` : hm < WED.first[0] ? `The wedding breakfast. ${w.couple}, ${w.from}, and the whole terrace raising a glass.` : hm < WED.dancing[0] ? `Their first dance, under the festoon lights. Everyone's gone quiet.` : `Everyone's up dancing. The arch is losing petals, and nobody minds.`, 5500); render(); return; }
  if (id === "book") { lunchView = "book"; sfx("paper", true); render(); return; }
  if (id === "table") { if (lunchNow(dayKey(), localHM())) { lunchView = "table"; sfx("paper", true); render(); return; }
    speak(new Date(dayKey() + "T00:00:00Z").getUTCDay() === 0 && localHM() < LUNCH.from ? "Pilar's laying the long table: white linen, jugs of lavender, the good glasses. Lunch is at twelve." : pick(["The long table, under the canvas. On Sundays it seats twelve, and nobody leaves before three.", "Linen folded, a jug of lavender in the middle. It's waiting for Sunday.", "You straighten a chair. The canvas lifts and settles overhead, like the terrace is breathing."]), 5500); render(); return; }
  if (id === "view") { hero.sitting = true; nodes.hero.classList.add("sit"); speak(pick(["Rows of lavender running away to the hills, the cypresses dark against them, a stone farmhouse with blue shutters. The canvas billows. Somewhere, cicadas.", "The light's gone honey-coloured. The curtains lift and fall in the breeze. You could stay out here all afternoon.", "Olive trees, silver when the wind turns their leaves. A long, slow, golden afternoon."]), 6500);
    ; render(); return; }
}
function lunchTablePanel(){
  const hm = localHM(), list = bookingsFor(dayKey()).filter(b => hm >= b.at), nm = id => (NPCS.find(n => n.id === id) || {name: id}).name, t = vineState(F).today || {};
  return `<span class="tape gingham" aria-hidden="true"></span><h2>The Sunday long lunch</h2><p class="sub">${seatedAt(dayKey(), hm)} at the table under the canvas. You're out here hosting, so they're ordering faster (and they tip).</p>
    <ul class="hlist lunchbook">${list.map(b => `<li><span>${esc(b.ids.map(nm).join(", ").replace(/, ([^,]*)$/, " and $1"))}</span><small>${b.family ? "friends!" : b.birthday ? "a birthday" : `${b.size} ${b.size === 1 ? "seat" : "seats"}`}</small></li>`).join("")}</ul>
    <p class="muted">So far today: ${t.lunchB || 0} bottles and ${t.lunchP || 0} plates to the table. ${shelfStock(vineState(F))} bottles left on the shelves.</p><div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
}
function roomSpot(id){
  if (id === "dyecloth") { const r = takeDye(F, addInv); if (!r) return; if (r.ready) { sfx("chime"); gainXp(2); flash("Your persimmon scarf"); speak("You unpeg the scarf: three days of sun have turned it a deep, warm rust, like Mr Moon's. It's a keepsake now. It smells like summer.", 6500); save(); }
    else speak(`Still drying: it's ${["pale and green-ish", "turning golden", "nearly rust"][Math.min(2, DYE.DAYS - r.left)]}. ${r.left} more day${r.left === 1 ? "" : "s"} of sun.`, 4500); render(); return; }
  // Bellbird Valley (round 142): the platypus window and the noticeboard are for looking; every other room has a panel
  if (id === "bv_platypus") { const seen = watchWater(F, localHM()); hero.sitting = true; nodes.hero.classList.add("sit");
    speak(seen ? pick(["There! A small brown shape, paddling hard, then a duck-bill and a flat tail, and gone in a stream of bubbles. A platypus!", "She's there: turning over stones on the bottom with her bill, round and round. Then up for air, and down again."]) : pick(["The water's still. A few bubbles by the reeds... no. Just a leaf. Patience.", "Nothing yet. The ranger says dawn and dusk are best. You wait a little longer, listening to the water."]), 6500);
    ; if (seen) gainXp(1); save(); render(); return; }
  if (id === "bv_campkitchen") { speak(`A note on the noticeboard: "${pick(BB_NOTES)}"`, 6500); render(); return; }
  if (id === "pp_buy") { goalView = "paperie"; sfx("paper", true); render(); return; }   // round 183: the paperie
  if (id.startsWith("pp_")) { ppView = id; if (id === "pp_rack") wrSt = {}; paperNow(); sfx("paper", true); render(); return; }
  if (id.startsWith("bv_")) { bbRoom = id; sfx("paper", true); render(); return; }
  // Saltwick Harbour (round 215): the counters, the café, the lamp; the tank, the racks, the ledger and the window seat
  if (["sw_market", "sw_chandlery", "sw_cafe", "sw_smokehouse", "sw_lighthouse"].includes(id)) { swView = id; swSt = {}; sfx("paper", true); render(); return; }
  if (id === "swtank") { sfx("tap"); speak(pick(["The lobsters sit in the tank with their claws banded, looking blue and black and thoroughly fed up.", "One lobster taps the glass. Ruth says that's Gerald. Gerald's been here a week. Nobody has the heart.", "A crab climbs over a lobster, who doesn't care for it at all."]), 5000); render(); return; }
  if (id === "swracks") { speak(pick(["Rows and rows of kippers, split and golden, hanging on the speats in the oak smoke. It stings your eyes a bit. Worth it.", "Sid checks a kipper, sniffs it, and hangs it back. \"Two more hours. The smoke knows.\"", "Up in the rafters it's dark as a chimney, and the herring glow like old brass."]), 5500); render(); return; }
  if (id === "swledger") { const s0 = swState(F); speak(`The keeper's ledger, open on the desk: the weather in the margin, every boat out and every boat home, in Alfie's careful hand. ${s0.lamp ? `Your name's in there ${s0.lamp === 1 ? "once" : `${s0.lamp} times`}: "helped light the lamp."` : "Today: wind fresh, sea moderate, all boats home by four."}`, 7000); render(); return; }
  if (id === "swwindow") { hero.sitting = true; nodes.hero.classList.add("sit"); speak(pick(["The harbour through the steamed-up glass: the cobles leaning in the mud, the lighthouse, a gull on every post.", "A coble comes in round the harbour wall, low in the water with the catch. Ruth's already waiting on the quay.", "Rain on the window, the teapot at your elbow. There's nowhere you need to be."]), 6000); render(); return; }
  // Cinque Terre (round 132): each room's panel
  if (id === "ct_focacceria" || id === "ct_pesto" || id === "ct_cantina" || id === "ct_gelato" || id === "ct_limoni") { cinqueView = id; ctSt = {}; sfx("paper", true); render(); return; }
  // Jeju (round 128): each room's thing to do, and the slow-post box
  if (id === "jj_haenyeo" || id === "jj_shed" || id === "jj_cafe" || id === "jj_market" || id === "jj_dye" || id === "jjpost") { jejuView = id; jjSt = {}; sfx("paper", true); render(); return; }
  if (id === "jjjuk") { jejuView = "jj_haenyeo"; jjSt = {}; sfx("paper", true); render(); return; }
  if (id === "jjradio") { sfx("chime"); speak(pick(["The radio's playing a trot song, all trumpets and heartbreak. Mr Ko hums along without looking up.", "The weather forecast: wind, sun, more wind. Mr Ko nods. Good tangerine weather.", "A call-in show about the best way to peel a tangerine. Mr Ko has opinions."]), 5000); render(); return; }
  if (id === "jjwindow") { hero.sitting = true; nodes.hero.classList.add("sit"); speak(pick(["The sea, the crater, a fishing boat, the divers' orange floats. You could watch this all afternoon.", "A ferry slides across the window. Somewhere out there is Honeybrook.", "The wind's whipping the sea white. Inside, it's warm, and smells of coffee and tangerines."]), 5000); render(); return; }
  if (id === "kt_tea" || id === "kt_hall" || id === "kt_sweets" || id === "kt_market" || id === "kt_pottery") { kyotoView = id; ktSt = {}; sfx("paper", true); render(); return; }
  if (id === "ktbell") { sfx("chime"); speak(pick(["BONNNG. The sound rolls round the hall and out over the garden, and keeps going long after.", "You strike the bell gently. It hums for a whole minute."]), 5000); ; render(); return; }
  if (id === "ktchime") { sfx("chime"); speak("The wind chime tinkles: a little glass bell with a goldfish painted on it. Ishida sells them for 10.", 4000); render(); return; }
  if (id === "flamenco" || id === "tea") { rondaView = id; if (id === "flamenco") { flamSt = null; clearTimeout(flamT); } else teaSt = null; sfx("paper", true); render(); return; }
  if (id === "cat") { sfx("chime"); speak(pick(["The workshop cat opens one eye, decides you're alright, and goes back to sleep on the hides.", "A purr like a little engine. Antonio says she's called Piel. Of course she is.", "The cat stretches, yawns, and rolls over onto a half-finished belt."]), 4500);
    ; render(); return; }
  if (id === "tapas" || id === "mercado" || id === "dulces" || id === "cuero" || id === "especias" || id === "ceramica" || id === "postales") { rondaView = id; sfx("paper", true); render(); return; }
  if (id === "banos") { hero.dir = 1; speak(BATH_FACTS[bathFact++ % BATH_FACTS.length], 7000); ; render(); return; }
  if (id === "jardin") { hero.sitting = true; nodes.hero.classList.add("sit"); sfx("chime"); speak(pick(["The fountain splashes, the water runs off down the channel, and the noise of the town just... stops.", "Orange blossom, myrtle, cool stone. You could sit here all afternoon.", "A sparrow drinks from the edge of the fountain. Nobody's in a hurry."]), 5500);
    const t = tripOn(F), who = t ? t.party.filter(x => (isHere(x))) : []; if (who.length) setTimeout(() => npcSay(who[0], pick(TOWNS[townOf(scene)].lines[who[0]] || ["Lovely."])), 2600); render(); return; }
}
function townSpot(id){
  const town = townOf(scene), T = TOWNS[town];
  if (id === T.station && T.by === "van") { bvView = "map"; sfx("paper", true); ; render(); return; }   // round 141: the campervan's road map
  // round 143: Bellbird Valley's activities out of doors: the balloons, the berry rows, the canoes, the campfire; and the rope swing
  const bbOut = {bvballoons: "balloon", bvberries: "berries", bvcanoe: "canoe", bvfire: "fire", bvsurf: "surf", bvwhales: "whales", bvboats: "pots", bvpenguins: "penguins", bvnippers: "nippers", bvtfalls: "swim", bvtplatypus: "platypus", bvtcalves: "calves", bvttrees: "shake", bvtpanning: "pan", bvttrain: "steam", bvhrows: "harvest", bvhpiste: "petanque", bvhhives: "bees", bvhmaze: "maze", bvhbridge: "sticks", bvhsunset: "bell"}[id];
  // round 150: the king parrots at Koala Cove, with a scoop of seed from the park store
  if (id === "bvparrots") { const evanOn = false;
    if (!((F.inv || {}).b_seed > 0)) { speak("The king parrots eye you from the fence: red heads, green wings. They'd come to your arm for a scoop of seed (the park store has it, 2 coins).", 5000); render(); return; }
    addInv("b_seed", -1); const s = bbState(F); s.parrots = (s.parrots || 0) + 1; sfx("chime"); gainXp(1); hearts(2); hero.dir = 1;
    speak("You hold out your arm with seed in your palm and stand very still. A flash of red and green, and a king parrot lands, heavy and warm, and starts cracking seeds. Then another, on your shoulder.", 6500);
    mprop("sparkle", hero.x + 20, hero.y - 60, 1400); save(); render(); return; }
  if (T.by === "van" && bbOut) { bbRoom = bbOut; bbSt = {}; sfx("paper", true); speak(T.say[id] || "", 4000); render(); return; }
  if (id === "bvswing") { speak(T.say[id] || "The rope swing: a fat rope with a knot at the bottom, hanging off a river red gum over the swimming hole.", 4000); sfx("chime"); gainXp(1);
    setTimeout(() => { speak(pick(["You grab the rope, run, and swing out over the water... and let go. SPLASH. It's freezing! It's wonderful!", "Out, out, out over the river, and back again. You chicken out of letting go. Next time.", "You swing, let go at the very top, and hit the water with a whoop that sends the cockatoos up."]), 6000); mprop("sparkle", hero.x + 30, hero.y - 40, 1400); }, 1800);
    ; save(); render(); return; }
  // Saltwick Harbour (round 215): fossil hunting on the scar, crabbing off the wall, the cat and the bench
  if (town === "saltwick" && (id === "swscar" || id === "swcrab")) { swView = id === "swscar" ? "scar" : "crab"; swSt = {}; sfx("paper", true); speak(T.say[id], 4500); render(); return; }
  if (id === "swcat") { sfx("chime"); hearts(1); speak(pick(["The harbour cat opens one eye, decides you'll do, and rolls over for his tummy to be rubbed. Just the once.", "He purrs like a boat engine. Jack says he's called Captain. Ruth says he's called Trouble.", "The cat yawns, enormous, and goes back to sleep on the lobster pot. You've been dismissed."]), 5000); render(); return; }
  if (id === "swbench") { hero.sitting = true; nodes.hero.classList.add("sit"); speak(pick([T.say[id], "The whole sea, grey-green and glittering, all the way to the edge of the world. A gannet folds up and drops like a dart.", "The wind's in your hair and a skylark's going up and up somewhere behind you."]), 6000); render(); return; }
  if (id === T.station) { railOpen = T.by === "ferry" ? "ferry" : true; sfx("paper", true); render(); return; }   // (an island's station is its ferry pier)
  if (T.ferry && id === T.ferry.pier) { railOpen = "ferry"; sfx("paper", true); render(); return; }   // Jeju: the ferry home
  const room = roomBehind(town, id);   // round 116: the tapas bar, the café, the market, the baths and the garden have insides
  if (room) { sfx("paper", true); setScene(room, [260, 560]); setTimeout(() => speak(T.rooms[room].say, 5000), 700); if (town === "kyoto") setTimeout(() => stampHere(room), 5800);
    // a touch (round 144): Pinot the cellar dog trots in to the tasting room after you
    if (room === "bv_tasting") setTimeout(() => { if (scene !== "bv_tasting") return; speak("Pinot the cellar dog pads in behind you, sniffs your shoes, and flops down under the bar with a sigh.", 4500); ; }, 5600);
    const r = rondaState(F); ;
    return; }
  if (["mercado", "tapas", "dulces", "convento", "azulejos"].includes(id)) { rondaView = id; sfx("paper", true); speak(T.say[id], 4000);
    render(); return; }
  if (id === "alameda" && (F.inv.picnic || 0) > 0) { rondaPicnic(F, addInv); hero.sitting = true; nodes.hero.classList.add("sit"); hero.dir = -1; sfx("chime"); gainXp(1);
    const t = tripOn(F), who = t ? t.party.filter(x => true) : [];
    speak(`A picnic at the balcony: bread, payoyo, jamón and oranges, with the whole valley below.${who.length ? " Everyone squeezes onto the blanket." : ""}`, 6500);
    [0, 300, 600].forEach((d, i) => setTimeout(() => mprop("heart", hero.x + (i - 1)*16, hero.y - 50, 1600), d));
    who.slice(0, 3).forEach((id, i) => setTimeout(() => npcSay(id, pick(T.lines[id] || ["Mmm."])), 2400 + i*2600));
    save(); render(); return; }
  if (id === "ktyukata") { kyotoView = "ktyukata"; sfx("paper", true); render(); return; }
  // Cinque Terre (rounds 132–134): the monorail harvest and the boat painting open their panels; a padlock on the
  // lovers' path; a cat asleep in a boat
  if (id === "ctmonorail") { cinqueView = "monorail"; ctSt = {}; sfx("paper", true); render(); return; }
  if (id === "ctboats") { cinqueView = "boats"; ctSt = {boat: {}}; sfx("paper", true); if (Math.random() < .4) setTimeout(() => speak("A ginger cat is asleep in the red boat, in a coil of rope. Nobody's going to move him.", 4000), 600); render(); return; }
  if (id === "ctpadlock") { const c = cinqueState(F); if (!c.padlock && F.coins >= 3) { F.coins -= 3; c.padlock = dayKey(); sfx("chime"); gainXp(1); speak("A little brass padlock, two sets of initials scratched on with a key, clicked onto the railing over the sea. It stays there now.", 6000); drawScene(); save(); }
    else speak(c.padlock ? "Your padlock's still there, among the hundreds, catching the sun." : T.say.ctpadlock, 5000); render(); return; }
  // Ornella (id ornella): on the harbour in the evening she's saved you a slice of farinata (once a day)
  if (id === "ctharbour" && localHM() >= 18*60 && isHere("ornella") && cinqueState(F).pizza !== dayKey()) { cinqueState(F).pizza = dayKey(); hero.sitting = true; nodes.hero.classList.add("sit"); sfx("chime"); hearts(2);
    speak("Ornella pats the warm stones beside her and unwraps a paper parcel. \"Farinata, still hot. A captain always feeds her crew.\" The harbour lights come on, one by one, over the dark water.", 7500);
    setTimeout(() => npcSay("ornella", pick(["Every evening I watch the lights come on. It's better with company.", "Thirty-one years I brought the ferry in at this hour. Now I just watch. Much more restful.", "Black pepper on top. Some things one doesn't improve upon."])), 4200);
    save(); render(); return; }
  // Jeju (round 129): add a stone to a wish-tower; pat the stone grandfather's nose
  if (id === "jjcairns") { sfx("chime"); speak(pick(["You find a flat black stone and balance it on the tallest tower. A wish for everyone at home.", "One more stone, very carefully. It wobbles, and holds."]), 4500); ; render(); return; }
  if (id === "jjstatues") { speak(T.say.jjstatues + " People rub their noses for luck; the noses are worn smooth.", 6500); ; render(); return; }
  if (town === "kyoto") stampHere(id);
  speak(T.say[id] || VILLAGE[id].line, 6000);
  render();
}
// in town: someone in the party says something about the place now and then; and the last train home at 10pm
let townSaid = 0;
function townTick(){
  const town = townOf(scene); if (!town) return;
  if (localHM() >= TOWNS[town].backTo && TOWNS[town].by === "van" && !document.querySelector(".trainride")) { speak("It's getting late: everyone in the van, time to drive home.", 3500); vanHome(true); return; }
  if (localHM() >= TOWNS[town].backTo && !document.querySelector(".trainride")) { const t0 = tripOn(F); speak(`That's the last ${t0 && t0.by === "ferry" ? "ferry" : "train"}! Everyone on, quick.`, 3500); tripHome(true); return; }
  if (scene === "ct_vernazza" && localHM() >= 12*60 && localHM() < 12*60 + 5 && S.ctBells !== dayKey()) { S.ctBells = dayKey(); sfx("chime"); speak("Noon: the church bells ring out over the harbour, and the whole of Vernazza stops for lunch.", 5000); }   // round 134
  const t = tripOn(F); if (!t || !t.party.length || Date.now() - townSaid < 70000 || Math.random() > .25) return;
  const who = t.party.filter(id => (isHere(id))), id = pick(who.length ? who : [null]); if (!id) return;
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
      if (r.isNew || r.id === "koi") { sfx("yay"); act("cheer"); [0, 300].forEach((d, i) => setTimeout(() => mprop("sparkle", hero.x + (i ? 20 : -20), hero.y - 60, 1600), d)); } else sfx("chime");
      if (r.id === "koi") { speak("A golden koi! It's going in the pond at home.", 5000); drawScene(); }
      else ; }
  }
  save(); dressMel(); ctx();
}
function fishBite(){ const c = fishSt.cast; if (!c || !fishSpot) return; c.t0 = Date.now(); sfx("chime"); dressMel(); ctx();
  fishT = setTimeout(() => { if (fishSt.cast === c) { fishSt = {msg: "It nibbled the worm and slipped away while you weren't looking."}; dressMel(); ctx(); } }, FISH_ESCAPE); }
// Rainy days outdoors: the player under a periwinkle brolly with white dots.
const MEL_BROLLY = {kind: "brolly", a: "#9AA9DD", b: "#FFFDF6", pat: "dots"};
let rainDressed = null;
function dressRain(){
  const wet = outside() && !townOf(scene) && rainyOn(dayKey()) && !($("hero") && $("hero").classList.contains("sup")), k = wet ? "y" : "";
  if (k === rainDressed) return; rainDressed = k;
  const mr = $("melRain");
  if (mr) mr.innerHTML = wet ? brollyArt(MEL_BROLLY, 1) : "";
}
function dressMel(){
  const d = F.decor || {}, show = (id, on) => { const e = $(id); if (e) e.style.display = on ? "" : "none"; };
  const pj = wearing(F, "me_pj") && scene === "room";
  { const cone = !!(S.cone && Date.now() < S.cone.until), el = $("melCone"); if (el) { el.style.display = cone ? "" : "none"; if (cone) $("melConeTop").style.fill = S.cone.col || "#F4C7CF"; } }
  show("melRod", !!fishSpot && FISH_SPOTS[fishSpot].scene === scene); { const r = $("melRod"); if (r) r.classList.toggle("bite", !!(fishSt.cast && fishSt.cast.t0)); }
  show("melBow", wearing(F, "me_bow")); show("melHat", wearing(F, "me_hat") && outside()); show("melScarf", wearing(F, "me_scarf") && !pj); show("melPj", pj);
  applyWear(pj);
  dressRain();
  const m = $("hero"); if (m) m.style.visibility = (S.sleep && scene === "room") || cruisingNow() ? "hidden" : "";
}
function render(redraw){
  if (S.day !== dayKey()) S = freshToday();
  storyFlags(F);   // story rewards that change the game (the koi tip, Farid's pastries)
  registerItems(F);   // each discovered gelato flavour is a gift item (one per type) in the backpack
  registerCraft(F);   // round 153: and each oil, soap and lotion you've worked out at the mill
  registerHampers(F);   // round 173: and each hamper she's packed
  registerBoxes(F);   // the loves round: and each bonbon box, by what's in it
  registerBottles(F);   // round 188: bottles taken from the gift shop's wine corner
  WR.registerWraps(F);   // round 185: and every gift she's wrapped
  setLive(liveNow());   // the jazz duo at the night market, the guitar in Ronda: live, over the record player
  QB.noteSeen(F); dressMel();
  if (redraw) drawScene();
  const L = level(), next = LEVELS[L+1];
  $("title").firstChild.textContent = `${F.name}'s village`;
  $("trayName").textContent = F.name; if (document.activeElement !== $("paperNameIn")) $("paperNameIn").placeholder = paperName();
  const d = new Date(now() + LOC());
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
  // the heart panel, in tabs: who's where first (the one looked at most), then neighbours, the pet, stories, gifts
  const ftabs = [["where", "Who's where"], ["neighbours", "Neighbours"], ["chum", esc(F.name)], ["stories", "Stories"], ["family", "Gifts"]], noHead = h => h.replace(/^\s*<h3 class="ph3">[^<]*<\/h3>/, "");
  $("friendTitle").textContent = {where: "Who's where today", neighbours: "Neighbours", chum: `Friendship with ${F.name}`, stories: "Stories so far", family: "Gifts for friends"}[friendTab];
  const fbody = friendTab === "where" ? noHead(whosWhereHTML()) : friendTab === "neighbours" ? neighboursHTML() : friendTab === "stories" ? noHead(storiesHTML(F, Object.fromEntries(NPCS.map(n => [n.id, n.name]))))
    : friendTab === "family" ? giftsGivenHTML()
    : `<p class="hearts" aria-label="${filled} of 5 hearts to next level">${Array.from({length: 5}, (_, i) => icon("heart", 22, i < filled ? "" : "faint")).join("")}</p>
    <p class="muted">${esc(F.name)} is your ${LEVELS[L].name}. ${next ? `Next up: ${next.name}${next.gift ? `, which brings ${next.gift}` : ""}.` : "Friendship maxed!"} ${F.days || 0} day${F.days === 1 ? "" : "s"} together. It grows when you show up, feed, play and garden, and never goes down.</p>
    <h3 class="ph3">Village upgrades</h3>
    <p class="muted">${F.totalQuests || 0} tasks and favours done so far. ${(() => { const nx = nextUpgrade(F.totalQuests || 0); return nx ? `Next at ${nx.at}: ${esc(nx.name)}.` : "Every upgrade unlocked!"; })()}</p>
    <ul class="uplist">${UPGRADES.map(u => `<li class="${(F.totalQuests || 0) >= u.at ? "got" : ""}">${icon((F.totalQuests || 0) >= u.at ? "sparkle" : "clock", 16)} <span>${esc(u.name)}</span> <small>${u.at}</small></li>`).join("")}</ul>`;
  $("friendBody").innerHTML = `<div class="tabs" role="tablist">${ftabs.map(([k, n]) => `<button role="tab" data-ftab="${k}" aria-selected="${k === friendTab}">${n}</button>`).join("")}</div>` + fbody;
  $("friendBody").querySelectorAll("[data-ftab]").forEach(b => b.onclick = () => { friendTab = b.dataset.ftab; sfx("tap"); render(); });
  renderBoard();
  const pin = $("paperIn"), paper = paperWaiting(); if (pin) pin.style.display = paper ? "" : "none";
  if (scene === "base" && paper && S.paperSaid !== paper.id) { S.paperSaid = paper.id; setTimeout(() => speak(`${paperName()} is in the letterbox!`, 4500), 1800); }
  questMark(); journal(); ctx(); bag(); trackers(); mailCard(); refreshNotebook();
}
// the Friends panel's Gifts tab: everyone you've given something to, most first
function giftsGivenHTML(){
  const g = Object.entries(F.fam.gifts).filter(([w, n]) => n > 0 && NPCS.some(d => d.id === w)).sort((a, b) => b[1] - a[1] || villagerName(a[0]).localeCompare(villagerName(b[0])));
  return `<p class="muted">${icon("heart", 14)} ${g.length ? `Gifts given: ${g.map(([w, n]) => `${esc(villagerName(w))} ${n}`).join(" · ")}.` : "No gifts given yet."} Treats and keepsakes are in the market's Gifts tab: friends at ${QB.FRIEND_HEARTS} hearts or more can have them sent round, and anyone at all can be given something in person.</p>`;
}
// Neighbours: everyone who asks for favours or has a story to tell, with their hearts (five each; never lost)
function neighboursHTML(){
  const list = NPCS.filter(n => !n.tourist && !n.local && !n.kid && (QB.ASKERS[n.id] || STORIES[n.id] || QB.hearts(F, n.id)) && ((F.met || {})[n.id] || QB.hearts(F, n.id))).sort((a, b) => QB.hearts(F, b.id) - QB.hearts(F, a.id) || a.name.localeCompare(b.name));
  if (!list.length) return `<p class="muted">Say hello to the villagers, help with their requests on the quest board, and bring them presents (one a day each). Hearts open up their stories.</p>`;
  return `<p class="muted">A heart for every favour, and for a favourite present (anything else, half a heart; one present a day each). Two hearts bring a thank-you letter, four a little gift, five a friend for life. Hearts open up their stories, a chapter at a time.</p><ul class="qlist nbrs">${list.map(n => { const h = QB.hearts(F, n.id), r = QB.requestFrom(F, n.id);
    return `<li><span><b>${esc(n.name)}</b><small>${esc(n.job || "")}${r ? ` · needs ${esc(QB.reqLine(r))} ${esc(QB.dueLine(r))}` : ""}</small></span><span class="hearts" aria-label="${h} of 5 hearts">${Array.from({length: 5}, (_, i) => icon("heart", 16, i < h ? "" : "faint")).join("")}</span></li>`; }).join("")}</ul>`;
}
// The quest board panel (the HUD's board button, or the board in the town square): your tasks and the village's requests.
function renderBoard(){
  const left = QB.tasksLeft(F), reqs = QB.board(F).reqs.length;
  $("qBadge").hidden = !(left + reqs); $("qBadge").textContent = left + reqs;
  $("qPay").textContent = QB.payLine(F);
  const l = $("list"), f = document.activeElement && l.contains(document.activeElement) ? document.activeElement.dataset : null;
  l.innerHTML = QB.taskRows(F);
  l.querySelectorAll("[data-tick]").forEach(b => b.onclick = () => { const t = QB.board(F).tasks.find(x => x.id === b.dataset.tick); if (!t) return; if (QB.isDone(t)) untickMine(t.id); else tickMine(t.id); });
  l.querySelectorAll("[data-tdel]").forEach(b => b.onclick = () => removeMine(b.dataset.tdel));
  l.querySelectorAll("[data-tplace]").forEach(sl => sl.onchange = () => { if (QB.setPlace(F, sl.dataset.tplace, sl.value)) { sfx("tap"); save(true); } });
  l.querySelectorAll("[data-tgo]").forEach(b => b.onclick = () => { const t = QB.board(F).tasks.find(x => x.id === b.dataset.tgo); if (t) goToPlace(placeOf(t)); });
  if (f && f.tick) l.querySelector(`[data-tick="${CSS.escape(f.tick)}"]`)?.focus({preventScroll: true});   // keep keyboard focus on the box just ticked
  const r = $("reqList"); r.innerHTML = QB.requestRows(F, haveOf, who => !!whereAt(who));
  r.querySelectorAll("[data-find]").forEach(b => b.onclick = () => findAsker(b.dataset.find));
}
/* =================== WORLD SIM =================== */
// the day starts beside the front door (standing in the doorway, the door peeked round your shoulders like a hump)
const hero = {x:VILLAGE.home.door[0] + 40, y:VILLAGE.home.door[1] + 6, tx:VILLAGE.home.door[0] + 40, ty:VILLAGE.home.door[1] + 6, dir:-1, moving:false};
const chum = {x:hero.x - 24, y:hero.y + 2, tx:hero.x - 24, ty:hero.y + 2, dir:1, moving:false};
let route = [], keys = new Set();
const svg = $("world");
function outside(){ return OUTDOOR.includes(scene); }
const bounds = () => TOWN_BOUNDS[scene] ? TOWN_BOUNDS[scene] : scene === "van" ? [182, 210, 338, 612] : scene === "village" ? [14, 150, W - 14, 598] : scene === "base" ? [14, 114, W - 14, HH - 14] : (scene === "lane" || scene === "vineyard" || scene === "orchard" || scene === "flowers") ? [14, 140, W - 14, HH - 14] : scene === "field" ? [14, 150, W - 14, HH - 14] : scene === "shore" ? [186, 140, W - 14, HH - 14] : [34, 168, W - 34, 612];

function setScene(id, at){
  const w = $("world"), from = scene; w.classList.add("fading");
  setTimeout(() => {
    if (S.sleep && id !== "room") S.sleep = null;
    scView = null; scSt.pick = null; scSt.dpick = null; ppView = null;
    GU.signBook(F); scene = id; cam.snap = true; atSpot = null; boardOpen = false; guestView = false; habView = false; tailView = false; selPlot = null; openView = null; shopClosed = false; shedOpen = false; runOpen = false; wardOpen = false; bedOpen = false; journalOpen = false; calmOpen = false; recOpen = false; routOpen = false; trophyView = null; vyView = null; kView = null; orView = null; fieldView = null; goalView = null; homeView = null; newsOpen = false; keepSpot = null; petView = null; ccView = null; hfView = null; railOpen = false; fishSpot = null; woodsView = null; rondaView = null; kyotoView = null; ktSt = {}; jejuView = null; jjSt = {}; swView = null; swSt = {}; loftView = false; cinqueView = null; ctSt = {}; ghBed = null; millOpen = false; friView = null; vanView = null; bbRoom = null; bbSt = {}; lunchView = null; occView = null; trvSt = null; pntSt = null; resetNpcs();
    const p = at || [260, 596];
    hero.x = hero.tx = p[0]; hero.y = hero.ty = p[1]; hero.path = []; chum.x = chum.tx = p[0] - 22; chum.y = chum.ty = p[1] + 2;
    render(true); w.classList.remove("fading");
    if (id === "bv_hpaper" && owns(F, "paperie")) { ppCame = PP.collectScraps(F, dayKey()); if (ppCame) setTimeout(() => speak(`${ppCame} bundle${ppCame === 1 ? "" : "s"} of scraps from your shops came up in the van: wine labels, chocolate wrappers, receipts. Into the scrap bin.`, 5500), 900); }
    if (townOf(id)) save();   // a day out: remember which screen of the town (reopening puts you back there)
    if (route.length) nextLeg();
    if (id === "base" && hungryCount(F) && !S.petNudge) { S.petNudge = true; setTimeout(() => speak("The chicks and bunnies are peeping for breakfast. Their run is by the garden.", 4500), 1400); }
    if (id === "room" && S.routSaid !== dayKey() && localHM() < 12*60) { const st = todaysSteps().filter(x => !x.done), left = checklistLeft(); if (st.length || left) { S.routSaid = dayKey(); setTimeout(() => speak(st.length ? `${st[0].name}, today: ${st[0].text}.` : `${left} morning routine step${left > 1 ? "s" : ""} on the board.`, 5000), 1500); } }
    if (id === "hall" && F.trophyIntro) { const n = F.trophyIntro; F.trophyIntro = 0; setTimeout(() => speak(`${n} trophies are waiting for you out in the courtyard, through the archway.`, 6000), 1500); save(); }
    if (id === "trophy") { checkTrophies(); setTimeout(() => speak(onPedestals(F).length ? "The courtyard. Look at all this. You did that." : "The courtyard. Your first trophy goes on a pedestal.", 4000), 900); }
    if (id === "orchard" || id === "flowers") orchardArrive(id);
    { const m = localHM(); if (owns(F, "cellar") && wineClubOn(dayKey()) && m >= 12*60 && m < 21*60 && S.clubSaid !== dayKey() && id !== "cellar") { S.clubSaid = dayKey();
      setTimeout(() => speak(m < 18*60 ? "Wine club tonight at the cellar door, 6pm! Eight members are coming to taste and buy." : "The wine club's on at the cellar door right now! Pop in and host.", 6000), 2800); } }
    if (SCOOP_IN.includes(id) || id === "bay") scoopNow();   // catch up on arrival: sales, and anything the churner's finished
    if (id === "scoopshop" && trolleyOn(F)) setTimeout(trolleyHome, 900);   // wheeling the trolley back in puts it away
    if (id === "wineshop" && aperitivoNow(dayKey(), localHM()) && S.aperoSaid !== dayKey()) { S.aperoSaid = dayKey(); setTimeout(() => speak("Friday aperitivo hour! The whole village is knocking off for a glass and a plate. Stand behind the counter: they tip.", 6000), 1200); }
    // round 140: Saturday disco night (a nudge during the day, and the floor's packed when you walk in)
    { const m = localHM(); if (owns(F, "cellar") && discoOn(dayKey()) && m >= 15*60 && m < 23*60 && S.discoSaid !== dayKey() && id !== "cellar") { S.discoSaid = dayKey();
      setTimeout(() => speak(m < DISCO_FROM ? "It's Saturday: disco night at the cellar door from 8! The glitter ball's coming out." : "Disco night's in full swing at the cellar door! Can you hear it from here?", 6000), 3200); } }
    if (id === "cellar" && owns(F, "cellar") && discoNow(dayKey(), localHM())) setTimeout(() => { speak("Disco night! The glitter ball's spinning, the lights are flashing, and the whole floor's dancing. Stand at the tasting bar to pour: they're thirsty.", 6500); ; }, 1200);
    if (id === "cellar" && wineClubNow(dayKey(), localHM())) setTimeout(() => speak("The wine club's here! Glasses clinking, everyone talking at once. Tap the tasting bar to host.", 5000), 1200);
    if (id === "wineshop" && isHere("tomi") && isHere("posy") && localHM() >= 19*60 + 30 && S.dateSaid !== dayKey()) { S.dateSaid = dayKey(); setTimeout(() => speak("Tomi and Posy are on a date night at the middle table. Act natural.", 5000), 1600); }
    if (id === "shore" && S.shoreSaid !== dayKey()) { S.shoreSaid = dayKey(); const fam = ["hana", "theo", "tomi", "posy"].filter(isHere).map(n => NPCS.find(d => d.id === n).name);
      setTimeout(() => speak(`The foreshore. Sea breeze, Norfolk pines, and keep an eye out for dolphins.${fam.length ? ` ${fam.join(fam.length > 2 ? ", " : " and ").replace(/, ([^,]*)$/, " and $1")} ${fam.length > 1 ? "are" : "is"} out too.` : ""}`, 5500), 1200); }
    if (id === "field") { const ev = eventNow(dayKey(), localHM()); if (ev && S.eventSaid !== dayKey()) { S.eventSaid = dayKey(); setTimeout(() => speak(ev.kind === "market" ? "It's the Sunday farmers market! Stalls all along the top, our wine stall with Ines, and fruit and flowers from the orchard." : ev.kind === "night" ? "The night market! Fairy lights, street food all along the top, and a jazz duo on the little stage." : "It's the field fair! Kites, face painting, lemonade. Where to start?", 6000), 1200); } }
    // remember the screen, so reopening the game today picks up here (save() keeps F.where)
    F.where = {scene, x: Math.round(hero.x), y: Math.round(hero.y), day: dayKey()}; persist("fox");
    if (id === "market") speak(isHere("hana") ? "Welcome to the market! Hana's in. Have a browse." : NPCS.find(n => n.id === "hana").away, 4500);
  }, 220);
}
// route: legs of {scene, x, y, fn}
function go(target, x, y, fn){
  const legs = [];
  let cur = scene;
  if (townOf(outdoorOf(cur)) !== townOf(outdoorOf(target))) { speak(townOf(scene) ? `That's back in Honeybrook: head home first. The train's at ${TOWNS[townOf(scene)].n} station.` : "That's a train ride away: tickets at Honeybrook station.", 4500); return; }
  if (cur !== target) {
    // An inner room (your room) is reached through its parent room: out through its east door first, in through
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
  route = legs; atSpot = null; boardOpen = false; guestView = false; habView = false; tailView = false; shedOpen = false; runOpen = false; wardOpen = false; bedOpen = false; journalOpen = false; calmOpen = false; recOpen = false; routOpen = false; trophyView = null; vyView = null; kView = null; orView = null; fieldView = null; goalView = null; homeView = null; newsOpen = false; openView = null; nextLeg(); render();
}
function nextLeg(){
  const l = route[0]; if (!l || l.scene !== scene) return;
  walkTo(l.x, l.y); hero.force = true;
}
// Outdoors the player walks round buildings and the pond (paths.js); indoors they go straight.
function walkTo(x, y){
  const b = bounds(), to = [clamp(x, b[0], b[2]), clamp(y, b[1], b[3])];
  const pts = outside() || townRoom(scene) ? findPath(scene, [hero.x, hero.y], to, b) : [to];
  const first = pts.shift(); hero.tx = first[0]; hero.ty = first[1]; hero.path = pts;
}
// Tasks done in their place (data/places.js): walk there from the board, and the next task for that place ticks off
// as you arrive, with a coin more than ticking it anywhere else
function goToPlace(pl){
  const p = PLACES[pl], sp = p && spotObj(p.scene, p.spot); if (!sp) return;
  closePanel(); speak(`Off to ${p.n}.`, 2500); go(p.scene, sp.tx, sp.ty, () => arriveSpot(p.spot));
}
function doTaskHere(spot){
  const pl = placeAt(scene, spot), t = pl && QB.taskAt(F, pl); if (!t) return;
  const paid = QB.paidToday(F) < QB.PAID_PER_DAY; tickMine(t.id);
  if (paid) { F.coins += 1; S.earned = (S.earned || 0) + 1; }
  setTimeout(() => speak(`${PLACES[pl].doing}. “${t.title}”: done, right here${paid ? " (and a coin more for coming)" : ""}.`, 5000), 1200); save(true);
}
function arriveSpot(id){
  atSpot = id; doTaskHere(id);
  if (id === "mydoor") { setScene("room", INNER.room.arrive); return; }
  if (scene === "cottage" && id === "tea") { orView = "tea"; sfx("paper", true); render(); return; }
  if (id === "dine") sitAtTable();
  if (scene === "haberdash" && ["habcounter", "bolts", "buttonjar", "habtable"].includes(id)) { habView = true; habSt.tab = id === "buttonjar" ? "buttons" : habSt.tab || "fabric"; sfx("paper", true); if (isHere("ada") && sewOpen()) npcSay("ada", pick(["What are we making?", "Gingham's on the left. Everything else is on the right. Mostly.", "Feel that linen. Go on."])); render(); return; }
  if (scene === "tailor" && ["tailtable", "rail", "sewing", "mirror"].includes(id)) { tailView = true; sfx("paper", true); if (isHere("idris") && sewOpen() && !TL.orderState(F)) npcSay("idris", pick(["Right. What shall we make?", "Stand there. Arms out. Lovely.", "Show me what Ada sold you."])); render(); return; }
  if (id === "gbook") { guestView = true; sfx("paper", true); render(); return; }
  if (id === "gbed") { const g = GU.guestHere(F); speak(g && isHere(g) && (localHM() >= 22*60 + 30 || localHM() < 7*60) ? `Shh. ${GU.nameOf(g)}'s fast asleep under the quilt.` : g ? `${GU.nameOf(g)}'s bed, made with hospital corners. Their book's on the pillow.` : "Clean sheets, a patchwork quilt and a sprig of lavender on the pillow. All ready for a guest.", 4500); render(); return; }
  if (id === "bedroom") { const m = localHM(), who = {cottage: "Farid and Mei", hanatheo: "Hana and Theo", tomiposy: "Tomi and Posy", linjun: "Lin and Juniper"}[scene] || "They";
    speak(m >= 23*60 || m < 6*60 + 30 ? `Shh. ${who} are fast asleep. See them in the morning.` : `${who === "They" ? "Their" : who + "'s"} bedroom. Private! The door stays shut.`, 4000); render(); return; }
  if (id === "gdoor") { setScene("garage", INNER.garage.arrive); return; }
  if (id === "officedoor") { setScene("office", INNER.office.arrive); return; }
  if (id === "giftdoor") { if (owns(F, "giftshop")) setScene("giftshop", INNER.giftshop.arrive); else { goalView = "giftshop"; sfx("paper", true); render(); } return; }   // round 178
  if (scene === "giftshop" && ["gcase", "gbars", "gmill", "gwine", "gtill", "gwrap", "ggallery", "gmakers", "gbasket"].includes(id)) { if (id === "gwrap") wrSt = {}; fieldView = id; sfx("paper", true); if (id === "gtill" && isHere("posy")) npcSay("posy", pick(["Morning! The bonbons are walking out the door.", "I'll mind it. Go have a wander.", "Somebody asked if we do gift wrap. I said yes. Do we?"])); render(); return; }
  if (id === "cdoor") { if (owns(F, "cellar")) setScene("cellar", INNER.cellar.arrive); else { goalView = "cellar"; sfx("paper", true); render(); } return; }
  if (scene === "garage" && (id === "scooter" || id === "car")) { goalView = owns(F, id) ? "garagepick" : id; sfx("paper", true); render(); return; }
  if (scene === "cellar" && id === "flight" && owns(F, "cellar") && wineClubNow(dayKey(), localHM())) {   // hosting the wine club
    const first = S.clubHost !== dayKey(); if (first) { S.clubHost = dayKey(); gainXp(3); act("cheer"); save(); }
    const here = clubMembers(dayKey()).filter(isHere);
    here.slice(0, 2).forEach((n, k) => setTimeout(() => npcSay(n, pick(["Ooh, what are we tasting first?", "Is this the new red? Pour me a big one.", "I'll take two bottles of that. No, three.", "Best club in the village, this.", "Cheers to the winemaker!"])), 900 + k*1800));
    speak(first ? "You're hosting the wine club! Pouring tastings, telling the story of each bottle. Everyone buys more when the winemaker's here." : "Another round for the club. The bottles are flying off the shelves.", 5500); render(); return; }
  if (scene === "cellar" && id === "racks" && owns(F, "cellar")) { vyView = "barrels"; sfx("paper", true); render(); return; }   // round 152: the cellar's barrels are on these racks
  if (scene === "cellar" && id === "flight") { const first = S.flightDay !== dayKey(); if (first) { S.flightDay = dayKey(); gainXp(2); save(); }
    speak(first ? "A tasting flight: a splash of each of your wines, lined up on the bar. Honestly? They're good." : "Another little pour. Just to be sure.", 4500); render(); return; }
  if (scene === "tomiposy" && id === "games") { speak("A games console and two controllers. Tomi's high score is taped to the side of the telly.", 4000); render(); return; }
  if (id === "guestdoor") { setScene("guestroom", INNER.guestroom.arrive); return; }
  if (id === "routines") { routOpen = true; rv.edit = false; sfx("paper", true); render(); return; }
  if (id === "bed") { bedOpen = true; sfx("paper", true); render(); return; }
  if (id === "window") { const shut = F.curtains ? F.curtains === "closed" : (isDusk() || !!S.sleep); F.curtains = shut ? "open" : "closed"; sfx("paper", true); speak(shut ? "Curtains open. Hello, sky." : "Curtains closed. Cosy.", 2500); save(true); return; }
  if (id === "record") { recOpen = true; sfx("paper", true); render(); return; }
  if (id === "nook") { calmOpen = true; sfx("paper", true); render(); return; }
  if (id === "jars") { speak(pick(["A shelf of empty jars, waiting for something.", "Little glass jars, all in a row."]), 3000); return; }
  if (id === "journal") { journalOpen = true; sfx("paper", true); render(); return; }
  if (id === "wardrobe") { wardOpen = true; sfx("paper", true); render(); return; }
  if (id === "stall") { shopClosed = false; render(); return; }
  if (id === "board" && outside()) { openView = "quests"; speak("The quest board: your tasks, and the village's requests.", 3500); render(); return; }
  if (scene === "post" && id === "scales") { fieldView = "stamps"; sfx("paper", true); render(); return; }   // the loves round: Penny's drawer of rubber stamps
  if (scene === "post" && id === "hampers") { if (!hamperSeason(dayKey())) { speak("Penny's hamper table comes out three times a year: Valentine's (from the 1st of February), Mother's Day (from the 1st of May) and Christmas (from the 20th of November).", 5000); render(); return; } fieldView = "hampers"; sfx("paper", true); render(); return; }
  if (scene === "home" && id === "fridge") { homeView = "stored"; sfx("tap"); render(); return; }   // what's put away for later (storage.js), and the shopping list
  if (scene === "garage" && id === "cupboard") { speak(pick(["Mops, a bucket and a lot of cloths.", "The cleaning cupboard. Tidy, for once."]), 3000); return; }
  if (scene === "garage" && id === "gshelf") { homeView = "shelf"; sfx("paper", true); render(); return; }
  if (scene === "office" && id === "desk") { speak(pick(["A tidy desk, a lamp and a cup of pens.", "Your desk. A good spot for writing lists."]), 3000); return; }
  if (scene === "bank" && /^vault\d$/.test(id)) { speak(pick(["A tall glass vault jar, polished till it shines.", "Opal's vault jars. Empty, and very shiny."]), 3000); return; }
  if (scene === "bank" && id === "counter") { if (!npcSay("opal", pick(["Lovely to see you! The vaults are polished and the pens all work.", "Every coin counts. Even the little ones.", "Quiet day at the bank. I've been alphabetising the pens."]))) speak("The bank counter. Opal's out just now.", 3000); return; }
  if (id === "trophydoor") { setScene("trophy", INNER.trophy.arrive); return; }
  if (id === "kdoor") { setScene("kitchen", INNER.kitchen.arrive); return; }
  // round 146: the glass doors out to the terrace, and the bookings book on the counter
  if (id === "tdoor") { if (vineState(F).terrace) setScene("terrace", [72, 456]); else speak("Glass doors onto a bare patch of gravel. Bo could build a terrace out here: it's at the vineyard stall.", 5000); return; }
  if (id === "gkdoor") { setScene("scoopkitchen", INNER.scoopkitchen.arrive); return; }
  if (scene === "scoopshop" && id === "gtables") { sitAt(SHOP_SEATS); return; }
  if (id === "ckdoor") { setScene("cocoakitchen", INNER.cocoakitchen.arrive); return; }
  if (scene === "cocoa" && id === "ctables" && workshopGroup(dayKey()).length && localHM() >= 14*60 && localHM() < 16*60) { speak("The bonbon workshop's on! Six makers at the tables, piping ganache and arguing about sprinkles. You show them how to temper.", 5500); gainXp(1);
    ; render(); return; }
  if (scene === "cocoa" && id === "ctables") { sitAt(SHOP_SEATS); return; }
  if (scene === "van" && id === "vmap") { bvView = "map"; tripPick = []; sfx("paper", true); render(); return; }   // round 141: Bellbird Valley
  if (scene === "van" && id === "vboard") { vanView = "board"; sfx("paper", true); render(); return; }
  if (scene === "van" && id === "vtable") { vanView = "crate"; sfx("paper", true); render(); return; }   // round 153: pack the pop-up crate
  if (scene === "van" && id === "vbed") { speak(pick(["You stretch out under the pop-top. Stars through the roof window. Bliss.", "A little lie-down. {pet} curls up at your feet.", "The quietest bed in Honeybrook."]), 4500); ; render(); return; }
  if (scene === "barn" && (id === "extractor" || id === "crock" || id === "press" || id === "cave")) { hfView = id; hfState(F); sfx("paper", true);
    if (id === "cave" && isHere("elena")) npcSay("elena", pick(["Turn them every morning. They like the attention.", "Smell that? That's a cheese thinking."]));
    else if (id === "press" && isHere("elena")) npcSay("elena", "Name it something nice. A wheel with a good name ages better. Everyone knows that.");
    render(); return; }
  if (COCOA_IN.includes(scene)) { ccView = {ccounter: "counter", barwall: "wall", case: "case", pantry: "pantry", bonbon: "bonbon", sacks: "sacks", roaster: "roaster", grinder: "grinder", slab: "slab", moulds: "moulds"}[id] || null;
    if (ccView) { cocoaNow(); sfx("paper", true); if (id === "ccounter" && isHere("amara")) npcSay("amara", pick(["Hi boss! The wall's looking good.", "Want a taste? I saved you a broken one.", "Dark's flying today."])); render(); return; } }
  if (id === "gddoor") { if (hasUp(scoopState(F), "dip")) { setScene("scoopdip", INNER.scoopdip.arrive); setTimeout(() => speak("Warm chocolate and a whole shelf of sprinkles. Dangerous.", 3500), 900); } else { scView = "upgrade"; sfx("paper", true); render(); } return; }
  if (SCOOP_IN.includes(scene)) { scView = {gcounter: "counter", gmenu: "menu", gfridge: "fridge", gfreezer: "freezer", gboard: "batch", gbench: "bench", gupgrades: "upgrade", gpots: "pots", gtops: "tops", gdipbar: "dipbar"}[id] || null;
    if (scView) { scSt.pick = null; scSt.dpick = null; scSt.made = null; scSt.swap = null; scoopNow(); sfx("paper", true); if (id === "gcounter" && isHere("sofia")) npcSay("sofia", pick(["Hi! What'll it be?", "On the house, boss. Which one?", "The new one's going fast!"])); render(); return; } }
  if (scene === "kitchen") { kView = id; sfx("paper", true); render(); return; }
  if (scene === "wineshop") { vyView = {wshelf: "shelf", wcounter: "counter", hbox: "box", tasting: "tasting", menu: "menu", mcrate: "mcrate"}[id] || null;
    if (vyView) { sfx("paper", true); if (id === "wcounter") { vineTick(); speak(pick(["Behind the counter. Customers come in more often while you serve.", "Apron on. Who's first?", "Open for business!"]), 3500); if (isHere("celeste")) setTimeout(() => npcSay("celeste", pick(["Two of us! Let's see how busy we get.", "You pour, I'll chat."])), 1200); }
      render(); return; } }
  if (scene === "trophy" && id === "bench") { hero.sitting = true; nodes.hero.classList.add("sit"); hero.dir = 1; sfx("paper", true); speak(pick(["Ahh. Sun on your face. Stay as long as you like.", "A little sit. The fountain's doing all the talking.", "Nowhere to be for a minute."]), 4000); render(); return; }
  if (scene === "trophy" && id === "fountain") { speak(pick(["The fountain burbles away. Someone's dropped a button in it.", "Cool water and a little stone frog. Lovely.", "You dip your fingers in. Cold!"]), 3500); return; }
  if (scene === "trophy" && id === "tbook") { trophyView = "book"; sfx("paper", true); render(); return; }
  if (scene === "trophy" && id === "affirm") { speak(pick(["A sunny bench. Sit for a minute.", "The bench is warm from the sun."]), 3000); return; }
  if (scene === "trophy" && /^ped\d$/.test(id)) { trophyView = id; const t = onPedestals(F)[+id.slice(3)]; sfx(t ? "chime" : "paper", true); render(); return; }
  if (scene === "trophy" && id === "kudos") { speak(pick(["A corkboard of village notices. The bake sale was a triumph, apparently.", "Lost: one glove, green. Found: one glove, green. Well done, everyone."]), 4000); return; }
  if (scene === "hall" && id === "whiteboard") { speak(pick(["A whiteboard with half a sum on it. Theo's, probably.", "Fresh marker, blank board."]), 3000); return; }
  const s = spotObj(scene, id); if (s) speak(s.line, 3500); render();
}
function arriveVillageSpot(id){
  atSpot = id;
  const v = VILLAGE[id];
  if (v.bridge) { atSpot = null; setScene(v.bridge, ARRIVE[scene + ">" + v.bridge]); return; }
  if (townOf(scene)) { townSpot(id); return; }
  if (id === "plot3" || id === "plot4") { speak(v.line, 4000); render(); return; }
  if (id === "olive") { vyView = "olive"; sfx("paper", true); render(); return; }
  if (id === "fishvan") { if (vanNow(dayKey(), localHM())) { friView = "van"; sfx("paper", true); } else speak("Sal's fish van parks here on Friday evenings, five till ten.", 4000); render(); return; }
  if (id === "kitefly") { flyKite(); return; }
  if (/^bm\d$/.test(id) || id === "kites") { if (!bayMarketNow(dayKey(), localHM())) { speak("The Friday market's packed away. It's on Fridays, 4:30 to 7:15, here on the field.", 4000); render(); return; } friView = id; sfx("paper", true); render(); return; }
  if (id === "screen") { if (!movieNow(dayKey(), localHM())) { render(); return; } hero.sitting = true; nodes.hero.classList.add("sit"); sfx("paper", true); gainXp(S.movieDay !== dayKey() ? 1 : 0); S.movieDay = dayKey();
    speak(`Movie night: "${filmOf(dayKey())}". Blankets, the dark, the whole village laughing at the same bits.`, 6000); ; render(); return; }
  if (id === "popcorn") { if (!movieNow(dayKey(), localHM())) { render(); return; } if (F.coins < 3) { speak("Popcorn's 3 coins.", 2500); return; } F.coins -= 3; addInv("popcorn", 1); sfx("pop"); speak("A paper cone of popcorn, still warm. (It's in your backpack: eat it, or give it to someone.)", 4500); save(); render(); return; }
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
    sfx("chime"); gainXp(1); act("cheer"); speak(`${r.line} +${r.n} ${ITEMS[r.id].n.toLowerCase()} in your backpack.`, 5500); mprop("sparkle", hero.x, hero.y - 60, 1600); ; save(); render(); return; }
  if (id === "fishriver" || id === "fishlake" || id === "fishsea" || id === "fishpool" || id === "fishbay") { fishSpot = spotIn(scene); fishSt = {}; fishState(F); hero.dir = scene === "shore" || scene === "bay" ? -1 : 1; sfx("paper", true); render(); return; }
  if ((id === "bluebell" || id === "figtree") && scene === "hlane") { const g = letGuests(dayKey())[id === "bluebell" ? 0 : 1]; speak(`${VILLAGE[id].line}${g && g.length ? ` Staying this week: ${g.map(x => (NPCS.find(n => n.id === x) || {}).name).join(" and ")}.` : ""}`, 5000); render(); return; }
  if (scene === "hfarm" && id === "farmhouse") { hfView = "house"; hfState(F); sfx("paper", true); render(); return; }
  if (scene === "hfarm" && id === "stray") { const g = catchGoat(F); if (!g) { render(); return; } sfx("chime"); act("cheer"); gainXp(1); farmTrust(3); speak(`Got you, ${g.n}! Back in the paddock you go. Latch the gate tonight and nobody gets out.`, 5000); ; save(); drawScene(); render(); return; }
  if (scene === "hfarm" && (id === "cows" || id === "goats" || id === "hives" || id === "fstand")) { hfView = id === "fstand" ? "stand" : id; hfState(F); sfx("paper", true);
    if (id === "hives" && isHere("felix")) npcSay("felix", fullHives(hfState(F)).length ? "There's honey ready! Here, take the veil." : "Not quite ready. The bees are still busy.");
    else if ((id === "cows" || id === "goats") && isHere("elena")) npcSay("elena", pick(id === "cows" ? ["Daisy first, she insists.", "Mind Mochi's tail. It has opinions."] : ["Keep your shoelaces away from Toffee.", "Pepper! Out of the bucket!"]));
    render(); return; }
  if (id === "farmshop") { orView = "shop"; orTab = null; sfx("paper", true); if (isHere("farid")) npcSay("farid", pick(["Picked this morning. Take your pick.", "Fresh this morning. Choose any.", "The good ones are at the front. I put them there for you."])); render(); return; }
  if (id === "barrels") { vyView = "barrels"; sfx("paper", true); render(); return; }
  if (id === "vinestall") { vyView = "stall"; sfx("paper", true); render(); return; }
  if (id === "pswing" || id === "pslide" || id === "pseesaw" || id === "pround") { playground(id); return; }
  if (/^mstall\d$/.test(id)) { const st = stallAt(dayKey(), localHM(), +id.slice(-1)); if (!st) { speak(eventNow(dayKey(), localHM()) ? "Nobody's set up a stall there today." : "The stalls are packed away till the next market.", 3500); render(); return; }
    fieldView = id; orTab = null; sfx("paper", true); if (st.kind === "wine") { vineTick(); speak("Behind the stall. Shoppers stop by more while you serve.", 3500); }
    else if (st.kind === "scoop") { scSt.pick = null; scoopNow(); speak("Behind the cart. More people stop for a scoop while you're serving.", 3500); if (isHere("tomo") && !keeperAway(st, dayKey(), localHM())) setTimeout(() => npcSay("tomo", pick(["Night market crowd loves the gelato. Look at that queue.", "Cones are flying. Grab a scoop, boss.", "The jazz makes people hungry. Good for us."])), 1200); }
    else if (st.kind === "cocoa") { cocoaNow(); speak("Behind the chocolate cart. More people stop while you're serving.", 3500); if (isHere("mateo") && !keeperAway(st, dayKey(), localHM())) setTimeout(() => npcSay("mateo", pick(["Market people LOVE hot chocolate, even in the morning.", "Better than paperwork, boss.", "Farid traded me a mango for a bar. Good deal?"])), 1200); }
    else if (st.kind === "mulled") { vineTick(); if (isHere("celeste") && !keeperAway(st, dayKey(), localHM())) setTimeout(() => npcSay("celeste", pick(["Mind, it's hot! Cinnamon on top?", "Everyone wants a cup tonight. Your pot's a hit.", "I've ladled forty cups. My arm's a noodle."])), 900); }
    else if (st.kind === "mine") { speak(pick(["Behind your own stall. Shoppers stop more while you're here.", "Your stall, your garland, your name on the board."]), 3500); if (st.id === "hazel" && isHere("hazel")) setTimeout(() => npcSay("hazel", pick(["The lavender soap's flying, dear.", "I've told everyone the oils are from the mill up the lane.", "Go and have a mulled wine. I've got this."])), 1100); }
    else if (st.kind === "orchard") { orchardTick(); if (isHere("farid")) npcSay("farid", pick(["Plenty for everyone today.", "Everybody wants the orchard fruit today.", "Try a slice. Go on, it's the sweetest yet."])); }
    else if (isHere(st.id) && !keeperAway(st, dayKey(), localHM())) npcSay(st.id, st.line);
    else speak("Nobody's minding this one just now. It's an honesty tin: pop your coins in.", 3500); render(); return; }
  if (id === "deck") { sitAt(DECK_SEATS); return; }
  if (id === "reno") { if (!owns(F, "cocoa")) { goalView = "cocoa"; sfx("paper", true); speak("The old shopfront. It would make a lovely chocolate shop...", 4000); } else speak(RENO_LINE, 6000); render(); return; }
  if (id === "hfreezer") { scoopNow(); scView = "honesty"; sfx("paper", true); render(); return; }
  if (id === "dbike") { scoopNow(); scView = "deliver"; scSt.vpick = null; scSt.vother = null; sfx("paper", true); render(); return; }
  if (id === "lake" || id === "picnic" || id === "pitch") { fieldSpot(id); return; }
  if (id === "exlawn") { joinClass(); return; }
  if (id === "jazzhat") { tipBand(); return; }
  if (id === "xgrotto") { fieldView = "xgrotto"; sfx("paper", true); ; render(); return; }
  if (id === "xtree") { fieldView = "xtree"; sfx("paper", true); if (treeLit(dayKey(), localHM(), F)) mprop("heart", hero.x, hero.y - 60, 1600); render(); return; }
  if (id === "suprack" || id === "homejetty") { goalView = "jetty"; sfx("paper", true); render(); return; }
  if (id === "ferry") { railOpen = "ferry"; tripPick = []; sfx("paper", true); render(); return; }   // round 127: the Jeju ferry's ticket board
  if (id === "wishtower") { const w = F.wish = F.wish || {n: 3}; if (w.day === dayKey()) { speak("You've added your stone today. The wish is in there now: it just needs time.", 4000); render(); return; }
    w.day = dayKey(); if (w.n < 9) w.n++; sfx("chime"); gainXp(1); speak(pick(["You find a flat black-ish pebble by the river, balance it on top, and make a wish. Don't tell anyone what it was.", "Clack. One more stone on the tower. A wish for today.", "Very carefully... there. The tower's a little taller, and so is the wish."]), 5000);
    ; save(); render(); return; }
  if (id === "boat") { if (owns(F, "boat")) { railOpen = "boat"; tripPick = []; sfx("paper", true); render(); } else { goalView = "boat"; sfx("paper", true); render(); } return; }
  if (id === "dolphins") { hero.sitting = true; nodes.hero.classList.add("sit"); hero.dir = -1; sfx("paper", true);
    const m = localHM(), morning = m >= 6*60 && m < 11*60;
    if (morning && S.dolphinDay !== dayKey()) { S.dolphinDay = dayKey(); gainXp(1); setTimeout(() => { speak(pick(["There! Dolphins, three of them, just past the jetty.", "A fin! Then another. The dolphins are out this morning."]), 5000); [0, 300].forEach((d, k) => setTimeout(() => mprop("heart", 90 + k*30, 220, 1800), d)); ; }, 2400); save(); }
    speak(morning ? "A sit on the bench, looking out to sea. The dolphins come by most mornings." : pick(["The sea's all sparkly. Nothing to do but look at it for a minute.", "Sea breeze. A pelican going past. A proper break."]), 4500); render(); return; }
  if (id === "swing") { speak(v.line, 3500); render(); return; }
  if (id === "letterbox") { const p = paperWaiting() || unreadMail()[0]; if (p) { sfx("paper"); openMail(p); } else speak(`Nothing in the letterbox. ${paperName()} comes on Fridays.`, 3800); render(); return; }
  if (id === "news") { newsOpen = true; newsTab = "wins"; sfx("paper"); speak(pick(["Pancake the village dog opens one eye. Here's what's new.", "The good news board. Pancake's guarding it."]), 3500); render(); return; }
  if (id === "cacao") { const c = cocoaState(F), h = Math.max(1, Math.round(((c.treeAt || Date.now()) + 2*864e5 - Date.now() - (globalThis.__hbOffset || 0))/36e5));
    speak(`The cacao tree, heavy with pods. Farid picks them and sends a sack of beans to the Cocoa Room's kitchen every two days: the next in about ${h} hour${h === 1 ? "" : "s"}.`, 5500); if (isHere("farid")) setTimeout(() => npcSay("farid", pick(["I talk to it every morning. That's why there are so many pods!", "A chocolate tree, here! Who knew it would grow?"])), 1500); render(); return; }
  if (id === "shed") { shedOpen = true; speak(v.line, 3800); render(); return; }
  if (id === "run") { runOpen = true; const n = hungryCount(F); speak(!F.pets.animals.length ? "An empty run. Chicks and bunnies are at the market." : n ? `${n === 1 ? "Someone's" : n + " little ones are"} peeping for breakfast.` : VILLAGE.run.line, 3800); render(); return; }
  if (id === "bench") { speak(v.line, 3800); render(); return; }
  if (id === "well") { A.water(); return; }
  if (id === "board") { arriveSpot("board"); return; }
  if (id === "pond") { speak(VILLAGE.pond.line, 4000); render(); }
}
/* ---------- The vineyard ---------- */
// you're serving while you're standing at the wine shop counter
const serving = () => (scene === "wineshop" && atSpot === "wcounter") || (scene === "field" && /^mstall\d$/.test(atSpot || "") && (stallAt(dayKey(), localHM(), +atSpot.slice(-1)) || {}).kind === "wine");
// Every minute (and on load): customers buy from the shelves, the vineyard hands water thirsty vines.
// Farid picks what's ripe and the farm shop sells; if you're watching, the trees and beds redraw
function orchardTick(){
  const out = orchTick(F, dayKey()); if (!out) return;
  const picked = Object.keys(out.picked).length, here = scene === "orchard" || scene === "flowers";
  (out.tours || []).forEach(tr => { if (here && !quietNow()) setTimeout(() => speak(`Tour finished! ${tr.n} visitors paid ${tr.fee} coins into the orchard tin.`, 4500), 800); });
  if (picked && (scene === "orchard" || scene === "flowers")) { drawScene(); if (isHere("farid") && !quietNow()) npcSay("farid", pick(["Picked these for the shop. So sweet this year.", "Look, so many! My back's aching, but worth it.", "Fresh from the tree. Take some home."])); }
  save(scene === "orchard" || scene === "flowers");
}
// round 154: upstairs at the mill: what the shelves show, and you at a tasting
let tstSt = null;
function millUpInfo(){ const c = craftState(F), cnt = k => Object.entries(c.store).filter(([id]) => ITEMS[id] && ITEMS[id].mill === k).reduce((a, [, n]) => a + n, 0);
  return {shop: owns(F, "millshop"), oils: cnt("oil"), soaps: cnt("soap"), lotions: cnt("lotion"), steep: c.steep.length, cure: c.cure.length, tasting: owns(F, "millshop") && tastingNow(dayKey(), localHM()) != null, workshop: owns(F, "millshop") && workshopNow(dayKey(), localHM())}; }
// round 153: the mill workshop and the Mill Shop (millcraft.js)
let mcSt = {tab: "oil"};
function millShopPanel(){
  const c = craftState(F), t = c.sold[dayKey()] || {n: 0, coins: 0}, open = owns(F, "millshop");
  if (!open) return `<span class="tape gingham" aria-hidden="true"></span><h2>Upstairs at the mill</h2><p class="sub">Dust sheets over a long-forgotten counter, and shelves all round the walls. It'd make a lovely little shop for your oils and soaps, with olive oil tastings at the long table and soap workshops in the corner. Hazel, who made soap for forty years, has already said she'd run it.</p>
    ${owns(F, "mill") ? `<div class="actions"><button class="btn primary" data-goal="millshop" ${F.coins >= GOALS.millshop.price ? "" : "disabled"}>Open the Mill Shop · ${GOALS.millshop.price} ${icon("coin", 13)}</button></div>` : ""}<p class="muted">Until then, there are no tastings or workshops, and the wine shop sells a little from a "from the mill" crate by its counter.</p><div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
  return `<span class="tape gingham" aria-hidden="true"></span><h2>The Mill Shop</h2><p class="sub">${isHere("hazel") ? "Hazel's behind the counter, wrapping soap in brown paper." : "Shut just now: Hazel opens 10 to 5, every day but Monday."} ${storeCount(c)} things on the shelves. Today: ${t.n} sold, ${t.coins} coins.</p>
    <p class="muted">Make more at the workbench upstairs; the shelves fill as things finish steeping, curing and warming.</p><div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
}
// round 153: the pop-up crate by the van on a campervan trip: passers-by buy while you're at the stop
function crateTick(){
  const c = craftState(F), t = tripOn(F), now = Date.now(), here = t && t.by === "van" && townOf(scene) === t.town && crateCount(vanCrate(F)) > 0;
  if (!here) { c.vanAt = now; return; } let coins = 0; const what = [];
  for (let at = (c.vanAt || now) + 60000; at <= now; at += 60000) { const r = vanSellMinute(F); if (r) { coins += r.coins; what.push(r.what); } }
  c.vanAt = (c.vanAt || now) + Math.floor((now - (c.vanAt || now))/60000)*60000;
  if (coins) { F.coins += coins; sfx("coin"); flash(`+${coins}: ${what.length === 1 ? `a passer-by bought ${what[0]}` : `${what.length} sales`} at the van`); save(); }
}
function millTick(){
  const c = craftState(F), done = craftDone(F); if (done.length) { save(); const msg = done.map(d => `${d.n} ${d.recipe.name.toLowerCase()}`).join(", "); if ((scene === "mill" || scene === "millup") && !quietNow()) speak(`Ready, and onto the shelves: ${msg}.`, 5000); else flash(`At the mill: ${msg}`); }
  if (owns(F, "mill") && whereIs("tomi") === "mill") { const d = inesStep(F, millState(F), vineState(F)); if (d.started || d.pressed) { save(); if (scene === "mill" && isHere("tomi") && !quietNow()) npcSay("tomi", d.started ? "The crate was full, so in they go. An hour under the stone." : `Bottled! ${d.pressed} up to the basket for you.`); else if (d.pressed && scene === "millup") flash(`Tomi's brought up ${d.pressed} bottle${d.pressed > 1 ? "s" : ""} of olive oil: they're in the basket`); } }
  { const day = dayKey(), hm = localHM(); if (owns(F, "millshop") && WORKSHOP.dow.includes(new Date(day + "T00:00:00Z").getUTCDay()) && hm >= WORKSHOP.to && c.workshopPaid !== day) {   // round 154: the workshop's tickets
    c.workshopPaid = day; const fee = WORKSHOP.fee*WORKSHOP.size; F.coins += fee; save(); if (scene === "millup") { sfx("coin"); flash(`+${fee}: the soap workshop`); } } }
  // sales, minute by minute since the last look (at most a day): the Mill Shop, or the wine shop's little shelf
  const now = Date.now() + (globalThis.__hbOffset || 0), from = Math.max(c.at || now, now - 864e5); let coins = 0, n = 0, xcoins = 0, xn = 0, gcoins = 0, gn = 0;
  for (let at = from + 60000; at <= now; at += 60000) { const sg = new Date(at + LOC()), day = sg.toISOString().slice(0, 10), hm = sg.getUTCHours()*60 + sg.getUTCMinutes();
    const got = craftSellMinute(F, day, hm, owns(F, "millshop") ? "shop" : owns(F, "giftshop") ? null : vineState(F).shelf ? "wineshop" : null); if (got) { coins += got; n++; }
    if (owns(F, "giftshop") && hm % 60 === 0) { const r = BK.travelTick(F, at); r.got.forEach(g => setTimeout(() => flash(`A box from ${g.who}: ${BK.BOX} ${ITEMS[g.item].n.toLowerCase()} for the gift shop (${g.cost} coins)`), 1200)); r.skip.forEach(g => setTimeout(() => flash(`${g.who}'s box waits a week: it's ${g.cost} coins`), 1200)); }   // round 198
    if (owns(F, "giftshop")) { const fr0 = JSON.stringify(GAL.galleryState(F).frames.concat([GAL.makersState(F).stock])), g = giftSellMinute(F, day, hm, at + 60000 > now && scene === "giftshop" && atSpot === "gtill" ? "hero" : giftKeeperOn(day, hm) ? "keeper" : null, giftOpts()); if (g) { gcoins += g; gn++; }
      if (scene === "giftshop" && JSON.stringify(GAL.galleryState(F).frames.concat([GAL.makersState(F).stock])) !== fr0) galleryRedraw = true; }
    const ev = eventNow(day, hm); if (ev && ev.kind === "market") ["market", "grace"].forEach(w => { const g = craftSellMinute(F, day, hm, w); if (g) { coins += g; n++; } });
    if (ev && ev.kind === "xmas") { const g = stallSellMinute(F, day, at + 60000 > now && scene === "field" && /^mstall\d$/.test(atSpot || "") && (stallAt(day, hm, +atSpot.slice(-1)) || {}).kind === "mine" ? "hero" : owns(F, "millshop") ? "hazel" : "tin"); if (g) { xcoins += g; xn++; } } }
  if (galleryRedraw) { galleryRedraw = false; if (!gcoins) save(true); }
  if (gcoins) { F.coins += gcoins; save(scene === "giftshop"); if (scene === "giftshop") { sfx("coin"); flash(`+${gcoins}: the gift shop`); } else if (gn > 2) setTimeout(() => speak(`The gift shop sold ${gn} thing${gn > 1 ? "s" : ""} while you were away: ${gcoins} coins.`, 5000), 4500); }
  if (xcoins) { F.coins += xcoins; save(); if (scene === "field") { sfx("coin"); flash(`+${xcoins}: your Christmas stall`); } else if (xn > 2) setTimeout(() => speak(`Your stall at the Christmas market sold ${xn} thing${xn > 1 ? "s" : ""} while you were away: ${xcoins} coins.`, 5000), 3500); }
  c.at = from + Math.floor((now - from)/60000)*60000; if (coins) { F.coins += coins; save(); if (scene === "mill" || scene === "millup" || scene === "wineshop") { sfx("coin"); flash(`+${coins}: ${owns(F, "millshop") ? "the Mill Shop" : "the mill shelf at the wine shop"}`); } else if (n > 2) setTimeout(() => speak(`While you were away, ${owns(F, "millshop") ? "Hazel sold" : "the wine shop sold"} ${n} thing${n > 1 ? "s" : ""} from the mill: ${coins} coins.`, 5000), 3000); }
}
// round 152: moments on the terrace while you're out there: the first dance, the bouquet, the New Year countdown
function terraceMoments(){
  if (scene !== "terrace" || !vineState(F).terrace || quietNow()) return; const day = dayKey(), hm = localHM(), oc = occasionOn(day), t = F.terraceEv = F.terraceEv || {};
  if (oc === "wedding" && hm >= WED.first[0] && hm < WED.first[1] && S.firstDance !== day) { S.firstDance = day; const w = weddingOn(day); speak(`The music changes. ${w.couple}'s first dance, under the festoon lights, and the whole terrace goes quiet.`, 6000); drawScene(); }
  if (oc === "wedding" && hm >= WED.bouquet && hm < WED.bouquet + 30 && S.bouquet !== day) { S.bouquet = day; const caught = Math.random() < .5;
    if (caught) { if (!(F.inv || {}).t_bouquet) { addInv("t_bouquet", 1); flash("A wedding bouquet"); } act("cheer"); sfx("chime"); speak("\"Ready? One, two, THREE!\" The bouquet sails over everyone's heads... and lands right in your arms. The whole terrace cheers.", 7000); }
    else speak("The bouquet toss! It sails over everyone's heads and the flower girl catches it, and runs off shrieking with joy.", 6000); save(); }
  if (oc === "nye" && (hm >= 23*60 + 59 || hm < 5) && S.newYear !== day) { S.newYear = day; sfx("chime"); act("cheer"); speak("Ten! Nine! Eight! ... Three! Two! One! HAPPY NEW YEAR! Fireworks over the vines, and everyone hugging everyone.", 8000); drawScene(); }
}
function vineTick(){
  terraceMoments();
  millTick();   // round 153
  crateTick();
  { const done = mullTick(F); if (done) { save(); if (scene === "kitchen" && !quietNow()) speak(`The mulled wine's ready: ten cups of ${done.name}. Celeste's taking the pot out front.`, 5000); else flash(`Mulled wine ready: ${done.name}`); } }   // round 153
  const out = sellTick(F, {serving: scene === "wineshop" && serving(), stall: scene === "field" && serving(), club: scene === "cellar" && wineClubNow(dayKey(), localHM()), lunch: scene === "terrace" && (lunchNow(dayKey(), localHM()) || !!occasionNow(dayKey(), localHM())), disco: scene === "cellar" && atSpot === "flight" && discoNow(dayKey(), localHM()), harvest: (festivalOn(dayKey()) || {}).id === "harvest"});
  // Pilar runs the kitchen on her shifts (tells you what she's done only while you're in there with her)
  if (whereIs("pilar") === "kitchen") { const done = cookTick(F, dayKey()); if (done.length) { save(); if (scene === "kitchen" && !quietNow() && $("panel").hidden) speak(cookLine(done), 5500); } }
  // at closing, leftover tapas of the day go to the staff for dinner
  { const n = wineNews(F, dayKey(), localHM()); if (n) { setTimeout(() => speak(n, 6000), 5500); save(); } }   // round 139: the day's takings at closing
  const note = staffDinner(F, dayKey(), localHM());
  if (note) { save(); if (!quietNow()) setTimeout(() => speak(staffLine(note), 7000), out && out.mins >= 30 ? 9000 : 1500); }
  if (!out) return;
  if (out.mins < 30) orderNote(out.orders, "Winery", !serving());
  const typing = !!(document.activeElement && document.activeElement.closest && document.activeElement.closest(".vyname, [data-vyprice]"));
  if (out.coins && serving()) { sfx("coin"); flash(`+${out.coins} coins from the wine shop`); }
  else if (out.coins && out.club && scene === "cellar") { sfx("coin"); flash(`+${out.coins} coins: the wine club`); }
  else if (out.coins && out.lunchB && scene === "terrace") { sfx("coin"); flash(`+${out.coins} coins: ${out.lunchB === 1 ? "a bottle" : `${out.lunchB} bottles`} to the long table${out.tips ? ` (${out.tips} in tips)` : ""}`); }
  else if (out.coins && out.disco && scene === "cellar") { sfx("coin"); flash(`+${out.coins} coins: disco night (in the wine shop's honesty box)`); }
  else if (out.mins >= 30 && out.coins) setTimeout(() => speak(`While you were away, villagers bought ${out.bottles ? `${out.bottles} bottle${out.bottles > 1 ? "s" : ""}` : ""}${out.bottles && out.glasses ? " and " : ""}${out.glasses ? `${out.glasses} glass${out.glasses > 1 ? "es" : ""}` : ""} of your wine. ${vineState(F).box} coins are waiting in the honesty box.`, 6500), 2500);
  if (typing) persist("fox"); else save(scene === "vineyard" || scene === "wineshop");
}
// A stall at the market or fair: what it sells (bought like at Hana's), or an activity (a kite, face paint)
// what a stall has out: the produce stall's vegetables and berries follow the season (the same as the seed packets at Hana's)
// A stall's goods today: its signature item (the first in tours.js) always, plus a different handful each market day
// from the rest of its range (data/stall-goods.js POOLS), picked by the date so the day's mix stays put
const stallItems = st => !st.produce ? todaysGoods(st) : Object.keys(CROPS).filter(c => !["tulip", "sunflower", "wildflower"].includes(c) && (c !== "chickpea" || (F.towns && F.towns.cinque)) && (c !== "raspberry" || (F.towns && F.towns.bellbird)) && ITEMS[c] && !CROPS[c].herb && Object.values(ITEMS).some(it => it.crop === c && !it.greenhouse && (!it.seasons || it.seasons.includes(seasonOf(dayKey())))));
function todaysGoods(st, day = dayKey()){
  if (st.xmas) return st.items.filter(id => ITEMS[id]);   // round 172: the Christmas stalls have everything out every evening
  const ev = eventOn(day), pool = [...(st.items || []).slice(1), ...(((POOLS[ev ? ev.kind : ""] || {})[st.id]) || [])].filter(id => ITEMS[id]);
  const n = Math.max(2, (st.items || []).length);
  return [...(st.items || []).slice(0, 1), ...pool.map(id => [hash(day + ":" + st.id + ":" + id), id]).sort((a, b) => a[0] - b[0]).slice(0, n).map(([, id]) => id)];
}
const stallPrice = id => ITEMS[id].price || (ITEMS[id].sell || 2) + 2;
const fieldKind = () => /^mstall\d$/.test(fieldView || "") ? (stallAt(dayKey(), localHM(), +fieldView.slice(-1)) || {}).kind : null;
// round 172: the first night of the Christmas market, the village counts the tree's lights on
function treeCountdown(){
  xmasState(F).lit[dayKey().slice(0, 4)] = true; save(true);
  const near = ["mei", "farid", "hana", "okada", "pip", "bo"].filter(id => isHere(id));
  speak("Everyone's gathered round the tree in the dark. Here we go...", 3500, true);
  ["Three!", "Two!", "One!"].forEach((n, k) => setTimeout(() => { sfx("tap"); near.slice(k, k + 2).forEach(id => npcSay(id, n)); ; }, 3200 + k*1300));
  setTimeout(() => { drawScene(); sfx("chime"); hearts(3); gainXp(2); speak("The lights come on all at once: hundreds of them, warm white, right up to the star. The whole field goes \"ooh\". Christmas has started.", 7000, true);
    if (isHere("mei")) setTimeout(() => npcSay("mei", "The star is crooked. Every year, crooked."), 2600); ; }, 7200);
}
// round 178: the gift shop's shared stock, from the other shops
const giftOpts = () => (owns(F, "giftshop") && GAL.stockUp(F, dayKey()), {F, cocoa: owns(F, "cocoa") ? cocoaState(F) : null, onDisplay: ccOnDisplay, store: craftState(F).store, v: vineState(F), day: dayKey(), hm: localHM(), here: scene === "giftshop" && atSpot === "gtill", keeper: isHere("posy"), pk: fieldView === "gwine" ? gsPk : null});
let gsPk = null, galleryRedraw = false;   // round 196: the gallery wall or the makers' shelf changed while you're in the shop   // round 189: a pairing box being packed in the gift shop's wine corner
// a treat at the Christmas market, eaten on the spot; "mulled": a cup of your own
function xmasTreat(id){
  if (id === "mulled") { const m = F.mull || {}; if (!(m.cups > 0)) return; m.cups--; sfx("chime"); hearts(2); speak(pick(["A paper cup of your own mulled wine, warm through your gloves. Not bad, if you say so yourself.", "Cinnamon, orange, and the red from your own vines. The whole market smells like this."]), 5000); save(); ctx(); return; }
  const t = TREATS[id]; if (!t || F.coins < t.price) return; F.coins -= t.price; xmasState(F).treats++; sfx("coin"); hearts(2); gainXp(1);
  speak(pick(t.say), 5000); ; save(true); ctx(); }
function marketStallPanel(st){
  const ev = eventNow(dayKey(), localHM()); if (!ev) return "";
  const who = (NPCS.find(n => n.id === st.id) || {name: "Someone"}).name;
  const away = keeperAway(st, dayKey(), localHM());
  let h = `<span class="tape gingham" aria-hidden="true"></span><h2>${esc(st.n)}</h2><p class="sub">${esc(who)}'s stall at the ${esc(ev.kind === "xmas" ? ev.name : ev.name.toLowerCase())}. ${away ? `${esc(who)}'s off wandering the market, so it's on the honesty tin: take what you like and pop the coins in.` : `"${esc(st.line)}"`}</p>`;
  { const sold = (craftState(F).sold[dayKey()] || {}), mine = Object.keys(craftState(F).store).some(id => ITEMS[id] && ITEMS[id].mill === "soap");   // round 153
    if (st.id === "grace" && (mine || sold.grace)) h += `<p class="muted">A basket of your soaps on the end of the table, too: Grace's gran is Hazel, at the Mill Shop. ${sold.grace ? `${sold.grace} of yours sold this morning.` : "None sold yet today."}</p>`;
    if (st.id === "elena" && owns(F, "millshop")) h += `<p class="muted">"Your oils are the talk of the market. I send people up the lane to the mill."</p>`;
    if (st.kind === "wine" && (sold.market || Object.keys(craftState(F).store).length)) h += `<p class="muted">A crate from the mill at the end of the stall: oils, soaps and lotions. ${sold.market ? `${sold.market} sold so far.` : ""}</p>`; }
  const items = stallItems(st);
  if (items.length) h += `<div class="items shop">${items.map(id => itemBtn(id, `<b>${stallPrice(id)}</b> ${icon("coin", 13)}`, F.coins < stallPrice(id), F.inv[id] ? `<span class="cnt">×${F.inv[id]}</span>` : "")).join("")}</div><p class="muted">You have ${F.coins} coins.${st.produce ? " Handy when the garden's between harvests: it all goes to the kitchen or to your pet." : ""}</p>`;
  if (st.decor) h += `<div class="items shop">${st.decor.map(id => { const d = DECOR[id], own = F.decorOwned[id], on = own && F.decor[d.slot] === d.val;
    return `<button class="item" data-decor="${id}" ${!own && F.coins < d.price ? "disabled" : ""}><span class="e">${icon(d.ico, 34)}</span><span class="n">${esc(d.n)}</span><span class="c">${on ? (d.where === "room" ? "in your room" : "in your home") : own ? "tap to use" : `<b>${d.price}</b> ${icon("coin", 13)}`}</span></button>`; }).join("")}</div><p class="muted">Bought once, kept forever. You have ${F.coins} coins.</p>`;
  h += treatsHTML(st, F.coins);   // round 172: the Christmas market's chestnuts and hot chocolate
  if (st.act) h += `<div class="actions"><button class="btn primary" data-fair="${st.act}" ${F.coins < 3 ? "disabled" : ""}>${st.act === "kite" ? "Fly a kite (3 coins)" : "Get your face painted (3 coins)"}</button></div>`;
  return h + `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
}
function fairActivity(k){
  if (F.coins < 3) return; F.coins -= 3; gainXp(1); sfx("chime"); fieldView = null; goalView = null; ctx();
  if (k === "kite") { walkTo(200, 420); speak(`A red kite. You run with it across the field and it actually flies. Mostly. ${F.name} chases the tail.`, 5000); }
  else speak("Face paint: a little tiger on your cheek. The children at the next table are very impressed.", 5000);
  [0, 300].forEach((d, k2) => setTimeout(() => mprop("heart", hero.x + (k2 - .5)*20, hero.y - 50, 1800), d)); save(true);
}
// The Scoop Shack: the shop ticks along (customers buying) whenever you're anywhere in the village
const SHOP_SEATS = [[87, 518], [173, 518], [227, 518], [313, 518], [367, 512], [453, 512]];
// you're at the Scoop Shack's night market cart (stall place 8), scooping
const atCart = () => scene === "field" && atSpot === "mstall8" && (stallAt(dayKey(), localHM(), 8) || {}).kind === "scoop";
// delivery orders (round 137): a little note now and then as Tomo pedals one round (not while you've been away)
const ORDER_WHO = ["hana", "okada", "juniper", "bo", "lin", "opal", "theo", "farid", "mei", "felix", "elena", "amara", "lila", "noor", "wren", "tomi", "posy"];
function orderNote(orders, shop, till){
  if (!orders || !orders.length || Date.now() - (S.orderAt || 0) < 150000) return; S.orderAt = Date.now();
  const o = orders[orders.length - 1], names = ORDER_WHO.map(id => NPCS.find(n => n.id === id)).filter(Boolean), who = names.length ? pick(names).name : "A neighbour";
  const where = o.picnic ? ` to a picnic on ${pick(["the field", "the foreshore", "the edge of the woods"])}` : pick([" to their door", " to the town square", " round to the lane", ""]);
  sfx("coin"); flash(`${shop} order: ${who}, ${o.what}${where} (+${o.coins}${till ? " in the honesty box" : ""})`);
  // and Tomo pedals past on the mint bike, if you're outdoors in Honeybrook (round 138)
  if (outside() && !townOf(scene) && !sup) { const t = NPCS.find(n => n.id === "tomo"); if (t) { const r = bikeRoute(); if (r) rideBy(t.look, r); } }
}
// Tomo's way across this screen: in at one side, out at the other, round the buildings and never through the water
// (the walkable ground, as for everyone: paths.js), near where you're standing. null if there's no clear way across.
function bikeRoute(){
  const b = bounds(), dir = Math.random() < .5 ? 1 : -1, ok = p => p[0] >= b[0] && p[0] <= b[2] && p[1] >= b[1] && p[1] <= b[3] && !blocked(scene, p[0], p[1]);
  const ys = [hero.y + 70, hero.y - 60, hero.y + 30, hero.y - 30, ...[.85, .7, .55, .4, .25].map(f => b[1] + (b[3] - b[1])*f)].map(y => Math.round(Math.max(b[1] + 20, Math.min(b[3] - 10, y))));
  for (const y of ys) {
    const a = [dir > 0 ? b[0] + 4 : b[2] - 4, y], z = [dir > 0 ? b[2] - 4 : b[0] + 4, y]; if (!ok(a) || !ok(z)) continue;
    const pts = [a, ...findPath(scene, a, z, b)];
    // every step of the way on open ground (findPath gives a straight line when it can't find a way round)
    const clearAll = pts.slice(1).every((p, i) => { const q = pts[i], n = Math.ceil(Math.hypot(p[0] - q[0], p[1] - q[1])/8); for (let k = 0; k <= n; k++) if (!ok([q[0] + (p[0] - q[0])*k/n, q[1] + (p[1] - q[1])*k/n])) return false; return true; });
    if (clearAll) return [[a[0] - dir*60, a[1]], ...pts, [z[0] + dir*60, z[1]]];
  }
  return null;
}
// the ice cream trolley (round 137): put it away (unsold scoops back in the freezer, unless they've melted)
function trolleyHome(){ const r = returnTrolley(F); if (!r) return; sfx(r.melted ? "paper" : "chime");
  speak(`Trolley's back${r.n ? `: ${r.n} sold, ${r.coins} coins` : ""}. ${r.back ? `${r.back} scoop${r.back === 1 ? "" : "s"} back in the freezer.` : r.melted ? `The last ${r.melted} scoop${r.melted === 1 ? "" : "s"} had melted, sadly.` : "Sold out!"}`, 6000); save(); }
// someone tapped while you're pushing the trolley outdoors in Honeybrook: do they want one? -> true if it was an offer
function trolleyOffer(id){
  const def = NPCS.find(n => n.id === id), fam = QB.hearts(F, id) >= QB.FRIEND_HEARTS; if (!def) return false;
  const r = trolleySell(F, id, dayKey(), {kid: (!!(def && def.kid)), family: fam, rainy: rainyOn(dayKey()), season: seasonOf(dayKey()), hm: localHM()}); if (!r) return false;
  if (r.no) { npcSay(id, pick(["Not today, thanks!", "Ooh, tempting. Maybe later!", "I've just had lunch, sorry!", "Not for me, but it looks lovely."])); save(); return true; }
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
  { const news = scoopNews(s, dayKey(), localHM()); news.forEach((t, i) => setTimeout(() => speak(t, 6000), 2500 + i*6500)); if (news.length) save(); }
  if (!out.coins && !out.mins) return;
  if (out.box && (scene === "bay" || out.mins >= 30)) setTimeout(() => speak(`The honesty freezer's been busy: ${s.box} coins waiting in its box.`, 4500), out.coins ? 6000 : 1500);
  if (out.cart && scene === "field") { sfx("coin"); flash(`+${out.cart} coins: the ${s.name} cart`); }
  else if (out.coins && (scene === "scoopshop" || scene === "bay")) { sfx("coin"); flash(`+${out.coins} coins: ${s.name}`); }
  else if (out.coins && out.mins >= 30) setTimeout(() => speak(`While you were away, ${s.name} sold ${out.n} ice cream${out.n > 1 ? "s" : ""}: ${out.coins} coins.`, 5000), 1500);
  if (out.coins || out.box || out.mins >= 5) save(); if (scView) ctx(); if (SCOOP_IN.includes(scene)) drawScene();
}
// sit on a free seat (the deck, or the shop's tables); an ice cream in hand gets eaten
function sitAt(seats){
  const taken = npcActors().map(([, e]) => e).filter(e => e.kind === "npc");
  const free = seats.filter(([x, y]) => !taken.some(e => Math.hypot(e.x - x, e.y - y) < 14));
  if (!free.length) { speak("Every seat's taken. Busy day!", 3000); render(); return; }
  const near = free.map(p => [p, Math.hypot(p[0] - hero.x, p[1] - hero.y)]).sort((a, b) => a[1] - b[1])[0][0];
  hero.tx = near[0]; hero.ty = near[1]; hero.path = []; setTimeout(() => { hero.sitting = true; nodes.hero.classList.add("sit"); hero.dir = scene === "bay" ? -1 : 1; }, 700);
  const cone = S.cone && Date.now() < S.cone.until;
  speak(cone ? (scene === "bay" ? "Ice cream on the deck, the whole foreshore in front of you. Bliss." : "A little sit with an ice cream. Lovely.") : scene === "bay" ? "A seat on the deck. The dolphins might come by." : "A seat by the window.", 4000);
  render();
}
// a free ice cream at the counter
function haveIceCream(rid){
  const r = eatOne(F, rid); if (!r) return;
  S.cone = {until: Date.now() + 4*M, col: r.col}; ;
  scView = null; scSt.pick = null; if (fieldView === "mstall8") fieldView = null; ctx(); sfx("chime"); act("cheer"); mprop("heart", hero.x, hero.y - 60, 1600);
  if (S.iceDay !== dayKey()) { S.iceDay = dayKey(); gainXp(1); }
  speak(`${r.name}! ${("Find a seat, or take it for a walk along the foreshore.")}`, 5000);
  save(); render();
}
// the delivery bike: Tomo pedals one round to a friend (three hearts or more), and a thank-you note comes back
const deliverTo = () => friends().map(w => [w, villagerName(w)]);
// round 139: the delivery panel also offers bonbons, bars and tapas from the other shops (bikesend.js)
function deliverMore(h){
  const s = scoopState(F); if (!hasUp(s, "bike") || !riderOn(localHM()) || scSt.vpick) return h;
  const opts = sendOptions(F, dayKey(), owns(F, "cocoa"));
  if (scSt.vother && opts.some(o => o.k === scSt.vother)) return `<span class="tape gingham" aria-hidden="true"></span><h2>Delivery</h2><p class="sub">Tomo pedals it round in the cool box, and a thank-you note comes back to your mailbox.</p>` + sendMorePanel(opts, scSt.vother, deliverTo()) + `<div class="actions"><button class="btn alt small" data-close="1">Close</button></div>`;
  const more = sendMorePanel(opts), shut = /<div class="actions"><button class="btn alt small" data-close="1">Close<\/button><\/div>$/;
  return more ? (shut.test(h) ? h.replace(shut, m => more + m) : h + more) : h;
}
function deliver(w){
  if (scSt.vother) { const id = takeSend(F, scSt.vother, dayKey()); if (!id) return; const it = ITEMS[id] || {n: "present"};
    F.fam.gifts[w] = (F.fam.gifts[w] || 0) + 1; gainXp(1); PP.bloomFor(F, id, w); F.thanks = [...(F.thanks || []), {id: `thanks-${w}-${Date.now()}`, who: w, item: id, at: Date.now() + 10*M}].slice(-30);
    scoopState(F).bikeOut = Date.now() + (globalThis.__hbOffset || 0); sfx("chime"); flash(`On its way to ${villagerName(w)}`); speak(`Tomo's pedalling ${/^[aeiou]/i.test(it.n) ? "an" : "a"} ${it.n.toLowerCase()} over to ${villagerName(w)} in the cool box. Watch your mailbox for a thank-you note.`, 5000);
    scSt.vother = null; scView = null; save(); ctx(); render(); return; }
  if (giftedAlready(w)) return;
  const it = takeAway(F, scSt.vpick, FORMATS[scSt.vfmt] ? scSt.vfmt : "cone"); if (!it) return;
  const id = Object.keys(ITEMS).find(k => ITEMS[k] === it);
  addInv(id, -1); F.fam.gifts[w] = (F.fam.gifts[w] || 0) + 1; gainXp(1); PP.bloomFor(F, id, w); giftHeart(w, id);
  F.thanks = [...(F.thanks || []), {id: `thanks-${w}-${Date.now()}`, who: w, item: id, at: Date.now() + 10*M}].slice(-30);
  scoopState(F).bikeOut = Date.now() + (globalThis.__hbOffset || 0); sfx("chime"); flash(`On its way to ${villagerName(w)}`); speak(`Tomo's pedalling a ${it.n.toLowerCase()} over to ${villagerName(w)} in the cool box. Watch your mailbox for a thank-you note.`, 5000);
  scSt.vpick = null; scView = null; save(); ctx(); render();
}
// The Cocoa Room: beans to bars in the kitchen, bars off the wall at the counter; ticks along like the Scoop Shack
// round 183: the paperie sells while you're in Montrose; scraps from home come up in the van when you walk in
function paperNow(){
  if (!owns(F, "paperie")) return; const here = townOf(scene) === "bv_hilltown", out = PP.paperTick(F, here);
  if (out.cls && here) setTimeout(() => speak(`The card class is done: four little cards drying on the big table, and ${out.cls} coins in the tin.`, 5000), 800);
  if (out.coins || out.wage || out.down) { save(); if (scene === "bv_hpaper") { if (out.coins) { sfx("coin"); flash(`+${out.coins}: ${out.n ? `${out.n} sheet${out.n === 1 ? "" : "s"} of paper` : "the paperie"}`); } if (ppView) ctx(); drawScene(); }
    else if (!here && out.coins > 20 && Date.now() - (S.paperSaid || 0) > 3600e3) { S.paperSaid = Date.now(); setTimeout(() => speak(`A note from Lise: the paperie took ${out.coins} coins${out.wage ? ` (her wage, ${out.wage}, already out)` : ""}.`, 5000), 2500); } }
}
// round 185: wrapping (the paperie's ribbon rack, the gift shop's wrapping table)
function wireWrap(c){
  c.querySelectorAll("[data-wr]").forEach(b => b.onclick = () => { const [a, v] = b.dataset.wr.split(/:(.*)/s); let say = null;
    if (a === "reel") { if (WR.buyReel(F, v)) { sfx("coin"); flash(`A reel of ${WR.RIBBONS[v].n.toLowerCase()}: ${WR.REEL} bows`); } }
    else if (a === "stamps") { if (WR.buyStamps(F)) { sfx("chaching"); say = "A wooden tray of rubber stamps: bees, grapes, olive sprigs, stars and hearts. And a pot of ink that matches whatever paper you use."; } }
    else if (a === "tags") { const n = WR.cutTags(F, v); if (n) { sfx("paper", true); flash(`${n} ${/_seeds$/.test(v) ? "seeded " : ""}gift tags`); } }
    else if (a === "open") { ppView = "pp_wrap"; sfx("paper", true); }
    else if (a === "rack") { ppView = "pp_rack"; }
    else if (["item", "paper", "stamp", "ribbon", "tag"].includes(a)) { wrSt[a] = v && wrSt[a] !== v ? v : null; sfx("tap"); }
    else if (a === "go") { const id = WR.wrapIt(F, wrSt); if (id) { sfx("chime"); gainXp(1); act("cheer"); [0, 250].forEach((t, i) => setTimeout(() => mprop("sparkle", hero.x + (i ? 18 : -18), hero.y - 60, 1400), t));
      say = `Folded, creased, ${wrSt.stamp ? "stamped, " : ""}${wrSt.ribbon ? "tied with a bow, " : ""}${wrSt.tag ? "tagged, " : ""}done. It's in your backpack: tap it there to choose who it's for.`; wrSt = {}; } }
    else if (a === "put") { if (putWrapped(F, v)) { sfx("paper", true); flash("In the gift basket"); } }
    else if (a === "paperbuy") { if (WR.buyPaper(F, v)) { sfx("coin"); flash(`A sheet of ${WR.STORE_PAPER[v].n.toLowerCase()} wrapping paper`); } }   // round 188
    else if (a === "tagbuy") { if (WR.buyTags(F)) { sfx("coin"); flash(`${WR.TAG_PACK.n} gift tags`); } }
    if (say) speak(say, 5000); save(); ctx(); drawScene(); });
}
function wirePaper(c){
  c.querySelectorAll("[data-pp]").forEach(b => b.onclick = () => { const a = b.dataset.pp, k = b.dataset.k; let say = null;
    if (a === "go") { ppView = k; sfx("paper", true); ctx(); return; }
    if (a === "scraps") { if (PP.buyScraps(F, 1)) { sfx("coin"); flash("A bundle of scrap paper"); } }
    else if (a === "tear") { if (PP.startSoak(F)) { sfx("paper", true); say = "You tear the scraps into the tub, a label here, a wrapper there. They'll be soft in fifteen minutes."; } }
    else if (a === "beat") { if (PP.beat(F, k)) { sfx("chime"); say = `The beater thumps the soft scraps into slurry${k === "natural" ? "" : `, and a pinch of pigment turns it ${PP.COLOURS[k].n.toLowerCase()}`}. The vat's full of pulp.`; } }
    else if (a === "add") { const r = PP.addIn(F, k); if (r) { sfx("paper", true); say = k === "seeds" ? "A palmful of wildflower seeds, stirred through. Seeded paper: plant it and it grows." : `${PP.ADDS[k].n}${r === "bag" ? " from your backpack" : ""}, stirred through the pulp. You can see the flecks going round.`; } }
    else if (a === "pull") { if (PP.pull(F)) { sfx("paper", true); gainXp(1); say = "Dip the mould and deckle, lift it level, let it drain, and couch the sheet onto a felt. Again. Six wet sheets, shining."; } }
    else if (a === "press") { if (PP.startPress(F)) { sfx("paper", true); say = "Felts and sheets into the press, and you wind the big screw down. Water runs out of the bottom. Five minutes."; } }
    else if (a === "hang") { if (PP.hang(F)) { sfx("paper", true); say = "You peg them up on the line, one by one. They'll be dry by this time tomorrow."; } }
    else if (a === "down") { const n = PP.takeDown(F); if (n) { sfx("chime"); gainXp(2); act("cheer"); say = `${n} sheets off the line, crisp, with real deckled edges. Onto the shelves they go.`; } }
    else if (a === "bag") { if (PP.toBag(F, k, 1)) flash("A sheet in your backpack"); }
    else if (a === "shelf") { if (PP.toShelf(F, k)) flash("Back on the shelf"); }
    if (say) speak(say, 5000); save(); ctx(); drawScene(); });
}
function cocoaNow(){
  if (!owns(F, "cocoa")) return; lastCocoa = Date.now();
  const out = cocoaTick(F, {serving: scene === "cocoa" && atSpot === "ccounter", cart: scene === "field" && /^mstall\d$/.test(atSpot || "") && (stallAt(dayKey(), localHM(), +atSpot.slice(-1)) || {}).kind === "cocoa"});
  if (out.mins < 30) orderNote(out.orders, cocoaState(F).name, false);
  { const n = cocoaNews(cocoaState(F), dayKey(), localHM()); if (n) { setTimeout(() => speak(n, 6000), 4000); save(); } }   // round 139: the day's takings at closing
  if (out.cart && scene === "field") { sfx("coin"); flash(`+${out.cart} coins: the ${cocoaState(F).name} cart`); }
  if (out.workshop) setTimeout(() => speak(`The Saturday workshop's done: six happy bonbon makers, ${out.workshop} coins.`, 5000), 1500);
  if (out.tree && COCOA_IN.includes(scene)) speak("Farid's sent a sack of beans from the cacao tree. They're with the others in the kitchen.", 4500);
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
    if (a === "vendbox") { const got = emptyVending(F); if (got) { sfx("coin"); flash(`+${got} coins from the vending machine`); if (Math.random() < .3) speak("Someone's left a sticky note on the glass: \"The dark one's the best. Please never run out.\"", 4500); } }
    else if (a === "beans") { if (buyBeans(F, n)) { sfx("coin"); flash(`${n} sack${n > 1 ? "s" : ""} of cacao beans`); } }
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
    else if (a === "hot") { const kk = haveHot(F); if (!kk) return; sfx("chime"); mprop("heart", hero.x, hero.y - 60, 1600); speak(pick(["Hot chocolate, from your own chocolate. Pure comfort.", "Mmm. Thick, rich, a little bit of foam.", "The perfect rainy-day cup."]), 4000); ; }
    else if (a === "grand") { const id = packGrand(F); if (!id) return; sfx("paper", true); flash(`${ITEMS[id].n} in your backpack`); }
    else if (a === "bprice") { const s = cocoaState(F); s.prices.bonbon = Math.max(1, Math.min(20, s.prices.bonbon + n)); }
    else if (a === "fill") { const got = stockPantry(F, k, n, b.dataset.src, orchState(F)); if (got) { sfx("tap"); flash(`+${got} on the fillings shelf`); } }
    else if (a === "take") { const got = unstockPantry(F, k, n, orchState(F)); if (got) { sfx("tap"); flash(got.to === "bag" ? `${got.n} back into your backpack` : `${got.n} back to the farm shop shelf`); } }
    else if (a === "shell") { ccSt.shell = k; ccSt.made = null; }
    else if (a === "bshape") { ccSt.mould = k; ccSt.made = null; }   // round 176: the bonbon moulds (not "mould", which moulds bars)
    else if (a === "sel") { ccSt.made = null; const pan = cocoaState(F).pantry, cur = (ccSt.sel || []).filter(x => pan[x] > 0);   // round 193: a filling that's run out no longer holds one of the two places
      ccSt.sel = cur.includes(k) ? cur.filter(x => x !== k) : [...cur, k].slice(0, 2); }
    else if (a === "bonbon" || a === "again") { const r0 = a === "again" ? bonbonOf(cocoaState(F), k) : null, out = r0 ? makeBonbons(F, r0.shell, r0.fills, ccSt.mould || r0.shape) : makeBonbons(F, ccSt.shell, ccSt.sel, ccSt.mould); if (!out) return;
      ccSt.sel = []; ccSt.made = out.r.id; ccSt.isNew = out.isNew; sfx("chime"); act("cheer"); gainXp(out.isNew ? 2 : 1);
      if (out.isNew) { [0, 250, 500].forEach((t, k2) => setTimeout(() => mprop("sparkle", hero.x + (k2 - 1)*22, hero.y - 60, 1600), t)); speak(`A new bonbon: ${out.r.name}! Twelve of them, ready for the display case.`, 5000); }
      else flash(`Another tray of ${out.r.name}`); }
    else if (a === "case") { if (!ccToggle(cocoaState(F), k)) return; sfx("tap"); }
    else if (a === "scoop") { const got = sendScoop(F, k); if (!got) return; sfx("paper", true); gainXp(1);
      speak(k === "dip" ? `${got} dips of house-made dark, off to the Scoop Shack's dip station. Cones dipped in it sell for more.` : `${got} bars of Cocoa Room chocolate, into the Scoop Shack's gelato fridge. Try it at the mixing bench!`, 5000); }
    else if (a === "wine") { const got = wineToPantry(F, k); if (!got) return; sfx("tap"); flash(`${got.wine}: 4 fillings on the shelf`); }
    else if (a === "pair") { const w = packPairing(F, k); if (!w) return; sfx("paper", true); flash(`Pairing box with ${w}, in your backpack`); speak("A bottle and four bonbons, ribboned together. Tap it in your backpack to choose who it's for.", 4500); }
    else if (a === "special") { const sp = makeSpecial(F); if (!sp) return; sfx("chime"); act("cheer"); gainXp(2); [0, 250].forEach((t, i) => setTimeout(() => mprop("sparkle", hero.x + (i ? 20 : -20), hero.y - 60, 1500), t)); speak(`${sp.make} ${sp.n.toLowerCase()}${sp.make > 1 && !/s$/.test(sp.n) ? "s" : ""} for ${sp.fest}! They'll sell beside the display case.`, 5000); }
    else if (a === "takesp") { if (!takeSpecial(F, k)) return; sfx("chime"); flash(`${ITEMS[k].n} in your backpack`); }
    else if (a === "cointin") { const m = makeCoinTins(F); if (!m) return; sfx("chime"); flash(`${m} little tins of gold coins in your backpack`); speak("Gold foil, a red tin, a click of the lid. For luck.", 3500); }   // the loves round: all year
    else if (a === "praline") { const m = makePralines(F, storyGiven(F, "henri")); if (!m) return; sfx("chime"); gainXp(1); flash(`${m} boxes of Henri's hazelnut pralines in your backpack`); speak("Henri's pralines, from his own page in the book. The kitchen smells of toasted hazelnuts.", 4500); }
    else if (a === "eatbb") { const bb = eatBonbon(F, k); if (!bb) return; sfx("chime"); mprop("heart", hero.x, hero.y - 60, 1600); speak(`${bb.name}. Oh, that's good.`, 3500); ; }
    // round 184: choose the bonbons for a box or a pairing box
    else if (a === "pkopen") { ccSt.pk = k.startsWith("pair:") ? {kind: "pair", k: k.slice(5), size: 4, sel: {}} : {kind: k, size: n, sel: {}}; sfx("paper", true); }
    else if (a === "pkadd" || a === "pksub") { if (ccSt.pk) pickAdd(F, ccSt.pk, k, a === "pkadd" ? 1 : -1); }
    else if (a === "pkfill") { if (ccSt.pk) pickFill(F, ccSt.pk); }
    else if (a === "pkcancel") ccSt.pk = null;
    else if (a === "pkgo") { const pk = ccSt.pk; if (!pk) return; let done = false;
      if (pk.kind === "pair") { const w = packPairing(F, pk.k, pk.sel); if (w) { done = true; flash(`Pairing box with ${w}, in your backpack`); speak("A bottle and the four bonbons you chose, ribboned together. Tap it in your backpack to choose who it's for.", 4500); } }
      else { const id = pk.kind === "grand" ? packGrand(F, pk.sel) : packBox(F, pk.size, pk.sel); if (id) { done = true; flash(`${ITEMS[id].n} in your backpack`); speak("Your picks, packed with a ribbon and in your backpack. Tap it there to choose who it's for.", 4500); } }
      if (!done) return; ccSt.pk = null; sfx("paper", true); }
    else if (a === "box") { const id = packBox(F, n); if (!id) return; sfx("paper", true); flash(`${ITEMS[id].n} in your backpack`); speak("Packed with a ribbon and in your backpack. Tap it there to choose who it's for.", 4500); }
    else if (a === "eat" || a === "give") { if (!takeBar(F, k, a === "give")) return; sfx("chime");
      if (a === "give") { flash(`${CC_KINDS[k].n} bar in your backpack`); speak("Wrapped and in your backpack. Tap it there to choose who it's for.", 4000); }
      else { mprop("heart", hero.x, hero.y - 60, 1600); speak(pick(["Snap! Your own chocolate. Perfect.", "It melts just right. You made this!", "From the bean. Mmm."]), 4000); ; } }
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
    else if (a === "brush") { const an = hfBrush(F, k); if (!an) return; sfx("chime"); gainXp(1); farmTrust(1); mprop("heart", hero.x, hero.y - 60, 1600); speak(an.line, 3500); }
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
    else if (a === "csug") { const ns = cheeseNames(F, hfSt.kind, Math.floor((Date.now() + (globalThis.__hbOffset || 0))/864e5)); hfSt.sug = (hfSt.sug + 1) % Math.max(1, ns.length); hfSt.name = ns[hfSt.sug] || ""; sfx("tap"); }
    else if (a === "press") { const w = pressCheese(F, hfSt.kind, hfSt.name); if (!w) return; hfSt.name = ""; hfSt.sug = 0; sfx("chime"); act("cheer"); gainXp(2); speak(`${w.name} is pressed and on a shelf in the cave. Ripe in ${HF_CHEESES[w.kind].days} day${HF_CHEESES[w.kind].days === 1 ? "" : "s"}.`, 5000); }
    else if (a === "wheel") { const r = takeWheel(F, +k); if (!r) return; sfx("chime"); act("cheer"); gainXp(r.q === "excellent" ? 3 : 1); mprop("heart", hero.x, hero.y - 60, 1600);
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
    const where = PET_HOMES[p.scene].n.replace(/ \(.*\)$/, ""), who = ownerName(p.owner);
    if (giftPos(p.owner)) { const line = petFill(`A ${PETS[p.kind].n}! I'm calling it {p}!`, p); npcSay(p.owner, line); }
    else F.thanks = [...(F.thanks || []), {id: `thanks-${p.owner}-${Date.now()}`, who: p.owner, item, at: Date.now() + 10*M}].slice(-30);
    speak(`${p.name} the ${PETS[p.kind].n} is ${who}'s now, and lives at ${where}.${giftPos(p.owner) ? "" : ` ${who}'ll send a thank-you note.`} Tap ${p.name} there to say hello.`, 6000); done(); });
  const pc = () => companions(F).find(x => x.id === petView);
  c.querySelectorAll("[data-petdo]").forEach(b => b.onclick = () => { const p = pc(); if (!p) return; const [x, y] = petAt(p);
    if (b.dataset.petdo === "pat") { mprop("heart", x, y - 30, 1600); sfx("purr"); if (p.patDay !== dayKey()) { p.patDay = dayKey(); gainXp(1); } speak(petFill(["{p} leans into the pat.", "{p} looks very pleased with itself.", "A happy little wiggle from {p}."][Math.floor(Math.random()*3)], p), 3500); save(); return; }
    if (!giftPos(p.owner) || p.playDay === dayKey()) return;
    p.playDay = dayKey(); gainXp(2); [0, 300, 600].forEach((t, k) => setTimeout(() => mprop("heart", x + (k - 1)*14, y - 34, 1800), t)); sfx("chime");
    speak(playLine(p), 5000); setTimeout(() => { const l = ownerLine(p); npcSay(p.owner, l); }, 1800); done(); });
  const nf = c.querySelector("[data-petname]"); if (nf) nf.onsubmit = e => { e.preventDefault(); const p = pc(), v = (nf.querySelector("input").value || "").trim().slice(0, 20); if (!p || !v) return; p.name = v; flash(`Say hello to ${v}`); done(); };
  const hs = c.querySelector("[data-pethome]"); if (hs) hs.onchange = () => { const p = pc(); if (!p || !PET_HOMES[hs.value]) return; p.scene = hs.value; p.spot = companions(F).filter(x => x.scene === hs.value && x !== p).length; speak(`${p.name} has moved to ${PET_HOMES[hs.value].n.replace(/ \(.*\)$/, "")}.`, 4000); done(); };
}
function wireScoop(c){
  const s = scoopState(F), re = () => { save(); ctx(); drawScene(); };
  c.querySelectorAll("[data-gpick]").forEach(b => b.onclick = () => { scSt.pick = b.dataset.gpick; ctx(); });
  c.querySelectorAll("[data-gback]").forEach(b => b.onclick = () => { scSt.pick = null; ctx(); });
  c.querySelectorAll("[data-geat]").forEach(b => b.onclick = () => haveIceCream(b.dataset.geat));
  c.querySelectorAll("[data-gnonna]").forEach(b => b.onclick = () => { if (!makeNonna(F, storyGiven(F, "nonna"))) return; sfx("chime"); flash("A cup of Nonna's fior di latte in your backpack"); if (isHere("sofia")) npcSay("sofia", "Just milk and sugar. Nonna would cry."); re(); });   // the loves round
  c.querySelectorAll("[data-gtake]").forEach(b => b.onclick = () => { const it = takeAway(F, scSt.pick, b.dataset.gtake); if (!it) return; sfx("paper", true); flash(`${it.n} in your backpack`);
    speak(`One ${it.n.toLowerCase()} to give. It's in your backpack: tap it there to choose who it's for.`, 4500); scSt.pick = null; re(); });
  c.querySelectorAll("[data-gprice]").forEach(b => b.onclick = () => { const [k, d] = b.dataset.gprice.split(":"); s.prices[k] = Math.max(k === "special" ? 0 : 1, Math.min(30, s.prices[k] + +d)); re(); });
  c.querySelectorAll("[data-gspecial]").forEach(b => b.onchange = () => { const r = recipeOf(s, b.dataset.gspecial); if (r) { r.special = b.checked; re(); } });
  const nf = c.querySelector("[data-gname]"); if (nf) nf.onsubmit = ev => { ev.preventDefault(); const v = (nf.querySelector("input").value || "").trim().slice(0, 30); if (!v) return; s.name = v; speak(`The sign now says ${v}.`, 3500); re(); render(); };
  c.querySelectorAll("[data-gback]").forEach(b => b.onclick = () => { const [id, n] = b.dataset.gback.split(":"), got = unstockFridge(F, id, +n, orchState(F)); if (!got) return; sfx("tap"); flash(got.to === "bag" ? `${got.n} back into your backpack` : `${got.n} back to the farm shop shelf`); re(); });
  c.querySelectorAll("[data-gfill]").forEach(b => b.onclick = () => { const [from, id, n] = b.dataset.gfill.split(":"), got = stockFridge(F, id, +n, from, orchState(F)); if (!got) return; sfx("tap"); flash(`+${got} into the fridge`); re(); });
  c.querySelectorAll("[data-gsel]").forEach(b => b.onclick = () => { scSt.made = null; const id = b.dataset.gsel; scSt.sel = scSt.sel.includes(id) ? scSt.sel.filter(x => x !== id) : [...scSt.sel, id].slice(0, 4); ctx(); });
  c.querySelectorAll("[data-gmix]").forEach(b => b.onclick = () => { const out = discover(F, scSt.sel); speak(out.msg, 5500);
    if (out.recipe) { scSt.sel = []; scSt.made = out.recipe.id; sfx("chime"); act("cheer"); [0, 250, 500].forEach((t, k) => setTimeout(() => mprop("sparkle", hero.x + (k - 1)*22, hero.y - 60, 1600), t)); gainXp(2);
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
    [0, 250, 500].forEach((t, k) => setTimeout(() => mprop("sparkle", hero.x + (k - 1)*22, hero.y - 60, 1600), t)); speak(line, 6000); scView = b.dataset.gbuy === "honesty" ? "honesty" : b.dataset.gbuy === "bike" ? "deliver" : "upgrade"; up(); });
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
    else { S.cone = {until: Date.now() + 4*M, col: out.col}; sfx("chime"); act("cheer"); mprop("heart", hero.x, hero.y - 60, 1600); if (S.iceDay !== dayKey()) { S.iceDay = dayKey(); gainXp(1); }
      speak(`${out.name[0].toUpperCase() + out.name.slice(1)}. The chocolate's still setting. Eat fast!`, 5000); ; scView = null; }
    scSt.dpick = null; save(); ctx(); render(); });
  c.querySelectorAll("[data-gvpick]").forEach(b => b.onclick = () => { scSt.vpick = b.dataset.gvpick; ctx(); });
  c.querySelectorAll("[data-gvback]").forEach(b => b.onclick = () => { scSt.vpick = null; ctx(); });
  c.querySelectorAll("[data-gvfmt]").forEach(b => b.onclick = () => { scSt.vfmt = b.dataset.gvfmt; ctx(); });
  c.querySelectorAll("[data-gvother]").forEach(b => b.onclick = () => { scSt.vother = b.dataset.gvother || null; scSt.vpick = null; sfx("tap"); ctx(); });
  c.querySelectorAll("[data-gvto]").forEach(b => b.onclick = () => deliver(b.dataset.gvto));
  // the display: put a flavour out, take one off, or (when it's full) swap one in for another
  c.querySelectorAll("[data-gdisp]").forEach(b => b.onclick = () => { const id = b.dataset.gdisp, ids = displayIds(s);
    if (!ids.includes(id) && ids.length >= SLOTS) { scSt.swap = id; ctx(); return; }
    if (setDisplay(s, id)) { sfx("tap"); flash(ids.includes(id) ? `${recipeOf(s, id).name} back in the freezer` : `${recipeOf(s, id).name} in the display`); re(); } });
  c.querySelectorAll("[data-gswapout]").forEach(b => b.onclick = () => { const r = recipeOf(s, scSt.swap), out = recipeOf(s, b.dataset.gswapout);
    if (r && setDisplay(s, r.id, b.dataset.gswapout)) { sfx("tap"); flash(`${r.name} out, ${out.name} back in the freezer`); } scSt.swap = null; re(); });
  c.querySelectorAll("[data-gswapcancel]").forEach(b => b.onclick = () => { scSt.swap = null; ctx(); });
  c.querySelectorAll("[data-gmake]").forEach(b => b.onclick = () => { const r = makeTub(F, b.dataset.gmake); if (!r) return; scSt.sel = []; sfx("chime"); act("cheer"); mprop("sparkle", hero.x, hero.y - 60, 1600);
    flash(`${r.name}: into the churner`); speak(`${r.name} is in the churner: blending, then freezing. Twenty scoops, ready in an hour.`, 4500); re(); });
  c.querySelectorAll("[data-gplan]").forEach(b => b.onchange = () => { const id = b.dataset.gplan; s.plan.ids = b.checked ? [...s.plan.ids.filter(x => x !== id), id] : s.plan.ids.filter(x => x !== id); re(); });
}
// The night market's jazz duo: drop a couple of coins in the hat on the front of the stage
function tipBand(){
  const ev = eventNow(dayKey(), localHM());
  if (!ev || ev.kind !== "night") { speak("The stage is empty. The jazz duo plays the night market, Tuesday and Thursday evenings.", 4000); render(); return; }
  if (F.coins < 2) { speak("Not even two coins! Next time.", 3000); render(); return; }
  F.coins -= 2; S.tips = (S.tips || 0) + 1; sfx("coin"); flash("-2 coins in the hat");
  [0, 250, 500].forEach((d, k) => setTimeout(() => mprop("heart", STAGE.x - 20 + k*20, STAGE.y - 70, 1800), d));
  speak(pick(["Clink! The bass player tips his hat back at you.", "Two coins in the hat. The keys player plays a little flourish just for you.", "\"Thank you! This next one's for you and the {kind}.\"", "Clink. The duo grin and slide into something slower."]), 4500);
  if (S.tips === 1) gainXp(1); save(); render();
}
// A paddle off the foreshore: the player takes a board out from the rack by the jetty for a
// minute, and any villagers on the foreshore paddle out too. The pet guards the towels. Tap the shore to come back.
let sup = null;   // {from: local minutes when it started, until: ms, out: reached the water}
const SUP_BOARD = k => `<g class="supboard"><ellipse cx="0" cy="${-1*k}" rx="${22*k}" ry="${3.6*k}" style="fill:#7FB8E8;stroke:var(--line)" stroke-width="1"/><path d="M${-18*k} ${-1*k} h${36*k}" style="stroke:#FFFDF6" stroke-width=".9"/><path d="M${12*k} ${-30*k} l${5*k} ${32*k}" fill="none" stroke-width="1.6" style="stroke:#8A5A3A"/><path d="M${16*k} ${-2*k} l${2*k} ${8*k} l${3*k} ${-1*k} l${-2*k} ${-8*k}z" style="fill:#F3C969;stroke:var(--line)" stroke-width=".8"/></g>`;
[["hero", 1]].forEach(([id, k]) => { const b = document.querySelector(`#${id} .bob`); if (b) b.insertAdjacentHTML("beforebegin", SUP_BOARD(k)); });
// the player's scooter (under their feet) and car (round them, their head above the roof line), shown while on the move outdoors
{ const b = document.querySelector("#hero .bob"); if (b) {
  // a hire bike (transport.js): a basket on the front for the pet
  b.insertAdjacentHTML("beforebegin", `<g class="rideBike" transform="translate(0 7)">${bikeArt("#5E8A5A")}</g>`);
  b.insertAdjacentHTML("afterend", `<g class="rideBike" transform="translate(0 7)" style="stroke:var(--line)" stroke-width="1">
    <path d="M14 -24 h12 l-2 9 h-8z" style="fill:#C9A27E"/><path d="M15 -21 h10 M16 -18 h8" opacity=".5"/><g class="bikeChum petPeek" transform="translate(21 -26) scale(.72)"></g></g>`);
  // the ice cream trolley (round 137): a little pink push-cart in front of her, like the night market's but no parasol
  b.insertAdjacentHTML("afterend", `<g class="rideTrolley" style="stroke:var(--line)" stroke-width="1"><path d="M10 -22 l6 3" stroke-width="1.6" fill="none"/><rect x="15" y="-24" width="26" height="17" rx="2" style="fill:#F4C7CF"/><rect x="15" y="-24" width="26" height="4" rx="1.5" style="fill:#FFFDF6"/><path d="M15 -15 h26" stroke-width="2.2" style="stroke:#FFFDF6"/><path d="M24 -12 l2 5 l2 -5z" style="fill:#E8C48E"/><circle cx="26" cy="-13" r="2" style="fill:#F8D59A"/><path d="M32 -12 l2 5 l2 -5z" style="fill:#E8C48E"/><circle cx="34" cy="-13" r="2" style="fill:#C3E8B8"/><circle cx="19" cy="-3" r="3" style="fill:#2F2B28"/><circle cx="37" cy="-3" r="3" style="fill:#2F2B28"/></g>`);
  b.insertAdjacentHTML("beforebegin", `<g class="rideScoot" style="stroke:var(--line)" stroke-width="1"><rect x="-15" y="-3" width="30" height="3.4" rx="1.6" style="fill:#7FB8E8"/><circle cx="-12" cy="1" r="2.6" style="fill:#2F2B28"/><circle cx="12" cy="1" r="2.6" style="fill:#2F2B28"/><path d="M12 -3 l3 -26 M10 -29 h9" fill="none" stroke-width="2"/></g>`);
  // the cream convertible, roof down: the player at the wheel, the pet in the back
  b.insertAdjacentHTML("afterend", `<g class="rideCar" style="stroke:var(--line)" stroke-width="1.1">
    <g class="petPeek" transform="translate(-32 -20) scale(.85)"></g>
    <path d="M-40 -4 v-12 q0 -4 4 -5 h56 l8 4 q4 2 4 6 v7z" style="fill:#F3E7C9"/><path d="M-38 -14 h58" opacity=".5"/><path d="M14 -21 l4 -9" style="stroke:#9CC3E0" stroke-width="2.2"/>
    <circle cx="-26" cy="-3" r="5" style="fill:#2F2B28"/><circle cx="16" cy="-3" r="5" style="fill:#2F2B28"/><circle cx="-26" cy="-3" r="2" style="fill:#CFC8BE"/><circle cx="16" cy="-3" r="2" style="fill:#CFC8BE"/><circle cx="29" cy="-11" r="1.6" style="fill:#F3C969"/></g>`); } }
function familyPaddle(){
  if (sup) return;
  const m = localHM(); if (m >= 19*60 || m < 6*60) { speak("Too dark for paddling now. The boards will be here in the morning.", 3500); render(); return; }
  if (stormyOn(dayKey())) { speak("Choppy and rainy out there. Better on a sunny day.", 3500); render(); return; }
  sup = {from: m, until: Date.now() + 60000, out: false};
  route = []; atSpot = null; hero.path = []; hero.tx = 104; hero.ty = 372; hero.sitting = false; nodes.hero.classList.remove("sit"); nodes.hero.classList.add("sup"); sfx("paper", true);
  const fam = ["hana", "theo", "tomi", "posy"].filter(isHere);
  speak(fam.length ? `Boards out! ${fam.map(n => NPCS.find(d => d.id === n).name).join(" and ").replace(/ and (?=.* and )/g, ", ")} ${fam.length > 1 ? "are" : "is"} paddling out with you.` : "Boards out! Off the jetty and onto the water. {pet}'s minding the towels.", 4500);
  setTimeout(() => { if (sup && scene === "shore") { speak("Dolphins! Right next to the boards. Don't fall in. Okay, maybe a little.", 4500); [0, 300, 600].forEach((d, k) => setTimeout(() => mprop("heart", 80 + k*24, 330, 1800), d)); if (fam.length) npcSay(fam[0], "Dolphin! Over there, look!"); } }, 20000);
  render();
}
// Paddling between the home jetty and the foreshore: the river, the lake and the stream join them. Board on, a blink,
// and the player steps off by the other jetty (the pet too)
const JETTY = {shore: [216, 500], base: [150, 134]};
function paddleTo(dest){
  if (paddling || sup) return;
  const m = localHM(); if (m >= 22*60 || m < 6*60) { speak("Too dark to paddle the river now. Walk tonight, paddle in the morning.", 3500); render(); return; }
  const kid = false, off = scene === "shore" ? [[104, 372], [132, 404]] : [[124, 84], [96, 88]]; paddling = true; route = []; atSpot = null; hero.path = []; hero.sitting = false;
  hero.x = hero.tx = off[0][0]; hero.y = hero.ty = off[0][1]; chum.x = chum.tx = off[0][0] + 6; chum.y = chum.ty = off[0][1] - 2; nodes.hero.classList.remove("sit"); nodes.hero.classList.add("sup");
  sfx("paper", true); speak(dest === "shore" ? `Board on, ${F.name} on the front. Off down the river.` : "Board on. Up the stream and home.", 2500);
  setTimeout(() => {
    nodes.hero.classList.remove("sup"); paddling = false;
    setScene(dest, JETTY[dest]);
    setTimeout(() => { ;
      speak(dest === "shore" ? "Out at the foreshore. Salty air, and the dolphins are about." : "Home! Boards back on the rack.", 3500); }, 450);
  }, 1300);
}
// The dolphin cruise (once the boat's bought): the boat sails up the coast and back with the player and the pet aboard
const cruisingNow = () => !!(S.cruise && Date.now() < S.cruise.until && scene === "shore");
function startCruise(){
  if (S.cruise && Date.now() < S.cruise.until) return;
  const m = localHM(); if (m >= 19*60 || m < 6*60) { speak("Too dark for a cruise. The dolphins are tucked up for the night.", 3500); render(); return; }
  S.cruise = {until: Date.now() + 45000}; route = []; hero.path = []; atSpot = null;
  [nodes.hero, nodes.chum].forEach(n => n.style.visibility = "hidden"); sfx("chime"); drawScene();
  speak("All aboard! {pet}'s on your lap. Off up the coast.", 5000);
  setTimeout(() => { if (S.cruise && scene === "shore") { speak("Dolphins! A whole pod, right alongside the boat. One jumps clean out of the water.", 5500); [0, 300, 600].forEach((d, k) => setTimeout(() => mprop("heart", 90 + k*20, 260, 1800), d)); } }, 16000);
  render();
}
function endCruise(){
  S.cruise = null; [nodes.hero, nodes.chum].forEach(n => n.style.visibility = "");
  if (scene !== "shore") return;
  hero.x = hero.tx = 206; hero.y = hero.ty = 556; chum.x = chum.tx = 184; chum.y = chum.ty = 558;
  if (S.cruiseDay !== dayKey()) { S.cruiseDay = dayKey(); gainXp(3); act("cheer"); }
  speak("Back at the jetty. Salty hair, very happy faces.", 4500); save(); drawScene();
}
function endPaddle(walkBack){
  if (!sup) return; const was = sup; sup = null;
  nodes.hero.classList.remove("sup");
  if (scene !== "shore") return;
  if (walkBack) { walkTo(216, 500); ; }
  if (was.out && S.supDay !== dayKey()) { S.supDay = dayKey(); gainXp(2); act("cheer"); speak("Back on the sand. Wet, salty and very happy. Same time next weekend?", 4500); save(); }
}
// Who's where today: everyone's day at a glance (in the friendship view), family first, then the village
const PLACE_NAME = {greenhouse: "the greenhouse", mill: "the old mill", rd_station: "Ronda (the station)", rd_plaza: "Ronda (the plaza)", rd_bridge: "Ronda (the bridge)", rd_old: "Ronda (the old town)", base: "outside at home", home: "your house", farm: "the garden", village: "the town square", lane: "Makers' Lane", vineyard: "the vineyard",
  orchard: "the orchard", flowers: "the flower farm", field: "the field", shore: "the foreshore", kitchen: "the wine shop kitchen", bay: "the bay", hfarm: "Wildflower Farm", hwoods: "Honeybrook Woods", hlane: "the cottage lane", van: "the campervan", honeysuckle: "Honeysuckle cottage", clover: "Clover cottage", barn: "the barn at Wildflower Farm", scoopshop: "the Scoop Shack", scoopkitchen: "the gelato kitchen", scoopdip: "the dip station", cocoa: "the Cocoa Room", cocoakitchen: "the chocolate kitchen"};
const ACT_WORD = {water: "watering", farm: "gardening", sit: "sitting down", game: "gaming", sup: "paddleboarding", guide: "leading a tour", lead: "leading the class",
  exercise: "exercise class", cone: "with an ice cream", cook: "cooking", rest: "in the hammock", repair: "fixing things", type: "busy", play: "playing"};
const placeName = sc => PLACE_NAME[sc] || (ROOMS[sc] && ROOMS[sc].name) || sc;
// everyone who lives in Honeybrook, the ones you know best first, with their hearts
function whosWhereHTML(){
  const day = dayKey(), t = localHM(), hhmm = m => fmtTime(m);
  const row = n => { const sch = daySchedule(n.id, day), cur = sch.find(x => t >= x.from && t < x.to);
    const cls = classOn(day), word = a => a === "lead" && cls ? `leading ${cls.kind}` : a === "exercise" && cls && n.id !== "hana" ? `${cls.kind} with Hana` : ACT_WORD[a];
    const what = x => x.club ? "the wine club at the cellar door" : `${placeName(x.scene)}${x.act && word(x.act) ? ` (${word(x.act)})` : ""}`;
    const h = QB.hearts(F, n.id), hs = h ? ` <span class="hearts" aria-label="${h} of ${QB.MAX_HEARTS} hearts">${icon("heart", 11).repeat(h)}</span>` : "";
    return `<details class="whowhere"><summary><b>${esc(n.name)}</b>${hs} <small class="muted">${cur ? `now: ${esc(what(cur))}` : "not about just now"}</small></summary>
      <ul>${sch.map(x => `<li class="${x === cur ? "now" : ""}"><span>${hhmm(x.from)}–${hhmm(x.to)}</span> ${esc(what(x))}</li>`).join("") || "<li>Not in the village today.</li>"}</ul></details>`; };
  const gid = GU.guestHere(F, day), guest = gid && NPCS.find(n => n.id === gid), town = QB.villagers(F).filter(n => n.id !== gid);
  const club = owns(F, "cellar") && wineClubOn(day);
  return `<h3 class="ph3">Who's where today</h3>${club ? `<p class="muted">Wine club tonight at the cellar door, 6 to 9pm.</p>` : ""}${guest ? `<p class="eyebrow">Staying with you</p>${row(guest)}` : ""}<p class="eyebrow"${guest ? ' style="margin-top:10px"' : ""}>Around the village</p>${town.map(row).join("")}`;
}
// the dining table at a friend's house (or yours): pull out a chair and sit for a bit
function sitAtTable(){
  const seat = tableSeat(scene); if (!seat) return;
  hero.tx = seat[0]; hero.ty = seat[1]; hero.path = []; setTimeout(() => { hero.sitting = true; nodes.hero.classList.add("sit"); hero.dir = -1; }, 700);
}
// Hana's exercise class on the exercise lawn at the field: you join on the spare mat (once a day it earns a little)
let melEx = null;
function joinClass(){
  const c = classOn(dayKey()), m = localHM();
  if (awayOn(F).includes("hana") && m < 9*60) { speak(`No class this morning: Hana's away in ${TOWNS[tripOn(F).town].n} for the day.`, 4500); render(); return; }
  if (!c || m < c.from || m >= c.to) { const next = classOn(dayKey());
    speak(`Hana's classes are here at 8am: Pilates on Mondays and Wednesdays, Zumba on Tuesdays and Thursdays, Piloxing on Fridays and Saturdays.${next && m < next.from ? ` Today's is ${next.kind}.` : ""}`, 6000); render(); return; }
  melEx = [436, 482]; walkTo(436, 482); sfx("paper", true);
  if (isHere("hana")) setTimeout(() => npcSay("hana", pick([`A new face! Everybody, say hello. ${c.kind} time!`, "There's a mat for you, love. Follow me!", "You came! Good, good. Stretch first."])), 900);
  if (S.classDay !== dayKey()) { S.classDay = dayKey(); setTimeout(() => { gainXp(2); earn(2, `Hana's ${c.kind} class`); save(); }, 6000); }
  speak(`${c.kind} with Hana on the lawn. Arms up, and breathe.`, 4000); render();
}
// The field: feed the swans (once a day), a rest or a picnic on the blanket, the football pitch
function fieldSpot(id){
  const today = dayKey();
  if (id === "lake") {
    if (S.swans === today) { speak("The swans have had their crumbs today. They're pretending not to notice you.", 4000); render(); return; }
    S.swans = today; gainXp(1); sfx("chime"); [0, 300].forEach((d, k) => setTimeout(() => mprop("heart", 200 + k*60, 300, 1800), d));
    speak(pick(["You toss some crumbs. The swans glide over, very dignified, and eat every one.", "Crumbs for the swans. One honks politely. The other pretends it didn't."]), 5000);
    save(); render(); return;
  }
  if (id === "picnic") {
    hero.sitting = true; nodes.hero.classList.add("sit"); hero.dir = 1; sfx("paper", true);
    if (F.inv.picnic > 0) { addInv("picnic", -1); gainXp(4); act("cheer"); speak("Picnic time! Sandwiches, fruit, and {pet} guarding the basket.", 5000);
      ; }
    else speak(pick(["A rest on the picnic blanket. Clouds, a breeze, nothing to do for a minute.", "Sit, breathe, look at the lake. That counts as a break."]), 4500);
    save(); render(); return;
  }
  // the football pitch: Pip practises his penalties, if he's here
  speak(isHere("pip") ? "Pip's practising his penalties. He's very serious about it." : VILLAGE.pitch.line, 4000);
  save(); render();
}
// The playground: Pip runs over to play, if he's here
function playground(id){
  const v = VILLAGE[id];
  if (isHere("pip")) setTimeout(() => npcSay("pip", pick(["Push me on the swing? Higher!", "Watch me on the slide!", "Race you to the slide!"])), 1800);
  speak(v.line, 3500); render();
}
setTimeout(vineTick, 3000);
// dev builds only (the stub sets the flag): test scripts jump straight to a scene
if (window.__hbDevStub) window.__hbIntro = i => introAt(i, {replay: true, trainArt: () => trainRideArt(false), sfx});
if (window.__hbDevStub) window.__hbScene = (id, at) => setScene(id, at || (OUTDOOR.includes(id) ? [260, 330] : INNER[id] ? INNER[id].arrive : [260, 596]));
if (window.__hbDevStub) window.__hbOrder = (shop = "The Scoop Shack") => { S.orderAt = 0; scoopState(F).bikeOut = Date.now() + (globalThis.__hbOffset || 0); orderNote([{shop: "scoop", coins: 6, what: "a cone of mango"}], shop, false); };   // tests: an order note, and Tomo riding past
// dev builds only: test scripts read and nudge the save (the quest board tests give the backpack what a request needs)
if (window.__hbDevStub) window.__hbGame = {F: () => F, S: () => S, near: () => { const n = nearestVillager(); return n ? n.def.id + ":" + Math.round(Math.hypot(n.x - hero.x, n.y - hero.y)) : npcActors().map(([, e]) => e.def.id + "@" + Math.round(e.x) + "," + Math.round(e.y) + " hero " + Math.round(hero.x) + "," + Math.round(hero.y)).join(";"); }, give: (id, n) => { addInv(id, n); save(true); }, save: () => { resetNpcs(); save(true); }, render: () => render(true), handOver: who => offerHandOver(who), mail: () => ({paper: paperWaiting(), unread: unreadMail().map(m => m.id), atSpot}), items: () => ITEMS,
  notes: () => thanksMail().map(m => ({title: m.title, body: m.body}))};
/* ---------- Routine bonuses: 1 coin a checklist step, 5 for finishing a routine (a weekly one's step counts as
   finishing it). Each pays once a day: unticking and re-ticking earns nothing more. ---------- */
const ROUTINE_STEP = 1, ROUTINE_DONE = 8;
function routineCoins(r){
  S.rCoins = S.rCoins || {}; let n = 0;
  if (!r.weekly && !S.rCoins[r.list + ":" + r.item]) { S.rCoins[r.list + ":" + r.item] = true; n += ROUTINE_STEP; }
  if (r.complete && !S.rCoins[r.list + ":done"]) { S.rCoins[r.list + ":done"] = true; n += ROUTINE_DONE;
    act("cheer"); setTimeout(() => speak(`${r.name}, done for today! Bonus coins.`, 4000, true), 300); }
  if (n) { earn(n, r.complete ? `${r.name} done` : "routine step"); gainXp(r.complete ? 1 : 0); save(); }
  else mprop("sparkle", hero.x, hero.y - 60);
}

/* ---------- Bedtime: wind-down lines for the 45 minutes before bed; from bedtime until you're up, the village rests ---------- */
// (bedtime and getting-up time are yours to choose in Settings; the defaults are 11:45pm and 6am)
const clock = m => { m = ((m % 1440) + 1440) % 1440; const h = Math.floor(m/60) % 12 || 12; return `${h}${m % 60 ? ":" + String(m % 60).padStart(2, "0") : ""}${m < 12*60 ? "am" : "pm"}`; };
const nightM = () => { const m = localHM(); return m < pref("wake") ? m + 24*60 : m; };   // minutes since the morning you got up
const nightKey = () => localHM() < pref("wake") ? prevDay(dayKey()) : dayKey();
const bedNow = () => nightM() >= pref("bed");
function bedtimeTick(){
  const m = localHM(), nk = nightKey();
  const lock = F.bedLock !== false && bedNow() && F.bedSkip !== nk, el = $("bedLock");
  if (el.hidden === lock) {
    el.hidden = !lock; document.body.classList.toggle("bedlocked", lock);
    if (lock) { route = []; keys.clear(); openView = null; closePanel(); if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); }
  }
  if (lock) { const left = ((pref("wake") - m + 24*60) % (24*60)); $("bedWake").textContent = clock(pref("wake")); $("bedLockLeft").textContent = `Good morning in ${Math.floor(left/60)}h ${left % 60}m.`; }
}
// Wind-down, the 45 minutes before bed: a short, calm line about every 30 seconds. No chime, it fades on its own,
// and it waits while you're typing or have a panel open.
const WIND = ["Time to start winding down.", "Teeth, then skincare. No rush.", "Phone on charge, across the room.", "Dim the lights a little.",
  "Let the last thing go. It'll keep till morning.", "A glass of water by the bed.", "Slow breath in. Slower breath out.", "The village is tucking in too.",
  "Nothing else needs you tonight.", "Pyjamas on. Soft and cosy."];
let windAt = 0, windI = 0;
setInterval(() => {
  const n = nightM(), bed = pref("bed"); if (F.bedLock === false || n < bed - 45 || n >= bed || document.hidden) return;
  if (Date.now() - windAt < 28e3 || openView || !$("panel").hidden || (document.activeElement && /INPUT|TEXTAREA/.test(document.activeElement.tagName))) return;
  windAt = Date.now(); const left = bed - n;
  speak(left <= 15 ? `${left} minute${left === 1 ? "" : "s"} till bed. ${WIND[windI++ % WIND.length]}` : WIND[windI++ % WIND.length], 6000, true);
}, 5000);
// Settings: bedtime and getting up, and your daily water and steps
const prefOpts = (list, cur, label) => list.map(v => `<option value="${v}"${v === cur ? " selected" : ""}>${label(v)}</option>`).join("");
function prefsUI(){
  const range = (a, b, s) => Array.from({length: Math.floor((b - a)/s) + 1}, (_, i) => a + i*s);
  $("setBedAt").innerHTML = prefOpts(range(21*60, 25*60, 15), pref("bed"), clock); $("setWakeAt").innerHTML = prefOpts(range(5*60, 10*60, 15), pref("wake"), clock);
  $("setWater").innerHTML = prefOpts(range(1000, 3500, 250), pref("water"), v => `${(v/1000).toLocaleString()} litres`); $("setSteps").innerHTML = prefOpts(range(2000, 15000, 1000), pref("steps"), v => v.toLocaleString());
  $("setBedTxt").textContent = `Stay in bed from ${clock(pref("bed"))} to ${clock(pref("wake"))} (your pet nudges you 45 minutes before)`;
}
[["setBedAt", "bed"], ["setWakeAt", "wake"], ["setWater", "water"], ["setSteps", "steps"]].forEach(([id, k]) => { $(id).onchange = e => { F.prefs = {...(F.prefs || {}), [k]: +e.target.value}; save(true); prefsUI(); bedtimeTick(); }; });
// (asked inside the card: pop-up confirms are blocked inside the artifact frame, so confirm() always said no)
const bedAsk = on => { $("bedSure").hidden = !on; $("bedUp").hidden = on; };
$("bedUp").onclick = () => bedAsk(true);
$("bedNo").onclick = () => bedAsk(false);
$("bedYes").onclick = () => { bedAsk(false); F.bedSkip = nightKey(); save(); bedtimeTick(); speak("Okay, just this once. Be gentle with yourself.", 5000, true); };
// Backup: every part of the game this browser holds (the save, journal, jars, kind words, routines, letters, home) in one file
$("setBackup").onclick = async () => {
  const data = {}; Object.keys(localStorage).filter(k => k.startsWith("fox.")).forEach(k => { try { data[k] = JSON.parse(localStorage.getItem(k)); } catch { data[k] = localStorage.getItem(k); } });
  const file = JSON.stringify({game: "Honeybrook", exportedAt: new Date().toISOString(), data}, null, 1), name = `honeybrook-backup-${dayKey()}.json`;
  try { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([file], {type: "application/json"})); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    if (window.__hbDevStub) window.__download = {filename: name, size: file.length};   // (for the tests)
    $("setBackupNote").textContent = `Saved ${name}. Keep it somewhere safe.`; F.backupAt = Date.now(); save(); }
  catch { $("setBackupNote").textContent = "Couldn't save the backup just now."; }
};
$("setBed").onchange = e => { F.bedLock = e.target.checked; save(); bedtimeTick(); };
// nothing gets through while the village is asleep (keys included)
["keydown", "click", "pointerdown"].forEach(t => document.addEventListener(t, ev => { if (document.body.classList.contains("bedlocked") && !ev.target.closest("#bedLock")) { ev.stopPropagation(); ev.preventDefault(); } }, {capture: true}));

/* ---------- Trophies ---------- */
const trophyCtx = () => ({F, levels: LEVELS, levelIndex: level(), journal: journalCount(), water: waterGoal(), steps: stepGoal()});
function checkTrophies(){
  const {fresh, first, moved} = award(F, reached(trophyCtx()));
  if (!fresh.length) return;
  if (first || fresh.length > 3) F.trophyIntro = (F.trophyIntro || 0) + fresh.length;
  else fresh.forEach((t, i) => setTimeout(() => { sfx("yay"); flash(`New trophy: ${t.label}`); speak(`New trophy! ${t.label}. It's on a pedestal in the courtyard.`, 6000, true); }, i*6500));
  if (moved.length && !first) setTimeout(() => flash(`${moved.length === 1 ? "A trophy" : moved.length + " trophies"} stepped into the trophy book to make room.`), 4000);
  save(scene === "trophy");
}
setInterval(checkTrophies, 30000); setTimeout(checkTrophies, 4000);

/* ---------- taps on the map ---------- */
function toWorld(ev){ const r = $("map").getBoundingClientRect(); return [(ev.clientX - r.left - cam.ox)/cam.s, (ev.clientY - r.top - cam.oy)/cam.s]; }
svg.addEventListener("click", ev => {
  const pg = ev.target.closest("[data-pigeon]");
  if (pg) { pg.classList.remove("flap"); void pg.getBBox(); pg.classList.add("flap"); sfx("paper", true); setTimeout(() => pg.classList.remove("flap"), 1600); return; }
  if (S.sleep && scene === "room") { S.sleep = null; speak("Up we get!", 2500); save(true); }   // any tap wakes you
  const npc = ev.target.closest("[data-npc]");
  if (npc) { if (!(trolleyOn(F) && outside() && !townOf(scene) && trolleyOffer(npc.dataset.npc)) && !offerHandOver(npc.dataset.npc)) tapNpc(npc.dataset.npc); return; }
  const pet = ev.target.closest("[data-pet]");
  if (pet) { const c = companions(F).find(x => x.id === pet.dataset.pet); if (c) { const [x, y] = petAt(c); go(scene, x + 22, y + 8, null); petView = c.id; sfx("paper", true); render(); } return; }
  const kp = ev.target.closest("[data-keep]");
  if (kp) { keepSpot = kp.dataset.keep; sfx("paper", true); render(); return; }
  const ent = ev.target.closest("[data-ent]");
  if (ent && ent.dataset.ent === "chum") { sfx("purr"); if (Math.random() < .35) { hearts(2); speak("A happy wriggle. Treats and toys are in your backpack: tap the bag up top!", 4000); return; } hearts(2); speak(pick(["*leans into the pat*", "Happy {kind} noises!", "More pats please."]), 3000); return; }
  // the orchard's tree spots and the flower farm's beds and bushes: walk over, then the spot's card
  const ot = ev.target.closest("[data-tree], [data-bed], [data-bush]");
  if (ot && (scene === "orchard" || scene === "flowers")) { const where = ot.dataset.tree != null ? "tree" : ot.dataset.bed != null ? "bed" : "bush", i = +(ot.dataset.tree ?? ot.dataset.bed ?? ot.dataset.bush);
    const x = where === "tree" ? TREE_XS[i % 4] : FLOWER_XS[i % 4], y = where === "tree" ? TREE_ROWS[Math.floor(i/4)] + 20 : where === "bush" ? BUSH_Y + 18 : BED_ROWS[Math.floor(i/4)] + 20;
    go(scene, x, y, () => { atSpot = where; orAt = {where, i}; orView = "spot"; sfx("paper", true); render(); }); return; }
  const vt = ev.target.closest("[data-vine]");
  if (vt && scene === "vineyard") { const [r, i] = vt.dataset.vine.split("-").map(Number), p = vineSpot(r, i);
    go("vineyard", p.x, p.y, () => { atSpot = "vine"; vyAt = {r, i}; vyView = "vine"; sfx("paper", true); render(); }); return; }
  const ts = ev.target.closest("[data-tspot]");
  if (ts && scene === "terrace") { go(scene, +ts.dataset.x, +ts.dataset.y, () => terraceSpot(ts.dataset.tspot)); return; }
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
    return; }
  if (scene === "terrace" && ev.target.closest("[data-exit]")) { const ex = ev.target.closest("[data-exit]").dataset.exit; if (ex === "vineyard") go("vineyard", VILLAGE.terrace.door[0], VILLAGE.terrace.door[1] + 10, null); else go("terrace", 56, 456, () => setScene("wineshop", [440, 560])); return; }
  if (ev.target.closest("[data-exit]")) { if (INNER[scene]) { const I = INNER[scene]; go(I.parent, I.door[0] + 30, I.door[1] + 20, null); } else go(outdoorOf(scene), VILLAGE[scene].door[0], VILLAGE[scene].door[1] + 10, null); return; }
  const ghd = ev.target.closest("[data-gh]");
  if (ghd && scene === "farm") { go("farm", 260, 132, () => { if (owns(F, "greenhouse")) setScene("greenhouse", INNER.greenhouse.arrive); else { goalView = "greenhouse"; sfx("paper", true); speak("The old shed. With a bit of glass, it would make a lovely greenhouse...", 4000); render(); } }); return; }
  const ms = ev.target.closest("[data-millspot]");
  if (ms && scene === "mill" && ms.dataset.millspot === "photo") { go("mill", 150, 260, () => { millOpen = "story"; atSpot = "photo"; sfx("paper", true); ctx(); }); return; }
  // round 154: upstairs (art/millup.js), and the stairs up from the press
  if (ms && scene === "mill" && ms.dataset.millspot === "stairs") { go("mill", INNER.millup.door[0], INNER.millup.door[1], () => setScene("millup", INNER.millup.arrive)); return; }
  if (ms && scene === "millup") { const k = ms.dataset.millspot, at = {bench: [400, 280], shop: [214, 600], tasting: [260, 440], workshop: [410, 600]}[k] || [260, 470];
    go("millup", at[0], at[1], () => { millOpen = k; atSpot = k; if (k === "tasting") tstSt = null; sfx("paper", true); ctx(); }); return; }
  if (ms && scene === "mill") { go("mill", 300, 560, () => { millOpen = true; atSpot = "press"; sfx("paper", true); ctx(); }); return; }
  const gb = ev.target.closest("[data-ghbed]");
  const gpt = ev.target.closest("[data-ghpot]");   // round 155: the herb pots along the glass
  if (gpt && scene === "greenhouse") { const i = +gpt.dataset.ghpot, p = GH_POT_AT[i]; go("greenhouse", p.x, 226, () => { ghBed = "p" + i; atSpot = "ghbed"; sfx("paper", true); ctx(); }); return; }
  if (gb && scene === "greenhouse") { const i = +gb.dataset.ghbed, p = GH_BED_AT[i]; go("greenhouse", p.x + p.w/2, p.y + p.h + 22, () => { ghBed = i; atSpot = "ghbed"; sfx("paper", true); ctx(); }); return; }
  const pt = ev.target.closest("[data-plot]");
  if (pt) { const i = +pt.dataset.plot, p = PLOTS[i]; go("farm", p.x + p.w/2, p.y + p.h + 18, () => { selPlot = i; atSpot = "plot"; ctx(); const s = F.plots[i]; speak(!s || !s.crop ? "Empty plot. What shall we grow?" : !s.wateredAt ? "Thirsty seeds!" : growth(s) >= 1 ? "Ready to pick!" : "Growing nicely.", 3000); }); return; }
  const [x, y] = toWorld(ev);
  // Fingers miss small people: a tap close to a villager or messenger counts as tapping them.
  const near = npcActors().map(([n, e]) => [n, Math.hypot(e.x - x, (e.y - 30) - y)]).filter(([, d]) => d < 34).sort((a, b) => a[1] - b[1])[0];
  if (near) { if (!(trolleyOn(F) && outside() && !townOf(scene) && trolleyOffer(near[0].dataset.npc)) && !offerHandOver(near[0].dataset.npc)) tapNpc(near[0].dataset.npc); return; }
  route = []; atSpot = null;
  if (qnOpen) { qnOpen = false; journal(); }   // tapping the map to wander folds the note away
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
  if (outside()) return Object.keys(VILLAGE).find(k => VILLAGE[k].scene === scene && Math.hypot(VILLAGE[k].door[0] - hero.x, VILLAGE[k].door[1] - hero.y) < 22) || null;
  if (scene === "farm") return null;
  const list = [...stationsOf(scene), scene !== "market" ? {id:"board", tx:260, ty:200} : null].filter(Boolean);
  const s = list.find(s => Math.hypot(s.tx - hero.x, s.ty - hero.y) < 26); return s ? s.id : null;
}
const nodes = {hero: $("hero"), chum: $("mchum")};
function placeNode(n, e){
  n.setAttribute("transform", `translate(${e.x.toFixed(1)} ${e.y.toFixed(1)})`);
  n.firstElementChild.setAttribute("transform", `scale(${e.dir} 1)`);
  n.classList.toggle("walk", e.moving);
}
// Camera: when the map box is narrower than the 520x640 scene (phone, full screen), show the full height and pan
// left/right to follow the player. Overlays (bubbles, floating icons) convert scene coords with cam.
// Camera. Screen = scene * cam.s + (cam.ox, cam.oy). On a phone (map box narrower than the 520x640 scene) the camera
// follows the player at full height; "zoomed out" (cam.fit) shows the whole map at once. Panning slides the already-drawn
// SVG with a GPU transform: re-filtering the hand-drawn scene every frame made phones flicker and drop outlines.
const cam = {x: 0, s: 1, ox: 0, oy: 0, top: 0, snap: true, key: "", fit: false, canFollow: false};
try { cam.fit = localStorage.getItem("fox.zoom") === "out"; } catch {}
function updateCam(dt){
  const m = $("map"), cw = m.clientWidth, ch = m.clientHeight; if (!cw || !ch) return;
  cam.canFollow = cw/ch < W/HH - .005;
  if (cam.canFollow && !cam.fit) {
    const fx = hero.x;   
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
  if (el.hidden) { el.__at = ""; return; }
  // round 193: only re-measure when something's moved or the words changed (measuring every frame made the game stutter)
  const at = `${Math.round(ex)},${Math.round(ey)},${off},${forceBelow ? 1 : 0},${cam.s},${Math.round(cam.ox)},${Math.round(cam.oy)},${cam.top}`, txt = el.innerHTML;
  if (el.__at === at && el.__txt === txt) return; el.__at = at; el.__txt = txt;
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
    hero.path = [];
    let nx = clamp(hero.x + dx, b[0], b[2]), ny = clamp(hero.y + dy, b[1], b[3]);
    if (outside() && blocked(scene, nx, ny)) { if (!blocked(scene, nx, hero.y)) ny = hero.y; else if (!blocked(scene, hero.x, ny)) nx = hero.x; else { nx = hero.x; ny = hero.y; } }
    hero.tx = nx; hero.ty = ny;
  }
  const arrived = stepTo(hero, (keys.size ? 190 : 220)*(outside() && !sup && !townOf(scene) ? rideSpeed(F) : 1), dt);   // the scooter and car (big goals) are faster
  if (arrived && !keys.size && hero.path && hero.path.length) { const n = hero.path.shift(); hero.tx = n[0]; hero.ty = n[1]; hero.moving = true; }
  else if (arrived && !keys.size && (hero.wasMoving || hero.force)) {
    hero.force = false;
    if (route.length && route[0].scene === scene) { const l = route.shift(); if (l.fn) l.fn(); else { atSpot = null; render(); } if (route.length && route[0].scene === scene) nextLeg(); }
    else if (!route.length) {
      const n = nearSpot();
      if (n) { if (outside()) { const v = VILLAGE[n]; if (v.spot) arriveVillageSpot(n); else go(n, 260, 560, null); } else arriveSpot(n); }
      else if (!outside() && scene !== "farm" && !INNER[scene] && hero.y > 592) go(outdoorOf(scene), VILLAGE[scene].door[0], VILLAGE[scene].door[1] + 10, null);
      else if (INNER[scene] && ((Math.abs(hero.x - INNER[scene].exit[0]) < 12 && Math.abs(hero.y - INNER[scene].exit[1]) < 56) || (hero.y > 592 && Math.abs(hero.x - 260) < 60))) { const I = INNER[scene]; go(I.parent, I.door[0] + 30, I.door[1] + 20, null); }
      else if (scene === "farm" && hero.y > 592 && Math.abs(hero.x - 260) < 50) go("base", VILLAGE.farm.door[0], VILLAGE.farm.door[1] + 10, null);
    }
  }
  if (S.cruise && (scene !== "shore" || Date.now() > S.cruise.until)) endCruise();
  { const rd = outside() && !townOf(scene) ? ride(F) : "walk", drive = rd === "car" && hero.moving && !sup, carry = (drive || rd === "bike") && hero.moving && !sup;
    nodes.hero.classList.toggle("trolley", trolleyOn(F) && outside() && !townOf(scene) && !sup);
    nodes.hero.classList.toggle("scoot", rd === "scooter" && hero.moving && !sup); nodes.hero.classList.toggle("biking", rd === "bike" && hero.moving && !sup);
    if (rd === "bike" && F.bike && nodes.hero.dataset.bikeCol !== F.bike.col) { nodes.hero.dataset.bikeCol = F.bike.col; nodes.hero.querySelectorAll(".rideBike .bikeArt > path").forEach(p => p.style.stroke = F.bike.col); } nodes.hero.classList.toggle("drive", drive);
    // the pet rides along in the convertible (or in the hire bike's front basket), and hops out beside the player
    // when they stop
    if (!carry && hero.wasDriving) { chum.x = chum.tx = hero.x - hero.dir*22; chum.y = chum.ty = hero.y + 3; }
    hero.wasDriving = carry; }
  if (sup) { if (scene !== "shore" || Date.now() > sup.until) endPaddle(true); else if (!sup.out && hero.x < 160) sup.out = true; else if (sup.out && hero.tx > 170) endPaddle(false); }
  if (melEx && (scene !== "field" || Math.hypot(hero.tx - melEx[0], hero.ty - melEx[1]) > 4 || !classOn(dayKey()) || localHM() >= classOn(dayKey()).to)) melEx = null;
  nodes.hero.classList.toggle("exercise", !!melEx && !hero.moving);
  if (hero.sitting && (hero.moving || (scene !== "trophy" && scene !== "field" && scene !== "shore" && scene !== "bay" && scene !== "scoopshop" && !DINING[scene]))) { hero.sitting = false; nodes.hero.classList.remove("sit"); }
  hero.wasMoving = hero.moving;
  const inRoom = scene === "room", MB = [PET_BED[0], PET_BED[1] + 2];
  if (inRoom) { chum.tx = MB[0]; chum.ty = MB[1]; stepTo(chum, 110, dt); }
  const sleeping = inRoom ? !chum.moving && Math.hypot(chum.x - MB[0], chum.y - MB[1]) < 6 : Date.now() < mapleNap;
  nodes.chum.classList.toggle("sleep", sleeping);
  if (inRoom) {}
  else if (sup && scene === "shore") { chum.tx = 196; chum.ty = 486; stepTo(chum, 120, dt); }
  else if (!sleeping) { chum.tx = hero.x - hero.dir*24; chum.ty = hero.y + 3; const d = Math.hypot(chum.tx - chum.x, chum.ty - chum.y); stepTo(chum, Math.max(120, d*3.2)*SPECIES[speciesOf(F)].pace, dt); if (!chum.moving) chum.dir = hero.dir; }   // (pace: a tortoise ambles, a rabbit bounds)
  else chum.moving = false;
  tickNpcs(dt); updateCam(dt); drawTableware();
  placeNode(nodes.hero, hero); placeNode(nodes.chum, chum);
  nodes.chum.style.visibility = cruisingNow() || hero.wasDriving ? "hidden" : "";
  // On the treadmill: a gentle walk in place.
  if (scene === "office" && atSpot === "treadmill" && !route.length && Math.abs(hero.x - hero.tx) < 2) { nodes.hero.classList.add("walk"); hero.dir = 1; }
  const order = [[nodes.hero, hero], [nodes.chum, chum], ...npcActors(), ...stallFronts()].sort((a, b) => a[1].y - b[1].y);
  const g = $("actors"); order.forEach(([n]) => { if (g.lastElementChild !== n) g.appendChild(n); });
  const close = Math.hypot(chum.x - hero.x, chum.y - hero.y) < 60;
  bubbleAt($("speech"), close ? (chum.x*0.35 + hero.x*0.65) : chum.x, close ? Math.min(chum.y, hero.y) : chum.y, close ? 76 : (sleeping ? 18 : 30));
  bubbleAt($("melSay"), hero.x, hero.y, 70);
  requestAnimationFrame(frame);
}

/* =================== WIRING =================== */
document.querySelectorAll("[data-track]").forEach(b => b.onclick = () => openTracker(b.dataset.track));
$("paperSave").onclick = () => { const v = $("paperNameIn").value.trim(); F.paperName = v; $("paperNameIn").value = ""; $("paperNameIn").placeholder = paperName(); sfx("paper"); speak(v ? `Hot off the press: ${v}!` : "Back to The Morning Crier.", 4000); save(); };
$("paperNameIn").placeholder = paperName();
$("nameSave").onclick = () => { const v = $("nameIn").value.trim(); if (v) { F.name = v.slice(0, 20); $("nameIn").value = ""; act("cheer"); speak(`Hi! I'm ${F.name} now.`, 4000); save(); } };
$("meSave").onclick = () => { const v = $("meIn").value.trim(); if (v) { F.me = {...(F.me || {}), name: v.slice(0, 24)}; $("meIn").value = ""; sfx("chime"); speak(`Nice to meet you, ${F.me.name}.`, 4000); save(); } };
$("meLook").onclick = () => { sfx("paper", true); openSetup(F, {lookOnly: true, done: () => { applyWear(); save(true); speak("A new look. Very you.", 3500); }}); };
$("pet").onclick = () => { sfx("purr"); hearts(2); speak(pick(["*leans into the pat*", "Happy {kind} noises!", "More pats please.", "You're my favourite human."]), 3000); };

document.querySelectorAll("[data-ico]").forEach(el => el.insertAdjacentHTML("afterbegin", icon(el.dataset.ico, +el.dataset.size || 20)));
$("pclose").onclick = closePanel;
// Speech bubbles close with a tap (the next thing anyone says brings them back)
// Tapping a speech bubble closes it, and if someone's standing under it (Penny with the post, a villager), the tap
// reaches them too: a bubble shouldn't make the person beneath it untappable.
["speech", "npcSay", "melSay"].forEach(id => $(id).addEventListener("click", ev => { ev.stopPropagation(); $(id).hidden = true;
  const under = document.elementFromPoint(ev.clientX, ev.clientY), who = under && under.closest("#actors [data-npc], #actors [data-ent]");
  if (who) who.dispatchEvent(new MouseEvent("click", {bubbles: true, clientX: ev.clientX, clientY: ev.clientY})); }));
$("zoomBtn").onclick = () => toggleZoom();
$("setMusic").onchange = e => setMusic(e.target.checked);
$("setVol").oninput = e => setMusicVol(+e.target.value);
$("setTest").onclick = () => { unlockAudio(); setTimeout(() => { alarm(); $("setTestNote").textContent = audioRunning() ? "Sound is on. If you heard nothing, check the volume and the silent switch." : "Your browser is still blocking sound. Tap anywhere on the map, then try again."; }, 120); };
$("setTitle").onclick = () => { closePanel(); save(); flushSaves(); showTitle(); };
$("setStory").onclick = () => { closePanel(); openIntro({replay: true, trainArt: () => trainRideArt(false), sfx}); };
$("setQuiet").onchange = e => { F.quietEvening = e.target.checked; save(true); };
$("setSfx").onchange = e => { setSfx(e.target.checked); if (e.target.checked) sfx("coin"); };
["pointerdown", "keydown"].forEach(t => document.addEventListener(t, () => { qnQuietUntil = 0; }, {capture: true, once: true}));
document.querySelectorAll("[data-open]").forEach(b => b.onclick = () => { openView = openView === b.dataset.open ? null : b.dataset.open; if (openView === "bag") { giveMode = null; bag(); } ctx(); });   // (the backpack checks who's nearby as it opens)
initNotebook({windDown, water:() => ({ml: S.waterMl || 0, goal: waterGoal(), glass: GLASS}), steps:() => ({n: S.steps, goal: stepGoal()}),
  addWater:ml => A.water(ml), setWater, setSteps, paperName, markRead, agentName, onClose:() => render()});
// the add-a-task form on the quest board
$("addForm").onsubmit = e => { e.preventDefault(); if (addMine($("addTitle").value, $("addKind").value === "daily")) { $("addTitle").value = ""; $("addTitle").focus(); } };
setStallOwned(() => ({cocoa: owns(F, "cocoa"), millshop: owns(F, "millshop"), cc_cart: !!(F.cocoa && F.cocoa.up && F.cocoa.up.cart), cc_workshop: !!(F.cocoa && F.cocoa.up && F.cocoa.up.workshop)}));   // the Cocoa Room's market cart and Saturday workshop, once bought
initNpcs({sfx, story: id => tellStory(F, id, addInv), storyReady: id => !!storyReady(F, id), flash, quiet: () => quietNow(), chatted:n => { if (!S.chats.includes(n)) { S.chats.push(n); save(); } }, scene:() => scene, bounds, hero, sup: () => sup, F:() => F, S:() => S, save:() => save(), facts, bubble:bubbleAt, unreadMail,
  openMail:item => openMail(item), gift:id => { addInv(id, 1); flash(`Auntie Lin gave you ${ITEMS[id].n.toLowerCase()}`); save(); }});
measureHud();
initTrips(() => F);
setCloseFriends(() => QB.friendIds(F, QB.TRIP_HEARTS));   // Sunday lunch and Christmas lunch: your closest friends
setGhTools(() => F.tools || {});
// Pick up where the player left off (round 105): the same game day, back on the screen they closed the game on (a new day, they
// wake up at home as usual). F.where is kept by save().
{ const w = !globalThis.__hbNoResume && F.where, ok = w && w.day === dayKey() && w.scene && w.scene !== scene && (OUTDOOR.includes(w.scene) || ROOMS[w.scene] || INNER[w.scene] || VILLAGE[w.scene]) && !["guestroom", "room"].includes(w.scene) && (!townOf(w.scene) || !!tripOn(F));
  if (ok) { scene = w.scene; hero.x = hero.tx = w.x; hero.y = hero.ty = w.y; hero.path = []; chum.x = chum.tx = w.x - 22; chum.y = chum.ty = w.y + 2; } }
dressPet();
// Phase 5: the welcome screen first (dev builds skip it unless ?title=1), then the game, or the story and the setup
// card for a new one. After switching slots the page reloads straight into the game.
function showTitle(){
  openTitle({player, remote, needAccount: !window.__hbDevCloud, checking: !window.__hbDevCloud && !player,
    play: () => whenSynced(needSetup), save: () => { save(); flushSaves(); },
    signIn: () => CL.signInGoogle().catch(() => speak("Sign-in didn't go through. You can keep playing; your game saves in this browser.", 5000)),
    signOut: () => CL.signOutPlayer(),
    mail: (what, email, pw) => what === "reset" ? CL.emailReset(email) : what === "up" ? CL.emailSignUp(email, pw) : CL.emailSignIn(email, pw),
    wipeCloud: n => { if (player) CL.SLOT_DOCS.forEach(d => CL.slotCollection(player.uid, n).doc(d).delete().catch(() => {})); },
    reload: skip => { leaving = true; try { if (skip) sessionStorage.setItem("hb.skipTitle", "1"); } catch {} location.reload(); },
    story: () => openIntro({replay: true, trainArt: () => trainRideArt(false), sfx})});
}
{ let skip = false; try { skip = !!sessionStorage.getItem("hb.skipTitle"); sessionStorage.removeItem("hb.skipTitle"); } catch {}
  if (skip || (window.__hbDevStub && !/[?&]title=1/.test(location.search))) needSetup(); else showTitle(); }
render(true);
if (F.gift) setTimeout(() => speak("A welcome gift! Seeds are in your backpack 🌷", 5000), 1200);
requestAnimationFrame(frame);
initDb();
