// Saltwick Harbour (round 215): four screens of a North Yorkshire fishing village in a cove. Nothing like Honeybrook's
// greens, Jeju's black basalt or the Cinque Terre's pastels: grey sandstone cottages with white window frames and doors
// painted every colour, orange-red clay pantiles with their wavy courses, cobbled wynds, a grey-green North Sea, a
// curving stone harbour wall with a stubby white lighthouse, cobles (broad low fishing boats), lobster pots and gulls.
// Calm on purpose: a few strong pieces and plenty of open ground.
//   sw_clifftop: the sea far below on the west, the abbey ruin, the coastguard cottages, the sheep, the bench
//   sw_wynds:    the zig-zag cobbled lane between the cottages, the quay café, the smokehouse, the steps, the cat
//   sw_beach:    the cliff and its rock layers, the beach huts, the scar, the rock pools, the seals offshore
//   sw_harbour:  the chandlery, the fish market, the basin and its cobles, the ferry pier, the harbour wall and lighthouse
// Seasons: sea pinks (thrift) on the clifftop in spring, heather purple from late summer into autumn, frost and
// snow in winter.
import { ink, dayKey } from "../util.js";
import { sk, tapeLabel } from "./scenes.js";
import { lampDefs, lampGlow } from "./village-extras.js";
import { seasonOf } from "../data/items.js";

const C = {quay: "#C8C1B2", quay2: "#B3AB9A", cob: "#BDB7AB", cob2: "#A39D91", cob3: "#D3CEC3", stone: ["#B9AE98", "#AFA58F", "#C3B8A2"], stoneLine: "#857B6A",
  tile: "#C9583A", tile2: "#A8432C", tile3: "#DB7352", slate: "#5E636B", slate2: "#4C5158", sea: "#7FA19A", sea2: "#9BB8AF", sea3: "#6A8D86", foam: "#E6EFEA",
  sand: "#E3D3AE", sand2: "#D3C094", grass: "#AEB98C", grass2: "#9AA97A", grass3: "#BCC69C", rock: "#8F8C86", rock2: "#A6A39C", rock3: "#75726C",
  tar: "#33302E", tar2: "#46413D", white: "#F7F4EC", glass: "#46525A", wood: "#7A6050", wood2: "#5E4A3E", rope: "#B49A6A", ink: "#2F2B28",
  doors: ["#3E6BAE", "#C9483A", "#4E7A5A", "#E3B53C", "#2F4E6E", "#8A4A6A", "#5FA3A0"]};
const W = ink;
const ssn = () => seasonOf(dayKey());
const lab = (x, y, t, col = "#F6E3B4", size = 10) => tapeLabel(x, y, t, col, size);
const rnd = i => { const v = Math.sin(i*127.1 + 311.7)*43758.5453; return v - Math.floor(v); };
const f1 = n => (+n).toFixed(1);

/* ---------- pieces ---------- */
const shade = (x, y, w, h, d = 10) => `<path d="M${x + w} ${y + 6} l${d} ${d*.7} V${y + h + d*.7} H${x + d} l${-d} ${-d*.7}z" style="fill:#5E6C78" opacity=".2" pointer-events="none"/>`;
// a sign board with lettering
const board = (x, y, w, t, bg = C.white, fg = C.ink, size = 8) => `<rect x="${f1(x - w/2)}" y="${y}" width="${w}" height="${size + 5}" rx="2" style="fill:${bg};stroke:var(--line)" stroke-width=".8" pointer-events="none"/><text x="${x}" y="${f1(y + size + 1)}" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="${size}" fill="${fg}" pointer-events="none">${t}</text>`;
// a chalkboard: lines of white chalk on a dark board in a wooden frame (a: an A-board on legs)
const chalk = (x, y, w, lines, a = false) => { const h = lines.length*8 + 6;
  return `<g pointer-events="none">${a ? `<path d="M${x + 4} ${y + h} l-3 10 M${x + w - 4} ${y + h} l3 10" style="stroke:${C.wood2}" stroke-width="2"/>` : ""}<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.5" style="fill:#33403B;stroke:${C.wood}" stroke-width="2"/>
  ${lines.map((t, i) => `<text x="${x + w/2}" y="${y + 10 + i*8}" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="6.4" fill="#F2F0E6">${t}</text>`).join("")}</g>`; };
// a clay pantile roof: orange-red, rows of wavy courses, a darker ridge, slightly hipped at the ends
function pantile(x, y, w, rh, o = {}){
  const d = Math.min(10, w*.12), shape = `M${x - 4} ${y + rh} L${x + d} ${y} H${x + w - d} L${x + w + 4} ${y + rh}z`;
  let rows = "";
  for (let ry = y + 5; ry < y + rh - 1; ry += 5) {
    const t = (ry - y)/rh, x0 = x + d - (d + 4)*t, x1 = x + w - d + (d + 4)*t, n = Math.floor((x1 - x0)/6);
    rows += `M${f1(x0 + (x1 - x0 - n*6)/2)} ${f1(ry)}${"q1.5 3 3 0 q1.5 -3 3 0".repeat(n)} `;
  }
  const frost = ssn() === "winter" ? `<path d="M${x + d} ${y + 1} H${x + w - d} L${x + w - d + 3} ${y + rh*.4} H${x + d - 3}z" style="fill:#FFFFFF" opacity=".55"/>` : "";
  const chim = o.chimney === false ? "" : (() => { const cx = x + (o.chimX ?? w*.78); return `<rect x="${f1(cx - 5)}" y="${y - 12}" width="10" height="14" style="fill:${o.chimCol || C.stone[1]}"/><rect x="${f1(cx - 6)}" y="${y - 14}" width="12" height="3" style="fill:${C.stoneLine}"/><rect x="${f1(cx - 3)}" y="${y - 18}" width="3" height="4" style="fill:${C.tile2}"/><rect x="${f1(cx + 1)}" y="${y - 17}" width="3" height="3" style="fill:${C.tile2}"/>`; })();
  return { art: `${chim}<path d="${shape}" style="fill:${o.col || C.tile}"/><path d="${rows}" fill="none" style="stroke:${C.tile2}" stroke-width=".9"/><path d="M${x + d} ${y + 1} H${x + w - d}" style="stroke:${C.tile2}" stroke-width="2.4"/>${frost}`,
    line: `<path d="${shape}"/>${o.chimney === false ? "" : `<rect x="${f1(x + (o.chimX ?? w*.78) - 5)}" y="${y - 12}" width="10" height="14"/>`}` };
}
// a slate roof (the market hall, the coastguard cottages): grey with straight courses
function slateRoof(x, y, w, rh, col = C.slate){
  const shape = `M${x - 5} ${y + rh} L${x + 8} ${y} H${x + w - 8} L${x + w + 5} ${y + rh}z`;
  const rows = Array.from({length: Math.floor(rh/6)}, (_, k) => { const ry = y + 6 + k*6, t = (ry - y)/rh; return `M${f1(x + 8 - 13*t)} ${ry} H${f1(x + w - 8 + 13*t)}`; }).join(" ");
  const frost = ssn() === "winter" ? `<path d="M${x + 8} ${y + 1} H${x + w - 8} L${x + w - 5} ${y + rh*.4} H${x + 5}z" style="fill:#FFFFFF" opacity=".55"/>` : "";
  return { art: `<path d="${shape}" style="fill:${col}"/><path d="${rows}" style="stroke:${C.slate2}" stroke-width=".7"/><path d="M${x + 8} ${y + 1} H${x + w - 8}" style="stroke:#3E4248" stroke-width="2.4"/>${frost}`, line: `<path d="${shape}"/>` };
}
// a white-framed sash window
const win = (x, y, w = 12, h = 14) => `<rect x="${f1(x)}" y="${f1(y)}" width="${w}" height="${h}" style="fill:${C.white}"/><rect x="${f1(x + 2)}" y="${f1(y + 2)}" width="${w - 4}" height="${h - 4}" style="fill:${C.glass}"/><path d="M${f1(x + w/2)} ${f1(y + 2)} v${h - 4} M${f1(x + 2)} ${f1(y + h/2)} h${w - 4}" style="stroke:${C.white}" stroke-width="1.1"/><rect x="${f1(x - 1)}" y="${f1(y + h)}" width="${w + 2}" height="2" style="fill:#E8E4DA"/>`;
// a painted door in a white frame, with a little fanlight
const door = (x, y, col, w = 14, h = 24) => `<rect x="${f1(x - w/2 - 2)}" y="${f1(y - h - 2)}" width="${w + 4}" height="${h + 2}" style="fill:${C.white}"/><rect x="${f1(x - w/2)}" y="${f1(y - h + 4)}" width="${w}" height="${h - 4}" style="fill:${col}"/><path d="M${f1(x - w/2)} ${f1(y - h + 4)} q${w/2} -6 ${w} 0z" style="fill:#F3E7C8"/><circle cx="${f1(x + w/2 - 3)}" cy="${f1(y - h/2 + 2)}" r="1" style="fill:#E3C26A"/>`;
// a grey sandstone cottage: coursed stone, white windows, a painted door, a pantile roof (o.white: whitewashed)
function cottage(x, y, w, h, o = {}){
  const seed = Math.round(x*7 + y*13 + w), r = i => rnd(seed + i);
  const rh = o.rh || Math.round(Math.min(30, Math.max(16, h*.34))), wy = y + rh, wh = h - rh;
  const wall = o.white ? C.white : o.wallCol || C.stone[seed % 3];
  const cols = Math.max(1, Math.floor(w/26)), floors = wh > 54 ? 2 : 1, fh = wh/floors;
  const dx = o.doorX ?? (cols === 1 ? w/2 : (Math.floor(r(1)*cols) + .5)*w/cols), dcol = o.doorCol || C.doors[Math.floor(r(2)*C.doors.length)];
  let wins = "";
  for (let f = 0; f < floors; f++) for (let c = 0; c < cols; c++) {
    const cx = x + (c + .5)*w/cols, ground = f === floors - 1;
    if (ground && Math.abs(cx - (x + dx)) < 14) continue;
    if (o.noWin && ground) continue;
    wins += win(cx - 6, wy + 5 + f*fh + Math.max(0, (fh - 22)/2));
  }
  const course = o.white ? "" : `<path d="${Array.from({length: Math.floor(wh/7)}, (_, k) => `M${x} ${wy + 6 + k*7} H${x + w}`).join(" ")}" style="stroke:${C.stoneLine}" stroke-width=".5" opacity=".35"/>
    <path d="${Array.from({length: Math.floor(w*wh/90)}, (_, k) => { const yy = wy + 6 + Math.floor(r(k + 9)*Math.floor(wh/7 - 1))*7; return `M${f1(x + 3 + r(k + 40)*(w - 6))} ${yy} v7`; }).join(" ")}" style="stroke:${C.stoneLine}" stroke-width=".5" opacity=".3"/>`;
  const roof = pantile(x, y, w, rh, {chimney: o.chimney, chimX: o.chimX, col: o.tileCol});
  return (o.noShade ? "" : shade(x, wy, w, wh)) + sk(`<rect x="${x}" y="${wy}" width="${w}" height="${wh}" style="fill:${wall}"/>${course}${wins}${o.door === false ? "" : door(x + dx, y + h, dcol)}${roof.art}`,
    `<rect x="${x}" y="${wy}" width="${w}" height="${wh}"/>${roof.line}${o.door === false ? "" : `<rect x="${f1(x + dx - 9)}" y="${y + h - 26}" width="18" height="26"/>`}`);
}
// a row of cottages stepping up the slope: each a little different in height, with the next row's roofs peeking over
function row(x, y, w, h, seed = 0, o = {}){
  const n = Math.max(1, Math.round(w/52)), ww = w/n;
  const back = o.back === false ? "" : Array.from({length: n + 1}, (_, i) => { const bx = x - ww*.3 + i*ww*.92, bw = ww*.8, by = y - 2 + rnd(seed + i*5)*6;
    const rf = pantile(bx, by, bw, 18, {chimney: false, col: (i + seed) % 2 ? C.tile2 : C.tile});
    return bx + bw < x + w + 4 && bx > x - 10 ? `<g pointer-events="none">${sk(rf.art, rf.line)}</g>` : ""; }).join("");
  return back + Array.from({length: n}, (_, i) => { const dy = 12 + Math.round(rnd(seed + i*3)*14);
    return `<g pointer-events="none">${cottage(Math.round(x + i*ww), y + dy, Math.round(ww) - (i < n - 1 ? 1 : 0), h - dy, {white: rnd(seed + i*7) < .2, door: o.doors === false ? false : undefined, noShade: i < n - 1})}</g>`; }).join("");
}
// a cobbled lane: a grey kerb, setts, and the odd darker stone
const lane = (d, w = 34) => `<g filter="url(#wob)" pointer-events="none"><path d="${d}" fill="none" style="stroke:${C.cob2}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" style="stroke:${C.cob}" stroke-width="${w - 6}" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="${d}" fill="none" style="stroke:${C.cob3}" stroke-width="${w - 14}" stroke-dasharray="3 4" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/><path d="${d}" fill="none" style="stroke:${C.cob2}" stroke-width="${Math.max(2, w - 24)}" stroke-dasharray="2 9" stroke-linejoin="round" opacity=".6"/></g>`;
// a worn footpath across grass or sand
const foot = (d, w = 22, col = "#D6CBAE", edge = "#C2B591") => `<g filter="url(#wob)" pointer-events="none"><path d="${d}" fill="none" style="stroke:${edge}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" style="stroke:${col}" stroke-width="${w - 7}" stroke-linecap="round" stroke-linejoin="round"/></g>`;
// a coble: the broad low Yorkshire fishing boat, high sharp bow, flat transom, painted in bands
const coble = (x, y, col, band, i = 0, dir = 1, reg = "") => { const X = dx => f1(x + dx*dir);
  const hull = `M${X(-30)} ${y - 14} L${X(-28)} ${y} Q${X(0)} ${y + 6} ${X(24)} ${y - 2} Q${X(32)} ${y - 10} ${X(36)} ${y - 27} Q${X(16)} ${y - 15} ${X(-30)} ${y - 14}z`;
  return `<g pointer-events="none"><g>${i >= 0 ? `<animateTransform attributeName="transform" type="translate" values="0 0;0 -1.5;0 0" dur="${3.2 + i*.5}s" repeatCount="indefinite"/><ellipse cx="${x}" cy="${y + 3}" rx="34" ry="3" fill="${C.foam}" opacity=".7"/>` : `<ellipse cx="${x}" cy="${y + 3}" rx="32" ry="4" fill="#5E6C78" opacity=".2"/>`}
  ${sk(`<path d="${hull}" style="fill:${col}"/><path d="M${X(-29)} ${y - 11} Q${X(16)} ${y - 12} ${X(33)} ${y - 22}" fill="none" style="stroke:${band}" stroke-width="3.2"/><path d="M${X(-28)} ${y - 7} Q${X(14)} ${y - 7} ${X(30)} ${y - 15}" fill="none" style="stroke:#C9483A" stroke-width="1.4"/>
    <path d="M${X(-4)} ${y - 15} v-16" style="stroke:${C.wood2}" stroke-width="2"/>${reg ? `<text x="${X(8)}" y="${y - 1}" text-anchor="middle" font-family="Klee One,serif" font-weight="700" font-size="5.5" fill="${C.white}">${reg}</text>` : ""}`, `<path d="${hull}"/>`)}</g></g>`; };
// a lobster pot: a wooden base, a hooped dome of netting
const pot = (x, y, s = 1, col = "#5E7E6A") => `<g pointer-events="none"><ellipse cx="${x}" cy="${y + 1}" rx="${13*s}" ry="${3*s}" fill="#5E6C78" opacity=".2"/>${sk(`<rect x="${x - 12*s}" y="${y - 4*s}" width="${24*s}" height="${4*s}" style="fill:${C.wood}"/><path d="M${x - 11*s} ${y - 4*s} Q${x - 11*s} ${y - 18*s} ${x} ${y - 18*s} Q${x + 11*s} ${y - 18*s} ${x + 11*s} ${y - 4*s}z" style="fill:${col}" opacity=".55"/>
  <path d="M${x - 5*s} ${y - 4*s} q0 -13 5 -14 M${x + 5*s} ${y - 4*s} q0 -13 -5 -14 M${x - 10*s} ${y - 10*s} H${x + 10*s}" fill="none" style="stroke:#33403B" stroke-width=".7"/>`,
  `<path d="M${x - 11*s} ${y - 4*s} Q${x - 11*s} ${y - 18*s} ${x} ${y - 18*s} Q${x + 11*s} ${y - 18*s} ${x + 11*s} ${y - 4*s}"/><rect x="${x - 12*s}" y="${y - 4*s}" width="${24*s}" height="${4*s}"/>`)}</g>`;
// a bollard
const bollard = (x, y) => `<g pointer-events="none"><rect x="${x - 4}" y="${y - 8}" width="8" height="9" rx="2" style="fill:#3A3836;stroke:var(--line)" stroke-width=".8"/><rect x="${x - 5}" y="${y - 9}" width="10" height="3" rx="1.5" style="fill:#3A3836"/></g>`;
const waves = (pts, col = C.foam) => `<g pointer-events="none" style="stroke:${col}" stroke-width="1.4" fill="none" opacity=".85">${pts.map(([x, y], i) => `<path d="M${x} ${y} q5 -4 10 0 q5 4 10 0"><animateTransform attributeName="transform" type="translate" values="0 0;4 0;0 0" dur="${4 + i % 3}s" repeatCount="indefinite"/></path>`).join("")}</g>`;
const gulls = pts => `<g pointer-events="none" fill="none" style="stroke:#3A3430" stroke-width="1.2">${pts.map(([x, y], i) => `<path d="M${x - 7} ${y} q3.5 -5 7 0 q3.5 -5 7 0"><animateTransform attributeName="transform" type="translate" values="0 0;${18 + i*6} ${-4 + i*2};0 0" dur="${12 + i*3}s" repeatCount="indefinite"/></path>`).join("")}</g>`;
// a herring gull standing on something, looking about
const gull = (x, y, dir = 1) => `<g pointer-events="none" transform="translate(${x} ${y}) scale(${dir} 1)">${sk(`<path d="M-1 0 v-4 M3 0 v-4" style="stroke:#E8B13A" stroke-width="1.2"/><ellipse cx="0" cy="-8" rx="7" ry="4.4" style="fill:${C.white}"/><path d="M-7 -9 q5 -3 10 -1 q-3 4 -10 1z" style="fill:#A9AEB2"/><circle cx="5" cy="-13" r="3" style="fill:${C.white}"/><path d="M8 -13 l4 1 l-4 1z" style="fill:#E8B13A"/>`, `<ellipse cx="0" cy="-8" rx="7" ry="4.4"/><circle cx="5" cy="-13" r="3"/>`)}</g>`;
const rocks = (pts, col = C.rock) => `<g pointer-events="none">${sk(pts.map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r*.6}" style="fill:${col}"/><ellipse cx="${x - r*.3}" cy="${y - r*.22}" rx="${r*.4}" ry="${r*.2}" style="fill:${C.rock2}"/>`).join(""), pts.slice(0, 8).map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r*.6}"/>`).join(""))}</g>`;
// heather and thrift (sea pinks) in clumps: purple heather from late summer into autumn, pink thrift in spring
const heather = pts => { const se = ssn(), col = se === "summer" || se === "autumn" ? ["#9A6AA0", "#B07EB4", "#87588E"] : se === "winter" ? ["#8A7A70", "#7E7066", "#9A8C80"] : ["#7E8A62", "#8A9068", "#74805A"];
  return `<g pointer-events="none">${pts.map(([x, y, s = 1], i) => `<ellipse cx="${x}" cy="${y + 2}" rx="${14*s}" ry="${4*s}" fill="#6E7A58" opacity=".25"/>${[[-7, 0], [0, -3], [7, 0], [-3, 2], [4, 2]].map(([dx, dy], k) => `<ellipse cx="${x + dx*s}" cy="${y + dy*s}" rx="${5.5*s}" ry="${4*s}" style="fill:${col[(i + k) % 3]}"/>`).join("")}`).join("")}</g>`; };
const thrift = pts => { const se = ssn(), on = se === "spring" || se === "summer", col = on ? (se === "spring" ? "#E88AA8" : "#EFB4C6") : "#B9A28E";
  return `<g pointer-events="none">${pts.map(([x, y]) => `<ellipse cx="${x}" cy="${y + 1}" rx="7" ry="2.6" fill="#7E9460"/>${[[-4, -2], [0, -4], [4, -2]].map(([dx, dy]) => `<path d="M${x + dx*.6} ${y} L${x + dx} ${y + dy}" style="stroke:#6E8450" stroke-width=".8"/><circle cx="${x + dx}" cy="${y + dy}" r="${on ? 2.4 : 1.4}" fill="${col}"/>`).join("")}`).join("")}</g>`; };
function seasonFx(){
  if (ssn() === "winter") return `<g pointer-events="none">${Array.from({length: 14}, (_, i) => `<circle r="1.8" fill="#FFFFFF" opacity=".9"><animateMotion dur="${10 + (i % 5)}s" begin="${-i*1.3}s" repeatCount="indefinite" path="M${20 + i*36} -10 q-12 330 8 660"/></circle>`).join("")}</g>`;
  return "";
}
// frost on the grass in winter: pale washes
const frost = pts => ssn() !== "winter" ? "" : `<g filter="url(#wash)" opacity=".5" pointer-events="none">${pts.map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#F4F6F6"/>`).join("")}</g>`;
// the way on: a fingerpost, a white arm with a red tip
const gate = (id, x, y, label, lx, ly, aria, col = "#F6E3B4") => `<g data-place="${id}" aria-label="${aria}"><ellipse class="hov" cx="${x}" cy="${y + 6}" rx="26" ry="20" style="fill:var(--butter)"/>
  ${sk(`<rect x="${x - 3}" y="${y - 30}" width="6" height="38" style="fill:${C.wood2}"/><path d="M${x + 3} ${y - 28} h22 l6 6 l-6 6 h-22z" style="fill:${C.white}"/><path d="M${x + 22} ${y - 28} h3 l6 6 l-6 6 h-3z" style="fill:#C9483A"/><path d="M${x + 6} ${y - 22} h12" style="stroke:${C.ink}" stroke-width="1.4"/>`,
    `<rect x="${x - 3}" y="${y - 30}" width="6" height="38"/><path d="M${x + 3} ${y - 28} h22 l6 6 l-6 6 h-22z"/>`)}${lab(lx, ly, label, col, 11)}</g>`;
const place = (id, x, y, rx, ry, aria, body, label, lx, ly, col) => `<g data-place="${id}" aria-label="${aria}"><ellipse class="hov" cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" style="fill:var(--butter)"/>${body}${label ? lab(lx, ly, label, col, 10) : ""}</g>`;

/* ---------- sw_harbour: the chandlery, the fish market, the basin, the pier and the ferry, the wall, the lighthouse ---------- */
function harbourScreen(){
  const ground = `<rect width="520" height="640" style="fill:${C.quay}"/><g filter="url(#wash)" opacity=".55"><ellipse cx="260" cy="300" rx="190" ry="110" style="fill:#D3CDBF"/><ellipse cx="90" cy="490" rx="130" ry="80" style="fill:${C.sand}"/><ellipse cx="60" cy="330" rx="80" ry="70" style="fill:${C.sand}"/></g>`
    + `<g pointer-events="none" opacity=".35" style="stroke:${C.quay2}" stroke-width=".8">${Array.from({length: 9}, (_, k) => `<path d="M${210 + (k % 3)*14} ${210 + k*24} h46 M${330 + (k % 2)*18} ${220 + k*22} h40"/>`).join("")}</g>`;
  // the water: the basin between the pier and the wall, the sea to the south-west and outside the wall
  const waterD = "M262 440 H420 V612 Q466 628 508 610 Q514 480 512 340 L520 330 V640 H0 V576 H200 V600 H262z";
  const water = `<g pointer-events="none">${sk(`<path d="${waterD}" style="fill:${C.sea}"/><path d="M270 448 H414 V470 H270z" style="fill:${C.sea3}" opacity=".35"/>`, `<path d="M262 440 H420 V612 Q466 628 508 610 Q514 480 512 340 L520 330 M0 576 H200 V600 H262 V440"/>`)}
    ${waves([[300, 470], [380, 520], [290, 560], [400, 600], [40, 600], [140, 624], [460, 632], [214, 624]])}</g>`;
  // the slipway and the shingle west of the pier, a coble pulled up on it, pots stacked
  const slip = `<g pointer-events="none">${sk(`<path d="M0 452 Q100 440 200 446 V576 H0z" style="fill:${C.sand}"/><path d="M120 470 L170 470 L190 576 L140 576z" style="fill:${C.quay2}"/>`, `<path d="M0 452 Q100 440 200 446"/><path d="M120 470 L140 576 M170 470 L190 576"/>`)}
    ${[[30, 520], [60, 548], [96, 506], [20, 470]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="4" ry="2.4" fill="${C.rock2}"/>`).join("")}
    <path d="M10 570 q20 -6 40 0 q20 6 40 0 q20 -6 40 0" fill="none" style="stroke:#6E7A4E" stroke-width="2" opacity=".6"/></g>`
    + coble(66, 516, "#3E6BAE", C.white, -1, -1, "WY 7") + pot(102, 470) + pot(124, 462, .9, "#7E6A9A") + pot(112, 450, .85);
  // the pier: a stone jetty running down the west side of the basin, timber decking, bollards, a ladder
  const pier = `<g pointer-events="none">${sk(`<rect x="200" y="436" width="62" height="166" style="fill:${C.quay2}"/><rect x="206" y="436" width="50" height="166" style="fill:#C9BFA8"/>`, `<rect x="200" y="436" width="62" height="166"/>`)}
    <path d="${Array.from({length: 20}, (_, k) => `M206 ${444 + k*8} h50`).join(" ")}" style="stroke:#A89C84" stroke-width=".8"/>${[452, 512, 572].map(y => bollard(258, y)).join("")}${[480, 540].map(y => bollard(204, y)).join("")}
    <path d="M262 596 v14 M268 596 v14 M262 600 h6 M262 606 h6" style="stroke:#3A3836" stroke-width="1.2"/></g>`;
  // the ferry, tied up at the end of the pier
  // round 231: the boat home, its jetty and its label are all one big target (only the label used to take a tap)
  const ferry = `<g data-place="swpier" aria-label="The ferry pier: ferries home to Honeybrook"><rect x="45" y="530" width="165" height="110" fill="transparent" pointer-events="all"/><ellipse class="hov" cx="230" cy="560" rx="28" ry="12" style="fill:var(--butter)"/>
    <g pointer-events="none"><g><animateTransform attributeName="transform" type="translate" values="0 0;0 -1.5;0 0" dur="4s" repeatCount="indefinite"/><ellipse cx="128" cy="628" rx="76" ry="5" fill="${C.foam}" opacity=".7"/>
      ${sk(`<path d="M56 592 H200 L188 628 H70z" style="fill:${C.white}"/><rect x="58" y="606" width="138" height="6" style="fill:#3E6A56"/><rect x="88" y="572" width="74" height="22" rx="3" style="fill:#EEF1EA"/>${[96, 114, 132, 150].map(x => `<rect x="${x - 4}" y="577" width="11" height="9" rx="2" style="fill:#9DB8C4"/>`).join("")}<rect x="112" y="558" width="12" height="16" style="fill:#C9483A"/><rect x="112" y="558" width="12" height="4" style="fill:#2F2B28"/>`,
        `<path d="M56 592 H200 L188 628 H70z"/><rect x="88" y="572" width="74" height="22" rx="3"/>`)}</g>
      <path d="M198 596 Q204 590 210 590" fill="none" style="stroke:${C.rope}" stroke-width="1.6"/></g>${lab(150, 548, "Ferry home", "#C9DDE0", 10)}</g>`;
  // the harbour wall: a broad stone arm down the east side, its parapet against the open sea, curving round to the tip
  const wall = `<g pointer-events="none">${sk(`<path d="M420 210 Q470 200 512 214 V340 Q514 480 508 610 Q466 628 420 612z" style="fill:#BEB5A2"/><path d="M500 214 H512 V340 Q514 480 508 610 L498 612 Q504 480 502 340z" style="fill:#9C9381"/>`,
      `<path d="M420 612 Q466 628 508 610 Q514 480 512 340 V214"/><path d="M502 214 V340 Q504 480 498 612"/>`)}
    <g opacity=".45" style="stroke:#8A8170" stroke-width=".8">${Array.from({length: 16}, (_, k) => `<path d="M424 ${236 + k*24} h74 M${434 + (k % 2)*22} ${236 + k*24} v24 M${470 + (k % 2)*14} ${236 + k*24} v24"/>`).join("")}</g>
    <path d="${Array.from({length: 9}, (_, k) => `M500 ${290 + k*12} v-12`).join(" ")} M500 278 V386" style="stroke:${C.white};stroke-linecap:round" stroke-width="1.6"/><path d="M500 278 V386" style="stroke:var(--line)" stroke-width=".6" fill="none"/>
    ${bollard(428, 470)}${bollard(428, 560)}</g>` + pot(468, 268) + pot(482, 256, .85, "#7E6A9A") + gull(500, 216, -1);
  // the lighthouse at the tip of the wall: white, round and stubby, a gallery, a green lamp
  const lh = `<g data-place="swlighthouse" aria-label="The lighthouse"><ellipse class="hov" cx="462" cy="506" rx="28" ry="12" style="fill:var(--butter)"/>
    <g pointer-events="none"><ellipse cx="470" cy="598" rx="34" ry="7" fill="#5E6C78" opacity=".22"/>${sk(`<path d="M450 598 L454 548 H486 L490 598z" style="fill:${C.white}"/><path d="M451 584 H489" style="stroke:#C9483A" stroke-width="3"/><rect x="446" y="542" width="48" height="6" style="fill:#3A3836"/>
      <path d="M447 542 v-8 M455 542 v-8 M463 542 v-8 M477 542 v-8 M485 542 v-8 M493 542 v-8 M447 535 H493" style="stroke:#3A3836" stroke-width="1"/><rect x="458" y="526" width="24" height="16" rx="2" style="fill:#BFE6C4"/><path d="M456 526 Q470 512 484 526z" style="fill:#3E6A56"/><path d="M470 514 v-6" style="stroke:#3A3836" stroke-width="1.4"/>
      <rect x="463" y="576" width="12" height="20" rx="5" style="fill:#3E6A56"/><rect x="465" y="556" width="8" height="10" rx="4" style="fill:${C.glass}"/><path d="M462 506 L466 524 M470 506 L472 524" style="stroke:#8A8170" stroke-width="1"/>`,
      `<path d="M450 598 L454 548 H486 L490 598"/><rect x="446" y="542" width="48" height="6"/><rect x="458" y="526" width="24" height="16" rx="2"/><path d="M456 526 Q470 512 484 526z"/>`)}
      <circle cx="470" cy="534" r="14" fill="#7FE0A0" opacity=".25"><animate attributeName="opacity" values=".1;.45;.1" dur="4s" repeatCount="indefinite"/></circle>${lampGlow(470, 534, 22)}</g>${lab(468, 486, "Lighthouse", "#DCEBD8", 10)}</g>`;
  // crabbing off the wall: a red bucket, a line over the edge into the basin
  const crab = `<g data-place="swcrab" aria-label="Crabbing off the harbour wall"><ellipse class="hov" cx="440" cy="420" rx="22" ry="10" style="fill:var(--butter)"/>
    <g pointer-events="none">${sk(`<path d="M446 404 h14 l-2 14 h-10z" style="fill:#C9483A"/><ellipse cx="453" cy="404" rx="7" ry="2" style="fill:#7FA19A"/><path d="M446 404 q7 -10 14 0" fill="none" style="stroke:#3A3836" stroke-width="1"/>`, `<path d="M446 404 h14 l-2 14 h-10z"/>`)}
      <path d="M440 418 Q428 414 420 420 L416 470" fill="none" style="stroke:#3A3430" stroke-width=".8"/><circle cx="416" cy="472" r="2" fill="#E8B13A"/><path d="M462 416 l4 -2 m-4 2 l4 2" style="stroke:#C8643B" stroke-width="1.6"/><ellipse cx="458" cy="412" rx="3" ry="2" fill="#C8643B"/></g>${lab(458, 392, "Crabbing", "#F3D3C4", 10)}</g>`;
  // the cobles in the basin
  const boats = `<g data-place="swboats" aria-label="The cobles"><ellipse class="hov" cx="330" cy="426" rx="40" ry="10" style="fill:var(--butter)"/>
    <path d="M262 478 Q280 486 296 484 M420 538 Q404 536 392 532 M262 588 Q276 590 288 588" fill="none" style="stroke:${C.rope}" stroke-width="1.2" pointer-events="none"/>
    ${coble(330, 492, "#3E6BAE", C.white, 0, 1, "WY 12")}${coble(356, 546, C.white, "#C9483A", 1, -1, "WY 31")}${coble(318, 600, "#4E7A5A", "#E3B53C", 2, 1, "WY 4")}${lab(330, 404, "Cobles", "#C9DDE0", 10)}</g>`;
  // the fish boxes on the quay
  const boxes = `<g pointer-events="none">${sk([[150, 446, "#3E6BAE"], [176, 446, "#C9483A"], [162, 432, "#3E6BAE"]].map(([x, y, c]) => `<rect x="${x - 12}" y="${y - 10}" width="24" height="12" style="fill:${c}"/><ellipse cx="${x}" cy="${y - 10}" rx="10" ry="2.4" style="fill:#E8F0F2"/><ellipse cx="${x - 4}" cy="${y - 11}" rx="5" ry="1.6" style="fill:#9AA4AA"/><ellipse cx="${x + 4}" cy="${y - 11}" rx="5" ry="1.6" style="fill:#AEB4B6"/>`).join(""),
    `<rect x="138" y="436" width="24" height="12"/><rect x="164" y="436" width="24" height="12"/><rect x="150" y="422" width="24" height="12"/>`)}</g>`;
  // the chandlery: a sandstone shop with a bow window full of rope and lamps, and a brass bell by the door
  const chand = (() => { const c = cottage(30, 60, 170, 110, {doorX: 86, doorCol: "#2F4E6E", rh: 34, chimX: 140, noWin: true});
    return `<g data-place="swchandlery" aria-label="The chandlery"><ellipse class="hov" cx="116" cy="186" rx="40" ry="11" style="fill:var(--butter)"/>${c}
    <g pointer-events="none">${sk(`<rect x="40" y="130" width="52" height="34" style="fill:${C.white}"/><rect x="44" y="134" width="44" height="28" style="fill:#5A6870"/>${[[54, 154], [70, 156]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="8" ry="5" style="fill:${C.rope}"/><ellipse cx="${x}" cy="${y}" rx="3.4" ry="2" style="fill:#8A7448"/>`).join("")}
      <path d="M80 134 v6" style="stroke:#E3C26A" stroke-width="1"/><rect x="77" y="140" width="6" height="9" rx="1.5" style="fill:#F6C26B"/><path d="M50 134 v4" style="stroke:#E3C26A" stroke-width="1"/><rect x="47" y="138" width="6" height="8" rx="1.5" style="fill:#E3C26A"/>
      <rect x="140" y="130" width="52" height="34" style="fill:${C.white}"/><rect x="144" y="134" width="44" height="28" style="fill:#5A6870"/><path d="M150 160 l8 -18 l8 18z" style="fill:#E8E4DA"/><path d="M158 142 v18" style="stroke:${C.wood2}" stroke-width="1"/><path d="M170 162 h14 v-10 h-4 v6 h-6 v-6 h-4z" style="fill:#C9483A"/>
      <path d="M106 128 h12" style="stroke:${C.wood2}" stroke-width="1.6"/><path d="M112 128 v3" style="stroke:#3A3836" stroke-width="1"/><path d="M107 140 Q107 131 112 131 Q117 131 117 140z" style="fill:#D9A84A"/><circle cx="112" cy="141" r="1.4" style="fill:#8A6A2E"/>`,
      `<rect x="40" y="130" width="52" height="34"/><rect x="140" y="130" width="52" height="34"/><path d="M107 140 Q107 131 112 131 Q117 131 117 140z"/>`)}
      ${board(116, 98, 86, "CHANDLERY", "#2F4E6E", "#F2E6C2", 9)}${lampGlow(146, 146, 20)}</g>${lab(116, 210, "Chandlery", "#C9DDE0", 10)}</g>`; })();
  // the fish market: a long stone hall with a slate roof, wide doors, a chalkboard of the day's catch
  const market = (() => { const rf = slateRoof(300, 60, 190, 40);
    return `<g data-place="swmarket" aria-label="The fish market"><ellipse class="hov" cx="396" cy="196" rx="44" ry="11" style="fill:var(--butter)"/>${shade(300, 100, 190, 80)}
    ${sk(`<rect x="300" y="100" width="190" height="80" style="fill:${C.stone[2]}"/><path d="${Array.from({length: 11}, (_, k) => `M300 ${106 + k*7} H490`).join(" ")}" style="stroke:${C.stoneLine}" stroke-width=".5" opacity=".35"/>
      ${[312, 334, 448, 470].map(x => win(x, 112, 12, 18)).join("")}<rect x="374" y="134" width="44" height="46" style="fill:#2F4E6E"/><rect x="378" y="138" width="17" height="42" style="fill:#3E6A8A"/><rect x="397" y="138" width="17" height="42" style="fill:#3E6A8A"/><path d="M372 134 h48 v-4 h-48z" style="fill:${C.white}"/>
      ${rf.art}<rect x="378" y="62" width="36" height="12" style="fill:#4C5158"/><path d="M380 62 v12 M388 62 v12 M396 62 v12 M404 62 v12 M412 62 v12" style="stroke:#6E737A" stroke-width="1"/>`,
      `<rect x="300" y="100" width="190" height="80"/>${rf.line}<rect x="374" y="134" width="44" height="46"/>`)}
    ${board(396, 112, 84, "FISH MARKET", C.white, "#2F4E6E", 9)}${chalk(426, 140, 52, ["TODAY:", "LOBSTER", "CRAB, COD"])}
    <g pointer-events="none">${sk(`<rect x="320" y="166" width="22" height="12" style="fill:#3E6BAE"/><ellipse cx="331" cy="166" rx="9" ry="2.4" style="fill:#E8F0F2"/>`, `<rect x="320" y="166" width="22" height="12"/>`)}</g>${lab(396, 216, "Fish market", "#F6E3B4", 10)}</g>`; })();
  const lane0 = lane("M300 18 Q300 100 300 170 Q296 220 260 250");
  const lamps = `<g pointer-events="none">${[[214, 196], [262, 430]].map(([x, y]) => lampGlow(x, y - 30, 26) + sk(`<rect x="${x - 4}" y="${y - 36}" width="8" height="10" rx="2" style="fill:#F6C26B"/>`, `<path d="M${x} ${y} v-26"/><rect x="${x - 4}" y="${y - 36}" width="8" height="10" rx="2"/><path d="M${x - 6} ${y - 36} l6 -4 l6 4z"/>`)).join("")}</g>`;
  const quay = `<g pointer-events="none">${sk(`<ellipse cx="372" cy="300" rx="12" ry="6" style="fill:${C.rope}"/><ellipse cx="372" cy="300" rx="7" ry="3.4" style="fill:#9A8256"/><ellipse cx="372" cy="300" rx="3" ry="1.4" style="fill:#7A6440"/>
    <path d="M150 316 v-22 M142 298 h16 M138 312 q12 12 24 0" fill="none" style="stroke:#4A4A4C" stroke-width="3" stroke-linecap="round"/><circle cx="150" cy="291" r="3" fill="none" style="stroke:#4A4A4C" stroke-width="2"/>`, `<ellipse cx="372" cy="300" rx="12" ry="6"/>`)}</g>` + pot(400, 296, .85) + pot(84, 400, .9, "#7E6A9A");
  return lampDefs + ground + slip + water + lane0 + quay + pier + wall + boxes + lamps + chand + market + boats + crab + ferry + lh
    + gull(150, 422, 1) + gulls([[90, 300], [360, 380], [180, 520]]) + frost([[260, 300, 120, 50]]) + seasonFx()
    + gate("swToWynds", 300, 26, "Up the wynds", 236, 30, "North up the cobbled wynds")
    + gate("swToBeach", 16, 330, "The beach", 62, 296, "West along the sands to the beach and the scar", "#F3E1A0");
}

/* ---------- sw_wynds: the cobbled lane, the cottages, the quay café, the smokehouse, the steps, the cat ---------- */
function wyndsScreen(){
  const ground = `<rect width="520" height="640" style="fill:#CBC6BA"/><g filter="url(#wash)" opacity=".6"><ellipse cx="420" cy="200" rx="90" ry="50" style="fill:${C.grass}"/><ellipse cx="120" cy="590" rx="110" ry="40" style="fill:${C.grass}"/><ellipse cx="440" cy="600" rx="80" ry="34" style="fill:${C.grass3}"/><ellipse cx="270" cy="330" rx="110" ry="160" style="fill:#D6D1C6"/></g>`;
  const lanes = lane("M270 14 Q262 110 262 196 Q262 222 236 228 Q206 236 214 262 Q228 300 266 312 Q300 322 296 360 Q290 400 252 416 Q222 432 236 470 Q250 520 270 560 Q290 590 300 626", 40)
    + lane("M14 240 Q100 236 150 226 Q200 218 240 224 M120 190 Q126 214 160 224", 30) + lane("M296 372 Q350 384 410 380", 28) + lane("M70 404 Q150 412 250 416", 28);
  // the 199 steps: up the west side from the lane to the clifftop, a bench on the landing
  const steps = `<g data-place="swsteps" aria-label="The 199 steps"><ellipse class="hov" cx="60" cy="400" rx="26" ry="11" style="fill:var(--butter)"/>
    <g pointer-events="none">${sk(`<path d="M38 412 L84 412 L72 336 L56 300 L44 254 L18 254 L28 300 L40 336z" style="fill:#C2B9A6"/>`, `<path d="M38 412 L84 412 L72 336 L56 300 L44 254 L18 254 L28 300 L40 336z"/>`)}
      <path d="${Array.from({length: 26}, (_, k) => { const y = 408 - k*6, t = (412 - y)/158, l = 38 + (18 - 38)*t + (y < 336 && y > 300 ? -4 : 0), r = 84 + (44 - 84)*t + (y < 336 && y > 300 ? 2 : 0); return y > 324 && y < 340 ? "" : `M${f1(l + 2)} ${y} H${f1(r - 2)}`; }).join(" ")}" style="stroke:#8A8170" stroke-width=".9"/>
      <path d="M86 410 L74 336 L58 300 L46 254" fill="none" style="stroke:#3A3836" stroke-width="1.2"/>
      ${sk(`<rect x="12" y="324" width="24" height="5" style="fill:${C.wood}"/><path d="M14 329 v6 M34 329 v6" style="stroke:${C.wood2}" stroke-width="2"/><rect x="12" y="316" width="24" height="3" style="fill:${C.wood}"/>`, `<rect x="12" y="324" width="24" height="5"/>`)}</g>${lab(70, 428, "199 steps", "#E8E2D2", 10)}</g>`;
  // the cottages, stacked up the slope either side of the lane
  const houses = row(300, 40, 200, 110, 3) + row(90, 250, 110, 90, 7) + row(30, 430, 160, 100, 11) + row(330, 450, 176, 110, 5);
  // the quay café: a little whitewashed cottage, a blue door, an A-board out front
  const cafe = `<g data-place="swcafe" aria-label="The quay café"><ellipse class="hov" cx="120" cy="186" rx="38" ry="11" style="fill:var(--butter)"/>
    <g pointer-events="none">${sk(pantile(36, 34, 52, 18, {chimX: 14}).art, pantile(36, 34, 52, 18, {chimX: 14}).line)}${cottage(30, 60, 26, 110, {door: false, rh: 30, chimney: false})}${cottage(184, 64, 36, 106, {door: false, rh: 30, chimney: false})}${cottage(56, 54, 130, 116, {white: true, doorX: 64, doorCol: "#3E6BAE", rh: 34, chimX: 108})}
      ${sk(`<rect x="72" y="146" width="18" height="2" style="fill:#3E6BAE"/><rect x="150" y="146" width="18" height="2" style="fill:#3E6BAE"/>`, "")}${board(120, 92, 74, "QUAY CAFÉ", "#3E6BAE", "#F7F4EC", 9)}
      ${[[78, 130], [160, 130]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="6" ry="3" fill="#FFFFFF" opacity=".5"/>`).join("")}${chalk(162, 164, 66, ["CRAB SANDWICHES", "TEA · CAKE"], true)}</g>${lab(120, 210, "Quay café", "#C9DDE0", 10)}</g>`;
  // the smokehouse: a tarred black shed, louvres along the ridge, a tall chimney, kippers in the open door
  const smoke = `<g data-place="swsmokehouse" aria-label="The smokehouse"><ellipse class="hov" cx="410" cy="376" rx="40" ry="11" style="fill:var(--butter)"/>${shade(336, 290, 166, 70)}
    <g pointer-events="none">${sk(`<rect x="470" y="196" width="22" height="120" style="fill:#9A5A44"/><path d="${Array.from({length: 15}, (_, k) => `M470 ${204 + k*8} h22`).join(" ")}" style="stroke:#7A4434" stroke-width=".7"/><rect x="467" y="192" width="28" height="6" style="fill:#7A4434"/>
      <rect x="336" y="290" width="166" height="70" style="fill:${C.tar}"/><path d="${Array.from({length: 20}, (_, k) => `M${344 + k*8} 290 v70`).join(" ")}" style="stroke:${C.tar2}" stroke-width="1.2"/>
      <path d="M328 294 L352 254 H486 L510 294z" style="fill:${C.tar2}"/><rect x="380" y="242" width="70" height="14" style="fill:${C.tar}"/><path d="M376 242 h78 l-6 -6 h-66z" style="fill:${C.tar2}"/><path d="M386 246 h58 M386 250 h58" style="stroke:#6E6660" stroke-width="1"/>
      <rect x="392" y="312" width="36" height="48" style="fill:#5A3A26"/><rect x="384" y="312" width="8" height="48" style="fill:${C.tar2}"/>
      ${[0, 1, 2].map(r => [0, 1, 2, 3].map(c => `<path d="M${398 + c*8} ${318 + r*13} v3" style="stroke:#C9A27E" stroke-width=".6"/><path d="M${398 + c*8} ${321 + r*13} q3 4 0 9 q-3 -5 0 -9z" style="fill:#D99A3A"/>`).join("")).join("")}
      <path d="M396 318 h30 M396 331 h30 M396 344 h30" style="stroke:#8A6A52" stroke-width="1"/>${win(350, 306, 14, 14)}${win(460, 306, 14, 14)}`,
      `<rect x="336" y="290" width="166" height="70"/><path d="M328 294 L352 254 H486 L510 294z"/><rect x="470" y="196" width="22" height="98"/><rect x="392" y="312" width="36" height="48"/>`)}
      ${[0, 1, 2].map(i => `<path d="M${476 + i*5} 188 q-10 -14 2 -26 q10 -12 -2 -26" fill="none" style="stroke:#E8E6E2" stroke-width="${6 - i*1.4}" stroke-linecap="round" opacity=".55"><animateTransform attributeName="transform" type="translate" values="0 0;-6 -10;0 0" dur="${5 + i}s" repeatCount="indefinite"/><animate attributeName="opacity" values=".55;.15;.55" dur="${5 + i}s" repeatCount="indefinite"/></path>`).join("")}
      ${board(410, 266, 80, "SMOKEHOUSE", "#E6DFCC", C.ink, 8)}</g>${lab(410, 398, "Smokehouse", "#F3E1A0", 10)}</g>`;
  // the harbour cat asleep on a lobster pot in the lane
  const cat = `<g data-place="swcat" aria-label="The harbour cat"><ellipse class="hov" cx="250" cy="470" rx="24" ry="11" style="fill:var(--butter)"/>${pot(250, 474, 1.1, "#5E7E6A")}
    <g pointer-events="none">${sk(`<ellipse cx="250" cy="452" rx="13" ry="7" style="fill:#8E9296"/><circle cx="240" cy="451" r="5.5" style="fill:#8E9296"/><path d="M236 447 l1 -5 l3 4 M241 446 l2 -4 l2 5" style="fill:#8E9296"/><path d="M262 454 q8 2 4 -6" fill="none" style="stroke:#8E9296" stroke-width="3" stroke-linecap="round"/>
      <path d="M237 451 q1.5 1 3 0 M241 451 q1.5 1 3 0" fill="none" style="stroke:#2F2B28" stroke-width=".7"/><path d="M246 448 q3 -2 6 0 M252 449 q3 -2 6 0" fill="none" style="stroke:#6E7276" stroke-width="1"/>`, `<ellipse cx="250" cy="452" rx="13" ry="7"/><circle cx="240" cy="451" r="5.5"/>`)}
      <text x="262" y="440" font-family="Klee One,serif" font-size="8" fill="#6F7C9C">z<animate attributeName="opacity" values="0;1;0" dur="3s" repeatCount="indefinite"/></text></g>${lab(250, 496, "Harbour cat", "#E8E2D2", 10)}</g>`;
  const bits = pot(196, 380, .9) + pot(318, 200, .85, "#7E6A9A") + gull(262, 160, -1) + gull(450, 446, 1) + thrift([[400, 200], [430, 214], [470, 196], [60, 590], [100, 604], [420, 600]])
    + `<g pointer-events="none">${[[214, 224], [312, 400], [214, 560]].map(([x, y]) => lampGlow(x, y - 30, 24) + sk(`<rect x="${x - 4}" y="${y - 36}" width="8" height="10" rx="2" style="fill:#F6C26B"/>`, `<path d="M${x} ${y} v-26"/><rect x="${x - 4}" y="${y - 36}" width="8" height="10" rx="2"/><path d="M${x - 6} ${y - 36} l6 -4 l6 4z"/>`)).join("")}</g>`
    + gulls([[160, 380], [400, 420]]);
  return lampDefs + ground + lanes + houses + steps + cafe + smoke + cat + bits + frost([[420, 210, 70, 30], [120, 590, 90, 26]]) + seasonFx()
    + gate("swToHarbour", 300, 612, "Harbour", 362, 600, "South down the wynds to the harbour", "#C9DDE0")
    + gate("swToClifftop", 16, 240, "Clifftop", 62, 210, "West up onto the clifftop", "#DCEBC8");
}

/* ---------- sw_beach: the cliff, the beach huts, the scar, the rock pools, the seals ---------- */
function beachScreen(){
  const ground = `<rect width="520" height="640" style="fill:${C.sand}"/><g filter="url(#wash)" opacity=".6"><ellipse cx="300" cy="300" rx="180" ry="90" style="fill:#EBDDBA"/><ellipse cx="420" cy="540" rx="120" ry="30" style="fill:${C.sand2}"/><ellipse cx="500" cy="40" rx="60" ry="50" style="fill:${C.grass}"/></g>`;
  // the cliff on the north-west: layers of rock, grass on top, a skirt of fallen stones
  const bands = ["#9A8A76", "#B3A38C", "#857766", "#A89A86", "#7E7264", "#B9AC96"];
  const cliffD = "M0 0 H206 Q198 50 206 90 Q190 130 200 168 Q120 176 0 172z";
  const cliff = `<g pointer-events="none">${sk(`<path d="${cliffD}" style="fill:${bands[0]}"/>${bands.slice(1).map((c, i) => `<path d="M0 ${30 + i*28} Q60 ${22 + i*28} 120 ${34 + i*28} T${200 - (i % 2)*6} ${28 + i*28} V${50 + i*28} Q140 ${58 + i*28} 70 ${46 + i*28} T0 ${52 + i*28}z" style="fill:${c}"/>`).join("")}
      <path d="M0 0 H206 Q204 10 206 18 Q140 26 70 18 Q30 14 0 20z" style="fill:${C.grass2}"/><path d="M0 160 Q100 168 200 160 L200 168 Q120 176 0 172z" style="fill:#6E6458" opacity=".5"/>`, `<path d="M206 0 Q198 50 206 90 Q190 130 200 168 Q120 176 0 172"/>`)}
    <path d="${[[30, 60], [90, 86], [150, 112], [60, 140], [170, 54], [120, 150]].map(([x, y]) => `M${x} ${y} l6 10 l-3 8`).join(" ")}" fill="none" style="stroke:#5E5448" stroke-width=".9" opacity=".6"/></g>`
    + rocks([[30, 182, 9], [70, 180, 6], [120, 184, 8], [176, 178, 7]], C.rock2);
  const path = foot("M262 14 Q244 60 252 110 Q262 170 260 220 Q256 280 290 330 M504 330 Q400 330 300 330 Q240 360 200 440", 22, "#EEE3C6", "#D3C49E");
  // the beach huts: a row of little wooden huts painted every colour, deckchairs out front
  const hutCols = ["#C9483A", "#E3B53C", "#3E6BAE", "#7FB89A", "#E88AA8", C.white];
  const huts = `<g data-place="swhuts" aria-label="The beach huts"><ellipse class="hov" cx="370" cy="156" rx="42" ry="11" style="fill:var(--butter)"/><g pointer-events="none">${hutCols.map((c, i) => { const x = 262 + i*36, y = 84;
      return shade(x, y, 32, 56, 6) + sk(`<rect x="${x}" y="${y}" width="32" height="56" style="fill:${c}"/><path d="${[8, 16, 24].map(d => `M${x + d} ${y} v56`).join(" ")}" style="stroke:#000" stroke-width=".5" opacity=".15"/><path d="M${x - 3} ${y + 2} L${x + 16} ${y - 18} L${x + 35} ${y + 2}z" style="fill:${i % 2 ? C.white : "#5E636B"}"/>
        <rect x="${x + 8}" y="${y + 22}" width="16" height="34" style="fill:${i === 5 ? "#3E6BAE" : C.white}" opacity="${i === 5 ? 1 : .85}"/><rect x="${x + 10}" y="${y + 24}" width="12" height="30" style="fill:${c}" opacity=".7"/>`,
        `<rect x="${x}" y="${y}" width="32" height="56"/><path d="M${x - 3} ${y + 2} L${x + 16} ${y - 18} L${x + 35} ${y + 2}z"/>`); }).join("")}
    ${[[284, 160, "#3E6BAE"], [446, 160, "#C9483A"]].map(([x, y, c]) => sk(`<path d="M${x - 8} ${y} l4 -14 h10 l4 14" fill="none" style="stroke:${C.wood}" stroke-width="1.6"/><path d="M${x - 4} ${y - 14} h10 l2 10 h-10z" style="fill:${c}"/><path d="M${x - 2} ${y - 14} l2 10 M${x + 2} ${y - 14} l2 10" style="stroke:${C.white}" stroke-width="1.4"/>`, `<path d="M${x - 4} ${y - 14} h10 l2 10 h-10z"/>`)).join("")}</g>${lab(370, 178, "Beach huts", "#F6D3DC", 10)}</g>`;
  // the scar: flat grey ledges of rock at low tide, cracked into blocks, an ammonite here and there
  const scar = `<g data-place="swscar" aria-label="The scar"><ellipse class="hov" cx="200" cy="470" rx="34" ry="12" style="fill:var(--butter)"/><g pointer-events="none"><g filter="url(#wash)" opacity=".7"><path d="M40 430 Q110 412 180 420 Q260 414 330 436 Q350 470 330 500 Q350 530 320 556 H30 Q14 520 30 490 Q20 456 40 430z" fill="#B9B4A8"/></g>
      ${sk([[44, 432, 96, 22], [150, 424, 92, 20], [252, 436, 76, 22], [36, 472, 70, 26], [228, 486, 96, 24], [54, 512, 110, 30], [182, 522, 128, 28]].map(([x, y, w, h], i) => `<path d="M${x} ${y + 3} Q${x + w/2} ${y - 2} ${x + w} ${y + 2} L${x + w + 4} ${y + h} Q${x + w/2} ${y + h + 3} ${x + 2} ${y + h}z" style="fill:${["#A9A59D", "#B4B0A8", "#9F9B93"][i % 3]}"/>`).join(""), "")}
      <path d="M44 432 Q92 430 140 434 M150 424 Q196 422 242 426 M252 436 Q290 434 328 438 M36 472 Q70 470 106 474 M228 486 Q276 484 324 488 M54 512 Q108 510 164 514 M182 522 Q246 520 310 524" fill="none" style="stroke:#6E6B66" stroke-width="1" opacity=".7"/>
      <path d="M80 446 l12 8 l-4 10 M190 430 l6 12 M290 446 l-8 10 M140 524 l8 10 M260 496 l-10 10 M70 484 h20" fill="none" style="stroke:#6E6B66" stroke-width=".9" opacity=".7"/>
      ${[[120, 448], [276, 504], [230, 538]].map(([x, y]) => `<path d="M${x} ${y} m-5 0 a5 5 0 1 1 5 5 a3.5 3.5 0 1 1 -3.5 -3.5 a2 2 0 1 1 2 2" fill="none" style="stroke:#5E5B56" stroke-width="1"/>`).join("")}
      ${[[120, 500, 16, 5], [170, 466, 12, 4], [320, 516, 10, 4]].map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" style="fill:${C.sea2}" opacity=".9"/>`).join("")}
      <path d="M100 552 q4 -6 8 0 q4 -6 8 0 M280 548 q4 -6 8 0" fill="none" style="stroke:#6E7A4E" stroke-width="1.6"/></g>${lab(200, 404, "The scar", "#E8E2D2", 10)}</g>`;
  // the rock pools: a ring of dark rocks round still water
  const pools = `<g data-place="swpools" aria-label="The rock pools"><ellipse class="hov" cx="420" cy="452" rx="30" ry="10" style="fill:var(--butter)"/><g pointer-events="none">${sk(`<path d="M374 476 Q400 462 440 466 Q478 470 478 494 Q480 522 444 526 Q400 530 380 516 Q366 498 374 476z" style="fill:${C.rock3}"/><ellipse cx="406" cy="492" rx="20" ry="11" style="fill:${C.sea2}"/><ellipse cx="450" cy="498" rx="14" ry="9" style="fill:${C.sea2}"/>`,
      `<path d="M374 476 Q400 462 440 466 Q478 470 478 494 Q480 522 444 526 Q400 530 380 516 Q366 498 374 476z"/><ellipse cx="406" cy="492" rx="20" ry="11"/><ellipse cx="450" cy="498" rx="14" ry="9"/>`)}
      <circle cx="398" cy="488" r="3" fill="#C8433F"/><circle cx="414" cy="496" r="2.4" fill="#C8433F"/><circle cx="452" cy="494" r="2.6" fill="#E88A6A"/><path d="M446 502 l-3 -2 m3 2 l3 -2 M440 504 h12" style="stroke:#C8643B" stroke-width="1.2"/></g>${lab(424, 548, "Rock pools", "#C9DDE0", 10)}</g>`;
  // the sea along the bottom, the seals out on the rocks
  const sea = `<g pointer-events="none">${sk(`<path d="M0 560 Q130 552 260 562 Q390 572 520 558 V640 H0z" style="fill:${C.sea}"/>`, `<path d="M0 560 Q130 552 260 562 Q390 572 520 558"/>`)}<path d="M0 562 Q130 554 260 564 Q390 574 520 560" fill="none" style="stroke:${C.foam}" stroke-width="3" opacity=".8"/>${waves([[260, 600], [360, 620], [460, 596], [300, 632], [20, 630]])}</g>`;
  const seal = (x, y, dir, i) => `<g transform="translate(${x} ${y}) scale(${dir} 1)">${sk(`<path d="M-16 0 Q-14 -10 0 -10 Q10 -10 14 -18 Q20 -20 20 -14 Q18 -6 14 0z" style="fill:${i % 2 ? "#8C8A86" : "#6F6E6A"}"/><circle cx="17" cy="-15" r=".9" style="fill:#2F2B28"/><path d="M-16 0 l-5 -4 M-16 0 l-5 3" style="stroke:#5E5C58" stroke-width="2"/>`, `<path d="M-16 0 Q-14 -10 0 -10 Q10 -10 14 -18 Q20 -20 20 -14 Q18 -6 14 0z"/>`)}</g>`;
  const seals = `<g data-place="swseals" aria-label="The seals"><ellipse class="hov" cx="120" cy="540" rx="30" ry="10" style="fill:var(--butter)"/><g pointer-events="none">${rocks([[70, 606, 26], [170, 618, 22], [130, 596, 12]], C.rock3)}${seal(66, 596, 1, 0)}${seal(170, 608, -1, 1)}${seal(124, 588, 1, 2)}</g>${lab(214, 584, "Seals", "#E8E2D2", 10)}</g>`;
  const bits = gull(320, 380, 1) + gull(470, 420, -1) + gulls([[300, 40], [420, 230], [240, 600]]) + `<g pointer-events="none">${[[340, 380], [460, 280], [230, 250]].map(([x, y]) => `<path d="M${x} ${y} m-4 0 a4 4 0 1 1 4 4" fill="none" style="stroke:#B9A88A" stroke-width="1"/>`).join("")}${[[480, 70], [500, 100], [460, 40]].map(([x, y]) => `<path d="M${x} ${y} q-2 -10 -6 -14 M${x} ${y} q1 -12 4 -16 M${x} ${y} q4 -8 10 -10" fill="none" style="stroke:#8A9A62" stroke-width="1.2"/>`).join("")}</g>`;
  return lampDefs + ground + sea + path + cliff + huts + scar + pools + seals + bits + frost([[300, 300, 160, 60]]) + seasonFx()
    + gate("swToCliffN", 262, 26, "Clifftop", 320, 30, "North up the cliff path to the clifftop", "#DCEBC8")
    + gate("swToHarbourE", 504, 330, "Harbour", 460, 296, "East along the sands to the harbour", "#C9DDE0");
}

/* ---------- sw_clifftop: the sea far below, the abbey ruin, the coastguard cottages, the sheep, the bench ---------- */
function clifftopScreen(){
  const ground = `<rect width="520" height="640" style="fill:${C.grass}"/><g filter="url(#wash)" opacity=".6"><ellipse cx="260" cy="320" rx="150" ry="110" style="fill:${C.grass3}"/><ellipse cx="420" cy="590" rx="110" ry="50" style="fill:${C.grass2}"/><ellipse cx="200" cy="560" rx="90" ry="50" style="fill:${C.grass2}"/></g>`;
  // the sea, far below the cliff edge down the whole west side
  const sea = `<g pointer-events="none">${sk(`<path d="M0 0 H86 Q80 80 90 160 Q82 260 92 360 Q84 480 90 640 H0z" style="fill:${C.sea3}"/><path d="M0 0 H70 Q64 80 72 160 Q66 260 74 360 Q68 480 72 640 H0z" style="fill:${C.sea}"/>`, `<path d="M86 0 Q80 80 90 160 Q82 260 92 360 Q84 480 90 640"/>`)}
    <path d="M72 0 Q66 80 74 160 Q68 260 76 360 Q70 480 74 640" fill="none" style="stroke:${C.foam}" stroke-width="3" opacity=".55"/>${waves([[14, 80], [30, 220], [10, 360], [26, 480], [12, 600]])}
    ${sk(`<path d="M80 0 Q74 80 84 160 Q76 260 86 360 Q78 480 84 640 H100 Q94 480 102 360 Q94 260 104 160 Q96 80 102 0z" style="fill:#9A8E7C"/>`, `<path d="M102 0 Q96 80 104 160 Q94 260 102 360 Q94 480 100 640"/>`)}
    <path d="M86 40 l10 4 M84 120 l12 6 M88 220 l10 2 M86 320 l12 4 M84 430 l12 2 M86 540 l10 6" style="stroke:#6E6458" stroke-width="1"/></g>${gulls([[30, 140], [44, 420]])}`;
  const path = foot("M262 626 Q262 560 250 500 Q236 420 252 330 Q262 270 250 214 M252 330 Q340 300 420 250 Q470 240 512 240 M440 192 Q450 220 470 238 M252 420 Q200 444 156 470 M390 374 Q340 360 300 340 M140 470 Q120 400 120 300 Q118 220 124 150 Q126 100 112 40");
  // the abbey ruin: a tall gable end with empty lancets, a broken arcade of pointed arches, open to the sky
  const st = "#A7A39A", st2 = "#8C887F", sky = "#D4E0DC";
  const lancet = (x, y, w, h) => `M${x} ${y + h} V${y + w*.7} Q${x} ${y} ${x + w/2} ${y - w*.3} Q${x + w} ${y} ${x + w} ${y + w*.7} V${y + h}z`;
  const abbey = `<g data-place="swabbey" aria-label="The abbey ruin"><ellipse class="hov" cx="250" cy="206" rx="46" ry="12" style="fill:var(--butter)"/>${shade(150, 110, 200, 76)}
    <g pointer-events="none">${sk(`<path d="M150 186 V40 L166 22 L176 40 H214 L224 22 L234 40 V186z" style="fill:${st}"/><path d="M146 186 h92 v-8 h-92z" style="fill:${st2}"/>
      <path d="${lancet(158, 66, 16, 92)}" style="fill:${sky}"/><path d="${lancet(184, 50, 16, 108)}" style="fill:${sky}"/><path d="${lancet(210, 66, 16, 92)}" style="fill:${sky}"/><circle cx="192" cy="40" r="6" style="fill:${sky}"/>
      <path d="M234 186 V98 L244 92 L252 100 L262 94 L270 102 H290 L298 90 L306 98 L318 96 L326 104 L338 100 L350 112 V186z" style="fill:${st}"/>
      ${[240, 268, 296, 324].map(x => `<path d="${lancet(x, 124, 20, 62)}" style="fill:${C.grass3}"/>`).join("")}${[244, 272, 300, 328].map(x => `<path d="${lancet(x, 106, 12, 12)}" style="fill:${sky}"/>`).join("")}
      <path d="M150 70 H234 M150 160 H234 M234 120 H350" style="stroke:${st2}" stroke-width="1.4" opacity=".7"/>`,
      `<path d="M150 186 V40 L166 22 L176 40 H214 L224 22 L234 40 V186"/><path d="M234 98 L244 92 L252 100 L262 94 L270 102 H290 L298 90 L306 98 L318 96 L326 104 L338 100 L350 112 V186"/><path d="${lancet(184, 50, 16, 108)}"/>`)}
      ${rocks([[362, 182, 7], [138, 186, 6], [300, 196, 5]], st)}</g>${lab(250, 228, "Abbey ruin", "#E8E2D2", 10)}</g>`;
  // the coastguard cottages: a white terrace with slate roofs, a lookout bay and a flagpole
  const cg = (() => { const rf = slateRoof(380, 74, 126, 30);
    return `<g data-place="swcoastguard" aria-label="The coastguard cottages"><ellipse class="hov" cx="440" cy="186" rx="40" ry="11" style="fill:var(--butter)"/>${shade(380, 104, 126, 66)}
    <g pointer-events="none">${sk(`<path d="M392 104 V20" style="stroke:${C.white}" stroke-width="2.4"/><path d="M393 22 h22 l-4 6 l4 6 h-22z" style="fill:#2F4E6E"/><path d="M393 28 h18" style="stroke:#C9483A" stroke-width="2"/>
      <rect x="380" y="104" width="126" height="66" style="fill:${C.white}"/><path d="M422 104 v66 M464 104 v66" style="stroke:#D6D1C6" stroke-width="1.2"/>${rf.art}
      ${[[392, 114], [434, 114], [476, 114]].map(([x, y]) => win(x, y, 14, 14)).join("")}${door(401, 170, "#2F4E6E")}${door(440, 170, "#C9483A")}${door(486, 170, "#4E7A5A")}
      <rect x="412" y="56" width="26" height="22" style="fill:${C.white}"/><rect x="415" y="60" width="20" height="12" style="fill:${C.glass}"/><path d="M410 56 h30 l-4 -6 h-22z" style="fill:${C.slate}"/>`,
      `<rect x="380" y="104" width="126" height="66"/>${rf.line}<rect x="412" y="56" width="26" height="22"/><path d="M392 104 V20"/>`)}</g>${lab(440, 210, "Coastguard cottages", "#C9DDE0", 10)}</g>`; })();
  // the sheep field: a dry-stone wall round it, a gap at the top, sheep grazing
  const stones = (d, w = 8) => `<g pointer-events="none" filter="url(#wob)"><path d="${d}" fill="none" style="stroke:var(--line)" stroke-width="${w + 2}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" style="stroke:#9E978A" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" style="stroke:#C2BCAF" stroke-width="${w - 3}" stroke-dasharray="5 3" stroke-linecap="round"/></g>`;
  const sheep = (x, y, dir = 1, i = 0) => `<g transform="translate(${x} ${y}) scale(${dir} 1)">${sk(`<path d="M-7 -2 v6 M-2 -2 v6 M4 -2 v6 M8 -2 v6" style="stroke:#2F2B28" stroke-width="1.8"/>${[[-7, -8], [0, -10], [7, -8], [-3, -5], [4, -5]].map(([dx, dy]) => `<circle cx="${dx}" cy="${dy}" r="5.4" style="fill:#F2EFE6"/>`).join("")}<ellipse cx="13" cy="${i % 2 ? -4 : -9}" rx="4" ry="5" style="fill:#2F2B28"/>`, `<ellipse cx="0" cy="-7" rx="13" ry="7"/>`)}</g>`;
  const field = `<g data-place="swsheep" aria-label="The sheep"><ellipse class="hov" cx="390" cy="372" rx="34" ry="11" style="fill:var(--butter)"/><g pointer-events="none"><rect x="306" y="396" width="168" height="118" style="fill:${C.grass3}" opacity=".7"/>
    ${stones("M374 392 H302 V518 H478 V392 H406")}${sk(`<rect x="378" y="388" width="24" height="8" style="fill:${C.wood}" opacity=".0"/>`, `<path d="M376 386 v12 M404 386 v12 M376 390 h28 M376 395 h28"/>`)}
    ${sheep(340, 440, 1, 0)}${sheep(420, 432, -1, 1)}${sheep(380, 480, 1, 1)}${sheep(446, 496, -1, 0)}</g>${lab(390, 540, "Sheep", "#F6EFE3", 10)}</g>`;
  // the bench, facing the sea (side on: the back to the east)
  const bench = `<g data-place="swbench" aria-label="The clifftop bench"><ellipse class="hov" cx="150" cy="470" rx="26" ry="10" style="fill:var(--butter)"/><g pointer-events="none"><ellipse cx="140" cy="464" rx="24" ry="4" fill="#5E6C78" opacity=".18"/>${sk(`<rect x="118" y="450" width="36" height="5" style="fill:${C.wood}"/><path d="M120 455 v9 M152 455 v9" style="stroke:${C.wood2}" stroke-width="2.4"/><path d="M150 450 l6 -18" style="stroke:${C.wood}" stroke-width="4"/><path d="M155 434 l-2 8" style="stroke:${C.wood2}" stroke-width="1"/><rect x="132" y="456" width="6" height="3" style="fill:#D9A84A"/>`, `<rect x="118" y="450" width="36" height="5"/><path d="M150 450 l6 -18"/>`)}</g>${lab(150, 492, "Bench", "#F6E3B4", 10)}</g>`;
  const flora = heather([[290, 276, 1.4], [184, 306, 1.2], [330, 566, 1.5], [466, 310, 1.2], [196, 600, 1.2], [470, 584, 1.4], [170, 390, 1.1], [130, 560, 1.1]])
    + thrift([[112, 60], [118, 120], [114, 200], [120, 260], [116, 340], [122, 400], [114, 520], [118, 580], [112, 620]]);
  return lampDefs + ground + sea + path + flora + abbey + cg + field + bench + gulls([[280, 30], [470, 250]]) + frost([[260, 320, 140, 100], [420, 590, 90, 40]]) + seasonFx()
    + gate("swToWyndsE", 504, 240, "The wynds", 456, 276, "East down into the wynds", "#E8E2D2")
    + gate("swToBeachS", 262, 612, "The beach", 334, 600, "South down the cliff path to the beach", "#F3E1A0");
}

export function saltwickArt(scene){
  return scene === "sw_wynds" ? wyndsScreen() : scene === "sw_beach" ? beachScreen() : scene === "sw_clifftop" ? clifftopScreen() : harbourScreen();
}
// The ferry crossing to Saltwick (both ways): the boat rides a grey-green swell; going out, red-roofed cliffs and a
// stubby white lighthouse on the horizon; coming home, Honeybrook's green hills; a gull or two keeping pace
export function swFerryRideArt(home){
  const bank = `<svg class="taxibank" viewBox="0 0 600 90" preserveAspectRatio="none" aria-hidden="true"><g style="stroke:#3b3530" stroke-width="1.1">
    ${home ? `<path d="M0 56 Q75 34 150 50 T300 50 V60 H0z" fill="#9CC27E"/><path d="M180 56 Q240 40 300 50 T420 52 V60 H180z" fill="#B2CF92"/>`
      : `<path d="M360 56 V40 Q380 30 420 34 Q470 26 520 38 Q560 34 600 40 V56z" fill="#9A8A76"/><path d="M360 40 Q380 30 420 34 Q470 26 520 38 Q560 34 600 40" fill="none" stroke="#7E8A5A" stroke-width="3"/>
        ${[[420, 38], [436, 36], [452, 40], [468, 36], [484, 40]].map(([x, y]) => `<path d="M${x} ${y} l7 -6 l7 6z" fill="${C.tile}"/><rect x="${x + 2}" y="${y}" width="10" height="7" fill="#C3B8A2"/>`).join("")}
        <path d="M384 56 L386 34 H396 L398 56z" fill="${C.white}"/><rect x="384" y="28" width="14" height="6" fill="#BFE6C4"/><path d="M383 28 Q391 21 399 28z" fill="#3E6A56"/>`}
    <path d="M0 56 H600 V90 H0z" fill="${C.sea}"/>${[40, 140, 260, 380, 500].map(x => `<path d="M${x} 72 q6 -5 12 0 q6 5 12 0" fill="none" stroke="${C.foam}" stroke-width="1.4"/>`).join("")}
    <g fill="none" stroke-width="1.4">${[[160, 24], [196, 16]].map(([x, y], i) => `<path d="M${x - 8} ${y} q4 -6 8 0 q4 -6 8 0"><animateTransform attributeName="transform" type="translate" values="0 0;${10 + i*6} ${-3 + i*4};0 0" dur="${3 + i}s" repeatCount="indefinite"/></path>`).join("")}</g></g></svg>`;
  const boat = `<div class="taxiboat"><svg viewBox="0 0 160 60" width="220" height="82" aria-hidden="true"><g filter="url(#wob)" style="stroke:#3b3530" stroke-width="1.4" stroke-linejoin="round">
    <path d="M6 30 H154 L140 54 H18z" fill="${C.white}"/><rect x="10" y="40" width="138" height="6" fill="#3E6A56"/><rect x="40" y="12" width="70" height="20" rx="3" fill="#EEF1EA"/>${[48, 66, 84].map(x => `<rect x="${x}" y="16" width="14" height="10" rx="2" fill="#9DB8C4"/>`).join("")}
    <rect x="96" y="2" width="10" height="12" fill="#C9483A"/><rect x="96" y="2" width="10" height="3" fill="#2F2B28"/><circle cx="58" cy="21" r="4" fill="#F2D3BC"/><circle cx="74" cy="21" r="4" fill="#C99A78"/></g></svg></div>`;
  return bank + boat;
}
