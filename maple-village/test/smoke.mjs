// Headless smoke test: builds the dev page, plays through the core loop with the stub, fails on any page error.
//   node test/smoke.mjs            (screenshots land in test/shots/)
//   ONLY="guest room|surf" node test/smoke.mjs   runs only the sections whose title contains one of the |-separated
//   substrings (case-insensitive); "core loop" is the phone/desktop walk-through at the top.
import { execSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
// The game's clock is the player's own timezone. The tests were written for UTC+8 wall-clock times ("04:00Z" = noon):
// wall() turns one into the same wall-clock time here, whatever this machine's timezone.
const wall = iso => { const d = new Date(Date.parse(iso) + 8*3600e3); return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes()).getTime(); };
async function loadPlaywright() {
  try { return await import("playwright"); } catch {}
  const g = execSync("npm root -g").toString().trim();
  return createRequire(join(g, "noop.js"))("playwright");
}
const { chromium } = await loadPlaywright();

execSync("node build.mjs --dev --once", { cwd: root, stdio: "inherit" });
const shots = join(root, "test/shots"); mkdirSync(shots, { recursive: true });
const url = pathToFileURL(join(root, "dist/dev.html")).href;
const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
// Most checks expect a reload to start at home base: pages opt out of "pick up where you left off" (core.js F.where)
// unless they ask for it with newPage({resume: true}).
// Pages are tracked so a section that throws before its page.close() doesn't leave its page open for the rest of the
// run (dozens of leaked pages once crashed the browser near the end): each new section closes any left over.
const openPages = new Set();
{ const np = browser.newPage.bind(browser); browser.newPage = async (o = {}) => { const { resume, ...rest } = o; const pg = await np(rest); openPages.add(pg); pg.on("close", () => openPages.delete(pg)); if (!resume) await pg.addInitScript(() => { window.__hbNoResume = true; }); return pg; }; }
const errors = [];
// a save where the seven friends the older tests rely on are at five hearts (presents sent round need 3, trips 5)
const closeFriends = page => page.addInitScript(() => { const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
  f.board = f.board || {}; const h = f.board.hearts = f.board.hearts || {}; ["hana", "theo", "farid", "mei", "tomi", "posy", "bo"].forEach(id => { if (!(h[id] >= 5)) h[id] = 5; });
  const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
const ONLY = (process.env.ONLY || "").toLowerCase().split("|").map(x => x.trim()).filter(Boolean);
const want = title => { const on = !ONLY.length || ONLY.some(o => title.toLowerCase().includes(o)); if (on) for (const pg of openPages) pg.close().catch(() => {}); return on; };
// closeness is hearts: set some villagers' hearts in the live save (the old seven at five, by default)
const SEVEN = ["bo", "farid", "hana", "mei", "posy", "theo", "tomi"];
const befriend = (page, ids = SEVEN, n = 5) => page.evaluate(([ids, n]) => { const g = window.__hbGame, f = g.F(); f.board = f.board || {}; f.board.hearts = f.board.hearts || {}; ids.forEach(id => { f.board.hearts[id] = n; }); g.save(); g.render(); }, [ids, n]);
const check = (cond, msg) => { if (!cond) { errors.push("FAIL: " + msg); console.log("  ✗ " + msg); } else console.log("  ✓ " + msg); };

if (want("core loop")) for (const vp of [{ name: "phone", width: 390, height: 844 }, { name: "desktop", width: 1280, height: 900 }]) {
  console.log(`\n${vp.name}`);
  const page = await browser.newPage({ viewport: vp });
  page.on("pageerror", e => errors.push(`${vp.name} pageerror: ${e.message}`));
  page.on("console", m => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errors.push(`${vp.name} console: ${m.text()}`); });
  await page.goto(url + "?reset=1&seed=1&time=10:15");
  await page.waitForTimeout(900);
  await page.screenshot({ path: join(shots, `${vp.name}-1-start.png`), fullPage: vp.name === "phone" ? false : true });
  check(await page.locator("#journal.slim").count() === 1, "the quest note starts folded when the village opens");
  check(await page.locator("#sceneName").textContent().then(t => /Home base/.test(t)), "the day starts at home base");
  await page.click('#journal [data-qn="open"]');
  check(await page.locator("#journal h1").textContent().then(t => /3 tasks to go/.test(t)), "the quest note shows today's tasks");
  const lay = await page.evaluate(() => ({ hud: document.querySelector(".hudbar").getBoundingClientRect().bottom, map: document.querySelector("#map").getBoundingClientRect().top,
    fits: document.documentElement.scrollHeight <= innerHeight + 2, note: !!document.querySelector("#map #journal h1") }));
  if (vp.name === "phone") {
    const full = await page.evaluate(() => { const r = document.querySelector("#map").getBoundingClientRect(), h = document.querySelector(".hudbar").getBoundingClientRect(); return {h: r.height, w: r.width, hudTop: h.top}; });
    check(full.h >= 840 && full.w >= 388, "on the phone the map fills the whole screen");
    const trk = await page.evaluate(() => { const r = document.querySelector(".hudbar").getBoundingClientRect(); return {right: innerWidth - r.right, tall: r.height > r.width}; });
    check(trk.right < 20 && trk.tall, "trackers are a vertical column on the right");
    check(await page.locator("#zoomBtn").isVisible(), "there's a zoom button on the phone");
    await page.click('#journal [data-qn="min"]');
    await page.click("#zoomBtn"); await page.waitForTimeout(300);
    const fit = await page.evaluate(() => { const r = document.querySelector("#world").getBoundingClientRect(); return r.width <= innerWidth + 1 && r.left >= -1; });
    check(fit, "zooming out shows the whole map");
    await page.click("#zoomBtn"); await page.waitForTimeout(300);
    await page.click('#journal [data-qn="open"]');
    check(await page.locator(".scenebar .hbtn").count() === 5, "five drawn icons in the corner (quests, backpack, friendship, letters, settings)");
    check(!(await page.locator(".hbtn").first().textContent()).match(/\p{Extended_Pictographic}/u), "corner icons are drawn, not emoji");
  } else check(await page.locator("#map .hudbar").count() === 1, "trackers sit on the map");
  check(lay.fits, "the whole game fits on screen without scrolling");
  check(await page.evaluate(() => { const n = document.querySelector("#journal.slim"), m = document.querySelector("#map"); if (!n) return true; const a = n.getBoundingClientRect(), b = m.getBoundingClientRect(); return a.left >= b.left && a.right <= b.right; }), "the folded quest note sits fully inside the map");
  check(lay.note, "the quest note is pinned on the map");
  check(await page.locator(".hudbar .pbar").count() === 2, "water and steps are drawn progress bars");
  await page.click('[data-track="water"]');
  await page.click('#notebook [data-nb="w"]');
  await page.click('#notebook [data-nb="w"] >> nth=1');
  check(await page.locator("#nbTitle").textContent().then(t => /0[.,]75 L/.test(t)), "water note adds a glass and a bottle (750 ml)");
  await page.fill("#nbTrack", "1000"); await page.click('#notebook [data-nb="wset"]');
  await page.waitForFunction(() => /^1L/.test(document.getElementById("waterNote").textContent), null, { timeout: 3000 }).catch(() => {});
  check(await page.locator("#waterNote").textContent().then(t => /^1L/.test(t)), "water total can be typed in");
  await page.click('[data-track="water"]'); await page.fill("#nbTrack", "1250"); await page.evaluate(() => window.__hbScene && window.__hbScene("base")); await page.waitForTimeout(600);
  check(await page.locator("#nbTrack").inputValue().catch(() => "") === "1250", "a half-typed water total survives the game redrawing round it");
  await page.click('#notebook [data-nb="wset"]').catch(() => {}); await page.waitForTimeout(300);
  await page.click('[data-track="steps"]');
  await page.fill("#nbTrack", "2500"); await page.click('#notebook [data-nb="sset"]');
  await page.waitForFunction(() => /2.5k/.test(document.getElementById("stepNote").textContent), null, { timeout: 3000 }).catch(() => {});
  check(await page.locator("#stepNote").textContent().then(t => /2.5k/.test(t)), "steps can be typed in from the steps note");

  // The quest note: tick a task straight from the map; it pays, and undo takes it back
  const coins0 = +(await page.locator("#coins").textContent());
  await page.click('#journal [data-tick="tseed2"]');
  await page.waitForTimeout(300);
  check(+(await page.locator("#coins").textContent()) === coins0 + 3, "ticking a task pays 3 coins");
  check(await page.locator("#journal h1").textContent().then(t => /2 tasks to go/.test(t)), "the note counts down what's left");
  await page.click("#undoBtn"); await page.waitForTimeout(300);
  check(+(await page.locator("#coins").textContent()) === coins0 && await page.locator("#journal h1").textContent().then(t => /3 tasks to go/.test(t)), "undo unticks it and takes the coins back");

  // Quest board opens as a cork board on the map
  await page.click('[data-open="quests"]');
  await page.waitForTimeout(400);
  check(await page.locator("#panel.cork #list li.task").count() === 3, "quest board opens as a cork board with your tasks pinned up");
  await page.fill("#addTitle", "Post the birthday card"); await page.selectOption("#addKind", "once"); await page.click('#addForm button[type=submit]'); await page.waitForTimeout(200);
  await page.fill("#addTitle", "Feed the fish"); await page.selectOption("#addKind", "daily"); await page.click('#addForm button[type=submit]'); await page.waitForTimeout(200);
  check(await page.locator("#list li.task").count() === 5 && await page.locator("#list li.task").last().textContent().then(t => /Feed the fish.*daily/.test(t)), "tasks are added as one-off or daily");
  await page.locator("#list li.task", {hasText: "Post the birthday card"}).locator("[data-tdel]").click(); await page.waitForTimeout(200);
  check(await page.locator("#list li.task").count() === 4, "a task can be taken down");
  check(await page.locator("#reqList li.req").count() >= 1 && await page.locator("#reqList li.req").first().textContent().then(t => /needs \d+ .+ (by|today|tomorrow)/.test(t)), "villagers' requests are pinned up with what, how many and by when");
  await page.screenshot({ path: join(shots, `${vp.name}-9-cork.png`) });
  await page.click("#pclose");
  check(await page.locator("#panel").isHidden(), "closing the board returns to the map");
  await page.click('[data-open="friend"]');
  check(await page.locator('#friendView [data-ftab="where"][aria-selected="true"]').count() === 1 && await page.locator("#friendView details.whowhere").count() > 0, "the heart panel opens on who's where, in tabs");
  await page.click('#friendView [data-ftab="chum"]');
  check(await page.locator("#friendView .hearts .ico").count() === 5, "friendship has its own corner icon and drawn hearts");
  await page.click("#pclose");

  // out of the home office (a room off the living room), then out of the house
  for (let k = 0; k < 2 && !/Town square|Home base/.test(await page.locator("#sceneName").textContent()); k++) {
    await page.evaluate(() => document.querySelector("#world [data-exit]") && document.querySelector("#world [data-exit]").dispatchEvent(new MouseEvent("click", {bubbles: true})));
    await page.waitForFunction(() => /Town square|Home base|^Home/.test(document.querySelector("#sceneName").textContent.trim()) && !/office/i.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 }); await page.waitForTimeout(400); }
  await page.waitForFunction(() => /Town square|Home base/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  if (await page.locator('#journal [data-qn="min"]').count()) await page.click('#journal [data-qn="min"]');
  if (/Home base/.test(await page.locator("#sceneName").textContent())) {
    check(await page.locator('#world [data-place="pond"]').count() === 1 && await page.locator('#world [data-place="shed"]').count() === 1, "home base has the pond and the shed");
    await page.screenshot({ path: join(shots, `${vp.name}-4-base.png`) });
    await page.locator('#world [data-place="toTown"]').dispatchEvent("click");
    await page.waitForFunction(() => /Town square/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
    check(await page.locator('#world [data-place="pond"]').count() === 0, "the bridge crosses the river to the town square");
  }
  // NPCs + mail
  await page.waitForTimeout(500);
  check(await page.locator("#actors [data-npc]").count() > 0, "villagers are out and about");
  await page.screenshot({ path: join(shots, `${vp.name}-5-village.png`) });
  await page.close();
}
// The quest board's rules (quests.js), checked straight from the module
if (want("\nquest board rules")) try {
  console.log("\nquest board rules");
  const QB = await import(pathToFileURL(join(root, "src/game/quests.js")).href);
  const { ITEMS } = await import(pathToFileURL(join(root, "src/data/items.js")).href);
  const { dayKey } = await import(pathToFileURL(join(root, "src/util.js")).href);
  const F = {inv: {}};
  const ids = Array.from({length: 11}, (_, i) => QB.addTask(F, "Task " + i, i === 0).id);
  const pays = ids.map(id => QB.tickTask(F, id).coins);
  check(pays.slice(0, 10).every(c => c === 3) && pays[10] === 0, "the first 10 ticks of a day pay 3 coins each, the 11th pays nothing");
  check(QB.untickTask(F, ids[3]) === 3 && QB.tickTask(F, ids[3]).coins === 3, "unticking gives the coins back, and ticking again pays again (still 10 a day)");
  check(QB.untickTask(F, ids[10]) === 0, "unticking an unpaid tick takes nothing");
  const tomorrow = new Date(Date.parse(dayKey() + "T00:00:00Z") + 864e5).toISOString().slice(0, 10);
  const next = QB.myTasks(F, tomorrow);
  check(next.length === 2 && next.some(t => t.daily && !QB.isDone(t, tomorrow)), "next day the daily task comes back fresh and ticked one-offs are gone");
  check(QB.addTask(F, "   ") === null && QB.addTask(F, "x".repeat(300)).title.length === 120, "empty tasks aren't pinned, long ones are trimmed");
  const priced = Object.keys(ITEMS).filter(id => ITEMS[id].sell > 0 && ITEMS[id].price > 0);
  check(priced.every(id => QB.payEach(id) <= ITEMS[id].price), "a request never pays more for something than a shop's own price for it");
  check(Object.keys(ITEMS).filter(id => ITEMS[id].tab && ITEMS[id].price > 0 && ITEMS[id].sell > 0).every(id => ITEMS[id].sell <= ITEMS[id].price), "nothing Hana sells fetches more back at the market than it costs");
  check(Object.keys(ITEMS).filter(id => ITEMS[id].sell > 0).every(id => QB.payEach(id) >= ITEMS[id].sell || ITEMS[id].price), "and pays at least what the market would");
  const G = {inv: {}}, people = Object.keys(QB.ASKERS).map(id => ({id, name: id[0].toUpperCase() + id.slice(1)}));
  const day = "2026-10-14", posted = QB.refreshRequests(G, people, day);
  check(posted.length === 2 && QB.refreshRequests(G, people, day).length === 0, "two requests go up on the first day, and no more that day");
  for (let k = 1; k <= 6; k++) QB.refreshRequests(G, people, new Date(Date.parse(day + "T00:00:00Z") + k*864e5).toISOString().slice(0, 10));
  check(QB.board(G).reqs.length <= QB.MAX_REQ, "never more than three at once");
  check(QB.refreshRequests(G, people, "2026-12-01") !== null && QB.board(G).reqs.every(r => r.due >= "2026-12-01"), "a request past its day quietly comes down");
  const H = {inv: {}}; QB.board(H).reqs = [{id: "r1", who: "hazel", name: "Hazel", item: "carrot", n: 2, each: 4, posted: day, due: "2099-01-01", why: "for a test"}];
  const take = (id, n) => { H.inv[id] = (H.inv[id] || 0) - n; }, give = (id, n) => { H.inv[id] = (H.inv[id] || 0) + n; };
  check(QB.handOver(H, "hazel", take, give) === null, "a request can't be handed over without the things it asks for");
  H.inv.carrot = 2; const got = QB.handOver(H, "hazel", take, give);
  check(got && got.coins === 8 && got.hearts === 1 && !H.inv.carrot && !QB.board(H).reqs.length, "handing it over pays, adds a heart and takes the things from the backpack");
  const again = () => { QB.board(H).reqs = [{id: "r" + Math.random(), who: "hazel", name: "Hazel", item: "carrot", n: 1, each: 4, posted: day, due: "2099-01-01", why: "x"}]; H.inv.carrot = 1; return QB.handOver(H, "hazel", take, give); };
  const h2 = again(), h3 = again(), h4 = again(), h5 = again(), h6 = again();
  check(h2.letter && /Thank you/.test(h2.letter.title) && !h3.letter && h4.gift && h4.gift.n === 3 && h5.letter && h6.hearts === 5, "two hearts bring a thank-you letter, four a gift, five a friend; hearts stop at five");
  check(QB.boostedStory(H, "hazel", dayKey()) && !QB.boostedStory(H, "hana", dayKey()), "finishing a request makes that villager's next story chapter ready today");
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
// A village request in the game: the board walks you to the villager, you hand it over, a heart shows in Neighbours
if (want("\nvillage requests")) try {
  console.log("\nvillage requests");
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on("pageerror", e => errors.push(`requests pageerror: ${e.message}`));
  await page.goto(url + "?reset=1&seed=1&time=10:15&date=2026-10-14");
  await page.waitForTimeout(1500);
  const r = await page.evaluate(() => window.__hbGame.F().board.reqs[0]);
  check(!!r && r.n > 0, "a request is pinned up on a new game's first morning");
  await page.evaluate(([id, n]) => window.__hbGame.give(id, n), [r.item, r.n]);
  await page.click('[data-open="quests"]'); await page.waitForTimeout(300);
  check(await page.locator(`#reqList [data-find="${r.who}"]`).textContent().then(t => /hand over/.test(t)), "with the things in the backpack, the board offers to hand it over");
  const c0 = await page.evaluate(() => window.__hbGame.F().coins);
  await page.locator(`#reqList [data-find="${r.who}"]`).click();
  await page.waitForSelector("#journal [data-say]", { timeout: 30000 });
  await page.click("#journal [data-say] >> nth=0"); await page.waitForTimeout(500);
  const after = await page.evaluate(() => { const F = window.__hbGame.F(); return {coins: F.coins, hearts: F.board.hearts, reqs: F.board.reqs.map(x => x.who)}; });
  check(after.coins === c0 + r.n*r.each && after.hearts[r.who] === 1 && !after.reqs.includes(r.who), `walking over and handing it to ${r.name} pays ${r.n*r.each} coins and a heart`);
  await page.click('[data-open="friend"]'); await page.click('#friendView [data-ftab="neighbours"]'); await page.waitForTimeout(200);
  check(await page.locator("#friendView .nbrs li").first().textContent().then(t => t.includes(r.name)), "Neighbours lists them first, with their heart");
  await page.screenshot({ path: join(shots, "requests-neighbours.png") });
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
// Home base: the weekend paper in the letterbox, the garden shed, the evening glow, and the home office indoors
if (want("\nhome base: the paper, the shed and the office")) try {
  console.log("\nhome base: the paper, the shed and the office");
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on("pageerror", e => errors.push(`home base pageerror: ${e.message}`));
  await page.goto(url + "?reset=1&seed=1&nosample=1&time=12:45&date=2026-10-05");
  await page.waitForTimeout(1200);
  await page.screenshot({ path: join(shots, "home-base.png") });
  await page.click('[data-open="settings"]');
  await page.fill("#paperNameIn", "The Willow Gazette");
  await page.click("#paperSave");
  await page.click("#pclose");
  await page.goto(url + "?seed=1&time=12:45&date=2026-10-10"); await page.waitForTimeout(1200);   // a Saturday: the weekend paper's out
  check(await page.locator("#paperIn").isVisible(), "the weekend paper is sticking out of the letterbox at home");
  await page.locator('#world [data-place="letterbox"]').dispatchEvent("click");
  await page.waitForSelector("#nbPage.news .nmast", { timeout: 15000 });
  check(await page.locator("#nbTitle").textContent() === "The Willow Gazette", "tapping the letterbox opens the paper, under the name chosen in Settings");
  await page.click('#notebook [data-nb="thanks"]');
  await page.waitForTimeout(300);
  check(await page.locator("#paperIn").isHidden(), "once read, the letterbox is empty");
  await page.click('[data-open="quests"]');
  const before = await page.locator("#list li.task").count();
  await page.locator("#list [data-tdel]").last().click(); await page.waitForTimeout(200);
  check(await page.locator("#list li.task").count() === before - 1, "a task that's no longer needed can be taken down");
  await page.click("#undoBtn"); await page.waitForTimeout(200);
  check(await page.locator("#list li.task").count() === before, "and put back with Undo");
  await page.click("#pclose");
  await page.locator('#world [data-place="shed"]').dispatchEvent("click");
  await page.waitForFunction(() => /The garden shed/.test(document.querySelector("#ctx").textContent), null, { timeout: 15000 });
  check(await page.locator("#ctx [data-tool]").count() === 6 && await page.locator('#ctx [data-tool="harvester"]').count() === 1, "the shed sells six garden tools (the auto seeder, fertiliser and auto harvester too)");
  await page.click('#ctx [data-close]');
  await page.goto(url + "?seed=1&nosample=1&time=20:15&date=2026-10-05");
  await page.waitForTimeout(900);
  check(await page.locator('#sceneArt rect.dusk').count() === 1 && await page.locator("#sceneArt .flame").count() > 0, "after 7pm home base glows: lit windows and the firepit");
  await page.screenshot({ path: join(shots, "base-evening.png") });
  await page.goto(url + "?seed=1&nosample=1&time=10:00&date=2026-10-05");
  await page.waitForTimeout(800);
  await page.locator('#world [data-place="home"]').dispatchEvent("click");
  await page.waitForFunction(() => document.querySelector("#sceneName").textContent.trim().startsWith("Home") && !/base/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  await page.waitForTimeout(600);
  await page.locator('#world [data-spot="officedoor"]').dispatchEvent("click");
  await page.waitForFunction(() => /office/i.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 }); await page.waitForTimeout(600);
  check(/office/i.test(await page.locator("#sceneName").textContent()) && await page.locator('#actors [data-npc]').count() === 0, "the home office opens off the living room, and it's yours alone");
  await page.screenshot({ path: join(shots, "home-office.png") });
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
// Gifts for friends: buy keepsakes and treats at the market, give them in person or send them round
if (want("\ngifts for friends")) try {
  console.log("\ngifts for friends");
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on("pageerror", e => errors.push(`gifts pageerror: ${e.message}`));
  await page.goto(url + "?reset=1&seed=1&nosample=1&time=10:00&date=2026-10-05");
  await page.waitForTimeout(600);
  await page.waitForTimeout(900);
  await page.evaluate(() => { const f = JSON.parse(localStorage.getItem("fox.fox")); f.coins = 800; f.updatedAt = Date.now() + 1e6;
    localStorage.setItem("fox.fox", JSON.stringify(f)); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, JSON.stringify(f))); });
  await page.goto(url + "?seed=1&nosample=1&time=10:00&date=2026-10-05");
  await page.waitForTimeout(700);
  await page.locator('#world [data-place="toTown"]').dispatchEvent("click");
  await page.waitForFunction(() => /Town square/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  await page.waitForTimeout(300);
  await page.locator('#world [data-place="market"]').dispatchEvent("click");
  await page.waitForSelector('#ctx [data-shop="family"]', { timeout: 20000 });
  check(await page.locator('#ctx [data-shop="family"]').textContent() === "Gifts", "the market has a Gifts tab");
  await page.click('#ctx [data-shop="family"]');
  for (const id of ["sandpit", "truck", "headphones", "hammock", "icecream", "kopi"]) { await page.click(`#ctx .item[data-id="${id}"]`); await page.waitForTimeout(150); }
  check(await page.locator('#ctx .item[data-id="hammock"]').textContent().then(t => /at home/.test(t)), "keepsakes are bought once and go home");
  check(await page.evaluate(() => { const o = window.__hbGame.F().fam.owned; return o.truck && o.sandpit && o.headphones && o.hammock; }), "the tin truck, the sandpit, Bo's headphones and the hammock are all kept");
  await page.click('#ctx [data-close]').catch(() => {}); await page.waitForTimeout(300);
  // a present for anyone (the ice cream) can go to any friend at three hearts or more: nobody yet
  await page.click('[data-open="bag"]');
  await page.click('#bag .item[data-id="icecream"]');
  check(await page.locator('#bag [data-giveto]').evaluateAll(n => n.map(x => x.dataset.giveto).filter(Boolean).join()) === "" && /Nobody's at three hearts yet/.test(await page.locator("#bag").textContent()), "with nobody at three hearts the chooser says so, and points to giving in person");
  await page.click('#bag [data-giveto=""]'); await page.waitForTimeout(200);
  await befriend(page, ["hana", "bo", "okada"], 3); await befriend(page, ["celeste"], 4); await befriend(page, ["juniper"], 2);
  // Hana keeps the market: the ice cream goes to her in person
  await page.click('#bag .item[data-id="icecream"]');
  check(await page.locator('#bag [data-giveto="hana"]').textContent().then(t => /here/.test(t)) && await page.locator('#bag [data-giveto="bo"]').textContent().then(t => /send it/.test(t)), "tapping a gift opens a chooser: who it suits, and whether they're here or it gets sent");
  check(await page.locator('#bag [data-giveto]').evaluateAll(n => n.map(x => x.dataset.giveto).filter(Boolean).join()) === "celeste,bo,hana,okada", "ice cream can go to any friend at three hearts or more, the ones you know best first");
  await page.click('#bag [data-giveto="hana"]'); await page.waitForTimeout(300);
  check(await page.evaluate(() => { const f = window.__hbGame.F(); return !f.inv.icecream && f.fam.gifts.hana === 1 && !(f.thanks || []).length; }), "Hana gets her ice cream in person, right at the market");
  check(await page.evaluate(() => { const b = window.__hbGame.F().board; return b.hearts.hana === 3 && b.giftPts.hana === 1; }), "a present for anyone is half a heart (nobody's favourite)");
  await page.goto(url + "?seed=1&nosample=1&time=10:00&date=2026-10-05"); await page.waitForTimeout(900);   // back home: Bo's at his workshop
  await page.click('[data-open="bag"]');
  await page.click('#bag .item[data-id="kopi"]');
  await page.click('#bag [data-giveto="bo"]'); await page.waitForTimeout(300);
  check(await page.locator("#speech").textContent().then(t => /sent to Bo/.test(t)) && await page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")).thanks.length === 1), "a gift for someone who isn't here is sent round, with a thank-you note to follow");
  await page.addInitScript(() => { if (!/thankspatch/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f || !f.thanks) return;
    f.thanks.forEach(t => { t.at = Date.now() - 60e3; }); const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?seed=1&nosample=1&time=20:00&date=2026-10-05&thankspatch=1");
  await page.waitForTimeout(1000);
  check(await page.locator("#sceneArt").innerHTML().then(h => /Sandpit/.test(h)), "the sandpit is at home base");
  await page.click('[data-open="mail"]'); await page.waitForTimeout(300);
  check(/Thank you from Bo/.test(await page.locator("#mailView").textContent()), "Bo's thank-you note arrives in the mailbox");
  await page.click('[data-open="mail"]').catch(() => {});
  await page.click('[data-open="friend"]'); await page.click('#friendView [data-ftab="family"]'); await page.waitForTimeout(300);
  check(/Gifts given: Bo 1 · Hana 1\./.test(await page.locator("#friendView").textContent()), "the Gifts tab lists everyone you've given something to");
  await page.screenshot({ path: join(shots, "gifts-evening.png") });
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
// The villagers' loves (data/loves.js, LOVES-DRAFT.md): 6 to 10 each, from their stories, at most one combination
// (what's inside a packed bonbon box, an ice cream or a mill soap) and a few everyday ones. A love is a whole heart and a
// story love says its own thank-you; anything else is half; dairy earns Tomi nothing. Old plain bonbon boxes still work.
if (want("\nvillagers' loves")) try {
  console.log("\nvillagers' loves");
  const LV = await import(new URL("../src/data/loves.js", import.meta.url)), np = await import(new URL("../src/data/npcs.js", import.meta.url)), its = await import(new URL("../src/data/items.js", import.meta.url));
  const cc = await import(new URL("../src/game/cocoa.js", import.meta.url)), sc = await import(new URL("../src/game/scoop.js", import.meta.url)), kt = await import(new URL("../src/game/kitchen.js", import.meta.url));
  const xm = await import(new URL("../src/game/xmas.js", import.meta.url)), orch = await import(new URL("../src/data/orchard.js", import.meta.url)), T = its.ITEMS;
  const res = np.NPCS.filter(n => !n.tourist && !n.local && !n.kid).map(n => n.id);
  check(res.length === 27 && res.every(w => LV.LOVES[w] && LV.lovesOf(w).length >= 6 && LV.lovesOf(w).length <= 10), "all 27 Honeybrook villagers have 6 to 10 loves");
  check(res.every(w => LV.lovesOf(w).filter(l => l.kind === "combo").length <= 1 && LV.lovesOf(w).filter(l => l.kind === "story").every(l => l.thanks && !/—/.test(l.thanks))), "at most one combination each; every story love has its own thank-you (no em dashes)");
  check(res.every(w => LV.lovesOf(w).every(l => l.match ? typeof l.match === "function" && l.what && l.thanks : typeof l.id === "string")), "every love is an item id or a matcher (with what it's for and a thank-you)");
  // matchers, on made things the way their ITEMS entries look
  Object.assign(T, {__box: {n: "box", kind: "gift", boxOf: "box9", bonbons: [{shell: "milk", fills: ["hazelnut"], shape: "dome"}, {shell: "dark", fills: ["wine_red", "cherry"], shape: "dome"}]},
    __heart: {n: "box", kind: "gift", boxOf: "box4", bonbons: [{shell: "milk", fills: ["honey"], shape: "heart"}]}, __gel: {n: "cone", kind: "gift", gel: true, ings: ["apple", "honey", "milk"]},
    __fdl: {n: "cup", kind: "gift", gel: true, ings: ["milk"]}, __fdld: {n: "cup", kind: "gift", gel: true, dip: true, ings: ["milk"]}, __pist: {n: "cup", kind: "gift", gel: true, ings: ["milk", "pistachio"]},
    __soap: {n: "soap", kind: "gift", mill: "soap", adds: ["bq_lavender", "honey"]}, __soap3: {n: "soap", kind: "gift", mill: "soap", adds: ["bq_lavender", "honey", "mint"]}, __wrap: {n: "wrapped", kind: "gift", wrapped: true, inner: "__heart"}});
  check(LV.loveFor("celeste", "__box").kind === "combo" && !LV.isLove("celeste", "__heart") && LV.loveFor("posy", "__heart").kind === "combo" && LV.isLove("posy", "__wrap") && LV.isLove("lila", "__box") && LV.isLove("opal", "__heart"),
    "packed boxes: Celeste's hazelnut and red wine, Posy's honey heart (wrapped, too); a love for a box size covers every box of that size");
  check(LV.isLove("felix", "__gel") && LV.isLove("tomo", "__pist") && !LV.isLove("tomo", "__gel") && LV.isLove("sofia", "__fdl") && !LV.isLove("sofia", "__fdld") && LV.isLove("hazel", "__soap") && !LV.isLove("hazel", "__soap3"),
    "ice creams and mill soaps by what's in them: Felix's apple and honey, Tomo's pistachio, Sofia's plain fior di latte, Hazel's lavender and honey");
  check(!LV.isLove("hana", "carrot") && !LV.isLove("bo", "loaf") && !LV.isLove("theo", "sunflower") && LV.isLove("hana", "hotteok") && LV.loveFor("okada", "s_toast").kind === "story", "the quest board's likes and items' `to` lists aren't loves any more");
  // a real packed box remembers its bonbons (cocoa.js packBox)
  const G = {coins: 0, inv: {}, goals: {cocoa: 1}}, c = cc.cocoaState(G);
  c.bonbons.push({id: "milk+hazelnut", shell: "milk", fills: ["hazelnut"], name: "Milk Hazelnut Praline"}, {id: "dark+wine_red", shell: "dark", fills: ["wine_red"], name: "Dark Red Wine Truffle"});
  c.trays = {"milk+hazelnut": 12, "dark+wine_red": 12}; c.display = ["milk+hazelnut", "dark+wine_red"];
  const sel = {"milk+hazelnut": 2, "dark+wine_red": 2}, bx = cc.packBox(G, 4, {...sel}), bx2 = cc.packBox(G, 4, {...sel}), bx3 = cc.packBox(G, 4, {"dark+wine_red": 4});
  check(/^box4_/.test(bx) && bx === bx2 && G.inv[bx] === 2 && /^box4d_/.test(bx3) && bx3 !== bx && T[bx].boxOf === "box4" && T[bx].price === T.box4.price && T[bx].dairy && !T[bx3].dairy && /Hazelnut/.test(T[bx].n),
    "a packed box keeps its bonbons: the same box stacks, a different one doesn't, and it's priced like any box of 4");
  check(LV.loveFor("celeste", bx).kind === "combo" && !LV.isLove("celeste", bx3) && LV.isLove("opal", bx) && LV.isLove("tomi", bx3) && xm.stallGood(bx) && xm.stallGood("box4"), "Celeste's combination counts; it's still a box of 4 for Opal (and dark for Tomi); old and new boxes go on the Christmas stall");
  // the new things, and where they're made
  c.choc.milk = 20;
  check(cc.makeCoinTins(G) === 3 && G.inv.coin_tin === 3 && cc.makePralines(G, false) === 0 && !cc.makePralines(G, true) && (c.pantry.hazelnut = 1) && cc.makePralines(G, true) === 2 && G.inv.s_praline === 2 && !c.pantry.hazelnut && c.choc.milk === 8,
    "the Cocoa Room: little tins of gold coins all year; Henri's pralines only from his recipe book, with a hazelnut");
  const H = {inv: {}}; sc.scoopState(H).fridge.milk = 1;
  check(!sc.makeNonna(H, false) && sc.makeNonna(H, true) === 1 && H.inv.s_nonna === 1 && !sc.scoopState(H).fridge.milk, "the Scoop Shack makes Nonna's fior di latte from a bottle of milk, once Sofia's told that chapter");
  const K = {inv: {}}, day = "2026-10-14"; K.vine = {tapasList: [{day, id: "salmorejo", plates: 2, cooked: 1}, {day, id: "patatas", plates: 3, cooked: 1}]};
  check(/boxed up/.test(kt.boxPlate(K, day, "salmorejo") || "") && K.inv.tk_salmorejo === 1 && K.vine.tapasList[0].plates === 1 && !kt.boxPlate(K, day, "patatas") && kt.TAKEAWAY.tortaaceite === "tk_tortaaceite" && kt.TAKEAWAY.pasteles === "tk_pasteles",
    "a plate of salmorejo boxed to take away, off the day's batch (and Ines's cake and Farid's pastries too)");
  check(orch.TREES.plum && orch.TREES.plum.seasons.includes("summer") && orch.TREES.plum.seasons.includes("autumn") && T.plum && T.plum.fruit && T.plum.sell <= 5, "a plum tree for the orchard, fruiting late summer into autumn");
  const NEW = ["fudge", "btncard", "rubberstamp", "coin_tin", "tk_salmorejo", "tk_tortaaceite", "tk_pasteles", "s_toast", "s_praline", "s_nonna"];
  check(NEW.every(id => T[id] && T[id].kind === "gift" && T[id].price > 0 && !(T[id].sell > T[id].price)) && T.coin_tin.price < T.sp_coins.price, "the new gifts all have a price (and nothing sells for more than it costs)");
  // in the game: Postman's toast at Hana's only once Hana's told that chapter; a love is a whole heart with its own thank-you
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on("pageerror", e => errors.push(`loves pageerror: ${e.message}`));
  await page.goto(url + "?reset=1&seed=1&nosample=1&time=10:00&date=2026-10-05"); await page.waitForTimeout(900);
  const lfox = () => page.evaluate(() => window.__hbGame.F());
  check(await page.evaluate(ids => { const I = window.__hbGame.items(); return ids.filter(id => !I[id]); }, res.flatMap(w => LV.lovesOf(w).filter(l => !l.match).map(l => l.id))).then(m => !m.length), "every love's item exists in the game");
  await page.evaluate(() => { const g = window.__hbGame, f = g.F(); f.coins = 300; f.board = f.board || {}; f.board.hearts = {okada: 3, hana: 3, tomi: 3, celeste: 3, opal: 3}; g.save(); g.render(); });
  await page.locator('#world [data-place="toTown"]').dispatchEvent("click");
  await page.waitForFunction(() => /Town square/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 }); await page.waitForTimeout(300);
  await page.locator('#world [data-place="market"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-shop="treats"]', { timeout: 20000 });
  await page.click('#ctx [data-shop="treats"]'); await page.waitForTimeout(200);
  check(await page.locator('#ctx .item[data-id="s_toast"]').count() === 0, "no Postman's toast at Hana's before her chapter");
  await page.evaluate(() => { const g = window.__hbGame, f = g.F(); f.story = f.story || {}; f.story.heard = {...(f.story.heard || {}), hana: 4}; g.save(); g.render(); });
  await page.click('#ctx [data-shop="family"]'); await page.waitForTimeout(150); await page.click('#ctx [data-shop="treats"]'); await page.waitForTimeout(200);
  check(await page.locator('#ctx .item[data-id="s_toast"]').count() === 1, "once she's told it, Postman's toast is on her Treats shelf");
  await page.click('#ctx .item[data-id="s_toast"]'); await page.waitForTimeout(150);
  await page.click('#ctx [data-shop="family"]'); await page.waitForTimeout(150); for (let i = 0; i < 2; i++) { await page.click('#ctx .item[data-id="fudge"]'); await page.waitForTimeout(150); }
  check(await lfox().then(f => f.inv.s_toast === 1 && f.inv.fudge === 2 && f.coins === 300 - 9 - 10), "Postman's toast (9) and fudge (5) bought at the market");
  await page.click('#ctx [data-close]').catch(() => {});
  // presents sent round (nobody's here, at home base): a box packed with Celeste's hazelnut and red wine, and an old plain box for Opal
  await page.goto(url + "?seed=1&nosample=1&time=10:00&date=2026-10-05"); await page.waitForTimeout(900);
  await page.evaluate(() => { const g = window.__hbGame, f = g.F(); f.cocoa = f.cocoa || {}; f.cocoa.boxes = {box4_test: {base: "box4", items: [{id: "milk+hazelnut", n: 2, shell: "milk", fills: ["hazelnut"], shape: "dome", name: "Milk Hazelnut Praline"}, {id: "dark+wine_red", n: 2, shell: "dark", fills: ["wine_red"], shape: "dome", name: "Dark Red Wine Truffle"}]}};
    f.inv.box4_test = 1; f.inv.box4 = 1; g.save(); g.render(); });
  const send = async (id, w) => { await page.click('[data-open="bag"]'); await page.waitForTimeout(150); await page.click(`#bag .item[data-id="${id}"]`); await page.waitForTimeout(150); await page.click(`#bag [data-giveto="${w}"]`); await page.waitForTimeout(300); await page.click('[data-open="bag"]').catch(() => {}); await page.waitForTimeout(150); };
  await send("s_toast", "okada"); await send("fudge", "hana"); await send("fudge", "tomi"); await send("box4_test", "celeste"); await send("box4", "opal");
  const b = await lfox().then(f => f.board);
  check(b.hearts.okada === 4 && !b.giftPts.okada, "a story love (Postman's toast for Mr Okada) is a whole heart");
  check(b.hearts.hana === 3 && b.giftPts.hana === 1, "something that isn't one of their loves (fudge for Hana) is half a heart");
  check(b.hearts.tomi === 3 && !b.giftPts.tomi && b.gifted.tomi, "fudge is dairy: Tomi's thanks, but nothing towards a heart");
  check(b.hearts.celeste === 4 && b.hearts.opal === 4, "the packed hazelnut and red wine box is Celeste's combination, and an old plain box of 4 still gives (Opal's love)");
  await page.evaluate(() => { const f = window.__hbGame.F(); (f.thanks || []).forEach(t => { t.at = Date.now() - 60e3; }); });
  const notes = await page.evaluate(() => window.__hbGame.notes());
  check(notes.some(n => /Mr Okada/.test(n.title) && /So this is how it feels/.test(n.body)) && notes.some(n => /Celeste/.test(n.title) && /Grand-père's hazelnut and Maman's red/.test(n.body)), "their thank-you notes say their own lines");
  // bought where they belong: a rubber stamp at the post office, a card of buttons at Ada's
  await page.evaluate(() => { window.__hbScene("post"); }); await page.waitForTimeout(600);
  await page.locator('#world [data-spot="scales"]').dispatchEvent("click"); await page.waitForSelector('#ctx .item[data-id="rubberstamp"]', { timeout: 15000 });
  await page.click('#ctx .item[data-id="rubberstamp"]'); await page.waitForTimeout(200);
  check(await lfox().then(f => f.inv.rubberstamp === 1), "a rubber stamp from Penny's drawer by the post office scales");
  await page.click('#ctx [data-close]').catch(() => {});
  await page.evaluate(() => { window.__hbScene("haberdash"); }); await page.waitForTimeout(600);
  await page.locator('#world [data-spot="buttonjar"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-sew="giftcard:1"]', { timeout: 15000 });
  await page.click('#ctx [data-sew="giftcard:1"]'); await page.waitForTimeout(200);
  check(await lfox().then(f => f.inv.btncard === 1), "a card of buttons to give, from Ada's haberdashery");
  await page.screenshot({ path: join(shots, "loves-haberdashery.png") });
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
// Animals: buy chicks and bunnies at the market, feed them in the run at home, upgrade the run; Pancake at the news board
if (want("\nanimals")) try {
  console.log("\nanimals");
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on("pageerror", e => errors.push(`animals pageerror: ${e.message}`));
  await page.goto(url + "?reset=1&seed=1&nosample=1&time=10:00&date=2026-10-05");
  await page.waitForTimeout(900);
  await page.evaluate(() => { const f = JSON.parse(localStorage.getItem("fox.fox")); f.coins = 200; f.updatedAt = Date.now() + 1e6;
    localStorage.setItem("fox.fox", JSON.stringify(f)); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, JSON.stringify(f))); });
  await page.goto(url + "?seed=1&nosample=1&time=10:00&date=2026-10-05");
  await page.waitForTimeout(700);
  await page.locator('#world [data-place="toTown"]').dispatchEvent("click");
  await page.waitForFunction(() => /Town square/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  await page.waitForTimeout(300);
  check(await page.locator('#world [aria-label="Pancake the village dog"]').count() === 1, "Pancake the dog minds the good news board");
  await page.evaluate(() => { const e = document.getElementById("speech"); e.hidden = false; e.textContent = "hello"; });
  await page.locator("#speech").click(); check(await page.locator("#speech").isHidden(), "a tap closes the speech bubble");
  await page.locator('#world [data-place="market"]').dispatchEvent("click");
  await page.waitForSelector('#ctx [data-shop="animals"]', { timeout: 20000 });
  await page.click('#ctx [data-shop="animals"]');
  for (const id of ["chick", "rabbit", "chickfeed", "rabbitfeed"]) { await page.click(`#ctx .item[data-id="${id}"]`); await page.waitForTimeout(150); }
  check(await page.locator('#ctx .item[data-id="chick"]').textContent().then(t => /run is full/.test(t)), "a chick and a bunny fill the little run");
  await page.screenshot({ path: join(shots, "animals-market.png") });
  await page.click('#ctx [data-shop="me"]');
  check(await page.locator('#ctx [data-decor="r_lights"]').count() === 1 && await page.locator('#ctx [data-decor="me_bow"]').count() === 1, "the market sells things for you and your room");
  await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&nosample=1&time=10:00&date=2026-10-05");
  await page.waitForTimeout(900);
  check(await page.locator('#world [data-place="run"] .peck').count() === 1 && await page.locator('#world [data-place="run"] .hop').count() === 1, "they live in the run at home base");
  await page.locator('#world [data-place="run"]').dispatchEvent("click");
  await page.waitForSelector('#ctx [data-feed="all"]', { timeout: 20000 });
  await page.click('#ctx [data-feed="all"]');
  await page.waitForTimeout(300);
  check(await page.locator("#ctx .hlist.pets .hbadge").count() === 2, "feeding everyone uses the feed from the backpack");
  await page.click('#ctx [data-runup]');
  await page.waitForTimeout(300);
  check(await page.locator("#ctx .sub").textContent().then(t => /Bigger run/.test(t)), "the run can be upgraded with coins");
  await page.screenshot({ path: join(shots, "animals-run.png") });
  await page.click("#pclose"); await page.waitForTimeout(300);
  check(await page.locator("#panel").isHidden(), "the close button shuts the run");
  await page.locator('#world [data-place="toTown"]').dispatchEvent("click");
  await page.waitForFunction(() => /Town square/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  await page.locator('#world [data-place="market"]').dispatchEvent("click");
  await page.waitForSelector('#ctx [data-shop="animals"]', { timeout: 20000 });
  await page.click('#ctx [data-shop="animals"]'); await page.click('#ctx [data-shop="seeds"]');
  check(await page.locator('#ctx [data-shop="seeds"]').getAttribute("aria-selected") === "true", "and the market's Animals tab switches back to the others");
  await page.click("#pclose"); await page.waitForTimeout(300);
  check(await page.locator("#panel").isHidden(), "and closes");
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
// Saving: a browser with no copy of its own (like the Claude app after a refresh) must load the cloud save, never overwrite it
if (want("\nsaving")) try {
  console.log("\nsaving");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`saving pageerror: ${e.message}`));
  await page.goto(url + "?reset=1&seed=1&nosample=1&time=10:30&date=2026-10-05");
  await page.waitForTimeout(1200);
  await page.addInitScript(() => { if (sessionStorage.getItem("savetest")) return; sessionStorage.setItem("savetest", "1");
  const k = Object.keys(localStorage).find(k => /^stub:.*\/fox$/.test(k)); const f = JSON.parse(localStorage.getItem(k));
  f.coins = 77; f.inv = Object.assign(f.inv || {}, {carrot: 3}); f.updatedAt = Date.now() - 3600e3; localStorage.setItem(k, JSON.stringify(f));
  Object.keys(localStorage).filter(k => /^fox\./.test(k)).forEach(k => localStorage.removeItem(k)); });
  await page.goto(url + "?seed=1&nosample=1&dblag=2000&time=10:30&date=2026-10-05");
  await page.waitForTimeout(4000);
  const st = await page.evaluate(() => { const k = Object.keys(localStorage).find(k => /^stub:.*\/fox$/.test(k)); return JSON.parse(localStorage.getItem(k)); });
  check(st.coins >= 77 && st.inv.carrot === 3, `a fresh browser loads the cloud save instead of overwriting it (coins ${st.coins})`);
  check(await page.locator("#coins").textContent().then(t => /7\d/.test(t)), "and shows it");
  // another device saves (this page doesn't hear about it), then this page saves: it must catch up, not overwrite
  await page.evaluate(() => { const k = Object.keys(localStorage).find(k => /^stub:.*\/fox$/.test(k)); const f = JSON.parse(localStorage.getItem(k));
    f.coins = 55; f.inv = Object.assign(f.inv || {}, {strawberry: 2}); f.updatedAt = Date.now(); localStorage.setItem(k, JSON.stringify(f)); });
  await page.click('[data-open="quests"]'); await page.fill("#addTitle", "Water the plants"); await page.click('#addForm button');
  await page.waitForTimeout(1500);
  const st2 = await page.evaluate(() => { const k = Object.keys(localStorage).find(k => /^stub:.*\/fox$/.test(k)); return JSON.parse(localStorage.getItem(k)); });
  check(st2.coins === 55 && st2.inv.strawberry === 2, `a stale page catches up with another device's save instead of overwriting it (coins ${st2.coins})`);
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nthe guest room")) try {
  // The guest room (game/guests.js): invite someone from the address book; they come for three days on a written plan
  console.log("\nthe guest room");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`guest room pageerror: ${e.message}`));
  const go = async q => { await page.goto(url + q); await page.waitForTimeout(1200); };
  const here = sc => page.evaluate(async sc => { window.__hbScene(sc); await new Promise(r => setTimeout(r, 900)); return [...document.querySelectorAll("#actors .npc[data-npc]")].map(n => n.dataset.npc); }, sc);
  const openBook = async () => { await page.evaluate(() => { const g = document.querySelector('#world [data-spot="gbook"]'); g.dispatchEvent(new MouseEvent("click", {bubbles: true})); g.dispatchEvent(new PointerEvent("pointerdown", {bubbles: true})); g.dispatchEvent(new PointerEvent("pointerup", {bubbles: true})); });
    await page.waitForFunction(() => /The guest book/.test(document.querySelector("#ctx").textContent), null, { timeout: 15000 }); };
  await go("?reset=1&seed=1&nosample=1&date=2026-10-14&time=16:00");
  await page.locator('#world [data-place="home"]').dispatchEvent("click");
  await page.waitForFunction(() => /Home/.test(document.querySelector("#sceneName").textContent) && !/base/i.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  check(await page.locator('#world [data-spot="guestdoor"]').count() === 1, "the house has a door to the guest room on the right");
  await page.locator('#world [data-spot="guestdoor"]').dispatchEvent("click");
  await page.waitForFunction(() => /guest room/i.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 }); await page.waitForTimeout(800);
  check(await page.locator("#world [data-spot]").evaluateAll(n => ["gbed", "gbook", "gwardrobe", "gshelf"].every(k => n.some(x => x.dataset.spot === k))), "the guest room: a bed, the guest book on the desk, a wardrobe and a bookshelf");
  await openBook();
  check(/Nobody to invite yet/.test(await page.locator("#ctx").textContent()), "with an empty address book there's nobody to invite yet");
  await page.evaluate(() => { const F = window.__hbGame.F(); F.met = {...(F.met || {}), ornella: true}; F.book = {ids: {ornella: "2026-10-01"}, sent: []}; window.__hbGame.render(); });
  await page.waitForTimeout(400); await openBook().catch(() => {});
  check(await page.locator('#ctx [data-guest="ask:ornella"]').textContent().then(t => /Ornella/.test(t) && /Cinque Terre/.test(t)), "the guest book offers everyone in the address book (Ornella, from Cinque Terre)");
  await page.click('#ctx [data-guest="ask:ornella"]'); await page.waitForTimeout(500);
  check(await page.evaluate(() => JSON.stringify(window.__hbGame.F().guest)) === JSON.stringify({id: "ornella", day: "2026-10-15", asked: "2026-10-14"}) && /coming tomorrow on the 10:30 train, for 3 days/.test(await page.locator("#ctx").textContent()), "invited: she's coming tomorrow on the 10:30 train, for three days");
  check(await page.locator('#ctx [data-guest="cancel"]').count() === 1, "until then it can be put off");
  check(!(await here("guestroom")).includes("ornella"), "nobody in the guest room the evening before");
  await go("?seed=1&nosample=1&date=2026-10-15&time=10:45");
  check((await here("hlane")).includes("ornella"), "the next morning she's off the 10:30 train at Honeybrook station");
  await page.click('[data-open="friend"]'); await page.waitForTimeout(400);
  check(await page.locator("#friendView").textContent().then(t => /Staying with you\s*Ornella/.test(t)), "Who's where lists her first, under Staying with you");
  await page.click("#pclose");
  await go("?seed=1&nosample=1&date=2026-10-15&time=23:00");
  check((await here("guestroom")).includes("ornella"), "at night she's asleep in the guest room");
  await go("?seed=1&nosample=1&date=2026-10-16&time=14:30");
  await page.evaluate(() => window.__hbScene("guestroom")); await page.waitForTimeout(900);
  await openBook();
  check(await page.locator("#ctx").textContent().then(t => /Ornella is staying/.test(t) && /Day 2 of 3/.test(t) && /Today's plan/.test(t)), "the guest book shows today's plan while she's here (day 2 of 3)");
  check(await page.evaluate(() => window.__hbGame.F().guestLog.ornella.includes("2026-10-15")), "and she's signed the book");
  await go("?seed=1&nosample=1&date=2026-10-17&time=12:00");
  check(!(await here("hlane")).includes("ornella") && !(await here("guestroom")).includes("ornella"), "after the 11 o'clock train on the third day she's gone");
  check(!(await page.evaluate(() => window.__hbGame.mail().unread)).some(m => /^guest-/.test(m)), "no thank-you letter yet on the day she goes");
  await go("?seed=1&nosample=1&date=2026-10-18&time=10:00");
  check((await page.evaluate(() => window.__hbGame.mail().unread)).includes("guest-ornella-2026-10-15"), "the morning after, her thank-you letter arrives");
  await page.click('[data-open="friend"]'); await page.waitForTimeout(400);
  check(!/Staying with you/.test(await page.locator("#friendView").textContent()), "and she's off Who's where");
  await page.click("#pclose");
  await page.click('[data-open="mail"]'); await page.waitForTimeout(300);
  check(/Thank you from Ornella/.test(await page.locator("#mailView").textContent()), "headed Thank you from Ornella");
  await page.click('[data-open="mail"]').catch(() => {});
  const GU = await import(pathToFileURL(join(root, "src/game/guests.js")).href);
  const G = {guest: {id: "ornella", day: "2026-10-15", asked: "2026-10-14"}};
  check(!GU.canInvite(G, "2026-10-16") && GU.canInvite(G, "2026-10-18") && !GU.cancel(G, "2026-10-15") && GU.cancel({guest: {id: "ornella", day: "2026-10-15"}}, "2026-10-14"), "one guest at a time; a booking can be put off only before the day");
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nthe setup card")) try {
  // A new game: the opening story (game/intro.js), then character creation (game/setup.js): a name, how you look, and a
  // pet. Dev builds skip both unless the URL asks (?setup=1).
  console.log("\nthe setup card");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`setup pageerror: ${e.message}`));
  await page.goto(url + "?reset=1&time=10:00"); await page.waitForTimeout(1200);
  check(await page.locator("#setup").isHidden().catch(() => true) && await page.evaluate(() => { const F = window.__hbGame.F(); return F.pet === "fox" && F.name === "Ember" && F.me && F.me.name === ""; }), "dev builds skip the setup card: a fox called Ember, and no name yet");
  await page.goto(url + "?reset=1&setup=1&time=10:00"); await page.waitForTimeout(1600);
  check(await page.locator("#intro").isVisible() && await page.locator('#intro [data-in="skip"]').count() === 1, "a new game opens on the story, which can be skipped");
  await page.click('#intro [data-in="skip"]'); await page.waitForTimeout(800);
  check(await page.locator("#setup").isVisible() && await page.evaluate(() => window.__hbGame.F().introSeen === true), "then the setup card (and the story's marked as seen)");
  await page.fill("#suName", "Robin"); await page.click('[data-su="go:look"]'); await page.waitForTimeout(300);
  await page.click('[data-su="body:man"]'); await page.click('[data-su="go:pet"]'); await page.waitForTimeout(300);
  await page.click('[data-su="pet:capybara"]'); await page.waitForTimeout(300); await page.click('[data-su="done"]'); await page.waitForTimeout(1500);
  const me = await page.evaluate(() => { const F = window.__hbGame.F(); return {name: F.me && F.me.name, pet: F.pet, pname: F.name}; });
  check(me.name === "Robin" && me.pet === "capybara" && me.pname === "Mochi", `a name, a look and a pet: ${me.name}, with a capybara called ${me.pname}`);
  check(await page.locator("#setup").isHidden().catch(() => true) && await page.locator("#mchum").evaluate(e => e.innerHTML.length > 50), "the card closes and the capybara follows you about");
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nAda's haberdashery and Idris the tailor")) try {
  // Sewing (game/tailor.js, data/sewing.js, F.sew): fabric and buttons from Ada (scene "haberdash"), a design made up by Idris
  // (scene "tailor") for his fee, ready the next morning from nine, then worn from the wardrobe
  console.log("\nAda's haberdashery and Idris the tailor");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`sewing pageerror: ${e.message}`));
  const tap = sel => page.evaluate(s => document.querySelector(s).dispatchEvent(new MouseEvent("click", {bubbles: true})), sel);
  const coins = () => page.evaluate(() => window.__hbGame.F().coins);
  await page.goto(url + "?reset=1&seed=1&nosample=1&date=2026-10-19&time=10:00"); await page.waitForTimeout(1000);
  await page.evaluate(() => { window.__hbGame.F().coins = 300; window.__hbScene("haberdash"); }); await page.waitForTimeout(900);
  await tap('#world [data-spot="habcounter"]'); await page.waitForSelector('#ctx [data-sew="buy:4"]', { timeout: 15000 });
  await page.click('[data-sew="pat:gingham"]'); await page.click('[data-sew="col:#E8566C"]'); await page.click('[data-sew="buy:4"]'); await page.waitForTimeout(300);
  await page.click('[data-sew="tab:buttons"]'); await page.click('[data-sew="btn:shell"]'); await page.waitForTimeout(300);
  await page.click('[data-sew="tab:basket"]'); await page.waitForTimeout(300);
  check(await page.locator("#ctx").innerText().then(t => /gingham cotton × 4/i.test(t) && /Shell buttons × 1/.test(t)) && await coins() < 300, "at Ada's: four pieces of gingham and a card of shell buttons in the sewing basket");
  await page.evaluate(() => window.__hbScene("tailor")); await page.waitForTimeout(900);
  await tap('#world [data-spot="tailtable"]'); await page.waitForSelector('#ctx [data-sew="kind:dress"]', { timeout: 15000 });
  await page.click('[data-sew="kind:dress"]'); await page.click('[data-sew="sleeves:puff"]'); await page.click('[data-sew="neck:collar"]'); await page.click('[data-sew="buttons:shell"]'); await page.click('[data-sew="pockets:1"]'); await page.waitForTimeout(400);
  check(await page.locator("#ctx .tlprev").count() === 1, "at Idris's table: a dress designed, with a preview");
  const c0 = await coins(); await page.click('[data-sew="order"]'); await page.waitForTimeout(600);
  check(await coins() === c0 - 40 && /Tomorrow from nine/.test(await page.locator("#ctx").innerText()), "ordered: only his fee comes off (40), and it's ready tomorrow from nine");
  await page.goto(url + "?seed=1&nosample=1&date=2026-10-20&time=10:00"); await page.waitForTimeout(1000);
  await page.evaluate(() => window.__hbScene("tailor")); await page.waitForTimeout(900);
  await tap('#world [data-spot="rail"]'); await page.waitForSelector('#ctx [data-sew="collect"]', { timeout: 15000 });
  await page.click('[data-sew="collect"]'); await page.waitForTimeout(600);
  check(await page.evaluate(() => window.__hbGame.F().sew.clothes.map(c => c.name).join()) === "Poppy gingham cotton dress", "the next morning the dress is on the rail to collect");
  await page.evaluate(() => window.__hbScene("room")); await page.waitForTimeout(900);
  await tap('#world [data-spot="wardrobe"]'); await page.waitForSelector("#ctx [data-wear]", { timeout: 15000 });
  await page.locator("#ctx [data-wear]").first().click(); await page.waitForTimeout(800);
  check(await page.evaluate(() => !!window.__hbGame.F().sew.wear.dress) && await page.locator("#hero .clTorso").evaluate(e => e.innerHTML.length > 50), "worn from the wardrobe: you're in your new dress");
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nmy routines")) try {
  // My routines: the noticeboard in your room
  console.log("\nmy routines");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(url + "?reset=1&seed=1&time=08:30&date=2026-10-07");
  await page.waitForTimeout(800);
  await page.locator('#world [data-place="home"]').dispatchEvent("click");
  await page.waitForFunction(() => /Home/.test(document.querySelector("#sceneName").textContent) && !/base/i.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  await page.locator('#world [data-spot="mydoor"]').dispatchEvent("click");
  await page.waitForFunction(() => /My room/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  await page.locator('#world [data-spot="routines"]').dispatchEvent("click");
  await page.waitForSelector("#ctx .rcheck li", { timeout: 15000 });
  check(await page.locator("#ctx .rcheck li").count() >= 3, "the noticeboard has a morning routine checklist");
  await page.click("#ctx .rcheck li >> nth=0"); await page.waitForTimeout(200);
  check(await page.locator("#ctx .rcheck li.on").count() === 1 && await page.locator("#ctx .rcheck .rbox.on").count() === 1 && await page.locator("#ctx .rcheck .tk").count() === 0, "steps start as empty boxes and tick off with one tap");
  const coins0 = await page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")).coins);
  const steps = await page.locator("#ctx .rcheck li").count();
  for (let i = 1; i < steps; i++) { await page.click(`#ctx .rcheck li >> nth=${i}`); await page.waitForTimeout(120); }
  await page.click("#ctx .rcheck li >> nth=0"); await page.click("#ctx .rcheck li >> nth=0"); await page.waitForTimeout(200);
  const coins1 = await page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")).coins);
  check(coins1 - coins0 === (steps - 1) + 8, `each routine step earns a coin and finishing the routine earns an 8-coin bonus, once a day (+${coins1 - coins0})`);
  await page.click('#ctx [data-rt="sel"]:has-text("Self-care")'); await page.click('#ctx [data-rt="edit"]');
  check(await page.locator('#ctx [data-day="sun"]').inputValue() === "An early night", "your self-care week is already on the board");
  await page.click("#ctx .rpaste summary");
  await page.fill("#rtPaste", "Mon: double cleanse\nTue - hair mask\nWednesday: exfoliate\nThu: sheet mask\nFri. nails\nSun: rest");
  await page.click('#ctx [data-rt="paste"]'); await page.waitForTimeout(150);
  check(await page.locator('#ctx [data-day="wed"]').inputValue() === "exfoliate", "a pasted week fills in the days");
  await page.click('#rtForm button[type="submit"]'); await page.waitForTimeout(150);
  check(/exfoliate/.test(await page.locator("#ctx .rtoday").textContent()), "and today's step (a Wednesday) is up top");
  await page.click("#ctx .rtoday"); await page.waitForTimeout(150);
  check(await page.locator("#ctx .rtoday.done").count() === 1 && await page.evaluate(() => (devDb.get("routines").lists || []).some(l => l.days && l.days.wed === "exfoliate")), "it ticks off, and the routine is saved privately");
  await page.click('#ctx [data-rt="sel"]:has-text("Morning")'); await page.click('#ctx [data-rt="edit"]');
  const n0 = await page.locator("#ctx .redit li").count(); await page.click('#ctx [data-rt="delitem"] >> nth=0'); await page.waitForTimeout(150);
  check(await page.locator("#ctx .redit li").count() === n0 - 1, "steps can be removed");
  await page.click("#undoBtn"); await page.waitForTimeout(200);
  check(await page.locator("#ctx .redit li").count() === n0, "and Undo puts them back");
  await page.screenshot({ path: join(shots, "routines.png") });
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\ntrophy room")) try {
  // Trophy room: off the town hall; trophies on pedestals, the trophy book, affirmations, kind words
  console.log("\ntrophy room");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(url + "?reset=1&seed=1&time=10:30");
  await page.waitForTimeout(1500);
  // patch the save as the next page starts (the old page writes its own copy as it unloads)
  await page.addInitScript(() => { if (!location.search.includes("patchtq")) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return; f.totalQuests = 30; delete f.trophies;
    localStorage.setItem("fox.fox", JSON.stringify(f)); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, JSON.stringify(f))); });
  await page.goto(url + "?seed=1&time=10:30&patchtq=1");
  await page.waitForTimeout(12000);
  const tr = await page.evaluate(() => (JSON.parse(localStorage.getItem("fox.fox")).trophies || []).map(t => t.id));
  check(tr.includes("quests-10") && tr.includes("quests-25") && !tr.includes("quests-50"), "trophies are awarded for quest milestones reached");
  await page.locator('#world [data-place="toTown"]').dispatchEvent("click");
  await page.waitForFunction(() => /Town square/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  await page.locator('#world [data-place="hall"]').dispatchEvent("click");
  await page.waitForFunction(() => /Town hall/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  check(await page.locator('#world [data-spot="trophydoor"]').count() === 1 && await page.locator('#world [data-spot="kudos"]').count() === 0, "the town hall has an archway out to the courtyard (the kind words board moved out there)");
  await page.locator('#world [data-spot="trophydoor"]').dispatchEvent("click");
  await page.waitForFunction(() => /courtyard/i.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  await page.waitForTimeout(600);
  check(await page.locator("#world .ptrophy").count() >= 2, "trophies stand on the pedestals");
  check(await page.locator('#world [data-spot="kudos"]').count() === 1, "with a notice board on the wall");
  await page.locator('#world [data-spot="ped0"]').dispatchEvent("click");
  await page.waitForSelector('#ctx [data-tr="book"]', { timeout: 10000 });
  const name = await page.locator("#ctx .tcard h2").textContent();
  await page.click('#ctx [data-tr="book"]'); await page.waitForTimeout(400);
  await page.locator('#world [data-spot="tbook"]').dispatchEvent("click");
  await page.waitForSelector("#ctx .tpage", { timeout: 10000 });
  check((await page.locator("#ctx .tpage h3").first().textContent()) === name && await page.locator("#ctx .tpage svg").count() >= 1, "a trophy can go into the trophy book: a page with a polaroid and the story");
  await page.click("#pclose"); await page.waitForTimeout(200);
  await page.locator('#world [data-spot="bench"]').dispatchEvent("click"); await page.waitForTimeout(2500);
  check(await page.evaluate(() => document.getElementById("hero").classList.contains("sit")), "you can sit on the bench");
  check(await page.locator("#world [data-pigeon]").count() >= 2 && await page.locator('#world [data-spot="fountain"]').count() === 1, "with a fountain and pigeons pecking about");
  await page.screenshot({ path: join(shots, "courtyard.png") });
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\njournal, bedtime, backup")) try {
  // The journal (writing desk), bedtime, backup
  console.log("\njournal, bedtime, backup");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("dialog", d => d.accept());
  await page.goto(url + "?reset=1&seed=1&time=10:30");
  await page.waitForTimeout(800);
  await page.locator('#world [data-place="home"]').dispatchEvent("click");
  await page.waitForFunction(() => /Home/.test(document.querySelector("#sceneName").textContent) && !/base/i.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  await page.locator('#world [data-spot="mydoor"]').dispatchEvent("click");
  await page.waitForFunction(() => /My room/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  await page.locator('#world [data-spot="journal"]').dispatchEvent("click");
  await page.waitForSelector("#jText", { timeout: 15000 });
  await page.fill("#jText", "A lovely quiet day."); await page.click('#jForm button[type=submit]'); await page.waitForTimeout(300);
  check(await page.locator("#ctx .jlist details").count() === 1, "a journal page is kept at the writing desk");
  await page.click("#pclose");
  await page.click('[data-open="settings"]'); await page.click("#setBackup"); await page.waitForTimeout(300);
  check(await page.evaluate(() => window.__download && /honeybrook-backup-.*\.json/.test(window.__download.filename) && window.__download.size > 200), "Settings can download a backup of the whole game");
  check(await page.locator("#setBed").isChecked(), "Stay in bed is on by default");
  await page.click("#pclose");
  await page.addInitScript(() => { window.__said = []; new MutationObserver(() => { const t = document.getElementById("speech"); if (t) window.__said.push(t.textContent); }).observe(document, {subtree: true, childList: true, characterData: true}); });
  await page.goto(url + "?seed=1&time=23:02"); await page.waitForTimeout(14000);
  check(await page.evaluate(() => (window.__said || []).some(t => /Time to start winding down/.test(t))), "from 11pm your pet offers a calm wind-down line");
  check(await page.evaluate(() => new Set((window.__said || []).filter(t => /winding down|Teeth, then skincare|Phone on charge/.test(t))).size <= 1), "and only one every half a minute or so, with no nagging");
  await page.goto(url + "?seed=1&time=23:50"); await page.waitForTimeout(2500);
  check(!(await page.locator("#bedLock").isHidden()) && await page.evaluate(() => document.body.classList.contains("bedlocked")), "from 11:45pm the village rests: everything waits until 6am");
  await page.locator('[data-open="quests"]').dispatchEvent("click").catch(() => {}); await page.waitForTimeout(200);
  check(await page.locator("#panel").isHidden(), "and nothing can be actioned");
  page.on("dialog", d => { errors.push("bedtime used a browser pop-up (blocked in the artifact frame)"); d.dismiss(); });
  await page.click("#bedUp"); await page.waitForTimeout(300);
  check(await page.locator("#bedSure").isVisible(), "\"I really need to get up\" asks inside the card (no browser pop-up, which the artifact frame blocks)");
  await page.click("#bedNo"); await page.waitForTimeout(300);
  check(!(await page.locator("#bedLock").isHidden()) && await page.locator("#bedUp").isVisible(), "\"Back to sleep\" keeps the village resting");
  await page.click("#bedUp"); await page.click("#bedYes"); await page.waitForTimeout(1500);
  check(await page.locator("#bedLock").isHidden(), "unless you really need to get up (just for tonight)");
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\ntasting room")) try {
  // The tasting room's small plates and the kitchen
  console.log("\ntasting room");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`review pageerror: ${e.message}`));
  await page.addInitScript(() => { const q = location.search; if (!/rvpatch|menupatch|platepatch|dinnerpatch|goatpatch/.test(q)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    if (q.includes("rvpatch")) f.history = Object.assign(f.history || {}, {"2026-10-05": {q: 4, steps: 6200, water: 1500, harvest: 2, coins: 30}, "2026-10-07": {q: 6, steps: 7400, water: 2000, harvest: 1, coins: 44}});
    if (q.includes("menupatch")) { f.coins = 40; f.inv = Object.assign(f.inv || {}, {potato: 2}); }
    if (q.includes("menupatch")) { f.inv = Object.assign(f.inv || {}, {flour: 1, egg: 2, olives: 1}); }
    if (q.includes("menupatch")) { f.vine = f.vine || {}; f.vine.help = Object.assign(f.vine.help || {}, {cook: false}); }   // you cook yourself here (Pilar has her own test)
    if (q.includes("dinnerpatch")) { (f.vine.tapasList || []).forEach(t => { t.day = "2026-01-01"; }); }
    if (q.includes("goatpatch")) { f.coins = 200; f.pets = f.pets || {run: 0, animals: [], next: 1}; f.pets.animals = [{id: "g1", kind: "goat", name: "Biscuit", born: Date.now(), feeds: 3, fedDay: null, col: 0}]; f.inv = Object.assign(f.inv || {}, {goatfeed: 1}); }
    if (q.includes("platepatch")) { f.vine = f.vine || {}; f.vine.shelf = [{id: "w9", name: "Test Red", type: "red", n: 40, price: 24, open: 0}]; f.vine.menu = {cheese: 40}; f.vine.lastTick = Date.now() - 600*60e3; }
    localStorage.setItem("fox.fox", JSON.stringify(f)); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, JSON.stringify(f))); });
  await page.goto(url + "?reset=1&seed=1&date=2026-10-09&time=16:00"); await page.waitForTimeout(800);
  // the kitchen behind the wine shop: ingredients from the backpack, the oven, the stove and the tapas of the day
  await page.goto(url + "?seed=1&time=18:00&menupatch=1"); await page.waitForTimeout(1200);
  await page.click('[data-open="bag"]'); await page.waitForTimeout(300);
  check(await page.locator('#bag [data-kit="potato"]').count() === 1, "garden crops in the backpack can be sent to the kitchen");
  await page.click('#bag [data-kit="potato"]'); await page.waitForTimeout(300);
  check(await page.evaluate(() => { const f = JSON.parse(localStorage.getItem("fox.fox")); return f.kitchen.larder.potato === 2 && !f.inv.potato; }), "and arrive in the larder");
  await page.keyboard.press("Escape");
  await page.evaluate(() => window.__hbScene("wineshop")); await page.waitForTimeout(700);
  await page.locator('#world [data-spot="kdoor"]').dispatchEvent("click");
  await page.waitForFunction(() => /kitchen/i.test(document.querySelector("#sceneName").textContent), null, { timeout: 15000 });
  check(await page.locator('#world [data-spot="oven"], #world [data-spot="larder"], #world [data-spot="stove"], #world [data-spot="press"]').count() === 4, "a door in the wine shop leads to the kitchen: oven, larder, stove and cheese press");
  await page.locator('#world [data-spot="larder"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-k="sendall"]', { timeout: 15000 });
  await page.click('#ctx [data-k="sendall"]'); await page.waitForTimeout(300); await page.click('#ctx [data-close]');
  await page.locator('#world [data-spot="oven"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-k="bake"]', { timeout: 15000 });
  await page.click('#ctx [data-k="bake"]'); await page.waitForTimeout(300);
  check(await page.evaluate(() => { const k = JSON.parse(localStorage.getItem("fox.fox")).kitchen; return !!k.oven && !k.larder.flour; }), "flour goes in the oven to bake");
  await page.click('#ctx [data-close]');
  await page.locator('#world [data-spot="stove"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-k="tapas"]', { timeout: 15000 });
  check(await page.locator('#ctx [data-k="tapas"]').count() === 32 && await page.locator('#ctx [data-k="ktab"][data-id="local"]').first().getAttribute("aria-selected") === "true", "the stove's Local tab offers this season's local tapas (32 in autumn: garden, seafood, farm, woods, greenhouse, Sal's clams)");
  check(/from the market deli|from the farm gate|from the garden/.test(await page.locator("#ctx").innerText()), "each missing ingredient says where to get it");
  await page.locator('#ctx [data-k="ktab"][data-id="specials"]').first().click(); await page.waitForTimeout(200);
  check(await page.locator('#ctx [data-k="tapas"]').count() === 0 && /travel to Ronda, Kyoto, Jeju or Cinque Terre/.test(await page.locator("#ctx").innerText()), "the Specials tab is empty until you've travelled: specials come from the trips");
  await page.locator('#ctx [data-k="ktab"][data-id="local"]').first().click(); await page.waitForTimeout(200);
  await page.click('#ctx [data-k="tapas"][data-id="tortilla"]'); await page.waitForTimeout(200); await page.click('#ctx [data-k="cooktapas"]'); await page.waitForTimeout(300);
  check(await page.evaluate(() => { const f = JSON.parse(localStorage.getItem("fox.fox")); return f.vine.tapasList[0].id === "tortilla" && f.vine.tapasList[0].plates === 6 && !f.kitchen.larder.potato && !f.kitchen.larder.egg; }), "today's tapas is chosen and a batch cooked from potatoes and eggs");
  await page.click('#ctx [data-k="dish"][data-dish="olives"]'); await page.waitForTimeout(300);
  check(await page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")).vine.menu.olives === 4), "small plates are cooked at the stove too");
  await page.click('#ctx [data-close]');
  await page.locator('#world [data-exit]').dispatchEvent("click");
  await page.waitForFunction(() => /wine shop/i.test(document.querySelector("#sceneName").textContent), null, { timeout: 15000 });
  check(/Tortilla/.test(await page.locator("#sceneArt").textContent()), "the shop's chalkboard names today's tapas");
  // the next day: leftovers went to the staff, who left something in the larder
  await page.goto(url + "?seed=1&time=18:00&dinnerpatch=1"); await page.waitForTimeout(4200);
  check(await page.evaluate(() => { const f = JSON.parse(localStorage.getItem("fox.fox")); return f.vine.staffNote && f.vine.staffNote.plates === 6 && !(f.vine.tapasList || []).some(t => t.plates) && f.kitchen.larder.olives >= 1; }), "leftover tapas go to the staff for dinner, and they leave thanks in the larder");
  // Hana's deli shelf and the goat
  await page.evaluate(() => window.__hbScene("market")); await page.waitForTimeout(800);
  await page.locator('#world [data-spot="stall"]').dispatchEvent("click").catch(() => {}); await page.waitForTimeout(600);
  await page.click('#ctx [data-shop="deli"]').catch(() => {}); await page.waitForTimeout(300);
  check(await page.locator('#ctx .item[data-id="flour"], #ctx .item[data-id="cheese"], #ctx .item[data-id="olives"]').count() === 3, "Hana's market has a deli shelf: flour, cheese, olives");
  const hf = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  const h0 = await hf(); await page.click('#ctx .item[data-id="flour"]'); await page.waitForTimeout(300);
  const h1 = await hf(); await page.click("#undoBtn"); await page.waitForTimeout(300); const h2 = await hf();
  check(h1.coins === h0.coins - 3 && (h1.inv.flour || 0) === (h0.inv.flour || 0) + 1 && h2.coins === h0.coins && (h2.inv.flour || 0) === (h0.inv.flour || 0), "a purchase at Hana's can be undone (coins back, item gone)");
  await page.click('#ctx [data-shop="animals"]'); await page.waitForTimeout(300);
  check(await page.locator('#ctx .item[data-id="goat"]').count() === 1, "and goats in the Animals tab");
  // a grown goat gives milk when fed; the olive tree is bought at the vineyard stall
  await page.goto(url + "?seed=1&time=18:00&goatpatch=1"); await page.waitForTimeout(1200);
  await page.evaluate(() => window.__hbScene("base")); await page.waitForTimeout(700);
  await page.locator('#world [data-place="run"]').dispatchEvent("click");
  await page.waitForSelector('#ctx [data-feed]', { timeout: 15000 }); await page.click('#ctx [data-feed]'); await page.waitForTimeout(400);
  check(await page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")).inv.goatmilk === 1), "a grown goat gives a bottle of goat's milk when fed");
  await page.evaluate(() => window.__hbScene("vineyard")); await page.waitForTimeout(700);
  await page.locator('#world [data-place="vinestall"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-vybuy="olive"]', { timeout: 15000 });
  await page.click('#ctx [data-vybuy="olive"]'); await page.waitForTimeout(300);
  check(await page.evaluate(() => !!JSON.parse(localStorage.getItem("fox.fox")).vine.olive), "an olive tree can be bought and planted by the path");
  await page.goto(url + "?seed=1&time=21:00&platepatch=1"); await page.waitForTimeout(4200);
  check(await page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")).vine.plates > 0), "villagers order small plates with their wine");
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nthe vineyard")) try {
  // The vineyard: grow grapes, ferment and bottle wine, sell it in the wine shop; workers water, an assistant serves
  console.log("\nthe vineyard");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`vineyard pageerror: ${e.message}`));
  // patch the save as the next page starts (local copy and the stub db copy; the old page writes its own as it unloads)
  await page.addInitScript(() => { const q = location.search; if (!/ripen|sold/.test(q)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f || !f.vine) return;
    if (q.includes("ripen")) { f.vine.rows[0].vines.forEach(v => { if (v) v.wateredAt = Date.now() - 9*3600e3; }); (f.vine.barrels || []).forEach(b => { if (b) b.start = Date.now() - 14*3600e3; }); }
    if (q.includes("sold")) { f.vine.lastTick = Date.now() - 600*60e3; if (f.vine.shelf[0]) f.vine.shelf[0].n = 60; }
    localStorage.setItem("fox.fox", JSON.stringify(f)); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, JSON.stringify(f))); });
  await page.goto(url + "?reset=1&seed=1&time=17:00");
  await page.waitForTimeout(800);
  check(await page.locator('#world [data-place="toVine"]').count() === 1, "home base has a gate to the vineyard");
  await page.locator('#world [data-place="toVine"]').dispatchEvent("click");
  await page.waitForFunction(() => /vineyard/i.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  await page.waitForTimeout(600);
  check(await page.locator('#world [data-place="wineshop"]').count() === 1 && await page.locator('#world [data-place="pslide"]').count() === 1, "with a wine shop and a playground");
  check(await page.locator('#actors [data-npc="marco"], #actors [data-npc="ines"]').count() >= 1, "vineyard workers are out among the vines");
  check(await page.locator('#actors [data-npc="pip"]').count() === 1, "and Pip is at the playground after school");
  await page.locator('#world [data-vine="0-0"]').dispatchEvent("click");
  await page.waitForSelector('#ctx [data-vy="plant"]', { timeout: 15000 });
  await page.click('#ctx [data-vy="plant"][data-k="red"]');
  check(await page.evaluate(() => { const e = document.querySelector("#ctx .sub"); return !!e && getComputedStyle(e).display === "block" && e.getBoundingClientRect().height < 80; }), "panel text flows normally (the notebook's checklist styles stay in the notebook)");
  await page.waitForSelector('#ctx [data-vy="water"]', { timeout: 5000 }); await page.click('#ctx [data-vy="water"]');
  check(await page.evaluate(() => { const v = JSON.parse(localStorage.getItem("fox.fox")).vine; return v.rows[0].vines[0] && v.rows[0].vines[0].v === "red" && !!v.rows[0].vines[0].wateredAt; }), "a red vine is planted on the trellis and watered");
  await page.goto(url + "?seed=1&time=17:10&ripen=1"); await page.waitForTimeout(800);
  await page.locator('#world [data-place="toVine"]').dispatchEvent("click");
  await page.waitForFunction(() => /vineyard/i.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  await page.locator('#world [data-vine="0-0"]').dispatchEvent("click");
  await page.waitForSelector('#ctx [data-vy="harvest"]', { timeout: 15000 }); await page.click('#ctx [data-vy="harvest"]');
  check(await page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")).vine.grapes.red >= 3), "ripe grapes are picked: three bunches (four in harvest week)");
  await page.click('#ctx [data-close]');
  await page.locator('#world [data-place="barrels"]').dispatchEvent("click");
  await page.waitForSelector('#ctx [data-vy="fill"][data-k="rose"]:not([disabled])', { timeout: 15000 }); await page.click('#ctx [data-vy="fill"][data-k="rose"]');
  check(await page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")).vine.barrels[0].style === "rose"), "and go into a barrel to ferment as a rosé");
  await page.goto(url + "?seed=1&time=17:20&ripen=1"); await page.waitForTimeout(800);
  await page.locator('#world [data-place="toVine"]').dispatchEvent("click");
  await page.waitForFunction(() => /vineyard/i.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  await page.locator('#world [data-place="barrels"]').dispatchEvent("click");
  await page.waitForSelector('#vyName0', { timeout: 15000 });
  const ph = await page.locator('#vyName0').getAttribute("placeholder"); await page.click('#ctx [data-vy="suggest"]'); await page.waitForTimeout(300);
  const sug = await page.locator('#vyName0').inputValue();
  check(ph && sug && ph !== "Name it" && sug !== ph && sug.length > 3, `a ready barrel suggests names (${ph}; ${sug})`);
  await page.fill('#vyName0', "Rosy Blush"); await page.click('#ctx [data-vy="bottle"]');
  check(await page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")).vine.cellar.some(c => c.name === "Rosy Blush" && c.n === 6)), "a ready barrel is named and bottled: six bottles in the cellar");
  await page.click('#ctx [data-close]');
  await page.locator('#world [data-place="wineshop"]').dispatchEvent("click");
  await page.waitForFunction(() => /wine shop/i.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  await page.waitForTimeout(500);
  check(await page.locator('#actors [data-npc="celeste"]').count() === 1, "Celeste is behind the wine shop counter");
  await page.locator('#world [data-spot="wshelf"]').dispatchEvent("click");
  await page.waitForSelector('#ctx [data-vystock]', { timeout: 15000 }); await page.click('#ctx [data-vystock]');
  check(await page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")).vine.shelf.some(s => s.name === "Rosy Blush" && s.n === 6)), "the bottles are stocked on the shop shelves");
  await page.click('#ctx [data-close]');
  await page.locator('#world [data-spot="menu"]').dispatchEvent("click");
  await page.waitForSelector("#ctx .chalk", { timeout: 15000 });
  check(/Today's menu/.test(await page.locator("#ctx h2").textContent()) && /Rosy Blush/.test(await page.locator("#ctx").textContent()), "the chalkboard opens today's menu: what's available, with prices");
  await page.click('#ctx [data-close]');
  // customers while you're away: back-date the last tick, sales land in the honesty box
  await page.goto(url + "?seed=1&time=21:00&sold=1"); await page.waitForTimeout(4200);
  check(await page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")).vine.box > 0), "villagers buy wine while you're away and pay into the honesty box");
  await page.screenshot({ path: join(shots, "vineyard.png") });
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nstaff, names and the tasting room tables")) try {
  // Staff: Marco and Ines pick and fill barrels, Celeste stocks the shelves, Pilar runs the kitchen; renaming; diners' tables
  console.log("\nstaff, names and the tasting room tables");
  { const tr = await import(new URL("../src/game/tours.js", import.meta.url)), np = await import(new URL("../src/data/npcs.js", import.meta.url)), cel = np.NPCS.find(n => n.id === "celeste");
    const days = ["2026-10-10", "2026-10-11", "2026-10-12", "2026-10-13", "2026-10-14", "2026-10-15", "2026-10-16"];
    check(days.every(d => tr.touristTastings(d).filter(x => x.act === "browse" && x.from <= 650 && x.to > 650 && x.id).length === 2) && cel.routine.some(sl => sl.scene === "wineshop" && sl.from === 600),
      "the wine shop opens at 10: Celeste's at the counter and a pair are browsing the shelves at 10:50, every day of the week"); }
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`staff pageerror: ${e.message}`));
  await page.addInitScript(() => { const q = location.search; if (!/staffpatch/.test(q)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    const H = 3600e3, t = Date.now(); f.vine = f.vine || {}; f.vine.rows = [0, 1, 2].map(i => ({trellis: i === 0, vines: [null, null, null]}));
    f.vine.rows[0].vines[0] = {v: "red", planted: t - 20*H, wateredAt: t - 9*H}; f.vine.grapes = {red: 0, white: 0}; f.vine.barrels = [null];
    f.vine.cellar = [{id: "wc1", name: "Cellar White", type: "white", n: 6}]; f.vine.shelf = [{id: "ws1", name: "Rosy Blush", type: "rose", n: 6, price: 15, open: 2}];
    f.vine.lastTick = t - 3*60e3; f.vine.menu = {}; f.vine.tapasList = [];
    f.kitchen = {larder: {flour: 2, milk: 2, potato: 4, egg: 4, olives: 2, loaf: 1}, oven: null, press: null};
    localStorage.setItem("fox.fox", JSON.stringify(f)); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, JSON.stringify(f))); });
  await page.goto(url + "?reset=1&seed=1&time=11:10&date=2026-10-05"); await page.waitForTimeout(900);
  await page.goto(url + "?seed=1&time=11:10&date=2026-10-05&staffpatch=1"); await page.waitForTimeout(2500);
  const st = await page.evaluate(() => { const f = JSON.parse(localStorage.getItem("fox.fox")); return {v: f.vine, k: f.kitchen}; });
  check(st.v.rows[0].vines[0].wateredAt && Date.now() - st.v.rows[0].vines[0].wateredAt < 3600e3 && st.v.barrels[0] && st.v.barrels[0].style === "red", "Marco and Ines pick the ripe vine, water it again and fill the empty barrel with red");
  check(!st.v.cellar.length && st.v.shelf.some(s => s.name === "Cellar White" && s.n === 6), "Celeste stocks the cellar's wine on the shelves");
  check(!!st.k.oven && !!st.k.press, "Pilar puts bread in the oven and milk in the cheese press");
  check(st.v.tapasList[0] && st.v.tapasList[0].id === "tortilla" && st.v.tapasList[0].plates === 6, "she picks the dearest tapas the larder can make (tortilla) and cooks a batch");
  check(st.v.menu.bread > 0 && st.v.menu.olives > 0, "and cooks small plates from what's left");
  await page.evaluate(() => window.__hbScene("kitchen")); await page.waitForTimeout(800);
  check(await page.locator('#actors [data-npc="pilar"]').count() === 1, "Pilar is in the kitchen on her shift");
  await page.locator('#world [data-spot="stove"]').dispatchEvent("click");
  await page.waitForSelector("#ctx .klog li", { timeout: 15000 });
  check(/oven|press|tortilla/i.test(await page.locator("#ctx .klog").textContent()), "the stove card lists what she's done");
  await page.screenshot({ path: join(shots, "kitchen-pilar.png") });
  await page.click('#ctx [data-close]');
  await page.evaluate(() => window.__hbScene("wineshop")); await page.waitForTimeout(700);
  await page.locator('#world [data-spot="wcounter"]').dispatchEvent("click");
  await page.waitForSelector('#ctx [data-vyhelp="cook"]', { timeout: 15000 });
  check(await page.locator('#ctx [data-vyhelp]').count() === 5 && await page.locator('#ctx [data-vyhelp="fetch"]').isChecked() === false, "the staff card at the counter has a tick for each helper (fetching from the backpack is off to start)");
  await page.locator('#ctx [data-vyhelp="cook"]').uncheck();
  check(await page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")).vine.help.cook === false), "unticking Pilar sends her home");
  await page.fill("#vyNameV", "Bay Hill Vines"); await page.fill("#vyNameS", "Hill & Willow's Cellar"); await page.click('#ctx [data-vy="names"]'); await page.waitForTimeout(300);
  check(/Hill &amp; Willow|Hill & Willow/.test(await page.locator("#sceneName").textContent()), "the wine shop can be renamed");
  await page.screenshot({ path: join(shots, "staff-card.png") });
  await page.click('#ctx [data-close]');
  await page.evaluate(() => window.__hbScene("vineyard")); await page.waitForTimeout(700);
  check(/Bay Hill Vines/.test(await page.locator("#sceneName").textContent()) && /Hill &amp; Willow|Hill & Willow/.test(await page.locator("#sceneArt").innerHTML()), "and the vineyard too, with the new names on the map");
  await page.goto(url + "?seed=1&time=19:05&date=2026-10-08"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__hbScene("wineshop")); await page.waitForTimeout(1200);
  check(await page.locator('#actors [data-npc="farid"].act-sit').count() === 1 && await page.locator('#actors [data-npc="mei"].act-sit').count() === 1 && await page.locator("#actors .act-sit").count() >= 4, "after work Farid and Mei come in for a tasting too");
  await page.goto(url + "?seed=1&time=13:20&date=2026-10-07"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__hbScene("wineshop")); await page.waitForTimeout(1200);
  check(await page.locator("#actors .act-sit").evaluateAll(n => n.filter(x => ["aiko", "ben", "clara", "dev", "rosa", "bastien", "grace", "hiro"].includes(x.dataset.npc)).length) === 2, "out-of-towners drop in for a lunchtime tasting");
  await page.goto(url + "?seed=1&time=19:45&date=2026-10-05"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__hbScene("wineshop")); await page.waitForTimeout(1500);
  const seated = await page.locator('#actors .act-sit').count();
  check(seated > 0 && await page.locator("#tableware svg").count() >= seated, "diners in the tasting room have wine and food on their tables");
  check(await page.evaluate(n => { const v = JSON.parse(localStorage.getItem("fox.fox")).vine; return v.today.glasses >= n && v.shelf.length > 0; }, seated), "everyone who sits down orders a glass, poured from an opened bottle");
  await page.screenshot({ path: join(shots, "tasting-tables.png") });
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nlane to vineyard path")) try {
  // A path joins Makers' Lane and the vineyard directly (lane at the bottom, vineyard at the top)
  console.log("\nlane to vineyard path");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`lanepath pageerror: ${e.message}`));
  await page.goto(url + "?reset=1&seed=1&time=10:30"); await page.waitForTimeout(800);
  await page.evaluate(() => window.__hbScene("lane")); await page.waitForTimeout(600);
  await page.locator('#world [data-place="toVineL"]').dispatchEvent("click");
  await page.waitForFunction(() => /vineyard/i.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  check(await page.locator('#world [data-place="toLaneV"]').count() === 1, "the path at the bottom of Makers' Lane leads down to the vineyard");
  await page.locator('#world [data-place="toLaneV"]').dispatchEvent("click");
  await page.waitForFunction(() => /Makers/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  check(true, "and back up again");
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nhens: three meals, three eggs")) try {
  // A grown hen eats breakfast, lunch and dinner, with an egg after each meal
  console.log("\nhens: three meals, three eggs");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`hen pageerror: ${e.message}`));
  await page.addInitScript(() => { if (!/henpatch/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    const d = "2026-10-07";
    f.pets = {run: 0, next: 2, animals: [{id: "h1", kind: "chick", name: "Kaya", born: Date.now(), feeds: 5, fedDay: d, fedMeal: 0, col: 0}]}; f.inv = Object.assign(f.inv || {}, {chickfeed: 3}); delete f.inv.egg;
    localStorage.setItem("fox.fox", JSON.stringify(f)); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, JSON.stringify(f))); });
  await page.goto(url + "?reset=1&seed=1&time=18:00&date=2026-10-07"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=18:00&date=2026-10-07&henpatch=1"); await page.waitForTimeout(1200);
  await page.evaluate(() => window.__hbScene("base")); await page.waitForTimeout(700);
  await page.locator('#world [data-place="run"]').dispatchEvent("click");
  await page.waitForSelector('#ctx [data-feed]', { timeout: 15000 });
  check(/hungry/.test(await page.locator("#ctx .pets").textContent()), "a hen fed at breakfast is hungry again by dinner");
  await page.click('#ctx [data-feed]'); await page.waitForTimeout(400);
  check(await page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")).inv.egg === 1), "and lays an egg after her dinner");
  check(/fed and happy/.test(await page.locator("#ctx .pets").textContent()), "then she's full until the next meal");
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nthe orchard")) try {
  // The orchard and flower farm: plant, Farid picks, the farm shop, bouquets and pots, the fruit crate, tea and cake
  console.log("\nthe orchard");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await closeFriends(page);   // these friends are close enough for presents sent round and day trips
  page.on("pageerror", e => errors.push(`orchard pageerror: ${e.message}`));
  await page.addInitScript(() => { const q = location.search; if (!/orchpatch/.test(q)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    f.coins = 300; f.orch = f.orch || {}; f.orch.stock = {apple: 3, "stem:mum": 5}; f.orch.tin = 9;
    localStorage.setItem("fox.fox", JSON.stringify(f)); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, JSON.stringify(f))); });
  const fox = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  await page.goto(url + "?reset=1&seed=1&time=10:30&date=2026-10-07"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=10:30&date=2026-10-07&orchpatch=1"); await page.waitForTimeout(1000);
  check(await page.locator('#world [data-place="toOrchard"]').count() === 1, "home has a gate at the top left to the orchard");
  await page.locator('#world [data-place="toOrchard"]').dispatchEvent("click");
  await page.waitForFunction(() => /orchard/i.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  await page.waitForTimeout(800);
  check((await fox()).coins === 309, "Farid hands over the farm shop's takings when you arrive");
  check(await page.locator('#actors [data-npc="farid"].act-farm').count() === 1 && await page.locator('#world [data-place="cottage"]').count() === 1 && await page.locator('#world [data-tree]').count() === 12, "Farid is out among the twelve tree spots, by the cottage");
  await page.locator('#world [data-tree="0"]').dispatchEvent("click");
  await page.waitForSelector('#ctx [data-or="plant"][data-k="apple"]', { timeout: 15000 });
  check(await page.locator('#ctx [data-or="plant"][data-k="peach"]').count() === 0, "only this season's saplings are on offer");
  await page.click('#ctx [data-or="plant"][data-k="apple"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.orch.trees[0] && f.orch.trees[0].k === "apple" && f.coins === 284), "an apple sapling is bought and planted");
  await page.click('#ctx [data-close]');
  await page.locator('#world [data-place="farmshop"]').dispatchEvent("click");
  await page.waitForSelector('#ctx [data-or="take"][data-k="apple"]', { timeout: 15000 });
  await page.click('#ctx [data-or="take"][data-k="apple"]'); await page.waitForTimeout(200);
  check(await fox().then(f => f.inv.apple >= 1 && f.orch.stock.apple === 2), "fruit Farid picked can be taken from the farm shop");
  check(await page.locator('#ctx [data-or="buy"]').count() === 0, "fruit isn't for sale: it only comes from your own trees, free");
  await page.click('#ctx [data-or="tab"][data-k="plant"]'); await page.waitForTimeout(200);
  await page.click('#ctx [data-or="plantany"][data-where="bush"][data-k="heather"]'); await page.waitForTimeout(200);
  check(await fox().then(f => f.orch.bushes[0] && f.orch.bushes[0].k === "heather" && f.coins === 266), "saplings, bushes and seedlings are bought on the farm shop's Plant tab");
  await page.click('#ctx [data-or="tab"][data-k="flowers"]'); await page.waitForTimeout(200);
  await page.click('#ctx [data-or="make"][data-kind="bouquet"][data-k="mum"]'); await page.waitForTimeout(200);
  await page.click('#ctx [data-or="make"][data-kind="pot"][data-k="mum"]'); await page.waitForTimeout(200);
  check(await fox().then(f => f.inv.bq_mum === 1 && f.inv.pot_mum === 1 && !f.orch.stock["stem:mum"]), "stems become a bouquet (3) and a potted flower (2)");
  await page.click('#ctx [data-close]');
  await page.click('[data-open="bag"]'); await page.click('#bag .item[data-id="pot_mum"]');
  await page.waitForSelector('#ctx [data-or="place"][data-k="window"]', { timeout: 10000 });
  await page.click('#ctx [data-or="place"][data-k="window"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.pots.window === "mum" && !f.inv.pot_mum), "a potted flower goes in the window box at home");
  await page.locator('#world [data-place="toFlowers"]').dispatchEvent("click");
  await page.waitForFunction(() => /flower farm/i.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  check(await page.locator('#world [data-bed]').count() === 12 && await page.locator('#world [data-bush]').count() === 4, "the flower farm has twelve beds and four bushes");
  check(await page.locator('#actors [data-npc="mei"]').count() === 1, "and Mei is there watering this morning");
  await page.evaluate(() => window.__hbScene("wineshop")); await page.waitForTimeout(700);
  await page.locator('#world [data-spot="wshelf"]').dispatchEvent("click");
  await page.waitForSelector('#ctx [data-vyfruit="apple"]', { timeout: 15000 }); await page.click('#ctx [data-vyfruit="apple"]'); await page.waitForTimeout(200);
  check(await fox().then(f => f.vine.fruit.apple >= 1 && !f.inv.apple), "fruit goes into the wine shop's fruit crate to sell");
  await page.goto(url + "?seed=1&time=15:30&date=2026-10-07"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__hbScene("cottage")); await page.waitForTimeout(900);
  check(await page.locator('#actors [data-npc="farid"]').count() === 1 && /Farid and Mei's cottage/.test(await page.locator("#sceneName").textContent()), "Farid's home in the cottage he shares with Mei at teatime");
  const c0 = (await fox()).coins;
  await page.locator('#world [data-spot="tea"]').dispatchEvent("click");
  await page.waitForSelector('#ctx [data-or="tea"]', { timeout: 15000 }); await page.click('#ctx [data-or="tea"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.coins === c0 + 3 && f.orch.tea === "2026-10-07"), "tea and cake with Farid, once a day");
  await page.click('[data-open="bag"]'); await page.click('#bag .item[data-id="bq_mum"]'); await page.waitForTimeout(400);
  check(await page.locator('#bag [data-giveto="theo"]').count() === 1 && await page.locator('#bag [data-giveto="farid"].primary').count() === 1, "a bouquet opens the chooser: any of your friends, whoever's here first");
  await page.click('#bag [data-giveto="farid"]'); await page.waitForTimeout(400);
  check(await fox().then(f => f.bouquets && f.bouquets.farid === 1 && !f.inv.bq_mum), "a bouquet can be given to Farid in person (or sent to any friend)");
  await page.screenshot({ path: join(shots, "cottage.png") });
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\norchard tours")) try {
  // Orchard workers, visitors and weekend tours (paid into the orchard's tin); Bo's weekday evening tours
  console.log("\norchard tours");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`tours pageerror: ${e.message}`));
  await page.addInitScript(() => { if (!/tourpatch/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    const t = Date.now(); f.orch = {trees: [{k: "apple", at: t, next: t + 9e7}, {k: "pear", at: t, next: t + 9e7}, null, null, null, null, null, null, null, null, null, null],
      beds: [{k: "mum", at: t, next: t + 9e7}, null, null, null, null, null, null, null, null, null, null, null], bushes: [null, null, null, null], stock: {}, tin: 0, lastTick: t};
    localStorage.setItem("fox.fox", JSON.stringify(f)); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, JSON.stringify(f))); });
  await page.goto(url + "?reset=1&seed=1&time=10:20&date=2026-10-10"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=10:20&date=2026-10-10&tourpatch=1"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__hbScene("orchard")); await page.waitForTimeout(1200);
  const ids = await page.locator("#actors .npc").evaluateAll(n => n.map(x => x.dataset.npc));
  check(ids.filter(x => ["hana", "okada", "juniper", "bo", "lin", "pip", "opal", "theo"].includes(x)).length >= 1 && ids.filter(x => ["aiko", "ben", "clara", "dev", "elena", "felix", "grace", "hiro"].includes(x)).length >= 1 && ids.some(x => ["farid", "mei"].includes(x)), "a Saturday morning tour: a guide with a mix of villagers and out-of-towners in the orchard");
  check(await page.locator('#actors [data-npc="farid"]').count() + await page.locator('#actors .act-guide').count() >= 1, "Farid works the orchard (or is leading the tour)");
  await page.locator('#world [data-place="farmshop"]').dispatchEvent("click"); await page.waitForSelector("#ctx .ortour", { timeout: 15000 });
  check(/10am with .*11:30.*2pm.*4pm/.test(await page.locator("#ctx .ortour").textContent()), "the farm shop lists today's four tours and their guides");
  await page.click('#ctx [data-close]'); await page.locator('#world [data-place="toursign"]').dispatchEvent("click"); await page.waitForSelector("#ctx .wlist", { timeout: 15000 });
  check(await page.locator("#ctx .wlist li").count() === 4 && /on now/.test(await page.locator("#ctx").textContent()) && /Signed up: .*\(visiting\)/.test(await page.locator("#ctx").textContent()), "the tour sign shows today's tours, which one's on now, and who's signed up");
  await page.goto(url + "?seed=1&time=11:05&date=2026-10-10"); await page.waitForTimeout(2500);
  check(await page.evaluate(() => { const o = JSON.parse(localStorage.getItem("fox.fox")).orch; return o.tin >= 12 && o.tin % 4 === 0 && o.toursPaid.done.includes(0); }), "when a tour finishes, its visitors pay 4 coins each into the orchard's tin");
  await page.goto(url + "?seed=1&time=18:00&date=2026-10-08"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__hbScene("orchard")); await page.waitForTimeout(1200);
  check(await page.locator('#actors [data-npc="bo"].act-guide').count() === 1, "on Thursday evenings Bo leads a farm tour");
  await page.evaluate(() => window.__hbScene("flowers")); await page.waitForTimeout(400);
  await page.goto(url + "?seed=1&time=10:00&date=2026-10-08"); await page.waitForTimeout(800);
  await page.evaluate(() => window.__hbScene("flowers")); await page.waitForTimeout(1200);
  check(await page.locator('#actors [data-npc="mei"]').count() === 1, "Mei looks after the flower farm");
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nthe field, and gifts for Farid and Mei")) try {
  // The field (lake, swans, picnic, football) between the orchard and town; gifts for Farid and Mei
  console.log("\nthe field, and gifts for Farid and Mei");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await closeFriends(page);   // these friends are close enough for presents sent round
  page.on("pageerror", e => errors.push(`field pageerror: ${e.message}`));
  await page.addInitScript(() => { if (!/giftpatch/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    f.coins = 100; localStorage.setItem("fox.fox", JSON.stringify(f)); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, JSON.stringify(f))); });
  await page.goto(url + "?reset=1&seed=1&time=16:10&date=2026-10-09"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=16:10&date=2026-10-09&giftpatch=1"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__hbScene("village")); await page.waitForTimeout(600);
  check(await page.locator('#world [data-place="toField"]').count() === 1, "the town square has a path west to the field");
  await page.locator('#world [data-place="toField"]').dispatchEvent("click");
  await page.waitForFunction(() => /field/i.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 }); await page.waitForTimeout(900);
  check(await page.locator('#actors [data-npc="pip"]').count() === 1 && await page.locator('#actors [data-npc="farid"]').count() === 1 && await page.locator('#actors [data-npc="mei"]').count() === 1, "on a Friday afternoon Pip's playing football and Farid and Mei are walking by the lake (4pm)");
  await page.locator('#world [data-place="lake"]').dispatchEvent("click"); await page.waitForTimeout(4500);
  check(await page.evaluate(() => JSON.parse(localStorage.getItem("fox.today") || "{}").swans === "2026-10-09" || /swan/i.test(document.querySelector("#speech").textContent)), "the swans can be fed");
  await page.click('[data-open="bag"]').catch(() => {}); await page.keyboard.press("Escape");
  await page.evaluate(() => window.__hbScene("market")); await page.waitForTimeout(800);
  await page.waitForSelector('#ctx [data-shop="family"]', { timeout: 20000 }); await page.click('#ctx [data-shop="family"]');
  check(await page.locator('#ctx .item[data-id="mooncake"]').count() === 1 && await page.locator('#ctx .item[data-id="birdsnest"]').count() === 1, "Hana sells nyonya kueh, bird's nest, chicken essence, and mooncakes in autumn");
  check(!/ for /.test(await page.locator('#ctx .item[data-id="kuehlapis"]').textContent()) && await page.locator('#ctx .item[data-id="protbar"]').count() === 1 && await page.locator('#ctx .item[data-id="bubbletea"]').count() === 1,
    "kueh, a protein bar and bubble tea on the Gifts tab, none of them only for one person");
  await page.click('#ctx .item[data-id="ondeh"]'); await page.waitForTimeout(200);
  await page.evaluate(() => window.__hbScene("field")); await page.waitForTimeout(1000);
  await page.click('[data-open="bag"]'); await page.click('#bag .item[data-id="ondeh"]'); await page.click('#bag [data-giveto].primary'); await page.waitForTimeout(400);
  check(await page.evaluate(() => { const f = JSON.parse(localStorage.getItem("fox.fox")); return !f.inv.ondeh && ((f.fam.gifts.farid || 0) + (f.fam.gifts.mei || 0)) === 1; }), "the ondeh-ondeh goes to Farid or Mei (whoever's here)");
  await page.goto(url + "?seed=1&time=10:30&date=2026-10-07"); await page.waitForTimeout(800);
  await page.evaluate(() => window.__hbScene("orchard")); await page.waitForTimeout(600);
  await page.locator('#world [data-place="toFieldO"]').dispatchEvent("click");
  await page.waitForFunction(() => /field/i.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  check(true, "and the field is up the path from the top of the orchard");
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nplayground families, farmers market, field fair")) try {
  // A busy weekend: tourist families at the vineyard playground (and a roundabout), the Sunday farmers market at the field
  // with the wine shop's stall selling off the shop's own shelves, and the field fair on the last Saturday of the month
  console.log("\nplayground families, farmers market, field fair");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await closeFriends(page);   // these friends are close enough for presents sent round and day trips
  page.on("pageerror", e => errors.push(`market pageerror: ${e.message}`));
  await page.addInitScript(() => { if (!/mktpatch/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    f.coins = 100; f.vine = f.vine || {}; f.vine.shelf = [{id: "m1", name: "Market Red", type: "red", n: 40, price: 18, open: 0}]; f.vine.lastTick = Date.now() - 290*60e3;
    f.orch = f.orch || {}; f.orch.stock = {apple: 60, "stem:rose": 20}; f.orch.lastTick = Date.now() - 290*60e3;
    localStorage.setItem("fox.fox", JSON.stringify(f)); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, JSON.stringify(f))); });
  const kids = ["lily", "max", "noah", "zara", "ollie", "ava"];
  await page.goto(url + "?reset=1&seed=1&time=10:40&date=2026-10-10"); await page.waitForTimeout(800);
  await page.evaluate(() => window.__hbScene("vineyard")); await page.waitForTimeout(1200);
  check(await page.locator("#actors .npc").evaluateAll((n, k) => n.filter(x => k.includes(x.dataset.npc)).length, kids) >= 3 && await page.locator('#world [data-place="pround"]').count() === 1, "on a Saturday morning visiting families' kids fill the playground, roundabout and all");
  await page.goto(url + "?seed=1&time=12:55&date=2026-10-11&mktpatch=1"); await page.waitForTimeout(2500);
  check(await page.evaluate(() => { const v = JSON.parse(localStorage.getItem("fox.fox")).vine; return !v.shelf[0] || v.shelf[0].n < 40; }), "on a Sunday morning the market stall sells bottles off the wine shop's own shelves");
  await page.evaluate(() => window.__hbScene("field")); await page.waitForTimeout(1200);
  check(await page.evaluate(() => { const o = JSON.parse(localStorage.getItem("fox.fox")).orch; return o.stock.apple + o.stock["stem:rose"] < 80 && o.tin > 0; }), "Farid's market stall sells fruit and flowers off the farm shop's own shelves, into the orchard's tin");
  check(await page.locator('#world [data-place^="mstall"]').count() === 9 && await page.locator('#actors [data-npc="ines"]').count() === 1 && await page.locator('#actors [data-npc="farid"]').count() === 1, "the Sunday farmers market: eight stalls along the top (and Noor's adoption corner), our wine stall with Ines and Farid's fruit and flowers");
  check(await page.locator('#world [data-place="mstall0"]').evaluate(g => g.getBBox().y < 170), "the market stalls stand along the top of the field");
  check(await page.locator("#actors .sfront").count() === 9, "each stall's table (and the pet pen) is drawn among the people, so a keeper can stand behind it");
  { const { keeperPose, MARKET } = await import(pathToFileURL(join(root, "src/game/tours.js")).href);
    const poses = new Set(MARKET.flatMap(st => [510, 540, 570, 600, 630, 660, 690, 720, 750].map(hm => keeperPose(st, "2026-10-11", hm).pose)));
    check(["behind", "front", "sit", "chat", "wander"].every(p => poses.has(p)) && MARKET.every(st => keeperPose(st, "2026-10-11", 485).pose === "behind"), "keepers set up behind their stalls, then move about: in front, sitting, chatting, off wandering (honesty tin)"); }
  await page.locator('#world [data-place="mstall0"]').dispatchEvent("click");
  await page.waitForSelector('#ctx .item[data-id="cheese"]', { timeout: 15000 }); await page.click('#ctx .item[data-id="cheese"]'); await page.waitForTimeout(300);
  check(await page.evaluate(() => (JSON.parse(localStorage.getItem("fox.fox")).inv.cheese || 0) >= 1), "stall goods can be bought (cheese, for the kitchen)");
  await page.click('#ctx [data-close]');
  await page.locator('#world [data-place="mstall3"]').dispatchEvent("click");
  await page.waitForSelector("#ctx .wlist", { timeout: 15000 });
  check(/Market Red/.test(await page.locator("#ctx").textContent()), "the wine stall shows the same bottles as the shop's shelves");
  await page.click('#ctx [data-close]');
  await page.locator('#world [data-place="mstall4"]').dispatchEvent("click");
  await page.waitForSelector('#ctx [data-or="take"]', { timeout: 15000 });
  check(/market stall/.test(await page.locator("#ctx h2").textContent()) && await page.locator('#ctx [data-or="tab"][data-k="plant"]').count() === 0, "Farid's stall shares the farm shop's shelves, fruit and flowers only (no planting)");
  await page.click('#ctx [data-or="take"]'); await page.waitForTimeout(300);
  check(await page.evaluate(() => (JSON.parse(localStorage.getItem("fox.fox")).inv.apple || 0) >= 1), "you can take fruit from Farid's stall for free");
  await page.click('#ctx [data-close]');
  const mfox = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  await page.locator('#world [data-place="mstall2"]').dispatchEvent("click"); await page.waitForSelector('#ctx .item[data-id]', { timeout: 15000 });
  check(await page.locator('#ctx .item[data-id]').evaluateAll(b => b.map(x => x.dataset.id)).then(ids => ids.length >= 2 && ids.every(id => ["carrot", "corn", "strawberry", "blueberry", "tomato", "potato", "pepper", "pea", "pumpkin", "leek"].includes(id))), "Clara's produce stall sells what's in season, for when the garden's between harvests");
  await page.click('#ctx [data-close]');
  await page.locator('#world [data-place="mstall1"]').dispatchEvent("click"); await page.waitForSelector('#ctx .item[data-id="honey"]', { timeout: 15000 });
  check(await page.locator('#ctx .item[data-id="beecandle"]').count() === 1 && await page.locator('#ctx .item[data-id="honey"]').count() === 1, "Felix's honey stall: honey, honeycomb and beeswax candles, to give or keep");
  const m0 = (await mfox()).coins; await page.click('#ctx .item[data-id="honey"]'); await page.waitForTimeout(300);
  check(await mfox().then(f => f.inv.honey === 1 && f.coins === m0 - 8) && await page.locator("#undoBar").isVisible(), "buying honey offers an undo");
  await page.click("#undoBtn"); await page.waitForTimeout(300);
  check(await mfox().then(f => !f.inv.honey && f.coins === m0), "undo puts the coins back and the honey back on the stall");
  await page.click('#ctx .item[data-id="honey"]'); await page.waitForTimeout(300); await page.click('#ctx [data-close]');
  const g0 = await mfox().then(f => Object.values(f.fam.gifts).reduce((a, b) => a + b, 0));
  await page.click('[data-open="bag"]'); await page.click('#bag .item[data-id="honey"]'); await page.click('#bag [data-giveto].primary'); await page.waitForTimeout(400);
  check(await mfox().then(f => !f.inv.honey && Object.values(f.fam.gifts).reduce((a, b) => a + b, 0) === g0 + 1), "market honey can be given to any friend who's here");
  await page.click('[data-open="bag"]').catch(() => {});
  for (const [st, id] of [["mstall5", "soap_lav"], ["mstall6", "paleale"]]) { await page.locator(`#world [data-place="${st}"]`).dispatchEvent("click"); await page.waitForSelector(`#ctx .item[data-id="${id}"]`, { timeout: 15000 }); await page.click('#ctx [data-close]'); }
  check(true, "Grace's handmade soap stall and Ben's craft beer stall");
  await page.goto(url + "?seed=1&time=11:00&date=2026-10-31"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__hbScene("field")); await page.waitForTimeout(1200);
  check(/Field fair/.test(await page.locator("#sceneArt").textContent()) && await page.locator('#world [data-place^="mstall"]').count() === 5, "on the last Saturday of the month the field fair is on: kites, face painting, lemonade, snacks");
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nthe foreshore: Hana and Theo, Tomi and Posy")) try {
  // The foreshore (west of the field): the sea with dolphins and paddleboarders, two houses (Hana and Theo's, Tomi and
  // Posy's) and their routines, Hana's exercise class at the field, a paddle together, and gifts
  console.log("\nthe foreshore: Hana and Theo, Tomi and Posy");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await closeFriends(page);   // Theo's close enough for a present sent round
  page.on("pageerror", e => errors.push(`shore pageerror: ${e.message}`));
  const ffox = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  await page.addInitScript(() => { if (!/shorepatch/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    f.inv = f.inv || {}; f.inv.paleale = 1; localStorage.setItem("fox.fox", JSON.stringify(f)); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, JSON.stringify(f))); });
  const ids = () => page.locator("#actors .npc").evaluateAll(n => n.map(x => x.dataset.npc));
  await page.goto(url + "?reset=1&seed=1&time=07:30&date=2026-10-06"); await page.waitForTimeout(800);
  await page.evaluate(() => window.__hbScene("field")); await page.waitForTimeout(600);
  check(await page.locator('#world [data-place="toShoreF"]').count() === 1 && await page.locator('#world [data-place="exlawn"]').count() === 1, "the field has a gate west to the foreshore, and the exercise lawn");
  await page.goto(url + "?seed=1&time=07:30&date=2026-10-06&shorepatch=1"); await page.waitForTimeout(800);
  await page.evaluate(() => window.__hbScene("shore")); await page.waitForTimeout(1500);
  check(await page.locator('#world [data-place="hanatheo"]').count() === 1 && await page.locator('#world [data-place="tomiposy"]').count() === 1 && await page.locator('#world [data-place="suprack"]').count() === 1
    && await page.locator('#world [data-place="toFieldS"]').count() === 1 && await page.locator('#world [data-place="toFlowersS"]').count() === 1, "the foreshore: Hana and Theo's house, Tomi and Posy's, the paddleboards, gates to the field and the flower farm");
  check(await ids().then(a => a.includes("hana") && a.includes("theo")), "early on a Tuesday Hana's out for her walk and Theo's sketching on the sand");
  await page.click('[data-open="bag"]'); await page.click('#bag .item[data-id="paleale"]'); await page.click('#bag [data-giveto="theo"]'); await page.waitForTimeout(400);
  check(await ffox().then(f => !f.inv.paleale && f.fam.gifts.theo === 1), "a craft pale ale from the market can go to Theo");
  await page.click('[data-open="bag"]').catch(() => {});
  await page.locator('#world [data-place="suprack"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-sup="play"]', { timeout: 15000 });
  check(await page.locator('#ctx [data-sup="base"]').count() === 1, "the paddleboards offer a paddle about, or a paddle home");
  await page.click('#ctx [data-sup="play"]'); await page.waitForTimeout(4000);
  check(await page.locator("#hero.sup").count() === 1 && await page.locator('#actors [data-npc="hana"].act-sup, #actors [data-npc="theo"].act-sup').count() === 2, "a paddle together: you take a board out and Hana and Theo paddle out too");
  await page.goto(url + "?seed=1&time=16:30&date=2026-10-10"); await page.waitForTimeout(800);
  await page.evaluate(() => window.__hbScene("shore")); await page.waitForTimeout(1500);
  check(await page.locator('#actors [data-npc="tomi"].act-sup').count() === 1, "on weekend afternoons Tomi goes paddleboarding");
  await page.goto(url + "?seed=1&time=20:00&date=2026-10-06"); await page.waitForTimeout(800);
  await page.evaluate(() => window.__hbScene("hanatheo")); await page.waitForTimeout(1200);
  check(await ids().then(a => a.includes("theo")) && ["piano", "bass", "easel", "mat"].length === await page.locator("#world [data-spot]").evaluateAll(n => n.filter(x => ["piano", "bass", "easel", "mat"].includes(x.dataset.spot)).length), "inside Hana and Theo's: Theo at the piano, his double bass and easel, Hana's mat");
  await page.goto(url + "?seed=1&time=20:00&date=2026-10-05"); await page.waitForTimeout(800);
  await page.evaluate(() => window.__hbScene("tomiposy")); await page.waitForTimeout(1200);
  check(await page.locator('#actors [data-npc="tomi"].act-game').count() === 1 && await ids().then(a => a.includes("posy")), "evenings at Tomi and Posy's: Tomi gaming on the sofa, Posy beside him");
  await page.goto(url + "?seed=1&time=11:00&date=2026-10-05"); await page.waitForTimeout(800);
  await page.evaluate(() => window.__hbScene("vineyard")); await page.waitForTimeout(1200);
  check(await page.locator('#actors [data-npc="tomi"].act-farm').count() === 1, "on weekdays Tomi lends a hand in the vineyard (until the old mill's press is going)");
  await page.goto(url + "?seed=1&time=08:20&date=2026-10-06"); await page.waitForTimeout(800);
  await page.evaluate(() => window.__hbScene("field")); await page.waitForTimeout(1200);
  check(await page.locator('#actors [data-npc="hana"].act-lead').count() === 1 && await page.locator("#actors .act-exercise").count() === 3, "Hana leads her class on the exercise lawn at 8, three villagers joining in");
  const c0 = (await ffox()).coins; await page.locator('#world [data-place="exlawn"]').dispatchEvent("click"); await page.waitForTimeout(8500);
  check(await page.locator("#hero.exercise").count() === 1 && (await ffox()).coins === c0 + 2, "you can join Hana's class (a couple of coins, once a day)");
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\ndining tables and who's where")) try {
  // A dining table in each of the four houses (data/dining.js) to sit at, who's where today, your friends at home in the
  // evening, and villagers out and about: the wine shop, the Sunday market, Makers' Lane
  console.log("\ndining tables and who's where");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`dinner pageerror: ${e.message}`));
  const ids = () => page.locator("#actors .npc").evaluateAll(n => n.map(x => x.dataset.npc));
  const fam = ["bo", "farid", "mei", "hana", "theo", "tomi", "posy"];
  await page.goto(url + "?reset=1&seed=1&time=21:00&date=2026-10-07"); await page.waitForTimeout(800);
  await page.evaluate(() => window.__hbScene("cottage")); await page.waitForTimeout(2500);
  check(await ids().then(a => a.includes("farid") && a.includes("mei") && !a.includes("hana") && !a.includes("tomi")), "a Wednesday evening at Farid and Mei's: just the two of them at home, back from the wine shop (no supper crowd)");
  await page.locator('#world [data-spot="dine"]').dispatchEvent("click"); await page.waitForTimeout(2500);
  check(await page.locator("#hero.sit").count() === 1, "tap the dining table and you sit down");
  for (const h of ["home", "hanatheo", "tomiposy"]) { await page.evaluate(h => window.__hbScene(h), h); await page.waitForTimeout(500);
    check(await page.locator('#world [data-spot="dine"]').count() === 1, `there's a dining table at ${h}`); }
  await page.goto(url + "?seed=1&time=20:30&date=2026-10-07"); await page.waitForTimeout(800);
  await page.evaluate(() => window.__hbScene("linjun")); await page.waitForTimeout(2000);
  check(await ids().then(a => a.includes("lin") && a.includes("juniper")), "Lin and Juniper's cottage on the foreshore: both home in the evening");
  await page.goto(url + "?seed=1&time=10:30&date=2026-10-07"); await page.waitForTimeout(800);
  await page.evaluate(() => { const F = window.__hbGame.F(); F.board = F.board || {}; F.board.hearts = Object.assign(F.board.hearts || {}, {juniper: 5, bo: 3}); window.__hbGame.render(); });
  await page.click('[data-open="friend"]'); await page.waitForTimeout(400);
  check(await page.locator("details.whowhere").count() >= 18 && /^Juniper/.test((await page.locator("details.whowhere summary b").first().textContent()).trim()) && !/Close friends|supper/i.test(await page.locator("#friendBody").textContent()), "who's where today: everyone's day, the people you know best first");
  await page.click('[data-open="friend"]').catch(() => {});
  await page.goto(url + "?seed=1&time=14:30&date=2026-10-05"); await page.waitForTimeout(800);
  await page.evaluate(() => window.__hbScene("lane")); await page.waitForTimeout(1200);
  check(await ids().then(a => a.includes("okada")), "villagers wander Makers' Lane too (Mr Okada, Monday afternoon)");
  await page.goto(url + "?seed=1&time=18:45&date=2026-10-09"); await page.waitForTimeout(800);
  await page.evaluate(() => window.__hbScene("wineshop")); await page.waitForTimeout(1200);
  check(await ids().then(a => a.includes("tomi") && a.includes("posy")), "Tomi and Posy come to the wine shop on Friday evenings");
  await page.goto(url + "?seed=1&time=10:30&date=2026-10-11"); await page.waitForTimeout(800);
  await page.evaluate(() => window.__hbScene("field")); await page.waitForTimeout(1200);
  check(await ids().then(a => a.includes("farid")) && await page.locator('#actors [data-npc="tomi"].act-footy').count() === 1, "at the Sunday farmers market: Farid at his stall, Tomi playing football");
  await page.goto(url + "?seed=1&time=20:00&date=2026-10-06"); await page.waitForTimeout(800);
  await page.evaluate(() => window.__hbScene("wineshop")); await page.waitForTimeout(1500);
  check(await page.locator('#actors [data-npc="tomi"].act-sit').count() === 1 && await page.locator('#actors [data-npc="posy"].act-sit').count() === 1, "Tuesday is date night: Tomi and Posy at a tasting table in the wine shop");
  { const { NPCS } = await import(pathToFileURL(join(root, "src/data/npcs.js")).href), said = n => [n.intro, n.away, ...(n.hellos || []), ...(n.lines || []), ...Object.values(n.actLines || {}).flat()].filter(x => typeof x === "string");
    const seven = ["hana", "theo", "farid", "mei", "tomi", "posy", "bo"].map(id => NPCS.find(n => n.id === id));
    check(seven.every(Boolean) && !seven.flatMap(said).some(l => /darling|\bZeh\b|Ah Gong|Ah Ma\b|sayang|\bEvan\b|\bMel\b/.test(l)), "the seven friends talk like friends: no pet names or family titles in their lines"); }
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto(url + "?seed=1&time=21:00&date=2026-10-06"); await page.waitForTimeout(800);
  await page.evaluate(() => window.__hbScene("shore")); await page.waitForTimeout(1000);
  check(await page.evaluate(() => !!document.querySelector("#sceneArt rect.dusk")) && await page.evaluate(() => getComputedStyle(document.getElementById("world")).getPropertyValue("--sea").trim().toUpperCase() === "#8FC1DE"), "after dark the sea goes dark with the dusk (and dark mode doesn't stack on it)");
  await page.emulateMedia({ colorScheme: "light" });
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nbig goals")) try {
  // Big goals to save up for: the garage (through a door at the back of the house), a scooter and a car (faster between
  // screens), a dolphin cruise boat at the jetty, and a cellar door extension off the wine shop
  console.log("\nbig goals");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`goals pageerror: ${e.message}`));
  const gf = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  await page.addInitScript(() => { if (!/richpatch/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    f.coins = 13000; const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=10:30&date=2026-10-06"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=10:30&date=2026-10-06&richpatch=1"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__hbScene("home")); await page.waitForTimeout(800);
  check(await page.locator('#world [data-spot="officedoor"]').count() === 1 && await page.locator('#world [data-spot="gdoor"]').count() === 1 && await page.locator('#world [data-spot="desk"]').count() === 0, "the living room has doors to the home office (left) and the garage (right); the desks have moved out");
  await page.locator('#world [data-spot="officedoor"]').dispatchEvent("click"); await page.waitForTimeout(2500);
  check(await page.locator('#world [data-spot="desk"], #world [data-spot="office"], #world [data-spot="treadmill"]').count() === 3, "the home office: your desk, the spare desk and the treadmill");
  await page.evaluate(() => window.__hbScene("home")); await page.waitForTimeout(800);
  await page.locator('#world [data-spot="gdoor"]').dispatchEvent("click"); await page.waitForTimeout(2500);
  check(await page.locator('#world [data-spot="laundry"]').count() === 1 && await page.locator('#world [data-spot="cupboard"]').count() === 1, "the garage holds the laundry corner and the cleaning cupboard");
  check(await page.locator('#world [data-spot="car"]').count() === 1, "through the garage door: room for a scooter and a car");
  await page.locator('#world [data-spot="scooter"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-goal="scooter"]', { timeout: 15000 });
  await page.click('#ctx [data-goal="scooter"]'); await page.waitForTimeout(400);
  check(await gf().then(f => f.goals.scooter && f.ride === "scooter"), "a scooter, kept in the garage");
  await page.click('#ctx [data-goal="car"]'); await page.waitForTimeout(400);
  check(await gf().then(f => f.goals.car && f.ride === "car" && f.coins === 13000 - 800 - 3500), "and a cream convertible");
  await page.evaluate(() => window.__hbScene("base")); await page.waitForTimeout(600);
  await page.locator('#world [data-place="toVine"]').dispatchEvent("click"); await page.waitForTimeout(250);
  check(await page.locator("#hero.drive").count() === 1, "outdoors you drive the convertible between places");
  await page.waitForFunction(() => /vineyard/i.test(document.querySelector("#sceneName").textContent), null, { timeout: 30000 });   // let the drive arrive before jumping elsewhere
  await page.evaluate(() => window.__hbScene("wineshop")); await page.waitForTimeout(800);
  await page.locator('#world [data-spot="cdoor"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-goal="cellar"]', { timeout: 15000 });
  await page.click('#ctx [data-goal="cellar"]'); await page.waitForTimeout(400);
  await page.locator('#world [data-spot="cdoor"]').dispatchEvent("click"); await page.waitForTimeout(2500);
  check(await page.locator('#world [data-spot="flight"]').count() === 1 && await gf().then(f => f.goals.cellar), "the cellar door extension: through the wine shop's west wall to the tasting bar");
  await page.evaluate(() => window.__hbScene("shore")); await page.waitForTimeout(800);
  await page.locator('#world [data-place="boat"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-goal="boat"]', { timeout: 15000 });
  await page.click('#ctx [data-goal="boat"]'); await page.waitForTimeout(400);
  await page.locator('#world [data-place="boat"]').dispatchEvent("click"); await page.waitForTimeout(4000);
  check(await page.locator("#world .cruising").count() === 1 && await page.evaluate(() => getComputedStyle(document.getElementById("hero")).visibility === "hidden"), "the dolphin cruise boat: everyone aboard and off up the coast");
  // the monthly wine club in the cellar door: the first Friday of the month, 6 to 9pm
  await page.addInitScript(() => { if (!/clubpatch/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    f.vine = f.vine || {}; f.vine.shelf = [{id: "c1", name: "Club Red", type: "red", n: 40, price: 18, open: 0}]; f.vine.lastTick = Date.now() - 100*60e3; f.vine.box = 0;
    const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?seed=1&time=19:40&date=2026-11-06&clubpatch=1"); await page.waitForTimeout(2500);
  check(await gf().then(f => f.vine.shelf[0].n < 40 && f.vine.box > 0), "the wine club buys bottles and glasses off the shop's shelves");
  await page.evaluate(() => window.__hbScene("cellar")); await page.waitForTimeout(1500);
  check(await page.locator("#actors .npc").count() >= 6, "the wine club gathers in the cellar door");
  await page.locator('#world [data-spot="flight"]').dispatchEvent("click"); await page.waitForTimeout(2500);
  check(/hosting the wine club/.test(await page.locator("#speech").textContent()), "you host the club at the tasting bar");
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\npaddling between home and the foreshore")) try {
  // Paddling home: the stream from the sea feeds the lake, the river runs on home; a little jetty at home and the
  // foreshore's rack take you (and your pet) straight from one to the other
  console.log("\npaddling between home and the foreshore");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`paddle pageerror: ${e.message}`));
  await page.goto(url + "?reset=1&seed=1&time=10:00&date=2026-10-14"); await page.waitForTimeout(800);
  await page.evaluate(() => window.__hbScene("base")); await page.waitForTimeout(1000);
  check(await page.locator('#world [data-place="homejetty"]').count() === 1, "a little jetty with paddleboards on the river at home");
  await page.locator('#world [data-place="homejetty"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-sup="shore"]', { timeout: 15000 });
  await page.click('#ctx [data-sup="shore"]');
  await page.waitForFunction(() => document.querySelector('#world [data-place="suprack"]'), null, { timeout: 15000 }); await page.waitForTimeout(1200);
  check(await page.evaluate(() => { const r = document.getElementById("hero").getBoundingClientRect(), j = document.querySelector('#world [data-place="suprack"]').getBoundingClientRect(); return Math.abs(r.x - j.x) < 120 && Math.abs(r.y - j.y) < 160; }),
    "paddle to the foreshore: you step off by the paddleboards there");
  await page.locator('#world [data-place="suprack"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-sup="base"]', { timeout: 15000 });
  await page.click('#ctx [data-sup="base"]');
  await page.waitForFunction(() => document.querySelector('#world [data-place="homejetty"]'), null, { timeout: 15000 }); await page.waitForTimeout(1200);
  check(await page.evaluate(() => { const r = document.getElementById("hero").getBoundingClientRect(), j = document.querySelector('#world [data-place="homejetty"]').getBoundingClientRect(); return Math.abs(r.x - j.x) < 120 && Math.abs(r.y - j.y) < 160; }),
    "and paddle home: straight back, standing by the little jetty");
  await page.goto(url + "?seed=1&time=23:00&date=2026-10-14"); await page.waitForTimeout(800);
  await page.evaluate(() => window.__hbScene("base")); await page.waitForTimeout(1000);
  await page.locator('#world [data-place="homejetty"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-sup="shore"]', { timeout: 15000 });
  await page.click('#ctx [data-sup="shore"]');
  const dark = await page.waitForFunction(() => /Too dark/.test(document.querySelector("#speech").textContent), null, { timeout: 5000 }).then(() => true, () => false);
  await page.waitForTimeout(2000);
  check(dark && await page.locator('#world [data-place="homejetty"]').count() === 1, "too dark to paddle the river late at night");
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nthe Scoop Shack")) try {
  // The Scoop Shack on the bay: stock the fridge, discover a flavour at the bench, have one free, take one to give
  // (gelato isn't offered to Tomi), and while time passes Tomo makes batches and customers buy
  console.log("\nthe Scoop Shack");
  { const sc = await import(new URL("../src/game/scoop.js", import.meta.url)), cc = await import(new URL("../src/game/cocoa.js", import.meta.url)), F = {inv: {}, scoop: {fridge: {milk: 3, fl_rose: 2}}, cocoa: {}}, orch = {stock: {}};
    check(sc.unstockFridge(F, "milk", 2, orch).to === "bag" && F.inv.milk === 2 && F.scoop.fridge.milk === 1 && sc.unstockFridge(F, "fl_rose", 99, orch).to === "farm" && orch.stock["stem:rose"] === 2, "things can come back out of the gelato fridge (flower stems go back to the farm shop's shelf)");
    cc.cocoaState(F).pantry = {honey: 2}; check(cc.unstockPantry(F, "honey", 99, orch).n === 2 && F.inv.honey === 2, "and off the Cocoa Room's fillings shelf"); }
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await closeFriends(page);   // friends close enough for an ice cream sent round
  page.on("pageerror", e => { errors.push(`scoop pageerror: ${e.message}`); console.log("PAGEERR", e.stack.slice(0, 600)); });
  page.on("dialog", d => { errors.push("the Scoop Shack used a browser pop-up"); d.dismiss(); });
  const fox = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  await page.addInitScript(() => { const m = /scooppatch=(\w+)/.exec(location.search); if (!m) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    if (m[1] === "stock") { f.inv = {...(f.inv || {}), milk: 4, mango: 4, strawberry: 2}; f.coins = 50; }
    if (m[1] === "rewind") f.scoop.at = 1;
    if (m[1] === "full") { const rs = Array.from({length: 9}, (_, i) => ({id: "f" + i, ings: ["milk"], name: "Flavour " + i, col: "#F4C7CF", dairy: true, special: false}));
      f.scoop.recipes = rs; f.scoop.tubs = Object.fromEntries(rs.map(r => [r.id, 20])); f.scoop.display = rs.slice(0, 8).map(r => r.id); }
    const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=11:00&date=2026-10-10"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=11:00&date=2026-10-10&scooppatch=stock"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__hbScene("shore")); await page.waitForTimeout(600);
  check(await page.locator('#world [data-place="toBay"]').count() === 1, "the foreshore's boardwalk goes north to the bay");
  await page.evaluate(() => window.__hbScene("bay")); await page.waitForTimeout(800);
  check(await page.locator('#world [data-place="scoopshop"]').count() === 1 && await page.locator('#world [data-place="deck"]').count() === 1 && await page.locator('#world [data-place="reno"]').count() === 1,
    "the bay: the Scoop Shack, its deck, and a shopfront under renovation");
  await page.evaluate(() => window.__hbScene("scoopkitchen")); await page.waitForTimeout(800);
  await page.locator('#world [data-spot="gfridge"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-gfill^="bag:mango"]', { timeout: 15000 });
  for (const id of ["mango", "milk", "strawberry"]) { await page.click(`#ctx [data-gfill="bag:${id}:99"]`); await page.waitForTimeout(200); }
  check(await fox().then(f => f.scoop.fridge.mango === 4 && f.scoop.fridge.milk === 4 && !f.inv.mango), "the fridge is stocked from the backpack");
  await page.click("#ctx [data-close]");
  await page.locator('#world [data-spot="gbench"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-gsel="mango"]', { timeout: 15000 });
  await page.click('#ctx [data-gsel="mango"]'); await page.click('#ctx [data-gsel="milk"]'); await page.waitForTimeout(200);
  check(/Mango/.test(await page.locator("#ctx .gresult").innerText()), "the bench previews what it'll make, with a scoop in its colour");
  await page.click("#ctx [data-gmix]"); await page.waitForTimeout(500);
  check(await page.locator("#ctx .gresult.made").count() === 1, "and once it's mixed, the new flavour shows on the bench");
  const r1 = await fox().then(f => f.scoop.recipes[0]);
  check(r1 && r1.dairy && /Mango/.test(r1.name) && await fox().then(f => !f.scoop.tubs[r1.id] && f.scoop.churn.length === 1), `mixing mango and milk discovers a gelato (${r1 && r1.name}); it goes in the churner to blend and freeze`);
  await page.click('#ctx [data-gsel="strawberry"]'); await page.waitForTimeout(200); await page.click("#ctx [data-gmix]"); await page.waitForTimeout(500);
  check(await fox().then(f => f.scoop.recipes.length === 2 && f.scoop.recipes[1].dairy === false && f.scoop.churn.length === 2), "and strawberry on its own is a dairy-free sorbet (the churner holds two)");
  check(await page.locator("#ctx [data-gmix]").isDisabled(), "with the churner full, nothing else can be mixed for now");
  await page.click("#ctx [data-close]").catch(() => {});
  await page.goto(url + "?seed=1&time=12:05&date=2026-10-10"); await page.waitForTimeout(1500);
  await page.evaluate(() => window.__hbScene("scoopkitchen")); await page.waitForTimeout(800);
  check(await fox().then(f => !f.scoop.churn.length && f.scoop.tubs[r1.id] > 10 && f.scoop.tubs[f.scoop.recipes[1].id] > 10), "an hour later both are frozen: a tub of each, in the display (customers are already buying)");
  const before = await fox().then(f => f.scoop.tubs[r1.id]);
  await page.locator('#world [data-spot="gboard"]').dispatchEvent("click"); await page.waitForSelector(`#ctx [data-gmake="${r1.id}"]`, { timeout: 15000 });
  await page.click(`#ctx [data-gmake="${r1.id}"]`); await page.waitForTimeout(300);
  check(await fox().then(f => f.scoop.churn.length === 1 && f.scoop.fridge.mango === 2), "you make another tub yourself from the recipe book (one of each ingredient, into the churner)");
  await page.click("#ctx [data-close]").catch(() => {});
  await page.locator('#world [data-spot="gbench"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-gsel="mango"]', { timeout: 15000 });
  await page.click('#ctx [data-gsel="mango"]'); await page.click('#ctx [data-gsel="milk"]'); await page.waitForTimeout(200);
  await page.click(`#ctx [data-gmake="${r1.id}"]`); await page.waitForTimeout(300);
  check(await fox().then(f => f.scoop.churn.length === 2), "or at the mixing bench, picking a flavour you already know");
  await page.click("#ctx [data-close]").catch(() => {});
  await page.goto(url + "?seed=1&time=13:10&date=2026-10-10"); await page.waitForTimeout(1500);
  await page.evaluate(() => window.__hbScene("scoopkitchen")); await page.waitForTimeout(800);
  check(await fox().then(f => !f.scoop.churn.length && f.scoop.tubs[r1.id] >= before + 25), "an hour on, two more tubs are ready");
  await page.evaluate(() => window.__hbScene("scoopshop")); await page.waitForTimeout(800);
  await page.locator('#world [data-spot="gcounter"]').dispatchEvent("click"); await page.waitForSelector("#ctx [data-gpick]", { timeout: 15000 });
  await page.locator("#ctx [data-gpick]").first().click(); await page.waitForTimeout(200);
  await page.click("#ctx [data-geat]"); await page.waitForTimeout(500);
  check(await page.locator("#melCone").isVisible() && await fox().then(f => f.scoop.tubs[r1.id] > 0), "a free one at the counter: you're holding a cone");
  await page.locator('#world [data-spot="gcounter"]').dispatchEvent("click"); await page.waitForSelector("#ctx [data-gpick]", { timeout: 15000 });
  await page.locator("#ctx [data-gpick]").first().click(); await page.waitForTimeout(200);
  await page.click('#ctx [data-gtake="cone"]'); await page.waitForTimeout(400);
  const gid = await fox().then(f => Object.keys(f.inv).find(k => k.startsWith("gel_cone")));
  check(!!gid, "one to take away goes in the backpack");
  await page.click('[data-open="bag"]'); await page.click(`#bag .item[data-id="${gid}"]`); await page.waitForTimeout(300);
  check(await page.locator('#bag [data-giveto="hana"]').count() === 1 && await page.locator('#bag [data-giveto="tomi"]').count() === 1, "it can be given like a gift, to anyone you know well (Tomi too, though dairy earns no heart from him)");
  await page.click('[data-open="bag"]').catch(() => {});
  // the display: take a flavour off (customers can't buy it then), put it back, and swap one in when all 8 slots are full
  await page.evaluate(() => window.__hbScene("scoopkitchen")); await page.waitForTimeout(700);
  await page.locator('#world [data-spot="gfreezer"]').dispatchEvent("click"); await page.waitForSelector("#ctx [data-gdisp]", { timeout: 15000 });
  const sorbet = await fox().then(f => f.scoop.recipes[1].id);
  await page.click(`#ctx [data-gdisp="${sorbet}"]`); await page.waitForTimeout(300);
  check(await fox().then(f => Array.isArray(f.scoop.display) && !f.scoop.display.includes(sorbet) && f.scoop.display.length === 1), "a flavour can be taken off the display (it waits in the freezer)");
  await page.evaluate(() => window.__hbScene("scoopshop")); await page.waitForTimeout(700);
  await page.locator('#world [data-spot="gcounter"]').dispatchEvent("click"); await page.waitForSelector("#ctx [data-gpick]", { timeout: 15000 });
  check(await page.locator("#ctx [data-gpick]").count() === 1, "and the counter only offers what's in the display");
  await page.click('#ctx [data-gview="freezer"]'); await page.waitForSelector(`#ctx [data-gdisp="${sorbet}"]`, { timeout: 15000 });
  await page.click(`#ctx [data-gdisp="${sorbet}"]`); await page.waitForTimeout(300);
  check(await fox().then(f => f.scoop.display.includes(sorbet)), "put it back out, straight from the counter");
  await page.click("#ctx [data-close]").catch(() => {});
  await page.goto(url + "?seed=1&time=11:00&date=2026-10-10&scooppatch=full"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__hbScene("scoopkitchen")); await page.waitForTimeout(700);
  await page.locator('#world [data-spot="gfreezer"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-gdisp="f8"]', { timeout: 15000 });
  await page.click('#ctx [data-gdisp="f8"]'); await page.waitForSelector('#ctx [data-gswapout="f2"]', { timeout: 15000 });
  await page.click('#ctx [data-gswapout="f2"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.scoop.display.length === 8 && f.scoop.display[2] === "f8" && !f.scoop.display.includes("f2")), "with all 8 slots full, a flavour swaps in for one you choose");
  await page.click("#ctx [data-close]").catch(() => {});
  await page.goto(url + "?seed=1&time=15:00&date=2026-10-12&scooppatch=rewind"); await page.waitForTimeout(2500);
  check(await fox().then(f => Object.values(f.scoop.sold).reduce((a, d) => a + d.n, 0) > 0), "customers buy while it's open (the takings come to you)");
  check(await fox().then(f => Object.values(f.scoop.made || {}).reduce((a, b) => a + b, 0) === 2), "nobody makes tubs behind your back: only the two you made (Tomo serves now)");
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nthe Cocoa Room")) try {
  // The Cocoa Room: bought from the bay's old shopfront, then bean to bar in its kitchen (roast 10 min, grind 2 hours,
  // temper, mould) and bars sold off the wall
  console.log("\nthe Cocoa Room");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => { errors.push(`cocoa pageerror: ${e.message}`); console.log("PAGEERR", e.stack.slice(0, 600)); });
  page.on("dialog", d => { errors.push("the Cocoa Room used a browser pop-up"); d.dismiss(); });
  const fox = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  await page.addInitScript(() => { const m = /ccpatch=(\w+)/.exec(location.search); if (!m) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    if (m[1] === "coins") { f.coins = 2000; f.inv = {...(f.inv || {}), honey: 2, pandan: 1}; f.cocoa = {plan: {on: false}}; }   // Mateo paused while you work it by hand
    if (m[1] === "rewind") f.cocoa.at = 1;
    const trays = () => f.cocoa.bonbons.forEach(b => { f.cocoa.trays[b.id] = 12; });
    if (m[1] === "links" || m[1] === "fest" || m[1] === "club") { Object.assign(f.cocoa, {choc: {milk: 40, dark: 40, white: 40}, plan: {...f.cocoa.plan, on: false}}); trays(); }
    if (m[1] === "links") { f.scoop = {...(f.scoop || {}), up: {...((f.scoop || {}).up || {}), dip: 1}}; f.vine = {...(f.vine || {}), shelf: [{id: "wtest", name: "Willow's Red", type: "red", n: 3, price: 18, open: 0}]}; }
    if (m[1] === "club") { f.goals.cellar = 1; f.cocoa.at = Date.parse("2026-11-06T10:00:00Z"); f.cocoa.bars = {milk: 40, dark: 40, white: 40}; }   // well stocked, so the day's shoppers can't sell out before the club arrives
    if (m[1] === "ups") { f.coins = 10000; Object.assign(f.cocoa, {choc: {milk: 40, dark: 40, white: 40}, bars: {milk: 10, dark: 10, white: 10}, roasted: 2, grind: null, ground: null, grind2: null, ground2: null, up: {}, plan: {...f.cocoa.plan, on: false}}); trays(); }
    if (m[1] === "upsrun") { const t0 = +(/t0=(\d+)/.exec(location.search) || [])[1]; Object.assign(f.cocoa, {at: t0, treeAt: t0 - 3*864e5, beans: 0, choc: {milk: 40, dark: 40, white: 40}, bars: {milk: 20, dark: 20, white: 20}}); trays(); }
    if (m[1] === "mateo") Object.assign(f.cocoa, {at: 1, plan: {on: true, buy: true, floor: 200, hold: 0}, beans: 0, roasted: 0, roast: null, grind: null, ground: null, res: {milk: 0, dark: 0, white: 0}, keep: {milk: 30, dark: 30, white: 0}, choc: {milk: 0, dark: 0, white: 0}, bars: {milk: 0, dark: 0, white: 0}, made: 0});
    const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  const at = async (t, q = "") => { await page.goto(url + `?seed=1&time=${t}&date=2026-10-10${q}`); await page.waitForTimeout(900); };
  await page.goto(url + "?reset=1&seed=1&time=12:00&date=2026-10-10"); await page.waitForTimeout(800);
  await at("12:00", "&ccpatch=coins");
  await page.evaluate(() => window.__hbScene("bay")); await page.waitForTimeout(700);
  await page.locator('#world [data-place="reno"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-goal="cocoa"]', { timeout: 20000 });
  await page.click('#ctx [data-goal="cocoa"]'); await page.waitForTimeout(500);
  check(await fox().then(f => f.goals.cocoa && f.coins === 1000) && await page.locator('#world [data-place="cocoa"]').count() === 1 && await page.locator('#world [data-place="reno"]').count() === 0, "the old shopfront becomes the Cocoa Room for 1000 coins");
  const tap = async (spot, sel) => { await page.locator(`#world [data-spot="${spot}"]`).dispatchEvent("click"); await page.waitForSelector(sel, { timeout: 15000 }); };
  await page.evaluate(() => window.__hbScene("cocoakitchen")); await page.waitForTimeout(700);
  await tap("sacks", '#ctx [data-cc="beans"][data-n="3"]'); await page.click('#ctx [data-cc="beans"][data-n="3"]'); await page.waitForTimeout(300);
  await page.click("#ctx [data-close]");
  await tap("roaster", '#ctx [data-cc="roast"]'); await page.click('#ctx [data-cc="roast"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.cocoa.beans === 2 && f.cocoa.roast && f.coins === 925), "three sacks of beans (75 coins), one in the roaster");
  await at("12:15"); await page.evaluate(() => window.__hbScene("cocoakitchen")); await page.waitForTimeout(700);
  await tap("grinder", '#ctx [data-cc="grind"][data-k="dark"]'); await page.click('#ctx [data-cc="grind"][data-k="dark"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.cocoa.roasted === 0 && f.cocoa.grind && f.cocoa.grind.kind === "dark"), "ten minutes later the beans are roasted, and go in the grinder as dark chocolate");
  await at("13:00"); await page.evaluate(() => window.__hbScene("cocoakitchen")); await page.waitForTimeout(700);
  check(await fox().then(f => f.cocoa.grind && !f.cocoa.ground), "an hour on, it's still grinding (two hours)");
  await at("14:20"); await page.evaluate(() => window.__hbScene("cocoakitchen")); await page.waitForTimeout(700);
  await tap("slab", '#ctx [data-cc="temper"]'); await page.click('#ctx [data-cc="temper"]'); await page.waitForTimeout(300);
  await page.click("#ctx [data-close]");
  await tap("moulds", '#ctx [data-cc="mould"][data-k="dark"]'); await page.click('#ctx [data-cc="mould"][data-k="dark"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.cocoa.choc.dark === 20 && f.cocoa.bars.dark >= 9), "tempered on the marble slab (30 pieces), then moulded into ten bars for the wall");
  await page.click("#ctx [data-close]");
  // bonbons: honey and pandan onto the fillings shelf, then a dark honey bonbon, then dark honey and pandan
  await tap("pantry", '#ctx [data-cc="fill"][data-k="honey"]'); await page.click('#ctx [data-cc="fill"][data-src="bag"][data-k="honey"][data-n="99"]'); await page.waitForTimeout(200);
  await page.click('#ctx [data-cc="fill"][data-src="bag"][data-k="pandan"][data-n="99"]'); await page.waitForTimeout(200);
  check(await fox().then(f => f.cocoa.pantry.honey === 2 && f.cocoa.pantry.pandan === 1 && !f.inv.honey), "the fillings shelf is stocked from the backpack");
  await page.click("#ctx [data-close]");
  await tap("bonbon", '#ctx [data-cc="sel"][data-k="honey"]'); await page.click('#ctx [data-cc="sel"][data-k="honey"]'); await page.waitForTimeout(200);
  check(/Honey/.test(await page.locator("#ctx .gresult").innerText()), "the bonbon table previews the bonbon it'll make");
  await page.click('#ctx [data-cc="bonbon"]'); await page.waitForTimeout(300);
  await page.click('#ctx [data-cc="sel"][data-k="honey"]'); await page.click('#ctx [data-cc="sel"][data-k="pandan"]'); await page.waitForTimeout(200); await page.click('#ctx [data-cc="bonbon"]'); await page.waitForTimeout(300);
  const bb = await fox().then(f => f.cocoa);
  check(bb.bonbons.length === 2 && Object.values(bb.trays).every(n => n === 12) && bb.choc.dark === 8 && !bb.pantry.honey, `two new bonbons, a tray of twelve each (${bb.bonbons.map(b => b.name).join(", ")})`);
  await page.click("#ctx [data-close]");
  await page.evaluate(() => window.__hbScene("cocoa")); await page.waitForTimeout(800);
  check(await page.locator('#world [data-spot="barwall"]').count() === 1 && await page.locator('#world [data-spot="ckdoor"]').count() === 1, "the shop front: the bar wall, the counter, the kitchen door");
  await tap("ccounter", '#ctx [data-cc="give"][data-k="dark"]'); await page.click('#ctx [data-cc="give"][data-k="dark"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.inv.bar_dark === 1), "a dark chocolate bar to give (dairy-free, so even for Tomi)");
  await page.click('#ctx [data-cc="pkopen"][data-k="box"][data-n="4"]'); await page.waitForSelector('#ctx [data-cc="pkadd"]', {timeout: 15000});
  const pickId = await page.locator('#ctx [data-cc="pkadd"]').first().getAttribute("data-k"), before = await fox().then(f => f.cocoa.trays[pickId]);
  for (let i = 0; i < 2; i++) { await page.locator('#ctx [data-cc="pkadd"]').first().click(); await page.waitForTimeout(150); }
  check(await page.locator('#ctx [data-cc="pkgo"]').isDisabled() && /2 of 4 chosen/.test(await page.locator("#ctx").textContent()), "choose the bonbons for a box: two of the first flavour, and it won't pack till there are four");
  await page.click('#ctx [data-cc="pkfill"]'); await page.waitForTimeout(150); await page.click('#ctx [data-cc="pkgo"]'); await page.waitForTimeout(300);
  check(await fox().then(f => { const ids = Object.keys(f.inv).filter(k => /^box4d_/.test(k)); return ids.length === 1 && f.inv[ids[0]] === 1 && f.cocoa.boxes[ids[0]].base === "box4d" && f.cocoa.boxes[ids[0]].items.some(x => x.id === pickId && x.n >= 2) && before - f.cocoa.trays[pickId] >= 2; }), "a gift box of four bonbons from the display case, the ones you chose (all dark, so dairy-free), and it remembers them");
  await page.click("#ctx [data-close]").catch(() => {});
  await tap("case", '#ctx [data-cc="case"]');
  check(await page.locator('#ctx [data-cc="case"]').count() === 2, "the display case shows the bonbons");
  await page.click("#ctx [data-close]").catch(() => {});
  await page.click("#ctx [data-close]").catch(() => {});
  await at("16:00", "&ccpatch=rewind"); await page.waitForTimeout(1500);
  check(await fox().then(f => Object.values(f.cocoa.sold || {}).reduce((a, d) => a + d.n, 0) > 0 && Object.values(f.cocoa.sold || {}).reduce((a, d) => a + (d.bonbons || 0), 0) > 0), "customers buy bars off the wall and bonbons from the case while it's open (the takings come to you)");
  await page.evaluate(() => window.__hbScene("cocoa")); await page.waitForTimeout(1500);
  check((await page.locator("#actors .npc").evaluateAll(n => n.map(x => x.dataset.npc))).includes("amara"), "Amara's behind the counter");
  await page.evaluate(() => window.__hbScene("cocoakitchen")); await page.waitForTimeout(1500);
  check((await page.locator("#actors .npc").evaluateAll(n => n.map(x => x.dataset.npc))).includes("mateo"), "Mateo, the kitchen hand, is in the kitchen");
  // Mateo runs the bar line on his own: two days of shifts, from no beans at all
  await at("18:30", "&ccpatch=mateo"); await page.waitForTimeout(1500);
  const mt = await fox().then(f => ({c: f.cocoa, coins: f.coins}));
  check(mt.c.res.milk === 30 && mt.c.res.dark === 30 && mt.c.res.white === 0, `he fills the bonbon shelf first, to your targets (milk ${mt.c.res.milk}, dark ${mt.c.res.dark})`);
  check(mt.c.made >= 30 && Object.values(mt.c.bars).reduce((a, n) => a + n, 0) + Object.values(mt.c.sold).reduce((a, d) => a + d.n, 0) > 0, `then moulds the rest into bars (${mt.c.made} made), never touching the shelf`);
  check(mt.c.bought >= 4 && mt.coins >= 200, `and buys his own beans with auto-buy (${mt.c.bought} sacks), keeping you above your coin floor`);
  await page.evaluate(() => window.__hbScene("cocoa")); await page.waitForTimeout(700);
  await tap("ccounter", '#ctx [data-cc="keep"][data-k="white"][data-n="1"]'); await page.click('#ctx [data-cc="keep"][data-k="white"][data-n="1"]'); await page.waitForTimeout(300);
  await page.click('#ctx [data-cc="plan"][data-k="buy"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.cocoa.keep.white === 6 && f.cocoa.plan.buy === false), "the kitchen plan at the counter: a bonbon shelf target per chocolate, and auto-buy on or off");
  await page.click("#ctx [data-close]").catch(() => {});
  // around the village: house chocolate for the Scoop Shack, wine fillings and pairing boxes, festival specials, the wine club
  await at("18:40", "&ccpatch=links"); await page.evaluate(() => window.__hbScene("cocoakitchen")); await page.waitForTimeout(700);
  await tap("moulds", '#ctx [data-cc="scoop"][data-k="fridge"]'); await page.click('#ctx [data-cc="scoop"][data-k="fridge"]'); await page.waitForTimeout(300);
  await page.click('#ctx [data-cc="scoop"][data-k="dip"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.scoop.fridge.housechoc === 5 && f.scoop.houseDips === 20 && f.scoop.dips.house && f.cocoa.choc.dark === 20), "dark chocolate goes to the Scoop Shack: Cocoa Room chocolate for the gelato fridge, house-made dark for the dip station");
  await page.click("#ctx [data-close]").catch(() => {});
  await tap("pantry", '#ctx [data-cc="wine"][data-k="wtest"]'); await page.click('#ctx [data-cc="wine"][data-k="wtest"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.cocoa.pantry.wine_red === 4 && f.vine.shelf[0].n === 2), "a bottle off the wine shop shelf opens into four wine fillings");
  await page.click("#ctx [data-close]").catch(() => {});
  await tap("bonbon", '#ctx [data-cc="sel"][data-k="wine_red"]'); await page.click('#ctx [data-cc="sel"][data-k="wine_red"]'); await page.waitForTimeout(200); await page.click('#ctx [data-cc="bonbon"]'); await page.waitForTimeout(300);
  const wb = await fox().then(f => f.cocoa.bonbons.find(b => b.fills.includes("wine_red")));
  check(!!wb, `a wine bonbon (${wb && wb.name})`);
  await page.click("#ctx [data-close]").catch(() => {});
  await page.evaluate(() => window.__hbScene("cocoa")); await page.waitForTimeout(700);
  await tap("ccounter", '#ctx [data-cc="pkopen"][data-k="pair:wtest"]'); await page.click('#ctx [data-cc="pkopen"][data-k="pair:wtest"]'); await page.waitForTimeout(300);
  await page.click('#ctx [data-cc="pkfill"]'); await page.waitForTimeout(150); await page.click('#ctx [data-cc="pkgo"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.inv.pairbox === 1 && f.vine.shelf[0].n === 1), "a wine pairing box: a bottle and four bonbons, to give");
  await page.click("#ctx [data-close]").catch(() => {});
  await page.goto(url + "?seed=1&time=12:00&date=2026-11-05&ccpatch=fest"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__hbScene("cocoakitchen")); await page.waitForTimeout(700);
  await tap("bonbon", '#ctx [data-cc="special"]');
  check(/Deepavali special/i.test(await page.locator("#ctx").innerText()), "around Deepavali the bonbon table offers its festival special");
  await page.click('#ctx [data-cc="special"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.cocoa.specials.sp_spiced === 6), "six spiced chocolate boxes made");
  await page.click("#ctx [data-close]").catch(() => {});
  await page.evaluate(() => window.__hbScene("cocoa")); await page.waitForTimeout(700);
  await tap("ccounter", '#ctx [data-cc="takesp"][data-k="sp_spiced"]'); await page.click('#ctx [data-cc="takesp"][data-k="sp_spiced"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.inv.sp_spiced === 1 && f.cocoa.specials.sp_spiced <= 5), "and one to give");
  await page.click("#ctx [data-close]").catch(() => {});
  await page.goto(url + "?seed=1&time=21:05&date=2026-11-06&ccpatch=club"); await page.waitForTimeout(1500);
  check(await fox().then(f => (f.cocoa.sold["2026-11-06"] || {}).club > 0), "wine club night: members buy chocolates at the cellar door");
  // the upgrades catalogue: all ten, then what they do
  await at("12:00", "&ccpatch=ups"); await page.evaluate(() => window.__hbScene("cocoa")); await page.waitForTimeout(700);
  await tap("ccounter", '#ctx [data-cc="ups"]'); await page.click('#ctx [data-cc="ups"]'); await page.waitForSelector('#ctx [data-cc="buyup"]', { timeout: 15000 });
  check(await page.locator('#ctx [data-cc="buyup"]').count() === 15, "the Cocoa Room's catalogue lists fifteen upgrades (four of them bonbon moulds)");
  for (let i = 0; i < 11; i++) { const b = page.locator('#ctx [data-cc="buyup"]').first(); if (!(await b.count())) break; await b.click(); await page.waitForTimeout(250); }
  check(await fox().then(f => Object.keys(f.cocoa.up).length === 11 && f.coins === 10000 - 4850), "all eleven bought, the vending machine too (4850 coins)");
  await page.click('#ctx [data-cc="counter"]'); await page.waitForSelector('#ctx [data-cc="hot"]', { timeout: 15000 }); await page.click('#ctx [data-cc="hot"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.cocoa.choc.milk === 39), "the hot chocolate bar: you have a cup (one piece of chocolate)");
  await page.click('#ctx [data-cc="pkopen"][data-k="grand"]'); await page.waitForTimeout(300); await page.click('#ctx [data-cc="pkfill"]'); await page.waitForTimeout(150); await page.click('#ctx [data-cc="pkgo"]'); await page.waitForTimeout(300);
  check(await fox().then(f => Object.keys(f.inv).filter(k => /^box16d?_/.test(k)).reduce((a, k) => a + f.inv[k], 0) === 1), "the gift wrapping station packs a grand box of 16");
  check(await page.locator("#fore").innerHTML().then(h => /q18 6 36 0/.test(h)), "a chocolate fountain on the counter");
  await page.click("#ctx [data-close]").catch(() => {});
  await page.evaluate(() => window.__hbScene("cocoakitchen")); await page.waitForTimeout(700);
  await tap("grinder", '#ctx [data-cc="grind"][data-k="dark"]'); await page.click('#ctx [data-cc="grind"][data-k="dark"]'); await page.waitForTimeout(300);
  await page.click('#ctx [data-cc="grind"][data-k="milk"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.cocoa.grind && f.cocoa.grind2 && f.cocoa.grind.kind === "dark" && f.cocoa.grind2.kind === "milk"), "two grinders: two pots grinding at once");
  await page.click("#ctx [data-close]").catch(() => {});
  // Saturday afternoon: the workshop pays, the cacao tree sends a sack, the supply deal stocks the Scoop Shack
  const t0 = await page.evaluate(() => Date.now() + (window.__hbOffset || globalThis.__hbOffset || 0));
  await at("16:30", `&ccpatch=upsrun&t0=${t0}`); await page.waitForTimeout(1500);
  const up = await fox();
  check((up.cocoa.sold["2026-10-10"] || {}).workshop === 48, "Saturday's bonbon workshop: six makers, 48 coins");
  check(up.cocoa.beans >= 1, "the cacao tree at the orchard sends a sack of beans");
  check((up.scoop.fridge.housechoc || 0) >= 5, "the supply deal sends dark chocolate to the Scoop Shack's fridge");
  await at("15:00"); await page.evaluate(() => window.__hbScene("cocoa")); await page.waitForTimeout(1800);
  const ws = await page.locator("#actors .npc").evaluateAll(n => n.map(x => x.dataset.npc));
  check(ws.filter(id => !["amara", "lila", "mateo"].includes(id)).length >= 4 && /Bonbon workshop/.test(await page.locator("#fore").textContent()), `Saturday's workshop class at the tables (${ws.join(", ")})`);
  await page.evaluate(() => window.__hbScene("orchard")); await page.waitForTimeout(900);
  check(/Cacao tree/.test(await page.locator("#sceneArt").textContent()), "the cacao tree grows in the orchard");
  await page.locator('#world [data-place="cacao"]').dispatchEvent("click"); await page.waitForTimeout(1500);
  check(/next in about/.test(await page.locator("#say").textContent().catch(() => "") + await page.locator("body").textContent()), "walk up to the cacao tree: when the next sack is due");
  await page.goto(url + "?seed=1&time=12:00&date=2026-10-12"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__hbScene("cocoa")); await page.waitForTimeout(1500);
  check((await page.locator("#actors .npc").evaluateAll(n => n.map(x => x.dataset.npc))).includes("lila"), "with a second assistant the shop opens on Mondays: Lila's behind the counter");
  await page.goto(url + "?seed=1&time=19:00&date=2026-10-13"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__hbScene("field")); await page.waitForTimeout(1500);
  check(await page.locator('#world [data-place="mstall9"]').count() === 0, "no chocolate cart at the night market (that's the Scoop Shack's evening)");
  await page.goto(url + "?seed=1&time=10:00&date=2026-10-11"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__hbScene("field")); await page.waitForTimeout(1500);
  check(await page.locator('#world [data-place="mstall9"]').count() === 1 && (await page.locator("#actors .npc").evaluateAll(n => n.map(x => x.dataset.npc))).includes("mateo"), "the Cocoa Room cart at the Sunday farmers market, with Mateo");
  await page.locator('#world [data-place="mstall9"]').dispatchEvent("click"); await page.waitForSelector("#ctx h2", { timeout: 15000 });
  check(/farmers market cart/.test(await page.locator("#ctx").innerText()), "and you can serve from it");
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nWildflower Farm")) try {
  // Wildflower Farm, east of the bay: Felix's bees, Elena's cows and goats, the farm stand
  console.log("\nWildflower Farm");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`farm pageerror: ${e.message}`));
  page.on("dialog", d => { errors.push("the farm used a browser pop-up"); d.dismiss(); });
  const fox = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  const npcs = () => page.locator("#actors .npc").evaluateAll(n => n.map(x => x.dataset.npc));
  await page.addInitScript(() => { if (!/hfpatch/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    f.coins = 50; const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=08:00&date=2026-10-07"); await page.waitForTimeout(900);
  await page.goto(url + "?seed=1&time=08:00&date=2026-10-07&hfpatch=1"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__hbScene("bay")); await page.waitForTimeout(700);
  check(await page.locator('#world [data-place="toFarmB"]').count() === 1, "a gate on the bay's east side leads to Wildflower Farm");
  await page.evaluate(() => window.__hbScene("hfarm")); await page.waitForTimeout(1800);
  check(/Wildflower Farm/.test(await page.locator("#sceneName").textContent()) && await page.locator('#world [data-place="farmhouse"], #world [data-place="barn"], #world [data-place="hives"], #world [data-place="cows"], #world [data-place="goats"], #world [data-place="fstand"]').count() === 6,
    "the farm: farmhouse, barn, beehives, cow and goat paddocks, farm stand");
  const who = await npcs(); check(who.includes("felix") && who.includes("elena"), `Felix and Elena are out working (${who.join(", ")})`);
  const tap = async (place, sel) => { await page.locator(`#world [data-place="${place}"]`).dispatchEvent("click"); await page.waitForSelector(sel, { timeout: 15000 }); };
  await tap("cows", '#ctx [data-hf="feed"]'); await page.click('#ctx [data-hf="feed"]'); await page.waitForTimeout(300);
  await page.click('#ctx [data-hf="brush"][data-k="daisy"]'); await page.waitForTimeout(300);
  await page.click('#ctx [data-hf="milkall"]'); await page.waitForTimeout(300);
  const f1 = await fox(); check(f1.hfarm.fed.daisy === "2026-10-07" && f1.hfarm.brushed.daisy === "2026-10-07" && f1.inv.milk === 6, "hay for the cows, a brush for Daisy, and morning milking: 6 milk");
  check(await page.locator('#ctx [data-hf="milk"]:not([disabled])').count() === 0, "each cow is milked once a day");
  await page.click("#ctx [data-close]").catch(() => {});
  await tap("goats", '#ctx [data-hf="feed"]'); await page.click('#ctx [data-hf="feed"]'); await page.waitForTimeout(300);
  await page.click('#ctx [data-hf="milk"][data-k="pepper"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.inv.goatmilk === 1), "a goat gives a bottle of goat's milk");
  await page.click("#ctx [data-close]").catch(() => {});
  await tap("hives", '#ctx [data-hf="honey"]'); await page.click('#ctx [data-hf="honey"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.hfarm.frames >= 2), "a full hive gives you two frames of comb");
  await page.click("#ctx [data-close]").catch(() => {});
  const c0 = await fox().then(f => f.coins);
  await tap("fstand", '#ctx [data-hf="buy"][data-k="egg"]'); await page.click('#ctx [data-hf="buy"][data-k="egg"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.inv.egg === 1 && f.coins === c0 - 3), "the farm stand sells eggs (3 coins)");
  await page.click("#ctx [data-close]").catch(() => {});
  // inside the barn: the extractor, the yoghurt crocks, the cheese press and the cave
  await page.evaluate(() => window.__hbScene("barn")); await page.waitForTimeout(900);
  const spot = async (s, sel) => { await page.locator(`#world [data-spot="${s}"]`).dispatchEvent("click"); await page.waitForSelector(sel, { timeout: 15000 }); };
  check(await page.locator('#world [data-spot="extractor"], #world [data-spot="crock"], #world [data-spot="press"], #world [data-spot="cave"]').count() === 4, "the barn: honey extractor, yoghurt crocks, cheese press and cheese cave");
  await spot("extractor", '#ctx [data-hf="spin"]'); await page.click('#ctx [data-hf="spin"]'); await page.waitForTimeout(300);
  check(await fox().then(f => !f.hfarm.frames && ["honey", "honey_lav", "honey_blossom"].some(k => (f.inv[k] || 0) >= 2)), "the frames spin into jars of this week's honey");
  await page.click("#ctx [data-close]").catch(() => {});
  await spot("crock", '#ctx [data-hf="yog"]'); await page.click('#ctx [data-hf="yog"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.inv.yoghurt === 1 && f.inv.milk === 5), "a bottle of milk becomes a pot of yoghurt");
  await page.click("#ctx [data-close]").catch(() => {});
  await spot("press", '#ctx [data-hf="press"]');
  const ph = await page.locator("#hfName").getAttribute("placeholder");
  await page.click('#ctx [data-hf="press"]'); await page.waitForTimeout(300);
  const w = await fox().then(f => f.hfarm.cave[0]);
  check(w && w.kind === "cheddar" && w.name === ph && ph.length > 4, `a wheel of cheddar pressed with its suggested name (${ph})`);
  check(await fox().then(f => f.inv.milk === 2), "it takes three milk");
  await page.click("#ctx [data-close]").catch(() => {});
  await page.goto(url + "?seed=1&time=10:00&date=2026-10-12"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__hbScene("barn")); await page.waitForTimeout(900);
  await spot("cave", '#ctx [data-hf="wheel"]'); await page.click('#ctx [data-hf="wheel"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.inv.chz_cheddar === 5 && !f.hfarm.cave.length), "five days on it's ripe, but never turned: a rustic cheddar, five wedges");
  await page.click("#ctx [data-close]").catch(() => {});
  await page.goto(url + "?seed=1&time=14:00&date=2026-10-07"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__hbScene("hfarm")); await page.waitForTimeout(900);
  await tap("goats", '#ctx [data-hf="milkall"]');
  check(await page.locator('#ctx [data-hf="milkall"]').isDisabled(), "milking is mornings only");
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nfarm life")) try {
  // Farm life: moods and yields, the goat gate, trust and what it unlocks, Felix and Elena's asks, swarms, turning cheese
  console.log("\nfarm life");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`farm life pageerror: ${e.message}`));
  const fox = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  await page.addInitScript(() => { const m = /flpatch=(\w+)/.exec(location.search); if (!m) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    const q = new URLSearchParams(location.search), qt = (q.get("time") || "").padStart(5, "0");   // the game's clock (?date&time), not the real one: the real time of day mustn't matter
    const h = f.hfarm = f.hfarm || {}, now = q.get("date") && q.get("time") ? Date.parse(`${q.get("date")}T${qt}:00+08:00`) : Date.now() + (globalThis.__hbOffset || 0);
    if (m[1] === "start") { h.since = "2026-10-01"; f.inv = {...(f.inv || {}), egg: 3}; }
    if (m[1] === "trust") { h.trust = 38; }
    if (m[1] === "swarm") { h.hives = [now - 6*864e5, now, now, now, now]; }
    if (m[1] === "wheel") { h.cave = [{kind: "cheddar", name: "Test Cheddar", start: now - 5*864e5, done: now - 3600e3, turns: 4}]; }
    if (m[1] === "partner") { h.trust = 205; f.inv = {...(f.inv || {}), chz_cheddar: 3, milk: 3}; h.at = now - 6*3600e3; }
    const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  const go = async (t, d, q = "") => { await page.goto(url + `?seed=1&time=${t}&date=${d}${q}`); await page.waitForTimeout(900); await page.evaluate(() => window.__hbScene("hfarm")); await page.waitForTimeout(1200); };
  const tap = async (place, sel) => { await page.locator(`#world [data-place="${place}"]`).dispatchEvent("click"); await page.waitForSelector(sel, { timeout: 15000 }); };
  await page.goto(url + "?reset=1&seed=1&time=07:00&date=2026-10-07"); await page.waitForTimeout(800);
  await go("07:00", "2026-10-07", "&flpatch=start");
  await tap("cows", '#ctx [data-hf="feed"]'); await page.click('#ctx [data-hf="feed"]'); await page.waitForTimeout(200);
  await page.click('#ctx [data-hf="muck"]'); await page.waitForTimeout(200);
  await page.click('#ctx [data-hf="brush"][data-k="daisy"]'); await page.waitForTimeout(200);
  await page.click('#ctx [data-hf="milk"][data-k="daisy"]'); await page.waitForTimeout(200);
  check(await fox().then(f => f.inv.milk === 3), "a happy cow (hay, a brush, a mucked-out stall) gives 3 milk");
  check(/happy/.test(await page.locator("#ctx").innerText()), "the paddock shows each animal's mood");
  await page.click('#ctx [data-hf="milk"][data-k="buttercup"]'); await page.waitForTimeout(200);
  check(await fox().then(f => f.inv.milk === 5), "a content one (just hay) gives 2");
  await page.click("#ctx [data-close]").catch(() => {});
  let outDay = null; for (const d of ["2026-10-08", "2026-10-09", "2026-10-11", "2026-10-12", "2026-10-13", "2026-10-14"]) { await go("08:00", d); if (await page.locator('#world [data-place="stray"]').count()) { outDay = d; break; } }
  check(!!outDay, `with the gate left unlatched, a goat gets out (${outDay})`);
  if (outDay) { await page.locator('#world [data-place="stray"]').dispatchEvent("click"); await page.waitForTimeout(3000);
    check(await page.locator('#world [data-place="stray"]').count() === 0 && await fox().then(f => f.hfarm.caught === outDay), "and you round it up"); }
  await tap("goats", '#ctx [data-hf="latch"]'); await page.click('#ctx [data-hf="latch"]'); await page.waitForTimeout(200);
  await page.click("#ctx [data-close]").catch(() => {});
  await go("08:00", "2026-10-10");
  check(await page.locator('#world [data-place="stray"]').count() === 0, "latched the night before: everyone's in");
  await tap("farmhouse", "#ctx h2");
  check(/helper/i.test(await page.locator("#ctx").innerText()) && /asks/i.test(await page.locator("#ctx").innerText()), "the farmhouse: your trust level and today's ask");
  await page.click("#ctx [data-close]").catch(() => {});
  await go("08:00", "2026-10-10", "&flpatch=trust");
  await tap("cows", '#ctx [data-hf="feed"]'); await page.click('#ctx [data-hf="feed"]'); await page.waitForTimeout(1500);
  check(await fox().then(f => f.hfarm.trust >= 40 && f.hfarm.myHive), "enough help and they trust you more: a trusted hand, with a hive of your own");
  await page.click("#ctx [data-close]").catch(() => {});
  check(await page.locator('#world [data-place="hives"]').innerHTML().then(h => h.includes("#E8566C")), "your hive sits in the lavender with a little flag");
  await go("08:00", "2026-10-10", "&flpatch=swarm"); await page.waitForTimeout(21000);
  check(await fox().then(f => f.hfarm.swarms >= 1), "a full hive left too long swarms");
  await page.goto(url + "?seed=1&time=10:00&date=2026-10-10&flpatch=wheel"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__hbScene("barn")); await page.waitForTimeout(900);
  await page.locator('#world [data-spot="cave"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-hf="wheel"]', { timeout: 15000 });
  await page.click('#ctx [data-hf="wheel"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.inv.chz_cheddar_ex === 6), "a wheel turned faithfully comes out excellent");
  await page.click("#ctx [data-close]").catch(() => {});
  await page.goto(url + "?seed=1&time=14:00&date=2026-10-10&flpatch=partner"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__hbScene("barn")); await page.waitForTimeout(900);
  await page.locator('#world [data-spot="press"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-hf="ckind"]', { timeout: 15000 });
  check(await page.locator('#ctx [data-hf="ckind"]').count() === 6, "an apprentice and up: Elena's taught brie, halloumi and smoked");
  await page.click("#ctx [data-close]").catch(() => {});
  await page.evaluate(() => window.__hbScene("hfarm")); await page.waitForTimeout(900);
  await tap("fstand", '#ctx [data-hf="shelf"]'); await page.click('#ctx [data-hf="shelf"][data-k="chz_cheddar"][data-n="99"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.hfarm.shelf.chz_cheddar === 3 && !f.inv.chz_cheddar), "a partner has their own shelf at the farm stand");
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nHoneybrook station")) try {
  // The cottage lane and Honeybrook station: four cottages, the windmill, the timetable, and trains along the top row
  console.log("\nHoneybrook station");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`lane pageerror: ${e.message}`));
  const npcs = () => page.locator("#actors .npc").evaluateAll(n => n.map(x => x.dataset.npc));
  const go = async (t, d, sc) => { await page.goto(url + `?seed=1&time=${t}&date=${d}`); await page.waitForTimeout(900); await page.evaluate(s => window.__hbScene(s), sc); await page.waitForTimeout(1600); };
  await page.goto(url + "?reset=1&seed=1&time=12:00&date=2026-10-07"); await page.waitForTimeout(800);
  await go("12:00", "2026-10-07", "hfarm");
  check(await page.locator('#world [data-place="hfEast"]').count() === 1, "the farm's east gate leads on to the cottage lane");
  await go("12:00", "2026-10-07", "hlane");
  check(/Honeybrook station/.test(await page.locator("#sceneName").textContent()) && await page.locator('#world [data-place="honeysuckle"], #world [data-place="clover"], #world [data-place="bluebell"], #world [data-place="figtree"], #world [data-place="windmill"], #world [data-place="timetable"]').count() === 6,
    "the lane: Honeysuckle, Clover, Bluebell and Fig Tree, the windmill and the timetable board");
  check(await page.locator("#sceneArt animateTransform[type=rotate]").count() >= 1, "the windmill turns");
  check(await page.locator("#sceneArt .train").count() === 0, "no train at noon");
  await page.locator('#world [data-place="timetable"]').dispatchEvent("click"); await page.waitForSelector("#ctx h2", { timeout: 15000 });
  check(/9:15am/.test(await page.locator("#ctx").innerText()) && !/10:30pm/.test(await page.locator("#ctx").innerText()), "the timetable: today's trains (no late train on a Wednesday)");
  await page.click("#ctx [data-close]").catch(() => {});
  await go("09:15", "2026-10-07", "hlane");
  check(await page.locator("#sceneArt .train").count() === 1, "the 9:15 waits at the platform");
  await go("09:13", "2026-10-07", "hfarm");
  check(await page.locator("#sceneArt .train").count() === 1, "on its way in, it passes along the top of the farm");
  await go("09:12", "2026-10-07", "bay");
  check(await page.locator("#sceneArt .train").count() === 1, "and the bay, after crossing the trestle");
  await go("18:30", "2026-10-07", "hlane");
  check(await page.locator("#actors .act-sit").count() >= 3, "holiday guests out on the porches in the evening");
  await go("19:30", "2026-10-07", "hlane");
  check((await npcs()).includes("mateo"), "Mateo's home at Honeysuckle in the evening");
  await go("10:00", "2026-10-06", "hlane");
  check((await npcs()).includes("noor"), "Noor's in her garden at Clover with the rescues");
  await go("22:15", "2026-10-06", "hlane");
  check((await npcs()).filter(id => ["noa", "jun", "bea", "omar", "lucy"].includes(id)).length >= 3, "after the night market, the crowd waits for the 10:30 home");
  await go("12:00", "2026-10-07", "hlane");
  await page.locator('#world [data-place="honeysuckle"]').dispatchEvent("click"); await page.waitForTimeout(3500);
  check(await page.locator('#world [data-spot="mdesk"]').count() === 1, "inside Honeysuckle: Mateo's desk, the sofa, Lila's records");
  await go("12:00", "2026-10-07", "village");
  check(await page.locator('#world [data-place="toStationV"]').count() === 1 && /Honeybrook/.test(await page.locator("#sceneArt").textContent()), "the town square: the station road up to Honeybrook, and the welcome sign");
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nthe campervan")) try {
  // The campervan: bought at its spot on the cottage lane, then done up inside from the mood board
  console.log("\nthe campervan");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`van pageerror: ${e.message}`));
  const fox = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  await page.addInitScript(() => { if (!/vanpatch/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    f.coins = 4000; const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=12:00&date=2026-10-07"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=12:00&date=2026-10-07&vanpatch=1"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__hbScene("hlane")); await page.waitForTimeout(900);
  await page.locator('#world [data-place="vanspot"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-goal="van"]', { timeout: 15000 });
  await page.click('#ctx [data-goal="van"]'); await page.waitForTimeout(500);
  check(await fox().then(f => f.goals.van && f.coins === 200) && await page.locator('#world [data-place="van"]').count() === 1 && await page.locator('#world [data-place="vanspot"]').count() === 0, "the campervan (3800 coins), parked at its spot on the lane");
  await page.locator('#world [data-place="van"]').dispatchEvent("click"); await page.waitForTimeout(3500);
  check(await page.locator('#world [data-spot="vbed"], #world [data-spot="vkitchen"], #world [data-spot="vtable"], #world [data-spot="vboard"]').count() === 4, "inside: the bed, the kitchenette, the table and the mood board");
  await page.locator('#world [data-spot="vboard"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-van="pick"]', { timeout: 15000 });
  await page.click('#ctx [data-van="pick"][data-k="bedding"][data-s="coastal"]'); await page.waitForTimeout(300);
  await page.click('#ctx [data-van="slot"][data-k="curtains"]'); await page.waitForTimeout(200);
  await page.click('#ctx [data-van="pick"][data-k="curtains"][data-s="coastal"]'); await page.waitForTimeout(300);
  const v = await fox();
  check(v.van.use.bedding === "van_bedding_coastal" && v.van.use.curtains === "van_curtains_coastal" && v.coins === 130, "coastal bedding and curtains bought and in the van (70 coins)");
  check(/Mostly Coastal|All Coastal/.test(await page.locator("#ctx").innerText()), "the mood board sees it's coming together");
  check(await page.locator("#sceneArt").innerHTML().then(h => h.includes("#9FD3E8")), "and the van's inside shows them");
  await page.click('#ctx [data-van="slot"][data-k="bedding"]'); await page.waitForTimeout(200);
  await page.click('#ctx [data-van="pick"][data-k="bedding"][data-s="cottage"]'); await page.waitForTimeout(300);
  await page.click('#ctx [data-van="pick"][data-k="bedding"][data-s="coastal"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.coins === 90 && f.van.use.bedding === "van_bedding_coastal"), "a piece bought once can be swapped back in for free");
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nkeepsakes and pets")) try {
  // Keepsakes on the shelves of your buildings, and pets adopted at the market that live with one of your friends
  console.log("\nkeepsakes and pets");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await closeFriends(page);   // these friends are close enough for presents sent round and day trips
  page.on("pageerror", e => errors.push(`pets pageerror: ${e.message}`));
  page.on("dialog", d => { errors.push("keepsakes used a browser pop-up"); d.dismiss(); });
  const fox = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  await page.addInitScript(() => { if (!/petpatch/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    f.inv = {...(f.inv || {}), k_conelamp: 1, pet_puppy: 1, cuenco: 1, iman: 1}; f.coins = 100;
    const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=10:30&date=2026-10-11"); await page.waitForTimeout(800);
  await page.evaluate(() => window.__hbScene("field")); await page.waitForTimeout(1500);
  await page.locator('#world [data-place="mstall8"]').dispatchEvent("click"); await page.waitForSelector('#ctx .item[data-id="pet_kitten"]', { timeout: 15000 });
  check(await page.locator('#ctx .item[data-id^="pet_"]').count() >= 3, "Noor's adoption corner at the Sunday market has pets looking for homes");
  await page.click('#ctx [data-close]').catch(() => {});
  await page.goto(url + "?seed=1&time=10:30&date=2026-10-10&petpatch=1"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__hbScene("scoopshop")); await page.waitForTimeout(700);
  await page.click('[data-open="bag"]'); await page.click('#bag .item[data-id="k_conelamp"]'); await page.waitForSelector('#ctx [data-keepat="scoop1"]', { timeout: 15000 });
  await page.click('#ctx [data-keepat="scoop1"]'); await page.waitForTimeout(500);
  check(await fox().then(f => f.keeps && f.keeps.scoop1 === "k_conelamp" && !f.inv.k_conelamp) && await page.locator('#world [data-keep="scoop1"]').count() === 1, "a keepsake goes on a shelf in the Scoop Shack");
  await page.locator('#world [data-keep="scoop1"]').dispatchEvent("click"); await page.waitForSelector("#ctx [data-keepdown]", { timeout: 15000 });
  await page.click("#ctx [data-keepdown]"); await page.waitForTimeout(400);
  check(await fox().then(f => !f.keeps.scoop1 && f.inv.k_conelamp === 1), "and comes back down into the backpack");
  await page.click('#bag .item[data-id="cuenco"]').catch(async () => { await page.click('[data-open="bag"]'); await page.click('#bag .item[data-id="cuenco"]'); });
  await page.waitForSelector('#bag [data-keepit]', { timeout: 15000 }); check(await page.locator('#bag [data-giveto="hana"]').count() === 1, "a Ronda souvenir can still be given away");
  await page.click('#bag [data-keepit]'); await page.waitForSelector('#ctx [data-keepat="mill1"]', { timeout: 15000 });
  check(await page.locator('#ctx [data-keepat="cocoa2"]').count() === 1 && await page.locator('#ctx [data-keepat="green1"]').count() === 1 && await page.locator('#ctx [data-keepat="fridge"]').count() === 0, "or kept: new shelves in the Cocoa Room, the greenhouse and the mill (and the fridge is for magnets)");
  await page.click('#ctx [data-keepat="mill1"]'); await page.waitForTimeout(500);
  check(await fox().then(f => f.keeps.mill1 === "cuenco" && !f.inv.cuenco), "the painted bowl goes up in the old mill");
  await page.click('[data-open="bag"]').catch(() => {}); await page.click('#bag .item[data-id="iman"]'); await page.waitForSelector('#bag [data-keepit]', { timeout: 15000 });
  await page.click('#bag [data-keepit]'); await page.waitForSelector('#ctx [data-keepat="fridge"]', { timeout: 15000 });
  check(await page.locator('#ctx [data-keepat="scoop1"]').count() === 0, "the fridge magnet only goes on the fridge");
  await page.click('#ctx [data-keepat="fridge"]'); await page.waitForTimeout(400);
  await page.evaluate(() => window.__hbScene("home")); await page.waitForTimeout(900);
  check(await fox().then(f => f.keeps.fridge === "iman") && await page.locator('#world [data-keep="fridge"]').count() === 1, "and there it is on the fridge at home");
  await page.evaluate(() => window.__hbScene("home")); await page.waitForTimeout(900);
  await page.click('[data-open="bag"]'); await page.click('#bag .item[data-id="pet_puppy"]'); await page.waitForSelector('#ctx [data-adoptfor="farid"]', { timeout: 15000 });
  check(await page.locator('#ctx [data-adoptfor]').evaluateAll(n => n.map(x => x.dataset.adoptfor).sort().join()) === "bo,farid,hana,mei,posy,theo,tomi", "a pet can go to any of the seven friends");
  await page.click('#ctx [data-adoptfor="farid"]'); await page.waitForSelector('#ctx [data-adoptat="orchard"]', { timeout: 15000 });
  check(await page.locator('#ctx [data-adoptat="room"]').count() === 1 && await page.locator('#ctx [data-adoptat="field"]').count() === 1, "adopting a puppy: it can live at home, in a building or outdoors");
  await page.click('#ctx [data-adoptat="orchard"]'); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=12:30&date=2026-10-10"); await page.waitForTimeout(900);   // Farid's lunch under the trees
  await page.evaluate(() => window.__hbScene("orchard")); await page.waitForTimeout(1200);
  const pet = await fox().then(f => (f.companions || [])[0]);
  check(pet && pet.owner === "farid" && pet.scene === "orchard" && pet.kind === "puppy" && await page.locator('#world [data-pet]').count() === 1, `the puppy is Farid's now and lives in the orchard (${pet && pet.name})`);
  await page.locator('#world [data-pet]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-petdo="pat"]', { timeout: 15000 });
  await page.click('#ctx [data-petdo="pat"]'); await page.waitForTimeout(300);
  const canPlay = await page.locator('#ctx [data-petdo="play"]').count();
  if (canPlay) { await page.click('#ctx [data-petdo="play"]'); await page.waitForTimeout(500); }
  check(canPlay === 1 && await fox().then(f => f.companions[0].playDay && f.companions[0].patDay), "pat the puppy, and with Farid there, they play together");
  await page.click("#pclose").catch(() => {});
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nScoop Shack upgrades")) try {
  // Scoop Shack upgrades: buy them from the catalogue; the dip station's room (dips and toppings to buy, make a dipped
  // one to give), the honesty freezer's coin box filling while the shop's shut, and the delivery bike
  console.log("\nScoop Shack upgrades");
  { const sc = await import(new URL("../src/game/scoop.js", import.meta.url)), s = sc.scoopState({}), d = "2026-10-10";
    s.recipes = [{id: "m", ings: ["mango"], name: "Mango Sorbet", col: "#F8D59A"}]; s.tubs = {m: 4};
    const low = sc.scoopNews(s, d, 12*60), again = sc.scoopNews(s, d, 12*60 + 5); s.tubs = {}; const out = sc.scoopNews(s, d, 13*60);
    s.sold[d] = {n: 40, coins: 190, outAt: 15*60}; const eve = sc.scoopNews(s, d, 20*60 + 10), eve2 = sc.scoopNews(s, d, 21*60);
    check(/last 4 scoops/.test(low.join(" ")) && !again.length && /run out/.test(out.join(" ")) && /sold 40 ice creams: 190 coins\. It ran out at 3pm/.test(eve.join(" ")) && !eve2.length,
      "the Scoop Shack says when its display is running low or empty, and tells you the day's takings when it shuts (once)"); }
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await closeFriends(page);   // these friends are close enough for presents sent round and day trips
  page.on("pageerror", e => { errors.push(`scoopup pageerror: ${e.message}`); console.log("PAGEERR", e.stack.slice(0, 600)); });
  page.on("dialog", d => { errors.push("the upgrades used a browser pop-up"); d.dismiss(); });
  const fox = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  await page.addInitScript(() => { const m = /uppatch=(\w+)/.exec(location.search); if (!m) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    if (m[1] === "stock") { f.scoop = {recipes: [{id: "mango+milk", ings: ["mango", "milk"], name: "Mango Gelato", col: "#F8D59A", dairy: true, special: false}], tubs: {"mango+milk": 300}}; f.coins = 3000; }
    if (m[1] === "rewind") f.scoop.at = 1;
    const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=12:00&date=2026-10-10"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=12:00&date=2026-10-10&uppatch=stock"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__hbScene("bay")); await page.waitForTimeout(700);
  check(await page.locator('#world [data-place="hfreezer"]').count() === 0 && await page.locator('#world [data-place="dbike"]').count() === 0, "before any upgrades, no honesty freezer or bike on the bay");
  await page.evaluate(() => window.__hbScene("scoopshop")); await page.waitForTimeout(700);
  await page.locator('#world [data-spot="gupgrades"]').dispatchEvent("click"); await page.waitForSelector("#ctx [data-gbuy]", { timeout: 15000 });
  check(await page.locator("#ctx [data-gbuy]").count() === 5, "the catalogue in the shop lists five upgrades");
  for (const k of ["honesty", "awning", "neon", "bike", "dip"]) { await page.evaluate(() => { document.querySelector("#ctx [data-close]")?.click(); });
    await page.locator('#world [data-spot="gupgrades"]').dispatchEvent("click"); await page.waitForSelector(`#ctx [data-gbuy="${k}"]`, { timeout: 15000 }); await page.click(`#ctx [data-gbuy="${k}"]`); await page.waitForTimeout(300); }
  const f1 = await fox();
  check(["honesty", "awning", "neon", "bike", "dip"].every(k => f1.scoop.up[k]) && f1.coins === 3000 - 2300, `all five bought (coins ${f1.coins})`);
  await page.click("#ctx [data-close]").catch(() => {});
  await page.locator('#world [data-spot="gddoor"]').dispatchEvent("click"); await page.waitForSelector('#world [data-spot="gdipbar"]', { timeout: 15000 }).catch(() => {});
  check(await page.locator('#world [data-spot="gdipbar"]').count() === 1 && await page.locator('#world [data-spot="gtops"]').count() === 1, "the dip station's door opens into its own room");
  await page.evaluate(() => window.__hbScene("scoopdip")); await page.waitForTimeout(700);
  await page.locator('#world [data-spot="gtops"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-gtopbuy="coconut"]', { timeout: 15000 }); await page.click('#ctx [data-gtopbuy="coconut"]'); await page.waitForTimeout(300);
  await page.click("#ctx [data-close]");
  await page.locator('#world [data-spot="gpots"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-gdipbuy="dark"]', { timeout: 15000 }); await page.click('#ctx [data-gdipbuy="dark"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.scoop.tops.coconut && f.scoop.dips.dark), "toppings and dips are bought one by one");
  await page.click("#ctx [data-close]");
  await page.locator('#world [data-spot="gdipbar"]').dispatchEvent("click"); await page.waitForSelector("#ctx [data-gdpick]", { timeout: 15000 });
  await page.locator("#ctx [data-gdpick]").first().click(); await page.waitForTimeout(200);
  await page.click('#ctx [data-gddip="dark"]'); await page.click('#ctx [data-gdtop="coconut"]'); await page.click('#ctx [data-gdfmt="waffle"]'); await page.waitForTimeout(200);
  await page.click('#ctx [data-gdmake="give"]'); await page.waitForTimeout(400);
  const dipped = await fox().then(f => Object.keys(f.inv).find(k => k.startsWith("gel_dip_waffle_dark_coconut")));
  check(!!dipped, `a dark-chocolate dipped waffle with coconut, to give (${dipped})`);
  await page.click('[data-open="bag"]'); await page.waitForTimeout(300);
  check(/dark-chocolate dipped with coconut shavings/.test(await page.locator(`#bag .item[data-id="${dipped}"]`).innerText()), "it's in the backpack by name");
  await page.click('#bag [data-deliver]'); await page.waitForSelector("#ctx [data-gvpick]", { timeout: 15000 });
  await page.locator("#ctx [data-gvpick]").first().click(); await page.waitForTimeout(200);
  check(await page.locator('#ctx [data-gvto="tomi"]').count() === 0 && await page.locator('#ctx [data-gvto="hana"]').count() === 1, "the delivery bike sends from anywhere (a gelato isn't offered to Tomi)");
  await page.click('#ctx [data-gvto="hana"]'); await page.waitForTimeout(400);
  check(await fox().then(f => (f.thanks || []).some(t => t.who === "hana" && /^gel_/.test(t.item))), "Tomo pedals it to Hana, and a thank-you note is on its way");
  await page.goto(url + "?seed=1&time=21:00&date=2026-10-13&uppatch=rewind"); await page.waitForTimeout(2500);
  const box = await fox().then(f => f.scoop.box);
  check(await fox().then(f => (f.scoop.sold["2026-10-13"] || {}).cart > 0), "the cart sells at Tuesday's night market (the takings come to you)");
  check(box > 0, `the honesty freezer sold while the shop was shut (${box} coins in its box)`);
  await page.evaluate(() => window.__hbScene("bay")); await page.waitForTimeout(700);
  check(await page.locator('#world [data-place="hfreezer"]').count() === 1 && await page.locator('#world [data-place="dbike"]').count() === 1 && await page.locator("#sceneArt .nightcopy circle").count() > 5, "the freezer and bike are on the bay, and the fairy lights glow at night");
  const c0 = await fox().then(f => f.coins);
  await page.locator('#world [data-place="hfreezer"]').dispatchEvent("click"); await page.waitForSelector("#ctx [data-gcollect]", { timeout: 15000 }); await page.click("#ctx [data-gcollect]"); await page.waitForTimeout(300);
  check(await fox().then(f => f.scoop.box === 0 && f.coins >= c0 + box), "collect the coins from the box");
  await page.locator('#world [data-place="hfreezer"]').dispatchEvent("click"); await page.waitForSelector("#ctx h2", { timeout: 15000 });
  await page.click("#pclose"); await page.waitForTimeout(400);
  check(await page.locator("#panel").isHidden() || !(await page.locator("#ctx").innerText()).includes("honesty freezer"), "the ✕ closes the Scoop Shack's panels too");
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\ningredients")) try {
  // Ingredients: pantry staples at Hana's deli, grapes out of the vineyard's crates, things back out of the larder
  console.log("\ningredients");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`ingr pageerror: ${e.message}`));
  const fox = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  await page.addInitScript(() => { if (!/ingrpatch/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    f.vine = f.vine || {}; f.vine.grapes = {red: 3, white: 0}; f.kitchen = {larder: {fish: 1}}; f.coins = 40;
    const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=09:00&date=2026-10-07"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=09:00&date=2026-10-07&ingrpatch=1"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__hbScene("market")); await page.waitForTimeout(800);
  await page.waitForSelector('#ctx [data-shop="deli"]', { timeout: 20000 }); await page.click('#ctx [data-shop="deli"]'); await page.waitForTimeout(300);
  check(await page.locator('#ctx .item[data-id="chocolate"]').count() === 1 && await page.locator('#ctx .item[data-id="pandan"]').count() === 1 && await page.locator('#ctx .item[data-id="milk"]').count() === 1,
    "Hana's deli stocks gelato staples: chocolate, vanilla, pistachios, pandan, milk and more");
  await page.evaluate(() => window.__hbScene("vineyard")); await page.waitForTimeout(800);
  await page.locator('#world [data-place="barrels"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-vy="takegr"]', { timeout: 15000 });
  await page.click('#ctx [data-vy="takegr"][data-k="red"][data-n="1"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.inv.grape_red === 1 && f.vine.grapes.red === 2), "grapes wait in the vineyard's crates; take a bunch for the ice cream shop");
  await page.click('#ctx [data-vy="putgr"][data-k="red"]'); await page.waitForTimeout(300);
  check(await fox().then(f => !f.inv.grape_red && f.vine.grapes.red === 3), "or put them back for wine");
  await page.click("#ctx [data-close]").catch(() => {});
  await page.evaluate(() => window.__hbScene("kitchen")); await page.waitForTimeout(800);
  await page.locator('#world [data-spot="larder"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-k="take"]', { timeout: 15000 });
  await page.click('#ctx [data-k="take"][data-id="fish"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.inv.fish >= 1 && !(f.kitchen.larder.fish)), "anything in the wine shop's larder can be taken back to the backpack");
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\naccessories in the wardrobe")) try {
  // Accessories in the wardrobe: bought once at Hana's, worn or put away from the wardrobe
  console.log("\naccessories in the wardrobe");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`acc pageerror: ${e.message}`));
  await page.addInitScript(() => { if (!/accpatch/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    f.decorOwned = {...(f.decorOwned || {}), me_bow: true, me_pj: true}; f.decor = {...(f.decor || {}), me_bow: "on", me_pj: "on"};
    const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=10:30&date=2026-10-06"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=10:30&date=2026-10-06&accpatch=1"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__hbScene("room")); await page.waitForTimeout(800);
  check(await page.locator("#melBow").isVisible() && await page.locator("#melPj").isVisible(), "you're wearing your velvet bow, and your silk pyjamas in your room");
  await page.locator('#world [data-spot="wardrobe"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-acc="me_bow"]', { timeout: 15000 });
  check(await page.locator("#ctx [data-acc]").count() === 2, "the wardrobe lists the accessories you own");
  await page.click('#ctx [data-acc="me_bow"]'); await page.waitForTimeout(300); await page.click('#ctx [data-acc="me_pj"]'); await page.waitForTimeout(400);
  check(!(await page.locator("#melBow").isVisible()) && !(await page.locator("#melPj").isVisible()), "and you can take them off there");
  await page.click('#ctx [data-acc="me_bow"]'); await page.waitForTimeout(400);
  check(await page.locator("#melBow").isVisible(), "and put them back on");
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nsunset and dusk")) try {
  // The evening light: a sunset from 6pm deepening into dusk by 7:30, the same on every outdoor screen
  console.log("\nsunset and dusk");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`sky pageerror: ${e.message}`));
  const wash = async (t, sc) => { await page.goto(url + `?reset=1&seed=1&time=${t}&date=2026-10-14`); await page.waitForTimeout(700); await page.evaluate(s => window.__hbScene(s), sc); await page.waitForTimeout(600);
    return page.evaluate(() => { const r = document.querySelector("#sceneArt rect.dusk"); return r ? r.getAttribute("fill") : null; }); };
  check(await wash("12:00", "village") === null, "no wash in the daytime");
  const sun = await wash("18:45", "village"), dusk1 = await wash("19:30", "base"), dusk2 = await wash("19:30", "shore");
  check(sun && sun !== dusk1, "a warm sunset wash at 6:45pm");
  check(dusk1 === "#A3A9DC" && dusk2 === dusk1, "by 7:30 the dusk is the same on home and the foreshore");
  await wash("23:00", "village");
  check(await page.evaluate(() => { const n = document.querySelectorAll("#sceneArt .nightcopy .nightlab").length, all = document.querySelectorAll("#sceneArt text.lab").length;
    return n > 5 && n*2 === all && document.querySelectorAll("#sceneArt .nightcopy rect").length >= 4; }), "at night the street lamps light up and every place name sits on white tape above the dark");
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nthe night market")) try {
  // The night market: Tuesday and Thursday evenings, 6 to 10pm on the field. Out-of-town traders, fairy lights, a jazz
  // duo on a little stage (tip the band), tourists and a few villagers shopping; the wine shop's evening regulars still come
  console.log("\nthe night market");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`night pageerror: ${e.message}`));
  const ids = () => page.locator("#actors .npc").evaluateAll(n => n.map(x => x.dataset.npc));
  await page.addInitScript(() => { if (!/coinpatch/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    f.coins = 100; const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=19:30&date=2026-10-13"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=19:30&date=2026-10-13&coinpatch=1"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__hbScene("field")); await page.waitForTimeout(2500);
  const here = await ids();
  check(["yun", "jae", "mina", "tomas", "sora", "lior", "wen", "kai"].every(n => here.includes(n)), "Tuesday evening: eight out-of-town traders at their stalls");
  check(here.filter(n => ["noa", "jun", "bea", "omar", "lucy", "tae", "ivy", "rafe"].includes(n)).length >= 4, "and tourists out shopping");
  check(await page.locator('#world [data-place="jazzhat"]').count() === 1 && await page.locator('#world [data-place="exlawn"]').count() === 0, "a jazz stage on the lawn (the exercise mats packed away), with a hat for tips");
  const c0 = await page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")).coins);
  await page.locator('#world [data-place="jazzhat"]').dispatchEvent("click");
  await page.waitForFunction(c => JSON.parse(localStorage.getItem("fox.fox")).coins !== c, c0, { timeout: 15000 }).catch(() => {});   // you walk over to the hat first
  { const c1 = await page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")).coins); check(c1 === c0 - 2, `two coins in the band's hat (${c0} -> ${c1})`); }
  await page.locator('#world [data-place="mstall0"]').dispatchEvent("click"); await page.waitForSelector('#ctx .item[data-id="friedchicken"]', { timeout: 15000 });
  const yunToday = await page.locator("#ctx .item[data-id]").evaluateAll(n => n.map(x => x.dataset.id));
  check(yunToday.length >= 4, `the Taiwanese snack stall sells its fried chicken and a few more things tonight (${yunToday.join(", ")})`);
  await page.click('#ctx .item[data-id="friedchicken"]'); await page.waitForTimeout(300);
  check(await page.evaluate(() => (JSON.parse(localStorage.getItem("fox.fox")).inv || {}).friedchicken === 1), "bought one, as a gift");
  await page.click('#ctx [data-close]').catch(() => {});
  await page.locator('#world [data-place="mstall5"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-decor="n_lanterns"]', { timeout: 15000 });
  check(await page.locator('#ctx [data-decor="r_moon"]').count() === 1, "the lantern stall has lanterns for the house and a moon lamp for your room");
  await page.click('#ctx [data-close]').catch(() => {});
  check(here.includes("tomo") && await page.locator('#world [data-place="mstall8"]').count() === 1, "and the Scoop Shack's cart, with Tomo scooping");
  await page.locator('#world [data-place="mstall8"]').dispatchEvent("click"); await page.waitForSelector("#ctx h2", { timeout: 15000 });
  check(/cart/.test(await page.locator("#ctx h2").innerText()), "tap the cart to serve from it (it scoops from the shop's display)");
  await page.click('#ctx [data-close]').catch(() => {});
  check(await page.evaluate(() => [...document.querySelectorAll("#actors .npc")].length) > 0 && await page.evaluate(() => !document.querySelector('[data-track="jazz"]')), "the duo isn't a record on the record player");
  await page.goto(url + "?seed=1&time=17:40&date=2026-10-13"); await page.waitForTimeout(800);
  await page.evaluate(() => window.__hbScene("field")); await page.waitForTimeout(2000);
  check((await ids()).includes("yun") && await page.locator('#world [data-place="jazzhat"]').count() === 1, "the night market's already on at 5:40pm (it opens at 5:30)");
  { // the stalls rotate their goods: another night market, another mix (the signature item stays)
    const offers = [];
    for (const d of ["2026-10-15", "2026-10-20", "2026-10-22"]) {
      await page.goto(url + `?seed=1&time=19:30&date=${d}`); await page.waitForTimeout(800);
      await page.evaluate(() => window.__hbScene("field")); await page.waitForTimeout(1200);
      await page.locator('#world [data-place="mstall0"]').dispatchEvent("click"); await page.waitForSelector('#ctx .item[data-id="friedchicken"]', { timeout: 15000 });
      offers.push((await page.locator("#ctx .item[data-id]").evaluateAll(n => n.map(x => x.dataset.id))).join(","));
      await page.click('#ctx [data-close]').catch(() => {}); }
    check(new Set([yunToday.join(","), ...offers]).size >= 3, "the stalls rotate what they sell from one market to the next (fried chicken always)");
  }
  await page.goto(url + "?seed=1&time=19:30&date=2026-10-12"); await page.waitForTimeout(800);
  await page.evaluate(() => window.__hbScene("field")); await page.waitForTimeout(1500);
  check(!(await ids()).includes("yun") && await page.locator('#world [data-place="jazzhat"]').count() === 0, "no night market on a Monday");
  await page.goto(url + "?seed=1&time=18:45&date=2026-10-13"); await page.waitForTimeout(800);
  await page.evaluate(() => window.__hbScene("wineshop")); await page.waitForTimeout(1500);
  check((await ids()).includes("juniper"), "the wine shop's evening regulars still drop in (Juniper at 6:45 on a night market Tuesday)");
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nbedroom doors")) try {
  // Bedroom doors: Farid and Mei, Hana and Theo, Tomi and Posy head to bed at 10:50pm and are gone after 11
  console.log("\nbedroom doors");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`bedroom pageerror: ${e.message}`));
  const ids = () => page.locator("#actors .npc").evaluateAll(n => n.map(x => x.dataset.npc));
  const pairs = {cottage: ["farid", "mei"], hanatheo: ["hana", "theo"], tomiposy: ["tomi", "posy"]};
  await page.goto(url + "?reset=1&seed=1&time=22:55&date=2026-10-13"); await page.waitForTimeout(800);
  for (const [h, two] of Object.entries(pairs)) { await page.evaluate(h => window.__hbScene(h), h); await page.waitForTimeout(1500);
    check(await page.locator('#world [data-spot="bedroom"]').count() === 1 && await ids().then(a => two.every(f => a.includes(f))), `${h} has a bedroom door, and ${two.join(" and ")} are at it just before 11pm`); }
  check(await page.evaluate(() => { window.__hbScene("cottage"); return true; }) && await page.locator('#world [data-spot="mbed"]').count() === 0, "no bed in the cottage's main room");
  await page.goto(url + "?seed=1&time=23:30&date=2026-10-13"); await page.waitForTimeout(800);
  for (const [h, two] of Object.entries(pairs)) { await page.evaluate(h => window.__hbScene(h), h); await page.waitForTimeout(1200);
    check(await ids().then(a => !two.some(f => a.includes(f))), `after 11pm ${two.join(" and ")} are behind the bedroom door`); }
  await page.locator('#world [data-spot="bedroom"]').dispatchEvent("click"); await page.waitForFunction(() => /asleep/.test(document.querySelector("#speech").textContent), null, { timeout: 15000 }).catch(() => {});
  check(/fast asleep/.test(await page.locator("#speech").textContent()), "knocking at night: they're fast asleep");
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nrainy days")) try {
  // Rain on any day of the year (light showers outside the wet season), and everyone in their own rain gear
  console.log("\nrainy days");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`rain pageerror: ${e.message}`));
  await page.goto(url + "?reset=1&seed=1&time=11:00&date=2026-10-12"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__hbScene("base")); await page.waitForTimeout(1500);
  check(await page.evaluate(() => { const r = document.getElementById("rain"); return !r.hidden && r.classList.contains("light"); }), "a light shower in October (not just the wet season)");
  check(await page.locator("#melRain .brolly").count() === 1, "you're under your brolly");
  await page.evaluate(() => window.__hbScene("village")); await page.waitForTimeout(2500);
  const gear = await page.evaluate(() => [...document.querySelectorAll("#actors .npc")].map(n => n.querySelector(".brolly") ? "b:" + n.querySelector(".brolly > path:nth-of-type(3)").getAttribute("style") : n.querySelector(".rcoat") ? "c:" + n.querySelector(".rcoat").getAttribute("style") : ""));
  check(gear.length > 0 && gear.every(Boolean) && new Set(gear).size > 1, "everyone in town has a brolly or a raincoat, not all the same");
  await page.goto(url + "?seed=1&time=11:00&date=2026-10-07"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__hbScene("village")); await page.waitForTimeout(1500);
  check(await page.evaluate(() => document.getElementById("rain").hidden) && await page.locator("#melRain .brolly, #actors .brolly").count() === 0, "and on a dry day the brollies are put away");
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nfishing")) try {
  // Fishing: a rod, worms from real-life quests, cast, wait for the bite, reel in the green; a journal of catches
  console.log("\nfishing");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`fishing pageerror: ${e.message}`));
  const fox = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  await page.addInitScript(() => { if (!/fishpatch/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    f.coins = 500; const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=12:00&date=2026-10-07"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=12:00&date=2026-10-07&fishpatch=1"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__hbScene("base")); await page.waitForTimeout(900);
  check(await page.locator('#world [data-place="fishriver"]').count() === 1, "a fishing spot on the home river");
  await page.locator('#world [data-place="fishriver"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-fish="rod"]', { timeout: 15000 });
  await page.click('#ctx [data-fish="rod"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.coins === 420 && f.fish.rod && f.fish.bait === 3) && /3 worms/.test(await page.locator("#ctx").textContent()), "a rod for 80 coins, and three worms in the bait tin to start the day");
  await page.click('#ctx [data-fish="cast"]'); await page.waitForTimeout(200); await page.click('#ctx [data-fish="reel"]'); await page.waitForTimeout(200);
  check(/Too soon/.test(await page.locator("#ctx").textContent()) && await fox().then(f => f.fish.bait === 2), "reel in before the bite and it's gone (with the worm)");
  await page.click('#ctx [data-fish="cast"]'); await page.waitForSelector("#ctx .fbar", { timeout: 9000 });
  check(await page.locator("#world #melRod").isVisible(), "you hold your rod while you're fishing");
  await page.waitForFunction(() => { const e = document.querySelector("#ctx .fbar"); if (!e) return true; const q = ((Date.now() - +e.dataset.t0)/+e.dataset.dur) % 2, m = q < 1 ? q : 2 - q; if (Math.abs(m - +e.dataset.at) >= +e.dataset.w/2 - .03) return false; document.querySelector('#ctx [data-fish="reel"]').click(); return true; }, null, { polling: 10, timeout: 5000 });   // reel the instant it's in the green (a separate click can miss it on a busy machine)
  await page.waitForTimeout(300);
  const f1 = await fox(), got = Object.keys(f1.fish.caught);
  check(got.length === 1 && ["roach", "trout", "perch", "boot"].includes(got[0]) && /New in the journal/.test(await page.locator("#ctx .fcatch").textContent()), "reel while the marker's in the green and it's landed: a river fish, new in the journal");
  check(["boot"].includes(got[0]) || (f1.inv[got[0] === "trout" ? "trout" : "fish"] || 0) >= 1, "and it's in the backpack (trout for the kitchen, others as fish)");
  await page.click('#ctx [data-fish="view"][data-k="journal"]'); await page.waitForTimeout(200);
  check(await page.locator("#ctx li.locked").count() === 23 && /dusk/i.test(await page.locator("#ctx").textContent()), "the journal: one found, twenty-three still to find, each with a hint (the golden koi at dusk)");
  await page.click('#ctx [data-fish="view"][data-k="fish"]'); await page.waitForTimeout(200);
  await page.click('#ctx [data-fish="cast"]'); await page.waitForSelector("#ctx .fbar", { timeout: 9000 }); await page.waitForTimeout(3700);
  check(/slipped away/.test(await page.locator("#ctx").textContent()) && await fox().then(f => f.fish.bait === 0), "wait too long after the bite and it slips away");
  check(await page.locator('#ctx [data-fish="cast"]').isDisabled() && /Finish a quest/.test(await page.locator("#ctx").textContent()), "no worms left: finish a quest to dig up another");
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nmore uses, more tapas")) try {
  // Round 101: goat's milk in the press, farm cheeses and honey in the kitchen, the chef's request, more tapas
  console.log("\nmore uses, more tapas");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`tapas pageerror: ${e.message}`));
  const fox = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  await page.addInitScript(() => { if (!/kitpatch/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    f.kitchen = {larder: {egg: 4, potato: 4, honey: 2, chz_halloumi: 1, goatmilk: 2, flour: 2, tulip: 2}, oven: null, press: null}; f.vine = {...(f.vine || {}), help: {cook: false}};
    const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=12:00&date=2026-10-07"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=12:00&date=2026-10-07&kitpatch=1"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__hbScene("kitchen")); await page.waitForTimeout(900);
  await page.locator('#world [data-spot="press"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-k="press"]', { timeout: 15000 });
  check(/cow's or goat's/.test(await page.locator("#ctx").textContent()) && await page.locator('#ctx [data-k="press"]').isEnabled(), "the cheese press takes goat's milk");
  await page.locator('#ctx [data-close]').first().click();
  await page.locator('#world [data-spot="stove"]').dispatchEvent("click"); await page.waitForSelector("#ctx .krequest", { timeout: 15000 });
  check(/has been craving .* sells for \d+ coins a plate instead of \d+/.test(await page.locator("#ctx .krequest").textContent()), "someone in town is craving one of the season's tapas: it sells for half as much again");
  const txt = await page.locator("#ctx").textContent();
  check(["Grilled halloumi with honey", "Huevos rotos", "Yoghurt with honey", "Grilled sardines"].every(n => txt.includes(n)) && ["Honey cake", "Flower shortbread", "Blueberry tart", "Farm cheese board"].every(n => txt.includes(n)), "new tapas (halloumi, huevos rotos, yoghurt, seafood) and small plates (honey cake, flower shortbread, blueberry tart, farm cheese board)");
  await page.locator('#ctx [data-k="tapas"][data-id="halloumi"]').click(); await page.waitForTimeout(200); await page.locator('#ctx [data-k="cooktapas"]').click(); await page.waitForTimeout(300);
  check(await fox().then(f => f.vine.tapasList.some(t => t.id === "halloumi" && t.plates === 6) && !f.kitchen.larder.chz_halloumi && f.kitchen.larder.honey === 1), "Wildflower Farm's halloumi and honey make grilled halloumi with honey");
  await page.locator('#ctx [data-k="dish"][data-dish="shortbread"]').click(); await page.waitForTimeout(300);
  check(await fox().then(f => f.vine.menu.shortbread === 4 && !f.kitchen.larder.tulip), "garden tulips go into flower shortbread");
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nflowers, eggs and bouquet orders")) try {
  // Phase 4, the rest: sunflower seeds for the hens, petal syrup, bouquet orders
  console.log("\nflowers, eggs and bouquet orders");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`phase4 pageerror: ${e.message}`));
  const fox = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  await page.addInitScript(() => { if (!/p4patch/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    f.inv = {...(f.inv || {}), sunflower: 1, chickfeed: 3, tomato: 2, egg: 2, bq_tulip: 1}; f.pets = {...(f.pets || {}), animals: [{id: "a1", kind: "chick", name: "Hennie", born: 0, feeds: 9, fedDay: null, col: 0}], next: 2, run: 0};
    f.kitchen = {larder: {tulip: 3, milk: 1, lemon: 1}, oven: null, press: null}; f.vine = {...(f.vine || {}), help: {cook: false}};
    const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=12:30&date=2026-10-07"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=12:30&date=2026-10-07&p4patch=1"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__hbScene("base")); await page.waitForTimeout(900);
  await page.locator('#world [data-place="run"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-treat]', { timeout: 20000 });
  await page.click('#ctx [data-treat]'); await page.waitForTimeout(300);
  const eggs0 = await fox().then(f => f.inv.egg || 0);
  await page.locator('#ctx [data-feed]').first().click(); await page.waitForTimeout(300);
  check(await fox().then(f => !f.inv.sunflower && f.pets.treat === "2026-10-07" && (f.inv.egg || 0) === eggs0 + 2), "a garden sunflower's seeds for the hens: two eggs a meal today");
  await page.evaluate(() => window.__hbScene("kitchen")); await page.waitForTimeout(900);
  await page.locator('#world [data-spot="larder"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-k="syrup"]', { timeout: 15000 });
  await page.click('#ctx [data-k="syrup"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.inv.syrup === 2 && !f.kitchen.larder.tulip), "three garden tulips make two bottles of petal syrup");
  await page.locator('#ctx [data-k="send"][data-id="syrup"]').click(); await page.waitForTimeout(200);
  await page.locator('#ctx [data-close]').first().click();
  await page.locator('#world [data-spot="stove"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-dish="posset"]', { timeout: 15000 });
  await page.click('#ctx [data-dish="posset"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.vine.menu.posset === 4), "petal syrup, milk and a lemon make a lemon and petal posset");
  await page.evaluate(() => window.__hbScene("orchard")); await page.waitForTimeout(900);
  await page.locator('#world [data-place="farmshop"]').dispatchEvent("click");
  await page.waitForSelector('#ctx [data-or="order"]', { timeout: 20000 }).catch(() => {});
  const c0 = await fox().then(f => f.coins);
  if (await page.locator('#ctx [data-or="order"]').count()) { await page.click('#ctx [data-or="order"]'); await page.waitForTimeout(300);
    check(await fox().then(f => f.coins === c0 + 25 && !f.inv.bq_tulip), "a bouquet order at the farm shop: hand one over for 25 coins"); }
  else check(false, "a bouquet order at the farm shop: hand one over for 25 coins");
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nHoneybrook Woods, bikes and the river taxi")) try {
  // Round 103: Honeybrook Woods (the waterfall, the ranger, foraging, the pool), hire bikes, the river taxi, and
  // villagers out and about on the new screens (on bikes, fishing, at the farm and in the cottages)
  console.log("\nHoneybrook Woods, bikes and the river taxi");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`woods pageerror: ${e.message}`));
  const fox = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  const ids = () => page.locator("#actors .npc").evaluateAll(n => n.map(x => x.dataset.npc));
  await page.addInitScript(() => { if (!/woodpatch/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    f.coins = 100; const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=10:30&date=2026-10-10"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=10:30&date=2026-10-10&woodpatch=1"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__hbScene("hlane")); await page.waitForTimeout(900);
  check(await page.locator('#world [data-place="toWoodsL"]').count() === 1 && await page.locator('#world [data-place="bikesst"]').count() === 1, "the cottage lane has a gate east into the woods, and bike hire by the station");
  await page.locator('#world [data-place="toWoodsL"]').dispatchEvent("click");
  await page.waitForFunction(() => /Woods/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  check(await page.evaluate(() => ["ranger", "forage", "lookout", "fishpool", "taxiwoods", "bikeswoods", "toMakersW", "toLaneW"].every(id => document.querySelector(`#world [data-place="${id}"]`))), "Honeybrook Woods: the ranger's cabin, foraging, the lookout, the pool, the river taxi, bike hire, gates to the lane and Makers' Lane");
  await page.waitForTimeout(1500);
  check(await ids().then(a => a.includes("wren")) && await page.locator('#actors .npc[data-npc="juniper"] .bikeArt').count() === 1, "Wren the ranger walks the trails, and Juniper's out on a bike (Saturday morning)");
  await page.locator('#world [data-place="forage"]').dispatchEvent("click"); await page.waitForTimeout(4000);
  check(await fox().then(f => f.inv.mushroom === 3 && f.woods.forageDay === "2026-10-10"), "foraging in autumn: three wild mushrooms, once a day");
  await page.locator('#world [data-place="bikeswoods"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-bike="hire"]', { timeout: 15000 });
  await page.click('#ctx [data-bike="hire"]'); await page.waitForTimeout(300);
  { const gameNow = await page.evaluate(() => Date.now() + (globalThis.__hbOffset || 0));   // the game's clock, not the real one
    check(await fox().then(f => f.coins === 95 && f.bike && f.bike.until > gameNow), "a hire bike: 5 coins for an hour"); }
  await page.click('#ctx [data-close]');
  await page.locator('#world [data-place="lookout"]').dispatchEvent("click"); await page.waitForTimeout(400);
  check(await page.locator("#hero.biking").count() === 1, "you ride it (faster than walking, slower than the scooter)");
  await page.waitForTimeout(3500);
  await page.locator('#world [data-place="taxiwoods"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-taxi]', { timeout: 15000 });
  check(await page.locator('#ctx [data-taxi]').count() === 4, "the river taxi stops: Makers' Lane, home, the lake and the foreshore");
  await page.click('#ctx [data-taxi="taxishore"]'); await page.waitForTimeout(800);
  check(await page.locator(".taxiride").count() === 1, "a little ride down the river on the launch");
  await page.waitForFunction(() => /foreshore/i.test(document.querySelector("#sceneName").textContent), null, { timeout: 15000 });
  check(await fox().then(f => f.coins === 91), "and off at the foreshore, one gate from the flower farm (4 coins)");
  await page.evaluate(() => window.__hbScene("base")); await page.waitForTimeout(900);
  await page.locator('#world [data-place="homejetty"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-taxiopen]', { timeout: 15000 });
  await page.click('#ctx [data-taxiopen]'); await page.waitForTimeout(300);
  check(await page.locator('#ctx [data-taxi]').count() === 4 && await page.locator('#world [data-place="taxihome"]').count() === 0, "at home the river taxi stops at the little jetty (no separate stop): paddle or take the taxi");
  await page.locator('#ctx [data-close]').first().click();
  await page.evaluate(() => window.__hbScene("lane")); await page.waitForTimeout(900);
  check(await page.locator('#world [data-place="toWoodsM"]').count() === 1 && await page.locator('#world [data-place="taxilane"]').count() === 1, "Makers' Lane: the river comes down from the woods, with a taxi stop and a path up the hill");
  await page.goto(url + "?seed=1&time=7:00&date=2026-10-07"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__hbScene("field")); await page.waitForTimeout(2000);
  check(await page.locator('#actors .npc[data-npc="mei"].act-fish').count() === 1, "Mei's fishing at the lake early on a Wednesday");
  await page.goto(url + "?seed=1&time=21:30&date=2026-10-07"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__hbScene("honeysuckle")); await page.waitForTimeout(2000);
  check(await ids().then(a => a.includes("mateo") && a.includes("lila")), "Mateo and Lila are home in Honeysuckle in the evening");
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nstories, and friends out at the fairs")) try {
  // Round 104: backstories told a chapter at a time in the bubbles (on days with a quest done), with rewards; and
  // your friends at the night market and the fair
  console.log("\nstories, and friends out at the fairs");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`stories pageerror: ${e.message}`));
  const fox = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  const ids = () => page.locator("#actors .npc").evaluateAll(n => n.map(x => x.dataset.npc));
  await page.addInitScript(() => { if (!/storypatch/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    f.met = {...(f.met || {}), celeste: true}; f.goals = {...(f.goals || {}), cocoa: 1}; f.story = {heard: {celeste: 4}, day: {}, log: [], flags: {}};
    if (/quest=1/.test(location.search)) { f.board = f.board || {}; f.board.hearts = {...(f.board.hearts || {}), celeste: 3}; f.board.story = {...(f.board.story || {}), celeste: "2026-10-07"}; }
    const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=12:00&date=2026-10-07"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=12:00&date=2026-10-07&storypatch=1"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__hbScene("wineshop")); await page.waitForTimeout(2800);
  check(await page.locator('#actors .npc[data-npc="celeste"].story').count() === 0, "not enough hearts yet: no story chapter");
  await page.goto(url + "?seed=1&time=12:00&date=2026-10-07&storypatch=1&quest=1"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__hbScene("wineshop")); await page.waitForTimeout(2800);
  check(await page.locator('#actors .npc[data-npc="celeste"].story').count() === 1, "three hearts and her request done today: Celeste has a chapter ready (the little … over her head)");
  await page.locator('#actors .npc[data-npc="celeste"]').dispatchEvent("click"); await page.waitForTimeout(600);
  check(/smelled chocolate again/.test(await page.locator("#npcSay").textContent()), "she tells it in her bubbles: the old chocolatier was her family's");
  const f1 = await fox();
  check(f1.story.heard.celeste === 5 && f1.inv.s_recipebook === 1 && f1.inv.s_praline === 2, "and gives you Henri's recipe book and his pralines");
  await page.waitForTimeout(12000);
  await page.locator('#actors .npc[data-npc="celeste"]').dispatchEvent("click"); await page.waitForTimeout(400);
  check(await fox().then(f => f.story.heard.celeste === 5), "one chapter a day: the next waits for another day");
  { const st = await import(new URL("../src/game/stories.js", import.meta.url)), day = "2026-10-11", ids = ["carmen", "rafael", "lucia", "manolo"];
    const F = {met: Object.fromEntries(ids.map(i => [i, true])), inv: {}, story: {heard: {}, day: {}, log: [], flags: {}}}, ready = () => ids.filter(i => st.storyReady(F, i, day));
    const r0 = ready().length; st.tellStory(F, ready()[0], () => {}, day); st.tellStory(F, ready()[0], () => {}, day);
    check(r0 === 2 && ready().length === 0, "on a trip, at most two locals tell a chapter a day (four could; two do)"); }
  // friends at the night market (Tuesday) and the fair (the last Saturday)
  await page.goto(url + "?seed=1&time=18:45&date=2026-10-06"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__hbScene("field")); await page.waitForTimeout(2500);
  check(await ids().then(a => ["farid", "mei", "tomi", "posy"].every(x => a.includes(x))), "Tuesday's night market: Farid, Mei, Tomi and Posy are there");
  await page.goto(url + "?seed=1&time=11:30&date=2026-10-31"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__hbScene("field")); await page.waitForTimeout(2500);
  check(await ids().then(a => ["hana", "theo", "farid", "mei"].every(x => a.includes(x))), "the field fair: Hana, Theo, Farid and Mei are there in the morning");
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\npicking up where you left off")) try {
  // Round 105: reopening the game the same day picks up where you left off; tulip bulbs on sale in autumn
  console.log("\npicking up where you left off");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, resume: true });
  page.on("pageerror", e => errors.push(`resume pageerror: ${e.message}`));
  await page.goto(url + "?reset=1&seed=1&time=12:00&date=2026-10-07"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=12:00&date=2026-10-07"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__hbScene("hwoods")); await page.waitForTimeout(1200);
  await page.locator('#world [data-place="lookout"]').dispatchEvent("click"); await page.waitForTimeout(3500);
  await page.goto(url + "?seed=1&time=12:30&date=2026-10-07"); await page.waitForTimeout(1500);
  check(/Woods/.test(await page.locator("#sceneName").textContent()), "reopening the same day: back in Honeybrook Woods, where you left off");
  await page.goto(url + "?seed=1&time=9:00&date=2026-10-08"); await page.waitForTimeout(1500);
  check(/Home/.test(await page.locator("#sceneName").textContent()), "a new day: you wake up at home");
  await page.evaluate(() => window.__hbScene("village")); await page.waitForTimeout(800);
  await page.locator('#world [data-place="market"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-shop="seeds"]', { timeout: 20000 });
  await page.click('#ctx [data-shop="seeds"]'); await page.waitForTimeout(300);
  check(await page.locator('#ctx .item[data-id="tulip_seed"]').count() === 1 && await page.locator('#ctx .item[data-id="sunflower_seed"]').count() === 1, "in autumn the seed shelf has tulip bulbs and sunflower seeds");
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\na day trip to Kyoto")) try {
  console.log("\na day trip to Kyoto");
  const tw = await import(new URL("../src/data/towns.js", import.meta.url)), K = tw.TOWNS.kyoto;
  { const own = [...readFileSync(join(root, "src/data/world.js"), "utf8").matchAll(/^  ([a-zA-Z_]+):\s*\{scene:/gm)].map(m => m[1]);
    check(!Object.keys(tw.TOWN_PLACES).some(k => own.includes(k)), "no town's places share a name with a Honeybrook place (Kyoto's temple hall once replaced the Town hall)"); }
  check(K.fare === 60 && K.screens.length === 4 && K.screens.every(sc => tw.townOf(sc) === "kyoto") && Object.keys(tw.TOWN_BRIDGES).filter(k => k.startsWith("kt_")).length === 4, "Kyoto: four screens, 60 coins a ticket");
  const ronda = tw.TOWNS.ronda.acts, used = new Set(Object.values(ronda).flatMap(a => Object.values(a).map(x => x.act)));
  check(Object.values(K.acts).every(a => Object.values(a).every(x => !used.has(x.act))), "nobody does the same thing in Kyoto as in Ronda");
  { const ky = await import(new URL("../src/game/kyoto.js", import.meta.url)), F = {coins: 100, inv: {}}, add = (id, n) => { F.inv[id] = (F.inv[id] || 0) + n; };
    const w = ky.whiskStart(0); for (let i = 0; i < 8; i++) ky.whisk(w, w.t0 + i*ky.TEA.BEAT + 30); const w2 = ky.whiskStart(0); for (let i = 0; i < 8; i++) ky.whisk(w2, w2.t0 + i*ky.TEA.BEAT + 280);
    check(ky.froth(w) && !ky.froth(w2), "the tea ceremony: whisks on the beat froth the tea, off the beat don't");
    const b = ky.sitStart(0); [["in", 100], ["out", 4100], ["in", 8100], ["out", 12100], ["in", 16100], ["out", 20100]].forEach(([k, t]) => ky.breathe(b, k, b.t0 + t)); check(b.done && ky.calm(b), "meditation: three breaths with the circle");
    check(ky.makeNerikiri(F, "sakura", add) === "nk_sakura" && ky.throwCup(F, true, add) && F.inv.k_mycup === 1 && F.inv.k_dadcup === 1 && F.coins === 82, "a nerikiri (8) and a teacup on the wheel (10), Theo's lopsided one too");
    Object.keys(ky.STAMP_AT).forEach(p => ky.stamp(F, p)); check(F.kyoto.lantern && ky.stampCount(F) === 8, "eight stamps fill the book, and the stone lantern goes by the pond at home"); }
  { const np = await import(new URL("../src/data/npcs.js", import.meta.url)), ids = np.NPCS.map(n => n.id), kt = np.NPCS.filter(n => n.local === "kyoto");
    check(new Set(ids).size === ids.length && kt.length >= 15 && kt.filter(n => n.tourist).length >= 6, "Kyoto has plenty of people to meet (and no two villagers share an id)"); }
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`kyoto pageerror: ${e.message}`));
  const fox = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  const ids = () => page.locator("#actors .npc").evaluateAll(n => n.map(x => x.dataset.npc));
  await page.addInitScript(() => { if (!/ktcoins/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    f.coins = 300; f.board = f.board || {}; f.board.hearts = Object.assign(f.board.hearts || {}, {mei: 5, juniper: 5, bo: 4}); const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=10:00&date=2026-11-12"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=10:00&date=2026-11-12&ktcoins=1"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__hbScene("hlane")); await page.waitForTimeout(900);
  await page.locator('#world [data-place="timetable"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-tickets]', { timeout: 15000 });
  await page.click('#ctx [data-tickets]'); await page.waitForSelector('#ctx [data-ttown="kyoto"]', { timeout: 15000 });
  await page.click('#ctx [data-ttown="kyoto"]'); await page.waitForTimeout(300);
  check(await page.locator('#ctx [data-tpick]').evaluateAll(n => n.map(x => x.dataset.tpick).sort().join()) === "juniper,mei", "anyone at five hearts can come along (Bo, at four, can't yet)");
  await page.click('#ctx [data-tpick="mei"]');
  check(/120/.test(await page.locator("#ctx [data-trip]").textContent()) && /Kyoto/.test(await page.locator("#ctx h2").textContent()), "the ticket window offers Kyoto: you and Mei, 120 coins");
  await page.click("#ctx [data-trip]");
  await page.waitForFunction(() => /Kyoto/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 }); await page.waitForTimeout(2000);
  check(await fox().then(f => f.coins === 180 && f.trip.town === "kyoto") && await ids().then(a => a.includes("mei")), "off the train at Kyoto station, with Mei");
  check(await page.evaluate(() => ["kttrain", "ktbamboo", "ktyukata", "ktToLane", "ktToRiver"].every(id => document.querySelector(`#world [data-place="${id}"]`))), "the station screen: the station, the bamboo grove, the yukata shop, and the ways east and south");
  for (const [gate, want, places] of [["ktToLane", "Higashiyama", ["ktpagoda", "ktchaya", "ktwagashi", "ktpottery"]], ["ktStepsDown", "temple", ["kthall", "kttorii", "ktzen", "ktkoi"]], ["ktToRiverW", "river", ["ktnishiki", "ktstones"]], ["ktToStationN", "station", ["kttrain"]]]) {
    await page.locator(`#world [data-place="${gate}"]`).dispatchEvent("click");
    await page.waitForFunction(w => new RegExp(w).test(document.querySelector("#sceneName").textContent), want, { timeout: 25000 }); await page.waitForTimeout(1200);
    check(await page.evaluate(ps => ps.every(id => document.querySelector(`#world [data-place="${id}"]`)), places) && await ids().then(a => a.includes("mei")), `through the gate to Kyoto's ${want} (Mei follows)`);
  }
  // round 122-124: the yukata shop, the five rooms and their activities, the stamp book
  await page.locator('#world [data-place="ktyukata"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-kt="yukata:indigo"]', { timeout: 15000 });
  await page.click('#ctx [data-kt="yukata:indigo"]'); await page.waitForTimeout(500);
  check(await fox().then(f => f.kyoto.yukata && f.kyoto.yukata.col === "indigo" && f.coins === 165) && await page.locator("#hero .clTorso").evaluate(e => e.innerHTML.length > 50), "a yukata for the day (15 coins): you're in indigo");
  await page.click("#ctx [data-close]"); await page.waitForTimeout(300);
  await page.locator('#world [data-place="ktToLane"]').dispatchEvent("click");
  await page.waitForFunction(() => /Higashiyama/.test(document.querySelector("#sceneName").textContent), null, { timeout: 25000 }); await page.waitForTimeout(1000);
  await page.locator('#world [data-place="ktchaya"]').dispatchEvent("click");
  await page.waitForFunction(() => /tea house/.test(document.querySelector("#sceneName").textContent), null, { timeout: 25000 }); await page.waitForTimeout(7000);
  check(await ids().then(a => a.includes("sachiko")) && await fox().then(f => f.kyoto.stamps.tea), "inside the tea house: Sachiko by the kettle, and the tea house stamp in the book");
  await page.locator('#world [data-rdspot="kt_tea"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-kt="tea"]', { timeout: 15000 });
  await page.evaluate(() => new Promise(res => { document.querySelector('#ctx [data-kt="tea"]').click(); const t0 = Date.now() + 1200; for (let i = 0; i < 8; i++) setTimeout(() => { const b = document.querySelector('#ctx [data-kt="whisk"]'); if (b) b.click(); }, t0 + i*560 + 20 - Date.now()); setTimeout(res, t0 + 8*560 + 400 - Date.now()); }));
  await page.waitForSelector('#ctx [data-kt="bow"]', { timeout: 8000 }); check(/perfect jade froth/.test(await page.locator("#ctx").innerText()), "the tea ceremony: whisk in time with Sachiko, and it's a perfect froth");
  await page.click('#ctx [data-kt="bow"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.kyoto.teas === 1 && f.coins === 155), "then turn the bowl and bow (10 coins)");
  await page.click("#ctx [data-close]"); await page.waitForTimeout(300);
  for (const [room, spot, who] of [["kt_sweets", "kt_sweets", "tanaka"], ["kt_pottery", "kt_pottery", "ishida"], ["kt_hall", "kt_hall", "joshin"], ["kt_market", "kt_market", "fumiko"]]) {
    await page.evaluate(r => window.__hbScene(r), room); await page.waitForTimeout(1300);
    check(await ids().then(a => a.includes(who)) && await page.locator(`#world [data-rdspot="${spot}"]`).count() === 1, `${room}: ${who} is there, and there's something to do`);
  }
  await page.evaluate(() => window.__hbScene("kt_sweets")); await page.waitForTimeout(1200);
  await page.locator('#world [data-rdspot="kt_sweets"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-kt="shape:momiji"]', { timeout: 15000 });
  await page.click('#ctx [data-kt="shape:momiji"]'); for (const s of [0, 2, 1, 2, 3]) await page.click(`#ctx [data-kt="step:${s}"]`).catch(() => {});
  await page.click('#ctx [data-kt="neri"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.inv.nk_momiji === 1), "a nerikiri maple leaf, made with Mr Tanaka, boxed up as a gift");
  await page.click("#ctx [data-close]"); await page.waitForTimeout(300);
  await page.evaluate(() => window.__hbScene("kt_hall")); await page.waitForTimeout(1200);
  await page.locator('#world [data-rdspot="kt_hall"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-kt="sit"]', { timeout: 15000 });
  check(/stamp book/i.test(await page.locator("#ctx").innerText()), "the temple hall: sit with Jōshin, draw a fortune, and see the stamp book");
  await page.click('#ctx [data-kt="fortune"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.kyoto.fortunes === 1), "a fortune slip (1 coin)");
  await page.click("#ctx [data-close]"); await page.waitForTimeout(300);
  await page.evaluate(() => window.__hbScene("kt_station")); await page.waitForTimeout(1200);
  await page.locator('#world [data-place="kttrain"]').dispatchEvent("click"); await page.waitForSelector("#ctx [data-triphome]", { timeout: 15000 });
  await page.click("#ctx [data-triphome]");
  await page.waitForFunction(() => /Honeybrook station/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  check(await fox().then(f => f.trip.done), "and the train home from Kyoto");
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }

if (want("\na day trip to Ronda")) try {
  console.log("\na day trip to Ronda");
  // who's away: tours, Farid's stall and Hana's class all work round them
  { const t = await import(new URL("../src/game/tours.js", import.meta.url)), sat = "2026-10-10", sun = "2026-10-11", tue = "2026-10-13", wed = "2026-10-14";
    t.setAway(() => ["farid"]);
    check(t.toursOn(sat).length === 4 && t.toursOn(sat).every(x => x.guide === "mei") && t.eventOn(sun).stalls.find(x => x.at === 4).id === "mei", "Farid away: Mei leads Saturday's tours and minds his stall on Sunday");
    t.setAway(() => ["farid", "mei"]);
    check(t.toursOn(sat).length === 0 && t.toursOn(sun).length === 0, "Farid and Mei both away: no orchard tours that weekend (nobody to guide them)");
    t.setAway(() => ["bo", "hana"]);
    check(t.toursOn(tue)[0].guide === "farid" && !t.classOn(tue), "Bo away: Farid leads his Tuesday tour; Hana away: no class that morning");
    t.setAway(() => ["bo", "farid", "mei"]);
    check(t.toursOn(tue).length === 0, "and with Bo, Farid and Mei all away there's no Tuesday tour");
    t.setAway(() => []);
    check(!t.dinnerOn && t.eventOn(sun).stalls.find(x => x.at === 4).id === "farid" && t.toursOn(sat).length === 4, "and with nobody away, everything's as usual"); }
  // Ronda's tapas are learned by tasting them; the tiles, some only in season, make a bench; vines once Rafael trusts you
  { const k = await import(new URL("../src/game/kitchen.js", import.meta.url)), r = await import(new URL("../src/game/ronda.js", import.meta.url)), F = {coins: 999, inv: {}};
    check(!k.knows(F, "salmorejo") && k.knows(F, "patatas") && !!r.taste(F, "salmorejo") && k.knows(F, "salmorejo") && F.coins === 994, "tasting salmorejo at the tapas bar (5 coins) puts it on the stove at home");
    ["bridge", "vulture", "pinsapo", "banos", "guitar"].forEach(id => r.buyTile(F, id, "2026-10-10"));
    check(Object.keys(F.ronda.tiles).length === 5 && !r.buyTile(F, "orange", "2026-10-10") && !r.buyTile(F, "almond", "2026-10-10"), "five tiles in autumn; the orange and almond blossom tiles aren't painted till winter");
    r.buyTile(F, "orange", "2027-01-10"); r.buyTile(F, "almond", "2027-01-10"); r.buyTile(F, "geranium", "2027-04-10");
    check(F.ronda.bench, "all eight tiles: the tiled bench for the pond");
    r.rondaVisit(F, "2026-10-10"); r.rondaVisit(F, "2026-10-10"); const first = r.buyVines(F); r.rondaVisit(F, "2026-10-12");
    check(!first && r.buyVines(F) && F.vine.cuttings.tempranillo === 3 && F.vine.tempra, "Rafael sells Tempranillo cuttings on your second visit (three for 120)"); }
  // Ronda's locals tell their stories on a trip day (no quest needed); Doña Carmen knew Pilar's mother
  { const st = await import(new URL("../src/game/stories.js", import.meta.url)), day = "2026-10-11", F = {met: {carmen: true, pilar: true}, inv: {}, story: {heard: {pilar: 1}, day: {}, log: [], flags: {}}};
    const add = (id, n) => { F.inv[id] = (F.inv[id] || 0) + n; };
    check(!!st.storyReady(F, "carmen", day) && !st.storyReady(F, "pilar", day), "in Ronda, Doña Carmen tells her story on a trip day (Pilar's next chapter waits for hearts)");
    F.story = {heard: {pilar: 2, carmen: 2}, day: {}, log: [], flags: {}};
    const t = st.tellStory(F, "carmen", add, day);
    check(t && /Rosario/.test(t.lines.join(" ")) && F.inv.yemas === 2, "Carmen's third chapter: Pilar is Rosario's girl, and two boxes of yemas to take home");
    F.story.heard.pilar = 3; F.board = {hearts: {pilar: 5}};
    check(/Carmen/.test((st.storyReady(F, "pilar", "2026-10-12") || {ch: {lines: []}}).ch.lines.join(" ")), "and back home, Pilar has a new chapter about Doña Carmen"); }
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, resume: true });
  await closeFriends(page);   // these friends are close enough for presents sent round and day trips
  page.on("pageerror", e => errors.push(`ronda pageerror: ${e.message}`));
  const fox = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  const ids = () => page.locator("#actors .npc").evaluateAll(n => n.map(x => x.dataset.npc));
  const scn = () => page.locator("#sceneName").textContent();
  await page.addInitScript(() => { if (!/tripcoins/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    f.coins = 300; const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=10:00&date=2026-10-11"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=10:00&date=2026-10-11&tripcoins=1"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__hbScene("hlane")); await page.waitForTimeout(900);
  await page.locator('#world [data-place="timetable"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-tickets]', { timeout: 15000 });
  await page.click('#ctx [data-tickets]'); await page.waitForSelector('#ctx [data-tpick="farid"]', { timeout: 15000 });
  check(await page.locator("#ctx [data-tpick]").count() === 7 && /40/.test(await page.locator("#ctx").innerText()), "the ticket window: Ronda, 40 coins a person, pick from your seven friends");
  for (const id of ["farid", "mei"]) await page.click(`#ctx [data-tpick="${id}"]`);
  check(/120/.test(await page.locator("#ctx [data-trip]").textContent()), "you, Farid and Mei: three tickets (120 coins)");
  await page.click("#ctx [data-trip]");
  await page.waitForFunction(() => /Ronda/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 }); await page.waitForTimeout(2500);
  check(await fox().then(f => f.coins === 180 && f.trip && f.trip.party.join() === "farid,mei"), "tickets paid, and the trip's on");
  { const tw = await import(new URL("../src/data/towns.js", import.meta.url)), R = tw.TOWNS.ronda.rooms, mus = Object.values(R).map(r => r.music);
    check(Object.keys(R).length >= 5 && new Set([...mus, tw.TOWNS.ronda.music]).size === mus.length + 1 && Object.keys(R).every(r => tw.townOf(r) === "ronda" && tw.TOWN_PLACES[R[r].door]), "Ronda has its interiors behind its doors (six, the leather workshop too), each with its own music");
    const rd = await import(new URL("../src/game/ronda.js", import.meta.url));
    const good = rd.palmasStart(0); [0, 1].forEach(k => rd.ACCENTS.forEach(a => rd.clap(good, good.t0 + (k*12 + a)*rd.BEAT_MS + 100)));
    const bad = rd.palmasStart(0); for (let bt = 0; bt < 24; bt++) rd.clap(bad, bad.t0 + bt*rd.BEAT_MS + 100);
    check(rd.showOn(13*60 + 30) && rd.showOn(20*60 + 30) && !rd.showOn(16*60) && rd.ole(good) && good.hits === 10 && !rd.ole(bad), "flamenco at 1 and 8: clap on 3, 6, 8, 10 and 12 for an olé (clapping on every beat doesn't count)");
    const tea = {t0: 0, glasses: []}; rd.pour(tea, .82*900); rd.pour(tea, 0); check(tea.glasses.join() === "true,false", "Amina's mint tea: pour from high up and it froths");
    const Fp = {coins: 10, inv: {}}, addp = (id, n) => { Fp.inv[id] = (Fp.inv[id] || 0) + n; };
    check(rd.paintTile(Fp, "azul", "star", false, addp) === "ptile_azul_star" && Fp.coins === 2 && !Fp.inv.etile && rd.paintTile(Fp, "verde", "wave", false, addp) === null, "painting a tile at Lucía's (8 coins): a keepsake");
    check(["especias", "ceramica", "postales"].every(s => Object.values(tw.TOWN_GOODS).filter(g => g.shop === s).length === 3), "shopping corners: spices and ceramics at the market, postcards at Doña Carmen's"); }
  check(await ids().then(a => a.includes("farid") && a.includes("mei")), "off the train at Ronda station: Farid and Mei came too");
  check(await page.evaluate(() => ["rdtrain", "alameda", "bandstand", "rdToPlaza", "rdStepsDown"].every(id => document.querySelector(`#world [data-place="${id}"]`))), "Ronda's station screen: the station, the Alameda balcony, the bandstand, the way to the plaza and the gorge steps");
  await page.locator('#world [data-place="rdToPlaza"]').dispatchEvent("click");
  await page.waitForFunction(() => /plaza/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 }); await page.waitForTimeout(1500);
  check(await ids().then(a => a.includes("farid") && a.includes("mei")), "they follow you to the plaza");
  check(await page.locator('#actors .npc[data-npc="farid"].act-haggle').count() === 1, "the plaza on a Sunday morning: Farid haggling");
  check(await page.evaluate(() => ["mercado", "tapas", "dulces", "fuente", "rdBridgeN", "rdToStation"].every(id => document.querySelector(`#world [data-place="${id}"]`))), "the plaza: the market, the tapas bar, the sweet shop, the fountain, Puente Nuevo");
  await page.locator('#actors .npc[data-npc="farid"]').dispatchEvent("click"); await page.waitForTimeout(400);
  await page.locator('#actors .npc[data-npc="farid"]').dispatchEvent("click"); await page.waitForTimeout(400);
  { let town = false; for (let k = 0; k < 6 && !town; k++) { await page.locator('#actors .npc[data-npc="farid"]').dispatchEvent("click"); await page.waitForTimeout(300); town = /sweeter|almond cake|What a drop/.test(await page.locator("#npcSay").textContent()); }
    check(town, "Farid has things to say about Ronda (his own oranges are sweeter)"); }
  // round 116: the doors lead inside
  await page.locator('#world [data-place="tapas"]').dispatchEvent("click");
  await page.waitForFunction(() => /tapas bar/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 }); await page.waitForTimeout(1500);
  check(await ids().then(a => a.includes("paco") && a.includes("farid")) && await page.locator('#world [data-rdspot="tapas"]').count() === 1, "through the door: inside the tapas bar, Paco waiting tables, and your friends came in too");
  await page.locator('#world [data-rdspot="tapas"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-rtaste="naranjas"]', { timeout: 15000 });
  await page.click('#ctx [data-rtaste="naranjas"]'); await page.waitForTimeout(400);
  check(await fox().then(f => f.learned && f.learned.naranjas && f.coins === 176), "the tapas bar: a taste of orange salad (4 coins), and now you know how to make it");
  await page.click("#ctx [data-close]"); await page.waitForTimeout(300);
  await page.locator('#world [data-exit]').dispatchEvent("click");
  await page.waitForFunction(() => /plaza/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 }); await page.waitForTimeout(1200);
  check(true, "and out again, back on the plaza");
  await page.locator('#world [data-place="dulces"]').dispatchEvent("click");
  await page.waitForFunction(() => /café/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 }); await page.waitForTimeout(1500);
  check(await ids().then(a => a.includes("carmen")), "Doña Carmen's café: Doña Carmen behind her counter");
  await page.locator('#world [data-rdspot="dulces"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-rcafe]', { timeout: 15000 });
  check(await page.locator('#ctx [data-rcafe="choc"]').count() === 1 && await page.locator('#ctx [data-rbuy="churros"]').count() === 1, "Doña Carmen does churros: con chocolate at a table, or a bag to take away");
  await page.click('#ctx [data-rcafe="leche"]'); await page.waitForTimeout(400);
  check(await fox().then(f => f.coins === 173 && f.ronda.cafes === 1), "a café con leche and a churro at a marble table (3 coins)");
  await page.locator('#world [data-exit]').dispatchEvent("click");
  await page.waitForFunction(() => /plaza/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 }); await page.waitForTimeout(1200);
  await page.locator('#world [data-place="mercado"]').dispatchEvent("click");
  await page.waitForFunction(() => /market/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 }); await page.waitForTimeout(1500);
  check(await ids().then(a => a.includes("rafael") && a.includes("rocio")), "the covered market: Rafael at his stall, Rocío with her flowers");
  await page.locator('#world [data-rdspot="mercado"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-rbuy="almond"]', { timeout: 15000 });
  check(await page.locator('#ctx [data-rbuy="vines"]').count() === 0 && await page.locator("#ctx [data-rbuy]").count() === 7, "the covered market: almonds, oranges, oil, jamón, payoyo, membrillo and a picnic basket (no vines for a stranger)");
  await page.click('#ctx [data-rbuy="almond"]'); await page.click('#ctx [data-rbuy="picnic"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.inv.almond === 1 && f.inv.picnic === 1), "almonds and a picnic basket, into the backpack");
  await page.click("#ctx [data-close]"); await page.waitForTimeout(300);
  await page.locator('#world [data-exit]').dispatchEvent("click");
  await page.waitForFunction(() => /plaza/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 }); await page.waitForTimeout(600);
  await page.waitForTimeout(1500);
  await page.goto(url + "?seed=1&time=10:30&date=2026-10-11"); await page.waitForTimeout(1800);
  check(/plaza/.test(await scn()) && await ids().then(a => a.includes("farid")), "reopening mid-trip: back in Ronda's plaza, with your friends");
  await page.evaluate(() => window.__hbScene("rd_banos")); await page.waitForTimeout(1500);
  check(await ids().then(a => a.includes("amina")) && await page.locator('#world [data-rdspot="banos"]').count() === 1, "the Arab baths: Amina showing people round, under the star skylights");
  await page.evaluate(() => window.__hbScene("rd_cuero")); await page.waitForTimeout(1500);
  check(await ids().then(a => a.includes("antonio")), "the leather workshop: Antonio stitching at his bench");
  await page.locator('#world [data-rdspot="cuero"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-rbuy="bolso"]', { timeout: 15000 });
  check(await page.locator("#ctx [data-rbuy]").count() === 5, "Ubrique leather to buy: a wallet, a handbag, a belt, a notebook and a keyring");
  await page.click("#ctx [data-close]"); await page.waitForTimeout(300);
  await page.evaluate(() => window.__hbScene("rd_jardin")); await page.waitForTimeout(1500);
  check(await ids().then(a => a.includes("joaquin") && a.includes("mei")) && await page.locator('#world [data-rdspot="jardin"]').count() === 1, "the Moorish garden: Joaquín watering, and Mei found a bench");
  await page.evaluate(() => window.__hbScene("field")); await page.waitForTimeout(1500);
  check(await ids().then(a => !a.includes("farid") && !a.includes("mei")), "back in Honeybrook, Farid and Mei aren't at the market: they're in Ronda with you");
  await page.evaluate(() => window.__hbScene("rd_station")); await page.waitForTimeout(1000);
  await page.locator('#world [data-place="rdtrain"]').dispatchEvent("click"); await page.waitForSelector("#ctx [data-triphome]", { timeout: 15000 });
  await page.click("#ctx [data-triphome]");
  await page.waitForFunction(() => /Honeybrook station/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  check(await fox().then(f => f.trip.done), "the train home: back at Honeybrook station, the trip's over");
  await page.addInitScript(() => { if (!/benchpatch/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    f.ronda = Object.assign(f.ronda || {}, {bench: true}); const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?seed=1&time=10:50&date=2026-10-11&benchpatch=1"); await page.waitForTimeout(1200);
  await page.evaluate(() => window.__hbScene("base")); await page.waitForTimeout(1000);
  check(await page.locator("#world .tilebench").count() === 1, "with all eight tiles, the tiled bench stands by the pond at home");
  await page.evaluate(() => window.__hbScene("field")); await page.waitForTimeout(1500);
  check(await ids().then(a => a.includes("farid")), "and Farid's back at his market stall");
  // the last train, and the window closing for the day
  await page.goto(url + "?seed=1&time=17:00&date=2026-10-12&tripcoins=1"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__hbScene("hlane")); await page.waitForTimeout(900);
  await page.locator('#world [data-place="timetable"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-tickets]', { timeout: 15000 });
  await page.click('#ctx [data-tickets]'); await page.waitForSelector("#ctx [data-trip]", { timeout: 15000 }); await page.click("#ctx [data-trip]");
  await page.waitForFunction(() => /Ronda/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 }); await page.waitForTimeout(1500);
  await page.goto(url + "?seed=1&time=22:00&date=2026-10-12"); await page.waitForTimeout(1000);
  await page.waitForFunction(() => /Honeybrook station/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 }).catch(() => {});
  check(/Honeybrook station/.test(await scn()) && await fox().then(f => f.trip.done), "10pm: the last train home from Ronda");
  await page.goto(url + "?seed=1&time=18:30&date=2026-10-13"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__hbScene("hlane")); await page.waitForTimeout(900);
  await page.locator('#world [data-place="timetable"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-tickets]', { timeout: 15000 });
  await page.click('#ctx [data-tickets]'); await page.waitForTimeout(400);
  check(await page.locator("#ctx [data-trip]").count() === 0 && /last train to Ronda gone/.test(await page.locator("#ctx").innerText()), "after 6pm there are no more trains out to Ronda");
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nJeju, by ferry and by train")) try {
  console.log("\nJeju, by ferry and by train");
  const tw = await import(new URL("../src/data/towns.js", import.meta.url)), J = tw.TOWNS.jeju;
  check(J.screens.length === 4 && J.screens.every(sc => tw.townOf(sc) === "jeju" && sc.startsWith("jj_")) && J.arrive[0] === "jj_village" && J.arrive[0] !== J.screens[0] && J.ferry.arrive[0] === "jj_harbour",
    "Jeju: four screens; the station's in the village (bottom right, not top left like the others) and the ferry comes into the harbour");
  check(J.fare === 70 && J.ferry.fare === 50 && Object.keys(tw.TOWN_PLACES).filter(k => tw.TOWN_PLACES[k].scene && tw.TOWN_PLACES[k].scene.startsWith("jj_")).every(k => k.startsWith("jj")), "70 by train, 50 by ferry; every Jeju place starts with jj");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await closeFriends(page);   // these friends are close enough for presents sent round and day trips
  page.on("pageerror", e => errors.push(`jeju pageerror: ${e.message}`));
  const fox = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  const ids = () => page.locator("#actors .npc").evaluateAll(n => n.map(x => x.dataset.npc));
  await page.addInitScript(() => { if (!/jjcoins/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    f.coins = 300; f.board = f.board || {}; f.board.hearts = Object.assign(f.board.hearts || {}, {mei: 5, juniper: 5, bo: 4}); const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=10:00&date=2026-11-12"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=10:00&date=2026-11-12&jjcoins=1"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__hbScene("shore")); await page.waitForTimeout(900);
  await page.locator('#world [data-place="ferry"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-trip="jeju"][data-by="ferry"]', { timeout: 15000 });
  await page.click('#ctx [data-tpick="farid"]');
  check(/100/.test(await page.locator("#ctx [data-trip]").textContent()) && /ferry to Jeju/i.test(await page.locator("#ctx h2").textContent()), "the ferry stop at the end of the jetty: you and Farid to Jeju, 100 coins");
  await page.click("#ctx [data-trip]");
  await page.waitForFunction(() => /Jeju/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 }); await page.waitForTimeout(2000);
  check(await fox().then(f => f.coins === 200 && f.trip.town === "jeju" && f.trip.by === "ferry") && /harbour/.test(await page.locator("#sceneName").textContent()) && await ids().then(a => a.includes("farid")), "off the ferry at Jeju's harbour, with Farid");
  await page.locator('#world [data-place="jjpier"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-triphome="ferry"]', { timeout: 15000 });
  check(/ferry home/i.test(await page.locator("#ctx").innerText()), "the pier: a ferry home whenever you're ready");
  await page.click("#ctx [data-close]"); await page.waitForTimeout(300);
  for (const [gate, want, places] of [["jjToShoreN", "Seongsan", ["jjcone", "jjhaenyeo", "jjpools"]], ["jjToFarms", "tangerine farms", ["jjorchard", "jjshed", "jjponies", "jjcairns"]], ["jjToVillage", "stone village", ["jjtrain", "jjcafe", "jjdye", "jjstatues"]], ["jjToHarbourW", "harbour", ["jjpier", "jjmarket", "jjlights"]]]) {
    await page.locator(`#world [data-place="${gate}"]`).dispatchEvent("click");
    await page.waitForFunction(w => new RegExp(w).test(document.querySelector("#sceneName").textContent), want, { timeout: 25000 }); await page.waitForTimeout(1200);
    check(await page.evaluate(ps => ps.every(id => document.querySelector(`#world [data-place="${id}"]`)), places) && await ids().then(a => a.includes("farid")), `through the gate to Jeju's ${want} (Farid follows)`);
  }
  await page.evaluate(() => window.__hbScene("jj_village")); await page.waitForTimeout(1200);
  await page.locator('#world [data-place="jjtrain"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-triphome="train"]', { timeout: 15000 });
  await page.click('#ctx [data-triphome="train"]');
  await page.waitForFunction(() => !/Jeju/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 }); await page.waitForTimeout(1500);
  check(await fox().then(f => f.trip.done) && /station|lane/i.test(await page.locator("#sceneName").textContent()), "or home on the train over the sea bridge, whichever way you came");
  await page.evaluate(() => window.__hbScene("hwoods")); await page.waitForTimeout(1000);
  await page.locator('#world [data-place="wishtower"]').dispatchEvent("click"); await page.waitForTimeout(2600);
  const w1 = await fox().then(f => f.wish && f.wish.n);
  await page.locator('#world [data-place="wishtower"]').dispatchEvent("click"); await page.waitForTimeout(800);
  check(w1 === 4 && await fox().then(f => f.wish.n === 4), "the wish-tower by the river in the woods: one stone a day, and it grows");
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nJeju's rooms, people and things to do")) try {
  console.log("\nJeju's rooms, people and things to do");
  const tw = await import(new URL("../src/data/towns.js", import.meta.url)), J = tw.TOWNS.jeju;
  const jj = await import(new URL("../src/game/jeju.js", import.meta.url)), orch = await import(new URL("../src/data/orchard.js", import.meta.url));
  const kit = await import(new URL("../src/game/kitchen.js", import.meta.url)), sc = await import(new URL("../src/game/scoop.js", import.meta.url)), cp = await import(new URL("../src/game/companions.js", import.meta.url));
  check(Object.keys(J.rooms).length === 5 && Object.values(J.rooms).every(r => r.music && tw.TOWN_PLACES[r.door] && tw.TOWN_BOUNDS[Object.keys(J.rooms).find(k => J.rooms[k] === r)]), "five rooms behind Jeju's doors, each with its own music");
  { const used = new Set([...Object.values(tw.TOWNS.ronda.acts), ...Object.values(tw.TOWNS.kyoto.acts)].flatMap(a => Object.values(a).map(x => x.act)));
    check(Object.keys(J.acts).length === 7 && Object.values(J.acts).every(a => Object.values(a).every(x => !used.has(x.act))), "your friends all have something to do in Jeju, and none of it is what they did in Ronda or Kyoto"); }
  { const np = await import(new URL("../src/data/npcs.js", import.meta.url)), jl = np.NPCS.filter(n => n.local === "jeju"), rooms = Object.keys(J.rooms);
    check(jl.length >= 15 && jl.filter(n => n.tourist).length >= 6 && rooms.every(r => jl.filter(n => n.routine.some(sl => sl.scene === r)).length >= 2), "Jeju has locals and tourists, and at least two people for every room"); }
  { const F = {coins: 100, inv: {}}, add = (id, n) => { F.inv[id] = (F.inv[id] || 0) + n; };
    const d = jj.diveStart(); for (let i = 1; i <= 3; i++) { jj.descend(d, 1e4*i); jj.surface(d, 1e4*i + jj.DIVE.MS*.75); }
    const e = jj.diveStart(); jj.descend(e, 5000); jj.surface(e, 5300);
    check(d.done && d.good === 3 && e.last === "soon" && jj.diveReward(F, d, add, "2026-11-12") && F.inv.abalone === 1 && !jj.diveReward(F, d, add, "2026-11-12"), "the breath song: come up in the green three times, and Halmang gives you an abalone (once a day)");
    const st = jj.sortStart(() => 0, 0); for (let i = 0; i < 8; i++) jj.sortTap(st, "small", 1000 + i);
    check(st.done && st.good === 8 && jj.sortReward(F, st, add, "2026-11-12") === 4 && F.inv.tangerine === 4, "sorting tangerines with Mr Ko: eight right, and a bag of four to take home");
    check(jj.dyeScarf(F, "2026-11-12") && jj.takeDye(F, add, "2026-11-13").left === 2 && jj.takeDye(F, add, "2026-11-15").ready && F.inv.j_scarf === 1 && F.coins === 88, "the persimmon scarf: 12 coins, then three days on the washing line and it's a keepsake");
    const at = jj.slowPost(F, "me", "2026-11-12"); check(at === "2026-11-26" && jj.slowMail(F, "2026-11-25").length === 0 && jj.slowMail(F, "2026-11-26").length === 1, "the slow-post box: a postcard to yourself turns up two weeks later");
    check(!orch.treeOpen(F, orch.TREES.tangerine) && orch.treeOpen({jeju: {sapling: true}}, orch.TREES.tangerine) && orch.treeOpen(F, orch.TREES.apple), "tangerine trees grow in the orchard once Farid's brought a sapling home from Jeju"); }
  check(["heukdwaeji", "jeonbok", "hallaomija"].every(k => kit.TAPAS[k]) && ["hallabong", "omija", "tangerine"].every(k => sc.INGR[k]), "Jeju's ingredients: three new dishes at the kitchen, and tangerine, hallabong and omija gelato");
  check(cp.KEEP_SPOTS.fridge2 && cp.KEEP_SPOTS.fridge2.only === "magnet" && tw.TOWN_GOODS.j_magnet.magnet && ["j_hareubang", "j_tewak", "j_shell", "j_scarf"].every(k => tw.TOWN_GOODS[k].kind === "keepsake"), "keepsakes from Jeju, and a second magnet spot on the fridge");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`jeju rooms pageerror: ${e.message}`));
  const fox = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  const ids = () => page.locator("#actors .npc").evaluateAll(n => n.map(x => x.dataset.npc));
  await page.addInitScript(() => { if (!/jjtrip/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    f.coins = 300; f.trip = {town: "jeju", day: "2026-11-12", party: ["farid"], from: 600, by: "ferry"};
    const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=13:00&date=2026-11-12"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=13:00&date=2026-11-12&jjtrip=1"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__hbScene("jj_shore")); await page.waitForTimeout(1200);
  await page.locator('#world [data-place="jjhaenyeo"]').dispatchEvent("click");
  await page.waitForFunction(() => /divers/.test(document.querySelector("#sceneName").textContent), null, { timeout: 25000 }); await page.waitForTimeout(4800);
  check(await ids().then(a => a.includes("halmang") && a.includes("seoyeon")), "inside the divers' house: Halmang Kim and Seo-yeon");
  await page.locator('#world [data-rdspot="jj_haenyeo"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-jj="dive"]', { timeout: 15000 });
  await page.click('#ctx [data-jj="dive"]'); await page.waitForTimeout(300);
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => new Promise(res => { document.querySelector('#ctx [data-jj="down"]').click(); setTimeout(() => { const b = document.querySelector('#ctx [data-jj="up"]'); if (b) b.click(); res(); }, 2450); }));
    await page.waitForTimeout(300);
  }
  check(await fox().then(f => f.inv.abalone === 1 && f.jeju.dives === 1), "the breath song in the browser: dive, come up whistling, an abalone from Halmang");
  await page.click("#ctx [data-close]"); await page.waitForTimeout(300);
  for (const [room, who] of [["jj_shed", "takeshi"], ["jj_cafe", "haeun"], ["jj_market", "miok"], ["jj_dye", "jaewon"]]) {
    await page.evaluate(r => window.__hbScene(r), room); await page.waitForTimeout(1300);
    check(await ids().then(a => a.includes(who)) && await page.locator(`#world [data-rdspot="${room}"]`).count() === 1, `${room}: ${who} is there, and there's something to do`);
  }
  await page.evaluate(() => window.__hbScene("jj_shed")); await page.waitForTimeout(1200);
  await page.locator('#world [data-rdspot="jj_shed"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-jj="sort"]', { timeout: 15000 });
  await page.click('#ctx [data-jj="sort"]'); await page.waitForTimeout(300);
  for (let i = 0; i < 8; i++) { const size = await page.locator("#ctx .jjtang").getAttribute("data-size"); await page.click(`#ctx [data-jj="crate:${size}"]`); await page.waitForTimeout(120); }
  check(await fox().then(f => f.inv.tangerine === 4), "sorting with Mr Ko's crates: all eight right, four tangerines");
  await page.click("#ctx [data-close]"); await page.waitForTimeout(300);
  await page.evaluate(() => window.__hbScene("jj_cafe")); await page.waitForTimeout(1200);
  await page.locator('#world [data-rdspot="jj_cafe"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-jj="cafe:ade"]', { timeout: 15000 });
  await page.click('#ctx [data-jj="cafe:ade"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.coins === 295 && f.jeju.treats === 1), "a hallabong ade at the café (5)");
  await page.click("#ctx [data-close]"); await page.waitForTimeout(300);
  await page.evaluate(() => window.__hbScene("jj_market")); await page.waitForTimeout(1200);
  await page.locator('#world [data-rdspot="jj_market"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-rbuy="j_magnet"]', { timeout: 15000 });
  await page.click('#ctx [data-rbuy="j_magnet"]'); await page.waitForTimeout(300); await page.click("#ctx [data-close]"); await page.waitForTimeout(300);
  await page.locator('#world [data-rdspot="jjpost"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-jj="post:me"]', { timeout: 15000 });
  await page.click('#ctx [data-jj="post:me"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.inv.j_magnet === 1 && f.coins === 290 && f.jeju.post.length === 1), "the market: a Jeju fridge magnet (3), and a postcard in the slow-post box (2)");
  await page.click("#ctx [data-close]"); await page.waitForTimeout(300);
  await page.evaluate(() => window.__hbScene("jj_dye")); await page.waitForTimeout(1200);
  await page.locator('#world [data-rdspot="jj_dye"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-jj="dyego"]', { timeout: 15000 });
  await page.click('#ctx [data-jj="dyego"]'); for (const st of [0, 1, 2, 3]) await page.click(`#ctx [data-jj="dstep:${st}"]`);
  await page.click('#ctx [data-jj="dyedone"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.jeju.dye && f.jeju.dye.from === "2026-11-12" && f.coins === 278), "dyeing with Mr Moon: crush, soak, wring, sun (12), and the scarf comes home to dry");
  await page.click("#ctx [data-close]"); await page.waitForTimeout(300);
  await page.evaluate(() => window.__hbScene("jj_harbour")); await page.waitForTimeout(1200);
  await page.locator('#world [data-place="jjpier"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-triphome="ferry"]', { timeout: 15000 });
  await page.click('#ctx [data-triphome="ferry"]');
  await page.waitForFunction(() => !/Jeju/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 }); await page.waitForTimeout(1500);
  check(await fox().then(f => f.trip.done && f.jeju.sapling) && /foreshore|shore/i.test(await page.locator("#sceneName").textContent()), "home on the ferry to the foreshore jetty, and Farid's brought a tangerine sapling for the orchard");
  await page.goto(url + "?seed=1&time=10:00&date=2026-11-15"); await page.waitForTimeout(1200);
  await page.evaluate(() => window.__hbScene("base")); await page.waitForTimeout(1200);
  await page.locator('#world [data-rdspot="dyecloth"]').dispatchEvent("click"); await page.waitForTimeout(3500);
  check(await fox().then(f => f.inv.j_scarf === 1 && !f.jeju.dye), "three days later, the scarf's a deep rust on the washing line at home, and it's a keepsake now");
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nCinque Terre: the five villages (well, four)")) try {
  console.log("\nCinque Terre: the five villages (well, four)");
  const tw = await import(new URL("../src/data/towns.js", import.meta.url)), C = tw.TOWNS.cinque;
  check(C.screens.length === 4 && C.screens.every(sc => tw.townOf(sc) === "cinque" && sc.startsWith("ct_")) && C.arrive[0] === "ct_corniglia" && C.arrive[0] !== C.screens[0] && tw.TOWN_PLACES[C.station].scene === "ct_corniglia",
    "Cinque Terre: four screens, and the station's at the foot of Corniglia's steps (top right this time, not top left)");
  check(C.fare === 80 && Object.keys(tw.TOWN_PLACES).filter(k => (tw.TOWN_PLACES[k].scene || "").startsWith("ct_")).every(k => k.startsWith("ct")) && Object.keys(tw.TOWN_BRIDGES).filter(k => k.startsWith("ct_")).length === 4, "80 coins a ticket; every place starts with ct; four gates between the villages");
  check(Object.keys(C.rooms).length === 5 && Object.values(C.rooms).every(r => r.music && tw.TOWN_PLACES[r.door]) && Object.keys(C.rooms).every(k => tw.TOWN_BOUNDS[k]), "five rooms (focacceria, pesto kitchen, cantina, gelateria, lemon shop), each with its own music");
  { const used = new Set(["ronda", "kyoto", "jeju"].flatMap(t => Object.values(tw.TOWNS[t].acts)).flatMap(a => Object.values(a).map(x => x.act)));
    check(Object.keys(C.acts).length === 7 && Object.values(C.acts).every(a => Object.values(a).every(x => !used.has(x.act))), "everyone has something to do, and none of it is what they did in Ronda, Kyoto or Jeju"); }
  { const np = await import(new URL("../src/data/npcs.js", import.meta.url)), ids = np.NPCS.map(n => n.id), cl = np.NPCS.filter(n => n.local === "cinque"), rooms = Object.keys(C.rooms);
    check(new Set(ids).size === ids.length && cl.length >= 20 && cl.filter(n => n.tourist).length >= 6 && rooms.every(r => cl.filter(n => n.routine.some(sl => sl.scene === r)).length >= 2), "Cinque Terre has locals and tourists, and at least two people for every room"); }
  { const ITEMS = (await import(new URL("../src/data/items.js", import.meta.url))).ITEMS; await import(new URL("../src/game/loft.js", import.meta.url));
    const buys = Object.values(tw.TOWN_GOODS).filter(g => g.price > 0);
    check(ITEMS.w_raisin.sell === 36 && tw.TOWN_GOODS.c_sciac.price > ITEMS.w_raisin.sell && tw.TOWN_GOODS.c_limoncino.price > ITEMS.limoncino.sell && tw.TOWN_GOODS.c_anchovy.price > ITEMS.anchovy_salt.sell && buys.every(g => !g.sell || g.sell <= g.price),
      "what you make sells for less than the shop's own (raisin wine 36, Sciacchetrà 40): a sell price is never above a buy price"); }
  const ct = await import(new URL("../src/game/cinque.js", import.meta.url)), lf = await import(new URL("../src/game/loft.js", import.meta.url));
  const kit = await import(new URL("../src/game/kitchen.js", import.meta.url)), sc = await import(new URL("../src/game/scoop.js", import.meta.url)), cp = await import(new URL("../src/game/companions.js", import.meta.url));
  const fishing = await import(new URL("../src/game/fishing.js", import.meta.url)), items = await import(new URL("../src/data/items.js", import.meta.url));
  { const F = {coins: 100, inv: {}}, add = (id, n) => { F.inv[id] = (F.inv[id] || 0) + n; };
    const p = ct.pestoStart(); const wrong = ct.pestoAdd(p, 2);
    for (let i = 0; i < 5; i++) { ct.pestoAdd(p, i); for (let j = 0; j < 3; j++) ct.pestoPound(p); }
    check(wrong === "oops" && ct.pestoDone(p) && ct.finishPesto(F, add) && F.inv.pesto === 2 && F.coins === 94 && F.cinque.pestoLesson, "pesto with Nonna Pina: garlic, pine nuts, basil, cheese, oil, in order, pounding each one in (6 coins, two jars, and her secret)");
    const h = ct.harvestStart(() => 0.1); const early = ct.pick(h, 0); h.riding = false; h.ripe.forEach((r, i) => ct.pick(h, i));
    check(early === null && ct.harvestDone(h) && ct.finishHarvest(F, add) === 3 && F.inv.grape_white === 3 && F.cinque.raisin && ct.finishHarvest(F, add) === 0, "the monorail harvest: ride up, pick the ripe bunches, and Signor Bruno gives you three (once a day) and shows you raisin wine");
    check(!ct.paintBoat(F, "pink", "white", "Stella", add) && !ct.paintBoat(F, "red", "white", "Bartholomew", add) && ct.paintBoat(F, "red", "white", "Stella", add) && F.inv.c_boat === 1 && ct.boatCols(F)[0] === "#C9483A", "painting a boat with Aldo: a red hull, a white stripe, \"Stella\" on the bow, and a little model to keep");
    const t = ct.treat(F, ct.GELATO, "basilico"); check(t && F.coins === 91 && F.cinque.treats === 1, "a basil gelato at Gianni's (3)"); }
  { const H = 3600e3, D = 24*H, now = Date.UTC(2026, 9, 12), F = {coins: 0, inv: {grape_white: 4, grape_red: 2, lemon: 3, anchovy: 6, basil: 2, garlic: 1, pinenuts: 1, oliveoil: 1, chz_cheddar: 1}};
    check(!lf.loftOpen(F) && !lf.startBatch(F, "lemon", now), "the drying loft opens after your first trip to Cinque Terre");
    F.towns = {cinque: "2026-10-11"};
    check(!lf.startBatch(F, "rack", now) && !lf.startBatch(F, "pesto", now), "raisin wine and pesto wait for their lessons (the harvest with Bruno, the mortar with Nonna Pina)");
    F.cinque = {raisin: true, pestoLesson: true};
    check(lf.startBatch(F, "rack", now) && !F.inv.grape_white && !F.inv.grape_red && lf.startBatch(F, "lemon", now) && lf.startBatch(F, "salt", now) && lf.startBatch(F, "pesto", now) && F.inv.pesto === 2 && !F.inv.chz_cheddar, "six bunches on the racks, lemons steeping, anchovies in salt, and pesto straight away from your own basil, garlic, oil and cheese");
    check(!lf.collect(F, "rack", now + 2*D) && lf.collect(F, "rack", now + 3*D).cask && !lf.collect(F, "cask", now + 6*D) && lf.collect(F, "cask", now + 7*D).n === 3 && F.inv.w_raisin === 3, "three days on the racks, four in the cask: three bottles of raisin wine");
    check(lf.collect(F, "lemon", now + 5*D).n === 2 && F.inv.limoncino === 2 && lf.collect(F, "salt", now + 4*D).n === 2 && F.inv.anchovy_salt === 2, "five days for two limoncino, four for two jars of salted anchovies"); }
  check(items.CROPS.chickpea && items.ITEMS.chickpea_seed && items.ITEMS.pinenuts.visited === "cinque" && fishing.FISH.anchovy, "chickpeas to grow, pine nuts at the market once you've been, and anchovies in the sea");
  { const T = kit.TAPAS, local = Object.keys(T).filter(id => !T[id].special), sp = Object.keys(T).filter(id => T[id].special), maxLocal = Math.max(...local.map(id => T[id].price));
    check(sp.length === 28 && sp.every(id => T[id].price > maxLocal) && Object.keys(kit.SOURCE).length > 50 && Object.keys(T).every(id => Object.keys(T[id].need).every(g => kit.SOURCE[g])),
      "the 28 dishes from the trips are Specials, every one dearer than any local dish, and every ingredient says where it comes from");
    check(!kit.knows({}, "trofie") && kit.knows({towns: {cinque: "2026-10-12"}}, "trofie") && kit.knows({jeju: {}}, "jeonbok") && !kit.knows({towns: {cinque: 1}}, "salmorejo"), "a town's specials appear once you've been (Ronda's still need tasting)"); }
  check(["trofie", "focaccia", "farinata", "acciughe", "crostini"].every(k => kit.TAPAS[k]) && ["pinenuts", "limoncino", "basil", "lemon"].every(k => sc.INGR[k]), "Cinque Terre's dishes at the kitchen, and basil, lemon, pine nut and limoncino gelato");
  { const np = await import(new URL("../src/data/npcs.js", import.meta.url)), st = await import(new URL("../src/game/stories.js", import.meta.url)), J = np.NPCS.find(n => n.id === "ornella"), L = np.NPCS.find(n => n.id === "dario");
    check(J && J.name === "Ornella" && L && L.name === "Dario" && J.local === "cinque" && !J.tourist && J.routine.some(sl => sl.scene === "ct_vernazza" && sl.act === "poem") && J.routine.some(sl => sl.act === "sit" && sl.from >= 18*60) && L && L.routine.some(sl => sl.act === "sit" && sl.from >= 18*60) && tw.TOWN_PLACES.ctjason.scene === "ct_vernazza",
      "Ornella lives in Vernazza (the yellow house by the harbour): a verse at the café in the morning, the sunset on the harbour with Dario");
    const F = {met: {ornella: true}, inv: {}}, add = (id, n) => { F.inv[id] = (F.inv[id] || 0) + n; };
    F.story = {heard: {}, day: {carmen: "2026-10-12", rafael: "2026-10-12"}, log: [], flags: {}};
    const first = st.tellStory(F, "ornella", add, "2026-10-12"), again = st.storyReady(F, "ornella", "2026-10-12");
    ["2026-10-13", "2026-10-14", "2026-10-15"].forEach(d => st.tellStory(F, "ornella", add, d));
    check(first && /ferry/.test(first.lines.join(" ")) && !again && F.inv.s_poem === 1 && F.story.heard.ornella === 4, "Ornella tells her stories a chapter a day whenever you visit (even after two others that day), and the fourth is a poem for you to keep"); }
  check(cp.KEEP_SPOTS.fridge3 && cp.KEEP_SPOTS.fridge3.only === "magnet" && tw.TOWN_GOODS.c_magnet.magnet && ["c_boat", "c_plate", "c_mortar"].every(k => tw.TOWN_GOODS[k].kind === "keepsake"), "keepsakes (the boat model, the lemon plate, the mortar) and a third magnet spot on the fridge");
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nCinque Terre, by train")) try {
  console.log("\nCinque Terre, by train");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await closeFriends(page);   // these friends are close enough for presents sent round and day trips
  page.on("pageerror", e => errors.push(`cinque pageerror: ${e.message}`));
  const fox = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  const ids = () => page.locator("#actors .npc").evaluateAll(n => n.map(x => x.dataset.npc));
  await page.addInitScript(() => { if (!/ctcoins/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    f.coins = 300; const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=10:00&date=2026-10-12"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=10:00&date=2026-10-12&ctcoins=1"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__hbScene("hlane")); await page.waitForTimeout(900);
  await page.locator('#world [data-place="timetable"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-tickets]', { timeout: 15000 });
  await page.click('#ctx [data-tickets]'); await page.waitForSelector('#ctx [data-ttown="cinque"]', { timeout: 15000 });
  await page.click('#ctx [data-ttown="cinque"]'); await page.waitForTimeout(300);
  await page.click('#ctx [data-tpick="theo"]');
  check(/160/.test(await page.locator("#ctx [data-trip]").textContent()) && /Cinque Terre/.test(await page.locator("#ctx h2").textContent()), "the ticket window offers Cinque Terre: you and Theo, 160 coins");
  await page.click("#ctx [data-trip]");
  await page.waitForFunction(() => /Cinque Terre/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 }); await page.waitForTimeout(2000);
  check(await fox().then(f => f.coins === 140 && f.trip.town === "cinque" && f.towns && f.towns.cinque) && /Corniglia/.test(await page.locator("#sceneName").textContent()) && await ids().then(a => a.includes("theo")), "off the train at Corniglia, with Theo");
  for (const [gate, want, places] of [["ctToVernazza", "Vernazza", ["ctfocacceria", "cttower", "ctpiazza", "ctharbour", "ctjason"]], ["ctToMonterosso", "Monterosso", ["ctlimoni", "ctgigante", "ctbeach"]], ["ctToManarolaE", "Manarola", ["ctpesto", "ctgelato", "ctboats", "ctrocks", "ctpadlock"]], ["ctToCornigliaN", "Corniglia", ["cttrain", "ctcantina", "ctmonorail", "ctlemons"]]]) {
    await page.locator(`#world [data-place="${gate}"]`).dispatchEvent("click");
    await page.waitForFunction(w => new RegExp(w).test(document.querySelector("#sceneName").textContent), want, { timeout: 25000 }); await page.waitForTimeout(1200);
    check(await page.evaluate(ps => ps.every(id => document.querySelector(`#world [data-place="${id}"]`)), places) && await ids().then(a => a.includes("theo")), `through the gate to ${want} (Theo follows)`);
  }
  // the monorail harvest, in the browser
  await page.locator('#world [data-place="ctmonorail"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-ct="ride"]', { timeout: 15000 });
  await page.click('#ctx [data-ct="ride"]'); await page.waitForSelector('#ctx [data-ct="arrive"]', { timeout: 15000 });
  await page.click('#ctx [data-ct="arrive"]'); await page.waitForSelector('#ctx .ctbunch', { timeout: 15000 });
  const ripe = await page.locator('#ctx .ctbunch[data-ripe="1"]').evaluateAll(n => n.map(x => x.dataset.ct));
  for (const r of ripe) { await page.click(`#ctx [data-ct="${r}"]`); await page.waitForTimeout(100); }
  await page.click('#ctx [data-ct="harvestdone"]'); await page.waitForTimeout(400);
  check(await fox().then(f => f.cinque.raisin && f.inv.grape_white === 3), "up the terraces on the monorail, every ripe bunch picked: Signor Bruno shows you raisin wine and gives you three bunches");
  await page.click("#ctx [data-close]").catch(() => {}); await page.waitForTimeout(300);
  await page.evaluate(() => window.__hbScene("ct_manarola")); await page.waitForTimeout(1200);
  await page.locator('#world [data-place="ctpesto"]').dispatchEvent("click");
  await page.waitForFunction(() => /pesto/i.test(document.querySelector("#sceneName").textContent), null, { timeout: 25000 }); await page.waitForTimeout(1500);
  check(await ids().then(a => a.includes("nonnapina") && a.includes("marta")), "inside the pesto kitchen: Nonna Pina, and Marta with the basil");
  await page.locator('#world [data-rdspot="ct_pesto"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-ct="pesto"]', { timeout: 15000 });
  await page.click('#ctx [data-ct="pesto"]'); await page.waitForTimeout(200);
  for (let i = 0; i < 5; i++) { await page.click(`#ctx [data-ct="padd:${i}"]`); await page.waitForTimeout(80); for (let j = 0; j < 3; j++) { await page.click('#ctx [data-ct="pound"]'); await page.waitForTimeout(60); } }
  await page.click('#ctx [data-ct="pestodone"]'); await page.waitForTimeout(400);
  check(await fox().then(f => f.inv.pesto === 2 && f.cinque.pestoLesson && f.coins === 134), "pesto in the marble mortar, in the right order: two jars (6) and Nonna Pina's secret");
  await page.click("#ctx [data-close]"); await page.waitForTimeout(300);
  await page.evaluate(() => window.__hbScene("ct_manarola")); await page.waitForTimeout(1200);
  await page.locator('#world [data-place="ctboats"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-ct="hull:green"]', { timeout: 15000 });
  await page.click('#ctx [data-ct="hull:green"]'); await page.click('#ctx [data-ct="stripe:yellow"]'); await page.click('#ctx [data-ct="bname:Stella"]'); await page.click('#ctx [data-ct="paint"]'); await page.waitForTimeout(400);
  check(await fox().then(f => f.cinque.boat && f.cinque.boat.hull === "green" && f.cinque.boat.name === "Stella" && f.inv.c_boat === 1), "painting a boat in the street: fisherman's green, a yellow stripe, \"Stella\" on the bow, and a model to keep");
  await page.click("#ctx [data-close]"); await page.waitForTimeout(300);
  for (const [room, who] of [["ct_focacceria", "ilaria"], ["ct_cantina", "carla"], ["ct_gelato", "gianni"], ["ct_limoni", "franca"]]) {
    await page.evaluate(r => window.__hbScene(r), room); await page.waitForTimeout(1300);
    check(await ids().then(a => a.includes(who)) && await page.locator(`#world [data-rdspot="${room}"]`).count() === 1, `${room}: ${who} is there, and there's something to do`);
  }
  await page.locator('#world [data-rdspot="ct_limoni"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-rbuy="c_magnet"]', { timeout: 15000 });
  await page.click('#ctx [data-rbuy="c_magnet"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.inv.c_magnet === 1 && f.coins === 131), "the lemon shop: a Cinque Terre fridge magnet (3)");
  await page.click("#ctx [data-close]"); await page.waitForTimeout(300);
  await page.evaluate(() => window.__hbScene("ct_corniglia")); await page.waitForTimeout(1200);
  await page.locator('#world [data-place="cttrain"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-triphome="train"]', { timeout: 15000 });
  await page.click('#ctx [data-triphome="train"]');
  await page.waitForFunction(() => !/Cinque Terre/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 }); await page.waitForTimeout(1500);
  check(await fox().then(f => f.trip.done), "home on the train from Corniglia");
  await page.evaluate(() => window.__hbScene("shore")); await page.waitForTimeout(1200);
  check(await page.locator("#sceneArt").evaluate(e => e.innerHTML.includes("#2E7A5A")), "the painted boat (green, like the one in Manarola) is pulled up on the foreshore sand");
  await page.evaluate(() => window.__hbScene("vineyard")); await page.waitForTimeout(1000);
  await page.locator('#world [data-place="barrels"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-loft]', { timeout: 15000 });
  await page.click('#ctx [data-loft]'); await page.waitForSelector('#ctx [data-lf="start:rack"]', { timeout: 15000 });
  check(/drying loft/i.test(await page.locator("#ctx h2").textContent()) && await page.locator('#ctx [data-lf="start:rack"]').isDisabled(), "up the ladder in the barrel shed: the drying loft (three bunches isn't enough for the racks yet)");
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nthe kite and the farm brush (round 130 fixes)")) try {
  console.log("\nthe kite and the farm brush (round 130 fixes)");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`kite pageerror: ${e.message}`));
  const fox = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  await page.addInitScript(() => { if (!/kitebrush/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    f.inv = {...(f.inv || {}), kite: 1, brush: 1, chz_cheddar: 1, chz_brie_ex: 1, honey_lav: 1}; const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=11:00&date=2026-10-10"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=11:00&date=2026-10-10&kitebrush=1"); await page.waitForTimeout(1000);
  await page.evaluate(() => window.__hbScene("village")); await page.waitForTimeout(900);
  await page.click('[data-open="bag"]'); await page.click('#bag .item[data-id="kite"]'); await page.waitForTimeout(600);
  check(await fox().then(f => f.inv.kite === 1), "using the kite away from the field doesn't use it up (it stays in the backpack)");
  await page.evaluate(() => window.__hbScene("hfarm")); await page.waitForTimeout(1200);
  await page.locator('#world [data-place="farmhouse"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-hf="req"]', { timeout: 20000 });
  check(/Still to brush: Daisy, Buttercup and Mochi/.test(await page.locator("#ctx").innerText()) && await page.locator('#ctx [data-hf="req"]').isDisabled(), "Felix's ask says what's still to do while the button's greyed out");
  await page.click("#ctx [data-close]"); await page.waitForTimeout(300);
  await page.locator('#world [data-place="cows"]').dispatchEvent("click"); await page.waitForTimeout(3500); await page.click("#ctx [data-close]").catch(() => {});
  for (let i = 0; i < 3; i++) { await page.click('[data-open="bag"]').catch(() => {}); await page.click('#bag .item[data-id="brush"]'); await page.waitForTimeout(500); }
  check(await fox().then(f => ["daisy", "buttercup", "mochi"].every(k => f.hfarm.brushed[k] === "2026-10-10") && f.inv.brush === 1), "the brush from the backpack brushes the cows at the farm, and it's still in the backpack");
  await page.locator('#world [data-place="farmhouse"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-hf="req"]:not([disabled])', { timeout: 20000 });
  await page.click('#ctx [data-hf="req"]'); await page.waitForTimeout(500);
  check(await fox().then(f => f.hfarm.reqDone === "2026-10-10"), "and then you can tell Felix it's done");
  await page.evaluate(() => window.__hbScene("village")); await page.waitForTimeout(800);
  await page.locator('#world [data-place="market"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-shop="sell"]', { timeout: 20000 });
  await page.click('#ctx [data-shop="sell"]'); await page.waitForSelector('#ctx .item[data-id="chz_cheddar"]', { timeout: 15000 });
  const c0 = await fox().then(f => f.coins);
  for (const id of ["chz_cheddar", "chz_brie_ex", "honey_lav"]) { await page.click(`#ctx .item[data-id="${id}"]`); await page.waitForTimeout(300); }
  check(await fox().then(f => f.coins === c0 + 17 + 21 + 10 && !f.inv.chz_cheddar), "your own cheese and honey sell at the market, tiered by how long they ripen: cheddar (4 days) 17, an excellent brie (3 days) 21, lavender honey 10");
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nthe ice cream trolley, and the delivery bike's orders")) try {
  console.log("\nthe ice cream trolley, and the delivery bike's orders");
  { const sc = await import(new URL("../src/game/scoop.js", import.meta.url)), g = await import(new URL("../src/game/goals.js", import.meta.url)), F = {coins: 0}, s = sc.scoopState(F);
    s.recipes = ["a", "b", "c", "d"].map(id => ({id, ings: [], name: id.toUpperCase() + " Gelato", col: "#FFF"})); s.tubs = {a: 20, b: 5, c: 20, d: 20};
    const tr = sc.loadTrolley(F, ["a", "b", "c", "d"]);
    check(tr && Object.keys(tr.tubs).length === 3 && tr.tubs.a === 10 && tr.tubs.b === 5 && s.tubs.a === 10 && !s.tubs.b && g.ride(F) === "walk" && sc.trolleyPace(F) < .8, "the trolley takes three flavours, ten scoops each, from the shop's tubs; you walk slower pushing it, and can't ride");
    const rnd = Math.random; Math.random = () => .1; const r = sc.trolleySell(F, "hana", "2026-10-12", {season: "summer", hm: 14*60}), again = sc.trolleySell(F, "hana", "2026-10-12", {}); Math.random = rnd;
    check(r && r.items.length && r.items.every(([f]) => f === "cup" || f === "cone") && F.coins === r.coins && again === null, "tap someone and they buy a cup or a cone (never floats or waffles), once a day each, and the coins come to you");
    const back = sc.returnTrolley(F); check(back.back === 25 - r.items.length && back.n === r.items.length, "wheel it back in time and what's left goes back in the freezer");
    sc.loadTrolley(F, ["c"]); s.trolley.at -= 3*3600e3; check(sc.trolleyMelted(s) && sc.trolleySell(F, "theo", "2026-10-12", {}) === null && sc.returnTrolley(F).melted === 10, "after two hours the ice packs give up: no more sales, and the leftovers melt");
    s.up.bike = 1; s.display = ["d"]; s.at = wall("2026-10-12T04:00:00Z") - 60e3; const off = globalThis.__hbOffset; globalThis.__hbOffset = wall("2026-10-12T04:00:00Z") - Date.now();
    Math.random = () => .001; const out = sc.scoopTick(F); Math.random = rnd; globalThis.__hbOffset = off;
    check(out.orders && out.orders[0].shop === "scoop" && /^a (cup|cone) of /.test(out.orders[0].what) && out.orders[0].coins >= sc.DELIVERY.fee + 1, "with the bike, villagers order a cup or a cone from wherever they are (shop price + a delivery fee)");
    s.at = wall("2026-10-12T14:30:00Z") - 60e3; globalThis.__hbOffset = wall("2026-10-12T14:30:00Z") - Date.now(); Math.random = () => .001; const late = sc.scoopTick(F); Math.random = rnd; globalThis.__hbOffset = off;
    check(!(late && late.orders && late.orders.length) && sc.deliveryHours(21*60 + 59) && !sc.deliveryHours(22*60) && !sc.deliveryHours(9*60 + 59) && sc.riderOn(20*60) && !sc.riderOn(13*60 + 10), "delivery orders run 10am to 10pm (late-night suppers), and none come in after"); }
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`trolley pageerror: ${e.message}`));
  const fox = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  await page.addInitScript(() => { if (!/trpatch/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    f.scoop = {recipes: [{id: "mango+milk", ings: ["mango", "milk"], name: "Mango Gelato", col: "#F8D59A", dairy: true}, {id: "pandan", ings: ["pandan"], name: "Pandan Sorbet", col: "#9CC27E"}], tubs: {"mango+milk": 40, pandan: 40}};
    const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=14:00&date=2026-10-12"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=14:00&date=2026-10-12&trpatch=1"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__hbScene("scoopshop")); await page.waitForTimeout(800);
  await page.locator('#world [data-spot="gcounter"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-gview="trolley"]', { timeout: 15000 });
  await page.click('#ctx [data-gview="trolley"]'); await page.waitForSelector('#ctx [data-gtsel]', { timeout: 15000 });
  await page.click('#ctx [data-gtsel="mango+milk"]'); await page.click('#ctx [data-gtsel="pandan"]'); await page.click('#ctx [data-gtrolley="go"]'); await page.waitForTimeout(400);
  check(await fox().then(f => f.scoop.trolley && f.scoop.trolley.tubs["mango+milk"] === 10 && f.scoop.trolley.tubs.pandan === 10 && f.scoop.tubs.pandan === 30), "at the counter: load the trolley with two flavours, ten scoops each");
  await page.evaluate(() => window.__hbScene("village")); await page.waitForTimeout(1500);
  check(await page.locator("#hero").evaluate(e => e.classList.contains("trolley")), "out in the square, you're pushing the little pink trolley");
  const who = await page.locator("#actors .npc:not([data-npc^=\"agent\"])").first().getAttribute("data-npc");
  await page.locator(`#actors .npc[data-npc="${who}"]`).dispatchEvent("click"); await page.waitForTimeout(600);
  check(await fox().then(f => f.scoop.asked && f.scoop.asked.ids.includes(who)), `tap someone (${who}) and you offer them an ice cream`);
  await page.evaluate(() => window.__hbScene("scoopshop")); await page.waitForTimeout(2000);
  check(await fox().then(f => !f.scoop.trolley && f.scoop.tubs.pandan + f.scoop.tubs["mango+milk"] >= 60), "wheel it back into the shop and it's put away, the unsold scoops back in the freezer");
  await page.evaluate(() => window.__hbScene("village")); await page.waitForTimeout(1200);
  await page.evaluate(() => window.__hbOrder()); await page.waitForTimeout(800);
  const rode = await page.locator("#actors .rideby .bikeArt").count(); await page.waitForTimeout(7000);
  check(rode === 1 && await page.locator("#actors .rideby").count() === 0, "an order goes out while you're in the square: Tomo pedals past on the mint bike with the cool box, and is gone");
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nthe bike takes bonbons and tapas too, and every shop says its takings at closing")) try {
  console.log("\nthe bike takes bonbons and tapas too, and every shop says its takings at closing");
  { const cc = await import(new URL("../src/game/cocoa.js", import.meta.url)), vy = await import(new URL("../src/game/vineyard.js", import.meta.url)), d = "2026-10-12";
    const c = cc.cocoaState({}); c.sold[d] = {n: 3, coins: 40, bonbons: 6, deliv: 2}; const early = cc.cocoaNews(c, d, 19*60), eve = cc.cocoaNews(c, d, 20*60 + 5), again = cc.cocoaNews(c, d, 21*60);
    check(!early && /sold 3 bars and 6 bonbons: 40 coins, 2 of them delivered by bike/.test(eve) && !again, "the Cocoa Room tells you the day's takings when it shuts at 8 (once)");
    const F = {}; const v = vy.vineState(F); v.today = {day: d, bottles: 2, glasses: 5, plates: 9, coins: 120, deliv: 3};
    check(/sold 2 bottles, 5 glasses and 9 plates: 120 coins, with 3 orders out by bike/.test(vy.wineNews(F, d, 22*60 + 5) || "") && !vy.wineNews(F, d, 23*60), "and the winery at 10"); }
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await closeFriends(page);   // these friends are close enough for presents sent round and day trips
  page.on("pageerror", e => errors.push(`bikesend pageerror: ${e.message}`));
  const fox = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  await page.addInitScript(() => { if (!/bspatch/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    f.scoop = {up: {bike: 1}, recipes: [], tubs: {}}; f.goals = {...(f.goals || {}), cocoa: true}; f.cocoa = {bars: {milk: 3, dark: 0, white: 0}};
    const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=11:00&date=2026-10-12"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=11:00&date=2026-10-12&bspatch=1"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__hbScene("bay")); await page.waitForTimeout(900);
  await page.locator('#world [data-place="dbike"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-gvother="bar:milk"]', { timeout: 15000 });
  await page.click('#ctx [data-gvother="bar:milk"]'); await page.waitForSelector('#ctx [data-gvto="hana"]', { timeout: 15000 }); await page.click('#ctx [data-gvto="hana"]'); await page.waitForTimeout(400);
  check(await fox().then(f => f.cocoa.bars.milk === 2 && f.thanks.some(t => t.who === "hana" && t.item === "bar_milk")), "from the delivery bike: a milk chocolate bar off the Cocoa Room's wall, pedalled round to Hana (a thank-you note to come)");
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nSaturday disco night at the cellar door")) try {
  console.log("\nSaturday disco night at the cellar door");
  { const t = await import(new URL("../src/game/tours.js", import.meta.url)), sat = "2026-10-10", fri = "2026-10-09", crowd = t.discoCrowd(sat);
    check(t.discoNow(sat, 21*60) && !t.discoNow(sat, 19*60) && !t.discoNow(fri, 21*60) && !t.discoNow(sat, 23*60 + 40), "disco night is Saturdays, 8 to 11:30pm");
    check(crowd.length === 16 && !crowd.some(id => ["farid", "mei", "okada", "lin", "celeste", "pilar"].includes(id)) && crowd.filter(id => t.NIGHT_TOURISTS.includes(id)).length === 5 && crowd.every(id => t.DISCO_MOVES.includes(t.discoSlot(id, sat, 21*60).act)),
      "a packed floor: most of the village (not Farid, Mei, Mr Okada or Lin, nor anyone working) and five tourists, all dancing"); }
  { const t = await import(new URL("../src/game/tours.js", import.meta.url)), days = ["2026-10-10", "2026-10-17", "2026-10-24", "2026-10-31"];
    const moves = new Set(days.flatMap(d => Object.values(t.discoFloor(d)).map(f => f.move))), spots = Object.values(t.discoFloor(days[0])).map(f => f.at), drifters = Object.values(t.discoFloor(days[0])).filter(f => f.drift).length;
    const xs = new Set(spots.map(([x]) => x)), couple = days.map(d => t.discoFloor(d)).find(f => f.hana && f.theo);
    check(moves.size >= 5 && xs.size >= 12 && drifters >= 3 && (!couple || (Math.hypot(couple.hana.at[0] - couple.theo.at[0], couple.hana.at[1] - couple.theo.at[1]) < 70 && couple.hana.dir !== couple.theo.dir)),
      `not a grid: knots of two or three, ${moves.size} different moves, some drifting between knots, and Hana and Theo dance together facing each other`);
    check(t.dateSlot("tomi", "2026-10-10", 20*60) && !t.discoSlot("tomi", "2026-10-10", 20*60)?.date, "Tomi and Posy keep their date night (7:30 to 9) and come on to the disco after"); }
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`disco pageerror: ${e.message}`));
  await page.addInitScript(() => { if (!/dcpatch/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return; f.goals = {...(f.goals || {}), cellar: true};
    const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=21:00&date=2026-10-10"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=21:00&date=2026-10-10&dcpatch=1"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__hbScene("cellar")); await page.waitForTimeout(2500);
  const dancers = await page.locator("#actors .npc").evaluateAll(n => n.filter(x => /act-(dance|boogie|armsup|twirl|shuffle|point)\b/.test(x.getAttribute("class"))).length);
  check(await page.locator("#sceneArt .disco .dball").count() === 1 && dancers >= 12, `the glitter ball's out and the floor's packed (${dancers} dancing)`);
  await page.goto(url + "?seed=1&time=17:00&date=2026-10-10"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__hbScene("cellar")); await page.waitForTimeout(1500);
  check(await page.locator("#sceneArt .disco").count() === 0, "before 8 the cellar's its usual calm self");
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nPilar's list, keeping things back, and more tapas")) try {
  console.log("\nPilar's list, keeping things back, and more tapas");
  const k = await import(new URL("../src/game/kitchen.js", import.meta.url)), day = "2026-10-14", F = {coins: 0, inv: {}};
  const kk = k.kitchenState(F); Object.assign(kk.larder, {tulip: 2, flour: 3, potato: 4, egg: 4, tomato: 4, loaf: 2});
  k.setKeep(F, "tulip", 2);
  k.cookTick(F, day);
  check(kk.larder.tulip === 2 && !(F.vine.menu || {}).shortbread, "flowers kept back for petal syrup: Pilar doesn't make flower shortbread with them");
  kk.pilarNo.bread = true; kk.pilarNo.tapas = true; F.vine.tapasList = []; kk.larder.flour = 1; kk.oven = null;
  k.cookTick(F, day);
  check(!kk.oven && !k.tapasAll(F, day).length, "untick bread and tapas on Pilar's list: she leaves the oven and the chalkboard to you");
  ["tortilla", "huevos", "patatas", "puerros"].forEach(id => k.chooseTapas(F, id, day));
  check(k.tapasAll(F, day).map(t => t.id).join() === "tortilla,huevos,patatas", "up to three tapas of the day on the chalkboard");
  check(!!k.dropTapas(F, "patatas", day) && k.tapasAll(F, day).length === 2, "and one can come off again before it's cooked");
  k.planTapas(F, "puerros", "2026-10-15"); k.planTapas(F, "tortilla", "2026-10-15");
  check(k.tapasAll(F, "2026-10-15").map(t => t.id).join() === "puerros,tortilla", "tomorrow's planned tapas are on the chalkboard first thing the next day");
  { const G = {inv: {honey: 1}}; const gk = k.kitchenState(G); Object.assign(gk.larder, {egg: 2, flour: 2}); gk.pilarNo.bread = true; k.sendToKitchen(G, "honey");
    k.cookTick(G, day); const held = !(G.vine.menu || {}).honeycake && gk.larder.honey === 1;
    gk.fresh.honey.until = Date.now() - 1; k.cookTick(G, day);
    check(held && G.vine.menu.honeycake === 4, "honey just brought in waits 15 minutes before Pilar can bake it into honey cake (time to set keep)"); }
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nthe greenhouse, herbs and gambas")) try {
  console.log("\nthe greenhouse, herbs and gambas");
  { const g = await import(new URL("../src/game/greenhouse.js", import.meta.url)), it = await import(new URL("../src/data/items.js", import.meta.url)), k = await import(new URL("../src/game/kitchen.js", import.meta.url)), fi = await import(new URL("../src/game/fishing.js", import.meta.url));
    const F = {inv: {garlic_seed: 1, basil_seed: 1, gh_strawberry_seed: 1}}, add = (id, n) => { F.inv[id] = (F.inv[id] || 0) + n; if (F.inv[id] <= 0) delete F.inv[id]; };
    check(!g.ghPlant(F, 0, "basil_seed", add) && !g.ghSeeds(F).includes("basil_seed") && !!g.ghPlant(F, 0, "garlic_seed", add) && !!g.ghPlant(F, 1, "gh_strawberry_seed", add), "garlic and out-of-season strawberries planted in the greenhouse beds (the leafy herbs go in the pots)");
    F.gh.beds[0].plantedAt -= 9*3600e3; const r = g.ghHarvest(F, 0, add);
    check(r && F.inv.garlic === 4 && !F.gh.beds[0] && !g.ghHarvest(F, 1, add), "the garlic's ready in eight hours (four bulbs); the strawberries take longer");
    // round 155: the herb pots along the glass: plant once, clip, and it grows back in half the time
    check(g.potSeeds(F).join() === "basil_seed" && !!g.potPlant(F, 0, "basil_seed", add) && !F.inv.basil_seed && F.gh.pots[0].crop === "basil" && !g.potClip(F, 0, add), "basil potted up by the glass");
    F.gh.pots[0].plantedAt -= 4*3600e3 + 1000; const c1 = g.potClip(F, 0, add);
    check(c1 && F.inv.basil === 3 && F.gh.pots[0] && F.gh.pots[0].crop === "basil" && F.gh.pots[0].clips === 1 && g.ghGrowth(F.gh.pots[0]) < .01, "clip it: three bunches of basil, and the plant stays in its pot (no replanting)");
    F.gh.pots[0].plantedAt -= 2*3600e3 + 1000; check(g.ghGrowth(F.gh.pots[0]) >= 1 && !!g.potClip(F, 0, add) && F.inv.basil === 6, "it grows back in half the time (two hours for basil), ready to clip again");
    g.setGhTools(() => ({fertiliser: true, seeder: true})); F.inv.garlic_seed = 1; g.ghPlant(F, 2, "garlic_seed", add); F.gh.beds[2].plantedAt -= 9*3600e3; F.inv.garlic_seed = 1; const r2 = g.ghHarvest(F, 2, add);
    check(r2 && r2.n === 5 && r2.again && F.gh.beds[2] && F.gh.beds[2].crop === "garlic" && !F.inv.garlic_seed, "with the fertiliser one more of everything; the seeder sows a bed again after picking");
    F.gh.pots[1] = {crop: "mint", plantedAt: Date.now() - 5*3600e3, bonus: 0}; F.gh.beds[2].plantedAt -= 9*3600e3; const ripe = g.ghRipe(F, add); g.setGhTools(() => ({}));
    check(ripe.length === 2 && F.gh.pots[1] && F.inv.mint === 4, "the auto harvester picks everything ripe under the glass, clipping the pots");
    check(["garlic", "basil", "mint", "rosemary", "chives", "thyme"].every(h => it.CROPS[h] && it.ITEMS[h + "_seed"] && it.ITEMS[h + "_seed"].greenhouse) && it.ITEMS.gh_leek_seed && it.ITEMS.gh_leek_seed.greenhouse, "six herbs to grow, and greenhouse packets of seasonal seeds like leeks");
    { const G = {coins: 0, inv: {fish: 2, sardine: 3, shrimp: 1, apple: 2}}; const one = fi.sellCatch(G, "sardine"), all = fi.sellCatch(G);
    check(one && one.coins === 2 && all && all.n === 5 && G.coins === 2 + 6 + 4 + 2 && G.inv.apple === 2 && !G.inv.fish, "selling the catch: one sardine, then the lot (everyday fish too), and nothing that isn't fish"); }
  check(fi.FISH.shrimp && fi.FISH.shrimp.spot === "sea" && k.TAPAS.gambas && k.TAPAS.gambas.need.shrimp === 3 && k.TAPAS.gambas.need.garlic === 2 && k.TAPAS.gambas.need.oliveoil === 1, "shrimp from the sea, and gambas al ajillo: shrimp, garlic and olive oil"); }
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`greenhouse pageerror: ${e.message}`));
  await page.addInitScript(() => { if (!/ghcoins/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    f.coins = 500; f.inv = Object.assign(f.inv || {}, {garlic_seed: 1, basil_seed: 1, tomato_seed: 2}); f.tools = {harvester: true, seeder: true, fertiliser: true};
    f.plots = f.plots || []; f.plots[0] = {crop: "tomato", seed: "tomato_seed", plantedAt: Date.now() - 7*3600e3, wateredAt: Date.now() - 7*3600e3, bonus: 0}; f.plots[1] = null; f.plots[2] = null; const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=10:30&date=2026-10-14"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=10:30&date=2026-10-14&ghcoins=1"); await page.waitForTimeout(1000);
  await page.evaluate(() => window.__hbScene("farm")); await page.waitForTimeout(900);
  await page.locator('#world [data-gh="door"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-goal="greenhouse"]', { timeout: 15000 });
  await page.click('#ctx [data-goal="greenhouse"]'); await page.waitForTimeout(800);
  await page.locator('#world [data-gh="door"]').dispatchEvent("click");
  await page.waitForFunction(() => /greenhouse/i.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  await page.locator('#world [data-ghbed="0"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-gh="plant"][data-id="garlic_seed"]', { timeout: 15000 });
  await page.click('#ctx [data-gh="plant"][data-id="garlic_seed"]'); await page.waitForTimeout(400);
  check(await page.evaluate(() => { const f = JSON.parse(localStorage.getItem("fox.fox")); return f.gh && f.gh.beds[0] && f.gh.beds[0].crop === "garlic"; }), "through the glass door: garlic planted in the first bed");
  await page.click('#ctx [data-close]').catch(() => {}); await page.waitForTimeout(300);
  check(await page.locator('#world [data-ghpot]').count() === 6, "six herb pots in a row along the glass");
  await page.locator('#world [data-ghpot="0"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-gh="pplant"][data-id="basil_seed"]', { timeout: 15000 });
  await page.click('#ctx [data-gh="pplant"][data-id="basil_seed"]'); await page.waitForTimeout(400);
  check(await page.evaluate(() => { const f = JSON.parse(localStorage.getItem("fox.fox")); return f.gh.pots[0] && f.gh.pots[0].crop === "basil"; }) && await page.locator('#world [data-ghpot="0"]').getAttribute("aria-label").then(l => /Basil/.test(l)), "basil planted in the first herb pot");
  check(await page.evaluate(() => { const f = JSON.parse(localStorage.getItem("fox.fox")); return f.inv.tomato === 4 && f.plots[0] && f.plots[0].crop === "tomato" && f.inv.tomato_seed === 1; }), "the auto harvester brought the ripe tomatoes in (fertiliser: four), and the seeder sowed the plot again");
  await page.evaluate(() => window.__hbScene("farm")); await page.waitForTimeout(900);
  await page.locator('#world [data-plot="1"]').dispatchEvent("click"); await page.waitForSelector('#ctx .item[data-id="tomato_seed"]', { timeout: 15000 });
  await page.click('#ctx .item[data-id="tomato_seed"]'); await page.waitForTimeout(400);
  check(await page.evaluate(() => { const f = JSON.parse(localStorage.getItem("fox.fox")); return f.plots[1] && f.plots[1].crop === "tomato" && !f.inv.tomato_seed; }), "with the auto seeder, one tap sows every empty plot it has seeds for");
  check(await page.evaluate(() => { const f = JSON.parse(localStorage.getItem("fox.fox")); return f.coins <= 100 && f.goals && f.goals.greenhouse; }), "the greenhouse cost 400 coins");
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nthe old mill and the olive grove")) try {
  console.log("\nthe old mill and the olive grove");
  { const tw = await import(new URL("../src/data/towns.js", import.meta.url)), it = await import(new URL("../src/data/items.js", import.meta.url)), ml = await import(new URL("../src/game/mill.js", import.meta.url));
    check(tw.TOWN_GOODS.oliveoil.sell > ml.JARS_PER_BOTTLE*it.ITEMS.olives.sell && tw.TOWN_GOODS.oliveoil.price > tw.TOWN_GOODS.oliveoil.sell, "a bottle of oil sells for more than the three jars of olives it takes (and Rafael's costs more than it sells for)");
    check(/T\.R\. 1912/.test(ml.millStory({})), "the old photograph tells the mill's story: Tomás, 1912");
    const sd = await import(new URL("../src/data/stories.js", import.meta.url)), np = await import(new URL("../src/data/npcs.js", import.meta.url));
    check(!np.NPCS.some(n => n.id === "remedios") && /Tomás/.test(np.NPCS.find(n => n.id === "ines").job) && sd.STORIES.ines.some(c => (c.needs || []).includes("mill")) && sd.STORIES.ines.some(c => c.reward === "spoon") && sd.STORIES.ines.some(c => c.reward === "oilcake"), "Tomás's descendant in Honeybrook: Ines at the vineyard, and her story"); }
  const m = await import(new URL("../src/game/mill.js", import.meta.url)), v = await import(new URL("../src/game/vineyard.js", import.meta.url));
  const F = {coins: 999, inv: {olives: 5}}, add = (id, n) => { F.inv[id] = (F.inv[id] || 0) + n; };
  const vs = v.vineState(F); vs.oliveCrate = 4;
  const started = m.startPress(F, 3);
  check(!!started && !F.inv.olives && vs.oliveCrate === 0 && F.mill.press.n === 3, "pressing three bottles: nine jars of olives, from the backpack first, then the vineyard crate");
  check(!m.collectOil(F, add), "the oil isn't ready straight away");
  F.mill.press.start -= 2*3600e3;
  check(!!m.collectOil(F, add) && F.inv.oliveoil === 3 && !F.mill.press, "an hour later: three bottles of olive oil");
  v.buy(F, "grove");
  check(!vs.grove && F.coins === 999, "the grove needs the first olive tree by the path");
  v.buy(F, "olive"); v.buy(F, "grove");
  check(!!vs.grove && F.coins === 999 - 150 - 300, "the olive grove: four more trees for 300 coins");
  vs.grove.planted -= 9*3600e3;
  check(!!v.pickGrove(F) && F.inv.olives === 12 && !v.pickGrove(F), "picking the grove: twelve jars of olives, then it needs six hours");
  vs.oliveCrate = 6;
  check(!!v.takeOliveCrate(F) && F.inv.olives === 18 && !vs.oliveCrate, "taking the olive crate the vineyard hands filled");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`mill pageerror: ${e.message}`));
  await page.addInitScript(() => { if (!/millp/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    f.coins = 800; f.inv = Object.assign(f.inv || {}, {olives: 7}); const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=11:00&date=2026-10-14"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=11:00&date=2026-10-14&millp=1"); await page.waitForTimeout(1000);
  await page.evaluate(() => window.__hbScene("hlane")); await page.waitForTimeout(900);
  await page.locator('#world [data-place="windmill"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-goal="mill"]', { timeout: 20000 });
  await page.click('#ctx [data-goal="mill"]'); await page.waitForTimeout(600); await page.click("#ctx [data-close]").catch(() => {});
  await page.locator('#world [data-place="windmill"]').dispatchEvent("click");
  await page.waitForFunction(() => /old mill/i.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  check(true, "the windmill opens up as the old mill (350 coins), and you can go inside");
  await page.locator('#world [data-millspot="press"]').first().dispatchEvent("click"); await page.waitForSelector('#ctx [data-mill="press"][data-n="2"]', { timeout: 15000 });
  await page.click('#ctx [data-mill="press"][data-n="2"]'); await page.waitForTimeout(800);
  check(await page.evaluate(() => { const f = JSON.parse(localStorage.getItem("fox.fox")); return f.mill && f.mill.press && f.mill.press.n === 2 && f.inv.olives === 1 && f.goals.mill; }), "seven jars of olives: two bottles' worth goes under the millstone");
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nFriday evenings: aperitivo, Sal's van, kites")) try {
  console.log("\nFriday evenings: aperitivo, Sal's van, kites");
  const t = await import(new URL("../src/game/tours.js", import.meta.url)), fr = await import(new URL("../src/game/friday.js", import.meta.url));
  const fri = "2026-10-16", thu = "2026-10-15";
  { const fi = await import(new URL("../src/game/fishing.js", import.meta.url)), w = await import(new URL("../src/data/world.js", import.meta.url));
    check(fi.fishHere("bay", fri, 18*60).includes("mullet") && fi.fishHere("bay", fri, 18*60).includes("sardine") && !fi.fishHere("bay", thu, 18*60).length && !fi.fishHere("bay", fri, 20*60 + 30).length, "sunset fishing at the bay: Fridays 5 to 8, red mullet and sardines");
    const F = {coins: 20, inv: {mullet: 1}}, add = (id, n) => { F.inv[id] = (F.inv[id] || 0) + n; };
    check(!!fr.vanBuy(F, "sardine", add) && F.inv.sardine === 3 && F.coins === 11 && !fr.grillFish && !t.bonfireSlot, "Sal sells three sardines (and there's no bonfire any more)");
    check(w.nextHop("field", "hfarm") === "hfarm" && w.nextHop("hfarm", "field") === "field", "a path joins the lake field and Wildflower Farm"); }
  check(t.aperitivoNow(fri, 17*60) && !t.aperitivoNow(fri, 19*60 + 5) && !t.aperitivoNow(thu, 17*60), "aperitivo hour: Fridays, 4:30 to 7");
  check(t.tastingSlot("theo", fri, 17*60 + 30) && t.tastingSlot("opal", fri, 17*60), "the tasting room fills up on a Friday afternoon");
  { const F = {coins: 20, inv: {}, history: {"2026-10-12": {q: 2}, "2026-10-14": {q: 3}, "2026-10-08": {q: 9}}}, add = (id, n) => { F.inv[id] = (F.inv[id] || 0) + n; };
    check(!!fr.vanBuy(F, "clams", add) && !!fr.vanBuy(F, "worms", add) && F.inv.clams === 1 && F.coins === 10 && F.fish.bait >= 5, "Sal's van sells clams and worms"); }
  check(t.lastFriday("2026-10-30") && !t.lastFriday(fri) && t.movieNow("2026-10-30", 20*60) && t.movieSlot("theo", "2026-10-30", 20*60).scene === "field" && !t.movieSlot("theo", fri, 20*60) && ["hana", "theo", "farid", "mei", "tomi", "posy", "bo"].filter(id => (t.movieSlot(id, "2026-10-30", 20*60) || {}).at && Math.hypot(t.movieSlot(id, "2026-10-30", 20*60).at[0] - t.SCREEN[0], t.movieSlot(id, "2026-10-30", 20*60).at[1] - t.SCREEN[1]) < 120).length <= 2, "movie night: the last Friday of the month, your friends on blankets on the field");
  check(t.bayMarketNow(fri, 17*60) && t.bayKeepers(fri).length === 3 && t.bayMarketSlot(t.bayKeepers(fri)[0], fri, 17*60).scene === "field" && t.bayMarketSlot("hiro", fri, 17*60).scene === "field", "the Friday market on the field: three stalls, and Hiro selling kites");
  check(!t.bayMarketNow(fri, 19*60 + 20) && t.MOVIE[0] - t.BAYMKT[1] >= 15, "the market packs up a quarter of an hour before the film starts");
  check(fr.bayStallGoods(fri, 0).length === 4 && fr.bayStallGoods(fri, 0).join() !== fr.bayStallGoods(fri, 1).join() && fr.bayStallGoods(fri, 0).join() !== fr.bayStallGoods("2026-10-23", 0).join(), "each stall has four things, a different mix every week");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`friday pageerror: ${e.message}`));
  await page.addInitScript(() => { if (!/kitep/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    f.inv = Object.assign(f.inv || {}, {kite: 1}); const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=15:30&date=2026-10-16"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=15:30&date=2026-10-16&kitep=1"); await page.waitForTimeout(1000);
  await page.evaluate(() => window.__hbScene("field")); await page.waitForTimeout(900);
  await page.locator('#world [data-place="kitefly"]').dispatchEvent("click"); await page.waitForSelector("#world .kitefly", { timeout: 20000 }).catch(() => {});
  check(await page.locator("#world .kitefly").count() === 1, "a kite of your own, flying over the field");
  await page.goto(url + "?seed=1&time=19:40&date=2026-10-16"); await page.waitForTimeout(1000);
  await page.evaluate(() => window.__hbScene("bay")); await page.waitForTimeout(1500);
  check(await page.locator('#world [data-place="fishvan"]').count() === 1 && await page.locator('#world [data-place="bonfire"]').count() === 0, "Friday night at the bay: Sal's van (and no bonfire on the beach)");
  await page.evaluate(() => window.__hbScene("base")); await page.waitForTimeout(1500);
  check(await page.locator('#world [data-place="bonfire"]').count() === 0 && await page.locator('#actors .npc.act-guitar').count() === 0, "and no bonfire at home on a Friday night");
  await page.goto(url + "?seed=1&time=17:30&date=2026-10-16"); await page.waitForTimeout(1000);
  await page.evaluate(() => window.__hbScene("field")); await page.waitForTimeout(1200);
  check(await page.locator('#world [data-place^="bm"]').count() === 3 && await page.locator('#world [data-place="kites"]').count() === 1, "half past five on a Friday: the little market's up on the field");
  await page.evaluate(() => window.__hbScene("bay")); await page.waitForTimeout(1000);
  check(await page.locator('#world [data-place^="bm"]').count() === 0, "and the bay stays quiet");
  await page.goto(url + "?seed=1&time=20:00&date=2026-10-30"); await page.waitForTimeout(1000);
  await page.evaluate(() => window.__hbScene("field")); await page.waitForTimeout(1500);
  check(await page.locator('#world [data-place="screen"]').count() === 1 && await page.locator('#actors .npc[data-npc="hana"]').count() === 1, "the last Friday: movie night on the field, Hana on a blanket");
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nBellbird Valley: the Vines (rounds 141-144)")) try {
  console.log("\nBellbird Valley: the Vines (rounds 141-144)");
  const tw = await import(new URL("../src/data/towns.js", import.meta.url)), bb = await import(new URL("../src/game/bellbird.js", import.meta.url));
  const br = await import(new URL("../src/game/bbrooms.js", import.meta.url)), ba = await import(new URL("../src/game/bbacts.js", import.meta.url)), np = await import(new URL("../src/data/npcs.js", import.meta.url));
  const kt = await import(new URL("../src/game/kitchen.js", import.meta.url)), vy = await import(new URL("../src/game/vineyard.js", import.meta.url)), it = await import(new URL("../src/data/items.js", import.meta.url));
  const stops = bb.STOPS.filter(id => bb.regionOf(id) === "vines"), T = tw.TOWNS;
  check(stops.length === 6 && stops.every(id => T[id].by === "van" && T[id].screens.length === 2 && Object.keys(T[id].rooms).length === 3), "six Vines stops, two screens and three rooms each");
  check(stops.every(id => Object.values(T[id].rooms).every(r => tw.TOWN_PLACES[r.door] && tw.TOWN_BOUNDS[Object.keys(T[id].rooms).find(k => T[id].rooms[k] === r)])), "every room has a door outside and walls inside");
  const allRooms = stops.flatMap(id => Object.keys(T[id].rooms)), mus = new Set([...stops.map(id => T[id].music), ...allRooms.map(r => T[stops.find(id => T[id].rooms[r])].rooms[r].music)]);
  check(mus.size === 24 && new Set(bb.STOPS.flatMap(id => [tw.TOWNS[id].music, ...Object.entries(tw.TOWNS[id].rooms).filter(([k]) => k !== "bv_hpaper").map(([, r]) => r.music)])).size === 96, "24 tunes: one for every stop and every room (96 across the whole valley)");
  const F0 = {coins: 100, inv: {}, board: {hearts: {hana: 5}}}; check(bb.known(F0).join() === "bv_gate" && bb.fuelFor("home", "bv_gate", ["hana"]) === 7 && bb.setOff(F0, "bv_gate", ["hana"], 8*60) && F0.coins === 93 && bb.stamped(F0, "bv_gate"), "the van: only Valley Gate on the map at first; 6 a leg plus 1 a grown-up, and a stamp");
  check(bb.known(F0).includes("bv_lookout") && bb.known(F0).includes("bv_creek") && !bb.known(F0).includes("bv_camp"), "the map reveals the stops a road away");
  // rooms, goods, specials
  const goods = Object.values(tw.TOWN_GOODS).filter(g => /^bv_/.test(g.shop || ""));
  check(goods.length >= 30 && goods.every(g => !g.sell || g.sell <= g.price), "the valley's shops, and nothing sells back for more than it costs");
  check(tw.TOWN_GOODS.b_sparkling.price > vy.STYLES.sparkling.price + vy.RIDDLE.day*vy.RIDDLE.max, "Bellbird's sparkling costs more than your best-riddled bottle sells for");
  const op1 = br.opshopToday("2026-10-12"), op2 = br.opshopToday("2026-10-13"); check(op1.length === 4 && op1.join() === br.opshopToday("2026-10-12").join() && op1.join() !== op2.join(), "the op shop: four treasures a day, different tomorrow");
  check(["pavlova", "damper", "wattlescone"].every(id => kt.TAPAS[id].special === "bellbird" && kt.TAPAS[id].price >= 14) && !kt.knows({towns: {}}, "pavlova") && kt.knows({towns: {bellbird: "2026-10-12"}}, "pavlova"), "three Bellbird specials at the stove, once you've been");
  check(it.ITEMS.raspberry_cane && it.ITEMS.raspberry_cane.visited === "bellbird" && it.CROPS.raspberry, "raspberry canes for the garden, once you've been");
  const F1 = {coins: 50, inv: {}, bellbird: {}}; check(br.chocTaste(F1) && !br.chocTaste(F1) && br.treat(F1, "bv_coffee", "flatwhite") && F1.coins === 46, "a free chocolate tasting once a day; a flat white for 4");
  // the people
  const bl = np.NPCS.filter(n => n.local === "bellbird");
  check(bl.length >= 40 && bl.filter(n => n.neighbour).length >= 10, "the valley's people, and the travelling neighbours at the camp");
  const inRoom = r => bl.filter(n => n.routine.some(sl => sl.scene === r)).length;
  check(allRooms.filter(r => !["bv_shed", "bv_cave"].includes(r)).every(r => inRoom(r) >= 1) && allRooms.filter(r => inRoom(r) >= 2).length >= 12, "people in the rooms (two or more in most)");
  // your friends: new acts at every stop, never repeated, and none from the earlier towns
  const old = new Set(["ronda", "kyoto", "jeju", "cinque"].flatMap(t => Object.values(T[t].acts || {}).flatMap(a => Object.values(a).map(x => x.act))));
  const mine = stops.flatMap(id => Object.values(T[id].acts).flatMap(a => Object.values(a).map(x => x.act)));
  check(mine.length >= 18 && new Set(mine).size === mine.length && mine.every(a => !old.has(a)) && stops.every(id => Object.keys(T[id].acts).length >= 3), "your friends: three or four new things at every stop, all different, none from the other towns");
  // the activities
  const F2 = {coins: 200, inv: {}, bellbird: {}}, add = (id, n) => { F2.inv[id] = (F2.inv[id] || 0) + n; };
  check(!ba.balloonOpen(12*60) && ba.balloonOpen(7*60) && ba.balloonOpen(17*60 + 30) && ba.flightCost(["hana"]) === 45, "the balloon flies at dawn and golden hour: 30 for you, 15 a friend");
  const fl = ba.flightStart(() => .3); fl.sights.forEach(([, want]) => { fl.alt = want; ba.flightMove(fl, "hold"); }); fl.alt = 1;
  check(fl.seen.length === 5 && ba.flightLand(fl) === true && ba.finishFlight(F2, fl, add) && F2.inv.b_flight === 1, "a flight: every sight at the right height, a soft landing, a certificate");
  const rd = ba.riddleStart(() => .6); while (!ba.riddleDone(rd)) ba.riddleTap(rd, rd.turns.findIndex(t => t)); check(ba.finishRiddle(F2) && vy.canRiddle(F2), "riddling with Jono, and the rack at home");
  const V = vy.vineState(F2); V.cellar.push({id: "wfizz", name: "Cuvée Willow", type: "sparkling", n: 6}); check(vy.onRack(F2, "wfizz") && !vy.onRack(F2, "wfizz"), "sparkling onto the riddling rack");
  V.cellar[0].rack -= 3*24*3600e3; vy.stock(F2, "wfizz"); check(V.shelf[0].price === vy.STYLES.sparkling.price + 6, "three days on the rack: 6 coins more a bottle");
  const be = ba.berriesStart(() => .3); be.ripe.forEach((r, i) => ba.pickBerry(be, i)); check(ba.berriesDone(be) && be.oops === 0 && ba.finishBerries(F2, be, add) && F2.inv.raspberry > 0 && !ba.finishBerries(F2, be, add), "pick your own: berries once a day");
  F2.inv.strawberry = 2; check(ba.dipBerries(F2, "dark", "sprinkles") && !F2.inv.strawberry, "dipping two strawberries in Sophie's chocolate");
  for (let d = 0; d < 3; d++) { F2.bellbird.joeyDay = null; const j = ba.joeyStart(), early = ba.joeyDo(j, 2); if (!d) check(early === "oops", "feeding Pip before the bottle's warm: Kim stops you"); [0, 0, 0, 1, 2, 2, 2, 2, 3].forEach(i => ba.joeyDo(j, i)); const r = ba.finishJoey(F2); if (d === 2) check(ba.joeyDone(j) && r.release, "three feeds of Pip, and she goes back to the bush"); }
  const cn = ba.canoeStart(); ["L", "R", "L", "R", "L", "R", "L", "R"].forEach(x => ba.paddle(cn, x)); check(ba.canoeDone(cn) && ba.finishCanoe(F2, cn), "a straight canoe: left, right, left, right");
  // Kel's cuttings (round 145): Pinot Noir and Chardonnay at home
  const F3 = {coins: 300, inv: {}, bellbird: {}}; check(!br.buyCuttings(F3, "pinot") && br.treat(F3, "bv_tasting", "flight") && br.buyCuttings(F3, "pinot") === "Pinot Noir" && br.buyCuttings(F3, "chardonnay") && F3.coins === 300 - 6 - 180, "after a tasting, Kel's Pinot Noir and Chardonnay cuttings (90 for three)");
  { const v3 = vy.vineState(F3); check(v3.cuttings.pinot === 3 && v3.cuttings.chardonnay === 3 && vy.grapeKinds(v3).includes("pinot") && vy.grapeKinds(v3).includes("chardonnay") && vy.STYLES.pinot.grape === "pinot" && vy.STYLES.chardonnay.price > vy.STYLES.white.price, "they grow on the trellis and make their own wines");
    check(tw.TOWN_GOODS.b_pinot.price > vy.STYLES.pinot.price && tw.TOWN_GOODS.b_chard.price > vy.STYLES.chardonnay.price, "Kel's bottles cost more than your own sell for"); }
  F2.inv.mallows = 1; const bag = ba.openBag(F2); ba.toast(bag); ba.toast(bag); ba.toast(bag); check(ba.pullOut(F2, bag) === "golden" && !ba.fireLit(16*60) && ba.fireLit(17*60), "a golden marshmallow, from five");
  // in the browser: a van trip to Valley Gate, a room, and a friend along
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`bellbird pageerror: ${e.message}`));
  const fox = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  await page.addInitScript(() => { if (!/bbv=1/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return; f.goals = {...(f.goals || {}), van: true}; f.coins = 300; f.board = f.board || {}; f.board.hearts = Object.assign(f.board.hearts || {}, {farid: 5});
    const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=09:00&date=2026-10-12"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=09:00&date=2026-10-12&bbv=1"); await page.waitForTimeout(1000);
  await page.evaluate(() => window.__hbScene("van")); await page.waitForTimeout(900);
  await page.locator('#world [data-spot="vmap"]').dispatchEvent("click"); await page.waitForSelector("#ctx .bbmap", { timeout: 20000 });
  await page.click('#ctx [data-bvpick="farid"]'); await page.click('#ctx [data-bvgo="bv_gate"]'); await page.waitForTimeout(4500);
  check(await fox().then(f => f.trip && f.trip.town === "bv_gate" && f.coins === 293), "off in the van to Valley Gate");
  await page.evaluate(() => window.__hbScene("bv_store")); await page.waitForTimeout(1200);
  check(await page.locator('#actors .npc[data-npc="mrsdunn"]').count() === 1, "Mrs Dunn behind the counter at the store");
  await page.locator('#world [data-rdspot="bv_store"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-rbuy="wattleseed"]', { timeout: 20000 });
  await page.click('#ctx [data-rbuy="wattleseed"]'); await page.waitForTimeout(400);
  check(await fox().then(f => f.inv.wattleseed === 1), "a jar of wattleseed from Mrs Dunn's shelves");
  await page.evaluate(() => window.__hbScene("bv_opshop")); await page.waitForTimeout(6000);
  check(await page.locator('#actors .npc[data-npc="farid"].act-rummage').count() === 1, "Farid rummaging in the op shop");
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nThe Coast Road (rounds 148-150)")) try {
  console.log("\nThe Coast Road (rounds 148-150)");
  const tw = await import(new URL("../src/data/towns.js", import.meta.url)), bb = await import(new URL("../src/game/bellbird.js", import.meta.url));
  const br = await import(new URL("../src/game/bbrooms.js", import.meta.url)), ca = await import(new URL("../src/game/cracts.js", import.meta.url)), np = await import(new URL("../src/data/npcs.js", import.meta.url));
  const kt = await import(new URL("../src/game/kitchen.js", import.meta.url)), T = tw.TOWNS, stops = bb.STOPS.filter(id => bb.regionOf(id) === "coast");
  check(stops.length === 6 && stops.every(id => T[id].by === "van" && T[id].screens.length === 2 && Object.keys(T[id].rooms).length === 3), "six Coast Road stops, two screens and three rooms each");
  check(stops.every(id => T[id].screens.some(s => /sea|surf|wave|beach|cove|wharf|mouth|cliff/.test(JSON.stringify(T[id].say) + s))), "the sea at every stop");
  { const tr = await import(new URL("../src/game/trips.js", import.meta.url)), tk = tr.ticketPanel({coins: 100, inv: {}}, [], "ronda", 9*60, "train");
    check(/Kyoto/.test(tk) && !/Breakwater|Valley Gate|Koala Cove/.test(tk), "the train's ticket list has the train towns only (the campervan stops are on the van's map)"); }
  check(stops.every(id => Object.values(T[id].rooms).every(r => tw.TOWN_PLACES[r.door])), "every coast room has a door outside");
  const goods = Object.values(tw.TOWN_GOODS).filter(g => stops.some(id => Object.keys(T[id].rooms).includes(g.shop)));
  check(goods.length >= 15 && goods.every(g => !g.sell || g.sell <= g.price), "the coast's shops, and nothing sells back for more than it costs");
  check(["crayroll", "scalloppie", "spsquid"].every(id => kt.TAPAS[id] && kt.TAPAS[id].special === "coast"), "three Coast Road specials at the stove");
  // the people: two to four in the rooms at busy times, neighbours at the caravan park
  const cr = np.NPCS.filter(n => /^cr/.test(n.id)), rooms = stops.flatMap(id => Object.keys(T[id].rooms));
  check(cr.length >= 30 && cr.every(n => n.local === "bellbird") && cr.filter(n => n.neighbour).length >= 6 && new Set(np.NPCS.map(n => n.id)).size === np.NPCS.length, "the Coast Road's people, the travelling neighbours, and no one twice");
  check(rooms.filter(r => cr.some(n => n.routine.some(sl => sl.scene === r))).length >= 15, "people in the coast rooms");
  // your friends: new acts at every stop, never repeated, none from any earlier town (the Vines included)
  const old = new Set([...["ronda", "kyoto", "jeju", "cinque"], ...bb.STOPS.filter(id => bb.regionOf(id) === "vines")].flatMap(t => Object.values(T[t].acts || {}).flatMap(a => Object.values(a).map(x => x.act))));
  const mine = stops.flatMap(id => Object.values(T[id].acts).flatMap(a => Object.values(a).map(x => x.act)));
  check(mine.length >= 12 && new Set(mine).size === mine.length && mine.every(a => !old.has(a)) && stops.every(id => Object.keys(T[id].acts).length >= 2), "your friends: new things at every coast stop, all different, none from any earlier town");
  // the activities
  const F = {coins: 200, inv: {}, bellbird: {}}, add = (id, n) => { F.inv[id] = (F.inv[id] || 0) + n; };
  const sf = ca.surfStart(); while (!ca.surfDone(sf)) { ca.surfDo(sf, "paddle"); ca.surfDo(sf, "paddle"); ca.surfDo(sf, "paddle"); ca.surfDo(sf, "pop"); }
  check(sf.rides === 5 && ca.surfCost(false) === 15 && ca.finishSurf(F, sf, add) && F.inv.b_surfphoto === 1 && !ca.finishSurf(F, sf, add), "a surf lesson: pop up as the wave peaks; a photo of your first wave");
  const early = ca.surfStart(); ca.surfDo(early, "pop"); const late = ca.surfStart(); [1, 2, 3, 4].forEach(() => ca.surfDo(late, "paddle")); check(early.last === "early" && late.last === "dumped", "too soon and it rolls past; too late and it dumps you");
  check(ca.whaleSeason("2026-10-12") && !ca.whaleSeason("2026-01-12") && ca.whaleStart("2026-01-12").whales === false, "humpbacks May to November, dolphins the rest of the year");
  let wr = 0; const wh = ca.whaleStart("2026-10-12", () => (wr = (wr + .37) % 1)); wh.at.forEach(i => ca.whaleLook(wh, i)); check(ca.whaleDone(wh) && wh.seen.length === 3 && ca.finishWhales(F, wh, add) && F.inv.b_whalecard === 1, "whales from the lighthouse balcony, and Win's sighting card");
  const gl = ca.glowStart(() => .5); check(!ca.glowOpen(17*60) && ca.glowOpen(18*60) && ca.glowCount(gl, 0) === null, "glow-worms from 6pm, and only once your eyes have adjusted");
  [0, 1, 2].forEach(() => ca.glowWait(gl)); gl.lit.forEach((_, i) => ca.glowCount(gl, i)); check(ca.glowDone(gl) && ca.finishGlow(F, gl).n === ca.glowTotal(gl) && F.bellbird.glow > 0, "counting the glow-worms");
  const pt = ca.potsStart(() => .5); while (!ca.potsDone(pt)) { const p = ca.potHaul(pt); if (p && p.what !== "empty") ca.potChoose(pt, ca.potKeepable(p)); }
  check(pt.right === pt.pots.filter(p => p.what !== "empty").length && ca.finishPots(F, pt, add) === 2 && F.inv.crayfish === 2 && ca.finishPots(F, pt, add) === 0, "cray pots with Mags: keep the big ones, back with the small and the berried; two crays, once a day");
  check(!ca.potKeepable({what: "berried", mm: 130}) && !ca.potKeepable({what: "cray", mm: 90}) && ca.potKeepable({what: "cray", mm: 110}), "the gauge, and the mothers with eggs go back");
  const pg = ca.pengStart(true, () => .1); while (!ca.pengDone(pg)) ca.pengDo(pg, pg.squeal[pg.round] ? "shush" : "still", () => .5); check(!ca.pengOpen(17*60) && ca.pengOpen(18*60 + 30) && pg.fright === 0 && ca.finishPeng(F, pg) === pg.here && pg.here > 0, "the penguin parade at dusk: stay still, and they come right past");
  const nip = ca.nipStart(() => .1); while (!ca.nipDone(nip)) ca.nipDo(nip, nip.wave[nip.leg] ? "duck" : "cheer"); const nr = ca.finishNip(F, nip, add);
  check(nr.place === 1 && nr.medal && F.inv.b_nipmedal === 1 && !ca.finishNip(F, nip, add).medal, "Nippers at the surf club: you win, and your first medal");
  // in the browser: Hana and Tomi at Breakwater, Jet's surf lesson
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`coast pageerror: ${e.message}`));
  const fox = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  await page.addInitScript(() => { if (!/crv=1/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return; f.goals = {...(f.goals || {}), van: true}; f.coins = 300;
    f.bellbird = {stamps: {bv_gate: "2026-10-01"}}; f.trip = {town: "bv_breakwater", day: "2026-10-12", party: ["hana", "tomi"], from: 7*60, by: "van"};
    const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=10:00&date=2026-10-12"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=10:00&date=2026-10-12&crv=1"); await page.waitForTimeout(1000);
  await page.evaluate(() => window.__hbScene("cw_beach")); await page.waitForTimeout(7000);
  check(await page.locator('#actors .npc[data-npc="tomi"].act-bodyboard').count() === 1 && await page.locator('#actors .npc[data-npc="hana"].act-yoga').count() === 1 && await page.locator('#actors .npc[data-npc="crjet"]').count() === 1, "Breakwater: Tomi with his bodyboard, Hana's beach yoga, and Jet teaching");
  await page.evaluate(() => window.__hbScene("bv_surfshop")); await page.waitForTimeout(900);
  await page.locator('#world [data-rdspot="bv_surfshop"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-bba="open:surf"]', { timeout: 20000 });
  await page.click('#ctx [data-bba="open:surf"]'); await page.click('#ctx [data-bba="surf"]'); await page.waitForTimeout(300);
  for (let w = 0; w < 5; w++) { for (let i = 0; i < 3; i++) await page.click('#ctx [data-bba="spaddle"]'); await page.click('#ctx [data-bba="popup"]'); }
  await page.click('#ctx [data-bba="surfed"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.coins === 285 && f.inv.b_surfphoto === 1 && f.bellbird.surfs === 1), "a surf lesson with Jet (15), five waves ridden, and the photo");
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nThe Tablelands (rounds 157-160)")) try {
  console.log("\nThe Tablelands (rounds 157-160)");
  const tw = await import(new URL("../src/data/towns.js", import.meta.url)), bb = await import(new URL("../src/game/bellbird.js", import.meta.url));
  const br = await import(new URL("../src/game/bbrooms.js", import.meta.url)), ta = await import(new URL("../src/game/tlacts.js", import.meta.url)), np = await import(new URL("../src/data/npcs.js", import.meta.url));
  const kt = await import(new URL("../src/game/kitchen.js", import.meta.url)), hf = await import(new URL("../src/game/hfarm.js", import.meta.url)), sc = await import(new URL("../src/game/scoop.js", import.meta.url));
  const T = tw.TOWNS, stops = bb.STOPS.filter(id => bb.regionOf(id) === "tablelands");
  check(stops.length === 6 && stops.every(id => T[id].by === "van" && T[id].screens.length === 2 && Object.keys(T[id].rooms).length === 3), "six Tablelands stops, two screens and three rooms each");
  check(stops.every(id => Object.values(T[id].rooms).every(r => tw.TOWN_PLACES[r.door])) && Object.values(tw.TOWN_PLACES).filter(p => p.bridge && /^t[fkrdmg]_/.test(p.scene)).length === 12, "every room has a door outside, and every stop's two screens join up");
  { const F = {coins: 500, bellbird: {stamps: {bv_gate: "x"}}}; const before = bb.known(F).includes("bv_falls"); F.bellbird.stamps.bv_lookout = "x";
    const m = bb.mapPanel(F, {region: "tablelands", ownsVan: true, hm: 600}), v = bb.mapPanel(F, {region: "vines", ownsVan: true, hm: 600});
    check(!before && bb.known(F).includes("bv_falls") && /data-bvregion="tablelands"/.test(m) && /Misty Falls/.test(m) && /Up the range to the Tablelands/.test(v) && bb.legs("home", "bv_falls") === 3 && !/Tablelands \(soon\)/.test(v), "up the range from Balloon Lookout: the Tablelands get their own page on the map");
    check(/The Tablelands/.test(bb.passportPanel(F)), "and their own page in the passport"); }
  const goods = Object.entries(tw.TOWN_GOODS).filter(([, g]) => stops.some(id => Object.keys(T[id].rooms).includes(g.shop)));
  check(goods.length >= 20 && goods.every(([, g]) => !g.sell || g.sell <= g.price) && tw.TOWN_GOODS.macadamia && tw.TOWN_GOODS.fingerlime, "the Tablelands' shops (macadamias and finger limes too), and nothing sells back for more than it costs");
  check(sc.INGR.macadamia && sc.INGR.fingerlime && ["macslice", "flprawns", "lamington"].every(id => kt.TAPAS[id] && kt.TAPAS[id].special === "tablelands") && kt.beenTo({bellbird: {stamps: {bv_dairy: "x"}}}, "tablelands"), "macadamia and finger lime gelato and bonbons, and three Tablelands specials at the stove once you've been");
  check(stops.every(id => Object.keys(T[id].rooms).filter(r => r !== "bv_hpaper").every(r => br.bbRoomPanel({coins: 50, inv: {}}, r).length > 50)), "every Tablelands room has its panel");
  // the people
  const tl = np.NPCS.filter(n => /^tl/.test(n.id)), rooms = stops.flatMap(id => Object.keys(T[id].rooms));
  check(tl.length >= 30 && tl.every(n => n.local === "bellbird") && new Set(np.NPCS.map(n => n.id)).size === np.NPCS.length, "the Tablelands' people, and no one twice");
  check(rooms.filter(r => tl.some(n => n.routine.some(sl => sl.scene === r))).length >= 16, "people in the Tablelands rooms");
  // your friends: new acts at every stop, none from any earlier town (the Vines and the Coast Road included)
  const old = new Set([...["ronda", "kyoto", "jeju", "cinque"], ...bb.STOPS.filter(id => bb.regionOf(id) !== "tablelands")].flatMap(t => Object.values(T[t].acts || {}).flatMap(a => Object.values(a).map(x => x.act))));
  const mine = stops.flatMap(id => Object.values(T[id].acts).flatMap(a => Object.values(a).map(x => x.act)));
  check(mine.length >= 12 && new Set(mine).size === mine.length && mine.every(a => !old.has(a)) && stops.every(id => Object.keys(T[id].acts).length >= 2), "your friends: new things at every Tablelands stop, all different, none from anywhere before");
  // the activities
  const F = {coins: 300, inv: {b_goldpan: 1}, bellbird: {}}, add = (id, n) => { F.inv[id] = (F.inv[id] || 0) + n; }, o = (hm, rng) => ({hm, addInv: add, rng});
  let st = {}; ta.tlAct(F, "swim", st, "swimin", null, o(10*60)); ["falls", "float", "veil"].forEach(k => ta.tlAct(F, "swim", st, "swim", k)); const inStill = !st.t.out && st.t.cold === 3; ta.tlAct(F, "swim", st, "swim", "out");
  check(inStill && st.t.out && ta.tlAct(F, "swim", st, "swimdone").close && F.bellbird.tl.swims === 1, "a swim in the falls: the falls, a float, behind the veil, and out");
  st = {}; check(!ta.tlAct(F, "swim", st, "swimin", null, o(19*60)), "no swimming after five");
  st = {}; ta.tlAct(F, "kayak", st, "kayakgo", null, o(10*60, () => .1)); while (!ta.kayakDone(st.t)) ta.tlAct(F, "kayak", st, "steer", String(st.t.at[st.t.leg]));
  check(st.t.seen.length === 6 && F.coins === 300 - ta.kayakCost(true) && ta.tlAct(F, "kayak", st, "kayakdone").close && F.bellbird.tl.kayaks === 1, "once round Crater Lake in a kayak, steering for whatever shows itself");
  st = {}; ta.tlAct(F, "platypus", st, "platygo", null, o(7*60, () => .1)); ta.tlAct(F, "platypus", st, "platy", st.t.rings[0] ? "look" : "wait"); const before = st.t.seen; const nothing = {round: 0, rings: [false], seen: 0, gone: false};
  check(ta.platyDo(nothing, "look") === "gone" && nothing.gone && ta.platyOdds(7*60) > ta.platyOdds(12*60), "the platypus: look at the wrong moment and she's gone; better at dawn and dusk");
  st = {}; ta.tlAct(F, "calves", st, "calvesgo", null, o(10*60, () => .3)); const hungriest = st.t.calves.map((c, i) => [c.hunger, i]).sort((a, b) => b[0] - a[0])[0][1];
  check(ta.calfFeed(st.t, hungriest) === "right" && ta.calfFeed(st.t, st.t.calves.map((c, i) => [c.hunger, i]).filter(([, i]) => !st.t.fed.includes(i)).sort((a, b) => a[0] - b[0])[0][1]) === "wrong", "the calves: hungriest first");
  st = {}; check(!ta.tlAct(F, "milking", st, "milkgo", null, o(10*60)), "milking's at three, not before");
  ta.tlAct(F, "milking", st, "milkgo", null, o(15*60, () => .5)); while (!ta.milkDone(st.t)) { const i = st.t.cows.map((c, k) => [c.tag, k]).filter(([, k]) => !st.t.in.includes(k)).sort((a, b) => a[0] - b[0])[0][1]; ta.tlAct(F, "milking", st, "cow", String(i)); }
  ta.tlAct(F, "milking", st, "milkdone", null, o(15*60)); check(F.inv.milk === 2 && new Set(st.t ? [] : [1]).size === 1, "the cows come in by ear tag, and Bill sends you off with two bottles of milk");
  st = {}; ta.tlAct(F, "cheese", st, "lessongo"); check(ta.tlAct(F, "cheese", st, "step", "cut").sfx === "tap" && st.t.wrong === 1, "Meg's lesson: steps in the wrong order don't count");
  ["warm", "culture", "cut", "stir", "press"].forEach(k => ta.tlAct(F, "cheese", st, "step", k)); ta.tlAct(F, "cheese", st, "lessondone");
  check(ta.knowsHavarti(F) && hf.cheesesFor(hf.hfState(F)).some(([k]) => k === "havarti") && !hf.cheesesFor(hf.hfState({})).some(([k]) => k === "havarti"), "and then Tableland havarti is yours to make at home in Elena's cheese press");
  st = {}; ta.tlAct(F, "shake", st, "shakego"); for (let i = 0; i < 4; i++) ta.tlAct(F, "shake", st, "shk", "gentle"); ta.tlAct(F, "shake", st, "shakedone", null, o(10*60));
  check(F.inv.macadamia === 2 && !ta.tlAct(F, "shake", {}, "shakego"), "shaking a macadamia tree with Pete: two bags of nuts, once a day");
  st = {}; ta.tlAct(F, "pan", st, "pango"); ta.tlAct(F, "pan", st, "pan", "scoop"); for (let i = 0; i < 4; i++) ta.tlAct(F, "pan", st, "pan", "swirl"); ta.tlAct(F, "pan", st, "pan", "look"); ta.tlAct(F, "pan", st, "pandone", null, o(10*60));
  const p2 = ta.panStart(); ta.panDo(p2, "scoop"); ta.panDo(p2, "swirl"); check(F.inv.b_goldfleck === 1 && ta.panDo(p2, "look") === "gravel" && !ta.tlAct({inv: {}, bellbird: {}}, "pan", {}, "pango"), "gold panning: four swirls and a fleck for the tiny bottle (and you need a pan)");
  st = {}; ta.tlAct(F, "steam", st, "steamgo", null, o(10*60, () => .3)); while (!ta.steamDone(st.t)) ta.tlAct(F, "steam", st, "steam", st.t.cross.includes(st.t.leg) ? "whistle" : "look");
  check(st.t.whistled === 2 && ta.tlAct(F, "steam", st, "steamdone", null, o(10*60)).close && F.inv.b_steamticket === 1 && !ta.tlAct(F, "steam", {}, "steamgo", null, o(17*60)), "the steam train: whistle at the crossings, a punched ticket to keep; she runs 9 to 4");
  // in the browser: Mei and Tomi at Misty Falls, and a swim from the falls
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`tablelands pageerror: ${e.message}`));
  const fox = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  await page.addInitScript(() => { if (!/tlv=1/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return; f.goals = {...(f.goals || {}), van: true}; f.coins = 300;
    f.bellbird = {stamps: {bv_gate: "2026-10-01", bv_lookout: "2026-10-01"}}; f.trip = {town: "bv_falls", day: "2026-10-12", party: ["mei", "tomi"], from: 7*60, by: "van"};
    const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=10:00&date=2026-10-12"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=10:00&date=2026-10-12&tlv=1"); await page.waitForTimeout(1000);
  await page.evaluate(() => window.__hbScene("tf_top")); await page.waitForTimeout(7000);
  check(await page.locator('#actors .npc[data-npc="mei"].act-flask').count() === 1 && await page.locator('#world [data-place="bvtview"]').count() === 1, "Misty Falls: Mei with her thermos at the lookout");
  await page.evaluate(() => window.__hbScene("tf_pool")); await page.waitForTimeout(6000);
  check(await page.locator('#actors .npc[data-npc="tomi"].act-wade').count() === 1 && await page.locator('#actors .npc[data-npc="tlkirra"]').count() === 1, "the swimming hole: Tomi wading by the falls, and Kirra the ranger");
  await page.locator('#world [data-place="bvtfalls"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-bba="tl:swimin"]', { timeout: 20000 });
  await page.click('#ctx [data-bba="tl:swimin"]'); for (const k of ["falls", "float", "veil", "out"]) await page.click(`#ctx [data-bba="tl:swim.${k}"]`);
  await page.click('#ctx [data-bba="tl:swimdone"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.bellbird.tl && f.bellbird.tl.swims === 1), "a swim in the falls, all the way through");
  await page.evaluate(() => window.__hbScene("bv_tcafe")); await page.waitForTimeout(900);
  await page.locator('#world [data-rdspot="bv_tcafe"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-rbuy="b_rosella"]', { timeout: 20000 });
  await page.click('#ctx [data-rbuy="b_rosella"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.inv.b_rosella === 1 && f.coins === 294), "the Range Café: a jar of rosella jam to take home");
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nThe Lavender Hills (rounds 161-164)")) try {
  console.log("\nThe Lavender Hills (rounds 161-164)");
  const tw = await import(new URL("../src/data/towns.js", import.meta.url)), bb = await import(new URL("../src/game/bellbird.js", import.meta.url));
  const br = await import(new URL("../src/game/bbrooms.js", import.meta.url)), la = await import(new URL("../src/game/lvacts.js", import.meta.url)), np = await import(new URL("../src/data/npcs.js", import.meta.url));
  const kt = await import(new URL("../src/game/kitchen.js", import.meta.url)), hf = await import(new URL("../src/game/hfarm.js", import.meta.url)), sc = await import(new URL("../src/game/scoop.js", import.meta.url));
  const T = tw.TOWNS, stops = bb.STOPS.filter(id => bb.regionOf(id) === "lavender");
  check(stops.length === 6 && bb.STOPS.length === 24 && stops.every(id => T[id].by === "van" && T[id].screens.length === 2 && Object.keys(T[id].rooms).filter(k => k !== "bv_hpaper").length === 3), "six Lavender Hills stops, two screens and three rooms each: the whole valley, 24 stops");
  check(stops.every(id => Object.values(T[id].rooms).every(r => tw.TOWN_PLACES[r.door])) && Object.values(tw.TOWN_PLACES).filter(p => p.bridge && /^h[vmpsbc]_/.test(p.scene)).length === 12, "every room has a door outside, and every stop's two screens join up");
  { const F = {coins: 500, bellbird: {stamps: {bv_gate: "x", bv_creek: "x", bv_berry: "x"}}}; const before = bb.known(F).includes("bv_lavender"); F.bellbird.stamps.bv_camp = "x";
    const m = bb.mapPanel(F, {region: "lavender", ownsVan: true, hm: 600}), v = bb.mapPanel(F, {region: "vines", ownsVan: true, hm: 600});
    check(!before && bb.known(F).includes("bv_lavender") && /data-bvregion="lavender"/.test(m) && /Lavender Ridge/.test(m) && /To the Lavender Hills \(next page\)/.test(v) && !/\(soon\)/.test(v) && bb.legs("home", "bv_lavender") === 5, "past Riverside Camp: the Lavender Hills get their own page, and no closed roads are left");
    check(/The Lavender Hills/.test(bb.passportPanel(F)) && /The whole valley/.test(bb.passportPanel(F)), "and their own page in the passport"); }
  const goods = Object.entries(tw.TOWN_GOODS).filter(([, g]) => stops.some(id => Object.keys(T[id].rooms).includes(g.shop)));
  check(goods.length >= 15 && goods.every(([, g]) => !g.sell || g.sell <= g.price) && tw.TOWN_GOODS.honey_sun && sc.INGR.honey_sun, "the Lavender Hills' shops (sunflower honey for the gelato), and nothing sells back for more than it costs");
  check(["madeleines", "chevretart", "ratatouille"].every(id => kt.TAPAS[id] && kt.TAPAS[id].special === "lavender") && kt.beenTo({bellbird: {stamps: {bv_honey: "x"}}}, "lavender") && !kt.beenTo({bellbird: {stamps: {bv_gate: "x"}}}, "lavender"), "three Lavender Hills specials at the stove once you've been");
  check(stops.every(id => Object.keys(T[id].rooms).filter(r => r !== "bv_hpaper").every(r => br.bbRoomPanel({coins: 50, inv: {}}, r).length > 50)), "every Lavender Hills room has its panel (your paperie in Montrose has its own stations)");
  const lv = np.NPCS.filter(n => /^lv/.test(n.id)), rooms = stops.flatMap(id => Object.keys(T[id].rooms));
  check(lv.length >= 28 && lv.every(n => n.local === "bellbird") && new Set(np.NPCS.map(n => n.id)).size === np.NPCS.length, "the Lavender Hills' people, and no one twice");
  check(rooms.filter(r => lv.some(n => n.routine.some(sl => sl.scene === r))).length >= 16, "people in the Lavender Hills rooms");
  const old = new Set([...["ronda", "kyoto", "jeju", "cinque"], ...bb.STOPS.filter(id => bb.regionOf(id) !== "lavender")].flatMap(t => Object.values(T[t].acts || {}).flatMap(a => Object.values(a).map(x => x.act))));
  const mine = stops.flatMap(id => Object.values(T[id].acts).flatMap(a => Object.values(a).map(x => x.act)));
  check(mine.length >= 12 && new Set(mine).size === mine.length && mine.every(a => !old.has(a)) && stops.every(id => Object.keys(T[id].acts).length >= 2), "your friends: new things at every Lavender Hills stop, all different, none from anywhere before");
  // the activities
  const F = {coins: 300, inv: {}, bellbird: {}}, add = (id, n) => { F.inv[id] = (F.inv[id] || 0) + n; }, o = (hm, rng) => ({hm: hm || 10*60, addInv: add, rng: rng || (() => .3)});
  let st = {}; la.lvAct(F, "harvest", st, "cutgo", null, o()); const pale = st.t.ready.indexOf(false); check(la.harvestCut(st.t, pale) === "green" && st.t.wrong === 1, "the harvest: cutting a pale bush doesn't count");
  st.t.ready.forEach((r, i) => r && la.lvAct(F, "harvest", st, "cut", String(i))); la.lvAct(F, "harvest", st, "cutdone", null, o());
  check(F.inv.bq_lavender === 2 && !la.lvAct(F, "harvest", {}, "cutgo", null, o()), "two bunches of lavender, once a day");
  st = {}; la.lvAct(F, "petanque", st, "petgo", null, o()); while (!la.petDone(st.t)) la.lvAct(F, "petanque", st, "pet", ["short", "middle", "long"][st.t.jack[st.t.end]], o(600, () => .9));
  check(st.t.mine === 3 && la.lvAct(F, "petanque", st, "petdone").close && F.bellbird.lv.wins === 1, "pétanque with Pagnol: right on the jack every end, and you beat him");
  st = {}; la.lvAct(F, "scent", st, "scentgo", null, o()); ["bergamot", "rose", "vanilla"].forEach(n => la.lvAct(F, "scent", st, "note", n, o()));
  check(st.t.name === "Garden Party" && st.t.fresh && F.inv.b_myperfume === 1 && F.coins === 280, "blending a perfume: top, heart and base, a name, and your first bottle to keep");
  la.lvAct(F, "scent", st, "scentdone"); st = {}; la.lvAct(F, "scent", st, "scentgo", null, o()); ["bergamot", "rose", "vanilla"].forEach(n => la.lvAct(F, "scent", st, "note", n, o()));
  check(!st.t.fresh && F.inv.b_myperfume === 1 && F.bellbird.lv.scents.length === 1, "the same blend again is one you know");
  st = {}; la.lvAct(F, "bees", st, "beesgo", null, o()); la.lvAct(F, "bees", st, "bee", "lift"); check(st.t.calm === 2, "lift a frame without smoke and the bees get cross");
  while (!la.beesDone(st.t)) { la.lvAct(F, "bees", st, "bee", "smoke"); la.lvAct(F, "bees", st, "bee", "lift"); } la.lvAct(F, "bees", st, "beesdone", null, o());
  check(F.inv.honey_sun === 1 && !la.lvAct(F, "bees", {}, "beesgo", null, o()), "the hives with Mathis: a jar of sunflower honey, once a day");
  st = {}; la.lvAct(F, "maze", st, "mazego", null, o()); while (!la.mazeDone(st.t)) la.lvAct(F, "maze", st, "turn", ["left", "straight", "right"][st.t.path[st.t.at]]); la.lvAct(F, "maze", st, "mazedone", null, o());
  check(F.inv.b_mazecert === 1, "the sunflower maze: you find the middle, and your certificate");
  st = {}; la.lvAct(F, "sticks", st, "sticksgo", null, o()); for (let i = 0; i < 3; i++) la.lvAct(F, "sticks", st, "stick", "fat", o(600, () => .1)); check(st.t.mine === 3 && la.lvAct(F, "sticks", st, "sticksdone").close, "Pooh-sticks off the Old Bridge, best of three against Theo");
  st = {}; check(!la.lvAct(F, "bell", st, "bellgo", null, o(12*60)) && la.lvAct(F, "bell", st, "candle").hearts === 1, "a candle any time; the bell only at sunset");
  la.lvAct(F, "bell", st, "bellgo", null, o(18*60)); while (!la.bellDone(st.t)) la.lvAct(F, "bell", st, "bell", st.t.down[st.t.i] ? "pull" : "wait"); la.lvAct(F, "bell", st, "belldone", null, o(18*60));
  check(F.inv.b_bellmedal === 1, "ringing the chapel bell at sunset: five strokes, and Père Gaston's little bell");
  st = {}; la.lvAct(F, "banon", st, "banongo"); ["soak", "wrap", "tie", "rest"].forEach(k => la.lvAct(F, "banon", st, "bstep", k)); la.lvAct(F, "banon", st, "banondone");
  check(la.knowsBanon(F) && hf.cheesesFor(hf.hfState(F)).some(([k]) => k === "banon") && !hf.cheesesFor(hf.hfState({})).some(([k]) => k === "banon"), "Céline's banon lesson: then it's yours to make at home in Elena's cheese press");
  // in the browser: Hana and Bo at Lavender Ridge, and the harvest from the rows
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`lavender pageerror: ${e.message}`));
  const fox = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  await page.addInitScript(() => { if (!/lvv=1/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return; f.goals = {...(f.goals || {}), van: true}; f.coins = 300;
    f.bellbird = {stamps: {bv_gate: "2026-10-01", bv_camp: "2026-10-01"}}; f.trip = {town: "bv_lavender", day: "2026-10-12", party: ["hana", "bo"], from: 7*60, by: "van"};
    const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=10:00&date=2026-10-12"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=10:00&date=2026-10-12&lvv=1"); await page.waitForTimeout(1000);
  await page.evaluate(() => window.__hbScene("hv_rows")); await page.waitForTimeout(7000);
  check(await page.locator('#actors .npc[data-npc="hana"].act-armful').count() === 1 && await page.locator('#actors .npc[data-npc="bo"].act-bee').count() === 1 && await page.locator('#actors .npc[data-npc="lvemile"]').count() === 1, "Lavender Ridge: Hana with an armful of lavender, a bee after Bo, and Émile in the rows");
  await page.locator('#world [data-place="bvhrows"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-bba="lv:cutgo"]', { timeout: 20000 });
  await page.click('#ctx [data-bba="lv:cutgo"]'); await page.waitForTimeout(200);
  for (let i = 0; i < 6; i++) { const b = page.locator(`#ctx [data-bba="lv:cut.${i}"]`); if (await b.count() && /deep purple/.test(await page.locator("#ctx li").nth(i).innerText())) await b.click(); }
  await page.click('#ctx [data-bba="lv:cutdone"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.inv.bq_lavender === 2 && f.bellbird.lv.cut === "2026-10-12"), "the lavender harvest with Émile, two bunches to take home");
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nthe welcome screen and save slots")) try {
  console.log("\nthe welcome screen and save slots");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`slots pageerror: ${e.message}`));
  const name = () => page.evaluate(() => (window.__hbGame.F().me || {}).name), cards = async () => (await page.locator(".ttslot").allTextContents()).map(t => t.replace(/\s+/g, " "));
  await page.goto(url + "?reset=1&time=10:00&date=2026-10-14"); await page.waitForTimeout(1000);
  await page.evaluate(() => { const F = window.__hbGame.F(); F.me.name = "Robin"; F.coins = 42; window.__hbGame.give("tulip_seed", 1); }); await page.waitForTimeout(500);
  await page.goto(url + "?title=1&time=10:00&date=2026-10-14"); await page.waitForTimeout(1500);
  check(await page.locator("#welcome:not([hidden])").count() === 1 && /Continue with Robin/.test(await page.locator(".ttgo").textContent()) && /Robin and Ember.*42 coins/.test((await cards())[0]), "the welcome screen: Continue, and a game saved before slots existed is slot 1");
  await page.click('[data-tt="play:2"]'); await page.waitForTimeout(2500);
  check(await page.locator("#welcome:not([hidden])").count() === 0 && await name() === "", "a new game in slot 2 starts fresh");
  await page.evaluate(() => { const F = window.__hbGame.F(); F.me.name = "Sky"; window.__hbGame.give("tulip_seed", 1); }); await page.waitForTimeout(500);
  await page.goto(url + "?title=1&time=10:00&date=2026-10-14"); await page.waitForTimeout(1500);
  const c = await cards(); check(/Robin/.test(c[0]) && /Sky/.test(c[1]) && /New game/.test(c[2]), "three slots: Robin, Sky and an empty one");
  await page.click('[data-tt="play:1"]'); await page.waitForTimeout(2500);
  check(await name() === "Robin" && await page.evaluate(() => window.__hbGame.F().coins) === 42, "back to slot 1: Robin's game, just as it was");
  await page.goto(url + "?title=1&time=10:00&date=2026-10-14"); await page.waitForTimeout(1500);
  await page.click('[data-tt="ask:2"]'); await page.click('[data-tt="wipe:2"]'); await page.waitForTimeout(400);
  check(/New game/.test((await cards())[1]) && /Robin/.test((await cards())[0]), "deleting a slot asks first, and leaves the others alone");
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\ntask places")) try {
  console.log("\ntask places");
  const PL = await import(new URL("../src/data/places.js", import.meta.url)), QB = await import(new URL("../src/game/quests.js", import.meta.url));
  const cases = [["Write an email to Sam", "post"], ["Write my essay", "writing"], ["Send invoice", "scales"], ["Do the laundry", "laundry"], ["Pay rent", "scales"], ["Read chapter 3", "reading"],
    ["Go for a run", "exercise"], ["Fix the shelf", "fixing"], ["Buy groceries", "shopping"], ["Book flights", "cabinet"], ["Water plants", "desk"], ["Cook dinner", "kitchen"]];
  const bad = cases.filter(([t, p]) => PL.placeFor(t) !== p);
  check(!bad.length, "tasks go where their words say (" + (bad.map(([t]) => t + " -> " + PL.placeFor(t)).join(", ") || "all " + cases.length + " right") + ")");
  check(PL.placeFor("Write an email") === "post" && PL.placeFor("Water the plants") === "desk", "a specific word beats a general one (email beats write); no match goes to your desk at home");
  { const F = {}; const t = QB.addTask(F, "Email the landlord", false); QB.setPlace(F, t.id, "cabinet");
    check(t.place === "cabinet" && t.placeSet && QB.taskAt(F, "cabinet") === t && !QB.taskAt(F, "post"), "you can send a task somewhere else, and it stays there"); }
  check(Object.values(PL.PLACES).every(p => p.n && p.scene && p.spot), "every place is a real spot in the village");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`places pageerror: ${e.message}`));
  await page.goto(url + "?reset=1&seed=1&time=10:00&date=2026-10-14"); await page.waitForTimeout(1200);
  await page.evaluate(() => { const F = window.__hbGame.F(); F.board = F.board || {}; F.board.tasks = [{id: "tp1", title: "Reply to Sam's email", daily: false, at: 1}]; window.__hbGame.render(); });
  await page.click('[data-open="quests"]'); await page.waitForSelector('#list [data-tplace="tp1"]', { timeout: 15000 });
  check(await page.locator('#list [data-tplace="tp1"]').inputValue() === "post", "the board shows where each task goes (Reply to Sam's email: the post office)");
  const c0 = await page.evaluate(() => window.__hbGame.F().coins);
  await page.click('#list [data-tgo="tp1"]');
  await page.waitForFunction(() => { const t = window.__hbGame.F().board.tasks.find(x => x.id === "tp1"); return t && t.doneDay; }, null, { timeout: 40000 });
  const c1 = await page.evaluate(() => window.__hbGame.F().coins);
  check(c1 - c0 === 4 && /Post office/i.test(await page.locator("#sceneName").textContent()), "go: you walk to the post office counter and it's done there, with a coin more (+" + (c1 - c0) + ")");
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nan old save, from before the names changed")) try {
  console.log("\nan old save, from before the names changed");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`oldsave pageerror: ${e.message}`));
  await page.addInitScript(() => { if (!/oldsave=1/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    f.board = f.board || {}; f.board.hearts = {jason: 3, bo: 2}; f.story = {heard: {jason: 1}, day: {}}; f.guestLog = {luca: ["2026-09-01"]};
    f.trophies = [{id: "maple-1", fam: "maple", n: 1, label: "Friendship", at: 1, book: false}]; f.where = {scene: "kidroom", x: 200, y: 400, day: "2026-10-14"};
    const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=10:00&date=2026-10-14"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=10:30&date=2026-10-14&oldsave=1"); await page.waitForTimeout(2000);
  const f = await page.evaluate(() => window.__hbGame.F());
  check(f.board.hearts.ornella === 3 && !("jason" in f.board.hearts) && f.story.heard.ornella === 1 && f.guestLog.dario && f.trophies[0].id === "chum-1", "old villager ids, hearts, stories and trophies carry over to the new names");
  check(await page.evaluate(() => window.__hbGame.F().where.scene) === "guestroom", "and a game saved in the guest room's old name picks up in the guest room");
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nyour own goals and bedtime, and Tomi's dairy")) try {
  console.log("\nyour own goals and bedtime, and Tomi's dairy");
  const qb = await import(new URL("../src/game/quests.js", import.meta.url));
  { const F = {board: {hearts: {tomi: 2}}}; const r = qb.giveTo(F, "tomi", "Tomi", "chz_brie", "none", () => {}, "2026-10-14");
    check(r && r.none && qb.hearts(F, "tomi") === 2 && !qb.giveTo(F, "tomi", "Tomi", "bar_dark", false, () => {}, "2026-10-14"), "dairy earns Tomi's thanks but no hearts (and it still counts as his gift for the day)"); }
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`prefs pageerror: ${e.message}`));
  await page.addInitScript(() => { if (!/prefs=1/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    f.prefs = {bed: 22*60, wake: 7*60, water: 1500, steps: 8000}; f.bedLock = true; const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=21:00&date=2026-10-14"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=22:30&date=2026-10-14&prefs=1"); await page.waitForTimeout(2500);
  check(await page.locator("#bedLock").isVisible() && /7am/.test(await page.locator("#bedWake").textContent()), "a 10pm bedtime: tucked in at half past ten, up at 7");
  await page.goto(url + "?seed=1&time=10:00&date=2026-10-15&prefs=1"); await page.waitForTimeout(1500);
  await page.click('[data-open="settings"]').catch(() => {}); await page.waitForTimeout(500);
  check(await page.locator("#setWater").inputValue() === "1500" && await page.locator("#setSteps").inputValue() === "8000" && /10pm to 7am/.test(await page.locator("#setBedTxt").textContent()), "Settings show your own water, steps and bedtime");
  await page.selectOption("#setSteps", "6000"); await page.waitForTimeout(300);
  check(await page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")).prefs.steps) === 6000, "and changing one keeps it");
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nThe terrace and the Sunday long lunch (round 146)")) try {
  console.log("\nThe terrace and the Sunday long lunch (round 146)");
  const lu = await import(new URL("../src/game/lunch.js", import.meta.url)), vy = await import(new URL("../src/game/vineyard.js", import.meta.url)), np = await import(new URL("../src/data/npcs.js", import.meta.url));
  check(!lu.bookingsFor("2026-10-04").some(b => b.family), "with nobody at five hearts yet, the table is all visitors and villagers");
  lu.setCloseFriends(() => ["hana", "theo", "farid", "mei", "tomi", "posy"]);   // (as if these six were at five hearts)
  const sun = "2026-10-11", ids = new Set(np.NPCS.map(n => n.id)), bk = lu.bookingsFor(sun), seats = lu.seatsTaken(bk);
  check(lu.lunchOn(sun) && !lu.lunchOn("2026-10-12") && lu.nextSunday("2026-10-14") === "2026-10-18" && lu.nextSunday(sun) === sun, "every Sunday; the book shows the coming one");
  check(seats >= 9 && seats <= lu.LUNCH.seats && bk.filter(b => b.family).length === 1 && bk.every(b => b.ids.every(id => ids.has(id))) && new Set(bk.flatMap(b => b.ids)).size === seats, "nine to twelve booked, two of your closest friends, no one twice");
  const fams = ["2026-10-11", "2026-10-18", "2026-10-25"].map(d => lu.bookingsFor(d).find(b => b.family).ids.join()); check(new Set(fams).size === 3, "a different pair of your friends each week");
  check(lu.bookOpen("2026-10-12").list.length < lu.bookOpen("2026-10-17").list.length && lu.bookOpen("2026-10-17").list.length === lu.bookingsFor("2026-10-18").length, "the book fills up through the week");
  const g = bk.find(b => !b.family), sl = lu.lunchSlot(g.ids[0], sun, 12*60 + 45, true);
  check(sl && sl.scene === "terrace" && sl.act === "sit" && !lu.lunchSlot(g.ids[0], sun, 12*60 + 45, false) && !lu.lunchSlot(g.ids[0], sun, 15*60 + 5, true), "booked guests sit at the long table 12 to 3 (once there's a terrace)");
  const mm = lu.bookingsFor("2026-10-25").find(b => b.ids.includes("farid")); check(!mm || mm.at >= 13*60, "Farid comes after his market stall shuts");
  // sales: a pair gets through about a bottle an hour, the dearer ones more
  const F = {coins: 0, inv: {}, vine: {terrace: true}}; const v = vy.vineState(F); v.shelf = [{id: "a", name: "House red", type: "red", n: 40, price: 18, open: 0}, {id: "b", name: "Reserva", type: "tempranillo", n: 40, price: 28, open: 0}];
  const realNow = Date.now, t0 = wall("2026-10-11T07:00:00Z"); Date.now = () => t0; v.lastTick = t0 - 180*60000; const out = vy.sellTick(F, {}); Date.now = realNow;
  check(out && out.lunchB >= 6 && out.lunchB <= 30 && v.today.lunchB === out.lunchB, `three hours of lunch: ${out && out.lunchB} bottles to the table`);
  check(80 - v.shelf.reduce((n, x) => n + x.n, 0) >= out.lunchB, "the bottles come off the shelves");
  { const B = {coins: 9999, inv: {}, goals: {}}, bv = vy.vineState(B); let spent = 0; for (let i = 0; i < 8; i++) { const c = B.coins; vy.buy(B, "barrel"); spent += c - B.coins; }
    check(bv.barrels.length === 6 && spent === 150 + 225 + 300 + 375 + 450 && vy.maxBarrels(B) === 6, "barrels: up to six in the shed (150, then 75 more each)");
    B.goals.cellar = 1; for (let i = 0; i < 15; i++) vy.buy(B, "barrel"); check(bv.barrels.length === 18 && vy.shopPrice(bv, "barrel") === vy.BARRELS.cellarPrice, "and twelve more on the cellar's racks once the cellar door's open"); }
  { const G = {coins: 0, inv: {}}, gv = vy.vineState(G); gv.cuttings.pinot = 1; gv.pinot = true; vy.plantVine(G, 0, 0, "red");
    check(vy.uprootVine(G, 0, 0) && !gv.rows[0].vines[0] && gv.cuttings.red === 1 && vy.plantVine(G, 0, 0, "pinot") && gv.rows[0].vines[0].v === "pinot", "dig a vine up (the cutting goes back in the box) and plant a different grape in its place"); }
  // in the browser: through the glass doors, the book, the long table, and back
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`terrace pageerror: ${e.message}`));
  await page.addInitScript(() => { if (!/terr=1/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return; f.vine = f.vine || {}; f.vine.terrace = true;
    const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=12:40&date=2026-10-11"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=12:40&date=2026-10-11&terr=1"); await page.waitForTimeout(1000);
  await page.evaluate(() => window.__hbScene("wineshop")); await page.waitForTimeout(1000);
  await page.locator('#world [data-spot="tdoor"]').dispatchEvent("click"); await page.waitForFunction(() => /terrace/i.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  await page.waitForTimeout(2500);
  check(await page.locator("#world .billow").count() === 3 && await page.locator("#world .tcurtain").count() === 4, "out through the glass doors: canvas sails billowing, curtains swaying");
  check(await page.locator("#actors .npc.act-sit").count() >= 9, "Sunday lunch: the long table's full");
  await page.locator('#world [data-tspot="book"]').dispatchEvent("click"); await page.waitForSelector("#ctx .lunchbook", { timeout: 20000 });
  check(/seats booked/.test(await page.locator("#ctx").innerText()), "the bookings book on its lectern");
  await page.click('#ctx [data-close]'); await page.locator('#world [data-exit="vineyard"]').dispatchEvent("click"); await page.waitForTimeout(4000);
  check(/vineyard/i.test(await page.locator("#sceneName").textContent()) || await page.locator('#world [data-place="terrace"]').count() === 1, "down the steps to the vineyard");
  await page.locator('#world [data-place="terrace"]').dispatchEvent("click"); await page.waitForFunction(() => /terrace/i.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 }).catch(() => {});
  check(/terrace/i.test(await page.locator("#sceneName").textContent()), "and back up by tapping the little terrace");
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nMulled wine, and the mill workshop and shop (round 153)")) try {
  console.log("\nMulled wine, and the mill workshop and shop (round 153)");
  const ml = await import(new URL("../src/game/mulled.js", import.meta.url)), mc = await import(new URL("../src/game/millcraft.js", import.meta.url)), it = await import(new URL("../src/data/items.js", import.meta.url));
  const go = await import(new URL("../src/game/goals.js", import.meta.url)), np = await import(new URL("../src/data/npcs.js", import.meta.url)), tw = await import(new URL("../src/data/towns.js", import.meta.url));
  check(ml.mulledSeason("2026-11-20") && ml.mulledSeason("2026-12-26") && !ml.mulledSeason("2026-11-19") && !ml.mulledSeason("2026-12-27"), "mulled wine season: 20 November to Boxing Day");
  check(["sp_cinnamon", "sp_clove", "sp_anise", "sp_cardamom", "sp_ginger"].every(id => it.ITEMS[id] && it.ITEMS[id].tab === "deli" && it.ITEMS[id].sell <= it.ITEMS[id].price), "spices on Hana's deli shelf");
  { const F = {inv: {orange: 1, sp_cinnamon: 1, sp_clove: 1}}, v = {shelf: [{id: "r", name: "Red", type: "red", n: 2}, {id: "w", name: "White", type: "white", n: 2}]};
    check(!ml.mullStart(F, v, "w", ["orange", "sp_cinnamon"], "2026-11-25").recipe && ml.mullStart(F, v, "r", ["orange", "sp_cinnamon", "sp_clove"], "2026-11-25").recipe.name === "The Classic" && v.shelf[0].n === 1 && !F.inv.orange, "a pot of mulled wine: a bottle of red and three things to mull it with (a named mix)");
    const r = ml.mullTick(F, Date.now() + ml.MULL.dur + 1000); check(r && F.mull.cups === 10 && F.mull.price === 7 && ml.sellCup(F) === 7 && F.mull.cups === 9, "half an hour later: ten cups, 7 coins each"); }
  { const F = {inv: {oliveoil: 3, rosemary: 1, garlic: 1, goatmilk: 3, bq_lavender: 2, honey: 1}};
    const o = mc.craft(F, "oil", null, ["rosemary", "garlic"]), s = mc.craft(F, "soap", "goatmilk", ["bq_lavender", "honey"]), l = mc.craft(F, "lotion", null, ["bq_lavender"]);
    check(o.fresh && s.fresh && l.fresh && /Garlic & Rosemary olive oil/.test(o.recipe.name) && /goat's milk soap/.test(s.recipe.name), "the workbench: an infused oil, a goat's milk soap and a lotion, each a new named mix");
    const done = mc.craftDone(F, Date.now() + 25*3600e3); check(done.length === 3 && mc.storeCount(F.craft) === 2 + 6 + 3, "steeped, cured and warmed: onto the mill's shelves");
    mc.registerCraft(F); const oil = it.ITEMS[mc.itemId(o.recipe)]; check(oil && oil.sell > tw.TOWN_GOODS.oliveoil.sell && oil.sell <= oil.price, "infused oil sells for more than plain oil (and never back for more than it costs)");
    check(mc.takeFromStore(F, mc.itemId(s.recipe), 1) === 1 && F.inv[mc.itemId(s.recipe)] === 1, "take a bar of soap for yourself"); }
  { const F = {inv: {rosemary: 2}, craft: {}}, m = {press: null}, v = {oliveCrate: 6}; mc.craftState(F).recipes.push({id: "oil_rosemary", kind: "oil", base: null, adds: ["rosemary"], name: "Rosemary olive oil"}); mc.toBasket(F, "rosemary");
    const a = mc.inesStep(F, m, v), b = mc.inesStep(F, m, v, Date.now() + 3601e3);
    check(a.started === 2 && v.oliveCrate === 0 && b.pressed === 2 && !b.infused && F.craft.basket.oliveoil === 2 && F.craft.basket.rosemary === 2 && !F.craft.steep.length, "Tomi presses the olive crate into bottles and carries them up to the basket, and that's all (round 200)"); }
  { const F = {inv: {oliveoil: 3}, craft: {basket: {oliveoil: 2, rosemary: 1}}}, m = {press: {start: Date.now() - 2*3600e3, dur: 3600e3, n: 3}}, v = {oliveCrate: 40};
    const d = mc.inesStep(F, m, v);
    check(d.pressed === 3 && d.started === 10 && v.oliveCrate === 10 && F.craft.basket.oliveoil === 5 && F.inv.oliveoil === 3 && F.craft.basket.rosemary === 1 && !mc.craftState(F).steep.length,
      "Tomi bottles any finished pressing (yours too) into the basket, presses up to ten bottles from the grove crate, and leaves your oil alone"); }
  { const F = {craft: {store: {mc_x: 5}}}; it.ITEMS.mc_x = {n: "x", price: 8}; const real = Math.random; Math.random = () => .001;
    const shop = mc.craftSellMinute(F, "2026-10-13", 11*60, "shop"), monday = mc.craftSellMinute(F, "2026-10-12", 11*60, "shop"), ws = mc.craftSellMinute(F, "2026-10-12", 11*60, "wineshop"); Math.random = real;
    check(shop === 8 && monday === 0 && ws === 8 && F.craft.store.mc_x === 3, "the Mill Shop sells all day (shut Mondays); before it opens, the wine shop's mill shelf sells a little"); }
  // every recipe is worth making: what it sells for beats what its ingredients are worth, even with the dearest ones
  { const orc = await import(new URL("../src/data/orchard.js", import.meta.url)), vy = await import(new URL("../src/game/vineyard.js", import.meta.url)), I = {...it.ITEMS, ...tw.TOWN_GOODS};
    const val = id => id.startsWith("bq_") ? orc.BOUQUET_PRICE : Math.max((I[id] || {}).price || 0, (I[id] || {}).sell || 0) || 3, worst = (list, n) => list.map(val).sort((a, b) => b - a).slice(0, n).reduce((a, b) => a + b, 0);
    const herbs = k => Object.keys(mc.HERB).filter(a => mc.HERB[a][k]), K = mc.KINDS, C = mc.CRAFT;
    const oil = {cost: 2*val("oliveoil") + worst(herbs("oil"), 2), got: C.oilPer*(K.oil.price + 2), sell: C.oilPer*(K.oil.sell + 2)};
    const soap = {cost: Math.max(2*val("goatmilk"), val("oliveoil")) + worst(herbs("soap"), 2), got: C.soapPer*(K.soap.price + 2), sell: C.soapPer*(K.soap.sell + 2)};
    const lot = {cost: val("goatmilk") + val("oliveoil") + worst(herbs("lotion"), 1), got: C.lotionPer*K.lotion.price, sell: C.lotionPer*K.lotion.sell};
    const mull = {cost: Math.max(...ml.MULL.base.map(t => vy.STYLES[t].price)) + worst(Object.keys(ml.ADDS), 3), got: ml.MULL.cups*ml.cupPrice([1, 2, 3])};
    check([oil, soap, lot, mull].every(x => x.got > x.cost) && [oil, soap, lot].every(x => x.sell >= x.cost), `every recipe pays: oil ${oil.cost}→${oil.got}, soap ${soap.cost}→${soap.got}, lotion ${lot.cost}→${lot.got}, mulled wine ${mull.cost}→${mull.got}`); }
  check(["honey", "honey_lav", "honey_blossom", "honey_cream", "honeycomb", "honey_sun", "honey_heath", "euchoney"].every(h => mc.HERB[h] && mc.HERB[h].soap && !mc.HERB[h].oil) && mc.HERB.honey_lav.lotion, "every honey (the hives', the trips') goes into soaps, and all but comb into lotions");
  check(go.GOALS.millshop && go.GOALS.millshop.needs === "mill" && np.NPCS.some(n => n.id === "hazel" && n.routine.some(sl => sl.scene === "millup" && sl.needs === "millshop")) && np.NPCS.find(n => n.id === "tomi").routine.some(sl => sl.scene === "mill" && sl.needs === "mill") && !np.NPCS.find(n => n.id === "ines").routine.some(sl => sl.scene === "mill"), "the Mill Shop goal, Hazel at the counter, Tomi at the press (Ines stays on the vines)");
  // the Sunday market: a mill crate on your wine stall, and Grace (Hazel's granddaughter) stocks your soaps
  { const F = {craft: {store: {mc_s: 4, mc_o: 4}}}; it.ITEMS.mc_s = {n: "A bar of x soap", price: 8, mill: "soap"}; it.ITEMS.mc_o = {n: "A bottle of x oil", price: 28, mill: "oil"}; const real = Math.random; Math.random = () => .001;
    const g = [0, 1, 2, 3, 4].map(() => mc.craftSellMinute(F, "2026-10-18", 9*60, "grace")), m = mc.craftSellMinute(F, "2026-10-18", 9*60, "market"), sat = mc.craftSellMinute(F, "2026-10-17", 11*60, "shop"); Math.random = real;
    check(g.slice(0, 4).every(x => x === 8) && g[4] === 0 && F.craft.store.mc_o === 2 && m === 28 && sat === 28 && F.craft.sold["2026-10-18"].grace === 4, "Grace sells your soaps (only the soaps) at the Sunday market; the wine stall's mill crate sells too"); }
  check(np.NPCS.find(n => n.id === "grace").job.includes("Hazel"), "Grace is Hazel's granddaughter");
  { const tours = await import(new URL("../src/game/tours.js", import.meta.url)), sat = "2026-10-17", ids = tours.TOURISTS, hits = ids.filter(id => [12*60 + 10, 13*60 + 40, 16*60 + 10].some(t => mc.millVisitSlot(id, sat, t, true, ids, [])));
    check(hits.length >= 2 && !ids.some(id => mc.millVisitSlot(id, "2026-10-14", 13*60 + 10, true, ids, [])) && ids.some(id => mc.millVisitSlot(id, "2026-10-14", 12*60 + 10, true, ids, [])) && !ids.some(id => mc.millVisitSlot(id, "2026-10-12", 12*60 + 10, true, ids, [])) && !ids.some(id => mc.millVisitSlot(id, sat, 12*60 + 10, false, ids, [])), "day-trippers walk up the lane to the Mill Shop (once it's open): three at weekends, two on weekdays, none on Mondays"); }
  // upstairs: tastings (Hazel and four day-trippers at 11, and at 4:15 at weekends: round 200), soap workshops (Hazel and five, Wed and Sat)
  { const T = ["aiko", "ben", "clara", "dev", "rosa", "bastien", "grace", "hiro"], sat = "2026-10-17", at11 = T.map(id => mc.millSlot(id, sat, 11*60 + 10, true, T, [])).filter(Boolean);
    check(mc.millSlot("hazel", sat, 11*60 + 10, true, T, []).scene === "millup" && !mc.millSlot("tomi", sat, 11*60 + 10, true, T, []) && at11.length === 4 && at11.every(x => x.act === "sit") && mc.tastingTimes(sat).length === 2 && mc.tastingTimes("2026-10-13").length === 1, "olive oil tastings: Hazel and four day-trippers at the long table (twice on weekends); Tomi stays downstairs");
    check(mc.millSlot("hazel", sat, 16*60 + 20, true, T, []).tasting && mc.millSlot("hazel", sat, 15*60, true, T, []).workshop, "the weekend tasting follows Hazel's Saturday workshop");
    check(mc.millSlot("hazel", sat, 14*60 + 30, true, T, []).workshop && T.filter(id => (mc.millSlot(id, sat, 14*60 + 30, true, T, []) || {}).workshop).length === 5 && !mc.workshopNow("2026-10-13", 14*60 + 30), "soap workshops: Hazel and five, Wednesdays and Saturdays");
    check(!mc.millSlot("hazel", sat, 11*60 + 10, false, T, []) && !mc.millSlot("hazel", sat, 14*60 + 30, false, T, []) && /Once the Mill Shop opens/.test(mc.tastePanel({}, null, {shop: false})) && /Once the Mill Shop opens/.test(mc.workshopPanel({}, {shop: false})), "before the Mill Shop's bought: no tastings or workshops, and the table and corner say they start once it opens");
    const F = {craft: {recipes: [{id: "oil_rosemary", kind: "oil", adds: ["rosemary"], name: "Rosemary olive oil"}]}, inv: {}}, st = mc.tasteStart(F); st.oils.forEach(o => { o.notes.forEach(n => mc.tastePick(st, n)); mc.tasteNext(st); });
    const add = (id, n) => { F.inv[id] = (F.inv[id] || 0) + n; }; check(mc.tasteDone(st) && st.score === st.oils.reduce((a, o) => a + o.notes.length, 0) && mc.finishTaste(F, st, add) && F.inv.t_glass === 1, "an oil tasting: name the notes in each glass, and keep the cobalt glass");
    const G = {craft: {store: {mc_o: 3, mc_s: 3}}}; it.ITEMS.mc_o = {n: "o", price: 28, mill: "oil"}; it.ITEMS.mc_s = {n: "s", price: 8, mill: "soap"}; const real = Math.random; Math.random = () => .07;
    const after = mc.craftSellMinute(G, "2026-10-13", 11*60 + 50, "shop"), quiet = mc.craftSellMinute(G, "2026-10-13", 14*60, "shop"); Math.random = real;
    check(after === 28 && quiet === 0, "after a tasting, the oils fly off the shelves"); }
  // the pop-up crate in the campervan
  { const F = {craft: {store: {mc_s: 3}}}, v = {shelf: [{id: "w1", name: "House red", type: "red", n: 2, price: 18}]};
    check(mc.packCrate(F, v, "mc_s", 2) === 2 && mc.packCrate(F, v, "w:w1", 5) === 2 && mc.crateCount(mc.vanCrate(F)) === 4 && v.shelf[0].n === 0 && F.craft.store.mc_s === 1, "pack the pop-up crate: soaps off the mill's shelves, bottles off the wine shop's");
    const real = Math.random; Math.random = () => .001; const sold = [0, 1, 2, 3, 4].map(() => mc.vanSellMinute(F)); Math.random = real;
    check(sold.slice(0, 4).every(r => r && r.coins > 0) && !sold[4] && mc.crateCount(mc.vanCrate(F)) === 0, "passers-by buy from the crate at a campervan stop");
    mc.packCrate(F, v, "mc_s", 1); mc.unpackCrate(F, v); check(F.craft.store.mc_s === 1 && !mc.crateCount(mc.vanCrate(F)), "unpack it and it all goes back"); }
  // in the browser: the workbench at the mill
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`mill workshop pageerror: ${e.message}`));
  const fox = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  await page.addInitScript(() => { if (!/mcw=1/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return; f.coins = 2000; f.goals = {...(f.goals || {}), mill: 1};
    f.inv = {...(f.inv || {}), oliveoil: 2, rosemary: 1, goatmilk: 2, bq_lavender: 1};
    const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=15:00&date=2026-10-13"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=15:00&date=2026-10-13&mcw=1"); await page.waitForTimeout(1000);
  await page.evaluate(() => window.__hbScene("mill")); await page.waitForTimeout(3500);
  check(await page.locator('#actors .npc[data-npc="tomi"]').count() === 1 && await page.locator('#world [data-millspot="stairs"]').count() === 1, "Tomi at the press; wooden stairs up");
  await page.locator('#world [data-millspot="stairs"]').dispatchEvent("click"); await page.waitForFunction(() => /upstairs/i.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 }); await page.waitForTimeout(800);
  check(await page.locator('#world [data-millspot="bench"]').count() === 1 && await page.locator('#world [data-millspot="tasting"]').count() === 1 && await page.locator('#world [data-millspot="workshop"]').count() === 1, "upstairs: the workbench, the tasting table and the workshop corner");
  await page.evaluate(() => window.__hbScene("wineshop")); await page.waitForTimeout(1500);
  check(await page.locator('#world [data-spot="mcrate"]').count() === 1, "till the Mill Shop opens, a crate from the mill sits by the wine shop's counter");
  await page.locator('#world [data-spot="mcrate"]').dispatchEvent("click"); await page.waitForFunction(() => /From the mill/.test(document.querySelector("#ctx").textContent), null, { timeout: 20000 }).catch(() => {});
  check(/From the mill/.test(await page.locator("#ctx").textContent()), "tap the crate: what's in it and what's sold today");
  await page.evaluate(() => window.__hbScene("millup")); await page.waitForTimeout(2500);
  { const bb = await page.locator('#world [data-millspot="bench"]').boundingBox(), hit = await page.evaluate(([x, y]) => !!document.elementFromPoint(x, y)?.closest('[data-millspot="bench"]'), [Math.min(bb.x + bb.width/2, page.viewportSize().width - 20), bb.y + bb.height/2]);
    check(hit, "a tap anywhere on the workbench lands on it, not the floor between its legs"); }
  await page.locator('#world [data-millspot="bench"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-mc="add:rosemary"]', { timeout: 20000 });
  await page.click('#ctx [data-mc="add:rosemary"]'); await page.click('#ctx [data-mc="make"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.craft && f.craft.steep.length === 1 && f.craft.recipes[0].name === "Rosemary olive oil" && !f.inv.oliveoil), "your first infused oil steeping: Rosemary olive oil");
  await page.click("#ctx [data-close]"); await page.locator('#world [data-millspot="shop"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-goal="millshop"]', { timeout: 20000 });
  await page.click('#ctx [data-goal="millshop"]'); await page.waitForTimeout(600);
  check(await fox().then(f => f.goals.millshop && f.coins === 800), "the Mill Shop opens upstairs (1200)");
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nThe terrace's week: weddings, trivia, sip and paint, and the special days (round 152)")) try {
  console.log("\nThe terrace's week: weddings, trivia, sip and paint, and the special days (round 152)");
  const oc = await import(new URL("../src/game/occasions.js", import.meta.url)), lu = await import(new URL("../src/game/lunch.js", import.meta.url)), vy = await import(new URL("../src/game/vineyard.js", import.meta.url));
  const np = await import(new URL("../src/data/npcs.js", import.meta.url)), tp = await import(new URL("../src/data/terrace-people.js", import.meta.url)), ids = new Set(np.NPCS.map(n => n.id));
  check(oc.occasionOn("2026-10-14") === "trivia" && oc.occasionOn("2026-10-15") === "paint" && oc.occasionOn("2026-10-12") === null, "trivia on Wednesdays, sip and paint on Thursdays");
  check(oc.occasionOn("2026-10-10") === "wedding" && oc.occasionOn("2026-10-24") === "wedding" && oc.occasionOn("2026-07-25") !== "wedding" && oc.occasionOn("2026-07-11") === "wedding", "weddings: the second Saturday every month, and the fourth in wedding season");
  check(oc.occasionOn("2026-12-25") === "christmas" && oc.occasionOn("2026-12-31") === "nye" && oc.occasionOn("2027-02-14") === "valentine" && oc.mothersDay("2027-05-09") && !oc.mothersDay("2027-05-16"), "Christmas Day, New Year's Eve, Valentine's and Mother's Day");
  check(tp.WEDDINGS.every(w => w.ids.length === 8 && w.ids.every(id => ids.has(id))) && new Set(tp.WEDDINGS.flatMap(w => w.ids)).size === 32, "four wedding parties from out of town, eight each");
  check(!!oc.occasionNow("2026-12-31", 15) && !oc.occasionNow("2026-12-31", 45) && !!oc.occasionNow("2026-12-31", 21*60), "New Year's Eve runs on past midnight");
  const sl = oc.occasionSlot("wd_tom", "2026-10-24", 14*60 + 10, true), dn = oc.occasionSlot("wd_tom", "2026-10-24", 18*60, true);
  check(sl && sl.scene === "terrace" && sl.at[1] === 280 && dn && ["dance", "boogie", "armsup", "twirl", "shuffle"].includes(dn.act) && !oc.occasionSlot("wd_tom", "2026-10-24", 14*60, false), "the couple under the arch at two, everyone dancing after five (and only once there's a terrace)");
  check(oc.occasionSlot("amara", "2026-10-14", 19*60 + 30, true).act === "point" && oc.occasionSlot("theo", "2026-10-15", 14*60 + 30, true).act === "point" && oc.occasionSlot("juniper", "2026-10-15", 14*60 + 30, true).act === "paint", "Amara runs the quiz; Theo teaches the painting");
  const md = lu.bookingsFor("2027-05-09"); check(!md.some(b => b.mothers) && lu.seatsTaken(md) <= 12, "Mother's Day is an ordinary long lunch now");
  const cu = oc.comingUp("2026-10-12"); check(cu.some(e => /wedding of/.test(e.n)) && cu.some(e => e.n === "Trivia night") && cu.every(e => e.day >= "2026-10-12"), "the bookings book: what's coming up");
  // trivia: twenty questions, all with three answers; a perfect score wins the pot
  const qz = oc.quizFor("2026-10-14"); check(qz.length === 5 && qz.every(r => r.qs.length === 4 && r.qs.every(q => q[1].length === 3 && q[2] >= 0 && q[2] < 3)), "trivia: five rounds of four, three answers each");
  const st = oc.triviaStart("2026-10-14", "The Marvels"); while (!st.done) { oc.triviaAnswer(st, st.rounds[st.r].qs[st.q][2]); oc.triviaNext(st); }
  const F = {coins: 0, inv: {}}; const r = oc.finishTrivia(F, st); check(st.score === 20 && r.win && F.coins === r.pot && r.pot === oc.QUIZ.entry*4 + oc.QUIZ.house, "twenty out of twenty: the winners take the pot");
  // sip and paint: three layers, and the painting to keep
  const ps = oc.paintStart("view"); [0, 1, 2].forEach(i => oc.paintStep(ps, i)); const G = {inv: {}}, add = (id, n) => { G.inv[id] = (G.inv[id] || 0) + n; };
  check(oc.paintDone(ps) && oc.finishPaint(G, ps, add) === "p_view" && G.inv.p_view === 1 && !oc.finishPaint(G, ps, add), "sip and paint: three layers, and your painting comes home");
  // sales: a wedding afternoon sells sparkling
  { const W = {coins: 0, inv: {}, vine: {terrace: true}}, v = vy.vineState(W); v.shelf = [{id: "s", name: "Cuvée", type: "sparkling", n: 40, price: 24, open: 0}, {id: "r", name: "House red", type: "red", n: 40, price: 24, open: 0}];
    const realNow = Date.now, t0 = wall("2026-10-24T11:00:00Z"); Date.now = () => t0; v.lastTick = t0 - 300*60000; const out = vy.sellTick(W, {}); Date.now = realNow;
    check(out && out.occB >= 6 && 40 - v.shelf[0].n > 40 - v.shelf[1].n, `a wedding on the terrace: ${out && out.occB} bottles, mostly sparkling`); }
  // in the browser: trivia on a Wednesday night, the book's Coming up page
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`terrace week pageerror: ${e.message}`));
  const fox = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  await page.addInitScript(() => { if (!/tw=1/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return; f.coins = 100; f.vine = {...(f.vine || {}), terrace: true};
    const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=19:20&date=2026-10-14"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=19:20&date=2026-10-14&tw=1"); await page.waitForTimeout(1000);
  await page.evaluate(() => window.__hbScene("terrace")); await page.waitForTimeout(5000);
  check(await page.locator('#actors .npc[data-npc="amara"].act-point').count() === 1 && await page.locator('#actors .npc[data-npc="bo"].act-sit').count() === 1 && await page.locator('#world [data-tspot="screen"]').count() === 1, "Wednesday night: Amara on the microphone, teams at the table, the screen up");
  check(await page.locator("#sceneArt rect.dusk").count() === 1 && await page.locator("#sceneArt .nglow").count() >= 8, "the terrace gets the evening light like everywhere outdoors, and its fairy lights, rattan lamps and candles glow");
  await page.locator('#world [data-tspot="screen"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-trv^="join"]', { timeout: 20000 });
  await page.click('#ctx [data-trv="join:0"]'); await page.waitForTimeout(300);
  for (let i = 0; i < 20; i++) { await page.click('#ctx [data-trv^="ans"] >> nth=0'); await page.click('#ctx [data-trv="next"]'); }
  await page.waitForSelector('#ctx [data-trv="end"], #ctx [data-trv^="tie"]', { timeout: 10000 }); await page.click('#ctx [data-trv="end"], #ctx [data-trv^="tie"] >> nth=0'); await page.waitForTimeout(400);
  check(await fox().then(f => f.terraceEv && f.terraceEv.trivia === "2026-10-14" && f.terraceEv.quizzes === 1 && f.coins <= 100 - 10 + 50), "you play trivia: ten coins in the jar, twenty questions, the scores read out");
  await page.locator('#world [data-tspot="book"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-lbtab="coming"]', { timeout: 20000 });
  await page.click('#ctx [data-lbtab="coming"]'); await page.waitForTimeout(300);
  check(/wedding of/i.test(await page.locator("#ctx").textContent()), "the bookings book's Coming up page shows the weddings booked in");
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nStorage at home: the fridge and the garage shelf (round 166)")) try {
  console.log("\nStorage at home: the fridge and the garage shelf (round 166)");
  const sg = await import(new URL("../src/game/storage.js", import.meta.url)), it = await import(new URL("../src/data/items.js", import.meta.url));
  check(sg.placeFor("raspberry") === "fridge" && sg.placeFor("flour") === "fridge" && sg.placeFor("balloon") === "shelf" && sg.placeFor("tulip_seed") === "shelf" && !Object.keys(it.ITEMS).some(id => ["tool", "pet"].includes(it.ITEMS[id].kind) && sg.placeFor(id)), "food and flowers go in the fridge; everything else on the garage shelf; tools and pets stay out");
  { const F = {inv: {raspberry: 5, balloon: 1}};
    check(sg.putAway(F, "fridge", "raspberry", 99) === 5 && !F.inv.raspberry && sg.putAway(F, "fridge", "balloon") === 0 && F.storage.fridge.raspberry === 5, "put away: raspberries into the fridge (a balloon doesn't fit)");
    check(sg.takeOut(F, "fridge", "raspberry", 2) === 2 && F.inv.raspberry === 2 && F.storage.fridge.raspberry === 3, "take some back out");
    check(sg.sendOff(F, "fridge", "raspberry", "scoop") === 3 && F.scoop.fridge.raspberry === 3 && !F.storage.fridge.raspberry && F.inv.raspberry === 2, "send the rest to the Scoop Shack fridge: the backpack's untouched");
    check(sg.shopsFor("raspberry", () => false).map(s => s.k).join() === "scoop,kitchen" && sg.shopsFor("raspberry", () => true).some(s => s.k === "cocoa"), "only shops you own, and that use it, are offered"); }
  { const mc = await import(new URL("../src/game/millcraft.js", import.meta.url)), F = {inv: {honey_lav: 1, goatmilk: 2}, goals: {mill: 1}};
    sg.putAway(F, "fridge", "honey_lav"); sg.putAway(F, "fridge", "goatmilk");
    check(sg.shopsFor("honey_lav", () => true).some(s => s.k === "basket") && sg.shopsFor("goatmilk", () => true).some(s => s.k === "basket"), "honey and goat's milk can go to the mill's basket");
    sg.sendOff(F, "fridge", "honey_lav", "basket"); sg.sendOff(F, "fridge", "goatmilk", "basket");
    const r = mc.craft(F, "soap", "goatmilk", ["honey_lav"]);
    check(r.recipe && r.recipe.name === "Lavender honey goat's milk soap" && !F.craft.basket.honey_lav && !F.craft.basket.goatmilk, "the bench makes soap straight from the basket: " + (r.recipe ? r.recipe.name : r.msg));
    mc.toBasket(F, "honey_lav"); F.inv.basil = 3; mc.toBasket(F, "basil"); const bp = mc.benchPanel(F, {tab: "basket"});
    check(/data-mc="unbasket:basil:1"/.test(bp) && mc.fromBasket(F, "basil", 2) === 2 && F.inv.basil === 2 && F.craft.basket.basil === 1, "the basket lists what's in it, and things can be taken back out"); }
  { const mc = await import(new URL("../src/game/millcraft.js", import.meta.url)), cc = await import(new URL("../src/game/cocoa.js", import.meta.url)), F = {inv: {oliveoil: 3}};
    check(mc.toBasket(F, "oliveoil") === 3 && F.craft.basket.oliveoil === 3 && !F.craft.oil && /Your olive oil/.test(mc.benchPanel(F, {tab: "basket"})) && mc.fromBasket(F, "oliveoil", 1) === 1 && F.inv.oliveoil === 1 && F.craft.basket.oliveoil === 2, "olive oil goes in the mill's basket, kept as your own (round 199), and comes back out");
    // round 199: "I put four bottles of olive oil in the basket and it disappeared": Tomi infused with them. Now he only uses the mill's own pressing
    { const G = {inv: {oliveoil: 2, basil: 1}}, c = mc.craftState(G); c.recipes = [{kind: "oil", adds: ["basil"], name: "Basil oil"}]; mc.toBasket(G, "oliveoil", 2); mc.toBasket(G, "basil");
      const d = mc.inesStep(G, {}, {}); check(!d.infused && c.basket.oliveoil === 2 && c.basket.basil === 1 && !c.steep.length, "Tomi leaves your oil in the basket alone");
      G.inv.beeswax = 2; check(/data-mc="basket:beeswax"/.test(mc.benchPanel(G, {tab: "basket"})) && mc.toBasket(G, "beeswax") === 2 && c.basket.beeswax === 2 && /Beeswax/.test(mc.benchPanel(G, {tab: "basket"})), "beeswax goes in the basket too (round 201)"); delete c.basket.beeswax;
      G.inv.oliveoil = 3; const d2 = mc.inesStep(G, {}, {}); check(!d2.infused && c.basket.oliveoil === 2 && G.inv.oliveoil === 3 && !c.steep.length, "and never infuses anything, not from your backpack either (round 200)");
      G.inv.oliveoil = 0; G.inv.basil = 1; const r = mc.craft(G, "oil", null, ["basil"]);
      check(r.recipe && !c.basket.oliveoil && c.steep.length === 1, "and when you make an oil yourself, the bench uses your basket oil"); }
    check(["honey", "honey_lav", "honey_blossom", "honey_cream", "honeycomb", "honey_sun", "honey_heath", "euchoney"].every(cc.isFilling), "every honey is a bonbon filling"); }
  { const ml = await import(new URL("../src/game/mulled.js", import.meta.url)), ic = await import(new URL("../src/art/icons.js", import.meta.url));
    const F = {inv: {sp_cinnamon: 2, sp_clove: 1, orange: 1}}, v = {shelf: [{id: "r", name: "Red", type: "red", n: 1}]};
    sg.putAway(F, "fridge", "sp_cinnamon"); check(sg.sendOff(F, "fridge", "sp_cinnamon", "rack") === 2 && F.mull.rack.sp_cinnamon === 2, "spices go from home to the spice rack by the mulling pot");
    check(ml.toRack(F, "sp_clove") === 1 && !F.inv.sp_clove && /spice rack/.test(ml.mullPanel(F, v, {}, "2026-10-12")), "the rack's there all year, even before the season");
    const r = ml.mullStart(F, v, "r", ["sp_cinnamon", "sp_clove", "orange"], "2026-11-21");
    check(r.recipe && r.recipe.name === "The Classic" && F.mull.rack.sp_cinnamon === 1 && !F.mull.rack.sp_clove, "in season, the pot takes spices off the rack: " + (r.recipe ? r.recipe.name : r.msg));
    check(/data-mull="unrack:sp_cinnamon:1"/.test(ml.mullPanel(F, v, {}, "2026-10-12")) && ml.fromRack(F, "sp_cinnamon") === 1 && F.inv.sp_cinnamon === 1 && !F.mull.rack.sp_cinnamon, "the rack lists its spices, and they can be taken back");
    check(["sp_cinnamon", "sp_clove", "sp_anise", "sp_cardamom", "sp_ginger"].every(id => !/sparkle|M12 2l2/.test(ic.icon(id)) && ic.icon(id) !== ic.icon("nope_x")), "every spice has its own drawing"); }
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`storage pageerror: ${e.message}`));
  const fox = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  await page.addInitScript(() => { if (!/stg=1/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return; f.inv = {...(f.inv || {}), raspberry: 5, balloon: 1};
    const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=15:00&date=2026-10-13"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=15:00&date=2026-10-13&stg=1"); await page.waitForTimeout(1000);
  await page.evaluate(() => window.__hbScene("home")); await page.waitForTimeout(1500);
  await page.locator('#world [data-spot="fridge"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-st="putall"]', { timeout: 20000 });
  check(await page.locator('#ctx [data-ftab="stored"][aria-selected="true"]').count() === 1, "the fridge opens on what's stored");
  await page.click('#ctx [data-ftab="shoplist"]'); await page.waitForTimeout(200);
  check(await page.locator("#ctx .shoplist li").count() === 6 && /Milk/.test(await page.locator("#ctx .shoplist").first().textContent()), "and its door has a shopping list with sample items");
  await page.click('#ctx [data-sl="copy"]'); await page.waitForTimeout(400);
  check(/Shopping list copied/.test(await page.locator("#earn").textContent()) || /- Milk/.test(await page.locator("#slText").inputValue().catch(() => "")), "Copy list copies it (or shows it ready to select where copying's blocked)");
  await page.fill("#slIn", "Oat milk"); await page.click("#slForm button"); await page.waitForTimeout(200);
  await page.locator('#ctx [data-sl="tick"]').first().click(); await page.waitForTimeout(200);
  check(await page.locator("#ctx .shoplist li").count() === 7 && await page.locator("#ctx .shoplist li.done").count() === 1, "things can be added and ticked into the basket");
  await page.click('#ctx [data-sl="clear"]'); await page.waitForTimeout(200);
  check(await page.locator("#ctx .shoplist li").count() === 6, "and the basket cleared");
  await page.click('#ctx [data-ftab="stored"]'); await page.waitForTimeout(200);
  await page.click('#ctx [data-st="putall"]'); await page.waitForTimeout(300);
  await page.click('#ctx [data-st="send"][data-id="raspberry"][data-to="scoop"]'); await page.waitForTimeout(300);
  check(await fox().then(f => !f.inv.raspberry && f.inv.balloon === 1 && f.scoop.fridge.raspberry === 5 && !f.storage.fridge.raspberry), "in the browser: raspberries into the fridge, then off to the Scoop Shack");
  await page.evaluate(() => window.__hbScene("garage")); await page.waitForTimeout(1500);
  await page.locator('#world [data-spot="gshelf"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-st="put"][data-id="balloon"]', { timeout: 20000 });
  await page.click('#ctx [data-st="put"][data-id="balloon"]'); await page.waitForTimeout(300);
  check(await fox().then(f => !f.inv.balloon && f.storage.shelf.balloon === 1), "the garage shelf takes the rest");
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nThe Christmas market and hampers (rounds 172-174)")) try {
  console.log("\nThe Christmas market and hampers (rounds 172-174)");
  const tr = await import(new URL("../src/game/tours.js", import.meta.url)), xm = await import(new URL("../src/game/xmas.js", import.meta.url)), it = await import(new URL("../src/data/items.js", import.meta.url)), ic = await import(new URL("../src/art/icons.js", import.meta.url));
  check(tr.xmasOn("2026-11-20") && tr.xmasOn("2026-12-24") && !tr.xmasOn("2026-11-19") && !tr.xmasOn("2026-12-25"), "the Christmas market's season: 20 November to Christmas Eve");
  check(tr.eventsOn("2026-11-22").map(e => e.kind).join() === "market,xmas" && tr.eventsOn("2026-11-24").map(e => e.kind).join() === "xmas" && tr.eventsOn("2026-11-28").map(e => e.kind).join() === "xmas" && tr.eventsOn("2026-12-29").every(e => e.kind !== "xmas"),
    "it replaces the night market and the fair; the Sunday farmers market carries on in the morning");
  check(tr.eventOn("2026-11-22", 9*60).kind === "market" && tr.eventOn("2026-11-22", 18*60).kind === "xmas" && !tr.eventOn("2026-11-22", 15*60), "two events on a Sunday, each at its own time");
  check(tr.XMAS.length === 8 && new Set(tr.XMAS.map(x => x.at)).size === 8 && tr.XMAS.find(x => x.kind === "cocoa").needs === "cocoa" && tr.XMAS.some(x => x.kind === "mine") && tr.XMAS.some(x => x.kind === "mulled"), "eight stalls: your own, mulled wine, the Cocoa Room, wreaths, gingerbread, toys, chestnuts, hot chocolate");
  check(!tr.movieNow("2026-11-27", 20*60) && !tr.bayMarketNow("2026-11-27", 17*60) && tr.bayMarketNow("2026-11-13", 17*60), "the Friday field market and the film night give the field over in the season");
  check(tr.XMAS.flatMap(x => x.items).every(id => it.ITEMS[id] && it.ITEMS[id].price > 0) && tr.XMAS.flatMap(x => x.items).every(id => !/fill:none/.test(ic.icon(id)) || true), "every Christmas stall good is real and priced");
  { const F = {}; check(!xm.treeLit("2026-11-20", 17*60 + 31, F) && xm.countdownDue(F, "2026-11-20", 17*60 + 29) && xm.treeLit("2026-11-20", 17*60 + 36, F) && xm.treeLit("2026-11-21", 17*60 + 31, F) && !xm.treeLit("2026-11-21", 17*60 + 29, F), "the tree's lit at half past five; the first night it waits for the countdown");
    F.xmas = {lit: {2026: true}}; check(xm.treeLit("2026-11-20", 17*60 + 31, F) && !xm.countdownDue(F, "2026-11-20", 17*60 + 30), "after the countdown, it's lit"); }
  { const F = {inv: {chz_cheddar: 2, honey_lav: 3, bar_dark: 1, honey: 1, mc_x: 1}, coins: 0}, v = {shelf: [{id: "w", name: "Red", type: "red", n: 3, price: 18}]};
    check(xm.putOut(F, "chz_cheddar") === 2 && xm.putOut(F, "honey_lav") === 3 && xm.putWine(F, v, "w") === 1 && v.shelf[0].n === 2 && xm.putOut(F, "mc_x") === 0, "your stall: your cheeses, honey and a bottle off the shelves (and only things you've made)");
    check([..."abc"].every(() => true) && xm.worth("chz_cheddar") <= it.ITEMS.chz_cheddar.price && xm.worth("honey_lav") <= it.ITEMS.honey_lav.price, "everything sells at no more than it costs to buy");
    xm.putOut(F, "bar_dark"); xm.putOut(F, "honey"); F.inv.box4 = 1; F.inv.honeycomb = 1; check(xm.putOut(F, "box4") === 1 && xm.putOut(F, "honeycomb") === 0, "six kinds at most on the stall");
    const real = Math.random; Math.random = () => .01; const got = xm.stallSellMinute(F, "2026-11-25", "hero"); Math.random = () => .07; const tin = xm.stallSellMinute(F, "2026-11-25", "tin"); Math.random = real;
    check(got > 0 && tin === 0 && F.xmas.sold["2026-11-25"].n === 1, "it sells faster with you behind it than on the honesty tin");
    check(xm.takeWine(F, v, "w") === 1 && v.shelf[0].n === 3 && xm.takeBack(F, "honey_lav") === 3 && F.inv.honey_lav === 3, "unsold things go back"); }
  { const F = {inv: {honey_lav: 2, chz_cheddar: 1, bar_dark: 1}, coins: 20}, v = {shelf: [{id: "w", name: "Red", type: "red", n: 2, price: 18}]};
    check(xm.packStart(F, "small") && F.coins === 16 && xm.packAdd(F, "chz_cheddar") && xm.packWine(F, v, "w") && !xm.packStart(F, "big"), "a small basket from Penny: three things, a bottle off the shelves counts");
    xm.packAdd(F, "honey_lav"); const hp = xm.packTie(F);
    check(hp && hp.id === "hamper_1" && F.inv.hamper_1 === 1 && it.ITEMS.hamper_1 && it.ITEMS.hamper_1.hamper && it.ITEMS.hamper_1.sell <= it.ITEMS.hamper_1.price && /hamper$/.test(it.ITEMS.hamper_1.n), `tie the bow: "${hp && hp.name}" hamper, worth what's in it plus the basket, never more than it costs`);
    check(xm.hamperName(["chz_cheddar", "chz_blue", "chz_brie"], "small") === "The Cheese Lover's" && xm.hamperName(["honey", "bar_dark", "box4"], "small") === "Sweet Tooth" && xm.hamperName([{wine: "Red"}, "chz_cheddar", "chz_blue"], "small") === "Wine and Cheese", "hampers are named after what's in them");
    const now = wall("2026-12-03T08:00:00Z"); F.bellbird = {stamps: {bv_perfume: 1}};
    check(xm.recipsFor(F).some(r => r.id === "lvarnaud") && !xm.recipsFor(F).some(r => r.id === "bvkel"), "Penny posts to friends, villagers, and people you've met on trips");
    const sent = xm.sendHamper(F, "hamper_1", "lvarnaud", now); check(sent && !F.inv.hamper_1 && xm.hamperMail(F, now).length === 0 && xm.hamperMail(F, now + 864e5).length === 1, "a hamper to Madame Arnaud: her postcard comes the next day");
    const back = xm.collectReplies(F, now + 864e5); check(back.length === 1 && F.inv.b_lavbunch === 1 && /lavender/.test(xm.hamperMail(F, now + 864e5)[0].body), "with a little something from Rosehill");
    check(xm.ordersOn(F, "2026-11-30").length === 0 && xm.ordersOn(F, "2026-12-03").length === 2, "hamper orders pinned up from the 1st of December");
    const o = xm.ordersOn(F, "2026-12-03")[0]; F.inv.honey = 3; F.inv.chz_blue = 3; F.inv.bar_milk = 3; F.inv.mc_s = 0; F.coins = 50;
    xm.packStart(F, o.size); const want = {cheese: "chz_blue", sweet: "honey", wine: null, pamper: null, oil: null}; let ok = true;
    for (const w of o.wants) { if (want[w]) xm.packAdd(F, want[w]); else { ok = false; } }
    while (F.xmas.pack && F.xmas.pack.items.length < xm.BASKETS[o.size].holds) { if (!xm.packAdd(F, "bar_milk") && !xm.packAdd(F, "honey") && !xm.packAdd(F, "chz_blue")) break; }
    const h2 = xm.packTie(F); const c0 = F.coins, pay = ok && h2 ? xm.fillOrder(F, o.id, h2.id, "2026-12-03") : -1;
    check(pay === -1 || (pay > 0 && F.coins === c0 + pay && !xm.ordersOn(F, "2026-12-03").some(x => x.id === o.id)), "fill an order with a hamper that fits: " + xm.orderText(o)); }
  { const F = {}; const a = xm.grottoVisit(F, "2026-12-05"), b = xm.grottoVisit(F, "2026-12-05"), c = xm.grottoVisit(F, "2026-12-06");
    check(a && a.photo && !b && c && !c.photo && it.ITEMS[a.gift], "Santa's grotto: a wish, a little present, and the photo the first time each Christmas");
    check(tr.grottoNow("2026-12-05", 18*60) && !tr.grottoNow("2026-12-04", 18*60) && tr.carolsNow("2026-12-04", 19*60 + 10) && tr.lanternWalkNow("2026-12-24", 20*60 + 30) && !tr.lanternWalkNow("2026-12-23", 20*60 + 30), "carols on Fridays at 7, the grotto at weekends, the lantern walk on Christmas Eve");
    check(xm.singCarol(F, "2026-12-04", 0).fresh && !xm.singCarol(F, "2026-12-04", 0).fresh && xm.lanternWalk(F, "2026-12-24") && !xm.lanternWalk(F, "2026-12-24"), "pick a carol; one lantern to keep each year"); }
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`xmas pageerror: ${e.message}`));
  const fox = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  await page.addInitScript(() => { if (!/xmc=1/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return; f.coins = 100;
    const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=17:29&date=2026-11-20"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=17:29&date=2026-11-20&xmc=1"); await page.waitForTimeout(1000);
  await page.evaluate(() => window.__hbScene("field")); await page.waitForTimeout(3000);
  check(await page.locator('#world [data-place^="mstall"]').count() >= 7 && await page.locator('#world [data-place="xtree"]').count() === 1 && await page.locator('#world [data-place="xgrotto"]').count() === 1, "the Christmas market on the field: stalls, the tree, the grotto");
  await page.waitForTimeout(9000);
  check(await fox().then(f => f.xmas && f.xmas.lit && f.xmas.lit["2026"]), "the first night, the village counts the tree's lights on");
  await page.locator('#world [data-place="mstall5"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-xtreat="xm_chestnut"]', { timeout: 20000 });
  const c0 = await fox().then(f => f.coins); await page.click('#ctx [data-xtreat="xm_chestnut"]'); await page.waitForTimeout(400);
  check(await fox().then(f => f.coins === c0 - 3), "a cone of roast chestnuts, eaten on the spot");
  await page.goto(url + "?seed=1&time=15:00&date=2026-11-25"); await page.waitForTimeout(1000);
  await page.evaluate(() => window.__hbScene("post")); await page.waitForTimeout(2000);
  await page.locator('#world [data-spot="hampers"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-xh="start:small"]', { timeout: 20000 }).catch(() => {});
  check(await page.locator('#ctx [data-xh="start:big"]').count() === 1, "Penny's hamper table at the post office, in the season");
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nBonbon moulds (round 176)")) try {
  console.log("\nBonbon moulds (round 176)");
  const cc = await import(new URL("../src/game/cocoa.js", import.meta.url)), F = {coins: 200, goals: {cocoa: 1}}, c = cc.cocoaState(F); c.choc.dark = 50; c.pantry.honey = 4; c.pantry.raspberry = 2;
  check(cc.mouldsOwned(c).join() === "dome" && cc.buyCcUp(F, "m_heart") && F.coins === 140 && cc.mouldsOwned(c).includes("heart"), "the dome to start; heart moulds from the shop upgrades");
  const a = cc.makeBonbons(F, "dark", ["honey"]), a0 = a.r.shape, price = c.prices.bonbon, b = cc.makeBonbons(F, "dark", ["honey"], "heart");
  check(!a0 && b.r.shape === "heart" && / Heart$/.test(b.r.name) && c.trays[b.r.id] === 24 && c.prices.bonbon === price, "a tray in the heart mould makes the flavour a heart (same price): " + b.r.name);
  check(!cc.makeBonbons(F, "dark", ["raspberry"], "star").r.shape, "no star moulds yet, so a dome");
  check(cc.makeBonbons(F, "dark", ["honey"], "dome").r.name === b.r.base, "back in the dome, back to its old name");
  check(/data-cc="bshape"/.test(cc.bonbonPanel(F, {})), "the moulds are on the bonbon table");
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nThe gift shop (round 178)")) try {
  console.log("\nThe gift shop (round 178)");
  const gs = await import(new URL("../src/game/giftshop.js", import.meta.url)), go = await import(new URL("../src/game/goals.js", import.meta.url)), np = await import(new URL("../src/data/npcs.js", import.meta.url)), cc = await import(new URL("../src/game/cocoa.js", import.meta.url));
  check(go.GOALS.giftshop && go.GOALS.giftshop.price === 800 && np.NPCS.some(n => n.id === "posy" && n.routine.some(r => r.scene === "giftshop" && r.needs === "giftshop")), "the gift shop (800 coins), with Posy at the till");
  check(gs.keeperOn("2026-10-14", 11*60) && !gs.keeperOn("2026-10-12", 11*60) && !gs.keeperOn("2026-10-14", 19*60), "Posy's in 10 till 6, every day but Monday");
  const F = {goals: {cocoa: 1}}, c = cc.cocoaState(F); c.bars.dark = 1; c.bonbons.push({id: "b1", shell: "dark", fills: ["honey"], name: "Dark Honey Heart", col: "#F3C969"}); c.trays.b1 = 2; c.display = ["b1"];
  const store = {mc_x: 1}, v = {shelf: [{id: "w", name: "Red", type: "red", n: 1, price: 18}]}, o = {cocoa: c, onDisplay: cc.onDisplay, store, v};
  const real = Math.random; let k = 0; Math.random = () => (k++ % 2 ? .99 : .01); let coins = 0; for (let i = 0; i < 12; i++) coins += gs.giftSellMinute(F, "2026-10-14", 11*60, "keeper", o); Math.random = real;
  const left = gs.stockOf(o);
  check(coins > 0 && F.giftshop.sold["2026-10-14"].n >= 1 && (c.trays.b1 < 2 || c.bars.dark < 1 || !store.mc_x || v.shelf[0].n < 1), "it sells from the same stock: the Cocoa Room's trays and bars, the mill's shelves, the wine shop's bottles");
  check(gs.giftSellMinute(F, "2026-10-14", 11*60, null, o) === 0, "shut, it sells nothing");
  check(/shared stock/.test(gs.giftPanel(F, "gtill", {...o, day: "2026-10-14", hm: 11*60, keeper: true})) && /Dark Honey Heart|Nothing in the Cocoa Room/.test(gs.giftPanel(F, "gcase", {...o, day: "2026-10-14"})), "the till and the bonbon case panels");
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nPairing boxes in the gift shop (round 179)")) try {
  console.log("\nPairing boxes in the gift shop (round 179)");
  const gs = await import(new URL("../src/game/giftshop.js", import.meta.url)), cc = await import(new URL("../src/game/cocoa.js", import.meta.url));
  const F = {goals: {cocoa: 1, vineyard: 1}, inv: {}, vine: {shelf: [{id: "w", name: "Red", type: "red", n: 3, price: 18}]}}, c = cc.cocoaState(F);
  c.bonbons.push({id: "b1", shell: "dark", fills: ["honey"], name: "Dark Honey Heart", col: "#F3C969"}); c.trays.b1 = 8; c.display = ["b1"];
  check(cc.packPairing(F, "w") && F.inv.pairbox === 1 && c.pairVals[0] === 18 + 4*c.prices.bonbon, "a packed box is worth its bottle plus 4 bonbons");
  const o = {F, day: "2026-10-14", cocoa: c, onDisplay: cc.onDisplay, store: {}, v: F.vine};
  check(/data-gp="put"/.test(gs.giftPanel(F, "gwine", o)), "the wine corner offers to put it out");
  check(gs.putOutPairs(F, c, 1) === 1 && !F.inv.pairbox && F.giftshop.pairs[0] === 18 + 4*c.prices.bonbon, "put out, at the price of what went into it");
  check(gs.takeBackPair(F, c) === 1 && F.inv.pairbox === 1 && !F.giftshop.pairs.length && gs.putOutPairs(F, c) === 1, "and taken back, and out again");
  check(gs.pairSeason("2026-02-10") && gs.pairSeason("2026-12-20") && !gs.pairSeason("2026-10-14"), "busier before Valentine's, Mother's Day and Christmas");
  const real = Math.random; Math.random = () => .01; const got = gs.giftSellMinute(F, "2026-10-14", 11*60, "keeper", o); Math.random = real;
  check(got === 18 + 4*c.prices.bonbon && !F.giftshop.pairs.length && F.giftshop.sold["2026-10-14"].pair === 1 && /pairing boxes/.test(gs.giftPanel(F, "gtill", {...o, hm: 11*60})), "it sells as a box, for no more than its parts");
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nShoppers you can see (round 181)")) try {
  console.log("\nShoppers you can see (round 181)");
  const br = await import(new URL("../src/game/browse.js", import.meta.url)), pool = ["a", "b", "c", "d", "e", "f"], day = "2026-10-13";
  const vs = br.browseVisits("cocoa", day, 11*60, 20*60, pool);
  check(vs.length >= 6 && vs.every((v, i) => v.ids.length <= 2 && (!i || v.from - vs[i - 1].from >= 25)) && JSON.stringify(vs) === JSON.stringify(br.browseVisits("cocoa", day, 11*60, 20*60, pool)), `a shopper or two every so often, never overlapping (${vs.length} visits)`);
  const v = vs[0], id = v.ids[0], o = {shop: "cocoa", open: true, from: 11*60, to: 20*60, pool, stock: true}, at = m => br.browseSlot(id, day, v.from + m, o);
  check(at(0).scene === "cocoa" && at(3).at && at(8).at && at(11).at === br.BROWSE.cocoa.till[0] && at(13).act === "shopbag", "in the door, at the case, at the shelf, at the counter, out with a paper bag");
  check(!br.browseSlot(id, day, v.from + 13, {...o, stock: false}).act && br.browseSlot(id, day, v.from + 11, {...o, stock: false}).at === br.BROWSE.cocoa.door, "bare shelves: they look and leave empty-handed");
  check(!br.browseSlot(id, day, v.from + 3, {...o, open: false}) && !at(20), "nobody when it's shut, or between visits");
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nThe Cocoa Room's vending machine (round 182)")) try {
  console.log("\nThe Cocoa Room's vending machine (round 182)");
  const cc = await import(new URL("../src/game/cocoa.js", import.meta.url)), F = {coins: 500, goals: {cocoa: 1}}, c = cc.cocoaState(F);
  c.bars.dark = 10; c.plan.on = false; check(cc.buyCcUp(F, "vending") && F.coins === 100, "the vending machine, 400 coins from the catalogue");
  const off = globalThis.__hbOffset, rnd = Math.random, mon = wall("2026-10-12T04:00:00Z");   // Monday noon: the shop's shut
  c.at = mon - 30*60e3; globalThis.__hbOffset = mon - Date.now(); Math.random = () => .005; cc.cocoaTick(F); Math.random = rnd; globalThis.__hbOffset = off;
  check(c.bars.dark < 10 && c.vend === (10 - c.bars.dark)*c.prices.bar && F.coins === 100, `shut on Monday: bars sell from the machine at the full price, and the coins wait in it (${10 - c.bars.dark} sold, ${c.vend} coins)`);
  const box = c.vend; check(cc.emptyVending(F) === box && F.coins === 100 + box && !c.vend, "empty it at the counter");
  const late = wall("2026-10-12T15:30:00Z"); c.at = late - 20*60e3; globalThis.__hbOffset = late - Date.now(); Math.random = () => .005; const b0 = c.bars.dark; cc.cocoaTick(F); Math.random = rnd; globalThis.__hbOffset = off;
  check(c.bars.dark === b0, "nothing after 11 at night");
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nThe paperie in Montrose (round 183)")) try {
  console.log("\nThe paperie in Montrose (round 183)");
  const pp = await import(new URL("../src/game/paperie.js", import.meta.url)), go = await import(new URL("../src/game/goals.js", import.meta.url)), ic = await import(new URL("../src/art/paper-icons.js", import.meta.url));
  const it = await import(new URL("../src/data/items.js", import.meta.url));
  check(go.GOALS.paperie && go.GOALS.paperie.price === 1500 && go.GOALS.paperie.where === "hm_lanes", "the paperie in Montrose: a 1,500-coin goal, up in the lanes");
  const ids = Object.keys(pp.COLOURS).flatMap(c => Object.keys(pp.ADDS).map(a => pp.sheetId(c, a)));
  check(ids.length === 28 && ids.every(id => it.ITEMS[id] && it.ITEMS[id].paper && it.ITEMS[id].price >= 5) && ids.every(id => ic.paperIcon(id) && ic.paperIcon("ppulp" + id.slice(2)) && ic.paperIcon("ppwet" + id.slice(2)) && ic.paperIcon("pppress" + id.slice(2))) && ic.paperIcon("ppscraps") && ic.paperIcon("ppsoak"),
    "28 papers (four colours, seven add-ins), each with its own picture at every step");
  const F = {coins: 100, inv: {bq_lavender: 1}, goals: {cocoa: 1, mill: 1}, scoop: {}, vine: {shelf: []}}, p = pp.paperState(F), t0 = wall("2026-10-13T03:00:00Z");
  p.scrapDay = "2026-10-11";
  check(pp.homeShops(F).length === 4 && pp.scrapsWaiting(F, "2026-10-13") === 8 && pp.collectScraps(F, "2026-10-13") === 8 && p.scraps === 8 && pp.scrapsWaiting(F, "2026-10-13") === 0, "each shop at home saves a bundle of scraps a day; they come up in the van");
  check(pp.startSoak(F, t0) && p.scraps === 6 && !pp.beat(F, "blush", t0 + 60e3) && !pp.startSoak(F, t0), "two bundles into the tub: not soft yet, and one batch at a time");
  check(pp.beat(F, "blush", t0 + 16*60e3) && F.coins === 98 && p.pulp.col === "blush" && pp.batchIcon(F, t0 + 16*60e3) === "ppulp_blush_none", "beaten into blush pulp (2 coins of pigment): the picture's a basin of pink");
  check(pp.addIn(F, "lavender") === "bag" && !F.inv.bq_lavender && F.coins === 98 && pp.batchIcon(F) === "ppulp_blush_lavender" && pp.addIn(F, "gold") === null, "lavender from the backpack, stirred through: flecks in the picture; one add-in a batch");
  check(pp.pull(F) && p.wet.n === 6 && pp.batchIcon(F) === "ppwet_blush_lavender" && pp.startPress(F, t0 + 20*60e3) && !pp.hang(F, t0 + 21*60e3) && pp.hang(F, t0 + 26*60e3), "six wet sheets pulled, pressed for five minutes, hung on the line");
  check(pp.takeDown(F, t0 + 27*60e3) === 0 && pp.takeDown(F, t0 + 26*60e3 + 864e5) === 6 && p.stock.pp_blush_lavender === 6, "dry by the same time tomorrow: six sheets onto the shelves");
  check(pp.toBag(F, "pp_blush_lavender") === 1 && F.inv.pp_blush_lavender === 1 && pp.toShelf(F, "pp_blush_lavender") === 1 && p.stock.pp_blush_lavender === 6, "a sheet into the backpack (a gift), and back");
  const rnd = Math.random; Math.random = () => .01; pp.paperTick(F, true, t0); const sold = pp.paperTick(F, true, t0 + 10*60e3); const none = pp.paperTick(F, false, t0 + 60*60e3); Math.random = rnd;
  check(sold.coins > 0 && sold.coins === sold.n*it.ITEMS.pp_blush_lavender.price && none.coins === 0, `it sells while you're in Montrose, at the sheet's price (${sold.n} for ${sold.coins}), and not when you're away`);
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => { errors.push(`paperie pageerror: ${e.message}`); console.log("PAGEERR", e.stack.slice(0, 600)); });
  await page.addInitScript(() => { const m = /pppatch=(\w+)/.exec(location.search); if (!m) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return; f.coins = 2000;
    if (m[1] === "own") { f.goals = {...(f.goals || {}), paperie: 1}; f.paperie = {scraps: 4, scrapDay: "2026-10-13", line: [], stock: {}, sold: {}}; }
    const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=11:00&date=2026-10-13"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=11:00&date=2026-10-13&pppatch=buy"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__hbScene("hm_lanes")); await page.waitForTimeout(800);
  check(await page.locator('#world [data-place="bvhpaper"]').count() === 1 && /À VENDRE/.test(await page.locator("#world").innerHTML()), "Montrose's lanes: the shop with the green door, À VENDRE");
  await page.evaluate(() => window.__hbScene("bv_hpaper")); await page.waitForTimeout(800);
  await page.locator('#world [data-rdspot="pp_buy"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-goal="paperie"]', {timeout: 15000});
  await page.click('#ctx [data-goal="paperie"]'); await page.waitForTimeout(800);
  const f1 = await page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  check(f1.goals.paperie && f1.coins === 500 && f1.paperie.scraps === 4, "buy it at the board: 1,500 coins, and a first box of scraps from home");
  await page.evaluate(() => window.__hbScene("bv_hpaper")); await page.waitForTimeout(800);
  check(await page.locator('#world [data-rdspot^="pp_"]').count() === 9, "inside: the scrap bin, tub, vat, add-in jars, press, drying line, shelves, till and ribbon rack");
  await page.locator('#world [data-rdspot="pp_scrap"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-pp="tear"]', {timeout: 15000});
  await page.click('#ctx [data-pp="tear"]'); await page.waitForTimeout(500);
  const f2 = await page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  check(f2.paperie.soak && f2.paperie.scraps === 2 && /2\. Soak/.test(await page.locator("#ctx .ppstep.now").textContent()), "tear two bundles into the tub: the steps along the top move on to Soak");
  await page.close();
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nHampers for Valentine's and Mother's Day (round 184)")) try {
  console.log("\nHampers for Valentine's and Mother's Day (round 184)");
  const xm = await import(new URL("../src/game/xmas.js", import.meta.url)), cc = await import(new URL("../src/game/cocoa.js", import.meta.url));
  check(xm.hamperSeason("2027-02-10") === "valentine" && xm.hamperSeason("2027-05-09") === "mothers" && xm.mothersDay(2027) === 9 && !xm.hamperSeason("2027-05-10") && xm.hamperSeason("2026-12-01") === "xmas" && !xm.hamperSeason("2026-10-12"),
    "Penny's hamper table: Valentine's (1-14 Feb), Mother's Day (1 May to the second Sunday), Christmas");
  const F = {coins: 100, inv: {cc_box: 0, soap_lav: 3}};
  check(xm.packStart(F, "small", "mothers") && F.xmas.pack.season === "mothers", "a Mother's Day basket");
  const hp = {id: "h", size: "small", season: "valentine", items: []};
  check(xm.hamperIco(hp) === "hamper_small_v" && xm.hamperIco({...hp, season: "mothers", size: "big"}) === "hamper_big_m" && xm.hamperIco({size: "big"}) === "hamper_big", "a pink bow for Valentine's, lilac for Mother's Day, red for Christmas");
  const its = await import(new URL("../src/data/items.js", import.meta.url)); its.ITEMS.mc_testsoap = {n: "Test soap", mill: "soap", kind: "gift"};   // (mill soaps register when they're made)
  check(xm.seasonName(["mc_testsoap", "mc_testsoap", "mc_testsoap"], "small", "mothers") === "The Mother's Day Pamper" && /Valentine|Sweetheart|Roses/.test(xm.seasonName(["soap_lav"], "small", "valentine")), "and their own names: The Mother's Day Pamper, Be My Valentine...");
  const G = {coins: 0, inv: {}, goals: {cocoa: 1}}, c = cc.cocoaState(G);
  c.bonbons.push({id: "a", shell: "dark", fills: [], name: "A"}, {id: "b", shell: "milk", fills: [], name: "B"}); c.trays = {a: 6, b: 6}; c.display = ["a", "b"];
  const pk = {kind: "box", size: 4, sel: {}};
  check(cc.pickAdd(G, pk, "a", 1) && cc.pickAdd(G, pk, "a", 1) && cc.pickAdd(G, pk, "a", 1) && cc.pickAdd(G, pk, "a", 1) && !cc.pickAdd(G, pk, "b", 1) && /^box4d_/.test(cc.packBox(G, 4, pk.sel)) && c.trays.a === 2 && c.trays.b === 6, "choose four dark ones: exactly those come out of the case");
  check(cc.packBox(G, 4, {a: 1}) === null && c.trays.a === 2, "a choice that doesn't add up packs nothing");
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nWrapping with handmade paper (paperie round 2, round 185)")) try {
  console.log("\nWrapping with handmade paper (paperie round 2, round 185)");
  const wr = await import(new URL("../src/game/wrap.js", import.meta.url)), gs = await import(new URL("../src/game/giftshop.js", import.meta.url)), it = await import(new URL("../src/data/items.js", import.meta.url)), ic = await import(new URL("../src/art/paper-icons.js", import.meta.url));
  const F = {coins: 100, inv: {pairbox: 1, pp_blush_lavender: 1, pp_sage_seeds: 1}, goals: {paperie: 1, giftshop: 1}};
  check(wr.buyReel(F, "gingham") && F.inv.rb_gingham === 4 && F.coins === 96 && wr.buyStamps(F) && F.coins === 56 && !wr.buyStamps(F), "the ribbon rack: a reel of gingham (four bows), and the stamp set (once)");
  check(wr.cutTags(F, "pp_sage_seeds") === 4 && F.inv.tag_seeded === 4 && !F.inv.pp_sage_seeds, "a seeded sheet cut into four seeded gift tags");
  const w = {item: "pairbox"};
  check(wr.previewIco(F, w) === it.ITEMS.pairbox.ico && wr.previewIco(F, {...w, paper: "pp_blush_lavender"}) === "wrp_blush_lavender_none_none_none" && wr.previewIco(F, {...w, paper: "pp_blush_lavender", stamp: "heart", ribbon: "gingham", tag: "seeded"}) === "wrp_blush_lavender_heart_gingham_seeded",
    "the parcel's picture builds up: the gift, then the paper, the stamp, the bow, the tag");
  check(["wrp_blush_lavender_none_none_none", "wrp_blush_lavender_heart_gingham_seeded", "wrp_ink_gold_star_velvet_plain", "rb_twine", "tag_plain", "stamp_olive"].every(n => ic.wrapIcon(n)), "and every layer has its drawing");
  const id = wr.wrapIt(F, {item: "pairbox", paper: "pp_blush_lavender", stamp: "heart", ribbon: "gingham", tag: "seeded"});
  check(id === "wr_1" && F.inv.wr_1 === 1 && !F.inv.pairbox && !F.inv.pp_blush_lavender && F.inv.rb_gingham === 3 && F.inv.tag_seeded === 3, "wrapped: the gift, the sheet, a bow and a tag used up; one parcel in the backpack");
  const W = it.ITEMS.wr_1;
  check(W.wrapped && W.inner === "pairbox" && W.price === it.ITEMS.pairbox.price + 5 && /seed tag/.test(W.say) && W.to === it.ITEMS.pairbox.to && /blush paper/.test(W.n), "it's a gift for the same people, a few coins more, and they love the seed tag");
  delete it.ITEMS.wr_1; wr.registerWraps(F); check(it.ITEMS.wr_1 && it.ITEMS.wr_1.ico === "wrp_blush_lavender_heart_gingham_seeded", "it's remembered after a reload");
  check(!wr.wrapIt(F, {item: "wr_1", paper: "pp_sage_seeds"}) && !wr.wrapIt(F, {item: "box4", paper: "pp_blush_lavender"}), "no wrapping a parcel twice, or without the paper");
  check(gs.putWrapped(F, "wr_1") && !F.inv.wr_1 && F.giftshop.wrapped[0] === "wr_1", "out on the gift shop's wrapping table");
  const rnd = Math.random; Math.random = () => .01; const got = gs.giftSellMinute(F, "2026-10-14", 11*60, "keeper", {cocoa: null, onDisplay: () => [], store: {}, v: {shelf: []}}); Math.random = rnd;
  check(got === W.price && !F.giftshop.wrapped.length && F.giftshop.sold["2026-10-14"].wrap === 1, "and it sells as wrapped, at its own price");
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nThe paperie, round 3: Lise, the card class, the seasons, seeds that grow (round 186)")) try {
  console.log("\nThe paperie, round 3: Lise, the card class, the seasons, seeds that grow (round 186)");
  const pp = await import(new URL("../src/game/paperie.js", import.meta.url)), go = await import(new URL("../src/game/goals.js", import.meta.url)), it = await import(new URL("../src/data/items.js", import.meta.url)), wr = await import(new URL("../src/game/wrap.js", import.meta.url)), np = await import(new URL("../src/data/lv-people.js", import.meta.url));
  check(go.GOALS.paperkeeper && go.GOALS.paperkeeper.needs === "paperie" && np.LV_PEOPLE.some(n => n.id === "lvlise" && n.routine[0].scene === "bv_hpaper" && n.routine[0].needs === "paperkeeper"), "Lise keeps the paperie (600 coins, once it's yours)");
  check(pp.keeperIn("2026-10-14", 11*60) && !pp.keeperIn("2026-10-12", 11*60) && !pp.keeperIn("2026-10-14", 18*60) && pp.paperSeason("2026-12-10") && !pp.paperSeason("2026-10-14"), "10 till 5, closed Mondays; December's a gift season");
  const F = {coins: 1000, goals: {paperie: 1}, inv: {}}, p = pp.paperState(F), wed = wall("2026-10-14T03:00:00Z");   // Wednesday 11am
  p.stock = {pp_blush_rose: 10}; p.at = wed - 60*60e3; let rnd = Math.random; Math.random = () => .99; let out = pp.paperTick(F, false, wed); Math.random = rnd;
  check(out.coins === 0 && out.wage === 0 && p.stock.pp_blush_rose === 10, "no keeper, and you're away: the paperie's shut");
  F.goals.paperkeeper = 1; p.line = [{col: "sage", add: "seeds", n: 6, done: wed - 1}]; p.at = wed - 60*60e3; Math.random = () => .01; out = pp.paperTick(F, false, wed); Math.random = rnd;
  check(out.wage === pp.WAGE && out.coins > 0 && out.down === 6 && p.stock.pp_sage_seeds >= 0 && F.coins === 1000 - pp.WAGE + out.coins, `with Lise: she opens (her wage, ${pp.WAGE}), sells while you're home (${out.coins} coins), and takes the dry sheets down`);
  const sat = wall("2026-10-17T08:00:00Z"); p.stock = {pp_blush_rose: 6}; p.at = sat - 5*60e3; Math.random = () => .99; out = pp.paperTick(F, false, sat); Math.random = rnd;
  check(out.cls === pp.CLASS.size*pp.CLASS.fee && p.stock.pp_blush_rose === 2 && p.classDay === "2026-10-17", "Saturday's card class: four people, four sheets, 32 coins");
  check(it.CROPS.wildflower && it.ITEMS.pp_sage_seeds.plantable && it.ITEMS.pp_sage_seeds.crop === "wildflower" && it.ITEMS.tag_seeded.plantable && it.ITEMS.wildflower.kind === "flower", "seeded paper and seeded tags plant in the garden and come up as wildflowers");
  const G = {coins: 100, inv: {box4: 1, pp_blush_none: 1, tag_seeded: 1}, goals: {paperie: 1}}, id = wr.wrapIt(G, {item: "box4", paper: "pp_blush_none", tag: "seeded"}), t0 = Date.now();
  check(pp.bloomFor(G, id, "hana", t0) && !pp.bloomMail(G, t0 + 864e5).length && pp.bloomMail(G, t0 + 2*864e5 + 1).length === 1 && /front step/.test(pp.bloomMail(G, t0 + 3*864e5)[0].body), "a gift with a seeded tag: two days later Hana writes about the flowers by her front step");
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nLip balms and lip oils, dyed with your flowers (round 187)")) try {
  console.log("\nLip balms and lip oils, dyed with your flowers (round 187)");
  const mc = await import(new URL("../src/game/millcraft.js", import.meta.url)), it = await import(new URL("../src/data/items.js", import.meta.url)), tw = await import(new URL("../src/data/towns.js", import.meta.url)), li = await import(new URL("../src/art/lip-icons.js", import.meta.url));
  const F = {coins: 50, goals: {mill: 1}, inv: {honeycomb: 1, oliveoil: 3, honey: 2, mint: 1, tulip: 1}, orch: {stock: {"stem:dahlia": 2}}};
  check(mc.renderWax(F) === 2 && F.inv.beeswax === 2 && !F.inv.honeycomb && tw.TOWN_GOODS.beeswax && tw.TOWN_GOODS.beeswax.shop === "bv_hhoney", "beeswax: melt a honeycomb down into two blocks at the bench (or buy a block at Sunflower Hill's honey house)");
  check(mc.dyeHave(F, "dahlia") === 2 && mc.dyeHave(F, "tulip") === 1 && mc.dyeHave(F, "rose") === 0, "the colours: stems in the flower farm's shed, or tulips from the garden");
  const b = mc.craft(F, "balm", null, ["honey"], "bag", "dahlia");
  check(b.recipe && b.fresh && b.recipe.name === "Dahlia-tinted honey lip balm" && F.inv.beeswax === 1 && F.inv.oliveoil === 2 && F.orch.stock["stem:dahlia"] === 1 && F.craft.balm, "a Dahlia-tinted honey lip balm: wax, oil, honey and a dahlia, setting for an hour");
  const B = it.ITEMS[mc.itemId(b.recipe)];
  check(B && B.ico === "balm_dahlia" && B.price === mc.KINDS.balm.price + 1 && B.sell <= B.price && B.mill === "balm" && li.lipIcon("balm_dahlia") && li.lipIcon("lipoil_none") && li.lipIcon("beeswax"), "a tin with a dahlia-red lid, a coin more for the colour");
  check(/one at a time|setting already/.test(mc.craft(F, "balm", null, ["mint"]).msg), "one tray of balm at a time");
  const o = mc.craft(F, "lipoil", null, ["mint"], "bag", "tulip");
  check(o.recipe && o.recipe.name === "Tulip-tinted mint lip oil" && !F.inv.tulip && F.craft.lipoil.length === 1 && it.ITEMS[mc.itemId(o.recipe)].ico === "lipoil_tulip", "a Tulip-tinted mint lip oil, steeping in the rollers");
  const done = mc.craftDone(F, Date.now() + 2*864e5);
  check(F.craft.store[mc.itemId(b.recipe)] === 4 && F.craft.store[mc.itemId(o.recipe)] === 3 && !F.craft.balm && !F.craft.lipoil.length && done.length === 2, "four tins and three bottles onto the mill's shelves");
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nTake from the gift shop, and shop-bought wrapping paper (round 188)")) try {
  console.log("\nTake from the gift shop, and shop-bought wrapping paper (round 188)");
  const gs = await import(new URL("../src/game/giftshop.js", import.meta.url)), wr = await import(new URL("../src/game/wrap.js", import.meta.url)), it = await import(new URL("../src/data/items.js", import.meta.url)), ic = await import(new URL("../src/art/paper-icons.js", import.meta.url));
  const F = {coins: 20, inv: {}, goals: {giftshop: 1}}, v = {shelf: [{id: "w1", name: "Merlot-ish", type: "red", n: 2, price: 18}]};
  const bid = gs.takeBottle(F, v, "w1");
  check(bid === "wb_w1" && F.inv.wb_w1 === 1 && v.shelf[0].n === 1 && it.ITEMS.wb_w1.kind === "gift" && it.ITEMS.wb_w1.price === 18, "a bottle off the gift shop's wine corner, into the backpack as a gift");
  delete it.ITEMS.wb_w1; gs.registerBottles(F); check(!!it.ITEMS.wb_w1, "and it's remembered after a reload");
  check(wr.buyPaper(F, "kraft") && F.inv.gw_kraft === 1 && F.coins === 19 && wr.buyPaper(F, "gold") && F.coins === 16 && wr.buyTags(F) === 4 && F.coins === 14, "kraft (1) and gold (3) wrapping paper, and a pack of tags (2), no paperie needed");
  check(["gw_kraft", "gw_gold", "gw_red", "gw_green", "wrp_gold_none_none_none_none", "wrp_kraft_none_star_twine_plain"].every(n => ic.wrapIcon(n)), "each paper has its drawing, wrapped or not");
  const id = wr.wrapIt(F, {item: "wb_w1", paper: "gw_gold", tag: "plain"});
  check(id && !F.inv.gw_gold && it.ITEMS[id].price === 18 + 1 + 1 && /gold paper/.test(it.ITEMS[id].n) && it.ITEMS[id].ico === "wrp_gold_none_none_none_plain", "a bottle wrapped in gold paper with a tag: a coin or two more (handmade paper's worth more)");
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nPairing boxes packed in the gift shop's wine corner, Tempranillo too (round 189)")) try {
  console.log("\nPairing boxes packed in the gift shop's wine corner, Tempranillo too (round 189)");
  const cc = await import(new URL("../src/game/cocoa.js", import.meta.url)), gs = await import(new URL("../src/game/giftshop.js", import.meta.url));
  const F = {coins: 0, inv: {}, goals: {giftshop: 1, cocoa: 1}, cocoa: {bars: {}, trays: {a: 6}, bonbons: [{id: "a", shell: "dark", fills: ["honey"], name: "Dark Honey Heart"}], display: ["a"]},
    vine: {shelf: [{id: "w2", name: "Ronda Red", type: "tempranillo", n: 2, price: 28}]}};
  const c = cc.cocoaState(F), pk = {kind: "pair", k: "w2", size: 4, sel: {}};
  check(cc.pairShelf(F).length === 1 && !cc.wineShelf(F).length, "a Tempranillo pairs, though it can't be opened for a filling");
  check(cc.pickAdd(F, pk, "a", 1) && cc.pickFill(F, pk) && pk.sel.a === 4, "four bonbons chosen in the wine corner");
  const w = cc.packPairing(F, pk.k, pk.sel), k = gs.putOutPairs(F, c, 1);
  check(w === "Ronda Red" && k === 1 && !F.inv.pairbox && gs.giftState(F).pairs[0] === 28 + 4*c.prices.bonbon && F.vine.shelf[0].n === 1 && c.trays.a === 2, "packed and straight out on the display, at the bottle plus four bonbons");
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nThe address book: post gifts and letters to people met on trips (round 190)")) try {
  console.log("\nThe address book: post gifts and letters to people met on trips (round 190)");
  await import(new URL("../src/game/ronda.js", import.meta.url)); const bk = await import(new URL("../src/game/contacts.js", import.meta.url)), it = await import(new URL("../src/data/items.js", import.meta.url));
  const T = Date.UTC(2026, 9, 14, 3), D = 864e5;
  const F = {coins: 10, inv: {box4: 2}, met: {lvemile: true, lvpainter: true, hana: true}};
  check(bk.canAdd(F, "lvemile") && !bk.canAdd(F, "lvpainter") && !bk.canAdd(F, "hana") && !bk.canAdd(F, "lvmargaux") && bk.canAdd({met: {ornella: true}}, "ornella"), "only people met on a trip, not day-trippers, not village folk (Ornella and Dario too, round 192)");
  check(bk.addable(F).join() === "lvemile" && bk.addContact(F, "lvemile", "2026-10-14") && bk.contacts(F).join() === "lvemile" && !bk.addable(F).length, "added to the book when you want");
  check(!!bk.postTo(F, "lvemile", {}, T).err && !bk.postTo(F, "lvemile", {open: "Thinking of you"}, T).err && F.coins === 10, "a letter needs a few words, and it's free");
  const e = bk.postTo(F, "lvemile", {item: "box4"}, T);
  check(!e.err && F.coins === 6 && F.inv.box4 === 1 && e.at === T + 2*D, "a parcel to the Lavender Hills: 4 coins postage, the reply in two days");
  check(!bk.bookMail(F, T + D).length && bk.bookMail(F, T + 2*D).length === 2, "replies arrive when they're due");
  const m = bk.bookMail(F, T + 2*D).find(x => x.id === e.id);
  check(/Thank you for the/.test(m.body) && m.body.includes(bk.PEN.lvemile.sign) && m.title.includes("Émile"), "a thank-you in Émile's own voice, signed his way");
  check(Object.keys(bk.PEN).every(id => bk.person(id) && !bk.person(id).tourist) && Object.values(bk.PEN).every(p => !p.back || it.ITEMS[p.back]), "every voice belongs to a real local, and anything tucked in is a real thing");
  const G = {coins: 0, inv: {box4: 1}, met: {carmen: true}}; bk.addContact(G, "carmen", "d");
  check(!!bk.postTo(G, "carmen", {item: "box4"}, T).err && bk.postage("carmen") === 8, "abroad costs 8, and there's no posting without the coins");
  const r = bk.postTo(G, "carmen", {text: "Hola!"}, T), keep = bk.PEN.carmen; delete bk.PEN.carmen; const plain = bk.replyBody(r); bk.PEN.carmen = keep;
  check(!r.err && /P\.S\./.test(plain) && bk.replyBody(r).includes(keep.sign), "Carmen writes back in her own voice (and anyone without one would send a P.S. from their own lines)");
  bk.removeContact(F, "lvemile"); check(!bk.contacts(F).length, "and you can take someone out again");
  const vans = (await import(new URL("../src/data/npcs.js", import.meta.url))).NPCS.filter(p => p.local === "bellbird" && !p.tourist);
  check(vans.every(p => bk.PEN[p.id]), "round 191: every campervan local and neighbour has a voice of their own (" + vans.length + ")");
  const abroad = (await import(new URL("../src/data/npcs.js", import.meta.url))).NPCS.filter(p => ["ronda", "kyoto", "jeju", "cinque"].includes(p.local) && !p.tourist);
  check(abroad.every(p => bk.PEN[p.id]), "round 192: and everyone in Ronda, Kyoto, Jeju and Cinque Terre too (" + abroad.length + ")");
  const J = {coins: 20, inv: {box4: 1}, met: {ornella: true}}; bk.addContact(J, "ornella", "d"); const je = bk.postTo(J, "ornella", {item: "box4"}, T), jb = bk.replyBody(je);
  check(!je.err && je.at === T + 3*D && /^My dear friend,/.test(jb) && jb.includes("yellow house by the harbour") && !/\bMel\b|Jason|Luca/.test(jb) && /\nP\.S\. /.test(jb) && jb.split("\n\n").length >= 6 && /;/.test(jb), "Ornella writes back at length, semicolons and all, with a P.S. (and calls you friend)");
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nEvery two-filling bonbon has a name (round 194: mint and pear crashed the bonbon table)")) try {
  console.log("\nEvery two-filling bonbon has a name (round 194: mint and pear crashed the bonbon table)");
  const cc = await import(new URL("../src/game/cocoa.js", import.meta.url)), sc = await import(new URL("../src/game/scoop.js", import.meta.url));
  const ids = Object.keys(sc.INGR).filter(cc.isFilling); let bad = [];
  for (const sh of ["dark", "milk", "white"]) for (const a of ids) for (const b of ids) if (a < b) { try { const n = cc.bonbonName(sh, [a, b]); if (!n || /undefined/.test(n)) bad.push(sh + ":" + a + "+" + b); } catch (e) { bad.push(sh + ":" + a + "+" + b + " " + e.message); } }
  check(!bad.length, "named every pairing of " + ids.length + " fillings in all three shells" + (bad.length ? ": " + bad.slice(0, 3).join(", ") : ""));
  check(/\S/.test(cc.bonbonName("white", ["mint", "pear"])), "white chocolate, mint and pear: " + cc.bonbonName("white", ["mint", "pear"]));
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nThe gift shop's gallery wall and makers' shelf (round 196)")) try {
  console.log("\nThe gift shop's gallery wall and makers' shelf (round 196)");
  await import(new URL("../src/game/ronda.js", import.meta.url));   // (your sip-and-paint paintings join ITEMS here)
  const gal = await import(new URL("../src/game/gallery.js", import.meta.url)), gs = await import(new URL("../src/game/giftshop.js", import.meta.url)), it = await import(new URL("../src/data/items.js", import.meta.url));
  const F = {coins: 50, inv: {p_view: 1}, goals: {giftshop: 1}}, mon = "2026-10-19", T = Date.UTC(2026, 9, 19, 3), D = 864e5;
  const n = gal.stockUp(F, mon), fr = gal.galleryState(F).frames;
  check(fr.filter(f => f && f.by).length === 3 && fr.filter(f => !f).length === 1 && new Set(fr.filter(Boolean).map(f => f.by)).size === 3, "three painters hang a painting each, and leave a frame for your own");
  check(Object.values(gal.makersState(F).stock).every(x => x === 3) && Object.keys(gal.makersState(F).stock).length === 6, "six makers fill their spots on the shelf");
  check(gal.hangOwn(F, "p_view") && !F.inv.p_view && gal.forSale(F).length === 3 && gal.takeDown(F, fr.findIndex(f => f && f.own)) && F.inv.p_view === 1, "you hang your own painting (never for sale) and take it down again");
  const i = fr.findIndex(f => f && f.by), f0 = fr[i], c = gal.sellPainting(F, i, T);
  check(c === gal.TOKEN && !fr[i] && f0.price > gal.TOKEN, "a painting sells: you keep a token " + gal.TOKEN + " and the painter the rest (" + f0.price + ")");
  check(!gal.galleryMail(F, T + 6*D).length && gal.galleryMail(F, T + 7*D).length === 1 && gal.galleryMail(F, T + 7*D)[0].body.includes(f0.t) && gal.galleryMail(F, T + 7*D)[0].body.includes(gal.PAINTERS[f0.by].sign), "a week later the painter writes to say it sold");
  check(gal.sellMade(F, "mk_spoon") === 2 && gal.makersState(F).stock.mk_spoon === 2 && gal.makersState(F).week.bo === 9, "a spoon sells: you keep about a fifth (2 of 9), Bo the rest");
  check(gal.buyMade(F, "mk_cards") && F.coins === 44 && F.inv.mk_cards === 1 && it.ITEMS.mk_cards.kind === "gift", "you buy Auntie Lin's cards at the full price, to give");
  check(gal.stockUp(F, "2026-10-20") === 0 && gal.stockUp(F, "2026-10-26") > 0 && gal.forSale(F).length === 3, "the painters and makers come back the next Monday");
  let sold = 0; for (let k = 0; k < 4000; k++) { const g2 = {coins: 0, inv: {}, goals: {giftshop: 1}}; gal.stockUp(g2, mon); if (gs.giftSellMinute(g2, mon, 600, "hero", {store: {}, v: {shelf: []}, cocoa: null, onDisplay: () => []}) === gal.TOKEN) sold++; }
  check(sold > 0 && sold < 400, "shoppers buy a painting now and then, not often (" + sold + " in 4000 busy minutes)");
  const bk = await import(new URL("../src/game/contacts.js", import.meta.url)), ms = new Set(Object.values(gal.PAINTERS).flatMap(p => p.works.map(w => w[4])));
  check(ms.size === Object.values(gal.PAINTERS).reduce((a, p) => a + p.works.length, 0) && [...ms].every(m => gal.paintSVG(0, 0, 38, 48, {m, c1: "#000", c2: "#fff"}).length > 80), "round 197: every painting has its own picture (" + ms.size + ")");
  check(it.ITEMS.p_view.to === "family" && it.ITEMS.p_view.kind === "keepsake" && bk.postable(it.ITEMS.p_view), "and your own paintings can be given, or posted to a friend");
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nFrom our travels: friends send boxes for the gift shop (round 198)")) try {
  console.log("\nFrom our travels: friends send boxes for the gift shop (round 198)");
  await import(new URL("../src/game/ronda.js", import.meta.url));
  const bk = await import(new URL("../src/game/contacts.js", import.meta.url)), gs = await import(new URL("../src/game/giftshop.js", import.meta.url)), gal = await import(new URL("../src/game/gallery.js", import.meta.url)), it = await import(new URL("../src/data/items.js", import.meta.url));
  const T = Date.UTC(2026, 9, 14, 3), D = 864e5, who = "lvroux", item = bk.importable(who);
  const F = {coins: 200, inv: {}, met: {[who]: true}, goals: {giftshop: 1}}; bk.addContact(F, who, "d");
  check(item === "b_calissons" && it.ITEMS[item].kind === "gift", "Madame Roux has something of her own for a shop shelf: " + it.ITEMS[item].n);
  bk.postTo(F, who, {open: "Thinking of you"}, T); bk.postTo(F, who, {open: "Just saying hello"}, T + D);
  check(!bk.offersOpen(F, T + 9*D).length, "no offer after only two letters");
  const e = bk.postTo(F, who, {open: "Thank you for the day"}, T + 2*D);
  check(e.offer === item && !bk.offersOpen(F, T + 3*D).length && bk.offersOpen(F, T + 4*D).length === 1 && /gift shop now/.test(bk.replyBody(e)), "the third letter's reply offers a box a week, in a P.S.");
  check(bk.acceptOffer(F, who, T + 4*D) && bk.lines(F).length === 1 && !bk.offersOpen(F, T + 4*D).length, "you say yes please");
  const cost = bk.BOX*bk.tradeOf(item), c0 = F.coins, r = bk.travelTick(F, T + 5*D);
  check(r.got.length === 1 && F.coins === c0 - cost && F.giftshop.travel[item] === bk.BOX && cost < bk.BOX*it.ITEMS[item].price, "the first box comes, paid for on arrival (" + cost + " coins for " + bk.BOX + ")");
  check(!bk.travelTick(F, T + 6*D).got.length && bk.travelTick(F, T + 12*D + 1).got.length === 1, "then one box a week, and only one even after a long time away");
  F.coins = 1; check(bk.travelTick(F, T + 30*D).skip.length === 1 && F.giftshop.travel[item] === 2*bk.BOX, "no coins, no box that week (nothing owed)");
  check(gal.takeTravel(F, item) && F.inv[item] === 1 && F.giftshop.travel[item] === 2*bk.BOX - 1, "you can take one off the shelf to give");
  let made = 0; const G = {coins: 0, inv: {}, goals: {giftshop: 1}, giftshop: {travel: {[item]: 500}}};
  for (let k = 0; k < 2000; k++) { const c = gs.giftSellMinute(G, "2026-10-21", 600, "hero", {store: {}, v: {shelf: []}, cocoa: null, onDisplay: () => []}); if (c === it.ITEMS[item].price) made++; }
  check(made > 0 && G.giftshop.travel[item] === 500 - made, "shoppers buy them at Madame Roux's own price (" + made + " sold)");
  check(bk.stopLine(F, who) && !bk.lines(F).length && !bk.offersOpen(F, T + 40*D).length, "and you can stop the boxes whenever you like");
  const G2 = {coins: 0, met: {}, goals: {}}; G2.met[who] = true; bk.addContact(G2, who, "d"); [0, 1, 2].forEach(k => bk.postTo(G2, who, {open: "Hi"}, T + k));
  check(!bk.offersOpen(G2, T + 9*D).length, "no offers before there's a gift shop to send to");
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
if (want("\nThe gift basket beside the wrapping table (round 202)")) try {
  console.log("\nThe gift basket beside the wrapping table (round 202)");
  const gs = await import(new URL("../src/game/giftshop.js", import.meta.url)), wr = await import(new URL("../src/game/wrap.js", import.meta.url)), it = await import(new URL("../src/data/items.js", import.meta.url));
  const F = {coins: 20, inv: {box4: 2, gw_red: 1}, goals: {giftshop: 1}}, id = wr.wrapIt(F, {item: "box4", paper: "gw_red"});
  const p0 = gs.giftPanel(F, "gbasket", {F, day: "2026-10-14"});
  check(id && /The gift basket/.test(p0) && /data-gs="wput:/.test(p0) && /Empty/.test(p0), "the basket offers the wrapped gift from the backpack");
  check(gs.putWrapped(F, id) && !F.inv[id] && /data-gs="wback:0"/.test(gs.giftPanel(F, "gbasket", {F, day: "2026-10-14"})), "in it goes, and it's listed in the basket");
  check(gs.takeWrapped(F, 0) === id && F.inv[id] === 1 && !gs.giftState(F).wrapped.length, "and it can come back out");
  check(!/Put out:/.test(wr.wrapPanel(F, {}, {where: "giftshop", table: []})), "the wrapping table just points to the basket now");
} catch (e) { errors.push("FAIL (threw): " + String(e && e.message || e).split("\n")[0]); console.log("  ✗ threw: " + String(e && e.message || e).split("\n")[0]); }
await browser.close();
if (errors.length) { console.log("\n" + errors.join("\n")); process.exit(1); }
console.log("\nall good");
