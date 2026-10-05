// Label spacing check: visits every scene in the dev build and lists washi labels that crowd each other,
// sit on another drawing, or hang off the map edge.   node build.mjs --dev --once && node test/labels.mjs [scene,scene]
import { createRequire } from "node:module"; import { execSync } from "node:child_process";
import { join, dirname } from "node:path"; import { fileURLToPath, pathToFileURL } from "node:url";
const g = execSync("npm root -g").toString().trim();
const { chromium } = createRequire(g + "/noop.js")("playwright");
const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto(pathToFileURL(join(dirname(fileURLToPath(import.meta.url)), "../dist/dev.html")).href + "?reset=1&seed=1&time=10:30"); await page.waitForTimeout(1200);
const scenes = (process.argv[2] || "base,village,lane,vineyard,hall,chord,fresh,chico,post,home,room,kidroom,trophy,bank,wineshop,market").split(",");
for (const sc of scenes) {
  await page.evaluate(id => window.__mapleScene(id), sc); await page.waitForTimeout(700);
  const res = await page.evaluate(() => {
    const art = document.getElementById("sceneArt"), ground = art.querySelector("rect");
    const gr = ground.getBoundingClientRect(), k = gr.width/520, ox = gr.left, oy = gr.top;
    const box = el => { const r = el.getBoundingClientRect(); return [(r.left-ox)/k, (r.top-oy)/k, (r.right-ox)/k, (r.bottom-oy)/k]; };
    const name = el => (el.textContent || "").trim().slice(0, 18);
    const labs = [...art.querySelectorAll("text.lab")].map(t => { const g = t.closest('g[pointer-events="none"]') || t; return {n: name(t), b: box(g.querySelector("path") || g), el: g}; });
    // drawn objects: the coloured art layer of every tappable thing
    const objs = [...art.querySelectorAll("[data-place],[data-spot],[data-vine],[data-exit]")].map(o => ({n: o.getAttribute("aria-label") || "", o, arts: [...o.querySelectorAll(':scope > g[filter="url(#marker)"], :scope > g > g[filter="url(#marker)"], :scope > svg')].map(box)}));
    // loose drawings (lamps, signs, ladders, the washing line) count as objects too
    [...art.querySelectorAll(':scope > g[filter="url(#marker)"]')].forEach((g, i) => { const bb = box(g); if ((bb[2]-bb[0]) < 300 && (bb[3]-bb[1]) < 300) objs.push({n: "loose drawing " + Math.round(bb[0]) + "," + Math.round(bb[1]), o: g, arts: [bb]}); });
    const gap = (a, c) => Math.max(c[0]-a[2], a[0]-c[2], c[1]-a[3], a[1]-c[3]);
    const out = [];
    for (let i = 0; i < labs.length; i++) for (let j = i+1; j < labs.length; j++) { const d = gap(labs[i].b, labs[j].b); if (d < 14) out.push(`label "${labs[i].n}" <> label "${labs[j].n}": ${d.toFixed(0)}`); }
    for (const L of labs) for (const O of objs) { if (O.o.contains(L.el)) { if (/^(Exit|Quests here)$/.test(L.n)) continue; for (const a of O.arts) { const d = gap(L.b, a); if (d < 4) { out.push(`label "${L.n}" sits on its own drawing: ${d.toFixed(0)}`); break; } } continue; } for (const a of O.arts) { const d = gap(L.b, a); if (d < 8) { out.push(`label "${L.n}" <> ${O.n}: ${d.toFixed(0)}`); break; } } }
    // outside the map
    for (const L of labs) if (L.b[0] < 2 || L.b[2] > 518 || L.b[3] > 638) out.push(`label "${L.n}" off the edge`);
    return out;
  });
  console.log(`\n${sc}: ${res.length ? "" : "ok"}\n  ` + res.join("\n  "));
}
await b.close();
