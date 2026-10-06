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
  check(await page.evaluate(() => { const n = document.querySelector("#journal.slim"), m = document.querySelector("#map"); if (!n) return true; const a = n.getBoundingClientRect(), b = m.getBoundingClientRect(); return a.left >= b.left && a.right <= b.right; }), "the folded quest note sits fully inside the map");
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
  await page.waitForFunction(() => /2.5k/.test(document.getElementById("stepNote").textContent), null, { timeout: 3000 }).catch(() => {});
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
  await page.evaluate(() => { const f = JSON.parse(localStorage.getItem("fox.fox")); f.coins = 800; f.updatedAt = Date.now() + 1e6;
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
  check(plan && plan.source === "sunsama" && (plan.tasks.find(t => t.id === "s1").subtasks || []).map(x => x.title).join("|") === "Check GHL|Check emails", "a checklist in Sunsama's notes becomes subtasks");
  const s3 = plan.tasks.find(t => t.id === "s3"), sx = (s3.subtasks || []).find(x => x.id === "x"), sy = (s3.subtasks || []).find(x => x.id === "y");
  check(sx && sy && sx.info.join(" ").includes("Rule of 3") && sy.done && sy.info.some(l => /^Planner: https/.test(l)) && sy.est === "30m", "each subtask keeps its own details from the notes");
  check(/Walk-friendly/.test(s3.notes) && /Also on this walk/.test(s3.notes) && !/one by one/.test(s3.notes), "and the rest of the notes stay as notes, without the duplicated details");
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
  // finishing a Sunsama quest here ticks it off in Sunsama
  await page.click("#pclose").catch(() => {});
  const openNote = async () => { if (await page.locator('#journal [data-qn="open"]').count()) await page.click('#journal [data-qn="open"]'); };
  await openNote(); await page.click('#journal [data-a="walk"]').catch(() => {});
  await page.waitForFunction(() => document.querySelector('#journal [data-a="gotWipe"]'), null, { timeout: 15000 }).catch(() => {});
  await page.click('#journal [data-a="gotWipe"]').catch(() => {}); await page.click('#journal [data-a="cleanDone"]').catch(() => {}); await page.waitForTimeout(300);
  await openNote(); await page.click('#journal [data-a="walk"]');
  await page.waitForFunction(() => document.querySelector('#journal [data-a="notebook"]'), null, { timeout: 20000 });
  await page.click('#journal [data-a="notebook"]'); await page.waitForTimeout(300);
  if (await page.locator('#notebook [data-nb="started"]').count()) { await page.click('#notebook [data-nb="started"]'); await page.waitForTimeout(300); }
  await page.click('#notebook [data-nb="done"]');
  await page.waitForFunction(() => (window.__sunsamaDone || []).length, null, { timeout: 8000 }).catch(() => {});
  check(await page.evaluate(() => { const d = (window.__sunsamaDone || [])[0]; return !!d && /^s\d$/.test(d.taskId) && /^\d{4}-\d{2}-\d{2}$/.test(d.finishedDay); }), "finishing a Sunsama quest ticks it off in Sunsama too");
  // the next quest is the treadmill batch: its subtasks are a checklist in the notebook, and ticks reach Sunsama
  await page.waitForTimeout(400); await openNote(); await page.click('#journal [data-a="back"]', {timeout: 3000}).catch(() => {});   // the break after a quest
  await page.waitForTimeout(400); await openNote(); await page.click('#journal [data-a="walk"]', {timeout: 5000}).catch(() => {});
  await page.waitForFunction(() => document.querySelector('#journal [data-a="notebook"]'), null, { timeout: 20000 }).catch(() => {});
  check(await page.locator("#journal li.subnext").textContent().then(t => /Up next: Post on LinkedIn/.test(t) && /1 of 2 subtasks done/.test(t)).catch(() => false), "the quest note shows the next subtask and progress");
  await page.click('#journal [data-a="notebook"]'); await page.waitForTimeout(300);
  check(await page.locator("#notebook .sublist .sub").count() === 1 && await page.locator("#notebook .sub.upnext .subinfo li").count() === 1 && /1 of 2 done/.test(await page.locator("#notebook .subcount").textContent()), "the notebook lists subtasks to do, the next one open with its details");
  await page.click('#notebook [data-nb="subdone"]');
  check(await page.locator('#notebook .sub.done .lchip').count() === 0 && await page.locator("#notebook .sub.done").count() === 1, "done subtasks fold away under Done");
  await page.click('#notebook .sub.done [data-nb="subopen"]');
  check(await page.locator('#notebook .sub.done a.lchip').textContent().then(t => /Planner/.test(t)), "links show as small named chips");
  const subC0 = await page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")).coins);
  await page.click('#notebook .sub.upnext [data-nb="sub"]');
  await page.waitForFunction(() => (window.__subTicks || []).length, null, { timeout: 8000 }).catch(() => {});
  check(await page.evaluate(c => JSON.parse(localStorage.getItem("fox.fox")).coins === c + 5, subC0), "a subtask in a treadmill batch pays like a quest (5 coins)");
  check(await page.evaluate(() => { const x = (window.__subTicks || [])[0]; return !!x && x.tool === "mark_subtask_as_completed" && x.input.taskId === "s3" && x.input.subtaskId === "x"; }), "ticking a subtask ticks it in Sunsama too");
  check(/2 of 2 done/.test(await page.locator("#notebook .subcount").textContent()) && await page.locator("#notebook .suball").count() === 1, "and the checklist shows everything done");
  await page.click('#notebook [data-nb="close"]').catch(() => {});
  await page.goto(url + "?sunsama=1&time=07:45"); await page.waitForTimeout(1500);
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
  check(await page.evaluate(() => { const q = document.querySelector(".map .qnote"); const h = document.createElement("span"); h.className = "hl"; h.textContent = "x"; q.appendChild(h); const c = getComputedStyle(h).color; h.remove(); return c === "rgb(47, 43, 40)"; }), "highlighted words on the quest note stay dark in dark mode");
  check(await page.evaluate(() => getComputedStyle(document.querySelector(".hbtn")).backgroundColor === "rgb(246, 239, 227)"), "the round buttons stay cream in dark mode, so the icons show");
  await page.emulateMedia({ colorScheme: "light" });
  await page.click("#setSfx"); check(!(await page.locator("#setSfx").isChecked()), "sound effects can be muted");
  await page.emulateMedia({ colorScheme: "dark" });
  check(await page.evaluate(() => { const i = document.getElementById("nameIn"); return !i || getComputedStyle(i).color === "rgb(47, 43, 40)"; }), "typed text in panels stays dark ink in dark mode");
  await page.emulateMedia({ colorScheme: "light" });
  await page.click("#pclose");
  await page.locator('#world [data-place="home"]').dispatchEvent("click");
  await page.waitForFunction(() => /Home/.test(document.querySelector("#sceneName").textContent) && !/base/i.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  await page.locator('#world [data-spot="desk"]').dispatchEvent("click");
  await page.waitForSelector('#ctx [data-desk="refresh"]', { timeout: 15000 });
  await page.waitForFunction(() => /Dinner on Sunday/.test(document.querySelector("#ctx").textContent), null, { timeout: 10000 }).catch(() => {});
  check(/Dinner on Sunday/.test(await page.locator("#ctx").textContent()) && await page.evaluate(() => window.__zapier && window.__zapier.params.query.includes("category:primary") && !!window.__zapier.connection_id), "the home desk shows the personal inbox, through Zapier (Primary only)");
  check(!/freshpages/.test(await page.locator("#ctx").textContent()), "the home desk is just the personal inbox");
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
{
  // Evan's room: Evan leads, Mel waits by the door, the toddler plays, and nothing in Mel's game changes
  console.log("\nevan's room");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(url + "?reset=1&seed=1&time=10:30");
  await page.waitForTimeout(800);
  await page.locator('#world [data-place="home"]').dispatchEvent("click");
  await page.waitForFunction(() => /Home/.test(document.querySelector("#sceneName").textContent) && !/base/i.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  check(await page.locator('#world [data-spot="kiddoor"]').count() === 1, "the house has a door to Evan's room on the right");
  const before = await page.evaluate(() => { const f = JSON.parse(localStorage.getItem("fox.fox")), t = JSON.parse(localStorage.getItem("fox.today")); return JSON.stringify({c: f.coins, x: f.xp, done: t.doneIds, e: t.earned}); });
  await page.locator('#world [data-spot="kiddoor"]').dispatchEvent("click");
  await page.waitForFunction(() => /Evan's room/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  await page.waitForTimeout(1500);
  check(await page.evaluate(() => document.body.classList.contains("kidmode")) && await page.locator("#chatBtn").isHidden() && await page.locator(".hudbtns").isHidden(), "inside, the grown-up buttons are tucked away");
  check(await page.evaluate(() => getComputedStyle(document.getElementById("mmaple")).display === "none"), "Maple stays outside");
  const melAt = await page.evaluate(() => document.getElementById("mel").getAttribute("transform"));
  await page.locator('#world [data-spot="snacks"]').dispatchEvent("click");
  await page.waitForSelector("#ctx [data-snack]", { timeout: 10000 });
  check(await page.evaluate(() => document.getElementById("mel").getAttribute("transform")) === melAt, "Evan walks to the snack cupboard while Mel waits by the door");
  check(await page.locator("#ctx [data-snack]").count() === 5, "the snack cupboard has milk, juice, apple chips, watermelon and goldfish crackers");
  await page.click('#ctx [data-snack="fish"]'); await page.waitForTimeout(300);
  check(await page.locator("#panel").isHidden() && /fish|crunch/i.test(await page.locator("#evanSay").textContent()), "picking one, Evan munches it");
  await page.locator('#world [data-spot="dino"]').dispatchEvent("click");
  await page.waitForSelector("#kgame .kegg", { timeout: 10000 });
  for (let i = 0; i < 4; i++) { await page.click(`[data-egg="${i}"]`); await page.click(`[data-egg="${i}"]`); }
  check(await page.locator("#kgame .kpop").count() === 4, "the dino egg game: tap tap, a baby dinosaur hatches");
  await page.click('[data-kid="done"]');
  await page.locator('#world [data-spot="train"]').dispatchEvent("click");
  await page.waitForSelector("#kgame .ktrain", { timeout: 10000 });
  await page.click("#kgame"); await page.waitForTimeout(3300);
  check(await page.locator("#kgame .ktrain svg").count() === 3, "the train game: off it goes, back with another carriage");
  await page.click('[data-kid="done"]');
  await page.locator('#world [data-spot="kbed"]').dispatchEvent("click");
  await page.waitForFunction(() => document.getElementById("evan").style.visibility === "hidden", null, { timeout: 10000 });
  check(await page.locator("#world .zz").count() >= 1, "Evan can sleep in his car bed");
  await page.locator("#world").click({ position: { x: 200, y: 500 } }); await page.waitForTimeout(400);
  check(await page.evaluate(() => document.getElementById("evan").style.visibility !== "hidden"), "and a tap wakes him");
  check(await page.evaluate(() => { const l = [...document.querySelectorAll("#world text.lab")].find(t => /To the house/.test(t.textContent)); const m = l && /translate\(([\d.]+) ([\d.]+)\)/.exec(l.parentNode.getAttribute("transform")); return !!m && +m[1] < 90 && +m[2] > 470; }), "the door's sign sits below the door, clear of Mel");
  await page.locator('#world [data-exit]').dispatchEvent("click");
  await page.waitForFunction(() => !/Evan's room/.test(document.querySelector("#sceneName").textContent), null, { timeout: 5000 }).catch(() => {});
  check(!/Evan's room/.test(await page.locator("#sceneName").textContent()) && !(await page.evaluate(() => document.body.classList.contains("kidmode"))), "tapping the door goes back to the house");
  const after = await page.evaluate(() => { const f = JSON.parse(localStorage.getItem("fox.fox")), t = JSON.parse(localStorage.getItem("fox.today")); return JSON.stringify({c: f.coins, x: f.xp, done: t.doneIds, e: t.earned}); });
  check(before === after, "nothing in Evan's room changes Mel's game (coins, XP, quests)");
  // hugs: Evan runs over with his arms up; a tap on him and Mel hugs back
  await page.goto(url + "?seed=1&time=10:30&hugsoon=1");
  await page.waitForFunction(() => document.getElementById("evan").classList.contains("hug"), null, { timeout: 25000 }).catch(() => {});
  check(await page.evaluate(() => document.getElementById("evan").classList.contains("hug")), "now and then Evan comes over for a hug");
  await page.locator("#evan").dispatchEvent("click"); await page.waitForTimeout(300);
  check(await page.evaluate(() => document.getElementById("mel").classList.contains("hugging")) && !(await page.locator("#melSay").isHidden()), "tap him and Mel hugs him back");
  // bedtime: 8pm to 7am Evan is asleep in his room
  await page.goto(url + "?seed=1&time=21:00");
  await page.waitForTimeout(800);
  check(await page.evaluate(() => getComputedStyle(document.getElementById("evan")).display === "none"), "after 8pm Evan isn't out playing");
  await page.locator('#world [data-place="home"]').dispatchEvent("click");
  await page.waitForFunction(() => /Home/.test(document.querySelector("#sceneName").textContent) && !/base/i.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  await page.locator('#world [data-spot="kiddoor"]').dispatchEvent("click");
  await page.waitForFunction(() => /Evan's room/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  await page.waitForTimeout(800);
  await page.locator("#world").click({ position: { x: 200, y: 500 } }); await page.waitForTimeout(300);
  check(await page.locator("#world .zz").count() >= 1 && /shh/.test(await page.locator("#evanSay").textContent()), "at night he's asleep in his car bed, and stays asleep");
  await page.screenshot({ path: join(shots, "evan-room-night.png") });
  await page.locator('#world [data-exit]').dispatchEvent("click");
  await page.waitForFunction(() => !/Evan's room/.test(document.querySelector("#sceneName").textContent), null, { timeout: 5000 }).catch(() => {});
  check(!/Evan's room/.test(await page.locator("#sceneName").textContent()), "the door still works while he's asleep");
  await page.close();
}
{
  // Kind words: the town hall corkboard for compliments
  console.log("\nkind words");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(url + "?reset=1&seed=1&time=10:30");
  await page.waitForTimeout(800);
  await page.locator('#world [data-place="toTown"]').dispatchEvent("click");
  await page.waitForFunction(() => /Town square/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  await page.locator('#world [data-place="hall"]').dispatchEvent("click");
  await page.waitForFunction(() => /Town hall/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  await page.locator('#world [data-spot="trophydoor"]').dispatchEvent("click");
  await page.waitForFunction(() => /courtyard/i.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  await page.locator('#world [data-spot="kudos"]').dispatchEvent("click");
  await page.waitForSelector('#ctx [data-kd="add"]', { timeout: 15000 });
  check(true, "the courtyard has a Kind words board on the wall");
  await page.click('#ctx [data-kd="add"]');
  await page.fill("#kText", "Your copy made our launch. Best money we spent all year."); await page.fill("#kFrom", "A client"); await page.click('#kForm button[type="submit"]');
  await page.waitForTimeout(300);
  check(await page.locator("#ctx .knote").count() === 1 && /A client/.test(await page.locator("#ctx .kboard").textContent()), "a compliment is pinned up with who said it");
  check(await page.evaluate(() => (devDb.get("kudos").items || []).some(e => /launch/.test(e.text || ""))), "and saved privately, so it follows Mel across devices");
  await page.click('#ctx [data-kd="random"]'); await page.waitForTimeout(200);
  check(/Best money/.test(await page.locator("#ctx .ktext").textContent()), "Read me one shows a compliment big");
  await page.click('#ctx [data-kd="board"]'); await page.click('#ctx [data-kd="del"]'); await page.waitForTimeout(200);
  check(await page.locator("#ctx .knote").count() === 0, "a note can be taken down");
  await page.click("#undoBtn"); await page.waitForTimeout(300);
  check(await page.locator("#ctx .knote").count() === 1, "and Undo puts it back");
  check(await page.locator('#world [data-spot="kudos"] rect').count() >= 3, "the board on the wall shows its notes");
  await page.screenshot({ path: join(shots, "kind-words.png") });
  await page.close();
}
{
  // My routines: the noticeboard in Mel's room
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
  check(coins1 - coins0 === (steps - 1) + 5, `each routine step earns a coin and finishing the routine earns a 5-coin bonus, once a day (+${coins1 - coins0})`);
  await page.click('#ctx [data-rt="sel"]:has-text("Beauty")'); await page.click('#ctx [data-rt="edit"]');
  check(await page.locator('#ctx [data-day="sun"]').inputValue() === "Air shot micro-needling + face mask", "Mel's beauty week is already on the board");
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
}
{
  // Trophy room: off the town hall; trophies on pedestals, the trophy book, affirmations, kind words
  console.log("\ntrophy room");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(url + "?reset=1&seed=1&time=10:30&sunsama=1");
  await page.waitForTimeout(1500);
  // patch the save as the next page starts (the old page writes its own copy as it unloads)
  await page.addInitScript(() => { if (!location.search.includes("patchtq")) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return; f.totalQuests = 30; delete f.trophies;
    localStorage.setItem("fox.fox", JSON.stringify(f)); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, JSON.stringify(f))); });
  await page.goto(url + "?seed=1&time=10:30&sunsama=1&patchtq=1");
  await page.waitForTimeout(12000);
  const tr = await page.evaluate(() => (JSON.parse(localStorage.getItem("fox.fox")).trophies || []).map(t => t.id));
  check(tr.includes("quests-10") && tr.includes("quests-25") && !tr.includes("quests-50"), "trophies are awarded for quest milestones reached");
  check(tr.some(id => id.startsWith("objw-")), "and for a week with every Sunsama objective done");
  await page.locator('#world [data-place="toTown"]').dispatchEvent("click");
  await page.waitForFunction(() => /Town square/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  await page.locator('#world [data-place="hall"]').dispatchEvent("click");
  await page.waitForFunction(() => /Town hall/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  check(await page.locator('#world [data-spot="trophydoor"]').count() === 1 && await page.locator('#world [data-spot="kudos"]').count() === 0, "the town hall has an archway out to the courtyard (the kind words board moved out there)");
  await page.locator('#world [data-spot="trophydoor"]').dispatchEvent("click");
  await page.waitForFunction(() => /courtyard/i.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  await page.waitForTimeout(600);
  check(await page.locator("#world .ptrophy").count() >= 3, "trophies stand on the pedestals");
  check(await page.locator('#world [data-spot="kudos"]').count() === 1 && await page.locator('#world [data-spot="affirm"]').count() === 1, "with the kind words and affirmations boards on the wall");
  await page.locator('#world [data-spot="ped0"]').dispatchEvent("click");
  await page.waitForSelector('#ctx [data-tr="book"]', { timeout: 10000 });
  const name = await page.locator("#ctx .tcard h2").textContent();
  await page.click('#ctx [data-tr="book"]'); await page.waitForTimeout(400);
  await page.locator('#world [data-spot="tbook"]').dispatchEvent("click");
  await page.waitForSelector("#ctx .tpage", { timeout: 10000 });
  check((await page.locator("#ctx .tpage h3").first().textContent()) === name && await page.locator("#ctx .tpage svg").count() >= 1, "a trophy can go into the trophy book: a page with a polaroid and the story");
  await page.click("#pclose"); await page.waitForTimeout(200);
  await page.locator('#world [data-spot="affirm"]').dispatchEvent("click");
  await page.waitForSelector("#ctx .taff li", { timeout: 10000 });
  check(await page.locator("#ctx .taff li").count() === 5, "five affirmations for today");
  await page.click("#pclose"); await page.waitForTimeout(200);
  await page.locator('#world [data-spot="bench"]').dispatchEvent("click"); await page.waitForTimeout(2500);
  check(await page.evaluate(() => document.getElementById("mel").classList.contains("sit")), "Mel can sit on the bench");
  check(await page.locator("#world [data-pigeon]").count() >= 2 && await page.locator('#world [data-spot="fountain"]').count() === 1, "with a fountain and pigeons pecking about");
  await page.locator('#world [data-spot="fountain"]').dispatchEvent("click");
  await page.waitForSelector('#ctx [data-vz="start"]', { timeout: 10000 });
  check(true, "wishing at the fountain offers the weekly visualisation");
  await page.click('#ctx [data-vz="start"]'); await page.waitForSelector('#ctx [data-vz="begin"]:not([disabled])', { timeout: 10000 });
  await page.click('#ctx [data-vz="begin"]');
  for (let i = 0; i < 6; i++) { await page.waitForSelector("#vzIn", { timeout: 10000 }); await page.fill("#vzIn", i === 5 ? "Spacious" : "Calm and proud. I sent the Voice Pass email."); await page.click('#ctx [data-vz="next"]'); await page.waitForFunction(() => !document.querySelector('#ctx [data-vz="next"][disabled]'), null, { timeout: 10000 }).catch(() => {}); }
  await page.waitForSelector("#ctx .vsum", { timeout: 15000 }).catch(() => {});
  check(await page.locator("#ctx .vsum").count() === 1, "six questions, one at a time, then the week written back");
  await page.click('#ctx [data-vz="save"]');
  await page.waitForFunction(() => window.__visSaved, null, { timeout: 10000 }).catch(() => {});
  check(await page.evaluate(() => !!window.__visSaved && window.__visSaved.pages[0].properties["Feeling Word"] && window.__visSaved.parent.data_source_id.startsWith("ba8f40af")), "saved to the Weekly Visualisations database in Notion");
  check(await page.evaluate(() => (window.__sunsamaTasks || []).length >= 1), "and the actions go to Sunsama");
  await page.click("#pclose");
  await page.screenshot({ path: join(shots, "courtyard.png") });
  await page.close();
}
{
  // Letters (writing desk), bedtime, backup
  console.log("\nletters, bedtime, backup");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("dialog", d => d.accept());
  await page.goto(url + "?reset=1&seed=1&time=10:30");
  await page.waitForTimeout(800);
  await page.locator('#world [data-place="home"]').dispatchEvent("click");
  await page.waitForFunction(() => /Home/.test(document.querySelector("#sceneName").textContent) && !/base/i.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  await page.locator('#world [data-spot="mydoor"]').dispatchEvent("click");
  await page.waitForFunction(() => /My room/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  await page.locator('#world [data-spot="journal"]').dispatchEvent("click");
  await page.waitForSelector("#ctx [data-letters]", { timeout: 15000 });
  await page.click("#ctx [data-letters]"); await page.click('#ctx [data-lt="universe"]');
  await page.fill("#ltText", "Dear Universe, I'm nervous about the Chord launch."); await page.click('#ctx [data-lt="senduni"]');
  await page.waitForFunction(() => (JSON.parse(localStorage.getItem("fox.letters") || "{}").items || []).some(e => e.reply && e.reply.text), null, { timeout: 15000 }).catch(() => {});
  check(await page.evaluate(() => { const e = (JSON.parse(localStorage.getItem("fox.letters")).items || [])[0]; return !!(e && e.reply && e.reply.text && e.reply.due > Date.now()); }), "a letter to the universe gets a reply, arriving a little later like post");
  await page.click('#ctx [data-lt="future"]'); await page.fill("#ltText", "Hi future me. Hope Evan still loves trains."); await page.fill("#ltDate", "2027-10-04"); await page.click('#ctx [data-lt="sendfut"]');
  check(await page.evaluate(() => (JSON.parse(localStorage.getItem("fox.letters")).items || []).some(e => e.kind === "future" && e.deliver === "2027-10-04")), "a letter to future me is sealed until the chosen date");
  await page.click('#ctx [data-lt="open"] >> nth=0'); await page.waitForTimeout(150);
  check(/Sealed until/.test(await page.locator("#ctx").textContent()) || /On its way|wrote back/.test(await page.locator("#ctx").textContent()), "letters can be opened from the list");
  await page.click("#pclose");
  await page.click('[data-open="settings"]'); await page.click("#setBackup"); await page.waitForTimeout(300);
  check(await page.evaluate(() => window.__download && /maples-village-backup-.*\.json/.test(window.__download.filename) && window.__download.size > 200), "Settings can download a backup of the whole game");
  check(await page.locator("#setBed").isChecked(), "Stay in bed is on by default");
  await page.click("#pclose");
  await page.addInitScript(() => { window.__said = []; new MutationObserver(() => { const t = document.getElementById("speech"); if (t) window.__said.push(t.textContent); }).observe(document, {subtree: true, childList: true, characterData: true}); });
  await page.goto(url + "?seed=1&time=23:02"); await page.waitForTimeout(14000);
  check(await page.evaluate(() => (window.__said || []).some(t => /Time to start winding down/.test(t))), "from 11pm Maple offers a calm wind-down line");
  check(await page.evaluate(() => new Set((window.__said || []).filter(t => /winding down|Teeth, then skincare|Phone on charge/.test(t))).size <= 1), "and only one every half a minute or so, with no nagging");
  await page.goto(url + "?seed=1&time=23:50"); await page.waitForTimeout(2500);
  check(!(await page.locator("#bedLock").isHidden()) && await page.evaluate(() => document.body.classList.contains("bedlocked")), "from 11:45pm the village rests: everything waits until 6am");
  await page.locator("#chatBtn").dispatchEvent("click").catch(() => {}); await page.waitForTimeout(200);
  check(await page.locator("#panel").isHidden(), "and nothing can be actioned");
  await page.click("#bedUp"); await page.waitForTimeout(1500);
  check(await page.locator("#bedLock").isHidden(), "unless Mel really needs to get up (just for tonight)");
  await page.close();
}
{
  // Hestia "Last done": every-so-often household jobs
  console.log("\nlast done");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(url + "?reset=1&seed=1&time=10:30");
  await page.waitForTimeout(800);
  // the five-minute clean has the cupboard first thing; get it done
  if (await page.locator('#journal [data-qn="open"]').count()) await page.click('#journal [data-qn="open"]');
  await page.click('#journal [data-a="walk"]');
  await page.waitForFunction(() => document.querySelector('#journal [data-a="gotWipe"]'), null, { timeout: 15000 });
  await page.click('#journal [data-a="gotWipe"]'); await page.click('#journal [data-a="cleanDone"]'); await page.waitForTimeout(300);
  await page.waitForFunction(() => /Home/.test(document.querySelector("#sceneName").textContent) && !/base/i.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  await page.locator('#world [data-spot="cupboard"]').dispatchEvent("click");
  await page.waitForSelector('#ctx [data-htab="last"]', { timeout: 15000 });
  await page.click('#ctx [data-htab="last"]');
  check(/Aircon servicing/.test(await page.locator("#ctx").textContent()) && /Evan's sheets/.test(await page.locator("#ctx").textContent()), "the cleaning cupboard has a Last done tab (aircon, sheets)");
  await page.click('#ctx [data-hlastnow="l3"]'); await page.waitForTimeout(200);
  check(/today/.test(await page.locator('#ctx li.hlast:has-text("Evan\'s sheets")').textContent()), "Done today logs it");
  await page.fill('#ctx [data-hlastdate="l1"]', "2026-06-01"); await page.locator('#ctx [data-hlastdate="l1"]').dispatchEvent("change"); await page.waitForTimeout(200);
  check(/overdue/.test(await page.locator('#ctx li.hlast:has-text("Aircon")').textContent()), "a past date can be keyed in, and it shows when it's overdue");
  await page.fill('#ctx form[data-hlastadd] input[name="t"]', "Clean the fridge"); await page.click('#ctx form[data-hlastadd] button');
  check(await page.evaluate(() => (JSON.parse(localStorage.getItem("fox.hestia")).lastDone || []).some(x => x.name === "Clean the fridge")), "new things can be added, and they're saved with the home data");
  await page.close();
}
{
  // The weekly review in the town hall, and the tasting room's small plates
  console.log("\nweekly review and tasting room");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`review pageerror: ${e.message}`));
  await page.addInitScript(() => { const q = location.search; if (!/rvpatch|menupatch|platepatch|dinnerpatch|goatpatch/.test(q)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    if (q.includes("rvpatch")) f.history = Object.assign(f.history || {}, {"2026-10-05": {q: 4, steps: 6200, water: 1500, harvest: 2, coins: 30}, "2026-10-07": {q: 6, steps: 7400, water: 2000, harvest: 1, coins: 44}});
    if (q.includes("menupatch")) { f.coins = 40; f.inv = Object.assign(f.inv || {}, {potato: 2}); }
    if (q.includes("menupatch")) { f.inv = Object.assign(f.inv || {}, {flour: 1, egg: 2, olives: 1}); }
    if (q.includes("menupatch")) { f.vine = f.vine || {}; f.vine.help = Object.assign(f.vine.help || {}, {cook: false}); }   // Mel cooks herself here (Pilar has her own test)
    if (q.includes("dinnerpatch")) { f.vine.tapas.day = "2026-01-01"; }
    if (q.includes("goatpatch")) { f.coins = 200; f.pets = f.pets || {run: 0, animals: [], next: 1}; f.pets.animals = [{id: "g1", kind: "goat", name: "Biscuit", born: Date.now(), feeds: 3, fedDay: null, col: 0}]; f.inv = Object.assign(f.inv || {}, {goatfeed: 1}); }
    if (q.includes("platepatch")) { f.vine = f.vine || {}; f.vine.shelf = [{id: "w9", name: "Test Red", type: "red", n: 40, price: 24, open: 0}]; f.vine.menu = {cheese: 40}; f.vine.lastTick = Date.now() - 600*60e3; }
    localStorage.setItem("fox.fox", JSON.stringify(f)); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, JSON.stringify(f))); });
  await page.goto(url + "?reset=1&seed=1&date=2026-10-09&time=16:00"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&sunsama=1&date=2026-10-09&time=16:00&rvpatch=1"); await page.waitForTimeout(1200);
  await page.evaluate(() => window.__mapleScene("hall")); await page.waitForTimeout(700);
  check(await page.locator('#world [data-spot="review"]').count() === 1, "the town hall has a weekly review desk");
  await page.locator('#world [data-spot="review"]').dispatchEvent("click");
  await page.waitForSelector("#ctx .rvcard", { timeout: 15000 });
  check(/10 quests done/.test(await page.locator("#ctx .rvcard h3").first().textContent()) && await page.locator("#ctx .rvcard").count() >= 7, "the scrapbook gathers the week: quests, routines, trophies, savings, words, body and garden");
  await page.waitForFunction(() => document.querySelectorAll("#ctx .rvobj li").length >= 2, null, { timeout: 8000 }).catch(() => {});
  check(await page.locator("#ctx .rvobj li.done").count() === 2, "this week's Sunsama objectives show with their ticks");
  const c0 = await page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")).coins);
  await page.fill("#rvP0", "Fill the Visibility Fix cohort"); await page.fill("#rvP1", "Ship the Chord onboarding fixes");
  await page.click('#ctx [data-rv="send"]');
  await page.waitForFunction(() => (window.__weeklyObj || []).length >= 2, null, { timeout: 8000 }).catch(() => {});
  check(await page.evaluate(() => { const o = window.__weeklyObj || []; return o.length === 2 && o.every(x => x.weekStartDay === "2026-10-12") && o[0].title === "Fill the Visibility Fix cohort"; }), "next week's priorities go to Sunsama as next week's weekly objectives");
  await page.waitForTimeout(400);
  check(await page.evaluate(c0 => { const f = JSON.parse(localStorage.getItem("fox.fox")); return !!(f.reviews && f.reviews["2026-10-05"]) && f.coins === c0 + 15; }, c0), "the review is kept, with 15 coins for doing it");
  // the kitchen behind the wine shop: ingredients from the backpack, the oven, the stove and the tapas of the day
  await page.goto(url + "?seed=1&time=18:00&menupatch=1"); await page.waitForTimeout(1200);
  await page.click('[data-open="bag"]'); await page.waitForTimeout(300);
  check(await page.locator('#bag [data-kit="potato"]').count() === 1, "garden crops in the backpack can be sent to the kitchen");
  await page.click('#bag [data-kit="potato"]'); await page.waitForTimeout(300);
  check(await page.evaluate(() => { const f = JSON.parse(localStorage.getItem("fox.fox")); return f.kitchen.larder.potato === 2 && !f.inv.potato; }), "and arrive in the larder");
  await page.keyboard.press("Escape");
  await page.evaluate(() => window.__mapleScene("wineshop")); await page.waitForTimeout(700);
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
  check(await page.locator('#ctx [data-k="tapas"]').count() === 8, "the stove offers this season's garden tapas (eight in autumn)");
  await page.click('#ctx [data-k="tapas"][data-id="tortilla"]'); await page.waitForTimeout(200); await page.click('#ctx [data-k="cooktapas"]'); await page.waitForTimeout(300);
  check(await page.evaluate(() => { const f = JSON.parse(localStorage.getItem("fox.fox")); return f.vine.tapas.id === "tortilla" && f.vine.tapas.plates === 6 && !f.kitchen.larder.potato && !f.kitchen.larder.egg; }), "today's tapas is chosen and a batch cooked from potatoes and eggs");
  await page.click('#ctx [data-k="dish"][data-dish="olives"]'); await page.waitForTimeout(300);
  check(await page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")).vine.menu.olives === 4), "small plates are cooked at the stove too");
  await page.click('#ctx [data-close]');
  await page.locator('#world [data-exit]').dispatchEvent("click");
  await page.waitForFunction(() => /wine shop/i.test(document.querySelector("#sceneName").textContent), null, { timeout: 15000 });
  check(/Tortilla/.test(await page.locator("#sceneArt").textContent()), "the shop's chalkboard names today's tapas");
  // the next day: leftovers went to the staff, who left something in the larder
  await page.goto(url + "?seed=1&time=18:00&dinnerpatch=1"); await page.waitForTimeout(4200);
  check(await page.evaluate(() => { const f = JSON.parse(localStorage.getItem("fox.fox")); return f.vine.staffNote && f.vine.staffNote.plates === 6 && f.vine.tapas.plates === 0 && f.kitchen.larder.olives >= 1; }), "leftover tapas go to the staff for dinner, and they leave thanks in the larder");
  // Hana's deli shelf and the goat
  await page.evaluate(() => window.__mapleScene("market")); await page.waitForTimeout(800);
  await page.locator('#world [data-spot="stall"]').dispatchEvent("click").catch(() => {}); await page.waitForTimeout(600);
  await page.click('#ctx [data-shop="deli"]').catch(() => {}); await page.waitForTimeout(300);
  check(await page.locator('#ctx .item[data-id="flour"], #ctx .item[data-id="cheese"], #ctx .item[data-id="olives"]').count() === 3, "Hana's market has a deli shelf: flour, cheese, olives");
  await page.click('#ctx [data-shop="animals"]'); await page.waitForTimeout(300);
  check(await page.locator('#ctx .item[data-id="goat"]').count() === 1, "and goats in the Animals tab");
  // a grown goat gives milk when fed; the olive tree is bought at the vineyard stall
  await page.goto(url + "?seed=1&time=18:00&goatpatch=1"); await page.waitForTimeout(1200);
  await page.evaluate(() => window.__mapleScene("base")); await page.waitForTimeout(700);
  await page.locator('#world [data-place="run"]').dispatchEvent("click");
  await page.waitForSelector('#ctx [data-feed]', { timeout: 15000 }); await page.click('#ctx [data-feed]'); await page.waitForTimeout(400);
  check(await page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")).inv.milk === 1), "a grown goat gives a bottle of milk when fed");
  await page.evaluate(() => window.__mapleScene("vineyard")); await page.waitForTimeout(700);
  await page.locator('#world [data-place="vinestall"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-vybuy="olive"]', { timeout: 15000 });
  await page.click('#ctx [data-vybuy="olive"]'); await page.waitForTimeout(300);
  check(await page.evaluate(() => !!JSON.parse(localStorage.getItem("fox.fox")).vine.olive), "an olive tree can be bought and planted by the path");
  await page.goto(url + "?seed=1&time=21:00&platepatch=1"); await page.waitForTimeout(4200);
  check(await page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")).vine.plates > 0), "villagers order small plates with their wine");
  await page.close();
}
{
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
  await page.waitForSelector('#vyName0', { timeout: 15000 }); await page.fill('#vyName0', "Evan's Blush"); await page.click('#ctx [data-vy="bottle"]');
  check(await page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")).vine.cellar.some(c => c.name === "Evan's Blush" && c.n === 6)), "a ready barrel is named and bottled: six bottles in the cellar");
  await page.click('#ctx [data-close]');
  await page.locator('#world [data-place="wineshop"]').dispatchEvent("click");
  await page.waitForFunction(() => /wine shop/i.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  await page.waitForTimeout(500);
  check(await page.locator('#actors [data-npc="celeste"]').count() === 1, "Celeste is behind the wine shop counter");
  await page.locator('#world [data-spot="wshelf"]').dispatchEvent("click");
  await page.waitForSelector('#ctx [data-vystock]', { timeout: 15000 }); await page.click('#ctx [data-vystock]');
  check(await page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")).vine.shelf.some(s => s.name === "Evan's Blush" && s.n === 6)), "the bottles are stocked on the shop shelves");
  await page.click('#ctx [data-close]');
  // customers while Mel's away: back-date the last tick, sales land in the honesty box
  await page.goto(url + "?seed=1&time=21:00&sold=1"); await page.waitForTimeout(4200);
  check(await page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")).vine.box > 0), "villagers buy wine while Mel's away and pay into the honesty box");
  await page.screenshot({ path: join(shots, "vineyard.png") });
  await page.close();
}
{
  // Staff: Marco and Ines pick and fill barrels, Celeste stocks the shelves, Pilar runs the kitchen; renaming; diners' tables
  console.log("\nstaff, names and the tasting room tables");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`staff pageerror: ${e.message}`));
  await page.addInitScript(() => { const q = location.search; if (!/staffpatch/.test(q)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    const H = 3600e3, t = Date.now(); f.vine = f.vine || {}; f.vine.rows = [0, 1, 2].map(i => ({trellis: i === 0, vines: [null, null, null]}));
    f.vine.rows[0].vines[0] = {v: "red", planted: t - 20*H, wateredAt: t - 9*H}; f.vine.grapes = {red: 0, white: 0}; f.vine.barrels = [null];
    f.vine.cellar = [{id: "wc1", name: "Cellar White", type: "white", n: 6}]; f.vine.shelf = [{id: "ws1", name: "Evan's Blush", type: "rose", n: 6, price: 15, open: 2}];
    f.vine.lastTick = t - 3*60e3; f.vine.menu = {}; f.vine.tapas = null;
    f.kitchen = {larder: {flour: 2, milk: 2, potato: 4, egg: 4, olives: 2, loaf: 1}, oven: null, press: null};
    localStorage.setItem("fox.fox", JSON.stringify(f)); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, JSON.stringify(f))); });
  await page.goto(url + "?reset=1&seed=1&time=11:10&date=2026-10-05"); await page.waitForTimeout(900);
  await page.goto(url + "?seed=1&time=11:10&date=2026-10-05&staffpatch=1"); await page.waitForTimeout(2500);
  const st = await page.evaluate(() => { const f = JSON.parse(localStorage.getItem("fox.fox")); return {v: f.vine, k: f.kitchen}; });
  check(st.v.rows[0].vines[0].wateredAt && Date.now() - st.v.rows[0].vines[0].wateredAt < 3600e3 && st.v.barrels[0] && st.v.barrels[0].style === "red", "Marco and Ines pick the ripe vine, water it again and fill the empty barrel with red");
  check(!st.v.cellar.length && st.v.shelf.some(s => s.name === "Cellar White" && s.n === 6), "Celeste stocks the cellar's wine on the shelves");
  check(!!st.k.oven && !!st.k.press, "Pilar puts bread in the oven and milk in the cheese press");
  check(st.v.tapas && st.v.tapas.id === "tortilla" && st.v.tapas.plates === 6, "she picks the dearest tapas the larder can make (tortilla) and cooks a batch");
  check(st.v.menu.bread > 0 && st.v.menu.olives > 0, "and cooks small plates from what's left");
  await page.evaluate(() => window.__mapleScene("kitchen")); await page.waitForTimeout(800);
  check(await page.locator('#actors [data-npc="pilar"]').count() === 1, "Pilar is in the kitchen on her shift");
  await page.locator('#world [data-spot="stove"]').dispatchEvent("click");
  await page.waitForSelector("#ctx .klog li", { timeout: 15000 });
  check(/oven|press|tortilla/i.test(await page.locator("#ctx .klog").textContent()), "the stove card lists what she's done");
  await page.screenshot({ path: join(shots, "kitchen-pilar.png") });
  await page.click('#ctx [data-close]');
  await page.evaluate(() => window.__mapleScene("wineshop")); await page.waitForTimeout(700);
  await page.locator('#world [data-spot="wcounter"]').dispatchEvent("click");
  await page.waitForSelector('#ctx [data-vyhelp="cook"]', { timeout: 15000 });
  check(await page.locator('#ctx [data-vyhelp]').count() === 5 && await page.locator('#ctx [data-vyhelp="fetch"]').isChecked() === false, "the staff card at the counter has a tick for each helper (fetching from the backpack is off to start)");
  await page.locator('#ctx [data-vyhelp="cook"]').uncheck();
  check(await page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")).vine.help.cook === false), "unticking Pilar sends her home");
  await page.fill("#vyNameV", "Bay Hill Vines"); await page.fill("#vyNameS", "Mel & Maple's Cellar"); await page.click('#ctx [data-vy="names"]'); await page.waitForTimeout(300);
  check(/Mel &amp; Maple|Mel & Maple/.test(await page.locator("#sceneName").textContent()), "the wine shop can be renamed");
  await page.screenshot({ path: join(shots, "staff-card.png") });
  await page.click('#ctx [data-close]');
  await page.evaluate(() => window.__mapleScene("vineyard")); await page.waitForTimeout(700);
  check(/Bay Hill Vines/.test(await page.locator("#sceneName").textContent()) && /Mel &amp; Maple|Mel & Maple/.test(await page.locator("#sceneArt").innerHTML()), "and the vineyard too, with the new names on the map");
  await page.goto(url + "?seed=1&time=19:45&date=2026-10-05"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__mapleScene("wineshop")); await page.waitForTimeout(1500);
  const seated = await page.locator('#actors .act-sit').count();
  check(seated > 0 && await page.locator("#tableware svg").count() >= seated, "diners in the tasting room have wine and food on their tables");
  await page.screenshot({ path: join(shots, "tasting-tables.png") });
  await page.close();
}
{
  // A path joins Makers' Lane and the vineyard directly (lane at the bottom, vineyard at the top)
  console.log("\nlane to vineyard path");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`lanepath pageerror: ${e.message}`));
  await page.goto(url + "?reset=1&seed=1&time=10:30"); await page.waitForTimeout(800);
  await page.evaluate(() => window.__mapleScene("lane")); await page.waitForTimeout(600);
  await page.locator('#world [data-place="toVineL"]').dispatchEvent("click");
  await page.waitForFunction(() => /vineyard/i.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  check(await page.locator('#world [data-place="toLaneV"]').count() === 1, "the path at the bottom of Makers' Lane leads down to the vineyard");
  await page.locator('#world [data-place="toLaneV"]').dispatchEvent("click");
  await page.waitForFunction(() => /Makers/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  check(true, "and back up again");
  await page.close();
}
{
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
  await page.evaluate(() => window.__mapleScene("base")); await page.waitForTimeout(700);
  await page.locator('#world [data-place="run"]').dispatchEvent("click");
  await page.waitForSelector('#ctx [data-feed]', { timeout: 15000 });
  check(/hungry/.test(await page.locator("#ctx .pets").textContent()), "a hen fed at breakfast is hungry again by dinner");
  await page.click('#ctx [data-feed]'); await page.waitForTimeout(400);
  check(await page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")).inv.egg === 1), "and lays an egg after her dinner");
  check(/fed and happy/.test(await page.locator("#ctx .pets").textContent()), "then she's full until the next meal");
  await page.close();
}
{
  // Ma Ma's orchard and flower farm: plant, Ma Ma picks, the farm shop, bouquets and pots, the fruit crate, tea and cake
  console.log("\nMa Ma's orchard");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`orchard pageerror: ${e.message}`));
  await page.addInitScript(() => { const q = location.search; if (!/orchpatch/.test(q)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    f.coins = 300; f.orch = f.orch || {}; f.orch.stock = {apple: 3, "stem:mum": 5}; f.orch.tin = 9;
    localStorage.setItem("fox.fox", JSON.stringify(f)); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, JSON.stringify(f))); });
  const fox = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  await page.goto(url + "?reset=1&seed=1&time=10:30&date=2026-10-07"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=10:30&date=2026-10-07&orchpatch=1"); await page.waitForTimeout(1000);
  check(await page.locator('#world [data-place="toOrchard"]').count() === 1, "home has a gate at the top left to Ma Ma's orchard");
  await page.locator('#world [data-place="toOrchard"]').dispatchEvent("click");
  await page.waitForFunction(() => /orchard/i.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  await page.waitForTimeout(800);
  check((await fox()).coins === 309, "Ma Ma hands over the farm shop's takings when you arrive");
  check(await page.locator('#actors [data-npc="mama"]').count() === 1 && await page.locator('#world [data-place="cottage"]').count() === 1 && await page.locator('#world [data-tree]').count() === 12, "Ma Ma is out among the twelve tree spots, by her cottage");
  check(await page.locator('#actors [data-npc="gonggong"]').count() === 1, "Gong Gong is helping in the orchard this morning");
  await page.locator('#world [data-tree="0"]').dispatchEvent("click");
  await page.waitForSelector('#ctx [data-or="plant"][data-k="apple"]', { timeout: 15000 });
  check(await page.locator('#ctx [data-or="plant"][data-k="peach"]').count() === 0, "only this season's saplings are on offer");
  await page.click('#ctx [data-or="plant"][data-k="apple"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.orch.trees[0] && f.orch.trees[0].k === "apple" && f.coins === 284), "an apple sapling is bought and planted");
  await page.click('#ctx [data-close]');
  await page.locator('#world [data-place="farmshop"]').dispatchEvent("click");
  await page.waitForSelector('#ctx [data-or="take"][data-k="apple"]', { timeout: 15000 });
  await page.click('#ctx [data-or="take"][data-k="apple"]'); await page.waitForTimeout(200);
  check(await fox().then(f => f.inv.apple >= 1 && f.orch.stock.apple === 2), "fruit Ma Ma picked can be taken from the farm shop");
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
  await page.evaluate(() => window.__mapleScene("wineshop")); await page.waitForTimeout(700);
  await page.locator('#world [data-spot="wshelf"]').dispatchEvent("click");
  await page.waitForSelector('#ctx [data-vyfruit="apple"]', { timeout: 15000 }); await page.click('#ctx [data-vyfruit="apple"]'); await page.waitForTimeout(200);
  check(await fox().then(f => f.vine.fruit.apple >= 1 && !f.inv.apple), "fruit goes into the wine shop's fruit crate to sell");
  await page.goto(url + "?seed=1&time=15:30&date=2026-10-07"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__mapleScene("cottage")); await page.waitForTimeout(900);
  check(await page.locator('#actors [data-npc="mama"]').count() === 1, "Ma Ma's home in her cottage at teatime");
  const c0 = (await fox()).coins;
  await page.locator('#world [data-spot="tea"]').dispatchEvent("click");
  await page.waitForSelector('#ctx [data-or="tea"]', { timeout: 15000 }); await page.click('#ctx [data-or="tea"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.coins === c0 + 3 && f.orch.tea === "2026-10-07"), "tea and cake with Ma Ma, once a day");
  await page.click('[data-open="bag"]'); await page.click('#bag .item[data-id="bq_mum"]'); await page.waitForTimeout(400);
  check(await fox().then(f => f.bouquets && f.bouquets.mama === 1 && !f.inv.bq_mum), "a bouquet can be given to Ma Ma (or anyone nearby)");
  await page.screenshot({ path: join(shots, "cottage.png") });
  await page.close();
}
{
  // The bank: six vault jars of jewels for savings goals
  console.log("\nthe bank");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(url + "?reset=1&seed=1&time=10:30");
  await page.waitForTimeout(800);
  await page.locator('#world [data-place="toTown"]').dispatchEvent("click");
  await page.waitForFunction(() => /Town square/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  check(await page.locator('#world [data-place="bank"]').count() === 1, "the town square has a bank");
  await page.locator('#world [data-place="bank"]').dispatchEvent("click");
  await page.waitForFunction(() => /bank/i.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  check(await page.locator('#world [data-spot^="vault"]').count() === 5, "with five vaults along the back wall");
  await page.locator('#world [data-spot="vault0"]').dispatchEvent("click");
  await page.waitForSelector("#vForm", { timeout: 15000 });
  await page.fill("#vLabel", "Japan trip"); await page.fill("#vGoal", "1000"); await page.selectOption("#vStep", "100"); await page.click('#ctx [data-vcol="emerald"]'); await page.click('#vForm button[type="submit"]');
  await page.waitForSelector("#vAdd", { timeout: 5000 });
  await page.fill("#vAmt", "400"); await page.click("#vAdd button");
  check(await page.locator("#ctx .vdrop").count() > 3, "adding savings pours jewels in");
  await page.waitForFunction(() => !document.querySelector("#ctx .vdrop"), null, { timeout: 8000 }).catch(() => {});
  check(/\$400 of \$1,000/.test(await page.locator("#ctx .sub").textContent()) && await page.evaluate(() => (JSON.parse(localStorage.getItem("fox.vaults")).jars || []).some(j => j.label === "Japan trip" && j.amount === 400 && j.color === "emerald")), "then the jar is capped, and the savings are kept privately");
  await page.fill("#vAmt", "600"); await page.click("#vAdd button");
  await page.waitForFunction(() => !document.querySelector("#ctx .vdrop"), null, { timeout: 8000 }).catch(() => {}); await page.waitForTimeout(600);
  check(await page.locator("#ctx .vspark").count() > 0 && /full/.test(await page.locator("#ctx .sub").textContent()), "a full jar sparkles");
  await page.click('#ctx [data-vb="empty"]'); await page.waitForTimeout(200);
  check(/\$0 of/.test(await page.locator("#ctx .sub").textContent()), "and can be emptied any time");
  await page.click("#undoBtn"); await page.waitForTimeout(200);
  check(/full/.test(await page.locator("#ctx .sub").textContent()), "with Undo");
  await page.close();
}
await browser.close();
if (errors.length) { console.log("\n" + errors.join("\n")); process.exit(1); }
console.log("\nall good");
