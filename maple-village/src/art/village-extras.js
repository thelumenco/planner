// Things that change the village over time: upgrades unlocked by finished quests, festivals through the year and
// winter rain, and the evening lanterns on the pond. Drawn on top of the village (see villageArt in scenes.js).
import { sk } from "./scenes.js";
import { iconAt } from "./icons.js";
import { hash } from "../util.js";

/* ---------- upgrades: one more every few quests, kept forever ---------- */
export const UPGRADES = [
  {at: 3,   id: "bunting",  name: "bunting over the market"},
  {at: 8,   id: "lanterns", name: "lanterns along the main path"},
  {at: 15,  id: "flag",     name: "a flag on Bo's workshop"},
  {at: 25,  id: "arch",     name: "a flower arch over Auntie Lin's door"},
  {at: 40,  id: "bench",    name: "a reading bench outside the library"},
  {at: 60,  id: "lights",   name: "string lights around the square"},
  {at: 85,  id: "fountain", name: "a little fountain"},
  {at: 120, id: "star",     name: "a gold star on the town hall flag"},
  {at: 160, id: "blossom",  name: "blossom trees by the pond at home"}
];
export const unlocked = n => UPGRADES.filter(u => n >= u.at);
export const nextUpgrade = n => UPGRADES.find(u => n < u.at) || null;

export const bunting = (x1, y1, x2, y2, cols) => {
  const n = Math.max(3, Math.round((x2 - x1)/12)), mid = (y1 + y2)/2 + 8;
  let f = "";
  for (let i = 0; i < n; i++) {
    const t = (i + .5)/n, x = x1 + (x2 - x1)*t, y = (1 - t)*(1 - t)*y1 + 2*(1 - t)*t*mid + t*t*y2;
    f += `<path d="M${x - 4} ${y} l4 8 l4 -8z" style="fill:${cols[i % cols.length]}"/>`;
  }
  return sk(f, `<path d="M${x1} ${y1} Q${(x1 + x2)/2} ${mid} ${x2} ${y2}"/>${f.replace(/ style="[^"]*"/g, "")}`);
};
// A lamp's warm pool of light: always drawn, shown by CSS in dark mode (and at dusk) so the village feels cosy at night
export const lampGlow = (x, y, r = 30) => `<g class="lglow" pointer-events="none"><circle cx="${x}" cy="${y}" r="${r}" fill="url(#lampg)"/><circle class="flick" cx="${x}" cy="${y}" r="${(r*.42).toFixed(1)}" fill="#FFE3A3" opacity=".22"/></g>`;
export const lampDefs = `<defs><radialGradient id="lampg"><stop offset="0" stop-color="#FFD98A" stop-opacity=".55"/><stop offset=".45" stop-color="#FFC66B" stop-opacity=".2"/><stop offset="1" stop-color="#FFC66B" stop-opacity="0"/></radialGradient></defs>`;
// A tall street lamp: iron post, little roof, glowing glass
export const streetLamp = (x, y) => lampGlow(x, y - 30, 34) + sk(`<rect x="${x - 5}" y="${y - 36}" width="10" height="12" rx="2" class="lglass" style="fill:#F6C26B"/>`,
  `<path d="M${x} ${y} v-24 M${x - 4} ${y} h8"/><rect x="${x - 5}" y="${y - 36}" width="10" height="12" rx="2"/><path d="M${x - 7} ${y - 36} l7 -5 l7 5z"/>`);
const lamp = (x, y) => lampGlow(x, y - 18, 22) + sk(`<rect x="${x - 4}" y="${y - 22}" width="8" height="9" rx="2" style="fill:#F6C26B"/>`, `<path d="M${x} ${y} v-13"/><rect x="${x - 4}" y="${y - 22}" width="8" height="9" rx="2"/><path d="M${x - 5} ${y} h10"/>`);

// Upgrades live in the town square, except the blossom trees (by the pond at home) and the workshop flag and the cottage arch (Makers' Lane).
export function upgradesArt(n, where){
  const has = id => unlocked(n).some(u => u.id === id);
  let h = "";
  if (where === "base") {
    if (has("blossom")) [[330, 500], [500, 512]].forEach(([x, y]) => { h += `<g filter="url(#wob)" style="stroke:var(--line)" stroke-width="1.4"><rect x="${x - 3}" y="${y - 6}" width="6" height="14" style="fill:var(--wood)"/><circle cx="${x}" cy="${y - 18}" r="14" style="fill:#F4C7CF"/><circle cx="${x - 9}" cy="${y - 10}" r="9" style="fill:#EFA3A6"/><circle cx="${x + 9}" cy="${y - 11}" r="9" style="fill:#F4C7CF"/></g>`; });
    return h;
  }
  if (where === "lane") {
    // the workshop flag and the cottage's flower arch live with their buildings on Makers' Lane
    if (has("flag")) h += `<g transform="translate(60 0)">${sk(`<path d="M85 140 l18 6 l-18 6z" style="fill:var(--peach)"/>`, `<path d="M85 160 v-22 M85 140 l18 6 l-18 6"/>`)}</g>`;
    if (has("arch")) h += `<g transform="translate(295 -230)">${sk(`${[0, 1, 2, 3, 4, 5, 6].map(i => { const a = Math.PI*(1 - i/6), x = 85 + Math.cos(a)*19, y = 486 - Math.sin(a)*19; return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" style="fill:${["var(--rose)", "#FFFDF6", "var(--butter)"][i % 3]}"/>`; }).join("")}`,
      `<path d="M66 500 v-14 a19 19 0 0 1 38 0 v14"/>`)}</g>`;
    return h;
  }
  if (has("bunting")) h += bunting(330, 300, 394, 300, ["var(--rose)", "var(--butter)", "var(--sage)", "var(--peri)"]);
  if (has("lanterns")) [[232, 236], [288, 236], [226, 430], [294, 430], [196, 362], [324, 362]].forEach(([x, y]) => { h += lamp(x, y); });
  if (has("bench")) h += sk(`<rect x="106" y="276" width="34" height="6" rx="2" style="fill:var(--wood)"/>`, `<rect x="106" y="276" width="34" height="6" rx="2"/><path d="M110 282 v8 M136 282 v8 M106 270 h34"/>`);
  if (has("lights")) { let b = ""; for (let i = 0; i < 9; i++) { const t = i/8, x = 192 + 136*t, y = 296 - Math.sin(Math.PI*t)*22; b += `<circle class="twinkle" cx="${x.toFixed(1)}" cy="${(y + 3).toFixed(1)}" r="2.6" fill="${["#FFD66E", "#F7A9A9", "#A9D3A0", "#A9C6E0"][i % 4]}"/>`; }
    h += `<g filter="url(#wob)"><path d="M192 296 Q260 252 328 296" fill="none" style="stroke:var(--line)" stroke-width="1.2"/></g><g>${b}</g>`; }
  if (has("fountain")) h += sk(`<ellipse cx="318" cy="400" rx="20" ry="8" style="fill:var(--stone)"/><ellipse cx="318" cy="398" rx="14" ry="5" style="fill:var(--water)"/><rect x="315" y="382" width="6" height="14" style="fill:var(--stone)"/>`,
    `<ellipse cx="318" cy="400" rx="20" ry="8"/><path d="M298 400 v4 a20 8 0 0 0 40 0 v-4"/><rect x="315" y="382" width="6" height="14"/><path class="smoke" d="M318 380 q-6 -6 -10 2 M318 380 q6 -6 10 2" opacity=".7"/>`);
  if (has("star")) h += iconAt("sparkle", 282, 6, 16);
  return h;
}

/* ---------- festivals + weather. Lunar dates move: check the table each year. ---------- */
export const FESTIVALS = [
  {id: "newyear",   name: "New Year",           dates: ["2026-12-31", "2027-12-31"], before: 1, after: 1},
  {id: "cny",       name: "Chinese New Year",   dates: ["2027-02-06", "2028-01-26"], before: 10, after: 14},
  {id: "midautumn", name: "Mid-Autumn",         dates: ["2026-09-25", "2027-09-15"], before: 7, after: 2},
  {id: "deepavali", name: "Deepavali",          dates: ["2026-11-08", "2027-10-28"], before: 7, after: 2},
  {id: "christmas", name: "Christmas",          dates: ["2026-12-25", "2027-12-25"], before: 10, after: 1},
  // the vineyard's own: autumn's grape harvest (bunting over the vines, every bunch picked is a big one)
  {id: "harvest",   name: "The grape harvest",  dates: ["2026-10-04", "2027-10-03"], before: 2, after: 8, vineyard: true}
];
const dayNum = k => Date.parse(k + "T00:00:00Z")/864e5;
export function festivalOn(day){
  const d = dayNum(day);
  for (const f of FESTIVALS) for (const k of f.dates) { const x = dayNum(k); if (d >= x - f.before && d <= x + f.after) return f; }
  return null;
}
// round 306 (ported: rain more often, for shorter spells): the days go in fives, with a shower on the first and on the
// third or fourth, so there's always one two or three days after the last. Each lasts 1 to 3 hours, starting between
// 7am and 7pm. In the rainy months (November to January) half are downpours; the rest of the year about one in four.
// rainLevel: 0 dry, 1 a light shower, 2 a downpour (paddling's off). Given a time (minutes since midnight),
// rainLevel/rainyOn/stormyOn say whether it's raining right then; without one, whether it rains at all that day.
const mixr = h => { h = Math.imul(h ^ (h >>> 16), 0x45d9f3b); h = Math.imul(h ^ (h >>> 16), 0x45d9f3b); return (h ^ (h >>> 16)) >>> 0; };
const dayN = day => Math.round(Date.parse(day.slice(0, 10) + "T00:00:00Z")/864e5);
const dayRain = day => { const d = dayN(day), w = Math.floor(d/5), at = d - w*5, second = 2 + mixr(w*7 + 3) % 2;
  if (at !== 0 && at !== second) return 0;
  return mixr(hash(day + "rain")) % 100 < ([11, 12, 1].includes(+day.slice(5, 7)) ? 50 : 25) ? 2 : 1; };
export const rainDay = dayRain;
export function rainSpell(day){ if (!dayRain(day)) return null; const from = 7*60 + mixr(hash(day + "when")) % (12*60 + 1); return {from, to: from + 60 + mixr(hash(day + "len")) % 121}; }
export function rainLevel(day, hm){ const l = dayRain(day); if (!l || hm == null) return l; const s = rainSpell(day); return hm >= s.from && hm < s.to ? l : 0; }
export const rainyOn = (day, hm) => rainLevel(day, hm) > 0;
export const stormyOn = (day, hm) => rainLevel(day, hm) === 2;
// round 306: with downpours so much commoner, the sea's only too rough to sail from half an hour before one until two
// hours after it
export const roughSea = (day, hm) => { if (dayRain(day) !== 2) return false; const w = rainSpell(day); return hm >= w.from - 30 && hm < w.to + 120; };

export function festivalArt(f){
  if (!f) return "";
  const lanternRow = (x1, x2, y, cols) => { let s = ""; const n = 6; for (let i = 0; i < n; i++) { const x = x1 + (x2 - x1)*i/(n - 1), yy = y + Math.sin(Math.PI*i/(n - 1))*10;
    s += `<path d="M${x} ${yy - 6} v4"/><ellipse cx="${x}" cy="${yy + 4}" rx="5" ry="6.5" style="fill:${cols[i % cols.length]}"/><path d="M${x - 2} ${yy + 10.5} h4"/>`; }
    return `<g filter="url(#wob)" style="stroke:var(--line)" stroke-width="1.1"><path d="M${x1} ${y - 6} Q${(x1 + x2)/2} ${y + 6} ${x2} ${y - 6}" fill="none"/>${s}</g>`; };
  switch (f.id) {
    case "cny": return lanternRow(196, 324, 262, ["#D9433A", "#E8574C"]) + lanternRow(30, 140, 176, ["#D9433A"]) + lanternRow(380, 490, 176, ["#D9433A"]);
    case "midautumn": return lanternRow(196, 324, 262, ["#F3C969", "#EFA3A6", "#9CC3E0", "#B9D2A6"]) + `<g filter="url(#wob)"><circle cx="470" cy="40" r="16" fill="#FFF3C4" style="stroke:var(--line)" stroke-width="1.2"/></g>`;
    case "deepavali": { let d = ""; [[236, 236], [284, 236], [222, 420], [298, 420], [200, 352], [320, 352], [250, 560], [270, 560]].forEach(([x, y]) => { d += `<path d="M${x - 6} ${y} q6 6 12 0z" style="fill:#C9853E"/><path class="twinkle" d="M${x} ${y - 1} q-3 -5 0 -9 q3 4 0 9z" style="fill:#F6A23A"/>`; });
      const rang = `<g filter="url(#wob)" opacity=".9">${[26, 18, 10].map((r, i) => `<circle cx="260" cy="356" r="${r}" fill="none" style="stroke:${["#EFA3A6", "#F3C969", "#9AA9DD"][i]}" stroke-width="5"/>`).join("")}<circle cx="260" cy="356" r="4" fill="#EFA3A6"/></g>`;
      return rang + `<g filter="url(#wob)" style="stroke:var(--line)" stroke-width=".9">${d}</g>`; }
    case "christmas": { let b = ""; for (let i = 0; i < 9; i++) { const t = i/8, x = 192 + 136*t, y = 296 - Math.sin(Math.PI*t)*22; b += `<circle class="twinkle" cx="${x.toFixed(1)}" cy="${(y + 3).toFixed(1)}" r="2.4" fill="${["#D9433A", "#F3C969", "#7FA36E"][i % 3]}"/>`; }
      return `<g filter="url(#wob)" style="stroke:var(--line)" stroke-width="1.2"><path d="M192 296 Q260 252 328 296" fill="none"/></g><g>${b}</g>`; }
    case "newyear": return `<g class="twinkle">${[[120, 60], [400, 70], [260, 240], [60, 380], [470, 420], [180, 560]].map(([x, y]) => iconAt("sparkle", x, y, 18)).join("")}</g>`;
  }
  return "";
}

/* ---------- evening: the day's wins float on the pond as lanterns ---------- */
export function pondLanterns(n){
  let h = "";
  for (let i = 0; i < Math.min(n, 9); i++) {
    const x = 370 + (i % 5)*18 + (i > 4 ? 9 : 0), y = 560 + (i > 4 ? 14 : 0) + (i % 2)*3;   // the pond at home
    h += `<g class="floaty" style="animation-delay:${(i*.37).toFixed(2)}s">${lampGlow(x, y, 20)}${iconAt("lantern", x, y, 16)}</g>`;
  }
  return h;
}
/* ---------- round 322 : from the tree lighting (20 November)
   to Boxing Day: a big tree in the square with lights, baubles, a star and presents; wreaths on the doors; fairy
   lights along the town hall's and the bank's eaves; red bows and holly on the lamp posts; a garland over the
   market stall; and a snowman on the green by the Good news board. The lights twinkle after dark. ---------- */
export const xmasDecorOn = day => { const md = (day || "").slice(5); return md >= "11-20" && md <= "12-26"; };
const RED = "#C8323A", GOLD = "#F3C969", GREEN = "#3F7A4A", G2 = "#5E9A5A", LN = `style="stroke:var(--line)"`;
const bulbs = (pts, dark) => pts.map(([x, y], i) => `<circle${dark ? ` class="twinkle"` : ""} cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.1" fill="${["#F3C969", "#E8574C", "#7FB8E8", "#9CC27E"][i % 4]}" ${LN} stroke-width=".5"/>`).join("");
const sag = (x1, x2, y, dip, n) => { const p = []; for (let i = 0; i <= n; i++) { const t = i/n; p.push([x1 + (x2 - x1)*t, y + Math.sin(Math.PI*t)*dip]); } return p; };
const wire = (x1, x2, y, dip) => `<path d="M${x1} ${y} Q${(x1 + x2)/2} ${y + dip*2} ${x2} ${y}" fill="none" ${LN} stroke-width=".7"/>`;
export const eavesLights = (x1, x2, y, dark) => wire(x1, x2, y, 3) + `<g>${bulbs(sag(x1, x2, y, 3, Math.max(4, Math.round((x2 - x1)/11))), dark)}</g>`;
export const wreath = (x, y) => `<g ${LN} stroke-width=".8"><circle cx="${x}" cy="${y}" r="7.5" fill="none" style="stroke:${GREEN}" stroke-width="4.2"/><circle cx="${x}" cy="${y}" r="7.5" fill="none" stroke-width=".6"/>${[0, 72, 144, 216, 288].map(a => `<circle cx="${(x + 7.5*Math.cos(a*Math.PI/180)).toFixed(1)}" cy="${(y + 7.5*Math.sin(a*Math.PI/180)).toFixed(1)}" r="1.3" fill="${RED}" stroke="none"/>`).join("")}<path d="M${x - 3} ${y + 7} l3 -2.5 l3 2.5 l-1.5 4 M${x} ${y + 4.5} l-1.5 6.5" fill="${RED}"/></g>`;
const bow = (x, y) => `<g ${LN} stroke-width=".6"><path d="M${x} ${y} l-6 -3.5 v7z M${x} ${y} l6 -3.5 v7z" fill="${RED}"/><circle cx="${x}" cy="${y}" r="1.6" fill="${RED}"/><path d="M${x - 1} ${y + 1} l-2.5 7 M${x + 1} ${y + 1} l2.5 7" stroke="${RED}" stroke-width="1.4"/><path d="M${x - 9} ${y + 3} q3 -4 6 -1 q-3 3 -6 1z M${x + 9} ${y + 3} q-3 -4 -6 -1 q3 3 6 1z" fill="${G2}"/></g>`;
// the decorated tree: lights, baubles, a star and presents
export function xmasTree(tx, ty, dark){
  const tiers = [[0, 46, 28], [-22, 38, 24], [-42, 28, 20], [-58, 18, 16]];
  return `<g class="xmastree" pointer-events="none"><g ${LN} stroke-width="1.1"><rect x="${tx - 5}" y="${ty - 4}" width="10" height="12" fill="#8A5A3A"/>${tiers.map(([dy, w, h]) => `<path d="M${tx - w/2} ${ty + dy - 2} L${tx} ${ty + dy - 2 - h - 14} L${tx + w/2} ${ty + dy - 2}z" fill="${GREEN}"/>`).join("")}
    <path d="M${tx} ${ty - 98} l2.6 5.4 l6 .8 l-4.4 4.2 l1 6 l-5.2 -2.8 l-5.2 2.8 l1 -6 l-4.4 -4.2 l6 -.8z" fill="${GOLD}"/></g>
    <g>${[[-14, -10, RED], [10, -14, GOLD], [-4, -26, "#7FB8E8"], [14, -32, RED], [-12, -40, GOLD], [4, -48, RED], [-6, -60, "#7FB8E8"], [6, -68, GOLD], [-16, -20, "#7FB8E8"], [16, -6, "#7FB8E8"]].map(([dx, dy, c]) => `<circle cx="${tx + dx}" cy="${ty + dy}" r="2.6" fill="${c}" ${LN} stroke-width=".6"/>`).join("")}</g>
    <g>${bulbs([...sag(tx - 20, tx + 20, ty - 18, 4, 6), ...sag(tx - 14, tx + 14, ty - 40, 3, 5), ...sag(tx - 8, tx + 8, ty - 60, 2, 3)], dark)}</g>
    <g ${LN} stroke-width=".9"><rect x="${tx - 30}" y="${ty - 2}" width="13" height="10" fill="${RED}"/><path d="M${tx - 23.5} ${ty - 2} v10 M${tx - 30} ${ty + 3} h13" stroke="${GOLD}" stroke-width="1.4"/>
    <rect x="${tx + 16}" y="${ty}" width="12" height="8" fill="#7FB8E8"/><path d="M${tx + 22} ${ty} v8" stroke="#FFFDF6" stroke-width="1.4"/><rect x="${tx + 8}" y="${ty + 3}" width="9" height="7" fill="${GOLD}"/><path d="M${tx + 12.5} ${ty + 3} v7" stroke="${RED}" stroke-width="1.2"/></g></g>`;
}
// round 322 follow-up: the tree
// stands behind the board (scenes.js draws it before the board, so the board hides its foot)
export const VILLAGE_TREE = [92, 452];
export function xmasDecor(dark){
  const eaves = eavesLights(100, 247, 106, dark) + eavesLights(327, 433, 104, dark);
  const doors = [[171, 134], [380, 128], [96, 326], [430, 460]].map(([x, y]) => wreath(x, y)).join("");
  const lamps = [[384, 432], [400, 252], [236, 524], [284, 524], [120, 560], [440, 572]].map(([x, y]) => bow(x, y - 44)).join("");
  const garland = `<path d="M330 318 q15 9 30 0 q15 9 30 0" fill="none" style="stroke:${G2}" stroke-width="4"/><g>${bulbs(sag(330, 390, 319, 4, 6), dark)}</g>`;
  const snowman = `<g transform="translate(-182 -52)"><g ${LN} stroke-width="1"><circle cx="230" cy="584" r="10" fill="#FFFDF6"/><circle cx="230" cy="566" r="7" fill="#FFFDF6"/><path d="M226 559 h8 v-7 h-8z M223 559 h14" fill="#3B3530"/><path d="M230 567 l5 1.2 l-5 1z" fill="#F08A3C"/><circle cx="227.6" cy="564.6" r=".9" fill="#3B3530"/><circle cx="232.4" cy="564.6" r=".9" fill="#3B3530"/><path d="M223 572 q7 4 14 0 l1 5 l-3 -1" fill="none" stroke="${RED}" stroke-width="2.4"/><path d="M220 578 l-8 -6 M240 578 l8 -6" stroke="#8A5A3A"/></g></g>`;
  return `<g class="xmasdecor" pointer-events="none">${eaves}${doors}${lamps}${garland}${snowman}</g>`;
}
// round 322 follow-up: lights along the eaves and a wreath on the door. need:
// what has to be yours first ("scoop", "cocoa", "vine"); houses always
export const XMAS_DRESS = {
  bay: [{need: "scoop", lights: [328, 458, 178], wreath: [386, 230]}, {need: "cocoa", lights: [322, 470, 430], wreath: [416, 488]}],
  vineyard: [{need: "vine", lights: [308, 470, 124], wreath: [390, 178]}],
  base: [{lights: [198, 322, 223], wreath: [260, 266]}],
  hlane: [{lights: [54, 166, 220], wreath: [110, 240]}, {lights: [288, 390, 220], wreath: [338, 240]}, {lights: [54, 166, 391], wreath: [110, 410]}, {lights: [288, 392, 391], wreath: [338, 412]}],
  lane: [{lights: [86, 202, 207], wreath: [145, 246]}, {lights: [334, 438, 233], wreath: [380, 256]}, {lights: [102, 244, 458], wreath: [160, 494]}, {lights: [302, 426, 458], wreath: [370, 492]}]
};
export function xmasDress(scene, has, dark){
  const list = (XMAS_DRESS[scene] || []).filter(d => !d.need || has(d.need)); if (!list.length) return "";
  return `<g class="xmasdress" pointer-events="none">${list.map(d => eavesLights(d.lights[0], d.lights[1], d.lights[2], dark) + wreath(d.wreath[0], d.wreath[1])).join("")}</g>`;
}
