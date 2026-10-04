// Headless smoke test: builds the dev page, plays through the core loop with the stub, fails on any page error.
//   node test/smoke.mjs            (screenshots land in test/shots/)
import { execSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
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
const errors = [];
const check = (cond, msg) => { if (!cond) { errors.push("FAIL: " + msg); console.log("  ✗ " + msg); } else console.log("  ✓ " + msg); };

for (const vp of [{ name: "phone", width: 390, height: 844 }, { name: "desktop", width: 1280, height: 900 }]) {
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
  check(await page.locator("#journal h1").textContent().then(t => /Five-minute clean/.test(t)), "day opens with the five-minute clean");
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
    check(await page.locator(".scenebar .hbtn").count() === 6, "six drawn icons in the corner (calendar, quests, backpack, friendship, letters, settings)");
    check(!(await page.locator(".hbtn").first().textContent()).match(/\p{Extended_Pictographic}/u), "corner icons are drawn, not emoji");
  } else check(await page.locator("#map .hudbar").count() === 1, "trackers sit on the map");
  check(lay.fits, "the whole game fits on screen without scrolling");
  check(lay.note, "the quest note is pinned on the map");
  check(await page.locator(".hudbar .pbar").count() === 2, "water and steps are drawn progress bars");
  await page.click('[data-track="water"]');
  await page.click('#notebook [data-nb="w"]');
  await page.click('#notebook [data-nb="w"] >> nth=1');
  check(await page.locator("#nbTitle").textContent().then(t => /0[.,]75 L/.test(t)), "water note adds a glass and a bottle (750 ml)");
  await page.fill("#nbTrack", "1000"); await page.click('#notebook [data-nb="wset"]');
  check(await page.locator("#waterNote").textContent().then(t => /^1L/.test(t)), "water total can be typed in");
  await page.click('[data-track="steps"]');
  await page.fill("#nbTrack", "2500"); await page.click('#notebook [data-nb="sset"]');
  check(await page.locator("#stepNote").textContent().then(t => /2.5k/.test(t)), "steps can be typed in from the steps note");

  // Clean: walk to cupboard, get wipe, done
  await page.click('#journal [data-a="walk"]');
  await page.waitForFunction(() => document.querySelector('#journal [data-a="gotWipe"]'), null, { timeout: 15000 });
  await page.click('#journal [data-a="gotWipe"]');
  await page.click('#journal [data-a="cleanDone"]');
  await page.waitForTimeout(300);
  check(await page.locator("#journal h1").textContent().then(t => /Chord onboarding/.test(t)), "first quest comes from the plan");

  await page.click('#journal [data-a="walk"]');
  await page.waitForFunction(() => document.querySelector('#journal [data-a="notebook"]'), null, { timeout: 20000 });
  check(true, "walked to the quest spot and the Do task button shows");
  await page.click('#journal [data-a="notebook"]');
  await page.waitForTimeout(400);
  check(await page.locator("#notebook").isVisible(), "notebook overlay opens");
  check(await page.locator("#notebook").textContent().then(t => /brand colour picker/.test(t)), "notebook shows the Sunsama notes");
  await page.screenshot({ path: join(shots, `${vp.name}-2-notebook.png`) });
  await page.click('#notebook [data-nb="started"]');
  await page.waitForTimeout(200);
  check(await page.locator("#notebook .nbtimer").count() > 0, "Started starts the time box inside the notebook");
  await page.click('#notebook [data-tctl="pause"]');
  await page.waitForTimeout(1300);
  const t1 = await page.locator("#notebook .nbtimer [data-tleft]").textContent();
  await page.waitForTimeout(1200);
  check(await page.locator("#notebook .nbtimer").textContent().then(t => /paused/.test(t)) && t1 === await page.locator("#notebook .nbtimer [data-tleft]").textContent(), "the time box can be paused");
  await page.click('#notebook [data-tctl="play"]');
  await page.click('#notebook [data-tctl="reset"]');
  check(await page.locator('#notebook [data-tctl="pause"]').count() === 1, "and resumed and restarted");
  await page.click('#notebook [data-nb="halfway"]');
  await page.click('#notebook [data-nb="more"]');
  await page.click('#notebook [data-nb="stuck"]');
  await page.waitForTimeout(200);
  await page.screenshot({ path: join(shots, `${vp.name}-3-stuck.png`) });
  const ask = page.locator('#notebook [data-nb="ask"]');
  if (await ask.count()) {
    await page.fill("#nbAsk", "How do I start?");
    await ask.click();
    await page.waitForTimeout(4500);
    check(await page.locator("#notebook .nbchat").textContent().then(t => /dev stub/.test(t)), "talk-to-the-note answers via sample");
  }
  await page.click('#notebook [data-nb="done"]');
  await page.waitForTimeout(400);
  check(!(await page.locator("#notebook").isVisible()), "Done closes the notebook");
  check(await page.locator("#journal h1").textContent().then(t => /break/i.test(t)), "a break follows the quest");
  await page.click('#journal [data-a="back"]');
  await page.waitForTimeout(300);

  // Email quest
  await page.click('#journal [data-a="walk"]');
  await page.waitForFunction(() => document.querySelector('#journal [data-a="notebook"]'), null, { timeout: 25000 });
  await page.click('#journal [data-a="notebook"]');
  await page.waitForTimeout(300);
  check(await page.locator('#notebook a[href^="https://mail.google.com"]').count() > 0, "email quest links out to Gmail");
  await page.screenshot({ path: join(shots, `${vp.name}-4-email.png`) });
  await page.click('#notebook [data-nb="started"]');
  await page.click('#notebook [data-nb="done"]');
  await page.waitForTimeout(300);
  await page.click('#journal [data-a="back"]');
  await page.waitForTimeout(300);

  // Treadmill quest: notebook offers the treadmill, Mel walks home to it, steps prompt afterwards
  check(await page.locator("#journal h1").textContent().then(t => /Chico beta/.test(t)), "third quest is the treadmill-able one");
  await page.click('#journal [data-a="walk"]');
  await page.waitForFunction(() => document.querySelector('#journal [data-a="notebook"]'), null, { timeout: 25000 });
  await page.click('#journal [data-a="notebook"]');
  await page.click('#notebook [data-nb="treadmill"]');
  await page.waitForTimeout(300);
  check(!(await page.locator("#notebook").isVisible()), "choosing the treadmill closes the notebook and walks");
  await page.waitForFunction(() => document.querySelector('#journal [data-a="notebook"]'), null, { timeout: 30000 });
  check(await page.locator("#sceneName").textContent().then(t => /Home/.test(t)), "treadmill quest moved to home");
  await page.click('#journal [data-a="notebook"]');
  await page.click('#notebook [data-nb="started"]');
  await page.waitForTimeout(400);
  check(await page.locator("#mel").getAttribute("class").then(c => /walk/.test(c)), "Mel walks in place on the treadmill");
  await page.screenshot({ path: join(shots, `${vp.name}-6-treadmill.png`) });
  await page.click('#notebook [data-nb="done"]');
  await page.waitForTimeout(300);
  check(await page.locator("#journal").textContent().then(t => /Log my steps/.test(t)), "treadmill quest asks for steps");

  // Quest board opens as a cork board on the map
  await page.click('[data-open="quests"]');
  await page.waitForTimeout(400);
  check(await page.locator("#panel.cork #list li").count() > 0, "quest board opens as a cork board in the game");
  await page.screenshot({ path: join(shots, `${vp.name}-9-cork.png`) });
  await page.click("#pclose");
  check(await page.locator("#panel").isHidden(), "closing the board returns to the map");
  await page.click('[data-open="friend"]');
  check(await page.locator("#friendView .hearts .ico").count() === 5, "friendship has its own corner icon and drawn hearts");
  await page.click("#pclose");

  // Library digest shelf: first read is free, the second is locked until an hour passes or a quest is done
  await page.evaluate(() => document.querySelector("#world [data-exit]") && document.querySelector("#world [data-exit]").dispatchEvent(new MouseEvent("click", {bubbles: true})));
  await page.waitForFunction(() => /Town square|Home base/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  if (await page.locator('#journal [data-qn="min"]').count()) await page.click('#journal [data-qn="min"]');
  if (/Home base/.test(await page.locator("#sceneName").textContent())) {
    check(await page.locator('#world [data-place="pond"]').count() === 1 && await page.locator('#world [data-place="shed"]').count() === 1, "home base has the pond and the shed");
    await page.screenshot({ path: join(shots, `${vp.name}-4-base.png`) });
    await page.locator('#world [data-place="toTown"]').dispatchEvent("click");
    await page.waitForFunction(() => /Town square/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
    check(await page.locator('#world [data-place="pond"]').count() === 0, "the bridge crosses the river to the town square");
  }
  await page.locator('#world [data-place="fresh"]').first().dispatchEvent("click");
  await page.waitForFunction(() => /library/i.test(document.querySelector("#sceneName").textContent), null, { timeout: 25000 });
  await page.waitForTimeout(400);
  await page.locator('#world [data-spot="digest"]').dispatchEvent("click");
  await page.waitForFunction(() => document.querySelector('#ctx [data-dig="next"]'), null, { timeout: 20000 });
  await page.click('#ctx [data-dig="next"]');
  await page.waitForTimeout(300);
  check(await page.locator("#notebook").textContent().then(t => /Show Your Work/.test(t)), "digest shelf hands out a book digest");
  await page.screenshot({ path: join(shots, `${vp.name}-7-digest.png`) });
  await page.click('#notebook [data-nb="thanks"]');
  await page.waitForTimeout(200);
  check(await page.locator("#ctx").textContent().then(t => /Next digest in/.test(t)), "the next digest is rationed");

  // Morning briefing as a gazette
  await page.click('[data-open="mail"]');
  await page.locator('#mailList [data-mail]').last().click();
  await page.waitForTimeout(300);
  check(await page.locator("#nbPage.news .nmast").count() > 0, "morning briefing opens as The Morning Crier newspaper");
  await page.screenshot({ path: join(shots, `${vp.name}-8-briefing.png`) });
  await page.click('#notebook [data-nb="thanks"]');

  // NPCs + mail
  await page.waitForTimeout(500);
  check(await page.locator("#actors [data-npc]").count() > 0, "villagers are out and about");
  await page.screenshot({ path: join(shots, `${vp.name}-5-village.png`) });
  await page.close();
}
// Darren: Monday lunchtime he's fixing the house at home base; mid-morning he's typing at his desk indoors
{
  console.log("\ndarren");
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on("pageerror", e => errors.push(`darren pageerror: ${e.message}`));
  await page.goto(url + "?reset=1&seed=1&nosample=1&time=12:45&date=2026-10-05");
  await page.waitForTimeout(1200);
  check(await page.locator('#actors [data-npc="darren"].act-repair').count() === 1, "Darren is repairing the house at lunchtime");
  await page.screenshot({ path: join(shots, "darren-base.png") });
  await page.click('[data-open="settings"]');
  await page.fill("#paperNameIn", "The Maple Gazette");
  await page.click("#paperSave");
  await page.click("#pclose");
  check(await page.locator("#paperIn").isVisible(), "the morning paper is sticking out of the letterbox at home");
  await page.locator('#world [data-place="letterbox"]').dispatchEvent("click");
  await page.waitForSelector("#nbPage.news .nmast", { timeout: 15000 });
  check(await page.locator("#nbTitle").textContent() === "The Maple Gazette", "tapping the letterbox opens the paper, under the name chosen in Settings");
  await page.click('#notebook [data-nb="thanks"]');
  await page.waitForTimeout(300);
  check(await page.locator("#paperIn").isHidden(), "once read, the letterbox is empty");
  await page.click('[data-open="quests"]');
  const before = await page.locator("#list li:not(.dropped)").count();
  await page.locator("#list [data-drop]").last().click();
  await page.waitForTimeout(200);
  check(await page.locator("#list li:not(.dropped)").count() === before - 1 && await page.locator("#list li.dropped").count() === 1, "a quest that's no longer needed can be dropped for today");
  await page.locator("#list [data-undrop]").click();
  await page.waitForTimeout(200);
  check(await page.locator("#list li:not(.dropped)").count() === before, "and brought back");
  await page.click("#pclose");
  await page.locator('#world [data-place="shed"]').dispatchEvent("click");
  await page.waitForFunction(() => /Darren's shed/.test(document.querySelector("#ctx").textContent), null, { timeout: 15000 });
  check(await page.locator("#ctx [data-tool]").count() === 3, "the shed sells three garden tools");
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
  check(await page.locator('#actors [data-npc="darren"].act-type').count() === 1, "Darren is typing at the home office desk on a weekday morning");
  await page.screenshot({ path: join(shots, "darren-desk.png") });
  await page.close();
}
// Family gifts: buy keepsakes and treats at the market, give them in person at home
{
  console.log("\nfamily gifts");
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on("pageerror", e => errors.push(`family pageerror: ${e.message}`));
  await page.goto(url + "?reset=1&seed=1&nosample=1&time=10:00&date=2026-10-05");
  await page.waitForTimeout(600);
  await page.waitForTimeout(900);
  await page.evaluate(() => { const f = JSON.parse(localStorage.getItem("fox.fox")); f.coins = 400; f.updatedAt = Date.now() + 1e6;
    localStorage.setItem("fox.fox", JSON.stringify(f)); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, JSON.stringify(f))); });
  await page.goto(url + "?seed=1&nosample=1&time=10:00&date=2026-10-05");
  await page.waitForTimeout(700);
  await page.locator('#world [data-place="toTown"]').dispatchEvent("click");
  await page.waitForFunction(() => /Town square/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  await page.waitForTimeout(300);
  await page.locator('#world [data-place="market"]').dispatchEvent("click");
  await page.waitForSelector('#ctx [data-shop="family"]', { timeout: 20000 });
  await page.click('#ctx [data-shop="family"]');
  for (const id of ["sandpit", "truck", "headphones", "hammock", "icecream", "kopi"]) { await page.click(`#ctx .item[data-id="${id}"]`); await page.waitForTimeout(150); }
  check(await page.locator('#ctx .item[data-id="hammock"]').textContent().then(t => /at home/.test(t)), "keepsakes are bought once and go home");
  await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&nosample=1&time=10:00&date=2026-10-05");
  await page.waitForTimeout(800);
  check(await page.locator("#evanHold rect").count() > 0, "Evan carries his toy truck");
  check(await page.locator("#sceneArt").innerHTML().then(h => /Sandpit/.test(h)), "the sandpit is at home base");
  await page.click('[data-open="bag"]');
  await page.click('#bag .item[data-id="icecream"]');
  await page.waitForTimeout(300);
  check(await page.locator("#evanHold path").count() > 0 && await page.locator("#evanSay").textContent().then(t => /ICE CREAM/.test(t)), "Evan gets his ice cream");
  check(await page.locator("#panel").isHidden() && await page.locator("#evanSay .who").textContent() === "Evan", "the backpack closes so you can see Evan say thank you, with his name on the bubble");
  await page.click('[data-open="bag"]');
  await page.click('#bag .item[data-id="kopi"]');
  check(await page.locator("#speech").textContent().then(t => /Darren/.test(t)), "Darren's gift waits until you find him");
  await page.goto(url + "?seed=1&nosample=1&time=20:00&date=2026-10-05");
  await page.waitForTimeout(1000);
  check(await page.locator('#actors [data-npc="darren"].act-rest').count() === 1, "Darren rests in his hammock in the evening");
  await page.screenshot({ path: join(shots, "family-evening.png") });
  await page.close();
}
// Hestia at home: chores in the cleaning cupboard, pantry in the fridge, import from a Hestia export
{
  console.log("\nhestia");
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on("pageerror", e => errors.push(`hestia pageerror: ${e.message}`));
  await page.goto(url + "?reset=1&seed=1&nosample=1&time=19:30&date=2026-10-05");
  await page.waitForTimeout(800);
  check(await page.locator("#hmarks .hmark").count() === 1, "a hearth badge on the house shows home chores waiting");
  await page.locator('#world [data-place="home"]').dispatchEvent("click");
  await page.waitForFunction(() => /^Home/.test(document.querySelector("#sceneName").textContent.trim()) && !/base/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  await page.waitForTimeout(400);
  // the first visit is the five-minute clean (grab a wet wipe); after that the cupboard opens Hestia's chores
  await page.locator('#world [data-spot="cupboard"]').dispatchEvent("click");
  await page.waitForTimeout(3000);
  if (!(await page.locator('#journal [data-a="gotWipe"]').count())) await page.click('#journal [data-qn="open"]').catch(() => {});
  await page.click('#journal [data-a="gotWipe"]');
  await page.locator('#world [data-spot="cupboard"]').dispatchEvent("click");
  await page.waitForFunction(() => /cleaning cupboard/i.test((document.querySelector("#ctx h2") || {}).textContent || ""), null, { timeout: 15000 });
  check(/cleaning cupboard/i.test(await page.locator("#ctx h2").textContent()), "the cleaning cupboard opens Hestia's chores");
  await page.locator('#ctx [data-hdone^="daily:"]').first().click();   // one tap (ticked chores move to the bottom)
  await page.waitForTimeout(300);
  check(/\+1 coins: home chore/.test(await page.locator("#earn").textContent()), "ticking a chore earns a coin");
  // after a reload the cloud copy loads (frozen, like the real database): ticking must still stick, and a delete can be undone
  await page.waitForTimeout(1200);
  await page.goto(url + "?seed=1&nosample=1&time=19:30&date=2026-10-05"); await page.waitForTimeout(900);
  await page.locator('#world [data-place="home"]').dispatchEvent("click");
  await page.waitForFunction(() => /^Home/.test(document.querySelector("#sceneName").textContent.trim()) && !/base/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  await page.waitForTimeout(400);
  await page.locator('#world [data-spot="cupboard"]').dispatchEvent("click");
  await page.waitForFunction(() => /cleaning cupboard/i.test((document.querySelector("#ctx h2") || {}).textContent || ""), null, { timeout: 15000 });
  const box = page.locator('#ctx [data-hdone^="daily:"]:not(:checked)').first(), boxId = await box.getAttribute("data-hdone");
  await box.click(); await page.waitForTimeout(1500);
  check(await page.locator(`#ctx [data-hdone="${boxId}"]`).isChecked(), "a ticked chore stays ticked after the cloud copy loads");
  const n0 = await page.locator('#ctx [data-hdel^="daily:"]').count();
  await page.locator('#ctx [data-hdel^="daily:"]').first().click(); await page.waitForTimeout(200);
  check(await page.locator('#ctx [data-hdel^="daily:"]').count() === n0 - 1 && await page.locator("#undoBar").isVisible(), "removing a chore offers Undo");
  await page.click("#undoBtn"); await page.waitForTimeout(200);
  check(await page.locator('#ctx [data-hdel^="daily:"]').count() === n0, "and Undo puts it back");
  await page.click('#ctx [data-htab="zone"]');
  check(await page.locator("#ctx .hzone").textContent().then(t => /Living Room/.test(t)), "this week's zone is on its own tab");
  await page.click('#ctx [data-htimer="10"]');
  check(await page.locator("#ctx [data-htleft]").count() === 1, "the tidy timer runs from the cupboard");
  await page.locator('#world [data-spot="fridge"]').dispatchEvent("click");
  await page.waitForFunction(() => /fridge/i.test(document.querySelector("#ctx h2") && document.querySelector("#ctx h2").textContent), null, { timeout: 15000 });
  await page.fill('#ctx form[data-hitem] input[name="t"]', "Oat milk");
  await page.click('#ctx form[data-hitem] button');
  await page.locator('#ctx [data-hstock]').first().uncheck();
  await page.click('#ctx [data-hfr="shop"]');
  check(await page.locator("#ctx [data-hbuy]").count() === 1, "running out puts it on the shopping list in the fridge");
  await page.screenshot({ path: join(shots, "hestia-fridge.png") });
  await page.click("#pclose");
  // import a Hestia export
  const exp = { zones: [{ id: 9, name: "Kitchen", icon: "kitchen", tasks: [{ text: "Wipe counters", effort: 1 }] }], dailyTasks: [{ id: "d1", text: "Feed the cat", effort: 1, timeOfDay: "morning" }],
    weeklyTasks: [{ id: "w1", text: "Bins out", effort: 1, weekday: 1 }], pantryItems: [{ id: 1, name: "Rice", category: "food", whereToBuy: "supermarket", inStock: false }], shoppingList: [{ id: 1, purchased: false }] };
  await page.click('[data-open="settings"]');
  await page.setInputFiles("#hestiaFile", { name: "mise-en-place-backup.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(exp)) });
  await page.waitForTimeout(400);
  check(await page.locator("#hestiaNote").textContent().then(t => /Imported: 1 daily, 1 weekly, 1 zones, 1 pantry/.test(t)), "a Hestia export imports chores, zones and pantry");
  await page.click("#pclose");
  await page.locator('#world [data-spot="cupboard"]').dispatchEvent("click");
  await page.waitForTimeout(500);
  await page.screenshot({ path: join(shots, "hestia-cupboard.png") });
  await page.close();
}
// Talk to Maple: the chat button, and actions landing in the game
{
  console.log("\ntalk to maple");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`chat pageerror: ${e.message}`));
  await page.goto(url + "?reset=1&seed=1&time=10:30&date=2026-10-05");
  await page.waitForTimeout(800);
  check(await page.locator("#chatBtn").isVisible(), "a chat button sits on the map");
  await page.click("#chatBtn");
  await page.fill("#chatIn", "add oat milk and eggs to the shopping list");
  await page.click("#chatForm button");
  await page.waitForSelector("#chatLog .did", { timeout: 10000 });
  check(await page.locator("#chatLog .did").first().textContent().then(t => /oat milk, eggs/i.test(t)), "asking Maple adds things to the shopping list");
  await page.fill("#chatIn", "I need a break");
  await page.click("#chatForm button");
  await page.waitForFunction(() => document.querySelectorAll("#chatLog .did").length >= 2, null, { timeout: 10000 });
  await page.fill("#chatIn", "remind me to get the laundry in in 1 hour"); await page.click("#chatForm button");
  await page.waitForFunction(() => document.querySelectorAll("#chatLog .did").length >= 3, null, { timeout: 10000 });
  check(/isn't reachable/.test(await page.locator("#chatLog .did").last().textContent()), "without the calendar, Maple says the reminder couldn't be set (no false promise)");
  await page.screenshot({ path: join(shots, "chat-phone.png") });
  await page.click("#pclose");
  await page.waitForTimeout(300);
  check(await page.locator("#journal").textContent().then(t => /break/i.test(t)), "and a break she asks for starts in the game");
  await page.close();
}
// Maple knows Mel's plans: the Notion "Plans" pages for this week, month and quarter go into the chat
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`plans pageerror: ${e.message}`));
  await page.goto(url + "?reset=1&seed=1&notion=1&time=10:30&date=2026-10-05");
  await page.waitForTimeout(800);
  await page.click("#chatBtn");
  await page.fill("#chatIn", "what's my focus this week?"); await page.click("#chatForm button");
  await page.waitForFunction(() => /Week of 5 Oct 2026/.test(window.__lastPrompt || ""), null, { timeout: 10000 }).catch(() => {});
  const pr = await page.evaluate(() => window.__lastPrompt || "");
  check(/== Week of 5 Oct 2026 ==/.test(pr) && /== October 2026 ==/.test(pr) && /== Q4 2026 ==/.test(pr) && /fill the Visibility Fix/.test(pr), "Maple reads this week's, month's and quarter's plans from Notion when asked");
  await page.close();
}
// Post box: unread work mail at the post office (Gmail connector, faked by the stub)
{
  console.log("\npost box");
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on("pageerror", e => errors.push(`post pageerror: ${e.message}`));
  await page.goto(url + "?reset=1&seed=1&nosample=1&sunsama=1&time=10:30&date=2026-10-05");
  await page.waitForTimeout(700);
  await page.locator('#world [data-place="toTown"]').dispatchEvent("click");
  await page.waitForFunction(() => /Town square/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  await page.locator('#world [data-place="post"]').dispatchEvent("click");
  await page.waitForFunction(() => /Post office/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  await page.waitForTimeout(500);
  await page.locator('#world [data-spot="pobox"]').dispatchEvent("click");
  await page.waitForFunction(() => document.querySelectorAll("#ctx .hlist.post li").length === 2, null, { timeout: 15000 });
  check(await page.locator("#ctx .hlist.post li a").first().getAttribute("href").then(h => /mail\.google\.com/.test(h)), "the post box lists unread work mail, each opening in Gmail");
  await page.screenshot({ path: join(shots, "postbox.png") });
  await page.close();
}
// Feeds from other routines: bug-check health signs and the content calendars
{
  console.log("\nfeeds");
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on("pageerror", e => errors.push(`feeds pageerror: ${e.message}`));
  await page.goto(url + "?reset=1&seed=1&nosample=1&time=10:30&date=2026-10-05");
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    const at = Date.now();
    localStorage.setItem("stub:data/users/me/health-chord", JSON.stringify({app: "chord", at, status: "amber", headline: "211 of 212 tests green",
      checks: [{name: "Unit tests", state: "pass", detail: "212/212"}, {name: "E2E onboarding", state: "warn", detail: "1 flaky"}, {name: "Errors (24h)", state: "pass", detail: "0 new"}], link: "https://claude.ai/artifact/P5hPqeNgPURfqecbbXMpxd"}));
    const d = k => { const x = new Date(Date.now() + (window.__mapleOffset || 0) + 8*3600e3 - 2*3600e3); x.setUTCDate(x.getUTCDate() + k); return x.toISOString().slice(0, 10); };
    localStorage.setItem("stub:data/users/me/content-chord", JSON.stringify({brand: "chord", at, items: [{date: d(0), time: "09:00", channel: "Instagram", title: "3 signs your client portal is costing you", status: "scheduled"}, {date: d(2), channel: "Blog", title: "HoneyBook alternatives outside the US", status: "draft"}]}));
    localStorage.setItem("stub:data/users/me/goodnews", JSON.stringify({at, world: [{title: "Coral reef bounces back", summary: "Scientists report record recovery.", source: "Example News", link: "https://example.com/reef"}], wins: ["Chord added 2 studios this week"]}));
    localStorage.setItem("stub:data/users/me/content-ambidextrous", JSON.stringify({brand: "ambidextrous", at, items: [{date: d(1), channel: "LinkedIn", title: "What I do and what Claude does", status: "idea"}]}));
  });
  await page.goto(url + "?nosample=1&time=10:30&date=2026-10-05");
  await page.waitForTimeout(700);
  await page.click('[data-open="cal"]');
  await page.click('[data-caltab="content"]');
  check(await page.locator("#calBody .hlist.content li").count() === 3, "the content tab shows both calendars' next two weeks");
  await page.click('[data-cbrand="chord"]');
  check(await page.locator("#calBody .hlist.content li").count() === 2, "and can show one brand at a time");
  await page.screenshot({ path: join(shots, "content-calendar.png") });
  await page.click("#pclose");
  await page.locator('#world [data-place="toTown"]').dispatchEvent("click");
  await page.waitForFunction(() => /Town square/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  await page.waitForTimeout(300);
  await page.locator('#world [data-place="news"]').dispatchEvent("click");
  await page.waitForFunction(() => /Good news/.test((document.querySelector("#ctx h2") || {}).textContent || ""), null, { timeout: 15000 });
  check(await page.locator("#ctx .hlist.gnews.world li").count() === 1 && await page.locator("#ctx").textContent().then(t => /Chord added 2 studios/.test(t)), "the good news board shows the world's good news and your wins");
  await page.screenshot({ path: join(shots, "good-news.png") });
  await page.click("#pclose");
  await page.locator('#world [data-place="toLane"]').dispatchEvent("click");
  await page.waitForFunction(() => /Makers/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  await page.waitForTimeout(300);
  check(await page.locator('#sceneArt circle[fill="#F3B54A"]').count() >= 1, "Chord lives on Makers' Lane, through the town's east gate, wearing an amber light");
  await page.locator('#world [data-place="chord"]').dispatchEvent("click");
  await page.waitForFunction(() => /Chord/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  await page.waitForTimeout(400);
  check(await page.locator("#sceneArt").textContent().then(t => /WATCH/.test(t)), "the health sign in the Chord workshop reads the bug check");
  await page.locator('#world [data-spot="status"]').dispatchEvent("click");
  await page.waitForFunction(() => /Chord health/.test((document.querySelector("#ctx h2") || {}).textContent || ""), null, { timeout: 15000 });
  check(await page.locator("#ctx .hlist.checks li").count() === 3, "tapping the sign shows each check");
  await page.screenshot({ path: join(shots, "health-sign.png") });
  await page.close();
}
// Animals: buy chicks and bunnies at the market, feed them in the run at home, upgrade the run; Pancake at the news board
{
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
  check(await page.locator('#ctx [data-decor="r_lights"]').count() === 1 && await page.locator('#ctx [data-decor="me_bow"]').count() === 1, "the market sells things for Mel and her room");
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
}
// Saving: a browser with no copy of its own (like the Claude app after a refresh) must load the cloud save, never overwrite it
{
  console.log("\nsaving");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`saving pageerror: ${e.message}`));
  await page.goto(url + "?reset=1&seed=1&nosample=1&time=10:30&date=2026-10-05");
  await page.waitForTimeout(1200);
  await page.addInitScript(() => { if (sessionStorage.getItem("savetest")) return; sessionStorage.setItem("savetest", "1");
  const k = Object.keys(localStorage).find(k => /^stub:.*\/fox$/.test(k)); const f = JSON.parse(localStorage.getItem(k));
  f.coins = 77; f.inv = Object.assign(f.inv || {}, {carrot: 3}); f.updatedAt = Date.now() - 3600e3; localStorage.setItem(k, JSON.stringify(f));
  Object.keys(localStorage).filter(k => /^fox\./.test(k)).forEach(k => localStorage.removeItem(k)); });
  await page.goto(url + "?seed=1&nosample=1&sunsama=1&dblag=2000&time=10:30&date=2026-10-05");
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
}
// Wardrobe at home: the stylist's three outfits from the "outfit" doc, plus a new one on request
{
  console.log("\nwardrobe");
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on("pageerror", e => errors.push(`wardrobe pageerror: ${e.message}`));
  await page.goto(url + "?reset=1&seed=1&time=10:30&date=2026-10-05");
  await page.waitForTimeout(700);
  await page.evaluate(() => {
    const o = (label, top, bottom, shoes) => ({label, top, bottom, shoes, bag: "Black structured tote", jewellery: "Pearl studs", hair: "up", why: "Polished but easy."});
    localStorage.setItem("stub:data/users/me/outfit", JSON.stringify({at: Date.now(), day: "2026-10-05", weather: "31C, humid", on: "School drop-off, client call at 3pm",
      options: [o("Polished", "Black boat neck top", "Navy wide-leg trousers", "Black loafers"), o("Elevated casual", "White fitted tee", "Dark jeans", "White sneakers"), o("Wild card", "Plum silk blouse", "Black midi skirt", "Black ballet flats")],
      wardrobe: {tops: ["Black boat neck top", "White fitted tee"], dresses: ["Emerald wrap midi dress"], shoes: ["Black ballet flats"], bags: ["Black crossbody"]}}));
  });
  await page.goto(url + "?seed=1&time=10:30&date=2026-10-05");
  await page.waitForTimeout(800);
  await page.locator('#world [data-place="home"]').dispatchEvent("click");
  await page.waitForFunction(() => /Home/.test(document.querySelector("#sceneName").textContent) && !/base/i.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  await page.waitForTimeout(400);
  await page.locator('#world [data-spot="mydoor"]').dispatchEvent("click");
  await page.waitForFunction(() => /My room/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  await page.waitForTimeout(400);
  await page.locator('#world [data-spot="wardrobe"]').dispatchEvent("click");
  await page.waitForSelector("#ctx .outfit", { timeout: 20000 });
  check(await page.locator("#ctx .outfit").count() === 3, "the wardrobe shows the stylist's three outfits");
  check(await page.locator("#ctx .outfit .garment").count() >= 15, "with a little drawing of each piece");
  await page.fill("#outfitAsk", "something green"); await page.click('#outfitForm button');
  await page.waitForFunction(() => document.querySelectorAll("#ctx .outfit").length === 4, null, { timeout: 10000 });
  check(await page.locator("#ctx .outfit").last().textContent().then(t => /Emerald wrap midi dress/.test(t)), "and a new outfit on request");
  await page.screenshot({ path: join(shots, "wardrobe.png") });
  await page.click("#pclose"); await page.waitForTimeout(200);
  check(await page.locator("#panel").isHidden(), "and closes");
  // the rest of Mel's room
  await page.waitForTimeout(2500);
  check(await page.evaluate(() => document.getElementById("mmaple").classList.contains("sleep")), "Maple curls up in her bed in Mel's room");
  check(await page.locator("#world .npc").count() === 0, "nobody else comes into Mel's room");
  await page.locator('#world [data-spot="bed"]').dispatchEvent("click");
  await page.waitForSelector('#ctx [data-bed="nap"]', { timeout: 15000 });
  await page.click('#ctx [data-bed="nap"]'); await page.waitForTimeout(300);
  check(await page.evaluate(() => getComputedStyle(document.getElementById("mel")).visibility === "hidden") && await page.locator("#world .zz").count() === 1, "a nap puts Mel to bed");
  await page.locator('#world [data-spot="window"]').dispatchEvent("click"); await page.waitForTimeout(3500);
  check(await page.evaluate(() => getComputedStyle(document.getElementById("mel")).visibility !== "hidden"), "getting up to the window wakes her");
  await page.locator('#world [data-spot="record"]').dispatchEvent("click");
  await page.waitForSelector('#ctx [data-track="rainy"]', { timeout: 15000 });
  check(await page.locator("#ctx .record").count() >= 5, "the record player has a crate of records");
  await page.click('#ctx [data-track="rainy"]'); await page.waitForTimeout(300);
  check(await page.evaluate(() => JSON.parse(localStorage.getItem("fox.sound")).track === "rainy") && await page.locator("#ctx .record.on").textContent().then(t => /Rainy window/.test(t)), "and puts on the one you pick");
  await page.click("#pclose");
  await page.locator('#world [data-spot="journal"]').dispatchEvent("click");
  await page.waitForSelector("#jText", { timeout: 15000 });
  await page.fill("#jText", "A lovely quiet afternoon."); await page.click('#jForm button'); await page.waitForTimeout(300);
  check(await page.locator(".jlist details").count() === 1 && await page.evaluate(() => (devDb.get("journal").entries || []).length === 1), "the journal keeps a page");
  await page.click("#pclose");
  // emotion jars: make one, see it on the shelf, open it, send it to the journal (and undo), empty it
  await page.locator('#world [data-spot="jars"]').dispatchEvent("click");
  await page.waitForSelector('#ctx [data-jar="make"]', { timeout: 15000 });
  await page.click('#ctx [data-jar="make"]');
  for (const e of ["anger", "anger", "anger", "tired"]) await page.click(`#ctx [data-emo="${e}"]`);
  for (const e of ["joy", "sad", "fear"]) await page.click(`#ctx [data-emo="${e}"]`).catch(() => {});
  check(await page.locator('#ctx [data-emo="calm"]').isDisabled() && /most it holds/.test(await page.locator("#ctx .jhint").first().textContent()), "a jar takes at most four feelings, and says why the rest are resting");
  await page.click('#ctx [data-jar="custom"]'); await page.fill("#jcName", "overwhelmed"); await page.press("#jcName", "Enter");
  check(await page.locator("#ctx [data-emo]").count() === 10 && /pick a colour/.test(await page.locator("#jcForm").textContent()), "your own feeling waits for a colour before it's added");
  await page.click('#jcForm [data-sw]'); await page.click('#jcForm button[type="submit"]');
  check(await page.locator("#ctx [data-emo]").count() === 11 && await page.evaluate(() => !document.querySelector("#jcForm")), "and you can add your own feeling");
  check((await page.locator("#ctx .jarmake .muted").first().textContent()).startsWith("6/"), "adding a feeling doesn't drop a blob in by itself");
  await page.fill("#jNote", "Client moved the deadline again."); await page.click('#ctx [data-jar="place"]'); await page.waitForTimeout(300);
  check(await page.locator("#ctx .jslot[data-jarid]").count() === 1 && await page.locator('#world [data-spot="jars"] svg').count() >= 1, "the jar goes on the shelf, and shows on the shelf in the room");
  await page.click("#ctx .jslot[data-jarid]");
  check(/Client moved the deadline again/.test(await page.locator("#ctx .jnotecard").textContent()) && /Anger ×3/.test(await page.locator("#ctx").textContent()), "opening a jar shows its feelings and note");
  await page.click('#ctx [data-jar="send"]'); await page.waitForTimeout(300);
  check(await page.locator("#ctx .jslot[data-jarid]").count() === 0 && await page.evaluate(() => (devDb.get("journal").entries || []).some(e => e.kind === "jar")), "sending it to the journal empties the jar and adds a journal page");
  await page.click("#undoBtn"); await page.waitForTimeout(300);
  check(await page.locator("#ctx .jslot[data-jarid]").count() === 1, "and Undo puts the jar back");
  await page.click("#ctx .jslot[data-jarid]"); await page.click('#ctx [data-jar="send"]'); await page.waitForTimeout(200);
  await page.click("#pclose");
  await page.locator('#world [data-spot="journal"]').dispatchEvent("click");
  await page.waitForSelector("#jText", { timeout: 15000 });
  check(await page.locator(".jlist .polaroid .jarsvg").count() === 1, "the journal page has a polaroid of the jar");
  await page.screenshot({ path: join(shots, "jar-polaroid.png") });
  await page.click("#pclose");
  await page.locator('#world [data-spot="nook"]').dispatchEvent("click");
  await page.waitForSelector('#ctx [data-calm="1"]', { timeout: 15000 });
  await page.click('#ctx [data-calm="1"]'); await page.waitForTimeout(500);
  check(await page.locator("#ctx .breathe .ring").count() === 1 && /Breathe in/.test(await page.locator("#breathCue").textContent()), "the calm corner has guided breathing with a breathing ring");
  await page.waitForTimeout(4500);
  check(/Hold|Breathe out/.test(await page.locator("#breathCue").textContent()), "and talks you through each breath");
  await page.click('#ctx [data-calm="stop"]'); await page.click('#ctx [data-calm="decompress"]'); await page.waitForTimeout(400);
  check(await page.evaluate(() => JSON.parse(localStorage.getItem("fox.today")).mode === "decompress"), "and starts a decompress any time");
  await page.locator("#world [data-exit]").first().dispatchEvent("click");
  await page.waitForFunction(() => /^Home/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  check(true, "the door on the east wall goes back into the house");
  await page.close();
}
// Scratchpad: the town hall whiteboard
{
  console.log("\nscratchpad");
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on("pageerror", e => errors.push(`scratchpad pageerror: ${e.message}`));
  await page.goto(url + "?reset=1&seed=1&chord=1&notion=1&time=10:30&date=2026-10-05");
  await page.waitForTimeout(800);
  await page.locator('#world [data-place="toTown"]').dispatchEvent("click");
  await page.waitForFunction(() => /Town square/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  // townsfolk walk round buildings, never through them: sample everyone's position for a while
  { const src = readFileSync(join(root, "src/game/paths.js"), "utf8"), m = /village: (\[[\s\S]*?\]\]),/.exec(src), rects = JSON.parse(m[1]);
    let bad = 0, seen = 0;
    for (let i = 0; i < 40; i++) {
      const pos = await page.evaluate(() => [...document.querySelectorAll("#world .npc")].map(n => (/translate\(([-\d.]+) ([-\d.]+)\)/.exec(n.getAttribute("transform")) || []).slice(1).map(Number)));
      pos.forEach(([x, y]) => { if (x == null) return; seen++; if (rects.some(r => x > r[0] + 6 && x < r[2] - 6 && y > r[1] + 6 && y < r[3] - 6)) bad++; });
      await page.waitForTimeout(300);
    }
    check(seen > 0 && bad === 0, `townsfolk walk round buildings, not through them (${bad} of ${seen} sightings inside)`); }
  await page.locator('#world [data-place="hall"]').dispatchEvent("click");
  await page.waitForFunction(() => /Town hall/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  await page.waitForTimeout(400);
  await page.locator('#world [data-spot="revenue"]').dispatchEvent("click");
  await page.waitForSelector("#ctx .rchart", { timeout: 15000 });
  check(await page.locator("#ctx .rchart .rbar").count() === 6 && /\$1,350/.test(await page.locator("#ctx .rbig").textContent()), "the revenue chart shows six months of paid income from Chord, internal invoices left out");
  await page.fill("#rvIn", "6000"); await page.click("#rvForm button"); await page.waitForTimeout(200);
  check(/23% of your \$6,000 target/.test(await page.locator("#ctx .rhero").textContent()) && /Late Co/.test(await page.locator("#ctx").textContent()), "with a target you set and what's still owed");
  await page.screenshot({ path: join(shots, "revenue.png") });
  await page.click("#pclose");
  await page.locator('#world [data-spot="table"]').dispatchEvent("click");
  await page.waitForSelector("#ctx .pcard.pweek", { timeout: 15000 });
  check(await page.locator("#ctx .pcard").count() === 3 && /Week of 5 Oct 2026/.test(await page.locator("#ctx .pweek").textContent()), "the planning table lays out this week, month and quarter from Notion");
  check(/Today · Monday/.test(await page.locator("#ctx .pweek").textContent()) && /Message 12 warm leads/.test(await page.locator("#ctx .pweek").textContent()), "with today's slice of the week pulled out");
  check(await page.locator("#ctx .pquarter .ptable td").count() >= 2 && !/&lt;td|<td>/.test(await page.locator("#ctx .pquarter").innerHTML().then(h => h.replace(/<td>[^<]*<\/td>/g, ""))), "Notion tables show as tables, not code");
  check(await page.evaluate(() => { const p = document.getElementById("panel"); document.querySelectorAll("#ctx details").forEach(d => d.open = true); return p.scrollWidth <= p.clientWidth + 2; }), "and opening every section never makes the panel wider");
  await page.fill("#plIn", "am I on track?"); await page.click("#plForm button");
  await page.waitForFunction(() => document.querySelectorAll("#plChat .me").length === 1 && document.querySelectorAll("#plChat .fox").length >= 1 && !/Thinking it through|Ask me about your plans/.test(document.querySelector("#plChat").textContent), null, { timeout: 15000 }).catch(() => {});
  check(await page.locator("#plChat .me").count() === 1 && !/Ask me about your plans/.test(await page.locator("#plChat").textContent()), "and a planning chat that answers");
  await page.screenshot({ path: join(shots, "planning-table.png") });
  await page.click("#pclose");
  await page.locator('#world [data-spot="clients"]').dispatchEvent("click");
  await page.waitForSelector("#ctx .clprojects li", { timeout: 15000 });
  check(await page.locator("#ctx .clprojects li").count() === 2 && /overdue tasks/.test(await page.locator("#ctx .clchips").textContent()), "the client table in the town hall shows a live Chord snapshot");
  check(await page.locator("#clForm").count() === 1, "with a chat about your clients");
  await page.fill("#clIn", "what's waiting on me?"); await page.click("#clForm button");
  await page.waitForFunction(() => document.querySelectorAll("#clChat .me").length === 1 && !/Looking through|Ask me anything about your clients/.test(document.querySelector("#clChat").textContent), null, { timeout: 15000 }).catch(() => {});
  check(await page.locator("#clChat .me").count() === 1 && await page.locator("#clChat .fox").count() >= 1, "and the chat answers");
  await page.screenshot({ path: join(shots, "client-table.png") });
  await page.click("#pclose");
  await page.locator('#world [data-spot="whiteboard"]').dispatchEvent("click");
  await page.waitForSelector("#scratchText", { timeout: 15000 });
  await page.fill("#scratchText", "Call the printer about the flyers"); await page.waitForTimeout(1500);
  check(await page.evaluate(() => (devDb.get("scratch") || {}).text === "Call the printer about the flyers"), "the whiteboard is a scratchpad that saves as you type");
  await page.close();
}
// Sunsama pull: no chat plan, the page fetches today's tasks itself
{
  console.log("\nsunsama pull");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`sunsama pageerror: ${e.message}`));
  await page.goto(url + "?reset=1&sunsama=1&time=07:45");
  await page.waitForFunction(() => /came straight from Sunsama/.test(document.querySelector("#sunsamaLine").textContent), null, { timeout: 15000 });
  const titles = await page.locator("#list .t").allTextContents();
  check(titles.length === 5, `all five Sunsama tasks became quests (${titles.length})`);
  check(await page.locator("#list li.done .t").allTextContents().then(t => t.some(x => /Listen to affirmations/.test(x))) && await page.locator("#list li.done .tk").count() > 0, "a task completed in Sunsama shows as done, ticked");
  const plan = await page.evaluate(() => devDb.get("plan"));
  check(plan && plan.source === "sunsama" && plan.tasks.find(t => t.id === "s1").notes.includes("- Check GHL"), "notes are cleaned up from Sunsama's HTML");
  check(plan.tasks.find(t => t.id === "s4").minutes === 90 && plan.tasks.find(t => t.id === "s3").treadmill === true, "time estimates and treadmill flags carry over");
  check(plan.tasks.find(t => t.id === "s1").email, "comms tasks become email quests at the post office");
  check(plan.tasks.find(t => t.id === "s3").spot === "treadmill", "treadmill tasks go straight to the treadmill");
  await page.click('[data-open="quests"]');
  await page.click('#tomorrow [data-tmr="peek"]');
  await page.waitForSelector('#tomorrow [data-early="n1"]', { timeout: 10000 });
  check(await page.locator("#tomorrow .hlist.tmr li").count() === 2, "tomorrow's Sunsama tasks can be previewed");
  await page.click('#tomorrow [data-early="n1"]'); await page.waitForTimeout(200);
  check(await page.locator("#list .t").allTextContents().then(t => t.some(x => /Plan the Chord newsletter/.test(x))), "and pulled onto today's board");
  check(await page.locator('#tomorrow .hbadge').textContent().then(t => /today's board/.test(t)), "marked as on today's board");
  await page.waitForTimeout(800);
  await page.evaluate(async () => { const day = (await devDb.get("plan")).day, f = JSON.parse(localStorage.getItem("fox.fox")); f.early = {s2: day}; f.updatedAt = Date.now() + 1e7;
    localStorage.setItem("fox.fox", JSON.stringify(f)); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, JSON.stringify(f))); });
  await page.goto(url + "?sunsama=1&time=07:45"); await page.waitForTimeout(1500);
  check(await page.locator("#list li.done .t").allTextContents().then(t => t.some(x => /Draft the Visibility Fix email/.test(x))), "a quest done early is already ticked on its day");
  await page.click('[data-open="settings"]').catch(() => {}); await page.click("#pclose").catch(() => {});
  await page.click('[data-open="cal"]');
  await page.waitForFunction(() => document.querySelectorAll("#calBody .calday li").length > 1, null, { timeout: 8000 }).catch(() => {});
  check(await page.locator("#calBody .calday li b").count() >= 2, "the calendar icon shows today's events");
  await page.click('[data-open="settings"]');
  check(await page.locator("#setMusic").count() === 1 && await page.locator("#nameIn").isVisible(), "settings has music, sound and renaming");
  check(await page.locator("#setQuiet").isChecked(), "quiet evenings are on by default");
  await page.emulateMedia({ colorScheme: "dark" });
  check(await page.evaluate(() => { const c = getComputedStyle(document.getElementById("speech")).backgroundColor; return c === "rgb(255, 253, 246)"; }), "speech bubbles stay cream in dark mode");
  check(await page.evaluate(() => { const l = document.querySelector(".map .lab"); return !l || getComputedStyle(l).fill === "rgb(47, 43, 40)"; }), "place names stay dark ink in dark mode");
  await page.emulateMedia({ colorScheme: "light" });
  await page.click("#setSfx"); check(!(await page.locator("#setSfx").isChecked()), "sound effects can be muted");
  await page.emulateMedia({ colorScheme: "dark" });
  check(await page.evaluate(() => { const i = document.getElementById("nameIn"); return !i || getComputedStyle(i).color === "rgb(47, 43, 40)"; }), "typed text in panels stays dark ink in dark mode");
  await page.emulateMedia({ colorScheme: "light" });
  await page.click("#pclose"); await page.click("#chatBtn");
  await page.fill("#chatIn", "remind me to get the laundry in in 1 hour"); await page.click("#chatForm button");
  await page.waitForFunction(() => [...document.querySelectorAll("#chatLog .did")].some(d => /Reminder at/.test(d.textContent)), null, { timeout: 10000 });
  check(await page.evaluate(() => { const w = (window.__calWrites || [])[0]; return !!w && w.tool === "create_event" && /laundry/.test(w.input.summary) && w.input.overrideReminders[0].method === "popup" && Math.abs(Date.parse(w.input.startTime) - Date.now() - 3600e3) < 120e3; }), "asking Maple for a reminder puts a calendar event with a phone alert an hour from now");
  await page.click("#pclose"); await page.click('[data-open="cal"]');
  await page.waitForSelector("#calBody .rems li", { timeout: 10000 });
  check(/get the laundry in/.test(await page.locator("#calBody .rems").textContent()), "the calendar panel lists upcoming reminders");
  await page.click("#calBody [data-rem]"); await page.waitForFunction(() => window.__calWrites.some(w => w.tool === "delete_event"), null, { timeout: 5000 }).catch(() => {});
  check(await page.evaluate(() => window.__calWrites.some(w => w.tool === "delete_event" && w.input.eventId === "ev1")), "cancelling a reminder takes it off the calendar");
  await page.click("#undoBtn"); await page.waitForFunction(() => window.__calWrites.filter(w => w.tool === "create_event").length === 2, null, { timeout: 5000 }).catch(() => {}); await page.waitForTimeout(200);
  check(await page.evaluate(() => window.__calWrites.filter(w => w.tool === "create_event").length === 2) && await page.locator("#calBody .rems li").count() === 1, "and Undo puts it back");
  await page.click("#pclose");
  await page.close();
}
await browser.close();
if (errors.length) { console.log("\n" + errors.join("\n")); process.exit(1); }
console.log("\nall good");
