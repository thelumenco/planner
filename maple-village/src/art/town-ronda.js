// Ronda (round 107): four screens of a white town on a cliff, split by a gorge. Nothing here is drawn with
// Honeybrook's round green trees, picket fences or grass: lime-washed walls with ochre trim and iron grilles, curved
// terracotta roof tiles, grey river-cobble lanes, golden limestone cliffs, dusty olive and sage, dark cypress, and
// splashes of geranium red and bougainvillea magenta. Hard sun: every building throws a blue-grey shadow.
//   rd_station: the station on the top edge, the avenue, the Alameda gardens and the balcony over the valley (west)
//   rd_plaza:   the plaza and fountain, the covered market, the tapas bar, Doña Carmen's sweet shop
//   rd_bridge:  Puente Nuevo over the gorge, the viewpoint, the palace and its Moorish garden
//   rd_old:     La Ciudad: lanes, the convent hatch, the tile shop, the Arab baths, the old town gate
// The seasons show in the trees and the valley: orange blossom and poppies in spring, sunflowers and swifts in summer,
// vineyards and the brightest bougainvillea in autumn, almond blossom and ripe oranges in winter.
import { ink, dayKey } from "../util.js";
import { sk, tapeLabel } from "./scenes.js";
import { lampDefs, lampGlow } from "./village-extras.js";
import { seasonOf } from "../data/items.js";

const C = {white: "#FBF7EE", wall2: "#F3ECDD", ochre: "#D9A441", terra: "#C8643B", terra2: "#A84E2E", cobble: "#D6CEC0", earth: "#EADFC6", gravel: "#E6D6B2",
  cliff: "#D9B26A", cliff2: "#B98F4E", deep: "#4E3E31", olive: "#9DAA80", sage: "#B7C09C", cypress: "#3F5A3C", leaf: "#4F7A3E", iron: "#2F2B28",
  geranium: "#D8343A", bougain: "#C2307A", pot: "#3E6BAE", shutter: "#4F7A5A", sky: "#7FB8E8"};
const W = ink;
const ssn = () => seasonOf(dayKey());
const lab = (x, y, t, col = "#F6E3B4", size = 10) => tapeLabel(x, y, t, col, size);

/* ---------- pieces ---------- */
// a hard shadow thrown down and to the right by a block (x, y, w, h)
const shade = (x, y, w, h, d = 16) => `<path d="M${x + w} ${y + 6} l${d} ${d*.7} V${y + h + d*.7} H${x + d} l${-d} ${-d*.7}z" style="fill:#6F7C9C" opacity=".28" pointer-events="none"/>`;
// curved terracotta tiles: a band of roof with ridged rows and a scalloped eave
function tileRoof(x, y, w, h){
  const ridges = Array.from({length: Math.floor(w/7)}, (_, i) => `M${x + 4 + i*7} ${y + 2} V${y + h - 2}`).join(" ");
  const eave = Array.from({length: Math.floor(w/7)}, (_, i) => `<circle cx="${x + 3.5 + i*7}" cy="${y + h}" r="3.5" style="fill:${C.terra}"/>`).join("");
  return {art: `<path d="M${x + 6} ${y} H${x + w - 6} L${x + w} ${y + h} H${x}z" style="fill:${C.terra}"/>${eave}<path d="${ridges}" style="stroke:${C.terra2}" stroke-width="1.3"/>`,
    lines: `<path d="M${x + 6} ${y} H${x + w - 6} L${x + w} ${y + h} H${x}z"/>`};
}
// a window with an iron grille (reja) and an ochre surround
const reja = (x, y, w = 16, h = 20) => ({art: `<rect x="${x - 3}" y="${y - 3}" width="${w + 6}" height="${h + 6}" rx="2" style="fill:${C.ochre}"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.5" style="fill:#3A3A44"/>`,
  lines: `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.5"/><path d="M${x + w/3} ${y} v${h} M${x + 2*w/3} ${y} v${h} M${x} ${y + h/2} h${w}" stroke-width=".9"/>`});
// green shutters either side of a window
const shutters = (x, y, w = 14, h = 20) => ({art: `<rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:#7FB8E8" opacity=".7"/><rect x="${x - 8}" y="${y}" width="8" height="${h}" style="fill:${C.shutter}"/><rect x="${x + w}" y="${y}" width="8" height="${h}" style="fill:${C.shutter}"/>`,
  lines: `<rect x="${x - 8}" y="${y}" width="${w + 16}" height="${h}"/><path d="M${x} ${y} v${h} M${x + w} ${y} v${h}"/>`});
// a blue pot of red geraniums
const pot = (x, y, col = C.geranium) => `<g pointer-events="none" ${W} stroke-width=".9"><path d="M${x - 5} ${y - 7} h10 l-1.5 7 h-7z" style="fill:${C.pot}"/>${[[-3, -10], [2, -11], [0, -14], [4, -8], [-5, -8]].map(([dx, dy]) => `<circle cx="${x + dx}" cy="${y + dy}" r="2.6" style="fill:${col}"/>`).join("")}<circle cx="${x - 1}" cy="${y - 7}" r="2" style="fill:#5E8A4A" stroke="none"/></g>`;
// an iron balcony with pots on it
const balcony = (x, y, w = 30) => ({art: `<rect x="${x}" y="${y - 2}" width="${w}" height="3" style="fill:${C.iron}"/>`, lines: `<path d="M${x} ${y - 12} h${w} ${Array.from({length: Math.floor(w/5) + 1}, (_, i) => `M${x + i*5} ${y - 12} v12`).join(" ")}" stroke-width=".9"/>`,
  pots: pot(x + 7, y - 11) + pot(x + w - 7, y - 11, "#E85A8A")});
// bougainvillea tumbling over a wall or a doorway: brightest in autumn, sparse in winter
function bougain(x, y, r = 16){
  const s = ssn(), n = s === "autumn" ? 16 : s === "winter" ? 6 : 11, col = s === "winter" ? "#B24A7E" : C.bougain;
  return `<g pointer-events="none" filter="url(#wob)">${Array.from({length: n}, (_, i) => { const a = i*2.4, d = r*(.3 + (i % 5)/6); return `<circle cx="${(x + Math.cos(a)*d).toFixed(1)}" cy="${(y + Math.sin(a)*d*.7).toFixed(1)}" r="${3 + (i % 3)}" style="fill:${i % 4 ? col : "#7A9A4A"}"/>`; }).join("")}</g>`;
}
// trees
function orangeTree(x, y, s = 1){
  const se = ssn(), fruit = se === "winter" ? "#F28C28" : se === "autumn" ? "#E8A43A" : se === "summer" ? "#9DB85A" : null, bloom = se === "spring";
  const dots = [[-8, -26], [6, -30], [10, -18], [-4, -16], [0, -36], [-12, -14], [12, -28]];
  return `<g pointer-events="none">${sk(`<rect x="${x - 2.5*s}" y="${y - 12*s}" width="${5*s}" height="${12*s}" style="fill:#7A5638"/><circle cx="${x}" cy="${y - 24*s}" r="${15*s}" style="fill:${C.leaf}"/><circle cx="${x - 8*s}" cy="${y - 18*s}" r="${8*s}" style="fill:#5E8A48"/>`,
    `<circle cx="${x}" cy="${y - 24*s}" r="${15*s}"/>`)}<g ${W} stroke-width=".6">${dots.map(([dx, dy]) => fruit ? `<circle cx="${x + dx*s}" cy="${y + dy*s}" r="${2.4*s}" style="fill:${fruit}"/>` : bloom ? `<circle cx="${x + dx*s}" cy="${y + dy*s}" r="${1.8*s}" style="fill:#FFFDF6"/>` : "").join("")}</g>
    <ellipse cx="${x}" cy="${y + 1}" rx="${9*s}" ry="${3*s}" style="fill:#B98F4E" opacity=".5"/></g>`;
}
const cypress = (x, y, s = 1) => `<g pointer-events="none">${sk(`<path d="M${x} ${y - 64*s} C${x + 9*s} ${y - 44*s} ${x + 10*s} ${y - 14*s} ${x + 4*s} ${y} H${x - 4*s} C${x - 10*s} ${y - 14*s} ${x - 9*s} ${y - 44*s} ${x} ${y - 64*s}z" style="fill:${C.cypress}"/>`,
  `<path d="M${x} ${y - 64*s} C${x + 9*s} ${y - 44*s} ${x + 10*s} ${y - 14*s} ${x + 4*s} ${y} H${x - 4*s} C${x - 10*s} ${y - 14*s} ${x - 9*s} ${y - 44*s} ${x} ${y - 64*s}z"/>`)}</g>`;
const oliveTree = (x, y, s = 1) => `<g pointer-events="none">${sk(`<path d="M${x - 2*s} ${y} q-3 ${-8*s} ${2*s} ${-14*s} q3 ${-4*s} 0 ${-8*s}" style="fill:none;stroke:#8A7A62" stroke-width="${3.5*s}"/><ellipse cx="${x - 6*s}" cy="${y - 24*s}" rx="${11*s}" ry="${8*s}" style="fill:${C.olive}"/><ellipse cx="${x + 7*s}" cy="${y - 27*s}" rx="${10*s}" ry="${7*s}" style="fill:#A9B58E"/>`,
  `<ellipse cx="${x - 6*s}" cy="${y - 24*s}" rx="${11*s}" ry="${8*s}"/><ellipse cx="${x + 7*s}" cy="${y - 27*s}" rx="${10*s}" ry="${7*s}"/>`)}</g>`;
// the plane trees of the avenue: big, pale, with mottled trunks (bare in winter)
function planeTree(x, y, s = 1){
  const se = ssn(), crown = se === "autumn" ? "#C9A44A" : "#A9BF7A", bare = se === "winter";
  return `<g pointer-events="none">${sk(`<rect x="${x - 3.5*s}" y="${y - 22*s}" width="${7*s}" height="${22*s}" style="fill:#C9B48E"/><circle cx="${x - 1*s}" cy="${y - 14*s}" r="${2*s}" style="fill:#E7DCC4"/><circle cx="${x + 1.5*s}" cy="${y - 6*s}" r="${1.6*s}" style="fill:#9C8A6A"/>${bare ? `<path d="M${x} ${y - 22*s} l${-12*s} ${-14*s} M${x} ${y - 22*s} l${10*s} ${-16*s} M${x} ${y - 24*s} v${-18*s}" style="stroke:#9C8A6A" stroke-width="${2.4*s}"/>` : `<ellipse cx="${x}" cy="${y - 38*s}" rx="${22*s}" ry="${17*s}" style="fill:${crown}"/><ellipse cx="${x - 10*s}" cy="${y - 32*s}" rx="${10*s}" ry="${8*s}" style="fill:#95AE68"/>`}`,
    bare ? `<rect x="${x - 3.5*s}" y="${y - 22*s}" width="${7*s}" height="${22*s}"/>` : `<ellipse cx="${x}" cy="${y - 38*s}" rx="${22*s}" ry="${17*s}"/><rect x="${x - 3.5*s}" y="${y - 22*s}" width="${7*s}" height="${22*s}"/>`)}</g>`;
}
// the pinsapo: a fir that grows only in these mountains, dark blue-green, in stiff tiers
const pinsapo = (x, y, s = 1) => `<g pointer-events="none">${sk(`<rect x="${x - 2.5*s}" y="${y - 10*s}" width="${5*s}" height="${10*s}" style="fill:#6B4A34"/>${[0, 1, 2, 3].map(i => `<path d="M${x} ${y - (70 - i*14)*s} L${x + (10 + i*6)*s} ${y - (48 - i*12)*s} H${x - (10 + i*6)*s}z" style="fill:${i % 2 ? "#3E5E58" : "#4A6E66"}"/>`).join("")}`,
  `<path d="M${x} ${y - 70*s} L${x + 28*s} ${y - 12*s} H${x - 28*s}z"/>`)}</g>`;
// almond: pink-white blossom in winter, bare-ish otherwise; on the slopes and in the old town
function almond(x, y, s = 1){
  const se = ssn(), col = se === "winter" ? "#F6D5DF" : se === "autumn" ? "#C9B07A" : "#B4C48A";
  return `<g pointer-events="none">${sk(`<path d="M${x} ${y} v${-14*s} l${-8*s} ${-8*s} M${x} ${y - 14*s} l${8*s} ${-10*s}" style="stroke:#7A5A44;fill:none" stroke-width="${2.4*s}"/><ellipse cx="${x}" cy="${y - 24*s}" rx="${15*s}" ry="${10*s}" style="fill:${col}"/>`,
    `<ellipse cx="${x}" cy="${y - 24*s}" rx="${15*s}" ry="${10*s}"/>`)}${se === "winter" ? `<g pointer-events="none">${[[-8, -26], [4, -30], [9, -22], [-2, -20], [-11, -20]].map(([dx, dy]) => `<circle cx="${x + dx*s}" cy="${y + dy*s}" r="${1.8*s}" style="fill:#E890A8"/>`).join("")}</g>` : ""}</g>`;
}
const pricklyPear = (x, y) => `<g pointer-events="none" ${W} stroke-width=".9">${[[0, 0, 7, 9], [-7, -9, 6, 7], [7, -11, 6, 8], [1, -18, 5, 6]].map(([dx, dy, rx, ry]) => `<ellipse cx="${x + dx}" cy="${y + dy}" rx="${rx}" ry="${ry}" style="fill:#7C9A5A"/>`).join("")}${ssn() === "summer" ? `<circle cx="${x + 9}" cy="${y - 19}" r="2" style="fill:#E8566C"/><circle cx="${x - 6}" cy="${y - 16}" r="2" style="fill:#F3C969"/>` : ""}</g>`;
// a black iron lantern on a post (lights up at dusk: .lglow)
const lantern = (x, y) => lampGlow(x, y - 34, 30) + sk(`<path d="M${x - 5} ${y - 40} h10 l-2 10 h-6z" style="fill:#F6C26B"/>`, `<path d="M${x} ${y} v-30 M${x - 5} ${y} h10 M${x - 5} ${y - 40} h10 l-2 10 h-6z M${x - 6} ${y - 40} l6 -5 l6 5"/>`);
// a stone gateway between screens: two ochre pillars with a white arch, and a tape label
const gate = (id, x, y, label, lx, ly, aria, col = "#F6E3B4") => `<g data-place="${id}" aria-label="${aria}"><ellipse class="hov" cx="${x}" cy="${y + 6}" rx="26" ry="20" style="fill:var(--butter)"/>
  ${sk(`<rect x="${x - 20}" y="${y - 30}" width="8" height="40" style="fill:${C.ochre}"/><rect x="${x + 12}" y="${y - 30}" width="8" height="40" style="fill:${C.ochre}"/><path d="M${x - 22} ${y - 28} q22 -22 44 0 v6 q-22 -18 -44 0z" style="fill:${C.white}"/>`,
    `<rect x="${x - 20}" y="${y - 30}" width="8" height="40"/><rect x="${x + 12}" y="${y - 30}" width="8" height="40"/><path d="M${x - 22} ${y - 28} q22 -22 44 0 v6 q-22 -18 -44 0z"/>`)}${lab(lx, ly, label, col, 11)}</g>`;
// griffon vultures, circling slowly on the thermals over the gorge (and the odd ibex-shy kestrel)
const vultures = (cx, cy, rx, ry, n = 3) => `<g pointer-events="none">${Array.from({length: n}, (_, i) => `<g><path d="M-14 0 q7 -6 14 -1 q7 -5 14 1 q-7 -2 -14 3 q-7 -5 -14 -3z" style="fill:#5A4636;stroke:var(--line)" stroke-width=".8"/><circle cx="0" cy="-1" r="2" style="fill:#E7D3B2"/>
  <animateMotion dur="${26 + i*7}s" begin="${-i*9}s" repeatCount="indefinite" path="M${cx + rx} ${cy + i*10} a${rx} ${ry} 0 1 ${i % 2} ${-2*rx} 0 a${rx} ${ry} 0 1 ${i % 2} ${2*rx} 0"/></g>`).join("")}</g>`;
// swifts screaming round in summer
const swifts = (cx, cy) => ssn() !== "summer" ? "" : `<g pointer-events="none">${[0, 1, 2, 3].map(i => `<path d="M-6 2 q3 -4 6 -1 q3 -3 6 1" style="fill:none;stroke:#2F2B28" stroke-width="1.4"><animateMotion dur="${4 + i}s" begin="${-i*1.3}s" repeatCount="indefinite" path="M${cx} ${cy + i*12} c60 -40 120 30 40 50 s-120 -10 -40 -50"/></path>`).join("")}</g>`;
// pigeons pecking about
const pigeons = pts => `<g pointer-events="none" ${W} stroke-width=".8">${pts.map(([x, y], i) => `<g><ellipse cx="${x}" cy="${y}" rx="5" ry="3.4" style="fill:#9AA0AE"/><circle cx="${x + (i % 2 ? -5 : 5)}" cy="${y - 3}" r="2.4" style="fill:#7D8496"/><animateTransform attributeName="transform" type="translate" values="0 0;0 1.5;0 0" dur="${.8 + i*.2}s" repeatCount="indefinite"/></g>`).join("")}</g>`;
// a cat asleep on a sunny wall
const cat = (x, y, col = "#E8A45A") => `<g pointer-events="none" ${W} stroke-width=".9"><ellipse cx="${x}" cy="${y}" rx="9" ry="5" style="fill:${col}"/><circle cx="${x + 8}" cy="${y - 3}" r="4" style="fill:${col}"/><path d="M${x + 5} ${y - 6} l1 -4 l2 3 M${x + 9} ${y - 6} l2 -4 l1 4"/><path d="M${x - 9} ${y + 1} q-6 1 -4 -5" fill="none"/></g>`;
// a bench (iron and wood)
const bench = (x, y) => `<g pointer-events="none">${sk(`<rect x="${x - 20}" y="${y - 8}" width="40" height="6" rx="2" style="fill:#C9A27E"/><rect x="${x - 20}" y="${y - 16}" width="40" height="4" rx="2" style="fill:#C9A27E"/>`, `<rect x="${x - 20}" y="${y - 8}" width="40" height="6" rx="2"/><path d="M${x - 17} ${y - 2} v6 M${x + 17} ${y - 2} v6 M${x - 18} ${y - 12} v4 M${x + 18} ${y - 12} v4"/>`)}</g>`;
// a cobbled ground (grey river pebbles) as a pattern
const defs = `<defs><pattern id="rdcob" width="22" height="16" patternUnits="userSpaceOnUse"><rect width="22" height="16" fill="${C.cobble}"/><ellipse cx="5" cy="4" rx="4" ry="2.6" fill="#C7BEAE"/><ellipse cx="16" cy="5" rx="4.4" ry="2.4" fill="#CFC6B6"/><ellipse cx="10" cy="12" rx="4.2" ry="2.6" fill="#C2B9A8"/><ellipse cx="20" cy="13" rx="2.6" ry="2" fill="#CBC2B2"/></pattern>
  <linearGradient id="rdgorge" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6E5843"/><stop offset=".6" stop-color="#3E3128"/><stop offset="1" stop-color="#2E241E"/></linearGradient>
  <linearGradient id="rdvalley" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9DB0C8"/><stop offset=".18" stop-color="#C8D2A8"/><stop offset="1" stop-color="#B3BE86"/></linearGradient></defs>`;
// a white house: wall, tiled roof, a door, grilled windows, maybe a balcony, ochre plinth
function casa(x, y, w, h, o = {}){
  const roof = tileRoof(x - 4, y - 14, w + 8, 16), win = [];
  const nW = Math.max(1, Math.floor((w - 20)/36));
  for (let i = 0; i < nW; i++) win.push(o.shut ? shutters(x + 18 + i*((w - 36)/Math.max(1, nW - 1 || 1)), y + 12) : reja(x + 14 + i*((w - 30)/Math.max(1, nW - 1 || 1)), y + 12));
  const bal = o.balcony ? balcony(x + w/2 - 16, y + 34) : null;
  const door = o.door === false ? {art: "", lines: ""} : {art: `<path d="M${x + (o.doorX || w/2) - 9} ${y + h} v-24 q9 -9 18 0 v24z" style="fill:#7A4A30"/>`, lines: `<path d="M${x + (o.doorX || w/2) - 9} ${y + h} v-24 q9 -9 18 0 v24z"/>`};
  return shade(x, y, w, h) + sk(`<rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:${o.wall || C.white}"/><rect x="${x}" y="${y + h - 7}" width="${w}" height="7" style="fill:${C.ochre}" opacity=".85"/>${roof.art}${win.map(v => v.art).join("")}${bal ? bal.art : ""}${door.art}`,
    `<rect x="${x}" y="${y}" width="${w}" height="${h}"/>${roof.lines}${win.map(v => v.lines).join("")}${bal ? bal.lines : ""}${door.lines}`) + (bal ? bal.pots : "") + (o.bougain ? bougain(x + (o.bougain === "l" ? 6 : w - 6), y + 4, 14) : "") + (o.pots ? pot(x + 8, y + h + 2) + pot(x + w - 8, y + h + 2, "#E85A8A") : "");
}
// a strip of the gorge: rim at the top (rimY), down to the bottom (y2); the river far below
function gorgeBand(x1, x2, y1, y2, o = {}){
  const w = x2 - x1, face = Math.round((y2 - y1)*.55);
  const rim = Array.from({length: Math.ceil(w/16) + 1}, (_, i) => `${x1 + i*16} ${y1 + (i % 2 ? 3 : -2)}`).join(" L");
  const lip = Array.from({length: Math.ceil(w/14) + 1}, (_, i) => `${x2 - i*14} ${y2 - (i % 2 ? 2 : 6)}`).join(" L");
  return `<g pointer-events="none"><path d="M${x1} ${y1} H${x2} V${y2} H${x1}z" fill="url(#rdgorge)"/>
    <path d="M${rim} V${y1 + face} H${x1}z" style="fill:${C.cliff}" filter="url(#marker)"/>
    <g ${W} stroke-width="1.1" filter="url(#wob)"><path d="M${rim}" fill="none"/>${Array.from({length: Math.ceil(w/22)}, (_, i) => `<path d="M${x1 + 8 + i*22} ${y1 + 6} l${i % 2 ? 3 : -2} ${face*.6}" style="stroke:${C.cliff2}" stroke-width="1.6"/>`).join("")}</g>
    ${o.river !== false ? `<path d="M${x1} ${y1 + face + (y2 - y1 - face)*.55} q${w/4} -6 ${w/2} 0 t${w/2} 0" style="fill:none;stroke:#8FC4D8" stroke-width="3" opacity=".8"/>` : ""}
    <path d="M${x1} ${y2} L${lip} L${x1} ${y2 - 4}z" style="fill:${C.earth}" filter="url(#marker)"/><path d="M${lip}" ${W} fill="none" filter="url(#wob)"/></g>`;
}
// an iron railing along a cliff edge (horizontal from x1 to x2 at y, or vertical when v)
const railing = (x1, x2, y, v) => `<g pointer-events="none" ${W} stroke-width="1.1" filter="url(#wob)">${v ? `<path d="M${y} ${x1} V${x2} M${y + 4} ${x1} V${x2}"/>${Array.from({length: Math.floor((x2 - x1)/9)}, (_, i) => `<path d="M${y - 2} ${x1 + i*9} h8" stroke-width=".8"/>`).join("")}`
  : `<path d="M${x1} ${y} H${x2} M${x1} ${y - 9} H${x2}"/>${Array.from({length: Math.floor((x2 - x1)/7) + 1}, (_, i) => `<path d="M${x1 + i*7} ${y} v-9" stroke-width=".8"/>`).join("")}`}</g>`;

/* ---------- rd_station: the station, the avenue, the Alameda and the valley ---------- */
function valley(){
  const se = ssn(), field = {spring: ["#B9C98A", "#D9473A", "#C8D49A", "#E9E3B0"], summer: ["#E9C84A", "#D8C27A", "#B8B070", "#EAD9A0"], autumn: ["#8E5A6E", "#B9A06A", "#9A7A4A", "#C9B07A"], winter: ["#9DB07A", "#B4BE90", "#C6C3A0", "#A8B58A"]}[se];
  const patches = [[6, 200, 30, 40], [36, 180, 34, 50], [4, 250, 40, 60], [44, 236, 26, 70], [10, 320, 34, 50], [48, 312, 22, 60], [6, 380, 44, 56], [50, 380, 22, 70], [8, 446, 36, 70], [46, 456, 24, 60], [4, 520, 40, 60], [44, 520, 26, 70], [10, 584, 30, 56]];
  return `<g pointer-events="none"><rect x="0" y="0" width="84" height="640" fill="url(#rdvalley)"/>
    <path d="M0 40 L12 22 L22 34 L34 14 L48 30 L60 12 L72 28 L84 18 V70 H0z" style="fill:#7F95B8"/><path d="M0 70 L14 52 L28 62 L42 48 L58 60 L70 50 L84 58 V90 H0z" style="fill:#94A7C2"/>
    ${patches.map(([x, y, w, h], i) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" style="fill:${field[i % 4]}" opacity=".85"/>`).join("")}
    <g style="fill:#7F8E5C">${Array.from({length: 40}, (_, i) => `<circle cx="${6 + (i*17) % 70}" cy="${110 + Math.floor(i/4)*50 + (i % 3)*6}" r="2.2"/>`).join("")}</g>
    ${[[30, 150], [60, 300], [20, 430], [56, 560]].map(([x, y]) => `<rect x="${x}" y="${y}" width="9" height="6" style="fill:#FBF7EE;stroke:var(--line)" stroke-width=".6"/><path d="M${x - 1} ${y} l5.5 -3 l5.5 3z" style="fill:${C.terra}"/>`).join("")}
    <path d="M70 0 L80 40 L72 90 L82 150 L74 220 L84 300 L76 380 L86 460 L78 540 L84 640 H96 V0z" style="fill:${C.cliff}" filter="url(#marker)"/>
    <path d="M70 0 L80 40 L72 90 L82 150 L74 220 L84 300 L76 380 L86 460 L78 540 L84 640" ${W} fill="none" filter="url(#wob)"/></g>`;
}
function stationScreen(){
  const ground = `<rect width="520" height="640" style="fill:${C.earth}"/>
    <g filter="url(#wob)"><path d="M330 168 V400 Q330 440 290 450 L130 468" fill="none" style="stroke:${C.gravel}" stroke-width="34" stroke-linecap="round"/><path d="M340 300 H520" fill="none" style="stroke:${C.gravel}" stroke-width="30"/><path d="M180 470 V600" fill="none" style="stroke:${C.gravel}" stroke-width="26"/></g>
    <ellipse cx="200" cy="480" rx="120" ry="70" style="fill:${C.gravel}" filter="url(#wash)" opacity=".9"/>`;
  // the railway along the top, with the little blue and white train you came on
  const rail = `<g pointer-events="none"><rect x="0" y="34" width="520" height="18" style="fill:#CBBFA6"/>${Array.from({length: 33}, (_, i) => `<rect x="${i*16}" y="34" width="6" height="18" style="fill:#8A6A52"/>`).join("")}<path d="M0 38 H520 M0 48 H520" style="stroke:#7D7A78" stroke-width="2.4"/></g>
    ${sk(`<rect x="40" y="10" width="150" height="34" rx="8" style="fill:#FFFDF6"/><rect x="40" y="30" width="150" height="8" style="fill:#3E6BAE"/>${[54, 82, 110, 138, 166].map(x => `<rect x="${x}" y="15" width="18" height="11" rx="2" style="fill:#9FD3E8"/>`).join("")}`,
      `<rect x="40" y="10" width="150" height="34" rx="8"/>`)}`;
  const st = `<g data-place="rdtrain" aria-label="Ronda station">${shade(250, 76, 160, 80)}
    ${sk(`<rect x="250" y="76" width="160" height="80" style="fill:${C.white}"/>${tileRoof(244, 58, 172, 20).art}<rect x="250" y="148" width="160" height="8" style="fill:${C.ochre}"/>${[268, 300, 360, 392].map(x => shutters(x, 96, 12, 22).art).join("")}<path d="M320 156 v-34 q10 -10 20 0 v34z" style="fill:#4F7A5A"/><circle cx="330" cy="88" r="7" style="fill:#FFFDF6"/><rect x="300" y="160" width="60" height="6" style="fill:#B9AE9A"/>`,
      `<rect x="250" y="76" width="160" height="80"/>${tileRoof(244, 58, 172, 20).lines}${[268, 300, 360, 392].map(x => shutters(x, 96, 12, 22).lines).join("")}<path d="M320 156 v-34 q10 -10 20 0 v34z"/><circle cx="330" cy="88" r="7"/><path d="M330 84 v4 h3"/>`)}
    <rect x="296" y="64" width="68" height="13" rx="2" style="fill:#3E6BAE;stroke:var(--line)" stroke-width="1"/><text x="330" y="74" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="9" fill="#FFFDF6" pointer-events="none">RONDA</text>
    ${pot(258, 166)}${pot(402, 166, "#E85A8A")}${lab(330, 180, "Station · trains home", "#C3DDF3", 10)}</g>`;
  // the avenue down from the station: plane trees and orange trees, iron lanterns
  const avenue = [[286, 262], [374, 262], [286, 350], [374, 370]].map(([x, y], i) => i % 2 ? orangeTree(x, y, .9) : planeTree(x, y, 1)).join("") + lantern(300, 400) + lantern(360, 280);
  // the Alameda: a bandstand, pinsapos, beds of geraniums, benches; the balcony right on the cliff edge
  const kiosk = `<g data-place="bandstand" aria-label="The bandstand">${shade(182, 420, 64, 44, 10)}
    ${sk(`<path d="M184 466 L192 450 H236 L244 466z" style="fill:${C.white}"/><path d="M180 428 Q214 396 248 428z" style="fill:#8FA79A"/><rect x="180" y="426" width="68" height="5" style="fill:#FFFDF6"/>`,
      `<path d="M184 466 L192 450 H236 L244 466z"/><path d="M180 428 Q214 396 248 428z"/><path d="M188 431 V452 M204 431 V450 M224 431 V450 M240 431 V452"/>`)}${lab(214, 488 + 16, "Bandstand", "#E7D9F2", 9)}</g>`;
  const balc = `<g data-place="alameda" aria-label="The Alameda balcony over the valley"><ellipse class="hov" cx="114" cy="470" rx="32" ry="40" style="fill:var(--butter)"/>
    ${sk(`<path d="M96 420 Q64 470 96 520 H122 V420z" style="fill:#E3D3AE"/>`, `<path d="M96 420 Q64 470 96 520"/>`)}
    <path d="M96 420 Q64 470 96 520" fill="none" style="stroke:${C.iron}" stroke-width="2" filter="url(#wob)"/><path d="M92 424 Q60 470 92 516" fill="none" style="stroke:${C.iron}" stroke-width="1" stroke-dasharray="1 5" filter="url(#wob)"/>
    ${bench(116, 452)}${lab(122, 548, "The Alameda balcony", "#F6E3B4", 10)}</g>`;
  const garden = pinsapo(300, 540, .9) + pinsapo(384, 470, .8) + pinsapo(150, 380, .7) + cypress(470, 560, .9) + cypress(500, 470, .8) + orangeTree(260, 420, .8)
    + `<g pointer-events="none">${[[150, 560], [250, 556], [330, 600], [430, 420]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="22" ry="8" style="fill:#B7C09C;stroke:var(--line)" stroke-width=".8"/>`).join("")}</g>`
    + [[140, 566], [160, 558], [244, 560], [262, 552], [320, 604], [344, 598], [420, 424], [440, 418]].map(([x, y], i) => pot(x, y, i % 2 ? C.geranium : "#E85A8A")).join("")
    + bench(260, 500) + bench(400, 520) + lantern(150, 520) + lantern(250, 380);
  // along the bottom: the edge of the gorge, and the steps down into it
  const edge = gorgeBand(84, 520, 594, 640) + railing(84, 152, 594) + railing(210, 520, 594)
    + `<g pointer-events="none" ${W} stroke-width="1">${[0, 1, 2, 3, 4].map(i => `<rect x="${158 + i*2}" y="${596 + i*9}" width="${44 - i*4}" height="7" style="fill:#CDBF9F"/>`).join("")}</g><g data-place="rdStepsDown" aria-label="Down the steps into the gorge, to the old town"><ellipse class="hov" cx="180" cy="612" rx="30" ry="18" style="fill:var(--butter)" opacity=".0"/>${lab(180, 576, "Steps down into the gorge", "#F6E3B4", 10)}</g>`;
  return defs + lampDefs + ground + valley() + vultures(40, 300, 30, 70) + rail + avenue + garden + kiosk + balc + st + edge
    + gate("rdToPlaza", 500, 300, "The plaza", 470, 262, "East to the plaza and the market") + cat(420, 170) + swifts(200, 120);
}

/* ---------- rd_plaza: the square, the fountain, the market, the tapas bar, the sweet shop ---------- */
function plazaScreen(){
  const ground = `<rect width="520" height="640" fill="url(#rdcob)"/><ellipse cx="260" cy="350" rx="150" ry="96" style="fill:#E4DCCB" filter="url(#wash)"/>
    <g ${W} stroke-width=".8" opacity=".5">${Array.from({length: 10}, (_, i) => `<path d="M${110 + i*30} ${290 + (i % 2)*4} l10 6" />`).join("")}</g>`;
  // the covered market: a long white hall, arched openings, crates of oranges inside
  const market = `<g data-place="mercado" aria-label="The covered market">${shade(30, 50, 198, 122)}
    ${sk(`<rect x="30" y="50" width="198" height="122" style="fill:${C.white}"/>${tileRoof(24, 28, 210, 24).art}<rect x="30" y="164" width="198" height="8" style="fill:${C.ochre}"/>${[48, 112, 176].map(x => `<path d="M${x} 172 v-56 q20 -24 40 0 v56z" style="fill:#5A4A3E"/><rect x="${x + 6}" y="150" width="28" height="12" style="fill:#C9A27E"/>${[0, 1, 2, 3].map(k => `<circle cx="${x + 10 + k*7}" cy="148" r="3.2" style="fill:#F28C28"/>`).join("")}`).join("")}`,
      `<rect x="30" y="50" width="198" height="122"/>${tileRoof(24, 28, 210, 24).lines}${[48, 112, 176].map(x => `<path d="M${x} 172 v-56 q20 -24 40 0 v56z"/>`).join("")}`)}
    <rect x="86" y="58" width="86" height="15" rx="2" style="fill:#FFFDF6;stroke:var(--line)" stroke-width="1"/><text x="129" y="69" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="9.5" fill="#A84E2E" pointer-events="none">MERCADO</text>
    ${lab(130, 202, "The covered market", "#F6E3B4", 10)}</g>`;
  // the tapas bar: ochre trim, green door, a hanging sign; a terrace with parasols out front
  const bar = `<g data-place="tapas" aria-label="The tapas bar">${shade(292, 50, 196, 122)}
    ${sk(`<rect x="292" y="50" width="196" height="122" style="fill:${C.white}"/>${tileRoof(286, 28, 208, 24).art}<rect x="292" y="50" width="196" height="12" style="fill:${C.ochre}"/><rect x="292" y="164" width="196" height="8" style="fill:${C.ochre}"/>${reja(310, 92, 22, 26).art}${reja(446, 92, 22, 26).art}<path d="M380 172 v-46 q12 -12 24 0 v46z" style="fill:${C.shutter}"/>${balcony(354, 90, 76).art}`,
      `<rect x="292" y="50" width="196" height="122"/>${tileRoof(286, 28, 208, 24).lines}${reja(310, 92, 22, 26).lines}${reja(446, 92, 22, 26).lines}<path d="M380 172 v-46 q12 -12 24 0 v46z"/>${balcony(354, 90, 76).lines}`)}${balcony(354, 90, 76).pots}
    <rect x="344" y="66" width="96" height="14" rx="2" style="fill:#8E2C48;stroke:var(--line)" stroke-width="1"/><text x="392" y="76.5" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="9" fill="#FFFDF6" pointer-events="none">BAR · TAPAS</text>
    ${bougain(296, 70, 16)}${lab(392, 202, "The tapas bar", "#F6D3DC", 10)}</g>`;
  const terrace = [[318, 236], [462, 236], [470, 290]].map(([x, y]) => `<g pointer-events="none">${sk(`<ellipse cx="${x}" cy="${y}" rx="11" ry="5" style="fill:#FFFDF6"/><rect x="${x - 1}" y="${y}" width="2" height="9" style="fill:#7D7A78"/><path d="M${x - 22} ${y - 28} Q${x} ${y - 46} ${x + 22} ${y - 28}z" style="fill:#E8D6A8"/><path d="M${x - 11} ${y - 33} Q${x} ${y - 46} ${x + 11} ${y - 33}" style="fill:none;stroke:#5E8A5A" stroke-width="3"/><rect x="${x - .8}" y="${y - 40}" width="1.6" height="40" style="fill:#7D7A78"/>`,
    `<ellipse cx="${x}" cy="${y}" rx="11" ry="5"/><path d="M${x - 22} ${y - 28} Q${x} ${y - 46} ${x + 22} ${y - 28}z"/>`)}<circle cx="${x - 16}" cy="${y + 4}" r="4" style="fill:#C9A27E;stroke:var(--line)" stroke-width=".8"/><circle cx="${x + 16}" cy="${y + 4}" r="4" style="fill:#C9A27E;stroke:var(--line)" stroke-width=".8"/></g>`).join("");
  // Doña Carmen's sweet shop, on the east side: a pink striped awning and a window of yemas
  const sweets = `<g data-place="dulces" aria-label="Doña Carmen's sweet shop">${shade(440, 384, 80, 116, 10)}
    ${sk(`<rect x="440" y="384" width="80" height="116" style="fill:${C.wall2}"/>${tileRoof(436, 366, 88, 20).art}<rect x="440" y="492" width="80" height="8" style="fill:${C.ochre}"/><rect x="452" y="414" width="44" height="34" rx="2" style="fill:#FFF3D8"/>${[0, 1, 2, 3, 4].map(k => `<circle cx="${460 + k*7}" cy="${438}" r="3" style="fill:#F3C24A"/>`).join("")}<rect x="458" y="420" width="12" height="9" rx="2" style="fill:#C98A4A"/><path d="M440 404 h80 l-4 10 h-72z" style="fill:#F2A0B8"/><path d="M450 404 l-2 10 M466 404 l-2 10 M482 404 l-2 10 M498 404 l-2 10" style="stroke:#FFFDF6" stroke-width="3"/><path d="M444 500 v-36 q8 -8 16 0 v36z" style="fill:#7A4A30"/>`,
      `<rect x="440" y="384" width="80" height="116"/>${tileRoof(436, 366, 88, 20).lines}<rect x="452" y="414" width="44" height="34" rx="2"/><path d="M440 404 h80 l-4 10 h-72z"/><path d="M444 500 v-36 q8 -8 16 0 v36z"/>`)}
    <rect x="456" y="456" width="52" height="12" rx="2" style="fill:#FFFDF6;stroke:var(--line)" stroke-width="1"/><text x="482" y="465" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="7.6" fill="#C2307A" pointer-events="none">DULCES</text>
    ${pot(432, 506)}${lab(456, 524, "Doña Carmen's sweets", "#F6D3DC", 10)}</g>`;
  // the fountain: an octagonal basin with blue and white tiles, water arcing from the column
  const fountain = `<g data-place="fuente" aria-label="The fountain"><ellipse class="hov" cx="260" cy="350" rx="50" ry="26" style="fill:var(--butter)"/>
    ${sk(`<path d="M222 336 L238 318 H282 L298 336 V352 L282 368 H238 L222 352z" style="fill:#F3ECDD"/><path d="M226 338 L240 322 H280 L294 338 V348 L280 362 H240 L226 348z" style="fill:#9FD3E8"/><rect x="254" y="306" width="12" height="30" rx="3" style="fill:#E3D3AE"/>`,
      `<path d="M222 336 L238 318 H282 L298 336 V352 L282 368 H238 L222 352z"/><rect x="254" y="306" width="12" height="30" rx="3"/>`)}
    <g pointer-events="none">${[0, 1, 2, 3, 4, 5, 6, 7].map(k => `<rect x="${228 + k*8}" y="${352 + (k > 0 && k < 7 ? 8 : 0)}" width="6" height="5" style="fill:${k % 2 ? "#3E6BAE" : "#FFFDF6"};stroke:var(--line)" stroke-width=".5"/>`).join("")}
    <path d="M260 308 q-16 -6 -24 22 M260 308 q16 -6 24 22" style="fill:none;stroke:#CFE8F4" stroke-width="2.4" stroke-dasharray="4 5"><animate attributeName="stroke-dashoffset" from="0" to="-18" dur="1s" repeatCount="indefinite"/></path></g>${lab(260, 390, "Fountain", "#C3DDF3", 9)}</g>`;
  const trees = orangeTree(130, 300, 1) + orangeTree(400, 316, 1) + orangeTree(120, 460, 1) + orangeTree(350, 470, .95) + orangeTree(210, 250, .8);
  const side = casa(0, 520, 70, 64, {door: false, bougain: "r", pots: true}) + casa(0, 404, 56, 80, {door: false, balcony: true});
  const benches = bench(206, 452) + bench(320, 288) + lantern(170, 340) + lantern(350, 360) + lantern(80, 210);
  const edge = gorgeBand(0, 520, 600, 640, {river: false}) + railing(0, 290, 598) + railing(372, 520, 598)
    + `${sk(`<rect x="292" y="586" width="10" height="54" style="fill:#CDA261"/><rect x="360" y="586" width="10" height="54" style="fill:#CDA261"/><rect x="302" y="590" width="58" height="50" fill="url(#rdcob)"/>`, `<rect x="292" y="586" width="10" height="54"/><rect x="360" y="586" width="10" height="54"/>`)}
    ${lantern(290, 586)}${lantern(372, 586)}<g data-place="rdBridgeN" aria-label="Over Puente Nuevo to the south side"><ellipse class="hov" cx="330" cy="614" rx="30" ry="14" style="fill:var(--butter)"/>${lab(330, 570, "Puente Nuevo", "#F6E3B4", 11)}</g>`;
  return defs + lampDefs + ground + market + bar + terrace + trees + side + sweets + fountain + benches + pigeons([[218, 396], [236, 404], [290, 398], [180, 360], [312, 410]]) + edge
    + gate("rdToStation", 16, 330, "The station", 50, 292, "West to the station and the Alameda") + cat(150, 176, "#5A4A40") + vultures(260, 560, 120, 30, 2);
}

/* ---------- rd_bridge: Puente Nuevo, the viewpoint, the palace and the Moorish garden ---------- */
function bridgeScreen(){
  const ground = `<rect width="520" height="640" style="fill:${C.earth}"/><g filter="url(#wob)"><path d="M310 214 V300 Q310 330 280 340 Q230 360 230 440 L20 520 M330 330 C380 300 420 280 440 262 M310 330 V430" fill="none" style="stroke:${C.cobble}" stroke-width="30" stroke-linecap="round"/></g>`;
  // the gorge across the top: the far cliff face, the river and the waterfall a hundred metres down
  const gorge = `<g pointer-events="none"><rect x="0" y="0" width="520" height="214" fill="url(#rdgorge)"/>
    <path d="M0 0 H520 V18 L500 60 L470 90 L440 104 L400 120 H120 L80 104 L40 80 L0 60z" style="fill:${C.cliff}" filter="url(#marker)"/>
    <g ${W} filter="url(#wob)"><path d="M0 60 L40 80 L80 104 L120 120 H400 L440 104 L470 90 L500 60 L520 18" fill="none"/>${Array.from({length: 22}, (_, i) => `<path d="M${10 + i*24} ${8 + (i % 3)*4} l${i % 2 ? 4 : -3} ${40 + (i % 4)*12}" style="stroke:${C.cliff2}" stroke-width="1.6"/>`).join("")}</g>
    <path d="M0 160 q130 -10 260 0 t260 0" style="fill:none;stroke:#8FC4D8" stroke-width="5"/><path d="M0 160 q130 -10 260 0 t260 0" style="fill:none;stroke:#FFFDF6" stroke-width="1.4" stroke-dasharray="6 16"><animate attributeName="stroke-dashoffset" from="0" to="-44" dur="2.4s" repeatCount="indefinite"/></path>
    ${pricklyPear(60, 70)}${pricklyPear(470, 74)}</g>`;
  // the bridge: its great stone pier dropping into the gorge, with the tall arch and the waterfall through it; the deck on top
  const arch = x => `<path d="M${x} 180 V104 Q${x + 22} 62 ${x + 44} 104 V180z" style="fill:#3A2E26"/>`;
  const fallIn = x => `<path d="M${x + 12} 108 h20 l4 66 h-28z" style="fill:#CFE8F4"/>${[0, 1, 2].map(i => `<path d="M${x + 16 + i*6} 112 v58" style="stroke:#FFFDF6" stroke-width="1.6" stroke-dasharray="8 10"><animate attributeName="stroke-dashoffset" from="0" to="-36" dur="${.7 + i*.15}s" repeatCount="indefinite"/></path>`).join("")}<ellipse cx="${x + 22}" cy="176" rx="22" ry="6" style="fill:#FFFDF6" opacity=".6"/>`;
  const pier = sk(`<path d="M196 16 H424 L410 186 H210z" style="fill:#CDA261"/>${arch(212)}${arch(364)}<rect x="226" y="40" width="14" height="12" rx="2" style="fill:#3A2E26"/><rect x="380" y="40" width="14" height="12" rx="2" style="fill:#3A2E26"/>${Array.from({length: 8}, (_, i) => `<path d="M${200 + i*1.7} ${30 + i*20} H${420 - i*1.7}" style="stroke:#B98F4E" stroke-width="1.2"/>`).join("")}`,
    `<path d="M196 16 H424 L410 186 H210z"/><path d="M212 180 V104 Q234 62 256 104 V180 M364 180 V104 Q386 62 408 104 V180"/>`)
    + `<g pointer-events="none" filter="url(#wob)">${fallIn(212)}${fallIn(364)}</g>`;
  const deck = `<g pointer-events="none"><rect x="268" y="0" width="84" height="214" fill="url(#rdcob)"/>${sk(`<rect x="262" y="0" width="8" height="214" style="fill:#CDA261"/><rect x="350" y="0" width="8" height="214" style="fill:#CDA261"/>`, `<rect x="262" y="0" width="8" height="214"/><rect x="350" y="0" width="8" height="214"/>`)}</g>${lantern(266, 120)}${lantern(354, 40)}
    <g data-place="rdBridgeS" aria-label="Back over the bridge to the plaza"><ellipse class="hov" cx="310" cy="30" rx="30" ry="16" style="fill:var(--butter)"/>${lab(240, 30, "Puente Nuevo · the plaza", "#F6E3B4", 10)}</g>`;
  // houses hanging off the cliff, on this side of the gorge
  const hanging = casa(10, 222, 70, 34, {door: false}) + casa(96, 218, 90, 36, {door: false, bougain: "r"}) + cypress(206, 268, .8);
  // the viewpoint: a terrace pushed out over the edge, with a railing and a coin telescope
  const view = `<g data-place="mirador" aria-label="The viewpoint over the gorge"><ellipse class="hov" cx="440" cy="246" rx="52" ry="26" style="fill:var(--butter)"/>
    ${sk(`<path d="M390 268 Q392 200 440 196 Q488 200 490 268z" style="fill:#E3D3AE"/><rect x="458" y="226" width="6" height="22" style="fill:#7D7A78"/><rect x="452" y="218" width="18" height="9" rx="3" style="fill:#5E8A5A"/>`, `<path d="M390 268 Q392 200 440 196 Q488 200 490 268"/><rect x="452" y="218" width="18" height="9" rx="3"/>`)}
    <path d="M394 262 Q394 206 440 202 Q486 206 486 262" fill="none" style="stroke:${C.iron}" stroke-width="2" filter="url(#wob)"/>${lab(440, 286, "The viewpoint", "#F6E3B4", 10)}</g>`;
  // the palace: white walls, a stone doorway, a brick tower
  const palace = `<g pointer-events="none">${shade(24, 300, 182, 120)}${sk(`<rect x="24" y="300" width="182" height="120" style="fill:${C.white}"/>${tileRoof(20, 280, 190, 22).art}<rect x="150" y="250" width="44" height="60" style="fill:#C98A5A"/>${tileRoof(146, 236, 52, 16).art}<path d="M100 420 v-40 q15 -18 30 0 v40z" style="fill:#6B4430"/><rect x="94" y="372" width="42" height="48" style="fill:none;stroke:#CDA261" stroke-width="5"/>${reja(46, 330, 20, 24).art}${reja(168, 330, 20, 24).art}<path d="M160 266 h24 M160 278 h24 M160 290 h24" style="stroke:#A86A44" stroke-width="1.4"/>`,
    `<rect x="24" y="300" width="182" height="120"/>${tileRoof(20, 280, 190, 22).lines}<rect x="150" y="250" width="44" height="60"/>${tileRoof(146, 236, 52, 16).lines}<path d="M100 420 v-40 q15 -18 30 0 v40z"/>${reja(46, 330, 20, 24).lines}${reja(168, 330, 20, 24).lines}`)}${bougain(30, 310, 16)}${lab(115, 440, "The palace", "#F6E3B4", 10)}</g>`;
  // the Moorish garden: a water channel with little fountains, square beds edged with myrtle, cypress in rows
  const se = ssn();
  const garden = `<g data-place="jardin" aria-label="The Moorish garden"><ellipse class="hov" cx="330" cy="470" rx="70" ry="30" style="fill:var(--butter)" opacity=".0"/>
    <rect x="214" y="440" width="290" height="176" rx="4" style="fill:#D9B48A" filter="url(#marker)"/>
    ${[[226, 452], [370, 452], [226, 538], [370, 538]].map(([x, y]) => `<rect x="${x}" y="${y}" width="${x < 300 ? 68 : 120}" height="66" rx="3" style="fill:#7C9A5A;stroke:var(--line)" stroke-width="1"/><rect x="${x + 6}" y="${y + 6}" width="${(x < 300 ? 68 : 120) - 12}" height="54" rx="2" style="fill:${se === "spring" ? "#C9D9A0" : "#A9BF7A"}"/>`).join("")}
    ${sk(`<rect x="316" y="446" width="28" height="164" style="fill:#9FD3E8"/><ellipse cx="330" cy="515" rx="26" ry="16" style="fill:#9FD3E8"/>`, `<rect x="316" y="446" width="28" height="164"/><ellipse cx="330" cy="515" rx="26" ry="16"/>`)}
    <g pointer-events="none">${[470, 515, 580].map(y => `<path d="M330 ${y} v-10" style="stroke:#FFFDF6" stroke-width="2" stroke-dasharray="3 3"><animate attributeName="stroke-dashoffset" from="0" to="-12" dur=".8s" repeatCount="indefinite"/></path>`).join("")}</g>
    ${lab(420, 628, "The Moorish garden", "#C3E8DA", 10)}</g>`
    + [236, 266, 384, 420, 456, 492].map((x, i) => cypress(x, i < 2 ? 452 : 450, .8)).join("") + orangeTree(260, 612, .8) + orangeTree(470, 612, .8);
  return defs + lampDefs + ground + gorge + pier + deck + hanging + palace + garden + view + bench(420, 330) + lantern(380, 300) + lantern(190, 470)
    + vultures(150, 100, 90, 34) + swifts(380, 70) + gate("rdToOld", 16, 520, "The old town", 56, 484, "West into the old town") + cat(60, 432, "#3A3430");
}

/* ---------- rd_old: La Ciudad ---------- */
function oldScreen(){
  const ground = `<rect width="520" height="640" style="fill:${C.earth}"/>
    <g filter="url(#wob)"><path d="M124 96 C150 170 230 230 230 300 C232 380 280 460 320 520 L330 640 M230 300 C300 330 400 370 520 380" fill="none" style="stroke:${C.cobble}" stroke-width="40" stroke-linecap="round"/></g>
    <path d="M124 96 C150 170 230 230 230 300 C232 380 280 460 320 520 L330 640 M230 300 C300 330 400 370 520 380" fill="none" style="stroke:url(#rdcobS)" stroke-width="36"/>`;
  // the gorge along the top, with the old bridge far below and steps zig-zagging down to it
  const gorge = `<g pointer-events="none"><rect x="0" y="0" width="520" height="104" fill="url(#rdgorge)"/>
    <path d="M0 0 H520 V30 L480 44 L420 52 H100 L40 44 L0 30z" style="fill:${C.cliff}" filter="url(#marker)"/>
    <g ${W} filter="url(#wob)"><path d="M0 30 L40 44 L100 52 H420 L480 44 L520 30" fill="none"/>${Array.from({length: 22}, (_, i) => `<path d="M${8 + i*24} 4 l${i % 2 ? 3 : -2} 30" style="stroke:${C.cliff2}" stroke-width="1.4"/>`).join("")}</g>
    <path d="M0 76 q130 -6 260 0 t260 0" style="fill:none;stroke:#8FC4D8" stroke-width="4"/>
    ${sk(`<path d="M186 62 H246 V80 H236 Q216 64 196 80 H186z" style="fill:#CDA261"/>`, `<path d="M186 62 H246 V80 H236 Q216 64 196 80 H186z"/>`)}
    <path d="M0 104 L30 98 L60 106 L90 98 L160 98 L200 106 L260 98 L320 106 L380 98 L440 106 L520 98 V112 H0z" style="fill:${C.earth}" filter="url(#marker)"/>
    <g ${W} stroke-width="1">${[0, 1, 2, 3, 4, 5].map(i => `<rect x="${100 + (i % 2)*16}" y="${18 + i*14}" width="34" height="8" style="fill:#CDBF9F"/>`).join("")}</g>${pricklyPear(30, 96)}${pricklyPear(470, 96)}</g>
    <g data-place="rdStepsUp" aria-label="Down into the gorge and up the steps to the station"><ellipse class="hov" cx="124" cy="60" rx="28" ry="36" style="fill:var(--butter)" opacity=".0"/>${lab(210, 124, "Steps up to the station", "#F6E3B4", 10)}</g>`;
  // houses: white walls, iron balconies, blue pots of geraniums
  const houses = casa(26, 160, 150, 102, {balcony: true, bougain: "l", pots: true}) + casa(26, 340, 130, 104, {balcony: true, pots: true});
  // the convent: a plain white wall, a bell gable with two bells, and the nuns' turntable hatch
  const convent = `<g data-place="convento" aria-label="The convent hatch">${shade(326, 140, 174, 104)}
    ${sk(`<rect x="326" y="140" width="174" height="104" style="fill:${C.white}"/>${tileRoof(322, 124, 182, 18).art}<path d="M384 124 V90 H424 V124z" style="fill:${C.white}"/><path d="M384 90 L404 74 L424 90z" style="fill:${C.white}"/><path d="M392 114 v-12 q5 -6 10 0 v12z M406 114 v-12 q5 -6 10 0 v12z" style="fill:#3A3A44"/><circle cx="397" cy="110" r="3" style="fill:${C.ochre}"/><circle cx="411" cy="110" r="3" style="fill:${C.ochre}"/><path d="M342 244 v-40 q14 -14 28 0 v40z" style="fill:#6B4430"/><circle cx="404" cy="216" r="14" style="fill:#A8754F"/><circle cx="404" cy="216" r="9" style="fill:#7A4A30"/>${reja(450, 170, 20, 26).art}`,
      `<rect x="326" y="140" width="174" height="104"/>${tileRoof(322, 124, 182, 18).lines}<path d="M384 124 V90 L404 74 L424 90 V124"/><path d="M342 244 v-40 q14 -14 28 0 v40z"/><circle cx="404" cy="216" r="14"/><path d="M395 216 h18 M404 207 v18" stroke-width=".8"/>${reja(450, 170, 20, 26).lines}`)}
    ${lab(410, 270, "Convent hatch", "#E7D9F2", 10)}</g>`;
  // Lucía's tile shop: tiles round the door and hung up on the wall outside
  const tiles = ["#3E6BAE", "#F3C969", "#2E8B8B", "#E8913A", "#3E6BAE", "#C2307A"];
  const tileShop = `<g data-place="azulejos" aria-label="Lucía's tile shop">${shade(300, 324, 172, 96)}
    ${sk(`<rect x="300" y="324" width="172" height="96" style="fill:${C.white}"/>${tileRoof(296, 306, 180, 20).art}<rect x="370" y="372" width="30" height="48" style="fill:#3E6BAE"/><path d="M374 420 v-40 q11 -11 22 0 v40z" style="fill:#7A4A30"/>${tiles.map((c, i) => `<rect x="${314 + (i % 3)*15}" y="${342 + Math.floor(i/3)*15}" width="12" height="12" style="fill:#FFFDF6"/><circle cx="${320 + (i % 3)*15}" cy="${348 + Math.floor(i/3)*15}" r="3.6" style="fill:${c}"/>`).join("")}${tiles.map((c, i) => `<rect x="${414 + (i % 3)*15}" y="${342 + Math.floor(i/3)*15}" width="12" height="12" style="fill:${c}"/><path d="M${414 + (i % 3)*15} ${342 + Math.floor(i/3)*15} l12 12" style="stroke:#FFFDF6" stroke-width="1.4"/>`).join("")}`,
      `<rect x="300" y="324" width="172" height="96"/>${tileRoof(296, 306, 180, 20).lines}<path d="M374 420 v-40 q11 -11 22 0 v40z"/>`)}
    <rect x="352" y="332" width="68" height="12" rx="2" style="fill:#3E6BAE;stroke:var(--line)" stroke-width="1"/><text x="386" y="341" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="7.8" fill="#FFFDF6" pointer-events="none">AZULEJOS</text>
    ${pot(310, 426)}${pot(462, 426, "#E85A8A")}${lab(386, 448, "Lucía's tiles", "#C3DDF3", 10)}</g>`;
  // the Arab baths: low walls, three domes with star skylights, a horseshoe arch
  const baths = `<g data-place="banos" aria-label="The Arab baths">${shade(36, 520, 160, 60, 10)}
    ${sk(`<rect x="36" y="530" width="160" height="50" style="fill:#D9C29A"/>${[70, 116, 162].map(x => `<path d="M${x - 20} 532 Q${x} 498 ${x + 20} 532z" style="fill:#E3CFA6"/>${[[-8, 524], [0, 516], [8, 524]].map(([dx, y]) => `<path d="M${x + dx} ${y - 3} l1.2 2.4 l2.6 .4 l-1.9 1.8 l.5 2.6 l-2.4 -1.2 l-2.4 1.2 l.5 -2.6 l-1.9 -1.8 l2.6 -.4z" style="fill:#5A4A3E"/>`).join("")}`).join("")}<path d="M104 580 v-24 q12 -18 24 0 v24z" style="fill:#5A4A3E"/>`,
      `<rect x="36" y="530" width="160" height="50"/>${[70, 116, 162].map(x => `<path d="M${x - 20} 532 Q${x} 498 ${x + 20} 532"/>`).join("")}<path d="M104 580 v-24 q12 -18 24 0 v24z"/>`)}
    ${lab(118, 612, "The Arab baths", "#F6E3B4", 10)}</g>`;
  // the old town gate along the bottom: a stone wall with three horseshoe arches
  const puerta = `<g data-place="puerta" aria-label="The old town gate">${sk(`<rect x="270" y="590" width="122" height="50" style="fill:#CDA261"/>${[284, 318, 352].map(x => `<path d="M${x} 640 v-22 q-4 -16 13 -18 q17 2 13 18 v22z" style="fill:#4E3E31"/>`).join("")}${[276, 296, 316, 336, 356, 376].map(x => `<rect x="${x}" y="582" width="10" height="10" style="fill:#CDA261"/>`).join("")}`,
    `<rect x="270" y="590" width="122" height="50"/>${[284, 318, 352].map(x => `<path d="M${x} 640 v-22 q-4 -16 13 -18 q17 2 13 18 v22"/>`).join("")}`)}${lab(420, 600, "Old town gate", "#F6E3B4", 9)}</g>`;
  const plants = cypress(200, 160, .9) + cypress(184, 340, .8) + almond(480, 300, 1) + almond(250, 470, .9) + oliveTree(460, 560, 1) + oliveTree(220, 600, .8) + orangeTree(280, 260, .8)
    + [[180, 270], [168, 452], [300, 440], [478, 254]].map(([x, y], i) => pot(x, y, i % 2 ? C.geranium : "#E85A8A")).join("")
    + lantern(260, 380) + lantern(180, 300) + lantern(460, 400);
  return defs.replace("</defs>", `<pattern id="rdcobS" width="22" height="16" patternUnits="userSpaceOnUse"><ellipse cx="5" cy="4" rx="4" ry="2.6" fill="#C7BEAE"/><ellipse cx="16" cy="5" rx="4.4" ry="2.4" fill="#CFC6B6"/><ellipse cx="10" cy="12" rx="4.2" ry="2.6" fill="#C2B9A8"/></pattern></defs>`)
    + lampDefs + ground + gorge + houses + convent + tileShop + baths + puerta + plants + cat(90, 152) + vultures(300, 50, 120, 20, 2)
    + gate("rdToBridge", 504, 380, "Puente Nuevo", 470, 414, "East to the bridge and the viewpoint");
}

export function rondaArt(scene){
  return scene === "rd_station" ? stationScreen() : scene === "rd_plaza" ? plazaScreen() : scene === "rd_bridge" ? bridgeScreen() : oldScreen();
}

// The train ride there and back (core.js trainRide): the carriage glides along while the country goes by. To a town:
// gold and olive hills, white villages, blue mountains. Home: Honeybrook's green.
export function trainRideArt(town){
  const south = !!town;
  const hills = south ? ["#D9C27A", "#B8B070", "#C9A44A"] : ["#9CC27E", "#7FA35A", "#B9D2A0"];
  const bank = `<svg class="taxibank" viewBox="0 0 600 90" preserveAspectRatio="none" aria-hidden="true"><g style="stroke:#3b3530" stroke-width="1.1">
    ${south ? `<path d="M0 40 L40 18 L80 34 L130 10 L180 30 L230 14 L290 34 L340 12 L400 30 L450 16 L520 34 L600 18 V60 H0z" fill="#8FA3C2"/>` : ""}
    <path d="M0 60 Q75 34 150 56 T300 56 T450 56 T600 56 V90 H0z" fill="${hills[0]}"/><path d="M0 74 Q100 52 200 72 T400 72 T600 72 V90 H0z" fill="${hills[1]}"/>
    ${[40, 120, 210, 300, 380, 470, 550].map((x, i) => south ? (i % 3 === 1 ? `<rect x="${x}" y="58" width="16" height="10" fill="#FBF7EE"/><path d="M${x - 2} 58 l10 -5 l10 5z" fill="#C8643B"/>` : `<ellipse cx="${x}" cy="66" rx="9" ry="6" fill="#9DAA80"/>`) : `<circle cx="${x}" cy="62" r="${9 + (i % 2)*4}" fill="${hills[2]}"/>`).join("")}</g></svg>`;
  const train = `<div class="taxiboat"><svg viewBox="0 0 160 60" width="220" height="82" aria-hidden="true"><g filter="url(#wob)" style="stroke:#3b3530" stroke-width="1.4" stroke-linejoin="round">
    <rect x="8" y="12" width="144" height="34" rx="9" fill="#FFFDF6"/><rect x="8" y="32" width="144" height="7" fill="#3E6BAE"/>${[20, 48, 76, 104, 128].map(x => `<rect x="${x}" y="17" width="20" height="11" rx="2" fill="#9FD3E8"/>`).join("")}
    <circle cx="30" cy="50" r="6" fill="#5A4A40"/><circle cx="58" cy="50" r="6" fill="#5A4A40"/><circle cx="102" cy="50" r="6" fill="#5A4A40"/><circle cx="130" cy="50" r="6" fill="#5A4A40"/><circle cx="57" cy="23" r="4" fill="#F2D3BC"/><circle cx="86" cy="23" r="4" fill="#C99A78"/></g></svg></div>`;
  return bank + train;
}
