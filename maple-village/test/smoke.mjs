// Headless smoke test: builds the dev page, plays through the core loop with the stub, fails on any page error.
//   node test/smoke.mjs            (screenshots land in test/shots/)
import { execSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
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
  check(await page.locator("#journal h1").textContent().then(t => /Five-minute clean/.test(t)), "day opens with the five-minute clean");
  const lay = await page.evaluate(() => ({ hud: document.querySelector(".hudbar").getBoundingClientRect().bottom, map: document.querySelector("#map").getBoundingClientRect().top,
    fits: document.documentElement.scrollHeight <= innerHeight + 2, note: !!document.querySelector("#map #journal h1") }));
  if (vp.name === "phone") {
    const full = await page.evaluate(() => { const r = document.querySelector("#map").getBoundingClientRect(), h = document.querySelector(".hudbar").getBoundingClientRect(); return {h: r.height, w: r.width, hudTop: h.top}; });
    check(full.h >= 840 && full.w >= 388, "on the phone the map fills the whole screen");
    check(full.hudTop < 80, "trackers float at the top of the screen");
    check(await page.locator(".scenebar .hbtn").count() === 4, "four drawn icons in the corner");
    check(!(await page.locator(".hbtn").first().textContent()).match(/\p{Extended_Pictographic}/u), "corner icons are drawn, not emoji");
  } else check(lay.hud <= lay.map, "trackers sit above the map");
  check(lay.fits, "the whole game fits on screen without scrolling");
  check(lay.note, "the quest note is pinned on the map");

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
  await page.locator('#world [data-place="fresh"]').first().dispatchEvent("click").catch(() => {});
  await page.evaluate(() => document.querySelector("#world [data-exit]") && document.querySelector("#world [data-exit]").dispatchEvent(new MouseEvent("click", {bubbles: true})));
  await page.waitForFunction(() => /village/i.test(document.querySelector("#sceneName").textContent), null, { timeout: 20000 });
  if (await page.locator('#journal [data-qn="min"]').count()) await page.click('#journal [data-qn="min"]');
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
// Sunsama pull: no chat plan, the page fetches today's tasks itself
{
  console.log("\nsunsama pull");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", e => errors.push(`sunsama pageerror: ${e.message}`));
  await page.goto(url + "?reset=1&sunsama=1&time=07:45");
  await page.waitForFunction(() => /came straight from Sunsama/.test(document.querySelector("#sunsamaLine").textContent), null, { timeout: 15000 });
  const titles = await page.locator("#list .t").allTextContents();
  check(titles.length === 5, `all five Sunsama tasks became quests (${titles.length})`);
  check(titles.some(t => /× Listen to affirmations/.test(t)), "a task completed in Sunsama shows as done");
  const plan = await page.evaluate(() => devDb.get("plan"));
  check(plan && plan.source === "sunsama" && plan.tasks.find(t => t.id === "s1").notes.includes("- Check GHL"), "notes are cleaned up from Sunsama's HTML");
  check(plan.tasks.find(t => t.id === "s4").minutes === 90 && plan.tasks.find(t => t.id === "s3").treadmill === true, "time estimates and treadmill flags carry over");
  check(plan.tasks.find(t => t.id === "s1").email, "comms tasks become email quests at the post office");
  await page.close();
}
await browser.close();
if (errors.length) { console.log("\n" + errors.join("\n")); process.exit(1); }
console.log("\nall good");
