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
  page.on("console", m => { if (m.type() === "error") errors.push(`${vp.name} console: ${m.text()}`); });
  await page.goto(url + "?reset=1&seed=1&time=10:15");
  await page.waitForTimeout(900);
  await page.screenshot({ path: join(shots, `${vp.name}-1-start.png`), fullPage: vp.name === "phone" ? false : true });
  check(await page.locator("#journal h1").textContent().then(t => /Five-minute clean/.test(t)), "day opens with the five-minute clean");

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
  await page.click('#notebook [data-nb="close"]');

  // NPCs + mail
  await page.waitForTimeout(500);
  check(await page.locator("#npcs [data-npc]").count() > 0, "villagers are out and about");
  await page.screenshot({ path: join(shots, `${vp.name}-5-village.png`) });
  await page.close();
}
await browser.close();
if (errors.length) { console.log("\n" + errors.join("\n")); process.exit(1); }
console.log("\nall good");
