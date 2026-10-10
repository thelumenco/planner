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
// Most checks expect a reload to start at home base: pages opt out of "pick up where Mel left off" (core.js F.where)
// unless they ask for it with newPage({resume: true}).
{ const np = browser.newPage.bind(browser); browser.newPage = async (o = {}) => { const { resume, ...rest } = o; const pg = await np(rest); if (!resume) await pg.addInitScript(() => { window.__mapleNoResume = true; }); return pg; }; }
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
  await page.waitForFunction(() => /^1L/.test(document.getElementById("waterNote").textContent), null, { timeout: 3000 }).catch(async () => {   // (on a busy machine the notebook can redraw under the typing: once more)
    await page.fill("#nbTrack", "1000"); await page.click('#notebook [data-nb="wset"]'); await page.waitForTimeout(800); });
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
  await page.locator('#world [data-spot="officedoor"]').dispatchEvent("click");
  await page.waitForFunction(() => /office/i.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 }); await page.waitForTimeout(600);
  check(await page.locator('#actors [data-npc="darren"].act-type').count() === 1, "Darren is typing at his desk in the home office on a weekday morning");
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
  await page.click('#bag .item[data-id="icecream"]'); await page.click('#bag [data-giveto="evan"]');
  await page.waitForTimeout(300);
  check(await page.locator("#evanHold path").count() > 0 && await page.locator("#evanSay").textContent().then(t => /ICE CREAM/.test(t)), "Evan gets his ice cream");
  check(await page.locator("#panel").isHidden() && await page.locator("#evanSay .who").textContent() === "Evan", "the backpack closes so you can see Evan say thank you, with his name on the bubble");
  await page.click('[data-open="bag"]');
  await page.click('#bag .item[data-id="kopi"]');
  check(await page.locator('#bag [data-giveto="darren"]').textContent().then(t => /send it/.test(t)), "tapping a gift opens a chooser: who it suits, and whether they're here or it gets sent");
  await page.click('#bag [data-giveto="darren"]'); await page.waitForTimeout(300);
  check(await page.locator("#speech").textContent().then(t => /sent to Darren/.test(t)) && await page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")).thanks.length === 1), "a gift for someone who isn't here is sent round, with a thank-you note to follow");
  await page.addInitScript(() => { if (!/thankspatch/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f || !f.thanks) return;
    f.thanks.forEach(t => { t.at = Date.now() - 60e3; }); const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?seed=1&nosample=1&time=20:00&date=2026-10-05&thankspatch=1");
  await page.waitForTimeout(1000);
  check(await page.locator('#actors [data-npc="darren"].act-rest').count() === 1, "Darren rests in his hammock in the evening");
  await page.click('[data-open="mail"]'); await page.waitForTimeout(300);
  check(/Thank you from Darren/.test(await page.locator("#mailView").textContent()), "Darren's thank-you note arrives in the mailbox");
  await page.click('[data-open="mail"]').catch(() => {});
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
  await page.locator('#world [data-spot="gdoor"]').dispatchEvent("click");
  await page.waitForFunction(() => /garage/i.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
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
  { const c1 = await page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")).coins);
    check(await page.locator("#undoBar").isVisible() && /Ticked off/.test(await page.locator("#undoMsg").textContent()), "ticking a chore offers Undo");
    await page.click("#undoBtn"); await page.waitForTimeout(300);
    check(await page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")).coins) === c1 - 1 && await page.locator('#ctx [data-hdone^="daily:"]:checked').count() === 0, "Undo unticks it and takes the coin back");
    await page.locator('#ctx [data-hdone^="daily:"]').first().click(); await page.waitForTimeout(300); }
  // after a reload the cloud copy loads (frozen, like the real database): ticking must still stick, and a delete can be undone
  await page.waitForTimeout(1200);
  await page.goto(url + "?seed=1&nosample=1&time=19:30&date=2026-10-05"); await page.waitForTimeout(900);
  await page.locator('#world [data-place="home"]').dispatchEvent("click");
  await page.waitForFunction(() => /^Home/.test(document.querySelector("#sceneName").textContent.trim()) && !/base/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  await page.waitForTimeout(400);
  await page.locator('#world [data-spot="gdoor"]').dispatchEvent("click");
  await page.waitForFunction(() => /garage/i.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 }); await page.waitForTimeout(400);
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
  await page.evaluate(() => window.__mapleScene("home")); await page.waitForTimeout(800);   // the fridge is back in the living room
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
  await page.evaluate(() => window.__mapleScene("garage")); await page.waitForTimeout(800);
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
  { const t = await page.locator("#ctx").textContent();
    check(/Village calendar/.test(t) && /Night market, 5:30pm to 10pm/.test(t) && /Sunday farmers market/.test(t) && /Deepavali/.test(t) && /Family dinner at/.test(t), "the good news board pins up the village calendar: markets, the night market, family dinners and festivals coming up"); }
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
  // a later day's task ticked off early in Sunsama (it comes back in today's list): not on today's boards, but paid now
  const cA = await page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")).coins);
  await page.goto(url + "?sunsama=1&ahead=1&time=12:00"); await page.waitForTimeout(2500);
  check(await page.evaluate(c => { const f = JSON.parse(localStorage.getItem("fox.fox")), p = JSON.parse(localStorage.getItem("fox.plan") || "{}");
    return f.early.a1 === "2099-12-31" && f.coins >= c + 5 && !(p.tasks || []).some(t => t.id === "a1"); }, cA), "a later day's task ticked off early in Sunsama pays now, and stays off today's boards");
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
  check(await page.evaluate(c => JSON.parse(localStorage.getItem("fox.fox")).coins === c + 8, subC0), "a subtask in a treadmill batch pays like a quest (8 coins)");
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
  check(await page.evaluate(() => getComputedStyle(document.getElementById("world")).getPropertyValue("--sea").trim().toUpperCase() === "#8FC1DE" && getComputedStyle(document.getElementById("world")).getPropertyValue("--card").trim().toUpperCase() === "#F9F7F2"), "the village keeps its own colours in dark mode (only the panels go dark)");
  await page.emulateMedia({ colorScheme: "light" });
  await page.click("#setSfx"); check(!(await page.locator("#setSfx").isChecked()), "sound effects can be muted");
  await page.emulateMedia({ colorScheme: "dark" });
  check(await page.evaluate(() => { const i = document.getElementById("nameIn"); return !i || getComputedStyle(i).color === "rgb(47, 43, 40)"; }), "typed text in panels stays dark ink in dark mode");
  await page.emulateMedia({ colorScheme: "light" });
  await page.click("#pclose");
  await page.locator('#world [data-place="home"]').dispatchEvent("click");
  await page.waitForFunction(() => /Home/.test(document.querySelector("#sceneName").textContent) && !/base/i.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  await page.locator('#world [data-spot="officedoor"]').dispatchEvent("click");
  await page.waitForFunction(() => /office/i.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
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
  check(coins1 - coins0 === (steps - 1) + 8, `each routine step earns a coin and finishing the routine earns an 8-coin bonus, once a day (+${coins1 - coins0})`);
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
  page.on("dialog", d => { errors.push("bedtime used a browser pop-up (blocked in the artifact frame)"); d.dismiss(); });
  await page.click("#bedUp"); await page.waitForTimeout(300);
  check(await page.locator("#bedSure").isVisible(), "\"I really need to get up\" asks inside the card (no browser pop-up, which the artifact frame blocks)");
  await page.click("#bedNo"); await page.waitForTimeout(300);
  check(!(await page.locator("#bedLock").isHidden()) && await page.locator("#bedUp").isVisible(), "\"Back to sleep\" keeps the village resting");
  await page.click("#bedUp"); await page.click("#bedYes"); await page.waitForTimeout(1500);
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
  await page.waitForFunction(() => /garage/i.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
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
    if (q.includes("dinnerpatch")) { (f.vine.tapasList || []).forEach(t => { t.day = "2026-01-01"; }); }
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
  check(await page.locator('#ctx [data-k="tapas"]').count() === 38, "the stove offers this season's tapas (38 in autumn: garden, seafood, farm, woods, greenhouse, Sal's clams, Kyoto and Jeju)");
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
  await page.evaluate(() => window.__mapleScene("market")); await page.waitForTimeout(800);
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
  await page.evaluate(() => window.__mapleScene("base")); await page.waitForTimeout(700);
  await page.locator('#world [data-place="run"]').dispatchEvent("click");
  await page.waitForSelector('#ctx [data-feed]', { timeout: 15000 }); await page.click('#ctx [data-feed]'); await page.waitForTimeout(400);
  check(await page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")).inv.goatmilk === 1), "a grown goat gives a bottle of goat's milk when fed");
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
  await page.waitForSelector('#vyName0', { timeout: 15000 });
  const ph = await page.locator('#vyName0').getAttribute("placeholder"); await page.click('#ctx [data-vy="suggest"]'); await page.waitForTimeout(300);
  const sug = await page.locator('#vyName0').inputValue();
  check(ph && sug && ph !== "Name it" && sug !== ph && sug.length > 3, `a ready barrel suggests names (${ph}; ${sug})`);
  await page.fill('#vyName0', "Evan's Blush"); await page.click('#ctx [data-vy="bottle"]');
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
  await page.locator('#world [data-spot="menu"]').dispatchEvent("click");
  await page.waitForSelector("#ctx .chalk", { timeout: 15000 });
  check(/Today's menu/.test(await page.locator("#ctx h2").textContent()) && /Evan's Blush/.test(await page.locator("#ctx").textContent()), "the chalkboard opens today's menu: what's available, with prices");
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
  { const tr = await import(new URL("../src/game/tours.js", import.meta.url)), np = await import(new URL("../src/data/npcs.js", import.meta.url)), cel = np.NPCS.find(n => n.id === "celeste");
    const days = ["2026-10-10", "2026-10-11", "2026-10-12", "2026-10-13", "2026-10-14", "2026-10-15", "2026-10-16"];
    check(days.every(d => tr.touristTastings(d).filter(x => x.act === "browse" && x.from <= 650 && x.to > 650 && x.id).length === 2) && cel.routine.some(sl => sl.scene === "wineshop" && sl.from === 600),
      "the wine shop opens at 10: Celeste's at the counter and a pair are browsing the shelves at 10:50, every day of the week"); }
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`staff pageerror: ${e.message}`));
  await page.addInitScript(() => { const q = location.search; if (!/staffpatch/.test(q)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    const H = 3600e3, t = Date.now(); f.vine = f.vine || {}; f.vine.rows = [0, 1, 2].map(i => ({trellis: i === 0, vines: [null, null, null]}));
    f.vine.rows[0].vines[0] = {v: "red", planted: t - 20*H, wateredAt: t - 9*H}; f.vine.grapes = {red: 0, white: 0}; f.vine.barrels = [null];
    f.vine.cellar = [{id: "wc1", name: "Cellar White", type: "white", n: 6}]; f.vine.shelf = [{id: "ws1", name: "Evan's Blush", type: "rose", n: 6, price: 15, open: 2}];
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
  await page.goto(url + "?seed=1&time=19:05&date=2026-10-07"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__mapleScene("wineshop")); await page.waitForTimeout(1200);
  check(await page.locator('#actors [data-npc="farid"].act-sit').count() === 1 && await page.locator('#actors [data-npc="mei"].act-sit').count() === 1 && await page.locator("#actors .act-sit").count() >= 5, "after work the orchard's farmhands come in for a tasting too (five at the tables at 7pm)");
  await page.goto(url + "?seed=1&time=19:05&date=2026-10-07"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__mapleScene("wineshop")); await page.waitForTimeout(1200);
  check(await page.locator('#actors [data-npc="farid"].act-sit').count() === 1 && await page.locator('#actors [data-npc="mei"].act-sit').count() === 1 && await page.locator("#actors .act-sit").count() >= 5, "after work the orchard's farmhands come in for a tasting too (five at the tables at 7pm)");
  await page.goto(url + "?seed=1&time=13:20&date=2026-10-07"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__mapleScene("wineshop")); await page.waitForTimeout(1200);
  check(await page.locator("#actors .act-sit").evaluateAll(n => n.filter(x => ["aiko", "ben", "clara", "dev", "rosa", "bastien", "grace", "hiro"].includes(x.dataset.npc)).length) === 2, "out-of-towners drop in for a lunchtime tasting");
  await page.goto(url + "?seed=1&time=19:45&date=2026-10-05"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__mapleScene("wineshop")); await page.waitForTimeout(1500);
  const seated = await page.locator('#actors .act-sit').count();
  check(seated > 0 && await page.locator("#tableware svg").count() >= seated, "diners in the tasting room have wine and food on their tables");
  check(await page.evaluate(n => { const v = JSON.parse(localStorage.getItem("fox.fox")).vine; return v.today.glasses >= n && v.shelf.length > 0; }, seated), "everyone who sits down orders a glass, poured from an opened bottle");
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
  check(await page.locator('#bag [data-giveto="dad"]').count() === 1 && await page.locator('#bag [data-giveto="mama"].primary').count() === 1, "a bouquet opens the chooser: the whole family, whoever's here first");
  await page.click('#bag [data-giveto="mama"]'); await page.waitForTimeout(400);
  check(await fox().then(f => f.bouquets && f.bouquets.mama === 1 && !f.inv.bq_mum), "a bouquet can be given to Ma Ma in person (or sent to anyone in the family)");
  await page.screenshot({ path: join(shots, "cottage.png") });
  await page.close();
}
{
  // Orchard workers, visitors and weekend tours (paid into Ma Ma's tin); Darren's weekday tours
  console.log("\norchard tours");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`tours pageerror: ${e.message}`));
  await page.addInitScript(() => { if (!/tourpatch/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    const t = Date.now(); f.orch = {trees: [{k: "apple", at: t, next: t + 9e7}, {k: "pear", at: t, next: t + 9e7}, null, null, null, null, null, null, null, null, null, null],
      beds: [{k: "mum", at: t, next: t + 9e7}, null, null, null, null, null, null, null, null, null, null, null], bushes: [null, null, null, null], stock: {}, tin: 0, lastTick: t};
    localStorage.setItem("fox.fox", JSON.stringify(f)); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, JSON.stringify(f))); });
  await page.goto(url + "?reset=1&seed=1&time=10:20&date=2026-10-10"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=10:20&date=2026-10-10&tourpatch=1"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__mapleScene("orchard")); await page.waitForTimeout(1200);
  const ids = await page.locator("#actors .npc").evaluateAll(n => n.map(x => x.dataset.npc));
  check(ids.filter(x => ["hana", "okada", "juniper", "bo", "lin", "pip", "opal", "theo"].includes(x)).length >= 1 && ids.filter(x => ["aiko", "ben", "clara", "dev", "elena", "felix", "grace", "hiro"].includes(x)).length >= 1 && ids.some(x => ["mama", "gonggong", "farid", "mei"].includes(x)), "a Saturday morning tour: a guide with a mix of villagers and out-of-towners in the orchard");
  check(await page.locator('#actors [data-npc="farid"]').count() + await page.locator('#actors .act-guide').count() >= 1, "Farid works the orchard (or is leading the tour)");
  await page.locator('#world [data-place="farmshop"]').dispatchEvent("click"); await page.waitForSelector("#ctx .ortour", { timeout: 15000 });
  check(/10am with .*11:30.*2pm.*4pm/.test(await page.locator("#ctx .ortour").textContent()), "the farm shop lists today's four tours and their guides");
  await page.click('#ctx [data-close]'); await page.locator('#world [data-place="toursign"]').dispatchEvent("click"); await page.waitForSelector("#ctx .wlist", { timeout: 15000 });
  check(await page.locator("#ctx .wlist li").count() === 4 && /on now/.test(await page.locator("#ctx").textContent()) && /Signed up: .*\(visiting\)/.test(await page.locator("#ctx").textContent()), "the tour sign shows today's tours, which one's on now, and who's signed up");
  await page.goto(url + "?seed=1&time=11:05&date=2026-10-10"); await page.waitForTimeout(2500);
  check(await page.evaluate(() => { const o = JSON.parse(localStorage.getItem("fox.fox")).orch; return o.tin >= 12 && o.tin % 4 === 0 && o.toursPaid.done.includes(0); }), "when a tour finishes, its visitors pay 4 coins each into Ma Ma's tin");
  await page.goto(url + "?seed=1&time=18:00&date=2026-10-08"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__mapleScene("orchard")); await page.waitForTimeout(1200);
  check(await page.locator('#actors [data-npc="darren"].act-guide').count() === 1, "on Thursday evenings Darren leads a farm tour");
  await page.evaluate(() => window.__mapleScene("flowers")); await page.waitForTimeout(400);
  await page.goto(url + "?seed=1&time=10:00&date=2026-10-08"); await page.waitForTimeout(800);
  await page.evaluate(() => window.__mapleScene("flowers")); await page.waitForTimeout(1200);
  check(await page.locator('#actors [data-npc="mei"]').count() === 1, "Mei looks after the flower farm");
  await page.close();
}
{
  // The field (lake, swans, picnic, football) between the orchard and town; gifts for Ma Ma and Gong Gong
  console.log("\nthe field and grandparents' gifts");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`field pageerror: ${e.message}`));
  await page.addInitScript(() => { if (!/giftpatch/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    f.coins = 100; localStorage.setItem("fox.fox", JSON.stringify(f)); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, JSON.stringify(f))); });
  await page.goto(url + "?reset=1&seed=1&time=16:10&date=2026-10-09"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=16:10&date=2026-10-09&giftpatch=1"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__mapleScene("village")); await page.waitForTimeout(600);
  check(await page.locator('#world [data-place="toField"]').count() === 1, "the town square has a path west to the field");
  await page.locator('#world [data-place="toField"]').dispatchEvent("click");
  await page.waitForFunction(() => /field/i.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 }); await page.waitForTimeout(900);
  check(await page.locator('#actors [data-npc="pip"]').count() === 1 && await page.locator('#actors [data-npc="mama"]').count() === 1 && await page.locator('#actors [data-npc="gonggong"]').count() === 1, "on a Friday afternoon Pip's playing football and Ma Ma and Gong Gong are walking by the lake (4pm)");
  await page.locator('#world [data-place="lake"]').dispatchEvent("click"); await page.waitForTimeout(4500);
  check(await page.evaluate(() => JSON.parse(localStorage.getItem("fox.today") || "{}").swans === "2026-10-09" || /swan/i.test(document.querySelector("#speech").textContent)), "the swans can be fed");
  await page.click('[data-open="bag"]').catch(() => {}); await page.keyboard.press("Escape");
  await page.evaluate(() => window.__mapleScene("market")); await page.waitForTimeout(800);
  await page.waitForSelector('#ctx [data-shop="family"]', { timeout: 20000 }); await page.click('#ctx [data-shop="family"]');
  check(await page.locator('#ctx .item[data-id="mooncake"]').count() === 1 && await page.locator('#ctx .item[data-id="birdsnest"]').count() === 1, "Hana sells nyonya kueh, bird's nest, chicken essence, and mooncakes in autumn");
  check(/Mum or Dad/.test(await page.locator('#ctx .item[data-id="kuehlapis"]').textContent()) && await page.locator('#ctx .item[data-id="protbar"]').count() === 1 && await page.locator('#ctx .item[data-id="bubbletea"]').count() === 1,
    "the kuehs suit Mum and Dad too, and there are gifts for Marcus (dairy-free protein) and Angellina");
  await page.click('#ctx .item[data-id="ondeh"]'); await page.waitForTimeout(200);
  await page.evaluate(() => window.__mapleScene("field")); await page.waitForTimeout(1000);
  await page.click('[data-open="bag"]'); await page.click('#bag .item[data-id="ondeh"]'); await page.click('#bag [data-giveto].primary'); await page.waitForTimeout(400);
  check(await page.evaluate(() => { const f = JSON.parse(localStorage.getItem("fox.fox")); return !f.inv.ondeh && ((f.fam.gifts.mama || 0) + (f.fam.gifts.gonggong || 0)) === 1; }), "the ondeh-ondeh goes to Ma Ma or Gong Gong (whoever's here)");
  await page.goto(url + "?seed=1&time=10:30&date=2026-10-07"); await page.waitForTimeout(800);
  await page.evaluate(() => window.__mapleScene("orchard")); await page.waitForTimeout(600);
  await page.locator('#world [data-place="toFieldO"]').dispatchEvent("click");
  await page.waitForFunction(() => /field/i.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  check(true, "and the field is up the path from the top of the orchard");
  await page.close();
}
{
  // A busy weekend: tourist families at the vineyard playground (and a roundabout), the Sunday farmers market at the field
  // with the wine shop's stall selling off the shop's own shelves, and the field fair on the last Saturday of the month
  console.log("\nplayground families, farmers market, field fair");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`market pageerror: ${e.message}`));
  await page.addInitScript(() => { if (!/mktpatch/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    f.coins = 100; f.vine = f.vine || {}; f.vine.shelf = [{id: "m1", name: "Market Red", type: "red", n: 40, price: 18, open: 0}]; f.vine.lastTick = Date.now() - 290*60e3;
    f.orch = f.orch || {}; f.orch.stock = {apple: 60, "stem:rose": 20}; f.orch.lastTick = Date.now() - 290*60e3;
    localStorage.setItem("fox.fox", JSON.stringify(f)); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, JSON.stringify(f))); });
  const kids = ["lily", "max", "noah", "zara", "ollie", "ava"];
  await page.goto(url + "?reset=1&seed=1&time=10:40&date=2026-10-10"); await page.waitForTimeout(800);
  await page.evaluate(() => window.__mapleScene("vineyard")); await page.waitForTimeout(1200);
  check(await page.locator("#actors .npc").evaluateAll((n, k) => n.filter(x => k.includes(x.dataset.npc)).length, kids) >= 3 && await page.locator('#world [data-place="pround"]').count() === 1, "on a Saturday morning visiting families' kids fill the playground, roundabout and all");
  await page.goto(url + "?seed=1&time=12:55&date=2026-10-11&mktpatch=1"); await page.waitForTimeout(2500);
  check(await page.evaluate(() => { const v = JSON.parse(localStorage.getItem("fox.fox")).vine; return v.shelf[0].n < 40; }), "on a Sunday morning the market stall sells bottles off the wine shop's own shelves");
  await page.evaluate(() => window.__mapleScene("field")); await page.waitForTimeout(1200);
  check(await page.evaluate(() => { const o = JSON.parse(localStorage.getItem("fox.fox")).orch; return o.stock.apple + o.stock["stem:rose"] < 80 && o.tin > 0; }), "Ma Ma's market stall sells fruit and flowers off the farm shop's own shelves, into her tin");
  check(await page.locator('#world [data-place^="mstall"]').count() === 9 && await page.locator('#actors [data-npc="ines"]').count() === 1 && await page.locator('#actors [data-npc="mama"]').count() === 1, "the Sunday farmers market: eight stalls along the top (and Noor's adoption corner), our wine stall with Ines and Ma Ma's fruit and flowers");
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
  check(/market stall/.test(await page.locator("#ctx h2").textContent()) && await page.locator('#ctx [data-or="tab"][data-k="plant"]').count() === 0, "Ma Ma's stall shares the farm shop's shelves, fruit and flowers only (no planting)");
  await page.click('#ctx [data-or="take"]'); await page.waitForTimeout(300);
  check(await page.evaluate(() => (JSON.parse(localStorage.getItem("fox.fox")).inv.apple || 0) >= 1), "Mel can take fruit from Ma Ma's stall for free");
  await page.click('#ctx [data-close]');
  const mfox = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  await page.locator('#world [data-place="mstall2"]').dispatchEvent("click"); await page.waitForSelector('#ctx .item[data-id]', { timeout: 15000 });
  check(await page.locator('#ctx .item[data-id]').evaluateAll(b => b.map(x => x.dataset.id)).then(ids => ids.length >= 2 && ids.every(id => ["carrot", "corn", "strawberry", "blueberry", "tomato", "potato", "pepper", "pea", "pumpkin", "leek"].includes(id))), "Clara's produce stall sells what's in season, for when the garden's between harvests");
  await page.click('#ctx [data-close]');
  await page.locator('#world [data-place="mstall1"]').dispatchEvent("click"); await page.waitForSelector('#ctx .item[data-id="honey"]', { timeout: 15000 });
  check(await page.locator('#ctx .item[data-id="beecandle"]').count() === 1 && /for the family/.test(await page.locator('#ctx .item[data-id="honey"]').textContent()), "Felix's honey stall: honey, honeycomb and beeswax candles, gifts for the family");
  const m0 = (await mfox()).coins; await page.click('#ctx .item[data-id="honey"]'); await page.waitForTimeout(300);
  check(await mfox().then(f => f.inv.honey === 1 && f.coins === m0 - 8) && await page.locator("#undoBar").isVisible(), "buying honey offers an undo");
  await page.click("#undoBtn"); await page.waitForTimeout(300);
  check(await mfox().then(f => !f.inv.honey && f.coins === m0), "undo puts the coins back and the honey back on the stall");
  await page.click('#ctx .item[data-id="honey"]'); await page.waitForTimeout(300); await page.click('#ctx [data-close]');
  const g0 = await mfox().then(f => Object.values(f.fam.gifts).reduce((a, b) => a + b, 0));
  await page.click('[data-open="bag"]'); await page.click('#bag .item[data-id="honey"]'); await page.click('#bag [data-giveto].primary'); await page.waitForTimeout(400);
  check(await mfox().then(f => !f.inv.honey && Object.values(f.fam.gifts).reduce((a, b) => a + b, 0) === g0 + 1), "market honey can be given to anyone in the family who's here");
  await page.click('[data-open="bag"]').catch(() => {});
  for (const [st, id] of [["mstall5", "soap_lav"], ["mstall6", "paleale"]]) { await page.locator(`#world [data-place="${st}"]`).dispatchEvent("click"); await page.waitForSelector(`#ctx .item[data-id="${id}"]`, { timeout: 15000 }); await page.click('#ctx [data-close]'); }
  check(true, "Grace's handmade soap stall and Ben's craft beer stall");
  await page.goto(url + "?seed=1&time=11:00&date=2026-10-31"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__mapleScene("field")); await page.waitForTimeout(1200);
  check(/Field fair/.test(await page.locator("#sceneArt").textContent()) && await page.locator('#world [data-place^="mstall"]').count() === 5, "on the last Saturday of the month the field fair is on: kites, face painting, lemonade, snacks");
  await page.close();
}
{
  // The foreshore (west of the field): the sea with dolphins and paddleboarders, two family houses, Mum, Dad, Marcus and
  // Angellina with their routines, Mum's exercise class at the field, a family paddle, and gifts for the family
  console.log("\nthe foreshore and Mel's family");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`shore pageerror: ${e.message}`));
  const ffox = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  await page.addInitScript(() => { if (!/shorepatch/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    f.inv = f.inv || {}; f.inv.paleale = 1; localStorage.setItem("fox.fox", JSON.stringify(f)); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, JSON.stringify(f))); });
  const ids = () => page.locator("#actors .npc").evaluateAll(n => n.map(x => x.dataset.npc));
  await page.goto(url + "?reset=1&seed=1&time=07:30&date=2026-10-06"); await page.waitForTimeout(800);
  await page.evaluate(() => window.__mapleScene("field")); await page.waitForTimeout(600);
  check(await page.locator('#world [data-place="toShoreF"]').count() === 1 && await page.locator('#world [data-place="exlawn"]').count() === 1, "the field has a gate west to the foreshore, and the exercise lawn");
  await page.goto(url + "?seed=1&time=07:30&date=2026-10-06&shorepatch=1"); await page.waitForTimeout(800);
  await page.evaluate(() => window.__mapleScene("shore")); await page.waitForTimeout(1500);
  check(await page.locator('#world [data-place="mumdad"]').count() === 1 && await page.locator('#world [data-place="marcus"]').count() === 1 && await page.locator('#world [data-place="suprack"]').count() === 1
    && await page.locator('#world [data-place="toFieldS"]').count() === 1 && await page.locator('#world [data-place="toFlowersS"]').count() === 1, "the foreshore: Mum and Dad's house, Marcus and Angellina's, the paddleboards, gates to the field and the flower farm");
  check(await ids().then(a => a.includes("mum") && a.includes("dad")), "early on a Tuesday Mum's out for her walk and Dad's sketching on the sand");
  await page.click('[data-open="bag"]'); await page.click('#bag .item[data-id="paleale"]'); await page.click('#bag [data-giveto="dad"]'); await page.waitForTimeout(400);
  check(await ffox().then(f => !f.inv.paleale && f.fam.gifts.dad === 1), "a craft pale ale from the market can go to Dad");
  await page.click('[data-open="bag"]').catch(() => {});
  await page.locator('#world [data-place="suprack"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-sup="play"]', { timeout: 15000 });
  check(await page.locator('#ctx [data-sup="base"]').count() === 1, "the paddleboards offer a paddle about, or a paddle home");
  await page.click('#ctx [data-sup="play"]'); await page.waitForTimeout(4000);
  check(await page.locator("#mel.sup").count() === 1 && await page.locator('#actors [data-npc="mum"].act-sup, #actors [data-npc="dad"].act-sup').count() === 2, "a family paddle: Mel takes a board out and Mum and Dad paddle out too");
  await page.goto(url + "?seed=1&time=16:30&date=2026-10-10"); await page.waitForTimeout(800);
  await page.evaluate(() => window.__mapleScene("shore")); await page.waitForTimeout(1500);
  check(await page.locator('#actors [data-npc="marcus"].act-sup').count() === 1 && await page.locator('#actors [data-npc="angelina"].act-sup').count() === 1, "on weekend afternoons Marcus and Angellina go paddleboarding");
  await page.goto(url + "?seed=1&time=15:30&date=2026-10-11"); await page.waitForTimeout(800);
  await page.evaluate(() => window.__mapleScene("shore")); await page.waitForTimeout(1500);
  check(await page.locator('#actors [data-npc="darren"].act-sup').count() === 1, "Darren goes paddleboarding on Sunday afternoons");
  await page.goto(url + "?seed=1&time=09:30&date=2026-10-06"); await page.waitForTimeout(800);
  await page.evaluate(() => window.__mapleScene("mumdad")); await page.waitForTimeout(1200);
  check(await ids().then(a => a.includes("dad")) && ["piano", "bass", "easel", "mat"].length === await page.locator("#world [data-spot]").evaluateAll(n => n.filter(x => ["piano", "bass", "easel", "mat"].includes(x.dataset.spot)).length), "inside Mum and Dad's: Dad at the piano, his double bass and easel, Mum's mat");
  await page.goto(url + "?seed=1&time=20:00&date=2026-10-05"); await page.waitForTimeout(800);
  await page.evaluate(() => window.__mapleScene("marcus")); await page.waitForTimeout(1200);
  check(await page.locator('#actors [data-npc="marcus"].act-game').count() === 1 && await ids().then(a => a.includes("angelina")), "evenings at Marcus and Angellina's: Marcus gaming on the sofa, Angellina beside him");
  await page.goto(url + "?seed=1&time=10:00&date=2026-10-05"); await page.waitForTimeout(800);
  await page.evaluate(() => window.__mapleScene("bank")); await page.waitForTimeout(1200);
  check(await ids().then(a => a.includes("marcus") && a.includes("opal")), "on Mondays Marcus works at the bank alongside Opal");
  await page.goto(url + "?seed=1&time=08:20&date=2026-10-06"); await page.waitForTimeout(800);
  await page.evaluate(() => window.__mapleScene("field")); await page.waitForTimeout(1200);
  check(await page.locator('#actors [data-npc="mum"].act-lead').count() === 1 && await page.locator("#actors .act-exercise").count() === 3, "Mum leads her class on the exercise lawn at 8, three villagers joining in");
  const c0 = (await ffox()).coins; await page.locator('#world [data-place="exlawn"]').dispatchEvent("click"); await page.waitForTimeout(8500);
  check(await page.locator("#mel.exercise").count() === 1 && (await ffox()).coins === c0 + 2, "Mel can join Mum's class (a couple of coins, once a day)");
  await page.close();
}
{
  // Family dinners (Wednesdays and Sundays, rotating round the four houses), who's where today, and the family and
  // villagers out and about: the vineyard, the Sunday market, Makers' Lane
  console.log("\nfamily dinners and who's where");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`dinner pageerror: ${e.message}`));
  const ids = () => page.locator("#actors .npc").evaluateAll(n => n.map(x => x.dataset.npc));
  const fam = ["darren", "mama", "gonggong", "mum", "dad", "marcus", "angelina"];
  await page.goto(url + "?reset=1&seed=1&time=19:00&date=2026-10-07"); await page.waitForTimeout(800);
  await page.evaluate(() => window.__mapleScene("cottage")); await page.waitForTimeout(2500);
  check(await ids().then(a => fam.every(f => a.includes(f))) && await page.locator("#actors .sfront").count() === 1, "Wednesday family dinner at Ma Ma and Gong Gong's: all seven round the big table (drawn in front of those along the back)");
  await page.locator('#world [data-spot="dine"]').dispatchEvent("click"); await page.waitForTimeout(2500);
  check(await page.locator("#mel.sit").count() === 1 && await page.locator("#evan.sit").count() === 1, "Mel takes her seat at the table, and Evan's in his");
  for (const h of ["home", "mumdad", "marcus"]) { await page.evaluate(h => window.__mapleScene(h), h); await page.waitForTimeout(500);
    check(await page.locator('#world [data-spot="dine"]').count() === 1, `there's a family dining table at ${h}`); }
  await page.goto(url + "?seed=1&time=19:00&date=2026-10-11"); await page.waitForTimeout(800);
  await page.evaluate(() => window.__mapleScene("mumdad")); await page.waitForTimeout(2500);
  check(await ids().then(a => fam.every(f => a.includes(f))), "Sunday's dinner is at Mum and Dad's (the host goes round the four houses)");
  await page.goto(url + "?seed=1&time=10:30&date=2026-10-07"); await page.waitForTimeout(800);
  await page.click('[data-open="friend"]'); await page.waitForTimeout(400);
  check(await page.locator("details.whowhere").count() >= 18 && /Family dinner tonight at Ma Ma and Gong Gong's/.test(await page.locator("#friendBody").textContent()), "who's where today: everyone's day, family first, and tonight's dinner");
  await page.click('[data-open="friend"]').catch(() => {});
  await page.goto(url + "?seed=1&time=14:30&date=2026-10-05"); await page.waitForTimeout(800);
  await page.evaluate(() => window.__mapleScene("lane")); await page.waitForTimeout(1200);
  check(await ids().then(a => a.includes("okada")), "villagers wander Makers' Lane too (Mr Okada, Monday afternoon)");
  await page.goto(url + "?seed=1&time=18:00&date=2026-10-09"); await page.waitForTimeout(800);
  await page.evaluate(() => window.__mapleScene("vineyard")); await page.waitForTimeout(1200);
  check(await ids().then(a => a.includes("marcus") && a.includes("angelina")), "Marcus and Angellina come to the vineyard on Friday evenings");
  await page.goto(url + "?seed=1&time=10:30&date=2026-10-11"); await page.waitForTimeout(800);
  await page.evaluate(() => window.__mapleScene("field")); await page.waitForTimeout(1200);
  check(await ids().then(a => ["mum", "dad", "marcus", "angelina"].every(f => a.includes(f))), "the whole family's at the Sunday farmers market");
  await page.goto(url + "?seed=1&time=20:00&date=2026-10-06"); await page.waitForTimeout(800);
  await page.evaluate(() => window.__mapleScene("wineshop")); await page.waitForTimeout(1500);
  check(await page.locator('#actors [data-npc="marcus"].act-sit').count() === 1 && await page.locator('#actors [data-npc="angelina"].act-sit').count() === 1, "Tuesday is date night: Marcus and Angellina at a tasting table in the wine shop");
  await page.goto(url + "?seed=1&time=14:00&date=2026-10-10"); await page.waitForTimeout(800);
  await page.evaluate(() => window.__mapleScene("marcus")); await page.waitForTimeout(3000);
  check(await page.locator("#evan").isVisible() && /Mario|Spiderman|game/i.test(await page.locator("#evanSay").textContent()), "Evan visits Uncle Marcus's and asks for Mario and Spiderman");
  { const { NPCS } = await import(pathToFileURL(join(root, "src/data/npcs.js")).href), d = NPCS.find(n => n.id === "dad"), m = NPCS.find(n => n.id === "marcus");
    check(d.hellos.includes("Hi darling! Love you, have a good day.") && d.lines.some(l => /Ah Gong loves who the most/.test(l)) && /Zeh/.test(m.intro), "Dad's \"Hi darling, love you, have a good day\", Ah Gong, and Marcus calling Mel Zeh"); }
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto(url + "?seed=1&time=21:00&date=2026-10-06"); await page.waitForTimeout(800);
  await page.evaluate(() => window.__mapleScene("shore")); await page.waitForTimeout(1000);
  check(await page.evaluate(() => !!document.querySelector("#sceneArt rect.dusk")) && await page.evaluate(() => getComputedStyle(document.getElementById("world")).getPropertyValue("--sea").trim().toUpperCase() === "#8FC1DE"), "after dark the sea goes dark with the dusk (and dark mode doesn't stack on it)");
  await page.emulateMedia({ colorScheme: "light" });
  await page.close();
}
{
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
  await page.evaluate(() => window.__mapleScene("home")); await page.waitForTimeout(800);
  check(await page.locator('#world [data-spot="officedoor"]').count() === 1 && await page.locator('#world [data-spot="gdoor"]').count() === 1 && await page.locator('#world [data-spot="desk"]').count() === 0, "the living room has doors to the home office (left) and the garage (right); the desks have moved out");
  await page.locator('#world [data-spot="officedoor"]').dispatchEvent("click"); await page.waitForTimeout(2500);
  check(await page.locator('#world [data-spot="desk"], #world [data-spot="office"], #world [data-spot="treadmill"]').count() === 3, "the home office: Mel's desk, Darren's desk and the treadmill");
  await page.evaluate(() => window.__mapleScene("home")); await page.waitForTimeout(800);
  await page.locator('#world [data-spot="gdoor"]').dispatchEvent("click"); await page.waitForTimeout(2500);
  check(await page.locator('#world [data-spot="laundry"]').count() === 1 && await page.locator('#world [data-spot="cupboard"]').count() === 1, "the garage holds the laundry corner and the cleaning cupboard");
  check(await page.locator('#world [data-spot="car"]').count() === 1, "through the garage door: room for a scooter and a car");
  await page.locator('#world [data-spot="scooter"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-goal="scooter"]', { timeout: 15000 });
  await page.click('#ctx [data-goal="scooter"]'); await page.waitForTimeout(400);
  check(await gf().then(f => f.goals.scooter && f.ride === "scooter"), "a scooter, kept in the garage");
  await page.click('#ctx [data-goal="car"]'); await page.waitForTimeout(400);
  check(await gf().then(f => f.goals.car && f.ride === "car" && f.coins === 13000 - 800 - 3500), "and a cream convertible");
  await page.evaluate(() => window.__mapleScene("base")); await page.waitForTimeout(600);
  await page.locator('#world [data-place="toVine"]').dispatchEvent("click"); await page.waitForTimeout(250);
  check(await page.locator("#mel.drive").count() === 1 && await page.locator("#mel.withEvan").count() === 1, "outdoors Mel drives the convertible between places, with Evan and Maple aboard");
  await page.waitForFunction(() => /vineyard/i.test(document.querySelector("#sceneName").textContent), null, { timeout: 30000 });   // let the drive arrive before jumping elsewhere
  await page.evaluate(() => window.__mapleScene("wineshop")); await page.waitForTimeout(800);
  await page.locator('#world [data-spot="cdoor"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-goal="cellar"]', { timeout: 15000 });
  await page.click('#ctx [data-goal="cellar"]'); await page.waitForTimeout(400);
  await page.locator('#world [data-spot="cdoor"]').dispatchEvent("click"); await page.waitForTimeout(2500);
  check(await page.locator('#world [data-spot="flight"]').count() === 1 && await gf().then(f => f.goals.cellar), "the cellar door extension: through the wine shop's west wall to the tasting bar");
  await page.evaluate(() => window.__mapleScene("shore")); await page.waitForTimeout(800);
  await page.locator('#world [data-place="boat"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-goal="boat"]', { timeout: 15000 });
  await page.click('#ctx [data-goal="boat"]'); await page.waitForTimeout(400);
  await page.locator('#world [data-place="boat"]').dispatchEvent("click"); await page.waitForTimeout(4000);
  check(await page.locator("#world .cruising").count() === 1 && await page.evaluate(() => getComputedStyle(document.getElementById("mel")).visibility === "hidden"), "the dolphin cruise boat: everyone aboard and off up the coast");
  // the monthly wine club in the cellar door: the first Friday of the month, 6 to 9pm
  await page.addInitScript(() => { if (!/clubpatch/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    f.vine = f.vine || {}; f.vine.shelf = [{id: "c1", name: "Club Red", type: "red", n: 40, price: 18, open: 0}]; f.vine.lastTick = Date.now() - 100*60e3; f.vine.box = 0;
    const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?seed=1&time=19:40&date=2026-11-06&clubpatch=1"); await page.waitForTimeout(2500);
  check(await gf().then(f => f.vine.shelf[0].n < 40 && f.vine.box > 0), "the wine club buys bottles and glasses off the shop's shelves");
  await page.evaluate(() => window.__mapleScene("cellar")); await page.waitForTimeout(1500);
  check(await page.locator("#actors .npc").count() >= 6, "the wine club gathers in the cellar door");
  await page.locator('#world [data-spot="flight"]').dispatchEvent("click"); await page.waitForTimeout(2500);
  check(/hosting the wine club/.test(await page.locator("#speech").textContent()), "Mel hosts the club at the tasting bar");
  await page.close();
}
{
  // Wearing an outfit from the wardrobe: choose one, untick what you're skipping, put it on (Mel's sprite changes)
  console.log("\nwearing an outfit");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`wear pageerror: ${e.message}`));
  await page.addInitScript(() => { if (!/wearpatch/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    f.outfits = {day: "2026-10-06", list: [{label: "Tropical Wrapped Elegance", dress: "Green botanical wrap dress", shoes: "Gold round-toe ballet flats", bag: "Black YSL structured bag", jewellery: "Gold orchid statement drops", layer: "Charcoal slouchy cardigan (aircon)", hair: "down + soft waves"}]};
    const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=10:30&date=2026-10-06"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=10:30&date=2026-10-06&wearpatch=1"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__mapleScene("room")); await page.waitForTimeout(800);
  const tie = () => page.evaluate(() => [...document.querySelectorAll("#mel .usual")].every(e => getComputedStyle(e).display !== "none"));
  await page.locator('#world [data-spot="wardrobe"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-wear="0"]', { timeout: 15000 });
  check(await tie(), "in her usual outfit Mel has the blue hair tie and the sprigs");
  await page.click('#ctx [data-wear="0"]'); await page.waitForTimeout(300);
  check(await page.locator("#ctx [data-wearf]:checked").count() === 6, "choosing an outfit lists each piece, all ticked");
  await page.uncheck('#ctx [data-wearf="layer"]'); await page.click('#ctx [data-wearok="0"]'); await page.waitForTimeout(400);
  check(await page.evaluate(() => { const w = JSON.parse(localStorage.getItem("fox.fox")).wear; return w && w.dress && !w.layer; }), "unticked pieces are left off");
  check(await page.evaluate(() => { const d = document.getElementById("oDress"), l = document.getElementById("oLayer"); return getComputedStyle(d).display !== "none" && getComputedStyle(l).display === "none" && document.getElementById("mel").classList.contains("hairdown"); }), "Mel's character puts it on: the dress, hair down, no cardigan");
  check(!(await page.evaluate(() => [...document.querySelectorAll("#mel .usual")].some(e => getComputedStyle(e).display !== "none"))), "and the blue hair tie and sprigs come off (they're for the usual look only)");
  await page.close();
}
{
  // Paddling home: the stream from the sea feeds the lake, the river runs on home; a little jetty at home and the
  // foreshore's rack take Mel (with Evan and Maple) straight from one to the other
  console.log("\npaddling between home and the foreshore");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`paddle pageerror: ${e.message}`));
  await page.goto(url + "?reset=1&seed=1&time=10:00&date=2026-10-14"); await page.waitForTimeout(800);
  await page.evaluate(() => window.__mapleScene("base")); await page.waitForTimeout(1000);
  check(await page.locator('#world [data-place="homejetty"]').count() === 1, "a little jetty with paddleboards on the river at home");
  await page.locator('#world [data-place="homejetty"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-sup="shore"]', { timeout: 15000 });
  await page.click('#ctx [data-sup="shore"]');
  await page.waitForFunction(() => document.querySelector('#world [data-place="suprack"]'), null, { timeout: 15000 }); await page.waitForTimeout(1200);
  check(await page.evaluate(() => { const r = document.getElementById("mel").getBoundingClientRect(), j = document.querySelector('#world [data-place="suprack"]').getBoundingClientRect(); return Math.abs(r.x - j.x) < 120 && Math.abs(r.y - j.y) < 160; }) && await page.locator("#evan").isVisible(),
    "paddle to the foreshore: Mel steps off by the paddleboards there, Evan with her");
  await page.locator('#world [data-place="suprack"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-sup="base"]', { timeout: 15000 });
  await page.click('#ctx [data-sup="base"]');
  await page.waitForFunction(() => document.querySelector('#world [data-place="homejetty"]'), null, { timeout: 15000 }); await page.waitForTimeout(1200);
  check(await page.evaluate(() => { const r = document.getElementById("mel").getBoundingClientRect(), j = document.querySelector('#world [data-place="homejetty"]').getBoundingClientRect(); return Math.abs(r.x - j.x) < 120 && Math.abs(r.y - j.y) < 160; }),
    "and paddle home: straight back, standing by the little jetty");
  await page.goto(url + "?seed=1&time=23:00&date=2026-10-14"); await page.waitForTimeout(800);
  await page.evaluate(() => window.__mapleScene("base")); await page.waitForTimeout(1000);
  await page.locator('#world [data-place="homejetty"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-sup="shore"]', { timeout: 15000 });
  await page.click('#ctx [data-sup="shore"]');
  const dark = await page.waitForFunction(() => /Too dark/.test(document.querySelector("#speech").textContent), null, { timeout: 5000 }).then(() => true, () => false);
  await page.waitForTimeout(2000);
  check(dark && await page.locator('#world [data-place="homejetty"]').count() === 1, "too dark to paddle the river late at night");
  await page.close();
}
{
  // Picking a quest before the five-minute clean: the clean waits on the board for later
  console.log("\nquests before the clean");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`pick pageerror: ${e.message}`));
  await page.goto(url + "?reset=1&seed=1&time=10:30&date=2026-10-08"); await page.waitForTimeout(900);
  await page.click('[data-open="quests"]'); await page.waitForTimeout(400);
  check(await page.locator("#list [data-next]").count() > 0, "\"do this now\" shows on quests even before the five-minute clean");
  await page.locator("#list [data-next]").first().click(); await page.waitForTimeout(500);
  check(await page.evaluate(() => JSON.parse(localStorage.getItem("fox.today") || "{}").cleanLater === true), "picking one puts the clean off for later");
  await page.click('[data-open="quests"]'); await page.waitForTimeout(400);
  check(await page.locator('#list li[data-cleannow]').count() === 1, "the clean waits at the top of the board");
  await page.locator('#list button[data-cleannow]').click(); await page.waitForTimeout(500);
  check(await page.locator('#list li[data-cleannow]').count() === 0 && /wet wipe/.test(await page.locator("#speech").textContent()), "and \"do this now\" brings it back");
  await page.close();
}
{
  // The Scoop Shack on the bay: stock the fridge, discover a flavour at the bench, have one free, take one to give
  // (gelato isn't offered to Marcus), and while time passes Tomo makes batches and customers buy
  console.log("\nthe Scoop Shack");
  { const sc = await import(new URL("../src/game/scoop.js", import.meta.url)), cc = await import(new URL("../src/game/cocoa.js", import.meta.url)), F = {inv: {}, scoop: {fridge: {milk: 3, fl_rose: 2}}, cocoa: {}}, orch = {stock: {}};
    check(sc.unstockFridge(F, "milk", 2, orch).to === "bag" && F.inv.milk === 2 && F.scoop.fridge.milk === 1 && sc.unstockFridge(F, "fl_rose", 99, orch).to === "farm" && orch.stock["stem:rose"] === 2, "things can come back out of the gelato fridge (flower stems go back to Ma Ma's shelf)");
    cc.cocoaState(F).pantry = {honey: 2}; check(cc.unstockPantry(F, "honey", 99, orch).n === 2 && F.inv.honey === 2, "and off the Cocoa Room's fillings shelf"); }
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
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
  await page.evaluate(() => window.__mapleScene("shore")); await page.waitForTimeout(600);
  check(await page.locator('#world [data-place="toBay"]').count() === 1, "the foreshore's boardwalk goes north to the bay");
  await page.evaluate(() => window.__mapleScene("bay")); await page.waitForTimeout(800);
  check(await page.locator('#world [data-place="scoopshop"]').count() === 1 && await page.locator('#world [data-place="deck"]').count() === 1 && await page.locator('#world [data-place="reno"]').count() === 1,
    "the bay: the Scoop Shack, its deck, and a shopfront under renovation");
  await page.evaluate(() => window.__mapleScene("scoopkitchen")); await page.waitForTimeout(800);
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
  await page.evaluate(() => window.__mapleScene("scoopkitchen")); await page.waitForTimeout(800);
  check(await fox().then(f => !f.scoop.churn.length && f.scoop.tubs[r1.id] > 10 && f.scoop.tubs[f.scoop.recipes[1].id] > 10), "an hour later both are frozen: a tub of each, in the display (customers are already buying)");
  const before = await fox().then(f => f.scoop.tubs[r1.id]);
  await page.locator('#world [data-spot="gboard"]').dispatchEvent("click"); await page.waitForSelector(`#ctx [data-gmake="${r1.id}"]`, { timeout: 15000 });
  await page.click(`#ctx [data-gmake="${r1.id}"]`); await page.waitForTimeout(300);
  check(await fox().then(f => f.scoop.churn.length === 1 && f.scoop.fridge.mango === 2), "Mel makes another tub herself from the recipe book (one of each ingredient, into the churner)");
  await page.click("#ctx [data-close]").catch(() => {});
  await page.locator('#world [data-spot="gbench"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-gsel="mango"]', { timeout: 15000 });
  await page.click('#ctx [data-gsel="mango"]'); await page.click('#ctx [data-gsel="milk"]'); await page.waitForTimeout(200);
  await page.click(`#ctx [data-gmake="${r1.id}"]`); await page.waitForTimeout(300);
  check(await fox().then(f => f.scoop.churn.length === 2), "or at the mixing bench, picking a flavour she already knows");
  await page.click("#ctx [data-close]").catch(() => {});
  await page.goto(url + "?seed=1&time=13:10&date=2026-10-10"); await page.waitForTimeout(1500);
  await page.evaluate(() => window.__mapleScene("scoopkitchen")); await page.waitForTimeout(800);
  check(await fox().then(f => !f.scoop.churn.length && f.scoop.tubs[r1.id] >= before + 25), "an hour on, two more tubs are ready");
  await page.evaluate(() => window.__mapleScene("scoopshop")); await page.waitForTimeout(800);
  await page.locator('#world [data-spot="gcounter"]').dispatchEvent("click"); await page.waitForSelector("#ctx [data-gpick]", { timeout: 15000 });
  await page.locator("#ctx [data-gpick]").first().click(); await page.waitForTimeout(200);
  await page.click("#ctx [data-geat]"); await page.waitForTimeout(500);
  check(await page.locator("#melCone").isVisible() && await fox().then(f => f.scoop.tubs[r1.id] > 0), "a free one at the counter: Mel's holding a cone");
  await page.locator('#world [data-spot="gcounter"]').dispatchEvent("click"); await page.waitForSelector("#ctx [data-gpick]", { timeout: 15000 });
  await page.locator("#ctx [data-gpick]").first().click(); await page.waitForTimeout(200);
  await page.click('#ctx [data-gtake="cone"]'); await page.waitForTimeout(400);
  const gid = await fox().then(f => Object.keys(f.inv).find(k => k.startsWith("gel_cone")));
  check(!!gid, "one to take away goes in the backpack");
  await page.click('[data-open="bag"]'); await page.click(`#bag .item[data-id="${gid}"]`); await page.waitForTimeout(300);
  check(await page.locator('#bag [data-giveto="evan"]').count() === 1 && await page.locator('#bag [data-giveto="marcus"]').count() === 0, "it can be given like a gift (a gelato isn't offered to Marcus: lactose)");
  await page.click('[data-open="bag"]').catch(() => {});
  // the display: take a flavour off (customers can't buy it then), put it back, and swap one in when all 8 slots are full
  await page.evaluate(() => window.__mapleScene("scoopkitchen")); await page.waitForTimeout(700);
  await page.locator('#world [data-spot="gfreezer"]').dispatchEvent("click"); await page.waitForSelector("#ctx [data-gdisp]", { timeout: 15000 });
  const sorbet = await fox().then(f => f.scoop.recipes[1].id);
  await page.click(`#ctx [data-gdisp="${sorbet}"]`); await page.waitForTimeout(300);
  check(await fox().then(f => Array.isArray(f.scoop.display) && !f.scoop.display.includes(sorbet) && f.scoop.display.length === 1), "a flavour can be taken off the display (it waits in the freezer)");
  await page.evaluate(() => window.__mapleScene("scoopshop")); await page.waitForTimeout(700);
  await page.locator('#world [data-spot="gcounter"]').dispatchEvent("click"); await page.waitForSelector("#ctx [data-gpick]", { timeout: 15000 });
  check(await page.locator("#ctx [data-gpick]").count() === 1, "and the counter only offers what's in the display");
  await page.click('#ctx [data-gview="freezer"]'); await page.waitForSelector(`#ctx [data-gdisp="${sorbet}"]`, { timeout: 15000 });
  await page.click(`#ctx [data-gdisp="${sorbet}"]`); await page.waitForTimeout(300);
  check(await fox().then(f => f.scoop.display.includes(sorbet)), "put it back out, straight from the counter");
  await page.click("#ctx [data-close]").catch(() => {});
  await page.goto(url + "?seed=1&time=11:00&date=2026-10-10&scooppatch=full"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__mapleScene("scoopkitchen")); await page.waitForTimeout(700);
  await page.locator('#world [data-spot="gfreezer"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-gdisp="f8"]', { timeout: 15000 });
  await page.click('#ctx [data-gdisp="f8"]'); await page.waitForSelector('#ctx [data-gswapout="f2"]', { timeout: 15000 });
  await page.click('#ctx [data-gswapout="f2"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.scoop.display.length === 8 && f.scoop.display[2] === "f8" && !f.scoop.display.includes("f2")), "with all 8 slots full, a flavour swaps in for one you choose");
  await page.click("#ctx [data-close]").catch(() => {});
  await page.goto(url + "?seed=1&time=15:00&date=2026-10-12&scooppatch=rewind"); await page.waitForTimeout(2500);
  check(await fox().then(f => Object.values(f.scoop.sold).reduce((a, d) => a + d.n, 0) > 0), "customers buy while it's open (the takings come to Mel)");
  check(await fox().then(f => Object.values(f.scoop.made || {}).reduce((a, b) => a + b, 0) === 2), "nobody makes tubs behind Mel's back: only the two she made (Tomo serves now)");
  await page.close();
}
{
  // The Cocoa Room: bought from the bay's old shopfront, then bean to bar in its kitchen (roast 10 min, grind 2 hours,
  // temper, mould) and bars sold off the wall
  console.log("\nthe Cocoa Room");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => { errors.push(`cocoa pageerror: ${e.message}`); console.log("PAGEERR", e.stack.slice(0, 600)); });
  page.on("dialog", d => { errors.push("the Cocoa Room used a browser pop-up"); d.dismiss(); });
  const fox = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  await page.addInitScript(() => { const m = /ccpatch=(\w+)/.exec(location.search); if (!m) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    if (m[1] === "coins") { f.coins = 2000; f.inv = {...(f.inv || {}), honey: 2, pandan: 1}; f.cocoa = {plan: {on: false}}; }   // Mateo paused while Mel works it by hand
    if (m[1] === "rewind") f.cocoa.at = 1;
    const trays = () => f.cocoa.bonbons.forEach(b => { f.cocoa.trays[b.id] = 12; });
    if (m[1] === "links" || m[1] === "fest" || m[1] === "club") { Object.assign(f.cocoa, {choc: {milk: 40, dark: 40, white: 40}, plan: {...f.cocoa.plan, on: false}}); trays(); }
    if (m[1] === "links") { f.scoop = {...(f.scoop || {}), up: {...((f.scoop || {}).up || {}), dip: 1}}; f.vine = {...(f.vine || {}), shelf: [{id: "wtest", name: "Maple's Red", type: "red", n: 3, price: 18, open: 0}]}; }
    if (m[1] === "club") { f.goals.cellar = 1; f.cocoa.at = Date.parse("2026-11-06T10:00:00Z"); }
    if (m[1] === "ups") { f.coins = 10000; Object.assign(f.cocoa, {choc: {milk: 40, dark: 40, white: 40}, bars: {milk: 10, dark: 10, white: 10}, roasted: 2, grind: null, ground: null, grind2: null, ground2: null, up: {}, plan: {...f.cocoa.plan, on: false}}); trays(); }
    if (m[1] === "upsrun") { const t0 = +(/t0=(\d+)/.exec(location.search) || [])[1]; Object.assign(f.cocoa, {at: t0, treeAt: t0 - 3*864e5, beans: 0, choc: {milk: 40, dark: 40, white: 40}, bars: {milk: 20, dark: 20, white: 20}}); trays(); }
    if (m[1] === "mateo") Object.assign(f.cocoa, {at: 1, plan: {on: true, buy: true, floor: 200, hold: 0}, beans: 0, roasted: 0, roast: null, grind: null, ground: null, res: {milk: 0, dark: 0, white: 0}, keep: {milk: 30, dark: 30, white: 0}, choc: {milk: 0, dark: 0, white: 0}, bars: {milk: 0, dark: 0, white: 0}, made: 0});
    const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  const at = async (t, q = "") => { await page.goto(url + `?seed=1&time=${t}&date=2026-10-10${q}`); await page.waitForTimeout(900); };
  await page.goto(url + "?reset=1&seed=1&time=12:00&date=2026-10-10"); await page.waitForTimeout(800);
  await at("12:00", "&ccpatch=coins");
  await page.evaluate(() => window.__mapleScene("bay")); await page.waitForTimeout(700);
  await page.locator('#world [data-place="reno"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-goal="cocoa"]', { timeout: 20000 });
  await page.click('#ctx [data-goal="cocoa"]'); await page.waitForTimeout(500);
  check(await fox().then(f => f.goals.cocoa && f.coins === 1000) && await page.locator('#world [data-place="cocoa"]').count() === 1 && await page.locator('#world [data-place="reno"]').count() === 0, "the old shopfront becomes the Cocoa Room for 1000 coins");
  const tap = async (spot, sel) => { await page.locator(`#world [data-spot="${spot}"]`).dispatchEvent("click"); await page.waitForSelector(sel, { timeout: 15000 }); };
  await page.evaluate(() => window.__mapleScene("cocoakitchen")); await page.waitForTimeout(700);
  await tap("sacks", '#ctx [data-cc="beans"][data-n="3"]'); await page.click('#ctx [data-cc="beans"][data-n="3"]'); await page.waitForTimeout(300);
  await page.click("#ctx [data-close]");
  await tap("roaster", '#ctx [data-cc="roast"]'); await page.click('#ctx [data-cc="roast"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.cocoa.beans === 2 && f.cocoa.roast && f.coins === 925), "three sacks of beans (75 coins), one in the roaster");
  await at("12:15"); await page.evaluate(() => window.__mapleScene("cocoakitchen")); await page.waitForTimeout(700);
  await tap("grinder", '#ctx [data-cc="grind"][data-k="dark"]'); await page.click('#ctx [data-cc="grind"][data-k="dark"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.cocoa.roasted === 0 && f.cocoa.grind && f.cocoa.grind.kind === "dark"), "ten minutes later the beans are roasted, and go in the grinder as dark chocolate");
  await at("13:00"); await page.evaluate(() => window.__mapleScene("cocoakitchen")); await page.waitForTimeout(700);
  check(await fox().then(f => f.cocoa.grind && !f.cocoa.ground), "an hour on, it's still grinding (two hours)");
  await at("14:20"); await page.evaluate(() => window.__mapleScene("cocoakitchen")); await page.waitForTimeout(700);
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
  await page.evaluate(() => window.__mapleScene("cocoa")); await page.waitForTimeout(800);
  check(await page.locator('#world [data-spot="barwall"]').count() === 1 && await page.locator('#world [data-spot="ckdoor"]').count() === 1, "the shop front: the bar wall, the counter, the kitchen door");
  await tap("ccounter", '#ctx [data-cc="give"][data-k="dark"]'); await page.click('#ctx [data-cc="give"][data-k="dark"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.inv.bar_dark === 1), "a dark chocolate bar to give (dairy-free, so even for Marcus)");
  await page.click('#ctx [data-cc="box"][data-n="4"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.inv.box4d === 1), "a gift box of four bonbons from the display case (all dark, so dairy-free)");
  await page.click("#ctx [data-close]").catch(() => {});
  await tap("case", '#ctx [data-cc="case"]');
  check(await page.locator('#ctx [data-cc="case"]').count() === 2, "the display case shows the bonbons");
  await page.click("#ctx [data-close]").catch(() => {});
  await page.click("#ctx [data-close]").catch(() => {});
  await at("16:00", "&ccpatch=rewind"); await page.waitForTimeout(1500);
  check(await fox().then(f => Object.values(f.cocoa.sold || {}).reduce((a, d) => a + d.n, 0) > 0 && Object.values(f.cocoa.sold || {}).reduce((a, d) => a + (d.bonbons || 0), 0) > 0), "customers buy bars off the wall and bonbons from the case while it's open (the takings come to Mel)");
  await page.evaluate(() => window.__mapleScene("cocoa")); await page.waitForTimeout(1500);
  check((await page.locator("#actors .npc").evaluateAll(n => n.map(x => x.dataset.npc))).includes("amara"), "Amara's behind the counter");
  await page.evaluate(() => window.__mapleScene("cocoakitchen")); await page.waitForTimeout(1500);
  check((await page.locator("#actors .npc").evaluateAll(n => n.map(x => x.dataset.npc))).includes("mateo"), "Mateo, the kitchen hand, is in the kitchen");
  // Mateo runs the bar line on his own: two days of shifts, from no beans at all
  await at("18:30", "&ccpatch=mateo"); await page.waitForTimeout(1500);
  const mt = await fox().then(f => ({c: f.cocoa, coins: f.coins}));
  check(mt.c.res.milk === 30 && mt.c.res.dark === 30 && mt.c.res.white === 0, `he fills the bonbon shelf first, to Mel's targets (milk ${mt.c.res.milk}, dark ${mt.c.res.dark})`);
  check(mt.c.made >= 30 && Object.values(mt.c.bars).reduce((a, n) => a + n, 0) + Object.values(mt.c.sold).reduce((a, d) => a + d.n, 0) > 0, `then moulds the rest into bars (${mt.c.made} made), never touching the shelf`);
  check(mt.c.bought >= 4 && mt.coins >= 200, `and buys his own beans with auto-buy (${mt.c.bought} sacks), keeping Mel above her coin floor`);
  await page.evaluate(() => window.__mapleScene("cocoa")); await page.waitForTimeout(700);
  await tap("ccounter", '#ctx [data-cc="keep"][data-k="white"][data-n="1"]'); await page.click('#ctx [data-cc="keep"][data-k="white"][data-n="1"]'); await page.waitForTimeout(300);
  await page.click('#ctx [data-cc="plan"][data-k="buy"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.cocoa.keep.white === 6 && f.cocoa.plan.buy === false), "the kitchen plan at the counter: a bonbon shelf target per chocolate, and auto-buy on or off");
  await page.click("#ctx [data-close]").catch(() => {});
  // around the village: house chocolate for the Scoop Shack, wine fillings and pairing boxes, festival specials, the wine club
  await at("18:40", "&ccpatch=links"); await page.evaluate(() => window.__mapleScene("cocoakitchen")); await page.waitForTimeout(700);
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
  await page.evaluate(() => window.__mapleScene("cocoa")); await page.waitForTimeout(700);
  await tap("ccounter", '#ctx [data-cc="pair"][data-k="wtest"]'); await page.click('#ctx [data-cc="pair"][data-k="wtest"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.inv.pairbox === 1 && f.vine.shelf[0].n === 1), "a wine pairing box: a bottle and four bonbons, to give");
  await page.click("#ctx [data-close]").catch(() => {});
  await page.goto(url + "?seed=1&time=12:00&date=2026-11-05&ccpatch=fest"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__mapleScene("cocoakitchen")); await page.waitForTimeout(700);
  await tap("bonbon", '#ctx [data-cc="special"]');
  check(/Deepavali special/i.test(await page.locator("#ctx").innerText()), "around Deepavali the bonbon table offers its festival special");
  await page.click('#ctx [data-cc="special"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.cocoa.specials.sp_spiced === 6), "six spiced chocolate boxes made");
  await page.click("#ctx [data-close]").catch(() => {});
  await page.evaluate(() => window.__mapleScene("cocoa")); await page.waitForTimeout(700);
  await tap("ccounter", '#ctx [data-cc="takesp"][data-k="sp_spiced"]'); await page.click('#ctx [data-cc="takesp"][data-k="sp_spiced"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.inv.sp_spiced === 1 && f.cocoa.specials.sp_spiced <= 5), "and one to give");
  await page.click("#ctx [data-close]").catch(() => {});
  await page.goto(url + "?seed=1&time=21:05&date=2026-11-06&ccpatch=club"); await page.waitForTimeout(1500);
  check(await fox().then(f => (f.cocoa.sold["2026-11-06"] || {}).club > 0), "wine club night: members buy chocolates at the cellar door");
  // the upgrades catalogue: all ten, then what they do
  await at("12:00", "&ccpatch=ups"); await page.evaluate(() => window.__mapleScene("cocoa")); await page.waitForTimeout(700);
  await tap("ccounter", '#ctx [data-cc="ups"]'); await page.click('#ctx [data-cc="ups"]'); await page.waitForSelector('#ctx [data-cc="buyup"]', { timeout: 15000 });
  check(await page.locator('#ctx [data-cc="buyup"]').count() === 10, "the Cocoa Room's catalogue lists ten upgrades");
  for (let i = 0; i < 10; i++) { const b = page.locator('#ctx [data-cc="buyup"]').first(); if (!(await b.count())) break; await b.click(); await page.waitForTimeout(250); }
  check(await fox().then(f => Object.keys(f.cocoa.up).length === 10 && f.coins === 10000 - 4450), "all ten bought (4450 coins)");
  await page.click('#ctx [data-cc="counter"]'); await page.waitForSelector('#ctx [data-cc="hot"]', { timeout: 15000 }); await page.click('#ctx [data-cc="hot"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.cocoa.choc.milk === 39), "the hot chocolate bar: Mel has a cup (one piece of chocolate)");
  await page.click('#ctx [data-cc="grand"]'); await page.waitForTimeout(300);
  check(await fox().then(f => (f.inv.box16 || 0) + (f.inv.box16d || 0) === 1), "the gift wrapping station packs a grand box of 16");
  check(await page.locator("#fore").innerHTML().then(h => /q18 6 36 0/.test(h)), "a chocolate fountain on the counter");
  await page.click("#ctx [data-close]").catch(() => {});
  await page.evaluate(() => window.__mapleScene("cocoakitchen")); await page.waitForTimeout(700);
  await tap("grinder", '#ctx [data-cc="grind"][data-k="dark"]'); await page.click('#ctx [data-cc="grind"][data-k="dark"]'); await page.waitForTimeout(300);
  await page.click('#ctx [data-cc="grind"][data-k="milk"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.cocoa.grind && f.cocoa.grind2 && f.cocoa.grind.kind === "dark" && f.cocoa.grind2.kind === "milk"), "two grinders: two pots grinding at once");
  await page.click("#ctx [data-close]").catch(() => {});
  // Saturday afternoon: the workshop pays, the cacao tree sends a sack, the supply deal stocks the Scoop Shack
  const t0 = await page.evaluate(() => Date.now() + (window.__mapleOffset || globalThis.__mapleOffset || 0));
  await at("16:30", `&ccpatch=upsrun&t0=${t0}`); await page.waitForTimeout(1500);
  const up = await fox();
  check((up.cocoa.sold["2026-10-10"] || {}).workshop === 48, "Saturday's bonbon workshop: six makers, 48 coins");
  check(up.cocoa.beans >= 1, "the cacao tree at Ma Ma's sends a sack of beans");
  check((up.scoop.fridge.housechoc || 0) >= 5, "the supply deal sends dark chocolate to the Scoop Shack's fridge");
  await at("15:00"); await page.evaluate(() => window.__mapleScene("cocoa")); await page.waitForTimeout(1800);
  const ws = await page.locator("#actors .npc").evaluateAll(n => n.map(x => x.dataset.npc));
  check(ws.filter(id => !["amara", "lila", "mateo"].includes(id)).length >= 4 && /Bonbon workshop/.test(await page.locator("#fore").textContent()), `Saturday's workshop class at the tables (${ws.join(", ")})`);
  await page.evaluate(() => window.__mapleScene("orchard")); await page.waitForTimeout(900);
  check(/Cacao tree/.test(await page.locator("#sceneArt").textContent()), "the cacao tree grows in Ma Ma's orchard");
  await page.locator('#world [data-place="cacao"]').dispatchEvent("click"); await page.waitForTimeout(1500);
  check(/next in about/.test(await page.locator("#say").textContent().catch(() => "") + await page.locator("body").textContent()), "walk up to the cacao tree: when the next sack is due");
  await page.goto(url + "?seed=1&time=12:00&date=2026-10-12"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__mapleScene("cocoa")); await page.waitForTimeout(1500);
  check((await page.locator("#actors .npc").evaluateAll(n => n.map(x => x.dataset.npc))).includes("lila"), "with a second assistant the shop opens on Mondays: Lila's behind the counter");
  await page.goto(url + "?seed=1&time=19:00&date=2026-10-13"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__mapleScene("field")); await page.waitForTimeout(1500);
  check(await page.locator('#world [data-place="mstall9"]').count() === 0, "no chocolate cart at the night market (that's the Scoop Shack's evening)");
  await page.goto(url + "?seed=1&time=10:00&date=2026-10-11"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__mapleScene("field")); await page.waitForTimeout(1500);
  check(await page.locator('#world [data-place="mstall9"]').count() === 1 && (await page.locator("#actors .npc").evaluateAll(n => n.map(x => x.dataset.npc))).includes("mateo"), "the Cocoa Room cart at the Sunday farmers market, with Mateo");
  await page.locator('#world [data-place="mstall9"]').dispatchEvent("click"); await page.waitForSelector("#ctx h2", { timeout: 15000 });
  check(/farmers market cart/.test(await page.locator("#ctx").innerText()), "and Mel can serve from it");
  await page.close();
}
{
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
  await page.evaluate(() => window.__mapleScene("bay")); await page.waitForTimeout(700);
  check(await page.locator('#world [data-place="toFarmB"]').count() === 1, "a gate on the bay's east side leads to Wildflower Farm");
  await page.evaluate(() => window.__mapleScene("hfarm")); await page.waitForTimeout(1800);
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
  check(await fox().then(f => f.hfarm.frames >= 2), "a full hive gives Mel two frames of comb");
  await page.click("#ctx [data-close]").catch(() => {});
  const c0 = await fox().then(f => f.coins);
  await tap("fstand", '#ctx [data-hf="buy"][data-k="egg"]'); await page.click('#ctx [data-hf="buy"][data-k="egg"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.inv.egg === 1 && f.coins === c0 - 3), "the farm stand sells eggs (3 coins)");
  await page.click("#ctx [data-close]").catch(() => {});
  // inside the barn: the extractor, the yoghurt crocks, the cheese press and the cave
  await page.evaluate(() => window.__mapleScene("barn")); await page.waitForTimeout(900);
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
  await page.evaluate(() => window.__mapleScene("barn")); await page.waitForTimeout(900);
  await spot("cave", '#ctx [data-hf="wheel"]'); await page.click('#ctx [data-hf="wheel"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.inv.chz_cheddar === 5 && !f.hfarm.cave.length), "five days on it's ripe, but never turned: a rustic cheddar, five wedges");
  await page.click("#ctx [data-close]").catch(() => {});
  await page.goto(url + "?seed=1&time=14:00&date=2026-10-07"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__mapleScene("hfarm")); await page.waitForTimeout(900);
  await tap("goats", '#ctx [data-hf="milkall"]');
  check(await page.locator('#ctx [data-hf="milkall"]').isDisabled(), "milking is mornings only");
  await page.close();
}
{
  // Farm life: moods and yields, the goat gate, trust and what it unlocks, Felix and Elena's asks, swarms, turning cheese
  console.log("\nfarm life");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`farm life pageerror: ${e.message}`));
  const fox = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  await page.addInitScript(() => { const m = /flpatch=(\w+)/.exec(location.search); if (!m) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    const q = new URLSearchParams(location.search), qt = (q.get("time") || "").padStart(5, "0");   // the game's clock (?date&time), not the real one: the real time of day mustn't matter
    const h = f.hfarm = f.hfarm || {}, now = q.get("date") && q.get("time") ? Date.parse(`${q.get("date")}T${qt}:00+08:00`) : Date.now() + (globalThis.__mapleOffset || 0);
    if (m[1] === "start") { h.since = "2026-10-01"; f.inv = {...(f.inv || {}), egg: 3}; }
    if (m[1] === "trust") { h.trust = 38; }
    if (m[1] === "swarm") { h.hives = [now - 6*864e5, now, now, now, now]; }
    if (m[1] === "wheel") { h.cave = [{kind: "cheddar", name: "Test Cheddar", start: now - 5*864e5, done: now - 3600e3, turns: 4}]; }
    if (m[1] === "partner") { h.trust = 205; f.inv = {...(f.inv || {}), chz_cheddar: 3, milk: 3}; h.at = now - 6*3600e3; }
    const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  const go = async (t, d, q = "") => { await page.goto(url + `?seed=1&time=${t}&date=${d}${q}`); await page.waitForTimeout(900); await page.evaluate(() => window.__mapleScene("hfarm")); await page.waitForTimeout(1200); };
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
    check(await page.locator('#world [data-place="stray"]').count() === 0 && await fox().then(f => f.hfarm.caught === outDay), "and Mel rounds it up"); }
  await tap("goats", '#ctx [data-hf="latch"]'); await page.click('#ctx [data-hf="latch"]'); await page.waitForTimeout(200);
  await page.click("#ctx [data-close]").catch(() => {});
  await go("08:00", "2026-10-10");
  check(await page.locator('#world [data-place="stray"]').count() === 0, "latched the night before: everyone's in");
  await tap("farmhouse", "#ctx h2");
  check(/helper/i.test(await page.locator("#ctx").innerText()) && /asks/i.test(await page.locator("#ctx").innerText()), "the farmhouse: Mel's trust level and today's ask");
  await page.click("#ctx [data-close]").catch(() => {});
  await go("08:00", "2026-10-10", "&flpatch=trust");
  await tap("cows", '#ctx [data-hf="feed"]'); await page.click('#ctx [data-hf="feed"]'); await page.waitForTimeout(1500);
  check(await fox().then(f => f.hfarm.trust >= 40 && f.hfarm.myHive), "enough help and they trust her more: a trusted hand, with a hive of her own");
  await page.click("#ctx [data-close]").catch(() => {});
  check(await page.locator('#world [data-place="hives"]').innerHTML().then(h => h.includes("#E8566C")), "her hive sits in the lavender with a little flag");
  await go("08:00", "2026-10-10", "&flpatch=swarm"); await page.waitForTimeout(21000);
  check(await fox().then(f => f.hfarm.swarms >= 1), "a full hive left too long swarms");
  await page.goto(url + "?seed=1&time=10:00&date=2026-10-10&flpatch=wheel"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__mapleScene("barn")); await page.waitForTimeout(900);
  await page.locator('#world [data-spot="cave"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-hf="wheel"]', { timeout: 15000 });
  await page.click('#ctx [data-hf="wheel"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.inv.chz_cheddar_ex === 6), "a wheel turned faithfully comes out excellent");
  await page.click("#ctx [data-close]").catch(() => {});
  await page.goto(url + "?seed=1&time=14:00&date=2026-10-10&flpatch=partner"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__mapleScene("barn")); await page.waitForTimeout(900);
  await page.locator('#world [data-spot="press"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-hf="ckind"]', { timeout: 15000 });
  check(await page.locator('#ctx [data-hf="ckind"]').count() === 6, "an apprentice and up: Elena's taught brie, halloumi and smoked");
  await page.click("#ctx [data-close]").catch(() => {});
  await page.evaluate(() => window.__mapleScene("hfarm")); await page.waitForTimeout(900);
  await tap("fstand", '#ctx [data-hf="shelf"]'); await page.click('#ctx [data-hf="shelf"][data-k="chz_cheddar"][data-n="99"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.hfarm.shelf.chz_cheddar === 3 && !f.inv.chz_cheddar), "a partner has her own shelf at the farm stand");
  await page.close();
}
{
  // The cottage lane and Honeybrook station: four cottages, the windmill, the timetable, and trains along the top row
  console.log("\nHoneybrook station");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`lane pageerror: ${e.message}`));
  const npcs = () => page.locator("#actors .npc").evaluateAll(n => n.map(x => x.dataset.npc));
  const go = async (t, d, sc) => { await page.goto(url + `?seed=1&time=${t}&date=${d}`); await page.waitForTimeout(900); await page.evaluate(s => window.__mapleScene(s), sc); await page.waitForTimeout(1600); };
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
}
{
  // The campervan: bought at its spot on the cottage lane, then done up inside from the mood board
  console.log("\nthe campervan");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`van pageerror: ${e.message}`));
  const fox = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  await page.addInitScript(() => { if (!/vanpatch/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    f.coins = 4000; const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=12:00&date=2026-10-07"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=12:00&date=2026-10-07&vanpatch=1"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__mapleScene("hlane")); await page.waitForTimeout(900);
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
}
{
  // Keepsakes on the shelves of Mel's buildings, and pets adopted at the market that live with someone in the family
  console.log("\nkeepsakes and pets");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`pets pageerror: ${e.message}`));
  page.on("dialog", d => { errors.push("keepsakes used a browser pop-up"); d.dismiss(); });
  const fox = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  await page.addInitScript(() => { if (!/petpatch/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    f.inv = {...(f.inv || {}), k_conelamp: 1, pet_puppy: 1, cuenco: 1, iman: 1}; f.coins = 100;
    const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=10:30&date=2026-10-11"); await page.waitForTimeout(800);
  await page.evaluate(() => window.__mapleScene("field")); await page.waitForTimeout(1500);
  await page.locator('#world [data-place="mstall8"]').dispatchEvent("click"); await page.waitForSelector('#ctx .item[data-id="pet_kitten"]', { timeout: 15000 });
  check(await page.locator('#ctx .item[data-id^="pet_"]').count() >= 3, "Noor's adoption corner at the Sunday market has pets looking for homes");
  await page.click('#ctx [data-close]').catch(() => {});
  await page.goto(url + "?seed=1&time=10:30&date=2026-10-10&petpatch=1"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__mapleScene("scoopshop")); await page.waitForTimeout(700);
  await page.click('[data-open="bag"]'); await page.click('#bag .item[data-id="k_conelamp"]'); await page.waitForSelector('#ctx [data-keepat="scoop1"]', { timeout: 15000 });
  await page.click('#ctx [data-keepat="scoop1"]'); await page.waitForTimeout(500);
  check(await fox().then(f => f.keeps && f.keeps.scoop1 === "k_conelamp" && !f.inv.k_conelamp) && await page.locator('#world [data-keep="scoop1"]').count() === 1, "a keepsake goes on a shelf in the Scoop Shack");
  await page.locator('#world [data-keep="scoop1"]').dispatchEvent("click"); await page.waitForSelector("#ctx [data-keepdown]", { timeout: 15000 });
  await page.click("#ctx [data-keepdown]"); await page.waitForTimeout(400);
  check(await fox().then(f => !f.keeps.scoop1 && f.inv.k_conelamp === 1), "and comes back down into the backpack");
  await page.click('#bag .item[data-id="cuenco"]').catch(async () => { await page.click('[data-open="bag"]'); await page.click('#bag .item[data-id="cuenco"]'); });
  await page.waitForSelector('#bag [data-keepit]', { timeout: 15000 }); check(await page.locator('#bag [data-giveto="mum"]').count() === 1, "a Ronda souvenir can still be given away");
  await page.click('#bag [data-keepit]'); await page.waitForSelector('#ctx [data-keepat="mill1"]', { timeout: 15000 });
  check(await page.locator('#ctx [data-keepat="cocoa2"]').count() === 1 && await page.locator('#ctx [data-keepat="green1"]').count() === 1 && await page.locator('#ctx [data-keepat="fridge"]').count() === 0, "or kept: new shelves in the Cocoa Room, the greenhouse and the mill (and the fridge is for magnets)");
  await page.click('#ctx [data-keepat="mill1"]'); await page.waitForTimeout(500);
  check(await fox().then(f => f.keeps.mill1 === "cuenco" && !f.inv.cuenco), "the painted bowl goes up in the old mill");
  await page.click('[data-open="bag"]').catch(() => {}); await page.click('#bag .item[data-id="iman"]'); await page.waitForSelector('#bag [data-keepit]', { timeout: 15000 });
  await page.click('#bag [data-keepit]'); await page.waitForSelector('#ctx [data-keepat="fridge"]', { timeout: 15000 });
  check(await page.locator('#ctx [data-keepat="scoop1"]').count() === 0, "the fridge magnet only goes on the fridge");
  await page.click('#ctx [data-keepat="fridge"]'); await page.waitForTimeout(400);
  await page.evaluate(() => window.__mapleScene("home")); await page.waitForTimeout(900);
  check(await fox().then(f => f.keeps.fridge === "iman") && await page.locator('#world [data-keep="fridge"]').count() === 1, "and there it is on the fridge at home");
  await page.evaluate(() => window.__mapleScene("home")); await page.waitForTimeout(900);
  await page.click('[data-open="bag"]'); await page.click('#bag .item[data-id="pet_puppy"]'); await page.waitForSelector('#ctx [data-adoptfor="evan"]', { timeout: 15000 });
  await page.click('#ctx [data-adoptfor="evan"]'); await page.waitForSelector('#ctx [data-adoptat="home"]', { timeout: 15000 });
  check(await page.locator('#ctx [data-adoptat="room"]').count() === 1 && await page.locator('#ctx [data-adoptat="field"]').count() === 1, "adopting a puppy: it can live at home, in a building or outdoors");
  await page.click('#ctx [data-adoptat="home"]'); await page.waitForTimeout(800);
  const pet = await fox().then(f => (f.companions || [])[0]);
  check(pet && pet.owner === "evan" && pet.scene === "home" && pet.kind === "puppy" && await page.locator('#world [data-pet]').count() === 1, `the puppy is Evan's now and lives at home (${pet && pet.name})`);
  await page.locator('#world [data-pet]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-petdo="pat"]', { timeout: 15000 });
  await page.click('#ctx [data-petdo="pat"]'); await page.waitForTimeout(300);
  const canPlay = await page.locator('#ctx [data-petdo="play"]').count();
  if (canPlay) { await page.click('#ctx [data-petdo="play"]'); await page.waitForTimeout(500); }
  check(canPlay === 1 && await fox().then(f => f.companions[0].playDay && f.companions[0].patDay), "pat the puppy, and with Evan home, they play together");
  await page.click("#pclose").catch(() => {});
  await page.close();
}
{
  // Makers' Lane: Luna and Ohayo have their own buildings now, each with a health sign for its nightly bug check
  console.log("\nLuna and Ohayo on Makers' Lane");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`apps pageerror: ${e.message}`));
  await page.goto(url + "?reset=1&seed=1&time=10:30&date=2026-10-10"); await page.waitForTimeout(800);
  await page.evaluate(() => window.__mapleScene("lane")); await page.waitForTimeout(700);
  check(await page.locator('#world [data-place="luna"]').count() === 1 && await page.locator('#world [data-place="ohayo"]').count() === 1 && await page.locator('#world [data-place^="plot"]').count() === 0, "Luna and Ohayo have houses on Makers' Lane where their plots were");
  await page.addInitScript(() => { if (!/hellopatch/.test(location.search)) return;
    const d = {at: Date.now() - 3600e3, queued: 55, sent30: 3, opened30: 1, watched30: 1, reactions30: 1, watchRate30: 33, avgWatchSecs30: 7, arrived7: 68, sentTotal: 3, reactions: [{name: "Tester", product: "Chord", emoji: "❤️", text: "So lovely!", at: new Date().toISOString()}]};
    const f = JSON.parse(localStorage.getItem("fox.feeds") || "{}"); f["ohayo-hellos"] = d; localStorage.setItem("fox.feeds", JSON.stringify(f)); localStorage.setItem("stub:data/users/me/ohayo-hellos", JSON.stringify(d)); });
  await page.goto(url + "?seed=1&time=10:30&date=2026-10-10&hellopatch=1"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__mapleScene("ohayo")); await page.waitForTimeout(700);
  check(/55 waiting/.test(await page.locator("#sceneArt").textContent()) && /33%/.test(await page.locator("#sceneArt").textContent()), "the Ohayo house's hello chart shows who's waiting and the watched percentage");
  await page.locator('#world [data-spot="reactions"]').dispatchEvent("click"); await page.waitForSelector("#ctx .ohreact li", { timeout: 15000 });
  check(/So lovely!/.test(await page.locator("#ctx .ohreact").innerText()), "and its reactions board pins up what people sent back");
  await page.click("#pclose").catch(() => {});
  await page.locator('#world [data-spot="hellos"]').dispatchEvent("click"); await page.waitForSelector("#ctx .ohfunnel li", { timeout: 15000 });
  check(await page.locator("#ctx .ohfunnel li").count() === 4, "the hello chart opens: sent, opened, watched and reacted");
  await page.click("#pclose").catch(() => {});
  for (const app of ["ohayo", "luna"]) {
    await page.evaluate(a => window.__mapleScene(a), app); await page.waitForTimeout(700);
    await page.locator('#world [data-spot="status"]').dispatchEvent("click"); await page.waitForSelector("#ctx h2", { timeout: 15000 });
    check(new RegExp(`${app === "luna" ? "Luna" : "Ohayo"} health`).test(await page.locator("#ctx h2").innerText()) && /nightly bug check/.test(await page.locator("#ctx").innerText()), `inside the ${app} house, a health sign waiting for its nightly bug check`);
    await page.click("#pclose").catch(() => {});
  }
  await page.close();
}
{
  // Scoop Shack upgrades: buy them from the catalogue; the dip station's room (dips and toppings to buy, make a dipped
  // one to give), the honesty freezer's coin box filling while the shop's shut, and the delivery bike
  console.log("\nScoop Shack upgrades");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => { errors.push(`scoopup pageerror: ${e.message}`); console.log("PAGEERR", e.stack.slice(0, 600)); });
  page.on("dialog", d => { errors.push("the upgrades used a browser pop-up"); d.dismiss(); });
  const fox = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  await page.addInitScript(() => { const m = /uppatch=(\w+)/.exec(location.search); if (!m) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    if (m[1] === "stock") { f.scoop = {recipes: [{id: "mango+milk", ings: ["mango", "milk"], name: "Mango Gelato", col: "#F8D59A", dairy: true, special: false}], tubs: {"mango+milk": 300}}; f.coins = 3000; }
    if (m[1] === "rewind") f.scoop.at = 1;
    const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=12:00&date=2026-10-10"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=12:00&date=2026-10-10&uppatch=stock"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__mapleScene("bay")); await page.waitForTimeout(700);
  check(await page.locator('#world [data-place="hfreezer"]').count() === 0 && await page.locator('#world [data-place="dbike"]').count() === 0, "before any upgrades, no honesty freezer or bike on the bay");
  await page.evaluate(() => window.__mapleScene("scoopshop")); await page.waitForTimeout(700);
  await page.locator('#world [data-spot="gupgrades"]').dispatchEvent("click"); await page.waitForSelector("#ctx [data-gbuy]", { timeout: 15000 });
  check(await page.locator("#ctx [data-gbuy]").count() === 5, "the catalogue in the shop lists five upgrades");
  for (const k of ["honesty", "awning", "neon", "bike", "dip"]) { await page.evaluate(() => { document.querySelector("#ctx [data-close]")?.click(); });
    await page.locator('#world [data-spot="gupgrades"]').dispatchEvent("click"); await page.waitForSelector(`#ctx [data-gbuy="${k}"]`, { timeout: 15000 }); await page.click(`#ctx [data-gbuy="${k}"]`); await page.waitForTimeout(300); }
  const f1 = await fox();
  check(["honesty", "awning", "neon", "bike", "dip"].every(k => f1.scoop.up[k]) && f1.coins === 3000 - 2300, `all five bought (coins ${f1.coins})`);
  await page.click("#ctx [data-close]").catch(() => {});
  await page.locator('#world [data-spot="gddoor"]').dispatchEvent("click"); await page.waitForTimeout(2500);
  check(await page.locator('#world [data-spot="gdipbar"]').count() === 1 && await page.locator('#world [data-spot="gtops"]').count() === 1, "the dip station's door opens into its own room");
  await page.evaluate(() => window.__mapleScene("scoopdip")); await page.waitForTimeout(700);
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
  check(await page.locator('#ctx [data-gvto="marcus"]').count() === 0 && await page.locator('#ctx [data-gvto="mum"]').count() === 1, "the delivery bike sends from anywhere (a gelato isn't offered to Marcus)");
  await page.click('#ctx [data-gvto="mum"]'); await page.waitForTimeout(400);
  check(await fox().then(f => (f.thanks || []).some(t => t.who === "mum" && /^gel_/.test(t.item))), "Tomo pedals it to Mum, and a thank-you note is on its way");
  await page.goto(url + "?seed=1&time=21:00&date=2026-10-13&uppatch=rewind"); await page.waitForTimeout(2500);
  const box = await fox().then(f => f.scoop.box);
  check(await fox().then(f => (f.scoop.sold["2026-10-13"] || {}).cart > 0), "the cart sells at Tuesday's night market (the takings come to Mel)");
  check(box > 0, `the honesty freezer sold while the shop was shut (${box} coins in its box)`);
  await page.evaluate(() => window.__mapleScene("bay")); await page.waitForTimeout(700);
  check(await page.locator('#world [data-place="hfreezer"]').count() === 1 && await page.locator('#world [data-place="dbike"]').count() === 1 && await page.locator("#sceneArt .nightcopy circle").count() > 5, "the freezer and bike are on the bay, and the fairy lights glow at night");
  const c0 = await fox().then(f => f.coins);
  await page.locator('#world [data-place="hfreezer"]').dispatchEvent("click"); await page.waitForSelector("#ctx [data-gcollect]", { timeout: 15000 }); await page.click("#ctx [data-gcollect]"); await page.waitForTimeout(300);
  check(await fox().then(f => f.scoop.box === 0 && f.coins >= c0 + box), "collect the coins from the box");
  await page.locator('#world [data-place="hfreezer"]').dispatchEvent("click"); await page.waitForSelector("#ctx h2", { timeout: 15000 });
  await page.click("#pclose"); await page.waitForTimeout(400);
  check(await page.locator("#panel").isHidden() || !(await page.locator("#ctx").innerText()).includes("honesty freezer"), "the ✕ closes the Scoop Shack's panels too");
  await page.close();
}
{
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
  await page.evaluate(() => window.__mapleScene("market")); await page.waitForTimeout(800);
  await page.waitForSelector('#ctx [data-shop="deli"]', { timeout: 20000 }); await page.click('#ctx [data-shop="deli"]'); await page.waitForTimeout(300);
  check(await page.locator('#ctx .item[data-id="chocolate"]').count() === 1 && await page.locator('#ctx .item[data-id="pandan"]').count() === 1 && await page.locator('#ctx .item[data-id="milk"]').count() === 1,
    "Hana's deli stocks gelato staples: chocolate, vanilla, pistachios, pandan, milk and more");
  await page.evaluate(() => window.__mapleScene("vineyard")); await page.waitForTimeout(800);
  await page.locator('#world [data-place="barrels"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-vy="takegr"]', { timeout: 15000 });
  await page.click('#ctx [data-vy="takegr"][data-k="red"][data-n="1"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.inv.grape_red === 1 && f.vine.grapes.red === 2), "grapes wait in the vineyard's crates; take a bunch for the ice cream shop");
  await page.click('#ctx [data-vy="putgr"][data-k="red"]'); await page.waitForTimeout(300);
  check(await fox().then(f => !f.inv.grape_red && f.vine.grapes.red === 3), "or put them back for wine");
  await page.click("#ctx [data-close]").catch(() => {});
  await page.evaluate(() => window.__mapleScene("kitchen")); await page.waitForTimeout(800);
  await page.locator('#world [data-spot="larder"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-k="take"]', { timeout: 15000 });
  await page.click('#ctx [data-k="take"][data-id="fish"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.inv.fish >= 1 && !(f.kitchen.larder.fish)), "anything in the wine shop's larder can be taken back to the backpack");
  await page.close();
}
{
  // Accessories in the wardrobe: bought once at Hana's, worn or put away from the wardrobe
  console.log("\naccessories in the wardrobe");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`acc pageerror: ${e.message}`));
  await page.addInitScript(() => { if (!/accpatch/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    f.decorOwned = {...(f.decorOwned || {}), me_bow: true, me_pj: true}; f.decor = {...(f.decor || {}), me_bow: "on", me_pj: "on"};
    const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=10:30&date=2026-10-06"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=10:30&date=2026-10-06&accpatch=1"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__mapleScene("room")); await page.waitForTimeout(800);
  check(await page.locator("#melBow").isVisible() && await page.locator("#melPj").isVisible(), "Mel's wearing her velvet bow, and her silk pyjamas in her room");
  await page.locator('#world [data-spot="wardrobe"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-acc="me_bow"]', { timeout: 15000 });
  check(await page.locator("#ctx [data-acc]").count() === 2, "the wardrobe lists the accessories she owns");
  await page.click('#ctx [data-acc="me_bow"]'); await page.waitForTimeout(300); await page.click('#ctx [data-acc="me_pj"]'); await page.waitForTimeout(400);
  check(!(await page.locator("#melBow").isVisible()) && !(await page.locator("#melPj").isVisible()), "and she can take them off there");
  await page.click('#ctx [data-acc="me_bow"]'); await page.waitForTimeout(400);
  check(await page.locator("#melBow").isVisible(), "and put them back on");
  await page.close();
}
{
  // The evening light: a sunset from 6pm deepening into dusk by 7:30, the same on every outdoor screen
  console.log("\nsunset and dusk");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`sky pageerror: ${e.message}`));
  const wash = async (t, sc) => { await page.goto(url + `?reset=1&seed=1&time=${t}&date=2026-10-14`); await page.waitForTimeout(700); await page.evaluate(s => window.__mapleScene(s), sc); await page.waitForTimeout(600);
    return page.evaluate(() => { const r = document.querySelector("#sceneArt rect.dusk"); return r ? r.getAttribute("fill") : null; }); };
  check(await wash("12:00", "village") === null, "no wash in the daytime");
  const sun = await wash("18:45", "village"), dusk1 = await wash("19:30", "base"), dusk2 = await wash("19:30", "shore");
  check(sun && sun !== dusk1, "a warm sunset wash at 6:45pm");
  check(dusk1 === "#A3A9DC" && dusk2 === dusk1, "by 7:30 the dusk is the same on home and the foreshore");
  await wash("23:00", "village");
  check(await page.evaluate(() => { const n = document.querySelectorAll("#sceneArt .nightcopy .nightlab").length, all = document.querySelectorAll("#sceneArt text.lab").length;
    return n > 5 && n*2 === all && document.querySelectorAll("#sceneArt .nightcopy rect").length >= 4; }), "at night the street lamps light up and every place name sits on white tape above the dark");
  await page.close();
}
{
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
  await page.evaluate(() => window.__mapleScene("field")); await page.waitForTimeout(2500);
  const here = await ids();
  check(["yun", "jae", "mina", "tomas", "sora", "lior", "wen", "kai"].every(n => here.includes(n)), "Tuesday evening: eight out-of-town traders at their stalls");
  check(here.filter(n => ["noa", "jun", "bea", "omar", "lucy", "tae", "ivy", "rafe"].includes(n)).length >= 4, "and tourists out shopping");
  check(await page.locator('#world [data-place="jazzhat"]').count() === 1 && await page.locator('#world [data-place="exlawn"]').count() === 0, "a jazz stage on the lawn (the exercise mats packed away), with a hat for tips");
  const c0 = await page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")).coins);
  await page.locator('#world [data-place="jazzhat"]').dispatchEvent("click"); await page.waitForTimeout(4000);
  check(await page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")).coins) === c0 - 2, "two coins in the band's hat");
  await page.locator('#world [data-place="mstall0"]').dispatchEvent("click"); await page.waitForSelector('#ctx .item[data-id="friedchicken"]', { timeout: 15000 });
  const yunToday = await page.locator("#ctx .item[data-id]").evaluateAll(n => n.map(x => x.dataset.id));
  check(yunToday.length >= 4, `the Taiwanese snack stall sells its fried chicken and a few more things tonight (${yunToday.join(", ")})`);
  await page.click('#ctx .item[data-id="friedchicken"]'); await page.waitForTimeout(300);
  check(await page.evaluate(() => (JSON.parse(localStorage.getItem("fox.fox")).inv || {}).friedchicken === 1), "bought one, as a gift");
  await page.click('#ctx [data-close]').catch(() => {});
  await page.locator('#world [data-place="mstall5"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-decor="n_lanterns"]', { timeout: 15000 });
  check(await page.locator('#ctx [data-decor="r_moon"]').count() === 1, "the lantern stall has lanterns for the house and a moon lamp for Mel's room");
  await page.click('#ctx [data-close]').catch(() => {});
  check(here.includes("tomo") && await page.locator('#world [data-place="mstall8"]').count() === 1, "and the Scoop Shack's cart, with Tomo scooping");
  await page.locator('#world [data-place="mstall8"]').dispatchEvent("click"); await page.waitForSelector("#ctx h2", { timeout: 15000 });
  check(/cart/.test(await page.locator("#ctx h2").innerText()), "tap the cart to serve from it (it scoops from the shop's display)");
  await page.click('#ctx [data-close]').catch(() => {});
  check(await page.evaluate(() => [...document.querySelectorAll("#actors .npc")].length) > 0 && await page.evaluate(() => !document.querySelector('[data-track="jazz"]')), "the duo isn't a record on the record player");
  await page.goto(url + "?seed=1&time=17:40&date=2026-10-13"); await page.waitForTimeout(800);
  await page.evaluate(() => window.__mapleScene("field")); await page.waitForTimeout(2000);
  check((await ids()).includes("yun") && await page.locator('#world [data-place="jazzhat"]').count() === 1, "the night market's already on at 5:40pm (it opens at 5:30)");
  { // the stalls rotate their goods: another night market, another mix (the signature item stays)
    const offers = [];
    for (const d of ["2026-10-15", "2026-10-20", "2026-10-22"]) {
      await page.goto(url + `?seed=1&time=19:30&date=${d}`); await page.waitForTimeout(800);
      await page.evaluate(() => window.__mapleScene("field")); await page.waitForTimeout(1200);
      await page.locator('#world [data-place="mstall0"]').dispatchEvent("click"); await page.waitForSelector('#ctx .item[data-id="friedchicken"]', { timeout: 15000 });
      offers.push((await page.locator("#ctx .item[data-id]").evaluateAll(n => n.map(x => x.dataset.id))).join(","));
      await page.click('#ctx [data-close]').catch(() => {}); }
    check(new Set([yunToday.join(","), ...offers]).size >= 3, "the stalls rotate what they sell from one market to the next (fried chicken always)");
  }
  await page.goto(url + "?seed=1&time=19:30&date=2026-10-12"); await page.waitForTimeout(800);
  await page.evaluate(() => window.__mapleScene("field")); await page.waitForTimeout(1500);
  check(!(await ids()).includes("yun") && await page.locator('#world [data-place="jazzhat"]').count() === 0, "no night market on a Monday");
  await page.goto(url + "?seed=1&time=18:45&date=2026-10-13"); await page.waitForTimeout(800);
  await page.evaluate(() => window.__mapleScene("wineshop")); await page.waitForTimeout(1500);
  check((await ids()).includes("juniper"), "the wine shop's evening regulars still drop in (Juniper at 6:45 on a night market Tuesday)");
  await page.close();
}
{
  // Bedroom doors: Ma Ma and Gong Gong, Mum and Dad, Marcus and Angellina head to bed at 10:50pm and are gone after 11
  console.log("\nbedroom doors");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`bedroom pageerror: ${e.message}`));
  const ids = () => page.locator("#actors .npc").evaluateAll(n => n.map(x => x.dataset.npc));
  const pairs = {cottage: ["mama", "gonggong"], mumdad: ["mum", "dad"], marcus: ["marcus", "angelina"]};
  await page.goto(url + "?reset=1&seed=1&time=22:55&date=2026-10-13"); await page.waitForTimeout(800);
  for (const [h, two] of Object.entries(pairs)) { await page.evaluate(h => window.__mapleScene(h), h); await page.waitForTimeout(1500);
    check(await page.locator('#world [data-spot="bedroom"]').count() === 1 && await ids().then(a => two.every(f => a.includes(f))), `${h} has a bedroom door, and ${two.join(" and ")} are at it just before 11pm`); }
  check(await page.evaluate(() => { window.__mapleScene("cottage"); return true; }) && await page.locator('#world [data-spot="mbed"]').count() === 0, "Ma Ma's bed is out of the cottage's main room");
  await page.evaluate(() => window.__mapleScene("home")); await page.waitForTimeout(1500);
  check(await ids().then(a => a.includes("darren")), "Darren winds down on the sofa before bed");
  await page.goto(url + "?seed=1&time=23:30&date=2026-10-13"); await page.waitForTimeout(800);
  for (const [h, two] of Object.entries(pairs)) { await page.evaluate(h => window.__mapleScene(h), h); await page.waitForTimeout(1200);
    check(await ids().then(a => !two.some(f => a.includes(f))), `after 11pm ${two.join(" and ")} are behind the bedroom door`); }
  await page.locator('#world [data-spot="bedroom"]').dispatchEvent("click"); await page.waitForFunction(() => /asleep/.test(document.querySelector("#speech").textContent), null, { timeout: 15000 }).catch(() => {});
  check(/fast asleep/.test(await page.locator("#speech").textContent()), "knocking at night: they're fast asleep");
  await page.evaluate(() => window.__mapleScene("room")); await page.waitForTimeout(1000);
  check(await page.locator("#world .darrenBed").count() === 1, "and Darren's asleep in Mel's bed by 11pm");
  await page.goto(url + "?seed=1&time=15:00&date=2026-10-13"); await page.waitForTimeout(800);
  await page.evaluate(() => window.__mapleScene("room")); await page.waitForTimeout(1000);
  check(await page.locator("#world .darrenBed").count() === 0, "but not in the afternoon");
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
  page.on("dialog", d => { errors.push("the bank used a browser pop-up (blocked in the artifact frame)"); d.dismiss(); });
  await page.fill("#vAmt", "150"); await page.click('#ctx [data-vb="out"]'); await page.waitForTimeout(400);
  check(/\$850 of \$1,000/.test(await page.locator("#ctx .sub").textContent()), "taking some out uses the amount box (no pop-up)");
  await page.close();
}
{
  // Rain on any day of the year (light showers outside the wet season), and everyone in their own rain gear
  console.log("\nrainy days");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`rain pageerror: ${e.message}`));
  await page.goto(url + "?reset=1&seed=1&time=11:00&date=2026-10-12"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__mapleScene("base")); await page.waitForTimeout(1500);
  check(await page.evaluate(() => { const r = document.getElementById("rain"); return !r.hidden && r.classList.contains("light"); }), "a light shower in October (not just the wet season)");
  check(await page.locator("#melRain .brolly").count() === 1 && await page.evaluate(() => document.getElementById("evan").classList.contains("raincoat")), "Mel under her brolly, Evan in his raincoat and wellies");
  await page.evaluate(() => window.__mapleScene("village")); await page.waitForTimeout(2500);
  const gear = await page.evaluate(() => [...document.querySelectorAll("#actors .npc")].map(n => n.querySelector(".brolly") ? "b:" + n.querySelector(".brolly > path:nth-of-type(3)").getAttribute("style") : n.querySelector(".rcoat") ? "c:" + n.querySelector(".rcoat").getAttribute("style") : ""));
  check(gear.length > 0 && gear.every(Boolean) && new Set(gear).size > 1, "everyone in town has a brolly or a raincoat, not all the same");
  await page.goto(url + "?seed=1&time=11:00&date=2026-10-07"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__mapleScene("village")); await page.waitForTimeout(1500);
  check(await page.evaluate(() => document.getElementById("rain").hidden) && await page.locator("#melRain .brolly, #actors .brolly").count() === 0, "and on a dry day the brollies are put away");
  await page.close();
}
{
  // Fishing: a rod, worms from real-life quests, cast, wait for the bite, reel in the green; a journal of catches
  console.log("\nfishing");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`fishing pageerror: ${e.message}`));
  const fox = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  await page.addInitScript(() => { if (!/fishpatch/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    f.coins = 500; const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=12:00&date=2026-10-07"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=12:00&date=2026-10-07&fishpatch=1"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__mapleScene("base")); await page.waitForTimeout(900);
  check(await page.locator('#world [data-place="fishriver"]').count() === 1, "a fishing spot on the home river");
  await page.locator('#world [data-place="fishriver"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-fish="rod"]', { timeout: 15000 });
  await page.click('#ctx [data-fish="rod"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.coins === 420 && f.fish.rod && f.fish.bait === 3) && /3 worms/.test(await page.locator("#ctx").textContent()), "a rod for 80 coins, and three worms in the bait tin to start the day");
  await page.click('#ctx [data-fish="cast"]'); await page.waitForTimeout(200); await page.click('#ctx [data-fish="reel"]'); await page.waitForTimeout(200);
  check(/Too soon/.test(await page.locator("#ctx").textContent()) && await fox().then(f => f.fish.bait === 2), "reel in before the bite and it's gone (with the worm)");
  await page.click('#ctx [data-fish="cast"]'); await page.waitForSelector("#ctx .fbar", { timeout: 9000 });
  check(await page.locator("#world #melRod").isVisible(), "Mel holds her rod while she's fishing");
  await page.waitForFunction(() => { const e = document.querySelector("#ctx .fbar"); if (!e) return true; const q = ((Date.now() - +e.dataset.t0)/+e.dataset.dur) % 2, m = q < 1 ? q : 2 - q; if (Math.abs(m - +e.dataset.at) >= +e.dataset.w/2 - .03) return false; document.querySelector('#ctx [data-fish="reel"]').click(); return true; }, null, { polling: 10, timeout: 5000 });   // reel the instant it's in the green (a separate click can miss it on a busy machine)
  await page.waitForTimeout(300);
  const f1 = await fox(), got = Object.keys(f1.fish.caught);
  check(got.length === 1 && ["roach", "trout", "perch", "boot"].includes(got[0]) && /New in the journal/.test(await page.locator("#ctx .fcatch").textContent()), "reel while the marker's in the green and it's landed: a river fish, new in the journal");
  check(["boot"].includes(got[0]) || (f1.inv[got[0] === "trout" ? "trout" : "fish"] || 0) >= 1, "and it's in the backpack (trout for the kitchen, others as fish)");
  await page.click('#ctx [data-fish="view"][data-k="journal"]'); await page.waitForTimeout(200);
  check(await page.locator("#ctx li.locked").count() === 22 && /dusk/i.test(await page.locator("#ctx").textContent()), "the journal: one found, twenty-two still to find, each with a hint (the golden koi at dusk)");
  await page.click('#ctx [data-fish="view"][data-k="fish"]'); await page.waitForTimeout(200);
  await page.click('#ctx [data-fish="cast"]'); await page.waitForSelector("#ctx .fbar", { timeout: 9000 }); await page.waitForTimeout(3700);
  check(/slipped away/.test(await page.locator("#ctx").textContent()) && await fox().then(f => f.fish.bait === 0), "wait too long after the bite and it slips away");
  check(await page.locator('#ctx [data-fish="cast"]').isDisabled() && /Finish a quest/.test(await page.locator("#ctx").textContent()), "no worms left: finish a quest to dig up another");
  await page.close();
}
{
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
  await page.evaluate(() => window.__mapleScene("kitchen")); await page.waitForTimeout(900);
  await page.locator('#world [data-spot="press"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-k="press"]', { timeout: 15000 });
  check(/cow's or goat's/.test(await page.locator("#ctx").textContent()) && await page.locator('#ctx [data-k="press"]').isEnabled(), "the cheese press takes goat's milk");
  await page.locator('#ctx [data-close]').first().click();
  await page.locator('#world [data-spot="stove"]').dispatchEvent("click"); await page.waitForSelector("#ctx .krequest", { timeout: 15000 });
  check(/has been craving .* sells for \d+ coins a plate instead of \d+/.test(await page.locator("#ctx .krequest").textContent()), "someone in town is craving one of the season's tapas: it sells for half as much again");
  const txt = await page.locator("#ctx").textContent();
  check(["Grilled halloumi with honey", "Huevos rotos", "Yoghurt with honey and walnuts", "Grilled sardines"].every(n => txt.includes(n)) && ["Honey cake", "Flower shortbread", "Blueberry tart", "Farm cheese board"].every(n => txt.includes(n)), "new tapas (halloumi, huevos rotos, yoghurt, seafood) and small plates (honey cake, flower shortbread, blueberry tart, farm cheese board)");
  await page.locator('#ctx [data-k="tapas"][data-id="halloumi"]').click(); await page.waitForTimeout(200); await page.locator('#ctx [data-k="cooktapas"]').click(); await page.waitForTimeout(300);
  check(await fox().then(f => f.vine.tapasList.some(t => t.id === "halloumi" && t.plates === 6) && !f.kitchen.larder.chz_halloumi && f.kitchen.larder.honey === 1), "Wildflower Farm's halloumi and honey make grilled halloumi with honey");
  await page.locator('#ctx [data-k="dish"][data-dish="shortbread"]').click(); await page.waitForTimeout(300);
  check(await fox().then(f => f.vine.menu.shortbread === 4 && !f.kitchen.larder.tulip), "garden tulips go into flower shortbread");
  await page.close();
}
{
  // Phase 4, the rest: sunflower seeds for the hens, petal syrup, bouquet orders, Ma Ma's tomato and egg at dinner
  console.log("\nflowers, eggs and Ma Ma's tomato and egg");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`phase4 pageerror: ${e.message}`));
  const fox = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  await page.addInitScript(() => { if (!/p4patch/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    f.inv = {...(f.inv || {}), sunflower: 1, chickfeed: 3, tomato: 2, egg: 2, bq_tulip: 1}; f.pets = {...(f.pets || {}), animals: [{id: "a1", kind: "chick", name: "Hennie", born: 0, feeds: 9, fedDay: null, col: 0}], next: 2, run: 0};
    f.kitchen = {larder: {tulip: 3, milk: 1, lemon: 1}, oven: null, press: null}; f.vine = {...(f.vine || {}), help: {cook: false}};
    const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=12:30&date=2026-10-07"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=12:30&date=2026-10-07&p4patch=1"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__mapleScene("base")); await page.waitForTimeout(900);
  await page.locator('#world [data-place="run"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-treat]', { timeout: 20000 });
  await page.click('#ctx [data-treat]'); await page.waitForTimeout(300);
  const eggs0 = await fox().then(f => f.inv.egg || 0);
  await page.locator('#ctx [data-feed]').first().click(); await page.waitForTimeout(300);
  check(await fox().then(f => !f.inv.sunflower && f.pets.treat === "2026-10-07" && (f.inv.egg || 0) === eggs0 + 2), "a garden sunflower's seeds for the hens: two eggs a meal today");
  await page.evaluate(() => window.__mapleScene("kitchen")); await page.waitForTimeout(900);
  await page.locator('#world [data-spot="larder"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-k="syrup"]', { timeout: 15000 });
  await page.click('#ctx [data-k="syrup"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.inv.syrup === 2 && !f.kitchen.larder.tulip), "three garden tulips make two bottles of petal syrup");
  await page.locator('#ctx [data-k="send"][data-id="syrup"]').click(); await page.waitForTimeout(200);
  await page.locator('#ctx [data-close]').first().click();
  await page.locator('#world [data-spot="stove"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-dish="posset"]', { timeout: 15000 });
  await page.click('#ctx [data-dish="posset"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.vine.menu.posset === 4), "petal syrup, milk and a lemon make a lemon and petal posset");
  await page.evaluate(() => window.__mapleScene("orchard")); await page.waitForTimeout(900);
  await page.locator('#world [data-place="farmshop"]').dispatchEvent("click");
  await page.waitForSelector('#ctx [data-or="order"]', { timeout: 20000 }).catch(() => {});
  const c0 = await fox().then(f => f.coins);
  if (await page.locator('#ctx [data-or="order"]').count()) { await page.click('#ctx [data-or="order"]'); await page.waitForTimeout(300);
    check(await fox().then(f => f.coins === c0 + 25 && !f.inv.bq_tulip), "a bouquet order at Ma Ma's: hand one over for 25 coins"); }
  else check(false, "a bouquet order at Ma Ma's: hand one over for 25 coins");
  await page.goto(url + "?seed=1&time=19:00&date=2026-10-07"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__mapleScene("cottage")); await page.waitForTimeout(2000);
  await page.locator('#world [data-spot="dine"]').dispatchEvent("click"); await page.waitForTimeout(1500);
  check(await fox().then(f => !f.inv.tomato && (f.inv.egg || 0) === eggs0), "at family dinner, two tomatoes and two eggs become Ma Ma's tomato and egg");
  await page.close();
}
{
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
  await page.evaluate(() => window.__mapleScene("hlane")); await page.waitForTimeout(900);
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
  check(await fox().then(f => f.coins === 95 && f.bike && f.bike.until > Date.now()), "a hire bike: 5 coins for an hour");
  await page.click('#ctx [data-close]');
  await page.locator('#world [data-place="lookout"]').dispatchEvent("click"); await page.waitForTimeout(400);
  check(await page.locator("#mel.biking").count() === 1, "Mel rides it (faster than walking, slower than the scooter)");
  await page.waitForTimeout(3500);
  await page.locator('#world [data-place="taxiwoods"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-taxi]', { timeout: 15000 });
  check(await page.locator('#ctx [data-taxi]').count() === 4, "the river taxi stops: Makers' Lane, home, the lake and the foreshore");
  await page.click('#ctx [data-taxi="taxishore"]'); await page.waitForTimeout(800);
  check(await page.locator(".taxiride").count() === 1, "a little ride down the river on the launch");
  await page.waitForFunction(() => /foreshore/i.test(document.querySelector("#sceneName").textContent), null, { timeout: 15000 });
  check(await fox().then(f => f.coins === 91), "and off at the foreshore, one gate from Ma Ma's flower farm (4 coins)");
  await page.evaluate(() => window.__mapleScene("base")); await page.waitForTimeout(900);
  await page.locator('#world [data-place="homejetty"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-taxiopen]', { timeout: 15000 });
  await page.click('#ctx [data-taxiopen]'); await page.waitForTimeout(300);
  check(await page.locator('#ctx [data-taxi]').count() === 4 && await page.locator('#world [data-place="taxihome"]').count() === 0, "at home the river taxi stops at the little jetty (no separate stop): paddle or take the taxi");
  await page.locator('#ctx [data-close]').first().click();
  await page.evaluate(() => window.__mapleScene("lane")); await page.waitForTimeout(900);
  check(await page.locator('#world [data-place="toWoodsM"]').count() === 1 && await page.locator('#world [data-place="taxilane"]').count() === 1, "Makers' Lane: the river comes down from the woods, with a taxi stop and a path up the hill");
  await page.goto(url + "?seed=1&time=7:00&date=2026-10-10"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__mapleScene("shore")); await page.waitForTimeout(2000);
  check(await page.locator('#actors .npc[data-npc="dad"] .bikeArt, #actors .npc[data-npc="dad"]').count() >= 1 && await page.evaluate(() => { const n = document.querySelector('#actors .npc[data-npc="dad"]'); return !!n && n.innerHTML.includes("#8A5A3A") && n.innerHTML.includes("#E8566C"); }), "Dad's fishing off the pier on a Saturday morning");
  await page.goto(url + "?seed=1&time=21:30&date=2026-10-07"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__mapleScene("honeysuckle")); await page.waitForTimeout(2000);
  check(await ids().then(a => a.includes("mateo") && a.includes("lila")), "Mateo and Lila are home in Honeysuckle in the evening");
  await page.close();
}
{
  // Round 104: backstories told a chapter at a time in the bubbles (on days with a quest done), with rewards; and
  // Mel's family at the night market and the fair
  console.log("\nstories and the family out at the fairs");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`stories pageerror: ${e.message}`));
  const fox = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  const ids = () => page.locator("#actors .npc").evaluateAll(n => n.map(x => x.dataset.npc));
  await page.addInitScript(() => { if (!/storypatch/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    f.met = {...(f.met || {}), celeste: true}; f.goals = {...(f.goals || {}), cocoa: 1}; f.story = {heard: {celeste: 4}, day: {}, log: [], flags: {}};
    if (/quest=1/.test(location.search)) f.storyDay = "2026-10-07";
    const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=12:00&date=2026-10-07"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=12:00&date=2026-10-07&storypatch=1"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__mapleScene("wineshop")); await page.waitForTimeout(2800);
  check(await page.locator('#actors .npc[data-npc="celeste"].story').count() === 0, "no quest done today: no story chapter yet");
  await page.goto(url + "?seed=1&time=12:00&date=2026-10-07&storypatch=1&quest=1"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__mapleScene("wineshop")); await page.waitForTimeout(2800);
  check(await page.locator('#actors .npc[data-npc="celeste"].story').count() === 1, "a quest done today: Celeste has a chapter ready (the little … over her head)");
  await page.locator('#actors .npc[data-npc="celeste"]').dispatchEvent("click"); await page.waitForTimeout(600);
  check(/smelled chocolate again/.test(await page.locator("#npcSay").textContent()), "she tells it in her bubbles: the old chocolatier was her family's");
  const f1 = await fox();
  check(f1.story.heard.celeste === 5 && f1.inv.s_recipebook === 1 && f1.inv.s_praline === 2, "and gives Mel Henri's recipe book and his pralines");
  await page.waitForTimeout(12000);
  await page.locator('#actors .npc[data-npc="celeste"]').dispatchEvent("click"); await page.waitForTimeout(400);
  check(await fox().then(f => f.story.heard.celeste === 5), "one chapter a day: the next waits for another day");
  { const st = await import(new URL("../src/game/stories.js", import.meta.url)), day = "2026-10-07", ids = ["celeste", "okada", "hana", "bo", "theo", "juniper"];
    const F = {storyDay: day, met: Object.fromEntries(ids.map(i => [i, true])), story: {heard: {}, day: {}, log: [], flags: {}}}, ready = () => ids.filter(i => st.storyReady(F, i, day));
    const r0 = ready().length; st.tellStory(F, ready()[0], () => {}, day); st.tellStory(F, ready()[0], () => {}, day);
    check(r0 === 2 && ready().length === 0, "at most two villagers tell a chapter a day (six could; two do)"); }
  // the family at the night market (Tuesday) and the fair (the last Saturday)
  await page.goto(url + "?seed=1&time=18:45&date=2026-10-06"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__mapleScene("field")); await page.waitForTimeout(2500);
  check(await ids().then(a => ["mama", "gonggong", "marcus", "angelina"].every(x => a.includes(x))), "Tuesday's night market: Ma Ma, Gong Gong, Marcus and Angellina are there");
  await page.goto(url + "?seed=1&time=11:30&date=2026-10-31"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__mapleScene("field")); await page.waitForTimeout(2500);
  check(await ids().then(a => ["mum", "dad", "mama", "gonggong"].every(x => a.includes(x))), "the field fair: Mum, Dad, Ma Ma and Gong Gong are there in the morning");
  await page.close();
}
{
  // Round 105: reopening the game the same day picks up where Mel left off; tulip bulbs on sale in autumn
  console.log("\npicking up where you left off");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, resume: true });
  page.on("pageerror", e => errors.push(`resume pageerror: ${e.message}`));
  await page.goto(url + "?reset=1&seed=1&time=12:00&date=2026-10-07"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=12:00&date=2026-10-07"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__mapleScene("hwoods")); await page.waitForTimeout(1200);
  await page.locator('#world [data-place="lookout"]').dispatchEvent("click"); await page.waitForTimeout(3500);
  await page.goto(url + "?seed=1&time=12:30&date=2026-10-07"); await page.waitForTimeout(1500);
  check(/Woods/.test(await page.locator("#sceneName").textContent()), "reopening the same day: back in Honeybrook Woods, where Mel left off");
  await page.goto(url + "?seed=1&time=9:00&date=2026-10-08"); await page.waitForTimeout(1500);
  check(/Home/.test(await page.locator("#sceneName").textContent()), "a new day: she wakes up at home");
  await page.evaluate(() => window.__mapleScene("village")); await page.waitForTimeout(800);
  await page.locator('#world [data-place="market"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-shop="seeds"]', { timeout: 20000 });
  await page.click('#ctx [data-shop="seeds"]'); await page.waitForTimeout(300);
  check(await page.locator('#ctx .item[data-id="tulip_seed"]').count() === 1 && await page.locator('#ctx .item[data-id="sunflower_seed"]').count() === 1, "in autumn the seed shelf has tulip bulbs and sunflower seeds");
  await page.close();
}
{
  console.log("\na day trip to Kyoto");
  const tw = await import(new URL("../src/data/towns.js", import.meta.url)), K = tw.TOWNS.kyoto;
  { const own = [...readFileSync(join(root, "src/data/world.js"), "utf8").matchAll(/^  ([a-zA-Z_]+):\s*\{scene:/gm)].map(m => m[1]);
    check(!Object.keys(tw.TOWN_PLACES).some(k => own.includes(k)), "no town's places share a name with a Honeybrook place (Kyoto's temple hall once replaced the Town hall)"); }
  check(K.fare === 60 && K.screens.length === 4 && K.screens.every(sc => tw.townOf(sc) === "kyoto") && Object.keys(tw.TOWN_BRIDGES).filter(k => k.startsWith("kt_")).length === 4, "Kyoto: four screens, 60 coins a ticket");
  const ronda = tw.TOWNS.ronda.acts, used = new Set(Object.values(ronda).flatMap(a => Object.values(a).map(x => x.act)));
  check(Object.values(K.acts).every(a => Object.values(a).every(x => !used.has(x.act))), "nobody in the family does the same thing in Kyoto as in Ronda");
  { const ky = await import(new URL("../src/game/kyoto.js", import.meta.url)), F = {coins: 100, inv: {}}, add = (id, n) => { F.inv[id] = (F.inv[id] || 0) + n; };
    const w = ky.whiskStart(0); for (let i = 0; i < 8; i++) ky.whisk(w, w.t0 + i*ky.TEA.BEAT + 30); const w2 = ky.whiskStart(0); for (let i = 0; i < 8; i++) ky.whisk(w2, w2.t0 + i*ky.TEA.BEAT + 280);
    check(ky.froth(w) && !ky.froth(w2), "the tea ceremony: whisks on the beat froth the tea, off the beat don't");
    const b = ky.sitStart(0); [["in", 100], ["out", 4100], ["in", 8100], ["out", 12100], ["in", 16100], ["out", 20100]].forEach(([k, t]) => ky.breathe(b, k, b.t0 + t)); check(b.done && ky.calm(b), "meditation: three breaths with the circle");
    check(ky.makeNerikiri(F, "sakura", add) === "nk_sakura" && ky.throwCup(F, true, add) && F.inv.k_mycup === 1 && F.inv.k_dadcup === 1 && F.coins === 82, "a nerikiri (8) and a teacup on the wheel (10), Dad's lopsided one too");
    Object.keys(ky.STAMP_AT).forEach(p => ky.stamp(F, p)); check(F.kyoto.lantern && ky.stampCount(F) === 8, "eight stamps fill the book, and the stone lantern goes by the pond at home"); }
  { const np = await import(new URL("../src/data/npcs.js", import.meta.url)), ids = np.NPCS.map(n => n.id), kt = np.NPCS.filter(n => n.local === "kyoto");
    check(new Set(ids).size === ids.length && kt.length >= 15 && kt.filter(n => n.tourist).length >= 6, "Kyoto has plenty of people to meet (and no two villagers share an id)"); }
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`kyoto pageerror: ${e.message}`));
  const fox = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  const ids = () => page.locator("#actors .npc").evaluateAll(n => n.map(x => x.dataset.npc));
  await page.addInitScript(() => { if (!/ktcoins/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    f.coins = 300; const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=10:00&date=2026-11-12"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=10:00&date=2026-11-12&ktcoins=1"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__mapleScene("hlane")); await page.waitForTimeout(900);
  await page.locator('#world [data-place="timetable"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-tickets]', { timeout: 15000 });
  await page.click('#ctx [data-tickets]'); await page.waitForSelector('#ctx [data-ttown="kyoto"]', { timeout: 15000 });
  await page.click('#ctx [data-ttown="kyoto"]'); await page.waitForTimeout(300);
  await page.click('#ctx [data-tpick="gonggong"]'); await page.click('#ctx [data-tpick="evan"]');
  check(/120/.test(await page.locator("#ctx [data-trip]").textContent()) && /Kyoto/.test(await page.locator("#ctx h2").textContent()), "the ticket window offers Kyoto: Mel and Gong Gong, 120 coins (Evan free)");
  await page.click("#ctx [data-trip]");
  await page.waitForFunction(() => /Kyoto/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 }); await page.waitForTimeout(2000);
  check(await fox().then(f => f.coins === 180 && f.trip.town === "kyoto") && await ids().then(a => a.includes("gonggong")), "off the train at Kyoto station, with Gong Gong and Evan");
  check(await page.evaluate(() => ["kttrain", "ktbamboo", "ktyukata", "ktToLane", "ktToRiver"].every(id => document.querySelector(`#world [data-place="${id}"]`))), "the station screen: the station, the bamboo grove, the yukata shop, and the ways east and south");
  for (const [gate, want, places] of [["ktToLane", "Higashiyama", ["ktpagoda", "ktchaya", "ktwagashi", "ktpottery"]], ["ktStepsDown", "temple", ["kthall", "kttorii", "ktzen", "ktkoi"]], ["ktToRiverW", "river", ["ktnishiki", "ktstones"]], ["ktToStationN", "station", ["kttrain"]]]) {
    await page.locator(`#world [data-place="${gate}"]`).dispatchEvent("click");
    await page.waitForFunction(w => new RegExp(w).test(document.querySelector("#sceneName").textContent), want, { timeout: 25000 }); await page.waitForTimeout(1200);
    check(await page.evaluate(ps => ps.every(id => document.querySelector(`#world [data-place="${id}"]`)), places) && await ids().then(a => a.includes("gonggong")), `through the gate to Kyoto's ${want} (Gong Gong follows)`);
  }
  // round 122-124: the yukata shop, the five rooms and their activities, the stamp book
  await page.locator('#world [data-place="ktyukata"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-kt="yukata:indigo"]', { timeout: 15000 });
  await page.click('#ctx [data-kt="yukata:indigo"]'); await page.waitForTimeout(500);
  check(await fox().then(f => f.kyoto.yukata && f.kyoto.yukata.col === "indigo" && f.coins === 165) && await page.locator("#oDress").evaluate(e => e.style.display !== "none"), "a yukata for the day (15 coins): Mel's in indigo");
  check(await page.locator("#evan").evaluate(e => e.style.getPropertyValue("--tee") === "#3E5E7A"), "and Evan's in a little jinbei");
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
    await page.evaluate(r => window.__mapleScene(r), room); await page.waitForTimeout(1300);
    check(await ids().then(a => a.includes(who)) && await page.locator(`#world [data-rdspot="${spot}"]`).count() === 1, `${room}: ${who} is there, and there's something to do`);
  }
  await page.evaluate(() => window.__mapleScene("kt_sweets")); await page.waitForTimeout(1200);
  await page.locator('#world [data-rdspot="kt_sweets"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-kt="shape:momiji"]', { timeout: 15000 });
  await page.click('#ctx [data-kt="shape:momiji"]'); for (const s of [0, 2, 1, 2, 3]) await page.click(`#ctx [data-kt="step:${s}"]`).catch(() => {});
  await page.click('#ctx [data-kt="neri"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.inv.nk_momiji === 1), "a nerikiri maple leaf, made with Mr Tanaka, boxed up as a gift");
  await page.click("#ctx [data-close]"); await page.waitForTimeout(300);
  await page.evaluate(() => window.__mapleScene("kt_hall")); await page.waitForTimeout(1200);
  await page.locator('#world [data-rdspot="kt_hall"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-kt="sit"]', { timeout: 15000 });
  check(/stamp book/i.test(await page.locator("#ctx").innerText()), "the temple hall: sit with Jōshin, draw a fortune, and see the stamp book");
  await page.click('#ctx [data-kt="fortune"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.kyoto.fortunes === 1), "a fortune slip (1 coin)");
  await page.click("#ctx [data-close]"); await page.waitForTimeout(300);
  await page.evaluate(() => window.__mapleScene("kt_station")); await page.waitForTimeout(1200);
  await page.locator('#world [data-place="kttrain"]').dispatchEvent("click"); await page.waitForSelector("#ctx [data-triphome]", { timeout: 15000 });
  await page.click("#ctx [data-triphome]");
  await page.waitForFunction(() => /Honeybrook station/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  check(await fox().then(f => f.trip.done), "and the train home from Kyoto");
  await page.close();
}

{
  console.log("\na day trip to Ronda");
  // who's away: tours, Ma Ma's stall, Mum's class and the family dinner all work round them
  { const t = await import(new URL("../src/game/tours.js", import.meta.url)), sun = "2026-10-11", tue = "2026-10-13", wed = "2026-10-14";
    const host0 = t.dinnerOn(sun).host;
    t.setAway(() => ["mama", "gonggong", "mum", "dad", "darren"]);
    check(t.toursOn(sun).every(x => !["mama", "gonggong"].includes(x.guide)) && t.eventOn(sun).stalls.find(x => x.at === 4).id === "mei", "Ma Ma and Gong Gong away: Farid or Mei lead the tours, and Mei minds Ma Ma's stall");
    check(t.toursOn(tue)[0].guide === "farid" && !t.classOn(tue), "Darren away: Farid leads his Tuesday tour; Mum away: no class that morning");
    const hostAway = d => ({mumdad: ["mum", "dad"], cottage: ["mama", "gonggong"], marcus: [], home: []})[t.dinnerOn(d).host].length > 0;
    check(!hostAway(sun) && !hostAway(wed) && (["mumdad", "cottage"].includes(host0) ? t.dinnerOn(sun).host !== host0 : true), "a family dinner whose hosts are away moves to another house");
    t.setAway(() => []);
    check(t.dinnerOn(sun).host === host0 && t.eventOn(sun).stalls.find(x => x.at === 4).id === "mama", "and with nobody away, everything's as usual"); }
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
  { const st = await import(new URL("../src/game/stories.js", import.meta.url)), day = "2026-10-11", F = {met: {carmen: true, pilar: true}, inv: {}};
    const add = (id, n) => { F.inv[id] = (F.inv[id] || 0) + n; };
    check(!!st.storyReady(F, "carmen", day) && !st.storyReady(F, "pilar", day), "in Ronda, Doña Carmen tells her story without a quest that day (Honeybrook's villagers still wait for one)");
    F.story = {heard: {pilar: 2, carmen: 2}, day: {}, log: [], flags: {}};
    const t = st.tellStory(F, "carmen", add, day);
    check(t && /Rosario/.test(t.lines.join(" ")) && F.inv.yemas === 2, "Carmen's third chapter: Pilar is Rosario's girl, and two boxes of yemas to take home");
    F.storyDay = "2026-10-12"; F.story.heard.pilar = 3;
    check(/Carmen/.test((st.storyReady(F, "pilar", "2026-10-12") || {ch: {lines: []}}).ch.lines.join(" ")), "and back home, Pilar has a new chapter about Doña Carmen"); }
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, resume: true });
  page.on("pageerror", e => errors.push(`ronda pageerror: ${e.message}`));
  const fox = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  const ids = () => page.locator("#actors .npc").evaluateAll(n => n.map(x => x.dataset.npc));
  const scn = () => page.locator("#sceneName").textContent();
  await page.addInitScript(() => { if (!/tripcoins/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    f.coins = 300; const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=10:00&date=2026-10-11"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=10:00&date=2026-10-11&tripcoins=1"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__mapleScene("hlane")); await page.waitForTimeout(900);
  await page.locator('#world [data-place="timetable"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-tickets]', { timeout: 15000 });
  await page.click('#ctx [data-tickets]'); await page.waitForSelector('#ctx [data-tpick="mama"]', { timeout: 15000 });
  check(await page.locator("#ctx [data-tpick]").count() === 8 && /40/.test(await page.locator("#ctx").innerText()), "the ticket window: Ronda, 40 coins a person, pick from all eight of the family");
  for (const id of ["mama", "gonggong", "evan"]) await page.click(`#ctx [data-tpick="${id}"]`);
  check(/120/.test(await page.locator("#ctx [data-trip]").textContent()), "Mel, Ma Ma and Gong Gong: three tickets; Evan rides free (120 coins)");
  await page.click("#ctx [data-trip]");
  await page.waitForFunction(() => /Ronda/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 }); await page.waitForTimeout(2500);
  check(await fox().then(f => f.coins === 180 && f.trip && f.trip.party.join() === "mama,gonggong,evan"), "tickets paid, and the trip's on");
  { const tw = await import(new URL("../src/data/towns.js", import.meta.url)), R = tw.TOWNS.ronda.rooms, mus = Object.values(R).map(r => r.music);
    check(Object.keys(R).length >= 5 && new Set([...mus, tw.TOWNS.ronda.music]).size === mus.length + 1 && Object.keys(R).every(r => tw.townOf(r) === "ronda" && tw.TOWN_PLACES[R[r].door]), "Ronda has its interiors behind its doors (six: Mel asked for the leather workshop too), each with its own music");
    const rd = await import(new URL("../src/game/ronda.js", import.meta.url));
    const good = rd.palmasStart(0); [0, 1].forEach(k => rd.ACCENTS.forEach(a => rd.clap(good, good.t0 + (k*12 + a)*rd.BEAT_MS + 100)));
    const bad = rd.palmasStart(0); for (let bt = 0; bt < 24; bt++) rd.clap(bad, bad.t0 + bt*rd.BEAT_MS + 100);
    check(rd.showOn(13*60 + 30) && rd.showOn(20*60 + 30) && !rd.showOn(16*60) && rd.ole(good) && good.hits === 10 && !rd.ole(bad), "flamenco at 1 and 8: clap on 3, 6, 8, 10 and 12 for an olé (clapping on every beat doesn't count)");
    const tea = {t0: 0, glasses: []}; rd.pour(tea, .82*900); rd.pour(tea, 0); check(tea.glasses.join() === "true,false", "Amina's mint tea: pour from high up and it froths");
    const Fp = {coins: 10, inv: {}}, addp = (id, n) => { Fp.inv[id] = (Fp.inv[id] || 0) + n; };
    check(rd.paintTile(Fp, "azul", "star", true, addp) === "ptile_azul_star" && Fp.coins === 2 && Fp.inv.etile === 1 && rd.paintTile(Fp, "verde", "wave", false, addp) === null, "painting a tile at Lucía's (8 coins): a keepsake, and Evan's finger-painted one too");
    check(["especias", "ceramica", "postales"].every(s => Object.values(tw.TOWN_GOODS).filter(g => g.shop === s).length === 3), "shopping corners: spices and ceramics at the market, postcards at Doña Carmen's"); }
  check(await ids().then(a => a.includes("mama") && a.includes("gonggong")) && await page.locator("#evan").evaluate(n => n.style.display !== "none"), "off the train at Ronda station: Ma Ma, Gong Gong and Evan came too");
  check(await page.evaluate(() => ["rdtrain", "alameda", "bandstand", "rdToPlaza", "rdStepsDown"].every(id => document.querySelector(`#world [data-place="${id}"]`))), "Ronda's station screen: the station, the Alameda balcony, the bandstand, the way to the plaza and the gorge steps");
  await page.locator('#world [data-place="rdToPlaza"]').dispatchEvent("click");
  await page.waitForFunction(() => /plaza/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 }); await page.waitForTimeout(1500);
  check(await ids().then(a => a.includes("mama") && a.includes("gonggong")), "they follow Mel to the plaza");
  check(await page.locator('#actors .npc[data-npc="mama"].act-haggle').count() === 1, "the plaza on a Sunday morning: Ma Ma haggling");
  check(await page.evaluate(() => ["mercado", "tapas", "dulces", "fuente", "rdBridgeN", "rdToStation"].every(id => document.querySelector(`#world [data-place="${id}"]`))), "the plaza: the market, the tapas bar, the sweet shop, the fountain, Puente Nuevo");
  await page.locator('#actors .npc[data-npc="mama"]').dispatchEvent("click"); await page.waitForTimeout(400);
  await page.locator('#actors .npc[data-npc="mama"]').dispatchEvent("click"); await page.waitForTimeout(400);
  { let town = false; for (let k = 0; k < 6 && !town; k++) { await page.locator('#actors .npc[data-npc="mama"]').dispatchEvent("click"); await page.waitForTimeout(300); town = /sweeter|Aiyo|big drop/.test(await page.locator("#npcSay").textContent()); }
    check(town, "Ma Ma has things to say about Ronda (her own oranges are sweeter)"); }
  // round 116: the doors lead inside
  await page.locator('#world [data-place="tapas"]').dispatchEvent("click");
  await page.waitForFunction(() => /tapas bar/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 }); await page.waitForTimeout(1500);
  check(await ids().then(a => a.includes("paco") && a.includes("mama")) && await page.locator('#world [data-rdspot="tapas"]').count() === 1, "through the door: inside the tapas bar, Paco waiting tables, and the family came in too");
  await page.locator('#world [data-rdspot="tapas"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-rtaste="naranjas"]', { timeout: 15000 });
  await page.click('#ctx [data-rtaste="naranjas"]'); await page.waitForTimeout(400);
  check(await fox().then(f => f.learned && f.learned.naranjas && f.coins === 176), "the tapas bar: a taste of orange salad (4 coins), and now Mel knows how to make it");
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
  check(/plaza/.test(await scn()) && await ids().then(a => a.includes("mama")), "reopening mid-trip: back in Ronda's plaza, with the family");
  await page.evaluate(() => window.__mapleScene("rd_banos")); await page.waitForTimeout(1500);
  check(await ids().then(a => a.includes("amina")) && await page.locator('#world [data-rdspot="banos"]').count() === 1, "the Arab baths: Amina showing people round, under the star skylights");
  await page.evaluate(() => window.__mapleScene("rd_cuero")); await page.waitForTimeout(1500);
  check(await ids().then(a => a.includes("antonio")), "the leather workshop: Antonio stitching at his bench");
  await page.locator('#world [data-rdspot="cuero"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-rbuy="bolso"]', { timeout: 15000 });
  check(await page.locator("#ctx [data-rbuy]").count() === 5, "Ubrique leather to buy: a wallet, a handbag, a belt, a notebook and a keyring");
  await page.click("#ctx [data-close]"); await page.waitForTimeout(300);
  await page.evaluate(() => window.__mapleScene("rd_jardin")); await page.waitForTimeout(1500);
  check(await ids().then(a => a.includes("joaquin") && a.includes("gonggong")) && await page.locator('#world [data-rdspot="jardin"]').count() === 1, "the Moorish garden: Joaquín watering, and Gong Gong found a bench");
  await page.evaluate(() => window.__mapleScene("field")); await page.waitForTimeout(1500);
  check(await ids().then(a => a.includes("mei") && !a.includes("mama") && !a.includes("gonggong")), "back in Honeybrook, Ma Ma's not at the market: Mei's minding her stall");
  await page.evaluate(() => window.__mapleScene("rd_station")); await page.waitForTimeout(1000);
  await page.locator('#world [data-place="rdtrain"]').dispatchEvent("click"); await page.waitForSelector("#ctx [data-triphome]", { timeout: 15000 });
  await page.click("#ctx [data-triphome]");
  await page.waitForFunction(() => /Honeybrook station/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  check(await fox().then(f => f.trip.done), "the train home: back at Honeybrook station, the trip's over");
  await page.addInitScript(() => { if (!/benchpatch/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    f.ronda = Object.assign(f.ronda || {}, {bench: true}); const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?seed=1&time=10:50&date=2026-10-11&benchpatch=1"); await page.waitForTimeout(1200);
  await page.evaluate(() => window.__mapleScene("base")); await page.waitForTimeout(1000);
  check(await page.locator("#world .tilebench").count() === 1, "with all eight tiles, the tiled bench stands by the pond at home");
  await page.evaluate(() => window.__mapleScene("field")); await page.waitForTimeout(1500);
  check(await ids().then(a => a.includes("mama")), "and Ma Ma's back at her market stall");
  // the last train, and the window closing for the day
  await page.goto(url + "?seed=1&time=17:00&date=2026-10-12&tripcoins=1"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__mapleScene("hlane")); await page.waitForTimeout(900);
  await page.locator('#world [data-place="timetable"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-tickets]', { timeout: 15000 });
  await page.click('#ctx [data-tickets]'); await page.waitForSelector("#ctx [data-trip]", { timeout: 15000 }); await page.click("#ctx [data-trip]");
  await page.waitForFunction(() => /Ronda/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 }); await page.waitForTimeout(1500);
  await page.goto(url + "?seed=1&time=22:00&date=2026-10-12"); await page.waitForTimeout(1000);
  await page.waitForFunction(() => /Honeybrook station/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 }).catch(() => {});
  check(/Honeybrook station/.test(await scn()) && await fox().then(f => f.trip.done), "10pm: the last train home from Ronda");
  await page.goto(url + "?seed=1&time=18:30&date=2026-10-13"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__mapleScene("hlane")); await page.waitForTimeout(900);
  await page.locator('#world [data-place="timetable"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-tickets]', { timeout: 15000 });
  await page.click('#ctx [data-tickets]'); await page.waitForTimeout(400);
  check(await page.locator("#ctx [data-trip]").count() === 0 && /last train to Ronda gone/.test(await page.locator("#ctx").innerText()), "after 6pm there are no more trains out to Ronda");
  await page.close();
}
{
  console.log("\nJeju, by ferry and by train");
  const tw = await import(new URL("../src/data/towns.js", import.meta.url)), J = tw.TOWNS.jeju;
  check(J.screens.length === 4 && J.screens.every(sc => tw.townOf(sc) === "jeju" && sc.startsWith("jj_")) && J.arrive[0] === "jj_village" && J.arrive[0] !== J.screens[0] && J.ferry.arrive[0] === "jj_harbour",
    "Jeju: four screens; the station's in the village (bottom right, not top left like the others) and the ferry comes into the harbour");
  check(J.fare === 70 && J.ferry.fare === 50 && Object.keys(tw.TOWN_PLACES).filter(k => tw.TOWN_PLACES[k].scene && tw.TOWN_PLACES[k].scene.startsWith("jj_")).every(k => k.startsWith("jj")), "70 by train, 50 by ferry; every Jeju place starts with jj");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`jeju pageerror: ${e.message}`));
  const fox = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  const ids = () => page.locator("#actors .npc").evaluateAll(n => n.map(x => x.dataset.npc));
  await page.addInitScript(() => { if (!/jjcoins/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    f.coins = 300; const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=10:00&date=2026-11-12"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=10:00&date=2026-11-12&jjcoins=1"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__mapleScene("shore")); await page.waitForTimeout(900);
  await page.locator('#world [data-place="ferry"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-trip="jeju"][data-by="ferry"]', { timeout: 15000 });
  await page.click('#ctx [data-tpick="mama"]'); await page.click('#ctx [data-tpick="evan"]');
  check(/100/.test(await page.locator("#ctx [data-trip]").textContent()) && /ferry to Jeju/i.test(await page.locator("#ctx h2").textContent()), "the ferry stop at the end of the jetty: Mel and Ma Ma to Jeju, 100 coins (Evan sails free)");
  await page.click("#ctx [data-trip]");
  await page.waitForFunction(() => /Jeju/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 }); await page.waitForTimeout(2000);
  check(await fox().then(f => f.coins === 200 && f.trip.town === "jeju" && f.trip.by === "ferry") && /harbour/.test(await page.locator("#sceneName").textContent()) && await ids().then(a => a.includes("mama")), "off the ferry at Jeju's harbour, with Ma Ma and Evan");
  await page.locator('#world [data-place="jjpier"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-triphome="ferry"]', { timeout: 15000 });
  check(/ferry home/i.test(await page.locator("#ctx").innerText()), "the pier: a ferry home whenever you're ready");
  await page.click("#ctx [data-close]"); await page.waitForTimeout(300);
  for (const [gate, want, places] of [["jjToShoreN", "Seongsan", ["jjcone", "jjhaenyeo", "jjpools"]], ["jjToFarms", "tangerine farms", ["jjorchard", "jjshed", "jjponies", "jjcairns"]], ["jjToVillage", "stone village", ["jjtrain", "jjcafe", "jjdye", "jjstatues"]], ["jjToHarbourW", "harbour", ["jjpier", "jjmarket", "jjlights"]]]) {
    await page.locator(`#world [data-place="${gate}"]`).dispatchEvent("click");
    await page.waitForFunction(w => new RegExp(w).test(document.querySelector("#sceneName").textContent), want, { timeout: 25000 }); await page.waitForTimeout(1200);
    check(await page.evaluate(ps => ps.every(id => document.querySelector(`#world [data-place="${id}"]`)), places) && await ids().then(a => a.includes("mama")), `through the gate to Jeju's ${want} (Ma Ma follows)`);
  }
  await page.evaluate(() => window.__mapleScene("jj_village")); await page.waitForTimeout(1200);
  await page.locator('#world [data-place="jjtrain"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-triphome="train"]', { timeout: 15000 });
  await page.click('#ctx [data-triphome="train"]');
  await page.waitForFunction(() => !/Jeju/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 }); await page.waitForTimeout(1500);
  check(await fox().then(f => f.trip.done) && /station|lane/i.test(await page.locator("#sceneName").textContent()), "or home on the train over the sea bridge, whichever way you came");
  await page.evaluate(() => window.__mapleScene("hwoods")); await page.waitForTimeout(1000);
  await page.locator('#world [data-place="wishtower"]').dispatchEvent("click"); await page.waitForTimeout(2600);
  const w1 = await fox().then(f => f.wish && f.wish.n);
  await page.locator('#world [data-place="wishtower"]').dispatchEvent("click"); await page.waitForTimeout(800);
  check(w1 === 4 && await fox().then(f => f.wish.n === 4), "the wish-tower by the river in the woods: one stone a day, and it grows");
  await page.close();
}
{
  console.log("\nJeju's rooms, people and things to do");
  const tw = await import(new URL("../src/data/towns.js", import.meta.url)), J = tw.TOWNS.jeju;
  const jj = await import(new URL("../src/game/jeju.js", import.meta.url)), orch = await import(new URL("../src/data/orchard.js", import.meta.url));
  const kit = await import(new URL("../src/game/kitchen.js", import.meta.url)), sc = await import(new URL("../src/game/scoop.js", import.meta.url)), cp = await import(new URL("../src/game/companions.js", import.meta.url));
  check(Object.keys(J.rooms).length === 5 && Object.values(J.rooms).every(r => r.music && tw.TOWN_PLACES[r.door] && tw.TOWN_BOUNDS[Object.keys(J.rooms).find(k => J.rooms[k] === r)]), "five rooms behind Jeju's doors, each with its own music");
  { const used = new Set([...Object.values(tw.TOWNS.ronda.acts), ...Object.values(tw.TOWNS.kyoto.acts)].flatMap(a => Object.values(a).map(x => x.act)));
    check(Object.keys(J.acts).length === 7 && Object.values(J.acts).every(a => Object.values(a).every(x => !used.has(x.act))), "the family all have something to do in Jeju, and none of it is what they did in Ronda or Kyoto"); }
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
    check(!orch.treeOpen(F, orch.TREES.tangerine) && orch.treeOpen({jeju: {sapling: true}}, orch.TREES.tangerine) && orch.treeOpen(F, orch.TREES.apple), "tangerine trees grow in the orchard once Ma Ma's brought a sapling home from Jeju"); }
  check(["heukdwaeji", "jeonbok", "hallaomija"].every(k => kit.TAPAS[k]) && ["hallabong", "omija", "tangerine"].every(k => sc.INGR[k]), "Jeju's ingredients: three new dishes at the kitchen, and tangerine, hallabong and omija gelato");
  check(cp.KEEP_SPOTS.fridge2 && cp.KEEP_SPOTS.fridge2.only === "magnet" && tw.TOWN_GOODS.j_magnet.magnet && ["j_hareubang", "j_tewak", "j_shell", "j_scarf"].every(k => tw.TOWN_GOODS[k].kind === "keepsake"), "keepsakes from Jeju, and a second magnet spot on the fridge");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`jeju rooms pageerror: ${e.message}`));
  const fox = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  const ids = () => page.locator("#actors .npc").evaluateAll(n => n.map(x => x.dataset.npc));
  await page.addInitScript(() => { if (!/jjtrip/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    f.coins = 300; f.trip = {town: "jeju", day: "2026-11-12", party: ["mama", "evan"], from: 600, by: "ferry"};
    const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=13:00&date=2026-11-12"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=13:00&date=2026-11-12&jjtrip=1"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__mapleScene("jj_shore")); await page.waitForTimeout(1200);
  await page.locator('#world [data-place="jjhaenyeo"]').dispatchEvent("click");
  await page.waitForFunction(() => /divers/.test(document.querySelector("#sceneName").textContent), null, { timeout: 25000 }); await page.waitForTimeout(4800);
  check(await ids().then(a => a.includes("halmang") && a.includes("seoyeon")) && await fox().then(f => f.inv.j_shell === 1), "inside the divers' house: Halmang Kim and Seo-yeon, and Halmang gives Evan a sea snail shell");
  await page.locator('#world [data-rdspot="jj_haenyeo"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-jj="dive"]', { timeout: 15000 });
  await page.click('#ctx [data-jj="dive"]'); await page.waitForTimeout(300);
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => new Promise(res => { document.querySelector('#ctx [data-jj="down"]').click(); setTimeout(() => { const b = document.querySelector('#ctx [data-jj="up"]'); if (b) b.click(); res(); }, 2450); }));
    await page.waitForTimeout(300);
  }
  check(await fox().then(f => f.inv.abalone === 1 && f.jeju.dives === 1), "the breath song in the browser: dive, come up whistling, an abalone from Halmang");
  await page.click("#ctx [data-close]"); await page.waitForTimeout(300);
  for (const [room, who] of [["jj_shed", "takeshi"], ["jj_cafe", "haeun"], ["jj_market", "miok"], ["jj_dye", "jaewon"]]) {
    await page.evaluate(r => window.__mapleScene(r), room); await page.waitForTimeout(1300);
    check(await ids().then(a => a.includes(who)) && await page.locator(`#world [data-rdspot="${room}"]`).count() === 1, `${room}: ${who} is there, and there's something to do`);
  }
  await page.evaluate(() => window.__mapleScene("jj_shed")); await page.waitForTimeout(1200);
  await page.locator('#world [data-rdspot="jj_shed"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-jj="sort"]', { timeout: 15000 });
  await page.click('#ctx [data-jj="sort"]'); await page.waitForTimeout(300);
  for (let i = 0; i < 8; i++) { const size = await page.locator("#ctx .jjtang").getAttribute("data-size"); await page.click(`#ctx [data-jj="crate:${size}"]`); await page.waitForTimeout(120); }
  check(await fox().then(f => f.inv.tangerine === 4), "sorting with Mr Ko's crates: all eight right, four tangerines");
  await page.click("#ctx [data-close]"); await page.waitForTimeout(300);
  await page.evaluate(() => window.__mapleScene("jj_cafe")); await page.waitForTimeout(1200);
  await page.locator('#world [data-rdspot="jj_cafe"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-jj="cafe:ade"]', { timeout: 15000 });
  await page.click('#ctx [data-jj="cafe:ade"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.coins === 295 && f.jeju.treats === 1), "a hallabong ade at the café (5), and Evan gets a juice");
  await page.click("#ctx [data-close]"); await page.waitForTimeout(300);
  await page.evaluate(() => window.__mapleScene("jj_market")); await page.waitForTimeout(1200);
  await page.locator('#world [data-rdspot="jj_market"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-rbuy="j_magnet"]', { timeout: 15000 });
  await page.click('#ctx [data-rbuy="j_magnet"]'); await page.waitForTimeout(300); await page.click("#ctx [data-close]"); await page.waitForTimeout(300);
  await page.locator('#world [data-rdspot="jjpost"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-jj="post:me"]', { timeout: 15000 });
  await page.click('#ctx [data-jj="post:me"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.inv.j_magnet === 1 && f.coins === 290 && f.jeju.post.length === 1), "the market: a Jeju fridge magnet (3), and a postcard in the slow-post box (2)");
  await page.click("#ctx [data-close]"); await page.waitForTimeout(300);
  await page.evaluate(() => window.__mapleScene("jj_dye")); await page.waitForTimeout(1200);
  await page.locator('#world [data-rdspot="jj_dye"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-jj="dyego"]', { timeout: 15000 });
  await page.click('#ctx [data-jj="dyego"]'); for (const st of [0, 1, 2, 3]) await page.click(`#ctx [data-jj="dstep:${st}"]`);
  await page.click('#ctx [data-jj="dyedone"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.jeju.dye && f.jeju.dye.from === "2026-11-12" && f.coins === 278), "dyeing with Mr Moon: crush, soak, wring, sun (12), and the scarf comes home to dry");
  await page.click("#ctx [data-close]"); await page.waitForTimeout(300);
  await page.evaluate(() => window.__mapleScene("jj_harbour")); await page.waitForTimeout(1200);
  await page.locator('#world [data-place="jjpier"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-triphome="ferry"]', { timeout: 15000 });
  await page.click('#ctx [data-triphome="ferry"]');
  await page.waitForFunction(() => !/Jeju/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 }); await page.waitForTimeout(1500);
  check(await fox().then(f => f.trip.done && f.jeju.sapling) && /foreshore|shore/i.test(await page.locator("#sceneName").textContent()), "home on the ferry to the foreshore jetty, and Ma Ma's brought a tangerine sapling for the orchard");
  await page.goto(url + "?seed=1&time=10:00&date=2026-11-15"); await page.waitForTimeout(1200);
  await page.evaluate(() => window.__mapleScene("base")); await page.waitForTimeout(1200);
  await page.locator('#world [data-rdspot="dyecloth"]').dispatchEvent("click"); await page.waitForTimeout(3500);
  check(await fox().then(f => f.inv.j_scarf === 1 && !f.jeju.dye), "three days later, the scarf's a deep rust on the washing line at home, and it's a keepsake now");
  await page.close();
}
{
  console.log("\nthe kite and the farm brush (round 130 fixes)");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`kite pageerror: ${e.message}`));
  const fox = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  await page.addInitScript(() => { if (!/kitebrush/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    f.inv = {...(f.inv || {}), kite: 1, brush: 1}; const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=11:00&date=2026-10-10"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=11:00&date=2026-10-10&kitebrush=1"); await page.waitForTimeout(1000);
  await page.evaluate(() => window.__mapleScene("village")); await page.waitForTimeout(900);
  await page.click('[data-open="bag"]'); await page.click('#bag .item[data-id="kite"]'); await page.waitForTimeout(600);
  check(await fox().then(f => f.inv.kite === 1), "using the kite away from the field doesn't use it up (it stays in the backpack)");
  await page.evaluate(() => window.__mapleScene("hfarm")); await page.waitForTimeout(1200);
  await page.locator('#world [data-place="farmhouse"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-hf="req"]', { timeout: 20000 });
  check(/Still to brush: Daisy, Buttercup and Mochi/.test(await page.locator("#ctx").innerText()) && await page.locator('#ctx [data-hf="req"]').isDisabled(), "Felix's ask says what's still to do while the button's greyed out");
  await page.click("#ctx [data-close]"); await page.waitForTimeout(300);
  await page.locator('#world [data-place="cows"]').dispatchEvent("click"); await page.waitForTimeout(3500); await page.click("#ctx [data-close]").catch(() => {});
  for (let i = 0; i < 3; i++) { await page.click('[data-open="bag"]').catch(() => {}); await page.click('#bag .item[data-id="brush"]'); await page.waitForTimeout(500); }
  check(await fox().then(f => ["daisy", "buttercup", "mochi"].every(k => f.hfarm.brushed[k] === "2026-10-10") && f.inv.brush === 1), "the brush from the backpack brushes the cows at the farm, and it's still in the backpack");
  await page.locator('#world [data-place="farmhouse"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-hf="req"]:not([disabled])', { timeout: 20000 });
  await page.click('#ctx [data-hf="req"]'); await page.waitForTimeout(500);
  check(await fox().then(f => f.hfarm.reqDone === "2026-10-10"), "and then you can tell Felix it's done");
  await page.close();
}
{
  console.log("\nPilar's list, keeping things back, and more tapas");
  const k = await import(new URL("../src/game/kitchen.js", import.meta.url)), day = "2026-10-14", F = {coins: 0, inv: {}};
  const kk = k.kitchenState(F); Object.assign(kk.larder, {tulip: 2, flour: 3, potato: 4, egg: 4, tomato: 4, loaf: 2});
  k.setKeep(F, "tulip", 2);
  k.cookTick(F, day);
  check(kk.larder.tulip === 2 && !(F.vine.menu || {}).shortbread, "flowers kept back for petal syrup: Pilar doesn't make flower shortbread with them");
  kk.pilarNo.bread = true; kk.pilarNo.tapas = true; F.vine.tapasList = []; kk.larder.flour = 1; kk.oven = null;
  k.cookTick(F, day);
  check(!kk.oven && !k.tapasAll(F, day).length, "untick bread and tapas on Pilar's list: she leaves the oven and the chalkboard to Mel");
  ["tortilla", "huevos", "patatas", "puerros"].forEach(id => k.chooseTapas(F, id, day));
  check(k.tapasAll(F, day).map(t => t.id).join() === "tortilla,huevos,patatas", "up to three tapas of the day on the chalkboard");
  check(!!k.dropTapas(F, "patatas", day) && k.tapasAll(F, day).length === 2, "and one can come off again before it's cooked");
  k.planTapas(F, "puerros", "2026-10-15"); k.planTapas(F, "tortilla", "2026-10-15");
  check(k.tapasAll(F, "2026-10-15").map(t => t.id).join() === "puerros,tortilla", "tomorrow's planned tapas are on the chalkboard first thing the next day");
  { const G = {inv: {honey: 1}}; const gk = k.kitchenState(G); Object.assign(gk.larder, {egg: 2, flour: 2}); gk.pilarNo.bread = true; k.sendToKitchen(G, "honey");
    k.cookTick(G, day); const held = !(G.vine.menu || {}).honeycake && gk.larder.honey === 1;
    gk.fresh.honey.until = Date.now() - 1; k.cookTick(G, day);
    check(held && G.vine.menu.honeycake === 4, "honey just brought in waits 15 minutes before Pilar can bake it into honey cake (time to set keep)"); }
}
{
  console.log("\nthe greenhouse, herbs and gambas");
  { const g = await import(new URL("../src/game/greenhouse.js", import.meta.url)), it = await import(new URL("../src/data/items.js", import.meta.url)), k = await import(new URL("../src/game/kitchen.js", import.meta.url)), fi = await import(new URL("../src/game/fishing.js", import.meta.url));
    const F = {inv: {basil_seed: 1, gh_strawberry_seed: 1}}, add = (id, n) => { F.inv[id] = (F.inv[id] || 0) + n; if (F.inv[id] <= 0) delete F.inv[id]; };
    check(!!g.ghPlant(F, 0, "basil_seed", add) && !!g.ghPlant(F, 1, "gh_strawberry_seed", add) && !F.inv.basil_seed, "basil and out-of-season strawberries planted in the greenhouse beds");
    F.gh.beds[0].plantedAt -= 5*3600e3; const r = g.ghHarvest(F, 0, add);
    check(r && F.inv.basil === 3 && !g.ghHarvest(F, 1, add), "the basil's ready in four hours (three bunches); the strawberries take longer");
    check(["garlic", "basil", "mint", "rosemary", "chives", "thyme"].every(h => it.CROPS[h] && it.ITEMS[h + "_seed"] && it.ITEMS[h + "_seed"].greenhouse) && it.ITEMS.gh_leek_seed && it.ITEMS.gh_leek_seed.greenhouse, "six herbs to grow, and greenhouse packets of seasonal seeds like leeks");
    { const G = {coins: 0, inv: {fish: 2, sardine: 3, shrimp: 1, apple: 2}}; const one = fi.sellCatch(G, "sardine"), all = fi.sellCatch(G);
    check(one && one.coins === 2 && all && all.n === 5 && G.coins === 2 + 6 + 4 + 2 && G.inv.apple === 2 && !G.inv.fish, "selling the catch: one sardine, then the lot (everyday fish too), and nothing that isn't fish"); }
  check(fi.FISH.shrimp && fi.FISH.shrimp.spot === "sea" && k.TAPAS.gambas && k.TAPAS.gambas.need.shrimp === 3 && k.TAPAS.gambas.need.garlic === 2 && k.TAPAS.gambas.need.oliveoil === 1, "shrimp from the sea, and gambas al ajillo: shrimp, garlic and olive oil"); }
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`greenhouse pageerror: ${e.message}`));
  await page.addInitScript(() => { if (!/ghcoins/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    f.coins = 500; f.inv = Object.assign(f.inv || {}, {garlic_seed: 1}); const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=10:30&date=2026-10-14"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=10:30&date=2026-10-14&ghcoins=1"); await page.waitForTimeout(1000);
  await page.evaluate(() => window.__mapleScene("farm")); await page.waitForTimeout(900);
  await page.locator('#world [data-gh="door"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-goal="greenhouse"]', { timeout: 15000 });
  await page.click('#ctx [data-goal="greenhouse"]'); await page.waitForTimeout(800);
  await page.locator('#world [data-gh="door"]').dispatchEvent("click");
  await page.waitForFunction(() => /greenhouse/i.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  await page.locator('#world [data-ghbed="0"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-gh="plant"][data-id="garlic_seed"]', { timeout: 15000 });
  await page.click('#ctx [data-gh="plant"][data-id="garlic_seed"]'); await page.waitForTimeout(400);
  check(await page.evaluate(() => { const f = JSON.parse(localStorage.getItem("fox.fox")); return f.gh && f.gh.beds[0] && f.gh.beds[0].crop === "garlic"; }), "through the glass door: garlic planted in the first bed");
  check(await page.evaluate(() => { const f = JSON.parse(localStorage.getItem("fox.fox")); return f.coins <= 100 && f.goals && f.goals.greenhouse; }), "the greenhouse cost 400 coins");
  await page.close();
}
{
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
  check(!!v.pickGrove(F) && F.inv.olives === 8 && !v.pickGrove(F), "picking the grove: eight jars of olives, then it needs eight hours");
  vs.oliveCrate = 6;
  check(!!v.takeOliveCrate(F) && F.inv.olives === 14 && !vs.oliveCrate, "taking the olive crate the vineyard hands filled");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`mill pageerror: ${e.message}`));
  await page.addInitScript(() => { if (!/millp/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    f.coins = 800; f.inv = Object.assign(f.inv || {}, {olives: 7}); const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=11:00&date=2026-10-14"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=11:00&date=2026-10-14&millp=1"); await page.waitForTimeout(1000);
  await page.evaluate(() => window.__mapleScene("hlane")); await page.waitForTimeout(900);
  await page.locator('#world [data-place="windmill"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-goal="mill"]', { timeout: 20000 });
  await page.click('#ctx [data-goal="mill"]'); await page.waitForTimeout(600); await page.click("#ctx [data-close]").catch(() => {});
  await page.locator('#world [data-place="windmill"]').dispatchEvent("click");
  await page.waitForFunction(() => /old mill/i.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  check(true, "the windmill opens up as the old mill (350 coins), and you can go inside");
  await page.locator('#world [data-millspot="press"]').first().dispatchEvent("click"); await page.waitForSelector('#ctx [data-mill="press"][data-n="2"]', { timeout: 15000 });
  await page.click('#ctx [data-mill="press"][data-n="2"]'); await page.waitForTimeout(800);
  check(await page.evaluate(() => { const f = JSON.parse(localStorage.getItem("fox.fox")); return f.mill && f.mill.press && f.mill.press.n === 2 && f.inv.olives === 1 && f.goals.mill; }), "seven jars of olives: two bottles' worth goes under the millstone");
  await page.close();
}
{
  console.log("\nFriday evenings: aperitivo, the bonfire, Sal's van, kites");
  const t = await import(new URL("../src/game/tours.js", import.meta.url)), fr = await import(new URL("../src/game/friday.js", import.meta.url));
  const fri = "2026-10-16", thu = "2026-10-15";
  { const fi = await import(new URL("../src/game/fishing.js", import.meta.url)), w = await import(new URL("../src/data/world.js", import.meta.url));
    check(fi.fishHere("bay", fri, 18*60).includes("mullet") && fi.fishHere("bay", fri, 18*60).includes("sardine") && !fi.fishHere("bay", thu, 18*60).length && !fi.fishHere("bay", fri, 20*60 + 30).length, "sunset fishing at the bay: Fridays 5 to 8, red mullet and sardines");
    const F = {coins: 20, inv: {mullet: 1}}, add = (id, n) => { F.inv[id] = (F.inv[id] || 0) + n; };
    check(!!fr.vanBuy(F, "sardine", add) && F.inv.sardine === 3 && F.coins === 11, "Sal sells three sardines for the grill");
    check(fr.grillFish(F, fri) === 4 && !F.inv.sardine && !F.inv.mullet && fr.grillFish(F, fri) === null, "the fish go on the bonfire, once a Friday");
    check(w.nextHop("field", "hfarm") === "hfarm" && w.nextHop("hfarm", "field") === "field", "a path joins the lake field and Wildflower Farm"); }
  check(t.aperitivoNow(fri, 17*60) && !t.aperitivoNow(fri, 19*60 + 5) && !t.aperitivoNow(thu, 17*60), "aperitivo hour: Fridays, 4:30 to 7");
  check(t.tastingSlot("theo", fri, 17*60 + 30) && t.tastingSlot("opal", fri, 17*60), "the tasting room fills up on a Friday afternoon");
  check(t.bonfireSlot("dad", fri, 19*60 + 30).act === "guitar" && t.bonfireSlot("mum", fri, 20*60).scene === "base" && !t.bonfireSlot("dad", thu, 19*60 + 30) && !t.bonfireSlot("marcus", fri, 19*60 + 10), "the bonfire, 7 to 10 on a Friday: Dad on guitar, Mum on a log, Marcus and Angellina from half seven");
  { const F = {coins: 20, inv: {}, history: {"2026-10-12": {q: 2}, "2026-10-14": {q: 3}, "2026-10-08": {q: 9}}}, add = (id, n) => { F.inv[id] = (F.inv[id] || 0) + n; };
    check(fr.weekQuests(F, fri) === 5 && fr.releaseLanterns(F, fri) === 5 && fr.releaseLanterns(F, fri) === null, "five quests this week: five lanterns, released once a Friday");
    check(!!fr.vanBuy(F, "clams", add) && !!fr.vanBuy(F, "worms", add) && F.inv.clams === 1 && F.coins === 10 && F.fish.bait >= 5, "Sal's van sells clams and worms"); }
  check(t.lastFriday("2026-10-30") && !t.lastFriday(fri) && t.movieNow("2026-10-30", 20*60) && t.movieSlot("dad", "2026-10-30", 20*60).scene === "field" && !t.movieSlot("dad", fri, 20*60) && ["mum", "dad", "mama", "gonggong", "marcus", "angelina", "darren"].filter(id => (t.movieSlot(id, "2026-10-30", 20*60) || {}).at && Math.hypot(t.movieSlot(id, "2026-10-30", 20*60).at[0] - t.SCREEN[0], t.movieSlot(id, "2026-10-30", 20*60).at[1] - t.SCREEN[1]) < 120).length <= 2, "movie night: the last Friday of the month, the family on blankets on the field");
  check(t.bayMarketNow(fri, 17*60) && t.bayKeepers(fri).length === 3 && t.bayMarketSlot(t.bayKeepers(fri)[0], fri, 17*60).scene === "field" && t.bayMarketSlot("hiro", fri, 17*60).scene === "field", "the Friday market on the field: three stalls, and Hiro selling kites");
  check(!t.bayMarketNow(fri, 19*60 + 20) && t.MOVIE[0] - t.BAYMKT[1] >= 15, "the market packs up a quarter of an hour before the film starts");
  check(fr.bayStallGoods(fri, 0).length === 4 && fr.bayStallGoods(fri, 0).join() !== fr.bayStallGoods(fri, 1).join() && fr.bayStallGoods(fri, 0).join() !== fr.bayStallGoods("2026-10-23", 0).join(), "each stall has four things, a different mix every week");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`friday pageerror: ${e.message}`));
  await page.addInitScript(() => { if (!/kitep/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    f.inv = Object.assign(f.inv || {}, {kite: 1}); const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=15:30&date=2026-10-16"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=15:30&date=2026-10-16&kitep=1"); await page.waitForTimeout(1000);
  await page.evaluate(() => window.__mapleScene("field")); await page.waitForTimeout(900);
  await page.locator('#world [data-place="kitefly"]').dispatchEvent("click"); await page.waitForSelector("#world .kitefly", { timeout: 20000 }).catch(() => {});
  check(await page.locator("#world .kitefly").count() === 1, "a kite of your own, flying over the field");
  await page.goto(url + "?seed=1&time=19:40&date=2026-10-16"); await page.waitForTimeout(1000);
  await page.evaluate(() => window.__mapleScene("bay")); await page.waitForTimeout(1500);
  check(await page.locator('#world [data-place="fishvan"]').count() === 1 && await page.locator('#world [data-place="bonfire"]').count() === 0, "Friday night at the bay: Sal's van (and no bonfire on the beach)");
  await page.evaluate(() => window.__mapleScene("base")); await page.waitForTimeout(1500);
  check(await page.locator('#actors .npc[data-npc="dad"].act-guitar').count() === 1, "and at home, Dad playing guitar by the bonfire");
  await page.locator('#world [data-place="bonfire"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-fire="lanterns"]', { timeout: 20000 });
  await page.click('#ctx [data-fire="lanterns"]'); await page.waitForTimeout(600);
  check(await page.locator("#fxLayer g").count() >= 1, "the week's lanterns lift off over the sea");
  await page.goto(url + "?seed=1&time=17:30&date=2026-10-16"); await page.waitForTimeout(1000);
  await page.evaluate(() => window.__mapleScene("field")); await page.waitForTimeout(1200);
  check(await page.locator('#world [data-place^="bm"]').count() === 3 && await page.locator('#world [data-place="kites"]').count() === 1, "half past five on a Friday: the little market's up on the field");
  await page.evaluate(() => window.__mapleScene("bay")); await page.waitForTimeout(1000);
  check(await page.locator('#world [data-place^="bm"]').count() === 0, "and the bay stays quiet");
  await page.goto(url + "?seed=1&time=20:00&date=2026-10-30"); await page.waitForTimeout(1000);
  await page.evaluate(() => window.__mapleScene("field")); await page.waitForTimeout(1500);
  check(await page.locator('#world [data-place="screen"]').count() === 1 && await page.locator('#actors .npc[data-npc="mum"]').count() === 1, "the last Friday: movie night on the field, Mum on a blanket");
  await page.close();
}
await browser.close();
if (errors.length) { console.log("\n" + errors.join("\n")); process.exit(1); }
console.log("\nall good");
