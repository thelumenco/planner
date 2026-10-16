// Hokkaido (round 217): four corners of the far north of Japan, one to a screen. Nothing like Kyoto's timber lanes,
// temples and maples: wide, open and northern, Meiji-era grey stone and red brick, white clapboard, birch trees, big
// skies and long views. Pale cool colours: grey-blue stone, white, lavender, birch-bark and soft green.
//   hk_otaru:   the harbour and the ferry pier, two stone warehouses (the glassworks and the music box hall), the canal
//               with its gas lamps and stone bridge, the morning market and the green steam clock
//   hk_sapporo: the white clock tower, the red-brick beer factory, the ramen shop, the long park and its fountain (a
//               snow castle in February), the beer garden
//   hk_niseko:  Mount Yotei on the skyline, the slope and the chairlift, the log ski lodge, the foot bath, the river
//   hk_furano:  the striped flower farm up the hill, the red barn dairy and its silo, the melon stall, the lone poplar
// Seasons: deep snow from December to March (snow lanterns along the canal and a snow castle in the park in
// February), cherry blossom in May, lavender in July, gold fields in autumn.
import { dayKey } from "../util.js";
import { sk, tapeLabel } from "./scenes.js";
import { lampDefs, lampGlow } from "./village-extras.js";
import { snowIn, festivalIn, lavenderIn } from "../data/hokkaido.js";

const C = {stone: ["#B3BBC1", "#A2ABB2", "#C4CBD0"], sline: "#6F7A83", roof: "#474E57", roof2: "#363C44", iron: "#3E4B49", iron2: "#5A6863",
  brick: "#B4573F", brick2: "#9C4733", bline: "#7A3626", pave: "#D7DAD6", pave2: "#CACECB", pave3: "#E3E5E1", sett: "#C2C6C2",
  sea: "#4E7FA6", sea2: "#6A95B8", sea3: "#3C6A8E", foam: "#E8F1F6", canal: "#7A9EAE", canal2: "#93B3C0",
  snow: "#F3F6F9", snow2: "#E0E8EF", snow3: "#C9D6E2", white: "#FAFAF6", white2: "#E4E6E1", glass: "#3F4B57", wood: "#7A6050", wood2: "#5E4A3E",
  log: "#93704F", log2: "#7A5A3F", log3: "#B08A64", birch: "#F4F2EC", ink: "#2F2B28", red: "#C8372D", navy: "#24395E", sky: "#DCE8F1",
  green: "#3E6A50", spruce: "#3F6852", spruce2: "#30533F"};
const day = () => dayKey();
const mon = () => +day().slice(5, 7);
const snowy = () => snowIn(day());
const fest = () => festivalIn(day());
const julyLav = () => lavenderIn(day());
const ssn = () => snowy() ? "snow" : mon() <= 5 ? "spring" : mon() <= 8 ? "summer" : "autumn";
const blossom = () => mon() === 5;
const lab = (x, y, t, col = "#F6E3B4", size = 10) => tapeLabel(x, y, t, col, size);
const rnd = i => { const v = Math.sin(i*127.1 + 311.7)*43758.5453; return v - Math.floor(v); };
const f1 = n => (+n).toFixed(1);
const BB = `<rect width="520" height="640" fill="none" style="stroke:none"/>`;

/* ---------- pieces ---------- */
const shade = (x, y, w, h, d = 10) => `<path d="M${x + w} ${y + 6} l${d} ${d*.7} V${y + h + d*.7} H${x + d} l${-d} ${-d*.7}z" style="fill:#5A6A80" opacity=".2" pointer-events="none"/>`;
// a sign board with lettering
const board = (x, y, w, t, bg = C.white, fg = C.ink, size = 8) => `<rect x="${f1(x - w/2)}" y="${y}" width="${w}" height="${size + 5}" rx="2" style="fill:${bg};stroke:var(--line)" stroke-width=".8" pointer-events="none"/><text x="${x}" y="${f1(y + size + 1)}" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="${size}" fill="${fg}" pointer-events="none">${t}</text>`;
// rough stone blocks on a wall face
const blocks = (x, y, w, h, seed = 0, op = .45, col = C.sline) => { let d = "";
  for (let ry = y, k = 0; ry < y + h - 1; ry += 8, k++) { d += `M${x} ${ry} H${x + w} `; for (let bx = x + 4 + rnd(seed + k)*12; bx < x + w - 3; bx += 14 + rnd(seed + k*7 + bx)*10) d += `M${f1(bx)} ${ry} v${Math.min(8, y + h - ry)} `; }
  return `<path d="${d}" style="stroke:${col}" stroke-width=".6" opacity="${op}" fill="none"/>`; };
// brick courses
const bricks = (x, y, w, h) => { let d = "";
  for (let ry = y, k = 0; ry < y + h - 1; ry += 4.5, k++) { d += `M${x} ${f1(ry)} H${x + w} `; if (k % 2 === 0) for (let bx = x + (k % 4 ? 5 : 0) + 3; bx < x + w; bx += 11) d += `M${f1(bx)} ${f1(ry)} v4.5 `; }
  return `<path d="${d}" style="stroke:${C.bline}" stroke-width=".5" opacity=".45" fill="none"/>`; };
// a dark tiled roof with straight courses; a thick white cap of snow in the snow months
function roof(x, y, w, rh, col = C.roof){
  const shape = `M${x - 6} ${y + rh} L${x + 8} ${y} H${x + w - 8} L${x + w + 6} ${y + rh}z`;
  const rows = Array.from({length: Math.floor(rh/5)}, (_, k) => { const ry = y + 5 + k*5, t = (ry - y)/rh; return `M${f1(x + 8 - 14*t)} ${ry} H${f1(x + w - 8 + 14*t)}`; }).join(" ");
  const cap = snowy() ? `<path d="M${x - 5} ${y + rh - 2} L${x + 8} ${y - 2} H${x + w - 8} L${x + w + 5} ${y + rh - 2} ${Array.from({length: Math.ceil((w + 10)/14)}, (_, k) => `q-3 ${k % 2 ? 4 : 2} -7 0`).join(" ")} L${x - 5} ${y + rh - 2}z" style="fill:${C.snow}"/>` : "";
  return {art: `<path d="${shape}" style="fill:${col}"/><path d="${rows}" style="stroke:${C.roof2}" stroke-width=".7"/><path d="M${x + 8} ${y + 1} H${x + w - 8}" style="stroke:#2B3036" stroke-width="2.6"/>${cap}`, line: `<path d="${shape}"/>`};
}
// a tall arched window with iron shutters folded back
const ironWin = (x, y, w = 14, h = 24, frame = C.stone[0]) => `<path d="M${x - 2} ${y + h + 2} V${y + 5} Q${x + w/2} ${y - 6} ${x + w + 2} ${y + 5} V${y + h + 2}z" style="fill:${frame}"/><path d="M${x} ${y + h} V${y + 6} Q${x + w/2} ${y - 3} ${x + w} ${y + 6} V${y + h}z" style="fill:${C.glass}"/><path d="M${x + w/2} ${y + 1} V${y + h} M${x} ${y + h*.55} H${x + w}" style="stroke:#9AA6AE" stroke-width=".8"/>
  <rect x="${x - 8}" y="${y + 2}" width="6" height="${h - 1}" style="fill:${C.iron}"/><rect x="${x + w + 2}" y="${y + 2}" width="6" height="${h - 1}" style="fill:${C.iron}"/><path d="M${x - 5} ${y + 5} v${h - 7} M${x + w + 5} ${y + 5} v${h - 7}" style="stroke:${C.iron2}" stroke-width="1" stroke-dasharray="1 3"/>`;
// a sash window in white clapboard (or brick)
const sash = (x, y, w = 12, h = 16, frame = "#5E6A66") => `<rect x="${x - 1.5}" y="${y - 1.5}" width="${w + 3}" height="${h + 3}" style="fill:${frame}"/><rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:${C.glass}"/><path d="M${x} ${y + h/2} H${x + w} M${x + w/2} ${y} V${y + h}" style="stroke:#C9D3D8" stroke-width=".8"/>`;
// a cobbled street (packed snow in the snow months)
const road = (d, w = 30) => { const s = snowy();
  return `<g filter="url(#wob)" pointer-events="none">${BB}<path d="${d}" fill="none" style="stroke:${s ? "#D3DDE6" : "#B5BAB6"}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" style="stroke:${s ? "#EAEFF3" : C.sett}" stroke-width="${w - 6}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" style="stroke:${s ? "#D9E2EA" : "#CED1CD"}" stroke-width="${w - 12}" stroke-dasharray="3 5" opacity=".9"/></g>`; };
// a country track: pale earth (trodden snow in the snow months)
const trail = (d, w = 20) => { const s = snowy();
  return `<g filter="url(#wob)" pointer-events="none">${BB}<path d="${d}" fill="none" style="stroke:${s ? "#D5DFE8" : "#BFB08E"}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" style="stroke:${s ? "#E9EEF3" : "#DCCFAE"}" stroke-width="${w - 6}" stroke-linecap="round" stroke-linejoin="round"/></g>`; };
const GRASS = {snow: ["#F1F5F8", "#E1E9F0", "#FFFFFF"], spring: ["#A9CC8B", "#97BD79", "#BDDAA1"], summer: ["#9EC47F", "#8AB46C", "#B3D297"], autumn: ["#C3BE8B", "#B1AC77", "#D3CE9F"]};
const grass = () => GRASS[ssn()];
const meadow = patches => { const [g, g2, g3] = grass(); return `<rect width="520" height="640" style="fill:${g}"/><g filter="url(#wash)" opacity=".55" pointer-events="none">${patches.map(([x, y, rx, ry, k]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" style="fill:${k ? g2 : g3}"/>`).join("")}</g>`; };
const paving = patches => { const s = snowy(); return `<rect width="520" height="640" style="fill:${s ? C.snow : C.pave}"/><g filter="url(#wash)" opacity=".6" pointer-events="none">${patches.map(([x, y, rx, ry, k]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" style="fill:${s ? (k ? C.snow2 : "#FFFFFF") : (k ? C.pave2 : C.pave3)}"/>`).join("")}</g>`; };
// snowbanks and drifts (the snow months only)
const drifts = pts => !snowy() ? "" : `<g pointer-events="none">${pts.map(([x, y, rx, ry = rx*.38]) => `<ellipse cx="${x}" cy="${f1(y + ry*.5)}" rx="${rx}" ry="${f1(ry*.6)}" fill="${C.snow3}" opacity=".6"/><ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${f1(ry)}" fill="#FFFFFF" style="stroke:${C.snow3}" stroke-width=".8"/>`).join("")}</g>`;
// a silver birch: a white trunk with black marks; soft green, gold in autumn, bare and snowy in winter
function birch(x, y, s = 1, i = 0){
  const se = ssn(), h = 50*s, tx = x + (i % 2 ? 1.5 : -1.5)*s;
  const crownCol = se === "summer" ? ["#9CC46E", "#86B25C", "#B4D68A"] : se === "autumn" ? ["#EAC44C", "#D9A93A", "#F2D876"] : mon() === 5 ? ["#B9DC86", "#A6CF74", "#CCE6A2"] : ["#C9D6A8", "#B8C796", "#D9E2BC"];
  const marks = Array.from({length: 5}, (_, k) => `M${f1(x - 1.6*s + rnd(i*7 + k)*1.4*s)} ${f1(y - 6*s - k*h/6)} h${f1(2 + rnd(k + i)*1.6*s)}`).join(" ");
  const bare = se === "snow" || mon() === 4;
  const crown = bare ? `<path d="M${f1(tx)} ${f1(y - h*.6)} l${-12*s} ${-14*s} M${f1(tx)} ${f1(y - h*.75)} l${11*s} ${-14*s} M${f1(tx)} ${f1(y - h*.9)} l${-6*s} ${-12*s} M${f1(tx - 6*s)} ${f1(y - h*.75)} l${-3*s} ${-10*s} M${f1(tx + 6*s)} ${f1(y - h*.82)} l${3*s} ${-10*s}" fill="none" style="stroke:#6E625A" stroke-width="${f1(1.1*s)}"/>${se === "snow" ? `<path d="M${f1(tx - 12*s)} ${f1(y - h*.6 - 14*s)} l4 2 M${f1(tx + 11*s)} ${f1(y - h*.75 - 14*s)} l-4 2" style="stroke:#FFFFFF" stroke-width="2.4" stroke-linecap="round"/>` : `<g fill="#B9CE8E">${[[-10, -.78], [9, -.86], [-4, -1.02], [4, -.7]].map(([dx, f]) => `<circle cx="${f1(tx + dx*s)}" cy="${f1(y + f*h)}" r="${f1(2*s)}"/>`).join("")}</g>`}`
    : [[-9, -.78, 12], [8, -.84, 12], [0, -1.02, 13], [-3, -.66, 9], [7, -.62, 8]].map(([dx, f, r], k) => `<ellipse cx="${f1(tx + dx*s)}" cy="${f1(y + f*h)}" rx="${f1(r*s)}" ry="${f1(r*1.1*s)}" style="fill:${crownCol[k % 3]}"/>`).join("");
  return `<g pointer-events="none"><ellipse cx="${x + 4*s}" cy="${y + 1}" rx="${f1(12*s)}" ry="${f1(3*s)}" fill="#4E5E6C" opacity=".18"/>${sk(`<path d="M${f1(x - 2.4*s)} ${y} L${f1(tx - 1*s)} ${f1(y - h)} L${f1(tx + 1*s)} ${f1(y - h)} L${f1(x + 2.4*s)} ${y}z" style="fill:${C.birch}"/><path d="${marks}" style="stroke:#2E2A28" stroke-width="${f1(1.3*s)}"/>${bare ? "" : crown}`, `<path d="M${f1(x - 2.4*s)} ${y} L${f1(tx - 1*s)} ${f1(y - h)} M${f1(x + 2.4*s)} ${y} L${f1(tx + 1*s)} ${f1(y - h)}"/>`)}${bare ? crown : ""}</g>`;
}
// a cherry tree: pink blossom in May, green in summer, russet in autumn, bare and snowy in winter
function cherry(x, y, s = 1){
  const se = ssn(), pal = blossom() ? ["#F6C2D4", "#F0A9C2", "#FBDCE6"] : se === "summer" || se === "spring" ? ["#7AA85E", "#6A9A50", "#8EBA70"] : se === "autumn" ? ["#C98A4A", "#B9763E", "#D9A060"] : null;
  const blobs = [[-12, -34, 13], [10, -36, 13], [0, -46, 14], [-4, -28, 10], [12, -26, 9]];
  return `<g pointer-events="none"><ellipse cx="${x + 5*s}" cy="${y + 1}" rx="${f1(18*s)}" ry="${f1(4*s)}" fill="#4E5E6C" opacity=".18"/>${sk(`<path d="M${x - 2.6*s} ${y} Q${x - 1*s} ${y - 14*s} ${x - 6*s} ${y - 26*s} M${x + 2.6*s} ${y} Q${x + 1*s} ${y - 14*s} ${x + 7*s} ${y - 28*s}" style="stroke:#5E4A40" stroke-width="${f1(3.4*s)}" fill="none"/>
    ${pal ? blobs.map(([dx, dy, r], k) => `<circle cx="${f1(x + dx*s)}" cy="${f1(y + dy*s)}" r="${f1(r*s)}" style="fill:${pal[k % 3]}"/>`).join("") : `<path d="M${x - 6*s} ${y - 26*s} l-8 -10 M${x - 6*s} ${y - 26*s} l2 -16 M${x + 7*s} ${y - 28*s} l8 -10 M${x + 7*s} ${y - 28*s} l-3 -14" style="stroke:#5E4A40" stroke-width="1.4" fill="none"/><path d="M${x - 16*s} ${y - 37*s} l5 2 M${x + 13*s} ${y - 39*s} l-5 2" style="stroke:#FFFFFF" stroke-width="2.4" stroke-linecap="round"/>`}`,
    pal ? `<circle cx="${f1(x)}" cy="${f1(y - 46*s)}" r="${f1(14*s)}"/>` : "")}${blossom() ? blobs.slice(0, 3).map(([dx, dy], k) => `<circle cx="${f1(x + dx*s + 3)}" cy="${f1(y + dy*s - 3)}" r="1.6" fill="#FFFFFF"/><circle cx="${f1(x + dx*s - 4)}" cy="${f1(y + dy*s + 4)}" r="1.4" fill="#E68AAA"/>`).join("") : ""}</g>`;
}
// a spruce: dark tiers, snow on every tier in the snow months
const spruce = (x, y, s = 1) => `<g pointer-events="none"><ellipse cx="${x + 4*s}" cy="${y + 1}" rx="${f1(11*s)}" ry="${f1(3*s)}" fill="#4E5E6C" opacity=".18"/>${sk(`<rect x="${f1(x - 1.6*s)}" y="${f1(y - 8*s)}" width="${f1(3.2*s)}" height="${f1(8*s)}" style="fill:#5E4A40"/>${[[0, 13], [-12, 11], [-23, 8]].map(([dy, r], k) => `<path d="M${f1(x - r*s)} ${f1(y - 6*s + dy*s)} L${x} ${f1(y - 30*s + dy*s)} L${f1(x + r*s)} ${f1(y - 6*s + dy*s)}z" style="fill:${k % 2 ? C.spruce2 : C.spruce}"/>${snowy() ? `<path d="M${f1(x - r*.7*s)} ${f1(y - 12*s + dy*s)} L${x} ${f1(y - 30*s + dy*s)} L${f1(x + r*.7*s)} ${f1(y - 12*s + dy*s)} q${f1(-r*.35*s)} 3 ${f1(-r*.7*s)} 0 q${f1(-r*.35*s)} 3 ${f1(-r*.7*s)} 0z" style="fill:#FFFFFF"/>` : ""}`).join("")}`,
  `<path d="M${f1(x - 13*s)} ${f1(y - 6*s)} L${x} ${f1(y - 53*s)} L${f1(x + 13*s)} ${f1(y - 6*s)}"/>`)}</g>`;
// an iron gas lamp on a post
const gasLamp = (x, y) => `<g pointer-events="none">${lampGlow(x, y - 36, 26)}${sk(`<path d="M${x} ${y} v-30" style="stroke:#2F3836" stroke-width="2.6"/><rect x="${x - 4}" y="${y - 41}" width="8" height="10" rx="1.5" class="lglass" style="fill:#F6D48A"/><path d="M${x - 6} ${y - 41} l6 -5 l6 5z" style="fill:#2F3836"/>${snowy() ? `<path d="M${x - 6} ${y - 41} l6 -5 l6 5 q-6 -2 -12 0z" style="fill:#FFFFFF"/>` : ""}`,
  `<path d="M${x - 3} ${y} h6 M${x - 3} ${y - 30} h6"/><rect x="${x - 4}" y="${y - 41}" width="8" height="10" rx="1.5"/><path d="M${x - 6} ${y - 41} l6 -5 l6 5z"/>`)}</g>`;
// a snow lantern (February): a little mound of packed snow with a candle inside
const snowLantern = (x, y) => `${lampGlow(x, y - 6, 12)}<path d="M${x - 6} ${y} Q${x - 7} ${y - 11} ${x} ${y - 13} Q${x + 7} ${y - 11} ${x + 6} ${y}z" fill="#FFFFFF" style="stroke:${C.snow3}" stroke-width=".8"/><path d="M${x - 2} ${y - 3} V${y - 7} Q${x} ${y - 9} ${x + 2} ${y - 7} V${y - 3}z" fill="#FFCF6E"><animate attributeName="opacity" values="1;.6;1" dur="${1.6 + (x % 7)*.2}s" repeatCount="indefinite"/></path>`;
// rising steam (white) or chimney smoke (grey)
const steam = (x, y, n = 3, h = 30, col = "#FFFFFF", r0 = 3) => `<g pointer-events="none">${Array.from({length: n}, (_, i) => `<circle cx="${x + (i % 2 ? 3 : -3)}" cy="${y}" r="${r0}" fill="${col}" opacity="0"><animate attributeName="cy" values="${y};${y - h}" dur="${2.6 + i*.4}s" begin="${f1(-i*2.6/n)}s" repeatCount="indefinite"/><animate attributeName="r" values="${r0};${r0*2.4}" dur="${2.6 + i*.4}s" begin="${f1(-i*2.6/n)}s" repeatCount="indefinite"/><animate attributeName="opacity" values=".85;0" dur="${2.6 + i*.4}s" begin="${f1(-i*2.6/n)}s" repeatCount="indefinite"/></circle>`).join("")}</g>`;
const waves = (pts, col = C.foam) => `<g pointer-events="none" style="stroke:${col}" stroke-width="1.5" fill="none" opacity=".85">${pts.map(([x, y], i) => `<path d="M${x} ${y} q5 -4 10 0 q5 4 10 0"><animateTransform attributeName="transform" type="translate" values="0 0;4 0;0 0" dur="${3.5 + i % 3}s" repeatCount="indefinite"/></path>`).join("")}</g>`;
const gulls = pts => `<g pointer-events="none" fill="none" style="stroke:#3A3430" stroke-width="1.2">${pts.map(([x, y], i) => `<path d="M${x - 7} ${y} q3.5 -5 7 0 q3.5 -5 7 0"><animateTransform attributeName="transform" type="translate" values="0 0;${18 + i*6} ${-4 + i*2};0 0" dur="${12 + i*3}s" repeatCount="indefinite"/></path>`).join("")}</g>`;
// wildflowers in the grass (spring and summer)
const wildflowers = pts => { const se = ssn(); if (se !== "spring" && se !== "summer") return "";
  const cols = se === "spring" ? ["#FFFFFF", "#F2D24A", "#E8A0C0"] : ["#F2D24A", "#FFFFFF", "#A98AD8", "#E86A5A"];
  return `<g pointer-events="none">${pts.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="1.9" fill="${cols[i % cols.length]}"/><circle cx="${x + 5}" cy="${y + 3}" r="1.5" fill="${cols[(i + 1) % cols.length]}"/><path d="M${x} ${y + 2} v4 M${x + 5} ${y + 4} v3" style="stroke:#5E8A44" stroke-width=".7"/>`).join("")}</g>`; };
const tufts = pts => snowy() ? "" : `<g pointer-events="none" fill="none" style="stroke:${ssn() === "autumn" ? "#9A925E" : "#6E9A52"}" stroke-width="1.1" opacity=".7">${pts.map(([x, y]) => `<path d="M${x - 3} ${y} l-1 -4 M${x} ${y} v-5 M${x + 3} ${y} l1 -4"/>`).join("")}</g>`;
function seasonFx(){
  if (snowy()) return `<g pointer-events="none">${Array.from({length: 22}, (_, i) => `<circle r="${i % 3 ? 1.7 : 2.3}" fill="#FFFFFF" opacity=".95" style="stroke:#C9D6E2" stroke-width=".3"><animateMotion dur="${11 + (i % 5)*1.3}s" begin="${f1(-i*1.1)}s" repeatCount="indefinite" path="M${10 + i*23} -10 q${i % 2 ? -14 : 12} 330 ${i % 2 ? 6 : -8} 660"/></circle>`).join("")}</g>`;
  if (blossom()) return `<g pointer-events="none">${Array.from({length: 8}, (_, i) => `<ellipse rx="2.2" ry="1.3" fill="#F6B8CC"><animateMotion dur="${13 + i}s" begin="${-i*1.7}s" repeatCount="indefinite" path="M${30 + i*62} -10 q40 320 -20 660"/></ellipse>`).join("")}</g>`;
  return "";
}
// the way on: a fingerpost, a white arm with a blue tip
const gate = (id, x, y, label, lx, ly, aria, col = "#E2E6EA") => `<g data-place="${id}" aria-label="${aria}"><ellipse class="hov" cx="${x}" cy="${y + 6}" rx="26" ry="20" style="fill:var(--butter)"/>
  ${sk(`<rect x="${x - 3}" y="${y - 30}" width="6" height="38" style="fill:${C.wood2}"/><path d="M${x + 3} ${y - 28} h22 l6 6 l-6 6 h-22z" style="fill:${C.white}"/><path d="M${x + 22} ${y - 28} h3 l6 6 l-6 6 h-3z" style="fill:${C.sea}"/><path d="M${x + 6} ${y - 22} h12" style="stroke:${C.ink}" stroke-width="1.4"/>${snowy() ? `<path d="M${x - 4} ${y - 30} h8 q-4 -4 -8 0z M${x + 3} ${y - 28} h22 q-11 -4 -22 0z" style="fill:#FFFFFF"/>` : ""}`,
    `<rect x="${x - 3}" y="${y - 30}" width="6" height="38"/><path d="M${x + 3} ${y - 28} h22 l6 6 l-6 6 h-22z"/>`)}${lab(lx, ly, label, col, 11)}</g>`;
const place = (id, x, y, rx, ry, aria, body, label, lx, ly, col) => `<g data-place="${id}" aria-label="${aria}"><ellipse class="hov" cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" style="fill:var(--butter)"/>${body}${label ? lab(lx, ly, label, col, 10) : ""}</g>`;
// a distant range along the top of the screen, under a pale northern sky
const skyline = (peaks, horizon = 46) => { const s = snowy(), se = ssn();
  return `<g pointer-events="none"><path d="M0 0 H520 V${horizon} Q390 ${horizon + 8} 260 ${horizon} Q130 ${horizon - 8} 0 ${horizon + 2}z" fill="${C.sky}"/>
  ${peaks.map(([x, w, h]) => { const top = horizon - h; const cap = s ? 1 : se === "summer" ? .22 : se === "autumn" ? .32 : .45;
    return `<path d="M${x - w} ${horizon + 4} L${x} ${top} L${x + w} ${horizon + 4}z" fill="${s ? "#E9EFF4" : "#A9BBC9"}"/><path d="M${f1(x - w*cap)} ${f1(top + h*cap + 2)} L${x} ${top} L${f1(x + w*cap)} ${f1(top + h*cap + 2)} l-4 -3 l-4 3 l-5 -4 l-5 4z" fill="#FFFFFF"/>`; }).join("")}</g>`; };

/* ---------- hk_otaru: the harbour, the warehouses, the canal, the market, the steam clock ---------- */
function warehouse(x, y, w, h, o){
  const rh = 36, wy = y + rh, wh = h - rh, rf = roof(x, y, w, rh), wall = o.brick ? C.brick : C.stone[2];
  const tex = o.brick ? bricks(x, wy, w, wh) + `<rect x="${x}" y="${wy}" width="${w}" height="5" style="fill:#E3DCCB"/><rect x="${x}" y="${wy + 38}" width="${w}" height="3" style="fill:#E3DCCB"/><rect x="${x}" y="${wy}" width="7" height="${wh}" style="fill:#D9D1BE"/><rect x="${x + w - 7}" y="${wy}" width="7" height="${wh}" style="fill:#D9D1BE"/>` : blocks(x, wy + 2, w, wh - 2, x + 3);
  const wins = o.wins.map(cx => ironWin(cx - 7, wy + 12, 14, 26, o.brick ? "#E3DCCB" : C.stone[0])).join("");
  return shade(x, wy, w, wh) + sk(`<rect x="${x}" y="${wy}" width="${w}" height="${wh}" style="fill:${wall}"/>${tex}${wins}${o.door}${rf.art}`, `<rect x="${x}" y="${wy}" width="${w}" height="${wh}"/>${rf.line}`);
}
function otaruScreen(){
  const s = snowy();
  const ground = paving([[260, 470, 210, 120, 1], [110, 590, 110, 50, 0], [410, 290, 110, 30, 0], [270, 120, 230, 36, 1]]);
  const streets = road("M-10 100 H530", 34) + road("M262 100 V320", 36) + road("M-10 296 H530", 30) + road("M262 380 V650", 36) + road("M262 560 H530", 30) + road("M130 300 V420", 22) + road("M200 296 Q320 400 420 470", 18);
  // the harbour: the steel-blue sea along the top, a stone quay, the pier going out, the ferry tied up alongside
  const sea = `<g pointer-events="none"><rect width="520" height="62" style="fill:${C.sea}"/><path d="M0 46 H520" style="stroke:${C.sea3}" stroke-width="8" opacity=".25"/>${waves([[20, 18], [56, 40], [190, 56], [360, 52], [420, 14], [470, 52], [10, 52]])}
    ${s ? [[30, 28, 14], [74, 50, 9], [372, 10, 12], [500, 54, 10]].map(([x, y, r]) => `<path d="M${x - r} ${y} l${r*.4} ${-r*.35} h${r*1.1} l${r*.5} ${r*.35} l${-r*.4} ${r*.3} h${-r*1.2}z" fill="#F2F7FA" style="stroke:#B9CAD8" stroke-width=".8"/>`).join("") : ""}</g>`;
  const quay = `<g pointer-events="none">${sk(`<rect x="0" y="56" width="520" height="14" style="fill:${C.stone[1]}"/><rect x="0" y="56" width="520" height="3" style="fill:${C.stone[2]}"/>`, `<path d="M0 56 H520"/>`)}${blocks(0, 59, 520, 11, 4, .4)}
    ${sk(`<rect x="100" y="-4" width="60" height="74" style="fill:${C.stone[2]}"/><path d="M106 -4 V70 M154 -4 V70" style="stroke:${C.stone[0]}" stroke-width="3"/>`, `<path d="M100 -4 V56 M160 -4 V56"/>`)}${blocks(108, 0, 44, 56, 9, .35)}
    ${[[106, 12], [154, 12], [106, 40], [154, 40], [30, 66], [200, 66], [380, 66]].map(([x, y]) => `<rect x="${x - 3.5}" y="${y - 6}" width="7" height="7" rx="2" style="fill:#33302E;stroke:var(--line)" stroke-width=".8"/>`).join("")}</g>`;
  const ferry = `<g pointer-events="none"><g><animateTransform attributeName="transform" type="translate" values="0 0;0 -1.2;0 0" dur="4s" repeatCount="indefinite"/><ellipse cx="258" cy="51" rx="96" ry="4" fill="${C.foam}" opacity=".6"/>
    ${sk(`<path d="M166 28 H354 L344 50 H180 Q170 42 166 28z" style="fill:${C.white}"/><path d="M168 34 H352 L349 40 H171z" style="fill:${C.navy}"/><path d="M175 45 H346" style="stroke:${C.red}" stroke-width="1.2"/>
      <rect x="196" y="15" width="128" height="13" rx="2" style="fill:${C.white}"/>${Array.from({length: 14}, (_, k) => `<rect x="${200 + k*8.6}" y="18" width="5.4" height="5" rx="1" style="fill:#8FAFC4"/>`).join("")}<rect x="292" y="6" width="34" height="10" rx="2" style="fill:${C.white}"/><rect x="295" y="8" width="28" height="4" rx="1" style="fill:#5F7F98"/>
      <path d="M236 15 L238 -2 H256 L258 15z" style="fill:${C.red}"/><path d="M237.6 2 H256.4" style="stroke:${C.navy}" stroke-width="4"/><path d="M314 6 V-4" style="stroke:#3A3836" stroke-width="1.2"/>`,
      `<path d="M166 28 H354 L344 50 H180 Q170 42 166 28z"/><rect x="196" y="15" width="128" height="13" rx="2"/><path d="M236 15 L238 -2 H256 L258 15z"/>`)}
    ${s ? `<path d="M196 15 h128 q-64 -4 -128 0z M292 6 h34 q-17 -3 -34 0z" fill="#FFFFFF"/>` : ""}</g><path d="M168 32 Q162 36 156 40 M350 32 Q366 46 380 64" fill="none" style="stroke:#B49A6A" stroke-width="1.2"/></g>`;
  // the breakwater and its little red lighthouse
  const light = `<g pointer-events="none">${sk(`<path d="M392 44 L520 28 V40 L396 54z" style="fill:#B9BFC3"/><path d="M474 36 L476 12 H486 L488 36z" style="fill:${C.red}"/><path d="M475.2 22 H486.8" style="stroke:${C.white}" stroke-width="3"/><rect x="473" y="9" width="16" height="3" style="fill:#2A2A2A"/><rect x="477" y="2" width="8" height="7" style="fill:#F6E7A8"/><path d="M475 2.5 Q481 -4 487 2.5z" style="fill:${C.red}"/>`,
    `<path d="M392 44 L520 28 M396 54 L520 40"/><path d="M474 36 L476 12 H486 L488 36"/><rect x="477" y="2" width="8" height="7"/>`)}<circle cx="481" cy="5" r="6" fill="#FFF3B0" opacity=".4"><animate attributeName="opacity" values=".1;.8;.1" dur="4s" repeatCount="indefinite"/></circle>
    ${sk(`<path d="M24 32 H72 L66 42 H30z" style="fill:${C.white}"/><path d="M25 35 H71" style="stroke:${C.red}" stroke-width="2"/><rect x="48" y="22" width="12" height="10" style="fill:${C.white}"/><path d="M40 32 V16" style="stroke:#3A3836" stroke-width="1"/>`, `<path d="M24 32 H72 L66 42 H30z"/>`)}</g>`;
  const pier = `<g data-place="hkpier" aria-label="The ferry pier: ferries home to Honeybrook"><ellipse class="hov" cx="130" cy="96" rx="28" ry="12" style="fill:var(--butter)"/>${lab(56, 98, "Ferry pier", "#CFE2EE", 10)}</g>`;
  // the glassworks: an old grey stone warehouse, iron shutters, the doors open on the furnace's glow
  const glassDoor = `<rect x="112" y="210" width="36" height="44" style="fill:${C.stone[0]}"/><rect x="115" y="213" width="30" height="41" style="fill:#F2A04A"/><rect x="115" y="213" width="30" height="16" style="fill:#FFD98A" opacity=".8"/>
    <path d="M117 226 h26 M117 238 h26" style="stroke:#8A5A2A" stroke-width="1.4"/>${[[120, 224, "#5FB0D8"], [127, 224, "#7FC79A"], [134, 224, "#E8735E"], [140, 224, "#F2D06B"], [121, 236, "#B48ED8"], [129, 236, "#9FD3E8"], [138, 236, "#5FB0D8"]].map(([cx, cy, c]) => `<circle cx="${cx}" cy="${cy}" r="2.6" style="fill:${c}"/>`).join("")}
    <rect x="118" y="244" width="24" height="10" style="fill:#C9783A"/>`;
  const floats = `<path d="M152 214 l8 10 l-8 10 l-8 -10z" fill="none" style="stroke:#8A7A5A" stroke-width=".7"/>${[[152, 220, "#5FB0D8"], [156, 228, "#7FC79A"], [150, 230, "#9FD3E8"]].map(([cx, cy, c]) => `<circle cx="${cx}" cy="${cy}" r="3.4" style="fill:${c};stroke:var(--line)" stroke-width=".6"/><circle cx="${cx - 1}" cy="${cy - 1.2}" r="1" fill="#FFFFFF"/>`).join("")}`;
  const glass = `<g data-place="hkglass" aria-label="The glassworks"><ellipse class="hov" cx="130" cy="270" rx="34" ry="11" style="fill:var(--butter)"/>
    ${warehouse(40, 140, 180, 114, {wins: [62, 92, 168, 198], door: glassDoor + floats})}<g pointer-events="none">${lampGlow(130, 236, 34)}<circle cx="130" cy="234" r="22" fill="#FFB65C" opacity=".18"/>${board(130, 192, 50, "GLASS", "#2F4E6E", "#FFF6E8", 9)}</g>${lab(130, 290, "Glassworks", "#F6E3B4", 10)}</g>`;
  // the music box hall: red brick, white stone bands, a tall arched door
  const mbDoor = `<path d="M376 254 V222 Q390 206 404 222 V254z" style="fill:#E3DCCB"/><path d="M379 254 V223 Q390 211 401 223 V254z" style="fill:#5E3E2E"/><path d="M381 222 Q390 214 399 222z" style="fill:#FFD98A"/><path d="M390 222 V254" style="stroke:#3E2A20" stroke-width="1"/><circle cx="387" cy="240" r="1" style="fill:#E3C26A"/><circle cx="393" cy="240" r="1" style="fill:#E3C26A"/>`;
  const music = `<g data-place="hkmusicbox" aria-label="The music box hall"><ellipse class="hov" cx="390" cy="270" rx="34" ry="11" style="fill:var(--butter)"/>
    ${warehouse(300, 140, 180, 114, {brick: true, wins: [322, 352, 428, 458], door: mbDoor})}<g pointer-events="none">${sk(`<path d="M374 142 L390 126 L406 142z" style="fill:${C.roof}"/><circle cx="390" cy="136" r="3.4" style="fill:#F2E6CC"/>`, `<path d="M374 142 L390 126 L406 142"/>`)}${lampGlow(390, 230, 22)}${board(390, 190, 64, "MUSIC BOX", "#F2E6CC", "#7A3626", 8)}</g>${lab(390, 290, "Music boxes", "#F6D6CF", 10)}</g>`;
  // the canal: stone kerbs, grey-green water, the stone bridge, gas lamps along both sides
  const iceEdge = s ? `<path d="M0 328 ${Array.from({length: 13}, (_, k) => `Q${k*40 + 20} ${334 + (k % 2)*3} ${k*40 + 40} 328`).join(" ")} M0 374 ${Array.from({length: 13}, (_, k) => `Q${k*40 + 20} ${368 - (k % 2)*3} ${k*40 + 40} 374`).join(" ")}" fill="none" style="stroke:#EEF4F8" stroke-width="5" opacity=".9"/>` : "";
  const ripples = `<g pointer-events="none" style="stroke:${C.canal2}" stroke-width="1.4" fill="none">${[[30, 344], [110, 362], [180, 340], [330, 360], [400, 342], [470, 362], [70, 352]].map(([x, y], i) => `<path d="M${x} ${y} h16"><animateTransform attributeName="transform" type="translate" values="0 0;8 0;0 0" dur="${5 + i % 3}s" repeatCount="indefinite"/></path>`).join("")}</g>`;
  const swans = s ? [[80, 352, 1], [140, 360, -1]].map(([x, y, d], i) => `<g><animateTransform attributeName="transform" type="translate" values="0 0;${d*24} 0;0 0" dur="${18 + i*4}s" repeatCount="indefinite"/><g transform="translate(${x} ${y}) scale(${d} 1)"><ellipse cx="0" cy="0" rx="8" ry="3.6" fill="#FFFFFF" style="stroke:#9AA6AE" stroke-width=".6"/><path d="M5 -1 Q8 -10 5 -12 Q3 -12 4 -10" fill="none" style="stroke:#FFFFFF" stroke-width="2.4"/><path d="M4 -11.6 l-3 .8" style="stroke:#E8873A" stroke-width="1.6"/></g></g>`).join("")
    : [[90, 354, 1], [160, 362, -1], [420, 352, 1]].map(([x, y, d], i) => `<g><animateTransform attributeName="transform" type="translate" values="0 0;${d*20} 0;0 0" dur="${16 + i*4}s" repeatCount="indefinite"/><g transform="translate(${x} ${y}) scale(${d} 1)"><ellipse cx="0" cy="0" rx="5" ry="2.4" fill="#7A6A52"/><circle cx="4" cy="-2.4" r="2" fill="${i % 2 ? "#3E6A50" : "#7A6A52"}"/><path d="M5.6 -2.4 l2 .6" style="stroke:#E3B53C" stroke-width="1.2"/></g></g>`).join("");
  const canalArt = `<g pointer-events="none">${sk(`<rect x="0" y="326" width="520" height="50" style="fill:${s ? "#62889C" : C.canal}"/>`, "")}<path d="M0 334 H520" style="stroke:#5E7F8E" stroke-width="6" opacity=".25"/>${ripples}${iceEdge}${swans}
    ${sk(`<rect x="-4" y="318" width="528" height="9" style="fill:${C.stone[1]}"/><rect x="-4" y="374" width="528" height="9" style="fill:${C.stone[1]}"/>`, `<path d="M0 318 H520 M0 327 H520 M0 374 H520 M0 383 H520"/>`)}${blocks(0, 319, 520, 8, 2, .45)}${blocks(0, 375, 520, 8, 5, .45)}
    ${shade(236, 312, 68, 72, 6)}${sk(`<rect x="236" y="312" width="68" height="76" style="fill:${s ? "#EEF2F5" : C.stone[2]}"/><rect x="232" y="310" width="9" height="80" rx="2" style="fill:${C.stone[0]}"/><rect x="299" y="310" width="9" height="80" rx="2" style="fill:${C.stone[0]}"/>`,
      `<rect x="232" y="310" width="9" height="80" rx="2"/><rect x="299" y="310" width="9" height="80" rx="2"/>`)}${s ? "" : blocks(242, 316, 56, 70, 11, .3)}${drifts([[236.5, 312, 6, 3], [303.5, 312, 6, 3]])}</g>`;
  const canalPlace = `<g data-place="hkcanal" aria-label="The canal: stone warehouses, gas lamps, and swans in winter"><ellipse class="hov" cx="270" cy="300" rx="26" ry="10" style="fill:var(--butter)"/>${lab(178, 352, "Canal", "#CFE2EE", 10)}</g>`;
  const lamps = [[24, 318], [196, 318], [226, 312], [314, 312], [334, 318], [492, 318], [44, 394], [214, 394], [326, 394], [494, 394]].map(([x, y]) => gasLamp(x, y)).join("");
  const lanterns = fest() ? `<g pointer-events="none">${[...Array.from({length: 8}, (_, k) => [12 + k*27, 316]), ...Array.from({length: 8}, (_, k) => [320 + k*26, 316]), ...Array.from({length: 8}, (_, k) => [12 + k*27, 392]), ...Array.from({length: 8}, (_, k) => [322 + k*26, 392])].map(([x, y]) => snowLantern(x, y)).join("")}</g>` : "";
  // the morning market: a blue awning, crab and scallops laid out on crushed ice
  const crab = (x, y) => `<path d="M${x - 7} ${y - 1} l-3 -3 M${x - 7} ${y + 1} l-4 0 M${x + 7} ${y - 1} l3 -3 M${x + 7} ${y + 1} l4 0 M${x - 4} ${y - 4} l-2 -4 M${x + 4} ${y - 4} l2 -4" style="stroke:#C8432F" stroke-width="1.4"/><ellipse cx="${x}" cy="${y}" rx="7" ry="5" style="fill:#D9503A"/><ellipse cx="${x - 1.5}" cy="${y - 1.5}" rx="3" ry="1.6" style="fill:#EE7A5E"/>`;
  const scallop = (x, y) => `<path d="M${x - 5} ${y + 2} Q${x - 6} ${y - 5} ${x} ${y - 6} Q${x + 6} ${y - 5} ${x + 5} ${y + 2}z" style="fill:#F3E1C8"/><path d="M${x - 3} ${y + 1} L${x - 2} ${y - 4} M${x} ${y + 1} V${y - 5} M${x + 3} ${y + 1} L${x + 2} ${y - 4}" style="stroke:#C98A5A" stroke-width=".6"/><circle cx="${x}" cy="${y - 1}" r="1.8" style="fill:#FBF3E6"/>`;
  const stripes = Array.from({length: 9}, (_, k) => `<rect x="${56 + k*16.4}" y="428" width="8.2" height="18" style="fill:${C.white}"/>`).join("");
  const market = `<g data-place="hkmarket" aria-label="The morning market: crab and scallops on ice"><ellipse class="hov" cx="130" cy="516" rx="34" ry="11" style="fill:var(--butter)"/>${shade(60, 446, 140, 54, 8)}
    ${sk(`<path d="M66 444 V500 M194 444 V500" style="stroke:${C.wood2}" stroke-width="3"/><rect x="62" y="462" width="136" height="38" style="fill:${C.wood}"/><path d="M62 474 H198 M62 487 H198" style="stroke:${C.wood2}" stroke-width="1"/>
      <rect x="62" y="454" width="136" height="10" rx="2" style="fill:#E6F0F6"/>${crab(78, 456)}${crab(98, 455)}${crab(118, 457)}${scallop(140, 459)}${scallop(152, 457)}${scallop(164, 459)}${scallop(176, 457)}<rect x="184" y="452" width="10" height="8" rx="1" style="fill:#E8732E"/><path d="M185 455 h8 M185 458 h8" style="stroke:#F6A86A" stroke-width=".8" stroke-dasharray="1 1.4"/>
      <rect x="56" y="428" width="148" height="18" style="fill:#3E6BAE"/>${stripes}<path d="M56 446 ${Array.from({length: 9}, () => `q8.2 6 16.4 0`).join(" ")}" style="fill:#3E6BAE"/>`,
      `<rect x="62" y="462" width="136" height="38"/><path d="M56 428 H204 V446 ${Array.from({length: 9}, () => `q-8.2 6 -16.4 0`).join(" ")}z"/>`)}
    ${s ? `<path d="M56 428 H204 V424 q-74 -8 -148 0z" fill="#FFFFFF" style="stroke:${C.snow3}" stroke-width=".8"/>` : ""}${board(130, 470, 50, "MARKET", "#F2E6CC", "#2F4E6E", 8)}
    ${sk(`<rect x="202" y="478" width="20" height="14" style="fill:#B38E5E"/><rect x="204" y="476" width="16" height="4" style="fill:#E6F0F6"/>`, `<rect x="202" y="478" width="20" height="14"/>`)}${lab(130, 540, "Morning market", "#CFE2EE", 10)}</g>`;
  // the steam clock: a green iron tower on the corner, puffing
  const clock = `<g data-place="hkclock" aria-label="The steam clock: it whistles on the quarter hour"><ellipse class="hov" cx="440" cy="470" rx="24" ry="10" style="fill:var(--butter)"/>${shade(422, 380, 36, 76, 6)}
    ${sk(`<rect x="420" y="440" width="40" height="16" style="fill:${C.stone[1]}"/><rect x="427" y="406" width="26" height="34" style="fill:${C.green}"/><rect x="432" y="412" width="16" height="20" style="fill:#2A3A32"/><circle cx="440" cy="418" r="4" style="fill:none;stroke:#E3C26A" stroke-width="1.4"/><circle cx="440" cy="427" r="3" style="fill:none;stroke:#C9A24A" stroke-width="1.2"/>
      <rect x="423" y="382" width="34" height="24" rx="2" style="fill:${C.green}"/><circle cx="440" cy="394" r="9" style="fill:${C.white}"/><path d="M440 394 V388 M440 394 l4 2" style="stroke:${C.ink}" stroke-width="1.2"/><path d="M420 382 L440 368 L460 382z" style="fill:#2F5340"/><path d="M436 368 V360 M444 370 V362" style="stroke:#2F3836" stroke-width="2.4"/>`,
      `<rect x="420" y="440" width="40" height="16"/><rect x="427" y="406" width="26" height="34"/><rect x="423" y="382" width="34" height="24" rx="2"/><path d="M420 382 L440 368 L460 382z"/>`)}
    ${s ? `<path d="M422 381 L440 367 L458 381 q-18 -4 -36 0z" fill="#FFFFFF"/>` : ""}${steam(436, 358, 3, 36, "#FFFFFF", 3)}${steam(444, 360, 2, 28, "#F2F5F8", 2.4)}${lab(380, 476, "Steam clock", "#DCEBC8", 10)}</g>`;
  const trees = birch(22, 440, 1, 0) + birch(368, 546, .95, 1) + birch(500, 452, 1, 2) + cherry(184, 606, .95) + birch(30, 610, .9, 3);
  const snowbanks = drifts([[40, 78, 30, 7], [220, 78, 26, 6], [420, 78, 40, 7], [20, 312, 18, 5], [120, 312, 22, 5], [420, 312, 24, 5], [100, 392, 24, 5], [430, 392, 22, 5], [230, 520, 20, 6], [300, 620, 20, 6], [500, 600, 18, 6]]);
  return lampDefs + ground + streets + sea + quay + ferry + light + snowbanks + canalArt + lanterns + glass + music + lamps + market + clock + trees + pier + canalPlace + gulls([[60, 20], [420, 30], [300, 240]]) + seasonFx()
    + gate("hkToSapporo", 504, 560, "Sapporo", 462, 522, "East to Sapporo", "#F6D6CF")
    + gate("hkToNiseko", 262, 612, "Niseko", 326, 604, "South to Niseko", "#E2E6EA");
}

/* ---------- hk_sapporo: the clock tower, the beer factory, the ramen shop, the park, the beer garden ---------- */
function sapporoScreen(){
  const s = snowy(), se = ssn();
  const ground = paving([[380, 300, 130, 40, 1], [380, 600, 130, 30, 0], [260, 40, 220, 30, 1]]);
  const streets = road("M-10 236 H530", 34) + road("M262 236 V650", 36) + road("M-10 568 H530", 30) + road("M262 446 H520", 22);
  // the long park down the west side: lawns, flower beds, a gravel walk
  const [g, g2, g3] = grass();
  const bedCol = se === "spring" ? ["#E8584A", "#F2D24A", "#FFFFFF", "#E88AB2"] : se === "summer" ? ["#EE8A3A", "#C8372D", "#9B7FC8", "#F2D24A"] : se === "autumn" ? ["#D9803A", "#B9564A", "#E8B04A", "#8A5A9A"] : null;
  const bed = (x, y, w, h) => `${sk(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" style="fill:${s ? "#FFFFFF" : "#7A6248"}"/>`, `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4"/>`)}${bedCol ? Array.from({length: Math.floor(w/7)*Math.max(1, Math.floor(h/7))}, (_, k) => { const cols = Math.floor(w/7); return `<circle cx="${x + 4 + (k % cols)*7}" cy="${y + 4 + Math.floor(k/cols)*7}" r="2.6" fill="${bedCol[(k + Math.floor(k/cols)) % bedCol.length]}"/>`; }).join("") : ""}`;
  const park = `<g pointer-events="none">${sk(`<rect x="12" y="262" width="222" height="372" rx="16" style="fill:${s ? "#FBFCFD" : g3}"/>`, `<rect x="12" y="262" width="222" height="372" rx="16"/>`)}<g filter="url(#wash)" opacity=".5"><ellipse cx="70" cy="520" rx="50" ry="70" fill="${s ? C.snow2 : g2}"/><ellipse cx="200" cy="330" rx="30" ry="50" fill="${s ? C.snow2 : g}"/></g>
    ${trail("M140 262 V380 M140 460 V640 M12 568 H262 M90 420 H40 M190 420 H234", 16)}${bed(26, 290, 44, 14)}${bed(176, 290, 44, 14)}${bed(26, 470, 14, 70)}${bed(208, 470, 14, 70)}
    ${tufts([[60, 340], [210, 360], [50, 600], [200, 610], [100, 520], [180, 520]])}</g>`;
  const parkPlace = `<g data-place="hkpark" aria-label="The long park: lawns, flower beds and fountains"><ellipse class="hov" cx="140" cy="300" rx="30" ry="11" style="fill:var(--butter)"/>${lab(140, 330, "Long park", "#DCEBC8", 10)}</g>`;
  // the sculpture plot: a fountain, frozen in the snow months; in February a great snow castle
  let plot;
  if (fest()) {
    const tower = (x, w, top) => `<rect x="${x}" y="${top}" width="${w}" height="${458 - top}" style="fill:#FFFFFF"/><path d="M${x - 3} ${top} L${x + w/2} ${top - w*.9} L${x + w + 3} ${top}z" style="fill:#EEF4FA"/><path d="M${x + w/2} ${top - w*.9} L${x + w + 3} ${top} H${x + w/2}z" style="fill:${C.snow3}"/><rect x="${x + w/2 - 2.5}" y="${top + 10}" width="5" height="8" rx="2.5" style="fill:#9FB4C8"/>`;
    plot = `${shade(92, 380, 96, 80, 8)}${sk(`<rect x="92" y="404" width="96" height="54" style="fill:#FFFFFF"/>${tower(96, 22, 368)}${tower(162, 22, 368)}${tower(126, 28, 336)}<path d="M92 404 h6 v-5 h6 v5 h8 v-5 h6 v5 h8 M150 404 h8 v-5 h6 v5 h8 v-5 h6 v5 h4" style="fill:none;stroke:${C.snow3}" stroke-width="1"/>
      <path d="M130 458 V438 Q140 426 150 438 V458z" style="fill:#AFC4D8"/><path d="M92 430 H188 M92 446 H188" style="stroke:#D9E4EE" stroke-width="1"/><path d="M188 404 V458 H180 V404z" style="fill:${C.snow2}"/>`,
      `<path d="M92 458 V404 H96 V368 L107 348 L118 368 V404 H126 V336 L140 311 L154 336 V404 H162 V368 L173 348 L184 368 V404 H188 V458z"/><path d="M130 458 V438 Q140 426 150 438 V458"/>`)}
      <path d="M140 311 v-12" style="stroke:#5E6A72" stroke-width="1"/><path d="M140 299 h8 l-2 2.5 l2 2.5 h-8z" fill="${C.red}"><animateTransform attributeName="transform" type="skewY" values="0;6;0" dur="2s" repeatCount="indefinite"/></path>
      ${[[110, 470, "#C8372D"], [172, 472, "#3E6BAE"]].map(([x, y, c]) => `<circle cx="${x}" cy="${y - 13}" r="3" fill="#F2D3BC"/><path d="M${x - 4} ${y} V${y - 6} Q${x} ${y - 11} ${x + 4} ${y - 6} V${y}z" fill="${c}"/>`).join("")}`;
  } else {
    const jets = s ? "" : `<g style="stroke:#BFE3F2" stroke-width="2" fill="none" opacity=".9"><path d="M140 424 V398"><animate attributeName="d" values="M140 424 V398;M140 424 V390;M140 424 V398" dur="1.6s" repeatCount="indefinite"/></path><path d="M140 400 Q128 404 122 420 M140 400 Q152 404 158 420" stroke-width="1.4"/></g>${[[116, 428], [164, 428], [140, 438]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="1.4" fill="#FFFFFF"><animate attributeName="opacity" values="0;1;0" dur="${1.2 + i*.3}s" repeatCount="indefinite"/></circle>`).join("")}`;
    plot = `${sk(`<ellipse cx="140" cy="426" rx="50" ry="26" style="fill:${C.stone[1]}"/><ellipse cx="140" cy="424" rx="42" ry="20" style="fill:${s ? "#FFFFFF" : "#8FC3D8"}"/><rect x="134" y="404" width="12" height="22" rx="3" style="fill:${C.stone[2]}"/><ellipse cx="140" cy="404" rx="12" ry="5" style="fill:${C.stone[0]}"/>`,
      `<ellipse cx="140" cy="426" rx="50" ry="26"/><ellipse cx="140" cy="424" rx="42" ry="20"/>`)}${s ? `<ellipse cx="140" cy="402" rx="13" ry="5" fill="#FFFFFF"/>` : `<path d="M110 428 q8 -3 16 0 M150 432 q8 -3 16 0" style="stroke:#E8F4FA" stroke-width="1.2" fill="none"/>`}${jets}`;
  }
  const sculpt = `<g data-place="hksculpt" aria-label="${fest() ? "The snow sculpture: a great castle carved from snow" : "The fountain, where the snow sculptures go in February"}"><ellipse class="hov" cx="140" cy="476" rx="30" ry="10" style="fill:var(--butter)"/><g pointer-events="none">${plot}</g>${lab(140, 498, fest() ? "Snow castle" : "Fountain", "#CFE2EE", 10)}</g>`;
  // the clock tower: white clapboard, a red roof, the clock in its little tower
  const clap = (x, y, w, h) => `<path d="${Array.from({length: Math.floor(h/5)}, (_, k) => `M${x} ${y + 5 + k*5} H${x + w}`).join(" ")}" style="stroke:#D9DCD8" stroke-width=".8"/>`;
  const ctower = `<g data-place="hkclocktower" aria-label="The clock tower"><ellipse class="hov" cx="120" cy="216" rx="30" ry="11" style="fill:var(--butter)"/>${shade(64, 124, 112, 76)}
    ${sk(`<rect x="66" y="124" width="108" height="76" style="fill:${C.white}"/>${clap(66, 124, 108, 76)}<path d="M58 126 L120 96 L182 126z" style="fill:#C0453A"/><path d="M120 96 L182 126 H120z" style="fill:#A83A30" opacity=".5"/>
      <rect x="104" y="58" width="32" height="50" style="fill:${C.white}"/>${clap(104, 58, 32, 50)}<circle cx="120" cy="78" r="11" style="fill:#FFFDF6"/><path d="M120 78 V71 M120 78 l5 2" style="stroke:${C.ink}" stroke-width="1.3"/><path d="M100 58 L120 30 L140 58z" style="fill:#C0453A"/><path d="M120 30 V18 M116 22 h8" style="stroke:#5E6A66" stroke-width="1.4"/>
      ${sash(74, 134)}${sash(94, 134)}${sash(134, 134)}${sash(154, 134)}${sash(74, 166)}${sash(154, 166)}<path d="M102 178 L120 166 L138 178z" style="fill:#C0453A"/><rect x="110" y="178" width="20" height="22" style="fill:#5E6A66"/><path d="M120 178 V200" style="stroke:#3E4A46" stroke-width=".8"/>`,
      `<rect x="66" y="124" width="108" height="76"/><path d="M58 126 L120 96 L182 126z"/><rect x="104" y="58" width="32" height="50"/><path d="M100 58 L120 30 L140 58z"/><circle cx="120" cy="78" r="11"/><rect x="110" y="178" width="20" height="22"/>`)}
    ${s ? `<path d="M60 125 L120 95 L180 125 q-60 -6 -120 0z M101 57 L120 31 L139 57 q-19 -4 -38 0z M103 177 L120 166 L137 177 q-17 -3 -34 0z" fill="#FFFFFF" style="stroke:${C.snow3}" stroke-width=".6"/>` : ""}${lab(120, 240, "Clock tower", "#F6D6CF", 10)}</g>`;
  // the beer factory: red brick, a tall chimney, the red star on the gable, ivy on the walls
  const ivy = s ? "" : (() => { const col = se === "autumn" ? ["#C8452F", "#D9683A", "#B23A2A"] : ["#5E8A44", "#4E7A3A", "#6E9A52"];
    return [[290, 170], [292, 140], [298, 190], [486, 180], [482, 150], [300, 120]].map(([x, y], k) => `<circle cx="${x}" cy="${y}" r="${9 - (k % 3)}" style="fill:${col[k % 3]}" opacity=".9"/>`).join(""); })();
  const bwin = (x, y) => `<path d="M${x} ${y + 26} V${y + 6} Q${x + 7} ${y - 2} ${x + 14} ${y + 6} V${y + 26}z" style="fill:#E3DCCB"/><path d="M${x + 2} ${y + 25} V${y + 7} Q${x + 7} ${y + 1} ${x + 12} ${y + 7} V${y + 25}z" style="fill:${C.glass}"/><path d="M${x + 7} ${y + 3} V${y + 25} M${x + 2} ${y + 15} H${x + 12}" style="stroke:#9AA6AE" stroke-width=".7"/>`;
  const rf = roof(284, 84, 212, 20);
  const beer = `<g data-place="hkbeer" aria-label="The beer factory: red brick, a tall chimney and a red star"><ellipse class="hov" cx="390" cy="226" rx="34" ry="11" style="fill:var(--butter)"/>${shade(284, 104, 212, 106)}
    ${sk(`<rect x="470" y="-4" width="20" height="100" style="fill:${C.brick2}"/>${bricks(470, 0, 20, 96)}<rect x="468" y="-4" width="24" height="6" style="fill:#3A2E2A"/><rect x="470" y="22" width="20" height="5" style="fill:#E3DCCB"/>
      ${rf.art}<rect x="284" y="104" width="212" height="106" style="fill:${C.brick}"/>${bricks(284, 104, 212, 106)}<rect x="284" y="104" width="212" height="5" style="fill:#E3DCCB"/>
      <path d="M336 106 V72 L390 40 L444 72 V106z" style="fill:${C.brick}"/>${bricks(336, 56, 108, 50)}<path d="M332 74 L390 38 L448 74" style="fill:none;stroke:#E3DCCB" stroke-width="4"/><circle cx="390" cy="72" r="12" style="fill:#F2E6CC"/><path d="M390 62.5 L392.6 69.4 L399.8 69.6 L394.1 74 L396.2 81 L390 76.8 L383.8 81 L385.9 74 L380.2 69.6 L387.4 69.4z" style="fill:${C.red}"/>
      ${[296, 318, 340, 426, 448, 470].map(x => bwin(x, 116) + bwin(x, 166)).join("")}${bwin(352, 82)}${bwin(414, 82)}<path d="M372 210 V178 Q390 160 408 178 V210z" style="fill:#E3DCCB"/><path d="M376 210 V179 Q390 166 404 179 V210z" style="fill:#5E3E2E"/><path d="M379 178 Q390 170 401 178z" style="fill:#FFD98A"/><path d="M390 178 V210" style="stroke:#3E2A20" stroke-width="1"/>${ivy}`,
      `<rect x="284" y="104" width="212" height="106"/><path d="M336 106 V72 L390 40 L444 72 V106"/><rect x="470" y="-4" width="20" height="88"/>${rf.line}<path d="M372 210 V178 Q390 160 408 178 V210"/>`)}
    ${s ? `<path d="M334 72 L390 38 L446 72 q-56 -6 -112 0z M468 -4 h24 q-12 -4 -24 0z" fill="#FFFFFF" style="stroke:${C.snow3}" stroke-width=".6"/>` : ""}${steam(480, -2, 3, 26, "#E6E8EA", 4)}<g pointer-events="none">${lampGlow(390, 192, 24)}${board(390, 148, 44, "BEER", "#F2E6CC", "#7A3626", 9)}</g>${lab(390, 250, "Beer factory", "#F6D6CF", 10)}</g>`;
  // the ramen shop: plaster and dark wood, a noren over the door, a red lantern, steam from the vent
  const rr = roof(304, 322, 172, 28);
  const ramen = `<g data-place="hkramen" aria-label="The ramen shop: a red lantern and a noren curtain"><ellipse class="hov" cx="390" cy="436" rx="32" ry="11" style="fill:var(--butter)"/>${shade(304, 350, 172, 70)}
    ${sk(`<rect x="456" y="306" width="10" height="20" style="fill:${C.stone[1]}"/><rect x="304" y="350" width="172" height="70" style="fill:#EDE5D3"/><rect x="304" y="402" width="172" height="18" style="fill:#5E4A3E"/>${[304, 346, 434, 470].map(x => `<rect x="${x}" y="350" width="6" height="70" style="fill:#5E4A3E"/>`).join("")}
      <rect x="316" y="366" width="44" height="30" style="fill:#FFE3A3"/><path d="M316 381 H360 M331 366 V396 M346 366 V396" style="stroke:#5E4A3E" stroke-width="1.4"/><rect x="374" y="370" width="32" height="50" style="fill:#3A2E28"/><rect x="408" y="366" width="22" height="30" style="fill:${C.glass}"/>${rr.art}
      <path d="M371 368 H409 V392 H402 V376 H397 V392 H392.5 V376 H387.5 V392 H383 V376 H378 V392 H371z" style="fill:#2E3E66"/><circle cx="390" cy="374" r="3.6" style="fill:none;stroke:#FFFFFF" stroke-width="1.2"/>`,
      `<rect x="304" y="350" width="172" height="70"/>${rr.line}<rect x="374" y="370" width="32" height="50"/><path d="M371 368 H409 V392 H371z"/>`)}
    <g pointer-events="none">${lampGlow(446, 384, 22)}<path d="M446 356 V368" style="stroke:#3A2E28" stroke-width="1.2"/>${sk(`<ellipse cx="446" cy="380" rx="8" ry="11" style="fill:${C.red}"/><rect x="441" y="367" width="10" height="3" style="fill:#2A2420"/><rect x="441" y="390" width="10" height="3" style="fill:#2A2420"/><path d="M439 376 h14 M439 384 h14" style="stroke:#A82A22" stroke-width=".8"/>`, `<ellipse cx="446" cy="380" rx="8" ry="11"/>`)}
      ${board(390, 352, 52, "RAMEN", "#2E3E66", "#FFF6E8", 9)}${steam(338, 364, 3, 18, "#FFFFFF", 2)}${steam(461, 304, 3, 30, "#F4F6F8", 3)}</g>${lab(390, 460, "Ramen", "#F6E3B4", 10)}</g>`;
  // the beer garden: strings of lights over long tables in summer; stacked and snowed over in winter
  const bulbs = Array.from({length: 9}, (_, k) => { const t = (k + .5)/9, x = 418 + t*92, y = 474 + Math.sin(t*Math.PI)*12; return `<circle cx="${f1(x)}" cy="${f1(y + 2)}" r="2.4" fill="#FFD98A" style="stroke:#8A7448" stroke-width=".5"><animate attributeName="opacity" values="1;.55;1" dur="${2 + (k % 3)*.5}s" repeatCount="indefinite"/></circle>`; }).join("");
  const jug = (x, y) => `<rect x="${x}" y="${y - 7}" width="5" height="7" rx="1" style="fill:#E8B83A"/><rect x="${x}" y="${y - 8.5}" width="5" height="2.4" rx="1" style="fill:#FFFFFF"/>`;
  const tables = s ? sk(`<path d="M432 540 Q434 504 460 500 Q494 498 498 540z" style="fill:#FFFFFF"/><path d="M440 516 h50 M444 528 h46" style="stroke:${C.snow3}" stroke-width="1"/><rect x="452" y="532" width="34" height="8" style="fill:${C.wood}"/>`, `<path d="M432 540 Q434 504 460 500 Q494 498 498 540z"/>`)
    : sk(`${[506, 526].map(y => `<rect x="434" y="${y - 6}" width="62" height="3" style="fill:${C.wood2}"/><rect x="434" y="${y}" width="62" height="7" rx="1" style="fill:${C.wood}"/><rect x="434" y="${y + 10}" width="62" height="3" style="fill:${C.wood2}"/>`).join("")}${jug(442, 506)}${jug(462, 506)}${jug(480, 526)}${jug(450, 526)}`,
      `<rect x="434" y="506" width="62" height="7" rx="1"/><rect x="434" y="526" width="62" height="7" rx="1"/>`) + (se === "summer" ? `<g pointer-events="none">${steam(494, 498, 2, 16, "#E6E8EA", 2)}</g>` : "");
  const garden = `<g data-place="hkgarden" aria-label="The beer garden"><ellipse class="hov" cx="400" cy="520" rx="24" ry="11" style="fill:var(--butter)"/><g pointer-events="none">${sk(`<path d="M418 544 V470 M510 544 V470" style="stroke:${C.wood2}" stroke-width="3"/>`, `<path d="M418 544 V470 M510 544 V470"/>`)}<path d="M418 474 Q464 498 510 474" fill="none" style="stroke:#3A3430" stroke-width=".9"/>${bulbs}${lampGlow(464, 486, 40)}${tables}</g>${lab(470, 556, "Beer garden", "#F6E3B4", 10)}</g>`;
  const trees = cherry(36, 340, .9) + birch(214, 320, .95, 0) + birch(32, 450, 1, 1) + cherry(214, 452, .9) + birch(200, 620, .9, 2) + birch(80, 620, .85, 3) + birch(500, 300, .9, 4) + birch(240, 130, .9, 5);
  const snowbanks = drifts([[20, 214, 18, 5], [200, 214, 26, 6], [300, 214, 18, 5], [500, 220, 16, 5], [282, 300, 18, 5], [500, 430, 18, 5], [282, 600, 16, 5], [40, 260, 20, 5]]);
  const lamps = [[246, 214], [246, 420], [496, 254], [278, 600]].map(([x, y]) => gasLamp(x, y)).join("");
  return lampDefs + ground + streets + park + snowbanks + ctower + beer + ramen + sculpt + garden + parkPlace + trees + lamps + seasonFx()
    + gate("hkToOtaru", 16, 560, "Otaru", 66, 522, "West to Otaru", "#CFE2EE")
    + gate("hkToFurano", 262, 612, "Furano", 328, 604, "South to Furano", "#E6DDF3");
}

/* ---------- hk_niseko: Mount Yotei, the slope and the chairlift, the lodge, the foot bath, the river ---------- */
function nisekoScreen(){
  const s = snowy(), se = ssn();
  const ground = meadow([[200, 160, 120, 70, 0], [420, 300, 100, 60, 1], [120, 470, 120, 40, 0], [380, 470, 120, 34, 1]]);
  // Mount Yotei on the skyline: a perfect cone, snow-capped, with a dark band of forest at its foot
  const capF = s ? 1 : se === "summer" ? .2 : se === "autumn" ? .34 : .5;
  const yotei = `<g pointer-events="none"><path d="M0 0 H520 V70 Q400 64 300 74 Q200 80 100 72 Q40 68 0 74z" fill="${C.sky}"/>
    <path d="M300 74 L380 40 Q400 34 420 40 L520 64 V76z" fill="${s ? "#E4ECF2" : "#B4C4D1"}"/>
    <path d="M10 92 L140 4 L270 92z" fill="${s ? "#F4F7FA" : "#8EA2B4"}"/><path d="M140 4 L270 92 H140z" fill="${s ? "#D5E0EA" : "#7D92A5"}" opacity=".7"/>
    <path d="M${f1(140 - 130*capF)} ${f1(4 + 88*capF)} L140 4 L${f1(140 + 130*capF)} ${f1(4 + 88*capF)} ${Array.from({length: 6}, (_, k) => `l${f1(-260*capF/6/2)} ${k % 2 ? 5 : -3} l${f1(-260*capF/6/2)} ${k % 2 ? -5 : 3}`).join(" ")}z" fill="#FFFFFF"/>
    <path d="M140 4 L132 30 M140 4 L150 34 M140 4 L118 44" style="stroke:#B9C8D6" stroke-width="1" fill="none"/>
    <path d="M0 96 Q30 76 60 88 Q100 72 140 86 Q180 74 220 88 Q260 78 300 90 V104 H0z" fill="${s ? "#DCE5EC" : "#4E7A5E"}" opacity=".9"/></g>`;
  // the ski slope: a broad run down from the top station (groomed snow in the snow months, mown grass in summer)
  const runD = "M296 28 Q276 70 262 110 Q246 160 150 236 L292 240 Q304 170 318 120 Q328 80 330 28z";
  const run = `<g pointer-events="none" filter="url(#wash)">${BB}<path d="${runD}" fill="${s ? "#FFFFFF" : se === "autumn" ? "#D3CD9C" : "#BCDCA0"}"/></g>${s ? `<path d="M300 40 Q284 100 250 160 Q220 200 180 232 M312 40 Q300 100 274 170 Q258 210 236 236 M322 44 Q314 110 296 170 Q286 214 278 238" fill="none" style="stroke:#E3EAF0" stroke-width="2"/>
    ${[[160, 232], [190, 210], [226, 180], [250, 150]].map(([x, y]) => `<path d="M${x} ${y} v-12" style="stroke:#E8732E" stroke-width="1.6"/>`).join("")}` : wildflowers([[220, 200], [250, 170], [280, 130], [200, 226], [270, 214], [300, 90]])}`;
  const slopePlace = `<g data-place="hkslope" aria-label="The slopes and the chairlift"><ellipse class="hov" cx="200" cy="230" rx="30" ry="11" style="fill:var(--butter)"/>${lab(150, 256, s ? "Ski slope" : "The slopes", "#CFE2EE", 10)}</g>`;
  // the chairlift: a hut at the bottom and the top, pylons, chairs going up and coming down
  const up = "M402 180 L320 50", dn = "M332 46 L414 176";
  const chair = (path, k, n, dur) => `<g><animateMotion path="${path}" dur="${dur}s" begin="${f1(-k*dur/n)}s" repeatCount="indefinite"/><path d="M0 0 v8" style="stroke:#3A3836" stroke-width="1"/><path d="M-5 8 h10 v4 h-10z" fill="#3E6BAE" style="stroke:#2A2A2A" stroke-width=".6"/>${k % 2 ? `<circle cx="0" cy="5.5" r="2.2" fill="#F2D3BC"/><path d="M-3 9 q3 -4 6 0" fill="${["#C8372D", "#E3B53C", "#3F7A4E"][k % 3]}"/>` : ""}</g>`;
  const lift = `<g pointer-events="none">${sk(`<rect x="386" y="176" width="34" height="22" style="fill:#C9B08A"/><path d="M382 178 L403 164 L424 178z" style="fill:#9C4733"/><rect x="392" y="184" width="10" height="8" style="fill:${C.glass}"/><rect x="304" y="44" width="30" height="16" style="fill:#C9B08A"/><path d="M300 46 L319 34 L338 46z" style="fill:#9C4733"/>
    ${[[348, 92], [372, 130]].map(([x, y]) => `<path d="M${x + 4} ${y + 40} V${y - 2} M${x - 8} ${y - 2} H${x + 16}" style="stroke:#5E6A72" stroke-width="2.6"/>`).join("")}`, `<rect x="386" y="176" width="34" height="22"/><rect x="304" y="44" width="30" height="16"/>`)}
    ${s ? `<path d="M384 177 L403 164 L422 177 q-19 -4 -38 0z M302 45 L319 34 L336 45 q-17 -3 -34 0z" fill="#FFFFFF"/>` : ""}<path d="${up} ${dn}" style="stroke:#3A3836" stroke-width=".9"/>${[0, 1, 2, 3, 4].map(k => chair(up, k, 5, 22)).join("")}${[0, 1, 2, 3, 4].map(k => chair(dn, k, 5, 22)).join("")}</g>`;
  // skiers (the snow months): zig-zagging down the run
  const skier = (path, dur, begin, col) => `<g><animateMotion path="${path}" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/><path d="M-6 3 L6 5" style="stroke:#2A2A2A" stroke-width="1.4"/><path d="M-3 2 L-1 -5 L3 -5 L3 2" fill="${col}"/><circle cx="1" cy="-8" r="2.4" fill="#F2D3BC"/><path d="M-1 -10 h4" style="stroke:${col}" stroke-width="2"/><path d="M-2 -3 L-7 4 M4 -3 L8 4" style="stroke:#5E6A72" stroke-width=".7"/></g>`;
  const skiers = s ? `<g pointer-events="none">${skier("M308 34 Q260 70 296 100 Q320 130 260 160 Q200 196 230 236", 12, 0, "#C8372D")}${skier("M318 40 Q340 80 290 110 Q240 140 270 170 Q290 210 196 232", 14, -5, "#3E6BAE")}${skier("M300 30 Q270 60 290 90 Q310 130 250 150 Q190 180 250 236", 11, -8, "#E3B53C")}</g>` : "";
  // the log ski lodge: horizontal logs, a deep gable roof with a big triangle of window, chimney smoke
  const logs = Array.from({length: 10}, (_, k) => `<rect x="44" y="${330 + k*7}" width="152" height="7" style="fill:${k % 2 ? C.log : C.log2}"/><circle cx="44" cy="${333.5 + k*7}" r="3.6" style="fill:${C.log3}"/><circle cx="196" cy="${333.5 + k*7}" r="3.6" style="fill:${C.log3}"/>`).join("");
  const lodge = `<g data-place="hklodge" aria-label="The ski lodge"><ellipse class="hov" cx="120" cy="416" rx="32" ry="11" style="fill:var(--butter)"/>${shade(44, 330, 152, 70)}
    ${sk(`<rect x="164" y="262" width="16" height="40" style="fill:${C.stone[1]}"/>${logs}<path d="M44 332 L120 262 L196 332z" style="fill:${C.log2}"/><path d="${Array.from({length: 9}, (_, k) => `M${60 + k*15} 332 V${f1(Math.max(262, 332 - (k < 4 ? (k + 1)*15*70/76 : (8 - k + 1)*15*70/76)))}`).join(" ")}" style="stroke:${C.log}" stroke-width="1"/>
      <path d="M96 326 L120 294 L144 326z" style="fill:#FFD98A"/><path d="M120 294 V326 M108 310 H132" style="stroke:${C.log2}" stroke-width="1.4"/>
      <path d="M24 338 L120 246 L216 338 L204 342 L120 262 L36 342z" style="fill:#4E5A56"/>
      ${[60, 160].map(x => `<rect x="${x}" y="350" width="22" height="18" style="fill:#FFD98A"/><path d="M${x + 11} 350 v18 M${x} 359 h22" style="stroke:${C.log2}" stroke-width="1.2"/>`).join("")}<rect x="108" y="368" width="24" height="32" style="fill:#5E4A3E"/><path d="M120 368 v32" style="stroke:#3E3229" stroke-width=".8"/>
      <path d="M201 366 L206 400 M205 364 L210 400 M211 366 L214 400" style="stroke-width:2.4;stroke:${["#C8372D", "#3E6BAE", "#E3B53C"][0]}"/><path d="M205 364 L210 400" style="stroke:#3E6BAE" stroke-width="2.4"/><path d="M211 366 L214 400" style="stroke:#E3B53C" stroke-width="2.4"/>`,
      `<path d="M24 338 L120 246 L216 338 L204 342 L120 262 L36 342z"/><rect x="44" y="330" width="152" height="70"/><rect x="108" y="368" width="24" height="32"/><rect x="164" y="262" width="16" height="22"/>`)}
    ${s ? `<path d="M20 338 L120 242 L220 338 L208 340 L120 256 L32 340z" fill="#FFFFFF" style="stroke:${C.snow3}" stroke-width=".8"/><path d="M162 262 h20 q-10 -5 -20 0z" fill="#FFFFFF"/><path d="${[48, 64, 82, 160, 178, 194].map((x, k) => `M${x} ${f1(340 - (x < 120 ? (x - 36)*0 : 0))} l2 ${6 + k % 3*3} l2 ${-6 - k % 3*3}`).join(" ")}" fill="#E8F2F8" style="stroke:#B9CAD8" stroke-width=".5"/>` : ""}
    <g pointer-events="none">${steam(172, 258, 4, 46, "#C9CED2", 4)}${lampGlow(120, 316, 30)}${board(120, 336, 40, "LODGE", "#F2E6CC", C.wood2, 7)}</g>${lab(120, 440, "Ski lodge", "#F6E3B4", 10)}</g>`;
  // the foot bath: a wooden trough of hot spring water under a little roof, steaming
  const bath = `<g data-place="hkfootbath" aria-label="The foot bath: hot spring water in a wooden trough"><ellipse class="hov" cx="380" cy="416" rx="32" ry="11" style="fill:var(--butter)"/>${shade(322, 366, 116, 32, 6)}
    ${sk(`<path d="M328 334 V398 M432 334 V398" style="stroke:${C.wood2}" stroke-width="4"/><rect x="324" y="370" width="112" height="28" rx="2" style="fill:${C.log}"/><rect x="330" y="374" width="100" height="12" rx="2" style="fill:#BFE3E0"/><path d="M324 388 H436" style="stroke:${C.log2}" stroke-width="1.4"/>
      <path d="M314 338 L380 306 L446 338z" style="fill:#7B5E46"/><path d="M322 334 L380 310 L438 334" style="stroke:#5E4636" stroke-width="1" fill="none"/>`,
      `<rect x="324" y="370" width="112" height="28" rx="2"/><path d="M314 338 L380 306 L446 338z"/><path d="M328 338 V370 M432 338 V370"/>`)}
    ${s ? `<path d="M312 338 L380 304 L448 338 q-68 -6 -136 0z" fill="#FFFFFF" style="stroke:${C.snow3}" stroke-width=".6"/>` : ""}${steam(350, 374, 3, 30, "#FFFFFF", 3)}${steam(384, 374, 3, 34, "#FFFFFF", 3)}${steam(414, 374, 3, 28, "#FFFFFF", 3)}${board(380, 344, 56, "FOOT BATH", "#F2E6CC", C.wood2, 7)}${lab(380, 440, "Foot bath", "#CFE2EE", 10)}</g>`;
  // the river along the bottom: clear and fast with a raft in summer; frozen-edged with snowy banks in winter
  const bankD = "M0 522 Q130 514 260 522 Q390 530 520 520 V640 H0z";
  const flow = `<g pointer-events="none" style="stroke:#D6EEF6" stroke-width="1.6" fill="none" opacity=".85">${Array.from({length: 10}, (_, k) => `<path d="M${(k*53) % 520} ${548 + (k % 4)*22} h18"><animateTransform attributeName="transform" type="translate" values="0 0;60 0" dur="${2.4 + (k % 3)*.6}s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;1;0" dur="${2.4 + (k % 3)*.6}s" repeatCount="indefinite"/></path>`).join("")}</g>`;
  const raft = se === "summer" || (se === "spring" && mon() === 5) ? `<g pointer-events="none"><g><animateTransform attributeName="transform" type="translate" values="-120 0;640 0" dur="16s" repeatCount="indefinite"/>
    <ellipse cx="0" cy="584" rx="26" ry="9" fill="#F2C43A" style="stroke:var(--line)" stroke-width="1"/><ellipse cx="0" cy="583" rx="19" ry="5" fill="#D9A52A"/>${[-12, -4, 4, 12].map((x, k) => `<circle cx="${x}" cy="576" r="3" fill="#F2D3BC"/><path d="M${x - 3} 582 q3 -5 6 0" fill="${["#C8372D", "#3E6BAE", "#3F7A4E", "#E8732E"][k]}"/><path d="M${x} 578 l${k % 2 ? 7 : -7} 9" style="stroke:#5E4A3E" stroke-width="1.2"/>`).join("")}</g></g>` : "";
  const river = `<g pointer-events="none">${sk(`<path d="${bankD}" style="fill:${s ? "#5D8AA6" : "#6FA7C4"}"/>`, `<path d="M0 522 Q130 514 260 522 Q390 530 520 520"/>`)}<path d="M0 600 Q260 590 520 604" fill="none" style="stroke:#5A94B2" stroke-width="14" opacity=".35"/>${flow}
    ${s ? `<path d="M0 520 Q130 512 260 520 Q390 528 520 518 V536 Q440 546 360 538 Q260 548 160 536 Q80 544 0 536z" fill="#EEF4F8" style="stroke:#B9CAD8" stroke-width=".8"/><path d="M0 622 Q100 612 200 620 Q320 628 420 616 Q480 612 520 618 V640 H0z" fill="#EEF4F8" style="stroke:#B9CAD8" stroke-width=".8"/>`
      : [[40, 528], [120, 524], [210, 528], [330, 532], [450, 528], [500, 526]].map(([x, y], k) => `<ellipse cx="${x}" cy="${y}" rx="${5 + k % 3*2}" ry="3" fill="#A9A39A" style="stroke:var(--line)" stroke-width=".6"/>`).join("")}${raft}</g>`;
  const riverPlace = `<g data-place="hkriver" aria-label="The river"><ellipse class="hov" cx="300" cy="504" rx="30" ry="10" style="fill:var(--butter)"/>${lab(200, 566, "River", "#CFE2EE", 10)}</g>`;
  const paths = trail("M262 18 Q256 120 246 236 Q244 284 300 296 Q400 304 530 300") + trail("M120 420 Q250 444 380 420", 16) + trail("M290 298 Q296 400 300 506", 16);
  const trees = spruce(30, 128, 1) + spruce(62, 120, .9) + spruce(452, 112, 1) + spruce(488, 128, 1.1) + spruce(500, 236, .9) + birch(476, 200, 1, 0) + birch(232, 344, 1, 1) + birch(30, 480, 1, 2) + birch(470, 440, 1, 3) + birch(236, 486, .9, 4) + spruce(20, 260, .9) + cherry(470, 330, .85);
  const flora = wildflowers([[80, 180], [140, 290], [460, 380], [260, 400], [60, 450], [420, 470], [180, 470], [350, 260]]) + tufts([[90, 200], [200, 300], [440, 360], [330, 470], [80, 500], [180, 140], [470, 270]]);
  const snowbanks = drifts([[80, 160, 40, 10], [460, 280, 30, 8], [270, 470, 26, 7], [400, 500, 40, 8], [90, 506, 40, 8], [220, 290, 20, 6]]);
  return lampDefs + ground + yotei + run + paths + flora + snowbanks + river + lift + skiers + trees + lodge + bath + slopePlace + riverPlace + seasonFx()
    + gate("hkToOtaruN", 262, 26, "Otaru", 326, 30, "North to Otaru", "#CFE2EE")
    + gate("hkToFuranoE", 504, 300, "Furano", 462, 264, "East to Furano", "#E6DDF3");
}

/* ---------- hk_furano: the flower farm, the dairy, the melon stall, the lone tree ---------- */
const FL = {lav: ["#8E6CC4", "#A98BD8"], white: ["#F4F1EC", "#FFFFFF"], red: ["#D9443A", "#EE6A5E"], yellow: ["#E9C03A", "#F6DA6A"], pink: ["#E88AB2", "#F4B4CE"],
  orange: ["#EE8A3A", "#F6AA62"], salvia: ["#6A4CA8", "#8466C0"], green: ["#7FB05A", "#96C46E"]};
function stripeCols(){
  const se = ssn(), m = mon();
  if (se === "snow") return Array.from({length: 18}, () => ["#F6F9FB", "#FFFFFF"]);
  if (julyLav()) return "lav lav white lav lav red lav lav yellow lav lav pink lav lav white lav lav salvia".split(" ").map(k => FL[k]);
  if (se === "summer") return "red white yellow lav pink orange salvia white yellow red lav pink orange white lav yellow red white".split(" ").map(k => FL[k]);
  if (se === "autumn") return Array.from({length: 18}, (_, k) => [["#D8B04A", "#E8C866"], ["#C99838", "#DDB052"], ["#B9864A", "#CF9E62"], ["#E2C46E", "#EED890"]][k % 4]);
  return Array.from({length: 18}, (_, k) => m === 5 && k % 3 === 1 ? [FL.pink, FL.yellow, FL.white][Math.floor(k/3) % 3] : FL.green);
}
function furanoScreen(){
  const s = snowy(), se = ssn(), m = mon();
  const ground = meadow([[260, 330, 200, 70, 0], [420, 560, 110, 60, 1], [200, 560, 120, 50, 0], [60, 400, 60, 80, 1]]);
  const hills = skyline([[80, 90, 30], [170, 70, 22], [400, 110, 34], [490, 70, 24]], 36);
  // the flower farm: stripes of flowers running up the hill
  const fieldD = "M40 220 V100 Q40 66 80 64 Q260 52 440 64 Q480 66 480 100 V220z";
  const cols = stripeCols(), base = s ? "#DDE6EE" : se === "autumn" ? "#9A8A5A" : "#6E9A50";
  const stripes = cols.map(([c1, c2], k) => { const y0 = 60 + k*14; const d = `M20 ${y0 + 30} C160 ${y0 - 30} 320 ${y0 + 40} 500 ${y0 - 24}`;
    return `<path d="${d}" fill="none" style="stroke:${c1}" stroke-width="10.5"/>${s ? "" : `<path d="${d}" fill="none" style="stroke:${c2}" stroke-width="5" stroke-dasharray="1.5 4" stroke-linecap="round"/>`}`; }).join("");
  const field = `<defs><clipPath id="hkfield"><path d="${fieldD}"/></clipPath></defs><g pointer-events="none">${sk(`<path d="${fieldD}" style="fill:${base}"/><g clip-path="url(#hkfield)">${stripes}</g>`, `<path d="${fieldD}"/>`)}
    ${s ? "" : `<g clip-path="url(#hkfield)"><path d="M40 64 H480 V110 Q260 90 40 120z" fill="#FFFFFF" opacity=".12"/></g>`}</g>`;
  const fieldPlace = `<g data-place="hkflowers" aria-label="The flower farm: stripes of flowers up the hill"><ellipse class="hov" cx="260" cy="236" rx="34" ry="11" style="fill:var(--butter)"/>${lab(260, 258, julyLav() ? "Lavender fields" : "Flower farm", "#E6DDF3", 10)}</g>`;
  const tracks = trail("M262 18 Q262 44 300 46 H470 Q496 50 496 100 V200 Q494 240 450 244 H70 Q24 246 20 290") + trail("M262 244 Q276 340 340 420 Q366 436 390 430", 16) + trail("M200 244 Q170 380 116 496", 16) + trail("M14 300 Q60 320 120 326", 14);
  // the red barn dairy, a silo, and a big soft-serve cone out front
  const dairy = `<g data-place="hkdairy" aria-label="The Furano dairy: a red barn, a silo and soft-serve"><ellipse class="hov" cx="390" cy="426" rx="32" ry="11" style="fill:var(--butter)"/>${shade(304, 300, 176, 110)}
    ${sk(`<rect x="444" y="272" width="34" height="138" style="fill:#D9DEE2"/><path d="M444 290 H478 M444 312 H478 M444 334 H478 M444 356 H478 M444 378 H478" style="stroke:#A9B3BA" stroke-width="1.2"/><path d="M444 272 Q461 248 478 272z" style="fill:#8E9AA4"/>
      <path d="M304 410 V302 L324 276 L370 260 L416 276 L436 302 V410z" style="fill:#B8413A"/><path d="${Array.from({length: 16}, (_, k) => `M${310 + k*8} ${k < 3 || k > 13 ? 300 : 280} V410`).join(" ")}" style="stroke:#9A3530" stroke-width=".8"/>
      <path d="M300 306 L322 274 L370 256 L418 274 L440 306" fill="none" style="stroke:#5A4A48" stroke-width="5"/><path d="M302 304 L323 276 L370 259 L417 276 L438 304" fill="none" style="stroke:${C.white}" stroke-width="1.6"/>
      <rect x="358" y="278" width="24" height="20" style="fill:#7A2A26"/><path d="M358 278 l24 20 M382 278 l-24 20" style="stroke:${C.white}" stroke-width="1.6"/><rect x="358" y="278" width="24" height="20" style="fill:none;stroke:${C.white}" stroke-width="1.6"/>
      <rect x="312" y="346" width="40" height="64" style="fill:#9A3530"/><path d="M312 346 l40 64 M352 346 l-40 64" style="stroke:${C.white}" stroke-width="2"/><rect x="312" y="346" width="40" height="64" style="fill:none;stroke:${C.white}" stroke-width="2"/>
      <rect x="376" y="364" width="28" height="46" style="fill:#FFE3A3"/><path d="M390 364 V410" style="stroke:${C.white}" stroke-width="2"/><rect x="376" y="364" width="28" height="46" style="fill:none;stroke:${C.white}" stroke-width="2"/><rect x="412" y="344" width="18" height="16" style="fill:${C.glass}"/><path d="M421 344 v16 M412 352 h18" style="stroke:${C.white}" stroke-width="1.2"/>`,
      `<path d="M304 410 V302 L324 276 L370 260 L416 276 L436 302 V410z"/><rect x="444" y="272" width="34" height="138"/><path d="M444 272 Q461 248 478 272"/><rect x="376" y="364" width="28" height="46"/>`)}
    ${s ? `<path d="M298 306 L322 272 L370 254 L418 272 L442 306 L436 304 L417 278 L370 262 L323 278 L304 304z" fill="#FFFFFF" style="stroke:${C.snow3}" stroke-width=".6"/><path d="M445 271 Q461 247 477 271 q-16 -4 -32 0z" fill="#FFFFFF"/>` : ""}
    <g pointer-events="none">${lampGlow(390, 386, 26)}${board(370, 320, 66, "SOFT-SERVE", "#FFF6E8", "#B8413A", 8)}
      ${sk(`<path d="M290 414 V390" style="stroke:${C.wood2}" stroke-width="2.6"/><path d="M281 372 L290 396 L299 372z" style="fill:#D9A55A"/><path d="M283 376 l12 12 M297 376 l-12 12" style="stroke:#B9853A" stroke-width=".7"/><ellipse cx="290" cy="370" rx="10" ry="5" style="fill:#FFFDF6"/><ellipse cx="290" cy="364" rx="7.5" ry="4.4" style="fill:#FFFDF6"/><path d="M286 360 Q290 350 293 358" style="fill:#FFFDF6"/>`,
        `<path d="M281 372 L290 396 L299 372"/><path d="M280 370 Q280 364 283 363 Q283 357 290 352 Q297 357 297 363 Q300 364 300 370"/>`)}</g>${lab(390, 450, "Dairy", "#F6D6CF", 10)}</g>`;
  // the melon stall: orange wedges in summer, corn and potatoes in autumn, shuttered in winter and spring
  const open = m >= 6 && m <= 11, melons = m >= 6 && m <= 9;
  const wedge = (x, y) => `<path d="M${x - 6} ${y} Q${x} ${y - 9} ${x + 6} ${y}z" style="fill:#F2A65A"/><path d="M${x - 6} ${y} Q${x} ${y - 9} ${x + 6} ${y}" fill="none" style="stroke:#9DBF6A" stroke-width="1.6"/><path d="M${x - 2} ${y - 3} h4" style="stroke:#E07A3A" stroke-width=".8"/>`;
  const melon = (x, y) => `<circle cx="${x}" cy="${y}" r="7" style="fill:#B9D98A"/><path d="M${x - 5} ${y - 3} l10 6 M${x - 5} ${y + 3} l10 -6 M${x - 6} ${y} h12" style="stroke:#E8F2D2" stroke-width=".7"/>`;
  const goods = !open ? `<rect x="72" y="270" width="96" height="40" style="fill:#A88A64"/><path d="M72 280 H168 M72 290 H168 M72 300 H168" style="stroke:${C.wood2}" stroke-width="1"/>`
    : melons ? `${melon(84, 280)}${melon(98, 278)}<rect x="110" y="278" width="52" height="5" rx="1" style="fill:#FFFFFF"/>${wedge(118, 279)}${wedge(131, 279)}${wedge(144, 279)}${wedge(156, 279)}`
    : `<rect x="78" y="272" width="30" height="12" style="fill:#B38E5E"/>${[84, 92, 100].map(x => `<ellipse cx="${x}" cy="272" rx="3" ry="8" transform="rotate(70 ${x} 272)" style="fill:#F3D34A"/>`).join("")}<rect x="120" y="272" width="30" height="12" style="fill:#B38E5E"/>${[126, 134, 142].map(x => `<ellipse cx="${x}" cy="271" rx="4" ry="3" style="fill:#C9A06E"/>`).join("")}`;
  const aw = Array.from({length: 6}, (_, k) => `<rect x="${66 + k*18}" y="252" width="9" height="14" style="fill:${C.white}"/>`).join("");
  const stall = `<g data-place="hkmelon" aria-label="${melons ? "The melon stall: melon cut into wedges" : open ? "The farm stall: sweetcorn and potatoes" : "The melon stall, shut for the season"}"><ellipse class="hov" cx="120" cy="326" rx="28" ry="10" style="fill:var(--butter)"/>${shade(70, 266, 100, 44, 6)}
    ${sk(`<path d="M72 256 V310 M168 256 V310" style="stroke:${C.wood2}" stroke-width="3"/><rect x="70" y="284" width="100" height="26" style="fill:${C.wood}"/><path d="M70 296 H170" style="stroke:${C.wood2}" stroke-width="1"/>${goods}
      <rect x="64" y="252" width="112" height="14" style="fill:#5E9A4A"/>${aw}<path d="M64 266 ${Array.from({length: 6}, () => `q9.3 5 18.6 0`).join(" ")}" style="fill:#5E9A4A"/>`,
      `<rect x="70" y="284" width="100" height="26"/><path d="M64 252 H176 V266 ${Array.from({length: 6}, () => `q-9.3 5 -18.6 0`).join(" ")}z"/>`)}
    ${s ? `<path d="M64 252 H176 V248 q-56 -8 -112 0z" fill="#FFFFFF" style="stroke:${C.snow3}" stroke-width=".8"/><path d="M70 284 h100 q-50 -6 -100 0z" fill="#FFFFFF"/>` : ""}${board(120, 296, 46, melons ? "MELON" : open ? "CORN" : "CLOSED", "#FFF6E8", melons ? "#E07A3A" : C.wood2, 7)}${lab(120, 350, melons ? "Melon stall" : "Farm stall", "#F6E3B4", 10)}</g>`;
  // the lone poplar on its crest
  const crown = s ? `<path d="M106 470 V380 M106 450 l-10 -22 M106 440 l9 -24 M106 420 l-7 -22 M106 410 l6 -20 M106 396 l-4 -14" fill="none" style="stroke:#5E5048" stroke-width="1.4"/><path d="M96 428 l3 1 M115 416 l-3 1 M99 398 l2 1" style="stroke:#FFFFFF" stroke-width="2.4" stroke-linecap="round"/>`
    : `<ellipse cx="106" cy="418" rx="17" ry="52" style="fill:${se === "autumn" ? "#E2B840" : m === 4 ? "#B9D08E" : "#6E9E4E"}"/><ellipse cx="100" cy="410" rx="8" ry="38" style="fill:${se === "autumn" ? "#F0CE62" : m === 4 ? "#CCDFA6" : "#82B05E"}"/>`;
  const tree = `<g data-place="hktree" aria-label="The lone tree on the crest"><ellipse class="hov" cx="106" cy="500" rx="28" ry="10" style="fill:var(--butter)"/><g pointer-events="none"><g filter="url(#wash)" opacity=".7"><ellipse cx="106" cy="486" rx="78" ry="22" fill="${grass()[2]}"/></g><path d="M110 484 L190 500" style="stroke:#4E5E6C" stroke-width="10" opacity=".14" stroke-linecap="round"/>
    ${sk(`<rect x="103" y="440" width="6" height="44" style="fill:#5E5048"/>${s ? "" : crown}`, `<rect x="103" y="440" width="6" height="44"/>${s ? "" : `<ellipse cx="106" cy="418" rx="17" ry="52"/>`}`)}${s ? crown : ""}</g>${lab(106, 524, "Lone tree", "#DCEBC8", 10)}</g>`;
  const cows = s ? "" : `<g pointer-events="none">${[[470, 540, -1], [424, 590, 1]].map(([x, y, d]) => `<g transform="translate(${x} ${y}) scale(${d} 1)">${sk(`<path d="M-9 -2 v8 M-4 -2 v8 M5 -2 v8 M9 -2 v8" style="stroke:#3A3430" stroke-width="2"/><path d="M-13 -4 Q-13 -14 0 -14 Q12 -14 13 -5 Q10 1 0 1 Q-11 1 -13 -4z" style="fill:#FFFFFF"/><path d="M-6 -12 q4 4 0 8 q-4 -2 -2 -8z M4 -13 q5 2 3 7 q-5 0 -3 -7z" style="fill:#2E2A28"/><path d="M11 -12 Q18 -14 20 -9 Q20 -4 15 -4 Q11 -5 11 -12z" style="fill:#FFFFFF"/><ellipse cx="18" cy="-5.5" rx="2.6" ry="2" style="fill:#F2B8B0"/>`, `<path d="M-13 -4 Q-13 -14 0 -14 Q12 -14 13 -5 Q10 1 0 1 Q-11 1 -13 -4z"/>`)}<circle cx="15" cy="-10" r=".9" fill="#1E1C1A"/></g>`).join("")}
    ${sk(`<path d="M400 520 H516 M400 530 H516 M400 516 V540 M440 516 V540 M480 516 V540" style="stroke:${C.wood}" stroke-width="2"/>`, "")}</g>`;
  const trees = birch(500, 330, 1, 0) + birch(24, 210, .9, 1) + birch(250, 600, .9, 2) + cherry(200, 420, .9) + birch(500, 470, .95, 3);
  const flora = wildflowers([[240, 330], [300, 480], [180, 520], [380, 600], [40, 560], [220, 380]]) + tufts([[200, 300], [300, 300], [420, 480], [160, 580], [60, 400], [320, 560]]);
  const snowbanks = drifts([[30, 240, 22, 7], [496, 250, 20, 6], [200, 330, 30, 8], [300, 520, 40, 9], [460, 470, 30, 7]]);
  return lampDefs + ground + hills + field + tracks + flora + snowbanks + cows + trees + stall + tree + dairy + fieldPlace + seasonFx()
    + gate("hkToSapporoN", 262, 26, "Sapporo", 328, 30, "North to Sapporo", "#F6D6CF")
    + gate("hkToNisekoW", 16, 300, "Niseko", 50, 258, "West to Niseko", "#E2E6EA");
}

export function hokkaidoArt(scene){
  return scene === "hk_sapporo" ? sapporoScreen() : scene === "hk_niseko" ? nisekoScreen() : scene === "hk_furano" ? furanoScreen() : otaruScreen();
}

// The crossing to Hokkaido (both ways): a big white ferry with a navy band and a red funnel, on a cold steel-blue sea;
// going out, Mount Yotei's perfect snowy cone and a little red lighthouse on the horizon; coming home, Honeybrook's
// green hills. In the snow months, ice floes drift past and a red-crowned crane flies over.
export function hkFerryRideArt(home){
  const s = snowy();
  const crane = s ? `<g stroke="none"><animateTransform attributeName="transform" type="translate" values="0 0;90 -8;180 0" dur="6s" repeatCount="indefinite"/>
    <path d="M150 30 Q170 26 186 30 Q172 34 150 30z" fill="#FFFFFF" style="stroke:#3b3530" stroke-width=".8"/><path d="M186 30 L198 27" style="stroke:#2A2A2A" stroke-width="2"/><circle cx="199" cy="27" r="2.2" fill="#FFFFFF" style="stroke:#3b3530" stroke-width=".6"/><circle cx="199" cy="26" r="1.1" fill="#D9302A"/><path d="M200.6 27 l5 1" style="stroke:#8A8A70" stroke-width="1"/><path d="M150 30 l-12 2" style="stroke:#2A2A2A" stroke-width="1"/>
    <path d="M160 29 Q168 10 186 4 Q176 18 174 29z" fill="#FFFFFF" style="stroke:#3b3530" stroke-width=".8"><animateTransform attributeName="transform" type="scale" values="1 1;1 -.6;1 1" dur=".9s" additive="sum" repeatCount="indefinite"/></path><path d="M180 6 Q184 4 186 4 L182 12z" fill="#2A2A2A"/></g>` : "";
  const floes = s ? [[60, 70, 18], [210, 80, 12], [330, 68, 22], [460, 84, 14], [560, 72, 16]].map(([x, y, r], i) => `<path d="M${x - r} ${y} l${r*.4} ${-r*.3} h${r*1.2} l${r*.4} ${r*.3} l${-r*.4} ${r*.25} h${-r*1.2}z" fill="#F2F7FA" stroke="#9FB4C8" stroke-width=".8"><animateTransform attributeName="transform" type="translate" values="0 0;${-10 - i*3} 0;0 0" dur="${5 + i}s" repeatCount="indefinite"/></path>`).join("") : "";
  const gullsP = `<g fill="none" stroke-width="1.4">${[[300, 24], [336, 16]].map(([x, y], i) => `<path d="M${x - 8} ${y} q4 -6 8 0 q4 -6 8 0"><animateTransform attributeName="transform" type="translate" values="0 0;${10 + i*6} ${-3 + i*4};0 0" dur="${3 + i}s" repeatCount="indefinite"/></path>`).join("")}</g>`;
  const bank = `<svg class="taxibank" viewBox="0 0 600 90" preserveAspectRatio="none" aria-hidden="true"><g style="stroke:#3b3530" stroke-width="1.1">
    ${home ? `<path d="M0 56 Q75 34 150 50 T300 50 V60 H0z" fill="#9CC27E"/><path d="M180 56 Q240 40 300 50 T420 52 V60 H180z" fill="#B2CF92"/>`
      : `<path d="M400 56 L480 12 L560 56z" fill="${s ? "#F2F6F9" : "#9DB0C2"}"/><path d="M${s ? 430 : 458} ${s ? 40 : 24} L480 12 L${s ? 530 : 502} ${s ? 40 : 24} l-6 3 l-7 -3 l-7 4 l-7 -4 l-7 3 l-6 -3 l-6 3z" fill="#FFFFFF"/><path d="M380 56 Q420 48 470 52 Q540 46 600 54 V56z" fill="${s ? "#DDE6EE" : "#5E8A68"}"/>
        <path d="M300 56 L340 52 V58z" fill="#B9BFC3"/><path d="M326 53 L327 38 H333 L334 53z" fill="${C.red}"/><path d="M326.5 45 H333.5" stroke="#FFFFFF" stroke-width="2"/><rect x="325" y="33" width="10" height="5" fill="#F6E7A8"/><path d="M324 33 Q330 28 336 33z" fill="${C.red}"/>`}
    <path d="M0 56 H600 V90 H0z" fill="${s ? "#476F8E" : C.sea}"/><path d="M0 56 H600" stroke="${C.foam}" stroke-width="1.4"/>${[20, 90, 150, 220, 290, 350, 420, 480, 550].map((x, i) => `<path d="M${x} ${66 + (i % 3)*8} q5 -6 10 0 q5 6 10 0" fill="none" stroke="${C.foam}" stroke-width="1.4"><animateTransform attributeName="transform" type="translate" values="0 0;5 -1;0 0" dur="${1.4 + (i % 3)*.4}s" repeatCount="indefinite"/></path>`).join("")}
    ${floes}${gullsP}${crane}</g></svg>`;
  const boat = `<div class="taxiboat"><svg viewBox="0 0 160 60" width="230" height="86" aria-hidden="true"><g filter="url(#wob)" style="stroke:#3b3530" stroke-width="1.3" stroke-linejoin="round">
    <path d="M4 32 H156 L144 56 H16 Q8 46 4 32z" fill="${C.white}"/><path d="M6 38 H154 L151 45 H9z" fill="${C.navy}"/><path d="M12 51 H148" stroke="${C.red}" stroke-width="1.2"/>
    <rect x="26" y="18" width="104" height="14" rx="2" fill="${C.white}"/>${Array.from({length: 11}, (_, k) => `<rect x="${31 + k*8.8}" y="22" width="5.4" height="5" rx="1" fill="#8FAFC4" stroke-width=".6"/>`).join("")}<rect x="96" y="8" width="30" height="10" rx="2" fill="${C.white}"/><rect x="99" y="10" width="24" height="4" rx="1" fill="#5F7F98" stroke-width=".6"/>
    <path d="M58 18 L61 0 H77 L80 18z" fill="${C.red}"/><path d="M60.4 4 H77.6" stroke="${C.navy}" stroke-width="4"/><path d="M118 8 V0" />
    ${s ? `<path d="M26 18 h104 q-52 -4 -104 0z M96 8 h30 q-15 -3 -30 0z" fill="#FFFFFF" stroke-width=".6"/>` : ""}<circle cx="40" cy="14" r="3.6" fill="#F2D3BC"/><circle cx="50" cy="14" r="3.6" fill="#C99A78"/></g></svg></div>`;
  return bank + boat;
}
