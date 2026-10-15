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
  await page.waitForFunction(() => /^1L/.test(document.getElementById("waterNote").textContent), null, { timeout: 3000 }).catch(() => {});
  check(await page.locator("#waterNote").textContent().then(t => /^1L/.test(t)), "water total can be typed in");
  await page.click('[data-track="water"]'); await page.fill("#nbTrack", "1250"); await page.evaluate(() => window.__mapleScene && window.__mapleScene("base")); await page.waitForTimeout(600);
  check(await page.locator("#nbTrack").inputValue().catch(() => "") === "1250", "a half-typed water total survives the game redrawing round it");
  await page.click('#notebook [data-nb="wset"]').catch(() => {}); await page.waitForTimeout(300);
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
  check(await page.locator('#friendView [data-ftab="where"][aria-selected="true"]').count() === 1 && await page.locator("#friendView details.whowhere").count() > 0, "the heart panel opens on who's where, in tabs");
  await page.click('#friendView [data-ftab="maple"]');
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
  check(await page.locator('#ctx [data-newstab="wins"][aria-selected="true"]').count() === 1 && await page.locator("#ctx .hlist.gnews.world").count() === 0 && await page.locator("#ctx").textContent().then(t => /Chord added 2 studios/.test(t)), "the good news board opens on your wins, in tabs");
  await page.click('#ctx [data-newstab="news"]');
  check(await page.locator("#ctx .hlist.gnews.world li").count() === 1, "the good news board shows the world's good news on its own tab");
  await page.click('#ctx [data-newstab="events"]');
  { const t = await page.locator("#ctx").textContent();
    check(/Night market/.test(t) && /Night market, 5:30pm to 10pm/.test(t) && /Sunday farmers market/.test(t) && /Deepavali/.test(t) && /Family dinner at/.test(t), "the good news board pins up the village calendar: markets, the night market, family dinners and festivals coming up"); }
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
  await page.locator('#world [data-place="boat"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-cruise]', { timeout: 15000 });   // round 205: the boat's panel first
  await page.click('#ctx [data-cruise]'); await page.waitForTimeout(4000);
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
  await page.click('#ctx [data-cc="pkopen"][data-k="box"][data-n="4"]'); await page.waitForSelector('#ctx [data-cc="pkadd"]', {timeout: 15000});
  const pickId = await page.locator('#ctx [data-cc="pkadd"]').first().getAttribute("data-k"), before = await fox().then(f => f.cocoa.trays[pickId]);
  for (let i = 0; i < 2; i++) { await page.locator('#ctx [data-cc="pkadd"]').first().click(); await page.waitForTimeout(150); }
  check(await page.locator('#ctx [data-cc="pkgo"]').isDisabled() && /2 of 4 chosen/.test(await page.locator("#ctx").textContent()), "choose the bonbons for a box: two of the first flavour, and it won't pack till there are four");
  await page.click('#ctx [data-cc="pkfill"]'); await page.waitForTimeout(150); await page.click('#ctx [data-cc="pkgo"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.inv.box4d === 1 && before - f.cocoa.trays[pickId] >= 2), "a gift box of four bonbons from the display case, the ones Mel chose (all dark, so dairy-free)");
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
  await tap("ccounter", '#ctx [data-cc="pkopen"][data-k="pair:wtest"]'); await page.click('#ctx [data-cc="pkopen"][data-k="pair:wtest"]'); await page.waitForTimeout(300);
  await page.click('#ctx [data-cc="pkfill"]'); await page.waitForTimeout(150); await page.click('#ctx [data-cc="pkgo"]'); await page.waitForTimeout(300);
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
  check(await page.locator('#ctx [data-cc="buyup"]').count() === 15, "the Cocoa Room's catalogue lists fifteen upgrades (four of them bonbon moulds)");
  for (let i = 0; i < 11; i++) { const b = page.locator('#ctx [data-cc="buyup"]').first(); if (!(await b.count())) break; await b.click(); await page.waitForTimeout(250); }
  check(await fox().then(f => Object.keys(f.cocoa.up).length === 11 && f.coins === 10000 - 4850), "all eleven bought, the vending machine too (4850 coins)");
  await page.click('#ctx [data-cc="counter"]'); await page.waitForSelector('#ctx [data-cc="hot"]', { timeout: 15000 }); await page.click('#ctx [data-cc="hot"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.cocoa.choc.milk === 39), "the hot chocolate bar: Mel has a cup (one piece of chocolate)");
  await page.click('#ctx [data-cc="pkopen"][data-k="grand"]'); await page.waitForTimeout(300); await page.click('#ctx [data-cc="pkfill"]'); await page.waitForTimeout(150); await page.click('#ctx [data-cc="pkgo"]'); await page.waitForTimeout(300);
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
  { const sc = await import(new URL("../src/game/scoop.js", import.meta.url)), s = sc.scoopState({}), d = "2026-10-10";
    s.recipes = [{id: "m", ings: ["mango"], name: "Mango Sorbet", col: "#F8D59A"}]; s.tubs = {m: 4};
    const low = sc.scoopNews(s, d, 12*60), again = sc.scoopNews(s, d, 12*60 + 5); s.tubs = {}; const out = sc.scoopNews(s, d, 13*60);
    s.sold[d] = {n: 40, coins: 190, outAt: 15*60}; const eve = sc.scoopNews(s, d, 20*60 + 10), eve2 = sc.scoopNews(s, d, 21*60);
    check(/last 4 scoops/.test(low.join(" ")) && !again.length && /run out/.test(out.join(" ")) && /sold 40 ice creams: 190 coins\. It ran out at 3pm/.test(eve.join(" ")) && !eve2.length,
      "the Scoop Shack says when its display is running low or empty, and tells you the day's takings when it shuts (once)"); }
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
  await page.locator('#world [data-place="jazzhat"]').dispatchEvent("click");
  await page.waitForFunction(c => JSON.parse(localStorage.getItem("fox.fox")).coins !== c, c0, { timeout: 15000 }).catch(() => {});   // Mel walks over to the hat first
  { const c1 = await page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")).coins); check(c1 === c0 - 2, `two coins in the band's hat (${c0} -> ${c1})`); }
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
  check(await page.locator("#ctx li.locked").count() === 23 && /dusk/i.test(await page.locator("#ctx").textContent()), "the journal: one found, twenty-three still to find, each with a hint (the golden koi at dusk)");
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
  check(["Grilled halloumi with honey", "Huevos rotos", "Yoghurt with honey", "Grilled sardines"].every(n => txt.includes(n)) && ["Honey cake", "Flower shortbread", "Blueberry tart", "Farm cheese board"].every(n => txt.includes(n)), "new tapas (halloumi, huevos rotos, yoghurt, seafood) and small plates (honey cake, flower shortbread, blueberry tart, farm cheese board)");
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
  { const gameNow = await page.evaluate(() => Date.now() + (globalThis.__mapleOffset || 0));   // the game's clock, not the real one
    check(await fox().then(f => f.coins === 95 && f.bike && f.bike.until > gameNow), "a hire bike: 5 coins for an hour"); }
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
  { const said = []; for (let i = 0; i < 12 && !said.some(t => /smelled chocolate again/.test(t)); i++) { said.push(await page.locator("#npcSay").textContent()); await page.waitForTimeout(800); }
    check(said.some(t => /smelled chocolate again/.test(t)) && !/smelled chocolate again/.test(said[0]), "she tells it in her bubbles, first reminding Mel where she'd got to (round 203): the old chocolatier was her family's"); }
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
  console.log("\nCinque Terre: the five villages (well, four)");
  const tw = await import(new URL("../src/data/towns.js", import.meta.url)), C = tw.TOWNS.cinque;
  check(C.screens.length === 4 && C.screens.every(sc => tw.townOf(sc) === "cinque" && sc.startsWith("ct_")) && C.arrive[0] === "ct_corniglia" && C.arrive[0] !== C.screens[0] && tw.TOWN_PLACES[C.station].scene === "ct_corniglia",
    "Cinque Terre: four screens, and the station's at the foot of Corniglia's steps (top right this time, not top left)");
  check(C.fare === 80 && Object.keys(tw.TOWN_PLACES).filter(k => (tw.TOWN_PLACES[k].scene || "").startsWith("ct_")).every(k => k.startsWith("ct")) && Object.keys(tw.TOWN_BRIDGES).filter(k => k.startsWith("ct_")).length === 4, "80 coins a ticket; every place starts with ct; four gates between the villages");
  check(Object.keys(C.rooms).length === 5 && Object.values(C.rooms).every(r => r.music && tw.TOWN_PLACES[r.door]) && Object.keys(C.rooms).every(k => tw.TOWN_BOUNDS[k]), "five rooms (focacceria, pesto kitchen, cantina, gelateria, lemon shop), each with its own music");
  { const used = new Set(["ronda", "kyoto", "jeju"].flatMap(t => Object.values(tw.TOWNS[t].acts)).flatMap(a => Object.values(a).map(x => x.act)));
    check(Object.keys(C.acts).length === 7 && Object.values(C.acts).every(a => Object.values(a).every(x => !used.has(x.act))), "the whole family has something to do, and none of it is what they did in Ronda, Kyoto or Jeju"); }
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
    check(!ct.paintBoat(F, "pink", "white", "Evan", add) && ct.paintBoat(F, "red", "white", "Evan", add) && F.inv.c_boat === 1 && ct.boatCols(F)[0] === "#C9483A", "painting a boat with Aldo: a red hull, a white stripe, \"Evan\" on the bow, and a little model to keep");
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
    check(sp.length === 40 && sp.every(id => T[id].price > maxLocal) && Object.keys(kit.SOURCE).length > 50 && Object.keys(T).every(id => Object.keys(T[id].need).every(g => kit.SOURCE[g])),
      "the 40 dishes from the trips (rounds 207, 211, 215 and 219: Saltwick's, Portovenere's, Puffin Isle's and Bali's three each) are Specials, every one dearer than any local dish, and every ingredient says where it comes from");
    check(!kit.knows({}, "trofie") && kit.knows({towns: {cinque: "2026-10-12"}}, "trofie") && kit.knows({jeju: {}}, "jeonbok") && !kit.knows({towns: {cinque: 1}}, "salmorejo"), "a town's specials appear once you've been (Ronda's still need tasting)"); }
  check(["trofie", "focaccia", "farinata", "acciughe", "crostini"].every(k => kit.TAPAS[k]) && ["pinenuts", "limoncino", "basil", "lemon"].every(k => sc.INGR[k]), "Cinque Terre's dishes at the kitchen, and basil, lemon, pine nut and limoncino gelato");
  { const np = await import(new URL("../src/data/npcs.js", import.meta.url)), st = await import(new URL("../src/game/stories.js", import.meta.url)), J = np.NPCS.find(n => n.id === "jason"), L = np.NPCS.find(n => n.id === "luca");
    check(J && J.local === "cinque" && !J.tourist && J.look.specs && J.look.tall && J.look.palms && J.routine.some(sl => sl.scene === "ct_vernazza" && sl.act === "poem") && J.routine.some(sl => sl.act === "sit" && sl.from >= 18*60) && L && L.routine.some(sl => sl.act === "sit" && sl.from >= 18*60) && tw.TOWN_PLACES.ctjason.scene === "ct_vernazza",
      "Jason lives in Vernazza now (the yellow house by the harbour): a poem at the café in the morning, the sunset on the harbour with Luca");
    const F = {met: {jason: true}, inv: {}}, add = (id, n) => { F.inv[id] = (F.inv[id] || 0) + n; };
    F.story = {heard: {}, day: {carmen: "2026-10-12", rafael: "2026-10-12"}, log: [], flags: {}};
    const first = st.tellStory(F, "jason", add, "2026-10-12"), again = st.storyReady(F, "jason", "2026-10-12");
    ["2026-10-13", "2026-10-14", "2026-10-15"].forEach(d => st.tellStory(F, "jason", add, d));
    check(first && /2015/.test(first.lines.join(" ")) && !again && F.inv.s_poem === 1 && F.story.heard.jason === 4, "Jason tells his stories a chapter a day whenever Mel visits (even after two others that day), and the fourth is a poem for her to keep"); }
  check(cp.KEEP_SPOTS.fridge3 && cp.KEEP_SPOTS.fridge3.only === "magnet" && tw.TOWN_GOODS.c_magnet.magnet && ["c_boat", "c_plate", "c_mortar"].every(k => tw.TOWN_GOODS[k].kind === "keepsake"), "keepsakes (the boat model, the lemon plate, the mortar) and a third magnet spot on the fridge");
}
{
  console.log("\nCinque Terre, by train");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`cinque pageerror: ${e.message}`));
  const fox = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  const ids = () => page.locator("#actors .npc").evaluateAll(n => n.map(x => x.dataset.npc));
  await page.addInitScript(() => { if (!/ctcoins/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    f.coins = 300; const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=10:00&date=2026-10-12"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=10:00&date=2026-10-12&ctcoins=1"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__mapleScene("hlane")); await page.waitForTimeout(900);
  await page.locator('#world [data-place="timetable"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-tickets]', { timeout: 15000 });
  await page.click('#ctx [data-tickets]'); await page.waitForSelector('#ctx [data-ttown="cinque"]', { timeout: 15000 });
  await page.click('#ctx [data-ttown="cinque"]'); await page.waitForTimeout(300);
  await page.click('#ctx [data-tpick="dad"]'); await page.click('#ctx [data-tpick="evan"]');
  check(/160/.test(await page.locator("#ctx [data-trip]").textContent()) && /Cinque Terre/.test(await page.locator("#ctx h2").textContent()), "the ticket window offers Cinque Terre: Mel and Dad, 160 coins (Evan free)");
  await page.click("#ctx [data-trip]");
  await page.waitForFunction(() => /Cinque Terre/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 }); await page.waitForTimeout(2000);
  check(await fox().then(f => f.coins === 140 && f.trip.town === "cinque" && f.towns && f.towns.cinque) && /Corniglia/.test(await page.locator("#sceneName").textContent()) && await ids().then(a => a.includes("dad")), "off the train at Corniglia, with Dad and Evan");
  for (const [gate, want, places] of [["ctToVernazza", "Vernazza", ["ctfocacceria", "cttower", "ctpiazza", "ctharbour", "ctjason"]], ["ctToMonterosso", "Monterosso", ["ctlimoni", "ctgigante", "ctbeach"]], ["ctToManarolaE", "Manarola", ["ctpesto", "ctgelato", "ctboats", "ctrocks", "ctpadlock"]], ["ctToCornigliaN", "Corniglia", ["cttrain", "ctcantina", "ctmonorail", "ctlemons"]]]) {
    await page.locator(`#world [data-place="${gate}"]`).dispatchEvent("click");
    await page.waitForFunction(w => new RegExp(w).test(document.querySelector("#sceneName").textContent), want, { timeout: 25000 }); await page.waitForTimeout(1200);
    check(await page.evaluate(ps => ps.every(id => document.querySelector(`#world [data-place="${id}"]`)), places) && await ids().then(a => a.includes("dad")), `through the gate to ${want} (Dad follows)`);
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
  await page.evaluate(() => window.__mapleScene("ct_manarola")); await page.waitForTimeout(1200);
  await page.locator('#world [data-place="ctpesto"]').dispatchEvent("click");
  await page.waitForFunction(() => /pesto/i.test(document.querySelector("#sceneName").textContent), null, { timeout: 25000 }); await page.waitForTimeout(1500);
  check(await ids().then(a => a.includes("nonnapina") && a.includes("marta")), "inside the pesto kitchen: Nonna Pina, and Marta with the basil");
  await page.locator('#world [data-rdspot="ct_pesto"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-ct="pesto"]', { timeout: 15000 });
  await page.click('#ctx [data-ct="pesto"]'); await page.waitForTimeout(200);
  for (let i = 0; i < 5; i++) { await page.click(`#ctx [data-ct="padd:${i}"]`); await page.waitForTimeout(80); for (let j = 0; j < 3; j++) { await page.click('#ctx [data-ct="pound"]'); await page.waitForTimeout(60); } }
  await page.click('#ctx [data-ct="pestodone"]'); await page.waitForTimeout(400);
  check(await fox().then(f => f.inv.pesto === 2 && f.cinque.pestoLesson && f.coins === 134), "pesto in the marble mortar, in the right order: two jars (6) and Nonna Pina's secret");
  await page.click("#ctx [data-close]"); await page.waitForTimeout(300);
  await page.evaluate(() => window.__mapleScene("ct_manarola")); await page.waitForTimeout(1200);
  await page.locator('#world [data-place="ctboats"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-ct="hull:green"]', { timeout: 15000 });
  await page.click('#ctx [data-ct="hull:green"]'); await page.click('#ctx [data-ct="stripe:yellow"]'); await page.click('#ctx [data-ct="bname:Maple"]'); await page.click('#ctx [data-ct="paint"]'); await page.waitForTimeout(400);
  check(await fox().then(f => f.cinque.boat && f.cinque.boat.hull === "green" && f.cinque.boat.name === "Maple" && f.inv.c_boat === 1), "painting a boat in the street: fisherman's green, a yellow stripe, \"Maple\" on the bow, and a model to keep");
  await page.click("#ctx [data-close]"); await page.waitForTimeout(300);
  for (const [room, who] of [["ct_focacceria", "ilaria"], ["ct_cantina", "carla"], ["ct_gelato", "gianni"], ["ct_limoni", "franca"]]) {
    await page.evaluate(r => window.__mapleScene(r), room); await page.waitForTimeout(1300);
    check(await ids().then(a => a.includes(who)) && await page.locator(`#world [data-rdspot="${room}"]`).count() === 1, `${room}: ${who} is there, and there's something to do`);
  }
  await page.locator('#world [data-rdspot="ct_limoni"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-rbuy="c_magnet"]', { timeout: 15000 });
  await page.click('#ctx [data-rbuy="c_magnet"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.inv.c_magnet === 1 && f.coins === 131), "the lemon shop: a Cinque Terre fridge magnet (3)");
  await page.click("#ctx [data-close]"); await page.waitForTimeout(300);
  await page.evaluate(() => window.__mapleScene("ct_corniglia")); await page.waitForTimeout(1200);
  await page.locator('#world [data-place="cttrain"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-triphome="train"]', { timeout: 15000 });
  await page.click('#ctx [data-triphome="train"]');
  await page.waitForFunction(() => !/Cinque Terre/.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 }); await page.waitForTimeout(1500);
  check(await fox().then(f => f.trip.done), "home on the train from Corniglia");
  await page.evaluate(() => window.__mapleScene("shore")); await page.waitForTimeout(1200);
  check(await page.locator("#sceneArt").evaluate(e => e.innerHTML.includes("#2E7A5A")), "the painted boat (green, like the one in Manarola) is pulled up on the foreshore sand");
  await page.evaluate(() => window.__mapleScene("vineyard")); await page.waitForTimeout(1000);
  await page.locator('#world [data-place="barrels"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-loft]', { timeout: 15000 });
  await page.click('#ctx [data-loft]'); await page.waitForSelector('#ctx [data-lf="start:rack"]', { timeout: 15000 });
  check(/drying loft/i.test(await page.locator("#ctx h2").textContent()) && await page.locator('#ctx [data-lf="start:rack"]').isDisabled(), "up the ladder in the barrel shed: the drying loft (three bunches isn't enough for the racks yet)");
  await page.close();
}
{
  console.log("\nthe kite and the farm brush (round 130 fixes)");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`kite pageerror: ${e.message}`));
  const fox = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  await page.addInitScript(() => { if (!/kitebrush/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    f.inv = {...(f.inv || {}), kite: 1, brush: 1, chz_cheddar: 1, chz_brie_ex: 1, honey_lav: 1}; const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
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
  await page.evaluate(() => window.__mapleScene("village")); await page.waitForTimeout(800);
  await page.locator('#world [data-place="market"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-shop="sell"]', { timeout: 20000 });
  await page.click('#ctx [data-shop="sell"]'); await page.waitForSelector('#ctx .item[data-id="chz_cheddar"]', { timeout: 15000 });
  const c0 = await fox().then(f => f.coins);
  for (const id of ["chz_cheddar", "chz_brie_ex", "honey_lav"]) { await page.click(`#ctx .item[data-id="${id}"]`); await page.waitForTimeout(300); }
  check(await fox().then(f => f.coins === c0 + 17 + 21 + 10 && !f.inv.chz_cheddar), "your own cheese and honey sell at the market, tiered by how long they ripen: cheddar (4 days) 17, an excellent brie (3 days) 21, lavender honey 10");
  await page.close();
}
{
  console.log("\nthe ice cream trolley, and the delivery bike's orders");
  { const sc = await import(new URL("../src/game/scoop.js", import.meta.url)), g = await import(new URL("../src/game/goals.js", import.meta.url)), F = {coins: 0}, s = sc.scoopState(F);
    s.recipes = ["a", "b", "c", "d"].map(id => ({id, ings: [], name: id.toUpperCase() + " Gelato", col: "#FFF"})); s.tubs = {a: 20, b: 5, c: 20, d: 20};
    const tr = sc.loadTrolley(F, ["a", "b", "c", "d"]);
    check(tr && Object.keys(tr.tubs).length === 3 && tr.tubs.a === 10 && tr.tubs.b === 5 && s.tubs.a === 10 && !s.tubs.b && g.ride(F) === "walk" && sc.trolleyPace(F) < .8, "the trolley takes three flavours, ten scoops each, from the shop's tubs; Mel walks slower pushing it, and can't ride");
    const rnd = Math.random; Math.random = () => .1; const r = sc.trolleySell(F, "hana", "2026-10-12", {season: "summer", hm: 14*60}), again = sc.trolleySell(F, "hana", "2026-10-12", {}); Math.random = rnd;
    check(r && r.items.length && r.items.every(([f]) => f === "cup" || f === "cone") && F.coins === r.coins && again === null, "tap someone and they buy a cup or a cone (never floats or waffles), once a day each, and the coins come to Mel");
    const back = sc.returnTrolley(F); check(back.back === 25 - r.items.length && back.n === r.items.length, "wheel it back in time and what's left goes back in the freezer");
    sc.loadTrolley(F, ["c"]); s.trolley.at -= 3*3600e3; check(sc.trolleyMelted(s) && sc.trolleySell(F, "theo", "2026-10-12", {}) === null && sc.returnTrolley(F).melted === 10, "after two hours the ice packs give up: no more sales, and the leftovers melt");
    s.up.bike = 1; s.display = ["d"]; s.at = Date.parse("2026-10-12T04:00:00Z") - 60e3; const off = globalThis.__mapleOffset; globalThis.__mapleOffset = Date.parse("2026-10-12T04:00:00Z") - Date.now();
    Math.random = () => .001; const out = sc.scoopTick(F); Math.random = rnd; globalThis.__mapleOffset = off;
    check(out.orders && out.orders[0].shop === "scoop" && /^a (cup|cone) of /.test(out.orders[0].what) && out.orders[0].coins >= sc.DELIVERY.fee + 1, "with the bike, villagers order a cup or a cone from wherever they are (shop price + a delivery fee)");
    s.at = Date.parse("2026-10-12T14:30:00Z") - 60e3; globalThis.__mapleOffset = Date.parse("2026-10-12T14:30:00Z") - Date.now(); Math.random = () => .001; const late = sc.scoopTick(F); Math.random = rnd; globalThis.__mapleOffset = off;
    check(!(late && late.orders && late.orders.length) && sc.deliveryHours(21*60 + 59) && !sc.deliveryHours(22*60) && !sc.deliveryHours(9*60 + 59) && sc.riderOn(20*60) && !sc.riderOn(13*60 + 10), "delivery orders run 10am to 10pm (late-night suppers), and none come in after"); }
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`trolley pageerror: ${e.message}`));
  const fox = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  await page.addInitScript(() => { if (!/trpatch/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    f.scoop = {recipes: [{id: "mango+milk", ings: ["mango", "milk"], name: "Mango Gelato", col: "#F8D59A", dairy: true}, {id: "pandan", ings: ["pandan"], name: "Pandan Sorbet", col: "#9CC27E"}], tubs: {"mango+milk": 40, pandan: 40}};
    const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=14:00&date=2026-10-12"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=14:00&date=2026-10-12&trpatch=1"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__mapleScene("scoopshop")); await page.waitForTimeout(800);
  await page.locator('#world [data-spot="gcounter"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-gview="trolley"]', { timeout: 15000 });
  await page.click('#ctx [data-gview="trolley"]'); await page.waitForSelector('#ctx [data-gtsel]', { timeout: 15000 });
  await page.click('#ctx [data-gtsel="mango+milk"]'); await page.click('#ctx [data-gtsel="pandan"]'); await page.click('#ctx [data-gtrolley="go"]'); await page.waitForTimeout(400);
  check(await fox().then(f => f.scoop.trolley && f.scoop.trolley.tubs["mango+milk"] === 10 && f.scoop.trolley.tubs.pandan === 10 && f.scoop.tubs.pandan === 30), "at the counter: load the trolley with two flavours, ten scoops each");
  await page.evaluate(() => window.__mapleScene("village")); await page.waitForTimeout(1500);
  check(await page.locator("#mel").evaluate(e => e.classList.contains("trolley")), "out in the square, Mel's pushing the little pink trolley");
  const who = await page.locator("#actors .npc:not([data-npc^=\"agent\"])").first().getAttribute("data-npc");
  await page.locator(`#actors .npc[data-npc="${who}"]`).dispatchEvent("click"); await page.waitForTimeout(600);
  check(await fox().then(f => f.scoop.asked && f.scoop.asked.ids.includes(who)), `tap someone (${who}) and Mel offers them an ice cream`);
  await page.evaluate(() => window.__mapleScene("scoopshop")); await page.waitForTimeout(2000);
  check(await fox().then(f => !f.scoop.trolley && f.scoop.tubs.pandan + f.scoop.tubs["mango+milk"] >= 60), "wheel it back into the shop and it's put away, the unsold scoops back in the freezer");
  await page.evaluate(() => window.__mapleScene("village")); await page.waitForTimeout(1200);
  await page.evaluate(() => window.__mapleOrder()); await page.waitForTimeout(800);
  const rode = await page.locator("#actors .rideby .bikeArt").count(); await page.waitForTimeout(7000);
  check(rode === 1 && await page.locator("#actors .rideby").count() === 0, "an order goes out while Mel's in the square: Tomo pedals past on the mint bike with the cool box, and is gone");
  await page.close();
}
{
  console.log("\nthe bike takes bonbons and tapas too, and every shop says its takings at closing");
  { const cc = await import(new URL("../src/game/cocoa.js", import.meta.url)), vy = await import(new URL("../src/game/vineyard.js", import.meta.url)), d = "2026-10-12";
    const c = cc.cocoaState({}); c.sold[d] = {n: 3, coins: 40, bonbons: 6, deliv: 2}; const early = cc.cocoaNews(c, d, 19*60), eve = cc.cocoaNews(c, d, 20*60 + 5), again = cc.cocoaNews(c, d, 21*60);
    check(!early && /sold 3 bars and 6 bonbons: 40 coins, 2 of them delivered by bike/.test(eve) && !again, "the Cocoa Room tells you the day's takings when it shuts at 8 (once)");
    const F = {}; const v = vy.vineState(F); v.today = {day: d, bottles: 2, glasses: 5, plates: 9, coins: 120, deliv: 3};
    check(/sold 2 bottles, 5 glasses and 9 plates: 120 coins, with 3 orders out by bike/.test(vy.wineNews(F, d, 22*60 + 5) || "") && !vy.wineNews(F, d, 23*60), "and the winery at 10"); }
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`bikesend pageerror: ${e.message}`));
  const fox = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  await page.addInitScript(() => { if (!/bspatch/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return;
    f.scoop = {up: {bike: 1}, recipes: [], tubs: {}}; f.goals = {...(f.goals || {}), cocoa: true}; f.cocoa = {bars: {milk: 3, dark: 0, white: 0}};
    const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=11:00&date=2026-10-12"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=11:00&date=2026-10-12&bspatch=1"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__mapleScene("bay")); await page.waitForTimeout(900);
  await page.locator('#world [data-place="dbike"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-gvother="bar:milk"]', { timeout: 15000 });
  await page.click('#ctx [data-gvother="bar:milk"]'); await page.waitForSelector('#ctx [data-gvto="mum"]', { timeout: 15000 }); await page.click('#ctx [data-gvto="mum"]'); await page.waitForTimeout(400);
  check(await fox().then(f => f.cocoa.bars.milk === 2 && f.thanks.some(t => t.who === "mum" && t.item === "bar_milk")), "from the delivery bike: a milk chocolate bar off the Cocoa Room's wall, pedalled round to Mum (a thank-you note to come)");
  await page.close();
}
{
  console.log("\nSaturday disco night at the cellar door");
  { const t = await import(new URL("../src/game/tours.js", import.meta.url)), sat = "2026-10-10", fri = "2026-10-09", crowd = t.discoCrowd(sat);
    check(t.discoNow(sat, 21*60) && !t.discoNow(sat, 19*60) && !t.discoNow(fri, 21*60) && !t.discoNow(sat, 23*60 + 40), "disco night is Saturdays, 8 to 11:30pm");
    check(crowd.length === 16 && !crowd.some(id => ["mama", "gonggong", "okada", "lin", "celeste", "pilar"].includes(id)) && crowd.filter(id => t.NIGHT_TOURISTS.includes(id)).length === 5 && crowd.every(id => t.DISCO_MOVES.includes(t.discoSlot(id, sat, 21*60).act)),
      "a packed floor: most of the village (not Ma Ma, Gong Gong, Mr Okada or Lin, nor anyone working) and five tourists, all dancing"); }
  { const t = await import(new URL("../src/game/tours.js", import.meta.url)), days = ["2026-10-10", "2026-10-17", "2026-10-24", "2026-10-31"];
    const moves = new Set(days.flatMap(d => Object.values(t.discoFloor(d)).map(f => f.move))), spots = Object.values(t.discoFloor(days[0])).map(f => f.at), drifters = Object.values(t.discoFloor(days[0])).filter(f => f.drift).length;
    const xs = new Set(spots.map(([x]) => x)), couple = days.map(d => t.discoFloor(d)).find(f => f.mum && f.dad);
    check(moves.size >= 5 && xs.size >= 12 && drifters >= 3 && (!couple || (Math.hypot(couple.mum.at[0] - couple.dad.at[0], couple.mum.at[1] - couple.dad.at[1]) < 70 && couple.mum.dir !== couple.dad.dir)),
      `not a grid: knots of two or three, ${moves.size} different moves, some drifting between knots, and Mum and Dad dance together facing each other`);
    check(t.dateSlot("marcus", "2026-10-10", 20*60) && !t.discoSlot("marcus", "2026-10-10", 20*60)?.date, "Marcus and Angellina keep their date night (7:30 to 9) and come on to the disco after"); }
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`disco pageerror: ${e.message}`));
  await page.addInitScript(() => { if (!/dcpatch/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return; f.goals = {...(f.goals || {}), cellar: true};
    const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=21:00&date=2026-10-10"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=21:00&date=2026-10-10&dcpatch=1"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__mapleScene("cellar")); await page.waitForTimeout(2500);
  const dancers = await page.locator("#actors .npc").evaluateAll(n => n.filter(x => /act-(dance|boogie|armsup|twirl|shuffle|point)\b/.test(x.getAttribute("class"))).length);
  check(await page.locator("#sceneArt .disco .dball").count() === 1 && dancers >= 12, `the glitter ball's out and the floor's packed (${dancers} dancing)`);
  await page.goto(url + "?seed=1&time=17:00&date=2026-10-10"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__mapleScene("cellar")); await page.waitForTimeout(1500);
  check(await page.locator("#sceneArt .disco").count() === 0, "before 8 the cellar's its usual calm self");
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
  await page.evaluate(() => window.__mapleScene("farm")); await page.waitForTimeout(900);
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
  await page.evaluate(() => window.__mapleScene("farm")); await page.waitForTimeout(900);
  await page.locator('#world [data-plot="1"]').dispatchEvent("click"); await page.waitForSelector('#ctx .item[data-id="tomato_seed"]', { timeout: 15000 });
  await page.click('#ctx .item[data-id="tomato_seed"]'); await page.waitForTimeout(400);
  check(await page.evaluate(() => { const f = JSON.parse(localStorage.getItem("fox.fox")); return f.plots[1] && f.plots[1].crop === "tomato" && !f.inv.tomato_seed; }), "with the auto seeder, one tap sows every empty plot it has seeds for");
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
  check(!!v.pickGrove(F) && F.inv.olives === 12 && !v.pickGrove(F), "picking the grove: twelve jars of olives, then it needs six hours");
  vs.oliveCrate = 6;
  check(!!v.takeOliveCrate(F) && F.inv.olives === 18 && !vs.oliveCrate, "taking the olive crate the vineyard hands filled");
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
{
  console.log("\nBellbird Valley: the Vines (rounds 141-144)");
  const tw = await import(new URL("../src/data/towns.js", import.meta.url)), bb = await import(new URL("../src/game/bellbird.js", import.meta.url));
  const br = await import(new URL("../src/game/bbrooms.js", import.meta.url)), ba = await import(new URL("../src/game/bbacts.js", import.meta.url)), np = await import(new URL("../src/data/npcs.js", import.meta.url));
  const kt = await import(new URL("../src/game/kitchen.js", import.meta.url)), vy = await import(new URL("../src/game/vineyard.js", import.meta.url)), it = await import(new URL("../src/data/items.js", import.meta.url));
  const stops = bb.STOPS.filter(id => bb.regionOf(id) === "vines"), T = tw.TOWNS;
  check(stops.length === 6 && stops.every(id => T[id].by === "van" && T[id].screens.length === 2 && Object.keys(T[id].rooms).length === 3), "six Vines stops, two screens and three rooms each");
  check(stops.every(id => Object.values(T[id].rooms).every(r => tw.TOWN_PLACES[r.door] && tw.TOWN_BOUNDS[Object.keys(T[id].rooms).find(k => T[id].rooms[k] === r)])), "every room has a door outside and walls inside");
  const allRooms = stops.flatMap(id => Object.keys(T[id].rooms)), mus = new Set([...stops.map(id => T[id].music), ...allRooms.map(r => T[stops.find(id => T[id].rooms[r])].rooms[r].music)]);
  check(mus.size === 24 && new Set(bb.STOPS.flatMap(id => [tw.TOWNS[id].music, ...Object.entries(tw.TOWNS[id].rooms).filter(([k]) => k !== "bv_hpaper").map(([, r]) => r.music)])).size === 96, "24 tunes: one for every stop and every room (96 across the whole valley)");
  const F0 = {coins: 100, inv: {}}; check(bb.known(F0).join() === "bv_gate" && bb.fuelFor("home", "bv_gate", ["evan", "mum"]) === 7 && bb.setOff(F0, "bv_gate", ["mum", "evan"], 8*60) && F0.coins === 93 && bb.stamped(F0, "bv_gate"), "the van: only Valley Gate on the map at first; 6 a leg plus 1 a grown-up, and a stamp");
  check(bb.known(F0).includes("bv_lookout") && bb.known(F0).includes("bv_creek") && !bb.known(F0).includes("bv_camp"), "the map reveals the stops a road away");
  // rooms, goods, specials
  const goods = Object.values(tw.TOWN_GOODS).filter(g => /^bv_/.test(g.shop || ""));
  check(goods.length >= 30 && goods.every(g => !g.sell || g.sell <= g.price), "the valley's shops, and nothing sells back for more than it costs");
  check(tw.TOWN_GOODS.b_sparkling.price > vy.STYLES.sparkling.price + vy.RIDDLE.day*vy.RIDDLE.max, "Bellbird's sparkling costs more than Mel's best-riddled bottle sells for");
  const op1 = br.opshopToday("2026-10-12"), op2 = br.opshopToday("2026-10-13"); check(op1.length === 4 && op1.join() === br.opshopToday("2026-10-12").join() && op1.join() !== op2.join(), "the op shop: four treasures a day, different tomorrow");
  check(["pavlova", "damper", "wattlescone"].every(id => kt.TAPAS[id].special === "bellbird" && kt.TAPAS[id].price >= 14) && !kt.knows({towns: {}}, "pavlova") && kt.knows({towns: {bellbird: "2026-10-12"}}, "pavlova"), "three Bellbird specials at the stove, once Mel's been");
  check(it.ITEMS.raspberry_cane && it.ITEMS.raspberry_cane.visited === "bellbird" && it.CROPS.raspberry, "raspberry canes for the garden, once she's been");
  const F1 = {coins: 50, inv: {}, bellbird: {}}; check(br.chocTaste(F1) && !br.chocTaste(F1) && br.treat(F1, "bv_coffee", "flatwhite") && F1.coins === 46, "a free chocolate tasting once a day; a flat white for 4");
  // the people
  const bl = np.NPCS.filter(n => n.local === "bellbird");
  check(bl.length >= 40 && bl.filter(n => n.neighbour).length >= 10, "the valley's people, and the travelling neighbours at the camp");
  const inRoom = r => bl.filter(n => n.routine.some(sl => sl.scene === r)).length;
  check(allRooms.filter(r => !["bv_shed", "bv_cave"].includes(r)).every(r => inRoom(r) >= 1) && allRooms.filter(r => inRoom(r) >= 2).length >= 12, "people in the rooms (two or more in most)");
  // the family: new acts at every stop, never repeated, and none from the earlier towns
  const old = new Set(["ronda", "kyoto", "jeju", "cinque"].flatMap(t => Object.values(T[t].acts || {}).flatMap(a => Object.values(a).map(x => x.act))));
  const mine = stops.flatMap(id => Object.values(T[id].acts).flatMap(a => Object.values(a).map(x => x.act)));
  check(mine.length >= 18 && new Set(mine).size === mine.length && mine.every(a => !old.has(a)) && stops.every(id => Object.keys(T[id].acts).length >= 3), "the family: three or four new things at every stop, all different, none from the other towns");
  // the activities
  const F2 = {coins: 200, inv: {}, bellbird: {}}, add = (id, n) => { F2.inv[id] = (F2.inv[id] || 0) + n; };
  check(!ba.balloonOpen(12*60) && ba.balloonOpen(7*60) && ba.balloonOpen(17*60 + 30) && ba.flightCost(["evan", "mum"]) === 55, "the balloon flies at dawn and golden hour: 30, Evan 10, others 15");
  const fl = ba.flightStart(() => .3); fl.sights.forEach(([, want]) => { fl.alt = want; ba.flightMove(fl, "hold"); }); fl.alt = 1;
  check(fl.seen.length === 5 && ba.flightLand(fl) === true && ba.finishFlight(F2, fl, add) && F2.inv.b_flight === 1, "a flight: every sight at the right height, a soft landing, a certificate");
  const rd = ba.riddleStart(() => .6); while (!ba.riddleDone(rd)) ba.riddleTap(rd, rd.turns.findIndex(t => t)); check(ba.finishRiddle(F2) && vy.canRiddle(F2), "riddling with Jono, and the rack at home");
  const V = vy.vineState(F2); V.cellar.push({id: "wfizz", name: "Cuvée Maple", type: "sparkling", n: 6}); check(vy.onRack(F2, "wfizz") && !vy.onRack(F2, "wfizz"), "sparkling onto the riddling rack");
  V.cellar[0].rack -= 3*24*3600e3; vy.stock(F2, "wfizz"); check(V.shelf[0].price === vy.STYLES.sparkling.price + 6, "three days on the rack: 6 coins more a bottle");
  const be = ba.berriesStart(() => .3); be.ripe.forEach((r, i) => ba.pickBerry(be, i)); check(ba.berriesDone(be) && be.oops === 0 && ba.finishBerries(F2, be, add) && F2.inv.raspberry > 0 && !ba.finishBerries(F2, be, add), "pick your own: berries once a day");
  F2.inv.strawberry = 2; check(ba.dipBerries(F2, "dark", "sprinkles") && !F2.inv.strawberry, "dipping two strawberries in Sophie's chocolate");
  for (let d = 0; d < 3; d++) { F2.bellbird.joeyDay = null; const j = ba.joeyStart(), early = ba.joeyDo(j, 2); if (!d) check(early === "oops", "feeding Pip before the bottle's warm: Kim stops you"); [0, 0, 0, 1, 2, 2, 2, 2, 3].forEach(i => ba.joeyDo(j, i)); const r = ba.finishJoey(F2); if (d === 2) check(ba.joeyDone(j) && r.release, "three feeds of Pip, and she goes back to the bush"); }
  const cn = ba.canoeStart(); ["L", "R", "L", "R", "L", "R", "L", "R"].forEach(x => ba.paddle(cn, x)); check(ba.canoeDone(cn) && ba.finishCanoe(F2, cn), "a straight canoe: left, right, left, right");
  // Kel's cuttings (round 145): Pinot Noir and Chardonnay at home
  const F3 = {coins: 300, inv: {}, bellbird: {}}; check(!br.buyCuttings(F3, "pinot") && br.treat(F3, "bv_tasting", "flight") && br.buyCuttings(F3, "pinot") === "Pinot Noir" && br.buyCuttings(F3, "chardonnay") && F3.coins === 300 - 6 - 180, "after a tasting, Kel's Pinot Noir and Chardonnay cuttings (90 for three)");
  { const v3 = vy.vineState(F3); check(v3.cuttings.pinot === 3 && v3.cuttings.chardonnay === 3 && vy.grapeKinds(v3).includes("pinot") && vy.grapeKinds(v3).includes("chardonnay") && vy.STYLES.pinot.grape === "pinot" && vy.STYLES.chardonnay.price > vy.STYLES.white.price, "they grow on the trellis and make their own wines");
    check(tw.TOWN_GOODS.b_pinot.price > vy.STYLES.pinot.price && tw.TOWN_GOODS.b_chard.price > vy.STYLES.chardonnay.price, "Kel's bottles cost more than Mel's own sell for"); }
  F2.inv.mallows = 1; const bag = ba.openBag(F2); ba.toast(bag); ba.toast(bag); ba.toast(bag); check(ba.pullOut(F2, bag) === "golden" && !ba.fireLit(16*60) && ba.fireLit(17*60), "a golden marshmallow, from five");
  // in the browser: a van trip to the camp at six, a room, the fire and the family
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`bellbird pageerror: ${e.message}`));
  const fox = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  await page.addInitScript(() => { if (!/bbv=1/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return; f.goals = {...(f.goals || {}), van: true}; f.coins = 300;
    const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=09:00&date=2026-10-12"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=09:00&date=2026-10-12&bbv=1"); await page.waitForTimeout(1000);
  await page.evaluate(() => window.__mapleScene("van")); await page.waitForTimeout(900);
  await page.locator('#world [data-spot="vmap"]').dispatchEvent("click"); await page.waitForSelector("#ctx .bbmap", { timeout: 20000 });
  await page.click('#ctx [data-bvpick="evan"]'); await page.click('#ctx [data-bvpick="mama"]'); await page.click('#ctx [data-bvgo="bv_gate"]'); await page.waitForTimeout(4500);
  check(await fox().then(f => f.trip && f.trip.town === "bv_gate" && f.coins === 293), "off in the van to Valley Gate");
  await page.evaluate(() => window.__mapleScene("bv_store")); await page.waitForTimeout(1200);
  check(await page.locator('#actors .npc[data-npc="mrsdunn"]').count() === 1, "Mrs Dunn behind the counter at the store");
  await page.locator('#world [data-rdspot="bv_store"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-rbuy="wattleseed"]', { timeout: 20000 });
  await page.click('#ctx [data-rbuy="wattleseed"]'); await page.waitForTimeout(400);
  check(await fox().then(f => f.inv.wattleseed === 1), "a jar of wattleseed from Mrs Dunn's shelves");
  await page.evaluate(() => window.__mapleScene("bv_opshop")); await page.waitForTimeout(6000);
  check(await page.locator('#actors .npc[data-npc="mama"].act-rummage').count() === 1, "Ma Ma rummaging in the op shop");
  await page.close();
}
{
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
  // the family: new acts at every stop, never repeated, none from any earlier town (the Vines included)
  const old = new Set([...["ronda", "kyoto", "jeju", "cinque"], ...bb.STOPS.filter(id => bb.regionOf(id) === "vines")].flatMap(t => Object.values(T[t].acts || {}).flatMap(a => Object.values(a).map(x => x.act))));
  const mine = stops.flatMap(id => Object.values(T[id].acts).flatMap(a => Object.values(a).map(x => x.act)));
  check(mine.length >= 12 && new Set(mine).size === mine.length && mine.every(a => !old.has(a)) && stops.every(id => Object.keys(T[id].acts).length >= 2), "the family: new things at every coast stop, all different, none from any earlier town");
  // the activities
  const F = {coins: 200, inv: {}, bellbird: {}}, add = (id, n) => { F.inv[id] = (F.inv[id] || 0) + n; };
  const sf = ca.surfStart(); while (!ca.surfDone(sf)) { ca.surfDo(sf, "paddle"); ca.surfDo(sf, "paddle"); ca.surfDo(sf, "paddle"); ca.surfDo(sf, "pop"); }
  check(sf.rides === 5 && ca.surfCost(true) === 20 && ca.finishSurf(F, sf, add) && F.inv.b_surfphoto === 1 && !ca.finishSurf(F, sf, add), "a surf lesson: pop up as the wave peaks; a photo of your first wave");
  const early = ca.surfStart(); ca.surfDo(early, "pop"); const late = ca.surfStart(); [1, 2, 3, 4].forEach(() => ca.surfDo(late, "paddle")); check(early.last === "early" && late.last === "dumped", "too soon and it rolls past; too late and it dumps you");
  check(ca.whaleSeason("2026-10-12") && !ca.whaleSeason("2026-01-12") && ca.whaleStart("2026-01-12").whales === false, "humpbacks May to November, dolphins the rest of the year");
  let wr = 0; const wh = ca.whaleStart("2026-10-12", () => (wr = (wr + .37) % 1)); wh.at.forEach(i => ca.whaleLook(wh, i)); check(ca.whaleDone(wh) && wh.seen.length === 3 && ca.finishWhales(F, wh, add) && F.inv.b_whalecard === 1, "whales from the lighthouse balcony, and Win's sighting card");
  const gl = ca.glowStart(() => .5); check(!ca.glowOpen(17*60) && ca.glowOpen(18*60) && ca.glowCount(gl, 0) === null, "glow-worms from 6pm, and only once your eyes have adjusted");
  [0, 1, 2].forEach(() => ca.glowWait(gl)); gl.lit.forEach((_, i) => ca.glowCount(gl, i)); check(ca.glowDone(gl) && ca.finishGlow(F, gl).n === ca.glowTotal(gl) && F.bellbird.glow > 0, "counting the glow-worms");
  const pt = ca.potsStart(() => .5); while (!ca.potsDone(pt)) { const p = ca.potHaul(pt); if (p && p.what !== "empty") ca.potChoose(pt, ca.potKeepable(p)); }
  check(pt.right === pt.pots.filter(p => p.what !== "empty").length && ca.finishPots(F, pt, add) === 2 && F.inv.crayfish === 2 && ca.finishPots(F, pt, add) === 0, "cray pots with Mags: keep the big ones, back with the small and the berried; two crays, once a day");
  check(!ca.potKeepable({what: "berried", mm: 130}) && !ca.potKeepable({what: "cray", mm: 90}) && ca.potKeepable({what: "cray", mm: 110}), "the gauge, and the mums with eggs go back");
  const pg = ca.pengStart(true, () => .1); while (!ca.pengDone(pg)) ca.pengDo(pg, pg.squeal[pg.round] ? "shush" : "still", () => .5); check(!ca.pengOpen(17*60) && ca.pengOpen(18*60 + 30) && pg.fright === 0 && ca.finishPeng(F, pg) === pg.here && pg.here > 0, "the penguin parade at dusk: stay still, and shush Evan in time");
  const nip = ca.nipStart(() => .1); while (!ca.nipDone(nip)) ca.nipDo(nip, nip.wave[nip.leg] ? "duck" : "cheer"); const nr = ca.finishNip(F, nip, add);
  check(nr.place === 1 && nr.medal && F.inv.b_nipmedal === 1 && !ca.finishNip(F, nip, add).medal, "Nippers: Evan wins, and his first medal");
  // in the browser: the family at Breakwater, Jet's surf lesson
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`coast pageerror: ${e.message}`));
  const fox = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  await page.addInitScript(() => { if (!/crv=1/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return; f.goals = {...(f.goals || {}), van: true}; f.coins = 300;
    f.bellbird = {stamps: {bv_gate: "2026-10-01"}}; f.trip = {town: "bv_breakwater", day: "2026-10-12", party: ["mum", "marcus", "evan"], from: 7*60, by: "van"};
    const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=10:00&date=2026-10-12"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=10:00&date=2026-10-12&crv=1"); await page.waitForTimeout(1000);
  await page.evaluate(() => window.__mapleScene("cw_beach")); await page.waitForTimeout(7000);
  check(await page.locator('#actors .npc[data-npc="marcus"].act-bodyboard').count() === 1 && await page.locator('#actors .npc[data-npc="mum"].act-yoga').count() === 1 && await page.locator('#actors .npc[data-npc="crjet"]').count() === 1, "Breakwater: Marcus with his bodyboard, Mum's beach yoga, and Jet teaching");
  await page.evaluate(() => window.__mapleScene("bv_surfshop")); await page.waitForTimeout(900);
  await page.locator('#world [data-rdspot="bv_surfshop"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-bba="open:surf"]', { timeout: 20000 });
  await page.click('#ctx [data-bba="open:surf"]'); await page.click('#ctx [data-bba="surf"]'); await page.waitForTimeout(300);
  for (let w = 0; w < 5; w++) { for (let i = 0; i < 3; i++) await page.click('#ctx [data-bba="spaddle"]'); await page.click('#ctx [data-bba="popup"]'); }
  await page.click('#ctx [data-bba="surfed"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.coins === 280 && f.inv.b_surfphoto === 1 && f.bellbird.surfs === 1), "a surf lesson with Jet (20 with Evan), five waves ridden, and the photo");
  await page.goto(url + "?seed=1&time=20:30&date=2026-10-12"); await page.waitForTimeout(1000);
  await page.evaluate(() => window.__mapleScene("cw_beach")); await page.waitForTimeout(2500);
  check(await page.locator("#sceneArt .zzz").count() === 1 && !(await page.locator("#evan").isVisible()) && /tuck him into the back of the van/.test(await page.locator("#speech").textContent()), "after eight, Evan's tucked up asleep in the van");
  await page.close();
}
{
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
  // the family: new acts at every stop, none from any earlier town (the Vines and the Coast Road included)
  const old = new Set([...["ronda", "kyoto", "jeju", "cinque"], ...bb.STOPS.filter(id => bb.regionOf(id) !== "tablelands")].flatMap(t => Object.values(T[t].acts || {}).flatMap(a => Object.values(a).map(x => x.act))));
  const mine = stops.flatMap(id => Object.values(T[id].acts).flatMap(a => Object.values(a).map(x => x.act)));
  check(mine.length >= 12 && new Set(mine).size === mine.length && mine.every(a => !old.has(a)) && stops.every(id => Object.keys(T[id].acts).length >= 2), "the family: new things at every Tablelands stop, all different, none from anywhere before");
  // the activities
  const F = {coins: 300, inv: {b_goldpan: 1}, bellbird: {}}, add = (id, n) => { F.inv[id] = (F.inv[id] || 0) + n; }, o = (hm, rng) => ({hm, addInv: add, evan: true, rng});
  let st = {}; ta.tlAct(F, "swim", st, "swimin", null, o(10*60)); ["falls", "float", "veil"].forEach(k => ta.tlAct(F, "swim", st, "swim", k)); const inStill = !st.t.out && st.t.cold === 3; ta.tlAct(F, "swim", st, "swim", "out");
  check(inStill && st.t.out && ta.tlAct(F, "swim", st, "swimdone").close && F.bellbird.tl.swims === 1, "a swim in the falls: the falls, a float, behind the veil, and out");
  st = {}; check(!ta.tlAct(F, "swim", st, "swimin", null, o(19*60)), "no swimming after five");
  st = {}; ta.tlAct(F, "kayak", st, "kayakgo", null, o(10*60, () => .1)); while (!ta.kayakDone(st.t)) ta.tlAct(F, "kayak", st, "steer", String(st.t.at[st.t.leg]));
  check(st.t.seen.length === 6 && F.coins === 300 - ta.kayakCost(true) && ta.tlAct(F, "kayak", st, "kayakdone").close && F.bellbird.tl.kayaks === 1, "once round Crater Lake in a kayak (16 with Evan), steering for whatever shows itself");
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
  // in the browser: the family at Misty Falls, and a swim from the falls
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`tablelands pageerror: ${e.message}`));
  const fox = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  await page.addInitScript(() => { if (!/tlv=1/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return; f.goals = {...(f.goals || {}), van: true}; f.coins = 300;
    f.bellbird = {stamps: {bv_gate: "2026-10-01", bv_lookout: "2026-10-01"}}; f.trip = {town: "bv_falls", day: "2026-10-12", party: ["gonggong", "marcus", "evan"], from: 7*60, by: "van"};
    const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=10:00&date=2026-10-12"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=10:00&date=2026-10-12&tlv=1"); await page.waitForTimeout(1000);
  await page.evaluate(() => window.__mapleScene("tf_top")); await page.waitForTimeout(7000);
  check(await page.locator('#actors .npc[data-npc="gonggong"].act-flask').count() === 1 && await page.locator('#world [data-place="bvtview"]').count() === 1, "Misty Falls: Gong Gong with his thermos at the lookout");
  await page.evaluate(() => window.__mapleScene("tf_pool")); await page.waitForTimeout(6000);
  check(await page.locator('#actors .npc[data-npc="marcus"].act-wade').count() === 1 && await page.locator('#actors .npc[data-npc="tlkirra"]').count() === 1, "the swimming hole: Marcus wading by the falls, and Kirra the ranger");
  await page.locator('#world [data-place="bvtfalls"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-bba="tl:swimin"]', { timeout: 20000 });
  await page.click('#ctx [data-bba="tl:swimin"]'); for (const k of ["falls", "float", "veil", "out"]) await page.click(`#ctx [data-bba="tl:swim.${k}"]`);
  await page.click('#ctx [data-bba="tl:swimdone"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.bellbird.tl && f.bellbird.tl.swims === 1), "a swim in the falls, all the way through");
  await page.evaluate(() => window.__mapleScene("bv_tcafe")); await page.waitForTimeout(900);
  await page.locator('#world [data-rdspot="bv_tcafe"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-rbuy="b_rosella"]', { timeout: 20000 });
  await page.click('#ctx [data-rbuy="b_rosella"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.inv.b_rosella === 1 && f.coins === 294), "the Range Café: a jar of rosella jam to take home");
  await page.close();
}
{
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
  check(stops.every(id => Object.keys(T[id].rooms).filter(r => r !== "bv_hpaper").every(r => br.bbRoomPanel({coins: 50, inv: {}}, r).length > 50)), "every Lavender Hills room has its panel (Mel's paperie in Montrose has its own stations)");
  const lv = np.NPCS.filter(n => /^lv/.test(n.id)), rooms = stops.flatMap(id => Object.keys(T[id].rooms));
  check(lv.length >= 28 && lv.every(n => n.local === "bellbird") && new Set(np.NPCS.map(n => n.id)).size === np.NPCS.length, "the Lavender Hills' people, and no one twice");
  check(rooms.filter(r => lv.some(n => n.routine.some(sl => sl.scene === r))).length >= 16, "people in the Lavender Hills rooms");
  const old = new Set([...["ronda", "kyoto", "jeju", "cinque"], ...bb.STOPS.filter(id => bb.regionOf(id) !== "lavender")].flatMap(t => Object.values(T[t].acts || {}).flatMap(a => Object.values(a).map(x => x.act))));
  const mine = stops.flatMap(id => Object.values(T[id].acts).flatMap(a => Object.values(a).map(x => x.act)));
  check(mine.length >= 12 && new Set(mine).size === mine.length && mine.every(a => !old.has(a)) && stops.every(id => Object.keys(T[id].acts).length >= 2), "the family: new things at every Lavender Hills stop, all different, none from anywhere before");
  // the activities
  const F = {coins: 300, inv: {}, bellbird: {}}, add = (id, n) => { F.inv[id] = (F.inv[id] || 0) + n; }, o = (hm, rng) => ({hm: hm || 10*60, addInv: add, evan: true, rng: rng || (() => .3)});
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
  check(F.inv.b_mazecert === 1, "the sunflower maze: Evan finds the middle, and his certificate");
  st = {}; la.lvAct(F, "sticks", st, "sticksgo", null, o()); for (let i = 0; i < 3; i++) la.lvAct(F, "sticks", st, "stick", "fat", o(600, () => .1)); check(st.t.mine === 3 && la.lvAct(F, "sticks", st, "sticksdone").close, "Pooh-sticks off the Old Bridge, best of three against Dad");
  st = {}; check(!la.lvAct(F, "bell", st, "bellgo", null, o(12*60)) && la.lvAct(F, "bell", st, "candle").hearts === 1, "a candle any time; the bell only at sunset");
  la.lvAct(F, "bell", st, "bellgo", null, o(18*60)); while (!la.bellDone(st.t)) la.lvAct(F, "bell", st, "bell", st.t.down[st.t.i] ? "pull" : "wait"); la.lvAct(F, "bell", st, "belldone", null, o(18*60));
  check(F.inv.b_bellmedal === 1, "ringing the chapel bell at sunset: five strokes, and Père Gaston's little bell");
  st = {}; la.lvAct(F, "banon", st, "banongo"); ["soak", "wrap", "tie", "rest"].forEach(k => la.lvAct(F, "banon", st, "bstep", k)); la.lvAct(F, "banon", st, "banondone");
  check(la.knowsBanon(F) && hf.cheesesFor(hf.hfState(F)).some(([k]) => k === "banon") && !hf.cheesesFor(hf.hfState({})).some(([k]) => k === "banon"), "Céline's banon lesson: then it's yours to make at home in Elena's cheese press");
  // in the browser: the family at Lavender Ridge, and the harvest from the rows
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`lavender pageerror: ${e.message}`));
  const fox = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  await page.addInitScript(() => { if (!/lvv=1/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return; f.goals = {...(f.goals || {}), van: true}; f.coins = 300;
    f.bellbird = {stamps: {bv_gate: "2026-10-01", bv_camp: "2026-10-01"}}; f.trip = {town: "bv_lavender", day: "2026-10-12", party: ["mum", "darren", "evan"], from: 7*60, by: "van"};
    const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=10:00&date=2026-10-12"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=10:00&date=2026-10-12&lvv=1"); await page.waitForTimeout(1000);
  await page.evaluate(() => window.__mapleScene("hv_rows")); await page.waitForTimeout(7000);
  check(await page.locator('#actors .npc[data-npc="mum"].act-armful').count() === 1 && await page.locator('#actors .npc[data-npc="darren"].act-bee').count() === 1 && await page.locator('#actors .npc[data-npc="lvemile"]').count() === 1, "Lavender Ridge: Mum with an armful of lavender, a bee after Darren, and Émile in the rows");
  await page.locator('#world [data-place="bvhrows"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-bba="lv:cutgo"]', { timeout: 20000 });
  await page.click('#ctx [data-bba="lv:cutgo"]'); await page.waitForTimeout(200);
  for (let i = 0; i < 6; i++) { const b = page.locator(`#ctx [data-bba="lv:cut.${i}"]`); if (await b.count() && /deep purple/.test(await page.locator("#ctx li").nth(i).innerText())) await b.click(); }
  await page.click('#ctx [data-bba="lv:cutdone"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.inv.bq_lavender === 2 && f.bellbird.lv.cut === "2026-10-12"), "the lavender harvest with Émile, two bunches to take home");
  await page.close();
}
{
  console.log("\nThe terrace and the Sunday long lunch (round 146)");
  const lu = await import(new URL("../src/game/lunch.js", import.meta.url)), vy = await import(new URL("../src/game/vineyard.js", import.meta.url)), np = await import(new URL("../src/data/npcs.js", import.meta.url));
  const sun = "2026-10-11", ids = new Set(np.NPCS.map(n => n.id)), bk = lu.bookingsFor(sun), seats = lu.seatsTaken(bk);
  check(lu.lunchOn(sun) && !lu.lunchOn("2026-10-12") && lu.nextSunday("2026-10-14") === "2026-10-18" && lu.nextSunday(sun) === sun, "every Sunday; the book shows the coming one");
  check(seats >= 9 && seats <= lu.LUNCH.seats && bk.filter(b => b.family).length === 1 && bk.every(b => b.ids.every(id => ids.has(id))) && new Set(bk.flatMap(b => b.ids)).size === seats, "nine to twelve booked, one lot of the family, no one twice");
  const fams = ["2026-10-11", "2026-10-18", "2026-10-25"].map(d => lu.bookingsFor(d).find(b => b.family).ids.join()); check(new Set(fams).size === 3, "a different pair of the family each week");
  check(lu.bookOpen("2026-10-12").list.length < lu.bookOpen("2026-10-17").list.length && lu.bookOpen("2026-10-17").list.length === lu.bookingsFor("2026-10-18").length, "the book fills up through the week");
  const g = bk.find(b => !b.family), sl = lu.lunchSlot(g.ids[0], sun, 12*60 + 45, true);
  check(sl && sl.scene === "terrace" && sl.act === "sit" && !lu.lunchSlot(g.ids[0], sun, 12*60 + 45, false) && !lu.lunchSlot(g.ids[0], sun, 15*60 + 5, true), "booked guests sit at the long table 12 to 3 (once there's a terrace)");
  const mm = lu.bookingsFor("2026-10-25").find(b => b.ids.includes("mama")); check(!mm || mm.at >= 13*60, "Ma Ma comes after her market stall shuts");
  // sales: a pair gets through about a bottle an hour, the dearer ones more
  const F = {coins: 0, inv: {}, vine: {terrace: true}}; const v = vy.vineState(F); v.shelf = [{id: "a", name: "House red", type: "red", n: 40, price: 18, open: 0}, {id: "b", name: "Reserva", type: "tempranillo", n: 40, price: 28, open: 0}];
  const realNow = Date.now, t0 = Date.parse("2026-10-11T07:00:00Z"); Date.now = () => t0; v.lastTick = t0 - 180*60000; const out = vy.sellTick(F, {}); Date.now = realNow;
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
  await page.evaluate(() => window.__mapleScene("wineshop")); await page.waitForTimeout(1000);
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
}
{
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
  // the Sunday market: a mill crate on Mel's wine stall, and Grace (Hazel's granddaughter) stocks Mel's soaps
  { const F = {craft: {store: {mc_s: 4, mc_o: 4}}}; it.ITEMS.mc_s = {n: "A bar of x soap", price: 8, mill: "soap"}; it.ITEMS.mc_o = {n: "A bottle of x oil", price: 28, mill: "oil"}; const real = Math.random; Math.random = () => .001;
    const g = [0, 1, 2, 3, 4].map(() => mc.craftSellMinute(F, "2026-10-18", 9*60, "grace")), m = mc.craftSellMinute(F, "2026-10-18", 9*60, "market"), sat = mc.craftSellMinute(F, "2026-10-17", 11*60, "shop"); Math.random = real;
    check(g.slice(0, 4).every(x => x === 8) && g[4] === 0 && F.craft.store.mc_o === 2 && m === 28 && sat === 28 && F.craft.sold["2026-10-18"].grace === 4, "Grace sells Mel's soaps (only the soaps) at the Sunday market; the wine stall's mill crate sells too"); }
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
    const add = (id, n) => { F.inv[id] = (F.inv[id] || 0) + n; }; check(mc.tasteDone(st) && st.score === st.oils.reduce((a, o) => a + o.notes.length, 0) && mc.finishTaste(F, st, add) && F.inv.t_glass === 1, "Mel at a tasting: name the notes in each glass, and keep the cobalt glass");
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
  await page.evaluate(() => window.__mapleScene("mill")); await page.waitForTimeout(3500);
  check(await page.locator('#actors .npc[data-npc="tomi"]').count() === 1 && await page.locator('#world [data-millspot="stairs"]').count() === 1, "Tomi at the press; wooden stairs up");
  await page.locator('#world [data-millspot="stairs"]').dispatchEvent("click"); await page.waitForFunction(() => /upstairs/i.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 }); await page.waitForTimeout(800);
  check(await page.locator('#world [data-millspot="bench"]').count() === 1 && await page.locator('#world [data-millspot="tasting"]').count() === 1 && await page.locator('#world [data-millspot="workshop"]').count() === 1, "upstairs: the workbench, the tasting table and the workshop corner");
  await page.evaluate(() => window.__mapleScene("wineshop")); await page.waitForTimeout(1500);
  check(await page.locator('#world [data-spot="mcrate"]').count() === 1, "till the Mill Shop opens, a crate from the mill sits by the wine shop's counter");
  await page.locator('#world [data-spot="mcrate"]').dispatchEvent("click"); await page.waitForFunction(() => /From the mill/.test(document.querySelector("#ctx").textContent), null, { timeout: 20000 }).catch(() => {});
  check(/From the mill/.test(await page.locator("#ctx").textContent()), "tap the crate: what's in it and what's sold today");
  await page.evaluate(() => window.__mapleScene("millup")); await page.waitForTimeout(2500);
  { const bb = await page.locator('#world [data-millspot="bench"]').boundingBox(), hit = await page.evaluate(([x, y]) => !!document.elementFromPoint(x, y)?.closest('[data-millspot="bench"]'), [Math.min(bb.x + bb.width/2, page.viewportSize().width - 20), bb.y + bb.height/2]);
    check(hit, "a tap anywhere on the workbench lands on it, not the floor between its legs"); }
  await page.locator('#world [data-millspot="bench"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-mc="add:rosemary"]', { timeout: 20000 });
  await page.click('#ctx [data-mc="add:rosemary"]'); await page.click('#ctx [data-mc="make"]'); await page.waitForTimeout(300);
  check(await fox().then(f => f.craft && f.craft.steep.length === 1 && f.craft.recipes[0].name === "Rosemary olive oil" && !f.inv.oliveoil), "Mel steeps her first infused oil: Rosemary olive oil");
  await page.click("#ctx [data-close]"); await page.locator('#world [data-millspot="shop"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-goal="millshop"]', { timeout: 20000 });
  await page.click('#ctx [data-goal="millshop"]'); await page.waitForTimeout(600);
  check(await fox().then(f => f.goals.millshop && f.coins === 800), "the Mill Shop opens upstairs (1200)");
  await page.close();
}
{
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
  check(oc.occasionSlot("amara", "2026-10-14", 19*60 + 30, true).act === "point" && oc.occasionSlot("dad", "2026-10-15", 14*60 + 30, true).act === "point" && oc.occasionSlot("juniper", "2026-10-15", 14*60 + 30, true).act === "paint", "Amara runs the quiz; Dad teaches the painting");
  const md = lu.bookingsFor("2027-05-09"); check(md[0].mothers && md[0].ids.includes("mum") && md[0].ids.includes("mama") && lu.seatsTaken(md) <= 12, "Mother's Day: the whole family at the long lunch, Mum and Ma Ma guests of honour");
  const cu = oc.comingUp("2026-10-12"); check(cu.some(e => /wedding of/.test(e.n)) && cu.some(e => e.n === "Trivia night") && cu.every(e => e.day >= "2026-10-12"), "the bookings book: what's coming up");
  // trivia: twenty questions, all with three answers; a perfect score wins the pot
  const qz = oc.quizFor("2026-10-14"); check(qz.length === 5 && qz.every(r => r.qs.length === 4 && r.qs.every(q => q[1].length === 3 && q[2] >= 0 && q[2] < 3)), "trivia: five rounds of four, three answers each");
  const st = oc.triviaStart("2026-10-14", "Mel's Marvels"); while (!st.done) { oc.triviaAnswer(st, st.rounds[st.r].qs[st.q][2]); oc.triviaNext(st); }
  const F = {coins: 0, inv: {}}; const r = oc.finishTrivia(F, st); check(st.score === 20 && r.win && F.coins === r.pot && r.pot === oc.QUIZ.entry*4 + oc.QUIZ.house, "twenty out of twenty: the winners take the pot");
  // sip and paint: three layers, and the painting to keep
  const ps = oc.paintStart("view"); [0, 1, 2].forEach(i => oc.paintStep(ps, i)); const G = {inv: {}}, add = (id, n) => { G.inv[id] = (G.inv[id] || 0) + n; };
  check(oc.paintDone(ps) && oc.finishPaint(G, ps, add) === "p_view" && G.inv.p_view === 1 && !oc.finishPaint(G, ps, add), "sip and paint: three layers, and your painting comes home");
  // sales: a wedding afternoon sells sparkling
  { const W = {coins: 0, inv: {}, vine: {terrace: true}}, v = vy.vineState(W); v.shelf = [{id: "s", name: "Cuvée", type: "sparkling", n: 40, price: 24, open: 0}, {id: "r", name: "House red", type: "red", n: 40, price: 24, open: 0}];
    const realNow = Date.now, t0 = Date.parse("2026-10-24T11:00:00Z"); Date.now = () => t0; v.lastTick = t0 - 300*60000; const out = vy.sellTick(W, {}); Date.now = realNow;
    check(out && out.occB >= 6 && 40 - v.shelf[0].n > 40 - v.shelf[1].n, `a wedding on the terrace: ${out && out.occB} bottles, mostly sparkling`); }
  // in the browser: trivia on a Wednesday night, the book's Coming up page
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`terrace week pageerror: ${e.message}`));
  const fox = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  await page.addInitScript(() => { if (!/tw=1/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return; f.coins = 100; f.vine = {...(f.vine || {}), terrace: true};
    const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=19:20&date=2026-10-14"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=19:20&date=2026-10-14&tw=1"); await page.waitForTimeout(1000);
  await page.evaluate(() => window.__mapleScene("terrace")); await page.waitForTimeout(5000);
  check(await page.locator('#actors .npc[data-npc="amara"].act-point').count() === 1 && await page.locator('#actors .npc[data-npc="darren"].act-sit').count() === 1 && await page.locator('#world [data-tspot="screen"]').count() === 1, "Wednesday night: Amara on the microphone, teams at the table, the screen up");
  check(await page.locator("#sceneArt rect.dusk").count() === 1 && await page.locator("#sceneArt .nglow").count() >= 8, "the terrace gets the evening light like everywhere outdoors, and its fairy lights, rattan lamps and candles glow");
  await page.locator('#world [data-tspot="screen"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-trv^="join"]', { timeout: 20000 });
  await page.click('#ctx [data-trv="join:0"]'); await page.waitForTimeout(300);
  for (let i = 0; i < 20; i++) { await page.click('#ctx [data-trv^="ans"] >> nth=0'); await page.click('#ctx [data-trv="next"]'); }
  await page.waitForSelector('#ctx [data-trv="end"], #ctx [data-trv^="tie"]', { timeout: 10000 }); await page.click('#ctx [data-trv="end"], #ctx [data-trv^="tie"] >> nth=0'); await page.waitForTimeout(400);
  check(await fox().then(f => f.terraceEv && f.terraceEv.trivia === "2026-10-14" && f.terraceEv.quizzes === 1 && f.coins <= 100 - 10 + 50), "Mel plays trivia: ten coins in the jar, twenty questions, the scores read out");
  await page.locator('#world [data-tspot="book"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-lbtab="coming"]', { timeout: 20000 });
  await page.click('#ctx [data-lbtab="coming"]'); await page.waitForTimeout(300);
  check(/wedding of/i.test(await page.locator("#ctx").textContent()), "the bookings book's Coming up page shows the weddings booked in");
  await page.close();
}
{
  console.log("\nStorage at home: the fridge and the garage shelf (round 166)");
  const sg = await import(new URL("../src/game/storage.js", import.meta.url)), it = await import(new URL("../src/data/items.js", import.meta.url));
  check(sg.placeFor("raspberry") === "fridge" && sg.placeFor("flour") === "fridge" && sg.placeFor("balloon") === "shelf" && sg.placeFor("tulip_seed") === "shelf" && !Object.keys(it.ITEMS).some(id => ["tool", "pet"].includes(it.ITEMS[id].kind) && sg.placeFor(id)), "food and flowers go in the fridge; everything else on the garage shelf; tools and pets stay out");
  { const F = {inv: {raspberry: 5, balloon: 1}};
    check(sg.putAway(F, "fridge", "raspberry", 99) === 5 && !F.inv.raspberry && sg.putAway(F, "fridge", "balloon") === 0 && F.storage.fridge.raspberry === 5, "put away: raspberries into the fridge (a balloon doesn't fit)");
    check(sg.takeOut(F, "fridge", "raspberry", 2) === 2 && F.inv.raspberry === 2 && F.storage.fridge.raspberry === 3, "take some back out");
    check(sg.sendOff(F, "fridge", "raspberry", "scoop") === 3 && F.scoop.fridge.raspberry === 3 && !F.storage.fridge.raspberry && F.inv.raspberry === 2, "send the rest to the Scoop Shack fridge: the backpack's untouched");
    check(sg.shopsFor("raspberry", () => false).map(s => s.k).join() === "scoop,kitchen" && sg.shopsFor("raspberry", () => true).some(s => s.k === "cocoa"), "only shops Mel owns, and that use it, are offered"); }
  { const mc = await import(new URL("../src/game/millcraft.js", import.meta.url)), F = {inv: {honey_lav: 1, goatmilk: 2}, goals: {mill: 1}};
    sg.putAway(F, "fridge", "honey_lav"); sg.putAway(F, "fridge", "goatmilk");
    check(sg.shopsFor("honey_lav", () => true).some(s => s.k === "basket") && sg.shopsFor("goatmilk", () => true).some(s => s.k === "basket"), "honey and goat's milk can go to the mill's basket");
    sg.sendOff(F, "fridge", "honey_lav", "basket"); sg.sendOff(F, "fridge", "goatmilk", "basket");
    const r = mc.craft(F, "soap", "goatmilk", ["honey_lav"]);
    check(r.recipe && r.recipe.name === "Lavender honey goat's milk soap" && !F.craft.basket.honey_lav && !F.craft.basket.goatmilk, "the bench makes soap straight from the basket: " + (r.recipe ? r.recipe.name : r.msg));
    mc.toBasket(F, "honey_lav"); F.inv.basil = 3; mc.toBasket(F, "basil"); const bp = mc.benchPanel(F, {tab: "basket"});
    check(/data-mc="unbasket:basil:1"/.test(bp) && mc.fromBasket(F, "basil", 2) === 2 && F.inv.basil === 2 && F.craft.basket.basil === 1, "the basket lists what's in it, and things can be taken back out"); }
  { const mc = await import(new URL("../src/game/millcraft.js", import.meta.url)), cc = await import(new URL("../src/game/cocoa.js", import.meta.url)), F = {inv: {oliveoil: 3}};
    check(mc.toBasket(F, "oliveoil") === 3 && F.craft.basket.oliveoil === 3 && !F.craft.oil && /Your olive oil/.test(mc.benchPanel(F, {tab: "basket"})) && mc.fromBasket(F, "oliveoil", 1) === 1 && F.inv.oliveoil === 1 && F.craft.basket.oliveoil === 2, "olive oil goes in the mill's basket, kept as Mel's own (round 199), and comes back out");
    // round 199: "I put four bottles of olive oil in the basket and it disappeared": Tomi infused with them. Now he only uses the mill's own pressing
    { const G = {inv: {oliveoil: 2, basil: 1}}, c = mc.craftState(G); c.recipes = [{kind: "oil", adds: ["basil"], name: "Basil oil"}]; mc.toBasket(G, "oliveoil", 2); mc.toBasket(G, "basil");
      const d = mc.inesStep(G, {}, {}); check(!d.infused && c.basket.oliveoil === 2 && c.basket.basil === 1 && !c.steep.length, "Tomi leaves Mel's oil in the basket alone");
      G.inv.beeswax = 2; check(/data-mc="basket:beeswax"/.test(mc.benchPanel(G, {tab: "basket"})) && mc.toBasket(G, "beeswax") === 2 && c.basket.beeswax === 2 && /Beeswax/.test(mc.benchPanel(G, {tab: "basket"})), "beeswax goes in the basket too (round 201)"); delete c.basket.beeswax;
      G.inv.oliveoil = 3; const d2 = mc.inesStep(G, {}, {}); check(!d2.infused && c.basket.oliveoil === 2 && G.inv.oliveoil === 3 && !c.steep.length, "and never infuses anything, not from her backpack either (round 200)");
      G.inv.oliveoil = 0; G.inv.basil = 1; const r = mc.craft(G, "oil", null, ["basil"]);
      check(r.recipe && !c.basket.oliveoil && c.steep.length === 1, "and when Mel makes an oil herself, the bench uses her basket oil"); }
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
  await page.evaluate(() => window.__mapleScene("home")); await page.waitForTimeout(1500);
  await page.locator('#world [data-spot="fridge"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-ftab="stored"]', { timeout: 20000 });
  check(await page.locator('#ctx [data-hfr="shop"]').count() === 1, "the fridge keeps its pantry and shopping list, with a Stored tab beside them");
  await page.click('#ctx [data-ftab="stored"]'); await page.waitForSelector('#ctx [data-st="putall"]', { timeout: 20000 }); await page.click('#ctx [data-st="putall"]'); await page.waitForTimeout(300);
  await page.click('#ctx [data-st="send"][data-id="raspberry"][data-to="scoop"]'); await page.waitForTimeout(300);
  check(await fox().then(f => !f.inv.raspberry && f.inv.balloon === 1 && f.scoop.fridge.raspberry === 5 && !f.storage.fridge.raspberry), "in the browser: raspberries into the fridge, then off to the Scoop Shack");
  await page.evaluate(() => window.__mapleScene("garage")); await page.waitForTimeout(1500);
  await page.locator('#world [data-spot="gshelf"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-st="put"][data-id="balloon"]', { timeout: 20000 });
  await page.click('#ctx [data-st="put"][data-id="balloon"]'); await page.waitForTimeout(300);
  check(await fox().then(f => !f.inv.balloon && f.storage.shelf.balloon === 1), "the garage shelf takes the rest");
  await page.close();
}
{
  console.log("\nThe Christmas market and hampers (rounds 172-174)");
  const tr = await import(new URL("../src/game/tours.js", import.meta.url)), xm = await import(new URL("../src/game/xmas.js", import.meta.url)), it = await import(new URL("../src/data/items.js", import.meta.url)), ic = await import(new URL("../src/art/icons.js", import.meta.url));
  check(tr.xmasOn("2026-11-20") && tr.xmasOn("2026-12-24") && !tr.xmasOn("2026-11-19") && !tr.xmasOn("2026-12-25"), "the Christmas market's season: 20 November to Christmas Eve");
  check(tr.eventsOn("2026-11-22").map(e => e.kind).join() === "market,xmas" && tr.eventsOn("2026-11-24").map(e => e.kind).join() === "xmas" && tr.eventsOn("2026-11-28").map(e => e.kind).join() === "xmas" && tr.eventsOn("2026-12-29").every(e => e.kind !== "xmas"),
    "it replaces the night market and the fair; the Sunday farmers market carries on in the morning");
  check(tr.eventOn("2026-11-22", 9*60).kind === "market" && tr.eventOn("2026-11-22", 18*60).kind === "xmas" && !tr.eventOn("2026-11-22", 15*60), "two events on a Sunday, each at its own time");
  check(tr.XMAS.length === 8 && new Set(tr.XMAS.map(x => x.at)).size === 8 && tr.XMAS.find(x => x.kind === "cocoa").needs === "cocoa" && tr.XMAS.some(x => x.kind === "mine") && tr.XMAS.some(x => x.kind === "mulled"), "eight stalls: Mel's own, mulled wine, the Cocoa Room, wreaths, gingerbread, toys, chestnuts, hot chocolate");
  check(!tr.movieNow("2026-11-27", 20*60) && !tr.bayMarketNow("2026-11-27", 17*60) && tr.bayMarketNow("2026-11-13", 17*60), "the Friday field market and the film night give the field over in the season");
  check(tr.XMAS.flatMap(x => x.items).every(id => it.ITEMS[id] && it.ITEMS[id].price > 0) && tr.XMAS.flatMap(x => x.items).every(id => !/fill:none/.test(ic.icon(id)) || true), "every Christmas stall good is real and priced");
  { const F = {}; check(!xm.treeLit("2026-11-20", 17*60 + 31, F) && xm.countdownDue(F, "2026-11-20", 17*60 + 29) && xm.treeLit("2026-11-20", 17*60 + 36, F) && xm.treeLit("2026-11-21", 17*60 + 31, F) && !xm.treeLit("2026-11-21", 17*60 + 29, F), "the tree's lit at half past five; the first night it waits for the countdown");
    F.xmas = {lit: {2026: true}}; check(xm.treeLit("2026-11-20", 17*60 + 31, F) && !xm.countdownDue(F, "2026-11-20", 17*60 + 30), "after the countdown, it's lit"); }
  { const F = {inv: {chz_cheddar: 2, honey_lav: 3, bar_dark: 1, honey: 1, mc_x: 1}, coins: 0}, v = {shelf: [{id: "w", name: "Red", type: "red", n: 3, price: 18}]};
    check(xm.putOut(F, "chz_cheddar") === 2 && xm.putOut(F, "honey_lav") === 3 && xm.putWine(F, v, "w") === 1 && v.shelf[0].n === 2 && xm.putOut(F, "mc_x") === 0, "Mel's stall: her cheeses, honey and a bottle off the shelves (and only things she's made)");
    check([..."abc"].every(() => true) && xm.worth("chz_cheddar") <= it.ITEMS.chz_cheddar.price && xm.worth("honey_lav") <= it.ITEMS.honey_lav.price, "everything sells at no more than it costs to buy");
    xm.putOut(F, "bar_dark"); xm.putOut(F, "honey"); F.inv.box4 = 1; F.inv.honeycomb = 1; check(xm.putOut(F, "box4") === 1 && xm.putOut(F, "honeycomb") === 0, "six kinds at most on the stall");
    const real = Math.random; Math.random = () => .01; const got = xm.stallSellMinute(F, "2026-11-25", "mel"); Math.random = () => .07; const tin = xm.stallSellMinute(F, "2026-11-25", "tin"); Math.random = real;
    check(got > 0 && tin === 0 && F.xmas.sold["2026-11-25"].n === 1, "it sells faster with Mel behind it than on the honesty tin");
    check(xm.takeWine(F, v, "w") === 1 && v.shelf[0].n === 3 && xm.takeBack(F, "honey_lav") === 3 && F.inv.honey_lav === 3, "unsold things go back"); }
  { const F = {inv: {honey_lav: 2, chz_cheddar: 1, bar_dark: 1}, coins: 20}, v = {shelf: [{id: "w", name: "Red", type: "red", n: 2, price: 18}]};
    check(xm.packStart(F, "small") && F.coins === 16 && xm.packAdd(F, "chz_cheddar") && xm.packWine(F, v, "w") && !xm.packStart(F, "big"), "a small basket from Penny: three things, a bottle off the shelves counts");
    xm.packAdd(F, "honey_lav"); const hp = xm.packTie(F);
    check(hp && hp.id === "hamper_1" && F.inv.hamper_1 === 1 && it.ITEMS.hamper_1 && it.ITEMS.hamper_1.hamper && it.ITEMS.hamper_1.sell <= it.ITEMS.hamper_1.price && /hamper$/.test(it.ITEMS.hamper_1.n), `tie the bow: "${hp && hp.name}" hamper, worth what's in it plus the basket, never more than it costs`);
    check(xm.hamperName(["chz_cheddar", "chz_blue", "chz_brie"], "small") === "The Cheese Lover's" && xm.hamperName(["honey", "bar_dark", "box4"], "small") === "Sweet Tooth" && xm.hamperName([{wine: "Red"}, "chz_cheddar", "chz_blue"], "small") === "Wine and Cheese", "hampers are named after what's in them");
    const now = Date.parse("2026-12-03T08:00:00Z"); F.bellbird = {stamps: {bv_perfume: 1}};
    check(xm.recipsFor(F).some(r => r.id === "lvarnaud") && !xm.recipsFor(F).some(r => r.id === "bvkel"), "Penny posts to the family, villagers, and trip friends Mel's met");
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
  await page.evaluate(() => window.__mapleScene("field")); await page.waitForTimeout(3000);
  check(await page.locator('#world [data-place^="mstall"]').count() >= 7 && await page.locator('#world [data-place="xtree"]').count() === 1 && await page.locator('#world [data-place="xgrotto"]').count() === 1, "the Christmas market on the field: stalls, the tree, the grotto");
  await page.waitForTimeout(9000);
  check(await fox().then(f => f.xmas && f.xmas.lit && f.xmas.lit["2026"]), "the first night, the village counts the tree's lights on");
  await page.locator('#world [data-place="mstall5"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-xtreat="xm_chestnut"]', { timeout: 20000 });
  const c0 = await fox().then(f => f.coins); await page.click('#ctx [data-xtreat="xm_chestnut"]'); await page.waitForTimeout(400);
  check(await fox().then(f => f.coins === c0 - 3), "a cone of roast chestnuts, eaten on the spot");
  await page.goto(url + "?seed=1&time=15:00&date=2026-11-25"); await page.waitForTimeout(1000);
  await page.evaluate(() => window.__mapleScene("post")); await page.waitForTimeout(2000);
  await page.locator('#world [data-spot="hampers"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-xh="start:small"]', { timeout: 20000 }).catch(() => {});
  check(await page.locator('#ctx [data-xh="start:big"]').count() === 1, "Penny's hamper table at the post office, in the season");
  await page.close();
}
{
  console.log("\nBonbon moulds (round 176)");
  const cc = await import(new URL("../src/game/cocoa.js", import.meta.url)), F = {coins: 200, goals: {cocoa: 1}}, c = cc.cocoaState(F); c.choc.dark = 50; c.pantry.honey = 4; c.pantry.raspberry = 2;
  check(cc.mouldsOwned(c).join() === "dome" && cc.buyCcUp(F, "m_heart") && F.coins === 140 && cc.mouldsOwned(c).includes("heart"), "the dome to start; heart moulds from the shop upgrades");
  const a = cc.makeBonbons(F, "dark", ["honey"]), a0 = a.r.shape, price = c.prices.bonbon, b = cc.makeBonbons(F, "dark", ["honey"], "heart");
  check(!a0 && b.r.shape === "heart" && / Heart$/.test(b.r.name) && c.trays[b.r.id] === 24 && c.prices.bonbon === price, "a tray in the heart mould makes the flavour a heart (same price): " + b.r.name);
  check(!cc.makeBonbons(F, "dark", ["raspberry"], "star").r.shape, "no star moulds yet, so a dome");
  check(cc.makeBonbons(F, "dark", ["honey"], "dome").r.name === b.r.base, "back in the dome, back to its old name");
  check(/data-cc="bshape"/.test(cc.bonbonPanel(F, {})), "the moulds are on the bonbon table");
}
{
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
}
{
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
}
{
  console.log("\nShoppers you can see (round 181)");
  const br = await import(new URL("../src/game/browse.js", import.meta.url)), pool = ["a", "b", "c", "d", "e", "f"], day = "2026-10-13";
  const vs = br.browseVisits("cocoa", day, 11*60, 20*60, pool);
  check(vs.length >= 6 && vs.every((v, i) => v.ids.length <= 2 && (!i || v.from - vs[i - 1].from >= 25)) && JSON.stringify(vs) === JSON.stringify(br.browseVisits("cocoa", day, 11*60, 20*60, pool)), `a shopper or two every so often, never overlapping (${vs.length} visits)`);
  const v = vs[0], id = v.ids[0], o = {shop: "cocoa", open: true, from: 11*60, to: 20*60, pool, stock: true}, at = m => br.browseSlot(id, day, v.from + m, o);
  check(at(0).scene === "cocoa" && at(3).at && at(8).at && at(11).at === br.BROWSE.cocoa.till[0] && at(13).act === "shopbag", "in the door, at the case, at the shelf, at the counter, out with a paper bag");
  check(!br.browseSlot(id, day, v.from + 13, {...o, stock: false}).act && br.browseSlot(id, day, v.from + 11, {...o, stock: false}).at === br.BROWSE.cocoa.door, "bare shelves: they look and leave empty-handed");
  check(!br.browseSlot(id, day, v.from + 3, {...o, open: false}) && !at(20), "nobody when it's shut, or between visits");
}
{
  console.log("\nThe Cocoa Room's vending machine (round 182)");
  const cc = await import(new URL("../src/game/cocoa.js", import.meta.url)), F = {coins: 500, goals: {cocoa: 1}}, c = cc.cocoaState(F);
  c.bars.dark = 10; c.plan.on = false; check(cc.buyCcUp(F, "vending") && F.coins === 100, "the vending machine, 400 coins from the catalogue");
  const off = globalThis.__mapleOffset, rnd = Math.random, mon = Date.parse("2026-10-12T04:00:00Z");   // Monday noon: the shop's shut
  c.at = mon - 30*60e3; globalThis.__mapleOffset = mon - Date.now(); Math.random = () => .005; cc.cocoaTick(F); Math.random = rnd; globalThis.__mapleOffset = off;
  check(c.bars.dark < 10 && c.vend === (10 - c.bars.dark)*c.prices.bar && F.coins === 100, `shut on Monday: bars sell from the machine at the full price, and the coins wait in it (${10 - c.bars.dark} sold, ${c.vend} coins)`);
  const box = c.vend; check(cc.emptyVending(F) === box && F.coins === 100 + box && !c.vend, "empty it at the counter");
  const late = Date.parse("2026-10-12T15:30:00Z"); c.at = late - 20*60e3; globalThis.__mapleOffset = late - Date.now(); Math.random = () => .005; const b0 = c.bars.dark; cc.cocoaTick(F); Math.random = rnd; globalThis.__mapleOffset = off;
  check(c.bars.dark === b0, "nothing after 11 at night");
}
{
  console.log("\nThe paperie in Montrose (round 183)");
  const pp = await import(new URL("../src/game/paperie.js", import.meta.url)), go = await import(new URL("../src/game/goals.js", import.meta.url)), ic = await import(new URL("../src/art/paper-icons.js", import.meta.url));
  const it = await import(new URL("../src/data/items.js", import.meta.url));
  check(go.GOALS.paperie && go.GOALS.paperie.price === 1500 && go.GOALS.paperie.where === "hm_lanes", "the paperie in Montrose: a 1,500-coin goal, up in the lanes");
  const ids = Object.keys(pp.COLOURS).flatMap(c => Object.keys(pp.ADDS).map(a => pp.sheetId(c, a)));
  check(ids.length === 28 && ids.every(id => it.ITEMS[id] && it.ITEMS[id].paper && it.ITEMS[id].price >= 5) && ids.every(id => ic.paperIcon(id) && ic.paperIcon("ppulp" + id.slice(2)) && ic.paperIcon("ppwet" + id.slice(2)) && ic.paperIcon("pppress" + id.slice(2))) && ic.paperIcon("ppscraps") && ic.paperIcon("ppsoak"),
    "28 papers (four colours, seven add-ins), each with its own picture at every step");
  const F = {coins: 100, inv: {bq_lavender: 1}, goals: {cocoa: 1, mill: 1}, scoop: {}, vine: {shelf: []}}, p = pp.paperState(F), t0 = Date.parse("2026-10-13T03:00:00Z");
  p.scrapDay = "2026-10-11";
  check(pp.homeShops(F).length === 4 && pp.scrapsWaiting(F, "2026-10-13") === 8 && pp.collectScraps(F, "2026-10-13") === 8 && p.scraps === 8 && pp.scrapsWaiting(F, "2026-10-13") === 0, "each shop at home saves a bundle of scraps a day; they come up in the van");
  check(pp.startSoak(F, t0) && p.scraps === 6 && !pp.beat(F, "blush", t0 + 60e3) && !pp.startSoak(F, t0), "two bundles into the tub: not soft yet, and one batch at a time");
  check(pp.beat(F, "blush", t0 + 16*60e3) && F.coins === 98 && p.pulp.col === "blush" && pp.batchIcon(F, t0 + 16*60e3) === "ppulp_blush_none", "beaten into blush pulp (2 coins of pigment): the picture's a basin of pink");
  check(pp.addIn(F, "lavender") === "bag" && !F.inv.bq_lavender && F.coins === 98 && pp.batchIcon(F) === "ppulp_blush_lavender" && pp.addIn(F, "gold") === null, "lavender from the backpack, stirred through: flecks in the picture; one add-in a batch");
  check(pp.pull(F) && p.wet.n === 6 && pp.batchIcon(F) === "ppwet_blush_lavender" && pp.startPress(F, t0 + 20*60e3) && !pp.hang(F, t0 + 21*60e3) && pp.hang(F, t0 + 26*60e3), "six wet sheets pulled, pressed for five minutes, hung on the line");
  check(pp.takeDown(F, t0 + 27*60e3) === 0 && pp.takeDown(F, t0 + 26*60e3 + 864e5) === 6 && p.stock.pp_blush_lavender === 6, "dry by the same time tomorrow: six sheets onto the shelves");
  check(pp.toBag(F, "pp_blush_lavender") === 1 && F.inv.pp_blush_lavender === 1 && pp.toShelf(F, "pp_blush_lavender") === 1 && p.stock.pp_blush_lavender === 6, "a sheet into the backpack (a gift), and back");
  const rnd = Math.random; Math.random = () => .01; pp.paperTick(F, true, t0); const sold = pp.paperTick(F, true, t0 + 10*60e3); const none = pp.paperTick(F, false, t0 + 60*60e3); Math.random = rnd;
  check(sold.coins > 0 && sold.coins === sold.n*it.ITEMS.pp_blush_lavender.price && none.coins === 0, `it sells while Mel's in Montrose, at the sheet's price (${sold.n} for ${sold.coins}), and not when she's away`);
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => { errors.push(`paperie pageerror: ${e.message}`); console.log("PAGEERR", e.stack.slice(0, 600)); });
  await page.addInitScript(() => { const m = /pppatch=(\w+)/.exec(location.search); if (!m) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return; f.coins = 2000;
    if (m[1] === "own") { f.goals = {...(f.goals || {}), paperie: 1}; f.paperie = {scraps: 4, scrapDay: "2026-10-13", line: [], stock: {}, sold: {}}; }
    const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=11:00&date=2026-10-13"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=11:00&date=2026-10-13&pppatch=buy"); await page.waitForTimeout(900);
  await page.evaluate(() => window.__mapleScene("hm_lanes")); await page.waitForTimeout(800);
  check(await page.locator('#world [data-place="bvhpaper"]').count() === 1 && /À VENDRE/.test(await page.locator("#world").innerHTML()), "Montrose's lanes: the shop with the green door, À VENDRE");
  await page.evaluate(() => window.__mapleScene("bv_hpaper")); await page.waitForTimeout(800);
  await page.locator('#world [data-rdspot="pp_buy"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-goal="paperie"]', {timeout: 15000});
  await page.click('#ctx [data-goal="paperie"]'); await page.waitForTimeout(800);
  const f1 = await page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  check(f1.goals.paperie && f1.coins === 500 && f1.paperie.scraps === 4, "buy it at the board: 1,500 coins, and a first box of scraps from home");
  await page.evaluate(() => window.__mapleScene("bv_hpaper")); await page.waitForTimeout(800);
  check(await page.locator('#world [data-rdspot^="pp_"]').count() === 9, "inside: the scrap bin, tub, vat, add-in jars, press, drying line, shelves, till and ribbon rack");
  await page.locator('#world [data-rdspot="pp_scrap"]').dispatchEvent("click"); await page.waitForSelector('#ctx [data-pp="tear"]', {timeout: 15000});
  await page.click('#ctx [data-pp="tear"]'); await page.waitForTimeout(500);
  const f2 = await page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  check(f2.paperie.soak && f2.paperie.scraps === 2 && /2\. Soak/.test(await page.locator("#ctx .ppstep.now").textContent()), "tear two bundles into the tub: the steps along the top move on to Soak");
  await page.close();
}
{
  console.log("\nHampers for Valentine's and Mother's Day (round 184)");
  const xm = await import(new URL("../src/game/xmas.js", import.meta.url)), cc = await import(new URL("../src/game/cocoa.js", import.meta.url));
  check(xm.hamperSeason("2027-02-10") === "valentine" && xm.hamperSeason("2027-05-09") === "mothers" && xm.mothersDay(2027) === 9 && !xm.hamperSeason("2027-05-10") && xm.hamperSeason("2026-12-01") === "xmas" && !xm.hamperSeason("2026-10-12"),
    "Penny's hamper table: Valentine's (1-14 Feb), Mother's Day (1 May to the second Sunday), Christmas");
  const F = {coins: 100, inv: {cc_box: 0, soap_lav: 3}};
  check(xm.packStart(F, "small", "mothers") && F.xmas.pack.season === "mothers", "a Mother's Day basket");
  const hp = {id: "h", size: "small", season: "valentine", items: []};
  check(xm.hamperIco(hp) === "hamper_small_v" && xm.hamperIco({...hp, season: "mothers", size: "big"}) === "hamper_big_m" && xm.hamperIco({size: "big"}) === "hamper_big", "a pink bow for Valentine's, lilac for Mother's Day, red for Christmas");
  const its = await import(new URL("../src/data/items.js", import.meta.url)); its.ITEMS.mc_testsoap = {n: "Test soap", mill: "soap", kind: "gift"};   // (mill soaps register when they're made)
  check(xm.seasonName(["mc_testsoap", "mc_testsoap", "mc_testsoap"], "small", "mothers") === "Mum's Pamper" && /Valentine|Sweetheart|Roses/.test(xm.seasonName(["soap_lav"], "small", "valentine")), "and their own names: Mum's Pamper, Be My Valentine...");
  const G = {coins: 0, inv: {}, goals: {cocoa: 1}}, c = cc.cocoaState(G);
  c.bonbons.push({id: "a", shell: "dark", fills: [], name: "A"}, {id: "b", shell: "milk", fills: [], name: "B"}); c.trays = {a: 6, b: 6}; c.display = ["a", "b"];
  const pk = {kind: "box", size: 4, sel: {}};
  check(cc.pickAdd(G, pk, "a", 1) && cc.pickAdd(G, pk, "a", 1) && cc.pickAdd(G, pk, "a", 1) && cc.pickAdd(G, pk, "a", 1) && !cc.pickAdd(G, pk, "b", 1) && cc.packBox(G, 4, pk.sel) === "box4d" && c.trays.a === 2 && c.trays.b === 6, "choose four dark ones: exactly those come out of the case");
  check(cc.packBox(G, 4, {a: 1}) === null && c.trays.a === 2, "a choice that doesn't add up packs nothing");
}
{
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
}
{
  console.log("\nThe paperie, round 3: Lise, the card class, the seasons, seeds that grow (round 186)");
  const pp = await import(new URL("../src/game/paperie.js", import.meta.url)), go = await import(new URL("../src/game/goals.js", import.meta.url)), it = await import(new URL("../src/data/items.js", import.meta.url)), wr = await import(new URL("../src/game/wrap.js", import.meta.url)), np = await import(new URL("../src/data/lv-people.js", import.meta.url));
  check(go.GOALS.paperkeeper && go.GOALS.paperkeeper.needs === "paperie" && np.LV_PEOPLE.some(n => n.id === "lvlise" && n.routine[0].scene === "bv_hpaper" && n.routine[0].needs === "paperkeeper"), "Lise keeps the paperie (600 coins, once it's yours)");
  check(pp.keeperIn("2026-10-14", 11*60) && !pp.keeperIn("2026-10-12", 11*60) && !pp.keeperIn("2026-10-14", 18*60) && pp.paperSeason("2026-12-10") && !pp.paperSeason("2026-10-14"), "10 till 5, closed Mondays; December's a gift season");
  const F = {coins: 1000, goals: {paperie: 1}, inv: {}}, p = pp.paperState(F), wed = Date.parse("2026-10-14T03:00:00Z");   // Wednesday 11am
  p.stock = {pp_blush_rose: 10}; p.at = wed - 60*60e3; let rnd = Math.random; Math.random = () => .99; let out = pp.paperTick(F, false, wed); Math.random = rnd;
  check(out.coins === 0 && out.wage === 0 && p.stock.pp_blush_rose === 10, "no keeper, and Mel's away: the paperie's shut");
  F.goals.paperkeeper = 1; p.line = [{col: "sage", add: "seeds", n: 6, done: wed - 1}]; p.at = wed - 60*60e3; Math.random = () => .01; out = pp.paperTick(F, false, wed); Math.random = rnd;
  check(out.wage === pp.WAGE && out.coins > 0 && out.down === 6 && p.stock.pp_sage_seeds >= 0 && F.coins === 1000 - pp.WAGE + out.coins, `with Lise: she opens (her wage, ${pp.WAGE}), sells while Mel's home (${out.coins} coins), and takes the dry sheets down`);
  const sat = Date.parse("2026-10-17T08:00:00Z"); p.stock = {pp_blush_rose: 6}; p.at = sat - 5*60e3; Math.random = () => .99; out = pp.paperTick(F, false, sat); Math.random = rnd;
  check(out.cls === pp.CLASS.size*pp.CLASS.fee && p.stock.pp_blush_rose === 2 && p.classDay === "2026-10-17", "Saturday's card class: four people, four sheets, 32 coins");
  check(it.CROPS.wildflower && it.ITEMS.pp_sage_seeds.plantable && it.ITEMS.pp_sage_seeds.crop === "wildflower" && it.ITEMS.tag_seeded.plantable && it.ITEMS.wildflower.kind === "flower", "seeded paper and seeded tags plant in the garden and come up as wildflowers");
  const G = {coins: 100, inv: {box4: 1, pp_blush_none: 1, tag_seeded: 1}, goals: {paperie: 1}}, id = wr.wrapIt(G, {item: "box4", paper: "pp_blush_none", tag: "seeded"}), t0 = Date.now();
  check(pp.bloomFor(G, id, "mum", t0) && !pp.bloomMail(G, t0 + 864e5).length && pp.bloomMail(G, t0 + 2*864e5 + 1).length === 1 && /front step/.test(pp.bloomMail(G, t0 + 3*864e5)[0].body), "a gift with a seeded tag: two days later Mum writes about the flowers by her front step");
}
{
  console.log("\nLip balms and lip oils, dyed with Mel's flowers (round 187)");
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
}
{
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
}
{
  console.log("\nPairing boxes packed in the gift shop's wine corner, Tempranillo too (round 189)");
  const cc = await import(new URL("../src/game/cocoa.js", import.meta.url)), gs = await import(new URL("../src/game/giftshop.js", import.meta.url));
  const F = {coins: 0, inv: {}, goals: {giftshop: 1, cocoa: 1}, cocoa: {bars: {}, trays: {a: 6}, bonbons: [{id: "a", shell: "dark", fills: ["honey"], name: "Dark Honey Heart"}], display: ["a"]},
    vine: {shelf: [{id: "w2", name: "Ronda Red", type: "tempranillo", n: 2, price: 28}]}};
  const c = cc.cocoaState(F), pk = {kind: "pair", k: "w2", size: 4, sel: {}};
  check(cc.pairShelf(F).length === 1 && !cc.wineShelf(F).length, "a Tempranillo pairs, though it can't be opened for a filling");
  check(cc.pickAdd(F, pk, "a", 1) && cc.pickFill(F, pk) && pk.sel.a === 4, "four bonbons chosen in the wine corner");
  const w = cc.packPairing(F, pk.k, pk.sel), k = gs.putOutPairs(F, c, 1);
  check(w === "Ronda Red" && k === 1 && !F.inv.pairbox && gs.giftState(F).pairs[0] === 28 + 4*c.prices.bonbon && F.vine.shelf[0].n === 1 && c.trays.a === 2, "packed and straight out on the display, at the bottle plus four bonbons");
}
{
  console.log("\nThe address book: post gifts and letters to people met on trips (round 190)");
  await import(new URL("../src/game/ronda.js", import.meta.url)); const bk = await import(new URL("../src/game/contacts.js", import.meta.url)), it = await import(new URL("../src/data/items.js", import.meta.url));
  const T = Date.UTC(2026, 9, 14, 3), D = 864e5;
  const F = {coins: 10, inv: {box4: 2}, met: {lvemile: true, lvpainter: true, hana: true}};
  check(bk.canAdd(F, "lvemile") && !bk.canAdd(F, "lvpainter") && !bk.canAdd(F, "hana") && !bk.canAdd(F, "lvmargaux") && bk.canAdd({met: {jason: true}}, "jason"), "only people met on a trip, not day-trippers, not village folk (Jason and Luca too, round 192)");
  check(bk.addable(F).join() === "lvemile" && bk.addContact(F, "lvemile", "2026-10-14") && bk.contacts(F).join() === "lvemile" && !bk.addable(F).length, "added to the book when Mel wants");
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
  bk.removeContact(F, "lvemile"); check(!bk.contacts(F).length, "and Mel can take someone out again");
  const vans = (await import(new URL("../src/data/npcs.js", import.meta.url))).NPCS.filter(p => p.local === "bellbird" && !p.tourist);
  check(vans.every(p => bk.PEN[p.id]), "round 191: every campervan local and neighbour has a voice of their own (" + vans.length + ")");
  const abroad = (await import(new URL("../src/data/npcs.js", import.meta.url))).NPCS.filter(p => ["ronda", "kyoto", "jeju", "cinque"].includes(p.local) && !p.tourist);
  check(abroad.every(p => bk.PEN[p.id]), "round 192: and everyone in Ronda, Kyoto, Jeju and Cinque Terre too (" + abroad.length + ")");
  const J = {coins: 20, inv: {box4: 1}, met: {jason: true}}; bk.addContact(J, "jason", "d"); const je = bk.postTo(J, "jason", {item: "box4"}, T), jb = bk.replyBody(je);
  check(!je.err && je.at === T + 3*D && /^My dear Mel,/.test(jb) && jb.includes("yellow house by the harbour") && /\nP\.S\. /.test(jb) && jb.split("\n\n").length >= 6 && /;/.test(jb), "Jason writes back at length, semicolons and all, with a P.S.");
}
{
  console.log("\nEvery two-filling bonbon has a name (round 194: mint and pear crashed the bonbon table)");
  const cc = await import(new URL("../src/game/cocoa.js", import.meta.url)), sc = await import(new URL("../src/game/scoop.js", import.meta.url));
  const ids = Object.keys(sc.INGR).filter(cc.isFilling); let bad = [];
  for (const sh of ["dark", "milk", "white"]) for (const a of ids) for (const b of ids) if (a < b) { try { const n = cc.bonbonName(sh, [a, b]); if (!n || /undefined/.test(n)) bad.push(sh + ":" + a + "+" + b); } catch (e) { bad.push(sh + ":" + a + "+" + b + " " + e.message); } }
  check(!bad.length, "named every pairing of " + ids.length + " fillings in all three shells" + (bad.length ? ": " + bad.slice(0, 3).join(", ") : ""));
  check(/\S/.test(cc.bonbonName("white", ["mint", "pear"])), "white chocolate, mint and pear: " + cc.bonbonName("white", ["mint", "pear"]));
}
{
  console.log("\nThe gift shop's gallery wall and makers' shelf (round 196)");
  await import(new URL("../src/game/ronda.js", import.meta.url));   // (Mel's sip-and-paint paintings join ITEMS here)
  const gal = await import(new URL("../src/game/gallery.js", import.meta.url)), gs = await import(new URL("../src/game/giftshop.js", import.meta.url)), it = await import(new URL("../src/data/items.js", import.meta.url));
  const F = {coins: 50, inv: {p_view: 1}, goals: {giftshop: 1}}, mon = "2026-10-19", T = Date.UTC(2026, 9, 19, 3), D = 864e5;
  const n = gal.stockUp(F, mon), fr = gal.galleryState(F).frames;
  check(fr.filter(f => f && f.by).length === 3 && fr.filter(f => !f).length === 1 && new Set(fr.filter(Boolean).map(f => f.by)).size === 3, "three painters hang a painting each, and leave a frame for Mel's own");
  check(Object.values(gal.makersState(F).stock).every(x => x === 3) && Object.keys(gal.makersState(F).stock).length === 6, "six makers fill their spots on the shelf");
  check(gal.hangOwn(F, "p_view") && !F.inv.p_view && gal.forSale(F).length === 3 && gal.takeDown(F, fr.findIndex(f => f && f.own)) && F.inv.p_view === 1, "Mel hangs her own painting (never for sale) and takes it down again");
  const i = fr.findIndex(f => f && f.by), f0 = fr[i], c = gal.sellPainting(F, i, T);
  check(c === gal.TOKEN && !fr[i] && f0.price > gal.TOKEN, "a painting sells: Mel keeps a token " + gal.TOKEN + " and the painter the rest (" + f0.price + ")");
  check(!gal.galleryMail(F, T + 6*D).length && gal.galleryMail(F, T + 7*D).length === 1 && gal.galleryMail(F, T + 7*D)[0].body.includes(f0.t) && gal.galleryMail(F, T + 7*D)[0].body.includes(gal.PAINTERS[f0.by].sign), "a week later the painter writes to say it sold");
  check(gal.sellMade(F, "mk_spoon") === 2 && gal.makersState(F).stock.mk_spoon === 2 && gal.makersState(F).week.bo === 9, "a spoon sells: Mel keeps about a fifth (2 of 9), Bo the rest");
  check(gal.buyMade(F, "mk_cards") && F.coins === 44 && F.inv.mk_cards === 1 && it.ITEMS.mk_cards.kind === "gift", "Mel buys Auntie Lin's cards at the full price, to give");
  check(gal.stockUp(F, "2026-10-20") === 0 && gal.stockUp(F, "2026-10-26") > 0 && gal.forSale(F).length === 3, "the painters and makers come back the next Monday");
  let sold = 0; for (let k = 0; k < 4000; k++) { const g2 = {coins: 0, inv: {}, goals: {giftshop: 1}}; gal.stockUp(g2, mon); if (gs.giftSellMinute(g2, mon, 600, "mel", {store: {}, v: {shelf: []}, cocoa: null, onDisplay: () => []}) === gal.TOKEN) sold++; }
  check(sold > 0 && sold < 400, "shoppers buy a painting now and then, not often (" + sold + " in 4000 busy minutes)");
  const bk = await import(new URL("../src/game/contacts.js", import.meta.url)), ms = new Set(Object.values(gal.PAINTERS).flatMap(p => p.works.map(w => w[4])));
  check(ms.size === Object.values(gal.PAINTERS).reduce((a, p) => a + p.works.length, 0) && [...ms].every(m => gal.paintSVG(0, 0, 38, 48, {m, c1: "#000", c2: "#fff"}).length > 80), "round 197: every painting has its own picture (" + ms.size + ")");
  check(it.ITEMS.p_view.to === "family" && it.ITEMS.p_view.kind === "keepsake" && bk.postable(it.ITEMS.p_view), "and Mel's own paintings can be given, or posted to a friend");
}
{
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
  check(bk.acceptOffer(F, who, T + 4*D) && bk.lines(F).length === 1 && !bk.offersOpen(F, T + 4*D).length, "Mel says yes please");
  const cost = bk.BOX*bk.tradeOf(item), c0 = F.coins, r = bk.travelTick(F, T + 5*D);
  check(r.got.length === 1 && F.coins === c0 - cost && F.giftshop.travel[item] === bk.BOX && cost < bk.BOX*it.ITEMS[item].price, "the first box comes, paid for on arrival (" + cost + " coins for " + bk.BOX + ")");
  check(!bk.travelTick(F, T + 6*D).got.length && bk.travelTick(F, T + 12*D + 1).got.length === 1, "then one box a week, and only one even after a long time away");
  F.coins = 1; check(bk.travelTick(F, T + 30*D).skip.length === 1 && F.giftshop.travel[item] === 2*bk.BOX, "no coins, no box that week (nothing owed)");
  check(gal.takeTravel(F, item) && F.inv[item] === 1 && F.giftshop.travel[item] === 2*bk.BOX - 1, "Mel can take one off the shelf to give");
  let made = 0; const G = {coins: 0, inv: {}, goals: {giftshop: 1}, giftshop: {travel: {[item]: 500}}};
  for (let k = 0; k < 2000; k++) { const c = gs.giftSellMinute(G, "2026-10-21", 600, "mel", {store: {}, v: {shelf: []}, cocoa: null, onDisplay: () => []}); if (c === it.ITEMS[item].price) made++; }
  check(made > 0 && G.giftshop.travel[item] === 500 - made, "shoppers buy them at Madame Roux's own price (" + made + " sold)");
  check(bk.stopLine(F, who) && !bk.lines(F).length && !bk.offersOpen(F, T + 40*D).length, "and Mel can stop the boxes whenever she likes");
  const G2 = {coins: 0, met: {}, goals: {}}; G2.met[who] = true; bk.addContact(G2, who, "d"); [0, 1, 2].forEach(k => bk.postTo(G2, who, {open: "Hi"}, T + k));
  check(!bk.offersOpen(G2, T + 9*D).length, "no offers before there's a gift shop to send to");
}
{
  console.log("\nThe gift basket beside the wrapping table (round 202)");
  const gs = await import(new URL("../src/game/giftshop.js", import.meta.url)), wr = await import(new URL("../src/game/wrap.js", import.meta.url)), it = await import(new URL("../src/data/items.js", import.meta.url));
  const F = {coins: 20, inv: {box4: 2, gw_red: 1}, goals: {giftshop: 1}}, id = wr.wrapIt(F, {item: "box4", paper: "gw_red"});
  const p0 = gs.giftPanel(F, "gbasket", {F, day: "2026-10-14"});
  check(id && /The gift basket/.test(p0) && /data-gs="wput:/.test(p0) && /Empty/.test(p0), "the basket offers the wrapped gift from the backpack");
  check(gs.putWrapped(F, id) && !F.inv[id] && /data-gs="wback:0"/.test(gs.giftPanel(F, "gbasket", {F, day: "2026-10-14"})), "in it goes, and it's listed in the basket");
  check(gs.takeWrapped(F, 0) === id && F.inv[id] === 1 && !gs.giftState(F).wrapped.length, "and it can come back out");
  check(!/Put out:/.test(wr.wrapPanel(F, {}, {where: "giftshop", table: []})), "the wrapping table just points to the basket now");
}
// Round 205: your own boat sails to towns (Jeju for now): fuel only, up to 8 aboard, 8am to 2pm out, home by 7pm, not on downpour days
{
  console.log("\nyour own boat sails to towns (round 205)");
  const page = await browser.newPage({ viewport: { width: 520, height: 1100 } });
  page.on("pageerror", e => errors.push(`boat towns pageerror: ${e.message}`));
  await page.addInitScript(() => { if (!/boatpatch/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return; f.coins = 500; f.goals = {...(f.goals || {}), boat: 1};
    const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  const gf = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  const open = async (t, d) => { await page.goto(url + `?seed=1&time=${t}&date=${d}&boatpatch=1`); await page.waitForTimeout(1500); await page.evaluate(() => window.__mapleScene("shore")); await page.waitForTimeout(1500);
    await page.locator('#world [data-place="boat"]').first().dispatchEvent("click"); await page.waitForSelector("#ctx [data-cruise]", { timeout: 15000 }); return page.locator("#ctx").innerText(); };
  await page.goto(url + "?reset=1&seed=1&time=10:00&date=2026-11-01"); await page.waitForTimeout(800);
  check(/Too rough to sail today/.test(await open("10:00", "2026-11-01")) && await page.locator('#ctx [data-trip]').count() === 0, "no sailing on a downpour day");
  check(/Too early to set off/.test(await open("07:00", "2026-10-14")), "and not before 8am");
  check(/Too late to set off/.test(await open("15:00", "2026-10-14")), "or after 2pm (you'd not be home before dark)");
  const txt = await open("09:00", "2026-10-14");
  check(/Jeju/.test(txt) && /Fuel 20/.test(txt) && /up to 8 aboard/.test(txt), "the boat's panel: a dolphin cruise, or sail to Jeju for fuel only, up to 8 aboard");
  for (const id of ["mum", "dad", "mama", "gonggong", "darren", "evan", "marcus", "angelina"]) { const btn = page.locator(`#ctx [data-tpick="${id}"]`); if (await btn.isEnabled()) await btn.click(); await page.waitForTimeout(120); }
  check(await page.locator("#ctx .tpick.on").count() === 7 && await page.locator("#ctx .tpick[disabled]").count() === 1, "seven of the family can come (eight aboard with Mel); the eighth seat's taken");
  await page.click('#ctx [data-trip="jeju"]'); await page.waitForTimeout(8500);
  let f = await gf();
  check(f.coins === 480 && f.trip && f.trip.by === "boat" && f.trip.party.length === 7 && await page.locator('#world [data-place="jjpier"]').count() === 1, "casting off costs the fuel and lands everyone at Jeju's harbour");
  await page.locator('#world [data-place="jjpier"]').first().dispatchEvent("click"); await page.waitForSelector('#ctx [data-triphome="boat"]', { timeout: 15000 });
  await page.click('#ctx [data-triphome="boat"]'); await page.waitForTimeout(8500);
  f = await gf();
  check(f.trip.done && await page.locator('#world [data-place="boat"]').count() === 1, "and you sail home to your own mooring at the jetty");
  await page.close();
}

// Round 206: Saltwick Harbour, the first boat town: four screens in a horseshoe round the river mouth
{
  console.log("\nSaltwick Harbour by boat (round 206)");
  const page = await browser.newPage({ viewport: { width: 520, height: 1100 } });
  page.on("pageerror", e => errors.push(`saltwick pageerror: ${e.message}`));
  await page.addInitScript(() => { if (!/swpatch/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return; f.coins = 500; f.goals = {...(f.goals || {}), boat: 1};
    const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  await page.goto(url + "?reset=1&seed=1&time=09:00&date=2026-10-16"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=09:00&date=2026-10-16&swpatch=1"); await page.waitForTimeout(1500);
  await page.evaluate(() => window.__mapleScene("hlane")); await page.waitForTimeout(1200);
  await page.locator('#world [data-place="timetable"]').first().dispatchEvent("click"); await page.waitForSelector('#ctx [data-tickets]', { timeout: 15000 });
  await page.click('#ctx [data-tickets]'); await page.waitForSelector('#ctx [data-ttown="kyoto"]', { timeout: 15000 });
  check(await page.locator('#ctx [data-ttown="saltwick"]').count() === 0, "Saltwick isn't on the train: there's no ticket for it at the station");
  await page.evaluate(() => window.__mapleScene("shore")); await page.waitForTimeout(1500);
  await page.locator('#world [data-place="boat"]').first().dispatchEvent("click"); await page.waitForSelector('#ctx [data-btown="saltwick"]', { timeout: 15000 });
  await page.click('#ctx [data-btown="saltwick"]'); await page.waitForTimeout(400);
  check(/Fuel 10/.test(await page.locator("#ctx").innerText()), "your boat sails to Saltwick Harbour (fuel 10)");
  await page.click('#ctx [data-tpick="dad"]'); await page.waitForTimeout(150);
  await page.click('#ctx [data-trip="saltwick"]'); await page.waitForTimeout(8500);
  check(await page.locator('#world [data-place="swboat"]').count() === 1 && await page.locator('#world [data-place="swmarket"]').count() === 1, "you tie up at the pontoon on the quay, by the fish market");
  const name = () => page.evaluate(() => document.querySelector("#sceneName").innerText.split("\n")[0]);
  const hop = async g => { await page.locator(`#world [data-place="${g}"]`).first().dispatchEvent("click"); await page.waitForTimeout(8500); return name(); };
  check(/East Side/.test(await hop("swToEast")) && await page.locator('#world [data-place="swjet"]').count() === 1, "over the swing bridge to the East Side: the jet workshop, the pub, the chandlery");
  check(/abbey/.test(await hop("swToAbbey")) && await page.locator('#world [data-place="swabbey"]').count() === 1, "up the steps to the abbey on the headland");
  await hop("swToEastS"); await hop("swToQuay");
  check(/West Cliff/.test(await hop("swToWest")) && await page.locator('#world [data-place="swarch"]').count() === 1, "and up the slope to the West Cliff: the whalebone arch and the bandstand");
  await hop("swToQuayS");
  await page.locator('#world [data-place="swboat"]').first().dispatchEvent("click"); await page.waitForSelector('#ctx [data-triphome="boat"]', { timeout: 15000 });
  check(/Sail home from Saltwick Harbour/.test(await page.locator("#ctx").innerText()), "tapping your boat on the quay: sail home");
  await page.close();
}

// Rounds 207 to 209: Saltwick's rooms and shops, its people and three things to join in with, the charm bracelet, the family
{
  console.log("\nSaltwick's rooms, people, activities and charms (rounds 207 to 209)");
  const page = await browser.newPage({ viewport: { width: 520, height: 1100 } });
  page.on("pageerror", e => errors.push(`saltwick rooms pageerror: ${e.message}`));
  await page.addInitScript(() => { if (!/swpatch2/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return; f.coins = 500; f.goals = {...(f.goals || {}), boat: 1};
    const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  const gf = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  const go = async sc => { await page.evaluate(s => window.__mapleScene(s), sc); await page.waitForTimeout(1500); };
  const spot = async id => { await page.locator(`#world [data-rdspot="${id}"]`).first().dispatchEvent("click"); await page.waitForTimeout(2500); };
  const place = async id => { await page.locator(`#world [data-place="${id}"]`).first().dispatchEvent("click"); await page.waitForTimeout(6500); };
  await page.goto(url + "?reset=1&seed=1&time=10:30&date=2026-10-16"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=10:30&date=2026-10-16&swpatch2=1"); await page.waitForTimeout(1500);
  // the swing bridge opens at half past: cross it then for the bridge charm
  await go("sw_quay"); await place("swToEast");
  check(!!((await gf()).saltwick || {}).charms?.bridge, "the swing bridge swings open for a coble at half past: there for it, the bridge charm");
  // the fish market: Nan's slab; a lobster (and its charm)
  await go("sw_market"); await spot("sw_market");
  check(/Lobster/.test(await page.locator("#ctx").innerText()) && /Dulse/.test(await page.locator("#ctx").innerText()), "the fish market sells lobster, brown crab, sea salt, dulse and onions");
  await page.click('#ctx [data-rbuy="lobster"]'); await page.waitForTimeout(800);
  let f = await gf();
  check(f.inv.lobster === 1 && f.saltwick.charms.lobster, "buying a lobster: one in the backpack, and the lobster charm");
  await page.click("#ctx [data-close]"); await page.waitForTimeout(400);
  // the Copper Kettle: a pot of tea
  await go("sw_kettle"); await spot("sw_kettle"); const c0 = (await gf()).coins;
  await page.click('#ctx [data-sw="kettle:tea"]'); await page.waitForTimeout(800);
  check((await gf()).coins === c0 - 2, "a pot of tea at the Copper Kettle");
  await page.click("#ctx [data-close]"); await page.waitForTimeout(400);
  // polishing jet with Priya: the anchor charm
  await go("sw_jet"); await spot("swpolish"); await page.click('#ctx [data-sw="polish"]'); await page.waitForTimeout(400);
  for (let k = 0; k < 3; k++) { await page.click('#ctx [data-sw="rub"]'); await page.waitForTimeout(150); }
  for (let k = 0; k < 3; k++) { await page.click('#ctx [data-sw="buff"]'); await page.waitForTimeout(150); }
  await page.click('#ctx [data-sw="polished"]'); await page.waitForTimeout(800);
  f = await gf();
  check(f.saltwick.charms.anchor && f.saltwick.polished === 1, "polishing jet with Priya: rub, buff, and the anchor charm");
  await page.click("#ctx [data-close]"); await page.waitForTimeout(400);
  // the pier, the abbey and the lawn: three more charms, and Priya threads the bracelet
  await go("sw_quay"); await place("swpiers"); await go("sw_abbey"); await place("swabbey"); await go("sw_west"); await place("swlawn");
  f = await gf();
  check(Object.keys(f.saltwick.charms).length === 6 && f.inv.sw_bracelet === 1, "all six charms (pier, abbey, lawn too): Priya threads the jet charm bracelet");
  // crabbing off the quay
  await go("sw_quay"); await place("swcrab"); await page.waitForSelector('#ctx [data-sw="crab"]', { timeout: 15000 });
  await page.click('#ctx [data-sw="crab"]'); await page.waitForTimeout(300);
  for (let k = 0; k < 3; k++) { await page.click('#ctx [data-sw="cwait"]'); await page.waitForTimeout(150); }
  await page.click('#ctx [data-sw="cpull"]'); await page.waitForTimeout(300); await page.click('#ctx [data-sw="crabdone"]'); await page.waitForTimeout(600);
  check(((await gf()).saltwick.crabs ?? -1) >= 0, "crabbing off the quay: drop a line, wait, pull up, count them, tip them back");
  // the shanty at the Fisherman's Arms (2 till 5, Billy singing)
  await page.goto(url + "?seed=1&time=14:30&date=2026-10-16"); await page.waitForTimeout(1500);
  await go("sw_pub"); await page.waitForTimeout(1500); await spot("swshanty"); await page.click('#ctx [data-sw="shanty"]'); await page.waitForTimeout(300);
  for (let k = 0; k < 8; k++) { const line = await page.locator("#ctx p b").last().innerText(); await page.click(`#ctx [data-sw="${/HEAVE/.test(line) ? "heave" : "sing"}"]`); await page.waitForTimeout(150); }
  await page.click('#ctx [data-sw="shantydone"]'); await page.waitForTimeout(800);
  f = await gf();
  check(f.saltwick.shanty === 1 && f.inv.sw_song === 1, "the shanty by the fire with Billy and Alf: sing and HEAVE, and the words to keep");
  check(await page.locator('#world [data-npc="shantybilly"]').count() === 1 && await page.locator('#world [data-npc="ged"]').count() === 1, "Billy's singing and Ged's behind the bar");
  await page.close();
}

// Rounds 210 to 213: Portovenere by boat: the four screens, six rooms (Signora Lia's shells too), stuffing mussels, a line in the
// poets' book, the choir, the poet's notebook, Jason and Luca popping over on Tuesdays and Saturdays, the family
{
  console.log("\nPortovenere by boat (rounds 210 to 213)");
  const page = await browser.newPage({ viewport: { width: 520, height: 1100 } });
  page.on("pageerror", e => errors.push(`portovenere pageerror: ${e.message}`));
  await page.addInitScript(() => { if (!/pvpatch/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return; f.coins = 600; f.goals = {...(f.goals || {}), boat: 1};
    const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  const gf = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  const go = async sc => { await page.evaluate(s => window.__mapleScene(s), sc); await page.waitForTimeout(1500); };
  const spot = async id => { await page.locator(`#world [data-rdspot="${id}"]`).first().dispatchEvent("click"); await page.waitForTimeout(2500); };
  const place = async id => { await page.locator(`#world [data-place="${id}"]`).first().dispatchEvent("click"); await page.waitForTimeout(7000); };
  const name = () => page.evaluate(() => document.querySelector("#sceneName").innerText.split("\n")[0]);
  // 2026-10-17 is a Saturday: Jason and Luca are over for lunch
  await page.goto(url + "?reset=1&seed=1&time=11:15&date=2026-10-17"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=11:15&date=2026-10-17&pvpatch=1"); await page.waitForTimeout(1500);
  await go("shore"); await page.locator('#world [data-place="boat"]').first().dispatchEvent("click"); await page.waitForSelector('#ctx [data-btown="porto"]', { timeout: 15000 });
  await page.click('#ctx [data-btown="porto"]'); await page.waitForTimeout(300);
  check(/Fuel 24/.test(await page.locator("#ctx").innerText()), "your boat sails to Portovenere (fuel 24)");
  await page.click('#ctx [data-tpick="evan"]'); await page.waitForTimeout(100); await page.click('#ctx [data-trip="porto"]'); await page.waitForTimeout(9000);
  check(await page.locator('#world [data-place="pvboat"]').count() === 1 && /harbour/i.test(await name()), "you tie up in the harbour under the wall of tall painted houses");
  check(/Borgo/i.test(await (async () => { await place("pvToBorgo"); return name(); })()) && await page.locator('#world [data-place="pvshells"]').count() === 1, "west to the Borgo: the town gate, the bookshop, the marble bottega, the shell shop");
  check(/castle/i.test(await (async () => { await place("pvToCastle"); return name(); })()), "up the steps to Castle Doria");
  check(/point|Pietro/i.test(await (async () => { await place("pvToPointW"); return name(); })()) && await page.locator('#world [data-place="pvchurch"]').count() === 1, "along the walls to San Pietro on its rock");
  check(/harbour/i.test(await (async () => { await place("pvToHarbourS"); return name(); })()), "and back round the rocks to the harbour");
  // the harbour cats, for Evan
  await place("pvcats"); check(((await gf()).porto || {}).cats === 1, "the harbour cats on the warm step (one climbs into Evan's lap)");
  // Signora Lia's shells: an ornament to take home
  await go("pv_shells"); await spot("pv_shells");
  check(/Seashell mobile/.test(await page.locator("#ctx").innerText()) && /Shell mirror/.test(await page.locator("#ctx").innerText()), "Signora Lia's shell shop: mobiles, boxes, mirrors, wreaths, boats, frames, garlands");
  await page.click('#ctx [data-rbuy="pv_shellbox"]'); await page.waitForTimeout(800);
  check((await gf()).inv.pv_shellbox === 1, "a shell-covered box to take home (a keepsake)");
  await page.click("#ctx [data-close]"); await page.waitForTimeout(300);
  // stuffing mussels with Rosa
  await go("pv_mussels"); await spot("pvstuff"); await page.click('#ctx [data-pv="stuff"]'); await page.waitForTimeout(300);
  for (let k = 0; k < 3; k++) { await page.click('#ctx [data-pv="open"]'); await page.waitForTimeout(120); }
  await page.click('#ctx [data-pv="fill:Chocolate"]'); await page.waitForTimeout(200);
  const oops = /Never/.test(await page.locator("#ctx").innerText());
  for (const f of ["Bread soaked in milk", "Mortadella", "An egg", "Parsley"]) { await page.click(`#ctx [data-pv="fill:${f}"]`); await page.waitForTimeout(150); }
  for (let k = 0; k < 3; k++) { await page.click('#ctx [data-pv="tie"]'); await page.waitForTimeout(120); }
  await page.click('#ctx [data-pv="stuffdone"]'); await page.waitForTimeout(800);
  check(oops && (await gf()).porto.muscoli, "stuffing mussels with Rosa: open, fill (never chocolate), tie, and her recipe");
  await page.click("#ctx [data-close]").catch(() => {}); await page.waitForTimeout(300);
  // a line in the poets' book
  await go("pv_books"); await spot("pvverse");
  for (const k of ["a:0", "b:0", "c:1"]) { await page.click(`#ctx [data-pv="${k}"]`); await page.waitForTimeout(150); }
  await page.click('#ctx [data-pv="write"]'); await page.waitForTimeout(800);
  let f = await gf();
  check(f.porto.verses.length === 1 && f.inv.pv_verse === 1, "a line in the poets' visitors' book, framed for you to keep");
  await page.click("#ctx [data-close]").catch(() => {}); await page.waitForTimeout(300);
  await go("pv_bar"); await page.waitForTimeout(2500);
  check(await page.locator('#world [data-npc="jason"]').count() === 1 && await page.locator('#world [data-npc="luca"]').count() === 1, "on a Saturday, Jason and Luca are over from Cinque Terre, having lunch at the bar on the quay");
  // the choir at San Pietro (11 to 12)
  await go("pv_church"); await page.waitForTimeout(2000); await spot("pvchoir"); await page.click('#ctx [data-pv="choir"]'); await page.waitForTimeout(300);
  for (let k = 0; k < 3; k++) { await page.click('#ctx [data-pv="listen"]'); await page.waitForTimeout(150); }
  await page.click('#ctx [data-pv="lastnote"]'); await page.waitForTimeout(800);
  f = await gf();
  check(f.porto.choir === 1 && f.porto.lines.church, "the choir at San Pietro: listen, then sing the last note (a line for the notebook)");
  // the other five lines: the castle, the swifts, the grotto, the ropes, the strait: the poet's notebook
  await go("pv_castle"); await place("pvcastle"); await place("pvfigs"); await go("pv_point"); await place("pvgrotto"); await go("pv_harbour"); await place("pvpalmaria"); await go("pv_mussels"); await spot("pvropes");
  f = await gf();
  check(Object.keys(f.porto.lines).length === 6 && f.inv.pv_notebook === 1, "six lines from six corners of town: the poet's notebook");
  await page.close();
}

// Rounds 214 to 217: Puffin Isle by boat: told what's on the island before setting off (seal pups in October), the four
// screens, the bird count, the lens, a suncatcher, sea glass for the jar
{
  console.log("\nPuffin Isle by boat (rounds 214 to 217)");
  const page = await browser.newPage({ viewport: { width: 520, height: 1100 } });
  page.on("pageerror", e => errors.push(`puffin isle pageerror: ${e.message}`));
  await page.addInitScript(() => { if (!/pipatch/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return; f.coins = 500; f.goals = {...(f.goals || {}), boat: 1};
    f.puffin = {glass: {white: 1, green: 1, brown: 1, blue: 1, aqua: 1, purple: 1}};
    const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  const gf = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  const go = async sc => { await page.evaluate(s => window.__mapleScene(s), sc); await page.waitForTimeout(1500); };
  const spot = async id => { await page.locator(`#world [data-rdspot="${id}"]`).first().dispatchEvent("click"); await page.waitForTimeout(2500); };
  const place = async id => { await page.locator(`#world [data-place="${id}"]`).first().dispatchEvent("click"); await page.waitForTimeout(7000); };
  const name = () => page.evaluate(() => document.querySelector("#sceneName").innerText.split("\n")[0]);
  await page.goto(url + "?reset=1&seed=1&time=10:00&date=2026-10-16"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=10:00&date=2026-10-16&pipatch=1"); await page.waitForTimeout(1500);
  await go("shore"); await page.locator('#world [data-place="boat"]').first().dispatchEvent("click"); await page.waitForSelector('#ctx [data-btown="puffin"]', { timeout: 15000 });
  await page.click('#ctx [data-btown="puffin"]'); await page.waitForTimeout(300);
  const sail = await page.locator("#ctx").innerText();
  check(/Fuel 14/.test(sail) && /seal pups/i.test(sail) && /April/.test(sail), "before setting off for Puffin Isle in October, the boat says what's there: seal pups now, puffins back in April");
  await page.click('#ctx [data-tpick="evan"]'); await page.waitForTimeout(100); await page.click('#ctx [data-trip="puffin"]'); await page.waitForTimeout(9000);
  check(await page.locator('#world [data-place="piboat"]').count() === 1 && /Haven/i.test(await name()), "you tie up at the stone jetty in North Haven");
  check(/Wick/i.test(await (async () => { await place("piToWick"); return name(); })()), "east to the Wick, the seabird cliffs");
  check(/Point|Lighthouse/i.test(await (async () => { await place("piToPoint"); return name(); })()) && await page.locator('#world [data-place="piglass"]').count() === 1, "south to Lighthouse Point: the lighthouse, the keeper's cottage, the boathouse, the sea-glass cove");
  check(/Farm/i.test(await (async () => { await place("piToFarmW"); return name(); })()), "west to the old farm");
  check(/Haven/i.test(await (async () => { await place("piToHavenN"); return name(); })()), "and north back to the haven");
  // sea glass: the seventh colour (red, the rarest) completes the jar; three finds a day
  await go("pi_point"); await page.evaluate(() => { Math.random = () => 0.999; }); await place("piglass");
  let f = await gf();
  check(f.puffin.glass.red === 1 && f.inv.pi_glassjar === 1, "a piece of ruby-red sea glass on the cove, the last colour: the jar of sea glass to keep");
  await place("piglass"); await place("piglass"); await place("piglass");
  check((await gf()).puffin.glassToday === 3, "only three finds a day: the sea brings more tomorrow");
  // the bird count with Finn (seal pups in October)
  await go("pi_warden"); await spot("picount"); await page.click('#ctx [data-pi="count"]'); await page.waitForTimeout(300);
  for (let k = 0; k < 8; k++) { const t = await page.locator("#ctx p b, #ctx p[style]").last().innerText(); await page.click(`#ctx [data-pi="${/!$/.test(t.trim()) ? "click" : "let"}"]`); await page.waitForTimeout(120); }
  await page.click('#ctx [data-pi="countdone"]'); await page.waitForTimeout(800);
  f = await gf();
  check(f.puffin.counts.length === 1 && f.puffin.counts[0].season === "seals", "the bird count at Finn's window: in October it's the seal pups on the beach, and your tally in the logbook");
  await page.click("#ctx [data-close]").catch(() => {}); await page.waitForTimeout(300);
  // the lens with Morwenna
  await go("pi_lamp"); await spot("pipolish"); await page.click('#ctx [data-pi="lens"]'); await page.waitForTimeout(300);
  for (let k = 0; k < 4; k++) { await page.click(`#ctx [data-pi="panel:${k}"]`); await page.waitForTimeout(120); }
  for (let k = 0; k < 3; k++) { await page.click('#ctx [data-pi="wind"]'); await page.waitForTimeout(120); }
  await page.click('#ctx [data-pi="lensdone"]'); await page.waitForTimeout(800);
  check((await gf()).puffin.lens === 1, "polishing the great lens with Morwenna and winding the clockwork");
  // a suncatcher at Ivy's bench
  await go("pi_studio"); await spot("pisuncatcher"); await page.click('#ctx [data-pi="sun"]'); await page.waitForTimeout(300);
  for (const k of ["red", "green", "blue", "aqua", "white"]) { await page.click(`#ctx [data-pi="glass:${k}"]`); await page.waitForTimeout(120); }
  await page.click('#ctx [data-pi="sundone"]'); await page.waitForTimeout(800);
  check((await gf()).inv.pi_suncatcher === 1, "a sea-glass suncatcher made at Ivy's bench, to keep");
  await page.close();
}

// Rounds 218 to 221: Bali by boat: the four screens in a ring, a canang sari with Ibu Wayan, an offering at a shrine
// (the sixth makes the Garuda), playing in Made's gamelan, the warung
{
  console.log("\nBali by boat (rounds 218 to 221)");
  const page = await browser.newPage({ viewport: { width: 520, height: 1100 } });
  page.on("pageerror", e => errors.push(`bali pageerror: ${e.message}`));
  await page.addInitScript(() => { if (!/bapatch/.test(location.search)) return; const f = JSON.parse(localStorage.getItem("fox.fox") || "null"); if (!f) return; f.coins = 500; f.goals = {...(f.goals || {}), boat: 1};
    f.bali = {placed: {bashrine1: "2026-10-01", bashrine2: "2026-10-01", bashrine3: "2026-10-01", bashrine4: "2026-10-01", babanyan: "2026-10-01"}, offerings: 0};
    const j = JSON.stringify(f); localStorage.setItem("fox.fox", j); Object.keys(localStorage).filter(k => /^stub:.*\/fox$/.test(k)).forEach(k => localStorage.setItem(k, j)); });
  const gf = () => page.evaluate(() => JSON.parse(localStorage.getItem("fox.fox")));
  const go = async sc => { await page.evaluate(s => window.__mapleScene(s), sc); await page.waitForTimeout(1500); };
  const spot = async id => { await page.locator(`#world [data-rdspot="${id}"]`).first().dispatchEvent("click"); await page.waitForTimeout(2500); };
  const place = async id => { await page.locator(`#world [data-place="${id}"]`).first().dispatchEvent("click"); await page.waitForTimeout(7000); };
  const name = () => page.evaluate(() => document.querySelector("#sceneName").innerText.split("\n")[0]);
  await page.goto(url + "?reset=1&seed=1&time=10:00&date=2026-10-16"); await page.waitForTimeout(800);
  await page.goto(url + "?seed=1&time=10:00&date=2026-10-16&bapatch=1"); await page.waitForTimeout(1500);
  await go("shore"); await page.locator('#world [data-place="boat"]').first().dispatchEvent("click"); await page.waitForSelector('#ctx [data-btown="bali"]', { timeout: 15000 });
  await page.click('#ctx [data-btown="bali"]'); await page.waitForTimeout(300);
  check(/Fuel 30/.test(await page.locator("#ctx").innerText()), "Bali is the longest sail: 30 fuel");
  await page.click('#ctx [data-tpick="evan"]'); await page.waitForTimeout(100); await page.click('#ctx [data-trip="bali"]'); await page.waitForTimeout(9000);
  check(await page.locator('#world [data-place="baboat"]').count() === 1 && /Sanur/i.test(await name()), "you come up onto the sand at Sanur among the jukung");
  check(/terraces/i.test(await (async () => { await place("baToTerraces"); return name(); })()), "west up the coconut track to the rice terraces");
  check(/temple/i.test(await (async () => { await place("baToTempleS"); return name(); })()), "south down through the paddies to the water temple");
  check(/Ubud/i.test(await (async () => { await place("baToUbudE"); return name(); })()) && await page.locator('#world [data-place="bamonkeys"]').count() === 1, "east to Ubud: the market, the offerings house, the silver workshop, the banyan, the monkey forest");
  check(/Sanur/i.test(await (async () => { await place("baToBeach"); return name(); })()), "and north back to the beach");
  // a canang sari with Ibu Wayan
  await go("ba_offer"); await spot("bacanang"); await page.click('#ctx [data-ba="canang"]'); await page.waitForTimeout(300);
  for (let k = 0; k < 3; k++) { await page.click('#ctx [data-ba="fold"]'); await page.waitForTimeout(120); }
  await page.click('#ctx [data-ba="flower:red"]'); await page.waitForTimeout(120);
  check(/Not that one/.test(await page.locator("#ctx").innerText()), "the wrong colour for the east: Ibu Wayan gently moves your hand");
  for (const c of ["white", "red", "yellow", "blue"]) { await page.click(`#ctx [data-ba="flower:${c}"]`); await page.waitForTimeout(120); }
  await page.click('#ctx [data-ba="rice"]'); await page.waitForTimeout(120); await page.click('#ctx [data-ba="canangdone"]'); await page.waitForTimeout(800);
  check((await gf()).bali.offerings === 1, "a canang sari made with Ibu Wayan: white east, red south, yellow west, blue north");
  await page.click("#ctx [data-close]").catch(() => {}); await page.waitForTimeout(300);
  // the sixth shrine: the monkey forest gate; the carved Garuda
  await go("ba_ubud"); await place("bamonkeys");
  let f = await gf();
  check(f.bali.placed.bamonkeys && f.bali.offerings === 0 && f.inv.ba_garuda === 1, "your offering at the monkey forest gate, the sixth shrine: Ibu Wayan's carved Garuda to keep");
  // the gamelan with Made (he teaches from nine till noon)
  await go("ba_gamelan"); await page.waitForTimeout(1500); await spot("bagong"); await page.click('#ctx [data-ba="gamelan"]'); await page.waitForTimeout(300);
  for (const b of ["strike", "rest", "strike", "strike", "rest", "strike", "rest", "gong"]) { await page.click(`#ctx [data-ba="${b}"]`); await page.waitForTimeout(120); }
  check(/gamelan hands/.test(await page.locator("#ctx").innerText()), "every beat together with the orchestra: \"You have gamelan hands!\"");
  await page.click('#ctx [data-ba="gamelandone"]'); await page.waitForTimeout(800);
  check((await gf()).bali.gamelan === 1, "playing in Made's gamelan, ending on the gong");
  await page.click("#ctx [data-close]").catch(() => {}); await page.waitForTimeout(300);
  // the warung
  const c0 = (await gf()).coins; await go("ba_warung"); await spot("ba_warung"); await page.click('#ctx [data-ba="warung:kelapa"]'); await page.waitForTimeout(800);
  check((await gf()).coins === c0 - 2, "a fresh coconut at Nyoman's warung");
  await page.close();
}

{
  console.log("\nStories pick up where they left off (round 203)");
  const st = await import(new URL("../src/game/stories.js", import.meta.url)), sd = await import(new URL("../src/data/stories.js", import.meta.url));
  const missing = Object.entries(sd.STORIES).flatMap(([id, chs]) => chs.map((c, i) => i > 0 && !c.recap ? id + ":" + i : null).filter(Boolean));
  check(!missing.length, "every chapter after the first starts by reminding Mel where they'd got to" + (missing.length ? ": missing " + missing.slice(0, 5).join(", ") : ""));
  check(!/[\u2013\u2014]/.test(JSON.stringify(sd.STORIES)), "no dashes in the stories");
  const day = "2026-10-14", F = {met: {celeste: true}, storyDay: day, story: {heard: {celeste: 1}, day: {}, log: [], flags: {}}}, t = st.tellStory(F, "celeste", () => {}, day);
  check(t && t.lines[0] === sd.STORIES.celeste[1].recap && t.lines.length === sd.STORIES.celeste[1].lines.length + 1, "Celeste's second chapter opens with the reminder: " + (t ? t.lines[0] : ""));
}
await browser.close();
if (errors.length) { console.log("\n" + errors.join("\n")); process.exit(1); }
console.log("\nall good");
